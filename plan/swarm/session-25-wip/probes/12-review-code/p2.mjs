import fs from 'node:fs';
import { launch, openIn, stateFileOf, modelOf, EXAMPLE, showSide, untilDrawn, readV, frame, shownIn, saysIn, byTestId, V } from './h.mjs';
const b = await launch();
const view = modelOf(EXAMPLE).views[0];
const o = await openIn(b, stateFileOf('mixed.json', JSON.parse(fs.readFileSync('mixed.json', 'utf8'))));
const { page } = o;
await untilDrawn(page, view);
await showSide(page, 'Validation');
await page.waitForTimeout(300);
const r = await readV(page);
console.log(JSON.stringify(r.lists, null, 0));
const planeSel = () => page.evaluate(() => ({
  nodes: [...document.querySelectorAll('.react-flow__node.selected')].map(n => n.dataset.id),
  edges: [...document.querySelectorAll('.react-flow__edge.selected')].map(n => n.dataset.id),
  pane: document.querySelector('[data-testid="plane"]')?.getAttribute('data-selected') ?? null,
}));
const explorerSel = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="explorer"] [role="treeitem"][aria-selected="true"]')].map(t => t.querySelector('[data-row]')?.dataset.row));
for (const key of ['el:ServerHost', 'view:v-proof', 'rel:t-hosts-api', 'rel:s-DevHost', 'package:']) {
  await showSide(page, 'Validation');
  const loc = page.locator(`${V} [data-entry="${key}"]`).first();
  await loc.click();
  await frame(page); await frame(page);
  const plane = await planeSel();
  const cur = await page.evaluate((v) => [...document.querySelectorAll(v + ' [aria-current="true"]')].map(e => e.dataset.entry), V);
  await page.locator('[data-testid="details"]').waitFor({ state: 'attached' }).catch(() => {});
  const det = await shownIn(page);
  const says = await saysIn(page);
  await showSide(page, 'Explorer');
  await frame(page);
  const ex = await explorerSel();
  console.log(key, '| plane', JSON.stringify(plane), '| aria-current', JSON.stringify(cur), '| details', det, says, '| explorer', JSON.stringify(ex));
}
console.log('problems', o.problems);
await b.close();
