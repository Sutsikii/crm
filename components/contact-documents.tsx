"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"
import { FileText, Image, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteContactDocument, type DocumentItem } from "@/app/actions/documents"

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
    new Date(iso)
  )
}

function DocIcon({ contentType }: { contentType: string }) {
  if (contentType.startsWith("image/")) {
    return <Image className="size-4 text-blue-500" />
  }
  return <FileText className="size-4 text-red-500" />
}

export function ContactDocuments({
  contactId,
  initialDocuments,
}: {
  contactId: string
  initialDocuments: DocumentItem[]
}) {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setUploading(true)

    const body = new FormData()
    body.append("file", file)

    const res = await fetch(`/api/contacts/${contactId}/documents`, { method: "POST", body }).catch(() => null)
    const data = await res?.json().catch(() => null) ?? null

    if (!res?.ok) {
      setError(data?.error ?? "Erreur lors de l'upload")
    } else {
      setDocuments((prev) => [data, ...prev])
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault()
    setDeletingId(id)

    const ok = await deleteContactDocument(id).then(() => true).catch(() => false)

    if (ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    } else {
      setError("Erreur lors de la suppression")
    }

    setDeletingId(null)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Documents</CardTitle>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
            ) : (
              <Plus className="size-3.5 mr-1.5" />
            )}
            {uploading ? "Upload..." : "Ajouter"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="mb-3 text-xs text-destructive">{error}</p>
        )}

        {documents.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Aucun document pour le moment.
          </p>
        ) : (
          <ul className="space-y-1">
            {documents.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/contacts/${contactId}/documents/${doc.id}`}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50 group"
                >
                  <DocIcon contentType={doc.contentType} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(doc.size)} · {formatDate(doc.createdAt)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={deletingId === doc.id}
                    onClick={(e) => handleDelete(e, doc.id)}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
