// The history: the one way the model changes (edit), with what each change touched; the log Claude reads; what Undo
// takes back and Redo makes again; and the listeners every change is told to. It is the old page's
// canvas/src/core/page/changes.js, ported, and canvas/src/README.md, "Changing the model", is its contract. What
// differs from the old script:
//
// - Redo. Undo keeps what the step's keys and lists held just before it put the old values back, and Redo puts that
//   back. A new change empties the redo list; a run of changes that turns out to be no step gives it back.
// - Listeners in place of render(). A change, an Undo and a Redo tell the listeners what they touched and whether
//   they altered the structure (Told); the old script redrew the page and scheduled the save itself.
// - No page around it. A history is made for one model (createHistory) and holds it; the page's state, its Undo
//   button and its status line are the caller's. Opening a file is not a change: it makes a new history, with no
//   steps (session.ts). mark() names the model's state, for the session to say whether the file has unsaved changes.
// - Undo and Redo also put an object's keys back in the order they were in, so the model reads, and saves, exactly as
//   it did. The old script put a key it brought back last among its object's keys.
// - Nothing changed means every key holds what it held and every list its items. An equal list or item put in place
//   of another is a change, which the old script dropped when the change said nothing, and Undo then could not take
//   back the steps before it.
// - A change that throws is put back, where the old script left what it had written, in no step. A change, an Undo,
//   a Redo or the end of a run asked for inside a change is refused.
// - What a change touched is in the model's order even when a place's id names nothing: such an id comes last.
//
// canvas/app/test/history-walk.test.mjs runs this beside the old script, change for change, and makes each of these
// differences on both. Nothing here is React's, and nothing asks for a browser: the core's tests run it in Node.

// ---- The model, in the saved format grasp/2, as the model library's normalize gives it.

/** An element: a definition or a usage, with the fields its kind lists (KINDS[kind].fields in the model library). */
export interface ModelElement {
  id: string;
  kind: string;
  name: string;
  doc: string;
  /** The id of the element that owns it; a definition, and a usage on the package, has none. */
  owner?: string;
  [field: string]: unknown;
}

/** A relationship, drawn as a line from one element to another, with the fields its kind lists. */
export interface ModelRelationship {
  id: string;
  kind: string;
  from: string;
  to: string;
  /** A line the views don't draw (a port's typing). */
  hidden?: boolean;
  [field: string]: unknown;
}

/** Where a view shows an element: a box's place and least size, or a border item's side and how far along it is. */
export type Place = { x: number; y: number; w: number; h: number } | { side: string; at: number };

/** A view: its fields, its kind's options, and the place of each element it shows, by the element's id. */
export interface ModelView {
  id: string;
  kind: string;
  name: string;
  doc: string;
  x: number;
  y: number;
  layout: Record<string, Place>;
  options: Record<string, unknown>;
  [field: string]: unknown;
}

/** The model. */
export interface Model {
  format: string;
  revision: string | null;
  package: { name: string; doc: string };
  elements: ModelElement[];
  relationships: ModelRelationship[];
  views: ModelView[];
}

// ---- What the history says of a change.

/** The ids of the elements, relationships and views a change touched, each list in the model's order. */
export interface Touched {
  elements: string[];
  relationships: string[];
  views: string[];
}

/**
 * What the listeners are told when the model changed, or when a run of changes ended.
 *
 * A change that only moved things lays out again just the views it names (views), and what draws them may move just
 * what it touched (moved). One that showed or hid things in views draws those views again (shown, with views). Any
 * other can have altered anything, in any view (views is null). This is what the old page's howToDraw told render().
 */
export interface Told {
  /**
   * What happened: a change made through edit(); a step taken back; a step made again; or the end of a run of
   * changes, which changes nothing in the model, only the steps (the run became one step, or none).
   */
  by: 'edit' | 'undo' | 'redo' | 'end';
  /** What it touched. Empty lists when it touched none of the three (a change to the package, the end of a run). */
  touched: Touched;
  /**
   * Whether it altered which elements, relationships and views there are, or their order, kinds, owners or ends: what
   * the model library's lookups are made from. True for a whole new model.
   */
  structure: boolean;
  /** Whether a whole new model took the place of the old one: read everything again. */
  replaced: boolean;
  /** The views it can have altered, when it can't have altered any other; null when it can have altered any view. */
  views: string[] | null;
  /** Whether it only moved things: each write was to a place in a view's layout, or to a view's x or y. */
  moved: boolean;
  /** Whether it showed or hid things in views: a place was put into a layout or taken out of one. */
  shown: boolean;
}

/** An entry of the log of what was done, which Claude reads. A key joins it to the entry before it that has the key. */
export interface LogEntry {
  at: string;
  text: string;
  key?: string;
}

/** An undo step: its words, the key of its run while the run is open (null once it ended), and what it touched. */
export interface Step {
  readonly what: string;
  readonly key: string | null;
  readonly touched: Touched;
}

/**
 * What a change returns: what it did, in the words Undo and the log will use; `{ what, log, key }` when the log needs
 * other words (log) or its entry another key than the edit's (key: null joins it to no other entry); or nothing, when
 * it did nothing, and then the model must be as it was.
 */
export type Said = string | { what: string; log?: string; key?: string | null } | null | undefined;

export interface History {
  /**
   * The model, the Proxy of itself. Read it anywhere; write it only inside a change given to edit(). A change may put
   * a whole new model in its place, which is then one undo step; outside a change that is refused.
   */
  model: Model;
  /** The undo steps, newest last. */
  readonly steps: readonly Step[];
  /** The steps Undo took back, the next for Redo last. */
  readonly undone: readonly Step[];
  /** The log of what was done, newest last: the last 200 entries. */
  readonly changes: readonly LogEntry[];
  /**
   * Makes a change. change() changes the model and returns what it did (Said). edit records the change for Undo, with
   * what it touched, logs it, and tells the listeners. The selection, the panels' own state and what the page says
   * are the caller's to bring up to date after it.
   *
   * A key joins a run of changes into one undo step: the keystrokes of one name, the moves of one drag, each made
   * with the same key, one after another. A run is logged once, in its last words, when it ends: at endEdit(), or
   * when a change with another key, an Undo or a Redo comes first.
   *
   * Returns what the change touched, or null when change() did nothing. A change that throws is put back: the model
   * is as it was, and the error goes on to the caller.
   */
  edit(change: () => Said | void, key?: string | null): Touched | null;
  /**
   * Ends the run of changes the newest undo step is, so the next change with its key is a step of its own, and logs
   * the run in its last words. A run that ended with the model as it was before it (a box dragged out and back) is no
   * step at all, and logs nothing.
   */
  endEdit(): void;
  /** Takes the newest step back. Returns its words, or null when there was none. */
  undo(): string | null;
  /** Makes again the step Undo took back last. Returns its words, or null when there was none. */
  redo(): string | null;
  /** Adds an entry to the log. A key joins it to the entry before it when that one has the same key. */
  logChange(what: string, key?: string | null): void;
  /** Tells listener of every change from now on, after the change is made and recorded. Returns what stops it. */
  listen(listener: (told: Told) => void): () => void;
  /**
   * A number that names the state the model is in. A change gives the model a new state with a new number; Undo and
   * Redo move between states, so the same number again means the model is as it was when the number was read. The
   * session uses it to say whether the file has unsaved changes.
   */
  mark(): number;
}

export interface HistoryOptions {
  /** The log to start from: the one the file carried. */
  changes?: readonly LogEntry[];
  /** The time, as the log's entries carry it. The tests give their own clock. */
  now?: () => string;
  /**
   * What is done with a mistake in the page's code: a write to the model outside edit(), a change that says it did
   * nothing yet changed the model, a listener that threw. Unless given, the mistake is thrown as an error of its own,
   * once what the page is doing now is done, so the page goes on while the console, and the tests, see it.
   */
  mistake?: (error: Error) => void;
}

const HISTORY = 100;   // how many changes undo remembers
const LOG = 200;       // how many entries the log keeps

const LISTS = ['elements', 'relationships', 'views'] as const;
type ListName = (typeof LISTS)[number];
type Key = string | number | symbol;
/** An object or an array of the model, read and written by key. */
type Bag = Record<Key, unknown>;
/** An item of one of the model's three lists. */
type Item = { id: string };

const own = (o: object, k: Key): boolean => Object.prototype.hasOwnProperty.call(o, k);
const isList = (k: Key): k is ListName => (LISTS as readonly Key[]).includes(k);

// Where things sit in the model: the model itself, one of its three lists, an item of a list (whose id is its own),
// something inside an item, a view's layout, a place in a layout (the id it places), and the rest (the package).
type Home =
  | { at: 'root' }
  | { at: 'rest' }
  | { at: 'list'; list: ListName }
  | { at: 'item'; list: ListName }
  | { at: 'in'; item: Bag; list: ListName }
  | { at: 'layout'; view: Bag }
  | { at: 'place'; view: Bag; id: string };
const ROOT: Home = { at: 'root' };
const REST: Home = { at: 'rest' };
const LIST: Record<ListName, Home> = {
  elements: { at: 'list', list: 'elements' }, relationships: { at: 'list', list: 'relationships' }, views: { at: 'list', list: 'views' },
};
const ITEM: Record<ListName, Home> = {
  elements: { at: 'item', list: 'elements' }, relationships: { at: 'item', list: 'relationships' }, views: { at: 'item', list: 'views' },
};
// The keys of an item that are part of the model's structure.
const STRUCTURE: Record<ListName, readonly Key[]> = { elements: ['id', 'kind', 'owner'], relationships: ['id', 'kind', 'from', 'to'], views: ['id', 'kind'] };

// The notes of one change, or of a run of them: for each object, each key written and what it held first
// ({ had, old }), and its keys in their order when the change gave it a key or took one away; for each array, a copy
// of its items as they were first; and the model the change replaced, when it put a whole new one in its place.
interface KeyNote { had: boolean; old: unknown }
interface Notes {
  objects: Map<object, Map<Key, KeyNote>>;
  orders: Map<object, string[]>;
  lists: Map<unknown[], unknown[]>;
  replaced: Model | null;
}
const newNotes = (): Notes => ({ objects: new Map(), orders: new Map(), lists: new Map(), replaced: null });

/** An undo step as the history keeps it. */
interface Recorded {
  what: string;
  key: string | null;
  touched: Touched;
  notes: Notes;
  log: string;
  logKey: string | null;
  /** The number of the state the model is in after it (mark). */
  state: number;
  /** While Undo has taken it back: what its keys and lists held just before, which Redo puts back. */
  again: Notes | null;
  /** While its run is open: the redo list its first change emptied, given back when the run turns out to be no step. */
  forgot: Recorded[] | null;
}

const nothingTouched = (): Touched => ({ elements: [], relationships: [], views: [] });
const copyOf = (touched: Touched): Touched => (
  { elements: touched.elements.slice(), relationships: touched.relationships.slice(), views: touched.views.slice() }
);
function merge(into: Touched, more: Touched): void {
  LISTS.forEach((list) => more[list].forEach((id) => { if (into[list].indexOf(id) < 0) into[list].push(id); }));
}
function sameItems(a: readonly unknown[], b: readonly unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// The ids in both lists that the second puts in another order: those off the longest run the two lists keep in the
// same order, which is the longest increasing run of the places the first list gives them (patience sorting).
function moved(x: string[], y: string[]): string[] {
  if (x.length === y.length && x.every((id, i) => id === y[i])) return [];
  const place = new Map(x.map((id, i) => [id, i]));
  const at = (id: string): number => place.get(id) as number;
  const both = y.filter((id) => place.has(id));
  // Most changes add or take away and keep the rest in order: then nothing moved.
  let last = -1;
  if (both.every((id) => { const p = at(id); const ok = p > last; last = p; return ok; })) return [];
  const tails: number[] = [];   // tails[k]: where in both the best run of k + 1 found so far ends
  const back: number[] = [];    // back[i]: where in both the one before i on its run is, or -1
  both.forEach((id, i) => {
    const p = at(id);
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (at(both[tails[mid]]) < p) lo = mid + 1; else hi = mid;
    }
    back[i] = lo ? tails[lo - 1] : -1;
    tails[lo] = i;
  });
  const kept = new Set<string>();
  for (let i = tails.length ? tails[tails.length - 1] : -1; i >= 0; i = back[i]) kept.add(both[i]);
  return both.filter((id) => !kept.has(id));
}

// For a change that put a whole new model in place of the old one: the model in parts, each as its JSON, so the
// model before the change can be told from the model after it: the elements and the relationships by id, each view
// by id without its layout, each view's layout by the id of what it places, the order of the three lists, and the
// rest (the package).
interface Capture {
  elements: Map<string, string>;
  relationships: Map<string, string>;
  views: Map<string, string>;
  places: Map<string, Map<string, string>>;
  order: Record<ListName, string[]>;
  rest: string;
}
function capture(model: Model): Capture {
  const byId = (list: Item[]): Map<string, string> => new Map(list.map((x) => [x.id, JSON.stringify(x)]));
  const views = new Map<string, string>();
  const places = new Map<string, Map<string, string>>();
  model.views.forEach((view) => {
    const fields: Record<string, unknown> = Object.assign({} as Record<string, unknown>, view);
    delete fields.layout;
    views.set(view.id, JSON.stringify(fields));
    const layout = view.layout || {};
    places.set(view.id, new Map(Object.keys(layout).map((id) => [id, JSON.stringify(layout[id])])));
  });
  const rest: Record<string, unknown> = Object.assign({} as Record<string, unknown>, model);
  LISTS.forEach((list) => { delete rest[list]; });
  const order = { elements: model.elements.map((x) => x.id), relationships: model.relationships.map((x) => x.id), views: model.views.map((x) => x.id) };
  return { elements: byId(model.elements), relationships: byId(model.relationships), views, places, order, rest: JSON.stringify(rest) };
}
// What changed from capture a to capture b, as touchedBy says it; null when nothing did.
function difference(a: Capture, b: Capture): Touched | null {
  const touched = { elements: new Set<string>(), relationships: new Set<string>(), views: new Set<string>() };
  const compare = (x: Map<string, string>, y: Map<string, string>, into: Set<string>): void => {
    x.forEach((json, id) => { if (y.get(id) !== json) into.add(id); });
    y.forEach((_json, id) => { if (!x.has(id)) into.add(id); });
  };
  LISTS.forEach((list) => compare(a[list], b[list], touched[list]));
  const none = new Map<string, string>();
  new Set(Array.from(a.places.keys()).concat(Array.from(b.places.keys()))).forEach((viewId) => {
    const placed = new Set<string>();
    compare(a.places.get(viewId) || none, b.places.get(viewId) || none, placed);
    if (!placed.size) return;
    touched.views.add(viewId);
    placed.forEach((id) => touched[a.relationships.has(id) || b.relationships.has(id) ? 'relationships' : 'elements'].add(id));
  });
  LISTS.forEach((list) => moved(a.order[list], b.order[list]).forEach((id) => touched[list].add(id)));
  if (LISTS.every((list) => !touched[list].size) && a.rest === b.rest) return null;
  return { elements: Array.from(touched.elements), relationships: Array.from(touched.relationships), views: Array.from(touched.views) };
}

// What a change says it did, as { what, log, key }, or null when it says it did nothing.
function words(said: Said | void, key: string | null | undefined): { what: string; log: string; key: string | null } | null {
  if (!said) return null;
  if (typeof said === 'string') return { what: said, log: said, key: key || null };
  return { what: said.what, log: said.log || said.what, key: said.key === undefined ? key || null : said.key };
}

/**
 * What is done with a mistake in the page's code unless a history is told otherwise (HistoryOptions.mistake): it is
 * thrown as an error of its own, once what the page is doing now is done.
 */
export function throwLater(error: Error): void {
  setTimeout(() => { throw error; }, 0);
}

/**
 * A history for a model, which it makes record its own changes: every object and array in the model becomes the Proxy
 * of itself, in place. Read and write the model as the history gives it back (history.model), never the object given
 * here.
 */
export function createHistory(model: Model, options: HistoryOptions = {}): History {
  const now = options.now ?? (() => new Date().toISOString());
  const report = options.mistake ?? throwLater;

  // ---- The model keeps a note of every write made to it.
  //
  // Every object and array in the model is a Proxy of itself: its target is the plain object, which holds the same
  // Proxies as its children, so whatever is read from the model is a Proxy, and reads go straight to the target. Only
  // writes are trapped: before a key of an object changes, or is deleted, the object, the key and what the key held
  // are noted (the first time in a change); before an array changes, a copy of its items is. So edit() learns what a
  // change touched from the notes alone, without looking through the model, Undo puts back what the notes say, and
  // a write made while no change is open is noted as a mistake (stray), reported when the next change comes.

  const targets = new WeakMap<object, object>();   // a Proxy -> its target
  const proxies = new WeakMap<object, object>();   // a target -> its Proxy
  const homes = new WeakMap<object, Home>();       // a target -> where it sits in the model, for what a write to it touches

  function homeIn(t: object, k: Key): Home {
    const h = homes.get(t) ?? REST;
    if (h.at === 'root') return isList(k) ? LIST[k] : REST;
    if (h.at === 'list') return ITEM[h.list];
    if (h.at === 'item') return h.list === 'views' && k === 'layout' ? { at: 'layout', view: t as Bag } : { at: 'in', item: t as Bag, list: h.list };
    if (h.at === 'layout') return { at: 'place', view: h.view, id: String(k) };
    return h; // inside an item, or inside a place: the same item or place
  }
  // Makes a value part of the model, where home says: an object or array becomes the Proxy of itself, its children
  // first. A Proxy already in the model stays itself, and moves home.
  function track<T>(value: T, home: Home): T {
    if (value === null || typeof value !== 'object') return value;
    const target: object = targets.get(value) ?? value;
    const already = proxies.get(target);
    homes.set(target, home);
    if (already) return already as T;
    const bag = target as Bag;
    const keys: Iterable<Key> = Array.isArray(target) ? target.keys() : Object.keys(target);
    for (const k of keys) {
      const child = bag[k];
      if (child !== null && typeof child === 'object') bag[k] = track(child, homeIn(target, k));
    }
    const proxy = new Proxy(target, TRAPS);
    targets.set(proxy, target);
    proxies.set(target, proxy);
    return proxy as T;
  }
  const TRAPS: ProxyHandler<object> = {
    set(t, k, v) { noteWrite(t, k, false); (t as Bag)[k] = track(v, homeIn(t, k)); return true; },
    deleteProperty(t, k) { noteWrite(t, k, true); return delete (t as Bag)[k]; },
    defineProperty(t, k, d) {
      noteWrite(t, k, false);
      return Reflect.defineProperty(t, k, 'value' in d ? Object.assign({}, d, { value: track(d.value, homeIn(t, k)) }) : d);
    },
  };

  let writing: Notes | null = null;   // the notes of the change that is open, or null
  let stray = newNotes();             // writes made while no change was open
  // Notes a write before it is made; removes says that the write takes the key away.
  function noteWrite(t: object, k: Key, removes: boolean): void {
    const notes = writing ?? stray;
    if (Array.isArray(t)) { if (!notes.lists.has(t)) notes.lists.set(t, t.slice()); return; }
    const had = own(t, k);
    // A key that comes or goes changes the order the object's keys are read in, so that order is noted too.
    if (had === removes && !notes.orders.has(t)) notes.orders.set(t, Object.keys(t));
    let keys = notes.objects.get(t);
    if (!keys) { keys = new Map(); notes.objects.set(t, keys); }
    if (!keys.has(k)) keys.set(k, { had, old: (t as Bag)[k] });
  }
  // Joins a later change's notes to its run's: what the run noted first stays.
  function absorb(run: Notes, later: Notes): void {
    later.objects.forEach((keys, t) => {
      const mine = run.objects.get(t);
      if (!mine) { run.objects.set(t, keys); return; }
      keys.forEach((note, k) => { if (!mine.has(k)) mine.set(k, note); });
    });
    later.orders.forEach((order, t) => { if (!run.orders.has(t)) run.orders.set(t, order); });
    later.lists.forEach((copy, t) => { if (!run.lists.has(t)) run.lists.set(t, copy); });
    if (!run.replaced) run.replaced = later.replaced;
  }
  // Puts back what the notes say was there, past the traps, so nothing is noted: each key's value, each object's keys
  // in the order they were in, each array's items. A change that replaced the model gives the old one back.
  function restore(notes: Notes): void {
    notes.objects.forEach((keys, t) => keys.forEach((note, k) => { if (note.had) (t as Bag)[k] = note.old; else delete (t as Bag)[k]; }));
    notes.orders.forEach((order, t) => inOrder(t as Bag, order));
    notes.lists.forEach((copy, t) => { t.length = 0; copy.forEach((item) => t.push(item)); });
    if (notes.replaced) current = notes.replaced;
  }
  // Puts an object's keys in the order given, each holding what it holds. A key that was taken away and is put back
  // would otherwise come last, and the model would read, and save, in another order than it did.
  function inOrder(t: Bag, order: string[]): void {
    const keys = Object.keys(t);
    if (keys.length === order.length && keys.every((k, i) => k === order[i])) return;
    const holds = new Map(keys.map((k) => [k, t[k]]));
    keys.forEach((k) => { delete t[k]; });
    order.forEach((k) => { if (holds.has(k)) { t[k] = holds.get(k); holds.delete(k); } });
    holds.forEach((value, k) => { t[k] = value; });
  }
  // What the keys and lists of some notes hold now, as notes: restore() of them brings this moment back. Undo takes
  // them of a step just before it puts the step's old values back, and Redo restores them.
  function held(notes: Notes): Notes {
    const here = newNotes();
    notes.objects.forEach((keys, t) => {
      const mine = new Map<Key, KeyNote>();
      keys.forEach((_note, k) => mine.set(k, { had: own(t, k), old: (t as Bag)[k] }));
      here.objects.set(t, mine);
    });
    notes.orders.forEach((_order, t) => here.orders.set(t, Object.keys(t)));
    notes.lists.forEach((_copy, t) => here.lists.set(t, t.slice()));
    if (notes.replaced) here.replaced = current;
    return here;
  }

  // ---- What a change touched.

  // The ids of the elements the model had before the change that is open, or before the next one: a place whose id
  // is among them is an element's (touchedBy). Made again before a change once one altered the structure. The old
  // page read them from its drawing's layout, which every change made again.
  let known: Set<string> | null = null;
  function remember(): void {
    if (!known) known = new Set(current.elements.map((e) => e.id));
  }
  // What was found to have changed outside the three lists as well: the package. A mistake's words say so.
  const elsewhere = new WeakSet<Touched>();

  // What the notes say changed, as the ids of what it touched, a list each: { elements, relationships, views }, each
  // in the model's order; null when nothing changed (every key written holds what it held, every array its items).
  // One is touched when it was added, removed or changed, or moved in its list, whose order is the text's (a sequence
  // view keeps its events in model order). A change to a view's layout touches the view, and each element or line
  // whose place in it changed. A change to the package, or one that put an equal list or item in place of another,
  // touches none of the three, and is still a change: empty lists, not null.
  function touchedBy(notes: Notes): Touched | null {
    const found = { elements: new Set<string>(), relationships: new Set<string>(), views: new Set<string>() };
    const before: Partial<Record<ListName, Item[]>> = {};   // a list's items before the change, where it changed
    let changed = false;
    let rest = false;
    // Whether a place is a line's: not when the model had it as an element before the change; else the lines' ids,
    // before the change (as the notes have the list) and after it, say.
    let lines: Set<string> | null = null;
    const isLine = (id: string): boolean => {
      if (known && known.has(id)) return false;
      if (!lines) {
        const ids = new Set(current.relationships.map((r) => r.id));
        const root = notes.objects.get(targets.get(current) as object);
        const was = root ? root.get('relationships') : undefined;
        if (was && Array.isArray(was.old)) (was.old as Item[]).forEach((r) => ids.add(r.id));
        notes.lists.forEach((copy, t) => { if (homes.get(t) === LIST.relationships) (copy as Item[]).forEach((r) => ids.add(r.id)); });
        lines = ids;
      }
      return lines.has(id);
    };
    const placed = (view: Bag, id: string): void => { found.views.add(view.id as string); found[isLine(id) ? 'relationships' : 'elements'].add(id); };
    const changedList = (list: ListName, was: Item[], is: Item[]): void => {
      before[list] = was;
      const old = new Map(was.map((x) => [x.id, x]));
      const ids = new Set(is.map((x) => x.id));
      was.forEach((x) => { if (!ids.has(x.id)) found[list].add(x.id); });
      is.forEach((x) => {
        const o = old.get(x.id);
        if (!o || (o !== x && JSON.stringify(o) !== JSON.stringify(x))) found[list].add(x.id);
      });
      moved(was.map((x) => x.id), is.map((x) => x.id)).forEach((id) => found[list].add(id));
    };
    notes.lists.forEach((copy, t) => {
      if (sameItems(copy, t)) return;
      changed = true;
      const h = homes.get(t) ?? REST;
      if (h.at === 'list') changedList(h.list, copy as Item[], t as Item[]);
      else if (h.at === 'in') found[h.list].add(h.item.id as string);
      else if (h.at === 'place') placed(h.view, h.id);
      else rest = true;
    });
    notes.objects.forEach((keys, t) => {
      const h = homes.get(t) ?? REST;
      const bag = t as Bag;
      keys.forEach((note, k) => {
        const has = own(t, k);
        if (has === note.had && (!has || bag[k] === note.old)) return;
        changed = true;
        if (h.at === 'root') {
          if (isList(k)) changedList(k, Array.isArray(note.old) ? (note.old as Item[]).slice() : [], Array.isArray(bag[k]) ? (bag[k] as Item[]).slice() : []);
          else rest = true;
        } else if (h.at === 'item') {
          found[h.list].add(bag.id as string);
          // A layout put in place of another: each place that differs between the two.
          if (h.list === 'views' && k === 'layout') {
            const a = (note.had && note.old ? note.old : {}) as Record<string, unknown>;
            const b = (has && bag[k] ? bag[k] : {}) as Record<string, unknown>;
            new Set(Object.keys(a).concat(Object.keys(b))).forEach((id) => { if (JSON.stringify(a[id]) !== JSON.stringify(b[id])) placed(bag, id); });
          }
        } else if (h.at === 'in') found[h.list].add(h.item.id as string);
        else if (h.at === 'layout') placed(h.view, String(k));
        else if (h.at === 'place') placed(h.view, h.id);
        else rest = true;
      });
    });
    if (!changed) return null;
    const out = nothingTouched();
    if (rest) elsewhere.add(out);
    LISTS.forEach((list) => {
      const ids = Array.from(found[list]);
      // In the order the list had before the change, those it added last, in its order now. An id the list has
      // neither before nor after (a place left behind by something long deleted, which reads as an element's) comes
      // after them all; the old page's comparison said nothing of such an id, so it could unsettle the others' order.
      if (ids.length > 1) {
        const was: Item[] = before[list] ?? current[list];
        const at = new Map(was.map((x, i) => [x.id, i]));
        current[list].forEach((x, i) => { if (!at.has(x.id)) at.set(x.id, was.length + i); });
        const place = (id: string): number => at.get(id) ?? Number.MAX_SAFE_INTEGER;
        ids.sort((a, b) => place(a) - place(b));
      }
      out[list] = ids;
    });
    return out;
  }

  // What the listeners are to do about a change, from its notes (Told says what each flag means). structure says the
  // change altered which elements, lines and views there are, or their order, kinds, owners or ends.
  function how(notes: Notes, touched: Touched): Pick<Told, 'structure' | 'replaced' | 'views' | 'moved' | 'shown'> {
    if (notes.replaced) return { structure: true, replaced: true, views: null, moved: false, shown: false };
    let patch = true;
    let shown = false;
    let structure = false;
    for (const t of notes.lists.keys()) {
      const h = homes.get(t) ?? REST;
      if (h.at === 'list') structure = true;
      if (h.at !== 'place') patch = false;
    }
    for (const [t, keys] of notes.objects) {
      const h = homes.get(t) ?? REST;
      if (h.at === 'place') continue;
      if (h.at === 'layout') { shown = true; continue; }
      const written = Array.from(keys.keys());
      if (h.at === 'item' && h.list === 'views' && written.every((k) => k === 'x' || k === 'y')) continue;
      patch = false;
      if (h.at === 'root' || (h.at === 'item' && written.some((k) => STRUCTURE[h.list].includes(k)))) structure = true;
    }
    if (patch) return { structure: false, replaced: false, views: touched.views.slice(), moved: !shown, shown };
    return { structure, replaced: false, views: null, moved: false, shown };
  }

  // ---- The one way the model changes.

  let current = track(model, ROOT);
  const steps: Recorded[] = [];     // the undo steps, newest last
  let undone: Recorded[] = [];      // the steps Undo took back, the next for Redo last
  const changes: LogEntry[] = (options.changes ?? []).slice(-LOG);
  const listeners = new Set<(told: Told) => void>();
  let serial = 0;                   // the number of the newest state
  let base = 0;                     // the number of the state under the oldest step: where taking every step back leads

  const top = (): Recorded | undefined => steps[steps.length - 1];
  // Undo, Redo, a change and the end of a run are each made between changes, never inside one.
  function between(what: string): void {
    if (writing) throw new Error(what + ' was called inside a change given to edit(), which must only change the model.');
  }
  function tell(told: Told): void {
    for (const listener of Array.from(listeners)) {
      try { listener(told); } catch (error) { report(error instanceof Error ? error : new Error(String(error))); }
    }
  }

  function edit(change: () => Said | void, key?: string | null): Touched | null {
    between('edit()');
    const open = top();
    if (open && open.key !== null && open.key !== key) endEdit();
    const run = top();
    const joins = !!key && !!run && run.key === key;
    remember();
    reportStray();
    const before = current;
    const notes = newNotes();
    writing = notes;
    let result: Said | void;
    try {
      result = change();
    } catch (error) {
      // The change failed half way: what it wrote is put back, so the model is as it was and no step is missing.
      writing = null;
      current = before;
      restore(notes);
      throw error;
    }
    writing = null;
    let said = words(result, key);
    let touched: Touched | null;
    if (current !== before) {
      // A whole new model in place of the old one: the new one becomes part of the record, and what it touched is
      // found by comparing the two.
      current = track(current, ROOT);
      notes.replaced = before;
      const was = capture(before);
      const is = capture(current);
      touched = difference(was, is) ?? nothingTouched();
      if (was.rest !== is.rest) elsewhere.add(touched);
    } else touched = touchedBy(notes);
    if (!said) {
      // It did nothing: every key holds what it held. A key it took away and put back goes where it was.
      if (!touched) { restore(notes); return null; }
      mistake('A change given to edit() said it did nothing, yet it changed', touched);
      said = { what: 'Changed the model', log: 'Changed the model', key: key || null };
    }
    touched = touched ?? nothingTouched();
    const flags = how(notes, touched);
    if (joins && run) {
      run.what = said.what;
      run.log = said.log;
      run.logKey = said.key;
      merge(run.touched, touched);
      absorb(run.notes, notes);
      run.state = ++serial;
    } else {
      const step: Recorded = {
        what: said.what, key: key || null, touched: copyOf(touched), notes, log: said.log, logKey: said.key, state: ++serial, again: null, forgot: null,
      };
      steps.push(step);
      if (steps.length > HISTORY) base = (steps.shift() as Recorded).state;
      // A new change forgets what Undo took back. The first change of a run keeps it aside until the run ends.
      if (key && undone.length) step.forgot = undone;
      undone = [];
      if (!key) logChange(said.log, said.key);
    }
    if (flags.structure) known = null;
    tell({ by: 'edit', touched, ...flags });
    return touched;
  }

  // Reports the writes made to the model outside edit since the last change: a mistake in the page's code, which no
  // undo step holds.
  function reportStray(): void {
    const notes = stray;
    stray = newNotes();
    const touched = notes.objects.size || notes.lists.size ? touchedBy(notes) : null;
    if (touched) mistake('The model was changed outside edit()', touched);
  }
  // A mistake names what was touched: the ids, a list after a list; else the package; else, when all that changed is
  // which objects the model is made of, that.
  function mistake(message: string, touched: Touched): void {
    const ids = LISTS.map((list) => touched[list].join(', ')).filter(Boolean).join('; ')
      || (elsewhere.has(touched) ? 'the package' : 'an equal list, item or model put in place of another');
    report(new Error(message + ': ' + ids));
  }

  function endEdit(): void {
    between('endEdit()');
    const run = top();
    if (!run || run.key === null) return;
    run.key = null;
    if (!run.notes.replaced && !touchedBy(run.notes)) {
      // The run ended where it started: it is no step, and what Undo had taken back before it is still there to make
      // again.
      steps.pop();
      restore(run.notes);
      if (run.forgot) undone = run.forgot;
    } else logChange(run.log, run.logKey);
    run.forgot = null;
    tell({ by: 'end', touched: nothingTouched(), structure: false, replaced: false, views: [], moved: false, shown: false });
  }

  // ---- The log, Undo and Redo.

  function logChange(what: string, key?: string | null): void {
    const entry: LogEntry = { at: now(), text: what };
    if (key) {
      entry.key = key;
      const last = changes[changes.length - 1];
      if (last && last.key === key) { changes[changes.length - 1] = entry; return; }
    }
    changes.push(entry);
    if (changes.length > LOG) changes.splice(0, changes.length - LOG);
  }

  // Takes the newest change back: what it wrote goes back to what it was before it.
  function undo(): string | null {
    between('undo()');
    endEdit();
    const step = top();
    if (!step) return null;
    remember();
    reportStray();
    steps.pop();
    step.again = held(step.notes);
    restore(step.notes);
    undone.push(step);
    logChange('Undid: ' + step.what);
    const flags = how(step.notes, step.touched);
    if (flags.structure) known = null;
    tell({ by: 'undo', touched: copyOf(step.touched), ...flags });
    return step.what;
  }
  // Makes the change Undo took back last again: what it wrote goes back to what Undo found there.
  function redo(): string | null {
    between('redo()');
    endEdit();
    const step = undone[undone.length - 1];
    if (!step || !step.again) return null;
    remember();
    reportStray();
    undone.pop();
    restore(step.again);
    step.again = null;
    steps.push(step);
    logChange('Redid: ' + step.what);
    const flags = how(step.notes, step.touched);
    if (flags.structure) known = null;
    tell({ by: 'redo', touched: copyOf(step.touched), ...flags });
    return step.what;
  }

  return {
    get model() { return current; },
    set model(next: Model) {
      if (!writing) throw new Error('The model is replaced only inside a change given to edit(): opening a file makes a new history.');
      current = next;
    },
    get steps() { return steps; },
    get undone() { return undone; },
    changes,
    edit,
    endEdit,
    undo,
    redo,
    logChange,
    listen(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    mark: () => top()?.state ?? base,
  };
}
