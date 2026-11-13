import { launch, openIn, stateFileAt, EXAMPLE, modelOf, showSide, untilDrawn, selectBox, fieldIn, readV, frame, undo, redo, byTestId } from './h.mjs';
const b = await launch();
const view = modelOf(EXAMPLE).views[0];
const o = await openIn(b, stateFileAt(EXAMPLE));
const { page } = o;
await showSide(page, 'Validation');
await untilDrawn(page, view);
console.log('example', JSON.stringify(await readV(page)));
await selectBox(page, view, 'App');
const f = fieldIn(page, 'name');
await f.click(); await f.press('Control+a');
const t0 = Date.now();
for (const ch of 'Host') { await f.type(ch, { delay: 0 }); await page.waitForTimeout(300); const r = await readV(page); console.log(Date.now() - t0, 'typed', ch, r.stale, JSON.stringify(r.lists.map(l => l.entries.length))); }
for (let i = 0; i < 12; i++) { await page.waitForTimeout(100); const r = await readV(page); console.log(Date.now() - t0, r.stale, JSON.stringify(r.lists.map(l => l.entries.map(e=>e[0])))); }
// keyboard undo in field
console.log('focused', await page.evaluate(() => document.activeElement?.tagName + ' ' + document.activeElement?.value));
await page.keyboard.press('Control+z');
await frame(page);
console.log('after ctrl+z in field: value', await f.inputValue(), JSON.stringify((await readV(page)).lists.map(l => l.entries.map(e=>e[0]))), (await readV(page)).stale);
await page.waitForTimeout(1000);
console.log('1s later', await f.inputValue(), JSON.stringify((await readV(page)).lists.map(l => l.entries.map(e=>e[0]))), (await readV(page)).stale);
console.log('undo btn enabled', await page.locator(byTestId('undo')).isEnabled(), 'redo', await page.locator(byTestId('redo')).isEnabled());
console.log('problems', o.problems);
await b.close();
