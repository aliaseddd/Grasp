// The shot connect-menu.png (plan/slice-2.md, section 6). THE SCAFFOLD'S SKELETON: package 2-2 owns this file and
// writes take().
//
// The scenario. The example. A line dragged from the bottom grip of `hosts` and let go on `app`, where two kinds fit.
//
// What must be seen, which a reviewer that sees only the image and this list marks present or absent (criterion 7):
// 1. A menu at the place the line was let go.
// 2. It lists "specializes" and "connection", one a row, and nothing else.
// 3. The dashed line from the grip of `hosts` to the menu's corner is still drawn.
// 4. `app` has a dashed teal outline.
// 5. The grips of `hosts` are shown, each clear of its port.
// 6. The menu covers no part of `hosts`.
//
// How it is taken. shots.mjs gives take() the page as it opens, 1400 by 900 at device scale 2, with no file open, and
// the folder to write into (canvas/app/shots/); take() brings the page to the scenario and writes
// `${out}/connect-menu.png` itself. `picker: false`, beside `name`, asks for a page without showOpenFilePicker, which
// openStateFile of helpers.mjs needs. shots/about.mjs and shots/palette.mjs are slice 1's, to read first.
//
// While `pending` is true, `npm run shots` leaves this shot out and says so, and `npm run shots -- connect-menu` runs
// it. Package 2-2 writes take() and takes `pending` off in the same change, so that the shot is taken with the others
// from then on; shots.mjs itself does not change.

export default {
  name: 'connect-menu',
  package: '2-2',
  pending: true,
  /** Gets the page as it opens and the folder to write into; writes `${out}/connect-menu.png`. */
  take: async (_page, _out) => {
    throw new Error('connect-menu: package 2-2 takes it');
  },
};
