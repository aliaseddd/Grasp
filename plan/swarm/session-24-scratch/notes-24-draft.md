
## Session 24, November 13, 2026: steps 8 to 13 scaffolded at once; nothing of them built

On `claude/vigilant-volta-ollybb`, from `f608a0e` (main, with step 7 merged by pull request #49). Damon's word: design and create the scaffold for all of steps 8 to 13 now, working as several instances of Claude; start no Sonnet agent and write no step's implementation; a later run gives the scaffold to a swarm of Sonnet instances, which fill it in. `plan/status.json` keeps `"step": 7` and its checks, and gained one key, `"swarm"`, which points to `plan/swarm/tasks.json`.

The baseline, in this container (Node 22.23.4): `npm ci` 11 s; `npm run check` passes in 3 s; `npm test` gives 215 tests, 211 pass, 0 fail, 4 todo, in 48 s.

### The change of method

Until now each step went as session 17's "How each step is built" has it: the outline of one step, its commit, then tests, implementers, review, checks, screenshot and the step's commit, and only then the next step's outline. **For steps 8 to 13, stages 1 and 2 of that list (the outline, and the outline's commit) are done for every step at once, by this session.** Stages 3 to 8 remain for each step, and `plan/swarm/README.md` says how a later session runs them with many agents side by side: the task kinds, the fields of `plan/swarm/tasks.json`, how a worktree is made, the order in which steps are closed, and the rules every brief carries.

What the scaffold is, and where:

- **Skeletons, in the code.** Each new file a step creates exists under `canvas/app/src/`, with its types, its signatures, and each contract as a comment over a body that throws `"<name>: step N builds it"`. A file the page already loads holds what the page shows today, and its step replaces that.
- **`plan/swarm/shared.md`**: the contracts more than one step builds on, and which task owns each file that several steps touch.
- **`plan/swarm/step-8.md` to `step-12.md`**: each step's settled design, the contract between tests and code, the test lists (each test's exact name, what it does and asserts, the message it fails with before its code exists, and the breakage that must fail it afterwards), and each screenshot's scenario with its reviewer's list.
- **`plan/swarm/briefs/`**: one brief per task. **`plan/swarm/tasks.json`**: every task, with what it owns, what it needs, and the model and effort it runs at.

How it was made, in this order: the baseline; step 8's measurements, by the lead, with nothing else running; the shared contracts, by the lead, committed and pushed (`bddd5d2`); one instance of Claude for each of steps 9, 10, 11 and 12, at once, each in a worktree made by hand from `bddd5d2`, while the lead wrote step 8's scaffold and step 13's brief; each instance's diff read against the shared contracts and its files taken in; one fresh instance per step as a reader, given only that step's briefs and told to act as the Sonnet agent would and to list every question it would have to ask and every decision it would have to make; the scaffold fixed until those lists were empty; the checks, alone. Every instance ran on the session's own model at high effort. No Sonnet agent was started.

### Step 8's measurements, taken alone, before anything was changed

Each was taken with no other instance and no other test running. `plan/swarm/step-8.md`, section 1, holds the full table; these are the commands and the figures the design rests on.

- **The scale tests themselves, on the page as step 7 left it**, `node --test --test-timeout=120000 canvas/app/test/scale.test.mjs`: the model opens in 516.5 ms; a drag step takes 1.9 ms when it starts a drag and 35.5 ms when it follows one (six samples from 52.4 falling to 23.9 as the code warms); a pan step of the fitted `definitions` 21.9 and 17.8 ms, of `deployment` 20.8 and 18.9, of `workflows` 29.9 and 30.0. So "a 5,000-element model opens" already passes, and the drag and the pan limits fail.
- **The same inside `npm test`**, its files side by side: opens in 631.9 ms; drag 30.4 ms; pan 19.4, 13.7 and 39.8 ms.
- **The same with the files one at a time**, `node --test --test-concurrency=1 --test-timeout=120000 canvas/app/test/*.test.mjs`: the suite takes 115 s where it takes 48 s; drag 33.4 ms; pan 13.5, 12.6 and 27.9 ms.
- **A step split into script and frame, for each view, with and without lines and the minimap.** A scratch script (not in the repository) opened the 5,000-element model in a scratch build of the page that carried switches read from `window`: the minimap left out, the lines left out (always, or while far), and a step of a drag that only moves the dragged node. It timed 15 steps that follow the first of a gesture, with `moveTiming` of `helpers.mjs`, after warming each view with pans. By the median, in ms, total = script + frame:

  | | `definitions` (1,544 nodes, 384 lines, fitted at 5.7%) | `deployment` (1,344, 384, 6.4%) | `workflows` (2,112, 1,536, 4.3%) |
  |---|---|---|---|
  | A pan step, fitted, as built | 14.3 = 8.2 + 6.3 | 13.9 = 7.0 + 6.0 | 26.8 = 14.3 + 12.5 |
  | without the minimap | 9.0 = 4.0 + 4.9 | 8.0 = 4.4 + 3.7 | 19.3 = 8.7 + 10.0 |
  | without lines while far | 11.4 = 6.3 + 4.9 | 9.2 = 4.9 + 4.3 | 17.7 = 8.1 + 8.1 |
  | without both | 8.1 = 3.9 + 4.4 | 6.2 = 3.0 + 3.2 | 10.8 = 4.5 + 6.2 |
  | A drag step at 100%, as built | 21.7 = 17.1 + 3.4 | 17.8 = 15.0 + 2.9 | 21.9 = 18.6 + 3.0 |
  | without the minimap | 16.8 = 14.9 + 1.9 | 17.2 = 13.8 + 2.2 | 19.2 = 17.1 + 2.0 |
  | without the minimap and without any line | 15.4 | 13.7 | 13.8 |
  | a step that only moves the dragged node | 6.3 = 4.0 + 2.1 | 6.3 = 3.7 + 2.0 | 6.5 = 4.2 + 2.1 |

  Inside the store at a step of a drag: `placesFor` 1.4 to 1.5 ms, `project` 9.3 to 10.7 ms. In Node (a scratch script over `loadCore()`, 300 steps of `definitions`): `placesFor` 1.9 ms, `project` 14.6 ms a step; a profile spreads `project`'s time over `build()` itself, the library's lookups and the comparing of each node with the one before.
- **Two prototypes on the scratch build**, to know what the design can reach: a minimap of our own as one path under a viewBox that does not follow the window, with no lines while far, gives a pan step of 9.1, 7.7 and 12.2 ms; the scale tests themselves on that build, with the drag's step at its lower bound, three runs alone: drag 6.2, 6.4, 6.1 ms; pan of `workflows` 12.8, 12.1, 13.0 ms (starting 13.3, 12.5, 14.5). The same test file while a whole `npm test` ran beside it: pan of `workflows` 20.5 and 16.9 ms (starting 24.5 and 22.6).
- **Where the plane's commit falls** (the proof step 8's text asks for), a probe on the page as built: all 20 changes of the viewport's `style` in 4 pans of 5 moves, and all 15 changes of the dragged node's `style` in 3 drags of 5 moves, came after their `pointermove` and before the animation callbacks of the frame that handled it. The node's `class` changes at the press and at the release. So `moveTiming`'s measure holds the commit and is not widened. Session 17 expected React Flow's `dragging` class to fall outside on a drag's first step; since step 7's `nodeDragThreshold={0}` it is set at the press.

What the measurements point at is in `step-8.md`, section 2, in the plan's order: a gesture's step worked out from what its start read (`projectStep`); no lines for a view of more than 300 nodes while it is far (`linesDrawn`); a minimap of our own; and the test files run one at a time, because the pan limit that holds alone fails beside the other files.

**Tried and dropped, on the scratch build:** the viewport promoted to a layer while it pans (`will-change: transform`: a pan step of 21 to 51 ms); `contain: layout style paint` on every node (15.4 ms for `workflows` against 12.2); a minimap of our own whose viewBox follows the window as React Flow's does (26.6 ms for `workflows`, no better than React Flow's: every rectangle is drawn again at each step).

### What is shaped otherwise than the plan names it, and why

**Existing files reshaped so that each step has its own place.** Steps 8 to 12 would each have changed `Dock.tsx`, `App.tsx`, `Plane.tsx`, `app.css`, `helpers.mjs` and `shots.mjs`; built side by side they cannot. So, with the page behaving as it did (215 tests, 211 pass, 4 todo, before and after):

- **Each side panel's body is its plan's own file now**, `panels/Explorer.tsx`, `Details.tsx`, `Tools.tsx`, `Validation.tsx`, holding the empty state the shell has shown since step 5, inside a frame they share, `panels/SidePanel.tsx`. `shell/Toasts.tsx` and `shell/About.tsx` exist likewise and render nothing; `App` renders both and holds whether About is open. A step builds its panel by replacing the body of its own file. What a panel reads of the dock is in `shell/dockContext.ts` (`useDock()`), apart from `Dock.tsx`, so that a panel's file does not import the dock, which imports the panels.
- **Step 8's three changes have seams the store and the plane call already**: `projectStep` (today it calls `project`), `linesDrawn` (today always true) and `LARGE_VIEW` (step 6's `CULL_OVER`, moved) in `core/adapter.ts`, and `plane/MiniMap.tsx` (today React Flow's minimap). Step 8 changes neither `viewStore.ts` nor `Plane.tsx`.
- **A step's styles go in a stylesheet of its own**, beside the component that imports it; no task changes `app.css`.
- **Each new shot is a file of its own**, `canvas/app/test/shots/scale.mjs`, `palette.mjs`, `about.mjs`. A shot marked `pending: true` is left out by `npm run shots` and runs when named; a step's test task writes `take()`, and the step's closing takes `pending` off.
- **`helpers.mjs` holds what several test files need** (the side panels, the Explorer's rows, Details's fields and words, the bar's Undo and Redo), and `core.mjs` a general loader, `loadWith(...files)`.
- **`core/index.ts` exports the four new core files already**, and `canvas/app/build.mjs` hands the application the libraries' names, versions and licences as the text `__GRASP_LIBRARIES__`, for step 12's About. Nothing reads either yet, so `canvas/dist/` is the page it was.

**Files the plan does not name**, each with the reason its step's file gives:

| File | Step | Why |
|---|---|---|
| `plane/MiniMap.tsx`, `plane/minimap.css`; `test/step.test.mjs`, `test/minimap.test.mjs` | 8 | The minimap of our own; the Node tests of a gesture's step, and the minimap's browser tests, each a file of its own so that no two writers share one |
| `panels/explorerRows.ts`, `panels/explorer.css`, `plane/marquee.css`; four test files beside `selection.test.mjs` | 9 | The Explorer's rows without React, since at step 9 nothing in the page can change the model's structure or a name, so "builds its rows again" and "relabels" can only be tested in Node |
| `panels/details.css`; `test/fieldHooks.test.mjs`, `test/details-fields.test.mjs` | 10 | `fieldHooks.ts` holds the form as plain data and the one change function, so every field of every item of the ten files is walked in Node; the page walks one item of each kind |
| `plane/palette.css`; `test/commands.test.mjs`, `test/tools-panel.test.mjs`, `test/palette.test.mjs` | 11 | The commands and the tool in hand are a state machine in the core, tested in Node |
| `core/checks.ts`; `test/checks.test.mjs`, `test/probe.test.mjs` | 12 | The checks are a store kept for a session, so the 0.8 s, the undo and the hidden panel are tested in Node with a stand-in timer |
| `plan/swarm/` | 8 to 13 | The scaffold |

### What departs from the plan's letter

None of these changes `plan/slice-1.md` or `plan/direction.md`. Each is in its step's file with its reason; they are gathered here because criterion 8 asks that a stranger find them.

- **Step 8: `npm test` is to run its test files one at a time** (`--test-concurrency=1`), from step 8's closing on. Step 2 of the plan gives the command without that flag. The pan limit holds alone and fails beside the other files, each of which runs a Chromium that draws in software on four processors. The suite then takes about 115 s where it took 48 s.
- **Step 8: lines are left out only for a view of more than 300 nodes while it is far**, where the plan's tuning list says "then no lines" below 25%. A small view keeps its lines at any zoom, and the tests of steps 6 and 7 that hold "far or near, every line stays drawn" stand.
- **Step 8: a minimap of our own** is beyond the plan's tuning list. Session 17 kept it in reserve and session 20's review measured that it is needed.
- **Step 9: the row of the view in front is marked in the Explorer** (`aria-current`, its name in teal). The plan does not ask for it. It is the one place where "which view is in front" shows before step 11's Tools view, and so how the dock's part of step 9 is tested.
- **Step 10: radio buttons stand in the order of the row's `values`** (`in, inout, out`), not in the old markup's. The old hooks' `done` is not ported.
- **Step 11: "`M.validate` finds nothing new" cannot hold for three tools.** A new interface def has no ends, a new initial node has no transition, and a new flow between ports has no item: the library's own checks say so of each the moment it is made. The tests ask for exactly that one sentence and nothing else new.
- **Step 11: the palette offers the tools of the view kind's row that the rules allow at the point**, where the plan says "the element kinds the view admits and the box can hold": one table feeds the Tools view and the palette, as the plan's own first sentence has it. A sequence view and a geometry view list no tools, since no plane draws them in slice 1.
- **Step 11: a drag with a tool in hand is still a drag**, where the old page made boxes immovable while a tool was in hand.
- **Step 12: the Validation panel checks only while it is shown**, 0.8 s after the last change, and at once after an undo, a redo, a file opened, and when it is shown after changes it did not see. The old page checked after every pause because it drew badges, which are slice 2's. A check takes about 37 ms at 5,000 elements, and step 10's keystroke limit there is 50 ms.
- **Step 12: About's timing loop is Grasp's own**, since the probe page of session 13 is not in the repository: 50 million steps of x = (x × 31 + i) xor (x >>> 7), as a WebAssembly module of 77 bytes written out in `core/probe.ts` and the same in JavaScript.
- **Step 13: `shell.png` and `example.png` are retaken and rated at step 12's closing**, as criterion 4 asks; step 13 retakes `shell.png` only if a document's change touched what it shows.

### Noticed, outside this run's work

- **The bar's keys take every `<input>` for a text field** (`shell/TopBar.tsx`, step 7). Until step 10 the page has no checkbox. Step 10's scaffold makes it exact, as its own task, `10-impl-bar`, with a test.
- **A press of exactly 4 px both moves and clicks** at 100% zoom or closer: d3 treats a press as a click up to 4 px inclusive, while the store starts a gesture at 4 px times the zoom. Step 9's instance found it while reading React Flow's source. Nothing was changed; it is step 7's, and no task of the scaffold holds it.

### What each step's instance verified by running

The instances were told to make no claim about code they had not opened. Beyond reading, each built or ran something throwaway, outside the repository, and its step's file gives the figures:

- **Step 9**: the whole step once as a throwaway build, with the existing tests run against it. Every existing test passed but the three the step restates (`gestures.test.mjs`, one; `viewStore.test.mjs`, two). `shell.test.mjs` failed one test until the Explorer's tree was kept from widening its panel (`contain: inline-size` in `explorer.css`): a tree of rows that do not wrap had widened the Explorer's root from 312 to 330 px. With the tree, the 5,000-element model is painted 620 to 700 ms after the file is given; a rename there takes about 11 ms to the end of React's work.
- **Step 10**: a throwaway reading of `fieldHooks.ts`'s contract over the ten files: 262 forms and 790 changes, each undone and redone, with no write outside `edit()`. At 5,000 elements, in Node: `formOf` 2 to 3.4 ms, `changeField` 2.5 ms, a picker's options 3.5 to 4.3 ms inside a reading of the model and 400 ms outside one.
- **Step 11**: all 39 uses of the table of tools through a throwaway port of the old page's `place` and `createRel` over the real core: words, names, places, `M.validate` before and after, undo back to the file's JSON.
- **Step 12**: the library's two checks on the ten files and on the changed models its tests name; their cost at 5,000 elements (through the history's Proxy: `validate` 28.9 ms, `validateSpec` 12.1 ms, both in one reading 37.4 ms); the WebAssembly module of the timing loop (86 to 96 ms against 350 to 380 ms in JavaScript, in this container's Chromium 153); a throwaway build of both panels.

### The method's log

Nine instances beside the lead, each on the session's model at high effort; none was a Sonnet agent. The harness's figures:

| Instance | Time | Tool calls |
|---|---|---|
| Step 9's scaffold | 51.8 min | 124 |
| Step 10's scaffold | 36.4 min | 82 |
| Step 11's scaffold | 30.9 min | 72 |
| Step 12's scaffold | 38.2 min | 85 |
| Step 8's reader | 17.1 min | 50 |
