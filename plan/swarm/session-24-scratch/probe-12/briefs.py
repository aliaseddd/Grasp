import json, os, textwrap
OUT = '../wt-12/plan/swarm'

RULES = """## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

## Two sayings

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
"""

WHERE = """You are one agent of a swarm that builds slice 1 of Grasp, a SysML v2 design canvas, from a scaffold: the design is written already, as contract comments in skeleton files and as `plan/swarm/step-12.md`. You have this brief and the files it names, and nothing else; you can do the task from them without asking anything. You work in a git worktree that the lead made for you. Its root is the repository's root, and every path below is from there."""

COMMANDS = """```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/; a browser test opens the built page, so build before you run one
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Do not run `npm test`, the whole suite: other agents share this machine, and the lead runs it alone. A timed test is judged by the lead alone: a time taken while other agents work proves nothing. If a timed test fails beside your work, say so in what you send back and go on. `canvas/dist/` is built to run the tests and is not handed over: the lead builds it."""

def brief(task, goal, read, owned, tests, done, back):
    parts = [f"# Brief: `{task}`", "", WHERE, "", "## The goal, and why", "", goal.strip(), "", "## Read, in this order", "", read.strip(), "",
             "## The files you own", "", owned.strip(), "", "## The tests and the commands", "", tests.strip(), "", "## What done is", "", done.strip(), "",
             "## What to send back", "", back.strip(), "", RULES]
    with open(os.path.join(OUT, 'briefs', task + '.md'), 'w') as f:
        f.write("\n".join(parts))

TESTS_BACK = """Your last message is read by the lead, who has read your file first. Keep it to what the file does not say:

1. For each test, the first line of its failure against the scaffold, beside the line the list gives. They must be the same.
2. Each thing the list or a contract left open that you settled, one line each, with what you chose.
3. Anything in the list, in a contract comment or in a helper that you found wrong, with the evidence. Stop on what depends on it, and finish the rest.
"""

TEST_WRITER_WHY = """The tests are written before the code they check, by somebody who does not see the code, and each is seen to fail for the reason the list gives. An implementer fills in the skeleton at the same time or after you, from the same contract and without seeing how you wrote your tests; a third agent later breaks the built code in the way each row names and looks whether your test notices. So write each test to the row: its exact name as the string given to `test()`, its steps, everything it asserts, and failure messages that say what the page or the store lacks in its own terms."""

# ---------------------------------------------------------------- tests
brief('12-tests-checks',
f"""Write `canvas/app/test/checks.test.mjs`: the thirteen tests of the table "`canvas/app/test/checks.test.mjs` (Node)" in section 4 of `plan/swarm/step-12.md`. They test `canvas/app/src/core/checks.ts`, which keeps what the model library finds wrong with the open file's model, and decides when the checks run: only while somebody listens, 0.8 s after the last change, and at once after an undo or a redo.

{TEST_WRITER_WHY}""",
"""1. `plan/swarm/step-12.md`: section 1, the list under "Validation" (items 1 to 8) and "What a check costs"; section 3, "What a test takes away or stands in for" (the timer and the counted library, in Node); section 4, the introduction and the table for your file. The two sentences TWINS and RULE are given there: copy them, with their middle dots (U+00B7).
2. `canvas/app/src/core/checks.ts`, whole: its comment is the contract.
3. `canvas/app/test/core.mjs`, whole: `loadWith`, `lib`, `EXAMPLE`, `readText`, `plain`, `clock`. The model library runs in another realm, so compare what it made as JSON (`plain`).
4. `canvas/app/src/core/history.ts`, the interfaces `Told` and `History` (lines 76 to 180), and `canvas/app/src/core/session.ts`, the interface `Session` and `SessionOptions`: what `history.edit`, `endEdit`, `undo`, `redo` and the option `mistake` do.
5. `canvas/app/test/viewStore.test.mjs`, its first 80 lines: how a Node test of a store of this application is laid out.""",
"""`canvas/app/test/checks.test.mjs`, which you create. Nothing else.""",
f"""{COMMANDS}

Your file: `node --test --test-timeout=120000 canvas/app/test/checks.test.mjs`. It needs no build and no browser.

Against the scaffold `checksOf`, `aboutProblem` and `aboutDiagnostic` throw, so every test fails. The first line of each failure must be the one the table gives: `checksOf: step 12 builds it`, and for test 11 `aboutProblem: step 12 builds it`. Arrange each test so that the call the row names is the first that can throw.

You may write a throwaway `checksOf` outside the repository to see that your tests can pass against the contract. Keep it out of the worktree, and take no expected value from it: the expected values are in the list.""",
"""- The file holds one `describe` with the thirteen tests, each under the exact name of its row, none skipped and none marked todo.
- Each fails against the scaffold with the first line its row gives.
- `npm run check` passes.""",
TESTS_BACK)

brief('12-tests-probe',
f"""Write `canvas/app/test/probe.test.mjs`: the sixteen tests of the table "`canvas/app/test/probe.test.mjs` (Node)" in section 4 of `plan/swarm/step-12.md`. They test `canvas/app/src/core/probe.ts`, which finds out what this browser lets the page do, one line for each question, for the About panel. Every question is asked through a `ProbeEnv`; your tests hand in stand-ins for it, so they need no browser.

{TEST_WRITER_WHY}""",
"""1. `plan/swarm/step-12.md`: section 1, the list under "About" (items 9 to 14); section 3, "The About panel" (the table of the lines, their labels and their words) and "What a test takes away or stands in for"; section 4, the introduction, and the part for your file: `envOf`, `settle`, and the table.
2. `canvas/app/src/core/probe.ts`, whole: its comments are the contract. `SAID`, the sentence functions, `WASM_LOOP` and `jsLoop` are final already.
3. `canvas/app/test/core.mjs`, whole: `loadWith`.
4. `canvas/app/test/viewStore.test.mjs`, its first 80 lines: how a Node test of a store of this application is laid out.""",
"""`canvas/app/test/probe.test.mjs`, which you create. Nothing else.""",
f"""{COMMANDS}

Your file: `node --test --test-timeout=120000 canvas/app/test/probe.test.mjs`. It needs no build and no browser. Three tests run the real loop of 50 million steps, some tenths of a second each.

Against the scaffold `createProbe` and `browserOf` throw. Tests 9 and 10 pass against the scaffold, as their rows say, since what they test is final; say so in what you send back. Every other test must fail with the first line its row gives: `createProbe: step 12 builds it`, and for test 4 `browserOf: step 12 builds it`.

No test calls `browserEnv()`: it needs a window, and `about.test.mjs` is where it is seen.

You may write a throwaway `createProbe` outside the repository to see that your tests can pass against the contract. Keep it out of the worktree, and take no expected value from it.""",
"""- The file holds one `describe` with the sixteen tests, each under the exact name of its row, none skipped and none marked todo.
- Fourteen fail against the scaffold with the first line their row gives; tests 9 and 10 pass.
- `npm run check` passes.""",
TESTS_BACK)

brief('12-tests-validation',
f"""Write `canvas/app/test/validation.test.mjs`: the six tests of the table "`canvas/app/test/validation.test.mjs` (the page)" in section 4 of `plan/swarm/step-12.md`. They test the Validation panel in the built page, opened from `file://`: its two lists (Grasp's own problems, and the diagnostics of the SysML v2 specification's rules), when they are worked out, and what a click on an entry picks. Three of the six are what the plan's "Done when" for step 12 names, under those very names.

{TEST_WRITER_WHY}

Four of your tests make a change by picking a box on a plane and typing a name into Details, which steps 9 and 10 build. In your worktree neither is built, so you see those tests fail at their first step, for want of the panel's lists, and you write the rest from the contracts.""",
"""1. `plan/swarm/shared.md`, section 6, "What the tests share": the helpers, and what every test keeps to.
2. `plan/swarm/step-12.md`: section 1, the list under "Validation" (items 1 to 8); section 3, "The Validation panel" and "What a test takes away or stands in for" (how the checks are counted in the page); section 4, the introduction, and the part for your file: its helpers, its sentences and the table. Copy the sentences with their middle dots (U+00B7).
3. `canvas/app/src/panels/Validation.tsx` and `canvas/app/src/core/checks.ts`: the contracts, as comments.
4. `canvas/app/test/helpers.mjs`, whole: `openIn`, `openPage`, `openStateFile`, `stateFileAt`, `stateFileOf`, `showSide`, `fieldIn`, `undo`, `selectBox`, `boxOf`, `untilDrawn`, `modelOf`, `EXAMPLE`, `soon`, `until`, `frame`, `FRAMES`, `BROWSER_FRAMES`, `finish`, `launch`, `closePages`.
5. `canvas/app/test/move.test.mjs`, its first 110 lines: how a browser test of this application is laid out (`before`, `after`, `afterEach`, a first test).
6. `canvas/app/src/core/selection.ts`, its comment: what a pick is. A box that is picked has the class `selected` on its node (`boxOf(...).selected`).""",
"""`canvas/app/test/validation.test.mjs`, which you create. Nothing else. A helper only this file needs is written in it; `helpers.mjs` is not yours.""",
f"""{COMMANDS}

Your file: `npm run build`, then `node --test --test-timeout=120000 canvas/app/test/validation.test.mjs`.

Against the scaffold the panel says "The model's problems come in step 12.", and each test must fail with the first line its row gives. Tests 2, 3, 4 and 6 therefore wait for the lists (`untilLists`) before they pick a box or type a name.

The waits: `soon(page, check, missing, frames)`. A check that comes at once is given 10 frames; the lists after a pause are given `BROWSER_FRAMES`. Test 6 waits a second by the page's clock twice, with `until`, because what it waits for is that nothing happens; no other test waits by the clock. Test 2 holds that the first entry comes at least 790 ms after the `input` event, measured inside the page; it is not a timed test of the kind the lead judges alone, since it has no upper limit.""",
"""- The file holds one `describe` with the six tests, each under the exact name of its row, none skipped and none marked todo, each ending with `finish(opened)`.
- Each fails against the scaffold with the first line its row gives.
- `npm run check` passes.""",
TESTS_BACK)

brief('12-tests-about',
f"""Write `canvas/app/test/about.test.mjs`, the seven tests of the table "`canvas/app/test/about.test.mjs` (the page)" in section 4 of `plan/swarm/step-12.md`, and the shot file `canvas/app/test/shots/about.mjs`, from "`about.png`: the scenario" in its section 5. The tests are of the About panel in the built page, opened from `file://`: a dialog that reports what this browser lets the page do, line by line, and names the libraries the page is built on. Two of the seven are what the plan's "Done when" for step 12 names, under those very names. The shot is the image `about.png`, which a reviewer later checks against a list.

{TEST_WRITER_WHY}

No test and no shot may let a request leave the page: each routes GitHub's address on its context before it opens About, as section 3 shows.""",
"""1. `plan/swarm/shared.md`, section 6, "What the tests share".
2. `plan/swarm/step-12.md`: section 1, the list under "About" (items 9 to 14); section 3, "The About panel", "GitHub's answer in a test" and "What a test takes away or stands in for"; section 4, the introduction, and the part for your file: its helpers and the table; section 5, the scenario of `about.png` and the list its reviewer checks (so that you know what the image must show).
3. `canvas/app/src/shell/About.tsx` and `canvas/app/src/core/probe.ts`: the contracts, as comments.
4. `canvas/app/test/helpers.mjs`, whole: `openPage`, `openStateFile`, `stateFileAt`, `withInit`, `viewTab`, `modelOf`, `EXAMPLE`, `DIST_URL`, `soon`, `frame`, `FRAMES`, `BROWSER_FRAMES`, `TESTIDS`, `byTestId`, `finish`, `launch`, `closePages`.
5. `canvas/app/test/shots.mjs`, whole, and `canvas/app/test/shots/about.mjs` as it is: how a shot is run, and the rows `example` and `nodes` as models of a `take()`.
6. `canvas/app/test/keys.test.mjs`, its first 110 lines: how a browser test of this application is laid out (`before`, `after`, `afterEach`, a first test).""",
"""`canvas/app/test/about.test.mjs`, which you create, and `canvas/app/test/shots/about.mjs`, which you rewrite: `take()` written as the scenario says; `picker: false` taken out, so that the page keeps its pickers; `pending: true` left in (the lead takes it off when step 12 closes, so that `npm run shots` leaves the shot out until About is built). Nothing else.""",
f"""{COMMANDS}

Your test file: `npm run build`, then `node --test --test-timeout=120000 canvas/app/test/about.test.mjs`. Your shot: `npm run shots -- about` (a shot that is named is run though it is pending).

Against the scaffold the bar's About button is disabled, and every test must fail with the first line its row gives: `About is disabled (data-testid "about"), so the About panel cannot be opened.` The shot, run against the scaffold, must fail with a sentence that says the same.""",
"""- The test file holds one `describe` with the seven tests, each under the exact name of its row, none skipped and none marked todo, each ending with `finish(opened)`.
- Each fails against the scaffold with the first line its row gives.
- `canvas/app/test/shots/about.mjs` exports the shot with `take()` written and `pending: true`; `npm run shots` (with no name) still writes the other shots and says that `about.png` is left out; `npm run shots -- about` fails for want of the About button.
- `npm run check` passes.""",
TESTS_BACK + "4. The sentence `npm run shots -- about` fails with against the scaffold.\n")

# ---------------------------------------------------------------- implementers
IMPL_BACK = """Your last message is read by the lead, who has read your diff first. Keep it to what the diff does not say:

1. The tests you ran and what each file reported (how many passed).
2. Each thing the contract left open that you settled, one line each, with what you chose and why.
3. Anything in a contract, a signature or a test that you found wrong, with the evidence (file and line, or what you ran). Stop on what depends on it, say so, and finish the rest.
"""

brief('12-impl-checks',
"""Fill in `canvas/app/src/core/checks.ts`: `checksOf`, `aboutProblem` and `aboutDiagnostic`, whose bodies throw today. The file keeps, for the open file, what the model library finds wrong with its model, in two lists, and decides when the checks run. The Validation panel, which another agent builds from the same contract, shows the lists.

Why it is a file of its own, outside React: a check of a 5,000-element model takes about 40 ms, which is most of what a keystroke may take there. So the checks must run only while somebody looks at their result, never inside the event that made a change, and those rules are tested in Node with a stand-in for the timer.""",
"""1. `canvas/app/src/core/checks.ts`, whole: its comments are the contract. The types, `PAUSE` and the declaration of the library's `validate`, `validateSpec` and `SPEC_RULES` are final.
2. `plan/swarm/step-12.md`: section 1, the list under "Validation" (items 1 to 8) and "What a check costs"; section 3, "What a test takes away or stands in for" (the timer and the counted library, in Node).
3. `canvas/app/src/core/history.ts`, the interfaces `Told` and `History` (lines 76 to 180): what a listener of the history is told. `canvas/app/src/core/session.ts`, the interface `Session`.
4. `canvas/app/src/core/selection.ts`: the type `Picked`, and how a session's store is kept "by the session object itself, weakly".
5. `canvas/app/src/plane/viewStore.ts`, lines 1 to 60 and wherever `viewStoresOf` keeps a session's stores: the same pattern, built.
6. `canvas/app/test/checks.test.mjs`: the tests you are to make pass.
7. For the sense of it, the old page's `check()` and `checkNow()` at the end of `canvas/src/core/page/render.js`, and `changed()` in `canvas/src/core/page/changes.js`. Change nothing there.""",
"""`canvas/app/src/core/checks.ts`. Nothing else: `canvas/app/src/core/index.ts` exports it already.""",
f"""{COMMANDS}

Your tests: `node --test --test-timeout=120000 canvas/app/test/checks.test.mjs`, thirteen tests, in Node; they need no build.

The checks read the model through the library, `session.lib`, in one reading (`lib.reading(model, ...)`), and never write it. Use `setTimeout` and `clearTimeout` only as the default of `options.later`.""",
"""- The thirteen tests of `checks.test.mjs` pass.
- `npm run build` and then `npm run check` pass.
- Only `canvas/app/src/core/checks.ts` differs from what you were given.""",
IMPL_BACK)

brief('12-impl-probe',
"""Fill in `canvas/app/src/core/probe.ts`: `browserOf`, `createProbe` and `browserEnv`, whose bodies throw today. The file finds out what this browser lets the page do, one line for each question, for the About panel, which another agent builds from the same contract: the browser's version, whether the page is a secure context, the three file pickers, the file input and download, localStorage, IndexedDB, a worker made from a Blob URL, WebAssembly with a timing loop, a request to GitHub, and whether a folder's handle that was remembered is still there.

Why it is laid out so: Grasp is opened from disk on machines nobody has measured, where a policy may block any of these. Every question goes through a `ProbeEnv`, so that the lines, their words and the order of the asking are tested in Node with stand-ins; `browserEnv()` makes the real one from the window, and only a browser test sees it.""",
"""1. `canvas/app/src/core/probe.ts`, whole: its comments are the contract. `LIBRARIES`, `PROBE_LINES`, `SAID`, the sentence functions, `reasonOf`, the loop (`WASM_LOOP`, `jsLoop`, the three numbers), the addresses and keys, and every type are final: leave them as they are.
2. `plan/swarm/step-12.md`: section 1, the list under "About" (items 9 to 14); section 3, "The About panel" (the table of the lines and their words) and "What a test takes away or stands in for".
3. `canvas/app/src/core/files.ts`: how this application keeps what asks the browser apart from what does not, and how it reads a picker from the window.
4. `plan/direction.md`, "What was checked", the paragraphs "What a page opened from disk can do" and "Damon's machine": what the questions are for.
5. `canvas/app/test/probe.test.mjs`: the tests you are to make pass.""",
"""`canvas/app/src/core/probe.ts`. Nothing else: `canvas/app/src/core/index.ts` exports it already, and `canvas/app/build.mjs` defines `__GRASP_LIBRARIES__` already.""",
f"""{COMMANDS}

Your tests: `node --test --test-timeout=120000 canvas/app/test/probe.test.mjs`, sixteen tests, in Node; they need no build. Tests 9 and 10 pass before you begin and must go on passing.

`browserEnv()` is run by no Node test. Write it to the letter of `ProbeEnv`'s comments; `npm run check` holds its types, and `about.test.mjs` runs it in Chromium once the panel is built, by an agent that needs your file. What the contract fixes of it: the database `grasp-app`, version 1, whose upgrade makes the object store `kept`, opened at each call and closed after; a transaction's `oncomplete` as the moment a write is done; the localStorage key `grasp-app:probe`; the worker's source, which answers a number with its double, and its 3 s; `performance.timeOrigin` as the page load's name. It must ask nothing, open no dialog and write nothing as it is made.

`remember()` must call `env.pickFolder()` before anything that waits: a browser opens a picker only from a click.""",
"""- The sixteen tests of `probe.test.mjs` pass.
- `npm run build` and then `npm run check` pass.
- Only `canvas/app/src/core/probe.ts` differs from what you were given, and its final parts are as they were.""",
IMPL_BACK)

brief('12-impl-bar',
"""Enable the bar's About button. In `canvas/app/src/shell/TopBar.tsx` the button `about` is disabled and its handler unused; step 12 enables it, with a file open or not, and has a click call `onAbout`, which `App` already hands to the bar and which opens the About panel. That is the whole change. It is a task of its own because `TopBar.tsx` is one file and the About panel another, built by another agent at the same time.""",
"""1. `canvas/app/src/shell/TopBar.tsx`, whole: the contract in the component's comment, where the item on Open and About ends "About is disabled until step 12, which enables it, with or without a file open, and has it call `onAbout`". The item on the keys says that they do nothing behind a modal dialog; the About panel is one, and you change nothing for it.
2. `canvas/app/src/shell/App.tsx`: where `onAbout` comes from.
3. `plan/swarm/step-12.md`, section 3, "The About panel", the row "The bar's button".
4. `canvas/app/test/about.test.mjs`: its helper `openAbout` and its first test.""",
"""`canvas/app/src/shell/TopBar.tsx`. Nothing else.""",
f"""{COMMANDS}

`npm run build`, then:

- `node --test --test-timeout=120000 canvas/app/test/about.test.mjs`. Before your change every test fails with `About is disabled (data-testid "about"), so the About panel cannot be opened.` After it, while the panel itself is not built, every test fails with `A click on About showed no About panel (data-testid "about-panel").` That second sentence is what you are to see: the panel is another agent's.
- `node --test --test-timeout=120000 canvas/app/test/shell.test.mjs` and `node --test --test-timeout=120000 canvas/app/test/keys.test.mjs`, which pass before your change and must pass after it.

Keep the button's `data-testid`, its `aria-label` ("About Grasp"), its tooltip and its place at the bar's right end. Take the underscore off the unused `onAbout` and the "until step 12" out of the comments that no longer hold.""",
"""- About is enabled with no file open and with one, and a click calls `onAbout`.
- `about.test.mjs` fails only for want of the panel; `shell.test.mjs` and `keys.test.mjs` pass.
- `npm run build` and then `npm run check` pass.
- Only `canvas/app/src/shell/TopBar.tsx` differs from what you were given.""",
IMPL_BACK)

brief('12-impl-about',
"""Build the About panel: replace the body of `About` in `canvas/app/src/shell/About.tsx`, which renders nothing today, with what its contract comment says. It is a Material UI Dialog that the bar's About button opens. It shows the probe's thirteen lines (what this browser lets the page do), a button that remembers a folder, the libraries the page is built on with their versions and licences, the credit to React Flow, and the name of the notices file.

Why: Grasp is opened from disk on machines nobody has measured, and the panel is how a person there, and Claude through them, learns what works. It is also where React Flow is credited, whose mark the planes hide.

The questions themselves, their words and the order of the asking are not yours: they are `canvas/app/src/core/probe.ts`, which is built. You draw what the probe gives.""",
"""1. `canvas/app/src/shell/About.tsx`, whole: the contract in the component's comment. The constants above it are final.
2. `canvas/app/src/core/probe.ts`: the comments of `Probe`, `ProbeLine`, `ProbeState`, `PROBE_LINES`, `LIBRARIES`, `createProbe` and `browserEnv`. You import them from `'../core'`.
3. `plan/swarm/step-12.md`: section 1, the list under "About" (items 9 to 14); section 3, "The About panel"; section 5, the scenario of `about.png` and the list its reviewer checks: your panel must show every item of that list in a window of 1400 by 900.
4. `canvas/app/src/shell/App.tsx`: how `About` is rendered, and its own Dialog as a model of Material UI's Dialog in this application.
5. `canvas/app/src/shell/theme.ts`: the theme's colours (`primary`, `text.primary`, `text.secondary`, `divider`) and sizes (13 px; 12 px for `caption`).
6. `canvas/app/src/shell/TopBar.tsx`, the item on the keys in its contract: why the panel must be a modal dialog.
7. `canvas/app/test/about.test.mjs` and `canvas/app/test/shots/about.mjs`: the tests and the shot you are to satisfy.""",
"""`canvas/app/src/shell/About.tsx`. Nothing else. No stylesheet: colours and sizes come from the theme, in `sx`.""",
f"""{COMMANDS}

`npm run build`, then:

- `node --test --test-timeout=120000 canvas/app/test/about.test.mjs`: seven tests.
- `npm run shots -- about`, which writes `canvas/app/shots/about.png`. Look at it against the list in section 5 of `plan/swarm/step-12.md`. You do not hand the image over: the lead takes it again.
- `node --test --test-timeout=120000 canvas/app/test/shell.test.mjs`, `canvas/app/test/keys.test.mjs` and `canvas/app/test/build.test.mjs`, which must go on passing: the page asks for nothing outside its own folder as it opens, so nothing may be asked, and no probe made, before the panel is first opened.

Everything of Material UI is imported from `'@mui/material'`, which `vendor.ts` holds whole. No icon is added: a line's mark is drawn in CSS, and the spinner is Material UI's CircularProgress.

If a test fails for a reason that lies in `probe.ts` (a line's words, what `browserEnv()` reads) or in `TopBar.tsx`, stop on it and say what you saw: those files are not yours.""",
"""- The seven tests of `about.test.mjs` pass, and `shell.test.mjs`, `keys.test.mjs` and `build.test.mjs` still pass.
- `npm run shots -- about` writes an image in which every item of the reviewer's list is present.
- `npm run build` and then `npm run check` pass.
- Only `canvas/app/src/shell/About.tsx` differs from what you were given.""",
IMPL_BACK)

brief('12-impl-validation',
"""Build the Validation panel: replace the body of `ValidationPanel` in `canvas/app/src/panels/Validation.tsx`, which shows a placeholder today, with what its contract comment says. The panel lists what the open file's checks found: Grasp's own problems, and the diagnostics of the SysML v2 specification's rules in SysON's words. A click on an entry picks what the entry is about, through the session's selection.

Why it listens only while it is shown: a side panel stays mounted while its tab is hidden, and a check of a 5,000-element model takes about 40 ms. The checks run only while they have a listener, so a panel that is not shown must not listen.

When the checks run, and what an entry is about, are not yours: they are `canvas/app/src/core/checks.ts`, which is built. You draw what it gives, and you are its only listener.""",
"""1. `canvas/app/src/panels/Validation.tsx`, whole: the contract in the component's comment. The constants above it are final.
2. `canvas/app/src/core/checks.ts`: the comments of `Checks`, `ChecksState`, `Found`, `checksOf`, `EntryAbout`, `aboutProblem` and `aboutDiagnostic`. You import them from `'../core'`.
3. `canvas/app/src/core/selection.ts`: the comment of `Selection` (`set`, `has`, `listen`) and `selectionOf`.
4. `plan/swarm/step-12.md`: section 1, the list under "Validation" (items 1 to 8); section 3, "The Validation panel".
5. `plan/swarm/shared.md`, section 3, "How a side panel is put into the dock"; `canvas/app/src/panels/SidePanel.tsx`; `canvas/app/src/shell/dockContext.ts`.
6. `canvas/app/src/plane/Plane.tsx`, the item "The gate" of its contract and the layout effect with the ResizeObserver in `Plane`: the model for your gate.
7. `canvas/app/src/shell/theme.ts`: the theme's colours and sizes.
8. `canvas/app/test/validation.test.mjs`: the tests you are to make pass.""",
"""`canvas/app/src/panels/Validation.tsx`. Nothing else. No stylesheet: colours and sizes come from the theme, in `sx`.""",
f"""{COMMANDS}

`npm run build`, then:

- `node --test --test-timeout=120000 canvas/app/test/validation.test.mjs`: six tests. Four of them pick a box on a plane and type a name into Details; your worktree holds steps 9 and 10 for that.
- `node --test --test-timeout=120000 canvas/app/test/shell.test.mjs` and `canvas/app/test/open.test.mjs`, which must go on passing.

Everything of Material UI is imported from `'@mui/material'`, which `vendor.ts` holds whole.

The panel must render with no file open, since it is mounted from the page's start, and must follow the session when another file is opened. It draws nothing on a plane: badges are slice 2's.

If a test fails for a reason that lies in `checks.ts`, in the selection, in a plane or in Details, stop on it and say what you saw: those files are not yours.""",
"""- The six tests of `validation.test.mjs` pass, and `shell.test.mjs` and `open.test.mjs` still pass.
- `npm run build` and then `npm run check` pass.
- Only `canvas/app/src/panels/Validation.tsx` differs from what you were given.""",
IMPL_BACK)

# ---------------------------------------------------------------- checks-break
brief('12-checks-break',
"""See each test of step 12 fail with the thing it guards broken. Step 12 is built: its four test files pass. A test that passes proves little until it has been seen to fail for its own reason, and most of these tests failed before the code existed only for want of the whole panel. So, for each test, you make the one small change to the built code that its row names, run the test, and put the code back. A test that still passes under its breakage is what you are looking for.""",
"""1. `plan/swarm/step-12.md`, section 4: the four tables. The last column of each row, "The breakage", is the change to make; section 3 says what the tests read.
2. The files the breakages are made in: `canvas/app/src/core/checks.ts`, `canvas/app/src/core/probe.ts`, `canvas/app/src/panels/Validation.tsx`, `canvas/app/src/shell/About.tsx`.
3. The four test files: `canvas/app/test/checks.test.mjs`, `probe.test.mjs`, `validation.test.mjs`, `about.test.mjs`.""",
"""None. You change source files to break them and put each back at once; when you finish, `git status --short` shows nothing changed.""",
f"""{COMMANDS}

For each of the 42 rows (13, 16, 6 and 7), one at a time:

1. Make the breakage, as small as the row's words allow, in the source file it belongs to.
2. For a test of the page (`validation.test.mjs`, `about.test.mjs`): `npm run build`. A Node test needs none.
3. Run the row's test alone: `node --test --test-timeout=120000 --test-name-pattern="<the test's name>" canvas/app/test/<file>`. Note whether it failed, and the first line of its failure.
4. Run the whole file once under the same breakage, and note which other tests failed.
5. Put the source back (`git checkout -- <file>`), and go on.

At the end: `npm run build`, `npm run check`, and each of the four files once more, all passing.

Rows 9 and 10 of `probe.test.mjs` pass against the scaffold, so their breakage is the only way they are seen to fail. Where a row's breakage cannot be made as worded (the code is built otherwise), make the nearest change that does what the words mean, and say what you made.""",
"""- Every row has been tried, and the worktree is as you found it.
- The four files pass at the end.""",
"""A table, one line for each row: the file and the test's number; the breakage as you made it, in a line; whether the test failed, with the first line of its failure; which other tests of its file failed under it.

Then, apart, every test that still passed under its breakage, with what you think lets it pass. That list is the point of the task. Change no test: a test that is too weak is the lead's to send back.""")

# ---------------------------------------------------------------- review-code
brief('12-review-code',
"""Review the code of step 12 of slice 1, "Validation and About", against the plan's own text, and try in the built page whatever you doubt. Step 12 is built and its tests pass. You have not seen how it was designed, and that is the point: the two serious defects of an earlier step were behaviours its design never spelled out, which the tests therefore never asked for, and which only a reader who came from the plan found. Send back defects, each reproduced. You change nothing.""",
"""1. `plan/slice-1.md`: section 2, the items "What Validation lists", "What About reports" and "Which editing is slice 1's"; section 3, the words; section 4, "The shell" (sizes, type) and "How the look is checked"; section 5, step 12; section 7, Damon's choice 1 (React Flow's mark); section 10, the criteria.
2. `plan/direction.md`: "What was checked", the paragraphs "What a page opened from disk can do" and "Damon's machine"; decision 7's last sentence, on the About panel.
3. The step's code, each file whole, with the contract comments in it: `canvas/app/src/core/checks.ts`, `canvas/app/src/core/probe.ts`, `canvas/app/src/panels/Validation.tsx`, `canvas/app/src/shell/About.tsx`, and the About button in `canvas/app/src/shell/TopBar.tsx`. What the swarm added to the skeletons: `git diff $(git log --diff-filter=A --format=%H -- canvas/app/src/core/checks.ts) -- canvas/app/src canvas/app/test` (the commit that first held `checks.ts` is the scaffold's).
4. The step's tests: `canvas/app/test/checks.test.mjs`, `probe.test.mjs`, `validation.test.mjs`, `about.test.mjs`, `canvas/app/test/shots/about.mjs`.
5. What the code builds on, as far as you need it: `canvas/app/src/core/selection.ts`, `core/history.ts`, `core/session.ts`, `shell/App.tsx`, `panels/SidePanel.tsx`, and the old page's `canvas/src/validation/page.js` and `check()` in `canvas/src/core/page/render.js`, which the Validation panel ports.

Do not read `plan/swarm/step-12.md`: it is the design, and you are to judge the code by the plan and by what a person meets.""",
"""None. Your probes and their screenshots go in a folder outside the repository.""",
f"""{COMMANDS}

Build first. A probe opens `canvas/dist/index.html` from `file://` with Playwright's Chromium (`canvas/app/test/helpers.mjs` shows how: `openPage`, `openStateFile` on a page opened with `picker: false`). No request may leave the page: route `https://api.github.com/rate_limit` on the context before you open About, with a good answer, as `about.test.mjs` does.

What to try, beyond what you doubt on reading:

- The Validation panel with no file open; with the example; with a second file opened over the first; with the first file changed and not saved when the second is asked for.
- Two elements given one name, by typing into Details: what is listed, when, and what stays listed while the typing goes on; then Undo, Redo, and Undo by the keyboard while the name field has the focus.
- A click on each kind of entry: about an element, a line, a line no plane draws, a view, the package. What is picked, on the plane, in the Explorer, in Details. An entry whose element an Undo has just taken out of the model.
- The panel hidden behind the Explorer, and its side collapsed, while changes are made; then shown again. The panel in a window of 800 by 600.
- About: opened with no file and with one; opened, closed and opened again quickly; closed each way; the keys (Ctrl + Z, Ctrl + S) while it is up and a file has changes; Tab through it; the page reloaded while it is up.
- About with a picker taken away, with all three, with localStorage or IndexedDB made to throw, with `WebAssembly` deleted, with GitHub's answer held back for longer than 10 s.
- "Remember a folder…" with the picker closed without a choice, and with a folder stood in for; then a reload.
- About in a window of 800 by 600 and of 1400 by 900: is anything cut off?
- Whether anything runs, is made or is asked when the page loads, before About is first opened; and what the timing loop does to the page while it runs.""",
"""- You have read every file of the step whole.
- Each defect you send back was reproduced in the built page, or, for the core, in a script.""",
"""Defects, the worst first. For each: what you did, step by step; what the page did; what it should have done, with the sentence of the plan, of a contract comment or of plain sense that says so; and how bad it is for a person using the page. Give the probe's essential lines, since your scratch folder is not kept.

Then, in a few lines, what you tried that held up, so that nobody tries it again. And anything a test claims that the code would still pass if it were broken.

Do not send back style, and do not propose a redesign: say what is wrong.""")

# ---------------------------------------------------------------- review-shot
SHOT_WHERE = """You are a reviewer who has not seen the code or its design. The lead gives you one image and this brief, and nothing else. Do not open the repository, the tests or any other file: what counts is what a person sees in the image."""

def shot(task, image, what, items, rate):
    lines = [f"# Brief: `{task}`", "", SHOT_WHERE, "", "## The goal, and why", "",
             f"Look at `{image}`, {what} Mark each item of the list below present or absent in the image." + (" Then rate the image on four points." if rate else "") +
             " The step that took this image is committed only when every item is present" + (", and when each of the four scores is 4 or more" if rate else "") +
             ", so say what you see, not what you expect: an item you cannot make out is absent.", "",
             "Grasp is a design canvas for SysML v2 models, opened as a page in a browser. The image is a screenshot of that page, 1400 by 900 px, taken at twice that size (2800 by 1800), so that small text can be read.", "",
             "## Read, in this order", "", f"1. This brief.\n2. The image, `{image}`, at its full size, and again zoomed in wherever an item is about small things.", "",
             "## The files you own", "", "None. You change nothing.", "",
             "## The tests and the commands", "", "None: you run nothing. You look.", "",
             "## The list", "", "Each item is one thing that is present or absent in the image.", ""]
    lines += [f"{i}. {item}" for i, item in enumerate(items, 1)]
    if rate:
        lines += ["", "## The four points", "",
                  "Rate the image from 1 to 5 on each of these four points, in whole numbers: 1 is a broken layout, 3 a working prototype, 5 a finished workbench of the kind of SysON's (a professional modelling tool in a browser).", "",
                  "1. Alignment and spacing.", "2. Type and contrast.", "3. Nothing cut off or overlapping.", "4. Boxes and lines easy to read."]
    lines += ["", "## What done is", "", "Every item is marked present or absent" + (", and each of the four points has its score" if rate else "") + ".", "",
              "## What to send back", "",
              "The list again, each item with **present** or **absent** and, in a few words, what you saw that made you say so." +
              (" Then the four scores, each with one sentence of reason. For a score under 4, say what in the image costs the point and where it is." if rate else "") +
              " Then, apart, anything else in the image that looks wrong to you, which changes no mark.", "", RULES]
    with open(os.path.join(OUT, 'briefs', task + '.md'), 'w') as f:
        f.write("\n".join(lines))

shot('12-review-shot-about', 'canvas/app/shots/about.png', "which shows the page with its About panel open.",
     ['A dialog titled "About Grasp" lies over the window, and the page behind it is dimmed.',
      'Under "This browser" there are thirteen lines, labelled from top to bottom: Browser, Secure context, Open picker, Save picker, Folder picker, File input, Download, localStorage, IndexedDB, Worker from a Blob URL, WebAssembly, GitHub, Remembered folder.',
      'Every one of the thirteen lines has an answer beside its label: none says "Asking…", and none shows a spinner.',
      'The Browser line names Chrome with a version number.',
      'The WebAssembly line gives two times in ms.',
      'The GitHub line reads "Reached: 57 of 60 requests left this hour."',
      'Under "Libraries" eleven packages are listed, each with a version and a licence, among them react 18.3.1, @xyflow/react 12.10.2, dockview-react 8.9.0, @mui/material 7.3.11 and @mui/x-tree-view 8.29.3.',
      'React Flow is credited by name, and THIRD-PARTY-NOTICES.txt is named.',
      'There is a button "Remember a folder…" and a button "Close".',
      'Nothing is cut off or overlapping, and the dialog shows no scrollbar.',
      'The text is Roboto.'], False)

shot('12-review-shot-shell', 'canvas/app/shots/shell.png', "which shows the page as it opens, before any file is open.",
     ['The whole window is shown.',
      'One bar across the top, 40 px high (80 px of the image).',
      'The bar holds four actions (Open, Save, Undo, Redo) and About, each an icon.',
      'Three names on the left strip: Explorer, Tools, Validation.',
      'One name on the right strip: Details.',
      'Nothing is wrapped or cut off. A sentence that runs onto a second line inside its panel or its card is a paragraph\'s ordinary wrap, not a cut.',
      'The text is Roboto.'], True)

shot('12-review-shot-example', 'canvas/app/shots/example.png', "which shows the page with an example model open: one view, a diagram of boxes and lines, fitted to the window, with the side panels collapsed.",
     ['The example is fitted: the whole view lies on the plane.',
      '`Page` holds `hosts` and `app`.',
      'Each `api` port lies across its owner\'s border.',
      'Each port\'s name is outside its owner.',
      '`mount` joins the two ports.',
      'The three specializations end in a hollow triangle at `Host`: three lines that join into one trunk, with one hollow triangle at `Host`\'s bottom middle.',
      'The two defined-by lines, each with its two dots.',
      'No line passes through a name.'], True)

# ---------------------------------------------------------------- checks-close
close = f"""# Brief: `12-checks-close`

This task is the lead's own: the closing of step 12, as `plan/swarm/README.md`, "How the lead runs the swarm", item 7, gives it for every step. Step 12 is also the last step that the success criteria of `plan/slice-1.md`, section 10, cover, so its closing carries the last checks of criteria 1, 3, 4, 5 and 6. Criterion 7's run of all eight step commits and criterion 8's five questions come after this commit and are step 13's (`plan/swarm/step-13.md`).

## The goal, and why

One commit that ends step 12, pushed: the step's sources and tests as the swarm built them, `canvas/dist/` as the sources build it, the screenshots, `plan/status.json` naming step 12, and the session's entry in `plan/notes.md`. It is committed only when every check below holds, because after it the slice's criteria are judged on this commit.

## Read, in this order

1. `plan/swarm/README.md`, "How the lead runs the swarm".
2. `plan/slice-1.md`, section 5, step 12, and section 10, criteria 1, 3, 4, 5 and 6 with "How the criteria meet the steps as written".
3. `plan/swarm/step-12.md`, sections 5 and 7.
4. What came back from every other task of step 12: the four test writers, the five implementers, `12-checks-break`, `12-review-code`.

## The files you own

`canvas/app/shots/about.png`, `canvas/app/shots/shell.png`, `canvas/app/shots/example.png`, `canvas/app/test/shots/about.mjs` (only to take `pending: true` off), `canvas/dist/`, `plan/status.json`, `plan/notes.md`.

## The tests and the commands

Nothing else runs on the machine while any of this is timed.

1. **What the other tasks found is settled first.** Every test that still passed under its breakage (`12-checks-break`) is made to fail for its reason, or its row is corrected in `plan/swarm/step-12.md` with the reason in the notes. Every defect of `12-review-code` is fixed with a test seen to fail first, or is written into the notes as known and kept, with why.
2. **Build and check.** `npm run build`, then `npm run check`: exit 0.
3. **The suite, three runs in a row.** `npm test`, three times. Each run: `# fail 0` and `# todo 0` (criterion 1).
4. **Criterion 5, in each of the three runs**, from the lines the timed tests of `canvas/app/test/scale.test.mjs` print: "a 5,000-element model opens" in under 5 s; "a drag step takes under 16 ms at 5,000 elements in 3 views"; "a pan step of a fitted view takes under 16 ms at 5,000 elements", for each of the three views; "a keystroke in a name takes under 50 ms at 5,000 elements". Each by its median. Write the three runs' medians into the notes. A limit that does not hold is not passed by loosening its test: it stops the step, and goes to Damon with its numbers and where the time goes.
5. **Criterion 6, whole, in the same three runs**, from `canvas/app/test/instant.test.mjs`: the page ready in under 500 ms; the example drawn within 1 s of the file being given; a drag step of the example under 16 ms and a keystroke in a name under 16 ms, each by the median of 9 samples; a switch between the two tabs of the interconnection fixture under 100 ms. Write the medians into the notes.
6. **Criterion 2 still holds**: `open.test.mjs`, "the example and the nine fixtures each open: 17 tabs, 11 planes, 6 cards, nothing logged", passes in the three runs.
7. **Criterion 1's names.** Every test that steps 5 to 12 of the plan name exists under that name. For step 12: in `validation.test.mjs`, "the example has no entry, and the panel says so", "two part defs given one name are listed 0.8 s after the change, under Grasp's problems and under the specification's rules in SysON's words, and both entries go with Undo" and "a click selects what an entry is about"; in `about.test.mjs`, "each line reports what this Chromium does, with GitHub's answer stubbed" and "with the pickers taken away, the panel says so and Open falls back to the file input".
8. **The screenshots.** Take `pending: true` off `canvas/app/test/shots/about.mjs`. `npm run shots`: all six are written, `shell.png` and `example.png` retaken among them.
9. **Criterion 3, `about.png`.** `12-review-shot-about`, a fresh agent with the image and its brief and nothing else: every one of its eleven items present. An item that is absent goes back as a fix (to an implementer at high effort, or by your own hand when it is smaller than a brief), the image is retaken, and a fresh reviewer looks again.
10. **Criterion 4, `shell.png` and `example.png` as retaken.** `12-review-shot-shell` and `12-review-shot-example`, a fresh agent each: every item of each list present (seven and eight), and each of the eight scores 4 or more. A score under 4 is handled as sessions 19 to 21 handled theirs: what the reviewer names and the page may change is changed, the image is retaken and rated by a fresh reviewer, and what asks for design the plan does not have is Damon's.
11. **`plan/status.json`**: `"step": 12`, and all ten checks `"pass"` (the last todo mark went at step 10; the runner's `# todo 0` is the cross-check).
12. **`plan/notes.md`**, the session's entry for step 12 (criterion 8): each measurement with its command (the three runs' medians; what a check costs at 5,000 elements, from `plan/swarm/step-12.md`, section 1, measured again in the page if the review asked); each file built otherwise than the plan names, with its reason (`core/checks.ts`, `checks.test.mjs` and `probe.test.mjs`, which the plan does not list; `build.mjs` defining the libraries; `core/index.ts`); each thing tried and dropped (`step-12.md`, section 6, and what the swarm added); the reviewers' marks and scores; the swarm's log for the step (times, rework and whose fault).
13. **The commit**, one, pushed: the step's sources and tests, `canvas/dist/`, the three images, `plan/status.json`, `plan/notes.md`. Checked out by itself into a new worktree, it passes `npm ci && npm run check && npm test` with `# fail 0` and `# todo 0` (criterion 7, for this step).

## What done is

Every item above holds, and the commit is pushed. Then step 13 begins.

## What to send back

Nothing to another agent: the result is the commit and the notes. To Damon, one line at the change of stage, and at once anything that stops the step: a limit of criterion 5 or 6 that does not hold, or a score that asks for design the plan does not have.

{RULES}"""
with open(os.path.join(OUT, 'briefs', '12-checks-close.md'), 'w') as f:
    f.write(close)

# ---------------------------------------------------------------- tasks
B = 'plan/swarm/briefs/'
T = 'canvas/app/test/'
S = 'canvas/app/src/'
def task(id, kind, owns, needs, model='sonnet', effort='medium'):
    return {'id': id, 'step': 12, 'kind': kind, 'brief': B + id + '.md', 'owns': owns, 'needs': needs, 'model': model, 'effort': effort, 'status': 'open'}
tests = ['12-tests-checks', '12-tests-probe', '12-tests-validation', '12-tests-about']
impls = ['12-impl-checks', '12-impl-probe', '12-impl-bar', '12-impl-about', '12-impl-validation']
tasks = [
    task('12-tests-checks', 'tests', [T + 'checks.test.mjs'], []),
    task('12-tests-probe', 'tests', [T + 'probe.test.mjs'], []),
    task('12-tests-validation', 'tests', [T + 'validation.test.mjs'], []),
    task('12-tests-about', 'tests', [T + 'about.test.mjs', T + 'shots/about.mjs'], []),
    task('12-impl-checks', 'implement', [S + 'core/checks.ts'], ['12-tests-checks']),
    task('12-impl-probe', 'implement', [S + 'core/probe.ts'], ['12-tests-probe']),
    task('12-impl-bar', 'implement', [S + 'shell/TopBar.tsx'], ['12-tests-about']),
    task('12-impl-about', 'implement', [S + 'shell/About.tsx'], ['12-tests-about', '12-impl-probe', '12-impl-bar']),
    task('12-impl-validation', 'implement', [S + 'panels/Validation.tsx'], ['12-tests-validation', '12-impl-checks', '9-impl-selection', '9-impl-plane', '10-impl-details']),
    task('12-checks-break', 'checks', [], tests + impls),
    task('12-review-code', 'review', [], impls, 'fable', 'high'),
    task('12-review-shot-about', 'review', [], ['12-tests-about', '12-impl-probe', '12-impl-bar', '12-impl-about']),
    task('12-review-shot-shell', 'review', [], impls + ['11-checks-close']),
    task('12-review-shot-example', 'review', [], impls + ['11-checks-close']),
]
others = [t['id'] for t in tasks]
tasks.append(task('12-checks-close', 'checks',
    ['canvas/app/shots/about.png', 'canvas/app/shots/shell.png', 'canvas/app/shots/example.png', T + 'shots/about.mjs', 'canvas/dist/', 'plan/status.json', 'plan/notes.md'],
    others + ['11-checks-close'], 'lead', 'high'))
with open(os.path.join(OUT, 'tasks-12.json'), 'w') as f:
    json.dump(tasks, f, indent=2)
    f.write('\n')
print(len(tasks), 'tasks;', sorted(os.listdir(os.path.join(OUT, 'briefs'))))
