import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectValue } from './ui/select'
import { SelectTrigger } from '@radix-ui/react-select'
import { ChangeHandler, useFormContext } from 'react-hook-form'

type Props = {
  label: string
  options: {
    value: string
    label: string
  }[]
  placeholder: string
  className?: string
  name: string
  displayError?: boolean
}

export const SelectFormInput = ({
  label,
  options,
  placeholder,
  className,
  name,
  displayError
}: Props) => {
  const { register, control, setValue, getValues } = useFormContext()
  const { error, isTouched } = control.getFieldState(name)
  const registered = register(name)

  const handleValueChange = (value: string) => {
    setValue(name, value)
    registered.onChange({ target: { name, value } })
  }

  const defaultValue = getValues(name)

  return (
    <div>
      <label className="block mb-1">{label}</label>
      <Select onValueChange={handleValueChange} defaultValue={defaultValue}>
        <SelectTrigger
          className={cn(
            'w-max px-2 relative inline-flex h-9 items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[placeholder]:text-gray-500 data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {options.map((opt) => {
            return <SelectItem value={opt.value}>{opt.label}</SelectItem>
          })}
        </SelectContent>
      </Select>
      {isTouched && error && displayError && <p className="text-red-500"> {error.message} </p>}
    </div>
  )
}
