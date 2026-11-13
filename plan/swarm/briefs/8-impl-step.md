# 8-impl-step: a gesture's step worked out from what its start read, and no lines for a large far view

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is being built in steps (`plan/slice-1.md`). Step 8 makes the planes hold at 5,000 elements: a step of a drag must take under 16 ms. Measured on the page as it is, a step takes 17 to 22 ms, and 9 to 13 ms of that is `project()` reading the whole view from the model again at every step, to find that one node of 1,544 moved. You change the adapter so that a step is worked out from what the drag's start already read (`projectStep`), and so that a large view's lines are left out while it is far (`linesDrawn`). The store and the plane call both already, so the adapter is the only file that changes.

## Read first, in this order

1. `canvas/app/src/core/adapter.ts` whole. The contract of what you build is in the comments of `Projection.read`, `ProjectionRead`, `projectStep`, `linesDrawn` and `LARGE_VIEW`; `project`'s seven rules and `build()` are what you reshape.
2. `plan/swarm/step-8.md`: sections 1 and 2 (the measurements, and changes 1 and 2), section 4 (the contract between tests and code), and in section 5 the lists for `step.test.mjs` and `scale.test.mjs`.
3. `canvas/app/src/plane/viewStore.ts`: how the store calls `projectStep` (in `step()` and in `refresh()`) and `linesDrawn` (in `adopt()`), and that it copies projections with `{ ...projection, nodes }`.
4. `canvas/app/test/step.test.mjs`, the tests you must pass; and `canvas/app/test/adapter.test.mjs`, the tests that must go on passing.

## The file you own

`canvas/app/src/core/adapter.ts`.

## What to do

**`linesDrawn`**: its body becomes what its comment says.

**`projectStep`**, as its comment says. The way to it:

- Split what `build()` does in two. The first part reads the model for one view and keeps everything no place can alter, as plain values: this is `ProjectionRead`, to which you give its fields. The second part lays the view out from a `ProjectionRead` and a set of places, and gives nodes, edges, rects and bounds; it reads nothing from the model, except an element's own fields when a box's saved width differs from the width its compartments were wrapped for.
- `project()` runs both parts, inside `lib.reading` as now, and its result carries the `read`. When it returns `previous` itself (rule 5), it first gives `previous` the `read` of this call.
- `projectStep()` runs the second part alone, on `start.read` and `places`, then rule 5 against `previous`, and returns `previous.edges` itself as `edges` when the comment says so. Where the comment says the slow way stays, it returns what `project()` returns.

`project()`'s results must not change by one number: `adapter.test.mjs` holds it to the old page's own layout of the ten files and of the 5,000-element model.

You are done when:

- `node --test --test-timeout=120000 canvas/app/test/step.test.mjs` passes, all sixteen;
- `node --test --test-timeout=120000 canvas/app/test/adapter.test.mjs canvas/app/test/viewStore.test.mjs canvas/app/test/fit.test.mjs canvas/app/test/sturdy.test.mjs` passes as before;
- `npm run build` and `npm run check` pass, and after the build `node --test --test-timeout=120000 canvas/app/test/move.test.mjs canvas/app/test/resize.test.mjs canvas/app/test/plane.test.mjs canvas/app/test/gestures.test.mjs` passes as before;
- `node --test --test-timeout=120000 canvas/app/test/scale.test.mjs` reports its times. The drag test and the pan test are timed: run the file when you can, and send the figures back. The lead judges them alone, and the pan limit also needs the minimap that another agent is building, so a pan step over 16 ms is not yours to fix.

Each change of step 8 is kept only if the numbers move. If `projectStep` passes its tests and a drag step is no faster than before, say so with the figures rather than adding to it.

## What to send back

1. Which tests pass, and the figures the scale tests reported.
2. The fields you gave `ProjectionRead`, and whatever the contract left open and how you settled it, each in one line.
3. Anything in the contract or the tests that looks wrong, with why.

## Where you work, and the commands

You work in a git worktree the lead made for you, at a commit that holds the scaffold and the work of the tasks this one needs. Run every command from the worktree's root.

```sh
npm ci                # once: node_modules/ from package-lock.json, about 15 s
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open
npm run check         # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Build before you run a browser test: it opens `canvas/dist/index.html` from `file://`. Do not hand `canvas/dist/` over: the lead builds it. Other agents share this machine, so a timed test may fail for you while it would pass alone: say so in what you send back, and the lead judges it alone. Commit your owned files in the worktree, added by name (never `git add -A`), so the lead can read your diff.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

Two more things, of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** If you find a signature, a contract or a test wrong, stop and say what you found and why. Do not change a file you do not own, and do not bend your own work to fit.
