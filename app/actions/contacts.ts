"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import type { ContactStatus } from "@/app/generated/prisma/enums"

export async function createContact(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Non autorisé")
  }

  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = (formData.get("email") as string) || null
  const phone = (formData.get("phone") as string) || null
  const company = (formData.get("company") as string) || null

  if (!firstName || !lastName) {
    throw new Error("Le prénom et le nom sont requis")
  }

  await prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
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
      },
    },
  })

  if (!contact) return null

  return {
    ...contact,
    events: contact.events.slice(0, 5),
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
  })

  return {
    events: events.slice(0, 5).map((e) => ({
      id: e.id,
      type: e.type as "NOTE" | "STATUS_CHANGE" | "CREATED",
      content: e.content ?? null,
      fromStatus: e.fromStatus ?? null,
      toStatus: e.toStatus ?? null,
      createdAt: e.createdAt.toISOString(),
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

  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = (formData.get("email") as string) || null
  const phone = (formData.get("phone") as string) || null
  const company = (formData.get("company") as string) || null
  const status = formData.get("status") as ContactStatus

  if (!firstName || !lastName) {
    throw new Error("Le prénom et le nom sont requis")
  }

  await prisma.$transaction(async (tx) => {
    await tx.contact.update({
      where: { id },
      data: { firstName, lastName, email, phone, company, status },
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
