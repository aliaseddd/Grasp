// Step 8's measurements, taken on a scratch build that carries switches (window.__sw) and timers (window.__t).
// node measure8.mjs <dist dir> [rounds]
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = '/home/user/Grasp';
const H = await import(path.join(REPO, 'canvas/app/test/helpers.mjs'));
const { VIEWS, middleService, scaleState } = await import(path.join(REPO, 'canvas/test/scale-model.mjs'));
const { boxOf, launch, moveTiming, NODE, EDGE, nodeOf, openPage, openStateFile, planeOf, sinceGiven, soon, stateFileOf, untilDrawn, viewTab, frame } = H;

const DIST = path.resolve(process.argv[2]);
const ROUNDS = Number(process.argv[3] || 5);
const ONLY = process.argv[4] ? process.argv[4].split('|') : null;
const URL_ = pathToFileURL(path.join(DIST, 'index.html')).href;
const ELEMENTS = 5000;
const STATE = scaleState(ELEMENTS);
const FILE = stateFileOf(`scale-${ELEMENTS}.json`, STATE);
const SERVICE = middleService(ELEMENTS);
const NUMBER = SERVICE.slice('Service'.length);
const BOX = { [VIEWS.definitions]: SERVICE, [VIEWS.deployment]: `Site${NUMBER}.service`, [VIEWS.workflows]: `Handle${NUMBER}.receive` };
const MOVES = 4; const START = [3, 2]; const STEP = [12, 6];
const TAKEN = `${NODE}, ${EDGE}, .react-flow__panel, button, input, a`;

function groundOf([plane, taken]) {
  const el = document.querySelector(plane);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const bare = (x, y) => { const hit = document.elementFromPoint(x, y); return !!hit && el.contains(hit) && !hit.closest(taken); };
  for (let y = r.top + 60; y <= r.bottom - 60; y += 20) for (let x = r.left + 80; x <= r.right - 80; x += 20) {
    if (bare(x, y) && bare(x - 8, y) && bare(x + 8, y) && bare(x, y - 8) && bare(x, y + 8)) return { x, y };
  }
  return null;
}

async function lookAt(page, view, id) {
  let box = await boxOf(page, view.id, id);
  let rate = 0.002;
  await page.keyboard.down('Control');
  try {
    for (let turn = 0; turn < 8 && Math.abs(box.zoom - 1) > 0.01; turn++) {
      const was = box;
      const delta = Math.max(-1500, Math.min(1500, Math.log2(was.zoom) / rate));
      await page.mouse.move(was.x + was.width / 2, was.y + was.height / 2);
      await page.mouse.wheel(0, delta);
      box = await soon(page, async () => { const now = await boxOf(page, view.id, id); return now && Math.abs(now.zoom - was.zoom) > 1e-9 ? now : null; }, 'no zoom');
      const seen = Math.log2(box.zoom / was.zoom) / -delta;
      if (seen > 0) rate = seen;
    }
  } finally { await page.keyboard.up('Control'); }
  return box;
}

const med = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : NaN; };
const f = (v) => (Number.isFinite(v) ? v.toFixed(1) : '  - ');
const line = (samples) => `${f(med(samples.map((s) => s.total)))} = ${f(med(samples.map((s) => s.script)))} script + ${f(med(samples.map((s) => s.frame)))} frame`;

async function gesture(page, time, from, way, starting, following) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  const at = { ...from };
  for (let m = 0; m < MOVES; m++) {
    const [dx, dy] = m ? STEP : START;
    at.x += way * dx; at.y += way * dy;
    (m ? following : starting).push(await time(() => page.mouse.move(at.x, at.y)));
  }
  await page.mouse.up();
  await frame(page);
}

const VARIANTS = [
  { name: 'as built', sw: {} },
  { name: 'no minimap', sw: { minimap: false } },
  { name: 'no lines while far', sw: { farLines: false } },
  { name: 'no minimap, no lines while far', sw: { minimap: false, farLines: false } },
  { name: 'no lines at all', sw: { lines: false } },
  { name: 'no minimap, no lines at all', sw: { minimap: false, lines: false } },
  { name: 'own minimap', sw: { minimap: 'own' } },
  { name: 'own fixed', sw: { minimap: 'own', fixed: true } },
  { name: 'own fixed, no far lines', sw: { minimap: 'own', fixed: true, farLines: false } },
  { name: 'own fixed, no far lines, crude', sw: { minimap: 'own', fixed: true, farLines: false, crude: true } },
  { name: 'own fixed, no far lines, layer', sw: { minimap: 'own', fixed: true, farLines: false }, css: '.react-flow__viewport { will-change: transform; }' },
  { name: 'own fixed, no far lines, contain', sw: { minimap: 'own', fixed: true, farLines: false }, css: '.react-flow__node { contain: layout style paint; }' },
  { name: 'own fixed, no far lines, no pointer', sw: { minimap: 'own', fixed: true, farLines: false }, css: '.react-flow__node.far .grasp-node-handle { display: none; }' },
  { name: 'own minimap, no lines while far', sw: { minimap: 'own', farLines: false } },
  { name: 'own minimap, no lines while far, crude step', sw: { minimap: 'own', farLines: false, crude: true } },
  { name: 'crude step', sw: { crude: true } },
  { name: 'own minimap, no lines while far, layer', sw: { minimap: 'own', farLines: false }, css: '.react-flow__viewport { will-change: transform; }' },
  { name: 'own minimap, no lines while far, contain', sw: { minimap: 'own', farLines: false }, css: '.react-flow__node { contain: layout style paint; }' },
].filter((v) => !ONLY || ONLY.includes(v.name));

const browser = await launch();
const out = [];
for (const variant of VARIANTS) {
  const b = H.withInit(browser, new Function(`window.__sw = ${JSON.stringify(variant.sw)}; window.__t = {};`));
  const opened = await openPage(b, { picker: false, url: URL_ });
  const { page } = opened;
  if (variant.css) await page.addStyleTag({ content: variant.css });
  await openStateFile(page, FILE);
  const views = STATE.model.views;
  await untilDrawn(page, views[0]);
  const opening = await sinceGiven(page);
  const row = { variant: variant.name, opening, views: {} };
  const time = await moveTiming(page);
  for (const view of views) {
    const tab = await viewTab(page, view);
    const t0 = performance.now();
    if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
    await untilDrawn(page, view);
    const shown = performance.now() - t0;
    const id = BOX[view.id];
    const fitted = await boxOf(page, view.id, id);
    const dom = await page.evaluate((plane) => ({ nodes: document.querySelectorAll(`${plane} .react-flow__node`).length, edges: document.querySelectorAll(`${plane} .react-flow__edge`).length, all: document.querySelector(plane).querySelectorAll('*').length }), planeOf(view.id));
    // Pan, fitted.
    const ps = []; const pf = [];
    for (let r = 0; r < ROUNDS; r++) {
      const ground = await page.evaluate(groundOf, [planeOf(view.id), TAKEN]);
      assert.ok(ground, 'no ground');
      await gesture(page, time, ground, r % 2 ? -1 : 1, ps, pf);
    }
    // Drag at 100%.
    await lookAt(page, view, id);
    const domNear = await page.evaluate((plane) => ({ nodes: document.querySelectorAll(`${plane} .react-flow__node`).length, edges: document.querySelectorAll(`${plane} .react-flow__edge`).length, all: document.querySelector(plane).querySelectorAll('*').length }), planeOf(view.id));
    // The commit: when the dragged node's style changes, against the pointermove and the frame's callbacks.
    await page.evaluate((sel) => {
      const node = document.querySelector(sel);
      const c = window.__commit = { moves: [], muts: [], rafs: [] };
      addEventListener('pointermove', () => { c.moves.push(performance.now()); requestAnimationFrame(() => c.rafs.push(performance.now())); }, true);
      new MutationObserver(() => c.muts.push(performance.now())).observe(node, { attributes: true, attributeFilter: ['style', 'class'] });
    }, nodeOf(view.id, id));
    await page.evaluate(() => { for (const k of Object.keys(window.__t)) window.__t[k] = []; });
    const ds = []; const df = [];
    for (let r = 0; r < ROUNDS; r++) {
      const was = await boxOf(page, view.id, id);
      await gesture(page, time, { x: was.x + 24 * was.zoom, y: was.y + 14 * was.zoom }, r % 2 ? -1 : 1, ds, df);
    }
    const inner = await page.evaluate(() => ({ t: window.__t, c: window.__commit }));
    // For each mutation: is it between a pointermove and the next raf?
    let inside = 0; let outside = 0;
    for (const m of inner.c.muts) {
      const mv = inner.c.moves.filter((x) => x <= m).pop();
      const rf = inner.c.rafs.find((x) => x >= (mv ?? 0));
      if (mv !== undefined && rf !== undefined && m <= rf + 0.05) inside++; else outside++;
    }
    // Pan at 100% too (near), for the record.
    const ns = []; const nf = [];
    for (let r = 0; r < ROUNDS; r++) {
      const ground = await page.evaluate(groundOf, [planeOf(view.id), TAKEN]);
      if (!ground) break;
      await gesture(page, time, ground, r % 2 ? -1 : 1, ns, nf);
    }
    const T = inner.t;
    // nodesChanged is called for every step; the first (under the click distance) and following differ: report medians of the larger half.
    const big = (a) => (a || []).filter((x) => x > 0.3);
    row.views[view.name] = {
      shown, zoom: fitted.zoom, dom, domNear,
      panStart: line(ps), panFollow: line(pf),
      dragStart: line(ds), dragFollow: line(df),
      nearPanFollow: line(nf),
      inner: `nodesChanged ${f(med(big(T.nodesChanged)))} (placesFor ${f(med(T.placesFor || []))} + project ${f(med(T.project || []))} + tell/React ${f(med(T.tell || []))}), n=${(T.project || []).length}`,
      commit: `${inside} of ${inside + outside} DOM changes of the dragged node fall between a pointermove and its frame's callbacks`,
      raw: { pf: pf.map((s) => +s.total.toFixed(1)), df: df.map((s) => +s.total.toFixed(1)) },
    };
  }
  out.push(row);
  await opened.context.close();
  console.log(`\n## ${variant.name} — opened in ${f(opening)} ms`);
  for (const [name, v] of Object.entries(row.views)) {
    console.log(`- ${name} (fit ${(v.zoom * 100).toFixed(1)}%, shown in ${f(v.shown)} ms; fitted DOM ${v.dom.nodes} nodes ${v.dom.edges} edges ${v.dom.all} elements; at 100% ${v.domNear.nodes} nodes ${v.domNear.edges} edges ${v.domNear.all} elements)`);
    console.log(`    pan fitted: start ${v.panStart} | follow ${v.panFollow}`);
    console.log(`    drag 100%:  start ${v.dragStart} | follow ${v.dragFollow}`);
    console.log(`    pan 100%:   follow ${v.nearPanFollow}`);
    console.log(`    drag inner: ${v.inner}`);
    console.log(`    commit:     ${v.commit}`);
    console.log(`    raw pan follow ${JSON.stringify(v.raw.pf)} drag follow ${JSON.stringify(v.raw.df)}`);
  }
}
await browser.close();
