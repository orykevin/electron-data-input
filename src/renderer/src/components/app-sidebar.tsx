import * as React from 'react'
import { Home, Package, ReceiptText, ShoppingBag, Store, UserCog } from 'lucide-react'

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
import { AppUpdaterModal } from './AppUpdaterModal'

const data = {
  projects: [
    {
      name: 'Beranda',
      url: '/',
      icon: Home
    },
    {
      name: 'Barang',
      url: '#',
      icon: Package,
      subMenu: [
        {
          name: 'List Barang',
          url: '/list-barang'
        },
        {
          name: 'Pengaturan Unit',
          url: '/pengaturan-unit'
        }
      ]
    },
    {
      name: 'Penjualan',
      url: '#',
      icon: ReceiptText,
      subMenu: [
        {
          name: 'Histori Penjualan',
          url: '/histori-penjualan'
        },
        {
          name: 'Buat Faktur Penjualan',
          url: '/buat-faktur-penjualan'
        },
        {
          name: 'Daftar Pelanggan',
          url: '/daftar-pelanggan'
        }
      ]
    },
    {
      name: 'Pembelian',
      url: '#',
      icon: ShoppingBag,
      subMenu: [
        {
          name: 'Histori Pembelian',
          url: '/histori-pembelian'
        },
        {
          name: 'Buat Faktur Pembelian',
          url: '/buat-faktur-pembelian'
        },
        {
          name: 'Daftar Supplier',
          url: '/daftar-supplier'
        }
      ]
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userData } = useUser()
  const [versionApp, setVersionApp] = React.useState('')
  const [hasUpdate, setHasUpdate] = React.useState(false)
  const [isUpdaterOpen, setIsUpdaterOpen] = React.useState(false)

  const navList = [
    ...data.projects,
    userData && { name: 'Pengaturan Akun', url: '/pengaturan-akun', icon: UserCog }
  ].filter((list) => list !== null)

  React.useEffect(() => {
    const getVer = async () => {
      try {
        if (window.electron && typeof window.electron.getAppVersion === 'function') {
          const verRes = await window.electron.getAppVersion()
          setVersionApp(verRes)
        } else {
          setVersionApp('1.0.4')
        }
      } catch (err) {
        console.error('Error fetching app version:', err)
        setVersionApp('1.0.4')
      }
    }

    getVer()

    // Listen for available updates silently
    if (window.api && window.api.updater && typeof window.api.updater.onAvailable === 'function') {
      const unsub = window.api.updater.onAvailable(() => {
        setHasUpdate(true)
      })

      return () => {
        if (typeof unsub === 'function') unsub()
      }
    }
    return undefined
  }, [])

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
        <div
          onClick={() => setIsUpdaterOpen(true)}
          className="flex items-center justify-end gap-1.5 absolute bottom-1 right-4 cursor-pointer hover:opacity-85 active:opacity-75 transition-all select-none bg-gray-50/50 hover:bg-gray-100/70 border border-gray-100 rounded-full px-2.5 py-0.5"
        >
          {hasUpdate ? (
            <>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] text-green-600 font-bold">Update Baru!</span>
            </>
          ) : (
            <p className="text-[10px] m-0 font-medium text-gray-500">v{versionApp}</p>
          )}
        </div>

        <AppUpdaterModal
          isOpen={isUpdaterOpen}
          onClose={() => setIsUpdaterOpen(false)}
          currentVersion={versionApp}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
