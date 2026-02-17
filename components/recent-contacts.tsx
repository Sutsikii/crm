import { getRecentContacts } from "@/app/actions/contacts"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

export async function RecentContacts() {
  const contacts = await getRecentContacts()

  if (contacts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8">
        <p className="text-muted-foreground text-sm">
          Aucun contact pour le moment. Créez votre premier contact !
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border">
      <div className="p-4 pb-2">
        <h2 className="font-semibold">Derniers contacts</h2>
        <p className="text-muted-foreground text-sm">
          Vos {contacts.length} derniers contacts ajoutés
        </p>
      </div>
      <div className="divide-y">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center gap-3 px-4 py-3"
          >
            <Avatar className="size-9">
              <AvatarFallback className="text-xs">
                {contact.firstName[0]}
                {contact.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {contact.firstName} {contact.lastName}
              </p>
              <p className="text-muted-foreground text-xs truncate">
                {contact.email ?? contact.company ?? "—"}
              </p>
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[contact.status]}`}
            >
              {statusLabels[contact.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
