import json, os
OUT = 'plan/swarm/briefs'
RULES = '''## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are rules of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
'''
COMMANDS = '''Run these from the root of your worktree, which the lead made for you from a commit that holds everything your task needs:

```sh
npm ci                # once; node_modules/ from package-lock.json
npm run build         # canvas/app/ -> canvas/dist/, which the browser tests open
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/{file}
```

Build before every run of a browser test: the test opens `canvas/dist/index.html`. Do not run `npm test`: other agents share this machine, and the whole suite is the lead's to run. No test of this step is a timed test; if one of the suite's timed tests (`scale.test.mjs`, `instant.test.mjs`) fails beside your work, say so and do not judge it: a timing is valid only when the lead takes it with nothing else running. Do not commit `canvas/dist/`; the lead builds it.
'''
def tests_brief(tid, file, what, extra_read, extra, shot=False):
    owns = [f'canvas/app/test/{file}'] + (['canvas/app/test/shots/palette.mjs'] if shot else [])
    node = file == 'commands.test.mjs'
    return tid, owns, f'''# {tid}: write `{file}`

## The goal, and why

Grasp's new page is built in steps, and step 11 of slice 1 gives it its tools: a Tools view at the side, a right-click palette on each plane, and toasts that say why a rule refused a click. You write the tests of {what}, **before the code they check exists**. An implementer you never meet builds that code from the same contract, so the two of you agree only through what `plan/swarm/step-11.md` says. Your tests are how the lead sees that the code is right, so each must fail when its thing is missing or broken, and say what is missing in the page's own terms.

You write tests only. You build nothing under `canvas/app/src/`.

## Where to read, in this order

1. `plan/swarm/README.md`: what a swarm task is.
2. `plan/swarm/shared.md`, section 6, "What the tests share": the helpers and what every test keeps to.
3. `plan/swarm/step-11.md`: section 1 (what the step does), section 3 (every test id, word and number: use them exactly), and in section 4 "The fixtures", "The table of uses" and the table headed `canvas/app/test/{file}`, which is your list.{' Section 5 is the shot you also write.' if shot else ''}
4. {extra_read}
5. `canvas/app/src/core/commands.ts`: the contract of the tools, as comments. Read `Tools` whole.

## The files you own

{chr(10).join('- `' + o + '`' for o in owns)}

## What to write

One `test()` for each row of your table, **under the row's exact name**, in the row's order, inside one `describe`. A row gives what the test does, what it asserts, the first line it must fail with today ("Before") and a breakage that a later task makes to see it fail; you need the first three. {extra}

- A failure's message says what the page lacks, in a sentence, as the "Before" column does. Write the messages so that today's failures read as that column.
- {'The model library runs in another realm: compare its objects through `plain()` of `test/core.mjs`, never with `deepEqual` directly.' if node else 'Find what the application renders by its `data-testid`, and what a library renders by its roles and names. Wait with `soon(page, check, missing)`; never sleep for a fixed time. End every test with `finish(opened)`. The four ids inside the Tools view (`tool`, `tool-list`, `tools-view`, `tool-hint`) are not in `TESTIDS`: write them as section 3 gives them.'}
- A helper only this file needs is written in this file. Change nothing in `helpers.mjs` or `core.mjs`.
- Where the list leaves something open, settle it by the contract in `commands.ts` and in section 3, and say in your report what you settled.

## The tests and the commands

{COMMANDS.replace('{file}', file)}
Run your file against the tree as it is. Nothing of step 11 is built, so **every test must fail**, and the first line of each failure must be the one its row gives under "Before"{' (the functions throw `"<name>: step 11 builds it"`)' if node else ''}. A test that passes today, or fails with another line (a mistake in the test, a helper that throws), is not done.{' Then `npm run shots -- palette` must fail with a sentence that says the palette did not open, not with a stack trace.' if shot else ''}

"Done" is: the file holds every row's test under its name; each fails today with its row's line; `npm run check` passes.

## What to send back

- The first line of each test's failure today, test by test.
- Each test that does not fail with its row's line, and why.
- What the list left open and how you settled it.
- Anything in the contract or the list that looks wrong, with your evidence. Do not bend a test to fit it.

{RULES}'''

def impl_brief(tid, owns, title, goal, read, build, tests, done, back):
    return tid, owns, f'''# {tid}: {title}

## The goal, and why

{goal}

## Where to read, in this order

{read}

## The files you own

{chr(10).join('- `' + o + '`' for o in owns)}

## What to build

{build}

## The tests and the commands

{tests}

"Done" is: {done}

## What to send back

{back}

{RULES}'''

B = []
B.append(tests_brief('11-tests-commands', 'commands.test.mjs', 'the core of the tools, `canvas/app/src/core/commands.ts`, which run in Node with no browser',
  '`canvas/app/test/core.mjs` whole (`loadCore`, `lib`, `readText`, `plain`, `clock`, `EXAMPLE`, `FIXTURES`), and `canvas/app/test/viewStore.test.mjs` to line 60 as the model of a Node test that opens a session.',
  'Call `core.toolsOf(session)`, or the function a row names, before `core.selectionOf(session)`: today both throw, and the row\'s line is step 11\'s. Where a row gives numbers (a place, a name), assert exactly those: they were worked out by hand and by a port of the old page\'s rules.'))
B.append(tests_brief('11-tests-panel', 'tools-panel.test.mjs', 'the Tools view by itself, in the browser, with no click on a plane',
  '`canvas/app/test/helpers.mjs` whole, and `canvas/app/test/shell.test.mjs` for how a browser test file is laid out (`launch`, `closePages`, `finish`) and how a tab is closed by Dockview\'s own control.',
  'Read the list of tools with one helper of your own: the `data-tool` of each `button` and `\'|\'` for each `[role="separator"]` under `[data-testid="tool-list"]`, in document order.'))
B.append(tests_brief('11-tests-tools', 'tools.test.mjs', 'the tools at work on the planes, and the toasts: the file the plan names for step 11',
  '`canvas/app/test/helpers.mjs` whole, `canvas/app/test/move.test.mjs` for how a test clicks and drags on a plane, and `canvas/app/test/resize.test.mjs`, lines 60 to 95, for how a test saves through the bar and reads the download.',
  'Tests 1 to 4 walk the table of uses: write the uses once, as data, and one function that carries out a use and checks it. `M.validate` is asked in Node, on the model of the file the page saved (`lib.validate(lib.normalize(saved.model))`), never through the page. The Tools view and the Explorer share one strip, so show the one you read with `showSide` each time.'))
B.append(tests_brief('11-tests-palette', 'palette.test.mjs', 'the right-click palette of a plane, and the scenario of the screenshot `palette.png`',
  '`canvas/app/test/helpers.mjs` whole, `canvas/app/test/move.test.mjs` for how a test works a plane, and `canvas/app/test/shots.mjs` with `canvas/app/test/shots/palette.mjs` as it is now for what a shot file exports.',
  'A right-click is `page.mouse.click(x, y, { button: \'right\' })`. For test 8, keep the `contextmenu` events with a listener of your own on the window, in the capture phase, and read `defaultPrevented` of each a frame later. **The shot**: rewrite `canvas/app/test/shots/palette.mjs` as section 5 gives it, step by step, without `pending`; it throws a sentence when the palette does not open, so that `npm run shots -- palette` fails readably today.', shot=True))

B.append(impl_brief('11-impl-commands', ['canvas/app/src/core/commands.ts'], 'build the core of the tools',
'''Step 11 of slice 1 gives Grasp's new page its tools: a Tools view at the side, a right-click palette on each plane, and toasts. All their logic is in one file of the core, which runs in Node with no browser and no React: what a view kind's tools are, what each command makes and writes, the rule each refusal quotes, and the tool in hand as a state machine. You build that file. Three other agents build the Tools view, the toasts and the planes' part on top of your `Tools` interface without seeing your code, so its behaviour must be exactly what the contract says, in every case the contract names.''',
'''1. `plan/swarm/README.md`, then `plan/swarm/shared.md`, sections 1 and 2.
2. `plan/swarm/step-11.md`: sections 1 and 3, and in section 4 "The fixtures", "The table of uses" and the table of `commands.test.mjs`.
3. `canvas/app/src/core/commands.ts` whole: every comment is the contract. The words (`TOOL_TITLE`, `TOOL_HINT`, `BASE_NAME`, `NODE_HOME`, `ESCAPE_HINT`) and the types are complete; you fill in the six bodies that throw.
4. `canvas/app/src/core/selection.ts` (`Hit`, `Picked`, `Selection`: you call `selectionOf(session).set`, read `.view` and listen to it), `core/history.ts` to line 180 (`edit`, `Told`), `core/session.ts`, and in `core/adapter.ts` `isDrawn`, `project`, `Projection` (its `rects` and `nodes`) and `LOOK`.
5. What you port, on the old page, which you read and do not change: `canvas/src/core/page/tools.js` (`freeName`, `place`, `pairProblem`, `connectStep`, `createRel`), `canvas/src/core/page/drawing.js` (the graph renderer's `place`, `freshElement`, `blankField`), `canvas/src/core/page/layout.js` (`nearestBorder`, `containerAt`), and the wrappers around `place` at the end of `canvas/src/interconnection/page.js` and `canvas/src/behavior/page.js`.''',
'''The bodies of `toolGroups`, `toolHint`, `freeName`, `place`, `draw` and `toolsOf`, each to its comment. Keep every exported name, type and signature as it is: other tasks import them. Keep the file free of React and of the DOM; read the library through `libOf(session)` or a cast to `CommandsLibrary`, and add nothing to the global `SysMLModelLibrary`.

Points that are easy to get wrong:
- `place()` and `draw()` check first and write after: a refusal leaves the model and the undo steps untouched.
- One `history.edit()` for each thing made, with no key, returning the words.
- `toolsOf` keeps one object for a session (a `WeakMap`, as `storesOf` in `plane/viewStore.ts`), and adds one listener to the selection and one to the history, at the first call.
- The selection tells its listeners of every change, of `items` as of `view`: put a tool down only when `view` itself changed.
- The listeners are told once for each call that changed something, after the state is whole.''',
COMMANDS.replace('{file}', 'commands.test.mjs') + '''
`commands.test.mjs` is your test file: all 26 of its tests must pass. They need step 9's `selectionOf`, which is built in your worktree. Run `canvas/app/test/history.test.mjs`, `viewStore.test.mjs` and `adapter.test.mjs` as well: they must pass as before.''',
'`commands.test.mjs` passes 26 of 26; `npm run build` and `npm run check` pass; the three files named above pass as before; no test file is changed.',
'''- What you decided where the contract is silent, one line each.
- Each test you could not make pass, with the reason.
- Anything in the contract, a signature or a test that looks wrong, with your evidence.'''))

B.append(impl_brief('11-impl-tools', ['canvas/app/src/panels/Tools.tsx', 'canvas/app/src/panels/tools.css'], 'build the Tools view',
'''Step 11 of slice 1 gives Grasp's new page its tools. You build the Tools view: the side panel that lists the tools of the view whose tab is in front, takes a tool in hand at a click, shows which one is in hand, and puts it down at Escape. It holds no rule: the tool in hand is the session's, in `core/commands.ts`, which is built already in your worktree. The planes' part, which gives a click on a plane to the tool, is built after yours by another agent.''',
'''1. `plan/swarm/README.md`, then `plan/swarm/shared.md`, sections 1 to 3 and 7.
2. `plan/swarm/step-11.md`: sections 1 and 3, and in section 4 the table of `tools-panel.test.mjs`.
3. `canvas/app/src/panels/Tools.tsx`: the comment over `ToolsPanel` is the contract. `TOOLS_TEXT` and `TOOL_ROW` are complete.
4. `canvas/app/src/core/commands.ts`: `Tool`, `Tools`, `toolsOf`, `toolGroups`, `TOOL_TITLE`. `canvas/app/src/core/selection.ts`: `Selection.view` and `listen`. `canvas/app/src/core/adapter.ts`: `isDrawn`.
5. `canvas/app/src/panels/SidePanel.tsx`, `canvas/app/src/shell/dockContext.ts` (`useDock`), and `canvas/app/src/shell/TopBar.tsx` for how the bar's keys tell a text field and a modal dialog, and how a Material UI button is given a tooltip and colours from `shell/theme.ts`.''',
'''The body of `ToolsPanel`, to its comment: the five things it shows, a tool's button, and the Escape listener. Styles go in `sx` with the constants of `shell/theme.ts`, or in `panels/tools.css` imported by `Tools.tsx`, with class names of its own; name no colour anywhere else. Create `tools.css` only if you need it.

Points that are easy to get wrong:
- The panel is mounted before any file is open and stays mounted: read the session from `useDock()`, and subscribe again when it changes. With `session` null call neither `toolsOf` nor `selectionOf`.
- `useSyncExternalStore` needs a snapshot that is the same value until something changed: `selection.view` (a string or null), `tools.armed` (the same object while it is in hand), `tools.hint` (a string or null).
- The view's name and kind are read from `session.model.views` at each render, and `session.listen` makes the panel render when the model changes.
- The Tooltip takes `describeChild`, so that the button's name stays its label.
- The Escape listener is on the window, in the capture phase, and is taken away when the session changes.''',
COMMANDS.replace('{file}', 'tools-panel.test.mjs') + '''
`tools-panel.test.mjs` is your test file: all 11 of its tests must pass. Run `canvas/app/test/shell.test.mjs` as well: it must pass as before (its strip and its side panels are around yours). `tools.test.mjs` and `palette.test.mjs` cannot pass yet: they need the planes' part.''',
'`tools-panel.test.mjs` passes 11 of 11; `shell.test.mjs` passes as before; `npm run build` and `npm run check` pass; no test file is changed.',
'''- What you decided where the contract is silent, one line each.
- Each test you could not make pass, with the reason.
- Anything in the contract or a test that looks wrong, with your evidence.'''))

B.append(impl_brief('11-impl-toasts', ['canvas/app/src/shell/Toasts.tsx'], 'build the toasts',
'''Step 11 of slice 1 gives Grasp's new page its tools, and a tool that a rule refuses says why in a toast: one sentence at the bottom of the window, for 8 seconds. You build the component that shows it. It is small, and it holds no rule: it shows `toolsOf(session).said`, which `core/commands.ts` sets and which is built already in your worktree. `App` renders `<Toasts session={session} />` already.''',
'''1. `plan/swarm/README.md`, then `plan/swarm/shared.md`, sections 3 and 7.
2. `plan/swarm/step-11.md`: section 1, items 5, 6 and 13; section 3, the rows on a toast; in section 4, tests 5, 12 and 13 of `tools.test.mjs`.
3. `canvas/app/src/shell/Toasts.tsx`: the comment over `Toasts` is the contract.
4. `canvas/app/src/core/commands.ts`: `Saying`, and `said` and `listen` in `Tools`.
5. `canvas/app/src/shell/App.tsx`, where it is rendered, and `canvas/app/src/shell/theme.ts` for `INK` and `WHITE`.
6. `node_modules/@mui/material/Snackbar/Snackbar.js` and `useSnackbar.js`, if you want to see why the contract names `disableWindowBlurListener`, `slotProps.content` and the `clickaway` reason.''',
'''The body of `Toasts`, to its comment: a Material UI `Snackbar` keyed by `said.n`, with `message={said.text}`, `autoHideDuration={TOAST_MS}`, `disableWindowBlurListener`, `transitionDuration={0}`, `anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}`, an `onClose` that ignores the reason `'clickaway'`, and `slotProps.content` carrying `data-testid="toast"`, `role="status"` and the ink and white of the theme. The component keeps in its own state which `n` it has let go, and renders nothing for that one.

Points that are easy to get wrong:
- With `session` null call nothing of the core and render nothing.
- `useSyncExternalStore(tools.listen, () => tools.said)`: `said` is the same object until something new is said.
- When the session changes, what the old session said is not shown.''',
COMMANDS.replace('{file}', 'tools.test.mjs') + '''
Your tests are in `tools.test.mjs`: 5, 6, 7, 10, 12 and 13 read a toast. **They cannot pass yet**: a toast is said only when a plane gives a click to a tool, and that part is built after yours, by `11-impl-plane`, which then runs them. So build to the contract and check what can be checked now: `npm run build` and `npm run check` pass, and `canvas/app/test/shell.test.mjs` and `canvas/app/test/open.test.mjs` pass as before (with nothing said, the page must show and log nothing new).''',
'the body is built to its comment; `npm run build` and `npm run check` pass; `shell.test.mjs` and `open.test.mjs` pass as before; no test file is changed.',
'''- What you decided where the contract is silent, one line each.
- Anything in the contract that looks wrong, or that Material UI does otherwise than the contract says, with what you read or ran.'''))

B.append(impl_brief('11-impl-plane', ['canvas/app/src/plane/Plane.tsx', 'canvas/app/src/plane/viewStore.ts', 'canvas/app/src/plane/Palette.tsx', 'canvas/app/src/plane/palette.css'], "build the planes' part of the tools, and the palette",
'''Step 11 of slice 1 gives Grasp's new page its tools. The core (`core/commands.ts`), the Tools view and the toasts are built in your worktree. You build what joins them to the planes: a click on a plane goes to the tool in hand before it picks anything; the plane shows that a tool is in hand; and a right-click opens the palette, a menu of what can be made there. You are the last builder of the step, so you are also the one who sees the step's browser tests pass as a whole.''',
'''1. `plan/swarm/README.md`, then `plan/swarm/shared.md`, sections 1, 2 and 4.
2. `plan/swarm/step-11.md`: sections 1 and 3 whole. In section 3, "The plane's part" is your contract for `Plane.tsx`, word for word; section 4 has the tables of `tools.test.mjs` and `palette.test.mjs`; section 5 the shot.
3. `canvas/app/src/plane/Palette.tsx`: the comment over `Palette` is its contract. `canvas/app/src/plane/palette.css` holds the crosshair's rule already.
4. `canvas/app/src/plane/Plane.tsx` as step 9 left it: find `clicked(hit)`, and how the three click handlers make a `Hit`.
5. `canvas/app/src/core/commands.ts`: `Tools` whole (`armed`, `first`, `click`, `offers`, `choose`, `listen`). `canvas/app/src/core/selection.ts`: `Hit`.
6. In `node_modules/@mui/material`: `Menu/Menu.js` (where `slotProps.list` and `slotProps.root` go) and, in `node_modules/@xyflow/react/dist/esm/types/component-props.d.ts`, `onPaneContextMenu`, `onNodeContextMenu` and `onEdgeContextMenu`.''',
'''- In `Plane.tsx`: everything "The plane's part" lists. Import `Palette` from `./Palette`; that import brings `palette.css` into the page.
- In `Palette.tsx`: the body of `Palette`, to its comment.
- In `viewStore.ts`: nothing. You own it so that no other task changes it under you.

Points that are easy to get wrong:
- Every prop of `<ReactFlow>` stays the same object or function at each render (`Plane`'s comment says why): make the three context-menu handlers with `useCallback`, or outside the render.
- `screenToFlowPosition` comes from `useReactFlow()`, which works only inside `<ReactFlow>`: step 9's click handlers show where.
- A Material UI Menu takes its children as one flat array, never a Fragment.
- The menu is a portal, and React hands its events on to the plane's root: the `onContextMenu` of the menu's root must stop the event, or the plane opens the palette again.
- `onClose()` first, then `choose(...)`.
- The plane must render no more than before on a pan or a drag step: subscribe to the tools with a snapshot that changes only when `armed` or `first` does.''',
COMMANDS.replace('{file}', 'tools.test.mjs') + '''
Your test files are `tools.test.mjs` (14 tests) and `palette.test.mjs` (12): all must pass. Two of `tools.test.mjs`, tests 8 and 14, type into Details, which step 10 built in your worktree. Then run, one file at a time, `tools-panel.test.mjs`, `selection.test.mjs`, `plane.test.mjs`, `move.test.mjs`, `gestures.test.mjs` and `keys.test.mjs`: they must pass as before. Then `npm run shots -- palette` must write `canvas/app/shots/palette.png`; look at it against the list in section 5 of the step's file.

When a test fails because of a file you do not own (`commands.ts`, `Tools.tsx`, `Toasts.tsx`, a test file), do not change that file and do not work around it: find out what it does otherwise than its contract says, and send that back.''',
'`tools.test.mjs` and `palette.test.mjs` pass; the six files named above pass as before; `npm run build` and `npm run check` pass; `npm run shots -- palette` writes the image; no test file is changed.',
'''- What you decided where the contract is silent, one line each.
- Each test you could not make pass, and whose file the fault is in, with your evidence.
- What you saw in `palette.png` against its list.
- Anything in the contract or a test that looks wrong.'''))

B.append(('11-checks-break', [], f'''# 11-checks-break: see each test of step 11 fail with its thing broken

## The goal, and why

Step 11 of slice 1 is built: the Tools view, the palette and the toasts. Its tests were seen to fail before the code existed, for want of the whole of it. That does not show that each test can fail for the one thing it claims to guard (`plan/notes.md`, session 19: "a test seen to fail for want of the whole shell has not been seen to fail for each thing it claims"). You show it: for each test, you make the one small breakage its row names in the built code, run the test, see it fail, and put the code back.

You change no file for good. What you hand back is a report.

## Where to read, in this order

1. `plan/swarm/README.md`.
2. `plan/swarm/step-11.md`, section 4: the four tables. Each row's last column, "Breakage", is the change to make for that row's test.
3. The files the breakages are made in: `canvas/app/src/core/commands.ts`, `panels/Tools.tsx`, `shell/Toasts.tsx`, `plane/Plane.tsx`, `plane/Palette.tsx`, `plane/palette.css`.

## The files you own

None. Every change you make is taken back before the next (`git checkout -- <file>`), and `git status --short` is empty when you finish.

## What to do

For each row of the four tables (26, 11, 14 and 12 rows):

1. Make the row's breakage, as small as it can be: one condition turned, one line left out. Where the row's words leave the place open, choose the smallest change that does what they say, and note it.
2. `npm run build` (for a browser test), then run that one test: `node --test --test-timeout=120000 --test-name-pattern="<the test's name>" canvas/app/test/<file>`.
3. Note whether it failed, and the first line of its failure.
4. Run the whole file once with the breakage in, and note which other tests failed: the fewer the better, and a breakage under which half the file fails was too large.
5. `git checkout -- canvas/app/src`, and go on.

At the end, `npm run build` and `npm run check` with nothing broken, and the four files once more: all pass.

## The commands

{COMMANDS.replace('{file}', '<file>')}
## What to send back

- A table: each test, the breakage as you made it (file and line), whether the test failed, the first line of its failure, and which other tests of its file failed with it.
- **Every test that still passed with its breakage in.** That is the finding this task exists for: say what the test asserts and why the breakage slips past it.
- Each breakage you could not make as the row says, and why.

"Done" is: every row was tried; the tree is as you found it; the four files pass.

{RULES}'''))

B.append(('11-review-code', [], f'''# 11-review-code: review step 11's code against the plan

## The goal, and why

Step 11 of slice 1 of Grasp is built and its tests pass. You review it as a reader who has **not** seen the outline it was built from: the plan says what the step must do, and an outline can be wrong in the same way as the code built from it. Both serious defects of step 7 were found this way (`plan/notes.md`, sessions 22 and 23). You read the step's whole diff against the plan's text, try in the built page whatever you doubt, and send back defects, each reproduced.

You change nothing.

## Where to read, in this order

1. `plan/slice-1.md`: section 5, step 11 ("What it delivers", "Done when"); section 2, "Which editing is slice 1's"; section 4, the row of `palette.png`; section 7, Damon's decision 3; section 10, the criteria.
2. `plan/direction.md`, "The slices", item 1.
3. The step's diff: `git diff <the commit the lead names>..HEAD -- canvas/app/src canvas/app/test`. The code is `core/commands.ts`, `panels/Tools.tsx`, `shell/Toasts.tsx`, `plane/Plane.tsx`, `plane/Palette.tsx` and `plane/palette.css`.
4. The old page's rules, which the commands port: `canvas/src/core/page/tools.js`, the graph renderer's `place` in `canvas/src/core/page/drawing.js`, and the ends of `canvas/src/interconnection/page.js` and `canvas/src/behavior/page.js`.

Do **not** read `plan/swarm/step-11.md` or the briefs before you have written down your findings. After that you may read it, to tell a defect of the code from a decision the outline made on purpose; a decision you think wrong is still a finding.

## The files you own

None.

## What to try

Whatever you doubt. At least these, in the built page (`npm run build`, then a script of your own with Playwright, kept outside the repository, as `canvas/app/test/helpers.mjs` opens the page): every tool of each of the four graph view kinds, from the Tools view and from the palette; each refusal, and whether its sentence is the library's; what stays in hand and what is put down after a refusal, after Escape from each place the focus can be, after an undo in the middle of a two-click line, after another file is opened, after the tab in front changes; a drag and a marquee with a tool in hand; a right-click on everything a plane holds; the palette at the window's edge; two views of one file side by side, with the first end on one and the second on the other; Undo and Redo of each thing made, and a file saved after it and checked with `canvas/check.sh`; the 5,000-element model (`scaleState(5000)` of `canvas/test/scale-model.mjs`) with a tool in hand.

## The commands

{COMMANDS.replace('{file}', '<file>')}
## What to send back

- Each defect: what you did, what the page did, what the plan asks, and the script or the steps that reproduce it. Mark each as serious (the page does something wrong a person would meet) or small.
- What you tried and found sound, in a list, so the lead knows what was covered.
- Each place where the code and the plan agree and you still think the plan's reader would be surprised.

"Done" is: the diff is read whole; every doubt was tried in the built page; the findings are written with their reproductions.

{RULES}'''))

B.append(('11-review-shot-palette', [], '''# 11-review-shot-palette: look at `palette.png`

## The goal, and why

Grasp is a design tool that runs in a browser. One of its screens was photographed, and the picture is to show a right-click menu open on a diagram. You have not seen the code and you are not shown it: you look at the picture as a person would, and say for each item of a list whether it is there. A step of the work is committed only when every item is present, so mark an item present only when you see it.

## What you are given

One image, `canvas/app/shots/palette.png`, 2800 by 1800 pixels: the whole window. Nothing else: no code, no other file.

## The list

Mark each item **present** or **absent**, and for an absent one say in a sentence what you see instead.

1. One menu is open over the plane: a white panel with a shadow, in front of the boxes.
2. The menu's top left corner lies inside the box named `Host`, which is headed `«part def»`.
3. The menu lists, from the top: `part`, `port`, `specializes`, and no other entry.
4. A thin rule parts the menu in two groups: `part` and `port` above it, `specializes` below it.
5. The menu's words are in the page's own type (the same face as the tab's title), dark on white, and none is cut off.
6. Around the menu the page is whole: the dark top bar, the strips at the left and right edges, the tab `proofStructure : GeneralView`, and boxes joined by lines on the plane.
7. No second menu is shown: no grey menu of the browser's own with entries such as Back, Reload or Inspect.
8. No message bar is shown at the bottom of the window.

## What to send back

The eight marks, in order, each with its sentence when absent. Then, apart from the marks, anything else in the picture that looks wrong to you.

## Rules

Look at the image only. Open no other file, run nothing, and change nothing. Something that looks wrong is a reason to say so, not to explain it away.
'''))

B.append(('11-checks-close', ['canvas/dist/', 'canvas/app/shots/palette.png', 'plan/status.json', 'plan/notes.md', 'plan/swarm/tasks.json'], f'''# 11-checks-close: close step 11 (the lead's)

## The goal, and why

Every task of step 11 is done and step 10 is closed. This task is the lead's own: it sees the step whole and green, by itself and after the steps before it, and commits it, so that a session cut short loses no more than the step in hand (criterion 7 of `plan/slice-1.md`, section 10).

## Where to read

`plan/swarm/README.md`, "How the lead runs the swarm", item 7; `plan/swarm/shared.md`, section 8; `plan/swarm/step-11.md`; `plan/slice-1.md`, step 11's "Done when" and section 10.

## What to do, in this order, with no agent running

1. Every owned file of the step's tasks is in the main tree, and no other change is: `git status --short`.
2. `npm ci`, `npm run build`, `npm run check`.
3. `npm test`, three runs in a row (the suite holds timed tests): `# fail 0`, and `# todo 0`, which is what `plan/status.json` says after step 10.
4. The step's "Done when", test by test: `tools.test.mjs` passes, with its tests 1 to 4 (every tool of each graph view kind), 5 (the port on the ground), 6 (the specialization) and 7 (Escape) under those names. `commands.test.mjs`, `tools-panel.test.mjs` and `palette.test.mjs` pass.
5. What must go on holding: `selection.test.mjs` (with no tool in hand a click picks as step 9 built it), `scale.test.mjs` and `instant.test.mjs` (a plane that reads the tools renders no more on a pan or a drag step), `open.test.mjs` (criterion 2).
6. `11-checks-break`'s report: no test still passed with its breakage in, or each that did is mended first.
7. `11-review-code`'s findings: each serious one fixed, with a test seen to fail first; each small one fixed or noted.
8. `npm run shots -- palette`; `11-review-shot-palette` marks all eight items present.
9. A file saved by the page after a tool made something is accepted by `canvas/check.sh` (a probe: the example, a part def placed and a specialization drawn, Save).
10. `plan/status.json`: `step` 11. `plan/swarm/tasks.json`: the step's tasks `done`.
11. `plan/notes.md`, the session's entry: what cannot be read from the plan or the code. For this step: that three tools always add one line to `M.validate` and the tests ask for exactly it; each thing the builders decided where the contract was silent; each rework and whose fault it was; the times.
12. One commit: the sources, the tests, `canvas/dist/`, `canvas/app/shots/palette.png`, `plan/status.json`, `plan/notes.md`. Pushed.

## The commands

```sh
npm ci && npm run build && npm run check && npm test
npm run shots -- palette
```

"Done" is: the commit is pushed, and checked out by itself it passes `npm ci && npm run check && npm test` with `# fail 0` and `# todo 0`.

{RULES}'''))

os.makedirs(OUT, exist_ok=True)
for tid, owns, text in B:
    open(f'{OUT}/{tid}.md', 'w').write(text if text.endswith('\n') else text + '\n')

NEEDS = {
 '11-tests-commands': [], '11-tests-panel': [], '11-tests-tools': [], '11-tests-palette': [],
 '11-impl-commands': ['9-impl-selection', '11-tests-commands'],
 '11-impl-tools': ['11-impl-commands', '9-impl-dock', '11-tests-panel'],
 '11-impl-toasts': ['11-impl-commands'],
 '11-impl-plane': ['9-impl-plane', '9-impl-dock', '9-impl-explorer', '10-impl-details', '11-impl-commands', '11-impl-tools', '11-impl-toasts', '11-tests-tools', '11-tests-palette'],
 '11-checks-break': ['11-impl-plane'],
 '11-review-code': ['11-impl-plane'],
 '11-review-shot-palette': ['11-impl-plane'],
 '11-checks-close': ['10-checks-close', '11-tests-commands', '11-tests-panel', '11-tests-tools', '11-tests-palette', '11-impl-commands', '11-impl-tools', '11-impl-toasts', '11-impl-plane', '11-checks-break', '11-review-code', '11-review-shot-palette'],
}
KIND = lambda t: {'tests': 'tests', 'impl': 'implement', 'review': 'review', 'checks': 'checks'}[t.split('-')[1]]
MODEL = {'11-review-code': ('fable', 'high'), '11-checks-close': ('lead', None)}
tasks = []
for tid, owns, _ in B:
    model, effort = MODEL.get(tid, ('sonnet', 'medium'))
    t = {'id': tid, 'step': 11, 'kind': KIND(tid), 'brief': f'{OUT}/{tid}.md', 'owns': owns, 'needs': NEEDS[tid], 'model': model}
    if effort: t['effort'] = effort
    t['status'] = 'open'
    tasks.append(t)
open('plan/swarm/tasks-11.json', 'w').write(json.dumps(tasks, indent=2) + '\n')
print(len(B), [t['id'] for t in tasks])
