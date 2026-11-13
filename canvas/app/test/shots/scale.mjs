// The shot scale.png (plan/slice-1.md, section 4; plan/swarm/step-8.md, "The screenshot"). A test task of step 8
// writes take() and leaves `pending: true`, so that `npm run shots` goes on leaving this shot out while its step is not
// built; the step's closing takes `pending` off. A shot that is named (`npm run shots -- scale`) runs though pending.

import path from 'node:path';
import { VIEWS, scaleState } from '../../../test/scale-model.mjs';
import { collapseSides, openStateFile, stateFileOf, untilDrawn } from '../helpers.mjs';

export default {
  name: 'scale',
  step: 8,
  picker: false,
  /** Gets the page as it opens, 1400 x 900 at device scale 2, without the file picker; writes `${out}/scale.png`. */
  take: async (page, out) => {
    const state = scaleState(5000);
    const view = state.model.views.find((v) => v.id === VIEWS.definitions);
    await collapseSides(page);
    await openStateFile(page, stateFileOf('scale-5000.json', state));
    await untilDrawn(page, view);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.mouse.move(700, 20); // a blank part of the bar: no tooltip in the image
    await page.screenshot({ path: path.join(out, 'scale.png') });
  },
};
