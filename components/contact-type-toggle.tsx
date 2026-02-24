"use client"

import { cn } from "@/lib/utils"

export type ContactType = "INDIVIDUAL" | "COMPANY"

interface ContactTypeToggleProps {
  value: ContactType
  onChange: (type: ContactType) => void
}

export function ContactTypeToggle({ value, onChange }: ContactTypeToggleProps) {
  return (
    <div className="relative flex rounded-lg border bg-muted p-1">
      <div
        className={cn(
          "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-md bg-background shadow-sm transition-transform duration-200 ease-in-out",
          value === "COMPANY" && "translate-x-full"
        )}
      />
      <button
        type="button"
        onClick={() => onChange("INDIVIDUAL")}
        className={cn(
          "relative z-10 flex-1 py-1.5 text-sm font-medium transition-colors duration-200",
          value === "INDIVIDUAL" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Particulier
      </button>
      <button
        type="button"
        onClick={() => onChange("COMPANY")}
        className={cn(
          "relative z-10 flex-1 py-1.5 text-sm font-medium transition-colors duration-200",
          value === "COMPANY" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Entreprise
      </button>
    </div>
  )
}
