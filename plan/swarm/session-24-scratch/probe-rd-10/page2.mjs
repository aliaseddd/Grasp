import * as H from '../rd-all/canvas/app/test/helpers.mjs';
import { mergedFixtures } from './merged.mjs';
const browser = await H.launch();
const t0 = Date.now();
const opened = await H.openIn(browser, H.stateFileOf('fields.json', { model: mergedFixtures(H.lib), notes: [], archive: [] }));
const { page } = opened;
console.log('opened in', Date.now() - t0, 'ms');
console.log('tabs', await page.getByRole('tab').evaluateAll((els) => els.map((e) => (e.getAttribute('aria-label') || e.textContent.trim()) + ':' + e.getAttribute('aria-selected'))));
try { await H.nothingPicked(page); } catch (e) { console.log(e.message.split('\n')[0]); }
console.log('problems', opened.problems);
await opened.context.close();
// geometry
const g = await H.openIn(browser, H.stateFileAt(H.TEN.find((f) => f.endsWith('geometry.json'))));
console.log('geometry tabs', await g.page.getByRole('tab').evaluateAll((els) => els.map((e) => (e.getAttribute('aria-label') || e.textContent.trim()) + ':' + e.getAttribute('aria-selected'))), g.problems);
await browser.close();
