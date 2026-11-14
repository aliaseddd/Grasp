// The shot grid.png (plan/slice-2.md, section 6, one of the five that are rated). THE SCAFFOLD'S SKELETON: package 2-12
// owns this file and writes take().
//
// The scenario. The grid fixture, `elementTable` in front, both sides collapsed.
//
// What must be seen, which a reviewer that sees only the image and this list marks present or absent (criterion 7):
// 1. A table with one header row: kind, name, type, multiplicity, owner, doc, specializes.
// 2. Thirteen rows under it.
// 3. The header is set apart from the rows by weight or ground.
// 4. Every cell's text starts at its column's left edge, and a text too long for its cell ends in an ellipsis.
// 5. The row of `Host` carries pin 1 at its right end.
// 6. The table is as wide as the tab or scrolls; no column is cut off without a scroll bar.
//
// How it is taken. shots.mjs gives take() the page as it opens, 1400 by 900 at device scale 2, with no file open, and
// the folder to write into (canvas/app/shots/); take() brings the page to the scenario and writes `${out}/grid.png`
// itself. `picker: false`, beside `name`, asks for a page without showOpenFilePicker, which openStateFile of
// helpers.mjs needs. shots/about.mjs and shots/palette.mjs are slice 1's, to read first.
//
// While `pending` is true, `npm run shots` leaves this shot out and says so, and `npm run shots -- grid` runs it.
// Package 2-12 writes take() and takes `pending` off in the same change, so that the shot is taken with the others from
// then on; shots.mjs itself does not change.

export default {
  name: 'grid',
  package: '2-12',
  pending: true,
  /** Gets the page as it opens and the folder to write into; writes `${out}/grid.png`. */
  take: async (_page, _out) => {
    throw new Error('grid: package 2-12 takes it');
  },
};
