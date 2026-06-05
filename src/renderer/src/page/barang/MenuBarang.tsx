import SwitchText from '@/components/switch-text'
import { Input } from '@/components/ui/input'
import { DataBarang } from '@/dbFunctions/barang'
import useDebounce from '@/lib/hooks/use-debounce'
import { SetStateAction, useEffect, useState } from 'react'
import FormBarang from './FormBarang'
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  setEditable?: React.Dispatch<SetStateAction<boolean>>
  setBarangs: React.Dispatch<SetStateAction<DataBarang | []>>
  barangs: DataBarang
  setSearch: React.Dispatch<SetStateAction<string>>
  setSearchField: React.Dispatch<SetStateAction<string>>
  onRefresh?: () => void
  loading?: boolean
}

const MenuBarang = ({
  setEditable,
  setBarangs,
  setSearch,
  setSearchField,
  onRefresh,
  loading
}: Props) => {
  const [searchKode, setSearchKode] = useState('')
  const [searchNama, setSearchNama] = useState('')
  const debounceSearchKode = useDebounce(searchKode, 250)
  const debounceSearchNama = useDebounce(searchNama, 250)
  const [showForm, setShowForm] = useState(true)

  useEffect(() => {
    if (debounceSearchKode !== '' && debounceSearchNama === '') {
      setSearch(debounceSearchKode)
      setSearchField('kode')
    }
    if (debounceSearchNama !== '' && debounceSearchKode === '') {
      setSearch(debounceSearchNama)
      setSearchField('nama')
    }
    if (debounceSearchKode === '' && debounceSearchNama === '') {
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
        {showForm && <FormBarang setBarangs={setBarangs} onSuccess={onRefresh} />}
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
            <label>Nama / Merek:</label>
            <Input
              value={searchNama}
              className="!text-xs w-[300px] max-h-8"
              onChange={handleSearchNama}
              placeholder="Cari nama atau merek..."
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={onRefresh}
            variant="outline"
            className="flex items-center gap-2 px-3 py-1.5 h-8 text-xs font-semibold border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 shadow-sm active:scale-95"
            disabled={loading}
            type="button"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
          <SwitchText setState={setEditable} />
        </div>
      </div>
    </div>
  )
}

export default MenuBarang
