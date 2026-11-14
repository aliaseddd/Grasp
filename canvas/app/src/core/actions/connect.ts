// What a line drawn or moved by dragging asks and writes. THE SCAFFOLD'S SKELETON: package 2-2 owns this file and
// builds it. The gesture itself is plane/gestures/connect.ts; it calls these (plan/slice-2.md, section 5, flows 1 and
// 2; section 8, package 2-2).
//
// Section 5's table gives this file no row: a line is drawn by a gesture, not asked as an action.

import type { Action, Outcome, Tool } from '../commands';
import type { Session } from '../session';

export const CONNECT_ACTIONS: readonly Action[] = [];

/** What fits between two elements: the relationship kinds that may be drawn from the one to the other, in the order of the view kind's tools row; or the sentence that says why none does. */
export type Fits = { kinds: readonly Tool[] } | { refused: string };

/**
 * The rule of criterion 4: which relationship kinds of the view's kind (toolGroups, its groups read as one list, in
 * the row's order) may be drawn from the element `fromId` to the element `toId`. A kind fits when
 * drawProblem(session, kind, fromId, toId) is null; it holds no rule of its own. When no kind fits, the sentence is
 * drawProblem's for the first kind in the row whose `first` rule accepts the first element; when no kind's `first`
 * rule accepts it, for the first kind in the row. In a view whose row holds no relationship kind: "<A geometry view>
 * draws no lines." Package 2-2 builds it.
 */
export function fits(_session: Session, _viewId: string, _fromId: string, _toId: string): Fits {
  throw new Error('fits: package 2-2 builds it');
}

/**
 * Why an end of a relationship may not move to the element `toId`, or null when it may: drawProblem's sentence for
 * the new pair, the line itself left out of the "already drawn" check; and for a "defined by" line whose usage end
 * goes to a usage that has a definition already, "<describe of that usage> is defined by <the definition's name>
 * already. Clear its definition in Details first." Package 2-2 builds it.
 */
export function reconnectProblem(_session: Session, _relId: string, _end: 'from' | 'to', _toId: string): string | null {
  throw new Error('reconnectProblem: package 2-2 builds it');
}

/**
 * Moves one end of a relationship to another element, in one history.edit(): the relationship keeps its id, so its
 * label, its fields, its notes and its pins stay. Its words: "Moved an end of the <describeRel, as it was> to
 * <describe of the new end>". What it refuses is reconnectProblem's sentence. Package 2-2 builds it.
 */
export function reconnect(_session: Session, _relId: string, _end: 'from' | 'to', _toId: string): Outcome {
  throw new Error('reconnect: package 2-2 builds it');
}
