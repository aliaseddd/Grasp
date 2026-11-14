// A box dropped into another owner, or out onto the ground. THE SCAFFOLD'S SKELETON: package 2-5 owns this file and
// builds it. The view's store asks it at each step of a drag whose box has left its owner, and at the drop
// (plan/slice-2.md, section 5, flow 7; section 8, package 2-5).
//
// Section 5's table gives this file no row: a change of owner is a gesture's end, not an action.

import type { Projection } from '../adapter';
import type { Action } from '../commands';
import type { Model, Place } from '../history';
import type { Session } from '../session';

export const REPARENT_ACTIONS: readonly Action[] = [];

/**
 * Where a dragged box would land: a new owner (null: the ground, at the top of the package) with its place in the
 * view and the words of the step ("Moved <part p> into <part def D>", "Moved <part p> out onto the plane"); or the
 * sentence that says why it may not stand there, and it goes back; or null, for no change of owner (a move as today).
 */
export type Landing = { owner: string | null; place: Place; words: string } | { refused: string } | null;

/**
 * Where the box of the element `elementId` would land, in the view `viewId`, were it dropped now: `projection` is the
 * view as the step draws it, and `middle` the middle of the dragged box, in the view's units. The box under the
 * middle that may hold it is the old page's containerAt: the smallest box whose kind can contain the dragged kind
 * (canContain), never the box itself or one inside it. Package 2-5 builds it.
 */
export function landingOf(_session: Session, _viewId: string, _elementId: string, _projection: Projection, _middle: { x: number; y: number }): Landing {
  throw new Error('landingOf: package 2-5 builds it');
}

/**
 * Writes a landing: the element's owner, its place in the model's order where the old page's drop moves it, and its
 * place in the view. It is called inside the store's own history.edit(), so the change of owner is one step with the
 * move. Package 2-5 builds it.
 */
export function land(_model: Model, _viewId: string, _elementId: string, _landing: Landing & { owner: string | null }): void {
  throw new Error('land: package 2-5 builds it');
}
