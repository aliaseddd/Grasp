import * as H from '../rd-all/canvas/app/test/helpers.mjs';
const browser = await H.launch();
const opened = await H.openIn(browser, H.stateFileAt(H.EXAMPLE));
const { page } = opened;
const view = H.modelOf(H.EXAMPLE).views[0];
await H.untilDrawn(page, view);
console.log('edges', await page.locator(`${H.planeOf(view.id)} .react-flow__edge`).evaluateAll((els) => els.map((e) => e.getAttribute('data-id') + ' | ' + e.getAttribute('aria-label'))));
console.log('names', await page.locator(`${H.planeOf(view.id)} .react-flow__node`).evaluateAll((els) => els.map((e) => e.getAttribute('data-id') + ' | ' + (e.querySelector('.grasp-node-name')?.textContent ?? 'NO NAME') + ' | ' + e.textContent.slice(0, 60))));
console.log('plane width', await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().width, H.planeOf(view.id)));
console.log('says', await H.saysIn(page), 'shown', await H.shownIn(page));
try { await H.nothingPicked(page); } catch (e) { console.log('nothingPicked:', e.message.split('\n')[0]); }
const b = await H.selectBox(page, view, 'Host'); console.log('selected Host', b.selected);
console.log('wordsOf undo', await H.wordsOf(page, 'undo'), await H.wordsOf(page, 'redo'));
const g = await H.groundPoint(page, view); console.log('ground', g);
console.log('tabs', await page.getByRole('tab').evaluateAll((els) => els.map((e) => (e.getAttribute('aria-label') || e.textContent.trim()) + ':' + e.getAttribute('aria-selected'))));
console.log('undo parent', await page.evaluate(() => { const p = document.querySelector('[data-testid=undo]').parentElement; return p.tagName + ' ' + p.getAttribute('aria-label'); }));
console.log('fileName', await page.locator('[data-testid=file-name]').textContent());
await H.finish(opened).catch((e) => console.log('finish', e.message));
// no-file page
const o2 = await H.openPage(browser); await H.showSide(o2.page, 'Details'); console.log('nofile says', await H.saysIn(o2.page));
await browser.close();
