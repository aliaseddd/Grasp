// The code links of a picked element: a section of Details. THE SCAFFOLD'S SKELETON: package 2-8 owns this file and
// builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-8; section 5, flow 10; plan/architecture.md, contract 10): for
// a picked element whose kind holds code links, its links, each with a path, a language and a text, with Add
// (`add-code-link`) and, on each link, Remove (`remove-code-link`, the link's place in the list as its `choice`).
// Under its title it says: "Each link is written into the text as a textual representation inside the element." Its
// root carries `data-testid="code-section"` (seam 12).
//
// What the scaffold fixes for it:
// - panels/sections.ts lists `codeSection` last of the three. Details (panels/Details.tsx) asks its applies() at each
//   render of its form and, when it answers true, renders its Component under the form, inside the form's root
//   (`.grasp-details`, which carries `data-history-keys`: Ctrl or ⌘ + Z in a field of the section is the history's
//   undo, core/keys.ts), with `session` and `picked`.
// - The links are core/codeLinks.ts's: codeLinksOf(session, elementId) gives them and changes them, and nothing else
//   knows that they are the element's `code` list (contract 22). Typing a path or a text is one run, ended when the
//   field is left (history.endEdit, as panels/fieldHooks.ts's endTyping does for a field of the form).
// - Add and Remove are ActionButtons (shell/ActionControl.tsx).
// - It imports the types SectionProps and Section from panels/sections.ts, and nothing from panels/Details.tsx. Its
//   stylesheet is panels/code-section.css, beside it. The package creates it and imports it from this file.
//
// Until package 2-8 builds it, its applies() answers false and its component renders nothing.

import type { Section, SectionProps } from './sections';

/** The section's component. It renders nothing until package 2-8 builds it. */
export function CodeSection(_props: SectionProps): JSX.Element | null {
  return null;
}

/** The section, as panels/sections.ts lists it: for a picked element that can hold code links. In the skeleton it applies to nothing. */
export const codeSection: Section = { id: 'code', applies: () => false, Component: CodeSection };
