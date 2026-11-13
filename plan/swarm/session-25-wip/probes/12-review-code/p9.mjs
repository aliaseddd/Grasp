import { launch, openPage, byTestId, stubGitHub, aboutLines } from './h.mjs';
const b = await launch();
const o = await openPage(b);
await stubGitHub(o.context);
const { page } = o;
await page.locator(byTestId('about')).click();
await page.waitForFunction(() => document.querySelector('[data-line="folder"]')?.dataset.state !== 'pending');
let fc = null; page.on('filechooser', (c) => { fc = c; });
await page.locator(byTestId('about-remember')).click();
await page.waitForTimeout(1500);
console.log('filechooser event?', !!fc, fc && fc.isMultiple());
if (fc) { try { await fc.setFiles('/home/user/probes/12-review-code/afolder'); } catch (e) { console.log('setFiles', e.message.split('\n')[0]); } }
await page.waitForTimeout(1000);
console.log(JSON.stringify((await aboutLines(page)).find(l => l[0] === 'folder')), o.problems);
await b.close();
