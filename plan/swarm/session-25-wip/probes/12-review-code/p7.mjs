import { launch, openPage, withInit, byTestId, stubGitHub, aboutLines } from './h.mjs';
const b = await launch();
async function run(name, init, opts = {}) {
  const br = init ? withInit(b, init) : b;
  const o = await openPage(br, { picker: opts.picker ?? true });
  const { page, context } = o;
  let release; const hold = opts.hold ? new Promise(r => { release = r; }) : null;
  await stubGitHub(context, hold);
  await page.locator(byTestId('about')).click();
  await page.waitForSelector('[data-testid="about-panel"]');
  try { await page.waitForFunction(() => [...document.querySelectorAll('[data-line]')].length === 13 && [...document.querySelectorAll('[data-line]')].every(e => e.dataset.state !== 'pending'), null, { timeout: opts.wait ?? 8000 }); } catch { console.log(name, 'still pending after wait'); }
  const lines = await aboutLines(page);
  console.log('==', name); for (const l of lines) if (opts.all || l[1] !== 'yes') console.log('  ', JSON.stringify(l));
  console.log('   remember disabled', await page.locator(byTestId('about-remember')).isDisabled(), 'problems', JSON.stringify(o.problems));
  if (release) release();
  if (opts.after) await opts.after(page, o);
  await o.context.close();
}
await run('all three pickers gone', () => { delete window.showOpenFilePicker; delete window.showSaveFilePicker; delete window.showDirectoryPicker; });
await run('localStorage throws', () => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('The operation is insecure.', 'SecurityError'); } }); });
await run('localStorage.setItem throws', () => { Storage.prototype.setItem = function () { throw new DOMException('quota', 'QuotaExceededError'); }; });
await run('indexedDB throws', () => { Object.defineProperty(window, 'indexedDB', { get() { throw new DOMException('The user denied permission to access the database.', 'SecurityError'); } }); });
await run('indexedDB.open throws', () => { IDBFactory.prototype.open = function () { throw new DOMException('denied', 'InvalidStateError'); }; });
await run('indexedDB undefined', () => { Object.defineProperty(window, 'indexedDB', { value: undefined }); });
await run('WebAssembly deleted', () => { delete globalThis.WebAssembly; });
await run('Worker deleted', () => { delete window.Worker; });
await run('fetch deleted', () => { delete window.fetch; });
await run('GitHub held 12 s', null, { hold: true, wait: 12500 });
await b.close();
