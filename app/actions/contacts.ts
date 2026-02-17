"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

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

  await prisma.contact.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      company,
      userId: session.user.id,
    },
  })

  revalidatePath("/")
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
