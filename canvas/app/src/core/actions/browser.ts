// The browser view's action. THE SCAFFOLD'S SKELETON: package 2-13 owns this file and builds its row.
//
// Its row (plan/slice-2.md, section 5, the table and flow 15; section 8, package 2-13):
// | id         | title      | key | applies |
// | expand-all | Expand all |     | the view in front, or the picked view, is a browser view with a folded row |
// What it says where it does not apply: "<View Y> has nothing folded." or "Expand all is for a browser view." It
// empties the view's `collapsed` option through setViewOption (core/actions/views.ts): "Unfolded everything in
// <view Y>".

import type { Action } from '../commands';

export const BROWSER_ACTIONS: readonly Action[] = [];
