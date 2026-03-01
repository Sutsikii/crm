"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getPresignedUrl, deleteFile } from "@/lib/storage"

export type DocumentItem = {
  id: string
  name: string
  size: number
  contentType: string
  createdAt: string
}

export async function getContactDocuments(contactId: string): Promise<DocumentItem[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return []

  const docs = await prisma.contactDocument.findMany({
    where: { contactId, userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return docs.map((d) => ({
    id: d.id,
    name: d.name,
    size: d.size,
    contentType: d.contentType,
    createdAt: d.createdAt.toISOString(),
  }))
}

export async function getDocumentForViewer(documentId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const doc = await prisma.contactDocument.findFirst({
    where: { id: documentId, userId: session.user.id },
    include: {
      contact: {
        select: { id: true, firstName: true, lastName: true, company: true },
      },
    },
  })
  if (!doc) return null

  return {
    id: doc.id,
    name: doc.name,
    contentType: doc.contentType,
    url: await getPresignedUrl(doc.key),
    contact: doc.contact,
  }
}

export async function deleteContactDocument(documentId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Non autorisé")

  const doc = await prisma.contactDocument.findFirst({
    where: { id: documentId, userId: session.user.id },
  })
  if (!doc) throw new Error("Document introuvable")

  await deleteFile(doc.key)
  await prisma.contactDocument.delete({ where: { id: documentId } })

  revalidatePath(`/contacts/${doc.contactId}`)
}
