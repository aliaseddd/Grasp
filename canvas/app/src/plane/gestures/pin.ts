// A pin's gesture: a pin dragged to another target, or to the ground. THE SCAFFOLD'S SKELETON: package 2-7 owns this
// file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-7; section 5, flow 9): `pinOf(session)`, the one gesture of a
// session's pins. A pin (plane/marks/Pin.tsx) hears its own pointerdown and calls
// `pinOf(session).press(noteId, pointer, body)` with the hands of the body it is drawn in (useBody()). The gesture
// adds itself to gesturesOf(session), follows the pointer on the window, asks `body.hitAt` at each move, and has the
// body outline what it is over (`body.mark`). At the release it calls dropPin(session, noteId, hit, inside) of
// core/actions/notes.ts, with `inside` from `body.inside`. A press that does not go 4 px is a click:
// notesOf(session).attend(noteId) and handsOf(session).hands?.showPanel('notes'). Once it has moved it calls
// `body.swallow()`, so the release is no click on what is under the pin.
//
// It knows no React.

import type { Hit, Session } from '../../core';
import type { BodyHands } from '../../views/bodyContext';

/** A session's pin gesture. `state` is the pin in hand: its note, where the pointer is in the window, what it is over and whether that can carry the note; null while no pin is dragged. */
export interface PinGesture {
  readonly state: { note: string; client: { x: number; y: number }; over: Hit | null; fits: boolean } | null;
  press(noteId: string, pointer: { client: { x: number; y: number }; pointerId: number }, body: BodyHands): void;
  /** Escape, through gesturesOf(session). */
  cancel(): void;
  listen(listener: () => void): () => void;
}

// What the scaffold gives until package 2-7 builds the gesture: nothing is in hand, a press and a call-off do
// nothing, and nobody is told. No pin is drawn yet, so nothing presses.
const IDLE: PinGesture = {
  state: null,
  press() { /* package 2-7 builds it */ },
  cancel() { /* package 2-7 builds it */ },
  listen: () => () => { /* nobody is told */ },
};

/** The pin gesture of a session: the same object each time for one session. Package 2-7 builds it. */
export function pinOf(_session: Session): PinGesture {
  return IDLE;
}
