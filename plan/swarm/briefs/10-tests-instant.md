# 10-tests-instant: the example's keystroke, timed

You are one agent of a swarm that builds step 10 of slice 1 of Grasp, a SysML v2 design canvas: the Details panel of the new page. This brief is all you are given. It and the files it names are enough to do the task; where they are not, that is a reason to stop and say so.

## The goal, and why

Add one test to `canvas/app/test/instant.test.mjs`: `a keystroke in a name of the example takes under 16 ms`, as the table "`canvas/app/test/instant.test.mjs`: one test more" in `plan/swarm/step-10.md`, section 4, gives it.

`plan/slice-1.md`, section 10, criterion 6, "Small models feel instant", asks that with the 13-element example a keystroke in a name take under 16 ms by the median of 9 samples, timed inside the page. The file already holds the criterion's other parts. The test is written before Details exists, and seen to fail for want of the name field.

## Where to read, in this order

1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `plan/swarm/step-10.md`: section 3, the rows on a text field and on a box's name; section 4, the table for `instant.test.mjs`.
3. `canvas/app/test/instant.test.mjs`, whole: its limits, `verdict`, and `a drag step of the example takes under 16 ms`, which your test is shaped as.
4. `canvas/app/test/helpers.mjs`: `timing` and its comment (a keystroke is timed from the keydown reaching the window to the end of the input event, plus the frame that follows), `measure`, `selectBox`, `fieldIn`, `nodeOf`, `soon`.
5. `canvas/app/test/scale.test.mjs`, the test `a keystroke in a name takes under 50 ms at 5,000 elements`: the same measure at scale, which stands as written.

## The files you own

- `canvas/app/test/instant.test.mjs`. You add one test at the end of its `describe` and a constant for its limit beside the others. Nothing else in the file changes: not a name, not a limit, not another test.

## The tests and the commands

Run from the root of your worktree, which the lead made for you from the commit your task starts at:

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/, the page the browser tests open from file://
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Build before every run of a browser test: the tests open `canvas/dist/index.html`, not the sources. `canvas/dist/` is yours to build and not to hand over: the lead builds it. Do not run the whole suite (`npm test`): other agents share this machine. A timed test (one that measures milliseconds in the page) is judged by the lead alone, with nothing else running: if one fails for you beside other work, send back its numbers and conclude nothing from them.

```sh
npm run build
node --test --test-timeout=120000 canvas/app/test/instant.test.mjs
```

Against your worktree the file's four tests pass as before and yours fails with `Details shows no name field for Host, picked (data-testid "field-name" in "details").` It picks `Host` with `selectBox`, which works today; it never reads `window.Grasp`; it reports its median and samples through `verdict`, as the file's other tests do.

Done is: the one test is added, fails today with that line, and the four others still pass.

## What to send back

- The first line of your test's failure, and the runner's summary for the file.
- Anything you settled where the table was silent, one line each.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
