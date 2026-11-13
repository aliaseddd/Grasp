# 11-tests-tools: write `tools.test.mjs`

## The goal, and why

Grasp's new page is built in steps, and step 11 of slice 1 gives it its tools: a Tools view at the side, a right-click palette on each plane, and toasts that say why a rule refused a click. You write the tests of the tools at work on the planes, and the toasts: the file the plan names for step 11, **before the code they check exists**. An implementer you never meet builds that code from the same contract, so the two of you agree only through what `plan/swarm/step-11.md` says. Your tests are how the lead sees that the code is right, so each must fail when its thing is missing or broken, and say what is missing in the page's own terms.

You write tests only. You build nothing under `canvas/app/src/`.

## Where to read, in this order

1. `plan/swarm/README.md`: what a swarm task is.
2. `plan/swarm/shared.md`, section 6, "What the tests share": the helpers and what every test keeps to.
3. `plan/swarm/step-11.md`: section 1 (what the step does), section 3 (every test id, word and number: use them exactly), and in section 4 "The fixtures", "The table of uses" and the table headed `canvas/app/test/tools.test.mjs`, which is your list.
4. `canvas/app/test/helpers.mjs` whole, `canvas/app/test/move.test.mjs` for how a test clicks and drags on a plane, and `canvas/app/test/resize.test.mjs`, lines 60 to 95, for how a test saves through the bar and reads the download.
5. `canvas/app/src/core/commands.ts`: the contract of the tools, as comments. Read `Tools` whole.

## The files you own

- `canvas/app/test/tools.test.mjs`

## What to write

One `test()` for each row of your table, **under the row's exact name**, in the row's order, inside one `describe`. A row gives what the test does, what it asserts, the first line it must fail with today ("Before") and a breakage that a later task makes to see it fail; you need the first three. Tests 1 to 4 walk the table of uses: write the uses once, as data, and one function that carries out a use and checks it. `M.validate` is asked in Node, on the model of the file the page saved (`lib.validate(lib.normalize(saved.model))`), never through the page. The Tools view and the Explorer share one strip, so show the one you read with `showSide` each time.

- A failure's message says what the page lacks, in a sentence, as the "Before" column does. Write the messages so that today's failures read as that column.
- Find what the application renders by its `data-testid`, and what a library renders by its roles and names. Wait with `soon(page, check, missing)`; never sleep for a fixed time. End every test with `finish(opened)`. The four ids inside the Tools view (`tool`, `tool-list`, `tools-view`, `tool-hint`) are not in `TESTIDS`: write them as section 3 gives them.
- A helper only this file needs is written in this file. Change nothing in `helpers.mjs` or `core.mjs`.
- Where the list leaves something open, settle it by the contract in `commands.ts` and in section 3, and say in your report what you settled.

## The tests and the commands

Run these from the root of your worktree, which the lead made for you from a commit that holds everything your task needs:

```sh
npm ci                # once; node_modules/ from package-lock.json
npm run build         # canvas/app/ -> canvas/dist/, which the browser tests open
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/tools.test.mjs
```

Build before every run of a browser test: the test opens `canvas/dist/index.html`. Do not run `npm test`: other agents share this machine, and the whole suite is the lead's to run. No test of this step is a timed test; if one of the suite's timed tests (`scale.test.mjs`, `instant.test.mjs`) fails beside your work, say so and do not judge it: a timing is valid only when the lead takes it with nothing else running. Do not commit `canvas/dist/`; the lead builds it.

Run your file against the tree as it is. Nothing of step 11 is built, so **every test must fail**, and the first line of each failure must be the one its row gives under "Before". A test that passes today, or fails with another line (a mistake in the test, a helper that throws), is not done.

"Done" is: the file holds every row's test under its name; each fails today with its row's line; `npm run check` passes.

## What to send back

- The first line of each test's failure today, test by test.
- Each test that does not fail with its row's line, and why.
- What the list left open and how you settled it.
- Anything in the contract or the list that looks wrong, with your evidence. Do not bend a test to fit it.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are rules of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
