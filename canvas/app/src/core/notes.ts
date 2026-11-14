// The notes and the archive of a session (plan/slice-2.md, section 4, seam 11; plan/architecture.md, contract 9).
// Notes are records beside the model: outside the history, so no change to a note is undone by Undo, and saved apart
// from the model's elements.
//
// THE SCAFFOLD'S SKELETON. Package 2-7 owns this file and builds notesOf. Until it does, notesOf carries a file's
// notes through unchanged, so the ten files save as they did in slice 1: `open` and `archive` are the file's lists as
// they are (a record the old page would tidy or leave out is kept as it is), file() gives the same lists back, mark()
// never changes, `attended` and `pointed` are null, nobody is ever told, and every function that would change a note
// throws "notesOf.<name>: package 2-7 builds it".
//
// What package 2-7 builds here, beside the contracts below (its brief, section 8): a file's notes read as the old page
// reads them (isNote, tidyNote, tidyArchived, written again here); a state file's free note given its view by section
// 2's rule and its point of the old plane again when saved, which reads a view's `x` and `y` and nothing else of the
// model (contract 22); a note's label of what it is on following a rename.
//
// Nothing here is React's and nothing asks for a browser.

import { fileNotesOf } from './session';
import type { Picked } from './selection';
import type { Session } from './session';

/**
 * A note, as the page holds it: the old page's record (tidyNote in canvas/src/core/page/state.js), with a free note's
 * view (contract 9).
 */
export interface Note {
  /** [A-Za-z0-9_-]{1,64} */
  id: string;
  /** Its number on the drawing; a new note takes the largest number + 1, counting the archive. 0 when a file gave none. */
  no: number;
  /** The id of the element or relationship it is on; null for a free note. It may name nothing the model holds. */
  target: string | null;
  /** The target in words: the library's labelFor, kept current while the target is in the model (section 12, item 3). */
  targetLabel: string;
  text: string;
  by: 'user' | 'claude';
  /** ISO times. */
  created: string;
  updated: string;
  /** Claude's answer; '' while there is none. */
  response: string;
  /** Claude sets it. */
  resolved: boolean;
  /** A free note only: the view it floats on, and where, in that view's own units. */
  view?: string;
  x?: number;
  y?: number;
  /** An archived note only: when it was archived, and the answer it was archived with. */
  archived?: string;
  resolution?: string;
}

/** Where a note is: on an element or a relationship, or free on a view, at a point in the view's own units. */
export type NotePlace = Picked | { view: string; x: number; y: number };

/**
 * The notes of a session. Its methods are bound: each can be handed over as it is.
 *
 * - **`open`** is the notes that are not archived, by number: the same array until a note changes, and a new array
 *   then. **`archive`** is the archived notes, the same way.
 * - **`add(on)`** makes a new note there, with the next number and no text, and returns it.
 * - **`setText(id, text)`** writes a note's text. Nothing for a note Claude wrote, or an id that names none.
 * - **`moveTo(id, on)`** moves a note onto another target, or to a free place. Nothing when the note is there already.
 * - **`remove(id)`** takes a note away.
 * - **`archiveNote(id)`** puts a resolved note into the archive. Nothing for a note that is not resolved.
 * - **`restore(id)`** brings an archived note back among the open ones.
 * - **`attended`** is the note the Notes panel is asked to open on: a new note, or the note of a clicked pin.
 *   **`attend(id)`** sets it; the panel puts the caret there and calls attend(null).
 * - **`pointed`** is the note under the pointer in the panel, or holding the caret: its pins are marked
 *   (core/marks.ts, `hot`). **`point(id)`** sets it.
 * - **`mark()`** names the state the notes are in, as history.mark() names the model's: a change to a note gives a
 *   new number, and attend() and point() do not. The session compares it with the mark of the last save
 *   (session.unsaved).
 * - **`file()`** is the notes and the archive as a grasp/2 state file keeps them, which stateFile() writes.
 * - **`listen(listener)`** calls listener after every change of anything above, and returns what stops it.
 *
 * notesOf refuses nothing: whether a thing can carry a note needs the element's kind, which this file may not read
 * (contract 22). core/actions/notes.ts asks first (canCarry) and calls notesOf after. No function here calls
 * history.edit(): a change to a note is no undo step.
 */
export interface Notes {
  readonly open: readonly Note[];
  readonly archive: readonly Note[];
  add(on: NotePlace): Note;
  setText(id: string, text: string): void;
  moveTo(id: string, on: NotePlace): void;
  remove(id: string): void;
  archiveNote(id: string): void;
  restore(id: string): void;
  readonly attended: string | null;
  attend(id: string | null): void;
  readonly pointed: string | null;
  point(id: string | null): void;
  mark(): number;
  file(): { notes: unknown[]; archive: unknown[] };
  listen(listener: () => void): () => void;
}

const KEPT = new WeakMap<Session, Notes>();

/**
 * The notes of a session: the same object each time it is asked for, kept by the session object itself, weakly. The
 * session asks for it when it is opened, since its `unsaved` follows the notes' mark.
 */
export function notesOf(session: Session): Notes {
  let kept = KEPT.get(session);
  if (!kept) {
    kept = passThrough(session);
    KEPT.set(session, kept);
  }
  return kept;
}

/** The skeleton: the file's notes as they are, which nothing can change yet. */
function passThrough(session: Session): Notes {
  const file = fileNotesOf(session);
  const builds = (name: string) => (): never => { throw new Error(`notesOf.${name}: package 2-7 builds it`); };
  return {
    open: file.notes as readonly Note[],
    archive: file.archive as readonly Note[],
    add: builds('add'),
    setText: builds('setText'),
    moveTo: builds('moveTo'),
    remove: builds('remove'),
    archiveNote: builds('archiveNote'),
    restore: builds('restore'),
    attended: null,
    attend: builds('attend'),
    pointed: null,
    point: builds('point'),
    mark: () => 0,
    file: () => file,
    listen: () => () => {},
  };
}
