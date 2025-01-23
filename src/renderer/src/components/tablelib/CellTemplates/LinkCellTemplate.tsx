import * as React from 'react'
import {
  Cell,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty
} from '@silevis/reactgrid'
import { History } from 'lucide-react'
import { LinkButtonIcon } from '@/components/ui/link-button'

export interface LinkCell extends Cell {
  type: 'link'
  url: string
  icon: string
  text: string
}

export class LinkCellTemplate {
  getCompatibleCell(uncertainCell: Uncertain<LinkCell>): Compatible<LinkCell> {
    const url = getCellProperty(uncertainCell, 'url', 'string')
    const text = getCellProperty(uncertainCell, 'text', 'string')
    const value = parseFloat(text)
    const icon = getCellProperty(uncertainCell, 'icon', 'string')

    return { ...uncertainCell, url, icon, text, value }
  }

  // handleKeyDown(
  //   cell: Compatible<LinkCell>,
  //   keyCode: number,
  //   ctrl: boolean,
  //   shift: boolean,
  //   alt: boolean
  // ): { cell: Compatible<LinkCell>; enableEditMode: boolean } {
  //   if (!ctrl && !alt && isAlphaNumericKey(keyCode)) return { cell, enableEditMode: true }
  //   return {
  //     cell,
  //     enableEditMode: keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER
  //   }
  // }

  update(
    cell: Compatible<LinkCell>,
    cellToMerge: UncertainCompatible<LinkCell>
  ): Compatible<LinkCell> {
    return this.getCompatibleCell({
      ...cell,
      text: cellToMerge.text,
      url: cellToMerge.url
    })
  }

  render(
    cell: Compatible<LinkCell>,
    _isInEditMode: boolean,
    _onCellChanged: (cell: Compatible<LinkCell>, commit: boolean) => void
  ): React.ReactNode {
    return (
      <LinkButtonIcon to={cell.url} className="!w-max !px-2 mx-auto !border-none">
        {<History />}
      </LinkButtonIcon>
    )
  }
}
