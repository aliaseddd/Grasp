// Scale: the checks take under 100 ms on a model of 10,000 elements (step 7 of the plan): SysMLModel.validate, run in
// the page on a generated model (scale-model.mjs) that has no problems, the median of a few runs after a first one
// that warms it up. The specification's rules (validateSpec, the Validation view's), which run with the checks, keep
// to the same limit on the same model.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { finish, launch, measure, openCanvas } from './helpers.mjs';
import { scaleModel } from './scale-model.mjs';

const ELEMENTS = 10000;
const LIMIT = 100; // ms
const RUNS = 5;

describe('scale: the checks', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test(`the checks take under ${LIMIT} ms at ${ELEMENTS} elements`, async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const found = await page.evaluate((model) => {
      window.__scaleModel = window.SysMLModel.normalize(model);
      return window.SysMLModel.validate(window.__scaleModel).length;
    }, scaleModel(ELEMENTS));
    assert.equal(found, 0, 'the model has no problems');
    const checks = measure(RUNS, LIMIT);
    while (!checks.settled) {
      checks.add(await page.evaluate(() => {
        const start = performance.now();
        window.SysMLModel.validate(window.__scaleModel);
        return { total: performance.now() - start };
      }));
    }
    assert.ok(checks.median < LIMIT, `The checks take ${checks.median.toFixed(1)} ms by the median, against ${LIMIT} ms.\nIn ms: ${checks}`);
    await finish(ctx);
  });

  test(`the specification's rules take under ${LIMIT} ms at ${ELEMENTS} elements`, async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const found = await page.evaluate((model) => {
      window.__scaleModel = window.SysMLModel.normalize(model);
      return window.SysMLModel.validateSpec(window.__scaleModel).length;
    }, scaleModel(ELEMENTS));
    assert.equal(found, 0, 'the model breaks none of them');
    const rules = measure(RUNS, LIMIT);
    while (!rules.settled) {
      rules.add(await page.evaluate(() => {
        const start = performance.now();
        window.SysMLModel.validateSpec(window.__scaleModel);
        return { total: performance.now() - start };
      }));
    }
    assert.ok(rules.median < LIMIT, `The rules take ${rules.median.toFixed(1)} ms by the median, against ${LIMIT} ms.\nIn ms: ${rules}`);
    await finish(ctx);
  });
});
