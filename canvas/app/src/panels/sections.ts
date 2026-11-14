// The sections of Details (plan/slice-2.md, section 4, seam 9; plan/architecture.md, contract 11): what Details shows
// under its form that is no field. A section is a component in this list, with a function that says whether it
// applies to what is picked. The list is apart from panels/Details.tsx so that a section's file imports nothing from
// the panel: it imports the two types below, and nothing else of this file.
//
// A new block of Details that is not a field is one more section, in a file of its own, listed here: no slice adds a
// branch for one kind inside Details.tsx.

import type { Picked, Session } from '../core';
import { codeSection } from './CodeSection';
import { shownSection } from './ShownSection';
import { viewSection } from './ViewSection';

/** What a section's component is given: the open file, and what was picked last, which the form above it is of. */
export interface SectionProps {
  session: Session;
  /** The same object from render to render while the same thing is picked. */
  picked: Picked;
}

/**
 * One section.
 *
 * - **`id`** names it, and is its React key: 'shown', 'view', 'code'.
 * - **`applies(session, picked)`** says whether Details shows the section for what was picked last. Details asks it
 *   at each render of its form: when the selection, the view in front or the model's state changed (the history's
 *   mark), and at no other time. It reads and writes nothing of the page. A skeleton's answers false.
 * - **`Component`** draws the section, under the form, for a `picked` its applies() accepted. What it shows that
 *   changes without the model changing (a note, the checks) it listens for itself.
 */
export interface Section {
  id: string;
  applies(session: Session, picked: Picked): boolean;
  Component(props: SectionProps): JSX.Element | null;
}

/**
 * The sections, in the order Details shows them: where the picked thing is shown (package 2-4), the view's own
 * section (2-4), then the code links (2-8). Each is its file's export; a package fills its file and changes nothing
 * here.
 */
export const SECTIONS: readonly Section[] = [shownSection, viewSection, codeSection];
