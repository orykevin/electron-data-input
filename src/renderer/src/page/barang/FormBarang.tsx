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
import { cn, formatWithThousandSeparator } from '@/lib/utils'

type Props = {
  type?: 'edit'
  selectedBarang?: DataBarang[number]
  setBarangs: React.Dispatch<SetStateAction<DataBarang | []>>
  setSelectedBarangId?: React.Dispatch<React.SetStateAction<number | null>>
  onSuccess?: () => void
}

const schema = z.object({
  kode: z.string().min(1, { message: 'Kode harus diisi' }),
  nama: z.string().min(1, { message: 'Nama harus diisi' }),
  modal: z.number(),
  // unit: z.string(),
  listHarga: z.array(
    z.object({
      unit: z.string(),
      harga: z.number(),
      hargaLain: z.array(
        z.object({
          id: z.number().optional(),
          mode: z.enum(['harga_tetap', 'persen_harga', 'persen_modal']),
          nilai: z.number()
        })
      )
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

const FormBarang = ({ setBarangs, selectedBarang, type, setSelectedBarangId, onSuccess }: Props) => {
  const { data: unitData } = useAllUnit()

  const defaultValues: FormDataBarang = selectedBarang
    ? {
        kode: selectedBarang.kode,
        nama: selectedBarang.nama,
        modal: selectedBarang.modal,
        stockAwal: selectedBarang.stockAwal,
        stockMasuk: selectedBarang?.stokMasuk || 0,
        stockKeluar: selectedBarang?.stokKeluar || 0,
        listHarga: selectedBarang.unitBarang.map((u) => ({
          unit: u.unit?.id.toString() || '1',
          harga: u.harga?.harga | 0,
          hargaLain: u.hargaLain.map((h) => ({
            id: h.id,
            mode: (h.mode as 'harga_tetap' | 'persen_harga' | 'persen_modal') || 'harga_tetap',
            nilai: h.nilai !== undefined && h.nilai !== null ? h.nilai : (h.harga || 0)
          }))
        }))
      }
    : {
        kode: '',
        nama: '',
        modal: 0,
        stockAwal: 0,
        listHarga: [{ unit: unitData[0]?.id.toString() || '1', harga: 0, hargaLain: [{ mode: 'harga_tetap' as const, nilai: 0 }] }],
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
              const idx = newArray.findIndex((b) => b.id === result.id)
              if (idx !== -1) {
                newArray[idx] = {
                  ...result,
                  stokKeluar: result.stockKeluar,
                  stokMasuk: result.stockMasuk
                }
              }
              return newArray
            })
            setSelectedBarangId && setSelectedBarangId(null)
            onSuccess && onSuccess()
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
            onSuccess && onSuccess()
          }
        })
        .catch((err) => {
          console.log(err, 'error')
        })
    }
  }

  const listHargaValues = form.watch('listHarga')

  const addNewHargaLain = (index) => {
    form.setValue(`listHarga.${index}.hargaLain`, [...listHargaValues[index].hargaLain, { mode: 'harga_tetap', nilai: 0 }])
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
                  <div className={cn(isEdit ? 'block' : 'flex items-end', 'gap-3')}>
                    <div className="flex flex-col gap-2">
                      {listHargaValues[index].hargaLain.map((_fieldLain, indexLain) => {
                        return (
                          <div className="relative flex items-end gap-2 bg-gray-50/50 p-2 border border-dashed rounded-lg" key={indexLain}>
                            <SelectFormInput
                              label="Tipe Harga"
                              name={`listHarga.${index}.hargaLain.${indexLain}.mode`}
                              placeholder="Tipe"
                              className="w-36 h-9"
                              options={[
                                { value: 'harga_tetap', label: 'Harga Tetap' },
                                { value: 'persen_harga', label: '% dari Harga' },
                                { value: 'persen_modal', label: '% dari Modal' }
                              ]}
                            />
                            <InputNumber
                              label="Nilai"
                              name={`listHarga.${index}.hargaLain.${indexLain}.nilai`}
                              fieldClassName="w-28"
                            />
                            <div className="flex flex-col mb-1 text-[11px] text-gray-500 min-w-[100px] leading-tight">
                              <span className="font-semibold text-gray-400">Estimasi:</span>
                              <span className="font-mono text-blue-600 font-semibold">
                                {(() => {
                                  const mode = form.watch(`listHarga.${index}.hargaLain.${indexLain}.mode`)
                                  const nilai = form.watch(`listHarga.${index}.hargaLain.${indexLain}.nilai`) || 0
                                  const baseHarga = form.watch(`listHarga.${index}.harga`) || 0
                                  const modal = form.watch(`modal`) || 0
                                  let est = 0
                                  if (mode === 'harga_tetap') est = nilai
                                  else if (mode === 'persen_harga') est = baseHarga + Math.round((baseHarga * nilai) / 100)
                                  else if (mode === 'persen_modal') est = modal + Math.round((modal * nilai) / 100)
                                  return `Rp ${formatWithThousandSeparator(est)}`
                                })()}
                              </span>
                            </div>
                            <Button
                              type="button"
                              className="!w-max px-2 h-9 self-end"
                              variant={'destructive'}
                              onClick={() => removeHargaLain(index, indexLain)}
                            >
                              <Delete className="w-4 h-4" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                    <div className={cn('flex gap-2 items-end', isEdit && 'mt-2')}>
                      <Button
                        type="button"
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
              onClick={() => append({ unit: '', harga: 0, hargaLain: [{ mode: 'harga_tetap', nilai: 0 }] })}
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
