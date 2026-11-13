import { launch, openPage, openStateFile, stateFileAt, EXAMPLE, withInit, showSide, finish, frame, soon, DIST_URL, byTestId, TESTIDS, modelOf, untilDrawn } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-all/canvas/app/test/helpers.mjs';
const browser = await launch();
console.log('version', browser.version());
try {
  // A, E
  {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    console.log('UA', await page.evaluate(() => navigator.userAgent));
    console.log('secure', await page.evaluate(() => [isSecureContext, typeof showSaveFilePicker, typeof showDirectoryPicker, 'showOpenFilePicker' in window]));
    const desc = await page.evaluate(() => { const d = Object.getOwnPropertyDescriptor(window, 'SysMLModel'); return { has: !!d, writable: d?.writable, configurable: d?.configurable, frozen: Object.isFrozen(window.SysMLModel), keys: Object.keys(window.SysMLModel).length, hasReading: typeof window.SysMLModel.reading, vs: typeof window.SysMLModel.validateSpec, rules: window.SysMLModel.SPEC_RULES?.length }; });
    console.log('SysMLModel', JSON.stringify(desc));
    await page.evaluate(() => { const M = window.SysMLModel; window.__checks = 0; window.SysMLModel = Object.freeze({ ...M, validate: (model) => { window.__checks += 1; return M.validate(model); } }); });
    console.log('replaced', await page.evaluate(() => window.SysMLModel.validate !== undefined && Object.keys(window.SysMLModel).length));
    await page.evaluate(() => {
      window.__ro = [];
      const el = document.querySelector('[data-testid="validation"]');
      window.__val = el;
      new ResizeObserver((entries) => { for (const e of entries) window.__ro.push([Math.round(e.contentRect.width), Math.round(e.contentRect.height), el.isConnected]); }).observe(el || document.body);
    });
    console.log('validation initially', await page.evaluate(() => { const el = document.querySelector('[data-testid="validation"]'); return el ? [el.isConnected, el.getBoundingClientRect().width] : null; }));
    await openStateFile(page, stateFileAt(EXAMPLE));
    await untilDrawn(page, modelOf(EXAMPLE).views[0]);
    console.log('lib used after open: checks', await page.evaluate(() => window.__checks), 'same lib?', await page.evaluate(() => window.Grasp.session.lib === window.SysMLModel));
    await frame(page);
    console.log('ro before', JSON.stringify(await page.evaluate(() => window.__ro)), 'has el', await page.evaluate(() => !!window.__val));
    if (!(await page.evaluate(() => !!window.__val))) {
      await showSide(page, 'Validation');
      await page.evaluate(() => { const el = document.querySelector('[data-testid="validation"]'); window.__val = el; new ResizeObserver((entries) => { for (const e of entries) window.__ro.push([Math.round(e.contentRect.width), Math.round(e.contentRect.height), el.isConnected]); }).observe(el); });
    } else await showSide(page, 'Validation');
    await frame(page); await frame(page);
    console.log('ro shown', JSON.stringify(await page.evaluate(() => window.__ro.splice(0))), await page.evaluate(() => document.querySelector('[data-testid="validation"]').textContent));
    await showSide(page, 'Explorer'); await frame(page); await frame(page);
    console.log('ro hidden', JSON.stringify(await page.evaluate(() => window.__ro.splice(0))), 'connected', await page.evaluate(() => window.__val.isConnected), 'same el in doc', await page.evaluate(() => document.querySelector('[data-testid="validation"]') === window.__val));
    await showSide(page, 'Validation'); await frame(page); await frame(page);
    console.log('ro shown again', JSON.stringify(await page.evaluate(() => window.__ro.splice(0))), 'same el', await page.evaluate(() => document.querySelector('[data-testid="validation"]') === window.__val));
    await page.getByRole('tab', { name: 'Validation', exact: true }).click(); await frame(page); await frame(page); await frame(page);
    console.log('ro collapsed', JSON.stringify(await page.evaluate(() => window.__ro.splice(0))), 'connected', await page.evaluate(() => window.__val.isConnected), await page.evaluate(() => { const r = window.__val.getBoundingClientRect(); return [r.width, r.height]; }));
    await page.getByRole('tab', { name: 'Validation', exact: true }).click(); await frame(page); await frame(page); await frame(page);
    console.log('ro opened', JSON.stringify(await page.evaluate(() => window.__ro.splice(0))));
    console.log('about btn disabled', await page.locator(byTestId(TESTIDS.about)).isDisabled());
    console.log('problems', opened.problems);
    await opened.context.close();
  }
  // B, C, D
  {
    const opened = await openPage(withInit(browser, () => { delete window.showSaveFilePicker; delete window.showDirectoryPicker; }), { picker: false });
    const { page } = opened;
    console.log('pickers gone', await page.evaluate(() => [typeof window.showOpenFilePicker, typeof window.showSaveFilePicker, typeof window.showDirectoryPicker]));
    const RATE = { resources: { core: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } }, rate: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } };
    await opened.context.route('https://api.github.com/rate_limit', (route) => route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(RATE) }));
    const before = opened.requests.length;
    const got = await page.evaluate(async () => { const c = new AbortController(); const r = await fetch('https://api.github.com/rate_limit', { cache: 'no-store', signal: c.signal }); return [r.ok, r.status, (await r.json()).resources.core.remaining]; });
    console.log('fetch', got, opened.requests.slice(before));
    const w = await page.evaluate(() => new Promise((resolve) => { try { const url = URL.createObjectURL(new Blob(['onmessage = (e) => postMessage(e.data * 2);'], { type: 'text/javascript' })); const wk = new Worker(url); wk.onmessage = (e) => { wk.terminate(); URL.revokeObjectURL(url); resolve('answer ' + e.data); }; wk.onerror = (e) => resolve('error ' + e.message); wk.postMessage(21); setTimeout(() => resolve('timeout'), 3000); } catch (e) { resolve('throw ' + e.message); } }));
    console.log('worker', w, opened.requests.slice(before));
    const idb = () => page.evaluate(() => new Promise((resolve) => { const open = indexedDB.open('probe-x', 1); open.onupgradeneeded = () => open.result.createObjectStore('kept'); open.onerror = () => resolve('open error ' + open.error?.message); open.onsuccess = () => { const db = open.result; const tx = db.transaction('kept', 'readwrite'); const st = tx.objectStore('kept'); const g = st.get('folder'); g.onsuccess = () => { const had = g.result; st.put({ handle: { kind: 'directory', name: 'grasp-folder' }, load: String(performance.timeOrigin) }, 'folder'); tx.oncomplete = () => { db.close(); resolve(JSON.stringify(had ?? null)); }; }; }; }));
    console.log('idb first', await idb());
    await page.reload(); await page.waitForSelector('[data-testid="app"]');
    console.log('idb after reload', await idb(), 'pickers after reload', await page.evaluate(() => [typeof window.showOpenFilePicker, typeof window.showSaveFilePicker]));
    console.log('ls', await page.evaluate(() => { try { localStorage.setItem('grasp-app:probe', '1'); const v = localStorage.getItem('grasp-app:probe'); localStorage.removeItem('grasp-app:probe'); return v; } catch (e) { return 'throw ' + e.message; } }));
    console.log('wasm', await page.evaluate(() => typeof WebAssembly));
    console.log('outside', opened.requests.filter((u) => !u.startsWith('file:')));
    console.log('problems', opened.problems);
    await opened.context.close();
  }
} finally { await browser.close(); }
