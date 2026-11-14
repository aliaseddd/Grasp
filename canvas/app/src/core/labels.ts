// What a typed label changes, and the label being edited (plan/slice-2.md, section 4, seam 7; section 5, flows 3 and
// 4; section 8, package 2-3). The grammar is the model library's (canvas/src/labels/lib.js: readLabel, applyLabel,
// labelText, labelEditable, renamable, labelWords, labelLeftOut), which stays as it is.
//
// THE SCAFFOLD'S SKELETON. Package 2-3 owns this file. Until it builds it, no label is being edited: labelEditOf
// gives an object whose `editing` is null and that tells nobody, whose open() and keep() throw
// "labelEditOf.<name>: package 2-3 builds it", and rename() throws "rename: package 2-3 builds it".
//
// Nothing here is React's and nothing asks for a browser: the editor's text box is plane/LabelEditor.tsx.

import type { Outcome } from './commands';
import type { Picked } from './selection';
import type { Session } from './session';

/**
 * The label being edited, for a session: the page has one editor (plane/LabelEditor.tsx), which lays a text box over
 * the anchor of what `editing` names, in the view it names.
 *
 * - **`editing`** is what is being edited, or null: the thing, the view whose body shows the box, and `typed`, the
 *   character that opened the editor, or null when F2 did (the box then holds the label's text, all selected).
 * - **`open(picked, view, typed)`** starts editing that thing's label in that view, and returns true; or it returns
 *   the sentence that says why this label cannot be edited, and opens nothing.
 * - **`keep(text)`** makes what the text says, in one history.edit() (the library's applyLabel, in its labelWords),
 *   closes the editor and returns what came of it; null when the text changes nothing, which is no step.
 * - **`close()`** puts the editor away and changes nothing.
 * - **`listen(listener)`** calls listener after every change of `editing`, and returns what stops it.
 */
export interface LabelEdit {
  readonly editing: { picked: Picked; view: string; typed: string | null } | null;
  open(picked: Picked, view: string, typed?: string): true | string;
  keep(text: string): Outcome | null;
  close(): void;
  listen(listener: () => void): () => void;
}

const KEPT = new WeakMap<Session, LabelEdit>();

/** The label being edited of a session: the same object each time it is asked for. Package 2-3 builds it. */
export function labelEditOf(session: Session): LabelEdit {
  let kept = KEPT.get(session);
  if (!kept) {
    kept = {
      editing: null,
      open: () => { throw new Error('labelEditOf.open: package 2-3 builds it'); },
      keep: () => { throw new Error('labelEditOf.keep: package 2-3 builds it'); },
      close: () => {},
      listen: () => () => {},
    };
    KEPT.set(session, kept);
  }
  return kept;
}

/**
 * Renames a thing, for a row of a tree (the Explorer and a browser view call it when a row's edit is kept): one
 * history.edit() that writes the name as typed and reads no other part of a label. Its words: 'Renamed to <describe>'
 * for an element, 'Named the <describeRel>' for a line. It refuses what the library's renamable refuses: '<A start>
 * has no name to change.' Package 2-3 builds it.
 */
export function rename(_session: Session, _picked: Picked, _name: string): Outcome {
  throw new Error('rename: package 2-3 builds it');
}
