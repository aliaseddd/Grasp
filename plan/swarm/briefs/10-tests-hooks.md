# 10-tests-hooks: the Node tests of the fields

You are one agent of a swarm that builds step 10 of slice 1 of Grasp, a SysML v2 design canvas: the Details panel of the new page. This brief is all you are given. It and the files it names are enough to do the task; where they are not, that is a reason to stop and say so.

## The goal, and why

Write `canvas/app/test/fieldHooks.test.mjs`: the fifteen tests of the table "`canvas/app/test/fieldHooks.test.mjs`, in Node" in `plan/swarm/step-10.md`, section 4, each under the exact name the table gives.

They test `canvas/app/src/panels/fieldHooks.ts`, the part of Details that needs no browser: what the panel shows for an element, a line or a view (the form), what a change to a field writes and says, and the hooks. Today that file is a skeleton whose functions throw `"<name>: step 10 builds it"`. Another agent fills it in, without seeing your work, until your tests pass. So the tests are written first and seen to fail, each for the reason the table gives, and what the two of you must agree on is in `step-10.md`, not in each other's files.

## Where to read, in this order

1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `plan/swarm/step-10.md`: section 1 (what the step is), section 3 ("The words the page says", "The words of each change", "The numbers"), section 4's first table, and the appendix. This is your test list.
3. `canvas/app/src/panels/fieldHooks.ts`, whole: every exported name, and the comments of `FIELD_HOOKS`, `formOf`, `viewKindFor`, `optionsOf`, `readText`, `changeField` and `endTyping`. The comments are the contract.
4. `canvas/app/test/core.mjs`, whole: `loadWith`, `lib`, `stateFiles`, `readJSON`, `plain`, `clock`, and its header on the two realms.
5. `canvas/app/test/viewStore.test.mjs`, its first 80 lines: how a Node test of the application opens a session and reads it.
6. `canvas/app/src/core/history.ts`, the interfaces `History`, `Step` and `LogEntry`; `canvas/app/src/core/session.ts`, `openSession` and `Session`.
7. `canvas/src/details/lib.js` (`detailsOf`, `firstGeneral`, `generals`) and `canvas/src/core/lib/model.js`, lines 220 to 248 (the rows of `FIELDS`, and what a row may say) and `describe`, `describeRel`, `describeView`, `typingOf`: the library your tests work the expected values out with. `canvas/test/scale-model.mjs` for test 14 (`scaleState`, `middleService`).

## The files you own

- `canvas/app/test/fieldHooks.test.mjs` (new).

## The tests and the commands

Run from the root of your worktree, which the lead made for you from the commit your task starts at:

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/, the page the browser tests open from file://
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Build before every run of a browser test: the tests open `canvas/dist/index.html`, not the sources. `canvas/dist/` is yours to build and not to hand over: the lead builds it. Do not run the whole suite (`npm test`): other agents share this machine. A timed test (one that measures milliseconds in the page) is judged by the lead alone, with nothing else running: if one fails for you beside other work, send back its numbers and conclude nothing from them.

```sh
node --test --test-timeout=120000 canvas/app/test/fieldHooks.test.mjs
```

No build is needed: the file runs in Node. Against your worktree, where `fieldHooks.ts` is the skeleton, tests 1 to 14 must fail, each with the first line its row gives under "Fails before" (`formOf: step 10 builds it`, `changeField: step 10 builds it`, `readText: step 10 builds it`, `optionsOf: step 10 builds it`), and test 15 must pass, since the tables it reads are final. A test that fails with another first line is wrong: order its steps so that the function the row names is the first one called.

What the table does not spell out is yours to settle from the contract, and to list in what you send back. Three things to keep to:

- Open a session with `app.openSession(lib, readJSON(file), { name }, { now: clock(), mistake: (error) => mistakes.push(error) })`, and end every test by asserting that `mistakes` is empty.
- What the model library makes belongs to another realm: compare it as JSON or through `plain()`, never with `deepEqual` directly.
- Work every expected value out from the library and from `step-10.md`, never from `fieldHooks.ts`'s own exports, except the constants the table names (`ORDER_LOCKED`, `FIELD_LOOKS`, `GROUP_ORDER`, `fieldKey`). Test 1 restates the layout's rules in the test.

Done is: the file exists, `node --test` runs it to the end, tests 1 to 14 fail for their listed reason and test 15 passes.

## What to send back

- The first line of each test's failure, test by test, as the runner printed it.
- Each thing the list did not settle and you did, one line each.
- Anything in the list, in `fieldHooks.ts`'s comments or in `core.mjs` that you found wrong or could not test as written, with the file and line.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
