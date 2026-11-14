// The shot notes.png (plan/slice-2.md, section 6, one of the five that are rated). THE SCAFFOLD'S SKELETON: package 2-7
// owns this file and writes take().
//
// The scenario. The annotations fixture, its view fitted, the Notes panel shown and the archive opened.
//
// What must be seen, which a reviewer that sees only the image and this list marks present or absent (criterion 7):
// 1. The Notes panel lists three notes, numbered 1, 2 and 3 from the top.
// 2. Note 1 says it is on part def Host; note 2 on the connection mount; note 3 on the plane.
// 3. Note 2 shows Claude's answer under its text and is marked resolved.
// 4. "Archive · 1" stands under the notes, with note 4 listed under it and a Restore button.
// 5. On the plane, pin 1 sits on the top edge of `Host`.
// 6. Pin 2 sits at the middle of the line `mount`, and is grey.
// 7. Pin 3 stands on the empty plane and is hollow.
// 8. No pin covers a name or another pin.
// 9. No text of a note is cut off.
//
// How it is taken. shots.mjs gives take() the page as it opens, 1400 by 900 at device scale 2, with no file open, and
// the folder to write into (canvas/app/shots/); take() brings the page to the scenario and writes `${out}/notes.png`
// itself. `picker: false`, beside `name`, asks for a page without showOpenFilePicker, which openStateFile of
// helpers.mjs needs. shots/about.mjs and shots/palette.mjs are slice 1's, to read first.
//
// While `pending` is true, `npm run shots` leaves this shot out and says so, and `npm run shots -- notes` runs it.
// Package 2-7 writes take() and takes `pending` off in the same change, so that the shot is taken with the others from
// then on; shots.mjs itself does not change.

export default {
  name: 'notes',
  package: '2-7',
  pending: true,
  /** Gets the page as it opens and the folder to write into; writes `${out}/notes.png`. */
  take: async (_page, _out) => {
    throw new Error('notes: package 2-7 takes it');
  },
};
