import * as React from 'react'
import {
  ReactGrid,
  Column,
  Row,
  CellChange,
  Id,
  DefaultCellTypes,
  MenuOption,
  SelectionMode
} from '@silevis/reactgrid'
import '@silevis/reactgrid/styles.css'
import { DataBarang } from '@/dbFunctions/barang'
import { formatWithThousandSeparator } from '@/lib/utils'
import { EditTemplateCell } from '@/components/tablelib/CellTemplates/EditTemplate'

type DataBarangFull = DataBarang[number] & {
  hargaLainId: string | undefined
  hargaLainOpen: boolean | undefined
  selectedUnitId: string | undefined
  selectedUnitOpen: boolean | undefined
}

type Props = {
  barangs: DataBarang
  isEditable: boolean
}

const columnMap = {
  kode: 'Kode',
  nama: 'Nama',
  unit: 'Unit',
  modal: 'Modal',
  harga: 'Harga',
  hargaLain: 'Harga Lain',
  stockAwal: 'Stock Awal',
  masuk: 'Masuk',
  keluar: 'Keluar',
  stockAkhir: 'Stock Akhir',
  editBarang: ''
}

type ColumnId = keyof typeof columnMap

// const getData = (): RowData[] =>
//   Array.from({ length: 100 }, (_, i) => i + 1).map((no) => ({
//     no,
//     kode: 'A-' + no,
//     nama: 'Budi',
//     harga: 100000,
//     supplier: 'Test supp',
//     hargaLain: '',
//     hargaOpen: false
//   }))

const getColumns = (): Column[] => [
  { columnId: 'kode', width: 80, resizable: true, reorderable: true },
  { columnId: 'nama', width: 300, resizable: true, reorderable: true },
  { columnId: 'unit', width: 80, resizable: true, reorderable: true },
  { columnId: 'modal', width: 120, resizable: true, reorderable: true },
  { columnId: 'harga', width: 120, resizable: true, reorderable: true },
  { columnId: 'hargaLain', width: 120, resizable: true, reorderable: true },
  { columnId: 'stockAwal', width: 100, resizable: true, reorderable: true },
  { columnId: 'masuk', width: 75, resizable: true, reorderable: true },
  { columnId: 'keluar', width: 75, resizable: true, reorderable: true },
  { columnId: 'stockAkhir', width: 100, resizable: true, reorderable: true },
  { columnId: 'editBarang', width: 40, resizable: true, reorderable: true }
]

const typesRow = {
  kode: 'text',
  nama: 'text',
  modal: 'number',
  unit: 'dropdown',
  harga: 'number',
  hargaLain: 'dropdown',
  stockAwal: 'number',
  masuk: 'number',
  keluar: 'number',
  stockAkhir: 'number',
  editBarang: 'edit'
}

const getDataRow = (data: DataBarangFull, columnId: ColumnId) => {
  const unitSelect = data.unitBarang.find((u) => u.unit?.id === Number(data.selectedUnitId))
  const unitOptions = data.unitBarang.map((u) => ({
    label: u.unit?.unit,
    value: u.unit?.id.toString()
  }))
  const hargaLainOptions = unitSelect?.unit?.hargaLain.map((h) => ({
    label: formatWithThousandSeparator(h.harga),
    value: h.id.toString()
  }))

  switch (columnId) {
    case 'kode':
      return { text: data.kode }
    case 'nama':
      return { text: data.nama }
    case 'unit':
      return {
        selectedValue: data.selectedUnitId,
        values: unitOptions,
        isOpen: data.selectedUnitOpen
      }
    case 'modal':
      return { value: data.modal }
    case 'harga':
      return {
        value: unitSelect?.unit?.harga[0]?.harga || 0
      }
    case 'hargaLain':
      return {
        selectedValue: data.hargaLainId,
        values: hargaLainOptions,
        isOpen: data.hargaLainOpen
      }
    case 'stockAwal':
      return { value: data.stockAwal }
    case 'masuk':
      return { value: 0, nonEditable: true }
    case 'keluar':
      return { value: 0, nonEditable: true }
    case 'stockAkhir':
      return { value: 0, nonEditable: true }
    case 'editBarang':
      return { text: data.id.toString(), openedId: 0 }
    default:
      return {}
  }
}

const getRows = (data: DataBarangFull[], columnsOrder: ColumnId[], disabled?: boolean): Row[] => [
  {
    rowId: 'header',
    cells: columnsOrder.map((columnId) => ({ type: 'header', text: columnMap[columnId] }))
  },
  ...data.map<Row>((data, idx) => ({
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

const TableBarang = ({ isEditable, barangs }: Props) => {
  const [data, setData] = React.useState<DataBarangFull[]>([])
  const [columns, setColumns] = React.useState<Column[]>(getColumns())

  const [cellChangesIndex, setCellChangesIndex] = React.useState(() => -1)
  const [cellChanges, setCellChanges] = React.useState<CellChange[][]>(() => [])

  React.useEffect(() => {
    const newData = barangs.map((barang) => ({
      ...barang,
      hargaLainId: barang.unitBarang[0]?.unit?.hargaLain[0].id.toString(),
      hargaLainOpen: false,
      selectedUnitId: barang.unitBarang[0]?.unit?.id.toString(),
      selectedUnitOpen: false
    }))
    setData(newData)
  }, [barangs])

  const rows = getRows(
    data,
    columns.map((c) => c.columnId as ColumnId),
    !isEditable
  )

  const applyNewValue = (
    changes: CellChange[],
    prevData: DataBarangFull[],
    usePrevValue: boolean = false
  ): DataBarangFull[] => {
    changes.forEach((change) => {
      const dataIndex = change.rowId
      const columnId = change.columnId

      let fieldName: string | null
      let openField: string | null

      switch (columnId) {
        case 'unit':
          openField = 'selectedUnitOpen'
          fieldName = 'selectedUnitId'
          break
        case 'hargaLain':
          openField = 'hargaLainOpen'
          fieldName = 'hargaLainId'
          break
        default:
          fieldName = columnId as string
          break
      }

      const cell = usePrevValue ? change.previousCell : change.newCell
      // prevData[dataIndex][fieldName] =
      //   cell.type === 'text' ? cell.text : cell.type === 'number' ? cell.value : 'test'
      let dataRow = prevData.find((d) => d.id === dataIndex)
      if (!dataRow) {
        // dataRow = getEmptyDataRow();
        // prevDetails.push(dataRow);
        return
      }
      console.log(change, 'change')
      if (change.type === 'text' && typeof dataRow[fieldName] === 'string') {
        dataRow[fieldName] = change.newCell.text as never
      } else if (change.type === 'number' && typeof dataRow[fieldName] === 'number') {
        dataRow[fieldName] = change.newCell.value as never
      } else if (change.type === 'checkbox' && typeof dataRow[fieldName] === 'boolean') {
        dataRow[fieldName] = change.newCell.checked as never
      } else if (change.type === 'dropdown') {
        if (
          change.newCell.selectedValue &&
          !change.newCell.isOpen &&
          change.newCell.selectedValue !== change.previousCell.selectedValue
        ) {
          dataRow[fieldName] = change.newCell.selectedValue as never
          if (fieldName === 'selectedUnitId') {
            const defaultHargaLain =
              dataRow.unitBarang
                .find((ub) => ub?.unit?.id.toString() === change.newCell.selectedValue)
                ?.unit?.hargaLain[0]?.id.toString() || '0'
            // ?.unit.hargaLain[0]?.id.toString() || '0'
            dataRow.hargaLainId = defaultHargaLain
          }
        }
        // dataRow[fieldName] = change.newCell.inputValue as never
        // CHANGED: set the isOpen property to the value received.
        dataRow[openField!] = change.newCell.isOpen as never
      } else {
        console.log('ERROR', change.type, dataRow[fieldName])
      }
    })
    return [...prevData]
  }

  const applyChangesToData = (
    changes: CellChange[],
    prevData: DataBarangFull[]
  ): DataBarangFull[] => {
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
    selectedColIds: Id[],
    selectionMode: SelectionMode,
    menuOptions: MenuOption[]
  ): MenuOption[] => {
    if (selectionMode === 'row') {
      menuOptions = [
        ...menuOptions,
        {
          id: 'removePerson',
          label: 'Remove data',
          handler: () => {
            setData((prevData) => {
              return [...prevData.filter((data, idx) => !selectedRowIds.includes(idx))]
            })
          }
        }
      ]
    }
    return menuOptions
  }

  const undoChanges = (changes: CellChange[], prevData: DataBarangFull[]): DataBarangFull[] => {
    const updated = applyNewValue(changes, prevData, true)
    setCellChangesIndex(cellChangesIndex - 1)
    return updated
  }

  const redoChanges = (changes: CellChange[], prevData: DataBarangFull[]): DataBarangFull[] => {
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
        customCellTemplates={{ edit: new EditTemplateCell() }}
      />
    </div>
  )
}

export default TableBarang
