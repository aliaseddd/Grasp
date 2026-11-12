// The page's shell, opened from file:// in Chromium. Its first test is slice 1's first "Done when" check.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { buildFiles } from '../build.mjs';
import { byTestId, finish, launch, openPage, TESTIDS } from './helpers.mjs';

describe('the shell', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(async () => { await browser?.close(); });

  test('from file://, the page opens with no console error', async () => {
    const { vendorModules } = await buildFiles();
    const opened = await openPage(browser);
    const { page } = opened;
    assert.match(await page.textContent(byTestId(TESTIDS.app)), /Grasp/);
    assert.equal(await page.evaluate(() => window.SysMLModel && window.SysMLModel.FORMAT), 'grasp/2');
    const keys = await page.evaluate(() => Object.keys(window.GraspVendor || {}));
    assert.deepEqual([...keys].sort(), [...vendorModules].sort());
    await finish(opened);
  });
});
