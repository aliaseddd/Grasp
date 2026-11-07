// How the page's store keeps the model, outside a browser: layout 2, the model library's stored.js. A model is split
// into a head (model/current) and parts (model/current/parts/<id>), each within the store's limits, and assembled
// again, JSON for JSON: every fixture, the saved model, and the scale models. A part keeps its id while what it holds
// doesn't change, so a change to one element rewrites one part, and an insertion or a removal at most two; a record
// too large for a part is refused, saying which it is. readStore reads the model from a dump of the store's documents
// the way the page takes it. The library is the one the page holds, run in a vm context, so the checks compare
// strings and JSON, never deepEqual.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { modelLibSource, pageSource } from './helpers.mjs';
import { scaleModel } from './scale-model.mjs';

const CANVAS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = path.join(CANVAS, 'test', 'fixtures');
const KiB = 1024;

function loadLib(source) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(source), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  assert.ok(sandbox.SysMLModel, 'the model-lib script sets window.SysMLModel');
  return sandbox.SysMLModel;
}
const lib = loadLib(pageSource());

const readModel = (file) => JSON.parse(fs.readFileSync(file, 'utf8')).model;
const fixtures = () => fs.readdirSync(FIXTURES).filter((name) => name.endsWith('.json')).sort();
/** The model, normalized as the page holds it. */
const held = (raw) => JSON.parse(JSON.stringify(lib.normalize(raw)));
const bytes = (text) => Buffer.byteLength(text, 'utf8');
/** The documents of a split model, as the store would hold them: the head and each part's body by id. */
function documents(model, extra = {}) {
  const split = lib.splitModel(model);
  const head = lib.storeHead(split, Object.assign({ baseRevision: model.revision, changes: [], updated: '2026-11-07T00:00:00.000Z' }, extra));
  const bodies = new Map(split.parts.map((part) => [part.id, JSON.parse(part.text)]));
  return { split, head, bodies };
}
const assembled = ({ head, bodies }) => lib.assembleModel(JSON.parse(JSON.stringify(head)), (id) => bodies.get(id));
/** The ids in `after` that `before` doesn't have, and the other way round. */
function changedParts(before, after) {
  const was = new Set(before.parts.map((p) => p.id));
  const now = new Set(after.parts.map((p) => p.id));
  return { written: [...now].filter((id) => !was.has(id)), dropped: [...was].filter((id) => !now.has(id)) };
}
/** Asserts that `run` throws an error whose record says what can't be stored, and returns the record. */
function refused(run, what) {
  let error = null;
  try { run(); } catch (e) { error = e; }
  assert.ok(error && error.record, `${what} is refused with a record saying why, not ${error ? error.stack : 'accepted'}`);
  return JSON.parse(JSON.stringify(error.record));
}

describe('the store\'s layout 2', () => {
  test('a model split into a head and parts and assembled again is the model, JSON for JSON: every fixture, the saved model, the scale models', () => {
    const models = fixtures().map((name) => [name, readModel(path.join(FIXTURES, name))]);
    models.push(['state.json', readModel(path.join(CANVAS, 'state.json'))]);
    for (const count of [31, 1000, 10000]) models.push([`the scale model of ${count}`, scaleModel(count)]);
    for (const [name, raw] of models) {
      const model = held(raw);
      const docs = documents(model);
      const text = JSON.stringify(model);
      const back = assembled(docs);
      assert.equal(JSON.stringify(back), text, `${name}: assembled again, it is the model`);
      assert.equal(JSON.stringify(lib.normalize(back)), text, `${name}: normalize gives the same model from it`);
      assert.equal(lib.STORE.layout, 2);
      assert.equal(docs.head.layout, 2, `${name}: the head names its layout`);
      assert.equal(docs.head.baseRevision, model.revision, `${name}: the head has its base revision`);
      assert.deepEqual(['elements', 'relationships', 'views'].map((list) => docs.head[list]), [model.elements.length, model.relationships.length, model.views.length],
        `${name}: the head counts each list's records`);
      for (const part of docs.split.parts) {
        assert.match(part.id, /^[0-9a-f]{16}$/, `${name}: a part's id is 16 hex digits`);
        assert.equal(JSON.stringify(JSON.parse(part.text)), part.text, `${name}: a part's text is its body's JSON`);
        assert.equal(part.bytes, bytes(part.text), `${name}: a part knows its size in UTF-8`);
      }
    }
  });

  test('the round trip keeps what a model written by hand holds: key orders, a view without a layout, a field after the lists', () => {
    // Keys that look like numbers come first in an object, whatever order they were written in; the layout keeps them
    // in its own order, and so does the model.
    const model = {
      format: 'stronghold-canvas/2', revision: 'r1', package: { name: 'P', doc: 'd' },
      elements: [{ id: 'b', kind: 'PartDefinition', name: 'B' }, { id: '2', kind: 'PartDefinition', name: 'Two', doc: 'é ✓ 𝄞' }],
      relationships: [{ id: 'r', kind: 'Specialization', from: 'b', to: '2' }],
      views: [
        { id: 'v1', kind: 'GeneralView', name: 'v', layout: { b: { x: 1, y: 2, w: 3, h: 4 }, 2: { x: 5, y: 6, w: 7, h: 8 } }, options: { roots: ['b'] } },
        { id: 'v2', kind: 'GridView', name: 'no layout', options: {} },
        { id: 'v3', kind: 'GeneralView', name: 'empty', layout: {} },
      ],
      extra: { kept: [1, 2, 3] },
    };
    const docs = documents(model);
    assert.equal(JSON.stringify(assembled(docs)), JSON.stringify(model), 'assembled again, it is the model written by hand');
    assert.deepEqual(Object.keys(docs.head), ['layout', 'baseRevision', 'format', 'revision', 'package', 'elements', 'relationships', 'views', 'extra', 'parts', 'changes', 'updated'],
      'the head holds the model\'s fields in its order, between the store\'s');
    const records = docs.split.parts.flatMap((part) => JSON.parse(part.text).records);
    assert.equal(JSON.stringify(records.slice(3)), JSON.stringify([
      { id: 'v1', kind: 'GeneralView', name: 'v', layout: 2, options: { roots: ['b'] } }, ['2', { x: 5, y: 6, w: 7, h: 8 }], ['b', { x: 1, y: 2, w: 3, h: 4 }],
      { id: 'v2', kind: 'GridView', name: 'no layout', options: {} },
      { id: 'v3', kind: 'GeneralView', name: 'empty', layout: 0 },
    ]), 'a view\'s record holds the number of its layout\'s entries, which follow it in the layout\'s order');
    for (const own of ['layout', 'parts', 'changes', 'updated', 'baseRevision']) {
      assert.throws(() => lib.splitModel(Object.assign({}, model, { [own]: 1 })), /the head of the model keeps that name/, `a model can't have a field named ${own}`);
    }
  });

  test('a head and parts that don\'t fit together are an error, and a missing part makes no model yet', () => {
    const docs = documents(held(scaleModel(1000)));
    assert.ok(docs.split.parts.length > 1, 'the model has more than one part');
    const missing = new Map(docs.bodies);
    missing.delete(docs.head.parts[1]);
    assert.equal(lib.assembleModel(docs.head, (id) => missing.get(id)), null, 'while a part is missing there is no model');
    assert.throws(() => assembled({ head: Object.assign({}, docs.head, { elements: docs.head.elements + 1 }), bodies: docs.bodies }), /hold/, 'more records counted than held');
    assert.throws(() => assembled({ head: Object.assign({}, docs.head, { views: docs.head.views - 1 }), bodies: docs.bodies }), /more than its head counts/, 'fewer counted than held');
  });

  test('at 10,000 elements every part is within 192 KiB, the head within 256 KiB, and each within 32 levels', () => {
    const model = held(scaleModel(10000));
    const changes = Array.from({ length: 200 }, (_, i) => ({ at: '2026-11-07T00:00:00.000Z', text: `Renamed part def Service${i} to Service${i}b`, key: 'f-name' }));
    const { split, head, bodies } = documents(model, { changes });
    for (const part of split.parts) {
      const body = bodies.get(part.id);
      assert.ok(bytes(JSON.stringify(body)) <= 192 * KiB, `part ${part.id} is ${bytes(JSON.stringify(body))} bytes`);
      assert.ok(lib.measureBody(body).depth <= 32, `part ${part.id} nests within 32 levels`);
    }
    const size = lib.measureBody(head);
    assert.ok(size.bytes <= 256 * KiB && size.depth <= 32, `the head is ${size.bytes} bytes, ${size.depth} levels`);
    assert.equal(head.changes.length, 200, 'the head keeps the 200 newest changes when they fit');
    const total = split.parts.reduce((sum, part) => sum + part.bytes, 0);
    const average = total / split.parts.length;
    assert.ok(average > 32 * KiB && average < 128 * KiB, `a part averages about 64 KiB: ${(average / KiB).toFixed(1)} KiB over ${split.parts.length} parts`);
  });

  test('a part keeps its id while what it holds doesn\'t change; one name changed changes one part', () => {
    const model = held(scaleModel(10000));
    const before = lib.splitModel(model);
    assert.deepEqual(lib.splitModel(JSON.parse(JSON.stringify(model))).parts.map((p) => p.id), before.parts.map((p) => p.id), 'the same model gives the same parts');
    for (const at of [0.1, 0.5, 0.9].map((f) => Math.floor(f * model.elements.length))) {
      const renamed = JSON.parse(JSON.stringify(model));
      renamed.elements[at].name += 'X';
      const { written, dropped } = changedParts(before, lib.splitModel(renamed));
      assert.equal(written.length, 1, `renaming element ${at} writes one part`);
      assert.equal(dropped.length, 1, `renaming element ${at} leaves one part unnamed`);
    }
  });

  test('an insertion or a removal in the middle of the elements changes at most two parts, not every part after it', () => {
    const model = held(scaleModel(10000));
    const before = lib.splitModel(model);
    const n = model.elements.length;
    for (let k = 1; k <= 12; k++) {
      const at = Math.floor((n * (k + 6)) / 25);  // spread through the middle half of the elements
      const inserted = JSON.parse(JSON.stringify(model));
      inserted.elements.splice(at, 0, { id: `e-new-${k}`, kind: 'PartDefinition', name: `New${k}`, doc: '', abstract: false, code: [] });
      let change = changedParts(before, lib.splitModel(inserted));
      assert.ok(change.written.length <= 2 && change.dropped.length <= 2, `inserting at ${at} writes ${change.written.length} parts and drops ${change.dropped.length}`);
      const removed = JSON.parse(JSON.stringify(model));
      removed.elements.splice(at, 1);
      change = changedParts(before, lib.splitModel(removed));
      assert.ok(change.written.length <= 2 && change.dropped.length <= 2, `removing at ${at} writes ${change.written.length} parts and drops ${change.dropped.length}`);
    }
  });

  test('a record too large for a part, or nested too deep for a document, is refused with its id; a head too large too', () => {
    const model = held(JSON.parse(fs.readFileSync(path.join(FIXTURES, 'interconnection.json'), 'utf8')).model);
    const big = JSON.parse(JSON.stringify(model));
    big.elements[2].doc = 'x'.repeat(200 * KiB);
    let record = refused(() => lib.splitModel(big), 'an element with a 200 KiB doc');
    assert.equal(record.list, 'elements');
    assert.equal(record.id, big.elements[2].id, 'the record names the element');
    assert.equal(record.why, 'bytes');
    assert.equal(record.field, 'doc', 'and the field that takes the room');
    assert.ok(record.bytes > 200 * KiB && record.limit === 192 * KiB, `it says how large: ${JSON.stringify(record)}`);

    const view = JSON.parse(JSON.stringify(model));
    view.views[0].doc = 'é'.repeat(100 * KiB);  // 200 KiB in UTF-8
    record = refused(() => lib.splitModel(view), 'a view whose doc is 200 KiB in UTF-8');
    assert.deepEqual([record.list, record.id, record.field], ['views', view.views[0].id, 'doc']);

    const deep = JSON.parse(JSON.stringify(model));
    let nested = 'bottom';
    for (let i = 0; i < 31; i++) nested = [nested];
    deep.views[0].options = { nested };
    record = refused(() => lib.splitModel(deep), 'a view nested 34 levels deep in its part');
    assert.deepEqual([record.list, record.id, record.why, record.field], ['views', deep.views[0].id, 'depth', 'options']);

    const wordy = JSON.parse(JSON.stringify(model));
    wordy.package.doc = 'y'.repeat(300 * KiB);
    record = refused(() => lib.storeHead(lib.splitModel(wordy), { baseRevision: 'r', changes: [], updated: 'now' }), 'a package with a 300 KiB doc');
    assert.deepEqual([record.list, record.why, record.field], ['head', 'bytes', 'package']);
  });

  test('a head that would pass 256 KiB leaves out its oldest changes until it fits', () => {
    const split = lib.splitModel(held(scaleModel(1000)));
    const changes = Array.from({ length: 200 }, (_, i) => ({ at: `t${i}`, text: `change ${i} `.padEnd(2 * KiB, '.') }));
    const head = lib.storeHead(split, { baseRevision: 'r', changes, updated: 'now' });
    assert.ok(lib.measureBody(head).bytes <= 256 * KiB, 'the head fits');
    assert.ok(head.changes.length > 100 && head.changes.length < 200, `it keeps some of the changes: ${head.changes.length}`);
    assert.equal(head.changes[head.changes.length - 1].at, 't199', 'the newest change is kept');
    assert.equal(head.changes[0].at, `t${200 - head.changes.length}`, 'the oldest are left out');
  });

  test('storedKey says when two heads hold the same model, whatever their changes and times', () => {
    const model = held(scaleModel(31));
    const a = documents(model, { changes: [{ at: '1', text: 'one' }], updated: 'then' }).head;
    const b = documents(model, { changes: [], updated: 'now' }).head;
    const renamed = JSON.parse(JSON.stringify(model));
    renamed.package.name = 'Other';
    assert.equal(lib.storedKey(a), lib.storedKey(b), 'the same model');
    assert.notEqual(lib.storedKey(a), lib.storedKey(documents(renamed).head), 'another model');
  });

  test('readStore reads the model from a dump as the page takes it: model/working before model/current, one based on the revision first', () => {
    const model = held(readModel(path.join(FIXTURES, 'grid.json')));
    const { head, bodies } = documents(model);
    const dump = { 'model/current': head, 'notes/n2': { no: 2, target: null, x: 1, y: 2, text: 'second' }, 'notes/n1': { no: 1, target: model.elements[0].id, text: 'first' },
      'archive/a1': { no: 3, target: null, x: 0, y: 0, text: 'old', archived: 'then', resolution: 'done' }, 'model/current/elsewhere/x': { no: 9 } };
    bodies.forEach((body, id) => { dump[`model/current/parts/${id}`] = body; });
    let read = JSON.parse(JSON.stringify(lib.readStore(dump, model.revision)));
    assert.equal(read.from, 'model/current');
    assert.equal(JSON.stringify(read.model), JSON.stringify(model), 'the head and its parts make the model');
    assert.deepEqual(read.notes.map((n) => n.id), ['n1', 'n2'], 'the notes, each with its id, in the order of their numbers');
    assert.deepEqual(read.archive.map((n) => [n.id, n.resolution]), [['a1', 'done']], 'the archived notes');

    const handed = JSON.parse(JSON.stringify(model));
    handed.package.name = 'Handed';
    dump['model/working'] = { baseRevision: model.revision, model: handed, changes: [], updated: 'now' };
    read = lib.readStore(dump, model.revision);
    assert.deepEqual([read.from, read.model.package.name], ['model/working', 'Handed'], 'a whole model handed over is taken first');
    dump['model/working'].baseRevision = 'another';
    read = lib.readStore(dump, model.revision);
    assert.equal(read.from, 'model/current', 'one based on the revision is taken before one that isn\'t');
    assert.equal(lib.readStore(dump).from, 'model/working', 'with no revision given, model/working comes first');

    const lost = Object.assign({}, dump);
    delete lost['model/working'];
    delete lost[`model/current/parts/${head.parts[0]}`];
    assert.throws(() => lib.readStore(lost, model.revision), /names a part the dump doesn't hold/);
    assert.throws(() => lib.readStore({ 'model/current': Object.assign({}, head, { layout: 3 }) }), /newer version of the canvas/);
    assert.equal(lib.readStore({ 'notes/n1': { no: 1, target: null, x: 0, y: 0, text: 't' } }).model, null, 'a store with no model has none');
  });
});
