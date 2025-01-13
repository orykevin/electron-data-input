import React from 'react'
import { DataSupplierFull, formSchema } from '.'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateSupplier } from '@/dbFunctions/supplier'
import HeaderBase from '@/components/header-base'
import { Button } from '@/components/ui/button'
import FormInput from '@/components/form-input'

type Props = {
  selectedSupplier: DataSupplierFull
  setSelectedIds: React.Dispatch<React.SetStateAction<number | null>>
  setData: React.Dispatch<React.SetStateAction<DataSupplierFull[]>>
}

const DialogUpdateSupplier = ({ selectedSupplier, setSelectedIds, setData }: Props) => {
  const form = useForm({
    defaultValues: {
      kode: selectedSupplier?.kode || null,
      nama: selectedSupplier?.nama || null,
      alamat: selectedSupplier?.alamat || null,
      deskripsi: selectedSupplier?.deskripsi || null
    },
    resolver: zodResolver(formSchema)
  })

  const onSubmit = async (data: { [key: string]: string | null }) => {
    try {
      await updateSupplier(selectedSupplier.id, data).then((data) => {
        setData((prev) => {
          const newData = [...prev]
          const idx = newData.findIndex((d) => d.id === selectedSupplier.id)
          newData[idx] = data
          return newData
        })
      })
      setSelectedIds(null)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Dialog open={selectedSupplier ? true : false} onOpenChange={() => setSelectedIds(null)}>
      <DialogContent className="w-[100wh] max-w-[100wh] max-h-[90dvh] overflow-auto">
        <DialogHeader>
          {' '}
          <DialogTitle>Edit Barang</DialogTitle>
        </DialogHeader>
        <div>
          {selectedSupplier && (
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <HeaderBase>Buat Supplier Baru</HeaderBase>
                <div className="space-y-1">
                  <div className="flex gap-3 justify-start items-end">
                    <FormInput name="kode" label="Kode Supplier" fieldClassName="max-w-[240px]" />
                    <FormInput name="nama" label="Nama Supplier" />
                  </div>
                  <FormInput name="alamat" label="Alamat" />
                  <FormInput name="deskripsi" label="Deskripsi" />
                  <Button type="submit" className="!mt-3 w-full h-10">
                    Update Supplier
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

export default DialogUpdateSupplier
