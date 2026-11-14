// Runs the spike: opens each candidate from file:// in Chromium, exercises every item of the brief with real pointer
// events, prints pass or fail for each check and the measurements, and writes a.png and b.png beside this file.
//   node plan/spikes/geometry/build.cjs && node plan/spikes/geometry/run.cjs
// What it expects is worked out here from the model's numbers (40 px per metre, y up, the frame at the view's origin),
// not read back from the layout under test.

const { chromium } = require('playwright');
const path = require('path');

const here = __dirname;
const SCALE = 40;
const rows = [];
const numbers = { a: {}, b: {} };
const check = (c, item, name, ok, detail = '') => { rows.push({ c, item, name, ok: !!ok, detail: String(detail) }); };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const median = (list) => { const s = [...list].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const fix = (v, d = 2) => (typeof v === 'number' ? +v.toFixed(d) : v);
const geoRound = (v, pxPer) => { const p = Math.pow(10, Math.min(6, Math.max(0, Math.ceil(Math.log10(pxPer)) + 1))); return Math.round(v * p) / p; };
function random(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** The room's footprints in the view's units (x, y, w, h), from the model's numbers. */
const WANT = {
  room: [0, -240, 320, 240], 'room.desk': [80, -100, 80, 40], 'room.cabinet': [260, -40, 40, 20], 'room.pillar': [190, -170, 20, 20],
  'room.table': [52, -208, 72, 72], 'room.table.vase': [95.2, -186.8, 9.6, 9.6], 'room.desk.lamp': [88, -80, 12, 8],
  'room.shelf': [292.4, -220.28, 13.2, 49.48], rug: [232, -52, 48, 40], spare: [376, -228, 180, 60], beam: [376, -136, 180, 60], drum: [382, -42, 60, 60],
};
const ROUND = ['room.pillar', 'room.table', 'room.table.vase', 'drum'];
const DASHED = ['spare', 'beam', 'drum'];
/** A model point in metres, in the view's units. */
const view = (mx, my) => ({ x: mx * SCALE, y: -my * SCALE });

// What the script asks of a page, beside window.spike.
const HELPERS = () => {
  const screenBox = (el) => {
    const b = el.getBBox();
    const m = el.getScreenCTM();
    const p = new DOMPoint(b.x, b.y).matrixTransform(m);
    return { x: p.x, y: p.y, w: b.width * m.a, h: b.height * m.d };
  };
  window.T = {
    /** A footprint's outline on the screen, from its own numbers and its matrix to the screen: no stroke counted. */
    geo(id, root = document) {
      const o = root.querySelector(`[data-el="${id}"] .outline`);
      if (!o) return null;
      if (!o.getBBox) { const r = o.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, tag: o.tagName.toLowerCase() }; }
      const style = getComputedStyle(o);
      return { ...screenBox(o), tag: o.tagName.toLowerCase(), dash: style.strokeDasharray, stroke: style.stroke };
    },
    svgBox(selector) { const el = document.querySelector(selector); return el ? screenBox(el) : null; },
    box(selector, root = document) { const el = root.querySelector(selector); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; },
    state() { const h = document.querySelector('.geo-host').getBoundingClientRect(); return { cam: window.spike.store.camera, host: { x: h.x, y: h.y, w: h.width, h: h.height } }; },
    foot(id) { const f = window.spike.store.layout.byId.get(id); return f ? { ...f } : null; },
    picked() { return [...document.querySelectorAll('[data-el].selected')].map((e) => e.getAttribute('data-el')).sort(); },
    under(x, y) { const el = document.elementFromPoint(x, y); const foot = el && el.closest('[data-el]'); return foot ? foot.getAttribute('data-el') : null; },
  };
};

async function open(browser, name, query = '?show=none', size = { width: 1000, height: 700 }) {
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
  await page.goto('file://' + path.join(here, name + '.html') + query);
  await page.waitForFunction(() => window.spike);
  await page.evaluate(HELPERS);
  return page;
}
const state = (page) => page.evaluate(() => window.T.state());
const toScreen = (s, p) => ({ x: s.host.x + s.cam.x + p.x * s.cam.zoom, y: s.host.y + s.cam.y + p.y * s.cam.zoom });
const toView = (s, q) => ({ x: (q.x - s.host.x - s.cam.x) / s.cam.zoom, y: (q.y - s.host.y - s.cam.y) / s.cam.zoom });
const frame = (page) => page.evaluate(() => window.spike.frameEnd());
const fresh = async (page, which = 'room', options = {}) => { await page.evaluate(({ which, options }) => { window.spike.forget(which); return window.spike.show(which, options); }, { which, options }); };

/** A real click at a point of the view (rounded to a whole screen px): the hits the body reported, and where it was. */
async function click(page, p, key) {
  const s = await state(page);
  const q = toScreen(s, p);
  q.x = Math.round(q.x); q.y = Math.round(q.y);
  await page.evaluate(() => { window.spike.store.hits.length = 0; });
  if (key) await page.keyboard.down(key);
  await page.mouse.click(q.x, q.y);
  if (key) await page.keyboard.up(key);
  await frame(page);
  const hits = await page.evaluate(() => window.spike.store.hits.slice());
  return { hits, hit: hits[hits.length - 1] || null, at: toView(s, q), screen: q };
}

/** A real drag from a point of the view by whole screen px, in `steps` moves; `mid` runs before the button is let go. */
async function drag(page, p, dx, dy, { steps = 6, mid } = {}) {
  const s = await state(page);
  const q = toScreen(s, p);
  q.x = Math.round(q.x); q.y = Math.round(q.y);
  await page.mouse.move(q.x, q.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) await page.mouse.move(q.x + Math.round((dx * i) / steps), q.y + Math.round((dy * i) / steps));
  const seen = mid ? await mid() : null;
  await page.mouse.up();
  await frame(page);
  return { seen, s, q };
}

// ---- Reading pixels: a screenshot's rows and columns as luminance, through a canvas in a helper page.

async function profiles(helper, png, asks) {
  return helper.evaluate(async ({ b64, asks }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const g = canvas.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    return asks.map((a) => {
      const d = a.row !== undefined ? g.getImageData(a.from, a.row, a.to - a.from, 1).data : g.getImageData(a.col, a.from, 1, a.to - a.from).data;
      const out = [];
      for (let i = 0; i < d.length; i += 4) out.push(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]);
      return out;
    });
  }, { b64: png.toString('base64'), asks });
}
/** The middle of the dark stroke near `expected` along a profile that starts at pixel `from`, on white: the centroid of its darkness. */
function strokeAt(lum, from, expected, half) {
  let weight = 0; let sum = 0;
  for (let i = 0; i < lum.length; i++) {
    const centre = from + i + 0.5;
    if (Math.abs(centre - expected) > half) continue;
    const dark = Math.max(0, 255 - lum[i]);
    weight += dark; sum += dark * centre;
  }
  return weight > 20 ? sum / weight : NaN;
}

/**
 * How far the painted outline of a footprint is from where it should be, in screen px: the largest error of its four
 * edges (a rectangle) or of the ends of its horizontal and vertical diameters (a circle), read from a screenshot.
 * The footprint must lie on white (inside another footprint), so that nothing but its stroke is dark.
 */
async function painted(page, helper, id, zoom, inset = 0) {
  const [x, y, w, h] = WANT[id];
  const round = ROUND.includes(id);
  await page.evaluate((camera) => window.spike.setCamera(camera), { x: 500.37 - (x + w / 2) * zoom, y: 350.61 - (y + h / 2) * zoom, zoom });
  const s = await state(page);
  const a = toScreen(s, { x, y });
  const b = toScreen(s, { x: x + w, y: y + h });
  const cx = (a.x + b.x) / 2; const cy = (a.y + b.y) / 2;
  const row = Math.floor(cy); const col = Math.floor(cx);
  const png = await page.screenshot();
  const reach = Math.ceil(zoom) + 6;
  const [across, down] = await profiles(helper, png, [{ row, from: Math.floor(a.x) - reach, to: Math.ceil(b.x) + reach }, { col, from: Math.floor(a.y) - reach, to: Math.ceil(b.y) + reach }]);
  // A circle's chord along a pixel row that is not quite through its centre is a little shorter than its diameter.
  const r = (b.x - a.x) / 2;
  const chord = (off) => (round ? Math.sqrt(Math.max(0, r * r - off * off)) : r);
  const halfW = chord(row + 0.5 - cy); const halfH = round ? chord(col + 0.5 - cx) : (b.y - a.y) / 2;
  const half = Math.min(Math.max(2, zoom / 2 + 1.5), halfW - 0.2, halfH - 0.2);
  // `inset`: how far inside the edge the stroke's middle is (0 for an SVG stroke, half its width for a CSS border).
  const edges = [
    [strokeAt(across, Math.floor(a.x) - reach, cx - halfW + inset, half), cx - halfW + inset], [strokeAt(across, Math.floor(a.x) - reach, cx + halfW - inset, half), cx + halfW - inset],
    [strokeAt(down, Math.floor(a.y) - reach, cy - halfH + inset, half), cy - halfH + inset], [strokeAt(down, Math.floor(a.y) - reach, cy + halfH - inset, half), cy + halfH - inset],
  ];
  const errors = edges.map(([got, want]) => got - want);
  return { worst: Math.max(...errors.map(Math.abs)), errors: errors.map((e) => fix(e, 2)), width: fix(edges[1][0] - edges[0][0] + 2 * inset, 2), wantWidth: fix(2 * halfW, 2) };
}

// ---- The items, each for one candidate.

async function item1(page, c) {
  await fresh(page, 'room');
  const s = await state(page);
  const geo = await page.evaluate((ids) => Object.fromEntries(ids.map((id) => [id, window.T.geo(id)])), Object.keys(WANT));
  let worst = 0; let missing = [];
  for (const [id, [x, y, w, h]] of Object.entries(WANT)) {
    const g = geo[id];
    if (!g) { missing.push(id); continue; }
    const a = toScreen(s, { x, y });
    worst = Math.max(worst, Math.abs(g.x - a.x), Math.abs(g.y - a.y), Math.abs(g.w - w * s.cam.zoom), Math.abs(g.h - h * s.cam.zoom));
  }
  check(c, 1, 'each of the 12 footprints is drawn at its place and size, nested ones in their owner\'s frame with y up (a part in mm in a view in m among them)', missing.length === 0 && worst < 0.01, `largest difference ${worst.toExponential(1)} px${missing.length ? '; missing ' + missing : ''}`);
  check(c, 1, 'a round shape is a circle, the others rectangles', Object.keys(WANT).every((id) => geo[id] && geo[id].tag === (ROUND.includes(id) ? 'circle' : 'rect')), Object.keys(WANT).map((id) => geo[id] && geo[id].tag[0]).join(''));
  check(c, 1, 'a part with no shape, or with a dimension missing, is dashed, and no other is', Object.keys(WANT).every((id) => geo[id] && (geo[id].dash !== 'none') === DASHED.includes(id)), DASHED.map((id) => id + ' ' + (geo[id] && geo[id].dash)).join('; '));
  const words = await page.evaluate(() => ['room', 'room.desk', 'spare'].map((id) => ({
    id, name: window.T.box(`[data-el="${id}"] .uname`), head: window.T.box(`[data-el="${id}"] .head`), dims: window.T.box(`[data-el="${id}"] .geo-dims`), out: window.T.geo(id),
    text: [document.querySelector(`[data-el="${id}"] .head`).textContent, document.querySelector(`[data-el="${id}"] .geo-dims`).textContent],
  })));
  const [room, desk, spare] = words;
  const within = (r, o) => r.x >= o.x && r.y >= o.y && r.x + r.w <= o.x + o.w && r.y + r.h <= o.y + o.h;
  check(c, 1, 'the two lines of words are inside a large footprint', within(room.head, room.out) && within(room.dims, room.out) && room.dims.y > room.head.y, room.text.join(' / '));
  const below = desk.head.y >= desk.out.y + desk.out.h - 1 && desk.dims.y > desk.head.y && near(desk.head.x + desk.head.w / 2, desk.out.x + desk.out.w / 2, 2);
  check(c, 1, 'and below a small one, centred on it', below, `${desk.text.join(' / ')}; first line ${fix(desk.head.y - desk.out.y - desk.out.h, 1)} px under the outline`);
  check(c, 1, 'a part with no shape says so', spare.text[1] === 'no shape yet' && within(spare.head, spare.out), spare.text.join(' / '));
  const axes = await page.evaluate(() => ({
    x: window.T.svgBox('.geo-x'), y: window.T.svgBox('.geo-y'), bar: window.T.svgBox('.geo-bar'), origin: window.T.svgBox('.geo-origin'),
    names: [...document.querySelectorAll('.geo-label')].map((e) => e.textContent).join(','), words: document.querySelector('.geo-scale').textContent,
  }));
  const o = toScreen(s, { x: 0, y: 0 });
  const frameOk = near(axes.x.x, o.x, 0.01) && near(axes.x.y, o.y, 0.01) && near(axes.x.w, 96 * s.cam.zoom, 0.01) && near(axes.y.y, o.y - 96 * s.cam.zoom, 0.01) && near(axes.y.h, 96 * s.cam.zoom, 0.01) && axes.names === 'x,y';
  check(c, 1, 'the coordinate frame stands at the origin: x to the right, y up, with their names', frameOk, `names ${axes.names}`);
  check(c, 1, 'the scale bar reads "1 m" and is as long as 1 m of the drawing', axes.words === '1 m' && near(axes.bar.w, geo.room.w / 8, 0.001), `"${axes.words}", ${fix(axes.bar.w, 3)} px against ${fix(geo.room.w / 8, 3)} px`);
  await fresh(page, 'fixture');
  const four = await page.evaluate(() => [...document.querySelectorAll('[data-el]')].map((e) => e.getAttribute('data-el')));
  check(c, 1, 'the fixture as it is: its 4 footprints', four.length === 4, four.join(', '));
}

async function item2(page, c, helper) {
  await fresh(page, 'room');
  let worst = 0; let barWorst = 0;
  for (const zoom of [0.1, 0.25, 0.5, 1, 2, 4]) {
    await page.evaluate((camera) => window.spike.setCamera(camera), { x: 310.37 - 160 * zoom, y: 350.61 + 120 * zoom, zoom });
    const s = await state(page);
    const got = await page.evaluate((ids) => ({ geo: Object.fromEntries(ids.map((id) => [id, window.T.geo(id)])), bar: window.T.svgBox('.geo-bar'), words: document.querySelector('.geo-scale').textContent }), Object.keys(WANT));
    for (const [id, [x, y, w, h]] of Object.entries(WANT)) {
      const g = got.geo[id]; const a = toScreen(s, { x, y });
      worst = Math.max(worst, Math.abs(g.x - a.x), Math.abs(g.y - a.y), Math.abs(g.w - w * zoom), Math.abs(g.h - h * zoom));
    }
    barWorst = Math.max(barWorst, Math.abs(got.bar.w / (got.geo.room.w / 8) - 1));
    if (got.words !== '1 m') barWorst = 1;
  }
  check(c, 2, 'at zooms 0.1 to 4 every footprint keeps its place and size times the zoom (by the document\'s own geometry)', worst < 0.01, `largest difference ${worst.toExponential(1)} px`);
  check(c, 2, 'the scale bar stays true: it zooms with the plane, and is 1 m of the drawing at every zoom', barWorst < 1e-9, `largest error of the bar's length against 1 m of the room: ${barWorst.toExponential(1)}`);
  // What is painted, read from screenshots: the shelf (a rectangle of 13.2 by 49.48 px at 292.4, -220.28) and the vase (a circle of 9.6 px).
  const paintedWorst = { 'room.shelf': 0, 'room.table.vase': 0 };
  const detail = [];
  for (const zoom of [1, 2, 4]) {
    for (const id of Object.keys(paintedWorst)) {
      const m = await painted(page, helper, id, zoom);
      paintedWorst[id] = Math.max(paintedWorst[id], Number.isNaN(m.worst) ? 99 : m.worst);
      detail.push(`${id.split('.').pop()} at ${zoom}: ${m.errors.join(' ')}`);
    }
  }
  const all = Math.max(...Object.values(paintedWorst));
  numbers[c].paintedPx = fix(all, 2);
  check(c, 2, 'the painted outlines are where they should be, to under half a screen px, at zooms 1, 2 and 4 (read from screenshots)', all < 0.5, `largest edge error ${fix(all, 2)} px (${detail.join('; ')})`);
}

async function item3(page, c) {
  await fresh(page, 'room');
  const L = async (p) => page.evaluate((p) => window.spike.layout.footAt(window.spike.store.layout, p), p);
  const cases = [
    ['a click on a footprint gives its id', view(4, 5.6), 'el', 'room'],
    ['a click on the empty ground gives the ground', view(9, 5.8), 'ground', null],
    ['inside a circle: the circle', view(2.2, 4.9), 'el', 'room.table'],
    ['in the corner of a circle\'s bounding square, outside the circle: what lies under it (the room)', view(2.2 + 0.8, 4.3 + 0.8), 'el', 'room'],
    ['the same corner of a circle that lies on the ground: the ground', { x: 412 + 27, y: -12 - 27 }, 'ground', null],
    ['a small footprint on top of its owner is the one hit (the lamp on the desk)', { x: 94, y: -76 }, 'el', 'room.desk.lamp'],
    ['and the vase on the round table', { x: 100, y: -182 }, 'el', 'room.table.vase'],
    ['a footprint drawn later lies on top of another one\'s part (the rug over the cabinet)', view(6.75, 0.75), 'el', 'rug'],
  ];
  for (const [name, p, type, id] of cases) {
    const r = await click(page, p);
    const reader = await L(r.at);
    const ok = r.hits.length === 1 && r.hit.type === type && r.hit.id === id && near(r.hit.at.x, r.at.x, 0.01) && near(r.hit.at.y, r.at.y, 0.01) && reader === id;
    check(c, 3, name, ok, r.hit ? `${r.hits.length} hit: ${r.hit.type} ${r.hit.id} at ${fix(r.hit.at.x)}, ${fix(r.hit.at.y)} (clicked at ${fix(r.at.x)}, ${fix(r.at.y)}; the layout's footAt says ${reader})` : 'no hit');
  }
  const r = await click(page, view(3.0, 1.8));
  const model = await page.evaluate((at) => ({ m: window.spike.layout.toModel(window.spike.M, window.spike.store.layout, at, 'm'), mm: window.spike.layout.toModel(window.spike.M, window.spike.store.layout, at, 'mm', 'room.desk') }), r.hit.at);
  const want = { x: r.at.x / SCALE, y: -r.at.y / SCALE };
  check(c, 3, 'the point is in the view\'s own units, and gives model coordinates in a unit (m in the view\'s frame, mm in the desk\'s)', r.hit.id === 'room.desk' && near(model.m.x, want.x, 1e-6) && near(model.m.y, want.y, 1e-6) && near(model.mm.x, (want.x - 2) * 1000, 1e-3) && near(model.mm.y, (want.y - 1.5) * 1000, 1e-3),
    `view ${fix(r.hit.at.x)}, ${fix(r.hit.at.y)} = ${fix(model.m.x, 4)}, ${fix(model.m.y, 4)} m = ${fix(model.mm.x, 1)}, ${fix(model.mm.y, 1)} mm in the desk`);
  const add = await click(page, view(3.0, 1.8), 'Control');
  check(c, 3, 'Ctrl with the click is told apart', add.hit && add.hit.add === true && r.hit.add === false, add.hit ? `add ${add.hit.add}` : 'no hit');
  for (const [p, type, id] of [[view(3.0, 1.8), 'el', 'room.desk'], [view(9, 5.8), 'ground', null]]) {
    const st = await state(page);
    const q = toScreen(st, p);
    await page.evaluate(() => { window.spike.store.hits.length = 0; });
    await page.mouse.click(Math.round(q.x), Math.round(q.y), { button: 'right' });
    await frame(page);
    const hits = await page.evaluate(() => window.spike.store.hits.slice());
    check(c, 3, `a right-click on ${id || 'the ground'} gives the same kind of hit (for the palette)`, hits.length === 1 && hits[0].menu === true && hits[0].type === type && hits[0].id === id, JSON.stringify(hits));
  }
  const name = await page.evaluate(() => window.T.box('[data-el="room.pillar"] .uname'));
  const s = await state(page);
  const onWords = await click(page, toView(s, { x: name.x + name.w / 2, y: name.y + name.h / 2 }));
  check(c, 3, 'a click on the words below a small footprint is a click on that footprint (as on the old page), though the layout\'s footAt, which knows only the outlines, says what lies under the words', onWords.hit && onWords.hit.id === 'room.pillar', onWords.hit ? `${onWords.hit.type} ${onWords.hit.id}` : 'no hit');
}

async function item4(page, c) {
  await fresh(page, 'room');
  await page.evaluate(() => window.spike.store.select(['room.desk', 'room.pillar', 'room.table.vase']));
  await frame(page);
  const three = await page.evaluate(() => ({ picked: window.T.picked(), stroke: ['room.desk', 'room.pillar', 'room'].map((id) => window.T.geo(id).stroke) }));
  check(c, 4, 'several footprints are shown selected at once, from a list of ids given from outside', three.picked.join() === 'room.desk,room.pillar,room.table.vase' && three.stroke[0] === three.stroke[1] && three.stroke[0] !== three.stroke[2], `${three.picked.join(', ')}; outline ${three.stroke[0]} against ${three.stroke[2]}`);
  await page.evaluate(() => window.spike.store.select([]));
  await frame(page);
  // A click must pick nothing by itself: the host decides.
  await page.evaluate(() => { window.spike.store.onHit = null; });
  const r = await click(page, view(3.0, 1.8));
  const after = await page.evaluate(() => ({ picked: window.T.picked(), marked: document.querySelectorAll('.react-flow__node.selected').length }));
  check(c, 4, 'a click the host does nothing with shows nothing selected: the body keeps no selection of its own', r.hit && r.hit.id === 'room.desk' && after.picked.length === 0 && after.marked === 0, `picked ${after.picked.length}, React Flow's own selected nodes ${after.marked}`);
  await page.evaluate(() => { window.spike.store.select(['room']); });
  await frame(page);
  const under = await click(page, view(6.2, 0.5));
  const seen = await page.evaluate(() => window.T.picked());
  check(c, 4, 'a selected footprint is not raised over what lies on it (the room selected, the rug still on top)', seen.join() === 'room' && under.hit && under.hit.id === 'rug', under.hit ? `${under.hit.type} ${under.hit.id}` : 'no hit');
}

async function item5(page, c) {
  await fresh(page, 'room');
  await page.evaluate(() => window.spike.setCamera({ x: 180.4, y: 590.3, zoom: 2 }));
  const read = () => page.evaluate(() => ({
    desk: window.T.geo('room.desk'), lamp: window.T.geo('room.desk.lamp'), results: window.spike.store.results.length,
    model: window.spike.store.model.elements.filter((e) => e.id === 'room.desk' || e.id === 'room.desk.lamp').map((e) => [e.posX, e.posY]),
    live: [window.T.foot('room.desk').posX, window.T.foot('room.desk').posY], handles: document.querySelectorAll('.react-flow__resize-control').length,
  }));
  const before = await read();
  // 53 screen px at zoom 2 are 26.5 of the view's units, 0.6625 m: the step must show 2.663 m, not 2.6625.
  const d = await drag(page, view(3.0, 1.8), 53, -37, { mid: read });
  const mid = d.seen;
  const after = await read();
  const want = { posX: geoRound(2 + 53 / 2 / SCALE, SCALE), posY: geoRound(1.5 + 37 / 2 / SCALE, SCALE) };
  const wantX = d.s.host.x + d.s.cam.x + want.posX * SCALE * 2;
  check(c, 5, 'a drag\'s steps are shown live, each at the rounded position, and nothing is written or reported before its end', near(mid.desk.x, wantX, 0.01) && mid.live[0] === want.posX && mid.live[1] === want.posY && mid.results === 0 && mid.model[0][0] === 2,
    `mid-drag: drawn at ${fix(mid.desk.x, 3)} px (rounded position ${fix(wantX, 3)}, unrounded ${fix(before.desk.x + 53, 3)}), position ${mid.live.join(', ')} m, results ${mid.results}, model still ${mid.model[0].join(', ')}`);
  check(c, 5, 'what it holds moves with it (the lamp with the desk)', near(mid.lamp.x - before.lamp.x, mid.desk.x - before.desk.x, 0.001) && near(mid.lamp.y - before.lamp.y, mid.desk.y - before.desk.y, 0.001) && after.model[1].join() === '200,300', `lamp moved ${fix(mid.lamp.x - before.lamp.x, 3)}, ${fix(mid.lamp.y - before.lamp.y, 3)} px with the desk's ${fix(mid.desk.x - before.desk.x, 3)}, ${fix(mid.desk.y - before.desk.y, 3)}; its own position stays 200, 300 mm`);
  const result = await page.evaluate(() => window.spike.store.results.slice());
  const one = result.length === 1 && result[0].moved.length === 1 && result[0].moved[0].id === 'room.desk' && result[0].moved[0].posX === want.posX && result[0].moved[0].posY === want.posY;
  check(c, 5, 'the gesture reports one final result at its end: the new posX, posY, rounded as geoRound does', one && after.model[0][0] === want.posX && after.model[0][1] === want.posY, JSON.stringify(result));
  // The lamp is in mm: a pixel is worth 25 mm, so its position is rounded to whole mm.
  await page.evaluate(() => { window.spike.store.results.length = 0; });
  const lamp = await page.evaluate(() => window.T.foot('room.desk.lamp'));
  await drag(page, { x: lamp.x + 6, y: lamp.y + 4 }, 31, 17);
  const mm = await page.evaluate(() => window.spike.store.results.slice());
  const wantMm = { posX: geoRound(200 + 31 / 2 / 0.04, 0.04), posY: geoRound(300 - 17 / 2 / 0.04, 0.04) };
  check(c, 5, 'the rounding is in the part\'s own unit (a part in mm lands on whole mm: 587.5 becomes 588)', mm.length === 1 && mm[0].moved[0].posX === wantMm.posX && mm[0].moved[0].posY === wantMm.posY && Number.isInteger(mm[0].moved[0].posX), JSON.stringify(mm));
  await page.evaluate(() => { window.spike.store.results.length = 0; window.spike.store.hits.length = 0; });
  const cab = await page.evaluate(() => window.T.foot('room.cabinet'));
  await drag(page, { x: cab.x + 30, y: cab.y + 5 }, 2, 2, { steps: 2 });
  const slip = await page.evaluate(() => ({ results: window.spike.store.results.length, hits: window.spike.store.hits.map((h) => h.id), pos: [window.T.foot('room.cabinet').posX, window.T.foot('room.cabinet').posY] }));
  check(c, 5, 'a press that slips 2 px is a click, and moves nothing', slip.results === 0 && slip.hits.join() === 'room.cabinet' && slip.pos.join() === '6.5,0.5', JSON.stringify(slip));
  await page.evaluate(() => { window.spike.store.select(['room.cabinet']); });
  await frame(page);
  const handles = await page.evaluate(() => document.querySelectorAll('.react-flow__resize-control, [class*="resize"]').length);
  check(c, 5, 'a selected footprint has no resize handles', handles === 0, `${handles} handles`);
  // Dragging by the words below a small footprint moves it too.
  await page.evaluate(() => { window.spike.store.select([]); window.spike.store.results.length = 0; });
  const name = await page.evaluate(() => window.T.box('[data-el="room.cabinet"] .uname'));
  const s = await state(page);
  await drag(page, toView(s, { x: name.x + name.w / 2, y: name.y + name.h / 2 }), -20, -10);
  const byWords = await page.evaluate(() => window.spike.store.results.slice());
  check(c, 5, 'a footprint can be dragged by its words', byWords.length === 1 && byWords[0].moved[0] && byWords[0].moved[0].id === 'room.cabinet', JSON.stringify(byWords));
  // With its owner picked, a nested footprint is still the one dragged; and a press in the corner of a circle's
  // bounding square, outside the circle, drags what lies under it.
  await fresh(page, 'room');
  await page.evaluate(() => { window.spike.store.select(['room']); });
  await frame(page);
  await drag(page, view(3.0, 1.8), 24, -16);
  const nested = await page.evaluate(() => window.spike.store.results.slice());
  check(c, 5, 'with its owner selected, a drag on a nested footprint moves the nested one, not the owner', nested.length === 1 && nested[0].moved.length === 1 && nested[0].moved[0].id === 'room.desk', JSON.stringify(nested));
  await fresh(page, 'room');
  await drag(page, view(2.2 + 0.8, 4.3 + 0.8), 20, 10);
  const corner = await page.evaluate(() => window.spike.store.results.slice());
  check(c, 5, 'a drag begun in the corner of a circle\'s bounding square, outside the circle, moves what lies under it (the room), not the circle', corner.length === 1 && corner[0].moved.length === 1 && corner[0].moved[0].id === 'room', JSON.stringify(corner));
  await fresh(page, 'room');
  await page.evaluate(() => window.spike.setCamera({ x: 180.4, y: 590.3, zoom: 2 }));
  // An owner whose width is set in a panel grows upward from its origin: what it holds stays where it is.
  const was = await page.evaluate(() => ({ room: window.T.geo('room'), table: window.T.geo('room.table') }));
  await page.evaluate(() => { window.spike.store.model.elements.find((e) => e.id === 'room').width = 7; window.spike.store.changed(); });
  await frame(page);
  const now = await page.evaluate(() => ({ room: window.T.geo('room'), table: window.T.geo('room.table') }));
  check(c, 5, 'a dimension set from outside (the room\'s width, 6 m to 7 m) grows the footprint away from its origin, and what it holds stays in place', near(now.room.y, was.room.y - SCALE * 2, 0.01) && near(now.room.y + now.room.h, was.room.y + was.room.h, 0.01) && near(now.table.y, was.table.y, 0.01) && near(now.table.x, was.table.x, 0.01),
    `room's top went ${fix(now.room.y - was.room.y, 2)} px, its bottom ${fix(now.room.y + now.room.h - was.room.y - was.room.h, 2)}, the table ${fix(now.table.y - was.table.y, 2)}`);
}

async function item6(page, c) {
  await fresh(page, 'room');
  for (const zoom of [1, 2]) {
    await page.evaluate((camera) => window.spike.setCamera(camera), { x: 250.3 - 100 * zoom, y: 400.2 + 100 * zoom, zoom });
    const s = await state(page);
    const m = await page.evaluate(() => ({
      deskPin: window.T.box('[data-el="room.desk"] [data-pin="1"]'), desk: window.T.geo('room.desk'),
      tablePin: window.T.box('[data-el="room.table"] [data-pin="3"]'), tableBadge: window.T.box('[data-el="room.table"] [data-badge]'), table: window.T.geo('room.table'),
      beamBadge: window.T.box('[data-el="beam"] [data-badge]'), beam: window.T.geo('beam'), beamCount: document.querySelector('[data-el="beam"] [data-badge]').textContent,
      roomPins: [...document.querySelectorAll('[data-el="room"] > [data-pin], [data-el="room"] > * > [data-pin]')].map((e) => e.getAttribute('data-pin')).join(),
      free: window.T.box('.is-free[data-pin="2"]'),
    }));
    const mid = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
    const onTop = (mark, foot) => mark && near(mid(mark).y, foot.y, 1.5 * zoom) && mid(mark).x >= foot.x - 1 && mid(mark).x <= foot.x + foot.w + 1;
    check(c, 6, `at zoom ${zoom}: a numbered pin and a badge with a count sit on a footprint's top edge (a rectangle's and a circle's), several side by side`, onTop(m.deskPin, m.desk) && onTop(m.tablePin, m.table) && onTop(m.tableBadge, m.table) && onTop(m.beamBadge, m.beam) && m.beamCount === '2' && m.roomPins === '4,5' && Math.abs(mid(m.tablePin).x - mid(m.tableBadge).x) > 10 * zoom,
      `pin 1 is ${fix(mid(m.deskPin).y - m.desk.y, 1)} px from the desk's top edge; the table's pin and badge are ${fix(Math.abs(mid(m.tablePin).x - mid(m.tableBadge).x), 1)} px apart; the room carries pins ${m.roomPins}; beam's badge reads ${m.beamCount}`);
    const want = toScreen(s, { x: 420, y: -262 });
    check(c, 6, `at zoom ${zoom}: a free pin floats at its point of the view`, m.free && near(mid(m.free).x, want.x, 0.6) && near(mid(m.free).y, want.y, 0.6), m.free ? `${fix(mid(m.free).x - want.x, 2)}, ${fix(mid(m.free).y - want.y, 2)} px from the point` : 'not drawn');
  }
  const s = await state(page);
  const pin = await page.evaluate(() => window.T.box('[data-el="room.desk"] [data-pin="1"]'));
  const r = await click(page, toView(s, { x: pin.x + pin.w / 2, y: pin.y + pin.h / 2 }));
  const free = await click(page, { x: 420, y: -262 });
  check(c, 6, 'a click on a pin is told from a click on its footprint, and a free pin takes clicks too', r.hit && r.hit.type === 'pin' && r.hit.id === '1' && free.hit && free.hit.type === 'pin' && free.hit.id === '2', `${r.hit && r.hit.type} ${r.hit && r.hit.id}; ${free.hit && free.hit.type} ${free.hit && free.hit.id}`);
}

async function item7(page, c) {
  await fresh(page, 'room');
  const widths = [];
  let ok = true; const notes = [];
  for (const zoom of [0.5, 1, 2, 3.3]) {
    await page.evaluate((camera) => window.spike.setCamera(camera), { x: 300.3 - 120 * zoom, y: 400.2 + 80 * zoom, zoom });
    const m = await page.evaluate(() => {
      const el = document.querySelector('[data-el="room.desk"] .uname');
      const r = el.getBoundingClientRect();
      // The editor a host would lay over the name: a field at the name's own rectangle.
      const input = document.createElement('input');
      input.className = 'editor';
      input.value = el.textContent;
      Object.assign(input.style, { left: r.x + 'px', top: r.y + 'px', width: r.width + 'px', height: r.height + 'px', });
      document.body.appendChild(input);
      const over = input.getBoundingClientRect();
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === input;
      input.remove();
      return { name: { x: r.x, y: r.y, w: r.width, h: r.height }, over: { x: over.x, y: over.y, w: over.width, h: over.height }, hit, desk: window.T.geo('room.desk'), text: el.textContent, tag: el.tagName.toLowerCase() };
    });
    widths.push(m.name.w / zoom);
    // A laid-out box is placed to 1/64 px, so the editor is within that of the name's rectangle.
    const laid = near(m.over.x, m.name.x, 0.02) && near(m.over.y, m.name.y, 0.02) && near(m.over.w, m.name.w, 0.02) && near(m.over.h, m.name.h, 0.02) && m.hit;
    const placed = m.name.w > 5 * zoom && m.name.y >= m.desk.y + m.desk.h - 1 && m.name.y + m.name.h <= m.desk.y + m.desk.h + 22 * zoom && m.name.x > m.desk.x - 60 * zoom && m.name.x + m.name.w < m.desk.x + m.desk.w + 60 * zoom;
    if (!laid || !placed) ok = false;
    notes.push(`zoom ${zoom}: <${m.tag}> "${m.text}" ${fix(m.name.w, 1)} by ${fix(m.name.h, 1)} px${laid ? '' : ' EDITOR OFF ' + JSON.stringify(m.over) + ' for ' + JSON.stringify(m.name)}${placed ? '' : ' NOT UNDER THE DESK'}`);
  }
  const steady = Math.max(...widths) - Math.min(...widths) < 1.5;
  check(c, 7, 'the name on a footprint is an element whose screen rectangle is read at any zoom, and an editor laid over that rectangle covers it', ok && steady, `${notes.join('; ')}; its width over the zoom varies by ${fix(Math.max(...widths) - Math.min(...widths), 2)} px`);
}

async function item8(page, c) {
  await fresh(page, 'room');
  const s0 = await state(page);
  await page.mouse.move(700, 150);
  await page.mouse.wheel(30, 50);
  await frame(page); await frame(page);
  const s1 = await state(page);
  check(c, 8, 'the wheel pans (30 right, 50 down moves the drawing 30 left, 50 up)', near(s1.cam.x - s0.cam.x, -30, 0.01) && near(s1.cam.y - s0.cam.y, -50, 0.01) && s1.cam.zoom === s0.cam.zoom, `camera moved ${fix(s1.cam.x - s0.cam.x)}, ${fix(s1.cam.y - s0.cam.y)}`);
  const over = toScreen(s1, view(3.0, 1.8));
  await page.mouse.move(Math.round(over.x), Math.round(over.y));
  await page.mouse.wheel(0, 40);
  await frame(page); await frame(page);
  const s1b = await state(page);
  check(c, 8, 'the wheel pans over a footprint as over the ground', near(s1b.cam.y - s1.cam.y, -40, 0.01), `camera moved ${fix(s1b.cam.y - s1.cam.y)}`);
  const p = { x: 520, y: 330 };
  const under = toView(s1b, p);
  await page.mouse.move(p.x, p.y);
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, -120);
  await page.keyboard.up('Control');
  await frame(page); await frame(page);
  const s2 = await state(page);
  const still = toScreen(s2, under);
  check(c, 8, 'Ctrl with the wheel zooms about the pointer (the point under it stays put)', s2.cam.zoom > s1b.cam.zoom * 1.1 && near(still.x, p.x, 0.5) && near(still.y, p.y, 0.5), `zoom ${fix(s1b.cam.zoom, 3)} to ${fix(s2.cam.zoom, 3)}; the point under the pointer moved ${fix(still.x - p.x, 2)}, ${fix(still.y - p.y, 2)} px`);
  await page.evaluate(() => { window.spike.store.hits.length = 0; });
  // A point of the ground: the first of a row of screen points that no footprint lies under.
  let g = null;
  for (let x = 900; x > 100 && !g; x -= 40) if (await page.evaluate((x) => window.T.under(x, 120) === null && window.T.under(x + 40, 145) === null, x)) g = { x, y: 120 };
  const hitUnder = await page.evaluate((g) => window.T.under(g.x, g.y), g);
  await page.mouse.move(g.x, g.y);
  await page.mouse.down();
  for (let i = 1; i <= 5; i++) await page.mouse.move(g.x + 8 * i, g.y + 5 * i);
  await page.mouse.up();
  await frame(page); await frame(page);
  const s3 = await state(page);
  const hits = await page.evaluate(() => window.spike.store.hits.length);
  check(c, 8, 'a drag on the ground pans, and is no click', hitUnder === null && near(s3.cam.x - s2.cam.x, 40, 0.01) && near(s3.cam.y - s2.cam.y, 25, 0.01) && hits === 0, `camera moved ${fix(s3.cam.x - s2.cam.x)}, ${fix(s3.cam.y - s2.cam.y)}; ${hits} clicks`);
  const before = await page.evaluate(() => window.T.geo('room.desk'));
  await page.evaluate(() => window.spike.hide());
  const gone = await page.evaluate(() => document.querySelectorAll('[data-el]').length);
  await page.evaluate(() => window.spike.show('room'));
  const s4 = await state(page);
  const after = await page.evaluate(() => window.T.geo('room.desk'));
  check(c, 8, 'the camera is kept outside React: unmounted and mounted again, the body shows the view where it was', gone === 0 && near(s4.cam.x, s3.cam.x, 1e-6) && near(s4.cam.y, s3.cam.y, 1e-6) && near(s4.cam.zoom, s3.cam.zoom, 1e-9) && near(after.x, before.x, 0.01) && near(after.y, before.y, 0.01) && near(after.w, before.w, 0.01),
    `camera ${fix(s4.cam.x)}, ${fix(s4.cam.y)} at ${fix(s4.cam.zoom, 3)}; the desk is ${fix(after.x - before.x, 3)}, ${fix(after.y - before.y, 3)} px from where it was`);
}

async function item9(page, c) {
  await fresh(page, 'room');
  const sizes = [];
  let ok = true;
  for (const box of [{ left: 60, top: 40, width: 640, height: 420 }, { left: 0, top: 0, width: 333, height: 555 }]) {
    await page.evaluate((box) => { const h = document.getElementById('host'); for (const k of Object.keys(box)) h.style[k] = box[k] + 'px'; }, box);
    await frame(page); await frame(page);
    const got = await page.evaluate(() => { const b = (document.querySelector('.react-flow') || document.querySelector('.geo-host')).getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
    if (!(got.x === box.left && got.y === box.top && got.w === box.width && got.h === box.height)) ok = false;
    // Fitted into that rectangle, everything drawn lies inside it, and a click still finds what is under it.
    await page.evaluate((box) => window.spike.setCamera(window.spike.layout.fit(window.spike.store.sizeOf().bounds, box.width, box.height, 10)), box);
    const drawn = await page.evaluate(() => { const all = [...document.querySelectorAll('[data-el] .outline, .geo-axes')].map((e) => e.getBoundingClientRect()); return { x1: Math.min(...all.map((r) => r.left)), y1: Math.min(...all.map((r) => r.top)), x2: Math.max(...all.map((r) => r.right)), y2: Math.max(...all.map((r) => r.bottom)) }; });
    if (!(drawn.x1 >= box.left && drawn.y1 >= box.top && drawn.x2 <= box.left + box.width && drawn.y2 <= box.top + box.height)) ok = false;
    const r = await click(page, view(4, 5.6));
    if (!(r.hit && r.hit.id === 'room' && near(r.hit.at.x, r.at.x, 0.01) && near(r.hit.at.y, r.at.y, 0.01))) ok = false;
    sizes.push(`${got.w} by ${got.h} at ${got.x}, ${got.y}`);
  }
  check(c, 9, 'the body draws itself in whatever rectangle its host gives it, and its clicks stay right there', ok, sizes.join('; '));
  await page.evaluate(() => { const h = document.getElementById('host'); for (const k of ['left', 'top', 'width', 'height']) h.style[k] = ''; });
  const size = await page.evaluate(() => window.spike.store.sizeOf());
  const all = await page.evaluate(() => { const feet = [...document.querySelectorAll('[data-el]'), document.querySelector('.geo-axes')].map((e) => e.getBoundingClientRect()); return { x1: Math.min(...feet.map((r) => r.left)), y1: Math.min(...feet.map((r) => r.top)), x2: Math.max(...feet.map((r) => r.right)), y2: Math.max(...feet.map((r) => r.bottom)) }; });
  const s = await state(page);
  const a = toScreen(s, { x: size.bounds.x, y: size.bounds.y }); const b = toScreen(s, { x: size.bounds.x + size.bounds.w, y: size.bounds.y + size.bounds.h });
  check(c, 9, 'it says how large its content is, and everything drawn (words below the footprints, axes and scale bar) lies inside that', all.x1 >= a.x - 1 && all.y1 >= a.y - 10 && all.x2 <= b.x + 1 && all.y2 <= b.y + 1, `content ${fix(size.width, 1)} by ${fix(size.height, 1)}; drawn from ${fix(all.x1 - a.x, 1)}, ${fix(all.y1 - a.y, 1)} inside its corner to ${fix(b.x - all.x2, 1)}, ${fix(b.y - all.y2, 1)} inside the other`);
  await fresh(page, 'empty');
  const empty = await page.evaluate(() => { const r = document.querySelector('.geo-axes').getBoundingClientRect(); const h = document.querySelector('.geo-host').getBoundingClientRect(); return { size: window.spike.store.sizeOf(), axes: { x: r.x, y: r.y, w: r.width, h: r.height }, host: { w: h.width, h: h.height }, feet: document.querySelectorAll('[data-el]').length, words: document.querySelector('.geo-scale').textContent }; });
  const framed = empty.axes.x >= 48 && empty.axes.y >= 48 && empty.axes.x + empty.axes.w <= empty.host.w - 48 && empty.axes.y + empty.axes.h <= empty.host.h - 48;
  check(c, 9, 'an empty view says the size of its axes and scale bar, and the fit frames them', empty.feet === 0 && empty.size.width === 128 && empty.size.height === 144 && framed && empty.words === '1 m', `content ${empty.size.width} by ${empty.size.height}; the axes drawn ${fix(empty.axes.w, 1)} by ${fix(empty.axes.h, 1)} px at ${fix(empty.axes.x, 1)}, ${fix(empty.axes.y, 1)}`);
}

// ---- The measurements.

/** Measurement 4: the largest error between where a footprint is dropped and the position the gesture reports. */
async function drops(page, c, options = {}) {
  const next = random(20261114);
  const targets = ['room', 'room.desk', 'room.desk.lamp', 'room.pillar', 'rug'];
  const out = { reported: 0, drawn: 0, reportedMm: 0, count: 0, missed: [], perZoom: {} };
  for (const zoom of options.zooms || [0.5, 1, 2]) {
    let worst = 0;
    for (let i = 0; i < (options.count || 20); i++) {
      // Each drop begins from the view as it is first shown, so that no earlier drop has laid one footprint's words over another.
      await fresh(page, 'room');
      await page.evaluate((camera) => window.spike.setCamera(camera), { x: 500.4 - 160 * zoom, y: 350.3 + 120 * zoom, zoom });
      const id = targets[i % targets.length];
      const foot = await page.evaluate((id) => window.T.foot(id), id);
      const s = await state(page);
      // A point of the footprint that nothing lies on, at a whole screen px.
      let press = null;
      for (let k = 0; k < 60 && !press; k++) {
        const q = toScreen(s, { x: foot.x + foot.w * (0.15 + 0.7 * next()), y: foot.y + foot.h * (0.15 + 0.7 * next()) });
        const p = toView(s, { x: Math.round(q.x), y: Math.round(q.y) });
        if (await page.evaluate(({ x, y, id }) => window.T.under(x, y) === id && !document.elementFromPoint(x, y).closest('[data-pin], [data-badge]'), { x: Math.round(q.x), y: Math.round(q.y), id })) press = p;
      }
      let dx = Math.round((next() - 0.5) * 90);
      const dy = Math.round((next() - 0.5) * 90);
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) dx = 11;
      if (!press) { out.missed.push(`${id} at ${zoom}: no free point to press`); continue; }
      await page.evaluate(() => { window.spike.store.results.length = 0; });
      await drag(page, press, dx, dy, { steps: 4 });
      const got = await page.evaluate((id) => ({ results: window.spike.store.results.slice(), geo: window.T.geo(id), foot: window.T.foot(id), owner: window.T.foot(window.T.foot(id).parent) }), id);
      const moved = got.results.length === 1 ? got.results[0].moved.find((m) => m.id === id) : null;
      if (!moved) { out.missed.push(`${id} at ${zoom} by ${dx}, ${dy}: ${JSON.stringify(got.results)}`); continue; }
      // Where the pointer let it go, in the part's own unit; and where its outline is drawn after the drop.
      const want = { posX: foot.posX + dx / zoom / foot.px, posY: foot.posY - dy / zoom / foot.px };
      const origin = foot.shape === 'circle' ? { x: got.geo.x + got.geo.w / 2, y: got.geo.y + got.geo.h / 2 } : { x: got.geo.x, y: got.geo.y + got.geo.h };
      const o = toView(s, origin);
      const drawn = { posX: (o.x - (got.owner ? got.owner.ox : 0)) / foot.px, posY: ((got.owner ? got.owner.oy : 0) - o.y) / foot.px };
      const metres = foot.unit === 'mm' ? 0.001 : 1;
      const reported = Math.max(Math.abs(moved.posX - want.posX), Math.abs(moved.posY - want.posY));
      const shown = Math.max(Math.abs(moved.posX - drawn.posX), Math.abs(moved.posY - drawn.posY));
      out.reported = Math.max(out.reported, reported * metres);
      out.drawn = Math.max(out.drawn, shown * metres);
      if (foot.unit === 'mm') out.reportedMm = Math.max(out.reportedMm, reported);
      worst = Math.max(worst, reported * metres);
      out.count++;
    }
    out.perZoom[zoom] = worst;
  }
  return out;
}

/** Measurement 2: the time from mount to the end of the first painted frame, each on a page just loaded: the median of `runs`. */
async function mountTime(browser, name, which, runs = 7, options = {}) {
  const times = []; const warm = []; let drawn = 0;
  for (let i = 0; i < runs; i++) {
    const page = await open(browser, name);
    const r = await page.evaluate(({ which, options }) => window.spike.show(which, options), { which, options });
    times.push(r.ms); drawn = r.drawn;
    if (i > 0) { await page.close(); continue; }
    // And mounted again in a page that has drawn the view before, as a tab shown again is: the median of the same number.
    for (let k = 0; k < runs; k++) warm.push((await page.evaluate(({ which, options }) => { window.spike.forget(which); return window.spike.show(which, options); }, { which, options })).ms);
    await page.close();
  }
  return { median: median(times), min: Math.min(...times), max: Math.max(...times), drawn, warm: median(warm) };
}

/** Measurement 3: one step of a drag of an owner with its 9 parts on the view of 500 footprints, timed inside the page. */
async function dragSteps(page, options = {}, camera, which = 'synthetic') {
  await fresh(page, which, options);
  if (camera) await page.evaluate((camera) => window.spike.setCamera(camera), camera);
  const s = await state(page);
  const foot = await page.evaluate(() => window.T.foot('o22'));
  // The strip along the owner's top edge, above its parts.
  const q = toScreen(s, { x: foot.x + 80, y: foot.y + 6 });
  q.x = Math.round(q.x); q.y = Math.round(q.y);
  const under = await page.evaluate((q) => window.T.under(q.x, q.y), q);
  await page.mouse.move(q.x, q.y);
  await page.mouse.down();
  await page.mouse.move(q.x + 4, q.y + 3);
  await page.mouse.move(q.x + 8, q.y + 6);
  await page.evaluate(() => window.spike.frameEnd());
  await page.evaluate(() => window.spike.measure(true));
  for (let i = 1; i <= 30; i++) {
    await page.mouse.move(q.x + 8 + 3 * i, q.y + 6 + 2 * i);
    await page.evaluate(() => window.spike.stepDone());
  }
  const steps = await page.evaluate(() => { window.spike.measure(false); return window.spike.steps.slice(); });
  const mid = await page.evaluate(() => ({ o: window.T.foot('o22').posX, mounted: document.querySelectorAll('[data-el]').length }));
  await page.mouse.up();
  await frame(page);
  const result = await page.evaluate(() => window.spike.store.results.slice(-1)[0]);
  return { under, steps: steps.length, total: median(steps.map((t) => t.total)), frame: median(steps.map((t) => t.frame)), worst: Math.max(...steps.map((t) => t.total)), moved: result && result.moved.length === 1 && result.moved[0].id === 'o22' && mid.o !== 10, mounted: mid.mounted, zoom: s.cam.zoom };
}

/** Item 2, the other way: the scale bar redrawn for the zoom (?bar=zoom). */
async function barRedrawn(browser, c) {
  const page = await open(browser, c, '?show=none&bar=zoom');
  await fresh(page, 'room');
  const seen = []; let ok = true;
  for (const [zoom, words, n] of [[0.25, '5 m', 5], [0.5, '2 m', 2], [1, '1 m', 1], [2, '0.5 m', 0.5], [4, '0.5 m', 0.5]]) {
    await page.evaluate((camera) => window.spike.setCamera(camera), { x: 310.37 - 160 * zoom, y: 350.61 + 120 * zoom, zoom });
    await frame(page);
    const got = await page.evaluate(() => ({ bar: window.T.svgBox('.geo-bar'), room: window.T.geo('room'), words: document.querySelector('.geo-scale').textContent }));
    if (!(got.words === words && near(got.bar.w / (got.room.w / 8), n, 1e-6) && got.bar.w >= 40 - 1e-6 && got.bar.w <= 100 + 1e-6)) ok = false;
    seen.push(`zoom ${zoom}: "${got.words}", ${fix(got.bar.w, 1)} px`);
  }
  check(c, 2, 'the other way, tried too: a bar redrawn for the zoom stays between 40 and 100 px on the screen and reads what it spans', ok, seen.join('; '));
  await page.close();
}

/** One step of a pan by the wheel, timed inside the page: the median of 30. */
async function panSteps(page, which) {
  await fresh(page, which);
  await page.mouse.move(500, 350);
  await page.mouse.wheel(3, 2);
  await page.evaluate(() => window.spike.frameEnd());
  await page.evaluate(() => window.spike.measure(true));
  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel(i % 2 ? -7 : 9, i % 2 ? -5 : 6);
    await page.evaluate(() => window.spike.stepDone());
  }
  const steps = await page.evaluate(() => { window.spike.measure(false); return window.spike.steps.slice(); });
  return { total: median(steps.map((t) => t.total)), frame: median(steps.map((t) => t.frame)), worst: Math.max(...steps.map((t) => t.total)), mounted: await page.evaluate(() => document.querySelectorAll('[data-el]').length), zoom: (await state(page)).cam.zoom };
}

// ---- Candidate A only: the ways it was tried to break, each with the setting that breaks it and the one that does not.

async function onlyA(browser, helper) {
  // A node whose own element takes the pointer, as every node of the page does today; and nodes with no zIndex.
  let page = await open(browser, 'a', '?show=none&pass=0');
  await fresh(page, 'room');
  const corner = await click(page, view(2.2 + 0.8, 4.3 + 0.8));
  check('a', 3, 'DEFECT if a footprint\'s node takes the pointer itself (no `style` that passes it on): a click in the corner of a circle\'s bounding square, outside the circle, is what lies under it (the room)', corner.hit && corner.hit.id === 'room', corner.hit ? `it counts as ${corner.hit.id}` : 'no hit');
  await page.close();
  page = await open(browser, 'a', '?show=none&z=none');
  await fresh(page, 'room');
  const over = await click(page, view(6.75, 0.75));
  check('a', 3, 'DEFECT if the nodes carry no zIndex: a footprint drawn later lies on top of another one\'s part (the rug over the cabinet)', over.hit && over.hit.id === 'rug', over.hit ? `a click on the rug where it lies over the cabinet hits ${over.hit.id}: React Flow puts what a footprint holds above every footprint that is not held` : 'no hit');
  await page.close();
  // 1. A snap grid on the plane.
  page = await open(browser, 'a', '?show=none&snap=10');
  const snapped = await drops(page, 'a', { zooms: [1], count: 10 });
  numbers.a.snapGridDropError = snapped.reported;
  check('a', 5, 'DEFECT if the plane had a snap grid (snapToGrid with a grid of 10 px, which the page does not set): a drop is reported within half the rounding step of where the pointer let go', snapped.reported <= 0.0005 + 1e-9, `the reported position is up to ${fix(snapped.reported, 4)} m from the drop; without a grid, ${fix(numbers.a.drop.reported, 5)} m`);
  await page.close();
  // 2. onlyRenderVisibleElements, which the page sets for a view of more than 300 nodes: React Flow then mounts a node
  //    only while its rectangle is in sight. With the node the outline's rectangle alone (?box=foot), a footprint just
  //    off the plane's edge takes its words with it, which would be in sight. As built, the node covers the words.
  for (const query of ['?show=none&box=foot', '?show=none']) {
    page = await open(browser, 'a', query);
    await fresh(page, 'room', { cull: true });
    // The drum's circle ends 3 px above the plane's top edge; its two lines of words are inside the plane.
    await page.evaluate(() => window.spike.setCamera({ x: 200, y: -21, zoom: 1 }));
    await frame(page);
    const seen = await page.evaluate(() => { const w = document.querySelector('[data-el="drum"] .uname'); const r = w && w.getBoundingClientRect(); return { drawn: !!w, top: r ? r.y : null, mounted: document.querySelectorAll('[data-el]').length }; });
    if (query.includes('box=foot')) check('a', 1, 'DEFECT if a footprint\'s node is its outline\'s rectangle alone, with onlyRenderVisibleElements on (the page\'s setting above 300 nodes): the words of a footprint just outside the plane\'s edge stay drawn', seen.drawn, seen.drawn ? 'drawn' : 'the footprint\'s node is not mounted, so its words, 4 to 34 px inside the plane, are not drawn');
    else check('a', 1, 'with onlyRenderVisibleElements on (the page\'s setting above 300 nodes), a footprint whose outline is just outside the plane\'s edge keeps its words, which are in sight: its node is the rectangle around all it draws', seen.drawn && seen.top > 0, `words drawn ${fix(seen.top, 1)} px inside the top edge; ${seen.mounted} of 12 footprints mounted`);
    await page.close();
  }
  page = await open(browser, 'a');
  // 3. elevateNodesOnSelect, React Flow's default, which the page's plane does not turn off.
  await fresh(page, 'room', { elevate: true });
  await page.evaluate(() => { window.spike.store.onHit = null; window.spike.store.select(['room']); });
  await frame(page);
  const r = await click(page, view(6.2, 0.5));
  numbers.a.elevateHidesRug = !(r.hit && r.hit.id === 'rug');
  check('a', 4, 'DEFECT with elevateNodesOnSelect on (React Flow\'s default, the page\'s setting today): the rug stays on top of the selected room', r.hit && r.hit.id === 'rug', r.hit ? `a click on the rug hits ${r.hit.id}: the selected room is raised over the rug, which is no longer seen` : 'no hit');
  await page.close();
  // The other way round it: the picks kept in the nodes' data, so that React Flow's own `selected` is never set.
  page = await open(browser, 'a', '?show=none&pick=data');
  await fresh(page, 'room', { elevate: true });
  await page.evaluate(() => { window.spike.store.onHit = null; window.spike.store.select(['room', 'room.pillar']); });
  await frame(page);
  const kept = await click(page, view(6.2, 0.5));
  const shown = await page.evaluate(() => ({ picked: window.T.picked(), own: document.querySelectorAll('.react-flow__node.selected').length }));
  check('a', 4, 'with elevateNodesOnSelect left on, the picks kept in the nodes\' data instead of React Flow\'s `selected` show the same and raise nothing', kept.hit && kept.hit.id === 'rug' && shown.picked.join() === 'room,room.pillar' && shown.own === 0, `a click on the rug hits ${kept.hit && kept.hit.id}; shown picked: ${shown.picked.join(', ')}`);
  await page.close();
  // Several footprints picked and one of them dragged: React Flow drags them together, each rounded in its own unit.
  page = await open(browser, 'a');
  await fresh(page, 'room');
  await page.evaluate(() => { window.spike.store.select(['room.desk', 'room.table.vase']); });
  await frame(page);
  await drag(page, view(3.0, 1.8), 37, -20);
  const both = await page.evaluate(() => window.spike.store.results.slice());
  const ids = both.length === 1 ? both[0].moved.map((m) => `${m.id} to ${m.posX}, ${m.posY} ${m.unit}`) : [];
  check('a', 5, 'several picked footprints dragged by one of them move together (the plane\'s own behaviour), each rounded in its own unit; one result', both.length === 1 && both[0].moved.length === 2 && both[0].moved.some((m) => m.id === 'room.table.vase' && m.posX === 300 + 925 && m.posY === 250 + 500) && both[0].moved.some((m) => m.id === 'room.desk' && m.posX === 2.925 && m.posY === 2), ids.join('; '));
  await page.close();
  // 4. A rectangle's outline drawn by CSS on an element, as BoxNode's is, instead of SVG.
  page = await open(browser, 'a', '?show=none&css=1');
  await fresh(page, 'room');
  let worst = 0; const detail = [];
  for (const zoom of [1, 2, 4]) {
    const m = await painted(page, helper, 'room.shelf', zoom, zoom / 2);
    worst = Math.max(worst, Number.isNaN(m.worst) ? 99 : m.worst);
    detail.push(`at ${zoom}: edges off by ${m.errors.join(' ')} px, ${m.width} px wide for ${m.wantWidth}`);
  }
  numbers.a.cssOutlinePx = fix(worst, 2);
  check('a', 2, 'DEFECT if a footprint\'s outline is a CSS box on an element (as BoxNode draws a box) and not SVG: it stays to scale at every zoom', worst < 0.5, `its size is rounded to whole px of the view before the plane's zoom: largest edge error ${fix(worst, 2)} px (${detail.join('; ')})`);
  await page.close();
  // The same rounding for a place: the outline put in its node by left and top instead of a transform.
  page = await open(browser, 'a', '?show=none&place=layout');
  await fresh(page, 'room');
  let off = 0; const places = [];
  for (const zoom of [1, 2, 4]) {
    const m = await painted(page, helper, 'room.table.vase', zoom);
    off = Math.max(off, Number.isNaN(m.worst) ? 99 : m.worst);
    places.push(`at ${zoom}: edges off by ${m.errors.join(' ')} px`);
  }
  check('a', 2, 'DEFECT if a footprint\'s outline is put in its node by CSS left and top and not by a transform: it stays in place at every zoom', off < 0.5, `its place is rounded to whole px of the view before the plane's zoom: the vase's edges are off by up to ${fix(off, 2)} px (${places.join('; ')})`);
  await page.close();
  // 5. The marquee, which the plane has from React Flow: Shift and a drag, begun on the ground and begun on a footprint.
  page = await open(browser, 'a');
  await fresh(page, 'room');
  const s = await state(page);
  const seen = [];
  for (const from of [view(-1, 6.5), view(0.6, 2.9)]) {
    const p = toScreen(s, from); const q = toScreen(s, view(8.4, 0.8));
    const before = await page.evaluate(() => window.spike.store.results.length);
    await page.keyboard.down('Shift');
    await page.mouse.move(Math.round(p.x), Math.round(p.y));
    await page.mouse.down();
    for (let i = 1; i <= 4; i++) await page.mouse.move(Math.round(p.x + ((q.x - p.x) * i) / 4), Math.round(p.y + ((q.y - p.y) * i) / 4));
    const rect = await page.evaluate(() => { const r = document.querySelector('.react-flow__selection'); const b = r && r.getBoundingClientRect(); return b ? { w: b.width, h: b.height } : null; });
    await page.mouse.up();
    await page.keyboard.up('Shift');
    await frame(page);
    const after = await page.evaluate(() => ({ results: window.spike.store.results.length, left: document.querySelectorAll('.react-flow__nodesselection, .react-flow__selection').length }));
    seen.push({ under: await page.evaluate((p) => window.T.under(p.x, p.y), { x: Math.round(p.x), y: Math.round(p.y) }), rect, moved: after.results - before, wantW: Math.abs(Math.round(q.x) - Math.round(p.x)) });
  }
  check('a', 4, 'the plane\'s marquee (Shift and a drag) draws its rectangle over the footprints, begun on the ground or on a footprint, and moves nothing', seen.every((m) => m.rect && near(m.rect.w, m.wantW, 2) && m.moved === 0) && seen[0].under === null && seen[1].under !== null,
    seen.map((m) => `begun on ${m.under || 'the ground'}: rectangle ${m.rect ? fix(m.rect.w, 0) + ' by ' + fix(m.rect.h, 0) : 'none'}, moves ${m.moved}`).join('; '));
  await page.close();
}

// ---- Item 10: frames on a plane.

async function nest(browser) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 760 }, deviceScaleFactor: 1 });
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  await page.goto('file://' + path.join(here, 'nest.html'));
  await page.waitForFunction(() => window.spike && window.spike.setViewport && document.querySelectorAll('[data-el]').length === 24);
  await page.evaluate(HELPERS);
  const info = await page.evaluate(() => ({ origin: window.spike.origin, title: window.spike.TITLE }));
  const read = () => page.evaluate(() => ({ viewport: window.spike.plane.viewport, places: { ...window.spike.plane.places }, frameClicks: window.spike.plane.frameClicks.length, paneClicks: window.spike.plane.paneClicks }));
  // A point of a frame's view on the screen: the plane's camera, the frame's place, the view's origin in the frame.
  const at = (st, f, p) => ({ x: st.viewport.x + (st.places[f].x + info.origin.x + p.x) * st.viewport.zoom, y: st.viewport.y + (st.places[f].y + info.origin.y + p.y) * st.viewport.zoom });
  const back = (st, f, q) => ({ x: (q.x - st.viewport.x) / st.viewport.zoom - st.places[f].x - info.origin.x, y: (q.y - st.viewport.y) / st.viewport.zoom - st.places[f].y - info.origin.y });
  for (const [f, c, store] of [['fb', 'b', 'storeB'], ['fa', 'a', 'storeA']]) {
    for (const zoom of [1, 1.5]) {
      await page.evaluate(({ zoom, f }) => window.spike.setViewport({ x: 30.4, y: f === 'fb' ? (zoom === 1 ? -330.7 : -560.3) : 12.6, zoom }), { zoom, f });
      await frame(page); await frame(page);
      let st = await read();
      const root = `.react-flow__node[data-id="${f}"]`;
      const foot = await page.evaluate((store) => { const f = window.spike[store].layout.byId.get('room.desk'); return { posX: f.posX, posY: f.posY, x: f.x, y: f.y }; }, store);
      // A point of the desk clear of its pin and its lamp.
      const q = at(st, f, { x: foot.x + 40, y: foot.y + 30 }); q.x = Math.round(q.x); q.y = Math.round(q.y);
      await page.evaluate((store) => { window.spike[store].hits.length = 0; window.spike[store].results.length = 0; }, store);
      await page.mouse.click(q.x, q.y);
      await frame(page);
      let got = await page.evaluate((store) => window.spike[store].hits.slice(), store);
      let now = await read();
      const want = back(st, f, q);
      check(c, 10, `in a frame on a plane at zoom ${zoom}: a click on a footprint gives its id and the point in the view's own units, and is no click on the frame`, got.length === 1 && got[0].id === 'room.desk' && near(got[0].at.x, want.x, 0.01) && near(got[0].at.y, want.y, 0.01) && now.frameClicks === st.frameClicks && now.paneClicks === st.paneClicks,
        got[0] ? `${got[0].type} ${got[0].id} at ${fix(got[0].at.x)}, ${fix(got[0].at.y)} (clicked at ${fix(want.x)}, ${fix(want.y)}); frame clicks ${now.frameClicks - st.frameClicks}` : 'no hit');
      const press = q;
      await page.mouse.move(press.x, press.y);
      await page.mouse.down();
      for (let i = 1; i <= 5; i++) await page.mouse.move(press.x + 7 * i, press.y - 5 * i);
      await page.mouse.up();
      await frame(page);
      const res = await page.evaluate((store) => window.spike[store].results.slice(), store);
      now = await read();
      const wantPos = { posX: geoRound(foot.posX + 35 / zoom / SCALE, SCALE), posY: geoRound(foot.posY + 25 / zoom / SCALE, SCALE) };
      const moved = res.length === 1 && res[0].moved[0];
      check(c, 10, `at zoom ${zoom}: a drag of a footprint inside the frame moves the footprint and nothing else (not the frame, not the plane)`, moved && moved.id === 'room.desk' && moved.posX === wantPos.posX && moved.posY === wantPos.posY && now.places[f].x === st.places[f].x && now.places[f].y === st.places[f].y && now.viewport.x === st.viewport.x && now.viewport.y === st.viewport.y,
        `${JSON.stringify(res)} (wanted ${wantPos.posX}, ${wantPos.posY}); frame moved ${fix(now.places[f].x - st.places[f].x)}, ${fix(now.places[f].y - st.places[f].y)}; plane panned ${fix(now.viewport.x - st.viewport.x)}, ${fix(now.viewport.y - st.viewport.y)}`);
      // The frame dragged by its title: everything in it goes with it, and the view's own positions stay.
      st = await read();
      const deskBefore = await page.evaluate(({ f }) => { const all = [...document.querySelectorAll('[data-el="room.desk"] .outline')]; const el = f === 'fb' ? all[all.length - 1] : all[0]; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y }; }, { f });
      const title = await page.evaluate((root) => { const r = document.querySelector(root + ' .frame-title').getBoundingClientRect(); return { x: r.x + 200, y: r.y + r.height / 2 }; }, root);
      await page.evaluate((store) => { window.spike[store].results.length = 0; }, store);
      await page.mouse.move(title.x, title.y);
      await page.mouse.down();
      for (let i = 1; i <= 4; i++) await page.mouse.move(title.x + 6 * i, title.y + 3 * i);
      await page.mouse.up();
      await frame(page); await frame(page);
      now = await read();
      const deskAfter = await page.evaluate(({ f }) => { const all = [...document.querySelectorAll('[data-el="room.desk"] .outline')]; const el = f === 'fb' ? all[all.length - 1] : all[0]; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y }; }, { f });
      const none = await page.evaluate((store) => window.spike[store].results.length, store);
      check(c, 10, `at zoom ${zoom}: the frame dragged by its title takes the view with it, and the view reports no move`, near(now.places[f].x - st.places[f].x, 24 / zoom, 0.01) && near(now.places[f].y - st.places[f].y, 12 / zoom, 0.01) && near(deskAfter.x - deskBefore.x, 24, 0.05) && near(deskAfter.y - deskBefore.y, 12, 0.05) && none === 0,
        `frame moved ${fix(now.places[f].x - st.places[f].x)}, ${fix(now.places[f].y - st.places[f].y)}; the desk moved ${fix(deskAfter.x - deskBefore.x)}, ${fix(deskAfter.y - deskBefore.y)} px on the screen; results ${none}`);
      // The ground inside the frame, and the wheel over the frame.
      st = await read();
      const g = at(st, f, view(9, 5.8)); g.x = Math.round(g.x); g.y = Math.round(g.y);
      await page.evaluate((store) => { window.spike[store].hits.length = 0; }, store);
      await page.mouse.click(g.x, g.y);
      await frame(page);
      got = await page.evaluate((store) => window.spike[store].hits.slice(), store);
      now = await read();
      const groundWant = back(st, f, g);
      if (c === 'b') check(c, 10, `at zoom ${zoom}: a click on the view's ground inside the frame is the body's ground click, not the frame node's`, got.length === 1 && got[0].type === 'ground' && near(got[0].at.x, groundWant.x, 0.01) && now.frameClicks === st.frameClicks, got[0] ? `${got[0].type} at ${fix(got[0].at.x)}, ${fix(got[0].at.y)}; frame clicks ${now.frameClicks - st.frameClicks}` : `no hit; frame clicks ${now.frameClicks - st.frameClicks}`);
      else check(c, 10, `at zoom ${zoom}: a click on the view's ground inside the frame is a click on the frame's node, which the plane turns into the view's ground`, got.length === 0 && now.frameClicks === st.frameClicks + 1, `frame clicks ${now.frameClicks - st.frameClicks}`);
      await page.mouse.move(g.x, g.y);
      await page.mouse.wheel(0, 30);
      await frame(page); await frame(page);
      const wheeled = await read();
      await page.mouse.down();
      for (let i = 1; i <= 4; i++) await page.mouse.move(g.x + 10 * i, g.y + 6 * i);
      await page.mouse.up();
      await frame(page); await frame(page);
      const dragged = await read();
      check(c, 10, `at zoom ${zoom}: the wheel over the frame pans the plane; a drag on the view's ground inside the frame moves neither frame nor footprint`, near(wheeled.viewport.y - now.viewport.y, -30, 0.01) && dragged.places[f].x === wheeled.places[f].x,
        `wheel panned ${fix(wheeled.viewport.y - now.viewport.y)}; the ground drag panned the plane ${fix(dragged.viewport.x - wheeled.viewport.x)}, ${fix(dragged.viewport.y - wheeled.viewport.y)} and moved the frame ${fix(dragged.places[f].x - wheeled.places[f].x)}`);
    }
  }
  check('a', 10, 'the page of frames ran without an error', page.errors.length === 0, page.errors.join(' | '));
  await page.close();
  // The component body in a frame that is dragged from anywhere in it, and in one that is not dragged at all (a drag on
  // its ground pans the plane): a press on a footprint must still be the body's, by React Flow's nodrag and nopan classes.
  for (const mode of ['any', 'fixed']) {
    const other = await browser.newPage({ viewport: { width: 1000, height: 760 }, deviceScaleFactor: 1 });
    await other.goto('file://' + path.join(here, 'nest.html') + '?frame=' + mode);
    await other.waitForFunction(() => window.spike && window.spike.setViewport && document.querySelectorAll('[data-el]').length === 24);
    const look = () => other.evaluate(() => ({ viewport: window.spike.plane.viewport, places: { ...window.spike.plane.places }, frameClicks: window.spike.plane.frameClicks.length, results: window.spike.storeB.results.slice(), hits: window.spike.storeB.hits.slice() }));
    await other.evaluate(() => window.spike.setViewport({ x: 30.4, y: -560.3, zoom: 1.5 }));
    await other.evaluate(() => window.spike.frameEnd());
    await other.evaluate(() => window.spike.frameEnd());
    const st = await look();
    const q = at(st, 'fb', { x: 120, y: -70 }); q.x = Math.round(q.x); q.y = Math.round(q.y);
    await other.mouse.move(q.x, q.y);
    await other.mouse.down();
    for (let i = 1; i <= 5; i++) await other.mouse.move(q.x + 7 * i, q.y - 5 * i);
    await other.mouse.up();
    await other.evaluate(() => window.spike.frameEnd());
    const one = await look();
    const moved = one.results.length === 1 && one.results[0].moved[0];
    const wantPos = { posX: geoRound(2 + 35 / 1.5 / SCALE, SCALE), posY: geoRound(1.5 + 25 / 1.5 / SCALE, SCALE) };
    check('b', 10, `in a frame ${mode === 'any' ? 'that is dragged from anywhere in it' : 'that is not dragged, where a drag on the ground pans the plane'}: a drag on a footprint moves the footprint, not the frame and not the plane`,
      moved && moved.id === 'room.desk' && moved.posX === wantPos.posX && moved.posY === wantPos.posY && one.places.fb.x === st.places.fb.x && one.places.fb.y === st.places.fb.y && one.viewport.x === st.viewport.x && one.viewport.y === st.viewport.y,
      `${JSON.stringify(one.results)}; frame moved ${fix(one.places.fb.x - st.places.fb.x)}, ${fix(one.places.fb.y - st.places.fb.y)}; plane panned ${fix(one.viewport.x - st.viewport.x)}, ${fix(one.viewport.y - st.viewport.y)}`);
    const g = at(one, 'fb', view(9, 5.8)); g.x = Math.round(g.x); g.y = Math.round(g.y);
    await other.evaluate(() => { window.spike.storeB.hits.length = 0; window.spike.storeB.results.length = 0; });
    await other.mouse.move(g.x, g.y);
    await other.mouse.down();
    for (let i = 1; i <= 4; i++) await other.mouse.move(g.x + 9 * i, g.y + 6 * i);
    await other.mouse.up();
    await other.evaluate(() => window.spike.frameEnd());
    await other.evaluate(() => window.spike.frameEnd());
    const two = await look();
    const frameWent = { x: two.places.fb.x - one.places.fb.x, y: two.places.fb.y - one.places.fb.y };
    const planeWent = { x: two.viewport.x - one.viewport.x, y: two.viewport.y - one.viewport.y };
    const right = mode === 'any' ? near(frameWent.x, 36 / 1.5, 0.01) && near(frameWent.y, 24 / 1.5, 0.01) && planeWent.x === 0 : frameWent.x === 0 && near(planeWent.x, 36, 0.01) && near(planeWent.y, 24, 0.01);
    check('b', 10, `and a drag on the body's ground ${mode === 'any' ? 'drags the frame' : 'pans the plane'}, which the body takes for no click and no move`, right && two.hits.length === 0 && two.results.length === 0, `frame moved ${fix(frameWent.x)}, ${fix(frameWent.y)}; plane panned ${fix(planeWent.x)}, ${fix(planeWent.y)}; the body's clicks ${two.hits.length}, moves ${two.results.length}`);
    // After that, a click on a footprint is still told right.
    const q2 = at(two, 'fb', { x: one.results.length ? wantPos.posX * SCALE + 40 : 120, y: one.results.length ? -wantPos.posY * SCALE - 10 : -70 }); q2.x = Math.round(q2.x); q2.y = Math.round(q2.y);
    await other.mouse.click(q2.x, q2.y);
    await other.evaluate(() => window.spike.frameEnd());
    const three = await look();
    check('b', 10, 'and a click on a footprint afterwards is still the body\'s, with the right point', three.hits.length === 1 && three.hits[0].id === 'room.desk' && near(three.hits[0].at.x, back(two, 'fb', q2).x, 0.01) && near(three.hits[0].at.y, back(two, 'fb', q2).y, 0.01) && three.frameClicks === two.frameClicks, JSON.stringify(three.hits));
    await other.close();
  }
}

(async () => {
  const browser = await chromium.launch();
  const helper = await browser.newPage();
  for (const c of ['a', 'b']) {
    const page = await open(browser, c);
    await item1(page, c);
    await item2(page, c, helper);
    await item3(page, c);
    await item4(page, c);
    await item5(page, c);
    await item6(page, c);
    await item7(page, c);
    await item8(page, c);
    await item9(page, c);
    numbers[c].drop = await drops(page, c);
    check(c, 5, 'measurement 4: 60 drops at zooms 0.5, 1 and 2 each report a position within half the rounding step of where the pointer let go', numbers[c].drop.count === 60 && numbers[c].drop.reported <= 0.0005 + 1e-9 && numbers[c].drop.drawn < 1e-5, `${numbers[c].drop.count} drops${numbers[c].drop.missed.length ? ' (missed: ' + numbers[c].drop.missed.join('; ') + ')' : ''}; largest error ${numbers[c].drop.reported.toExponential(2)} m; drawn against reported ${numbers[c].drop.drawn.toExponential(1)} m`);
    numbers[c].steps = await dragSteps(page);
    check(c, 5, 'the drag of an owner with its 9 parts on the view of 500 footprints was a drag of that owner', numbers[c].steps.under === 'o22' && numbers[c].steps.moved && numbers[c].steps.steps === 30, `${numbers[c].steps.steps} steps, pressed on ${numbers[c].steps.under}`);
    numbers[c].stepsNear = await dragSteps(page, {}, { x: -300, y: 760, zoom: 1 });
    numbers[c].pan = await panSteps(page, 'synthetic');
    numbers[c].steps5000 = await dragSteps(page, {}, null, 'synthetic5000');
    numbers[c].pan5000 = await panSteps(page, 'synthetic5000');
    await page.evaluate(() => window.spike.forget('synthetic5000'));
    check(c, 0, 'the page ran without an error', page.errors.length === 0, page.errors.join(' | '));
    // The screenshot: the room at the fit, two footprints picked.
    await fresh(page, 'room');
    await page.evaluate(() => window.spike.store.select(['room.desk', 'room.pillar']));
    await frame(page); await frame(page);
    await page.screenshot({ path: path.join(here, c + '.png') });
    await page.close();
    numbers[c].mountFixture = await mountTime(browser, c, 'fixture');
    numbers[c].mountRoom = await mountTime(browser, c, 'room');
    numbers[c].mount500 = await mountTime(browser, c, 'synthetic');
    numbers[c].mount5000 = await mountTime(browser, c, 'synthetic5000', 3);
    await barRedrawn(browser, c);
  }
  numbers.a.mount500AllMounted = await mountTime(browser, 'a', 'synthetic', 7, { cull: false });
  const pageA = await open(browser, 'a');
  numbers.a.stepsAllMounted = await dragSteps(pageA, { cull: false });
  await pageA.close();
  await onlyA(browser, helper);
  await nest(browser);
  await browser.close();

  let failed = 0; let shown = 0;
  for (const c of ['a', 'b']) {
    console.log(`\n== Candidate ${c.toUpperCase()}: ${c === 'a' ? 'a graph body (React Flow)' : 'a component body (one SVG)'} ==`);
    for (const r of rows.filter((x) => x.c === c).sort((x, y) => x.item - y.item)) {
      const defect = r.name.startsWith('DEFECT');
      if (!r.ok && defect) shown++;
      if (!r.ok && !defect) failed++;
      console.log(`${r.ok ? 'pass' : defect ? 'SHOWN' : 'FAIL'}  ${r.item ? 'item ' + String(r.item).padStart(2) : '       '}  ${r.name}${r.detail ? '\n               ' + r.detail : ''}`);
    }
  }
  console.log('\n== Measurements ==');
  const ms = (m) => `${fix(m.median, 1)} ms (${fix(m.min, 1)} to ${fix(m.max, 1)}; ${m.drawn} footprints mounted); mounted again in the same page ${fix(m.warm, 1)} ms`;
  const step = (s) => `${fix(s.total, 2)} ms from the pointermove to the next frame's end (of which ${fix(s.frame, 2)} ms after the frame's animation callbacks: style, layout, paint; the slowest step ${fix(s.worst, 2)} ms); ${s.mounted} footprints mounted, zoom ${fix(s.zoom, 2)}`;
  for (const c of ['a', 'b']) {
    const n = numbers[c];
    console.log(`\n${c.toUpperCase()}`);
    console.log(`  mount to first painted frame, the fixture (4 footprints), median of 7 page loads: ${ms(n.mountFixture)}`);
    console.log(`  the room (12 footprints): ${ms(n.mountRoom)}`);
    console.log(`  500 footprints (50 owners of 9 parts): ${ms(n.mount500)}`);
    if (n.mount500AllMounted) console.log(`  500 footprints with onlyRenderVisibleElements off: ${ms(n.mount500AllMounted)}`);
    console.log(`  one step of a drag of an owner with its 9 parts, 500 footprints at the fit, median of 30: ${step(n.steps)}`);
    console.log(`  the same at zoom 1: ${step(n.stepsNear)}`);
    if (n.stepsAllMounted) console.log(`  the same at the fit with onlyRenderVisibleElements off: ${step(n.stepsAllMounted)}`);
    console.log(`  one step of a pan by the wheel, 500 footprints at the fit: ${step(n.pan).replace('pointermove', 'wheel')}`);
    console.log(`  beyond the brief, 5,000 footprints (500 owners of 9 parts): mount ${ms(n.mount5000)}`);
    console.log(`    a step of the drag: ${step(n.steps5000)}`);
    console.log(`    a step of a pan: ${step(n.pan5000).replace('pointermove', 'wheel')}`);
    console.log(`  drop error over ${n.drop.count} drops at zooms 0.5, 1, 2: reported against the pointer ${n.drop.reported.toExponential(2)} m (per zoom ${Object.entries(n.drop.perZoom).map(([z, v]) => z + ': ' + v.toExponential(2)).join(', ')}; the part in mm ${fix(n.drop.reportedMm, 3)} mm); drawn against reported ${n.drop.drawn.toExponential(1)} m`);
    console.log(`  painted outline against its place, zooms 1, 2, 4: ${n.paintedPx} px`);
  }
  console.log(`\n  A with a snap grid of 10 px: drop error ${fix(numbers.a.snapGridDropError, 4)} m`);
  console.log(`  A with a CSS-border outline: painted edge error ${numbers.a.cssOutlinePx} px`);
  console.log(`\n${rows.length} checks: ${rows.length - failed - shown} pass, ${failed} fail, and ${shown} are named DEFECT and marked SHOWN: each reproduces, on purpose, what a setting or a way of drawing does that the candidate as built avoids.`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
