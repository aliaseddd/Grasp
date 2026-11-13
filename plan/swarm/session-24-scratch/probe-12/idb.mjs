import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const PAGE = pathToFileURL(path.resolve('../wt-12/canvas/dist/index.html')).href;
const browser = await chromium.launch();
console.log('browser.version()', browser.version());
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
await context.addInitScript(() => { window.showDirectoryPicker = async () => ({ kind: 'directory', name: 'grasp-folder' }); delete window.showSaveFilePicker; });
const page = await context.newPage();
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
await page.goto(PAGE);
await page.waitForSelector('[data-testid="app"]');
const open = `() => new Promise((res, rej) => { const r = indexedDB.open('grasp-app', 1); r.onupgradeneeded = () => r.result.createObjectStore('kept'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); })`;
console.log(await page.evaluate(async (open) => {
  const db = await (0, eval)(`(${open})`)();
  const handle = await window.showDirectoryPicker();
  await new Promise((res, rej) => { const t = db.transaction('kept', 'readwrite'); t.objectStore('kept').put({ handle, name: handle.name, at: new Date().toISOString(), load: String(performance.timeOrigin) }, 'folder'); t.oncomplete = res; t.onerror = () => rej(t.error); });
  db.close();
  return ['stored', String(performance.timeOrigin), typeof window.showSaveFilePicker];
}, open));
await page.reload();
await page.waitForSelector('[data-testid="app"]');
console.log(await page.evaluate(async (open) => {
  const db = await (0, eval)(`(${open})`)();
  const rec = await new Promise((res, rej) => { const q = db.transaction('kept').objectStore('kept').get('folder'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
  return [rec, String(performance.timeOrigin), typeof rec?.handle?.queryPermission];
}, open));
// a second context: is the database shared?
const c2 = await browser.newContext();
const p2 = await c2.newPage();
await p2.goto(PAGE);
console.log('other context', await p2.evaluate(async (open) => {
  const db = await (0, eval)(`(${open})`)();
  return await new Promise((res, rej) => { const q = db.transaction('kept').objectStore('kept').get('folder'); q.onsuccess = () => res(q.result ?? null); q.onerror = () => rej(q.error); });
}, open));
// delayed route
let release;
const held = new Promise((r) => { release = r; });
await context.route('https://api.github.com/rate_limit', async (route) => { await held; await route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' }, body: '{"rate":{"limit":60,"remaining":57}}' }); });
await page.evaluate(() => { window.__gh = 'pending'; fetch('https://api.github.com/rate_limit', { cache: 'no-store' }).then((r) => r.json()).then((j) => { window.__gh = j; }, (e) => { window.__gh = String(e); }); });
await page.waitForTimeout(300);
console.log('held', await page.evaluate(() => window.__gh));
release();
await page.waitForFunction(() => window.__gh !== 'pending');
console.log('released', await page.evaluate(() => JSON.stringify(window.__gh)));
console.log(logs);
await browser.close();
