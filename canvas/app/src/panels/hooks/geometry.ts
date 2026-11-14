// The hooks of the geometry view's fields in Details. THE SCAFFOLD'S SKELETON: package 2-11 owns this file and builds
// it.
//
// What it fills (plan/slice-2.md, section 8, package 2-11; section 4, seam 9): `GEOMETRY_HOOKS`, which holds what the
// spatial fields' rows in the model library cannot say (a part's shape, its dimensions, its position, its unit). If
// they need no hook, the file says so and its table stays empty.
//
// What the scaffold fixes for it:
// - panels/fieldHooks.ts joins this table to its own: FIELD_HOOKS is its own hooks, then SEQUENCE_HOOKS
//   (panels/hooks/sequence.ts), then GEOMETRY_HOOKS, a later table's hook of one field taking the earlier's place. A
//   key is a field's name in the model library's FIELDS. fieldHooks.ts also exports everything this file exports.
// - A hook is a FieldHook (panels/fieldHooks.ts says what each of its parts may give: shown, value, none, write,
//   said, locked), and is given a FieldOf: the library, the model, the picked item's own object, read inside
//   lib.reading(), and the field. This file is one of the modules that may read a field of a model's record
//   (contract 22). A hook's `write` runs inside the history's edit(), which changeField() calls.
// - **Import only types from '../fieldHooks'**, or use its values inside a function only: fieldHooks.ts imports this
//   file, so this file is run first, and a value of fieldHooks.ts read while this file loads is not there yet.
// - The spatial fields' labels, groups and order in the form are FIELD_LOOKS and GROUP_ORDER of fieldHooks.ts, which
//   slice 1 built with the group `geometry`.
//
// Nothing here is React's and nothing asks for a browser.

import type { FieldHook } from '../fieldHooks';

/** The hooks, by the field's name. Empty until package 2-11 builds it, or says that the fields need none. */
export const GEOMETRY_HOOKS: Readonly<Record<string, FieldHook>> = {};
