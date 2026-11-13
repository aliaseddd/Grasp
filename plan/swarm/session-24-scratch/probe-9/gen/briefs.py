import os, json
OUT = '/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/wt-9/plan/swarm/briefs'
os.makedirs(OUT, exist_ok=True)

RULES = '''## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings that are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
'''

COMMANDS = '''All from the root of your worktree, which the lead made for you from the commit that holds what you need:

```sh
npm ci                # node_modules/ from the lockfile, about 15 s; once
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open; again after every change to a source file
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Run single test files, never `npm test`: other agents share this machine, and the lead runs the whole suite alone. You build `canvas/dist/` to run browser tests and do not hand it over. A timed test (one that fails on a number of milliseconds) is judged by the lead alone, with nothing else running: if one fails for you beside other work, say so with its numbers and go on.
'''

def brief(task, title, goal, read, owns, body, back):
    owns_text = '\n'.join(f'- `{o}`' for o in owns) if owns else 'None. You change no file of the repository.'
    text = f'''# {task}: {title}

## The goal, and why

{goal.strip()}

## Where to read, in this order

{read.strip()}

## The files you own

{owns_text}

## The work, the tests and the commands

{COMMANDS}
{body.strip()}

## What to send back

{back.strip()}

{RULES}'''
    open(os.path.join(OUT, task + '.md'), 'w').write(text)

CONTEXT = '''Grasp is a SysML v2 design canvas whose new page is built in `canvas/app/` (React, React Flow for the planes, Dockview for the tabs and side panels, MUI X Tree View for the Explorer), beside an old page that must not change. Slice 1 of the rebuild is built in thirteen steps; this task is part of step 9, "The shared selection and the Explorer": one selection, kept for the open file, that every plane and every panel reads and sets, and the Explorer, a tree of the model at the left. The step's design is settled in `plan/swarm/step-9.md`, which was checked against the libraries' sources and a throwaway build. You make no design decision: where something you need is not said, stop and say what is missing.'''

TEST_WRITER = '''You write tests from a list, before the code they check exists. Another agent writes that code at the same time, from the same contract, without seeing your tests; the only things the two of you share are the contract comments in the source files and section 3 of `plan/swarm/step-9.md`. So a test finds what it reads exactly as that section says, and asserts what the contract says, no more: where the contract is silent, the test is silent.'''

READ_COMMON = '''1. `plan/swarm/README.md`, "Words" and "The rules every brief carries", and `plan/swarm/shared.md`, sections 1 and 6 (the selection, and what the tests share).'''

BACK_TESTS = '''- The file or files you own, in your worktree, committed there (add them by name; never `git add -A`).
- For each test: its name and the first line of its failure when run against your worktree as it is, where nothing of step 9 is built. It must be the "Before" the list gives, in the page's own terms; where your message differs in wording, give it. A test the list marks *passes before* passes.
- Anything in the list you could not write as given, with the reason, and each thing you had to choose because the list and the contract were silent.
- Do not hand over a throwaway implementation. You may write one outside the repository to see that your tests can pass.'''

# ---------------------------------------------------------------- tests
brief('9-tests-core', 'the selection\'s tests, in Node',
f'''{CONTEXT}

{TEST_WRITER}

Your file tests the selection itself, `canvas/app/src/core/selection.ts`, in Node, with no browser: what `set`, `toggle`, `click` and `front` do, what the listeners are told, and what happens to what is picked when the model changes. Every other part of step 9, and steps 10 to 12, build on these promises, so each is pinned here.''',
f'''{READ_COMMON}
2. `canvas/app/src/core/selection.ts`, whole: its comment is the contract you test.
3. `plan/swarm/step-9.md`: section 1, "The selection"; section 3, "The Node tests"; section 4, the head of the section and the table "`canvas/app/test/selection-core.test.mjs`".
4. `canvas/app/test/core.mjs`, whole (`loadCore`, `lib`, `EXAMPLE`, `readText`, `plain`, `clock`), and `canvas/app/test/history.test.mjs`, its first 80 lines, for how a Node test of the core opens a session and makes an edit.
5. `canvas/app/src/core/history.ts`, lines 1 to 200: `Told`, and `History`'s `edit`, `undo` and `listen`.
6. `canvas/test/scale-model.mjs`, for `scaleState(5000)` (import it, as `canvas/app/test/viewStore.test.mjs` does). Nothing under `canvas/test` may change.''',
['canvas/app/test/selection-core.test.mjs'],
'''Write the eleven tests C1 to C11 of the table, each under its exact name, in one `describe('the selection')`. A session is `core.openText(lib, readText(EXAMPLE), { name: 'example.json' }, { now: clock() })`; the selection is `core.selectionOf(session)`. The model library runs in another realm, so compare its objects as JSON (`plain`); what the selection gives (`items`) belongs to this realm, and a `Picked` is compared by its `type` and `id`.

The command: `node --test --test-timeout=120000 canvas/app/test/selection-core.test.mjs`. Against your worktree every test fails, with `selectionOf: step 9 builds it`. C11 reports its time as a line of the runner's output (`t.diagnostic(...)`), as the timed tests of `canvas/app/test/adapter.test.mjs` do.

Done is: the eleven tests exist under their names, each fails as the list says, `npm run check` passes, and the file is committed.''',
BACK_TESTS)

brief('9-tests-store', 'the store\'s tests of the selection, in Node',
f'''{CONTEXT}

{TEST_WRITER}

Your file is `canvas/app/test/viewStore.test.mjs`, the Node tests of a view's store (`canvas/app/src/plane/viewStore.ts`), which keeps one view's nodes and edges outside React. Until step 9 a node is selected when React Flow says so, view by view. From step 9 a node is selected exactly when the session's selection names its element, in every view that shows it; React Flow's own `select` changes pick nothing; and the store gains `marquee(rect)`. Two existing tests ask for the old contract and are restated in place, as strictly as they asked before; six are added.''',
f'''{READ_COMMON}
2. `canvas/app/src/core/selection.ts`, whole.
3. `canvas/app/src/plane/viewStore.ts`: the comment of `ViewStore`, whole, above all its last two entries ("Step 9: what is selected is the session's selection", and the entry on `marquee`).
4. `plan/swarm/step-9.md`: section 1, "Picking on a plane" (points 7 and 8, and the entries on `store.marquee(rect)` and on a hidden tab), and its table "What existing tests ask after step 9"; section 3, "The Node tests"; section 4, the head of the section and the table "`canvas/app/test/viewStore.test.mjs`".
5. `canvas/app/test/viewStore.test.mjs`, whole: its helpers (`session`, `example`, `listen`, `node`, `edge`, `rename`), and the tests "a gesture in the store" for how a drag is sent to `nodesChanged`.
6. `canvas/app/test/core.mjs`, `loadPlanes()`: its bundle holds the core, so `selectionOf` and `project` come from the same `await loadPlanes()` as `viewStoreOf`.''',
['canvas/app/test/viewStore.test.mjs'],
'''Restate V1 and V2 where they stand, under their present names, and add V3 to V8 in a new `describe('the selection in the store')` at the end of the file. Change no other test of the file.

The command: `node --test --test-timeout=120000 canvas/app/test/viewStore.test.mjs`. Against your worktree V1 and V3 to V8 fail with `selectionOf: step 9 builds it`, V2 fails with its own message, and every other test of the file passes as it did.

Done is: the eight tests are as the list says, each fails as the list says, the rest of the file passes, `npm run check` passes, and the file is committed.''',
BACK_TESTS)

brief('9-tests-rows', 'the tests of the Explorer\'s rows, in Node',
f'''{CONTEXT}

{TEST_WRITER}

Your file tests `canvas/app/src/panels/explorerRows.ts`, the part of the Explorer with no React in it: which rows the tree has, which are unfolded, how much of a long list is shown, what each row says, and what each kind of change of the model costs. At step 9 nothing in the page can rename an element or add one (Details is step 10, the tools step 11), so these Node tests are the only place where "after a change to the structure the Explorer builds its rows again; after any other it relabels" is checked.''',
f'''{READ_COMMON}
2. `canvas/app/src/panels/explorerRows.ts`, whole: the comments of `RowWords`, `RowItem` and `ExplorerRows` are the contract you test. `rowId`, `rowOf`, `pickedOf` and `PACKAGE_ROW` are final already.
3. `plan/swarm/step-9.md`: section 1, "The Explorer", with its table of what the Explorer does for each kind of `Told`; section 3, "The words, exactly", the example's 25 rows, the fixtures' pinned rows, "Numbers", and "The Node tests"; section 4, the head of the section and the table "`canvas/app/test/explorer-rows.test.mjs`".
4. `canvas/app/test/core.mjs`, whole: `loadWith('panels/explorerRows')`, `lib`, `EXAMPLE`, `FIXTURES`, `readText`, `plain`, `clock`.
5. `canvas/src/browser/lib.js` (`browserRows`: what the library gives) and `canvas/src/browser/page.js`, `browserRowParts` (the old page's words, which a row's words follow). Read only; nothing under `canvas/src` may change.
6. `canvas/app/src/core/history.ts`, lines 1 to 200 (`Told`, `edit`, `endEdit`, `undo`), and `canvas/test/scale-model.mjs` (`scaleState(n)` gives a model of exactly `n` elements; import it).''',
['canvas/app/test/explorer-rows.test.mjs'],
'''Write the thirteen tests R1 to R13 of the table, each under its exact name, in one `describe("the Explorer's rows")`. A session is `m.openText(lib, text, { name }, { now: clock() })` with `m = await loadWith('panels/explorerRows')`; the blank model is `canvas/state.json`.

The command: `node --test --test-timeout=120000 canvas/app/test/explorer-rows.test.mjs`. Against your worktree R1 passes (the four functions it reads are final) and R2 to R13 fail with `explorerRowsOf: step 9 builds it`. R13 reports its two times as lines of the runner's output (`t.diagnostic(...)`).

Done is: the thirteen tests exist under their names, each fails or passes as the list says, `npm run check` passes, and the file is committed.''',
BACK_TESTS)

BROWSER_READ = '''`canvas/app/test/helpers.mjs`, whole: how a test finds the page's parts (its head), `openIn`, `openPage`, `openStateFile`, `stateFileAt`, `stateFileOf`, `finish`, `soon`, `frame`, `showView`, `viewTab`, `boxOf`, `headerOf`, `selectBox`, `rectsOf`, `groundPoint`, `planeOf`, `nodeOf`, `modelOf`, `linesOf`, `cssColor`, `TEAL`, `showSide`, `rowOf`, `rowIn`, `rowItemIn`, `undo`. It does not change: a helper only your file needs is written in your file.'''

brief('9-tests-selection', 'the plan\'s six tests of the shared selection, in the page',
f'''{CONTEXT}

{TEST_WRITER}

Your file is `canvas/app/test/selection.test.mjs`, which the plan names in step 9's "Done when": six tests, under the plan's own words, and four more that need every part of the step together (a plane, the Explorer and the dock). They open the built page from `file://` in Chromium through Playwright, as every browser test of this repository does, and pick as a person does: clicks, Ctrl, Shift with a drag, the keyboard.''',
f'''{READ_COMMON}
2. `plan/slice-1.md`, section 5, step 9: the "Done when" these tests are.
3. `plan/swarm/step-9.md`: section 1, whole; section 3, whole ("The contract between tests and code": every selector, attribute, word and number you read); section 4, the head of the section and the table "`canvas/app/test/selection.test.mjs`"; and in the table of `picking.test.mjs`, how the marquee gesture M and `covered` are defined, which your S2 uses.
4. {BROWSER_READ}
5. `canvas/app/test/plane.test.mjs`, the test "a click selects a box and a line, and a click on the ground lets go" (how a line's middle is found and its stroke read), and `canvas/app/test/shell.test.mjs`, the test "with a view floating, the card says what is closed, and the views come back into the editor" (how a tab is closed, and the button "Show the views again").
6. `canvas/app/test/scale.test.mjs`, its first 45 lines: how the 5,000-element model is made and opened.
7. The comment of `ExplorerPanel` in `canvas/app/src/panels/Explorer.tsx`, for what a row is in the page.''',
['canvas/app/test/selection.test.mjs'],
'''Write the ten tests S1 to S10 of the table, each under its exact name, in one `describe('the shared selection')`. The sixth test's name holds double quotes: `'with the 5,000-element model only the package\\'s row is unfolded, and a long list ends in "Show more"'`.

Write the three small helpers the head of section 4 names (`selectedIn`, `selectedRows`, `rowsNow`) in your file, and one that waits for a row and fails with `The Explorer has no row for <what> (data-row "<type>:<id>"): its tree is not built.` Every wait is `soon(page, check, missing)`; there is no fixed sleep.

The command: `npm run build`, then `node --test --test-timeout=120000 canvas/app/test/selection.test.mjs`. Against your worktree S2 fails with the marquee's message and the others with the row's message.

Done is: the ten tests exist under their names, each fails as the list says, `npm run check` passes, and the file is committed.''',
BACK_TESTS)

brief('9-tests-picking', 'the tests of picking on a plane, in the page',
f'''{CONTEXT}

{TEST_WRITER}

Your files test picking on a plane as a person does it: a click, Ctrl or ⌘ with a click, a click on the ground, Shift with a drag (the marquee), a drag of picked and of unpicked boxes, and a tab that comes back. They read the planes only (which nodes and lines have React Flow's class `selected`), never the Explorer, so that the plane's implementer can make them pass before the Explorer exists. One existing test of `gestures.test.mjs` asks that Shift with a drag draw nothing, which step 9 changes on purpose: you restate it, as strictly as it asked before.''',
f'''{READ_COMMON}
2. `plan/swarm/step-9.md`: section 1, "Picking on a plane", whole, and the table "What existing tests ask after step 9"; section 3, "The planes"; section 4, the head of the section and the table "`canvas/app/test/picking.test.mjs` (the page) … and `gestures.test.mjs`".
3. {BROWSER_READ}
4. `canvas/app/test/gestures.test.mjs`, whole: the test you restate, "Shift with a drag draws no rectangle and leaves nothing over the boxes", and its neighbours, which stand.
5. `canvas/app/test/move.test.mjs`, lines 1 to 140: `dragTo`, `notPanned`, `untilBox`, and how "three boxes dragged together are one step" picks three boxes and measures a box against another, never against the screen. Copy what you need into your file.
6. `canvas/app/test/plane.test.mjs`, the tests "a click selects a box and a line, and a click on the ground lets go" and "a tab that is hidden holds no React Flow, and shown again finds its zoom and its selection".''',
['canvas/app/test/picking.test.mjs', 'canvas/app/test/gestures.test.mjs'],
'''Write the nine tests K1 to K9 in a new file, `canvas/app/test/picking.test.mjs`, in one `describe('picking on a plane')`, and restate G1 in `canvas/app/test/gestures.test.mjs` under its new name, changing no other test of that file.

A box is clicked on its header (`headerOf(await boxOf(...))`), clear of its name and its ports. A drag is measured against a box that was not dragged. The marquee gesture and `covered` are defined above the table.

The commands: `npm run build`, then `node --test --test-timeout=120000 canvas/app/test/picking.test.mjs` and `node --test --test-timeout=120000 canvas/app/test/gestures.test.mjs`. Against your worktree K3 and K4 pass, the other seven of `picking.test.mjs` fail with the messages the list gives, G1 fails with its message, and the other four tests of `gestures.test.mjs` pass as they did.

Done is: the ten tests are as the list says, each fails or passes as the list says, `npm run check` passes, and both files are committed.''',
BACK_TESTS)

brief('9-tests-explorer', 'the tests of the Explorer, in the page',
f'''{CONTEXT}

{TEST_WRITER}

Your file tests the Explorer panel in the page: what it shows with and without a file, what a row is and how it looks, what a click, Ctrl, Shift and the keys do in the tree, and that the tree never widens its panel. It reads the Explorer only: no test of yours clicks on a plane, clicks a view's row or reads `aria-current`, so that the Explorer's implementer can make the file pass before the plane's and the dock's parts exist.''',
f'''{READ_COMMON}
2. `canvas/app/src/panels/Explorer.tsx`: the comment of `ExplorerPanel`, whole (what a row is in the page, what each click and key does), and `canvas/app/src/panels/explorer.css`.
3. `canvas/app/src/panels/explorerRows.ts`: the comment of `RowWords`.
4. `plan/swarm/step-9.md`: section 1, "The Explorer"; section 3, "The Explorer" with the words, the example's 25 rows and the numbers; section 4, the head of the section and the table "`canvas/app/test/explorer.test.mjs`".
5. {BROWSER_READ}
6. `canvas/app/test/shell.test.mjs`: the tests "the text is drawn in Roboto, loaded from the page's folder" and "the shell's text is 13 px" (how a font is read) and "keyboard focus can be seen" (how a focus ring is read).''',
['canvas/app/test/explorer.test.mjs'],
'''Write the eight tests X1 to X8 of the table, each under its exact name, in one `describe('the Explorer')`. Write the helpers `selectedRows` and `rowsNow` the head of section 4 names in your file, and one that waits for a row and fails with `The Explorer has no row for <what> (data-row "<type>:<id>"): its tree is not built.`

The keys are sent with `page.keyboard.press(...)` after a click on a row has put the focus in the tree. The row with the focus is `document.activeElement`.

The command: `npm run build`, then `node --test --test-timeout=120000 canvas/app/test/explorer.test.mjs`. Against your worktree X1 fails with `The Explorer says "The model's tree comes in step 9.", not "No model is open."` and the others with the row's message.

Done is: the eight tests exist under their names, each fails as the list says, `npm run check` passes, and the file is committed.''',
BACK_TESTS)

# ---------------------------------------------------------------- implementers
BACK_IMPL = '''- The files you own, in your worktree, committed there (add them by name; never `git add -A`; not `canvas/dist/`).
- The summary line of each test file the brief names (`# pass`, `# fail`), and for each failing test its name and first line.
- Each thing you decided because the contract was silent, with what you chose; and anything in a contract or a test that you found wrong, with the evidence. If you stopped on one, say where.
- Each place where your code departs from what `plan/swarm/step-9.md` says, with the reason.'''

brief('9-impl-selection', 'the selection',
f'''{CONTEXT}

You build `selectionOf(session)` in `canvas/app/src/core/selection.ts`: the one list of what is picked, kept for a session outside React. Its contract is the comment in that file, and it is shared: the planes, the Explorer and the dock of this step, Details (step 10), the tools (step 11) and Validation (step 12) are all written against it at the same time as you write it. So the exported types and signatures do not change, and every sentence of the comment holds.''',
'''1. `plan/swarm/README.md`, "Words" and "The rules every brief carries", and `plan/swarm/shared.md`, section 1.
2. `canvas/app/src/core/selection.ts`, whole.
3. `plan/swarm/step-9.md`: section 1, "The selection".
4. `canvas/app/src/core/history.ts`, lines 1 to 200 (`Told`, `History.listen`), and `canvas/app/src/core/session.ts`.
5. `canvas/app/src/plane/viewStore.ts`, `storesOf` and `viewStoreOf` at its end: how something is kept for a session, weakly, and how every listener is told even when one throws.
6. `canvas/app/test/selection-core.test.mjs`: the tests you make pass.''',
['canvas/app/src/core/selection.ts'],
'''Fill in the body of `selectionOf`. What the comment does not spell out and you must hold to:

- **No searching.** `has(type, id)` is asked for every node and line of a plane after every projection; it reads a set of keys kept beside `items`. Whether the model holds an id (`set`, `toggle`, `front`) is answered from an index of the model's element, relationship and view ids, made when first needed and thrown away when the history tells of a change with `told.structure`. Test C11 times it.
- **`items` is never changed in place.** Each change makes a new array; a reader that kept the old one still reads the old.
- **A change of the model** is heard through one listener on `session.history`, added by the first `selectionOf(session)`. Only `told.structure` matters to it.
- Nothing here imports React, the DOM or a library: the core runs in Node.

The commands: `node --test --test-timeout=120000 canvas/app/test/selection-core.test.mjs`, which must pass 11 of 11; then `npm run build` and `npm run check`. Also run `node --test --test-timeout=120000 canvas/app/test/history.test.mjs` and `canvas/app/test/viewStore.test.mjs`: the first passes as before; of the second, the tests that passed before still pass (some of its step 9 tests fail until the store is built, which is another task's).

Done is: `selection-core.test.mjs` passes whole, `npm run check` passes, and the file is committed.''',
BACK_IMPL)

brief('9-impl-plane', 'picking on a plane: the store and the plane',
f'''{CONTEXT}

You build the planes' part: a node or a line is selected on a plane exactly when the session's selection names it; every click on a plane becomes one `Hit` and goes through one function, `clicked(hit)`; Shift with a drag draws a marquee that picks what it covers; and React Flow's own selecting picks nothing. `plan/swarm/step-9.md`, section 1, "Picking on a plane", says what React Flow 12.10.2 does at each of these and exactly what the store and the plane do about it. It was built once, as a throwaway, and every existing test of the planes passed against it; follow it to the letter.''',
'''1. `plan/swarm/README.md`, "Words" and "The rules every brief carries", and `plan/swarm/shared.md`, sections 1, 2 and 4.
2. `canvas/app/src/core/selection.ts`, whole: the selection you call. It is built already in your worktree.
3. `plan/swarm/step-9.md`: section 1, "Picking on a plane", whole; section 3, "The planes"; section 4, the tables of `viewStore.test.mjs`, of `picking.test.mjs` and `gestures.test.mjs`, and S1 to S4 of `selection.test.mjs`.
4. `canvas/app/src/plane/viewStore.ts`, whole, and `canvas/app/src/plane/Plane.tsx`, whole: the files you change, with their contracts.
5. React Flow's own source, for the passages section 1 leans on: in `node_modules/@xyflow/react/dist/esm/index.js`, `getSelectionChanges` (line 782), `Pane` (1412), `handleNodeClick` (1568), `NodesSelection` (1942), `NodeWrapper`'s `onSelectNodeHandler` (2156), the edge's click (2854), `addSelectedNodes` and `unselectNodesAndEdges` (3407); in `node_modules/@xyflow/system/dist/esm/index.js`, `adoptUserNodes` (1602), `getDragItems` (1978) and `XYDrag`'s `startDrag` (2063 on).
6. `canvas/app/test/viewStore.test.mjs`, `canvas/app/test/picking.test.mjs`, `canvas/app/test/gestures.test.mjs`: the tests you make pass.''',
['canvas/app/src/plane/viewStore.ts', 'canvas/app/src/plane/Plane.tsx', 'canvas/app/src/plane/marquee.css'],
'''**In `viewStore.ts`:**

- What is selected: after every projection (a change of the model, a step and the end of a gesture, a crossing of 25%) and after every change of the selection (`selectionOf(session).listen`, one listener a store, added when the store is made), each node whose `selected` is not `selection.has('el', id)` and each edge whose `selected` is not `selection.has('rel', id)` gets a new object with it set, in a new array; every other object, and an array in which nothing differs, stays the one it was. A live store then tells its subscribers once, and only if the snapshot is a new object. A store with no subscriber only notes that its marks are out of date and sets them at its next `getSnapshot()`, without projecting.
- A `select` change in `nodesChanged` or `edgesChanged` picks nothing. Each node or edge it names that the projection holds gets a new object that reads as the selection says (a copy, in a new array), and the subscribers are told once for the call. A `select` naming nothing the projection holds changes nothing and tells nobody. The rest of `nodesChanged` (a gesture's steps and its end) is as it is.
- `marquee(rect)`, a new method, bound like the others: section 1 says what it picks. It reads the rectangles from the projection's `rects`, and the nodes and edges from the snapshot.
- Bring the comment of `ViewStore` in line with what you built: its entry "React Flow's changes: select" describes step 6's rule, which is gone; the file's head says the store keeps "React Flow's own `selected`", which it no longer does.

**In `Plane.tsx`:** the props section 1 lists, `clicked(hit)`, the three click callbacks, and one more child component of `<ReactFlow>` beside `Follow`, which (a) puts `useReactFlow().screenToFlowPosition` where the callbacks reach it, and (b) subscribes to React Flow's store, `useStoreApi().subscribe((state, before) => ...)`, to hand the marquee's rectangle to `store.marquee`, to set `nodesSelectionActive` back to false, and to raise the flag that drops the click after a marquee. The flag is cleared by a capturing `pointerdown` listener on the plane's root element. Import `./marquee.css`. Bring the comment's sentence on `selectionKeyCode={null}` in line.

**`canvas/app/src/plane/marquee.css`**, a new file, is exactly:

```css
/* The marquee: React Flow's rectangle while Shift is held and the pointer dragged, in the theme's teal. */
.grasp-plane .react-flow__selection {
  background: color-mix(in srgb, var(--grasp-teal) 8%, transparent);
  border: 1px dotted var(--grasp-teal);
}
```

What not to do: do not set `elementsSelectable` to false (it switches the marquee off); do not turn a `select` change into a pick, not even during a marquee; do not wrap the plane in a `ReactFlowProvider`; do not change `core/selection.ts`, `core/adapter.ts` or `app.css`.

The commands, after `npm run build`: `node --test --test-timeout=120000 canvas/app/test/viewStore.test.mjs` (30 of 30), `canvas/app/test/picking.test.mjs` (9 of 9) and `canvas/app/test/gestures.test.mjs` (5 of 5). Then each of these, which passed before you began and must still pass: `plane.test.mjs`, `move.test.mjs`, `small.test.mjs`, `keys.test.mjs`, `resize.test.mjs`, `instant.test.mjs`, `open.test.mjs`, `sturdy.test.mjs`, `fit.test.mjs`, `adapter.test.mjs`. `selection.test.mjs` and `explorer.test.mjs`, if they are in your worktree, fail until the Explorer and the dock are built: that is another task's. Then `npm run check`.

Done is: those three files pass whole, the ten others pass as before, `npm run check` passes, and your three files are committed.''',
BACK_IMPL)

brief('9-impl-explorer', 'the Explorer: its rows and its panel',
f'''{CONTEXT}

You build the Explorer: `canvas/app/src/panels/explorerRows.ts`, a session's rows with no React in them, and `canvas/app/src/panels/Explorer.tsx`, the panel that draws them with MUI X Tree View 8.29.3 (the free edition, which has no virtualization) and joins them to the session's selection. Both files hold their contracts as comments, written against Tree View's own source and a throwaway build that drew the 5,000-element model's tree. The stylesheet, `explorer.css`, is written; you import it.''',
'''1. `plan/swarm/README.md`, "Words" and "The rules every brief carries", and `plan/swarm/shared.md`, sections 1, 3 and 7.
2. `canvas/app/src/panels/explorerRows.ts`, whole, and `canvas/app/src/panels/Explorer.tsx`, whole: the two contracts. Then `canvas/app/src/panels/explorer.css`, `canvas/app/src/panels/SidePanel.tsx` and `canvas/app/src/shell/dockContext.ts`.
3. `canvas/app/src/core/selection.ts`, whole: the selection you read and set. It is built already in your worktree.
4. `plan/swarm/step-9.md`: section 1, "The Explorer"; section 3, "The Explorer"; section 4, the tables of `explorer-rows.test.mjs` and `explorer.test.mjs`; section 6, the measurements.
5. `canvas/src/browser/lib.js` (`browserRows`) and `canvas/src/browser/page.js`, `browserRowParts`: the old page's rows and their words, which you port. Read only.
6. Tree View's own source, under `node_modules/@mui/x-tree-view/`: `useTreeItem/useTreeItem.mjs` (what `getRootProps`, `getContentProps`, `getIconContainerProps` and `getGroupTransitionProps` give, and where `event.defaultMuiPrevented` is read), `TreeItem/TreeItem.mjs` from line 212 (how its own item is put together around `TreeItemProvider`), `internals/plugins/selection/itemPlugin.mjs` (the `aria-checked` you take off), `internals/plugins/keyboardNavigation/TreeViewKeyboardNavigationPlugin.mjs` (the keys), `RichTreeView/useExtractRichTreeViewParameters.mjs` (the props).
7. `canvas/app/src/core/adapter.ts`, lines 60 to 90: what of the model library is declared already. `KindRow` has no `label`, and a row of `RELATIONSHIPS` is declared with its `line` only: read a kind's and a relationship kind's `label` through a cast of your own in `explorerRows.ts`, since a property of the library's type cannot be declared twice with two types.
8. `canvas/app/test/explorer-rows.test.mjs` and `canvas/app/test/explorer.test.mjs`: the tests you make pass.''',
['canvas/app/src/panels/explorerRows.ts', 'canvas/app/src/panels/Explorer.tsx', 'canvas/app/src/panels/explorer.css'],
'''**`explorerRows.ts`:** fill in `explorerRowsOf`. The exported names and signatures stay. `rowId`, `rowOf`, `pickedOf` and the constants are final. Keep a session's rows in a `WeakMap` by the session, as `viewStoreOf` keeps a session's stores.

**`Explorer.tsx`:** replace the body of `ExplorerPanel` and add what it needs in the file, as its comment says. In short: `RichTreeView`, `useTreeItem` and `TreeItemProvider` come from `@mui/x-tree-view`, which `vendor.ts` holds whole. The row is a `forwardRef` component given to `slots.item`; it receives `itemId`, `label`, `id` and `children`. `getContentProps()` also returns a `status` object, which must not reach the `div`. `getRootProps({ onKeyDown })` calls your `onKeyDown` before Tree View's own, which is skipped when you set `event.defaultMuiPrevented = true`. A row reaches the session's rows, the selection and `showView` through a React context that this file makes and provides around the tree, never through a module-level variable. Import `./explorer.css`.

`explorer.css` is written and was seen to give the measures the tests ask. Change it only where a test or the contract asks for something it does not give, and say so.

What not to do: do not use Tree View's own `TreeItem`, its checkboxes or its label editing; do not key the tree by the session or mount it again while a file is open; do not unfold a row or show more of a list to reveal what was picked elsewhere; do not give Tree View new `items` when only a row's words changed; do not change `SidePanel.tsx`, `dockContext.ts`, `Dock.tsx` or `app.css`.

`useDock().showView` throws until the dock's task builds it, which comes after yours. None of the tests you are to pass clicks a view's row.

The commands: `node --test --test-timeout=120000 canvas/app/test/explorer-rows.test.mjs` (13 of 13); after `npm run build`, `canvas/app/test/explorer.test.mjs` (8 of 8). Then `canvas/app/test/shell.test.mjs`, `canvas/app/test/open.test.mjs` and `canvas/app/test/instant.test.mjs`, which passed before you began and must still pass: a tree that widens its panel fails `shell.test.mjs`. `selection.test.mjs`, if it is in your worktree, fails until the plane's and the dock's parts are built. Then `npm run check`.

Done is: those two files pass whole, the three others pass as before, `npm run check` passes, and your three files are committed.''',
BACK_IMPL)

brief('9-impl-dock', 'the dock: a view\'s tab from its row, and the view in front',
f'''{CONTEXT}

You build the dock's part, the last of the step's four: `showView(viewId)`, which the Explorer calls for a view's row, and the telling of which view is in front, `selectionOf(session).front(...)`, which the Explorer shows on a view's row now and the Tools view reads at step 11. And `window.Grasp.selection`, for looking. The selection, the planes and the Explorer are built already in your worktree, so when you are done every test of step 9 passes.''',
'''1. `plan/swarm/README.md`, "Words" and "The rules every brief carries", and `plan/swarm/shared.md`, sections 1, 3 and 5.
2. `canvas/app/src/shell/Dock.tsx`, whole: its comment's entry "Step 9" is your contract, and `addViews` is what `showView` follows for a view with no tab. `canvas/app/src/shell/dockContext.ts`: `DockState.showView`. `canvas/app/src/shell/App.tsx`: its comment's entry "Step 9", and `GraspGlobal`.
3. `canvas/app/src/core/selection.ts`: `front`, `view`.
4. `plan/swarm/step-9.md`: section 1, "The dock", with its table of what Dockview does; section 3, "The dock"; section 4, the table of `selection.test.mjs`.
5. Dockview's own source, `node_modules/dockview-core/dist/package/main.esm.mjs`: `fireActivePanelChange` (line 19113), `doSetGroupActive` and `doSetGroupAndPanelActive` (19477 on), and where `_onDidActivePanelChange` is made with `replay: true` (16910): a new listener is handed the last event at once.
6. `canvas/app/test/selection.test.mjs`: the tests you make pass, S5 and S7 above all.''',
['canvas/app/src/shell/Dock.tsx', 'canvas/app/src/shell/App.tsx'],
'''**In `Dock.tsx`:**

- `showView` becomes a function of the component (`useCallback` on `api` and `session`) in place of the module-level one that throws, and goes into the context value as before. A view of the open file that has a panel: `panel.api.setActive()`. One that has none: its tab is added as `addViews` adds a missing view (give `addViews` the one view to add), and it is in front. Anything else: nothing. It does not touch the selection, and it does not move the keyboard's focus.
- The view in front: one effect on `api` and `session`. It holds the view that was in front (it starts from `selection.view`), and a function that applies section 1's rule to `api.activePanel` and calls `selection.front(...)`. That function runs when the effect starts, on `api.onDidActivePanelChange` and on `api.onDidRemovePanel`; the effect's cleanup disposes both. A view's panel is this session's when its id begins `view:` and its `params.session` is the session (`ViewParams`).
- Nothing else of the dock changes: the sides, the record, the card and the tabs' ids are as they are.

**In `App.tsx`:** `GraspGlobal` gains `readonly selection: Selection | null`, and the effect that sets `window.Grasp` gives it `selectionOf(session)`, or null with no file.

The commands, after `npm run build`: `node --test --test-timeout=120000 canvas/app/test/selection.test.mjs` (10 of 10). Then, since you are the last implementer of the step, each of these, one at a time: `selection-core.test.mjs`, `viewStore.test.mjs`, `explorer-rows.test.mjs`, `picking.test.mjs`, `gestures.test.mjs`, `explorer.test.mjs`, `shell.test.mjs`, `open.test.mjs`, `plane.test.mjs`, `move.test.mjs`, `keys.test.mjs`, `instant.test.mjs`. All pass. Then `npm run check`.

If a test of `selection.test.mjs` fails for a reason that lies in a file you do not own (the plane, the store, the Explorer, the selection), do not change that file: say which test, what the page does, and where you think the fault is.

Done is: `selection.test.mjs` passes whole, the twelve others pass, `npm run check` passes, and your two files are committed.''',
BACK_IMPL)

# ---------------------------------------------------------------- checks and review
brief('9-checks-break', 'each test of step 9 seen to fail with its thing broken',
f'''{CONTEXT}

Step 9 is built and its tests pass. A test that passes has not yet been seen to fail for the thing it claims to guard: session 19 of this project found tests that passed with the guarded thing taken out. You make, one at a time, the small breakage that `plan/swarm/step-9.md` names for each test, run that test, and put the code back. A test that still passes under its breakage is what you are looking for.''',
'''1. `plan/swarm/README.md`, "Words" and "The rules every brief carries".
2. `plan/swarm/step-9.md`: section 4, whole. Each row's last column is the breakage; the head of the section says what "Before" and "passes before" mean.
3. The source files a breakage is made in, with their contract comments: `canvas/app/src/core/selection.ts`, `canvas/app/src/plane/viewStore.ts`, `canvas/app/src/plane/Plane.tsx`, `canvas/app/src/plane/marquee.css`, `canvas/app/src/panels/explorerRows.ts`, `canvas/app/src/panels/Explorer.tsx`, `canvas/app/src/panels/explorer.css`, `canvas/app/src/shell/Dock.tsx`.''',
[],
'''For each of the 60 rows of section 4's seven tables (C1 to C11, V1 to V8, R1 to R13, K1 to K9 and G1, X1 to X8, S1 to S10):

1. Make the breakage in the built code: the smallest change that does what the row's last column says. Where the words leave room, choose the reading a careless implementer would have built.
2. `npm run build` if the test runs in the page (the K, G, X and S rows).
3. Run the one test: `node --test --test-timeout=120000 --test-name-pattern="<the test's name>" canvas/app/test/<file>`.
4. Note whether it failed and the first line of its failure; then run the whole file and note which other tests of the file failed with it.
5. Put the source back: `git checkout -- canvas/app/src`. Check with `git status --short` that nothing under `canvas/app/src` or `canvas/app/test` is changed before the next row.

You change nothing for good: at the end your worktree's `git status --short` shows no change outside `canvas/dist/`. You write no test and fix none.

Done is: every row has its answer.''',
'''- A table of the 60 rows: the test, the breakage as you made it (the file and the line, in a few words), whether the test failed, the first line of its failure, and how many other tests of its file failed with it.
- Then, apart, every test that still passed under its breakage, with what you think the test fails to ask. These go back to the lead, who decides whether the test or the breakage is at fault.
- Any breakage you could not make as worded, and why.''')

brief('9-review-code', 'the independent review of step 9',
'''Grasp is a SysML v2 design canvas whose new page is built in `canvas/app/`, beside an old page that must not change. Slice 1 of the rebuild is built in thirteen steps by many agents from outlines; step 9, "The shared selection and the Explorer", has just been built and its tests pass. You review it as someone who has not seen its outline: you read the plan's own text for the step and the code that was written, and you try in the built page whatever you doubt. Past reviews of this kind found what the outlines had left unsaid (a press that was not yet a drag; an undo in the middle of a gesture), which is why the review does not start from the outline: do not open `plan/swarm/step-9.md` or the briefs under `plan/swarm/briefs/`.''',
'''1. `plan/slice-1.md`: sections 2 to 4, step 9 in section 5, and section 10 (the success criteria; criteria 2 and 6 must go on holding).
2. `plan/direction.md`, "The slices", item 1, and "Decided for slice 1".
3. The step's diff: `git diff <the scaffold commit>..HEAD -- canvas/app/src canvas/app/test`, where the scaffold commit is the one the lead names when it hands you this brief. Read it whole, and the contract comments of the files it touches as they now stand: `canvas/app/src/core/selection.ts`, `plane/viewStore.ts`, `plane/Plane.tsx`, `panels/explorerRows.ts`, `panels/Explorer.tsx`, `shell/Dock.tsx`, `shell/dockContext.ts`.
4. `canvas/app/test/helpers.mjs`, for how a probe opens the page and finds its parts.
5. The libraries' sources under `node_modules/` wherever the code leans on what a library does (`@xyflow/react`, `@xyflow/system`, `dockview-core`, `@mui/x-tree-view`).''',
[],
'''Look for defects: behaviour that the plan's text for step 9 asks and the page does not give; behaviour the code's own contract comments promise and the code does not keep; a case the comments do not cover and the code handles badly (nothing picked, several things picked, another file opened, a picked thing that leaves the model after an undo, a tab closed or floated, the editor split, the keyboard, the 5,000-element model of `canvas/test/scale-model.mjs`, `scaleState(5000)`); a test that would pass with the thing it guards broken; a slower page (the plan's limits: the 5,000-element model opens in under 5 s, a step of a drag and of a pan take under 16 ms, and step 10 will need a keystroke under 50 ms).

Try what you doubt in the built page: `npm run build`, then a script of your own with Playwright, kept outside the repository, that opens `canvas/dist/index.html` as the tests do. A probe may read `window.Grasp` (the session, the selection, the views' stores); a test may not. You change no file of the repository.

Done is: every doubt you had is either reproduced as a defect or tried and found sound.''',
'''- Each defect: what a person does, what the page does, what it should do and where that is asked (the plan's sentence, or the contract comment), the probe that showed it, and where in the code you think it comes from. A defect you could not reproduce is said to be unreproduced.
- What you tried and found sound, in a line each, so that it is not tried again.
- Tests that would pass with their thing broken.
- Nothing about style, naming or what you would have designed otherwise, unless it hides a defect.''')

brief('9-checks-close', 'the lead closes step 9',
'''This task is the lead's own (`plan/swarm/README.md`, "How the lead runs the swarm", point 7). Step 9 is closed when its "Done when" and the criteria of `plan/slice-1.md`, section 10, both hold at one commit that passes by itself. It comes after `8-checks-close`: step 9's "Done when" asks that step 8's three scale tests still pass, and criterion 7 asks that the commits come in step order.''',
'''1. `plan/slice-1.md`, step 9 and section 10; `plan/swarm/README.md`, point 7; `plan/swarm/shared.md`, section 8.
2. `plan/swarm/step-9.md`, whole, and what `9-checks-break` and `9-review-code` sent back.''',
[],
'''Nothing else runs on the machine while a timed test is judged.

1. Every file the step's tasks own is in the main tree, and no other file of theirs. Every defect of `9-review-code` and every test that `9-checks-break` saw pass under its breakage is settled: fixed with a test seen to fail first, or written into the notes as known and kept, with the reason.
2. `npm run build`, `npm run check`.
3. `npm test`, three times in a row: `# fail 0` each time, and `# todo 1` (check 9, the keystroke, is step 10's).
4. Alone, three times each: `node --test --test-timeout=120000 canvas/app/test/scale.test.mjs` and `canvas/app/test/instant.test.mjs`. Step 8's three scale tests pass each time; the opening of the 5,000-element model is under 5 s (it was about 0.56 s before the Explorer drew a tree, and 0.6 to 0.9 s with it in the probe); "the example is drawn within 1 s" holds. The medians go into the notes.
5. Step 9 takes no screenshot. `npm run shots` is not run for it.
6. `plan/status.json`: `"step": 9`; the checks are as step 8 left them, one still `"todo"`.
7. `plan/notes.md`, the session's entry: what was built otherwise than `plan/swarm/step-9.md` says, each rework and whose fault it was, the times of point 4 with their commands, what the review found and what was done, and what is known and kept.
8. One commit: the sources, the tests, `canvas/dist/` as built, `plan/status.json`, the notes. Checked out by itself it passes `npm ci && npm run check && npm test` with `# fail 0` and `# todo 1`. Pushed.

Done is: that commit, pushed.''',
'''Nothing: the lead does this task itself. Its record is the commit and the session's entry in `plan/notes.md`.''')

print(sorted(os.listdir(OUT)))
