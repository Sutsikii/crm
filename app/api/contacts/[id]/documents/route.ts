import { randomUUID } from "crypto"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { uploadFile, buildKey } from "@/lib/storage"

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id: contactId } = await params

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, userId: session.user.id },
  })
  if (!contact) {
    return NextResponse.json({ error: "Contact introuvable" }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Type de fichier non autorisé (PDF, JPEG, PNG, GIF, WEBP)" },
      { status: 400 }
    )
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Le fichier dépasse la taille maximale de 10 Mo" },
      { status: 400 }
    )
  }

  const ext = file.name.split(".").pop() ?? "bin"
  const key = buildKey("contacts", contactId, `${randomUUID()}.${ext}`)
  const buffer = Buffer.from(await file.arrayBuffer())

  await uploadFile({ key, body: buffer, contentType: file.type })

  const doc = await prisma.contactDocument.create({
    data: {
      name: file.name,
      key,
      size: file.size,
      contentType: file.type,
      contactId,
      userId: session.user.id,
    },
  })

  return NextResponse.json({
    id: doc.id,
    name: doc.name,
    size: doc.size,
    contentType: doc.contentType,
    createdAt: doc.createdAt.toISOString(),
  })
}
