const H = '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/rd-all/canvas/app/test/helpers.mjs';
const h = await import(H);
const browser = await h.launch();
const opened = await h.openIn(browser, h.stateFileAt(h.EXAMPLE));
const { page } = opened;
const model = h.modelOf(h.EXAMPLE); const view = model.views[0];
await h.showView(page, view, 6);
console.log('Host', JSON.stringify(await h.boxOf(page, view.id, 'Host')));
console.log('plane', JSON.stringify(await page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, h.planeOf(view.id))));
console.log('ground', JSON.stringify(await h.groundPoint(page, view)));
// selection with step 7's page
// MUI probes in the page, default theme
const out = await page.evaluate(async () => {
  const V = window.GraspVendor; const React = V['react']; const { createRoot } = V['react-dom/client']; const M = V['@mui/material'];
  const e = React.createElement; const res = {};
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const log = [];
  // Menu
  const menu = (open) => e(M.Menu, { open, onClose: (ev, why) => log.push('close:' + why), anchorReference: 'anchorPosition', anchorPosition: { left: 500, top: 300 }, transitionDuration: 0,
    slotProps: { list: { 'data-testid': 'palette', 'aria-label': 'Make here', dense: true }, root: { onContextMenu: (ev) => { ev.preventDefault(); ev.stopPropagation(); log.push('ctx'); } } } },
    [e(M.MenuItem, { key: 'a', 'data-tool': 'PartUsage', onClick: () => log.push('click a') }, 'part'), e(M.MenuItem, { key: 'b', 'data-tool': 'PortUsage', onClick: () => log.push('click b') }, 'port'), e(M.Divider, { key: 'd', component: 'li' }), e(M.MenuItem, { key: 'c', 'data-tool': 'Specialization' }, 'specializes')]);
  root.render(menu(true)); await wait(100);
  const ul = document.querySelector('[data-testid="palette"]');
  const r = ul.getBoundingClientRect();
  res.menu = { role: ul.getAttribute('role'), label: ul.getAttribute('aria-label'), rect: [r.x, r.y, r.width, r.height], kids: [...ul.children].map((c) => [c.tagName, c.getAttribute('role'), c.getAttribute('data-tool'), c.getBoundingClientRect().height, getComputedStyle(c).fontSize, c.textContent]), focus: document.activeElement?.textContent, rootModal: ul.closest('.MuiModal-root')?.getAttribute('aria-modal'), rootRole: ul.closest('.MuiModal-root')?.getAttribute('role'), paperRole: ul.closest('.MuiPaper-root')?.getAttribute('role') };
  root.render(menu(false)); await wait(50);
  res.menuGone = !document.querySelector('[data-testid="palette"]') && !document.querySelector('.MuiModal-root');
  // disabled-only menu
  root.render(e(M.Menu, { open: true, anchorReference: 'anchorPosition', anchorPosition: { left: 500, top: 300 }, transitionDuration: 0, slotProps: { list: { 'data-testid': 'palette', dense: true } } }, [e(M.MenuItem, { key: 'n', disabled: true }, 'Nothing can be made here.')])); await wait(100);
  const li = document.querySelector('[data-testid="palette"]').children[0];
  res.disabled = { aria: li.getAttribute('aria-disabled'), role: li.getAttribute('role'), tab: li.getAttribute('tabindex'), focus: document.activeElement?.tagName + ':' + document.activeElement?.getAttribute('role'), pe: getComputedStyle(li).pointerEvents };
  root.render(null); await wait(50);
  // near the edge
  root.render(e(M.Menu, { open: true, anchorReference: 'anchorPosition', anchorPosition: { left: 1390, top: 890 }, transitionDuration: 0, slotProps: { list: { 'data-testid': 'palette', dense: true } } }, [e(M.MenuItem, { key: 'n' }, 'part'), e(M.MenuItem, { key: 'm' }, 'specializes')])); await wait(100);
  { const q = document.querySelector('[data-testid="palette"]').getBoundingClientRect(); res.edge = [q.x, q.y, q.width, q.height]; }
  root.render(null); await wait(50);
  // Snackbar
  const snack = (said) => said ? e(M.Snackbar, { key: said.n, open: true, message: said.text, autoHideDuration: 8000, disableWindowBlurListener: true, transitionDuration: 0, anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, onClose: (ev, why) => log.push('snack:' + why), slotProps: { content: { 'data-testid': 'toast', role: 'status' } } }) : null;
  root.render(snack({ n: 1, text: 'Click a part def or a part in this view to put a port on its border.' })); await wait(100);
  const t = document.querySelector('[data-testid="toast"]'); const tr = t.getBoundingClientRect();
  res.toast = { role: t.getAttribute('role'), text: t.textContent, rect: [tr.x, tr.y, tr.width, tr.height], mid: tr.x + tr.width / 2, fromBottom: innerHeight - tr.bottom, font: getComputedStyle(t).fontSize, count: document.querySelectorAll('[data-testid="toast"]').length, kids: t.children.length };
  root.render(snack({ n: 2, text: 'Pick two different elements. Escape puts the tool down.' })); await wait(30);
  res.toast2 = { count: document.querySelectorAll('[data-testid="toast"]').length, text: document.querySelector('[data-testid="toast"]').textContent };
  root.render(snack(null)); await wait(0); await new Promise(requestAnimationFrame);
  res.toastGone = document.querySelectorAll('[data-testid="toast"]').length;
  // ToggleButton with tooltip
  root.render(e('div', { 'data-testid': 'tool-list', role: 'group', 'aria-label': 'Tools', style: { position: 'fixed', left: 400, top: 100, width: 200 } }, [
    e(M.Tooltip, { key: 'a', title: 'A part definition: square corners', describeChild: true, placement: 'right' }, e(M.ToggleButton, { value: 'PartDefinition', selected: false, 'data-testid': 'tool', 'data-tool': 'PartDefinition' }, 'part def')),
    e(M.Divider, { key: 'd' }), e(M.Divider, { key: 'd2', component: 'div' }),
    e(M.Tooltip, { key: 'b', title: 'x', describeChild: true }, e(M.ToggleButton, { value: 'S', selected: true, 'data-tool': 'S' }, 'specializes'))])); await wait(50);
  const tb = document.querySelector('[data-tool="PartDefinition"]'); const tb2 = document.querySelector('[data-tool="S"]');
  res.toggle = { tag: tb.tagName, pressed: tb.getAttribute('aria-pressed'), pressed2: tb2.getAttribute('aria-pressed'), title: tb.getAttribute('title'), label: tb.getAttribute('aria-label'), h: tb.getBoundingClientRect().height, transform: getComputedStyle(tb).textTransform, dividers: [...document.querySelectorAll('[data-testid="tool-list"] hr, [data-testid="tool-list"] .MuiDivider-root')].map((d) => d.tagName + ':' + d.getAttribute('role')) };
  window.__log = log; window.__root = root;
  return res;
});
console.log(JSON.stringify(out, null, 1));
// hover tooltip
await page.hover('[data-tool="PartDefinition"]'); await page.waitForTimeout(400);
console.log('tooltip', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[role="tooltip"]')].map((t) => t.textContent))), 'button by role:', await page.getByRole('button', { name: 'part def', exact: true }).count(), 'describedby', await page.evaluate(() => document.querySelector('[data-tool="PartDefinition"]').getAttribute('aria-describedby')));
await page.mouse.move(5, 5);
console.log('problems', JSON.stringify(opened.problems));
await opened.context.close(); await browser.close();
