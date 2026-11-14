// The shot geometry.png (plan/slice-2.md, section 6, one of the five that are rated). THE SCAFFOLD'S SKELETON: package
// 2-11 owns this file and writes take().
//
// The scenario. The geometry fixture, `plan` fitted, both sides collapsed.
//
// What must be seen, which a reviewer that sees only the image and this list marks present or absent (criterion 7):
// 1. `room` as a rectangle a third wider than it is high.
// 2. Inside it `desk` and `cabinet` as smaller rectangles and `pillar` as a circle.
// 3. `desk` is left of `cabinet`, and `pillar` is above both, between them.
// 4. Each footprint has two lines of words: «part» and its name; its shape with its dimensions and unit, as "Box 2 × 1
//    × 0.75 m".
// 5. The words of a small footprint are below it, not across its outline.
// 6. Two axes from the lower left corner of `room`, named x and y, x to the right and y up.
// 7. A scale bar under the x axis that reads "1 m" and is an eighth as long as `room` is wide.
// 8. Pin 1 on `desk`.
//
// How it is taken. shots.mjs gives take() the page as it opens, 1400 by 900 at device scale 2, with no file open, and
// the folder to write into (canvas/app/shots/); take() brings the page to the scenario and writes `${out}/geometry.png`
// itself. `picker: false`, beside `name`, asks for a page without showOpenFilePicker, which openStateFile of
// helpers.mjs needs. shots/about.mjs and shots/palette.mjs are slice 1's, to read first.
//
// While `pending` is true, `npm run shots` leaves this shot out and says so, and `npm run shots -- geometry` runs it.
// Package 2-11 writes take() and takes `pending` off in the same change, so that the shot is taken with the others from
// then on; shots.mjs itself does not change.

export default {
  name: 'geometry',
  package: '2-11',
  pending: true,
  /** Gets the page as it opens and the folder to write into; writes `${out}/geometry.png`. */
  take: async (_page, _out) => {
    throw new Error('geometry: package 2-11 takes it');
  },
};
