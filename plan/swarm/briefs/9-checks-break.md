# 9-checks-break: each test of step 9 seen to fail with its thing broken

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is built in `canvas/app/` (React, React Flow for the planes, Dockview for the tabs and side panels, MUI X Tree View for the Explorer), beside an old page that must not change. Slice 1 of the rebuild is built in thirteen steps; this task is part of step 9, "The shared selection and the Explorer": one selection, kept for the open file, that every plane and every panel reads and sets, and the Explorer, a tree of the model at the left. The step's design is settled in `plan/swarm/step-9.md`, which was checked against the libraries' sources and a throwaway build. You make no design decision: where something you need is not said, stop and say what is missing.

Step 9 is built and its tests pass. A test that passes has not yet been seen to fail for the thing it claims to guard: session 19 of this project found tests that passed with the guarded thing taken out. You make, one at a time, the small breakage that `plan/swarm/step-9.md` names for each test, run that test, and put the code back. A test that still passes under its breakage is what you are looking for.

## Where to read, in this order

1. `plan/swarm/README.md`, "Words" and "The rules every brief carries".
2. `plan/swarm/step-9.md`: section 4, whole. Each row's last column is the breakage; the head of the section says what "Before" and "passes before" mean.
3. The source files a breakage is made in, with their contract comments: `canvas/app/src/core/selection.ts`, `canvas/app/src/plane/viewStore.ts`, `canvas/app/src/plane/Plane.tsx`, `canvas/app/src/plane/marquee.css`, `canvas/app/src/panels/explorerRows.ts`, `canvas/app/src/panels/Explorer.tsx`, `canvas/app/src/panels/explorer.css`, `canvas/app/src/shell/Dock.tsx`.

## The files you own

None. You change no file of the repository.

## The work, the tests and the commands

All from the root of your worktree, which the lead made for you from the commit that holds what you need:

```sh
npm ci                # node_modules/ from the lockfile, about 15 s; once
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open; again after every change to a source file
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Run single test files, never `npm test`: other agents share this machine, and the lead runs the whole suite alone. You build `canvas/dist/` to run browser tests and do not hand it over. A timed test (one that fails on a number of milliseconds) is judged by the lead alone, with nothing else running: if one fails for you beside other work, say so with its numbers and go on.

For each of the 60 rows of section 4's seven tables (C1 to C11, V1 to V8, R1 to R13, K1 to K9 and G1, X1 to X8, S1 to S10):

1. Make the breakage in the built code: the smallest change that does what the row's last column says. Where the words leave room, choose the reading a careless implementer would have built.
2. `npm run build` if the test runs in the page (the K, G, X and S rows).
3. Run the one test: `node --test --test-timeout=120000 --test-name-pattern="<the test's name>" canvas/app/test/<file>`.
4. Note whether it failed and the first line of its failure; then run the whole file and note which other tests of the file failed with it.
5. Put the source back: `git checkout -- canvas/app/src`. Check with `git status --short` that nothing under `canvas/app/src` or `canvas/app/test` is changed before the next row.

You change nothing for good: at the end your worktree's `git status --short` shows no change outside `canvas/dist/`. You write no test and fix none.

Done is: every row has its answer.

## What to send back

- A table of the 60 rows: the test, the breakage as you made it (the file and the line, in a few words), whether the test failed, the first line of its failure, and how many other tests of its file failed with it.
- Then, apart, every test that still passed under its breakage, with what you think the test fails to ask. These go back to the lead, who decides whether the test or the breakage is at fault.
- Any breakage you could not make as worded, and why.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings that are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
