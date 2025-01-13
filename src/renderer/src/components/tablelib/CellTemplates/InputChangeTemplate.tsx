import * as React from 'react'
import {
  Cell,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty
} from '@silevis/reactgrid'
import useDebounce from '@/lib/hooks/use-debounce'

export interface InputChange extends Cell {
  type: 'inputChange'
  text: string
}

export class InputChangeTemplate {
  getCompatibleCell(uncertainCell: Uncertain<InputChange>): Compatible<InputChange> {
    const text = getCellProperty(uncertainCell, 'text', 'string')
    const value = parseFloat(text)
    return { ...uncertainCell, text, value }
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
    cell: Compatible<InputChange>,
    cellToMerge: UncertainCompatible<InputChange>
  ): Compatible<InputChange> {
    return this.getCompatibleCell({
      ...cell,
      text: cellToMerge.text
    })
  }

  render(
    cell: Compatible<InputChange>,
    _isInEditMode: boolean,
    onCellChanged: (cell: Compatible<InputChange>, commit: boolean) => void
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
    const [text, setText] = React.useState(cell.text)
    const debouncedText = useDebounce(text, 1000)

    React.useEffect(() => {
      if (debouncedText !== '') {
        onCellChanged(this.getCompatibleCell({ ...cell, text: debouncedText }), true)
      }
    }, [debouncedText])

    return (
      <input
        ref={(input) => {
          input && input.focus()
        }}
        defaultValue={cell.text}
        onChange={(e) => setText(e.currentTarget.value)}
        value={text}
        onCopy={(e) => e.stopPropagation()}
        onCut={(e) => e.stopPropagation()}
        onPaste={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      />
    )
  }
}
