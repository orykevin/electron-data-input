import { ChevronsUpDown, LogOut, Settings, User } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import useUser from '@/store/useUserStore'
import { UserData } from '@/dbFunctions/user'

export function NavUser({ user }: { user: UserData }) {
  const { logout } = useUser()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu dir="ltr">
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  <User />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.username}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={'top'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
