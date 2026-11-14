// The text tab: the model's text, read-only, in a tab of the editor that is no view's. THE SCAFFOLD'S SKELETON:
// package 2-9 owns this file and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-9; section 5, flow 11; section 6, "The text tab";
// plan/architecture.md, contract 13): `TextTab({ session })` shows what exportText(session) answers (core/text.ts):
// a bar at its top with Copy (an ActionButton for `copy-text`) and what keeps the text from being correct, and under
// it the text in a fixed-width font, read-only, which can be selected. It reads the text when it is shown, and again
// 0.8 s after the last change of the model or of a note. Its data-testid names are seam 12's: `text-tab` (its root),
// `text` (the text itself), `text-problems`.
//
// What the scaffold fixes for it:
// - The dock opens the tab through `useDock().showText()` and through the shell's hand
//   `handsOf(session).hands?.showText()`, which the action `open-text` calls (shell/Dock.tsx, shell/dockContext.ts):
//   one Dockview panel, id `text`, titled `<package name>.sysml`, beside the views' tabs, in front. Dockview unmounts
//   a tab's body while another tab of its group is in front, and mounts it again when it is shown.
// - It is given the session whose text it shows as its one prop, never the session of the dock's context: when
//   another file is opened, React renders the old file's tabs once more before the dock takes them away.
// - Its root fills the tab. Its stylesheet is views/text-tab.css, beside it. The package creates it and imports it
//   from this file.
//
// Until package 2-9 builds it, it renders nothing: nothing opens the tab before the row `open-text` is in the table.

import type { Session } from '../core';

export interface TextTabProps {
  /** The session whose model's text the tab shows. */
  session: Session;
}

/** The text tab's body. It renders nothing until package 2-9 builds it. */
export function TextTab(_props: TextTabProps): JSX.Element | null {
  return null;
}
