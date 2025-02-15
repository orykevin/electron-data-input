import { Button } from '@/components/ui/button'
import { LinkButtonIcon } from '@/components/ui/link-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { savePengaturanPrint } from '@/dbFunctions/pengaturanPrint'
import { toast } from '@/lib/hooks/use-toast'
import usePengaturanPrint from '@/store/usePengaturanPrint'
import { useEffect, useState } from 'react'

export type FieldOptions = {
  label: string
  value: string
}

const PengaturanPrint = () => {
  const { data, fetchData } = usePengaturanPrint()
  const [pengaturanData, setPengaturanData] = useState<{ id: number; value: string }[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const handleSavePengaturan = async () => {
    savePengaturanPrint(pengaturanData).then((res) => {
      if (res) {
        toast({ title: 'Success', description: 'Pengaturan berhasil disimpan' })
        fetchData()
      }
    })
  }

  console.log(pengaturanData)

  return (
    <div>
      {data.map((pengaturan) => {
        const options: FieldOptions[] = pengaturan.options ? JSON.parse(pengaturan.options) : []
        return (
          <div className="flex items-center gap-3">
            <p className="w-[150px] font-semibold"> {pengaturan.name}</p>
            <Select
              defaultValue={pengaturan.value!}
              onValueChange={(val) =>
                setPengaturanData((prev) => {
                  const prevDataIdx = prev.findIndex((data) => data.id === pengaturan.id)
                  if (prevDataIdx >= 0) {
                    let previousData = [...prev]
                    previousData[prevDataIdx] = { id: pengaturan.id, value: val }
                    return previousData
                  } else {
                    return [...prev, { id: pengaturan.id, value: val }]
                  }
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={'pilih pengaturan'} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })}
      <div className="my-4 flex gap-3">
        <LinkButtonIcon to="/pengaturan" className="hover:bg-red-500">
          Batal
        </LinkButtonIcon>
        <Button onClick={handleSavePengaturan}>Simpan Pengaturan</Button>
      </div>
    </div>
  )
}

export default PengaturanPrint
