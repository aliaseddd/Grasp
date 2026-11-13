import * as H from '../rd-all/canvas/app/test/helpers.mjs';
import { mergedFixtures } from './merged.mjs';
const browser = await H.launch();
const M = JSON.parse(JSON.stringify(H.lib.normalize(mergedFixtures(H.lib))));
const opened = await H.openIn(browser, H.stateFileOf('fields.json', { model: mergedFixtures(H.lib), notes: [], archive: [] }));
const { page } = opened;
const tabs = () => page.getByRole('tab').evaluateAll((els) => els.map((e) => (e.getAttribute('aria-label') || '').split(' : ')[0] + ':' + e.getAttribute('aria-selected') + ':' + Math.round(e.getBoundingClientRect().x)).filter((s) => !/^(Explorer|Tools|Validation|Details|):/.test(s)));
console.log(await tabs());
for (const id of ['f-v-plan', 'i-v-seq', 'a-v-proof']) {
  const view = M.views.find((v) => v.id === id);
  const tab = await H.viewTab(page, view);
  await tab.click({ timeout: 5000 }); await H.frame(page); await H.frame(page);
  console.log(id, 'selected', await tab.getAttribute('aria-selected'), await tabs());
}
console.log('problems', opened.problems);
await browser.close();
