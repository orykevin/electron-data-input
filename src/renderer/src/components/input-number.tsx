import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button, Group, Input, Label, NumberField } from 'react-aria-components'
import { useFormContext } from 'react-hook-form'

type Props = {
  label?: string
  type?: string
  name: string
  fieldClassName?: string
  displayError?: boolean
}

export default function InputNumber({
  label,
  name,
  fieldClassName,
  displayError,
  ...props
}: Props) {
  const { register, control, setValue, getValues } = useFormContext()
  const { error, isTouched } = control.getFieldState(name)
  const registered = register(name)

  return (
    <div className={cn('w-full space-y-1', fieldClassName)}>
      <label>{label}</label>
      <NumberField
        formatOptions={{
          style: 'decimal'
        }}
        aria-label="Number input"
        onChange={(val) => {
          setValue(name, val)
          registered.onChange({ target: { name, value: val } })
        }}
        value={getValues(name)}
      >
        <div className="space-y-2">
          <Group className="relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20">
            <Input className="flex-1 bg-background px-3 py-2 tabular-nums text-foreground focus:outline-none" />
          </Group>
        </div>
      </NumberField>
      {isTouched && error && displayError && <p className="text-red-500"> {error.message} </p>}
    </div>
  )
}
