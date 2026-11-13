# Brief: `12-checks-close`

This task is the lead's own: the closing of step 12, as `plan/swarm/README.md`, "How the lead runs the swarm", item 7, gives it for every step. Step 12 is also the last step that the success criteria of `plan/slice-1.md`, section 10, cover, so its closing carries the last checks of criteria 1, 3, 4, 5 and 6. Criterion 7's run of all eight step commits and criterion 8's five questions come after this commit and are step 13's (`plan/swarm/step-13.md`).

## The goal, and why

One commit that ends step 12, pushed: the step's sources and tests as the swarm built them, `canvas/dist/` as the sources build it, the screenshots, `plan/status.json` naming step 12, and the session's entry in `plan/notes.md`. It is committed only when every check below holds, because after it the slice's criteria are judged on this commit.

## Read, in this order

1. `plan/swarm/README.md`, "How the lead runs the swarm".
2. `plan/slice-1.md`, section 5, step 12, and section 10, criteria 1, 3, 4, 5 and 6 with "How the criteria meet the steps as written".
3. `plan/swarm/step-12.md`, sections 5 and 7.
4. What came back from every other task of step 12: the four test writers, the five implementers, `12-checks-break`, `12-review-code`.

## The files you own

`canvas/app/shots/about.png`, `canvas/app/shots/shell.png`, `canvas/app/shots/example.png`, `canvas/app/test/shots/about.mjs` (only to take `pending: true` off), `canvas/dist/`, `plan/status.json`, `plan/notes.md`.

## The tests and the commands

Nothing else runs on the machine while any of this is timed.

1. **What the other tasks found is settled first.** Every test that still passed under its breakage (`12-checks-break`) is made to fail for its reason, or its row is corrected in `plan/swarm/step-12.md` with the reason in the notes. Every defect of `12-review-code` is fixed with a test seen to fail first, or is written into the notes as known and kept, with why.
2. **Build and check.** `npm run build`, then `npm run check`: exit 0.
3. **The suite, three runs in a row.** `npm test`, three times. Each run: `# fail 0` and `# todo 0` (criterion 1).
4. **Criterion 5, in each of the three runs**, from the lines the timed tests of `canvas/app/test/scale.test.mjs` print: "a 5,000-element model opens" in under 5 s; "a drag step takes under 16 ms at 5,000 elements in 3 views"; "a pan step of a fitted view takes under 16 ms at 5,000 elements", for each of the three views; "a keystroke in a name takes under 50 ms at 5,000 elements". Each by its median. Write the three runs' medians into the notes. A limit that does not hold is not passed by loosening its test: it stops the step, and goes to Damon with its numbers and where the time goes.
5. **Criterion 6, whole, in the same three runs**, from `canvas/app/test/instant.test.mjs`: the page ready in under 500 ms; the example drawn within 1 s of the file being given; a drag step of the example under 16 ms and a keystroke in a name under 16 ms, each by the median of 9 samples; a switch between the two tabs of the interconnection fixture under 100 ms. Write the medians into the notes.
6. **Criterion 2 still holds**: `open.test.mjs`, "the example and the nine fixtures each open: 17 tabs, 11 planes, 6 cards, nothing logged", passes in the three runs.
7. **Criterion 1's names.** Every test that steps 5 to 12 of the plan name exists under that name. For step 12: in `validation.test.mjs`, "the example has no entry, and the panel says so", "two part defs given one name are listed 0.8 s after the change, under Grasp's problems and under the specification's rules in SysON's words, and both entries go with Undo" and "a click selects what an entry is about"; in `about.test.mjs`, "each line reports what this Chromium does, with GitHub's answer stubbed" and "with the pickers taken away, the panel says so and Open falls back to the file input".
8. **The screenshots.** Take `pending: true` off `canvas/app/test/shots/about.mjs`. `npm run shots`: all six are written, `shell.png` and `example.png` retaken among them.
9. **Criterion 3, `about.png`.** `12-review-shot-about`, a fresh agent with the image and its brief and nothing else: every one of its eleven items present. An item that is absent goes back as a fix (to an implementer at high effort, or by your own hand when it is smaller than a brief), the image is retaken, and a fresh reviewer looks again.
10. **Criterion 4, `shell.png` and `example.png` as retaken.** `12-review-shot-shell` and `12-review-shot-example`, a fresh agent each: every item of each list present (seven and eight), and each of the eight scores 4 or more. A score under 4 is handled as sessions 19 to 21 handled theirs: what the reviewer names and the page may change is changed, the image is retaken and rated by a fresh reviewer, and what asks for design the plan does not have is Damon's.
11. **`plan/status.json`**: `"step": 12`, and all ten checks `"pass"` (the last todo mark went at step 10; the runner's `# todo 0` is the cross-check).
12. **`plan/notes.md`**, the session's entry for step 12 (criterion 8): each measurement with its command (the three runs' medians; what a check costs at 5,000 elements, from `plan/swarm/step-12.md`, section 1, measured again in the page if the review asked); each file built otherwise than the plan names, with its reason (`core/checks.ts`, `checks.test.mjs` and `probe.test.mjs`, which the plan does not list; `build.mjs` defining the libraries; `core/index.ts`); each thing tried and dropped (`step-12.md`, section 6, and what the swarm added); the reviewers' marks and scores; the swarm's log for the step (times, rework and whose fault).
13. **The commit**, one, pushed: the step's sources and tests, `canvas/dist/`, the three images, `plan/status.json`, `plan/notes.md`. Checked out by itself into a new worktree, it passes `npm ci && npm run check && npm test` with `# fail 0` and `# todo 0` (criterion 7, for this step).

## What done is

Every item above holds, and the commit is pushed. Then step 13 begins.

## What to send back

Nothing to another agent: the result is the commit and the notes. To Damon, one line at the change of stage, and at once anything that stops the step: a limit of criterion 5 or 6 that does not hold, or a score that asks for design the plan does not have.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

## Two sayings

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
