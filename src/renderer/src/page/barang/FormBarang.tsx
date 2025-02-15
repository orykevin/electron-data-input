import React, { SetStateAction } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInput from '@/components/form-input'
import { SelectFormInput } from '@/components/select-form-input'
import { Button } from '@/components/ui/button'
import InputNumber from '@/components/input-number'
import useAllUnit from '@/store/useUnitStore'
import { Delete, PlusCircle } from 'lucide-react'
import { createBarang, DataBarang, updateBarang } from '@/dbFunctions/barang'
import { cn } from '@/lib/utils'

type Props = {
  type?: 'edit'
  selectedBarang?: DataBarang[number]
  setBarangs: React.Dispatch<SetStateAction<DataBarang | []>>
  setSelectedBarangId?: React.Dispatch<React.SetStateAction<number | null>>
}

const schema = z.object({
  kode: z.string().min(1, { message: 'Kode harus diisi' }),
  nama: z.string().min(1, { message: 'Nama harus diisi' }),
  merek: z.string(),
  modal: z.number(),
  // unit: z.string(),
  listHarga: z.array(
    z.object({
      unit: z.string(),
      harga: z.number(),
      hargaLain: z.array(z.number())
    })
  ),
  // harga: z.number(),
  // hargaLain: z.string(),
  stockAwal: z.number(),
  stockMasuk: z.number(),
  stockKeluar: z.number()
  // masuk: z.number(),
  // keluar: z.number()
})

export type FormDataBarang = z.infer<typeof schema>

const FormBarang = ({ setBarangs, selectedBarang, type, setSelectedBarangId }: Props) => {
  const { data: unitData } = useAllUnit()

  const defaultValues = selectedBarang
    ? {
        kode: selectedBarang.kode,
        nama: selectedBarang.nama,
        merek: selectedBarang.merek || '',
        modal: selectedBarang.modal,
        stockAwal: selectedBarang.stockAwal,
        stockMasuk: selectedBarang?.stokMasuk || 0,
        stockKeluar: selectedBarang?.stokKeluar || 0,
        listHarga: selectedBarang.unitBarang.map((u) => ({
          unit: u.unit?.id.toString() || '1',
          harga: u.harga?.harga | 0,
          hargaLain: u.hargaLain.map((h) => h?.harga | 0)
        }))
      }
    : {
        listHarga: [{ unit: unitData[0]?.id.toString() || '1', harga: 0, hargaLain: [0] }],
        stockKeluar: 0,
        stockMasuk: 0
      }

  const form = useForm<FormDataBarang>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const { fields, append, remove } = useFieldArray({
    name: 'listHarga',
    control: form.control
  })

  const onSubmit = async (data: FormDataBarang) => {
    if (isEdit && selectedBarang) {
      updateBarang(data, selectedBarang)
        .then((result) => {
          if (result) {
            setBarangs((prev) => {
              let newArray = [...prev]
              newArray[newArray.findIndex((b) => b.id === result.id)] = {
                ...result,
                stokKeluar: result.stockKeluar,
                stokMasuk: result.stockMasuk
              }
              return newArray
            })
            setSelectedBarangId && setSelectedBarangId(null)
          }
        })
        .catch((err) => {
          console.log(err, 'error')
        })
    } else {
      await createBarang(data)
        .then((result) => {
          if (result) {
            setBarangs((prev) => [{ ...result, stokKeluar: 0, stokMasuk: 0 }, ...prev])
          }
        })
        .catch((err) => {
          console.log(err, 'error')
        })
    }
  }

  const listHargaValues = form.watch('listHarga')

  const addNewHargaLain = (index) => {
    form.setValue(`listHarga.${index}.hargaLain`, [...listHargaValues[index].hargaLain, 0])
  }

  const removeHargaLain = (index, indexHargaLain) => {
    form.setValue(
      `listHarga.${index}.hargaLain`,
      listHargaValues[index].hargaLain.filter((_, i) => i !== indexHargaLain)
    )
  }

  const isEdit = type === 'edit'

  // console.log(form.formState.errors, 'errors')
  // console.log(listHargaValues, 'listHargaValues')

  return (
    <div className={cn('mb-3', isEdit && 'mb-0 pb-0')}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex gap-3 mb-2 items-end">
            <FormInput fieldClassName="w-[250px]" label="Kode Barang" name="kode" displayError />
            <FormInput
              label="Nama Barang"
              name="nama"
              displayError
              className="min-w-[300px] focus:border-blue-500 focus:border-2"
            />
            <FormInput label="Merek" name="merek" fieldClassName="max-w-[150px]" />
            <InputNumber label="Modal" name="modal" fieldClassName="max-w-[200px]" />
            <InputNumber label="Stok Awal" name="stockAwal" fieldClassName="max-w-[150px]" />
          </div>
          <div>
            {fields.map((field, index) => {
              return (
                <div
                  className={cn(
                    'flex gap-3 items-end mb-2',
                    isEdit && listHargaValues[index].hargaLain.length > 0 && 'items-start'
                  )}
                  key={field.id}
                >
                  <SelectFormInput
                    label="Unit"
                    options={unitData
                      .filter(
                        (u) => {
                          if (!listHargaValues[index].unit) {
                            return !listHargaValues
                              .map((list) => list.unit)
                              .includes(u.id.toString())
                          } else {
                            return true
                          }
                        }
                        //   (!listHargaValues.map((list) => list.unit).includes(u.id.toString()) &&
                        //   !listHargaValues[index].unit)
                      )
                      .map((unit) => ({
                        value: unit.id.toString(),
                        label: unit.unit
                      }))}
                    placeholder="Pilih unit"
                    name={`listHarga.${index}.unit`}
                    className="w-24"
                  />
                  <InputNumber
                    label="Harga"
                    name={`listHarga.${index}.harga`}
                    fieldClassName="w-40"
                  />
                  <div className={cn(isEdit ? 'block' : 'flex items-end')}>
                    {listHargaValues[index].hargaLain.map((_fieldLain, indexLain) => {
                      return (
                        <div className="relative flex items-end">
                          <InputNumber
                            label={'Harga Lain ' + (indexLain + 1)}
                            name={`listHarga.${index}.hargaLain.${indexLain}`}
                            fieldClassName="w-40"
                          />
                          <Button
                            className="!w-max !h-max px-2"
                            variant={'destructive'}
                            onClick={() => removeHargaLain(index, indexLain)}
                          >
                            <Delete />
                          </Button>
                        </div>
                      )
                    })}
                    <div className={cn('flex gap-2 items-end', isEdit && 'mt-2')}>
                      <Button
                        onClick={() => {
                          //   update(index, { ...field, hargaLain: [...field.hargaLain, 0] })
                          //   console.log(field, 'field')
                          addNewHargaLain(index)
                        }}
                      >
                        <PlusCircle /> Harga lain
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => remove(index)}
                        disabled={listHargaValues.length < 2}
                      >
                        <Delete /> Hapus unit
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
            <Button
              type="button"
              className="mt-3"
              onClick={() => append({ unit: '', harga: 0, hargaLain: [0] })}
              disabled={listHargaValues.length === unitData.length}
            >
              {' '}
              <PlusCircle /> Tambah unit
            </Button>
          </div>

          <Button type="submit" className="my-4 w-full mx-auto !h-10">
            {isEdit ? 'Update Barang' : 'Input Barang'}
          </Button>
        </form>
      </FormProvider>
    </div>
  )
}

export default FormBarang
