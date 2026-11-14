// The shot badges.png (plan/slice-2.md, section 6). THE SCAFFOLD'S SKELETON: package 2-6 owns this file and writes
// take().
//
// The scenario. The example, with `App` renamed to `Page`, so that two part defs have one name. The Validation panel is
// shown.
//
// What must be seen, which a reviewer that sees only the image and this list marks present or absent (criterion 7):
// 1. A round "!" badge at the top right corner of each of the two part defs named `Page`.
// 2. No badge on any other box.
// 3. Neither badge covers a keyword or a name.
// 4. The Validation panel says how many problems there are, in digits.
// 5. The panel lists the problem in a sentence that names `Page`.
//
// How it is taken. shots.mjs gives take() the page as it opens, 1400 by 900 at device scale 2, with no file open, and
// the folder to write into (canvas/app/shots/); take() brings the page to the scenario and writes `${out}/badges.png`
// itself. `picker: false`, beside `name`, asks for a page without showOpenFilePicker, which openStateFile of
// helpers.mjs needs. shots/about.mjs and shots/palette.mjs are slice 1's, to read first.
//
// While `pending` is true, `npm run shots` leaves this shot out and says so, and `npm run shots -- badges` runs it.
// Package 2-6 writes take() and takes `pending` off in the same change, so that the shot is taken with the others from
// then on; shots.mjs itself does not change.

export default {
  name: 'badges',
  package: '2-6',
  pending: true,
  /** Gets the page as it opens and the folder to write into; writes `${out}/badges.png`. */
  take: async (_page, _out) => {
    throw new Error('badges: package 2-6 takes it');
  },
};
