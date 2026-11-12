# Slice 1, "The shell and the planes": the plan

November 12, 2026, session 14. Approved by Damon on November 12, with the recommendations of section 7: React Flow's mark hidden on the planes and credited in About and the notices file, a light theme only until slice 7, and relationships drawn by two clicks in this slice.

## Context

Grasp is being rebuilt in the seven slices of `plan/direction.md`, because the old page is unpleasant to use: its header holds a palette and a row of buttons, nothing can be resized, and every view sits on one plane. Slice 1 ends those three complaints. It builds a new page on vendored libraries (React Flow, Dockview, Material UI), beside the old page, which stays untouched. This document is the plan for building that slice. It has two readers: Damon, who approves it, and any later session, which builds from it without having seen how it was made. Step 1 therefore commits this text as `plan/slice-1.md`.

## In short

1. **Slice 1 is next, and nothing of the redesign is built yet.** The repository is clean at `1ab5c53`. The baseline run passes: 221 of 221 tests in 81 s, and `canvas/check.sh` accepts the example.
2. **What the slice ends with.** A new page, `canvas/dist/index.html`, opened from the file system. It has a slim top bar in place of the header, side panels that resize and collapse, one tab per view with a plane of its own, boxes that resize by handles, one selection shared by every panel, tools at the side and on right-click, and undo with redo. It opens and saves today's `grasp/2` state files. The old page, the model library and their tests are not touched.
3. **How it is built.** Thirteen steps, each verified and committed on its own. Step 1 puts this plan into the repository. Step 2 gives the scripts that install, build and test. Step 3 writes each "Done when" check as a named test before the code it checks. Steps 4 to 12 build the application. Step 13 closes the slice.
4. **What this session added to the earlier spike.** The spike had no Material UI, no tree view, no fonts and no ports. I tried those in the session's scratchpad, outside the repository. Section 1 gives the results, and the plan rests on them.
5. **What Damon decided.** He approved the plan on November 12 and took the recommendations on the three choices of section 7: React Flow's small mark is hidden on each plane, the theme is light only until slice 7, and relationships can already be drawn in this slice by two clicks.

## 1. Where the project stands

### The state I found

- The branch is `claude/grasp-slice-1-plan-mmntfd`, clean, at `1ab5c53` (pull request #40: the state documents follow the redesign).
- `plan/status.json` names `plan/direction.md` as the plan, says `"next": 1`, and lists the seven slices, all `open`. The ten steps of the earlier plan are `done`.
- Sessions 12 and 13 of `plan/notes.md` say that nothing in `canvas/` has changed since the reframing, and that Damon's machine was probed: Chrome 157, where the pickers, a remembered folder handle, GitHub and WebAssembly all work.
- Nothing of the redesign is built. There is no `package.json` at the root and no `canvas/dist/`. The only code on the new stack is the spikes in `plan/spikes/`.

### The baseline run

| Command | Result |
|---|---|
| `node --test --test-timeout=120000 canvas/test/*.test.mjs` | 221 tests in 47 suites: 221 pass, 0 fail, 0 todo, in 81 s |
| `node canvas/build.mjs --check` | `canvas/index.html` is what the sources build |
| `node canvas/metamodel/generate.mjs --check` | passes |
| `node canvas/export.mjs canvas/examples/stronghold-proof.json` | SHA-256 `9825ca06…`, the bytes pinned in `canvas/test/fixtures/format1.sysml` |
| `canvas/check.sh canvas/examples/stronghold-proof.json` | `ok … (Package StrongholdProof)`; the kernel downloaded in 14 s |

The container has Node 22.23.4, npm 10.9.9 and 4 CPUs. Playwright 1.63.0 with Chromium 153 comes with it and must not be installed again. The npm registry is reachable. TypeScript 6.0.2 is installed; esbuild is not.

### The passages that govern slice 1

**Its scope and its "Done when" checks**: `plan/direction.md`, "The slices", item 1:

> **The shell and the planes.** The new page: a slim top bar in place of the header; Dockview with the Explorer (MUI X Tree View over the library's tree rows), the Tools view, Details (MUI widgets drawn from the `FIELDS` rows, committing through `edit()`) and Validation at the sides; the editor group holding one tab per view of the open model, each tab a React Flow plane showing the view's elements as SysML-style nodes with compartments and its lines as edges; sashes that resize and collapse; a selected box with resize handles whose new size is saved; drag, marquee and multi-select; one selection shared by every panel; right-click palettes from the view kind's tools; undo carried over from the Proxy history, with redo added; the Stronghold example and today's state files opened through the picker or a file input; the About panel. The saved format stays `grasp/2`, so the old page still reads every file. Uses: React 18, React Flow, Dockview, MUI, MUI X Tree View, esbuild; the build writes the third-party notices file and keeps elkjs as a file of its own. Done when: opened from the file system in Chromium with no console error, the example shows its general view on a tab, no header palette or button row exists, a sash drag resizes the Explorer, a box resized by its handles keeps its size after save and reload, each checked by a Playwright test from `file://`; the library's Node tests pass unchanged; a 5,000-element model opens and a drag step measured inside the handler stays under 16 ms, or the limit is restated with the measurement.

**The decisions it rests on**: `plan/direction.md`, "The decisions":

> 1. "The page's code … is replaced by a React application bundled by esbuild on Claude's side into classic scripts committed to git, which Damon downloads with the repository and opens from the extracted folder. The model library, 4,966 lines, stays whole and stitched by `build.mjs` into one classic script as today … The new application is written in TypeScript, which esbuild strips, because the libraries it drives are typed; the model library stays plain JavaScript."
>
> 2. "React Flow's state is controlled by object identity, so Grasp's mutable model is projected into fresh node and edge objects after each change, with React Flow's own fields (measured sizes, selection, drag and resize state) merged back from a cache per view, and the history records only settled changes (a drag's end, a resize's end, add, remove); border ports are ours (their positions kept on the border as the box moves and resizes, the node told when a port changes side); frames need explicit sizes, precede their children in the list and do not clip them; editable rows opt out of dragging and of double-click zoom."
>
> 3. "Dockview gives the editor area's tabs (which drag, split and float inside the window; popping a tab out into another window is refused from a page opened from disk), the side panels, the sashes and a saved layout; Material UI 7 gives the slim top bar that replaces the header, the right-click palettes as menus, dialogs, toasts, text fields, checkboxes, radios, reference pickers with chips, and the Core and Advanced tabs; MUI X Tree View's free edition gives the Explorer … its virtualization is in the paid edition, so a tree of thousands of elements starts collapsed at its roots or windows itself. A Tools view docked at the side lists the active view kind's creation tools, beside the right-click palettes … Roboto is vendored."
>
> 9. "nothing built early is thrown away later, because the node components are keyed by kind rows from the start, the history sits outside React, and the one adapter from the saved model to nodes is the single piece the format change replaces."

Four more passages limit the build. "What was checked" says of a page opened from disk: "Module scripts, dynamic `import()`, `fetch` and XMLHttpRequest of a file beside the page, and a Worker made from a file are all blocked … So a multi-file page carries its JavaScript as classic scripts bundled ahead of time". It says of the licences: "a third-party notices file in the repository carrying every MIT and BSD notice … the notices that esbuild's minifier strips put back; and elkjs shipped as its own unmodified file rather than merged into Grasp's bundle". It gives the spike's two lessons: "fit the view after the layout has placed the nodes, not before", and "the new page must do at a far zoom what the old one does below 25%: draw boxes as outlines and leave edges and labels out, or cull edges itself". And "What is dropped, and what survives of Grasp" says: "The old page stays in `canvas/` until the new one draws everything it draws; nothing in it changes meanwhile."

**What is not settled yet**: `plan/direction.md`, under that heading. One item is this slice's to answer:

> **Compartment rows at Grasp's scale.** Whether selectable, editable rows inside React Flow nodes hold Grasp's limits at 5,000 elements in three views, a keystroke under 50 ms and a drag step under 16 ms measured inside the handler rather than through Playwright's event dispatch, and whether a far zoom that draws outlines and culls edges keeps a fitted 5,000-node view responsive, since React Flow culls nodes but not edges. The first slice's scale test answers; if rows are too heavy, they become lighter DOM, or the limit is restated for a working zoom.

The item on Damon's machine is settled, with one duty left for this slice: "the About panel of the first slice still reports what works, for any other machine the page is opened on."

### What the code looks like where the slice builds on it

I opened each of these. The list says what the files hold today.

1. **`edit()` and its history** are in `canvas/src/core/page/changes.js`, a script of the old page, not of the library. Every object and array of the model is a `Proxy` whose traps note each write. `edit(change, key)` makes an undo step from those notes, logs it, redraws and schedules the save, and `undo()` puts back what the notes say. There is no redo. The script reads the old page's state, its Undo button and its `render()`. The old page must not change, so "carried over" means ported into the new application.
2. **The `FIELDS` rows** are in the library: 31 rows in `canvas/src/core/lib/model.js` and the features' `lib.js` files, each with a `type` (`string`, `text`, `bool`, `enum`, `number`, `ref` or `list`) and a `label`. `M.detailsOf(model, type, item)` in `canvas/src/details/lib.js` already gives the rows of the Core and Advanced tabs. What a row cannot say is in `FIELD_HOOKS`, in page scripts (`core/page/panel.js`, `details/page.js`, `sequence/page.js`), so Details needs those ported too.
3. **The tree rows** come from `M.browserRows(model, view)` in `canvas/src/browser/lib.js`: the rows in order, each `{ type: 'el' | 'rel', id, item, depth, kids, folded }`. For the 5,000-element scale model it gives 9,800 rows in 16 ms in Node.
4. **The view kinds' tools** are `M.VIEW_KINDS[kind].tools`: element and relationship kinds with `'|'` between groups, seven for a general view and none for a grid or a browser view. The rules are the library's (`admits`, `canContain`, `RELATIONSHIPS[kind].first` and `.ends`). Placing and drawing (`place`, `connectStep`, `createRel`, `freeName`, `BASE_NAME`) are page scripts (`core/page/tools.js`, `core/page/drawing.js`), with two additions in `interconnection/page.js` and `behavior/page.js`.
5. **How a box is drawn** is all in page scripts. A kind row names only its `shape`, `size`, `onBorder` and `keyword`, and a relationship row its `line` (`route`, `marker`, `cls`, `label`). The page scripts hold 13 shapes, 3 compartments (`doc`, `code`, and a send or accept action's), 5 line markers, and the name line (`nameLine` in `core/page/drawing.js`).
6. **Places in `grasp/2`** already have the form React Flow's nested nodes take. A box's `x, y` are relative to its nearest owner that the view shows. Its `w, h` are a least size: `graphLayout` in `core/page/layout.js` grows a box to hold its compartments and what is inside it. A border item has a `side` and an `at` between 0.05 and 0.95. A view's own `x, y` place its frame on the old page's one plane.
7. **The stack spike**, `plan/spikes/stack/app.jsx`, is 80 lines: Dockview's ordinary groups, one React Flow plane with three hand-made nodes, `NodeResizer`, and ELK. It has no model, no Material UI, no tree view, no fonts, and no nested or border nodes.

The library loads today with 20 element kinds, 9 relationship kinds, 8 view kinds and 96 names on `SysMLModel`. The 5,000-element model of `canvas/test/scale-model.mjs` has three views, all of kinds the graph renderer draws: a general view placing 1,544 elements, an interconnection view placing 1,344, and an action flow view placing 2,112 with 1,536 lines.

### What I tried outside the repository

These ran in the session's scratchpad, with packages from npm. They touched nothing in the repository.

- `npm install` of the whole stack takes 13 s (118 packages).
- React 18.3.1, `@xyflow/react` 12.10.2, Dockview, `@mui/material` 7.3.11, `@mui/x-tree-view` 8.29.3 and Roboto bundle with esbuild 0.28.2 in under half a second. They bundle as one classic script of 1.08 MB, or as two: the libraries on one global (1.38 MB) and the page's own code.
- Opened from `file://` in Chromium 153, both forms are ready in 250 to 400 ms with no console error or warning. Roboto loads from font files beside the stylesheet. A right-click menu opens. A sash drag widened the Explorer from 240 to 338 px, and a handle drag resized a box from 220 × 96 to 280 × 141.
- Dockview's edge groups, which are side panels that collapse to a narrow strip, work from `file://`: `collapse()`, `expand()`, a sash drag, and `toJSON()` holding them.
- A port made as a child node stays where it was when its owner is resized. Keeping it on the border is ours to write, as decision 2 says.
- TypeScript 6.0.2 checks code against these libraries' types in 2.5 s.
- There are two traps. Turning on the CSS domain of Chrome's DevTools protocol from a test makes Chromium log an error on a `file://` page, so the tests must not use it. And `dockview-react` 8.8.3 now installs `dockview-core` 8.9.0, published on November 8, so the plan pins 8.9.0 by name.

## 2. What `plan/direction.md` leaves open for this slice, and how the plan settles it

- **Where the new code lives.** The documents name only the output, `canvas/dist/`. The sources go in `canvas/app/src/`, the tests in `canvas/app/test/`, the build in `canvas/app/build.mjs`, and one `package.json` with its `package-lock.json` at the root. `canvas/build.mjs` checks every script and stylesheet under `canvas/src/` against its lists, and it must not change.
- **How many scripts the build writes.** Three classic scripts: `model-lib.js` (the library, exactly as `canvas/build.mjs` stitches it), `vendor.js` (the libraries, put on one global, `window.GraspVendor`), and `app.js` (Grasp's own code). The page then runs the same library text as `export.mjs`. A commit that changes Grasp's code rewrites a small file, not 1.4 MB. Third-party code stays apart from Grasp's, which the notices need.
- **What the page shows before a file is open.** An empty editor with a card that opens a file. One model is open at a time. "New model" stays in slice 3, where the direction puts it. Until then `canvas/state.json` is the blank model to open, and `canvas/examples/stronghold-proof.json` the example.
- **How a file is saved.** "Save in place" belongs to slice 3, yet the fifth check needs "save and reload". Save writes the state file that was opened, in today's shape (`{ format, revision, saved, model, notes, archive, changes }`): back through the file's handle when it came through the picker, and as a download under the file's name otherwise. Notes, the archive and code links pass through untouched, so the old page, `export.mjs`, `check.sh` and `save-state.mjs` read the file. The page does not remember the file across a reload, and it asks before unsaved changes are lost.
- **Which views a tab draws.** The four view kinds whose `renderer` row is `graph` are drawn: general, interconnection, action flow and state transition. Each of the 13 `shape` rows gets its node component now, because a general view admits every kind and the scale model's three views use nine of the shapes. A sequence, geometry, grid or browser view gets its tab with a card saying that the old page draws it until slice 2. The old page treats a kind with no renderer the same way (`RENDERERS.pending`).
- **Frames.** With one view on a tab, the tab is the frame, so no frame is drawn, and a view's panel resizes with the sashes. Frames return as resizable parent nodes in slice 3, when a tab can hold several views. Boxes keep their places from the view's origin, so adding a frame then moves nothing.
- **What a port is in React Flow.** A port is a node of its own, a child of its owner's node, which Grasp's code keeps on the border. Selecting it, sliding it along the border and, in slice 2, connecting from it are then React Flow's own gestures. The cost is more nodes, which the scale test measures.
- **Which editing is slice 1's.** Slice 1 has moving, resizing, sliding a port along its border, editing fields in Details, placing elements and drawing relationships from the Tools view and the palettes, undo, redo and save. Slice 2 keeps what the direction gives it: drawing by dragging from handles, reconnecting, editing a label in place, moving a box into another owner by dragging, Delete and Remove from view, new and deleted views, showing an element in a view, badges, notes, code links, the export panel, and renaming in the Explorer.
- **What Validation lists.** It lists both lists the library gives, Grasp's own problems (`M.validate`) and the specification's rules (`M.validateSpec`), worked out once the changes pause for 0.8 s, as today. A click on an entry selects what it is about.
- **What About reports.** When it is opened, it reports the browser's version, whether the page is a secure context, the three pickers, the file input and download, localStorage, IndexedDB, a worker made from a Blob URL, WebAssembly with the probe's timing loop, a request to `api.github.com/rate_limit`, and the libraries' versions. A button remembers a folder's handle, so the next opening can say whether it survived. The network is asked only when the panel is opened.
- **How a step is "measured inside the handler".** The old helpers already do it inside the page (`timing` in `canvas/test/helpers.mjs`). Step 8 says how the new page keeps that measure whole.
- **Which limits the scale test holds.** It holds the two of "Done when" (the model opens; a drag step under 16 ms) and the two that "What is not settled yet" gives this slice's test: a keystroke in a name under 50 ms, and a pan step of a fitted view under 16 ms.
- **Whether ELK runs.** It does not, because every place is saved in `grasp/2`. The build still keeps `elk.bundled.js` as a file of its own with its licence, as the slice's text says, and the page does not load it.
- **The Explorer with thousands of elements.** When the model has more than 500 elements, only the package's row starts unfolded, and a row with more than 200 children shows the first 200 and a "Show more" row.

## 3. How the application is laid out

```
package.json, package-lock.json     every version exact; npm ci installs
canvas/app/
  build.mjs                         canvas/app/ → canvas/dist/
  index.html, tsconfig.json
  src/
    main.tsx, vendor.ts, app.css, types.d.ts
    core/     history.ts  session.ts  files.ts  adapter.ts  selection.ts  commands.ts  probe.ts
    shell/    App.tsx  TopBar.tsx  Dock.tsx  EmptyCard.tsx  About.tsx  Toasts.tsx  theme.ts
    panels/   Explorer.tsx  Tools.tsx  Details.tsx  fieldHooks.ts  Validation.tsx
    plane/    Plane.tsx  viewStore.ts  Palette.tsx  NotDrawnYet.tsx  nodes/  edges/
  test/       helpers.mjs  core.mjs  shots.mjs  *.test.mjs  unchanged.json
  shots/      the screenshots, committed
canvas/dist/                        what the build writes, committed: the page Damon opens
```

The new words, each used with one meaning from here on:

- **The application** is the new page's code, in `canvas/app/`. **The page** it builds is `canvas/dist/index.html`. "The old page" stays `canvas/index.html`.
- **The core** is the part with no React in it, `canvas/app/src/core/`. It runs in Node too, so its tests need no browser.
- **The session** is the file open in the page: its model, notes, archive and change log, its name and handle, and whether it has unsaved changes.
- **The adapter** is the direction's word: the one function that turns a `grasp/2` view into React Flow's nodes and edges.
- **A view's store** keeps one view's nodes and edges outside React. Dockview unmounts a tab that is hidden, and the tab must find its state again. React reads the store through `useSyncExternalStore`.
- **A strip** is the narrow bar at the window's left or right edge that names a side's views and stays when the panel is collapsed. Dockview calls the panel beside it an edge group.

The pieces fit in one direction. A gesture on a plane or a widget in a panel calls `edit()` in the history. The history changes the model and tells its listeners what the change touched. The adapter projects the touched views again, and each view's store hands the new nodes to its plane. The panels read again only what was touched, and the session marks the file as changed.

For the tests and for Claude's own looking, the page puts the session, the selection and the views' stores on `window.Grasp`, as the old page has `window.SysMLCanvas`. The elements a test finds carry `data-testid` names, listed at the top of `canvas/app/test/helpers.mjs`.

## 4. The look, and how it is checked

SysON's workbench is the reference for the form: its proportions, where things sit, how a node reads. Its design is taken from the inventory in `docs/sysml/syson/features/`, never from its code or its icons, as the README's rule says. The colours are Grasp's own ink and teal, carried over from the old page (`#182630` and `#176B61`), not SysON's purple and yellow, which are its brand.

### The shell

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Grasp   stronghold-proof.json •   [open] [save] [undo] [redo]          [i] │ 40 px
├────┬───────────────┬──────────────────────────────────────┬───────────┬────┤
│Expl│ ▾ Stronghold… │ proofStructure : GeneralView  ×      │ Core  Adv.│Det.│
│Tool│   view proof… ├──────────────────────────────────────┤ Part Def… │    │
│Val.│   part def P… │                                      │ Declared  │    │
│    │   part def H… │              the plane               │ Name      │    │
│    │               │                                      │ [Host   ] │    │
│    │               │ [+][−][fit]               [minimap]  │           │    │
└────┴───────────────┴──────────────────────────────────────┴───────────┴────┘
 strip  280 px         the editor group: one tab per view     320 px     strip
```

- The window is two rows: the top bar, 40 px high, and the dock. The page itself never scrolls.
- The top bar is ink with white text. It holds the name Grasp, the open file's name with a dot while it has unsaved changes, four icon buttons with tooltips (Open, Save, Undo, Redo), and About at the right end. Undo's tooltip names the step. There are no tools, no text buttons, and no second row at any width.
- The left strip names Explorer, Tools and Validation, and the right strip names Details; the names run up the strip. The view that is shown is marked in teal. Clicking its name collapses the panel to the strip, and clicking a name opens it again. Between each panel and the editor is a sash, a 1 px line with a 4 px grab area, which resizes by dragging.
- The editor group has a tab bar 32 px high with one tab per view, titled like `proofStructure : GeneralView`. The active tab is white under a 2 px teal line. A tab's body is its plane: a pale ground with a faint dot grid, zoom buttons at the bottom left, a minimap at the bottom right.
- The type is Roboto at 13 px, medium weight for names and titles, 12 px inside compartments. Controls use their dense sizes: 28 px rows in the tree, 32 px fields.
- With no file open, the editor shows a card: "Open a model", the Open button, and one line saying where the example and the blank model are.

### A node on a plane

```
┌─────────────────────────────────┐        ╭───────────────────────╮
│       «abstract part def»       │        │        «part»         │
│              Host               │        │  hosts : Host [1..*]  │
├─────────────────────────────────┤        ╰───────────────────────╯
│               doc               │
│ hosts/: the small piece of code □ api : ~StrongholdApp
│ that plugs the app into one …   │
└─────────────────────────────────┘
```

- A definition is a white rectangle with square corners and a 1 px ink border. Its keyword, `«part def»`, is centred in 11 px grey on the first line, and its name is centred in 13 px medium on the second. An abstract one reads `«abstract part def»`, as today.
- A usage is the same with corners of 10 px radius. Its name line is today's: `hosts : Host [1..*]`.
- A compartment starts with a 1 px rule and its title in italics, centred (`doc`, `code`, `send`). Its rows are 12 px text, left-aligned, 16 px apart, and a doc wraps to the box's width.
- What a box owns and the view shows sits inside it, below the header. The owner is always large enough to hold it.
- A port is a 16 px white square across its owner's border, with the arrow that shows which way its items go, and its name outside the owner beside it.
- A line is 1.25 px ink and leaves its two boxes on the sides that face each other. Specializes ends in a hollow triangle, defined by in the same triangle with two dots, and a flow in a filled head. A succession is dashed with an open head. A connection is plain, with its name at its middle.
- A selected box has a 2 px teal outline and eight handles: four round ones of 8 px at the corners and four along the sides. A selected line turns teal.
- Below 25% zoom a box is its outline, without words, and lines lose their labels, as on the old page.
- The other shapes keep their old forms: an item and an action as rounded boxes, a state rounder still, a fork or join as a bar, a decision or merge as a diamond, start as a dot, done as a bullseye.

### How the look is checked

There are two kinds of check, both through Playwright with Chromium from `file://`.

**What can be measured is asserted in tests.** The top bar is at most 40 px high at 1400 px and at 800 px wide, holds only icon buttons with names, and holds no tool. Text is drawn in Roboto, loaded from the page's folder. A definition's corners have radius 0 and a usage's 10 px. A port's middle lies on its owner's border, before and after a resize. A selected box shows eight resize controls. Each line kind carries its marker. Every browser test ends by checking that the page logged no error and no warning.

**What must be seen is looked at.** `npm run shots` writes screenshots into `canvas/app/shots/` at 1400 × 900 and device scale 2. I look at each one against its list below before the step's commit. They are committed, so GitHub shows you each change to the look as an image diff.

| Screenshot | Step | What it must show |
|---|---|---|
| `shell.png` | 5, again at 13 | The whole window: one bar of 40 px with four actions and About; three names on the left strip and one on the right; nothing wrapped or cut off; Roboto |
| `example.png` | 6 | The example fitted: `Page` holding `hosts` and `app`; each `api` port across its owner's border, its name outside; `mount` joining the two ports; three hollow triangles pointing at `Host`; the two defined-by lines with their dots; no line through a name |
| `nodes.png` | 7 | At 150%: a selected part def with its doc compartment and eight handles, a part with round corners, a port with its arrow |
| `scale.png` | 8 | The 5,000-element general view fitted: outlines only, no words |
| `palette.png` | 11 | The right-click menu on a part def, at the pointer, in its groups |
| `about.png` | 12 | The About panel with every line answered |

The screenshots are not compared pixel by pixel. Such a test pins details that every step of the look changes on purpose and that change with the container's Chromium, and when it fails it does not say what is wrong. The assertions say what is wrong, and the image diffs show it.

## 5. The steps

Every step is done in this order: its tests first, seen to fail; then the code; then `npm run build`, `npm run check` and `npm test`; then the screenshots it names; then a commit holding the sources, the tests, `canvas/dist/` and `plan/status.json`, pushed to the branch. A large step may be several commits, each with every test passing. The old suite runs in full at steps 2 and 13, and between them `unchanged.test.mjs` stands in for it (step 3).

### Step 1. The plan and the state documents

- **What it delivers.** This plan is in the repository, its decisions are written into the direction, and the state documents say that the slice has begun.
- **Files.** The step creates `plan/slice-1.md` (this text). It changes `plan/direction.md` (a new section, "Decided for slice 1", holding the decisions of section 7), `plan/status.json` (slice 1 becomes `"in progress"`, with `"plan"`, `"step"` and the `checks` of section 6, each `"todo"`), and `plan/notes.md` (session 14 begun: the baseline, and what was tried outside the repository).
- **Done when.** `plan/status.json` parses, and `git diff --stat` shows only files under `plan/`.

### Step 2. Install, build, check, test: a page that opens from `file://`

- **What it delivers.** The commands below work in a new container, and there is a page that is empty but real: it loads the model library and the libraries, mounts React, and says Grasp.

```sh
npm ci              # node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ → canvas/dist/
npm run check       # fails when canvas/dist/ isn't what the sources build, or the types don't hold
npm test            # node --test --test-timeout=120000 canvas/app/test/*.test.mjs
npm run test:old    # the README's command for the old page's and the library's tests
npm run shots       # the screenshots, from step 5 on
```

- **Order.** First come `package.json`, the helpers and the first test, which is run and seen to fail for want of a page. Then comes the build.
- **Files.** The step creates `package.json` (private; every version exact; no `type` field, because `canvas/test/index.js` is CommonJS; Playwright is not listed, since the container brings it), `package-lock.json`, `.gitattributes` (marks `canvas/dist/**` as generated, so GitHub folds its diffs), `canvas/app/build.mjs`, `canvas/app/tsconfig.json`, `canvas/app/index.html`, `canvas/app/src/main.tsx`, `canvas/app/src/vendor.ts`, `canvas/app/src/app.css`, `canvas/app/src/types.d.ts` (the part of `window.SysMLModel` the application uses, and the stylesheet imports), `canvas/app/test/helpers.mjs`, `canvas/app/test/build.test.mjs` and `canvas/app/test/shell.test.mjs` (its first test). The build writes `canvas/dist/index.html`, `model-lib.js`, `vendor.js`, `vendor.css`, `app.js`, `app.css`, `fonts/roboto-latin-{400,500,700}-normal.woff2`, `vendor/elkjs/elk.bundled.js` with `LICENSE.md`, and `THIRD-PARTY-NOTICES.txt`. The step changes `README.md` ("Run it" gains the commands).
- **The versions.** `react` and `react-dom` 18.3.1, `@xyflow/react` 12.10.2, `dockview-react` 8.9.0, `@mui/material` and `@mui/icons-material` 7.3.11, `@mui/x-tree-view` 8.29.3, `@emotion/react` 11.14.0, `@emotion/styled` 11.14.1, `@fontsource/roboto` 5.3.0, `elkjs` 0.11.0; for building, `esbuild` 0.28.2, `typescript` 6.0.2, `@types/react` 18.3.31, `@types/react-dom` 18.3.7.
- **What `build.mjs` does.**
  1. It writes `model-lib.js` from `libraryCode()` of `canvas/build.mjs`, which it imports and does not change.
  2. It bundles `vendor.ts` into `vendor.js` and `vendor.css`: the libraries, put on `window.GraspVendor`, their stylesheets, and Roboto's Latin files copied into `fonts/`. The script is minified, with the libraries' legal comments kept at its end.
  3. It bundles `main.tsx` into `app.js` and `app.css`. A small esbuild plugin answers every import of a library from `window.GraspVendor`. Whitespace is minified and names are kept, so the file changes little from commit to commit.
  4. It copies elkjs's file and licence unchanged, and never bundles them.
  5. It writes the notices file from esbuild's own record of what went into each script: for each package its name, version, licence, and the text of its licence file; and the same for Roboto, for elkjs, and for `SysML.ecore`, whose lists are inside `model-lib.js`. It fails on a licence outside MIT, ISC, BSD, Apache-2.0, EPL-2.0 and OFL-1.1, so that a person looks.
  6. With `--check`, it builds in memory and names the first file of `canvas/dist/` that differs.
- **Done when.** After `rm -rf node_modules`, the first four commands pass. `build.test.mjs` passes: the built page is what the sources build; the model library in the page is the text `export.mjs` runs; every package in the scripts is in the notices file with its licence's text; elkjs is a file of its own, byte for byte the package's, and in no bundle; the page asks for nothing outside its own folder. `shell.test.mjs` › "from file://, the page opens with no console error" passes. `npm run test:old` still passes 221 of 221.

### Step 3. The "Done when" tests, written first

- **What it delivers.** Each remaining check is a named test that runs and fails for the right reason. Each is marked `{ todo: … }`, so node's runner reports its failure as todo and the command still exits 0. Session 8 wrote the scale tests the same way.
- **Files.** The step creates `canvas/app/test/resize.test.mjs`, `scale.test.mjs`, `unchanged.test.mjs` and `unchanged.json`. It changes `canvas/app/test/shell.test.mjs` (three more tests), `canvas/app/test/helpers.mjs` (opening a state file through the file input; `until`, `timing` and `measure`, copied from `canvas/test/helpers.mjs`, which goes away with the old page), and `plan/status.json`.
- **The test that is not todo.** `unchanged.test.mjs` passes from now to the end of the slice. It runs the six test files that run in Node (`build`, `lookups`, `metamodel`, `model-lib`, `store-dump`, `stored`). It also compares the SHA-256 of every file the old page and the library are made of with `unchanged.json`, written in this step: `canvas/src/`, `canvas/test/`, `canvas/index.html`, `canvas/build.mjs`, `canvas/export.mjs`, `canvas/save-state.mjs`, `canvas/check.sh`, `canvas/state.json`, `canvas/examples/`, `canvas/metamodel/` and `docs/sysml/check.sh`.
- **Done when.** `npm test` exits 0 and reports `# fail 0` and `# todo 8`. Each todo test's message names what is missing (a tab, a sash, a handle), not a mistake in the test.

### Step 4. The core, without an interface

- **What it delivers.** The history with redo, the session, and opening and saving exist and are tested in Node.
- **Files.** The step creates `canvas/app/src/core/history.ts`, `session.ts`, `files.ts` and `index.ts`; `canvas/app/test/core.mjs` (bundles the core with esbuild in memory and loads it beside `loadLib()` of `canvas/export.mjs`); and `canvas/app/test/history.test.mjs` and `files.test.mjs`.
- **`history.ts`** is `changes.js` ported: the Proxy traps and their notes, `edit(change, key)` with the contract that `canvas/src/README.md` gives under "Changing the model", `endEdit()`, the report of a write made outside `edit()`, `undo()`, and `redo()`. Undo keeps what the step's keys and lists held just before it put the old values back, and Redo puts that back. A new change empties the redo list. In place of calling `render()`, a change tells its listeners what it touched and whether it changed the structure. Opening a file is not an edit: it starts a session with an empty history.
- **`session.ts`** reads the model through `M.normalize`, so files of older versions upgrade as they do today.
- **`files.ts`** opens through `showOpenFilePicker` where it exists and through a file input otherwise, and writes the state file in the shape of `stateFile()` in `canvas/src/core/page/io.js`.
- **Done when.** `history.test.mjs` passes: a change is one step, undone and redone; the keystrokes of one key are one step; a run back where it started is no step; a write outside `edit()` is reported; a new change forgets the redo list; a change says what it touched. `files.test.mjs` passes: the example and each of the nine fixtures, opened and saved with no change, hold the same model, notes, archive and code links, and `canvas/export.mjs` prints each one's pinned text from the saved file.

### Step 5. The shell

- **What it delivers.** The top bar, the dock with its two strips and the editor group, the card of the empty editor, the theme and Roboto are as section 4 describes them. A file opens from the bar or the card, and each of its views gets a tab, its plane still empty. The panels' sizes and which are collapsed are kept in this browser (localStorage, `grasp-app:layout:1`). A tab cannot be popped out into another window, which a page opened from disk refuses.
- **Files.** The step creates `canvas/app/src/shell/App.tsx`, `TopBar.tsx`, `Dock.tsx`, `EmptyCard.tsx`, `theme.ts`, `canvas/app/test/shots.mjs` and `canvas/app/shots/shell.png`. It changes `canvas/app/src/main.tsx`, `app.css` and `canvas/app/test/shell.test.mjs`.
- **If edge groups disappoint.** The fallback is Dockview's ordinary groups, which the spike used, hidden and shown from two buttons in the bar. The notes say which was built.
- **Done when.** "no header palette or button row exists" and "a sash drag resizes the Explorer" pass without their todo marks. Three more tests pass: a side panel collapses to its strip and opens again; the panels' sizes are remembered across a reload; the text is drawn in Roboto, loaded from the page's folder. `shell.png` shows what its row in section 4 lists.

### Step 6. The adapter and the planes

- **What it delivers.** Every view of a graph kind is drawn on its tab, and the other kinds show their card.
- **Files.** The step creates `canvas/app/src/core/adapter.ts`, `canvas/app/src/plane/Plane.tsx`, `viewStore.ts`, `NotDrawnYet.tsx`, `nodes/BoxNode.tsx` (the shapes `rect`, `rounded`, `item`, `action`, `state`), `nodes/PortNode.tsx` (`port`, `param`), `nodes/SmallNode.tsx` (`bar`, `diamond`, `dot`, `bullseye`, `entry`, `event`), `edges/LineEdge.tsx`, `edges/markers.tsx`, `canvas/app/test/adapter.test.mjs`, `plane.test.mjs` and `canvas/app/shots/example.png`.
- **The adapter's rules.**
  1. There is one node for each element the view's `layout` places, owners before what they hold. A box's parent is its nearest owner that the view shows.
  2. A box's position is its `x, y`. Its size is its `w, h`, or more when its header, its compartments or what it holds need more, by `graphLayout`'s rule.
  3. A border item is a child node of its owner, placed from its `side` and `at` and the owner's size.
  4. There is one edge for each relationship that is not hidden and has both ends on the plane. Its marker, dash, label and route come from its row's `line`. The edge works out its own two ends from the boxes, as `straight` and `elbow` in `canvas/src/core/page/layout.js` do.
  5. A node or edge that reads the same as before is the same object as before, so React Flow skips it. A changed one is a new object that takes over React Flow's own fields.
  6. Below 25% zoom a box is its outline, and names and labels are left out.
- **The plane's gestures.** Dragging the ground pans. Scrolling pans, and Ctrl or ⌘ with scrolling, or a pinch, zooms, as today. Double-click zoom is off. The view is fitted once its nodes are placed.
- **Done when.** "the example shows its general view on a tab" passes without its todo mark. `adapter.test.mjs` passes in Node for the example, the nine fixtures and the 5,000-element model: parents come first; every placed element is a node and every drawn line an edge; a box holds what is inside it; a port lies on its owner's border. `plane.test.mjs` passes: a part sits inside its part def; each line kind has its marker; a definition's corners are square and a usage's round; a sequence view's tab says it is not drawn yet. `example.png` shows what its row lists.

### Step 7. Moving, resizing, undo, redo and save

- **What it delivers.** The settled changes are each written through `edit()`.
  - A drag's end is one undo step for every box moved. A nested box stays inside its owner, never left of 12 or above 48 from the owner's corner, as today, and the owner grows to hold it.
  - A port slides along its owner's border and changes side at a corner. The drop writes its `side` and `at`.
  - A resize's end writes `x, y, w, h`, never smaller than what the box holds or than `placement()` allows.
  - The bar's Undo, Redo and Save work, with Ctrl or ⌘ + Z, Ctrl or ⌘ + Y (or Shift + Z), and Ctrl or ⌘ + S.
  - React Flow's own delete key is switched off until slice 2 gives Delete its meaning.
- **Files.** The step changes `canvas/app/src/plane/Plane.tsx`, `viewStore.ts`, `nodes/*.tsx`, `shell/TopBar.tsx`, `core/files.ts` and `canvas/app/test/resize.test.mjs`. It creates `canvas/app/test/move.test.mjs` and `canvas/app/shots/nodes.png`.
- **Done when.** "a box resized by its handles keeps its size after save and reload" passes without its todo mark. The test opens the example through the file input, drags the bottom-right handle of `Host`, and saves. It checks the downloaded file: its `format` is `grasp/2`, the view's layout holds the new `w` and `h`, the notes and the archive are as they were, and `node canvas/export.mjs` prints `canvas/test/fixtures/format1.sysml` from it. Then it reloads, opens the saved file, and finds the size on the plane. A second test saves through the handle of a stubbed picker. `move.test.mjs` passes: a drag is one undo step, undone and redone; three boxes dragged together are one step; a nested box cannot leave its owner, and the owner grows; a port dragged past a corner changes side; a resize from the top left keeps the opposite corner. `canvas/check.sh` accepts a file the new page saved. `nodes.png` shows what its row lists.

### Step 8. The planes at scale

- **What it delivers.** The planes answer what the direction asks of this slice's scale test. The model is `scaleState(5000)` of `canvas/test/scale-model.mjs`.
- **How a step is timed.** It is timed as `timing` takes it today, inside the page: the script's time from the pointer event reaching the window to the end of its listeners, plus the main thread's work for the frame that follows. A view's store is read through `useSyncExternalStore`, whose updates React renders before the event's task ends, so that measure should hold all of a step's work. The step proves it with a mark at the plane's commit. If the commit falls outside, the measure is widened to reach it.
- **Tuning**, in this order, until the limits hold: unchanged nodes kept as the same objects; only what the window shows rendered; below 25% zoom, outlines without ports' names and lines without labels, then no lines; compartment rows as plain text.
- **If a limit still fails.** The test stays todo with its numbers. I stop and bring you the measurement, where the time goes, and a restated limit to approve, because restating one changes `plan/direction.md`.
- **Files.** The step changes `canvas/app/test/scale.test.mjs`, and what the measures point at in `canvas/app/src/plane/`. It creates `canvas/app/shots/scale.png`. `plan/notes.md` gets the table of times.
- **Done when.** Three tests pass without their todo marks, three runs in a row: "a 5,000-element model opens" (each of its three tabs draws and answers a click; the time is reported, and the test fails above 5 s, a bound of mine so that a later step cannot slow opening unnoticed), "a drag step takes under 16 ms at 5,000 elements in 3 views", and "a pan step of a fitted view takes under 16 ms at 5,000 elements".

### Step 9. The shared selection and the Explorer

- **What it delivers.** There is one selection, a list of elements, lines and views with the last picked first, which the planes and the panels read and set. On a plane a click selects, Ctrl or ⌘ + click adds, Shift + drag draws a marquee, and a click on the ground selects the view. The Explorer shows the package, its views, and then the library's tree rows as Tree View items. A click on a row selects, and a view's row opens its tab or brings it forward. After a change to the structure the Explorer builds its rows again; after any other it relabels the rows the change touched.
- **Files.** The step creates `canvas/app/src/core/selection.ts`, `canvas/app/src/panels/Explorer.tsx` and `canvas/app/test/selection.test.mjs`. It changes `canvas/app/src/plane/Plane.tsx` and `shell/Dock.tsx`.
- **Done when.** `selection.test.mjs` passes: a box picked on the plane is the selected row, and a row picked is the selected box; a marquee selects what it covers; Ctrl + click adds; a line's row selects its line; a closed tab opens again from its view's row; with the 5,000-element model only the package's row is unfolded, and a long list ends in "Show more". The three scale tests of step 8 still pass.

### Step 10. Details

- **What it delivers.** Details shows the fields of what was picked last, as Material UI widgets laid out by `M.detailsOf`: a Core and an Advanced tab under the metaclass's title. A `string`, `text` or `number` row is a text field, a `bool` a checkbox, an `enum` radio buttons, a `ref` a picker of the row's `options`. What the library knows but does not hold as a field is shown, and the rest says "not held yet", as today. Every change goes through `edit()`. Typing uses the key `<field>:<id>`, so a field is one undo step, ended when the field is left.
- **The hooks.** `fieldHooks.ts` ports them: the definition and its line, Specializes and Subsets, the lock on Is Parallel, and the words of each change. A message's `order` is shown but cannot be changed until slice 2 draws sequence views, because changing it must re-sort the messages. The code links wait for slice 2 as well.
- **Files.** The step creates `canvas/app/src/panels/Details.tsx`, `fieldHooks.ts` and `canvas/app/test/details.test.mjs`. It changes `canvas/app/test/scale.test.mjs`.
- **Done when.** `details.test.mjs` passes: every field that every kind, line and view lists in the example and the fixtures, changed through its widget, is one undo step, undone and redone, as `canvas/test/fields.test.mjs` walks them today; a rename shows on the box, the tab and the row as it is typed; picking another definition moves the typing's end. "a keystroke in a name takes under 50 ms at 5,000 elements" passes without its todo mark.

### Step 11. The Tools view and the right-click palettes

- **What it delivers.** One table of commands feeds both. The Tools view lists the tools of the active tab's view kind, in the groups its `tools` row gives. A click arms an element tool, and the next click on the plane places the element. A relationship tool takes two clicks, the first end and then the second. Escape puts a tool down. A right-click on the ground or on a box opens a menu of what can be made there: the element kinds the view admits and the box can hold, and on a box or a port the relationship kinds that may start there. What a rule refuses is said in a toast, in the rule's own sentence.
- **Files.** The step creates `canvas/app/src/core/commands.ts` (ports `place`, `freeName` and `createRel` with the two features' additions, and asks the library's rules), `canvas/app/src/panels/Tools.tsx`, `canvas/app/src/plane/Palette.tsx`, `canvas/app/src/shell/Toasts.tsx`, `canvas/app/test/tools.test.mjs` and `canvas/app/shots/palette.png`.
- **Done when.** `tools.test.mjs` passes. In each of the four graph view kinds, on the example and the fixtures, every tool of the kind's row is used once where the rules allow it: the element or line appears on the plane and in the Explorer, `M.validate` finds nothing new, and Undo takes it back. A port clicked onto the empty ground is refused, and the toast says where it can go. A specialization from a part def to a port def is refused in the library's sentence. Escape puts the tool down. `palette.png` shows what its row lists.

### Step 12. Validation and About

- **What it delivers.** The Validation panel and the About panel are as section 2 settles them.
- **Files.** The step creates `canvas/app/src/panels/Validation.tsx`, `canvas/app/src/shell/About.tsx`, `canvas/app/src/core/probe.ts`, `canvas/app/test/validation.test.mjs`, `about.test.mjs` and `canvas/app/shots/about.png`.
- **Done when.** `validation.test.mjs` passes: the example has no entry, and the panel says so; two part defs given one name are listed 0.8 s after the change, under Grasp's problems and under the specification's rules in SysON's words, and both entries go with Undo; a click selects what an entry is about. `about.test.mjs` passes: each line reports what this Chromium does, with GitHub's answer stubbed; with the pickers taken away, the panel says so and Open falls back to the file input. `about.png` shows what its row lists.

### Step 13. Closing the slice

- **What it delivers.** The documents are up to date, and the slice is marked done.
- **Files.** The step changes `README.md` ("What's here", "Run it", "Next"), `canvas/README.md` (the new page: what it does, and what only the old page does until slice 2), `plan/direction.md` ("What is not settled yet": the scale item answered with its measurements), `plan/status.json` (slice 1 `done`, `next` 2) and `plan/notes.md`. It creates `canvas/app/README.md` (how the application is laid out and how to add to it, as `canvas/src/README.md` does for the old page). It retakes `canvas/app/shots/shell.png`.
- **Done when.** From a clean clone, `npm ci && npm run build && npm run check && npm test && npm run test:old` passes, with `# todo 0`. `canvas/check.sh` accepts a file saved by the new page. The screenshots are current. Then it is yours to open `canvas/dist/index.html` from the downloaded repository and try the short list in `canvas/README.md`: open the example, drag a sash, collapse a panel, resize a box, save, reload, open the saved file, open About. What you find goes into the notes.

## 6. The tests, their status, and the state documents

**Where the tests are.** The new page's tests are in `canvas/app/test/`. The core's run in Node. The others open `canvas/dist/index.html` by its `file://` URL with Playwright's Chromium. The old suite stays in `canvas/test/`, unchanged.

**Tests first.** The ten checks of section 8 become tests in steps 2 and 3, before the code they check. Every other test is written at the start of its step and seen to fail.

**Where their status is kept.** It is kept in `plan/status.json`, on slice 1's entry: a `checks` list with one item per check, `{ "id", "check", "test", "status" }`. A status is `"todo"` until the commit that takes the test's todo mark off, which sets it to `"pass"`. The runner's summary is the cross-check: the number after `# todo` equals the number of checks still `"todo"`.

| After step | Checks that pass | `# todo` |
|---|---|---|
| 2 | 1 | none written yet |
| 3 | 1, 6 | 8 |
| 5 | and 3, 4 | 6 |
| 6 | and 2 | 5 |
| 7 | and 5 | 4 |
| 8 | and 7, 8, 10 | 1 |
| 10 | and 9 | 0 |

**When `plan/status.json` changes.** It changes in every step's commit: `step` names the step just finished, and the checks that step made pass change status. Step 1 sets the slice to `"in progress"`. Step 13 sets it to `"done"` and `next` to 2.

**When `plan/notes.md` changes.** Each working session has one entry, as always, begun in its first commit and finished in its last. Within a session, a step's commit adds at once whatever a later session cannot get from this plan or from the code: a measurement, a limit that failed, a file built otherwise than the plan names it, something tried and dropped.

**When this plan changes.** It changes only with your approval. If a step needs another shape, the notes say so, and the plan is not rewritten silently.

## 7. The decisions

### What the plan adds to `plan/direction.md`, with the reason for each

1. **The application lives in `canvas/app/`, with one `package.json` at the root.** `canvas/src/` belongs to the old build's checks, and one root file gives one install command.
2. **The build writes three classic scripts.** The page and `export.mjs` then run the same library text, a change to Grasp's code rewrites a small file, and third-party code stays apart for the notices.
3. **Every version is exact and locked.** Each session starts in a new container, and `npm ci` must give it the same libraries.
4. **The side views sit in Dockview's edge groups.** They resize by a sash and collapse to a strip, which is the complaint this slice ends. The cost is that a side shows one view at a time.
5. **A port is a node, a child of its owner's node.** Its gestures are then React Flow's own, as in SysON, and slice 2's handle drags have a node to start from.
6. **Each view's nodes are kept in a store outside React.** A hidden tab is unmounted and must find its state again, and an update from such a store is rendered inside the event that caused it, so a step can be timed inside the handler.
7. **Slice 1 draws the four graph view kinds with all 13 shapes; the other four kinds show a card; no frame is drawn while a tab holds one view.** A general view admits every kind, sequence and geometry wait for slice 2's probe, and a lone frame says only what the tab says.
8. **Slice 1 saves the state file it opened, and remembers no file.** The fifth check needs a save, and the workspace folder with its remembered handle is slice 3's.
9. **The look is Grasp's ink and teal in SysON's proportions, light only, checked by assertions and by screenshots that are looked at.** SysON's colours are its brand, and section 4 gives the reason for not comparing pixels.
10. **The "Done when" checks are tests written first and marked todo, with their status in `plan/status.json`.** Session 8 wrote the scale tests that way, and the status file is what every session reads first.
11. **The scale test holds four limits, and a limit that fails comes back to Damon.** Two are from "Done when" and two from "What is not settled yet", and restating one changes the direction.

### Where the plan departs from that document

- **Dockview 8.9.0, not 8.8.3.** "What was checked" names 8.8.3. That release of `dockview-react` now installs the 8.9.0 core, which is what this session's trial ran, so the plan pins 8.9.0 for all three Dockview packages.
- **Relationships can be drawn in slice 1.** The direction gives slice 2 the drawing of relationships, by dragging from handles. The plan adds the plain way now, two clicks from the Tools view or a palette, because the view kinds' tools list relationship kinds, and a listed tool that does nothing is worse than none. Slice 2 still adds the handles.
- **Two measures beyond "Done when".** The keystroke and the far zoom come from "What is not settled yet". The 5 s bound on opening is mine.

In everything else the plan keeps to the document.

### What Damon decided

Damon approved the plan on November 12 and took the recommendations on items 1 to 3. Items 4 and 5 stay open.


1. **React Flow's mark.** React Flow draws a small "React Flow" link in the corner of every plane. Its makers allow removing it, and ask organisations that earn from it to support them. I recommended hiding it on the planes and naming React Flow in About and in the notices file. **Decided:** hidden on the planes, credited in About and in the notices file.
2. **A dark theme.** The old page follows the system's dark setting. I recommended light only in this slice, with the colours in one file (`theme.ts`), and deciding on a dark set at slice 7, "The finish of the look". **Decided:** light only until slice 7.
3. **Drawing relationships by two clicks in this slice.** I recommended it, for the reason above. Striking it would have kept slice 1 to the letter of the direction: the Tools view and the palettes would then list element kinds only. **Decided:** relationships are drawn by two clicks in this slice.
4. **Later, perhaps: a restated limit.** If step 8 or step 10 cannot hold a limit, I bring you the measurement and a proposal, and go on with the steps that do not depend on it. **Open.**
5. **Still open from session 7: the repository's own licence.** It does not block the slice. Step 2 writes the first notices file, which names `SysML.ecore`'s EPL-2.0 beside the libraries' licences. **Open.**

## 8. Each "Done when" check, its step and its test

Every test below opens `canvas/dist/index.html` by its `file://` URL in Chromium, except number 6, which runs in Node.

| # | The check, in the direction's words | Step | Test |
|---|---|---|---|
| 1 | "opened from the file system in Chromium with no console error" | 2, and every step after | `shell.test.mjs` › "from file://, the page opens with no console error". Every other browser test ends with the same check. |
| 2 | "the example shows its general view on a tab" | 6 | `shell.test.mjs` › "the example shows its general view on a tab" |
| 3 | "no header palette or button row exists" | 5 | `shell.test.mjs` › "no header palette or button row exists" |
| 4 | "a sash drag resizes the Explorer" | 5 | `shell.test.mjs` › "a sash drag resizes the Explorer" |
| 5 | "a box resized by its handles keeps its size after save and reload" | 7 | `resize.test.mjs` › "a box resized by its handles keeps its size after save and reload" |
| 6 | "the library's Node tests pass unchanged" | 3, held to the end | `unchanged.test.mjs` › "the library's Node tests pass, and the old page, the library and their tests are byte for byte as the slice found them" |
| 7 | "a 5,000-element model opens" | 8 | `scale.test.mjs` › "a 5,000-element model opens" |
| 8 | "a drag step measured inside the handler stays under 16 ms, or the limit is restated with the measurement" | 8 | `scale.test.mjs` › "a drag step takes under 16 ms at 5,000 elements in 3 views" |
| 9 | From "What is not settled yet": "a keystroke under 50 ms" | 10 | `scale.test.mjs` › "a keystroke in a name takes under 50 ms at 5,000 elements" |
| 10 | From "What is not settled yet": "a far zoom that draws outlines and culls edges keeps a fitted 5,000-node view responsive" | 8 | `scale.test.mjs` › "a pan step of a fitted view takes under 16 ms at 5,000 elements" |

Against the limits of `plan/direction.md`, the plan holds as follows. The page opens from the file system with no server, as classic scripts with nothing fetched from beside it. Nothing is installed on the workplace machine, because the built page is committed. The libraries are the ones the direction names, vendored with their notices, elkjs as its own file. The old page, the model library and the saved format do not change. The history sits outside React, the nodes are chosen by the kind rows, and the adapter is one function.

## 9. What Damon approved

Damon approved this plan on November 12, 2026, with the recommendations of section 7 on its three choices. The approval lets the working session create and change the files the plan names, commit after each step, and push each commit to the working session's branch. The plan was written on `claude/grasp-slice-1-plan-mmntfd`, which was never pushed; the steps are built on the branch of the session that builds them, which `plan/notes.md` names. No pull request is opened unless Damon asks for one.
