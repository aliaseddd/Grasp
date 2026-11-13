// The shot scale.png (plan/slice-1.md, section 4; plan/swarm/step-8.md, "The screenshot"). Step 8 writes take()
// and takes `pending` off.

export default {
  name: 'scale',
  step: 8,
  picker: false,
  pending: true,
  /** Gets the page as it opens, 1400 x 900 at device scale 2, without the file picker; writes `${out}/scale.png`. */
  take: async (_page, _out) => {
    throw new Error('shot scale: step 8 builds it');
  },
};
