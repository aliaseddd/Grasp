# 9-tests-selection: the plan's six tests of the shared selection, in the page

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is built in `canvas/app/` (React, React Flow for the planes, Dockview for the tabs and side panels, MUI X Tree View for the Explorer), beside an old page that must not change. Slice 1 of the rebuild is built in thirteen steps; this task is part of step 9, "The shared selection and the Explorer": one selection, kept for the open file, that every plane and every panel reads and sets, and the Explorer, a tree of the model at the left. The step's design is settled in `plan/swarm/step-9.md`, which was checked against the libraries' sources and a throwaway build. You make no design decision: where something you need is not said, stop and say what is missing.

You write tests from a list, before the code they check exists. Another agent writes that code at the same time, from the same contract, without seeing your tests; the only things the two of you share are the contract comments in the source files and section 3 of `plan/swarm/step-9.md`. So a test finds what it reads exactly as that section says, and asserts what the contract says, no more: where the contract is silent, the test is silent.

Your file is `canvas/app/test/selection.test.mjs`, which the plan names in step 9's "Done when": six tests, under the plan's own words, and four more that need every part of the step together (a plane, the Explorer and the dock). They open the built page from `file://` in Chromium through Playwright, as every browser test of this repository does, and pick as a person does: clicks, Ctrl, Shift with a drag, the keyboard.

## Where to read, in this order

1. `plan/swarm/README.md`, "Words" and "The rules every brief carries", and `plan/swarm/shared.md`, sections 1 and 6 (the selection, and what the tests share).
2. `plan/slice-1.md`, section 5, step 9: the "Done when" these tests are.
3. `plan/swarm/step-9.md`: section 1, whole; section 3, whole ("The contract between tests and code": every selector, attribute, word and number you read); section 4, the head of the section and the table "`canvas/app/test/selection.test.mjs`"; and in the table of `picking.test.mjs`, how the marquee gesture M and `covered` are defined, which your S2 uses.
4. `canvas/app/test/helpers.mjs`, whole: how a test finds the page's parts (its head), `openIn`, `openPage`, `openStateFile`, `stateFileAt`, `stateFileOf`, `finish`, `soon`, `frame`, `showView`, `viewTab`, `boxOf`, `headerOf`, `selectBox`, `rectsOf`, `groundPoint`, `planeOf`, `nodeOf`, `modelOf`, `linesOf`, `cssColor`, `TEAL`, `showSide`, `rowOf`, `rowIn`, `rowItemIn`, `undo`. It does not change: a helper only your file needs is written in your file.
5. `canvas/app/test/plane.test.mjs`, the test "a click selects a box and a line, and a click on the ground lets go" (how a line's middle is found and its stroke read), and `canvas/app/test/shell.test.mjs`, the test "with a view floating, the card says what is closed, and the views come back into the editor" (how a tab is closed, and the button "Show the views again").
6. `canvas/app/test/scale.test.mjs`, its first 45 lines: how the 5,000-element model is made and opened.
7. The comment of `ExplorerPanel` in `canvas/app/src/panels/Explorer.tsx`, for what a row is in the page.

## The files you own

- `canvas/app/test/selection.test.mjs`

## The work, the tests and the commands

All from the root of your worktree, which the lead made for you from the commit that holds what you need:

```sh
npm ci                # node_modules/ from the lockfile, about 15 s; once
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open; again after every change to a source file
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Run single test files, never `npm test`: other agents share this machine, and the lead runs the whole suite alone. You build `canvas/dist/` to run browser tests and do not hand it over. A timed test (one that fails on a number of milliseconds) is judged by the lead alone, with nothing else running: if one fails for you beside other work, say so with its numbers and go on.

Write the ten tests S1 to S10 of the table, each under its exact name, in one `describe('the shared selection')`. The sixth test's name holds double quotes: `'with the 5,000-element model only the package\'s row is unfolded, and a long list ends in "Show more"'`.

Write the three small helpers the head of section 4 names (`selectedIn`, `selectedRows`, `rowsNow`) in your file, and one that waits for a row and fails with `The Explorer has no row for <what> (data-row "<type>:<id>"): its tree is not built.` Every wait is `soon(page, check, missing)`; there is no fixed sleep.

The command: `npm run build`, then `node --test --test-timeout=120000 canvas/app/test/selection.test.mjs`. Against your worktree S2 fails with the marquee's message and the others with the row's message.

Done is: the ten tests exist under their names, each fails as the list says, `npm run check` passes, and the file is committed.

## What to send back

- The file or files you own, in your worktree, committed there (add them by name; never `git add -A`).
- For each test: its name and the first line of its failure when run against your worktree as it is, where nothing of step 9 is built. It must be the "Before" the list gives, in the page's own terms; where your message differs in wording, give it. A test the list marks *passes before* passes.
- Anything in the list you could not write as given, with the reason, and each thing you had to choose because the list and the contract were silent.
- Do not hand over a throwaway implementation. You may write one outside the repository to see that your tests can pass.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings that are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
