import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { bytes } from './wasm.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const PAGE = pathToFileURL(path.resolve('../wt-12/canvas/dist/index.html')).href;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
const reqs = [];
page.on('request', (r) => reqs.push(r.url()));
await context.route('https://api.github.com/rate_limit', (route) => route.fulfill({
  status: 200, headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ resources: { core: { limit: 60, used: 3, remaining: 57, reset: 1794000000 } }, rate: { limit: 60, used: 3, remaining: 57, reset: 1794000000 } }),
}));
await context.route('https://api.github.com/nocors', (route) => route.fulfill({ status: 200, headers: { 'content-type': 'application/json' }, body: '{}' }));
await context.route('https://api.github.com/abort', (route) => route.abort());
await context.route('https://api.github.com/403', (route) => route.fulfill({ status: 403, headers: { 'access-control-allow-origin': '*' }, body: '{"message":"rate limit"}' }));
await page.goto(PAGE);
await page.waitForSelector('[data-testid="app"]');
const env = await page.evaluate(async (bytes) => {
  const out = {};
  out.origin = location.origin; out.secure = isSecureContext; out.ua = navigator.userAgent;
  out.uaData = navigator.userAgentData ? { brands: navigator.userAgentData.brands, platform: navigator.userAgentData.platform } : null;
  out.pickers = ['showOpenFilePicker', 'showSaveFilePicker', 'showDirectoryPicker'].map((n) => [n, typeof window[n], Object.prototype.hasOwnProperty.call(window, n)]);
  try { localStorage.setItem('grasp-app:probe', '1'); out.ls = localStorage.getItem('grasp-app:probe'); localStorage.removeItem('grasp-app:probe'); } catch (e) { out.ls = String(e); }
  const idb = () => new Promise((res, rej) => { const r = indexedDB.open('grasp-app-probe', 1); r.onupgradeneeded = () => r.result.createObjectStore('kept'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  try {
    const db = await idb();
    await new Promise((res, rej) => { const t = db.transaction('kept', 'readwrite'); t.objectStore('kept').put({ a: 1 }, 'probe'); t.oncomplete = res; t.onerror = () => rej(t.error); });
    out.idb = await new Promise((res, rej) => { const q = db.transaction('kept').objectStore('kept').get('probe'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
    try {
      const rootDir = await navigator.storage.getDirectory();
      const dir = await rootDir.getDirectoryHandle('grasp-folder', { create: true });
      out.opfs = { kind: dir.kind, name: dir.name, perm: await dir.queryPermission({ mode: 'readwrite' }) };
      await new Promise((res, rej) => { const t = db.transaction('kept', 'readwrite'); t.objectStore('kept').put({ handle: dir, at: 'now' }, 'folder'); t.oncomplete = res; t.onerror = () => rej(t.error); });
      out.opfsStored = true;
    } catch (e) { out.opfs = String(e); }
    db.close();
  } catch (e) { out.idb = String(e); }
  try {
    const url = URL.createObjectURL(new Blob(['onmessage = (e) => postMessage(e.data * 2);'], { type: 'text/javascript' }));
    const w = new Worker(url);
    out.worker = await new Promise((res, rej) => { w.onmessage = (e) => res(e.data); w.onerror = (e) => rej(new Error(e.message)); w.postMessage(21); setTimeout(() => rej(new Error('timeout')), 3000); });
    w.terminate(); URL.revokeObjectURL(url);
  } catch (e) { out.worker = String(e); }
  try {
    const loop = (n) => { let x = 0; for (let i = 0; i < n; i += 1) x = (Math.imul(x, 31) + i) ^ (x >>> 7); return x; };
    const samples = [];
    for (let k = 0; k < 3; k++) {
      let t = performance.now();
      const mod = new WebAssembly.Module(new Uint8Array(bytes));
      const run = new WebAssembly.Instance(mod).exports.run;
      const a = run(50000000); const tw = performance.now() - t;
      t = performance.now(); const b = loop(50000000); const tj = performance.now() - t;
      samples.push([tw, tj, a, b]);
    }
    out.wasm = samples;
  } catch (e) { out.wasm = String(e); }
  const ask = async (u) => { try { const r = await fetch(u, { cache: 'no-store' }); return [r.status, r.ok, await r.text()]; } catch (e) { return String(e); } };
  out.gh = await ask('https://api.github.com/rate_limit');
  out.nocors = await ask('https://api.github.com/nocors');
  out.abort = await ask('https://api.github.com/abort');
  out.s403 = await ask('https://api.github.com/403');
  out.fileInput = (() => { const i = document.createElement('input'); i.type = 'file'; return [i.type, 'files' in i, 'download' in document.createElement('a'), typeof i.showPicker]; })();
  return out;
}, bytes);
console.log(JSON.stringify(env, null, 1));
console.log('logs', logs);
console.log('outside requests', reqs.filter((u) => !u.startsWith('file:')));
// reload: did the handle survive?
await page.reload();
await page.waitForSelector('[data-testid="app"]');
console.log('after reload', await page.evaluate(async () => {
  const db = await new Promise((res, rej) => { const r = indexedDB.open('grasp-app-probe', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const rec = await new Promise((res, rej) => { const q = db.transaction('kept').objectStore('kept').get('folder'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
  if (!rec) return 'no record';
  return { name: rec.handle.name, kind: rec.handle.kind, ctor: rec.handle.constructor.name, perm: await rec.handle.queryPermission({ mode: 'readwrite' }) };
}));
// side panels
logs.length = 0;
const info = () => page.evaluate(() => Object.fromEntries(['explorer', 'tools', 'validation', 'details'].map((id) => { const el = document.querySelector(`[data-testid="${id}"]`); if (!el) return [id, null]; const r = el.getBoundingClientRect(); return [id, [Math.round(r.width), Math.round(r.height)]]; })));
console.log('at open', await info());
await page.getByRole('tab', { name: 'Validation', exact: true }).click();
await page.waitForTimeout(300);
console.log('validation shown', await info());
await page.evaluate(() => {
  const el = document.querySelector('[data-testid="validation"]');
  const inner = el.querySelector('.grasp-side-text');
  window.__el = el; window.__log = [];
  new ResizeObserver((entries) => { for (const e of entries) window.__log.push(['root', Math.round(e.contentRect.width), Math.round(e.contentRect.height), document.contains(el)]); }).observe(el);
  new ResizeObserver((entries) => { for (const e of entries) window.__log.push(['inner', Math.round(e.contentRect.width), Math.round(e.contentRect.height), document.contains(inner)]); }).observe(inner);
});
await page.waitForTimeout(200);
await page.getByRole('tab', { name: 'Explorer', exact: true }).click();
await page.waitForTimeout(300);
console.log('explorer in front', await info(), await page.evaluate(() => { const l = window.__log; window.__log = []; return JSON.stringify(l); }));
await page.getByRole('tab', { name: 'Validation', exact: true }).click();
await page.waitForTimeout(300);
console.log('validation again', await info(), await page.evaluate(() => { const l = window.__log; window.__log = []; return JSON.stringify(l); }));
await page.getByRole('tab', { name: 'Validation', exact: true }).click();
await page.waitForTimeout(400);
console.log('collapsed', await info(), await page.evaluate(() => { const l = window.__log; window.__log = []; return JSON.stringify([l, document.contains(window.__el), window.__el.offsetParent === null, window.__el.checkVisibility && window.__el.checkVisibility()]); }));
await page.getByRole('tab', { name: 'Validation', exact: true }).click();
await page.waitForTimeout(400);
console.log('opened again', await info(), await page.evaluate(() => { const l = window.__log; window.__log = []; return JSON.stringify(l); }));
console.log('logs', logs);
await browser.close();
