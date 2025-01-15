import DateFormInput from '@/components/date-form-input'
import FormInput from '@/components/form-input'
import HeaderBase from '@/components/header-base'
import { SelectFormInput } from '@/components/select-form-input'
import { EditTemplateCell } from '@/components/tablelib/CellTemplates/EditTemplate'
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
import { getPenjualan, Penjualan } from '@/dbFunctions/penjualan'
import { Plus } from 'lucide-react'
import useAllPelanggan from '@/store/usePelangganStore'
import {
  InputChange,
  InputChangeTemplate
} from '@/components/tablelib/CellTemplates/InputChangeTemplate'
import DialogBarangTabel from './DialogBarangTabel'

export const formSchema = z.object({
  noInvoice: z.string(),
  pelanggan: z.string(),
  tanggal: z.date(),
  jatuhTempo: z.date(),
  alamat: z.string(),
  deskripsi: z.string()
})

export type PenjualanFormData = z.infer<typeof formSchema>

type PenjualanDefault = Penjualan & {}

export type PenjualanBarang = PenjualanDefault['penjualanBarang'][number] & {
  isUnitSelectOpen: boolean | undefined
  unitSelected: string | undefined
  isHargaLainOpen: boolean | undefined
  hargaLainSelected: string | undefined
  namaBarang: string
}

export type DataPenjualanBarang = PenjualanBarang[]

export type DataPenjualanFull = Penjualan

const columnMap = {
  kodeBarang: 'Kode Barang',
  namaBarang: 'Nama Barang',
  jumlah: 'Jumlah',
  unit: 'Unit',
  harga: 'Harga',
  total: 'Total'
}

type ColumnId = keyof typeof columnMap

const getColumns = (): Column[] => [
  { columnId: 'kodeBarang', width: 120, resizable: true, reorderable: true },
  { columnId: 'namaBarang', width: 300, resizable: true, reorderable: true },
  { columnId: 'jumlah', width: 100, resizable: true, reorderable: true },
  { columnId: 'unit', width: 100, resizable: true, reorderable: true },
  { columnId: 'harga', width: 240, resizable: true, reorderable: true },
  { columnId: 'total', width: 240, resizable: true, reorderable: true }
]

const typesRow = {
  kodeBarang: 'inputChange',
  namaBarang: 'inputChange',
  jumlah: 'number',
  unit: 'dropdown',
  harga: 'number',
  total: 'number'
}

const reorderArray = <T extends {}>(arr: T[], idxs: number[], to: number) => {
  const movedElements = arr.filter((_, idx) => idxs.includes(idx))
  const targetIdx =
    Math.min(...idxs) < to ? (to += 1) : (to -= idxs.filter((idx) => idx < to).length)
  const leftSide = arr.filter((_, idx) => idx < targetIdx && !idxs.includes(idx))
  const rightSide = arr.filter((_, idx) => idx >= targetIdx && !idxs.includes(idx))
  return [...leftSide, ...movedElements, ...rightSide]
}

const PenjualanPage = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const { data: allPelanggan, fetchData, initialized } = useAllPelanggan()
  const [data, setData] = React.useState<DataPenjualanFull | undefined>(undefined)
  const [listBarang, setListBarang] = React.useState<DataPenjualanBarang>([])
  const [columns, setColumns] = React.useState<Column[]>(getColumns())
  const [isEditable, setIsEditable] = React.useState(true)
  const [selectedIds, setSelectedIds] = React.useState<number | null>(null)
  const [isCash, setIsCash] = React.useState(true)
  const [openBarang, setOpenBarang] = React.useState<null | {
    mode: 'kode' | 'nama'
    text: string
  }>(null)

  const [cellChangesIndex, setCellChangesIndex] = React.useState(() => -1)
  const [cellChanges, setCellChanges] = React.useState<CellChange[][]>(() => [])

  const form = useForm({
    defaultValues: {
      noInvoice: '',
      pelanggan: '',
      tanggal: new Date(),
      jatuhTempo: new Date(),
      alamat: '',
      deskripsi: ''
    },
    resolver: zodResolver(formSchema)
  })

  const tanggalValue = form.watch('tanggal')
  const pelanggan = form.watch('pelanggan')

  useEffect(() => {
    if (pelanggan) {
      const pelangganData = allPelanggan.find((unit) => unit.id.toString() === pelanggan)
      if (pelangganData && pelangganData.alamat) {
        form.setValue('alamat', pelangganData.alamat)
      }
    }
  }, [pelanggan])

  useEffect(() => {
    if (isCash) {
      form.setValue('jatuhTempo', tanggalValue)
    }
  }, [tanggalValue, isCash])

  useEffect(() => {
    getPenjualan(1).then((res) => {
      if (res) {
        const { penjualanBarang } = res
        setData(res)
        setListBarang(
          penjualanBarang.map((unit) => ({
            ...unit,
            isUnitSelectOpen: false,
            unitSelected: unit.unitBarang?.id.toString() || '',
            isHargaLainOpen: false,
            hargaLainSelected: '',
            namaBarang: unit.unitBarang?.barang?.nama || ''
          }))
        )
      }
    })
    if (!initialized) fetchData()
  }, [])

  console.log(form.formState.errors)

  const onSubmit = async (value: PenjualanFormData) => {
    // createUser(value.username, value.password, value.isAdmin).then(({ password, ...rest }) => {
    //   setListAkun((prev) => [...prev, rest])
    // })
    // createPenjualan(value).then(({ updateAt, deletedAt, ...res }) => {
    //   setData((prev) => [...prev, res])
    // })
    // form.reset()
  }

  const getDataRow = (data: PenjualanBarang, columnId: ColumnId) => {
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
      default:
        return {}
    }
  }

  const getRows = (
    data: PenjualanBarang[],
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
    columns.map((c) => c.columnId as ColumnId),
    !isEditable
  )

  const applyNewValue = (
    changes: CellChange<DefaultCellTypes | InputChange>[],
    prevData: DataPenjualanBarang,
    usePrevValue: boolean = false
  ): DataPenjualanBarang => {
    if (usePrevValue) console.log(usePrevValue)
    changes.forEach((change) => {
      const dataIndex = change.rowId
      const columnId = change.columnId
      const fieldName = columnId as string

      let dataRow = prevData.find((d) => d.id === dataIndex)
      if (!dataRow) {
        return
      }

      console.log(change, 'change')
      if (change.type === 'text') {
        dataRow[fieldName] = change.newCell.text as never
        // updatePenjualan(dataRow.id, { [fieldName]: change.newCell.text }).then((res) => {
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
          if (fieldName === 'selectedUnitId') {
            // const defaultHargaLain =
            //   dataRow.unitSelected ===
            // ?.unit.hargaLain[0]?.id.toString() || '0'
          }
        }
        // dataRow[fieldName] = change.newCell.inputValue as never
        // CHANGED: set the isOpen property to the value received.
        dataRow.isUnitSelectOpen = change.newCell.isOpen as never
      } else {
        console.log('ERROR', change.type, dataRow[fieldName])
      }
    })
    return [...prevData]
  }

  const applyChangesToData = (
    changes: CellChange[],
    prevData: DataPenjualanBarang
  ): DataPenjualanBarang => {
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
    prevData: DataPenjualanBarang
  ): DataPenjualanBarang => {
    const updated = applyNewValue(changes, prevData, true)
    setCellChangesIndex(cellChangesIndex - 1)
    return updated
  }

  const redoChanges = (
    changes: CellChange[],
    prevData: DataPenjualanBarang
  ): DataPenjualanBarang => {
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
          <HeaderBase>Buat penjualan Baru</HeaderBase>
          <div className="space-y-1">
            <div className="flex gap-3 justify-start items-end">
              <FormInput name="noInvoice" label="No Invoice" fieldClassName="max-w-[150px]" />
              <SelectFormInput
                name="pelanggan"
                className="w-[200px]"
                label="Pelanggan"
                placeholder="Pilih pelanggan"
                options={allPelanggan.map((p) => ({ value: p.id.toString(), label: p.nama }))}
                additionalComponent={
                  <div>
                    <Button className="text-xs" onClick={() => alert('click')}>
                      <Plus /> Tambah Pelanggan Baru
                    </Button>
                  </div>
                }
              />
              <DateFormInput label="Tanggal Penjualan" name="tanggal" />
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
              <FormInput name="alamat" label="Alamat" />
              <FormInput name="deskripsi" label="Deskripsi" />
            </div>

            <div className="w-[calc(100vw-324px)] bg-red-500 fixed bottom-0 border-2 border-gray-500 h-16">
              <Button type="submit" className="!mt-3 w-full h-10">
                Buat penjualan
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
      <div className="w-full border border-gray-100 shadow-md my-4" />
      <div className="relative w-max">
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
        <div className="w-full border border-gray-100 shadow-md py-2 px-2 hover:bg-blue-200 focus-within:bg-blue-200 rounded-b-md">
          {' '}
          <button
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
    </div>
  )
}

export default PenjualanPage
