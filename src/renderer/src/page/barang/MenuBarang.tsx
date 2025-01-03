import SwitchText from '@/components/switch-text'
import { SetStateAction } from 'react'

type Props = {
  setEditable?: React.Dispatch<SetStateAction<boolean>>
}

const MenuBarang = ({ setEditable }: Props) => {
  return (
    <div className="pt-2 pb-4">
      <div>create form</div>
      <div className="flex justify-between">
        <div>searchform</div>
        <div>
          <SwitchText setState={setEditable} />
        </div>
      </div>
    </div>
  )
}

export default MenuBarang
