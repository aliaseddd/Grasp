// How fast the page answers, for the planes' step of slice 1 (criterion 6's parts): the page opens, the example is
// drawn, a switch between two tabs. Each is timed INSIDE the page, by a script of the test's own, and judged by the
// median of its samples. The page keeps no mark for the tests.

import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  boxOf, closePages, EXAMPLE, fieldIn, finish, FRAMES, headerOf, launch, linesOf, measure, modelOf, moveTiming, nodeOf, openPage, openStateFile, planeOf, selectBox, sinceGiven, soon, stateFileAt, TEN, timing, untilDrawn, viewTab,
  withInit,
} from './helpers.mjs';

const READY_LIMIT = 500; // ms, from the navigation's start to the first painted frame with the top bar
const DRAWN_LIMIT = 1000; // ms, from the file being given to the painted frame that holds its nodes and its lines
const DRAG_LIMIT = 16; // ms, from the pointermove to the painted frame that holds Host moved by it
const KEY_LIMIT = 16; // ms, from the keydown reaching the window to the end of the input event, plus the frame that follows
const SWITCH_LIMIT = 100; // ms, from the pointerdown on a tab to the painted frame that holds the other view's plane

/** Runs in the page before its scripts: records, in window.__ready, when the first frame with the top bar was painted. */
function recordReady() {
  const look = () => {
    if (!document.querySelector('[data-testid="top-bar"]')) return false;
    requestAnimationFrame(() => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => { window.__ready = performance.now(); };
      channel.port2.postMessage(null);
    });
    return true;
  };
  if (!look()) {
    new MutationObserver((_, observer) => { if (look()) observer.disconnect(); }).observe(document, { childList: true, subtree: true });
  }
}

/**
 * Runs in the page: from now on, notes in window.__drawn when a painted frame holds `nodes` nodes and `edges` edges of
 * the plane `plane`: the DOM is looked at after each change, and the time taken from the message that follows the
 * frame's animation callbacks, which is after that frame is painted.
 */
function watchDrawn([plane, nodes, edges]) {
  const note = (window.__watch = { at: null, pending: false });
  const full = () => document.querySelectorAll(`${plane} .react-flow__node`).length >= nodes && document.querySelectorAll(`${plane} .react-flow__edge`).length >= edges;
  new MutationObserver(() => {
    if (note.at !== null || note.pending || !full()) return;
    note.pending = true;
    requestAnimationFrame(() => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => { note.at = performance.now(); };
      channel.port2.postMessage(null);
    });
  }).observe(document, { childList: true, subtree: true });
}

/**
 * Runs in the page, once: the clock of a switch of tab. `window.__switch.arm(plane, nodes, edges)` starts waiting for a
 * pointerdown; it starts the clock (the capture on the window, before any listener of the page's), and the clock stops
 * at the painted frame in which the plane holds that many nodes and edges.
 */
function watchSwitch() {
  const s = (window.__switch = { target: null, start: null, at: null, pending: false });
  s.arm = (plane, nodes, edges) => { Object.assign(s, { target: [plane, nodes, edges], start: null, at: null, pending: false }); };
  const full = () => {
    const [plane, nodes, edges] = s.target;
    return document.querySelectorAll(`${plane} .react-flow__node`).length >= nodes && document.querySelectorAll(`${plane} .react-flow__edge`).length >= edges;
  };
  const look = () => {
    if (!s.target || s.start === null || s.at !== null || s.pending || !full()) return;
    s.pending = true;
    requestAnimationFrame(() => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => { s.at = performance.now(); };
      channel.port2.postMessage(null);
    });
  };
  addEventListener('pointerdown', () => { if (s.target && s.start === null) s.start = performance.now(); }, true);
  new MutationObserver(look).observe(document, { childList: true, subtree: true });
}

/**
 * The verdict of one measure: its median must be under `limit`. Passing or failing, the test says its median and its
 * samples (a `#` line of the runner's output), so that a run of the whole suite shows what the other files cost it.
 */
const verdict = (t, m, limit, what) => {
  t.diagnostic(`${what}: median ${m.median.toFixed(1)} ms of ${m.samples.length} samples (${m}), limit ${limit} ms`);
  assert.ok(m.median < limit,
    `${what}: the median of ${m.samples.length} samples is ${m.median.toFixed(1)} ms, not under ${limit} ms. The samples, in ms: ${m}.`);
};

describe('how fast the page answers', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('the page is ready in under 500 ms', async (t) => {
    const m = measure(5, READY_LIMIT);
    while (!m.settled) {
      const opened = await openPage(withInit(browser, recordReady));
      const { page } = opened;
      await soon(page, () => page.evaluate(() => typeof window.__ready === 'number'), `No frame with the top bar (data-testid "top-bar") was painted. Samples so far, in ms: ${m}.`, 3 * FRAMES);
      m.add({ total: await page.evaluate(() => window.__ready) });
      await finish(opened);
    }
    verdict(t, m, READY_LIMIT, 'From the start of the navigation to the first painted frame with the top bar');
  });

  test('the example is drawn within 1 s of the file being given', async (t) => {
    const model = modelOf(EXAMPLE);
    const view = model.views[0];
    const nodes = Object.keys(view.layout).length;
    const edges = linesOf(model, view).length;
    const m = measure(5, DRAWN_LIMIT);
    while (!m.settled) {
      const opened = await openPage(browser, { picker: false });
      const { page } = opened;
      await page.evaluate(watchDrawn, [planeOf(view.id), nodes, edges]);
      await openStateFile(page, stateFileAt(EXAMPLE));
      await soon(page, () => page.evaluate(() => window.__watch.at !== null), async () => {
        const held = await page.evaluate(([plane]) => [document.querySelectorAll(`${plane} .react-flow__node`).length, document.querySelectorAll(`${plane} .react-flow__edge`).length], [planeOf(view.id)]);
        return `${await sinceGiven(page) | 0} ms after the page was given the example, its plane holds ${held[0]} nodes and ${held[1]} edges, not ${nodes} and ${edges}. Samples so far, in ms: ${m}.`;
      }, 3 * FRAMES);
      const [at, given] = await page.evaluate(() => [window.__watch.at, performance.getEntriesByName('grasp-test:given').pop().startTime]);
      m.add({ total: at - given });
      await finish(opened);
    }
    verdict(t, m, DRAWN_LIMIT, `From the example being given to the painted frame with its ${nodes} nodes and ${edges} lines`);
  });

  test('a switch between the two tabs of the interconnection fixture takes under 100 ms', async (t) => {
    const file = TEN.find((name) => name.endsWith('interconnection.json'));
    const model = modelOf(file);
    const views = model.views;
    assert.equal(views.length, 2, 'interconnection.json has two views.');
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await openStateFile(page, stateFileAt(file));
    const tabs = [];
    for (const view of views) tabs.push(await viewTab(page, view));
    await soon(page, () => page.evaluate((plane) => document.querySelectorAll(`${plane} .react-flow__node`).length > 0, planeOf(views[0].id)),
      `No plane shows ${views[0].name}: its tab has nothing drawn on it.`);
    await page.evaluate(watchSwitch);
    const m = measure(9, SWITCH_LIMIT);
    for (let i = 0; !m.settled; i++) {
      const to = views[(i + 1) % 2];
      const edges = linesOf(model, to).length;
      await page.evaluate(([plane, nodes, lines]) => window.__switch.arm(plane, nodes, lines), [planeOf(to.id), Object.keys(to.layout).length, edges]);
      await tabs[(i + 1) % 2].click();
      await soon(page, () => page.evaluate(() => window.__switch.at !== null), async () => {
        const held = await page.evaluate((plane) => [document.querySelectorAll(`${plane} .react-flow__node`).length, document.querySelectorAll(`${plane} .react-flow__edge`).length], planeOf(to.id));
        return `After the pointerdown on the tab of ${to.name}, its plane holds ${held[0]} nodes and ${held[1]} edges, not ${Object.keys(to.layout).length} and ${edges}. Samples so far, in ms: ${m}.`;
      }, 3 * FRAMES);
      const [at, start] = await page.evaluate(() => [window.__switch.at, window.__switch.start]);
      m.add({ total: at - start });
    }
    await finish(opened);
    verdict(t, m, SWITCH_LIMIT, 'From the pointerdown on a tab to the painted frame with the other view\'s nodes and lines');
  });

  // Host of the example is dragged by moves of a few px; each move is a sample, from the pointermove to the painted frame.
  test('a drag step of the example takes under 16 ms', async (t) => {
    const view = modelOf(EXAMPLE).views[0];
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await openStateFile(page, stateFileAt(EXAMPLE));
    await viewTab(page, view);
    await untilDrawn(page, view);
    const time = await moveTiming(page);
    const was = await boxOf(page, view.id, 'Host');
    const app = await boxOf(page, view.id, 'App');
    const step = { x: 4, y: 2 };
    const m = measure(9, DRAG_LIMIT);
    const from = headerOf(was);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    // The first move, which may only tell a drag from a click, is not a sample.
    await page.mouse.move(from.x + 6, from.y + 3);
    const at = { x: from.x + 6, y: from.y + 3 };
    for (let i = 0; i < 9; i++) {
      at.x += step.x;
      at.y += step.y;
      m.add(await time(() => page.mouse.move(at.x, at.y)));
    }
    await page.mouse.up();
    // Host moved against App: the offset between them changed by what was dragged (a pan moves both, and changes nothing).
    const offset = async () => {
      const [h, a] = [await boxOf(page, view.id, 'Host'), await boxOf(page, view.id, 'App')];
      return h && a ? { x: h.x - a.x, y: h.y - a.y } : null;
    };
    const before = { x: was.x - app.x, y: was.y - app.y };
    const dragged = { x: 9 * step.x, y: 9 * step.y };
    const now = await soon(page, async () => {
      const o = await offset();
      return o && o.x - before.x >= dragged.x - 1.5 && o.y - before.y >= dragged.y - 1.5 ? o : null;
    }, async () => {
      const o = await offset();
      return `The mouse dragged Host ${dragged.x} by ${dragged.y} px or more, and Host's offset from App changed by ${o ? `${(o.x - before.x).toFixed(1)} by ${(o.y - before.y).toFixed(1)}` : 'nothing: it is off the plane'} px: the drag did not move Host against App.`;
    });
    assert.ok(now);
    verdict(t, m, DRAG_LIMIT, 'A step of a drag of Host');
    await finish(opened);
  });

  // Host's name is typed after, a letter at a time, in the name field of Details; each keystroke is a sample.
  test('a keystroke in a name of the example takes under 16 ms', async (t) => {
    const view = modelOf(EXAMPLE).views[0];
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await openStateFile(page, stateFileAt(EXAMPLE));
    await viewTab(page, view);
    await untilDrawn(page, view);
    await selectBox(page, view, 'Host');
    const name = fieldIn(page, 'name');
    await soon(page, async () => (await name.count()) > 0,
      'Details shows no name field for Host, picked (data-testid "field-name" in "details").');
    const time = await timing(page, 'keydown', 'input');
    const m = measure(9, KEY_LIMIT);
    await name.click();
    await page.keyboard.press('End');
    let typed = 'Host';
    for (let i = 0; i < 9; i++) {
      const letter = String.fromCharCode(97 + i);
      m.add(await time(() => page.keyboard.press(letter)));
      typed += letter;
    }
    assert.equal(await name.inputValue(), typed, 'every keystroke reached the name field');
    const shown = await soon(page, async () => {
      const text = await page.locator(`${nodeOf(view.id, 'Host')} .grasp-node-name`).first().textContent();
      return text.includes(typed) ? text : null;
    }, `The box of Host does not read the name typed into Details, ${typed}.`);
    assert.ok(shown.includes(typed));
    verdict(t, m, KEY_LIMIT, 'A keystroke in the name of Host');
    await page.keyboard.press('Tab');
    await finish(opened);
  });
});
