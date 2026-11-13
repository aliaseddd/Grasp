# Brief: `12-impl-checks`

You are one agent of a swarm that builds slice 1 of Grasp, a SysML v2 design canvas, from a scaffold: the design is written already, as contract comments in skeleton files and as `plan/swarm/step-12.md`. You have this brief and the files it names, and nothing else; you can do the task from them without asking anything. You work in a git worktree that the lead made for you. Its root is the repository's root, and every path below is from there.

## The goal, and why

Fill in `canvas/app/src/core/checks.ts`: `checksOf`, `aboutProblem` and `aboutDiagnostic`, whose bodies throw today. The file keeps, for the open file, what the model library finds wrong with its model, in two lists, and decides when the checks run. The Validation panel, which another agent builds from the same contract, shows the lists.

Why it is a file of its own, outside React: a check of a 5,000-element model takes about 40 ms, which is most of what a keystroke may take there. So the checks must run only while somebody looks at their result, never inside the event that made a change, and those rules are tested in Node with a stand-in for the timer.

## Read, in this order

1. `canvas/app/src/core/checks.ts`, whole: its comments are the contract. The types, `PAUSE` and the declaration of the library's `validate`, `validateSpec` and `SPEC_RULES` are final.
2. `plan/swarm/step-12.md`: section 1, the list under "Validation" (items 1 to 8) and "What a check costs"; section 3, "What a test takes away or stands in for" (the timer and the counted library, in Node).
3. `canvas/app/src/core/history.ts`, the interfaces `Told` and `History` (lines 76 to 180): what a listener of the history is told. `canvas/app/src/core/session.ts`, the interface `Session`.
4. `canvas/app/src/core/selection.ts`: the type `Picked`, and how a session's store is kept "by the session object itself, weakly".
5. `canvas/app/src/plane/viewStore.ts`, lines 1 to 60 and wherever `viewStoresOf` keeps a session's stores: the same pattern, built.
6. `canvas/app/test/checks.test.mjs`: the tests you are to make pass.
7. For the sense of it, the old page's `check()` and `checkNow()` at the end of `canvas/src/core/page/render.js`, and `changed()` in `canvas/src/core/page/changes.js`. Change nothing there.

## The files you own

`canvas/app/src/core/checks.ts`. Nothing else: `canvas/app/src/core/index.ts` exports it already.

## The tests and the commands

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/; a browser test opens the built page, so build before you run one
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Do not run `npm test`, the whole suite: other agents share this machine, and the lead runs it alone. A timed test is judged by the lead alone: a time taken while other agents work proves nothing. If a timed test fails beside your work, say so in what you send back and go on. `canvas/dist/` is built to run the tests and is not handed over: the lead builds it.

Your tests: `node --test --test-timeout=120000 canvas/app/test/checks.test.mjs`, thirteen tests, in Node; they need no build.

The checks read the model through the library, `session.lib`, in one reading (`lib.reading(model, ...)`), and never write it. Use `setTimeout` and `clearTimeout` only as the default of `options.later`.

## What done is

- The thirteen tests of `checks.test.mjs` pass.
- `npm run build` and then `npm run check` pass.
- Only `canvas/app/src/core/checks.ts` differs from what you were given.

## What to send back

Your last message is read by the lead, who has read your diff first. Keep it to what the diff does not say:

1. The tests you ran and what each file reported (how many passed).
2. Each thing the contract left open that you settled, one line each, with what you chose and why.
3. Anything in a contract, a signature or a test that you found wrong, with the evidence (file and line, or what you ran). Stop on what depends on it, say so, and finish the rest.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

## Two sayings

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
