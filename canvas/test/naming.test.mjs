// One naming owner: SysMLModel.textName(el) is the one place that decides whether an element has a name in the text.
// An element whose kind has a name field has its name, trimmed, or '' while it has none; a start, done or initial node
// has no name in the text at all (null), whatever its name field holds, though the page keeps one there for itself
// (start1, done1, initial1). These tests put names beside the three nodes, the same as the names the page keeps in
// them, and check that the rules, the text and the page never take those for names: nothing clashes with them,
// nothing writes or shows them, and a fresh name beside one is free.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import vm from 'node:vm';
import { emptyPointIn, exportText, finish, launch, modelLibSource, openCanvas, pageSource, placeElement, rename, until } from './helpers.mjs';

// As in model-lib.test.mjs: the library run in a vm context with a bare window (its values belong to the context's
// realm, so the checks compare strings, never deepEqual); el(id, kind, name, extra) with its owner read from a dotted
// id (A.a1 is owned by A); a small model in package P whose one view, v, shows every element.
function loadLib(source) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInContext(modelLibSource(source), vm.createContext(sandbox), { filename: 'canvas/index.html#model-lib' });
  assert.ok(sandbox.SysMLModel, 'the model-lib script sets window.SysMLModel');
  return sandbox.SysMLModel;
}
function el(id, kind, name, extra) {
  const dot = id.lastIndexOf('.');
  return Object.assign({ id, kind, name }, dot >= 0 ? { owner: id.slice(0, dot) } : {}, extra || {});
}
function small(elements, relationships, view) {
  const layout = {};
  elements.forEach((e, i) => { layout[e.id] = { x: 40 + i * 240, y: 40, side: 'right', at: 0.5 }; });
  return { format: 'stronghold-canvas/2', package: { name: 'P', doc: '' }, elements, relationships: relationships || [],
    views: [{ id: 'v1', kind: (view && view.kind) || 'GeneralView', name: 'v', layout, options: {} }] };
}
const note = (no, target, text) => ({ id: 'n' + no, no, target, text, response: '', resolved: false });
const succession = (id, from, to, extra) => Object.assign({ id, kind: 'SuccessionAsUsage', from, to }, extra || {});
const transition = (id, from, to, extra) => Object.assign({ id, kind: 'TransitionUsage', from, to }, extra || {});

// As in behavior-actions.test.mjs: a new view of a kind (its frame's id), and a tool placed just inside a box, below
// what the box holds already, after fitting the drawing into the window so the box is in reach.
async function addView(page, kind) {
  const count = await page.locator('#drawing g.frame[data-view]').count();
  await page.selectOption('#new-view-kind', kind);
  await page.click('#new-view');
  await until(page, (n) => document.querySelectorAll('#drawing g.frame[data-view]').length > n, count, 'a new frame appears');
  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
}
async function placeInside(page, tool, hostId) {
  await page.click('#zoom-fit');
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
/** What an element's name field holds in the page's model, whether or not the text has a name for it. */
const nameKept = (page, id) => page.evaluate((elId) => window.SysMLCanvas.state.model.elements.find((e) => e.id === elId).name, id);

describe('naming', () => {
  test('textName decides it: a name, trimmed; nothing yet for an unnamed element; none at all for a start, done or initial node', () => {
    const lib = loadLib(pageSource());
    assert.equal(lib.textName({ kind: 'PartUsage', name: '  pump ' }), 'pump');
    assert.equal(lib.textName({ kind: 'PartDefinition', name: ' ' }), '', 'an unnamed element has no name yet');
    for (const kind of ['StartNode', 'DoneNode', 'InitialNode']) {
      assert.equal(lib.textName({ kind, name: 'start1' }), null, `${kind}: no name in the text, whatever its name field holds`);
    }
    const nameless = Object.keys(lib.KINDS).filter((kind) => lib.textName({ kind, name: 'x' }) === null);
    assert.equal(nameless.join(' '), 'StartNode DoneNode InitialNode', 'every other kind has a name in the text');
    assert.equal(lib.hasName, undefined, 'the kind test textName replaced is gone, so nothing else decides');
  });

  test('a name beside a start, done or initial node never meets the name the page keeps in the node: no rule takes that for a name', () => {
    const lib = loadLib(pageSource());
    const cases = [
      { what: 'an action named like the start node beside it', view: 'ActionFlowView',
        elements: [el('A', 'ActionDefinition', 'A'), el('A.start', 'StartNode', 'go'), el('A.go', 'ActionUsage', 'go')],
        relationships: [succession('s1', 'A.start', 'A.go')],
        text: /action def A \{\s+action go;\s+first start then go;\s+\}/ },
      { what: 'a state named like the done node beside it', view: 'StateTransitionView',
        elements: [el('S', 'StateDefinition', 'S'), el('S.init', 'InitialNode', ''), el('S.stop', 'StateUsage', 'stop'), el('S.done', 'DoneNode', 'stop')],
        relationships: [transition('t1', 'S.init', 'S.stop'), transition('t2', 'S.stop', 'S.done')],
        text: /state def S \{\s+entry;\s+then stop;\s+state stop;\s+transition first stop then done;\s+\}/ },
      { what: 'a state named like the initial node beside it', view: 'StateTransitionView',
        elements: [el('S', 'StateDefinition', 'S'), el('S.init', 'InitialNode', 'idle'), el('S.idle', 'StateUsage', 'idle')],
        relationships: [transition('t1', 'S.init', 'S.idle')],
        text: /state def S \{\s+entry;\s+then idle;\s+state idle;\s+\}/ },
      { what: 'a succession named like the start node it leaves', view: 'ActionFlowView',
        elements: [el('A', 'ActionDefinition', 'A'), el('A.start', 'StartNode', 'begin'), el('A.a1', 'ActionUsage', 'a1')],
        relationships: [succession('s1', 'A.start', 'A.a1', { name: 'begin' })],
        text: /succession begin first start then a1;/ },
      { what: 'a transition named like the initial node beside it', view: 'StateTransitionView',
        elements: [el('S', 'StateDefinition', 'S'), el('S.init', 'InitialNode', 'step'), el('S.s1', 'StateUsage', 's1'), el('S.s2', 'StateUsage', 's2')],
        relationships: [transition('t1', 'S.init', 'S.s1'), transition('t2', 'S.s1', 'S.s2', { name: 'step' })],
        text: /transition step first s1 then s2;/ },
      { what: 'a definition named like a done node', view: 'GeneralView',
        elements: [el('Pump', 'PartDefinition', 'Pump'), el('A', 'ActionDefinition', 'A'), el('A.a1', 'ActionUsage', 'a1'), el('A.done', 'DoneNode', 'Pump')],
        relationships: [succession('s1', 'A.a1', 'A.done')],
        text: /action def A \{\s+action a1;\s+first a1 then done;\s+\}/ },
      { what: 'the package named like an initial node', view: 'StateTransitionView',
        elements: [el('S', 'StateDefinition', 'S'), el('S.init', 'InitialNode', 'P'), el('S.s1', 'StateUsage', 's1')],
        relationships: [transition('t1', 'S.init', 'S.s1')],
        text: /state def S \{\s+entry;\s+then s1;\s+state s1;\s+\}/ },
      { what: 'a start node named like a library name', view: 'ActionFlowView',
        elements: [el('A', 'ActionDefinition', 'A'), el('A.start', 'StartNode', 'SysML'), el('A.a1', 'ActionUsage', 'a1')],
        relationships: [succession('s1', 'A.start', 'A.a1')],
        text: /action def A \{\s+action a1;\s+first start then a1;\s+\}/ },
      { what: 'an action named like a node of the definition its owner is defined by', view: 'ActionFlowView',
        elements: [el('A', 'ActionDefinition', 'A'), el('A.start', 'StartNode', 'warm'), el('A.a1', 'ActionUsage', 'a1'), el('B', 'ActionDefinition', 'B'), el('B.c', 'ActionUsage', 'c'),
          el('B.c.warm', 'ActionUsage', 'warm')],
        relationships: [succession('s1', 'A.start', 'A.a1'), { id: 'ft', kind: 'FeatureTyping', from: 'B.c', to: 'A' }],
        text: /action def B \{\s+action c : A \{\s+action warm;\s+\}\s+\}/ },
      { what: 'a view named like a start node out on the plane', view: 'GeneralView',
        elements: [el('A', 'ActionDefinition', 'A'), el('start', 'StartNode', 'v')],
        problems: 'A start belongs inside an action def or an action; start is on its own.',
        text: /view v : StandardViewDefinitions::GeneralView \{\s+expose P::\*::\*\*;\s+\}/ },
    ];
    for (const c of cases) {
      const model = lib.normalize(small(c.elements, c.relationships, { kind: c.view }));
      assert.equal(model.elements.length, c.elements.length, `${c.what}: the model keeps every element`);
      assert.equal(lib.validate(model).map((p) => p.message).join('\n'), c.problems || '', `${c.what}: the rules find nothing to say of the name`);
      const text = lib.toSysML(model, []);
      assert.match(text, c.text, `${c.what}: the text\n${text}`);
    }
  });

  test('the text never writes the name the page keeps in a start, done or initial node, even for lines the rules refuse, and a path to one ends in the word the text has for it', () => {
    const lib = loadLib(pageSource());
    const kept = /start1|start2|done1|done2|initial1/;
    const model = lib.normalize(small([
      el('A', 'ActionDefinition', 'A'), el('A.s', 'StartNode', 'start1'), el('A.s2', 'StartNode', 'start2'), el('A.a1', 'ActionUsage', 'a1'), el('A.d', 'DoneNode', 'done1'),
      el('S', 'StateDefinition', 'S'), el('S.i', 'InitialNode', 'initial1'), el('S.s1', 'StateUsage', 's1'), el('S.s2', 'StateUsage', 's2'), el('S.d', 'DoneNode', 'done2')
    ], [
      succession('r1', 'A.s', 'A.a1'), succession('r2', 'A.a1', 'A.d'), transition('r3', 'S.i', 'S.s1'), transition('r4', 'S.s1', 'S.d'),
      // Lines the rules refuse, which a file may hold all the same: one start specializing another, a connection
      // between the start and the done, a transition into the initial node.
      { id: 'r5', kind: 'Specialization', from: 'A.s2', to: 'A.s' }, { id: 'r6', kind: 'ConnectionUsage', from: 'A.s', to: 'A.d' }, transition('r7', 'S.s2', 'S.i')
    ]));
    assert.equal(model.relationships.length, 7, 'the model keeps every line');
    const notes = ['A.s', 'A.d', 'S.i', 'r1', 'r3', 'r5', 'r6', 'r7'].map((target, i) => note(i + 1, target, 'about ' + target));
    const text = lib.toSysML(model, notes);
    assert.ok(!kept.test(text), `no name the page keeps in a node is in the text:\n${text}`);
    assert.match(text, /first start then a1 \{/, 'a succession leaves the start every action has');
    assert.match(text, /first a1 then done;/, 'and leads to its done');
    assert.match(text, /state def S \{\s+entry;\s+then s1;/, 'the initial node is the state\'s entry');
    assert.match(text, /transition first s1 then done;/, 'a transition leads to the state\'s done');
    const messages = lib.validate(model).map((p) => p.message);
    assert.ok(messages.length >= 3, `the refused lines are problems: ${JSON.stringify(messages)}`);
    assert.ok(!kept.test(messages.join('\n')), `no problem names a node by the name the page keeps in it: ${JSON.stringify(messages)}`);
    const ids = lib.index(model);
    assert.equal(lib.qualified(model, ids.get('A.s')), 'P::A::start');
    assert.equal(lib.qualified(model, ids.get('A.d')), 'P::A::done');
    assert.equal(lib.qualified(model, ids.get('S.i')), 'P::S::entry');
    assert.equal(lib.featurePath(model, 'A', ids.get('A.d')), 'done');
    assert.equal(lib.describe(model, ids.get('S.i')), 'initial node in S');
    assert.equal(lib.labelFor(model, 'r1'), 'succession start in A to a1');
  });

  describe('on the page', () => {
    let browser;
    before(async () => { browser = await launch(); });
    after(async () => { await browser?.close(); });

    test('a start, done or initial node keeps a name the panel never shows: its path ends in the word the text has for it, and a name beside it is no clash', async () => {
      const ctx = await openCanvas(browser);
      const { page } = ctx;
      const flow = await addView(page, 'ActionFlowView');
      const def = await placeElement(page, 'ActionDefinition', await emptyPointIn(page, flow));
      const start = await placeInside(page, 'StartNode', def);
      assert.equal(await nameKept(page, start), 'start1', 'the page keeps a name in the start node');
      assert.equal(await page.textContent('#f-kind'), 'start in ActionDef1');
      assert.match(await page.textContent('#f-path'), /::ActionDef1::start$/, 'the path ends in start, the feature the node stands for');
      assert.ok(await page.locator('#l-name').isHidden(), 'there is no name to type');
      assert.ok(await page.locator('#add-note').isHidden(), 'nor a note to add');
      const done = await placeInside(page, 'DoneNode', def);
      assert.equal(await nameKept(page, done), 'done1');
      assert.match(await page.textContent('#f-path'), /::ActionDef1::done$/);
      const action = await placeInside(page, 'ActionUsage', def);
      await rename(page, action, 'start1');
      await page.locator('#f-name').dispatchEvent('change');
      assert.ok(await page.locator('#problems').isHidden(), 'an action named like the start node beside it is no clash');

      const states = await addView(page, 'StateTransitionView');
      const sdef = await placeElement(page, 'StateDefinition', await emptyPointIn(page, states));
      const initial = await placeInside(page, 'InitialNode', sdef);
      assert.equal(await nameKept(page, initial), 'initial1');
      assert.equal(await page.textContent('#f-kind'), 'initial node in StateDef1');
      assert.match(await page.textContent('#f-path'), /::StateDef1::entry$/, 'the path ends in entry, the word the text has for it');
      const text = await exportText(page);
      assert.match(text, /action def ActionDef1 \{\s+action start1;\s+\}/, `the action def holds the action and nothing else:\n${text}`);
      assert.ok(!/done1|initial1/.test(text), `nothing the page keeps in a node is in the text:\n${text}`);
      await finish(ctx);
    });

    test('a fresh name beside a start node is free, even when it is the name the page keeps in the node', async () => {
      const ctx = await openCanvas(browser);
      const { page } = ctx;
      const model = small([el('A', 'ActionDefinition', 'A'), el('A.start', 'StartNode', 'action1')], [], { kind: 'ActionFlowView' });
      model.views[0].layout = { A: { x: 40, y: 40, w: 420, h: 260 }, 'A.start': { x: 20, y: 60 } };
      await page.setInputFiles('#import-file', { name: 'naming.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ model })) });
      await until(page, () => !!document.querySelector('#drawing g.frame[data-view="v1"] g[data-el="A.start"]'), null, 'the imported action def is drawn');
      const action = await placeInside(page, 'ActionUsage', 'A');
      assert.equal(await nameKept(page, action), 'action1', 'the name the start node keeps doesn\'t take it');
      assert.ok(await page.locator('#problems').isHidden(), 'and nothing clashes');
      await finish(ctx);
    });
  });
});
