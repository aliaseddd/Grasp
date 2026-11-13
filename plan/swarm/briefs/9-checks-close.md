# 9-checks-close: the lead closes step 9

## The goal, and why

This task is the lead's own (`plan/swarm/README.md`, "How the lead runs the swarm", point 7). Step 9 is closed when its "Done when" and the criteria of `plan/slice-1.md`, section 10, both hold at one commit that passes by itself. It comes after `8-checks-close`: step 9's "Done when" asks that step 8's three scale tests still pass, and criterion 7 asks that the commits come in step order.

## Where to read, in this order

1. `plan/slice-1.md`, step 9 and section 10; `plan/swarm/README.md`, point 7; `plan/swarm/shared.md`, section 8.
2. `plan/swarm/step-9.md`, whole, and what `9-checks-break` and `9-review-code` sent back.

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

Nothing else runs on the machine while a timed test is judged.

1. Every file the step's tasks own is in the main tree, and no other file of theirs. Every defect of `9-review-code` and every test that `9-checks-break` saw pass under its breakage is settled: fixed with a test seen to fail first, or written into the notes as known and kept, with the reason.
2. `npm run build`, `npm run check`.
3. `npm test`, three times in a row: `# fail 0` each time, and `# todo 1` (check 9, the keystroke, is step 10's).
4. Alone, three times each: `node --test --test-timeout=120000 canvas/app/test/scale.test.mjs` and `canvas/app/test/instant.test.mjs`. Step 8's three scale tests pass each time; the opening of the 5,000-element model is under 5 s (it was about 0.56 s before the Explorer drew a tree, and 0.6 to 0.9 s with it in the probe); "the example is drawn within 1 s" holds. The medians go into the notes.
5. Step 9 takes no screenshot. `npm run shots` is not run for it.
6. `plan/status.json`: `"step": 9`; the checks are as step 8 left them, one still `"todo"`.
7. `plan/notes.md`, the session's entry: what was built otherwise than `plan/swarm/step-9.md` says, each rework and whose fault it was, the times of point 4 with their commands, what the review found and what was done, and what is known and kept.
8. One commit: the sources, the tests, `canvas/dist/` as built, `plan/status.json`, the notes. Checked out by itself it passes `npm ci && npm run check && npm test` with `# fail 0` and `# todo 1`. Pushed.

Done is: that commit, pushed.

## What to send back

Nothing: the lead does this task itself. Its record is the commit and the session's entry in `plan/notes.md`.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings that are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
