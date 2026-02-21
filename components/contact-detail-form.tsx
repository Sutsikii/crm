"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { updateContact, deleteContact, addContactNote, loadMoreContactEvents } from "@/app/actions/contacts"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ContactStatusBadge } from "@/components/contact-status-badge"
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Trash2,
  UserPlus,
} from "lucide-react"

interface ContactEvent {
  id: string
  type: "NOTE" | "STATUS_CHANGE" | "CREATED"
  content: string | null
  fromStatus: string | null
  toStatus: string | null
  createdAt: string
}

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  company: string | null
  status: string
  createdAt: string
  updatedAt: string
  events: ContactEvent[]
  hasMoreEvents: boolean
}

const avatarColors: Record<string, string> = {
  LEAD: "bg-blue-100 text-blue-700",
  PROSPECT: "bg-amber-100 text-amber-700",
  CLIENT: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-500",
}

const statusLabels: Record<string, string> = {
  LEAD: "Lead",
  PROSPECT: "Prospect",
  CLIENT: "Client",
  INACTIVE: "Inactif",
}

const eventIconClass: Record<ContactEvent["type"], string> = {
  NOTE: "border-blue-200 bg-blue-50 text-blue-600",
  STATUS_CHANGE: "border-amber-200 bg-amber-50 text-amber-600",
  CREATED: "border-green-200 bg-green-50 text-green-600",
}

const eventLabel: Record<ContactEvent["type"], string> = {
  NOTE: "Note",
  STATUS_CHANGE: "Changement de statut",
  CREATED: "Contact créé",
}

const eventIcon: Record<ContactEvent["type"], React.ReactNode> = {
  NOTE: <MessageSquare className="size-3.5" />,
  STATUS_CHANGE: <ArrowRight className="size-3.5" />,
  CREATED: <UserPlus className="size-3.5" />,
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
    new Date(iso)
  )
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  if (hours < 24) return `il y a ${hours}h`
  if (days < 7) return `il y a ${days}j`
  return formatDate(iso)
}

function TimelineItem({
  event,
  isLast,
}: {
  event: ContactEvent
  isLast: boolean
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${eventIconClass[event.type]}`}>
          {eventIcon[event.type]}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 min-h-6 bg-border" />}
      </div>

      <div className="pb-5 min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {eventLabel[event.type]}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground/70">
            {formatRelativeTime(event.createdAt)}
          </span>
        </div>

        {event.type === "NOTE" && event.content && (
          <p className="mt-0.5 text-sm whitespace-pre-wrap">{event.content}</p>
        )}

        {event.type === "STATUS_CHANGE" && event.fromStatus && event.toStatus && (
          <div className="mt-0.5 flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">
              {statusLabels[event.fromStatus] ?? event.fromStatus}
            </span>
            <ArrowRight className="size-3 text-muted-foreground/50" />
            <span className="font-medium">
              {statusLabels[event.toStatus] ?? event.toStatus}
            </span>
          </div>
        )}

        {event.type === "CREATED" && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatDate(event.createdAt)}
          </p>
        )}
      </div>
    </div>
  )
}

export function ContactDetailForm({ contact }: { contact: Contact }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [addingNote, setAddingNote] = useState(false)

  const [events, setEvents] = useState(contact.events)
  const [hasMore, setHasMore] = useState(contact.hasMoreEvents)
  const [loadingMore, setLoadingMore] = useState(false)
  const [prevFirstId, setPrevFirstId] = useState(contact.events[0]?.id)

  const currentFirstId = contact.events[0]?.id
  if (currentFirstId !== prevFirstId) {
    setPrevFirstId(currentFirstId)
    setEvents(contact.events)
    setHasMore(contact.hasMoreEvents)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)
    try {
      await updateContact(contact.id, new FormData(e.currentTarget))
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError("")
    try {
      await deleteContact(contact.id)
      router.push("/contacts")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  async function handleAddNote() {
    if (!noteContent.trim()) return
    setAddingNote(true)
    try {
      await addContactNote(contact.id, noteContent.trim())
      setNoteContent("")
      router.refresh()
    } finally {
      setAddingNote(false)
    }
  }

  async function handleLoadMore() {
    setLoadingMore(true)
    try {
      const result = await loadMoreContactEvents(contact.id, events.length)
      setEvents((prev) => [...prev, ...result.events])
      setHasMore(result.hasMore)
    } finally {
      setLoadingMore(false)
    }
  }

  const initials =
    `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
  const avatarClass =
    avatarColors[contact.status] ?? "bg-muted text-muted-foreground"

  return (
    <div className="space-y-6 pb-10">
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Retour aux contacts
      </Link>

      <div className="flex items-start gap-4">
        <div
          className={`flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold ${avatarClass}`}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold leading-tight">
              {contact.firstName} {contact.lastName}
            </h1>
            <ContactStatusBadge status={contact.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {contact.company && (
              <span className="flex items-center gap-1.5">
                <Building2 className="size-3.5 shrink-0" />
                {contact.company}
              </span>
            )}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Mail className="size-3.5 shrink-0" />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Phone className="size-3.5 shrink-0" />
                {contact.phone}
              </a>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Contact créé le {formatDate(contact.createdAt)}
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="firstName">Prénom</FieldLabel>
                      <Input
                        id="firstName"
                        name="firstName"
                        defaultValue={contact.firstName}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="lastName">Nom</FieldLabel>
                      <Input
                        id="lastName"
                        name="lastName"
                        defaultValue={contact.lastName}
                        required
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="email">E-mail</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={contact.email ?? ""}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">Téléphone</FieldLabel>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={contact.phone ?? ""}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="company">Entreprise</FieldLabel>
                    <Input
                      id="company"
                      name="company"
                      defaultValue={contact.company ?? ""}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Statut</FieldLabel>
                    <Select name="status" defaultValue={contact.status}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEAD">Lead</SelectItem>
                        <SelectItem value="PROSPECT">Prospect</SelectItem>
                        <SelectItem value="CLIENT">Client</SelectItem>
                        <SelectItem value="INACTIVE">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            {error && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400">
                <CheckCircle2 className="size-4 shrink-0" />
                Modifications enregistrées.
              </div>
            )}

            <Button type="submit" disabled={loading || deleting}>
              <Save className="size-4 mr-2" />
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-base text-destructive">
                Zone de danger
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                La suppression est définitive et entraîne la perte de toutes
                les données associées à ce contact.
              </p>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="shrink-0"
                    disabled={loading || deleting}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Supprimer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Supprimer le contact</DialogTitle>
                    <DialogDescription>
                      Êtes-vous sûr de vouloir supprimer{" "}
                      <span className="font-medium text-foreground">
                        {contact.firstName} {contact.lastName}
                      </span>{" "}
                      ? Cette action est irréversible et entraîne la perte de
                      toutes les données associées.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDeleteOpen(false)}
                      disabled={deleting}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      <Trash2 className="size-4 mr-2" />
                      {deleting ? "Suppression..." : "Confirmer la suppression"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Ajouter une note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleAddNote()
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    ⌘ Entrée pour envoyer
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!noteContent.trim() || addingNote}
                    onClick={handleAddNote}
                  >
                    <MessageSquare className="size-3.5 mr-1.5" />
                    {addingNote ? "Ajout..." : "Ajouter"}
                  </Button>
                </div>
              </div>

              <Separator />

              {events.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Aucune activité pour le moment.
                </p>
              ) : (
                <div>
                  {events.map((event, i) => (
                    <TimelineItem
                      key={event.id}
                      event={event}
                      isLast={i === events.length - 1 && !hasMore}
                    />
                  ))}
                  {hasMore && (
                    <div className="flex justify-center pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="text-muted-foreground"
                      >
                        {loadingMore ? (
                          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <ChevronDown className="size-3.5 mr-1.5" />
                        )}
                        {loadingMore ? "Chargement..." : "Charger plus"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
