import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { LinkButtonIcon } from '@/components/ui/link-button'
import { AllPenjualanType, deletePenjualan, getAllPenjualan } from '@/dbFunctions/penjualan'
import { useToast } from '@/lib/hooks/use-toast'
import { getMonthShortName, getTotalAfterTax } from '@/misc/utils'
import useAllPelanggan from '@/store/usePelangganStore'
import { Delete, Pencil } from 'lucide-react'
import React, { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

const HistoriPenjualan = () => {
  const form = useForm()
  const [data, setData] = React.useState<AllPenjualanType>([])
  const { data: allPelanggan, fetchData } = useAllPelanggan()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    getAllPenjualan().then((res) => setData(res))
    if (allPelanggan.length === 0) fetchData()
  }, [])

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

  console.log(allPelanggan)

  return (
    <div>
      <div>
        <p className="text-sm font-semibold">History Penjualan</p>
      </div>
      <FormProvider {...form}>
        <form></form>
      </FormProvider>
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
                  <p className="text-xs font-semibold">{pelanggan?.nama || '-'}</p>
                  <p className="text-[16px] leading-[15px] text-gray-700">
                    {pelanggan?.alamat || '-'}
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
