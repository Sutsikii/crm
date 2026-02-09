"use client"

import * as React from "react"
import {
  CalendarDays,
  ChartBar,
  Command,
  HandCoins,
  Kanban,
  LayoutDashboard,
  Settings2,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@moncrm.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Contacts",
      url: "#",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "Tous les contacts",
          url: "#",
        },
        {
          title: "Entreprises",
          url: "#",
        },
        {
          title: "Particuliers",
          url: "#",
        },
      ],
    },
    {
      title: "Pipeline",
      url: "#",
      icon: Kanban,
      items: [
        {
          title: "Vue Kanban",
          url: "#",
        },
        {
          title: "Liste",
          url: "#",
        },
        {
          title: "Opportunités",
          url: "#",
        },
      ],
    },
    {
      title: "Ventes",
      url: "#",
      icon: HandCoins,
      items: [
        {
          title: "Devis",
          url: "#",
        },
        {
          title: "Factures",
          url: "#",
        },
        {
          title: "Paiements",
          url: "#",
        },
      ],
    },
    {
      title: "Paramètres",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Général",
          url: "#",
        },
        {
          title: "Équipe",
          url: "#",
        },
        {
          title: "Intégrations",
          url: "#",
        },
      ],
    },
  ],
  raccourcis: [
    {
      name: "Tableau de bord",
      url: "#",
      icon: LayoutDashboard,
    },
    {
      name: "Calendrier",
      url: "#",
      icon: CalendarDays,
    },
    {
      name: "Rapports",
      url: "#",
      icon: ChartBar,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent active:bg-transparent">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Next CRM</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.raccourcis} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
