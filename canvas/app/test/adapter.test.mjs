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
// A compartment's rows are wrapped by Roboto's real widths under LOOK (plan/notes.md, session 21, "The outline: a
// compartment's rows wrapped by the font's own widths"; rule 2 of project()'s comment), and by the old page's counts of
// characters under OLD_LOOK. The tests of the first rule work out what they expect with textWidth() and with literal
// rows worked out by hand beforehand; none is taken from the adapter's own output.
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
  LOOK, OLD_LOOK, ROW_LEAST, rowRoom, textWidth, robotoHas, ROBOTO_EM, ROBOTO_UNKNOWN, MIN_ZOOM, FIT_PAD, FIT_BAND, BOX_SHAPES, BORDER_SHAPES, SHAPES, HANDLES,
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

/**
 * The rows of the example's Page and Host docs by Roboto's widths, worked out beforehand by a greedy wrap of a scratch
 * script with textWidth(), a word at a time: Page in a room of 736 px (760 less 24), Host in 344 (368 less 24). Page's
 * first row is 734.67 px wide, 1.33 under its room.
 */
const PAGE_ROWS = [
  'A page with Stronghold on it: a SharePoint Server page, a SharePoint Online page, a Teams tab, or the dev page. Every Stronghold web part',
  'on the page mounts the same app, because the first entry file to load wins (app/src/host/load-app.ts).',
];
const HOST_ROWS = [
  'hosts/: the small piece of code that plugs the app into one',
  'place. It works out where its package\'s files are, loads the entry',
  'file with the shared loader, and calls mount. It has no settings: it',
  'only ever loads the app from its own package.',
];

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
    // Host: 40 for the header, and its doc, which Roboto's widths wrap to 4 rows in the 344 px of its 368 (not the old
    // page's 5): a title row of 16, 4 rows of 15, 6 below, 122, under its saved 130.
    assert.equal(nodes.get('Host').data.compartments[0].lines.length, 4, 'Host\'s doc should be 4 rows at 344 px.');
    assert.deepEqual([nodes.get('Host').width, nodes.get('Host').height], [368, Math.max(130, 40 + 16 + 4 * 15 + 6)], 'Host should be 368 by 130: its 122 under its saved 130.');
    // A box whose rows decide its height: 80 wide (a room of 56) and 40 high, a doc of 3 rows by Roboto's widths
    // ('one two' 42.6 px, 'six ten' 35.0, 'four five' 43.9; 'one two six' is 66 and does not fit), as against the old
    // page's 3 other rows of 12 characters ('one two six', 'ten four', 'five'): 40 + 16 + 3 * 15 + 6 = 107, where the
    // old measures give 40 + 18 + 3 * 15 + 6 = 109.
    const { model: rowsModel, view: rowsView } = hand(
      [{ id: 'R', kind: 'PartDefinition', name: 'R', doc: 'one two six ten four five' }],
      [],
      { R: { x: 0, y: 0, w: 80, h: 40 } },
    );
    const rowsBox = nodesById(project(lib, rowsModel, rowsView)).get('R');
    same(rowsBox.data.compartments, [{ head: 'doc', lines: ['one two', 'six ten', 'four five'] }], 'R\'s doc should be 3 rows by Roboto\'s widths.');
    assert.deepEqual([rowsBox.width, rowsBox.height], [80, 107], 'R should be 80 by 107: its header, a title row of 16, 3 rows of 15 and 6 below.');
    const oldBox = nodesById(project(lib, rowsModel, rowsView, { look: OLD_LOOK })).get('R');
    same(oldBox.data.compartments, [{ head: 'doc', lines: ['one two six', 'ten four', 'five'] }], 'Given the old measures R\'s doc should be wrapped to 12 characters.');
    assert.equal(oldBox.height, 109, 'Given the old measures R should be 109 high.');
    // Page: its doc is 2 rows now and ends at 92, and what it holds needs 226, under its saved 250.
    assert.deepEqual([nodes.get('Page').width, nodes.get('Page').height], [760, 250], 'Page should keep its saved 760 by 250.');
    // A box with neither compartment nor box inside it keeps its saved size; a port inside it makes no room.
    assert.deepEqual([nodes.get('Page.app').width, nodes.get('Page.app').height], [180, 110], 'Page.app has no doc and no box inside it, so it should keep its saved 180 by 110.');
    assert.deepEqual([nodes.get('StrongholdApp').width, nodes.get('StrongholdApp').height], [368, 100], 'StrongholdApp should keep its saved size: its doc is one row now, and ends at 77.');
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
    // By Roboto's widths: the room is the saved 220 less a pad at each side, 196 px, not the grown 492 less 24.
    const room = 220 - 2 * LOOK.pad;
    assert.equal(rowRoom(LOOK, 220), room, 'The room of a box 220 wide should be 196.');
    const rows = box.data.compartments[0].lines;
    assert.equal(rows.join(' '), doc, 'The rows should hold the doc, word for word.');
    assert.ok(rows.length > 1, 'The doc should need more than one row at 196 px.');
    rows.forEach((row, i) => {
      assert.ok(textWidth(row, LOOK.rowType) <= room, `Row ${i + 1}, "${row}", is ${textWidth(row, LOOK.rowType).toFixed(1)} px wide; the saved width of 220 holds ${room}.`);
      if (i + 1 < rows.length) {
        const taken = `${row} ${rows[i + 1].split(' ')[0]}`;
        assert.ok(textWidth(taken, LOOK.rowType) > room, `Row ${i + 1}, "${row}", should have taken the next word: the rows are wrapped to ${room} px, the saved width's room.`);
      }
    });
  });

  // ---- A compartment's rows by the font's own widths (plan/notes.md, session 21; rule 2 of project()).

  /** The width of a row of text in the page's Roboto, at the size LOOK gives a row's text. */
  const widthOf = (text) => textWidth(text, LOOK.rowType);
  const wordsIn = (text) => String(text).split(/\s+/).filter(Boolean);

  /**
   * Checks a compartment's rows against the three properties of rule 2, a paragraph (a line of the text) at a time, in
   * a room `room` px wide: a row of two or more words is no wider than the room; a row that another row of its
   * paragraph follows could not have taken that row's first word; the rows, joined, are the paragraph's words in order.
   * A blank line is an empty row, the blank lines at the end are dropped. Returns how many rows it checked, and how
   * many of those were followed by a row of their paragraph.
   */
  function checkRows(text, rows, room, where) {
    let at = 0;
    let checked = 0;
    let followed = 0;
    const paragraphs = String(text).replace(/\r\n?/g, '\n').split('\n');
    while (paragraphs.length && paragraphs[paragraphs.length - 1].trim() === '') paragraphs.pop();
    for (const [number, paragraph] of paragraphs.entries()) {
      const words = wordsIn(paragraph);
      const here = `${where}, line ${number + 1} of the text`;
      if (words.length === 0) {
        assert.equal(rows[at], '', `${here}: a blank line should be an empty row, not ${JSON.stringify(rows[at])}.`);
        at += 1;
        continue;
      }
      const mine = [];
      let taken = 0;
      while (taken < words.length) {
        const row = rows[at + mine.length];
        assert.ok(row !== undefined && row !== '', `${here}: the rows run out, or are blank, before the words ${JSON.stringify(words.slice(taken).join(' '))}.`);
        const rowWords = wordsIn(row);
        assert.equal(row, rowWords.join(' '), `${here}: the row ${JSON.stringify(row)} should have its words one space apart.`);
        assert.deepEqual(rowWords, words.slice(taken, taken + rowWords.length), `${here}: the row ${JSON.stringify(row)} should hold the next words of the paragraph, in order.`);
        mine.push(row);
        taken += rowWords.length;
      }
      at += mine.length;
      mine.forEach((row, i) => {
        checked += 1;
        if (wordsIn(row).length >= 2) {
          assert.ok(widthOf(row) <= room, `${here}: the row ${JSON.stringify(row)} is ${widthOf(row).toFixed(2)} px wide and has two words or more; its room is ${room}.`);
        }
        if (i + 1 < mine.length) {
          followed += 1;
          const first = mine[i + 1].split(' ')[0];
          assert.ok(widthOf(`${row} ${first}`) > room, `${here}: the row ${JSON.stringify(row)} should have taken ${JSON.stringify(first)}: it is ${widthOf(`${row} ${first}`).toFixed(2)} px wide with it, and the room is ${room}.`);
        }
      });
    }
    assert.equal(at, rows.length, `${where}: there are ${rows.length - at} more rows than the text's lines need.`);
    return { checked, followed };
  }

  test('a compartment\'s rows are as long as the box\'s saved width allows, by Roboto\'s widths', () => {
    let boxes = 0;
    let checked = 0;
    let followed = 0;
    const seen = new Set();
    for (const { label, model, view } of GRAPH_VIEWS) {
      const projection = project(lib, model, view);
      const ids = idsOf(model);
      for (const node of projection.nodes) {
        const compartments = node.data.compartments ?? [];
        if (compartments.length === 0) continue;
        const el = ids.get(node.id);
        const saved = view.layout[node.id].w;
        const room = Math.max(56, saved - 24);
        assert.equal(rowRoom(LOOK, saved), room, `${label}: the room of ${node.id}, saved ${saved} wide, should be ${room}.`);
        boxes += 1;
        for (const compartment of compartments) {
          seen.add(compartment.head);
          let text;
          if (compartment.head === 'doc') text = el.doc;
          else if (compartment.head === 'send' || compartment.head === 'accept') {
            const target = String(el.target ?? '').trim();
            const word = compartment.head === 'accept' ? 'via' : lib.sendWord(model, target);
            text = String(el.payload ?? '').trim() + (target ? ` ${word} ${target}` : '');
          } else continue;
          const got = checkRows(text, compartment.lines, room, `${label}: the ${compartment.head} of ${node.id} (saved ${saved} wide)`);
          checked += got.checked;
          followed += got.followed;
        }
      }
    }
    assert.ok(boxes >= 20, `The eleven views should hold many boxes with a compartment; only ${boxes} do.`);
    assert.ok(checked >= 20 && followed >= 5, `The rows checked (${checked}, ${followed} followed by another of their paragraph) are too few to show the rule.`);
    assert.ok(seen.has('doc') && seen.has('send') && seen.has('accept'), `The views should hold a doc, a send and an accept compartment; they hold ${[...seen].join(', ')}.`);

    // The example's two docs, as literal rows worked out beforehand with textWidth() by a greedy wrap of a scratch
    // script: Host in 344 px, Page in 736.
    const nodes = nodesById(project(lib, EXAMPLE_MODEL, viewOf(EXAMPLE_MODEL, 'v-proof')));
    same(nodes.get('Page').data.compartments[0].lines, PAGE_ROWS, 'Page\'s doc should be these 2 rows.');
    same(nodes.get('Host').data.compartments[0].lines, HOST_ROWS, 'Host\'s doc should be these 4 rows.');
  });

  test('a word wider than its box stands on a row by itself, a blank line is an empty row, and the room is never under 56', () => {
    const long = 'supercalifragilisticexpialidocious';
    const { model, view } = hand(
      [
        // 120 wide: a room of 96. The long word is 175 px, and rows around it do not take it, nor it them.
        { id: 'A', kind: 'PartDefinition', name: 'A', doc: `go ${long} on` },
        // A blank line in the middle is an empty row; blank lines at the end are dropped.
        { id: 'B', kind: 'PartDefinition', name: 'B', doc: 'one\n\ntwo\n\n\n' },
        // 60 wide: a room of 56, not 36. At 36 px the doc would be 4 rows; at 56, 3.
        { id: 'C', kind: 'PartDefinition', name: 'C', doc: 'an ox is in it, so go on' },
        // 20 wide: the room is 56 all the same.
        { id: 'D', kind: 'PartDefinition', name: 'D', doc: 'an ox is in it, so go on' },
        // A doc of blank lines only has no compartment.
        { id: 'E', kind: 'PartDefinition', name: 'E', doc: '\n \n' },
      ],
      [],
      { A: { x: 0, y: 0, w: 120, h: 40 }, B: { x: 200, y: 0, w: 120, h: 40 }, C: { x: 400, y: 0, w: 60, h: 40 }, D: { x: 600, y: 0, w: 20, h: 40 }, E: { x: 800, y: 0, w: 120, h: 40 } },
    );
    // The library's normalize holds a saved width to 80 at least; a file edited by hand may say less, and the adapter
    // reads the layout as it stands, so the narrow widths are put in after the model is made.
    view.layout.C.w = 60;
    view.layout.D.w = 20;
    assert.equal(ROW_LEAST, 56, 'The least room of a row should be 56.');
    assert.equal(rowRoom(LOOK, 120), 96, 'A box 120 wide should have a room of 96.');
    assert.equal(rowRoom(LOOK, 60), 56, 'A box 60 wide should have a room of 56, not 36.');
    assert.equal(rowRoom(LOOK, 20), 56, 'A box 20 wide should have a room of 56.');
    assert.equal(rowRoom(LOOK, 80), 56, 'A box 80 wide should have a room of 56.');
    assert.equal(rowRoom(LOOK, 81), 57, 'A box 81 wide should have a room of 57.');
    assert.ok(widthOf(long) > 96, `The word should be wider than 96 px; it is ${widthOf(long).toFixed(1)}.`);
    const nodes = nodesById(project(lib, model, view));
    same(nodes.get('A').data.compartments, [{ head: 'doc', lines: ['go', long, 'on'] }], 'A word wider than its room should stand on a row by itself, and the words around it on rows of their own.');
    same(nodes.get('B').data.compartments, [{ head: 'doc', lines: ['one', '', 'two'] }], 'A blank line should be an empty row, and blank lines at the end should be dropped.');
    assert.equal(nodes.get('B').height, 40 + (LOOK.head + 3 * LOOK.lead + LOOK.tail) , 'B should be as high as its header and a compartment of 3 rows, the empty row counted.');
    const three = ['an ox is in', 'it, so go', 'on'];
    // 'an ox is in' is 53.5 px, 'an ox is in it,' would not fit 56; at a room of 36 it would be 'an ox', 'is in it,', ...
    assert.ok(widthOf('an ox is in') <= 56 && widthOf('an ox is in') > 36, 'The first row should fit 56 px and not 36.');
    same(nodes.get('C').data.compartments, [{ head: 'doc', lines: three }], 'A box 60 wide should wrap its rows to 56 px, not 36.');
    same(nodes.get('D').data.compartments, [{ head: 'doc', lines: three }], 'A box 20 wide should wrap its rows to 56 px.');
    assert.equal(nodes.get('C').height, 40 + (LOOK.head + 3 * LOOK.lead + LOOK.tail), 'C should be as high as its header and a compartment of 3 rows.');
    assert.deepEqual([nodes.get('C').width, nodes.get('D').width], [60, 20], 'The boxes keep their saved widths: the least room is a rule of wrapping, not of size.');
    same(nodes.get('E').data.compartments, [], 'A doc of blank lines should make no compartment.');
  });

  test('a character the font does not draw counts one em', () => {
    // 日本語 is not in Roboto's Latin file: each character is LOOK.rowType px wide (an em at that size).
    assert.ok(![...'日本語'].some(robotoHas), 'The font should draw none of 日本語.');
    assert.equal(LOOK.rowType, 12, 'A row\'s text is 12 px.');
    assert.equal(widthOf('日本語'), 36, 'Three characters the font does not draw should be 36 px wide at 12.');
    const space = widthOf(' ');
    // 120 wide: a room of 96. Two 36 px words and a space are 74.98 px; three would be 113.95.
    const { model, view } = hand(
      [
        { id: 'K', kind: 'PartDefinition', name: 'K', doc: '日本語 日本語 日本語 日本語 日本語' },
        { id: 'L', kind: 'PartDefinition', name: 'L', doc: '日本語日本語 日 日 日本語' },
        // A send whose payload and target wrap by the same rule, at 120 wide: 12 px for each character, 36 per word.
        { id: 'S', kind: 'ActionUsage', name: 'S', actionKind: 'send', payload: '日本語 日本語', target: '日本語' },
      ],
      [],
      { K: { x: 0, y: 0, w: 120, h: 40 }, L: { x: 200, y: 0, w: 120, h: 40 }, S: { x: 400, y: 0, w: 120, h: 40 } },
    );
    near(widthOf('日本語 日本語'), 2 * 36 + space, 1e-9, 'Two words of 日本語 and a space');
    assert.ok(widthOf('日本語 日本語') <= 96 && widthOf('日本語 日本語 日本語') > 96, 'Two such words should fit 96 px and three not.');
    const nodes = nodesById(project(lib, model, view));
    same(nodes.get('K').data.compartments, [{ head: 'doc', lines: ['日本語 日本語', '日本語 日本語', '日本語'] }], 'Each character the font does not draw should count 12 px, so two words of three fit a row.');
    // 日本語日本語 is 72 px, and with a space and 日 86.98; one more 日 would be 101.95.
    same(nodes.get('L').data.compartments, [{ head: 'doc', lines: ['日本語日本語 日', '日 日本語'] }], 'A word of six such characters, a space and one more fit 96 px; a seventh does not.');
    // 'to' is two letters of the font: the send says "日本語 日本語 to 日本語".
    const to = widthOf('日本語 日本語 to');
    assert.ok(to <= 96 && widthOf('日本語 日本語 to 日本語') > 96, 'The send should wrap after "to": its first row is under 96 px and the whole is not.');
    same(nodes.get('S').data.compartments, [{ head: 'send', lines: ['日本語 日本語 to', '日本語'] }], 'A send\'s payload and target should wrap by the same rule.');
    assert.equal(ROBOTO_UNKNOWN, ROBOTO_EM, 'A character the font has no glyph for should count one em.');
  });

  test('a code link too wide for its box keeps the longest tail that fits behind an ellipsis', () => {
    const whole = 'a/b.ts';
    const cut = 'src/components/very/long/path/main.ts';
    const { model, view } = hand(
      [
        { id: 'X', kind: 'PartDefinition', name: 'X', code: [{ path: whole, language: 'typescript', text: '' }, { path: cut, language: 'typescript', text: '' }] },
        { id: 'Y', kind: 'PartDefinition', name: 'Y', code: [{ path: 'MMMMMWWWW', language: 'typescript', text: '' }] },
      ],
      [],
      { X: { x: 0, y: 0, w: 120, h: 40 }, Y: { x: 400, y: 0, w: 60, h: 40 } },
    );
    // 120 wide: a room of 96. 'a/b.ts' is 31.5 px, so it is whole; the long path is 217 px.
    assert.ok(widthOf(whole) <= 96, 'The short path should fit 96 px.');
    assert.ok(widthOf(cut) > 96, 'The long path should be wider than 96 px.');
    const got = nodesById(project(lib, model, view)).get('X').data.compartments;
    same(got.map((c) => c.head), ['code'], 'A box with code links and no doc should have a code compartment only.');
    const [shortRow, longRow] = got[0].lines;
    assert.equal(shortRow, whole, 'A path that fits should be a row whole, with no ellipsis.');
    // '…' and the longest tail of the path that fits, by hand: '…ng/path/main.ts' is 94.97 px, '…ong/path/main.ts' 101.8.
    assert.equal(longRow, '…ng/path/main.ts', 'A path too wide should be an ellipsis and the longest tail that fits.');
    assert.ok(widthOf(longRow) <= 96, 'The cut path should fit 96 px.');
    assert.ok(widthOf('…' + cut.slice(cut.length - longRow.length + 1 - 1)) > 96, 'One more character of the tail should not fit.');
    assert.equal(got[0].lines.length, 2, 'A code link is one row, never wrapped.');
    // The least: so narrow that not even '…' and two characters fit. Here the row's text is 36 px, so that '…W' is
    // 56.02 px and the room 56 (the least, as for any box up to 80 wide): '…' and the path's last character remain, whatever the room.
    const big = { ...LOOK, rowType: 36 };
    assert.ok(textWidth('…W', 36) > rowRoom(big, 60), 'An ellipsis and one W should be wider than the room, or the test shows nothing.');
    const narrow = nodesById(project(lib, model, view, { look: big })).get('Y').data.compartments;
    same(narrow, [{ head: 'code', lines: ['…W'] }], 'A path no tail of which fits should keep an ellipsis and its last character.');
  });

  test('textWidth is the sum of the font\'s widths', () => {
    assert.equal(textWidth('i', 2048), 498, 'An i is 498 units of 2048 to an em.');
    assert.equal(textWidth('', 12), 0, 'An empty string is 0 px wide.');
    assert.equal(textWidth('il', 2048), 996, 'An i and an l are 498 units each.');
    const text = 'Hello, World! (app/src/host/load-app.ts)';
    const sum = [...text].reduce((total, ch) => total + textWidth(ch, 12), 0);
    near(textWidth(text, 12), sum, 1e-9, 'A string should be as wide as its characters together');
    near(textWidth(text, 24), 2 * textWidth(text, 12), 1e-9, 'The width should grow with the size');
    assert.equal(textWidth('日', 12), 12, 'A character the font does not draw should be an em wide: 12 px at 12.');
    assert.equal(textWidth('日', 2048), ROBOTO_EM, 'An em is 2048 units.');
    assert.equal(robotoHas('a'), true, 'The font should draw an a.');
    assert.equal(robotoHas('日'), false, 'The font should not draw 日.');
    assert.ok(textWidth(' ', 2048) > 0, 'A space has a width.');
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
    const hostEl = EXAMPLE_MODEL.elements.find((el) => el.id === 'Host');

    // Host: an abstract part def, its doc in a room of 344 px (368 less a pad at each side), by Roboto's widths.
    const host = nodes.get('Host');
    assert.equal(host.type, 'rect', 'A part def should be a rect.');
    same(host.data, box('«abstract part def»', 'Host', [{ head: 'doc', lines: HOST_ROWS }]), 'Host should say «abstract part def», Host, and its doc in 4 rows.');
    assert.ok(host.data.compartments[0].lines.every((line) => textWidth(line, LOOK.rowType) <= 344), 'Host\'s rows should be at most 344 px wide.');
    assert.equal(host.data.compartments[0].lines.join(' '), hostEl.doc.split(/\s+/).join(' '), 'Host\'s rows, joined by spaces, should give its doc\'s words.');
    assert.deepEqual(wordsOf(host).sort(), ['abstract', 'def'], 'Host\'s className should be def and abstract.');

    const page = nodes.get('Page');
    assert.equal(page.type, 'rect', 'A part def should be a rect.');
    assert.equal(page.data.keyword, '«part def»', 'Page should say «part def».');
    assert.equal(page.data.name, 'Page', 'Page should say Page.');
    assert.equal(page.data.compartments.length, 1, 'Page should have one compartment.');
    assert.equal(page.data.compartments[0].head, 'doc', 'Page\'s compartment should be its doc.');
    same(page.data.compartments[0].lines, PAGE_ROWS, 'Page\'s doc should be 2 rows of at most 736 px (760 less a pad at each side), by Roboto\'s widths.');
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
    // has its compartment (129-137) and its mark. The rows are wrapped by Roboto's widths to the width less 24: 146 px at
    // 170, 126 at 150. A compartment is 16 + 15 per row + 6 under the header's 40.
    const actions = fileNamed('behavior-actions.json');
    const flow = project(lib, actions, viewOf(actions, 'v-release'));
    expectNode(flow, 'Release.compile', {
      type: 'action', parent: 'Release', position: { x: 90, y: 108 }, size: [150, 40 + 16 + 2 * 15 + 6],
      data: box('«action»', 'compile', [{ head: 'doc', lines: ['webpack 5 and', 'TypeScript 5.9.'] }]), words: ['usage'],
    });
    expectNode(flow, 'Release.test', { type: 'action', parent: 'Release', position: { x: 410, y: 92 }, size: [150, 56], data: box('«action»', 'test', []) });
    // 'new Warning() to maintainer' (151.2 px), for maintainer is no port of this model (sendWord): two rows, the room being 146.
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
      data: box('«entry action»', 'fetchEntry', [{ head: 'doc', lines: ['Loads the entry file with the', 'shared loader.'] }]),
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

    // Where the OLD PAGE'S limits bite, in a model made by hand and given OLD_LOOK, which counts characters (the new
    // rule's limits are those of the tests of the font's widths below). A box is wrapped to its saved width: at 80 wide
    // a doc's rows hold at least 12 characters (layout.js 12-24, drawing.js 163-165), a send's at least 10, and a code
    // link is cut to at least 8, with an ellipsis in front (fitPath).
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
    const made = nodesById(project(lib, model, view, { look: OLD_LOOK }));
    same(made.get('C').data.compartments, [
      { head: 'doc', lines: ['aaaa bbbb', 'cccc dddd'] },
      { head: 'code', lines: ['…main.ts', 'a/b/c.ts'] },
    ], 'At 80 wide a doc wraps to 12 characters and a code path is cut to 8, its end kept after an ellipsis.');
    assert.equal(made.get('C').height, 40 + (OLD_LOOK.head + 2 * 15 + 6) + (OLD_LOOK.head + 2 * 15 + 6), 'C should be as high as its header and two compartments of two rows.');
    same(made.get('N').data.compartments, [{ head: 'doc', lines: ['one', '', 'two'] }], 'A blank line of a doc should be a row.');
    same(made.get('S1').data.compartments, [{ head: 'send', lines: ['aaaa bbbb', 'cccc'] }], 'At 80 wide a send\'s rows hold 10 characters.');
    same(made.get('S2').data.compartments, [
      { head: 'doc', lines: ['Says go.'] },
      { head: 'send', lines: ['go via gate'] },
      { head: 'code', lines: ['a/b/c.ts'] },
    ], 'Compartments should come in the order doc, send, code, and a send to a port should go via it.');
    assert.equal(made.get('S2').height, 40 + 3 * (OLD_LOOK.head + 15 + 6), 'S2 should be as high as its header and three compartments of one row.');
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
    // The margins follow the window (a twelfth of its smaller side under 48), so only a window with no side at all, or
    // one so small that its room's zoom is under MIN_ZOOM, has no room.
    for (const [width, height] of [[0, 828], [1336, 0], [10, 10], [20, 20], [0, 0]]) {
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

// ---- Gestures (step 7): placesFor, and project() with `places`.
//
// placesFor's comment (canvas/app/src/core/adapter.ts) has seven rules. Each expected number below is worked out by hand
// from a rule and from the example's places (view v-proof: Page at 32, 72, 760 by 250, holding Page.hosts at 96, 104 and
// Page.app at 568, 104, each 180 by 110; Host at 32, 400, 368 by 130, with Host.api on its right at 0.5), never taken
// from what the adapter gives.

describe("placesFor: a gesture's places", () => {
  const { placesFor } = core;
  const VIEW = 'v-proof';
  const exampleView = () => viewOf(EXAMPLE_MODEL, VIEW);
  const exampleProjection = () => project(lib, EXAMPLE_MODEL, exampleView());
  /** What placesFor says of `asks` on the example's v-proof. */
  const ask = (asks) => placesFor(lib, EXAMPLE_MODEL, exampleView(), exampleProjection(), asks);
  const move = (id, x, y) => ({ id, move: { x, y } });
  const resize = (id, x, y, width, height) => ({ id, resize: { x, y, width, height } });
  const placesOf = (placed) => plain(Object.fromEntries(placed.places));

  /**
   * Host's doc, as rows by Roboto's widths worked out beforehand with a greedy wrap of a scratch script with textWidth(),
   * a word at a time: in 200 wide (room 176) it is 8 rows, and in 100 wide (room 76) 21. A box's rows are wrapped to the
   * width it is given, so a Host 200 wide is 40 (header) + 16 (head) + 15 * 8 + 6 (tail) = 182 high, and one 100 wide
   * 40 + 16 + 15 * 21 + 6 = 377. The first test below checks these rows against textWidth() again, so a slip in them
   * shows as that test failing, not as a resize test failing.
   */
  const HOST_AT_200 = [
    'hosts/: the small piece of code', 'that plugs the app into one', 'place. It works out where its', "package's files are, loads the",
    'entry file with the shared loader,', 'and calls mount. It has no', 'settings: it only ever loads the', 'app from its own package.',
  ];
  const HOST_AT_100 = [
    'hosts/: the', 'small piece of', 'code that', 'plugs the app', 'into one', 'place. It', 'works out', 'where its', "package's", 'files are,', 'loads the',
    'entry file with', 'the shared', 'loader, and', 'calls mount. It', 'has no', 'settings: it', 'only ever', 'loads the app', 'from its own', 'package.',
  ];

  /** Checks the rows above against textWidth() again, so a slip in them is told as such, not as a resize's failure. */
  function checkRows() {
    const doc = EXAMPLE_MODEL.elements.find((el) => el.id === 'Host').doc;
    for (const [width, rows] of [[200, HOST_AT_200], [100, HOST_AT_100]]) {
      const room = rowRoom(LOOK, width);
      assert.equal(rows.join(' '), doc, `The rows for ${width} wide should hold Host's doc, word for word.`);
      rows.forEach((row, i) => {
        assert.ok(textWidth(row, LOOK.rowType) <= room, `The test's row "${row}" is wider than ${room} px: the test's own rows are wrong.`);
        if (i + 1 < rows.length) assert.ok(textWidth(`${row} ${rows[i + 1].split(' ')[0]}`, LOOK.rowType) > room, `The test's row "${row}" should have taken the next word: the test's own rows are wrong.`);
      });
    }
    assert.equal(LOOK.header + LOOK.head + LOOK.lead * HOST_AT_200.length + LOOK.tail, 182, 'The test\'s height for Host 200 wide is wrong.');
    assert.equal(LOOK.header + LOOK.head + LOOK.lead * HOST_AT_100.length + LOOK.tail, 377, 'The test\'s height for Host 100 wide is wrong.');
  }

  test('rule 1: a box moved takes its position, rounded, and keeps its size', () => {
    const placed = ask([move('Host', 100, 450)]);
    same(placesOf(placed), { Host: { x: 100, y: 450, w: 368, h: 130 } }, 'Host moved to 100, 450 should be placed there at its own 368 by 130, and nothing else placed.');
    assert.equal(placed.words, 'Moved part def Host', 'One box moved should be written as "Moved part def Host".');
    same(placesOf(ask([move('Host', 100.4, 449.6)])), { Host: { x: 100, y: 450, w: 368, h: 130 } }, '100.4, 449.6 should be rounded to 100, 450.');
    same(placesOf(ask([move('Host', 99.5, 450.49)])), { Host: { x: 100, y: 450, w: 368, h: 130 } }, '99.5, 450.49 should be rounded to 100, 450.');
  });

  test('rule 1: inside its owner a box never goes left of 12 or above 48, and its owner grows to hold it', () => {
    // Page.hosts moved to -50, -50: x = max(pad 12, -50) = 12, y = max(childTop 48, -50) = 48. Its size stays 180 by 110.
    const hosts = ask([move('Page.hosts', -50, -50)]);
    same(placesOf(hosts), { 'Page.hosts': { x: 12, y: 48, w: 180, h: 110 } }, 'Page.hosts moved to -50, -50 should be held at 12, 48.');
    assert.equal(hosts.words, 'Moved part hosts in Page', 'Its words should be the library\'s for the part.');
    same(placesOf(ask([move('Page.hosts', 12, 48)])), { 'Page.hosts': { x: 12, y: 48, w: 180, h: 110 } }, '12, 48 is on the limit and should be kept.');
    same(placesOf(ask([move('Page.hosts', 11, 47)])), { 'Page.hosts': { x: 12, y: 48, w: 180, h: 110 } }, '11, 47 is past the limit and should be held at 12, 48.');

    // Page.app moved to 700, 104: its place is that; Page is not placed, and grows to 700 + 180 + pad 12 = 892 wide.
    const app = ask([move('Page.app', 700, 104)]);
    same(placesOf(app), { 'Page.app': { x: 700, y: 104, w: 180, h: 110 } }, 'Page.app moved to 700, 104 should be placed there; Page is not placed.');
    assert.ok(!app.places.has('Page'), 'Page\'s saved width must not be written: the owner grows by project()\'s rule 2.');
    const drawn = project(lib, EXAMPLE_MODEL, exampleView(), { places: app.places });
    assert.equal(nodesById(drawn).get('Page').width, 700 + 180 + LOOK.pad, 'Projected with the place, Page should be 700 + 180 + 12 = 892 wide.');
    assert.equal(nodesById(drawn).get('Page.app').position.x, 700, 'Projected with the place, Page.app should be at x 700.');
    assert.equal(exampleView().layout.Page.w, 760, 'Nothing should be written to the model: Page keeps its saved 760.');
  });

  test('rule 2: a port moved goes to its owner\'s nearest border, at the centre\'s fraction along it', () => {
    // Host is 368 by 130, the port's square 16: React Flow's position is the square's corner, so its centre is 8 more.
    // Just below the bottom right corner: the corner at 368, 130, centre 376, 138. Distances from the centre: top 138,
    // bottom 8, left 376, right 8. Bottom and right tie, and ties go in the order top, bottom, left, right: bottom.
    // The fraction along it, 376 / 368, is 1.02, clamped to 0.95.
    const below = ask([move('Host.api', 368, 130)]);
    same(placesOf(below), { 'Host.api': { side: 'bottom', at: 0.95 } }, 'A port just below the corner should go to the bottom at 0.95.');
    assert.equal(below.words, 'Moved port api in Host to the bottom side', 'Its words should say the side.');
    // The middle of the left side: centre 0, 65, so the corner at -8, 57. Left is 0 away, top and bottom 65: left, at 65 / 130 = 0.5.
    same(placesOf(ask([move('Host.api', -8, 57)])), { 'Host.api': { side: 'left', at: 0.5 } }, 'A port at the middle of the left side should be left at 0.5.');
    // A centre at 0.333 along the top: centre x 0.333 * 368 = 122.544, y 0, so the corner at 114.544, -8. Top is 0 away. 0.333 rounds to 0.33.
    same(placesOf(ask([move('Host.api', 0.333 * 368 - 8, -8)])), { 'Host.api': { side: 'top', at: 0.33 } }, 'A centre at 0.333 along the top should be at 0.33.');
    // Left of the top left corner: centre -20, -20, top and left tie at 20: top, at -20 / 368 clamped to 0.05.
    same(placesOf(ask([move('Host.api', -28, -28)])), { 'Host.api': { side: 'top', at: 0.05 } }, 'A centre left of the corner should be clamped to 0.05.');
    // Page.hosts is 180 by 110: a centre at 180, 22 is on its right line, 22 / 110 = 0.2; the corner is at 172, 14.
    same(placesOf(ask([move('Page.hosts.api', 172, 14)])), { 'Page.hosts.api': { side: 'right', at: 0.2 } }, 'A port of Page.hosts with its centre 22 down its right side should be right at 0.2.');
  });

  test('rule 3: a box asked with its owner is dropped, a port with its owner too', () => {
    const both = ask([move('Page', 50, 80), move('Page.hosts', 200, 200)]);
    same(placesOf(both), { Page: { x: 50, y: 80, w: 760, h: 250 } }, 'Page asked with Page.hosts should give Page\'s place only.');
    assert.equal(both.words, 'Moved part def Page', 'Only Page moved, so its words are Page\'s.');
    same(placesOf(ask([move('Page.hosts', 200, 200), move('Page', 50, 80)])), { Page: { x: 50, y: 80, w: 760, h: 250 } }, 'The order of the asks should not matter.');
    same(placesOf(ask([move('Host.api', 0, 0), move('Host', 100, 450)])), { Host: { x: 100, y: 450, w: 368, h: 130 } }, 'Host.api asked with Host should be dropped.');
    same(placesOf(ask([move('Page.hosts.api', 0, 0), move('Page', 50, 80)])), { Page: { x: 50, y: 80, w: 760, h: 250 } }, 'A port asked with its owner\'s owner should be dropped too.');
  });

  test('rule 4: a box resized by its bottom right takes its width, and its height holds its rows at that width', () => {
    checkRows();
    // Host 200 by 50 from its own corner: w 200. Its doc is 8 rows in 200 wide (HOST_AT_200): 182 high, not 50.
    const placed = ask([resize('Host', 32, 400, 200, 50)]);
    same(placesOf(placed), { Host: { x: 32, y: 400, w: 200, h: 182 } }, 'Host resized to 200 by 50 should be 200 wide and 182 high, its header and its 8 rows of doc.');
    assert.equal(placed.words, 'Resized part def Host', 'One box resized should be written as "Resized part def Host".');
    same(placesOf(ask([resize('Host', 32, 400, 200, 300)])), { Host: { x: 32, y: 400, w: 200, h: 300 } }, 'A height above what the rows need should be kept.');
    same(placesOf(ask([resize('Host', 32, 400, 200.4, 299.6)])), { Host: { x: 32, y: 400, w: 200, h: 300 } }, 'A resize should be rounded to whole numbers.');
  });

  test('rule 4: a box resized from its top left keeps its bottom right corner where the size is held', () => {
    checkRows();
    // Host before: 32, 400, 368 by 130, so its corner is 400, 530. Given 300, 500 and 100 by 30: w 100 is above the least
    // (80), and its doc is 21 rows in 100 wide (HOST_AT_100): h = 377, not 30. The corner is kept: x = 400 - 100 = 300,
    // y = 530 - 377 = 153.
    const placed = ask([resize('Host', 300, 500, 100, 30)]);
    same(placesOf(placed), { Host: { x: 300, y: 153, w: 100, h: 377 } }, 'Host resized from its top left to 300, 500 by 100 by 30 should keep the corner 400, 530: 100 by 377 at 300, 153.');
    assert.equal(placed.words, 'Resized part def Host', 'It is one box resized.');
    // A drag that holds nothing: the corner 400, 530 is where it was, and 360 by 230 needs no holding.
    same(placesOf(ask([resize('Host', 40, 300, 360, 230)])), { Host: { x: 40, y: 300, w: 360, h: 230 } }, 'A top left drag to 40, 300 making 360 by 230 needs no holding.');
  });

  test('rule 4: no box is smaller than its kind\'s least, and the side not dragged stays', () => {
    // A has no compartments: its least is the library's, 80 by 40 (BoxData.least), and its header 40.
    const { model, view } = hand([{ id: 'A', kind: 'PartDefinition', name: 'A' }], [], { A: { x: 10, y: 20, w: 200, h: 100 } });
    const projection = project(lib, model, view);
    same(nodesById(projection).get('A').data.least, { width: 80, height: 40 }, 'A part def\'s least should be 80 by 40, or this test is wrong.');
    const at = (asks) => plain(Object.fromEntries(placesFor(lib, model, view, projection, asks).places));
    // From the bottom right: 30 by 10 is held at 80 by 40, from the same corner.
    same(at([resize('A', 10, 20, 30, 10)]), { A: { x: 10, y: 20, w: 80, h: 40 } }, 'A resize to 30 by 10 should be held at 80 by 40 where it is.');
    // From the top left: the corner is 210, 120; given 50, 60 and 30 by 10, held at 80 by 40 with the corner kept: 130, 80.
    same(at([resize('A', 50, 60, 30, 10)]), { A: { x: 130, y: 80, w: 80, h: 40 } }, 'A resize from the top left to 30 by 10 should be held at 80 by 40 with the corner 210, 120 kept.');
    // From the top only: x as before, y 60, 10 high, held at 40 with the bottom 120 kept: y = 80.
    same(at([resize('A', 10, 60, 200, 10)]), { A: { x: 10, y: 80, w: 200, h: 40 } }, 'A resize from the top to 10 high should be held at 40 with the bottom 120 kept.');
    same(at([resize('A', 10, 20, 500, 10)]), { A: { x: 10, y: 20, w: 500, h: 40 } }, 'Only the side below the least should be held.');
  });

  test('rule 4: an owner is held to what it holds', () => {
    // Page resized to 100 by 100: Page.app is at 568, 104, 180 by 110, so wide enough for 568 + 180 + 12 = 760; and high
    // enough for the bottoms of its parts + 12: 104 + 110 + 12 = 226. Its doc is 2 rows in 760 wide (PAGE_ROWS): 40 + 16
    // + 30 + 6 = 92, under 226. Page keeps its corner, 32, 72.
    const placed = ask([resize('Page', 32, 72, 100, 100)]);
    same(placesOf(placed), { Page: { x: 32, y: 72, w: 760, h: 226 } }, 'Page resized to 100 by 100 should be held at 760 by 226 by what it holds.');
    assert.equal(placed.words, 'Resized part def Page', 'It is one box resized.');
  });

  test('rule 4: a box resized from its top or left leaves the boxes inside it where they were', () => {
    // Page is at 32, 72, 760 by 250 (its corner 792, 322), with Page.hosts at 96, 104 and Page.app at 568, 104 from its
    // corner, each 180 by 110. Its top left handle dragged 60 left and 40 up: Page is 820 by 290 at -28, 32, and each
    // part is placed 60 right and 40 down from the new corner, which is where it was on the plane.
    const start = exampleProjection();
    const grown = ask([resize('Page', -28, 32, 820, 290)]);
    same(placesOf(grown), {
      Page: { x: -28, y: 32, w: 820, h: 290 },
      'Page.hosts': { x: 156, y: 144, w: 180, h: 110 },
      'Page.app': { x: 628, y: 144, w: 180, h: 110 },
    }, 'Page resized from its top left by 60 and 40 should place its two parts 60 and 40 further from its corner.');
    assert.equal(grown.words, 'Resized part def Page', 'It is one box resized: the parts inside it are not counted.');
    const drawn = project(lib, EXAMPLE_MODEL, exampleView(), { places: grown.places });
    for (const id of ['Page.hosts', 'Page.hosts.api', 'Page.app', 'Page.app.api']) {
      same(plain(drawn.rects.get(id)), plain(start.rects.get(id)), `${id} should be drawn where it was on the plane after Page is resized from its top left.`);
    }
    // By the left side only, and by the top only: the parts are shifted along that axis alone.
    same(placesOf(ask([resize('Page', 2, 72, 790, 250)])), {
      Page: { x: 2, y: 72, w: 790, h: 250 }, 'Page.hosts': { x: 126, y: 104, w: 180, h: 110 }, 'Page.app': { x: 598, y: 104, w: 180, h: 110 },
    }, 'Page resized by its left side by 30 should place its parts 30 further right from its corner, at the same y.');
    same(placesOf(ask([resize('Page', 32, 32, 760, 290)])), {
      Page: { x: 32, y: 32, w: 760, h: 290 }, 'Page.hosts': { x: 96, y: 144, w: 180, h: 110 }, 'Page.app': { x: 568, y: 144, w: 180, h: 110 },
    }, 'Page resized by its top by 40 should place its parts 40 further down from its corner, at the same x.');
    // By the bottom right the corner stays, and so do the parts' places.
    assert.deepEqual([...ask([resize('Page', 32, 72, 900, 400)]).places.keys()], ['Page'], 'A resize by the bottom right should place the box alone.');
  });

  test('rule 4: a resize from the top or left stops where a box inside would pass 12 or 48', () => {
    // Page's top left handle dragged 200 right and 100 down. Page.hosts, the part furthest left and up, is 96, 104 from
    // the corner: the corner may come 96 - 12 = 84 right and 104 - 48 = 56 down, to 116, 128. Page's corner 792, 322 is
    // kept: 676 by 194. Page.hosts is then at 12, 48, and Page.app at 568 - 84, 104 - 56.
    const placed = ask([resize('Page', 232, 172, 560, 150)]);
    same(placesOf(placed), {
      Page: { x: 116, y: 128, w: 676, h: 194 },
      'Page.hosts': { x: 12, y: 48, w: 180, h: 110 },
      'Page.app': { x: 484, y: 48, w: 180, h: 110 },
    }, 'Page resized from its top left past its parts should stop with Page.hosts at 12, 48 from its corner.');
    const start = exampleProjection();
    const drawn = project(lib, EXAMPLE_MODEL, exampleView(), { places: placed.places });
    for (const id of ['Page.hosts', 'Page.app']) same(plain(drawn.rects.get(id)), plain(start.rects.get(id)), `${id} should be drawn where it was on the plane.`);
  });

  test('rule 4: no box is larger than 4000 a side', () => {
    same(placesOf(ask([resize('Host', 32, 400, 5000, 5000)])), { Host: { x: 32, y: 400, w: 4000, h: 4000 } }, 'A resize of 5000 by 5000 should be held at 4000 by 4000.');
    same(placesOf(ask([resize('Host', 32, 400, 4000, 4000)])), { Host: { x: 32, y: 400, w: 4000, h: 4000 } }, '4000 by 4000 is the limit and should be kept.');
  });

  test('rule 4: an owner drawn larger than 4000 keeps its far corner when resized from its top left', () => {
    // Session 25, from step 8's review. Page.app placed 5000 from Page's corner makes Page hold more than 4000 units:
    // Page is drawn 5000 + 180 + 12 = 5192 wide. Its top left handle dragged 40 left and 30 up asks 5232 by 280 at -8,
    // 42. A box is no larger than 4000 a side or than it is drawn, so Page's width stays 5192 and its right edge,
    // 32 + 5192 = 5224, is kept: x stays 32. Its height takes the 280 asked, so its top goes up 30 to 42, and its parts
    // are placed 30 further down from its corner, which is where they were on the plane.
    const model = plain(EXAMPLE_MODEL);
    const view = viewOf(model, VIEW);
    view.layout['Page.app'] = { ...view.layout['Page.app'], x: 5000 };
    const start = project(lib, model, view);
    assert.equal(nodesById(start).get('Page').width, 5000 + 180 + LOOK.pad, 'Page should be drawn 5192 wide to hold Page.app at 5000.');
    const placed = placesFor(lib, model, view, start, [resize('Page', -8, 42, 5232, 280)]);
    same(placesOf(placed), {
      Page: { x: 32, y: 42, w: 5192, h: 280 },
      'Page.hosts': { x: 96, y: 134, w: 180, h: 110 },
      'Page.app': { x: 5000, y: 134, w: 180, h: 110 },
    }, 'Page, drawn 5192 wide, resized from its top left should keep its right edge where it was and grow upward only.');
    const drawn = project(lib, model, view, { places: placed.places });
    for (const id of ['Page.hosts', 'Page.app']) same(plain(drawn.rects.get(id)), plain(start.rects.get(id)), `${id} should be drawn where it was on the plane.`);
  });

  test('rule 4: a box inside an owner is not resized to the left of 12 or above 48', () => {
    // Page.hosts resized from its top left to -20, 10 by 300 by 200: x = max(12, -20) = 12, y = max(48, 10) = 48. (Whether
    // the size shrinks to keep its right and bottom edges is not said by the contract; only the position is asserted.)
    const got = ask([resize('Page.hosts', -20, 10, 300, 200)]).places.get('Page.hosts');
    assert.ok(got, 'A resize past the owner\'s corner should still give a place.');
    assert.equal(got.x, 12, 'A top left drag past the owner\'s left should be held at x 12.');
    assert.equal(got.y, 48, 'A top left drag past the owner\'s top should be held at y 48.');
  });

  test('rule 5: a gesture that ends where it began gives no place; only asked nodes are placed', () => {
    const still = ask([move('Host', 32, 400)]);
    assert.equal(still.places.size, 0, 'Host moved to where it is should give no place.');
    assert.equal(still.words, null, 'A move to where it is should have no words.');
    const kept = ask([resize('Host', 32, 400, 368, 130)]);
    assert.equal(kept.places.size, 0, 'Host resized to its own size should give no place.');
    assert.equal(kept.words, null, 'A resize to its own size should have no words.');
    const port = ask([move('Host.api', 360, 57)]);
    assert.equal(port.places.size, 0, 'Host.api where it is (corner 360, 57: centre 368, 65 is the right side at 0.5) should give no place.');
    assert.equal(port.words, null, 'A port where it is should have no words.');

    const three = ask([move('Host', 100, 450), move('App', 700, 450), move('StrongholdApp', 840, 72)]);
    assert.deepEqual([...three.places.keys()].sort(), ['App', 'Host'], 'Only the asked nodes that differ from the view\'s own should be placed: StrongholdApp stayed.');
    assert.equal(three.words, 'Moved 2 elements', 'Two places that differ are "Moved 2 elements": the one that stayed is not counted.');
    assert.equal(ask([]).places.size, 0, 'No asks should give no places.');
    assert.equal(ask([]).words, null, 'No asks should give no words.');
  });

  test('rule 6: an unknown id, and a border item asked to resize, are left out', () => {
    const lost = ask([move('Nothing', 5, 5)]);
    assert.equal(lost.places.size, 0, 'A node the projection does not hold should be left out.');
    assert.equal(lost.words, null, 'Nothing placed should have no words.');
    const port = ask([resize('Host.api', 360, 57, 40, 40)]);
    assert.equal(port.places.size, 0, 'A border item asked to resize should be left out.');
    assert.equal(port.words, null, 'A border item asked to resize should leave no words.');
    const mixed = ask([move('Nothing', 5, 5), resize('Host.api', 0, 0, 40, 40), move('Host', 100, 450)]);
    same(placesOf(mixed), { Host: { x: 100, y: 450, w: 368, h: 130 } }, 'The asks that can be answered should be, beside those left out.');
    assert.equal(mixed.words, 'Moved part def Host', 'The words are those of the one place.');
  });

  test('rule 7: the words', () => {
    assert.equal(ask([move('Host', 100, 450), move('App', 700, 450), move('ServerHost', 32, 700)]).words, 'Moved 3 elements', 'Three boxes moved should be "Moved 3 elements".');
    assert.equal(ask([resize('Host', 32, 400, 200, 300)]).words, 'Resized part def Host', 'One box resized should be "Resized part def Host".');
    assert.equal(ask([resize('Host', 32, 400, 200, 300), resize('App', 600, 400, 300, 300), resize('ServerHost', 32, 620, 300, 300)]).words, 'Resized 3 elements', 'Three boxes resized should be "Resized 3 elements".');
    assert.equal(ask([move('Host', 100, 450), move('Host.api', 368, 130)]).words, 'Moved part def Host', 'A port asked with its owner is dropped, so one box is moved.');
    assert.equal(ask([move('Host.api', 368, 130), move('App.api', -8, 57)]).words, 'Moved 2 elements', 'Two ports moved should be "Moved 2 elements".');
  });

  // ---- A gesture's layout is the projection of the model its end writes.

  /** The projection of a copy of `model` whose view's layout holds `placed.places`: what a gesture's end writes. */
  function written(model, viewId, placed) {
    const copy = lib.normalize(plain(model));
    const view = viewOf(copy, viewId);
    for (const [id, place] of placed.places) {
      for (const key of Object.keys(place)) view.layout[id][key] = place[key];
    }
    return project(lib, copy, view);
  }
  function sameProjection(label, a, b) {
    assert.deepEqual(a.nodes.map((n) => n.id), b.nodes.map((n) => n.id), `${label}: the two projections should have the same nodes in the same order.`);
    for (let i = 0; i < a.nodes.length; i++) {
      const x = a.nodes[i];
      const y = b.nodes[i];
      assert.deepEqual([x.position.x, x.position.y], [y.position.x, y.position.y], `${label}: ${x.id}'s position should be what the written model gives.`);
      assert.deepEqual([x.width, x.height], [y.width, y.height], `${label}: ${x.id}'s size should be what the written model gives.`);
      assert.equal(x.parentId, y.parentId, `${label}: ${x.id}'s parent should be what the written model gives.`);
      same(x.data, y.data, `${label}: ${x.id}'s data should be what the written model gives.`);
    }
  }

  test("a gesture's step is drawn as the model its end writes would be", () => {
    const cases = [
      ['a nested box moved right, growing its owner', [move('Page.app', 700, 300)]],
      ['a nested box held at its owner\'s corner', [move('Page.hosts', 0, 0)]],
      ['a ground box moved', [move('Host', 150, 460)]],
      ['an owner moved', [move('Page', 90, 90)]],
      ['a port moved to another side', [move('Host.api', 368, 130)]],
      ['a nested box\'s port moved', [move('Page.hosts.api', 100, 20)]],
      ['a box resized by its bottom right', [resize('Host', 32, 400, 200, 50)]],
      ['a box resized from its top left', [resize('Host', 300, 500, 100, 30)]],
      ['an owner resized smaller than what it holds', [resize('Page', 32, 72, 100, 100)]],
      ['an owner resized larger', [resize('Page', 32, 72, 1000, 500)]],
      ['an owner resized from its top left', [resize('Page', -28, 32, 820, 290)]],
      ['an owner resized from its top left past what it holds', [resize('Page', 232, 172, 560, 150)]],
      ['a box resized beyond the limit', [resize('Host', 32, 400, 5000, 5000)]],
      ['three boxes moved', [move('Host', 100, 450), move('App', 700, 450), move('ServerHost', 32, 700)]],
      ['a move and a resize', [move('App', 700, 450), resize('Host', 32, 400, 250, 250)]],
    ];
    for (const [label, asks] of cases) {
      const placed = ask(asks);
      assert.ok(placed.places.size > 0, `${label}: the asks should change a place, or the case shows nothing.`);
      const drawn = project(lib, EXAMPLE_MODEL, exampleView(), { places: placed.places });
      sameProjection(label, drawn, written(EXAMPLE_MODEL, VIEW, placed));
    }
  });

  test('a step is projected from the places given and nothing is written to the model', () => {
    const before = JSON.stringify(EXAMPLE_MODEL);
    const placed = ask([move('Host', 150, 460), move('Host.api', 368, 130)]);
    const drawn = project(lib, EXAMPLE_MODEL, exampleView(), { places: placed.places });
    assert.equal(JSON.stringify(EXAMPLE_MODEL), before, 'placesFor and project() with places must write nothing to the model.');
    assert.deepEqual([nodesById(drawn).get('Host').position.x, nodesById(drawn).get('Host').position.y], [150, 460], 'The drawn Host should be at 150, 460.');
    assert.deepEqual(plain(nodesById(project(lib, EXAMPLE_MODEL, exampleView())).get('Host').position), { x: 32, y: 400 }, 'The view without places should still draw Host where it was saved.');
  });

  test('over the 5,000-element model: one box moved in each view is moved by exactly the delta', () => {
    const { model, views } = scaleModel();
    assert.equal(views.length, 3, 'The 5,000-element model should have three graph views.');
    for (const view of views) {
      const projection = project(lib, model, view);
      const box = projection.nodes.find((node) => node.parentId === undefined && node.data.form === 'box');
      const own = view.layout[box.id];
      const dx = 40;
      const dy = 24;
      const placed = placesFor(lib, model, view, projection, [move(box.id, box.position.x + dx, box.position.y + dy)]);
      same(placesOf(placed), { [box.id]: { x: own.x + dx, y: own.y + dy, w: own.w, h: own.h } }, `${view.id}: ${box.id} moved by ${dx}, ${dy} should be placed at its own place plus that, at its own size.`);
      assert.equal(placed.words, `Moved ${lib.describe(model, model.elements.find((el) => el.id === box.id))}`, `${view.id}: the words of one box moved.`);
      const drawn = project(lib, model, view, { places: placed.places, previous: projection });
      const before = nodesById(projection);
      assert.equal(drawn.nodes.length, projection.nodes.length, `${view.id}: no node should be added or lost by a move.`);
      for (const node of drawn.nodes) {
        const was = before.get(node.id);
        // A node's position is from its owner's corner, so only the moved box's own changes, by the delta.
        const expected = node.id === box.id ? { x: was.position.x + dx, y: was.position.y + dy } : { x: was.position.x, y: was.position.y };
        assert.deepEqual([node.position.x, node.position.y], [expected.x, expected.y], `${view.id}: ${node.id} should be at ${expected.x}, ${expected.y}.`);
        assert.deepEqual([node.width, node.height], [was.width, was.height], `${view.id}: ${node.id} should keep its size.`);
      }
    }
  });
});
