import { DataBarang } from '@/dbFunctions/barang'
import { Column, DefaultCellTypes, Row } from '@silevis/reactgrid'
import React, { useEffect, useState } from 'react'

type DataFullBarang = DataBarang[number] & {
  selectedUnit: string | undefined
  isUnitOpen: boolean | undefined
  selectedHargaLain: boolean | undefined
  isHargaLainOpen: boolean | undefined
}

const columnMap = {
  kode: 'Kode Barang',
  nama: 'Nama Barang',
  unit: 'Unit',
  harga: 'Harga',
  hargaLain: 'Harga Lain',
  stokAkhir: 'Stok Akhir'
}

type ColumnId = keyof typeof columnMap

const getColumns = (): Column[] => [
  { columnId: 'kode', width: 120, resizable: true, reorderable: true },
  { columnId: 'nama', width: 300, resizable: true, reorderable: true },
  { columnId: 'unit', width: 100, resizable: true, reorderable: true },
  { columnId: 'harga', width: 240, resizable: true, reorderable: true },
  { columnId: 'hargaLain', width: 100, resizable: true, reorderable: true },
  { columnId: 'stokAkhir', width: 240, resizable: true, reorderable: true }
]

const typesRow = {
  kode: 'inputChange',
  nama: 'inputChange',
  unit: 'dropdown',
  harga: 'number',
  hargaLain: 'dropdown',
  stokAkhir: 'number'
}

const getDataRow = (data: DataFullBarang, columnId: ColumnId) => {
  const selectedIndex = data.unitBarang.findIndex((u) => u.id.toString() === data.selectedUnit)

  switch (columnId) {
    case 'kode':
      return { text: data.kode || '' }
    case 'nama':
      return { text: data.nama || '' }
    case 'unit':
      return {
        selectedValue: data.unitBarang[selectedIndex].id,
        values: data.unitBarang.map((u) => ({
          label: u.unit?.unit,
          value: u.id.toString()
        }))
      }
    case 'harga':
      return { value: data.unitBarang[selectedIndex] || 0 }
    case 'hargaLain':
      return {
        selectedValue: data.unitBarang[selectedIndex]?.hargaLain[0]?.id || null,
        values: data.unitBarang[selectedIndex]?.hargaLain.map((u) => ({
          label: u.harga || '',
          value: u.id.toString()
        }))
      }
    default:
      return {}
  }
}

const getRows = (data: DataFullBarang[], columnsOrder: ColumnId[], disabled?: boolean): Row[] => [
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

const DialogBarangTabel = () => {
  const [data, setData] = useState<DataFullBarang[]>([])

  useEffect(() => {}, [])

  return <div></div>
}

export default DialogBarangTabel
