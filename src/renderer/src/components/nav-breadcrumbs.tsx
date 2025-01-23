import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const NavBreadcrumbs = () => {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  console.log('paths', paths)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <Link to="/">
            <Home size={18} />
          </Link>
        </BreadcrumbItem>
        {paths.map((path, index) => (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem key={index}>
              <Link className="mb-0.5 capitalize font-semibold" to={`/${path}`}>
                {path.replaceAll('-', ' ')}
              </Link>
            </BreadcrumbItem>
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default NavBreadcrumbs
