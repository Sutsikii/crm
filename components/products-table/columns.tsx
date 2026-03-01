"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type Product = {
  id: string
  name: string
  description: string | null
  price: string
  billingType: string
  recurringInterval: string | null
  depositEnabled: boolean
  depositType: string | null
  depositValue: string | null
  createdAt: string
}

const INTERVAL_LABELS: Record<string, string> = {
  MONTHLY: "Mensuel",
  QUARTERLY: "Trimestriel",
  SEMIANNUAL: "Semestriel",
  ANNUAL: "Annuel",
}

function formatPrice(value: string) {
  return parseFloat(value).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}

function DetailCell({ product }: { product: Product }) {
  if (product.billingType === "RECURRING" && product.recurringInterval) {
    return <span className="text-muted-foreground text-sm">{INTERVAL_LABELS[product.recurringInterval] ?? product.recurringInterval}</span>
  }
  if (product.billingType === "ONE_TIME" && product.depositEnabled && product.depositValue) {
    const val = parseFloat(product.depositValue)
    const label =
      product.depositType === "PERCENTAGE"
        ? `Acompte ${val}%`
        : `Acompte ${formatPrice(product.depositValue)}`
    return <span className="text-muted-foreground text-sm">{label}</span>
  }
  return <span className="text-muted-foreground text-sm">—</span>
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-sm">{row.original.name}</p>
        {row.original.description && (
          <p className="text-xs text-muted-foreground truncate max-w-56">{row.original.description}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Prix",
    cell: ({ row }) => (
      <span className="font-medium">{formatPrice(row.original.price)}</span>
    ),
  },
  {
    accessorKey: "billingType",
    header: "Facturation",
    cell: ({ row }) =>
      row.original.billingType === "RECURRING" ? (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-600">Récurrent</Badge>
      ) : (
        <Badge variant="secondary">Unique</Badge>
      ),
  },
  {
    id: "detail",
    header: "Récurrence / Acompte",
    cell: ({ row }) => <DetailCell product={row.original} />,
  },
]
