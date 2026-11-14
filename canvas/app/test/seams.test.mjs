// The seams of slice 2's scaffold, in the page (plan/slice-2.md, section 4; section 8, package 2-1). Each seam is what
// a later package builds against, so these tests hold the seams as those packages will use them, before any of them
// exists.
//
// Two kinds of page:
//   - The built page (canvas/dist), for what the scaffold changes there: who a node and an edge are in the document
//     (`data-of`), the label anchors (`data-label`), the card of a kind with no body, the middle button.
//   - A bench: a small page of the test's own, bundled here in memory and written to a temporary folder, never into
//     canvas/dist. It mounts views/ViewHost.tsx for a few views of the ten files, with stand-ins in place of the files
//     a later package fills ("the file as its package could build it", as loadCoreWith() of core.mjs does for the
//     core): a body drawn inside BodyFrame, a pin and a badge, a gesture for the grips. It loads the built page's
//     vendor.js and model-lib.js, and puts one object of its own on its window, BENCH, which stands in for the shell
//     (shell/Dock.tsx gives the hands and the keys their session in the built page). No test reads window.Grasp.
//
// What a test of another file needs too is in helpers.mjs: thingsIn, thingOf, cameraOf, toast, toastAfter,
// actionControl, rightClickOn, chooseAction, openNotes, pinOf, idle. What is here is this file's own: the bench, and what
// reads the shell's parts as only these tests do.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import { pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import { clock, loadCore, loadCoreWith, loadWith, readText, STAND_IN_ENTRIES, STAND_IN_NOTES, STAND_IN_PLANE_ACTIONS, STAND_IN_PLANE_READER } from './core.mjs';
import {
  actionControl, boxOf, byTestId, cameraOf, cardOf, chooseAction, closePages, DIST_URL, EDGE, EXAMPLE, finish, FIXTURES, frame, groundPoint, idle, isGraph,
  launch, lib, linesOf, modelOf, NODE, openIn, openNotes, openPage, openStateFile, pinOf, planeOf, rightClickOn, ROOT, selectBox, showSide, showView, soon,
  stateFileAt, tabTitle, TEN, TESTIDS, thingOf, thingsIn, toast, toastAfter, viewTab, zoomTo,
} from './helpers.mjs';

const SRC = path.join(ROOT, 'canvas', 'app', 'src');
const fixture = (name) => path.join(FIXTURES, name);
const near = (a, b, eps) => Math.abs(a - b) <= eps;

/** An element's rectangle on the screen, or null. */
const rectOf = (page, selector) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
}, selector);

// ---- The bench.

/** The bundler's answer for a library: the built page's window.GraspVendor, as canvas/app/build.mjs answers it. */
const vendorPlugin = {
  name: 'bench-vendor',
  setup(build) {
    build.onResolve({ filter: /^[^./]/ }, (args) => ({ path: args.path, namespace: 'bench-vendor' }));
    build.onLoad({ filter: /.*/, namespace: 'bench-vendor' }, (args) => ({
      contents: `var ns = window.GraspVendor[${JSON.stringify(args.path)}];\n` +
        `if (!ns) throw new Error('The bench imports ${args.path}, which src/vendor.ts does not put on window.GraspVendor.');\n` +
        `var shim = Object.defineProperty({}, '__esModule', { value: true });\n` +
        `Object.keys(ns).forEach(function (key) { if (key !== '__esModule') Object.defineProperty(shim, key, { enumerable: true, get: function () { return ns[key]; } }); });\n` +
        `module.exports = shim;\n`,
      loader: 'js',
    }));
  },
};
/** Stand-ins by a module's path under canvas/app/src without its extension, as loadCoreWith() takes them; `<path>?real` is the module itself. */
function standInPlugin(swaps) {
  const keyOf = (file) => path.relative(SRC, file).split(path.sep).join('/').replace(/\.tsx?$/, '');
  const real = (file) => (fs.existsSync(`${file}.tsx`) ? `${file}.tsx` : `${file}.ts`);
  return {
    name: 'bench-stand-ins',
    setup(build) {
      build.onResolve({ filter: /^\.\.?\// }, (args) => {
        if (args.path.endsWith('?real')) return { path: real(path.resolve(args.resolveDir, args.path.slice(0, -5))) };
        const file = path.resolve(args.resolveDir, args.path);
        return Object.hasOwn(swaps, keyOf(file)) ? { path: real(file), namespace: 'bench-stand-in' } : null;
      });
      build.onLoad({ filter: /.*/, namespace: 'bench-stand-in' }, (args) => ({ contents: swaps[keyOf(args.path)], loader: 'tsx', resolveDir: path.dirname(args.path) }));
    },
  };
}

// The bench's own code: one pane for each view asked for, each holding ViewHost, as the dock's tab does; and BENCH,
// which stands in for the shell.
const BENCH_ENTRY = `
  import { createRoot } from 'react-dom/client';
  import { CssBaseline, ThemeProvider } from '@mui/material';
  import * as core from './core';
  import { handsOf, notesOf, openText, saysOf, selectionOf, toolsOf } from './core';
  import type { Hit, Session } from './core';
  import { Markers } from './plane/edges/markers';
  import { cssVariables, theme } from './shell/theme';
  import { lentCamera, lentReveal } from './views/lends';
  import { ViewHost } from './views/ViewHost';
  import './app.css';

  const page = window as unknown as {
    SysMLModel: SysMLModelLibrary;
    BENCH_FILES: Record<string, string>;
    BENCH_VIEWS: { file: string; view: string; width: number; height: number }[];
    BENCH: Record<string, unknown>;
  };
  for (const [name, value] of Object.entries(cssVariables)) document.documentElement.style.setProperty(name, value);
  const hits: Hit[] = [];
  const sessions = new Map<string, Session>();
  function open(file: string): Session {
    let session = sessions.get(file);
    if (!session) {
      const made = openText(page.SysMLModel, page.BENCH_FILES[file], { name: file });
      session = made;
      sessions.set(file, made);
      // Every click a body offers goes to the tool in hand first: the bench keeps each Hit, for the test to read.
      const tools = toolsOf(made);
      const click = tools.click;
      tools.click = (hit) => { hits.push(hit); return click(hit); };
      // What the shell will give the actions: the two hands a mounted body lends.
      handsOf(made).give({
        save() {}, showText() {}, showView() {}, showPanel() {}, copy: () => Promise.resolve(),
        camera: (viewId, how) => { lentCamera(made, viewId, how); },
        reveal: (viewId, rect) => lentReveal(made, viewId, rect),
      });
    }
    return session;
  }
  page.BENCH = {
    hits: () => hits.map((hit) => ({ ...hit, at: { ...hit.at } })),
    picked: (file: string) => selectionOf(open(file)).items.map((item) => ({ type: item.type, id: item.id })),
    pick: (file: string, items: { type: 'el' | 'rel' | 'view'; id: string }[]) => selectionOf(open(file)).set(items),
    arm: (file: string, kind: string) => toolsOf(open(file)).arm(kind),
    armed: (file: string) => toolsOf(open(file)).armed?.kind ?? null,
    said: (file: string) => saysOf(open(file)).said?.text ?? toolsOf(open(file)).said?.text ?? null,
    camera: (file: string, view: string, how: 'in' | 'out' | 'fit' | 'left' | 'right' | 'up' | 'down') => handsOf(open(file)).hands!.camera(view, how),
    reveal: (file: string, view: string, rect: { x: number; y: number; w: number; h: number }) => handsOf(open(file)).hands!.reveal(view, rect),
    note: (file: string, on: unknown) => (notesOf(open(file)) as unknown as { add(on: unknown): { id: string } }).add(on).id,
    steps: (file: string) => open(file).history.steps.length,
    edit: (file: string, what: string) => open(file).history.edit(() => { open(file).model.package.doc = what; return what; }),
    // With the stand-in entries of core.mjs in the bundle: what the checks find, heard as the marks hear it, after a change.
    problems(file: string, entries: unknown[]) {
      (core as unknown as { standInEntries(session: Session, entries: unknown[]): void }).standInEntries(open(file), entries);
      open(file).history.edit(() => { open(file).model.package.doc = 'checked ' + entries.length; return 'Touched the package'; });
    },
  };
  createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div data-testid="app" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 8 }}>
        <Markers />
        {page.BENCH_VIEWS.map(({ file, view, width, height }) => (
          <div key={file + view} data-pane={view} style={{ position: 'relative', width, height, outline: '1px solid #9aa' }}>
            <ViewHost session={open(file)} viewId={view} />
          </div>
        ))}
      </div>
    </ThemeProvider>,
  );
`;

const benches = [];
/**
 * Builds a bench and gives its URL: `files` are state files by path, `views` the panes ({ file: its base name, view,
 * width, height }), `swaps` the stand-ins. The folder is removed when the test file ends.
 */
async function bench({ files, views, swaps = {} }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grasp-bench-'));
  benches.push(dir);
  const result = await esbuild.build({
    absWorkingDir: ROOT,
    stdin: { contents: BENCH_ENTRY, resolveDir: SRC, sourcefile: 'bench.tsx', loader: 'tsx' },
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'chrome120',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"', __GRASP_LIBRARIES__: JSON.stringify('[]') },
    outdir: dir,
    write: false,
    logLevel: 'silent',
    plugins: [standInPlugin(swaps), vendorPlugin],
  });
  for (const out of result.outputFiles) fs.writeFileSync(path.join(dir, out.path.endsWith('.css') ? 'bench.css' : 'bench.js'), out.contents);
  const data = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
  fs.writeFileSync(path.join(dir, 'index.html'), [
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Grasp: a bench of seams.test.mjs</title>',
    `<link rel="stylesheet" href="${DIST_URL}vendor.css"><link rel="stylesheet" href="bench.css"></head><body><div id="root"></div>`,
    `<script src="${DIST_URL}model-lib.js"></script><script src="${DIST_URL}vendor.js"></script>`,
    `<script>window.BENCH_FILES = ${data(Object.fromEntries(files.map((file) => [path.basename(file), readText(file)])))}; window.BENCH_VIEWS = ${data(views)};</script>`,
    '<script src="bench.js"></script></body></html>',
  ].join('\n'));
  return pathToFileURL(path.join(dir, 'index.html')).href;
}
const B = (page, name, ...args) => page.evaluate(([n, a]) => window.BENCH[n](...a), [name, args]);
/** Waits until a pane's plane draws `count` nodes. */
const untilNodes = (page, viewId, count) => soon(page, () => page.evaluate(([plane, node]) => document.querySelectorAll(`${plane} ${node}`).length, [planeOf(viewId), NODE]).then((n) => n >= count),
  `The plane of ${viewId} does not draw ${count} nodes on the bench.`);

// A stand-in for package 2-12's two files: a reader whose data is the view's shown elements, and a body that draws
// one row for each inside BodyFrame. Each row carries data-thing, a control of its own that stops its click, and
// something with data-pass over it, as a pin is. It leaves the body's hands on the bench (BENCH_BODY).
const STAND_IN_ROWS_READER = `
  import type { Reader } from './index';
  export const GRID_ROW = 28, GRID_HEAD = 32, GRID_MARKS = 72, MATRIX_SIDE = 200, MATRIX_CELL = 96;
  export const GRID_WIDTHS = {};
  export const gridReader: Reader<{ rows: string[] }> = {
    read: (_lib, _model, view) => ({ rows: Object.keys(view.layout) }),
    sizeOf: (data) => ({ width: 480, height: 28 * data.rows.length }),
    listed: (data) => data.rows.map((id, i) => ({ type: 'el' as const, id, words: id, rect: { x: 0, y: 28 * i, w: 480, h: 28 } })),
  };
  export function orderRows(): never { throw new Error('a stand-in'); }
`;
const STAND_IN_ROWS_BODY = `
  import { useRef } from 'react';
  import { readView } from '../core';
  import { BodyFrame } from './BodyFrame';
  import { useBody } from './bodyContext';
  import type { BodyProps } from './bodies';

  function Probe(): null {
    (window as unknown as { BENCH_BODY: unknown }).BENCH_BODY = useBody();
    return null;
  }
  export const GridBody = ({ session, viewId }: BodyProps): JSX.Element => {
    const rows = useRef<HTMLDivElement>(null);
    const data = readView(session, viewId)!.data as { rows: string[] };
    // The view's own units: px from the rows' top left corner, which scrolls with them.
    const toView = (client: { x: number; y: number }) => { const r = rows.current!.getBoundingClientRect(); return { x: Math.round(client.x - r.left), y: Math.round(client.y - r.top) }; };
    const reveal = (rect: { y: number }) => { rows.current!.parentElement!.scrollTop = rect.y; };
    const shown = () => { const el = rows.current!; el.setAttribute('data-shown', String(Number(el.getAttribute('data-shown')) + 1)); };
    return (
      <BodyFrame session={session} viewId={viewId} renderer="grid" toView={toView} reveal={reveal} onShown={shown}>
        <Probe />
        <div ref={rows} data-shown="0" style={{ position: 'relative', width: 480 }}>
          <div data-thing="rel:mount" style={{ height: 28 }}>mount</div>
          <div data-thing="nothing" style={{ height: 28 }}>no thing</div>
          {data.rows.map((id) => (
            <div key={id} data-thing={'el:' + id} style={{ position: 'relative', height: 28, boxSizing: 'border-box', borderBottom: '1px solid #ccd' }}>
              <span data-label={'el:' + id}>{id}</span>
              <button type="button" data-own="" style={{ position: 'absolute', left: 300, top: 4, height: 20 }} onClick={(event) => event.stopPropagation()}>fold</button>
              <span data-pass="" style={{ position: 'absolute', left: 400, top: 3, width: 22, height: 22, background: '#176B61' }} />
            </div>
          ))}
        </div>
      </BodyFrame>
    );
  };
`;

// Stand-ins for packages 2-6's and 2-7's components: a badge of 16 px and pins of 22 px, as their briefs size them.
const STAND_IN_BADGE = `
  import type { Marks } from '../../core';
  export function Badge({ marks, of }: { marks: Marks; of: string }): JSX.Element | null {
    if (marks.problems === 0) return null;
    return <span data-testid="badge" data-pass="" data-for={of} style={{ display: 'block', width: 16, height: 16, borderRadius: 8, background: 'var(--grasp-warning)' }} />;
  }
`;
const STAND_IN_PINS = `
  import { useSyncExternalStore } from 'react';
  import { marksOf } from '../../core';
  import type { Marks, Session } from '../../core';
  const pin = (id: string, no: number, style: object = {}): JSX.Element => (
    <span key={id} data-testid="pin" data-pass="" data-note={id} style={{ display: 'block', width: 22, height: 22, borderRadius: 11, background: 'var(--grasp-teal)', ...style }}>{no}</span>
  );
  export function Pins({ marks }: { marks: Marks; of: string }): JSX.Element {
    return <>{marks.pins.map((p) => pin(p.id, p.no))}</>;
  }
  export function FreePins({ session, viewId }: { session: Session; viewId: string }): JSX.Element {
    const marks = marksOf(session);
    const free = useSyncExternalStore(marks.listen, () => marks.free(viewId));
    return <>{free.map((p) => pin(p.id, p.no, { position: 'absolute', left: p.x, top: p.y, transformOrigin: '0 0', transform: 'scale(calc(1 / var(--grasp-zoom, 1)))' }))}</>;
  }
`;

// A stand-in for package 2-2's gesture: it follows a press on a grip on the window, sets `state` past 4 px, calls
// swallow(), and leaves what it was handed on the plane's root as JSON (data-probe). It writes nothing to the model.
const STAND_IN_CONNECT = `
  import type { ViewStore } from '../viewStore';
  import type { BodyHands } from '../../views/bodyContext';
  export const GRIP_DISTANCE = 4;
  type Press = { grip: string; element: string | null; relationship: string | null; ends: unknown; target: Element; client: { x: number; y: number }; pointerId: number };
  const KEPT = new WeakMap<ViewStore, unknown>();
  export const connectOf = (store: ViewStore) => {
    let gesture = KEPT.get(store) as { state: unknown } | undefined;
    if (gesture) return gesture;
    let state: unknown = null;
    const listeners = new Set<() => void>();
    const tell = (): void => { for (const listener of [...listeners]) listener(); };
    gesture = {
      get state() { return state; },
      menu: null,
      press(press: Press, body: BodyHands) {
        const root = press.target.closest('[data-testid="plane"]')!;
        const saw = { grip: press.grip, element: press.element, relationship: press.relationship, ends: press.ends, moves: 0, over: '' as string | null, ended: false };
        const write = (): void => root.setAttribute('data-probe', JSON.stringify(saw));
        press.target.setPointerCapture(press.pointerId);
        const move = (event: PointerEvent): void => {
          saw.moves += 1;
          if (!state && Math.hypot(event.clientX - press.client.x, event.clientY - press.client.y) < GRIP_DISTANCE) return write();
          if (!state) body.swallow();
          const hit = body.hitAt({ x: event.clientX, y: event.clientY });
          saw.over = hit.type === 'ground' ? null : hit.type + ':' + hit.id;
          body.mark(hit.type === 'ground' ? null : hit, hit.id !== press.element);
          const was = state;
          state = { kind: 'draw', from: press.element ?? '', at: body.toView({ x: event.clientX, y: event.clientY }) };
          write();
          if (!was) tell();
        };
        const up = (): void => {
          window.removeEventListener('pointermove', move, true);
          window.removeEventListener('pointerup', up, true);
          saw.ended = true;
          body.mark(null, false);
          const was = state;
          state = null;
          write();
          if (was) tell();
        };
        window.addEventListener('pointermove', move, true);
        window.addEventListener('pointerup', up, true);
        write();
      },
      choose() {}, closeMenu() {}, cancel() {},
      listen: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    } as never;
    KEPT.set(store, gesture);
    return gesture!;
  };
`;

// ---- The built page.

describe('the seams of slice 2\'s scaffold, in the built page', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  /** For each graph view of the ten files, shown on its plane: what the reader's projection says its nodes and edges are. */
  async function eachPlane(visit) {
    const core = await loadCore();
    let planes = 0;
    for (const file of TEN) {
      const name = path.basename(file);
      const model = modelOf(file);
      if (!model.views.some(isGraph)) continue;
      const opened = await openIn(browser, stateFileAt(file));
      const session = core.openText(lib, readText(file), { name }, { now: clock() });
      for (const view of model.views.filter(isGraph)) {
        planes += 1;
        await showView(opened.page, view, linesOf(model, view).length);
        const projection = core.project(lib, session.model, session.model.views.find((v) => v.id === view.id));
        await visit({ page: opened.page, name, view, projection, core });
      }
      await finish(opened);
    }
    assert.equal(planes, 11, 'The ten files hold 11 views of the graph kinds.');
  }

  test('every node and edge gives its element', async () => {
    await eachPlane(async ({ page, name, view, projection, core }) => {
      const expected = [
        ...projection.nodes.map((n) => `el:${core.elementOf(n)}`),
        ...projection.edges.map((e) => `rel:${core.relationshipOf(e)}`),
      ].sort();
      assert.deepEqual(await thingsIn(page, view.id), expected, `${name}, ${view.name}: the plane's data-of are not its projection's elements and relationships, one for one.`);
      // Each node's own React Flow element holds exactly one data-of, a direct child, which names the node's element;
      // each edge's holds exactly one, which names its relationship.
      const carried = await page.evaluate(([plane, node, edge]) => {
        const of = (el, direct) => [...el.querySelectorAll('[data-of]')].filter((c) => !direct || c.parentElement === el).map((c) => c.getAttribute('data-of'));
        return {
          nodes: [...document.querySelectorAll(`${plane} ${node}`)].map((el) => [el.getAttribute('data-id'), of(el, true), el.querySelectorAll('[data-of]').length]),
          edges: [...document.querySelectorAll(`${plane} ${edge}`)].map((el) => [el.getAttribute('data-id'), of(el, false)]),
        };
      }, [planeOf(view.id), NODE, EDGE]);
      assert.deepEqual(carried.nodes.sort(), projection.nodes.map((n) => [n.id, [`el:${core.elementOf(n)}`], 1]).sort(), `${name}, ${view.name}: a node does not carry its element as its one data-of, on a direct child.`);
      assert.deepEqual(carried.edges.sort(), projection.edges.map((e) => [e.id, [`rel:${core.relationshipOf(e)}`]]).sort(), `${name}, ${view.name}: an edge does not carry its relationship as its one data-of.`);
    });

    // Far (below 25%) a node is its outline and a line has no label, and both still say whose they are.
    const view = modelOf(EXAMPLE).views[0];
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showView(page, view, linesOf(modelOf(EXAMPLE), view).length);
    const nearThings = await thingsIn(page, view.id);
    await zoomTo(page, view, 'Host', 0.2);
    await soon(page, () => page.evaluate((plane) => document.querySelectorAll(`${plane} .grasp-node-name`).length === 0, planeOf(view.id)), 'At 20% the boxes still show their names.');
    assert.deepEqual(await thingsIn(page, view.id), nearThings, 'Far, a plane no longer says the same elements and relationships.');
    assert.equal(await page.locator(thingOf(view.id, 'el', 'Host')).count(), 1, 'Far, the node of Host is not found by its element.');
    await finish(opened);
  });

  test('every anchor carries data-label', async () => {
    await eachPlane(async ({ page, name, view, projection, core }) => {
      // What shows a label that can be edited: a box's name line, a border item's name, a small node's name, a line's label.
      const NAMED = ['bar', 'diamond', 'event'];
      const expected = [
        ...projection.nodes.filter((n) => n.data.form === 'box' || (n.data.name !== '' && (n.data.form === 'border' || NAMED.includes(n.type)))).map((n) => `el:${core.elementOf(n)}`),
        ...projection.edges.filter((e) => e.data.label !== '').map((e) => `rel:${core.relationshipOf(e)}`),
      ].sort();
      const found = await page.evaluate((plane) => {
        const anchors = [...document.querySelectorAll(`${plane} :is(.grasp-node-name, .grasp-port-name, .grasp-small-name, .grasp-line-label)`)];
        return {
          labels: anchors.map((el) => el.getAttribute('data-label')).sort(),
          // An anchor names the thing of the node or the edge it is in.
          own: anchors.every((el) => el.getAttribute('data-label') === el.closest('.react-flow__node, .react-flow__edge').querySelector('[data-of]').getAttribute('data-of')),
          all: document.querySelectorAll(`${plane} [data-label]`).length,
        };
      }, planeOf(view.id));
      assert.deepEqual(found.labels, expected, `${name}, ${view.name}: the anchors' data-label are not the labels the projection draws.`);
      assert.ok(found.own, `${name}, ${view.name}: an anchor's data-label is not the data-of of the node or the edge it is in.`);
      assert.equal(found.all, expected.length, `${name}, ${view.name}: something else than a name or a line's label carries data-label.`);
      assert.ok(expected.length > 0);
    });
  });

  test('ViewHost shows a card for a kind with no body', async (t) => {
    const core = await loadCore();
    let cards = 0;
    for (const file of TEN) {
      const model = modelOf(file);
      // A kind whose reader a later package has built is drawn by its body, and this test has nothing to say of it.
      const unbuilt = model.views.filter((view) => !core.hasReader(lib, view.kind));
      if (unbuilt.length === 0) continue;
      const opened = await openIn(browser, stateFileAt(file));
      const { page } = opened;
      for (const view of unbuilt) {
        cards += 1;
        const tab = await viewTab(page, view);
        if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
        const card = await soon(page, () => page.evaluate((selector) => {
          const root = document.querySelector(selector);
          const el = root?.querySelector('.grasp-card');
          return el ? { text: el.textContent, cls: root.className, flow: root.querySelectorAll('.react-flow').length, body: document.querySelectorAll(`[data-testid="body"][data-view="${root.getAttribute('data-view')}"]`).length } : null;
        }, planeOf(view.id)), `No root like a plane's holds the card of ${view.name} (data-testid "plane", data-view "${view.id}").`);
        for (const sentence of cardOf(view)) assert.ok(card.text.includes(sentence), `The card of ${view.name} does not say "${sentence}".`);
        assert.deepEqual([card.cls, card.flow, card.body], ['grasp-plane', 0, 0], `The card of ${view.name} is not alone in a root like a plane's.`);
        // A right-click on the card shows no menu of the browser's and none of the page's.
        const box = await rectOf(page, `${planeOf(view.id)} .grasp-card`);
        await page.evaluate(() => {
          if (!window.seamsMenu) window.addEventListener('contextmenu', (event) => window.seamsMenu.push(event.defaultPrevented));
          window.seamsMenu = [];
        });
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' });
        await frame(page);
        assert.deepEqual(await page.evaluate(() => window.seamsMenu), [true], `A right-click on the card of ${view.name} was not prevented.`);
        assert.equal(await page.locator(byTestId(TESTIDS.palette)).count(), 0);
      }
      await finish(opened);
    }
    t.diagnostic(`${cards} views of the ten files show the card: those whose kind has no reader yet`);
  });

  test('the middle button drags the plane', async () => {
    const model = modelOf(EXAMPLE);
    const view = model.views[0];
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showView(page, view, linesOf(model, view).length);
    const selected = () => page.evaluate((plane) => document.querySelectorAll(`${plane} .selected`).length, planeOf(view.id));
    const drag = async (from, dx, dy) => {
      await page.mouse.move(from.x, from.y);
      await page.mouse.down({ button: 'middle' });
      for (let i = 1; i <= 6; i++) await page.mouse.move(from.x + (dx * i) / 6, from.y + (dy * i) / 6);
      await page.mouse.up({ button: 'middle' });
      await frame(page);
    };

    // From the ground.
    const start = await cameraOf(page, view.id);
    const ground = await groundPoint(page, view);
    await drag(ground, 120, 70);
    let now = await soon(page, async () => { const c = await cameraOf(page, view.id); return c.x !== start.x ? c : null; }, 'A drag of the ground with the middle button did not move the plane.');
    assert.ok(near(now.x, start.x + 120, 1) && near(now.y, start.y + 70, 1) && now.zoom === start.zoom, `The middle button moved the plane by ${now.x - start.x}, ${now.y - start.y}, not by 120, 70.`);

    // From a box: the plane moves, the box keeps its place in the view, and nothing is picked or written.
    const host = await boxOf(page, view.id, 'Host');
    await drag({ x: host.x + host.width / 2, y: host.y + host.height / 2 }, -90, 40);
    now = await cameraOf(page, view.id);
    assert.ok(near(now.x, start.x + 30, 1) && near(now.y, start.y + 110, 1), `A drag from a box with the middle button moved the plane to ${now.x}, ${now.y}, not by -90, 40.`);
    const after = await boxOf(page, view.id, 'Host');
    assert.ok(near(after.x, host.x - 90, 1) && near(after.y, host.y + 40, 1), 'The box under the middle button did not move with the plane.');
    assert.equal(await selected(), 0, 'A drag with the middle button picked something.');
    assert.equal(await page.locator(byTestId(TESTIDS.undo)).isDisabled(), true, 'A drag with the middle button wrote an undo step.');

    // The main button still drags the ground, and a box.
    await drag(ground, 0, 0);
    const before = await cameraOf(page, view.id);
    await page.mouse.move(ground.x, ground.y);
    await page.mouse.down();
    await page.mouse.move(ground.x + 40, ground.y + 20, { steps: 4 });
    await page.mouse.up();
    now = await soon(page, async () => { const c = await cameraOf(page, view.id); return c.x !== before.x ? c : null; }, 'A drag of the ground with the main button no longer moves the plane.');
    assert.ok(near(now.x, before.x + 40, 1) && near(now.y, before.y + 20, 1));
    await finish(opened);
  });
});

// ---- The bench: a body's seams with stand-ins.

describe('the seams of slice 2\'s scaffold, on a bench with stand-ins', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => {
    await browser?.close();
    for (const dir of benches) fs.rmSync(dir, { recursive: true, force: true });
  });

  const GRID = 'grid.json';
  const rowsBench = () => bench({
    files: [fixture(GRID), fixture('sequence.json')],
    views: [
      { file: GRID, view: 'v-table', width: 640, height: 300 },
      { file: GRID, view: 'v-proof', width: 640, height: 420 },
      { file: 'sequence.json', view: 'v-seq', width: 640, height: 300 },
      { file: GRID, view: 'no-such-view', width: 640, height: 300 },
    ],
    swaps: { 'core/readers/grid': STAND_IN_ROWS_READER, 'views/GridBody': STAND_IN_ROWS_BODY },
  });
  const BODY = `${byTestId(TESTIDS.body)}[data-view="v-table"]`;
  const row = (id) => `${BODY} [data-thing="el:${id}"]`;

  test('ViewHost draws the body its kind\'s entry names: a plane, a component, or the card', async () => {
    const opened = await openPage(browser, { url: await rowsBench() });
    const { page } = opened;
    await untilNodes(page, 'v-proof', 13);
    const found = await page.evaluate(([body, plane]) => {
      const pane = (view) => document.querySelector(`[data-pane="${view}"]`);
      const kids = (view) => [...pane(view).children].map((el) => [el.getAttribute('data-testid'), el.getAttribute('data-view'), el.getAttribute('data-renderer')]);
      return {
        table: kids('v-table'), rows: document.querySelectorAll(`${body}[data-view="v-table"] [data-thing^="el:"]`).length,
        proof: kids('v-proof'), flow: pane('v-proof').querySelectorAll('.react-flow').length,
        seq: kids('v-seq'), seqText: pane('v-seq').textContent, seqFlow: pane('v-seq').querySelectorAll('.react-flow').length,
        gone: kids('no-such-view'), goneText: pane('no-such-view').textContent,
        fills: (() => { const r = document.querySelector(`${body}[data-view="v-table"]`).getBoundingClientRect(); const p = pane('v-table').getBoundingClientRect(); return [r.width === p.width, r.height === p.height]; })(),
        planes: document.querySelectorAll(plane).length,
      };
    }, [byTestId(TESTIDS.body), byTestId(TESTIDS.plane)]);
    assert.deepEqual(found.table, [['body', 'v-table', 'grid']], 'A view whose kind\'s entry names a component is drawn by that component, inside a BodyFrame: its root carries data-testid "body", data-view and data-renderer.');
    assert.equal(found.rows, 13, 'The stand-in body draws a row for each element its reader gives.');
    assert.deepEqual(found.fills, [true, true], 'A BodyFrame\'s root fills its tab.');
    assert.deepEqual([found.proof, found.flow], [[['plane', 'v-proof', null]], 1], 'A view of a graph kind is drawn by a plane.');
    assert.deepEqual([found.seq, found.seqFlow], [[['plane', 'v-seq', null]], 0], 'A view whose kind has no body yet shows the card in a root like a plane\'s.');
    assert.ok(found.seqText.includes('A sequence view is not drawn yet.'), `The card reads "${found.seqText}".`);
    assert.deepEqual(found.gone, [['plane', 'no-such-view', null]]);
    assert.ok(found.goneText.includes('This view is not in the model.'), `The card of a view the model does not hold reads "${found.goneText}".`);
    assert.equal(found.planes, 3);
    await finish(opened);
  });

  test('a BodyFrame with stand-in rows turns a click into a Hit and opens the palette', async () => {
    const opened = await openPage(browser, { url: await rowsBench() });
    const { page } = opened;
    await page.waitForSelector(row('Host'));
    const origin = await rectOf(page, `${BODY} [data-shown]`);
    const host = await rectOf(page, row('Host'));
    const app = await rectOf(page, row('App'));
    const at = (p) => ({ x: Math.round(p.x - origin.x), y: Math.round(p.y - origin.y) });
    const last = async () => (await B(page, 'hits')).at(-1);

    // A click on a row: one Hit on its element, at the pointer in the view's own units, offered to the tool and then picked.
    let p = { x: host.x + 150, y: host.y + 14 };
    await page.mouse.click(p.x, p.y);
    assert.deepEqual(await last(), { view: 'v-table', type: 'el', id: 'Host', at: at(p), add: false });
    assert.deepEqual(await B(page, 'picked', GRID), [{ type: 'el', id: 'Host' }], 'With no tool in hand the click picks the row\'s element.');
    assert.equal((await B(page, 'hits')).length, 1, 'One click is one Hit.');
    // With Ctrl: the Hit adds.
    p = { x: app.x + 150, y: app.y + 14 };
    await page.keyboard.down('Control');
    await page.mouse.click(p.x, p.y);
    await page.keyboard.up('Control');
    assert.deepEqual(await last(), { view: 'v-table', type: 'el', id: 'App', at: at(p), add: true });
    assert.deepEqual(await B(page, 'picked', GRID), [{ type: 'el', id: 'App' }, { type: 'el', id: 'Host' }]);
    // A relationship's thing, and something whose data-thing names neither: the ground.
    const mount = await rectOf(page, `${BODY} [data-thing="rel:mount"]`);
    await page.mouse.click(mount.x + 150, mount.y + 14);
    assert.deepEqual([(await last()).type, (await last()).id], ['rel', 'mount']);
    const nothing = await rectOf(page, `${BODY} [data-thing="nothing"]`);
    await page.mouse.click(nothing.x + 150, nothing.y + 14);
    assert.deepEqual([(await last()).type, (await last()).id], ['ground', null]);
    // The ground: the view is picked.
    const body = await rectOf(page, BODY);
    p = { x: body.x + 560, y: body.y + 40 };
    await page.mouse.click(p.x, p.y);
    assert.deepEqual(await last(), { view: 'v-table', type: 'ground', id: null, at: at(p), add: false });
    assert.deepEqual(await B(page, 'picked', GRID), [{ type: 'view', id: 'v-table' }], 'A click on a body\'s ground picks its view.');
    // A control of the body's own stops its click: the frame hears none.
    let count = (await B(page, 'hits')).length;
    await page.locator(`${row('Host')} [data-own]`).click();
    assert.equal((await B(page, 'hits')).length, count, 'A click that a control of the body stopped is no Hit.');
    // The tool in hand is offered the click first, and the click then picks nothing by itself.
    await B(page, 'arm', GRID, 'PartDefinition');
    assert.equal(await B(page, 'armed', GRID), 'PartDefinition');
    await page.mouse.click(host.x + 150, host.y + 14);
    assert.equal((await last()).id, 'Host');
    assert.equal(await B(page, 'armed', GRID), null, 'The click went to the tool, which a grid view puts down.');
    assert.deepEqual(await B(page, 'picked', GRID), [{ type: 'view', id: 'v-table' }], 'While a tool is in hand a click picks nothing by itself.');

    // A right-click opens the palette at the pointer with that Hit, stops the browser's menu, and is no click.
    count = (await B(page, 'hits')).length;
    await page.evaluate(() => { window.seamsMenu = []; window.addEventListener('contextmenu', (event) => window.seamsMenu.push(event.defaultPrevented)); });
    p = { x: app.x + 120, y: app.y + 10 };
    await page.mouse.click(p.x, p.y, { button: 'right' });
    const palette = page.locator(byTestId(TESTIDS.palette));
    await soon(page, async () => (await palette.count()) === 1, 'A right-click on a row of a BodyFrame opened no palette.');
    const menu = await rectOf(page, byTestId(TESTIDS.palette));
    assert.ok(near(menu.x, p.x, 2) && near(menu.y, p.y, 10), `The palette is at ${menu.x}, ${menu.y}, not at the pointer ${p.x}, ${p.y}.`);
    assert.equal((await palette.textContent()).trim(), 'Nothing can be made here.', 'A grid view has no tools, so the palette says so.');
    assert.deepEqual(await page.evaluate(() => window.seamsMenu), [true], 'The browser\'s own menu was not stopped.');
    assert.equal((await B(page, 'hits')).length, count, 'A right-click is no click.');
    await page.keyboard.press('Escape');
    await soon(page, async () => (await palette.count()) === 0, 'Escape did not close the palette.');
    assert.equal((await B(page, 'hits')).length, count, 'Closing the palette is no click on the body.');

    // The body's hands, as what is drawn inside reads them.
    const hands = (name, ...args) => page.evaluate(([n, a]) => window.BENCH_BODY[n](...a), [name, args]);
    assert.deepEqual(await page.evaluate(() => [window.BENCH_BODY.viewId, window.BENCH_BODY.zoom()]), ['v-table', 1]);
    assert.deepEqual(await hands('toView', { x: host.x + 7, y: host.y + 9 }), at({ x: host.x + 7, y: host.y + 9 }));
    assert.deepEqual(await hands('hitAt', { x: host.x + 150, y: host.y + 14 }), { view: 'v-table', type: 'el', id: 'Host', at: at({ x: host.x + 150, y: host.y + 14 }), add: false });
    assert.deepEqual((await hands('hitAt', { x: host.x + 411, y: host.y + 14 })).id, 'Host', 'hitAt looks past what carries data-pass, at the row under it.');
    assert.equal(await page.evaluate(([x, y]) => document.elementFromPoint(x, y).hasAttribute('data-pass'), [host.x + 411, host.y + 14]), true);
    assert.equal((await hands('hitAt', { x: body.x + 560, y: body.y + 40 })).type, 'ground');
    const proof = await rectOf(page, planeOf('v-proof'));
    assert.equal((await hands('hitAt', { x: proof.x + 100, y: proof.y + 100 })).type, 'ground', 'What lies in a view beside it is never a body\'s answer.');
    assert.deepEqual([await hands('inside', { x: body.x + 5, y: body.y + 5 }), await hands('inside', { x: proof.x + 100, y: proof.y + 100 })], [true, false]);
    // mark outlines the thing, teal when it fits and grey when not, and null takes the outline away.
    const outline = (selector) => page.evaluate((s) => { const el = document.querySelector(s); const c = getComputedStyle(el); return [el.getAttribute('data-over'), c.outlineStyle, c.outlineColor]; }, selector);
    const colour = (name) => page.evaluate((v) => { const el = document.body.appendChild(document.createElement('i')); el.style.color = `var(${v})`; const c = getComputedStyle(el).color; el.remove(); return c; }, name);
    await hands('mark', { view: 'v-table', type: 'el', id: 'App', at: { x: 0, y: 0 }, add: false }, true);
    assert.deepEqual(await outline(row('App')), ['fits', 'dashed', await colour('--grasp-teal')]);
    await hands('mark', { view: 'v-table', type: 'el', id: 'Host', at: { x: 0, y: 0 }, add: false }, false);
    assert.deepEqual(await outline(row('Host')), ['no', 'dashed', await colour('--grasp-unfit')]);
    assert.equal((await outline(row('App')))[0], null, 'The outline moves with the gesture: the thing before has none.');
    await hands('mark', null, false);
    assert.equal((await outline(row('Host')))[0], null);
    // swallow: the next click is no click, and the click after it is one again.
    count = (await B(page, 'hits')).length;
    await hands('swallow');
    await page.mouse.move(host.x + 150, host.y + 14);
    await page.evaluate(([x, y]) => document.elementFromPoint(x, y).dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y })), [host.x + 150, host.y + 14]);
    assert.equal((await B(page, 'hits')).length, count, 'The click after swallow() is no click.');
    await page.mouse.click(host.x + 150, host.y + 14);
    assert.equal((await B(page, 'hits')).length, count + 1, 'The next press takes the flag away.');
    // menu opens the palette where it is asked.
    await hands('menu', { view: 'v-table', type: 'ground', id: null, at: { x: 0, y: 0 }, add: false }, { x: body.x + 200, y: body.y + 120 });
    await soon(page, async () => (await palette.count()) === 1, 'body.menu opened no palette.');
    await page.keyboard.press('Escape');
    await soon(page, async () => (await palette.count()) === 0, 'Escape did not close the palette.');

    // What the frame lends the shell: reveal scrolls the place into the window.
    await B(page, 'reveal', GRID, 'v-table', { x: 0, y: 100, w: 480, h: 28 });
    assert.equal(await page.evaluate((s) => document.querySelector(s).scrollTop, BODY), 100, 'The shell\'s reveal reaches the body\'s own.');
    // onShown: not for the size it mounts with, and once each time the root has a size again after having none.
    const shown = () => page.evaluate((s) => document.querySelector(`${s} [data-shown]`).getAttribute('data-shown'), BODY);
    assert.equal(await shown(), '0');
    await page.evaluate(() => { document.querySelector('[data-pane="v-table"]').style.display = 'none'; });
    await frame(page);
    await page.evaluate(() => { document.querySelector('[data-pane="v-table"]').style.display = ''; });
    await soon(page, async () => (await shown()) === '1', 'A body shown again was not told (onShown).');
    await finish(opened);
  });

  test('a plane lends its camera and reveal, and gives its zoom to what is drawn at a size of the screen', async () => {
    const opened = await openPage(browser, { url: await rowsBench() });
    const { page } = opened;
    await untilNodes(page, 'v-proof', 13);
    const V = 'v-proof';
    const pane = await rectOf(page, planeOf(V));
    // The zoom as the stylesheets read it, where the plane gives it: in React Flow's viewport portal.
    const zoomVar = () => page.evaluate((s) => Number(getComputedStyle(document.querySelector(`${s} .react-flow__viewport-portal`)).getPropertyValue('--grasp-zoom')), planeOf(V));
    const camera = () => cameraOf(page, V);
    const moved = async (was, what) => soon(page, async () => { const c = await camera(); return c.x !== was.x || c.y !== was.y || c.zoom !== was.zoom ? c : null; }, what);
    const fitted = await camera();
    assert.ok(near(await zoomVar(), fitted.zoom, 1e-6), `The plane's --grasp-zoom is ${await zoomVar()}, and the plane is at ${fitted.zoom}.`);

    // In and out: a step of 1.2 about the plane's middle.
    await B(page, 'camera', GRID, V, 'in');
    let now = await moved(fitted, 'The camera\'s hand did not zoom in.');
    assert.ok(near(now.zoom, fitted.zoom * 1.2, 1e-6), `Zoom in went from ${fitted.zoom} to ${now.zoom}, not by 1.2.`);
    const middle = (c) => ({ x: (pane.width / 2 - c.x) / c.zoom, y: (pane.height / 2 - c.y) / c.zoom });
    assert.ok(near(middle(now).x, middle(fitted).x, 0.01) && near(middle(now).y, middle(fitted).y, 0.01), 'Zoom in did not keep the plane\'s middle where it was.');
    assert.ok(near(await zoomVar(), now.zoom, 1e-6), 'The plane\'s --grasp-zoom did not follow the zoom.');
    await B(page, 'camera', GRID, V, 'out');
    now = await moved(now, 'The camera\'s hand did not zoom out.');
    assert.ok(near(now.zoom, fitted.zoom, 1e-6) && near(now.x, fitted.x, 0.01) && near(now.y, fitted.y, 0.01), 'Zoom out did not undo zoom in.');
    // The four moves: 80 px of the screen, the window going that way over the view.
    for (const [how, dx, dy] of [['left', 80, 0], ['up', 0, 80], ['right', -80, 0], ['down', 0, -80]]) {
      const was = await camera();
      await B(page, 'camera', GRID, V, how);
      now = await moved(was, `The camera's hand did not move ${how}.`);
      assert.ok(near(now.x, was.x + dx, 0.01) && near(now.y, was.y + dy, 0.01) && now.zoom === was.zoom, `Move ${how} went by ${now.x - was.x}, ${now.y - was.y}.`);
    }
    assert.ok(near(await zoomVar(), fitted.zoom, 1e-6), 'A pan changed --grasp-zoom.');
    // Fit: as the fit button.
    await B(page, 'camera', GRID, V, 'in');
    await B(page, 'camera', GRID, V, 'left');
    const off = await camera();
    await B(page, 'camera', GRID, V, 'fit');
    now = await moved(off, 'The camera\'s hand did not fit.');
    assert.ok(near(now.zoom, fitted.zoom, 1e-6) && near(now.x, fitted.x, 0.01) && near(now.y, fitted.y, 0.01), 'Fit did not bring the view back as it was first fitted.');

    // reveal: a place outside the window is brought 24 px inside it, at the zoom it had; one inside moves nothing.
    const host = await boxOf(page, V, 'Host');
    const inView = (c, box) => ({ x: (box.x - pane.x - c.x) / c.zoom, y: (box.y - pane.y - c.y) / c.zoom, w: box.width / c.zoom, h: box.height / c.zoom });
    const place = inView(now, host);
    await B(page, 'reveal', GRID, V, place);
    await frame(page);
    assert.deepEqual(await camera(), now, 'reveal of a place that is in the window moved the plane.');
    for (let i = 0; i < 4; i++) await B(page, 'camera', GRID, V, 'in');
    for (let i = 0; i < 12; i++) await B(page, 'camera', GRID, V, 'right');
    const away = await camera();
    const small = { x: place.x + 8, y: place.y + 8, w: 40, h: 20 };
    await B(page, 'reveal', GRID, V, small);
    now = await moved(away, 'reveal did not move the plane.');
    assert.equal(now.zoom, away.zoom, 'reveal changed the zoom.');
    const left = small.x * now.zoom + now.x;
    const top = small.y * now.zoom + now.y;
    assert.ok(left >= 24 - 0.01 && left + small.w * now.zoom <= pane.width - 24 + 0.01 && top >= 24 - 0.01 && top + small.h * now.zoom <= pane.height - 24 + 0.01,
      `After reveal the place lies at ${left}, ${top} of a window ${pane.width} by ${pane.height}: not 24 px inside it.`);
    // The other views lend nothing a camera could move: the hand does nothing there.
    await B(page, 'camera', GRID, 'v-table', 'in');
    await B(page, 'camera', 'sequence.json', 'v-seq', 'in');
    await finish(opened);
  });

  test('a marked node and a marked line hold their marks in .grasp-marks, at their size on the screen at any zoom', async () => {
    const FILE = 'annotations.json';
    const V = 'v-proof';
    const opened = await openPage(browser, {
      url: await bench({
        files: [fixture(FILE)],
        views: [{ file: FILE, view: V, width: 1300, height: 700 }],
        swaps: { 'plane/marks/Badge': STAND_IN_BADGE, 'plane/marks/Pin': STAND_IN_PINS, 'core/notes': STAND_IN_NOTES, 'core/checks': STAND_IN_ENTRIES },
      }),
    });
    const { page } = opened;
    await untilNodes(page, V, 13);
    const marksIn = () => page.evaluate((plane) => [...document.querySelectorAll(`${plane} .grasp-marks`)].map((el) => ({
      on: el.closest('.react-flow__node')?.querySelector(':scope > [data-of]').getAttribute('data-of') ?? (el.parentElement.classList.contains('react-flow__edgelabel-renderer') ? 'a line' : 'elsewhere'),
      cls: el.className, kids: [...el.children].map((c) => `${c.getAttribute('data-testid')} ${c.getAttribute('data-note') ?? c.getAttribute('data-for')}`),
    })).sort((a, b) => (a.on < b.on ? -1 : 1)), planeOf(V));
    // The file's two notes: note 1 on Host, note 2 on the line mount. No other node or line holds the element.
    await soon(page, async () => (await marksIn()).length === 2, async () => `The plane holds ${(await marksIn()).length} .grasp-marks for the file's two pinned notes.`);
    assert.deepEqual(await marksIn(), [
      { on: 'a line', cls: 'grasp-marks nodrag nopan', kids: ['pin n-mount-one'] },
      { on: 'el:Host', cls: 'grasp-marks nodrag nopan', kids: ['pin n-host-abstract'] },
    ]);

    // A second note on Host, and one on a port and a line with nothing yet: the pins by number, side by side.
    await B(page, 'note', FILE, { type: 'el', id: 'Host' });
    await B(page, 'note', FILE, { type: 'el', id: 'Page.hosts.api' });
    await soon(page, async () => (await marksIn()).length === 3, 'A note on a port put no marks on it.');
    const measure = () => page.evaluate(([plane, node]) => {
      const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
      const at = (of) => document.querySelector(`${plane} ${node}:has(> [data-of="${of}"])`);
      const path = document.querySelector(`${plane} [data-of="rel:mount"]`);
      const p = path.getPointAtLength(path.getTotalLength() / 2);
      const q = new DOMPoint(p.x, p.y).matrixTransform(path.getScreenCTM());
      const line = document.querySelector(`${plane} .react-flow__edgelabel-renderer .grasp-marks`);
      return {
        host: rect(at('el:Host')), hostMarks: rect(at('el:Host').querySelector('.grasp-marks')), hostPins: [...at('el:Host').querySelectorAll('[data-testid="pin"]')].map(rect),
        port: rect(at('el:Page.hosts.api')), portMarks: rect(at('el:Page.hosts.api').querySelector('.grasp-marks')), portPin: rect(at('el:Page.hosts.api').querySelector('[data-testid="pin"]')),
        owner: rect(at('el:Page.hosts')),
        mid: { x: q.x, y: q.y }, linePin: rect(line.querySelector('[data-testid="pin"]')), top: document.elementFromPoint(q.x, q.y)?.getAttribute('data-testid'),
      };
    }, [planeOf(V), NODE]);
    const check = async (zoom) => {
      const m = await measure();
      const say = `At ${(zoom * 100).toFixed(0)}%`;
      for (const pin of [...m.hostPins, m.portPin, m.linePin]) assert.ok(near(pin.width, 22, 0.5) && near(pin.height, 22, 0.5), `${say} a pin is ${pin.width} by ${pin.height} on the screen, not 22.`);
      assert.equal(m.hostPins.length, 2);
      // On a box: a row across the top edge at its right end, its middle on the edge.
      assert.ok(near(m.hostMarks.y + m.hostMarks.height / 2, m.host.y, 1), `${say} the middle of Host's marks is ${m.hostMarks.y + m.hostMarks.height / 2 - m.host.y} px off its top edge.`);
      assert.ok(near(m.hostMarks.right, m.host.right, 1.5), `${say} Host's marks end ${m.hostMarks.right - m.host.right} px from its right end.`);
      assert.ok(m.hostPins[0].right <= m.hostPins[1].x + 0.5 && near(m.hostPins[0].y, m.hostPins[1].y, 0.5), `${say} Host's two pins do not sit side by side.`);
      // On a border item: beside the square, on the side away from the name, level with its middle.
      const inside = m.port.x + m.port.width / 2 > m.owner.x + m.owner.width / 2 ? m.portMarks.right <= m.port.x + 0.5 : m.portMarks.x >= m.port.right - 0.5;
      assert.ok(inside && near(m.portMarks.y + m.portMarks.height / 2, m.port.y + m.port.height / 2, 1.5), `${say} the port's marks are not beside its square, on its owner's side.`);
      // On a line: at its middle, over whatever lies there.
      assert.ok(near(m.linePin.x + 11, m.mid.x, 1.5) && near(m.linePin.y + 11, m.mid.y, 1.5), `${say} the line's pin is ${m.linePin.x + 11 - m.mid.x}, ${m.linePin.y + 11 - m.mid.y} px off the line's middle.`);
      assert.equal(m.top, 'pin', `${say} something covers the pin at the line's middle.`);
    };
    const fitted = await cameraOf(page, V);
    await check(fitted.zoom);
    await B(page, 'camera', FILE, V, 'in');
    await B(page, 'camera', FILE, V, 'in');
    const zoomed = await soon(page, async () => { const c = await cameraOf(page, V); return c.zoom > fitted.zoom * 1.4 ? c : null; }, 'The plane did not zoom in.');
    await B(page, 'reveal', FILE, V, { x: 32, y: 380, w: 380, h: 60 });
    await frame(page);
    await check(zoomed.zoom);

    // A free note floats on the view at its place, from the view's origin, at its size on the screen.
    assert.equal(await page.locator(`${planeOf(V)} .react-flow__viewport-portal [data-testid="pin"]`).count(), 0, 'A view with no free pin draws one.');
    const free = await B(page, 'note', FILE, { view: V, x: 300, y: 400 });
    const freePin = `${planeOf(V)} .react-flow__viewport-portal [data-note="${free}"]`;
    await page.waitForSelector(freePin);
    assert.equal(await pinOf(page, V, free).count(), 1, 'pinOf of helpers.mjs does not find the free pin by its note in its view\'s body.');
    const c = await cameraOf(page, V);
    const pane = await rectOf(page, planeOf(V));
    const f = await rectOf(page, freePin);
    assert.ok(near(f.x, pane.x + c.x + 300 * c.zoom, 1) && near(f.y, pane.y + c.y + 400 * c.zoom, 1), `The free pin is at ${f.x - pane.x}, ${f.y - pane.y} of the plane, not at 300, 400 of the view.`);
    assert.ok(near(f.width, 22, 0.5), `The free pin is ${f.width} px wide on the screen.`);

    // A problem on Host and one on a box with no note: the badge is 16 px, and last in the row, after the pins.
    await B(page, 'problems', FILE, [{ list: 'problems', message: 'A problem.', about: { type: 'el', id: 'Host' } }, { list: 'problems', message: 'Another.', about: { type: 'el', id: 'App' } }]);
    await soon(page, async () => (await marksIn()).length === 4, 'A problem put no marks on a box.');
    const rows = await marksIn();
    assert.deepEqual(rows.find((r) => r.on === 'el:Host').kids.map((k) => k.split(' ')[0]), ['pin', 'pin', 'badge'], 'The pins come by number and the badge last.');
    assert.deepEqual(rows.find((r) => r.on === 'el:App').kids, ['badge el:App']);
    const badge = await rectOf(page, `:is(${thingOf(V, 'el', 'App')}) [data-testid="badge"]`);
    const appBox = await rectOf(page, thingOf(V, 'el', 'App'));
    assert.ok(near(badge.width, 16, 0.5) && near(badge.y + 8, appBox.y, 1) && near(badge.right, appBox.right, 1.5), `The badge of App is ${badge.width} px wide, ${badge.y + 8 - appBox.y} px off its top edge and ${badge.right - appBox.right} px from its right end.`);

    // Far, no mark is drawn.
    await zoomTo(page, { id: V, name: V }, 'Host', 0.2);
    await soon(page, async () => (await marksIn()).length === 0, 'Far, a plane still draws marks.');
    assert.equal(await page.locator(`${planeOf(V)} [data-testid="pin"]`).count(), 0, 'Far, a pin is still drawn.');
    await finish(opened);
  });

  test('the grips are mounted once a gesture is there: a press on one reaches it with the node\'s element, and moves and picks nothing', async () => {
    const FILE = path.basename(EXAMPLE);
    const V = 'v-proof';
    const opened = await openPage(browser, {
      url: await bench({ files: [EXAMPLE], views: [{ file: FILE, view: V, width: 1300, height: 700 }], swaps: { 'plane/gestures/connect': STAND_IN_CONNECT } }),
    });
    const { page } = opened;
    await untilNodes(page, V, 13);
    const root = (name) => page.evaluate(([s, n]) => document.querySelector(s).getAttribute(n), [planeOf(V), name]);
    const probe = async () => JSON.parse(await root('data-probe'));
    assert.equal(await root('data-grips'), '', 'With a gesture there, the root of a view that draws lines carries data-grips.');
    assert.equal(await root('data-connecting'), null);
    // Four on a box, one on a border item, each with the seam's classes and data-pass.
    const grips = await page.evaluate(([plane, node]) => [...document.querySelectorAll(`${plane} ${node}`)].map((el) => [
      el.querySelector(':scope > [data-of]').getAttribute('data-of'),
      [...el.querySelectorAll(':scope > [data-grip]')].map((g) => g.getAttribute('data-grip')).join(' '),
      [...el.querySelectorAll(':scope > [data-grip]')].every((g) => g.className === 'grasp-grip nodrag nopan nokey' && g.hasAttribute('data-pass')),
    ]), [planeOf(V), NODE]);
    const model = modelOf(EXAMPLE);
    const border = (id) => !!lib.KINDS[model.elements.find((e) => e.id === id).kind].onBorder;
    for (const [of, names, right] of grips) {
      const id = of.slice(3);
      if (border(id)) assert.equal(names.split(' ').length, 1, `The border item ${id} has the grips "${names}", not one.`);
      else assert.equal(names, 'top right bottom left', `The box ${id} has the grips "${names}".`);
      assert.ok(right, `A grip of ${id} lacks a class or data-pass.`);
    }

    // The pointer over Host shows its grips; its left grip is 14 of the view's units outside the middle of its left
    // side (a border item sits at the middle of its right side, and the way to that grip is under it).
    const before = await cameraOf(page, V);
    const host = await boxOf(page, V, 'Host');
    await page.mouse.move(host.x + 30 * host.zoom, host.y + 20 * host.zoom);
    const grip = await soon(page, () => page.evaluate((s) => {
      const el = document.querySelector(s);
      const r = el.getBoundingClientRect();
      return getComputedStyle(el).visibility === 'visible' ? { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width } : null;
    }, `:is(${thingOf(V, 'el', 'Host')}) > [data-grip="left"]`), 'The pointer over Host does not show its grips.');
    assert.ok(near(grip.x, host.x - 14 * host.zoom, 0.6) && near(grip.y, host.y + host.height / 2, 0.6), `Host's left grip is at ${grip.x - host.x}, ${grip.y - host.y - host.height / 2} from the middle of its left side.`);
    assert.ok(near(grip.width, 8 * host.zoom, 0.3));

    // A press on it and a drag: the gesture is handed the node's element, the node and the plane stay, the root says connecting.
    await page.mouse.move(host.x + 4, host.y + host.height / 2);
    await page.mouse.move(grip.x, grip.y);
    await page.mouse.down();
    assert.deepEqual([(await probe()).grip, (await probe()).element, (await probe()).relationship, (await probe()).ends], ['left', 'Host', null, null]);
    const app = await boxOf(page, V, 'App');
    const to = { x: app.x + app.width / 2, y: app.y + 20 * app.zoom };
    await page.mouse.move(grip.x + 10, grip.y + 30, { steps: 3 });
    await soon(page, async () => (await root('data-connecting')) === '', 'With a line in hand the root does not carry data-connecting.');
    await page.mouse.move(to.x, to.y, { steps: 6 });
    assert.equal((await probe()).over, 'el:App', 'hitAt, asked by the gesture, does not find the box under the pointer.');
    assert.equal(await page.evaluate((s) => document.querySelector(s).getAttribute('data-over'), thingOf(V, 'el', 'App')), 'fits', 'body.mark did not outline the box the line is over.');
    const outlined = await page.evaluate((s) => getComputedStyle(document.querySelector(s)).outlineStyle, thingOf(V, 'el', 'App'));
    assert.equal(outlined, 'dashed');
    assert.deepEqual(await boxOf(page, V, 'Host'), host, 'A drag from a grip moved its node.');
    assert.deepEqual(await cameraOf(page, V), before, 'A drag from a grip moved the plane.');
    await page.mouse.up();
    await soon(page, async () => (await root('data-connecting')) === null, 'After the release the root still carries data-connecting.');
    assert.equal(await page.evaluate((s) => document.querySelector(s).getAttribute('data-over'), thingOf(V, 'el', 'App')), null);
    await frame(page);
    assert.deepEqual(await B(page, 'picked', FILE), [], 'The click that follows the release picked something.');
    assert.equal(await B(page, 'steps', FILE), 0);

    // A press on a grip let go at once is no click on its node either, and with a tool in hand it places nothing.
    await B(page, 'arm', FILE, 'PartDefinition');
    await page.mouse.move(host.x + 4, host.y + host.height / 2);
    await page.mouse.move(grip.x, grip.y);
    await page.mouse.down();
    await page.mouse.up();
    await frame(page);
    assert.deepEqual([await B(page, 'picked', FILE), await B(page, 'steps', FILE), await B(page, 'armed', FILE)], [[], 0, 'PartDefinition'], 'A click on a grip picked or placed something.');
    await B(page, 'arm', FILE, 'PartDefinition');

    // A selected line shows a grip at each drawn end: a press hands over its relationship and its two ends.
    await B(page, 'pick', FILE, [{ type: 'rel', id: 's-DevHost' }]);
    const ends = await soon(page, () => page.evaluate((s) => {
      const edge = document.querySelector(s);
      const path = edge.querySelector('path.grasp-line');
      const circles = [...edge.querySelectorAll('circle[data-grip]')];
      if (circles.length !== 2) return null;
      const a = path.getPointAtLength(0);
      const b = path.getPointAtLength(path.getTotalLength());
      const r = circles[1].getBoundingClientRect();
      return { names: circles.map((c) => c.getAttribute('data-grip')), at: circles.map((c) => ({ x: Number(c.getAttribute('cx')), y: Number(c.getAttribute('cy')) })), path: [{ x: a.x, y: a.y }, { x: b.x, y: b.y }], to: { x: r.x + r.width / 2, y: r.y + r.height / 2 } };
    }, thingOf(V, 'rel', 's-DevHost')), 'A selected line shows no grip at each end.');
    assert.deepEqual(ends.names, ['from', 'to']);
    for (const i of [0, 1]) assert.ok(near(ends.at[i].x, ends.path[i].x, 0.01) && near(ends.at[i].y, ends.path[i].y, 0.01), 'A line\'s grip is not at its drawn end.');
    // The grip's outer half is clear of the node the line ends on.
    const hostNow = await boxOf(page, V, 'Host');
    const press = { x: ends.to.x, y: ends.to.y < hostNow.y ? ends.to.y - 2 : ends.to.y + 2 };
    // The pointer comes from the ground: while it is over Host, or on one of Host's grips, the way to Host's own grip
    // at the middle of that side lies over the line's.
    const bare = await groundPoint(page, { id: V, name: V });
    await page.mouse.move(bare.x, bare.y);
    await page.mouse.move(press.x, press.y);
    await page.mouse.down();
    await page.mouse.up();
    const saw = await probe();
    assert.deepEqual([saw.grip, saw.element, saw.relationship], ['to', null, 's-DevHost']);
    assert.deepEqual(saw.ends, { from: ends.at[0], to: ends.at[1] });
    assert.deepEqual(await B(page, 'picked', FILE), [{ type: 'rel', id: 's-DevHost' }], 'A press on a line\'s grip changed what is picked.');

    // Far, no grip is mounted.
    await zoomTo(page, { id: V, name: V }, 'Host', 0.2);
    await soon(page, () => page.evaluate((plane) => document.querySelectorAll(`${plane} [data-grip]`).length === 0, planeOf(V)), 'Far, a node still has grips.');
    await finish(opened);
  });

  test('a graph body of another renderer is drawn by the plane: who a node is, its entry\'s plane props, and only the pressed node moves', async () => {
    // Stand-ins for packages 2-10 and 2-11: a reader that gives a Projection (core.mjs), node and edge types that add
    // none to slice 1's (so the entry counts as built), and for the sequence view an ender.
    const TYPES = 'export const nodeTypes = {}; export const edgeTypes = {};';
    const geometry = STAND_IN_PLANE_READER.replace(/sequenceReader/g, 'geometryReader').replace(/\bASKED\b/g, 'GEO_ASKED')
      .replace(/export function sequenceStep[^\n]*\n\s*export function sequenceResult[^\n]*\n/, 'export function geometryResult(): null { return null; }\n');
    assert.ok(geometry.includes('geometryResult') && !geometry.includes('sequence'));
    const SEQ = 'sequence.json';
    const GEO = 'geometry.json';
    const opened = await openPage(browser, {
      url: await bench({
        files: [fixture(SEQ), fixture(GEO)],
        views: [{ file: SEQ, view: 'v-seq', width: 900, height: 620 }, { file: GEO, view: 'v-plan', width: 420, height: 300 }],
        swaps: {
          'core/readers/sequence': STAND_IN_PLANE_READER, 'core/actions/sequence': STAND_IN_PLANE_ACTIONS, 'plane/nodes/sequence/index': TYPES,
          'core/readers/geometry': geometry, 'plane/nodes/geometry/index': TYPES,
        },
      }),
    });
    const { page } = opened;
    await untilNodes(page, 'v-seq', 7);
    await untilNodes(page, 'v-plan', 5);
    const nodeAt = (view, id) => `${planeOf(view)} ${NODE}[data-id=${JSON.stringify(id)}]`;
    const selected = (view) => page.evaluate(([plane, node]) => [...document.querySelectorAll(`${plane} ${node}.selected`)].map((el) => el.getAttribute('data-id')), [planeOf(view), NODE]);
    const middle = async (selector) => { const r = await rectOf(page, selector); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; };

    // Who a node is: its element, which two nodes can share and one can lack.
    assert.deepEqual(await thingsIn(page, 'v-seq'), ['el:Login.auth', 'el:Login.client', 'el:Login.client.loginDone', 'el:Login.client.loginSent', 'el:Login.server', 'rel:m-login']);
    assert.equal(await page.locator(thingOf('v-seq', 'el', 'Login.client')).count(), 2, 'A lifeline\'s two nodes both say its element.');
    assert.equal(await page.locator(`${nodeAt('v-seq', 'axes')} [data-of]`).count(), 0, 'A node that stands for no element carries no data-of.');

    // A click on a node with no element is a click on the ground: the view is picked.
    let p = await middle(nodeAt('v-seq', 'axes'));
    await page.mouse.click(p.x, p.y);
    assert.deepEqual((await B(page, 'hits')).at(-1).type, 'ground');
    assert.deepEqual(await B(page, 'picked', SEQ), [{ type: 'view', id: 'v-seq' }]);
    assert.deepEqual(await selected('v-seq'), [], 'A node that stands for no element is never selected.');
    // A click on the second node of an element picks the element, and both its nodes are selected.
    p = await middle(nodeAt('v-seq', 'Login.client:line'));
    await page.mouse.click(p.x, p.y);
    const hit = (await B(page, 'hits')).at(-1);
    assert.deepEqual([hit.view, hit.type, hit.id], ['v-seq', 'el', 'Login.client'], 'A Hit names the node\'s element, never the node\'s id.');
    await soon(page, async () => (await selected('v-seq')).length === 2, 'The two nodes of a picked element are not both selected.');
    assert.deepEqual((await selected('v-seq')).sort(), ['Login.client', 'Login.client:line']);
    // A right-click on it opens the palette with the same element.
    await page.mouse.click(p.x, p.y, { button: 'right' });
    await soon(page, async () => (await page.locator(byTestId(TESTIDS.palette)).count()) === 1, 'A right-click on a node opened no palette.');
    await page.keyboard.press('Escape');
    await soon(page, async () => (await page.locator(byTestId(TESTIDS.palette)).count()) === 0, 'Escape did not close the palette.');

    // A drag with two heads picked: React Flow drags both, and only the one the press named moves, held to its row.
    // The press is on the later of the two, so the store cannot have taken the first node React Flow reports.
    await B(page, 'pick', SEQ, [{ type: 'el', id: 'Login.server' }, { type: 'el', id: 'Login.auth' }]);
    await soon(page, async () => (await selected('v-seq')).length === 2, 'Two picked heads are not selected.');
    const server = await rectOf(page, nodeAt('v-seq', 'Login.server'));
    const auth = await rectOf(page, nodeAt('v-seq', 'Login.auth'));
    const zoom = (await cameraOf(page, 'v-seq')).zoom;
    await page.mouse.move(auth.x + 20, auth.y + 30);
    await page.mouse.down();
    await page.mouse.move(auth.x + 20 + 60, auth.y + 30 + 40, { steps: 6 });
    let now = await rectOf(page, nodeAt('v-seq', 'Login.auth'));
    assert.ok(near(now.x, auth.x + 60, 1.5) && near(now.y, auth.y, 0.5), `The pressed head went by ${now.x - auth.x}, ${now.y - auth.y}: the reader's step holds it to its row.`);
    assert.deepEqual(await rectOf(page, nodeAt('v-seq', 'Login.server')), server, 'A picked node the press did not name moved with it.');
    await page.mouse.up();
    await soon(page, async () => (await B(page, 'steps', SEQ)) === 1, 'The drop of a head was not written by its kind\'s ender, as one step.');
    now = await rectOf(page, nodeAt('v-seq', 'Login.auth'));
    assert.ok(near(now.x, auth.x + Math.round(60 / zoom) * zoom, 1.5) && near(now.y, auth.y, 0.5), 'After the drop the head is not where the ender wrote it.');
    assert.deepEqual(await rectOf(page, nodeAt('v-seq', 'Login.server')), server);
    assert.deepEqual((await selected('v-seq')).sort(), ['Login.auth', 'Login.server'], 'A drag changed what is picked.');

    // An entry's plane props: React Flow raises a selected node, and the geometry view's entry turns that off.
    const z = (view, id) => page.evaluate((s) => Number(getComputedStyle(document.querySelector(s)).zIndex), nodeAt(view, id));
    assert.ok((await z('v-seq', 'Login.auth')) >= 1000, 'In a view whose entry sets no plane prop a selected node is raised, as React Flow does by itself.');
    await B(page, 'pick', GEO, [{ type: 'el', id: 'room' }]);
    await soon(page, async () => (await selected('v-plan')).join() === 'room', 'A picked footprint is not selected.');
    assert.ok((await z('v-plan', 'room')) < 1000, 'In a geometry view a selected node is raised: its entry\'s elevateNodesOnSelect did not reach React Flow.');
    await finish(opened);
  });

  test('without a gesture no grip is mounted and the root says nothing of grips', async () => {
    const opened = await openPage(browser, { url: await rowsBench() });
    const { page } = opened;
    await untilNodes(page, 'v-proof', 13);
    await selectBox(page, { id: 'v-proof', name: 'v-proof' }, 'Host');
    const found = await page.evaluate((plane) => {
      const root = document.querySelector(plane);
      return [root.querySelectorAll('[data-grip]').length, root.hasAttribute('data-grips'), root.hasAttribute('data-connecting'), root.querySelectorAll('.grasp-marks *').length];
    }, planeOf('v-proof'));
    assert.deepEqual(found, [0, false, false, 0], 'The skeleton mounts a grip, or an attribute of the grips, or draws a pin or a badge.');
    await finish(opened);
  });
});

// ---- Without a browser.

// ---- The shell's seams (seams 8, 9 and 10): the controls of an action, the palette's actions, the toasts, the dock.
//
// In the built page, the table holds the scaffold's four rows (undo, redo, save, put-down), and the Undo and Redo
// buttons are the two controls of an action a person meets. For what needs a row no package has built yet (an entry
// of the palette, a control with choices, a new view's tab, the text tab, a section of Details), the tests below
// bundle the application itself, canvas/app/src/main.tsx, with stand-ins for a few files of core/actions/ and
// panels/, into a temporary folder: "the file as its package could build it". Nothing of it reaches canvas/dist.

/** What a control of an action says of itself. */
const controlOf = (page, selector) => page.evaluate((s) => {
  const el = document.querySelector(s);
  return el ? {
    action: el.getAttribute('data-action'), testid: el.getAttribute('data-testid'), tag: el.tagName, name: el.getAttribute('aria-label'),
    greyed: el.disabled === true || el.getAttribute('aria-disabled') === 'true', says: el.getAttribute('aria-description'),
  } : null;
}, selector);
/** The words of the tooltip of an element, after the pointer rests on it. */
async function tipOf(page, selector) {
  await page.mouse.move(700, 620);
  await soon(page, async () => (await page.locator('[role="tooltip"]').count()) === 0, 'A tooltip stays on the page after the pointer left its control.');
  const box = await rectOf(page, selector);
  assert.ok(box, `Nothing matches ${selector}.`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const tip = page.locator('[role="tooltip"]');
  await soon(page, async () => (await tip.count()) > 0, `The pointer rests on ${selector}, and no tooltip (role "tooltip") is shown.`);
  const words = (await tip.first().textContent()).trim();
  await page.mouse.move(700, 620);
  return words;
}
/** The names on the left strip, in their order from the top. */
const stripOf = (page) => page.evaluate(() => [...document.querySelectorAll('.dv-edge-group .grasp-side-tab')].map((el) => el.textContent.trim()));
/** The titles of the editor's tabs (not the strips'), in their order, and the one in front of each group. */
const editorTabs = (page) => page.evaluate(() => [...document.querySelectorAll('.dv-groupview:not(.dv-edge-group) .dv-tab')].map((el) => ({
  title: el.textContent.trim(), front: el.classList.contains('dv-active-tab'),
})));

describe('the shell\'s seams, in the built page', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  const VIEW = modelOf(EXAMPLE).views[0];
  const openExample = async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    await showView(opened.page, VIEW, linesOf(modelOf(EXAMPLE), VIEW).length);
    return opened;
  };
  /** Renames Host in Details: one change of the model, whose step is said as RENAMED. */
  const RENAMED = 'Renamed to part def Host2';
  async function rename(page) {
    await selectBox(page, VIEW, 'Host');
    const name = page.locator(`${byTestId(TESTIDS.details)} input${byTestId(TESTIDS.field('name'))}`);
    await soon(page, async () => (await name.count()) === 1, 'Details shows no name field for Host.');
    await name.fill('Host2');
    await page.locator(`${byTestId(TESTIDS.details)} .grasp-details-what`).click();
  }

  test('a greyed ActionButton carries its sentence', async () => {
    const opened = await openExample();
    const { page } = opened;
    const UNDO = byTestId(TESTIDS.undo);
    const REDO = byTestId(TESTIDS.redo);
    const SAVE = byTestId(TESTIDS.save);

    // Just opened: Undo and Redo are controls of their actions, greyed, each with its sentence as its description and its tooltip.
    assert.deepEqual(await controlOf(page, UNDO), { action: 'undo', testid: 'undo', tag: 'BUTTON', name: 'Undo', greyed: true, says: 'There is nothing to undo.' });
    assert.deepEqual(await controlOf(page, REDO), { action: 'redo', testid: 'redo', tag: 'BUTTON', name: 'Redo', greyed: true, says: 'There is nothing to redo.' });
    assert.equal(await tipOf(page, UNDO), 'There is nothing to undo.', 'A greyed Undo\'s tooltip is its sentence.');
    assert.equal(await tipOf(page, REDO), 'There is nothing to redo.', 'A greyed Redo\'s tooltip is its sentence.');
    assert.equal(await page.locator(actionControl('undo')).count(), 1, 'One control asks undo.');
    // Save has nothing to do yet: it is greyed as in slice 1, and asks nothing.
    assert.equal(await page.locator(SAVE).isDisabled(), true);

    // After a change: Undo applies, so it is no longer greyed and says nothing of itself; its tooltip names the step.
    await rename(page);
    await soon(page, async () => !(await controlOf(page, UNDO)).greyed, 'After a change Undo is still greyed.');
    assert.deepEqual(await controlOf(page, UNDO), { action: 'undo', testid: 'undo', tag: 'BUTTON', name: 'Undo', greyed: false, says: null });
    assert.equal(await tipOf(page, UNDO), `Undo ${RENAMED}`);
    assert.equal((await controlOf(page, REDO)).says, 'There is nothing to redo.', 'Redo is still greyed, with its sentence.');
    assert.deepEqual(await controlOf(page, SAVE), { action: 'save', testid: 'save', tag: 'BUTTON', name: 'Save', greyed: false, says: null }, 'With something to save, Save is a control of its action.');

    // A click asks the action; the control is asked again when the session tells.
    await page.locator(UNDO).click();
    await soon(page, async () => (await controlOf(page, UNDO)).greyed, 'After the one step was undone Undo is not greyed.');
    assert.equal((await controlOf(page, UNDO)).says, 'There is nothing to undo.');
    assert.deepEqual(await controlOf(page, REDO), { action: 'redo', testid: 'redo', tag: 'BUTTON', name: 'Redo', greyed: false, says: null });
    assert.equal(await tipOf(page, REDO), `Redo ${RENAMED}`);
    assert.equal(await toast(page), null, 'A greyed control says its sentence where it stands, not in a toast.');
    await finish(opened);

    // With no file open there is no session and no table: the three buttons are greyed and ask nothing.
    const bare = await openPage(browser, { picker: false });
    for (const id of [TESTIDS.save, TESTIDS.undo, TESTIDS.redo]) {
      const got = await controlOf(bare.page, byTestId(id));
      assert.deepEqual([got.action, got.greyed, got.says], [null, true, null], `With no file open the bar's ${id} is not a plain greyed button.`);
    }
    assert.equal(await bare.page.locator('[data-action]').count(), 0, 'With no file open no control asks an action.');
    await finish(bare);
  });

  test('the toast shows what was said last, by a tool or through saysOf, and carries data-said', async () => {
    const opened = await openExample();
    const { page } = opened;
    const tool = page.locator(`${byTestId(TESTIDS.tools)} button[data-testid="tool"][data-tool="PortUsage"]`);
    const refusedClick = async () => { const at = await groundPoint(page, VIEW); await page.mouse.click(at.x, at.y); };

    // Said through saysOf: a key of the table, where its action does not apply.
    await page.keyboard.press('Control+z');
    const a = await toastAfter(page, 0, 'Ctrl + Z with nothing to undo');
    assert.equal(a.text, 'There is nothing to undo.');
    assert.ok(Number.isInteger(a.said) && a.said >= 1, `The toast's data-said is ${a.said}, not a number that counts the sayings.`);
    // The same sentence said again is a new toast, with a larger number.
    await page.keyboard.press('Control+z');
    const again = await toastAfter(page, a.said, 'Ctrl + Z a second time');
    assert.equal(again.text, a.text);

    // Said by a tool: a port has no place on the ground. It takes the toast's place, with a larger number.
    await showSide(page, 'Tools');
    await tool.click();
    await refusedClick();
    const b = await toastAfter(page, again.said, 'A port clicked onto the ground');
    assert.notEqual(b.text, a.text);
    assert.equal(await page.locator(byTestId(TESTIDS.toast)).count(), 1, 'The page holds one toast at a time.');
    // Said through saysOf again, with the tool still in hand: whichever was said last is shown.
    await page.keyboard.press('Control+y');
    const c = await toastAfter(page, b.said, 'Ctrl + Y with nothing to redo');
    assert.equal(c.text, 'There is nothing to redo.');
    // The tool refuses again: its saying is the later one.
    await refusedClick();
    const d = await toastAfter(page, c.said, 'A second port clicked onto the ground');
    assert.equal(d.text, b.text);
    // The tool is put down: what it said goes, and what was said before it does not come up again.
    await tool.click();
    await soon(page, async () => (await toast(page)) === null, async () => `With the tool put down, the toast still shows ${JSON.stringify(await toast(page))}: an older saying came up again.`);
    await idle(page, 10);
    assert.equal(await toast(page), null);
    await finish(opened);
  });

  test('the Notes panel stands on the left strip after Validation, and the controls of rows that are not built are not shown', async () => {
    const opened = await openExample();
    const { page } = opened;
    assert.deepEqual(await stripOf(page), ['Explorer', 'Tools', 'Validation', 'Notes', 'Details'], 'The strips name Explorer, Tools, Validation and Notes on the left, and Details on the right.');
    const notes = await openNotes(page);
    assert.equal(await notes.count(), 1, 'The page holds more than one Notes panel (data-testid "notes").');
    assert.equal(await notes.locator('.grasp-side-title').textContent(), 'Notes');
    assert.ok((await notes.locator('.grasp-side-text').textContent()).length > 0, 'The Notes panel\'s skeleton says nothing.');
    // The panel in front is remembered as the others are.
    await page.reload();
    await page.waitForSelector(byTestId(TESTIDS.app));
    await soon(page, async () => (await rectOf(page, byTestId(TESTIDS.notes)))?.width > 0, 'After a reload the Notes panel is not in front again.');

    // No row of new-view, open-text or of the palette's actions is built: no control of theirs is in the page.
    await openStateFile(page, stateFileAt(EXAMPLE));
    await showView(page, VIEW, linesOf(modelOf(EXAMPLE), VIEW).length);
    assert.equal(await page.locator(`${byTestId(TESTIDS.newView)}, ${actionControl('new-view')}, ${actionControl('open-text')}`).count(), 0, 'A control of a row that is not built is shown.');
    assert.deepEqual((await editorTabs(page)).map((t) => t.title), [tabTitle(VIEW)], 'The editor holds something else than the view\'s tab.');
    const host = await boxOf(page, VIEW.id, 'Host');
    await page.mouse.click(host.x + 24 * host.zoom, host.y + 14 * host.zoom, { button: 'right' });
    await soon(page, async () => (await page.locator(byTestId(TESTIDS.palette)).count()) === 1, 'A right-click on Host opened no palette.');
    assert.equal(await page.locator(`${byTestId(TESTIDS.palette)} [data-action]`).count(), 0, 'The palette lists an action no package has built.');
    assert.equal(await page.locator(`${byTestId(TESTIDS.palette)} [role="separator"]`).count(), 1, 'With no action to list, the palette has no rule after its tools (one between its two groups).');
    await page.keyboard.press('Escape');
    // Details shows no section: none applies yet.
    await selectBox(page, VIEW, 'Host');
    await soon(page, async () => (await page.locator(`${byTestId(TESTIDS.details)} .grasp-details`).count()) === 1, 'Details shows no form for Host.');
    assert.deepEqual(await page.evaluate((root) => [...document.querySelector(`${root} .grasp-details`).children].map((el) => el.className.split(' ')[0]), byTestId(TESTIDS.details)),
      ['grasp-details-what', 'MuiTabs-root', 'grasp-details-page'], 'Details shows something under its form though no section applies.');
    await finish(opened);
  });
});

// The application with stand-ins: rows for a few actions that later packages build, a section of Details, and the
// camera's keys. Each stand-in writes as little as shows that it was asked: most say a sentence.
const STAND_IN_REMOVE_ROWS = `
  import type { Action } from '../commands';
  import { saysOf } from '../says';
  import { selectionOf } from '../selection';
  export const REMOVE_ACTIONS: readonly Action[] = [{
    id: 'delete', title: 'Delete', key: 'Delete',
    applies: (session, at) => {
      const on = at ? (at.type === 'ground' ? null : at) : (selectionOf(session).items.find((item) => item.type !== 'view') ?? null);
      return on ? true : 'Nothing is picked. Click a box or a line first.';
    },
    run: (session, at) => {
      const on = at ?? selectionOf(session).items[0];
      saysOf(session).say('A stand-in deleted ' + on.type + ':' + on.id + '.');
    },
  }];
`;
const STAND_IN_VIEW_ROWS = `
  export * from './views?real';
  import type { Action } from '../commands';
  import { saysOf } from '../says';
  export const VIEW_ACTIONS: readonly Action[] = [
    {
      id: 'show-in-view', title: 'Show in this view',
      choices: () => [{ id: 'App', title: 'part def App' }, { id: 'Page', title: 'part def Page' }],
      applies: (_session, at) => (at && at.type === 'el' ? true : 'This stand-in shows from an element only.'),
      run: (session, at, choice) => { saysOf(session).say('A stand-in showed ' + choice + ' from ' + at!.id + '.'); },
    },
    {
      id: 'new-view', title: 'New view',
      choices: () => [{ id: 'InterconnectionView', title: 'interconnection view' }, { id: 'GridView', title: 'grid view' }],
      applies: () => true,
      run: (session, _at, choice) => {
        const id = 'v-new' + (session.model.views.length + 1);
        const words = 'Added the view ' + id;
        session.history.edit(() => {
          session.model.views.push({ id, kind: choice, name: 'view' + session.model.views.length, doc: '', x: 0, y: 0, layout: {}, options: {} } as never);
          return words;
        });
        return { made: { type: 'view', id }, words };
      },
    },
  ];
`;
const STAND_IN_TEXT_ROWS = `
  import type { Action } from '../commands';
  import { handsOf } from '../hands';
  export const TEXT_ACTIONS: readonly Action[] = [
    { id: 'open-text', title: "Show the model's text", applies: () => true, run: (session) => { handsOf(session).hands?.showText(); } },
  ];
`;
const STAND_IN_NOTE_ROWS = `
  export * from './notes?real';
  import type { Action } from '../commands';
  import { handsOf } from '../hands';
  export const NOTE_ACTIONS: readonly Action[] = [
    { id: 'add-note', title: 'Add note', applies: (_session, at) => (at ? true : 'Pick a box or a line to note it, or right-click the plane where the note goes.'),
      run: (session) => { handsOf(session).hands?.showPanel('notes'); } },
  ];
`;
const STAND_IN_CAMERA_ROWS = `
  import type { Action } from '../commands';
  import { handsOf } from '../hands';
  import { selectionOf } from '../selection';
  const row = (id: string, title: string, key: string, how: 'in' | 'out' | 'fit'): Action => ({
    id, title, key,
    applies: (session) => (selectionOf(session).view !== null ? true : 'No view is in front.'),
    run: (session) => { handsOf(session).hands?.camera(selectionOf(session).view!, how); },
  });
  export const CAMERA_ACTIONS: readonly Action[] = [row('zoom-in', 'Zoom in', '+', 'in'), row('zoom-out', 'Zoom out', '-', 'out'), row('fit-view', 'Fit the view', '0', 'fit')];
`;
const STAND_IN_CODE_SECTION = `
  import type { Section, SectionProps } from './sections';
  export function CodeSection({ picked }: SectionProps): JSX.Element | null {
    return <div data-testid="code-section">{'A stand-in section for ' + picked.type + ':' + picked.id}</div>;
  }
  export const codeSection: Section = { id: 'code', applies: (_session, picked) => picked.type === 'el', Component: CodeSection };
`;
const SHELL_SWAPS = {
  'core/actions/remove': STAND_IN_REMOVE_ROWS,
  'core/actions/views': STAND_IN_VIEW_ROWS,
  'core/actions/text': STAND_IN_TEXT_ROWS,
  'core/actions/notes': STAND_IN_NOTE_ROWS,
  'core/actions/camera': STAND_IN_CAMERA_ROWS,
  'panels/CodeSection': STAND_IN_CODE_SECTION,
};

let shellPage = null;
/** Builds the application with SHELL_SWAPS into a temporary folder, once, and gives its URL. */
function shellBench() {
  shellPage ??= (async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grasp-shell-'));
    benches.push(dir);
    const result = await esbuild.build({
      absWorkingDir: ROOT,
      entryPoints: [path.join(SRC, 'main.tsx')],
      bundle: true,
      format: 'iife',
      platform: 'browser',
      target: 'chrome120',
      jsx: 'automatic',
      define: { 'process.env.NODE_ENV': '"production"', __GRASP_LIBRARIES__: JSON.stringify('[]') },
      outdir: dir,
      write: false,
      logLevel: 'silent',
      plugins: [standInPlugin(SHELL_SWAPS), vendorPlugin],
    });
    for (const out of result.outputFiles) fs.writeFileSync(path.join(dir, out.path.endsWith('.css') ? 'app.css' : 'app.js'), out.contents);
    fs.writeFileSync(path.join(dir, 'index.html'), [
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Grasp: the application with stand-ins, of seams.test.mjs</title>',
      `<link rel="stylesheet" href="${DIST_URL}vendor.css"><link rel="stylesheet" href="app.css"></head><body><div id="root"></div>`,
      `<script src="${DIST_URL}model-lib.js"></script><script src="${DIST_URL}vendor.js"></script>`,
      '<script src="app.js"></script></body></html>',
    ].join('\n'));
    return pathToFileURL(path.join(dir, 'index.html')).href;
  })();
  return shellPage;
}

describe('the shell\'s seams, in the application with stand-in rows', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => {
    await browser?.close();
    for (const dir of benches) fs.rmSync(dir, { recursive: true, force: true });
  });

  const MODEL = modelOf(EXAMPLE);
  const VIEW = MODEL.views[0];
  const PALETTE = byTestId(TESTIDS.palette);
  async function openShell() {
    const opened = await openPage(browser, { url: await shellBench(), picker: false });
    await openStateFile(opened.page, stateFileAt(EXAMPLE));
    await showView(opened.page, VIEW, linesOf(MODEL, VIEW).length);
    return opened;
  }
  /** Right-clicks a box where it is itself on top, or the ground, waits for the palette, and gives the point in the view's own units. */
  async function rightClick(page, on) {
    const at = on === 'ground' ? await rightClickOn(page, VIEW.id, 'ground') : await rightClickOn(page, VIEW.id, 'el', on);
    // Where that is in the view's own units, as the right-click's Hit has it.
    const plane = await rectOf(page, planeOf(VIEW.id));
    const camera = await cameraOf(page, VIEW.id);
    return { x: (at.x - plane.x - camera.x) / camera.zoom, y: (at.y - plane.y - camera.y) / camera.zoom };
  }
  /** The palette's children, in order: a tool's kind, 'rule', or an action's id as 'action:<id>'. */
  const paletteRows = (page) => page.evaluate((selector) => [...document.querySelector(selector).children].map((el) => {
    if (el.getAttribute('role') === 'separator') return 'rule';
    return el.hasAttribute('data-action') ? `action:${el.getAttribute('data-action')}` : el.getAttribute('data-tool') ?? `?${el.textContent}`;
  }), PALETTE);
  const noPalette = (page, why) => soon(page, async () => (await page.locator(PALETTE).count()) === 0, `${why}: the palette is still open.`);

  test('the palette lists an action that applies', async () => {
    const opened = await openShell();
    const { page } = opened;
    const core = await loadCore();
    const session = core.openText(lib, readText(EXAMPLE), { name: 'example.json' }, { now: clock() });
    const tools = (hit) => core.toolsOf(session).offers(hit).map((group) => group.map((tool) => tool.kind));
    const flat = (groups) => groups.flatMap((group, g) => (g > 0 ? ['rule', ...group] : group));

    // On a box: the creation tools as before, a rule, then the actions of PALETTE that are in the table and apply
    // there, in PALETTE's order: add-note, show-in-view, delete (edit-label, remove-from-view and the two of a
    // message have no row in this page).
    let at = await rightClick(page, 'Host');
    const onHost = tools({ view: VIEW.id, type: 'el', id: 'Host', at, add: false });
    assert.ok(onHost.length > 0);
    assert.deepEqual(await paletteRows(page), [...flat(onHost), 'rule', 'action:add-note', 'action:show-in-view', 'action:delete']);
    const del = `${PALETTE} ${actionControl('delete')}`;
    assert.deepEqual(await page.evaluate((s) => { const el = document.querySelector(s); return [el.getAttribute('role'), el.textContent.trim(), el.getAttribute('aria-disabled')]; }, del),
      ['menuitem', 'Delete', null], 'An action\'s entry is a menu entry that says the action\'s title.');
    // A click asks the action at the right-click's Hit, and the palette closes.
    await chooseAction(page, 'delete');
    await noPalette(page, 'After a click on Delete');
    assert.equal((await toastAfter(page, 0, 'The stand-in for delete')).text, 'A stand-in deleted el:Host.', 'The action was not asked at the right-click\'s Hit.');

    // On the ground: delete and show-in-view do not apply there, so they are not listed; add-note is.
    at = await rightClick(page, 'ground');
    const onGround = tools({ view: VIEW.id, type: 'ground', id: null, at, add: false });
    assert.deepEqual(await paletteRows(page), [...flat(onGround), 'rule', 'action:add-note']);
    await page.keyboard.press('Escape');
    await noPalette(page, 'After Escape');

    // An action with choices opens them as a second level; a choice asks the action with it, and both menus close.
    await rightClick(page, 'Host');
    const show = page.locator(`${PALETTE} ${actionControl('show-in-view')}`);
    assert.equal(await show.getAttribute('aria-haspopup'), 'menu');
    await show.click();
    const choices = page.locator('[data-choices="show-in-view"] [data-choice]');
    await soon(page, async () => (await choices.count()) === 2, 'A click on Show in this view opened no second level with its two choices.');
    assert.equal(await page.locator(PALETTE).count(), 1, 'The first level closed when the second opened.');
    assert.deepEqual(await choices.evaluateAll((els) => els.map((el) => [el.getAttribute('data-choice'), el.getAttribute('role'), el.textContent.trim()])),
      [['App', 'menuitem', 'part def App'], ['Page', 'menuitem', 'part def Page']]);
    const first = await rectOf(page, `${PALETTE} ${actionControl('show-in-view')}`);
    const second = await rectOf(page, '[data-choices="show-in-view"]');
    assert.ok(second.x >= first.right - 8 && near(second.y, first.y, 12), `The second level is at ${second.x}, ${second.y}, not to the right of its entry (${first.right}, ${first.y}).`);
    const before = (await toast(page))?.said ?? 0;
    await choices.nth(1).click();
    await noPalette(page, 'After a choice of the second level');
    assert.equal(await page.locator('[data-choices]').count(), 0, 'The second level is still open after a choice.');
    assert.equal((await toastAfter(page, before, 'The stand-in for show-in-view')).text, 'A stand-in showed Page from Host.');
    // The second level is worked by the keyboard: ArrowRight opens it, ArrowLeft closes it and leaves the first open.
    await rightClick(page, 'Host');
    await show.focus();
    await page.keyboard.press('ArrowRight');
    await soon(page, async () => (await choices.count()) === 2, 'ArrowRight on an entry with choices opened no second level.');
    await soon(page, () => page.evaluate(() => document.activeElement?.getAttribute('data-choice') === 'App'), 'The second level\'s first entry does not have the focus.');
    await page.keyboard.press('ArrowLeft');
    await soon(page, async () => (await choices.count()) === 0, 'ArrowLeft did not close the second level.');
    assert.equal(await page.locator(PALETTE).count(), 1, 'ArrowLeft closed the first level too.');
    await page.keyboard.press('Escape');
    await noPalette(page, 'After Escape');
    // As a test of another file chooses one: the entry, then its choice.
    const said = (await toast(page))?.said ?? 0;
    await rightClick(page, 'Host');
    await chooseAction(page, 'show-in-view', 'App');
    await noPalette(page, 'After a choice made through chooseAction');
    assert.equal((await toastAfter(page, said, 'The stand-in for show-in-view, asked with App')).text, 'A stand-in showed App from Host.');
    await finish(opened);
  });

  test('a key of an action acts from the page, and says why where the action does not apply', async () => {
    const opened = await openShell();
    const { page } = opened;
    // Delete with nothing picked: the stand-in's sentence, as a toast.
    await page.keyboard.press('Delete');
    const refused = await toastAfter(page, 0, 'Delete with nothing picked');
    assert.equal(refused.text, 'Nothing is picked. Click a box or a line first.');
    // With Host picked the key asks the action for the selection.
    await selectBox(page, VIEW, 'Host');
    await page.keyboard.press('Delete');
    assert.equal((await toastAfter(page, refused.said, 'Delete with Host picked')).text, 'A stand-in deleted el:Host.');
    // Backspace is no alias of Delete.
    const said = (await toast(page)).said;
    await page.keyboard.press('Backspace');
    await idle(page, 10);
    assert.equal((await toast(page))?.said ?? said, said, 'Backspace asked an action.');

    // The camera's keys reach the plane through the dock's hands: + zooms in by a step of 1.2, - out again, 0 fits.
    const start = await cameraOf(page, VIEW.id);
    await page.keyboard.press('+');
    let now = await soon(page, async () => { const c = await cameraOf(page, VIEW.id); return c.zoom !== start.zoom ? c : null; }, 'The key + did not zoom the plane in front.');
    assert.ok(near(now.zoom, start.zoom * 1.2, 0.001), `+ zoomed from ${start.zoom} to ${now.zoom}, not by a step of 1.2.`);
    await page.keyboard.press('=');
    now = await soon(page, async () => { const c = await cameraOf(page, VIEW.id); return near(c.zoom, start.zoom * 1.44, 0.001) ? c : null; }, 'The key = is not read as +.');
    await page.keyboard.press('-');
    await page.keyboard.press('_');
    await soon(page, async () => near((await cameraOf(page, VIEW.id)).zoom, start.zoom, 0.001), 'The keys - and _ did not zoom the plane out again.');
    await page.keyboard.press('+');
    await page.keyboard.press('0');
    await soon(page, async () => { const c = await cameraOf(page, VIEW.id); return near(c.zoom, start.zoom, 0.001) && near(c.x, start.x, 1) && near(c.y, start.y, 1); }, 'The key 0 did not fit the view again.');
    // A key typed into a text field is the field's.
    const name = page.locator(`${byTestId(TESTIDS.details)} input${byTestId(TESTIDS.field('name'))}`);
    await name.click();
    await page.keyboard.press('End');
    await page.keyboard.type('+0');
    await page.keyboard.press('Delete');
    assert.equal(await name.inputValue(), 'Host+0', 'A key typed into a field of Details did not reach the field.');
    assert.ok(near((await cameraOf(page, VIEW.id)).zoom, start.zoom, 0.001), 'A key typed into a text field moved the camera.');
    await finish(opened);
  });

  test('New view opens its choices as a menu, and the tabs follow the model\'s views', async () => {
    const opened = await openShell();
    const { page } = opened;
    const NEW = byTestId(TESTIDS.newView);
    const titles = async () => (await editorTabs(page)).map((t) => t.title);
    const front = async () => (await editorTabs(page)).filter((t) => t.front).map((t) => t.title);

    // The button stands at the end of the editor's tab bar, after the last tab, and is the one control of new-view.
    assert.deepEqual(await controlOf(page, NEW), { action: 'new-view', testid: 'new-view', tag: 'BUTTON', name: 'New view', greyed: false, says: null });
    assert.equal(await page.locator(actionControl('new-view')).count(), 1, 'The strips\' tab bars carry a New view button too.');
    const tab = await rectOf(page, '.dv-groupview:not(.dv-edge-group) .dv-tab');
    const button = await rectOf(page, NEW);
    assert.ok(button.x >= tab.right - 1 && button.y >= tab.y - 1 && button.bottom <= tab.bottom + 1, `New view (${JSON.stringify(button)}) does not stand in the tab bar after the tab (${JSON.stringify(tab)}).`);

    // A click opens the action's choices as a menu; a choice asks the action with it.
    await page.locator(NEW).click();
    const choices = page.locator('[data-choices="new-view"] [data-choice]');
    await soon(page, async () => (await choices.count()) === 2, 'A click on New view opened no menu of its choices.');
    assert.deepEqual(await choices.evaluateAll((els) => els.map((el) => [el.getAttribute('data-choice'), el.textContent.trim()])), [['InterconnectionView', 'interconnection view'], ['GridView', 'grid view']]);
    await page.keyboard.press('Escape');
    await soon(page, async () => (await choices.count()) === 0, 'Escape did not close the menu of choices.');
    assert.deepEqual(await titles(), [tabTitle(VIEW)], 'A menu closed by Escape made a view.');
    await page.locator(NEW).click();
    await choices.first().click();
    await soon(page, async () => (await choices.count()) === 0, 'A choice did not close the menu.');

    // The model has a view more: it gets its tab, in front, and what the action made is picked.
    const made = { name: 'view1', kind: 'InterconnectionView' };
    await soon(page, async () => (await titles()).length === 2, async () => `A view was added to the model, and the editor's tabs are ${JSON.stringify(await titles())}.`);
    assert.deepEqual(await titles(), [tabTitle(VIEW), tabTitle(made)]);
    assert.deepEqual(await front(), [tabTitle(made)], 'The new view\'s tab is not in front.');
    await soon(page, () => page.evaluate((root) => document.querySelector(`${root} .grasp-details`)?.getAttribute('data-picked') === 'view:v-new2', byTestId(TESTIDS.details)), 'The view the action made is not picked: Details does not show it.');
    await soon(page, async () => (await page.locator(`${byTestId(TESTIDS.plane)}[data-view="v-new2"]`).count()) === 1, 'The new view\'s tab holds no plane.');
    // Undo takes the view out of the model: its tab goes. Redo brings it back, in front.
    await page.locator(byTestId(TESTIDS.undo)).click();
    await soon(page, async () => (await titles()).length === 1, 'The tab of a view that left the model did not go.');
    assert.deepEqual(await front(), [tabTitle(VIEW)]);
    await page.locator(byTestId(TESTIDS.redo)).click();
    await soon(page, async () => (await titles()).length === 2, 'The tab of a view that came back with Redo did not come back.');
    assert.deepEqual(await front(), [tabTitle(made)]);
    // A tab a person closed stays closed while another view comes: only the new one gets a tab.
    const closing = await viewTab(page, VIEW);
    await closing.click();
    await closing.locator('.dv-default-tab-action').click();
    await soon(page, async () => (await titles()).length === 1, 'A click on a tab\'s close button did not close it.');
    await page.locator(NEW).click();
    await choices.nth(1).click();
    const grid = { name: 'view2', kind: 'GridView' };
    await soon(page, async () => (await titles()).length === 2, 'A second new view got no tab.');
    assert.deepEqual(await titles(), [tabTitle(made), tabTitle(grid)], 'The tab a person closed came back when another view was added.');
    assert.deepEqual(await front(), [tabTitle(grid)]);
    await finish(opened);
  });

  test('the dock lends its hands: the text tab, and a side panel shown', async () => {
    const opened = await openShell();
    const { page } = opened;
    const TEXT = `${MODEL.package.name}.sysml`;
    const titles = async () => (await editorTabs(page)).map((t) => t.title);
    const front = async () => (await editorTabs(page)).filter((t) => t.front).map((t) => t.title);

    // The Text button of the bar is an icon button for open-text, there once the row is.
    const text = `${byTestId(TESTIDS.topBar)} ${actionControl('open-text')}`;
    const got = await controlOf(page, text);
    assert.deepEqual([got.tag, got.name, got.greyed], ['BUTTON', 'Show the model\'s text', false]);
    assert.equal((await page.locator(text).textContent()).trim(), '', 'The bar holds icon buttons only.');
    // It opens the text tab beside the view's, titled <package name>.sysml, in front.
    await page.locator(text).click();
    await soon(page, async () => (await titles()).length === 2, 'open-text opened no tab.');
    assert.deepEqual(await titles(), [tabTitle(VIEW), TEXT]);
    assert.deepEqual(await front(), [TEXT]);
    // The view that was in front is still the session's view in front: the Tools view lists its tools.
    await showSide(page, 'Tools');
    assert.equal(await page.locator(`${byTestId(TESTIDS.tools)} [data-testid="tools-view"]`).textContent(), tabTitle(VIEW));
    // Asked again while the view's tab is in front, it brings the one text tab to the front.
    await (await viewTab(page, VIEW)).click();
    await soon(page, async () => (await front())[0] === tabTitle(VIEW), 'A click on the view\'s tab did not bring it to the front.');
    await page.locator(text).click();
    await soon(page, async () => (await front())[0] === TEXT, 'open-text did not bring the text tab to the front.');
    assert.deepEqual(await titles(), [tabTitle(VIEW), TEXT], 'A second text tab was opened.');
    // Another file opened takes the text tab away with the views' tabs.
    await openStateFile(page, stateFileAt(fixture('interconnection.json')));
    await soon(page, async () => !(await titles()).includes(TEXT), 'The text tab of the file before is still there.');

    // showPanel: a side panel that is behind another, or whose side is collapsed, is shown.
    await openStateFile(page, stateFileAt(EXAMPLE));
    await showView(page, VIEW, linesOf(MODEL, VIEW).length);
    const notesShown = async () => ((await rectOf(page, byTestId(TESTIDS.notes)))?.width ?? 0) > 0;
    const addNote = async () => {
      await rightClick(page, 'Host');
      await chooseAction(page, 'add-note');
      await noPalette(page, 'After Add note');
    };
    assert.equal(await notesShown(), false, 'The Notes panel is in front before anything asked for it.');
    await addNote();
    await soon(page, notesShown, 'showPanel("notes") did not bring the Notes panel to the front.');
    // Collapse the left side by a click on the name in front, and ask again.
    await page.getByRole('tab', { name: 'Notes', exact: true }).click();
    await soon(page, async () => !(await notesShown()), 'A click on the name in front did not collapse the left side.');
    await addNote();
    await soon(page, notesShown, 'showPanel("notes") did not open the collapsed side.');
    await finish(opened);
  });

  test('Details shows, under its form, each section that applies', async () => {
    const opened = await openShell();
    const { page } = opened;
    const DETAILS = byTestId(TESTIDS.details);
    const parts = () => page.evaluate((root) => [...(document.querySelector(`${root} .grasp-details`)?.children ?? [])].map((el) => el.getAttribute('data-testid') ?? el.className.split(' ')[0]), DETAILS);
    // An element: the stand-in's section applies, and stands under the form, inside the form's root.
    await selectBox(page, VIEW, 'Host');
    await soon(page, async () => (await parts()).includes('code-section'), async () => `With Host picked, Details holds ${JSON.stringify(await parts())}: the section that applies is not shown.`);
    assert.deepEqual(await parts(), ['grasp-details-what', 'MuiTabs-root', 'grasp-details-page', 'code-section']);
    assert.equal(await page.locator(`${DETAILS} ${byTestId(TESTIDS.codeSection)}`).textContent(), 'A stand-in section for el:Host');
    // It stays under the Advanced tab's page too.
    await page.locator(DETAILS).getByRole('tab', { name: 'Advanced', exact: true }).click();
    await soon(page, () => page.evaluate((root) => document.querySelector(`${root} .grasp-details-page`)?.getAttribute('data-tab') === 'Advanced', DETAILS), 'The Advanced tab is not shown.');
    assert.deepEqual(await parts(), ['grasp-details-what', 'MuiTabs-root', 'grasp-details-page', 'code-section']);
    // A view: it does not apply, and nothing stands under the form.
    const ground = await groundPoint(page, VIEW);
    await page.mouse.click(ground.x, ground.y);
    await soon(page, () => page.evaluate((root) => document.querySelector(`${root} .grasp-details`)?.getAttribute('data-picked')?.startsWith('view:') === true, DETAILS), 'A click on the ground did not pick the view.');
    assert.deepEqual(await parts(), ['grasp-details-what', 'MuiTabs-root', 'grasp-details-page']);
    await finish(opened);
  });
});

describe('the hooks of Details\' fields, joined from panels/hooks', () => {
  test('fieldHooks holds its own hooks, the sequence file\'s and the geometry file\'s, and a hook a package adds is the field\'s', async () => {
    const real = await loadWith('panels/fieldHooks');
    assert.equal(typeof real.SEQUENCE_HOOKS, 'object');
    assert.deepEqual(Object.keys(real.GEOMETRY_HOOKS), [], 'The geometry file\'s table is empty in the scaffold.');
    assert.deepEqual(Object.keys(real.SEQUENCE_HOOKS), ['order'], 'The sequence file holds the order hook, moved as it is.');
    assert.equal(real.FIELD_HOOKS.order, real.SEQUENCE_HOOKS.order, 'The order hook of the form is the sequence file\'s.');
    assert.equal(real.FIELD_HOOKS.order.locked(), real.ORDER_LOCKED);
    for (const name of ['name', 'abstract', 'type', 'typeLine', 'specializes', 'subsets', 'parallel']) assert.ok(real.FIELD_HOOKS[name], `fieldHooks lost its own hook ${name}.`);

    // The geometry file as its package could build it: a hook that locks a spatial field.
    const app = await loadCoreWith({
      'panels/hooks/geometry': `
        import type { FieldHook } from '../fieldHooks';
        export const GEOMETRY_HOOKS: Readonly<Record<string, FieldHook>> = { posX: { locked: () => 'A stand-in locks x.' } };
      `,
    }, 'panels/fieldHooks');
    const file = fixture('geometry.json');
    const s = app.openText(lib, readText(file), { name: 'geometry.json' }, { now: clock() });
    const placed = Object.keys(modelOf(file).views.find((v) => v.kind === 'GeometryView').layout)[0];
    const rows = (form) => [...form.core.flatMap((group) => group.rows), ...form.advanced].filter((row) => row.row === 'field');
    const withHook = rows(app.formOf(s, { type: 'el', id: placed }, null)).find((row) => row.field === 'posX');
    assert.ok(withHook, `The form of ${placed} has no posX field.`);
    assert.equal(withHook.locked, 'A stand-in locks x.', 'A hook of panels/hooks/geometry.ts is not the field\'s.');
    const sReal = real.openText(lib, readText(file), { name: 'geometry.json' }, { now: clock() });
    assert.equal(rows(real.formOf(sReal, { type: 'el', id: placed }, null)).find((row) => row.field === 'posX').locked, null, 'Without the stand-in the field has no lock.');
  });
});

describe('what a mounted body lends the shell', () => {
  test('a camera and a reveal are found by session and view, and a place asked for before its body is mounted is revealed when it mounts', async () => {
    const core = await loadWith('views/lends');
    const s = core.openText(lib, readText(EXAMPLE), { name: 'example.json' }, { now: clock() });
    const other = core.openText(lib, readText(EXAMPLE), { name: 'example.json' }, { now: clock() });
    const calls = [];
    assert.equal(core.lentCamera(s, 'v-proof', 'in'), false, 'With no body mounted there is no camera to move.');
    core.lentReveal(s, 'v-proof', { x: 1, y: 2, w: 3, h: 4 });
    core.lentReveal(s, 'v-proof', { x: 5, y: 6, w: 7, h: 8 });
    const back = core.lend(s, 'v-proof', { camera: (how) => calls.push(['camera', how]), reveal: (rect) => calls.push(['reveal', rect]) });
    assert.deepEqual(calls, [['reveal', { x: 5, y: 6, w: 7, h: 8 }]], 'The place asked for last while no body was mounted is revealed when the body mounts, once.');
    assert.equal(core.lentCamera(s, 'v-proof', 'fit'), true);
    core.lentReveal(s, 'v-proof', { x: 0, y: 0, w: 1, h: 1 });
    assert.deepEqual(calls.slice(1), [['camera', 'fit'], ['reveal', { x: 0, y: 0, w: 1, h: 1 }]]);
    assert.equal(core.lentCamera(other, 'v-proof', 'in'), false, 'Another session\'s view of the same id is another view.');
    assert.equal(core.lentCamera(s, 'another-view', 'in'), false);
    // A body that lends only reveal has no camera; a second body of the view takes the first one's place.
    const frameBack = core.lend(s, 'v-proof', { reveal: (rect) => calls.push(['frame', rect]) });
    assert.equal(core.lentCamera(s, 'v-proof', 'in'), false);
    back();
    core.lentReveal(s, 'v-proof', { x: 9, y: 9, w: 9, h: 9 });
    assert.deepEqual(calls.at(-1), ['frame', { x: 9, y: 9, w: 9, h: 9 }], 'The first body\'s taking back leaves the second one\'s lending.');
    frameBack();
    const n = calls.length;
    core.lentReveal(s, 'v-proof', { x: 1, y: 1, w: 1, h: 1 });
    assert.equal(calls.length, n, 'With its body gone, a place waits.');
  });
});
