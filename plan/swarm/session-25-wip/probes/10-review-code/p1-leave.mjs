import {
  launch, openIn, stateFileAt, EXAMPLE, modelOf, untilDrawn, pickBox, fieldIn, steps, active, val, shown, tick, log, groundPoint,
  showTab, byTestId, undone, sel, DETAILS, showSide,
} from './lib.mjs';

const VIEW = modelOf(EXAMPLE).views[0];
const browser = await launch();
async function fresh() {
  const o = await openIn(browser, stateFileAt(EXAMPLE));
  await untilDrawn(o.page, VIEW);
  await showSide(o.page, 'Details');
  await pickBox(o.page, VIEW, 'Host');
  return o;
}
async function typeIn(page, field, text) {
  const f = fieldIn(page, field);
  await f.click();
  await page.keyboard.press('End');
  await page.keyboard.type(text);
  await tick(page);
}
const cases = {
  async tab(page) { await typeIn(page, 'name', 'X'); await page.keyboard.press('Tab'); },
  async plane(page) { await typeIn(page, 'name', 'X'); const p = await groundPoint(page, VIEW); await page.mouse.click(p.x, p.y); },
  async otherTab(page) { await typeIn(page, 'name', 'X'); await page.locator(DETAILS).getByRole('tab', { name: 'Advanced' }).click(); },
  async otherViewTab(page) { await typeIn(page, 'name', 'X'); await page.getByRole('tab', { name: 'Explorer', exact: true }).click(); },
  async open(page) { await typeIn(page, 'name', 'X'); await page.locator(byTestId('open')).click(); },
  async enterThenType(page) { await typeIn(page, 'name', 'X'); await page.keyboard.press('Enter'); await page.keyboard.type('Y'); await tick(page); },
  async escape(page) { await typeIn(page, 'name', 'X'); await page.keyboard.press('Escape'); await tick(page); },
  async otherBox(page) { await typeIn(page, 'name', 'X'); await pickBox(page, VIEW, 'ServerHost'); },
};
for (const [name, act] of Object.entries(cases)) {
  const o = await fresh();
  const { page } = o;
  try {
    await act(page);
    await tick(page, 3);
    log(name, { steps: await steps(page), active: await active(page), shown: await shown(page), sel: await sel(page), problems: o.problems, dialogs: o.dialogs });
  } catch (e) { log(name, 'ERR', e.message.split('\n')[0]); }
  await o.context.close();
}
await browser.close();
