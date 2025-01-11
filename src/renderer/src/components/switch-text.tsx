import { Switch } from '@/components/ui/switch'
import { Pencil, PencilOff } from 'lucide-react'
import { SetStateAction, useEffect, useState } from 'react'

type SwitchTextProps = {
  setState?: React.Dispatch<SetStateAction<boolean>>
}

export default function SwitchText({ setState }: SwitchTextProps) {
  const [checked, setChecked] = useState<boolean>(true)

  useEffect(() => {
    if (setState) {
      setState(checked)
    }
  }, [checked, setState])

  return (
    <div className="inline-flex items-center gap-2">
      <p className="flex gap-2 cursor-pointer font-semibold" onClick={() => setChecked(!checked)}>
        {checked ? (
          <p className="flex gap-2 items-center text-xs">
            Mode Edit <Pencil size={18} strokeWidth={2} aria-hidden="true" />
          </p>
        ) : (
          <p className="flex gap-2 items-center text-xs">
            Mode Non-Edit <PencilOff size={18} strokeWidth={2} aria-hidden="true" />
          </p>
        )}

        <span className="sr-only">Toggle switch</span>
      </p>
      <Switch
        id="switch-11"
        checked={checked}
        onCheckedChange={setChecked}
        aria-label="Toggle switch"
      />
    </div>
  )
}
