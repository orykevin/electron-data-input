import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ChevronRight, LucideIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

export function NavProjects({
  projects
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
    subMenu?: { name: string; url: string }[]
  }[]
}) {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  console.log(paths)

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) =>
          item.subMenu ? (
            <Collapsible key={item.name} asChild className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild className="hover:bg-blue-200/90 rounded-md">
                  <SidebarMenuButton tooltip={item.name}>
                    {item.icon && <item.icon />}
                    <span>{item.name}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all my-1">
                  <SidebarMenuSub>
                    {item.subMenu?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.name} className=" py-0.5">
                        <SidebarMenuSubButton
                          asChild
                          className={cn(
                            'hover:bg-blue-200/90',
                            (paths[0] === subItem.url.replace('/', '') ||
                              (paths.length === 0 && subItem.url === '/')) &&
                              'bg-gray-200/90 font-semibold'
                          )}
                        >
                          <Link to={subItem.url} replace={true}>
                            <span>{subItem.name}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                className={cn(
                  'hover:bg-blue-200/90',
                  (paths[0] === item.url.replace('/', '') ||
                    (paths.length === 0 && item.url === '/')) &&
                    'bg-gray-200/90 font-semibold'
                )}
              >
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
