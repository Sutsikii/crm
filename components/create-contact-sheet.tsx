"use client"

import { useState } from "react"
import { createContact } from "@/app/actions/contacts"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { UserPlus } from "lucide-react"

export function CreateContactSheet() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const formData = new FormData(e.currentTarget)
    const firstName = (formData.get("firstName") as string).trim()
    const lastName = (formData.get("lastName") as string).trim()
    const company = (formData.get("company") as string).trim()

    if ((!firstName || !lastName) && !company) {
      setError("Renseignez un prénom/nom ou une entreprise")
      return
    }

    setLoading(true)
    try {
      await createContact(formData)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-4 mr-2" />
          Nouveau contact
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nouveau contact</SheetTitle>
          <SheetDescription>
            Ajoutez un nouveau contact à votre CRM
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="px-4 space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="company">Entreprise</FieldLabel>
              <Input id="company" name="company" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="firstName">Prénom</FieldLabel>
                <Input id="firstName" name="firstName" />
              </Field>
              <Field>
                <FieldLabel htmlFor="lastName">Nom</FieldLabel>
                <Input id="lastName" name="lastName" />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="email">E-mail *</FieldLabel>
              <Input id="email" name="email" type="email" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Téléphone</FieldLabel>
              <Input id="phone" name="phone" type="tel" />
            </Field>
            <Field>
              <FieldLabel htmlFor="address">Adresse</FieldLabel>
              <Input id="address" name="address" />
            </Field>
          </FieldGroup>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Création..." : "Créer le contact"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
