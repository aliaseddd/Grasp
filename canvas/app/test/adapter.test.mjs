// The adapter: canvas/app/src/core/adapter.ts, which turns one view of a saved model into the nodes and edges a plane
// hands React Flow. Written before the adapter was built, from its contract (the types, the constants and the comments
// of that file), from plan/notes.md ("Step 6: the outline, part 1, the adapter") and from the old page's rules, which
// the adapter ports (canvas/src/core/page/layout.js and drawing.js, and the slices' page.js files).
//
// The tests run over the example, the nine fixtures, the blank model and the 5,000-element model of
// canvas/test/scale-model.mjs. The old page's own layout of the eleven graph views is in old-layout.json, and given
// OLD_LOOK the adapter must give it back. Every expected value here comes from the contract, a fixture or the old
// page's rule, worked out by hand; where a test names a rule, the comment says where the old page has it.
//
// The model library runs in another realm than this file: its objects are compared as JSON (plain). What the adapter
// returns belongs to this realm.

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { scaleState } from '../../test/scale-model.mjs';
import { ROOT, lib, loadCore, plain, readJSON, stateFiles } from './core.mjs';
import { OLD_LAYOUT, layoutHash } from './old-layout.mjs';

const core = await loadCore();
const {
  project, route, fit, isDrawn, notDrawnText, markerId,
  LOOK, OLD_LOOK, MIN_ZOOM, FIT_PAD, FIT_BAND, BOX_SHAPES, BORDER_SHAPES, SHAPES, HANDLES,
} = core;

// ---- What the tests open.

/** The example and the nine fixtures: { name, model }, the model read through the library's normalize. */
const FILES = stateFiles().map(({ name, file }) => ({ name, model: lib.normalize(readJSON(file).model) }));
const fileNamed = (name) => FILES.find((file) => file.name === name).model;
const EXAMPLE_MODEL = fileNamed('stronghold-proof.json');
const isGraph = (view) => lib.VIEW_KINDS[view.kind]?.renderer === 'graph';
const viewOf = (model, id) => model.views.find((view) => view.id === id);
/** Every graph view of the ten files: { label, model, view }. */
const GRAPH_VIEWS = FILES.flatMap(({ name, model }) => model.views.filter(isGraph).map((view) => ({ label: `${name}, ${view.id}`, model, view })));
const OTHER_VIEWS = FILES.flatMap(({ name, model }) => model.views.filter((view) => !isGraph(view)).map((view) => ({ label: `${name}, ${view.id}`, model, view })));

let scale = null;
/** The 5,000-element model, once, and its graph views in the model's order. */
function scaleModel() {
  scale ??= lib.normalize(scaleState(5000).model);
  return { model: scale, views: Array.from(scale.views).filter(isGraph) };
}

/** A model made by hand, with one general view: { model, view }. */
function hand(elements, relationships, layout) {
  const model = lib.normalize({
    format: lib.FORMAT,
    package: { name: 'Hand', doc: '' },
    elements,
    relationships,
    views: [{ id: 'v', kind: 'GeneralView', name: 'v', layout }],
  });
  return { model, view: model.views[0] };
}

const idsOf = (model) => new Map(model.elements.map((el) => [el.id, el]));
const nodesById = (projection) => new Map(projection.nodes.map((node) => [node.id, node]));
const wordsOf = (node) => String(node.className).split(/\s+/).filter(Boolean);
/** What the placed elements of a view are: the keys of its layout that name an element. */
const shownIn = (view, ids) => new Set(Object.keys(view.layout).filter((id) => ids.has(id)));
/** Compares as JSON, so that an array or an object made in the library's realm equals one of this realm. */
const same = (actual, expected, message) => assert.deepEqual(plain(actual), plain(expected), message);
const near = (actual, expected, tolerance, message) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message} (${actual} is not within ${tolerance} of ${expected}).`);
};
const nearPoint = (actual, expected, tolerance, message) => {
  near(actual.x, expected.x, tolerance, `${message}, x`);
  near(actual.y, expected.y, tolerance, `${message}, y`);
};
const rectOf = (projection, id) => ({ ...projection.rects.get(id) });
/** A line's end, as route() takes it: the rectangle in `rects`, and whether the end is a border item. */
const endOf = (projection, id, border) => ({ ...projection.rects.get(id), border });
/** The lines of a projection as the fixture holds them: { id, points: [[x, y], ...] }, routed by route(). */
function linesOf(projection, look) {
  return projection.edges.map((edge) => ({
    id: edge.id,
    points: route(edge.data.route, endOf(projection, edge.source, edge.data.sourceBorder), endOf(projection, edge.target, edge.data.targetBorder), look).points.map((p) => [p.x, p.y]),
  }));
}

describe('the adapter: one view of a model as the nodes and edges of a plane', () => {
  test('parents come first, and a box\'s parent is its nearest owner that the view shows', () => {
    const check = (label, model, view, projection) => {
      const ids = idsOf(model);
      const shown = shownIn(view, ids);
      const at = new Map(projection.nodes.map((node, i) => [node.id, i]));
      for (const node of projection.nodes) {
        let owner = ids.get(node.id).owner;
        while (owner !== undefined && !shown.has(owner)) owner = ids.get(owner)?.owner;
        assert.equal(node.parentId, owner, `${label}: the parent of ${node.id} should be ${owner === undefined ? 'none' : owner}, the nearest owner the view places, not ${node.parentId}.`);
        if (owner !== undefined) assert.ok(at.get(owner) < at.get(node.id), `${label}: ${node.id} comes before its parent ${owner}, and a parent must come first.`);
      }
    };
    for (const { label, model, view } of GRAPH_VIEWS) check(label, model, view, project(lib, model, view));
    const { model, views } = scaleModel();
    for (const view of views) check(`the 5,000-element model, ${view.id}`, model, view, project(lib, model, view));

    // The order of Projection.nodes, on the example: a box, then the boxes inside it each with its own, at each level in
    // the model's order, which here is also the order of the elements.
    const example = project(lib, EXAMPLE_MODEL, EXAMPLE_MODEL.views[0]);
    same(example.nodes.map((node) => node.id), [
      'Page', 'Page.hosts', 'Page.hosts.api', 'Page.app', 'Page.app.api', 'Host', 'Host.api', 'App', 'App.api',
      'StrongholdApp', 'ServerHost', 'OnlineHost', 'DevHost',
    ], 'The example\'s nodes should come in the order of its elements: each box, the boxes inside it, then its own border items.');

    // The same rule where it tells from the model's order. A.b is not placed, so A.b.c sits in A; A's port is listed
    // before its parts but comes after them; the ground's boxes and A's parts go by the model's order, not the layout's.
    const { model: nested, view: nestedView } = hand(
      [
        { id: 'A', kind: 'PartDefinition', name: 'A' },
        { id: 'A.pp', kind: 'PortUsage', name: 'pp', owner: 'A' },
        { id: 'A.b', kind: 'PartUsage', name: 'b', owner: 'A' },
        { id: 'A.b.c', kind: 'PartUsage', name: 'c', owner: 'A.b' },
        { id: 'A.x', kind: 'PartUsage', name: 'x', owner: 'A' },
        { id: 'B', kind: 'PartDefinition', name: 'B' },
      ],
      [],
      {
        B: { x: 700, y: 0, w: 100, h: 50 },
        'A.b.c': { x: 10, y: 60 },
        'A.pp': { side: 'left', at: 0.3 },
        'A.x': { x: 150, y: 60 },
        A: { x: 0, y: 0, w: 300, h: 200 },
      },
    );
    const projected = project(lib, nested, nestedView);
    same(projected.nodes.map((node) => node.id), ['A', 'A.b.c', 'A.x', 'A.pp', 'B'],
      'A box should come first, then the boxes inside it (the model\'s order, whatever the layout\'s), then its border items, then the next box of the ground.');
    same(projected.nodes.map((node) => node.parentId), [undefined, 'A', 'A', 'A', undefined],
      'A.b.c, whose owner A.b the view does not place, should sit in A, its nearest owner the view shows.');
  });

  test('every placed element is a node and every drawn line an edge, and no other', () => {
    for (const { label, model, view } of GRAPH_VIEWS) {
      const projection = project(lib, model, view);
      const ids = idsOf(model);
      const placed = [...shownIn(view, ids)];
      const nodeIds = projection.nodes.map((node) => node.id);
      assert.equal(new Set(nodeIds).size, nodeIds.length, `${label}: an element should be one node, not several.`);
      assert.deepEqual([...nodeIds].sort(), [...placed].sort(), `${label}: the nodes should be exactly the elements the view's layout places.`);
      assert.equal(projection.view, view.id, `${label}: the projection should name its view.`);
      assert.equal(projection.far, false, `${label}: a projection is near unless it is asked to be far.`);
      for (const node of projection.nodes) {
        const row = lib.KINDS[ids.get(node.id).kind];
        const type = SHAPES.includes(row.shape) ? row.shape : row.onBorder ? 'port' : 'rect';
        assert.equal(node.type, type, `${label}: the type of ${node.id} should be its kind's shape, ${type}.`);
        const form = BOX_SHAPES.includes(type) ? 'box' : BORDER_SHAPES.includes(type) ? 'border' : 'small';
        assert.equal(node.data.form, form, `${label}: the data of ${node.id} should be that of a ${form}.`);
        assert.deepEqual(node.handles, HANDLES, `${label}: ${node.id} should carry the two handles, so that React Flow draws lines to it unmounted.`);
      }
      const placedSet = new Set(placed);
      const lines = Array.from(model.relationships).filter((rel) => !rel.hidden && placedSet.has(rel.from) && placedSet.has(rel.to));
      same(projection.edges.map((edge) => edge.id), lines.map((rel) => rel.id), `${label}: the edges should be the relationships that are not hidden and have both ends placed, in the model's order.`);
      projection.edges.forEach((edge, i) => {
        assert.equal(edge.source, lines[i].from, `${label}: the source of ${edge.id} should be the relationship's from.`);
        assert.equal(edge.target, lines[i].to, `${label}: the target of ${edge.id} should be the relationship's to.`);
        assert.equal(edge.type, 'line', `${label}: ${edge.id} should be drawn by the line edge.`);
      });
    }
    // The example hides the typings of its ports and keeps the line of every other relationship; the interconnection
    // view places only some of its relationships' ends.
    const example = project(lib, EXAMPLE_MODEL, EXAMPLE_MODEL.views[0]);
    same(example.edges.map((edge) => edge.id), ['t-hosts', 't-app', 's-ServerHost', 's-OnlineHost', 's-DevHost', 'mount'], 'A hidden relationship should be no edge.');
    const defs = viewOf(fileNamed('interconnection.json'), 'v-defs');
    same(project(lib, fileNamed('interconnection.json'), defs).edges, [], 'A relationship with an end the view does not place should be no edge.');
  });

  test('a box holds what is inside it', () => {
    for (const look of [LOOK, OLD_LOOK]) {
      for (const { label: name, model, view } of GRAPH_VIEWS) {
        const label = `${name}, ${look === LOOK ? 'the new measures' : 'the old measures'}`;
        const projection = project(lib, model, view, { look });
        const kids = new Map();
        for (const node of projection.nodes) {
          if (node.parentId !== undefined && !BORDER_SHAPES.includes(node.type)) kids.set(node.parentId, [...(kids.get(node.parentId) ?? []), node]);
        }
        for (const node of projection.nodes) {
          if (BORDER_SHAPES.includes(node.type)) continue;
          const lay = view.layout[node.id];
          const rect = projection.rects.get(node.id);
          assert.ok(Number.isInteger(node.width) && Number.isInteger(node.height), `${label}: the size of ${node.id} should be whole numbers, not ${node.width} by ${node.height}.`);
          assert.deepEqual(node.measured, { width: node.width, height: node.height }, `${label}: measured of ${node.id} should repeat its width and height.`);
          assert.deepEqual([rect.w, rect.h], [node.width, node.height], `${label}: the rectangle of ${node.id} should be the node's size.`);
          assert.deepEqual(node.position, { x: lay.x, y: lay.y }, `${label}: the position of ${node.id} should be its saved x, y.`);
          // graphLayout's size(): the saved size, or the header and compartments, or what holds every box inside it.
          const compartments = node.data.compartments ?? [];
          const own = (BOX_SHAPES.includes(node.type) ? look.header : 0)
            + compartments.reduce((sum, c) => sum + look.head + look.lead * c.lines.length + look.tail, 0);
          const inside = kids.get(node.id) ?? [];
          const height = Math.max(lay.h, own, ...inside.map((kid) => view.layout[kid.id].y + kid.height + look.pad));
          const width = Math.max(lay.w, ...inside.map((kid) => view.layout[kid.id].x + kid.width + look.pad));
          assert.equal(node.height, height, `${label}: ${node.id} should be ${height} high: its saved height, its header and compartments, and room for what is inside it.`);
          assert.equal(node.width, width, `${label}: ${node.id} should be ${width} wide: its saved width, and room for what is inside it.`);
          if (BOX_SHAPES.includes(node.type)) assert.ok(node.height >= own, `${label}: ${node.id} should be at least ${own} high for its header and compartments.`);
          if (node.parentId !== undefined) {
            const parent = projection.rects.get(node.parentId);
            assert.ok(rect.x + rect.w + look.pad <= parent.x + parent.w + 1e-9, `${label}: ${node.id} should lie inside ${node.parentId} with ${look.pad} to spare at the right.`);
            assert.ok(rect.y + rect.h + look.pad <= parent.y + parent.h + 1e-9, `${label}: ${node.id} should lie inside ${node.parentId} with ${look.pad} to spare at the bottom.`);
            near(rect.x, parent.x + lay.x, 1e-9, `${label}: ${node.id} should lie at its saved x from its parent's corner`);
            near(rect.y, parent.y + lay.y, 1e-9, `${label}: ${node.id} should lie at its saved y from its parent's corner`);
          } else {
            assert.deepEqual([rect.x, rect.y], [lay.x, lay.y], `${label}: a box at ground level should lie at its saved x, y from the view's origin.`);
          }
        }
      }
    }
  });

  test('a port lies on its owner\'s border', () => {
    for (const look of [LOOK, OLD_LOOK]) {
      for (const { label: name, model, view } of GRAPH_VIEWS) {
        const label = `${name}, ${look === LOOK ? 'the new measures' : 'the old measures'}`;
        const projection = project(lib, model, view, { look });
        let seen = 0;
        for (const node of projection.nodes) {
          if (!BORDER_SHAPES.includes(node.type)) continue;
          seen += 1;
          const place = view.layout[node.id];
          const owner = projection.rects.get(node.parentId);
          const square = projection.rects.get(node.id);
          assert.ok(owner, `${label}: ${node.id} should be a child of its owner.`);
          // The centre of the square is on the owner's border: its side, `at` of the way along it.
          const centre = { x: square.x + square.w / 2, y: square.y + square.h / 2 };
          const want = {
            top: { x: owner.x + place.at * owner.w, y: owner.y },
            bottom: { x: owner.x + place.at * owner.w, y: owner.y + owner.h },
            left: { x: owner.x, y: owner.y + place.at * owner.h },
            right: { x: owner.x + owner.w, y: owner.y + place.at * owner.h },
          }[place.side];
          nearPoint(centre, want, 1e-6, `${label}: the centre of ${node.id} should lie on the ${place.side} side of ${node.parentId}, ${place.at} along it`);
          assert.deepEqual([square.w, square.h], [look.port, look.port], `${label}: ${node.id} should be a square ${look.port} a side.`);
          assert.deepEqual([node.width, node.height], [look.port, look.port], `${label}: the node ${node.id} should be ${look.port} a side.`);
          assert.deepEqual(node.measured, { width: look.port, height: look.port }, `${label}: measured of ${node.id} should repeat its size.`);
          nearPoint(node.position, { x: square.x - owner.x, y: square.y - owner.y }, 1e-6, `${label}: the position of ${node.id} should be its square's corner from its owner's corner`);
          assert.equal(node.data.side, place.side, `${label}: ${node.id} should say which side it is on.`);
        }
        if (name === 'stronghold-proof.json') assert.equal(seen, 4, 'The example has four ports.');
      }
    }
  });

  test('given the old page\'s measures, the rectangles and the lines\' points of the eleven views are the old page\'s', () => {
    const old = readJSON(OLD_LAYOUT);
    const views = old.files.flatMap((file) => file.views.map((view) => ({ file: file.file, view })));
    assert.equal(views.length, 11, 'The fixture should hold the eleven graph views of the example and the nine fixtures.');
    assert.equal(views.reduce((sum, { view }) => sum + Object.keys(view.rects).length, 0), 153, 'The fixture should hold 153 rectangles.');
    assert.equal(views.reduce((sum, { view }) => sum + view.lines.length, 0), 58, 'The fixture should hold 58 lines.');
    for (const { file, view: want } of views) {
      const label = `${file}, ${want.id}`;
      const model = fileNamed(file);
      const projection = project(lib, model, viewOf(model, want.id), { look: OLD_LOOK });
      assert.deepEqual([...projection.rects.keys()].sort(), Object.keys(want.rects).sort(), `${label}: the rectangles should be those of the old page's elements.`);
      for (const [id, r] of Object.entries(want.rects)) {
        const got = projection.rects.get(id);
        for (const key of ['x', 'y', 'w', 'h']) near(got[key], r[key], 1e-6, `${label}: ${key} of the rectangle of ${id} should be the old page's`);
      }
      same(projection.edges.map((edge) => edge.id), want.lines.map((line) => line.id), `${label}: the lines should be the old page's, in its order.`);
      projection.edges.forEach((edge, i) => {
        const line = want.lines[i];
        const got = route(edge.data.route, endOf(projection, edge.source, edge.data.sourceBorder), endOf(projection, edge.target, edge.data.targetBorder), OLD_LOOK);
        assert.equal(got.points.length, line.points.length, `${label}: the line ${edge.id} should have ${line.points.length} points.`);
        got.points.forEach((p, j) => nearPoint(p, { x: line.points[j][0], y: line.points[j][1] }, 1e-6, `${label}: point ${j} of the line ${edge.id} should be the old page's`));
        nearPoint(got.mid, { x: line.mid[0], y: line.mid[1] }, 1e-6, `${label}: the middle of the line ${edge.id} should be the old page's`);
      });
    }
  });

  test('given the old page\'s measures, the 5,000-element model\'s three views hash to the old page\'s', () => {
    const old = readJSON(OLD_LAYOUT).scale;
    const { model, views } = scaleModel();
    assert.equal(old.elements, 5000, 'The fixture should be for 5,000 elements.');
    assert.deepEqual(views.map((view) => view.id), old.views.map((view) => view.id), 'The model\'s graph views should be those of the fixture, in its order.');
    views.forEach((view, i) => {
      const projection = project(lib, model, view, { look: OLD_LOOK });
      const want = old.views[i];
      assert.equal(projection.rects.size, want.rects, `${view.id}: the view should have ${want.rects} rectangles.`);
      assert.equal(projection.edges.length, want.lines, `${view.id}: the view should have ${want.lines} lines.`);
      assert.equal(layoutHash(projection.rects, linesOf(projection, OLD_LOOK)), want.sha256, `${view.id}: the layout should hash to the old page's.`);
    });
  });

  test('with the new measures a compartment\'s rows are 15 apart under a title row of 16', () => {
    assert.equal(LOOK.head, 16, 'The new title row is 16 high.');
    assert.equal(LOOK.lead, 15, 'The new rows are 15 apart, as the old page\'s.');
    assert.equal(OLD_LOOK.head, 18, 'The old title row was 18 high.');
    assert.equal(OLD_LOOK.lead, 15, 'The old rows were 15 apart.');
    const view = EXAMPLE_MODEL.views[0];
    const projection = project(lib, EXAMPLE_MODEL, view);
    assert.deepEqual(plain(projection.look), plain(LOOK), 'A projection should keep the look it was made with, the new one by default.');
    const nodes = nodesById(projection);
    // Host: 40 for the header, and its doc, 5 rows: a title row of 16, 5 rows of 15, 6 below.
    assert.deepEqual([nodes.get('Host').width, nodes.get('Host').height], [368, 40 + 16 + 5 * 15 + 6], 'Host should be 368 by 137.');
    assert.equal(nodes.get('Host').height, 137, 'Host should be 137 high.');
    // Page: its doc ends at 107, and what it holds needs 226, under its saved 250.
    assert.deepEqual([nodes.get('Page').width, nodes.get('Page').height], [760, 250], 'Page should keep its saved 760 by 250.');
    // A box with neither compartment nor box inside it keeps its saved size; a port inside it makes no room.
    assert.deepEqual([nodes.get('Page.app').width, nodes.get('Page.app').height], [180, 110], 'Page.app has no doc and no box inside it, so it should keep its saved 180 by 110.');
    assert.deepEqual([nodes.get('StrongholdApp').width, nodes.get('StrongholdApp').height], [368, 100], 'StrongholdApp should keep its saved size: its doc is two rows, and ends at 92.');
    // The old measures give the old page's 139: 40 + 18 + 5 * 15 + 6.
    const old = project(lib, EXAMPLE_MODEL, view, { look: OLD_LOOK });
    assert.equal(nodesById(old).get('Host').height, 139, 'Given the old measures Host should be 139 high.');
    assert.deepEqual(plain(old.look), plain(OLD_LOOK), 'A projection should keep the look it was given.');
  });

  test('the same reading is the same object', () => {
    const view = EXAMPLE_MODEL.views[0];
    const p = project(lib, EXAMPLE_MODEL, view);
    assert.equal(project(lib, EXAMPLE_MODEL, view, { previous: p }), p, 'An unchanged model should project to the previous projection itself.');
    const copy = lib.normalize(readJSON(stateFiles()[0].file).model);
    assert.equal(project(lib, copy, copy.views[0], { previous: p }), p, 'A model equal by value, read again, should project to the previous projection itself.');
    const again = project(lib, EXAMPLE_MODEL, view);
    assert.notEqual(again, p, 'Without a previous projection the result should be a new object.');
    assert.deepStrictEqual(again, p, 'Without a previous projection the result should still be equal by value.');
    const far = project(lib, EXAMPLE_MODEL, view, { far: true, previous: p });
    assert.notEqual(far, p, 'Another far should give another projection.');
    assert.equal(far.far, true, 'A far projection should say so.');
    const other = project(lib, EXAMPLE_MODEL, view, { look: OLD_LOOK, previous: p });
    assert.notEqual(other, p, 'Another look should give another projection.');
    assert.deepEqual(plain(other.look), plain(OLD_LOOK), 'The projection should have the look it was given.');
    const back = project(lib, EXAMPLE_MODEL, view, { previous: other });
    assert.notEqual(back, other, 'A projection made with the default look should not be returned for one made with another.');
    assert.deepStrictEqual(back, p, 'A projection read again should equal the first.');
  });

  test('a changed element renews its own node and the nodes that name it, and keeps what React Flow set', () => {
    const file = readJSON(stateFiles()[0].file);
    file.model.elements.find((el) => el.id === 'Host').name = 'Hostess';
    const changed = lib.normalize(file.model);
    const p = project(lib, EXAMPLE_MODEL, EXAMPLE_MODEL.views[0]);
    const before = nodesById(p);
    // React Flow has selected Host, which it is dragging, and selected App.
    const marked = {
      ...p,
      nodes: p.nodes.map((node) => (node.id === 'Host' ? { ...node, selected: true, dragging: true } : node.id === 'App' ? { ...node, selected: true } : node)),
    };
    const was = nodesById(marked);
    const q = project(lib, changed, changed.views[0], { previous: marked });
    const now = nodesById(q);
    assert.notEqual(q, marked, 'A changed model should not project to the previous projection.');
    assert.deepEqual([...now.keys()], [...before.keys()], 'The nodes should be the same, in the same order.');
    // Host's own node, and hosts : Host [1..*], which names it.
    assert.notEqual(now.get('Host'), was.get('Host'), 'The renamed definition should have a new node object.');
    assert.equal(now.get('Host').data.name, 'Hostess', 'The renamed definition\'s node should say its new name.');
    assert.notEqual(now.get('Page.hosts'), was.get('Page.hosts'), 'The usage typed by the renamed definition should have a new node object.');
    assert.equal(now.get('Page.hosts').data.name, 'hosts : Hostess [1..*]', 'The usage typed by the renamed definition should say its new name.');
    // What React Flow set stays on a renewed node.
    assert.equal(now.get('Host').selected, true, 'A renewed node should keep selected.');
    assert.equal(now.get('Host').dragging, true, 'A renewed node should keep dragging.');
    // Every other node is the very object it was, and so is every edge.
    for (const [id, node] of now) {
      if (id === 'Host' || id === 'Page.hosts') continue;
      assert.equal(node, was.get(id), `The node of ${id} reads the same, so it should be the object it was.`);
    }
    assert.equal(now.get('App').selected, true, 'An unchanged node that was selected should be returned as it was, selected.');
    assert.equal(q.edges.length, p.edges.length, 'The edges should be the same.');
    q.edges.forEach((edge, i) => assert.equal(edge, p.edges[i], `The edge ${edge.id} reads the same, so it should be the object it was.`));
  });

  // Step 7's drag changes a place at every step: the box's component, memoized on `data`, must not render for it.
  test('a box that only moved is a new node with the data object it had', () => {
    const file = readJSON(stateFiles()[0].file);
    file.model.views[0].layout.StrongholdApp.x += 20;
    const moved = lib.normalize(file.model);
    const p = project(lib, EXAMPLE_MODEL, EXAMPLE_MODEL.views[0]);
    const q = project(lib, moved, moved.views[0], { previous: p });
    const was = nodesById(p);
    const now = nodesById(q);
    assert.notEqual(now.get('StrongholdApp'), was.get('StrongholdApp'), 'A moved box should have a new node object.');
    assert.equal(now.get('StrongholdApp').position.x, was.get('StrongholdApp').position.x + 20, 'The new node should be at the new place.');
    assert.equal(now.get('StrongholdApp').data, was.get('StrongholdApp').data,
      'A box that only moved says what it said: its data should be the very object it was, so that its component does not render again.');
    for (const [id, node] of now) {
      if (id !== 'StrongholdApp') assert.equal(node, was.get(id), `The node of ${id} did not move, so it should be the object it was.`);
    }
  });

  test('a changed line is a new edge that keeps what React Flow set', () => {
    const file = readJSON(stateFiles()[0].file);
    file.model.relationships.find((rel) => rel.id === 'mount').name = 'mounts';
    const changed = lib.normalize(file.model);
    const p = project(lib, EXAMPLE_MODEL, EXAMPLE_MODEL.views[0]);
    // React Flow has selected the line mount.
    const marked = { ...p, edges: p.edges.map((edge) => (edge.id === 'mount' ? { ...edge, selected: true } : edge)) };
    const was = new Map(marked.edges.map((edge) => [edge.id, edge]));
    const q = project(lib, changed, changed.views[0], { previous: marked });
    const mount = q.edges.find((edge) => edge.id === 'mount');
    assert.notEqual(mount, was.get('mount'), 'The renamed line should have a new edge object.');
    assert.equal(mount.data.label, 'mounts', 'The renamed line should say its new name.');
    assert.equal(mount.selected, true, 'A renewed edge should keep selected.');
    for (const edge of q.edges) {
      if (edge.id !== 'mount') assert.equal(edge, was.get(edge.id), `The line ${edge.id} reads the same, so it should be the object it was.`);
    }
    q.nodes.forEach((node, i) => assert.equal(node, p.nodes[i], `The node of ${node.id} reads the same, so it should be the object it was.`));
  });

  // graphLayout wraps a compartment to the box's saved width (layout.js 70), though the box is drawn at its grown one.
  test('a box grown past its saved width still wraps its rows to the saved width', () => {
    const doc = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty';
    const { model, view } = hand(
      [{ id: 'W', kind: 'PartDefinition', name: 'W', doc }, { id: 'W.p', kind: 'PartUsage', name: 'p', owner: 'W' }],
      [],
      { W: { x: 0, y: 0, w: 220, h: 72 }, 'W.p': { x: 300, y: 160, w: 180, h: 60 } },
    );
    const box = nodesById(project(lib, model, view)).get('W');
    assert.equal(box.width, 300 + 180 + LOOK.pad, 'The box should grow to hold the part at x 300, 180 wide, with the pad to spare.');
    const chars = Math.floor((220 - 2 * LOOK.pad) / LOOK.docChar);
    const rows = box.data.compartments[0].lines;
    assert.equal(rows.join(' '), doc, 'The rows should hold the doc, word for word.');
    rows.forEach((row, i) => {
      assert.ok(row.length <= chars, `Row ${i + 1}, "${row}", has ${row.length} characters; the saved width of 220 holds ${chars}.`);
      if (i + 1 < rows.length) {
        assert.ok(`${row} ${rows[i + 1].split(' ')[0]}`.length > chars, `Row ${i + 1}, "${row}", should have taken the next word: the rows are wrapped to ${chars} characters, the saved width's count.`);
      }
    });
  });

  test('far leaves the words out and keeps the sizes', () => {
    const files = [
      ['stronghold-proof.json', 'v-proof'], ['behavior-actions.json', 'v-release'], ['behavior-states.json', 'v-host'],
      ['interconnection.json', 'v-ic'], ['sequence.json', 'v-all'], ['annotations.json', 'v-proof'],
    ];
    let labels = 0;
    const forms = new Set();
    for (const [name, id] of files) {
      const model = fileNamed(name);
      const view = viewOf(model, id);
      const label = `${name}, ${id}`;
      const full = project(lib, model, view);
      const far = project(lib, model, view, { far: true });
      assert.equal(far.far, true, `${label}: a far projection should say so.`);
      same(far.nodes.map((node) => node.id), full.nodes.map((node) => node.id), `${label}: far should keep the nodes and their order.`);
      far.nodes.forEach((node, i) => {
        const was = full.nodes[i];
        forms.add(node.data.form);
        assert.ok(wordsOf(node).includes('far'), `${label}: the className of ${node.id} should have the word far.`);
        assert.ok(!wordsOf(was).includes('far'), `${label}: a near node should not have the word far.`);
        assert.deepEqual(wordsOf(node).filter((word) => word !== 'far').sort(), wordsOf(was).sort(), `${label}: far should add only the word far to the className of ${node.id}.`);
        assert.equal(node.data.far, true, `${label}: the data of ${node.id} should say it is far.`);
        assert.deepEqual(node.position, was.position, `${label}: far should keep the position of ${node.id}.`);
        assert.deepEqual([node.width, node.height, node.measured, node.parentId], [was.width, was.height, was.measured, was.parentId], `${label}: far should keep the size and the parent of ${node.id}.`);
        if (node.data.form === 'box') {
          same([node.data.keyword, node.data.name, node.data.compartments, node.data.glyph], ['', '', [], null], `${label}: a far box (${node.id}) should leave out its keyword, name, compartments and glyph.`);
          assert.deepEqual(node.data.least, was.data.least, `${label}: far should keep the least size of ${node.id}.`);
        } else if (node.data.form === 'border') {
          assert.deepEqual([node.data.name, node.data.glyph], ['', null], `${label}: a far border item (${node.id}) should leave out its name and glyph.`);
          assert.equal(node.data.side, was.data.side, `${label}: far should keep the side of ${node.id}.`);
        } else {
          assert.equal(node.data.name, '', `${label}: a far small node (${node.id}) should leave out its name.`);
        }
      });
      assert.deepEqual(far.rects, full.rects, `${label}: far should keep every rectangle.`);
      assert.deepEqual(far.bounds, full.bounds, `${label}: far should keep the bounds.`);
      same(far.edges.map((edge) => edge.id), full.edges.map((edge) => edge.id), `${label}: far should keep the edges.`);
      far.edges.forEach((edge, i) => {
        const was = full.edges[i];
        if (was.data.label !== '') labels += 1;
        assert.equal(edge.data.label, '', `${label}: a far edge (${edge.id}) should leave out its label.`);
        assert.equal(edge.data.far, true, `${label}: the data of ${edge.id} should say it is far.`);
        assert.deepEqual({ ...edge.data, label: '', far: false }, { ...was.data, label: '', far: false }, `${label}: far should keep all else of the data of ${edge.id}.`);
      });
    }
    assert.ok(labels > 0, 'Some edge of these views should have a label, or the test shows nothing.');
    assert.deepEqual([...forms].sort(), ['border', 'box', 'small'], 'These views should show a box, a border item and a small node.');
  });

  test('a line\'s route: straight, each elbow, a port\'s end, the middle', () => {
    const box = (x, y, w, h) => ({ x, y, w, h, border: false });
    const square = (x, y) => ({ x, y, w: 16, h: 16, border: true });
    const points = (got, want, label) => {
      assert.equal(got.points.length, want.length, `${label}: the line should have ${want.length} points, not ${got.points.length}.`);
      got.points.forEach((p, i) => nearPoint(p, { x: want[i][0], y: want[i][1] }, 1e-9, `${label}: point ${i}`));
    };
    const onBorder = (p, r, label) => {
      const inside = p.x >= r.x - 1e-9 && p.x <= r.x + r.w + 1e-9 && p.y >= r.y - 1e-9 && p.y <= r.y + r.h + 1e-9;
      const edge = [r.x, r.x + r.w].some((x) => Math.abs(p.x - x) < 1e-9) || [r.y, r.y + r.h].some((y) => Math.abs(p.y - y) < 1e-9);
      assert.ok(inside && edge, `${label}: the end (${p.x}, ${p.y}) should lie on the border of its rectangle.`);
    };

    // Straight, side by side: each end where the ray between the centres leaves its rectangle.
    const left = box(0, 0, 100, 50);
    let got = route('straight', left, box(300, 0, 100, 50));
    points(got, [[100, 25], [300, 25]], 'straight, side by side');
    nearPoint(got.mid, { x: 200, y: 25 }, 1e-9, 'straight, side by side: the middle');
    // Straight, on a diagonal: centres (50, 25) and (350, 250); a leaves through its bottom, b through its left.
    const far = box(300, 200, 100, 100);
    got = route('straight', left, far);
    points(got, [[250 / 3, 50], [300, 212.5]], 'straight, on a diagonal');
    nearPoint(got.mid, { x: 575 / 3, y: 131.25 }, 1e-9, 'straight, on a diagonal: the middle');
    onBorder(got.points[0], left, 'straight, on a diagonal, from');
    onBorder(got.points[1], far, 'straight, on a diagonal, to');
    const cross = (got.points[0].x - 50) * (250 - 25) - (got.points[0].y - 25) * (350 - 50);
    assert.ok(Math.abs(cross) < 1e-6, 'The ends of a straight line should lie on the line between the centres.');
    // Straight, one centre: each end at the top centre of its box.
    got = route('straight', box(0, 0, 100, 50), box(25, 10, 50, 30));
    points(got, [[50, 0], [50, 10]], 'straight, two boxes with one centre');
    nearPoint(got.mid, { x: 50, y: 5 }, 1e-9, 'straight, two boxes with one centre: the middle');

    // A border item's end: port / 2 + 1 out from the centre of its square, toward the other end.
    got = route('straight', square(92, 17), box(300, 0, 100, 50));
    points(got, [[109, 25], [300, 25]], 'straight, from a border item');
    got = route('straight', box(300, 0, 100, 50), square(92, 17));
    points(got, [[300, 25], [109, 25]], 'straight, to a border item');
    got = route('straight', square(92, 17), square(292, 17));
    points(got, [[109, 25], [291, 25]], 'straight, between two border items');
    nearPoint(got.mid, { x: 200, y: 25 }, 1e-9, 'straight, between two border items: the middle');
    got = route('straight', square(92, 17), square(292, 17), { ...LOOK, port: 20 });
    points(got, [[111, 25], [289, 25]], 'straight, between two border items, given another port size');
    got = route('straight', square(92, 17), { x: 192, y: 117, w: 16, h: 16, border: true });
    const root2 = Math.SQRT1_2 * 9;
    points(got, [[100 + root2, 25 + root2], [200 - root2, 125 - root2]], 'straight, between two border items on a diagonal');

    // The four elbows, asked in the order above, below, right, left. a is (100, 200, 100, 50): centre (150, 225).
    const a = box(100, 200, 100, 50);
    got = route('elbow', a, box(300, 0, 100, 50));
    points(got, [[150, 200], [150, 125], [350, 125], [350, 50]], 'elbow, b above');
    nearPoint(got.mid, { x: 250, y: 125 }, 1e-9, 'elbow, b above: the middle');
    got = route('elbow', a, box(300, 400, 100, 50));
    points(got, [[150, 250], [150, 325], [350, 325], [350, 400]], 'elbow, b below');
    nearPoint(got.mid, { x: 250, y: 325 }, 1e-9, 'elbow, b below: the middle');
    got = route('elbow', a, box(400, 210, 100, 50));
    points(got, [[200, 225], [300, 225], [300, 235], [400, 235]], 'elbow, b to the right');
    nearPoint(got.mid, { x: 300, y: 230 }, 1e-9, 'elbow, b to the right: the middle');
    got = route('elbow', a, box(-300, 210, 100, 50));
    points(got, [[100, 225], [-50, 225], [-50, 235], [-200, 235]], 'elbow, b to the left');
    nearPoint(got.mid, { x: -50, y: 230 }, 1e-9, 'elbow, b to the left: the middle');
    // Asked in order: a box both above and to the right takes the form for above; below and to the left, below.
    got = route('elbow', a, box(400, 0, 100, 50));
    points(got, [[150, 200], [150, 125], [450, 125], [450, 50]], 'elbow, b above and to the right');
    got = route('elbow', a, box(-300, 400, 100, 50));
    points(got, [[150, 250], [150, 325], [-250, 325], [-250, 400]], 'elbow, b below and to the left');
    got = route('elbow', a, box(400, 400, 100, 50));
    points(got, [[150, 250], [150, 325], [450, 325], [450, 400]], 'elbow, b below and to the right');
    // Touching counts as wholly above: b's bottom is a's top.
    got = route('elbow', a, box(300, 150, 100, 50));
    points(got, [[150, 200], [150, 200], [350, 200], [350, 200]], 'elbow, b touching a from above');
    // Overlapping in both directions: as straight.
    got = route('elbow', a, box(150, 220, 100, 50));
    points(got, [[200, 245], [150, 225]], 'elbow, overlapping boxes drawn straight');
    nearPoint(got.mid, { x: 175, y: 235 }, 1e-9, 'elbow, overlapping boxes drawn straight: the middle');
    assert.deepEqual(plain(route('elbow', a, box(150, 220, 100, 50))), plain(route('straight', a, box(150, 220, 100, 50))), 'An elbow between boxes that overlap should be the straight line.');
  });

  test('an elbow whose ends are no more than `snap` out of line is one straight stroke, at the far end\'s centre', () => {
    const box = (x, y, w, h) => ({ x, y, w, h, border: false });
    const points = (got, want, label) => same(got.points.map((p) => [p.x, p.y]), want, `${label}: the line's points`);
    assert.equal(LOOK.snap, 4, 'The new page joins ends up to 4 out of line.');
    assert.equal(OLD_LOOK.snap, 0, 'The old page has no such rule.');

    // a is (100, 200, 100, 50): centre (150, 225). b's centre is `off` to the side of it.
    const a = box(100, 200, 100, 50);
    const below = (off) => box(100 + off, 400, 100, 50);
    const above = (off) => box(100 + off, 0, 100, 50);
    const right = (off) => box(400, 200 + off, 100, 50);
    const left = (off) => box(-300, 200 + off, 100, 50);
    for (const off of [1, 2, 4, -1, -4]) {
      points(route('elbow', a, below(off)), [[150 + off, 250], [150 + off, 325], [150 + off, 325], [150 + off, 400]], `b below, ${off} out of line`);
      points(route('elbow', a, above(off)), [[150 + off, 200], [150 + off, 125], [150 + off, 125], [150 + off, 50]], `b above, ${off} out of line`);
      points(route('elbow', a, right(off)), [[200, 225 + off], [300, 225 + off], [300, 225 + off], [400, 225 + off]], `b to the right, ${off} out of line`);
      points(route('elbow', a, left(off)), [[100, 225 + off], [-50, 225 + off], [-50, 225 + off], [-200, 225 + off]], `b to the left, ${off} out of line`);
      // The middle, where a label goes, is on the stroke.
      nearPoint(route('elbow', a, below(off)).mid, { x: 150 + off, y: 325 }, 1e-9, `b below, ${off} out of line: the middle`);
      nearPoint(route('elbow', a, right(off)).mid, { x: 300, y: 225 + off }, 1e-9, `b to the right, ${off} out of line: the middle`);
    }
    // One more than `snap`, and the step is drawn, as on the old page.
    for (const off of [5, -5, 4.5]) {
      points(route('elbow', a, below(off)), [[150, 250], [150, 325], [150 + off, 325], [150 + off, 400]], `b below, ${off} out of line`);
      points(route('elbow', a, right(off)), [[200, 225], [300, 225], [300, 225 + off], [400, 225 + off]], `b to the right, ${off} out of line`);
    }
    // In line already: the same either way. Out of line the other way (a box below is not moved sideways for its height).
    points(route('elbow', a, below(0)), [[150, 250], [150, 325], [150, 325], [150, 400]], 'b below, in line');
    points(route('elbow', a, box(300, 402, 100, 50)), [[150, 250], [150, 326], [350, 326], [350, 402]], 'b below and far to the right');
    // Given the old page's measures, or a look of one's own, the rule is that look's.
    points(route('elbow', a, below(2), OLD_LOOK), [[150, 250], [150, 325], [152, 325], [152, 400]], 'b below, 2 out of line, by the old page\'s measures');
    points(route('elbow', a, right(-3), OLD_LOOK), [[200, 225], [300, 225], [300, 222], [400, 222]], 'b to the right, 3 out of line, by the old page\'s measures');
    points(route('elbow', a, below(9), { ...LOOK, snap: 10 }), [[159, 250], [159, 325], [159, 325], [159, 400]], 'b below, 9 out of line, given a snap of 10');
    // A straight line is not an elbow: `snap` leaves it alone.
    same(route('straight', a, below(2)), route('straight', a, below(2), OLD_LOOK), 'A straight line is the same whatever `snap` is.');

    // The example: `hosts` is 2 to the right of `Host`, and its defined-by line comes down in one stroke at Host's centre.
    const view = viewOf(EXAMPLE_MODEL, 'v-proof');
    const lineOf = (look) => linesOf(project(lib, EXAMPLE_MODEL, view, { look }), look).find((line) => line.id === 't-hosts').points;
    same(lineOf(LOOK), [[216, 286], [216, 343], [216, 343], [216, 400]], 'The line from hosts to Host, by the new measures');
    same(lineOf(OLD_LOOK), [[218, 286], [218, 343], [216, 343], [216, 400]], 'The line from hosts to Host, by the old page\'s measures');
    // Its other elbows, further out of line, keep their turns: `app` to `App`, and the three specializations.
    const stepped = linesOf(project(lib, EXAMPLE_MODEL, view), LOOK).filter((line) => new Set(line.points.map((p) => p[0])).size > 1 && new Set(line.points.map((p) => p[1])).size > 1);
    same(stepped.map((line) => line.id).sort(), linesOf(project(lib, EXAMPLE_MODEL, view, { look: OLD_LOOK }), OLD_LOOK)
      .filter((line) => line.id !== 't-hosts' && new Set(line.points.map((p) => p[0])).size > 1 && new Set(line.points.map((p) => p[1])).size > 1).map((line) => line.id).sort(),
    'Only the line from hosts to Host loses its turn.');
  });

  test('what the example\'s boxes and ports say', () => {
    const projection = project(lib, EXAMPLE_MODEL, EXAMPLE_MODEL.views[0]);
    const nodes = nodesById(projection);
    const box = (keyword, name, compartments) => ({ form: 'box', far: false, keyword, name, compartments, glyph: null, least: { width: 80, height: 40 } });
    const hostDoc = [
      'hosts/: the small piece of code that plugs the app into',
      'one place. It works out where its package\'s files are,',
      'loads the entry file with the shared loader, and calls',
      'mount. It has no settings: it only ever loads the app',
      'from its own package.',
    ];
    const hostEl = EXAMPLE_MODEL.elements.find((el) => el.id === 'Host');

    // Host: an abstract part def, its doc in a 56-character compartment (floor((368 - 24) / 6.1)).
    const host = nodes.get('Host');
    assert.equal(host.type, 'rect', 'A part def should be a rect.');
    same(host.data, box('«abstract part def»', 'Host', [{ head: 'doc', lines: hostDoc }]), 'Host should say «abstract part def», Host, and its doc in 5 rows.');
    assert.ok(host.data.compartments[0].lines.every((line) => line.length <= 56), 'Host\'s rows should be at most 56 characters.');
    assert.equal(host.data.compartments[0].lines.join(' '), hostEl.doc.split(/\s+/).join(' '), 'Host\'s rows, joined by spaces, should give its doc\'s words.');
    assert.deepEqual(wordsOf(host).sort(), ['abstract', 'def'], 'Host\'s className should be def and abstract.');

    const page = nodes.get('Page');
    assert.equal(page.type, 'rect', 'A part def should be a rect.');
    assert.equal(page.data.keyword, '«part def»', 'Page should say «part def».');
    assert.equal(page.data.name, 'Page', 'Page should say Page.');
    assert.equal(page.data.compartments.length, 1, 'Page should have one compartment.');
    assert.equal(page.data.compartments[0].head, 'doc', 'Page\'s compartment should be its doc.');
    same(page.data.compartments[0].lines, [
      'A page with Stronghold on it: a SharePoint Server page, a SharePoint Online page, a Teams tab, or the dev page. Every',
      'Stronghold web part on the page mounts the same app, because the first entry file to load wins',
      '(app/src/host/load-app.ts).',
    ], 'Page\'s doc should be 3 rows of at most 120 characters (floor((760 - 24) / 6.1)).');
    assert.deepEqual(page.data.least, { width: 80, height: 40 }, 'A part def\'s least size is 80 by 40.');
    assert.deepEqual(wordsOf(page), ['def'], 'Page\'s className should be def.');

    const hosts = nodes.get('Page.hosts');
    assert.equal(hosts.type, 'rounded', 'A part should be rounded.');
    same(hosts.data, box('«part»', 'hosts : Host [1..*]', []), 'Page.hosts should say «part» and hosts : Host [1..*].');
    assert.ok(wordsOf(hosts).includes('usage') && !wordsOf(hosts).includes('def') && !wordsOf(hosts).includes('abstract'), 'A part\'s className should have usage.');
    assert.equal(hosts.parentId, 'Page', 'Page.hosts should be in Page.');
    assert.deepEqual(hosts.position, { x: 96, y: 104 }, 'Page.hosts should lie at its saved 96, 104.');
    assert.deepEqual([hosts.width, hosts.height], [180, 110], 'Page.hosts should keep its saved 180 by 110.');
    const app = nodes.get('Page.app');
    assert.equal(app.type, 'rounded', 'A part should be rounded.');
    same(app.data, box('«part»', 'app : App [1]', []), 'Page.app should say «part» and app : App [1].');
    assert.ok(wordsOf(app).includes('usage'), 'A part\'s className should have usage.');

    // The four ports. The typing of each is hidden, and still names the port's definition.
    const port = (side, name, nameAt) => ({ form: 'border', far: false, side, glyph: null, name, nameAt });
    assert.equal(nodes.get('Page.hosts.api').type, 'port', 'A port should be a port.');
    same(nodes.get('Page.hosts.api').data, port('right', 'api : ~StrongholdApp', { x: 20, y: 2, anchor: 'start' }), 'Page.hosts.api is conjugated.');
    same(nodes.get('Host.api').data, port('right', 'api : ~StrongholdApp', { x: 20, y: 2, anchor: 'start' }), 'Host.api is conjugated.');
    same(nodes.get('Page.app.api').data, port('left', 'api : StrongholdApp', { x: -4, y: 23, anchor: 'end' }), 'Page.app.api is not conjugated.');
    same(nodes.get('App.api').data, port('right', 'api : StrongholdApp', { x: 20, y: 2, anchor: 'start' }), 'App.api is not conjugated.');
    for (const id of ['Page.hosts.api', 'Host.api', 'Page.app.api', 'App.api']) assert.equal(nodes.get(id).type, 'port', `${id} should be a port.`);
  });

  test('what an item, an action, a state and a control node say', () => {
    const box = (keyword, name, compartments, glyph = null) => ({ form: 'box', far: false, keyword, name, compartments, glyph, least: { width: 80, height: 40 } });
    const small = (name) => ({ form: 'small', far: false, name });
    const port = (side, glyph, name, nameAt) => ({ form: 'border', far: false, side, glyph, name, nameAt });
    const LEFT = { x: -4, y: 23, anchor: 'end' };   // the name of a left port with no line: below, to the left
    const RIGHT = { x: 20, y: 2, anchor: 'start' }; // of a right port with no line: above, to the right
    const expectNode = (projection, id, want) => {
      const node = nodesById(projection).get(id);
      assert.ok(node, `${id} should be a node.`);
      assert.equal(node.type, want.type, `${id} should be of type ${want.type}.`);
      assert.equal(node.parentId, want.parent, `${id} should be in ${want.parent}.`);
      assert.deepEqual(node.position, want.position, `${id} should lie at ${JSON.stringify(want.position)}.`);
      assert.deepEqual([node.width, node.height], want.size, `${id} should be ${want.size.join(' by ')}.`);
      same(node.data, want.data, `${id} should say what its element says.`);
      if (want.words) for (const word of want.words) assert.ok(wordsOf(node).includes(word), `The className of ${id} should have ${word}.`);
    };

    // An item (interconnection/page.js 30-40): the keyword carries the direction, «out item»; a usage's name line has
    // its definition after a colon (hidden typings count) and its multiplicity in brackets (drawing.js 47-58).
    const ic = fileNamed('interconnection.json');
    const inter = project(lib, ic, viewOf(ic, 'v-ic'));
    expectNode(inter, 'FuelPort.supply', { type: 'item', parent: 'FuelPort', position: { x: 12, y: 88 }, size: [160, 52], data: box('«out item»', 'supply : Fuel', []), words: ['usage'] });
    expectNode(inter, 'FuelPort.back', { type: 'item', parent: 'FuelPort', position: { x: 12, y: 148 }, size: [160, 52], data: box('«in item»', 'back : Fuel', []), words: ['usage'] });
    expectNode(inter, 'Tank.stored', { type: 'item', parent: 'Tank', position: { x: 12, y: 88 }, size: [160, 52], data: box('«item»', 'stored : Fuel [0..*]', []), words: ['usage'] });
    // A port's glyph follows the directed items of its port def, flipped when it is conjugated (interconnection/lib.js
    // 200-206); a left port's name, with no line, is below and to the left (drawing.js 106-115).
    expectNode(inter, 'FuelLine.a', { type: 'port', parent: 'FuelLine', position: { x: -8, y: 37 }, size: [16, 16], data: port('left', 'inout', 'a : FuelPort', LEFT) });
    expectNode(inter, 'FuelLine.b', { type: 'port', parent: 'FuelLine', position: { x: 232, y: 37 }, size: [16, 16], data: port('right', 'inout', 'b : ~FuelPort', RIGHT) });
    expectNode(inter, 'CtrlLink.c', { type: 'port', parent: 'CtrlLink', position: { x: -8, y: 37 }, size: [16, 16], data: port('left', 'out', 'c : ~CtrlPort', LEFT) });
    expectNode(inter, 'CtrlLink.p', { type: 'port', parent: 'CtrlLink', position: { x: 212, y: 37 }, size: [16, 16], data: port('right', 'in', 'p : CtrlPort', RIGHT) });
    // The flow from System.controller.ctrl (bottom) to System.pump.ctrl (top) heads right and a little down: the
    // bottom port's name goes to its left, the top port's, whose line comes from the left, to its right.
    expectNode(inter, 'System.controller.ctrl', { type: 'port', parent: 'System.controller', position: { x: 102, y: 82 }, size: [16, 16], data: port('bottom', 'out', 'ctrl : ~CtrlPort', { x: -4, y: 23, anchor: 'end' }) });
    expectNode(inter, 'System.pump.ctrl', { type: 'port', parent: 'System.pump', position: { x: 64, y: -8 }, size: [16, 16], data: port('top', 'in', 'ctrl : CtrlPort', { x: 20, y: 2, anchor: 'start' }) });

    // An action (behavior/page.js 59-80): «action», «send action», «accept action», «entry action»; a send or accept
    // has its compartment (129-137) and its mark. The rows hold floor((width - 24) / 6.6) characters, 22 at 170 and
    // 20 for a doc at 150 (6.1). A compartment is 16 + 16 per row + 6 under the header's 40.
    const actions = fileNamed('behavior-actions.json');
    const flow = project(lib, actions, viewOf(actions, 'v-release'));
    expectNode(flow, 'Release.compile', {
      type: 'action', parent: 'Release', position: { x: 90, y: 108 }, size: [150, 40 + 16 + 2 * 15 + 6],
      data: box('«action»', 'compile', [{ head: 'doc', lines: ['webpack 5 and', 'TypeScript 5.9.'] }]), words: ['usage'],
    });
    expectNode(flow, 'Release.test', { type: 'action', parent: 'Release', position: { x: 410, y: 92 }, size: [150, 56], data: box('«action»', 'test', []) });
    // 'new Warning() to maintainer', for maintainer is no port of this model (sendWord): two rows of at most 22.
    expectNode(flow, 'Release.notify', {
      type: 'action', parent: 'Release', position: { x: 480, y: 344 }, size: [170, 40 + 16 + 2 * 15 + 6],
      data: box('«send action»', 'notify', [{ head: 'send', lines: ['new Warning() to', 'maintainer'] }], 'send'),
    });
    expectNode(flow, 'Release.approve', {
      type: 'action', parent: 'Release', position: { x: 40, y: 464 }, size: [170, 40 + 16 + 15 + 6],
      data: box('«accept action»', 'approve', [{ head: 'accept', lines: ['approval : Approval'] }], 'accept'),
    });
    // A parameter: its glyph is its direction; its name is the name line, nothing more.
    expectNode(flow, 'Release.source', { type: 'param', parent: 'Release', position: { x: -8, y: 292 }, size: [16, 16], data: port('left', 'in', 'source', LEFT) });
    expectNode(flow, 'Release.bundle', { type: 'param', parent: 'Release', position: { x: 992, y: 292 }, size: [16, 16], data: port('right', 'out', 'bundle', RIGHT) });
    // The control nodes (behavior/page.js 82-127): shapes of their saved size, named by the name in the text, which a
    // start or a done has none of; a decision's doc is not drawn.
    expectNode(flow, 'Release.split', { type: 'bar', parent: 'Release', position: { x: 300, y: 136 }, size: [60, 8], data: small('split'), words: ['usage'] });
    expectNode(flow, 'Release.rejoin', { type: 'bar', parent: 'Release', position: { x: 630, y: 136 }, size: [60, 8], data: small('rejoin') });
    expectNode(flow, 'Release.verdict', { type: 'diamond', parent: 'Release', position: { x: 740, y: 120 }, size: [40, 40], data: small('verdict') });
    expectNode(flow, 'Release.collect', { type: 'diamond', parent: 'Release', position: { x: 190, y: 374 }, size: [40, 40], data: small('collect') });
    expectNode(flow, 'Release.start', { type: 'dot', parent: 'Release', position: { x: 36, y: 132 }, size: [16, 16], data: small('') });
    expectNode(flow, 'Release.done', { type: 'bullseye', parent: 'Release', position: { x: 110, y: 554 }, size: [22, 22], data: small('') });

    // A state def and a state (behavior/page.js 70-80): «state def», «state», and «parallel» beside the keyword; an
    // action in a state says its role, «entry action»; an initial node has no name.
    const states = fileNamed('behavior-states.json');
    const machine = project(lib, states, viewOf(states, 'v-host'));
    expectNode(machine, 'HostLifecycle', {
      type: 'state', parent: undefined, position: { x: 32, y: 72 }, size: [760, 520],
      data: box('«state def»', 'HostLifecycle', [{ head: 'doc', lines: ['One web part on one page.'] }]), words: ['def'],
    });
    expectNode(machine, 'HostLifecycle.idle', {
      type: 'state', parent: 'HostLifecycle', position: { x: 100, y: 280 }, size: [160, 40 + 16 + 2 * 15 + 6],
      data: box('«state»', 'idle', [{ head: 'doc', lines: ['Placed on the page,', 'nothing loaded yet.'] }]), words: ['usage'],
    });
    // loading holds fetchEntry, at 20, 48 and 94 high, so it is 48 + 94 + 12 high.
    expectNode(machine, 'HostLifecycle.loading', { type: 'state', parent: 'HostLifecycle', position: { x: 380, y: 100 }, size: [220, 48 + (40 + 16 + 2 * 15 + 6) + 12], data: box('«state»', 'loading', []) });
    expectNode(machine, 'HostLifecycle.loading.fetchEntry', {
      type: 'action', parent: 'HostLifecycle.loading', position: { x: 20, y: 48 }, size: [180, 40 + 16 + 2 * 15 + 6],
      data: box('«entry action»', 'fetchEntry', [{ head: 'doc', lines: ['Loads the entry file with', 'the shared loader.'] }]),
    });
    // A parallel state, grown to hold its two states: 48 + 50 + 12 high.
    expectNode(machine, 'HostLifecycle.running', { type: 'state', parent: 'HostLifecycle', position: { x: 380, y: 310 }, size: [300, 110], data: box('«state» «parallel»', 'running', []) });
    expectNode(machine, 'HostLifecycle.initial', { type: 'entry', parent: 'HostLifecycle', position: { x: 50, y: 302 }, size: [28, 16], data: small('') });
    expectNode(machine, 'HostLifecycle.done', { type: 'bullseye', parent: 'HostLifecycle', position: { x: 560, y: 470 }, size: [22, 22], data: small('') });

    // An event occurrence (sequence/page.js 28-37), in the general view of the sequence fixture: its saved 16 by 16,
    // named by its name line.
    const sequence = fileNamed('sequence.json');
    const events = project(lib, sequence, viewOf(sequence, 'v-all'));
    expectNode(events, 'Login.client.loginSent', { type: 'event', parent: 'Login.client', position: { x: 14, y: 48 }, size: [16, 16], data: small('loginSent'), words: ['usage'] });
    assert.equal(nodesById(events).get('Login.client.loginDone').data.name, 'loginDone', 'An event should say its name.');

    // The code compartment (annotations/page.js 315-320) comes after the doc: the files' paths, one row each.
    const annotated = fileNamed('annotations.json');
    const code = nodesById(project(lib, annotated, viewOf(annotated, 'v-proof')));
    same(code.get('Host').data.compartments.map((c) => c.head), ['doc', 'code'], 'A box with a doc and code links should show the doc, then the code.');
    same(code.get('Host').data.compartments[1], { head: 'code', lines: ['hosts/README.md'] }, 'Host\'s code compartment should have a row for its file.');
    same(code.get('Page').data.compartments[1], { head: 'code', lines: ['app/src/host/load-app.ts'] }, 'Page\'s code compartment should have a row for its file.');
    const docRows = code.get('Host').data.compartments[0].lines.length;
    assert.equal(code.get('Host').height, 40 + (16 + 15 * docRows + 6) + (16 + 15 + 6), 'Host should be as high as its header and its two compartments.');

    // Where the limits bite, in a model made by hand. A box is wrapped to its saved width: at 80 wide a doc's rows hold
    // at least 12 characters (layout.js 12-24, drawing.js 163-165), a send's at least 10, and a code link is cut to at
    // least 8, with an ellipsis in front (fitPath).
    const { model, view } = hand(
      [
        { id: 'C', kind: 'PartDefinition', name: 'C', doc: 'aaaa bbbb cccc dddd', code: [{ path: 'src/a/very/long/path/main.ts', language: 'typescript', text: '' }, { path: 'a/b/c.ts', language: 'typescript', text: '' }] },
        { id: 'N', kind: 'PartDefinition', name: 'N', doc: 'one\n\ntwo' },
        { id: 'T', kind: 'PartDefinition', name: 'T' },
        { id: 'T.gate', kind: 'PortUsage', name: 'gate', owner: 'T' },
        { id: 'S1', kind: 'ActionUsage', name: 'S1', actionKind: 'send', payload: 'aaaa bbbb cccc', target: '' },
        { id: 'S2', kind: 'ActionUsage', name: 'S2', actionKind: 'send', payload: 'go', target: 'gate', doc: 'Says go.', code: [{ path: 'a/b/c.ts', language: 'typescript', text: '' }] },
        { id: 'S3', kind: 'ActionUsage', name: 'S3', actionKind: 'send', payload: 'go', target: 'elsewhere' },
        { id: 'S4', kind: 'ActionUsage', name: 'S4', actionKind: 'accept', payload: 'req : Req', target: 'gate' },
        { id: 'S5', kind: 'ActionUsage', name: 'S5', actionKind: 'send', payload: '', target: '' },
      ],
      [],
      {
        C: { x: 0, y: 0, w: 80, h: 40 }, N: { x: 200, y: 0, w: 300, h: 40 }, T: { x: 600, y: 0 }, 'T.gate': { side: 'right', at: 0.5 },
        S1: { x: 0, y: 300, w: 80, h: 40 }, S2: { x: 200, y: 300 }, S3: { x: 400, y: 300 }, S4: { x: 600, y: 300 }, S5: { x: 800, y: 300 },
      },
    );
    const made = nodesById(project(lib, model, view));
    same(made.get('C').data.compartments, [
      { head: 'doc', lines: ['aaaa bbbb', 'cccc dddd'] },
      { head: 'code', lines: ['…main.ts', 'a/b/c.ts'] },
    ], 'At 80 wide a doc wraps to 12 characters and a code path is cut to 8, its end kept after an ellipsis.');
    assert.equal(made.get('C').height, 40 + (16 + 2 * 15 + 6) + (16 + 2 * 15 + 6), 'C should be as high as its header and two compartments of two rows.');
    same(made.get('N').data.compartments, [{ head: 'doc', lines: ['one', '', 'two'] }], 'A blank line of a doc should be a row.');
    same(made.get('S1').data.compartments, [{ head: 'send', lines: ['aaaa bbbb', 'cccc'] }], 'At 80 wide a send\'s rows hold 10 characters.');
    same(made.get('S2').data.compartments, [
      { head: 'doc', lines: ['Says go.'] },
      { head: 'send', lines: ['go via gate'] },
      { head: 'code', lines: ['a/b/c.ts'] },
    ], 'Compartments should come in the order doc, send, code, and a send to a port should go via it.');
    assert.equal(made.get('S2').height, 40 + 3 * (16 + 15 + 6), 'S2 should be as high as its header and three compartments of one row.');
    same(made.get('S3').data.compartments, [{ head: 'send', lines: ['go to elsewhere'] }], 'A send to what is no port should go to it.');
    same(made.get('S4').data.compartments, [{ head: 'accept', lines: ['req : Req via gate'] }], 'An accept should always say via.');
    same([made.get('S5').data.compartments, made.get('S5').data.glyph, made.get('S5').height], [[], 'send', 60], 'A send with no payload and no target has no compartment, and keeps its mark.');
  });

  test('a line\'s marker, class, label and offset come from its row', () => {
    let count = 0;
    for (const { label, model, view } of GRAPH_VIEWS) {
      const projection = project(lib, model, view);
      const ids = idsOf(model);
      const rels = new Map(model.relationships.map((rel) => [rel.id, rel]));
      for (const edge of projection.edges) {
        count += 1;
        const rel = rels.get(edge.id);
        const row = lib.RELATIONSHIPS[rel.kind].line;
        const where = `${label}: the line ${edge.id}`;
        assert.equal(edge.data.marker, row.marker ? markerId(row.marker) : null, `${where} should have its row's marker.`);
        assert.equal(edge.className, row.cls, `${where} should have its row's class.`);
        assert.equal(edge.data.route, row.route === 'elbow' ? 'elbow' : 'straight', `${where} should be an elbow only when its row says so.`);
        assert.equal(edge.data.labelOffset, row.labelOffset ?? 30, `${where} should have its row's label offset, 30 when it gives none.`);
        assert.equal(edge.data.label, row.label ? row.label(rel, model, ids) : '', `${where} should say what its row's label says.`);
        assert.equal(edge.data.far, false, `${where} is near.`);
        assert.equal(edge.data.sourceBorder, lib.KINDS[ids.get(rel.from).kind].onBorder === true, `${where} should say whether it starts on a border item.`);
        assert.equal(edge.data.targetBorder, lib.KINDS[ids.get(rel.to).kind].onBorder === true, `${where} should say whether it ends on a border item.`);
      }
    }
    assert.equal(count, 58, 'The ten files should have 58 lines in their graph views.');

    const line = (projection, id) => projection.edges.find((edge) => edge.id === id);
    const example = project(lib, EXAMPLE_MODEL, EXAMPLE_MODEL.views[0]);
    const mount = line(example, 'mount');
    assert.deepEqual(
      [mount.className, mount.data.marker, mount.data.label, mount.data.labelOffset, mount.data.route, mount.data.sourceBorder, mount.data.targetBorder],
      ['connection', null, 'mount', 30, 'straight', true, true], 'The example\'s mount should be a connection between two border items, with no marker, the label mount and the offset 30.',
    );
    const special = line(example, 's-ServerHost');
    assert.deepEqual([special.className, special.data.marker, special.data.route, special.data.label, special.source, special.target, special.data.sourceBorder], ['specialization', 'grasp-m-general', 'elbow', '', 'ServerHost', 'Host', false],
      'A specialization should be an elbow with the marker grasp-m-general.');
    const typing = line(example, 't-hosts');
    assert.deepEqual([typing.className, typing.data.marker, typing.data.route], ['typing', 'grasp-m-defined', 'elbow'], 'A typing should be an elbow with the marker grasp-m-defined.');
    const actions = fileNamed('behavior-actions.json');
    const flow = project(lib, actions, viewOf(actions, 'v-release'));
    const succession = line(flow, 's-compiled');
    assert.deepEqual([succession.className, succession.data.marker, succession.data.labelOffset, succession.data.route, succession.data.label], ['succession', 'grasp-m-open', -8, 'elbow', 'compiled'],
      'A succession should be an elbow with the marker grasp-m-open, its label above the line.');
    assert.equal(line(flow, 's-publish').data.label, '[test.passed]', 'A succession\'s guard should be its label in brackets.');
    assert.equal(line(flow, 's-fix').data.label, 'else', 'A succession\'s else guard should say else.');
    const ic = fileNamed('interconnection.json');
    const inter = project(lib, ic, viewOf(ic, 'v-ic'));
    assert.deepEqual([line(inter, 'outletBinding').data.label, line(inter, 'outletBinding').data.labelOffset, line(inter, 'command').data.marker], ['=', -5, 'grasp-m-flow'], 'A binding should say = above its line, and a flow should have the marker grasp-m-flow.');
  });

  test('a port\'s name keeps clear of its line', () => {
    // The old page's portName and lineWay (drawing.js 77-115), from the square's top left, where its centre is (8, 8):
    // a right port's name is above and to the right, a left port's below and to the left, a top port's centred above,
    // a bottom port's centred below; when the first line drawn from the port heads where the name would be, it takes
    // the other side of the square.
    const example = project(lib, EXAMPLE_MODEL, EXAMPLE_MODEL.views[0]);
    const at = (projection, id) => nodesById(projection).get(id).data.nameAt;
    same(at(example, 'Page.hosts.api'), { x: 20, y: 2, anchor: 'start' }, 'A right port whose line is level should have its name above and to the right.');
    same(at(example, 'Page.app.api'), { x: -4, y: 23, anchor: 'end' }, 'A left port whose line is level should have its name below and to the left.');
    same(at(example, 'Host.api'), { x: 20, y: 2, anchor: 'start' }, 'A right port with no line should have its name above and to the right.');
    same(at(example, 'App.api'), { x: 20, y: 2, anchor: 'start' }, 'A right port with no line should have its name above and to the right.');

    // Every other branch, on a model made by hand: A is the box (300, 300, 200, 200), its centre (400, 400), and one
    // port on the side asked, at 0.5, so its square's centre is the middle of the side. Each target T is a box 80 by 40
    // about the point given, and a connection joins the port to it (or it to the port, when `from` is T).
    const ground = { x: 300, y: 300, w: 200, h: 200 };
    const nameAt = ({ side, targets, reverse = false, hide = false }) => {
      const elements = [
        { id: 'A', kind: 'PartDefinition', name: 'A' },
        { id: 'A.p', kind: 'PortUsage', name: 'p', owner: 'A' },
        ...targets.map((_, i) => ({ id: `T${i}`, kind: 'PartDefinition', name: `T${i}` })),
      ];
      const layout = { A: ground, 'A.p': { side, at: 0.5 } };
      targets.forEach(([cx, cy], i) => { layout[`T${i}`] = { x: cx - 40, y: cy - 20, w: 80, h: 40 }; });
      const relationships = [
        ...(hide ? [{ id: 'hidden', kind: 'FeatureTyping', from: 'A.p', to: 'T0', hidden: true }] : []),
        ...targets.map((_, i) => ({ id: `c${i}`, kind: 'ConnectionUsage', from: reverse ? `T${i}` : 'A.p', to: reverse ? 'A.p' : `T${i}` })),
      ];
      const { model, view } = hand(elements, relationships, layout);
      const projection = project(lib, model, view);
      same(projection.edges.map((edge) => edge.id), targets.map((_, i) => `c${i}`), 'The connections should be drawn, and no hidden line.');
      return nodesById(projection).get('A.p').data.nameAt;
    };
    const cases = [
      // side, where the line heads (the target's centre), the name: above/below by the side's own rule, or the other side
      ['right', [[700, 100]], { x: 20, y: 23, anchor: 'start' }, 'a right port whose line heads up and right takes the name below'],
      ['right', [[700, 400]], { x: 20, y: 2, anchor: 'start' }, 'a right port whose line is level keeps the name above'],
      ['right', [[700, 700]], { x: 20, y: 2, anchor: 'start' }, 'a right port whose line heads down and right keeps the name above'],
      ['right', [[100, 100]], { x: 20, y: 2, anchor: 'start' }, 'a right port whose line heads up and left keeps the name above'],
      ['left', [[100, 700]], { x: -4, y: 2, anchor: 'end' }, 'a left port whose line heads down and left takes the name above'],
      ['left', [[100, 400]], { x: -4, y: 23, anchor: 'end' }, 'a left port whose line is level keeps the name below'],
      ['left', [[100, 100]], { x: -4, y: 23, anchor: 'end' }, 'a left port whose line heads up and left keeps the name below'],
      ['left', [[700, 700]], { x: -4, y: 23, anchor: 'end' }, 'a left port whose line heads down and right keeps the name below'],
      ['top', [[700, 100]], { x: -4, y: 2, anchor: 'end' }, 'a top port whose line heads up and right takes the name to the left'],
      ['top', [[100, 100]], { x: 20, y: 2, anchor: 'start' }, 'a top port whose line heads up and left takes the name to the right'],
      ['top', [[400, 100]], { x: 20, y: 2, anchor: 'start' }, 'a top port whose line heads straight up takes the name to the right'],
      ['top', [[700, 700]], { x: 8, y: -5, anchor: 'middle' }, 'a top port whose line heads down keeps the name centred above'],
      ['top', [[700, 300]], { x: 8, y: -5, anchor: 'middle' }, 'a top port whose line is level keeps the name centred above'],
      ['bottom', [[700, 700]], { x: -4, y: 23, anchor: 'end' }, 'a bottom port whose line heads down and right takes the name to the left'],
      ['bottom', [[100, 700]], { x: 20, y: 23, anchor: 'start' }, 'a bottom port whose line heads down and left takes the name to the right'],
      ['bottom', [[400, 700]], { x: 20, y: 23, anchor: 'start' }, 'a bottom port whose line heads straight down takes the name to the right'],
      ['bottom', [[400, 100]], { x: 8, y: 30, anchor: 'middle' }, 'a bottom port whose line heads up keeps the name centred below'],
    ];
    for (const [side, targets, want, what] of cases) {
      assert.deepEqual(nameAt({ side, targets }), want, `With the line from it, ${what}.`);
      assert.deepEqual(nameAt({ side, targets, reverse: true }), want, `With the line to it, ${what}.`);
    }
    // With no line at all.
    const none = (side) => {
      const { model, view } = hand([{ id: 'A', kind: 'PartDefinition', name: 'A' }, { id: 'A.p', kind: 'PortUsage', name: 'p', owner: 'A' }], [], { A: ground, 'A.p': { side, at: 0.5 } });
      return nodesById(project(lib, model, view)).get('A.p').data.nameAt;
    };
    assert.deepEqual(none('right'), { x: 20, y: 2, anchor: 'start' }, 'A right port with no line has its name above and to the right.');
    assert.deepEqual(none('left'), { x: -4, y: 23, anchor: 'end' }, 'A left port with no line has its name below and to the left.');
    assert.deepEqual(none('top'), { x: 8, y: -5, anchor: 'middle' }, 'A top port with no line has its name centred above.');
    assert.deepEqual(none('bottom'), { x: 8, y: 30, anchor: 'middle' }, 'A bottom port with no line has its name centred below.');
    // The first line drawn, in the model's order, is the one that counts; a hidden line is not drawn.
    assert.deepEqual(nameAt({ side: 'right', targets: [[700, 100], [700, 700]] }), { x: 20, y: 23, anchor: 'start' }, 'The first line, heading up and right, should decide.');
    assert.deepEqual(nameAt({ side: 'right', targets: [[700, 700], [700, 100]] }), { x: 20, y: 2, anchor: 'start' }, 'The first line, heading down and right, should decide.');
    assert.deepEqual(nameAt({ side: 'right', targets: [[700, 100]], hide: true }), { x: 20, y: 23, anchor: 'start' }, 'A hidden line should not decide.');
    // The example's flow, from the bottom port of one part to the top port of another that lies lower and to the right.
    const ic = fileNamed('interconnection.json');
    const inter = project(lib, ic, viewOf(ic, 'v-ic'));
    same(at(inter, 'System.controller.ctrl'), { x: -4, y: 23, anchor: 'end' }, 'A bottom port whose line heads right and down should have its name to the left.');
    same(at(inter, 'System.pump.ctrl'), { x: 20, y: 2, anchor: 'start' }, 'A top port whose line comes from the left and above should have its name to the right.');
  });

  test('a view that places nothing, and a view of a kind no plane draws, project to nothing', () => {
    const blank = lib.normalize(readJSON(path.join(ROOT, 'canvas', 'state.json')).model);
    const empty = [{ label: 'the blank model\'s view', model: blank, view: blank.views[0] }, ...OTHER_VIEWS];
    assert.ok(OTHER_VIEWS.some(({ view }) => view.kind === 'GridView' && Object.keys(view.layout).length > 0), 'The fixtures should have a grid view that places elements.');
    assert.equal(Object.keys(blank.views[0].layout).length, 0, 'The blank model\'s view should place nothing.');
    for (const { label, model, view } of empty) {
      for (const far of [false, true]) {
        const projection = project(lib, model, view, { far });
        same(projection.nodes, [], `${label}: a view that places nothing should have no nodes.`);
        same(projection.edges, [], `${label}: a view that places nothing should have no edges.`);
        assert.equal(projection.rects.size, 0, `${label}: a view that places nothing should have no rectangles.`);
        assert.equal(projection.bounds, null, `${label}: a view that places nothing should have no bounds.`);
        assert.equal(projection.view, view.id, `${label}: the projection should name its view.`);
      }
    }
  });

  // Read inside lib.reading the three views take about 40 ms; outside it, about a second. 300 ms tells the two apart
  // whatever else the machine is doing.
  test('the 5,000-element model\'s three views project in under 300 ms together', (t) => {
    const { model, views } = scaleModel();
    assert.equal(views.length, 3, 'The scale model should have three graph views.');
    const start = performance.now();
    const projections = views.map((view) => project(lib, model, view));
    const ms = performance.now() - start;
    t.diagnostic(`the three views of the 5,000-element model, projected in ${ms.toFixed(0)} ms (${projections.map((p) => `${p.nodes.length} nodes, ${p.edges.length} edges`).join('; ')})`);
    assert.ok(projections.every((p) => p.nodes.length > 0 && p.edges.length > 0), 'Each view should have nodes and edges.');
    assert.ok(ms < 300, `The three views took ${ms.toFixed(0)} ms, and should take under 300.`);
  });

  test('a fitted view lies inside the window, clear of its sides and of the band, at no more than 100%', () => {
    // The bounds of a projection are the rectangle around every node's rectangle, border items included.
    for (const { label, model, view } of GRAPH_VIEWS) {
      const { rects, bounds } = project(lib, model, view);
      const all = [...rects.values()];
      const want = {
        x: Math.min(...all.map((r) => r.x)), y: Math.min(...all.map((r) => r.y)),
        w: Math.max(...all.map((r) => r.x + r.w)) - Math.min(...all.map((r) => r.x)),
        h: Math.max(...all.map((r) => r.y + r.h)) - Math.min(...all.map((r) => r.y)),
      };
      for (const key of ['x', 'y', 'w', 'h']) near(bounds[key], want[key], 1e-9, `${label}: ${key} of the bounds should be that of the rectangle around every rectangle`);
    }
    const example = project(lib, EXAMPLE_MODEL, EXAMPLE_MODEL.views[0]);
    assert.deepEqual(example.bounds, { x: 32, y: 72, w: 1176, h: 648 }, 'The example\'s bounds should be 32, 72, 1176 by 648.');

    const check = (bounds, width, height, label) => {
      const v = fit(bounds, width, height);
      assert.ok(v.zoom >= MIN_ZOOM && v.zoom <= 1, `${label}: the zoom ${v.zoom} should be between MIN_ZOOM and 1.`);
      const left = bounds.x * v.zoom + v.x;
      const right = (bounds.x + bounds.w) * v.zoom + v.x;
      const top = bounds.y * v.zoom + v.y;
      const bottom = (bounds.y + bounds.h) * v.zoom + v.y;
      const eps = 1e-6;
      assert.ok(left >= FIT_PAD - eps && right <= width - FIT_PAD + eps, `${label}: the bounds should lie between ${FIT_PAD} and ${width - FIT_PAD} across, not ${left} to ${right}.`);
      assert.ok(top >= FIT_PAD - eps && bottom <= height - FIT_BAND + eps, `${label}: the bounds should lie between ${FIT_PAD} and ${height - FIT_BAND} down, not ${top} to ${bottom}.`);
      near(left - FIT_PAD, width - FIT_PAD - right, eps, `${label}: the bounds should be centred across the room`);
      near(top - FIT_PAD, height - FIT_BAND - bottom, eps, `${label}: the bounds should be centred down the room`);
      const fillsAcross = Math.abs((right - left) - (width - 2 * FIT_PAD)) < eps;
      const fillsDown = Math.abs((bottom - top) - (height - FIT_PAD - FIT_BAND)) < eps;
      assert.ok(v.zoom === 1 || fillsAcross || fillsDown, `${label}: the zoom ${v.zoom} should be the largest that fits: 1, or one direction filling its room.`);
      return v;
    };
    const bounds = { x: 32, y: 72, w: 1176, h: 648 };
    // 1336 by 828: room 1240 by 600; the height fills, at 600 / 648.
    let v = check(bounds, 1336, 828, 'the example in 1336 by 828');
    near(v.zoom, 600 / 648, 1e-12, 'The example should fit 1336 by 828 at 600 / 648');
    near(v.x, 48 + (1240 - 1176 * v.zoom) / 2 - 32 * v.zoom, 1e-9, 'The example should be centred across 1336');
    near(v.y, 48 - 72 * v.zoom, 1e-9, 'The example should start at the top margin of 1336 by 828');
    // 736 by 828: room 640 by 600; the width fills, at 640 / 1176.
    v = check(bounds, 736, 828, 'the example in 736 by 828');
    near(v.zoom, 640 / 1176, 1e-12, 'The example should fit 736 by 828 at 640 / 1176');
    near(v.x, 48 - 32 * v.zoom, 1e-9, 'The example should start at the left margin of 736 by 828');
    near(v.y, 48 + (600 - 648 * v.zoom) / 2 - 72 * v.zoom, 1e-9, 'The example should be centred down 736 by 828');
    // Small bounds are not made larger than 100%, and sit in the middle of the room.
    v = check({ x: 100, y: 50, w: 200, h: 100 }, 1000, 700, 'small bounds');
    assert.equal(v.zoom, 1, 'Bounds that fit at more than 100% should be fitted at 100%.');
    near(v.x, FIT_PAD + (1000 - 2 * FIT_PAD - 200) / 2 - 100, 1e-9, 'Small bounds should be centred across');
    near(v.y, FIT_PAD + (700 - FIT_PAD - FIT_BAND - 100) / 2 - 50, 1e-9, 'Small bounds should be centred down');
    check({ x: -500, y: -400, w: 300, h: 3000 }, 800, 600, 'tall bounds from a negative origin');
    check({ x: -50, y: 20, w: 9000, h: 100 }, 800, 600, 'wide bounds');
    check({ x: 0, y: 0, w: 1240, h: 600 }, 1336, 828, 'bounds that fill the room exactly');

    assert.deepEqual(plain(fit(null, 1336, 828)), { x: 0, y: 0, zoom: 1 }, 'With nothing to fit the viewport should be 100% at the origin.');
    assert.equal(fit({ x: 0, y: 0, w: 1e6, h: 1e6 }, 800, 600).zoom, MIN_ZOOM, 'Bounds too large for any zoom should fit at MIN_ZOOM.');
    for (const [width, height] of [[90, 828], [96, 828], [1336, 200], [1336, 228], [50, 50]]) {
      const got = fit(bounds, width, height);
      assert.equal(got.zoom, MIN_ZOOM, `A window ${width} by ${height} has no room, so the zoom should be exactly MIN_ZOOM.`);
      assert.ok(Number.isFinite(got.x) && Number.isFinite(got.y), `A window ${width} by ${height} should still give a viewport.`);
    }
  });

  test('`isDrawn` and `notDrawnText` say which kinds a plane draws, and how the card begins', () => {
    for (const kind of ['GeneralView', 'InterconnectionView', 'ActionFlowView', 'StateTransitionView']) assert.equal(isDrawn(lib, kind), true, `A plane should draw a ${kind}.`);
    for (const kind of ['SequenceView', 'GeometryView', 'GridView', 'BrowserView', 'NoSuchView']) assert.equal(isDrawn(lib, kind), false, `A plane should not draw a ${kind}.`);
    assert.equal(notDrawnText(lib, 'SequenceView'), 'A sequence view is not drawn yet.', 'The card of a sequence view should say so, as the old page does.');
    assert.ok(notDrawnText(lib, 'ActionFlowView').startsWith('An '), 'The card of an action flow view should begin with An.');
    assert.equal(markerId('m-general'), 'grasp-m-general', 'A marker\'s id should be grasp- and its name.');
  });
});
