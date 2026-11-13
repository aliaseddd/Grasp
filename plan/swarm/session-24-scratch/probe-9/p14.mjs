import path from 'node:path';
const H = await import('./wt/canvas/app/test/helpers.mjs');
const { launch, openIn, stateFileAt, FIXTURES, frame, EXAMPLE, cssColor } = H;
const browser = await launch();
try {
  for (const f of [EXAMPLE, path.join(FIXTURES, 'interconnection.json')]) {
    const o = await openIn(browser, stateFileAt(f));
    await frame(o.page);
    console.log(path.basename(f), await o.page.evaluate(() => { const e = document.querySelector('[data-testid="explorer"]'); const rows = [...e.querySelectorAll('.grasp-row-words')]; const cut = rows.filter((w) => w.scrollWidth > w.clientWidth).map((w) => w.textContent); const lefts = ['package:', 'view:v-proof', 'el:Page', 'el:Page.hosts', 'el:Page.hosts.api'].map((id) => e.querySelector(`[data-row="${id}"] .grasp-row-words`)?.getBoundingClientRect().left); const name = e.querySelector('.grasp-row-name'); const cs = getComputedStyle(name); const kw = getComputedStyle(e.querySelector('.grasp-row-kw')); return { rows: rows.length, cut, lefts, name: [cs.fontSize, cs.fontWeight, cs.fontFamily.slice(0, 20)], kw: kw.color, tree: [e.querySelector('[role=tree]').getAttribute('aria-label')], scroll: [e.scrollWidth, e.clientWidth], right: e.getBoundingClientRect().right }; }), await cssColor(o.page, 'var(--grasp-text-secondary)'));
    await o.context.close();
  }
} finally { await browser.close(); }
