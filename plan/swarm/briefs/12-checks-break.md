# Brief: `12-checks-break`

You are one agent of a swarm that builds slice 1 of Grasp, a SysML v2 design canvas, from a scaffold: the design is written already, as contract comments in skeleton files and as `plan/swarm/step-12.md`. You have this brief and the files it names, and nothing else; you can do the task from them without asking anything. You work in a git worktree that the lead made for you. Its root is the repository's root, and every path below is from there.

## The goal, and why

See each test of step 12 fail with the thing it guards broken. Step 12 is built: its four test files pass. A test that passes proves little until it has been seen to fail for its own reason, and most of these tests failed before the code existed only for want of the whole panel. So, for each test, you make the one small change to the built code that its row names, run the test, and put the code back. A test that still passes under its breakage is what you are looking for.

## Read, in this order

1. `plan/swarm/step-12.md`, section 4: the four tables. The last column of each row, "The breakage", is the change to make; section 3 says what the tests read.
2. The files the breakages are made in: `canvas/app/src/core/checks.ts`, `canvas/app/src/core/probe.ts`, `canvas/app/src/panels/Validation.tsx`, `canvas/app/src/shell/About.tsx`.
3. The four test files: `canvas/app/test/checks.test.mjs`, `probe.test.mjs`, `validation.test.mjs`, `about.test.mjs`.

## The files you own

None. You change source files to break them and put each back at once; when you finish, `git status --short` shows nothing changed.

## The tests and the commands

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/; a browser test opens the built page, so build before you run one
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Do not run `npm test`, the whole suite: other agents share this machine, and the lead runs it alone. A timed test is judged by the lead alone: a time taken while other agents work proves nothing. If a timed test fails beside your work, say so in what you send back and go on. `canvas/dist/` is built to run the tests and is not handed over: the lead builds it.

For each of the 42 rows (13, 16, 6 and 7), one at a time:

1. Make the breakage, as small as the row's words allow, in the source file it belongs to.
2. For a test of the page (`validation.test.mjs`, `about.test.mjs`): `npm run build`. A Node test needs none.
3. Run the row's test alone: `node --test --test-timeout=120000 --test-name-pattern="<the test's name>" canvas/app/test/<file>`. Note whether it failed, and the first line of its failure.
4. Run the whole file once under the same breakage, and note which other tests failed.
5. Put the source back (`git checkout -- <file>`), and go on.

At the end: `npm run build`, `npm run check`, and each of the four files once more, all passing.

Rows 9 and 10 of `probe.test.mjs` pass against the scaffold, so their breakage is the only way they are seen to fail. Where a row's breakage cannot be made as worded (the code is built otherwise), make the nearest change that does what the words mean, and say what you made.

## What done is

- Every row has been tried, and the worktree is as you found it.
- The four files pass at the end.

## What to send back

A table, one line for each row: the file and the test's number; the breakage as you made it, in a line; whether the test failed, with the first line of its failure; which other tests of its file failed under it.

Then, apart, every test that still passed under its breakage, with what you think lets it pass. That list is the point of the task. Change no test: a test that is too weak is the lead's to send back.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

## Two sayings

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
