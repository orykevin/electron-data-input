// import * as React from 'react'
// import {
//   Cell,
//   Compatible,
//   Uncertain,
//   UncertainCompatible,
//   getCellProperty,
//   getCharFromKey,
//   isFunctionKey,
//   isNavigationKey,
//   keyCodes
// } from '@silevis/reactgrid'
// import useDebounce from '@/lib/hooks/use-debounce'
// import { isAlphaNumericKey } from './keyCodeCheckings'

// export interface InputChange extends Cell {
//   type: 'inputChange'
//   text: string
//   validator?: (text: string) => boolean
//   placeholder?: string
// }

// export class InputChangeTemplate {
//   private wasEscKeyPressed = false

//   getCompatibleCell(uncertainCell: Uncertain<InputChange>): Compatible<InputChange> {
//     const text = getCellProperty(uncertainCell, 'text', 'string')
//     const value = parseFloat(text)
//     return { ...uncertainCell, text, value }
//   }

//   handleKeyDown(
//     cell: Compatible<InputChange>,
//     keyCode: number,
//     ctrl: boolean,
//     shift: boolean,
//     alt: boolean,
//     key: string,
//     capsLock: boolean
//   ): { cell: Compatible<InputChange>; enableEditMode: boolean } {
//     if (isFunctionKey(keyCode)) {
//       if (keyCode === keyCodes.F2) return { cell, enableEditMode: true }
//       return { cell, enableEditMode: false }
//     }

//     const char = getCharFromKey(key, shift, capsLock)

//     if (!ctrl && !alt && isAlphaNumericKey(keyCode) && !(shift && keyCode === keyCodes.SPACE))
//       return { cell: this.getCompatibleCell({ ...cell, text: char }), enableEditMode: true }
//     return {
//       cell,
//       enableEditMode: keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER
//     }
//   }

//   update(
//     cell: Compatible<InputChange>,
//     cellToMerge: UncertainCompatible<InputChange>
//   ): Compatible<InputChange> {
//     return this.getCompatibleCell({
//       ...cell,
//       text: cellToMerge.text
//     })
//   }

//   handleCompositionEnd(
//     cell: Compatible<InputChange>,
//     eventData: any
//   ): { cell: Compatible<InputChange>; enableEditMode: boolean } {
//     return { cell: { ...cell, text: eventData }, enableEditMode: true }
//   }

//   getClassName(cell: Compatible<InputChange>, _isInEditMode: boolean): string {
//     const isValid = cell.validator ? cell.validator(cell.text) : true
//     const className = cell.className ? cell.className : ''
//     return `${isValid ? 'valid' : 'rg-invalid'} ${
//       cell.placeholder && cell.text === '' ? 'placeholder' : ''
//     } ${className}`
//   }

//   render(
//     cell: Compatible<InputChange>,
//     _isInEditMode: boolean,
//     onCellChanged: (cell: Compatible<InputChange>, commit: boolean) => void
//   ): React.ReactNode {
//     //   if (!isInEditMode) {
//     //     const flagISO = cell.text.toLowerCase(); // ISO 3166-1, 2/3 letters
//     //     const flagURL = `https://restcountries.eu/data/${flagISO}.svg`;
//     //     const alternativeURL = `https://upload.wikimedia.org/wikipedia/commons/0/04/Nuvola_unknown_flag.svg`;
//     //     return (
//     //       <div
//     //         className="rg-flag-wrapper"
//     //         style={{ backgroundImage: `url(${flagURL}), url(${alternativeURL})` }}
//     //       />
//     //     );
//     //   }
//     const [text, setText] = React.useState(cell.text)
//     const debouncedText = useDebounce(text, 500)

//     React.useEffect(() => {
//       setText(cell.text)
//     }, [cell.text])

//     React.useEffect(() => {
//       if (debouncedText !== '') {
//         onCellChanged(this.getCompatibleCell({ ...cell, text: debouncedText }), true)
//       }
//     }, [debouncedText])

//     return (
//       // <input
//       //   ref={(input) => {
//       //     if (input) {
//       //       input.focus()
//       //       input.setSelectionRange(input.value.length, input.value.length)
//       //     }
//       //   }}
//       //   defaultValue={cell.text}
//       //   onChange={(e) => setText(e.currentTarget.value)}
//       //   value={text}
//       //   onCopy={(e) => e.stopPropagation()}
//       //   onCut={(e) => e.stopPropagation()}
//       //   onPaste={(e) => e.stopPropagation()}
//       //   onPointerDown={(e) => e.stopPropagation()}
//       //   className="w-full"
//       // />
//       <input
//         className="rg-input"
//         ref={(input) => {
//           if (input) {
//             input.focus()
//             input.setSelectionRange(input.value.length, input.value.length)
//           }
//         }}
//         defaultValue={cell.text}
//         onChange={(e) => setText(e.currentTarget.value)}
//         value={text}
//         onBlur={(e) => {
//           onCellChanged(
//             this.getCompatibleCell({ ...cell, text: e.currentTarget.value }),
//             !this.wasEscKeyPressed
//           )
//           this.wasEscKeyPressed = false
//         }}
//         onCopy={(e) => e.stopPropagation()}
//         onCut={(e) => e.stopPropagation()}
//         onPaste={(e) => e.stopPropagation()}
//         onPointerDown={(e) => e.stopPropagation()}
//         onKeyDown={(e) => {
//           if (isAlphaNumericKey(e.keyCode) || isNavigationKey(e.keyCode)) e.stopPropagation()
//           if (e.keyCode === keyCodes.ESCAPE) this.wasEscKeyPressed = true
//         }}
//       />
//     )
//   }
// }

import * as React from 'react'

// NOTE: all modules imported below may be imported from '@silevis/reactgrid'
import { isAlphaNumericKey, isFunctionKey, isNavigationKey } from './keyCodeCheckings'
import { getCellProperty } from '../Functions/getCellProperty'
import { keyCodes } from '../Functions/keyCodes'
import {
  Cell,
  CellTemplate,
  Compatible,
  Uncertain,
  UncertainCompatible
} from '../Model/PublicModel'
import { getCharFromKey } from './getCharFromKeyCode'
import useDebounce from '@/lib/hooks/use-debounce'

export interface InputChange extends Cell {
  type: 'inputChange'
  text: string
  placeholder?: string
  validator?: (text: string) => boolean
  renderer?: (text: string) => React.ReactNode
  errorMessage?: string
}

export class InputChangeTemplate implements CellTemplate<InputChange> {
  private wasEscKeyPressed = false

  getCompatibleCell(uncertainCell: Uncertain<InputChange>): Compatible<InputChange> {
    const text = getCellProperty(uncertainCell, 'text', 'string')
    let placeholder: string | undefined
    try {
      placeholder = getCellProperty(uncertainCell, 'placeholder', 'string')
    } catch {
      placeholder = ''
    }
    const value = parseFloat(text) // TODO more advanced parsing for all text based cells
    return { ...uncertainCell, text, value, placeholder }
  }

  update(
    cell: Compatible<InputChange>,
    cellToMerge: UncertainCompatible<InputChange>
  ): Compatible<InputChange> {
    return this.getCompatibleCell({
      ...cell,
      text: cellToMerge.text,
      placeholder: cellToMerge.placeholder
    })
  }

  handleKeyDown(
    cell: Compatible<InputChange>,
    keyCode: number,
    ctrl: boolean,
    shift: boolean,
    alt: boolean,
    key: string,
    capsLock: boolean
  ): { cell: Compatible<InputChange>; enableEditMode: boolean } {
    if (isFunctionKey(keyCode)) {
      if (keyCode === keyCodes.F2) return { cell, enableEditMode: true }
      return { cell, enableEditMode: false }
    }

    const char = getCharFromKey(key, shift, capsLock)

    if (!ctrl && !alt && isAlphaNumericKey(keyCode) && !(shift && keyCode === keyCodes.SPACE))
      return { cell: this.getCompatibleCell({ ...cell, text: char }), enableEditMode: true }
    return {
      cell,
      enableEditMode: keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER
    }
  }

  handleCompositionEnd(
    cell: Compatible<InputChange>,
    eventData: any
  ): { cell: Compatible<InputChange>; enableEditMode: boolean } {
    return { cell: { ...cell, text: eventData }, enableEditMode: true }
  }

  getClassName(cell: Compatible<InputChange>, _isInEditMode: boolean): string {
    const isValid = cell.validator ? cell.validator(cell.text) : true
    const className = cell.className ? cell.className : ''
    return `${isValid ? 'valid' : 'rg-invalid'} ${
      cell.placeholder && cell.text === '' ? 'placeholder' : ''
    } ${className}`
  }

  render(
    cell: Compatible<InputChange>,
    isInEditMode: boolean,
    onCellChanged: (cell: Compatible<InputChange>, commit: boolean) => void
  ): React.ReactNode {
    const [text, setText] = React.useState(cell.text)
    const debouncedText = useDebounce(text, 500)

    React.useEffect(() => {
      // if (isInEditMode) {
      setText(cell.text)
      // }
    }, [cell.text])

    React.useEffect(() => {
      if (debouncedText !== '') {
        onCellChanged(this.getCompatibleCell({ ...cell, text: debouncedText }), true)
      }
    }, [debouncedText])

    return (
      <input
        className="rg-input w-full"
        ref={(input) => {
          if (input && isInEditMode) {
            input.focus()
            input.setSelectionRange(input.value.length, input.value.length)
          }
        }}
        defaultValue={cell.text}
        onChange={(e) => setText(e.currentTarget.value)}
        value={text}
        onBlur={(e) => {
          onCellChanged(
            this.getCompatibleCell({ ...cell, text: e.currentTarget.value }),
            !this.wasEscKeyPressed
          )
          this.wasEscKeyPressed = false
        }}
        onCopy={(e) => e.stopPropagation()}
        onCut={(e) => e.stopPropagation()}
        onPaste={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder={cell.placeholder}
        onKeyDown={(e) => {
          if (isAlphaNumericKey(e.keyCode) || isNavigationKey(e.keyCode)) e.stopPropagation()
          if (e.keyCode === keyCodes.ESCAPE) this.wasEscKeyPressed = true
        }}
      />
    )
  }
}
