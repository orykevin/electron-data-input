import { Link, LinkProps } from 'react-router-dom'
import { buttonVariants } from './button'
import { cn } from '../../lib/utils'

interface propsTypes extends LinkProps {
  icon?: React.ReactNode
  isActive?: boolean
  className?: string
  children?: React.ReactNode
}

export const LinkButtonIcon = ({ icon, className, isActive, children, ...props }: propsTypes) => {
  return (
    <Link
      className={cn(
        buttonVariants({ variant: 'default' }),
        'bg-inherit border-gray-200',
        className,
        isActive && 'bg-primary-foreground border-none'
      )}
      {...props}
    >
      {icon}
      {children}
    </Link>
  )
}
