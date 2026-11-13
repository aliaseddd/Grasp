// The shot palette.png (plan/slice-1.md, section 4; plan/swarm/step-11.md, "The screenshot"). Step 11 writes take()
// and takes `pending` off.

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
