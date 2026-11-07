# Repo map

Drawn by [aider](https://aider.chat) 0.86.2 with `aider --show-repo-map` on November 7, 2026, over the files git tracks. For each file, aider's tree-sitter parser lists the definitions it would hand a model as context; a bare file name means the file has none it recognizes (configuration, Markdown, CSS, JSON). The `⋮` marks lines left out.

The map is what an AI pair programmer sees of this repository before it opens a file. Read it as a table of contents: the design canvas's scripts and tests in `canvas/` (the page itself, `canvas/index.html`, holds its script inline, which aider doesn't read), and the SysML scripts in `docs/sysml/`. Stronghold's code, which this repository held until November 7, is in the Stronghold repository now; its map from then is in this file's history.

To redraw it after changes, from the repository root (aider needs a model name to start, but drawing the map makes no API call). aider maps the files of the last commit, not staged changes, so commit first:

```sh
COLUMNS=160 aider --show-repo-map --map-tokens 8192 --no-pretty --yes-always \
  --no-check-update --no-analytics --no-show-model-warnings --model gpt-4o
```

```text
If you need to edit any of these files, ask me to *add them to the chat* first.

.gitignore

README.md

canvas/README.md

canvas/canvas.png

canvas/check.sh

canvas/export.mjs:
⋮
│export function loadLib(html = fs.readFileSync(PAGE, 'utf8')) {
│  const blocks = [...html.matchAll(/<script\b[^>]*\bdata-lib\b[^>]*>([\s\S]*?)<\/script>/g)].map((m
│  if (!blocks.length) throw new Error(`No <script data-lib> in ${PAGE}.`);
│  const context = vm.createContext({});
│  blocks.forEach((code, i) => vm.runInContext(code, context, { filename: `lib-${i}.js` }));
│  if (!context.SysMLModel) throw new Error('The library blocks did not define SysMLModel.');
│  return context.SysMLModel;
⋮
│export function readBlock(html, id) {
│  const match = html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</scr
│  if (!match) throw new Error(`No <script id="${id}"> in ${PAGE}.`);
│  return JSON.parse(match[1]);
⋮
│const listOf = (value) => (Array.isArray(value) ? value : []);
│
⋮
│export function readPage(html = fs.readFileSync(PAGE, 'utf8')) {
│  const model = readBlock(html, 'model');
│  const saved = readBlock(html, 'saved-notes');
│  return { model, notes: listOf(saved.notes), archive: listOf(saved.archive) };
⋮
│export function readState(file) {
│  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
│  if (!data || typeof data !== 'object' || !data.model) throw new Error(`${file} has no model.`);
│  return { model: data.model, notes: listOf(data.notes), archive: listOf(data.archive) };
⋮

canvas/index.html

canvas/save-state.mjs:
⋮
│const isNote = (n) => !!n && typeof n === 'object' && typeof n.id === 'string' && /^[A-Za-z0-9_-]{1
⋮
│const tidy = (list, fields) => (Array.isArray(list) ? list : [])
⋮
│const json = (value) => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
│const replaceBetween = (text, start, end, block) => {
│  const a = text.indexOf(start);
│  const b = text.indexOf(end);
│  if (a < 0 || b < a) throw new Error(`No ${start} … ${end} in ${PAGE}.`);
│  return text.slice(0, a + start.length) + block + text.slice(b);
⋮

canvas/test/annotations-archive.test.mjs:
⋮
│async function resolvedNote(page, name, text) {
│  const el = await placeElement(page, 'PartDefinition');
│  await rename(page, el, name);
│  const note = await addNote(page);
│  await page.fill(`#notes-list li[data-note="${note}"] textarea.text`, text);
│  await until(page, ([n, t]) => { const d = window.__store.get('notes/' + n); return Boolean(d) && 
│  await page.evaluate((n) => window.__store.db.doc('notes/' + n).update({ response: 'Done.', resolv
│  await until(page, (n) => document.querySelector(`#notes-list li[data-note="${n}"]`)?.classList.co
│  return note;
⋮
│const archivedInStore = (n) => { const d = window.__store.dump(); return Boolean(d['archive/' + n])
│
⋮

canvas/test/annotations-code.test.mjs:
⋮
│async function addCodeLink(page, el, path) {
│  const before = await page.locator('#code-list li.code-link').count();
│  await page.click('#add-code');
│  await until(page, (count) => document.querySelectorAll('#code-list li.code-link').length > count,
│  const row = page.locator('#code-list li.code-link').last();
│  await row.locator('input.code-path').fill(path);
│  await until(page, ([id, p]) => document.querySelector(`g[data-el="${id}"]`)?.textContent.includes
│  return row;
⋮

canvas/test/annotations-notes-free.test.mjs:
⋮
│async function noteAt(page, point) {
│  const before = await page.$$eval('#notes-list li[data-note]', (items) => items.map((li) => li.get
│  await page.click('.palette button[data-tool="Note"]');
│  await page.mouse.click(point.x, point.y);
│  await until(page, (count) => document.querySelectorAll('#notes-list li[data-note]').length > coun
│  const ids = await page.$$eval('#notes-list li[data-note]', (items) => items.map((li) => li.getAtt
│  const added = ids.filter((id) => !before.includes(id));
│  assert.equal(added.length, 1, `the Note tool added one note, not ${JSON.stringify(added)}`);
│  return added[0];
⋮

canvas/test/behavior-actions.test.mjs:
⋮
│async function addView(page, kind) {
│  const before = await page.locator('#drawing g.frame[data-view]').count();
│  await page.selectOption('#new-view-kind', kind);
│  await page.click('#new-view');
│  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > co
│  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
⋮
│async function fit(page) {
│  await page.click('#zoom-fit');
⋮
│async function clickBox(page, id) {
│  const at = await page.evaluate((elId) => {
│    const g = document.querySelector(`#drawing g[data-el="${elId}"]`);
│    if (!g) return null;
│    const mid = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
│    const points = Array.from(g.querySelectorAll(':scope > text')).map((t) => mid(t.getBoundingClie
│    const outline = g.querySelector(':scope > .outline');
│    if (outline) {
│      const r = outline.getBoundingClientRect();
│      points.push(mid(r));
│      [8, 3].forEach((d) => [[r.left + d, r.top + d], [r.right - d, r.top + d], [r.left + d, r.bott
⋮
│async function placeInside(page, tool, hostId) {
│  await fit(page);
│  const at = await page.evaluate((id) => {
│    const g = document.querySelector(`#drawing g[data-el="${id}"]`);
│    const outline = g && g.querySelector(':scope > .outline');
│    if (!outline) return null;
│    const box = outline.getBoundingClientRect();
│    let bottom = box.top + 20;
│    g.querySelectorAll(':scope > g[data-el] > .outline').forEach((o) => {
│      const r = o.getBoundingClientRect();
⋮
│async function drawEdge(page, tool, sourceId, targetId) {
│  const before = await relationshipIds(page);
│  await page.click(`.palette button[data-tool="${tool}"]`);
│  await clickBox(page, sourceId);
│  await clickBox(page, targetId);
│  await until(page, (count) => document.querySelectorAll('g[data-rel]').length > count, before.leng
│  const added = (await relationshipIds(page)).filter((id) => !before.includes(id));
│  assert.equal(added.length, 1, `drawing a ${tool} added one edge, not ${JSON.stringify(added)}`);
│  return added[0];
⋮
│async function refuseEdge(page, tool, sourceId, targetId) {
│  const before = await relationshipIds(page);
│  await page.click(`.palette button[data-tool="${tool}"]`);
│  await clickBox(page, sourceId);
│  await clickBox(page, targetId);
│  const status = await page.textContent('#status');
│  assert.deepEqual(await relationshipIds(page), before, 'no edge was drawn');
│  await page.keyboard.press('Escape');
│  return status;
⋮
│async function exported(page) {
│  const text = await exportText(page);
│  await page.click('#close-export');
│  return text;
⋮

canvas/test/behavior-states.test.mjs:
⋮
│async function addView(page, kind) {
│  const before = await page.locator('#drawing g.frame[data-view]').count();
│  await page.selectOption('#new-view-kind', kind);
│  await page.click('#new-view');
│  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > co
│  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
⋮
│async function fit(page) {
│  await page.click('#zoom-fit');
⋮
│async function clickBox(page, id) {
│  const at = await page.evaluate((elId) => {
│    const g = document.querySelector(`#drawing g[data-el="${elId}"]`);
│    if (!g) return null;
│    const mid = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
│    const points = Array.from(g.querySelectorAll(':scope > text')).map((t) => mid(t.getBoundingClie
│    const outline = g.querySelector(':scope > .outline');
│    if (outline) {
│      const r = outline.getBoundingClientRect();
│      points.push(mid(r));
│      [8, 3].forEach((d) => [[r.left + d, r.top + d], [r.right - d, r.top + d], [r.left + d, r.bott
⋮
│async function placeInside(page, tool, hostId) {
│  await fit(page);
│  const at = await page.evaluate((id) => {
│    const g = document.querySelector(`#drawing g[data-el="${id}"]`);
│    const outline = g && g.querySelector(':scope > .outline');
│    if (!outline) return null;
│    const box = outline.getBoundingClientRect();
│    let bottom = box.top + 20;
│    g.querySelectorAll(':scope > g[data-el] > .outline').forEach((o) => {
│      const r = o.getBoundingClientRect();
⋮
│async function drawEdge(page, tool, sourceId, targetId) {
│  const before = await relationshipIds(page);
│  await page.click(`.palette button[data-tool="${tool}"]`);
│  await clickBox(page, sourceId);
│  await clickBox(page, targetId);
│  await until(page, (count) => document.querySelectorAll('g[data-rel]').length > count, before.leng
│  const added = (await relationshipIds(page)).filter((id) => !before.includes(id));
│  assert.equal(added.length, 1, `drawing a ${tool} added one edge, not ${JSON.stringify(added)}`);
│  return added[0];
⋮
│async function refuseEdge(page, tool, sourceId, targetId) {
│  const before = await relationshipIds(page);
│  await page.click(`.palette button[data-tool="${tool}"]`);
│  await clickBox(page, sourceId);
│  await clickBox(page, targetId);
│  const status = await page.textContent('#status');
│  assert.deepEqual(await relationshipIds(page), before, 'no edge was drawn');
│  await page.keyboard.press('Escape');
│  return status;
⋮
│async function exported(page) {
│  const text = await exportText(page);
│  await page.click('#close-export');
│  return text;
⋮

canvas/test/browser.test.mjs:
⋮
│async function addView(page, kind) {
│  const before = await page.locator('#drawing g.frame[data-view]').count();
│  await page.selectOption('#new-view-kind', kind);
│  await page.click('#new-view');
│  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > co
│  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
⋮
│const rowIds = (page, id) => page.$$eval(`#drawing g.frame[data-view="${id}"] g.el[data-el]`, (grou
│/** The ids of the relationship rows (g.rel[data-rel]) drawn in the frame of view `id`, top to bott
│const relRowIds = (page, id) => page.$$eval(`#drawing g.frame[data-view="${id}"] g.rel[data-rel]`, 
│
⋮

canvas/test/camera.test.mjs

canvas/test/checks.test.mjs

canvas/test/drawing.test.mjs:
⋮
│describe('drawing', () => {
│  let browser;
│  before(async () => { browser = await launch(); });
│  after(() => browser?.close());
│
│  test('placing a part definition draws it selected and shows it in the inspector', async () => {
│    const ctx = await openCanvas(browser);
│    const { page } = ctx;
│    const id = await placeElement(page, 'PartDefinition');
│    assert.equal(await page.getAttribute(`g[data-el="${id}"]`, 'data-kind'), 'PartDefinition');
⋮
│  test('a part dragged a little down inside its part definition stays inside it, which is drawn to 
│    const ctx = await openCanvas(browser);
│    const { page } = ctx;
│    const def = await placeElement(page, 'PartDefinition');
│    const box = await page.locator(`g[data-el="${def}"] > rect.outline`).boundingBox();
│    const part = await placeElement(page, 'PartUsage', { x: box.x + box.width / 2, y: box.y + box.h
│    assert.equal(await page.locator(`g[data-el="${def}"] g[data-el="${part}"]`).count(), 1, 'the pa
│    // Dragged by its header 40 drawing units down: still inside the definition as it was drawn hol
│    const k = (await zoomLevel(page)) / 100;
│    const r = await page.locator(`g[data-el="${part}"] > rect.outline`).boundingBox();
⋮
│    const rect = (id) => page.$eval(`g[data-el="${id}"] > rect.outline`, (e) => ({ y: +e.getAttribu
⋮

canvas/test/export.test.mjs

canvas/test/fake-claude.mjs:
⋮
│export function installFakeClaude(seed) {
│  const docs = new Map(); // path -> frozen body
│  const snaps = new Map(); // path -> the snapshot handed out for the body now stored, so an unchan
│  const listeners = new Set();
│  const log = [];
│  let minted = 0;
│
│  const metadata = Object.freeze({ fromCache: false, hasPendingWrites: false });
│  const clone = (value) => JSON.parse(JSON.stringify(value));
│  const freeze = (value) => {
│    if (value && typeof value === 'object') Object.values(value).forEach(freeze), Object.freeze(val
│    return value;
│  };
│  const isBody = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
│  const later = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 0));
│  const refuse = (code, message) => Promise.reject({ code, message });
│
⋮
│  function checkPath(path, odd, what) {
│    if (typeof path !== 'string') throw new TypeError(`${what} path must be a string`);
│    const parts = path.split('/');
│    if (parts.some((s) => !SEGMENT.test(s) || s === '.' || s === '..')) throw new TypeError(`${what
│    if (parts.length % 2 !== (odd ? 1 : 0)) throw new TypeError(`${what} path "${path}" has ${parts
│    return parts;
│  }
│  const parent = (path) => path.slice(0, path.lastIndexOf('/'));
│
│  function snapshot(path) {
│    if (!snaps.has(path)) {
│      const body = docs.get(path);
│      snaps.set(path, Object.freeze({ id: path.slice(path.lastIndexOf('/') + 1), exists: body !== u
│    }
│    return snaps.get(path);
⋮
│  function passes(body, { field, op, value }) {
│    const v = body[field];
│    switch (op) {
│      case '==': return JSON.stringify(v) === JSON.stringify(value);
│      case '!=': return v !== undefined && JSON.stringify(v) !== JSON.stringify(value);
│      case '<': return v !== undefined && v < value;
│      case '<=': return v !== undefined && v <= value;
│      case '>': return v !== undefined && v > value;
│      case '>=': return v !== undefined && v >= value;
│      case 'in': return Array.isArray(value) && value.includes(v);
⋮
│  const compare = (a, b) => (a === b ? 0 : a === undefined ? 1 : b === undefined ? -1 : a < b ? -1 
│
⋮
│  function run(query) {
│    const rows = [...docs.keys()]
│      .filter((path) => parent(path) === query.path && query.filters.every((filter) => passes(docs.
│      .sort((a, b) => {
│        const byField = query.order ? compare(docs.get(a)[query.order.field], docs.get(b)[query.ord
│        if (byField) return query.order.dir === 'desc' ? -byField : byField;
│        return a < b ? -1 : 1;
│      });
│    return (query.limit ? rows.slice(0, query.limit) : rows).map(snapshot);
⋮
│  function querySnapshot(query, previous) {
│    const now = run(query);
│    const docChanges = () => {
│      const changes = [];
│      now.forEach((doc, newIndex) => {
│        const oldIndex = previous.findIndex((old) => old.id === doc.id);
│        if (oldIndex < 0) changes.push({ type: 'added', doc, oldIndex: -1, newIndex });
│        else if (previous[oldIndex] !== doc) changes.push({ type: 'modified', doc, oldIndex, newInd
│      });
│      previous.forEach((old, oldIndex) => {
│        if (!now.some((doc) => doc.id === old.id)) changes.push({ type: 'removed', doc: old, oldInd
│      });
⋮
│  function deliver(listener) {
│    setTimeout(() => {
│      if (!listeners.has(listener)) return;
│      if (listener.path !== undefined) return listener.next(snapshot(listener.path));
│      const snap = querySnapshot(listener.query, listener.last);
│      listener.last = snap.docs;
│      listener.next(snap);
│    }, 0);
│  }
│  function changed(path) {
│    snaps.delete(path);
│    for (const listener of listeners) {
│      if (listener.path === path || (listener.query && listener.query.path === parent(path))) deliv
│    }
│  }
│  function subscribe(listener) {
│    listeners.add(listener);
│    deliver(listener);
│    return () => listeners.delete(listener);
│  }
│  function write(path, body) {
│    docs.set(path, freeze(clone(body)));
│    changed(path);
│  }
│  function merge(into, from) {
│    for (const [key, value] of Object.entries(from)) into[key] = isBody(value) && isBody(into[key])
│    return into;
⋮
│  function doc(path) {
│    const parts = checkPath(path, false, 'document');
│    const ref = {
│      id: parts[parts.length - 1],
│      path,
│      get() { log.push({ op: 'get', path }); return later(snapshot(path)); },
│      set(data) {
│        log.push({ op: 'set', path });
│        if (!isBody(data)) return refuse('invalid_argument', 'a document body must be a plain objec
│        write(path, data);
│        return later(undefined);
│      },
│      update(data) {
│        log.push({ op: 'update', path });
│        if (!isBody(data)) return refuse('invalid_argument', 'an update must be a plain object');
│        if (!docs.has(path)) return refuse('invalid_argument', `update of a document that does not 
│        write(path, merge(clone(docs.get(path)), clone(data)));
│        return later(undefined);
│      },
│      delete() {
│        log.push({ op: 'delete', path });
│        docs.delete(path);
│        changed(path);
│        return later(undefined);
│      },
│      acquire({ holder, ttlMs, data } = {}) {
│        log.push({ op: 'acquire', path });
│        if (data) write(path, merge(clone(docs.get(path) || {}), clone(data)));
│        const ttl = Math.min(600000, Math.max(1000, ttlMs || 30000));
│        return later({ acquired: true, version: 1, expiresAt: new Date(Date.now() + ttl).toISOStrin
│      },
│      onSnapshot(next) { log.push({ op: 'onSnapshot', path }); return subscribe({ path, next }); },
│      collection(sub) { return collection(`${path}/${sub}`); },
⋮
│  function query(spec) {
│    return {
│      where: (field, op, value) => query({ ...spec, filters: [...spec.filters, { field, op, value }
│      orderBy: (field, dir = 'asc') => query({ ...spec, order: { field, dir } }),
│      limit: (n) => query({ ...spec, limit: n }),
│      get() { log.push({ op: 'get', path: spec.path }); return later(querySnapshot(spec, [])); },
│      onSnapshot(next) { log.push({ op: 'onSnapshot', path: spec.path }); return subscribe({ query:
│    };
│  }
│  function collection(path) {
│    checkPath(path, true, 'collection');
│    return Object.assign(query({ path, filters: [], order: null, limit: 0 }), {
│      path,
│      doc: (id) => doc(`${path}/${id ?? `fake${(minted += 1)}`}`),
│      add(data) { const ref = doc(`${path}/fake${(minted += 1)}`); return ref.set(data).then(() => 
│    });
⋮
│  const user = { can: () => later(true), isOwner: () => later(true), canEdit: () => later(true), id
│  window.claude = {
│    use(name) {
│      log.push({ op: 'use', path: name });
│      return later(name === 'db' ? db : name === 'user' ? user : null);
│    },
│  };
│  window.__store = {
│    db,
│    log,
│    get: (path) => (docs.has(path) ? clone(docs.get(path)) : undefined),
│    dump: () => Object.fromEntries([...docs].map(([path, body]) => [path, clone(body)])),
⋮

canvas/test/fixtures/annotations.json

canvas/test/fixtures/behavior-actions.json

canvas/test/fixtures/behavior-states.json

canvas/test/fixtures/browser.json

canvas/test/fixtures/format1.json

canvas/test/fixtures/geometry.json

canvas/test/fixtures/grid.json

canvas/test/fixtures/interconnection.json

canvas/test/fixtures/sequence.json

canvas/test/geometry.test.mjs:
⋮
│async function addView(page, kind) {
│  const before = await page.locator('#drawing g.frame[data-view]').count();
│  await page.selectOption('#new-view-kind', kind);
│  await page.click('#new-view');
│  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > co
│  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
⋮
│async function activate(page, viewId) {
│  await page.locator(`#drawing g.frame[data-view="${viewId}"] rect.tab`).click();
│  await until(page, (id) => document.querySelector(`#drawing g.frame[data-view="${id}"]`)?.classLis
⋮
│async function clickIn(page, viewId, id) {
│  await page.locator(`#drawing g.frame[data-view="${viewId}"] g[data-el="${id}"] .outline`).first()
│  await until(page, ([v, elId]) => document.querySelector(`#drawing g.frame[data-view="${v}"] g[dat
⋮
│function footprint(page, id) {
│  return page.evaluate((elId) => {
│    const g = document.querySelector(`#drawing g.frame.is-active g.footprint[data-el="${elId}"]`);
│    const o = g && g.querySelector('.outline');
│    return g && o ? { width: +o.getAttribute('width'), height: +o.getAttribute('height'), classes: 
│  }, id);
⋮

canvas/test/grid.test.mjs:
⋮
│const rows = (id) => `#drawing g.frame[data-view="${id}"] g.grid-row[data-el]`;
│const heads = (id, col) => `#drawing g.frame[data-view="${id}"] g[data-action="sort"]${col ? `[data
│
│async function addView(page, kind) {
│  const before = await page.locator('#drawing g.frame[data-view]').count();
│  await page.selectOption('#new-view-kind', kind);
│  await page.click('#new-view');
│  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > co
│  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
⋮
│async function showAll(page, id) {
│  await page.click('#grid-show-all');
│  await until(page, ([vid, count]) => document.querySelectorAll(`#drawing g.frame[data-view="${vid}
⋮
│describe('grid view', () => {
│  let browser;
│  before(async () => { browser = await launch(); });
│  after(() => browser?.close());
│
│  test('a new grid view has no rows and no tool of its own, and the panel shows its options', async
│    const ctx = await openCanvas(browser);
│    const { page } = ctx;
│    const id = await addView(page, 'GridView');
│    assert.equal(await page.locator('.palette button[data-tool]:not([data-tool="Note"])').count(), 
⋮
│  test('unticking a column takes it out of the table, and a header sorts the rows', async () => {
│    const ctx = await openCanvas(browser);
│    const { page } = ctx;
│    const id = await addView(page, 'GridView');
│    await showAll(page, id);
│    const pageRow = `#drawing g.frame[data-view="${id}"] g[data-el="Page"]`;
│    assert.equal(await page.locator(heads(id, 'doc')).count(), 1, 'the doc column has a header');
│    assert.match(await page.textContent(pageRow), /SharePoint/, 'the doc column shows the doc');
│    await page.uncheck('#grid-columns .grid-column[value="doc"]');
│    await until(page, (vid) => !document.querySelector(`#drawing g.frame[data-view="${vid}"] g[data
⋮
│    const order = () => page.$$eval(rows(id), (groups) => groups.map((g) => g.getAttribute('data-el
⋮
│  test('matrix mode puts the relationship between two elements in their cell', async () => {
│    const ctx = await openCanvas(browser);
│    const { page } = ctx;
│    const id = await addView(page, 'GridView');
│    await showAll(page, id);
│    await page.selectOption('#grid-mode', 'matrix');
│    await until(page, (vid) => document.querySelectorAll(`#drawing g.frame[data-view="${vid}"] g[da
│    const cell = (row, col) => page.textContent(`#drawing g.frame[data-view="${id}"] g[data-el="${r
│    assert.equal(await cell('ServerHost', 'Host'), ':>', 'ServerHost specializes Host');
│    assert.equal(await cell('Page.hosts', 'Host'), ':', 'hosts is defined by Host');
⋮
│  test('a start or done node, which has no name, goes by its label in the table and in a matrix row
│    const ctx = await openCanvas(browser);
│    const { page } = ctx;
│    await page.setInputFiles('#import-file', ACTIONS);
│    await until(page, () => !!document.querySelector('#drawing g.frame[data-view="v-release"] g[dat
│    const id = await addView(page, 'GridView');
│    await page.click('#grid-show-all');
│    await until(page, (vid) => !!document.querySelector(`#drawing g.frame[data-view="${vid}"] g.gri
│    const cells = (elId) => page.$$eval(`#drawing g.frame[data-view="${id}"] g.grid-row[data-el="${
│    assert.deepEqual(await cells('Release.start'), ['start', 'start', 'Release'], 'the kind and the
⋮

canvas/test/helpers.mjs:
⋮
│export function assertPageExists() {
│  assert.ok(fs.existsSync(PAGE), `No canvas page at ${PAGE}. These tests drive canvas/index.html; b
⋮
│export function launch() {
│  assertPageExists();
│  return chromium.launch();
⋮
│export function pageSource() {
│  assertPageExists();
│  return fs.readFileSync(PAGE, 'utf8');
⋮
│export function embeddedModel(source = pageSource()) {
│  const match = source.match(/<script\b[^>]*\bid=["']model["'][^>]*>([\s\S]*?)<\/script>/);
│  assert.ok(match, 'index.html embeds the saved model in <script type="application/json" id="model"
│  return JSON.parse(match[1]);
⋮
│export function modelLibSource(source = pageSource()) {
│  const match = source.match(/<script\b[^>]*\bid=["']model-lib["'][^>]*>([\s\S]*?)<\/script>/);
│  assert.ok(match, 'index.html holds the model library in <script id="model-lib">');
│  return match[1];
⋮
│export function modelElementIds(model) {
│  const elements = model?.elements;
│  if (Array.isArray(elements)) return elements.map((element) => element.id);
│  return elements ? Object.keys(elements) : [];
⋮
│export async function openCanvas(browser, { shared = false, seed = {} } = {}) {
│  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
│  const errors = [];
│  page.on('pageerror', (error) => errors.push(error.message));
│  page.on('dialog', (dialog) => dialog.accept());
│  if (shared) await page.addInitScript(installFakeClaude, seed);
│  await page.goto(PAGE_URL);
│  await page.waitForSelector('#canvas svg#drawing', { state: 'attached', timeout: WAIT });
│  if (shared) {
│    await until(page, () => window.__store.log.some((entry) =>
⋮
│export async function finish({ page, errors }) {
│  assert.deepEqual(errors, [], 'the page threw no uncaught errors');
│  await page.close();
⋮
│export async function until(page, predicate, arg, what) {
│  try {
│    await page.waitForFunction(predicate, arg, { timeout: WAIT, polling: 50 });
│  } catch (error) {
│    if (error.name !== 'TimeoutError') throw error;
│    const status = await page.textContent('#status').catch(() => '(no #status)');
│    const store = await page.evaluate(() => (window.__store ? JSON.stringify(window.__store.dump(),
│    assert.fail(`Waited ${WAIT} ms for: ${what}.\n#status: ${status}${store ? `\nstore: ${store}` :
│  }
⋮
│export const viewBox = (page) => page.getAttribute('#drawing', 'viewBox');
│export const elementIds = (page) => page.$$eval('g[data-el]', (groups) => groups.map((g) => g.getAt
│export const relationshipIds = (page) => page.$$eval('g[data-rel]', (groups) => groups.map((g) => g
│/** The id (data-el or data-rel) of what carries is-selected, or null. */
│export const selectedId = (page) => page.evaluate(() => {
│  const selected = document.querySelector('.is-selected');
│  return selected ? selected.getAttribute('data-el') ?? selected.getAttribute('data-rel') : null;
⋮
│export async function zoomLevel(page) {
│  const text = await page.textContent('#zoom-level');
│  const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
│  assert.ok(match, `#zoom-level shows a percentage, not "${text}"`);
│  return Number(match[1]);
⋮
│export async function exportText(page) {
│  await page.click('#export');
│  await page.waitForSelector('#export-panel', { state: 'visible', timeout: WAIT });
│  await until(page, () => document.querySelector('#export-text')?.value.trim().length > 0, null, '#
│  return page.inputValue('#export-text');
⋮
│function findEmptyPoint() {
│  const canvas = document.getElementById('canvas');
│  const svg = document.getElementById('drawing');
│  const box = svg.getBoundingClientRect();
│  const RX = 170;
│  const RY = 110;
│  // The panel grows when something is selected, so its whole column counts as taken, not just wher
│  const panel = document.getElementById('panel');
│  const panelLeft = panel && !panel.hidden ? panel.getBoundingClientRect().left : Infinity;
│  const drawn = (x, y) => {
│    if (x >= panelLeft) return true;
│    const hit = document.elementFromPoint(x, y);
│    return !hit || !canvas.contains(hit) || Boolean(hit.closest('[data-el],[data-rel],[data-note],.
⋮
│function findEmptyPointInFrame(id) {
│  const canvas = document.getElementById('canvas');
│  const outline = document.querySelector(`#drawing g.frame[data-view="${id}"] > rect.outline`);
│  if (!outline) return null;
│  const box = outline.getBoundingClientRect();
│  const stage = document.getElementById('drawing').getBoundingClientRect();
│  const RX = 40;
│  const RY = 30;
│  const panel = document.getElementById('panel');
│  const panelLeft = panel && !panel.hidden ? panel.getBoundingClientRect().left : Infinity;
│  const drawn = (x, y) => {
│    if (x >= panelLeft) return true;
│    const hit = document.elementFromPoint(x, y);
│    return !hit || !canvas.contains(hit) || Boolean(hit.closest('[data-el],[data-rel],[data-note],.
⋮
│export async function emptyPointIn(page, viewId) {
│  const point = await page.evaluate(findEmptyPointInFrame, viewId);
│  assert.ok(point, `found an empty spot inside the frame of view ${viewId}`);
│  return point;
⋮
│export async function emptyPoint(page) {
│  for (let attempt = 0; attempt < 6; attempt++) {
│    const point = await page.evaluate(findEmptyPoint);
│    if (point) return point;
│    const canvas = await page.locator('#canvas').boundingBox();
│    await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
│    await page.mouse.wheel(0, 600);
│  }
│  assert.fail('found no empty spot on the plane to click, even after panning down six times');
⋮
│export async function clickElement(page, id) {
│  const group = page.locator(`g[data-el="${id}"]`).first();
│  const box = await group.boundingBox();
│  assert.ok(box, `element ${id} has a bounding box`);
│  await group.click({ position: { x: box.width * 0.35, y: box.height * 0.35 } });
⋮
│export async function placeElement(page, tool, point) {
│  const before = await elementIds(page);
│  await page.click(`.palette button[data-tool="${tool}"]`);
│  const { x, y } = point ?? await emptyPoint(page);
│  await page.mouse.click(x, y);
│  await until(page, (count) => document.querySelectorAll('g[data-el]').length > count, before.lengt
│  const added = (await elementIds(page)).filter((id) => !before.includes(id));
│  assert.equal(added.length, 1, `placing a ${tool} added one element, not ${JSON.stringify(added)}`
│  return added[0];
⋮
│export async function drawRelationship(page, tool, sourceId, targetId) {
│  const before = await relationshipIds(page);
│  await page.click(`.palette button[data-tool="${tool}"]`);
│  await clickElement(page, sourceId);
│  await clickElement(page, targetId);
│  await until(page, (count) => document.querySelectorAll('g[data-rel]').length > count, before.leng
│  await page.keyboard.press('Escape'); // in case the tool stays armed for another edge; the contra
│  const added = (await relationshipIds(page)).filter((id) => !before.includes(id));
│  assert.equal(added.length, 1, `drawing a ${tool} added one edge, not ${JSON.stringify(added)}`);
│  return added[0];
⋮
│export async function rename(page, id, name) {
│  await page.fill('#f-name', name);
│  await until(page, ([elementId, newName]) => document.querySelector(`g[data-el="${elementId}"]`)?.
│    [id, name], `the drawing shows ${id} renamed to "${name}"`);
⋮
│export async function addNote(page) {
│  const before = await page.$$eval('#notes-list li[data-note]', (items) => items.map((li) => li.get
│  await page.click('#add-note');
│  await until(page, (count) => document.querySelectorAll('#notes-list li[data-note]').length > coun
│  const ids = await page.$$eval('#notes-list li[data-note]', (items) => items.map((li) => li.getAtt
│  const added = ids.filter((id) => !before.includes(id));
│  assert.equal(added.length, 1, `adding a note added one li, not ${JSON.stringify(added)}`);
│  return added[0];
⋮
│export const storeDoc = (page, docPath) => page.evaluate((p) => window.__store.get(p), docPath);
│export const storeDump = (page) => page.evaluate(() => window.__store.dump());
│
⋮

canvas/test/index.js

canvas/test/interconnection.test.mjs:
⋮
│async function addView(page, kind) {
│  const before = await page.locator('#drawing g.frame[data-view]').count();
│  await page.selectOption('#new-view-kind', kind);
│  await page.click('#new-view');
│  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > co
│  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
⋮
│async function deleteSavedView(page) {
│  await page.locator(`#drawing g.frame[data-view="${SAVED}"] rect.tab`).click();
│  await until(page, (id) => document.querySelector(`#drawing g.frame[data-view="${id}"]`)?.classLis
│  await page.click('#delete-view');
│  await until(page, () => document.querySelectorAll('#drawing g.frame[data-view]').length === 1, nu
⋮
│async function importState(page, file) {
│  await page.setInputFiles('#import-file', file);
│  await until(page, () => /^Imported /.test(document.querySelector('#status')?.textContent || ''), 
⋮
│async function lookAt(page, id) {
│  const stage = await page.locator('#canvas').boundingBox();
│  const box = await page.locator(`g[data-el="${id}"]`).first().boundingBox();
│  const panel = await page.locator('#panel').boundingBox();
│  const openWidth = panel ? panel.x - stage.x : stage.width;
│  await page.mouse.move(stage.x + 200, stage.y + 200);
│  await page.mouse.wheel(Math.round(box.x + box.width / 2 - (stage.x + openWidth / 2)), Math.round(
│  await until(page, (elId) => {
│    const r = document.querySelector(`g[data-el="${elId}"]`).getBoundingClientRect();
│    return r.top > 80 && r.bottom < innerHeight - 120;
⋮
│async function clickPort(page, id) {
│  await page.locator(`g[data-el="${id}"] > .outline`).first().click();
⋮
│async function drawBetween(page, tool, a, b) {
│  const before = await page.locator('g[data-rel]').count();
│  await page.click(`.palette button[data-tool="${tool}"]`);
│  await clickPort(page, a);
│  await clickPort(page, b);
│  await until(page, (count) => document.querySelectorAll('g[data-rel]').length > count, before, `a 
│  const ids = await page.$$eval('g[data-rel]', (groups) => groups.map((g) => g.getAttribute('data-r
│  const added = ids.filter((id, i) => ids.indexOf(id) === i).slice(-1);
│  assert.equal(await page.locator(`g[data-rel="${added[0]}"]`).count(), 1, `drawing a ${tool} added
│  return added[0];
⋮
│const glyphHeads = (page, id) => page.evaluate((elId) => {
│  const glyph = document.querySelector(`g[data-el="${elId}"] path.glyph`);
│  return glyph ? (glyph.getAttribute('d').match(/M/g) || []).length - 1 : 0;
⋮

canvas/test/loop.test.mjs

canvas/test/model-lib.test.mjs:
⋮
│function loadLib(source) {
│  const sandbox = { console };
│  sandbox.window = sandbox;
│  vm.runInContext(modelLibSource(source), vm.createContext(sandbox), { filename: 'canvas/index.html
│  assert.ok(sandbox.SysMLModel, 'the model-lib script sets window.SysMLModel');
│  return sandbox.SysMLModel;
⋮
│function el(id, kind, name, extra) {
│  const dot = id.lastIndexOf('.');
│  return Object.assign({ id, kind, name }, dot >= 0 ? { owner: id.slice(0, dot) } : {}, extra || {}
│}
│function small(elements, relationships, view) {
│  const layout = {};
│  (view && view.show ? view.show : elements.map((e) => e.id)).forEach((id, i) => { layout[id] = { x
│  return { format: 'stronghold-canvas/2', package: { name: 'P', doc: '' }, elements, relationships:
│    views: [{ id: 'v1', kind: (view && view.kind) || 'GeneralView', name: 'v', layout, options: (vi
│}
│const note = (no, target, text, extra) => Object.assign({ id: 'n' + no, no, target, text, response:
│
│describe('model-lib', () => {
│  test('toSysML turns the embedded saved model into a package, and validate finds nothing wrong wit
│    const source = pageSource();
│    const lib = loadLib(source);
│    assert.equal(typeof lib.toSysML, 'function', 'SysMLModel.toSysML');
│    assert.equal(typeof lib.validate, 'function', 'SysMLModel.validate');
│
│    const model = embeddedModel(source);
│    assert.equal(model.format, 'stronghold-canvas/2', 'the page embeds a format-2 model');
│    const text = lib.toSysML(model, []);
⋮
│  test('a named transition out of an initial node with no entry action is a problem, and so is an u
│    const lib = loadLib(pageSource());
│    const els = [el('S', 'StateDefinition', 'S'), el('S.initial1', 'InitialNode', 'initial1'), el('
│    const transition = (extra) => Object.assign({ id: 't0', kind: 'TransitionUsage', from: 'S.initi
│    const named = lib.normalize(small(els, [transition({ name: 'begin' })], { kind: 'StateTransitio
│    assert.match(lib.validate(named).map((p) => p.id + ': ' + p.message).join('\n'), /^t0: The tran
│    const entry = lib.normalize(small(els.concat([el('S.init', 'ActionUsage', '', { role: 'entry' }
│    assert.match(lib.validate(entry).map((p) => p.message).join('\n'), /The entry action of state d
│    const unnamed = lib.normalize(small(els, [transition()], { kind: 'StateTransitionView' }));
│    assert.equal(lib.validate(unnamed).length, 0);
⋮
│  test('a trigger or an accept payload that names no definition of the model is a problem; a defini
│    const lib = loadLib(pageSource());
│    const els = [el('Go', 'PartDefinition', 'Go'), el('S', 'StateDefinition', 'S'), el('S.idle', 'S
│    const transition = (trigger) => lib.normalize(small(els, [{ id: 't1', kind: 'TransitionUsage', 
│    assert.match(lib.validate(transition('go')).map((p) => p.id + ': ' + p.message).join('\n'), /^t
│    ['Go', 'x : Go', 'after 10 [SI::s]', 'when ready', 'at t'].forEach((t) => assert.equal(lib.vali
│    const accept = lib.normalize(small([el('A', 'ActionDefinition', 'A'), el('A.wait', 'ActionUsage
│    assert.match(lib.validate(accept).map((p) => p.message).join('\n'), /The payload sig of action 
⋮
│  test('a send or accept action is a problem outside an action body, unless it is a state\'s entry,
│    const lib = loadLib(pageSource());
│    const send = { actionKind: 'send', payload: 'new Alert()' };
│    const messages = (elements) => lib.validate(lib.normalize(small([el('Alert', 'ItemDefinition', 
│    assert.match(messages([el('warn', 'ActionUsage', 'warn', send)]), /An action that sends is writ
│    assert.match(messages([el('S', 'StateDefinition', 'S'), el('S.warn', 'ActionUsage', 'warn', sen
│    assert.equal(messages([el('A', 'ActionDefinition', 'A'), el('A.warn', 'ActionUsage', 'warn', se
│    assert.equal(messages([el('S', 'StateDefinition', 'S'), el('S.warn', 'ActionUsage', 'warn', Obj
⋮
│  test('a typed action\'s own parameter keeps its doc, code and generals in the text, and an event 
│    const lib = loadLib(pageSource());
│    const code = (path) => [{ path, language: 'typescript', text: path === 'q.ts' ? 'x' : '' }];
│    const model = lib.normalize(small([el('B', 'ActionDefinition', 'B'), el('B.x', 'ParameterUsage'
│      el('A.a2.q', 'ParameterUsage', 'q', { direction: 'in', doc: 'the doc of q', code: code('q.ts'
│      el('C', 'PartDefinition', 'C'), el('C.p', 'PartUsage', 'p'), el('C.p.e1', 'EventOccurrenceUsa
│      [{ id: 'ft', kind: 'FeatureTyping', from: 'A.a2', to: 'B' }, { id: 'sp', kind: 'Specializatio
│    assert.equal(lib.validate(model).length, 0, JSON.stringify(lib.validate(model)));
│    const text = lib.toSysML(model, []);
│    assert.match(text, /action a2 : B \{\s+in item x;\s+in item q \{\s+doc \/\* the doc of q \*\/\s
⋮
│  test('a library name the geometry text can\'t see (a port named in on a part beside the one drawn
│    const lib = loadLib(pageSource());
│    const rug = { shape: 'Rectangle', length: 24, width: 12, unit: 'in', posX: 1, posY: 1 };
│    const geometry = { kind: 'GeometryView', show: ['Sys.rug'], options: { scale: 40, unit: 'in' } 
│    const problems = (elements, rels) => lib.validate(lib.normalize(small(elements, rels || [], geo
│    const sys = [el('Sys', 'PartDefinition', 'Sys'), el('Sys.rug', 'PartUsage', 'rug', rug)];
│    assert.equal(problems(sys.concat([el('Sys.tank', 'PartUsage', 'tank'), el('Sys.tank.in', 'PortU
│    assert.equal(problems(sys.concat([el('Sys.rug.leg', 'PartUsage', 'leg'), el('Sys.rug.leg.m', 'P
│    assert.match(problems(sys.concat([el('Sys.m', 'PortUsage', 'm')])), /^Sys\.m: The name m is one
│    assert.match(problems(sys.concat([el('Sys.rug.m', 'PortUsage', 'm')])), /^Sys\.rug\.m: The name
⋮

canvas/test/sequence.test.mjs:
⋮
│async function savedLayout(page, viewId, elId) {
│  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
│  return page.evaluate(([key, v, id]) => {
│    const raw = localStorage.getItem(key);
│    const view = raw ? JSON.parse(raw).model.views.find((x) => x.id === v) : null;
│    return view ? view.layout[id] : null;
│  }, [STATE_KEY, viewId, elId]);
⋮
│async function addView(page, kind) {
│  const before = await page.locator('#drawing g.frame[data-view]').count();
│  await page.selectOption('#new-view-kind', kind);
│  await page.click('#new-view');
│  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > co
│  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
⋮
│async function frameBox(page, id) {
│  const box = await page.locator(`#drawing g.frame[data-view="${id}"] > rect.outline`).boundingBox(
│  assert.ok(box, `the frame of view ${id} has a box`);
│  return box;
⋮
│function points(d) {
│  return d.split(/[ML]/).filter(Boolean).map((s) => s.split(',').map(Number));
⋮
│async function rowOf(page, viewId, relId) {
│  const d = await page.getAttribute(`#drawing g.frame[data-view="${viewId}"] g[data-rel="${relId}"]
│  const pts = points(d);
│  assert.equal(pts[0][1], pts[1][1], `the message ${relId} is a horizontal line: ${d}`);
│  return pts[0][1];
⋮
│async function drawMessage(page, from, to) {
│  await page.click('.palette button[data-tool="Message"]');
│  await page.mouse.click(from.x, from.y);
│  await page.mouse.click(to.x, to.y);
⋮
│async function centreOf(page, viewId, elId) {
│  const box = await page.locator(`#drawing g.frame[data-view="${viewId}"] g[data-el="${elId}"] > .o
│  assert.ok(box, `${elId} is drawn in view ${viewId}`);
│  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
⋮
│async function twoLifelines(page) {
│  const view = await addView(page, 'SequenceView');
│  const frame = await frameBox(page, view);
│  const left = await placeElement(page, 'PartUsage', { x: frame.x + frame.width * 0.3, y: frame.y +
│  const right = await placeElement(page, 'PartUsage', { x: frame.x + frame.width * 0.72, y: frame.y
│  return { view, left, right };
⋮
│describe('sequence view', () => {
│  let browser;
│  before(async () => { browser = await launch(); });
│  after(() => browser?.close());
│
│  test('a new SequenceView offers part, event and message, and two parts placed become lifelines le
│    const ctx = await openCanvas(browser);
│    const { page } = ctx;
│    const { view, left, right } = await twoLifelines(page);
│    const tools = await page.$$eval('.palette button[data-tool]:not([data-tool="Note"])', (bs) => b
⋮
│  test('a second message lands on the next row, and setting its order in the panel swaps the rows',
│    const ctx = await openCanvas(browser);
│    const { page } = ctx;
│    const { view, left, right } = await twoLifelines(page);
│    const from = await centreOf(page, view, left);
│    const to = await centreOf(page, view, right);
│    await drawMessage(page, from, to);
│    await until(page, () => document.querySelectorAll('g[data-rel][data-kind="Message"]').length ==
│    await drawMessage(page, to, from);
│    await until(page, () => document.querySelectorAll('g[data-rel][data-kind="Message"]').length ==
⋮
│    await until(page, ([v, a, b]) => {
│      const y = (id) => +(document.querySelector(`#drawing g.frame[data-view="${v}"] g[data-rel="${
│      return y(b) < y(a);
⋮

canvas/test/shared.test.mjs:
⋮
│const holdsElement = ([id, name]) => {
│  const working = window.__store.get('model/working');
│  const model = working && JSON.stringify(working.model ?? null);
│  return Boolean(model) && model.includes(JSON.stringify(id)) && (!name || model.includes(name));
⋮

canvas/test/undo.test.mjs

canvas/test/views.test.mjs:
⋮
│async function addView(page, kind) {
│  const before = await page.locator('#drawing g.frame[data-view]').count();
│  await page.selectOption('#new-view-kind', kind);
│  await page.click('#new-view');
│  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > co
│  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
⋮

docs/REPO_MAP.md

docs/sysml/README.md

docs/sysml/check.sh

docs/sysml/draw.mjs:
⋮
│const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').rep
│
⋮
│const compH = (n) => HEAD_H + LEAD * n + PAD_B;
│const defH = (comps = [], minH = 0) => Math.max(minH, NAME_H + comps.reduce((sum, c) => sum + compH
│
⋮
│function draw(variant) {
│  const page = variant === 'page';
│  const ACCENT = page ? '#2F8C7E' : '#176B61';
│  const out = [];
│  const push = (s) => out.push(s);
│
│  function text(x, y, str, style, anchor = 'start') {
│    const st = STYLE[style];
│    let a = `<text x="${x}" y="${y}"`;
│    if (anchor !== 'start') a += ` text-anchor="${anchor}"`;
│    a += ` font-family="${st.ff}" font-size="${st.fs}"`;
│    if (st.fw) a += ` font-weight="${st.fw}"`;
│    if (st.fi) a += ' font-style="italic"';
│    a += ' fill="currentColor"';
│    if (st.op) a += ` fill-opacity="${st.op}"`;
│    return `${a}>${esc(str)}</text>`;
⋮
│  function spans(x, y, parts) {
│    let a = `<text x="${x}" y="${y}" fill="currentColor">`;
│    for (const [style, str] of parts) {
│      const st = STYLE[style];
│      a += `<tspan font-family="${st.ff}" font-size="${st.fs}"`;
│      if (st.fw) a += ` font-weight="${st.fw}"`;
│      if (st.op) a += ` fill-opacity="${st.op}"`;
│      a += `>${esc(str)}</tspan>`;
│    }
│    return a + '</text>';
⋮
│  const box = (x, y, w, h, r = 0) =>
│    `<rect class="outline" x="${x}" y="${y}" width="${w}" height="${h}"${r ? ` rx="${r}"` : ''} fil
│  const rule = (x1, y, x2) =>
⋮
│  const hit = (d) => `<path class="hit" d="${d}" fill="none" stroke="transparent" stroke-width="12"
│
⋮
│  function element(el, label, kind, body) {
│    push(`<g data-el="${esc(el)}" data-label="${esc(label)}" data-kind="${kind}">`);
│    body();
│    push('</g>');
⋮
│  function def({ x, y, w, keyword, name, comps = [], minH = 0 }) {
│    const h = defH(comps, minH);
│    const cx = x + w / 2;
│    push(box(x, y, w, h));
│    push(text(cx, y + 16, keyword, 'kw', 'middle'));
│    push(text(cx, y + 32, name, 'name', 'middle'));
│    let cy = y + NAME_H;
│    for (const c of comps) {
│      push(rule(x, cy, x + w));
│      push(text(cx, cy + 13, c.heading, 'head', 'middle'));
⋮
│  function usage({ x, y, w, h, name, r = 10, gap }) {
│    if (gap) {
│      const [g1, g2] = [gap.y - 8, gap.y + 8];
│      const d = gap.side === 'right'
│        ? `M${x + w},${g2} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r
│          ` V${y + r} A${r},${r} 0 0 1 ${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + 
│        : `M${x},${g1} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x 
│          ` V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${
│      push(`<path class="outline" d="${d}" fill="none" stroke="currentColor" stroke-width="1.25"/>`
│    } else {
⋮
│  function port(px, py) {
│    push(`<rect class="outline accent" x="${px - 8}" y="${py - 8}" width="16" height="16" rx="2.5" 
│    push(`<path class="accent" d="M${px - 4.5},${py} H${px + 4.5} M${px - 2},${py - 2.5} L${px - 4.
⋮
│  function triangle(x, y, dir) {
│    const base = y - dir * 12;
│    push(`<path class="outline" d="M${x},${y} L${x - 7},${base} L${x + 7},${base} Z" fill="none" st
│    return base;
⋮
│  function definedBy(x, y1, tipY) {
│    const base = triangle(x, tipY, 1);
│    push(hit(`M${x},${y1} V${base}`));
│    push(`<line class="outline" x1="${x}" y1="${y1}" x2="${x}" y2="${base}" stroke="currentColor" s
│    push(`<circle cx="${x - 4}" cy="${base - 4}" r="1.6" fill="currentColor"/>`);
│    push(`<circle cx="${x + 4}" cy="${base - 4}" r="1.6" fill="currentColor"/>`);
⋮

docs/sysml/pilot-implementation/README.md

docs/sysml/pilot-implementation/REPO_MAP.md

docs/sysml/pilot-implementation/draw-maps.sh

docs/sysml/pilot-implementation/pilot.aiderignore

docs/sysml/pilot-implementation/projects/org.omg.kerml.owl.md

docs/sysml/pilot-implementation/projects/org.omg.kerml.xpect.tests.md

docs/sysml/pilot-implementation/projects/org.omg.kerml.xtext.md

docs/sysml/pilot-implementation/projects/org.omg.kerml.xtext.ui.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.edit.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.editor.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.execution.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.interactive.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.interactive.tests.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.jupyter.installer.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.jupyter.jupyterlab.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.jupyter.kernel.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.logic.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.model.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.plantuml.eclipse.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.plantuml.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.uml.ecore.importer.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.xpect.tests.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.xtext.md

docs/sysml/pilot-implementation/projects/org.omg.sysml.xtext.ui.md

docs/sysml/pilot-implementation/projects/tool-support.md

docs/sysml/save-notes.mjs:
⋮
│const listOf = (v) => (Array.isArray(v) ? v : []);
│// The same test the page uses: an id it can name a document by, an element, a place, and text.
│const isNote = (n) =>
│  !!n && typeof n === 'object' && typeof n.id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(n.id) &&
│  typeof n.el === 'string' && typeof n.text === 'string' && Number.isFinite(+n.x) && Number.isFinit
│const pick = (n, keys) => Object.fromEntries(keys.filter((k) => n[k] !== undefined).map((k) => [k, 
│const text = (v) => String(v ?? '');
│
⋮

docs/sysml/stronghold-proof.html

docs/sysml/stronghold-proof.svg

docs/sysml/stronghold-proof.sysml
```
