# 11-impl-commands: build the core of the tools

## The goal, and why

Step 11 of slice 1 gives Grasp's new page its tools: a Tools view at the side, a right-click palette on each plane, and toasts. All their logic is in one file of the core, which runs in Node with no browser and no React: what a view kind's tools are, what each command makes and writes, the rule each refusal quotes, and the tool in hand as a state machine. You build that file. Three other agents build the Tools view, the toasts and the planes' part on top of your `Tools` interface without seeing your code, so its behaviour must be exactly what the contract says, in every case the contract names.

## Where to read, in this order

1. `plan/swarm/README.md`, then `plan/swarm/shared.md`, sections 1 and 2.
2. `plan/swarm/step-11.md`: sections 1 and 3, and in section 4 "The fixtures", "The table of uses" and the table of `commands.test.mjs`.
3. `canvas/app/src/core/commands.ts` whole: every comment is the contract. The words (`TOOL_TITLE`, `TOOL_HINT`, `BASE_NAME`, `NODE_HOME`, `ESCAPE_HINT`) and the types are complete; you fill in the six bodies that throw.
4. `canvas/app/src/core/selection.ts` (`Hit`, `Picked`, `Selection`: you call `selectionOf(session).set`, read `.view` and listen to it), `core/history.ts` to line 180 (`edit`, `Told`), `core/session.ts`, and in `core/adapter.ts` `isDrawn`, `project`, `Projection` (its `rects` and `nodes`) and `LOOK`.
5. What you port, on the old page, which you read and do not change: `canvas/src/core/page/tools.js` (`freeName`, `place`, `pairProblem`, `connectStep`, `createRel`), `canvas/src/core/page/drawing.js` (the graph renderer's `place`, `freshElement`, `blankField`), `canvas/src/core/page/layout.js` (`nearestBorder`, `containerAt`), and the wrappers around `place` at the end of `canvas/src/interconnection/page.js` and `canvas/src/behavior/page.js`.

## The files you own

- `canvas/app/src/core/commands.ts`

## What to build

The bodies of `toolGroups`, `toolHint`, `freeName`, `place`, `draw` and `toolsOf`, each to its comment. Keep every exported name, type and signature as it is: other tasks import them. Keep the file free of React and of the DOM; read the library through `libOf(session)` or a cast to `CommandsLibrary`, and add nothing to the global `SysMLModelLibrary`.

Points that are easy to get wrong:
- `place()` and `draw()` check first and write after: a refusal leaves the model and the undo steps untouched.
- One `history.edit()` for each thing made, with no key, returning the words.
- `toolsOf` keeps one object for a session (a `WeakMap`, as `storesOf` in `plane/viewStore.ts`), and adds one listener to the selection and one to the history, at the first call.
- The selection tells its listeners of every change, of `items` as of `view`: put a tool down only when `view` itself changed.
- The listeners are told once for each call that changed something, after the state is whole.

## The tests and the commands

Run these from the root of your worktree, which the lead made for you from a commit that holds everything your task needs:

```sh
npm ci                # once; node_modules/ from package-lock.json
npm run build         # canvas/app/ -> canvas/dist/, which the browser tests open
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/commands.test.mjs
```

Build before every run of a browser test: the test opens `canvas/dist/index.html`. Do not run `npm test`: other agents share this machine, and the whole suite is the lead's to run. No test of this step is a timed test; if one of the suite's timed tests (`scale.test.mjs`, `instant.test.mjs`) fails beside your work, say so and do not judge it: a timing is valid only when the lead takes it with nothing else running. Do not commit `canvas/dist/`; the lead builds it.

`commands.test.mjs` is your test file: all 26 of its tests must pass. They need step 9's `selectionOf`, which is built in your worktree. Run `canvas/app/test/history.test.mjs`, `viewStore.test.mjs` and `adapter.test.mjs` as well: they must pass as before.

"Done" is: `commands.test.mjs` passes 26 of 26; `npm run build` and `npm run check` pass; the three files named above pass as before; no test file is changed.

## What to send back

- What you decided where the contract is silent, one line each.
- Each test you could not make pass, with the reason.
- Anything in the contract, a signature or a test that looks wrong, with your evidence.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are rules of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
