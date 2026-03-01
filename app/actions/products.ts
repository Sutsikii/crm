"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import type { BillingType, RecurringInterval, DepositType } from "@/app/generated/prisma/enums"

function parseProductFields(formData: FormData) {
  const name = (formData.get("name") as string)?.trim()
  if (!name) throw new Error("Le nom est requis")

  const description = (formData.get("description") as string)?.trim() || null
  const priceRaw = parseFloat(formData.get("price") as string)
  if (isNaN(priceRaw)) throw new Error("Le prix est requis")

  const billingType = (formData.get("billingType") as BillingType) || "ONE_TIME"

  const recurringInterval: RecurringInterval | null =
    billingType === "RECURRING"
      ? ((formData.get("recurringInterval") as RecurringInterval) || "MONTHLY")
      : null

  const depositEnabled = formData.get("depositEnabled") === "on"

  const depositType: DepositType | null =
    depositEnabled && billingType === "ONE_TIME"
      ? ((formData.get("depositType") as DepositType) || "FIXED")
      : null

  const depositValueRaw = depositEnabled ? parseFloat(formData.get("depositValue") as string) : NaN
  const depositValue = depositEnabled && !isNaN(depositValueRaw) ? depositValueRaw : null

  return {
    name,
    description,
    price: priceRaw,
    billingType,
    recurringInterval,
    depositEnabled,
    depositType,
    depositValue,
  }
}

export async function getAllProducts() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return []

  return prisma.product.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function createProduct(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Non autorisé")

  const fields = parseProductFields(formData)

  await prisma.product.create({
    data: { ...fields, userId: session.user.id },
  })

  revalidatePath("/catalog")
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Non autorisé")

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || product.userId !== session.user.id) throw new Error("Produit introuvable")

  const fields = parseProductFields(formData)

  await prisma.product.update({ where: { id }, data: fields })

  revalidatePath("/catalog")
}

export async function deleteProduct(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Non autorisé")

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || product.userId !== session.user.id) throw new Error("Produit introuvable")

  await prisma.product.delete({ where: { id } })

  revalidatePath("/catalog")
}
