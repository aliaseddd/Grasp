# 9-impl-selection: the selection

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is built in `canvas/app/` (React, React Flow for the planes, Dockview for the tabs and side panels, MUI X Tree View for the Explorer), beside an old page that must not change. Slice 1 of the rebuild is built in thirteen steps; this task is part of step 9, "The shared selection and the Explorer": one selection, kept for the open file, that every plane and every panel reads and sets, and the Explorer, a tree of the model at the left. The step's design is settled in `plan/swarm/step-9.md`, which was checked against the libraries' sources and a throwaway build. You make no design decision: where something you need is not said, stop and say what is missing.

You build `selectionOf(session)` in `canvas/app/src/core/selection.ts`: the one list of what is picked, kept for a session outside React. Its contract is the comment in that file, and it is shared: the planes, the Explorer and the dock of this step, Details (step 10), the tools (step 11) and Validation (step 12) are all written against it at the same time as you write it. So the exported types and signatures do not change, and every sentence of the comment holds.

## Where to read, in this order

1. `plan/swarm/README.md`, "Words" and "The rules every brief carries", and `plan/swarm/shared.md`, section 1.
2. `canvas/app/src/core/selection.ts`, whole.
3. `plan/swarm/step-9.md`: section 1, "The selection".
4. `canvas/app/src/core/history.ts`, lines 1 to 200 (`Told`, `History.listen`), and `canvas/app/src/core/session.ts`.
5. `canvas/app/src/plane/viewStore.ts`, `storesOf` and `viewStoreOf` at its end: how something is kept for a session, weakly, and how every listener is told even when one throws.
6. `canvas/app/test/selection-core.test.mjs`: the tests you make pass.

## The files you own

- `canvas/app/src/core/selection.ts`

## The work, the tests and the commands

All from the root of your worktree, which the lead made for you from the commit that holds what you need:

```sh
npm ci                # node_modules/ from the lockfile, about 15 s; once
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open; again after every change to a source file
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Run single test files, never `npm test`: other agents share this machine, and the lead runs the whole suite alone. You build `canvas/dist/` to run browser tests and do not hand it over. A timed test (one that fails on a number of milliseconds) is judged by the lead alone, with nothing else running: if one fails for you beside other work, say so with its numbers and go on.

Fill in the body of `selectionOf`. What the comment does not spell out and you must hold to:

- **No searching.** `has(type, id)` is asked for every node and line of a plane after every projection; it reads a set of keys kept beside `items`. Whether the model holds an id (`set`, `toggle`, `front`) is answered from an index of the model's element, relationship and view ids, made when first needed and thrown away when the history tells of a change with `told.structure`. Test C11 times it.
- **`items` is never changed in place.** Each change makes a new array; a reader that kept the old one still reads the old.
- **A change of the model** is heard through one listener on `session.history`, added by the first `selectionOf(session)`. Only `told.structure` matters to it.
- Nothing here imports React, the DOM or a library: the core runs in Node.

The commands: `node --test --test-timeout=120000 canvas/app/test/selection-core.test.mjs`, which must pass 11 of 11; then `npm run build` and `npm run check`. Also run `node --test --test-timeout=120000 canvas/app/test/history.test.mjs` and `canvas/app/test/viewStore.test.mjs`: the first passes as before; of the second, the tests that passed before still pass (some of its step 9 tests fail until the store is built, which is another task's).

Done is: `selection-core.test.mjs` passes whole, `npm run check` passes, and the file is committed.

## What to send back

- The files you own, in your worktree, committed there (add them by name; never `git add -A`; not `canvas/dist/`).
- The summary line of each test file the brief names (`# pass`, `# fail`), and for each failing test its name and first line.
- Each thing you decided because the contract was silent, with what you chose; and anything in a contract or a test that you found wrong, with the evidence. If you stopped on one, say where.
- Each place where your code departs from what `plan/swarm/step-9.md` says, with the reason.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings that are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
