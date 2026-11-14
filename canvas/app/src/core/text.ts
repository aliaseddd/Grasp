// The text of a model (plan/architecture.md, contract 13; plan/slice-2.md, section 5, flow 11, and section 8, package
// 2-9): the model, its views, its notes and its code links as textual SysML v2, as the old page's Export SysML gives
// it and as canvas/export.mjs prints it on Claude's side.
//
// THE SCAFFOLD'S SKELETON. Package 2-9 owns this file. Until it builds it, exportText rejects with
// "exportText: package 2-9 builds it".
//
// Nothing here is React's and nothing asks for a browser: the tab that shows the text is views/TextTab.tsx.

import type { Session } from './session';

/**
 * What exportText answers with: the SysML v2 text and what keeps it from being correct, or a sentence that says why
 * this page cannot print it and where it can be printed. In slice 2 the answer is always the first; a caller shows
 * the sentence of the second where the text would be, so that slice 4 changes no caller.
 */
export type TextResult =
  | { text: string; problems: string[] }
  | { unavailable: string };

/**
 * The text of a session's model. In slice 2: the model library's toSysML(model, notes, archive), with the notes as
 * notesOf(session).file() gives them, and the problems are validate(model)'s sentences, worked out at that moment.
 * It is asynchronous from the start, and writes nothing. Package 2-9 builds it.
 */
export async function exportText(_session: Session): Promise<TextResult> {
  throw new Error('exportText: package 2-9 builds it');
}
