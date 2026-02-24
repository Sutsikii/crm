"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import type { ContactStatus } from "@/app/generated/prisma/enums"

function parseContactFields(formData: FormData) {
  const firstName = (formData.get("firstName") as string) || null
  const lastName = (formData.get("lastName") as string) || null
  const email = (formData.get("email") as string) || null
  const phone = (formData.get("phone") as string) || null
  const company = (formData.get("company") as string) || null
  const address = (formData.get("address") as string) || null

  if (!email) {
    throw new Error("L'e-mail est requis")
  }

  if ((!firstName || !lastName) && !company) {
    throw new Error("Veuillez renseigner un nom/prénom ou une entreprise")
  }

  return { firstName, lastName, email, phone, company, address }
}

export async function createContact(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Non autorisé")
  }

  const fields = parseContactFields(formData)

  await prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: {
        ...fields,
        userId: session.user.id,
      },
    })

    await tx.contactEvent.create({
      data: {
        type: "CREATED",
        contactId: contact.id,
        userId: session.user.id,
      },
    })
  })

  revalidatePath("/")
  revalidatePath("/contacts")
}

export async function getRecentContacts() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return []
  }

  return prisma.contact.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  })
}

export async function getContactById(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const contact = await prisma.contact.findFirst({
    where: { id, userId: session.user.id },
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { user: { select: { name: true } } },
      },
    },
  })

  if (!contact) return null

  return {
    ...contact,
    events: contact.events.slice(0, 5).map((e) => ({
      id: e.id,
      type: e.type,
      content: e.content ?? null,
      fromStatus: e.fromStatus ?? null,
      toStatus: e.toStatus ?? null,
      createdAt: e.createdAt.toISOString(),
      userName: e.user.name,
    })),
    hasMoreEvents: contact.events.length === 6,
  }
}

export async function loadMoreContactEvents(contactId: string, skip: number) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Non autorisé")

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, userId: session.user.id },
  })
  if (!contact) throw new Error("Contact introuvable")

  const events = await prisma.contactEvent.findMany({
    where: { contactId },
    orderBy: { createdAt: "desc" },
    skip,
    take: 6,
    include: { user: { select: { name: true } } },
  })

  return {
    events: events.slice(0, 5).map((e) => ({
      id: e.id,
      type: e.type as "NOTE" | "STATUS_CHANGE" | "CREATED",
      content: e.content ?? null,
      fromStatus: e.fromStatus ?? null,
      toStatus: e.toStatus ?? null,
      createdAt: e.createdAt.toISOString(),
      userName: e.user.name,
    })),
    hasMore: events.length === 6,
  }
}

export async function getAllContacts() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return []
  }

  return prisma.contact.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function updateContact(id: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Non autorisé")
  }

  const contact = await prisma.contact.findUnique({ where: { id } })
  if (!contact || contact.userId !== session.user.id) {
    throw new Error("Contact introuvable")
  }

  const fields = parseContactFields(formData)
  const status = formData.get("status") as ContactStatus

  await prisma.$transaction(async (tx) => {
    await tx.contact.update({
      where: { id },
      data: { ...fields, status },
    })

    if (status !== contact.status) {
      await tx.contactEvent.create({
        data: {
          type: "STATUS_CHANGE",
          fromStatus: contact.status,
          toStatus: status,
          contactId: id,
          userId: session.user.id,
        },
      })
    }
  })

  revalidatePath("/")
  revalidatePath("/contacts")
  revalidatePath(`/contacts/${id}`)
}

export async function addContactNote(contactId: string, content: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Non autorisé")

  const contact = await prisma.contact.findUnique({ where: { id: contactId } })
  if (!contact || contact.userId !== session.user.id) {
    throw new Error("Contact introuvable")
  }

  await prisma.contactEvent.create({
    data: {
      type: "NOTE",
      content,
      contactId,
      userId: session.user.id,
    },
  })

  revalidatePath(`/contacts/${contactId}`)
}

export async function deleteContact(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Non autorisé")
  }

  const contact = await prisma.contact.findUnique({ where: { id } })
  if (!contact || contact.userId !== session.user.id) {
    throw new Error("Contact introuvable")
  }

  await prisma.contact.delete({ where: { id } })

  revalidatePath("/")
  revalidatePath("/contacts")
  revalidatePath(`/contacts/${id}`)
}
