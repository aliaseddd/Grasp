// The shot about.png (plan/slice-1.md, section 4; plan/swarm/step-12.md, "The screenshot"). A test task of step 12
// writes take() and leaves `pending: true`, so that `npm run shots` goes on leaving this shot out while its step is not
// built; the step's closing takes `pending` off. A shot that is named (`npm run shots -- about`) runs though pending.

import path from 'node:path';
import { BROWSER_FRAMES, byTestId, frame, soon, TESTIDS } from '../helpers.mjs';

/** GitHub's answer, stubbed: the page asks for nothing outside its folder, and the line reads the same each time. */
const RATE = { resources: { core: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } }, rate: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } };

const PANEL = byTestId(TESTIDS.aboutPanel);
const LINES = `${PANEL} [data-line]`;

export default {
  name: 'about',
  step: 12,
  /** Gets the page as it opens, 1400 x 900 at device scale 2, with its pickers and no file; writes `${out}/about.png`. */
  take: async (page, out) => {
    await page.context().route('https://api.github.com/rate_limit', (route) => route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(RATE),
    }));
    const button = page.locator(byTestId(TESTIDS.about));
    if (!(await button.count()) || !(await button.isEnabled())) {
      throw new Error(`About is disabled (data-testid "${TESTIDS.about}"), so the About panel cannot be opened and there is nothing to take a picture of.`);
    }
    await button.click();
    await soon(page, async () => (await page.locator(PANEL).count()) > 0, `A click on About showed no About panel (data-testid "${TESTIDS.aboutPanel}").`);
    const states = () => page.evaluate((selector) => [...document.querySelectorAll(selector)].map((el) => el.getAttribute('data-state')), LINES);
    await soon(page, async () => { const s = await states(); return s.length === 13 && !s.includes('pending'); },
      async () => { const s = await states(); return `The About panel has ${s.length} lines and ${s.filter((x) => x === 'pending').length} still say Asking…: thirteen lines, all answered, were expected.`; },
      BROWSER_FRAMES);
    await page.mouse.move(700, 880); // off the bar's button, so that its tooltip goes
    const settled = () => page.evaluate(() => {
      const container = document.querySelector('.MuiDialog-container');
      return !document.querySelector('[role="tooltip"]') && !!container && getComputedStyle(container).opacity === '1';
    });
    await soon(page, settled, 'A tooltip is still on the page, or the dialog\'s fade (.MuiDialog-container, opacity 1) is not over.', BROWSER_FRAMES);
    await frame(page);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.screenshot({ path: path.join(out, 'about.png') });
  },
};
