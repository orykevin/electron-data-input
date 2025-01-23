import React from 'react'
import { DataSupplierFull, formSchema } from '.'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSupplier, updateSupplier } from '@/dbFunctions/supplier'
import { Button } from '@/components/ui/button'
import FormInput from '@/components/form-input'
import useAllSupplier from '@/store/useSupplierStore'
import HeaderBase from '@/components/header-base'

type Props = {
  selectedSupplier: DataSupplierFull
  setSelectedIds: React.Dispatch<React.SetStateAction<number | null>>
  setData?: React.Dispatch<React.SetStateAction<DataSupplierFull[]>>
  type?: string
}

const DialogUpdateSupplier = ({ selectedSupplier, setSelectedIds, setData, type }: Props) => {
  const form = useForm({
    defaultValues: {
      kode: selectedSupplier?.kode || null,
      nama: selectedSupplier?.nama || null,
      alamat: selectedSupplier?.alamat || null,
      deskripsi: selectedSupplier?.deskripsi || null
    },
    resolver: zodResolver(formSchema)
  })

  const { fetchData } = useAllSupplier()

  const onSubmit = async (data: { [key: string]: string | null }) => {
    try {
      if (type === 'add') {
        const dataForm = {
          kode: data.kode || '',
          nama: data.nama || '',
          alamat: data.alamat || '',
          deskripsi: data.deskripsi || ''
        }
        await createSupplier(dataForm).then((data) => {
          setSelectedIds(data.id)
          fetchData()
        })
      }
      await updateSupplier(selectedSupplier.id, data).then((data) => {
        setData &&
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
          <DialogTitle>{type === 'add' ? 'Tambah Supplier' : 'Edit Supplier'}</DialogTitle>
        </DialogHeader>
        <div>
          {selectedSupplier && (
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <HeaderBase>{type === 'add' ? 'Buat Supplier Baru' : 'Edit Supplier'}</HeaderBase>
                <div className="space-y-1">
                  <div className="flex gap-3 justify-start items-end">
                    <FormInput name="kode" label="Kode Supplier" fieldClassName="max-w-[240px]" />
                    <FormInput name="nama" label="Nama Supplier" />
                  </div>
                  <FormInput name="alamat" label="Alamat" />
                  <FormInput name="deskripsi" label="Deskripsi" />
                  <Button type="submit" className="!mt-3 w-full h-10">
                    {type === 'add' ? 'Tambah Supplier' : 'Update Supplier'}
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
