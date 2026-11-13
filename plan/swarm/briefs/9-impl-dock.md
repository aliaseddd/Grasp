# 9-impl-dock: the dock: a view's tab from its row, and the view in front

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is built in `canvas/app/` (React, React Flow for the planes, Dockview for the tabs and side panels, MUI X Tree View for the Explorer), beside an old page that must not change. Slice 1 of the rebuild is built in thirteen steps; this task is part of step 9, "The shared selection and the Explorer": one selection, kept for the open file, that every plane and every panel reads and sets, and the Explorer, a tree of the model at the left. The step's design is settled in `plan/swarm/step-9.md`, which was checked against the libraries' sources and a throwaway build. You make no design decision: where something you need is not said, stop and say what is missing.

You build the dock's part, the last of the step's four: `showView(viewId)`, which the Explorer calls for a view's row, and the telling of which view is in front, `selectionOf(session).front(...)`, which the Explorer shows on a view's row now and the Tools view reads at step 11. And `window.Grasp.selection`, for looking. The selection, the planes and the Explorer are built already in your worktree, so when you are done every test of step 9 passes.

## Where to read, in this order

1. `plan/swarm/README.md`, "Words" and "The rules every brief carries", and `plan/swarm/shared.md`, sections 1, 3 and 5.
2. `canvas/app/src/shell/Dock.tsx`, whole: its comment's entry "Step 9" is your contract, and `addViews` is what `showView` follows for a view with no tab. `canvas/app/src/shell/dockContext.ts`: `DockState.showView`. `canvas/app/src/shell/App.tsx`: its comment's entry "Step 9", and `GraspGlobal`.
3. `canvas/app/src/core/selection.ts`: `front`, `view`.
4. `plan/swarm/step-9.md`: section 1, "The dock", with its table of what Dockview does; section 3, "The dock"; section 4, the table of `selection.test.mjs`.
5. Dockview's own source, `node_modules/dockview-core/dist/package/main.esm.mjs`: `fireActivePanelChange` (line 19113), `doSetGroupActive` and `doSetGroupAndPanelActive` (19477 on), and where `_onDidActivePanelChange` is made with `replay: true` (16910): a new listener is handed the last event at once.
6. `canvas/app/test/selection.test.mjs`: the tests you make pass, S5 and S7 above all.

## The files you own

- `canvas/app/src/shell/Dock.tsx`
- `canvas/app/src/shell/App.tsx`

## The work, the tests and the commands

All from the root of your worktree, which the lead made for you from the commit that holds what you need:

```sh
npm ci                # node_modules/ from the lockfile, about 15 s; once
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open; again after every change to a source file
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Run single test files, never `npm test`: other agents share this machine, and the lead runs the whole suite alone. You build `canvas/dist/` to run browser tests and do not hand it over. A timed test (one that fails on a number of milliseconds) is judged by the lead alone, with nothing else running: if one fails for you beside other work, say so with its numbers and go on.

**In `Dock.tsx`:**

- `showView` becomes a function of the component (`useCallback` on `api` and `session`) in place of the module-level one that throws, and goes into the context value as before. A view of the open file that has a panel: `panel.api.setActive()`. One that has none: its tab is added as `addViews` adds a missing view (give `addViews` the one view to add), and it is in front. Anything else: nothing. It does not touch the selection, and it does not move the keyboard's focus.
- The view in front: one effect on `api` and `session`. It holds the view that was in front (it starts from `selection.view`), and a function that applies section 1's rule to `api.activePanel` and calls `selection.front(...)`. That function runs when the effect starts, on `api.onDidActivePanelChange` and on `api.onDidRemovePanel`; the effect's cleanup disposes both. A view's panel is this session's when its id begins `view:` and its `params.session` is the session (`ViewParams`).
- Nothing else of the dock changes: the sides, the record, the card and the tabs' ids are as they are.

**In `App.tsx`:** `GraspGlobal` gains `readonly selection: Selection | null`, and the effect that sets `window.Grasp` gives it `selectionOf(session)`, or null with no file.

The commands, after `npm run build`: `node --test --test-timeout=120000 canvas/app/test/selection.test.mjs` (10 of 10). Then, since you are the last implementer of the step, each of these, one at a time: `selection-core.test.mjs`, `viewStore.test.mjs`, `explorer-rows.test.mjs`, `picking.test.mjs`, `gestures.test.mjs`, `explorer.test.mjs`, `shell.test.mjs`, `open.test.mjs`, `plane.test.mjs`, `move.test.mjs`, `keys.test.mjs`, `instant.test.mjs`. All pass. Then `npm run check`.

If a test of `selection.test.mjs` fails for a reason that lies in a file you do not own (the plane, the store, the Explorer, the selection), do not change that file: say which test, what the page does, and where you think the fault is.

Done is: `selection.test.mjs` passes whole, the twelve others pass, `npm run check` passes, and your two files are committed.

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
