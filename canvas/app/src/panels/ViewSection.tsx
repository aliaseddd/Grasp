// A view's own section of Details. THE SCAFFOLD'S SKELETON: package 2-4 owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-4, "The view's section"; section 2, "Where New view and Delete
// view are offered"; section 4, seam 9): for a picked view, "<3 elements> shown · <general view>"; a list to pick
// what to show, with its button (`show-in-view`); Show all and Show every… for a grid (`show-all`, `show-kind`); a
// widget for each OptionRow of the view's kind (a number field, radio buttons, ticked boxes); and Delete view
// (`delete-view`). Its root carries `data-testid="view-section"` (seam 12).
//
// What the scaffold fixes for it:
// - panels/sections.ts lists `viewSection` second of the three. Details (panels/Details.tsx) asks its applies() at
//   each render of its form and, when it answers true, renders its Component under the form, inside the form's root
//   (`.grasp-details`, which carries `data-history-keys`: Ctrl or ⌘ + Z in a field of the section is the history's
//   undo, core/keys.ts), with `session` and `picked`.
// - **The option rows** are the registry's: bodyOf(lib, kind).options (views/bodies.ts, OptionRow), each with its
//   `name`, `label`, `type` ('number', 'enum', 'set'), and, where it has them, `values(session, viewId)`, `range` and
//   `locked(session, viewId)`. What a view holds for an option is viewOption(session, viewId, name), and a change is
//   written by setViewOption(session, viewId, name, value, key) (both core/actions/views.ts); a view's kind is
//   viewsOf(session)'s (core/session.ts). The section reads no record of the model itself (contract 22).
// - Every button that asks an action is an ActionButton (shell/ActionControl.tsx), which greys itself and carries
//   the sentence where the action does not apply.
// - It imports the types SectionProps and Section from panels/sections.ts, and nothing from panels/Details.tsx. Its
//   stylesheet is panels/view-section.css, beside it.
//
// Until package 2-4 builds it, its applies() answers false and its component renders nothing.

import type { Section, SectionProps } from './sections';

/** The section's component. It renders nothing until package 2-4 builds it. */
export function ViewSection(_props: SectionProps): JSX.Element | null {
  return null;
}

/** The section, as panels/sections.ts lists it: for a picked view. In the skeleton it applies to nothing. */
export const viewSection: Section = { id: 'view', applies: () => false, Component: ViewSection };
