# Brief: `12-tests-about`

You are one agent of a swarm that builds slice 1 of Grasp, a SysML v2 design canvas, from a scaffold: the design is written already, as contract comments in skeleton files and as `plan/swarm/step-12.md`. You have this brief and the files it names, and nothing else; you can do the task from them without asking anything. You work in a git worktree that the lead made for you. Its root is the repository's root, and every path below is from there.

## The goal, and why

Write `canvas/app/test/about.test.mjs`, the seven tests of the table "`canvas/app/test/about.test.mjs` (the page)" in section 4 of `plan/swarm/step-12.md`, and the shot file `canvas/app/test/shots/about.mjs`, from "`about.png`: the scenario" in its section 5. The tests are of the About panel in the built page, opened from `file://`: a dialog that reports what this browser lets the page do, line by line, and names the libraries the page is built on. Two of the seven are what the plan's "Done when" for step 12 names, under those very names. The shot is the image `about.png`, which a reviewer later checks against a list.

The tests are written before the code they check, by somebody who does not see the code, and each is seen to fail for the reason the list gives. An implementer fills in the skeleton at the same time or after you, from the same contract and without seeing how you wrote your tests; a third agent later breaks the built code in the way each row names and looks whether your test notices. So write each test to the row: its exact name as the string given to `test()`, its steps, everything it asserts, and failure messages that say what the page or the store lacks in its own terms.

No test and no shot may let a request leave the page: each routes GitHub's address on its context before it opens About, as section 3 shows.

## Read, in this order

1. `plan/swarm/shared.md`, section 6, "What the tests share".
2. `plan/swarm/step-12.md`: section 1, the list under "About" (items 9 to 14); section 3, "The About panel", "GitHub's answer in a test" and "What a test takes away or stands in for"; section 4, the introduction, and the part for your file: its helpers and the table; section 5, the scenario of `about.png` and the list its reviewer checks (so that you know what the image must show).
3. `canvas/app/src/shell/About.tsx` and `canvas/app/src/core/probe.ts`: the contracts, as comments.
4. `canvas/app/test/helpers.mjs`, whole: `openPage`, `openStateFile`, `stateFileAt`, `withInit`, `viewTab`, `modelOf`, `EXAMPLE`, `DIST_URL`, `soon`, `frame`, `FRAMES`, `BROWSER_FRAMES`, `TESTIDS`, `byTestId`, `finish`, `launch`, `closePages`.
5. `canvas/app/test/shots.mjs`, whole, and `canvas/app/test/shots/about.mjs` as it is: how a shot is run, and the rows `example` and `nodes` as models of a `take()`.
6. `canvas/app/test/keys.test.mjs`, its first 110 lines: how a browser test of this application is laid out (`before`, `after`, `afterEach`, a first test).

## The files you own

`canvas/app/test/about.test.mjs`, which you create, and `canvas/app/test/shots/about.mjs`, which you rewrite: `take()` written as the scenario says; `picker: false` taken out, so that the page keeps its pickers; `pending: true` left in (the lead takes it off when step 12 closes, so that `npm run shots` leaves the shot out until About is built). Nothing else.

## The tests and the commands

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/; a browser test opens the built page, so build before you run one
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Do not run `npm test`, the whole suite: other agents share this machine, and the lead runs it alone. A timed test is judged by the lead alone: a time taken while other agents work proves nothing. If a timed test fails beside your work, say so in what you send back and go on. `canvas/dist/` is built to run the tests and is not handed over: the lead builds it.

Your test file: `npm run build`, then `node --test --test-timeout=120000 canvas/app/test/about.test.mjs`. Your shot: `npm run shots -- about` (a shot that is named is run though it is pending).

Against the scaffold the bar's About button is disabled, and every test must fail with the first line its row gives: `About is disabled (data-testid "about"), so the About panel cannot be opened.` The shot, run against the scaffold, must fail with a sentence that says the same.

## What done is

- The test file holds one `describe` with the seven tests, each under the exact name of its row, none skipped and none marked todo, each ending with `finish(opened)`.
- Each fails against the scaffold with the first line its row gives.
- `canvas/app/test/shots/about.mjs` exports the shot with `take()` written and `pending: true`; `npm run shots` (with no name) still writes the other shots and says that `about.png` is left out; `npm run shots -- about` fails for want of the About button.
- `npm run check` passes.

## What to send back

Your last message is read by the lead, who has read your file first. Keep it to what the file does not say:

1. For each test, the first line of its failure against the scaffold, beside the line the list gives. They must be the same.
2. Each thing the list or a contract left open that you settled, one line each, with what you chose.
3. Anything in the list, in a contract comment or in a helper that you found wrong, with the evidence. Stop on what depends on it, and finish the rest.
4. The sentence `npm run shots -- about` fails with against the scaffold.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

## Two sayings

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
