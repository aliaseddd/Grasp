import { launch, openIn, stateFileAt, EXAMPLE, modelOf, untilDrawn, pickBox, fieldIn, steps, tick, log, showSide, showTab, DETAILS, FIXTURES } from './lib.mjs';
import path from 'node:path';
const VIEW = modelOf(EXAMPLE).views[0];
const browser = await launch();
const o = await openIn(browser, stateFileAt(EXAMPLE));
const { page } = o;
await untilDrawn(page, VIEW);
await showSide(page, 'Details');
await pickBox(page, VIEW, 'App');
await showTab(page, 'Advanced');
const geo = await page.evaluate((root) => {
  const input = document.querySelector(`${root} [data-testid="field-abstract"]`);
  const label = input.closest('label');
  const panel = document.querySelector(root).getBoundingClientRect();
  const lr = label.getBoundingClientRect();
  const text = label.querySelector('.MuiFormControlLabel-label').getBoundingClientRect();
  return { panel: [panel.left, panel.right], label: [lr.left, lr.right, lr.top, lr.bottom], text: [text.left, text.right] };
}, DETAILS);
log(geo);
const x = geo.label[1] - 5, y = (geo.label[2] + geo.label[3]) / 2;
await page.mouse.click(x, y); await tick(page, 2);
log('after a click', geo.label[1] - 5 - geo.text[1], 'px right of the label text:', await steps(page), await fieldIn(page, 'abstract').isChecked());
// radio group rows
await page.close();
const o2 = await openIn(browser, stateFileAt(path.join(FIXTURES, 'interconnection.json')));
const p2 = o2.page;
await showSide(p2, 'Explorer');
await p2.locator('[data-testid="explorer"] [data-row="el:FuelPort.supply"]').click();
await showSide(p2, 'Details');
await showTab(p2, 'Core');
const g2 = await p2.evaluate((root) => {
  const fs = document.querySelector(`${root} [data-testid="field-direction"]`).closest('fieldset');
  const r = fs.getBoundingClientRect();
  const labels = [...fs.querySelectorAll('label')].map((l) => { const b = l.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right), l.textContent]; });
  return { fieldset: [r.left, r.right], labels };
}, DETAILS);
log(g2);
await browser.close();
