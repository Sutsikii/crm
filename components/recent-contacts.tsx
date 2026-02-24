import { getRecentContacts } from "@/app/actions/contacts"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ContactStatusBadge } from "@/components/contact-status-badge"

export async function RecentContacts() {
  const contacts = await getRecentContacts()

  if (contacts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center border border-dashed p-8">
        <p className="text-muted-foreground text-sm">
          Aucun contact pour le moment. Créez votre premier contact !
        </p>
      </div>
    )
  }

  return (
    <div className="border">
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
                {contact.firstName && contact.lastName
                  ? `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
                  : (contact.company?.[0] ?? "?").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {contact.firstName && contact.lastName
                  ? `${contact.firstName} ${contact.lastName}`
                  : contact.company ?? "—"}
              </p>
              <p className="text-muted-foreground text-xs truncate">
                {contact.email ?? contact.company ?? "—"}
              </p>
            </div>
            <ContactStatusBadge status={contact.status} />
          </div>
        ))}
      </div>
    </div>
  )
}
