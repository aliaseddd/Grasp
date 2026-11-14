// The label editor's two actions. THE SCAFFOLD'S SKELETON: package 2-3 owns this file and builds its rows.
//
// Its rows (plan/slice-2.md, section 5, the table and flow 3; section 8, package 2-3):
// | id         | title                | key       | applies |
// | edit-label | Edit label           | F2        | the last picked is an element or a line whose label can be edited (the library's labelEditable), and the view in front shows it |
// | type-label | Edit label by typing | printable | the same; the `choice` is the character typed |
// What each says where it does not apply: "Nothing is picked. Click a box or a line to edit its label." or "<A start>
// has no label to edit." or "<View Y> does not show <part def X>, so its label cannot be edited here." Each runs
// labelEditOf(session).open(picked, the view in front, typed) of core/labels.ts.
//
// While the array is empty F2 and typing do nothing, as before the scaffold.

import type { Action } from '../commands';

export const LABEL_ACTIONS: readonly Action[] = [];
