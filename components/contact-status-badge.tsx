import { Badge } from "@/components/ui/badge"

const statusLabels: Record<string, string> = {
  LEAD: "Lead",
  PROSPECT: "Prospect",
  CLIENT: "Client",
  INACTIVE: "Inactif",
}

const statusColors: Record<string, string> = {
  LEAD: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  PROSPECT: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  CLIENT: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  INACTIVE: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
}

export function ContactStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-none border-transparent ${statusColors[status] ?? ""}`}
    >
      {statusLabels[status] ?? status}
    </Badge>
  )
}

