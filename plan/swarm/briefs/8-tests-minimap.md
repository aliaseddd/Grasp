# 8-tests-minimap: the browser tests of a plane's minimap

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is being built in steps (`plan/slice-1.md`). Each view of a model is drawn on a plane, with a minimap at its bottom right. Today that minimap is React Flow's, which costs 5 to 8 ms of every step of a pan at 5,000 elements. Step 8 draws one of our own: one picture, with nothing per node. You write the browser tests that hold it, in one new file, before the code exists. Another agent builds the minimap from the same contract without seeing your tests, so the tests must find it exactly as the contract says it is.

## Read first, in this order

1. `plan/swarm/step-8.md`: in section 2, change 3; section 4 (the contract between tests and code); and in section 5 the list for `canvas/app/test/minimap.test.mjs`. That list is your work order: eleven tests.
2. `canvas/app/src/plane/MiniMap.tsx`: the comment of `PlaneMiniMap`, which is the contract.
3. `canvas/app/test/helpers.mjs` whole. You will use `launch`, `openIn`, `stateFileAt`, `EXAMPLE`, `BLANK`, `modelOf`, `showView`, `planeOf`, `boxOf`, `rectsOf`, `selectBox`, `headerOf`, `groundPoint`, `zoomTo`, `cssColor`, `undo`, `soon`, `frame`, `finish`, `closePages`, `near`.
4. `canvas/app/test/small.test.mjs` and `canvas/app/test/move.test.mjs`: the model for a browser test's shape (`before`, `afterEach(() => closePages(browser))`, `after`), for how a pan and a drag are made with the mouse and measured against another box, and for the style of an assertion's message.
5. `plan/swarm/shared.md`, section 6: what every test keeps to.

## The file you own

`canvas/app/test/minimap.test.mjs` (new).

## What to do

Write the eleven tests of the list, under those very names, in the list's order, in one `describe`. No test is marked todo or skipped. Every test ends with `finish(opened)`. A helper of the file reads the minimap in the page as the list says: the `viewBox` as four numbers, and a path's `d` parsed into rectangles by the contract's pattern, `M<x>,<y>h<w>v<h>h<-w>z`. When the minimap holds no `path.grasp-minimap-nodes`, the helper fails with the sentence the list gives for test 1, naming the view and how many `.react-flow__minimap-node` elements it found.

Then build and run the file against the scaffold: `npm run build`, then `node --test --test-timeout=120000 canvas/app/test/minimap.test.mjs`. Tests 2 and 11, which the list marks "cannot fail first", must pass; each of the others must fail with the message the list gives.

## What to send back

1. For each test: "passes, as listed" or the first line of its failure.
2. Whatever the list left open and how you settled it, each in one line.
3. Anything in the list or the contract that looks wrong, with why.

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
