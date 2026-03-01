"use client"

import { useState } from "react"
import { createProduct, updateProduct } from "@/app/actions/products"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package } from "lucide-react"
import type { Product } from "@/components/products-table/columns"

interface ProductSheetProps {
  product?: Product
  children?: React.ReactNode
}

type BillingType = "ONE_TIME" | "RECURRING"
type DepositType = "FIXED" | "PERCENTAGE"

export function ProductSheet({ product, children }: ProductSheetProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [billingType, setBillingType] = useState<BillingType>(
    (product?.billingType as BillingType) ?? "ONE_TIME"
  )
  const [depositEnabled, setDepositEnabled] = useState(product?.depositEnabled ?? false)
  const [depositType, setDepositType] = useState<DepositType>(
    (product?.depositType as DepositType) ?? "FIXED"
  )

  function resetState() {
    setBillingType((product?.billingType as BillingType) ?? "ONE_TIME")
    setDepositEnabled(product?.depositEnabled ?? false)
    setDepositType((product?.depositType as DepositType) ?? "FIXED")
    setError("")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    if (depositEnabled) formData.set("depositEnabled", "on")
    try {
      if (product) {
        await updateProduct(product.id, formData)
      } else {
        await createProduct(formData)
      }
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const isEdit = !!product

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (o) resetState() }}>
      <SheetTrigger asChild>
        {children ?? (
          <Button size="sm">
            <Package className="size-4 mr-2" />
            Nouveau produit
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Modifier le produit" : "Nouveau produit"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Modifiez les informations du produit" : "Ajoutez un produit à votre catalogue"}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="px-4 space-y-6">
          <input type="hidden" name="billingType" value={billingType} />
          {depositEnabled && billingType === "ONE_TIME" && (
            <input type="hidden" name="depositType" value={depositType} />
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nom *</FieldLabel>
              <Input id="name" name="name" required defaultValue={product?.name} />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea id="description" name="description" rows={3} defaultValue={product?.description ?? ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="price">Prix (€) *</FieldLabel>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={product?.price ?? ""}
              />
            </Field>
          </FieldGroup>

          <div className="space-y-3">
            <p className="text-sm font-medium">Type de facturation</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={billingType === "ONE_TIME" ? "default" : "outline"}
                size="sm"
                onClick={() => setBillingType("ONE_TIME")}
              >
                Paiement unique
              </Button>
              <Button
                type="button"
                variant={billingType === "RECURRING" ? "default" : "outline"}
                size="sm"
                onClick={() => setBillingType("RECURRING")}
              >
                Récurrent
              </Button>
            </div>

            {billingType === "RECURRING" && (
              <Select
                name="recurringInterval"
                defaultValue={product?.recurringInterval ?? "MONTHLY"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Intervalle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Mensuel</SelectItem>
                  <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
                  <SelectItem value="SEMIANNUAL">Semestriel</SelectItem>
                  <SelectItem value="ANNUAL">Annuel</SelectItem>
                </SelectContent>
              </Select>
            )}

            {billingType === "ONE_TIME" && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={depositEnabled}
                    onChange={(e) => setDepositEnabled(e.target.checked)}
                    className="size-4 rounded border"
                  />
                  <span className="text-sm">Acompte</span>
                </label>

                {depositEnabled && (
                  <div className="space-y-3 pl-6">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={depositType === "FIXED" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDepositType("FIXED")}
                      >
                        €
                      </Button>
                      <Button
                        type="button"
                        variant={depositType === "PERCENTAGE" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDepositType("PERCENTAGE")}
                      >
                        %
                      </Button>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="depositValue">
                        Valeur {depositType === "PERCENTAGE" ? "(%)" : "(€)"}
                      </FieldLabel>
                      <Input
                        id="depositValue"
                        name="depositValue"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={product?.depositValue ?? ""}
                      />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
