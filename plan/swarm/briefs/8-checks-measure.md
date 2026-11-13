# 8-checks-measure: each change of step 8 measured, alone, and kept only if the numbers move

This task is the lead's own, because a timing taken beside other work is not valid: no other agent runs while it is done.

## The goal, and why

Step 8 of `plan/slice-1.md` is measure, then tune. Session 24 measured the page as step 7 left it and designed three changes to the page (`plan/swarm/step-8.md`, section 2). The plan's rule for tuning is "each change kept only if the numbers move" (`plan/notes.md`, session 17, "Step 8"). This task measures each change as it comes in, in the plan's order, and keeps or drops it.

## Read first

`plan/swarm/step-8.md`, sections 1, 2 and 6. `canvas/app/test/scale.test.mjs`: each timed test reports its medians and samples as `#` lines of the runner's output.

## The files you own

None that you hand over as code of your own. You decide which of `canvas/app/src/core/adapter.ts` (`8-impl-step`), `canvas/app/src/plane/MiniMap.tsx` with `canvas/app/src/plane/minimap.css` (`8-impl-minimap`) and their test files stay in the step.

## What to do

With `8-tests-scale`, `8-impl-step` and `8-impl-minimap` taken into the tree, build the page four ways, as section 6 of `step-8.md` says (A: the scaffold's `adapter.ts` and `MiniMap.tsx`; B: `projectStep` built and `linesDrawn` put back to `return true`; C: both built; D: C and the minimap of our own). For each build run, three times, with nothing else running:

```sh
npm run build && node --test --test-timeout=120000 canvas/app/test/scale.test.mjs
```

Note for each run the model's opening time, a drag step's two medians, and a pan step's two medians for each of the three views. Per build, take the median of the three runs.

A change is kept when the limit it is for moves by more than the three runs of one build differ among themselves:

- change 1 (`projectStep`): a drag step that follows one, from A to B;
- change 2 (`linesDrawn`): a pan step of `workflows`, from B to C;
- change 3 (the minimap): a pan step of any view, from C to D.

A change whose numbers do not move is taken out again with its tests: its file goes back to the scaffold's body, the tests that hold it leave their test file, and the session's entry in `plan/notes.md` says what was tried and dropped, with the figures.

Write the table of A to D into the session's entry in `plan/notes.md`, with the command above.

If, with every change in, a limit still fails alone: its test gets its `{ todo: … }` option back with its numbers in the reason, the tests that pass keep theirs off, and the limit goes to Damon with the measurement, where the time goes (the script's and the frame's share, from the samples), and a restated limit to approve. Restating a limit changes `plan/direction.md`, which needs Damon's word. Go on with every task of steps 9 to 12 that does not depend on the answer.

## What "done" is

The table is in the notes; each change is in the tree or out of it with its tests; `npm run check` passes.

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
