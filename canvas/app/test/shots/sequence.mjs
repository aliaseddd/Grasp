// The shot sequence.png (plan/slice-2.md, section 6, one of the five that are rated). THE SCAFFOLD'S SKELETON: package
// 2-10 owns this file and writes take().
//
// The scenario. The sequence fixture, `loginSequence` fitted, both sides collapsed.
//
// What must be seen, which a reviewer that sees only the image and this list marks present or absent (criterion 7):
// 1. Three heads in one row at the top, left to right `client`, `server`, `auth`, each a rounded box with «part» and
//    its name line.
// 2. A dashed line down from the middle of each head, as long as the others.
// 3. Two dots on the line of `client`, named `loginSent` and `loginDone`.
// 4. Four arrows, each on a row of its own, from the top: `login`, `checkCredentials`, `credentialsOk`, `loggedIn`.
// 5. Each arrow is level, has a closed, unfilled head at the end it goes to, and its name above it.
// 6. `login` starts at the dot `loginSent`, and `loggedIn` ends at the dot `loginDone`.
// 7. Pin 1 at the middle of `login`.
// 8. No name overlaps a line or another name.
//
// How it is taken. shots.mjs gives take() the page as it opens, 1400 by 900 at device scale 2, with no file open, and
// the folder to write into (canvas/app/shots/); take() brings the page to the scenario and writes `${out}/sequence.png`
// itself. `picker: false`, beside `name`, asks for a page without showOpenFilePicker, which openStateFile of
// helpers.mjs needs. shots/about.mjs and shots/palette.mjs are slice 1's, to read first.
//
// While `pending` is true, `npm run shots` leaves this shot out and says so, and `npm run shots -- sequence` runs it.
// Package 2-10 writes take() and takes `pending` off in the same change, so that the shot is taken with the others from
// then on; shots.mjs itself does not change.

export default {
  name: 'sequence',
  package: '2-10',
  pending: true,
  /** Gets the page as it opens and the folder to write into; writes `${out}/sequence.png`. */
  take: async (_page, _out) => {
    throw new Error('sequence: package 2-10 takes it');
  },
};
