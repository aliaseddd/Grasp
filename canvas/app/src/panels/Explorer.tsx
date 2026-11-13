// The Explorer panel, a side panel of the dock (plan/slice-1.md, step 9; plan/swarm/step-9.md). Until step 9
// builds it, it is the empty state the shell has shown since step 5. The dock renders ExplorerPanel as the body of the
// panel 'explorer' (shell/Dock.tsx, COMPONENTS); it reads the open file, and what else the dock hands on, through useDock()
// (shell/dockContext.ts), and is put into the dock inside SidePanel (panels/SidePanel.tsx).
//
// What the tree holds, what is unfolded, how much of a long list is shown and what a row says are not React's: they
// are a session's rows (explorerRows.ts), which this file draws with MUI X Tree View and joins to the session's
// selection (core/selection.ts). The styles are explorer.css, beside this file, which step 9 imports here.

import { RichTreeView, TreeItemProvider, useTreeItem } from '@mui/x-tree-view';
import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import type { KeyboardEvent, MouseEvent, SyntheticEvent } from 'react';
import { selectionOf } from '../core';
import type { Picked, Selection, Session } from '../core';
import { useDock } from '../shell/dockContext';
import './explorer.css';
import { explorerRowsOf, pickedOf, rangeOf, rowId, rowOf } from './explorerRows';
import type { ExplorerRows, RowItem } from './explorerRows';
import { SidePanel, SideText } from './SidePanel';

/** What the panel says while no file is open. */
export const NO_MODEL = 'No model is open.';
/** The tree's accessible name (its `aria-label`). */
export const TREE_NAME = 'Model';
/** How far a row steps in for each level, in px: Tree View's `itemChildrenIndentation`. */
export const ROW_INDENT = 16;

/**
 * The panel's body. It takes no props: the dock makes it once and keeps it mounted while its tab is hidden.
 *
 * The contract, once step 9 has built it (until then the body below is what the page shows):
 *
 * - **With no file open** (`useDock().session` is null): SidePanel with `<SideText>` NO_MODEL, and no tree.
 * - **With a file open**: SidePanel holding one `div.grasp-explorer`, and in it RichTreeView (the free edition of
 *   @mui/x-tree-view) with `aria-label` TREE_NAME. The rows are explorerRowsOf(session) (explorerRows.ts), the
 *   selection selectionOf(session). Nothing of the tree is kept in React state: when another file is opened the same
 *   components draw the new session's rows, folded as a new session's are, and its selection. The component is not
 *   keyed by the session and never mounts the tree again while a file is open: a mount would drop the keyboard's
 *   focus.
 * - **RichTreeView's props**, every object and function among them the same at each render unless what it is made
 *   from changed: `items` (rows.items, read through useSyncExternalStore(rows.listen, ...)), `expandedItems`
 *   (rows.unfolded) with `onExpandedItemsChange` (rows.setUnfolded), `multiSelect`, `selectedItems` (the row id of
 *   every item of selection.items, in its order, whether or not the tree has a row for it; a new array only when
 *   selection.items is a new array) with `onSelectedItemsChange` (below), `isItemSelectionDisabled` (true for the
 *   package's row and for a "Show more" row: pickedOf() is null), `expansionTrigger="iconContainer"`,
 *   `itemChildrenIndentation` ROW_INDENT, `onItemClick` (below), and `slots.item`, a row of our own. No checkboxes,
 *   no label editing (renaming in the Explorer is slice 2's), no drag and drop.
 * - **A row is our own elements** on Tree View's useTreeItem(), not its TreeItem: a stock TreeItem is five styled
 *   components and a Collapse, and costs about twice as much to mount (plan/swarm/step-9.md has the numbers).
 *   What a row is in the page, which the tests and explorer.css rely on:
 *
 *       li.grasp-row-item                 getRootProps(): role "treeitem", id, tabindex, aria-expanded on a row with
 *                                         rows inside it, the keys. And of our own: aria-selected "true" or "false"
 *                                         on a row that can be picked (status.selected), absent on the package's row
 *                                         and a "Show more" row; aria-current "true" on the row of the view in front
 *                                         (selection.view), absent elsewhere; no aria-checked (Tree View 8 would mark
 *                                         a selected item so, and a parent of one "mixed": the Explorer has no
 *                                         checkboxes, so it says aria-selected).
 *         div.grasp-row                   getContentProps(), without its `status`: takes the click; carries
 *                                         data-row (the row's id) and Tree View's data-selected, data-focused,
 *                                         data-expanded.
 *           span.grasp-row-icon           getIconContainerProps(): takes the click that folds and unfolds. Holds an
 *                                         svg chevron (path.grasp-row-chevron: right while folded, down while
 *                                         unfolded) on a row with rows inside it, and nothing on any other.
 *           span.grasp-row-words          `title` the row's whole text. Holds span.grasp-row-kw (when kw is not
 *                                         empty), span.grasp-row-name, span.grasp-row-type (when type is not empty):
 *                                         rows.wordsOf(the row), read through useSyncExternalStore, so a change of
 *                                         one row's words renders that row alone.
 *         ul.grasp-row-group              role "group", holding the rows inside it: only while the row is unfolded.
 *                                         No transition: a fold is instant.
 *
 *   The whole is wrapped in TreeItemProvider with getContextProviderProps(), as Tree View's own TreeItem is.
 * - **A click on a row's words** (anywhere on div.grasp-row but its fold control):
 *   - an element's, a relationship's or a view's row: picks that row alone, selection.set([it]). With Ctrl or ⌘ held
 *     the row is added to what is picked, first in the list, or let go when it was picked (the others stay). With
 *     Shift held, a range of our own (rangeOf, explorerRows.ts), not Tree View's, whose remembered anchor can name a
 *     row the tree no longer holds: the shown rows, in the tree's order, from the row picked last (selection.last,
 *     however it was picked: in this tree, on a plane, by a tool) to this one, and these alone are picked, this one
 *     first and the rest in the tree's order. When nothing is picked, or the row picked last has no shown row (it is
 *     inside a folded row, or beyond what a long list shows, or it is gone), there is no range and this row is picked
 *     alone. The row takes the keyboard's focus. Plain and Ctrl or ⌘ clicks come through
 *     `onSelectedItemsChange(event, ids)`, which is given the whole new list of row ids and calls selection.set()
 *     with pickedOf() of each, in that order, those that pick nothing left out.
 *   - a view's row, with or without a key held: also `useDock().showView(the view's id)`, from `onItemClick`: the
 *     view's tab opens again if it was closed, and is brought to the front of its group. The tree keeps the
 *     keyboard's focus.
 *   - a "Show more" row: rows.showMore(the row it ends), from `onItemClick`. It picks nothing.
 *   - the package's row: picks nothing and lets nothing go. It only takes the keyboard's focus.
 *   A click never folds or unfolds: only the fold control and the keys do.
 * - **A click on a row's fold control** folds or unfolds it (Tree View's own, through `onExpandedItemsChange`), and
 *   picks nothing.
 * - **The keys**, with the focus on a row: Tree View's own (the arrows move the focus, Right unfolds and Left folds,
 *   Home and End, Space picks or lets go the row with the others kept, Shift with an arrow stretches what is picked
 *   and the row moved to becomes the first picked, the rest following in the tree's order, Shift + Space picks the
 *   range of a Shift click to the focused row (ours too), Ctrl or ⌘ + A picks every shown row, * unfolds the rows beside this one, a letter goes to the next row whose
 *   RowItem.label begins with it, Enter folds or unfolds a row with rows inside it and picks one without), each
 *   reaching the selection through the same callbacks (or, for Shift + Space, rangeOf). Two rows have keys of their own, handled in the row's
 *   onKeyDown before Tree View's (which is then told not to act: `event.defaultMuiPrevented = true`, and the
 *   default prevented): Enter or Space on a view's row picks that view alone and calls showView, as a plain click on
 *   it does; Enter or Space on a "Show more" row shows more.
 * - **What is marked.** A row is selected exactly when the selection names its element, relationship or view,
 *   however it came to be picked: on a plane, in this tree, by a tool or by the Validation panel. Several picked
 *   things mark several rows. A picked thing whose row is not in the tree (inside a folded row, or beyond what a
 *   long list shows) marks nothing until its row is; nothing is unfolded and no list is made longer to show it.
 * - **Into view.** After every change of selection.items, the row of selection.last, when the tree has it, is
 *   scrolled into view by the least that shows it (its div.grasp-row, `scrollIntoView({ block: 'nearest', inline:
 *   'nearest' })`).
 * - **The view in front.** The row of selection.view carries aria-current "true", read through
 *   useSyncExternalStore(selection.listen, ...) in the row itself, so a change of the view in front renders two rows.
 * - **What each change of the model costs here** is the rows' own (ExplorerRows): nothing for a move, a resize or
 *   the end of a run; for a name or another field, the words of the shown rows worked out again and the rows whose
 *   words changed rendered; for a change of the structure, the rows built again and Tree View given new `items`.
 *   A step of a drag and a step of a pan write nothing to the model and reach nothing here.
 * - explorer.css is imported here, and gives the measures: a row 28 px high, the type 13 px, the name in medium
 *   weight, keyword and type in the secondary colour, the selected row on the soft teal, the tree never wider than
 *   its panel.
 */
export function ExplorerPanel(): JSX.Element {
  const { session } = useDock();
  return (
    <SidePanel testId="explorer" title="Explorer">
      {session ? <div className="grasp-explorer"><ExplorerTree session={session} /></div> : <SideText>{NO_MODEL}</SideText>}
    </SidePanel>
  );
}

/** What a row reaches: the session's rows and selection, and the dock's showView. Made and provided by ExplorerTree. */
interface ExplorerContextValue {
  rows: ExplorerRows;
  selection: Selection;
  showView: (viewId: string) => void;
  /** Picks the range from the row picked last to this row (see the contract); this row alone when there is no range. */
  rangeTo: (row: string) => void;
}
const ExplorerContext = createContext<ExplorerContextValue | null>(null);

// What Tree View is given that does not depend on the session (SLOTS is below, beside the row): the same at each render.
const isSelectionDisabled = (item: RowItem): boolean => pickedOf(item.id) === null;

function ExplorerTree({ session }: { session: Session }): JSX.Element {
  const { showView } = useDock();
  const rows = explorerRowsOf(session);
  const selection = selectionOf(session);
  const items = useSyncExternalStore(rows.listen, () => rows.items);
  const unfolded = useSyncExternalStore(rows.listen, () => rows.unfolded);
  const picked = useSyncExternalStore(selection.listen, () => selection.items);
  const selectedItems = useMemo(() => picked.map((p) => rowId(p.type, p.id)), [picked]);
  const box = useRef<HTMLDivElement | null>(null);
  const rangeTo = useCallback((row: string): void => {
    const to = pickedOf(row);
    if (!to) return;
    const last = selection.last;
    const next: Picked[] = [];
    for (const id of rangeOf(rows.shown(), last ? rowId(last.type, last.id) : null, row)) {
      const one = pickedOf(id);
      if (one) next.push(one);
    }
    selection.set(next);
  }, [rows, selection]);
  const context = useMemo(() => ({ rows, selection, showView, rangeTo }), [rows, selection, showView, rangeTo]);

  const onExpandedItemsChange = useCallback((_event: SyntheticEvent | null, ids: string[]) => rows.setUnfolded(ids), [rows]);
  const onSelectedItemsChange = useCallback((event: SyntheticEvent | null, ids: string[] | string | null) => {
    let list = Array.isArray(ids) ? ids : ids === null ? [] : [ids];
    // Shift with an arrow key: Tree View has moved the focus to the row it stretches to, and lists it last. That row
    // is the last picked, so it goes first, the rest following in the tree's order.
    const key = event as (KeyboardEvent & { type?: string }) | null;
    if (key && key.type === 'keydown' && key.shiftKey && (key.key === 'ArrowDown' || key.key === 'ArrowUp') && box.current) {
      const at = document.activeElement;
      const moved = at && box.current.contains(at) ? at.querySelector('[data-row]')?.getAttribute('data-row') ?? null : null;
      if (moved !== null && list.includes(moved)) {
        const order = new Map(rows.shown().map((id, i) => [id, i]));
        const rest = list.filter((id) => id !== moved).sort((a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER));
        list = [moved, ...rest];
      }
    }
    const next: Picked[] = [];
    for (const id of list) {
      const one = pickedOf(id);
      if (one) next.push(one);
    }
    selection.set(next);
  }, [rows, selection]);
  const onItemClick = useCallback((_event: MouseEvent | null, id: string) => {
    const row = rowOf(id);
    if (!row) return;
    if (row.type === 'view') showView(row.id);
    else if (row.type === 'more') rows.showMore(row.id);
  }, [rows, showView]);

  // After every change of what is picked, the row of the last picked, when the tree has it, is scrolled into view.
  useEffect(() => {
    const last = picked[0];
    if (!last || !box.current) return;
    const row = Array.from(box.current.querySelectorAll<HTMLElement>('[data-row]')).find((el) => el.getAttribute('data-row') === rowId(last.type, last.id));
    row?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [picked]);

  return (
    <ExplorerContext.Provider value={context}>
      <div ref={box}>
        <RichTreeView
          aria-label={TREE_NAME}
          items={items as RowItem[]}
          expandedItems={unfolded as string[]}
          onExpandedItemsChange={onExpandedItemsChange}
          multiSelect
          selectedItems={selectedItems}
          onSelectedItemsChange={onSelectedItemsChange}
          isItemSelectionDisabled={isSelectionDisabled}
          expansionTrigger="iconContainer"
          itemChildrenIndentation={ROW_INDENT}
          onItemClick={onItemClick}
          slots={SLOTS}
        />
      </div>
    </ExplorerContext.Provider>
  );
}

interface ExplorerRowProps {
  itemId: string;
  label?: React.ReactNode;
  id?: string;
  children?: React.ReactNode;
}

/** A row: our own elements on Tree View's useTreeItem (see the contract above). */
const ExplorerRow = forwardRef<HTMLLIElement, ExplorerRowProps>(function ExplorerRow({ itemId, label, id, children }, ref) {
  const context = useContext(ExplorerContext);
  if (!context) throw new Error('ExplorerRow: it is drawn inside ExplorerTree only.');
  const { rows, selection, showView, rangeTo } = context;
  const { getContextProviderProps, getRootProps, getContentProps, getIconContainerProps, status } = useTreeItem({ id, itemId, children, label, rootRef: ref });
  const words = useSyncExternalStore(rows.listen, () => rows.wordsOf(itemId));
  const current = useSyncExternalStore(selection.listen, () => {
    const row = rowOf(itemId);
    return !!row && row.type === 'view' && selection.view === row.id;
  });
  const selectable = pickedOf(itemId) !== null;

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.target === event.currentTarget && event.key === ' ' && event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey && selectable) {
      // Tree View's own range for Shift + Space starts from an anchor of its own, which can name a row that is gone.
      (event as KeyboardEvent<HTMLElement> & { defaultMuiPrevented?: boolean }).defaultMuiPrevented = true;
      event.preventDefault();
      rangeTo(itemId);
      return;
    }
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const row = rowOf(itemId);
    if (!row || (row.type !== 'view' && row.type !== 'more')) return;
    (event as KeyboardEvent<HTMLElement> & { defaultMuiPrevented?: boolean }).defaultMuiPrevented = true;
    event.preventDefault();
    if (row.type === 'view') {
      selection.set([{ type: 'view', id: row.id }]);
      showView(row.id);
    } else {
      rows.showMore(row.id);
    }
  };

  // Tree View 8 marks a selected item aria-checked, and the parent of one "mixed": the Explorer has no checkboxes.
  const { 'aria-checked': _checked, ...rootProps } = getRootProps({
    className: 'grasp-row-item',
    onKeyDown,
    'aria-selected': selectable ? status.selected : undefined,
    'aria-current': current ? 'true' : undefined,
  } as Record<string, unknown>) as Record<string, unknown>;
  const { status: _status, ...contentProps } = getContentProps({
    className: 'grasp-row',
    'data-row': itemId,
    // Shift + click is a range of our own, which Tree View is told to leave alone (its onItemClick still runs, for a
    // view's row and a "Show more" row). Tree View's own mouse-down keeps the focus from moving, so it is moved here.
    onClick: (event: MouseEvent<HTMLElement> & { defaultMuiPrevented?: boolean }) => {
      if (!event.shiftKey || !selectable) return;
      event.defaultMuiPrevented = true;
      if (!status.focused) event.currentTarget.closest<HTMLElement>('[role="treeitem"]')?.focus();
      rangeTo(itemId);
    },
  } as Record<string, unknown>) as Record<string, unknown>;
  const iconProps = getIconContainerProps({
    className: 'grasp-row-icon',
    // A click on the fold control is Tree View's own to fold with; it does not reach the row's click, which picks.
    onClick: status.expandable ? (event: MouseEvent) => event.stopPropagation() : undefined,
  } as Record<string, unknown>) as Record<string, unknown>;
  const said = words ?? { kw: '', name: typeof label === 'string' ? label : '', type: '' };

  return (
    <TreeItemProvider {...getContextProviderProps()}>
      <li {...rootProps}>
        <div {...contentProps}>
          <span {...iconProps}>
            {status.expandable ? (
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path className="grasp-row-chevron" d={status.expanded ? 'M4 6l4 4 4-4' : 'M6 4l4 4-4 4'} />
              </svg>
            ) : null}
          </span>
          <span className="grasp-row-words" title={said.kw + said.name + said.type}>
            {said.kw ? <span className="grasp-row-kw">{said.kw}</span> : null}
            <span className="grasp-row-name">{said.name}</span>
            {said.type ? <span className="grasp-row-type">{said.type}</span> : null}
          </span>
        </div>
        {children && status.expanded ? <ul className="grasp-row-group" role="group">{children}</ul> : null}
      </li>
    </TreeItemProvider>
  );
});

const SLOTS = { item: ExplorerRow };
