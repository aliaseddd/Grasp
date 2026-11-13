# 9-impl-plane: picking on a plane: the store and the plane

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is built in `canvas/app/` (React, React Flow for the planes, Dockview for the tabs and side panels, MUI X Tree View for the Explorer), beside an old page that must not change. Slice 1 of the rebuild is built in thirteen steps; this task is part of step 9, "The shared selection and the Explorer": one selection, kept for the open file, that every plane and every panel reads and sets, and the Explorer, a tree of the model at the left. The step's design is settled in `plan/swarm/step-9.md`, which was checked against the libraries' sources and a throwaway build. You make no design decision: where something you need is not said, stop and say what is missing.

You build the planes' part: a node or a line is selected on a plane exactly when the session's selection names it; every click on a plane becomes one `Hit` and goes through one function, `clicked(hit)`; Shift with a drag draws a marquee that picks what it covers; and React Flow's own selecting picks nothing. `plan/swarm/step-9.md`, section 1, "Picking on a plane", says what React Flow 12.10.2 does at each of these and exactly what the store and the plane do about it. It was built once, as a throwaway, and every existing test of the planes passed against it; follow it to the letter.

## Where to read, in this order

1. `plan/swarm/README.md`, "Words" and "The rules every brief carries", and `plan/swarm/shared.md`, sections 1, 2 and 4.
2. `canvas/app/src/core/selection.ts`, whole: the selection you call. It is built already in your worktree.
3. `plan/swarm/step-9.md`: section 1, "Picking on a plane", whole; section 3, "The planes"; section 4, the tables of `viewStore.test.mjs`, of `picking.test.mjs` and `gestures.test.mjs`, and S1 to S4 of `selection.test.mjs`.
4. `canvas/app/src/plane/viewStore.ts`, whole, and `canvas/app/src/plane/Plane.tsx`, whole: the files you change, with their contracts.
5. React Flow's own source, for the passages section 1 leans on: in `node_modules/@xyflow/react/dist/esm/index.js`, `getSelectionChanges` (line 782), `Pane` (1412), `handleNodeClick` (1568), `NodesSelection` (1942), `NodeWrapper`'s `onSelectNodeHandler` (2156), the edge's click (2854), `addSelectedNodes` and `unselectNodesAndEdges` (3407); in `node_modules/@xyflow/system/dist/esm/index.js`, `adoptUserNodes` (1602), `getDragItems` (1978) and `XYDrag`'s `startDrag` (2063 on).
6. `canvas/app/test/viewStore.test.mjs`, `canvas/app/test/picking.test.mjs`, `canvas/app/test/gestures.test.mjs`: the tests you make pass.

## The files you own

- `canvas/app/src/plane/viewStore.ts`
- `canvas/app/src/plane/Plane.tsx`
- `canvas/app/src/plane/marquee.css`

## The work, the tests and the commands

All from the root of your worktree, which the lead made for you from the commit that holds what you need:

```sh
npm ci                # node_modules/ from the lockfile, about 15 s; once
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open; again after every change to a source file
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Run single test files, never `npm test`: other agents share this machine, and the lead runs the whole suite alone. You build `canvas/dist/` to run browser tests and do not hand it over. A timed test (one that fails on a number of milliseconds) is judged by the lead alone, with nothing else running: if one fails for you beside other work, say so with its numbers and go on.

**In `viewStore.ts`:**

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

Done is: those three files pass whole, the ten others pass as before, `npm run check` passes, and your three files are committed.

## What to send back

- The files you own, in your worktree, committed there (add them by name; never `git add -A`; not `canvas/dist/`).
- The summary line of each test file the brief names (`# pass`, `# fail`), and for each failing test its name and first line.
- Each thing you decided because the contract was silent, with what you chose; and anything in a contract or a test that you found wrong, with the evidence. If you stopped on one, say where.
- Each place where your code departs from what `plan/swarm/step-9.md` says, with the reason.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings that are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
