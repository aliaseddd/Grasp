// The actions on notes. THE SCAFFOLD'S SKELETON: package 2-7 owns this file and builds it.
//
// Its rows (plan/slice-2.md, section 5, the table and flow 9; section 8, package 2-7):
// | id           | title                   | key | applies |
// | add-note     | Add note                |     | at a hit: on an element or a line that can carry a note, or on the ground (a free note there); with no hit: the last picked is such an element or line |
// | show-note    | Show what the note is on |    | there is a note that is not archived; the `choice` is the note's id |
// | archive-note | Archive                 |     | a note is resolved; the `choice` is the note's id |
// | restore-note | Restore                 |     | the archive holds a note; the `choice` is the note's id |
// | delete-note  | Delete note             |     | there is a note that is not archived; the `choice` is the note's id |
// What each says where it does not apply: "Pick a box or a line to note it, or right-click the plane where the note
// goes." or "<A start> can't carry a note. Note the element it belongs to instead."; "There is no note to show.";
// "No note is resolved yet. A note can be archived once it is resolved."; "The archive is empty."; "There is no note
// to delete." And from run: "What note 3 is on is no longer in the model.", "<Part def X> is drawn in no view.", "The
// view note 3 floats on is no longer in the model."; "Note 3 is not resolved yet. It can be archived once it is
// resolved."; "That note is no longer in the archive."; "That note is no longer there."
// None of them calls history.edit(): a change to a note is no undo step (notesOf of core/notes.ts).

import type { Action } from '../commands';
import type { Hit, Picked } from '../selection';
import type { Session } from '../session';

export const NOTE_ACTIONS: readonly Action[] = [];

/**
 * Whether a thing can carry a note: true, or the sentence that says why not. An element with no name in the text
 * (the library's textName is null: a start, a done, an initial node) can carry none: "<A start> can't carry a note.
 * Note the element it belongs to instead." notesOf refuses nothing, so whoever adds or moves a note asks here first.
 * Package 2-7 builds it.
 */
export function canCarry(_session: Session, _picked: Picked): true | string {
  throw new Error('canCarry: package 2-7 builds it');
}

/**
 * A pin's release (plane/gestures/pin.ts): on an element or a line that can carry a note, the note moves there; on
 * the ground, to that point of the view, in whole numbers; outside the body (`inside` false), nothing, and the pin
 * goes back; on an element that can carry none, the refusal is said (saysOf) and the pin goes back. A drop on what
 * the note is on already changes nothing and says nothing. Package 2-7 builds it.
 */
export function dropPin(_session: Session, _noteId: string, _hit: Hit, _inside: boolean): void {
  throw new Error('dropPin: package 2-7 builds it');
}
