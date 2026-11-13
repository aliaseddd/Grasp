// The shot palette.png (plan/slice-1.md, section 4; plan/swarm/step-11.md, "The screenshot"). A test task of step 11
// writes take() and leaves `pending: true`, so that `npm run shots` goes on leaving this shot out while its step is not
// built; the step's closing takes `pending` off. A shot that is named (`npm run shots -- palette`) runs though pending.

import path from 'node:path';
import { boxOf, byTestId, EXAMPLE, modelOf, openStateFile, soon, stateFileAt, TESTIDS, untilDrawn, untilLines } from '../helpers.mjs';

const VIEW = modelOf(EXAMPLE).views[0];

/** The menu's top left corner and its entries (data-tool, or '|' for a separator), or null while it is not in the document. */
const menuOf = (page) => page.evaluate((selector) => {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, entries: [...el.children].map((c) => (c.getAttribute('role') === 'separator' ? '|' : c.getAttribute('data-tool') ?? c.textContent.trim())) };
}, byTestId(TESTIDS.palette));

export default {
  name: 'palette',
  step: 11,
  picker: false,
  pending: true,
  /** Gets the page as it opens, 1400 x 900 at device scale 2, without the file picker; writes `${out}/palette.png`. */
  take: async (page, out) => {
    await openStateFile(page, stateFileAt(EXAMPLE));
    await untilDrawn(page, VIEW);
    await untilLines(page, VIEW, 6);
    const box = await boxOf(page, VIEW.id, 'Host');
    const point = { x: box.x + 120 * box.zoom, y: box.y + 60 * box.zoom };
    await page.mouse.click(point.x, point.y, { button: 'right' });
    let found = null;
    try {
      found = await soon(page, async () => {
        const m = await menuOf(page);
        return m && Math.abs(m.x - point.x) <= 2 && Math.abs(m.y - point.y) <= 2 ? m : null;
      }, 'The palette did not open at the pointer.');
    } catch {
      throw new Error('The palette did not open at the pointer.');
    }
    if (found.entries.join(',') !== 'PartUsage,PortUsage,|,Specialization') {
      throw new Error(`The palette on Host lists ${found.entries.join(', ')}, not part, port, a separator and specializes.`);
    }
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.screenshot({ path: path.join(out, 'palette.png') });
  },
};
