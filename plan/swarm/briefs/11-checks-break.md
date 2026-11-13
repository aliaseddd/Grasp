# 11-checks-break: see each test of step 11 fail with its thing broken

## The goal, and why

Step 11 of slice 1 is built: the Tools view, the palette and the toasts. Its tests were seen to fail before the code existed, for want of the whole of it. That does not show that each test can fail for the one thing it claims to guard (`plan/notes.md`, session 19: "a test seen to fail for want of the whole shell has not been seen to fail for each thing it claims"). You show it: for each test, you make the one small breakage its row names in the built code, run the test, see it fail, and put the code back.

You change no file for good. What you hand back is a report.

## Where to read, in this order

1. `plan/swarm/README.md`.
2. `plan/swarm/step-11.md`, section 4: the four tables. Each row's last column, "Breakage", is the change to make for that row's test.
3. The files the breakages are made in: `canvas/app/src/core/commands.ts`, `panels/Tools.tsx`, `shell/Toasts.tsx`, `plane/Plane.tsx`, `plane/Palette.tsx`, `plane/palette.css`.

## The files you own

None. Every change you make is taken back before the next (`git checkout -- <file>`), and `git status --short` is empty when you finish.

## What to do

For each row of the four tables (26, 11, 14 and 12 rows):

1. Make the row's breakage, as small as it can be: one condition turned, one line left out. Where the row's words leave the place open, choose the smallest change that does what they say, and note it.
2. `npm run build` (for a browser test), then run that one test: `node --test --test-timeout=120000 --test-name-pattern="<the test's name>" canvas/app/test/<file>`.
3. Note whether it failed, and the first line of its failure.
4. Run the whole file once with the breakage in, and note which other tests failed: the fewer the better, and a breakage under which half the file fails was too large.
5. `git checkout -- canvas/app/src`, and go on.

At the end, `npm run build` and `npm run check` with nothing broken, and the four files once more: all pass.

## The commands

Run these from the root of your worktree, which the lead made for you from a commit that holds everything your task needs:

```sh
npm ci                # once; node_modules/ from package-lock.json
npm run build         # canvas/app/ -> canvas/dist/, which the browser tests open
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/<file>
```

Build before every run of a browser test: the test opens `canvas/dist/index.html`. Do not run `npm test`: other agents share this machine, and the whole suite is the lead's to run. No test of this step is a timed test; if one of the suite's timed tests (`scale.test.mjs`, `instant.test.mjs`) fails beside your work, say so and do not judge it: a timing is valid only when the lead takes it with nothing else running. Do not commit `canvas/dist/`; the lead builds it.

## What to send back

- A table: each test, the breakage as you made it (file and line), whether the test failed, the first line of its failure, and which other tests of its file failed with it.
- **Every test that still passed with its breakage in.** That is the finding this task exists for: say what the test asserts and why the breakage slips past it.
- Each breakage you could not make as the row says, and why.

"Done" is: every row was tried; the tree is as you found it; the four files pass.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are rules of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
