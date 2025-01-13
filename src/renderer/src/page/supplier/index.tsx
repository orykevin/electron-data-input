import FormInput from '@/components/form-input'
import HeaderBase from '@/components/header-base'
import { EditCell, EditTemplateCell } from '@/components/tablelib/CellTemplates/EditTemplate'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

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
import DialogUpdateSupplier from './DialogUpdateSupplier'
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  SupplierData,
  updateSupplier
} from '@/dbFunctions/supplier'

export const formSchema = z.object({
  kode: z.string(),
  nama: z.string().min(1, { message: 'Nama harus di isi' }),
  alamat: z.string(),
  deskripsi: z.string()
})

export type PelanganFormData = z.infer<typeof formSchema>

export type DataSupplierFull = SupplierData[number] & {}

const columnMap = {
  kode: 'Kode',
  nama: 'Nama',
  alamat: 'Alamat',
  deskripsi: 'Deskripsi',
  editBarang: ''
}

type ColumnId = keyof typeof columnMap

const getColumns = (): Column[] => [
  { columnId: 'kode', width: 80, resizable: true, reorderable: true },
  { columnId: 'nama', width: 300, resizable: true, reorderable: true },
  { columnId: 'alamat', width: 500, resizable: true, reorderable: true },
  { columnId: 'deskripsi', width: 240, resizable: true, reorderable: true },
  { columnId: 'editBarang', width: 40, resizable: true, reorderable: true }
]

const typesRow = {
  kode: 'text',
  nama: 'text',
  alamat: 'text',
  deskripsi: 'text',
  editBarang: 'edit'
}

const getDataRow = (data: DataSupplierFull, columnId: ColumnId) => {
  switch (columnId) {
    case 'kode':
      return { text: data.kode || '' }
    case 'nama':
      return { text: data.nama || '' }
    case 'alamat':
      return { text: data.alamat || '' }
    case 'deskripsi':
      return { text: data?.deskripsi || '' }
    case 'editBarang':
      return { text: data.id.toString(), openedId: 0 }
    default:
      return {}
  }
}

const getRows = (data: DataSupplierFull[], columnsOrder: ColumnId[], disabled?: boolean): Row[] => [
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

const reorderArray = <T extends {}>(arr: T[], idxs: number[], to: number) => {
  const movedElements = arr.filter((_, idx) => idxs.includes(idx))
  const targetIdx =
    Math.min(...idxs) < to ? (to += 1) : (to -= idxs.filter((idx) => idx < to).length)
  const leftSide = arr.filter((_, idx) => idx < targetIdx && !idxs.includes(idx))
  const rightSide = arr.filter((_, idx) => idx >= targetIdx && !idxs.includes(idx))
  return [...leftSide, ...movedElements, ...rightSide]
}

const SupplierPage = () => {
  const { data: userData } = useUser()

  const [data, setData] = React.useState<DataSupplierFull[]>([])
  const [columns, setColumns] = React.useState<Column[]>(getColumns())
  const [isEditable, setIsEditable] = React.useState(true)
  const [selectedIds, setSelectedIds] = React.useState<number | null>(null)
  const selectedSupplier = data.find((d) => d.id === selectedIds) || null

  const [cellChangesIndex, setCellChangesIndex] = React.useState(() => -1)
  const [cellChanges, setCellChanges] = React.useState<CellChange[][]>(() => [])

  const form = useForm({
    defaultValues: { kode: '', nama: '', alamat: '', deskripsi: '' },
    resolver: zodResolver(formSchema)
  })

  console.log(data, 'data')

  useEffect(() => {
    getSupplier().then((res) => {
      setData(res)
    })
  }, [])

  const onSubmit = async (value: PelanganFormData) => {
    console.log(value)
    // createUser(value.username, value.password, value.isAdmin).then(({ password, ...rest }) => {
    //   setListAkun((prev) => [...prev, rest])
    // })
    createSupplier(value).then(({ updateAt, deletedAt, ...res }) => {
      setData((prev) => [...prev, res])
    })
    form.reset()
  }

  const rows = getRows(
    data,
    columns.map((c) => c.columnId as ColumnId),
    !isEditable
  )

  const applyNewValue = (
    changes: CellChange<DefaultCellTypes | EditCell>[],
    prevData: DataSupplierFull[],
    usePrevValue: boolean = false
  ): DataSupplierFull[] => {
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
        updateSupplier(dataRow.id, { [fieldName]: change.newCell.text }).then((res) => {
          setData((prev) => prev.map((d) => (d.id === dataIndex ? res : d)))
        })
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
    prevData: DataSupplierFull[]
  ): DataSupplierFull[] => {
    const updated = applyNewValue(changes, prevData)
    setCellChanges([...cellChanges.slice(0, cellChangesIndex + 1), changes])
    setCellChangesIndex(cellChangesIndex + 1)
    return updated
  }

  const handleChanges = (changes: CellChange[]) => {
    setData((prevData) => applyChangesToData(changes, prevData))
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
    setData((prevData) => {
      const to = data.findIndex((data) => data.id === targetRowId)
      const rowsIds = rowIds.map((id) => data.findIndex((data) => data.id === id))
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
            deleteSupplier(selectedRowIds as number[])
            setData((prevData) => {
              return [...prevData.filter((data) => !selectedRowIds.includes(data.id))]
            })
          }
        }
      ]
    }
    return menuOptions
  }

  const undoChanges = (changes: CellChange[], prevData: DataSupplierFull[]): DataSupplierFull[] => {
    const updated = applyNewValue(changes, prevData, true)
    setCellChangesIndex(cellChangesIndex - 1)
    return updated
  }

  const redoChanges = (changes: CellChange[], prevData: DataSupplierFull[]): DataSupplierFull[] => {
    const updated = applyNewValue(changes, prevData)
    setCellChangesIndex(cellChangesIndex + 1)
    return updated
  }

  const handleUndoChanges = () => {
    if (cellChangesIndex >= 0) {
      setData((prevData) => undoChanges(cellChanges[cellChangesIndex], prevData))
    }
  }

  const handleRedoChanges = () => {
    if (cellChangesIndex + 1 <= cellChanges.length - 1) {
      setData((prevData) => redoChanges(cellChanges[cellChangesIndex + 1], prevData))
    }
  }

  return (
    <div
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
          <HeaderBase>Buat supplier Baru</HeaderBase>
          <div className="space-y-1">
            <div className="flex gap-3 justify-start items-end">
              <FormInput name="kode" label="Kode supplier" fieldClassName="max-w-[240px]" />
              <FormInput name="nama" label="Nama supplier" />
            </div>
            <FormInput name="alamat" label="Alamat" />
            <FormInput name="deskripsi" label="Deskripsi" />
            <Button type="submit" className="!mt-3 w-full h-10">
              Buat supplier
            </Button>
          </div>
        </form>
      </FormProvider>
      <HeaderBase className="mt-6">List supplier</HeaderBase>
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
          edit: new EditTemplateCell()
        }}
      />
      {selectedSupplier && (
        <DialogUpdateSupplier
          selectedSupplier={selectedSupplier}
          setSelectedIds={setSelectedIds}
          setData={setData}
        />
      )}
    </div>
  )
}

export default SupplierPage
