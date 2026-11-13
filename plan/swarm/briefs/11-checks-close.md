# 11-checks-close: close step 11 (the lead's)

## The goal, and why

Every task of step 11 is done and step 10 is closed. This task is the lead's own: it sees the step whole and green, by itself and after the steps before it, and commits it, so that a session cut short loses no more than the step in hand (criterion 7 of `plan/slice-1.md`, section 10).

## Where to read

`plan/swarm/README.md`, "How the lead runs the swarm", item 7; `plan/swarm/shared.md`, section 8; `plan/swarm/step-11.md`; `plan/slice-1.md`, step 11's "Done when" and section 10.

## What to do, in this order, with no agent running

1. Every owned file of the step's tasks is in the main tree, and no other change is: `git status --short`.
2. `npm ci`, `npm run build`, `npm run check`.
3. `npm test`, three runs in a row (the suite holds timed tests): `# fail 0`, and `# todo 0`, which is what `plan/status.json` says after step 10.
4. The step's "Done when", test by test: `tools.test.mjs` passes, with its tests 1 to 4 (every tool of each graph view kind), 5 (the port on the ground), 6 (the specialization) and 7 (Escape) under those names. `commands.test.mjs`, `tools-panel.test.mjs` and `palette.test.mjs` pass.
5. What must go on holding: `selection.test.mjs` (with no tool in hand a click picks as step 9 built it), `scale.test.mjs` and `instant.test.mjs` (a plane that reads the tools renders no more on a pan or a drag step), `open.test.mjs` (criterion 2).
6. `11-checks-break`'s report: no test still passed with its breakage in, or each that did is mended first.
7. `11-review-code`'s findings: each serious one fixed, with a test seen to fail first; each small one fixed or noted.
8. `npm run shots -- palette`; `11-review-shot-palette` marks all eight items present.
9. A file saved by the page after a tool made something is accepted by `canvas/check.sh` (a probe: the example, a part def placed and a specialization drawn, Save).
10. `plan/status.json`: `step` 11. `plan/swarm/tasks.json`: the step's tasks `done`.
11. `plan/notes.md`, the session's entry: what cannot be read from the plan or the code. For this step: that three tools always add one line to `M.validate` and the tests ask for exactly it; each thing the builders decided where the contract was silent; each rework and whose fault it was; the times.
12. One commit: the sources, the tests, `canvas/dist/`, `canvas/app/shots/palette.png`, `plan/status.json`, `plan/notes.md`. Pushed.

## The commands

```sh
npm ci && npm run build && npm run check && npm test
npm run shots -- palette
```

"Done" is: the commit is pushed, and checked out by itself it passes `npm ci && npm run check && npm test` with `# fail 0` and `# todo 0`.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are rules of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
