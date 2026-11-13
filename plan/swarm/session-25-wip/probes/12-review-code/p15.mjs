import fs from 'node:fs';
import { launch, openIn, stateFileOf, modelOf, EXAMPLE, showSide, untilDrawn, readV, frame, shownIn, saysIn, V } from './h.mjs';
const b = await launch();
const view = modelOf(EXAMPLE).views[0];
const o = await openIn(b, stateFileOf('mixed.json', JSON.parse(fs.readFileSync('mixed.json', 'utf8'))));
const { page } = o;
await untilDrawn(page, view);
await showSide(page, 'Validation');
await page.locator(`${V} [data-entry="el:ServerHost"]`).click(); await frame(page);
console.log('picked', await shownIn(page));
// two edits within the pause: a doc change (makes the lists stale), then Specializes of DevHost taken away (s-DevHost leaves the model)
await page.evaluate(() => {
  const h = window.Grasp.session.history;
  h.edit(() => { h.model.elements.find(e => e.id === 'OnlineHost').doc = 'x'; return 'Wrote the doc'; });
});
await frame(page); await frame(page);
await page.evaluate(() => {
  const h = window.Grasp.session.history;
  h.edit(() => { const r = h.model.relationships; r.splice(r.findIndex(x => x.id === 's-DevHost'), 1); return 'Took away the specialization of part def DevHost'; });
});
await frame(page);
const r = await readV(page);
console.log('stale', r.stale, 'entries', JSON.stringify(r.lists[0].entries.map(e => [e[0], e[1]])));
console.log('model holds s-DevHost?', await page.evaluate(() => window.Grasp.session.model.relationships.some(x => x.id === 's-DevHost')));
await page.locator(`${V} [data-entry="rel:s-DevHost"]`).click({ timeout: 300 });
await frame(page);
console.log('after the click: details', await shownIn(page), '|', await saysIn(page));
await page.waitForTimeout(1000);
console.log('after the pause', JSON.stringify((await readV(page)).lists[0].entries.map(e => e[0])));
await b.close();
