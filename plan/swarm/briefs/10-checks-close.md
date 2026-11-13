# 10-checks-close: closing step 10 (the lead's)

You are one agent of a swarm that builds step 10 of slice 1 of Grasp, a SysML v2 design canvas: the Details panel of the new page. This brief is all you are given. It and the files it names are enough to do the task; where they are not, that is a reason to stop and say so.

## The goal, and why

Close step 10: take the step's files into the main tree, run the checks alone, take the todo mark off the keystroke's scale test, and commit the step.

This is the lead's own task, the closing every step ends with (`plan/swarm/README.md`, "How the lead runs the swarm", 7). After it, all ten checks of `plan/status.json` read "pass" and the runner's `# todo` is 0.

## Where to read, in this order

1. `plan/swarm/README.md` and `plan/swarm/shared.md`, section 8.
2. `plan/swarm/step-10.md`, whole, and what each of the step's tasks sent back: the test writers' first lines, the builders' decisions, `10-checks-break`'s table, `10-review-code`'s defects.
3. `plan/slice-1.md`, step 10 and section 10.

## The files you own

- `canvas/app/test/scale.test.mjs`: the todo mark of `a keystroke in a name takes under 50 ms at 5,000 elements` comes off, and nothing else in the file changes.
- `plan/status.json`, `plan/notes.md`, and `canvas/dist/` as built.

## The tests and the commands

Run from the root of your worktree, which the lead made for you from the commit your task starts at:

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/, the page the browser tests open from file://
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Build before every run of a browser test: the tests open `canvas/dist/index.html`, not the sources. `canvas/dist/` is yours to build and not to hand over: the lead builds it. Do not run the whole suite (`npm test`): other agents share this machine. A timed test (one that measures milliseconds in the page) is judged by the lead alone, with nothing else running: if one fails for you beside other work, send back its numbers and conclude nothing from them.

In this order, with no agent running once anything is timed:

1. Every owned file of the step's tasks is in the main tree, and no other file of theirs.
2. What `10-review-code` and `10-checks-break` found is settled: a defect fixed by a task sent back (at high effort) or by your own hand when the fix is smaller than its brief, each with a test seen to fail first; a weak test strengthened and seen to fail under its breakage.
3. `npm run build`, `npm run check`.
4. The two timed breakages, alone: 20 ms of busy work in the name's `onChange` must fail `instant.test.mjs`'s `a keystroke in a name of the example takes under 16 ms` and no other test of the file; `formOf` asking each picker's options outside `lib.reading` must fail `a keystroke in a name takes under 50 ms at 5,000 elements`.
5. The todo mark off that test in `scale.test.mjs`.
6. `npm test`, three runs in a row: `# fail 0`, `# todo 0`. The keystroke's medians at 5,000 elements (the one that opens a step, the ones that join it) and on the example, from each run, go into the notes with their commands. A limit that does not hold is not loosened: the test keeps its todo mark, the numbers and where the time goes come to Damon, and the steps that do not depend on it go on (`plan/slice-1.md`, section 7, item 4).
7. `plan/status.json`: `step` 10, check 9 `"pass"`.
8. `plan/notes.md`, the session's entry for the step: the times; what was built otherwise than `step-10.md` says, with the reason; what the review found and what was done; the method's log (each task's time, rework and whose fault).
9. One commit with the sources, the tests, `canvas/dist/`, `plan/status.json` and the notes, pushed. Checked out by itself it passes `npm ci && npm run check && npm test` (criterion 7).

Three things this step's scaffold left for you to decide, each said in the scaffold instance's report: whether Ctrl + Z should act while a checkbox or a radio button has the focus (`shell/TopBar.tsx` counts every `<input>` as a text field); whether the id maker of a new typing moves into the core for step 11; and whether the helpers the two browser test files share move into `helpers.mjs`.

## What to send back

Nothing is sent back: the commit and the notes are the result.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
