# 8-impl-minimap: a plane's minimap of our own

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is being built in steps (`plan/slice-1.md`). Each view of a model is drawn on a plane, with a minimap at its bottom right. Today that minimap is React Flow's `MiniMap`, which keeps one subscription per node and redraws every rectangle at each step of a pan: at 5,000 elements that is 5 to 8 ms of every step, and the limit for a step is 16 ms. You draw one of our own, which shows the same picture as one path and changes only a mask when the plane pans.

## Read first, in this order

1. `canvas/app/src/plane/MiniMap.tsx`: the comment of `PlaneMiniMap` is the contract of what you build, down to the viewBox's formula and each path's `d`.
2. `plan/swarm/step-8.md`: in section 2, change 3; section 4; and in section 5 the list for `minimap.test.mjs`.
3. `canvas/app/src/plane/Plane.tsx`: where `PlaneMiniMap` is rendered (inside `<ReactFlow>`, with the view's store), and its contract. `canvas/app/src/plane/viewStore.ts`: `ViewStore.subscribe`, `getSnapshot`, `ViewSnapshot`. `canvas/app/src/core/adapter.ts`: `PlaneNode` (a node's `position` is from its parent's corner; parents come first), `MINIMAP`.
4. `canvas/app/src/shell/theme.ts`: `cssVariables` (`--grasp-line-strong`, `--grasp-minimap-mask`, `--grasp-white`). `canvas/app/src/app.css`, the planes' part, for how the planes' rules are written.
5. `canvas/app/test/minimap.test.mjs`, the tests you must pass.

## The files you own

`canvas/app/src/plane/MiniMap.tsx` and `canvas/app/src/plane/minimap.css` (new; `MiniMap.tsx` imports it with `import './minimap.css';`).

## What to do

Replace the body of `PlaneMiniMap` with the minimap its comment describes, and write its rules in `minimap.css`. React Flow's `Panel` and `useStore` come from `@xyflow/react`, which the page already holds whole. `Plane.tsx` does not change: it renders `<PlaneMiniMap store={store} />` already, only while the plane has room for it.

Keep the component's cost as the comment says: the nodes' path is made again only when the snapshot's `nodes` array is another array (`useMemo` on it), and the selector given to React Flow's `useStore` returns a string, so that a store write that leaves the window where it was renders nothing.

You are done when:

- `npm run build` and `npm run check` pass;
- `node --test --test-timeout=120000 canvas/app/test/minimap.test.mjs` passes, all eleven;
- `node --test --test-timeout=120000 canvas/app/test/small.test.mjs canvas/app/test/plane.test.mjs canvas/app/test/open.test.mjs` passes as before (they find the minimap by `.react-flow__minimap` and hold that the page logs nothing).

Each change of step 8 is kept only if the numbers move: the lead measures a pan step with and without this minimap, alone. If you can, run `node --test --test-timeout=120000 canvas/app/test/scale.test.mjs` and send back the figures it reports for a pan step of each view.

## What to send back

1. Which tests pass, and any figures the scale tests reported.
2. Whatever the contract left open and how you settled it, each in one line.
3. Anything in the contract or the tests that looks wrong, with why.

## Where you work, and the commands

You work in a git worktree the lead made for you, at a commit that holds the scaffold and the work of the tasks this one needs. Run every command from the worktree's root.

```sh
npm ci                # once: node_modules/ from package-lock.json, about 15 s
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open
npm run check         # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Build before you run a browser test: it opens `canvas/dist/index.html` from `file://`. Do not hand `canvas/dist/` over: the lead builds it. Other agents share this machine, so a timed test may fail for you while it would pass alone: say so in what you send back, and the lead judges it alone. Commit your owned files in the worktree, added by name (never `git add -A`), so the lead can read your diff.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

Two more things, of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** If you find a signature, a contract or a test wrong, stop and say what you found and why. Do not change a file you do not own, and do not bend your own work to fit.
