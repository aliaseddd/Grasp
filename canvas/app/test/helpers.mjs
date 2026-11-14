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
//     corner's two words. In the four graph kinds a plane's nodes have the ids of the elements they draw, and its
//     edges the ids of the relationships, which slice 1's tests read.
//   - From slice 2 a test asks what a body shows, whichever body it is, through thingsIn() and thingIn() (at the end
//     of this file): a node's data-id is React Flow's own id, and in a sequence view two nodes stand for one element.
//   - A control of an action carries data-action, the action's id, wherever it stands: actionControl().
//   - A sash is found as a person finds it: by the resize cursor at a panel's edge (shell.test.mjs).
//
// Never enable the CSS domain of Chrome's DevTools protocol from a test (a CDP session's CSS.enable, or a tool that
// turns it on): on a page opened from file:// it makes Chromium log an error, which finish() would then report.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
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
  tools: 'tools', // what the Tools panel shows (step 11)
  validation: 'validation', // what the Validation panel shows (step 12)
  palette: 'palette', // the right-click menu of a plane (step 11)
  toast: 'toast', // a toast: what the page says in passing, such as why a tool was refused (step 11)
  aboutPanel: 'about-panel', // the About panel (step 12); `about` above is the bar's button that opens it
  // Slice 2 (plan/slice-2.md, section 4, seam 12), each on what the application renders itself.
  body: 'body', // a component body's root (a grid view, a browser view); its data-view is the view's id, as a plane's
  notes: 'notes', // what the Notes panel shows
  note: 'note', // one note in it; its data-note is the note's id
  archiveList: 'archive-list', // the archived notes, in the Notes panel
  pin: 'pin', // a note's pin on what a body draws; its data-note is the note's id
  badge: 'badge', // the count of problems on what a body draws
  grip: 'grip', // a grip a line is dragged from; its data-grip says which (top, right, bottom, left; from, to)
  connectMenu: 'connect-menu', // the menu of the kinds that fit where a dragged line was let go; an entry carries data-kind
  labelEditor: 'label-editor', // the text box laid over a label that is being edited
  textTab: 'text-tab', // the tab that shows the model's text
  text: 'text', // the text itself, in that tab
  textProblems: 'text-problems', // what keeps the text from being correct, in that tab
  viewSection: 'view-section', // the view's section of Details
  codeSection: 'code-section', // the code links' section of Details
  newView: 'new-view', // the New view button, at the end of the editor's tab bar
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
 * `dialog` answers each dialog (it is given the Playwright Dialog, and accepts it by default; `(d) => d.dismiss()` dismisses).
 *
 * With `picker: false` the page has no showOpenFilePicker, as in a browser without the file pickers: it is taken away
 * before the page's scripts run, so the page asks for a file through a file input, which openStateFile answers.
 */
export async function openPage(browser, { url = PAGE_URL, picker = true, dialog = (d) => d.accept() } = {}) {
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
  page.on('dialog', (dialog_) => {
    dialogs.push(`${dialog_.type()}: ${dialog_.message()}`);
    Promise.resolve(dialog(dialog_)).catch(() => {});
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

// Added for steps 9 to 12 (plan/swarm/shared.md, "What the tests share"): a file opened in one call, the side panels,
// the Explorer's rows, a field of Details, and the bar's Undo and Redo.

/** Opens the page without the file picker and a state file ({ name, buffer }) in it. Returns what openPage returns. */
export async function openIn(browser, file, options = {}) {
  const opened = await openPage(browser, { ...options, picker: false });
  await openStateFile(opened.page, file);
  return opened;
}

/** The side panels by the name their strip shows, and the data-testid of each one's root. */
export const SIDES = { Explorer: TESTIDS.explorer, Tools: TESTIDS.tools, Validation: TESTIDS.validation, Notes: TESTIDS.notes, Details: TESTIDS.details };

/**
 * Shows a side panel, by its name on its strip ('Explorer', 'Tools', 'Validation', 'Notes' or 'Details'): when its root is not
 * drawn (another panel of its strip is in front, or its side is collapsed), a click on its name brings it to the
 * front and opens the side. A panel that is shown already is left alone, since a click on the name in front would
 * collapse its side.
 */
export async function showSide(page, name) {
  const testid = SIDES[name];
  assert.ok(testid, `No side panel is named ${name}. The side panels: ${Object.keys(SIDES).join(', ')}.`);
  const shown = () => page.evaluate((selector) => {
    const el = document.querySelector(selector);
    return !!el && el.getBoundingClientRect().width >= 1 && el.getBoundingClientRect().height >= 1;
  }, byTestId(testid));
  if (await shown()) return;
  const tab = page.getByRole('tab', { name, exact: true });
  await soon(page, async () => (await tab.count()) > 0, `No strip names a panel ${name} (a tab of that name), so the ${name} panel cannot be shown.`);
  await tab.click();
  await soon(page, shown, `A click on ${name} on its strip did not show the ${name} panel (data-testid "${testid}").`);
}

/**
 * The selector of a row of the Explorer (step 9): the element that holds the row's words and takes its click. It
 * carries data-row, "<type>:<id>": `type` is 'package', 'view', 'el', 'rel' or 'more', and `id` the view's, the
 * element's or the relationship's id ('' for the package's one row; for 'more', a "Show more" row, the row id of the
 * row whose list it ends: rowOf('more', 'package:')).
 */
export const rowOf = (type, id = '') => `${byTestId(TESTIDS.explorer)} [data-row=${JSON.stringify(`${type}:${id}`)}]`;
/** A row of the Explorer, as a locator: its words (textContent) and its click. */
export const rowIn = (page, type, id = '') => page.locator(rowOf(type, id));
/**
 * The tree item a row belongs to (ARIA role treeitem), which carries aria-selected ("true" or "false"; none on the
 * package's row and on a "Show more" row), aria-current "true" on the row of the view in front, and, when it has rows
 * inside it, aria-expanded. The Explorer sets aria-selected on its own row: MUI X Tree View 8 would say aria-checked.
 */
export const rowItemIn = (page, type, id = '') => rowIn(page, type, id).locator('xpath=ancestor::*[@role="treeitem"][1]');

/**
 * A field of Details (step 10), by its name in the library's FIELDS, as a locator: the <input> or <textarea> that
 * carries data-testid "field-<name>" or lies inside what carries it; the first, when a field has several (radio
 * buttons).
 */
export function fieldIn(page, name) {
  const field = byTestId(TESTIDS.field(name));
  return page.locator(byTestId(TESTIDS.details)).locator(`input${field}, textarea${field}, ${field} input, ${field} textarea`).first();
}

/** Clicks the bar's Undo, or its Redo, and gives the page a frame. The button must be enabled: a click on a disabled one fails. */
export async function undo(page) {
  await page.locator(byTestId(TESTIDS.undo)).click({ timeout: WAIT });
  await frame(page);
}
export async function redo(page) {
  await page.locator(byTestId(TESTIDS.redo)).click({ timeout: WAIT });
  await frame(page);
}

// Added for step 10 and after (plan/swarm/step-10.md, "What the browser's test files share"): what Details says and
// shows, picking by a row of the Explorer or by a box so that Details shows it, the words of the bar's Undo and Redo,
// and Details's tabs and fields' rows.

export const DETAILS = byTestId(TESTIDS.details);
export const NO_FILE = 'No file is open.';
export const NOTHING_PICKED = 'Nothing is picked. Click a box, a line or a row of the Explorer to see its fields.';

/** What Details says while it shows no form, or null. */
export const saysIn = (page) => page.evaluate((root) => document.querySelector(`${root} .grasp-side-text`)?.textContent ?? null, DETAILS);
/** What Details shows the form of, "<type>:<id>", or null. */
export const shownIn = (page) => page.evaluate((root) => document.querySelector(`${root} .grasp-details`)?.getAttribute('data-picked') ?? null, DETAILS);

/**
 * With a file open and nothing picked, Details says so. Every test calls it once its file is open and before it
 * picks anything, so that against a page whose Details is not built the test fails for that, in these words.
 */
export async function nothingPicked(page) {
  await showSide(page, 'Details');
  const says = await soon(page, () => saysIn(page), 'Details says nothing: it holds no paragraph (.grasp-side-text) and no form.');
  assert.equal(says, NOTHING_PICKED, `Details reads "${says}", not "${NOTHING_PICKED}": Details is not built.`);
}

/** Waits until Details shows the form of an item. `how` says how it was picked, for the failure. */
export const untilShown = (page, type, id, how) => soon(page, async () => (await shownIn(page)) === `${type}:${id}`,
  async () => `Details does not show ${type} ${id}, ${how}: it shows ${(await shownIn(page)) ?? `"${await saysIn(page)}"`}.`);

/** Picks an element, a line or a view by a click on its row of the Explorer, and waits until Details shows it. */
export async function pickRow(page, type, id) {
  await showSide(page, 'Explorer');
  const row = rowIn(page, type, id);
  await soon(page, async () => (await row.count()) === 1, `The Explorer shows no row for ${type} ${id} (data-row "${type}:${id}").`);
  await row.scrollIntoViewIfNeeded();
  await row.click();
  await untilShown(page, type, id, 'picked by its row of the Explorer');
}

/** Picks a box by a click on its header on the plane, and waits until Details shows it. */
export async function pickBox(page, view, id) {
  await selectBox(page, view, id);
  await untilShown(page, 'el', id, 'picked on the plane');
}

/**
 * The words of the step Undo would take back ('undo') or Redo make again ('redo'), or null when there is none: the
 * button's tooltip, which Material UI's Tooltip puts as aria-label on the element around the button.
 */
export const wordsOf = (page, which) => page.evaluate(([selector, label]) => {
  const tip = document.querySelector(selector).parentElement.getAttribute('aria-label') ?? '';
  return tip === label ? null : tip.slice(label.length + 1);
}, [byTestId(TESTIDS[which]), which === 'undo' ? 'Undo' : 'Redo']);

/** Shows a tab of Details, 'Core' or 'Advanced'. */
export async function showTab(page, name) {
  const tab = page.locator(DETAILS).getByRole('tab', { name, exact: true });
  if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
  await soon(page, () => page.evaluate(([root, n]) => !!document.querySelector(`${root} .grasp-details-page[data-tab="${n}"]`), [DETAILS, name]),
    `Details does not show its ${name} tab's page (.grasp-details-page, data-tab "${name}").`);
}

/** A field's row, as it is now on the tab shown: null when absent, else whether it is locked and why. */
export const rowOfField = (page, field) => page.evaluate(([root, f]) => {
  const row = document.querySelector(`${root} .grasp-field[data-field="${f}"]`);
  return row ? { locked: row.classList.contains('locked'), why: row.querySelector('.grasp-field-why')?.textContent ?? null } : null;
}, [DETAILS, field]);

// Added for slice 2 (plan/slice-2.md, section 4, seam 12): what any body shows, the grips and a drag between two
// points, the right-click palette's actions, the toast with its number, a key of the action table, a file saved and
// read back, the text of a state, a note put into a state file, and the Notes panel with its notes and pins. Beside
// those of the seam's table: a plane's camera (cameraOf) and some frames to itself (idle), which the tests of the
// seams, of the keys and of the camera each need.
//
// How a test finds what a body shows. Inside a plane, each node's and each edge's own React Flow element holds one
// element that carries data-of, "el:<element id>" or "rel:<relationship id>"; a node that stands for no element holds
// none, and two nodes can name one element. Inside a component body (data-testid "body"), each thing carries
// data-thing, in the same form, on the element that takes its click. A test never reads a node's data-id for an
// element's id.

/** The script that prints a state file's text. */
export const EXPORT = path.join(ROOT, 'canvas', 'export.mjs');

/** The selector of a component body's root, for a view: data-testid "body" with the view's id in data-view. */
export const bodyOf = (viewId) => `${byTestId(TESTIDS.body)}[data-view=${JSON.stringify(viewId)}]`;
/** The selector of every control of an action, by the action's id: a button, a menu entry, an entry of the palette. */
export const actionControl = (actionId) => `[data-action=${JSON.stringify(actionId)}]`;

/**
 * The things a view's body shows, as a sorted list of "<type>:<id>" ('el:Host', 'rel:t-hosts'), each once: for a
 * plane what its nodes and edges stand for (data-of), for a component body what carries data-thing. A view whose tab
 * shows the card shows nothing: []. It lists what is in the document now, so a view of more than 300 nodes, which
 * mounts only what its window shows, lists those.
 */
export const thingsIn = (page, viewId) => page.evaluate(([plane, body]) => {
  const things = new Set();
  for (const el of document.querySelectorAll(`${plane} [data-of]`)) things.add(el.getAttribute('data-of'));
  for (const el of document.querySelectorAll(`${body} [data-thing]`)) things.add(el.getAttribute('data-thing'));
  return [...things].filter((thing) => /^(el|rel):/.test(thing)).sort();
}, [planeOf(viewId), bodyOf(viewId)]);

/**
 * The selector of a thing a view's body shows: on a plane the node's or the edge's own React Flow element, in a
 * component body the element that carries data-thing. `type` is 'el' or 'rel'. It matches two nodes for an element
 * that two nodes stand for.
 */
export function thingOf(viewId, type, id) {
  const thing = JSON.stringify(`${type}:${id}`);
  return `${planeOf(viewId)} :is(${NODE}, ${EDGE}):has([data-of=${thing}]), ${bodyOf(viewId)} [data-thing=${thing}]`;
}
/** The locator of a thing a view's body shows; the first, for an element that two nodes stand for. */
export const thingIn = (page, viewId, type, id) => page.locator(thingOf(viewId, type, id)).first();

/**
 * A plane's camera, read from the transform of React Flow's viewport: `{ x, y, zoom }`, where the view's origin lies
 * from the plane's top left corner, in px, and the zoom (1 at 100%). Null when the view's tab draws no plane.
 */
export const cameraOf = (page, viewId) => page.evaluate((plane) => {
  const el = document.querySelector(`${plane} .react-flow__viewport`);
  if (!el) return null;
  const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  return { x: m.e, y: m.f, zoom: m.a };
}, planeOf(viewId));

/**
 * Lets the page have `frames` animation frames to itself, about a second by default, so that a thing that should not
 * happen has had its time to: a test then asserts that it did not.
 */
export async function idle(page, frames = FRAMES) {
  for (let i = 0; i < frames; i++) await frame(page);
}

/** The class the line of a relationship kind carries on a plane: its row's `line.cls` in the library ('specialization', 'typing'). */
export const lineClass = (kind) => lib.RELATIONSHIPS[kind].line.cls;
const LINE_CLASSES = Object.keys(lib.RELATIONSHIPS).map(lineClass);

/**
 * The lines a view's plane draws, by id: `[{ id, cls }]`, `id` the relationship's and `cls` the class its kind gives
 * it (lineClass(kind); '' for an edge that carries none of the library's).
 */
export const linesIn = (page, viewId) => page.evaluate(([plane, edge, classes]) => [...document.querySelectorAll(`${plane} ${edge}`)].map((el) => ({
  id: (el.querySelector('[data-of^="rel:"]')?.getAttribute('data-of') ?? 'rel:').slice(4),
  cls: [...el.classList].find((word) => classes.includes(word)) ?? '',
})).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)), [planeOf(viewId), EDGE, LINE_CLASSES]);

/**
 * Runs in the page: a point of the first element that matches `selector` at which that element is what a press or a
 * click lands on, so nothing else lies over it there: `{ x, y }` in the window's px, or `{ missing: true }` when
 * nothing matches, or `{ under }`, words for what covers it, when no point of it is free. For a line it looks along
 * the path that takes the line's pointer (the one that carries data-of), from its middle outwards; for anything else
 * over its rectangle, from the middle outwards. What carries data-pass (a grip, a pin, a badge) is not the thing
 * itself: a press there is the grip's or the pin's.
 *
 * The point is in whole px, and is tried as such. Chromium finds what the mouse is on at the pointer's place rounded
 * to whole px, so what document.elementFromPoint() answers at 540.9 is not always what a press at 540.9 lands on, at
 * the edge of a node; at a whole px the two agree. Pass [selector].
 */
export function freePointOf([selector]) {
  const el = document.querySelector(selector);
  if (!el) return { missing: true };
  const words = (hit) => (hit ? `<${hit.tagName.toLowerCase()}${hit.getAttribute('data-testid') ? ` data-testid="${hit.getAttribute('data-testid')}"` : ''}${hit.getAttribute('class') ? ` class="${hit.getAttribute('class')}"` : ''}>` : 'nothing of the page');
  let under = null;
  const free = (x, y) => {
    const hit = document.elementFromPoint(x, y);
    if (hit && el.contains(hit) && !hit.closest('[data-pass]')) return true;
    under ??= words(hit && (hit.closest('.react-flow__node, .react-flow__edge, [data-thing], [data-testid]') ?? hit));
    return false;
  };
  const order = [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.1, 0.9];
  const path = el.matches('.react-flow__edge') ? el.querySelector('path[data-of]') ?? el.querySelector('path') : null;
  if (path) {
    const length = path.getTotalLength();
    const matrix = path.getScreenCTM();
    for (const part of [...order, 0.05, 0.95]) {
      const on = path.getPointAtLength(length * part);
      const at = new DOMPoint(on.x, on.y).matrixTransform(matrix);
      const x = Math.round(at.x);
      const y = Math.round(at.y);
      if (free(x, y)) return { x, y };
    }
    return { under };
  }
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return { under: 'nothing: it has no size (its tab is not in front, or it is not laid out)' };
  for (const fy of order) {
    for (const fx of order) {
      const x = Math.round(r.left + r.width * fx);
      const y = Math.round(r.top + r.height * fy);
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom && free(x, y)) return { x, y };
    }
  }
  return { under };
}

/**
 * A point of a thing a view's body shows at which a click, a press or a drop is on that thing itself: `{ x, y }` in
 * the window's px. `type` is 'el' or 'rel'. A box that holds other boxes has such a point where none of them lies;
 * a line where no label and no box lies over it. It fails, in a sentence, when the body does not show the thing, or
 * when something covers all of it.
 */
export async function pointOn(page, viewId, type, id) {
  const found = await page.evaluate(freePointOf, [thingOf(viewId, type, id)]);
  assert.ok(!found.missing, `The body of the view ${viewId} shows nothing for ${type} ${id} (no node or edge that holds data-of "${type}:${id}", and nothing with that data-thing).`);
  assert.ok(found.under === undefined, `Nothing of ${type} ${id} can be pointed at in the view ${viewId}: it lies under ${found.under}.`);
  return { x: found.x, y: found.y };
}

/**
 * How far the two drawn ends of a line lie from the nodes of two elements, in the window's px: `{ from, to }`, each 0
 * when that end of the line (the first point of its path for `from`, the last for `to`) is on or inside a node of
 * the element, and null when the plane draws no node for it. Null when the plane draws no line for the relationship.
 * A line's end lies on the border of the node it is drawn to, so a test asks that both are within a px or two.
 */
export const endsAt = (page, viewId, relId, fromId, toId) => page.evaluate(([line, from, to]) => {
  const path = document.querySelector(line)?.querySelector('path[data-of]');
  if (!path) return null;
  const matrix = path.getScreenCTM();
  const onScreen = (p) => new DOMPoint(p.x, p.y).matrixTransform(matrix);
  const gap = (selector, p) => {
    const gaps = [...document.querySelectorAll(selector)].map((el) => {
      const r = el.getBoundingClientRect();
      return Math.hypot(Math.max(r.left - p.x, 0, p.x - r.right), Math.max(r.top - p.y, 0, p.y - r.bottom));
    });
    return gaps.length ? Math.min(...gaps) : null;
  };
  return { from: gap(from, onScreen(path.getPointAtLength(0))), to: gap(to, onScreen(path.getPointAtLength(path.getTotalLength()))) };
}, [thingOf(viewId, 'rel', relId), thingOf(viewId, 'el', fromId), thingOf(viewId, 'el', toId)]);

/** What the label of a thing says in a view's body (the element that carries data-label "<type>:<id>"), or null when the body shows no label for it. */
export const labelIn = (page, viewId, type, id) => page.evaluate((selector) => document.querySelector(selector)?.textContent ?? null,
  `:is(${planeOf(viewId)}, ${bodyOf(viewId)}) [data-label=${JSON.stringify(`${type}:${id}`)}]`);

/**
 * Runs in the page: the grips inside a node's or an edge's element as they are now, each with a point of it in whole
 * px (freePointOf says why whole): the nearest to its middle at which the grip itself is what a press lands on, and
 * `free` true; or its middle, rounded, and `free` false with words for what lies over it. Pass [the element's selector].
 */
function gripsOf([selector]) {
  const holder = document.querySelector(selector);
  if (!holder) return null;
  return [...holder.querySelectorAll('[data-grip]')].map((el) => {
    const r = el.getBoundingClientRect();
    const middle = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const points = [];
    for (let y = Math.ceil(r.top); y <= Math.floor(r.bottom); y++) for (let x = Math.ceil(r.left); x <= Math.floor(r.right); x++) points.push({ x, y });
    points.sort((a, b) => Math.hypot(a.x - middle.x, a.y - middle.y) - Math.hypot(b.x - middle.x, b.y - middle.y));
    const style = getComputedStyle(el);
    const shown = style.visibility === 'visible' && style.display !== 'none' && r.width > 0;
    const at = shown ? points.find((p) => { const hit = document.elementFromPoint(p.x, p.y); return !!hit && el.contains(hit); }) : undefined;
    const hit = document.elementFromPoint(Math.round(middle.x), Math.round(middle.y));
    const over = hit && !el.contains(hit) ? hit.closest('.react-flow__node, .react-flow__edge, [data-testid]') ?? hit : null;
    return {
      grip: el.getAttribute('data-grip'), shown, free: !!at,
      x: at ? at.x : Math.round(middle.x), y: at ? at.y : Math.round(middle.y),
      under: over ? `<${over.tagName.toLowerCase()} class="${over.getAttribute('class') ?? ''}">` : null,
    };
  });
}

/**
 * A grip, shown and ready for a press: `{ x, y, grip }`, a point of it in the window's px and which grip it is. The
 * point is the whole px nearest to the grip's middle at which the grip itself takes the press: for a line's grip
 * whose inner half its end's node covers, a point of its outer half.
 *
 * - **A node's grip** (`id` an element's; `grip` 'top', 'right', 'bottom' or 'left', or null for the first of the
 *   node's grips that nothing covers: a box has four, a border item and a small node one). The pointer is first put
 *   on the node, where the node itself is what lies under it, so that the grips show; a grip is then reached from
 *   its node, as a person reaches it. The pointer is left on the node: dragBetween() moves it to the grip.
 * - **A line's grip** (`id` a relationship's; `grip` 'from' or 'to'): the line is selected, so that its two grips
 *   show: by a click on it where nothing lies over it, or, when another line lies along all of it, by its row of the
 *   Explorer.
 *
 * It fails, in a sentence, when the thing is not drawn, when it has no such grip (no grip is mounted in a view that
 * draws no lines, on a far node below 25% zoom, or before lines are drawn by dragging), when the grip does not show,
 * and when something lies over it. With `{ covered: 'null' }` a grip that is mounted and shown, but lies under
 * something, gives null instead of a failure: for a test that then takes another node.
 */
export async function gripOf(page, viewId, id, grip = null, { covered = 'fail' } = {}) {
  const line = grip === 'from' || grip === 'to';
  const type = line ? 'rel' : 'el';
  const selector = thingOf(viewId, type, id);
  const what = line ? `the line ${id}` : id;
  if (line) {
    const selected = () => page.evaluate((s) => !!document.querySelector(s)?.classList.contains('selected'), selector);
    if (!(await selected())) {
      const at = await page.evaluate(freePointOf, [selector]);
      assert.ok(!at.missing, `The plane of the view ${viewId} draws no line for ${id} (no edge that holds data-of "rel:${id}").`);
      if (at.under === undefined) await page.mouse.click(at.x, at.y);
      else {
        // Another line lies along all of it (two lines between one pair of nodes): it is picked by its row of the Explorer.
        await showSide(page, 'Explorer');
        const row = rowIn(page, 'rel', id);
        await soon(page, async () => (await row.count()) === 1, `${what} lies under ${at.under} on its plane, and the Explorer shows no row for it to select it by (data-row "rel:${id}").`);
        await row.scrollIntoViewIfNeeded();
        await row.click();
      }
      await soon(page, selected, `A click on ${what}${at.under === undefined ? '' : '\'s row of the Explorer'} does not select it: its edge has no class "selected".`);
    }
  } else {
    const at = await pointOn(page, viewId, 'el', id);
    await page.mouse.move(at.x, at.y);
  }
  const wanted = (grips) => (grips ?? []).filter((g) => (grip === null ? !line : g.grip === grip));
  const mounted = wanted(await page.evaluate(gripsOf, [selector]));
  assert.ok(mounted.length > 0, `${line ? 'The selected line' : 'The node of'} ${id} in the view ${viewId} holds no ${grip ? `"${grip}" ` : ''}grip (data-grip), so ${line ? 'its end cannot be dragged' : 'no line can be dragged from it'}: ` +
    'a grip is mounted on a near node, and at each end of a selected line, of a view that draws lines, once lines are drawn by dragging.');
  const shown = await soon(page, async () => { const now = wanted(await page.evaluate(gripsOf, [selector])); return now.length > 0 && now.every((g) => g.shown) ? now : null; },
    `${line ? `With ${what} selected` : `With the pointer on ${what}`}, its ${grip ? `"${grip}" grip does` : 'grips do'} not show (data-grip is hidden).`);
  const found = shown.find((g) => g.free) ?? null;
  if (!found) {
    if (covered === 'null') return null;
    assert.fail(`${grip ? `The "${grip}" grip` : 'Every grip'} of ${what} in the view ${viewId} lies under something else, so the pointer cannot press it: ${shown.map((g) => `${g.grip} under ${g.under}`).join('; ')}.`);
  }
  return { x: found.x, y: found.y, grip: found.grip };
}

/**
 * A drag with real mouse events: the pointer goes to `from`, the main button is pressed, the pointer goes to `to` in
 * `steps` moves, and the button is released. `from` and `to` are points of the window ({ x, y }). `hold`, when given,
 * is awaited with the button still down and the pointer at `to`: for what a test reads while a gesture is in
 * progress. It waits for nothing after the release: a test waits for what the gesture should have done.
 */
export async function dragBetween(page, from, to, { steps = 6, hold } = {}) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  try {
    await page.mouse.move(to.x, to.y, { steps });
    if (hold) await hold();
  } finally {
    await page.mouse.up();
  }
}

/**
 * Opens the right-click palette on a thing a view's body shows (`type` 'el' or 'rel', with its id), or on the body's
 * bare ground (`type` 'ground'), and waits for the menu. Returns the point that was clicked, in the window's px.
 */
export async function rightClickOn(page, viewId, type, id) {
  let at;
  if (type === 'ground') {
    at = await page.evaluate(groundOf, [`:is(${planeOf(viewId)}, ${bodyOf(viewId)})`, `${TAKEN}, [data-thing]`]);
    assert.ok(at, `The body of the view ${viewId} has no bare ground, with room around it, to right-click.`);
  } else {
    at = await pointOn(page, viewId, type, id);
  }
  await page.mouse.click(at.x, at.y, { button: 'right' });
  await soon(page, async () => (await page.locator(byTestId(TESTIDS.palette)).count()) === 1,
    `A right-click on ${type === 'ground' ? 'the ground' : `${type} ${id}`} of the view ${viewId} opened no palette (data-testid "${TESTIDS.palette}").`);
  return at;
}

/**
 * Clicks the entry of an action in the open palette (its data-action is the action's id). With `choice`, the entry
 * opens the action's choices as a second level (data-choices, the action's id), and the entry of that choice
 * (data-choice) is clicked there.
 */
export async function chooseAction(page, actionId, choice) {
  const entry = page.locator(`${byTestId(TESTIDS.palette)} ${actionControl(actionId)}`);
  await soon(page, async () => (await entry.count()) === 1, async () => {
    const open = await page.locator(byTestId(TESTIDS.palette)).count();
    const listed = await page.locator(`${byTestId(TESTIDS.palette)} [data-action]`).evaluateAll((els) => els.map((el) => el.getAttribute('data-action')));
    return open ? `The palette lists no entry for the action ${actionId} (data-action). It lists: ${listed.join(', ') || 'no action'}.` : `No palette is open to choose ${actionId} from.`;
  });
  await entry.click({ timeout: WAIT });
  if (choice === undefined) return;
  const second = page.locator(`[data-choices=${JSON.stringify(actionId)}] [data-choice=${JSON.stringify(choice)}]`);
  await soon(page, async () => (await second.count()) === 1, async () => {
    const offered = await page.locator(`[data-choices=${JSON.stringify(actionId)}] [data-choice]`).evaluateAll((els) => els.map((el) => el.getAttribute('data-choice')));
    return `The entry of ${actionId} offers no choice ${choice} (data-choices "${actionId}", data-choice). It offers: ${offered.join(', ') || 'none'}.`;
  });
  await second.click({ timeout: WAIT });
}

/**
 * The toast that is up: `{ text, said }`, its sentence and the number of its saying (data-said, which grows with
 * each saying, so a new toast is told from the one before it with the same words), or null while none is up. `said`
 * is null for a toast that carries no number.
 */
export const toast = (page) => page.evaluate((selector) => {
  const el = document.querySelector(selector);
  if (!el) return null;
  const said = el.getAttribute('data-said');
  return { text: el.textContent, said: said === null || said === '' || Number.isNaN(Number(said)) ? null : Number(said) };
}, byTestId(TESTIDS.toast));

/** The number of the toast that is up, or 0: what a test keeps before it does something that should say a new one. */
export const saidSoFar = async (page) => (await toast(page))?.said ?? 0;

/**
 * Waits for a toast that was said after the saying numbered `after` (saidSoFar() before the act, or 0), and returns
 * it, `{ text, said }`. `why` says what should have been said, for the failure.
 */
export const toastAfter = (page, after, why) => soon(page, async () => { const now = await toast(page); return now && now.said !== null && now.said > after ? now : null; },
  async () => {
    const now = await toast(page);
    if (now && now.said === null) return `${why}: the toast that is up ("${now.text}") carries no data-said, so it cannot be told from the one before it.`;
    return `${why}: no new toast came up (data-testid "${TESTIDS.toast}", after data-said ${after}). ${now ? `The toast that is up says "${now.text}" (data-said ${now.said}).` : 'No toast is up.'}`;
  });

/**
 * Presses a key as the action table writes it (plan/slice-2.md, section 5): 'Mod+Z', 'Mod+Shift+Z', 'Delete', 'F2',
 * 'Escape', '+', 'ArrowLeft', 'Alt+ArrowUp', or one character for a key that types it. `Mod` is read as Control. A
 * letter is pressed as a keyboard sends it: lower case, upper case with Shift.
 */
export async function pressKey(page, key) {
  const held = [];
  let rest = key;
  for (let found = true; found;) {
    found = false;
    for (const [word, name] of [['Mod', 'Control'], ['Shift', 'Shift'], ['Alt', 'Alt']]) {
      if (rest.startsWith(`${word}+`) && rest.length > word.length + 1) { held.push(name); rest = rest.slice(word.length + 1); found = true; }
    }
  }
  if (/^[A-Za-z]$/.test(rest)) rest = held.includes('Shift') ? rest.toUpperCase() : rest.toLowerCase();
  await page.keyboard.press([...held, rest].join('+'));
}

/**
 * Saves the open file through the download, by Ctrl + S, which saves whether or not anything is unsaved, and gives
 * the saved file's JSON. The page must have been opened with `picker: false` (openIn): with the picker the page
 * writes through the file's handle, which a test cannot read.
 */
export async function saveAndRead(page) {
  // By the clock: a download comes from another process, and frames are not time.
  const downloading = page.waitForEvent('download', { timeout: WAIT });
  await pressKey(page, 'Mod+S');
  const download = await downloading.catch(() => null);
  assert.ok(download, `Ctrl + S downloaded no file in ${WAIT} ms: the page did not save (it saves by a download when it has no file picker).${logged(page)}`);
  return JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
}

/**
 * The text canvas/export.mjs prints for a state (what a state file holds: `{ model, notes, archive }`): the state is
 * written to a file of its own and the script is run on it, as Damon runs it. The script also prints each problem
 * that keeps the text from being correct SysML to stderr, as a line "problem: …", and exits with 1 then: the text is
 * returned all the same. It fails when the script itself fails.
 */
export function exportOf(state) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grasp-export-'));
  try {
    const file = path.join(dir, 'state.json');
    fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n');
    const { status, stdout, stderr } = spawnSync(process.execPath, [EXPORT, file], { encoding: 'utf8' });
    const said = stderr.split('\n').filter((line) => line !== '');
    assert.ok(status === 0 || (status === 1 && said.length > 0 && said.every((line) => /^(problem|note): /.test(line))),
      `canvas/export.mjs failed on the state (exit ${status}):\n${stderr}`);
    return stdout;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * A copy of a state file's JSON with one more note, by the user, on a target: for a test that needs a note before
 * the page can add one. `target` is the id of an element or of a relationship of the state's model (or a picked
 * thing, `{ type, id }`). The note is the last of the copy's `notes`: a record as the old page keeps one (contract 9),
 * with the id `n-test-<no>`, the next number after the state's notes and archive, the target in words as the library
 * says it (labelFor), not resolved, with no response.
 */
export function withNote(state, target, text) {
  const copy = JSON.parse(JSON.stringify(state));
  const id = typeof target === 'string' ? target : target.id;
  const notes = Array.isArray(copy.notes) ? copy.notes : [];
  const no = [...notes, ...(Array.isArray(copy.archive) ? copy.archive : [])].reduce((top, note) => Math.max(top, typeof note?.no === 'number' ? note.no : 0), 0) + 1;
  const targetLabel = lib.labelFor(lib.normalize(JSON.parse(JSON.stringify(copy.model))), id);
  assert.ok(targetLabel, `withNote: the state's model holds no element and no relationship ${id}.`);
  copy.notes = [...notes, {
    id: `n-test-${no}`, no, target: id, targetLabel, text, by: 'user',
    created: '2026-11-14T12:00:00.000Z', updated: '2026-11-14T12:00:00.000Z', response: '', resolved: false,
  }];
  return copy;
}

/** Shows the Notes panel, on the left strip, and returns the locator of what it shows (data-testid "notes"). */
export async function openNotes(page) {
  await showSide(page, 'Notes');
  return page.locator(byTestId(TESTIDS.notes));
}
/** One note's card in the Notes panel, by the note's id (data-testid "note", data-note), as a locator: among the open notes or in the archive's list. */
export const noteIn = (page, id) => page.locator(`${byTestId(TESTIDS.notes)} ${byTestId(TESTIDS.note)}[data-note=${JSON.stringify(id)}]`);
/** A note's pin on what a view's body draws (data-testid "pin", data-note), as a locator; the first, for a note on an element that two nodes stand for. */
export const pinOf = (page, viewId, noteId) => page.locator(`:is(${planeOf(viewId)}, ${bodyOf(viewId)}) ${byTestId(TESTIDS.pin)}[data-note=${JSON.stringify(noteId)}]`).first();
