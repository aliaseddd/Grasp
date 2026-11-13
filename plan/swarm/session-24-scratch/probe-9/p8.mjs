const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openIn, stateFileAt, EXAMPLE, modelOf, showView, frame, viewTab, rowIn } = H;
const browser = await launch();
const focus = (page) => page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ':' + (a.getAttribute('role') ?? '') + ':' + (a.querySelector(':scope > [data-row]')?.getAttribute('data-row') ?? a.className?.toString().slice(0, 30)) : null; });
try {
  const opened = await openIn(browser, stateFileAt(EXAMPLE));
  const { page } = opened;
  const view = modelOf(EXAMPLE).views[0];
  await showView(page, view, 6);
  const tab = await viewTab(page, view); await tab.hover(); await tab.locator('.dv-default-tab-action').click(); await frame(page); await frame(page);
  await page.evaluate(() => { window.__focus = []; document.addEventListener('focusin', (e) => window.__focus.push('in ' + e.target.tagName + '.' + String(e.target.className).slice(0, 30)), true); document.addEventListener('focusout', (e) => window.__focus.push('out ' + e.target.tagName + '.' + String(e.target.className).slice(0, 30)), true); });
  await rowIn(page, 'view', view.id).click();
  console.log('right after click', await focus(page));
  await frame(page); await frame(page);
  console.log('after frames', await focus(page), await page.evaluate(() => window.__focus));
  console.log('problems', opened.problems);
  await opened.context.close();
} finally { await browser.close(); }
