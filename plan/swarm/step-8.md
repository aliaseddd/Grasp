# Step 8, the planes at scale: the scaffold

Step 8 is measure, then tune. Session 24 took the measurements, with nothing else running, and this file holds them, the design of each change they point at in the plan's order, the contract between tests and code, the test lists, and the screenshot. The contracts themselves are comments in the code: `projectStep`, `linesDrawn`, `LARGE_VIEW` and `ProjectionRead` in `canvas/app/src/core/adapter.ts`, and `PlaneMiniMap` in `canvas/app/src/plane/MiniMap.tsx`.

## 1. What the step delivers

`plan/slice-1.md`, step 8:

> **What it delivers.** The planes answer what the direction asks of this slice's scale test. The model is `scaleState(5000)` of `canvas/test/scale-model.mjs`.
>
> **Tuning**, in this order, until the limits hold: unchanged nodes kept as the same objects; only what the window shows rendered; below 25% zoom, outlines without ports' names and lines without labels, then no lines; compartment rows as plain text.
>
> **Done when.** Three tests pass without their todo marks, three runs in a row: "a 5,000-element model opens" (each of its three tabs draws and answers a click; the time is reported, and the test fails above 5 s …), "a drag step takes under 16 ms at 5,000 elements in 3 views", and "a pan step of a fitted view takes under 16 ms at 5,000 elements".

The model has three views: `definitions`, a general view of 1,544 nodes and 384 drawn lines, which fits a 736 by 828 plane at 5.7%; `deployment`, an interconnection view of 1,344 nodes and 384 lines, at 6.4%; `workflows`, an action flow view of 2,112 nodes and 1,536 lines, at 4.3%. All three are far when fitted (under 25%).

### Where the limits stand before the step

The scale tests themselves, on the page as step 7 left it, by the median (`node --test --test-timeout=120000 canvas/app/test/scale.test.mjs`, alone):

| Test | Measured | Limit |
|---|---|---|
| The model opens | 516.5 ms | 5,000 ms |
| A drag step, when it follows one | 35.5 ms (six samples: 52.4, 40.1, 35.6, 35.3, 30.9, 23.9, falling as the code warms) | 16 ms |
| A pan step of `definitions`, starting and following | 21.9 and 17.8 ms | 16 ms |
| A pan step of `deployment` | 20.8 and 18.9 ms | 16 ms |
| A pan step of `workflows` | 29.9 and 30.0 ms | 16 ms |

So the model opens well inside its bound, and the other two limits fail.

### The table of times

Each figure is the median of 15 steps that follow the first of a gesture (5 gestures of 4 moves), in ms, as total = script + frame, where the script's time runs from the `pointermove` to the frame's animation callbacks and the frame's from there to the paint (`moveTiming` in `helpers.mjs`). They were taken by a scratch script on scratch builds of the page that carried switches: the minimap left out, the lines left out, a step of a drag that only moves the dragged node. Neither the script nor the builds are in the repository. The page was warm: each view was panned before it was dragged.

**A pan step of the fitted view**

| The page | `definitions` | `deployment` | `workflows` |
|---|---|---|---|
| As built | 14.3 = 8.2 + 6.3 | 13.9 = 7.0 + 6.0 | 26.8 = 14.3 + 12.5 |
| Without the minimap | 9.0 = 4.0 + 4.9 | 8.0 = 4.4 + 3.7 | 19.3 = 8.7 + 10.0 |
| Without lines while far | 11.4 = 6.3 + 4.9 | 9.2 = 4.9 + 4.3 | 17.7 = 8.1 + 8.1 |
| Without both | 8.1 = 3.9 + 4.4 | 6.2 = 3.0 + 3.2 | 10.8 = 4.5 + 6.2 |
| A minimap of our own whose viewBox follows the window, lines kept | 11.7 | 10.6 | 26.6 = 14.2 + 12.8 |
| A minimap of our own with a fixed viewBox, lines kept | 10.6 | 9.6 | 26.2 = 13.0 + 12.4 |
| **A minimap of our own with a fixed viewBox, no lines while far** | **9.1 = 4.5 + 4.6** | **7.7 = 4.1 + 3.4** | **12.2 = 5.8 + 6.4** |
| The same, and the viewport promoted to a layer (`will-change: transform`) | 37.3 | 21.5 | 50.7 |
| The same, and `contain: layout style paint` on every node | 9.6 | 9.9 | 15.4 |

**A drag step at 100%**

| The page | `definitions` | `deployment` | `workflows` |
|---|---|---|---|
| As built | 21.7 = 17.1 + 3.4 | 17.8 = 15.0 + 2.9 | 21.9 = 18.6 + 3.0 |
| Without the minimap | 16.8 = 14.9 + 1.9 | 17.2 = 13.8 + 2.2 | 19.2 = 17.1 + 2.0 |
| Without the minimap and without any line | 15.4 | 13.7 | 13.8 |
| A step that only moves the dragged node (no `placesFor`, no `project`), as built otherwise | 6.3 = 4.0 + 2.1 | 6.3 = 3.7 + 2.0 | 6.5 = 4.2 + 2.1 |
| The same with our own minimap | 4.9 | 4.9 | 5.5 |

Inside the store's `nodesChanged` at a step of a drag, as built: `placesFor` 1.4, 1.4 and 1.5 ms; `project` 10.7, 9.3 and 9.5 ms (9.1 to 12.6 over all the runs). In Node the same step of `definitions` takes 1.9 ms in `placesFor` and 14.6 ms in `project`.

What is mounted: fitted, every node and line of the view (1,544 and 384; 1,344 and 384; 2,112 and 1,536). At 100% on a box, 21 nodes and 56 lines, 24 and 9, 30 and 24.

**What the measure holds.** The plan asks that the step prove `moveTiming`'s measure holds all of a step's work, "with a mark at the plane's commit". A probe on the page as built watched the DOM: in 4 pans of 5 moves, all 20 changes of the viewport's `style` came after their `pointermove` and before the animation callbacks of the frame that handled it; in 3 drags of 5 moves, all 15 changes of the dragged node's `style` did likewise. The node's `class` changed at the press and at the release, never at a move. So the measure holds the commit and is not widened. Session 17 expected React Flow's `dragging` class to fall outside on a drag's first step; with `nodeDragThreshold` 0 it is set at the press.

**What running beside other test files costs.** With the two pan changes and the lower bound of a drag's step on a scratch build, the scale tests themselves, alone, three runs: a drag step 6.2, 6.4 and 6.1 ms; a pan step of `workflows` 12.8, 12.1 and 13.0 ms, starting 13.3, 12.5 and 14.5. The same test file run while a whole `npm test` ran beside it: a pan step of `workflows` 20.5 and 16.9 ms, starting 24.5 and 22.6; `deployment` up to 14.3. `npm test` runs its files side by side, three at a time on this machine's four processors, each with a Chromium that draws in software. So a limit that holds alone fails beside the other files. With the files run one at a time (`node --test --test-concurrency=1 …`) the suite takes 115 s where it took 48 s.

## 2. The changes, in the plan's order

Each change is kept only if the numbers move: section 6 says how that is measured and what "move" means.

**"Unchanged nodes kept as the same objects."** The adapter has kept them since step 6 (rule 5), and React Flow skips them. What a step of a drag still pays is working that out: the store calls `project()` at every step, which reads the whole view through the model's Proxies and the library's lookups and makes 1,544 nodes to find that 1,543 read as before. That is 9 to 13 ms of a 17 to 22 ms step, and the step without it takes 6.3 ms.

- **Change 1, a gesture's step is worked out from what the gesture's start read.** `projectStep` in `core/adapter.ts`. `project()` keeps what it read of the model with the projection (`read`); a step lays the view out again over those plain values and the gesture's places, and reads the model only where a box's saved width changed. The store calls `projectStep` already, so the change is the adapter's alone. Expected: a drag step of about 9 to 10 ms warm (6.3 ms, `placesFor`'s 1.4 ms, and a layout pass that should cost about what `placesFor` costs).

**"Only what the window shows rendered."** In place since step 6: a view of more than 300 nodes (`LARGE_VIEW`) is culled. At 100% a plane mounts 21 to 30 of its 1,344 to 2,112 nodes. Fitted, the window shows everything, so culling gives a fitted view nothing. No change.

**"Below 25% zoom, outlines without ports' names and lines without labels, then no lines."** The first two are in place since step 6: a far node is its own element and one inert child, and a far line has no label.

- **Change 2, no lines for a large view while it is far.** `linesDrawn` in `core/adapter.ts`: false when the view is far and has more than `LARGE_VIEW` nodes. The store hands its plane no edges then, and the projection keeps them. A view of 300 nodes or fewer keeps its lines at any zoom: there they cost nothing that matters, a person can still follow them, and the tests of steps 6 and 7 that hold "far or near, every line stays drawn" on the small fixtures stand as they are. Measured: a pan step of `workflows` goes from 26.8 to 17.7 ms with React Flow's minimap, and from 19.3 to 10.8 ms without it.

**"Compartment rows as plain text."** In place since step 6: a row is one element holding text, wrapped by the adapter. A pan step at 100% takes 3.6 to 4.7 ms. No change.

**Beyond the plan's list**, from session 17's reserve ("a lighter minimap of our own that draws the same picture") and session 20's review, which measured that the pan limit does not hold with React Flow's minimap drawn:

- **Change 3, a minimap of our own.** `plane/MiniMap.tsx`, with `plane/minimap.css`. React Flow's minimap subscribes once per node and changes its picture's viewBox at every step of a pan, which redraws every rectangle. Ours is one path for all the nodes, made again only when the nodes change, under a viewBox that follows the picture and not the window; a pan changes only the mask that shows the window. Measured: with change 2, a pan step takes 9.1, 7.7 and 12.2 ms with it, against 8.1, 6.2 and 10.8 ms with no minimap at all; a drag step loses 1.4 to 4.9 ms.

- **Change 4, the test files run one at a time.** `package.json`: `"test": "node --test --test-concurrency=1 --test-timeout=120000 canvas/app/test/*.test.mjs"`. A timing taken beside other work is not valid, and beside the other files the pan limit fails for `workflows` with every change above in place. The cost is 115 s for a run of the suite where it was 48 s. Session 17 foresaw it ("runs the files one at a time from then on"). It departs from the letter of step 2 of the plan, which gives the command without that flag.

## 3. The files

| File | What step 8 does with it | Task |
|---|---|---|
| `canvas/app/src/core/adapter.ts` | `project()` keeps `read`; `projectStep` works a step out from it; `linesDrawn` leaves a large far view's lines out | `8-impl-step` |
| `canvas/app/src/plane/MiniMap.tsx`, `canvas/app/src/plane/minimap.css` (new) | The minimap of our own | `8-impl-minimap` |
| `canvas/app/test/step.test.mjs` (new) | Node tests of `projectStep`, `linesDrawn` and the store's snapshot | `8-tests-step` |
| `canvas/app/test/minimap.test.mjs` (new) | Browser tests of the minimap | `8-tests-minimap` |
| `canvas/app/test/scale.test.mjs` | The three todo marks off; two tests more | `8-tests-scale` |
| `canvas/app/test/shots/scale.mjs` | The shot `scale.png` | `8-tests-scale` |
| `package.json` | The test files one at a time | `8-checks-close` |
| `canvas/app/shots/scale.png` (new), `canvas/dist/`, `plan/status.json`, `plan/notes.md` | The step's closing | `8-checks-close` |

`plane/viewStore.ts` and `plane/Plane.tsx` do not change: the store calls `projectStep` and `linesDrawn`, and the plane renders `PlaneMiniMap`, since the scaffold.

## 4. The contract between tests and code

| What | How a test finds it, and what it is |
|---|---|
| `projectStep(lib, model, view, start, places, { far, previous })` | Exported by the core (`loadCore()`). Its result equals `project(lib, model, view, { far, look: start.look, previous, places })` by value and by object. |
| A projection's `read` | `projection.read` is an object whose `model` is the model object it was read from and whose `view` is the view's id. A step that went the fast way has `read === start.read`; one that went the slow way has the `read` that `project()` made. `read` never holds a place that came in `places`. |
| A step reads the model once | On the fast way `projectStep` never calls `lib.reading` and never reads `view.layout`. A test hands `projectStep`, and nothing else, a `lib` whose `reading` counts its calls (an object made with `Object.create(lib)` and given its own `reading` with `Object.defineProperty`), and a `view` wrapped in a `Proxy` that counts reads of `layout`. The fast way knows the view by its id, so the wrapped view is the same view. `placesFor` itself calls `lib.reading` and reads `view.layout`: a test makes its places with the plain `lib` and the plain view. |
| A step's edges | `projectStep(...).edges === previous.edges` when `previous` is given, is of the same model state, and `previous.far` is the step's `far`. |
| `linesDrawn(nodes, far)` | Exported by the core. `false` exactly when `far` and `nodes > LARGE_VIEW` (300). |
| A store's snapshot of a large far view | `store.getSnapshot().edges` has length 0 and is the same array at every read while far; the lines are back, with the same ids in the same order, once the view is near (a crossing of 25% renews every edge, since a far edge has no label). |
| The lines of a large far plane | No `.react-flow__edge` inside `[data-testid="plane"][data-view="<id>"]`. |
| The minimap | One element that carries all three classes, `.react-flow__panel.react-flow__minimap.grasp-minimap` (React Flow's `Panel` puts its own class and ours on the same element), inside the plane. Exactly 200 by 150 px. Its right and bottom edges are 15 px from the plane's. |
| The minimap's picture | Inside the minimap: `svg[role="img"]` with a `<title>` reading `Minimap`, `width="200"`, `height="150"`, and a `viewBox`. `path.grasp-minimap-nodes`, whose `d` is one `M<x>,<y>h<w>v<h>h<-w>z` per node, with no space or other character between them. `path.grasp-minimap-mask`, with `fill-rule="evenodd"`, whose `d` is two such rectangles, likewise with nothing between them: the outer one, which is the viewBox grown by its own width and height on every side (`x - w`, `y - h`, `3w` by `3h`), then the window. No `.react-flow__minimap-node` anywhere. |
| The minimap's colours | The nodes' fill is `var(--grasp-line-strong)`, the mask's `var(--grasp-minimap-mask)`, the panel's background `var(--grasp-white)`. A test compares computed colours through `cssColor` of `helpers.mjs`. |
| The minimap with no node | `path.grasp-minimap-nodes` has `d=""`, and the `viewBox` is `0 0 200 150`. |
| The numbers | A step: under 16 ms by the median, starting and following apart. Opening: under 5,000 ms. `projectStep` in Node: under 5 ms by the median of 50 steps of `definitions` (the slow way takes about 14.6 ms there). |

## 5. The test lists

"Fails first with" is the first line of the failure when the test runs against the scaffold. "Breakage" is one change to the built code under which the test fails; a test that passes against the scaffold is marked "cannot fail first", and its breakage is then the only way it is seen to fail.

### `canvas/app/test/step.test.mjs` (Node), `describe('a gesture\'s step, and a large view\'s lines')`

It loads the core and the store with `loadPlanes()` of `core.mjs`, and opens sessions with `openText(lib, text, { name })`. The ten files are `stateFiles()` of `core.mjs`. `GRAPH` is each view of them that `isDrawn` says a plane draws (11 views). The 5,000-element model is `scaleState(5000)` of `canvas/test/scale-model.mjs`, its views by `VIEWS`. Two projections are "the same by value" when `plain()` of their `nodes`, of their `edges`, of `[...rects]` and of `bounds` are deeply equal; they are "the same by object against `p`" when, for every index, the node (and the edge) is `p`'s object at that index in the one exactly when it is in the other.

| # | Test name | What it does and asserts | Fails first with | Breakage |
|---|---|---|---|---|
| 1 | `a step reads as the whole projection does: every node of the ten files, moved` | For each view of `GRAPH`: `start = project(lib, model, view)`. For each node of `start`, one ask: a box or a small node moved by 37 right and 23 down from its position; a border item moved to the middle of the opposite side of its owner's rectangle. `places = placesFor(lib, model, view, start, [ask]).places`. Asserts `projectStep(lib, model, view, start, places, { previous: start })` and `project(lib, model, view, { previous: start, places })` are the same by value and the same by object against `start`. | Cannot fail first: the scaffold's `projectStep` calls `project`. | The step's layout leaves an owner's growth out (a box inside moved right no longer widens its owner). |
| 2 | `a step reads as the whole projection does: every box of the ten files, resized` | As 1, with two asks per box of a shape in `BOX_SHAPES`, each tried alone: a resize to its position and `width + 60` by `height`, and one to `max(80, width - 40)` by `height`. | Cannot fail first. | A resized box keeps the compartments wrapped for its old width. |
| 3 | `a step reads as the whole projection does: an owner resized from its top left` | The example. `Page` asked `{ resize: { x: -28, y: 32, width: 820, height: 290 } }` (session 23's numbers), and once more `{ x: 232, y: 172, width: 560, height: 150 }`. As 1. | Cannot fail first. | The places of the boxes inside the resized owner are left out of the step. |
| 4 | `a step reads as the whole projection does: the 5,000-element model, forty asks` | For each of the three views, forty asks, each tried alone. The first is fixed: a resize, at its position, 120 wider and 60 higher, of the box that holds border items in the middle service's cell: `Service<N>` in `definitions`, `Site<N>.service` in `deployment`, `Handle<N>` in `workflows` (`N` from `middleService(5000)`). The other thirty-nine come from a generator of the test's own with a fixed seed (`s = (s * 1664525 + 1013904223) % 4294967296`, from `s = 8`, each number `s / 4294967296`): a node of `start` picked by index (`floor(r * nodes.length)`); for a box whose next number is under 0.5, a resize at its position by `floor(r * 180) - 60` each way, held to at least 80 by 40; otherwise a move by `floor(r * 400) - 200` each way (a border item is moved the same way: `placesFor` puts it on its owner's nearest border). As 1, by value only. | Cannot fail first. | A border item's square does not follow its owner's new size. |
| 5 | `steps follow one another: each is laid out from the gesture's start and takes over what the last one made` | The example. Five moves of `Host`, each 10 further right than the last, each projected with `previous` the result before. Asserts each result is the same by value as `project` with the same `previous` and places; that every node but `Host`'s is the object `start` has, in every result; and that `Host`'s `data` is the object `start` has for it. | Cannot fail first. | Every step makes every node anew. |
| 6 | `a step that alters nothing gives back the projection before it` | The example. `projectStep(lib, model, view, start, new Map(), { previous: start }) === start`; and with `placesFor` of a move of `Host` to where it is. | Cannot fail first. | A step always returns a new projection object. |
| 7 | `a step keeps what React Flow set on a node` | The example. `previous` is `start` with `Host`'s node replaced by a copy with `selected: true` and `dragging: true`. A step that moves `Host` gives a node with both; a step that moves `App` gives `Host`'s node as the very object `previous` has. | Cannot fail first. | `selected` dropped from a node the step renews. |
| 8 | `a step makes no edge anew` | The example and the 5,000-element model's `workflows`. A step that moves a node with lines at it: `result.edges === previous.edges`, with `previous` `start` and with `previous` a step before. | "A step gave a new edges array: no edge reads a place, so edges must be previous.edges itself." | `edges` built with `map` at every step. |
| 9 | `a projection carries what it read, and a step's projection the same` | The example. `project(...).read` is an object, `read.model === session.model` and `read.view === view.id`. For a step that moves `Host`, `projectStep(...).read === start.read`. `{ ...start, nodes: [...start.nodes] }.read === start.read` (a copy carries it). | "project() gave a projection with no read: step 8 keeps what was read of the model with the projection." | `read` kept in a WeakMap by the projection object instead of on it. |
| 10 | `a step reads the model no more: no lookups, no layout` | The 5,000-element model's `definitions`. `start` is projected with the plain `lib`, and every step's places are made by `placesFor` with the plain `lib` and the plain view (`placesFor` itself calls `lib.reading` and reads `view.layout`). Only `projectStep` gets the counting `lib` and the view wrapped in a Proxy that counts reads of `layout`. Three runs, the counts set to 0 before each: twenty steps moving `middleService(5000)`, each 1 further right; five steps resizing it, each 10 wider; five moves of it with `start` projected `far: true` and `far: true` given. Asserts 0 calls of `reading` and 0 reads of `layout` in each run. | "20 steps called lib.reading 20 times: a step is worked out from what the gesture's start read." | The fast way taken for moves only (a resize, or a far view, sent the slow way). |
| 11 | `a step of the 5,000-element model's general view is worked out in under 5 ms` | `definitions`. Ten steps unmeasured, then 50 steps moving `middleService(5000)` by 1 more each, each `placesFor` then `projectStep` with `previous` the last result; only `projectStep` is timed (`performance.now()`). Asserts the median is under 5 ms, and reports "A step is worked out in N ms by the median of 50" as a diagnostic. | "A step of definitions is worked out in 14.6 ms by the median of 50, against 5 ms." (the figure varies) | `projectStep` calling `project`. |
| 12 | `a change that altered no node is in what the next gesture starts from` | A model made for the test: a part def `Outer` (no doc) at 0, 0, saved 200 by 120, holding a part `inner` at 300, 60, 100 by 40, so `Outer` is drawn 412 wide. `p1 = project(...)`. Through `session.history.edit`, `Outer`'s saved `w` becomes 240. `p2 = project(..., { previous: p1 })`; asserts `p2 === p1`. Then a step from `p2` that moves `inner` to 40, 60: asserts `Outer`'s node is 240 wide, and that the step is the same by value as `project` with those places. | Cannot fail first. | `project()` returning `previous` without giving it the `read` of that call (then `Outer` is 200 wide). |
| 13 | `what the fast way does not cover goes the slow way, with the same result` | The example. Five cases, each the same by value as `project` with the same options: `start` given as `{ ...start, read: undefined }`; `far: true` with a near `start`; `places` holding a place for an element the view does not place (an id not in `start.nodes`: a new part def added to the model outside any layout before `start` was made); `start` projected from another session's model of the same file; and a near step after a far one: `previous` is `project` of the same places with `far: true`, the step is asked with `far: false`, and its edges are then not `previous`'s (the edge `mount` has its label again). | Cannot fail first. | The fast way taken although `far` differs from `start.far` (the nodes then lack `far`). |
| 14 | `linesDrawn: a large view draws no line while it is far` | `linesDrawn(301, true) === false`; `linesDrawn(300, true)`, `linesDrawn(301, false)`, `linesDrawn(5000, false)`, `linesDrawn(0, true)` and `linesDrawn(13, true)` are `true`; `LARGE_VIEW === 300`. | "linesDrawn(301, true) is true: a view of more than 300 nodes draws no line while it is far." | `nodes >= LARGE_VIEW` for `>`. |
| 15 | `a large view's snapshot has no edge while it is far, and its edges again when it is near` | The 5,000-element model, the store of `workflows`, with a subscriber added before anything else. `store.camera(736, 828)` fits it far. Asserts `getSnapshot().far`, `getSnapshot().edges.length === 0`, and the same `edges` array at two reads. `store.moved({ x: 0, y: 0, zoom: 1 })`: 1,536 edges. `store.moved({ x: 0, y: 0, zoom: 0.05 })`: 0 again, the same empty array as before. `store.moved({ x: 0, y: 0, zoom: 1 })`: 1,536, with the same ids in the same order as the first near snapshot (not the same objects: a crossing renews every edge). The subscriber was called four times in all: once at `camera`'s fit, which is itself a crossing to far, and once at each `moved`. | "The far snapshot of workflows holds 1536 edges: a large view hands its plane no line while it is far." | The store's snapshot taking `projection.edges` whatever `linesDrawn` says. |
| 16 | `a small view keeps its lines while it is far` | The example's view in a store with a subscriber; `store.camera(736, 828)`, then `store.moved({ x: 0, y: 0, zoom: 0.1 })`. Asserts `far` and 6 edges. | Cannot fail first. | `linesDrawn` false whenever `far`. |

### `canvas/app/test/scale.test.mjs` (the browser), in its `describe('the planes at scale')`

The file's helpers (`openModel`, `showView`, `lookAt`, `gesture`, `moved`, `neighbourOf`, `groundOf`) stand. The keystroke test keeps its todo mark, which step 10 takes off.

| # | Test name | What it does and asserts | Fails first with | Breakage |
|---|---|---|---|---|
| 1 | `a 5,000-element model opens` (the todo mark off; the body as it is) | As written. | Cannot fail first: the model opens in about 0.5 s. | A wait of 6 s before the store's first projection (a busy loop at the top of `refresh()` in `plane/viewStore.ts`, the first time only): "The model of 5000 elements took 6… ms to open, against 5000 ms." |
| 2 | `a drag step takes under 16 ms at 5,000 elements in 3 views` (the todo mark off; the body as it is) | As written. | "A drag step takes 1.9 ms when it starts a drag and 35.5 ms when it follows one, by the median, against 16 ms." (the figures vary) | `projectStep` calling `project`. |
| 3 | `a pan step of a fitted view takes under 16 ms at 5,000 elements` (the todo mark off; the body as it is) | As written. | "A pan step of definitions, fitted at 5.7%, takes … ms when it starts a pan and … ms when it follows one, by the median, against 16 ms." followed by the two other views' lines; `workflows` is over the limit at about 30 ms. | `linesDrawn` always true. |
| 4 | `a large view draws no line while it is far, and its lines at 100%` | Opens the model, shows `workflows` (fitted, far). Asserts the plane holds no `.react-flow__edge`. `lookAt(page, view, BOX[view.id])` brings it to 100% on `Handle<N>.receive`. Waits (`soon`) for the edge whose `data-id` is `s-Handle<N>-receive-split` (`N` is `NUMBER`), and asserts the plane then holds at least 1 and fewer than 200 edges. Zooms out again with `zoomTo(page, view, BOX[view.id], 0.2)` of `helpers.mjs`, then waits (`soon`) until the plane holds no edge. | "The fitted plane of workflows, at 4.3%, draws 1536 lines: a large view draws none while it is far." | `linesDrawn` always true. |
| 5 | `the plane's commit falls inside what a step's time measures` | Opens the model and shows `definitions`. In the page: a capturing `pointermove` listener on the window notes the time and asks for an animation frame, whose callback notes its time; a `MutationObserver` on the plane's `.react-flow__viewport` (attribute `style`) notes each change's time. Two pans of the ground of 4 moves each, there and back, a frame waited after each move. Asserts at least 8 changes were seen, and that each lies after a noted `pointermove` and no later than that move's frame callback. Then `lookAt` the middle service, the same observer on its node (`style` only), two drags of 4 moves by its header: at least 6 changes (the first move of each drag is under the click distance when it is 3 by 2 px, so the test's moves are 12 by 6 px each), each inside likewise. | Cannot fail first: the probe of section 1 found every change inside. | For the drag: the store's `tell()` in `step()` put off with `setTimeout(tell, 0)`: "A change of the dragged node's place came … ms after the frame that handled its pointermove had run its callbacks." The pan's half cannot be broken from the application's code: React Flow writes the viewport's transform itself, in d3's handler. |

Check 7, 8 and 10 of `plan/status.json` are tests 1, 2 and 3.

### `canvas/app/test/minimap.test.mjs` (the browser), `describe('a plane\'s minimap')`

Fixture: the example, opened with `openIn(browser, stateFileAt(EXAMPLE))`, its view `v-proof` shown (`showView`), with both sides open, so the plane is 736 by 828 and shows the minimap. A helper of the file reads the minimap in the page: the `viewBox` as four numbers, and each path's `d` parsed into rectangles `{ x, y, w, h }` by the pattern of section 4.

| # | Test name | What it does and asserts | Fails first with | Breakage |
|---|---|---|---|---|
| 1 | `the minimap is one picture of our own, with nothing per node` | The file's helper is the test's first call, so that against the scaffold the test fails with the helper's sentence. Then asserts one `.react-flow__panel.react-flow__minimap.grasp-minimap` in the plane (one element with the three classes); its `svg[role="img"]` with the title `Minimap`, `width` 200 and `height` 150; one `path.grasp-minimap-nodes` with 13 rectangles; one `path.grasp-minimap-mask` with `fill-rule` `evenodd` and 2 rectangles; no `.react-flow__minimap-node`. | "The minimap of proofStructure holds no path.grasp-minimap-nodes: it is React Flow's own, with 13 elements of .react-flow__minimap-node." | The nodes drawn as one `<rect>` each. |
| 2 | `the minimap stands 15 px from the plane's right and bottom edges, 200 by 150` | The minimap's rectangle against the plane's, within 1 px. | Cannot fail first: React Flow's stands there too. | `position="bottom-left"`. |
| 3 | `the picture holds every node where the view has it` | Reads every node's rectangle on the screen (`rectsOf`) and the zoom (`boxOf` of `Page`). The picture's rectangle that is `Page`'s size is taken as the origin. Asserts that for each of the 13 nodes the picture holds a rectangle of its size (screen size over zoom), at its offset from `Page` (screen offset over zoom), within 0.5. | The message of test 1. | A child's place taken from the view's origin without its parent's added. |
| 4 | `the picture is centred in its viewBox, 5 px of the minimap clear around it` | From the 13 rectangles' bounds `b` and the contract's formula, the expected viewBox; asserts the `viewBox` attribute's four numbers are those, within 0.01, and that the mask's first rectangle is that viewBox grown by its own size on every side (`x - w`, `y - h`, `3w` by `3h`), within 0.01. | The message of test 1. | The margin left out. |
| 5 | `the window on the minimap is what the plane shows` | The mask's second rectangle is `plane width / zoom` by `plane height / zoom` (within 1), and holds the picture's rectangles of the nodes that are wholly on the plane. | The message of test 1. | The window's size not divided by the zoom. |
| 6 | `a pan moves the window on the minimap, and makes nothing else again` | Marks the nodes' path element in the page (a property set on it). Drags the ground by 60 right and 30 down. Asserts the element still carries the mark, its `d` and the `viewBox` are the strings they were, and the mask's second rectangle moved by `-60 / zoom` and `-30 / zoom` (within 0.5) with its size unchanged. | The message of test 1. | The viewBox widened to hold the window, as React Flow's does. |
| 7 | `a zoom resizes the window on the minimap` | Ctrl and the wheel on `Host` to 100% (`zoomTo(page, view, 'Host', 1)`, which may stop within 3% of it). With the zoom read from `boxOf` of `Host` afterwards, the mask's second rectangle is `plane width / zoom` by `plane height / zoom` units (within 1); the nodes' `d` and the `viewBox` are unchanged. | The message of test 1. | The zoom read once, when the minimap mounts. |
| 8 | `a dragged box moves on the minimap` | Drags `Host` by its header 80 right and 40 down (measured against `App`, as `move.test.mjs` does). `Host` and `App` are the same size, so each one's rectangle in the picture is found as test 3 finds a node's: by its offset from `Page`'s rectangle, taken from the screen at that moment. Asserts that after the release the picture holds a rectangle at `Host`'s new offset from `Page` and `App`'s where it was (so `Host`'s moved by `80 / zoom` and `40 / zoom` against `App`'s, within 0.5), and after an Undo one at `Host`'s first offset again. | The message of test 1. | The picture made once, when the plane mounts. |
| 9 | `the minimap takes its colours from the theme` | Computed `fill` of the nodes' path is `cssColor(page, 'var(--grasp-line-strong)')`, the mask's `cssColor(page, 'var(--grasp-minimap-mask)')`, the minimap's `background-color` `cssColor(page, 'var(--grasp-white)')`; the nodes' path has no stroke (`stroke` is `none`). | The message of test 1. | A colour written into `minimap.css`. |
| 10 | `a view that places nothing has an empty picture` | `canvas/state.json` (`BLANK`), its one view shown. The nodes' path has `d` empty, the `viewBox` is `0 0 200 150`, and the mask has 2 rectangles. | "The minimap of … holds no path.grasp-minimap-nodes" | A division by the bounds of no node (`NaN` in the viewBox, which Chromium logs). |
| 11 | `a click on the minimap does nothing and does not reach the ground` | `Host` selected (`selectBox`). A click on the middle of the minimap. `Host` is still selected, and the plane's zoom and `Host`'s place on the screen are as they were. | Cannot fail first: React Flow's minimap also takes the click. | `pointer-events: none` on the minimap (the click then reaches the ground and lets `Host` go). |

`small.test.mjs`'s "a narrow plane has no minimap, and a wide one has" finds the minimap by `.react-flow__minimap` and stands as it is.

## 6. How each change is kept or dropped

`8-checks-measure` is the lead's, with nothing else running. It builds the page four ways, in the plan's order, and for each runs `node --test --test-timeout=120000 canvas/app/test/scale.test.mjs` three times and notes the median of the three runs' medians for a drag step and for a pan step of each view. A timed test that passes reports its medians and samples as `#` lines of the runner's output; one that fails has them in its failure's message instead. `measure()` stops taking samples once more than half of those planned are on one side of the limit, so a build that fails is judged on fewer samples than one that passes:

| Build | What it holds |
|---|---|
| A | The scaffold: no change. |
| B | Change 1 (`projectStep`), with `linesDrawn` put back to `return true` for this build. |
| C | Changes 1 and 2. |
| D | Changes 1, 2 and 3 (the minimap of our own). |

A change is kept when the limit it is for moves by more than the runs differ among themselves: change 1 by a drag step's time from A to B; change 2 by a pan step of `workflows` from B to C; change 3 by a pan step of any view from C to D. A change whose numbers do not move is taken out again, with its tests: its file goes back to the scaffold's, and the notes say so. Session 24's own measurements say all three move (section 1); the table of A to D goes into `plan/notes.md` with the command.

Then change 4: `npm test` three times in a row with the files one at a time.

**If a limit still fails** with all four changes in, its test keeps its todo mark with its numbers, the other tests lose theirs, and the lead stops on that limit and brings Damon the measurement, where the time goes, and a restated limit to approve, because restating one changes `plan/direction.md`. The lead goes on with every task of steps 9 to 12 that does not depend on the answer.

## 7. The screenshot, `scale.png`

**The scenario**, `canvas/app/test/shots/scale.mjs`. The page comes without the file picker, 1400 by 900 at device scale 2.

1. Collapse both sides (`collapseSides`), as `example.png` does, before the file is opened: a view is fitted when it first has a size.
2. Open the 5,000-element model: `openStateFile(page, stateFileOf('scale-5000.json', scaleState(5000)))`.
3. Wait for the first view, `definitions`, to draw every node (`untilDrawn(page, view)`), then for the fonts and two animation frames, as the `example` shot does.
4. Move the pointer to (700, 20), a blank part of the top bar, off the plane and off every button (a pointer left on a button would put its tooltip in the image), and take the page: `page.screenshot({ path: path.join(out, 'scale.png') })`.

**The list its reviewer checks.** The first three items are the plan's row for `scale.png` ("The 5,000-element general view fitted: outlines only, no words"); the others follow from this step's design.

1. The tab in front is titled `definitions : GeneralView`, with two more tabs beside it.
2. The whole view is on the plane: a grid of several hundred small boxes with bare ground around it on every side, none cut by the plane's edge.
3. Every box is an outline only: no word can be read anywhere on the plane.
4. No line joins any two boxes.
5. The ground has no dots.
6. A minimap at the bottom right shows the same grid as grey rectangles; zoom buttons stand at the bottom left.
7. One bar of 40 px across the top, and a strip at each side of the window; the bar and the strips do not cover the plane.

## 8. Decisions, and what was tried and dropped

- **A large view is one of more than 300 nodes**, the number that already turns culling on (`CULL_OVER` of step 6, now `LARGE_VIEW` in the adapter). One number says "this view is too large to draw whole".
- **The lines are left out by the store's snapshot, not by the projection**, so the adapter's tests of what a far view holds stand, and a Node test can see the rule.
- **The minimap's viewBox follows the picture, not the window.** A window panned off the view shows as a wholly veiled picture. React Flow's own minimap widens to hold the window; that is what redraws every rectangle at each step.
- **The minimap is a picture, not a control**: it neither pans nor zooms the plane. React Flow's was used the same way.
- **`projectStep`'s bound in Node is 5 ms**, a third of the slow way's time there, so the test fails for the slow way and holds for any layout pass over plain numbers.
- **Tried and dropped, on scratch builds:** the viewport promoted to a layer while it pans (a pan step of 21 to 51 ms: every step paints a new layer of the whole view); `contain: layout style paint` on every node (15.4 ms for `workflows` against 12.2); a minimap of our own whose viewBox follows the window (26.6 ms for `workflows`: no better than React Flow's); leaving out the inert handle element of a far node (session 20 found that a node mounted without it loses its lines for good).
- **Not built, because no limit needs it:** a step that lays out only the boxes a gesture can reach, and a far form drawn as one picture with no node mounted. If change 1 leaves a drag step too slow, the first is the next lever; the second would change what a click on a far plane means and is not slice 1's.
- **What step 8's measure does not cover** (session 23): a top or left resize of an owner gives a place per box inside it at every step. `placesFor` and `projectStep` handle it by the same rules; no limit is set for it.
