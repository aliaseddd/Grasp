import { launch, openPage, frame, byTestId, stubGitHub, aboutLines } from './h.mjs';
const b = await launch();
const o = await openPage(b);
const { page, context } = o;
await stubGitHub(context);
const open = async () => { await page.locator(byTestId('about')).click(); await page.waitForSelector('[data-testid="about-panel"]'); };
const done = () => page.waitForFunction(() => [...document.querySelectorAll('[data-line]')].length === 13 && [...document.querySelectorAll('[data-line]')].every(e => e.dataset.state !== 'pending'), null, { timeout: 15000 });
await open(); await done();
await page.keyboard.press('Escape');
await page.waitForFunction(() => !document.querySelector('[data-testid="about-panel"]'));
await page.evaluate(() => {
  window.__seen = [];
  const mo = new MutationObserver(() => {
    const el = document.querySelector('[data-line="github"]');
    if (el && !window.__seen.length) {
      window.__seen.push(['mutation', el.dataset.state]);
      requestAnimationFrame(() => { window.__seen.push(['raf', document.querySelector('[data-line="github"]').dataset.state]); requestAnimationFrame(() => window.__seen.push(['raf2', document.querySelector('[data-line="github"]').dataset.state])); });
      mo.disconnect();
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
});
await open();
await frame(page); await frame(page);
console.log('second opening (click):', JSON.stringify(await page.evaluate(() => window.__seen)));
await done();
// keyboard open
await page.keyboard.press('Escape');
await page.waitForFunction(() => !document.querySelector('[data-testid="about-panel"]'));
await page.evaluate(() => { window.__seen = []; const mo = new MutationObserver(() => { const el = document.querySelector('[data-line="github"]'); if (el && !window.__seen.length) { window.__seen.push(['mutation', el.dataset.state]); requestAnimationFrame(() => window.__seen.push(['raf', document.querySelector('[data-line="github"]').dataset.state])); mo.disconnect(); } }); mo.observe(document.body, { childList: true, subtree: true }); });
await page.locator(byTestId('about')).focus();
await page.keyboard.press('Enter');
await page.waitForSelector('[data-testid="about-panel"]');
await frame(page); await frame(page);
console.log('third opening (Enter):', JSON.stringify(await page.evaluate(() => window.__seen)));
// quick open-close-open
await done();
await page.keyboard.press('Escape');
await page.locator(byTestId('about')).click({ force: true }).catch(e => console.log('click err', e.message.split('\n')[0]));
await page.waitForTimeout(50);
console.log('after Esc then click quickly: panels', await page.locator('[data-testid="about-panel"]').count(), JSON.stringify((await aboutLines(page)).map(l => l[1]).join(',')));
await page.waitForTimeout(500);
console.log('later: panels', await page.locator('[data-testid="about-panel"]').count(), await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length));
console.log('problems', o.problems);
await b.close();
