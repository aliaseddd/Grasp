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
    /** A relationship in words: 'DevHost specializes Host', 'hosts defined by Host', 'connection mount, api to api'. */
    describeRel(model: Model, rel: ModelRelationship): string;
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
 *   move costs none.
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
  wordsOf(row: string): RowWords | null;
  setUnfolded(rows: readonly string[]): void;
  showMore(row: string): void;
  listen(listener: () => void): () => void;
}

/**
 * The rows of a session: the same object each time it is asked for, kept by the session object itself, weakly, as
 * its selection is (core/selection.ts), so a session that is replaced takes its rows with it. The first call builds
 * the rows and adds the rows' one listener to the session's history.
 */
export function explorerRowsOf(session: Session): ExplorerRows {
  void session;
  throw new Error('explorerRowsOf: step 9 builds it');
}
