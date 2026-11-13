# 8-tests-step: the Node tests of a gesture's step and of a large view's lines

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is being built in steps (`plan/slice-1.md`). Step 8 makes the planes hold at 5,000 elements. Two of its changes are in the adapter, `canvas/app/src/core/adapter.ts`: `projectStep`, which works out a step of a drag from what the drag's start read of the model, and `linesDrawn`, which leaves a large view's lines out while it is far. You write the Node tests that hold both, in one new file, before the code exists. Another agent builds the code from the same contract without seeing your tests, so the tests must ask for exactly what the contract says.

## Read first, in this order

1. `plan/swarm/step-8.md`: section 2 (the changes), section 4 (the contract between tests and code), and in section 5 the list for `canvas/app/test/step.test.mjs`. That list is your work order: sixteen tests, each with its exact name, what it does and asserts, the message it fails with against the scaffold, and its breakage.
2. `canvas/app/src/core/adapter.ts`: the comments of `Projection`, `ProjectionRead`, `ProjectOptions`, `project` (its seven rules), `projectStep`, `placesFor`, `linesDrawn`, `LARGE_VIEW`. They are the contract.
3. `canvas/app/src/plane/viewStore.ts`: the comment of `ViewSnapshot` and of `ViewStore`.
4. `canvas/app/test/core.mjs` whole (`loadPlanes`, `lib`, `stateFiles`, `plain`, `clock`), and `canvas/app/test/viewStore.test.mjs` and the `placesFor` tests of `canvas/app/test/adapter.test.mjs`, which are the model for how a session is opened, a store made and a projection compared in Node.
5. `canvas/test/scale-model.mjs`: `scaleState`, `VIEWS`, `middleService`.

## The file you own

`canvas/app/test/step.test.mjs` (new).

## What to do

Write the sixteen tests of the list, under those very names, in the list's order, in one `describe`. No test is marked todo or skipped. Give each assertion a message in plain words that says what the adapter did and what it should do, as the existing tests do; where the list gives the message a test fails with against the scaffold, the test's first failing assertion says that sentence (a figure in it may vary).

Then run the file against the scaffold: `node --test --test-timeout=120000 canvas/app/test/step.test.mjs`. The tests the list marks "cannot fail first" must pass, and each of the others must fail with the message the list gives. A test that fails for another reason, or passes where it should fail, is wrong or the list is: find out which before you send anything back.

The file needs no browser and must run in a few seconds; the timed test (11) reports its median with `t.diagnostic`.

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
