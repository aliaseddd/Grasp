// Where a picked thing is shown: a section of Details. THE SCAFFOLD'S SKELETON: package 2-4 owns this file and builds
// it.
//
// What it fills (plan/slice-2.md, section 8, package 2-4, "The shown-in lines"; section 4, seam 9): for a picked
// element, "Shown in view1, view2", each name a link that brings that view to the front (useDock().showView), or
// "Shown in no view. A view's Show list brings it in."; for a picked line, "Drawn in view1" or "Drawn in no view:
// none shows both ends." What a view shows is asked of its reader's `listed` (core/readers), never read off a
// record of the model.
//
// What the scaffold fixes for it:
// - panels/sections.ts lists `shownSection` first of the three. Details (panels/Details.tsx) asks its applies() at
//   each render of its form and, when it answers true, renders its Component under the form, inside the form's root
//   (`.grasp-details`, which carries `data-history-keys`), with `session` and `picked`.
// - It imports the types SectionProps and Section from panels/sections.ts, and nothing from panels/Details.tsx.
// - Its styles are panels/view-section.css, which package 2-4 owns with the view's section.
//
// Until package 2-4 builds it, its applies() answers false and its component renders nothing.

import type { Section, SectionProps } from './sections';

/** The section's component. It renders nothing until package 2-4 builds it. */
export function ShownSection(_props: SectionProps): JSX.Element | null {
  return null;
}

/** The section, as panels/sections.ts lists it: for a picked element or line. In the skeleton it applies to nothing. */
export const shownSection: Section = { id: 'shown', applies: () => false, Component: ShownSection };
