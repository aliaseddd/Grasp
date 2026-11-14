// Shared by the core's tests, which run in Node and need no browser: the core (canvas/app/src/core/), bundled by
// esbuild in memory and run here, beside the model library as canvas/export.mjs loads it; the state files the tests
// open; and what they read and compare them with.
//
// The model library runs in a vm context of its own (loadLib), so the models it makes belong to another realm than
// the tests': compare them as JSON (JSON.stringify, or plain), never with deepEqual directly. What the core itself
// makes (what a change touched, what the listeners are told, a state file's object) belongs to this realm.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import * as esbuild from 'esbuild';
import { loadLib } from '../../export.mjs';

/** The repository's root. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
/** The core's entry, which the bundle starts from. */
export const CORE = path.join(ROOT, 'canvas', 'app', 'src', 'core', 'index.ts');
/** The example, a state file in version 2 of the format. */
export const EXAMPLE = path.join(ROOT, 'canvas', 'examples', 'stronghold-proof.json');
/** The old page's fixtures: a state file per view kind and one saved in version 1, each with its export pinned. */
export const FIXTURES = path.join(ROOT, 'canvas', 'test', 'fixtures');
/** The script that prints a state file's text. */
export const EXPORT = path.join(ROOT, 'canvas', 'export.mjs');

/** The model library, as canvas/export.mjs runs it: what the page has as window.SysMLModel. */
export const lib = loadLib();

let core = null;
/**
 * The core's exports: canvas/app/src/core/index.ts and what it imports, bundled in memory and run in this realm, once
 * for a test file. The core reads no global for the model library: give `lib` to whatever opens a file.
 */
export function loadCore() {
  core ??= bundle();
  return core;
}
async function bundle() {
  const result = await esbuild.build({
    absWorkingDir: ROOT,
    entryPoints: [CORE],
    bundle: true,
    format: 'cjs',
    platform: 'neutral',
    target: 'es2022',
    write: false,
    logLevel: 'silent',
  });
  const module = { exports: {} };
  const run = vm.runInThisContext(`(function (module, exports) {${result.outputFiles[0].text}\n})`, { filename: 'canvas/app/src/core/index.ts (bundled)' });
  run(module, module.exports);
  return module.exports;
}

let planes = null;
/**
 * The core AND a view's store (canvas/app/src/plane/viewStore.ts) in one bundle, run in this realm, once for a test
 * file: the entry is an in-memory module that re-exports both, so the store and the session it is given share one copy
 * of the core. Its exports hold `viewStoreOf`, `viewStoresOf`, `openText`, `fit`, `FAR` and the rest of the core. The
 * store imports React Flow's types only (`import type`), which esbuild erases, so nothing of React Flow is bundled.
 */
export function loadPlanes() {
  planes ??= bundlePlanes();
  return planes;
}
async function bundlePlanes() {
  const result = await esbuild.build({
    absWorkingDir: ROOT,
    stdin: {
      contents: "export * from './core/index'; export * from './plane/viewStore';",
      resolveDir: path.join(ROOT, 'canvas', 'app', 'src'),
      sourcefile: 'planes-entry.ts',
      loader: 'ts',
    },
    bundle: true,
    format: 'cjs',
    platform: 'neutral',
    target: 'es2022',
    write: false,
    logLevel: 'silent',
  });
  const module = { exports: {} };
  const run = vm.runInThisContext(`(function (module, exports) {${result.outputFiles[0].text}\n})`, { filename: 'canvas/app/src/plane/viewStore.ts (bundled with the core)' });
  run(module, module.exports);
  return module.exports;
}

const bundles = new Map();
/**
 * The core AND other modules of the application in one bundle, run in this realm, once for a test file and a list:
 * `files` are paths under canvas/app/src without their extension ('plane/viewStore', 'panels/fieldHooks'). The entry
 * is an in-memory module that re-exports the core and each of them, so they share one copy of the core, as
 * loadPlanes() says. Only modules that need no browser and import no library but for its types can be loaded so.
 *
 * From slice 2 these load so, beside 'plane/viewStore' and 'panels/fieldHooks' (each tried by the scaffold):
 * 'views/lends' (what a mounted body lends the shell), 'plane/gestures/connect' (the line in hand: `connectOf`,
 * `GRIP_DISTANCE`) and 'plane/gestures/pin' (`pinOf`). A component, a stylesheet's owner and views/bodies.ts (the
 * registry imports the bodies) do not: those are tested in the page, or on the bench of seams.test.mjs.
 */
export function loadWith(...files) {
  const key = files.join('\n');
  if (!bundles.has(key)) bundles.set(key, bundleWith(files));
  return bundles.get(key);
}
async function bundleWith(files) {
  const result = await esbuild.build({
    absWorkingDir: ROOT,
    stdin: {
      contents: ["export * from './core/index';", ...files.map((file) => `export * from './${file}';`)].join(' '),
      resolveDir: path.join(ROOT, 'canvas', 'app', 'src'),
      sourcefile: 'with-entry.ts',
      loader: 'ts',
    },
    bundle: true,
    format: 'cjs',
    platform: 'neutral',
    target: 'es2022',
    write: false,
    logLevel: 'silent',
  });
  const module = { exports: {} };
  const run = vm.runInThisContext(`(function (module, exports) {${result.outputFiles[0].text}\n})`, { filename: `canvas/app/src/{core, ${files.join(', ')}} (bundled)` });
  run(module, module.exports);
  return module.exports;
}

const SRC = path.join(ROOT, 'canvas', 'app', 'src');
const standIns = new Map();
/**
 * The core with stand-ins for some of its modules (slice 2): `swaps` maps a module's path under canvas/app/src,
 * without its extension ('core/notes', 'core/actions/camera'), to the TypeScript source that takes its place in this
 * bundle. Whatever imports that module gets the stand-in, so a seam is tested as it will be used once a later package
 * has filled the skeleton behind it: a stand-in is "the file as its package could build it". `files` are further
 * modules to load beside the core, as loadWith() takes them. The bundle is made once for a test file and a set of
 * stand-ins, and is apart from loadCore()'s: its sessions and services are its own.
 *
 * A stand-in resolves its own imports from the folder of the module it stands in for, so './session' means what it
 * means there. To add to the real module instead of replacing it, a stand-in imports it as '<its path>?real'
 * (`export * from './checks?real'; export function entriesOf() { … }`: its own exports win over the starred ones).
 * Every stand-in of the tests begins so, even one that gives every export its skeleton has: a package may add exports
 * to its file that its other files import, and a stand-in without the star would not hold them, so the bundle would
 * not build.
 */
export function loadCoreWith(swaps, ...files) {
  const key = JSON.stringify([Object.entries(swaps).sort(([a], [b]) => (a < b ? -1 : 1)), files]);
  if (!standIns.has(key)) standIns.set(key, bundleStandIns(swaps, files));
  return standIns.get(key);
}
async function bundleStandIns(swaps, files) {
  const keyOf = (file) => path.relative(SRC, file).split(path.sep).join('/').replace(/\.tsx?$/, '');
  const plugin = {
    name: 'stand-ins',
    setup(build) {
      build.onResolve({ filter: /^\.\.?\// }, (args) => {
        if (args.path.endsWith('?real')) return { path: path.resolve(args.resolveDir, args.path.slice(0, -5)) + '.ts' };
        const file = path.resolve(args.resolveDir, args.path);
        return Object.hasOwn(swaps, keyOf(file)) ? { path: file + '.ts', namespace: 'stand-in' } : null;
      });
      build.onLoad({ filter: /.*/, namespace: 'stand-in' }, (args) => ({ contents: swaps[keyOf(args.path)], loader: 'ts', resolveDir: path.dirname(args.path) }));
    },
  };
  const result = await esbuild.build({
    absWorkingDir: ROOT,
    stdin: {
      contents: ["export * from './core/index';", ...files.map((file) => `export * from './${file}';`)].join(' '),
      resolveDir: SRC,
      sourcefile: 'stand-ins-entry.ts',
      loader: 'ts',
    },
    bundle: true,
    format: 'cjs',
    platform: 'neutral',
    target: 'es2022',
    write: false,
    logLevel: 'silent',
    plugins: [plugin],
  });
  const module = { exports: {} };
  const run = vm.runInThisContext(`(function (module, exports) {${result.outputFiles[0].text}\n})`, { filename: `canvas/app/src/core (bundled with stand-ins for ${Object.keys(swaps).join(', ')})` });
  run(module, module.exports);
  return module.exports;
}

/**
 * A stand-in for core/notes.ts as package 2-7 could build it, for loadCoreWith({ 'core/notes': STAND_IN_NOTES }): notes
 * that can be added, written, moved, removed and pointed at, with a mark that names their state, so that what reads
 * the notes (the session's `unsaved`, the marks, a state file) is tested before the real notes exist. It reads a file's
 * notes as they are and converts nothing. It also exports NOTES_LISTENERS, whose `now` counts the listeners the notes
 * of every session of the bundle have at this moment.
 */
export const STAND_IN_NOTES = `
  export * from './notes?real';
  import { fileNotesOf } from './session';
  import type { Session } from './session';
  type Rec = Record<string, unknown>;
  export const NOTES_LISTENERS = { now: 0 };
  const KEPT = new WeakMap<Session, unknown>();
  export function notesOf(session: Session): any {
    let kept = KEPT.get(session);
    if (kept) return kept;
    const file = fileNotesOf(session);
    let open: Rec[] = file.notes.slice() as Rec[];
    let archive: Rec[] = file.archive.slice() as Rec[];
    let mark = 0;
    let pointed: string | null = null;
    let attended: string | null = null;
    const listeners = new Set<() => void>();
    const tell = (): void => { for (const listener of Array.from(listeners)) listener(); };
    const changed = (): void => { mark += 1; tell(); };
    const placeOf = (on: Rec): Rec => ('view' in on ? { target: null, view: on.view, x: on.x, y: on.y } : { target: on.id });
    kept = {
      get open() { return open; },
      get archive() { return archive; },
      get attended() { return attended; },
      get pointed() { return pointed; },
      add(on: Rec) {
        const no = [...open, ...archive].reduce((top, n) => Math.max(top, typeof n?.no === 'number' ? n.no : 0), 0) + 1;
        const note = { id: 'n-stand-in-' + no, no, targetLabel: '', text: '', by: 'user', created: session.now(), updated: session.now(), response: '', resolved: false, ...placeOf(on) };
        open = [...open, note];
        changed();
        return note;
      },
      setText(id: string, text: string) { open = open.map((n) => (n?.id === id ? { ...n, text } : n)); changed(); },
      moveTo(id: string, on: Rec) { open = open.map((n) => (n?.id === id ? { ...n, view: undefined, x: undefined, y: undefined, ...placeOf(on) } : n)); changed(); },
      remove(id: string) { open = open.filter((n) => n?.id !== id); changed(); },
      archiveNote(id: string) { archive = [...archive, ...open.filter((n) => n?.id === id)]; open = open.filter((n) => n?.id !== id); changed(); },
      restore(id: string) { open = [...open, ...archive.filter((n) => n?.id === id)]; archive = archive.filter((n) => n?.id !== id); changed(); },
      attend(id: string | null) { if (id !== attended) { attended = id; tell(); } },
      point(id: string | null) { if (id !== pointed) { pointed = id; tell(); } },
      mark: () => mark,
      file: () => ({ notes: open, archive }),
      listen(listener: () => void) {
        const mine = (): void => listener();
        listeners.add(mine);
        NOTES_LISTENERS.now += 1;
        return () => { if (listeners.delete(mine)) NOTES_LISTENERS.now -= 1; };
      },
    };
    KEPT.set(session, kept);
    return kept;
  }
`;

/**
 * A stand-in for the entries of core/checks.ts as package 2-6 could build them, for
 * loadCoreWith({ 'core/checks': STAND_IN_ENTRIES }): the real checks, with an entriesOf that gives what a test set
 * with standInEntries(session, entries). What reads the entries hears of new ones as it hears of any: when the
 * session's checks tell, so after a change of the model.
 */
export const STAND_IN_ENTRIES = `
  export * from './checks?real';
  import type { Session } from './session';
  type StandInEntry = { list: string; message: string; about: { type: 'el' | 'rel' | 'view'; id: string } | null };
  const LISTS = new WeakMap<Session, readonly StandInEntry[]>();
  const NONE: readonly StandInEntry[] = [];
  export function entriesOf(session: Session): readonly StandInEntry[] { return LISTS.get(session) ?? NONE; }
  export function standInEntries(session: Session, entries: readonly StandInEntry[]): void { LISTS.set(session, entries); }
`;

/**
 * A stand-in for core/readers/sequence.ts as package 2-10 could build it, for a graph body of another renderer (seam
 * 3): it gives a Projection. One node of the shape `rect` for each place of the view, by the place's own x, y, w and h;
 * a second node of one element (`Login.client:line`, as a lifeline's line); one node that stands for no element
 * (`axes`); and one edge, `m-login`, when the view places both its ends. Its step holds a node to its row: y stays. It
 * also exports ASKED, which keeps what it was asked. Use it with STAND_IN_PLANE_ACTIONS, on the sequence fixture.
 */
export const STAND_IN_PLANE_READER = `
  export * from './sequence?real';
  import { LOOK } from '../adapter';
  import type { Ask, PlaneEdge, PlaneNode, Projection, Rect } from '../adapter';
  import { NO_MARKS } from '../marks';
  import type { Reader } from './index';
  export const ASKED: { read: { view: string; far: boolean; previous: boolean }[]; step: { start: Projection; asks: Ask[] }[]; listed: number } = { read: [], step: [], listed: 0 };
  function lay(view: string, places: [string, string | null, Rect][], far: boolean, before: Projection | null): Projection {
    const nodes: PlaneNode[] = [];
    const rects = new Map<string, Rect>();
    for (const [id, element, r] of places) {
      const was = before?.nodes.find((n) => n.id === id);
      rects.set(id, r);
      if (was && was.position.x === r.x && was.position.y === r.y && was.data.far === far && !was.dragging) { nodes.push(was); continue; }
      nodes.push({
        id, type: 'rect', position: { x: r.x, y: r.y }, width: r.w, height: r.h, measured: { width: r.w, height: r.h }, className: 'usage',
        ...(was?.selected ? { selected: true } : {}),
        data: { element, view, marks: was ? was.data.marks : NO_MARKS, form: 'box', far, keyword: '', name: far ? '' : id, compartments: [], glyph: null, least: { width: 10, height: 10 } },
      } as PlaneNode);
    }
    // The one line, when the view places both its ends.
    const ends = places.some(([id]) => id === 'Login.client.loginSent') && places.some(([id]) => id === 'Login.server');
    const wasEdge = before?.edges.find((e) => e.id === 'm-login');
    const edge = wasEdge && wasEdge.data.far === far ? wasEdge : {
      id: 'm-login', source: 'Login.client.loginSent', target: 'Login.server', type: 'line', className: 'message',
      ...(wasEdge?.selected ? { selected: true } : {}),
      data: { relationship: 'm-login', view, marks: wasEdge ? wasEdge.data.marks : NO_MARKS, route: 'straight', marker: null, label: far ? '' : 'login', labelOffset: 0, far, sourceBorder: false, targetBorder: false },
    } as PlaneEdge;
    return { view, far, look: LOOK, nodes, edges: ends ? [edge] : [], rects, bounds: { x: -40, y: -40, w: 800, h: 560 } };
  }
  const placesOf = (data: Projection): [string, string | null, Rect][] => data.nodes.map((n) => [n.id, n.data.element, data.rects.get(n.id)!]);
  export const sequenceReader: Reader<Projection> = {
    read(_lib, _model, view, options) {
      const before = (options?.previous ?? null) as Projection | null;
      ASKED.read.push({ view: view.id, far: options?.far === true, previous: before !== null });
      const places: [string, string | null, Rect][] = [];
      for (const [id, place] of Object.entries(view.layout)) {
        const r = place as Rect;
        places.push([id, id, { x: r.x, y: r.y, w: r.w, h: r.h }]);
        if (id === 'Login.client') places.push([id + ':line', id, { x: r.x + r.w / 2 - 8, y: r.y + r.h, w: 16, h: 400 }]);
      }
      places.push(['axes', null, { x: -40, y: -40, w: 20, h: 20 }]);
      return lay(view.id, places, options?.far === true, before);
    },
    sizeOf: () => ({ width: 800, height: 560 }),
    listed(data) {
      ASKED.listed += 1;
      return [
        ...data.nodes.filter((n) => n.data.element === n.id).map((n) => ({ type: 'el' as const, id: n.id, words: n.id, rect: data.rects.get(n.id)! })),
        ...data.edges.map((e) => ({ type: 'rel' as const, id: e.id, words: 'login', rect: { x: 16, y: 114, w: 250, h: 20 } })),
      ];
    },
    step(data, asks) {
      ASKED.step.push({ start: data, asks: [...asks] });
      const places = placesOf(data).map(([id, element, r]): [string, string | null, Rect] => {
        const ask = asks.find((a) => a.id === id);
        return ask && 'move' in ask ? [id, element, { ...r, x: ask.move.x }] : [id, element, r];   // a head stays in its row
      });
      return lay(data.view, places, data.far, data);
    },
  };
  export function sequenceStep(): never { throw new Error('a stand-in'); }
  export function sequenceResult(): null { return null; }
`;
/**
 * And for core/actions/sequence.ts: an ender that writes a head's x in one edit(), refuses one that went past 2000,
 * and writes nothing for one that ended where it began; no placer. It also exports ENDED, which keeps what the ender
 * was asked.
 */
export const STAND_IN_PLANE_ACTIONS = `
  export * from './sequence?real';
  import type { Ask, Projection } from '../adapter';
  import type { Action } from '../commands';
  import type { Ender, Placer } from '../readers/index';
  export const SEQUENCE_ACTIONS: readonly Action[] = [];
  export const ENDED: { view: string; start: Projection; asks: Ask[] }[] = [];
  export const place: Placer | null = null;
  export const end: Ender = (session, viewId, start, asks) => {
    ENDED.push({ view: viewId, start, asks: [...asks] });
    const ask = asks[0];
    if (!ask || !('move' in ask)) return null;
    const x = Math.round(ask.move.x);
    if (x > 2000) return { refused: 'A head cannot go that far.' };
    const lay = session.model.views.find((v) => v.id === viewId)!.layout[ask.id] as { x: number };
    if (lay.x === x) return null;
    return session.history.edit(() => { lay.x = x; return 'Moved ' + ask.id; });
  };
  export function moveMessage(): never { throw new Error('a stand-in'); }
`;

// ---- The generated model of criterion 4 (plan/slice-2.md, section 8, package 2-2, "How criterion 4's test is generated").

/** The view kinds a plane draws by the adapter's own rule, in the library's order: the four graph kinds. */
export const graphKinds = () => Object.keys(lib.VIEW_KINDS).filter((kind) => lib.VIEW_KINDS[kind].renderer === 'graph');
/** The element kinds a view kind admits, in its row's own order (`admits`), or every kind in the library's order where the row admits all (null). */
export const admittedBy = (viewKind) => (lib.VIEW_KINDS[viewKind].admits ?? Object.keys(lib.KINDS)).filter((kind) => lib.admits(viewKind, kind));

const PAIRS = { gapX: 80, gapY: 90, row: 1600, columns: 3, pitch: 70 };
let pairs = null;
/**
 * The generated model that the tests of criterion 4 use beside the ten files, for the pairs of kinds the files do not
 * hold: a state file's object (`{ format, revision, saved, model, notes, archive, changes }`), a fresh copy at each
 * call, of one model made once for a test file. Its ids are new at each run of a test file (the core makes them from
 * the time and Math.random); its names are not (`PartDef1`, `part1`, …: the core's freeName).
 *
 * **What it holds.** One view for each graph view kind (graphKinds()), with the id `v-<kind>` and the name
 * `pairs<kind>`, and in each view two elements of each kind the view admits (admittedBy()): the first of a kind, then
 * the second, kind after kind. A general view admits all 20 kinds, so it shows 40 elements; an interconnection view
 * 14, an action flow view 18, a state transition view 10. A view shows only its own elements, and the model holds no
 * relationship. So for each view kind and each ordered pair of kinds it admits, two of one kind included, the view
 * shows a pair of different elements of those kinds: 400 pairs of kinds in the general view, 49, 81 and 25 in the
 * other three.
 *
 * **How each element is placed**: by the core's own place(session, kind, hit), at the first place that takes it,
 * tried in this order: the ground, then inside or on each element of the view placed before it, in the order they
 * were placed. So a port lands on the first part def, a parameter and every control node on or in the first action
 * def (in a state transition view the done nodes and the initial nodes in the first state def), and everything
 * place() takes on the ground stands at the top of the package. An element nothing takes is a mistake: it throws.
 *
 * **Where.** The points are this function's choice, made so that no node lies on another and every grip is free:
 * - On the ground, the elements stand in rows, each with the room its final size needs (an owner grows as it is
 *   given things), with 80 between two in a row and 90 between rows, a row no wider than 1,600. The final sizes are
 *   found by making the model once with every ground element far from the others, and then again in rows.
 * - A border item (a port, a parameter) is put on its owner's right side at a quarter and at three quarters of it,
 *   then on its bottom, left and top sides in the same way: never at a side's middle, where a box's grip is.
 * - A control node is put inside its owner in three columns 70 apart, each lower than the one before it (the click is
 *   on the owner's bottom edge, so the owner grows by it).
 * The function checks what it made, as the view's reader lists it: every element of a view has a rectangle, and no
 * two that stand in one owner, or on the ground, overlap. It throws otherwise, so a change of the core's rules of
 * place shows here and not as a drag that misses.
 */
export async function pairsState() {
  pairs ??= makePairs();
  return plain(await pairs);
}
async function makePairs() {
  const core = await loadCore();
  const first = await layPairs(core, null);
  const second = await layPairs(core, first.sizes);
  return core.stateFile(second.session);
}
/** One making of the model: `sizes` is each view's ground elements' final sizes from the making before, or null for the first, which spreads them far apart. */
async function layPairs(core, sizes) {
  const model = lib.blank();
  model.package.name = 'Pairs';
  const viewKinds = graphKinds();
  model.views = viewKinds.map((kind, i) => ({ id: `v-${kind}`, kind, name: `pairs${kind}`, doc: '', x: i * 6000, y: 0, layout: {}, options: {} }));
  const session = core.openText(lib, JSON.stringify({ model, notes: [], archive: [] }), { name: 'pairs.json' }, { now: clock() });
  const reader = core.readerOf('graph');
  const rectsOf = (viewId) => new Map(reader.listed(core.readView(session, viewId).data).filter((l) => l.type === 'el').map((l) => [l.id, l.rect]));
  const out = {};
  for (const viewKind of viewKinds) {
    const viewId = `v-${viewKind}`;
    const placed = [];        // the ids of the view's elements, in the order they were placed
    const ground = [];        // those that stand on the ground
    const inside = new Map(); // how many things each owner was given: { border, boxes }
    // The ground's rows: where the next ground element goes, by the sizes of the making before.
    const known = sizes?.[viewKind] ?? null;
    let cursor = { x: 0, y: 0, high: 0 };
    const groundAt = (kind) => {
      const [w] = lib.KINDS[kind].size;
      const size = known?.[ground.length] ?? { w: 1000, h: 1000 };   // none for a kind the ground will refuse: its try moves no cursor
      if (cursor.x > 0 && cursor.x + size.w > PAIRS.row) cursor = { x: 0, y: cursor.y + cursor.high + PAIRS.gapY, high: 0 };
      const at = { x: cursor.x + w / 2, y: cursor.y + 20 };
      cursor = { x: cursor.x + size.w + PAIRS.gapX, y: cursor.y, high: Math.max(cursor.high, size.h) };
      return at;
    };
    const pointOn = (ownerId, kind) => {
      const r = rectsOf(viewId).get(ownerId);
      const [w, h] = lib.KINDS[kind].size;
      const given = inside.get(ownerId) ?? { border: 0, boxes: 0 };
      if (lib.KINDS[kind].onBorder) {
        const side = ['right', 'bottom', 'left', 'top'][(given.border >> 1) % 4];
        const along = given.border % 2 ? 0.75 : 0.25;
        if (side === 'right') return { x: r.x + r.w, y: r.y + r.h * along };
        if (side === 'bottom') return { x: r.x + r.w * along, y: r.y + r.h };
        if (side === 'left') return { x: r.x, y: r.y + r.h * along };
        return { x: r.x + r.w * along, y: r.y };
      }
      const x = Math.min(r.x + r.w, r.x + core.LOOK.pad + (given.boxes % PAIRS.columns) * PAIRS.pitch + w / 2);
      const top = core.LOOK.childTop + (core.NODE_HOME[kind] ? h / 2 : 20);
      return { x, y: given.boxes === 0 ? r.y + Math.min(r.h, top) : r.y + r.h };
    };
    for (const kind of admittedBy(viewKind)) {
      for (let n = 0; n < 2; n++) {
        const before = cursor;
        let made = core.place(session, kind, { view: viewId, type: 'ground', id: null, at: groundAt(kind), add: false });
        if ('refused' in made) {
          cursor = before;
          for (const id of placed) {
            made = core.place(session, kind, { view: viewId, type: 'el', id, at: pointOn(id, kind), add: false });
            if (!('refused' in made)) break;
          }
        }
        if ('refused' in made) throw new Error(`pairsState: nothing in ${lib.an(lib.VIEW_KINDS[viewKind].label)} takes ${lib.an(lib.KINDS[kind].label)}: ${made.refused}`);
        const el = session.model.elements.find((e) => e.id === made.made.id);
        placed.push(el.id);
        if (el.owner === undefined) ground.push(el.id);
        else {
          const given = inside.get(el.owner) ?? { border: 0, boxes: 0 };
          inside.set(el.owner, lib.KINDS[kind].onBorder ? { ...given, border: given.border + 1 } : { ...given, boxes: given.boxes + 1 });
        }
      }
    }
    const rects = rectsOf(viewId);
    out[viewKind] = ground.map((id) => ({ w: rects.get(id).w, h: rects.get(id).h }));
    if (sizes) checkPairs(session, viewKind, placed, rects);
  }
  return { session, sizes: out };
}
/** Throws unless every element of a view has a rectangle and no two that stand in one owner, or on the ground, overlap; border items are left out. */
function checkPairs(session, viewKind, placed, rects) {
  const els = placed.map((id) => session.model.elements.find((e) => e.id === id));
  for (const el of els) if (!rects.get(el.id)) throw new Error(`pairsState: the ${viewKind} lists no rectangle for ${lib.describe(session.model, el)}.`);
  const boxes = els.filter((el) => !lib.KINDS[el.kind].onBorder);
  for (const a of boxes) {
    for (const b of boxes) {
      if (a === b || a.owner !== b.owner) continue;
      const p = rects.get(a.id);
      const q = rects.get(b.id);
      if (p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h) {
        throw new Error(`pairsState: in the ${viewKind}, ${lib.describe(session.model, a)} and ${lib.describe(session.model, b)} overlap.`);
      }
    }
  }
}
/**
 * The state files the core's tests open: the example, then every fixture, each `{ name, file, pinned }`, where pinned
 * is the file that holds the text the state file exports. A fixture's is the .sysml file beside it. The example's is
 * format1.sysml: the example exports that text byte for byte (plan/slice-1.md, "The baseline run").
 */
export function stateFiles() {
  const fixtures = fs.readdirSync(FIXTURES).filter((name) => name.endsWith('.json')).sort().map((name) => (
    { name, file: path.join(FIXTURES, name), pinned: path.join(FIXTURES, name.replace(/\.json$/, '.sysml')) }
  ));
  return [{ name: path.basename(EXAMPLE), file: EXAMPLE, pinned: path.join(FIXTURES, 'format1.sysml') }, ...fixtures];
}

/** A file's text. */
export const readText = (file) => fs.readFileSync(file, 'utf8');
/** A file's JSON. */
export const readJSON = (file) => JSON.parse(readText(file));
/** A value as plain JSON data of this realm, which deepEqual compares whatever realm the value came from. */
export const plain = (value) => JSON.parse(JSON.stringify(value));

/** A clock for the core's `now`: each call gives the next second from `start`, so a test's times never vary. */
export function clock(start = '2026-11-12T12:00:00.000Z') {
  let next = Date.parse(start);
  return () => {
    const stamp = new Date(next).toISOString();
    next += 1000;
    return stamp;
  };
}
