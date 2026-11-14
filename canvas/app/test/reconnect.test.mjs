// A line's end moved by dragging, in the page (plan/slice-2.md: criterion 5; section 5, flow 2; section 8, package
// 2-2). The scaffold wrote the two tests of criterion 5 first and marked them todo: a selected line has no grip at its
// ends until package 2-2 builds the gesture, so each fails at its first drag, for want of a grip. Package 2-2 owns
// this file from the scaffold's commit on.
//
// How the tests find their lines, in Node, from the ten files and the model library's own rules. For each of the nine
// relationship kinds: the first line of that kind, in the order of the files, then of a file's views, then of the
// model's relationships, that a graph view draws and one of whose ends another node of that view may take. The end
// dragged is `to` when a node may take it, else `from`. The node it goes to is the first that may take it, in the
// model's order of elements; the node that may not is the first that may not. The node the end is on already is
// neither: an end let go where it is changes nothing and says nothing.
//
// Whether a node may take an end is what the rules say of the new pair: the kind's `first` rule, the two ends being
// different elements, no other line of the kind between them already (the line itself does not stand in its own
// way), and the kind's `ends` rule. One rule more is package 2-2's (its brief, "Decided"): the usage end of a
// "defined by" line does not go to a usage that has a definition already.
//
// What the tests read is what a person meets: where the line is drawn to, its label, the toast, the bar's Undo, and
// the file the page saves.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  byTestId, closePages, dragBetween, endsAt, finish, gripOf, groundPoint, isGraph, labelIn, launch, lib, linesIn, linesOf, openIn, pointOn, pressKey, saidSoFar,
  saveAndRead, showView, soon, stateFileOf, TEN, TESTIDS, toastAfter, withNote,
} from './helpers.mjs';

// ---- The lines, in Node.

/** A model as the library reads it from a state, as plain data. */
const read = (state) => JSON.parse(JSON.stringify(lib.normalize(state.model)));
const KINDS = Object.keys(lib.RELATIONSHIPS);
const label = (kind) => lib.RELATIONSHIPS[kind].label;

/** Why the `end` of the line `rel` cannot go to the element `node`, or null when it can. */
function refusal(model, ids, rel, end, node) {
  const from = end === 'from' ? node : ids.get(rel.from);
  const to = end === 'to' ? node : ids.get(rel.to);
  const row = lib.RELATIONSHIPS[rel.kind];
  const rules = row.first(model, from, ids)
    || (from.id === to.id ? 'Pick two different elements.' : null)
    || (model.relationships.some((other) => other.kind === rel.kind && other.from === from.id && other.to === to.id && other.id !== rel.id) ? 'That is already drawn.' : null)
    || row.ends(model, from, to, ids)
    || null;
  if (rules !== null) return rules;
  // A usage has one definition: a "defined by" line's usage end does not go to a usage that has one already.
  const has = rel.kind === 'FeatureTyping' && end === 'from' ? lib.typingOf(model, node) : null;
  if (has && has.id !== rel.id) return `${lib.describe(model, node)} is defined by ${lib.textName(ids.get(has.to))} already. Clear its definition in Details first.`;
  return null;
}

/** What a line says at its middle, by its kind's row, or null when it says nothing. */
function labelOf(model, rel) {
  const say = lib.RELATIONSHIPS[rel.kind].line.label;
  return (say ? say(rel, model, lib.idsOf(model)) : '') || null;
}

/** The line of each relationship kind whose end is dragged, as the head of this file says: `{ kind, file, name, view, rel, end, takes, refuses, why }`. */
function linesToMove() {
  const found = new Map();
  for (const file of TEN) {
    const state = JSON.parse(fs.readFileSync(file, 'utf8'));
    const model = read(state);
    const ids = lib.idsOf(model);
    for (const view of model.views.filter(isGraph)) {
      const shown = model.elements.filter((el) => view.layout[el.id]);
      for (const rel of model.relationships) {
        if (found.has(rel.kind) || rel.hidden || !view.layout[rel.from] || !view.layout[rel.to]) continue;
        for (const end of ['to', 'from']) {
          const others = shown.filter((el) => el.id !== rel[end]);
          const takes = others.find((el) => refusal(model, ids, rel, end, el) === null);
          if (!takes) continue;
          const refuses = others.find((el) => refusal(model, ids, rel, end, el) !== null) ?? null;
          found.set(rel.kind, { kind: rel.kind, file, name: path.basename(file), state, model, view, rel, end, takes, refuses, why: refuses ? refusal(model, ids, rel, end, refuses) : null });
          break;
        }
      }
    }
  }
  return found;
}

// ---- In the page.

/** Whether the bar's Undo is greyed: nothing is left to undo. */
const undoGreyed = (page) => page.evaluate((selector) => {
  const el = document.querySelector(selector);
  return !!el && (el.disabled === true || el.getAttribute('aria-disabled') === 'true');
}, byTestId(TESTIDS.undo));

/** Waits until the plane draws the line from the one element to the other. */
const untilDrawnBetween = (page, view, rel, fromId, toId, what) => soon(page, async () => {
  const gaps = await endsAt(page, view.id, rel.id, fromId, toId);
  return !!gaps && gaps.from !== null && gaps.to !== null && gaps.from <= 2 && gaps.to <= 2;
}, async () => `${what} Its drawn ends are ${JSON.stringify(await endsAt(page, view.id, rel.id, fromId, toId))} px away from ${fromId} and ${toId}.`);

/** The parts of a saved model that a move of one end may not touch, with that end as given. */
const lists = (model, relId, end, value) => JSON.stringify({
  elements: model.elements,
  relationships: model.relationships.map((rel) => (rel.id === relId ? { ...rel, [end]: value } : rel)),
  views: model.views,
});

describe('a line\'s end moved by dragging', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  const moves = linesToMove();
  const every = () => assert.deepEqual([...moves.keys()].sort(), [...KINDS].sort(),
    'The ten files are not the ones this test was written for: each of the nine relationship kinds has a line that a graph view draws and one of whose ends another node may take.');

  test('each kind of line has an end dragged to a node that may take it: one undo step, its label and its notes kept', { todo: 'package 2-2 builds the gesture' }, async () => {
    every();
    for (const kind of KINDS) {
      const { name, state, model, view, rel, end, takes } = moves.get(kind);
      const where = `In ${name}, ${view.name}: the ${end} end of the ${label(kind)} line ${rel.id} (${lib.describeRel(model, rel)}), dragged to ${lib.describe(model, takes)},`;
      // The file, with a note on the line.
      const noted = withNote(state, rel.id, 'A note that stays on the line while its end is moved.');
      const opened = await openIn(browser, stateFileOf(name, noted));
      const { page } = opened;
      await showView(page, view, linesOf(model, view).length);
      const before = await linesIn(page, view.id);
      assert.equal(await labelIn(page, view.id, 'rel', rel.id), labelOf(model, rel), `In ${name}, ${view.name}: the line ${rel.id} does not say what its kind's row says, before any drag.`);

      const grip = await gripOf(page, view.id, rel.id, end);
      await dragBetween(page, grip, await pointOn(page, view.id, 'el', takes.id));

      // The line is drawn to the node that took the end, and is the same line.
      const [fromId, toId] = end === 'from' ? [takes.id, rel.to] : [rel.from, takes.id];
      await untilDrawnBetween(page, view, rel, fromId, toId, `${where} is not drawn to it.`);
      assert.deepEqual(await linesIn(page, view.id), before, `${where} changed which lines the plane draws: the line keeps its id and its kind.`);
      // Its label is kept: it says what its kind's row says of the relationship with the one end moved.
      const movedModel = { ...model, relationships: model.relationships.map((other) => (other.id === rel.id ? { ...other, [end]: takes.id } : other)) };
      assert.equal(await labelIn(page, view.id, 'rel', rel.id), labelOf(movedModel, movedModel.relationships.find((other) => other.id === rel.id)), `${where} did not keep its label.`);

      // The saved file: the one end moved and nothing else; the note still on the line.
      const saved = await saveAndRead(page);
      assert.deepEqual(saved.model.relationships.find((other) => other.id === rel.id), { ...rel, [end]: takes.id }, `${where} was not saved with that one end moved and everything else of it as it was.`);
      assert.equal(lists(saved.model, rel.id, end, rel[end]), lists(model, rel.id, end, rel[end]), `${where} changed something else of the model.`);
      // A note's targetLabel follows its target's words while the target is in the model (core/notes.ts, the Note
      // contract), and a line's words name its ends: so the notes are compared without it, and each keeps its target.
      const unlabelled = (notes) => notes.map(({ targetLabel: _label, ...rest }) => rest);
      assert.deepEqual(unlabelled(saved.notes), unlabelled(noted.notes), `${where} did not keep the notes: the note on the line is still on it (target "${rel.id}").`);
      const ours = noted.notes.at(-1);
      assert.equal(saved.notes.find((note) => note.id === ours.id)?.target, rel.id, `${where} moved its note off the line: the note's target is no longer "${rel.id}".`);

      // One undo step: Ctrl + Z, once, puts the end back, and nothing is left to undo.
      await pressKey(page, 'Mod+Z');
      await untilDrawnBetween(page, view, rel, rel.from, rel.to, `${where} is not drawn where it was after Ctrl + Z, once.`);
      await soon(page, () => undoGreyed(page), `${where} made more than one undo step: after Ctrl + Z, once, the bar's Undo is not greyed.`);
      const undone = await saveAndRead(page);
      assert.equal(lists(undone.model, rel.id, end, rel[end]), lists(model, rel.id, end, rel[end]), `${where} and undone, is not saved as the model the file held.`);
      assert.deepEqual(undone.notes, noted.notes, `${where} and undone, lost its note.`);
      await finish(opened);
    }
  });

  test('an end dropped on a node that may not take it, or on the ground, leaves the line as it was, and a toast says why', { todo: 'package 2-2 builds the gesture' }, async () => {
    every();
    for (const kind of KINDS) {
      const { name, state, model, view, rel, end, refuses, why } = moves.get(kind);
      const line = `In ${name}, ${view.name}: the ${end} end of the ${label(kind)} line ${rel.id} (${lib.describeRel(model, rel)}),`;
      assert.ok(refuses, `${line} may go to every other node of the view, so no node refuses it: the ten files are not the ones this test was written for.`);
      const opened = await openIn(browser, stateFileOf(name, state));
      const { page } = opened;
      await showView(page, view, linesOf(model, view).length);
      const before = await linesIn(page, view.id);
      const said = labelOf(model, rel);
      let heard = await saidSoFar(page);
      const asItWas = async (where) => {
        await untilDrawnBetween(page, view, rel, rel.from, rel.to, `${where} is no longer drawn where it was.`);
        assert.deepEqual(await linesIn(page, view.id), before, `${where} changed which lines the plane draws.`);
        assert.equal(await labelIn(page, view.id, 'rel', rel.id), said, `${where} changed its label.`);
        assert.ok(await undoGreyed(page), `${where} made an undo step: the bar's Undo is not greyed.`);
      };

      // On a node that may not take it: the rule's own sentence.
      let where = `${line} dropped on ${lib.describe(model, refuses)},`;
      await dragBetween(page, await gripOf(page, view.id, rel.id, end), await pointOn(page, view.id, 'el', refuses.id));
      let told = await toastAfter(page, heard, `${where} must be refused with "${why}"`);
      heard = told.said;
      assert.equal(told.text, why, `${where} is refused in other words than the rule's own.`);
      await asItWas(where);

      // On the ground.
      where = `${line} dropped on the ground,`;
      const GROUND = 'Drop the end on the element it goes to. The line stays as it was.';
      await dragBetween(page, await gripOf(page, view.id, rel.id, end), await groundPoint(page, view));
      told = await toastAfter(page, heard, `${where} must say "${GROUND}"`);
      assert.equal(told.text, GROUND, `${where} says something else.`);
      await asItWas(where);

      // The saved file holds the model the file held.
      const saved = await saveAndRead(page);
      assert.equal(lists(saved.model, rel.id, end, rel[end]), lists(model, rel.id, end, rel[end]), `${line} dropped where it may not go, changed the model.`);
      await finish(opened);
    }
  });
});
