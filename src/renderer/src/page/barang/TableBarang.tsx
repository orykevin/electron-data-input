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

interface RowData {
  no: number
  kode: string
  nama: string
  harga: number
  supplier: string
  hargaLain: string
  hargaOpen: boolean
}

interface ColumnMap {
  no: 'No.'
  kode: 'Kode'
  nama: 'Nama'
  harga: 'Harga'
  supplier: 'Supplier'
  hargaLain: 'Harga Lain'
}

const columnMap: ColumnMap = {
  no: 'No.',
  kode: 'Kode',
  nama: 'Nama',
  harga: 'Harga',
  supplier: 'Supplier',
  hargaLain: 'Harga Lain'
}

type ColumnId = keyof ColumnMap

const getData = (): RowData[] =>
  Array.from({ length: 100 }, (_, i) => i + 1).map((no) => ({
    no,
    kode: 'A-' + no,
    nama: 'Budi',
    harga: 100000,
    supplier: 'Test supp',
    hargaLain: '',
    hargaOpen: false
  }))

const getColumns = (): Column[] => [
  { columnId: 'no', width: 40 },
  { columnId: 'kode', width: 150, resizable: true, reorderable: true },
  { columnId: 'nama', width: 300, resizable: true, reorderable: true },
  { columnId: 'harga', width: 200, resizable: true, reorderable: true },
  { columnId: 'supplier', width: 200, resizable: true, reorderable: true },
  { columnId: 'hargaLain', width: 200, resizable: true, reorderable: true }
]

const typesRow = {
  no: 'number',
  kode: 'text',
  nama: 'text',
  harga: 'number',
  supplier: 'text',
  hargaLain: 'dropdown'
}

const getRows = (data: RowData[], columnsOrder: ColumnId[], disabled?: boolean): Row[] => [
  {
    rowId: 'header',
    cells: columnsOrder.map((columnId) => ({ type: 'header', text: columnMap[columnId] }))
  },
  ...data.map<Row>((data, idx) => ({
    rowId: data.no,
    reorderable: true,
    cells: columnsOrder.map((columnId) => ({
      nonEditable: columnId === 'no' ? true : disabled ? true : false,
      type: typesRow[columnId],
      ...(typesRow[columnId] === 'number'
        ? { value: data[columnId] }
        : typesRow[columnId] === 'text'
          ? { text: data[columnId] }
          : typesRow[columnId] === 'dropdown'
            ? {
                values: [
                  { label: `${idx + 1}`, value: `${idx + 1}` },
                  { label: `${idx + 2}`, value: `${idx + 2}` }
                ]
              }
            : null),
      ...(typesRow[columnId] === 'dropdown'
        ? {
            selectedValue: data.hargaLain,
            isDisabled: false,
            isOpen: data.hargaOpen
          }
        : {})
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

const TableBarang = ({ isEditable }: { isEditable: boolean }) => {
  const [data, setData] = React.useState<RowData[]>(getData())
  const [columns, setColumns] = React.useState<Column[]>(getColumns())

  const [cellChangesIndex, setCellChangesIndex] = React.useState(() => -1)
  const [cellChanges, setCellChanges] = React.useState<CellChange[][]>(() => [])

  const rows = getRows(
    data,
    columns.map((c) => c.columnId as ColumnId),
    !isEditable
  )

  const applyNewValue = (
    changes: CellChange[],
    prevData: RowData[],
    usePrevValue: boolean = false
  ): RowData[] => {
    changes.forEach((change) => {
      const dataIndex = change.rowId
      const fieldName = change.columnId
      const cell = usePrevValue ? change.previousCell : change.newCell
      console.log(change)
      // prevData[dataIndex][fieldName] =
      //   cell.type === 'text' ? cell.text : cell.type === 'number' ? cell.value : 'test'
      let dataRow = prevData.find((d) => d.no === dataIndex)
      if (!dataRow) {
        // dataRow = getEmptyDataRow();
        // prevDetails.push(dataRow);
        return
      }
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
        }
        // dataRow[fieldName] = change.newCell.inputValue as never
        // CHANGED: set the isOpen property to the value received.
        dataRow.hargaOpen = change.newCell.isOpen as never
      } else {
        console.log('ERROR', change.type, dataRow[fieldName])
      }
    })
    return [...prevData]
  }

  const applyChangesToData = (changes: CellChange[], prevData: RowData[]): RowData[] => {
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
      const to = data.findIndex((data) => data.no === targetRowId)
      const rowsIds = rowIds.map((id) => data.findIndex((data) => data.no === id))
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

  const undoChanges = (changes: CellChange[], prevData: RowData[]): RowData[] => {
    const updated = applyNewValue(changes, prevData, true)
    setCellChangesIndex(cellChangesIndex - 1)
    return updated
  }

  const redoChanges = (changes: CellChange[], prevData: RowData[]): RowData[] => {
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
      />
    </div>
  )
}

export default TableBarang
