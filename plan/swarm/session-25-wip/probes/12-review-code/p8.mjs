import { launch, openPage, withInit, byTestId, stubGitHub, aboutLines, frame } from './h.mjs';
const b = await launch();
const line = async (page) => (await aboutLines(page)).find(l => l[0] === 'folder');
const open = async (page) => { await page.locator(byTestId('about')).click(); await page.waitForSelector('[data-testid="about-panel"]'); await page.waitForFunction(() => document.querySelector('[data-line="folder"]')?.dataset.state !== 'pending'); };
// 1. picker closed without a choice
{
  const o = await openPage(withInit(b, () => { window.showDirectoryPicker = async () => { throw new DOMException('The user aborted a request.', 'AbortError'); }; }));
  await stubGitHub(o.context);
  await open(o.page);
  await o.page.locator(byTestId('about-remember')).click(); await frame(o.page); await frame(o.page);
  console.log('abort:', JSON.stringify(await line(o.page)), o.problems);
  await o.context.close();
}
// 2. a real handle from the origin private file system
{
  const o = await openPage(withInit(b, () => { window.showDirectoryPicker = async () => { const root = await navigator.storage.getDirectory(); return root.getDirectoryHandle('grasp-real', { create: true }); }; }));
  await stubGitHub(o.context);
  await open(o.page);
  await o.page.locator(byTestId('about-remember')).click();
  await o.page.waitForTimeout(500);
  console.log('real handle:', JSON.stringify(await line(o.page)));
  await o.page.reload(); await o.page.waitForSelector(byTestId('app'));
  await open(o.page);
  await o.page.waitForTimeout(300);
  console.log('after reload:', JSON.stringify(await line(o.page)), o.problems);
  await o.context.close();
}
// 3. double click on Remember with a slow picker
{
  const o = await openPage(withInit(b, () => { let n = 0; window.showDirectoryPicker = () => { n += 1; if (n > 1) return Promise.reject(new DOMException('File picker already active.', 'NotAllowedError')); return new Promise(r => setTimeout(() => r({ name: 'slow' }), 1500)); }; }));
  await stubGitHub(o.context);
  await open(o.page);
  await o.page.locator(byTestId('about-remember')).dblclick();
  await o.page.waitForTimeout(200);
  console.log('dblclick, picker still open:', JSON.stringify(await line(o.page)));
  await o.page.waitForTimeout(1600);
  console.log('dblclick, after the pick:', JSON.stringify(await line(o.page)), o.problems);
  await o.context.close();
}
// 4. remember, then close and reopen About while the picker is still open
{
  const o = await openPage(withInit(b, () => { window.showDirectoryPicker = () => new Promise(r => setTimeout(() => r({ name: 'late' }), 1500)); }));
  await stubGitHub(o.context);
  await open(o.page);
  await o.page.locator(byTestId('about-remember')).click();
  await o.page.keyboard.press('Escape');
  await o.page.waitForFunction(() => !document.querySelector('[data-testid="about-panel"]'));
  await open(o.page);
  console.log('reopen while picking:', JSON.stringify(await line(o.page)));
  await o.page.waitForTimeout(1700);
  console.log('after pick resolves:', JSON.stringify(await line(o.page)), o.problems);
  await o.context.close();
}
await b.close();
