'use client'

import * as React from 'react'
import {
  BookOpen,
  Bot,
  Home,
  LifeBuoy,
  Package,
  ReceiptText,
  Send,
  Settings2,
  ShoppingBag,
  SquareTerminal,
  Store,
  UserCog
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { NavProjects } from './nav-projects'
import { NavUser } from './nav-user'
import useUser from '@/store/useUserStore'

const data = {
  projects: [
    {
      name: 'Beranda',
      url: '/',
      icon: Home
    },
    {
      name: 'Barang',
      url: '/barang',
      icon: Package
    },
    {
      name: 'Penjualan',
      url: '#',
      icon: ReceiptText
    },
    {
      name: 'Pembelian',
      url: '#',
      icon: ShoppingBag
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userData } = useUser()

  const navList = [
    ...data.projects,
    userData && { name: 'Pengaturan Akun', url: '/pengaturan-akun', icon: UserCog }
  ].filter((list) => list !== null)

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Store className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Rio Jaya Motor</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={navList} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData!} />
      </SidebarFooter>
    </Sidebar>
  )
}
