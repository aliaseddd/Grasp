// The planes at scale: the last four of slice 1's "Done when" checks, on the model of 5,000 elements in three views
// that canvas/test/scale-model.mjs generates, and two tests of what step 8 changes. They were written in step 3,
// before what they check. Step 8 took the marks off the opening and the drag step. The pan step's mark is back on, with
// its numbers: with every change of step 8 in, the action flow view's pan step stays over the limit on this machine,
// and the limit goes to Damon (plan/notes.md, session 25). The keystroke's mark stays until step 10 builds Details.
//
// The model is opened through the file input, as a person opens it. A step is timed as the old page's scale tests
// time it, inside the page: the script's time from the event reaching the window to the end of its listeners, plus
// the main thread's work for the frame that follows. A keystroke is timed from keydown to the end of the input event
// (helpers.mjs, timing), and a step of a drag or of a pan from its pointermove to the animation callbacks of the frame
// that handles it (moveTiming, which says why). The first step of a gesture does more than the ones that follow it,
// so the two are measured apart, and the median of each must be under the limit.

import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';
import { VIEWS, middleService, scaleState } from '../../test/scale-model.mjs';
import {
  boxOf, byTestId, closePages, EDGE, finish, launch, measure, moveTiming, NODE, nodeOf, openPage, openStateFile, planeOf, selectBox,
  sinceGiven, soon, stateFileOf, TESTIDS, timing, untilDrawn, viewTab, frame, zoomTo,
} from './helpers.mjs';

const ELEMENTS = 5000;
const STATE = scaleState(ELEMENTS);
const FILE = stateFileOf(`scale-${ELEMENTS}.json`, STATE);
const VIEW = Object.fromEntries(Object.entries(VIEWS).map(([name, id]) => [name, STATE.model.views.find((view) => view.id === id)]));
/** The service in the middle of the model, and a box of it in each view with nothing drawn over its middle. */
const SERVICE = middleService(ELEMENTS);
const NUMBER = SERVICE.slice('Service'.length);
const BOX = { [VIEWS.definitions]: SERVICE, [VIEWS.deployment]: `Site${NUMBER}.service`, [VIEWS.workflows]: `Handle${NUMBER}.receive` };

const OPEN_LIMIT = 5000; // ms, from the page being given the file to its first tab drawn
const STEP_LIMIT = 16;   // ms, a frame: one step of a drag or of a pan
const KEY_LIMIT = 50;    // ms, one keystroke
const DRAGS = 3;         // drags of a box, and pans of each view
const MOVES = 4;         // moves in each
const START = [3, 2];    // screen px of the first move, which starts the pan
// screen px of a drag's first move: at least the store's click distance (4 px, the larger axis, at 100%), so that it
// starts the drag and draws it; a first move under it draws nothing, and a drag's first drawn step would be timed as
// one that follows (session 25, from step 8's review)
const DRAG_START = [6, 3];
const STEP = [12, 6];    // screen px of each move that follows it
const NAMES = 3;         // names typed, each one undo step
const KEYS = 3;          // keystrokes in each name

/** Opens the page and the model in it. */
async function openModel(browser) {
  const opened = await openPage(browser, { picker: false });
  await openStateFile(opened.page, FILE);
  return opened;
}

/** Brings a view's tab to the front and waits until its plane draws every element the view places. */
async function showView(page, view) {
  const tab = await viewTab(page, view);
  if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
  await untilDrawn(page, view);
}

/**
 * Brings a view's plane to 100% on an element, as a person does before working on a box: with the pointer on it, the
 * wheel turned with Ctrl held until the box is drawn at its own size. Returns where it is drawn then. How far a turn
 * of the wheel zooms is d3's figure to begin with, and then what the plane was seen to do.
 */
async function lookAt(page, view, id) {
  let box = await boxOf(page, view.id, id);
  assert.ok(box, `The fitted plane of ${view.name} draws no node for ${id}.`);
  let rate = 0.002; // the power of 2 that 1 px of the wheel zooms by
  await page.keyboard.down('Control');
  try {
    for (let turn = 0; turn < 8 && Math.abs(box.zoom - 1) > 0.01; turn++) {
      const was = box;
      const delta = Math.max(-1500, Math.min(1500, Math.log2(was.zoom) / rate));
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
  assert.ok(Math.abs(box.zoom - 1) <= 0.01, `Ctrl and the wheel did not bring the plane of ${view.name} to 100% on ${id}: it is at ${(box.zoom * 100).toFixed(1)}%.`);
  const inside = await page.evaluate(([plane, node]) => {
    const p = document.querySelector(plane).getBoundingClientRect();
    const n = document.querySelector(node).getBoundingClientRect();
    return n.left >= p.left && n.right <= p.right && n.top >= p.top && n.bottom <= p.bottom;
  }, [planeOf(view.id), nodeOf(view.id, id)]);
  assert.ok(inside, `${id}, at 100%, is not wholly on the plane of ${view.name}.`);
  return box;
}

/** Runs in the page: a point of a plane's bare ground, with room around it for a drag, or null. */
function groundOf([plane, taken]) {
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
/** What lies on a plane's ground: its nodes, its edges, and React Flow's panels (the zoom buttons, the minimap). */
const TAKEN = `${NODE}, ${EDGE}, .react-flow__panel, button, input, a`;

/** How far the pointer goes in one gesture, in px along each axis. */
const reachOf = (start) => [start[0] + (MOVES - 1) * STEP[0], start[1] + (MOVES - 1) * STEP[1]];
const REACH = reachOf(START);
const DRAG_REACH = reachOf(DRAG_START);

/**
 * One gesture with the mouse, each of its steps timed: a press at `from`, a move of START, MOVES - 1 moves of STEP
 * each, forward or back (`way`, 1 or -1), and a release. The first move, which starts the drag or the pan, is a
 * sample of `starting`; the others are samples of `following`.
 */
async function gesture(page, time, from, way, starting, following, start = START) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  const at = { x: from.x, y: from.y };
  for (let m = 0; m < MOVES; m++) {
    const [dx, dy] = m ? STEP : start;
    at.x += way * dx;
    at.y += way * dy;
    (m ? following : starting).add(await time(() => page.mouse.move(at.x, at.y)));
  }
  await page.mouse.up();
}

/**
 * Waits until an element is drawn where a gesture took it from `was`, and fails with `missing(went)` when it is not:
 * as far as the pointer went, or short of that by the first move, since a plane may take its first move only to tell
 * a drag from a click. `went` is how far it is from where it was, in px along the gesture's way, or null.
 */
function moved(page, view, id, was, way, missing, apart = null, start = START) {
  const reach = reachOf(start);
  const went = (now) => (now ? [(now.x - was.x) * way, (now.y - was.y) * way] : null);
  const there = (now) => !!now && went(now).every((far, axis) => far >= reach[axis] - start[axis] - 1.5 && far <= reach[axis] + 1.5);
  // With `apart` ({ id, was }: a node that was not dragged, and where it was), the box must also have moved against it,
  // so that a pan of the whole plane, which takes both, does not pass.
  const against = async (now) => {
    if (!apart) return now;
    const other = await boxOf(page, view.id, apart.id);
    return other && now && [(now.x - other.x) - (was.x - apart.was.x), (now.y - other.y) - (was.y - apart.was.y)]
      .every((far, axis) => far * way >= reach[axis] - start[axis] - 1.5 && far * way <= reach[axis] + 1.5) ? now : null;
  };
  return soon(page, async () => { const now = await boxOf(page, view.id, id); return there(now) ? against(now) : null; },
    async () => {
      const now = await boxOf(page, view.id, id);
      const other = apart && await boxOf(page, view.id, apart.id);
      const by = other && now ? ` Against ${apart.id}, which was not dragged, it went ${px([((now.x - other.x) - (was.x - apart.was.x)) * way, ((now.y - other.y) - (was.y - apart.was.y)) * way])}: a plane that pans takes both.` : '';
      return missing(went(now)) + by;
    });
}
/**
 * A box of the view, drawn on the screen, that a drag of `id` does not take along (not inside it, not around it), and
 * where it is: what the dragged box is moved against.
 */
async function neighbourOf(page, view, id) {
  const ids = await page.evaluate(([plane, node]) => [...document.querySelectorAll(`${plane} ${node}`)].map((el) => el.getAttribute('data-id')), [planeOf(view.id), NODE]);
  const other = ids.find((n) => n !== id && !n.startsWith(id + '.') && !id.startsWith(n + '.') && !id.startsWith(n));
  assert.ok(other, `The plane of ${view.name} draws no other box than ${id} to tell a drag from a pan by.`);
  const was = await boxOf(page, view.id, other);
  return { id: other, was };
}
const px = (pair) => (pair ? `${pair[0].toFixed(1)} by ${pair[1].toFixed(1)} px` : 'off the plane');

const ms = (value) => `${value.toFixed(1)} ms`;
/** Reports a test's times, a line of the runner's output each. */
const report = (t, said) => said.split('\n').forEach((line) => t.diagnostic(line));
/** Ends a measure: its times are reported when they are under the limit, and are the failure's message when not. */
const hold = (t, held, said) => (held ? report(t, said) : assert.fail(said));

describe('the planes at scale', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  // The model opens: its three views are on three tabs, and the first is drawn, within OPEN_LIMIT of the page being
  // given the file. Then each tab in turn, fitted, draws every element its view places and answers a click on one.
  test('a 5,000-element model opens', async (t) => {
    const views = STATE.model.views;
    assert.equal(STATE.model.elements.length, ELEMENTS);
    assert.equal(views.reduce((sum, view) => sum + Object.keys(view.layout).length, 0), ELEMENTS, 'the three views place every element between them');

    const opened = await openModel(browser);
    const { page } = opened;
    for (const view of views) await viewTab(page, view);
    await untilDrawn(page, views[0]);
    const opening = await sinceGiven(page);
    report(t, `The model of ${ELEMENTS} elements opened in ${ms(opening)}, from the page being given the file to ${views[0].name} drawn.`);

    for (const view of views) {
      const start = performance.now();
      await showView(page, view);
      report(t, `${view.name} drew its ${Object.keys(view.layout).length} elements ${ms(performance.now() - start)} after its tab was asked for.`);
      // A click on a box, in the middle of it, selects it, or a box around it if that is what the plane selects from afar.
      const id = BOX[view.id];
      const box = await boxOf(page, view.id, id);
      assert.ok(box, `The plane of ${view.name} draws no node for ${id}.`);
      const at = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      await page.mouse.click(at.x, at.y);
      await soon(page, () => page.evaluate(([selector, x, y]) => [...document.querySelectorAll(selector)].some((node) => {
        const r = node.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      }), [`${planeOf(view.id)} ${NODE}.selected`, at.x, at.y]),
      `The tab of ${view.name} does not answer a click: ${id} was clicked, and no box under the pointer is selected.`);
    }
    assert.ok(opening < OPEN_LIMIT, `The model of ${ELEMENTS} elements took ${ms(opening)} to open, against ${OPEN_LIMIT} ms.`);
    await finish(opened);
  });

  // A box of the general view, at 100%, is dragged three times, there and back and there again, four moves each.
  test('a drag step takes under 16 ms at 5,000 elements in 3 views', async (t) => {
    const view = VIEW.definitions;
    const id = SERVICE;
    const opened = await openModel(browser);
    const { page } = opened;
    await showView(page, view);
    await lookAt(page, view, id);

    const time = await moveTiming(page);
    const starting = measure(DRAGS, STEP_LIMIT);
    const following = measure(DRAGS * (MOVES - 1), STEP_LIMIT);
    for (let drag = 0; drag < DRAGS && !(starting.settled && following.settled); drag++) {
      const was = await boxOf(page, view.id, id);
      const apart = await neighbourOf(page, view, id);
      const way = drag % 2 ? -1 : 1; // there and back, so the box stays in its cell
      // The box is taken by the blank left end of its header, clear of its name, its compartments and its handles.
      await gesture(page, time, { x: was.x + 24 * was.zoom, y: was.y + 14 * was.zoom }, way, starting, following, DRAG_START);
      await moved(page, view, id, was, way, (went) => `Not every move reached ${id}: the pointer dragged it ${px(DRAG_REACH)}, and it went ${px(went)}.`, apart, DRAG_START);
    }
    const said = `A drag step takes ${ms(starting.median)} when it starts a drag and ${ms(following.median)} when it follows one, by the median, ` +
      `against ${STEP_LIMIT} ms.\nStarting, in ms: ${starting}\nFollowing, in ms: ${following}`;
    hold(t, starting.median < STEP_LIMIT && following.median < STEP_LIMIT, said);
    await finish(opened);
  });

  // Three names of three letters each are typed after the name of a selected box, in the name field of Details.
  test('a keystroke in a name takes under 50 ms at 5,000 elements', { todo: 'step 10 builds Details' }, async (t) => {
    const view = VIEW.definitions;
    const id = SERVICE;
    const opened = await openModel(browser);
    const { page } = opened;
    await showView(page, view);
    await lookAt(page, view, id);
    await selectBox(page, view, id);
    const field = byTestId(TESTIDS.field('name'));
    const name = page.locator(byTestId(TESTIDS.details)).locator(`input${field}, textarea${field}, ${field} input, ${field} textarea`).first();
    await soon(page, async () => (await name.count()) > 0,
      `Details shows no name field for ${id}, selected (data-testid "${TESTIDS.field('name')}" in "${TESTIDS.details}").`);
    let typed = await name.inputValue();
    assert.equal(typed, id, `the name field holds the name of ${id}`);

    const time = await timing(page, 'keydown', 'input');
    const opening = measure(NAMES, KEY_LIMIT);
    const joining = measure(NAMES * (KEYS - 1), KEY_LIMIT);
    for (let n = 0; n < NAMES && !(opening.settled && joining.settled); n++) {
      await name.click();
      await page.keyboard.press('End');
      for (let k = 0; k < KEYS; k++) {
        const letter = String.fromCharCode(97 + n * KEYS + k);
        (k ? joining : opening).add(await time(() => page.keyboard.press(letter)));
        typed += letter;
      }
      await page.keyboard.press('Tab'); // leaving the field ends the name's undo step
    }
    assert.equal(await name.inputValue(), typed, 'every keystroke reached the name field');
    const shown = await page.textContent(nodeOf(view.id, id));
    assert.ok(shown.includes(typed), `The box of ${id} reads "${shown}", not the name typed into Details, ${typed}.`);
    const said = `A keystroke takes ${ms(opening.median)} when it opens a name's undo step and ${ms(joining.median)} when it joins one, by the median, ` +
      `against ${KEY_LIMIT} ms.\nOpening, in ms: ${opening}\nJoining, in ms: ${joining}`;
    hold(t, opening.median < KEY_LIMIT && joining.median < KEY_LIMIT, said);
    await finish(opened);
  });

  // Each view in turn, fitted to its tab as it opens, is panned by its ground three times, there and back and there
  // again, four moves each. Every view must hold the limit: the action flow view has the most boxes and lines.
  test('a pan step of a fitted view takes under 16 ms at 5,000 elements', {
    todo: 'with step 8 built, definitions and deployment hold (9 to 12 ms) but workflows, 2,112 nodes fitted at 4.3%, ' +
      'takes 17.8 to 23.4 ms starting and 18.1 to 19.4 ms following, by the median of three runs alone (plan/notes.md, session 25): ' +
      'the limit is Damon\'s to restate or to keep',
  }, async (t) => {
    const opened = await openModel(browser);
    const { page } = opened;
    const time = await moveTiming(page);
    const said = [];
    let held = true;
    for (const view of STATE.model.views) {
      await showView(page, view);
      const id = BOX[view.id];
      const fitted = await boxOf(page, view.id, id);
      const percent = fitted ? `${(fitted.zoom * 100).toFixed(1)}%` : 'no zoom at all';
      assert.ok(fitted && fitted.zoom < 0.25, `The plane of ${view.name} is not at the far zoom that fits its view as it opens: ${id} is drawn at ${percent}.`);
      const starting = measure(DRAGS, STEP_LIMIT);
      const following = measure(DRAGS * (MOVES - 1), STEP_LIMIT);
      for (let pan = 0; pan < DRAGS && !(starting.settled && following.settled); pan++) {
        const ground = await page.evaluate(groundOf, [planeOf(view.id), TAKEN]);
        assert.ok(ground, `The fitted plane of ${view.name} has no bare ground to pan it by.`);
        const was = await boxOf(page, view.id, id);
        const way = pan % 2 ? -1 : 1;
        await gesture(page, time, ground, way, starting, following);
        await moved(page, view, id, was, way,
          (went) => `The ground of ${view.name} was dragged ${px(REACH)}, and the plane did not go with it: ${id} went ${px(went)}.`);
      }
      held = held && starting.median < STEP_LIMIT && following.median < STEP_LIMIT;
      said.push(`A pan step of ${view.name}, fitted at ${percent}, takes ${ms(starting.median)} when it starts a pan and ${ms(following.median)} ` +
        `when it follows one, by the median, against ${STEP_LIMIT} ms.\nStarting, in ms: ${starting}\nFollowing, in ms: ${following}`);
    }
    hold(t, held, said.join('\n'));
    await finish(opened);
  });

  // The workflow view, fitted and far, draws no line; at 100% on a box it draws the lines near it; far again, none.
  test("a large view draws no line while it is far, and its lines at 100%", async () => {
    const view = VIEW.workflows;
    const id = BOX[view.id];
    const edges = (p) => p.evaluate((sel) => document.querySelectorAll(`${sel} ${'.react-flow__edge'}`).length, planeOf(view.id));
    const opened = await openModel(browser);
    const { page } = opened;
    await showView(page, view);
    const fitted = await boxOf(page, view.id, id);
    const percent = fitted ? `${(fitted.zoom * 100).toFixed(1)}%` : 'no zoom at all';
    const far = await edges(page);
    assert.equal(far, 0, `The fitted plane of ${view.name}, at ${percent}, draws ${far} lines: a large view draws none while it is far.`);
    await lookAt(page, view, id);
    const edge = `${planeOf(view.id)} ${EDGE}[data-id=${JSON.stringify(`s-Handle${NUMBER}-receive-split`)}]`;
    await soon(page, async () => (await page.locator(edge).count()) > 0,
      `The plane of ${view.name}, at 100% on ${id}, draws no line s-Handle${NUMBER}-receive-split.`);
    const near = await edges(page);
    assert.ok(near >= 1 && near < 200, `The plane of ${view.name} at 100% draws ${near} lines, not at least 1 and fewer than 200.`);
    await zoomTo(page, view, id, 0.2);
    await soon(page, async () => (await edges(page)) === 0,
      `The plane of ${view.name}, zoomed out to 20%, still draws ${await edges(page)} lines: a large view draws none while it is far.`);
    await finish(opened);
  });

  // What a step's time measures is the script up to the frame that handles the move: every change of the DOM a pan or
  // a drag makes must fall after a pointermove and no later than that move's animation frame callback.
  test("the plane's commit falls inside what a step's time measures", async () => {
    const view = VIEW.definitions;
    const id = SERVICE;
    const opened = await openModel(browser);
    const { page } = opened;
    await showView(page, view);

    /** In the page: notes pointermoves, their frames, and the changes of `target`'s style attribute. */
    const watch = (target) => page.evaluate((selector) => {
      const probe = { moves: [], changes: [] };
      window.addEventListener('pointermove', () => {
        const move = { at: performance.now(), frame: null };
        probe.moves.push(move);
        requestAnimationFrame(() => { move.frame = performance.now(); });
      }, true);
      const observer = new MutationObserver((records) => { for (let i = 0; i < records.length; i++) probe.changes.push(performance.now()); });
      observer.observe(document.querySelector(selector), { attributes: true, attributeFilter: ['style'] });
      window.__probe = probe;
    }, target);
    /** Takes the probe's notes and clears them. */
    const notes = () => page.evaluate(() => { const probe = window.__probe; const out = JSON.parse(JSON.stringify(probe)); probe.moves.length = 0; probe.changes.length = 0; return out; });
    /** One gesture: a press, MOVES moves of 12 by 6 px each, a frame after each, a release. */
    const swipe = async (from, way) => {
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      for (let m = 1; m <= MOVES; m++) {
        await page.mouse.move(from.x + way * STEP[0] * m, from.y + way * STEP[1] * m);
        await frame(page);
      }
      await page.mouse.up();
      await frame(page);
    };
    const inside = (seen, what) => {
      const late = seen.changes.filter((at) => {
        const move = [...seen.moves].reverse().find((m) => m.at <= at);
        return !move || move.frame === null || at > move.frame;
      });
      assert.equal(late.length, 0, `${late.length} of ${seen.changes.length} changes of ${what} fell outside a pointermove and the frame that handled it.`);
    };

    await watch(`${planeOf(view.id)} .react-flow__viewport`);
    for (let pan = 0; pan < 2; pan++) {
      const ground = await page.evaluate(groundOf, [planeOf(view.id), TAKEN]);
      assert.ok(ground, `The fitted plane of ${view.name} has no bare ground to pan it by.`);
      await swipe(ground, pan % 2 ? -1 : 1);
    }
    const panned = await notes();
    assert.ok(panned.changes.length >= 8, `The viewport of ${view.name} changed ${panned.changes.length} times in two pans of 4 moves, not at least 8.`);
    inside(panned, `the viewport in a pan`);

    const box = await lookAt(page, view, id);
    await page.evaluate(() => { delete window.__probe; });
    await watch(nodeOf(view.id, id));
    for (let drag = 0; drag < 2; drag++) {
      const was = await boxOf(page, view.id, id);
      await swipe({ x: was.x + 24 * was.zoom, y: was.y + 14 * was.zoom }, drag % 2 ? -1 : 1);
    }
    const dragged = await notes();
    assert.ok(dragged.changes.length >= 6, `The node ${id} changed ${dragged.changes.length} times in two drags of 4 moves, not at least 6.`);
    inside(dragged, `the dragged node's place`);
    assert.ok(box, 'the box was found');
    await finish(opened);
  });
});
