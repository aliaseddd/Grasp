# Slice 2, "Editing parity": the plan

November 14, 2026, session 30. Approved by Damon on November 14, 2026, with each of the five points that waited for him as the plan has it (section 12). It is package 2-0 of `plan/architecture.md`. Nothing of the slice is built yet: the scaffold, package 2-1, is next.

## Context

Slice 1 built a new page beside the old one: the shell, the planes of the four graph view kinds, moving and resizing, Details, the tools, Validation and About. The old page still does what the new one does not: it draws the other four view kinds, edits labels in place, deletes, manages views, keeps notes and code links, and shows the model's text. Slice 2 brings all of that to the new page, done the redesign's way, and adds what `plan/direction.md` asks for beyond the old page: lines drawn by dragging and ends moved by dragging. Then the old page leaves `canvas/` and is kept in `archive/old-page/`.

This document is the slice's design. It has three readers. Damon approves it. The lead builds the scaffold from it. And each feature package is built by an agent that sees only its brief (section 8), the sections of this plan the brief names, and the files they name.

## In short

1. **The slice is sixteen packages**, 2-0 to 2-15, as the architecture cut them. This plan is 2-0. The scaffold, 2-1, fixes twelve seams (section 4) so that packages 2-2 to 2-13 can be built side by side, in two rounds, without two of them changing one file.
2. **The two probes are answered** (section 2): the sequence view and the geometry view each get a graph body. React Flow serves both through its public props, by rules their readers must keep, and the plane's camera, marquee, right-click and every shared gesture then come with no code.
3. **What a person can do on the old page is 112 capabilities** (section 7), each with the name of the test that proves it on the new page. 38 are proved by tests of slice 1 that pass today. Six things the old page does are left out, each approved by Damon by name.
4. **Every command is a row of one table** (section 5), 32 rows, asked in one way, and a row that does not apply says why in a sentence. That is how criterion 6 is met once for the whole page.
5. **Two things are built otherwise than the architecture says** (section 12). A line is drawn and reconnected by a gesture of Grasp's own, not React Flow's: React Flow cannot put a reconnect anchor at the end of a line the page routes itself, and its handles cost two subscriptions each. And the feature packages are built in two rounds, because a body's tests in the page need the first round's code.
6. **What Damon decided** is in section 12: the plan's approval, the six capabilities left out, one sentence of contract 9, a key with no file open, and the behaviours that differ from the architecture or the old page.

## 1. Where the project stands

### The state the session found

- The branch is `claude/bold-sagan-bsllj2`, clean, at `a0239de` (pull request #57 merged: the architecture with Damon's answers).
- `plan/status.json` says `"next": 2`. Slice 1 is `done` with its ten checks `pass`. Slices 2 to 7 are `open`.
- Session 29 of `plan/notes.md` wrote `plan/architecture.md` and changed no code. Damon answered its questions the same day: the old page is archived, not deleted; the slices stay separate; notes are records.

### The baseline run

| Command | Result |
|---|---|
| `npm ci` | exit 0; 119 packages in 13 s |
| `npm run check` | exit 0; "canvas/dist is what the sources build.", and the types hold; 5 s |
| `npm test` | exit 0; 470 tests in 42 suites: 470 pass, 0 fail, 0 todo; 324 s |

The container has Node 22.23.4, npm 10.9.9 and 4 processors. The timed tests' medians in that run: the 5,000-element model opened in 605 ms; a drag step took 10.1 ms starting and 7.2 ms following; a keystroke 32.3 ms opening a step and 24.1 ms joining one; a pan step of the fitted general view 12.0 and 11.0 ms. Four agents were started while that run was going, so these are not a measurement judged alone. The scaffold takes the measurement of criterion 9.

### The passages that govern the slice

Its scope and its "Done when" are `plan/direction.md`, "The slices", item 2:

> **Editing parity, the old page retired kind by kind.** Everything Damon does today, done the mature way: drag from a node's handles to draw any relationship the view kind allows, with a small menu when more than one kind fits; reconnect by dragging an end; label editing by typing with SysON's grammar, in nodes and in rows; checks while drawing, debounced, with badges and the Validation panel; refusals as toasts; Delete, F2, Escape; undo and redo over model and layout; all eight view kinds, as React Flow node and edge components where they fit and as SVG inside the tab where they fit worse (sequence and geometry are the doubtful ones), the grid as a table, the browser as the Explorer with chosen roots; notes pinned to nodes, edges and the plane, the archive, the code links section as today. […] Done when: every fixture opens and, saved from the new page, exports its pinned text; the Playwright suite, rewritten for the new page, passes with the scale tests; `canvas/index.html` and the SVG renderer are gone.

`plan/architecture.md` is the layer between that and this plan: section 2 (the ten rules), section 4, "Slice 2. Editing parity" (the packages, what the scaffold fixes, what this plan decides), and the contracts that section names: 1 to 15, 20, 22, 25, 26 and 27. This plan changes none of them. Damon's decisions of November 14 are in its sections 8 and 9: the old page goes in one step, at the end, into `archive/old-page/`; "rows" in this slice are the rows of the Explorer and of a browser view; the four new bodies get no scale test of their own.

The eleven success criteria that Damon chose for the slice are in section 10.

### What the code looks like where the slice builds on it

The lead opened each of these. The list says what the files hold today.

1. **A node has no handle a person can use.** Each node component renders one inert element of 0 by 0 with the classes `source target`, so that React Flow can draw lines to it (`plane/nodes/BoxNode.tsx`, `PortNode.tsx`, `SmallNode.tsx`). The plane sets `nodesConnectable={false}`.
2. **A line routes its own two ends** from the rectangles of its two nodes (`plane/edges/LineEdge.tsx`, the adapter's `route`). It does not use the points React Flow would give it.
3. **`isDrawn(lib, kind)` means "its renderer is `graph`"**, and five places ask it: `toolGroups`, `place`, the tool's `click` and `offers` in `core/commands.ts`, the view's store, and the Tools view. A sequence view and a geometry view have tools in the model library's rows, and `toolGroups` lists none for them today.
4. **`place()` knows the graph kinds' rule of place only.** It projects the view with the adapter and finds the box under the point.
5. **Three keys are listened for by components**: Undo, Redo and Save in `shell/TopBar.tsx`, and Escape in `panels/Tools.tsx`. Each holds its own rule about text fields and modal dialogs.
6. **A toast shows only what a tool said** (`toolsOf(session).said`).
7. **The session passes notes through.** `session.notes` and `session.archive` are the file's lists as they are, and `stateFile()` writes them back. `session.unsaved` compares the history's mark only.
8. **The adapter reads an element's `code` list itself** to make the code compartment's rows (`core/adapter.ts`, line 573).
9. **A view's store sets `selected` on its nodes after each projection**, with a new object only for a node that differs. Marks go the same way.
10. **The model library gives every function the old page's scripts call.** The 26 page scripts reach 59 names of the library as `M.<name>`, and the library has all of them among its 96 (checked by a script in this session). So assumption 5 of the architecture holds as far as names go: the slice needs no addition to the library. What the scripts hold themselves is ported: the layout of the sequence, geometry, grid and browser views, how a note is read (`tidyNote`), and where a new view or a shown element is put.
11. **The ten files hold 17 views**: 11 of the graph kinds, 2 browser, 2 grid, 1 geometry, 1 sequence. Seven of the files hold notes. One of them, the annotations fixture, also holds an archived note, a free note and code links. Between them the ten files hold a line of each of the nine relationship kinds.
12. **The old page deletes the notes on what is deleted**, and Undo does not bring them back (`deleteSelection` in `canvas/src/core/page/panel.js`). It has no redo, no selection of several things, no resizing and no right-click, and it draws a line by two clicks only.

### What the probes found

Both answered "a graph body". Section 2 gives the answers, what decided each, the numbers, and the rules the two readers take from them. The probes' folders, `plan/spikes/sequence/` and `plan/spikes/geometry/`, hold the candidates, the script that drives them, and a `README.md` with the answer first.

## 2. What the architecture leaves to this plan, and how the plan settles it

`plan/architecture.md`, section 4, lists these under "Its plan decides" and "What it finds out first". Each is settled here, with its reason. Section 12 says what Damon decided on the ones that were his.

### The sequence view and the geometry view: a graph body each

Two probes ran at the start of the slice, one for each view kind, in `plan/spikes/sequence/` and `plan/spikes/geometry/`. Each built both candidates on one shared layout function, ported from the old page: React Flow nodes and edges as the page builds its planes (a graph body), and one SVG component (a component body). Each drove both with real pointer events through one script, tried to break each, and measured. Each folder's `README.md` is the written answer, with how to run it again.

| | The sequence view | The geometry view |
|---|---|---|
| **The answer** | **A graph body** | **A graph body** |
| What decided it | All nine items of the probe's list work on React Flow through its public props and hooks, 79 of 79 checks, once the reader gives a lifeline as two nodes. The other three shapes each show a defect, reproduced. | Every item works on React Flow through its public props and node fields, 143 of 143 checks. 60 of 60 drops are reported within 0.0005 m of the pointer, which is the rounding itself. The painted outlines are within 0.12 px of their place at zooms 1, 2 and 4. |
| The component body | Passed every item too, with half the code (246 lines against 536) and about half the time. | Passed every item too, with half the code (122 lines against 247) and half the first mount. |
| One step of a drag | 20 lifelines and 300 messages: a message's row 7.7 ms against 3.7 ms; a lifeline that pushes 18 others 18.9 ms against 10.3 ms with everything mounted, 8.7 ms with only what the window shows mounted, which is the page's rule for a view of that size. | 500 footprints, an owner with its 9 parts: 5.5 to 6.6 ms against 4.5 to 5.9 ms. |
| What a graph body gets with no code | The camera with its fit, the zoom buttons, the marquee, the hits of a click and a right-click, mounting only what the window shows, frames in slice 3, and the gestures other packages add: lines by dragging, pins, badges, the label editor. | The same. |
| What it costs | Four rules for the reader, and a message's drag that is no React Flow gesture. | Five rules for the reader and the plane. |

Both probes call it close on cost and not close on what the view gets for nothing. The plan takes both answers. A component body would have to build the camera's controls, the marquee, the right-click and the connecting again for itself, and in slice 3 the plane could not look inside it.

**What the probes fix for the readers.** Package 2-10 and package 2-11 build what their probe's candidate A is, by these rules, each of which answers a defect a probe reproduced:

- **A lifeline is two nodes**: its head, whose id is the element's, and its line, `<id>:line`, as tall as the view, behind everything, which React Flow neither selects nor drags. Events are children of the line's node. With one tall node, selecting it draws its dashed line across the labels; with the head alone, a head outside the window takes its dashed line and its rows with it.
- **Messages and successions are edges, drawn above the nodes** (`zIndex: 1`). An edge ends on an event's node, else on the lifeline's line node, and its data says how far under each of those nodes' tops it runs.
- **A message is moved by a gesture of its own edge**: React Flow drags nodes only.
- **A footprint's node takes no pointer itself; what is drawn in it does.** Otherwise a click in the corner of a circle's square counts as the circle.
- **A footprint's outline is SVG inside the node, placed by a transform.** A box drawn by CSS is rounded to whole pixels before the zoom: 1.7 px off at zoom 4.
- **A footprint's node is as large as everything it draws**, its words under it and its marks over it. Otherwise React Flow unmounts it while its words are still in the window.
- **A node's `zIndex` is its place in the drawing order, and a picked footprint is not raised.** Otherwise a picked room covers a rug that lies on it.
- **The plane has no snap grid.** It has none today.

**What the probes ask of the scaffold**, beyond the architecture's table. Seam 3 holds all of it:

- A node can stand for no element (the axes), or be a second node of one (a lifeline's line). So `data.element` can be null, and a node's id is no element's id, which contract 5 expects.
- React Flow drags every selected node. For these two kinds the store takes only the node the press named.
- An entry of the registry can set props of its plane. The geometry view sets `elevateNodesOnSelect` to false.
- The marquee of such a view picks by the rectangles its reader lists, since a message between two line nodes has no node of its own.

**What neither probe ran**: its candidate inside the page's own `Plane.tsx` and `viewStore.ts` (each rebuilt the page's pattern in its folder); the marquee, the right-click palette, the page's minimap, the far view below 25% and an undo in the middle of a drag, on these two kinds; touch; several such views on one plane. The geometry probe also notes that the three plane-wide rules reach every view of a plane in slice 3; `plan/notes.md` keeps that for slice 3's plan.

### Lines by dragging are Grasp's own gesture, on grips of its own

The architecture's scaffold "hands React Flow's connecting and reconnecting to functions of `plane/gestures/connect.ts`", and `plan/direction.md`, decision 2, names React Flow's handles with `isValidConnection`. The plan builds the gesture itself instead, on its own grips. What a person gets is the same: handles on a node, a drag to another node, a menu when more than one kind fits, an end dragged to another node. Two facts of the code decide it. Both were read in `node_modules/@xyflow/react/dist/esm/index.js`, version 12.10.2, and neither was measured in the page:

1. **React Flow cannot move an end of the page's lines where the line is drawn.** Its reconnect anchors sit where React Flow itself would end the edge, at its handles (`EdgeUpdateAnchors`, line 2747, takes `sourceX`, `sourceY`, `targetX`, `targetY`). The page's lines work out their own two ends from the boxes (`plane/edges/LineEdge.tsx`), and a node's handle is one point at its corner. So the anchors would sit at the boxes' corners, away from the line's ends. React Flow 12.10.2 has no anchor a custom edge can place. So reconnecting has to be Grasp's own gesture whatever is chosen for drawing.
2. **A React Flow handle costs two subscriptions to React Flow's store** (`HandleComponent`, lines 1742 and 1743), which run at every change of that store, a step of a pan among them. Slice 1 took React Flow's minimap out for that reason (`canvas/app/README.md`, `src/plane/MiniMap.tsx`). Four handles on each node of a near view of 300 nodes would be 2,400 subscriptions.

With reconnecting Grasp's own, one gesture for both is less code than two, and it costs nothing at a pan step: a grip is a plain element. Contract 5's "nodes get real connection handles" holds: every near node has handles a person drags from. What does not hold is the scaffold's sentence about React Flow, and that departure is listed in section 12. The scaffold measures the four limits with the grips mounted (criterion 9).

### Where the Notes panel sits, and how a note is added

- **On the left strip, after Validation.** A side shows one panel at a time. A click on a note selects what it is on, as a click on a problem does, so the Notes panel belongs with Validation; and Details, on the other side, then shows what the note is on while the note is read.
- **A note is added by a right-click and "Add note"**: on a box, a port or a line it is pinned to that; on the empty ground it is a free note at that point. The Notes panel also has an Add note button for what was picked last. The old page's Note tool in the palette is not carried: a note is not an element, and the Tools view lists what the model library's rows list.

### What happens to a note when its target is deleted, or replaced

- **A note on something deleted is kept.** The old page deletes the notes with the element, and Undo brings the element back without them. Notes are outside the history (contract 9), so the new page does not delete them: the note stays in the panel, said to be on something no longer in the model, with no pin, and it is pinned again when Undo brings its target back. A person who wants it gone deletes it.
- **A typing that is drawn again is no longer replaced.** On the old page a second "defined by" line from a usage takes the first out, and moves its notes to the new line; after Undo those notes point at nothing. On the new page the usage's one typing keeps its id and only its other end moves, as the Typed by field of Details already does it. So its notes and pins stay on it through Undo and Redo. Dragging the line's end does the same.
- **A free note whose view is deleted** is kept the same way, and floats on the view again after Undo.

### The change of owner is one step with the move

On the old page a drop into another box makes two undo steps, the move and the change of owner. The new page makes one, because one gesture is one `edit()` (rule 2), and a person who undoes a drop wants the box back where it was, in the owner it had.

### The connect menu's design

A Material UI menu at the pointer where the line was let go, dense, one entry for each kind that fits, by the kind's label in the model library, in the order of the view kind's `tools` row. The first entry has the keyboard's focus. Escape, or a click outside, closes it and draws nothing. It is shown only when more than one kind fits.

### How typing starts the label editor without taking the zoom keys

`+`, `=`, `-`, `_` and `0` are the camera's keys, always. Every other key that types one character, pressed with no Ctrl or ⌘, opens the editor with that character when what was picked last has a label to edit and the key does not come from a text field or from a tree, a menu or a list that uses typing itself. Nothing is lost: no label of the grammar begins with one of those five characters. The old page gives the zoom keys to the editor while such a thing is selected, so that there `+` zooms or types depending on what is picked.

### Where New view and Delete view are offered

- **New view** is a button at the end of the editor's tab bar, where a new tab would go. It opens the eight kinds as a menu.
- **Delete view** is a button of the view's section of Details, shown when a view is picked. Closing a tab does not delete its view: the tab opens again from the view's row of the Explorer, as in slice 1.
- **The Delete key does not delete a view.** A click on a plane's empty ground picks the view, so a stray click followed by Delete would take a view away. The key says how a view is deleted instead.

### The rule that gives a point of the old page's plane its view

Contract 9 leaves it to this plan. A state file keeps a free note at a point of the old page's one plane, and no view. On opening, the note floats on the view whose own `x` and `y` are nearest to the point, among the views that lie to the left of and above it (`x` and `y` no more than the point's); when no view does, on the nearest of all; of two as near, on the earlier in the model's order. Its place in the view is the point less the view's `x` and `y`. Saving adds them again, and a note that was not moved is saved with the very numbers the file had.

The rule reads a view's `x` and `y` and nothing else, which is all `core/notes.ts` may read (contract 22). It asks no reader for a view's size, so it gives the same answer before and after the four new bodies land.

One thing follows that the plan cannot mend. The file has no place to say a note's view. A free note that a person puts far out to the right of a view, past where the next view starts on the old page's plane, is found on that next view after the file is saved and opened again. Slice 3's notes file keeps the view (contract 9), and this ends there.

### The keys' aliases, and the page with no file

- **An action has one `key`** (contract 4), and three of the old page's keys have two spellings. `core/keys.ts` reads `Mod+Shift+Z` as `Mod+Y`, `=` as `+` and `_` as `-`. This adds no shortcut outside the table: it is how a key is read, as `Mod` is.
- **`Delete` deletes, and `Backspace` does not**, as on the old page.
- **With no file open** a key of the table does nothing and says nothing. An action is asked with a session, and there is none. The page then offers Open and About only.

### What the scaffold builds beyond the architecture's table

Section 3 lists the files the plan adds, each with its reason. Three of them carry a decision:

- **`shell/ActionControl.tsx`**: every control that asks an action is one of two components, which grey themselves and carry the sentence when the action does not apply. This is how criterion 6 is met once, not package by package.
- **`core/hands.ts`**: the core calls the shell through one object the shell gives it, so no action imports React and no component listens for a key.
- **`views/bodyContext.ts`**: a pin, the line in hand and the label editor ask the body for a point of the view and for what lies under the pointer, so they work the same in a plane and in a table.

### The design of each body, the steps, the test lists and the screenshots

Each body's design is in its package's brief (section 8). The steps are the packages, in the order of section 9. The test lists are in the briefs and in section 7. The screenshots are in section 6.

## 3. How the slice is laid out

### The files, and the package that owns each

Paths are under `canvas/app/src/` unless they begin with `canvas/` or `plan/`. "2-1 →" means the scaffold writes the file's skeleton and the named package fills it. A file with one number is that package's from start to end.

```
core/
  index.ts              2-1         exports every new module of the core
  commands.ts           2-1         + the action table: Action, actions(), actionOf(), ask(), editable(), gesturesOf()
  keys.ts               2-1         keyOf(), pressed(), ALIASES: the one reader of the keyboard, with no DOM in it
  says.ts               2-1         saysOf(session): what the page says in passing
  hands.ts              2-1         handsOf(session): what the shell lends the actions
  marks.ts              2-1         marksOf(session): contract 7
  session.ts            2-1         + viewsOf(session); unsaved follows the notes too
  files.ts              2-1         a state file's notes and archive come from notesOf
  adapter.ts            2-1, then 2-5
  readers/index.ts      2-1         Reader, Listed, readerOf(), hasReader(), placerOf(), enderOf()
  readers/graph.ts      2-1         the reader of the four graph kinds
  readers/sequence.ts   2-1 → 2-10
  readers/geometry.ts   2-1 → 2-11
  readers/grid.ts       2-1 → 2-12
  readers/browser.ts    2-1 → 2-13
  actions/file.ts       2-1         the rows undo, redo, save, put-down
  actions/camera.ts     2-1 → 2-14  the rows of the camera's keys
  actions/code.ts       2-1 → 2-8
  actions/browser.ts    2-1 → 2-13
  actions/connect.ts    2-1 → 2-2
  actions/labels.ts     2-1 → 2-3
  actions/remove.ts     2-1 → 2-4
  actions/views.ts      2-1 → 2-4
  actions/reparent.ts   2-1 → 2-5
  actions/notes.ts      2-1 → 2-7
  actions/text.ts       2-1 → 2-9
  actions/sequence.ts   2-1 → 2-10
  actions/geometry.ts   2-1 → 2-11
  labels.ts             2-1 → 2-3
  notes.ts              2-1 → 2-7   the scaffold's skeleton already carries a file's notes through, unchanged
  codeLinks.ts          2-1 → 2-8   the scaffold builds codeRowsOf, which the adapter calls
  text.ts               2-1 → 2-9
  checks.ts             2-1 → 2-6   the scaffold adds Entry and entriesOf() as a skeleton
shell/
  App.tsx, Dock.tsx, dockContext.ts, TopBar.tsx, Toasts.tsx, theme.ts     2-1
  ActionControl.tsx     2-1         ActionButton, ActionItem: every control that asks an action
panels/
  Details.tsx, fieldHooks.ts, Tools.tsx     2-1
  sections.ts           2-1         the list of Details' sections
  ViewSection.tsx       2-1 → 2-4
  ShownSection.tsx      2-1 → 2-4
  CodeSection.tsx       2-1 → 2-8
  hooks/sequence.ts     2-1 → 2-10
  hooks/geometry.ts     2-1 → 2-11
  Notes.tsx             2-1 → 2-7
  Validation.tsx        2-6
  Explorer.tsx, explorerRows.ts     2-13
plane/
  Plane.tsx, Palette.tsx, NotDrawnYet.tsx     2-1
  nodes/BoxNode.tsx, PortNode.tsx, SmallNode.tsx, edges/LineEdge.tsx, edges/markers.tsx     2-1
  nodes/Grips.tsx       2-1         the grips a line is drawn from
  ZoomReadout.tsx       2-1 → 2-14
  viewStore.ts          2-1, then 2-5
  gestures/connect.ts   2-1 → 2-2
  gestures/ConnectLayer.tsx   2-1 → 2-2   the line that follows the pointer
  ConnectMenu.tsx       2-1 → 2-2
  LabelEditor.tsx       2-1 → 2-3
  marks/Badge.tsx       2-1 → 2-6
  marks/Pin.tsx         2-1 → 2-7
  gestures/pin.ts       2-1 → 2-7
  nodes/sequence/*      2-1 → 2-10  index.ts (the types the registry takes), LifelineNode.tsx, MessageEdge.tsx
  nodes/geometry/*      2-1 → 2-11  index.ts, FootprintNode.tsx, AxesNode.tsx
views/
  bodies.ts             2-1         the registry of contract 6
  bodyContext.ts        2-1         what a body gives to what is drawn inside it
  ViewHost.tsx          2-1         a view's tab: the body its kind names, or the card
  BodyFrame.tsx         2-1         what every component body is drawn inside: its root, its clicks, its palette
  TextTab.tsx           2-1 → 2-9
  GridBody.tsx          2-1 → 2-12
  BrowserBody.tsx       2-1 → 2-13
canvas/app/test/
  helpers.mjs, core.mjs, shots.mjs    2-1         shots.mjs names all nine new screenshots
  shots/<name>.mjs                    2-1 → the package that takes the screenshot
  fixtures.test.mjs, capabilities.test.mjs, refusals.test.mjs, camera.test.mjs, scale.test.mjs, instant.test.mjs     2-1 → 2-14
  retired.test.mjs                    2-1 → 2-15
  connect.test.mjs, reconnect.test.mjs     2-1 → 2-2   (criteria 4 and 5, written first by the scaffold)
  every other *.test.mjs that slice 1 wrote     the lead's (contract 27)
  a package's own tests               that package's, in new files named in its brief
```

These files are not named in `plan/architecture.md`. The plan adds each for a reason:

| File | Why it exists |
|---|---|
| `core/says.ts` | The toasts show what a tool says today. An action and a gesture must say why they were refused too (contract 4, first rule; criterion 6), and they have no tool. One service holds the last sentence said for a session, and the toasts read it. |
| `core/hands.ts` | An action is a function of the core, and some actions end in something only the shell can do: save a file, open the text tab, zoom a plane, copy to the clipboard. The shell hands these in once, and the actions call them. So no action imports React, and the core's tests give stand-ins. |
| `core/actions/file.ts` | The rows of Undo, Redo, Save and Escape, whose keys move out of `TopBar.tsx` and `Tools.tsx` (architecture, "What the scaffold fixes"). |
| `core/actions/camera.ts` | The old page zooms and fits by the keys `+`, `-` and `0`. No package of the architecture owns that. Package 2-14 builds the three rows; the scaffold gives the hand they call. |
| `shell/ActionControl.tsx` | Criterion 6 asks that a refused menu entry is greyed and carries its sentence. One component does that for every button and menu entry that asks an action, so no package writes it again and one test can check them all. |
| `panels/sections.ts` | The list of Details' sections (contract 11), apart from `Details.tsx`, so that a section's file imports nothing from the panel. |
| `plane/nodes/Grips.tsx` | The grips of a node are drawn by all three node components. |
| `plane/gestures/ConnectLayer.tsx` | The line that follows the pointer while a line is drawn is a component inside the plane's viewport, and `connect.ts` holds no React. |
| `views/bodyContext.ts`, `views/ViewHost.tsx`, `views/BodyFrame.tsx` | A pin and the connect gesture must turn a point of the window into a point of the view and find what lies under it, in any body. The body gives both through one context. `ViewHost` is the one place that picks a view's body, so the dock does not know the kinds. `BodyFrame` turns a component body's clicks into `Hit`s and opens its palette, as the plane does for itself. |
| `canvas/app/test/capabilities.test.mjs`, `refusals.test.mjs` | Criteria 3 and 6 as tests. |

### Who calls whom

A change still goes one way (rule 1). Slice 2 adds actions between the hand and `edit()`, and marks and notes beside the history.

```
 a key ──► App's one keydown listener ──► keys.pressed() ─┐
 a button, a menu entry (ActionControl) ──────────────────┼──► commands.ask(session, id, at, choice)
 the right-click palette ─────────────────────────────────┘        │ applies()? no ──► saysOf.say(sentence) ──► Toasts
                                                                    ▼ yes
 a gesture's end (connect, pin, reparent, a kind's drag) ──► a function of core/actions/* ──► history.edit() or notesOf()
                                                                    │
            ┌───────────────────────────────────────────────────────┘
            ▼
 history tells ──► the views' stores ──► readerOf(renderer).read() ──► marks put on ──► the body draws
              ├──► explorerRows, selection, tools, checks (after a pause) ──► marksOf ──► the stores
              └──► session.listen (unsaved)
 notesOf tells ──► marksOf ──► the stores;  the Notes panel;  session.listen (unsaved)
```

Nothing goes the other way: no body writes the model, and no reader reads the selection, the checks or the notes.

### Who owns each piece of state

| State | Owner | Kept where | Who may change it |
|---|---|---|---|
| The model, the undo steps, the log | `core/history.ts` | The session | Only a change given to `edit()` |
| The notes and the archive | `core/notes.ts`, `notesOf(session)` | Outside the history | The functions of `notesOf`, called by the note actions, by the panel's text box (`setText`) and by a pin's drop (`dropPin` of `core/actions/notes.ts`) |
| What is picked, the view in front | `core/selection.ts` | The session | Bodies, panels, `ask()` (it picks what an action made) |
| The tool in hand, its first end | `core/commands.ts`, `toolsOf` | The session | The Tools view, a plane's click, the palette, `put-down` |
| What was said last | `core/says.ts`, `saysOf` | The session | `ask()`, a gesture's end, an action's `run` |
| The gestures that Escape can call off | `core/commands.ts`, `gesturesOf` | The session | A gesture adds itself at its start and takes itself out at its end |
| The label being edited | `core/labels.ts`, `labelEditOf` | The session | The `edit-label` and `type-label` actions, the editor |
| Problems, as lists and as entries | `core/checks.ts`, `checksOf` | The session | The checks themselves, after a pause |
| The marks | `core/marks.ts`, `marksOf` | The session; worked out from the checks and the notes | Nobody: it is derived |
| A view's projection, camera, gesture in progress | `plane/viewStore.ts` | The session, by view id | The store |
| A component body's scroll place, sort and fold | That body's own store, outside React (contract 6, duty 5) | The session, by view id | The body. What is saved (a grid's `sort`, a browser's `collapsed`) is the view's option, written through `setViewOption` |
| A line being drawn or moved by an end | `plane/gestures/connect.ts`, `connectOf(store)` | The view's store | The gesture |
| The tabs, the panels' sizes | `shell/Dock.tsx` | Dockview; `localStorage` for the sizes | The dock |
| Whether the file has unsaved changes | `core/session.ts` | The session: the history's mark and the notes' mark against those of the last save | `saved()` |

## 4. The seams of the scaffold, and what crosses each

Each seam names its file, what goes in, what comes out, who calls it and who fills it. A signature below is the contract. The skeleton carries it as a comment, and a package that finds one wrong stops and says so.

### Seam 1. Readers: `core/readers/index.ts`

```ts
interface Listed { type: 'el' | 'rel'; id: string; words: string; rect: { x: number; y: number; w: number; h: number } | null }
interface ReadOptions {
  far?: boolean;                                   // a graph body below 25% zoom
  previous?: unknown;                              // the data before this one, of the same view: what reads the same stays the same object
  places?: ReadonlyMap<string, Place> | null;      // a gesture's places, for the graph kinds
}
interface Reader<Data> {                           // contract 5
  read(lib: SysMLModelLibrary, model: Model, view: ModelView, options?: ReadOptions): Data;
  sizeOf(data: Data): { width: number; height: number };
  listed(data: Data): Listed[];
  at?(data: Data, point: { x: number; y: number }): unknown;
  step?(data: Data, asks: readonly Ask[]): Data;
}
function rendererOf(lib: SysMLModelLibrary, viewKind: string): string | null;   // VIEW_KINDS[kind].renderer
function readerOf(renderer: string): Reader<unknown> | null;                     // null: its package has not built it yet
function hasReader(lib: SysMLModelLibrary, viewKind: string): boolean;           // whether views of this kind are drawn by a body
function readView(session: Session, viewId: string, options?: ReadOptions): { renderer: string; data: unknown } | null;   // the view of that id, read by its kind's reader; null for no such view or no reader
```

- **In:** a model and one of its views. **Out:** what the view's body draws. A reader is pure and does not wait. It never reads the checks, the notes or the selection (contract 7): what those say is added by the view's store or by the body. A component body calls `readView`, so that it reads no record of the model itself.
- **Who fills it:** each of `readers/sequence.ts`, `geometry.ts`, `grid.ts` and `browser.ts` exports its reader as a constant that is `null` in the skeleton: `export const sequenceReader: Reader<SequenceData> | null = null;`. Its package replaces `null` with the reader. `readers/graph.ts` is built by the scaffold: `read` is the adapter's `project`, `sizeOf` is the projection's bounds, and `listed` gives one entry for each node (its keyword and name as `words`, its rectangle from the view's origin) and one for each edge (its label, `rect` null).
- **Who calls it:** the view's store and each component body (`read`, `step`); `core/commands.ts`, the dock and the Tools view (`hasReader`); `fixtures.test.mjs` (`listed`, to know what each view must show); in slice 3, the workspace scripts.
- **What `hasReader` replaces.** Today `isDrawn(lib, kind)` of the adapter answers "does a plane draw it", and the commands, the Tools view and the store's card all ask it. From the scaffold on, they ask `hasReader`. `isDrawn` stays in the adapter with its old meaning, "the adapter's own `project` reads it", which only `readers/graph.ts` and the adapter use.
- **Placing in a view of another renderer.** `place()` of `core/commands.ts` knows the graph kinds' rule only. For another renderer it calls `placerOf(renderer)`, which is a function of that kind's file in `core/actions/`:

  ```ts
  type Placer = (session: Session, kind: string, hit: Hit) => Outcome;   // one edit(), as place() is
  function placerOf(renderer: string): Placer | null;
  ```

  `core/actions/sequence.ts` and `geometry.ts` each export `place` as `null` in the skeleton. A grid and a browser view have no tools, so they have no placer.

### Seam 2. Bodies: `views/bodies.ts`, `views/ViewHost.tsx`, `views/bodyContext.ts`

```ts
interface BodyProps { session: Session; viewId: string }                   // contract 6: nothing else
interface OptionRow {                                                      // one option of a view kind, as the view's section of Details draws it
  name: string;                                                            // the key in view.options: 'spacing', 'scale', 'unit', 'mode', 'columns', 'sort', 'roots'
  label: string;                                                           // 'Row spacing'
  type: 'number' | 'enum' | 'set';                                         // a number field, radio buttons, ticked boxes
  values?(session: Session, viewId: string): { value: string; label: string }[];   // an enum's or a set's choices
  range?: [number, number];                                                // a number's least and most
  locked?(session: Session, viewId: string): string | null;                // why it cannot be changed now, or null
}
interface BodyEntry {
  renderer: string;                                                        // 'graph', 'sequence', 'geometry', 'grid', 'browser'
  reader(): Reader<unknown> | null;                                        // readerOf(renderer)
  options: readonly OptionRow[];
  body: 'graph' | ((props: BodyProps) => JSX.Element) | null;             // 'graph': the plane draws it; a component; null while not built
  nodeTypes?: NodeTypes | null;                                            // for a graph body: the node components it adds, by type; null while not built
  edgeTypes?: EdgeTypes | null;                                            // and the edge components
  flow?: { elevateNodesOnSelect?: boolean };                               // the props of React Flow it sets for its planes (seam 3)
}
const BODIES: readonly BodyEntry[];
function bodyOf(lib: SysMLModelLibrary, viewKind: string): BodyEntry | null;
```

- **`ViewHost`** is what the dock puts into a view's tab. It reads the view's kind, and follows it when it changes or the view leaves the model. With an entry whose `body` is `'graph'` it renders `Plane`. With a component it renders that component. With no entry, or `body` null, or no reader yet, it renders the card, inside the same root as today (`data-testid="plane"`, `data-view`), so slice 1's tests of the card hold until the kind's body lands.
- **`Plane` takes its node and edge types from the registry**: the 13 shapes and the line that slice 1 built, and whatever the entries with `body: 'graph'` add. A new shape needs no change to `Plane.tsx` or to the adapter.
- **A component body is drawn inside `BodyFrame`** (`views/BodyFrame.tsx`, the scaffold's), which does for it what `Plane.tsx` does for a plane, so that no component body writes it again:

  ```ts
  interface BodyFrameProps {
    session: Session; viewId: string; renderer: string;
    toView(client: { x: number; y: number }): { x: number; y: number };   // a point of the window, in the view's own units
    reveal?(rect: { x: number; y: number; w: number; h: number }): void;  // brings a place of the view into the window: a scroll
    onShown?(): void;                                                     // the root has a size again after having none: a tab shown again
    children: ReactNode;
  }
  ```

  Its root carries `data-testid="body"`, `data-view` and `data-renderer`, and fills the tab. A click inside it becomes a `Hit` (the first element under the pointer that is inside something with `data-thing`, else the ground; `at` from `toView`) and is offered to the tool in hand first and then to the selection: `if (!toolsOf(session).click(hit)) selectionOf(session).click(hit)`, as on a plane. A right-click opens the palette with that `Hit`; the frame mounts the one `Palette` and stops the browser's own menu. It provides `BodyContext`, and gives `reveal` to the shell's hand.
- **Each thing a component body draws** for an element or a relationship carries `data-thing="<type>:<id>"` on the element that takes its click. A test finds what any body shows through one helper, `thingsIn(page, viewId)`, which reads React Flow's nodes and edges for a plane and `data-thing` for a component body.
- **`BodyContext`** is what a body gives to what is drawn inside it, so that a pin, the connect line and the label editor work in every body:

  ```ts
  interface BodyHands {
    session: Session; viewId: string;
    toView(client: { x: number; y: number }): { x: number; y: number };    // a point of the window, in the view's own units
    hitAt(client: { x: number; y: number }): Hit;                          // what lies there: the ground, an element or a relationship
    zoom(): number;                                                        // 1 for a body with no camera
    menu(hit: Hit, client: { x: number; y: number }): void;               // opens the right-click palette there
    inside(client: { x: number; y: number }): boolean;                     // whether a point of the window lies over this body
    mark(hit: Hit | null, fits: boolean): void;                            // outlines the thing a gesture is over, teal when it fits and grey when not; null takes the outline away
    swallow(): void;                                                       // the next click on this body is no click: a gesture's release
  }
  const BodyContext: React.Context<BodyHands | null>;
  function useBody(): BodyHands;
  ```

  `Plane` provides it from React Flow (`screenToFlowPosition`; `hitAt` by `document.elementsFromPoint`, the first that is a node or an edge). `BodyFrame` provides it for a component body. `hitAt` looks only at what is inside this body's root, so a node of a view beside it is never the answer, and it passes over whatever carries `data-pass` or is inside something that does: the pins, the badges, the grips and the line in hand. So a pin that is dragged does not hide what is under it. A node component never reads it: a context read in 5,000 nodes is a cost, and a node needs none of it.
- **Who fills it:** the scaffold writes the registry with all five entries. The `options` rows are the scaffold's too (seam 9 lists them), since the model library's rows fix them. Packages 2-10 to 2-13 fill their body files: `plane/nodes/sequence/index.ts` and `plane/nodes/geometry/index.ts` each export `nodeTypes` and `edgeTypes` as `null` in the skeleton, and `views/GridBody.tsx` and `views/BrowserBody.tsx` each export their body as `null`. An entry counts as built when its reader and its body, or its node types, are both there.

### Seam 3. A graph body of another renderer: the view's store and the plane

The probes give the sequence view and the geometry view graph bodies (section 2). Their nodes are not placed by the adapter's rule, so the store asks the kind's reader and the kind's action instead. This is the whole of the seam, and no package but 2-5 changes `viewStore.ts`:

| The store needs | For `graph` | For another renderer with a graph body |
|---|---|---|
| The projection | `project(lib, model, view, { far, previous })` | `readerOf(renderer).read(lib, model, view, { far, previous })`, which gives a `Projection` |
| A step of a drag | `placesFor` and `projectStep`, as today | `reader.step(start, asks)`, which gives the `Projection` of that step. The reader holds a node to what its kind allows: a lifeline's head to its row, an event to its lifeline, a footprint to its rounding. |
| Which nodes a drag moves | Every node React Flow reports, as today | Only the node the press named (`onNodeDragStart`), since React Flow drags every selected node |
| The gesture's end | The places, written by the store in one `edit()`, as today | `enderOf(renderer)(session, viewId, start, asks)`, a function of `core/actions/<renderer>.ts`, which writes through `edit()` and answers with what it touched, or with a sentence |
| What a marquee picks | The nodes whose rectangle it covers and the edges between them, as today | The things whose rectangle, as the reader's `listed` gives it, lies inside it |

```ts
type Ender = (session: Session, viewId: string, start: Projection, asks: readonly Ask[]) => Touched | { refused: string } | null;
function enderOf(renderer: string): Ender | null;      // core/readers/index.ts
// plane/viewStore.ts gains:
//   dragStarted(nodeId: string): void          React Flow's onNodeDragStart
//   preview(next: Projection | null): void     draws a step that is no node's drag, and writes nothing; null puts the model's projection back
//   zoom: number;  watchZoom(listener): () => void
```

- **A refusal** is said (`saysOf`), and the store shows the model's own projection again, as it does today after a gesture that wrote nothing.
- **A projection of another renderer** carries no `read`, and never goes through `projectStep`. `Ask`, `Projection`, `PlaneNode` and `PlaneEdge` keep their form.
- **A node that is no element.** `NodeData.element` is the element's id, or null for a node that stands for none (a geometry view's axes). Two nodes can name one element (a lifeline's head and its line). A click on a node with no element is a click on the ground. The store sets marks and `selected` by `data.element`, and the marquee leaves a node with no element out.
- **A gesture that React Flow does not report as a node's drag** (a message moved by its line) is the kind's own. Its edge component hears its own `pointerdown`, follows the pointer on the window, works each step out with a function of its reader, hands it to the store's `preview`, and ends by calling the kind's action. It adds itself to `gesturesOf(session)`, so Escape calls it off.
- **An entry's plane props.** `BodyEntry.flow` holds the React Flow props an entry sets for its planes, from a short list the scaffold allows: `elevateNodesOnSelect`. `Plane.tsx` spreads it. No other prop of the plane can be changed by a package.
- **Node and edge types of another renderer** draw their own selected look. The page's outline rule is written for the 13 shapes of slice 1, by their class, and does not reach them.

### Seam 4. Marks: `core/marks.ts`

```ts
interface Pinned { readonly id: string; readonly no: number; readonly resolved: boolean; readonly hot: boolean }   // one note: its id, its number, and whether the panel points at it
interface Marks { readonly problems: number; readonly pins: readonly Pinned[] }                                 // on one element or relationship; pins by number
interface FreePin extends Pinned { readonly x: number; readonly y: number }                                     // a free note, at its place in its view
const NO_MARKS: Marks;                                   // the one object every unmarked thing carries
interface MarksOf {
  of(type: 'el' | 'rel', id: string): Marks;             // the same object until that thing's marks change
  free(viewId: string): readonly FreePin[];              // the free notes that float on a view; the same array until they change
  listen(listener: () => void): () => void;
}
function marksOf(session: Session): MarksOf;
```

- **In:** the entries of the checks (`entriesOf`, contract 8) and the open notes (`notesOf`: `open` and `pointed`). **Out:** for each element and relationship, how many problems it has and the notes pinned to it; for each view, its free notes. A pin carries its note's id, because a number is no key: a file can hold two notes of one number.
- **How it reaches a node.** `NodeData` and `EdgeData` gain one field, `marks: Marks`. The adapter never reads or sets it: it gives every new node `NO_MARKS` and carries the field over from the node before, as it carries `selected`. The view's store sets it after each projection and after each change of the marks, as it sets `selected`: a new object only for a node or an edge whose marks differ.
- **Where a mark is drawn.** Each node component renders `<Badge marks={data.marks} of="el:<id>" />` and `<Pins marks={data.marks} of="el:<id>" />` in one element, `.grasp-marks`: a row that lies across the node's top edge at its right end, its middle on the edge, the pins by number and the badge last. On a border item it stands beside the square, on the side away from the name, and on a small node above it. `LineEdge` renders the same pair at the line's middle, through React Flow's `EdgeLabelRenderer`, and only for a line that has a mark. `Plane` renders `<FreePins session viewId />` inside the viewport. `Badge({ marks, of })` (2-6), `Pins({ marks, of })` and `FreePins({ session, viewId })` (2-7) render nothing in the skeleton. A badge and a pin exist only on a marked thing, so they may read `useBody()`, which a node component may not. `.grasp-marks` is scaled by the inverse of the plane's zoom (`--grasp-zoom` on the plane's root, which the scaffold sets when the zoom changes and never on a pan), so a mark keeps its size on the screen; far, no mark is drawn. Everything inside `.grasp-marks` carries `nodrag nopan`. `FreePins` draws each free pin at its `x` and `y` from the top left corner of its offset parent, so a component body puts it inside the element whose top left corner is the view's origin, and the pins scroll with what they float on.
- **Live or idle.** `marksOf` listens to the checks and the notes only while a store listens to it. So the checks run while a body is shown (contract 8), and a hidden tab costs nothing.
- **Who calls it:** the views' stores; each component body, for its rows, which it draws again when `marksOf(session).listen` tells.

### Seam 5. Who a node is, and a code compartment's rows: `core/adapter.ts`, `core/codeLinks.ts`

```ts
// NodeData gains:  element: string | null;  view: string;  marks: Marks      (null: a node that stands for no element)
// EdgeData gains:  relationship: string;  view: string;  marks: Marks
function elementOf(node: PlaneNode): string | null;
function relationshipOf(edge: PlaneEdge): string;
function codeRowsOf(lib: SysMLModelLibrary, model: Model, element: ModelElement): string[];   // core/codeLinks.ts: each link's words, uncut
```

`Plane.tsx` builds every `Hit` from `elementOf(node)` and `relationshipOf(edge)`, never from a node's id (contract 5). The adapter takes a code compartment's rows from `codeRowsOf` and cuts each to the box's width as it does today. The scaffold builds `codeRowsOf`, because the page shows code compartments already.

### Seam 6. Grips, and where a line's gesture starts: `plane/nodes/Grips.tsx`, `plane/gestures/connect.ts`

Section 2 says why the gesture is Grasp's own and not React Flow's. What crosses the seam:

- **A grip** is an element with `data-grip`, the classes `nodrag nopan nokey` and `data-pass`. With those classes React Flow neither drags the node, nor pans, nor starts a marquee when Shift is held; `data-pass` makes `hitAt` look past it. On a node the grip is one of `top`, `right`, `bottom`, `left`: four on a box, each 14 px outside the middle of a side, clear of a port that sits there; one on a border item or a small node, on its outer side. `Grips.tsx` gives `NodeGrips({ far })` for the node components. On a selected, near line the grip is `from` or `to`, at each drawn end: `Grips.tsx` gives `EndGrips({ points })`, which `LineEdge` renders, and which a line component of another renderer renders too.
- **Grips are mounted** only on a near node, and only once package 2-2 has built the gesture: `connect.ts` exports `connectOf` as `null` in the skeleton, and `Grips.tsx` renders nothing while it is null. They are shown by CSS (`plane/nodes/grips.css`, the scaffold's) when the pointer is over the node, when the node is selected, and on every near node while a line is in hand. The same stylesheet outlines the node or the line under the pointer. All of it is written under two attributes of the plane's root, which `Plane.tsx` sets: `data-grips` while `connectOf` is not null and the view kind's `tools` row holds a relationship kind, and `data-connecting` while the gesture's `state` is not null.
- **A press on a grip.** `Plane.tsx` hears `pointerdown` on its root, in the capture phase, and hands a press of the main button on a grip to the gesture:

  ```ts
  interface GripPress {
    grip: 'top' | 'right' | 'bottom' | 'left' | 'from' | 'to';
    element: string | null;                       // for a node's grip: the node's element (elementOf)
    relationship: string | null;                  // for a line's grip: the line's relationship
    ends: { from: Point; to: Point } | null;      // for a line's grip: its two drawn ends, in the view's units
    target: Element;                              // the grip itself: the gesture captures the pointer on it, and reads where it is
    client: Point; pointerId: number;
  }
  interface ConnectState {
    kind: 'draw' | 'move';                        // a new line, or an end of a line that exists
    from: string;                                 // the element the line in hand starts at; for a move, the end that stays
    relationship: string | null; end: 'from' | 'to' | null;   // for a move
    start: Point;                                 // where the line in hand starts, in the view's units: the grip's middle, or the drawn end that stays
    at: Point;                                    // the pointer, in the view's units
    over: string | null;                          // the element under the pointer
    fits: boolean;                                // whether something fits there
  }
  interface ConnectChoice { from: string; to: string; kinds: readonly Tool[]; left: number; top: number }   // left, top: the window's px
  interface ConnectGesture {
    readonly state: ConnectState | null;          // the line in hand; it stays while the menu is open
    readonly menu: ConnectChoice | null;
    press(press: GripPress, body: BodyHands): void;   // from here on the gesture follows the pointer itself, on the window, until its release
    choose(kind: string): void;
    closeMenu(): void;
    cancel(): void;                               // Escape, through gesturesOf(session); a change of the model heard in the middle
    listen(listener: () => void): () => void;
  }
  const connectOf: ((store: ViewStore) => ConnectGesture) | null;
  ```

- **The click that follows the release is no click.** A gesture calls `body.swallow()`, and `Plane.tsx` drops the next click, by the flag that already drops the click ending a marquee. So a line let go on the ground places nothing with a tool in hand, and the node the grip is on is not picked.
- **What the gesture calls** is `core/actions/connect.ts` (section 5, flows 1 and 2). `Plane.tsx` renders `<ConnectLayer session viewId />` as a child of React Flow, where the layer draws through React Flow's `ViewportPortal`, in the view's units, and `<ConnectMenu session viewId />` beside the palette. Both render nothing in the skeleton.

### Seam 7. Label anchors, and the editor: `core/labels.ts`, `plane/LabelEditor.tsx`

- **An anchor** is whatever element shows a label that can be edited. It carries `data-label="<type>:<id>"`: a box's name line, a border item's name, a small node's name, a line's label. A row of a browser view carries one on its name. A grid's cells carry none: they are not labels. The scaffold puts the anchors on the three node components and on `LineEdge`.
- **The editor is one component for the page**, `<LabelEditor session />`, rendered by `App.tsx`. It reads `labelEditOf(session)`, finds the anchor inside the root of the view in front (`[data-view="<id>"] [data-label="<type>:<id>"]`), and lays a text box over it. For a thing with no anchor in the document (a line that has no label yet, a node drawn far), it lays the box over the middle of the thing itself. It renders nothing in the skeleton.

  ```ts
  interface LabelEdit {
    readonly editing: { picked: Picked; view: string; typed: string | null } | null;   // typed: the character that opened it, or null for F2
    open(picked: Picked, view: string, typed?: string): true | string;                 // or the sentence that says why this label cannot be edited
    keep(text: string): Outcome | null;       // makes what the text says, one edit(); null when the text changes nothing
    close(): void;
    listen(listener: () => void): () => void;
  }
  function labelEditOf(session: Session): LabelEdit;
  function rename(session: Session, picked: Picked, name: string): Outcome;            // for a row of a tree (2-13 calls it)
  ```

### Seam 8. Actions, keys, sayings and hands: `core/commands.ts`, `core/keys.ts`, `core/says.ts`, `core/hands.ts`, `shell/ActionControl.tsx`

```ts
interface Action { id; title; key?; choices?(session, at); applies(session, at): true | string; run(session, at, choice?): Outcome | void }   // contract 4
function actions(): readonly Action[];            // the table, put together when first asked for
function actionOf(id: string): Action | null;
function ask(session: Session, id: string, at?: Hit | null, choice?: string): Outcome | void;
function editable(session: Session, picked: Picked): true | string;      // true for everything a session holds, until slice 5
function drawProblem(session: Session, kind: string, fromId: string, toId: string, but?: string): string | null;   // why draw() would refuse, by its four checks in their order, or null; `but`: a relationship the "already drawn" check leaves out
function freshElement(session: Session, kind: string, name: string, ownerId: string | null): ModelElement;       // a new element as place() makes one, not yet in the model
function freshRelationship(session: Session, kind: string, fromId: string, toId: string): ModelRelationship;
function gesturesOf(session: Session): { add(cancel: () => void): () => void; open: number; cancelAll(): void };
```

- **The table is put together from each package's rows.** Each file of `core/actions/` exports its rows as an array, empty in the skeleton, with the ids, titles and keys of section 5 written as its comment. `actions()` joins the arrays the first time it is called, so the order in which the modules load does not matter. A row that is not built is not in the table, so its key does nothing yet, as before the scaffold.
- **`ask` is the one way an action is asked**, from a key, a control or the palette. It calls `applies`. A sentence is said (`saysOf(session).say`) and returned as `{ refused }`. Otherwise it calls `run`; a refusal that `run` returns is said the same way; what `run` made is picked (`selectionOf(session).set([made])`).
- **`core/keys.ts` has no DOM in it**, as the core has none (rule 3):

  ```ts
  interface KeyPress { key: string; ctrl: boolean; meta: boolean; shift: boolean; alt: boolean; repeat: boolean }
  interface KeyPlace { typing: boolean; historyKeys: boolean; modal: boolean }    // the target takes typing; it is inside [data-history-keys]; a modal dialog is up
  function keyOf(press: KeyPress): string | null;            // 'Mod+Z', 'Delete', 'F2', 'printable', or null for a key that is no shortcut
  function pressed(session: Session | null, press: KeyPress, place: KeyPlace): boolean;   // whether the key was taken: the caller then prevents the browser's default
  const ALIASES: Readonly<Record<string, string>>;           // 'Mod+Shift+Z' reads as 'Mod+Y'; 'Backspace' as 'Delete'
  ```

  `App.tsx` adds the page's one `keydown` listener to the window, describes the event and where it came from, and calls `pressed`. `TopBar.tsx` and `Tools.tsx` lose their listeners. The rules those two hold today move into `pressed` unchanged: Undo and Redo do not act from a text field unless it is inside `[data-history-keys]`; Save acts from anywhere and its default is always prevented; nothing acts behind a modal dialog; Save does not repeat. An exact key is looked up before `printable`, so `+`, `=`, `-` and `0` are the camera's and never start a label.
- **`saysOf(session)`**: `{ said: Saying | null; say(text: string): void; clear(): void; listen }`. `Toasts.tsx` shows whichever was said last, by a tool (`toolsOf(session).said`, as today) or through `saysOf`.
- **`handsOf(session)`** holds what the shell lends: `{ hands: ShellHands | null; give(hands: ShellHands | null): void }`.

  ```ts
  interface ShellHands {
    save(): void;                                  // App's onSave
    showText(): void;                              // the dock's: opens the text tab, or brings it to the front
    showView(viewId: string): void;                // the dock's showView
    showPanel(id: string): void;                   // opens a side panel: 'notes', 'details'
    camera(viewId: string, how: 'in' | 'out' | 'fit' | 'left' | 'right' | 'up' | 'down'): void;   // the plane's: zooms by a step about its middle, fits, or moves by a step
    reveal(viewId: string, rect: { x: number; y: number; w: number; h: number }): void;   // brings a place of a view into its window
    copy(text: string): Promise<void>;             // the clipboard
  }
  ```

- **`ActionControl.tsx`** gives `ActionButton` (an icon button or a text button) and `ActionItem` (a menu entry):

  ```ts
  interface ActionControlProps {
    session: Session; action: string;            // the action's id
    at?: Hit | null; choice?: string;
    icon?: ReactElement;                         // an icon button; its accessible name is the action's title
    label?: string;                              // the words shown, when they are not the action's title: a note's number
    className?: string; testId?: string;
  }
  ```

  Each carries `data-action="<id>"`, asks `applies(session, at)` when it renders and again when the session, the selection or the notes tell, and is greyed with the sentence as its tooltip and its `aria-description` when the action does not apply there. A click calls `ask`. An action with `choices` and no `choice` given opens the choices as a menu. Every package uses these two for every control that asks an action, and writes no button of its own for one. `applies` takes no `choice` (contract 4), so a control for one thing among several (Archive on one note) is shown only on the things it applies to, and `run` still checks the one it was given.
- **The palette** lists, under the creation tools and a rule, an `ActionItem` for each action of `PALETTE` that is in the table and applies at its `Hit`. `PALETTE` is a list of ids in `core/commands.ts`, in the menu's order: `edit-label`, `add-note`, `show-in-view`, `remove-from-view`, `message-up`, `message-down`, `delete`. So the menu holds what is about the thing that was clicked, and not Undo or Save, which apply everywhere. An action with `choices` opens them as a second level.

### Seam 9. Details: `panels/sections.ts`, `panels/hooks/*`, the option rows

```ts
interface SectionProps { session: Session; picked: Picked }
interface Section { id: string; applies(session: Session, picked: Picked): boolean; Component(props: SectionProps): JSX.Element | null }
const SECTIONS: readonly Section[];              // where it is shown (2-4), the view's section (2-4), then the code links (2-8)
```

`Details.tsx` renders, under the form, each section that applies to what was picked last. A skeleton's `applies` answers false. `fieldHooks.ts` joins the hooks of `panels/hooks/sequence.ts` and `panels/hooks/geometry.ts` to its own. The scaffold moves today's locked `order` hook into `hooks/sequence.ts` as it is; package 2-10 replaces it. A view's options are drawn by the view's section from the `OptionRow`s of seam 2, and written by one function of `core/actions/views.ts`:

```ts
function setViewOption(session: Session, viewId: string, name: string, value: unknown, key?: string | null): Touched | { refused: string } | null;
```

| View kind | Option rows (name, type, values) |
|---|---|
| Sequence | `spacing`: number, 24 to 400 |
| Geometry | `scale`: number, above 0 (pixels for one unit); `unit`: enum, the library's `GEO_UNITS` |
| Grid | `mode`: enum, `table` or `matrix`; `columns`: set, the library's `GRID_COLUMNS`, locked in a matrix; `sort`: enum, none or a column, each way |
| Browser | `roots`: set, the whole package or the elements at its top |

### Seam 10. The dock: `shell/Dock.tsx`, `shell/dockContext.ts`

- **A Notes panel** on the left strip, after Validation (section 2 says why there): `LEFT_PANELS` gains `'notes'`, and `COMPONENTS` gains `notes: NotesPanel` (2-7; the skeleton shows the empty state every panel had in slice 1).
- **A tab that is not a view.** `useDock().showText()` opens the text tab, panel id `text`, component `TextTab` (2-9), titled `<package name>.sysml`, or brings it to the front. `DockState` gains `showText`. The dock gives its hands to `handsOf(session)`.
- **The tabs follow the model's views.** When the history tells of a change of the structure, a view that is new gets its tab, in front, and the tab of a view that left the model goes. The dock and the Tools view read the views through `viewsOf(session)`: `{ id, name, kind }[]`, the same array until a view comes, goes or is renamed (contract 22).
- **A view's tab holds `ViewHost`** (seam 2).
- **A New view button** stands at the end of the editor's tab bar: an `ActionButton` for `new-view`, which opens the eight kinds as a menu. It shows once package 2-4 has built the row.

### Seam 11. The notes in a session and in a state file: `core/session.ts`, `core/files.ts`, `core/notes.ts`

```ts
type NotePlace = Picked | { view: string; x: number; y: number };        // on an element or a relationship, or free on a view
interface Notes {
  readonly open: readonly Note[];                // the notes that are not archived, by number; the same array until a note changes
  readonly archive: readonly Note[];
  add(on: NotePlace): Note;                      // a new note, with the next number and no text
  setText(id: string, text: string): void;       // nothing for a note Claude wrote, or an id that names none
  moveTo(id: string, on: NotePlace): void;       // nothing when the note is there already
  remove(id: string): void;
  archiveNote(id: string): void;                 // nothing for a note that is not resolved
  restore(id: string): void;
  readonly attended: string | null;              // the note the panel is asked to open on: a new note, or the note of a clicked pin
  attend(id: string | null): void;               // the panel puts the caret there and calls attend(null)
  readonly pointed: string | null;               // the note under the pointer in the panel, or holding the caret: its pins are marked
  point(id: string | null): void;
  mark(): number;                                // names the state the notes are in, as history.mark() does; attend and point do not change it
  file(): { notes: unknown[]; archive: unknown[] };   // as a grasp/2 state file keeps them
  listen(listener: () => void): () => void;
}
function notesOf(session: Session): Notes;
```

- **In the scaffold**, `notesOf` already exists and carries the file's notes through: `open` and `archive` are the file's lists as they are, `file()` gives them back, `mark()` never changes, `attended` and `pointed` are null, and every function that changes a note throws `"notesOf.add: package 2-7 builds it"`. So the ten files save as they do today. `core/session.ts` keeps the lists the file had and hands them to `notesOf` through `fileNotesOf(session)`.
- **`notesOf` refuses nothing.** Whether a thing can carry a note needs the element's kind, which `core/notes.ts` may not read (contract 22). `core/actions/notes.ts` asks first (`canCarry(session, picked): true | string`) and calls `notesOf` after.
- **`session.unsaved`** is true when `history.mark()` or `notesOf(session).mark()` differs from the mark of the last save. `session.saved(mark?, notesMark?)` takes both. `session.listen` also tells after a change of the notes. `session.notes` and `session.archive` stay, as what `file()` gives.
- **`stateFile(session)`** writes `notes` and `archive` from `notesOf(session).file()` (contract 15).

### Seam 12. What the tests share: `canvas/app/test/helpers.mjs`, `core.mjs`

New `data-testid` names, each on what the application renders itself: `body` (a component body's root), `notes` (the Notes panel), `note` (one note in it, with `data-note`), `archive-list`, `pin` (with `data-note`, the note's id), `badge`, `grip` (with `data-grip`), `connect-menu`, `label-editor`, `text-tab`, `text` (the text itself), `text-problems`, `view-section`, `code-section`, `new-view`. Every control of an action is found by `[data-action="<id>"]`.

The toast's element carries `data-said`, a number that grows with each saying, so a test can tell a new toast from the one before it with the same words.

New helpers, each used by more than one test file:

| Helper | What it gives |
|---|---|
| `thingsIn(page, viewId)` | The things a body shows, as a sorted list of `type:id`: React Flow's nodes (by their element) and edges for a plane, `data-thing` for a component body. (`shownIn` is taken: it reads what Details shows.) |
| `thingIn(page, viewId, type, id)` | The locator of one of them |
| `linesIn(page, viewId)` | The lines a plane draws: `[{ id, cls }]`, `cls` being the class the line's kind gives it |
| `gripOf(page, viewId, id, grip)` | The middle of a grip, in the window's px, after moving the pointer over its node or selecting its line so that it shows |
| `dragBetween(page, from, to, { steps = 6, hold })` | A press at `from`, `steps` moves to `to` and a release, with real mouse events; `hold` is awaited before the release |
| `rightClickOn(page, viewId, type, id)`, `chooseAction(page, actionId, choice?)` | Opens the palette on a thing or on the ground (`type` `'ground'`), and clicks the entry of an action |
| `toast(page)` | `{ text, said }` of the toast that is up, or null |
| `pressKey(page, key)` | Presses a key of the table, `Mod` read as Control |
| `saveAndRead(page)` | Saves through the download and gives the saved file's JSON |
| `exportOf(state)` | The text `canvas/export.mjs` prints for a state |
| `withNote(state, target, text)` | A copy of a state file's JSON with one more note on a target, for a test that needs a note before package 2-7 has landed |
| `openNotes(page)`, `noteIn(page, id)`, `pinOf(page, viewId, noteId)` | The Notes panel shown; one note's card; one pin |

`core.mjs` gains `loadWith` entries for the new modules outside the core that run in Node, and `pairsState()`, the generated model that the tests of criterion 4 use beside the ten files (section 8, package 2-2).
## 5. The actions and the gestures: from the hand to `edit()` and back

### The action table

Every row below is one `Action` (contract 4). "File" is where its row and what it does are written, under `core/actions/`. "Says" is the sentence `applies` gives where the action does not apply; a second sentence is one `run` can still give. `<…>` stands for the model library's own words (`describe`, `describeRel`, `describeView`, `an`).

| id | Title | Key | File (package) | Applies | Says, where it does not |
|---|---|---|---|---|---|
| `undo` | Undo | `Mod+Z` | `file.ts` (2-1) | The history has a step | "There is nothing to undo." |
| `redo` | Redo | `Mod+Y` | `file.ts` (2-1) | A step was undone | "There is nothing to redo." |
| `save` | Save | `Mod+S` | `file.ts` (2-1) | Always | |
| `put-down` | Put down | `Escape` | `file.ts` (2-1) | Always. It does the first of three that there is something for: it calls off the gesture in progress; it puts the tool in hand down; it lets go of what is picked | |
| `zoom-in`, `zoom-out`, `fit-view` | Zoom in, Zoom out, Fit the view | `+`, `-`, `0` | `camera.ts` (2-14) | The view in front has a camera (a graph body) | "No view is in front." or "<A grid view> has no zoom: it scrolls." |
| `pan-left`, `pan-right`, `pan-up`, `pan-down` | Move left, right, up, down | the four arrow keys | `camera.ts` (2-14) | The same | The same |
| `delete` | Delete | `Delete` | `remove.ts` (2-4) | At a hit on an element or a line; or, with no hit, when everything picked is an element or a line | "Nothing is picked. Click a box or a line first." or "Delete takes elements and lines out of the model. To delete <the view X>, use Delete view in Details." |
| `remove-from-view` | Remove from view | | `remove.ts` (2-4) | The same, for elements the view in front shows | "Nothing is picked…" or "<part def X> is not shown in <view Y>." or "<View Y> shows every element, so nothing can be taken out of it." |
| `show-in-view` | Show in this view | | `views.ts` (2-4) | The view in front, or the picked view, can show an element it does not show; `choices` lists them | "<View Y> shows every element." or "Everything <a general view> can show is shown in <view Y> already." |
| `show-all`, `show-kind` | Show all, Show every… | | `views.ts` (2-4) | The view is a grid view; `show-kind` has the model's kinds as `choices` | "Show all is for a grid view. In <a general view>, pick what to show from the list." |
| `new-view` | New view | | `views.ts` (2-4) | Always; `choices` are the eight view kinds | |
| `delete-view` | Delete view | | `views.ts` (2-4) | The model holds more than one view | "This is the only view, so it stays. Add another view first to delete this one." |
| `edit-label` | Edit label | `F2` | `labels.ts` (2-3) | The last picked is an element or a line whose label can be edited (`labelEditable`), and the view in front shows it | "Nothing is picked. Click a box or a line to edit its label." or "<A start> has no label to edit." or "<View Y> does not show <part def X>, so its label cannot be edited here." |
| `type-label` | Edit label by typing | `printable` | `labels.ts` (2-3) | The same; the `choice` is the character typed | The same |
| `add-note` | Add note | | `notes.ts` (2-7) | At a hit: on an element or a line that can carry a note, or on the ground (a free note there). With no hit: the last picked is such an element or line | "Pick a box or a line to note it, or right-click the plane where the note goes." or "<A start> can't carry a note. Note the element it belongs to instead." |
| `show-note` | Show what the note is on | | `notes.ts` (2-7) | There is a note that is not archived. The `choice` is the note's id | "There is no note to show." Then, from `run`: "What note 3 is on is no longer in the model.", "<Part def X> is drawn in no view." or "The view note 3 floats on is no longer in the model." |
| `archive-note` | Archive | | `notes.ts` (2-7) | A note is resolved. The `choice` is the note's id | "No note is resolved yet. A note can be archived once it is resolved." Then, from `run`: "Note 3 is not resolved yet. It can be archived once it is resolved." |
| `restore-note` | Restore | | `notes.ts` (2-7) | The archive holds a note. The `choice` is the note's id | "The archive is empty." Then, from `run`: "That note is no longer in the archive." |
| `delete-note` | Delete note | | `notes.ts` (2-7) | There is a note that is not archived. The `choice` is the note's id | "There is no note to delete." Then, from `run`: "That note is no longer there." |
| `add-code-link` | Add code link | | `code.ts` (2-8) | The last picked is an element whose kind holds code links | "Pick an element to link code to it." or "<A start> holds no code links." |
| `remove-code-link` | Remove code link | | `code.ts` (2-8) | The same, and the element has a link. The `choice` is the link's place in the list | "<Part def X> has no code link." Then, from `run`: "That link is no longer there." |
| `open-text` | Show the model's text | | `text.ts` (2-9) | Always | |
| `copy-text` | Copy the text | | `text.ts` (2-9) | Always | From `run`: "This browser wouldn't copy for the page. Select the text and copy it from there." |
| `message-up`, `message-down` | Move the message up, down | `Alt+ArrowUp`, `Alt+ArrowDown` | `sequence.ts` (2-10) | The last picked is a message, and the view in front is a sequence view that draws it | "Pick a message in a sequence view first." Then, from `run`: "<The message m> is already the first row." |
| `expand-all` | Expand all | | `browser.ts` (2-13) | The view in front, or the picked view, is a browser view with a folded row | "<View Y> has nothing folded." or "Expand all is for a browser view." |

Four things about the table:

- **`Mod`** is Control, or ⌘ on a Mac. `ALIASES` of `core/keys.ts` reads `Mod+Shift+Z` as `Mod+Y`, `=` as `+` and `_` as `-`. An alias is not a second shortcut of its own: it is one more spelling of an action's `key`, kept where the keys are read. Slice 7's Help lists the aliases beside the keys.
- **Where a key is the page's.** A chord with `Mod` acts as slice 1's keys act today. Any other key does not act when the event comes from a text field. The arrows, `F2`, `Alt` with an arrow and a `printable` key also do not act when the event comes from inside a widget that uses them itself: an element with the role `tree`, `menu`, `listbox`, `tablist`, `radiogroup` or `grid`. `Delete` and `Escape` act from such a widget, so a row picked in the Explorer is deleted by `Delete`.
- **With no file open** there is no session and no table. The page's only commands are then Open and About, and a key of the table does nothing. This is the one place where a key is not answered, and Damon approved it (section 12).
- **Open and About** stay the top bar's own buttons. They need no session, and an `Action` is asked with one.

### What an undo step holds

One gesture or one action is one `edit()`, so one undo step. Notes are outside the history (contract 9), so a change to a note is no step.

| What the person does | The step holds | Its words |
|---|---|---|
| Draws a line by dragging | The new relationship. For a "defined by" line from a usage that has a definition already: no new relationship, the usage's one typing gets its other end moved and is shown | "Drew <App specializes Page>" |
| Drags a line's end to another node | The relationship's `from` or `to` | "Moved an end of the <connection c, a to b> to <port d in hosts>" |
| Keeps a typed label | Everything `applyLabel` wrote: a name, a multiplicity, a typing, elements it made | The library's `labelWords` |
| Renames a row of a tree | The name | "Renamed to <part def Engine>" |
| Deletes | Every picked element with what it holds, every line on any of them, and their places in every view | "Deleted <part def X>" or "Deleted 3 elements and 2 lines" |
| Removes from a view | The places of the elements, and of what they hold, in that view | "Removed <part def X> from <view Y>" |
| Shows in a view, Show all, Show every… | The new places in that view | "Showed <part def X> in <view Y>" |
| Adds a view, deletes a view | The view | "Added the <view view2>", "Deleted the <view view2>" |
| Changes a view's option | The option. Typing a number is one run, ended when the field is left | "Set the row spacing of <view Y> to 64" |
| Drops a box on another owner, or out onto the ground | The element's `owner`, its place in the model's order when the library asks for one, and its place in the view, together | "Moved <part p> into <part def D>", "Moved <part p> out onto the plane" |
| Adds, removes or changes a code link | The element's `code` list. Typing is one run | "Added a code link to <part def X>" |
| Moves a message a row | The `order` of the two messages that trade rows, and the order of the model's relationships | "Moved the <message m> up a row" |
| Drags an event along its lifeline | The event's place among the model's elements, and its place in the view | "Moved <event e> among the events of <part p>" |
| Drags a lifeline's head | The head's `x` in the view | "Moved <part p>" |
| Drags a footprint in a geometry view | The element's `posX` and `posY` | "Moved <part p> to 1.5, 2 m" |
| Sorts a grid by a header | The view's `sort` option | "Sorted <view Y> by name" |
| Folds a row of a browser view, Expand all | The view's `collapsed` option | "Folded <part def X> in <view Y>" |
| Adds, writes, moves, archives, restores or deletes a note | Nothing: no step. The session is marked unsaved | |

### The flows

Each flow goes from the hand to what is drawn. "Tells" means the history tells its listeners, and from there every flow is rule 1 of the architecture: the stores read the touched views again, the marks are put on, the bodies draw, the panels read what was touched.

**1. A line drawn by dragging (2-2).**

1. The pointer is over a near node, or the node is selected: CSS shows its grips.
2. `pointerdown` on a grip. `Plane.tsx` builds a `GripPress` and calls `connectOf(store).press(press, body)`. The gesture captures the pointer on the grip and from here follows `pointermove` and `pointerup` on the window itself. Until the pointer has gone 4 px it is no gesture: a release before that does nothing.
3. Past 4 px the gesture adds itself to `gesturesOf(session)`, calls `body.swallow()`, and sets `state`. At each move it asks `body.hitAt(pointer)`. For an element under the pointer it asks `fits(session, viewId, fromId, toId)` of `core/actions/connect.ts`, once for each element it comes over, and sets `state.over` and `state.fits`. `ConnectLayer` draws the line in hand from `state`, and the gesture has the body outline the element (`body.mark`).
4. `pointerup`.
   - Outside the body, or on the element the line started at: nothing is drawn and nothing is said.
   - On the ground or on a line: nothing is drawn, and `saysOf` says "Drop the line on the element it goes to."
   - On another element, `fits` answers. `{ refused }`: nothing is drawn, and the sentence is said. One kind: `draw(session, kind, fromId, toId)`, one `edit()`, and the line is picked. Several kinds: `menu` is set, and `ConnectMenu` opens at the pointer; a choice calls `draw` with that kind; Escape, a click outside, or a change of the model closes it and draws nothing.
5. `edit()` tells. The store projects, the new edge is drawn, the Explorer gains its row.

Escape calls the gesture off at any point, the menu included, and nothing is said. A change of the model heard in the middle (an undo by the keyboard) does the same.

`fits` is the rule of criterion 4. It takes the relationship kinds of the view kind's tools (`toolGroups`, its groups read as one list), in the row's order. A kind fits when `drawProblem(session, kind, fromId, toId)` is null: the kind's `first` rule accepts the first element, the two are not one element, the line is not drawn already, and the kind's `ends` rule accepts the pair. `fits` holds no rule of its own. When no kind fits, the sentence is `drawProblem`'s for the first kind in the row whose `first` rule accepts the first element; when no kind's `first` rule accepts it, for the first kind in the row. So a refusal is always one rule's own sentence, and the same pair always gives the same one. In a view whose row holds no relationship kind (a geometry view) no grip is shown, and `fits` answers "<A geometry view> draws no lines."

**2. A line's end moved (2-2).**

1. A selected, near line shows a grip at each drawn end.
2. `pointerdown` on one: `press` with `grip: 'from' | 'to'`, the relationship and its two drawn ends. The line stays drawn as it is. The line in hand runs from the end that stays to the pointer.
3. `pointerup` on an element: `reconnect(session, relId, end, toId)`. It asks `drawProblem` with the new pair, leaving the line itself out of the "already drawn" check. A refusal is said and nothing changes. Otherwise one `edit()` writes the one end. The relationship keeps its id, so its label, its fields, its notes and its pins stay.
4. On the element the end is on already, or outside the body: nothing changes and nothing is said. On the ground or on a line: "Drop the end on the element it goes to. The line stays as it was."

**3. A label edited in place (2-3).**

1. `F2`, or a character typed, with one element or line picked last. `keys.pressed` finds `edit-label` or `type-label` and calls `ask`. `applies` answers; a sentence is said.
2. `run` calls `labelEditOf(session).open(picked, viewInFront, typed)`.
3. `LabelEditor` hears it, finds the anchor, and lays a text box over it: the label's text, all selected (`F2`), or the typed character with the caret after it. The box takes the focus, so the page's keys no longer act: a text field's keys are its own.
4. Enter, or leaving the box: `labelEditOf(session).keep(text)`. One `edit()` runs the library's `applyLabel`. What the text said that was not made (`labelLeftOut`), and what is new and in no view yet, is said. Escape: `close()`, nothing changes. The focus goes back to the plane.
5. `edit()` tells; the node's name line is drawn again.

**4. A row renamed in a tree (2-13).** A row of the Explorer or of a browser view is renamed with the tree library's own editing of a label (`F2` or a double click on the row). When the edit is kept, the tree calls `rename(session, picked, name)` of `core/labels.ts`: one `edit()`, the name as typed. A refusal is said and the row keeps its name.

**5. Delete, and Remove from view (2-4).** `Delete`, or the entry of the palette, or the button of the view's section: `ask(session, 'delete', at)`. `run` works out the elements (each picked element and what it holds), the lines on any of them, and writes one `edit()`: they leave the model's lists and every view's places. The notes on them are not touched (section 2). `ask` picks nothing, since nothing was made; the selection lets go what left the model, by itself. When notes were on what went, `run` says "2 notes on it are kept in Notes." Remove from view is the same flow with the places of one view only.

**6. Views (2-4).** New view: the button at the end of the tab bar opens the kinds; a choice calls `ask(session, 'new-view', null, kind)`. One `edit()` pushes a view with the kind's fields and options and a place on the old page's plane to the right of the others (section 2). It tells; the dock gives the view its tab, in front; `ask` picks the view, so Details shows its name. Delete view: the button of the view's section; one `edit()`; the dock takes the tab away. Show in this view: the section's list; one `edit()` puts a place into the view's layout by the old page's rule (a border item on its owner's right side, a box inside its nearest shown owner below what is there, else on the ground below the view's content). An option: the section's widget calls `setViewOption`.

**7. A box moved into another owner (2-5).**

1. A box is dragged. While its middle is inside its owner, the step is today's: the box stays inside the owner and the owner grows.
2. Once its middle leaves the owner's rectangle, the box follows the pointer freely and the owner no longer grows for it. The store asks `core/actions/reparent.ts` at each step which box under the middle of the dragged box may hold it (`canContain`, the smallest such box, never the box itself or one inside it), and marks that box with a dashed outline.
3. The drop. `reparent.ts` answers one of three: a new owner; the ground, when the kind may stand at the top of the package; or a sentence. The store writes the owner, the order and the place in one `edit()`. A refusal is said and the box goes back.
4. A box dropped where it was, or inside its own owner, is a move as today.

**8. Badges and the checks (2-6).** No hand starts this. `edit()` tells; the checks go stale and run after the pause; `entriesOf` gives the entries; `marksOf` counts them for each thing and tells; each store puts the counts on its nodes and edges; `Badge` draws. A click on a badge is a click on its node: it picks what has the problem. The Validation panel says how many entries there are, and a click on an entry picks what it is about and brings it into its view's window (`hands.reveal`).

**9. Notes (2-7).**

- **Add.** A right-click, then "Add note" in the palette: `ask(session, 'add-note', hit)`. `run` asks `canCarry` for an element or a line, and calls `notesOf(session).add({ type, id })`; on the ground it calls `add({ view, x, y })` with the hit's point, in whole numbers. The Notes panel's button asks with no hit, for the last picked. `run` then calls `attend(note.id)` and `hands.showPanel('notes')`. `notesOf` tells: the marks change, the pin is drawn, the panel lists the note, puts the caret into the attended note once the menu has given the focus back, and calls `attend(null)`.
- **Write.** The note's text box calls `setText` at each keystroke.
- **Move a pin.** A pin hears its own `pointerdown` and calls `pinOf(session).press(noteId, pointer, body)` of `plane/gestures/pin.ts`. The gesture adds itself to `gesturesOf(session)`, follows the pointer on the window, asks `body.hitAt` at each move, and has the body outline what it is over (`body.mark`). At the release it calls `dropPin(session, noteId, hit, inside)` of `core/actions/notes.ts`: on an element or a line that can carry a note, `moveTo(id, { type, id })`; on the ground, `moveTo(id, { view, x, y })` at the pointer's point in whole numbers; outside the body, nothing, and the pin goes back; on an element that can carry none, the refusal is said and the pin goes back. A press that does not go 4 px is a click: `attend(noteId)` and `hands.showPanel('notes')`. A pin stops its click from reaching its node, so a click on a pin picks nothing.
- **Archive, Restore, Delete, Show.** The buttons of the panel are `ActionButton`s with the note's id as their `choice`. Archive is shown on a resolved note only.
- **No step.** None of these calls `edit()`. Each but `attend` and `point` changes `notesOf(session).mark()`, so the file is unsaved.

**10. Code links (2-8).** The Code section's Add and Remove are `ActionButton`s. A field of a link calls `codeLinksOf(session, elementId).change(index, field, value, key)`: one `edit()`, a run while typing. It tells; the adapter asks `codeRowsOf` again, and the box's code compartment is drawn again.

**11. The text tab (2-9).** The top bar's Text button asks `open-text`; `run` calls `hands.showText()`. `TextTab` calls `exportText(session)` when it is shown and again after the session tells of a change, once the changes pause. Copy asks `copy-text`. Nothing is written to the model.

**12. A sequence view (2-10).** A click is a `Hit`, as on any plane. With the event tool in hand, `place` goes to the sequence's placer, which asks `sequenceReader.at(data, point)` where on which lifeline the point lies. A lifeline's head is dragged sideways and an event up and down: the store holds the step to that axis, asks `reader.step`, and at the end calls the sequence's ender. A message is moved a row by the two actions, by its key, or by dragging its line up or down (the kind's own gesture, seam 3).

**13. A geometry view (2-11).** A footprint is dragged: the store asks `geometryReader.step`, which rounds the position to what a pixel is worth in the part's own unit; the ender writes `posX` and `posY`. With a tool in hand, the geometry's placer makes a box of one by one by one of the view's unit at the click.

**14. A grid view (2-12).** A click on a row is a `Hit` on its element, and a click on a matrix's cell a `Hit` on its relationship. A click on a column's header calls `setViewOption(…, 'sort', …)`: by that column, then the other way, then the model's order again.

**15. A browser view (2-13).** A click on a row is a `Hit`. A click on a row's triangle calls `setViewOption(…, 'collapsed', …)`.

**16. A tool in a view of another renderer (2-10, 2-11).** `Tools.click` asks `hasReader` where it asks `isDrawn` today, and `place` calls the kind's placer. A relationship tool calls `draw` as in any view.

## 6. The look, and how it is checked

The form follows SysON's workbench as slice 1's does, taken from the inventory in `docs/sysml/syson/features/` and never from its code or its icons (rule 10). The colours are slice 1's ink and teal. A package adds the colours it needs to `shell/theme.ts` through the lead and changes none (contract 26). What a reviewer would change about the look, and no list below asks for, is written in `plan/notes.md` for slice 7.

### What each new part looks like

- **A grip** is a round handle of 8 px, white with a teal border, 14 px outside the middle of a box's side, so that it stands clear of a port on that side. A border item and a small node have one, on the side away from the owner. A selected line has one at each drawn end, teal. Grips show when the pointer is over the node, when the node is selected, and on every near node while a line is being drawn. A node or a line under the pointer has a thin teal outline.
- **The line in hand** runs straight from the grip to the pointer, 1.5 px, dashed, teal when something fits under the pointer and grey when nothing does. The element under the pointer has a dashed outline, teal or grey the same way.
- **The connect menu** is a Material UI menu, dense, at the pointer where the line was let go, with one entry for each kind that fits, by the kind's label ("specializes", "connection").
- **The label editor** is one text box over the label, in the label's font, size and alignment, at the plane's zoom, as wide as the label and never under 130 px of the plane, with a 1 px teal border and the page's white ground.
- **A badge** is a round mark of 16 px with "!" in white on the theme's warning colour, at a node's top right corner, half outside the border, and at a line's middle. Its tooltip lists the thing's problems, one a line. Several problems show one badge.
- **A pin** is a round mark of 22 px with the note's number: teal with a white number for a note on something, white with a teal border and a teal number for a free note, grey for a resolved one. Pins sit side by side to the left of the badge, on a box's top edge; beside a border item's square, away from its name; at a line's middle; at the right end of a row.
- **The Notes panel** lists the open notes by number. Each is a card: its number as a round button, "on <what it is on>", the text in a box that grows with it, Claude's answer under it after "Claude:", then one line with when it was added and "resolved". Archive and Delete are icon buttons at the card's top right. Under the notes, "Archive · N" opens the archived notes, each read-only with Restore.
- **The text tab** is a tab of the editor beside the views' tabs. A bar at its top holds Copy and what keeps the text from being correct ("No problems found." or the count, with the list under it). Under the bar, the text in a fixed-width font of 12 px, read-only, which can be selected.
- **A sequence view, a geometry view, a grid view, a browser view**: section 8 gives each body's design in its package's brief.

### What can be measured is asserted in tests

As in slice 1: each package's tests assert what a number can say (a pin's middle lies on its box's top edge; a badge is 16 px at any zoom; the editor's box is over its anchor within 2 px; a grid's header row stays at the top while the rows scroll). Every browser test ends by checking that the page logged no error and no warning.

### What must be seen is looked at: one screenshot for each new part

`npm run shots -- <name>` writes each into `canvas/app/shots/`, at 1400 by 900 and twice the density, from a file of its own, `canvas/app/test/shots/<name>.mjs`, which its package owns. A reviewer that did not write the code, and sees only the image and its list, marks each item present or absent (criterion 7). The package is merged only when every item is present. The five marked "rated" are also rated from 1 to 5 on four points (criterion 8): alignment and spacing; type and contrast; nothing cut off or overlapping; easy to read. Each of the 20 scores must be 4 or more, when the screenshot is taken and again when all five are retaken at the slice's last commit.

| Screenshot | Package | Scenario | What must be seen |
|---|---|---|---|
| `connect-menu.png` | 2-2 | The example. A line dragged from the bottom grip of `hosts` and let go on `app`, where two kinds fit. | 1. A menu at the place the line was let go. 2. It lists "specializes" and "connection", one a row, and nothing else. 3. The dashed line from the grip of `hosts` to the menu's corner is still drawn. 4. `app` has a dashed teal outline. 5. The grips of `hosts` are shown, each clear of its port. 6. The menu covers no part of `hosts`. |
| `label-editor.png` | 2-3 | The example at 150%. `hosts` picked, then F2. | 1. One text box over the name line of `hosts`. 2. It holds `hosts[1..*] : Host`, all of it selected. 3. The text is centred, in the size the name is drawn at. 4. The box is at least as wide as the name was. 5. The box's border is teal. 6. No other box or line has moved. |
| `badges.png` | 2-6 | The example, with `App` renamed to `Page`, so that two part defs have one name. The Validation panel is shown. | 1. A round "!" badge at the top right corner of each of the two part defs named `Page`. 2. No badge on any other box. 3. Neither badge covers a keyword or a name. 4. The Validation panel says how many problems there are, in digits. 5. The panel lists the problem in a sentence that names `Page`. |
| `notes.png` (rated) | 2-7 | The annotations fixture, its view fitted, the Notes panel shown and the archive opened. | 1. The Notes panel lists three notes, numbered 1, 2 and 3 from the top. 2. Note 1 says it is on part def Host; note 2 on the connection mount; note 3 on the plane. 3. Note 2 shows Claude's answer under its text and is marked resolved. 4. "Archive · 1" stands under the notes, with note 4 listed under it and a Restore button. 5. On the plane, pin 1 sits on the top edge of `Host`. 6. Pin 2 sits at the middle of the line `mount`, and is grey. 7. Pin 3 stands on the empty plane and is hollow. 8. No pin covers a name or another pin. 9. No text of a note is cut off. |
| `text-tab.png` | 2-9 | The example, its text tab in front. | 1. A tab titled `StrongholdProof.sysml` beside the view's tab, in front. 2. The text begins `package StrongholdProof {`. 3. The text is in a fixed-width font and its lines are not wrapped mid-word. 4. A Copy button at the top of the tab. 5. A line at the top that says no problem was found. |
| `sequence.png` (rated) | 2-10 | The sequence fixture, `loginSequence` fitted, both sides collapsed. | 1. Three heads in one row at the top, left to right `client`, `server`, `auth`, each a rounded box with «part» and its name line. 2. A dashed line down from the middle of each head, as long as the others. 3. Two dots on the line of `client`, named `loginSent` and `loginDone`. 4. Four arrows, each on a row of its own, from the top: `login`, `checkCredentials`, `credentialsOk`, `loggedIn`. 5. Each arrow is level, has a closed, unfilled head at the end it goes to, and its name above it. 6. `login` starts at the dot `loginSent`, and `loggedIn` ends at the dot `loginDone`. 7. Pin 1 at the middle of `login`. 8. No name overlaps a line or another name. |
| `geometry.png` (rated) | 2-11 | The geometry fixture, `plan` fitted, both sides collapsed. | 1. `room` as a rectangle a third wider than it is high. 2. Inside it `desk` and `cabinet` as smaller rectangles and `pillar` as a circle. 3. `desk` is left of `cabinet`, and `pillar` is above both, between them. 4. Each footprint has two lines of words: «part» and its name; its shape with its dimensions and unit, as "Box 2 × 1 × 0.75 m". 5. The words of a small footprint are below it, not across its outline. 6. Two axes from the lower left corner of `room`, named x and y, x to the right and y up. 7. A scale bar under the x axis that reads "1 m" and is an eighth as long as `room` is wide. 8. Pin 1 on `desk`. |
| `grid.png` (rated) | 2-12 | The grid fixture, `elementTable` in front, both sides collapsed. | 1. A table with one header row: kind, name, type, multiplicity, owner, doc, specializes. 2. Thirteen rows under it. 3. The header is set apart from the rows by weight or ground. 4. Every cell's text starts at its column's left edge, and a text too long for its cell ends in an ellipsis. 5. The row of `Host` carries pin 1 at its right end. 6. The table is as wide as the tab or scrolls; no column is cut off without a scroll bar. |
| `browser.png` (rated) | 2-13 | The browser fixture, `modelTree` in front, both sides collapsed. | 1. A tree of rows, one for each element, each reading «keyword» then its name, with `: Type [multiplicity]` for a usage. 2. What an element owns is under it, stepped in a level. 3. The row of `Host` is folded: its triangle points right and nothing is under it. 4. The lines are rows too, under the element they are declared in, as «connection» mount. 5. The row of `hosts` carries pin 1. 6. Every row is as high as the others, and no row's text is cut off. |

The six screenshots of slice 1 stay. Package 2-14 retakes `example.png` and `shell.png` at the slice's close, since the top bar gains a button and a node gains grips.

## 7. What a person can do on the old page, and the test that proves each on the new one

This is the list of criterion 3. It was made from two readings of the old page, one of the core's sixteen scripts and one of the ten feature folders, 358 lines between them, each with its place in the code. The lead cut them to capabilities: one line for each thing a person would name, whatever the number of ways the old page offers it. How each works on the new page follows the redesign, so a line says what the person gets, not how the old page gave it.

"Built by" names the package that makes the capability work on the new page; "slice 1" means it works already. A test is named `file › name`; the files are in `canvas/app/test/`. A test of slice 1 exists under that name today. A test of slice 2 is written first by the package named, under exactly this name, because `capabilities.test.mjs` reads this table and fails when a name is missing from its file.

### Files

| # | A person can | Built by | Test |
|---|---|---|---|
| 1 | Open the page from disk, with no server | slice 1 | `shell.test.mjs › from file://, the page opens with no console error` |
| 2 | Open a model from a state file, and get each of its views | slice 1 | `shell.test.mjs › a file opens from the card, and each of its views gets a tab` |
| 3 | Open another file in place of the one that is open | slice 1 | `open.test.mjs › another file opened takes the first file's planes away` |
| 4 | Be told why a file cannot be opened | slice 1 | `shell.test.mjs › a file that cannot be opened says why, and the open file stays` |
| 5 | Save the model, and find it as it was after opening the file again | slice 1 | `resize.test.mjs › a box resized by its handles keeps its size after save and reload` |
| 6 | Hand Claude one file that holds the model, the notes, the archive and the log of what was done | 2-7 | `notes.test.mjs › a saved file holds the model, the notes, the archive and the log, and opens again with all four` |
| 7 | Rely on every older file still opening and exporting the same text | 2-14 | `fixtures.test.mjs › each of the ten files, opened and saved from the page, exports its pinned text` |

### Moving around

| # | A person can | Built by | Test |
|---|---|---|---|
| 8 | Move around a plane: drag the ground, scroll, drag with the middle button, or press the arrow keys | 2-14 | `camera.test.mjs › a plane is moved by a drag of the ground, by the wheel, by the middle button and by the arrow keys` |
| 9 | Zoom about the pointer with Ctrl or ⌘ and the wheel, and by the buttons and the + and - keys | 2-14 | `camera.test.mjs › a plane zooms by Ctrl with the wheel, by its buttons and by the + and - keys` |
| 10 | See how far the plane is zoomed, as a percentage | 2-14 | `camera.test.mjs › the zoom buttons show the zoom as a percentage` |
| 11 | Bring the whole view back into the window, by a button or the 0 key | 2-14 | `camera.test.mjs › 0 fits the view, as the fit button does` |
| 12 | See a view fitted into its window when it is first shown | slice 1 | `fit.test.mjs › a view fitted into any plane lies inside it, clear of its margins` |
| 13 | Rely on a large model staying quick: only what the window shows is drawn, and far out boxes are outlines | slice 1 | `scale.test.mjs › a large view draws no line while it is far, and its lines at 100%` |
| 14 | Reach the page by the keyboard and see where the focus is | slice 1 | `shell.test.mjs › keyboard focus can be seen` |
| 15 | Rely on nothing on a plane fading or sliding, whatever the system's motion setting | 2-14 | `camera.test.mjs › nothing on a plane has a transition, with reduced motion asked for or not` |

### Pointing and selecting

| # | A person can | Built by | Test |
|---|---|---|---|
| 16 | See what a click would take: the box, port or line under the pointer is marked | 2-2 | `connect.test.mjs › the thing under the pointer is marked, and a near box shows its grips` |
| 17 | Click a box, a port or a line to select it, and see its details | slice 1 | `picking.test.mjs › a click on a box picks it alone, and Ctrl or ⌘ with a click adds it or lets it go` |
| 18 | Get the port or the box, not the line, where a line crosses a port or a name | slice 1 | `small.test.mjs › a click on a port's name selects the port, and on a control node's name the node` |
| 19 | Select a view by a click on its empty ground | slice 1 | `picking.test.mjs › a click on the ground lets go of everything on the plane, with or without Ctrl` |
| 20 | Let go of the selection with Escape | 2-1 | `actions.test.mjs › Escape calls off a gesture, or puts the tool down, or lets go of what is picked` |
| 21 | Find a selected thing in every panel and view that shows it | slice 1 | `selection.test.mjs › a box picked on the plane is the selected row, and a row picked is the selected box` |

### The views

| # | A person can | Built by | Test |
|---|---|---|---|
| 22 | See each view of the model, named with its kind, and bring one to the front | slice 1 | `selection.test.mjs › the row of the view in front is marked, and follows the tabs` |
| 23 | Put two views side by side | 2-14 | `fixtures.test.mjs › two views of one model are shown side by side, each drawn` |
| 24 | Add a view of any of the eight kinds | 2-4 | `views.test.mjs › New view adds a view of the chosen kind, in front, picked and named view1, as one undo step` |
| 25 | Rename a view and write its documentation, and see its tab follow | slice 1 | `details.test.mjs › a view's name, on its tab and its row` |
| 26 | Delete a view, and keep what it showed in the model | 2-4 | `views.test.mjs › Delete view takes the view and its tab away and leaves its elements, as one undo step` |
| 27 | Be told why the only view cannot be deleted | 2-4 | `views.test.mjs › the only view cannot be deleted, and the button says why` |
| 28 | Show an element in a view | 2-4 | `views.test.mjs › an element picked from a view's Show list is drawn in that view, as one undo step` |
| 29 | Take an element out of a view, and keep it in the model and in the other views | 2-4 | `remove.test.mjs › Remove from view takes a box and what it holds out of one view only, as one undo step` |
| 30 | See which views show an element, and what a view shows | 2-4 | `view-section.test.mjs › Details says which views show an element, and how many elements a view shows` |
| 31 | See a view of each kind drawn, with nothing left to another page | 2-14 | `fixtures.test.mjs › the example and the nine fixtures each open: 17 views, each drawn by its own body, nothing logged` |

### Making and drawing

| # | A person can | Built by | Test |
|---|---|---|---|
| 32 | See the tools of the view in front, and what the tool in hand expects next | slice 1 | `tools-panel.test.mjs › the Tools view lists the tools of the view in front, in the groups of its kind` |
| 33 | Take a tool in hand, and put it down by a second click or Escape | slice 1 | `tools-panel.test.mjs › a click takes a tool in hand, a second click puts it down, and another tool takes its place` |
| 34 | Place an element of every kind a graph view offers, on the ground, inside a box or on a border, with a free name | slice 1 | `tools.test.mjs › every tool of ${w.name} row is used once: it appears on the plane and in the Explorer, validates, and Undo takes it back` |
| 35 | Draw a line of every kind by its tool and two clicks | slice 1 | `tools.test.mjs › every tool of ${w.name} row is used once: it appears on the plane and in the Explorer, validates, and Undo takes it back` |
| 36 | Draw a line by dragging from one element to another | 2-2 | `connect.test.mjs › in each graph view kind, a drag between each pair of node kinds draws what the rules allow and says why for what they refuse` |
| 37 | Be told why a line or a place is refused, in the rule's own sentence | slice 1 | `tools.test.mjs › a specialization from a part def to a port def is refused in the library's sentence` |
| 38 | Tell the kinds of box and of line apart by how they are drawn | slice 1 | `plane.test.mjs › each line kind has its marker` |
| 39 | Read an element's documentation, its code links and what it sends or accepts inside its box | slice 1 | `plane.test.mjs › no row of a compartment and no name runs past its box, in the example and the fixtures` |
| 40 | Change which definition a usage has, and keep the notes on that line | 2-2 | `reconnect.test.mjs › each kind of line has an end dragged to a node that may take it: one undo step, its label and its notes kept` |

### Moving things

| # | A person can | Built by | Test |
|---|---|---|---|
| 41 | Drag a box, with what it holds and the lines on it | slice 1 | `move.test.mjs › a drag is one undo step, undone and redone` |
| 42 | Slide a port or a parameter along its owner's border | slice 1 | `move.test.mjs › a port dragged past a corner changes side` |
| 43 | Move a box into another box that may hold it, or out onto the plane | 2-5 | `reparent.test.mjs › a box dropped on a box that may hold it belongs to it, and dropped on the ground belongs to none, each as one undo step` |
| 44 | Be told why a box cannot go where it was dropped, and find it back where it was | 2-5 | `reparent.test.mjs › a box dropped where it may not stand goes back, and a toast says why` |

### Deleting

| # | A person can | Built by | Test |
|---|---|---|---|
| 45 | Delete the selected element with what it holds and every line on it, by the Delete key | 2-4 | `remove.test.mjs › Delete takes a box, what it holds and every line on them out of the model and every view, as one undo step` |
| 46 | Delete a selected line | 2-4 | `remove.test.mjs › Delete takes a picked line out of the model, as one undo step` |

### Details

| # | A person can | Built by | Test |
|---|---|---|---|
| 47 | Change every field of every kind of element, line and view, each change one undo step | slice 1 | `fieldHooks.test.mjs › every field of every element, line and view of the ten files, changed, is one undo step, undone and redone` |
| 48 | Rename by typing, and see the box, the tab and the row follow each keystroke | slice 1 | `details.test.mjs › an element's name, on its box and its row` |
| 49 | Pick a usage's definition, and what a definition specializes or a usage subsets | slice 1 | `details.test.mjs › picking another definition moves the typing's end` |
| 50 | Read every attribute of the metaclass on two tabs, with what the page does not hold yet said so | slice 1 | `details-fields.test.mjs › the Core and Advanced tabs each hold their rows, and the tab shown stays as the selection changes` |
| 51 | Be told why a field cannot be changed now | slice 1 | `details-fields.test.mjs › a locked field cannot be changed and says why` |

### Labels

| # | A person can | Built by | Test |
|---|---|---|---|
| 52 | Open a box over a label with F2 and type into it | 2-3 | `label-editor.test.mjs › F2 opens a box over the label of what is picked, holding its text, all selected` |
| 53 | Start typing with something selected, and have the typing replace its label | 2-3 | `label-editor.test.mjs › a character typed with a box picked opens the editor holding that character` |
| 54 | Keep the typed label with Enter or by leaving the box, and put it away with Escape | 2-3 | `label-editor.test.mjs › Enter and leaving the box keep the label as one undo step, and Escape changes nothing` |
| 55 | Set a name, a multiplicity, a definition and what is specialized in one typed label | 2-3 | `labels-core.test.mjs › a typed label sets the name, the multiplicity, the definition and the general, each part alone or together` |
| 56 | Be told what the typed text said that was not made, and what it made that no view shows yet | 2-3 | `label-editor.test.mjs › what a label's text said that was not kept, and what it made, is said in a toast` |
| 57 | Name a line by typing on its label | 2-3 | `label-editor.test.mjs › a line's label is edited as a box's is` |
| 58 | Rename a row of a tree by typing | 2-13 | `rename.test.mjs › a row of the Explorer and of a browser view is renamed in place, as one undo step` |

### Checks

| # | A person can | Built by | Test |
|---|---|---|---|
| 59 | Rely on the model being checked by itself once the changes pause, while drawing | 2-6 | `badges.test.mjs › a problem made on a plane shows its badge after the pause, with the Validation panel hidden` |
| 60 | See what has a problem by a badge on it, in every view that draws it, and read the problem from the badge | 2-6 | `badges.test.mjs › a box and a line with a problem carry a badge in every view that draws them, and its tooltip says the problem` |
| 61 | Read every problem and every broken rule of the specification in one list | slice 1 | `validation.test.mjs › two part defs given one name are listed 0.8 s after the change, under Grasp's problems and under the specification's rules in SysON's words, and both entries go with Undo` |
| 62 | See how many problems there are | 2-6 | `validation-count.test.mjs › the Validation panel says how many problems and broken rules there are` |
| 63 | Go from a problem to what it is about: it is selected and brought into the window | 2-6 | `validation-count.test.mjs › a click on an entry selects what it is about and brings it into its view's window` |

### Notes

| # | A person can | Built by | Test |
|---|---|---|---|
| 64 | Add a note on a box, a port or a line | 2-7 | `notes.test.mjs › Add note on a box, on a port and on a line adds a numbered note, pinned to it, with the caret in its text` |
| 65 | Leave a note anywhere on a view, on nothing | 2-7 | `notes.test.mjs › Add note on the ground leaves a free note there, with a hollow pin` |
| 66 | Be told why a start, a done or an initial node cannot carry a note | 2-7 | `notes.test.mjs › an element with no name in the text cannot carry a note: Add note is greyed and says why` |
| 67 | Write a note's text, and read what it is on, when it was added and whether Claude wrote it | 2-7 | `notes.test.mjs › a note's text is typed in the panel, which says what it is on, when it was added, and that Claude wrote it when Claude did` |
| 68 | Read Claude's answer under a note, and see a resolved note as resolved in the list and on its pin | 2-7 | `notes.test.mjs › a file with an answered, resolved note shows the answer, and the note and its pin as resolved` |
| 69 | See a note's pin, with its number, wherever what it is on is drawn | 2-7 | `pins.test.mjs › a note has a pin in every view that draws what it is on, on a box, a port and a line` |
| 70 | Go from a pin to its note, and from a note to what it is on | 2-7 | `pins.test.mjs › a click on a pin opens its note, and a click on a note's number selects what it is on and shows it` |
| 71 | Move a note onto something else, or onto the plane, by dragging its pin | 2-7 | `pins.test.mjs › a pin dragged onto a box, a line and the ground moves its note there, and is no undo step` |
| 72 | Delete a note | 2-7 | `notes.test.mjs › Delete on a note takes it and its pins away` |
| 73 | Put a resolved note away into the archive, with its number and its answer | 2-7 | `archive.test.mjs › Archive puts a resolved note away with its number and its answer, and an open note has no Archive` |
| 74 | Read the archive, and restore a note from it | 2-7 | `archive.test.mjs › the archive lists what was put away, and Restore brings a note and its pins back` |
| 75 | Rely on a note keeping the current name of what it is on | 2-7 | `notes-core.test.mjs › a note's label of what it is on follows a rename` |
| 76 | Rely on notes not being undone | 2-7 | `notes-core.test.mjs › Undo takes back no change to a note, and a note on something deleted is kept and finds it again after Undo` |

### Code links

| # | A person can | Built by | Test |
|---|---|---|---|
| 77 | Link code to an element: add a link, give it a path, a language and a text | 2-8 | `code-links.test.mjs › a code link is added and its path, language and text set, each one undo step` |
| 78 | Remove a code link | 2-8 | `code-links.test.mjs › Remove takes a code link away as one undo step` |
| 79 | See an element's code links on its box | 2-8 | `code-links.test.mjs › a link's path shows in the box's code compartment as it is typed` |

### The text

| # | A person can | Built by | Test |
|---|---|---|---|
| 80 | Read the model as textual SysML v2, with the notes and the code links in it | 2-9 | `text.test.mjs › the text tab shows the text canvas/export.mjs prints for the same file` |
| 81 | See, above the text, what keeps it from being correct | 2-9 | `text.test.mjs › the problems of the model are listed above its text` |
| 82 | Copy the text | 2-9 | `text.test.mjs › Copy puts the text on the clipboard, and says so when the browser refuses` |

### Undo

| # | A person can | Built by | Test |
|---|---|---|---|
| 83 | Take back the last change, by the button or Ctrl or ⌘ + Z, and read on the button what it would take back | slice 1 | `keys.test.mjs › Save, Undo and Redo are enabled only when they have something to do` |
| 84 | Rely on one gesture or one run of typing being one step | slice 1 | `history.test.mjs › the keystrokes of one key are one step` |
| 85 | Rely on everything done being logged in words for Claude, in the saved file | slice 1 | `files.test.mjs › what was changed is what is saved, with the log of what was done` |

### The sequence view

| # | A person can | Built by | Test |
|---|---|---|---|
| 86 | See lifelines, their events, and the messages in time order, one row each | 2-10 | `sequence.test.mjs › the sequence fixture shows its lifelines, events, messages in time order and successions` |
| 87 | Add a lifeline, an event on a lifeline, a message and a succession | 2-10 | `sequence.test.mjs › each tool of a sequence view is used once, and Undo takes it back` |
| 88 | Move a message a row up or down, and have the text's order follow | 2-10 | `sequence.test.mjs › a message moved a row up or down trades places, in the view and in the text, as one undo step` |
| 89 | Set a message's order in Details | 2-10 | `sequence.test.mjs › a message's order typed into Details moves its row` |
| 90 | Drag a lifeline sideways and an event along its lifeline | 2-10 | `sequence.test.mjs › a lifeline moves sideways only and an event along its lifeline only, each as one undo step` |
| 91 | Set the distance between the rows | 2-10 | `sequence.test.mjs › the row spacing of a sequence view is set in its section of Details` |

### The geometry view

| # | A person can | Built by | Test |
|---|---|---|---|
| 92 | See parts as footprints to scale, with a coordinate frame and a scale bar | 2-11 | `geometry.test.mjs › the geometry fixture shows its footprints to scale, its axes and a scale bar that reads true` |
| 93 | Add a part or an item at a point of the plan | 2-11 | `geometry.test.mjs › each tool of a geometry view places a box of one unit at the click, and Undo takes it back` |
| 94 | Move a part by dragging its footprint, and read its new position | 2-11 | `geometry.test.mjs › a footprint dragged changes the part's position in the model, as one undo step` |
| 95 | Set a part's shape, dimensions and position in Details, and see the footprint follow | 2-11 | `geometry.test.mjs › a dimension typed into Details resizes the footprint` |
| 96 | Set the plan's scale and unit | 2-11 | `geometry.test.mjs › the scale and the unit of a geometry view are set in its section of Details, and the drawing keeps its size when the unit changes` |

### The grid view

| # | A person can | Built by | Test |
|---|---|---|---|
| 97 | See chosen elements as a table, with the columns the view chooses | 2-12 | `grid.test.mjs › the grid fixture shows a row for each element and a column for each chosen column` |
| 98 | Choose the columns, among them notes, code links and problems | 2-12 | `grid.test.mjs › a column ticked in the view's section is added to the table, and the last column cannot be taken away` |
| 99 | Sort the rows by a click on a column's header | 2-12 | `grid.test.mjs › a click on a header sorts by it, again the other way, again the model's order, each one undo step` |
| 100 | See the elements against each other as a matrix of the lines between them | 2-12 | `grid.test.mjs › a grid switched to a matrix shows the lines between its elements` |
| 101 | Fill a grid with every element, or every element of one kind | 2-4 | `views.test.mjs › Show all and Show every part def fill a grid view, each as one undo step` |
| 102 | Select an element from a table, or a line from a matrix, and see an element's notes and problems on its row | 2-12 | `grid.test.mjs › a click on a row picks its element, a click on a matrix's sign picks its line, and a row shows its pins and its badge` |

### The browser view

| # | A person can | Built by | Test |
|---|---|---|---|
| 103 | See the whole model as a tree: each element with what it owns and the lines declared in it | slice 1 | `explorer.test.mjs › with no file open the Explorer says so, and with one it shows the package, its views, then the elements and the lines` |
| 104 | See a browser view as that tree under chosen roots | 2-13 | `browser.test.mjs › the browser fixture's two views show the tree, the second under its roots only` |
| 105 | Fold and unfold a row, and unfold everything | 2-13 | `browser.test.mjs › a row folded in a browser view stays folded after save and reload, and Expand all unfolds every row` |
| 106 | Choose the roots of a browser view | 2-13 | `browser.test.mjs › the roots picked in the view's section are the tree's roots` |
| 107 | Select an element or a line from the tree | slice 1 | `selection.test.mjs › a line's row selects its line` |

### What the page says

| # | A person can | Built by | Test |
|---|---|---|---|
| 108 | Be told in a sentence whenever something is refused | 2-14 | `refusals.test.mjs › every action of the table, asked where it does not apply, says why` |
| 109 | Read, in each panel, what to do when it has nothing to show | slice 1 | `details-fields.test.mjs › with no file open Details says so, and with a file open and nothing picked it says that` |
| 110 | Hide a side panel and bring it back | slice 1 | `shell.test.mjs › a side panel collapses to its strip and opens again` |

### Speed

| # | A person can | Built by | Test |
|---|---|---|---|
| 111 | Rely on a keystroke in a name staying under 50 ms at 5,000 elements | slice 1, held by 2-14 | `scale.test.mjs › a keystroke in a name takes under 50 ms at 5,000 elements` |
| 112 | Rely on a drag step staying under 16 ms at 5,000 elements | slice 1, held by 2-14 | `scale.test.mjs › a drag step takes under 16 ms at 5,000 elements in 3 views` |

**N is 112.** Of these, 38 are proved by a test of slice 1 that passes today, and 74 by a test that slice 2 writes first.

### What the list does not hold, and why

**Done the new way.** These are on the old page and are not lines above, because the redesign replaces how the capability is given, and the capability itself is a line:

- The header's palette, its Note tool, its buttons Export, Validation, Download, Import, New view, Undo. They are the Tools view, the right-click palette, the top bar and the panels (lines 2, 5, 24, 32, 61, 64, 80, 83).
- The views as frames on one plane, moved by their tabs, with one "active" view. Each view is a tab (lines 22, 23). Frames come back in slice 3.
- The hint line under the pointer and the status line of what was just done. The Tools view says what a tool expects (line 32), a toast says what was refused (line 108), and Undo's tooltip says what was done (line 83).
- The button that steps through the problems. The Validation panel lists them (lines 61 to 63).
- The fields "Edit label", "Add note", "Remove from view" and "Delete" as a row of buttons in the panel. They are keys and entries of the right-click palette.

**The model library's, not the page's.** The readers also listed what the library says and writes: each check's sentence (96 sentences in 40 lines of the readings), each line kind's rule, and the form of the text for each kind. The library does not change in this slice. Its Node tests and the ten pinned texts hold those, and lines 7, 37, 61 and 80 hold that the page still shows them.

**Left out, approved by Damon by name** on November 14, 2026 (section 12):

1. **The page keeping the work in this browser by itself.** The old page saves every change into the browser's storage, and starts from that copy the next time. The new page saves when Save is pressed, and asks before unsaved work is lost (`keys.test.mjs › the page asks before a reload loses changes, and not once saved`). Decided for slice 1 (`plan/direction.md`, "Decided for slice 1", Saving).
2. **The window's place and zoom remembered across a reload.** The architecture leaves it to slice 3 ("Left to later slices").
3. **The claude.ai store**: the live exchange with Claude through it, its read-only states, its messages about size and refusals, and Import's second press on the published page. `plan/direction.md`, decision 7, drops the store. Until slice 3 closes, a state file reaches Claude through the conversation or GitHub (architecture, section 9, item 2).
4. **Following the system's dark setting.** Slice 7 (architecture, section 9, item 10).
5. **The layout for a window 720 px wide or less.** The new shell keeps one layout; its side panels collapse to strips at any width.
6. **Driving the drawing by touch.** React Flow's own handling of touch stays switched on, and no test of this slice drives it.

**Outside, by the criteria.** The old page's two other limits (the checks under 100 ms at 10,000 elements; a 10,000-element model within the store's limits) are not among the four that the criteria keep.

## 8. The packages: a brief for each

A brief is what an agent builds from. It gets its brief, this plan's sections the brief names, and the files they name, and nothing else from the lead. Every brief has the same parts: what it delivers; the criteria and the lines of section 7 it answers to; what to read first; the files it owns; the skeletons it fills; what is decided for it; the tests it writes first; its screenshot; what it hands back.

### The rules every brief carries

Each rule has its reason, because a rule without its reason is applied too widely or not at all.

1. **Change only the files you own.** Other agents change the others at the same time, and the lead takes only your owned files. A change you need in another file is a reason to stop and say which and why.
2. **Nothing under `canvas/src`, `canvas/test`, or any file that `canvas/app/test/unchanged.json` lists; no change to the form of a `grasp/2` model.** The old page, the model library and the fixtures stay as they are until package 2-15, and a `lib.js` file never changes in this slice. One changed byte fails `unchanged.test.mjs`. A change you need in the model library is a reason to stop.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An icon you need is asked of the lead, who adds it to the table.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. A timed test that fails is reported with what it measured.
5. **No colour outside `shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. A test that reads `window.Grasp` tests the page's inside and not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`.
6. **A module that reads a field of a model's record is one of contract 22's.** In this slice those are the readers, `core/actions/*`, `core/labels.ts`, `core/codeLinks.ts`, `core/notes.ts` (a view's `x` and `y` only) and `panels/hooks/*`. A component asks one of them, so that slice 4 knows what it rewrites.
7. **Every control that asks an action is an `ActionButton` or an `ActionItem`, and every refusal is a sentence.** A gesture that is refused calls `saysOf(session).say(sentence)`. Criterion 6 counts a refusal with nothing shown as a failure.
8. **Write your tests first, under the names this plan gives, and see each fail for the reason its line names.** `capabilities.test.mjs` finds a test by its name. Then fill the skeletons until they pass, run `npm run build`, `npm run check` and `npm test`, and take your screenshot.
9. **You do not hand over `canvas/dist/`, `plan/status.json` or `plan/notes.md`.** They are the lead's. Build `canvas/dist/` to run your tests.

And two sayings of judgment, as in slice 1:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and this plan. When a test and the contract disagree, the contract stands.
- **Something that looks wrong is a reason to stop.** Say what you found and why. Do not change a file you do not own, and do not bend your work to fit.

**What every package hands back:** the files it owns, as a diff against the scaffold's commit; for each test, the first line of its failure before the code and that it passes after; the test of slice 1 it made fail by design, if any, with the sentence of this plan that asks for the change (contract 27; the lead changes that test); each measurement with its command; whatever it built otherwise than its brief says, with the reason; and what it tried and dropped.

### Package 2-1. The scaffold

- **Delivers.** Every seam of section 4, built and tested; a skeleton of every file that packages 2-2 to 2-15 own, with its contract as a comment; the tests of the "Done when" checks and of criteria 2 to 6, written first, seen to fail and marked todo. The page behaves as before, with the four differences listed below.
- **Built by** the lead, alone. Damon approved this plan on November 14, 2026, so it can start.
- **What a skeleton is.** A file a later package owns exists, with its exported types and signatures and each contract as a comment. A function nothing calls yet throws `"<name>: package 2-N builds it"`. What the page already calls keeps what the page shows today: a reader, a body, a gesture and a set of node types that are not built are `null`; a list of rows or of hooks is empty; a section's `applies` answers false; a component renders nothing; `notesOf` carries the file's notes through; `entriesOf` gives an empty list.
- **What changes for a person, on purpose.** (1) A key of the table pressed where its action does not apply now says why in a toast: `Mod+Z` with nothing to undo, `Mod+Y` with nothing to redo. (2) Escape with no tool in hand lets go of what is picked. (3) The Undo and Redo buttons, when greyed, carry their sentence as their tooltip. (4) The middle mouse button drags the plane. Everything else is as slice 1 left it: a row that is not built is not in the table, a body that is not built shows its card, and no grip is mounted.
- **Changes in existing files**, beyond the seams of section 4:
  - `core/commands.ts`: `draw()` of a "defined by" line from a usage that has a definition already no longer takes the old line out. It moves the old line's other end and shows the line, as the Typed by field of Details does. So the line keeps its id and what is pinned to it (section 2). `drawProblem`, `freshElement` and `freshRelationship` are exported (seam 8). The words of the sequence view's tools, as the old page has them, join `TOOL_TITLE`, `TOOL_HINT` and `BASE_NAME`. `toolGroups`, `place`, and the tool's `click` and `offers` ask `hasReader` where they ask `isDrawn`, and `place` goes to the kind's placer for a renderer other than `graph`.
  - `plane/Plane.tsx`: `panOnDrag` takes the middle button too. The root carries `--grasp-zoom`, set when the zoom changes and never on a pan, and `data-grips` and `data-connecting` (seam 6). The click that follows a gesture's release is dropped (`swallow`). An entry's `flow` props are spread onto React Flow. The camera's hand is given: a zoom by a step of 1.2 about the plane's middle, a move by 80 px, a fit, and `reveal`.
  - `plane/viewStore.ts`: seam 3's additions, and the marks beside `selected`.
  - `shell/Toasts.tsx`: it shows what was said last, by a tool or through `saysOf`, and carries `data-said`.
  - `shell/TopBar.tsx`: Undo, Redo and Save become `ActionButton`s; a Text button for `open-text`, shown once package 2-9 has built the row.
  - `shell/theme.ts`: the colours the slice's parts need, added once: the badge's warning colour, the grey of a resolved pin and of a line in hand that fits nothing.
  - `src/vendor.ts`: the icons the slice's controls use (`Add`, `AddCommentOutlined`, `ArchiveOutlined`, `UnarchiveOutlined`, `DeleteOutline`, `ContentCopyOutlined`, `ArticleOutlined`). Material UI's table is there already: the table holds all of `@mui/material`.
  - `canvas/app/test/shots.mjs`: the nine new screenshots by name, each a file of `test/shots/` whose skeleton throws until its package writes it.
- **Tests it writes, which pass at its commit** (Node unless said): `actions.test.mjs` (the table is put together from the rows; `ask` says a refusal and picks what was made; `keyOf` and `pressed` with every rule of where a key is the page's; "Escape calls off a gesture, or puts the tool down, or lets go of what is picked"; the aliases); `readers.test.mjs` (the graph reader's `read` is `project`; `listed` gives one entry for each node and edge of the ten files; a reader that is not built is null, and its kind keeps its card and has no tools; a stand-in reader of another renderer is asked for the projection, a step and the end, and only the pressed node moves); `marks.test.mjs` (marks from stand-in entries and notes; an unmarked node keeps `NO_MARKS` and stays the same object through a projection; idle with no listener); `says.test.mjs`; `session-notes.test.mjs` (`unsaved` follows the notes' mark; the ten files save with the notes as they were); `seams.test.mjs` in the page (every anchor carries `data-label`; every node and edge gives its element; `ViewHost` shows a card for a kind with no body; the palette lists an action that applies; a greyed `ActionButton` carries its sentence; a `BodyFrame` with stand-in rows turns a click into a `Hit` and opens the palette); `fixtures.test.mjs › each of the ten files, opened and saved from the page, exports its pinned text`, which passes when it is written, because slice 1 already saves a file as it opened it, and is held from here on.
- **Tests it writes first and marks todo**, each with its check in `plan/status.json` (section 9).
- **The measurement** of criterion 9, with grips mounted on every near node by a stand-in for `connectOf` that is not committed: three runs of `npm test` in a row, with nothing else running, each of the four medians in `plan/notes.md`. If React Flow takes a press on a grip in spite of its classes, or a limit does not hold with the grips, the marks and the checks running, the scaffold stops and the plan comes back to Damon.
- **Answers to** criteria 9, 10 and 11; line 20 of section 7.

### Package 2-2. Lines by dragging

- **Delivers.** A drag from a node's grip draws a relationship the view kind allows, with a menu when more than one kind fits. A drag of a selected line's end moves that end. Every refusal is the rule's own sentence in a toast.
- **Answers to** criteria 4, 5, 6, 7 and 10 (their text is in section 10); lines 16, 36 and 40 of section 7.
- **Read first.** This plan: section 2 ("Lines by dragging are Grasp's own gesture"), section 4 (seams 2, 6, 8 and 12), section 5 (the `put-down` row, "What an undo step holds", flows 1 and 2), section 6, section 9. `core/commands.ts` (`draw`, `drawProblem`, `toolGroups`, `Outcome`, `gesturesOf`), `core/says.ts`, `plane/Plane.tsx`, `plane/nodes/Grips.tsx` and `grips.css`, `plane/edges/LineEdge.tsx`, `views/bodyContext.ts`, `plane/viewStore.ts`, `canvas/app/test/helpers.mjs`, `canvas/app/test/core.mjs` (`pairsState`). There is nothing to port: the old page draws by two clicks only.
- **Owns.** `core/actions/connect.ts`, `plane/gestures/connect.ts`, `plane/gestures/ConnectLayer.tsx`, `plane/ConnectMenu.tsx`, `plane/gestures/connect.css`, `canvas/app/test/connect-core.test.mjs`, `canvas/app/test/shots/connect-menu.mjs`; and, from the scaffold's commit on, `canvas/app/test/connect.test.mjs` and `reconnect.test.mjs`. The scaffold wrote the three tests of criteria 4 and 5 into those two files and marked them todo. The package adds the other tests named below, takes the three marks off in its worktree, and makes all of them pass.
- **Fills.**

  ```ts
  // core/actions/connect.ts
  type Fits = { kinds: readonly Tool[] } | { refused: string };
  function fits(session: Session, viewId: string, fromId: string, toId: string): Fits;
  function reconnectProblem(session: Session, relId: string, end: 'from' | 'to', toId: string): string | null;
  function reconnect(session: Session, relId: string, end: 'from' | 'to', toId: string): Outcome;
  // plane/gestures/connect.ts:  connectOf (seam 6), in place of null
  // plane/gestures/ConnectLayer.tsx:  ConnectLayer({ session, viewId })     plane/ConnectMenu.tsx:  ConnectMenu({ session, viewId })
  ```

- **Decided.** Flows 1 and 2 of section 5 are the gesture, step by step. Beside them:
  - A line is drawn by `draw()`, so a tool's line and a dragged line are the same step. The gesture picks what was drawn (`selectionOf(session).set([made])`).
  - `reconnect` writes one end in one `edit()` and keeps the relationship's id. Its words: "Moved an end of the <describeRel, as it was> to <describe of the new end>". What it refuses is `drawProblem`'s sentence for the new pair. For a "defined by" line whose usage end goes to a usage that has a definition already, hidden or shown: "<describe of that usage> is defined by <the definition's name> already. Clear its definition in Details first."
  - The gesture works whatever tool is in hand, and leaves the tool as it is. Escape calls a line in hand off first (the `put-down` row).
  - The menu is section 2's. It carries `data-testid="connect-menu"`, and each entry `data-kind`.
  - `ConnectLayer` draws the line in hand as section 6 says. It carries `data-pass`.
  - Far (below 25% zoom) there is no grip, and so no gesture.
- **Tests first.**
  - `connect-core.test.mjs` (Node): "fits gives, for every ordered pair of shown elements of the ten files' graph views and of pairsState(), the kinds draw() draws, in the row's order"; "a pair nothing fits gives one rule's own sentence, the same each time"; "reconnect moves one end in one undo step and keeps the relationship's id, fields and notes"; "reconnect refuses what the kind's rules refuse, and a line that exists already".
  - `connect.test.mjs` (the page): "in each graph view kind, a drag between each pair of node kinds draws what the rules allow and says why for what they refuse" (criterion 4; the scaffold's); "each line drawn by dragging is one undo step, undone and redone"; "where more than one kind fits a menu lists them, and each choice draws that kind"; "the thing under the pointer is marked, and a near box shows its grips"; "a line let go on the ground draws nothing and says so"; "Escape calls off a line in hand, and the tool in hand stays"; "with a tool in hand, a line let go on the ground places nothing"; "the node a line was dragged from is not picked by the release".
  - `reconnect.test.mjs` (the page): "each kind of line has an end dragged to a node that may take it: one undo step, its label and its notes kept"; "an end dropped on a node that may not take it, or on the ground, leaves the line as it was, and a toast says why" (criterion 5; both the scaffold's).
- **How criterion 4's test is generated.** From the model library's rules, over two sets of models, so that the page and the test are held to the rules and not to each other:
  - **The ten files.** Their 11 graph views hold 2,260 ordered pairs of shown elements. By the rules, 1,742 are refused, 456 fit one kind and 62 fit several, and every one of the eight relationship kinds a graph view's row lists is allowed somewhere. The test sorts the pairs into classes by view kind, the first element's kind, the second's, and what the rules give (the kinds that fit, or a refusal): 221 classes. It drags one pair of each class.
  - **`pairsState()`**, for the pairs of kinds the files do not hold. For each graph view kind it makes a view with two elements of each kind the view admits (`admits`), each placed by the core's own `place()` at the first place that takes it, tried in this order: the ground, then inside or on each element placed before it, in the order they were placed. The test drags one pair for each ordered pair of kinds, two of one kind included: 400 in a general view, which admits all 20 kinds.
  - **What must happen** is worked out in Node on the model as it is before the drag, from `first`, `ends` and `draw`'s two own checks, apart from `fits`. Then the test drags in the page and compares: a new toast with that sentence (`toast(page).said` has grown) and no new line; one new line of that kind (`linesIn`); or a menu with exactly those kinds, each then chosen in a drag of its own. After a drawn line the test presses Ctrl + Z, so every drag starts from the same model.
  - The test is one test, with a time limit of its own of five minutes, since it makes about 800 drags.
- **How criterion 5's test finds its lines.** For each of the nine relationship kinds: the first line of that kind, in the order of the files, then of a file's views, then of the model's relationships, that a graph view draws and one of whose ends another node of that view may take. Each kind has one in the ten files. The end dragged is `to` when a node may take it, else `from`. The node it goes to is the first that may take it; the node that may not is the first that may not. The test opens the file with a note added on the line (`withNote`), and reads the note's target from the saved file afterwards.
- **It names** no test of slice 1 that fails by design.
- **Screenshot.** `connect-menu.png`.

### Package 2-3. Label editing

- **Delivers.** F2, or typing with something picked, opens an editor over the label of a node or a line. Enter keeps it, Escape puts it away, one undo step. `rename`, which package 2-13 calls for a row of a tree.
- **Answers to** criteria 3, 6, 7 and 10; lines 52 to 57.
- **Read first.** This plan: section 2 ("How typing starts the label editor without taking the zoom keys"), section 4 (seams 2, 7, 8 and 12), section 5 (the rows `edit-label` and `type-label`, "What an undo step holds", flows 3 and 4), section 6, section 9. `canvas/src/labels/page.js` (what the editor does; port its behaviour, not its code) and `canvas/src/labels/lib.js` (the grammar, which stays: `readLabel`, `applyLabel`, `labelText`, `labelEditable`, `renamable`, `labelWords`, `labelLeftOut`). `core/commands.ts` (`freshElement`, `freshRelationship`, which make what `applyLabel` asks its caller to make), `core/hands.ts` (`reveal`), `core/says.ts`.
- **Owns.** `core/labels.ts`, `core/actions/labels.ts`, `plane/LabelEditor.tsx`, `plane/label-editor.css`, `canvas/app/test/labels-core.test.mjs`, `label-editor.test.mjs`, `shots/label-editor.mjs`.
- **Fills.** `labelEditOf` and `rename` (seam 7); the rows `edit-label` and `type-label`; `LabelEditor({ session })`.
- **Decided.**
  - The box holds `labelText` of the thing for F2, all selected; or the typed character, with the caret after it.
  - Enter keeps (without Shift; a line break typed with Shift is read as a space). Leaving the box keeps too. Escape puts it away and changes nothing. While the box is open its keys are its own.
  - `keep` runs `applyLabel` in one `edit()`, in the library's `labelWords`. A text that changes nothing is no step.
  - After a kept label, one toast says, in this order, each only when there is something to say: for each element the text made, "<Part def X> is new, in no view yet. A view's Show list brings it in."; then the library's `labelLeftOut`.
  - The box stays over its anchor while the plane pans or zooms. A label outside the window is brought into it first (`hands.reveal`).
  - A thing with no anchor in the document gets the box at its middle (seam 7).
  - In a grid view nothing opens: "A grid's cells are not labels. Edit <part def X> in Details." In a browser view and in the Explorer a row is renamed by the tree (package 2-13).
  - If what was edited has left the model when the box closes: "What you were editing is gone, so nothing changed."
  - `rename` writes the name as typed and reads no other part. Words: "Renamed to <describe>" for an element, "Named the <describeRel>" for a line. It refuses what `renamable` refuses: "<A start> has no name to change."
- **Tests first.** `labels-core.test.mjs` (Node): "a typed label sets the name, the multiplicity, the definition and the general, each part alone or together"; "a label that names a definition the model does not hold makes it, in the same step"; "what the text said that the page does not hold is left as it was and said"; "rename writes the name as typed, in one step, and refuses what has no name". `label-editor.test.mjs` (the page): the five names of lines 52 to 54, 56 and 57; "the editor stays over its label while the plane pans and zooms"; "the + and - keys zoom and start no label"; "typing with a view picked opens nothing and says why"; "the editor's keys are its own: Delete and Ctrl + Z change its text, not the model".
- **Screenshot.** `label-editor.png`.

### Package 2-4. Deleting, showing, and views

- **Delivers.** Delete; Remove from view; Show in this view, Show all, Show every…; New view, Delete view; the view's section of Details with its kind's options; the lines that say where an element is shown.
- **Answers to** criteria 3, 6 and 10; lines 24, 26 to 30, 45, 46 and 101.
- **Read first.** This plan: section 2 ("Where New view and Delete view are offered", "What happens to a note when its target is deleted, or replaced"), section 4 (seams 1, 2, 8, 9, 10 and 12), section 5 (its seven rows, "What an undo step holds", flows 5 and 6), section 9. `canvas/src/core/page/views.js`; `deleteSelection` in `canvas/src/core/page/panel.js`; `renderHead` and `renderViewFields` there, for what the panel says of a view and of where an element is shown.
- **Owns.** `core/actions/remove.ts`, `core/actions/views.ts`, `panels/ViewSection.tsx`, `panels/ShownSection.tsx`, `panels/view-section.css`, `canvas/app/test/remove-core.test.mjs`, `views-core.test.mjs`, `remove.test.mjs`, `views.test.mjs`, `view-section.test.mjs`.
- **Fills.** The rows `delete`, `remove-from-view`, `show-in-view`, `show-all`, `show-kind`, `new-view`, `delete-view` (section 5); `setViewOption` (seam 9); `ViewSection` and `ShownSection`, each with its `applies`. `panels/sections.ts` lists both already.
- **Decided.**
  - **Delete** takes every picked element with what it holds (`descendants`), every line on any of them, and their places in every view, in one `edit()`. With one thing picked the words are "Deleted <describe>"; with several, "Deleted 3 elements and 2 lines". Notes on what went are not touched. When there were any, it says "2 notes on it are kept in Notes." A picked view is not deleted by the Delete key (section 5's sentence).
  - **Remove from view** works on the view in front. A browser view shows every element, so it refuses there.
  - **Show in this view** offers what the old page's `showable` offers: what the kind admits and the view does not show, a border item only once its owner is shown. The place follows the old page's `showInView` for a graph view. For any other renderer the place is `placement(el, { x: 0, y: 0 })`, since those readers lay the view out themselves.
  - **Show all** and **Show every…** are for a grid view, as on the old page. The boxes come first, then the border items whose owner is a row.
  - **A new view** is `{ id, kind, name, doc: '', x, y, layout: {}, options }`: its id as the commands make ids, with the letter `v`; its name the first free of `view1`, `view2`…; its options a copy of the kind's; its `x` 96 to the right of the widest reach of the other views (each view's `x` plus the right edge of the widest of its boxes' places, and at least 480), its `y` that view's `y`. So the old page still lays the file out sensibly while it lasts.
  - **Delete view** refuses the only view. The free notes that float on the view stay, and find it again after Undo.
  - **`setViewOption`** checks the value against the option's row (its range, its values) and refuses in a sentence: "The row spacing is a number from 24 to 400." "A table needs a column, so name stays. Tick another column before taking this one away." Where the section can know beforehand that a choice is refused (the last ticked column of a table), that choice is greyed and carries the sentence. Changing a geometry view's unit also changes its scale, so that the drawing keeps its size, in the same step. Its words name the option and the view: "Set the row spacing of <view Y> to 64", "Sorted <view Y> by name", "Folded <part def X> in <view Y>".
  - **The view's section** shows, for a picked view: "<3 elements> shown · <general view>"; a list to pick what to show, with its button; Show all and Show every… for a grid; a widget for each `OptionRow` of the view's kind (a number field, radio buttons, ticked boxes); and Delete view. Every button is an `ActionButton`.
  - **The shown-in lines** say, for a picked element, "Shown in view1, view2", each name a link that brings that view to the front, or "Shown in no view. A view's Show list brings it in."; for a line, "Drawn in view1" or "Drawn in no view: none shows both ends." What a view shows is asked of its reader's `listed`.
- **Tests first.** `remove-core.test.mjs` and `views-core.test.mjs` (Node): each row's `applies` and `run` over the ten files, with one undo step each, undone and redone; "a new view stands to the right of the others on the old page's plane"; "setViewOption refuses a value outside its row, in a sentence". `remove.test.mjs`, `views.test.mjs`, `view-section.test.mjs` (the page): the names of lines 24, 26 to 30, 45, 46 and 101; "Delete with a view picked deletes nothing and says how a view is deleted"; "a new view's tab is in front and Details shows its name"; "Delete with several things picked is one undo step".
- **It names** `move.test.mjs › Backspace and Delete remove nothing` as the test of slice 1 it makes fail by design: Delete now deletes, and Backspace still does not.

### Package 2-5. Moving a box into another owner

- **Delivers.** A box dropped on another box that may hold it belongs to it. Dropped out on the ground, it belongs to none. One undo step with the move.
- **Answers to** criteria 3, 6, 9 and 10; lines 43 and 44.
- **Read first.** This plan: section 2 ("The change of owner is one step with the move"), section 4 (seams 2, 3, 4 and 12), section 5 ("What an undo step holds", flow 7), section 9. The graph renderer's `drag` and `drop` in `canvas/src/core/page/drawing.js` and `containerAt` in `canvas/src/core/page/layout.js`. `core/adapter.ts` (`placesFor`, rule 6 and what follows it; `projectStep`) and `plane/viewStore.ts` (a gesture's steps and its end), with their tests `step.test.mjs`, `move.test.mjs` and `viewStore.test.mjs`.
- **Owns.** `plane/viewStore.ts` and `core/adapter.ts`, from the scaffold's commit on; `core/actions/reparent.ts`; `canvas/app/test/reparent-core.test.mjs`, `reparent.test.mjs`.
- **Fills.**

  ```ts
  // core/actions/reparent.ts
  type Landing = { owner: string | null; place: Place; words: string } | { refused: string } | null;   // null: no change of owner
  function landingOf(session: Session, viewId: string, elementId: string, projection: Projection, middle: { x: number; y: number }): Landing;
  function land(model: Model, viewId: string, elementId: string, landing: Landing & { owner: string | null }): void;   // called inside the store's edit()
  ```

- **Decided.**
  - One box dragged alone can change owner. Several dragged together keep their owners. A border item never changes owner by dragging: it slides.
  - The box under the dragged box's middle that may hold it is the old page's `containerAt`: the smallest box whose kind can contain the dragged kind, never the box itself or one inside it.
  - While the middle is inside its owner, a step is today's. Once outside, the box follows the pointer and its owner no longer grows for it. The box it would land in carries a dashed teal outline.
  - The drop writes the owner, the element's new place in the model's order where the old page's `drop` moves it, and its place in the view, in one `edit()`. Words: "Moved <part p> into <part def D>", "Moved <part p> out onto the plane".
  - A kind that may not stand where it was dropped goes back, with the sentence the old page gives there. Where the old page gives none, the sentence is "<A fork> belongs inside an action def or an action, so it went back."
  - The four limits hold: a step asks `landingOf` only for a box whose middle has left its owner, and reads the model no more than a step reads it today.
- **Tests first.** `reparent-core.test.mjs` (Node): "landingOf gives the smallest box that may hold the dragged box, never itself or what it holds"; "a landing writes the owner and the place in one step, undone and redone"; "over the ten files, every box dropped on every other box lands or is refused as canContain says". `reparent.test.mjs` (the page): the two names of lines 43 and 44; "the box a dragged box would land in is outlined while it is over it"; "three boxes dragged together keep their owners". It names `move.test.mjs › a nested box cannot leave its owner, and the owner grows` as the test it makes fail by design.

### Package 2-6. Badges, and the checks while drawing

- **Delivers.** A node or a line with a problem shows a badge. The Validation panel says how many problems there are, keeps the focus in its list after Undo, and a click on an entry brings what it is about into the window.
- **Answers to** criteria 3, 7, 9 and 10; lines 59, 60, 62 and 63.
- **Read first.** This plan: section 4 (seams 2, 4, 8 and 12), section 5 (flow 8), section 6, section 9. `core/checks.ts`, `core/marks.ts`, `panels/Validation.tsx`. `check`, `drawBadges` and `markProblems` in `canvas/src/core/page/render.js`.
- **Owns.** `core/checks.ts`, `plane/marks/Badge.tsx`, `plane/marks/badge.css`, `panels/Validation.tsx`, `canvas/app/test/checks-entries.test.mjs`, `badges.test.mjs`, `validation-count.test.mjs`, `shots/badges.mjs`.
- **Fills.**

  ```ts
  // core/checks.ts
  interface Entry { list: string; message: string; about: Picked | null }      // contract 8
  function entriesOf(session: Session): readonly Entry[];                      // every list in one form; the same array while the result is the same
  // plane/marks/Badge.tsx
  function Badge(props: { marks: Marks; of: string }): JSX.Element | null;     // of: 'el:<id>' or 'rel:<id>'
  ```

- **Decided.**
  - `entriesOf` gives the entries of both lists, `problems` first, each with what a click selects (`aboutProblem`, `aboutDiagnostic`). `marksOf` counts an entry for a thing whatever list it is in (contract 7).
  - A badge shows when `marks.problems` is above 0. It carries `data-testid="badge"` and `data-pass`. Its tooltip lists the thing's sentences, read from `entriesOf` when the pointer comes over it, through `useBody().session`. No node reads the entries otherwise.
  - A click on a badge is a click on its node or line.
  - The panel's first line says the count: "2 problems, 1 broken rule", or "No problems found."
  - A click on an entry picks what it is about, brings the first view that shows it to the front when the view in front does not, and brings the thing into that view's window (`hands.showView`, `hands.reveal`, with the rectangle its reader's `listed` gives).
  - The checks' pause, and what runs at once, stay as slice 1 has them.
- **Tests first.** `checks-entries.test.mjs` (Node): "entriesOf gives every problem and every broken rule in one form, each with what it is about"; "the entries are the same array while the result reads the same". `badges.test.mjs`, `validation-count.test.mjs` (the page): the four names of lines 59, 60, 62 and 63; "a badge is 16 px on the screen at 50% and at 200%"; "a badge goes with Undo"; "the list keeps the keyboard's focus after Undo".
- **Screenshot.** `badges.png`.

### Package 2-7. Notes and the archive

- **Delivers.** The Notes panel: the open notes, each with Claude's answer when it has one, and the archive under them. A note on a node, on a line, or free on a view. A pin with the note's number, which can be dragged to another target or to the ground. Archive and Restore. The notes in the saved file.
- **Answers to** criteria 1, 3, 6, 7, 8 and 10; lines 6 and 64 to 76.
- **Read first.** This plan: section 2 (the decisions about notes, and the rule that gives a point of the old plane its view), section 4 (seams 2, 4, 6, 8, 10, 11 and 12), section 5 (the note rows of the table, and flow 9), section 6, section 9. Contract 9 of `plan/architecture.md`. `canvas/src/core/page/state.js`, lines 43 to 75 (`isNote`, `tidyNote`, `tidyArchived`, `byNumber`, `nextNumber`); `canvas/src/core/page/notes.js`; the notes, pins and archive of `canvas/src/annotations/page.js` (lines 32 to 240); `syncNoteLabels` in `canvas/src/core/page/panel.js`. `canvas/src/annotations/lib.js` (`noteRecords`, `noteStatements`: how a note reaches the text). `core/session.ts`, `core/files.ts`, `core/marks.ts`, `views/bodyContext.ts`, `shell/ActionControl.tsx`.
- **Owns.** `core/notes.ts`, `core/actions/notes.ts`, `panels/Notes.tsx`, `panels/notes.css`, `plane/marks/Pin.tsx`, `plane/marks/pin.css`, `plane/gestures/pin.ts`, `canvas/app/test/notes-core.test.mjs`, `notes.test.mjs`, `pins.test.mjs`, `archive.test.mjs`, `shots/notes.mjs`.
- **Fills.** `notesOf` (seam 11), in place of the scaffold's pass-through; the rows `add-note`, `show-note`, `archive-note`, `restore-note`, `delete-note`, and beside them:

  ```ts
  // core/actions/notes.ts
  function canCarry(session: Session, picked: Picked): true | string;                     // an element with no name in the text can carry no note
  function dropPin(session: Session, noteId: string, hit: Hit, inside: boolean): void;    // a pin's release; says a refusal
  // plane/gestures/pin.ts
  interface PinGesture {
    readonly state: { note: string; client: { x: number; y: number }; over: Hit | null; fits: boolean } | null;
    press(noteId: string, pointer: { client: { x: number; y: number }; pointerId: number }, body: BodyHands): void;
    cancel(): void;                                                                       // Escape, through gesturesOf(session)
    listen(listener: () => void): () => void;
  }
  function pinOf(session: Session): PinGesture;
  // plane/marks/Pin.tsx:  Pins({ marks, of }),  FreePins({ session, viewId })       panels/Notes.tsx:  NotesPanel()
  ```

- **Decided: the records.**
  - **A note** is contract 9's record. A file's note is read as the old page reads it: `isNote` says what is a note, and what is none is left out; `tidyNote` and `tidyArchived` keep the record's keys and no other. The three are written again in `core/notes.ts`: the old page's `str` is not among the model library's names. A number is kept as the file has it, 0 when it has none.
  - **A new note**: its id is `n`, then the time in base 36, then five characters at random; its number is the largest among the open and the archived notes, plus one; its text is empty; `by` is `user`; `targetLabel` is the library's `labelFor(model, id)`, or "the plane" for a free note.
  - **A free note in a state file** follows section 2's rule, for an open note and for an archived one. A new or a moved free note's place is in whole numbers. A free note whose view has left the model is saved with that view's last `x` and `y` added.
  - **A note on something that left the model is kept.** `open` still holds it. The panel lists it "on <its kept label>, which is no longer in the model", or "on something no longer in the model" when it kept no label. It has no pin, and the text leaves it out, as the model library does today. When Undo brings its target back, the pin is there again. A free note whose view left the model is listed "on a view no longer in the model".
  - **A note's label follows a rename.** After a change of the model, each open note whose target is in the model and whose `targetLabel` is not `labelFor` gets the new label, and the listeners are told. This does not change `mark()`: the change of the model already made the file unsaved, and Undo puts the label back the same way. Nothing is synced when a file is opened. (Contract 9's comment says the label is "as it was when the note was written"; Damon approved keeping the old page's way, section 12.)
  - **No step.** No change to a note is undone by Undo. Each changes `mark()`.
- **Decided: the panel.**
  - With no file: "No file is open." With no note: "No notes yet. Right-click a box, a line or the plane and choose Add note." An Add note button, an `ActionButton` for `add-note` with no hit, stands at the top right of the panel.
  - Each open note is a card (`data-testid="note"`, `data-note` its id), in the order of the numbers: its number as a round `ActionButton` for `show-note`; "on <what it is on>"; its text in a box that grows with it, read-only for a note Claude wrote; Claude's answer under it after "Claude:"; then one line: "From Claude · " when Claude wrote it, "Added <when>", and " · resolved" for a resolved note. A time is the browser's own short form: `toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })`. A resolved card carries `data-resolved="true"` and is drawn subdued.
  - Archive, shown on a resolved note only, and Delete are icon `ActionButton`s at the card's top right, each with the note's id as its `choice`.
  - "Archive · N" under the notes (`data-testid="archive-list"` on the list it opens) is there only while something is archived. An archived note is read-only: its number, "on <what>", its text, "Resolved: <resolution>" when there is one, "Archived <when> · added <when>", and Restore.
  - The pointer over a card, or the caret in its text, calls `point(id)`; leaving calls `point(null)`.
  - When `attended` names a note, the panel puts the caret into its text, scrolls it into view, and calls `attend(null)`. It does this after the frame in which it heard, so that a menu that just closed has given the focus back first.
- **Decided: the actions.**
  - `add-note` (flow 9). `canCarry` refuses an element whose `textName` is null: "<A start> can't carry a note. Note the element it belongs to instead."
  - `show-note`: for a note on something, the thing is picked; the view in front when it shows the thing, else the first view in the model's order whose reader lists it, is brought to the front; and the thing is brought into its window (`hands.reveal`, with its `listed` rectangle; for a line, the rectangle around its two ends' rectangles). For a free note its view comes to the front and its point is brought into the window; nothing is picked. The refusals are section 5's.
  - `archive-note` keeps the note with `archived` (now) and `resolution` (Claude's answer). `restore-note` takes those two keys off; the note is still resolved. `delete-note` takes the note away.
- **Decided: a pin.**
  - Section 6 gives its look. `Pins` draws one pin for each of `marks.pins`, each with `data-testid="pin"`, `data-note` (the note's id), `data-pass`, and `data-resolved` or `data-hot` when it is. A hot pin has a ring of 2 px in the ink. A resolved pin is grey: on something, a grey ground; free, a grey border. `FreePins` draws `marksOf(session).free(viewId)` the same way.
  - A pin's press, its drag and its click are flow 9's. While it is dragged the pin follows the pointer and what it is over is outlined. A drop on what the note is on already changes nothing and says nothing. A drop on an element that can carry no note: "<A start> can't carry a note. Drop the pin on the element it belongs to instead."
  - Moving a pin says nothing when it works: the pin shows it.
- **Tests first.** Each name is in the file given.
  - `notes-core.test.mjs` (Node): "a file's notes are read as the old page reads them, and what is no note is left out"; "the free note of the annotations fixture floats on its view at 1100, 330 and is saved with the numbers it had"; "in a made-up file of three views, each point is given the view the rule names, and a note that was not moved is saved with its numbers"; "a new note takes the largest number plus one, counting the archive"; "a note's label of what it is on follows a rename" (line 75); "Undo takes back no change to a note, and a note on something deleted is kept and finds it again after Undo" (line 76: the element leaves by `history.edit()`, the note stays in `open`, the text leaves it out and holds it again after `undo()`); "the session is unsaved after a change to a note, and saved again after a save"; "a rename and its Undo leave a saved file saved"; "a note whose target names nothing is accepted, is in open, and is left out of the text".
  - `notes.test.mjs` (the page): the names of lines 6, 64 to 68 and 72; "with no note the Notes panel says how to add one"; "a note written by Claude cannot be edited" (a made-up file: no fixture holds one).
  - `pins.test.mjs` (the page): the names of lines 69 to 71; "a pin dropped on a start is refused, goes back, and the page says why"; "a pin let go outside the plane goes back and says nothing"; "a pin is 22 px on the screen at 50% and at 200%"; "a click on a pin picks nothing"; "the pointer over a note in the panel marks its pin".
  - `archive.test.mjs` (the page): the names of lines 73 and 74; "an archived note keeps its number, and a new note takes the next".
- **It names** `files.test.mjs › the notes and the archive are written as the file has them` as the test of slice 1 it makes fail by design: what is no note is now left out, and a note keeps only the record's keys.
- **If `core/marks.ts` gives a pin wrongly**, that file is the scaffold's: stop and say what it gives and what it should.
- **Screenshot.** `notes.png`, rated.

### Package 2-8. Code links in Details

- **Delivers.** The Code section: add, remove and edit an element's links, each change one undo step.
- **Answers to** criteria 3, 6 and 10; lines 77 to 79.
- **Read first.** This plan: section 4 (seams 5, 8, 9 and 12), section 5 (the rows `add-code-link` and `remove-code-link`, "What an undo step holds", flow 10), section 9. Contract 10. `renderCodeSection` and `codeItem` in `canvas/src/annotations/page.js` (lines 322 to 456); `tidyCode` and `codeLines` in `canvas/src/annotations/lib.js`.
- **Owns.** `core/codeLinks.ts` (the scaffold built `codeRowsOf` in it), `core/actions/code.ts`, `panels/CodeSection.tsx`, `panels/code-section.css`, `canvas/app/test/code-links-core.test.mjs`, `code-links.test.mjs`.
- **Fills.**

  ```ts
  interface CodeLink { path: string; language: string; text: string }
  const CODE_LANGUAGES: readonly string[];       // typescript, javascript, json, css, html, sysml, kerml, markdown, shell, other
  interface CodeLinks {
    readonly links: readonly CodeLink[];
    add(): Touched | null;                       // no path, typescript, no text
    remove(index: number): Touched | null;
    change(index: number, field: keyof CodeLink, value: string, key?: string | null): Touched | null;
  }
  function codeLinksOf(session: Session, elementId: string): CodeLinks;
  ```

- **Decided.** Nothing but `core/codeLinks.ts` knows that the links are the element's `code` list. Words: "Added a code link to <describe>"; "Removed the code link <path> from <describe>"; "Set the language of code link 2 of <describe> to json"; "Wrote the path of code link 2 of <describe>". Typing a path or a text is one run, with the key `code:<element>:<index>:<field>`, ended when the field is left. A link with neither path nor text is kept. A language a file brought that is not in the list stays, as one more choice. The section says under its title: "Each link is written into the text as a textual representation inside the element."
- **Tests first.** `code-links-core.test.mjs` (Node): "each change to a link is one undo step, undone and redone, over the files that hold links"; "typing a path is one run"; "codeRowsOf gives each link's words". `code-links.test.mjs` (the page): the three names of lines 77 to 79; "the section shows for an element that can hold links, and for nothing else".

### Package 2-9. The text tab

- **Delivers.** A tab that shows the model's text, read-only, with Copy, and above the text what keeps it from being correct. An action opens it.
- **Answers to** criteria 3, 6, 7 and 10; lines 80 to 82.
- **Read first.** This plan: section 4 (seams 8, 10, 11 and 12), section 5 (the rows `open-text` and `copy-text`, flow 11), section 6, section 9. Contract 13. `canvas/src/core/page/export.js`; `canvas/export.mjs` (the same text, printed on Claude's side).
- **Owns.** `core/text.ts`, `core/actions/text.ts`, `views/TextTab.tsx`, `views/text-tab.css`, `canvas/app/test/text-core.test.mjs`, `text.test.mjs`, `shots/text-tab.mjs`.
- **Fills.** `exportText(session): Promise<TextResult>` (contract 13); the rows `open-text` and `copy-text`; `TextTab({ session })`.
- **Decided.** The text is the model library's `toSysML(model, notes, archive)`, with the notes as `notesOf(session).file()` gives them, and the problems are `validate(model)`'s sentences, worked out at that moment. The function is asynchronous from the start and never answers `unavailable` in this slice; the tab still shows the sentence of an `unavailable` answer where the text would be, so slice 4 changes no caller. The tab reads the text when it is shown, and again 0.8 s after the last change of the model or of a note. Copy says "Copied the model as textual SysML v2.", or section 5's sentence when the browser refuses.
- **Tests first.** `text-core.test.mjs` (Node): "exportText gives, for each of the ten files, the text canvas/export.mjs prints, byte for byte"; "the problems are validate's sentences". `text.test.mjs` (the page): the three names of lines 80 to 82; "the text follows a change of the model after the pause"; "the text cannot be typed into, and can be selected".
- **It names** `shell.test.mjs › no header palette or button row exists` as a test of slice 1 it may make fail by design: the top bar gains one icon button, Text.
- **Screenshot.** `text-tab.png`.

### Package 2-10. The sequence view

- **Delivers.** A sequence view drawn by its own body: lifelines, events, messages in their order, successions. Its tools. A lifeline dragged sideways, an event along its lifeline, a message moved up or down. The order field of Details unlocked.
- **Answers to** criteria 2, 3, 5, 6, 7, 8 and 10; lines 86 to 91.
- **Read first.** This plan: section 2 ("The sequence view and the geometry view: a graph body each"), section 4 (seams 1, 2, 3, 4, 6, 7, 8, 9 and 12), section 5 (the rows `message-up` and `message-down`, "What an undo step holds", flows 12 and 16), section 6, section 9. Contracts 5 and 6. `plan/spikes/sequence/README.md` and its `layout.js`, which is the old layout already ported to a pure function, and its `a-body.jsx`, which is the body's shape (a probe's code: read it for the shape, and write the page's own). `canvas/src/sequence/page.js` (the layout rule, `place`, `drag`, `drop`, `insertEvent`, `sortMessages`, `moveMessageRow`, the `order` hook) and `canvas/src/sequence/lib.js` (`messagesInOrder`, `eventOrder`). `core/readers/index.ts`, `core/readers/graph.ts`, `views/bodies.ts`, `plane/viewStore.ts`, `plane/nodes/SmallNode.tsx` (the event's shape exists), `plane/edges/LineEdge.tsx`, `plane/nodes/Grips.tsx`.
- **Starts from** the commit that holds packages 2-2 to 2-9 (section 9): its tests use a line dragged from a grip, a label edited in place, the view's section, a badge and a pin.
- **Owns.** `core/readers/sequence.ts`, `core/actions/sequence.ts`, `panels/hooks/sequence.ts`, `plane/nodes/sequence/` (`index.ts`, `LifelineNode.tsx`, `MessageEdge.tsx`, `sequence.css`), `canvas/app/test/sequence-reader.test.mjs`, `sequence.test.mjs`, `shots/sequence.mjs`.
- **Fills.**

  ```ts
  // core/readers/sequence.ts
  type SequenceStep = { kind: 'lifeline'; id: string; x: number } | { kind: 'event'; id: string; y: number } | { kind: 'message'; id: string; y: number };
  const sequenceReader: Reader<Projection>;     // read, sizeOf, listed, at, and step for a node's drag (a head, an event)
  function sequenceStep(lib: SysMLModelLibrary, model: Model, view: ModelView, start: Projection, step: SequenceStep): Projection;   // the view as a step leaves it; a message's drag calls it
  function sequenceResult(projection: Projection): SequenceEnd | null;       // what the last step would write: a head's x; an event's place among its lifeline's events; a message's row
  // core/actions/sequence.ts
  const place: Placer;                          // a lifeline, an event (seam 1)
  const end: Ender;                             // a head's or an event's drop (seam 3)
  function moveMessage(session: Session, viewId: string, relId: string, row: number): Outcome;   // a message to a row, one edit()
  // the rows message-up and message-down
  // panels/hooks/sequence.ts:  SEQUENCE_HOOKS, with the order hook
  // plane/nodes/sequence/index.ts
  const nodeTypes: NodeTypes;                   // lifeline (a head), lifeline-line (its dashed line); an event is slice 1's `event`
  const edgeTypes: EdgeTypes;                   // message; a succession is slice 1's `line`
  ```

- **Decided.**
  - **The body is the probe's candidate A**, built in the page's own files, by the rules section 2 takes from the probe:
    - A lifeline is two nodes. Its head has the element's id as its node id, takes clicks and drags, and carries the marks and the anchor. Its line is `<id>:line`, as tall as the view, `zIndex: -1`, with `selectable: false` and `draggable: false`; its `data.element` is the lifeline's id too. It takes the pointer along a strip 16 px wide down the dashed line, and nowhere else, so that a click, a drop of a line or of a pin, and a tool's click on the dashed line count for the lifeline, and a drag there pans the plane.
    - An event is a child node of its lifeline's line node.
    - A message and a succession are edges with `zIndex: 1`. An edge ends on an event's node when its end is a drawn event, else on the lifeline's line node. A message's `data` holds `sy` and `ty` (how far under each of those nodes' tops its line runs), `self`, `dotA`, `dotB` and its label; the edge works its line out from its two nodes' rectangles, as `LineEdge` does.
    - A message's drag is its edge's own gesture (seam 3): `pointerdown` on its line or its label, the pointer followed on the window, `sequenceStep` for each step, the store's `preview`, and `moveMessage` at the release. A press that does not go 4 px is a click on the message. The gesture calls `body.swallow()` once it has moved.
  - **The layout is the old page's**, ported into the reader: the lifelines are the shown parts, left to right by their `x`, heads that would overlap moved 24 apart; each head at the top with a dashed line down; one row for each message whose two ends reach a shown lifeline, in `messagesInOrder`'s order, a row spacing apart (the view's `spacing`, 56 unless set, from 24 to 400); an event on the row of the first drawn message that starts or ends on it, else where it was put, kept 20 from its neighbours; a message back to its own lifeline as a loop 48 out; a succession between two drawn events as a straight line from dot to dot. Places are counted from the view's origin.
  - **`at(data, point)`** answers `{ lifeline: string; y: number; before: string | null } | null`: the lifeline whose head, dashed line (within 24 of it) or event lies at the point, and the event the point is above, or null below the last. Only `core/actions/sequence.ts` reads it (contract 5).
  - **A step** of a head's or an event's drag reads the model as the drop would leave it, so the other heads and events make room; only the dragged thing is at the pointer. Each projection gives back the same object for a head, an event, a message or a succession that reads the same as before.
  - **The tools.** A part placed in the view is a new lifeline at the click's `x`, owned as the view's first lifeline is. An event is placed on the lifeline `at` gives, at the click's height, and is put among the lifeline's events by height (`insertEvent`). With no lifeline at the click: "Click a lifeline, the dashed line under a part's head, to put an event on it." A message and a succession are drawn by `draw`, by their tools or by dragging from a grip.
  - **A lifeline's head moves sideways only**, and its drop writes its `x`: "Moved <part p>". **An event moves along its lifeline only**; its drop puts it among the lifeline's events by height, in the model's order: "Moved <event e> among the events of <part p>". An event that sits on a message's row goes back: "<Event e> sits on the row of the <message m>. Set the message's order to move it."
  - **A message moves a row** by `message-up` and `message-down`, by their keys, and by dragging its line up or down past the next row. Every message first gets its place in time as its `order`, then the two trade numbers, and the model's relationships are put in the messages' time order (`sortMessages`), in one `edit()`: "Moved the <message m> up a row". At the first or the last row: "The <message m> is already the first row."
  - **The `order` hook** of `panels/hooks/sequence.ts` replaces the locked one: writing a message's order also sorts the model's messages, in the same step.
  - **Marks and anchors.** A head, an event and a message's label carry `data-label`. Badges and pins sit on a head's top right corner, beside an event's dot, and at a message's middle. A selected message shows a grip at each end (criterion 5).
  - **A line that is no message and no succession** between two lifelines is not drawn in a sequence view, and `listed` does not list it.
- **Tests first.** `sequence-reader.test.mjs` (Node): "the reader lays the sequence fixture out as the old page's layout does, to the pixel" (against rectangles and rows written down from `plan/spikes/sequence/layout.js` run on the fixture); "a message back to its own lifeline is a loop, and a succession joins two dots"; "at() finds the lifeline and the place among its events at a point"; "a step holds a head to its row and an event to its lifeline"; "listed gives each head, event, message and succession once". `sequence.test.mjs` (the page): the six names of lines 86 to 91; "an event dropped where a message holds it goes back, and the page says why"; "the first row cannot move up, and the page says why"; "a message is dragged a row down by its line"; "a message's end is dragged to another lifeline in a sequence view, and its label and its note are kept"; "a message is drawn by dragging from a head's grip to another lifeline's dashed line"; "a marquee picks the heads, events and messages it covers".
- **It names** as the tests of slice 1 it makes fail by design: `open.test.mjs › the example and the nine fixtures each open: 17 tabs, 11 planes, 6 cards, nothing logged` (the sequence view's card), `tools-panel.test.mjs › a view no plane draws has no tools here`, and the locked order of a message in `fieldHooks.test.mjs` and `details-fields.test.mjs`.
- **Screenshot.** `sequence.png`, rated.

### Package 2-11. The geometry view

- **Delivers.** A geometry view drawn by its own body: shapes to scale, a coordinate frame with a scale bar, and a drag that changes a position in the model. Its tools.
- **Answers to** criteria 2, 3, 6, 7, 8 and 10; lines 92 to 96.
- **Read first.** This plan: section 2 ("The sequence view and the geometry view: a graph body each"), section 4 (seams 1, 2, 3, 4, 7, 8, 9 and 12), section 5 ("What an undo step holds", flows 13 and 16), section 6, section 9. Contracts 5 and 6. `plan/spikes/geometry/README.md` and its `layout.js`, which is the old layout already ported to a pure function, and its `a.jsx`, which is the body's shape (a probe's code: read it for the shape, and write the page's own). `canvas/src/geometry/page.js` (`geoFootprint`, `geometryLayout`, `drawGeometryAxes`, `drawFootprint`, `place`, `drag`, `drop`, `geoRound`) and `canvas/src/geometry/lib.js` (`geoDims`, `geoUnitOf`, `geoConvert`, `geoPlaced`, `geoNumber`, `GEO_UNITS`). `core/readers/index.ts`, `core/readers/graph.ts`, `views/bodies.ts`, `plane/viewStore.ts`.
- **Starts from** the commit that holds packages 2-2 to 2-9 (section 9): its tests use a label edited in place, the view's section, a badge and a pin.
- **Owns.** `core/readers/geometry.ts`, `core/actions/geometry.ts`, `panels/hooks/geometry.ts`, `plane/nodes/geometry/` (`index.ts`, `FootprintNode.tsx`, `AxesNode.tsx`, `geometry.css`), `canvas/app/test/geometry-reader.test.mjs`, `geometry.test.mjs`, `shots/geometry.mjs`.
- **Fills.**

  ```ts
  // core/readers/geometry.ts
  const geometryReader: Reader<Projection>;     // read, sizeOf, listed, at, and step for a footprint's drag
  function geometryResult(projection: Projection, id: string): { posX: number; posY: number; unit: string } | null;   // the position a dragged footprint has at this step, rounded
  // core/actions/geometry.ts
  const place: Placer;                          // a box of one unit at the click (seam 1)
  const end: Ender;                             // a footprint's drop writes posX and posY (seam 3)
  // panels/hooks/geometry.ts:  GEOMETRY_HOOKS
  // plane/nodes/geometry/index.ts
  const nodeTypes: NodeTypes;                   // footprint, axes
  const edgeTypes: EdgeTypes;                   // none: a plan draws no line
  ```

- **Decided.**
  - **The body is the probe's candidate A**, built in the page's own files, by the five rules section 2 takes from the probe:
    - A footprint's node carries `style: { pointerEvents: 'none' }`, and its outline, its words and its marks take the pointer. So a circle is hit inside the circle only.
    - The outline is SVG inside the node, put in its place by a `transform`, never a box sized by CSS.
    - The node's rectangle covers everything the footprint draws: its words under it and its marks over it. `listed` and the marquee use the outline's rectangle.
    - A node's `zIndex` is its place in the drawing order. The registry's entry sets `flow: { elevateNodesOnSelect: false }`, so a picked footprint is not raised over what lies on it.
    - The plane has no snap grid, and the reader counts on none.
  - **The axes are one node** with `data.element` null, `selectable: false` and `draggable: false`, which takes no pointer.
  - **y up and an owner's origin never reach React Flow.** The reader lays the view out in the view's units, y down, and gives each node its top left corner from its parent node's top left corner. So when an owner's size changes, what it holds gets a new place though no part moved. A footprint may lie outside its owner's rectangle.
  - **The layout is the old page's**, ported into the reader: each spatial element the view shows is its shape's footprint to scale, x to the right and y up from the view's origin; a Box or a Rectangle stands on its origin corner, length along x and width along y; a round shape is centred on its origin; a part's position is in its owner's frame when the owner is shown too; a part with no shape, or without the dimensions the plan needs, is drawn dashed at its kind's usual size and says why ("no shape yet", "Box · set its length and width"). One unit of the view is `scale` pixels (40 unless set), and a part in another unit is converted.
  - **The words** of a footprint are two lines: «part» and its name line; its shape with its dimensions and unit ("Box 2 × 1 × 0.75 m"). They are inside a footprint of at least 120 by 44, and under a smaller one.
  - **The coordinate frame** is at the view's origin: the x and y axes, 96 long, with their names, and under the x axis a scale bar of the shortest of 1, 2, 5 × 10ⁿ units that is at least 40 px long, reading as "1 m". It is drawn over the footprints, takes no click and cannot be dragged. An empty view shows it alone.
  - **`at(data, point)`** answers `{ owner: string | null; x: number; y: number; unit: string }`: the innermost footprint at the point that can hold a part, and the point in that footprint's frame, or in the view's, in the view's unit.
  - **The tools.** A part or an item placed in the view is a Box of 1 by 1 by 1 of the view's unit, centred on the click, owned by the footprint `at` gives.
  - **A footprint is dragged**, with what it holds. Each step rounds the position to what a pixel is worth in the part's own unit and one digit more (`geoRound`), so the plane's snap plays no part. The drop writes `posX` and `posY`: "Moved <part p> to 1.5, 2 m". The owner does not change by a drag in a plan. A footprint has no resize handles: its dimensions are fields of Details.
  - **`panels/hooks/geometry.ts`** holds what the spatial fields' rows cannot say. If they need no hook, the file says so and its table stays empty.
  - **Marks and anchors.** A footprint's name carries `data-label`. Badges and pins sit on a footprint's top edge.
  - **A circle takes clicks inside the circle only.** A click in the corner of its square falls to what lies under it.
- **Tests first.** `geometry-reader.test.mjs` (Node): "the reader lays the geometry fixture out as the old page's layout does, to the pixel" (against rectangles written down from `plan/spikes/geometry/layout.js` run on the fixture); "a part in millimetres in a view in metres is drawn to the view's scale"; "a part with no shape is dashed and says why"; "the scale bar is the shortest of 1, 2, 5 × 10ⁿ units at least 40 px long, at five scales"; "a step rounds a position to a pixel's worth in the part's unit"; "listed gives each footprint once". `geometry.test.mjs` (the page): the five names of lines 92 to 96; "a click in the corner of a circle's square does not pick the circle"; "a footprint dropped at 50%, 100% and 200% zoom lands within a pixel's worth of the pointer"; "a footprint has no resize handle"; "a picked footprint does not cover one that lies on it"; "a footprint just outside the window keeps its words while they are in the window" (in a view of more than 300 footprints, made up in the test).
- **It names** as the tests of slice 1 it makes fail by design: `open.test.mjs › the example and the nine fixtures each open: 17 tabs, 11 planes, 6 cards, nothing logged` (the geometry view's card) and `tools-panel.test.mjs › a view no plane draws has no tools here`.
- **Screenshot.** `geometry.png`, rated.

### Package 2-12. The grid view

- **Delivers.** A grid view as a table of elements, with the columns the view chooses and a sort by a click on a header, or as a matrix of the relationships between its elements.
- **Answers to** criteria 2, 3, 7, 8 and 10; lines 97 to 100 and 102.
- **Read first.** This plan: section 4 (seams 1, 2, 4, 5, 8, 9, 11 and 12), section 5 (flow 14), section 6, section 9. Contracts 5 to 9 of `plan/architecture.md`. `canvas/src/grid/page.js` (the cells' words, the rows' order, the matrix: `gridCell`, `gridPath`, `gridName`, `gridRelLabel`, `gridRows`, and its measures at lines 14 to 20) and `canvas/src/grid/lib.js` (`gridOptions`, `GRID_COLUMNS`). `core/readers/index.ts`, `views/bodies.ts`, `views/BodyFrame.tsx`, `views/bodyContext.ts`, `core/marks.ts`, `core/checks.ts` (`entriesOf`), `core/codeLinks.ts` (`codeRowsOf`), `core/actions/views.ts` (`setViewOption`), `panels/explorerRows.ts` (`ROWS_SHOWN`).
- **Starts from** the commit that holds packages 2-4, 2-6 and 2-7 (section 9): its tests use the view's section, a badge and a pin.
- **Owns.** `core/readers/grid.ts`, `views/GridBody.tsx`, `views/grid-body.css`, `canvas/app/test/grid-reader.test.mjs`, `grid.test.mjs`, `shots/grid.mjs`.
- **Fills.**

  ```ts
  // core/readers/grid.ts
  const GRID_ROW = 28, GRID_HEAD = 32, GRID_MARKS = 72;                  // a row's and the header's height, and the room for marks at a row's right end
  const GRID_WIDTHS: Readonly<Record<string, number>>;                    // each column's width: kind 120, name 180, type 160, multiplicity 96, owner 200, doc 320, specializes 160, notes 80, code 240, problems 320
  const MATRIX_SIDE = 200, MATRIX_CELL = 96;                              // a matrix's side column, and a cell's width
  interface GridRow { id: string; className: string; cells: readonly string[] }   // one shown element; className: 'def' or 'usage', and 'abstract'; cells in the columns' order
  interface GridCell { from: string; to: string; lines: readonly { id: string; sign: string; words: string }[] }
  interface GridData {
    view: string; mode: 'table' | 'matrix';
    columns: readonly { key: string; title: string; width: number; sorted: 'up' | 'down' | null; added: boolean }[];   // a matrix has none; added: the body fills the cell
    sort: { key: string; down: boolean } | null;
    rows: readonly GridRow[];                     // a table's rows, in the model's order or the sort's; empty in a matrix
    heads: readonly { id: string; className: string; words: string }[];   // a matrix's elements, in the same order: down the side and along the top
    cells: readonly GridCell[];                   // a matrix's pairs that have a line between them
  }
  const gridReader: Reader<GridData>;
  function orderRows<T extends { id: string }>(rows: readonly T[], wordOf: (row: T) => string, down: boolean): T[];   // the sort's one rule: by the words, those with none last either way
  // views/GridBody.tsx
  const GridBody: (props: BodyProps) => JSX.Element;     // in place of null
  ```

- **Decided: the reader.**
  - **It reads the model only.** A reader never reads the notes or the checks (contract 7). So for the columns `notes` and `problems` it gives a column with `added: true` and empty cells, and the body fills them. When the sort is by one of those two, the reader leaves the rows in the model's order and the body orders them with `orderRows`.
  - **A cell's words** are the old page's `gridCell`: kind is the keyword; name the name, "(unnamed)", or the kind's label for a kind with no name in the text; type what it is defined by, with `~` when conjugated; owner the dotted path (`gridPath`); and so on. The `code` cell is `codeRowsOf`'s rows joined by a comma. A column's `title` is its key.
  - **The sort** is the view's option `sort`: null, a column's key, or the key after `-` for descending. A sort by a column that is not shown still orders the rows, and no header shows it.
  - **A matrix** has no rows: `heads` are the shown elements, each by its dotted path, in the order the rows would have. A cell holds the lines from the row's element to the column's, hidden ones too, as on the old page: ":>" for specializes, ":" for defined by, "—" for a connection, else the kind's label, with `describeRel`'s words. An element against itself has no cell.
  - **`sizeOf`**: a table is the sum of its columns' widths and `GRID_MARKS` wide, and `GRID_HEAD` and every row's `GRID_ROW` high, whatever part of it is shown. A matrix is `MATRIX_SIDE` and a cell for each head wide, and `GRID_HEAD` and a row for each head high.
  - **`listed`**: a table's rows, each an `el` with its keyword and name as words and its rectangle (x 0, y `GRID_HEAD` + i × `GRID_ROW`, the table's width, `GRID_ROW` high); a matrix's heads the same way, by their side row, and each line of each cell a `rel` with its cell's rectangle.
- **Decided: the body.**
  - **It is drawn inside `BodyFrame`**, which gives it its clicks, its right-click palette and its context. It calls `readView(session, viewId)` when it is shown and after each change the history tells of that can have altered the view, and draws again when `marksOf(session).listen` tells.
  - **The table** is Material UI's `Table`, dense, with the role it has by itself (not `grid`, whose keys the page leaves alone). The header row stays at the top while the rows scroll. Each column has its width from the data; a cell's text is cut with an ellipsis and whole in its title. A rule parts the rows. A picked row is on the soft teal.
  - **The two added columns.** `notes`: the numbers of the pins on the element, as "1, 4" (`marksOf(session).of('el', id).pins`). `problems`: the element's sentences from `entriesOf(session)`, whatever list each is in, one after another with a space between; empty when there is none.
  - **A row** carries `data-thing="el:<id>"` and shows `Badge` and `Pins` at its right end, in the room `GRID_MARKS` keeps. Nothing in a grid carries `data-label`.
  - **A header** carries `data-column`. A click sorts: by that column, then the other way, then the model's order again, each through `setViewOption(session, viewId, 'sort', …)`. It shows ▲ or ▼.
  - **A matrix**: the side heads are rows that carry `data-thing="el:<id>"`, take a click and show their marks; the heads along the top are words only. In a cell each line is its sign, an element that carries `data-thing="rel:<id>"` and takes the click for that line, with its words as its title and its marks beside it. The corner cell sorts by name, in the same three steps.
  - **The free notes** of the view are `FreePins`, inside the scrolling content, whose top left corner is the view's origin.
  - **An empty grid** says: "No rows yet. Pick the view and use Show all, or its Show list, in Details."
  - **A long table** shows its first 200 rows and a last row "Show more (N not shown)", which shows 200 more, as the Explorer does (`ROWS_SHOWN`).
  - **What is kept outside React**, for the session and the view's id: the scroll place and how many rows are shown. `BodyFrame`'s `onShown` puts the scroll place back when the tab is shown again, and its `reveal` scrolls a row into the window.
- **Tests first.**
  - `grid-reader.test.mjs` (Node): "the rows are the view's shown elements, in the model's order or the sort's, with nothing in the sorted column last"; "each cell says what the old page's table says, for every column, over the grid fixture with a code link added" (the expected words written by hand); "a kind with no name in the text is named by its kind's label"; "a matrix's cells hold the lines between its elements, hidden ones too, with their signs"; "sizeOf and listed give a table's and a matrix's measures"; "a row that reads the same is the same object after a change elsewhere".
  - `grid.test.mjs` (the page): the names of lines 97 to 100 and 102 (for line 98 the last ticked column's box is greyed and carries the sentence; for line 100 the mode is switched in the view's section; for line 102 the test first makes a problem by a rename); "the notes and problems columns say an element's notes and problems"; "the header stays in place while the rows scroll" (in a window 400 px high); "an empty grid says how to add rows" (a made-up file); "a tab shown again is scrolled where it was"; "a table of more than 200 rows ends in Show more".
- **It names** `open.test.mjs › the example and the nine fixtures each open: 17 tabs, 11 planes, 6 cards, nothing logged` as the test of slice 1 it makes fail by design (the two grid views' cards).
- **Screenshot.** `grid.png`, rated.

### Package 2-13. The browser view, and renaming in a tree

- **Delivers.** The browser view as the Explorer's tree under chosen roots. A row renamed by typing, in the Explorer and in a browser view.
- **Answers to** criteria 2, 3, 7, 8 and 10; lines 58 and 104 to 106.
- **Read first.** This plan: section 4 (seams 1, 2, 4, 7, 8, 9 and 12), section 5 (the row `expand-all`, flows 4 and 15), section 6, section 9. Contracts 5, 6 and 12. `canvas/src/browser/page.js` (what a row says, folding, the roots, the empty tree's two sentences) and `canvas/src/browser/lib.js` (`browserRows`, `browserRoots`); the rename of `canvas/src/labels/page.js`. `panels/Explorer.tsx` and `panels/explorerRows.ts`, which this package owns, with their tests `explorer.test.mjs` and `explorer-rows.test.mjs`. `core/labels.ts` (`rename`, which package 2-3 builds: build against its contract in seam 7).
- **Starts from** the commit that holds packages 2-3, 2-4, 2-6 and 2-7 (section 9): its tests use `rename`, the view's section, a badge and a pin.
- **Owns.** `core/readers/browser.ts`, `core/actions/browser.ts`, `views/BrowserBody.tsx`, `views/browser-body.css`, `panels/Explorer.tsx`, `panels/explorerRows.ts`, `canvas/app/test/browser-reader.test.mjs`, `browser.test.mjs`, `rename.test.mjs`, `shots/browser.mjs`.
- **Fills.**

  ```ts
  interface BrowserRow { type: 'el' | 'rel'; id: string; depth: number; kids: number; folded: boolean; kw: string; name: string; rest: string }
  interface BrowserData { view: string; rows: readonly BrowserRow[]; empty: string | null }   // empty: the sentence an empty tree says
  const browserReader: Reader<BrowserData>;     // read (the library's browserRows, worded as the Explorer words a row), sizeOf, listed
  function BrowserBody(props: BodyProps): JSX.Element;
  // core/actions/browser.ts: the row expand-all
  ```

- **Decided.**
  - **A row** reads as an Explorer's row reads: «keyword», the name, then `: Type [multiplicity]` for a usage; a line as «connection» and its words. The body draws a row with the Explorer's own row component, so the two look the same. Rows are 28 px high and step in 16 px a level.
  - **Folding is the view's**, not the body's: a click on a row's triangle writes the view's `collapsed` option through `setViewOption`, so it is saved and undone. Words: "Folded <part def X> in <view Y>", "Unfolded <part def X> in <view Y>". `expand-all` empties the list: "Unfolded everything in <view Y>".
  - **The roots** are the view's option `roots`, chosen in the view's section of Details (package 2-4 draws the row; the scaffold's `OptionRow` gives its choices: the whole package, and the elements at the top of the package).
  - **An empty tree** says the old page's sentence: "Nothing to show. The model has no elements yet." or "Nothing to show. None of its roots is in the model. Pick the roots in Details, or the whole package."
  - **The body is drawn inside `BodyFrame`** (seam 2), which gives it its clicks, its right-click palette and its context; it calls `readView(session, viewId)`. A row carries `data-thing="<type>:<id>"`, and `data-label` on its name.
  - **Marks.** A row shows its badge and pins at its right end.
  - **Renaming.** A row of the Explorer and of a browser view whose thing `renamable` accepts is renamed in place with the tree library's own editing of a label: F2 on the row, or a double click on its name, opens it; Enter keeps; Escape puts it away. Keeping calls `rename(session, picked, text)`. A refusal is said and the row keeps its name. The Explorer's rows reword themselves as they do after any rename (contract 12).
  - **Nothing can be placed in a browser view**, and it has no tools.
- **Tests first.** `browser-reader.test.mjs` (Node): "the rows are the library's browserRows under the view's roots, worded as the Explorer words them"; "a folded element's rows are left out"; "an empty tree says why". `browser.test.mjs`, `rename.test.mjs` (the page): the names of lines 58 and 104 to 106; "a fold is one undo step"; "a row that cannot be renamed opens no editor"; "Escape in a row's editor changes nothing"; "the Explorer's row and the browser view's row of one element look the same".
- **It names** `open.test.mjs › the example and the nine fixtures each open: 17 tabs, 11 planes, 6 cards, nothing logged` as the test of slice 1 it makes fail by design (the two browser views' cards).
- **Screenshot.** `browser.png`, rated.

### Package 2-14. The fixtures, the limits and the camera's keys

- **Delivers.** The slice's "Done when" tests and the tests of criteria 2, 3 and 6, kept true as the packages land. The camera's keys and the zoom's readout. The closing checks of the slice.
- **Built by** the lead. Its tests are written by the scaffold; it runs through the slice and closes it.
- **Answers to** criteria 1, 2, 3, 6, 8, 9, 10 and 11; lines 7 to 11, 15, 23, 31 and 108.
- **Owns.** `canvas/app/test/fixtures.test.mjs`, `capabilities.test.mjs`, `refusals.test.mjs`, `camera.test.mjs`, `scale.test.mjs`, `instant.test.mjs`; every test file slice 1 wrote (contract 27); `core/actions/camera.ts`; `plane/ZoomReadout.tsx`.
- **The tests.**
  - `fixtures.test.mjs`: "the example and the nine fixtures each open: 17 views, each drawn by its own body, nothing logged" (criterion 2: for each view, what `thingsIn` finds in the page is what the view's reader lists, one for one, and no card is shown); "each of the ten files, opened and saved from the page, exports its pinned text" (the saved file, given to `canvas/export.mjs`, prints the pinned `.sysml` byte for byte); "two views of one model are shown side by side, each drawn".
  - `capabilities.test.mjs`: "every capability of plan/slice-2.md names a test that exists under that name". It reads the tables of section 7 and looks for each name in its file.
  - `refusals.test.mjs`: "every action of the table, asked where it does not apply, says why" (in Node, through `ask`: every row of section 5 is in the table; each row that can be refused is asked at a place where it does not apply and gives a sentence that ends in a full stop; the five that always apply are named as such: `save`, `put-down`, `new-view`, `open-text`, `copy-text`). "every key of the table, pressed where its action does not apply, shows that sentence as a toast" (the page). "every control of an action that is shown where the action does not apply is greyed and carries its sentence" (the page: every `[data-action]` in the document, in six states of the example).
  - `camera.test.mjs`: the names of lines 8 to 11 and 15.
- **Decided for the camera.** The rows of section 5. `+` and `-` zoom by a step of 1.2 about the middle of the plane. An arrow moves the plane by 80 px. `0` fits, as the fit button does. `ZoomReadout` stands between the zoom buttons and reads "100%", from the store's `watchZoom`.
- **What the lead changes in slice 1's tests** as packages land, each named in that package's hand-back: the card of a view that is not drawn yet (`open.test.mjs`, `plane.test.mjs`), the tools of a kind no plane draws (`tools-panel.test.mjs`, `commands.test.mjs`), the locked order of a message (`fieldHooks.test.mjs`, `details-fields.test.mjs`), the nested box that cannot leave its owner (`move.test.mjs`), "Backspace and Delete remove nothing" (`move.test.mjs`), the replaced typing (`commands.test.mjs`), the notes passed through as the file has them (`files.test.mjs`).
- **The closing.** With every other package landed: three runs of `npm test` in a row with nothing else running, the four medians into `plan/notes.md` (criterion 9); the five rated screenshots retaken and rated again (criterion 8); `example.png` and `shell.png` retaken; `capabilities.test.mjs` and `refusals.test.mjs` without their todo marks; `canvas/app/README.md` brought up to date.

### Package 2-15. Retiring the old page

- **Delivers.** The old page is out of `canvas/` and in `archive/old-page/`. The model library, the fixtures, `export.mjs` and `check.sh` work as before. The READMEs describe one page.
- **Built by** the lead, last, in one step, once every check but its own passes and Damon has seen the capability count of criterion 3.
- **Answers to** criteria 1, 10 and 11.
- **Moves into `archive/old-page/`**, keeping each file's path from `canvas/`: `canvas/index.html`; `canvas/src/core/page/`; `canvas/src/core/page.html`; every `canvas/src/*/page.js`; every `canvas/src/*/style.css` and `canvas/src/core/style-end.css`; `canvas/save-state.mjs`; the 33 Playwright test files of `canvas/test/` with `fake-claude.mjs`, and `helpers.mjs` once the Node tests that stay read nothing of it; `canvas/test/build.test.mjs`; the tests of `canvas/test/store-dump.test.mjs` that run `save-state.mjs`; the one test of `canvas/test/model-lib.test.mjs` that reads the model saved inside the old page; `canvas/canvas.png`. An `archive/old-page/README.md` says what the folder is, the commit it was taken at, and that nothing builds, tests or pins it.
- **Changes.** `canvas/build.mjs` keeps `LIBRARY`, `libraryCode()` and what reads a state file, and builds no page. The Node tests that stay in `canvas/test/` (`lookups`, `metamodel`, `model-lib`, `stored`, and what is left of `store-dump`) load the model library from `libraryCode()` instead of from `canvas/index.html` (today through `modelLibSource` of `canvas/test/helpers.mjs`), with no change to what they check. `canvas/test/index.js`, which makes `node --test canvas/test/` run the folder, stays for them. `canvas/app/test/unchanged.json` and `unchanged.test.mjs` are pinned again: they then guard the model library, the fixtures, the examples and the scripts. `canvas/app/test/old-layout.mjs` and the first two tests of `history-walk.test.mjs`, which run the old page's code, go; `old-layout.json` stays as the record the adapter's tests compare with. `package.json`: `test:old` runs the Node tests that stay. `plane/NotDrawnYet.tsx` no longer says that the old page draws the view. `README.md`, `canvas/README.md`, `canvas/src/README.md`, `canvas/app/README.md` and `plan/REPO_MAP.md` describe one page.
- **Its test**, written first by the scaffold and todo until now: `retired.test.mjs › the old page is out of canvas/ and in archive/old-page/, and no script, test or pin names it`.
- **Before it runs.** The lead counts the capabilities of section 7 against the runner's list of tests, N of N, and writes the count into `plan/notes.md` (criterion 3). A capability whose test is missing or fails stops the package.
- **After it.** `npm ci && npm run check && npm test && npm run test:old` passes from a clean clone, with `# todo 0`. `canvas/check.sh` accepts a file the page saved. `plan/status.json` says slice 2 is done and `next` is 3.

## 9. The order, the tests, their status, and the state documents

### The order inside the slice

1. **Package 2-0**: this plan and the two probes. Done: Damon approved the plan on November 14, 2026.
2. **Package 2-1**, alone. Every later package starts from its commit, or from a commit made on top of it.
3. **The first round: packages 2-2 to 2-9**, side by side, each from the scaffold's commit. No two own one file, and none needs another's code for its own tests: each tests what it builds, against the scaffold. Each lands as one commit of the lead's, in whatever order they are ready.
4. **The second round: packages 2-10 to 2-13**, side by side, each from the commit that holds the first round. A body's tests in the page use what the first round built: the view's section of Details for its options (2-4), a badge (2-6) and a pin (2-7) on what it draws, `rename` for a tree's row (2-3), a line dragged to a lifeline (2-2).
5. **Package 2-14** closes, alone, with nothing else running: the timed tests, the retaken screenshots, the counts. Its camera's keys and its readout are built in the first round.
6. **Package 2-15**, last.

The architecture builds 2-2 to 2-13 at the same time, each "against the skeleton's contract". A unit test can be written against a skeleton; a test in the page cannot pass against one, and no test may be marked todo to wait (rule 8 of the architecture). Two rounds keep every package's tests passing in its own worktree. Inside a round the packages are still built side by side.

### How a package is built and landed

As slice 1's swarm (`plan/swarm/README.md`), with one agent for a package's tests and code:

1. A worktree for the agent, made by hand outside the repository's folder from its round's commit (`git worktree add --detach <path> <commit>`, then `npm ci` there). The agent gets its brief and nothing else of the lead's.
2. The agent writes its tests, sees them fail, fills its skeletons, and hands back what section 8 lists.
3. The lead reads the diff before the report, and copies into the main tree the files the package owns, and no other.
4. A reviewer that did not write the code reads the diff against the brief and this plan's sections it names, tries what it doubts in the built page, and sends back defects, each reproduced. A defect goes back to an agent with the brief.
5. A reviewer that sees only the screenshot and its list marks each item (criterion 7), and rates the five that are rated (criterion 8).
6. The lead changes the tests of slice 1 that the package made fail by design, builds, runs `npm run check` and `npm test`, takes the todo marks the package earns off, and brings `plan/status.json` and `plan/notes.md` up to date. One commit holds the package's sources, its tests, `canvas/dist/` and `plan/status.json`, and is pushed.
7. A timed test is judged with nothing else running. One that fails beside other work is run again alone before anything is concluded.

What stops the lead and goes to Damon, with the reason and the numbers: a contract of `plan/architecture.md` that is wrong; a change the model library or the form of a `grasp/2` model would need; a capability of section 7 that cannot be carried; a scale limit that cannot be held.

### The checks of the slice, as `plan/status.json` holds them

The "Done when" of `plan/direction.md`, in its words, cut into checks, and the tests of criteria 4 to 6. The scaffold writes each test first. A check is `"todo"` while its test is marked todo, and the runner's `# todo` equals the number of checks that are `"todo"`.

| # | The check | Test | After the scaffold | Passes when |
|---|---|---|---|---|
| 1 | "every fixture opens", each view drawn by its own body (criterion 2) | `fixtures.test.mjs › the example and the nine fixtures each open: 17 views, each drawn by its own body, nothing logged` | todo | the last of 2-10 to 2-13 lands |
| 2 | "saved from the new page, exports its pinned text" | `fixtures.test.mjs › each of the ten files, opened and saved from the page, exports its pinned text` | pass, and held from then on | 2-1 |
| 3 | "the Playwright suite, rewritten for the new page, passes" (criterion 3) | `capabilities.test.mjs › every capability of plan/slice-2.md names a test that exists under that name` | todo | 2-14 closes |
| 4 | "with the scale tests": the model opens | `scale.test.mjs › a 5,000-element model opens` | pass | held |
| 5 | a drag step | `scale.test.mjs › a drag step takes under 16 ms at 5,000 elements in 3 views` | pass | held |
| 6 | a keystroke | `scale.test.mjs › a keystroke in a name takes under 50 ms at 5,000 elements` | pass | held |
| 7 | a pan step | `scale.test.mjs › a pan step of a fitted view takes under 16 ms at 5,000 elements, under 25 ms for the 2,112-node action flow view` | pass | held |
| 8 | "`canvas/index.html` and the SVG renderer are gone" | `retired.test.mjs › the old page is out of canvas/ and in archive/old-page/, and no script, test or pin names it` | todo | 2-15 |
| 9 | Every allowed line by dragging (criterion 4) | `connect.test.mjs › in each graph view kind, a drag between each pair of node kinds draws what the rules allow and says why for what they refuse` | todo | 2-2 |
| 10 | Reconnecting by an end (criterion 5) | `reconnect.test.mjs › each kind of line has an end dragged to a node that may take it: one undo step, its label and its notes kept` | todo | 2-2 |
| 11 | A refused end (criterion 5) | `reconnect.test.mjs › an end dropped on a node that may not take it, or on the ground, leaves the line as it was, and a toast says why` | todo | 2-2 |
| 12 | No silent refusal (criterion 6) | `refusals.test.mjs › every action of the table, asked where it does not apply, says why` | todo | 2-14 closes |

So `# todo` is 7 after the scaffold, 4 once package 2-2 has landed, 3 once the last body has landed, 1 once 2-14 has closed, and 0 after 2-15. Check 10 holds all nine kinds of line when 2-2 lands: the ten files draw a message in a general view too. A message's end moved in a sequence view is a test of package 2-10's own.

Every other test of the slice is written by its package, fails before the package's code and passes in the package's landing commit. None of those is committed with a todo mark.

### When the state documents change

- **`plan/status.json`**: in every landing commit. Slice 2 becomes `"in progress"` with `"plan": "plan/slice-2.md"`, `"package"` (the package just landed) and the `checks` above. The last commit sets it to `"done"` and `next` to 3.
- **`plan/notes.md`**: one entry for each working session. A landing commit adds, for its package, what cannot be read from this plan or from the code: each measurement with its command, each file built otherwise than the plan names with its reason, each thing tried and dropped (criterion 11).
- **This plan** changes only with Damon's approval. If a package needs another shape, the notes say so first.
- **`plan/architecture.md`**: one edit, made with this plan (section 11). No other.

## 10. The success criteria, and which package answers to each

Damon chose these eleven on November 14, 2026. They add to the "Done when" of `plan/direction.md`: the slice is done when both hold.

```xml
<success_criteria task="Slice 2 of Grasp, editing parity: packages 2-0 to 2-15 of plan/architecture.md" chosen="2026-11-14">

  <criterion id="1" theme="outcome" name="Every 'Done when' passes">
    <statement>At the slice's last commit: each of the ten files, opened and saved from the new page, exports its pinned text byte for byte (10 of 10); `npm run check` exits 0; `npm test` reports `# fail 0` and `# todo 0` with the four scale tests in it; `canvas/index.html` and the SVG renderer are out of `canvas/` and in `archive/old-page/`.</statement>
    <graded_by>The test runner's summary and plan/status.json.</graded_by>
    <checked_at>Each check from the package that makes it pass; the whole at the slice's last commit.</checked_at>
  </criterion>

  <criterion id="2" theme="outcome" name="All 17 views drawn">
    <statement>The example and the nine fixtures open from file:// with every view drawn by its own body: 17 of 17 views and 0 "not drawn yet" cards (11 graph, 2 browser, 2 grid, 1 geometry, 1 sequence). Each view shows one thing for each entry its reader lists. 10 of 10 files with no console error or warning.</statement>
    <graded_by>A Playwright test from file://.</graded_by>
    <checked_at>For each view kind when its body lands (packages 2-10 to 2-13); the whole at the slice's last commit.</checked_at>
  </criterion>

  <criterion id="3" theme="outcome" name="All the old page's functionality, done the new way">
    <statement>plan/slice-2.md lists what a person can do on the old page, as capabilities and not as its behaviour in detail. Each capability has a named passing test on the new page: N of N. How each one works and looks follows the redesign (plan/direction.md and SysON's inventory). No test compares the new page with the old page's drawing, layout or gestures. A capability left out counts as a failure unless Damon approved dropping it by name.</statement>
    <graded_by>The capability list against the test runner's list of tests.</graded_by>
    <checked_at>The list when plan/slice-2.md comes for approval; the count before package 2-15 archives the old page.</checked_at>
  </criterion>

  <criterion id="4" theme="new gestures" name="Every allowed line by dragging">
    <statement>For each graph view kind and each pair of node kinds, a drag from a handle draws every relationship the model library's rules allow, 100% of allowed cases, with a menu when more than one kind fits. Every pair the rules refuse draws nothing and shows the rule's own sentence as a toast, 100% of refused cases. Each line drawn is one undo step.</statement>
    <graded_by>A test generated from the model library's rules table.</graded_by>
    <checked_at>When package 2-2 lands, and at the slice's last commit.</checked_at>
  </criterion>

  <criterion id="5" theme="new gestures" name="Reconnecting by an end">
    <statement>Each kind of line in the example and the fixtures has an end dragged to another node that may take it, and the line moves in one undo step with its label and its notes kept. Dropped on a node that may not take it, or on the empty plane, the line stays as it was and a toast says why. Every kind of line passes.</statement>
    <graded_by>A Playwright test from file://.</graded_by>
    <checked_at>When package 2-2 lands, and at the slice's last commit.</checked_at>
  </criterion>

  <criterion id="6" theme="new gestures" name="No silent refusal">
    <statement>Whenever a gesture, a key or a menu entry is refused, the page says why in a sentence: a toast, or a greyed entry carrying the sentence. A test asks every action of the action table at places where it does not apply and finds a sentence each time: 0 refusals with nothing shown.</statement>
    <graded_by>A table-driven test over the action table.</graded_by>
    <checked_at>As each package adds its actions; the whole table at the slice's last commit.</checked_at>
  </criterion>

  <criterion id="7" theme="look" name="Checklist per screenshot">
    <statement>plan/slice-2.md names a screenshot for each new part (sequence, geometry, grid, browser, notes with pins, badges, connect menu, label editor, text tab) with a list of what must be seen. A reviewer that did not write the code and sees only the image and its list marks each item present or absent. A package is merged only when all its items are present.</statement>
    <graded_by>An independent reviewer, item by item, present or absent.</graded_by>
    <checked_at>Before the commit that lands the package taking each screenshot.</checked_at>
  </criterion>

  <criterion id="8" theme="look" name="Rated as a workbench">
    <statement>The same independent reviewer rates the screenshots of the four new bodies and of the notes from 1 to 5 on four points: alignment and spacing, type and contrast, nothing cut off or overlapping, easy to read. 1 is a broken layout, 3 a working prototype, 5 a finished workbench of SysON's kind. Each of the 20 scores must be 4 or more.</statement>
    <graded_by>The independent reviewer's 20 scores: five screenshots, four points each.</graded_by>
    <checked_at>When each of the five is taken, and again on all five as retaken at the slice's last commit.</checked_at>
  </criterion>

  <criterion id="9" theme="speed" name="The four limits still hold">
    <statement>With everything slice 2 adds (handles, badges, pins, checks while drawing), at 5,000 elements in three views, by the median, in 3 runs of `npm test` in a row: the model opens in under 5 s, a drag step takes under 16 ms, a keystroke in a name under 50 ms, and a pan step of a fitted view under 16 ms (25 ms for the 2,112-node view). A limit that cannot be held comes to Damon with its numbers and where the time goes, and is never passed by loosening its test.</statement>
    <graded_by>canvas/app/test/scale.test.mjs, timed inside the page, with nothing else running.</graded_by>
    <checked_at>After the scaffold (2-1), and three runs in a row at the slice's closing.</checked_at>
  </criterion>

  <criterion id="10" theme="run" name="Every package ends green">
    <statement>The commit that lands each work package, 2-1 to 2-15, holds its sources, its tests, canvas/dist/ and plan/status.json, and passes `npm ci &amp;&amp; npm run check &amp;&amp; npm test` with `# fail 0` when checked out by itself: 15 of 15. The runner's `# todo` equals the checks still "todo" in status.json. Every session ends on a pushed commit of this kind, so a session cut short loses at most the package in hand.</statement>
    <graded_by>The three commands, run at each package's landing commit.</graded_by>
    <checked_at>At every landing commit, and all 15 again after the slice closes.</checked_at>
  </criterion>

  <criterion id="11" theme="run" name="Notes a stranger can use, and contracts untouched">
    <statement>plan/notes.md gains, for each package, what cannot be read from the plan or the code: each measurement with its command, each file built otherwise than the plan names with its reason, each thing tried and dropped. After the slice, a fresh session given only the repository answers 5 questions on the state (what is done, what is next, which limits hold with what numbers, what departs from the plan, what is open): 5 of 5 right. No commit of the slice changes a contract of plan/architecture.md, the form of a `grasp/2` model, or a `lib.js` file: 0 such changes. A package that finds a contract wrong stops and brings it to Damon with the reason.</statement>
    <graded_by>The five answers checked against the repository; the diff of plan/architecture.md and of the pinned files.</graded_by>
    <checked_at>The notes and the diff at every landing commit; the five questions once, after the slice closes.</checked_at>
  </criterion>

  <outside>
    <item>The redesign is the reference for how a thing works and looks. The old page says only what a person must be able to do; its drawing, layout, gestures and tests are not matched.</item>
    <item>Slice 1's four limits are the only speed tests. Slowness in the four new bodies or in small edits is fixed when it shows in use.</item>
    <item>Offered to Damon and not chosen, so do not add them: every action undone back to the pinned text; a table accounting for the 33 old test files; the old label cases ported one by one; the old page side by side in screenshots; keys tested in every place; a notes exchange with Claude as a criterion of its own; evidence pages for the two probes.</item>
  </outside>
</success_criteria>
```

### Which package answers to which criterion

"●" marks a package whose landing is a moment the criterion is checked at. Criterion 10 is checked at every landing, and criterion 11's notes and diff too.

| Package | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| 2-0 The plan | | | ● the list | | | | | | |
| 2-1 The scaffold | ● check 2 | | ● line 20 | | | ● its four rows | | | ● measured, with grips mounted |
| 2-2 Lines by dragging | ● checks 9 to 11 | | ● | ● | ● | ● its gestures | ● `connect-menu` | | |
| 2-3 Label editing | | | ● | | | ● | ● `label-editor` | | |
| 2-4 Deleting, showing, views | | | ● | | | ● | | | |
| 2-5 Another owner | | | ● | | | ● its gesture | | | ● it changes the store |
| 2-6 Badges and checks | | | ● | | | | ● `badges` | | ● the checks run while drawing |
| 2-7 Notes | ● the notes in a saved file | | ● | | | ● | ● `notes` | ● | ● pins |
| 2-8 Code links | | | ● | | | ● | | | |
| 2-9 The text tab | | | ● | | | ● | ● `text-tab` | | |
| 2-10 Sequence | ● check 1 | ● | ● | | ● a message's end, in its own view | ● | ● `sequence` | ● | |
| 2-11 Geometry | ● check 1 | ● | ● | | | ● | ● `geometry` | ● | |
| 2-12 Grid | ● check 1 | ● | ● | | | | ● `grid` | ● | |
| 2-13 Browser, renaming | ● check 1 | ● | ● | | | ● | ● `browser` | ● | |
| 2-14 Fixtures, limits, camera | ● checks 3 to 7 and 12 | ● the whole | ● the count | ● again | ● again | ● the whole table | | ● all five again | ● three runs |
| 2-15 Retiring the old page | ● check 8; the whole | | | | | | | | |

How the criteria meet the plan:

- **Criterion 2 is `fixtures.test.mjs`'s first test.** It asks each view's reader, in Node, what the view lists, and finds one thing in the page for each entry. So a body that draws a card, or drops a row, fails it. It is todo until the last of the four bodies lands; each body's own tests hold its kind before that.
- **Criterion 3's N is 112** (section 7). The list came with this plan for approval, with six things left out, which Damon approved by name. Before package 2-15 the lead counts the 112 names against the runner's list of passing tests.
- **Criteria 4 and 5 are generated**, as package 2-2's brief says, from the model library's own rules, so the test and the page are held to the same table and not to each other. Criterion 4's test drags one pair for each class of the ten files' 2,260 pairs (221 classes, all eight kinds of line among them, 62 pairs with a menu) and one for each pair of kinds of a generated model, about 800 drags. Criterion 5's finds, for each of the nine kinds, a line in the ten files that another node may take an end of.
- **Criterion 6 has three tests** (package 2-14's brief): every row asked in Node; every key pressed in the page; every greyed control read in the page. A gesture's refusals are in its package's tests and in criteria 4 and 5.
- **Criteria 7 and 8 need a reviewer that has not seen the code**: a fresh agent given the image and its list, or the four points with their scale, and nothing else.
- **Criterion 9 is first measured by the scaffold**, with the grips mounted on every near node, the marks put on every node, and the checks running while a plane is shown. Packages 2-5, 2-6 and 2-7 change what a step and a change cost, so each is landed only after `scale.test.mjs` has passed alone on its tree.
- **The closing's measurements and screenshots are taken on the last commit.** Package 2-15 moves files and changes one sentence of one component. The lead runs the three runs of criterion 9 and retakes the five rated screenshots on 2-15's tree, so that "the slice's last commit" is what was measured and looked at.
- **Criterion 10's run of all 15 commits and criterion 11's five questions** are made once 2-15 is committed, and their results go into `plan/notes.md`.

## 11. The one edit to `plan/architecture.md`

Damon decided that criterion 3 replaces one deliverable of package 2-14. In section 4 of `plan/architecture.md`, the row of package 2-14 said: "A table from each of the old page's test files to the new test that takes its place, or to the reason it is dropped." It now says that the package keeps the capability list of this plan's section 7. The edit is made in the commit that brings this plan. It changes no contract.

## 12. Where the plan departs from the architecture, and what Damon decided

### Where it departs

No contract of `plan/architecture.md` is changed. These are the places where the plan builds otherwise than the architecture's section 4 says, or than the old page does, each with its reason in section 2:

1. **Lines by dragging and reconnecting are Grasp's own gesture**, on grips of its own, and not React Flow's connecting and reconnecting. The architecture's scaffold names React Flow's. The reason was read in React Flow's code, and both probes drag by pointer handlers of their own inside React Flow; the grips themselves are first built by the scaffold.
2. **Packages 2-2 to 2-13 are built in two rounds**, 2-2 to 2-9 and then 2-10 to 2-13, not all at once (section 9). A body's tests in the page need what the first round builds.
3. **Package 2-14 keeps the capability list** in place of a table of the 33 old test files. Damon's decision; section 11.
4. **A "defined by" line drawn again moves the old line's end** and replaces nothing, so its notes stay through Undo. `core/commands.ts` and one test of slice 1 change in the scaffold.
5. **Deleting something keeps the notes on it.** The old page deletes them. Contract 9 already asks that a note with no target be accepted.
6. **The Delete key does not delete a view**, and there is no Note tool in the Tools view. Both are on the old page. The capability is kept each time: Delete view is a button of Details, and a note is added by a right-click or from the Notes panel.
7. **The scaffold changes four small things for a person** (package 2-1's brief): a key says why it was refused; Escape lets go of the selection; greyed buttons carry their sentence; the middle button drags the plane. The architecture says the page behaves as before.
8. **Files the architecture does not name**: section 3 lists the scaffold's. The packages add `core/actions/code.ts` (2-8), `core/actions/browser.ts` (2-13), `core/actions/camera.ts` and `plane/ZoomReadout.tsx` (2-14), `panels/ShownSection.tsx` (2-4) and `plane/gestures/ConnectLayer.tsx` (2-2).
9. **Package 2-14 gains the camera's keys and the zoom's readout.** The old page has them and no package of the architecture does.

### What Damon decided

Damon approved the plan on November 14, 2026: "Approved, all five as you have them." The five points that waited for him, each decided as the plan has it:

1. **The plan itself: approved.** The scaffold, package 2-1, can start. Every later package starts from its commit.
2. **Six capabilities of the old page are left out, each approved by name** (section 7): the page keeping the work in this browser by itself; the window's place and zoom remembered across a reload; the claude.ai store and its read-only states; following the system's dark setting; the layout for a narrow window; driving the drawing by touch. Criterion 3 counts none of the six as a failure.
3. **A note's label follows a rename, as on the old page.** Contract 9's record says of `targetLabel`: "the target in words, as it was when the note was written". The old page keeps that label current: after a rename it follows the new name, so that Claude reads the current one, and that is line 75 of section 7. Damon approved the plan's way: the label follows a rename while the target is in the model, and stays as it last was once the target is gone. The contract's text is not edited; this item is where its sentence is read.
4. **With no file open, a key says nothing** (section 2). A page with no file has no actions to refuse, so criterion 6 does not ask for a sentence there.
5. **Three behaviours that differ from the old page: approved.** Deleting something keeps the notes on it (departure 5). The Delete key does not delete a view; a button of Details does (departure 6). There is no Note tool; a note is added by a right-click or from the Notes panel (departure 6). With these goes departure 1, the gesture of Grasp's own for drawing and moving a line, which Damon approved with the plan.

### What is not proved

- **The grips and the line in hand have not run in the page.** What was run: the sequence probe drags a message by pointer handlers of its own inside React Flow, and a review of this plan pressed a stand-in grip with the classes `nodrag nopan` in today's built page, where the press reached a capturing listener on the plane's root and neither the node nor the plane moved. That review also found what the plan now holds: Shift needs the class `nokey`, and the click after the release must be dropped. The scaffold builds the grips first and measures with them.
- **The four limits with slice 2's additions** are measured by the scaffold, not before it. The baseline of this session is in `plan/notes.md`.
- **Neither probe ran inside the page's own `Plane.tsx` and `viewStore.ts`.** Each rebuilt the page's pattern in its folder. Section 2 lists what else they did not run.
- **A free note can change its view through a save and an open** when it stands past the next view's origin on the old page's plane (section 2). The file has no place to say the view.
- **The capability list rests on two readers' work.** The lead read their 358 lines and checked them against the scripts it read itself: the core's notes, views, export and deleting, the notes, pins and archive of the annotations script, and the labels, sequence and geometry scripts. The grid, browser, details, validation, interconnection and behavior scripts, and the code links of the annotations script, were read by one reader only.
- **Three briefs were read by a reviewer playing their builder** (2-2, 2-7, 2-12), and what they found is in the plan. The other eleven were not read that way.
