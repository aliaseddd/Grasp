// Shared by the canvas tests: where the page is, how to open it (in local mode, or in shared mode behind the fake
// window.claude from fake-claude.mjs), the moves a test makes on it, and the waits. Everything here speaks the page's
// DOM contract: the palette's data-tool buttons, g[data-el] and g[data-rel] in svg#drawing, is-selected, the inspector
// fields, #notes-list and the pins, #export and #export-text, #status.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installFakeClaude } from './fake-claude.mjs';

// Playwright is installed globally in this container, where only require() finds it: ESM imports ignore NODE_PATH.
const { chromium } = createRequire(import.meta.url)('playwright');

export const PAGE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
export const PAGE_URL = pathToFileURL(PAGE).href;
/** How long a wait may take, in ms: past the page's 2 s debounced store write, short enough to fail fast. */
export const WAIT = 5000;

export function assertPageExists() {
  assert.ok(fs.existsSync(PAGE), `No canvas page at ${PAGE}. These tests drive canvas/index.html; build it first.`);
}

/** Launches Chromium for a test file, after checking the page is there, so a missing page fails before any browser work. */
export function launch() {
  assertPageExists();
  return chromium.launch();
}

// The page's source, read from disk: the model it embeds and its model library.

export function pageSource() {
  assertPageExists();
  return fs.readFileSync(PAGE, 'utf8');
}

/** The saved model in <script type="application/json" id="model">, parsed. */
export function embeddedModel(source = pageSource()) {
  const match = source.match(/<script\b[^>]*\bid=["']model["'][^>]*>([\s\S]*?)<\/script>/);
  assert.ok(match, 'index.html embeds the saved model in <script type="application/json" id="model">');
  return JSON.parse(match[1]);
}

/** The text of the classic <script id="model-lib">, which sets window.SysMLModel. */
export function modelLibSource(source = pageSource()) {
  const match = source.match(/<script\b[^>]*\bid=["']model-lib["'][^>]*>([\s\S]*?)<\/script>/);
  assert.ok(match, 'index.html holds the model library in <script id="model-lib">');
  return match[1];
}

/** The ids of a model's elements, whether `elements` is an array of {id, ...} or a map keyed by id. */
export function modelElementIds(model) {
  const elements = model?.elements;
  if (Array.isArray(elements)) return elements.map((element) => element.id);
  return elements ? Object.keys(elements) : [];
}

// Opening and closing the page.

/**
 * Opens the page on a fresh browser context (so a fresh localStorage), 1400 x 900. With `shared`, the fake window.claude
 * is installed first, its store holding `seed` (documents by path), and the call returns once the page has read the
 * model from the store: the head of its layout 2, model/current, or a whole model in model/working. `init`, when given,
 * is a function run in the page after the fake is installed and before the page's scripts (to change what the fake
 * says). Dialogs are accepted. Uncaught errors in the page are collected for finish().
 */
export async function openCanvas(browser, { shared = false, seed = {}, init = null } = {}) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('dialog', (dialog) => dialog.accept());
  if (shared) await page.addInitScript(installFakeClaude, seed);
  if (shared && init) await page.addInitScript(init);
  await page.goto(PAGE_URL);
  await page.waitForSelector('#canvas svg#drawing', { state: 'attached', timeout: WAIT });
  if (shared) {
    await until(page, () => window.__store.log.some((entry) =>
      (entry.op === 'get' || entry.op === 'onSnapshot') && (entry.path === 'model/current' || entry.path === 'model/working')),
    null, 'the page reads the model from the store, model/current or model/working (shared mode)');
  }
  return { page, errors };
}

/** Ends a test: the page threw no uncaught error, then it closes. */
export async function finish({ page, errors }) {
  assert.deepEqual(errors, [], 'the page threw no uncaught errors');
  await page.close();
}

/**
 * Waits until predicate(arg), run in the page, is truthy, for up to `timeout` ms. On a timeout it fails with `what`,
 * plus the status line and the fake store's documents when there is one, instead of Playwright's bare timeout.
 */
export async function until(page, predicate, arg, what, timeout = WAIT) {
  try {
    await page.waitForFunction(predicate, arg, { timeout, polling: 50 });
  } catch (error) {
    if (error.name !== 'TimeoutError') throw error;
    const status = await page.textContent('#status').catch(() => '(no #status)');
    const store = await page.evaluate(() => (window.__store ? JSON.stringify(window.__store.dump(), null, 1) : ''));
    const shown = store.length > 20000 ? `${store.slice(0, 20000)}… (${store.length - 20000} more characters)` : store;
    assert.fail(`Waited ${timeout} ms for: ${what}.\n#status: ${status}${store ? `\nstore: ${shown}` : ''}`);
  }
}

// Reading the page.

/**
 * Waits until the page's checks have caught up with the model. They run once the changes pause, as the save does, so a
 * test that reads the problems right after a change (the HUD's #problems, #problems-list, the badges and is-problem)
 * waits for them first; reading them sooner would see the problems from before the change.
 */
export async function checked(page) {
  await until(page, () => !window.SysMLCanvas.state.checkTimer, null, 'the checks catch up with the model');
}

export const viewBox = (page) => page.getAttribute('#drawing', 'viewBox');
export const elementIds = (page) => page.$$eval('g[data-el]', (groups) => groups.map((g) => g.getAttribute('data-el')));
export const relationshipIds = (page) => page.$$eval('g[data-rel]', (groups) => groups.map((g) => g.getAttribute('data-rel')));
/** The id (data-el or data-rel) of what carries is-selected, or null. */
export const selectedId = (page) => page.evaluate(() => {
  const selected = document.querySelector('.is-selected');
  return selected ? selected.getAttribute('data-el') ?? selected.getAttribute('data-rel') : null;
});

/** The zoom shown in #zoom-level, as a number: 100 for "100%". */
export async function zoomLevel(page) {
  const text = await page.textContent('#zoom-level');
  const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
  assert.ok(match, `#zoom-level shows a percentage, not "${text}"`);
  return Number(match[1]);
}

/** Opens the export panel and returns its textual SysML v2. */
export async function exportText(page) {
  await page.click('#export');
  await page.waitForSelector('#export-panel', { state: 'visible', timeout: WAIT });
  await until(page, () => document.querySelector('#export-text')?.value.trim().length > 0, null, '#export-text holds the export');
  return page.inputValue('#export-text');
}

// Moving on the plane.

/** Runs in the page: a point in page pixels with nothing drawn within 170 x 110 of it, inside the visible plane, or null. */
function findEmptyPoint() {
  const canvas = document.getElementById('canvas');
  const svg = document.getElementById('drawing');
  const box = svg.getBoundingClientRect();
  const RX = 170;
  const RY = 110;
  // The panel grows when something is selected, so its whole column counts as taken, not just where it is now.
  const panel = document.getElementById('panel');
  const panelLeft = panel && !panel.hidden ? panel.getBoundingClientRect().left : Infinity;
  const drawn = (x, y) => {
    if (x >= panelLeft) return true;
    const hit = document.elementFromPoint(x, y);
    return !hit || !canvas.contains(hit) || Boolean(hit.closest('[data-el],[data-rel],[data-note],.pin,.problem,.tab,button,input,textarea,select,a'));
  };
  for (let y = Math.max(box.top, 0) + RY + 4; y <= Math.min(box.bottom, innerHeight) - RY - 4; y += 60) {
    for (let x = Math.max(box.left, 0) + RX + 4; x <= Math.min(box.right, innerWidth) - RX - 4; x += 60) {
      let clear = true;
      for (let dy = -RY; dy <= RY && clear; dy += RY / 2) {
        for (let dx = -RX; dx <= RX && clear; dx += RX / 2) if (drawn(x + dx, y + dy)) clear = false;
      }
      if (clear) return { x, y };
    }
  }
  return null;
}

/**
 * Runs in the page: a point in page pixels inside the frame of view `id` (g.frame[data-view]) with nothing drawn
 * within 40 x 30 of it, below the frame's header tab, or null. A click there goes into that view.
 */
function findEmptyPointInFrame(id) {
  const canvas = document.getElementById('canvas');
  const outline = document.querySelector(`#drawing g.frame[data-view="${id}"] > rect.outline`);
  if (!outline) return null;
  const box = outline.getBoundingClientRect();
  const stage = document.getElementById('drawing').getBoundingClientRect();
  const RX = 40;
  const RY = 30;
  const panel = document.getElementById('panel');
  const panelLeft = panel && !panel.hidden ? panel.getBoundingClientRect().left : Infinity;
  const drawn = (x, y) => {
    if (x >= panelLeft) return true;
    const hit = document.elementFromPoint(x, y);
    return !hit || !canvas.contains(hit) || Boolean(hit.closest('[data-el],[data-rel],[data-note],.pin,.problem,.tab,button,input,textarea,select,a'));
  };
  const top = Math.max(box.top, stage.top, 0) + RY + 30;
  const bottom = Math.min(box.bottom, stage.bottom, innerHeight) - RY - 4;
  const left = Math.max(box.left, stage.left, 0) + RX + 4;
  const right = Math.min(box.right, stage.right, innerWidth) - RX - 4;
  for (let y = top; y <= bottom; y += 30) {
    for (let x = left; x <= right; x += 30) {
      let clear = true;
      for (let dy = -RY; dy <= RY && clear; dy += RY) {
        for (let dx = -RX; dx <= RX && clear; dx += RX) if (drawn(x + dx, y + dy)) clear = false;
      }
      if (clear) return { x, y };
    }
  }
  return null;
}

/** A point on the empty plane inside one view's frame, in page pixels; fails when the frame has no room on screen. */
export async function emptyPointIn(page, viewId) {
  const point = await page.evaluate(findEmptyPointInFrame, viewId);
  assert.ok(point, `found an empty spot inside the frame of view ${viewId}`);
  return point;
}

/** A point on the empty plane, in page pixels. When the visible plane is full, wheel-pans down and looks again. */
export async function emptyPoint(page) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const point = await page.evaluate(findEmptyPoint);
    if (point) return point;
    const canvas = await page.locator('#canvas').boundingBox();
    await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
    await page.mouse.wheel(0, 600);
  }
  assert.fail('found no empty spot on the plane to click, even after panning down six times');
}

/** Clicks an element, off its centre so an edge drawn centre to centre is not what gets hit. */
export async function clickElement(page, id) {
  const group = page.locator(`g[data-el="${id}"]`).first();
  const box = await group.boundingBox();
  assert.ok(box, `element ${id} has a bounding box`);
  await group.click({ position: { x: box.width * 0.35, y: box.height * 0.35 } });
}

/** Arms an element tool and clicks the plane (an empty spot, or `point`), returning the new element's id. */
export async function placeElement(page, tool, point) {
  const before = await elementIds(page);
  await page.click(`.palette button[data-tool="${tool}"]`);
  const { x, y } = point ?? await emptyPoint(page);
  await page.mouse.click(x, y);
  await until(page, (count) => document.querySelectorAll('g[data-el]').length > count, before.length, `a ${tool} appears after placing it`);
  const added = (await elementIds(page)).filter((id) => !before.includes(id));
  assert.equal(added.length, 1, `placing a ${tool} added one element, not ${JSON.stringify(added)}`);
  return added[0];
}

/** Arms a relationship tool, clicks the source element then the target, and returns the new edge's id. */
export async function drawRelationship(page, tool, sourceId, targetId) {
  const before = await relationshipIds(page);
  await page.click(`.palette button[data-tool="${tool}"]`);
  await clickElement(page, sourceId);
  await clickElement(page, targetId);
  await until(page, (count) => document.querySelectorAll('g[data-rel]').length > count, before.length, `a ${tool} edge appears after drawing it`);
  await page.keyboard.press('Escape'); // in case the tool stays armed for another edge; the contract leaves that open
  const added = (await relationshipIds(page)).filter((id) => !before.includes(id));
  assert.equal(added.length, 1, `drawing a ${tool} added one edge, not ${JSON.stringify(added)}`);
  return added[0];
}

/** Types a new name into the inspector for the selected element and waits for the drawing to show it. */
export async function rename(page, id, name) {
  await page.fill('#f-name', name);
  await until(page, ([elementId, newName]) => document.querySelector(`g[data-el="${elementId}"]`)?.textContent.includes(newName),
    [id, name], `the drawing shows ${id} renamed to "${name}"`);
}

/** Adds a note on the selection and returns its id, once its li and pin are there. */
export async function addNote(page) {
  const before = await page.$$eval('#notes-list li[data-note]', (items) => items.map((li) => li.getAttribute('data-note')));
  await page.click('#add-note');
  await until(page, (count) => document.querySelectorAll('#notes-list li[data-note]').length > count, before.length, 'a note appears in #notes-list');
  const ids = await page.$$eval('#notes-list li[data-note]', (items) => items.map((li) => li.getAttribute('data-note')));
  const added = ids.filter((id) => !before.includes(id));
  assert.equal(added.length, 1, `adding a note added one li, not ${JSON.stringify(added)}`);
  return added[0];
}

// The fake store, from the test's side.

export const storeDoc = (page, docPath) => page.evaluate((p) => window.__store.get(p), docPath);
export const storeDump = (page) => page.evaluate(() => window.__store.dump());

/**
 * The model the fake store holds, assembled from its documents in the page with the page's own library
 * (SysMLModel.readStore): the head model/current and the parts it names, or a whole model in model/working, which the
 * page takes first. null while the store holds none, or a head whose parts aren't all there.
 */
export const storedModel = (page) => page.evaluate(() => {
  try { return window.SysMLModel.readStore(window.__store.dump()).model; } catch (error) { return null; }
});

/** Waits until the model the store holds (storedModel) passes `check`, run here in Node, and returns it. */
export async function untilStored(page, check, what, timeout = WAIT) {
  const end = Date.now() + timeout;
  for (;;) {
    const model = await storedModel(page);
    if (model && check(model)) return model;
    if (Date.now() > end) {
      const status = await page.textContent('#status').catch(() => '(no #status)');
      assert.fail(`Waited ${timeout} ms for: ${what}.\n#status: ${status}\nthe store's model: ${JSON.stringify(model)?.slice(0, 20000)}`);
    }
    await page.waitForTimeout(50);
  }
}

// Helpers a slice's tests share with no other, one region per slice.

// The scale tests': taking a big model in, looking at one of its elements, and timing what a person does to it. The
// models come from scale-model.mjs.

/** How long a scale test waits for the page to take a model in or to answer one event, in ms. */
export const SCALE_WAIT = 60000;

/** Imports `state` through Import state, as a file named `name`, and waits for the page to say it imported it. */
export async function importLarge(page, state, name = 'scale.json') {
  await page.setInputFiles('#import-file', { name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(state)) });
  await until(page, () => /^Imported /.test(document.querySelector('#status')?.textContent || ''), null, `the page says it imported ${name}`, SCALE_WAIT);
}

/**
 * Puts the camera at 100% with element `id`, as view `viewId` draws it, in the middle of the window, where a person
 * would have zoomed and panned to before clicking it.
 */
export async function lookAt(page, viewId, id) {
  // Where the view lays the element out, which is where it is drawn once the window shows it: the page draws only
  // what the window shows, so the element may not be drawn yet.
  const found = await page.evaluate(([view, el]) => {
    const C = window.SysMLCanvas;
    const L = C.viewLayout(view);
    const r = L ? L.rects.get(el) : null;
    if (!r) return false;
    C.state.camera = Object.assign({}, C.state.camera, { k: 1 });
    C.showPoint(r.x + r.w / 2, r.y + r.h / 2);
    return !!document.querySelector(`#drawing g.frame[data-view="${view}"] g[data-el="${el}"] > rect.outline`);
  }, [viewId, id]);
  assert.ok(found, `view ${viewId} draws ${id}`);
}

/**
 * Starts timing one kind of event in the page, as a person meets it. A sample is { script, frame, total }, in ms: the
 * script's time runs from when `first` reaches the window (its capture, before any of the page's listeners) to when
 * `last` has been through them (its bubble back to the window), so for a keystroke from keydown to the end of the
 * input event, for a drag move the one pointermove; the frame's time is the main thread's work for the frame that
 * follows, from its animation callbacks until it is painted; total is the two. The wait for the frame to begin isn't
 * counted. Returns time(act), which runs act, a Playwright action that sends one such event, and resolves its sample.
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
