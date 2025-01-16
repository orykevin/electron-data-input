import React from 'react'
import { DataPelangganFull, formSchema, PelanganFormData } from '.'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPelanggan, updatePelanggan } from '@/dbFunctions/pelanggan'
import HeaderBase from '@/components/header-base'
import { Button } from '@/components/ui/button'
import FormInput from '@/components/form-input'
import useAllPelanggan from '@/store/usePelangganStore'

type Props = {
  selectedPelanggan: DataPelangganFull
  setSelectedIds: React.Dispatch<React.SetStateAction<number | null>>
  setData?: React.Dispatch<React.SetStateAction<DataPelangganFull[]>>
  type?: string
}

const DialogUpdatePelanggan = ({ selectedPelanggan, setSelectedIds, setData, type }: Props) => {
  const form = useForm({
    defaultValues: {
      kode: selectedPelanggan?.kode || null,
      nama: selectedPelanggan?.nama || null,
      alamat: selectedPelanggan?.alamat || null,
      deskripsi: selectedPelanggan?.deskripsi || null
    },
    resolver: zodResolver(formSchema)
  })

  const { fetchData } = useAllPelanggan()

  const onSubmit = async (data: { [key: string]: string | null }) => {
    try {
      if (type === 'add') {
        const dataForm = {
          kode: data.kode || '',
          nama: data.nama || '',
          alamat: data.alamat || '',
          deskripsi: data.deskripsi || ''
        }
        await createPelanggan(dataForm).then((data) => {
          setSelectedIds(data.id)
          fetchData()
        })
      } else {
        await updatePelanggan(selectedPelanggan.id, data).then((data) => {
          setData &&
            setData((prev) => {
              const newData = [...prev]
              const idx = newData.findIndex((d) => d.id === selectedPelanggan.id)
              newData[idx] = data
              return newData
            })
        })
        setSelectedIds(null)
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Dialog open={selectedPelanggan ? true : false} onOpenChange={() => setSelectedIds(null)}>
      <DialogContent className="w-[100wh] max-w-[100wh] max-h-[90dvh] overflow-auto">
        <DialogHeader>
          {' '}
          <DialogTitle>{type === 'add' ? 'Tambah Pelanggan' : 'Edit Pelanggan'}</DialogTitle>
        </DialogHeader>
        <div>
          {selectedPelanggan && (
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <HeaderBase>{type === 'add' ? 'Buat Pelanggan Baru' : 'Edit Pelanggan'}</HeaderBase>
                <div className="space-y-1">
                  <div className="flex gap-3 justify-start items-end">
                    <FormInput name="kode" label="Kode Pelanggan" fieldClassName="max-w-[240px]" />
                    <FormInput name="nama" label="Nama Pelanggan" />
                  </div>
                  <FormInput name="alamat" label="Alamat" />
                  <FormInput name="deskripsi" label="Deskripsi" />
                  <Button type="submit" className="!mt-3 w-full h-10">
                    {type === 'add' ? 'Tambah Pelanggan' : 'Update Pelanggan'}
                  </Button>
                </div>
              </form>
            </FormProvider>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogUpdatePelanggan
