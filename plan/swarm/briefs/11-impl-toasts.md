# 11-impl-toasts: build the toasts

## The goal, and why

Step 11 of slice 1 gives Grasp's new page its tools, and a tool that a rule refuses says why in a toast: one sentence at the bottom of the window, for 8 seconds. You build the component that shows it. It is small, and it holds no rule: it shows `toolsOf(session).said`, which `core/commands.ts` sets and which is built already in your worktree. `App` renders `<Toasts session={session} />` already.

## Where to read, in this order

1. `plan/swarm/README.md`, then `plan/swarm/shared.md`, sections 3 and 7.
2. `plan/swarm/step-11.md`: section 1, items 5, 6 and 13; section 3, the rows on a toast; in section 4, tests 5, 12 and 13 of `tools.test.mjs`.
3. `canvas/app/src/shell/Toasts.tsx`: the comment over `Toasts` is the contract.
4. `canvas/app/src/core/commands.ts`: `Saying`, and `said` and `listen` in `Tools`.
5. `canvas/app/src/shell/App.tsx`, where it is rendered, and `canvas/app/src/shell/theme.ts` for `INK` and `WHITE`.
6. `node_modules/@mui/material/Snackbar/Snackbar.js` and `useSnackbar.js`, if you want to see why the contract names `disableWindowBlurListener`, `slotProps.content` and the `clickaway` reason.

## The files you own

- `canvas/app/src/shell/Toasts.tsx`

## What to build

The body of `Toasts`, to its comment: a Material UI `Snackbar` keyed by `said.n`, with `message={said.text}`, `autoHideDuration={TOAST_MS}`, `disableWindowBlurListener`, `transitionDuration={0}`, `anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}`, an `onClose` that ignores the reason `'clickaway'`, and `slotProps.content` carrying `data-testid="toast"`, `role="status"` and the ink and white of the theme. The component keeps in its own state which `n` it has let go, and renders nothing for that one.

Points that are easy to get wrong:
- With `session` null call nothing of the core and render nothing.
- `useSyncExternalStore(tools.listen, () => tools.said)`: `said` is the same object until something new is said.
- When the session changes, what the old session said is not shown.

## The tests and the commands

Run these from the root of your worktree, which the lead made for you from a commit that holds everything your task needs:

```sh
npm ci                # once; node_modules/ from package-lock.json
npm run build         # canvas/app/ -> canvas/dist/, which the browser tests open
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/tools.test.mjs
```

Build before every run of a browser test: the test opens `canvas/dist/index.html`. Do not run `npm test`: other agents share this machine, and the whole suite is the lead's to run. No test of this step is a timed test; if one of the suite's timed tests (`scale.test.mjs`, `instant.test.mjs`) fails beside your work, say so and do not judge it: a timing is valid only when the lead takes it with nothing else running. Do not commit `canvas/dist/`; the lead builds it.

Your tests are in `tools.test.mjs`: 5, 6, 7, 10, 12 and 13 read a toast. **They cannot pass yet**: a toast is said only when a plane gives a click to a tool, and that part is built after yours, by `11-impl-plane`, which then runs them. So build to the contract and check what can be checked now: `npm run build` and `npm run check` pass, and `canvas/app/test/shell.test.mjs` and `canvas/app/test/open.test.mjs` pass as before (with nothing said, the page must show and log nothing new).

"Done" is: the body is built to its comment; `npm run build` and `npm run check` pass; `shell.test.mjs` and `open.test.mjs` pass as before; no test file is changed.

## What to send back

- What you decided where the contract is silent, one line each.
- Anything in the contract that looks wrong, or that Material UI does otherwise than the contract says, with what you read or ran.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are rules of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
