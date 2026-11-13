const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openIn, stateFileAt, EXAMPLE, frame, rowIn, rowItemIn, cssColor, TEAL } = H;
const browser = await launch();
try {
  const o = await openIn(browser, stateFileAt(EXAMPLE));
  const { page } = o;
  await rowIn(page, 'el', 'Host').click(); await frame(page);
  const bg = (id) => page.evaluate((s) => getComputedStyle(document.querySelector(s)).backgroundColor, H.rowOf('el', id));
  console.log('selected bg', await bg('Host'), 'other', await bg('App'), 'teal-soft', await cssColor(page, 'var(--grasp-teal-soft)'));
  await page.keyboard.press('ArrowDown'); await frame(page);
  console.log('focus ring', await page.evaluate(() => { const li = document.activeElement; const row = li.querySelector(':scope > [data-row]'); const c = getComputedStyle(row); return [row.getAttribute('data-row'), c.outlineWidth, c.outlineStyle, c.outlineColor, li.matches(':focus-visible')]; }), await cssColor(page, TEAL));
  await page.keyboard.press('Home'); await frame(page);
  console.log('home', await page.evaluate(() => document.activeElement.querySelector(':scope > [data-row]')?.getAttribute('data-row')));
  console.log('aria-checked anywhere', await page.evaluate(() => document.querySelectorAll('[data-testid="explorer"] [aria-checked]').length), 'tree', await page.evaluate(() => { const t = document.querySelector('[data-testid="explorer"] [role=tree]'); return [t.getAttribute('aria-label'), t.getAttribute('aria-multiselectable'), t.parentElement.className]; }));
  console.log('DevHost icon svg', await rowIn(page, 'el', 'DevHost').locator('.grasp-row-icon svg').count(), 'expanded attr', await rowItemIn(page, 'el', 'DevHost').getAttribute('aria-expanded'));
  console.log('problems', o.problems);
  await o.context.close();
} finally { await browser.close(); }
