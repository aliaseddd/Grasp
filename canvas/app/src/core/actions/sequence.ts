// The sequence view's actions, its rule of place and its gestures' end. THE SCAFFOLD'S SKELETON: package 2-10 owns
// this file and builds it.
//
// Its rows (plan/slice-2.md, section 5, the table and flow 12; section 8, package 2-10):
// | id           | title                 | key           | applies |
// | message-up   | Move the message up   | Alt+ArrowUp   | the last picked is a message, and the view in front is a sequence view that draws it |
// | message-down | Move the message down | Alt+ArrowDown | the same |
// What each says where it does not apply: "Pick a message in a sequence view first." And from run: "<The message m> is
// already the first row." Each is moveMessage() by one row.
//
// And, for the sequence view's graph body (seams 1 and 3): `place`, its placer, and `end`, its ender, each null until
// the package builds it, which readers/index.ts hands out as placerOf('sequence') and enderOf('sequence').

import type { Action, Outcome } from '../commands';
import type { Ender, Placer } from '../readers/index';
import type { Session } from '../session';

export const SEQUENCE_ACTIONS: readonly Action[] = [];

/**
 * The sequence view's rule of place (seam 1): a part placed in the view is a new lifeline at the click's x, owned as
 * the view's first lifeline is; an event is placed on the lifeline the reader's at() gives, at the click's height,
 * among the lifeline's events by height. With no lifeline at the click: "Click a lifeline, the dashed line under a
 * part's head, to put an event on it." Null until package 2-10 builds it.
 */
export const place: Placer | null = null;

/**
 * The end of a head's or an event's drag (seam 3): a head's drop writes its x, "Moved <part p>"; an event's drop puts
 * it among its lifeline's events by height, "Moved <event e> among the events of <part p>"; an event that sits on a
 * message's row goes back: "<Event e> sits on the row of the <message m>. Set the message's order to move it." Null
 * until package 2-10 builds it.
 */
export const end: Ender | null = null;

/**
 * Moves a message to a row, in one history.edit(): every message first gets its place in time as its `order`, then
 * the two trade numbers, and the model's relationships are put in the messages' time order. "Moved the <message m> up
 * a row"; at the first or the last row it refuses: "The <message m> is already the first row." Package 2-10 builds it.
 */
export function moveMessage(_session: Session, _viewId: string, _relId: string, _row: number): Outcome {
  throw new Error('moveMessage: package 2-10 builds it');
}
