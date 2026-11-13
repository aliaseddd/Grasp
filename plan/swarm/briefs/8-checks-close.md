# 8-checks-close: step 8 closed

This task is the lead's own.

## The goal, and why

Every step of `plan/slice-1.md` ends on one pushed commit that passes by itself, so that a session cut short loses at most the step in hand (section 10, criterion 7). This task makes that commit for step 8.

## Read first

`plan/slice-1.md`, step 8 and sections 6 and 10. `plan/swarm/step-8.md`, sections 3, 6 and 7. `plan/swarm/shared.md`, section 8. What `8-checks-measure`, `8-checks-break`, `8-review-code` and `8-review-shot-scale` sent back.

## The files you own

`package.json`, `canvas/app/test/shots/scale.mjs` (only to take `pending: true` off), `canvas/app/shots/scale.png`, `canvas/dist/`, `plan/status.json`, `plan/notes.md`, `plan/swarm/tasks.json`.

## What to do, in this order

1. **What the reviews found.** Each defect of `8-review-code` and each test that `8-checks-break` saw pass under its breakage is fixed before the commit: by you when the fix is smaller than a brief, else by the task that owns the file, sent back at `sonnet`, `high`. Each fix has a test, seen to fail first.
2. **The test files one at a time** (`step-8.md`, change 4). In `package.json`, the `test` script becomes `node --test --test-concurrency=1 --test-timeout=120000 canvas/app/test/*.test.mjs`. Nothing else in the file changes.
3. **The checks, alone**, with no agent running: `npm run build`, `npm run check`, then `npm test` three times in a row. Each run must report `# fail 0` and `# todo 1` (the keystroke test of step 10), and in each the three scale tests must pass. Note from each run the opening time, a drag step's medians and a pan step's medians for each view.
4. **The screenshot.** Take `pending: true` off `canvas/app/test/shots/scale.mjs`, so that `npm run shots` takes this shot from now on. `8-review-shot-scale` has looked at `scale.png` before this task starts. Every item of its list must be present (criterion 3). An absent item is fixed, and whenever step 1 or such a fix changed anything the page shows, the shot is retaken (`npm run shots -- scale`) and looked at again by a fresh reviewer, who gets the brief `8-review-shot-scale.md` and the image and nothing else. The image that is committed is the one last reviewed.
5. **`plan/status.json`**: `"step": 8`, and checks 7, 8 and 10 `"pass"`. One check stays `"todo"`, as the runner's `# todo 1` says.
6. **`plan/notes.md`**, in the session's entry, what cannot be read from the plan or the code (criterion 8): the table of times of builds A to D with its command; the three runs' figures; which change was kept and which dropped, with the figures; that `npm test` now runs its files one at a time, why, and what it costs; `scale.png`'s review, item by item; each thing the reviews found and what was done; the method's log (each agent's time, the rework and whose fault it was).
7. **`plan/swarm/tasks.json`**: every task of step 8 `"done"`.
8. **One commit, pushed**: the sources, the tests, `canvas/dist/`, `canvas/app/shots/scale.png`, `package.json`, `plan/status.json`, `plan/notes.md`, `plan/swarm/tasks.json`, each added by name. Then check the commit out into a new worktree and run `npm ci && npm run check && npm test` there: `# fail 0`, `# todo 1`.

If a limit cannot be held, `8-checks-measure` says what to do: the step is still closed, with that test todo, `plan/status.json` saying so, and the measurement brought to Damon.

## What "done" is

The commit is pushed and passes by itself; `plan/status.json` names step 8 and its count of `"todo"` checks equals the runner's `# todo`.

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
