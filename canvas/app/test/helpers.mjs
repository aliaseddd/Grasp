// Shared by the new page's tests: where the built page is, how to open it from file:// in Chromium and open a state
// file in it, how a test finds what the page shows, the waits and the timing, and the check every browser test ends
// with, that the page logged no error and no warning.
//
// How a test finds the page's parts:
//   - What the application renders itself carries a data-testid, one of TESTIDS below.
//   - What a library renders is found by the library's own names, since the application cannot name it. Dockview
//     gives a tab the ARIA role `tab` and its panel's title as its name, and a view's panel is titled as tabTitle()
//     says. React Flow gives a node the class react-flow__node and its id in data-id, an edge react-flow__edge and
//     its id in data-id, a selected one the class `selected`, and a resize handle the classes of HANDLE with the
//     corner's two words. A plane's nodes have the ids of the elements they draw, and its edges the ids of the
//     relationships.
//   - A sash is found as a person finds it: by the resize cursor at a panel's edge (shell.test.mjs).
//
// Never enable the CSS domain of Chrome's DevTools protocol from a test (a CDP session's CSS.enable, or a tool that
// turns it on): on a page opened from file:// it makes Chromium log an error, which finish() would then report.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadLib } from '../../export.mjs';

// Playwright is installed globally in this container, where only require() finds it: ESM imports ignore NODE_PATH.
const { chromium } = createRequire(import.meta.url)('playwright');

/** The repository's root. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
/** What the build writes, committed: the folder Damon opens the page from. */
export const DIST = path.join(ROOT, 'canvas', 'dist');
/** The page. */
export const PAGE = path.join(DIST, 'index.html');
/** The page's file:// URL, and the URL of its folder, which every request it makes must be under. */
export const PAGE_URL = pathToFileURL(PAGE).href;
export const DIST_URL = pathToFileURL(DIST + path.sep).href;
/** The Stronghold example, a state file: one general view, proofStructure, placing 13 elements. */
export const EXAMPLE = path.join(ROOT, 'canvas', 'examples', 'stronghold-proof.json');

/** The data-testid names the tests find the page's parts by. */
export const TESTIDS = {
  app: 'app', // the application's root, mounted by main.tsx
  topBar: 'top-bar', // the bar across the top of the window, in place of the old header
  open: 'open', // the bar's five icon buttons, each on its <button>: Open, Save, Undo, Redo and About
  save: 'save',
  undo: 'undo',
  redo: 'redo',
  about: 'about',
  fileName: 'file-name', // the open file's name, in the bar; it holds no name while no file is open
  dock: 'dock', // everything under the bar: the strips, the side panels and the editor group
  explorer: 'explorer', // what the Explorer panel shows, as wide as the panel: its right edge is where the sash is
  details: 'details', // what the Details panel shows
  plane: 'plane', // a view's plane, the body of its tab; its data-view is the view's id
  field: (name) => `field-${name}`, // a field of Details, by its name in the library's FIELDS: the input, or what holds it
};

/** A data-testid selector. */
export const byTestId = (name) => `[data-testid="${name}"]`;

/** React Flow's names for what it draws on a plane. */
export const NODE = '.react-flow__node';
export const EDGE = '.react-flow__edge';
/** A resize handle of a selected box; `${HANDLE}.bottom.right` is the one at that corner. */
export const HANDLE = '.react-flow__resize-control.handle';

/** How long a wait by the clock may take, in ms. */
export const WAIT = 5000;
/** How long a scale test waits for the page to answer one event, in ms. */
export const SCALE_WAIT = 60000;
/** How many animation frames the page gets to itself before soon() gives up: about a second while it has nothing to do. */
export const FRAMES = 60;
/** The same for an answer of the browser's own, a file chooser or a download, which comes from another process. */
export const BROWSER_FRAMES = 3 * FRAMES;

/** Launches Chromium for a test file, after checking the page is built, so a missing page fails before any browser work. */
export function launch() {
  assert.ok(fs.existsSync(PAGE), `No page at ${PAGE}. Build it first: npm run build.`);
  return chromium.launch();
}

// What each page logged, for the failure message of a wait.
const logs = new WeakMap();
const logged = (page) => {
  const problems = logs.get(page) || [];
  return problems.length ? `\nThe page logged:\n${problems.join('\n')}` : '';
};

/**
 * Opens the page in a fresh 1400 × 900 context and waits for the application to mount. Returns the page with what it
 * logged: `problems` (console errors and warnings, and uncaught page errors), `requests` (every URL it asked for) and
 * `dialogs` (what it asked in a dialog of the browser's; each is accepted, so that a reload goes on).
 *
 * With `picker: false` the page has no showOpenFilePicker, as in a browser without the file pickers: it is taken away
 * before the page's scripts run, so the page asks for a file through a file input, which openStateFile answers.
 */
export async function openPage(browser, { url = PAGE_URL, picker = true } = {}) {
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  const requests = [];
  const dialogs = [];
  logs.set(page, problems);
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(`console ${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
  page.on('request', (request) => requests.push(request.url()));
  page.on('dialog', (dialog) => {
    dialogs.push(`${dialog.type()}: ${dialog.message()}`);
    dialog.accept().catch(() => {});
  });
  if (!picker) await page.addInitScript(() => { delete window.showOpenFilePicker; });
  await page.goto(url);
  await page.waitForSelector(byTestId(TESTIDS.app));
  return { context, page, problems, requests, dialogs };
}

/** Checks that the page logged no error and no warning, then closes it. Every browser test ends with it. */
export async function finish({ context, problems }) {
  try {
    assert.deepEqual(problems, [], `The page logged:\n${problems.join('\n')}`);
  } finally {
    await context.close();
  }
}

/** Closes the pages a failed test left open, so that they are not in the way of the next test's times. For afterEach. */
export async function closePages(browser) {
  await Promise.all((browser?.contexts() ?? []).map((context) => context.close()));
}

// The waits.

/**
 * Waits until predicate(arg), run in the page, is truthy, for up to `timeout` ms by the clock. On a timeout it fails
 * with `what`, plus what the page logged, instead of Playwright's bare timeout.
 */
export async function until(page, predicate, arg, what, timeout = WAIT) {
  try {
    await page.waitForFunction(predicate, arg, { timeout, polling: 50 });
  } catch (error) {
    if (error.name !== 'TimeoutError') throw error;
    assert.fail(`Waited ${timeout} ms for: ${what}.${logged(page)}`);
  }
}

/** Lets the page have one animation frame to itself, and the tasks that were waiting behind it. */
export const frame = (page) => page.evaluate(() => new Promise((resolve) => { requestAnimationFrame(() => setTimeout(resolve, 0)); }));

/**
 * Waits for what should follow at once from what a test just did, and returns it: the first truthy answer of
 * `check`, an async function run here in Node. It gives up once the page has had `frames` animation frames to itself
 * since the first look, and fails then with `missing`: a sentence, or a function that makes one, saying what the page
 * lacks. Time the page spends in its own script counts for nothing, since no frame passes meanwhile: a page that
 * takes seconds over a 5,000-element model is waited for, and a part that isn't built is found missing in about a
 * second.
 */
export async function soon(page, check, missing, frames = FRAMES) {
  for (let passed = 0; ; passed++) {
    const found = await check();
    if (found) return found;
    if (passed >= frames) break;
    await frame(page);
  }
  return assert.fail(`${typeof missing === 'function' ? await missing() : missing}${logged(page)}`);
}

// Opening a state file.

/** A state file to hand to the page, by name and bytes: one on disk, or `state` (what a state file holds) under `name`. */
export const stateFileAt = (file) => ({ name: path.basename(file), buffer: fs.readFileSync(file) });
export const stateFileOf = (name, state) => ({ name, buffer: Buffer.from(JSON.stringify(state)) });

/** The performance mark openStateFile leaves when the page is given a file. */
const GIVEN = 'grasp-test:given';

/**
 * Opens a state file ({ name, buffer }) through the file input, as a person does in a browser without the file
 * pickers. The page must have been opened with `picker: false`. A click on the bar's Open button then makes the page
 * ask for a file through an <input type="file">, one in the document or one made for the click, and the test answers
 * with the file. It returns once the bar shows the file's name. For a test that times the opening, sinceGiven() says
 * how long ago the page was given the file.
 */
export async function openStateFile(page, file) {
  assert.ok(await page.evaluate(() => !('showOpenFilePicker' in window)),
    'openStateFile needs a page opened with { picker: false }: a test cannot answer the browser\'s file picker.');
  const open = page.locator(byTestId(TESTIDS.open));
  const buttons = await open.count();
  assert.ok(buttons === 1, buttons
    ? `The page has ${buttons} Open buttons (data-testid "${TESTIDS.open}"), and only the bar's carries that name.`
    : `The page has no Open button (data-testid "${TESTIDS.open}"), so ${file.name} cannot be opened.`);
  let chooser = null;
  page.waitForEvent('filechooser', { timeout: WAIT }).then((asked) => { chooser = asked; }, () => {});
  await open.click({ timeout: WAIT });
  await soon(page, async () => chooser, `A click on Open asked for no file through a file input, so ${file.name} cannot be opened.`, BROWSER_FRAMES);
  // The input may be outside the document, where only a handle on it reaches. Playwright runs this in a world of its
  // own, which shares the page's performance timeline but not its window, so the time is left as a mark.
  await chooser.element().evaluate((input, mark) => {
    input.addEventListener('change', () => { performance.mark(mark); }, { capture: true, once: true });
  }, GIVEN);
  await chooser.setFiles({ name: file.name, mimeType: 'application/json', buffer: file.buffer });
  await soon(page, () => page.evaluate(([selector, name]) => [...document.querySelectorAll(selector)].some((el) => el.textContent.includes(name)),
    [byTestId(TESTIDS.fileName), file.name]),
  `The page was given ${file.name} through its file input, and its bar does not show that name (data-testid "${TESTIDS.fileName}"): the file is not open.`);
}

/** How long ago the page was given the file openStateFile opened last, in ms: since its input's change event. */
export const sinceGiven = (page) => page.evaluate((mark) => performance.now() - performance.getEntriesByName(mark).pop().startTime, GIVEN);

// The planes.

/** A view's title on its tab: its name, then its kind. `view` is a view as a state file holds it. */
export const tabTitle = (view) => `${view.name} : ${view.kind}`;
/** The selectors of a view's plane, and of the node of an element on it. */
export const planeOf = (viewId) => `${byTestId(TESTIDS.plane)}[data-view=${JSON.stringify(viewId)}]`;
export const nodeOf = (viewId, id) => `${planeOf(viewId)} ${NODE}[data-id=${JSON.stringify(id)}]`;

/** Waits for a view's tab, and returns its locator. It is shown, but may not be the tab its group has in front. */
export async function viewTab(page, view) {
  const title = tabTitle(view);
  const tab = page.getByRole('tab', { name: title, exact: true });
  await soon(page, async () => (await tab.count()) > 0, async () => {
    const names = await page.getByRole('tab').evaluateAll((tabs) => tabs.map((el) => el.getAttribute('aria-label') || el.textContent.trim()));
    return `No tab is titled "${title}". The page's tabs: ${names.length ? names.map((name) => `"${name}"`).join(', ') : 'none'}.`;
  });
  assert.equal(await tab.count(), 1, `one tab is titled "${title}"`);
  return tab;
}

/** What a view's plane draws now: whether the plane is there, and the ids of its nodes and of its edges. */
export const drawn = (page, viewId) => page.evaluate(([plane, node, edge]) => {
  const ids = (selector) => [...document.querySelectorAll(`${plane} ${selector}`)].map((el) => el.getAttribute('data-id'));
  return { plane: !!document.querySelector(plane), nodes: ids(node), edges: ids(edge) };
}, [planeOf(viewId), NODE, EDGE]);

/**
 * Waits until a view's plane draws a node for every element the view places, as it does once the view is fitted to
 * its tab. The plane itself is in the document at once, however large the model. Its nodes are waited for as long as
 * more of them keep coming, so a page that draws a large view a part at a time is not given up on.
 */
export async function untilDrawn(page, view) {
  const placed = Object.keys(view.layout).length;
  await soon(page, () => page.evaluate((selector) => !!document.querySelector(selector), planeOf(view.id)),
    `No plane shows ${view.name} (data-testid "${TESTIDS.plane}", data-view "${view.id}"): its tab has nothing drawn on it.`);
  const count = () => page.evaluate((selector) => document.querySelectorAll(selector).length, `${planeOf(view.id)} ${NODE}`);
  for (let nodes = await count(); nodes < placed;) {
    const before = nodes;
    ({ nodes } = await soon(page, async () => { const now = await count(); return now === before ? null : { nodes: now }; },
      `The plane of ${view.name} draws ${before} nodes for the ${placed} elements the view places.`));
  }
}

/**
 * Where a view's plane draws an element, or null when it doesn't: the node's rectangle on the screen (x, y, width,
 * height, in px), its size in the view's own units (w, h), the plane's zoom, and whether it is selected. A node's
 * layout size is its size before the plane's zoom, which is why offsetWidth reads it.
 */
export const boxOf = (page, viewId, id) => page.evaluate((selector) => {
  const node = document.querySelector(selector);
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  return {
    x: rect.x, y: rect.y, width: rect.width, height: rect.height,
    w: node.offsetWidth, h: node.offsetHeight,
    zoom: node.offsetWidth ? rect.width / node.offsetWidth : 1,
    selected: node.classList.contains('selected'),
  };
}, nodeOf(viewId, id));

/**
 * Selects a box by a click where its header is blank, 24 by 14 of the view's units in from its top left corner:
 * clear of its name, its compartments, its border and what sits on it. Returns where it is drawn, selected.
 */
export async function selectBox(page, view, id) {
  const box = await boxOf(page, view.id, id);
  assert.ok(box, `The plane of ${view.name} draws no node for ${id}.`);
  await page.mouse.click(box.x + 24 * box.zoom, box.y + 14 * box.zoom);
  return soon(page, async () => { const now = await boxOf(page, view.id, id); return now && now.selected ? now : null; },
    `A click on ${id} does not select it: its node has no class "selected".`);
}

// Timing what a person does, for the scale tests.

/**
 * Starts timing one kind of event in the page, as a person meets it. A sample is { script, frame, total }, in ms: the
 * script's time runs from when `first` reaches the window (its capture, before any of the page's listeners) to when
 * `last` has been through them (its bubble back to the window), so for a keystroke from keydown to the end of the
 * input event; the frame's time is the main thread's work for the frame that follows, from its animation callbacks
 * until it is painted; total is the two. The wait for the frame to begin isn't counted. Returns time(act), which runs
 * act, a Playwright action that sends one such event, and resolves its sample.
 *
 * It needs `last` to come back to the window. A mouse move on a plane does not: moveTiming() takes those.
 */
export async function timing(page, first, last) {
  const name = first + '>' + last;
  await page.evaluate(([key, a, b]) => {
    const t = { armed: false, start: null, samples: [] };
    (window.__timing = window.__timing || {})[key] = t;
    addEventListener(a, () => { if (t.armed) t.start = performance.now(); }, true);
    addEventListener(b, () => {
      if (!t.armed || t.start === null) return;
      const script = performance.now() - t.start;
      t.start = null;
      requestAnimationFrame(() => {
        const painting = performance.now();
        const channel = new MessageChannel();
        channel.port1.onmessage = () => {
          const frame = performance.now() - painting;
          t.samples.push({ script, frame, total: script + frame });
        };
        channel.port2.postMessage(null);
      });
    });
  }, [name, first, last]);
  return async (act) => {
    const count = await page.evaluate((key) => { const t = window.__timing[key]; t.armed = true; return t.samples.length; }, name);
    await act();
    await until(page, ([key, n]) => window.__timing[key].samples.length > n, [name, count], `the page answers one ${first}`, SCALE_WAIT);
    return page.evaluate((key) => { const t = window.__timing[key]; t.armed = false; return t.samples[t.samples.length - 1]; }, name);
  };
}

/**
 * Starts timing the moves of the mouse in the page, one step of a drag or of a pan each, and returns time(act) as
 * timing() does, with samples of the same parts.
 *
 * timing() cannot take a move on a plane. React Flow hears a drag, a pan and a resize through d3, whose mousemove
 * listener on the window stops the event there, so no listener of a test's sees the end of it. What marks the end
 * instead is the frame: Chromium keeps a mouse move for the start of the next frame and handles it there, in one
 * task with the frame's animation callbacks, the pointermove, then the mousemove, then the callbacks. So the script's
 * time runs from when the pointermove reaches the window (its capture, before any of the page's listeners) to the
 * frame's animation callbacks, and holds the listeners of both events and what they queue as microtasks, which is
 * where React renders a change that a store outside it reports. The frame's time runs from the callbacks until the
 * frame is painted.
 *
 * A move that a press or a release follows at once is handled before its frame begins, and its time could not be
 * told from the wait for the frame: time() fails on such a sample. A test waits for each sample before its next
 * event, so its moves are not of that kind.
 */
export async function moveTiming(page) {
  await page.evaluate(() => {
    const t = { armed: false, open: false, samples: [] };
    window.__moves = t;
    addEventListener('pointermove', () => {
      if (!t.armed || t.open) return;
      t.open = true;
      const start = performance.now();
      requestAnimationFrame((began) => {
        const callbacks = performance.now();
        const channel = new MessageChannel();
        channel.port1.onmessage = () => {
          const script = callbacks - start;
          const frame = performance.now() - callbacks;
          t.open = false;
          t.samples.push({ script, frame, total: script + frame, inFrame: began <= start });
        };
        channel.port2.postMessage(null);
      });
    }, true);
  });
  return async (act) => {
    const count = await page.evaluate(() => { const t = window.__moves; t.armed = true; return t.samples.length; });
    await act();
    await soon(page, () => page.evaluate((n) => window.__moves.samples.length > n, count),
      'The page was sent a move of the mouse, and no pointermove reached its window.');
    const sample = await page.evaluate(() => { const t = window.__moves; t.armed = false; return t.samples[t.samples.length - 1]; });
    assert.ok(sample.inFrame, 'A move of the mouse was handled before its frame began, so its time cannot be told from the wait for the frame.');
    return sample;
  };
}

/**
 * One measure against its limit: up to `planned` samples ({ total } in ms, with any parts), whose median must be under
 * `limit`. Once more than half of the planned samples are on one side of the limit, the median is on that side
 * whatever the rest would be, so the measure is settled and a test takes no more of it.
 */
export function measure(planned, limit) {
  const samples = [];
  const over = () => samples.filter((s) => s.total >= limit).length;
  return {
    samples,
    add(sample) { samples.push(sample); },
    get settled() { return samples.length >= planned || over() > planned / 2 || samples.length - over() > planned / 2; },
    get median() {
      const sorted = samples.map((s) => s.total).sort((a, b) => a - b);
      const middle = sorted.length >> 1;
      return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
    },
    toString() {
      const ms = (v) => v.toFixed(1);
      return samples.map((s) => (s.script === undefined ? ms(s.total) : `${ms(s.total)} (${ms(s.script)} script + ${ms(s.frame)} frame)`)).join(', ');
    },
  };
}

// Added for the planes' tests (plane, open and instant): the ten state files and what a plane should draw for them, the
// views' tabs, the sides, and the camera as a person works it.

/** The model library, as the Node tests run it. */
export const lib = loadLib();
/** The old page's fixtures, and the blank model. */
export const FIXTURES = path.join(ROOT, 'canvas', 'test', 'fixtures');
export const BLANK = path.join(ROOT, 'canvas', 'state.json');
/** The example and the nine fixtures: together 17 views, 11 of a graph kind. */
export const TEN = [EXAMPLE, ...['annotations', 'behavior-actions', 'behavior-states', 'browser', 'format1', 'geometry', 'grid', 'interconnection', 'sequence']
  .map((name) => path.join(FIXTURES, `${name}.json`))];

/** A state file's model as the library reads it (so format1.json has its places), as plain data of this realm. */
export const modelOf = (file) => JSON.parse(JSON.stringify(lib.normalize(JSON.parse(fs.readFileSync(file, 'utf8')).model)));
/** Whether a plane draws a view (its kind's renderer is graph), the ids of what it places, and of the lines it draws. */
export const isGraph = (view) => lib.VIEW_KINDS[view.kind]?.renderer === 'graph';
export const placedOf = (view) => Object.keys(view.layout);
export function linesOf(model, view) {
  const placed = new Set(placedOf(view));
  return model.relationships.filter((rel) => !rel.hidden && placed.has(rel.from) && placed.has(rel.to)).map((rel) => rel.id);
}
/** The two sentences of the card of a view no plane draws. */
export const cardOf = (view) => [`${lib.an(lib.VIEW_KINDS[view.kind].label, true)} is not drawn yet.`, 'The old page draws it until slice 2.'];

/** `a` is within `eps` of `b`. */
export const near = (a, b, eps) => Math.abs(a - b) <= eps;

/**
 * A browser whose contexts run `script` (a function) before any script of the page's, for openPage(): the page's
 * readiness is then measured by the test's own script, from the navigation's start.
 */
export const withInit = (browser, script) => ({
  newContext: async (options) => { const context = await browser.newContext(options); await context.addInitScript(script); return context; },
});

/** Waits until a view's plane draws a line for each of the `count` the view has. */
export const untilLines = (page, view, count) => soon(page, async () => (await drawn(page, view.id)).edges.length >= count,
  async () => `The plane of ${view.name} draws ${(await drawn(page, view.id)).edges.length} edges for the ${count} lines of the view that are not hidden.`);

/**
 * Brings a view's tab to the front and waits until its plane draws every element the view places and, when `lines` is
 * given, that many lines. For a graph view only.
 */
export async function showView(page, view, lines) {
  const tab = await viewTab(page, view);
  if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
  await untilDrawn(page, view);
  if (lines !== undefined) await untilLines(page, view, lines);
}

/** Collapses both sides, by a click on the name in front of each strip: the plane is then 1336 px wide. */
export async function collapseSides(page) {
  for (const [name, testid] of [['Explorer', TESTIDS.explorer], ['Details', TESTIDS.details]]) {
    await page.getByRole('tab', { name, exact: true }).click();
    await soon(page, () => page.evaluate((selector) => { const el = document.querySelector(selector); return !el || el.getBoundingClientRect().width < 1; }, byTestId(testid)),
      `A click on ${name} did not collapse its side.`);
  }
  await frame(page);
}

/** A CSS colour (a value, such as var(--grasp-teal)) as the browser computes it, rgb(...), to compare with a computed style. */
export const cssColor = (page, value) => page.evaluate((v) => {
  const el = document.createElement('div');
  el.style.color = v;
  document.body.appendChild(el);
  const colour = getComputedStyle(el).color;
  el.remove();
  return colour;
}, value);
export const INK = 'var(--grasp-ink)';
export const TEAL = 'var(--grasp-teal)';

/** What lies on a plane's ground: its nodes, its edges, and React Flow's panels (the zoom buttons, the minimap). */
export const TAKEN = `${NODE}, ${EDGE}, .react-flow__panel, button, input, a`;
/** Runs in the page: a point of a plane's bare ground, with room around it, or null. Pass [planeSelector, TAKEN]. */
export function groundOf([plane, taken]) {
  const el = document.querySelector(plane);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const bare = (x, y) => {
    const hit = document.elementFromPoint(x, y);
    return !!hit && el.contains(hit) && !hit.closest(taken);
  };
  for (let y = r.top + 60; y <= r.bottom - 60; y += 20) {
    for (let x = r.left + 80; x <= r.right - 80; x += 20) {
      if (bare(x, y) && bare(x - 8, y) && bare(x + 8, y) && bare(x, y - 8) && bare(x, y + 8)) return { x, y };
    }
  }
  return null;
}
/** A point of bare ground on a view's plane, as it is now. */
export async function groundPoint(page, view) {
  const point = await page.evaluate(groundOf, [planeOf(view.id), TAKEN]);
  assert.ok(point, `The plane of ${view.name} has no bare ground, with room around it, to put the pointer on.`);
  return point;
}

/** Every node of a view's plane as it is drawn: its id and rectangle on the screen. */
export const rectsOf = (page, viewId) => page.evaluate(([plane, node]) => Object.fromEntries([...document.querySelectorAll(`${plane} ${node}`)].map((el) => {
  const r = el.getBoundingClientRect();
  return [el.getAttribute('data-id'), { x: r.x, y: r.y, width: r.width, height: r.height }];
})), [planeOf(viewId), NODE]);

/**
 * Zooms a view's plane with Ctrl and the wheel, the pointer on the middle of node `id`, until it is drawn at `wanted`
 * (a zoom, within 3%). How far a turn of the wheel zooms is d3's figure to begin with, and then what the plane was seen
 * to do. Returns where the node is drawn then.
 */
export async function zoomTo(page, view, id, wanted) {
  let box = await boxOf(page, view.id, id);
  assert.ok(box, `The plane of ${view.name} draws no node for ${id}.`);
  let rate = 0.002; // the power of 2 that 1 px of the wheel zooms by
  await page.keyboard.down('Control');
  try {
    for (let turn = 0; turn < 10 && Math.abs(Math.log(box.zoom / wanted)) > 0.02; turn++) {
      const was = box;
      const delta = Math.max(-1500, Math.min(1500, Math.log2(was.zoom / wanted) / rate));
      await page.mouse.move(was.x + was.width / 2, was.y + was.height / 2);
      await page.mouse.wheel(0, delta);
      box = await soon(page, async () => {
        const now = await boxOf(page, view.id, id);
        return now && Math.abs(now.zoom - was.zoom) > 1e-9 ? now : null;
      }, `The plane of ${view.name} does not zoom when the wheel turns with Ctrl held and the pointer on ${id}.`);
      const seen = Math.log2(box.zoom / was.zoom) / -delta;
      if (seen > 0) rate = seen;
    }
  } finally {
    await page.keyboard.up('Control');
  }
  assert.ok(Math.abs(Math.log(box.zoom / wanted)) <= 0.03, `Ctrl and the wheel did not bring the plane of ${view.name} to ${(wanted * 100).toFixed(0)}%: it is at ${(box.zoom * 100).toFixed(1)}%.`);
  return box;
}

/** A point of a box where its header is blank, 24 by 14 of the view's units in from its corner, as selectBox clicks. */
export const headerOf = (box) => ({ x: box.x + 24 * box.zoom, y: box.y + 14 * box.zoom });
