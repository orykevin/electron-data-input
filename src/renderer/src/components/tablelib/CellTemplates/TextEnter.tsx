import * as React from 'react'
import {
  Cell,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty,
  isAlphaNumericKey,
  keyCodes
} from '@silevis/reactgrid'

export interface TextEnter extends Cell {
  type: 'textEnter'
  text: string
  isSelected?: boolean
}

export class TextEnterCell {
  getCompatibleCell(uncertainCell: Uncertain<TextEnter>): Compatible<TextEnter> {
    const text = getCellProperty(uncertainCell, 'text', 'string')
    const value = parseFloat(text)
    const isSelected = getCellProperty(uncertainCell, 'isSelected', 'boolean')
    return { ...uncertainCell, text, value, isSelected }
  }

  handleKeyDown(
    cell: Compatible<TextEnter>,
    keyCode: number,
    ctrl: boolean,
    shift: boolean,
    alt: boolean
  ): { cell: Compatible<TextEnter>; enableEditMode: boolean } {
    if ((keyCode === keyCodes.SPACE || keyCode === keyCodes.ENTER) && !shift) {
      console.log('enter')
      return {
        cell: this.getCompatibleCell({ ...cell, isSelected: true }),
        enableEditMode: false
      }
    }

    if (!ctrl && !alt && isAlphaNumericKey(keyCode)) return { cell, enableEditMode: true }
    return {
      cell,
      enableEditMode: false
    }
  }

  update(
    cell: Compatible<TextEnter>,
    cellToMerge: UncertainCompatible<TextEnter>
  ): Compatible<TextEnter> {
    return this.getCompatibleCell({
      ...cell,
      text: cellToMerge.text,
      isSelected: cellToMerge.isSelected
    })
  }

  render(
    cell: Compatible<TextEnter>,
    _isInEditMode: boolean,
    onCellChanged: (cell: Compatible<TextEnter>, commit: boolean) => void
  ): React.ReactNode {
    return (
      <div
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            alert('test')
          }
        }}
      >
        <button
          onClick={() => onCellChanged(this.getCompatibleCell({ ...cell, isSelected: true }), true)}
        >
          <p>{cell.text}</p>
        </button>
      </div>
    )
  }
}
