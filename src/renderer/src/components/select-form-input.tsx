import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useFormContext } from 'react-hook-form'
import { SearchableSelect } from './searchable-select'

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
  additionalComponent?: React.ReactNode
  searchable?: boolean
}

export const SelectFormInput = ({
  label,
  options,
  placeholder,
  className,
  name,
  displayError,
  additionalComponent,
  searchable = false
}: Props) => {
  const { register, control, setValue, getValues, watch } = useFormContext()
  const { error, isTouched } = control.getFieldState(name)
  const registered = register(name)

  const handleValueChange = (val: string | null) => {
    setValue(name, val || '')
    registered.onChange({ target: { name, value: val || '' } })
  }

  const defaultValue = getValues(name)
  const value = watch(name)

  if (searchable) {
    return (
      <div className={className}>
        <label className="block mb-1">{label}</label>
        <SearchableSelect
          options={options}
          value={value || null}
          onChange={handleValueChange}
          placeholder={placeholder}
          additionalComponent={additionalComponent}
        />
        {isTouched && error && displayError && <p className="text-red-500"> {error.message} </p>}
      </div>
    )
  }

  return (
    <div>
      <label className="block mb-1">{label}</label>
      <Select
        onValueChange={(val) => handleValueChange(val)}
        defaultValue={defaultValue}
        value={value}
      >
        <SelectTrigger
          className={cn(
            // 'w-max px-2 relative inline-flex h-9 items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[placeholder]:text-gray-500 data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20',
            'data-[placeholder]:text-gray-500 focus:border-blue-500 focus:border-2 data-[state=open]:border-blue-500 data-[state=open]:border-2',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {options.map((opt) => {
            return (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            )
          })}
          {additionalComponent}
        </SelectContent>
      </Select>
      {isTouched && error && displayError && <p className="text-red-500"> {error.message} </p>}
    </div>
  )
}
