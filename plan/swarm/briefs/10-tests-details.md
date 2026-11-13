# 10-tests-details: the tests that "Done when" names

You are one agent of a swarm that builds step 10 of slice 1 of Grasp, a SysML v2 design canvas: the Details panel of the new page. This brief is all you are given. It and the files it names are enough to do the task; where they are not, that is a reason to stop and say so.

## The goal, and why

Write `canvas/app/test/details.test.mjs`: the nine tests of the table "`canvas/app/test/details.test.mjs`, in the page" in `plan/swarm/step-10.md`, section 4, each under the exact name the table gives, the two groups as `describe` blocks named by the plan's own words.

They are what `plan/slice-1.md` asks of step 10: every field that every kind of element, line and view lists, changed through its widget in the page, is one undo step, undone and redone; a rename shows on the box, the tab and the row as it is typed; picking another definition moves the end of the usage's typing. Another agent builds the panel without seeing your work, so the tests are written first, and what the two of you must agree on is section 3 of `step-10.md`.

## Where to read, in this order

1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `plan/swarm/step-10.md`, whole. Section 3 is the contract between your tests and the code: every selector, role, name, word and number you may read. Section 4 holds your test list. "What the browser's test files share" lists helpers that `canvas/app/test/helpers.mjs` already exports (`saysIn`, `shownIn`, `nothingPicked`, `untilShown`, `pickRow`, `pickBox`, `wordsOf`, `showTab`, `rowOfField`, `NO_FILE`, `NOTHING_PICKED`): import them, and do not write them again.
3. `plan/swarm/shared.md`, section 6, "What the tests share": what every test keeps to.
4. `canvas/app/test/helpers.mjs`, whole. You use `openIn`, `openPage`, `openStateFile`, `stateFileAt`, `stateFileOf`, `finish`, `closePages`, `launch`, `soon`, `frame`, `showSide`, `rowIn`, `fieldIn`, `undo`, `redo`, `selectBox`, `boxOf`, `headerOf`, `nodeOf`, `planeOf`, `viewTab`, `groundPoint`, `modelOf`, `lib`, `TEN`, `EXAMPLE`, `FIXTURES`, `TESTIDS`, `byTestId`, `BROWSER_FRAMES`.
5. `canvas/app/test/move.test.mjs`: the shape of a browser test file here (`describe`, `before`, `afterEach(() => closePages(browser))`, `after`), and how a download is waited for and read after a click on Save (its test of a port's drop).
6. `canvas/app/src/panels/Details.tsx` and `canvas/app/src/panels/fieldHooks.ts`, their comments: the contract your tests are of. `canvas/app/src/core/selection.ts`, the comment of `Selection`: what a click picks.
7. `canvas/test/fields.test.mjs`, lines 31 to 103: `mergedFixtures`, which your file copies whole (reading a file under `canvas/test` is allowed; changing one is not), and lines 180 to 228, the old `changeField`, with the test `every field of every kind of element, line and view: ...` further down: the old walk, which yours repeats in the new page's terms.

## The files you own

- `canvas/app/test/details.test.mjs` (new).

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
npm run build
node --test --test-timeout=120000 canvas/app/test/details.test.mjs
```

Against your worktree Details is not built: it shows "The selection's fields come in step 10." So every test must fail today with the first line its table gives, which comes from `nothingPicked` (or, for the one test that opens no file first, from its own first assertion). That is all of a test you can see run. The rest you cannot run until Details and step 9's picking exist, so read each test once more against section 3 before you send it: every selector, role and word in it must be one the tables give. Do not guess at what the page will render beyond them; what a test needs and section 3 does not give is a reason to stop and say so.

What every test keeps to (the reasons are in `helpers.mjs` and `shared.md`): it opens the page through `openIn` or `openPage` and ends with `finish(opened)`; it finds what the application renders by the names of section 3 and never reads `window.Grasp`; a wait is `soon(page, check, missing)` with a sentence that says what the page lacks, in the page's own terms, never a fixed sleep; a failure's message says what is missing ("Details shows no Typed by field for hosts"), not what the test did.

The walk (`walk`, `changeOnce`, the save at the end) is described step by step under the table's heading; write it as one pair of functions that the five tests share. Each test of the walk must stay well under the runner's 120 s: it makes 16 to 45 changes, so avoid a hover or a fixed wait per change (`wordsOf` reads Undo's words without one).

Done is: the file exists, the nine tests run, and each fails today with the first line the table gives.

## What to send back

- The first line of each test's failure, test by test.
- Each thing the list did not settle and you did, one line each.
- Anything in section 3 or 4 of `step-10.md`, or in `helpers.mjs`, that you found wrong, missing or impossible to test as written, with the place.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
