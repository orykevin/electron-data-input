import { EditCell } from '@/components/tablelib/CellTemplates/EditTemplate'
import { TextEnter, TextEnterCell } from '@/components/tablelib/CellTemplates/TextEnter'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DataBarang, getQueryBarang } from '@/dbFunctions/barang'
import useDebounce from '@/lib/hooks/use-debounce'
import { CellChange, Column, DefaultCellTypes, Id, ReactGrid, Row } from '@silevis/reactgrid'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DataPenjualanBarang, PenjualanBarang } from '.'
import { set } from 'react-hook-form'

type Props = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  setListBarang: React.Dispatch<React.SetStateAction<DataPenjualanBarang>>
  openBarang: { mode: 'kode' | 'nama'; text: string } | null
  setOpenBarang: React.Dispatch<
    React.SetStateAction<{ mode: 'kode' | 'nama'; text: string } | null>
  >
  selectedIds: number | null
}

type DataFullBarang = DataBarang[number] & {
  selectedUnit: string | undefined
  isUnitOpen: boolean | undefined
  selectedHargaLain: string | undefined
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
  { columnId: 'kode', width: 200, resizable: true, reorderable: true },
  { columnId: 'nama', width: 400, resizable: true, reorderable: true },
  { columnId: 'unit', width: 100, resizable: true, reorderable: true },
  { columnId: 'harga', width: 240, resizable: true, reorderable: true },
  { columnId: 'hargaLain', width: 240, resizable: true, reorderable: true },
  { columnId: 'stokAkhir', width: 100, resizable: true, reorderable: true }
]

const typesRow = {
  kode: 'textEnter',
  nama: 'textEnter',
  unit: 'dropdown',
  harga: 'number',
  hargaLain: 'dropdown',
  stokAkhir: 'number'
}

const getDataRow = (data: DataFullBarang, columnId: ColumnId) => {
  const selectedIndex = data.unitBarang.findIndex((u) => u.id.toString() === data.selectedUnit)

  switch (columnId) {
    case 'kode':
      return { text: data?.kode || '', isSelected: false }
    case 'nama':
      return { text: data?.nama || '', isSelected: false }
    case 'unit':
      return {
        selectedValue: data.unitBarang[selectedIndex]?.id?.toString() || '',
        values:
          data?.unitBarang?.map((u) => ({
            label: u.unit?.unit,
            value: u.id.toString()
          })) || []
      }
    case 'harga':
      return { value: data.unitBarang[selectedIndex]?.harga?.harga || 0 }
    case 'hargaLain':
      return {
        selectedValue: data.unitBarang[selectedIndex]?.hargaLain[0]?.id.toString() || null,
        values:
          data.unitBarang[selectedIndex]?.hargaLain?.map((u) => ({
            label: u.harga || '',
            value: u.id.toString()
          })) || []
      }
    default:
      return {}
  }
}

const getRows = (data: DataFullBarang[], columnsOrder: ColumnId[]): Row[] => [
  {
    rowId: 'header',
    cells: columnsOrder.map((columnId) => ({ type: 'header', text: columnMap[columnId] }))
  },
  ...data.map<Row>((data) => ({
    rowId: data.id,
    reorderable: true,
    cells: columnsOrder.map((columnId) => ({
      type: typesRow[columnId],
      nonEditable: false,
      ...getDataRow(data, columnId)
    })) as DefaultCellTypes[]
  }))
]

const SearchComponent = ({
  setData,
  setMode,
  mode,
  defaultText
}: {
  setData: (res: DataBarang) => void
  setMode: React.Dispatch<React.SetStateAction<'kode' | 'nama' | null>>
  defaultText: string
  mode: 'kode' | 'nama'
}) => {
  const [searchKode, setSearchKode] = useState(mode === 'kode' ? defaultText : '')
  const [searchNama, setSearchNama] = useState(mode === 'nama' ? defaultText : '')
  const debounceSearchKode = useDebounce(searchKode, 250)
  const debounceSearchNama = useDebounce(searchNama, 250)
  const refKode = useRef<HTMLInputElement>(null)
  const refNama = useRef<HTMLInputElement>(null)

  const handleChangeData = (res: DataBarang) => {
    setData(
      res.map((d) => ({
        ...d,
        isUnitOpen: false,
        isHargaLainOpen: false,
        selectedUnit: d.unitBarang[0]?.id?.toString() || '',
        selectedHargaLain: d.unitBarang[0]?.hargaLain[0]?.id.toString() || ''
      }))
    )
  }

  useEffect(() => {
    if (mode === 'kode') refKode.current?.focus()
    if (mode === 'nama') refNama.current?.focus()
  }, [mode])

  useEffect(() => {
    if (searchKode !== '') {
      getQueryBarang(searchKode, 'kode').then((res) => {
        console.log(res, 'kode')
        setMode('kode')
        handleChangeData(res)
      })
    }
    if (searchNama !== '') {
      getQueryBarang(searchNama, 'nama').then((res) => {
        setMode('nama')
        handleChangeData(res)
      })
    }
  }, [debounceSearchKode, debounceSearchNama])

  return (
    <div className="flex gap-2">
      <Input
        className="w-[200px]"
        placeholder="Kode Barang"
        onChange={(e) => {
          setSearchKode(e.target.value)
          setSearchNama('')
        }}
        value={searchKode}
        ref={refKode}
      />
      <Input
        className="w-[400px]"
        placeholder="Nama Barang"
        onChange={(e) => {
          setSearchNama(e.target.value)
          setSearchKode('')
        }}
        value={searchNama}
        ref={refNama}
      />
    </div>
  )
}

const DialogBarangTabel = ({
  isOpen,
  setIsOpen,
  setListBarang,
  openBarang,
  setOpenBarang,
  selectedIds
}: Props) => {
  const [data, setData] = useState<DataFullBarang[]>([])
  const [mode, setMode] = useState<'kode' | 'nama' | null>(null)
  const [columns, setColumns] = React.useState<Column[]>(getColumns())

  const handleChangeData = (res: DataBarang) => {
    setData(
      res.map((d) => ({
        ...d,
        isUnitOpen: false,
        isHargaLainOpen: false,
        selectedUnit: d.unitBarang[0]?.id?.toString() || '',
        selectedHargaLain: d.unitBarang[0]?.hargaLain[0]?.id.toString() || ''
      }))
    )
  }

  useEffect(() => {
    if (openBarang && !mode) {
      setMode(openBarang.mode)
    }
    if (!openBarang && !mode) {
      getQueryBarang('', 'nama').then((res) => handleChangeData(res))
    }
  }, [openBarang, mode])

  // useEffect(() => {
  //   if (searchKode !== '') {
  //     getQueryBarang(searchKode).then((res) => {
  //       handleChangeData(res)
  //     })
  //   }
  //   if (searchNama !== '') {
  //     getQueryBarang(searchNama).then((res) => {
  //       handleChangeData(res)
  //     })
  //   }
  // }, [debounceSearchKode, debounceSearchNama])

  // const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
  //   if (type === 'kode') {
  //     setSearchKode(event.target.value)
  //   }
  //   if (type === 'nama') {
  //     setSearchNama(event.target.value)
  //   }
  // }

  const rows = useMemo(() => {
    return getRows(
      data,
      columns.map((c) => c.columnId as ColumnId)
    )
  }, [data])

  useEffect(() => {
    getQueryBarang('', 'nama').then((res) => handleChangeData(res))
  }, [])

  const applyNewValue = (
    changes: CellChange<DefaultCellTypes | TextEnter>[],
    prevData: DataFullBarang[],
    usePrevValue: boolean = false
  ): DataFullBarang[] => {
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
      if (change.type === 'textEnter') {
        if (change.newCell.isSelected) {
          const dataSelected = data.find((d) => d.id === change.rowId)
          // console.log(
          //   data.find((d) => d.id === change.rowId),
          //   'data'
          // ),
          console.log(dataSelected, 'dataSelected')
          if (dataSelected) {
            const unitBarang = dataSelected.unitBarang[0]
            if (selectedIds !== null) {
              setListBarang((prev) => {
                let listData = [...prev]
                const selectedBarangIdx = listData.findIndex((d) => d.id === selectedIds)
                if (selectedBarangIdx >= 0) {
                  const updatedData = listData[selectedBarangIdx]
                  listData[selectedBarangIdx] = {
                    ...updatedData,
                    unitBarang: {
                      barang: dataSelected,
                      harga: dataSelected.unitBarang[0]?.harga || null,
                      hargaLain: dataSelected.unitBarang[0]?.hargaLain || null,
                      id: dataSelected.unitBarang[0]?.id || 0,
                      unit: dataSelected.unitBarang[0]?.unit || null
                    },
                    namaBarang: dataSelected.nama,
                    unitSelected: dataSelected.unitBarang[0]?.id?.toString() || ''
                  }
                }
                console.log(listData, selectedBarangIdx, 'listDatass')
                return listData
              })
            } else {
              setListBarang((prev) => {
                const dataBarang: PenjualanBarang = {
                  id: 0 - prev.length,
                  harga: unitBarang?.harga?.harga || 0,
                  unitBarang: {
                    barang: dataSelected,
                    harga: unitBarang?.harga || null,
                    hargaLain: unitBarang?.hargaLain || null,
                    id: unitBarang?.id || 0,
                    unit: unitBarang?.unit || null
                  },
                  unitSelected: unitBarang.id?.toString() || '',
                  jumlah: 1,
                  hargaLainSelected: undefined,
                  isHargaLainOpen: false,
                  isUnitSelectOpen: false,
                  createdAt: new Date(),
                  namaBarang: dataSelected.nama
                }
                return [...prev, dataBarang!]
              })
            }
            setIsOpen(false)
            setMode(null)
            setOpenBarang(null)
          }
        } else {
          console.log('ERROR', change.type, dataRow[fieldName])
        }
      }
    })
    return [...prevData]
  }

  const applyChangesToData = (
    changes: CellChange[],
    prevData: DataFullBarang[]
  ): DataFullBarang[] => {
    const updated = applyNewValue(changes, prevData)
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

  console.log(mode, 'mode')

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(opened) => {
        if (!opened) {
          setIsOpen(false)
          setOpenBarang(null)
          setMode(null)
        }
      }}
    >
      <DialogContent className="w-max max-w-[100vw] max-h-[90vh] overflow-auto">
        <DialogHeader className="text-sm font-semibold">Pilih Barang</DialogHeader>
        {mode && openBarang && (
          <SearchComponent
            setData={handleChangeData}
            setMode={setMode}
            defaultText={openBarang?.text || ''}
            mode={mode}
          />
        )}
        <ReactGrid
          rows={rows}
          columns={columns}
          onCellsChanged={handleChanges}
          onColumnResized={handleColumnResize}
          enableRowSelection
          initialFocusLocation={{ rowId: data[0]?.id, columnId: mode || 'kode' }}
          // focusLocation={{ rowId: 5149, columnId: mode }}
          customCellTemplates={{
            textEnter: new TextEnterCell()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export default DialogBarangTabel
