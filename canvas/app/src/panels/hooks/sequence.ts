// The hooks of the sequence view's fields in Details. THE SCAFFOLD'S SKELETON: package 2-10 owns this file and builds
// it.
//
// What it fills (plan/slice-2.md, section 8, package 2-10, "The `order` hook"; section 4, seam 9): `SEQUENCE_HOOKS`,
// with the `order` hook of a message: writing a message's order also sorts the model's messages, in the same step.
// It replaces the locked hook below, which is slice 1's, moved here as it was.
//
// What the scaffold fixes for it:
// - panels/fieldHooks.ts joins this table to its own: FIELD_HOOKS is its own hooks, then SEQUENCE_HOOKS, then
//   GEOMETRY_HOOKS (panels/hooks/geometry.ts), a later table's hook of one field taking the earlier's place. A key
//   is a field's name in the model library's FIELDS. fieldHooks.ts also exports everything this file exports.
// - A hook is a FieldHook (panels/fieldHooks.ts says what each of its parts may give: shown, value, none, write,
//   said, locked), and is given a FieldOf: the library, the model, the picked item's own object, read inside
//   lib.reading(), and the field. This file is one of the modules that may read a field of a model's record
//   (contract 22). A hook's `write` runs inside the history's edit(), which changeField() calls.
// - **Import only types from '../fieldHooks'**, or use its values inside a function only: fieldHooks.ts imports this
//   file, so this file is run first, and a value of fieldHooks.ts read while this file loads is not there yet.
//
// Nothing here is React's and nothing asks for a browser.

import type { FieldHook } from '../fieldHooks';

/** Why a message's order cannot be changed until package 2-10 builds its hook: slice 1's sentence. */
export const ORDER_LOCKED = 'The order can\'t be changed here yet. The old page changes it until slice 2.';

/**
 * The hooks, by the field's name.
 *
 * - **order**, a message's place in time. locked: always, ORDER_LOCKED. So it is shown and never changed, as in
 *   slice 1; the old hook's write, which re-sorts the messages, comes with package 2-10, which replaces this hook.
 */
export const SEQUENCE_HOOKS: Readonly<Record<string, FieldHook>> = {
  order: { locked: () => ORDER_LOCKED },
};
