import {
  launch, openIn, stateFileAt, EXAMPLE, modelOf, untilDrawn, pickBox, fieldIn, steps, active, val, shown, tick, log, showSide, el, byTestId, showTab, WAIT,
} from './lib.mjs';

const VIEW = modelOf(EXAMPLE).views[0];
const browser = await launch();
const o = await openIn(browser, stateFileAt(EXAMPLE));
const { page } = o;
await untilDrawn(page, VIEW);
await showSide(page, 'Details');
await pickBox(page, VIEW, 'Host');
await showTab(page, 'Advanced');
await showTab(page, 'Core');
await fieldIn(page, 'name').click();
await page.keyboard.press('End');
await page.keyboard.type('Q');
await page.evaluate(() => { window.__first = window.Grasp.session; });
let chooser = null;
page.waitForEvent('filechooser', { timeout: WAIT }).then((c) => { chooser = c; }, () => {});
await page.locator(byTestId('open')).click();
await tick(page, 3);
await page.locator('[role="dialog"] button', { hasText: 'Open another' }).click();
for (let i = 0; i < 60 && !chooser; i++) await tick(page);
log('chooser', !!chooser);
const f = stateFileAt(EXAMPLE);
await chooser.setFiles({ name: f.name, mimeType: 'application/json', buffer: f.buffer });
for (let i = 0; i < 60; i++) { await tick(page); if (await page.evaluate(() => window.Grasp.session !== window.__first)) break; }
await untilDrawn(page, VIEW);
log('after reopen', { shown: await shown(page), steps: await steps(page), first: await page.evaluate(() => ({ steps: window.__first.history.steps.map((s) => s.what + (s.key ? ' [' + s.key + ']' : '')), name: window.__first.model.elements.find((e) => e.id === 'Host').name })) });
await tick(page, 30);
const b = await page.evaluate(() => { const n = document.querySelector('.react-flow__node[data-id="Host"]'); const r = n.getBoundingClientRect(); return { x: r.x + 24, y: r.y + 12, n: document.querySelectorAll('.react-flow__node[data-id="Host"]').length, planes: document.querySelectorAll('[data-testid="plane"]').length }; });
log('box', b);
await page.mouse.click(b.x, b.y);
await tick(page, 5);
log('sel', await page.evaluate(() => ({ sel: window.Grasp.selection.items, first: window.__first === window.Grasp.session, selected: document.querySelector('.react-flow__node[data-id="Host"]').className })));
await page.mouse.click(b.x, b.y);
await tick(page, 5);
log('sel2', await page.evaluate(() => ({ sel: window.Grasp.selection.items, selected: document.querySelector('.react-flow__node[data-id="Host"]').className })));
await pickBox(page, VIEW, 'Host');
log('picked again', { shown: await shown(page), name: await val(page, 'field-name'), tab: await page.evaluate(() => document.querySelector('[data-testid="details"] [role="tab"][aria-selected="true"]')?.textContent) });
await fieldIn(page, 'name').click();
await page.keyboard.press('End');
await page.keyboard.type('W');
await page.keyboard.press('Tab');
await tick(page, 2);
log('typed W', { steps: await steps(page), model: (await el(page, 'Host')).name, first: await page.evaluate(() => window.__first.model.elements.find((e) => e.id === 'Host').name) });
// Ctrl+Z in doc (focus now there) -> does browser undo reach the old session's input? it was detached
await page.keyboard.press('Control+z');
await tick(page, 3);
log('ctrl+z in doc', { steps: await steps(page), active: await active(page), model: (await el(page, 'Host')).name });
log('problems', o.problems);
await browser.close();
