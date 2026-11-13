// The Explorer's rows: which rows the tree has, which of them are unfolded, how much of a long list is shown, and what
// each row says (plan/slice-1.md, step 9; plan/swarm/step-9.md). It is the part of the Explorer with no React in it,
// kept for a session outside React as the selection and a view's store are, so that panels/Explorer.tsx only draws it
// and the tests run it in Node (canvas/app/test/core.mjs, loadWith('panels/explorerRows')).
//
// It knows no React, no Tree View and no DOM. It asks the model library for the tree's rows (browserRows, which the
// old page's browser view is drawn from) and for what a row says (the words of canvas/src/browser/page.js,
// browserRowParts), and it hears the session's history.

import type { Model, ModelElement, ModelRelationship, Picked, Session } from '../core';

declare global {
  // The part of the model library that the Explorer's rows read, beside what the core declares of it.
  interface SysMLModelLibrary {
    /**
     * The rows of a browser view, in order: each element with what it owns under it, then the relationships declared
     * in it; the package's relationships last. A view whose options are `{ roots: null, collapsed: [] }` gives the
     * whole package with nothing folded: every element once, and every relationship both of whose ends are elements
     * of the model.
     */
    browserRows(model: Model, view: { options: { roots: null; collapsed: string[] } }): LibraryRow[];
    /**
     * A relationship in words: 'DevHost specializes Host', 'hosts defined by Host', 'connection mount, api to api'.
     * `ids` answers for the elements by id (get(id)); without it the library makes its own index of the model.
     */
    describeRel(model: Model, rel: ModelRelationship, ids?: { get(id: string): ModelElement | undefined }): string;
    /** Every element of the model by its id. Inside reading() it is made once. */
    idsOf(model: Model): Map<string, ModelElement>;
  }
}

/** A row as the library's browserRows gives it. `depth` is 0 for a row at the top of the package. */
export type LibraryRow =
  | { type: 'el'; id: string; item: ModelElement; depth: number; kids: boolean; folded: boolean }
  | { type: 'rel'; id: string; item: ModelRelationship; depth: number };

/** How many of the rows inside a row are shown at first, and how many more each "Show more" shows. */
export const ROWS_SHOWN = 200;
/** A model of more elements than this starts with only the package's row unfolded (plan/slice-1.md, section 2). */
export const UNFOLDED_UP_TO = 500;

/** What a row is: the package's one row, a view's, an element's, a relationship's, or a "Show more" row. */
export type RowType = 'package' | 'view' | 'el' | 'rel' | 'more';

/**
 * A row's id: its type, a colon, and the id of what it is a row of. The package's row is 'package:'; a "Show more"
 * row is 'more:' and the id of the row whose list it ends ('more:package:', 'more:el:Release'). It is the Tree View
 * item's id, and the row's `data-row` in the page (helpers.mjs, rowOf).
 */
export const rowId = (type: RowType, id = ''): string => `${type}:${id}`;

/** The package's row. */
export const PACKAGE_ROW = rowId('package');

/**
 * The rows a Shift range picks, as row ids: `to` first, then the rest of the rows from `anchor` to `to` in the order of
 * `shown` (the tree's), whichever of the two comes first. When `anchor` is null, or is not among the shown rows, or `to`
 * is not, only `to`. The package's row and a "Show more" row are in the range as any row is: pickedOf() leaves them out.
 */
export function rangeOf(shown: readonly string[], anchor: string | null, to: string): string[] {
  const from = anchor === null ? -1 : shown.indexOf(anchor);
  const at = shown.indexOf(to);
  if (from < 0 || at < 0) return [to];
  const out = [to];
  for (let i = Math.min(from, at); i <= Math.max(from, at); i++) if (i !== at) out.push(shown[i]);
  return out;
}

/** A row id read back: its type, and the id after the first colon (which may hold colons itself). Null when it is no row id. */
export function rowOf(row: string): { type: RowType; id: string } | null {
  const at = row.indexOf(':');
  const type = at < 0 ? '' : row.slice(0, at);
  if (type !== 'package' && type !== 'view' && type !== 'el' && type !== 'rel' && type !== 'more') return null;
  return { type, id: row.slice(at + 1) };
}

/** What a row picks: an element's, a relationship's or a view's row picks that; the package's row and a "Show more" row pick nothing (null). */
export function pickedOf(row: string): Picked | null {
  const read = rowOf(row);
  return read && (read.type === 'el' || read.type === 'rel' || read.type === 'view') ? { type: read.type, id: read.id } : null;
}

/**
 * What a row says, in three parts that the page draws one after the other with nothing between them: `kw + name +
 * type` is the row's text. `kw` ends in a space when it is not empty; `type` begins with one.
 *
 * - **The package's row**: kw '«package» ', name the package's name, trimmed, or '(unnamed)' when that is empty.
 * - **A view's row**: kw '«' + the label of its kind in the library's VIEW_KINDS + '» ' ('«general view» '; the kind's
 *   own name when the library has no row for it), name the view's name, trimmed, or '(unnamed)'.
 * - **An element's row**, as the old page's browser view says it (browserRowParts), without the count of notes, which
 *   is slice 2's: name is the element's name in the text (lib.textName), '(unnamed)' while that is '', and the kind's
 *   label when the kind has no name in the text (a start node reads 'start', with no kw). kw is '«' + the kind's
 *   keyword + '» ' when the element has a name in the text and its kind a keyword, else ''. type, for a usage: ' : '
 *   and the name of what defines it (lib.typingOf; '~' before it when the element is conjugated; '(unnamed)' for a
 *   definition with no name; '?' when the typing names no element), then ' [' + its multiplicity + ']' when it has
 *   one; '' otherwise. So: '«part def» Host', '«part» hosts : Host [1..*]', '«port» api : ~StrongholdApp'.
 * - **A relationship's row**: kw '«' + the kind's label in RELATIONSHIPS + '» ', name lib.describeRel() of it, without
 *   the label and the space after it when it begins with them. So: '«specializes» DevHost specializes Host',
 *   '«defined by» hosts defined by Host', '«connection» mount, api to api'.
 * - **A "Show more" row**: kw '', name 'Show more', type ' (N not shown)', N being how many rows inside its row
 *   are beyond what is shown, in digits with no separator.
 */
export interface RowWords {
  readonly kw: string;
  readonly name: string;
  readonly type: string;
}

/** A row as Tree View takes it (RichTreeView's `items`): its id, a plain label, and the rows inside it that are within what is shown. */
export interface RowItem {
  id: string;
  /**
   * What Tree View's own type-ahead reads, as it was when the rows were last built: the name part alone (the
   * package's name, a view's name, an element's name or its kind's label, a relationship's kind's label, 'Show
   * more'). The page draws wordsOf(), not this.
   */
  label: string;
  children: RowItem[];
}

/**
 * A session's rows. Its methods are bound: each can be handed over as it is.
 *
 * - **The rows.** One row for the package. Inside it, first a row for each view, in the model's order, then the rows
 *   lib.browserRows(model, { options: { roots: null, collapsed: [] } }) gives, in its order: a row of depth 0 is
 *   inside the package's row, and a row of depth d is inside the nearest row above it in the list whose depth is
 *   d - 1. So an element's row holds the rows of what it owns and then the rows of the relationships declared in it,
 *   and the package's own relationships come last. Folding is the Explorer's own and no view's: the library is asked
 *   with nothing folded.
 * - **What is unfolded.** At the first build the package's row is unfolded, and, when the model has no more than
 *   UNFOLDED_UP_TO elements, so is every row that has rows inside it; with more elements every other row starts
 *   folded. After that, what is unfolded is what setUnfolded() was last given, kept through every later build for the
 *   rows that are still there and still have rows inside them. A row that newly has rows inside it at a later build
 *   (a new row, or one that had none) starts unfolded when the model then has no more than UNFOLDED_UP_TO elements,
 *   and folded otherwise. A row with nothing inside it is never in `unfolded`.
 * - **How much of a list is shown.** A row shows the first ROWS_SHOWN of the rows inside it. When it has more, a
 *   "Show more" row is the last inside it, and showMore(its row) shows ROWS_SHOWN more of them, as often as it is
 *   called while there are more; the "Show more" row goes when all are shown. How many a row shows is kept through
 *   every later build while the row is there.
 * - **`items`** is the tree as Tree View takes it: one item, the package's, each item's `children` the rows inside
 *   it that are within what is shown, a "Show more" row last where there are more. It holds the rows inside folded
 *   rows too. It is the same array until the rows are built again or showMore() changes it.
 * - **`unfolded`** is the ids of the unfolded rows, in no promised order: the same array until it changes.
 * - **The rows that are shown** are the package's row and, for each shown row that is unfolded, the rows inside it
 *   that are within what is shown, its "Show more" row among them. wordsOf(row) gives a shown row's words, and null
 *   for any other id. It gives the same object until that row's words change, so React can read it through
 *   useSyncExternalStore(rows.listen, () => rows.wordsOf(row)). Words are worked out only for shown rows: when a row
 *   comes to be shown (a build, setUnfolded, showMore), and after a change of the model that can have altered words.
 *   Each working out reads the model inside one lib.reading(). The library is always reached as `session.lib`, at
 *   each use (`session.lib.browserRows(...)`, `session.lib.reading(...)`): a test counts those reads to see that a
 *   move costs none. The rows keep their own index of the model, made at each build: the place in the model's lists
 *   of each element, relationship and view, and of the typing of each element. A working out looks up the rows it is
 *   for in that index, and asks the library for no index of the whole model (lib.idsOf, the lookups of a reading),
 *   so a reword costs in proportion to the rows shown, not to the model. An index that no longer matches what the
 *   model holds at a place is made again.
 * - **After a change of the model** (the session's history tells of it):
 *   - `told.by === 'end'`, and a change that only moved things (`told.moved`): nothing is done and nobody is told. A
 *     drag's end, a resize's end and a port's slide cost the Explorer nothing.
 *   - a change that altered the structure (`told.structure`: an element, a relationship or a view came or went, or
 *     their order, kinds, owners or ends changed; a whole new model): the rows are built again, `built` goes up by
 *     one, `items` is a new array, and the listeners are told once.
 *   - any other change (a name, a multiplicity, a doc, the package's name): the words of the shown rows are worked
 *     out again. Each row whose words differ gets a new RowWords object and every other keeps the object it had;
 *     the listeners are told once when at least one differs, and not at all when none does. `items` stays the array
 *     it was, so Tree View builds nothing again.
 * - **`setUnfolded(rows)`** makes exactly these rows the unfolded ones; an id that names no row, or a row with
 *   nothing inside it, is left out. When that changes `unfolded`, the words of the rows that newly come to be shown
 *   are worked out and the listeners are told once; when it changes nothing, nobody is told.
 * - **`showMore(row)`** is given the row whose list is cut (the parent, not the "Show more" row). An id that names no
 *   row, or a row with nothing more to show, does nothing.
 * - **`listen(listener)`** calls listener after each of the changes above, once; it returns what stops it. Every
 *   listener is called even when another throws; the first error is thrown on once all have been told.
 * - **`built`** counts how many times the rows were built: 1 once explorerRowsOf() has returned. For the tests, and
 *   for looking.
 */
export interface ExplorerRows {
  readonly items: readonly RowItem[];
  readonly unfolded: readonly string[];
  readonly built: number;
  /**
   * The ids of the rows that are shown, in the tree's order: the package's row, and what is inside each unfolded
   * shown row, its "Show more" row last among them. A new array at each call.
   */
  shown(): string[];
  wordsOf(row: string): RowWords | null;
  setUnfolded(rows: readonly string[]): void;
  showMore(row: string): void;
  listen(listener: () => void): () => void;
}

export function explorerRowsOf(session: Session): ExplorerRows {
  let kept = KEPT.get(session);
  if (!kept) {
    kept = make(session);
    KEPT.set(session, kept);
  }
  return kept;
}

const KEPT = new WeakMap<Session, ExplorerRows>();

/** A row of the tree: what it is, the rows inside it (all of them, shown or not) and the row it is inside. */
interface Node {
  readonly id: string;
  readonly type: RowType;
  readonly key: string;
  readonly parent: Node | null;
  readonly kids: Node[];
}

/** The place in the model's lists of each element, relationship and view by id, and of the first typing of each element. */
interface Index {
  readonly els: Map<string, number>;
  readonly rels: Map<string, number>;
  readonly views: Map<string, number>;
  readonly typed: Map<string, number>;
}

function indexOf(model: Model): Index {
  const els = new Map<string, number>();
  const rels = new Map<string, number>();
  const views = new Map<string, number>();
  const typed = new Map<string, number>();
  const elements = model.elements;
  for (let i = 0; i < elements.length; i++) els.set(elements[i].id, i);
  const relationships = model.relationships;
  for (let i = 0; i < relationships.length; i++) {
    const rel = relationships[i];
    rels.set(rel.id, i);
    if (rel.kind === 'FeatureTyping' && !typed.has(rel.from)) typed.set(rel.from, i);
  }
  const list = model.views;
  for (let i = 0; i < list.length; i++) views.set(list[i].id, i);
  return { els, rels, views, typed };
}

/** What the library is asked inside one reading(): the lookups of what a row says, answered from the rows' index. */
interface Look {
  readonly lib: SysMLModelLibrary;
  readonly model: Model;
  /** The element, relationship or view of an id, or undefined when the model holds none. */
  el(id: string): ModelElement | undefined;
  rel(id: string): ModelRelationship | undefined;
  view(id: string): { id: string; name?: unknown; kind: string } | undefined;
  /** The first typing of an element, or null. */
  typing(el: ModelElement): ModelRelationship | null;
  /** The elements by id, as the library's describeRel takes them. */
  readonly ids: { get(id: string): ModelElement | undefined };
}

// The library's rows carry a `label` that the core's types do not declare (the old page's browserRowParts reads them).
type Labelled = Readonly<Record<string, { label: string; keyword?: string | null; usage?: boolean } | undefined>>;
const KINDS_OF = (lib: SysMLModelLibrary): Labelled => lib.KINDS as unknown as Labelled;
const RELATIONSHIPS_OF = (lib: SysMLModelLibrary): Labelled => lib.RELATIONSHIPS as unknown as Labelled;

const OPTIONS = { options: { roots: null, collapsed: [] as string[] } };
const UNNAMED = '(unnamed)';
const text = (value: unknown): string => (typeof value === 'string' ? value : '').trim();
const sameWords = (a: RowWords, b: RowWords): boolean => a.kw === b.kw && a.name === b.name && a.type === b.type;

/** What a row says, and its Tree View label (the name part alone, but a relationship's kind's label). Null for a row the model no longer holds. */
function wordsAndLabel(node: Node, look: Look): { words: RowWords; label: string } | null {
  const { lib, model } = look;
  if (node.type === 'package') {
    const name = text(model.package.name) || UNNAMED;
    return { words: { kw: '«package» ', name, type: '' }, label: name };
  }
  if (node.type === 'view') {
    const view = look.view(node.key);
    if (!view) return null;
    const kind = lib.VIEW_KINDS[view.kind];
    const name = text(view.name) || UNNAMED;
    return { words: { kw: '«' + (kind ? kind.label : view.kind) + '» ', name, type: '' }, label: name };
  }
  if (node.type === 'rel') {
    const rel = look.rel(node.key);
    if (!rel) return null;
    const label = RELATIONSHIPS_OF(lib)[rel.kind]?.label ?? rel.kind;
    let said = lib.describeRel(model, rel, look.ids);
    if (said.indexOf(label + ' ') === 0) said = said.slice(label.length + 1);
    return { words: { kw: '«' + label + '» ', name: said, type: '' }, label };
  }
  const el = look.el(node.key);
  if (!el) return null;
  const kind = KINDS_OF(lib)[el.kind];
  const named = lib.textName(el);
  const name = named === null ? (kind ? kind.label : el.kind) : named || UNNAMED;
  let type = '';
  if (kind && kind.usage) {
    const typing = look.typing(el);
    if (typing) {
      const def = look.el(typing.to);
      type += ' : ' + (el.conjugated ? '~' : '') + (def ? lib.textName(def) || UNNAMED : '?');
    }
    if (el.multiplicity) type += ' [' + el.multiplicity + ']';
  }
  return { words: { kw: named !== null && kind && kind.keyword ? '«' + kind.keyword + '» ' : '', name, type }, label: name };
}

function make(session: Session): ExplorerRows {
  const listeners = new Set<() => void>();
  let nodes = new Map<string, Node>();
  let root: Node = { id: PACKAGE_ROW, type: 'package', key: '', parent: null, kids: [] };
  let items: readonly RowItem[] = [];
  let unfolded: readonly string[] = [];
  let unfoldedSet = new Set<string>();
  let words = new Map<string, RowWords>();
  const shownCount = new Map<string, number>();   // how many rows inside a row are shown, for a row that has had showMore
  let labels = new Map<string, string>();
  let index: Index = { els: new Map(), rels: new Map(), views: new Map(), typed: new Map() };
  let built = 0;

  const tell = (): void => {
    let failed: { error: unknown } | null = null;
    for (const listener of Array.from(listeners)) {
      try { listener(); } catch (error) { failed ??= { error }; }
    }
    if (failed) throw failed.error;
  };

  /**
   * The lookups of what a row says, in this reading of the model. Each answers from the index and checks the answer
   * against the model at the place the index gives; when that is not what it says, the index is made again, once.
   */
  const lookOf = (lib: SysMLModelLibrary, model: Model): Look => {
    let fresh = false;
    const again = (): void => { index = indexOf(model); fresh = true; };
    const at = <T extends { id: string }>(list: readonly T[], places: () => Map<string, number>, id: string): T | undefined => {
      let place = places().get(id);
      if (place === undefined) return undefined;
      let found: T | undefined = list[place];
      if ((!found || found.id !== id) && !fresh) {
        again();
        place = places().get(id);
        found = place === undefined ? undefined : list[place];
      }
      return found && found.id === id ? found : undefined;
    };
    const el = (id: string): ModelElement | undefined => at(model.elements, () => index.els, id);
    const rel = (id: string): ModelRelationship | undefined => at(model.relationships, () => index.rels, id);
    return {
      lib,
      model,
      el,
      rel,
      view: (id) => at(model.views as readonly { id: string; name?: unknown; kind: string }[], () => index.views, id),
      typing(one) {
        const place = index.typed.get(one.id);
        if (place === undefined) return null;
        const found = model.relationships[place];
        if (found && found.kind === 'FeatureTyping' && found.from === one.id) return found;
        if (fresh) return null;
        again();
        const next = index.typed.get(one.id);
        const rewound = next === undefined ? undefined : model.relationships[next];
        return rewound && rewound.kind === 'FeatureTyping' && rewound.from === one.id ? rewound : null;
      },
      ids: { get: el },
    };
  };

  const shownOf = (node: Node): number => Math.min(node.kids.length, shownCount.get(node.id) ?? ROWS_SHOWN);
  const moreOf = (node: Node): number => node.kids.length - shownOf(node);

  /** The ids of the rows that are shown, in order: the package's, and what is inside each unfolded shown row. */
  const shownRows = (): string[] => {
    const out: string[] = [];
    const walk = (node: Node): void => {
      out.push(node.id);
      if (!unfoldedSet.has(node.id)) return;
      const n = shownOf(node);
      for (let i = 0; i < n; i++) walk(node.kids[i]);
      if (moreOf(node) > 0) out.push(rowId('more', node.id));
    };
    walk(root);
    return out;
  };

  const moreWords = (row: string): RowWords | null => {
    const node = nodes.get(row.slice('more:'.length));
    return node && moreOf(node) > 0 ? { kw: '', name: 'Show more', type: ` (${moreOf(node)} not shown)` } : null;
  };

  /**
   * Makes `words` those of the rows that are shown now. A row that has words keeps them unless `again`, which works
   * them out again; one that has none gets them. Where the library is asked, it is inside one reading(). Returns
   * whether a row that had words before has different ones.
   */
  const sync = (again: boolean): boolean => {
    const shown = shownRows();
    const need = shown.filter((id) => !id.startsWith('more:') && (again || !words.has(id)));
    const next = new Map<string, RowWords>();
    let changed = false;
    const put = (id: string, made: RowWords | null): void => {
      const was = words.get(id);
      if (made === null) { if (was) next.set(id, was); return; }
      if (was && sameWords(was, made)) next.set(id, was);
      else { next.set(id, made); if (was) changed = true; }
    };
    const fresh = new Map<string, RowWords | null>();
    if (need.length > 0) {
      const lib = session.lib;
      const model = session.model;
      lib.reading(model, () => {
        const look = lookOf(lib, model);
        for (const id of need) fresh.set(id, wordsAndLabel(nodes.get(id)!, look)?.words ?? null);
      });
    }
    for (const id of shown) {
      if (id.startsWith('more:')) put(id, moreWords(id));
      else if (fresh.has(id)) put(id, fresh.get(id)!);
      else if (words.has(id)) next.set(id, words.get(id)!);
    }
    words = next;
    return changed;
  };

  const itemsOf = (node: Node): RowItem => {
    const n = shownOf(node);
    const children: RowItem[] = [];
    for (let i = 0; i < n; i++) children.push(itemsOf(node.kids[i]));
    if (moreOf(node) > 0) children.push({ id: rowId('more', node.id), label: 'Show more', children: [] });
    return { id: node.id, label: labels.get(node.id) ?? '', children };
  };

  const build = (): void => {
    const lib = session.lib;
    const model = session.model;
    const first = built === 0;
    const wasKids = new Map<string, number>();
    nodes.forEach((n, id) => wasKids.set(id, n.kids.length));
    const wasUnfolded = unfoldedSet;

    const next = new Map<string, Node>();
    const top: Node = { id: PACKAGE_ROW, type: 'package', key: '', parent: null, kids: [] };
    next.set(top.id, top);
    const add = (parent: Node, type: RowType, key: string): Node => {
      const node: Node = { id: rowId(type, key), type, key, parent, kids: [] };
      parent.kids.push(node);
      next.set(node.id, node);
      return node;
    };
    const newLabels = new Map<string, string>();
    lib.reading(model, () => {
      model.views.forEach((v) => add(top, 'view', v.id));
      const rows = lib.browserRows(model, OPTIONS);
      const open: Node[] = [];   // the last element row at each depth
      for (const row of rows) {
        const parent = row.depth === 0 ? top : open[row.depth - 1] ?? top;
        const node = add(parent, row.type, row.id);
        if (row.type === 'el') open[row.depth] = node;
      }
      index = indexOf(model);
      const look = lookOf(lib, model);
      next.forEach((node, id) => {
        const made = wordsAndLabel(node, look);
        newLabels.set(id, made ? made.label : '');
      });
    });

    const small = model.elements.length <= UNFOLDED_UP_TO;
    const open: string[] = [];
    const walk = (node: Node): void => {
      if (node.kids.length > 0) {
        const was = wasKids.get(node.id);
        const on = first || was === undefined || was === 0 ? node === top || small : wasUnfolded.has(node.id);
        if (on) open.push(node.id);
      }
      node.kids.forEach(walk);
    };
    walk(top);

    nodes = next;
    root = top;
    labels = newLabels;
    for (const id of Array.from(shownCount.keys())) if (!next.has(id)) shownCount.delete(id);
    unfoldedSet = new Set(open);
    unfolded = open;
    items = [itemsOf(top)];
    built++;
    words = new Map();
    sync(false);
  };

  build();

  session.history.listen((told) => {
    if (told.by === 'end' || (told.moved && !told.structure)) return;
    if (told.structure) {
      build();
      tell();
    } else if (sync(true)) {
      tell();
    }
  });

  return {
    get items() { return items; },
    get unfolded() { return unfolded; },
    get built() { return built; },
    shown: shownRows,
    wordsOf: (row) => words.get(row) ?? null,
    setUnfolded(rows) {
      const next: string[] = [];
      const seen = new Set<string>();
      for (const id of rows) {
        const node = nodes.get(id);
        if (!node || node.kids.length === 0 || seen.has(id)) continue;
        seen.add(id);
        next.push(id);
      }
      if (next.length === unfoldedSet.size && next.every((id) => unfoldedSet.has(id))) return;
      unfolded = next;
      unfoldedSet = seen;
      sync(false);
      tell();
    },
    showMore(row) {
      const node = nodes.get(row);
      if (!node || moreOf(node) <= 0) return;
      shownCount.set(node.id, shownOf(node) + ROWS_SHOWN);
      items = [itemsOf(root)];
      sync(false);
      tell();
    },
    listen(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}
