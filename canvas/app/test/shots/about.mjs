// The shot about.png (plan/slice-1.md, section 4; plan/swarm/step-12.md, "The screenshot"). Step 12 writes take()
// and takes `pending` off.

export default {
  name: 'about',
  step: 12,
  picker: false,
  pending: true,
  /** Gets the page as it opens, 1400 x 900 at device scale 2, without the file picker; writes `${out}/about.png`. */
  take: async (_page, _out) => {
    throw new Error('shot about: step 12 builds it');
  },
};
