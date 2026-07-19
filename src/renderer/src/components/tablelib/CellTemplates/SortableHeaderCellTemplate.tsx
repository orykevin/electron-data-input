import * as React from 'react'
import { Cell, Compatible, Uncertain, UncertainCompatible, getCellProperty } from '@silevis/reactgrid'

export interface SortableHeaderCell extends Cell {
  type: 'sortableHeader'
  text: string
  columnId: string
  sortBy: string
  sortDirection: 'asc' | 'desc'
  onHeaderClick: (columnId: string) => void
}

export class SortableHeaderCellTemplate {
  getCompatibleCell(uncertainCell: Uncertain<SortableHeaderCell>): Compatible<SortableHeaderCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string')
    const columnId = getCellProperty(uncertainCell, 'columnId', 'string')
    const sortBy = getCellProperty(uncertainCell, 'sortBy', 'string')
    const sortDirection = getCellProperty(uncertainCell, 'sortDirection', 'string')
    const onHeaderClick = getCellProperty(uncertainCell, 'onHeaderClick', 'function')

    return { ...uncertainCell, text, value: NaN, columnId, sortBy, sortDirection, onHeaderClick }
  }

  update(
    cell: Compatible<SortableHeaderCell>,
    cellToMerge: UncertainCompatible<SortableHeaderCell>
  ): Compatible<SortableHeaderCell> {
    return this.getCompatibleCell({
      ...cell,
      text: cellToMerge.text
    })
  }

  isFocusable() {
    return false
  }

  render(
    cell: Compatible<SortableHeaderCell>,
    _isInEditMode: boolean,
    _onCellChanged: (cell: Compatible<SortableHeaderCell>, commit: boolean) => void
  ): React.ReactNode {
    const isCurrentSort = cell.sortBy === cell.columnId
    return (
      <div
        className="cursor-pointer select-none flex items-center justify-between gap-1 w-full h-full text-xs font-semibold uppercase text-gray-700 px-2 py-1"
        onPointerDown={(e) => {
          e.stopPropagation()
          cell.onHeaderClick(cell.columnId)
        }}
      >
        <span>{cell.text}</span>
        <span className="text-gray-400">
          {isCurrentSort ? (cell.sortDirection === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </div>
    )
  }
}
