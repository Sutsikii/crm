"use client"

import { useState } from "react"
import { updateContact, deleteContact } from "@/app/actions/contacts"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2 } from "lucide-react"

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  company: string | null
  status: string
}

interface EditContactSheetProps {
  contact: Contact | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditContactSheet({ contact, open, onOpenChange }: EditContactSheetProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!contact) return
    setError("")
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      await updateContact(contact.id, formData)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!contact) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    setError("")

    try {
      await deleteContact(contact.id)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setConfirmDelete(false)
      setError("")
    }
    onOpenChange(value)
  }

  if (!contact) return null

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Modifier le contact</SheetTitle>
          <SheetDescription>
            Modifiez les informations du contact
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="px-4 space-y-6">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="edit-firstName">Prénom</FieldLabel>
                <Input
                  id="edit-firstName"
                  name="firstName"
                  defaultValue={contact.firstName}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-lastName">Nom</FieldLabel>
                <Input
                  id="edit-lastName"
                  name="lastName"
                  defaultValue={contact.lastName}
                  required
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="edit-email">E-mail</FieldLabel>
              <Input
                id="edit-email"
                name="email"
                type="email"
                defaultValue={contact.email ?? ""}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-phone">Téléphone</FieldLabel>
              <Input
                id="edit-phone"
                name="phone"
                type="tel"
                defaultValue={contact.phone ?? ""}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-company">Entreprise</FieldLabel>
              <Input
                id="edit-company"
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || deleting}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
          <div className="border-t pt-4">
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              disabled={loading || deleting}
              onClick={handleDelete}
            >
              <Trash2 className="size-4 mr-2" />
              {deleting
                ? "Suppression..."
                : confirmDelete
                  ? "Confirmer la suppression"
                  : "Supprimer le contact"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
