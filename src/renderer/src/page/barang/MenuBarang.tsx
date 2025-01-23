import SwitchText from '@/components/switch-text'
import { Input } from '@/components/ui/input'
import { DataBarang } from '@/dbFunctions/barang'
import useDebounce from '@/lib/hooks/use-debounce'
import { SetStateAction, useEffect, useState } from 'react'
import FormBarang from './FormBarang'
import { ChevronDown, ChevronUp } from 'lucide-react'

type Props = {
  setEditable?: React.Dispatch<SetStateAction<boolean>>
  setBarangs: React.Dispatch<SetStateAction<DataBarang | []>>
  barangs: DataBarang
  setSearch: React.Dispatch<SetStateAction<string>>
  setSearchField: React.Dispatch<SetStateAction<string>>
}

const MenuBarang = ({ setEditable, setBarangs, setSearch, setSearchField }: Props) => {
  const [searchKode, setSearchKode] = useState('')
  const [searchNama, setSearchNama] = useState('')
  const debounceSearchKode = useDebounce(searchKode, 250)
  const debounceSearchNama = useDebounce(searchNama, 250)
  const [showForm, setShowForm] = useState(true)

  useEffect(() => {
    if (searchKode !== '' && searchNama === '') {
      setSearch(searchKode)
      setSearchField('kode')
    }
    if (searchNama !== '' && searchKode === '') {
      setSearch(searchNama)
      setSearchField('nama')
    }
    if (searchKode === '' && searchNama === '') {
      setSearch('')
      setSearchField('')
    }
  }, [debounceSearchKode, debounceSearchNama])

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
    <div className="pb-3">
      <div className="transition-all">
        <h1 className="text-2xl font-semibold pb-2 mb-2 border-b border-gray-200 flex justify-between items-center pr-3">
          Buat Barang Baru
          <div
            className="shadow-sm rounded-sm hover:bg-blue-100 cursor-pointer p-1 px-2 border border-gray-200"
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm ? <ChevronUp size="24" /> : <ChevronDown size="24" />}
          </div>
        </h1>
        {showForm && <FormBarang setBarangs={setBarangs} />}
      </div>
      <h1 className="text-2xl font-semibold pb-2 mb-2 border-b border-gray-200">Tabel list</h1>
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
