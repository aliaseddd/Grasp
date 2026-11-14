// The shot browser.png (plan/slice-2.md, section 6, one of the five that are rated). THE SCAFFOLD'S SKELETON: package
// 2-13 owns this file and writes take().
//
// The scenario. The browser fixture, `modelTree` in front, both sides collapsed.
//
// What must be seen, which a reviewer that sees only the image and this list marks present or absent (criterion 7):
// 1. A tree of rows, one for each element, each reading «keyword» then its name, with `: Type [multiplicity]` for a
//    usage.
// 2. What an element owns is under it, stepped in a level.
// 3. The row of `Host` is folded: its triangle points right and nothing is under it.
// 4. The lines are rows too, under the element they are declared in, as «connection» mount.
// 5. The row of `hosts` carries pin 1.
// 6. Every row is as high as the others, and no row's text is cut off.
//
// How it is taken. shots.mjs gives take() the page as it opens, 1400 by 900 at device scale 2, with no file open, and
// the folder to write into (canvas/app/shots/); take() brings the page to the scenario and writes `${out}/browser.png`
// itself. `picker: false`, beside `name`, asks for a page without showOpenFilePicker, which openStateFile of
// helpers.mjs needs. shots/about.mjs and shots/palette.mjs are slice 1's, to read first.
//
// While `pending` is true, `npm run shots` leaves this shot out and says so, and `npm run shots -- browser` runs it.
// Package 2-13 writes take() and takes `pending` off in the same change, so that the shot is taken with the others from
// then on; shots.mjs itself does not change.

export default {
  name: 'browser',
  package: '2-13',
  pending: true,
  /** Gets the page as it opens and the folder to write into; writes `${out}/browser.png`. */
  take: async (_page, _out) => {
    throw new Error('browser: package 2-13 takes it');
  },
};
