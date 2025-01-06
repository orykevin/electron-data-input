import React from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import FormInput from '@/components/form-input'
import { Form } from 'react-router-dom'
import { SelectFormInput } from '@/components/select-form-input'
import { Button } from '@/components/ui/button'
import InputNumber from '@/components/input-number'
import { hargaLain } from 'src/db/schema'
import useAllUnit from '@/store/useUnitStore'
import { Delete, PlusCircle } from 'lucide-react'

const FormBarang = () => {
  const schema = z.object({
    kode: z.string(),
    nama: z.string(),
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
    stockAwal: z.number()
    // masuk: z.number(),
    // keluar: z.number()
  })

  const { data: unitData } = useAllUnit()

  type FormData = z.infer<typeof schema>

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      listHarga: [{ unit: unitData[0]?.id.toString() || '', harga: 0, hargaLain: [0] }]
    }
  })

  const { fields, append, remove, update } = useFieldArray({
    name: 'listHarga',
    control: form.control
  })

  const onSubmit = (data: FormData) => {
    console.log('test')
    console.log(data, 'test')
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

  console.log(listHargaValues, 'watch')

  return (
    <div className="mb-3 pb-4 border-b border-gray-200 shadow-sm">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex gap-3 mb-2">
            <FormInput label="Kode Barang" name="kode" />
            <FormInput label="Nama Barang" name="nama" />
            <InputNumber label="Modal" name="modal" />
            <InputNumber label="Stok Awal" name="stockAwal" />
          </div>
          <div>
            {fields.map((field, index) => {
              return (
                <div className="flex gap-3 items-end" key={field.id}>
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
                    fieldClassName="w-48"
                  />
                  {listHargaValues[index].hargaLain.map((fieldLain, indexLain) => {
                    return (
                      <div className="relative flex items-end">
                        <InputNumber
                          label={'Harga Lain ' + (indexLain + 1)}
                          name={`listHarga.${index}.hargaLain.${indexLain}`}
                          fieldClassName="w-48"
                        />
                        <Button
                          className="!w-max !h-max px-2 hover:bg-red-500"
                          onClick={() => removeHargaLain(index, indexLain)}
                        >
                          <Delete />
                        </Button>
                      </div>
                    )
                  })}
                  <Button
                    onClick={() => {
                      //   update(index, { ...field, hargaLain: [...field.hargaLain, 0] })
                      //   console.log(field, 'field')
                      addNewHargaLain(index)
                    }}
                  >
                    <PlusCircle /> Harga lain
                  </Button>
                  <Button onClick={() => remove(index)} disabled={listHargaValues.length < 2}>
                    <Delete /> Hapus
                  </Button>
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

          <Button type="submit" className="my-4">
            Submit
          </Button>
        </form>
      </FormProvider>
    </div>
  )
}

export default FormBarang
