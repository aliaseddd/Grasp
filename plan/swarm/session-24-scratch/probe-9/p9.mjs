import path from 'node:path';
const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openIn, openPage, stateFileAt, stateFileOf, EXAMPLE, BLANK, modelOf, showView, frame, viewTab, rowIn, rowItemIn, openStateFile, FIXTURES, boxOf, headerOf, planeOf } = H;
const browser = await launch();
const focus = (page) => page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ':' + (a.getAttribute('role') ?? '') + ':' + (a.querySelector(':scope > [data-row]')?.getAttribute('data-row') ?? a.className?.toString().slice(0, 30)) : null; });
const rows = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="explorer"] [data-row]')].map((el) => el.getAttribute('data-row') + (el.hasAttribute('data-selected') ? '*' : '')));
try {
  const bare = await openPage(browser, { picker: false });
  console.log('no file:', await bare.page.evaluate(() => document.querySelector('[data-testid="explorer"]').textContent));
  await openStateFile(bare.page, stateFileAt(EXAMPLE));
  const { page } = bare;
  const view = modelOf(EXAMPLE).views[0];
  await showView(page, view, 6);
  await rowIn(page, 'el', 'Host').click(); await frame(page);
  // fold Page
  await rowIn(page, 'el', 'Page').locator('.grasp-row-icon').click(); await frame(page);
  console.log('example rows', (await rows(page)).length, await focus(page));
  await openStateFile(page, stateFileAt(path.join(FIXTURES, 'browser.json'))); await frame(page); await frame(page);
  console.log('browser.json rows', (await rows(page)).slice(0, 6), (await rows(page)).length, await focus(page), await page.evaluate(() => window.Grasp.selection.items.length));
  await rowIn(page, 'el', 'Host').click(); await frame(page);
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Space'); await frame(page);
  console.log('after keys', (await rows(page)).filter((r) => r.endsWith('*')), await focus(page));
  // views of browser.json: three; kinds not drawn: click the row of a view no plane draws
  const m = modelOf(path.join(FIXTURES, 'browser.json'));
  console.log(m.views.map((v) => v.id + ':' + v.kind));
  await rowIn(page, 'view', m.views[2].id).click(); await frame(page); await frame(page);
  console.log('click 3rd view row', await page.getByRole('tab').evaluateAll((t) => t.map((e) => e.textContent + ':' + e.getAttribute('aria-selected'))), await page.evaluate(() => [window.Grasp.selection.items.map((i) => i.type + ':' + i.id), window.Grasp.selection.view]));
  // blank model
  await openStateFile(page, stateFileAt(BLANK)); await frame(page); await frame(page);
  console.log('blank rows', await rows(page), await page.evaluate(() => [...document.querySelectorAll('[data-testid="explorer"] [data-row]')].map((e) => e.textContent)));
  // a row picked on a floating tab, etc. skip. Collapse the left side and pick on the plane: no error
  console.log('problems', bare.problems);
  await bare.context.close();
} finally { await browser.close(); }
