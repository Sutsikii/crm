"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ContactStatusBadge } from "@/components/contact-status-badge"

export type Contact = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  company: string | null
  status: string
  createdAt: string
}

export const columns: ColumnDef<Contact>[] = [
  {
    id: "name",
    accessorFn: (row) =>
      row.firstName && row.lastName
        ? `${row.firstName} ${row.lastName}`
        : (row.company ?? ""),
    header: "Contact",
    cell: ({ row }) => {
      const contact = row.original
      const hasName = contact.firstName && contact.lastName
      const initials = hasName
        ? `${contact.firstName![0]}${contact.lastName![0]}`.toUpperCase()
        : (contact.company?.[0] ?? "?").toUpperCase()
      const displayName = hasName
        ? `${contact.firstName} ${contact.lastName}`
        : contact.company ?? "—"
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-muted-foreground text-xs truncate">
              {contact.email ?? "—"}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "company",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Entreprise
        <ArrowUpDown className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("company") || "—",
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
    cell: ({ row }) => row.getValue("phone") || "—",
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Statut
        <ArrowUpDown className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => <ContactStatusBadge status={row.getValue("status")} />,
    filterFn: (row, id, value) => value === "ALL" || row.getValue(id) === value,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date d&apos;ajout
        <ArrowUpDown className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      const day = date.getUTCDate().toString().padStart(2, "0")
      const month = date.getUTCMonth() + 1
      const year = date.getUTCFullYear()
      const months = ["jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
      return `${day} ${months[month - 1]} ${year}`
    },
  },
]
