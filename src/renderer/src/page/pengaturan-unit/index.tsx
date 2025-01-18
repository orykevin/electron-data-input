import FormInput from '@/components/form-input'
import HeaderBase from '@/components/header-base'
import InputNumber from '@/components/input-number'
import { Button } from '@/components/ui/button'
import { DataUnit, deleteUnit, saveUnit, updateUnit } from '@/dbFunctions/unit'
import { useToast } from '@/lib/hooks/use-toast'
import { cn } from '@/lib/utils'
import useAllUnit from '@/store/useUnitStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Delete, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import z from 'zod'

const formSchema = z.object({
  unit: z.string().min(1, { message: 'Unit harus di isi' }),
  jumlah: z.number().min(1, { message: 'Jumlah harus lebih dari satu' }),
  deskripsi: z.string()
})

type FormData = z.infer<typeof formSchema>

const PengaturanUnit = () => {
  const { data: unitData, initialized, fetchData } = useAllUnit()
  const [listUnit, setListUnit] = useState<DataUnit>(unitData)
  const [selected, setSelected] = useState<null | DataUnit[number]>(null)
  const { toast } = useToast()

  const form = useForm({
    defaultValues: { unit: '', jumlah: 1, deskripsi: '' },
    resolver: zodResolver(formSchema)
  })

  useEffect(() => {
    if (!initialized) fetchData()
    if (listUnit.length === 0) {
      setListUnit(unitData)
    }
  }, [unitData, initialized])

  useEffect(() => {
    if (selected) {
      form.setValue('unit', selected.unit)
      form.setValue('jumlah', selected.jumlah)
      form.setValue('deskripsi', selected?.deskripsi || '')
    } else {
      form.reset()
    }
  }, [selected])

  const onSubmit = async (value: FormData) => {
    if (selected) {
      updateUnit(selected.id, value).then((res) => {
        if (res) {
          setListUnit((prev) => {
            const dataIdx = prev.findIndex((data) => data.id === selected.id)
            let prevData = [...prev]
            prevData[dataIdx] = res
            return prevData
          })
          toast({
            title: 'Success',
            description: 'Unit berhasil disimpan'
          })
          form.reset()
          setSelected(null)
        } else {
          toast({
            title: 'Error',
            description: 'Unit gagal disimpan'
          })
        }
      })
    } else {
      saveUnit(value).then((res) => {
        if (res) {
          setListUnit((prev) => [...prev, res])
          fetchData()
          toast({
            title: 'Success',
            description: 'Unit berhasil disimpan'
          })
          form.reset()
        } else {
          toast({
            title: 'Error',
            description: 'Unit gagal disimpan'
          })
        }
      })
    }
  }

  return (
    <div>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <HeaderBase>Buat Akun Baru</HeaderBase>
          <div className="flex gap-3 justify-start items-end">
            <FormInput name="unit" label="Nama Unit" fieldClassName="max-w-[240px]" />
            <InputNumber name="jumlah" label="Jumlah per unit" fieldClassName="max-w-[240px]" />
          </div>
          <FormInput name="deskripsi" label="Deskripsi" />
          {selected ? (
            <div className="flex gap-3 w-full items-end my-3">
              <Button onClick={() => setSelected(null)} className="w-full">
                Batal
              </Button>
              <Button type="submit" className=" w-full">
                Simpan Perubahan Unit
              </Button>
            </div>
          ) : (
            <Button type="submit" className="my-3 w-full">
              Buat Unit
            </Button>
          )}
        </form>
      </FormProvider>
      <HeaderBase className="mt-6">List Unit</HeaderBase>
      {listUnit.map((unit) => {
        return (
          <div className="w-full flex gap-3 justify-between items-center py-3 px-8 pl-3 border-2 border-gray-200 shadow-sm rounded-md">
            <div className="flex gap-2 items-center">
              <Box />
              <p>
                <b>{unit.unit}</b>
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <>
                <Button
                  onClick={() => setSelected(unit)}
                  className={cn('w-[124px]', selected?.id === unit.id && 'bg-blue-200')}
                >
                  <Pencil />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  disabled={selected?.id === unit.id}
                  className="w-[124px]"
                  onClick={() =>
                    deleteUnit(unit.id)
                      .then((res) => {
                        console.log(res)
                        if (res && res?.length > 0) {
                          setListUnit((prevData) => prevData.filter((data) => data.id !== unit.id))
                          toast({
                            title: 'Success',
                            description: 'Unit berhasil dihapus'
                          })
                          fetchData()
                        } else {
                          toast({
                            title: 'Error',
                            description:
                              'Gagal menghapus unit, pastikan unit tidak digunakan sebelum dihapus'
                          })
                        }
                      })
                      .catch(() => {
                        toast({
                          title: 'Error',
                          description:
                            'Gagal menghapus unit, pastikan unit tidak digunakan sebelum dihapus'
                        })
                      })
                  }
                >
                  <Delete />
                  Hapus
                </Button>
              </>
            </div>
          </div>
        )
      })}
      <div></div>
    </div>
  )
}

export default PengaturanUnit
