// Showing in a view, and the views themselves. THE SCAFFOLD'S SKELETON: package 2-4 owns this file and builds it.
//
// Its rows (plan/slice-2.md, section 5, the table and flow 6; section 8, package 2-4):
// | id           | title             | key | applies |
// | show-in-view | Show in this view |     | the view in front, or the picked view, can show an element it does not show; `choices` lists them |
// | show-all     | Show all          |     | the view is a grid view |
// | show-kind    | Show every…       |     | the view is a grid view; `choices` are the model's kinds |
// | new-view     | New view          |     | always; `choices` are the eight view kinds |
// | delete-view  | Delete view       |     | the model holds more than one view |
// What each says where it does not apply: "<View Y> shows every element." or "Everything <a general view> can show is
// shown in <view Y> already."; "Show all is for a grid view. In <a general view>, pick what to show from the list.";
// "This is the only view, so it stays. Add another view first to delete this one."
//
// And setViewOption (seam 9), the one function that writes a view's option.
//
// The scaffold builds two functions here, which read a view's options and write nothing: viewOption and rootChoices.
// The option rows of views/bodies.ts (seam 2) are made of them, since a file of views/ may read no field of a model's
// record (contract 22), and the view's section may ask them for what its widgets show.

import { libOf } from '../commands';
import type { Action } from '../commands';
import type { Model, ModelElement, ModelView, Touched } from '../history';
import type { Session } from '../session';

export const VIEW_ACTIONS: readonly Action[] = [];

/**
 * One option of a view, as its record holds it: `view.options[name]`, or, when the view holds none of that name, what
 * its kind's row in the model library gives a new view (`VIEW_KINDS[kind].options[name]`). Undefined for a view the
 * model does not hold, and for a name neither has. A list is given as a copy, so nobody writes the model through it.
 * It is the value as saved, not as the kind reads it: a spacing a file holds out of its range is given as it is.
 */
export function viewOption(session: Session, viewId: string, name: string): unknown {
  const view = session.model.views.find((v) => v.id === viewId);
  if (!view) return undefined;
  const own = view.options as Record<string, unknown> | undefined;
  const rows = (session.lib as unknown as { VIEW_KINDS: Record<string, { options?: Record<string, unknown> } | undefined> }).VIEW_KINDS;
  const value = own && Object.prototype.hasOwnProperty.call(own, name) ? own[name] : rows[view.kind]?.options?.[name];
  return Array.isArray(value) ? [...value] : value;
}

/**
 * What a browser view's roots can be chosen from, as the old page's panel lists them (canvas/src/browser/page.js,
 * VIEW_PANELS.BrowserView): first the whole package, with the value '' and the words 'the whole package'; then each
 * element at the top of the package, in the model's order, by its id and the library's describe(); then each root the
 * view names below the top (a file can), so that it can be seen and taken out. [] for a view the model does not hold.
 */
export function rootChoices(session: Session, viewId: string): { value: string; label: string }[] {
  const view = session.model.views.find((v) => v.id === viewId);
  if (!view) return [];
  const l = libOf(session);
  const { model } = session;
  const out = [{ value: '', label: 'the whole package' }];
  const seen = new Set<string>();
  const add = (el: ModelElement): void => {
    if (seen.has(el.id)) return;
    seen.add(el.id);
    out.push({ value: el.id, label: l.describe(model, el) });
  };
  for (const el of l.childrenOf(model, null)) add(el);
  const roots = (session.lib as unknown as { browserRoots?: (model: Model, view: ModelView, ids: Map<string, ModelElement>) => ModelElement[] | null })
    .browserRoots?.(model, view, l.idsOf(model));
  for (const el of roots ?? []) add(el);
  return out;
}

/**
 * Writes one option of a view, in one history.edit(): `name` is the key in view.options ('spacing', 'scale', 'unit',
 * 'mode', 'columns', 'sort', 'roots', 'collapsed'), `value` what it becomes, and `key` joins a run of typing into one
 * step, ended when the field is left. It checks the value against the option's row (its range, its values) and
 * answers `{ refused }` with a sentence: "The row spacing is a number from 24 to 400.", "A table needs a column, so
 * name stays. Tick another column before taking this one away." Changing a geometry view's unit also changes its
 * scale, so that the drawing keeps its size, in the same step. Its words name the option and the view: "Set the row
 * spacing of <view Y> to 64", "Sorted <view Y> by name", "Folded <part def X> in <view Y>". It returns what the edit
 * touched, or null when the value is the one the view has. Package 2-4 builds it.
 */
export function setViewOption(_session: Session, _viewId: string, _name: string, _value: unknown, _key?: string | null): Touched | { refused: string } | null {
  throw new Error('setViewOption: package 2-4 builds it');
}
