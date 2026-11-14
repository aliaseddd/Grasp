// The shot label-editor.png (plan/slice-2.md, section 6). THE SCAFFOLD'S SKELETON: package 2-3 owns this file and
// writes take().
//
// The scenario. The example at 150%. `hosts` picked, then F2.
//
// What must be seen, which a reviewer that sees only the image and this list marks present or absent (criterion 7):
// 1. One text box over the name line of `hosts`.
// 2. It holds `hosts[1..*] : Host`, all of it selected.
// 3. The text is centred, in the size the name is drawn at.
// 4. The box is at least as wide as the name was.
// 5. The box's border is teal.
// 6. No other box or line has moved.
//
// How it is taken. shots.mjs gives take() the page as it opens, 1400 by 900 at device scale 2, with no file open, and
// the folder to write into (canvas/app/shots/); take() brings the page to the scenario and writes
// `${out}/label-editor.png` itself. `picker: false`, beside `name`, asks for a page without showOpenFilePicker, which
// openStateFile of helpers.mjs needs. shots/about.mjs and shots/palette.mjs are slice 1's, to read first.
//
// While `pending` is true, `npm run shots` leaves this shot out and says so, and `npm run shots -- label-editor` runs
// it. Package 2-3 writes take() and takes `pending` off in the same change, so that the shot is taken with the others
// from then on; shots.mjs itself does not change.

export default {
  name: 'label-editor',
  package: '2-3',
  pending: true,
  /** Gets the page as it opens and the folder to write into; writes `${out}/label-editor.png`. */
  take: async (_page, _out) => {
    throw new Error('label-editor: package 2-3 takes it');
  },
};
