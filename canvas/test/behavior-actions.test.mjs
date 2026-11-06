// The action flow view: its palette, an action def with an action, a parameter (with its direction select) and a fork
// inside it, a fork refused on the plane; a succession drawn and exported as first … then …, and one into a start node
// refused with its message; a guard typed in the panel as the line's label and in the export, with the decision's
// if/else block; a send action's head in the export; a fork with two incoming successions marked as a problem.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { elementIds, emptyPointIn, exportText, finish, launch, openCanvas, placeElement, relationshipIds, until } from './helpers.mjs';

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

describe('behavior: action flow view', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('an action flow view offers its palette; an action def takes an action, a parameter with its direction and a fork, and a fork is refused on the plane', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'ActionFlowView');
    assert.match(await page.textContent('.eyebrow'), /action flow view/);
    assert.equal(await page.locator('.palette button[data-tool]:not([data-tool="Note"])').count(), 11, 'the palette offers the nine kinds, the succession and defined by');
    const def = await placeElement(page, 'ActionDefinition', await emptyPointIn(page, view));
    assert.equal(await page.getAttribute(`g[data-el="${def}"]`, 'data-kind'), 'ActionDefinition');
    assert.match(await page.textContent(`g[data-el="${def}"]`), /«action def»/, 'the box says what it is');

    const action = await placeInside(page, 'ActionUsage', def);
    assert.equal(await page.locator(`g[data-el="${def}"] g[data-el="${action}"][data-kind="ActionUsage"]`).count(), 1, 'the action is drawn inside the action def');
    assert.ok(await page.locator('#f-actionKind').isVisible(), 'the panel offers the kind of action');
    assert.ok(await page.locator('#f-role').isVisible(), 'the panel offers the role');

    const param = await placeInside(page, 'ParameterUsage', def);
    assert.equal(await page.locator(`g[data-el="${def}"] g[data-el="${param}"][data-kind="ParameterUsage"].parameter`).count(), 1, 'the parameter sits on the border of the action def');
    assert.ok(await page.locator('#f-direction').isVisible(), 'the panel offers the direction');
    assert.equal(await page.inputValue('#f-direction'), 'in', 'a new parameter goes in');
    await page.selectOption('#f-direction', 'out');
    assert.match(await exported(page), /\bout item param1;/, 'the parameter is written with its direction');

    // A fork belongs inside an action: on the plane it is refused with a message and nothing is added.
    const count = (await elementIds(page)).length;
    await page.click('.palette button[data-tool="ForkNode"]');
    const free = await emptyPointIn(page, view);
    await page.mouse.click(free.x, free.y);
    assert.match(await page.textContent('#status'), /inside an action def or an action/, 'the fork is refused on the plane');
    assert.equal((await elementIds(page)).length, count, 'nothing was added');
    await page.keyboard.press('Escape');
    const fork = await placeInside(page, 'ForkNode', def);
    assert.equal(await page.locator(`g[data-el="${def}"] g[data-el="${fork}"][data-kind="ForkNode"].bar`).count(), 1, 'the fork is a bar inside the action def');
    assert.match(await exported(page), /\bfork fork1;/);
    assert.ok(await page.locator('#problems').isHidden(), 'nothing is wrong with it');
    await finish(ctx);
  });

  test('a succession between two actions exports as first … then …, and one into a start node is refused', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'ActionFlowView');
    const def = await placeElement(page, 'ActionDefinition', await emptyPointIn(page, view));
    const a = await placeInside(page, 'ActionUsage', def);
    const b = await placeInside(page, 'ActionUsage', def);
    const start = await placeInside(page, 'StartNode', def);
    assert.equal(await page.locator(`g[data-el="${start}"][data-kind="StartNode"].start`).count(), 1, 'the start node is drawn');
    await fit(page);
    const rel = await drawEdge(page, 'SuccessionAsUsage', a, b);
    assert.equal(await page.getAttribute(`g[data-rel="${rel}"]`, 'data-kind'), 'SuccessionAsUsage');
    assert.ok(await page.locator(`g[data-rel="${rel}"].succession`).count() >= 1, 'the line carries the succession class');
    assert.match(await exported(page), /\bfirst action1 then action2;/, 'the export writes the succession in the action def');

    const status = await refuseEdge(page, 'SuccessionAsUsage', b, start);
    assert.match(status, /Nothing leads into start/, `the start node refuses an incoming succession: ${status}`);
    await finish(ctx);
  });

  test('a guard typed in the panel is the line\'s label and goes into the export; an else branch makes the decision\'s block', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'ActionFlowView');
    const def = await placeElement(page, 'ActionDefinition', await emptyPointIn(page, view));
    const a = await placeInside(page, 'ActionUsage', def);
    const b = await placeInside(page, 'ActionUsage', def);
    const decision = await placeInside(page, 'DecisionNode', def);
    assert.equal(await page.locator(`g[data-el="${decision}"][data-kind="DecisionNode"].diamond`).count(), 1, 'the decision is a diamond');
    await fit(page);
    const guarded = await drawEdge(page, 'SuccessionAsUsage', decision, a);
    assert.ok(await page.locator('#f-guard').isVisible(), 'the panel offers the guard for a succession');
    await page.fill('#f-guard', 'ready');
    await until(page, (id) => (document.querySelector(`g[data-rel="${id}"]`)?.textContent || '').includes('[ready]'), guarded, 'the line is labelled [ready]');
    assert.match(await exported(page), /\bfirst decision1 if ready then action1;/, 'a guarded succession is written order-free');

    const otherwise = await drawEdge(page, 'SuccessionAsUsage', decision, b);
    await page.fill('#f-guard', 'else');
    await until(page, (id) => (document.querySelector(`g[data-rel="${id}"]`)?.textContent || '').includes('else'), otherwise, 'the line is labelled else');
    const text = await exported(page);
    assert.match(text, /decide decision1;\s+if ready then action1;\s+else action2;/, `the decision's block follows its line:\n${text}`);
    assert.doesNotMatch(text, /first decision1/, 'the block covers both branches');
    assert.ok(await page.locator('#problems').isHidden(), 'a decision with a guarded branch and an else is fine');
    await finish(ctx);
  });

  test('a send action: its kind, payload and target in the panel, «send action» on the box, and send … to or via in the export', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'ActionFlowView');
    const def = await placeElement(page, 'ActionDefinition', await emptyPointIn(page, view));
    const action = await placeInside(page, 'ActionUsage', def);
    await page.selectOption('#f-actionKind', 'send');
    await until(page, (id) => (document.querySelector(`g[data-el="${id}"] > text.kw`)?.textContent || '').includes('send action'), action, 'the box says «send action»');
    await page.fill('#f-payload', 'new Alert()');
    await page.fill('#f-target', 'maintainer');
    await until(page, (id) => (document.querySelector(`g[data-el="${id}"]`)?.textContent || '').includes('new Alert()'), action, 'the payload shows in the send compartment');
    assert.match(await exported(page), /\baction action1 send new Alert\(\) to maintainer;/, 'a send to a part goes to it');
    // A target that names a port of the model goes via.
    await page.fill('#f-target', 'api');
    assert.match(await exported(page), /\baction action1 send new Alert\(\) via api;/, 'a send to a port goes via it');
    await finish(ctx);
  });

  test('a fork with two incoming successions is marked, counted and listed as a problem', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'ActionFlowView');
    const def = await placeElement(page, 'ActionDefinition', await emptyPointIn(page, view));
    const a = await placeInside(page, 'ActionUsage', def);
    const b = await placeInside(page, 'ActionUsage', def);
    const fork = await placeInside(page, 'ForkNode', def);
    await fit(page);
    await drawEdge(page, 'SuccessionAsUsage', a, fork);
    assert.ok(await page.locator('#problems').isHidden(), 'one succession into a fork is fine');
    await drawEdge(page, 'SuccessionAsUsage', b, fork);
    await until(page, (id) => document.querySelector(`g[data-el="${id}"]`)?.classList.contains('is-problem'), fork, 'the fork is marked');
    assert.match(await page.textContent('#problems'), /^1 problem$/);
    assert.ok((await page.locator(`#drawing g.problem[data-for="${fork}"]`).count()) >= 1, 'the fork has a badge');
    await clickBox(page, fork);
    await until(page, (id) => document.querySelector(`g[data-el="${id}"]`)?.classList.contains('is-selected'), fork, 'the fork is selected');
    const listed = await page.locator('#problems-list li').allTextContents();
    assert.equal(listed.length, 1, `the panel lists the fork's problem: ${JSON.stringify(listed)}`);
    assert.match(listed[0], /One succession leads into a fork/);
    await finish(ctx);
  });
});
