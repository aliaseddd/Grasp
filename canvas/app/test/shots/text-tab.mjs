// The shot text-tab.png (plan/slice-2.md, section 6). THE SCAFFOLD'S SKELETON: package 2-9 owns this file and writes
// take().
//
// The scenario. The example, its text tab in front.
//
// What must be seen, which a reviewer that sees only the image and this list marks present or absent (criterion 7):
// 1. A tab titled `StrongholdProof.sysml` beside the view's tab, in front.
// 2. The text begins `package StrongholdProof {`.
// 3. The text is in a fixed-width font and its lines are not wrapped mid-word.
// 4. A Copy button at the top of the tab.
// 5. A line at the top that says no problem was found.
//
// How it is taken. shots.mjs gives take() the page as it opens, 1400 by 900 at device scale 2, with no file open, and
// the folder to write into (canvas/app/shots/); take() brings the page to the scenario and writes `${out}/text-tab.png`
// itself. `picker: false`, beside `name`, asks for a page without showOpenFilePicker, which openStateFile of
// helpers.mjs needs. shots/about.mjs and shots/palette.mjs are slice 1's, to read first.
//
// While `pending` is true, `npm run shots` leaves this shot out and says so, and `npm run shots -- text-tab` runs it.
// Package 2-9 writes take() and takes `pending` off in the same change, so that the shot is taken with the others from
// then on; shots.mjs itself does not change.

export default {
  name: 'text-tab',
  package: '2-9',
  pending: true,
  /** Gets the page as it opens and the folder to write into; writes `${out}/text-tab.png`. */
  take: async (_page, _out) => {
    throw new Error('text-tab: package 2-9 takes it');
  },
};
