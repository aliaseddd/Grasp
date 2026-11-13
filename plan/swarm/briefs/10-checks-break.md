# 10-checks-break: each test seen to fail with its thing broken

You are one agent of a swarm that builds step 10 of slice 1 of Grasp, a SysML v2 design canvas: the Details panel of the new page. This brief is all you are given. It and the files it names are enough to do the task; where they are not, that is a reason to stop and say so.

## The goal, and why

For each test of step 10, make the breakage its row names in the built code, see the test fail, and put the code back. Send back every test that still passed.

A test that was seen to fail only before its code existed has not been seen to fail for the thing it claims: it failed then for want of the whole panel. Session 19 of `plan/notes.md` found two tests that could not fail for what they were named for. So each test is run once more against code that is wrong in exactly the way the test is there to catch.

## Where to read, in this order

1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `plan/swarm/step-10.md`, section 4: the four tables. The last column of each row is the breakage, in words; where it says which other tests the breakage fails too, those are expected.
3. `canvas/app/src/panels/fieldHooks.ts`, `canvas/app/src/panels/Details.tsx`, `canvas/app/src/panels/details.css`, `canvas/app/src/shell/Dock.tsx`, as built: where the breakages are made.
4. `plan/notes.md`, session 20, "Step 6: the planes' and the store's tests, each seen to fail with its thing broken": what such a pass reports, and how a breakage that fails nothing is told.

## The files you own

Nothing. You change the built code to break it and put every change back: your worktree ends as it began (`git status` shows nothing but `canvas/dist/`, which you rebuild from the clean sources at the end).

## The tests and the commands

Run from the root of your worktree, which the lead made for you from the commit your task starts at:

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/, the page the browser tests open from file://
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Build before every run of a browser test: the tests open `canvas/dist/index.html`, not the sources. `canvas/dist/` is yours to build and not to hand over: the lead builds it. Do not run the whole suite (`npm test`): other agents share this machine. A timed test (one that measures milliseconds in the page) is judged by the lead alone, with nothing else running: if one fails for you beside other work, send back its numbers and conclude nothing from them.

For each row, in this order: make the one change; `npm run build` when the test is a browser test; run the row's test alone; note the first line of its failure, or that it passed; `git checkout -- canvas/app/src` to put the code back.

```sh
node --test --test-timeout=120000 --test-name-pattern="<the test's name>" canvas/app/test/<file>
```

- `fieldHooks.test.mjs`, 15 rows: no build is needed. Test 15 passes against the scaffold by design, so its breakage is the only way it is seen to fail.
- `details.test.mjs`, 9 rows, and `details-fields.test.mjs`, 20 rows: build after each change.
- The two timed rows (`instant.test.mjs`'s keystroke and `scale.test.mjs`'s) are not yours: the lead checks them alone, since a timing taken beside other work proves nothing.

Make each breakage the smallest change that does what the row's words say. Where the words can be read two ways, make the one that a careless builder would most plausibly have made, and say which. A breakage that cannot be made as worded (the code is not built that way) is reported as such, with what the code does instead.

Done is: a table of 44 rows, each with the change you made (file and line) and the first line of the failure, or "passed".

## What to send back

- The table.
- Every test that still passed under its breakage, first, with your reading of why: the test is weak, or the breakage does not break what the test checks.
- Anything you noticed in the built code while breaking it that looks wrong. Do not fix it.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
