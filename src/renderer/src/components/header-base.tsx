import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

const HeaderBase = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <h1 className={cn('text-2xl font-semibold pb-2 mb-2 border-b border-gray-200', className)}>
      {children}
    </h1>
  )
}

export default HeaderBase
