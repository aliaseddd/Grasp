# 9-tests-core: the selection's tests, in Node

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is built in `canvas/app/` (React, React Flow for the planes, Dockview for the tabs and side panels, MUI X Tree View for the Explorer), beside an old page that must not change. Slice 1 of the rebuild is built in thirteen steps; this task is part of step 9, "The shared selection and the Explorer": one selection, kept for the open file, that every plane and every panel reads and sets, and the Explorer, a tree of the model at the left. The step's design is settled in `plan/swarm/step-9.md`, which was checked against the libraries' sources and a throwaway build. You make no design decision: where something you need is not said, stop and say what is missing.

You write tests from a list, before the code they check exists. Another agent writes that code at the same time, from the same contract, without seeing your tests; the only things the two of you share are the contract comments in the source files and section 3 of `plan/swarm/step-9.md`. So a test finds what it reads exactly as that section says, and asserts what the contract says, no more: where the contract is silent, the test is silent.

Your file tests the selection itself, `canvas/app/src/core/selection.ts`, in Node, with no browser: what `set`, `toggle`, `click` and `front` do, what the listeners are told, and what happens to what is picked when the model changes. Every other part of step 9, and steps 10 to 12, build on these promises, so each is pinned here.

## Where to read, in this order

1. `plan/swarm/README.md`, "Words" and "The rules every brief carries", and `plan/swarm/shared.md`, sections 1 and 6 (the selection, and what the tests share).
2. `canvas/app/src/core/selection.ts`, whole: its comment is the contract you test.
3. `plan/swarm/step-9.md`: section 1, "The selection"; section 3, "The Node tests"; section 4, the head of the section and the table "`canvas/app/test/selection-core.test.mjs`".
4. `canvas/app/test/core.mjs`, whole (`loadCore`, `lib`, `EXAMPLE`, `readText`, `plain`, `clock`), and `canvas/app/test/history.test.mjs`, its first 80 lines, for how a Node test of the core opens a session and makes an edit.
5. `canvas/app/src/core/history.ts`, lines 1 to 200: `Told`, and `History`'s `edit`, `undo` and `listen`.
6. `canvas/test/scale-model.mjs`, for `scaleState(5000)` (import it, as `canvas/app/test/viewStore.test.mjs` does). Nothing under `canvas/test` may change.

## The files you own

- `canvas/app/test/selection-core.test.mjs`

## The work, the tests and the commands

All from the root of your worktree, which the lead made for you from the commit that holds what you need:

```sh
npm ci                # node_modules/ from the lockfile, about 15 s; once
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open; again after every change to a source file
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Run single test files, never `npm test`: other agents share this machine, and the lead runs the whole suite alone. You build `canvas/dist/` to run browser tests and do not hand it over. A timed test (one that fails on a number of milliseconds) is judged by the lead alone, with nothing else running: if one fails for you beside other work, say so with its numbers and go on.

Write the eleven tests C1 to C11 of the table, each under its exact name, in one `describe('the selection')`. A session is `core.openText(lib, readText(EXAMPLE), { name: 'example.json' }, { now: clock() })`; the selection is `core.selectionOf(session)`. The model library runs in another realm, so compare its objects as JSON (`plain`); what the selection gives (`items`) belongs to this realm, and a `Picked` is compared by its `type` and `id`.

The command: `node --test --test-timeout=120000 canvas/app/test/selection-core.test.mjs`. Against your worktree every test fails, with `selectionOf: step 9 builds it`. C11 reports its time as a line of the runner's output (`t.diagnostic(...)`), as the timed tests of `canvas/app/test/adapter.test.mjs` do.

Done is: the eleven tests exist under their names, each fails as the list says, `npm run check` passes, and the file is committed.

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
