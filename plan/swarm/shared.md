# What steps 8 to 12 share

Each step's own scaffold is in `step-N.md`. This file holds what more than one step builds on, so that the steps can be built side by side. Where it names a file, the contract itself is the comment in that file; this file says who relies on it and why it has its shape.

## 1. The selection

`canvas/app/src/core/selection.ts` holds the contract: `Picked`, `Hit`, `Selection`, `selectionOf(session)`. Step 9 builds it.

| Who | What it does with the selection |
|---|---|
| A plane (step 9) | Marks the nodes and lines the selection names. Turns each click into `selection.click(hit)`, and a marquee into `selection.set(...)`. |
| The Explorer (step 9) | Marks the rows the selection names. A click on a row calls `selection.set([row])`. |
| The dock (step 9) | Tells which view is in front: `selection.front(viewId)`. |
| Details (step 10) | Shows the fields of `selection.last`. |
| The tools (step 11) | Pick what they made: `selection.set([made])`. The Tools view lists the tools of the view in front, `selection.view`. |
| Validation (step 12) | A click on an entry calls `selection.set([what the entry is about])`. |

Why it has this shape:

- It is kept for a session, outside React, like the history and the views' stores, because a hidden tab's plane is unmounted and a panel is mounted before any file is open. React reads it with `useSyncExternalStore(selection.listen, () => selection.items)`.
- It is reached through `selectionOf(session)`, not through a field of `Session`, so that `core/session.ts` does not change.
- The selection is the one truth. A plane's `selected` flags are worked out from it; React Flow's own selecting changes nothing by itself. That is what makes a box picked on one plane the selected row in the Explorer and the selected node on another plane that shows it.
- Which view is in front lives beside what is picked, because both say what the person is working on, and the Tools view needs it without knowing Dockview.

Every later step may rely on `selectionOf` as its comment says. A task of steps 10 to 12 that uses it needs the task `9-impl-selection` in `tasks.json`.

## 2. The tool in hand

`canvas/app/src/core/commands.ts` holds the contract: `Tool`, `Tools`, `toolsOf(session)`. Step 11 builds it, and `step-11.md` holds the rest of that file's contract (the table of commands, arming, the first end of a line, what is said).

What other steps need of it is one rule: **while a tool is in hand, a click on a plane is the tool's.** `Plane.tsx` has one function through which every click passes, `clicked(hit)`. Step 9 writes it to call `selectionOf(session).click(hit)`. Step 11 puts the tool in front: `if (!toolsOf(session).click(hit)) selectionOf(session).click(hit)`. So step 9 builds picking without any tool, and step 11 changes one line of it.

## 3. How a side panel is put into the dock

- The dock (`shell/Dock.tsx`) makes four side panels once, in `onReady`: `explorer`, `tools` and `validation` on the left strip, `details` on the right. Its `COMPONENTS` table gives each its body: `ExplorerPanel`, `ToolsPanel`, `ValidationPanel` and `DetailsPanel`, each exported by its own file under `canvas/app/src/panels/`. Those four files exist and hold the empty states the shell has shown since step 5. A step builds its panel by replacing the body of its own file. No step changes `Dock.tsx` to put a panel in.
- A panel's component takes no props. It reads `useDock()` (`shell/dockContext.ts`): `session` (the open file or null), `onOpen`, `showViews`, `closed`, `showView`. It is mounted from the page's start, before any file is open, and stays mounted while its tab is hidden or its side is collapsed. So it must render with `session` null, and it must follow `session` when another file is opened.
- A panel renders inside `SidePanel` (`panels/SidePanel.tsx`), which gives the root (class `grasp-side-body`, with the panel's `data-testid`: `explorer`, `tools`, `validation`, `details`) and the header row with the panel's title. The root is as wide and as high as the panel and is what scrolls. `SideText` is the paragraph a panel shows while it has nothing else to show.
- What each panel says with no file open, and with a file but nothing to show, is in its step's file.

`shell/Toasts.tsx` and `shell/About.tsx` are put in the same way: `App.tsx` already renders both, each from its own file, which shows nothing until its step builds it. `App` holds whether About is open and hands `onAbout` to the bar.

## 4. What the plane takes from each step

The comments in `plane/Plane.tsx` and `plane/viewStore.ts` carry this, at the end of each file's contract.

| Step | What it gives the plane | Where |
|---|---|---|
| 8 | A gesture's step projected from what the gesture's start read (`projectStep`). No lines for a large view while it is far (`linesDrawn`). A minimap of our own (`PlaneMiniMap`). | `core/adapter.ts`, `plane/MiniMap.tsx`. The store and the plane call these already, so step 8 changes neither `viewStore.ts` nor `Plane.tsx`. |
| 9 | The selection: flags from it, `clicked(hit)`, the marquee (`marquee(rect)` of the store), Ctrl or ⌘ + click, the ground's click. | `plane/Plane.tsx`, `plane/viewStore.ts`, `plane/marquee.css` |
| 10 | Nothing. A name typed into Details reaches a box through the history, the store and the adapter, as every change does. | |
| 11 | The tool before the pick in `clicked(hit)`; the right-click palette. | `plane/Plane.tsx`, `plane/Palette.tsx` |
| 12 | Nothing. | |

## 5. The files more than one step would change, and who owns each

A task owns a file only as `tasks.json` says. This table is why.

| File | Changed by | How two steps keep apart |
|---|---|---|
| `canvas/app/src/plane/Plane.tsx`, `plane/viewStore.ts` | Step 9, then step 11 | Step 11's task needs step 9's. Step 8 changes neither (section 4). |
| `canvas/app/src/panels/explorerRows.ts`, `panels/explorer.css`, `canvas/app/src/plane/marquee.css` | Step 9 only | The plan does not name them; `step-9.md` says why each exists. |
| `canvas/app/test/viewStore.test.mjs`, `canvas/app/test/gestures.test.mjs` | Step 9's test tasks only (tests restated, and added) | Step 8's tests of the store are in a file of their own, `step.test.mjs`. |
| `canvas/app/src/shell/Dock.tsx` | Step 9 (`showView`, the view in front), then step 10 (a view's tab follows its name) | Step 10's task needs step 9's. Both contracts are at the end of `Dock`'s comment. |
| `canvas/app/src/shell/App.tsx` | Step 9 only (`window.Grasp.selection`) | Toasts and About are rendered already. |
| `canvas/app/src/shell/TopBar.tsx` | Step 10 (the Undo and Redo keys act from a checkbox and a radio button), then step 12 (About enabled) | Step 12's task needs step 10's. |
| `canvas/app/src/core/adapter.ts` | Step 8 only | |
| `canvas/app/src/core/index.ts` | No task | It exports every core file of steps 9 to 12 already: `selection`, `commands`, `checks`, `probe`. |
| `canvas/app/build.mjs` | No task | It hands the application the libraries' names, versions and licences as the text `__GRASP_LIBRARIES__` already (`core/probe.ts`, `LIBRARIES`), for step 12's About. |
| `canvas/app/src/app.css` | No task | A step's styles go in a stylesheet of its own, beside the component that imports it (`panels/explorer.css` imported by `panels/Explorer.tsx`). The bundle puts such a stylesheet before `app.css`, so its rules use class names of their own and do not count on overriding `app.css`. |
| `canvas/app/src/shell/theme.ts` | No task | Every colour a step needs is in it already, added by the scaffold. A colour that is missing is a reason to stop. |
| `canvas/app/src/vendor.ts` | No task | Every library import a step needs is in it already. An import that is missing is a reason to stop. |
| `canvas/app/test/helpers.mjs`, `test/core.mjs` | No task | What several test files need is in them already (section 6). A helper only one test file needs is written in that file. |
| `canvas/app/test/shots.mjs` | No task | Each new shot is a file of its own under `test/shots/`. A test task of its step writes its `take()` and leaves `pending: true`, so `npm run shots` leaves the shot out while its step is not built; the step's closing takes `pending` off. |
| `canvas/app/test/scale.test.mjs` | Step 8 (its three tests), then step 10 (the keystroke's todo mark) | Step 10's change is the lead's, in `10-checks-close`. |
| `package.json` | Step 8 only (the test files run one at a time) | |
| `plan/status.json`, `plan/notes.md`, `canvas/dist/` | The lead | An agent builds `canvas/dist/` to run its tests and does not hand it over. |

## 6. What the tests share

`canvas/app/test/helpers.mjs` begins with how a test finds the page's parts, and that stands. For steps 9 to 12 it gained, at its end:

| Name | What it is |
|---|---|
| `TESTIDS.tools`, `TESTIDS.validation` | The roots of the Tools and the Validation panels, beside `explorer` and `details`. |
| `TESTIDS.palette`, `TESTIDS.toast`, `TESTIDS.aboutPanel` | The right-click menu of a plane, a toast, the About panel (`about-panel`; `TESTIDS.about` is the bar's button). |
| `openIn(browser, file, options)` | Opens the page without the picker and a state file in it. |
| `showSide(page, name)` | Shows a side panel by its name on its strip, and leaves alone one that is shown already. |
| `rowOf(type, id)`, `rowIn(page, type, id)`, `rowItemIn(page, type, id)` | A row of the Explorer. The element that holds the row's words and takes its click carries `data-row="<type>:<id>"`, with type `package`, `view`, `el`, `rel` or `more` (a "Show more" row: its id is the row id of the row whose list it ends). The tree item around it (ARIA role `treeitem`) carries `aria-selected` ("true" or "false"; none on the package's row and on a "Show more" row), `aria-current="true"` on the row of the view in front, and `aria-expanded` when rows are inside it. The Explorer sets `aria-selected` on rows of its own: MUI X Tree View 8 would say `aria-checked`. A row's text is its keyword, its name and its type: `«part def» Host`. |
| `fieldIn(page, name)` | A field of Details by its name in the library's `FIELDS`: the `<input>` or `<textarea>` that carries `data-testid="field-<name>"` or lies inside what carries it. |
| `undo(page)`, `redo(page)` | A click on the bar's Undo or Redo. |
| `saysIn(page)`, `shownIn(page)`, `nothingPicked(page)`, `untilShown(page, type, id, how)`, `NO_FILE`, `NOTHING_PICKED` | What Details says while it shows no form, what it shows the form of (`"<type>:<id>"`), and the wait until it shows an item (`step-10.md`, section 3). |
| `pickRow(page, type, id)`, `pickBox(page, view, id)` | Picks by a click on a row of the Explorer, or on a box's header on its plane, and waits until Details shows it. |
| `wordsOf(page, 'undo' or 'redo')` | The words of the step the bar's Undo would take back or its Redo make again, or null. |
| `showTab(page, name)`, `rowOfField(page, field)` | A tab of Details, and a field's row on the tab shown. |

`canvas/app/test/core.mjs` gained `loadWith(...files)`: the core and the named modules of `canvas/app/src/` in one bundle for a Node test, as `loadPlanes()` does for the view's store.

What every test keeps to (the reasons are in `helpers.mjs` and in `plan/notes.md`, sessions 19 to 23):

- A browser test opens `canvas/dist/index.html` from `file://` through `openPage` or `openIn`, and ends with `finish(opened)`, which fails when the page logged an error or a warning.
- A test finds what the application renders by a `data-testid`, and what a library renders by the library's own roles and names. It never reads `window.Grasp`.
- A state file reaches the page through the file input (`openStateFile`), so the page is opened with `picker: false`.
- A test that drags measures the box against another box or against its owner, never against the screen, since a pan moves everything.
- A wait is `soon(page, check, missing)` with a sentence that says what the page lacks. No fixed sleep.
- A timed test takes its time inside the page (`timing` for a keystroke, `moveTiming` for a step of a drag or a pan), judges the median of the samples it names with `measure(planned, limit)`, and reports its median and samples as a line of the runner's output.
- A failure's message says what is missing in the page's own terms ("Details shows no name field for Host"), so that a failure before the code exists reads as the reason the test list gives.
- The ten state files are `TEN` in `helpers.mjs`: the example and the nine fixtures. `modelOf(file)` gives a file's model as the library reads it.

## 7. Colours, icons and styles

- Colours are constants of `shell/theme.ts` and reach stylesheets as the CSS variables of `cssVariables`. Material UI components take them from the theme (`primary`, `text.secondary`, `divider`).
- Icons come from `@mui/icons-material` one by one, by path, through `vendor.ts`. The scaffold added the ones steps 8 to 12 use; `step-N.md` names them.
- Type: Roboto 13 px, 12 px for small text, medium weight for names and titles (`plan/slice-1.md`, section 4). Dense controls: 28 px rows in the tree, 32 px fields.

## 8. Where the checks stand after each step

`plan/status.json` keeps `"step"` and the ten checks. Each step's closing sets `step` and takes these todo marks off:

| After step | `step` | Checks that pass | `# todo` |
|---|---|---|---|
| 7 (now) | 7 | 1 to 6 | 4 |
| 8 | 8 | and 7, 8, 10 | 1 |
| 9 | 9 | the same | 1 |
| 10 | 10 | and 9 | 0 |
| 11 | 11 | all ten | 0 |
| 12 | 12 | all ten | 0 |
| 13 | slice 1 `done`, `next` 2 | all ten | 0 |

## 9. The model library's types

`window.SysMLModel` is typed by the global interface `SysMLModelLibrary`, which several files add to with `declare global` (`core/session.ts`, `core/adapter.ts`, `core/checks.ts`, `panels/explorerRows.ts`). TypeScript merges those, and two files that declare one member must agree to the letter, or `tsc` fails once both are in the tree. So a file that reads more of the library than is declared takes it through a type of its own and a cast, as `core/commands.ts` does (`CommandsLibrary`, `libOf`) and `panels/fieldHooks.ts` (`FieldLibrary`, `fieldLibOf`). A task adds no member to the global interface.
