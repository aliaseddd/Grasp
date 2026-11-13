# 11-impl-plane: build the planes' part of the tools, and the palette

## The goal, and why

Step 11 of slice 1 gives Grasp's new page its tools. The core (`core/commands.ts`), the Tools view and the toasts are built in your worktree. You build what joins them to the planes: a click on a plane goes to the tool in hand before it picks anything; the plane shows that a tool is in hand; and a right-click opens the palette, a menu of what can be made there. You are the last builder of the step, so you are also the one who sees the step's browser tests pass as a whole.

## Where to read, in this order

1. `plan/swarm/README.md`, then `plan/swarm/shared.md`, sections 1, 2 and 4.
2. `plan/swarm/step-11.md`: sections 1 and 3 whole. In section 3, "The plane's part" is your contract for `Plane.tsx`, word for word; section 4 has the tables of `tools.test.mjs` and `palette.test.mjs`; section 5 the shot.
3. `canvas/app/src/plane/Palette.tsx`: the comment over `Palette` is its contract. `canvas/app/src/plane/palette.css` holds the crosshair's rule already.
4. `canvas/app/src/plane/Plane.tsx` as step 9 left it: find `clicked(hit)`, and how the three click handlers make a `Hit`.
5. `canvas/app/src/core/commands.ts`: `Tools` whole (`armed`, `first`, `click`, `offers`, `choose`, `listen`). `canvas/app/src/core/selection.ts`: `Hit`.
6. In `node_modules/@mui/material`: `Menu/Menu.js` (where `slotProps.list` and `slotProps.root` go) and, in `node_modules/@xyflow/react/dist/esm/types/component-props.d.ts`, `onPaneContextMenu`, `onNodeContextMenu` and `onEdgeContextMenu`.

## The files you own

- `canvas/app/src/plane/Plane.tsx`
- `canvas/app/src/plane/viewStore.ts`
- `canvas/app/src/plane/Palette.tsx`
- `canvas/app/src/plane/palette.css`

## What to build

- In `Plane.tsx`: everything "The plane's part" lists. Import `Palette` from `./Palette`; that import brings `palette.css` into the page.
- In `Palette.tsx`: the body of `Palette`, to its comment.
- In `viewStore.ts`: nothing. You own it so that no other task changes it under you.

Points that are easy to get wrong:
- Every prop of `<ReactFlow>` stays the same object or function at each render (`Plane`'s comment says why): make the three context-menu handlers with `useCallback`, or outside the render.
- `screenToFlowPosition` comes from `useReactFlow()`, which works only inside `<ReactFlow>`: step 9's click handlers show where.
- A Material UI Menu takes its children as one flat array, never a Fragment.
- The menu is a portal, and React hands its events on to the plane's root: the `onContextMenu` of the menu's root must stop the event, or the plane opens the palette again.
- `onClose()` first, then `choose(...)`.
- The plane must render no more than before on a pan or a drag step: subscribe to the tools with a snapshot that changes only when `armed` or `first` does.

## The tests and the commands

Run these from the root of your worktree, which the lead made for you from a commit that holds everything your task needs:

```sh
npm ci                # once; node_modules/ from package-lock.json
npm run build         # canvas/app/ -> canvas/dist/, which the browser tests open
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/tools.test.mjs
```

Build before every run of a browser test: the test opens `canvas/dist/index.html`. Do not run `npm test`: other agents share this machine, and the whole suite is the lead's to run. No test of this step is a timed test; if one of the suite's timed tests (`scale.test.mjs`, `instant.test.mjs`) fails beside your work, say so and do not judge it: a timing is valid only when the lead takes it with nothing else running. Do not commit `canvas/dist/`; the lead builds it.

Your test files are `tools.test.mjs` (14 tests) and `palette.test.mjs` (12): all must pass. Two of `tools.test.mjs`, tests 8 and 14, type into Details, which step 10 built in your worktree. Then run, one file at a time, `tools-panel.test.mjs`, `selection.test.mjs`, `plane.test.mjs`, `move.test.mjs`, `gestures.test.mjs` and `keys.test.mjs`: they must pass as before. Then `npm run shots -- palette` must write `canvas/app/shots/palette.png`; look at it against the list in section 5 of the step's file.

When a test fails because of a file you do not own (`commands.ts`, `Tools.tsx`, `Toasts.tsx`, a test file), do not change that file and do not work around it: find out what it does otherwise than its contract says, and send that back.

"Done" is: `tools.test.mjs` and `palette.test.mjs` pass; the six files named above pass as before; `npm run build` and `npm run check` pass; `npm run shots -- palette` writes the image; no test file is changed.

## What to send back

- What you decided where the contract is silent, one line each.
- Each test you could not make pass, and whose file the fault is in, with your evidence.
- What you saw in `palette.png` against its list.
- Anything in the contract or a test that looks wrong.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are rules of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
