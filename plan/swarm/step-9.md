# Step 9: the shared selection and the Explorer

This is the scaffold of step 9 of `plan/slice-1.md`. It is written for a reader who has this file, `plan/swarm/README.md`, `plan/swarm/shared.md` and the files named here, and nothing else. The contracts themselves are the comments in the source files; this file says how they fit, what the tests and the code must agree on, and what each test is.

Everything under "what React Flow does", "what Dockview does" and "what Tree View does" was read in the libraries' sources and then run in a throwaway build of the whole step, kept outside the repository. Section 6 gives the measurements.

## 1. What the step delivers

The plan's text (`plan/slice-1.md`, section 5, step 9):

> - **What it delivers.** There is one selection, a list of elements, lines and views with the last picked first, which the planes and the panels read and set. On a plane a click selects, Ctrl or ⌘ + click adds, Shift + drag draws a marquee, and a click on the ground selects the view. The Explorer shows the package, its views, and then the library's tree rows as Tree View items. A click on a row selects, and a view's row opens its tab or brings it forward. After a change to the structure the Explorer builds its rows again; after any other it relabels the rows the change touched.
> - **Files.** The step creates `canvas/app/src/core/selection.ts`, `canvas/app/src/panels/Explorer.tsx` and `canvas/app/test/selection.test.mjs`. It changes `canvas/app/src/plane/Plane.tsx` and `shell/Dock.tsx`.
> - **Done when.** `selection.test.mjs` passes: a box picked on the plane is the selected row, and a row picked is the selected box; a marquee selects what it covers; Ctrl + click adds; a line's row selects its line; a closed tab opens again from its view's row; with the 5,000-element model only the package's row is unfolded, and a long list ends in "Show more". The three scale tests of step 8 still pass.

And section 2: "**The Explorer with thousands of elements.** When the model has more than 500 elements, only the package's row starts unfolded, and a row with more than 200 children shows the first 200 and a "Show more" row."

What the plan leaves open, and how each point is settled. The reasons are short here; section 6 lists every decision again, one line each.

### The selection

`canvas/app/src/core/selection.ts` holds its contract (`plan/swarm/shared.md`, section 1). Step 9 builds it as written. Two things the contract implies and the builder must know:

- `has()` is asked for every node and line a plane draws, after every projection: 1,544 times a step of a drag in the 5,000-element general view. It must not search the list.
- `set()` is called at every move of a marquee. Whether the model holds an id is answered from an index of the model's ids, made when first needed and made again after a change that altered the structure. Searching `model.elements` at each call costs 0.5 to 2.4 ms a pick at 5,000 elements; with the index a pick takes about a thousandth of a millisecond.

### Picking on a plane

The shared contract (the end of the comments in `plane/Plane.tsx` and `plane/viewStore.ts`) says: every click that is not the end of a drag goes through `clicked(hit)`; React Flow's own `select` changes pick nothing; a node or an edge is selected exactly when the session's selection names it. It can be built on React Flow 12.10.2 as written. What React Flow does, and what the plane and the store do with it:

1. **A click on a node.** React Flow's node element has a React `onClick`. With `selectNodesOnDrag={false}` it calls its own `handleNodeClick`, which sends `select` changes and, without Ctrl, sets `selected` on its own records of the nodes straight away (`getSelectionChanges(..., true)`); then it calls `onNodeClick`. The store takes no pick from the changes. `onNodeClick` makes the Hit and calls `clicked`.
2. **A click on a line** is the same through `onEdgeClick`: React Flow sends `select` changes for the line and for the selected nodes first.
3. **A click on the ground.** React Flow's pane calls `onPaneClick` and then sends a `select: false` change for everything selected.
4. **A click after a drag never comes.** d3 swallows the click that follows a press whose pointer went further than the click distance (`nodeClickDistance` and `paneClickDistance`, both CLICK_DISTANCE, 4 px; a resize handle's is 0), with a capturing listener at the window (`yesdrag` in d3-drag), before React hears it. So the end of a drag, of a pan and of a resize is no click, and nothing has to tell them apart. A press that slips 3 px is a click.
5. **A press on a node that is not selected** makes React Flow, at the press, unselect everything in its own records and send `select: false` for each (`startDrag`, since a drag begins at the press: `nodeDragThreshold` is 0). A press with Ctrl or ⌘ held does not.
6. **Which nodes a drag moves** is read from React Flow's own records at the press (`getDragItems`): the node pressed, and every node its records say is selected, leaving out a node whose owner is among them (the owner carries it).
7. **React Flow's own records must not stay different from the selection.** After 1, 2 and 5 its records can say something the selection does not (a click a tool took, at step 11; a drag of a box that is not picked). Its record of a node is replaced only when the store hands it a new object for that node. So: **every node and line that a `select` change names gets a new object from the store, reading as the selection says**, in a new array, and the subscribers are told once. That is the whole of what the store does with a `select` change. It costs a handful of objects a click.
8. **The marquee.** With `selectionKeyCode="Shift"`, while Shift is down React Flow's pane takes every press on the plane, on the ground or on a node, and draws a rectangle (`.react-flow__selection`) from the press to the pointer. Its state holds the rectangle (`userSelectionRect`, in px from the plane's corner) and whether one is being drawn (`userSelectionActive`, true from the first move). At each move it also sends `select` changes for what it thinks is covered, which the store answers as in 7. When the button is released it sets `nodesSelectionActive`, which draws a second rectangle around the selected nodes (`.react-flow__nodesselection`) that stays, lies over the boxes and takes their clicks (`plan/notes.md`, session 21).

What follows from it, as the contract of step 9:

- **React Flow's props that change** (`plane/Plane.tsx`): `selectionKeyCode="Shift"` (was `null`); `selectionMode={SelectionMode.Full}` (React Flow's default, said so that it is not changed by accident: the rectangle React Flow thinks of as covering is then the same as ours); `multiSelectionKeyCode` a constant array `['Control', 'Meta']` (so that React Flow's own idea of "adding" is the same as `Hit.add` on every machine; its default is Meta on a Mac and Control elsewhere); `onNodeClick`, `onEdgeClick`, `onPaneClick`, each the same function at every render. Nothing else changes: `elementsSelectable` stays at its default (the marquee needs it), `selectNodesOnDrag` stays false, `selectionOnDrag` stays off (a plain drag of the ground pans).
- **`clicked(hit)`** is one function of `Plane.tsx`. `onNodeClick(event, node)` gives it `{ view, type: 'el', id: node.id, at, add }`, `onEdgeClick(event, edge)` `{ type: 'rel', id: edge.id }`, `onPaneClick(event)` `{ type: 'ground', id: null }`; `at` is `screenToFlowPosition({ x: event.clientX, y: event.clientY })` and `add` is `event.ctrlKey || event.metaKey`. `clicked` calls `selectionOf(session).click(hit)`. `screenToFlowPosition` is only reachable inside React Flow, so a child component of `<ReactFlow>` (as `Follow` is) puts it into a ref that the three callbacks read.
- **The marquee picks from React Flow's rectangle, not from its `select` changes.** The same child component subscribes to React Flow's own store (`useStoreApi().subscribe`). While `userSelectionActive` is true, each new `userSelectionRect` is turned into the view's own units, `{ x: (rect.x - tx) / zoom, y: (rect.y - ty) / zoom, width: rect.width / zoom, height: rect.height / zoom }` with `[tx, ty, zoom]` the state's `transform`, and given to the store's new method `marquee(rect)`. The changes React Flow sends alongside are deltas against its own records and miss a box that was selected before the marquee began; the rectangle has no such hole.
- **`store.marquee(rect)`** (`plane/viewStore.ts`) picks what the rectangle covers: the nodes of the snapshot whose whole rectangle (the projection's `rects`, from the view's origin) lies inside it, its edges included (`>=` and `<=`), in the snapshot's order, which is owners before what they hold; then the lines of the snapshot both of whose ends are among those nodes, in the snapshot's order. It calls `selection.set()` with that list, or with the plane's view alone when the rectangle covers no node. So "covers" means wholly inside; a box the rectangle only cuts is not picked; a line is picked when both its boxes are; "the last picked first" puts the first covered node of the view's order first, which is what Details then shows. A line that is not drawn (hidden, or left out of a large far view by step 8) is not in the snapshot's edges and is not picked.
- **What is picked while it is drawn, and at its end.** At every move, exactly what the rectangle covers then: what it comes to cover is picked, what it no longer covers is let go, and while it covers nothing the view is picked, as by a click on the ground. The release picks nothing more. Ctrl or ⌘ held with a marquee changes nothing: a marquee never adds to what was picked before it.
- **What is left on the plane after a marquee: nothing.** The same subscriber sets React Flow's `nodesSelectionActive` back to false whenever it finds it true, so the second rectangle is never drawn. The picked boxes show their own outlines, and a click on one of them picks it alone.
- **The click that ends a marquee is no click.** When Shift is let go before the button, and the marquee began on a node or a line, React Flow lets the click through to that node (seen in the probe: the node was picked alone, and the marquee's picks were lost). `Plane.tsx` keeps one flag: set when a marquee is drawn (the subscriber sees `userSelectionActive` true), cleared at the next `pointerdown` on the plane's root (a capturing listener). While it is set, the three click callbacks do nothing.
- **Shift with a plain click is a click**: on a node it picks the node alone, on the ground the view. The flag above is set by a drawn marquee, not by the press.
- **A marquee begins wherever Shift finds the pointer on the plane**, on the ground or on a box: React Flow's pane takes the press before the box does. It never drags the box under it.
- **A click on the ground**, with or without Ctrl or ⌘: the plane's view alone (the selection's `click`).
- **A click on a box that is one of several picked** picks it alone. With Ctrl or ⌘ it is let go and the others stay.
- **A drag of a picked box** moves every picked box of that plane with it (but one whose owner is picked too, which its owner carries), as step 7 has it: one undo step. The picked stay picked.
- **A drag of a box that is not picked** moves that box alone and picks nothing; what was picked stays picked and is still dragged together afterwards (point 7 keeps React Flow's records right).
- **Ctrl or ⌘ held with a press on a box that is not picked** drags it together with the picked boxes, and picks nothing. This is React Flow's own; nothing in Grasp asks for it and no test holds it.
- **A hidden tab** costs nothing when the selection changes: its store has no subscriber and only notes that its marks are out of date. Shown again, it shows what is picked now, not what was picked when it was hidden.
- **The look of the marquee** is `plane/marquee.css`, a new file that `Plane.tsx` imports: the theme's teal, a 1 px dotted border and an 8% wash, in place of React Flow's blue.

### The Explorer

- **Where its logic lives.** In a module with no React, `canvas/app/src/panels/explorerRows.ts`, kept for a session as the selection is: which rows there are, which are unfolded, how much of a long list is shown, what each row says, and what a change of the model costs. `Explorer.tsx` draws it. The plan's list names only `Explorer.tsx`; the second file is there because at step 9 nothing in the page can rename an element or change the model's structure (Details is step 10, the tools step 11), so "builds its rows again" and "relabels" can only be tested in Node, and a Node test cannot load a React component.
- **What view the library is asked with.** None of the model's: `lib.browserRows(model, { options: { roots: null, collapsed: [] } })`, the whole package with nothing folded. Folding is the Explorer's own state and is not saved.
- **Where the rows stand.** One row for the package, at the top. Inside it: a row for each view, in the model's order; then the library's rows, each inside the row above it that is one level less deep. So an element's row holds what the element owns and then the relationships declared in it, and the package's own relationships come last, as in the old page's browser view.
- **What a row says** is `RowWords` in `explorerRows.ts`: the old page's browser row (`canvas/src/browser/page.js`, `browserRowParts`) without its count of notes, which is slice 2's. `«part def» Host`, `«part» hosts : Host [1..*]`, `«port» api : ~StrongholdApp`, `«specializes» DevHost specializes Host`, `«defined by» hosts defined by Host`, `«connection» mount, api to api`, `start`. A view's row says its kind's label and its name, `«general view» proofStructure`; the package's `«package» StrongholdProof`.
- **What starts unfolded.** The package's row always. With no more than 500 elements, every row that has rows inside it; with more, no other row. Whatever the size, a row shows the first 200 rows inside it.
- **Folding** is by a row's fold control and by the keys, never by a click on its words. It is kept for the session, through every rebuild, for the rows that are still there. A row that newly has rows inside it starts as a new session's would: unfolded in a model of no more than 500 elements, folded in a larger one. Another file opened starts afresh.
- **"Show more"** is the last row inside a row that has more rows than it shows. It says `Show more (3651 not shown)`. A click on it, or Enter or Space, shows the next 200, as often as there are more. How much a row shows is kept through rebuilds.
- **Rows are relabelled by working out again the words of the rows that are shown**, not of the 9,800 the 5,000-element model has, and not only of "the rows the change touched" by id: a part's row names its definition, and a relationship's row names both its ends, so a rename of `Host` changes six rows of the example. The shown rows are few (202 when the 5,000-element model opens), and each row reads its own words through `useSyncExternalStore`, so only the rows whose words differ render. Tree View is given new `items` only when the rows are built again or "Show more" is used: a change of `items` makes it build its lookups for every item again.
- **A row is our own elements** on Tree View's `useTreeItem()`, not its `TreeItem`. Three reasons: a stock `TreeItem` costs about twice as much to mount (section 6); it marks a selected item with `aria-checked` and never with `aria-selected`, which the shared helpers read (`rowItemIn` in `helpers.mjs`); and its styles are a library's classes, which a stylesheet of ours would have to override. `data-row` sits on the element that holds the words and takes the click.
- **A click on a row** picks it alone (`selection.set([row])`); with Ctrl or ⌘ it is added or let go; with Shift, Tree View's own range. A view's row also shows its tab. The package's row and a "Show more" row pick nothing, and a click on the package's row lets nothing go.
- **Which rows are marked** when several things are picked: each one's row, when the tree has it. A picked thing whose row is folded away, or beyond what a long list shows, marks nothing; the Explorer unfolds nothing and shows no more to reveal it. The row of the last picked is scrolled into view when the tree has it.
- **The keyboard** is Tree View's own, and reaches the selection through the same callbacks. Two additions: Enter or Space on a view's row does what a click on it does; Enter or Space on a "Show more" row shows more.
- **With no file open** the panel says `No model is open.`
- **The row of the view in front** carries `aria-current="true"` and has its name in teal. It is there for the person, who sees which tab the Tools view speaks for, and it is the only place in the page where step 9's `selection.view` shows, so it is also how the dock's part is tested before step 11.

What the Explorer does for each kind of `Told` (`core/history.ts`), which is the contract of `ExplorerRows`:

| The history tells of | The Explorer |
|---|---|
| nothing (a step of a drag, of a resize, of a pan: the model is not written) | hears nothing |
| `by: 'end'` (a run of keystrokes ended) | does nothing |
| `moved` (a drag's end, a resize's end, a port slid: only places were written) | does nothing: no row says a place |
| `structure` (an element, a relationship or a view came or went; an owner, a kind or an end changed; a whole new model) | builds its rows again: `browserRows` once, new `items` for Tree View, the words of the shown rows |
| anything else (a name, a multiplicity, a doc, the package's name; a place put into or taken out of a layout) | works out the words of the shown rows again inside one `lib.reading()`, and tells its listeners only if a row's words differ |

### The dock

- **`showView(viewId)`** is as `DockState` in `shell/dockContext.ts` says. A view with a tab: `panel.api.setActive()`. A view with none: one tab is added for it the way `addViews` adds a missing one (beside a view that is in the editor, else in a new group), and it is in front. It never changes the selection, and it leaves the keyboard's focus where it was.
- **The view in front** is worked out from Dockview's state, not kept by hand, at three moments: when the effect that follows a session starts, at every `api.onDidActivePanelChange`, and at every `api.onDidRemovePanel`. The rule: if Dockview's active panel (`api.activePanel`) is a view's panel of this session (its id begins `view:` and its `params.session` is the session), that view is in front; otherwise the view that was in front stays, as long as it still has a panel; otherwise none is. The result goes to `selectionOf(session).front()`, which tells nobody when it is what it was.

What Dockview 8.9.0 was seen to do, each with this rule's answer:

| What happens | What Dockview does | The view in front |
|---|---|---|
| A tab is clicked | fires `onDidActivePanelChange` with that view's panel | that view |
| The body of a view's panel is pressed in a split editor | makes that group active and fires with its panel, before the click | that view |
| The wheel turns over the other group's plane | nothing | stays |
| A side panel's name or body is clicked | fires with the side panel | stays |
| The tab in front is closed, and its group has another | fires with the tab that takes its place | that one |
| A tab that is not in front is closed | fires nothing, or with the panel that already was active | stays |
| The last view's tab is closed | fires with a side panel or with none; `onDidRemovePanel` fires | none |
| "Show the views again" | adds the tabs and fires with the first | the first added |
| The tab in front is floated with Shift | moves the panel, which stays the active one, and fires nothing | stays that view |
| Another file is opened | removes the old views' panels one by one, firing for each neighbour, then adds the new ones and fires with the first | the new file's first view; the old file's panels are not this session's and are passed over |

`api.onDidActivePanelChange` hands a new listener the last event again at once. The rule gives the same answer however often it is asked.

### What existing tests ask after step 9

Found by reading every test under `canvas/app/test/` that selects, holds Ctrl, ⌘ or Shift, or reads `selected`, and then by running each file against the throwaway build.

| File | Test | After step 9 |
|---|---|---|
| `gestures.test.mjs` | "Shift with a drag draws no rectangle and leaves nothing over the boxes" | **Restated** as "Shift with a drag draws its rectangle only while it is drawn, and leaves nothing over the boxes" (test list of `picking.test.mjs`, row G1). Owner: `9-tests-picking`. |
| `gestures.test.mjs` | "a press that moves 3 px before its release still selects the box" | Stands as written, and passes: a 3 px slip is a click, a 12 px drag picks nothing. |
| `viewStore.test.mjs` | "a selection renews only the node or the line it names, and is kept through the next change" | **Restated**: the selection is the session's (row V1). Owner: `9-tests-store`. |
| `viewStore.test.mjs` | "the store's methods can be handed over as they are" | **Restated** in two lines: a bare `nodesChanged` with a `select` change picks nothing, and a bare `marquee` picks (row V2). |
| `viewStore.test.mjs` | "a change React Flow sends that is not a selection changes nothing" | Stands, and passes. |
| `plane.test.mjs` | "a click selects a box and a line, and a click on the ground lets go" | Stands, and passes: the ground's click now picks the view, and the plane then shows nothing selected, which is what the test asks. |
| `plane.test.mjs` | "a tab that is hidden holds no React Flow, and shown again finds its zoom and its selection" | Stands, and passes: nothing is picked while the tab is hidden, so Pump is still picked. Row K8 of `picking.test.mjs` asks the new half. |
| `move.test.mjs` | "three boxes dragged together are one step" | Stands, and passes: it picks one box by a click and two by Ctrl + click, which is the selection's `click` with `add`. |
| `move.test.mjs`, `resize.test.mjs`, `small.test.mjs`, `scale.test.mjs`, `shots.mjs` | every use of `selectBox`, and of a click that must select | Stand, and pass: a click on a box picks it, and its node has the class `selected`. |
| `keys.test.mjs` | Ctrl + Z, Y, S | Not about the selection; stand. |
| `open.test.mjs` (criterion 2), `instant.test.mjs` (criterion 6), `sturdy.test.mjs` | all | Stand, and pass: ten files open with nothing logged and a tree in the Explorer; the example is painted with its tree and its nodes 70 to 100 ms after the file is given, against a limit of 1 s for the nodes. |
| `shell.test.mjs` | "with a view floating, the card says what is closed, and the views come back into the editor", and every test that measures the Explorer's root | Stand, but **fail if the tree widens its panel**: a tree of rows that do not wrap is wider than 280 px at its least, and the side's body then grows over the editor's edge (seen: the Explorer's root ended at 330 px, not 312). `explorer.css` holds the rule that prevents it, and row X3 of `explorer.test.mjs` asks for it by name. |

No test is loosened. `adapter.test.mjs`'s tests of `selected` kept by `project()` stand: the adapter still keeps it, and the store then sets it from the selection. Run against the throwaway build: `viewStore`, `gestures`, `plane`, `move`, `small`, `keys`, `resize`, `instant`, `open`, `sturdy`, `shell` and `scale`; only the three tests marked restated failed. Not run, since nothing they load changes: `adapter`, `fit`, `history`, `history-walk`, `files`, `build`, `unchanged`.

## 2. The files

| File | What it holds | Task |
|---|---|---|
| `canvas/app/src/core/selection.ts` | The selection. The contract is its comment; the body of `selectionOf` throws until built. | `9-impl-selection` |
| `canvas/app/src/plane/viewStore.ts` | A view's store: what is selected comes from the selection; `select` changes; `marquee(rect)`. | `9-impl-plane` |
| `canvas/app/src/plane/Plane.tsx` | React Flow's props, `clicked(hit)`, the child that hands on the marquee and keeps the second rectangle away. | `9-impl-plane` |
| `canvas/app/src/plane/marquee.css` | New. The marquee's look. | `9-impl-plane` |
| `canvas/app/src/panels/explorerRows.ts` | New, a skeleton now. A session's rows. | `9-impl-explorer` |
| `canvas/app/src/panels/Explorer.tsx` | The panel. Today's empty state, with its contract as the comment. | `9-impl-explorer` |
| `canvas/app/src/panels/explorer.css` | New, written. The tree's styles. The implementer imports it and changes it only where a test or the look asks. | `9-impl-explorer` |
| `canvas/app/src/shell/Dock.tsx` | `showView`; the view in front. | `9-impl-dock` |
| `canvas/app/src/shell/App.tsx` | `window.Grasp.selection`. | `9-impl-dock` |
| `canvas/app/test/selection-core.test.mjs` | New. The selection, in Node. | `9-tests-core` |
| `canvas/app/test/viewStore.test.mjs` | Two tests restated, six added. | `9-tests-store` |
| `canvas/app/test/explorer-rows.test.mjs` | New. The Explorer's rows, in Node. | `9-tests-rows` |
| `canvas/app/test/selection.test.mjs` | New. The plan's six tests, and what only all the parts together show. | `9-tests-selection` |
| `canvas/app/test/picking.test.mjs` | New. Picking on a plane, in the page, reading the planes only. | `9-tests-picking` |
| `canvas/app/test/gestures.test.mjs` | One test restated. | `9-tests-picking` |
| `canvas/app/test/explorer.test.mjs` | New. The Explorer in the page, reading the Explorer only. | `9-tests-explorer` |

No file under `canvas/src`, `canvas/test` or the rest of `unchanged.json` changes. `vendor.ts`, `theme.ts`, `app.css`, `helpers.mjs`, `core.mjs` and `core/index.ts` do not change: the step needs no new icon (the fold control is an inline chevron), no new colour (`TEAL`, `TEAL_SOFT`, `GROUND`, `TEXT_SECONDARY` are there), no new export of the core, and no new shared helper.

## 3. The contract between tests and code

### The planes

| What | How a test finds it |
|---|---|
| A selected node, a selected line | React Flow's class `selected` on `.react-flow__node[data-id]` and `.react-flow__edge[data-id]` inside `planeOf(viewId)`; `boxOf(...).selected` |
| The marquee, while it is drawn | exactly one `.react-flow__selection` inside the plane; none before the first move of the pointer and none after the release |
| The marquee's rectangle | that element's `getBoundingClientRect()`: from the point of the press to the pointer |
| The marquee's look | its computed `border-top-style` `dotted`, `border-top-width` `1px`, `border-top-color` the theme's teal (`cssColor(page, TEAL)`); its `background-color` is not `rgba(0, 89, 220, 0.08)`, React Flow's blue |
| Nothing over the boxes | no `.react-flow__nodesselection` and no `.react-flow__nodesselection-rect` inside the plane, at any moment |
| The ground | `groundPoint(page, view)`; or the plane's top left corner, 6 px in each way, which is bare ground in the example and the fixtures as they open (`document.elementFromPoint` there has the class `react-flow__pane`) |
| A line's middle | the point at half the length of its `path.grasp-line`, through `getScreenCTM()`, as `plane.test.mjs` finds it |
| What a rectangle covers | computed by the test from `rectsOf(page, view.id)`: the nodes whose whole rectangle on the screen lies inside the marquee's; and the lines of `linesOf(model, view)` both of whose ends are among them |

The keys a test holds: `Control` and `Meta` each add (`page.keyboard.down('Control')`); `Shift` draws the marquee.

Numbers: a press that goes 4 px or less is a click (step 7's CLICK_DISTANCE); a marquee is drawn from the first move of the pointer, however small.

### The Explorer

| What | How a test finds it |
|---|---|
| The panel's root | `byTestId(TESTIDS.explorer)`; shown by `showSide(page, 'Explorer')` |
| The panel with no file | its text contains `No model is open.`, and it holds no element with the role `tree` |
| The tree | one element with the role `tree` and the accessible name `Model`, inside the root, in a `div.grasp-explorer` |
| A row | `rowIn(page, type, id)`, `rowOf(type, id)` of `helpers.mjs`: the element with `data-row="<type>:<id>"`, class `grasp-row`, which holds the row's words and takes its click. Types `package` (id `''`), `view`, `el`, `rel`, and `more`, whose id is the id of the row it ends: `rowIn(page, 'more', 'package:')` |
| A row's words | the row's `textContent`: `kw + name + type` of `RowWords` |
| The parts of the words | `.grasp-row-kw`, `.grasp-row-name`, `.grasp-row-type` inside `.grasp-row-words`, whose `title` is the whole text |
| A row's tree item | `rowItemIn(page, type, id)`: the `li` with the role `treeitem` around the row, class `grasp-row-item` |
| A row inside another | its tree item is inside the other's tree item in the document |
| Selected | the tree item has `aria-selected="true"`; a row that can be picked and is not has `"false"`; the package's row and a "Show more" row have no `aria-selected`. The row itself has the attribute `data-selected` while selected. No tree item has `aria-checked` |
| Unfolded, folded | the tree item has `aria-expanded="true"` or `"false"`; a row with nothing inside it has no `aria-expanded` |
| The fold control | `.grasp-row-icon` inside the row; a click on it folds or unfolds. It holds an `svg` only on a row with rows inside it |
| The rows inside a folded row | not in the document |
| The view in front | its row's tree item has `aria-current="true"`; no other tree item has `aria-current`; its `.grasp-row-name` is drawn in the theme's teal |
| The keyboard's focus | `document.activeElement` is the row's tree item |
| The rows in the tree, in order | every `[data-row]` inside the root, in document order |

The words, exactly:

| Row | Text |
|---|---|
| The package | `«package» ` + the package's name, or `(unnamed)` |
| A view | `«` + its kind's label (`general view`, `interconnection view`, `action flow view`, `state transition view`, `sequence view`, `geometry view`, `grid view`, `browser view`) + `» ` + its name, or `(unnamed)` |
| An element | `RowWords` in `explorerRows.ts` |
| A relationship | `RowWords` in `explorerRows.ts` |
| "Show more" | `Show more (N not shown)`, N in digits with no separator |
| No file | `No model is open.` |

The example's 25 rows, in order, with the depth of each (0 is the package's row):

```
0 package:           «package» StrongholdProof
1 view:v-proof       «general view» proofStructure
1 el:Page            «part def» Page
2 el:Page.hosts      «part» hosts : Host [1..*]
3 el:Page.hosts.api  «port» api : ~StrongholdApp
2 el:Page.app        «part» app : App [1]
3 el:Page.app.api    «port» api : StrongholdApp
2 rel:mount          «connection» mount, api to api
1 el:Host            «part def» Host
2 el:Host.api        «port» api : ~StrongholdApp
1 el:App             «part def» App
2 el:App.api         «port» api : StrongholdApp
1 el:StrongholdApp   «port def» StrongholdApp
1 el:ServerHost      «part def» ServerHost
1 el:OnlineHost      «part def» OnlineHost
1 el:DevHost         «part def» DevHost
1 rel:t-hosts        «defined by» hosts defined by Host
1 rel:t-app          «defined by» app defined by App
1 rel:t-hosts-api    «defined by» api defined by StrongholdApp
1 rel:t-app-api      «defined by» api defined by StrongholdApp
1 rel:t-Host-api     «defined by» api defined by StrongholdApp
1 rel:t-App-api      «defined by» api defined by StrongholdApp
1 rel:s-ServerHost   «specializes» ServerHost specializes Host
1 rel:s-OnlineHost   «specializes» OnlineHost specializes Host
1 rel:s-DevHost      «specializes» DevHost specializes Host
```

Rows of the fixtures that a test pins: `el:Release.start` reads `start` and `el:Release.split` `«fork» split`, `rel:s-start` `«succession» start in Release to compile`, `el:maintainer` `«part» maintainer [1]` (`behavior-actions.json`); `el:HostLifecycle.initial` reads `initial node`, `rel:t-mount` `«transition» mount, idle to loading` (`behavior-states.json`); `el:Login.client.loginSent` reads `«event occurrence» loginSent`, `rel:m-login` `«message» login, loginSent to server` (`sequence.json`); `el:Tank.stored` reads `«item» stored : Fuel [0..*]`, `el:FuelLine.b` `«port» b : ~FuelPort`, `rel:fuelLine` `«interface» fuelLine, fuelOut to fuelIn` (`interconnection.json`). The blank model (`canvas/state.json`) has two rows: `«package» Package1` and `«general view» view1`.

Numbers:

| Number | Value |
|---|---|
| A row's height | 28 px |
| A level's step | 16 px (`ROW_INDENT`): the words of a row begin 16 px right of the words of the row it is inside |
| The type | Roboto, 13 px; the name in weight 500; keyword and type in the secondary colour (`var(--grasp-text-secondary)`) |
| A selected row's ground | the soft teal (`var(--grasp-teal-soft)`) |
| The focus ring | 2 px (`--grasp-focus-width`), solid, teal, on the row with the keyboard's focus |
| `UNFOLDED_UP_TO` | 500 elements: `scaleState(500)` starts wholly unfolded, `scaleState(501)` with only the package's row |
| `ROWS_SHOWN` | 200 |
| The 5,000-element model as it opens | 202 rows in the document: the package's, 3 views', 197 of the library's, and `Show more (3651 not shown)`. The package's row has 3,851 rows inside it |
| The Explorer's root | as wide as its panel: 280 px in a fresh browser at 1400 px, its right edge at 312 px, with or without a file |

### The dock

| What | How a test finds it |
|---|---|
| A view's tab | `viewTab(page, view)`; in front when its `aria-selected` is `"true"` |
| A tab's close control | `.dv-default-tab-action` inside the tab, after a hover, as `shell.test.mjs` closes one |
| The view in front | the Explorer's row with `aria-current="true"` |

### The Node tests

`loadCore()` gives `selectionOf`; `loadPlanes()` gives `viewStoreOf`, `selectionOf`, `project`; `loadWith('panels/explorerRows')` gives `explorerRowsOf`, `rowId`, `rowOf`, `pickedOf`, `PACKAGE_ROW`, `ROWS_SHOWN`, `UNFOLDED_UP_TO` beside the core (`canvas/app/test/core.mjs`). A session is `openText(lib, text, { name }, { now: clock() })`. The model library runs in another realm: its objects are compared as JSON (`plain`).

## 4. The test lists

In every table: **Before** is the first line of the failure when the test is run against the scaffold (the page and the core as they are before any task of step 9). **Breakage** is the one small change to the built code that must fail the test once the code is built. A test marked *passes before* cannot fail against the scaffold, and its breakage is the only way it is seen to fail.

Browser tests open the page with `openIn(browser, stateFileAt(file))` and end with `finish(opened)`. Unless a row says otherwise the file is the example, `EXAMPLE`, whose one view is `v-proof` (`modelOf(EXAMPLE).views[0]`), shown with `showView(page, view, 6)`. A wait is `soon(page, check, missing)` with a sentence in the page's terms. No test reads `window.Grasp`.

Each browser test file writes these small helpers for itself, since `helpers.mjs` does not change: `selectedIn(page, view)`, the ids of the plane's `.react-flow__node.selected` and `.react-flow__edge.selected`; `selectedRows(page)`, the `data-row` of every row whose tree item has `aria-selected="true"`, in document order; `rowsNow(page)`, every `data-row` in the Explorer in document order.

### `canvas/app/test/selection-core.test.mjs` (Node), `describe('the selection')`

Sessions: the example unless said. `Host`, `App`, `DevHost` are elements, `mount` and `s-DevHost` relationships, `v-proof` the view. **Before**, for every test of this file: `selectionOf: step 9 builds it`.

| # | Name | What it does and asserts | Breakage |
|---|---|---|---|
| C1 | a session has one selection, empty at first | `selectionOf(s)` twice is one object; another session's is another. `items` is `[]`, `last` null, `view` null, `has('el', 'Host')` false. | a new selection made at each call |
| C2 | set picks exactly what it is given, the first of them the last picked | `set([el Host, rel mount, view v-proof])`: `items` reads those three in that order, `last` is Host, `has` is true for each and false for `has('rel', 'Host')`. `set([rel mount, el Host])`: exactly those two. `set([])`: empty, `last` null. | `set()` adding to what was picked |
| C3 | an item given twice counts once, and one that names nothing is never picked | `set([Host, Host, el Nobody, rel Host, view v-nothing, App])` gives `[Host, App]`. `toggle(el Nobody)` changes nothing and calls no listener. | `set()` keeping an item the model does not hold |
| C4 | the same list again changes nothing and tells nobody | A listener counts. `set([Host])`: one call, and `items` is a new array, the array before unchanged. `set([Host])` again: no call, `items` the very array. `set([Host, App])` then `set([App, Host])`: one call each (the order is part of the list). | the listeners told at every `set()` |
| C5 | toggle puts an item first, or takes it out | `set([Host, App])`; `toggle(DevHost)` gives `[DevHost, Host, App]`; `toggle(Host)` gives `[DevHost, App]`; one call each. | `toggle()` adding at the end |
| C6 | a click picks a box or a line alone, with Ctrl adds it or lets it go, and on the ground picks the view | `click({ view: 'v-proof', type: 'el', id: 'Host', at: { x: 0, y: 0 }, add: false })` gives `[Host]`; the same for App with `add: true` gives `[App, Host]`; again gives `[Host]`; `type: 'rel', id: 'mount', add: false` gives `[mount]`; `type: 'ground', id: null, add: false` gives `[view v-proof]`. Then `set([Host])` and the ground with `add: true`: `[view v-proof]` alone. | the ground's click with `add` keeping what was picked |
| C7 | the view in front is what the dock last said, and none for a view the model does not hold | `front('v-proof')`: `view` is `'v-proof'`, one call, `items` untouched. Again: no call. `front('v-nothing')`: null, one call. `front(null)`: no call. | `front()` keeping an id the model does not hold |
| C8 | what leaves the model is let go, and nothing comes back by itself | `set([el DevHost, el Host, rel s-DevHost, view v-proof])`, `front('v-proof')`. One edit takes `s-DevHost` and `DevHost` out of the model (and DevHost's place out of the view): `items` is `[Host, view v-proof]`, one call. `history.undo()`: `items` unchanged, no call. An edit that renames Host: no call. An edit that takes the view out of `model.views`: `items` is `[Host]`, `view` null, one call. | the selection's listener on the history left out |
| C9 | every listener is told even when one throws, and a stopped one is told no more | Two listeners, the first throws. `set([Host])` throws that error, and the second was called. The second's stop is called: `set([App])` does not call it. | the telling stopped at the first throw |
| C10 | the methods can be handed over as they are | `const { set, toggle, click, front, has, listen } = selectionOf(s)`; each works bare. | `has` reading `this.items` |
| C11 | picking does not search the model: 2,000 picks on the 5,000-element model take under 300 ms | `scaleState(5000)`; the last 500 elements' ids, four times round: `set([{ type: 'el', id }])` and `has('el', id)`. The time is reported as a `#` line. Measured in the probe: 2 to 17 ms with an index that is kept; about 960 ms searching `model.elements` with `some()`; about 4,600 ms making a set of every id at each call. | whether the model holds an id found by searching `model.elements` at each call |

### `canvas/app/test/viewStore.test.mjs` (Node)

Two tests restated in place, under their present names, and six added in a new `describe('the selection in the store')`. `sel` is `selectionOf(s)` of the same bundle (`loadPlanes()`).

| # | Name | What it does and asserts | Before | Breakage |
|---|---|---|---|---|
| V1 | a selection renews only the node or the line it names, and is kept through the next change (restated) | As today, with the selection in place of React Flow's changes. `sel.set([el Host])` where it called `nodesChanged` with a `select`: a new snapshot, a new `nodes` array, the very `edges` array, Host a new object with `selected: true`, the object before not changed, every other node the object it was, one call. `sel.set([el Host])` again: the very snapshot, no call. The two renames as today. Then `sel.toggle(rel mount)` where it called `edgesChanged`: a new snapshot, a new `edges` array, the very `nodes` array, `mount` a new object with `selected: true`, every other edge the object it was, one call. `sel.set([rel mount, el Host])`, which reads as what is picked: the very snapshot, no call. | `selectionOf: step 9 builds it` | `selected` set on the projection's own object in place |
| V2 | the store's methods can be handed over as they are (restated) | As today, but: after the bare `nodesChanged([{ id: 'Host', type: 'select', selected: true }])` Host's node does not say `selected: true`, and likewise `mount` after the bare `edgesChanged`; and a bare `marquee({ x: -100000, y: -100000, width: 200000, height: 200000 })` leaves every node saying `selected: true`. | `A select change from React Flow must pick nothing: Host says selected.` | a method reading `this` |
| V3 | a picked element is selected in every view that shows it | `interconnection.json`, the stores of `v-ic` and `v-defs`, both subscribed. `sel.set([el Pump])`: in each snapshot Pump and only Pump says `selected: true`; each listener called once. `sel.set([el System.pump])`, which only `v-ic` places: `v-defs` has nothing selected. `sel.set([view v-ic])`: nothing selected in either. | `selectionOf: step 9 builds it` | only the store of `selection.view` hearing the selection |
| V4 | a store with no subscriber marks what is picked at its next read, and projects nothing for it | The example's store, read once, no subscriber; `projected` noted. `sel.set([el Host])`; `getSnapshot()`: Host says `selected: true`, every other node is the object it was, `projected` is what it was. | `selectionOf: step 9 builds it` | a change of the selection marking the store stale, so that it projects again |
| V5 | a select change from React Flow picks nothing, and what it names is a new object that reads the same | Subscribed. `nodesChanged([{ id: 'Host', type: 'select', selected: true }, { id: 'App', type: 'select', selected: false }])`: `sel.items` is empty; a new snapshot; Host and App are new objects that read as before (`plain`), neither says `selected: true`; every other node the object it was; the `edges` array the very one; one call. `sel.set([el Host])`, then `nodesChanged([{ id: 'Host', type: 'select', selected: false }])`: Host is a new object and still says `selected: true`. `edgesChanged([{ id: 'mount', type: 'select', selected: true }])`: `mount` a new object, not selected, one call. A `select` naming `Nobody`: the very snapshot, no call. | `selectionOf: step 9 builds it` | a named node left the object it was |
| V6 | a marquee picks the nodes it covers whole, in the view's order, and the lines between them | The example's store, subscribed, after `camera(736, 828)` (near). `rects` is `project(lib, s.model, view, { far: false }).rects`. R is the smallest rectangle around the rects of `Page.hosts`, `Page.hosts.api`, `Host` and `Host.api`, grown by 1 each way. `store.marquee(R)`: `sel.items` reads exactly the nodes whose rect lies wholly inside R, as elements, in the snapshot's order, then `rel t-hosts`: that is `Page.hosts`, `Page.hosts.api`, `Host`, `Host.api`, `t-hosts`; `Page` is not among them. `marquee` of Host's own rect, exactly: `Host` alone (the edges count as inside). The same less 1 in width: the view (next row). | `selectionOf: step 9 builds it` | a node picked when the rectangle only cuts it |
| V7 | a marquee that covers nothing picks the view, and the same marquee again tells nobody | `sel.set([el Host])`; `store.marquee({ x: -5000, y: -5000, width: 10, height: 10 })`: `sel.items` is `[view v-proof]`; the store's listener called once (Host let go). The same call again: no call of the store's listener and none of a listener on the selection. | `selectionOf: step 9 builds it` | a marquee over nothing letting everything go (`set([])`) |
| V8 | a picked element that a view comes to show is selected there, and what is picked stays marked through a drag | `interconnection.json`, the store of `v-defs`, subscribed. `sel.set([el System])`, which `v-defs` does not place: nothing selected. An edit puts `System` into the view's layout (`{ x: 0, y: 0, w: 200, h: 100 }`): the new node says `selected: true`. Then, on the example, `sel.set([el Host])` and a drag of Host by `nodesChanged` (positions with `dragging: true`, 50 units from its place, then `dragging: false`): at each step and after the end Host's node says `selected: true`. | `selectionOf: step 9 builds it` | what is selected set only when the selection tells, not after a projection |

### `canvas/app/test/explorer-rows.test.mjs` (Node), `describe("the Explorer's rows")`

`const m = await loadWith('panels/explorerRows')`. A helper flattens `rows.items` into `[depth, id]` pairs, and another gives a row's text, `kw + name + type` of `rows.wordsOf(id)`. `rename(s, id, name)` is an edit that sets an element's name. **Before**, for every test but R1: `explorerRowsOf: step 9 builds it`.

| # | Name | What it does and asserts | Breakage |
|---|---|---|---|
| R1 | a row's id names its type and what it is a row of | `rowId('el', 'Page.hosts')` is `'el:Page.hosts'`, `rowId('package')` and `PACKAGE_ROW` are `'package:'`, `rowId('more', 'el:Release')` is `'more:el:Release'`. `rowOf` reads each back, an id with colons included (`rowOf('el:a:b')` is `{ type: 'el', id: 'a:b' }`); `rowOf('nonsense')` and `rowOf('thing:1')` are null. `pickedOf('el:Host')` is `{ type: 'el', id: 'Host' }`, likewise `rel` and `view`; `pickedOf('package:')` and `pickedOf('more:package:')` are null. *Passes before*: these four are final in the scaffold. | `rowOf` splitting at the last colon |
| R2 | the example's tree: the package, its view, then the library's rows | `rows.items` is one item, the package's. Flattened, it is exactly the 25 `[depth, id]` pairs of section 3. `rows.built` is 1. | the views' rows put after the elements' |
| R3 | what the example's rows say | The text of each of the 25 rows is section 3's. In parts: `el:Page.hosts` is `{ kw: '«part» ', name: 'hosts', type: ' : Host [1..*]' }`; `el:Page.hosts.api` has type `' : ~StrongholdApp'`; `package:` is `{ kw: '«package» ', name: 'StrongholdProof', type: '' }`. Each item's `label`: `'StrongholdProof'`, `'proofStructure'`, `'Page'`, `'hosts'`, and `'connection'` for `rel:mount`. | the `~` of a conjugated port left out |
| R4 | what the fixtures' rows say | The rows section 3 pins from `behavior-actions.json`, `behavior-states.json`, `sequence.json` and `interconnection.json`, and the blank model's two rows. | an element with no name in the text given its keyword (`«start» start`) |
| R5 | a model of no more than 500 elements starts wholly unfolded, a larger one with only the package's row | `scaleState(500)`: `rows.unfolded`, as a set, is the ids of every row that has a row inside it, worked out by the test from `lib.browserRows` and the model's views by section 1's rule. `scaleState(501)`: `rows.unfolded` reads `['package:']`. The example: `package:`, `el:Page`, `el:Page.hosts`, `el:Page.app`, `el:Host`, `el:App`. | the limit read as "fewer than 500" |
| R6 | a long list shows its first 200 rows and ends in Show more, which shows 200 more | `scaleState(5000)`: the package's item has 201 children; the first three are the views' rows; the last is `more:package:`, whose text is `Show more (3651 not shown)` and whose label is `Show more`. A listener counts. `showMore('package:')`: 401 children, `Show more (3451 not shown)`, `rows.items` a new array, one call, `built` still 1. Eighteen more calls: 3,851 children and no `more:package:`; `wordsOf('more:package:')` is null. One more call, and `showMore('el:Nobody')`: no call. | "Show more" showing every row at once |
| R7 | folding is the rows' own: it is kept, and it tells once | The example. `setUnfolded` with `rows.unfolded` less `el:Page`: `unfolded` lacks it, a new array; `wordsOf('el:Page')` is there and `wordsOf('el:Page.hosts')` is null; one call. The same again: no call, the very array. `setUnfolded([...those, 'el:Nobody', 'el:DevHost'])`: neither is in `unfolded` (one names no row, the other has nothing inside it) and nobody is told. | a row with nothing inside it kept in `unfolded` |
| R8 | a rename works out the words of the shown rows again, and only the rows whose words differ are new | The example; the words object of each of the 25 rows is kept. `rename(s, 'Host', 'Machine')`: one call; `built` 1; `rows.items` the very array. The rows whose words object is new are exactly `el:Host` (`«part def» Machine`), `el:Page.hosts` (`«part» hosts : Machine [1..*]`), `rel:t-hosts` (`«defined by» hosts defined by Machine`) and the three `rel:s-…` (`… specializes Machine`); every other row has the object it had. An edit that sets `model.package.name` to `'Proof'`: only `package:` is new. One that renames the view: only `view:v-proof`. One that sets Host's `doc`: no call. | only the row of the element the change names worked out again |
| R9 | a row inside a folded row gets its words when it comes to be shown, as the model then says them | The example; `el:Page` folded. `rename(s, 'Page.hosts', 'machines')`: `wordsOf('el:Page.hosts')` is null, and `rel:t-hosts` reads `«defined by» machines defined by Host`. `el:Page` unfolded again: `el:Page.hosts` reads `«part» machines : Host [1..*]`. | the words of a row kept from before it was folded away |
| R10 | a move, a resize and the end of a run cost nothing | The session is opened with the library behind a `Proxy` whose `get` counts each read of `browserRows` and of `reading` and hands on the library's own value (the rows read both as `session.lib.browserRows` and `session.lib.reading` at each use, as their contract says, so that the count sees them). After the first build both counts are noted, a listener counts, and the words objects are kept. An edit that adds 10 to `view.layout.Host.x`; an edit that sets `view.layout.Host.w`; a keyed edit (`'name:Host'`) followed by `history.endEdit()`, of which the keyed edit is a rename and is the one change that counts: after the two moves the counts, the listener's and every words object are as they were; the rename takes the count of `reading` up by one and that of `browserRows` by none; after `endEdit()` everything is as it was after the rename. | a move treated as any other change (the words worked out again) |
| R11 | a change of the structure builds the rows again, and keeps what was folded and how much is shown | The example; `el:Host` folded. An edit pushes `{ id: 'NewDef', kind: 'PartDefinition', name: 'NewDef', doc: '' }` onto `model.elements`: `built` 2, one call, a new `items`, a row `el:NewDef` at depth 1 reading `«part def» NewDef`, `el:Host` still folded and `el:Page` still unfolded. An edit gives DevHost a part (`{ id: 'DevHost.p', kind: 'PartUsage', name: 'p', doc: '', owner: 'DevHost' }`): `el:DevHost` is in `unfolded`. `history.undo()` twice: both rows gone, `built` 4. Then `scaleState(5000)`: `showMore('package:')`, then an edit that pushes a part def: the package's item still has 401 children and `unfolded` still reads `['package:']`; an edit that gives the model's first element with nothing inside it a part: that element's row is not in `unfolded`. | what is unfolded set afresh at every build |
| R12 | the rows are a session's, and their methods can be handed over | `explorerRowsOf(s)` twice is one object; another session's is another. `const { wordsOf, setUnfolded, showMore, listen } = rows`; each works bare. | new rows made at each call |
| R13 | the 5,000-element model's rows are built in under 300 ms, and 100 renames reword them in under 200 | `scaleState(5000)`: the time of `explorerRowsOf` (measured in the probe: 29 ms), then of 100 edits that each add a letter to the first element's name (measured: 0.15 to 0.3 ms each). Both are reported as `#` lines. | the words of every row worked out at each rename, shown or not |

### `canvas/app/test/picking.test.mjs` (the page), `describe('picking on a plane')`, and `gestures.test.mjs`

These read the planes only, so they pass with `9-impl-selection` and `9-impl-plane` built and nothing else. `corner(page, view)` is the plane's top left corner, 6 px in each way, asserted to be bare ground. `past(rects, id)` is 6 px right of and below the bottom right corner of a node's rectangle. `covered(rects, from, to)` is section 3's rule. The marquee gesture, called M below: `Shift` down; the mouse to `from`, down; to `to` in 6 steps with a frame after each; (assertions); up; `Shift` up; 3 frames.

| # | Name | What it does and asserts | Before | Breakage |
|---|---|---|---|---|
| K1 | a click on a box picks it alone, and Ctrl or ⌘ with a click adds it or lets it go | Click Host's header: nodes `[Host]`. Click App: `[App]`. `Control` + click Host: Host and App. `Control` + click App: `[Host]`. `Meta` + click App: Host and App. `Control` + click the middle of `mount`: Host, App and the edge `mount`. A plain click on `mount`: the edge alone, no node. | `⌘ + click on App leaves App selected alone, not Host and App: ⌘ does not add.` | `add` read from `ctrlKey` alone |
| K2 | a click on a box that is one of several picked picks it alone | ServerHost by a click, OnlineHost and DevHost by `Control` + click; a plain click on OnlineHost: nodes `[OnlineHost]`. | `A plain click on OnlineHost, one of three picked boxes, leaves ServerHost, OnlineHost, DevHost selected, not OnlineHost alone.` | `clicked()` passing over a click on a box that is already picked |
| K3 | a click on the ground lets go of everything on the plane, with or without Ctrl | Host and `mount` picked; a click on `groundPoint`: no node and no edge selected. Host picked; `Control` + click on the ground: none selected. *Passes before* (React Flow's own reset does it today). | | `onPaneClick` left off React Flow |
| K4 | Shift with a click is a click | `Shift` + click on Host's header: nodes `[Host]`, and no `.react-flow__selection`. `Shift` + click on the ground: none selected. *Passes before.* | | the click after a press with Shift dropped (the flag of "a marquee was drawn" set at the press) |
| K5 | a marquee picks what it covers whole, and lets go of what it no longer covers, as it is drawn | M from `corner` to a point 40 px on: one `.react-flow__selection`, nothing selected. On, without releasing, to `past(rects, 'Host')`: the selected nodes are exactly `covered(...)`, which holds Host and Page.hosts and not Page; the selected edges exactly the lines between them (`t-hosts`). Back to the 40 px point: nothing selected. On to `past(rects, 'Host')` again and release: the same nodes and edges; no `.react-flow__selection`. | `With Shift held and the pointer dragged from the plane's corner, the plane draws no marquee (.react-flow__selection).` | `selectionMode` left at Partial, or the covering test taking a box the rectangle only cuts |
| K6 | a marquee begun on a box does not drag the box, and the click that ends it picks nothing | `Shift` down; press on Host's header; move 60 by 40 px in 3 steps: Host has not moved against App (under 1 px), one `.react-flow__selection`. `Shift` up; a frame; mouse up; 3 frames: nothing is selected (the marquee covered no node, and the click on Host that React Flow lets through is not taken); Undo is disabled. The same again with `Shift` held until after the release: the same. | `Shift with a press on Host dragged it 60.0 by 40.0 px against App: no marquee was drawn.` | the flag that drops the click after a marquee taken out |
| K7 | a drag of a box that is not picked moves it alone and picks nothing, and the picked boxes are still dragged together | ServerHost by a click, OnlineHost by `Control` + click. Drag DevHost by its header 60 by 30 px in 6 steps: DevHost moved against StrongholdApp; ServerHost and OnlineHost did not; nodes selected: ServerHost and OnlineHost. Then drag OnlineHost 60 by 30: ServerHost moved by the same, within 1 px; DevHost did not. | `After a drag of DevHost, which was not picked, ServerHost and OnlineHost are no longer selected.` | a `select` change left without a new object for the node it names |
| K8 | a tab that comes back shows what is picked now, and a pick shows on every plane that shows it | `interconnection.json`, views `one` (`v-ic`) and `two` (`v-defs`), both of which place Pump and Tank. On `one` click Pump. Show `two`: Pump is selected there. Click Tank on `two`. Click the tab of `one`: Tank is selected and Pump is not. | `Pump, picked on fuelSystem, is not selected on definitions, which shows it too.` | a store with no subscriber never marking what is picked |
| K9 | the marquee is drawn in the theme's teal | M from `corner` to 200 px on; before the release, the marquee's computed style is section 3's. | `With Shift held … the plane draws no marquee (.react-flow__selection).` | `marquee.css` not imported |
| G1 | `gestures.test.mjs`: Shift with a drag draws its rectangle only while it is drawn, and leaves nothing over the boxes (restated from "Shift with a drag draws no rectangle and leaves nothing over the boxes") | M from `corner` to `past(rects, 'Host')` in 8 steps. Before the release: one `.react-flow__selection`; no `.react-flow__nodesselection` and no `.react-flow__nodesselection-rect`. After it: none of the three. The selected nodes are exactly `covered(...)`. Then `selectBox(page, view, 'Host')`, and the selected nodes are `['Host']`; then a click on Page.hosts' header, and they are `['Page.hosts']`: nothing lies over the boxes the marquee covered. | `With Shift held and the pointer dragged across the plane (over N boxes), the plane draws no marquee (.react-flow__selection).` | React Flow's `nodesSelectionActive` left on |

### `canvas/app/test/explorer.test.mjs` (the page), `describe('the Explorer')`

These read the Explorer only, so they pass with `9-impl-selection` and `9-impl-explorer` built and nothing else: no test of this file clicks on a plane, clicks a view's row, or reads `aria-current`. **Before**, for every test but X1: `The Explorer has no row for … (data-row "…"): its tree is not built.`

| # | Name | What it does and asserts | Breakage |
|---|---|---|---|
| X1 | with no file open the Explorer says so, and with one it shows the package, its views, then the elements and the lines | A page with no file: the Explorer's text contains `No model is open.`; no element with the role `tree`. The example opened: one tree named `Model`; `rowsNow` is section 3's 25 ids in order; each row's text is section 3's; the tree item of `el:Page.hosts` is inside that of `el:Page`, which is inside the package's; `rel:mount`'s is inside `el:Page`'s. **Before**: `The Explorer says "The model's tree comes in step 9.", not "No model is open."` | the views' rows put after the elements' |
| X2 | a row is 28 px high, in Roboto at 13 px, with its name in medium weight, and steps in 16 px a level | Every row's height is 28 px (within 0.5). A `.grasp-row-name` is 13 px, weight 500, Roboto; a `.grasp-row-kw` is the secondary colour. The left edge of the words of `el:Page` is 16 px right of the package's, `el:Page.hosts` 16 more, `el:Page.hosts.api` 16 more (within 0.5). | the tree's `itemChildrenIndentation` left at Tree View's own 12 px |
| X3 | the Explorer stays as wide as its panel, and a row too long for it is cut and says itself whole in its title | The right edge of the Explorer's root is noted with no file; after the example is opened it is the same (within 0.5), and the root's `scrollWidth` is no more than its `clientWidth`. No row's words run past their row's right edge. `rel:t-hosts-api`'s words are cut (`scrollWidth` over `clientWidth`), and the `title` of every row's `.grasp-row-words` is the row's text. | `contain: inline-size` taken out of `explorer.css` |
| X4 | a click on a row's words picks it and does not fold it, and its fold control folds it and picks nothing | Click the words of `el:Page`: `selectedRows` is `['el:Page']`, its tree item still `aria-expanded="true"`. Click its `.grasp-row-icon`: `aria-expanded="false"`, no row `el:Page.hosts`, `el:Page.app` or `rel:mount` in the document, 20 rows, `selectedRows` still `['el:Page']`. Click it again: 25 rows. A row with nothing inside it (`el:DevHost`) has no `aria-expanded` and no `svg` in its fold control. | `expansionTrigger` left at Tree View's own (a click on the words folds) |
| X5 | Ctrl or ⌘ with a click on a row adds it or lets it go, and Shift with a click picks the rows between | Click `el:Host`; `Control` + click `el:App`: both selected. `Control` + click `el:Host`: `['el:App']`. `Meta` + click `el:DevHost`: App and DevHost. Click `el:Host`; `Shift` + click `el:ServerHost`: the six rows from `el:Host` to `el:ServerHost` in the tree's order. | `multiSelect` left off |
| X6 | the package's row picks nothing and lets nothing go | Click `el:Host`; click the package's row: `selectedRows` is still `['el:Host']`; the package's tree item has no `aria-selected`; the keyboard's focus is on it. No tree item in the Explorer has `aria-checked`. | the package's row made a row that can be picked |
| X7 | the keys move the focus, pick and fold | `interconnection.json`. Click `el:Fuel`. `ArrowDown` twice: the focus is on `el:FuelPort`'s tree item and `selectedRows` is still `['el:Fuel']`. `Space`: Fuel and FuelPort. `ArrowLeft`: FuelPort is folded. `ArrowRight`: unfolded. `Shift+ArrowDown`: `el:FuelPort.supply` is selected too. `Home`: the focus is on the package's row. | Space picking the row alone (the rows before let go) |
| X8 | a selected row is on the soft teal, and the row with the keyboard's focus has the theme's ring | Click `el:Host`: its row's computed `background-color` is `cssColor(page, 'var(--grasp-teal-soft)')`, and another row's is not. `ArrowDown`: the row of the tree item with the focus has an outline 2 px wide, solid, teal. | the focus rule taken out of `explorer.css` |

### `canvas/app/test/selection.test.mjs` (the page), `describe('the shared selection')`

The plan's six, under the plan's names, then what needs every part. They pass once all four implementers are done. **Before**, for every test but S2: `The Explorer has no row for … (data-row "…"): its tree is not built.`

| # | Name | What it does and asserts | Breakage |
|---|---|---|---|
| S1 | a box picked on the plane is the selected row, and a row picked is the selected box | Click Host's header on the plane: `selectedRows` is `['el:Host']`, and the row has `data-selected`. Click the row `el:App`: on the plane App is selected and Host is not; `selectedRows` is `['el:App']`. | `selectedItems` not given to the tree |
| S2 | a marquee selects what it covers | The marquee gesture of `picking.test.mjs` from the plane's corner to 6 px past Host's bottom right corner. Before the release and after it: the plane's selected nodes are exactly the covered ones (Host and Page.hosts among them, Page not), its selected edges the lines between them, and `selectedRows`, as a set, is the rows of exactly those elements and lines (`el:Page.hosts`, `el:Page.hosts.api`, `el:Host`, `el:Host.api`, `rel:t-hosts`). **Before**: `With Shift held and the pointer dragged from the plane's corner to past Host, the plane draws no marquee (.react-flow__selection).` | the lines left out of what a marquee picks |
| S3 | Ctrl + click adds | Click Host on the plane; `Control` + click App on the plane: both boxes selected, `selectedRows` holds both. `Control` + click the row `el:DevHost`: DevHost's box is selected too, three rows. `Control` + click the row `el:Host`: Host's box and row are let go, App's and DevHost's stay. | `Control` + click on a row picking it alone |
| S4 | a line's row selects its line | Click the row `rel:mount`: the edge `mount` is selected on the plane, its `path.grasp-line` stroked teal, no node selected, `selectedRows` is `['rel:mount']`. Click the middle of the line `t-hosts` on the plane (from `hosts` down to `Host`; the three specializations share a trunk, so the middle of one of them is not its own): `selectedRows` is `['rel:t-hosts']`, and the edge `mount` is no longer selected. | a relationship's row made a row that cannot be picked |
| S5 | a closed tab opens again from its view's row | `browser.json` (views `v-proof`, `v-tree`, `v-page`). Close the tab of `v-proof`. Click the row `view:v-proof`: its tab is there again and in front, its plane draws (`untilDrawn`), `selectedRows` is `['view:v-proof']`, and the keyboard's focus is on that row's tree item. Click the row `view:v-tree`, whose tab is there and not in front: its tab is in front. `ArrowDown`, `Enter`: the row `view:v-page` is the one selected and its tab is in front. | `showView` doing nothing for a view that has no tab |
| S6 | with the 5,000-element model only the package's row is unfolded, and a long list ends in "Show more" | `stateFileOf('scale-5000.json', scaleState(5000))`. `rowsNow` has 202 ids: `package:`, the three views', 197 more, and `more:package:` last. The package's tree item has `aria-expanded="true"`, and no other tree item has. The last row reads `Show more (3651 not shown)` and its tree item has no `aria-selected`. A click on it: 402 rows, and it reads `Show more (3451 not shown)`; nothing is selected. The focus is on it; `Enter`: 602 rows. | every row unfolded whatever the model's size |
| S7 | the row of the view in front is marked, and follows the tabs | `interconnection.json`. As it opens: `view:v-ic`'s tree item has `aria-current="true"` and no other has; its name is drawn in teal. Click the tab of `v-defs`: `view:v-defs` is the one marked. Click the row `view:v-ic`: its tab is in front and it is the one marked. Close the tab of `v-ic`: `view:v-defs` is marked. Close that one too: no tree item has `aria-current`. Click "Show the views again": `view:v-ic` is marked. | the view in front told only when a tab is clicked, not when one is closed |
| S8 | another file opened shows its own rows, with nothing picked | The example: click the row `el:Host`; fold `el:Page` (20 rows). `openStateFile` with `interconnection.json`: the first row reads `«package» FuelSystem`, there are 51 rows, `selectedRows` is empty, `view:v-ic` is the one marked. `openStateFile` with the example again: 25 rows (`el:Page` unfolded: a new session's rows), nothing selected. | the rows of the first file kept for the next (read once, not per session) |
| S9 | what is picked on a plane is scrolled into view in the Explorer | `interconnection.json`, the window made 1400 by 500 (`page.setViewportSize`) before the file is opened. Click the row `el:Fuel`. The row `el:System.pump` is in the document and lies below the Explorer's bottom edge. Click the box System.pump on the plane: `selectedRows` is `['el:System.pump']`, and its row lies wholly inside the Explorer's rectangle. | `scrollIntoView` left out |
| S10 | a pick whose row is folded away marks no row until the row is unfolded | Fold `el:Page`. Click the box Page.hosts on the plane: it is selected there; `selectedRows` is empty; `el:Page` is still folded. Unfold `el:Page`: `selectedRows` is `['el:Page.hosts']`. | the rows above a picked row unfolded when it is picked |

### Timed tests

Step 9 adds no test timed in the page. Its "Done when" asks that step 8's three scale tests still pass; `9-checks-close` runs `scale.test.mjs` and `instant.test.mjs` alone, three times. C11 and R13 are timed in Node with bounds far above what was measured; the lead judges them alone if they fail beside other work.

### What step 9 cannot test in the page

Nothing in the page can rename an element or change the model's structure before steps 10 and 11. So that a row's words follow a rename in the page, and that the tree is built again when an element is made, are asked by `explorer-rows.test.mjs` for the rows and left to step 10's "a rename shows on the box, the tab and the row as it is typed" and step 11's "the element or line appears on the plane and in the Explorer" for the page. Those tests read a row as section 3 says: `rowIn(page, 'el', id)`, whose text is `kw + name + type`.

The dock's answers for a split editor and a floating tab were seen in the probe through Dockview's own API. No test drags a tab into a split: Playwright's drag of a Dockview tab is not steady enough to hang a test on.

## 5. The screenshot

Step 9 takes none (`plan/slice-1.md`, section 4, gives it no row). The Explorer shows on `shell.png` only at its retake in step 13, with no file open, where it reads `No model is open.`

## 6. Decisions, and what was measured

Where the plan is silent:

1. **The marquee's picks come from React Flow's rectangle, through a new method of the store, `marquee(rect)`, and no `select` change is ever turned into a pick.** React Flow's changes are deltas against its own records, and miss a box that was selected before the marquee began.
2. **Every node and line a `select` change names gets a new object.** It is the one way React Flow's own records are put right after it changed them for a click the selection did not follow; without it a later drag moves the wrong boxes.
3. **"Covers" is wholly inside**; a line is picked when both its boxes are; the order is the view's own, nodes then lines.
4. **A marquee picks as it is drawn**, and the view when it covers nothing. One rule at every move; no state of its own.
5. **Ctrl or ⌘ with a marquee does nothing more.** Slice 1 has no need of it, and adding it would need the store to remember what was picked before.
6. **The second rectangle React Flow draws after a marquee is never drawn** (`nodesSelectionActive` set back to false). Session 21 found it over the boxes, taking their clicks.
7. **The click that ends a marquee is dropped.** React Flow lets it through when Shift is released first.
8. **A drag of a box that is not picked picks nothing and lets nothing go.** Step 7 chose that a drag selects nothing (`selectNodesOnDrag={false}`); the selection is not React Flow's to clear.
9. **`multiSelectionKeyCode` is Control and Meta on every machine**, as `Hit.add` is.
10. **The marquee is teal**, from a stylesheet beside the plane, with `color-mix` on the theme's variable, so no colour is written outside `theme.ts`.
11. **The Explorer's logic is in `panels/explorerRows.ts`, without React.** It is the only way step 9 can test rebuilding and relabelling.
12. **The library is asked for its rows with no view of the model's**: the whole package, nothing folded.
13. **The package's row holds everything; the views come first inside it.** The plan's order, and the plan's "only the package's row is unfolded" needs the package to be a row with rows inside it.
14. **A row says what the old page's browser row says**, without the notes; a view's row says its kind's label and its name.
15. **With no more than 500 elements everything starts unfolded.** The plan gives the other half; a small model is then seen whole. It costs about 0.4 s at 500 elements (below).
16. **A click on a row's words never folds.** A click picks; a person who picks rows does not want them to open and shut.
17. **Folding and "how much is shown" are kept for the session and through rebuilds**, and not saved.
18. **"Show more" shows 200 more each time.** The same number as the first.
19. **Rows are relabelled by wording the shown rows again.** Always right, whatever a row's words read, and under 0.3 ms for 204 rows; an index of which row names which element would be faster for a tree unfolded wide, and is not needed.
20. **A row is our own elements on `useTreeItem()`.** Half the cost of a stock `TreeItem`, `aria-selected` as the shared helpers expect, and styles of our own classes.
21. **The package's row and "Show more" pick nothing**; a click on the package's row lets nothing go. The selection holds elements, lines and views; the package's fields are not slice 1's.
22. **Nothing is unfolded, and no list made longer, to reveal a pick.** At 5,000 elements a pick on a plane could otherwise mount thousands of rows. The row of the last picked is scrolled into view when the tree has it.
23. **The keyboard is Tree View's own**, with Enter and Space on a view's row and on "Show more" doing what a click does.
24. **The row of the view in front is marked** (`aria-current`, its name in teal). It makes `selection.view` visible, and testable, before step 11.
25. **The view in front is worked out from Dockview's state at each event**, never kept by hand: the events come in bursts when a file is opened, and a rule that is a function of the state cannot get out of step.
26. **With no file open the Explorer says "No model is open."**
27. **Step 9 has two more source files and five more test files than the plan lists**: `explorerRows.ts` and `marquee.css`; `selection-core`, `explorer-rows`, `picking`, `explorer`, and the restated `gestures` and `viewStore` tests. The plan's list leaves the wiring out, as session 17 noted of steps 5 to 8.

Tried and dropped:

- **Picks from React Flow's `select` changes during a marquee.** Its deltas are against its own records, which the selection has changed under it; and its own "nothing changed since the last marquee" check skips the changes when a second marquee covers what the first did.
- **`elementsSelectable={false}`**, so that React Flow would send no `select` change at all. It also switches the marquee off.
- **A stock `TreeItem` with `slotProps`.** It works; it is about twice as slow to mount, says `aria-checked`, and needs a library's classes overridden.
- **A key on the tree per session.** A mount of the tree drops the keyboard's focus; and with a key that changed too often the focus was lost at every click on a view's row.
- **The Explorer's root without `contain: inline-size`.** The side's body grew to the widest row and `shell.test.mjs` failed.

Measured, in this container, on the throwaway build, while three other instances worked on the machine (so each is an upper figure):

| What | Measure |
|---|---|
| `explorerRowsOf` for the 5,000-element model, in Node | 29 ms the first time (`browserRows` is 16 to 20 of them); 1,384 items go to Tree View |
| A rename, 5,000 elements, the package's row alone unfolded (204 shown rows), in Node | 0.15 to 0.3 ms for the edit and every listener |
| A change of the structure, 5,000 elements, in Node | 37 ms |
| "Show more", in Node | 1.2 ms; in the page 45 to 100 ms for the 200 rows it mounts |
| A move, in Node | nothing is read |
| The 5,000-element model, from the file being given to a painted frame with the tree's rows and the plane's nodes | 620 to 700 ms with our own rows; 670 to 860 ms with stock `TreeItem`s. `scale.test.mjs`'s own figure, to the first view drawn: about 560 ms with the Explorer empty, 730 to 860 ms with the tree |
| A 500-element model, wholly unfolded (791 rows), the same measure | 380 to 400 ms with our own rows; 690 to 850 ms with stock `TreeItem`s. A 520-element model (202 rows): 200 to 250 ms |
| The example, the same measure | 70 to 100 ms |
| `selection.set()` of one element, 5,000 elements, to the end of React's work | 7 ms with the tree folded to one row, 13 ms with 202 rows, 17.5 ms with 1,002 rows |
| A rename at 5,000 elements in the page, the edit to the end of React's work | 10.6 to 11.1 ms whatever the tree shows; the plane's projection is 10 of them |
| What is selected, worked out for a view of 1,544 nodes and 384 lines | 0.18 ms (`has()` takes 92 ns) |
| `store.marquee` over all 1,544 nodes | 4 ms the first time (1,928 picks), 3 ms when nothing changes |
