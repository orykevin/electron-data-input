import CalendarInput, { RangeValue } from '@/components/calendar-input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { LinkButtonIcon } from '@/components/ui/link-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { AllPenjualanType, deletePenjualan, getAllPenjualan } from '@/dbFunctions/penjualan'
import { useToast } from '@/lib/hooks/use-toast'
import { getFirstDateOfMonth, getLastDateOfMonth } from '@/lib/utils'
import { getMonthShortName, getTotalAfterTax } from '@/misc/utils'
import useAllPelanggan from '@/store/usePelangganStore'
import { getLocalTimeZone, now } from '@internationalized/date'
import { Delete, Pencil } from 'lucide-react'
import React, { useEffect } from 'react'
import { DateValue } from 'react-aria-components'

type FilterProps = {
  date: RangeValue<DateValue> | null
  pelanggan: string | null
}

const HistoriPenjualan = () => {
  const [data, setData] = React.useState<AllPenjualanType>([])
  const { data: allPelanggan, fetchData } = useAllPelanggan()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState<number | null>(null)

  const [filter, setFilter] = React.useState<FilterProps>({
    date: {
      start: getFirstDateOfMonth(now(getLocalTimeZone())),
      end: getLastDateOfMonth(now(getLocalTimeZone()))
    },
    pelanggan: null
  })

  const { toast } = useToast()

  const clearFilter = () => {
    setFilter({
      date: {
        start: getFirstDateOfMonth(now(getLocalTimeZone())),
        end: getLastDateOfMonth(now(getLocalTimeZone()))
      },
      pelanggan: null
    })
  }

  const handleDeletePenjualan = () => {
    if (!isDeleteDialogOpen) return
    deletePenjualan(isDeleteDialogOpen)
      .then(() => {
        setData((prevData) => prevData.filter((data) => data.id !== isDeleteDialogOpen))
        setIsDeleteDialogOpen(null)
        toast({
          title: 'Success',
          description: 'Penjualan berhasil dihapus'
        })
      })
      .catch((err) => {
        toast({
          title: 'Error',
          description: err.message
        })
      })
  }

  useEffect(() => {
    const pelangganId = Number(filter.pelanggan)
    const startDate = filter.date?.start.toDate(getLocalTimeZone())
    const endDate = filter.date?.end.toDate(getLocalTimeZone())
    getAllPenjualan(pelangganId, startDate!, endDate!).then((res) => setData(res))
  }, [filter])

  useEffect(() => {
    if (allPelanggan.length === 0) fetchData()
  }, [])

  return (
    <div>
      <div>
        <p className="text-sm font-semibold mb-4">Filter Penjualan</p>
        <div className="flex gap-3 items-end pb-3 mb-3 border-b border-gray-200">
          <div>
            <CalendarInput
              label="Tanggal Faktur"
              onChange={(data) => setFilter({ ...filter, date: data })}
              defaultValue={filter?.date || undefined}
              value={filter?.date || undefined}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Pilih pelanggan</Label>
            <Select onValueChange={(value) => setFilter({ ...filter, pelanggan: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih pelanggan" />
              </SelectTrigger>
              <SelectContent>
                {allPelanggan.map((pelanggan) => (
                  <SelectItem key={pelanggan.id} value={pelanggan.id.toString()}>
                    {pelanggan.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={clearFilter}>Clear</Button>
        </div>
      </div>
      <div>
        {data.map((item) => {
          const pelanggan = allPelanggan.find((pelanggan) => pelanggan.id === item.pelangganId)

          return (
            <div className="flex gap-3 items-center my-2 py-0 px-3 border border-gray-200 rounded-md shadow-md justify-between  ">
              <div className="flex gap-3 items-center">
                <div className="border-r border-gray-200 pr-3">
                  <div className="flex gap-2 items-center">
                    <p className="font-semibold text-[36px]">
                      {item?.tanggal ? String(item.tanggal?.getDate()).padStart(2, '0') : ' - '}
                    </p>
                    <div className="text-center">
                      <p>{item.tanggal ? getMonthShortName(item.tanggal?.getMonth()) : '-'}</p>
                      <p>{item.tanggal ? item.tanggal.getFullYear() : '-'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold">{item?.noInvoice || '-'}</p>
                  <p className="text-[16px] leading-[15px] text-gray-700">
                    {pelanggan?.nama || '-'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <p className="font-semibold">
                  Rp.
                  {getTotalAfterTax(
                    item.penjualanBarang.reduce(
                      (total, barang) => total + (barang.harga || 0) * barang.jumlah,
                      0
                    ),
                    item?.pajak || 0,
                    item?.diskon || 0
                  )}
                </p>
                <div className="flex gap-2">
                  <LinkButtonIcon to={`/histori-penjualan/edit-faktur-penjualan/${item.id}`}>
                    <Pencil />
                  </LinkButtonIcon>
                  <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(item.id)}>
                    <Delete />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <Dialog
        open={isDeleteDialogOpen !== null}
        onOpenChange={(open) => !open && setIsDeleteDialogOpen(null)}
      >
        <DialogContent>
          <DialogHeader>
            <p className="text-base font-semibold">Hapus Penjualan</p>
          </DialogHeader>
          <p className="test-base">Apakah anda yakin menghappus penjualan ini</p>
          <div className="flex gap-2">
            <Button className="w-full" onClick={() => setIsDeleteDialogOpen(null)}>
              Batal
            </Button>
            <Button className="w-full" variant={'destructive'} onClick={handleDeletePenjualan}>
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HistoriPenjualan
