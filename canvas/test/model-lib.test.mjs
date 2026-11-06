// The page's model library on its own, outside a browser: the <script id="model-lib"> run in a vm context with a bare
// `window`, then SysMLModel.toSysML on the model the page embeds, and normalize on a format-1 state file and on every
// fixture. Values made inside the context belong to its own realm, so the checks below use typeof, Array.isArray and
// length, never deepEqual (its prototypes would differ).

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { embeddedModel, modelLibSource, pageSource } from './helpers.mjs';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

function loadLib(source) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(source), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  assert.ok(sandbox.SysMLModel, 'the model-lib script sets window.SysMLModel');
  return sandbox.SysMLModel;
}

// A small model for the regression tests: an element is el(id, kind, name, extra) with its owner read from a dotted id
// (A.a1 is owned by A); the one view (a general view unless `view.kind` says otherwise) shows every element, or the ids
// in `view.show`, with `view.options` when given.
function el(id, kind, name, extra) {
  const dot = id.lastIndexOf('.');
  return Object.assign({ id, kind, name }, dot >= 0 ? { owner: id.slice(0, dot) } : {}, extra || {});
}
function small(elements, relationships, view) {
  const layout = {};
  (view && view.show ? view.show : elements.map((e) => e.id)).forEach((id, i) => { layout[id] = { x: 40 + i * 240, y: 40, side: 'right', at: 0.5 }; });
  return { format: 'stronghold-canvas/2', package: { name: 'P', doc: '' }, elements, relationships: relationships || [],
    views: [{ id: 'v1', kind: (view && view.kind) || 'GeneralView', name: 'v', layout, options: (view && view.options) || {} }] };
}
const note = (no, target, text, extra) => Object.assign({ id: 'n' + no, no, target, text, response: '', resolved: false }, extra || {});

describe('model-lib', () => {
  test('toSysML turns the embedded saved model into a package, and validate finds nothing wrong with it', () => {
    const source = pageSource();
    const lib = loadLib(source);
    assert.equal(typeof lib.toSysML, 'function', 'SysMLModel.toSysML');
    assert.equal(typeof lib.validate, 'function', 'SysMLModel.validate');

    const model = embeddedModel(source);
    assert.equal(model.format, 'stronghold-canvas/2', 'the page embeds a format-2 model');
    const text = lib.toSysML(model, []);
    assert.equal(typeof text, 'string');
    assert.match(text, /\bpackage\b/);
    assert.match(text, /view proofStructure : StandardViewDefinitions::GeneralView \{\s+expose StrongholdProof::\*::\*\*;\s+\}/, 'the view exposes everything');
    const problems = lib.validate(model);
    assert.ok(Array.isArray(problems), 'validate returns an array');
    assert.equal(problems.length, 0, `the embedded model validates clean: ${JSON.stringify(problems)}`);
  });

  test('a format-1 model becomes one general view whose layout holds every element where it was, and exports clean', () => {
    const lib = loadLib(pageSource());
    const state = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'format1.json'), 'utf8'));
    assert.equal(state.model.format, 'stronghold-canvas/1');
    const model = lib.normalize(state.model);
    assert.equal(model.format, 'stronghold-canvas/2');
    assert.equal(model.views.length, 1, 'one view');
    const view = model.views[0];
    assert.equal(view.kind, 'GeneralView');
    assert.equal(view.id, 'v1');
    assert.equal(view.name, state.model.view.name, 'named after the old view');
    for (const was of state.model.elements) {
      const lay = view.layout[was.id];
      assert.ok(lay, `the layout places ${was.id}`);
      if (was.x !== undefined) { assert.equal(lay.x, was.x); assert.equal(lay.y, was.y); assert.equal(lay.w, was.w); assert.equal(lay.h, was.h); }
      else { assert.equal(lay.side, was.side); assert.equal(lay.at, was.at); }
      const now = model.elements.find((e) => e.id === was.id);
      assert.ok(now, `${was.id} is still an element`);
      for (const field of ['x', 'y', 'w', 'h', 'side', 'at']) assert.equal(now[field], undefined, `${was.id} carries no ${field} any more`);
    }
    assert.equal(lib.validate(model).length, 0, 'the migrated model validates clean');
    assert.match(lib.toSysML(model, []), /view proofStructure : StandardViewDefinitions::GeneralView \{\s+expose StrongholdProof::\*::\*\*;/);
    // Normalizing again changes nothing: the page can round-trip its own model through the store.
    assert.equal(JSON.stringify(lib.normalize(JSON.parse(JSON.stringify(model)))), JSON.stringify(model), 'normalize is idempotent on its own output');
  });

  test('every fixture normalizes and validates clean', () => {
    const lib = loadLib(pageSource());
    const files = fs.readdirSync(FIXTURES).filter((name) => name.endsWith('.json'));
    assert.ok(files.length >= 1, 'there are fixtures');
    for (const file of files) {
      const state = JSON.parse(fs.readFileSync(path.join(FIXTURES, file), 'utf8'));
      const model = lib.normalize(state.model);
      const problems = lib.validate(model);
      assert.equal(problems.length, 0, `${file} validates clean: ${JSON.stringify(problems)}`);
      assert.match(lib.toSysML(model, state.notes || []), /\bpackage\b/, `${file} exports a package`);
    }
  });

  test('a connection joins parts, ports or items: two actions are refused by the rule and by validate, two items are not', () => {
    const lib = loadLib(pageSource());
    const actions = lib.normalize(small([el('A', 'ActionDefinition', 'A'), el('A.a1', 'ActionUsage', 'a1'), el('A.a2', 'ActionUsage', 'a2')],
      [{ id: 'c', kind: 'ConnectionUsage', from: 'A.a1', to: 'A.a2' }]));
    const ids = lib.index(actions);
    assert.match(lib.RELATIONSHIPS.ConnectionUsage.ends(actions, ids.get('A.a1'), ids.get('A.a2'), ids), /two parts, two ports or two items; action a1 in A is none of those/);
    assert.match(lib.validate(actions).map((p) => p.id + ': ' + p.message).join('\n'), /^c: A connection joins two parts, two ports or two items/m);
    const items = lib.normalize(small([el('S', 'PartDefinition', 'S'), el('S.a', 'PartUsage', 'a'), el('S.b', 'PartUsage', 'b'), el('S.a.i', 'ItemUsage', 'i'), el('S.b.j', 'ItemUsage', 'j')],
      [{ id: 'c', kind: 'ConnectionUsage', from: 'S.a.i', to: 'S.b.j' }]));
    assert.equal(lib.validate(items).length, 0, 'items connect');
    assert.match(lib.toSysML(items, []), /connect a\.i to b\.j;/);
  });

  test('a general view showing a start node but not everything exposes the named elements only; a browser rooted at a start node is a problem', () => {
    const lib = loadLib(pageSource());
    const els = [el('A', 'ActionDefinition', 'A'), el('A.start1', 'StartNode', 'start1'), el('A.a1', 'ActionUsage', 'a1'), el('Other', 'PartDefinition', 'Other')];
    const rels = [{ id: 's1', kind: 'SuccessionAsUsage', from: 'A.start1', to: 'A.a1' }];
    const partial = lib.normalize(small(els, rels, { show: ['A', 'A.start1', 'A.a1'] }));
    assert.equal(lib.validate(partial).length, 0);
    const text = lib.toSysML(partial, []);
    assert.match(text, /expose P::A;\s+expose P::A::a1;\s+\}/, `the action def and the action are exposed:\n${text}`);
    assert.ok(!/start1/.test(text), `the start node's hidden name is nowhere in the text:\n${text}`);
    const browser = lib.normalize(small(els, rels, { kind: 'BrowserView', show: [], options: { roots: ['A.start1'], collapsed: [] } }));
    assert.match(lib.validate(browser).map((p) => p.message).join('\n'), /can't expose its root start in A by name: the text has no name for it/);
    assert.ok(!/start1/.test(lib.toSysML(browser, [])), 'the browser leaves the root out');
  });

  test('a named transition out of an initial node with no entry action is a problem, and so is an unnamed entry action; a note on the unnamed transition is written inside the state', () => {
    const lib = loadLib(pageSource());
    const els = [el('S', 'StateDefinition', 'S'), el('S.initial1', 'InitialNode', 'initial1'), el('S.s1', 'StateUsage', 's1')];
    const transition = (extra) => Object.assign({ id: 't0', kind: 'TransitionUsage', from: 'S.initial1', to: 'S.s1' }, extra || {});
    const named = lib.normalize(small(els, [transition({ name: 'begin' })], { kind: 'StateTransitionView' }));
    assert.match(lib.validate(named).map((p) => p.id + ': ' + p.message).join('\n'), /^t0: The transition out of the initial node carries a name, a doc or an effect only when it leaves an entry action/m);
    const entry = lib.normalize(small(els.concat([el('S.init', 'ActionUsage', '', { role: 'entry' })]), [transition()], { kind: 'StateTransitionView' }));
    assert.match(lib.validate(entry).map((p) => p.message).join('\n'), /The entry action of state def S has no name, so the transition out of the initial node can't leave it/);
    const unnamed = lib.normalize(small(els, [transition()], { kind: 'StateTransitionView' }));
    assert.equal(lib.validate(unnamed).length, 0);
    const text = lib.toSysML(unnamed, [note(1, 't0', 'why start here?')]);
    assert.match(text, /state def S \{\s+entry;\s+then s1;\s+metadata <n1> : Issue \{ text = "On transition initial node in S to s1: why start here\?"; \}\s+metadata StatusInfo about n1 \{ status = StatusKind::open; \}\s+state s1;/,
      `the note is inside the state's body:\n${text}`);
  });

  test('a note on an element the text can\'t name is written inside the element\'s body, never about ::unnamed', () => {
    const lib = loadLib(pageSource());
    const model = lib.normalize(small([el('Page', 'PartDefinition', 'Page'), el('Page.p', 'PartUsage', '')]));
    assert.equal(lib.validate(model).length, 0, 'an unnamed leaf part is legal');
    const text = lib.toSysML(model, [note(1, 'Page.p', 'what is this?')]);
    assert.match(text, /part \{\s+metadata <n1> : Issue \{ text = "what is this\?"; \}\s+metadata StatusInfo about n1 \{ status = StatusKind::open; \}\s+\}/, `the note annotates the part from inside:\n${text}`);
    assert.ok(!/unnamed/.test(text), `nothing is about ::unnamed:\n${text}`);
  });

  test('an element named like a package the geometry text imports (SI, ShapeItems…) is a problem while anything is drawn to scale', () => {
    const lib = loadLib(pageSource());
    const spatial = { shape: 'Box', length: 2, width: 1, height: 1, unit: 'm', posX: 0, posY: 0, posZ: 0 };
    const model = lib.normalize(small([el('SI', 'PartDefinition', 'SI'), el('room', 'PartUsage', 'room', spatial)], [], { kind: 'GeometryView', show: ['room'], options: { scale: 40, unit: 'm' } }));
    assert.match(lib.validate(model).map((p) => p.id + ': ' + p.message).join('\n'), /^SI: The name SI is one the geometry text brings in from the library/m);
    assert.equal(lib.validate(lib.normalize(small([el('SI', 'PartDefinition', 'SI'), el('room', 'PartUsage', 'room')]))).length, 0, 'without geometry the name is free');
  });

  test('a trigger or an accept payload that names no definition of the model is a problem; a definition, a timing or a condition is not', () => {
    const lib = loadLib(pageSource());
    const els = [el('Go', 'PartDefinition', 'Go'), el('S', 'StateDefinition', 'S'), el('S.idle', 'StateUsage', 'idle'), el('S.busy', 'StateUsage', 'busy')];
    const transition = (trigger) => lib.normalize(small(els, [{ id: 't1', kind: 'TransitionUsage', from: 'S.idle', to: 'S.busy', trigger }], { kind: 'StateTransitionView' }));
    assert.match(lib.validate(transition('go')).map((p) => p.id + ': ' + p.message).join('\n'), /^t1: The trigger go of the transition idle to busy names go, which is no definition in the model/m);
    ['Go', 'x : Go', 'after 10 [SI::s]', 'when ready', 'at t'].forEach((t) => assert.equal(lib.validate(transition(t)).length, 0, `${t} is accepted`));
    const accept = lib.normalize(small([el('A', 'ActionDefinition', 'A'), el('A.wait', 'ActionUsage', 'wait', { actionKind: 'accept', payload: 'sig' })]));
    assert.match(lib.validate(accept).map((p) => p.message).join('\n'), /The payload sig of action wait in A names sig, which is no definition in the model/);
  });

  test('a send or accept action is a problem outside an action body, unless it is a state\'s entry, do or exit action', () => {
    const lib = loadLib(pageSource());
    const send = { actionKind: 'send', payload: 'new Alert()' };
    const messages = (elements) => lib.validate(lib.normalize(small([el('Alert', 'ItemDefinition', 'Alert')].concat(elements)))).map((p) => p.message).join('\n');
    assert.match(messages([el('warn', 'ActionUsage', 'warn', send)]), /An action that sends is written inside an action def or an action, or as a state's entry, do or exit action; action warn is on its own\. Move it\./);
    assert.match(messages([el('S', 'StateDefinition', 'S'), el('S.warn', 'ActionUsage', 'warn', send)]), /action warn in S is in a state def\. Move it, or give it a role\./);
    assert.equal(messages([el('A', 'ActionDefinition', 'A'), el('A.warn', 'ActionUsage', 'warn', send)]), '', 'inside an action def');
    assert.equal(messages([el('S', 'StateDefinition', 'S'), el('S.warn', 'ActionUsage', 'warn', Object.assign({ role: 'entry' }, send))]), '', 'as an entry action');
  });

  test('a note inside an unnamed flow, succession or message takes the Issue form with its status, like one inside an unnamed connection', () => {
    const lib = loadLib(pageSource());
    const model = lib.normalize(small([el('Sys', 'PartDefinition', 'Sys'), el('Sys.a', 'PartUsage', 'a'), el('Sys.b', 'PartUsage', 'b'), el('Sys.a.i', 'ItemUsage', 'i', { direction: 'out' }), el('Sys.b.i', 'ItemUsage', 'i', { direction: 'in' })],
      [{ id: 'f1', kind: 'FlowConnectionUsage', from: 'Sys.a.i', to: 'Sys.b.i' }, { id: 'm1', kind: 'Message', from: 'Sys.a', to: 'Sys.b' }]));
    assert.equal(lib.validate(model).length, 0);
    const archived = note(3, 'f1', 'archived on the flow', { response: 'done', resolved: true, archived: '2026-11-06T00:00:00Z', resolution: 'done' });
    const text = lib.toSysML(model, [note(1, 'f1', 'on the flow', { response: 'ok', resolved: true }), note(2, 'm1', 'on the message')], [archived]);
    assert.match(text, /flow from a\.i to b\.i \{\s+metadata <n1> : Issue \{ text = "on the flow"; \}\s+metadata Rationale about n1 \{ text = "ok"; \}\s+metadata StatusInfo about n1 \{ status = StatusKind::done; \}\s+metadata <n3> : Issue[^]*?StatusKind::closed; \}\s+\}/,
      `the flow's notes, the archived one closed:\n${text}`);
    assert.match(text, /message from a to b \{\s+metadata <n2> : Issue/, 'the message\'s note');
    assert.ok(!/comment <n/.test(text), 'no note is a comment any more');
  });

  test('a typed action\'s own parameter keeps its doc, code and generals in the text, and an event under a lifeline keeps its code', () => {
    const lib = loadLib(pageSource());
    const code = (path) => [{ path, language: 'typescript', text: path === 'q.ts' ? 'x' : '' }];
    const model = lib.normalize(small([el('B', 'ActionDefinition', 'B'), el('B.x', 'ParameterUsage', 'x', { direction: 'in' }), el('A', 'ActionDefinition', 'A'), el('A.a2', 'ActionUsage', 'a2'),
      el('A.a2.q', 'ParameterUsage', 'q', { direction: 'in', doc: 'the doc of q', code: code('q.ts') }), el('A.a2.r', 'ParameterUsage', 'r', { direction: 'in' }),
      el('C', 'PartDefinition', 'C'), el('C.p', 'PartUsage', 'p'), el('C.p.e1', 'EventOccurrenceUsage', 'e1', { code: code('e1.ts') })],
      [{ id: 'ft', kind: 'FeatureTyping', from: 'A.a2', to: 'B' }, { id: 'sp', kind: 'Specialization', from: 'A.a2.r', to: 'A.a2.q' }]));
    assert.equal(lib.validate(model).length, 0, JSON.stringify(lib.validate(model)));
    const text = lib.toSysML(model, []);
    assert.match(text, /action a2 : B \{\s+in item x;\s+in item q \{\s+doc \/\* the doc of q \*\/\s+rep 'q\.ts' language "typescript" \/\* x \*\/\s+\}\s+in item r :> q;\s+\}/, `the parameters:\n${text}`);
    assert.match(text, /event occurrence e1 \{\s+rep 'e1\.ts' language "typescript" \/\* \*\/\s+\}/, `the event:\n${text}`);
    assert.ok(!lib.KINDS.StartNode.fields.includes('code'), 'a start node, which the text never declares, carries no code links');
  });

  test('an action named start1 beside the start node the page named start1 is no duplicate: a kind without a name field takes no part in the name rules', () => {
    const lib = loadLib(pageSource());
    const model = lib.normalize(small([el('A', 'ActionDefinition', 'A'), el('A.start1', 'StartNode', 'start1'), el('A.act', 'ActionUsage', 'start1')],
      [{ id: 's1', kind: 'SuccessionAsUsage', from: 'A.start1', to: 'A.act' }], { kind: 'ActionFlowView' }));
    assert.equal(lib.validate(model).length, 0, JSON.stringify(lib.validate(model)));
    assert.match(lib.toSysML(model, []), /action def A \{\s+action start1;\s+first start then start1;\s+\}/);
  });

  test('the defined-by rule: a definition is refused as one, a fork or an event as something nothing defines, and a wrong definition kind with its article', () => {
    const lib = loadLib(pageSource());
    const model = lib.normalize(small([el('A', 'ActionDefinition', 'A'), el('A.f1', 'ForkNode', 'f1'), el('A.a1', 'ActionUsage', 'a1'), el('A.a1.x', 'ParameterUsage', 'x', { direction: 'in' }),
      el('P', 'PartDefinition', 'P'), el('P.p', 'PartUsage', 'p'), el('P.p.e1', 'EventOccurrenceUsage', 'e1')], [{ id: 'ft', kind: 'FeatureTyping', from: 'A.f1', to: 'A' }]));
    const ids = lib.index(model);
    const rule = lib.RELATIONSHIPS.FeatureTyping;
    const nothing = ' isn\'t defined by anything; a part, port, item, action, parameter or state is.';
    assert.equal(rule.first(model, ids.get('A'), ids), 'Only a usage is defined by something; action def A is a definition.');
    assert.equal(rule.first(model, ids.get('A.f1'), ids), 'A fork' + nothing);
    assert.equal(rule.ends(model, ids.get('P.p.e1'), ids.get('P'), ids), 'An event' + nothing);
    assert.equal(rule.first(model, ids.get('A.a1'), ids), null, 'an action is defined by something');
    assert.equal(rule.ends(model, ids.get('A.a1'), ids.get('P'), ids), 'action a1 in A can only be defined by an action def.');
    assert.equal(rule.ends(model, ids.get('A.a1.x'), ids.get('P'), ids), 'parameter x in a1 can only be defined by an item def.');
    const problems = lib.validate(model).map((p) => p.id + ': ' + p.message);
    assert.ok(problems.includes('ft: A fork' + nothing), `validate says the same of a typing in the file: ${JSON.stringify(problems)}`);
    assert.ok(!problems.some((p) => /undefined/.test(p)), 'nothing says "a undefined"');
  });

  test('a label that starts with a vowel takes "an": An action def has no name, is an action, defined by an item def', () => {
    const lib = loadLib(pageSource());
    assert.equal(lib.an('part'), 'a part');
    assert.equal(lib.an('item def', true), 'An item def');
    assert.equal(lib.an('interconnection view'), 'an interconnection view');
    const model = lib.normalize(small([el('AD', 'ActionDefinition', ''), el('AD.b', 'ActionUsage', 'b'), el('ID', 'ItemDefinition', ''), el('I', 'InitialNode', ''), el('PD', 'PartDefinition', 'PD')],
      [{ id: 'ft', kind: 'FeatureTyping', from: 'AD.b', to: 'PD' }]));
    const messages = lib.validate(model).map((p) => p.message);
    for (const expected of ['An action def has no name.', 'An item def has no name.', 'An initial node belongs inside a state def or a state; initial node is on its own.', 'action b in (unnamed) can only be defined by an action def.']) {
      assert.ok(messages.includes(expected), `${JSON.stringify(expected)} is among ${JSON.stringify(messages)}`);
    }
    assert.ok(!messages.some((m) => /\b[Aa] [aeio]/.test(m)), `no message glues "a" to a label that starts with a vowel: ${JSON.stringify(messages)}`);
    const ids = lib.index(model);
    assert.equal(lib.RELATIONSHIPS.FlowConnectionUsage.first(model, ids.get('AD.b'), ids), 'A flow runs from a port or an item; action b in (unnamed) is an action.');
  });

  test('a library name the geometry text can\'t see (a port named in on a part beside the one drawn to scale) is no problem; one it can see is', () => {
    const lib = loadLib(pageSource());
    const rug = { shape: 'Rectangle', length: 24, width: 12, unit: 'in', posX: 1, posY: 1 };
    const geometry = { kind: 'GeometryView', show: ['Sys.rug'], options: { scale: 40, unit: 'in' } };
    const problems = (elements, rels) => lib.validate(lib.normalize(small(elements, rels || [], geometry))).map((p) => p.id + ': ' + p.message).join('\n');
    const sys = [el('Sys', 'PartDefinition', 'Sys'), el('Sys.rug', 'PartUsage', 'rug', rug)];
    assert.equal(problems(sys.concat([el('Sys.tank', 'PartUsage', 'tank'), el('Sys.tank.in', 'PortUsage', 'in')])), '', 'a port named in on the part beside rug is out of the text\'s sight');
    assert.equal(problems(sys.concat([el('Sys.rug.leg', 'PartUsage', 'leg'), el('Sys.rug.leg.m', 'PortUsage', 'm')])), '', 'and so is one deeper inside rug');
    assert.match(problems(sys.concat([el('Sys.m', 'PortUsage', 'm')])), /^Sys\.m: The name m is one the geometry text brings in from the library/, 'a port m beside rug shadows the unit');
    assert.match(problems(sys.concat([el('Sys.rug.m', 'PortUsage', 'm')])), /^Sys\.rug\.m: The name m/, 'so does one on rug');
    assert.match(problems(sys.concat([el('Box', 'PartDefinition', 'Box')])), /^Box: The name Box/, 'and a part def Box at the top of the package');
    assert.match(problems(sys.concat([el('Rug', 'PartDefinition', 'Rug'), el('Rug.m', 'PortUsage', 'm')]), [{ id: 'ft', kind: 'FeatureTyping', from: 'Sys.rug', to: 'Rug' }]), /^Rug\.m: The name m/, 'and a port m that rug inherits from its part def');
  });
});
