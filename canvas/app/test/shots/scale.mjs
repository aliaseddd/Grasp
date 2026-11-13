// The shot scale.png (plan/slice-1.md, section 4; plan/swarm/step-8.md, "The screenshot"). A test task of step 8
// writes take() and leaves `pending: true`, so that `npm run shots` goes on leaving this shot out while its step is not
// built; the step's closing takes `pending` off. A shot that is named (`npm run shots -- scale`) runs though pending.

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
