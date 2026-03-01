import { notFound } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getDocumentForViewer } from "@/app/actions/documents"

interface DocumentPageProps {
  params: Promise<{ id: string; docId: string }>
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { docId } = await params
  const doc = await getDocumentForViewer(docId)

  if (!doc) {
    notFound()
  }

  const contactName =
    doc.contact.firstName && doc.contact.lastName
      ? `${doc.contact.firstName} ${doc.contact.lastName}`
      : doc.contact.company ?? "Contact"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Tableau de bord</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/contacts">Contacts</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/contacts/${doc.contact.id}`}>
                    {contactName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[200px] truncate">
                    {doc.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex-1 min-h-0">
          {doc.contentType.startsWith("image/") ? (
            <div className="flex h-full items-center justify-center bg-muted/30 p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.url}
                alt={doc.name}
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          ) : (
            <iframe
              src={doc.url}
              className="h-full w-full"
              title={doc.name}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
