# Brief: `12-tests-checks`

You are one agent of a swarm that builds slice 1 of Grasp, a SysML v2 design canvas, from a scaffold: the design is written already, as contract comments in skeleton files and as `plan/swarm/step-12.md`. You have this brief and the files it names, and nothing else; you can do the task from them without asking anything. You work in a git worktree that the lead made for you. Its root is the repository's root, and every path below is from there.

## The goal, and why

Write `canvas/app/test/checks.test.mjs`: the thirteen tests of the table "`canvas/app/test/checks.test.mjs` (Node)" in section 4 of `plan/swarm/step-12.md`. They test `canvas/app/src/core/checks.ts`, which keeps what the model library finds wrong with the open file's model, and decides when the checks run: only while somebody listens, 0.8 s after the last change, and at once after an undo or a redo.

The tests are written before the code they check, by somebody who does not see the code, and each is seen to fail for the reason the list gives. An implementer fills in the skeleton at the same time or after you, from the same contract and without seeing how you wrote your tests; a third agent later breaks the built code in the way each row names and looks whether your test notices. So write each test to the row: its exact name as the string given to `test()`, its steps, everything it asserts, and failure messages that say what the page or the store lacks in its own terms.

## Read, in this order

1. `plan/swarm/step-12.md`: section 1, the list under "Validation" (items 1 to 8) and "What a check costs"; section 3, "What a test takes away or stands in for" (the timer and the counted library, in Node); section 4, the introduction and the table for your file. The two sentences TWINS and RULE are given there: copy them, with their middle dots (U+00B7).
2. `canvas/app/src/core/checks.ts`, whole: its comment is the contract.
3. `canvas/app/test/core.mjs`, whole: `loadWith`, `lib`, `EXAMPLE`, `readText`, `plain`, `clock`. The model library runs in another realm, so compare what it made as JSON (`plain`).
4. `canvas/app/src/core/history.ts`, the interfaces `Told` and `History` (lines 76 to 180), and `canvas/app/src/core/session.ts`, the interface `Session` and `SessionOptions`: what `history.edit`, `endEdit`, `undo`, `redo` and the option `mistake` do.
5. `canvas/app/test/viewStore.test.mjs`, its first 80 lines: how a Node test of a store of this application is laid out.

## The files you own

`canvas/app/test/checks.test.mjs`, which you create. Nothing else.

## The tests and the commands

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/; a browser test opens the built page, so build before you run one
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Do not run `npm test`, the whole suite: other agents share this machine, and the lead runs it alone. A timed test is judged by the lead alone: a time taken while other agents work proves nothing. If a timed test fails beside your work, say so in what you send back and go on. `canvas/dist/` is built to run the tests and is not handed over: the lead builds it.

Your file: `node --test --test-timeout=120000 canvas/app/test/checks.test.mjs`. It needs no build and no browser.

Against the scaffold `checksOf`, `aboutProblem` and `aboutDiagnostic` throw, so every test fails. The first line of each failure must be the one the table gives: `checksOf: step 12 builds it`, and for test 11 `aboutProblem: step 12 builds it`. Arrange each test so that the call the row names is the first that can throw.

You may write a throwaway `checksOf` outside the repository to see that your tests can pass against the contract. Keep it out of the worktree, and take no expected value from it: the expected values are in the list.

## What done is

- The file holds one `describe` with the thirteen tests, each under the exact name of its row, none skipped and none marked todo.
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
