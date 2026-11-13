// The selection: the one list of what is picked, which every plane and every panel reads and sets (plan/slice-1.md,
// step 9; plan/swarm/shared.md, "The selection"). It is kept for a session, outside React, as the history is: a plane
// marks the nodes and lines it names, the Explorer its rows, Details shows the fields of the last picked, the
// Validation panel picks what an entry is about, and a tool picks what it made.
//
// It also holds which view is in front, which the dock tells it and the Tools view reads.
//
// Nothing here is React's and nothing asks for a browser: the core's tests run it in Node. Picking is not a change
// of the model: nothing is written, the history gets no step, and the file is not marked unsaved.

import type { Session } from './session';

/** What can be picked: an element, a relationship (a line), or a view. */
export type PickedType = 'el' | 'rel' | 'view';

/** One picked thing: its type and its id in the model. */
export interface Picked {
  readonly type: PickedType;
  readonly id: string;
}

/**
 * What a click on a plane hit. `plane/Plane.tsx` makes one for every click that is not the end of a drag or of a
 * marquee: on the ground, on a node (anywhere inside it, its name outside it included), or on a line (its label
 * included).
 */
export interface Hit {
  /** The id of the view the plane shows. */
  readonly view: string;
  /** The ground, a node's element, or a line's relationship. */
  readonly type: 'ground' | 'el' | 'rel';
  /** The element's or the relationship's id; null for the ground. */
  readonly id: string | null;
  /** Where the pointer was, in the view's own units from the view's origin (React Flow's screenToFlowPosition). */
  readonly at: { readonly x: number; readonly y: number };
  /** Whether Ctrl or ⌘ was held: the click adds to what is picked, or lets one thing go. */
  readonly add: boolean;
}

/**
 * A session's selection. Its methods are bound: each can be handed over as it is.
 *
 * - **`items`** is what is picked, the last picked first. It is the same array until the selection changes, and a
 *   new array then, so React reads it through useSyncExternalStore(selection.listen, () => selection.items). No item
 *   is in it twice. A new session's is empty.
 * - **What can be picked** is what the model holds: an element whose id is in `model.elements`, a relationship in
 *   `model.relationships`, a view in `model.views`. An item that names nothing is never picked: set() and toggle()
 *   leave it out without a word. Whether the model holds an id is answered from an index of its ids, made when first
 *   needed and again after a change that altered the structure, never by searching the model at each call: a
 *   marquee calls set() at every move.
 * - **`set(items)`** picks exactly these, the first of them the last picked. An item given twice counts once, where
 *   it first stands. When the list that comes of it reads the same as `items` (the same types and ids in the same
 *   order), nothing changes and nobody is told. set([]) lets everything go.
 * - **`toggle(item)`** puts an item that is not picked first in the list, and takes one that is picked out of it,
 *   the others staying in their order.
 * - **`click(hit)`** is what a click on a plane picks: on the ground, the plane's view alone (`[{ type: 'view', id:
 *   hit.view }]`), with or without `add`; on a node or a line, that element or relationship alone, or with `add`,
 *   toggle() of it.
 * - **`view`** is the view in front: the view whose tab was brought to the front last, which the dock tells with
 *   front(). Null in a new session, when the dock says so, and once that view has left the model. front() of a view
 *   the model does not hold sets null.
 * - **After a change of the model.** When the session's history tells of a change that altered the structure
 *   (`told.structure`: an edit, an undo or a redo), every item whose element, relationship or view the model no longer
 *   holds is let go, and `view` becomes null when its view is gone. Nothing comes back by itself: a redo that brings
 *   an element back does not pick it again.
 * - **`listen(listener)`** calls listener after every change of `items` or of `view`, once for each call of set(),
 *   toggle(), click() or front() that changed something and once for a change of the model that let something go.
 *   It returns what stops it. Every listener is called even when another throws; the first error is thrown on
 *   once all have been told.
 */
export interface Selection {
  readonly items: readonly Picked[];
  /** The last picked, `items[0]`, or null: what Details shows. */
  readonly last: Picked | null;
  readonly view: string | null;
  /**
   * Whether the element, relationship or view of this id is picked. It does not search the list: a plane asks it for
   * every node and line it draws, after every projection.
   */
  has(type: PickedType, id: string): boolean;
  set(items: readonly Picked[]): void;
  toggle(item: Picked): void;
  click(hit: Hit): void;
  front(viewId: string | null): void;
  listen(listener: () => void): () => void;
}

/**
 * The selection of a session: the same one each time it is asked for, kept by the session object itself, weakly, as
 * a session's view stores are (plane/viewStore.ts), so a session that is replaced takes its selection with it. The
 * first call adds the selection's one listener to the session's history.
 */
export function selectionOf(session: Session): Selection {
  void session;
  throw new Error('selectionOf: step 9 builds it');
}
