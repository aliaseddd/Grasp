# Grasp's architecture for slices 2 to 7

November 14, 2026, session 29. Written for Damon's approval, as `plan/slice-1.md` was. It is not approved yet.

## What this plan settles

`plan/direction.md` says what Grasp becomes, in seven slices. Slice 1 is built. This plan is the layer between that document and each later slice's own plan. It settles three things for slices 2 to 7:

1. **The parts of the system**, and which slice creates or changes each part (section 1).
2. **The contracts between the parts** (section 3). Each contract says what crosses it, which part owns it, which parts use it, which slice introduces it, and which later slices change it.
3. **The order of the work** (section 5): what must wait for what, and what can be built at the same time.

It leaves the inside of each slice to that slice's own plan: its steps, its test lists, its components' props, the words on the screen. Slice 2 is next, so its section goes one level further and lists its work packages with the files each package owns.

Each slice's plan is written by a model that sees only that slice's section, the contracts the section names, and the files they point to. Such a plan must not change a contract. A planner who finds a contract wrong stops and says why. The change then comes back to this document and to Damon.

Three lists are kept apart from the plan itself. Section 7 lists what this plan assumes without proof. Section 8 lists where it departs from `plan/direction.md`. Section 9 lists the questions only Damon can answer. Nothing in sections 8 and 9 is decided until Damon decides it.

## The words

These words keep one meaning in this document. The first six are slice 1's (`canvas/app/README.md`).

| Word | Meaning |
|---|---|
| The application, the page | The code in `canvas/app/`, and the page it builds, `canvas/dist/index.html`. |
| The old page | `canvas/index.html`, built from `canvas/src/`. Slice 2 deletes it. |
| The core | The part of the application with no React in it, `canvas/app/src/core/`. It runs in Node too. |
| The model library | The plain scripts `canvas/src/core/lib/*.js` and `canvas/src/*/lib.js`, stitched into one script, `model-lib.js`. It holds the kinds, the rules, the label grammar, the checks and the writer. The page and Claude's scripts run the same text. |
| A session | One open model in the page: its history, its notes, its name, and whether it has unsaved changes. |
| The adapter | The function that turns one view of the saved model into the nodes and edges a plane draws. |
| A reader | A function of the core that turns one view of the saved model into plain data for a body that is not a plane: a table's rows, a tree's rows, a sequence's lifelines. The adapter and the readers together are **the adapter layer**. |
| A body | What draws one view. A **graph body** is nodes and edges that React Flow draws on a plane. A **component body** is one React component that draws the whole view by itself: a table, a tree, or SVG. |
| A mark | Something shown on a node, a line or a row that does not come from the model: that it is selected, that it has a problem, that a note is pinned to it. |
| A workspace | The folder Damon picks, and what the page has open from it: its models, its tabs, its notes. |
| A carrier | One way a workspace's files travel: a folder on disk, picked files and downloads, or GitHub. |
| The codec | The functions that turn a workspace's files into what the page holds in memory, and back. |
| The text service | The OpenSysML module behind one interface: text to elements, elements to text, diagnostics, names. |
| A work package | One piece of a slice that one agent can build from one brief, with files of its own. |
| A probe | A short experiment at the start of a slice that answers one question of `plan/direction.md`, "What is not settled yet". |

## 1. The parts of the system

"Created" and "Changed in" name slices. A part with no later slice stays as it is.

### The model, its formats and its files

| Part | Where | What it is | Created | Changed in |
|---|---|---|---|---|
| The model library | `canvas/src/core/lib/`, `canvas/src/*/lib.js`; stitched by `libraryCode()` of `canvas/build.mjs` into `canvas/dist/model-lib.js` | The kinds and their rows, the rules, the label grammar, the checks (`validate`, `validateSpec`), the writer (`toSysML`), the format `grasp/2` with its upgrades | Before the redesign | 3 (the claude.ai store's code leaves), 4 (its model layer is rewritten for `grasp/3`; the kind rows become presentation only), 7 (default sizes) |
| The metamodel | `canvas/metamodel/`, which writes `canvas/src/core/lib/metamodel.js` | Every class of SysML v2 with its attributes, from the pilot implementation's `SysML.ecore` | Before the redesign | None. Slice 4 reads all of it. |
| The state file, `grasp/2` | Any `.json` the page opens: `{ format, revision, saved, model, notes, archive, changes }` | The saved form of one model until slice 3 | Before the redesign | 3 (no longer what the page saves; it still opens, always). Contract 15. |
| The workspace's files | A folder: the workspace file, and for each model a model file, its `.sysml` twin, its view files and its notes file | The saved form of the work from slice 3 on | 3 | 4 (what a model file holds), 7 (image files beside them). Contract 16. |
| The model's form `grasp/3` | Inside a model file | The SysML v2 API's element form, with Grasp's own ids | 4 | None. Contract 21. |
| The Grasp library | `canvas/library/Grasp.sysml` | A small SysML library that defines `CodeLink` | 6 | None |
| The fixtures | `canvas/test/fixtures/*.json` with pinned `.sysml`; `canvas/examples/` | Nine state files and the example, each with the text it must export | Before the redesign | 3 (a workspace fixture is added), 4 (a `grasp/3` fixture with many metaclasses is added), 6 (the example's code text becomes links). The nine stay as they were saved. |

### The application, `canvas/app/src/`

| Part | Where | What it is | Created | Changed in |
|---|---|---|---|---|
| The history | `core/history.ts` | `edit()`, undo, redo, and what each change touched | 1 | 4 |
| The session | `core/session.ts` | One open model | 1 | 2, 3, 4 |
| Opening and saving a state file | `core/files.ts` | The file picker, the file input, the download | 1 | 2 (notes), 3 (saving moves to the workspace; opening a state file stays) |
| The adapter | `core/adapter.ts` | Contract 5 | 1 | 2, 3, 4, 5, 7 |
| The readers | `core/readers/*.ts` | Contract 5 | 2 | 4 |
| The selection | `core/selection.ts` | Contract 3 | 1 | 3, 5 |
| The commands | `core/commands.ts`, `core/actions/*.ts`, `core/keys.ts` | Contract 4 | 1 (the first), 2 (the other two) | 2, 4 |
| The checks | `core/checks.ts` | Contract 8 | 1 | 2, 4, 5 |
| The marks | `core/marks.ts` | Contract 7 | 2 | 4 |
| The notes | `core/notes.ts` | Contract 9 | 2 | 3, 4 |
| The label editing | `core/labels.ts` | What a typed label changes, over the library's grammar | 2 | 4 (rows, and what the grammar can set), 5 (completion) |
| The code links | `core/codeLinks.ts` | Contract 10 | 2 | 4, 6 |
| The text of a model | `core/text.ts` | Contract 13 | 2 | 4, 5 |
| The workspace | `core/workspace/` (`codec.ts`, `workspace.ts`, `carriers/*.ts`, `github.ts`) | Contracts 16 to 19 | 3 | 4 (the upgrade), 7 (image files) |
| The layout by ELK | `core/arrange.ts` | Contract 24 | 3 | 4, 7 |
| The text service | `core/textService/` | Contract 23 | 4 | 5, 6 |
| The import | `core/import.ts` | Text into a model, with ids given | 4 | 5 (a file imported again keeps its ids) |
| The probe | `core/probe.ts` | What About reports about this browser | 1 | 3 (a write to GitHub), 4 (the module's start time) |
| The shell | `shell/` | The top bar, the dock, the card, About, the toasts, the theme | 1 | 2, 3, 5, 7 |
| The side panels | `panels/` | Explorer, Tools, Details, Validation | 1 | 2 (Notes; sections of Details), 4, 5, 6, 7 (Search) |
| The planes | `plane/` | The graph body: React Flow, a view's store, the node and edge components | 1 | 2, 3, 4, 5, 7 |
| The other bodies | `views/` | The component bodies, the registry of bodies, the text tab | 2 | 3, 4, 5 |
| The build | `canvas/app/build.mjs`, `src/vendor.ts` | Contract 25 | 1 | 2, 4, 6, 7 |
| The page | `canvas/dist/`, committed | What Damon opens | 1 | Every slice |

### Outside the page

| Part | Where | What it is | Created | Changed in |
|---|---|---|---|---|
| The old page | `canvas/index.html`, `canvas/src/core/page/`, `canvas/src/*/page.js`, the styles, the 33 Playwright test files of `canvas/test/` | The page before the redesign | Before the redesign | 2 deletes it |
| The export and the check | `canvas/export.mjs`, `canvas/check.sh`, `docs/sysml/check.sh` | The model as text, and the pilot implementation's validator | Before the redesign | 2, 3, 4, 6. Contract 20. |
| The store's scripts | `canvas/save-state.mjs`, `canvas/src/core/lib/stored.js`, `canvas/state.json` | The loop through claude.ai | Before the redesign | 3 deletes them |
| The workspace scripts | `canvas/workspace.mjs` | Validate a workspace, list what a view shows, arrange a view | 3 | 4 |
| The import script | `canvas/import.mjs` | Text into a model file, on Claude's side | 4 | 5 |
| The OpenSysML module | `canvas/dist/opensysml/`, from the npm package or from a build of our own | The reader, the printer and the checker | 4 | 5 (more of it is used) |
| ELK | `canvas/dist/vendor/elkjs/`, shipped by slice 1 and not loaded yet | Layout | 1 | 3 (first used, in Node), 4 (first used in the page, in a worker), 7 |
| The tests | `canvas/app/test/`; `canvas/test/` keeps the model library's Node tests, the fixtures and the scale model | | 1 | Every slice. Contract 27. |
| The plan's documents | `plan/` | `status.json`, `notes.md`, this file, one plan per slice | | Every slice |

## 2. The rules every slice keeps

Slice 1 set most of these (`canvas/app/README.md`, "The rules a change keeps"; `plan/direction.md`, "Decided for slice 1"). They are repeated here because every contract counts on them.

1. **A change goes one way.** A gesture or a widget calls `edit()`. The history tells its listeners what the change touched. The adapter layer reads the touched views again. The stores hand the result to the bodies. The panels read again only what was touched. Nothing goes the other way.
2. **Only a change given to `edit()` writes a model.** A gesture that moves or resizes is one `edit()` at its end.
3. **The core has no React and no DOM**, and runs in Node. The core's tests and Claude's scripts load it there.
4. **Code gets its session from its props or from `useDock()`**, never from a global. `window.Grasp` is for looking only, and no test reads it.
5. **The page opens from `file://`.** It loads classic scripts only, and it fetches nothing from beside itself. A worker is made from a Blob URL. What a worker or a module needs arrives as text inside a classic script.
6. **Colours and measures are in `shell/theme.ts`. Libraries come through `src/vendor.ts`. A stylesheet sits beside its component.**
7. **In each slice, one work package owns the files that several packages need**: `vendor.ts`, `build.mjs`, `theme.ts`, `test/helpers.mjs`, and the shared files the slice's section names. That package runs first.
8. **"Done when" checks are tests written first**, marked todo, with their status in `plan/status.json`. No test is loosened, skipped or marked todo to pass. A limit that cannot be held goes to Damon with its numbers.
9. **The pilot implementation's validator, on Claude's side, is the authority on SysML v2 text.** What the page reports is a help while drawing. No diagnostic in the page blocks a save.
10. **SysON's design is taken from the inventory in `docs/sysml/syson/features/` and from its manual**, never from its code or its icons.

## 3. The interface contracts

Each contract has one owner. "Changed in" names every later slice that may change what crosses the contract. A slice that is not named there uses the contract as it finds it.

### Contract 1. The history: `edit()` and what it tells

- **Owner:** slice 1, `canvas/app/src/core/history.ts` (`History`, `Told`, `Touched`).
- **What crosses it:** a change goes in: a function that writes the model and returns the words of what it did, with an optional key that joins a run of changes into one undo step. What comes out, to every listener, is `Told`: who made the change (`edit`, `undo`, `redo`, `end`), the ids it touched in three lists (`elements`, `relationships`, `views`), whether the structure changed, which views it can have altered, and whether it only moved things. `mark()` names the state the model is in.
- **Consumers:** every action and gesture (they call `edit()`); the views' stores, the Explorer's rows, the selection, the tool in hand, the checks and the session (they listen).
- **Introduced in:** slice 1. **Changed in:** slice 4 only. There the model under the history takes the form `grasp/3`, so what the history records changes. `edit`, `endEdit`, `undo`, `redo`, `listen`, `mark` and every field of `Told` stay. The three lists of `Told.touched` then name elements by what a body shows them as: a node or a row, a line, a view.
- **Not changed in:** slice 2 (notes are outside the history, contract 9) and slice 3 (each open model keeps a history of its own, contract 2).
- **Sources:** `canvas/app/src/core/history.ts`; `canvas/src/README.md`, "Changing the model"; `plan/direction.md`, decision 9.

### Contract 2. The session, and the services kept for it

- **Owner:** slice 1, `canvas/app/src/core/session.ts` (`Session`, `openSession`).
- **What crosses it:** one open model: the model library it was read with, its name, its history, its model, its notes and archive, whether it has unsaved changes, and `listen`. Each service of a session is reached through a function that takes the session and gives the same object each time: `selectionOf`, `toolsOf`, `checksOf`, `viewStoreOf`, `explorerRowsOf`. A service is kept outside React, is made when first asked for, and listens to the session's history.
- **Consumers:** the shell (it holds the session and hands it down), every panel and body (through `useDock()` or their props), every service.
- **Introduced in:** slice 1. **Changed in:**
  - Slice 2 adds `notesOf(session)` (contract 9). `session.unsaved` is then also true when a note changed since the last save.
  - Slice 3 makes a session one model of a workspace (contract 19). Its `name` is the model's stem. Saving leaves the session and becomes the workspace's.
  - Slice 4 changes the type of `session.model` (contract 21).
- **The rule for a new service:** it follows the same form, `<name>Of(session)`, in a file of its own. It adds no field to `Session`.
- **Sources:** `canvas/app/src/core/session.ts`; `plan/swarm/shared.md`, section 1.

### Contract 3. The selection: `Picked` and `Hit`

- **Owner:** slice 1, `canvas/app/src/core/selection.ts` (`Selection`, `selectionOf`).
- **What crosses it:** `Picked` is one picked thing, `{ type: 'el' | 'rel' | 'view', id }`. `Hit` is one click on a body: the view, what was hit, where, and whether Ctrl or ⌘ was held. The selection is the one list of what is picked, the last picked first, with the view in front. Bodies and panels read it and set it. Nothing but the selection decides what is shown as selected.
- **Consumers:** every body, the Explorer, Details, Validation, the Tools view, the tool in hand, the actions.
- **Introduced in:** slice 1. **Changed in:**
  - Slice 3: `Picked` and `Hit` gain `model`, the stem of the model the thing belongs to, because ids are unique inside one model only. One selection then serves the whole workspace, and `selectionOf(session)` gives that one selection for every session. The view in front becomes the view whose frame was clicked last. The type checker finds every place that builds a `Picked`.
  - Slice 5: an element of a standard library can be picked. It gets a type of its own, and it is read-only.
- **The rule for slices 2 and later:** build a `Picked` from a `Hit` or from what a service gives. Do not build one from a node's id (contract 5 says why).
- **Sources:** `canvas/app/src/core/selection.ts`; `plan/direction.md`, "The fourteen decisions", 3 and 11.

### Contract 4. The command table and the tool in hand

- **Owner:** slice 1, `canvas/app/src/core/commands.ts` (`toolGroups`, `Tools`, `toolsOf`, `place`, `draw`, `Outcome`). Slice 2 adds the actions to it.
- **What crosses it:**
  - **Creation tools.** `toolGroups(lib, viewKind)` gives the tools of a view kind in groups. `place` makes an element and `draw` makes a relationship. Each is one `edit()`. Each answers with an `Outcome`: what it made, or the sentence that says why it was refused.
  - **The tool in hand.** `toolsOf(session)`: what is armed, the first end taken, the hint, and what it has to say. A click on a body is offered to the tool before it picks.
  - **Actions**, from slice 2: every command that is not a creation tool. Delete, Remove from view, Edit label, Add note, New view and the others are rows of one table:

    ```ts
    interface Action {
      id: string;                 // 'delete', 'remove-from-view', 'edit-label'
      title: string;              // what a menu and a tooltip call it
      key?: string;               // its keyboard shortcut, 'Delete', 'F2', 'Mod+Z'
      applies(session: Session): true | string;   // or the sentence that says why not
      run(session: Session): Outcome | void;
    }
    ```

    What an action does is in a file of `core/actions/`. One listener for the keyboard, `core/keys.ts`, reads the keys from the table.
- **Consumers:** the Tools view, the right-click palettes, the toasts, the bodies' clicks, the top bar, the keyboard listener. In slice 7, the Help panel reads the titles and the keys.
- **Introduced in:** slice 1 (tools), slice 2 (actions). **Changed in:** slice 4, where `toolGroups` offers every kind a view admits, grouped by family, and `place` and `draw` make any metaclass. Their signatures stay. Any slice adds rows to the table for its own commands. That is no change to the contract.
- **Two rules:** a refusal is a sentence that the command returns and a toast shows. A keyboard shortcut exists only as the `key` of an action. No component listens for a key of its own, except a text field for what is typed into it.
- **Sources:** `canvas/app/src/core/commands.ts`; `plan/direction.md`, "The fourteen decisions", 10; `plan/swarm/shared.md`, section 2.

### Contract 5. The adapter layer: from the saved model to what a body draws

- **Owner:** slice 1, `canvas/app/src/core/adapter.ts` (`project`, `projectStep`, `placesFor`, `Projection`). Slice 2 adds the readers, `canvas/app/src/core/readers/*.ts`.
- **What crosses it:** a model and one of its views go in. For a graph body, a `Projection` comes out: the view's nodes and edges with their places and sizes, parents before what they hold. For a component body, the reader's plain data comes out, with the size the body needs. A node, an edge or a row that reads the same as before comes out as the same object.
- **Consumers:** each view's store (`plane/viewStore.ts`), each component body, the layout by ELK (contract 24), the workspace scripts (contract 20).
- **Introduced in:** slice 1. **Changed in:**
  - Slice 2: nodes get real connection handles. Each node and edge carries the ids of its element and its view in its `data`, and the adapter gives `elementOf(node)` and `relationshipOf(edge)`. The readers are added.
  - Slice 3: a plane shows several views, each inside a frame, and one element can be on a plane twice. A node's id is then no longer an element's id.
  - Slice 4: the adapter layer reads `grasp/3`. A node becomes generic: its compartments are its owned members by kind, and a row names an element. What the adapter layer gives to the stores and the bodies keeps its form.
  - Slice 5: a row can be an inherited member. The adapter reads it from a cache that the text service fills (contract 23). The adapter itself never waits.
  - Slice 7: sizes follow SysON's defaults. If a scale limit fails, a far view is drawn as one picture.
- **The rules:** the adapter layer is pure and does not wait: the same model and view give the same result. It knows no React, no DOM, no store and no selection. It is the only place that knows a rule of place or size. Places are counted from the view's origin. From slice 2 on, code outside the adapter layer and the stores never reads a node's id as an element's id.
- **Depends on:** the round-trip probe at the start of slice 4, which decides only what the adapter layer reads.
- **Sources:** `canvas/app/src/core/adapter.ts`; `canvas/app/README.md`; `plan/direction.md`, decisions 2 and 9; `plan/notes.md`, session 17, "The architecture".

### Contract 6. A view's body

- **Owner:** slice 2, `canvas/app/src/views/bodies.ts` (the registry).
- **What crosses it:** the registry maps a view kind's `renderer` (a word in its row of the model library: `graph`, `sequence`, `geometry`, `grid`, `browser`) to a body. Each body takes `{ session, viewId }` and nothing else. A body must do six things:
  1. Read its view only through the adapter layer (contract 5).
  2. Change the model only through actions and `edit()` (contracts 1 and 4).
  3. Turn each click into a `Hit` and offer it to the tool in hand before it picks (contracts 3 and 4).
  4. Show the marks (contract 7).
  5. Draw itself in any rectangle its host gives it, and keep what it must find again (a camera, a scroll place) in a store outside React, because a hidden tab is unmounted.
  6. Say how large it wants to be. A graph body's size is its projection's bounds. A component body's size comes from its reader.
- **Consumers:** the dock (slice 2: a tab holds one body). In slice 3, a frame on a plane holds a body: a graph body's nodes become children of the frame, and a component body is drawn inside one node of the plane. In slice 7, image export and Arrange all work on bodies. Arrange all applies to graph bodies only.
- **Introduced in:** slice 2. **Changed in:** slice 3 (the host is a frame). Slice 4 changes what the bodies read, behind contract 5.
- **Depends on:** the probe for sequence and geometry views at the start of slice 2. If React Flow serves a kind, that kind has a graph body, and its reader gives a `Projection`. If it does not, the kind has a component body that draws SVG. The registry, the six duties and every consumer are the same under both outcomes.
- **Sources:** `plan/direction.md`, "The slices", 2 and 3, and "What is not settled yet"; `canvas/app/src/core/adapter.ts` (`isDrawn`).

### Contract 7. Marks

- **Owner:** slice 2, `canvas/app/src/core/marks.ts`.
- **What crosses it:** for an element or a relationship, by its id: how many problems it has, and the numbers of the notes pinned to it. The marks come from the checks (contract 8) and the notes (contract 9). Whether a thing is selected stays the selection's (contract 3). A view's store puts the marks on its nodes and edges after each projection, as it already puts `selected`. A node, an edge or a row whose marks did not change stays the same object.
- **Consumers:** the node and edge components, the component bodies.
- **Introduced in:** slice 2. **Changed in:** slice 4 (a row of a node carries marks too).
- **The rule:** the adapter layer never reads the checks, the notes or the selection. A store adds what they say.
- **Sources:** `canvas/app/src/plane/viewStore.ts` ("Step 9: what is selected is the session's selection").

### Contract 8. The checks

- **Owner:** slice 1, `canvas/app/src/core/checks.ts` (`checksOf`, `ChecksState`, `aboutProblem`, `aboutDiagnostic`).
- **What crosses it:** the lists of what is wrong with a session's model, worked out after a pause in the changes, each entry with the sentence and with what it is about (a `Picked`, or nothing). There are two lists today: Grasp's own problems (`validate`) and the rules of the specification that the model library checks (`validateSpec`).
- **Consumers:** the Validation panel, the marks, the grid body's problems column, the text tab.
- **Introduced in:** slice 1. **Changed in:**
  - Slice 2: the checks run while any body or panel that shows them is shown, not only the Validation panel.
  - Slice 4: the model library's checks read `grasp/3`.
  - Slice 5: a third list, "Specification", comes from the text service, with a longer pause of its own. Each of its entries has a file, a line and a column, and what it is about when the element can be found.
- **The rule:** every list has the same form of entry, so a consumer shows a new list without new code. No entry blocks a save or an export (rule 9).
- **Depends on:** what the module flags that the pilot accepts (`plan/direction.md`, "What is not settled yet"). The Specification list is a second opinion under every outcome, so no contract changes with the answer.
- **Sources:** `canvas/app/src/core/checks.ts`; `plan/direction.md`, decision 4 and "The slices", 5.

### Contract 9. Notes and the archive

- **Owner:** slice 2, `canvas/app/src/core/notes.ts` (`notesOf`).
- **What crosses it:** a note is a record, as the old page keeps it (`tidyNote` in `canvas/src/core/page/state.js`):

  ```ts
  interface Note {
    id: string;                 // [A-Za-z0-9_-]{1,64}
    no: number;                 // its number on the drawing; a new note takes the largest number + 1
    target: string | null;      // the id of the element or relationship it is on; null for a free note
    targetLabel: string;        // the target in words, as it was when the note was written
    text: string;
    by: 'user' | 'claude';
    created: string; updated: string;   // ISO times
    response: string;           // Claude's answer; '' while there is none
    resolved: boolean;          // Claude sets it
    // a free note only: where it floats
    x?: number; y?: number;
    // an archived note only
    archived?: string; resolution?: string;
  }
  ```

  `notesOf(session)` gives the open notes and the archive, and the ways to change them: add, change the text, move to another target or to a free place, remove, archive, restore. It tells its listeners after each change.
- **Consumers:** the Notes panel, the marks, the grid body's notes column, the text of a model (contract 13), the codec (contract 16), and Claude, who writes `response` and `resolved` on its side.
- **Introduced in:** slice 2. **Changed in:**
  - Slice 3: notes are saved in a notes file of their own (contract 16). A note Claude answered arrives with a Pull.
  - Slice 4: a note's `target` is still an element's id, because the upgrade keeps every reference whole (contract 21).
- **The rules:**
  - Notes are not in the history. A change to a note is not undone by Undo, as on the old page.
  - Notes are saved apart from the model's elements, in every slice. Answering a note never changes a model file.
  - A free note belongs to one model, and floats at a place counted from one of that model's views. Through `notesOf` its place is always `{ view, x, y }` in that view's own units. In a `grasp/2` state file the place stays the old page's `x` and `y` on its one plane, and `core/notes.ts` converts both ways with the views' own `x` and `y`. From slice 3 the notes file holds `view`, `x` and `y` directly.
  - A consumer must accept a note whose `target` names nothing. Claude can delete an element by hand, and Undo can bring a target back.
- **Sources:** `canvas/src/core/page/state.js`, lines 43 to 62; `canvas/src/annotations/lib.js` (`noteRecords`, `noteStatements`); `canvas/README.md`, "How the loop works"; `plan/direction.md`, decisions 5 and 7. Section 7 has the assumption this contract makes about decision 5.

### Contract 10. Code links

- **Owner:** slice 2, `canvas/app/src/core/codeLinks.ts`.
- **What crosses it:** `codeLinksOf(session, elementId)` gives the code links of an element, and the changes to them (add, remove, change a field) are each one `edit()`. What a link holds changes by slice:

  | Slices | A link holds | Where the model keeps it | How the text writes it |
  |---|---|---|---|
  | 2 and 3 | `{ path, language, text }` | The element's `code` field, a list | `rep '<path>' language "<language>" /* text */` |
  | 4 and 5 | The same | Textual representation elements that the element owns | The same |
  | 6 | `{ repository, path, ref, lines, language }`; the code text leaves the model | A metadata usage of `Grasp::CodeLink` that the element owns | `metadata` of `CodeLink` |

- **Consumers:** the Code section of Details, the adapter (the `code` compartment of a box), the text of a model.
- **Introduced in:** slice 2. **Changed in:** slice 4 (the upgrade turns each link into a textual representation element, so the exported text says the same before and after) and slice 6 (the new form). From slice 6, a textual representation that an older file holds is an element like any other, which the generic node and form show. It is no longer a code link. The example's links are rewritten in slice 6 as links into the Stronghold repository.
- **The rule:** nothing but `core/codeLinks.ts` and the adapter layer knows where the model keeps a link.
- **Sources:** `canvas/src/annotations/lib.js` (`tidyCode`, `codeLines`); `plan/direction.md`, decision 8.

### Contract 11. The Details form

- **Owner:** slice 1, `canvas/app/src/panels/fieldHooks.ts` (`formOf`, `changeField`, `FIELD_HOOKS`, the row types) and `panels/Details.tsx`.
- **What crosses it:** for what was picked last, a form: a title, tabs, groups, and rows. Each row has a type (`string`, `text`, `number`, `bool`, `enum`, `ref`), and Details draws a widget by the type. A change of a row is one `edit()`. From slice 2, Details also shows **sections** under the form. A section is a component in a list, with a function that says whether it applies to what is picked.
- **Consumers:** `panels/Details.tsx`.
- **Introduced in:** slice 1. **Changed in:**
  - Slice 2 adds the sections: a view's own (what it shows, its kind's options) and the code links. It adds hooks for the fields that slice 1 left locked.
  - Slice 4 makes the form generic: every attribute of any metaclass, by type, with a picker of candidates for a reference.
  - Slice 5 fills a picker's candidates from the model's and the libraries' names, and makes the form read-only for a library's element.
  - Slice 6 replaces the code links section.
- **The rule:** a new kind of field is a row type with one widget. A new block that is not a field is a section in a file of its own. No slice adds a branch for one kind inside `Details.tsx`.
- **Sources:** `canvas/app/src/panels/fieldHooks.ts`; `canvas/src/README.md`, "The panel's fields".

### Contract 12. The Explorer's rows

- **Owner:** slice 1, `canvas/app/src/panels/explorerRows.ts` (`explorerRowsOf`).
- **What crosses it:** the rows of the model as a tree, kept outside React: which rows there are, which are unfolded, and what each says. After a change to the structure the rows are built again. After any other change only the touched rows are worded again.
- **Consumers:** the Explorer. From slice 2, the browser body, which is the same tree with chosen roots. From slice 7, the Search panel.
- **Introduced in:** slice 1. **Changed in:** slice 2 (a row is renamed in place), slice 3 (one root for each open model), slice 4 (rows for every metaclass: packages inside packages, imports), slice 5 (a read-only root for the standard libraries, filled from the text service), slice 7 (icons).
- **Sources:** `canvas/app/src/panels/explorerRows.ts`; `canvas/src/browser/lib.js` (`browserRows`, `browserRoots`).

### Contract 13. The text of a model

- **Owner:** slice 2, `canvas/app/src/core/text.ts` (`exportText`).
- **What crosses it:**

  ```ts
  type TextResult =
    | { text: string; problems: string[] }   // the SysML v2 text, and what keeps it from being correct
    | { unavailable: string };               // a sentence: why this page cannot print it, and where it can be printed
  function exportText(session: Session): Promise<TextResult>;
  ```

  The text holds the model, its views, its notes and its code links, as the old page's Export SysML gives it.
- **Consumers:** the text tab (slice 2: read-only, with Copy). From slice 3, Save, which writes the `.sysml` twin, and `canvas/export.mjs`, which prints the same text on Claude's side. From slice 5, the text tab with its diagnostics.
- **Introduced in:** slice 2, where the answer comes at once from the model library's `toSysML` and `validate`. **Changed in:** slice 4, where the text service prints the text (contract 23) and the model library's writer is kept as the cross-check over the fixtures.
- **Depends on:** the probes of slice 4. The function is asynchronous and can answer `unavailable` from the start, so its callers do not change, whatever the probes find. If OpenSysML prints, the text is its conversion. If the fallback route is taken, the text is the model library's writer, grown to every metaclass. If the module does not run in the page, the answer is `unavailable`, Save writes no twin, and Claude's side writes it.
- **Sources:** `canvas/src/core/lib/sysml.js`; `canvas/export.mjs`; `plan/direction.md`, decision 6.

### Contract 14. The dock: panels and tabs

- **Owner:** slice 1, `canvas/app/src/shell/Dock.tsx` and `shell/dockContext.ts` (`useDock`).
- **What crosses it:** a side panel is a component without props, listed in the dock's table and put on a strip. A tab of the editor holds one view. `useDock()` gives a panel the session and the ways to open a file and to show a view. The dock tells the selection which view is in front.
- **Consumers:** every panel, every body, the card of the empty editor.
- **Introduced in:** slice 1. **Changed in:**
  - Slice 2: a Notes panel. A tab that is not a view (the text tab). A view's tab holds the body its kind's `renderer` names (contract 6).
  - Slice 3: the tabs come from the workspace file, and a tab holds several views in frames. `useDock()` also gives the workspace. The panels' sizes are kept in the workspace file, and in this browser only when no workspace is open.
  - Slice 5: one text tab for each model. Slice 7: a Search panel.
- **Sources:** `canvas/app/src/shell/Dock.tsx`; `canvas/app/README.md`, "How to add"; `plan/swarm/shared.md`, section 3.

### Contract 15. The state file, `grasp/2`

- **Owner:** the model library (`normalize`, `VERSION`, `UPGRADES` in `canvas/src/core/lib/model.js`) for the model inside it; slice 1, `canvas/app/src/core/files.ts` (`StateFile`, `openText`, `stateText`) for the file around it.
- **What crosses it:** one JSON file, `{ format, revision, saved, model, notes, archive, changes }`. `model` is `{ format: 'grasp/2', revision, package, elements, relationships, views }`. Each view holds its own `layout`: the place of each element it shows, by the element's id.
- **Consumers:** the page (Open and Save), `canvas/export.mjs`, `canvas/check.sh`, the fixtures' tests.
- **Introduced in:** before the redesign. **Changed in:** none. The form of the model inside it does not change in slices 2 and 3, so each fixture exports its pinned text throughout.
  - Slice 2 reads and writes the notes and the archive through `notesOf` (contract 9), in the same records.
  - From slice 3 the page saves a workspace's files instead. A state file still opens, always: the page takes it into the workspace as a new model. `canvas/export.mjs` still reads one.
- **Sources:** `canvas/app/src/core/files.ts`; `canvas/src/README.md`, "The saved format"; `README.md`, "Decided on November 7, 2026".

### Contract 16. The workspace's files, and the codec

- **Owner:** slice 3, `canvas/app/src/core/workspace/codec.ts`.
- **What crosses it:** a workspace is a folder with these files. `<stem>` is a model's file name without its endings, chosen when the model is made.

  | File | What it holds | It changes when |
  |---|---|---|
  | `grasp.workspace.json` | `{ file: 'grasp-workspace/1', models: [<stem>, …], tabs: [{ id, views: [{ model, view, x, y }], camera }], layout, github: { repository, branch } }` | A tab, a frame's place, a camera or the panels' layout changes |
  | `<stem>.model.json` | `{ file: 'grasp-model/1', model }`. The model is in the format its `format` names. In `grasp/2`, each view is here without its places: `{ id, kind, name, doc, shows: [<element id>, …] }` | The model changes |
  | `<stem>.sysml` | The model's text (contract 13): the twin | It is written at each save whose model file changed |
  | `<stem>.views/<view id>.view.json` | `{ file: 'grasp-view/1', view, layout: { <element id>: <place> }, options }` | A box is moved or resized, or a view's option changes |
  | `<stem>.notes.json` | `{ file: 'grasp-notes/1', notes: [Note, …], archive: [Note, …] }` (contract 9) | A note changes |

  The codec is two pure functions over a map from path to text. They read no disk and no network:

  ```ts
  type FileMap = Map<string, string>;                 // path inside the workspace → the file's text
  function readWorkspace(files: FileMap): { record: WorkspaceRecord; models: Map<string, StateFile>; problems: string[] };
  function writeWorkspace(record: WorkspaceRecord, models: Map<string, StateFile>, before?: FileMap): FileMap;   // only the files that differ from `before`
  ```

  Through slice 3 the page holds each model in memory as it does today, a `grasp/2` model whose views carry their `layout`. The codec splits it into the files and puts it together again. So nothing above the codec changes when the files arrive.
- **Consumers:** the workspace in the page (contract 19), the scripts on Claude's side (contract 20), the upgrade to `grasp/3` (contract 21). Claude reads and edits the files directly.
- **Introduced in:** slice 3. **Changed in:** slice 4, where `model` inside a model file takes the form `grasp/3` and a view's `shows` becomes the view element's own exposes. The other four files keep their form. Slice 7 adds image files beside them and one key to a place (`pinned`).
- **The rules:**
  - **What the exported text depends on is in the model file. Where things sit is in a view file.** Which elements a view shows is the model's, so showing an element changes the model file and the twin. Moving a box changes one view file and nothing else. Slice 3's plan sorts each view kind's options by the same rule.
  - **The files are written the same way each time**: two spaces, a fixed order of keys, one newline at the end. A file whose text did not change is not written. So a diff on GitHub shows what changed and nothing else.
  - **The files can be edited by hand, so the codec forgives.** An element in `shows` with no place gets one from the model library's rule for an unplaced element. A place for an element that `shows` does not list is dropped. A missing view file means that nothing is placed yet. A note whose target names nothing is kept. Each such repair is a sentence in `problems`.
  - **From slice 4, a place keeps the keys the reader does not know.** Until then the model library's `placement()` keeps only `x, y, w, h` or `side, at`, and no slice before 7 writes another key.
  - The token for GitHub is never in a file.
- **Sources:** `plan/direction.md`, decisions 5, 7 and 9, and "The slices", 3; `plan/scope.md`, "The loop: files, Claude and GitHub".

### Contract 17. Carriers: how a workspace's files travel

- **Owner:** slice 3, `canvas/app/src/core/workspace/carriers/`.
- **What crosses it:** every carrier has one interface:

  ```ts
  interface Carrier {
    kind: 'folder' | 'files' | 'github';
    list(): Promise<string[]>;                        // the paths it holds
    read(path: string): Promise<string>;
    write(path: string, data: string | Blob): Promise<void>;
    remove(path: string): Promise<void>;
  }
  ```

  The `folder` carrier is a folder's handle from `showDirectoryPicker`, remembered in this browser. The `files` carrier reads files chosen through a file input and writes each file as a download. The `github` carrier reads and writes a branch through contract 18.
- **Consumers:** the workspace in the page (contract 19), and nothing else. A consumer never learns which carrier it has.
- **Introduced in:** slice 3. **Changed in:** none.
- **Depends on:** what the machine allows, and the probe at the start of slice 3 (a real write to GitHub from a page opened from disk). The contract is the same under each outcome. Only which carrier does each job changes:

  | What the machine allows | Open | Save | To Claude and back |
  |---|---|---|---|
  | The folder picker works, and a write to GitHub works (expected on Damon's machine) | `folder` | `folder`, in place | `github`: Pull and Push |
  | A policy blocks the folder picker | `files`, through a file input | `files`, as downloads | `github`: Pull and Push |
  | A policy suppresses every file dialog | `github`: a Pull is the opening | `files`, as downloads | `github` |
  | The write to GitHub fails from a page opened from disk | As above | As above | Pull still reads through `github`. In place of Push, Damon saves, and gives the saved files to Claude through github.com's own upload page or through the conversation. Claude commits them. |

  Under the last outcome, the third "Done when" check of slice 3, "Push on a stale file refuses", cannot pass as written. It then goes back to Damon to be restated, as slice 1's limit did.
- **Sources:** `plan/direction.md`, "What was checked", decision 7, and "What is not settled yet".

### Contract 18. GitHub access

- **Owner:** slice 3, `canvas/app/src/core/workspace/github.ts`.
- **What crosses it:** a fine-grained token that Damon pastes once, kept in this browser's own storage and never written to a file or sent anywhere but api.github.com. `read(repository, ref, path)` gives a file's text and its version. `tree(repository, ref)` lists the files. `write(repository, branch, path, text, version)` writes one file, and refuses with a sentence when the branch holds another version than the one given, so a Push never writes over what it has not seen. `urlOf(repository, ref, path, lines)` gives the address of a file on github.com.
- **Consumers:** the `github` carrier, the About panel's probe, and in slice 6 the Code section (`urlOf` for "Open on GitHub", `read` for the excerpt).
- **Introduced in:** slice 3. **Changed in:** none. Slice 6 only reads.
- **Depends on:** the same probe as contract 17. Reading from GitHub works on Damon's machine (`plan/direction.md`, "Damon's machine"), so what slice 6 uses holds under both outcomes.
- **Sources:** `plan/direction.md`, decisions 7 and 8.

### Contract 19. The workspace in the page

- **Owner:** slice 3, `canvas/app/src/core/workspace/workspace.ts`.
- **What crosses it:** the workspace is what the shell holds in place of one session: the workspace's record (the tabs, the panels' layout, the repository and branch), one session for each open model by its stem, and the carrier. It gives: open a folder, add a new model, take a state file or a text file in as a model, save (every changed file, through the carrier), pull, push, write one more file into the folder, and `listen`.
- **Consumers:** the shell (the top bar, the dock, the card of the empty editor), `useDock()`, the About panel. From slice 4, the import. From slice 7, image export, which writes its files through the workspace.
- **Introduced in:** slice 3. **Changed in:** slice 4 (on opening, a workspace in an older format is upgraded, contract 21).
- **The rules:** each model keeps its own session and history (contracts 1 and 2). A change to a model goes through that model's `edit()`. The tabs, the frames' places and the cameras are the workspace record's. No module outside `core/workspace/` and the shell reads the record.
- **Sources:** `plan/direction.md`, decision 7, and "The fourteen decisions", 1 to 7.

### Contract 20. The scripts on Claude's side

- **Owner:** each script belongs to the slice that creates it. All are in `canvas/`.
- **What crosses it:** the commands Claude runs in its turn of the loop, and what each reads and writes. Each script runs the same code as the page: the model library through `loadLib()` of `canvas/export.mjs`, and the core, bundled in memory by esbuild as `canvas/app/test/core.mjs` does today.

  | Command | What it does | Created | Changed in |
  |---|---|---|---|
  | `node canvas/export.mjs <what>` | Prints a model's text (contract 13). `<what>` is a state file. From slice 3 it can also be a workspace folder with a model's stem. | Before the redesign | 3 (reads a workspace; no longer reads a dump of the claude.ai store; can write the twins), 4 (prints through the text service in Node, with the model library's writer as the cross-check) |
  | `canvas/check.sh <what>` | Exports, then runs the pilot implementation's validator. The authority on the text. | Before the redesign | 6 (loads `canvas/library/Grasp.sysml` before the model) |
  | `node canvas/build.mjs` | Builds the old page. | Before the redesign | 2 (it keeps only `libraryCode()` and what reads a state file) |
  | `node canvas/save-state.mjs` | Writes `canvas/state.json` and builds the old page. | Before the redesign | 2 (it builds no page), 3 (deleted with the store's code) |
  | `node canvas/workspace.mjs validate <folder>` | Reads the workspace through the codec, prints the codec's problems and the model library's, and exits 1 when there are any. | 3 | 4 |
  | `node canvas/workspace.mjs views <folder> [<stem> <view>]` | Lists what a view shows, with each thing's place and size as the adapter gives them. This is how Claude reads a diagram. | 3 | 4 |
  | `node canvas/workspace.mjs arrange <folder> <stem> <view>` | Arranges one view with ELK (contract 24) and writes its view file. | 3 | 7 (the same options as the page's Arrange all) |
  | `node canvas/workspace.mjs upgrade <folder>` | Upgrades a workspace's files to the newest format (contract 21), as the page does when it opens the folder. | 4 | |
  | `node canvas/import.mjs <text file> <folder>` | Turns a `.sysml` or `.kerml` file into a model of the workspace, through the text service in Node. | 4 | 5 (a file imported again keeps its ids) |
- **Consumers:** Claude, and the loop section of `canvas/README.md`, which slice 3 rewrites and each later slice keeps current.
- **The rule:** what a script can do, the page's own code does. A script holds no rule of its own about the model or the files.
- **Sources:** `canvas/export.mjs`; `canvas/check.sh`; `plan/direction.md`, decision 1 and "The slices", 3.

### Contract 21. The model's form `grasp/3`, and the upgrade

- **Owner:** slice 4. The form and the upgrade are in the model library, where `grasp/2` and its upgrades are.
- **What crosses it:**
  - **The form.** A model is a list of elements in the SysML v2 API's JSON form, as OpenSysML's conversion writes it: one record for each instance of a metaclass, with `@type` (the metaclass), the specification's names for its properties, and references as `{ "@id": … }`. Memberships, imports, typings, multiplicities, literals and documentation are elements too. The one difference from what OpenSysML writes is the ids: each `@id` is Grasp's own, given once when the element is made or first imported, and kept for the element's life.
  - **An element is named by its model and its id**, as from slice 3 (contract 3). No consumer counts on an id being unique across models.
  - **The upgrade works on a whole workspace.** It takes the file map of a workspace in `grasp/2` and gives the file map of the same workspace in `grasp/3`. It either keeps every id (of each element, relationship and view), or it rewrites every reference to an id in the view files, the notes files and the workspace file in the same step. No other part needs to know which. Code links become textual representation elements (contract 10). The page upgrades a workspace when it opens it, and saves it in the new form. A state file is first taken into a workspace, as slice 3 does it, and is upgraded there.
  - **What a view shows** is what its view element exposes. The view file keeps the places (contract 16).
- **Consumers:** the codec, the adapter layer, the actions, the Details form, the model library's rules and checks, the text service, the import, Claude.
- **Introduced in:** slice 4. **Changed in:** none. `plan/direction.md`, decision 5, allows one format change.
- **Depends on:** the round-trip probe at the start of slice 4, in two ways. First, whether OpenSysML's conversion takes Grasp's ids back as they are. If it does not, the text service maps Grasp's ids to the converter's and back at its border, and the saved form is the same. Second, whether the conversion writes back every construct. If it does not, the fallback route is taken (contract 23). The saved form is the standard element form with Grasp's ids under every outcome.
- **Sources:** `plan/direction.md`, decisions 5 and 6, "The slices", 4, and "What is not settled yet"; `plan/spikes/README.md`.

### Contract 22. Who may read the model's shape

- **Owner:** this plan. Slice 4 is the consumer: it rewrites exactly the modules listed here.
- **What crosses it:** the list of the modules that may read or write the fields of a model's records (an element's `kind` and `owner`, a relationship's `from` and `to`, a view's `layout`). Every other module works with ids and with what these modules give it.

  | Module | What it gives to the others |
  |---|---|
  | The model library | Its functions and tables: `childrenOf`, `typingOf`, `textName`, `describe`, `validate`, `KINDS`, and the rest |
  | `core/adapter.ts`, `core/readers/*` | Contract 5 |
  | `core/commands.ts` (`place`, `draw`), `core/actions/*` | Contract 4 |
  | `core/labels.ts` | What a typed label changes |
  | `core/codeLinks.ts` | Contract 10 |
  | `panels/fieldHooks.ts` | Contract 11 |
  | `panels/explorerRows.ts`, through the model library's `browserRows` | Contract 12 |
  | `plane/viewStore.ts`, for one thing only: it writes the places at a gesture's end | |
  | `core/workspace/codec.ts`, from slice 3: it splits the views' places from the model | Contract 16 |
- **Introduced in:** this plan; it holds from slice 2. **Changed in:** none.
- **The rule for slices 2 and 3:** a new module that must read the model's shape is added to this list in the slice's plan, with its reason. A component never reads a field of a model's record. So slice 4 knows what it must rewrite, and the count does not grow unseen.
- **Sources:** `plan/direction.md`, decisions 1 and 9; `canvas/app/README.md`, "Which way a change goes".

### Contract 23. The text service: OpenSysML behind one interface

- **Owner:** slice 4, `canvas/app/src/core/textService/`.
- **What crosses it:** every call answers with a promise. Slice 4 builds the first four members. Slice 5 adds the last four.

  ```ts
  interface TextService {
    status(): { available: boolean; why: string; inWorker: boolean; startedIn: number | null };   // for About and for the callers
    toElements(files: TextFile[], onProgress?: (done: number, of: number) => void): Promise<{ elements: unknown[]; diagnostics: TextDiagnostic[]; refused: string[] }>;
    toText(elements: unknown[]): Promise<{ text: string; refused: string[] }>;
    libraries: TextFile[];              // Grasp's own library texts, given to the module with every call; empty until slice 6
    // from slice 5:
    check(files: TextFile[]): Promise<TextDiagnostic[]>;
    complete(prefix: string, where: ElementRef): Promise<string[]>;        // names for a typing, a specialization or an import
    libraryRows(parent: string | null): Promise<LibraryRow[]>;             // the standard libraries, as rows for the Explorer
    membersOf(element: ElementRef): Promise<Member[]>;                     // what the element inherits
  }
  interface TextFile { path: string; text: string }
  interface TextDiagnostic { file: string; line: number; column: number; message: string; severity: 'error' | 'warning'; qualifiedName: string | null }
  ```

  `toElements` gives elements in the standard form with the converter's ids. `core/import.ts` gives them Grasp's ids. `toText` takes elements in the form of contract 21.
- **Consumers:** the import and the text of a model (slice 4); the Specification list, completion, the libraries in the Explorer, inherited members, the text tab and the insertion of text (slice 5); `canvas/export.mjs` and `canvas/import.mjs`, which run the same service in Node; the About panel (`status`); slice 6, which adds `canvas/library/Grasp.sysml` to `libraries`.
- **Introduced in:** slice 4. **Changed in:** slice 5 (the four members above), slice 6 (one library text).
- **The rules:**
  - The module is loaded on the first call, never when the page starts. It is never the live model.
  - What a body needs from the service while it draws (inherited members) is kept in a cache for the session that tells its listeners, as the checks are. The adapter reads the cache and never waits.
  - Nothing outside the text service names one of the module's own kinds (`partUsage`). Only the metamodel's class names cross the interface.
  - An element is found again from a diagnostic, or from a text read again, by its qualified name and its metaclass. That one rule is in `core/import.ts`.
- **Depends on:** four questions of "What is not settled yet", all answered by probes at the start of slice 4. The interface is the same under every answer:

  | Question | Outcome | Inside the text service | What the consumers see |
  |---|---|---|---|
  | Which module | The full service, built to WebAssembly by Claude | Every member is served over the typed client | Nothing different |
  | | The published command-line build, driven over an emulated terminal | `toElements` and `toText` run its conversions. The typed module may be loaded beside it for the members of slice 5. | Nothing different |
  | | The typed module only | `toElements` takes its structure from a syntax tree from elsewhere. `toText` is the model library's writer, grown to every metaclass. | `refused` names what could not be read or written |
  | The converter's fidelity | It writes back every construct of the fixtures and the pilot's examples | OpenSysML prints | Nothing different |
  | | It refuses some | The fallback route: the model library's writer prints, and the import takes its structure from a syntax tree. `plan/notes.md` and About say so. | Nothing different |
  | A worker for the module | The module runs in a worker made from a Blob URL | Calls do not block the page, and `onProgress` is called as the work goes | `status().inWorker` is true |
  | | It does not | The module runs inline. A call blocks the page while it works. The service refuses a text too large to read without a long freeze, with a sentence that names Claude's side. | `status().inWorker` is false |
  | The module on Damon's machine | It starts and reads fast enough | | `status().available` is true |
  | | It is too slow | The service does not load the module in the page | `status().available` is false, and `why` says that Claude's side imports and prints: `canvas/import.mjs`, `canvas/export.mjs` |

  If the module runs inline or not at all in the page, the third "Done when" check of slice 5 (a 5,000-symbol import "with a progress indication and no frozen page") cannot pass as written. It then goes back to Damon to be restated.
- **Sources:** `plan/direction.md`, decisions 4 and 6, "What was checked" (the parsers), and "What is not settled yet"; `plan/spikes/README.md`.

### Contract 24. The layout by ELK

- **Owner:** slice 3, `canvas/app/src/core/arrange.ts`.
- **What crosses it:** `arrange(projection, options, elk)` takes a view's projection (contract 5), which holds every node's size, and gives a place for each node. It is one mapping from a projection to ELK's graph and back. Whoever calls it gives it the ELK to use.
- **Consumers:** `canvas/workspace.mjs arrange` on Claude's side, with ELK in Node (slice 3). The import, which places new elements where a view exposes them, with ELK in a worker of the page (slice 4). Arrange all in the page (slice 7).
- **Introduced in:** slice 3. **Changed in:** slice 4 (the worker in the page, made from a Blob URL), slice 7 (options for each view kind; boxes marked `pinned` keep their places).
- **The rules:** nothing but `core/arrange.ts` calls ELK. ELK never runs on the page's own thread. Places that ELK gives are written through `edit()`, as one undo step.
- **Sources:** `plan/direction.md`, "What was checked" (ELK's timings) and "The slices", 3, 4 and 7.

### Contract 25. The build, and what the page is made of

- **Owner:** slice 1, `canvas/app/build.mjs` and `canvas/app/src/vendor.ts`.
- **What crosses it:** `npm run build` writes `canvas/dist/`, which is committed: `index.html`, `model-lib.js`, `vendor.js`, `app.js`, their stylesheets, the fonts, elkjs as a file of its own, and `THIRD-PARTY-NOTICES.txt`. The application imports a library only through the table in `vendor.ts`. The build refuses a package that is not in the table, or whose licence is not on its list.
- **Consumers:** Damon, who opens `canvas/dist/index.html`; the tests, which open the built page; `npm run check`.
- **Introduced in:** slice 1. **Changed in:**
  - Slice 2: more of the libraries the page already has (icons, a table). When the old page goes, `model-lib.js` is still built from `libraryCode()`.
  - Slice 4: the OpenSysML module as a classic script, loaded when first needed by a script tag the page adds. ELK's text for its worker. The notices gain Apache-2.0's text for OpenSysML, and EPL-2.0's text with the SysML v2 Release's copyright holders for the libraries inside it.
  - Slice 6: the text of `canvas/library/Grasp.sysml`, inside `app.js`.
  - Slice 7: `html-to-image`, for image export.
- **Sources:** `canvas/app/build.mjs`; `plan/direction.md`, "What was checked" (licences) and "Decided for slice 1".

### Contract 26. The look

- **Owner:** slice 1, `canvas/app/src/shell/theme.ts`.
- **What crosses it:** every colour and measure of the page, as constants and as `--grasp-*` variables for the stylesheets. The page is light only.
- **Consumers:** every component and stylesheet.
- **Introduced in:** slice 1. **Changed in:** slice 7 only: SysON's node colours and default sizes, one function that gives the icon of a metaclass, and a dark set if Damon asks for one then.
- **The rule for slices 2 to 6:** a slice adds the colours it needs to `theme.ts` and changes none. It draws no icon for a kind. What a screenshot's reviewer would change about the look, and no check asks for, is written in `plan/notes.md` for slice 7.
- **Sources:** `canvas/app/README.md`, "The rules a change keeps"; `plan/direction.md`, "Decided for slice 1" and "The slices", 7.

### Contract 27. What the tests share, and the status file

- **Owner:** slice 1, `canvas/app/test/helpers.mjs` and `canvas/app/test/core.mjs`; `plan/status.json`.
- **What crosses it:** how a test finds the page's parts (the `data-testid` names at the top of `helpers.mjs`); how a test opens the page and a file; how a step is timed inside the page; the ten state files (`TEN`) with their pinned texts; the 5,000-element model of `canvas/test/scale-model.mjs`; and `unchanged.test.mjs`, which fails when a pinned file changes. `plan/status.json` holds each slice's "Done when" checks with their tests and their status.
- **Consumers:** every test; every session, which reads `plan/status.json` first.
- **Introduced in:** slice 1. **Changed in:** every slice adds names and helpers. Slice 2 pins `unchanged.json` again when the old page goes: it then guards the model library, the fixtures and the scripts. Slice 3 adds a workspace fixture and a stand-in for the folder picker. Slice 4 adds a `grasp/3` fixture. Slice 7 sets the scale tests' baselines again.
- **The rules:** the four limits of slice 1 hold in every slice: a 5,000-element model opens, a drag step under 16 ms, a keystroke in a name under 50 ms, a pan step of a fitted view under 16 ms (under 25 ms for the 2,112-node view). A timed test is judged with nothing else running on the machine. Each fixture, opened and saved, still exports its pinned text, until slice 4 states what replaces that check.
- **Sources:** `canvas/app/test/helpers.mjs`; `plan/swarm/shared.md`, section 6; `plan/direction.md`, "Compartment rows at Grasp's scale".

## 4. The slices

Each section says what the slice builds, what it uses from earlier slices, what it gives to later ones, and its "Done when" checks in the words of `plan/direction.md`. "Its plan decides" lists what is left to the slice's own plan. Everything else that crosses the slice's edge is fixed by the contracts.

Every slice starts the same way: `npm ci`, `npm run check`, `npm test`, and a reading of `plan/status.json`, of the last session of `plan/notes.md`, of `canvas/app/README.md`, and of its section here.

### Slice 2. Editing parity

**What Damon gets.** Everything he does on the old page today, done on the new page. Then the old page is deleted.

**What it uses from slice 1.** The history (contract 1), the session (2), the selection (3), the tools and the tool in hand (4), the adapter (5), the checks (8), the Details form (11), the Explorer's rows (12), the dock (14), the state file (15), the build (25), the look (26), the tests' shared parts (27). The model library, unchanged.

**What it creates.** The actions and the keyboard listener (contract 4), the readers (5), the bodies and their registry (6), the marks (7), the notes (9), the code links (10), the sections of Details (11), the text of a model (13).

**What it changes.** The session, whose notes go through `notesOf` (2). The adapter: handles, and who a node is (5). The checks, which run while a body is shown (8). The Explorer's rows, renamed in place (12). The dock: a Notes panel, a tab that is not a view, a body by the view's kind (14). `canvas/build.mjs` and `canvas/save-state.mjs`, which stop building the old page (20). The build's table of libraries (25). The tests' shared parts and `unchanged.json` (27).

**What it gives to later slices.** A body for each of the eight view kinds, which slice 3 puts into frames. The notes behind `notesOf`, which slice 3 saves in a file of their own. `exportText`, which slice 3 writes the twin with. The action table, which slice 4 fills for every metaclass and slice 7 lists under Help. The label editor, which slice 4 opens on rows. The list in contract 22, which slice 4 rewrites.

**"Done when"** (`plan/direction.md`, "The slices", 2): "every fixture opens and, saved from the new page, exports its pinned text; the Playwright suite, rewritten for the new page, passes with the scale tests; `canvas/index.html` and the SVG renderer are gone." Slice 1's four limits still hold (contract 27).

**What it finds out first.** Whether React Flow nodes serve the sequence view and the geometry view, or custom SVG inside the tab does: a day's probe for each kind. Contract 6 holds under both answers, so only packages 2-10 and 2-11 wait for them.

**What the old page does, and what is new.** Read from the old page's code in this session (section 7 says how far it was checked):

- The old page draws a line by two clicks only. Slice 1 has that already. Drawing by dragging from a handle, with a small menu when more than one kind fits, and reconnecting by dragging an end are new behaviour. Their design comes from `plan/direction.md` and from SysON's inventory, not from the old page.
- Notes and the archive are not part of the model on the old page, and Undo does not take a change to a note back. Contract 9 keeps both.
- For the sequence, geometry, grid and browser views, the model library holds the order of things and the units. The layout itself is in the old page's scripts (`canvas/src/sequence/page.js`, `geometry/page.js`, `grid/page.js`, `browser/page.js`), so it is ported into the readers.
- The six test files of `canvas/test/` that run in Node read the model library out of the built `canvas/index.html`. Deleting the old page changes where they load it from (section 8, departure 4).

**The rules for every package of this slice.**

1. The form of a `grasp/2` model does not change, and no `lib.js` file changes. A package that needs a change in the model library stops and says so.
2. A package changes only the files it owns. The scaffold (package 2-1) owns every shared file.
3. A module that must read the model's shape is one of those in contract 22. The new ones of this slice are the readers, `core/actions/*`, `core/labels.ts` and `core/codeLinks.ts`.
4. Each package writes its tests first, from the old page's tests of the same feature where there are any, and sees them fail.

**The work packages.** Paths are under `canvas/app/src/` unless they begin with `canvas/` or `plan/`. "Ports" names the old page's code that shows the behaviour to keep. The old page's files are read, never changed.

| Package | What it delivers | Files it owns | Contracts it uses | Ports |
|---|---|---|---|---|
| **2-0. The plan and the probes** | `plan/slice-2.md`, approved by Damon. One answer for each of the sequence and geometry views: a graph body or a component body, with the reason. | `plan/slice-2.md`, `plan/spikes/sequence/`, `plan/spikes/geometry/` | 5, 6 | `canvas/src/sequence/page.js`, `canvas/src/geometry/page.js` (to know what each view must do) |
| **2-1. The scaffold** | Every seam the other packages build on, and a skeleton of every file they own, with its contract as a comment. The page behaves as before. | The shared files, below | All | |
| **2-2. Lines by dragging** | A drag from a node's handle draws a relationship the view kind allows. A small menu asks which kind when more than one fits. A drag of a line's end reconnects it. A refusal is a toast in the rule's own sentence. | `plane/gestures/connect.ts`, `plane/ConnectMenu.tsx`, `core/actions/connect.ts` | 1, 3, 4, 5 | None: new behaviour. The rules are the model library's `RELATIONSHIPS[kind].first` and `.ends`, which `draw` already asks. |
| **2-3. Label editing** | F2, or typing with something selected, opens an editor over the label of a node or a line, in SysON's grammar. Enter keeps it, Escape puts it away. One undo step. | `core/labels.ts`, `plane/LabelEditor.tsx` | 1, 3, 4 | `canvas/src/labels/page.js`; the grammar stays in `canvas/src/labels/lib.js` (`readLabel`, `applyLabel`, `labelText`, `labelEditable`, `labelWords`, `labelLeftOut`) |
| **2-4. Deleting, showing, and views** | Delete (an element with what it holds and every line on it). Remove from view. Show an element in a view, Show all, Show kind. New view, delete view. The view's section of Details: its fields, what it shows, its kind's options. | `core/actions/remove.ts`, `core/actions/views.ts`, `panels/ViewSection.tsx` | 1, 3, 4, 11, 14 | `canvas/src/core/page/views.js`; `deleteSelection` in `canvas/src/core/page/panel.js` |
| **2-5. Moving a box into another owner** | A box dropped on another box that may hold it belongs to it, as one undo step of its own. | `plane/viewStore.ts` and `core/adapter.ts` (after the scaffold), `core/actions/reparent.ts` | 1, 5 | The graph renderer's `drag` and `drop` in `canvas/src/core/page/drawing.js`; `containerAt` in `layout.js` |
| **2-6. Badges, and the checks while drawing** | A node or a line with a problem shows a badge. The checks run while a body is shown. The Validation panel says how many problems there are, and keeps the focus in its list after Undo. | `core/checks.ts`, `plane/marks/Badge.tsx`, `panels/Validation.tsx` | 7, 8 | `check`, `drawBadges`, `markProblems` in `canvas/src/core/page/render.js` |
| **2-7. Notes and the archive** | A Notes panel: the open notes, each with Claude's answer when it has one, and the archive below. A note on a node, on a line, or free on a plane. A pin with the note's number, which can be dragged to another target or to the plane. Archive and Restore. | `core/notes.ts`, `panels/Notes.tsx`, `plane/marks/Pin.tsx`, `plane/gestures/pin.ts` | 2, 3, 7, 9, 15 | `canvas/src/core/page/notes.js`; the notes, pins and archive of `canvas/src/annotations/page.js` |
| **2-8. Code links in Details** | The Code section: add, remove and edit an element's links, each change one undo step. | `core/codeLinks.ts`, `panels/CodeSection.tsx` | 1, 10, 11 | `renderCodeSection` and `codeItem` in `canvas/src/annotations/page.js` |
| **2-9. The text tab** | A tab that shows the model's text, read-only, with the problems above it and Copy. | `core/text.ts`, `views/TextTab.tsx` | 9, 13, 14 | `canvas/src/core/page/export.js` |
| **2-10. The sequence view** | Lifelines, events, messages in their order, successions; a message moved up or down; the order field of Details unlocked. | `core/readers/sequence.ts`, `core/actions/sequence.ts`, `panels/hooks/sequence.ts`, and `views/SequenceBody.tsx` or node components under `plane/nodes/sequence/`, as the probe says | 1, 3, 4, 5, 6, 7 | `canvas/src/sequence/page.js`; the model library's `messagesInOrder`, `eventOrder` |
| **2-11. The geometry view** | Shapes drawn to scale, a coordinate frame with a scale bar, a drag that changes a position in the model. | `core/readers/geometry.ts`, `core/actions/geometry.ts`, `panels/hooks/geometry.ts`, and `views/GeometryBody.tsx` or node components under `plane/nodes/geometry/` | 1, 3, 4, 5, 6, 7 | `canvas/src/geometry/page.js`; the model library's `geoDims`, `geoUnitOf`, `geoConvert`, `geoPlaced`, `geoNumber` |
| **2-12. The grid view** | A table of elements with the columns the view chooses and a sort by a click on a header, or a matrix of relationships. | `core/readers/grid.ts`, `views/GridBody.tsx` | 3, 5, 6, 7, 8, 9 | `canvas/src/grid/page.js`; the model library's `gridOptions`, `GRID_COLUMNS` |
| **2-13. The browser view, and renaming in a tree** | The browser view as the Explorer's tree under chosen roots. A row renamed by typing, in the Explorer and in a browser view. | `core/readers/browser.ts`, `views/BrowserBody.tsx`, `panels/Explorer.tsx`, `panels/explorerRows.ts` | 3, 5, 6, 12 | `canvas/src/browser/page.js`; the rename of `canvas/src/labels/page.js`; the model library's `browserRows`, `browserRoots`, `renamable` |
| **2-14. The fixtures and the limits** | The slice's "Done when" tests: each fixture opens with every view drawn, and, saved from the page, exports its pinned text. The scale tests. A table from each of the old page's test files to the new test that takes its place, or to the reason it is dropped. | `canvas/app/test/fixtures.test.mjs`, `scale.test.mjs`, `instant.test.mjs` | 27 | The 33 Playwright files of `canvas/test/` |
| **2-15. Retiring the old page** | The old page is gone. The model library, the fixtures, `export.mjs` and `check.sh` work as before. The READMEs describe one page. | `canvas/index.html`, `canvas/src/core/page/`, `canvas/src/*/page.js`, the old styles, `canvas/build.mjs`, `canvas/test/`, `canvas/app/test/unchanged.json`, `package.json`, the READMEs, `plan/status.json` | 20, 25, 27 | |

Each package also owns its own tests and its own stylesheet, in new files named after it.

**What the scaffold fixes, so that packages 2-2 to 2-13 can be built side by side.** The scaffold owns `src/vendor.ts`, `build.mjs`, `shell/theme.ts`, `shell/App.tsx`, `shell/Dock.tsx`, `shell/TopBar.tsx`, `core/index.ts`, `core/commands.ts`, `core/keys.ts`, `core/marks.ts`, `core/session.ts`, `core/files.ts`, `plane/Plane.tsx`, `plane/nodes/*`, `plane/edges/*`, `panels/Details.tsx`, `panels/fieldHooks.ts`, `views/bodies.ts`, `test/helpers.mjs` and `test/core.mjs`. It owns `core/adapter.ts` and `plane/viewStore.ts` until it is done, and package 2-5 owns them after that. It makes these seams:

| Seam | What the scaffold builds | Who fills it |
|---|---|---|
| The bodies | `views/bodies.ts`: the registry of contract 6. A view kind whose body is not built yet keeps its card. The Tools view lists a kind's tools once the kind has a body. For a kind with a graph body, the view's store asks that kind's reader for the projection and for what a gesture's step may give, so no package but 2-5 changes the store or the adapter. | 2-10 to 2-13 |
| The marks | The view's store puts the marks of contract 7 on each node and edge. Each node and edge component has a place for a badge and a place for pins. | 2-6 (badges), 2-7 (pins) |
| Who a node is | Each node and edge carries the ids of its element and its view in its `data`; `elementOf(node)`, `relationshipOf(edge)` (contract 5). | Every package that handles a click or a drag |
| Handles | Each node has connection handles. `Plane.tsx` hands React Flow's connecting and reconnecting to functions of `plane/gestures/connect.ts`. | 2-2 |
| Label anchors | Whatever shows a label that can be edited carries `data-label="<type>:<id>"`. The editor opens over an anchor, whatever draws it. | 2-3; in slice 4, a row gets editing by carrying an anchor |
| The actions | The table of contract 4, with a row for each action of this slice, and `core/keys.ts`. An action's `run` calls a function of `core/actions/*`. React Flow's own Delete stays off. | 2-2 to 2-13, each in its own file of `core/actions/` |
| Sections and hooks of Details | A list of sections under the form. Field hooks read from one file for each feature under `panels/hooks/`. | 2-4, 2-8, 2-10, 2-11 |
| The dock | A Notes panel on a strip. A tab that is not a view. The tabs follow the model's views as views are added and deleted. | 2-4, 2-7, 2-9 |
| The notes in a session | `session.unsaved` and the state file's `notes` and `archive` go through `notesOf` (contracts 2, 9, 15). | 2-7 |
| The tests | The new `data-testid` names and helpers, the todo tests of the slice's "Done when" checks, and the checks in `plan/status.json`. | 2-14, and each package for its own |

The scaffold follows the method of `plan/swarm/README.md`: a function that nothing builds yet has a body that throws `"<name>: package 2-N builds it"`, and a file the page already loads keeps what the page shows today.

**The order inside the slice.**

1. Package 2-0 first. The two probes can run at the same time as each other and as the scaffold, because the scaffold is the same under both answers.
2. Package 2-1, alone. Every later package starts from its commit.
3. Packages 2-2 to 2-13 at the same time. No two of them own one file. Packages 2-10 and 2-11 also need the probes' answers. A package that uses another's module (2-12 reads the notes and the checks; 2-13 calls the rename of 2-3) builds against the skeleton's contract, not against the other package's code.
4. Package 2-14 runs through the slice: its tests are written at the start and pass as the packages land. A timed test is judged with nothing else running.
5. Package 2-15 last, once every check but "`canvas/index.html` and the SVG renderer are gone" passes. `plan/direction.md` retires the old page one view kind at a time. Departure 3 of section 8 proposes one step at the end. The package is written to work both ways: retiring one kind is the same work on a smaller list of files.

**Its plan decides.** Where the Notes panel sits, and how a note is added. What happens to a note when its target is deleted (contract 9 asks only that a note with no target be accepted). The connect menu's design. How typing starts the label editor without taking the zoom keys. Where New view and Delete view are offered. The scale test of each of the four new bodies (section 9, question 6). The design of each body. The steps, the test lists and the screenshots.

**Left to later slices.** Remembering a file, a folder or a camera across a reload, and more than one view on a tab, are slice 3's. Rows inside a node that are elements are slice 4's. Icons and new colours are slice 7's.

**Candidates in `plan/scope.md`.** By this session's sorting (section 7, assumption 9), 79 entries, most under "The look and feel": "Canvas interaction" (lines 128 to 218), "Workbench" (65 to 124), "Notation" (222 to 266) and "Editing" (270 to 292). They are candidates only. The slice builds what `plan/direction.md` lists and what the old page does. Another entry, such as dragging from the Explorer onto a plane, needs Damon's word.

**Assumption.** `plan/direction.md` asks for label editing "in nodes and in rows". A node of a `grasp/2` model has no row that is an element, so this plan reads "rows" as the rows of the Explorer and of a browser view. Rows inside a node get editing in slice 4, with the generic row.

### Slice 3. The workspace folder and the loop through GitHub

**What Damon gets.** A folder that he picks once and that the page remembers. Several models in it, with their views on tabs he arranges, several views to a tab. Save in place. Pull and Push to GitHub from the page. Claude works on the same files with git.

**What it finds out first.** Whether a page opened from disk can write to GitHub: one real write with a throwaway token, on Damon's machine. Contracts 17 and 18 hold under both answers. Departure 1 proposes to run this probe during slice 2.

**What it uses.** From slice 1: contracts 1, 2, 3, 5, 14, 15, 25, 27. From slice 2: the bodies (6), the notes (9), the text of a model (13), the actions (4).

**What it creates.** The workspace's files and the codec (contract 16), the carriers (17), GitHub access (18), the workspace in the page (19), the workspace scripts (20), the layout by ELK as a mapping, used in Node (24).

**What it changes.** The selection: `Picked` and `Hit` gain `model`, and one selection serves the workspace (3). The adapter and the views' stores: a plane holds several views in frames (5, 6). The dock: the tabs come from the workspace file (14). The session: one for each model, saved by the workspace (2). The notes: saved in a notes file (9). The Explorer: one root for each open model (12). A state file is taken into the workspace as a model, and is no longer what the page saves (15). `canvas/export.mjs` reads a workspace (20). The tests gain a workspace fixture and a stand-in for the folder picker (27). The claude.ai store's code is deleted: `canvas/src/core/lib/stored.js`, `canvas/save-state.mjs`, `canvas/state.json`, the `stored` and `store-dump` tests, and the store's part of `export.mjs`.

**What it gives to later slices.** The file map and the codec, which slice 4 upgrades and extends. `read` and `urlOf` of GitHub access, for slice 6. The workspace's way to write one more file, for slice 7. `arrange`, for slices 4 and 7. The loop itself, which every later slice is reviewed through.

**"Done when"** (`plan/direction.md`, "The slices", 3): "a Playwright test with a stubbed picker opens a folder holding the workspace file and two models, moves a box, saves and reopens with the same places; in a session Claude pulls, moves two boxes by editing a view file, answers a note, pushes, and Damon's page pulls and shows both; Push on a stale file refuses."

**The work packages, in outline.** The slice's plan gives each its files.

| Package | What it delivers | It needs |
|---|---|---|
| 3-0. The plan and the probe | `plan/slice-3.md`; the answer about writing to GitHub | Damon, with a token |
| 3-1. The codec | Contract 16, with a workspace fixture of two models and tests in Node | Contract 9's note record. Nothing from slice 2's code. |
| 3-2. The carriers | The `folder` and `files` carriers, and the remembered folder | 3-1 |
| 3-3. GitHub | Contract 18 and the `github` carrier, with the check before a write | 3-1; 3-0's answer for Push |
| 3-4. The scripts | `canvas/workspace.mjs`, `canvas/export.mjs` on a workspace, `core/arrange.ts` with ELK in Node | 3-1 |
| 3-5. The workspace in the page | Contract 19: Open folder, New model, a state file taken in as a model, Save in place and its fallbacks, Pull and Push in the top bar, the lines of About | 3-1, 3-2, 3-3; slice 2 closed |
| 3-6. Several views on a tab | Frames as parent nodes that resize, a body in each frame, the tabs from the workspace file, `model` in `Picked` and `Hit` | 3-5; slice 2 closed |
| 3-7. The end of the store, and the loop | The store's code deleted; the loop section of `canvas/README.md` rewritten; the session with Damon that the second check asks for | Everything above |

Packages 3-1 to 3-4 touch no file that slice 2 changes, so they can be built while slice 2 is built. Package 3-4 then lists and arranges the four graph view kinds at first, and the other four once slice 2's readers exist. Packages 3-5 and 3-6 change the shell, the planes and the selection, so they wait until slice 2 is closed. 3-6 waits for 3-5.

**Candidates in `plan/scope.md`.** The six entries of "The loop: files, Claude and GitHub" (lines 638 to 643), and the entries on a view's frame (lines 227, 248 and 250).

**Its plan decides.** The exact keys of each file, within contract 16. Which of each view kind's options the exported text depends on. Whether a change to the workspace's record (a frame moved, a tab arranged) is an undo step, and which model's history Undo acts on when several are open. What Pull does when the page has unsaved changes. How a Push names its commit. This plan recommends that the words of the history's log since the last Push become the commit's message, so the log needs no file of its own. Which tabs a state file gets when it is taken in. Whether the scripts bundle the core in memory, as the tests do, or the build writes a bundle for Node.

### Slice 4. Every concept, in the standard form

**What Damon gets.** Every SysML v2 concept can be made, shown, edited, saved and exported. A `.sysml` or `.kerml` file can be imported. The saved model is the standard element form.

**What it finds out first.** Three probes. Departure 1 proposes to run them during slices 2 and 3.

1. **The module and the round trip.** Which OpenSysML module serves. Every fixture and the pilot's examples go through its conversion to elements and back. What it refuses is counted by kind. The probe also settles how the module's kinds map to the metamodel's class names, whether the conversion takes Grasp's ids back, and where the module's diagnostics differ from the pilot's. It must count metadata usages and textual representations by name, because notes and code links are exported as those, and slices 4 and 6 depend on them.
2. **The worker.** Whether the module runs in a worker made from a Blob URL on a page opened from disk.
3. **Damon's machine.** How long the real module takes to start and to read a model there. Only Damon can run this.

Contracts 13, 21 and 23 say what each answer changes. Nothing outside the text service changes with them.

**What it uses.** From slice 1: contracts 1, 2, 4, 5, 8, 11, 12, 25, 27. From slice 2: 6, 7, 9, 10, 13, the label editor. From slice 3: 16, 19, 20, 24.

**What it creates.** The form `grasp/3` and the upgrade (contract 21). The text service (23). `core/import.ts`. `canvas/import.mjs`.

**What it changes.** Every module in the list of contract 22, and the model library's model layer. The history's record of a change (1), and the type of a session's model (2). The adapter layer: a generic node with compartments by the kind of each owned member, and rows that name elements (5). The marks, on rows (7). The checks, over the new form (8). Code links, as textual representation elements (10). The Details form, generic, with pickers for references (11). The Explorer's rows, for every metaclass (12). The tools, for every kind a view admits, grouped by family (4). The text of a model, printed by the text service (13). The model file (16). The workspace, which upgrades an older folder when it opens it (19). `canvas/export.mjs` and `canvas/workspace.mjs` (20). ELK in a worker of the page (24). The build, with the module and its notices (25). The tests: a `grasp/3` fixture, and the check of contract 27 on the fixtures' pinned texts, which this slice's second "Done when" check replaces.

**What it gives to later slices.** The text service, which slice 5 extends and slice 6 adds a library to. The generic node, row and form, which slices 5, 6 and 7 add to. The rule that finds an element again by its qualified name and metaclass (`core/import.ts`), which slice 5 uses for a file imported again.

**"Done when"** (`plan/direction.md`, "The slices", 4): "every concrete metaclass can be created, shown, edited, saved and exported to text that `check.sh` accepts; every older fixture, upgraded, exports text that `check.sh` accepts and that reads back to the same elements; the count of constructs the converter refuses is zero over the fixtures and the pilot's examples, or the fallback route is taken and said so."

**The work packages, in outline.**

| Package | What it delivers | It needs |
|---|---|---|
| 4-0. The plan and the probes | `plan/slice-4.md`; the three answers | Damon, for the third |
| 4-1. The text service | Contract 23's first four members, in Node and in the page; the module in the build, with its notices | 4-0 |
| 4-2. The form and the upgrade | Contract 21: the form, the ids, the upgrade of a whole workspace, a fixture with many metaclasses; the model library's model layer over the new form | 4-0; contract 16 |
| 4-3. The modules of contract 22 | The adapter layer, the actions, the label editing, the code links, the field hooks and the Explorer's rows, each over the new form, giving the others what they gave before | 4-2; slices 2 and 3 closed |
| 4-4. Import and export | `core/import.ts`, with new elements placed by ELK in a worker; `exportText` through the text service; `canvas/import.mjs`; the model library's writer as the cross-check over the fixtures | 4-1, 4-2 |
| 4-5. The generic node and row | Compartments by the kind of owned member; a row that is selected, marked and edited as a node is | 4-3 |
| 4-6. The generic Details form | Every attribute of a metaclass with a widget by its type; a picker with candidates for a reference | 4-3 |
| 4-7. Every tool | The Tools view and the palettes offer every kind a view admits, grouped by family | 4-3 |
| 4-8. The closing | The tests of the three checks; a test made from the metamodel that walks every concrete metaclass | Everything above |

4-1 and 4-2 can be built at the same time, and before slice 3 is closed, because they are pure and touch no file of the shell or the planes. 4-3 is one package: it changes the modules every later package reads through. 4-4 to 4-7 can be built at the same time after it.

**Its plan decides.** How the page holds the element form in memory, and what the history records. Whether the upgrade keeps ids or rewrites references (contract 21 allows both). How a node is chosen for a metaclass with no shape of its own. What a view shows by default when it exposes a whole package. How the pinned writer's cross-check is run. Whether the fallback route is taken, by the count the probe gives.

**Candidates in `plan/scope.md`.** About 230 entries by this session's sorting: nearly all of "All of SysML's concepts" (lines 395 to 632, with "Notation", lines 449 to 566, the largest group), and the entries on importing, exporting and the format under "Reading and writing SysML v2 text" (lines 353 to 380). Most are the notation of one more metaclass each, which the generic node, row and form are meant to cover without code for each.

### Slice 5. Text in the page

**What Damon gets.** Text inserted under a selected element. The specification's diagnostics in the Validation panel, each at its file, line and column. Names completed as he types a typing, a specialization or an import. The standard libraries in the Explorer, read-only. Inherited members shown. A text tab for each model.

**What it uses.** From slice 4: the text service (23), `core/import.ts`, the generic node, row and form, the form `grasp/3` (21). From slice 2: the checks and the marks (7, 8), the label editor, the text tab (13). From slice 3: the workspace (19).

**What it changes.** The text service gains its last four members (23). The checks gain the Specification list (8). The selection can hold a library's element, read-only (3). The Explorer gains the libraries' root (12). The adapter shows inherited rows from the session's cache (5). The Details form completes names and is read-only for a library's element (11). The text tab shows a model's text with its diagnostics (13, 14). `core/import.ts` matches a file imported again by qualified name and metaclass, so ids and places survive. `canvas/import.mjs` does the same (20).

**What it gives to later slices.** The libraries' rows and names, which slice 7's Search panel can search on request.

**"Done when"** (`plan/direction.md`, "The slices", 5): "`docs/sysml/stronghold-proof.sysml` imports, shows its view, and exports again to text `check.sh` accepts; an inserted fragment with an unresolved name is refused with the diagnostic at its line; a 5,000-symbol import finishes with a progress indication and no frozen page." Contract 23 says when the third check must go back to Damon.

**The work packages, in outline.** One package first: the four new members of the text service, and the session's cache of what the service resolved. Then, at the same time, each in files of its own: the Specification list with its marks; the insertion of text; completion in the label editor and in the pickers; the libraries in the Explorer with read-only Details; inherited members in nodes; the text tab; the file imported again. Last: the round trip of every fixture as a Node test with the same module, and the three checks.

**Its plan decides.** The pause before the Specification list runs. What the page does with a text that is partly wrong. How an inherited row looks. Where completion shows its list.

**Candidates in `plan/scope.md`.** About 59 entries by this session's sorting: the rest of "Reading and writing SysML v2 text" (lines 329 to 391), "Model behaviour" under "All of SysML's concepts" (lines 607 to 625), and the three "Libraries" groups (lines 307 to 311, 384 to 387 and 629 to 632).

### Slice 6. Code links into GitHub

**What Damon gets.** An element linked to a file and a range of lines in a GitHub repository. The link shows as a row of the element's code compartment and in Details, opens the file on GitHub, and previews the lines. The model carries links, not code.

**What it uses.** From slice 2: code links (10) and the Code section (11). From slice 3: `read` and `urlOf` of GitHub access (18), and the repository named in the workspace file (16). From slice 4: metadata usages as elements (21), the text service's `libraries` (23), the generic row (5).

**What it creates.** `canvas/library/Grasp.sysml`, with `metadata def CodeLink` and its attributes: repository, path, ref, lines, language.

**What it changes.** `core/codeLinks.ts`: a link is a metadata usage of `CodeLink` (10). The Code section of Details and the code compartment's row (5, 11). The text service is given the Grasp library (23). `canvas/check.sh` loads the Grasp library before the model, so the pilot's validator knows `CodeLink` (20). The build puts the library's text into the page (25). The example's code text becomes links into the Stronghold repository. `canvas/README.md` gains the checklist for Claude's side: write the code, push it once Damon approves, update the ref.

**"Done when"** (`plan/direction.md`, "The slices", 6): "an element linked to a file and line range of the Stronghold repository shows the row, opens the file on GitHub, previews the lines when a token is set, exports as metadata that `check.sh` accepts and survives import; the example carries no code text."

**The work packages, in outline.** First the library, with `check.sh` and the text service reading it. Then the data and the migration in `core/codeLinks.ts`. Then, at the same time: the Code section, with Open on GitHub and the excerpt; and the compartment's row. Last: the example, the checklist and the checks.

**Its plan decides.** How `lines` is written. What the excerpt shows without a token, and when GitHub refuses. Whether a link may name a repository other than the workspace's. Whether the page offers to turn an older file's textual representation into a link.

**Candidates in `plan/scope.md`.** None. SysON has no such feature. The slice's list in `plan/direction.md` is its whole scope.

### Slice 7. The finish of the look

**What Damon gets.** A view exported as PNG and SVG. Arrange all. Align, distribute and same size on a selection. A Search panel. Icons for the metaclasses. SysON's node colours and default sizes. The keyboard shortcuts under Help.

**What it uses.** The action table (contract 4), the bodies (6), the Explorer's rows (12), the workspace's way to write a file (19), `arrange` (24), the build (25), the look (26), the scale tests (27). On request, the libraries' rows of slice 5 (23).

**What it changes.** The action table gains this slice's commands (4). The adapter takes SysON's default sizes (5). The Explorer's rows gain icons (12). The dock gains the Search panel (14). A place can hold `pinned`, which Arrange all keeps (16, 24). `canvas/workspace.mjs arrange` takes the same options as the page (20). The build gains `html-to-image` (25). `shell/theme.ts` gains SysON's colours and the function that gives a metaclass its icon; the model library's rows gain SysON's default sizes (26). The scale tests get new baselines (27). `plan/status.json` and the READMEs are brought up to date.

**"Done when"** (`plan/direction.md`, "The slices", 7): "each item has a Playwright test from `file://`; a PNG and an SVG of the example's general view are written into the workspace folder; Arrange all on a 1,000-node view finishes without freezing the page, under a progress indication, in about 3 s on this session's machine."

**The work packages, in outline.** A scaffold first: the new actions as rows of the table, the Search panel in the dock, `pinned` in a place. Then, at the same time, each in files of its own: image export; Arrange all, with options for each view kind; align, distribute and same size; the Search panel; the icons; the colours and sizes; Help. Last, alone on the machine: the scale tests' new baselines, then the documents.

**Its plan decides.** Which ELK options each view kind gets. What the Search panel searches by default. The icons themselves, drawn for Grasp and not taken from SysON. Whether there is a dark theme (section 9, question 7). What to do with the notes that the screenshots' reviewers left for this slice (`plan/notes.md`, sessions 18 to 28).

**Candidates in `plan/scope.md`.** About 28 entries by this session's sorting, under "The look and feel": image export (lines 320 to 323), arranging and aligning (lines 190 to 196), the Search view (line 95), icons (lines 98 and 272), default colours and sizes (lines 273 and 291).

## 5. The dependency order

### Between the slices

```
slice 2 ──► slice 3 ──► slice 4 ──┬─► slice 5 ─┐
                                  ├─► slice 6 ─┼─► the closing of slice 7
                                  └─► slice 7 ─┘
```

| This | waits for | because |
|---|---|---|
| Slice 3's packages 3-5 and 3-6 (the workspace in the page, frames) | Slice 2 closed | They change the shell, the planes and the selection, which slice 2 changes too. A frame must hold every kind of body. The notes file needs the notes. |
| Slice 3's deletion of the store's code | Slice 2 closed | The old page is the last reader of the store. |
| Slice 4's package 4-3 and all after it | Slices 2 and 3 closed | It rewrites every module that reads the model's shape (contract 22), and that list is complete only then. The upgrade works on a workspace's files. |
| Slice 5 | Slice 4 closed | Every item of slice 5 calls the text service or shows the element form. |
| Slice 6 | Slice 4 closed; slice 3 closed | A code link is a metadata usage, which is an element of `grasp/3`. The excerpt reads through GitHub access. |
| Slice 7's packages | Slice 4 closed | Icons, colours and sizes are for every metaclass. Arrange all uses the worker that slice 4 gives the page. The components it finishes are the generic ones. |
| Slice 7's closing (baselines, documents) | Slices 5 and 6 closed | The baselines measure the finished page, and the documents describe it. |

No slice uses something that only a later slice provides. Two things look as if they do, and do not. Slice 2's text tab is extended by slice 5 and does not need it. Slice 3 uses ELK in Node only; the worker in the page comes with slice 4, which is the first slice to need it.

### What can be built at the same time

| At the same time as | this can be built | because |
|---|---|---|
| Slice 2 | The probe of slice 3 and the three probes of slice 4 | A probe changes no file of the page. Its answer chooses between routes, so it is worth most early. (Departure 1.) |
| Slice 2 | Slice 3's packages 3-1 to 3-4: the codec, the carriers, GitHub access, the scripts | They are in new folders and need only the note's record of contract 9, which is fixed here. |
| Slice 3 | Slice 4's packages 4-1 and 4-2: the text service, the form and the upgrade | They are pure, and they need only the file map of contract 16. |
| Slice 5 | Slice 6, and slice 7's packages | Each changes files of its own, apart from three shared ones: `panels/Details.tsx` (5 and 6), the node components (5, 6 and 7) and `shell/theme.ts` (7). Contracts 5, 11 and 26 keep them apart: 5 and 6 add sections and rows in files of their own, and only slice 7 changes the theme. One part of slice 7 waits for slice 5: the Search panel searches the libraries only once slice 5's first package has given the text service its `libraryRows`. |

Slices are still closed in their order: a later slice's work is built on a branch and waits there. Departure 2 asks Damon for this.

### Inside each slice

Every slice has the same four stages, and the reason is the same each time.

1. **The plan and the probes.** The plan needs Damon's approval. A probe's answer chooses the route of the packages that depend on it, and of no others.
2. **The scaffold, by one package, alone.** It owns the shared files and writes a skeleton of every other file. After it, no two packages own one file.
3. **The feature packages, side by side.** Each builds against the skeletons' contracts.
4. **The closing, alone.** The timed tests are judged with nothing else running. The documents and `plan/status.json` are written once.

## 6. Where each open question of `plan/direction.md` is settled

These are the items of "What is not settled yet", in that document's order.

| Question | Settled at | What depends on the answer | Under each answer |
|---|---|---|---|
| Damon's machine | Settled on November 12 | Contract 17 | The fallbacks stay. About reports what works on any machine. |
| Compartment rows at Grasp's scale | Answered by slice 1 | Contracts 5 and 27 | The limits hold in every slice. If a larger view misses one, the far view is drawn as one picture, inside the adapter and the plane. |
| Writing to GitHub from a page opened from disk | The start of slice 3, or earlier (departure 1) | Contracts 17 and 18 | It works: Pull and Push through the `github` carrier. It fails: Pull still reads; saved files reach Claude by github.com's upload page or the conversation; the third check of slice 3 is restated with Damon. |
| Which OpenSysML module, and the converter's fidelity | The start of slice 4, or earlier | Contracts 13, 21 and 23 | The table in contract 23. The saved form is the same under every answer. |
| A worker for the module | The start of slice 4, or earlier | Contract 23 | In a worker: calls do not block. Inline: calls block, and a large text is refused in the page. The third check of slice 5 is then restated with Damon. |
| OpenSysML's module on Damon's machine | The start of slice 4, by Damon | Contracts 13 and 23 | Fast enough: nothing changes. Too slow: the page says `unavailable`, and Claude's side imports and prints. |
| The module's kind vocabulary | The round trip of slice 4 | Contract 23 only | The mapping is inside the text service. Nothing outside it names a kind of the module. |
| What the module flags that the pilot accepts | The round trip of slice 4; shown in slice 5 | Contract 8 | It is a second opinion under every answer. The pilot's validator stays the authority. |
| Sequence and geometry views | The start of slice 2 | Contract 6 | React Flow nodes: a graph body. Custom SVG: a component body. The registry and its consumers are the same. |

## 7. Assumptions

This plan rests on these. None is proved.

1. **What "Notes keep their place as elements" means** (`plan/direction.md`, decision 5). This plan reads it as: a note stays attached to the element it is on, by the element's id, through every format. Notes are saved as records, apart from the model's elements, and are written into the text as they are today. The other reading is that a note becomes a metadata element inside the model. Contract 9 is written for the first reading. Question 3 of section 9 asks Damon.
2. **"Rows" in slice 2** are the rows of the Explorer and of a browser view (slice 2's section).
3. **Slice 3's model file is not a second format change.** It holds a `grasp/2` model without its views' places, inside a file of a new kind. `plan/direction.md`, decision 5, allows one format change, and decision 9 moves the loop to files before it. This plan counts the model's own format, which changes once, in slice 4.
4. **If the module is too slow on Damon's machine, printing falls to Claude's side as importing does.** `plan/direction.md` names only the import.
5. **Slices 2 and 3 need no addition to the model library.** The old page's scripts call nothing that the model library does not already give. This was read from the code, not tried. A package that finds otherwise stops.
6. **The converter can carry metadata usages and textual representations.** Notes and code links are written as those. The first probe of slice 4 must count them.
7. **Claude's scripts may need `npm ci`**, because they load the core through esbuild. Today `canvas/export.mjs` needs only Node.
8. **What the old page does** was read in this session by an agent that went through every page script. The lead checked these points against the code: where notes are kept and how a note is made; that `placement()` keeps only the keys it knows; how ids are made; that the Node tests read the model library from `canvas/index.html`; that the old page draws a line by two clicks and has no reconnecting; and that the layout of the sequence, geometry, grid and browser views is in their page scripts. One point was not checked a second time: which functions of the model library each page script calls. Slice 2's plan checks that as it writes each package's brief.
9. **The counts of `plan/scope.md` by slice** come from one agent's sorting of the 510 entries: 79 for slice 2, 11 for slice 3, 230 for slice 4, 59 for slice 5, none for slice 6, 28 for slice 7, and 101 that slice 1 already gave. They show where the work is. They are not a commitment, as `plan/scope.md` says of itself. Two entries fit no slice: editing a line's path by its bend points, and showing contents as nested or as a tree. No slice builds them.

## 8. Departures from `plan/direction.md`

Each is a proposal. Until Damon approves one, the document's own words stand, and the plan above works without it.

1. **Run the probes of slices 3 and 4 early, during slice 2.** The document says each open question "is found out at the start of the slice that depends on it". The probes change no file of the page. Their answers choose between routes: whether Push exists in the page, which module serves, whether the fallback route for text is taken. An answer known early costs a day. A surprise at the start of slice 4 costs the plan of a slice.
2. **Build work of a later slice before the earlier slice is closed, where section 5 allows it.** Decision 9 says "Seven slices, in this order". The slices would still be closed and reviewed in that order. The gain is that the pure parts (the codec, the text service, the upgrade) are tested for longer before the page depends on them, and that slices 5, 6 and 7 do not wait for each other.
3. **Delete the old page in one step, at the end of slice 2.** The document says "the old page retired one view kind at a time". Both pages read the same files, and Damon works on the new one, so retiring a kind early gives him nothing. Each retirement would change the old page's build and its tests, which are the reference the new tests are written from. One step keeps that reference whole until the new suite passes.
4. **The model library's Node tests change in two small ways before slice 4.** Decision 1 says they "keep running unchanged through the first three slices". They read the model library out of `canvas/index.html`, which slice 2 deletes, so they must load it from `libraryCode()` instead: a small change in each file, and no change to what they check. One test of `model-lib.test.mjs` reads the model saved inside the old page, and goes with the page. And three of the six files go with what they test: `build.test.mjs` with the old page's build in slice 2, `stored.test.mjs` and `store-dump.test.mjs` with the claude.ai store in slice 3. The document's own slices already delete those things.
5. **A read-only text tab already in slice 2.** The document gives slice 5 "a text tab per model". Slice 2 must replace the old page's export panel. A tab that shows the text is that replacement, and slice 5 adds the diagnostics to it. Nothing is built twice.

## 9. Questions for Damon

1. **The five departures of section 8.** Approve or refuse each.
2. **The loop between the end of slice 2 and the end of slice 3.** Slice 2 deletes the old page, and with it the page published on claude.ai. Push arrives with slice 3. In between, a state file reaches Claude through the conversation, or Damon uploads it on github.com. Is that acceptable for that time? The other choice is to keep the old page until slice 3's loop works, which is against slice 2's "Done when". This plan assumes the first.
3. **Notes** (section 7, assumption 1). Are notes records saved beside the model, as today, or elements inside the model?
4. **GitHub.** Which repository and branch hold your workspace: this repository, or one of its own? The probe needs a throwaway fine-grained token with write access to the contents of one scratch repository, and ten minutes on your work machine. When can that be?
5. **OpenSysML's module.** The second probe page for your work machine measures the real module's start and read times. When can you run it? And the module is a generated script of about 13 MB or more, committed in `canvas/dist/`. Each new version of it adds that much to the repository's history. Is that acceptable?
6. **The scale tests of the four new bodies.** The old page has no scale test for a sequence, geometry, grid or browser view. Slice 2's plan will propose one for each. This plan recommends: the 5,000-element model's grid view and browser view each open, and a scroll step and a keystroke in each hold slice 1's limits. Is a limit for sequence and geometry views wanted at all, at the sizes those views have?
7. **For slice 7, and not blocking:** a dark theme, yes or no. And the repository's licence, which is still open from slice 1.
8. **For slice 6:** which ref of the Stronghold repository the example's links name, and whether that repository can be read with your token.
