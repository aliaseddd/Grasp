// The Notes panel, a side panel of the dock. THE SCAFFOLD'S SKELETON: package 2-7 owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-7, "Decided: the panel"; section 2, "Where the Notes panel
// sits, and how a note is added"; section 5, flow 9; section 6, "The Notes panel"): the open notes of the session
// (notesOf(session), core/notes.ts), each a card with Claude's answer when it has one, and the archive under them.
//
// What the scaffold fixes for it:
// - The dock renders NotesPanel as the body of the panel `notes`, the fourth of the left strip, after Validation
//   (shell/Dock.tsx, LEFT_PANELS and COMPONENTS). It is put into the dock as every side panel is
//   (plan/swarm/shared.md, section 3): it takes no props, reads the open file through useDock()
//   (shell/dockContext.ts), is mounted from the page's start, before any file is open, and stays mounted while its
//   tab is hidden or its side is collapsed. So it renders with `session` null, and follows the session when another
//   file is opened.
// - It renders inside `<SidePanel testId="notes" title="Notes">` (panels/SidePanel.tsx): the root carries
//   `data-testid="notes"`, and is what scrolls.
// - An action shows the panel through the shell's hand: `handsOf(session).hands?.showPanel('notes')` (core/hands.ts)
//   brings it to the front of its strip and opens the side when it is collapsed.
// - Every button that asks an action is an ActionButton (shell/ActionControl.tsx): Add note (`add-note`, no hit), a
//   note's number (`show-note`), Archive, Restore and Delete, each with the note's id as its `choice`.
// - Its stylesheet is panels/notes.css, beside it. Its data-testid names are seam 12's: `note` (with `data-note`),
//   `archive-list`.
//
// Until package 2-7 builds it, it shows the empty state every panel had in slice 1: one sentence under its title.

import { SidePanel, SideText } from './SidePanel';

/** What the skeleton says, with or without a file open. Package 2-7 replaces it with the panel's own two sentences. */
export const NOTES_COME = 'The notes come with package 2-7.';

/** The panel's body. It takes no props: the dock makes it once and keeps it mounted while its tab is hidden. */
export function NotesPanel(): JSX.Element {
  return (
    <SidePanel testId="notes" title="Notes">
      <SideText>{NOTES_COME}</SideText>
    </SidePanel>
  );
}
