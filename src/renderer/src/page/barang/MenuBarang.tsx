import SwitchText from '@/components/switch-text'
import { Input } from '@/components/ui/input'
import { DataBarang } from '@/dbFunctions/barang'
import useDebounce from '@/lib/hooks/use-debounce'
import { SetStateAction, useEffect, useState } from 'react'
import FormBarang from './FormBarang'

type Props = {
  setEditable?: React.Dispatch<SetStateAction<boolean>>
  setBarangs: React.Dispatch<SetStateAction<DataBarang | []>>
  barangs: DataBarang
}

const MenuBarang = ({ setEditable, barangs, setBarangs }: Props) => {
  const [searchKode, setSearchKode] = useState('')
  const [searchNama, setSearchNama] = useState('')
  const debounceSearchKode = useDebounce(searchKode, 250)
  const debounceSearchNama = useDebounce(searchNama, 250)

  useEffect(() => {
    if (searchKode !== '') {
      const filtered = barangs.filter((barang) => {
        return barang.kode.toLowerCase().includes(debounceSearchKode.toLowerCase())
      })
      setBarangs(filtered)
    } else {
      setBarangs(barangs)
    }
  }, [debounceSearchKode])

  useEffect(() => {
    if (searchNama !== '') {
      const filtered = barangs.filter((barang) => {
        return barang.nama.toLowerCase().includes(debounceSearchNama.toLowerCase())
      })
      setBarangs(filtered)
    } else {
      setBarangs(barangs)
    }
  }, [debounceSearchNama])

  const handleSearchKode = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (searchNama !== '') {
      setSearchNama('')
    }
    setSearchKode(event.target.value)
  }

  const handleSearchNama = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (searchKode !== '') {
      setSearchKode('')
    }
    setSearchNama(event.target.value)
  }

  return (
    <div className="pt-2 pb-4">
      <FormBarang />
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <div>
            <label>Kode:</label>
            <Input
              value={searchKode}
              className="!text-xs max-w-[120px] max-h-8"
              onChange={handleSearchKode}
            />
          </div>
          <div>
            <label>Name:</label>
            <Input
              value={searchNama}
              className="!text-xs w-[300px] max-h-8"
              onChange={handleSearchNama}
            />
          </div>
        </div>
        <div>
          <SwitchText setState={setEditable} />
        </div>
      </div>
    </div>
  )
}

export default MenuBarang
