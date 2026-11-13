// The Explorer panel, a side panel of the dock (plan/slice-1.md, step 9; plan/swarm/step-9.md). Until step 9
// builds it, it is the empty state the shell has shown since step 5. The dock renders ExplorerPanel as the body of the
// panel 'explorer' (shell/Dock.tsx, COMPONENTS); it reads the open file, and what else the dock hands on, through useDock()
// (shell/dockContext.ts), and is put into the dock inside SidePanel (panels/SidePanel.tsx).
//
// What the tree holds, what is unfolded, how much of a long list is shown and what a row says are not React's: they
// are a session's rows (explorerRows.ts), which this file draws with MUI X Tree View and joins to the session's
// selection (core/selection.ts). The styles are explorer.css, beside this file, which step 9 imports here.

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
 *     Shift held, Tree View's own range: the rows from the one picked last in the tree to this one. All three come
 *     through `onSelectedItemsChange(event, ids)`, which is given the whole new list of row ids and calls
 *     selection.set() with pickedOf() of each, in that order, those that pick nothing left out.
 *   - a view's row, with or without a key held: also `useDock().showView(the view's id)`, from `onItemClick`: the
 *     view's tab opens again if it was closed, and is brought to the front of its group. The tree keeps the
 *     keyboard's focus.
 *   - a "Show more" row: rows.showMore(the row it ends), from `onItemClick`. It picks nothing.
 *   - the package's row: picks nothing and lets nothing go. It only takes the keyboard's focus.
 *   A click never folds or unfolds: only the fold control and the keys do.
 * - **A click on a row's fold control** folds or unfolds it (Tree View's own, through `onExpandedItemsChange`), and
 *   picks nothing.
 * - **The keys**, with the focus on a row: Tree View's own (the arrows move the focus, Right unfolds and Left folds,
 *   Home and End, Space picks or lets go the row with the others kept, Shift with an arrow stretches what is picked,
 *   Ctrl or ⌘ + A picks every shown row, * unfolds the rows beside this one, a letter goes to the next row whose
 *   RowItem.label begins with it, Enter folds or unfolds a row with rows inside it and picks one without), each
 *   reaching the selection through the same two callbacks. Two rows have keys of their own, handled in the row's
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
  return (
    <SidePanel testId="explorer" title="Explorer">
      <SideText>The model's tree comes in step 9.</SideText>
    </SidePanel>
  );
}
