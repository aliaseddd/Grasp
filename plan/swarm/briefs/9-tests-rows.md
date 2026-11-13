# 9-tests-rows: the tests of the Explorer's rows, in Node

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is built in `canvas/app/` (React, React Flow for the planes, Dockview for the tabs and side panels, MUI X Tree View for the Explorer), beside an old page that must not change. Slice 1 of the rebuild is built in thirteen steps; this task is part of step 9, "The shared selection and the Explorer": one selection, kept for the open file, that every plane and every panel reads and sets, and the Explorer, a tree of the model at the left. The step's design is settled in `plan/swarm/step-9.md`, which was checked against the libraries' sources and a throwaway build. You make no design decision: where something you need is not said, stop and say what is missing.

You write tests from a list, before the code they check exists. Another agent writes that code at the same time, from the same contract, without seeing your tests; the only things the two of you share are the contract comments in the source files and section 3 of `plan/swarm/step-9.md`. So a test finds what it reads exactly as that section says, and asserts what the contract says, no more: where the contract is silent, the test is silent.

Your file tests `canvas/app/src/panels/explorerRows.ts`, the part of the Explorer with no React in it: which rows the tree has, which are unfolded, how much of a long list is shown, what each row says, and what each kind of change of the model costs. At step 9 nothing in the page can rename an element or add one (Details is step 10, the tools step 11), so these Node tests are the only place where "after a change to the structure the Explorer builds its rows again; after any other it relabels" is checked.

## Where to read, in this order

1. `plan/swarm/README.md`, "Words" and "The rules every brief carries", and `plan/swarm/shared.md`, sections 1 and 6 (the selection, and what the tests share).
2. `canvas/app/src/panels/explorerRows.ts`, whole: the comments of `RowWords`, `RowItem` and `ExplorerRows` are the contract you test. `rowId`, `rowOf`, `pickedOf` and `PACKAGE_ROW` are final already.
3. `plan/swarm/step-9.md`: section 1, "The Explorer", with its table of what the Explorer does for each kind of `Told`; section 3, "The words, exactly", the example's 25 rows, the fixtures' pinned rows, "Numbers", and "The Node tests"; section 4, the head of the section and the table "`canvas/app/test/explorer-rows.test.mjs`".
4. `canvas/app/test/core.mjs`, whole: `loadWith('panels/explorerRows')`, `lib`, `EXAMPLE`, `FIXTURES`, `readText`, `plain`, `clock`.
5. `canvas/src/browser/lib.js` (`browserRows`: what the library gives) and `canvas/src/browser/page.js`, `browserRowParts` (the old page's words, which a row's words follow). Read only; nothing under `canvas/src` may change.
6. `canvas/app/src/core/history.ts`, lines 1 to 200 (`Told`, `edit`, `endEdit`, `undo`), and `canvas/test/scale-model.mjs` (`scaleState(n)` gives a model of exactly `n` elements; import it).

## The files you own

- `canvas/app/test/explorer-rows.test.mjs`

## The work, the tests and the commands

All from the root of your worktree, which the lead made for you from the commit that holds what you need:

```sh
npm ci                # node_modules/ from the lockfile, about 15 s; once
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open; again after every change to a source file
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Run single test files, never `npm test`: other agents share this machine, and the lead runs the whole suite alone. You build `canvas/dist/` to run browser tests and do not hand it over. A timed test (one that fails on a number of milliseconds) is judged by the lead alone, with nothing else running: if one fails for you beside other work, say so with its numbers and go on.

Write the thirteen tests R1 to R13 of the table, each under its exact name, in one `describe("the Explorer's rows")`. A session is `m.openText(lib, text, { name }, { now: clock() })` with `m = await loadWith('panels/explorerRows')`; the blank model is `canvas/state.json`.

The command: `node --test --test-timeout=120000 canvas/app/test/explorer-rows.test.mjs`. Against your worktree R1 passes (the four functions it reads are final) and R2 to R13 fail with `explorerRowsOf: step 9 builds it`. R13 reports its two times as lines of the runner's output (`t.diagnostic(...)`).

Done is: the thirteen tests exist under their names, each fails or passes as the list says, `npm run check` passes, and the file is committed.

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
