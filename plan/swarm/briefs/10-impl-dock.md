# 10-impl-dock: a view's tab follows its name

You are one agent of a swarm that builds step 10 of slice 1 of Grasp, a SysML v2 design canvas: the Details panel of the new page. This brief is all you are given. It and the files it names are enough to do the task; where they are not, that is a reason to stop and say so.

## The goal, and why

Make a view's tab show its view's name at every moment: build the last item of `Dock`'s comment in `canvas/app/src/shell/Dock.tsx`, the one that begins "**Step 10**".

A view's tab is titled `viewTitle(view)`, its name and its kind, when the tab is made. With step 10 a view can be renamed, in the Details panel, and its tab must read the new name as it is typed, and the old one again after an Undo. Your worktree holds step 9's dock and step 10's Details, built.

## Where to read, in this order

1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `canvas/app/src/shell/Dock.tsx`, whole, as step 9 left it. The contract is the comment over `Dock`; your part is its last item: when the session's history tells of a change that touched a view (`told.touched.views` is not empty, or `told.views === null`), the panel of each view that has one gets its title again (`panel.api.setTitle(viewTitle(view))`).
3. `canvas/app/src/core/history.ts`: `History.listen` and `Told`.
4. `plan/swarm/step-10.md`, section 4, test 7 of `details.test.mjs`: `a view's name, on its tab and its row`.
5. `node_modules/dockview-core/dist/dockview-core.js`, the two methods named `setTitle` (search for `setTitle(title) {`): a panel's `setTitle` does nothing when the title is the one it has, and otherwise the default tab draws the new title and the tab's element takes it as its `aria-label`.

## The files you own

- `canvas/app/src/shell/Dock.tsx`. You add the listening and nothing else: no other item of the dock's contract changes.

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
npm run build && npm run check
node --test --test-timeout=120000 canvas/app/test/details.test.mjs
node --test --test-timeout=120000 canvas/app/test/shell.test.mjs
node --test --test-timeout=120000 canvas/app/test/selection.test.mjs
```

What to hold to:

- One listener on `session.history` for each session, taken away when another file is opened or the dock goes (an effect over `api` and `session`).
- Every view of `session.model.views` that has a panel (`api.getPanel(viewPanelId(view.id))`), in the editor or floating over it, gets `setTitle`. A view with no tab gets none, and nothing is added or removed.
- It runs at every keystroke of a name in Details, so it does nothing but that loop.

Done is: `npm run check` passes; `details.test.mjs` passes 9 of 9, `a view's name, on its tab and its row` among them; `shell.test.mjs` and `selection.test.mjs` pass as they did.

## What to send back

- The runner's summary for the three test files.
- Anything you settled where the contract was silent, and anything in it you found wrong.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
