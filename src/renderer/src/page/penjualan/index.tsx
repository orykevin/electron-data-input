import DateFormInput from '@/components/date-form-input'
import FormInput from '@/components/form-input'
import HeaderBase from '@/components/header-base'
import { SelectFormInput } from '@/components/select-form-input'
import { EditCell, EditTemplateCell } from '@/components/tablelib/CellTemplates/EditTemplate'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { parseDate } from '@internationalized/date'
import { AllUser, getAllUser } from '@/dbFunctions/user'
import { cn } from '@/lib/utils'
import useUser from '@/store/useUserStore'
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
import React, { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import z from 'zod'
import { getPenjualan, Penjualan } from '@/dbFunctions/penjualan'
import { Plus } from 'lucide-react'
import useAllPelanggan from '@/store/usePelangganStore'
import { InputChangeTemplate } from '@/components/tablelib/CellTemplates/InputChangeTemplate'
// import {
//   createPenjualan,
//   deletePenjualan,
//   getPenjualan,
//   PenjualanData,
//   updatePenjualan
// } from '@/dbFunctions/penjualan'

export const formSchema = z.object({
  kode: z.string(),
  nama: z.string().min(1, { message: 'Nama harus di isi' }),
  alamat: z.string(),
  deskripsi: z.string()
})

export type PelanganFormData = z.infer<typeof formSchema>

type PenjualanDefault = Penjualan & {}

export type PenjualanBarang = PenjualanDefault['penjualanBarang'][number] & {
  isUnitSelectOpen: boolean | undefined
  unitSelected: string | undefined
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

const getDataRow = (data: PenjualanBarang, columnId: ColumnId, index: number) => {
  const barang = data

  switch (columnId) {
    case 'kodeBarang':
      return { text: barang.unitBarang?.barang?.kode || '' }
    case 'namaBarang':
      return { text: barang.unitBarang?.barang?.nama || '' }
    case 'jumlah':
      return { value: barang.jumlah || 1 }
    case 'unit':
      return {
        selectedValue: barang.unitBarang?.id,
        values: barang.unitBarang?.barang?.unitBarang.map((u) => ({
          label: u.unit?.unit,
          value: u.id
        }))
      }
    case 'harga':
      return { value: barang.harga || 0 }
    case 'total':
      return { value: (barang.jumlah || 1) * (barang.harga || 0) || 0 }
    default:
      return {}
  }
}

const getRows = (data: PenjualanBarang[], columnsOrder: ColumnId[], disabled?: boolean): Row[] => [
  {
    rowId: 'header',
    cells: columnsOrder.map((columnId) => ({ type: 'header', text: columnMap[columnId] }))
  },
  ...data.map<Row>((data) => ({
    rowId: data.id,
    reorderable: true,
    cells: columnsOrder.map((columnId, index) => ({
      type: typesRow[columnId],
      nonEditable: disabled,
      ...getDataRow(data, columnId, index)
    })) as DefaultCellTypes[]
  }))
]

const reorderArray = <T extends {}>(arr: T[], idxs: number[], to: number) => {
  const movedElements = arr.filter((_, idx) => idxs.includes(idx))
  const targetIdx =
    Math.min(...idxs) < to ? (to += 1) : (to -= idxs.filter((idx) => idx < to).length)
  const leftSide = arr.filter((_, idx) => idx < targetIdx && !idxs.includes(idx))
  const rightSide = arr.filter((_, idx) => idx >= targetIdx && !idxs.includes(idx))
  return [...leftSide, ...movedElements, ...rightSide]
}

const PenjualanPage = () => {
  const { data: userData } = useUser()
  const { data: allPelanggan, fetchData, initialized } = useAllPelanggan()
  const [data, setData] = React.useState<DataPenjualanFull | undefined>(undefined)
  const [listBarang, setListBarang] = React.useState<DataPenjualanBarang>([])
  const [columns, setColumns] = React.useState<Column[]>(getColumns())
  const [isEditable, setIsEditable] = React.useState(true)
  const [selectedIds, setSelectedIds] = React.useState<number | null>(null)
  const [isCash, setIsCash] = React.useState(true)

  const [cellChangesIndex, setCellChangesIndex] = React.useState(() => -1)
  const [cellChanges, setCellChanges] = React.useState<CellChange[][]>(() => [])

  const form = useForm({
    defaultValues: { kode: '', nama: '', alamat: '', deskripsi: '' },
    resolver: zodResolver(formSchema)
  })

  useEffect(() => {
    getPenjualan(1).then((res) => {
      if (res) {
        const { penjualanBarang } = res
        setData(res)
        setListBarang(
          penjualanBarang.map((unit) => ({ ...unit, isUnitSelectOpen: false, unitSelected: '' }))
        )
      }
    })
    if (!initialized) fetchData()
  }, [])

  const onSubmit = async (value: PelanganFormData) => {
    console.log(value)
    // createUser(value.username, value.password, value.isAdmin).then(({ password, ...rest }) => {
    //   setListAkun((prev) => [...prev, rest])
    // })

    // createPenjualan(value).then(({ updateAt, deletedAt, ...res }) => {
    //   setData((prev) => [...prev, res])
    // })
    // form.reset()
  }

  const rows = getRows(
    listBarang,
    columns.map((c) => c.columnId as ColumnId),
    !isEditable
  )

  const applyNewValue = (
    changes: CellChange<DefaultCellTypes | EditCell>[],
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
      } else if (change.type === 'edit') {
        setSelectedIds(dataRow.id)
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
              <DateFormInput label="Tanggal Penjualan" />
              -
              <DateFormInput
                label="Tanggal Jatuh Tempo"
                disabled={isCash}
                defaultValue={parseDate('2025-01-01')}
              />
              -
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
            <FormInput name="deskripsi" label="Deskripsi" />
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
          >
            <Plus />
            Tambah Barang
          </button>
        </div>
      </div>
    </div>
  )
}

export default PenjualanPage
