import * as React from 'react'
import { createPortal } from 'react-dom'
import { Cell, CellTemplate, Compatible, Uncertain, UncertainCompatible } from '@silevis/reactgrid'
import { formatWithThousandSeparator } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface HargaSelectCell extends Cell {
  type: 'hargaSelect'
  value: number
  unitBarang: any
  unitSelected?: string
}

export class HargaSelectTemplate implements CellTemplate<HargaSelectCell> {
  getCompatibleCell(uncertainCell: Uncertain<HargaSelectCell>): Compatible<HargaSelectCell> {
    let value: number
    try {
      value = parseFloat(uncertainCell.value as any)
    } catch {
      value = 0
    }
    if (isNaN(value)) value = 0

    return {
      ...uncertainCell,
      value,
      text: formatWithThousandSeparator(value),
      unitBarang: uncertainCell.unitBarang,
      unitSelected: uncertainCell.unitSelected || ''
    }
  }

  update(
    cell: Compatible<HargaSelectCell>,
    cellToMerge: UncertainCompatible<HargaSelectCell>
  ): Compatible<HargaSelectCell> {
    return this.getCompatibleCell({
      ...cell,
      value: cellToMerge.value
    })
  }

  handleKeyDown(
    cell: Compatible<HargaSelectCell>,
    _keyCode: number,
    _ctrl: boolean,
    _shift: boolean,
    _alt: boolean,
    _key: string,
    _capsLock: boolean
  ): { cell: Compatible<HargaSelectCell>; enableEditMode: boolean } {
    return {
      cell,
      enableEditMode: true
    }
  }

  render(
    cell: Compatible<HargaSelectCell>,
    isInEditMode: boolean,
    onCellChanged: (cell: Compatible<HargaSelectCell>, commit: boolean) => void
  ): React.ReactNode {
    return (
      <HargaSelectInput
        cell={cell}
        isInEditMode={isInEditMode}
        onCellChanged={(updatedCell, commit) => onCellChanged(this.getCompatibleCell(updatedCell), commit)}
      />
    )
  }
}

interface HargaSelectInputProps {
  cell: Compatible<HargaSelectCell>
  isInEditMode: boolean
  onCellChanged: (cell: Compatible<HargaSelectCell>, commit: boolean) => void
}

const HargaSelectInput: React.FC<HargaSelectInputProps> = ({ cell, onCellChanged }) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [isOpen, setIsOpen] = React.useState(false)
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 })
  const [inputValue, setInputValue] = React.useState(formatWithThousandSeparator(cell.value))

  React.useEffect(() => {
    setInputValue(formatWithThousandSeparator(cell.value))
  }, [cell.value])

  const handleOpenDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
    setIsOpen(!isOpen)
  }

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('pointerdown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
    }
  }, [isOpen])

  // Extract pricing details
  const allUnits = cell.unitBarang?.barang?.unitBarang || []
  const selectedUnitConfig = allUnits.find((u: any) => u.id.toString() === cell.unitSelected) || cell.unitBarang
  const baseHarga = selectedUnitConfig?.harga?.harga || 0
  const modal = cell.unitBarang?.barang?.modal || 0
  const hargaLainList = selectedUnitConfig?.hargaLain || []

  // Build options
  const options: { label: string; value: number }[] = []

  // Standard Price
  options.push({
    label: `Harga Standar: Rp ${formatWithThousandSeparator(baseHarga)}`,
    value: baseHarga
  })

  // Extra Prices
  const calculatedHargaLainList = hargaLainList.map((u: any) => {
    let val = 0
    if (u.mode === 'harga_tetap') {
      val = u.nilai
    } else if (u.mode === 'persen_harga') {
      val = baseHarga + Math.round((baseHarga * u.nilai) / 100)
    } else if (u.mode === 'persen_modal') {
      val = modal + Math.round((modal * u.nilai) / 100)
    } else {
      val = u.harga || 0
    }

    let suffix = '(Harga Tetap)'
    if (u.mode === 'persen_harga') {
      const sign = u.nilai >= 0 ? '+' : ''
      suffix = `(${sign}${u.nilai}% dari Harga)`
    } else if (u.mode === 'persen_modal') {
      const sign = u.nilai >= 0 ? '+' : ''
      suffix = `(${sign}${u.nilai}% dari Modal)`
    }

    return {
      label: `Rp ${formatWithThousandSeparator(val)} ${suffix}`,
      value: val
    }
  })

  options.push(...calculatedHargaLainList)

  // Recent/Inputted Price
  const isCustomPrice = cell.value !== baseHarga && !calculatedHargaLainList.some(opt => opt.value === cell.value)
  if (isCustomPrice) {
    options.unshift({
      label: `Harga Terakhir: Rp ${formatWithThousandSeparator(cell.value)}`,
      value: cell.value
    })
  }

  const handleSelectOption = (val: number) => {
    setInputValue(formatWithThousandSeparator(val))
    onCellChanged({ ...cell, value: val }, true)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    const cleanValue = rawVal.replace(/[^0-9]/g, '')
    if (cleanValue === '') {
      setInputValue('')
      onCellChanged({ ...cell, value: 0 }, false)
      return
    }
    const valNum = parseInt(cleanValue, 10)
    setInputValue(formatWithThousandSeparator(valNum))
    onCellChanged({ ...cell, value: valNum }, false)
  }

  const handleInputBlur = () => {
    const cleanValue = inputValue.replace(/[^0-9]/g, '')
    const valNum = parseInt(cleanValue, 10) || 0
    onCellChanged({ ...cell, value: valNum }, true)
  }

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-between w-full h-full pr-1"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <input
        ref={inputRef}
        type="text"
        className="rg-input w-full h-full border-none outline-none bg-transparent px-2"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder="Harga..."
        onKeyDown={(e) => {
          e.stopPropagation()
        }}
      />
      <div
        onClick={handleOpenDropdown}
        className="flex items-center justify-center w-6 h-6 hover:bg-gray-100 rounded cursor-pointer transition-colors"
      >
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left + coords.width - 250,
            width: '250px',
            zIndex: 999999,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '0.25rem 0',
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectOption(opt.value)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-700 text-gray-700 block transition-colors border-b border-gray-50 last:border-b-0"
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
