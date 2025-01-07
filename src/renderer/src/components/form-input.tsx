import React from 'react'
import InputNumber from './input-number'
import { Input } from './ui/input'
import { useFormContext } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { is } from 'drizzle-orm'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  type?: string
  name: string
  fieldClassName?: string
  displayError?: boolean
}

const FormInput = ({ label, type, name, fieldClassName, displayError, ...props }: InputProps) => {
  const { register, control } = useFormContext()
  const { error, isTouched } = control.getFieldState(name)
  console.log(error, 'errror')

  return (
    <div className={cn('w-full space-y-2', fieldClassName)}>
      {type !== 'hidden' && <label>{label}</label>}
      <Input
        {...register(name)}
        type={type}
        className={cn(
          'focus:border-2 focus:border-blue-500',
          isTouched && error && 'border-red-500'
        )}
        {...props}
      />
      {isTouched && error && displayError && <p className="text-red-500"> {error.message} </p>}
    </div>
  )
}

export default FormInput
