// The state transition view: its palette, a state def with two states, an initial node and a done node inside it; a
// transition drawn with a trigger, a guard and an effect (its label and its export form); a transition between states
// of two state defs refused with its message; a parallel state exported with braces; an entry action under a state
// exported as entry action, the initial node as the entry idiom, and as a transition from the entry action.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { choose, emptyPointIn, exportText, finish, launch, openCanvas, placeElement, relationshipIds, rename, until } from './helpers.mjs';

// Copied from views.test.mjs: New view of a kind; returns the new frame's id.
async function addView(page, kind) {
  const before = await page.locator('#drawing g.frame[data-view]').count();
  await page.selectOption('#new-view-kind', kind);
  await page.click('#new-view');
  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > count, before, 'a new frame appears');
  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
}

// Fits the drawing into the window, so a box that grew stays clickable.
async function fit(page) {
  await page.click('#zoom-fit');
}

// Clicks a box where the box itself is under the pointer: on one of its own texts, the middle of its outline, or just
// inside the outline's corners, whichever a nested box, a line, a pin or a badge doesn't cover.
async function clickBox(page, id) {
  const at = await page.evaluate((elId) => {
    const g = document.querySelector(`#drawing g[data-el="${elId}"]`);
    if (!g) return null;
    const mid = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    const points = Array.from(g.querySelectorAll(':scope > text')).map((t) => mid(t.getBoundingClientRect()));
    const outline = g.querySelector(':scope > .outline');
    if (outline) {
      const r = outline.getBoundingClientRect();
      points.push(mid(r));
      [8, 3].forEach((d) => [[r.left + d, r.top + d], [r.right - d, r.top + d], [r.left + d, r.bottom - d], [r.right - d, r.bottom - d],
        [r.left + d, r.top + r.height / 2], [r.right - d, r.top + r.height / 2], [r.left + r.width / 2, r.top + d], [r.left + r.width / 2, r.bottom - d]]
        .forEach((xy) => points.push({ x: xy[0], y: xy[1] })));
    }
    return points.find((p) => {
      const hit = document.elementFromPoint(p.x, p.y);
      const on = hit && hit.closest ? hit.closest('[data-el], [data-rel], .pin, .problem, .tab') : null;
      return on === g;
    }) || null;
  }, id);
  assert.ok(at, `found a spot on ${id} to click`);
  await page.mouse.click(at.x, at.y);
}

// Places a tool's element inside the box of hostId, clicking the host's own padding just under its lowest nested box
// (or its header when it holds none): the host is what is under the click, and the new box goes below the others.
async function placeInside(page, tool, hostId) {
  await fit(page);
  const at = await page.evaluate((id) => {
    const g = document.querySelector(`#drawing g[data-el="${id}"]`);
    const outline = g && g.querySelector(':scope > .outline');
    if (!outline) return null;
    const box = outline.getBoundingClientRect();
    let bottom = box.top + 20;
    g.querySelectorAll(':scope > g[data-el] > .outline').forEach((o) => {
      const r = o.getBoundingClientRect();
      if (r.height > 0 && r.bottom < box.bottom) bottom = Math.max(bottom, r.bottom);
    });
    return { x: box.left + 14, y: Math.min(bottom + 2, box.bottom - 2) };
  }, hostId);
  assert.ok(at, `found a spot inside ${hostId}`);
  return placeElement(page, tool, at);
}

// Draws a line from one box to another and returns its id; the line stays selected, so its fields are in the panel.
async function drawEdge(page, tool, sourceId, targetId) {
  const before = await relationshipIds(page);
  await page.click(`.palette button[data-tool="${tool}"]`);
  await clickBox(page, sourceId);
  await clickBox(page, targetId);
  await until(page, (count) => document.querySelectorAll('g[data-rel]').length > count, before.length, `a ${tool} edge appears after drawing it`);
  const added = (await relationshipIds(page)).filter((id) => !before.includes(id));
  assert.equal(added.length, 1, `drawing a ${tool} added one edge, not ${JSON.stringify(added)}`);
  return added[0];
}

// Tries a line the palette should refuse: no edge appears, the tool is put down, and the status is returned.
async function refuseEdge(page, tool, sourceId, targetId) {
  const before = await relationshipIds(page);
  await page.click(`.palette button[data-tool="${tool}"]`);
  await clickBox(page, sourceId);
  await clickBox(page, targetId);
  const status = await page.textContent('#status');
  assert.deepEqual(await relationshipIds(page), before, 'no edge was drawn');
  await page.keyboard.press('Escape');
  return status;
}

// The export, with the panel closed again so it doesn't cover the drawing.
async function exported(page) {
  const text = await exportText(page);
  await page.click('#close-export');
  return text;
}

describe('behavior: state transition view', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('a state transition view offers its palette; a state def takes two states, an initial node and a done node', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'StateTransitionView');
    assert.match(await page.textContent('.eyebrow'), /state transition view/);
    assert.equal(await page.locator('.palette button[data-tool]:not([data-tool="Note"])').count(), 7, 'the palette offers the five kinds, the transition and defined by');
    const def = await placeElement(page, 'StateDefinition', await emptyPointIn(page, view));
    assert.equal(await page.getAttribute(`g[data-el="${def}"]`, 'data-kind'), 'StateDefinition');
    assert.ok(await page.locator('#f-parallel').isVisible(), 'the panel offers parallel for a state def');
    const s1 = await placeInside(page, 'StateUsage', def);
    const s2 = await placeInside(page, 'StateUsage', def);
    assert.equal(await page.locator(`g[data-el="${def}"] g[data-el="${s1}"][data-kind="StateUsage"].state`).count(), 1, 'the first state is drawn inside the state def');
    assert.equal(await page.locator(`g[data-el="${def}"] g[data-el="${s2}"][data-kind="StateUsage"]`).count(), 1, 'so is the second');
    assert.match(await page.textContent(`g[data-el="${s1}"]`), /«state»/);
    const initial = await placeInside(page, 'InitialNode', def);
    assert.equal(await page.locator(`g[data-el="${def}"] g[data-el="${initial}"][data-kind="InitialNode"].initial`).count(), 1, 'the initial node is drawn inside the state def');
    assert.ok(await page.locator('#add-note').isHidden(), 'an initial node has no name, so it takes no note');
    const done = await placeInside(page, 'DoneNode', def);
    assert.equal(await page.locator(`g[data-el="${def}"] g[data-el="${done}"][data-kind="DoneNode"].done`).count(), 1, 'the done node is drawn inside the state def');
    const text = await exported(page);
    assert.match(text, /\bstate def StateDef1 \{/, 'the state def is written with a body');
    assert.match(text, /\bstate state1;/);
    assert.match(text, /\bstate state2;/);
    // The initial node waits for its transition; until then it is a problem the panel names.
    assert.match(await page.textContent('#problems'), /^1 problem$/, 'the initial node without a transition is the one problem');
    await clickBox(page, initial);
    await until(page, (id) => document.querySelector(`g[data-el="${id}"]`)?.classList.contains('is-selected'), initial, 'the initial node is selected');
    assert.match((await page.locator('#problems-list li').allTextContents()).join(' '), /needs a transition to the first state/);
    await finish(ctx);
  });

  test('a transition with a trigger, a guard and an effect is labelled trigger [guard] / effect and exported in the order-free form', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'StateTransitionView');
    const def = await placeElement(page, 'StateDefinition', await emptyPointIn(page, view));
    const s1 = await placeInside(page, 'StateUsage', def);
    const s2 = await placeInside(page, 'StateUsage', def);
    await fit(page);
    const rel = await drawEdge(page, 'TransitionUsage', s1, s2);
    assert.equal(await page.getAttribute(`g[data-rel="${rel}"]`, 'data-kind'), 'TransitionUsage');
    assert.ok(await page.locator(`g[data-rel="${rel}"].transition`).count() >= 1, 'the line carries the transition class');
    assert.match(await exported(page), /\btransition first state1 then state2;/, 'a bare transition is written with first');
    for (const [field, value] of [['#f-trigger', 'Mount'], ['#f-guard', 'ready'], ['#f-effect', 'action restart']]) {
      assert.ok(await page.locator(field).isVisible(), `the panel offers ${field} for a transition`);
      await page.fill(field, value);
    }
    await until(page, (id) => (document.querySelector(`g[data-rel="${id}"]`)?.textContent || '').includes('Mount [ready] / action restart'), rel, 'the line is labelled trigger [guard] / effect');
    assert.match(await exported(page), /\btransition first state1 accept Mount if ready do action restart then state2;/);
    await finish(ctx);
  });

  test('a transition between states of two state defs is refused with its message', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'StateTransitionView');
    const a = await placeElement(page, 'StateDefinition', await emptyPointIn(page, view));
    const s1 = await placeInside(page, 'StateUsage', a);
    await fit(page);
    const b = await placeElement(page, 'StateDefinition', await emptyPointIn(page, view));
    const s2 = await placeInside(page, 'StateUsage', b);
    await fit(page);
    const status = await refuseEdge(page, 'TransitionUsage', s1, s2);
    assert.match(status, /needs a state def or a state around both its ends/, `the transition is refused: ${status}`);
    await finish(ctx);
  });

  test('a parallel state shows «parallel» and exports with braces, even with nothing inside', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'StateTransitionView');
    const def = await placeElement(page, 'StateDefinition', await emptyPointIn(page, view));
    const state = await placeInside(page, 'StateUsage', def);
    await page.check('#f-parallel');
    await until(page, (id) => (document.querySelector(`g[data-el="${id}"] > text.kw`)?.textContent || '').includes('parallel'), state, 'the box says «parallel»');
    const text = await exported(page);
    assert.match(text, /\bstate state1 parallel \{\s*\}/, `the parallel state keeps its braces:\n${text}`);
    assert.doesNotMatch(text, /parallel;/, 'parallel never ends in a semicolon');
    await finish(ctx);
  });

  test('an entry action under a state exports as entry action; the initial node writes the entry idiom, or a transition from the entry action', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'StateTransitionView');
    const def = await placeElement(page, 'StateDefinition', await emptyPointIn(page, view));
    const state = await placeInside(page, 'StateUsage', def);
    const inner = await placeInside(page, 'ActionUsage', state);
    assert.equal(await page.locator(`g[data-el="${state}"] g[data-el="${inner}"][data-kind="ActionUsage"]`).count(), 1, 'the action is drawn inside the state');
    await choose(page, '#f-role', 'entry');
    await until(page, (id) => (document.querySelector(`g[data-el="${id}"] > text.kw`)?.textContent || '').includes('entry action'), inner, 'the box says «entry action»');
    assert.match(await exported(page), /\bstate state1 \{\s+entry action action1;\s+\}/, 'the entry action is written in the state');

    const initial = await placeInside(page, 'InitialNode', def);
    await fit(page);
    await drawEdge(page, 'TransitionUsage', initial, state);
    let text = await exported(page);
    assert.match(text, /\bstate def StateDef1 \{\s+entry;\s+then state1;/, `the initial node's transition is the entry idiom:\n${text}`);
    assert.ok(await page.locator('#problems').isHidden(), 'nothing is wrong with it');

    // With an entry action in the state def, the initial node's transition leaves that action instead. The children
    // are written in the order they were placed, so the entry action follows the state.
    const entry = await placeInside(page, 'ActionUsage', def);
    await rename(page, entry, 'init');
    await choose(page, '#f-role', 'entry');
    text = await exported(page);
    assert.match(text, /\bentry action init;/, `the state def has an entry action:\n${text}`);
    assert.match(text, /\btransition first init then state1;/, `the initial node's transition now leaves the entry action:\n${text}`);
    assert.doesNotMatch(text, /entry;\s+then state1;/, 'the entry idiom is gone');
    await finish(ctx);
  });
});
