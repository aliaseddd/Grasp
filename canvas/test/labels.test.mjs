// Label editing, as SysON's direct edit: the library's reading of a label's text (readLabel), the text an editor starts
// from (labelText), and what a text changes (applyLabel), in Node on the Stronghold example and the fixtures.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { EXAMPLE, modelLibSource } from './helpers.mjs';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

// As in model-lib.test.mjs: the library run in a vm context with a bare window; its values belong to the context's
// realm, so the checks compare strings and JSON, never deepEqual.
function loadLib() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  return sandbox.SysMLModel;
}
const M = loadLib();
const json = (v) => JSON.parse(JSON.stringify(v));
const stateOf = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const modelOf = (file) => M.normalize(json(stateOf(file).model));
// The page's makers, as plain objects: a new element with its kind's fields blank, a new line, each with an id of its
// own, as the page's newId gives.
let made = 0;
function maker() {
  const next = () => ++made;
  return {
    element(kind, name) {
      const e = { id: 'new' + next(), kind, name, doc: '' };
      M.KINDS[kind].fields.forEach((f) => {
        const s = M.FIELDS[f];
        if (!s || s.stored === false || e[f] !== undefined) return;
        e[f] = s.type === 'bool' ? false : s.type === 'enum' ? s.values[0] : '';
      });
      return e;
    },
    line(kind, from, to) { return { id: 'rnew' + next(), kind, from, to }; },
  };
}
// Applies text to the element or line id of a model; returns { model, item, res } as plain JSON.
function edit(model, id, text) {
  const item = model.elements.find((e) => e.id === id) || model.relationships.find((r) => r.id === id);
  const type = model.elements.indexOf(item) >= 0 ? 'el' : 'rel';
  const res = M.applyLabel(model, { type, item }, text, maker());
  return { model, item, res: json(res), text: M.labelText(model, { type, item }) };
}
const read = (text) => json(M.readLabel(text));
const typing = (model, id) => json(model.relationships.filter((r) => r.kind === 'FeatureTyping' && r.from === id));
const generals = (model, id) => json(model.relationships.filter((r) => r.kind === 'Specialization' && r.from === id).map((r) => r.to));

describe('label editing: reading a label', () => {
  test('a node label: keywords, ref, a short name, a name with spaces, a multiplicity before or after the type', () => {
    assert.deepEqual(read('wheels[4] : Wheel'), { prefixes: [], ref: false, suffixes: [], unread: [], blank: false, name: 'wheels', multiplicity: { text: '4' }, typing: { steps: ['Wheel'], conjugated: false } });
    const after = read('wheels : Wheel [1 .. *]');
    assert.equal(after.name, 'wheels');
    assert.equal(after.multiplicity.text, '1..*', 'the bounds are written the canvas\'s way');
    assert.deepEqual(after.typing.steps, ['Wheel']);
    const keyed = read('abstract variation ref <1.1> front wheel :> wheels');
    assert.deepEqual(keyed.prefixes, ['abstract', 'variation']);
    assert.equal(keyed.ref, true);
    assert.equal(keyed.short, '1.1');
    assert.equal(keyed.name, 'front wheel', 'a name keeps its inner spaces');
    assert.deepEqual(keyed.subsets.steps, ['wheels']);
    assert.equal(read('abstractPart').name, 'abstractPart', 'a keyword with no space after it starts a name');
    assert.equal(read('ref').name, 'ref');
  });

  test('references: qualified, quoted, conjugated; a bare operator takes its part away only when it comes first', () => {
    assert.deepEqual(read('x : Package1::Engine').typing.steps, ['Package1', 'Engine']);
    assert.deepEqual(read('x : \'My: Type\'').typing.steps, ['My: Type'], 'a quoted name may hold what ends a name');
    assert.deepEqual(read('x : My Type').typing.steps, ['My Type'], 'an unquoted reference keeps its inner spaces');
    assert.equal(read('port : ~Api').typing.conjugated, true);
    assert.equal(read(': ~Api').name, undefined, 'a text that starts with its typing leaves the name out');
    assert.deepEqual(read('x :').typing, { remove: true });
    assert.deepEqual(read('x [4] :>').subsets, { remove: true }, 'after the multiplicity, :> is still the first part');
    assert.deepEqual(read('x :>>').redefines, { remove: true });
    assert.deepEqual(read('[]').multiplicity, { text: '' });
    const late = read('x : T :>');
    assert.deepEqual(late.typing.steps, ['T']);
    assert.equal(late.subsets, undefined, 'a bare :> after another part takes nothing away');
    assert.deepEqual(late.unread, [':>']);
  });

  test('what a label doesn\'t set, and what can\'t be read', () => {
    assert.equal(read('x = 5').value, '= 5');
    assert.equal(read('x := 5').value, ':= 5');
    assert.equal(read('x default 5').value, 'default 5');
    assert.equal(read('defaultValue').name, 'defaultValue');
    assert.deepEqual(read('x ordered nonunique').suffixes, ['ordered', 'nonunique']);
    assert.deepEqual(read('x [a]').unread, ['[a]']);
    assert.deepEqual(read('x [4] [5]').unread, ['[5]'], 'one multiplicity is read');
    assert.deepEqual(read('a::b').unread, ['::b']);
    assert.deepEqual(read('x :> y :>> z').unread, [':>> z'], 'one of :> and :>> is read');
    assert.equal(read('   ').blank, true);
  });
});

describe('label editing: the text an editor starts from', () => {
  test('a usage: its name, its multiplicity, its definition (~ when conjugated); a definition: what it specializes', () => {
    const model = modelOf(EXAMPLE);
    const text = (id) => M.labelText(model, { type: 'el', item: model.elements.find((e) => e.id === id) });
    assert.equal(text('Page.hosts'), 'hosts[1..*] : Host');
    assert.equal(text('Page.hosts.api'), 'api : ~StrongholdApp');
    assert.equal(text('Page.app.api'), 'api : StrongholdApp');
    assert.equal(text('ServerHost'), 'ServerHost :> Host');
    assert.equal(text('Host'), 'Host', 'a definition\'s abstract is not in the text, as in SysON');
    const mount = model.relationships.find((r) => r.id === 'mount');
    assert.equal(M.labelText(model, { type: 'rel', item: mount }), 'mount');
  });

  test('an interface\'s definition; a name that would end a reference is quoted, and read back whole', () => {
    const model = modelOf(path.join(FIXTURES, 'interconnection.json'));
    const fuelLine = model.relationships.find((r) => r.id === 'fuelLine');
    assert.equal(M.labelText(model, { type: 'rel', item: fuelLine }), 'fuelLine : FuelLine');
    const host = modelOf(EXAMPLE);
    host.elements.find((e) => e.id === 'Host').name = 'Host: base';
    const server = { type: 'el', item: host.elements.find((e) => e.id === 'ServerHost') };
    assert.equal(M.labelText(host, server), 'ServerHost :> \'Host: base\'');
    assert.equal(json(M.applyLabel(host, server, M.labelText(host, server), maker())).done.length, 0, 'read back, it names the same one');
  });

  test('every label in the example and the fixtures, edited to the text it starts from, stays as it is', () => {
    const files = [EXAMPLE].concat(fs.readdirSync(FIXTURES).filter((f) => f.endsWith('.json')).map((f) => path.join(FIXTURES, f)));
    let count = 0;
    files.forEach((file) => {
      const model = modelOf(file);
      const before = JSON.stringify(model);
      const targets = model.elements.map((item) => ({ type: 'el', item })).concat(model.relationships.map((item) => ({ type: 'rel', item })));
      targets.filter((t) => M.labelEditable(t.type, t.item)).forEach((t) => {
        const res = json(M.applyLabel(model, t, M.labelText(model, t), maker()));
        assert.deepEqual(res, { done: [], created: [], notKept: [], unread: [], refused: [] }, path.basename(file) + ' ' + t.item.id);
        count++;
      });
      assert.equal(JSON.stringify(model), before, path.basename(file) + ' is as it was');
    });
    assert.ok(count > 100, 'many labels were tried: ' + count);
  });
});

describe('label editing: what a text changes', () => {
  test('only what is typed changes: a name keeps the type and the multiplicity; the same text changes nothing', () => {
    const model = modelOf(EXAMPLE);
    const before = JSON.stringify(model);
    const same = edit(model, 'Page.hosts', 'hosts[1..*] : Host');
    assert.deepEqual(same.res.done, []);
    assert.equal(JSON.stringify(model), before, 'the model is as it was');
    const renamed = edit(model, 'Page.hosts', 'servers');
    assert.deepEqual(renamed.res.done, ['renamed it servers']);
    assert.equal(renamed.text, 'servers[1..*] : Host');
    const counted = edit(model, 'Page.hosts', '[2..*]');
    assert.equal(counted.item.multiplicity, '2..*');
    assert.equal(counted.item.name, 'servers', 'a text without a name keeps the name');
    assert.deepEqual(edit(model, 'Page.hosts', 'servers []').res.done, ['took its multiplicity away']);
    assert.deepEqual(edit(model, 'Page.hosts', '  ').res.done, ['took its name away'], 'a blank text takes the name away');
  });

  test('a type: retyped on the same typing line, made when no definition has the name, taken away by a bare colon', () => {
    const model = modelOf(EXAMPLE);
    const line = typing(model, 'Page.hosts')[0].id;
    const app = edit(model, 'Page.hosts', 'hosts : App');
    assert.deepEqual(app.res.done, ['defined it by App']);
    assert.deepEqual(typing(model, 'Page.hosts').map((r) => [r.id, r.to]), [[line, 'App']], 'the same line takes the new end, so its notes stay');
    const wheel = edit(model, 'Page.hosts', 'hosts : Wheel');
    assert.deepEqual(wheel.res.done, ['defined it by Wheel, a new part def']);
    const made = model.elements.find((e) => e.name === 'Wheel');
    assert.equal(made.kind, 'PartDefinition');
    assert.equal(made.owner, undefined, 'a new definition sits at the top of the package');
    assert.ok(model.views.every((v) => !v.layout[made.id]), 'it is shown in no view');
    assert.equal(typing(model, 'Page.hosts')[0].to, made.id);
    const gone = edit(model, 'Page.hosts', 'hosts :');
    assert.deepEqual(gone.res.done, ['took its definition away']);
    assert.equal(typing(model, 'Page.hosts').length, 0);
    const fresh = edit(model, 'Page.app', 'app : Wheel [2]');
    assert.equal(typing(model, 'Page.app')[0].to, made.id, 'a name now known is found, not made again');
    assert.equal(model.elements.filter((e) => e.name === 'Wheel').length, 1);
    assert.equal(fresh.item.multiplicity, '2');
    const untyped = modelOf(EXAMPLE);
    untyped.relationships = untyped.relationships.filter((r) => !(r.kind === 'FeatureTyping' && r.from === 'Page.app'));
    edit(untyped, 'Page.app', 'app : Host');
    assert.equal(typing(untyped, 'Page.app')[0].hidden, true, 'a new typing shows as text, as one picked in the panel');
  });

  test('a port\'s ~; the definition\'s kind; a path that names nothing; a definition\'s own type part is left aside', () => {
    const model = modelOf(EXAMPLE);
    assert.deepEqual(edit(model, 'Page.hosts.api', 'api : StrongholdApp').res.done, ['unconjugated it']);
    assert.deepEqual(edit(model, 'Page.hosts.api', 'api : ~StrongholdApp').res.done, ['conjugated it']);
    const wrong = edit(model, 'Page.hosts.api', 'api : ~App');
    assert.deepEqual(wrong.res.done, []);
    assert.deepEqual(wrong.res.refused, ['port api in hosts can only be defined by a port def.']);
    const nothing = edit(model, 'Page.hosts.api', 'api : ~Nothing');
    assert.deepEqual(nothing.res.refused, ['There is no port def Nothing to conjugate.'], '~ never makes a definition');
    assert.deepEqual(edit(model, 'Page.hosts', 'hosts : Nope::Host').res.refused, ['There is no part def at Nope::Host to define part hosts in Page by.']);
    assert.deepEqual(edit(model, 'Page.hosts', 'hosts : StrongholdProof::App').res.done, ['defined it by App'], 'a path from the package');
    const def = edit(model, 'Host', 'Host : App');
    assert.deepEqual(def.res, { done: [], created: [], notKept: [], unread: [], refused: [] }, 'a definition\'s typing is left aside');
    assert.deepEqual(edit(model, 'Page.app', 'app : ~App').res.refused, ['A part isn\'t conjugated with ~; only a port is.']);
  });

  test(':> on a definition specializes, keeps the canvas\'s rules, and makes the general one; :> on a usage subsets beside it', () => {
    const model = modelOf(EXAMPLE);
    assert.deepEqual(edit(model, 'ServerHost', 'ServerHost :> OnlineHost').res.done, ['made it specialize OnlineHost']);
    assert.deepEqual(generals(model, 'ServerHost'), ['OnlineHost'], 'the first line takes the new end');
    const circle = edit(model, 'Host', 'Host :> ServerHost');
    assert.deepEqual(circle.res.refused, ['Specializing part def ServerHost would go round in a circle: it already specializes part def Host.']);
    const kind = edit(model, 'Host', 'Host :> StrongholdApp');
    assert.deepEqual(kind.res.refused, ['part def Host can only specialize another part def.']);
    const made = edit(model, 'DevHost', 'DevHost :> Local Host');
    assert.deepEqual(made.res.done, ['made it specialize Local Host, a new part def']);
    assert.deepEqual(edit(model, 'DevHost', 'DevHost :>').res.done, ['took its specialization away']);
    assert.deepEqual(generals(model, 'DevHost'), []);
    // Usages: a part subsets a part in the same box; one elsewhere is refused by the rule; a new one is made beside it.
    assert.deepEqual(edit(model, 'Page.hosts', 'hosts :> app').res.done, ['made it subset app']);
    assert.deepEqual(edit(model, 'Host.api', 'api :> api').res.refused, ['port api in Host can\'t be made to subset itself.'], 'a usage never finds itself');
    model.elements.push({ id: 'spare', kind: 'PartUsage', name: 'spare', multiplicity: '', doc: '' });
    const far = edit(model, 'Page.hosts', 'hosts :> spare');
    assert.equal(far.res.done.length, 0);
    assert.deepEqual(far.res.refused, ['part hosts in Page and part spare must sit in the same box for one to specialize the other.']);
    model.elements.push({ id: 'Wheel', kind: 'PartUsage', name: 'Wheel', multiplicity: '', doc: '' });
    assert.deepEqual(edit(model, 'Wheel', 'Wheel : Wheel').res.refused, ['part Wheel can\'t be defined by itself.'], 'no part def is made beside the part with its name');
    model.elements.pop();
    model.elements.pop();
    const beside = edit(model, 'Page.app', 'app :> base');
    assert.deepEqual(beside.res.done, ['made it subset base, a new part']);
    assert.equal(model.elements.find((e) => e.name === 'base').owner, 'Page', 'beside the part that subsets it');
    assert.equal(M.validate(model).filter((p) => /round in a circle|same box|can only/.test(p.message)).length, 0, 'nothing the rules refuse was made');
  });

  test('what the canvas doesn\'t hold yet is not kept; a definition\'s keywords are left aside; its abstract stays', () => {
    const model = modelOf(EXAMPLE);
    const usage = edit(model, 'Page.hosts', 'abstract ref <1.1> hosts :>> base = 5 ordered');
    assert.deepEqual(usage.res.done, []);
    assert.deepEqual(usage.res.notKept, ['abstract', 'ref', '<1.1>', ':>> base', '= 5 ordered']);
    const def = edit(model, 'Host', 'abstract Host [3]');
    assert.deepEqual(def.res.notKept, ['[3]'], 'a definition has no multiplicity here');
    assert.equal(def.item.abstract, true, 'a label never changes a definition\'s abstract');
    assert.equal(edit(model, 'Host', 'Host').item.abstract, true, 'leaving abstract out doesn\'t clear it either');
    assert.deepEqual(edit(model, 'Page.hosts', 'hosts [many]').res.unread, ['[many]']);
    assert.equal(M.labelLeftOut(json({ refused: ['No.'], notKept: ['ref', '<1>'], unread: ['[a]'] })),
      'No. Not kept, as the canvas doesn\'t hold it yet: ref, <1>. Couldn\'t read: [a].');
  });

  test('lines: a name, an interface\'s definition; a flow\'s typing isn\'t kept; a binding ignores :>; a transition isn\'t edited', () => {
    const model = modelOf(path.join(FIXTURES, 'interconnection.json'));
    assert.deepEqual(edit(model, 'sensing', 'sensor link').res.done, ['renamed it sensor link']);
    const iface = edit(model, 'fuelLine', 'fuelLine : CtrlLink');
    assert.deepEqual(iface.res.done, ['defined it by CtrlLink']);
    assert.equal(iface.item.interfaceDef, 'CtrlLink');
    assert.deepEqual(edit(model, 'fuelLine', 'fuelLine : DataLink').res.done, ['defined it by DataLink, a new interface def']);
    assert.deepEqual(edit(model, 'fuelLine', 'fuelLine :').res.done, ['took its interface def away']);
    assert.deepEqual(edit(model, 'fuelLine', 'fuelLine : Fuel').res.refused, ['The interface fuelLine can only be defined by an interface def; item def Fuel isn\'t one.']);
    assert.deepEqual(edit(model, 'command', 'command : Fuel [2]').res.notKept, ['[2]', ': Fuel']);
    const binding = edit(model, 'outletBinding', 'tie :> other :>> more');
    assert.deepEqual(binding.res.done, ['renamed it tie']);
    assert.deepEqual(binding.res.notKept, [], 'a binding\'s label leaves :> and :>> aside, as SysON\'s does');
    const states = modelOf(path.join(FIXTURES, 'behavior-states.json'));
    const before = JSON.stringify(states);
    assert.deepEqual(edit(states, 't-mount', 'renamed').res.done, []);
    assert.equal(JSON.stringify(states), before, 'a transition\'s label is not edited');
    const actions = modelOf(path.join(FIXTURES, 'behavior-actions.json'));
    assert.deepEqual(edit(actions, 's-compiled', 'built :> x').res, { done: ['renamed it built'], created: [], notKept: [':> x'], unread: [], refused: [] });
    assert.deepEqual(edit(actions, 'Release.start', 'go').res.done, [], 'a start node has no name in the text');
  });

  test('the text a model written by label edits exports is valid, and says what the labels said', () => {
    const model = modelOf(EXAMPLE);
    edit(model, 'Page.hosts', 'wheels[4] : Wheel');
    edit(model, 'ServerHost', 'ServerHost :> Machine');
    edit(model, 'Page.hosts.api', 'api : StrongholdApp');
    const text = M.toSysML(M.normalize(json(model)), []);
    assert.match(text, /part wheels : Wheel \[4\]/);
    assert.match(text, /part def Wheel;/);
    assert.match(text, /part def ServerHost :> Machine/);
    assert.match(text, /part def Machine;/);
    assert.match(text, /port api : StrongholdApp;/);
    assert.deepEqual(json(M.validate(M.normalize(json(model))).map((p) => p.message)), [], 'no problems');
  });
});
