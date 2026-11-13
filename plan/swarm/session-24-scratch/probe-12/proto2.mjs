import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const TREE = path.resolve('tree');
const PAGE = pathToFileURL(path.join(TREE, 'canvas/dist/index.html')).href;
const EXAMPLE = path.join(TREE, 'canvas/examples/stronghold-proof.json');
const browser = await chromium.launch();
const RATE = { resources: { core: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } }, rate: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } };
async function open({ init, picker = true } = {}) {
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  if (init) await context.addInitScript(init);
  if (!picker) await context.addInitScript(() => { delete window.showOpenFilePicker; });
  const page = await context.newPage();
  const logs = []; const reqs = [];
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  page.on('request', (r) => { if (!r.url().startsWith('file:')) reqs.push(r.url()); });
  await context.route('https://api.github.com/rate_limit', (route) => route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(RATE) }));
  await page.goto(PAGE);
  await page.waitForSelector('[data-testid="app"]');
  return { context, page, logs, reqs };
}
const lines = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="about-panel"] [data-line]')].map((el) => [el.getAttribute('data-line'), el.getAttribute('data-state'), el.querySelector('.grasp-about-label').textContent, el.querySelector('.grasp-about-value').textContent]));
const settled = async (page) => { await page.waitForFunction(() => document.querySelectorAll('[data-testid="about-panel"] [data-line]').length === 13 && !document.querySelector('[data-testid="about-panel"] [data-line][data-state="pending"]'), null, { timeout: 10000 }); };

// ---- About, as the page opens
if (false) {
  const { page, logs, reqs, context } = await open();
  console.log('before About: outside requests', reqs.length, 'about enabled', await page.locator('[data-testid="about"]').isEnabled(), 'panel in doc', await page.locator('[data-testid="about-panel"]').count());
  await page.locator('[data-testid="about"]').click();
  await page.waitForSelector('[data-testid="about-panel"]');
  console.log('first read', JSON.stringify((await lines(page)).map((l) => l[1])));
  console.log(await page.evaluate(() => { const el = document.querySelector('[data-testid="about-panel"]'); return [el.getAttribute('role'), el.getAttribute('aria-modal'), document.getElementById(el.getAttribute('aria-labelledby'))?.textContent]; }), await page.getByRole('dialog', { name: 'About Grasp' }).count());
  await settled(page);
  for (const l of await lines(page)) console.log(' ', JSON.stringify(l));
  console.log('libraries', await page.evaluate(() => [...document.querySelectorAll('[data-library]')].map((el) => el.textContent).join(' | ')));
  console.log('credits', await page.evaluate(() => [...document.querySelectorAll('[data-testid="about-react-flow"], [data-testid="about-notices"]')].map((el) => [el.textContent, el.querySelector('a').getAttribute('href')])));
  console.log('requests', reqs, 'remember enabled', await page.locator('[data-testid="about-remember"]').isEnabled());
  const r = await page.evaluate(() => { const b = document.querySelector('[data-testid="about-panel"]').getBoundingClientRect(); const c = document.querySelector('[data-testid="about-panel"] .MuiDialogContent-root'); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height), c.scrollHeight, c.clientHeight]; });
  console.log('paper rect x,y,w,h and content scrollHeight/clientHeight', r);
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'about-proto.png' });
  // close by Escape, reopen: second round
  await page.keyboard.press('Escape');
  await page.waitForSelector('[data-testid="about-panel"]', { state: 'detached' });
  console.log('after Escape focus on', await page.evaluate(() => document.activeElement?.getAttribute('data-testid')));
  const wasmBefore = (await (async () => { await page.locator('[data-testid="about"]').click(); await page.waitForSelector('[data-testid="about-panel"]'); const first = await lines(page); await settled(page); return [first.map((l) => l[1]).join(','), (await lines(page)).find((l) => l[0] === 'wasm')[3]]; })());
  console.log('second opening: first states', wasmBefore[0], '| wasm', wasmBefore[1], '| requests', reqs.length);
  // close by backdrop
  await page.mouse.click(20, 400);
  await page.waitForSelector('[data-testid="about-panel"]', { state: 'detached' });
  await page.locator('[data-testid="about"]').click(); await page.waitForSelector('[data-testid="about-panel"]');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.waitForSelector('[data-testid="about-panel"]', { state: 'detached' });
  console.log('closed three ways; requests', reqs.length, 'logs', logs);
  await context.close();
}
if (false) {
  const { page, logs, context } = await open({ picker: false, init: () => { delete window.showSaveFilePicker; delete window.showDirectoryPicker; } });
  await page.locator('[data-testid="about"]').click(); await page.waitForSelector('[data-testid="about-panel"]'); await settled(page);
  for (const l of (await lines(page)).filter((l) => /picker|file-input|download|folder/.test(l[0]))) console.log(' ', JSON.stringify(l));
  console.log('remember enabled', await page.locator('[data-testid="about-remember"]').isEnabled(), logs);
  await context.close();
}
if (false) {
  const { page, logs, context } = await open({ init: () => { window.showDirectoryPicker = async () => ({ kind: 'directory', name: 'grasp-folder' }); } });
  await page.locator('[data-testid="about"]').click(); await page.waitForSelector('[data-testid="about-panel"]'); await settled(page);
  await page.locator('[data-testid="about-remember"]').click();
  await page.waitForFunction(() => /Remembered now/.test(document.querySelector('[data-line="folder"] .grasp-about-value').textContent));
  console.log(' ', JSON.stringify((await lines(page)).find((l) => l[0] === 'folder')));
  await page.reload(); await page.waitForSelector('[data-testid="app"]');
  await page.locator('[data-testid="about"]').click(); await page.waitForSelector('[data-testid="about-panel"]'); await settled(page);
  console.log(' ', JSON.stringify((await lines(page)).find((l) => l[0] === 'folder')), logs);
  await context.close();
}
// ---- Validation
{
  const { page, logs, context } = await open({ picker: false });
  const give = async (file) => { const chooser = page.waitForEvent('filechooser'); await page.locator('[data-testid="open"]').click(); await (await chooser).setFiles(file); await page.waitForFunction((n) => document.querySelector('[data-testid="file-name"]').textContent.includes(n), file.name); };
  await page.evaluate(() => { const M = window.SysMLModel; window.__checks = 0; window.SysMLModel = Object.freeze({ ...M, validate: (model) => { window.__checks += 1; return M.validate(model); } }); });
  await page.getByRole('tab', { name: 'Validation', exact: true }).click();
  const text = () => page.evaluate(() => { const el = document.querySelector('[data-testid="validation"]'); return el ? el.innerText.replace(/\n+/g, ' / ') : null; });
  await page.waitForTimeout(200);
  console.log('no file:', await text());
  const state = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8'));
  state.model.elements.find((e) => e.id === 'App').name = 'Host';
  await give({ name: 'twins.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(state)) });
  const entries = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="validation"] [data-entry]')].map((el) => [el.closest('[data-list]').getAttribute('data-list'), el.getAttribute('data-entry'), el.getAttribute('role'), el.textContent]));
  console.log('at once after open (no wait):', JSON.stringify(await entries()), 'checks', await page.evaluate(() => window.__checks));
  await page.waitForTimeout(100);
  console.log('100 ms later:', JSON.stringify(await entries()), 'checks', await page.evaluate(() => window.__checks));
  console.log(await page.evaluate(() => [...document.querySelectorAll('[data-list]')].map((s) => [s.getAttribute('data-list'), s.getAttribute('data-count'), s.querySelector('.grasp-validation-title').textContent, s.querySelector('.grasp-validation-count').textContent, s.querySelector('.grasp-validation-note')?.textContent ?? null])));
  await page.screenshot({ path: 'validation-proto.png' });
  await give({ name: 'stronghold-proof.json', mimeType: 'application/json', buffer: fs.readFileSync(EXAMPLE) });
  await page.waitForTimeout(100);
  console.log('example:', await text(), '| checks', await page.evaluate(() => window.__checks), '| stale', await page.evaluate(() => document.querySelector('.grasp-validation-lists').getAttribute('data-stale')));
  // a change: drag DevHost; stale for 0.8 s
  await page.evaluate(() => {
    window.__t = { stale: null, fresh: null };
    const el = document.querySelector('.grasp-validation-lists');
    new MutationObserver(() => { const s = el.getAttribute('data-stale'); if (s === 'true' && window.__t.stale === null) window.__t.stale = performance.now(); if (s === 'false' && window.__t.stale !== null && window.__t.fresh === null) window.__t.fresh = performance.now(); }).observe(el, { attributes: true });
  });
  const box = await page.evaluate(() => { const r = document.querySelector('[data-testid="plane"] .react-flow__node[data-id="DevHost"]').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  await page.mouse.move(box.x + 14, box.y + 8); await page.mouse.down(); await page.mouse.move(box.x + 34, box.y + 28, { steps: 4 }); await page.mouse.up();
  await page.waitForFunction(() => window.__t.fresh !== null, null, { timeout: 5000 });
  console.log('stale for', await page.evaluate(() => (window.__t.fresh - window.__t.stale).toFixed(1)), 'ms; checks', await page.evaluate(() => window.__checks));
  // hidden: undo checks nothing; shown again: at once
  await page.getByRole('tab', { name: 'Explorer', exact: true }).click();
  await page.waitForTimeout(100);
  await page.locator('[data-testid="undo"]').click();
  await page.waitForTimeout(1100);
  console.log('hidden, after undo and 1.1 s: checks', await page.evaluate(() => window.__checks));
  await page.getByRole('tab', { name: 'Validation', exact: true }).click();
  await page.waitForTimeout(100);
  console.log('shown again: checks', await page.evaluate(() => window.__checks), await text());
  // collapsed
  await page.getByRole('tab', { name: 'Validation', exact: true }).click();
  await page.waitForTimeout(300);
  await page.locator('[data-testid="redo"]').click();
  await page.waitForTimeout(1100);
  console.log('collapsed, after redo and 1.1 s: checks', await page.evaluate(() => window.__checks));
  await page.getByRole('tab', { name: 'Validation', exact: true }).click();
  await page.waitForTimeout(300);
  console.log('opened again: checks', await page.evaluate(() => window.__checks), 'logs', logs);
  await context.close();
}
await browser.close();
