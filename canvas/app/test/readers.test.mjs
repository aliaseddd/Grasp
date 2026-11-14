// The readers: canvas/app/src/core/readers/ (plan/slice-2.md, section 4, seams 1 and 5; plan/architecture.md,
// contract 5). A reader turns a model and one of its views into what the view's body draws, and says what the view
// shows in one form for every kind. The scaffold builds the reader of the four graph kinds, which is the adapter, and
// leaves the other four as null for their packages. Here too: who a node and an edge are (elementOf, relationshipOf),
// and a code compartment's rows (codeRowsOf), which the adapter now asks for.
//
// They run in Node. What a view's store does with a reader of another renderer (the projection, a step and the end,
// with only the pressed node moving) is tested with the store, not here.

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { FIXTURES, STAND_IN_PLANE_ACTIONS, STAND_IN_PLANE_READER, clock, lib, loadCore, loadCoreWith, plain, readText, stateFiles } from './core.mjs';

const FILES = stateFiles();
const SEQUENCE = path.join(FIXTURES, 'sequence.json');
const sessionOf = (core, file) => core.openText(lib, readText(file), { name: path.basename(file) }, { now: clock() });
const isGraph = (view) => lib.VIEW_KINDS[view.kind]?.renderer === 'graph';
/** Every graph view of the ten files, each with a session of its own core. */
function graphViews(core) {
  const out = [];
  for (const { name, file } of FILES) {
    const s = sessionOf(core, file);
    for (const view of s.model.views) if (isGraph(view)) out.push({ label: `${name}, ${view.id}`, s, view });
  }
  return out;
}
/** A projection's nodes and edges as plain data, to compare two projections by value. */
const drawn = (p) => JSON.stringify({ nodes: p.nodes, edges: p.edges, rects: [...p.rects], bounds: p.bounds, far: p.far });

describe('the readers', () => {
  test('the graph reader\'s read is the adapter\'s project', async () => {
    const core = await loadCore();
    const reader = core.readerOf('graph');
    assert.equal(reader, core.graphReader, 'The reader of the renderer `graph` is the graph reader.');
    const views = graphViews(core);
    assert.equal(views.length, 11, 'The ten files hold 11 views of the graph kinds.');
    for (const { label, s, view } of views) {
      const read = reader.read(lib, s.model, view);
      assert.equal(drawn(read), drawn(core.project(lib, s.model, view)), `${label}: read() must give what project() gives.`);
      assert.equal(reader.read(lib, s.model, view, { previous: read }), read, `${label}: what reads the same as \`previous\` must be \`previous\` itself.`);
      const far = reader.read(lib, s.model, view, { far: true, previous: read });
      assert.equal(drawn(far), drawn(core.project(lib, s.model, view, { far: true })), `${label}: read() must hand \`far\` on.`);
      // A gesture's places stand in for the view's own, as project() takes them.
      const box = read.nodes.find((n) => n.data.form !== 'border');
      if (box) {
        const places = new Map([[box.id, { x: box.position.x + 40, y: box.position.y + 30, w: box.width, h: box.height }]]);
        assert.equal(drawn(reader.read(lib, s.model, view, { places })), drawn(core.project(lib, s.model, view, { places })), `${label}: read() must hand \`places\` on.`);
      }
      // readView reads the session's view by its id, by its kind's reader.
      const viaSession = core.readView(s, view.id, { previous: read });
      assert.deepEqual(Object.keys(viaSession), ['renderer', 'data']);
      assert.equal(viaSession.renderer, 'graph');
      assert.equal(viaSession.data, read, `${label}: readView must hand its options to the reader.`);
    }
    const s = views[0].s;
    assert.equal(core.readView(s, 'no-such-view'), null, 'A view the model does not hold reads as null.');
  });

  test('sizeOf is the projection\'s bounds', async () => {
    const core = await loadCore();
    for (const { label, s, view } of graphViews(core)) {
      const data = core.graphReader.read(lib, s.model, view);
      assert.deepEqual(core.graphReader.sizeOf(data), { width: data.bounds.w, height: data.bounds.h }, `${label}: a graph body is as large as its projection's bounds.`);
    }
    const s = sessionOf(core, FILES[0].file);
    s.history.edit(() => { s.model.views[0].layout = {}; return 'Emptied the view'; });
    assert.deepEqual(core.graphReader.sizeOf(core.graphReader.read(lib, s.model, s.model.views[0])), { width: 0, height: 0 }, 'A view that places nothing has no size.');
  });

  test('listed gives one entry for each node and edge of the ten files', async () => {
    const core = await loadCore();
    let nodes = 0;
    let edges = 0;
    for (const { label, s, view } of graphViews(core)) {
      const data = core.graphReader.read(lib, s.model, view);
      const listed = core.graphReader.listed(data);
      assert.equal(listed.length, data.nodes.length + data.edges.length, `${label}: one entry for each node and each edge.`);
      const els = new Set(s.model.elements.map((e) => e.id));
      const rels = new Set(s.model.relationships.map((r) => r.id));
      data.nodes.forEach((node, i) => {
        const entry = listed[i];
        assert.deepEqual(Object.keys(entry), ['type', 'id', 'words', 'rect'], `${label}: an entry has the four fields of Listed.`);
        assert.equal(entry.type, 'el');
        assert.equal(entry.id, node.id, `${label}: the nodes are listed in their order, each by its element.`);
        assert.ok(els.has(entry.id), `${label}: ${entry.id} must be an element of the model.`);
        assert.deepEqual(entry.rect, { ...data.rects.get(node.id) }, `${label}: ${node.id} is listed with its rectangle from the view's origin.`);
        const said = node.data.form === 'box' ? `${node.data.keyword} ${node.data.name}` : node.data.name;
        assert.equal(entry.words, said, `${label}: ${node.id} is listed by its keyword and its name, as its node says them.`);
      });
      data.edges.forEach((edge, i) => {
        const entry = listed[data.nodes.length + i];
        assert.deepEqual(entry, { type: 'rel', id: edge.id, words: edge.data.label, rect: null }, `${label}: a line is listed by its label, with no rectangle.`);
        assert.ok(rels.has(entry.id));
      });
      nodes += data.nodes.length;
      edges += data.edges.length;
    }
    assert.ok(nodes > 100 && edges > 40, `The ten files' graph views draw ${nodes} nodes and ${edges} lines.`);
    // In words: the example's Host and its hosts.
    const s = sessionOf(core, FILES[0].file);
    const listed = core.graphReader.listed(core.graphReader.read(lib, s.model, s.model.views[0]));
    const by = (id) => listed.find((entry) => entry.id === id);
    assert.equal(by('Host').words, '«abstract part def» Host');
    assert.equal(by('Page.hosts').words, '«part» hosts : Host [1..*]');
    assert.equal(by('Page.hosts.api').words, 'api : ~StrongholdApp');
    assert.equal(by('mount').words, 'mount');
  });

  test('every node and every edge says whose it is: its element or its relationship, and its view', async () => {
    const core = await loadCore();
    for (const { label, s, view } of graphViews(core)) {
      for (const far of [false, true]) {
        const data = core.project(lib, s.model, view, { far });
        for (const node of data.nodes) {
          assert.equal(core.elementOf(node), node.id, `${label}: in a graph view a node's element is the element its id names.`);
          assert.equal(node.data.element, node.id);
          assert.equal(node.data.view, view.id, `${label}: ${node.id} must name its view.`);
        }
        for (const edge of data.edges) {
          assert.equal(core.relationshipOf(edge), edge.id, `${label}: an edge's relationship is the relationship its id names.`);
          assert.equal(edge.data.relationship, edge.id);
          assert.equal(edge.data.view, view.id, `${label}: ${edge.id} must name its view.`);
        }
      }
    }
    // A node that stands for no element has none, whatever its id is.
    assert.equal(core.elementOf({ id: 'axes', data: { element: null } }), null);
    assert.equal(core.elementOf({ id: 'Login.client:line', data: { element: 'Login.client' } }), 'Login.client');
  });

  test('a code compartment\'s rows are codeRowsOf\'s, each cut to its box', async () => {
    const core = await loadCore();
    const s = sessionOf(core, path.join(FIXTURES, 'annotations.json'));
    const host = s.model.elements.find((e) => e.id === 'Host');
    assert.deepEqual(core.codeRowsOf(lib, s.model, host), ['hosts/README.md'], 'A link\'s words are its path.');
    assert.deepEqual(core.codeRowsOf(lib, s.model, s.model.elements.find((e) => e.id === 'App')), [], 'An element with no link has no rows.');
    const long = 'app/src/host/a/very/long/path/that/no/box/of/this/width/can/hold/whole/load-app.ts';
    s.history.edit(() => {
      host.code = [{ path: `  ${long}  `, language: 'typescript', text: '' }, { path: '   ', language: 'json', text: 'x' }, 'not a link', { language: 'css' }];
      return 'Changed the code links of part def Host';
    });
    assert.deepEqual(core.codeRowsOf(lib, s.model, host), [long, '(no path)', '(no path)', '(no path)'], 'Each link gives one row, uncut: its path trimmed, or (no path).');
    const rows = core.project(lib, s.model, s.model.views[0]).nodes.find((n) => n.id === 'Host').data.compartments.find((c) => c.head === 'code').lines;
    assert.equal(rows.length, 4, 'The box has a row for each of codeRowsOf\'s.');
    assert.ok(rows[0].startsWith('…') && long.endsWith(rows[0].slice(1)), 'A path too long for its box keeps its end behind an ellipsis.');
    assert.deepEqual(rows.slice(1), ['(no path)', '(no path)', '(no path)']);
    s.history.edit(() => { host.code = 'none'; return 'Broke the code links'; });
    assert.deepEqual(core.codeRowsOf(lib, s.model, host), [], 'What is no list holds no link.');
  });

  test('a reader that is not built is null, and its kind keeps its card and has no tools', async (t) => {
    const core = await loadCore();
    assert.equal(core.rendererOf(lib, 'GeneralView'), 'graph');
    assert.equal(core.rendererOf(lib, 'NoSuchView'), null, 'A kind the library does not hold has no renderer.');
    assert.equal(core.readerOf('no-such-renderer'), null);
    assert.equal(core.hasReader(lib, 'NoSuchView'), false);
    for (const kind of ['GeneralView', 'InterconnectionView', 'ActionFlowView', 'StateTransitionView']) {
      assert.equal(core.hasReader(lib, kind), true, `${kind} is drawn by a body.`);
      assert.equal(core.isDrawn(lib, kind), true, `${kind} is read by the adapter's own project().`);
    }
    assert.equal(core.placerOf('graph'), null, 'The graph kinds\' rule of place is place() itself.');
    assert.equal(core.enderOf('graph'), null, 'A gesture\'s end in a graph view is the store\'s to write.');
    assert.equal(core.placerOf('grid'), null, 'A grid view has no tools, so no placer.');
    assert.equal(core.placerOf('browser'), null);

    // The four other renderers, each with a view of the ten files. While a kind's reader is null it is not drawn: no
    // tools, nothing read, nothing placed. Once its package has built the reader, this test has nothing to say of it.
    const KINDS = [['sequence', 'SequenceView', 'sequence.json', 'v-seq'], ['geometry', 'GeometryView', 'geometry.json', 'v-plan'],
      ['grid', 'GridView', 'grid.json', 'v-table'], ['browser', 'BrowserView', 'browser.json', 'v-tree']];
    let unbuilt = 0;
    for (const [renderer, kind, file, viewId] of KINDS) {
      assert.equal(core.rendererOf(lib, kind), renderer);
      assert.equal(core.isDrawn(lib, kind), false, `${kind} is never the adapter's own to project.`);
      if (core.readerOf(renderer) !== null) continue;
      unbuilt += 1;
      assert.equal(core.hasReader(lib, kind), false, `With no reader ${kind} is not drawn by a body: its tab shows the card.`);
      assert.deepEqual(core.toolGroups(lib, kind), [], `With no reader ${kind} lists no tools.`);
      const s = sessionOf(core, path.join(FIXTURES, file));
      assert.equal(core.readView(s, viewId), null, `With no reader ${viewId} reads as null.`);
      const tools = core.toolsOf(s);
      const hit = { view: viewId, type: 'ground', id: null, at: { x: 100, y: 100 }, add: false };
      assert.deepEqual(tools.offers(hit), [], `With no reader nothing can be made in ${viewId}.`);
      tools.arm('PartUsage');
      assert.equal(tools.click(hit), true);
      assert.equal(tools.armed, null, `A click in ${viewId} puts the tool down.`);
      assert.equal(s.history.steps.length, 0, `A click in ${viewId} writes nothing.`);
      assert.throws(() => core.place(s, 'PartUsage', hit), /place/, 'place() in a view nothing draws is the caller\'s mistake.');
      assert.equal(core.placerOf(renderer), null);
      assert.equal(core.enderOf(renderer), null);
    }
    t.diagnostic(`${unbuilt} of 4 readers are still null`);
  });

  test('the tools of a sequence view have the old page\'s words', async () => {
    const core = await loadCore();
    assert.equal(core.TOOL_TITLE.EventOccurrenceUsage, 'An event occurrence: a dot on a lifeline, where a message starts or ends');
    assert.equal(core.TOOL_TITLE.Message, 'A message between two lifelines or events, a row in time order');
    assert.equal(core.toolHint(lib, 'EventOccurrenceUsage', 0), 'Click a lifeline, the dashed line under a part\'s head, to put an event on it.');
    assert.equal(core.toolHint(lib, 'Message', 0), 'Click the event or lifeline the message comes from…');
    assert.equal(core.toolHint(lib, 'Message', 1), 'Now click the event or lifeline it goes to.');
    assert.equal(core.BASE_NAME.EventOccurrenceUsage, 'event');
    // Every tool of the sequence and geometry rows has a title of its own and hints without a placeholder.
    const titles = new Set();
    for (const name of new Set([...plain(lib.VIEW_KINDS.SequenceView.tools), ...plain(lib.VIEW_KINDS.GeometryView.tools)])) {
      if (name === '|') continue;
      assert.equal(typeof core.TOOL_TITLE[name], 'string', `The tool ${name} must have a title.`);
      assert.ok(!titles.has(core.TOOL_TITLE[name]));
      titles.add(core.TOOL_TITLE[name]);
      assert.ok(!core.toolHint(lib, name, 0).includes('{') && !core.toolHint(lib, name, 1).includes('{'));
    }
    const s = sessionOf(core, SEQUENCE);
    assert.equal(core.freeName(lib, s.model, 'EventOccurrenceUsage', 'Login.server'), 'event1', 'A new event is named event1.');
  });
});

// A stand-in for package 2-10's two files of the core: a reader that gives data of its own, a placer and an ender.
const STAND_IN_READER = `
  import type { Reader } from './index';
  export const READ: { calls: { view: string; options: unknown }[] } = { calls: [] };
  export interface StandInData { stand: 'in'; view: string; far: boolean; shown: string[] }
  export const sequenceReader: Reader<StandInData> = {
    read(_lib, _model, view, options) {
      READ.calls.push({ view: view.id, options });
      return { stand: 'in', view: view.id, far: options?.far === true, shown: Object.keys(view.layout) };
    },
    sizeOf: () => ({ width: 640, height: 480 }),
    listed: (data) => data.shown.map((id, i) => ({ type: 'el' as const, id, words: id, rect: { x: 0, y: 28 * i, w: 100, h: 28 } })),
  };
  export function sequenceStep(): never { throw new Error('a stand-in'); }
  export function sequenceResult(): null { return null; }
`;
const STAND_IN_ACTIONS = `
  import { freeName, freshElement } from '../commands';
  import type { Action, Outcome } from '../commands';
  import type { Placer, Ender } from '../readers/index';
  export const SEQUENCE_ACTIONS: readonly Action[] = [];
  export const PLACED: { kind: string; view: string; type: string }[] = [];
  export const place: Placer = (session, kind, hit): Outcome => {
    PLACED.push({ kind, view: hit.view, type: hit.type });
    if (kind === 'EventOccurrenceUsage' && hit.type === 'ground') return { refused: 'Click a lifeline, the dashed line under a part\\'s head, to put an event on it.' };
    const owner = hit.type === 'el' ? hit.id : null;
    const el = freshElement(session, kind, freeName(session.lib, session.model, kind, owner), owner);
    let words = '';
    session.history.edit(() => {
      session.model.elements.push(el);
      session.model.views.find((v) => v.id === hit.view)!.layout[el.id] = { x: Math.round(hit.at.x), y: 0, w: 120, h: 40 };
      words = 'Added ' + kind + ' ' + el.name;
      return words;
    });
    return { made: { type: 'el', id: el.id }, words };
  };
  export const end: Ender = () => ({ refused: 'The stand-in writes nothing.' });
  export function moveMessage(): never { throw new Error('a stand-in'); }
`;

describe('a reader of another renderer, by a stand-in for the sequence view\'s', () => {
  const load = () => loadCoreWith({ 'core/readers/sequence': STAND_IN_READER, 'core/actions/sequence': STAND_IN_ACTIONS });
  const ground = (x = 500, y = 300) => ({ view: 'v-seq', type: 'ground', id: null, at: { x, y }, add: false });
  const on = (id) => ({ view: 'v-seq', type: 'el', id, at: { x: 10, y: 10 }, add: false });

  test('its kind is drawn by a body: it is read by its reader, and it lists the tools of its row', async () => {
    const core = await load();
    assert.equal(core.readerOf('sequence'), core.sequenceReader, 'readerOf gives the reader its file exports.');
    assert.equal(core.hasReader(lib, 'SequenceView'), true);
    assert.equal(core.isDrawn(lib, 'SequenceView'), false, 'isDrawn keeps its old meaning: the adapter\'s own project() reads it.');
    assert.equal(core.hasReader(lib, 'GeometryView'), false, 'A reader makes its own kind drawn, and no other.');
    const groups = core.toolGroups(lib, 'SequenceView');
    assert.deepEqual(groups.map((g) => g.map((t) => t.kind)), [['PartUsage', 'EventOccurrenceUsage'], ['Message', 'SuccessionAsUsage']], 'Its tools are its row\'s, in its groups.');
    assert.deepEqual(groups.flat().map((t) => [t.type, t.label]), [['el', 'part'], ['el', 'event'], ['rel', 'message'], ['rel', 'succession']]);

    const s = sessionOf(core, SEQUENCE);
    core.READ.calls.length = 0;
    const read = core.readView(s, 'v-seq', { far: true });
    assert.equal(read.renderer, 'sequence');
    assert.deepEqual(read.data, { stand: 'in', view: 'v-seq', far: true, shown: ['Login.client', 'Login.client.loginSent', 'Login.client.loginDone', 'Login.server', 'Login.auth'] });
    assert.deepEqual(core.READ.calls, [{ view: 'v-seq', options: { far: true } }], 'readView hands the view and its options to the reader, once.');
    assert.equal(core.readView(s, 'v-all').renderer, 'graph', 'The file\'s general view is still read by the graph reader.');
    assert.deepEqual(core.project(lib, s.model, s.model.views.find((v) => v.id === 'v-seq')).nodes, [], 'The adapter\'s project() still gives nothing for a sequence view.');
  });

  test('a tool in its view places through its kind\'s placer, and draws as in any view', async () => {
    const core = await load();
    const s = sessionOf(core, SEQUENCE);
    const tools = core.toolsOf(s);
    const sel = core.selectionOf(s);
    sel.front('v-seq');
    core.sequenceActions.PLACED.length = 0;
    assert.equal(core.placerOf('sequence'), core.sequenceActions.place, 'placerOf gives the placer its file exports.');
    assert.equal(core.enderOf('sequence'), core.sequenceActions.end, 'enderOf gives the ender its file exports.');
    assert.equal(core.enderOf('sequence')(s, 'v-seq', null, []).refused, 'The stand-in writes nothing.');

    // An element tool: the click goes to the placer, and what it made is picked, as in a graph view.
    tools.arm('PartUsage');
    assert.equal(tools.armed?.kind, 'PartUsage', 'A sequence view lists the part tool, so it stays in hand in front of it.');
    assert.equal(tools.click(ground(640)), true);
    assert.deepEqual(core.sequenceActions.PLACED, [{ kind: 'PartUsage', view: 'v-seq', type: 'ground' }], 'The click must be the placer\'s.');
    const made = s.model.elements.at(-1);
    assert.equal(made.kind, 'PartUsage');
    assert.deepEqual(plain(sel.items), [{ type: 'el', id: made.id }], 'What the placer made is picked.');
    assert.equal(tools.armed, null, 'The tool is put down once it made something.');
    assert.equal(s.history.steps.length, 1, 'It is one undo step.');

    // A refusal of the placer is the tool's to say, and the tool stays in hand.
    tools.arm('EventOccurrenceUsage');
    tools.click(ground());
    assert.equal(tools.said?.text, 'Click a lifeline, the dashed line under a part\'s head, to put an event on it.');
    assert.equal(tools.armed?.kind, 'EventOccurrenceUsage');
    assert.equal(s.history.steps.length, 1, 'A refusal writes nothing.');
    tools.putDown();

    // place() itself goes to the placer for a renderer other than graph, and stays the graph kinds' rule in a graph view.
    const out = core.place(s, 'EventOccurrenceUsage', on('Login.server'));
    assert.equal(s.model.elements.find((e) => e.id === out.made.id).owner, 'Login.server');
    assert.ok('made' in core.place(s, 'PartDefinition', { view: 'v-all', type: 'ground', id: null, at: { x: 900, y: 900 }, add: false }));
    assert.throws(() => core.place(s, 'NoSuchKind', ground()), /NoSuchKind/);

    // A relationship tool draws with draw(), as in any view.
    const before = s.history.steps.length;
    tools.arm('Message');
    tools.click(on('Login.auth'));
    assert.equal(tools.first, 'Login.auth');
    tools.click(on('Login.client'));
    assert.equal(s.history.steps.length, before + 1);
    const rel = s.model.relationships.at(-1);
    assert.deepEqual([rel.kind, rel.from, rel.to], ['Message', 'Login.auth', 'Login.client']);
    assert.equal(tools.said, null, 'Both ends are placed in the sequence view, which a body draws: the line is drawn somewhere.');
    assert.deepEqual(plain(sel.items), [{ type: 'rel', id: rel.id }]);

    // The palette: on the ground every element tool of the row, on an element also the lines that may start there.
    assert.deepEqual(tools.offers(ground()).map((g) => g.map((t) => t.kind)), [['PartUsage', 'EventOccurrenceUsage']]);
    const ids = lib.idsOf(s.model);
    const starts = ['Message', 'SuccessionAsUsage'].filter((kind) => lib.RELATIONSHIPS[kind].first(s.model, ids.get('Login.server'), ids) === null);
    assert.ok(starts.includes('Message'), 'A message may start at a lifeline.');
    assert.deepEqual(tools.offers(on('Login.server')).map((g) => g.map((t) => t.kind)), [['PartUsage', 'EventOccurrenceUsage'], starts]);
    assert.deepEqual(tools.offers({ ...on('m-login'), type: 'rel' }), []);
  });
});

// ---- With a view's store (seam 3): a graph body of another renderer.

// A stand-in for package 2-12's reader: a component body's, whose data is no Projection.
const STAND_IN_ROWS_READER = `
  import type { Reader } from './index';
  export const GRID_ASKED = { read: 0 };
  export const GRID_ROW = 28, GRID_HEAD = 32, GRID_MARKS = 72, MATRIX_SIDE = 200, MATRIX_CELL = 96;
  export const GRID_WIDTHS = {};
  export const gridReader: Reader<{ rows: string[] }> = {
    read(_lib, _model, view) { GRID_ASKED.read += 1; return { rows: Object.keys(view.layout) }; },
    sizeOf: () => ({ width: 100, height: 100 }),
    listed: (data) => data.rows.map((id) => ({ type: 'el' as const, id, words: id, rect: null })),
  };
  export function orderRows(): never { throw new Error('a stand-in'); }
`;

describe('a graph body of another renderer in a view\'s store, by a stand-in for the sequence view\'s', () => {
  const load = () => loadCoreWith({ 'core/readers/sequence': STAND_IN_PLANE_READER, 'core/actions/sequence': STAND_IN_PLANE_ACTIONS }, 'plane/viewStore');
  const position = (id, x, y, dragging) => ({ type: 'position', id, position: { x, y }, dragging });
  const node = (snapshot, id) => snapshot.nodes.find((n) => n.id === id);
  const at = (snapshot, id) => ({ x: node(snapshot, id).position.x, y: node(snapshot, id).position.y });
  const layoutX = (s, id) => s.model.views.find((v) => v.id === 'v-seq').layout[id].x;
  function listen(store) {
    const calls = { n: 0 };
    const stop = store.subscribe(() => { calls.n += 1; });
    return { calls, stop };
  }
  /** A session of the sequence fixture and the store of its sequence view, with what the stand-ins were asked emptied. */
  async function open() {
    const core = await load();
    const s = sessionOf(core, SEQUENCE);
    core.ASKED.read.length = 0;
    core.ASKED.step.length = 0;
    core.ASKED.listed = 0;
    core.sequenceActions.ENDED.length = 0;
    return { core, s, store: core.viewStoreOf(s, 'v-seq'), ASKED: core.ASKED, ENDED: core.sequenceActions.ENDED };
  }

  test('a stand-in reader of another renderer is asked for the projection, a step and the end, and only the pressed node moves', async () => {
    const { core, s, store, ASKED, ENDED } = await open();
    assert.equal(core.graphBodied('sequence'), true, 'A sequence view has a graph body.');
    assert.equal(store.drawn, true, 'A view whose kind has a reader is drawn by a body.');

    // The projection is the reader's.
    const first = store.getSnapshot();
    assert.deepEqual(ASKED.read, [{ view: 'v-seq', far: false, previous: false }], 'The store asks the kind\'s reader for the projection, once, near and with nothing before it.');
    assert.deepEqual(first.nodes.map((n) => n.id), ['Login.client', 'Login.client:line', 'Login.client.loginSent', 'Login.client.loginDone', 'Login.server', 'Login.auth', 'axes']);
    assert.deepEqual(first.edges.map((e) => e.id), ['m-login']);
    assert.equal(store.getSnapshot(), first, 'The snapshot is the same object until something changes.');
    assert.equal(ASKED.read.length, 1);
    s.history.edit(() => { s.model.elements.find((e) => e.id === 'Login.auth').doc = 'Checks the password.'; return 'Wrote the documentation'; });
    store.getSnapshot();
    assert.deepEqual(ASKED.read.at(-1), { view: 'v-seq', far: false, previous: true }, 'After a change the reader is asked again, with the projection before as `previous`.');

    // Selected is set by the node's element: both nodes of one element, and never a node that stands for none.
    const { calls } = listen(store);
    core.selectionOf(s).set([{ type: 'el', id: 'Login.client' }, { type: 'el', id: 'Login.server' }, { type: 'rel', id: 'm-login' }]);
    let snapshot = store.getSnapshot();
    assert.deepEqual(snapshot.nodes.filter((n) => n.selected).map((n) => n.id), ['Login.client', 'Login.client:line', 'Login.server'], 'A node is selected when its element is picked: a lifeline\'s head and its line alike.');
    assert.equal(snapshot.edges[0].selected, true, 'An edge is selected when its relationship is picked.');
    assert.equal(node(snapshot, 'Login.auth'), node(first, 'Login.auth') ?? null, 'A node whose element is not picked stays the object it was.');

    // A step: React Flow drags every selected node, and the store takes only the one the press named.
    const before = store.getSnapshot();
    const told = calls.n;
    const model = JSON.stringify(s.model);
    store.dragStarted('Login.server');
    store.nodesChanged([position('Login.server', 300, 40, true), position('Login.client', 40, 40, true), position('Login.client:line', 122, 100, true)]);
    snapshot = store.getSnapshot();
    assert.equal(ASKED.step.length, 1, 'A step of a drag is the reader\'s step(), asked once.');
    assert.deepEqual(plain(ASKED.step[0].asks), [{ id: 'Login.server', move: { x: 300, y: 40 } }], 'The reader is asked for the pressed node alone.');
    assert.deepEqual(ASKED.step[0].start.nodes.map((n) => [n.id, n.position.x]), before.nodes.map((n) => [n.id, n.position.x]), 'A step starts from the projection the gesture began from.');
    assert.deepEqual(at(snapshot, 'Login.server'), { x: 300, y: 0 }, 'The reader holds the head to its row, and the store draws what the reader gives.');
    assert.equal(node(snapshot, 'Login.server').dragging, true, 'The pressed node says dragging.');
    assert.equal(node(snapshot, 'Login.client'), node(before, 'Login.client'), 'A selected node the press did not name stays where it was, the very object.');
    assert.ok(!node(snapshot, 'Login.client').dragging);
    assert.equal(node(snapshot, 'Login.server').selected, true, 'What is picked stays marked through a step.');
    assert.equal(calls.n, told + 1, 'A step tells the subscribers once.');
    store.nodesChanged([position('Login.server', 340, 80, true), position('Login.client', 80, 80, true)]);
    assert.deepEqual(plain(ASKED.step[1].asks), [{ id: 'Login.server', move: { x: 340, y: 80 } }]);
    assert.equal(ASKED.step[1].start, ASKED.step[0].start, 'Every step starts from the same projection.');
    assert.deepEqual(at(store.getSnapshot(), 'Login.server'), { x: 340, y: 0 });
    assert.equal(JSON.stringify(s.model), model, 'No step writes to the model.');
    assert.equal(ENDED.length, 0);

    // The end: the kind's action writes, through edit().
    const steps = s.history.steps.length;
    store.nodesChanged([position('Login.server', 340, 80, false), position('Login.client', 80, 80, false)]);
    assert.equal(ENDED.length, 1, 'The gesture\'s end goes to the kind\'s ender, once.');
    assert.equal(ENDED[0].view, 'v-seq');
    assert.deepEqual(plain(ENDED[0].asks), [{ id: 'Login.server', move: { x: 340, y: 80 } }], 'The ender gets what was asked of the pressed node at the release.');
    assert.equal(ENDED[0].start, ASKED.step[0].start, 'The ender gets the projection the gesture began from.');
    assert.equal(s.history.steps.length, steps + 1, 'The ender\'s edit is one undo step.');
    assert.equal(s.history.steps.at(-1).what, 'Moved Login.server');
    assert.equal(layoutX(s, 'Login.server'), 340);
    assert.equal(layoutX(s, 'Login.client'), 0, 'The store writes nothing itself: a node the press did not name keeps its place.');
    snapshot = store.getSnapshot();
    assert.deepEqual(at(snapshot, 'Login.server'), { x: 340, y: 0 }, 'After the end the store shows the model as written.');
    for (const n of snapshot.nodes) assert.ok(!n.dragging, `After the end no node may say dragging: ${n.id}.`);
    s.history.undo();
    assert.deepEqual(at(store.getSnapshot(), 'Login.server'), { x: 260, y: 0 }, 'Undo puts the head back.');

    // A refusal is said, and the store shows the model's own projection again.
    const said = core.saysOf(s).said;
    store.dragStarted('Login.auth');
    store.nodesChanged([position('Login.auth', 2600, 0, true)]);
    assert.deepEqual(at(store.getSnapshot(), 'Login.auth'), { x: 2600, y: 0 });
    store.nodesChanged([position('Login.auth', 2600, 0, false)]);
    assert.equal(core.saysOf(s).said?.text, 'A head cannot go that far.', 'What the ender refuses is said through saysOf.');
    assert.notEqual(core.saysOf(s).said, said);
    assert.equal(s.history.steps.length, steps, 'A refused end writes nothing.');
    assert.deepEqual(at(store.getSnapshot(), 'Login.auth'), { x: 520, y: 0 }, 'After a refusal the node is back where the model has it.');
    assert.ok(!node(store.getSnapshot(), 'Login.auth').dragging);

    // An end that wrote nothing (null): the model's projection, and nothing said.
    const quiet = core.saysOf(s).said;
    store.dragStarted('Login.auth');
    store.nodesChanged([position('Login.auth', 560, 0, true)]);
    store.nodesChanged([position('Login.auth', 520, 0, false)]);
    assert.equal(ENDED.at(-1).asks[0].move.x, 520);
    assert.equal(core.saysOf(s).said, quiet, 'An end that wrote nothing says nothing.');
    assert.equal(s.history.steps.length, steps);
    assert.deepEqual(at(store.getSnapshot(), 'Login.auth'), { x: 520, y: 0 });

    // A press that never goes 4 px is a click: no step, no end.
    const [stepped, ended] = [ASKED.step.length, ENDED.length];
    store.dragStarted('Login.auth');
    store.nodesChanged([position('Login.auth', 522, 2, true)]);
    store.nodesChanged([position('Login.auth', 522, 2, false)]);
    assert.deepEqual([ASKED.step.length, ENDED.length], [stepped, ended], 'A press that slips two pixels asks the reader and the ender nothing.');

    // A change of the model heard in the middle calls the gesture off: its end is not the ender's.
    store.dragStarted('Login.auth');
    store.nodesChanged([position('Login.auth', 600, 0, true)]);
    s.history.redo();
    store.nodesChanged([position('Login.auth', 640, 0, true)]);
    store.nodesChanged([position('Login.auth', 640, 0, false)]);
    assert.equal(ENDED.length, ended, 'A gesture that a redo cut short is never ended by the ender.');
    assert.deepEqual(at(store.getSnapshot(), 'Login.auth'), { x: 520, y: 0 });
    assert.deepEqual(at(store.getSnapshot(), 'Login.server'), { x: 340, y: 0 }, 'The redo is drawn.');
  });

  test('crossing 25% asks the reader again, far, and a step of a drag in between is drawn far too', async () => {
    const { store, ASKED } = await open();
    listen(store);
    store.getSnapshot();
    store.moved({ x: 0, y: 0, zoom: 0.2 });
    assert.deepEqual(ASKED.read.at(-1), { view: 'v-seq', far: true, previous: true }, 'Far, the reader is asked with `far`.');
    assert.equal(store.getSnapshot().far, true);
    assert.equal(node(store.getSnapshot(), 'Login.auth').data.far, true);
    store.dragStarted('Login.auth');
    store.nodesChanged([position('Login.auth', 600, 0, true)]);
    store.moved({ x: 0, y: 0, zoom: 0.5 });
    const snapshot = store.getSnapshot();
    assert.equal(snapshot.far, false);
    assert.deepEqual(at(snapshot, 'Login.auth'), { x: 600, y: 0 }, 'Crossing 25% during a drag keeps the dragged node where the drag put it.');
    assert.equal(node(snapshot, 'Login.auth').data.far, false);
    assert.equal(node(snapshot, 'Login.auth').dragging, true);
  });

  test('preview draws a step that is no node\'s drag and writes nothing, and null puts the model\'s projection back', async () => {
    const { core, s, store } = await open();
    const { calls } = listen(store);
    store.getSnapshot();
    core.selectionOf(s).set([{ type: 'el', id: 'Login.auth' }]);
    const view = s.model.views.find((v) => v.id === 'v-seq');
    const start = core.sequenceReader.read(lib, s.model, view);
    const next = core.sequenceReader.step(start, [{ id: 'Login.auth', move: { x: 700, y: 0 } }]);
    const model = JSON.stringify(s.model);
    const told = calls.n;
    store.preview(next);
    let snapshot = store.getSnapshot();
    assert.deepEqual(at(snapshot, 'Login.auth'), { x: 700, y: 0 }, 'The store draws the projection it was given.');
    assert.equal(node(snapshot, 'Login.auth').selected, true, 'What is picked is marked in a preview too.');
    assert.equal(calls.n, told + 1, 'A preview tells the subscribers once.');
    assert.equal(JSON.stringify(s.model), model, 'A preview writes nothing.');
    assert.equal(s.history.steps.length, 0);
    store.preview(null);
    snapshot = store.getSnapshot();
    assert.deepEqual(at(snapshot, 'Login.auth'), { x: 520, y: 0 }, 'preview(null) puts the model\'s projection back.');
    assert.equal(calls.n, told + 2);
    // A change of the model takes a preview away: the store shows the model.
    store.preview(next);
    s.history.edit(() => { view.layout['Login.client'].x = 8; return 'Moved Login.client'; });
    assert.deepEqual(at(store.getSnapshot(), 'Login.auth'), { x: 520, y: 0 });
    assert.deepEqual(at(store.getSnapshot(), 'Login.client'), { x: 8, y: 0 });
  });

  test('a marquee picks the things whose rectangle, as the reader lists it, lies inside it', async () => {
    const { core, s, store } = await open();
    store.getSnapshot();
    const sel = core.selectionOf(s);
    store.marquee({ x: -100, y: -100, width: 400, height: 200 });
    assert.deepEqual(plain(sel.items), [{ type: 'el', id: 'Login.client' }], 'Only the head lies inside: the node that stands for no element is left out, and so is the lifeline\'s second node.');
    store.marquee({ x: -100, y: -100, width: 2000, height: 2000 });
    assert.deepEqual(plain(sel.items), [
      { type: 'el', id: 'Login.client' }, { type: 'el', id: 'Login.client.loginSent' }, { type: 'el', id: 'Login.client.loginDone' },
      { type: 'el', id: 'Login.server' }, { type: 'el', id: 'Login.auth' }, { type: 'rel', id: 'm-login' },
    ], 'Everything the reader lists, each once, in the order it lists them: a line with a rectangle of its own among them.');
    store.marquee({ x: 10, y: 110, width: 300, height: 30 });
    assert.deepEqual(plain(sel.items), [{ type: 'rel', id: 'm-login' }], 'A line is picked by its own rectangle, with neither of its ends.');
    store.marquee({ x: 900, y: 900, width: 10, height: 10 });
    assert.deepEqual(plain(sel.items), [{ type: 'view', id: 'v-seq' }], 'A marquee that covers nothing picks the view.');
  });

  test('in a view of a graph kind every node React Flow reports still moves, whatever the press named', async () => {
    const { s, store } = await open().then(({ core, s }) => ({ s, store: core.viewStoreOf(s, 'v-all') }));
    listen(store);
    store.getSnapshot();
    store.dragStarted('Client');
    store.nodesChanged([position('Client', 72, 112, true), position('Server', 340, 112, true)]);
    store.nodesChanged([position('Client', 72, 112, false), position('Server', 340, 112, false)]);
    const layout = s.model.views.find((v) => v.id === 'v-all').layout;
    assert.deepEqual([layout.Client.x, layout.Server.x], [72, 340], 'Both boxes were moved, in one step.');
    assert.equal(s.history.steps.length, 1);
  });

  test('the store tells its zoom, and whoever watches it hears a zoom and never a pan', async () => {
    const { store } = await open();
    assert.equal(store.zoom, 1, 'Before any camera the zoom is 1.');
    let heard = 0;
    const stop = store.watchZoom(() => { heard += 1; });
    store.moved({ x: 10, y: 10, zoom: 0.5 });
    assert.deepEqual([store.zoom, heard], [0.5, 1]);
    store.moved({ x: 90, y: -40, zoom: 0.5 });
    assert.equal(heard, 1, 'A pan is no change of the zoom.');
    store.fit(800, 600);
    assert.equal(heard, 2, 'A fit that changes the zoom is heard.');
    assert.equal(store.zoom, store.camera(800, 600).zoom);
    stop();
    store.moved({ x: 0, y: 0, zoom: 2 });
    assert.equal(heard, 2, 'A watcher that stopped is not told.');
  });

  test('the store of a view whose body is a component draws nothing and asks its reader nothing', async () => {
    const core = await loadCoreWith({ 'core/readers/grid': STAND_IN_ROWS_READER }, 'plane/viewStore');
    const s = sessionOf(core, path.join(FIXTURES, 'grid.json'));
    assert.equal(core.hasReader(lib, 'GridView'), true);
    assert.equal(core.graphBodied('grid'), false, 'A grid view has a component body: no plane draws it.');
    const store = core.viewStoreOf(s, 'v-table');
    assert.equal(store.drawn, true, 'A body draws the view.');
    const stop = store.subscribe(() => {});
    const snapshot = store.getSnapshot();
    assert.deepEqual([snapshot.nodes.length, snapshot.edges.length], [0, 0], 'Its store has the empty snapshot: a reader of a component body gives no projection.');
    store.marquee({ x: 0, y: 0, width: 100, height: 100 });
    store.moved({ x: 0, y: 0, zoom: 0.1 });
    assert.equal(core.GRID_ASKED.read, 0, 'The store never asks a component body\'s reader.');
    stop();
  });
});
