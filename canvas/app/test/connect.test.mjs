// Lines drawn by dragging, in the page (plan/slice-2.md: criterion 4; section 5, flow 1; section 8, package 2-2). The
// scaffold wrote the test of criterion 4 first and marked it todo: no grip is mounted until package 2-2 builds the
// gesture, so the test fails at its first drag, for want of a grip. Package 2-2 owns this file from the scaffold's
// commit on: it adds its other tests here, takes the todo mark off, and makes them pass.
//
// The test is generated from the model library's own rules, over two sets of models, so that the page and the test
// are held to the rules and not to each other:
//   - The ten files. Every ordered pair of two different elements a graph view shows is sorted into a class by the
//     view's kind, the first element's kind, the second's, and what the rules give (the kinds that fit, or a refusal):
//     2,260 pairs, 221 classes. One pair of each class is dragged.
//   - pairsState() of core.mjs, for the pairs of kinds the files do not hold: a view of each graph kind with two
//     elements of each kind it admits. One pair is dragged for each ordered pair of kinds, two of one kind included:
//     400 + 49 + 81 + 25.
// What must happen is worked out here in Node, on the model as the file holds it, from the library's `first` and
// `ends` and the two checks that are draw()'s own, and from nothing the page's code holds:
//   - The kinds asked are the relationship kinds of the view kind's `tools` row, in the row's order.
//   - A kind fits when its `first` rule accepts the first element, the two are not one element, the model holds no
//     relationship of that kind from the one to the other, and its `ends` rule accepts the pair.
//   - When no kind fits, the sentence is that of the first kind in the row whose `first` rule accepts the first
//     element, or of the first kind in the row when none does.
// After a drawn line the test presses Ctrl + Z, so every drag starts from the model the file holds.
//
// What the test reads is what a person meets: the lines a plane draws and where they end, the toast, the menu.

import assert from 'node:assert/strict';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import { pairsState } from './core.mjs';
import {
  byTestId, closePages, dragBetween, endsAt, finish, gripOf, isGraph, launch, lib, lineClass, linesIn, linesOf, modelOf, openIn, pointOn, pressKey, saidSoFar,
  showView, soon, stateFileAt, stateFileOf, TEN, TESTIDS, toast, toastAfter,
} from './helpers.mjs';

// ---- What the rules give, in Node.

/** The relationship kinds a line can be of in a view of a kind: those of its tools row, in the row's order. */
const lineKinds = (viewKind) => lib.VIEW_KINDS[viewKind].tools.filter((name) => lib.RELATIONSHIPS[name] !== undefined);

/** Why a line of `kind` from `a` to `b` is refused, or null: the kind's two rules, and between them draw()'s own two checks. */
function problem(model, ids, kind, a, b) {
  const row = lib.RELATIONSHIPS[kind];
  return row.first(model, a, ids)
    || (a.id === b.id ? 'Pick two different elements.' : null)
    || (model.relationships.some((rel) => rel.kind === kind && rel.from === a.id && rel.to === b.id) ? 'That is already drawn.' : null)
    || row.ends(model, a, b, ids)
    || null;
}

/** What a drag from `a` to `b` must do in a view of a kind: `{ kinds }`, those that fit, in the row's order; or `{ refused }`, the sentence. */
function ruling(model, ids, viewKind, a, b) {
  const kinds = lineKinds(viewKind);
  const fit = kinds.filter((kind) => problem(model, ids, kind, a, b) === null);
  if (fit.length > 0) return { kinds: fit };
  const asked = kinds.find((kind) => !lib.RELATIONSHIPS[kind].first(model, a, ids)) ?? kinds[0];
  return { refused: problem(model, ids, asked, a, b) };
}

/**
 * Every ordered pair of two different elements that each graph view of a model shows, in the views' order and then
 * the model's order of elements, each with what the rules give for it: `{ view, from, to, gives }`.
 */
function pairsOf(model) {
  const ids = lib.idsOf(model);
  const pairs = [];
  for (const view of model.views.filter(isGraph)) {
    const shown = model.elements.filter((el) => view.layout[el.id]);
    for (const from of shown) for (const to of shown) if (from !== to) pairs.push({ view, from, to, gives: ruling(model, ids, view.kind, from, to) });
  }
  return pairs;
}

/** A model as the library reads it from a state, as plain data. */
const read = (state) => JSON.parse(JSON.stringify(lib.normalize(state.model)));
const said = (model, el) => lib.describe(model, el);
const label = (kind) => lib.RELATIONSHIPS[kind].label;

// ---- The drags, in the page.

const MENU = byTestId(TESTIDS.connectMenu);
/** The kinds the connect menu lists, in its order, or null while no menu is open. */
const menuOf = (page) => page.evaluate((menu) => {
  const el = document.querySelector(menu);
  return el ? [...el.querySelectorAll('[data-kind]')].map((entry) => entry.getAttribute('data-kind')) : null;
}, MENU);

/**
 * One file's drags. `groups` are the pairs to drag, each group a list of pairs that are as good as each other (a
 * class of the ten files; the pairs of two kinds in the generated model): the first whose first element has a grip
 * the pointer can press is dragged. Returns how many drags it made and the groups none of whose pairs could be
 * dragged.
 */
async function dragAll(browser, file, model, groups) {
  const opened = await openIn(browser, file);
  const { page } = opened;
  const name = file.name;
  let drags = 0;
  const left = [];
  for (const view of model.views.filter(isGraph)) {
    const mine = groups.filter((group) => group.pairs[0].view.id === view.id);
    if (mine.length === 0) continue;
    const drawnAtFirst = linesOf(model, view);
    await showView(page, view, drawnAtFirst.length);
    const before = await linesIn(page, view.id);
    assert.deepEqual(before.map((line) => line.id), [...drawnAtFirst].sort(), `In ${name}, the plane of ${view.name} does not draw the lines of the view before any drag.`);
    let heard = await saidSoFar(page);

    /** Presses the first free grip of `from` and lets the line go on `to`. False when no grip of `from` can be pressed. */
    const drag = async ({ from, to }) => {
      const grip = await gripOf(page, view.id, from.id, null, { covered: 'null' });
      if (!grip) return false;
      await dragBetween(page, grip, await pointOn(page, view.id, 'el', to.id), { steps: 3 });
      drags++;
      return true;
    };
    /** Waits for the one line a drag must have drawn, checks where it ends, and takes it back with Ctrl + Z. */
    const drewAndUndone = async ({ from, to }, kind, how) => {
      const where = `In ${name}, ${view.name}: a line dragged from ${said(model, from)} to ${said(model, to)}${how}`;
      // A usage has one definition: a "defined by" line from a usage that has one moves that line's other end.
      const moved = kind === 'FeatureTyping' ? model.relationships.find((rel) => rel.kind === kind && rel.from === from.id) ?? null : null;
      const wasDrawn = moved !== null && before.some((line) => line.id === moved.id);
      const drawn = await soon(page, async () => {
        const now = await linesIn(page, view.id);
        const fresh = now.filter((line) => !before.some((was) => was.id === line.id));
        if (moved) return (wasDrawn ? fresh.length === 0 : fresh.length === 1 && fresh[0].id === moved.id) && now.length === before.length + fresh.length ? { id: moved.id, cls: lineClass(kind) } : null;
        return fresh.length === 1 && now.length === before.length + 1 ? fresh[0] : null;
      }, async () => `${where} must draw one ${label(kind)} line${moved ? ` (the usage's one "defined by" line, ${moved.id}, with its other end moved)` : ''}. ` +
        `The plane draws ${JSON.stringify(await linesIn(page, view.id))}; before the drag it drew ${JSON.stringify(before)}. The toast: ${JSON.stringify(await toast(page))}. The menu: ${JSON.stringify(await menuOf(page))}.`);
      assert.equal(drawn.cls, lineClass(kind), `${where} drew a line of the class "${drawn.cls}", not a ${label(kind)} line ("${lineClass(kind)}").`);
      await soon(page, async () => { const gaps = await endsAt(page, view.id, drawn.id, from.id, to.id); return gaps && gaps.from !== null && gaps.to !== null && gaps.from <= 2 && gaps.to <= 2; },
        async () => `${where} drew the line ${drawn.id}, and it does not run from the one to the other: its ends are ${JSON.stringify(await endsAt(page, view.id, drawn.id, from.id, to.id))} px away from them.`);
      assert.equal(await menuOf(page), null, `${where}: the menu is still open after the line was drawn.`);
      assert.ok((await saidSoFar(page)) <= heard, `${where} drew the line and said something too: ${JSON.stringify(await toast(page))}.`);
      // One undo step: Ctrl + Z, once, and the plane draws what it drew before.
      await pressKey(page, 'Mod+Z');
      await soon(page, async () => JSON.stringify(await linesIn(page, view.id)) === JSON.stringify(before),
        async () => `${where}: after Ctrl + Z, once, the plane does not draw the lines it drew before the drag. It draws ${JSON.stringify(await linesIn(page, view.id))}, not ${JSON.stringify(before)}.`);
      if (wasDrawn) {
        await soon(page, async () => { const gaps = await endsAt(page, view.id, moved.id, moved.from, moved.to); return gaps && gaps.to !== null && gaps.to <= 2; },
          `${where}: after Ctrl + Z the "defined by" line ${moved.id} does not end where it ended before.`);
      }
    };

    for (const group of mine) {
      let dragged = false;
      for (const pair of group.pairs) {
        const { from, to, gives } = pair;
        const where = `In ${name}, ${view.name}: a line dragged from ${said(model, from)} to ${said(model, to)}`;
        if (!(await drag(pair))) continue;
        dragged = true;
        if (gives.refused !== undefined) {
          // Refused: nothing is drawn, and a new toast says the rule's own sentence.
          const told = await toastAfter(page, heard, `${where} must be refused with "${gives.refused}"`);
          heard = told.said;
          assert.equal(told.text, gives.refused, `${where} is refused in other words than the rule's own.`);
          assert.deepEqual(await linesIn(page, view.id), before, `${where} is refused, and the plane's lines changed.`);
          assert.equal(await menuOf(page), null, `${where} is refused, and a menu opened.`);
        } else if (gives.kinds.length === 1) {
          await drewAndUndone(pair, gives.kinds[0], '');
        } else {
          // Several kinds fit: a menu lists exactly those, in the row's order, and each choice draws that kind, each in a drag of its own.
          for (const kind of gives.kinds) {
            if (kind !== gives.kinds[0]) assert.ok(await drag(pair), `${where}: the grip that was pressed for the first choice cannot be pressed again.`);
            const listed = await soon(page, () => menuOf(page), async () => `${where} fits ${gives.kinds.map(label).join(', ')}, and no menu opened (data-testid "${TESTIDS.connectMenu}"). ` +
              `The plane draws ${JSON.stringify(await linesIn(page, view.id))}; the toast: ${JSON.stringify(await toast(page))}.`);
            assert.deepEqual(listed, gives.kinds, `${where}: the menu does not list exactly the kinds that fit, in the order of the view kind's tools.`);
            assert.deepEqual(await linesIn(page, view.id), before, `${where}: a line was drawn before a kind was chosen from the menu.`);
            await page.locator(`${MENU} [data-kind="${kind}"]`).click();
            await drewAndUndone(pair, kind, `, with ${label(kind)} chosen from the menu,`);
          }
        }
        break;
      }
      if (!dragged) left.push(group);
    }
  }
  await finish(opened);
  return { drags, left };
}

describe('lines drawn by dragging', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  // About 800 drags: a time limit of its own, five minutes.
  test('in each graph view kind, a drag between each pair of node kinds draws what the rules allow and says why for what they refuse', { todo: 'package 2-2 builds the gesture', timeout: 300000 }, async () => {
    // The ten files: one pair of each class, in the files' order.
    const files = TEN.map((file) => ({ name: path.basename(file), file: stateFileAt(file), model: modelOf(file) }));
    const classes = new Map();
    const count = { pairs: 0, refused: 0, one: 0, several: 0 };
    const allowed = new Set();
    for (const { name, model } of files) {
      for (const pair of pairsOf(model)) {
        const { view, from, to, gives } = pair;
        count.pairs++;
        if (gives.refused !== undefined) count.refused++;
        else { count[gives.kinds.length === 1 ? 'one' : 'several']++; gives.kinds.forEach((kind) => allowed.add(kind)); }
        const key = [view.kind, from.kind, to.kind, gives.refused !== undefined ? 'refused' : gives.kinds.join(' ')].join(' | ');
        if (!classes.has(key)) classes.set(key, { key, name, pairs: [] });
        const group = classes.get(key);
        // A class is dragged in the first view that holds a pair of it; its other pairs in that view stand by.
        if (group.name === name && group.pairs.every((other) => other.view.id === view.id)) group.pairs.push(pair);
      }
    }
    const every = [...new Set(Object.keys(lib.VIEW_KINDS).filter((kind) => lib.VIEW_KINDS[kind].renderer === 'graph').flatMap(lineKinds))];
    assert.deepEqual([count.pairs, count.refused, count.one, count.several, classes.size], [2260, 1742, 456, 62, 221],
      'The ten files are not the ones this test was written for: 2,260 ordered pairs in their 11 graph views, 1,742 refused, 456 that fit one kind, 62 that fit several, 221 classes.');
    assert.deepEqual([...allowed].sort(), [...every].sort(), 'A relationship kind of a graph view\'s tools is allowed in no class of the ten files.');

    // The generated model: one pair for each ordered pair of kinds a view shows.
    const state = await pairsState();
    const generated = read(state);
    const kinds = new Map();
    for (const pair of pairsOf(generated)) {
      const key = [pair.view.kind, pair.from.kind, pair.to.kind].join(' | ');
      if (!kinds.has(key)) kinds.set(key, { key, name: 'pairs.json', pairs: [] });
      kinds.get(key).pairs.push(pair);
    }
    assert.equal(kinds.size, 400 + 49 + 81 + 25, 'pairsState() does not hold a pair for each ordered pair of the kinds its four views admit.');

    let drags = 0;
    const left = [];
    for (const { name, file, model } of files) {
      const mine = [...classes.values()].filter((group) => group.name === name);
      if (mine.length === 0) continue;   // a file whose views hold no class that an earlier file did not hold
      const made = await dragAll(browser, file, model, mine);
      drags += made.drags;
      left.push(...made.left);
    }
    const made = await dragAll(browser, stateFileOf('pairs.json', state), generated, [...kinds.values()]);
    drags += made.drags;
    left.push(...made.left);
    assert.deepEqual(left.map((group) => `${group.name}: ${group.key}`), [], 'No pair of these could be dragged: every grip of its first element lies under something else.');
    assert.ok(drags >= classes.size + kinds.size, `${drags} drags were made for ${classes.size} classes and ${kinds.size} pairs of kinds.`);
  });
});
