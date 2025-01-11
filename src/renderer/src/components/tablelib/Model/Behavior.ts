import { Direction, PointerLocation } from './InternalModel'
import { KeyboardEvent, ClipboardEvent, PointerEvent } from './domEventsTypes'
import { State } from './State'
import { Range } from './Range'

// ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE!
export abstract class Behavior<PointerUpEvent = PointerEvent | MouseEvent> {
  handleKeyDown(_event: KeyboardEvent, state: State): State {
    return state
  }
  handlePointerUp(_event: PointerUpEvent, _location: PointerLocation, state: State): State {
    return state
  }
  handleKeyUp(_event: KeyboardEvent, state: State): State {
    return state
  }
  handleCompositionEnd(_event: CompositionEvent, state: State): State {
    return state
  }
  handleCopy(_event: ClipboardEvent, state: State): State {
    return state
  }
  handlePaste(_event: ClipboardEvent, state: State): State {
    return state
  }
  handleCut(_event: ClipboardEvent, state: State): State {
    return state
  }
  handlePointerDown(_event: PointerEvent, _location: PointerLocation, state: State): State {
    return state
  }
  handleDoubleClick(_event: PointerEvent, _location: PointerLocation, state: State): State {
    return state
  }

  handlePointerMove(_event: PointerEvent, _location: PointerLocation, state: State): State {
    return state
  }

  handlePointerEnter(_event: PointerEvent, _location: PointerLocation, state: State): State {
    return state
  }

  handleContextMenu(_event: PointerEvent | MouseEvent, state: State): State {
    return state
  }

  renderPanePart(_state: State, _pane: Range): React.ReactNode {
    return undefined
  }

  autoScrollDirection: Direction = 'both'
}
