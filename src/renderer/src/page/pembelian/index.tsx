import DateFormInput from '@/components/date-form-input'
import FormInput from '@/components/form-input'
import HeaderBase from '@/components/header-base'
import { SelectFormInput } from '@/components/select-form-input'
import { EditCell, EditTemplateCell } from '@/components/tablelib/CellTemplates/EditTemplate'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CellChange,
  Column,
  DefaultCellTypes,
  Id,
  MenuOption,
  ReactGrid,
  Row,
  SelectionMode
} from '@silevis/reactgrid'
import React, { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import z from 'zod'
import { getPembelian, Pembelian, savePembelian, updatePembelian } from '@/dbFunctions/pembelian'
import { Plus } from 'lucide-react'
import useAllSupplier from '@/store/useSupplierStore'
import {
  InputChange,
  InputChangeTemplate
} from '@/components/tablelib/CellTemplates/InputChangeTemplate'
import DialogBarangTabel from './DialogBarangTabel'
import DialogUpdateSupplier from '../supplier/DialogUpdateSupplier'
import { formatWithThousandSeparator, generateInvoceKode } from '@/lib/utils'
import InputNumber from '@/components/input-number'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '@/lib/hooks/use-toast'
import { LinkButtonIcon } from '@/components/ui/link-button'

export const formSchema = z.object({
  noInvoice: z.string().min(1, { message: 'No Invoice harus diisi' }),
  supplier: z.string().min(1, { message: 'Supplier harus diisi' }),
  tanggal: z.date(),
  jatuhTempo: z.date(),
  alamat: z.string(),
  deskripsi: z.string(),
  pajak: z.number(),
  diskon: z.number()
})

export type PembelianFormData = z.infer<typeof formSchema>

type PembelianDefault = Pembelian & {}

export type PembelianBarang = PembelianDefault['pembelianBarang'][number] & {
  isUnitSelectOpen: boolean | undefined
  unitSelected: string | undefined
  isHargaLainOpen: boolean | undefined
  hargaLainSelected: string | undefined
  namaBarang: string
}

export type DataPembelianBarang = PembelianBarang[]

export type DataPembelianFull = Pembelian

const columnMap = {
  kodeBarang: 'Kode Barang',
  namaBarang: 'Nama Barang',
  jumlah: 'Jumlah',
  unit: 'Unit',
  harga: 'Harga',
  total: 'Total',
  delete: ''
}

type ColumnId = keyof typeof columnMap

const getColumns = (): Column[] => [
  { columnId: 'kodeBarang', width: 120, resizable: true, reorderable: true },
  { columnId: 'namaBarang', width: 300, resizable: true, reorderable: true },
  { columnId: 'jumlah', width: 100, resizable: true, reorderable: true },
  { columnId: 'unit', width: 100, resizable: true, reorderable: true },
  { columnId: 'harga', width: 240, resizable: true, reorderable: true },
  { columnId: 'total', width: 240, resizable: true, reorderable: true },
  { columnId: 'delete', width: 40, resizable: false, reorderable: false }
]

const typesRow = {
  kodeBarang: 'inputChange',
  namaBarang: 'inputChange',
  jumlah: 'number',
  unit: 'dropdown',
  harga: 'number',
  total: 'number',
  delete: 'edit'
}

const reorderArray = <T extends {}>(arr: T[], idxs: number[], to: number) => {
  const movedElements = arr.filter((_, idx) => idxs.includes(idx))
  const targetIdx =
    Math.min(...idxs) < to ? (to += 1) : (to -= idxs.filter((idx) => idx < to).length)
  const leftSide = arr.filter((_, idx) => idx < targetIdx && !idxs.includes(idx))
  const rightSide = arr.filter((_, idx) => idx >= targetIdx && !idxs.includes(idx))
  return [...leftSide, ...movedElements, ...rightSide]
}

const PembelianPage = ({ mode }: { mode: 'baru' | 'edit' }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const { data: allSupplier, fetchData } = useAllSupplier()
  const [data, setData] = React.useState<DataPembelianFull | undefined>(undefined)
  const [listBarang, setListBarang] = React.useState<DataPembelianBarang>([])
  const [columns, setColumns] = React.useState<Column[]>(getColumns())
  const [selectedIds, setSelectedIds] = React.useState<number | null>(null)
  const [isCash, setIsCash] = React.useState(true)
  const [kodeSequence, setKodeSequence] = React.useState<number | null>(null)
  const [openBarang, setOpenBarang] = React.useState<null | {
    mode: 'kode' | 'nama'
    text: string
  }>(null)
  const [selectedSupplier, setSelectedSupplier] = React.useState<number | null>(null)

  const { toast } = useToast()
  const navigate = useNavigate()

  const [cellChangesIndex, setCellChangesIndex] = React.useState(() => -1)
  const [cellChanges, setCellChanges] = React.useState<CellChange[][]>(() => [])
  const param = useParams()

  const form = useForm({
    defaultValues: {
      noInvoice: data?.noInvoice || '',
      supplier: data?.supplierId?.toString() || '',
      tanggal: data?.tanggal || new Date(),
      jatuhTempo: data?.tanggalBayar || new Date(),
      alamat: allSupplier.find((unit) => unit.id === selectedSupplier)?.alamat || '',
      deskripsi: data?.deskripsi || '',
      pajak: data?.pajak || 0,
      diskon: data?.diskon || 0
    },
    resolver: zodResolver(formSchema)
  })

  const tanggalValue = form.watch('tanggal')
  const supplier = form.watch('supplier')
  const pajak = form.watch('pajak')
  const diskon = form.watch('diskon')

  useEffect(() => {
    if (isNaN(pajak)) form.setValue('pajak', 0)
  }, [pajak])
  useEffect(() => {
    if (isNaN(diskon)) form.setValue('diskon', 0)
  }, [diskon])

  useEffect(() => {
    if (selectedSupplier) {
      const supplierData = allSupplier.find((unit) => unit.id === selectedSupplier)
      if (supplierData) {
        form.setValue('supplier', supplierData.id.toString())
        form.setValue('alamat', supplierData?.alamat || '')
      }
    }
  }, [selectedSupplier, allSupplier])

  useEffect(() => {
    if (supplier) {
      const supplierData = allSupplier.find((unit) => unit.id.toString() === supplier)
      if (supplierData && supplierData.alamat) {
        form.setValue('alamat', supplierData.alamat)
      }
    }
  }, [supplier])

  useEffect(() => {
    if (isCash) {
      form.setValue('jatuhTempo', tanggalValue)
    }
  }, [tanggalValue, isCash])

  useEffect(() => {
    if (mode === 'edit') {
      getPembelian(Number(param.id)).then((res) => {
        if (res) {
          const { pembelianBarang } = res
          setData(res)
          setListBarang(
            pembelianBarang.map((unit) => ({
              ...unit,
              isUnitSelectOpen: false,
              unitSelected: unit.unitBarang?.id.toString() || '',
              isHargaLainOpen: false,
              hargaLainSelected: '',
              namaBarang: unit.unitBarang?.barang?.nama || ''
            }))
          )
          form.setValue('noInvoice', res?.noInvoice || '')
          form.setValue('deskripsi', res?.deskripsi || '')
          form.setValue('supplier', res?.supplierId?.toString() || '')
          form.setValue('tanggal', res?.tanggal || new Date())
          form.setValue('jatuhTempo', res?.tanggalBayar || new Date())
          form.setValue('diskon', res?.diskon || 0)
          form.setValue('pajak', res?.pajak || 0)
        }
      })
    } else {
      setData(undefined)
      setListBarang([])
      form.reset()
    }
    fetchData()
  }, [])

  const onSubmit = async (value: PembelianFormData) => {
    if (mode === 'baru') {
      if (!listBarang.length) {
        toast({ title: 'Error', description: 'Barang belum dipilih' })
        return
      }
      savePembelian(value, listBarang).then((res) => {
        console.log(res, 'res sub')
        if (res) {
          toast({ title: 'Success', description: 'Pembelian berhasil disimpan' })
          form.reset()
          setListBarang([])
          setData(undefined)
          setKodeSequence((prev) => {
            if (prev !== null) {
              form.setValue('noInvoice', generateInvoceKode((kodeSequence || prev) + 1))
              return prev + 1
            }
            return null
          })
        }
      })
    } else {
      updatePembelian(Number(param.id), value, listBarang).then((res) => {
        if (res) {
          toast({ title: 'Success', description: 'Perubahan Pembelian berhasil disimpan' })
          navigate('/histori-pembelian')
        }
      })
    }
  }

  const getDataRow = (data: PembelianBarang, columnId: ColumnId) => {
    const barang = data
    switch (columnId) {
      case 'kodeBarang':
        return { text: barang.unitBarang?.barang?.kode || '' }
      case 'namaBarang':
        return { text: barang?.namaBarang || barang.unitBarang?.barang?.nama || '' }
      case 'jumlah':
        return { value: barang.jumlah || 1 }
      case 'unit':
        return {
          selectedValue: barang.unitSelected || '',
          values: barang.unitBarang?.barang?.unitBarang.map((u) => ({
            label: u.unit?.unit,
            value: u.id?.toString() || '0'
          })),
          isOpen: barang.isUnitSelectOpen
        }
      case 'harga':
        return { value: barang.harga || 0 }
      case 'total':
        return { value: (barang.jumlah || 1) * (barang.harga || 0) || 0, nonEditable: true }
      case 'delete':
        return { text: data.id.toString(), openedId: data.id + 1, icon: 'delete' }
      default:
        return {}
    }
  }

  const getRows = (
    data: PembelianBarang[],
    columnsOrder: ColumnId[],
    disabled?: boolean
  ): Row[] => [
    {
      rowId: 'header',
      cells: columnsOrder.map((columnId) => ({ type: 'header', text: columnMap[columnId] }))
    },
    ...data.map<Row>((data) => ({
      rowId: data.id,
      reorderable: true,
      cells: columnsOrder.map((columnId) => ({
        type: typesRow[columnId],
        nonEditable: disabled,
        ...getDataRow(data, columnId)
      })) as DefaultCellTypes[]
    }))
  ]

  const rows = getRows(
    listBarang,
    columns.map((c) => c.columnId as ColumnId)
  )

  const applyNewValue = (
    changes: CellChange<DefaultCellTypes | InputChange | EditCell>[],
    prevData: DataPembelianBarang,
    _usePrevValue: boolean = false
  ): DataPembelianBarang => {
    changes.forEach((change) => {
      const dataIndex = change.rowId
      const columnId = change.columnId
      const fieldName = columnId as string

      let dataRow = prevData.find((d) => d.id === dataIndex)
      if (!dataRow) {
        return
      }

      if (change.type === 'text') {
        dataRow[fieldName] = change.newCell.text as never
        // updatePembelian(dataRow.id, { [fieldName]: change.newCell.text }).then((res) => {
        //   setData((prev) => prev.map((d) => (d.id === dataIndex ? res : d)))
        // })
      } else if (change.type === 'number') {
        dataRow[fieldName] = change.newCell.value as never
      } else if (change.type === 'inputChange') {
        if (change.columnId === 'kodeBarang') {
          setOpenBarang({ mode: 'kode', text: change.newCell.text })
          setIsOpen(true)
          setSelectedIds(dataRow.id)
        } else {
          setOpenBarang({ mode: 'nama', text: change.newCell.text })
          setIsOpen(true)
          setSelectedIds(dataRow.id)
        }
      } else if (change.type === 'dropdown') {
        if (
          change.newCell.selectedValue &&
          !change.newCell.isOpen &&
          change.newCell.selectedValue !== change.previousCell.selectedValue
        ) {
          dataRow[fieldName] = change.newCell.selectedValue as never
          dataRow.unitSelected = change.newCell.selectedValue as never
          dataRow.harga =
            dataRow.unitBarang?.barang?.unitBarang.find(
              (u) => u.id.toString() === change.newCell.selectedValue
            )?.harga?.harga || dataRow.harga
        }
        // dataRow[fieldName] = change.newCell.inputValue as never
        // CHANGED: set the isOpen property to the value received.
        dataRow.isUnitSelectOpen = change.newCell.isOpen as never
      } else if (change.type === 'edit') {
        prevData = prevData.filter((d) => d.id !== dataRow.id)
      } else {
        console.log('ERROR', change.type, dataRow[fieldName])
      }
    })
    return [...prevData]
  }

  const applyChangesToData = (
    changes: CellChange[],
    prevData: DataPembelianBarang
  ): DataPembelianBarang => {
    const updated = applyNewValue(changes, prevData)
    setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), changes])
    setCellChangesIndex(cellChangesIndex + 1)
    return updated
  }

  const handleChanges = (changes: CellChange[]) => {
    setListBarang((prevData) => applyChangesToData(changes, prevData))
  }

  const handleColumnResize = (ci: Id, width: number) => {
    setColumns((prevColumns) => {
      const columnIndex = prevColumns.findIndex((el) => el.columnId === ci)
      const resizedColumn = prevColumns[columnIndex]
      const updatedColumn = { ...resizedColumn, width }
      prevColumns[columnIndex] = updatedColumn
      return [...prevColumns]
    })
  }

  const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
    const to = columns.findIndex((column) => column.columnId === targetColumnId)
    const columnIdxs = columnIds.map((columnId) =>
      columns.findIndex((c) => c.columnId === columnId)
    )
    setColumns((prevColumns) => reorderArray(prevColumns, columnIdxs, to))
  }

  const handleRowsReorder = (targetRowId: Id, rowIds: Id[]) => {
    setListBarang((prevData) => {
      const to = listBarang.findIndex((data) => data.id === targetRowId)
      const rowsIds = rowIds.map((id) => listBarang.findIndex((data) => data.id === id))
      return reorderArray(prevData, rowsIds, to)
    })
  }

  const handleContextMenu = (
    selectedRowIds: Id[],
    _selectedColIds: Id[],
    selectionMode: SelectionMode,
    menuOptions: MenuOption[]
  ): MenuOption[] => {
    if (selectionMode === 'row') {
      menuOptions = [
        {
          id: 'removeData',
          label: 'Remove data',
          handler: () => {
            setListBarang((prevData) => {
              return [...prevData.filter((data) => !selectedRowIds.includes(data.id))]
            })
          }
        }
      ]
    }
    return menuOptions
  }

  const undoChanges = (
    changes: CellChange[],
    prevData: DataPembelianBarang
  ): DataPembelianBarang => {
    const updated = applyNewValue(changes, prevData, true)
    setCellChangesIndex(cellChangesIndex - 1)
    return updated
  }

  const redoChanges = (
    changes: CellChange[],
    prevData: DataPembelianBarang
  ): DataPembelianBarang => {
    const updated = applyNewValue(changes, prevData)
    setCellChangesIndex(cellChangesIndex + 1)
    return updated
  }

  const handleUndoChanges = () => {
    if (cellChangesIndex >= 0) {
      setListBarang((prevData) => undoChanges(cellChanges[cellChangesIndex], prevData))
    }
  }

  const handleRedoChanges = () => {
    if (cellChangesIndex + 1 <= cellChanges.length - 1) {
      setListBarang((prevData) => redoChanges(cellChanges[cellChangesIndex + 1], prevData))
    }
  }

  return (
    <div
      className="relative h-[calc(100vh-120px)]"
      onKeyDown={(e) => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 'z':
              handleUndoChanges()
              return
            case 'y':
              handleRedoChanges()
              return
          }
        }
      }}
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <HeaderBase>{mode === 'baru' ? 'Buat pembelian Baru' : 'Edit Pembelian'}</HeaderBase>
          <div className="space-y-1">
            <div className="flex gap-3 justify-start items-end">
              <FormInput name="noInvoice" label="No Invoice" fieldClassName="max-w-[150px]" />
              <SelectFormInput
                name="supplier"
                className="w-[200px]"
                label="Supplier"
                placeholder="Pilih supplier"
                options={allSupplier.map((p) => ({ value: p.id.toString(), label: p.nama }))}
                additionalComponent={
                  <div>
                    <Button className="text-xs" onClick={() => setSelectedSupplier(0)}>
                      <Plus /> Tambah Supplier Baru
                    </Button>
                  </div>
                }
              />
              <DateFormInput label="Tanggal Pembelian" name="tanggal" />
              -
              <DateFormInput label="Tanggal Jatuh Tempo" disabled={isCash} name="jatuhTempo" />-
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="scale-150"
                  defaultChecked={isCash}
                  onChange={(e) => setIsCash(e.target.checked)}
                />
                Tunai
              </label>
            </div>
            <div className="flex gap-3 items-center">
              <FormInput name="alamat" label="Alamat" disabled />
              <FormInput name="deskripsi" label="Deskripsi" />
            </div>

            <div className="w-[calc(100%-324px)] h-max bg-white fixed bottom-0 border-2 border-gray-200 py-3 rounded-t-md shadow-sm z-[50]">
              <div className="flex gap-2 justify-between px-4">
                <div className="flex gap-3 items-center w-16">
                  <label className="min-w-max">Pajak (%) : </label>
                  <InputNumber name="pajak" />
                  <label className="min-w-max">Diskon (%) : </label>
                  <InputNumber name="diskon" />
                </div>
                <div className="flex gap-3 items-center">
                  <p className="text-[18px] font-semibold">
                    Sub Total:{' '}
                    {formatWithThousandSeparator(
                      listBarang.reduce((a, b) => a + b.jumlah * b.harga, 0) *
                        (1 - (diskon || 0) / 100)
                    )}
                  </p>
                  <p className="text-[18px] font-semibold">
                    Pajak:{' '}
                    {formatWithThousandSeparator(
                      listBarang.reduce((a, b) => a + b.jumlah * b.harga, 0) *
                        (1 - (diskon || 0) / 100) *
                        ((pajak || 0) / 100)
                    )}
                  </p>
                  <p className="text-sm font-bold">
                    Total:{' '}
                    {formatWithThousandSeparator(
                      listBarang.reduce((a, b) => a + b.jumlah * b.harga, 0) *
                        (1 - (diskon || 0) / 100) *
                        (1 + (pajak || 0) / 100)
                    )}
                  </p>
                </div>
              </div>
              <div className="flex justify-between px-4">
                <LinkButtonIcon to="/histori-pembelian" className="!mt-3 w-full h-10">
                  Batal
                </LinkButtonIcon>

                <Button type="submit" className="!mt-3 w-full h-10">
                  {mode === 'baru' ? 'Buat pembelian' : 'Simpan Pembelian'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
      <div className="w-full border border-gray-100 shadow-md my-4" />
      <div className="relative w-max pb-36">
        <ReactGrid
          rows={rows}
          columns={columns}
          onCellsChanged={handleChanges}
          onColumnResized={handleColumnResize}
          onColumnsReordered={handleColumnsReorder}
          onRowsReordered={handleRowsReorder}
          onContextMenu={handleContextMenu}
          enableRowSelection
          enableColumnSelection
          stickyTopRows={1}
          customCellTemplates={{
            edit: new EditTemplateCell(),
            inputChange: new InputChangeTemplate()
          }}
        />
        <div className="w-full border bg-white z-10 border-gray-100 shadow-md py-2 px-2 hover:bg-blue-200 focus-within:bg-blue-200 rounded-b-md">
          {' '}
          <button
            tabIndex={1}
            className="flex gap-2 items-center text-xs font-semibold w-full outline-none"
            type="button"
            onClick={() => {
              setIsOpen(true)
              setOpenBarang({ mode: 'kode', text: '' })
              setSelectedIds(null)
            }}
          >
            <Plus />
            Tambah Barang
          </button>
        </div>
      </div>
      <DialogBarangTabel
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setListBarang={setListBarang}
        openBarang={openBarang}
        setOpenBarang={setOpenBarang}
        selectedIds={selectedIds}
      />
      {selectedSupplier === 0 && (
        <DialogUpdateSupplier
          type="add"
          selectedSupplier={{
            id: 0,
            kode: '',
            nama: '',
            alamat: '',
            deskripsi: '',
            createdAt: new Date()
          }}
          setSelectedIds={setSelectedSupplier}
        />
      )}
    </div>
  )
}

export default PembelianPage
