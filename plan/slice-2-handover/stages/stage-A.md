# Stage A of the scaffold (package 2-1): the core's seams

Built in /home/user/Grasp, on claude/gracious-fermi-hxid8e, from 780788b. One local commit: see "The commit" at the end.
No report of an earlier stage was in this folder when stage A started (stage 0 works beside it).

## What was built, file by file

Paths under canvas/app/src/core/ unless they begin otherwise.

### New, built

- `readers/index.ts`: seam 1 and the core's part of seam 3: `Listed`, `ReadOptions`, `Reader`, `rendererOf`, `readerOf`, `hasReader`, `readView`, `Placer`, `placerOf`, `Ender`, `enderOf`. `placerOf` and `enderOf` give `place` and `end` of `actions/sequence.ts` and `actions/geometry.ts`, and null for `graph`, `grid`, `browser`.
- `readers/graph.ts`: `graphReader`: `read` is `project()`, `sizeOf` the projection's bounds (0 by 0 for an empty view), `listed` one entry a node and one an edge.
- `marks.ts`: seam 4 in full: `Pinned`, `Marks`, `FreePin`, `NO_MARKS` (frozen), `MarksOf`, `marksOf`. Live only while it has a listener; it then holds one listener on `checksOf(session)` and one on `notesOf(session)`.
- `says.ts`: `Says`, `saysOf(session)`, and `nextSaying(session)` (see "Built otherwise", 3).
- `hands.ts`: `ShellHands`, `Hands`, `handsOf(session)`.
- `keys.ts`: `KeyPress`, `KeyPlace`, `ALIASES`, `keyOf`, `pressed`. No DOM. The eight rules are the comment of `pressed`.
- `actions/file.ts`: `FILE_ACTIONS`: undo, redo, save, put-down, as section 5 has them.
- `codeLinks.ts`: `codeRowsOf` built (the adapter calls it); `CodeLink`, `CODE_LANGUAGES` (the old page's list), `CodeLinks`, and `codeLinksOf`, which throws.

### New, skeletons (each with its package's contract as its comment)

- `readers/sequence.ts` (2-10): `sequenceReader = null`, `SequenceStep`, `SequenceAt`, `SequenceEnd`, `sequenceStep`, `sequenceResult` (throw).
- `readers/geometry.ts` (2-11): `geometryReader = null`, `GeometryAt`, `geometryResult` (throws).
- `readers/grid.ts` (2-12): `gridReader = null`, `GRID_ROW`, `GRID_HEAD`, `GRID_MARKS`, `GRID_WIDTHS`, `MATRIX_SIDE`, `MATRIX_CELL`, `GridRow`, `GridCell`, `GridData`, `orderRows` (throws).
- `readers/browser.ts` (2-13): `browserReader = null`, `BrowserRow`, `BrowserData`. (`BrowserBody` is views/, stage B's.)
- `actions/camera.ts` (2-14) `CAMERA_ACTIONS`; `actions/code.ts` (2-8) `CODE_ACTIONS`; `actions/browser.ts` (2-13) `BROWSER_ACTIONS`; `actions/labels.ts` (2-3) `LABEL_ACTIONS`; `actions/remove.ts` (2-4) `REMOVE_ACTIONS`; `actions/text.ts` (2-9) `TEXT_ACTIONS`: an empty array each, its rows' ids, titles, keys and sentences in its comment.
- `actions/connect.ts` (2-2): `CONNECT_ACTIONS` (empty; section 5 gives it no row), `Fits`, `fits`, `reconnectProblem`, `reconnect` (throw).
- `actions/views.ts` (2-4): `VIEW_ACTIONS`, `setViewOption` (throws).
- `actions/reparent.ts` (2-5): `REPARENT_ACTIONS` (empty; no row), `Landing`, `landingOf`, `land` (throw).
- `actions/notes.ts` (2-7): `NOTE_ACTIONS`, `canCarry`, `dropPin` (throw).
- `actions/sequence.ts` (2-10): `SEQUENCE_ACTIONS`, `place = null`, `end = null`, `moveMessage` (throws).
- `actions/geometry.ts` (2-11): `GEOMETRY_ACTIONS` (empty; no row), `place = null`, `end = null`.
- `labels.ts` (2-3): `LabelEdit`, `labelEditOf` (an inert object: `editing` null, `listen` and `close` do nothing, `open` and `keep` throw), `rename` (throws).
- `notes.ts` (2-7): `Note` (contract 9), `NotePlace`, `Notes`, `notesOf` as the pass-through of seam 11: `open`, `archive` and `file()` are the file's own lists; `mark()` is 0; `attended`, `pointed` null; `listen` tells nobody; `add`, `setText`, `moveTo`, `remove`, `archiveNote`, `restore`, `attend`, `point` throw "notesOf.<name>: package 2-7 builds it".
- `text.ts` (2-9): `TextResult`, `exportText` (rejects with "exportText: package 2-9 builds it").

### Changed

- `commands.ts`: `Action`, `actions()`, `actionOf()`, `ask()`, `editable()`, `PALETTE`, `Gestures`, `gesturesOf()`; `drawProblem`, `freshElement`, `freshRelationship` exported, and `place()` and `draw()` built on them. `toolGroups`, `place`, the tool's `click` (both places) and `offers` ask `hasReader`. `place()` hands a view of another renderer to `placerOf(renderer)`. `draw()` of a "defined by" line from a usage that has a typing moves that typing's `to` and deletes its `hidden` key (same id, same place in the list). `TOOL_TITLE`, `TOOL_HINT` gain `EventOccurrenceUsage` and `Message`, `BASE_NAME` gains `EventOccurrenceUsage` (word for word from canvas/src/sequence/page.js; the geometry view adds no words on the old page). `plan()` reads a node's element through `elementOf`. The tool's `said.n` now comes from `nextSaying(session)`.
- `adapter.ts`: `Who = { element, view, marks }` on `BoxData`, `BorderData`, `SmallData`; `relationship`, `view`, `marks` on `EdgeData`; `elementOf`, `relationshipOf`. `NO_MARKS` for every new node and edge, and the marks of the node or edge before carried over (in `layOut` and `settleEdges`); a node with none before it gets `NO_MARKS` even when the cached read holds another. A code compartment's rows come from `codeRowsOf`. `isDrawn` stays, with a comment that only the adapter and readers/graph.ts ask it.
- `session.ts`: `fileNotesOf(session)`, `ViewRow`, `viewsOf(session)`; `notes` and `archive` are getters over `notesOf(session).file()`; `unsaved` compares both marks; `saved(mark?, notesMark?)`; the session listens to its notes and tells its own listeners. `notesOf(session)` is made inside `openSession`.
- `files.ts`: `stateFile` takes `notes` and `archive` from `notesOf(session).file()`; `saveFile` reads the notes' mark before it writes and hands it to `saved`.
- `checks.ts`: `Entry`, `entriesOf()` (a shared frozen empty array) appended; nothing else touched.
- `index.ts`: exports every new module. `actions/sequence.ts` and `actions/geometry.ts` are exported by name (`SEQUENCE_ACTIONS`, `moveMessage`, `GEOMETRY_ACTIONS`) and whole as `sequenceActions` and `geometryActions`, because both export `place` and `end` and `place` is also the commands'.

### Outside the core: the smallest edits, each forced

- `plane/viewStore.ts`: the import and `drawnNow_` ask `hasReader` in place of `isDrawn`; one comment. Nothing else. (The new fields of `NodeData` forced no edit in plane/: no file there builds a node's data.)
- `panels/Tools.tsx`: the import and the one call ask `hasReader`; one comment.

### Tests (canvas/app/test/)

- `core.mjs`: `loadCoreWith(swaps, ...files)`, `STAND_IN_NOTES`, `STAND_IN_ENTRIES` (see "What the tests share").
- `actions.test.mjs` (19 tests), `readers.test.mjs` (9), `marks.test.mjs` (6), `says.test.mjs` (6), `session-notes.test.mjs` (6): 46 tests, all in Node. Each was run before the code and failed for the missing seam ("core.actions is not a function" and the like). "Escape calls off a gesture, or puts the tool down, or lets go of what is picked" is in actions.test.mjs under exactly that name.

## What the tests share, which later stages can use

`loadCoreWith(swaps, ...files)` in core.mjs bundles the core with stand-ins: `swaps` maps a module's path under canvas/app/src without its extension to TypeScript source that takes its place in that bundle ("the file as its package could build it"). A stand-in can wrap the real module by importing `'./<name>?real'`. `files` are extra modules, as `loadWith` takes them, so `loadCoreWith({ 'core/notes': STAND_IN_NOTES }, 'plane/viewStore')` gives the store with working notes.

- `STAND_IN_NOTES`: a `notesOf` whose notes can be added, written, moved, removed, pointed at, with a mark, and `NOTES_LISTENERS.now`.
- `STAND_IN_ENTRIES`: the real checks with `entriesOf` giving what `standInEntries(session, entries)` set. The marks hear of new entries when the checks tell, so a test changes the model once afterwards (`touch(s)` in marks.test.mjs).
- actions.test.mjs holds a stand-in for `core/actions/camera.ts` with rows for '+', '-', '0', ArrowLeft, Delete, F2, Alt+ArrowUp and 'printable', and readers.test.mjs one for `core/readers/sequence.ts` with `core/actions/sequence.ts`.

## Left for later stages

- **Stage B.** The parts of readers.test.mjs and marks.test.mjs that need the view's store are not written: a stand-in reader of another renderer asked by the store for the projection, a step and the end, with only the pressed node moving; and the store putting marks on its nodes (a new object only where the marks differ). The stand-ins above are there for both. `viewStore.ts` still projects with `project()` only: with a reader of another renderer its `drawn` would be true and its projection empty, until seam 3 is built. `Plane.tsx` still builds a `Hit` from a node's id; seam 5 asks for `elementOf(node)` and `relationshipOf(edge)`.
- **Stage C.** Nothing in the page calls `ask()` or `pressed()` yet; the keydown listeners of TopBar.tsx and Tools.tsx are as they were. `KeyPlace` has a fourth field, `widget` (see "Built otherwise", 1): App's listener sets it. `Toasts.tsx` can show the later of `toolsOf(session).said` and `saysOf(session).said` by comparing their `n`, which is one row of numbers for a session, and carry that `n` as `data-said`. The comment of `Tools.putDown` in commands.ts still says "Escape calls it (panels/Tools.tsx)": true until the listener moves.
- **Stage D.** `pairsState()` and the `loadWith` entries for modules outside the core are not in core.mjs. refusals.test.mjs can ask every row through `ask`; with the scaffold's four rows only `undo` and `redo` can be refused.
- **Later packages.** A package fills its array (`export const REMOVE_ACTIONS: readonly Action[] = [ … ]`) and replaces its throwing functions; it needs no change to commands.ts, readers/index.ts or index.ts. Package 2-10 and 2-11 replace `null` in `sequenceReader`, `place`, `end`.
- canvas/app/README.md is not brought up to date (the plan gives that to 2-14's closing).

## Built otherwise than the plan says, each with its reason

1. **`KeyPlace` has a fourth, optional field, `widget`.** Seam 8 gives `{ typing, historyKeys, modal }`. Section 5 gives the keys a rule those three cannot say: arrows, F2, Alt with an arrow and a printable key do not act from inside an element with the role tree, menu, listbox, tablist, radiogroup or grid. `pressed` holds the rule; a caller that leaves the field out is read as outside any such widget.
2. **`ALIASES` is section 2's and section 5's three** (`Mod+Shift+Z` as `Mod+Y`, `=` as `+`, `_` as `-`). Seam 8's comment also says "'Backspace' as 'Delete'", which section 2 ("`Delete` deletes, and `Backspace` does not") and package 2-4's brief contradict. Backspace is not an alias.
3. **`nextSaying(session)` in says.ts, which the tool in hand also numbers its sayings from.** Not in the plan. Seam 8 has the toasts show "whichever was said last, by a tool or through `saysOf`", and seam 12 has the toast carry "a number that grows with each saying"; two counters could not say which was later.
4. **`pressed` knows the row `save` by its id**, to keep slice 1's rule that Save's default is always prevented, with no file open and behind a modal dialog too. `Action` has no field for that.
5. **`labelEditOf` gives an inert object** where "what a skeleton is" would let it throw, so that stage B's `LabelEditor` may read `editing` and listen. Its `open` and `keep` throw.
6. **`actions()` throws on two rows of one id**, and of two rows with one key the earlier is the key's. The plan says neither.
7. **`offers()` in a view of another renderer** offers every element kind of the row, on the ground and on an element: a `Placer` has no way to say beforehand what it would refuse. The plan says nothing of the palette there. Unreachable until 2-10 or 2-11 lands.
8. **The tool's "No view shows both ends" check asks `hasReader`** too (the fifth `isDrawn` of commands.ts; the task named four places). Otherwise a message drawn between two lifelines that only a sequence view shows would be said to be drawn nowhere.
9. **`listed` of the graph reader** says a box as "«part def» Host" and a border item or a small node by its name alone ("api : ~StrongholdApp"; '' for a start): their data holds no keyword, and `listed(data)` gets nothing but the data. Far, every word is ''.
10. **A pin answers for an element and for a relationship of one id alike** (`marksOf(session).of`): a note names its target by id alone and marks.ts may not read the model (contract 22).
11. **`readers/sequence.ts` is `Reader<Projection> | null`**, as package 2-10's brief has it; seam 1's example line says `Reader<SequenceData>`. `SequenceEnd` is `unknown`: the plan names the type and gives it no form.
12. **A press that types a character** leaves out the space bar (it clicks the focused button) and takes Ctrl with Alt as AltGr unless the key is a plain letter or digit. The plan says "every other key that types one character, pressed with no Ctrl or ⌘".

## Tests of slice 1 that were changed, each with the plan's sentence

The sentence for the first three (package 2-1, "Changes in existing files"; section 2; section 12, departure 4): "`draw()` of a "defined by" line from a usage that has a definition already no longer takes the old line out. It moves the old line's other end and shows the line, as the Typed by field of Details does. So the line keeps its id and what is pinned to it."

1. `commands.test.mjs › a second definition takes the first one's place, in the same step`: it asserted that `t-hosts` is gone, the new typing is the last relationship, and the step touched both. It now asserts that `t-hosts` keeps its id and its index with `to` App, and the step touched `t-hosts` only. Everything else (count, one step, words, notes untouched, Undo) is as it was.
2. `commands.test.mjs › a line whose ends no view shows together is drawn, and said so`, and the helper `walk()` there (so `every tool of each graph view kind's row makes its element or its line, and Undo takes it back`): both took "what was made" as the last relationship of the list. `walk()` now takes the relationship of the tool's kind between the two clicked ends; the first test takes tank's typing and asserts it goes to Controller.
3. `tools.test.mjs › every tool of ${w.name} row is used once: …` (the page; lines 34 and 35 of section 7), for the general and the interconnection view. Its use `{ FeatureTyping, Page.hosts → App, replaces: 't-hosts' }` asserted a new line with a new id, `t-hosts` off the plane, and Undo bringing it back. The two uses whose usage has a typing now carry `moves: '<id>'` (`t-hosts`, drawn before; `t-back`, hidden before): the line keeps that id, is drawn and picked, no second line is drawn, and Undo leaves `t-hosts` drawn with its row and takes `t-back` off the plane. The plan names only commands.test.mjs for "the replaced typing"; this test pinned it in the page as well.
4. `adapter.test.mjs › what the example's boxes and ports say` and `› what an item, an action, a state and a control node say`: eight assertions compared a node's whole `data` with a literal. They now compare `said(node.data)`, the data less `element`, `view` and `marks`. Sentence (seam 5): "NodeData gains: element: string | null; view: string; marks: Marks". The three fields are asserted for every node and edge of the ten files in readers.test.mjs and marks.test.mjs.

No test was loosened, skipped or marked todo.

## Measurements

Container: 4 processors, Node 22.23.4. Another agent (stage 0) was working beside every run: the load average was between 1.9 and 2.9 throughout, so none of these is a measurement judged alone.

| Command | Result |
|---|---|
| `npm run build` | exit 0; app.js 172.6 kB |
| `npm run check` | exit 0: "canvas/dist is what the sources build.", and the types hold |
| `npm test`, first run (before tools.test.mjs was changed) | 516 tests, 52 suites: 513 pass, 3 fail, 0 todo; 360 s. The three: the two page tests of tools.test.mjs that pinned the replaced typing (changed afterwards, see above), and one timed test, below |
| `npm test`, last run, on the tree that is committed | **516 tests, 52 suites: 516 pass, 0 fail, 0 todo; 343 s** |
| `node --test --test-timeout=120000 canvas/app/test/scale.test.mjs`, three times in a row | pass 6 of 7, pass 7 of 7, pass 7 of 7 |

`# todo` is 0: none of the plan's seven todo tests exists yet (they are stage D's).

The timed failure of the first full run: `scale.test.mjs › a drag step takes under 16 ms at 5,000 elements in 3 views`: 22.6 ms starting and 11.1 ms following, against 16 (starting samples 27.9 and 17.2). Run by itself three times afterwards it passed each time: 11.9/9.0, 11.5/9.2, 12.3/9.9 ms. In the first of those three runs another timed test failed once: a pan step of `workflows` (the 2,112-node view) 25.6 ms starting and 19.1 following, against 25; the other two runs gave 18.6/12.4 and 16.8/15.0. The baseline on this container fails the same way on untouched code (the task's note: 17.3 against 16, 26.0 against 25, and one failure in three runs alone).

The medians, in ms (starting / following, or opening / joining a step):

| | full run 1 | alone 1 | alone 2 | alone 3 | full run 2 | limit |
|---|---|---|---|---|---|---|
| the 5,000-element model opens | 683 | 804 | 723 | 686 | 706 | 5,000 |
| a drag step | 22.6 / 11.1 | 11.9 / 9.0 | 11.5 / 9.2 | 12.3 / 9.9 | 12.4 / 10.0 | 16 |
| a keystroke in a name | 38.9 / 39.4 | 37.5 / 33.2 | 36.3 / 28.0 | 37.8 / 32.2 | 33.6 / 29.1 | 50 |
| a keystroke, Validation shown, 150 problems | 35.6 / 37.1 | 33.0 / 25.4 | 27.3 / 25.3 | 27.4 / 29.2 | 35.1 / 35.3 | 50 |
| a pan step, definitions | | 12.1 / 11.3 | 8.2 / 9.9 | 10.9 / 10.0 | 10.8 / 11.0 | 16 |
| a pan step, deployment | | 11.0 / 9.4 | 11.1 / 9.3 | 9.1 / 10.8 | 8.5 / 9.3 | 16 |
| a pan step, workflows (2,112 nodes) | | 25.6 / 19.1 | 18.6 / 12.4 | 16.8 / 15.0 | 15.6 / 17.0 | 25 |

What stage A adds to a step: per node, one comparison of `data.marks` in `layOut`, and three more keys in the comparison of a border item's data; per box read, one call of `codeRowsOf`. Nothing listens to the marks yet, so the checks are as idle as in slice 1. No limit was changed.

Three mutations were tried against the new tests and put back: the marks not carried over to a node, not carried over to an edge (each failed marks.test.mjs, test 2), and the widget rule taken out of `pressed` (failed actions.test.mjs, "any other key…").

## Tried and dropped

- Testing the keys' rules by pushing stand-in rows into an exported array before `actions()` is first called. Dropped for `loadCoreWith`, which replaces a whole module in a bundle of its own and needs no mutation of the core.
- A `SessionOptions.notes` hook and a second parameter of `marksOf` for stand-ins. Dropped for the same reason: no production signature changes.
- Making the session listen to its notes only from its first `listen()`. Dropped: `notesOf(session)` is made in `openSession`, and the session listens from then.

## Open points for the lead

1. **Seam 8's `ALIASES` comment contradicts section 2.** "'Backspace' as 'Delete'" against "`Delete` deletes, and `Backspace` does not". Built as section 2 and section 5 say.
2. **`KeyPlace` cannot say section 5's widget rule.** Built with a fourth, optional field `widget`. Stage C's listener must set it.
3. **Keys that acted in slice 1 and are no shortcut now**, because a key is a shortcut only as a row's `key` or one of the three aliases: Ctrl or ⌘ + Shift + S (TopBar saved and prevented the default whatever Shift did), Ctrl or ⌘ + Shift + Y (it redid), and Escape with Shift, Ctrl or Alt held (Tools.tsx put the tool down on any Escape). No test of slice 1 presses them. Two more aliases (`Mod+Shift+S`, `Mod+Shift+Y`) would keep the first two as they were; the plan names three aliases, so none was added.
4. **Escape from a checkbox or a radio button.** Tools.tsx treats every `INPUT` as a text field; `KeyPlace.typing` is one answer, documented as TopBar's narrower test (step 10), which Undo and Redo need. So Escape will act with the focus on a checkbox of Details unless stage C computes `typing` otherwise for it.
5. **Escape inside an open menu or the Explorer's tree acts** (section 5: "`Delete` and `Escape` act from such a widget"). With no tool in hand it then lets go of the selection, also when the Escape only meant to close a right-click palette. Stage C should run palette.test.mjs and selection.test.mjs with this in mind.
6. **`PlaneNode` and `NodeData` cannot hold a node of another renderer without a cast.** Seam 3 says "`Ask`, `Projection`, `PlaneNode` and `PlaneEdge` keep their form", but `PlaneNode.type` is one of the 13 shapes and `NodeData.form` is 'box', 'border' or 'small': a lifeline, a footprint or the axes fit neither. Left as the plan says; packages 2-10 and 2-11 will cast, or stage B widens the types.
7. **`hasReader` knows readers only.** Seam 2 counts an entry as built "when its reader and its body, or its node types, are both there". A kind lists its tools and loses its card in the store as soon as its reader is exported, whether or not its body is. Both land in one package, so it shows only inside that package's worktree.
8. **The marks make the checks live while a plane is shown** (seam 4, by design), once stage B's store listens. An Undo or Redo then runs a check inside its event (slice 1 measured about 40 ms at 5,000 elements), and a pause after an edit runs one. Stage E's measurement is where that shows.
9. **`SequenceEnd` has no form in the plan**; it is `unknown` in the skeleton.
10. **tools.test.mjs pinned the replaced typing in the page**; the plan's list of slice 1's tests that change names commands.test.mjs only.
11. **A state file's free note floats on no view until package 2-7**: the pass-through gives the file's record, which has `x` and `y` and no `view`, so `marksOf(session).free()` is empty for it. Expected by seam 11; said here so that stage B does not look for a free pin in the annotations fixture.
12. **Timed tests on this container** fail now and then with another agent beside them, on untouched code too. The numbers are above.

## The commit

`2199594`, local, not pushed: "wip(2-1): stage A, the core's seams". 45 files: canvas/app/src/core/ (32), plane/viewStore.ts, panels/Tools.tsx, canvas/app/test/ (10) and canvas/dist/app.js. Nothing under canvas/src, canvas/test or plan/ changed, and no file that unchanged.json lists (unchanged.test.mjs passes).

The logs of the runs are beside this report's folder, in /tmp/claude-0/-home-user-Grasp/c7f4c0c3-3293-5171-8b1a-2fc91a0152d6/scratchpad/: stage-a-test-1.log, stage-a-test-2.log, stage-a-scale-1.log to stage-a-scale-3.log.
