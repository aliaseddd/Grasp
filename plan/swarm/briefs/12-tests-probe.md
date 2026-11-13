# Brief: `12-tests-probe`

You are one agent of a swarm that builds slice 1 of Grasp, a SysML v2 design canvas, from a scaffold: the design is written already, as contract comments in skeleton files and as `plan/swarm/step-12.md`. You have this brief and the files it names, and nothing else; you can do the task from them without asking anything. You work in a git worktree that the lead made for you. Its root is the repository's root, and every path below is from there.

## The goal, and why

Write `canvas/app/test/probe.test.mjs`: the sixteen tests of the table "`canvas/app/test/probe.test.mjs` (Node)" in section 4 of `plan/swarm/step-12.md`. They test `canvas/app/src/core/probe.ts`, which finds out what this browser lets the page do, one line for each question, for the About panel. Every question is asked through a `ProbeEnv`; your tests hand in stand-ins for it, so they need no browser.

The tests are written before the code they check, by somebody who does not see the code, and each is seen to fail for the reason the list gives. An implementer fills in the skeleton at the same time or after you, from the same contract and without seeing how you wrote your tests; a third agent later breaks the built code in the way each row names and looks whether your test notices. So write each test to the row: its exact name as the string given to `test()`, its steps, everything it asserts, and failure messages that say what the page or the store lacks in its own terms.

## Read, in this order

1. `plan/swarm/step-12.md`: section 1, the list under "About" (items 9 to 14); section 3, "The About panel" (the table of the lines, their labels and their words) and "What a test takes away or stands in for"; section 4, the introduction, and the part for your file: `envOf`, `settle`, and the table.
2. `canvas/app/src/core/probe.ts`, whole: its comments are the contract. `SAID`, the sentence functions, `WASM_LOOP` and `jsLoop` are final already.
3. `canvas/app/test/core.mjs`, whole: `loadWith`.
4. `canvas/app/test/viewStore.test.mjs`, its first 80 lines: how a Node test of a store of this application is laid out.

## The files you own

`canvas/app/test/probe.test.mjs`, which you create. Nothing else.

## The tests and the commands

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/; a browser test opens the built page, so build before you run one
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Do not run `npm test`, the whole suite: other agents share this machine, and the lead runs it alone. A timed test is judged by the lead alone: a time taken while other agents work proves nothing. If a timed test fails beside your work, say so in what you send back and go on. `canvas/dist/` is built to run the tests and is not handed over: the lead builds it.

Your file: `node --test --test-timeout=120000 canvas/app/test/probe.test.mjs`. It needs no build and no browser. Three tests run the real loop of 50 million steps, some tenths of a second each.

Against the scaffold `createProbe` and `browserOf` throw. Tests 9 and 10 pass against the scaffold, as their rows say, since what they test is final; say so in what you send back. Every other test must fail with the first line its row gives: `createProbe: step 12 builds it`, and for test 4 `browserOf: step 12 builds it`.

No test calls `browserEnv()`: it needs a window, and `about.test.mjs` is where it is seen.

You may write a throwaway `createProbe` outside the repository to see that your tests can pass against the contract. Keep it out of the worktree, and take no expected value from it.

## What done is

- The file holds one `describe` with the sixteen tests, each under the exact name of its row, none skipped and none marked todo.
- Fourteen fail against the scaffold with the first line their row gives; tests 9 and 10 pass.
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
