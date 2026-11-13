# Brief: `12-tests-validation`

You are one agent of a swarm that builds slice 1 of Grasp, a SysML v2 design canvas, from a scaffold: the design is written already, as contract comments in skeleton files and as `plan/swarm/step-12.md`. You have this brief and the files it names, and nothing else; you can do the task from them without asking anything. You work in a git worktree that the lead made for you. Its root is the repository's root, and every path below is from there.

## The goal, and why

Write `canvas/app/test/validation.test.mjs`: the six tests of the table "`canvas/app/test/validation.test.mjs` (the page)" in section 4 of `plan/swarm/step-12.md`. They test the Validation panel in the built page, opened from `file://`: its two lists (Grasp's own problems, and the diagnostics of the SysML v2 specification's rules), when they are worked out, and what a click on an entry picks. Three of the six are what the plan's "Done when" for step 12 names, under those very names.

The tests are written before the code they check, by somebody who does not see the code, and each is seen to fail for the reason the list gives. An implementer fills in the skeleton at the same time or after you, from the same contract and without seeing how you wrote your tests; a third agent later breaks the built code in the way each row names and looks whether your test notices. So write each test to the row: its exact name as the string given to `test()`, its steps, everything it asserts, and failure messages that say what the page or the store lacks in its own terms.

Four of your tests make a change by picking a box on a plane and typing a name into Details, which steps 9 and 10 build. In your worktree neither is built, so you see those tests fail at their first step, for want of the panel's lists, and you write the rest from the contracts.

## Read, in this order

1. `plan/swarm/shared.md`, section 6, "What the tests share": the helpers, and what every test keeps to.
2. `plan/swarm/step-12.md`: section 1, the list under "Validation" (items 1 to 8); section 3, "The Validation panel" and "What a test takes away or stands in for" (how the checks are counted in the page); section 4, the introduction, and the part for your file: its helpers, its sentences and the table. Copy the sentences with their middle dots (U+00B7).
3. `canvas/app/src/panels/Validation.tsx` and `canvas/app/src/core/checks.ts`: the contracts, as comments.
4. `canvas/app/test/helpers.mjs`, whole: `openIn`, `openPage`, `openStateFile`, `stateFileAt`, `stateFileOf`, `showSide`, `fieldIn`, `undo`, `selectBox`, `boxOf`, `untilDrawn`, `modelOf`, `EXAMPLE`, `soon`, `until`, `frame`, `FRAMES`, `BROWSER_FRAMES`, `finish`, `launch`, `closePages`.
5. `canvas/app/test/move.test.mjs`, its first 110 lines: how a browser test of this application is laid out (`before`, `after`, `afterEach`, a first test).
6. `canvas/app/src/core/selection.ts`, its comment: what a pick is. A box that is picked has the class `selected` on its node (`boxOf(...).selected`).

## The files you own

`canvas/app/test/validation.test.mjs`, which you create. Nothing else. A helper only this file needs is written in it; `helpers.mjs` is not yours.

## The tests and the commands

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/; a browser test opens the built page, so build before you run one
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Do not run `npm test`, the whole suite: other agents share this machine, and the lead runs it alone. A timed test is judged by the lead alone: a time taken while other agents work proves nothing. If a timed test fails beside your work, say so in what you send back and go on. `canvas/dist/` is built to run the tests and is not handed over: the lead builds it.

Your file: `npm run build`, then `node --test --test-timeout=120000 canvas/app/test/validation.test.mjs`.

Against the scaffold the panel says "The model's problems come in step 12.", and each test must fail with the first line its row gives. Tests 2, 3, 4 and 6 therefore wait for the lists (`untilLists`) before they pick a box or type a name.

The waits: `soon(page, check, missing, frames)`. A check that comes at once is given 10 frames; the lists after a pause are given `BROWSER_FRAMES`. Test 6 waits a second by the page's clock twice, with `until`, because what it waits for is that nothing happens; no other test waits by the clock. Test 2 holds that the first entry comes at least 790 ms after the `input` event, measured inside the page; it is not a timed test of the kind the lead judges alone, since it has no upper limit.

## What done is

- The file holds one `describe` with the six tests, each under the exact name of its row, none skipped and none marked todo, each ending with `finish(opened)`.
- Each fails against the scaffold with the first line its row gives.
- `npm run check` passes.

## What to send back

Your last message is read by the lead, who has read your file first. Keep it to what the file does not say:

1. For each test, the first line of its failure against the scaffold, beside the line the list gives. They must be the same.
2. Each thing the list or a contract left open that you settled, one line each, with what you chose.
3. Anything in the list, in a contract comment or in a helper that you found wrong, with the evidence. Stop on what depends on it, and finish the rest.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

## Two sayings

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
