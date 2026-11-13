# 10-tests-fields: the tests of every behaviour of a field

You are one agent of a swarm that builds step 10 of slice 1 of Grasp, a SysML v2 design canvas: the Details panel of the new page. This brief is all you are given. It and the files it names are enough to do the task; where they are not, that is a reason to stop and say so.

## The goal, and why

Write `canvas/app/test/details-fields.test.mjs`: the twenty tests of the table "`canvas/app/test/details-fields.test.mjs`, in the page" in `plan/swarm/step-10.md`, section 4, each under the exact name the table gives.

They hold the Details panel to what a person meets beyond the plain change of a field: what it says with no file and with nothing picked; which thing it shows of several; its two tabs; when a run of typing ends; what Enter, Escape and Ctrl + Z do in a field; a text that is no number; a locked field; a field that an undo takes away. Each is a behaviour the contract states in a sentence, and a behaviour with no test is one the builder may get wrong unseen. Another agent builds the panel without seeing your work.

## Where to read, in this order

1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `plan/swarm/step-10.md`, whole. Section 3 is the contract between your tests and the code: every selector, role, name, word and number you may read. Section 4 holds your test list. "What the browser's test files share" lists helpers that `canvas/app/test/helpers.mjs` already exports (`saysIn`, `shownIn`, `nothingPicked`, `untilShown`, `pickRow`, `pickBox`, `wordsOf`, `showTab`, `rowOfField`, `NO_FILE`, `NOTHING_PICKED`): import them, and do not write them again.
3. `plan/swarm/shared.md`, section 6, "What the tests share": what every test keeps to.
4. `canvas/app/test/helpers.mjs`, whole. You use `openIn`, `openPage`, `openStateFile`, `stateFileAt`, `stateFileOf`, `finish`, `closePages`, `launch`, `soon`, `frame`, `showSide`, `rowIn`, `fieldIn`, `undo`, `redo`, `selectBox`, `boxOf`, `headerOf`, `nodeOf`, `planeOf`, `viewTab`, `groundPoint`, `modelOf`, `lib`, `TEN`, `EXAMPLE`, `FIXTURES`, `TESTIDS`, `byTestId`, `BROWSER_FRAMES`.
5. `canvas/app/test/move.test.mjs`: the shape of a browser test file here (`describe`, `before`, `afterEach(() => closePages(browser))`, `after`), and how a download is waited for and read after a click on Save (its test of a port's drop).
6. `canvas/app/src/panels/Details.tsx` and `canvas/app/src/panels/fieldHooks.ts`, their comments: the contract your tests are of. `canvas/app/src/core/selection.ts`, the comment of `Selection`: what a click picks.

## The files you own

- `canvas/app/test/details-fields.test.mjs` (new).

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
node --test --test-timeout=120000 canvas/app/test/details-fields.test.mjs
```

Against your worktree Details is not built: it shows "The selection's fields come in step 10." So every test must fail today with the first line its table gives, which comes from `nothingPicked` (or, for the one test that opens no file first, from its own first assertion). That is all of a test you can see run. The rest you cannot run until Details and step 9's picking exist, so read each test once more against section 3 before you send it: every selector, role and word in it must be one the tables give. Do not guess at what the page will render beyond them; what a test needs and section 3 does not give is a reason to stop and say so.

What every test keeps to (the reasons are in `helpers.mjs` and `shared.md`): it opens the page through `openIn` or `openPage` and ends with `finish(opened)`; it finds what the application renders by the names of section 3 and never reads `window.Grasp`; a wait is `soon(page, check, missing)` with a sentence that says what the page lacks, in the page's own terms, never a fixed sleep; a failure's message says what is missing ("Details shows no Typed by field for hosts"), not what the test did.

Three of the tests reach a state that a person's click cannot reach in this slice, a change of what is picked, or an Undo, while a text field keeps the focus. They use `scripted(locator)`, which the table defines: the element's own `click()` run in the page. Use it only where the table says so; everywhere else a click is Playwright's, as a person's.

Done is: the file exists, the twenty tests run, and each fails today with the first line the table gives.

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
