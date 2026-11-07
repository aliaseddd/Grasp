// Scale: a model of 10,000 elements saves to the page's store (step 7 of the plan). On the published page the model is
// kept in the page's store, whose limits the fake store keeps as the real one does (fake-store.test.mjs pins them): a
// document of at most 256 KiB serialized and 32 levels deep, at most 25,000 documents. The test imports a generated
// model (scale-model.mjs) in shared mode, lets the page save it, and opens a second page on what the store then holds,
// which must show the same model. Marked todo until step 8, the scale work.

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { after, before, describe, test } from 'node:test';
import { SCALE_WAIT, finish, importLarge, launch, openCanvas, storeDump, until } from './helpers.mjs';
import { scaleState } from './scale-model.mjs';

const ELEMENTS = 10000;
const QUIET = 2000; // ms the store has had nothing to do once the page wrote to it: past the page's pause before a save

/** The SHA-256 of the page's model, as JSON. */
const modelDigest = async (page) => createHash('sha256')
  .update(await page.evaluate(() => JSON.stringify(window.SysMLCanvas.state.model))).digest('hex');

describe('scale: saving', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test(`a model of ${ELEMENTS} elements saves to the store, and a page opened on the store shows it`,
    { todo: 'step 8: the model saves as one document, far over the store\'s 256 KiB' }, async () => {
      const ctx = await openCanvas(browser, { shared: true });
      const { page } = ctx;
      const calls = await page.evaluate(() => window.__store.log.length);
      await importLarge(page, scaleState(ELEMENTS));
      await until(page, ([n, quiet]) => window.__store.log.slice(n).some((call) => call.op === 'set' || call.op === 'update') && window.__store.idle() > quiet,
        [calls, QUIET], 'the page writes the model to the store, and the store goes quiet', SCALE_WAIT);
      const now = await page.evaluate(() => ({
        editable: window.SysMLCanvas.editable(),
        status: document.querySelector('#status').textContent,
        where: document.querySelector('#where').textContent,
      }));
      assert.ok(now.editable, `the page can still be changed once it saved. It says: "${now.status}" and "${now.where}"`);
      const saved = await modelDigest(page);

      const second = await openCanvas(browser, { shared: true, seed: await storeDump(page) });
      await until(second.page, (n) => window.SysMLCanvas.state.model.elements.length === n, ELEMENTS, `a page opened on the store shows ${ELEMENTS} elements`, SCALE_WAIT);
      assert.equal(await modelDigest(second.page), saved, 'the page opened on the store shows the model the first one saved');
      await finish(second);
      await finish(ctx);
    });
});
