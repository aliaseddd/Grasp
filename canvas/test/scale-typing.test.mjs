// Scale: a keystroke in the name field takes under 50 ms on a model of 5,000 elements in 3 views (step 7 of the plan).
// The model is generated (scale-model.mjs); the keys are real, timed from keydown to the end of the input event and of
// the frame that shows it (helpers.mjs, timing). A name typed is one undo step: its first keystroke opens the step and
// the others join it, so the median of each kind must be under the limit. Marked todo until step 8, the scale work.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { SCALE_WAIT, clickElement, finish, importLarge, launch, lookAt, measure, openCanvas, timing, until } from './helpers.mjs';
import { VIEWS, middleService, scaleState } from './scale-model.mjs';

const ELEMENTS = 5000;
const LIMIT = 50; // ms
const NAMES = 3;  // names typed, each one undo step
const KEYS = 3;   // keystrokes in each name

describe('scale: typing a name', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test(`a keystroke in the name field takes under ${LIMIT} ms at ${ELEMENTS} elements in 3 views`,
    { todo: 'step 8: every keystroke lays out, draws and checks the whole model again' }, async () => {
      const ctx = await openCanvas(browser);
      const { page } = ctx;
      await importLarge(page, scaleState(ELEMENTS));
      const id = middleService(ELEMENTS);
      await lookAt(page, VIEWS.definitions, id);
      await clickElement(page, id);
      await until(page, (el) => !!document.querySelector(`.is-selected[data-el="${el}"]`), id, `${id} is selected`, SCALE_WAIT);

      const time = await timing(page, 'keydown', 'input');
      const opening = measure(NAMES, LIMIT);
      const joining = measure(NAMES * (KEYS - 1), LIMIT);
      let typed = await page.inputValue('#f-name');
      for (let name = 0; name < NAMES && !(opening.settled && joining.settled); name++) {
        await page.click('#f-name');
        await page.keyboard.press('End');
        for (let k = 0; k < KEYS; k++) {
          const letter = String.fromCharCode(97 + name * KEYS + k);
          (k ? joining : opening).add(await time(() => page.keyboard.press(letter)));
          typed += letter;
        }
        await page.keyboard.press('Tab'); // leaving the field ends the name's undo step
      }
      const name = await page.evaluate((el) => window.SysMLCanvas.state.model.elements.find((e) => e.id === el).name, id);
      assert.equal(name, typed, 'every keystroke reached the name');
      assert.ok(opening.median < LIMIT && joining.median < LIMIT,
        `A keystroke takes ${opening.median.toFixed(1)} ms when it opens a name's undo step and ${joining.median.toFixed(1)} ms when it joins one, ` +
        `by the median, against ${LIMIT} ms.\nOpening, in ms: ${opening}\nJoining, in ms: ${joining}`);
      await finish(ctx);
    });
});
