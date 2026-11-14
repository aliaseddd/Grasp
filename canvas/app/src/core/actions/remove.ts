// Delete, and Remove from view. THE SCAFFOLD'S SKELETON: package 2-4 owns this file and builds its rows.
//
// Its rows (plan/slice-2.md, section 5, the table and flow 5; section 8, package 2-4):
// | id               | title            | key    | applies |
// | delete           | Delete           | Delete | at a hit on an element or a line; or, with no hit, when everything picked is an element or a line |
// | remove-from-view | Remove from view |        | the same, for elements the view in front shows |
// What each says where it does not apply: "Nothing is picked. Click a box or a line first." or "Delete takes elements
// and lines out of the model. To delete <the view X>, use Delete view in Details."; for remove-from-view also
// "<part def X> is not shown in <view Y>." or "<View Y> shows every element, so nothing can be taken out of it."
// Delete takes every picked element with what it holds, every line on any of them and their places in every view, in
// one edit(): "Deleted <describe>", or "Deleted 3 elements and 2 lines". The notes on what went are not touched; when
// there were any it says "2 notes on it are kept in Notes."
//
// While the array is empty the Delete key does nothing, as before the scaffold.

import type { Action } from '../commands';

export const REMOVE_ACTIONS: readonly Action[] = [];
