// Scale: a drag move takes under 16 ms, one frame, on a model of 5,000 elements in 3 views (step 7 of the plan). The
// model is generated (scale-model.mjs); the mouse is real, each move timed from its pointermove to the end of the frame
// that shows it (helpers.mjs, timing). A drag is one undo step: its first move opens the step and the others join it,
// so the median of each kind must be under the limit. Marked todo until step 8, the scale work.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { SCALE_WAIT, finish, importLarge, launch, lookAt, measure, openCanvas, timing, until } from './helpers.mjs';
import { VIEWS, middleService, scaleState } from './scale-model.mjs';

const ELEMENTS = 5000;
const LIMIT = 16;     // ms
const DRAGS = 3;      // each one undo step
const MOVES = 4;      // moves in each drag
const STEP = [12, 6]; // screen px per move, the drawing's units at 100%

describe('scale: dragging a box', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test(`a drag move takes under ${LIMIT} ms at ${ELEMENTS} elements in 3 views`,
    { todo: 'step 8: every move lays out, draws and checks the whole model again' }, async () => {
      const ctx = await openCanvas(browser);
      const { page } = ctx;
      await importLarge(page, scaleState(ELEMENTS));
      const id = middleService(ELEMENTS);
      await lookAt(page, VIEWS.definitions, id);
      const place = () => page.evaluate(([view, el]) => {
        const lay = window.SysMLCanvas.state.model.views.find((v) => v.id === view).layout[el];
        return { x: lay.x, y: lay.y };
      }, [VIEWS.definitions, id]);
      const start = await place();

      const time = await timing(page, 'pointermove', 'pointermove');
      const opening = measure(DRAGS, LIMIT);
      const joining = measure(DRAGS * (MOVES - 1), LIMIT);
      let steps = 0; // moves made, net of direction
      for (let drag = 0; drag < DRAGS && !(opening.settled && joining.settled); drag++) {
        const box = await page.locator(`#drawing g.frame[data-view="${VIEWS.definitions}"] g[data-el="${id}"] > rect.outline`).boundingBox();
        assert.ok(box, `${id} is drawn`);
        const from = { x: box.x + box.width * 0.35, y: box.y + box.height * 0.35 };
        const way = drag % 2 ? -1 : 1; // there and back, so the box stays in its cell
        await page.evaluate(() => { document.querySelector('#status').textContent = ''; });
        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        for (let m = 1; m <= MOVES; m++) {
          (m > 1 ? joining : opening).add(await time(() => page.mouse.move(from.x + way * STEP[0] * m, from.y + way * STEP[1] * m)));
        }
        await page.mouse.up();
        await until(page, () => /^Moved /.test(document.querySelector('#status').textContent), null, 'the drop is reported', SCALE_WAIT);
        steps += way * MOVES;
      }
      assert.deepEqual(await place(), { x: start.x + steps * STEP[0], y: start.y + steps * STEP[1] }, 'every move reached the box');
      assert.ok(opening.median < LIMIT && joining.median < LIMIT,
        `A drag move takes ${opening.median.toFixed(1)} ms when it opens a drag's undo step and ${joining.median.toFixed(1)} ms when it joins one, ` +
        `by the median, against ${LIMIT} ms.\nOpening, in ms: ${opening}\nJoining, in ms: ${joining}`);
      await finish(ctx);
    });
});
