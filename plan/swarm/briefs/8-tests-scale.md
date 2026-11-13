# 8-tests-scale: the scale tests of step 8, and the shot `scale.png`

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is being built in steps (`plan/slice-1.md`). Step 8 makes the planes hold three limits at 5,000 elements: the model opens in under 5 s, a step of a drag takes under 16 ms, and a step of a pan of each fitted view takes under 16 ms. The three tests were written in step 3 and are marked todo in `canvas/app/test/scale.test.mjs`. You take their todo marks off, add two tests that hold what step 8 changes and what its measure rests on, and write the scenario of the step's screenshot.

## Read first, in this order

1. `plan/swarm/step-8.md`: sections 1 and 2; section 4; in section 5 the list for `canvas/app/test/scale.test.mjs`; and section 7, the screenshot.
2. `canvas/app/test/scale.test.mjs` whole, and `canvas/app/test/helpers.mjs` whole (above all `moveTiming`, `measure`, `soon`, `untilDrawn`, `boxOf`, `groundOf`, `collapseSides`, `stateFileOf`, `openStateFile`).
3. `canvas/test/scale-model.mjs`: the ids of the 5,000-element model (`VIEWS`, `middleService`, and how a workflow's successions are named: `s-Handle<N>-receive-split`).
4. `canvas/app/test/shots.mjs` (the `example` row is the model for a shot that opens a file) and `canvas/app/test/shots/scale.mjs`, the skeleton you fill in.

## The files you own

`canvas/app/test/scale.test.mjs` and `canvas/app/test/shots/scale.mjs`.

## What to do

In `scale.test.mjs`:

- Take the `{ todo: … }` option off "a 5,000-element model opens", "a drag step takes under 16 ms at 5,000 elements in 3 views" and "a pan step of a fitted view takes under 16 ms at 5,000 elements". Change nothing else in those three tests. **Leave the todo mark on "a keystroke in a name takes under 50 ms at 5,000 elements"**: step 10 takes it off.
- Add tests 4 and 5 of the list, under those very names, after the pan test. Test 5's page script and its two halves are described in the list; its moves are 12 by 6 px each, with a frame waited after each (`frame(page)`), and it measures nothing against a limit: it asserts where each change of the DOM falls.
- Change the file's header comment where it says the tests are todo until their step builds them, so that it reads true: the three of step 8 are no longer marked, the keystroke's still is.

In `shots/scale.mjs`: write `take(page, out)` as section 7's scenario says, and leave `pending: true` as it is: `npm run shots` with no name goes on leaving the shot out until the step's closing takes `pending` off, and a shot that is named runs though pending. Import what you need from `../helpers.mjs` and `../../../test/scale-model.mjs`.

Then build and run: `npm run build`, then `node --test --test-timeout=120000 canvas/app/test/scale.test.mjs`. Against the scaffold, tests 1 and 5 pass, tests 2, 3 and 4 fail with the messages the list gives (the figures vary), and the keystroke test is reported as todo. Run `npm run shots -- scale` and look at `canvas/app/shots/scale.png` yourself against section 7's list; at the scaffold, items 4 and 6 are not yet as the list has them (lines are drawn, the minimap is React Flow's), which is expected. Do not hand the image over.

## What to send back

1. For each test: "passes, as listed", or the first line of its failure with its figures.
2. Whatever the list left open and how you settled it, each in one line.
3. Anything in the list or the scenario that looks wrong, with why.

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
