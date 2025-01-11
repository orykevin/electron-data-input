import * as React from 'react'
import {
  Cell,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty
} from '@silevis/reactgrid'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'

export interface EditCell extends Cell {
  type: 'edit'
  text: string
  openedId: number
}

export class EditTemplateCell {
  getCompatibleCell(uncertainCell: Uncertain<EditCell>): Compatible<EditCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string')
    const openedId = getCellProperty(uncertainCell, 'openedId', 'number')
    const value = parseFloat(text)
    return { ...uncertainCell, text, value, openedId }
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
    //   if (!isInEditMode) {
    //     const flagISO = cell.text.toLowerCase(); // ISO 3166-1, 2/3 letters
    //     const flagURL = `https://restcountries.eu/data/${flagISO}.svg`;
    //     const alternativeURL = `https://upload.wikimedia.org/wikipedia/commons/0/04/Nuvola_unknown_flag.svg`;
    //     return (
    //       <div
    //         className="rg-flag-wrapper"
    //         style={{ backgroundImage: `url(${flagURL}), url(${alternativeURL})` }}
    //       />
    //     );
    //   }

    return (
      // <input
      //   ref={input => {
      //     input && input.focus();
      //   }}
      //   defaultValue={cell.text}
      //   onChange={e =>
      //     onCellChanged(
      //       this.getCompatibleCell({ ...cell, text: e.currentTarget.value }),
      //       false
      //     )
      //   }
      //   onCopy={e => e.stopPropagation()}
      //   onCut={e => e.stopPropagation()}
      //   onPaste={e => e.stopPropagation()}
      //   onPointerDown={e => e.stopPropagation()}
      //   onKeyDown={e => {
      //   if (isAlphaNumericKey(e.keyCode) || isNavigationKey(e.keyCode))
      //     e.stopPropagation();
      //   }}
      // />
      <Button
        onClick={() =>
          onCellChanged(
            //eslint-disable-next-line
            this.getCompatibleCell({ ...cell, openedId: Number(cell.text) }),
            true
          )
        }
        className="!w-max !px-2 mx-auto !border-none"
      >
        <Pencil />
      </Button>
    )
  }
}
