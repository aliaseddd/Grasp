import { launch, openIn, stateFileAt, EXAMPLE, modelOf, untilDrawn, pickBox, fieldIn, steps, active, tick, log, showSide, el, val, groundPoint } from './lib.mjs';
const VIEW = modelOf(EXAMPLE).views[0];
const browser = await launch();
const o = await openIn(browser, stateFileAt(EXAMPLE));
const { page } = o;
await untilDrawn(page, VIEW);
await showSide(page, 'Details');
await pickBox(page, VIEW, 'Host');
await fieldIn(page, 'name').click(); await page.keyboard.press('End');
await page.keyboard.type(' A b'); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('Delete'); await page.keyboard.press('Backspace');
await tick(page, 2);
log({ field: await val(page, 'field-name'), model: (await el(page, 'Host')).name, steps: await steps(page), active: await active(page) });
await page.keyboard.press('Tab'); await tick(page);
// marquee still works after typing with shift?
const g = await groundPoint(page, VIEW);
await page.mouse.click(g.x, g.y); await tick(page);
log('selection after ground click', await page.evaluate(() => window.Grasp.selection.items));
log('problems', o.problems);
await browser.close();
