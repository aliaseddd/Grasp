// The shot palette.png (plan/slice-1.md, section 4; plan/swarm/step-11.md, "The screenshot"). A test task of step 11
// writes take() and leaves `pending: true`, so that `npm run shots` goes on leaving this shot out while its step is not
// built; the step's closing takes `pending` off. A shot that is named (`npm run shots -- palette`) runs though pending.

export default {
  name: 'palette',
  step: 11,
  picker: false,
  pending: true,
  /** Gets the page as it opens, 1400 x 900 at device scale 2, without the file picker; writes `${out}/palette.png`. */
  take: async (_page, _out) => {
    throw new Error('shot palette: step 11 builds it');
  },
};
