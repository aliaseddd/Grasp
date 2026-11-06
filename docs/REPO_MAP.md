# Repo map

Drawn by [aider](https://aider.chat) 0.86.2 with `aider --show-repo-map` on November 6, 2026, over the files git tracks. For each file, aider's tree-sitter parser lists the definitions it would hand a model as context; a bare file name means the file has none it recognizes (configuration, Markdown, CSS, JSON). The `⋮` marks lines left out.

The map is what an AI pair programmer sees of this repository before it opens a file. Read it as a table of contents: the contract and the loader in `app/src/host`, the shell in `app/src/shell`, the one module, the two web parts, the dev host's page, server, and test, and the design canvas's scripts and tests in `canvas/` (the page itself, `canvas/index.html`, holds its script inline, which aider doesn't read).

To redraw it after changes, from the repository root (aider needs a model name to start, but drawing the map makes no API call):

```sh
COLUMNS=160 aider --show-repo-map --map-tokens 8192 --no-pretty --yes-always \
  --no-check-update --no-analytics --no-show-model-warnings --model gpt-4o
```

```text
If you need to edit any of these files, ask me to *add them to the chat* first.

.gitignore

README.md

app/.browserslistrc

app/.gitignore

app/README.md

app/package-lock.json

app/package.json

app/scripts/check-host-files.mjs

app/scripts/tsconfig.host-check.json

app/src/design/README.md

app/src/design/tokens.css

app/src/host/README.md

app/src/host/host-services.ts:
⋮
│export interface HostServices {
⋮
│export interface AppHandle {
│  /** Takes the app off the page and lets go of what it holds. A host calls this when its web part 
│  unmount(): void;
⋮
│export interface StrongholdApp {
│  /** The app's version, from app/package.json. */
│  version: string;
│  /** Draws the app inside `container` and returns the handle that takes it down again. */
│  mount(container: HTMLElement, services: HostServices): AppHandle;
⋮
│declare global {
│  interface Window {
│    /** Set by the app's entry file when it runs (app/webpack.config.js, output.library). Absent un
│    Stronghold?: StrongholdApp;
│  }
⋮

app/src/host/load-app.ts:
⋮
│function getRegisteredApp(): StrongholdApp | undefined {
│  const app: StrongholdApp | undefined = window.Stronghold;
│  return app && typeof app.mount === 'function' ? app : undefined;
⋮
│function findScript(entryUrl: string): HTMLScriptElement | undefined {
│  const scripts: ArrayLike<HTMLScriptElement> = document.getElementsByTagName('script');
│  for (let i: number = 0; i < scripts.length; i++) {
│    const script: HTMLScriptElement | undefined = scripts[i];
│    if (script && script.getAttribute(SCRIPT_ATTRIBUTE) === entryUrl) {
│      return script;
│    }
│  }
│  return undefined;
⋮
│function addScript(entryUrl: string): HTMLScriptElement {
│  const element: HTMLScriptElement = document.createElement('script');
│  element.setAttribute(SCRIPT_ATTRIBUTE, entryUrl);
│  element.setAttribute(STATE_ATTRIBUTE, 'loading');
│  element.addEventListener('load', (): void => {
│    element.setAttribute(STATE_ATTRIBUTE, 'loaded');
│  });
│  element.addEventListener('error', (): void => {
│    element.setAttribute(STATE_ATTRIBUTE, 'failed');
│  });
⋮
│export function loadApp(entryUrl: string): Promise<StrongholdApp> {
│  const registered: StrongholdApp | undefined = getRegisteredApp();
│  if (registered) {
│    return Promise.resolve(registered);
│  }
│
│  return new Promise<StrongholdApp>((resolve: (app: StrongholdApp) => void, reject: (error: Error) 
│    const settle: () => void = (): void => {
│      const app: StrongholdApp | undefined = getRegisteredApp();
│      if (app) {
⋮

app/src/main.ts

app/src/modules/hello/index.ts:
⋮
│export const hello: StrongholdModule = {
│  id: 'hello',
│  mount(root) {
│    const line = document.createElement('p');
│    line.textContent = 'Hello world!';
│    root.append(line);
│    return () => {
│      line.remove();
│    };
│  },
⋮

app/src/shell/fonts.ts:
⋮
│export function ensureFonts(): void {
│  if (added) {
│    return;
│  }
│  added = true;
│  for (const [weight, url] of faces) {
│    // Quoted, because a package path can contain parentheses or an apostrophe, which end an unquot
│    const face = new FontFace('Inter', `url("${url}") format("woff2")`, { weight, style: 'normal', 
│    document.fonts.add(face);
│    face.load().catch(() => {
⋮

app/src/shell/module.ts:
⋮
│export interface StrongholdModule {
│  /** The module's id. It is also its folder under src/modules/ and, once there is a router, its ro
│  id: string;
│  /**
│   * Draws the module into `root` and owns it from then on. Returns the function that takes the mod
│   * again; the shell calls it on unmount.
│   */
│  mount(root: HTMLElement): () => void;
⋮

app/src/shell/mount.ts:
⋮
│export function mount(container: HTMLElement, services: HostServices): AppHandle {
│  void services; // Nothing to take from the host yet. See host-services.ts.
│
│  ensureFonts();
│
│  const host = document.createElement('div');
│  host.className = 'stronghold';
│  const shadow = host.attachShadow({ mode: 'open' });
│  shadow.adoptedStyleSheets = [shellStyles()];
│  const root = document.createElement('div');
⋮
│  return {
│    unmount(): void {
│      live = false;
│      try {
│        unmountModule?.();
│      } catch (error) {
│        console.error(`[Stronghold] The ${entry.id} module failed while closing.`, error);
│      }
│      host.remove();
│    },
⋮

app/src/shell/registry.ts:
⋮
│export interface ModuleEntry {
│  id: string;
│  /** Loads the module's file. The first call fetches it; the browser caches the file for later cal
│  load(): Promise<StrongholdModule>;
⋮

app/src/shell/shell.css

app/src/shell/styles.ts:
⋮
│export function shellStyles(): CSSStyleSheet {
│  if (!sheet) {
│    sheet = new CSSStyleSheet();
│    sheet.replaceSync(tokens.replace(/:root\b/g, ':host') + '\n' + shell);
│  }
│  return sheet;
⋮

app/src/types/build.d.ts

app/tsconfig.json

app/webpack.config.js:
⋮
│class EntryNamePlugin {
│  apply(compiler) {
│    compiler.hooks.thisCompilation.tap('EntryNamePlugin', (compilation) => {
│      compilation.hooks.processAssets.tap(
│        { name: 'EntryNamePlugin', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE },
│        () => {
│          const files = compilation.entrypoints.get('stronghold-app').getFiles().filter((file) => f
│          const manifest = { entry: files[0], version: pkg.version };
│          compilation.emitAsset('stronghold-app.json', new webpack.sources.RawSource(JSON.stringify
│        },
│      );
⋮
│module.exports = () => ({
│  entry: {
│    // dist/stronghold-app.<hash>.js, named in dist/stronghold-app.json (EntryNamePlugin above).
│    'stronghold-app': './src/main.ts',
│  },
│  output: {
│    path: path.resolve(__dirname, 'dist'),
│    filename: '[name].[contenthash:8].js',
│    // Module files: dist/stronghold-app.hello.1a2b3c4d.js. The name comes from the webpackChunkNam
│    // src/shell/registry.ts; the hash changes when the module's code does, so SharePoint never ser
⋮

canvas/README.md

canvas/canvas.png

canvas/check.sh

canvas/export.mjs:
⋮
│export function loadLib(html = fs.readFileSync(PAGE, 'utf8')) {
│  const match = html.match(/<script id="model-lib">([\s\S]*?)<\/script>/);
│  if (!match) throw new Error(`No <script id="model-lib"> in ${PAGE}.`);
│  const context = vm.createContext({});
│  vm.runInContext(match[1], context, { filename: 'model-lib.js' });
│  if (!context.SysMLModel) throw new Error('model-lib did not define SysMLModel.');
│  return context.SysMLModel;
⋮
│export function readBlock(html, id) {
│  const match = html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</scr
│  if (!match) throw new Error(`No <script id="${id}"> in ${PAGE}.`);
│  return JSON.parse(match[1]);
⋮
│export function readPage(html = fs.readFileSync(PAGE, 'utf8')) {
│  const model = readBlock(html, 'model');
│  const saved = readBlock(html, 'saved-notes');
│  return { model, notes: Array.isArray(saved.notes) ? saved.notes : [] };
⋮
│export function readState(file) {
│  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
│  if (!data || typeof data !== 'object' || !data.model) throw new Error(`${file} has no model.`);
│  return { model: data.model, notes: Array.isArray(data.notes) ? data.notes : [] };
⋮

canvas/index.html

canvas/save-state.mjs:
⋮
│const isNote = (n) => !!n && typeof n === 'object' && typeof n.id === 'string' && /^[A-Za-z0-9_-]{1
⋮
│const json = (value) => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
│const replaceBetween = (text, start, end, block) => {
│  const a = text.indexOf(start);
│  const b = text.indexOf(end);
│  if (a < 0 || b < a) throw new Error(`No ${start} … ${end} in ${PAGE}.`);
│  return text.slice(0, a + start.length) + block + text.slice(b);
⋮

canvas/test/camera.test.mjs

canvas/test/drawing.test.mjs

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

canvas/test/index.js

canvas/test/loop.test.mjs

canvas/test/model-lib.test.mjs

canvas/test/shared.test.mjs:
⋮
│const holdsElement = ([id, name]) => {
│  const working = window.__store.get('model/working');
│  const model = working && JSON.stringify(working.model ?? null);
│  return Boolean(model) && model.includes(JSON.stringify(id)) && (!name || model.includes(name));
⋮

docs/REPO_MAP.md

docs/dev-host.png

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

docs/teams-icons/README.md

docs/teams-icons/icons.html

docs/teams-icons/render.mjs

hosts/dev/.gitignore

hosts/dev/README.md

hosts/dev/index.html

hosts/dev/package-lock.json

hosts/dev/package.json

hosts/dev/serve.mjs:
⋮
│function handle(request, response) {
│  let url;
│  let pathname;
│  try {
│    url = new URL(request.url, 'http://localhost');
│    pathname = decodeURIComponent(url.pathname);
│  } catch {
│    response.writeHead(400, { 'Content-Type': 'text/plain' }).end('Bad request: malformed URL');
│    return;
│  }
⋮
│export function startServer(port = 0) {
│  return new Promise((resolve) => {
│    const server = http.createServer(handle);
│    server.listen(port, '127.0.0.1', () => {
│      const url = `http://127.0.0.1:${server.address().port}/`;
│      resolve({ server, url });
│    });
│  });
⋮

hosts/dev/src/dev-host.ts:
⋮
│interface DevHost {
│  /** The entry file this page loads, once known. */
│  readonly appUrl: string | undefined;
│  /** The mounted app, if any. */
│  readonly handle: AppHandle | undefined;
│  /** Settles when the first mount has finished, for the tests. */
│  readonly ready: Promise<void>;
│  mount(): Promise<void>;
│  unmount(): void;
⋮
│declare global {
│  interface Window {
│    /** The page's controls, for the tests and the console. */
│    devHost: DevHost;
│  }
⋮
│async function findAppUrl(): Promise<string> {
│  if (appUrl) {
│    return appUrl;
│  }
│  const override = new URLSearchParams(location.search).get('app');
│  if (override) {
│    appUrl = new URL(override, location.href).href;
│    return appUrl;
│  }
│  const response = await fetch(BUILD_MANIFEST);
⋮
│async function mount(): Promise<void> {
│  const url = await findAppUrl();
│  const app = await loadApp(url);
│  if (handle) {
│    return;
│  }
│  handle = app.mount(container, {});
│  status.textContent = `Mounted Stronghold ${app.version} from ${url}`;
⋮
│function unmount(): void {
│  handle?.unmount();
│  handle = undefined;
│  status.textContent = 'Unmounted.';
⋮
│window.devHost = {
│  get appUrl() {
│    return appUrl;
│  },
│  get handle() {
│    return handle;
│  },
│  ready,
│  mount,
│  unmount,
⋮

hosts/dev/test/fixtures/blank.html

hosts/dev/test/fixtures/not-the-app.js

hosts/dev/test/hello.test.mjs:
⋮
│async function openHello() {
│  const page = await browser.newPage();
│  const requests = [];
│  page.on('request', (request) => requests.push(request.url()));
│  const errors = [];
│  page.on('pageerror', (error) => errors.push(error.message));
│  await page.goto(`${server.url}hosts/dev/`);
│  await page.evaluate(() => window.devHost.ready);
│  await page.waitForFunction(() =>
│    document.querySelector('.stronghold')?.shadowRoot?.textContent?.includes('Hello world!'));
⋮
│function readApp() {
│  const shadow = document.querySelector('.stronghold').shadowRoot;
│  const line = shadow.querySelector('.app p');
│  const style = getComputedStyle(line);
│  return {
│    text: shadow.querySelector('.app').textContent.trim(),
│    color: style.color,
│    fontFamily: style.fontFamily,
│    fontStyle: style.fontStyle,
│    fontSize: style.fontSize,
⋮
│async function openBlank() {
│  const page = await browser.newPage();
│  await page.goto(`${server.url}hosts/dev/test/fixtures/blank.html`);
│  return page;
⋮

hosts/dev/tsconfig.json

hosts/online/.gitignore

hosts/online/.yo-rc.json

hosts/online/README.md

hosts/online/build.sh

hosts/online/config/config.json

hosts/online/config/package-solution.json

hosts/online/config/rig.json

hosts/online/config/sass.json

hosts/online/config/serve.json

hosts/online/config/typescript.json

hosts/online/config/write-manifests.json

hosts/online/eslint.config.js

hosts/online/package-lock.json

hosts/online/package.json

hosts/online/scripts/copy-app.js

hosts/online/scripts/prepare-shared.js

hosts/online/src/webparts/stronghold/StrongholdWebPart.manifest.json

hosts/online/src/webparts/stronghold/StrongholdWebPart.ts:
⋮
│export interface IStrongholdWebPartProps {
⋮
│export default class StrongholdWebPart extends BaseClientSideWebPart<IStrongholdWebPartProps> {
│  /** The mounted app, once it is up. */
│  private _app: AppHandle | undefined;
│  /** True once render() has started loading; SPFx may call render() again, and there is nothing to
│  private _appStarted: boolean = false;
│  /** True once SharePoint has disposed the web part, so a load that finishes late mounts nothing. 
│  private _appDisposed: boolean = false;
│
│  public render(): void {
│    if (this._appStarted) {
│      return;
│    }
│    this._appStarted = true;
│    this.domElement.textContent = '';
│    const urls: string[] = this._appUrls();
│    if (urls.length === 0) {
│      this._showFailure(new Error('SharePoint gave this web part no base URL for its files.'), urls
│      return;
⋮
│  protected onDispose(): void {
│    this._appDisposed = true;
│    if (this._app) {
│      this._app.unmount();
│      this._app = undefined;
│    }
│    super.onDispose();
⋮
│  protected get dataVersion(): Version {
│    return Version.parse('1.0');
⋮
│  private _appUrls(): string[] {
│    const bases: string[] = this.context.manifest.loaderConfig.internalModuleBaseUrls || [];
│    return bases.map((base: string): string => (base.endsWith('/') ? base : `${base}/`) + APP_ENTRY
⋮
│  private _loadFrom(urls: string[], index: number): void {
│    loadApp(urls[index]).then((app) => {
│      if (this._appDisposed) {
│        return;
│      }
│      try {
│        this._app = app.mount(this.domElement, {});
│      } catch (error) {
│        // The file loaded; the app failed while drawing. Another URL would give the same app, so s
│        this._showFailure(error, [urls[index]]);
⋮
│  private _showFailure(error: unknown, urls: string[]): void {
│    this.domElement.textContent = `${strings.LoadFailed} ${urls.join(', ')}`;
│    console.error('[Stronghold]', error);
⋮

hosts/online/src/webparts/stronghold/loc/en-us.js

hosts/online/src/webparts/stronghold/loc/mystrings.d.ts:
│declare interface IStrongholdWebPartStrings {
⋮

hosts/online/teams/46df236a-2538-43ca-968c-fe5a6de88004_color.png

hosts/online/teams/46df236a-2538-43ca-968c-fe5a6de88004_outline.png

hosts/online/tsconfig.json

hosts/server/.gitignore

hosts/server/.yo-rc.json

hosts/server/README.md

hosts/server/build.sh

hosts/server/config/config.json

hosts/server/config/copy-assets.json

hosts/server/config/package-solution.json

hosts/server/config/serve.json

hosts/server/config/tslint.json

hosts/server/config/write-manifests.json

hosts/server/gulpfile.js

hosts/server/package-lock.json

hosts/server/package.json

hosts/server/scripts/copy-app.js

hosts/server/scripts/prepare-shared.js

hosts/server/src/index.ts

hosts/server/src/webparts/stronghold/StrongholdWebPart.manifest.json

hosts/server/src/webparts/stronghold/StrongholdWebPart.ts:
⋮
│export interface IStrongholdWebPartProps {
⋮
│export default class StrongholdWebPart extends BaseClientSideWebPart<IStrongholdWebPartProps> {
│  /** The mounted app, once it is up. */
│  private _app: AppHandle | undefined;
│  /** True once render() has started loading; SPFx may call render() again, and there is nothing to
│  private _appStarted: boolean = false;
│  /** True once SharePoint has disposed the web part, so a load that finishes late mounts nothing. 
│  private _appDisposed: boolean = false;
│
│  public render(): void {
│    if (this._appStarted) {
│      return;
│    }
│    this._appStarted = true;
│    this.domElement.textContent = '';
│    const urls: string[] = this._appUrls();
│    if (urls.length === 0) {
│      this._showFailure(new Error('SharePoint gave this web part no base URL for its files.'), urls
│      return;
⋮
│  protected onDispose(): void {
│    this._appDisposed = true;
│    if (this._app) {
│      this._app.unmount();
│      this._app = undefined;
│    }
│    super.onDispose();
⋮
│  protected get dataVersion(): Version {
│    return Version.parse('1.0');
⋮
│  private _appUrls(): string[] {
│    const bases: string[] = this.context.manifest.loaderConfig.internalModuleBaseUrls || [];
│    const urls: string[] = [];
│    for (let i: number = 0; i < bases.length; i++) {
│      let base: string = bases[i];
│      if (base.charAt(base.length - 1) !== '/') {
│        base += '/';
│      }
│      urls.push(base + APP_ENTRY_FILE);
│    }
⋮
│  private _loadFrom(urls: string[], index: number): void {
│    loadApp(urls[index]).then((app) => {
│      if (this._appDisposed) {
│        return;
│      }
│      try {
│        this._app = app.mount(this.domElement, {});
│      } catch (error) {
│        // The file loaded; the app failed while drawing. Another URL would give the same app, so s
│        this._showFailure(error, [urls[index]]);
⋮
│  private _showFailure(error: Error, urls: string[]): void {
│    this.domElement.textContent = strings.LoadFailed + ' ' + urls.join(', ');
│    console.error('[Stronghold]', error);
⋮

hosts/server/src/webparts/stronghold/loc/en-us.js

hosts/server/src/webparts/stronghold/loc/mystrings.d.ts:
│declare interface IStrongholdWebPartStrings {
⋮

hosts/server/tsconfig.json
```
