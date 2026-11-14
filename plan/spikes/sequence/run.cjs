// Opens each candidate from file:// in Chromium, exercises every item of the brief with real pointer events, and
// prints pass or fail per item, then the measurements. Takes a.png and b.png. Build first: ./build.sh
//
//   node run.cjs            everything
//   node run.cjs items      the items only
//   node run.cjs measure    the measurements only

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const HERE = __dirname;
const only = process.argv[2] || 'all';
const TEAL = 'rgb(23, 107, 97)';
const INK = 'rgb(24, 38, 48)';
const SIZE = { width: 1000, height: 700 };
const url = (name, query = '') => 'file://' + path.join(HERE, name + '.html') + query;
const near = (a, b, by = 1.2) => Math.abs(a - b) <= by;
const median = (list) => { const s = [...list].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const ms = (n) => Math.round(n * 10) / 10;

async function open(browser, name, query = '') {
  const page = await browser.newPage({ viewport: SIZE, deviceScaleFactor: 1 });
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') page.errors.push(m.text().slice(0, 200)); });
  await page.goto(url(name, query));
  if (!query.includes('later')) await page.waitForFunction(() => window.Spike && window.Spike.ready(), null, { timeout: 15000 });
  await frame(page);
  return page;
}

// ---- What the script asks of a page.

const frame = (page, times = 2) => page.evaluate(async (n) => { for (let i = 0; i < n; i++) await window.Spike.frame(); }, times);
const rect = (page, selector) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom, cx: r.left + r.width / 2, cy: r.top + r.height / 2,
    text: el.textContent, color: style.color, dash: style.strokeDasharray, marker: el.getAttribute('marker-end') };
}, selector);
const shape = (page, kind, id) => rect(page, `[data-shape="${kind}"][data-id="${id}"]`);
const label = (page, id) => rect(page, `[data-label="${id}"]`);
const screen = (page, p) => page.evaluate((q) => window.Spike.toScreen(q), p);
const zoomOf = (page) => page.evaluate(() => window.Spike.camera().zoom);
const setCamera = async (page, camera) => { await page.evaluate((c) => window.Spike.setCamera(c), camera); await frame(page, 3); };
const laid = (page) => page.evaluate(() => {
  const d = window.Spike.store.data();
  const pick = (o, keys) => Object.fromEntries(keys.map((k) => [k, o[k]]));
  return {
    bottom: d.bottom, size: d.size, headBottom: d.headBottom, spacing: d.spacing,
    lifelines: d.lifelines.map((l) => pick(l, ['id', 'name', 'x', 'y', 'w', 'h', 'cx'])),
    events: d.events.map((e) => pick(e, ['id', 'name', 'cx', 'cy', 'lifeline', 'pinned'])),
    messages: d.messages.map((m) => pick(m, ['id', 'row', 'y', 'points', 'mid', 'label', 'self'])),
    links: d.links.map((s) => pick(s, ['id', 'points'])),
  };
});
const logs = (page) => page.evaluate(() => {
  const s = window.Spike.store;
  return { hits: s.hits.length, results: s.results.length, hit: s.hits[s.hits.length - 1] || null, result: s.results[s.results.length - 1] || null, camera: window.Spike.camera() };
});

/** Presses at `from`, moves through `moves` one at a time, a frame after each, calling `each(i)`; lets go unless `hold`. */
async function drag(page, from, moves, each, hold = false) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 0; i < moves.length; i++) {
    await page.mouse.move(moves[i].x, moves[i].y);
    await frame(page, 1);
    if (each) await each(i);
  }
  if (!hold) { await page.mouse.up(); await frame(page); }
}
const line = (from, dx, dy, n) => Array.from({ length: n }, (_, i) => ({ x: from.x + dx * (i + 1), y: from.y + dy * (i + 1) }));

/** A list of checks under one item: `ok(name, pass, note)`. */
function checks() {
  const list = [];
  const ok = (name, pass, note = '') => { list.push({ name, pass: !!pass, note }); return !!pass; };
  return { list, ok };
}

// ---- The items. Each takes a page and gives its checks. They read where things should be from the shared layout
// (Spike.store.data(), Spike.toScreen) and where they are from the document.

async function draws(page) {
  const { list, ok } = checks();
  const d = await laid(page);
  const z = await zoomOf(page);
  let heads = true; let lines = true; let dashed = true; let names = true;
  for (const l of d.lifelines) {
    const r = await shape(page, 'head', l.id);
    const p = await screen(page, { x: l.x, y: l.y });
    heads = heads && r && near(r.x, p.x) && near(r.y, p.y) && near(r.w, l.w * z) && near(r.h, l.h * z);
    const n = await label(page, l.id);
    names = names && n && n.text === l.name && n.w > 0 && n.cy > r.y && n.cy < r.b;
    const dl = await shape(page, 'line', l.id);
    const foot = await screen(page, { x: l.cx, y: d.bottom });
    lines = lines && dl && near(dl.cx, foot.x) && near(dl.y, r.b, 1.5) && near(dl.b, foot.y);
    dashed = dashed && dl && dl.dash !== 'none';
  }
  ok('each lifeline has its head box where the layout puts it', heads, `${d.lifelines.length} heads`);
  ok('each head shows its name line', names, d.lifelines.map((l) => l.name).join(', '));
  ok('each lifeline has a dashed line from its head down to the view\'s bottom', lines && dashed);
  let dots = true; let eventNames = true;
  for (const e of d.events) {
    const r = await shape(page, 'event', e.id);
    const p = await screen(page, { x: e.cx, y: e.cy });
    dots = dots && r && near(r.cx, p.x) && near(r.cy, p.y) && near(r.w, 12 * z);
    const n = await label(page, e.id);
    eventNames = eventNames && n && n.text === e.name && n.x >= r.r - 1;
  }
  ok('each event is a dot on its lifeline', dots, `${d.events.length} events`);
  ok('each event has its name beside it', eventNames);
  let rows = true; let labels = true; let arrow = true; let order = true; let lastY = -Infinity;
  for (const m of d.messages) {
    const r = await shape(page, 'message', m.id);
    const xs = m.points.map((q) => q.x);
    const a = await screen(page, { x: Math.min(...xs), y: m.y });
    const b = await screen(page, { x: Math.max(...xs), y: m.y + (m.self ? 20 : 0) });
    rows = rows && r && near(r.x, a.x) && near(r.r, b.x) && near(r.y, a.y) && near(r.b, b.y);
    const n = await label(page, m.id);
    labels = labels && n && n.text === m.label && near(n.cx, (await screen(page, m.mid)).x, 1.5);
    arrow = arrow && r && /seq-message/.test(r.marker || '');
    order = order && r && r.y > lastY;
    lastY = r ? r.y : lastY;
  }
  const head = await page.evaluate(() => { const p = document.querySelector('#seq-message path'); return { fill: getComputedStyle(p).fill, d: p.getAttribute('d') }; });
  ok('each message is an arrow on its own row, in time order', rows && order, d.messages.map((m) => m.id).join(' < '));
  ok('each message has its label', labels);
  ok('a message\'s head is closed and unfilled', arrow && /Z\s*$/.test(head.d) && head.fill === 'rgb(255, 255, 255)', `marker fill ${head.fill}`);
  const self = d.messages.find((m) => m.self);
  const sr = self ? await shape(page, 'message', self.id) : null;
  const out = self ? await screen(page, { x: Math.max(...self.points.map((q) => q.x)), y: self.y }) : null;
  ok('a message back to its own lifeline is a loop', self && sr && self.points.length === 4 && near(sr.h, 20 * z) && near(sr.r, out.x) && near(sr.w, 48 * z), self ? `${self.id}: out ${ms(sr.w / z)}, down ${ms(sr.h / z)}` : 'none in the data');
  let links = d.links.length > 0;
  for (const s of d.links) {
    const r = await shape(page, 'link', s.id);
    const a = await screen(page, { x: Math.min(s.points[0].x, s.points[1].x), y: Math.min(s.points[0].y, s.points[1].y) });
    const b = await screen(page, { x: Math.max(s.points[0].x, s.points[1].x), y: Math.max(s.points[0].y, s.points[1].y) });
    links = links && r && near(r.x, a.x) && near(r.y, a.y) && near(r.r, b.x) && near(r.b, b.y);
  }
  ok('a succession is a line from dot to dot', links, `${d.links.length} successions`);
  return list;
}

async function clicks(page) {
  const { list, ok } = checks();
  await setCamera(page, { x: 90, y: 30, zoom: 0.8 });
  const d = await laid(page);
  const at = async (name, point, type, id, where) => {
    const before = await logs(page);
    const p = await screen(page, point);
    await page.mouse.click(p.x, p.y);
    await frame(page);
    const after = await logs(page);
    const h = after.hit;
    const pass = after.hits === before.hits + 1 && h && h.type === type && h.id === id && near(h.at.x, point.x, 1) && near(h.at.y, point.y, 1)
      && after.results === before.results && (!where || where(h.where));
    ok(name, pass, h ? `${h.type} ${h.id || ''} at ${ms(h.at.x)},${ms(h.at.y)}${where ? ' -> ' + JSON.stringify(h.where) : ''}` : 'no hit');
  };
  const server = d.lifelines.find((l) => l.id === 'Login.server');
  const auth = d.lifelines.find((l) => l.id === 'Login.auth');
  const checked = d.events.find((e) => e.id === 'Login.auth.checked');
  const issued = d.events.find((e) => e.id === 'Login.auth.issued');
  const ok3 = d.messages.find((m) => m.id === 'm-ok');
  await at('a click on a head gives the lifeline and the point', { x: server.cx - 40, y: server.y + 30 }, 'head', 'Login.server');
  await at('a click on an event gives the event and the point', { x: checked.cx, y: checked.cy }, 'event', 'Login.auth.checked');
  await at('a click on a message gives the message and the point', { x: ok3.mid.x + 30, y: ok3.y }, 'message', 'm-ok');
  await at('a click on the ground gives the ground and the point', { x: 480, y: 144 }, 'ground', null);
  const opened = d.events.find((e) => e.id === 'Login.server.opened');
  const audited = d.events.find((e) => e.id === 'Login.server.audited');
  await at('a point on a dashed line resolves to "on lifeline L, between two events"', { x: server.cx, y: (opened.cy + audited.cy) / 2 + 20 }, 'ground', null,
    (w) => w && w.type === 'lifeline' && w.id === 'Login.server' && w.after === 1 && w.between[0] === 'Login.server.opened' && w.between[1] === 'Login.server.audited');
  // Where a succession runs down a lifeline it covers the dashed line: the click is the succession's, and the reader still says where on the lifeline the point is.
  await at('where a succession runs down the lifeline, the click is the succession\'s and the point still resolves', { x: auth.cx, y: (checked.cy + issued.cy) / 2 }, 'link', 's-issued',
    (w) => w && w.type === 'lifeline' && w.id === 'Login.auth' && w.after === 1);
  return list;
}

async function selection(page) {
  const { list, ok } = checks();
  const colors = async () => ({
    server: (await shape(page, 'head', 'Login.server')).color, client: (await shape(page, 'head', 'Login.client')).color,
    sent: (await shape(page, 'event', 'Login.client.loginSent')).color, done: (await shape(page, 'event', 'Login.client.loginDone')).color,
    check: (await shape(page, 'message', 'm-check')).color, okm: (await shape(page, 'message', 'm-ok')).color,
  });
  await page.evaluate(() => window.Spike.store.select(['Login.server', 'Login.client.loginSent', 'm-check']));
  await frame(page);
  const c = await colors();
  ok('a lifeline, an event and a message picked from outside are shown selected, together', c.server === TEAL && c.sent === TEAL && c.check === TEAL, `${c.server} ${c.sent} ${c.check}`);
  ok('what is not picked is not shown selected', c.client === INK && c.done === INK && c.okm === INK);
  await page.evaluate(() => window.Spike.store.select([]));
  await frame(page);
  const n = await colors();
  ok('picking nothing from outside clears it', Object.values(n).every((v) => v === INK));
  return list;
}

async function gestures(page) {
  const { list, ok } = checks();
  await setCamera(page, { x: 90, y: 30, zoom: 0.8 });
  const z = 0.8;

  // (a) A lifeline's head, dragged down and to the right: it moves sideways only.
  {
    const before = await logs(page);
    const h0 = await shape(page, 'head', 'Login.server');
    const c0 = await shape(page, 'head', 'Login.client');
    const from = { x: h0.cx, y: h0.cy };
    let live = true; let early = false; let follow = true;
    await drag(page, from, line(from, 15, 10, 6), async (i) => {
      const h = await shape(page, 'head', 'Login.server');
      live = live && near(h.y, h0.y, 0.6) && near(h.x, h0.x + 15 * (i + 1));
      const dot = await shape(page, 'event', 'Login.server.opened');
      const msg = await shape(page, 'message', 'm-check');
      follow = follow && near(dot.cx, h.cx, 0.6) && near(msg.x, h.cx, 0.6);
      early = early || (await logs(page)).results !== before.results;
    }, true);
    const auth = await shape(page, 'head', 'Login.auth');
    const pushed = await screen(page, { x: 373 + 180 + 24, y: 0 });
    const client = await shape(page, 'head', 'Login.client');
    ok('(a) a head dragged aslant moves sideways only, each step shown', live, `head y stayed ${ms(h0.y)}`);
    ok('(a) its events and messages follow it at each step', follow);
    ok('(a) the others keep the order rule: the next head is pushed clear, the one before stays', near(auth.x, pushed.x) && near(client.x, c0.x, 0.6), `auth at ${ms(auth.x)}, expected ${ms(pushed.x)}`);
    await page.mouse.up();
    await frame(page);
    const after = await logs(page);
    const h1 = await shape(page, 'head', 'Login.server');
    ok('(a) one result at its end, the new x; no result before; no click', !early && after.results === before.results + 1 && after.hits === before.hits
      && after.result.kind === 'lifeline' && after.result.id === 'Login.server' && near(after.result.x, 260 + 90 / z, 1) && near(h1.x, h0.x + 90), JSON.stringify(after.result));
    // Past the next head: the two change places by the order rule.
    const from2 = { x: h1.cx, y: h1.cy };
    await drag(page, from2, line(from2, 44, 0, 5));
    const s2 = await shape(page, 'head', 'Login.server');
    const a2 = await shape(page, 'head', 'Login.auth');
    const authAt = await screen(page, { x: 520, y: 0 });
    const serverAt = await screen(page, { x: 520 + 180 + 24, y: 0 });
    ok('(a) dragged past the next head, the two change places', near(a2.x, authAt.x) && near(s2.x, serverAt.x), `auth ${ms(a2.x)}, server ${ms(s2.x)}`);
  }

  // (b) An event no message ends on, dragged down and aside: it stays on its lifeline.
  {
    const before = await logs(page);
    const d0 = await shape(page, 'event', 'Login.auth.checked');
    const from = { x: d0.cx, y: d0.cy };
    let live = true; let early = false;
    await drag(page, from, line(from, 6, 16, 6), async (i) => {
      const dot = await shape(page, 'event', 'Login.auth.checked');
      const dl = await shape(page, 'line', 'Login.auth');
      live = live && near(dot.cx, dl.cx, 0.6) && near(dot.cy, d0.cy + 16 * (i + 1));
      early = early || (await logs(page)).results !== before.results;
    });
    const after = await logs(page);
    const order = await page.evaluate(() => window.Spike.store.M.eventOrder(window.Spike.store.model, 'Login.auth').map((e) => e.id));
    ok('(b) an event dragged aslant moves up and down its own lifeline only, each step shown', live);
    ok('(b) one result at its end, the new index among its lifeline\'s events; no click', !early && after.results === before.results + 1 && after.hits === before.hits
      && after.result.kind === 'event' && after.result.index === 1 && order.join() === 'Login.auth.issued,Login.auth.checked', JSON.stringify(after.result));
    // An event a message ends on stays on the message's row.
    const p0 = await shape(page, 'event', 'Login.client.loginSent');
    let still = true;
    await drag(page, { x: p0.cx, y: p0.cy }, line({ x: p0.cx, y: p0.cy }, 0, 20, 3), async () => {
      const dot = await shape(page, 'event', 'Login.client.loginSent');
      still = still && near(dot.cx, p0.cx, 0.6) && near(dot.cy, p0.cy, 0.6);
    });
    const pinned = await logs(page);
    ok('(b) an event a message ends on stays on the message\'s row, and the end says so', still && pinned.result.pinned === 'm-login' && pinned.result.words === null, JSON.stringify(pinned.result));
  }

  // (c) A message, dragged down two rows by its line; then another up a row by its label.
  {
    const before = await logs(page);
    const d = await laid(page);
    const r0 = await shape(page, 'message', 'm-check');
    const from = { x: r0.cx, y: r0.y };
    let live = true; let early = false;
    await drag(page, from, line(from, 3, 15, 6), async (i) => {
      const r = await shape(page, 'message', 'm-check');
      live = live && near(r.y, r0.y + 15 * (i + 1)) && near(r.x, r0.x, 0.6);
      early = early || (await logs(page)).results !== before.results;
    }, true);
    const rowY = async (n) => (await screen(page, { x: 0, y: d.headBottom + d.spacing * (n + 1) })).y;
    const okRow = await shape(page, 'message', 'm-ok');
    const session = await shape(page, 'message', 'm-session');
    const opened = await shape(page, 'event', 'Login.server.opened');
    ok('(c) a message dragged by its line follows the pointer up and down only, each step shown', live);
    ok('(c) the other rows make room while it is dragged, and their events go with them',
      near(okRow.y, await rowY(1)) && near(session.y, await rowY(2)) && near(opened.cy, (await rowY(2)) + 20 * z), `m-ok at ${ms(okRow.y)}, row 2 is ${ms(await rowY(1))}`);
    await page.mouse.up();
    await frame(page);
    const after = await logs(page);
    const r1 = await shape(page, 'message', 'm-check');
    ok('(c) one result at its end, the new row; no result before; no click', !early && after.results === before.results + 1 && after.hits === before.hits
      && after.result.kind === 'message' && after.result.id === 'm-check' && after.result.row === 3 && near(r1.y, await rowY(3)), JSON.stringify({ ...after.result, order: undefined }));
    const l0 = await label(page, 'm-ok');
    await drag(page, { x: l0.cx, y: l0.cy }, line({ x: l0.cx, y: l0.cy }, 0, -10, 5));
    const byLabel = await logs(page);
    ok('(c) a message can be dragged by its label too', byLabel.results === after.results + 1 && byLabel.result.id === 'm-ok' && byLabel.result.row === 0 && byLabel.hits === after.hits, JSON.stringify({ ...byLabel.result, order: undefined }));
    const press = await shape(page, 'message', 'm-done');
    await page.mouse.click(press.cx, press.y);
    await frame(page);
    const click = await logs(page);
    ok('(c) a press that does not move is a click, not a drag', click.results === byLabel.results && click.hits === byLabel.hits + 1 && click.hit.id === 'm-done');
  }
  const camera = (await logs(page)).camera;
  ok('no gesture panned or zoomed the plane', near(camera.x, 90, 0.01) && near(camera.y, 30, 0.01) && near(camera.zoom, z, 0.0001), `camera ${ms(camera.x)},${ms(camera.y)},${camera.zoom}`);
  return list;
}

async function marks(page) {
  const { list, ok } = checks();
  await setCamera(page, { x: 90, y: 30, zoom: 0.8 });
  const badge = (id) => rect(page, `[data-badge="${id}"]`);
  const pin = (id) => rect(page, `[data-pin="${id}"]`);
  const head = await shape(page, 'head', 'Login.server');
  const b1 = await badge('Login.server');
  ok('a badge with its count on a lifeline head', b1 && b1.text === '2' && Math.hypot(b1.cx - head.r, b1.cy - head.y) < 12, b1 ? `"${b1.text}" at the head's corner` : 'missing');
  const dot = await shape(page, 'event', 'Login.client.loginSent');
  const b2 = await badge('Login.client.loginSent');
  ok('a badge on an event', b2 && b2.text === '1' && Math.hypot(b2.cx - dot.cx, b2.cy - dot.cy) < 20);
  const row = await shape(page, 'message', 'm-check');
  const b3 = await badge('m-check');
  ok('a badge at a message\'s middle', b3 && b3.text === '3' && near(b3.cx, row.cx, 1.5) && Math.abs(b3.cy - row.y) < 20);
  const p1 = await pin('m-login'); const p2 = await pin('Login.auth'); const p3 = await pin('Login.auth.issued');
  ok('a numbered pin on a message, a head and an event', p1 && p1.text === '1' && p2 && p2.text === '2' && p3 && p3.text === '4');
  const free = await rect(page, '[data-free-pin="3"]');
  const at = await screen(page, { x: 130, y: 220 });
  ok('a free pin floats at a point of the view', free && free.text === '3' && near(free.cx, at.x, 1.5) && near(free.b, at.y, 1.5), free ? `tip at ${ms(free.cx)},${ms(free.b)}, expected ${ms(at.x)},${ms(at.y)}` : 'missing');
  await page.evaluate(() => {
    const m = window.Spike.store.marks();
    window.Spike.store.setMarks({ by: { ...Object.fromEntries(m.by), 'm-ok': { problems: 5, pins: [] } }, free: [...m.free, { no: 9, x: 480, y: 144 }] });
  });
  await frame(page);
  const b4 = await badge('m-ok');
  const free9 = await rect(page, '[data-free-pin="9"]');
  ok('marks that change from outside are drawn', b4 && b4.text === '5' && free9 && free9.text === '9');
  return list;
}

async function labels(page) {
  const { list, ok } = checks();
  const ids = ['Login.server', 'Login.auth.checked', 'm-ok'];
  await setCamera(page, { x: 90, y: 30, zoom: 1 });
  const one = [];
  for (const id of ids) one.push(await label(page, id));
  await setCamera(page, { x: -300, y: -40, zoom: 2 });
  const two = [];
  for (const id of ids) two.push(await label(page, id));
  const d = await laid(page);
  const where = [
    (await screen(page, { x: d.lifelines.find((l) => l.id === ids[0]).cx, y: 0 })).x,
    (await screen(page, { x: d.events.find((e) => e.id === ids[1]).cx + 10, y: 0 })).x,
    (await screen(page, d.messages.find((m) => m.id === ids[2]).mid)).x,
  ];
  ok('the name of a head, an event and a message is an element with a screen rectangle',
    one.every((r) => r && r.w > 4 && r.h > 4) && two.every((r) => r && r.w > 4 && r.h > 4), one.map((r) => r && `${ms(r.w)}x${ms(r.h)}`).join(' '));
  ok('the rectangle follows the zoom (twice the size at twice the zoom)', one.every((r, i) => near(two[i].w / r.w, 2, 0.15) && near(two[i].h / r.h, 2, 0.15)),
    two.map((r, i) => ms(r.w / one[i].w)).join(' '));
  ok('the rectangle is where the name is drawn', near(two[0].cx, where[0], 2) && near(two[1].x, where[1], 2) && near(two[2].cx, where[2], 2));
  // An editor laid over the rectangle: a field at the same place is what is under the pointer there.
  const over = await page.evaluate((id) => {
    const r = document.querySelector(`[data-label="${id}"]`).getBoundingClientRect();
    const field = document.createElement('input');
    field.id = 'editor';
    field.style.cssText = `position:fixed;z-index:99;box-sizing:border-box;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border:0;padding:0`;
    document.body.appendChild(field);
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === field;
    field.remove();
    return hit;
  }, 'm-ok');
  ok('an editor can be laid over it', over);
  return list;
}

async function panZoom(page) {
  const { list, ok } = checks();
  await setCamera(page, { x: 150, y: 40, zoom: 1 });
  const c0 = (await logs(page)).camera;
  const h0 = await shape(page, 'head', 'Login.client');
  await page.mouse.move(500, 620);
  await page.mouse.wheel(30, 50);
  await frame(page, 3);
  const c1 = (await logs(page)).camera;
  const h1 = await shape(page, 'head', 'Login.client');
  ok('the wheel pans', near(c1.x, c0.x - 30, 0.6) && near(c1.y, c0.y - 50, 0.6) && c1.zoom === c0.zoom && near(h1.x, h0.x - 30, 0.6) && near(h1.y, h0.y - 50, 0.6), `camera ${ms(c1.x)},${ms(c1.y)}`);
  const P = { x: 620, y: 300 };
  await page.mouse.move(P.x, P.y);
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, -100);
  await page.keyboard.up('Control');
  await frame(page, 3);
  const c2 = (await logs(page)).camera;
  const under = (c) => ({ x: (P.x - c.x) / c.zoom, y: (P.y - c.y) / c.zoom });
  const h2 = await shape(page, 'head', 'Login.client');
  ok('Ctrl with the wheel zooms about the pointer', c2.zoom > c1.zoom * 1.05 && near(under(c2).x, under(c1).x, 0.6) && near(under(c2).y, under(c1).y, 0.6) && near(h2.w, h1.w * c2.zoom / c1.zoom, 0.6),
    `zoom ${ms(c1.zoom)} -> ${Math.round(c2.zoom * 1000) / 1000}`);
  const from = { x: 500, y: 640 };
  const before = await logs(page);
  await drag(page, from, line(from, 10, 5, 4));
  const c3 = (await logs(page)).camera;
  const h3 = await shape(page, 'head', 'Login.client');
  const afterPan = await logs(page);
  ok('a drag on the ground pans, and is no click', near(c3.x, c2.x + 40, 0.6) && near(c3.y, c2.y + 20, 0.6) && near(h3.x, h2.x + 40, 0.6) && afterPan.hits === before.hits, `camera ${ms(c3.x)},${ms(c3.y)}`);
  await page.evaluate(() => window.Spike.unmount());
  await frame(page);
  const gone = await page.evaluate(() => document.querySelectorAll('[data-shape]').length);
  await page.evaluate(() => window.Spike.mount());
  await page.waitForFunction(() => window.Spike.ready());
  await frame(page, 3);
  const c4 = (await logs(page)).camera;
  const h4 = await shape(page, 'head', 'Login.client');
  ok('the camera is kept outside React: unmounted and mounted again, the view is where it was', gone === 0 && near(c4.x, c3.x, 0.01) && near(c4.y, c3.y, 0.01) && near(c4.zoom, c3.zoom, 0.0001)
    && near(h4.x, h3.x, 0.6) && near(h4.y, h3.y, 0.6) && near(h4.w, h3.w, 0.6), `camera ${ms(c4.x)},${ms(c4.y)},${Math.round(c4.zoom * 1000) / 1000}`);
  return list;
}

async function rectangle(page) {
  const { list, ok } = checks();
  await setCamera(page, { x: 20, y: 20, zoom: 0.7 });
  await page.evaluate(() => { Object.assign(window.Spike.host.style, { left: '130px', top: '90px', width: '640px', height: '420px' }); });
  await frame(page, 4);
  const host = await rect(page, '#host');
  const body = await rect(page, '#host > div');
  ok('the view fills the rectangle its host gives it', near(body.x, host.x, 0.6) && near(body.y, host.y, 0.6) && near(body.w, 640, 0.6) && near(body.h, 420, 0.6), `${ms(body.w)}x${ms(body.h)} at ${ms(body.x)},${ms(body.y)}`);
  const d = await laid(page);
  const l = d.lifelines[1];
  const r = await shape(page, 'head', l.id);
  const p = await screen(page, { x: l.x, y: l.y });
  ok('and draws there', near(r.x, p.x) && near(r.y, p.y) && near(r.x, 130 + 20 + l.x * 0.7));
  const before = await logs(page);
  await page.mouse.click(r.cx, r.cy);
  await frame(page);
  const after = await logs(page);
  ok('a click there still gives the point in the view\'s own units', after.hits === before.hits + 1 && after.hit.id === l.id && near(after.hit.at.x, l.cx, 1) && near(after.hit.at.y, l.y + l.h / 2, 1), after.hit ? `${ms(after.hit.at.x)},${ms(after.hit.at.y)}` : '');
  const size = await page.evaluate(() => window.Spike.store.size());
  const extent = await page.evaluate(() => {
    let x1 = Infinity; let y1 = Infinity; let x2 = -Infinity; let y2 = -Infinity;
    for (const el of document.querySelectorAll('[data-shape]')) {
      const b = el.getBoundingClientRect();
      x1 = Math.min(x1, b.left); y1 = Math.min(y1, b.top); x2 = Math.max(x2, b.right); y2 = Math.max(y2, b.bottom);
    }
    const z = window.Spike.camera().zoom;
    return { width: (x2 - x1) / z, height: (y2 - y1) / z };
  });
  ok('it can say how large its content is', near(size.width, extent.width, 2) && near(size.height, extent.height, 2), `says ${size.width}x${size.height}, drawn ${ms(extent.width)}x${ms(extent.height)}`);
  return list;
}

/** Slice 3: the view inside a frame on a React Flow plane. `frameSelector` is the frame's title. */
async function framed(page) {
  const { list, ok } = checks();
  const push = (prefix, more) => { for (const c of more) list.push({ ...c, name: prefix + c.name }); };
  push('drawn in the frame: ', (await draws(page)).filter((c) => !c.pass || /head box|event is a dot|own row|dot to dot/.test(c.name)));
  push('', await clicks(page));
  await setCamera(page, { x: 90, y: 30, zoom: 0.8 });
  const t0 = await rect(page, '.seq-frame-title');
  push('', await gestures(page));
  const t1 = await rect(page, '.seq-frame-title');
  ok('no gesture inside the frame moved the frame', near(t1.x, t0.x, 0.01) && near(t1.y, t0.y, 0.01));
  // The frame itself: dragged by its title it takes the view with it, and that is no gesture of the view's.
  await setCamera(page, { x: 40, y: 20, zoom: 0.8 });
  const title = await rect(page, '.seq-frame-title');
  const h0 = await shape(page, 'head', 'Login.client');
  const before = await logs(page);
  const from = { x: title.x + 60, y: title.cy };
  await drag(page, from, line(from, 10, 6, 5));
  const h1 = await shape(page, 'head', 'Login.client');
  const m1 = await shape(page, 'message', 'm-login');
  const after = await logs(page);
  const mAt = await screen(page, { x: 0, y: (await laid(page)).messages.find((m) => m.id === 'm-login').y });
  ok('the frame dragged by its title takes the whole view with it', near(h1.x, h0.x + 50) && near(h1.y, h0.y + 30) && near(m1.y, mAt.y) && after.results === before.results, `head moved ${ms(h1.x - h0.x)},${ms(h1.y - h0.y)}`);
  // A press on the ground inside the frame, dragged: said as found.
  const ground = await screen(page, { x: 480, y: 144 });
  const cam0 = after.camera;
  await drag(page, ground, line(ground, 12, 8, 4));
  const cam1 = (await logs(page)).camera;
  const h2 = await shape(page, 'head', 'Login.client');
  const panned = !near(cam1.x, cam0.x, 0.6) || !near(cam1.y, cam0.y, 0.6);
  const moved = !panned && (!near(h2.x, h1.x, 0.6) || !near(h2.y, h1.y, 0.6));
  list.push({ name: 'found: a drag on the ground inside the frame', pass: true, note: panned ? 'pans the plane' : moved ? 'moves the frame' : 'does nothing: neither pans the plane nor moves the frame' });
  await page.mouse.move(ground.x, ground.y);
  await page.mouse.wheel(0, 40);
  await frame(page, 3);
  const cam2 = (await logs(page)).camera;
  ok('the wheel over the frame pans the plane', near(cam2.y, cam1.y - 40, 0.6), `camera y ${ms(cam1.y)} -> ${ms(cam2.y)}`);
  return list;
}

// ---- Tries to break candidate A in ways the items do not cover.

async function culling(browser, query) {
  // The synthetic view, with only what the window shows mounted, scrolled 40 rows down: what is still drawn?
  const page = await open(browser, 'a', `?data=synthetic&camera=20,20,1&cull=1${query}`);
  await page.mouse.move(500, 350);
  for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 280); await frame(page, 2); }
  await frame(page, 3);
  const found = await page.evaluate(() => {
    const d = window.Spike.store.data();
    const c = window.Spike.camera();
    const top = -c.y / c.zoom;
    const bottom = top + window.innerHeight / c.zoom;
    const right = (-c.x + window.innerWidth) / c.zoom;
    const rows = d.messages.filter((m) => m.y > top + 10 && m.y < bottom - 10 && Math.min(...m.points.map((p) => p.x)) < right - 10);
    const lines = d.lifelines.filter((l) => l.cx < right - 10);
    const shown = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; };
    return {
      rows: rows.length, rowsDrawn: rows.filter((m) => document.querySelector(`[data-shape="message"][data-id="${m.id}"]`)).length,
      lines: lines.length, linesDrawn: lines.filter((l) => shown(document.querySelector(`[data-shape="line"][data-id="${l.id}"]`))).length,
      nodes: document.querySelectorAll('.react-flow__node').length, edges: document.querySelectorAll('.react-flow__edge').length,
    };
  });
  const errors = page.errors;
  await page.close();
  return { ...found, errors };
}

async function severalSelected(browser) {
  // A head dragged while an event of another lifeline is selected too: React Flow drags every selected node.
  const page = await open(browser, 'a');
  await setCamera(page, { x: 90, y: 30, zoom: 0.8 });
  await page.evaluate(() => window.Spike.store.select(['Login.server', 'Login.auth.checked', 'Login.auth']));
  await frame(page);
  const e0 = await shape(page, 'event', 'Login.auth.checked');
  const a0 = await shape(page, 'head', 'Login.auth');
  const h0 = await shape(page, 'head', 'Login.server');
  let stray = false;
  await drag(page, { x: h0.cx, y: h0.cy }, line({ x: h0.cx, y: h0.cy }, -8, 12, 5), async () => {
    const e = await shape(page, 'event', 'Login.auth.checked');
    const a = await shape(page, 'head', 'Login.auth');
    stray = stray || !near(e.cy, e0.cy, 0.6) || !near(a.x, a0.x, 0.6);
  });
  const h1 = await shape(page, 'head', 'Login.server');
  const after = await logs(page);
  await page.close();
  return { pass: !stray && near(h1.x, h0.x - 40) && after.results === 1, note: stray ? 'the other selected things moved too' : 'only the head under the pointer moved; one result' };
}

async function crossing(browser, name, query, select = false) {
  // Where a lifeline's dashed line crosses the label of a message between two other lifelines: which is drawn on top?
  const page = await open(browser, name, '?data=synthetic&camera=20,20,1' + query);
  const found = await page.evaluate(async (pick) => {
    const d = window.Spike.store.data();
    let hit = null;
    for (const m of d.messages) {
      if (m.self || m.label === '') continue;
      const l = d.lifelines.find((x) => x.id !== m.fromLifeline && x.id !== m.toLifeline && Math.abs(x.cx - m.mid.x) < 4);
      if (l) { hit = { m, l }; break; }
    }
    if (!hit) return null;
    window.Spike.setCamera({ x: 500 - hit.l.cx, y: 300 - hit.m.y, zoom: 1 });
    if (pick) window.Spike.store.select([hit.l.id]);
    for (let i = 0; i < 4; i++) await window.Spike.frame();
    const text = document.querySelector(`[data-label="${hit.m.id}"]`);
    const dashed = document.querySelector(`[data-shape="line"][data-id="${hit.l.id}"]`);
    const box = text.getBoundingClientRect();
    // The dashed line made wide, whole and open to the pointer for a moment, so the document can say what lies on top.
    dashed.style.cssText = 'pointer-events: all; stroke-width: 8; stroke-dasharray: none';
    const stack = document.elementsFromPoint(window.Spike.toScreen({ x: hit.l.cx, y: 0 }).x, box.top + box.height / 2);
    dashed.style.cssText = '';
    const a = stack.indexOf(text);
    const b = stack.indexOf(dashed);
    return { message: hit.m.id, lifeline: hit.l.id, top: a < 0 || b < 0 ? `not both under the point (${a}, ${b})` : a < b ? 'the label' : 'the dashed line' };
  }, select);
  await page.close();
  return found;
}

async function connecting(browser) {
  // React Flow's own connecting, from a handle to a handle: can it join an event and a lifeline's dashed line?
  const page = await open(browser, 'a', '?connect=1');
  await setCamera(page, { x: 90, y: 30, zoom: 0.8 });
  const out = [];
  const join = async (name, from, to, source, target) => {
    const before = await page.evaluate(() => ({ connects: window.Spike.store.connects.length, results: window.Spike.store.results.length }));
    const a = await screen(page, from);
    const b = await screen(page, to);
    let line = false;
    await drag(page, a, Array.from({ length: 5 }, (_, i) => ({ x: a.x + (b.x - a.x) * (i + 1) / 5, y: a.y + (b.y - a.y) * (i + 1) / 5 })), async () => {
      line = line || await page.evaluate(() => !!document.querySelector('.react-flow__connection path'));
    });
    const after = await page.evaluate(() => { const s = window.Spike.store; return { connects: s.connects.length, results: s.results.length, last: s.connects[s.connects.length - 1], end: s.connectEnds[s.connectEnds.length - 1] }; });
    const pass = line && after.connects === before.connects + 1 && after.last.source === source && after.last.target === target && after.results === before.results;
    out.push({ name, pass, note: `${line ? 'a line followed the pointer' : 'no line followed the pointer'}; joined ${after.connects > before.connects ? after.last.source + ' -> ' + after.last.target : 'nothing'}; ended ${JSON.stringify(after.end && after.end.where)}` });
  };
  const d = await laid(page);
  const dot = (id) => { const e = d.events.find((x) => x.id === id); return { x: e.cx, y: e.cy }; };
  const on = (id, y) => ({ x: d.lifelines.find((l) => l.id === id).cx, y });
  await join('from an event\'s dot to another lifeline\'s dashed line', dot('Login.auth.checked'), on('Login.server', 400), 'Login.auth.checked', 'Login.server');
  await join('from a lifeline\'s dashed line to an event\'s dot', on('Login.client', 200), dot('Login.auth.issued'), 'Login.client', 'Login.auth.issued');
  await join('from one lifeline\'s dashed line to another\'s', on('Login.client', 420), on('Login.auth', 440), 'Login.client', 'Login.auth');
  const errors = page.errors;
  await page.close();
  return { out, errors };
}

async function longName(browser, name, query = '') {
  // A name too long for its head: is it cut at the head's edge, or does it spill over the ground beside it?
  const page = await open(browser, name, '?long=1' + query);
  const head = await shape(page, 'head', 'Login.auth');
  const text = await label(page, 'Login.auth');
  const clip = { x: Math.round(head.r + 3), y: Math.floor(text.y), width: 30, height: Math.ceil(text.h) };
  const withName = await page.screenshot({ clip });
  await page.evaluate(() => { document.querySelector('[data-label="Login.auth"]').style.visibility = 'hidden'; });
  await frame(page);
  const without = await page.screenshot({ clip });
  const ellipsis = await page.evaluate(() => getComputedStyle(document.querySelector('[data-label="Login.auth"]').parentElement).textOverflow === 'ellipsis');
  await page.close();
  return { spills: !withName.equals(without), ellipsis, wide: ms(text.w), head: ms(head.w) };
}

// ---- The measurements.

async function mountTimes(browser, name, query, runs = 5) {
  const times = [];
  for (let i = 0; i < runs; i++) {
    const page = await open(browser, name, query + (query ? '&' : '?') + 'later=1');
    times.push(await page.evaluate(() => window.Spike.mountTimed()));
    await page.close();
  }
  return times;
}

async function stepTimes(browser, name, cullQuery = '') {
  const page = await open(browser, name, '?data=synthetic&camera=20,20,1' + cullQuery);
  const counts = await page.evaluate(() => ({ dom: document.querySelectorAll('#host *').length, layouts: null }));
  const timed = async (from, dx, dy) => {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x + dx, from.y + dy);   // the step that turns the press into a drag is not counted
    await frame(page, 2);
    await page.evaluate(() => window.Spike.timeMoves(true));
    for (let i = 2; i <= 31; i++) {
      await page.mouse.move(from.x + dx * i, from.y + dy * i);
      await page.evaluate((n) => new Promise((done) => { const look = () => (window.Spike.moves.length >= n ? done() : setTimeout(look, 1)); look(); }), i - 1);
    }
    const moves = await page.evaluate(() => { window.Spike.timeMoves(false); return window.Spike.moves; });
    await page.mouse.up();
    await frame(page, 2);
    return { steps: moves.length, total: ms(median(moves.map((m) => m.total))), script: ms(median(moves.map((m) => m.script))), rest: ms(median(moves.map((m) => m.rest))) };
  };
  // A message whose line crosses the window's middle, on the fourth row or below.
  const row = await page.evaluate(() => {
    const d = window.Spike.store.data();
    const m = d.messages.find((x) => !x.self && x.row >= 3 && Math.min(...x.points.map((p) => p.x)) < 400 && Math.max(...x.points.map((p) => p.x)) > 560);
    return { id: m.id, at: window.Spike.toScreen({ x: 480, y: m.y }) };
  });
  const results0 = (await logs(page)).results;
  const message = await timed(row.at, 0, 8);
  // The second lifeline, dragged to the right: from its third step on it pushes the eighteen to its right, so the
  // whole view is laid out and drawn again at each step. Then the last lifeline, which pushes none.
  const head = await shape(page, 'head', 'L1');
  const lifeline = await timed({ x: head.cx, y: head.cy }, 8, 0);
  await setCamera(page, { x: -3400, y: 20, zoom: 1 });
  const last = await shape(page, 'head', 'L19');
  const alone = await timed({ x: last.cx, y: last.cy }, 4, 0);
  await setCamera(page, { x: 20, y: 20, zoom: 1 });
  const ends = (await logs(page)).results - results0;
  const pan = await timed({ x: 500, y: 660 }, -6, -8);
  const layouts = await page.evaluate(() => { const l = window.Spike.store.layouts; const s = [...l].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; });
  await page.close();
  return { dom: counts.dom, message, lifeline, alone, pan, layout: ms(layouts), ends };
}

function linesOf(files) {
  let all = 0; let code = 0;
  for (const file of files) {
    const text = fs.readFileSync(path.join(HERE, file), 'utf8').split('\n');
    all += text.length - 1;
    let block = false;
    for (const raw of text) {
      const t = raw.trim();
      if (block) { if (t.includes('*/')) block = false; continue; }
      if (t.startsWith('/*')) { if (!t.includes('*/')) block = true; continue; }
      if (t === '' || t.startsWith('//') || t.startsWith('{/*')) continue;
      code++;
    }
  }
  return { all, code };
}

// ---- The run.

const CANDIDATES = [
  { key: 'a', title: 'Candidate A: a graph body (React Flow), a message an edge', page: 'a', query: '', shot: 'a.png', frame: ['a', '?frame=1', 'a.html?frame=1: its nodes children of a frame node'] },
  { key: 'a2', title: 'Candidate A with a message a node (a.html?rows=nodes)', page: 'a', query: '?rows=nodes', shot: null, frame: ['a', '?frame=1&rows=nodes', 'a.html?frame=1&rows=nodes'] },
  { key: 'b', title: 'Candidate B: a component body (one SVG component)', page: 'b', query: '', shot: 'b.png', frame: ['c', '', 'c.html: the body inside one React Flow node'] },
];

(async () => {
  const browser = await chromium.launch();
  const report = {};
  const errors = [];
  for (const c of CANDIDATES) report[c.key] = {};
  if (only !== 'measure') {
    const ITEMS = [
      ['1 draws', draws], ['2 clicks', clicks], ['3 selection', selection], ['4 gestures', gestures], ['5 marks', marks],
      ['6 labels', labels], ['7 pan and zoom', panZoom], ['8 rectangle and size', rectangle],
    ];
    for (const c of CANDIDATES) {
      if (c.shot) {
        // The screenshot first, of the page as it opens, with a lifeline, an event and a message picked.
        const shot = await open(browser, c.page, c.query);
        await shot.evaluate(() => window.Spike.store.select(['Login.auth', 'Login.client.loginDone', 'm-ok']));
        await frame(shot);
        await shot.screenshot({ path: path.join(HERE, c.shot) });
        await shot.close();
      }
      for (const [item, run] of ITEMS) {
        const page = await open(browser, c.page, c.query);   // each item on a page of its own, so none inherits another's state
        try { report[c.key][item] = await run(page); } catch (e) { report[c.key][item] = [{ name: 'the item ran', pass: false, note: String(e.message).split('\n')[0] }]; }
        for (const e of page.errors) errors.push(`${c.key}, ${item}: ${e}`);
        await page.close();
      }
      const item = `9 inside a frame on a plane (${c.frame[2]})`;
      const page = await open(browser, c.frame[0], c.frame[1]);
      try { report[c.key][item] = await framed(page); } catch (e) { report[c.key][item] = [{ name: 'the item ran', pass: false, note: String(e.message).split('\n')[0] }]; }
      for (const e of page.errors) errors.push(`${c.key}, 9: ${e}`);
      await page.close();
    }
    for (const c of CANDIDATES) {
      console.log(`\n===== ${c.title} =====`);
      for (const [item, list] of Object.entries(report[c.key])) {
        const failed = list.filter((x) => !x.pass);
        console.log(`\n${failed.length ? 'FAIL' : 'pass'}  ${item}`);
        for (const x of list) console.log(`   ${x.pass ? 'ok  ' : 'FAIL'}  ${x.name}${x.note ? '  [' + x.note + ']' : ''}`);
      }
    }
    console.log('\n===== Summary =====');
    const items = Object.keys(report.a).map((k) => k.replace(/ \(.*$/, ''));
    console.log(['item', ...CANDIDATES.map((c) => c.key.toUpperCase())].join(' | '));
    items.forEach((item, i) => console.log([item, ...CANDIDATES.map((c) => { const list = Object.values(report[c.key])[i]; const bad = list.filter((x) => !x.pass).length; return bad ? `FAIL (${bad} of ${list.length})` : `pass (${list.length})`; })].join(' | ')));
    console.log('\n===== Tries to break candidate A =====');
    const tall = await culling(browser, '');
    const heads = await culling(browser, '&heads=1');
    console.log(`A lifeline's node as tall as the view, only what the window shows mounted, scrolled 2240 px down: ${tall.rowsDrawn} of ${tall.rows} rows in the window drawn, ${tall.linesDrawn} of ${tall.lines} dashed lines (${tall.nodes} nodes, ${tall.edges} edges mounted)`);
    console.log(`A lifeline's node its head alone (?heads=1), the same: ${heads.rowsDrawn} of ${heads.rows} rows in the window drawn, ${heads.linesDrawn} of ${heads.lines} dashed lines (${heads.nodes} nodes, ${heads.edges} edges mounted)`);
    const several = await severalSelected(browser);
    console.log(`A head dragged while its own lifeline, another lifeline and an event of it are selected: ${several.pass ? 'ok' : 'FAIL'}  [${several.note}]`);
    for (const e of [...tall.errors, ...heads.errors]) errors.push('culling: ' + e);
    console.log('\n===== Where a lifeline\'s dashed line crosses the label of a message between two other lifelines, which is on top? =====');
    for (const [name, query, pick, title] of [
      ['a', '&flat=1', false, 'A, edges at React Flow\'s own depth (?flat=1)'], ['a', '', false, 'A'], ['a', '', true, 'A, that lifeline selected'],
      ['a', '&rows=nodes&cull=0', false, 'A with a message a node'], ['a', '&rows=nodes&cull=0', true, 'A with a message a node, that lifeline selected'],
      ['b', '', false, 'B'], ['b', '', true, 'B, that lifeline selected'],
    ]) {
      const c = await crossing(browser, name, query, pick);
      console.log(`${title}: ${c ? `${c.top} (${c.message} over ${c.lifeline})` : 'no such crossing in the data'}`);
    }
    console.log('\n===== What candidate A gets from React Flow: connecting by a drag from a handle (a.html?connect=1) =====');
    const joined = await connecting(browser);
    for (const x of joined.out) console.log(`${x.pass ? 'ok  ' : 'FAIL'}  ${x.name}  [${x.note}]`);
    for (const e of joined.errors) errors.push('connecting: ' + e);
    console.log('\n===== A name too long for its head =====');
    for (const [name, query, title] of [['a', '', 'A'], ['b', '', 'B'], ['b', '&spill=1', 'B without its cut (?spill=1)']]) {
      const long = await longName(browser, name, query);
      console.log(`${title}: the name is ${long.wide} px wide in a head of ${long.head} px: ${long.spills ? 'FAIL, it spills over the ground beside the head' : 'ok, it is cut at the head\'s edge'}${long.ellipsis ? ', with an ellipsis' : ', with no ellipsis'}`);
    }
  }
  if (only !== 'measure') console.log(`\nPage errors and warnings: ${errors.length ? '\n  ' + errors.join('\n  ') : 'none'}`);
  if (only !== 'items') {
    console.log('\n===== Measurements =====');
    const la = linesOf(['a-body.jsx', 'a.css']);
    const lb = linesOf(['b-body.jsx', 'b.css']);
    console.log(`Lines of the drawing-and-input part (all lines / lines of code): A ${la.all} / ${la.code} (a-body.jsx, a.css)   B ${lb.all} / ${lb.code} (b-body.jsx, b.css)`);
    console.log(`Shared by both, not counted: layout.js ${linesOf(['layout.js']).code}, store.js ${linesOf(['store.js']).code}, markers.jsx ${linesOf(['markers.jsx']).code} lines of code`);
    const kb = (f) => Math.round(fs.statSync(path.join(HERE, 'dist', f)).size / 1024);
    console.log(`Bundles, minified: a.js ${kb('a.js')} kB (React, React DOM, React Flow), b.js ${kb('b.js')} kB (React, React DOM)`);
    for (const [name, query, title] of [['a', '', 'A'], ['a', 'rows=nodes&cull=0', 'A with a message a node'], ['b', '', 'B']]) {
      const fixture = await mountTimes(browser, name, query ? '?' + query : '');
      const big = await mountTimes(browser, name, '?data=synthetic&camera=20,20,1' + (query ? '&' + query : ''));
      console.log(`${title}: mount to the first painted frame: fixture ${ms(median(fixture))} ms (${fixture.map(ms).join(', ')}); 20 lifelines and 300 messages ${ms(median(big))} ms (${big.map(ms).join(', ')})`);
    }
    for (const [name, query, title] of [['a', '', 'A'], ['a', '&cull=1', 'A, only what the window shows mounted (?cull=1)'], ['a', '&rows=nodes&cull=0', 'A with a message a node (?rows=nodes)'], ['b', '', 'B']]) {
      const runs = [];
      for (let i = 0; i < 3; i++) runs.push(await stepTimes(browser, name, query));
      const of = (what, key) => ms(median(runs.map((r) => r[what][key])));
      console.log(`${title}: ${runs[0].dom} elements under the host; layout ${ms(median(runs.map((r) => r.layout)))} ms a step; ${runs[0].ends} gestures ended`);
      const words = { message: 'a message-row drag', lifeline: 'a lifeline drag that pushes 18 lifelines', alone: 'a lifeline drag that pushes none', pan: 'a pan by a drag on the ground' };
      for (const what of Object.keys(words)) {
        console.log(`   one step of ${words[what]}: ${of(what, 'total')} ms from the pointermove to the next frame's end `
          + `(${of(what, 'script')} ms before the frame's callbacks: the handlers and React; ${of(what, 'rest')} ms after: style, layout, paint); median of ${runs[0][what].steps} steps, median of 3 runs`);
      }
    }
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
