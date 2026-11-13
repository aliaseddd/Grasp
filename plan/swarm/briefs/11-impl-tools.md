# 11-impl-tools: build the Tools view

## The goal, and why

Step 11 of slice 1 gives Grasp's new page its tools. You build the Tools view: the side panel that lists the tools of the view whose tab is in front, takes a tool in hand at a click, shows which one is in hand, and puts it down at Escape. It holds no rule: the tool in hand is the session's, in `core/commands.ts`, which is built already in your worktree. The planes' part, which gives a click on a plane to the tool, is built after yours by another agent.

## Where to read, in this order

1. `plan/swarm/README.md`, then `plan/swarm/shared.md`, sections 1 to 3 and 7.
2. `plan/swarm/step-11.md`: sections 1 and 3, and in section 4 the table of `tools-panel.test.mjs`.
3. `canvas/app/src/panels/Tools.tsx`: the comment over `ToolsPanel` is the contract. `TOOLS_TEXT` and `TOOL_ROW` are complete.
4. `canvas/app/src/core/commands.ts`: `Tool`, `Tools`, `toolsOf`, `toolGroups`, `TOOL_TITLE`. `canvas/app/src/core/selection.ts`: `Selection.view` and `listen`. `canvas/app/src/core/adapter.ts`: `isDrawn`.
5. `canvas/app/src/panels/SidePanel.tsx`, `canvas/app/src/shell/dockContext.ts` (`useDock`), and `canvas/app/src/shell/TopBar.tsx` for how the bar's keys tell a text field and a modal dialog, and how a Material UI button is given a tooltip and colours from `shell/theme.ts`.

## The files you own

- `canvas/app/src/panels/Tools.tsx`
- `canvas/app/src/panels/tools.css`

## What to build

The body of `ToolsPanel`, to its comment: the five things it shows, a tool's button, and the Escape listener. Styles go in `sx` with the constants of `shell/theme.ts`, or in `panels/tools.css` imported by `Tools.tsx`, with class names of its own; name no colour anywhere else. Create `tools.css` only if you need it.

Points that are easy to get wrong:
- The panel is mounted before any file is open and stays mounted: read the session from `useDock()`, and subscribe again when it changes. With `session` null call neither `toolsOf` nor `selectionOf`.
- `useSyncExternalStore` needs a snapshot that is the same value until something changed: `selection.view` (a string or null), `tools.armed` (the same object while it is in hand), `tools.hint` (a string or null).
- The view's name and kind are read from `session.model.views` at each render, and `session.listen` makes the panel render when the model changes.
- The Tooltip takes `describeChild`, so that the button's name stays its label.
- The Escape listener is on the window, in the capture phase, and is taken away when the session changes.

## The tests and the commands

Run these from the root of your worktree, which the lead made for you from a commit that holds everything your task needs:

```sh
npm ci                # once; node_modules/ from package-lock.json
npm run build         # canvas/app/ -> canvas/dist/, which the browser tests open
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/tools-panel.test.mjs
```

Build before every run of a browser test: the test opens `canvas/dist/index.html`. Do not run `npm test`: other agents share this machine, and the whole suite is the lead's to run. No test of this step is a timed test; if one of the suite's timed tests (`scale.test.mjs`, `instant.test.mjs`) fails beside your work, say so and do not judge it: a timing is valid only when the lead takes it with nothing else running. Do not commit `canvas/dist/`; the lead builds it.

`tools-panel.test.mjs` is your test file: all 11 of its tests must pass. Run `canvas/app/test/shell.test.mjs` as well: it must pass as before (its strip and its side panels are around yours). `tools.test.mjs` and `palette.test.mjs` cannot pass yet: they need the planes' part.

"Done" is: `tools-panel.test.mjs` passes 11 of 11; `shell.test.mjs` passes as before; `npm run build` and `npm run check` pass; no test file is changed.

## What to send back

- What you decided where the contract is silent, one line each.
- Each test you could not make pass, with the reason.
- Anything in the contract or a test that looks wrong, with your evidence.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are rules of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
