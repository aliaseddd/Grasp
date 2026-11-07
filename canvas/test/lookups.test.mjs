// The model library's lookups, outside a browser: SysMLModel.lookups(model) and SysMLModel.reading(model, fn, look).
// Inside a reading of a model, every helper and every kind's hook answers what it answers outside one, with the same
// objects in the same order: on every fixture, on each fixture with lines of every kind drawn between its elements and
// names taken twice (so the checks find problems), and on a generated model of 300 elements. A reading puts back the
// reading around it once it ends, nested or after a throw, and a reading of the same model inside one goes on in it; a
// helper asked about another model inside a reading answers from that model; and a look made before names and fields
// change still answers right, since it holds the model's structure only.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { modelLibSource, pageSource } from './helpers.mjs';
import { scaleModel } from './scale-model.mjs';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

// As in model-lib.test.mjs: the library the page holds, run in a vm context with a bare window. Its values belong to
// the context's realm, so the checks compare strings and JSON, never deepEqual.
function loadLib(source) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(source), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  assert.ok(sandbox.SysMLModel, 'the model-lib script sets window.SysMLModel');
  return sandbox.SysMLModel;
}
const M = loadLib(pageSource());
const copy = (v) => JSON.parse(JSON.stringify(v));
const fixtures = () => fs.readdirSync(FIXTURES).filter((name) => name.endsWith('.json')).sort()
  .map((name) => [name, M.normalize(JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8')).model)]);

// A fixture with problems: a line of each kind in turn between pairs of its elements, every third one named like an
// element or another line, and every fifth element named like the one before it.
function troubled(raw) {
  const m = copy(raw);
  const els = m.elements;
  const kinds = Object.keys(M.RELATIONSHIPS);
  els.forEach((el, i) => {
    const other = els[(i * 7 + 3) % els.length];
    const name = i % 3 ? '' : i % 2 ? other.name : 'line' + (i % 4);
    m.relationships.push({ id: 'extra' + i, kind: kinds[i % kinds.length], from: el.id, to: other.id, name, guard: i % 4 ? '' : 'else', trigger: i % 5 ? '' : 'go' });
    if (i % 5 === 4) el.name = els[i - 1].name;
  });
  return M.normalize(m);
}

// The answers of every helper and every kind's hook on a model, one line each: what was asked, and the answer as JSON,
// where an object of the model is where it stands in the model's lists (el#3), so an answer made of other objects,
// even equal ones, differs. ids is the map the hooks are given.
function answers(model, ids) {
  const where = new Map();
  model.elements.forEach((e, i) => { if (!where.has(e)) where.set(e, 'el#' + i); });
  model.relationships.forEach((r, i) => { if (!where.has(r)) where.set(r, 'rel#' + i); });
  model.views.forEach((v, i) => { if (!where.has(v)) where.set(v, 'view#' + i); });
  const enc = (x) => {
    if (x === undefined) return '(undefined)';
    if (x === null || typeof x !== 'object') return x;
    if (where.has(x)) return where.get(x);
    if (typeof x.forEach === 'function' && typeof x.get === 'function') { const out = []; x.forEach((v, k) => out.push([enc(k), enc(v)])); return { map: out }; }
    if (Array.isArray(x)) return x.map(enc);
    return Object.fromEntries(Object.keys(x).map((k) => [k, enc(x[k])]));
  };
  const lines = [];
  const ask = (what, fn) => {
    let answer;
    try { answer = JSON.stringify(enc(fn())); } catch (error) { answer = 'throws ' + error.message; }
    lines.push(what + ' = ' + answer);
  };
  const problems = (hook, ...args) => { const out = []; hook(...args, (id, message) => out.push([id, message])); return out; };
  const els = model.elements;
  for (const id of [null, undefined, 'nowhere'].concat(els.map((e) => e.id))) {
    ask(`childrenOf ${id}`, () => M.childrenOf(model, id));
    ask(`descendants ${id}`, () => M.descendants(model, id));
    ask(`eventOrder ${id}`, () => M.eventOrder(model, id));
    ask(`shownIn ${id}`, () => M.shownIn(model, id));
    ask(`labelFor ${id}`, () => M.labelFor(model, id));
    ask(`linesFrom ${id}`, () => M.linesFrom(model, id));
    ask(`linesTo ${id}`, () => M.linesTo(model, id, 'SuccessionAsUsage'));
    ask(`linesAt ${id}`, () => M.linesAt(model, id));
    // A new list each time: what a caller pushes onto one answer is in no other.
    ask(`childrenOf again ${id}`, () => { M.childrenOf(model, id).push('pushed'); return M.childrenOf(model, id); });
  }
  for (const id of ['constructor', '__proto__', 'toString']) ask(`shownIn ${id}`, () => M.shownIn(model, id));
  for (const el of els) {
    const kind = M.KINDS[el.kind];
    ask(`typingOf ${el.id}`, () => M.typingOf(model, el));
    ask(`chain ${el.id}`, () => M.chain(model, el));
    ask(`inUsage ${el.id}`, () => M.inUsage(model, el));
    ask(`describe ${el.id}`, () => M.describe(model, el));
    ask(`qualified ${el.id}`, () => M.qualified(model, el));
    ask(`featurePath ${el.id}`, () => M.featurePath(model, el.owner === undefined ? null : el.owner, el));
    ask(`inheritedFeatures ${el.id}`, () => M.inheritedFeatures(model, el));
    ask(`inheritedFeatures again ${el.id}`, () => { M.inheritedFeatures(model, el, ids).set('added', el); return M.inheritedFeatures(model, el, ids); });
    ask(`inheritedFeature ${el.id}`, () => ['api', 'data', 'request', el.name].map((name) => M.inheritedFeature(model, el, name, ids)));
    ask(`definitionOf ${el.id}`, () => M.definitionOf(model, el, ids));
    ask(`portItems ${el.id}`, () => M.portItems(model, el, ids));
    ask(`portWay ${el.id}`, () => M.portWay(model, el));
    const generals = new Set(M.linesFrom(model, el.id).map((r) => r.to));
    ask(`specializes ${el.id}`, () => els.filter((g, i) => i % 3 === 0 || generals.has(g.id)).map((g) => M.specializes(model, el, g)));
    if (kind.check) ask(`check ${el.id}`, () => problems(kind.check, model, el, ids));
    if (kind.glyph) ask(`glyph ${el.id}`, () => kind.glyph(model, el));
    if (kind.definedBy) ask(`options ${el.id}`, () => M.FIELDS.type.options(model, el));
  }
  model.relationships.forEach((rel) => {
    const kind = M.RELATIONSHIPS[rel.kind];
    const a = ids.get(rel.from);
    const b = ids.get(rel.to);
    ask(`describeRel ${rel.id}`, () => M.describeRel(model, rel));
    ask(`labelFor ${rel.id}`, () => M.labelFor(model, rel.id));
    ask(`commonOwner ${rel.id}`, () => M.commonOwner(model, a, b));
    ask(`first ${rel.id}`, () => kind.first(model, a, ids));
    ask(`ends ${rel.id}`, () => kind.ends(model, a, b, ids));
    ask(`owner ${rel.id}`, () => kind.owner(model, rel, ids));
    if (kind.check) ask(`check ${rel.id}`, () => problems(kind.check, model, rel, ids));
    if (typeof kind.line.label === 'function') ask(`label ${rel.id}`, () => kind.line.label(rel, model, ids));
    if (rel.kind === 'FlowConnectionUsage') ask(`flowEnd ${rel.id}`, () => [M.flowEnd(model, rel, 'from', ids), M.flowEnd(model, rel, 'to', ids)]);
  });
  // The palette's rules on pairs of elements no line joins.
  els.forEach((a, i) => {
    const b = els[(i * 5 + 1) % els.length];
    Object.keys(M.RELATIONSHIPS).forEach((k) => ask(`ends ${k} ${a.id} ${b.id}`, () => M.RELATIONSHIPS[k].ends(model, a, b, ids)));
  });
  model.views.forEach((view) => {
    const kind = M.VIEW_KINDS[view.kind];
    ask(`labelFor ${view.id}`, () => M.labelFor(model, view.id));
    ask(`browserRoots ${view.id}`, () => M.browserRoots(model, view));
    ask(`browserRows ${view.id}`, () => M.browserRows(model, view));
    if (kind.check) ask(`check ${view.id}`, () => problems(kind.check, model, view, ids));
  });
  Object.keys(M.KINDS).forEach((k) => ask(`elementsOfKind ${k}`, () => M.elementsOfKind(model, k)));
  Object.keys(M.RELATIONSHIPS).forEach((k) => ask(`linesOfKind ${k}`, () => M.linesOfKind(model, k)));
  ask('options item', () => M.FIELDS.item.options(model));
  ask('options interfaceDef', () => M.FIELDS.interfaceDef.options(model));
  ask('messagesInOrder', () => M.messagesInOrder(model));
  ask('sendWord', () => ['api', 'p.data', 'nowhere'].map((t) => M.sendWord(model, t)));
  return lines;
}

// The helpers' answers on a model inside a reading, given the look's own ids and given a new index, against their
// answers outside one.
function assertSameInside(name, model) {
  const outside = answers(model, M.index(model));
  for (const [given, ids] of [['the look\'s ids', () => M.idsOf(model)], ['a new index', () => M.index(model)]]) {
    const inside = M.reading(model, () => answers(model, ids()));
    assert.equal(inside.length, outside.length, `${name}: as many answers inside a reading`);
    outside.forEach((line, i) => assert.equal(inside[i], line, `${name}, inside a reading with ${given}`));
  }
  // validate and toSysML read the model themselves, nested in a reading or not.
  assert.equal(JSON.stringify(M.reading(model, () => M.validate(model))), JSON.stringify(M.validate(model)), `${name}: validate`);
  assert.equal(M.reading(model, () => M.toSysML(model, [])), M.toSysML(model, []), `${name}: toSysML`);
  return outside.length;
}

// A part def added at the top of the package, which a look made before it can't know about.
const added = (model) => {
  model.elements.push({ id: 'Added', kind: 'PartDefinition', name: 'Added', abstract: false, doc: '', code: [] });
  return model;
};
const knowsAdded = (model) => M.childrenOf(model, null).some((e) => e.id === 'Added');
// A look whose map of children was made before Added was, so a helper that answers from it doesn't see Added.
function staleLook(model) {
  const look = M.lookups(model);
  M.reading(model, () => M.childrenOf(model, null), look);
  added(model);
  return look;
}

describe('lookups', () => {
  test('inside a reading, every helper and hook answers as it does outside one, on every fixture and on each with problems', () => {
    let asked = 0;
    let problems = 0;
    for (const [name, model] of fixtures()) {
      asked += assertSameInside(name, model);
      const bad = troubled(model);
      problems += M.validate(bad).length;
      asked += assertSameInside(name + ' with problems', bad);
    }
    assert.ok(asked > 10000, `${asked} answers compared`);
    assert.ok(problems > 100, `the models with problems have ${problems}`);
  });

  test('inside a reading, every helper and hook answers as it does outside one, on a generated model of 300 elements', () => {
    const model = M.normalize(scaleModel(300));
    assert.equal(model.elements.length, 300);
    assert.ok(assertSameInside('scale 300', model) > 10000);
  });

  test('a reading answers from the look it is given, and puts back the reading around it once it ends, nested or after a throw', () => {
    const [, first] = fixtures()[1];
    const [, second] = fixtures()[2];
    const a = copy(first);
    const b = copy(second);
    const lookA = staleLook(a);
    const lookB = staleLook(b);
    assert.ok(knowsAdded(a) && knowsAdded(b), 'outside a reading, the helpers look through the model');
    M.reading(a, () => {
      assert.ok(!knowsAdded(a), 'inside a reading, they answer from its look');
      M.reading(b, () => {
        assert.ok(!knowsAdded(b), 'a reading of another model inside it answers from its own look');
        assert.ok(!knowsAdded(a), 'and the outer reading still answers for its model');
      }, lookB);
      assert.ok(knowsAdded(b) && !knowsAdded(a), 'once the inner reading ends, the outer one goes on');
      assert.throws(() => M.reading(b, () => { assert.ok(!knowsAdded(b)); throw new Error('thrown inside'); }, lookB), /thrown inside/);
      assert.ok(knowsAdded(b) && !knowsAdded(a), 'and so after the inner reading throws');
      M.reading(a, () => assert.ok(!knowsAdded(a), 'a reading of the same model goes on in this one, whatever look it is given'), M.lookups(a));
      assert.ok(!knowsAdded(a), 'and leaves this one as it was');
    }, lookA);
    assert.ok(knowsAdded(a) && knowsAdded(b), 'after the outer reading, the helpers look through the models again');
    assert.throws(() => M.reading(a, () => { throw new Error('thrown outside'); }, lookA), /thrown outside/);
    assert.ok(knowsAdded(a), 'and so after a reading throws');
    assert.equal(M.reading(a, () => 'value', lookA), 'value', 'a reading returns what fn returns');
    assert.throws(() => M.reading(b, () => 0, lookA), /another model/, 'a look made for another model is refused');
  });

  test('a helper asked about another model inside a reading answers from that model', () => {
    const [, model] = fixtures().find(([name]) => name === 'interconnection.json');
    const twin = copy(model);
    const other = added(copy(model));
    M.reading(model, () => {
      model.elements.forEach((el, i) => {
        const kids = M.childrenOf(twin, el.id);
        assert.equal(JSON.stringify(kids.map((k) => twin.elements.indexOf(k))), JSON.stringify(M.childrenOf(model, el.id).map((k) => model.elements.indexOf(k))), `the same children of ${el.id}`);
        assert.ok(kids.every((k) => twin.elements.includes(k)), `the twin's own children of ${el.id}`);
        const typing = M.typingOf(twin, twin.elements[i]);
        assert.ok(typing === null || twin.relationships.includes(typing), `the twin's own typing of ${el.id}`);
        const inherited = M.inheritedFeatures(twin, twin.elements[i]);
        inherited.forEach((feature) => assert.ok(twin.elements.includes(feature), `the twin's own features inherited by ${el.id}`));
      });
      assert.ok(knowsAdded(other), 'a model that differs is answered as it is');
      assert.ok(!knowsAdded(model));
    });
  });

  test('a look made before names, fields, places and orders change still answers right: it holds the structure only', () => {
    for (const [name, raw] of fixtures().concat([['scale 300', M.normalize(scaleModel(300))]])) {
      const model = troubled(raw);
      const look = M.lookups(model);
      assert.equal(JSON.stringify(M.reading(model, () => M.validate(model), look)), JSON.stringify(M.validate(model)), `${name}, before`);
      model.elements.forEach((el, i) => {
        if (i % 2) el.name = model.elements[(i + 3) % model.elements.length].name;
        if ('direction' in el && i % 3 === 0) el.direction = '';
        if ('parallel' in el) el.parallel = !el.parallel;
      });
      model.relationships.forEach((rel, i) => {
        if ('name' in rel && i % 2) rel.name = i % 4 ? 'line' : model.elements[i % model.elements.length].name;
        if ('guard' in rel) rel.guard = i % 3 ? 'else' : '';
        if ('order' in rel) rel.order = model.relationships.length - i;
      });
      model.views.forEach((view) => { for (const id of Object.keys(view.layout).filter((id, i) => i % 2)) delete view.layout[id]; });
      model.package.name = model.elements.length ? model.elements[0].name || 'P' : 'P';
      assert.equal(JSON.stringify(M.reading(model, () => M.validate(model), look)), JSON.stringify(M.validate(model)), `${name}, after the changes`);
    }
  });
});
