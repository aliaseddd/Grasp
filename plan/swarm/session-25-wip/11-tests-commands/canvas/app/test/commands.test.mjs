// The commands: canvas/app/src/core/commands.ts, the one table that feeds the Tools view and the right-click palettes,
// what each command makes, and the tool in hand (plan/slice-1.md, step 11; plan/swarm/step-11.md). They run in Node and
// need no browser: the core is bundled in memory by loadCore() and opens sessions from the state files, as the store's
// tests do.
//
// The model library runs in another realm: compare ITS objects through plain(). What the core returns (a tool, a
// saying, a hit) belongs to this realm.
//
// Each test calls toolsOf(session), or the function it names, before selectionOf(session): step 11's own line is then
// what a test fails with while the commands are not built.

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { EXAMPLE, FIXTURES, clock, lib, loadCore, plain, readText } from './core.mjs';

const fixture = (name) => path.join(FIXTURES, name);
const IC = fixture('interconnection.json');
const ACTIONS = fixture('behavior-actions.json');
const STATES = fixture('behavior-states.json');
const GEOMETRY = fixture('geometry.json');
const SEQUENCE = fixture('sequence.json');

/** A point of bare ground in each view of the table of uses, in the view's units. */
const GROUND = { 'v-proof': [500, 800], 'v-ic': [1100, 600], 'v-release': [1200, 200], 'v-host': [1000, 200] };

/** The core, and a session opened from a state file with a clock of its own. */
async function open(file = EXAMPLE) {
  const core = await loadCore();
  const s = core.openText(lib, readText(file), { name: path.basename(file) }, { now: clock() });
  return { core, s };
}

const viewOf = (s, id) => s.model.views.find((v) => v.id === id);
const elementOf = (s, id) => s.model.elements.find((e) => e.id === id);
/** The model as JSON, to compare a model with itself before and after. */
const json = (s) => JSON.stringify(plain(s.model));
const steps = (s) => s.history.steps.length;
const lastWords = (s) => s.history.steps.at(-1)?.what;
/** What `M.validate` says, as its sentences in order. */
const says = (s) => Array.from(lib.validate(s.model), (m) => m.message).sort(); // a plain array: the library's realm is not the test's
/** The rectangle of a node in a view as a plane draws it now. */
function rectOf(core, s, view, id) {
  const rect = core.project(lib, s.model, viewOf(s, view)).rects.get(id);
  assert.ok(rect, `The view ${view} must place ${id}.`);
  return rect;
}
const groundHit = (view, x, y) => ({ view, type: 'ground', id: null, at: { x, y }, add: false });
/** A click in X: at 24 by 14 from its corner, where its header is blank. */
function inHit(core, s, view, id) {
  const r = rectOf(core, s, view, id);
  return { view, type: 'el', id, at: { x: r.x + 24, y: r.y + 14 }, add: false };
}
/** A click on X: at the middle of its rectangle, for a port, a parameter or a small node. */
function onHit(core, s, view, id) {
  const r = rectOf(core, s, view, id);
  return { view, type: 'el', id, at: { x: r.x + r.w / 2, y: r.y + r.h / 2 }, add: false };
}
/** A hit on an element at a point. */
const elHit = (view, id, x, y) => ({ view, type: 'el', id, at: { x, y }, add: false });
/** A hit from a spec of the table of uses: 'ground', 'in X' or 'on X'. */
function hitOf(core, s, view, spec, madeId = null) {
  if (spec === 'ground') return groundHit(view, ...GROUND[view]);
  const [how, id] = spec.split(' ');
  const at = id === 'new' ? madeId : id;
  return how === 'in' ? inHit(core, s, view, at) : onHit(core, s, view, at);
}
const kinds = (groups) => groups.map((group) => group.map((tool) => tool.kind));
/** Counts the calls of a tools' listener. */
function counting(tools) {
  const calls = { n: 0 };
  const stop = tools.listen(() => { calls.n++; });
  return { calls, stop };
}

/**
 * The table of uses (plan/swarm/step-11.md, section 4): every tool of each graph view kind's row, used once where
 * the rules allow it. `at` is where an element tool is clicked; `from` and `to` are the two clicks of a relationship
 * tool ('new' is the element that `first` made). `words` is Undo's. `adds` is the one sentence M.validate gains.
 */
const USES = [
  { view: 'v-proof', file: EXAMPLE, tool: 'PartDefinition', at: 'ground', words: 'Added part def PartDef1' },
  { view: 'v-proof', file: EXAMPLE, tool: 'PortDefinition', at: 'ground', words: 'Added port def PortDef1' },
  { view: 'v-proof', file: EXAMPLE, tool: 'PartUsage', at: 'in Host', words: 'Added part part1 in Host' },
  { view: 'v-proof', file: EXAMPLE, tool: 'PortUsage', at: 'in App', words: 'Added port port1 in App' },
  { view: 'v-proof', file: EXAMPLE, tool: 'Specialization', from: 'in App', to: 'in Page', words: 'Drew App specializes Page' },
  { view: 'v-proof', file: EXAMPLE, tool: 'FeatureTyping', from: 'in Page.hosts', to: 'in App', words: 'Drew hosts defined by App' },
  { view: 'v-proof', file: EXAMPLE, tool: 'ConnectionUsage', from: 'in Page.hosts', to: 'in Page.app', words: 'Drew connection hosts to app' },

  { view: 'v-ic', file: IC, tool: 'PartDefinition', at: 'ground', words: 'Added part def PartDef1' },
  { view: 'v-ic', file: IC, tool: 'PortDefinition', at: 'ground', words: 'Added port def PortDef1' },
  { view: 'v-ic', file: IC, tool: 'PartUsage', at: 'in Tank', words: 'Added part part1 in Tank' },
  { view: 'v-ic', file: IC, tool: 'PortUsage', at: 'in Tank', words: 'Added port port1 in Tank' },
  { view: 'v-ic', file: IC, tool: 'ItemDefinition', at: 'ground', words: 'Added item def ItemDef1' },
  { view: 'v-ic', file: IC, tool: 'ItemUsage', at: 'in CtrlPort', words: 'Added item item1 in CtrlPort' },
  { view: 'v-ic', file: IC, tool: 'InterfaceDefinition', at: 'ground', words: 'Added interface def InterfaceDef1',
    adds: 'interface def InterfaceDef1 needs two ports on its border, its ends; it has none.' },
  { view: 'v-ic', file: IC, tool: 'ConnectionUsage', from: 'in System.tank', to: 'in System.pump', words: 'Drew connection tank to pump' },
  { view: 'v-ic', file: IC, tool: 'InterfaceUsage', from: 'on System.controller.ctrl', to: 'on System.pump.ctrl', words: 'Drew interface ctrl to ctrl' },
  { view: 'v-ic', file: IC, tool: 'FlowConnectionUsage', from: 'on System.tank.fuelOut', to: 'on System.pump.fuelIn', words: 'Drew flow fuelOut to fuelIn',
    adds: 'The flow fuelOut to fuelIn needs an item: pick in the panel what flows through the ports.' },
  { view: 'v-ic', file: IC, tool: 'BindingConnectorAsUsage', from: 'on System.pump.ctrl', to: 'on System.controller.ctrl', words: 'Drew binding ctrl to ctrl' },
  { view: 'v-ic', file: IC, tool: 'FeatureTyping', from: 'on FuelPort.back', to: 'in Signal', words: 'Drew back defined by Signal' },

  { view: 'v-release', file: ACTIONS, tool: 'ActionDefinition', at: 'ground', words: 'Added action def ActionDef1' },
  { view: 'v-release', file: ACTIONS, tool: 'ActionUsage', at: 'in Release', words: 'Added action action1 in Release' },
  { view: 'v-release', file: ACTIONS, tool: 'ParameterUsage', at: 'in Release.test', words: 'Added parameter param1 in test' },
  { view: 'v-release', file: ACTIONS, tool: 'ForkNode', at: 'in Release', words: 'Added fork fork1 in Release' },
  { view: 'v-release', file: ACTIONS, tool: 'JoinNode', at: 'in Release', words: 'Added join join1 in Release' },
  { view: 'v-release', file: ACTIONS, tool: 'DecisionNode', at: 'in Release', words: 'Added decision decision1 in Release' },
  { view: 'v-release', file: ACTIONS, tool: 'MergeNode', at: 'in Release', words: 'Added merge merge1 in Release' },
  { view: 'v-release', file: ACTIONS, tool: 'StartNode', at: 'in Release.test', words: 'Added start in test' },
  { view: 'v-release', file: ACTIONS, tool: 'DoneNode', at: 'in Release.lint', words: 'Added done in lint' },
  { view: 'v-release', file: ACTIONS, tool: 'SuccessionAsUsage', from: 'in Release.compile', to: 'in Release.test', words: 'Drew succession compile to test' },
  { view: 'v-release', file: ACTIONS, tool: 'FlowConnectionUsage', first: { tool: 'ParameterUsage', at: 'in Release.publish', words: 'Added parameter param1 in publish' },
    from: 'on Release.test.passed', to: 'on new', words: 'Drew flow passed to param1', undos: 2 },
  { view: 'v-release', file: ACTIONS, tool: 'BindingConnectorAsUsage', from: 'on Release.source', to: 'on Release.bundle', words: 'Drew binding source to bundle' },
  { view: 'v-release', file: ACTIONS, tool: 'FeatureTyping', from: 'in Release.compile', to: 'in Release', words: 'Drew compile defined by Release' },

  { view: 'v-host', file: STATES, tool: 'StateDefinition', at: 'ground', words: 'Added state def StateDef1' },
  { view: 'v-host', file: STATES, tool: 'StateUsage', at: 'in HostLifecycle', words: 'Added state state1 in HostLifecycle' },
  { view: 'v-host', file: STATES, tool: 'InitialNode', at: 'in HostLifecycle.loading', words: 'Added initial node in loading',
    adds: 'The initial node in loading needs a transition to the first state.' },
  { view: 'v-host', file: STATES, tool: 'ActionUsage', at: 'in HostLifecycle.loading', words: 'Added action action1 in loading' },
  { view: 'v-host', file: STATES, tool: 'DoneNode', at: 'in HostLifecycle.loading', words: 'Added done in loading' },
  { view: 'v-host', file: STATES, tool: 'TransitionUsage', from: 'in HostLifecycle.idle', to: 'in HostLifecycle.running', words: 'Drew transition idle to running' },
  { view: 'v-host', file: STATES, tool: 'FeatureTyping', from: 'in HostLifecycle.idle', to: 'in HostLifecycle', words: 'Drew idle defined by HostLifecycle' },
];
const useOf = (view, tool) => USES.find((u) => u.view === view && u.tool === tool);

/**
 * Walks one use of the table on a new session: the dock's part is played by front(view). Returns the session, what
 * was made (the new element or the new relationship, the last of its list) and what the model was before.
 */
async function walk(use) {
  const { core, s } = await open(use.file);
  const tools = core.toolsOf(s);
  core.selectionOf(s).front(use.view);
  const before = { json: json(s), says: says(s), steps: steps(s) };
  let madeId = null;
  if (use.first) {
    tools.arm(use.first.tool);
    assert.equal(tools.click(hitOf(core, s, use.view, use.first.at)), true, `${use.first.tool} clicked ${use.first.at} must be the tool's click.`);
    madeId = s.model.elements.at(-1).id;
    assert.equal(lastWords(s), use.first.words, `${use.first.tool} must say ${use.first.words}.`);
  }
  tools.arm(use.tool);
  if (use.at) {
    assert.equal(tools.click(hitOf(core, s, use.view, use.at)), true, `${use.tool} clicked ${use.at} in ${use.view} must be the tool's click.`);
  } else {
    assert.equal(tools.click(hitOf(core, s, use.view, use.from)), true, `${use.tool}: the first end clicked ${use.from} in ${use.view} must be the tool's click.`);
    assert.equal(tools.click(hitOf(core, s, use.view, use.to, madeId)), true, `${use.tool}: the second end clicked ${use.to} in ${use.view} must be the tool's click.`);
  }
  const made = use.at ? s.model.elements.at(-1) : s.model.relationships.at(-1);
  return { core, s, tools, made, before };
}

describe('the commands', () => {
  test('the tools of a view kind are its row\'s, in its groups', async () => {
    const core = await loadCore();
    for (const kind of ['GeneralView', 'InterconnectionView', 'ActionFlowView', 'StateTransitionView']) {
      const groups = core.toolGroups(lib, kind);
      const row = plain(lib.VIEW_KINDS[kind].tools);
      const joined = groups.flatMap((group, i) => (i ? ['|', ...group.map((t) => t.kind)] : group.map((t) => t.kind)));
      assert.deepEqual(joined, row, `The tools of ${kind} must be the kinds of its tools row, a group for each '|'.`);
      for (const tool of groups.flat()) {
        const isEl = tool.kind in lib.KINDS;
        assert.equal(tool.type, isEl ? 'el' : 'rel', `The tool ${tool.kind} of ${kind} must be of type ${isEl ? 'el' : 'rel'}.`);
        assert.equal(tool.label, (isEl ? lib.KINDS : lib.RELATIONSHIPS)[tool.kind].label, `The tool ${tool.kind} must be called by the library's label.`);
      }
    }
    for (const kind of ['SequenceView', 'GeometryView', 'GridView', 'BrowserView', 'NoSuchView']) {
      assert.deepEqual(core.toolGroups(lib, kind), [], `${kind} lists no tools, since no plane draws it in slice 1.`);
    }
  });

  test('every tool has its title and its hint', async () => {
    const core = await loadCore();
    const names = [];
    for (const kind of ['GeneralView', 'InterconnectionView', 'ActionFlowView', 'StateTransitionView']) {
      for (const name of plain(lib.VIEW_KINDS[kind].tools)) if (name !== '|') names.push(name);
    }
    const titles = new Set();
    for (const name of new Set(names)) {
      const title = core.TOOL_TITLE[name];
      assert.equal(typeof title, 'string', `The tool ${name} must have a title.`);
      assert.ok(title.length > 10, `The title of ${name} must be a sentence.`);
      assert.ok(!titles.has(title), `The title of ${name} must be its own, not another tool's.`);
      titles.add(title);
      const first = core.toolHint(lib, name, 0);
      const second = core.toolHint(lib, name, 1);
      assert.ok(!first.includes('{') && !second.includes('{'), `The hints of ${name} must not hold a {placeholder}.`);
      if (name in lib.KINDS) assert.equal(first, second, `An element tool's two hints must be one sentence: ${name}.`);
      else assert.notEqual(first, second, `A relationship tool's two hints must differ: ${name}.`);
    }
    assert.equal(core.toolHint(lib, 'PartDefinition', 0), 'Click where the part def goes.');
    assert.equal(core.toolHint(lib, 'Specialization', 1), 'Now click the element it specializes.');
    assert.equal(core.toolHint(lib, 'FeatureTyping', 0), 'Click the ' + lib.definable() + ' to define…');
  });

  test('a session has one set of tools, with none in hand', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    assert.equal(core.toolsOf(s), tools, 'toolsOf must give the same object at each call for one session.');
    const other = (await open()).s;
    assert.notEqual(core.toolsOf(other), tools, 'Another session must have tools of its own.');
    for (const name of ['armed', 'first', 'hint', 'said']) assert.equal(tools[name], null, `A new session's tools must have ${name} null.`);
  });

  test('arming takes a tool in hand, arming it again puts it down, and another takes its place', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    const { calls } = counting(tools);
    const before = json(s);
    const was = steps(s);
    const expect = (kind, what) => {
      if (kind === null) {
        assert.equal(tools.armed, null, `${what}: no tool must be in hand.`);
        assert.equal(tools.hint, null, `${what}: there must be no hint.`);
      } else {
        const type = kind in lib.KINDS ? 'el' : 'rel';
        const label = (type === 'el' ? lib.KINDS : lib.RELATIONSHIPS)[kind].label;
        assert.deepEqual(plain(tools.armed), { kind, type, label }, `${what}: the tool in hand must be ${kind}.`);
        assert.equal(tools.hint, core.toolHint(lib, kind, 0), `${what}: the hint must be ${kind}'s first.`);
      }
      assert.equal(tools.first, null, `${what}: no first end must be taken.`);
      assert.equal(tools.said, null, `${what}: nothing must be said.`);
    };
    tools.arm('PartDefinition'); expect('PartDefinition', 'arm PartDefinition'); assert.equal(calls.n, 1, 'Arming must tell the listener once.');
    tools.arm('PortUsage'); expect('PortUsage', 'arm PortUsage'); assert.equal(calls.n, 2, 'Arming another kind must tell the listener once.');
    tools.arm('PortUsage'); expect(null, 'arm PortUsage again'); assert.equal(calls.n, 3, 'Arming the kind in hand must put it down and tell the listener once.');
    tools.arm('Specialization'); expect('Specialization', 'arm Specialization'); assert.equal(calls.n, 4, 'Arming must tell the listener once.');
    tools.putDown(); expect(null, 'putDown'); assert.equal(calls.n, 5, 'putDown must tell the listener once.');
    tools.putDown(); expect(null, 'putDown with none in hand'); assert.equal(calls.n, 5, 'putDown with no tool in hand must tell nobody.');
    tools.arm('PartUsage');
    assert.throws(() => tools.arm('NoSuchKind'), 'Arming a kind the library does not hold must throw.');
    assert.equal(tools.armed?.kind, 'PartUsage', 'A refused arm must change nothing.');
    assert.equal(json(s), before, 'Arming must not change the model.');
    assert.equal(steps(s), was, 'Arming must make no undo step.');
  });

  test('with no tool in hand a click is not the tool\'s', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    const { calls } = counting(tools);
    const sel = core.selectionOf(s);
    const picked = plain(sel.items);
    const before = json(s);
    const was = steps(s);
    assert.equal(tools.click(inHit(core, s, 'v-proof', 'Host')), false, 'With no tool in hand a click on Host must be left to the selection.');
    assert.equal(tools.click(groundHit('v-proof', 500, 800)), false, 'With no tool in hand a click on the ground must be left to the selection.');
    assert.equal(json(s), before, 'The model must be as it was.');
    assert.equal(steps(s), was, 'No undo step must be made.');
    assert.deepEqual(plain(sel.items), picked, 'The selection must be as it was.');
    assert.equal(tools.said, null, 'Nothing must be said.');
    assert.equal(calls.n, 0, 'No listener must be called.');
  });

  test('an element tool places its element at the click, in one undo step, and picks it', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    const before = json(s);
    const was = steps(s);
    const count = s.model.elements.length;
    tools.arm('PartDefinition');
    assert.equal(tools.click(groundHit('v-proof', 500, 800)), true, 'A click with a tool in hand must be the tool\'s.');
    assert.equal(s.model.elements.length, count + 1, 'The part def must be one more element.');
    const el = s.model.elements.at(-1);
    const own = plain(el);
    assert.deepEqual(Object.keys(own).slice(0, 4), ['id', 'kind', 'name', 'doc'], 'The element\'s keys must begin id, kind, name, doc.');
    assert.equal(own.kind, 'PartDefinition');
    assert.equal(own.name, 'PartDef1', 'The first part def must be named PartDef1.');
    assert.equal(own.doc, '');
    assert.equal(own.abstract, false, 'A new part def must not be abstract.');
    assert.deepEqual(own.code, [], 'A new part def must have no code.');
    assert.ok(!('owner' in own), 'A part def on the ground must have no owner.');
    assert.match(own.id, /^e[0-9a-z]+$/, 'The new id must be e and lower-case letters and digits.');
    assert.deepEqual(plain(viewOf(s, 'v-proof').layout[own.id]), { x: 390, y: 780, w: 220, h: 72 }, 'The part def must stand at the click, its middle across.');
    assert.equal(steps(s), was + 1, 'Placing must make one undo step.');
    assert.equal(lastWords(s), 'Added part def PartDef1', 'The step must say Added part def PartDef1.');
    assert.equal(s.changes.at(-1).text, 'Added part def PartDef1', 'The log must say the same.');
    assert.equal(tools.armed, null, 'What a tool made puts the tool down.');
    assert.equal(tools.said, null, 'Nothing must be said of what was made.');
    assert.deepEqual(plain(core.selectionOf(s).items), [{ type: 'el', id: own.id }], 'The new element must be picked.');
    const after = json(s);
    s.history.undo();
    assert.equal(json(s), before, 'Undo must take the part def back whole, its place included.');
    s.history.redo();
    assert.equal(json(s), after, 'Redo must make it again as it was.');
  });

  test('a nested element goes inside the box under the click, never left of 12 or above 48', async () => {
    const cases = [
      { hit: ['Host', 216, 500], owner: 'Host', place: { x: 94, y: 80, w: 180, h: 60 }, words: 'Added part part1 in Host' },
      { hit: ['Host', 40, 410], owner: 'Host', place: { x: 12, y: 48, w: 180, h: 60 }, words: 'Added part part1 in Host' },
      { hit: ['StrongholdApp', 864, 86], owner: undefined, place: { x: 774, y: 66, w: 180, h: 60 }, words: 'Added part part1' },
    ];
    for (const c of cases) {
      const { core, s } = await open();
      const tools = core.toolsOf(s);
      tools.arm('PartUsage');
      tools.click(elHit('v-proof', c.hit[0], c.hit[1], c.hit[2]));
      const el = plain(s.model.elements.at(-1));
      const where = `a part clicked at ${c.hit[1]}, ${c.hit[2]} on ${c.hit[0]}`;
      assert.equal(el.kind, 'PartUsage', `${where} must make a part.`);
      assert.equal(el.owner, c.owner, `${where} must be owned by ${c.owner ?? 'nobody'}.`);
      assert.deepEqual(plain(viewOf(s, 'v-proof').layout[el.id]), c.place, `${where} must stand at ${JSON.stringify(c.place)}.`);
      assert.equal(lastWords(s), c.words, `${where} must say ${c.words}.`);
    }
  });

  test('a new element\'s name is the first free one beside it', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    const place = (kind, hit) => { tools.arm(kind); tools.click(hit); return plain(s.model.elements.at(-1)); };
    const ground = groundHit('v-proof', 500, 800);
    assert.equal(place('PartDefinition', ground).name, 'PartDef1', 'The first part def must be PartDef1.');
    assert.equal(place('PartDefinition', ground).name, 'PartDef2', 'The second part def must be PartDef2.');
    const inHost = inHit(core, s, 'v-proof', 'Host');
    assert.equal(place('PartUsage', inHost).name, 'part1', 'The first part in Host must be part1.');
    assert.equal(place('PartUsage', inHost).name, 'part2', 'The second part in Host must be part2.');
    const part = place('PartUsage', inHit(core, s, 'v-proof', 'Page'));
    assert.equal(part.owner, 'Page', 'The part must go in Page.');
    assert.equal(part.name, 'part1', 'The first part in Page must be part1, though Host holds two.');

    const actions = (await open(ACTIONS)).s;
    assert.equal(core.freeName(lib, actions.model, 'StartNode', 'Release'), 'start1', 'A start has no name in the text, so the next is start1 though Release holds one.');
    const geometry = (await open(GEOMETRY)).s;
    assert.equal(core.freeName(lib, geometry.model, 'PartUsage', null), 'part1', 'The top-level part is named room, so the first free name is part1.');
  });

  test('a border item goes on the nearest border of the box under the click', async () => {
    const cases = [
      { hit: (core, s) => elHit('v-proof', 'App', 624, 414), owner: 'App', place: { side: 'top', at: 0.07 }, words: 'Added port port1 in App' },
      { hit: (core, s) => elHit('v-proof', 'Host', 216, 500), owner: 'Host', place: { side: 'bottom', at: 0.5 }, words: 'Added port port1 in Host' },
      { hit: (core, s) => elHit('v-proof', 'Page.hosts.api', 308, 231), owner: 'Page.hosts', place: { side: 'right', at: 0.5 }, words: 'Added port port1 in hosts' },
    ];
    for (const c of cases) {
      const { core, s } = await open();
      const tools = core.toolsOf(s);
      tools.arm('PortUsage');
      const hit = c.hit(core, s);
      tools.click(hit);
      const el = plain(s.model.elements.at(-1));
      const where = `a port clicked at ${hit.at.x}, ${hit.at.y} on ${hit.id}`;
      assert.equal(el.kind, 'PortUsage', `${where} must make a port.`);
      assert.equal(el.owner, c.owner, `${where} must be owned by ${c.owner}.`);
      assert.deepEqual(plain(viewOf(s, 'v-proof').layout[el.id]), c.place, `${where} must stand at ${JSON.stringify(c.place)}.`);
      assert.equal(lastWords(s), c.words, `${where} must say ${c.words}.`);
      assert.equal(el.conjugated, false, 'A new port must not be conjugated.');
      assert.equal(el.multiplicity, '', 'A new port must have no multiplicity.');
    }
  });

  test('a port clicked onto the empty ground is refused, and the tool stays in hand', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    const sel = core.selectionOf(s);
    tools.arm('PortUsage');
    const before = json(s);
    const was = steps(s);
    const picked = plain(sel.items);
    const sentence = 'Click a part def or a part in this view to put a port on its border.';
    assert.equal(tools.click(groundHit('v-proof', 500, 800)), true, 'A click with a tool in hand must be the tool\'s even when refused.');
    const first = tools.said;
    assert.equal(first?.text, sentence, 'A port clicked onto the ground must say where it can go.');
    assert.equal(tools.click(onHit(core, s, 'v-proof', 'StrongholdApp')), true, 'A click on a port def must be the tool\'s even when refused.');
    assert.equal(tools.said?.text, sentence, 'A port clicked on a port def, which holds none, must say the same.');
    assert.ok(tools.said.n > first.n, 'The same sentence said again must be said anew: its n must have grown.');
    assert.equal(tools.armed?.kind, 'PortUsage', 'A refusal must leave the tool in hand.');
    assert.equal(json(s), before, 'A refusal must write nothing.');
    assert.equal(steps(s), was, 'A refusal must make no undo step.');
    assert.deepEqual(plain(sel.items), picked, 'A refusal must pick nothing.');

    const actions = await open(ACTIONS);
    const t2 = core.toolsOf(actions.s);
    const was2 = json(actions.s);
    t2.arm('ParameterUsage');
    assert.equal(t2.click(groundHit('v-release', 1200, 200)), true, 'A click with the parameter tool must be the tool\'s.');
    assert.equal(t2.said?.text, 'Click an action def or an action in this view to put a parameter on its border.', 'A parameter clicked onto the ground must say where it can go.');
    assert.equal(t2.armed?.kind, 'ParameterUsage', 'A refusal must leave the parameter tool in hand.');
    assert.equal(json(actions.s), was2, 'A refusal must write nothing.');
  });

  test('a control node, a start, a done and an initial node go only inside what the text allows', async () => {
    const actions = await open(ACTIONS);
    const core = actions.core;
    const tools = core.toolsOf(actions.s);
    const before = json(actions.s);
    tools.arm('ForkNode');
    tools.click(groundHit('v-release', 1200, 200));
    assert.equal(tools.said?.text, 'Click inside an action def or an action to put the fork there.', 'A fork on the ground must be refused in the action sentence.');
    tools.arm('DoneNode');
    tools.click(groundHit('v-release', 1200, 200));
    assert.equal(tools.said?.text, 'Click inside an action def, an action, a state def or a state to put the done there.', 'A done on the ground must be refused in the either sentence.');
    assert.equal(json(actions.s), before, 'A refusal must write nothing.');
    tools.arm('ForkNode');
    tools.click(elHit('v-release', 'Release', 632, 402));
    const fork = plain(actions.s.model.elements.at(-1));
    assert.equal(fork.kind, 'ForkNode', 'A fork clicked in Release must be made.');
    assert.equal(fork.owner, 'Release', 'The fork must be owned by Release.');
    assert.deepEqual(plain(viewOf(actions.s, 'v-release').layout[fork.id]), { x: 570, y: 326, w: 60, h: 8 }, 'The fork\'s middle must be at the click\'s height.');

    const states = await open(STATES);
    const t2 = core.toolsOf(states.s);
    const was = json(states.s);
    t2.arm('InitialNode');
    t2.click(groundHit('v-host', 1000, 200));
    assert.equal(t2.said?.text, 'Click inside a state def or a state to put the initial node there.', 'An initial node on the ground must be refused in the state sentence.');
    assert.equal(json(states.s), was, 'A refusal must write nothing.');
  });

  test('a parameter starts as in, and an item on a port def as out', async () => {
    const direction = async (view, tool) => (await walk(useOf(view, tool))).made.direction;
    assert.equal(await direction('v-release', 'ParameterUsage'), 'in', 'A new parameter must go in.');
    const item = useOf('v-ic', 'ItemUsage');
    assert.equal((await walk(item)).made.direction, 'out', 'A new item on a port def must go out.');
    const inTank = { ...item, at: 'in Tank', words: 'Added item item1 in Tank' };
    assert.equal((await walk(inTank)).made.direction, '', 'A new item on a part must have no direction.');
  });

  test('a relationship tool takes two clicks, and draws in one undo step', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    const sel = core.selectionOf(s);
    const before = json(s);
    const was = steps(s);
    const picked = plain(sel.items);
    const count = s.model.relationships.length;
    tools.arm('Specialization');
    assert.equal(tools.click(inHit(core, s, 'v-proof', 'App')), true, 'The first end must be the tool\'s click.');
    assert.equal(tools.first, 'App', 'The first end must be App.');
    assert.equal(tools.hint, core.toolHint(lib, 'Specialization', 1), 'The hint must turn to the second.');
    assert.equal(steps(s), was, 'A first end must make no undo step.');
    assert.deepEqual(plain(sel.items), picked, 'A first end must pick nothing.');
    assert.equal(tools.click(inHit(core, s, 'v-proof', 'Page')), true, 'The second end must be the tool\'s click.');
    assert.equal(s.model.relationships.length, count + 1, 'The line must be one more relationship.');
    const rel = plain(s.model.relationships.at(-1));
    assert.deepEqual({ kind: rel.kind, from: rel.from, to: rel.to }, { kind: 'Specialization', from: 'App', to: 'Page' }, 'The line must go from App to Page.');
    assert.match(rel.id, /^r[0-9a-z]+$/, 'The new id must be r and lower-case letters and digits.');
    assert.equal(steps(s), was + 1, 'Drawing must make one undo step.');
    assert.equal(lastWords(s), 'Drew App specializes Page', 'The step must say Drew App specializes Page.');
    assert.equal(tools.armed, null, 'What a tool drew puts the tool down.');
    assert.equal(tools.first, null, 'The first end must be let go.');
    assert.equal(tools.said, null, 'Nothing must be said of a line drawn on a plane that shows both ends.');
    assert.deepEqual(plain(sel.items), [{ type: 'rel', id: rel.id }], 'The new line must be picked.');
    const after = json(s);
    s.history.undo();
    assert.equal(json(s), before, 'Undo must take the line back.');
    s.history.redo();
    assert.equal(json(s), after, 'Redo must draw it again as it was.');
  });

  test('a new relationship has its kind\'s fields at their starting values', async () => {
    const cases = [
      [useOf('v-proof', 'ConnectionUsage'), ['name', 'doc']],
      [useOf('v-ic', 'InterfaceUsage'), ['name', 'interfaceDef', 'doc']],
      [useOf('v-host', 'TransitionUsage'), ['name', 'trigger', 'guard', 'effect', 'doc']],
    ];
    for (const [use, fields] of cases) {
      const { made } = await walk(use);
      const rel = plain(made);
      assert.deepEqual(Object.keys(rel).slice(4), fields, `The fields of a new ${use.tool} after its ends must be ${fields.join(', ')}.`);
      for (const field of fields) assert.equal(rel[field], '', `The field ${field} of a new ${use.tool} must start as ''.`);
      assert.ok(!('hidden' in rel), `A new ${use.tool} must not be hidden.`);
    }
  });

  test('what a rule refuses is said in the rule\'s sentence, and the tool stays in hand', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    const before = json(s);
    const was = steps(s);
    tools.arm('Specialization');
    tools.click(inHit(core, s, 'v-proof', 'Host'));
    assert.equal(tools.first, 'Host', 'Host must be taken as the first end.');
    tools.click(inHit(core, s, 'v-proof', 'StrongholdApp'));
    const ids = lib.idsOf(s.model);
    const ruled = lib.RELATIONSHIPS.Specialization.ends(s.model, elementOf(s, 'Host'), elementOf(s, 'StrongholdApp'), ids);
    const a = tools.said;
    assert.equal(a?.text, ruled + ' Escape puts the tool down.', 'The refusal must be the library\'s sentence and Escape puts the tool down.');
    assert.equal(a.text, 'part def Host can only specialize another part def. Escape puts the tool down.');
    assert.equal(tools.first, 'Host', 'A refused second end must leave the first end taken.');
    assert.equal(tools.armed?.kind, 'Specialization', 'A refusal must leave the tool in hand.');
    tools.click(inHit(core, s, 'v-proof', 'Host'));
    const b = tools.said;
    assert.equal(b?.text, 'Pick two different elements. Escape puts the tool down.', 'The same element twice must be refused.');
    assert.ok(b !== a && b.n > a.n, 'Each saying must be a new object with a larger n.');
    assert.equal(tools.first, 'Host', 'The first end must stay.');
    assert.equal(tools.armed?.kind, 'Specialization', 'The tool must stay in hand.');
    assert.equal(json(s), before, 'Nothing must be written.');
    assert.equal(steps(s), was, 'No undo step must be made.');

    const again = await open();
    const t2 = core.toolsOf(again.s);
    t2.arm('Specialization');
    t2.click(inHit(core, again.s, 'v-proof', 'ServerHost'));
    t2.click(inHit(core, again.s, 'v-proof', 'Host'));
    assert.equal(t2.said?.text, 'That is already drawn. Escape puts the tool down.', 'A line that exists must be refused.');
    assert.equal(t2.first, 'ServerHost', 'The first end must stay.');
    assert.equal(json(again.s), before, 'Nothing must be written.');

    const typing = await open();
    const t3 = core.toolsOf(typing.s);
    t3.arm('FeatureTyping');
    t3.click(inHit(core, typing.s, 'v-proof', 'Host'));
    assert.equal(t3.said?.text, 'Only a usage is defined by something; part def Host is a definition. Escape puts the tool down.', 'A definition as first end must be refused by the rule on the first end.');
    assert.equal(t3.first, null, 'A refused first end must not be taken.');
    assert.equal(t3.armed?.kind, 'FeatureTyping', 'The tool must stay in hand.');
    assert.equal(json(typing.s), before, 'Nothing must be written.');
  });

  test('a second definition takes the first one\'s place, in the same step', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    const before = json(s);
    const was = steps(s);
    const notes = s.notes;
    const notesBefore = JSON.stringify(plain(notes));
    const list = plain(s.model.relationships);
    const index = list.findIndex((r) => r.id === 't-hosts');
    assert.ok(index >= 0, 'The example must hold the typing t-hosts.');
    tools.arm('FeatureTyping');
    tools.click(inHit(core, s, 'v-proof', 'Page.hosts'));
    tools.click(inHit(core, s, 'v-proof', 'App'));
    const rels = plain(s.model.relationships);
    assert.equal(rels.length, list.length, 'A second definition must leave as many relationships as before.');
    assert.ok(!rels.some((r) => r.id === 't-hosts'), 'The old typing t-hosts must be gone.');
    const made = rels.at(-1);
    assert.deepEqual({ kind: made.kind, from: made.from, to: made.to }, { kind: 'FeatureTyping', from: 'Page.hosts', to: 'App' }, 'The new typing must be the last relationship.');
    assert.equal(steps(s), was + 1, 'The swap must be one undo step.');
    assert.equal(lastWords(s), 'Drew hosts defined by App', 'The step must say Drew hosts defined by App.');
    const touched = plain(s.history.steps.at(-1).touched.relationships);
    assert.ok(touched.includes('t-hosts') && touched.includes(made.id), 'The step must have touched both the old typing and the new one.');
    assert.equal(s.notes, notes, 'The session\'s notes must be the same list.');
    assert.equal(JSON.stringify(plain(s.notes)), notesBefore, 'The notes must be untouched by the swap.');
    s.history.undo();
    assert.equal(json(s), before, 'Undo must bring t-hosts back at its old place.');
    assert.equal(plain(s.model.relationships).findIndex((r) => r.id === 't-hosts'), index, 't-hosts must be back at its old index.');
    assert.equal(JSON.stringify(plain(s.notes)), notesBefore, 'The notes must be as they were after Undo.');
  });

  test('a click on the ground or on a line puts a relationship tool down', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    const before = json(s);
    const was = steps(s);
    const line = { view: 'v-proof', type: 'rel', id: 'mount', at: { x: 500, y: 350 }, add: false };
    for (const [what, hit] of [['the ground', groundHit('v-proof', 500, 800)], ['the line mount', line]]) {
      tools.arm('ConnectionUsage');
      tools.click(inHit(core, s, 'v-proof', 'Page.hosts'));
      assert.equal(tools.first, 'Page.hosts', 'The first end must be taken.');
      assert.equal(tools.click(hit), true, `A click on ${what} must be the tool's.`);
      assert.equal(tools.armed, null, `A click on ${what} must put the tool down.`);
      assert.equal(tools.said?.text, 'Put down: nothing was drawn.', `A click on ${what} with a first end taken must say nothing was drawn.`);
    }
    tools.arm('ConnectionUsage');
    assert.equal(tools.click(groundHit('v-proof', 500, 800)), true, 'A click on the ground must be the tool\'s.');
    assert.equal(tools.armed, null, 'A click on the ground must put the tool down.');
    assert.equal(tools.said, null, 'With no first end taken nothing must be said.');
    assert.equal(json(s), before, 'Nothing must be written.');
    assert.equal(steps(s), was, 'No undo step must be made.');
  });

  test('a line whose ends no view shows together is drawn, and said so', async () => {
    const { core, s } = await open(IC);
    const tools = core.toolsOf(s);
    s.history.edit(() => { delete viewOf(s, 'v-ic').layout.Controller; return 'Removed Controller from fuelSystem'; });
    const was = steps(s);
    tools.arm('FeatureTyping');
    tools.click(onHit(core, s, 'v-ic', 'System.tank'));
    tools.click(onHit(core, s, 'v-defs', 'Controller'));
    assert.equal(steps(s), was + 1, 'The typing must be drawn in one step.');
    assert.equal(lastWords(s), 'Drew tank defined by Controller', 'The step must say Drew tank defined by Controller.');
    const rel = s.model.relationships.at(-1);
    assert.deepEqual(plain(core.selectionOf(s).items), [{ type: 'rel', id: rel.id }], 'The typing must be picked.');
    assert.equal(tools.said?.text, 'Drew tank defined by Controller. No view shows both ends, so the line is not drawn anywhere yet.', 'A line no view shows must say so.');
    assert.equal(tools.armed, null, 'The tool must be put down.');
  });

  test('a click in a view whose row lacks the tool puts the tool down and says so', async () => {
    const states = await open(STATES);
    const core = states.core;
    const tools = core.toolsOf(states.s);
    const before = json(states.s);
    tools.arm('PartDefinition');
    assert.equal(tools.click(groundHit('v-host', 1000, 200)), true, 'A click in a state view with a tool in hand must be the tool\'s.');
    assert.equal(tools.armed, null, 'The tool must be put down.');
    assert.equal(tools.said?.text, 'A state transition view has no part def tool, so the tool was put down.', 'The view must say it has no such tool.');
    tools.arm('PartDefinition');
    assert.equal(tools.click(groundHit('no-such-view', 100, 100)), true, 'A click in a view the model does not hold must be the tool\'s.');
    assert.equal(tools.armed, null, 'The tool must be put down for an unknown view.');
    assert.equal(tools.said, null, 'An unknown view must be put down with nothing said.');
    assert.equal(json(states.s), before, 'Nothing must be written.');

    const seq = await open(SEQUENCE);
    const t2 = core.toolsOf(seq.s);
    const was = json(seq.s);
    t2.arm('PartUsage');
    assert.equal(t2.click(groundHit('v-seq', 500, 300)), true, 'A click in a sequence view must be the tool\'s.');
    assert.equal(t2.armed, null, 'The tool must be put down in a view no plane draws.');
    assert.equal(t2.said, null, 'A view no plane draws must be left with nothing said.');
    assert.equal(json(seq.s), was, 'Nothing must be written.');
  });

  test('the view in front changing to one without the tool puts the tool down', async () => {
    {
      const { core, s } = await open(IC);
      const tools = core.toolsOf(s);
      const sel = core.selectionOf(s);
      sel.front('v-ic');
      tools.arm('InterfaceUsage');
      tools.click(onHit(core, s, 'v-ic', 'System.controller.ctrl'));
      assert.equal(tools.first, 'System.controller.ctrl', 'The first end must be taken.');
      const { calls } = counting(tools);
      sel.front('v-defs');
      assert.equal(tools.armed, null, 'A view whose row lacks the tool must put it down.');
      assert.equal(tools.first, null, 'The first end must be let go.');
      assert.equal(tools.said, null, 'Nothing must be said.');
      assert.equal(calls.n, 1, 'The tools\' listener must be called once for it.');
    }
    {
      const { core, s } = await open(IC);
      const tools = core.toolsOf(s);
      const sel = core.selectionOf(s);
      sel.front('v-ic');
      tools.arm('FeatureTyping');
      tools.click(inHit(core, s, 'v-ic', 'System.tank'));
      const { calls } = counting(tools);
      sel.set([{ type: 'el', id: 'Tank' }]);
      assert.equal(tools.armed?.kind, 'FeatureTyping', 'Picking must leave the tool in hand.');
      sel.front('v-defs');
      assert.equal(tools.armed?.kind, 'FeatureTyping', 'A view whose row lists the tool must leave it in hand.');
      assert.equal(tools.first, 'System.tank', 'The first end must stay.');
      assert.equal(calls.n, 0, 'Neither change must tell the tools\' listener.');
      sel.front(null);
      assert.equal(tools.armed, null, 'No view in front must put the tool down.');
      assert.equal(tools.first, null, 'No view in front must let the first end go.');
    }
  });

  test('an undo leaves the tool in hand, and lets go of a first end that left the model', async () => {
    {
      const { core, s } = await open();
      const tools = core.toolsOf(s);
      tools.arm('PartUsage');
      tools.click(inHit(core, s, 'v-proof', 'Host'));
      const part = s.model.elements.at(-1).id;
      tools.arm('ConnectionUsage');
      tools.click(inHit(core, s, 'v-proof', part));
      assert.equal(tools.first, part, 'The new part must be the first end.');
      const { calls } = counting(tools);
      s.history.undo();
      assert.ok(!s.model.elements.some((e) => e.id === part), 'Undo must take the part away.');
      assert.equal(tools.first, null, 'A first end that left the model must be let go.');
      assert.equal(tools.armed?.kind, 'ConnectionUsage', 'Undo must leave the tool in hand.');
      assert.equal(tools.hint, core.toolHint(lib, 'ConnectionUsage', 0), 'The hint must be the first again.');
      assert.equal(tools.said, null, 'Nothing must be said.');
      assert.equal(calls.n, 1, 'The listener must be called once for it.');
    }
    {
      const { core, s } = await open();
      const tools = core.toolsOf(s);
      tools.arm('PartDefinition');
      tools.click(groundHit('v-proof', 500, 800));
      tools.arm('Specialization');
      tools.click(inHit(core, s, 'v-proof', 'Host'));
      s.history.undo();
      assert.equal(tools.first, 'Host', 'A first end that is still in the model must stay.');
      assert.equal(tools.armed?.kind, 'Specialization', 'Undo must leave the tool in hand.');
    }
  });

  test('the palette offers what can be made at a hit', async () => {
    const cases = [
      ['v-proof', EXAMPLE, 'ground', [['PartDefinition', 'PortDefinition', 'PartUsage']]],
      ['v-proof', EXAMPLE, 'in Host', [['PartUsage', 'PortUsage'], ['Specialization']]],
      ['v-proof', EXAMPLE, 'in Page.hosts', [['PartUsage', 'PortUsage'], ['Specialization', 'FeatureTyping', 'ConnectionUsage']]],
      ['v-proof', EXAMPLE, 'on Page.hosts.api', [['Specialization', 'FeatureTyping', 'ConnectionUsage']]],
      ['v-proof', EXAMPLE, 'in StrongholdApp', [['Specialization']]],
      ['v-proof', EXAMPLE, 'line mount', []],
      ['v-ic', IC, 'ground', [['PartDefinition', 'PortDefinition', 'PartUsage', 'ItemDefinition', 'ItemUsage', 'InterfaceDefinition']]],
      ['v-ic', IC, 'in Tank', [['PartUsage', 'PortUsage', 'ItemUsage']]],
      ['v-ic', IC, 'in FuelLine', [['PortUsage']]],
      ['v-ic', IC, 'in Fuel', []],
      ['v-ic', IC, 'on System.pump.fuelIn', [['ConnectionUsage', 'InterfaceUsage', 'FlowConnectionUsage', 'BindingConnectorAsUsage', 'FeatureTyping']]],
      ['v-release', ACTIONS, 'ground', [['ActionDefinition', 'ActionUsage']]],
      ['v-release', ACTIONS, 'in Release', [['ActionUsage', 'ParameterUsage'], ['ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode', 'StartNode', 'DoneNode']]],
      ['v-release', ACTIONS, 'on Release.start', [['SuccessionAsUsage']]],
      ['v-host', STATES, 'ground', [['StateDefinition', 'StateUsage', 'ActionUsage']]],
      ['v-host', STATES, 'in HostLifecycle.idle', [['StateUsage', 'InitialNode', 'ActionUsage', 'DoneNode'], ['TransitionUsage', 'FeatureTyping']]],
      ['v-host', STATES, 'on HostLifecycle.done', []],
      ['no-such-view', EXAMPLE, 'ground', []],
    ];
    for (const [view, file, where, expected] of cases) {
      const { core, s } = await open(file);
      const tools = core.toolsOf(s);
      const { calls } = counting(tools);
      const before = json(s);
      const was = steps(s);
      let hit;
      if (where === 'ground') hit = view in GROUND ? groundHit(view, ...GROUND[view]) : groundHit(view, 100, 100);
      else if (where.startsWith('line ')) hit = { view, type: 'rel', id: where.slice(5), at: { x: 500, y: 350 }, add: false };
      else hit = hitOf(core, s, view, where);
      assert.deepEqual(kinds(tools.offers(hit)), expected, `The palette at ${where} in ${view} must offer ${JSON.stringify(expected)}.`);
      assert.equal(json(s), before, `Offering at ${where} must write nothing.`);
      assert.equal(steps(s), was, `Offering at ${where} must make no undo step.`);
      assert.equal(calls.n, 0, `Offering at ${where} must tell no listener.`);
    }
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    tools.arm('PartDefinition');
    assert.deepEqual(kinds(tools.offers(inHit(core, s, 'v-proof', 'Host'))), [['PartUsage', 'PortUsage'], ['Specialization']], 'A tool in hand must change no answer.');
  });

  test('a choice from the palette is the tool\'s click at that hit', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    const sel = core.selectionOf(s);
    const { calls } = counting(tools);
    const was = steps(s);

    tools.choose('PartUsage', inHit(core, s, 'v-proof', 'Host'));
    const part = plain(s.model.elements.at(-1));
    assert.equal(part.kind, 'PartUsage', 'Choosing the part tool in Host must place a part.');
    assert.equal(part.owner, 'Host', 'The part must be inside Host.');
    assert.deepEqual(plain(sel.items), [{ type: 'el', id: part.id }], 'The part must be picked.');
    assert.equal(tools.armed, null, 'No tool must be in hand after an element is placed.');
    assert.equal(calls.n, 1, 'One choice must tell the listener once.');
    assert.equal(steps(s), was + 1, 'The choice must make one step.');

    const after = json(s);
    tools.choose('Specialization', inHit(core, s, 'v-proof', 'Host'));
    assert.equal(tools.armed?.kind, 'Specialization', 'Choosing a relationship tool must take it in hand.');
    assert.equal(tools.first, 'Host', 'The clicked element must be its first end.');
    assert.equal(json(s), after, 'Nothing must be written yet.');
    assert.equal(calls.n, 2, 'One choice must tell the listener once.');

    tools.arm('PortDefinition');
    calls.n = 0;
    tools.choose('PartDefinition', groundHit('v-proof', 500, 800));
    assert.equal(s.model.elements.at(-1).kind, 'PartDefinition', 'Choosing the part def tool on the ground must place a part def.');
    assert.equal(tools.armed, null, 'What was in hand must have been put down, and the placed tool with it.');
    assert.equal(calls.n, 1, 'One choice must tell the listener once.');

    calls.n = 0;
    tools.choose('FeatureTyping', inHit(core, s, 'v-proof', 'Host'));
    assert.equal(tools.armed?.kind, 'FeatureTyping', 'Choosing the typing tool must take it in hand.');
    assert.equal(tools.first, null, 'A definition must not be taken as the first end.');
    assert.equal(tools.said?.text, 'Only a usage is defined by something; part def Host is a definition. Escape puts the tool down.', 'The rule on the first end must speak.');
    assert.equal(calls.n, 1, 'One choice must tell the listener once.');
  });

  test('every tool of each graph view kind\'s row makes its element or its line, and Undo takes it back', async () => {
    const core = await loadCore();
    const views = [['v-proof', 'GeneralView'], ['v-ic', 'InterconnectionView'], ['v-release', 'ActionFlowView'], ['v-host', 'StateTransitionView']];
    for (const [view, viewKind] of views) {
      const row = plain(lib.VIEW_KINDS[viewKind].tools).filter((name) => name !== '|');
      const uses = USES.filter((u) => u.view === view);
      assert.deepEqual(uses.map((u) => u.tool), row, `The uses of ${view} must be the tools of ${viewKind}'s row, in order.`);
      for (const use of uses) {
        const { s, tools, made, before } = await walk(use);
        const where = `${use.tool} in ${view}`;
        assert.equal(lastWords(s), use.words, `${where} must say ${use.words}.`);
        const projection = core.project(lib, s.model, viewOf(s, view));
        const drawn = use.at ? projection.nodes.some((n) => n.id === made.id) : projection.edges.some((e) => e.id === made.id);
        assert.ok(drawn, `${where} must appear on the plane of ${view}.`);
        assert.deepEqual(plain(core.selectionOf(s).items), [{ type: use.at ? 'el' : 'rel', id: made.id }], `${where} must pick what it made.`);
        assert.deepEqual(says(s), [...before.says, ...(use.adds ? [use.adds] : [])].sort(), `${where} must add ${use.adds ? 'only ' + use.adds : 'nothing'} to what M.validate says.`);
        assert.equal(tools.armed, null, `${where} must put the tool down.`);
        for (let i = 0; i < (use.undos ?? 1); i++) s.history.undo();
        assert.equal(json(s), before.json, `Undo must take ${where} back.`);
        assert.equal(steps(s), before.steps, `Undo must take back every step of ${where}.`);
      }
    }
  });

  test('a hit on something the model no longer holds counts as the ground', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    const gone = { view: 'v-proof', type: 'el', id: 'gone', at: { x: 500, y: 800 }, add: false };
    tools.arm('PartDefinition');
    assert.equal(tools.click(gone), true, 'A click on what is gone must be the tool\'s.');
    const el = plain(s.model.elements.at(-1));
    assert.equal(el.kind, 'PartDefinition', 'A part def must be placed.');
    assert.deepEqual(plain(viewOf(s, 'v-proof').layout[el.id]), { x: 390, y: 780, w: 220, h: 72 }, 'It must stand on the ground at the click.');
    const before = json(s);
    tools.arm('Specialization');
    assert.equal(tools.click(gone), true, 'A click on what is gone must be the tool\'s for a relationship tool too.');
    assert.equal(tools.armed, null, 'It must count as the ground: the tool is put down.');
    assert.equal(tools.said, null, 'With no first end nothing must be said.');
    assert.equal(json(s), before, 'Nothing must be written.');
  });

  test('the tools\' methods can be handed over as they are', async () => {
    const { core, s } = await open();
    const tools = core.toolsOf(s);
    const { arm, putDown, click, offers, choose, listen } = tools;
    let told = 0;
    const stop = listen(() => { told++; });
    arm('PartDefinition');
    assert.equal(tools.armed?.kind, 'PartDefinition', 'A bare arm must take the tool in hand.');
    assert.deepEqual(kinds(offers(groundHit('v-proof', 500, 800))), [['PartDefinition', 'PortDefinition', 'PartUsage']], 'A bare offers must answer.');
    assert.equal(click(groundHit('v-proof', 500, 800)), true, 'A bare click must be the tool\'s.');
    assert.equal(s.model.elements.at(-1).kind, 'PartDefinition', 'A bare click must place the part def.');
    choose('PartUsage', inHit(core, s, 'v-proof', 'Host'));
    assert.equal(s.model.elements.at(-1).kind, 'PartUsage', 'A bare choose must place the part.');
    arm('PortUsage');
    putDown();
    assert.equal(tools.armed, null, 'A bare putDown must put the tool down.');
    assert.ok(told > 0, 'The bare listen must have told its listener.');
    stop();
    const at = told;
    arm('PortUsage');
    assert.equal(told, at, 'What listen returned must stop the listener.');
  });
});
