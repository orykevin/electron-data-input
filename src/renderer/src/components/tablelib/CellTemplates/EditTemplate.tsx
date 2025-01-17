import * as React from 'react'
import {
  Cell,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty
} from '@silevis/reactgrid'
import { Button } from '@/components/ui/button'
import { Delete, Pencil } from 'lucide-react'

export interface EditCell extends Cell {
  type: 'edit'
  text: string
  openedId: number
  icon: string
}

export class EditTemplateCell {
  getCompatibleCell(uncertainCell: Uncertain<EditCell>): Compatible<EditCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string')
    const openedId = getCellProperty(uncertainCell, 'openedId', 'number')
    const value = parseFloat(text)
    const icon = getCellProperty(uncertainCell, 'icon', 'string')

    return { ...uncertainCell, text, value, openedId, icon }
  }

  // handleKeyDown(
  //   cell: Compatible<EditCell>,
  //   keyCode: number,
  //   ctrl: boolean,
  //   shift: boolean,
  //   alt: boolean
  // ): { cell: Compatible<EditCell>; enableEditMode: boolean } {
  //   if (!ctrl && !alt && isAlphaNumericKey(keyCode)) return { cell, enableEditMode: true }
  //   return {
  //     cell,
  //     enableEditMode: keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER
  //   }
  // }

  update(
    cell: Compatible<EditCell>,
    cellToMerge: UncertainCompatible<EditCell>
  ): Compatible<EditCell> {
    return this.getCompatibleCell({
      ...cell,
      text: cellToMerge.text,
      openedId: cellToMerge.openedId
    })
  }

  render(
    cell: Compatible<EditCell>,
    _isInEditMode: boolean,
    onCellChanged: (cell: Compatible<EditCell>, commit: boolean) => void
  ): React.ReactNode {
    return (
      <Button
        onClick={() =>
          onCellChanged(
            //eslint-disable-next-line
            this.getCompatibleCell({
              ...cell,
              openedId: Number(cell.text)
            }),
            true
          )
        }
        className="!w-max !px-2 mx-auto !border-none"
      >
        {cell.icon === 'delete' ? <Delete /> : <Pencil />}
      </Button>
    )
  }
}
