import { Location, isSelectionKey, Direction, GridRow } from '../../core'
import { Behavior } from '../Model/Behavior'
import { State } from '../Model/State'
import { unSelectOneRow, selectMultipleRows, selectOneRow } from '../Functions/selectRange'
import { focusLocation } from '../Functions/focusLocation'
import { handleContextMenu } from '../Functions/handleContextMenu'
import { PointerEvent } from '../Model/domEventsTypes'

export class RowSelectionBehavior extends Behavior {
  autoScrollDirection: Direction = 'vertical'
  initialRow!: GridRow

  handlePointerDown(event: PointerEvent, location: Location, state: State): State {
    this.initialRow = location.row
    if (
      isSelectionKey(event) &&
      state.selectionMode === 'row' &&
      state.selectedIds.some((id) => id === location.row.rowId)
    ) {
      state = unSelectOneRow(state, location.row)
    } else if (event.shiftKey && state.focusedLocation) {
      state = selectMultipleRows(
        state,
        state.focusedLocation.row,
        location.row,
        isSelectionKey(event)
      )
    } else {
      state = focusLocation(state, location, false)
      state = selectOneRow(state, location.row, isSelectionKey(event))
    }
    return state
  }

  handlePointerEnter(event: PointerEvent, location: Location, state: State): State {
    return selectMultipleRows(state, this.initialRow, location.row, isSelectionKey(event))
  }

  // handlePointerUp(
  //   event: MouseEvent | PointerEvent,
  //   location: PointerLocation,
  //   state: State<CellMatrix, Behavior<MouseEvent | PointerEvent>>
  // ): State<CellMatrix, Behavior<MouseEvent | PointerEvent>> {
  //   if (
  //     state.props?.onSelectionChanging &&
  //     !state.props.onSelectionChanging(state.selectedRanges)
  //   ) {
  //     // Cancel the latest selection
  //     const filteredRanges = [...state.selectedRanges].filter(
  //       (_, index) => index !== state.activeSelectedRangeIdx
  //     )

  //     return {
  //       ...state,
  //       selectedRanges: filteredRanges,
  //       activeSelectedRangeIdx: filteredRanges.length - 1
  //     }
  //   }

  //   state.props?.onSelectionChanged && state.props.onSelectionChanged(state.selectedRanges)

  //   return state
  // }

  handleContextMenu(event: PointerEvent, state: State): State {
    return handleContextMenu(event, state)
  }
}
