import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Home } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const NavBreadcrumbs = () => {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  console.log('paths', paths)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">
            <Home size={18} />
          </BreadcrumbLink>
        </BreadcrumbItem>
        {paths.map((path, index) => (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem key={index}>
              <BreadcrumbLink className="mb-0.5 capitalize font-semibold" href={`/${path}`}>
                {path}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default NavBreadcrumbs
