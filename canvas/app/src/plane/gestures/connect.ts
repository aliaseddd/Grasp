// Where a line's gesture starts (plan/slice-2.md, section 4, seam 6; section 5, flows 1 and 2): what a press on a grip
// hands over, what the line in hand is, and the gesture itself. Lines by dragging are Grasp's own gesture, on grips of
// its own (plane/nodes/Grips.tsx), and not React Flow's connecting (section 2 says why).
//
// THE SCAFFOLD'S SKELETON: package 2-2 owns this file and builds `connectOf`, in place of null. The types are the
// seam's, to the letter.
//
// What the scaffold fixes around it:
// - While `connectOf` is null no grip is mounted (Grips.tsx), and the plane's root carries neither `data-grips` nor
//   `data-connecting`.
// - plane/Plane.tsx hears `pointerdown` on its root, in the capture phase, and hands a press of the main button on a
//   grip to `connectOf(store).press(press, body)`, with the body's hands (views/bodyContext.ts). It neither stops nor
//   prevents the event: the grip's classes keep React Flow from dragging, panning and starting a marquee. The click
//   that follows a press on a grip is never a click on the grip's node: the plane drops it whether or not the press
//   became a gesture. A gesture still calls `body.swallow()` once it has moved, as the seam says.
// - `connectOf(store)` gives the same gesture each time for one store. Its `listen` is handed to
//   useSyncExternalStore as it is, so it must be the same function for the gesture's life and must not need `this`.
//   The plane renders again only when `state` goes between null and not null (`data-connecting`).
// - plane/gestures/ConnectLayer.tsx and plane/ConnectMenu.tsx draw `state` and `menu`; the plane mounts both.
// - What the gesture calls is core/actions/connect.ts: fits(), draw() of core/commands.ts, reconnect().
// - It knows no React. It adds itself to gesturesOf(session) when it becomes a gesture, so Escape calls it off.

import type { Point, Tool } from '../../core';
import type { BodyHands } from '../../views/bodyContext';
import type { ViewStore } from '../viewStore';

/** A press of the main button on a grip, as Plane.tsx hands it to the gesture. */
export interface GripPress {
  grip: 'top' | 'right' | 'bottom' | 'left' | 'from' | 'to';
  /** For a node's grip: the node's element (elementOf). */
  element: string | null;
  /** For a line's grip: the line's relationship. */
  relationship: string | null;
  /** For a line's grip: its two drawn ends, in the view's units. */
  ends: { from: Point; to: Point } | null;
  /** The grip itself: the gesture captures the pointer on it, and reads where it is. */
  target: Element;
  client: Point;
  pointerId: number;
}

/** The line in hand. */
export interface ConnectState {
  /** A new line, or an end of a line that exists. */
  kind: 'draw' | 'move';
  /** The element the line in hand starts at; for a move, the end that stays. */
  from: string;
  /** For a move. */
  relationship: string | null;
  end: 'from' | 'to' | null;
  /** Where the line in hand starts, in the view's units: the grip's middle, or the drawn end that stays. */
  start: Point;
  /** The pointer, in the view's units. */
  at: Point;
  /** The element under the pointer. */
  over: string | null;
  /** Whether something fits there. */
  fits: boolean;
}

/** The kinds that fit where a line was let go, for the menu. `left`, `top`: the window's px. */
export interface ConnectChoice { from: string; to: string; kinds: readonly Tool[]; left: number; top: number }

export interface ConnectGesture {
  /** The line in hand; it stays while the menu is open. */
  readonly state: ConnectState | null;
  readonly menu: ConnectChoice | null;
  /** From here on the gesture follows the pointer itself, on the window, until its release. */
  press(press: GripPress, body: BodyHands): void;
  choose(kind: string): void;
  closeMenu(): void;
  /** Escape, through gesturesOf(session); a change of the model heard in the middle. */
  cancel(): void;
  listen(listener: () => void): () => void;
}

/** How far, in screen px, the pointer must go from a press on a grip before it is a gesture: a release before that does nothing. */
export const GRIP_DISTANCE = 4;

/**
 * The gesture of a view's store: the same object each time for one store. Null until package 2-2 builds it: no grip
 * is mounted, and the plane hands no press on.
 */
export const connectOf: ((store: ViewStore) => ConnectGesture) | null = null;
