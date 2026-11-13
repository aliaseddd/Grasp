import { launch, openPage, withInit } from '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-all/canvas/app/test/helpers.mjs';
const browser = await launch();
try {
  const opened = await openPage(withInit(browser, () => {
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('The operation is insecure.', 'SecurityError'); } });
    Object.defineProperty(window, 'indexedDB', { configurable: true, value: undefined });
    delete window.WebAssembly;
    delete window.Worker;
  }));
  const { page } = opened;
  console.log(await page.evaluate(() => { let ls; try { ls = typeof window.localStorage; } catch (e) { ls = 'throws ' + e.message; } return [ls, typeof window.indexedDB, typeof WebAssembly, typeof Worker]; }));
  console.log('page still mounts', await page.locator('[data-testid="top-bar"]').count(), opened.problems);
  await opened.context.close();
} finally { await browser.close(); }
