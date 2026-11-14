# The new page's application

`canvas/app/` is the new page's code, which `build.mjs` bundles into `canvas/dist/`: the page that opens from the file system in Chromium with no server (`canvas/dist/index.html`). It is slice 1 of the redesign (`plan/slice-1.md`): a slim top bar, side panels that resize and collapse, one tab per view with a plane of its own, boxes that resize by handles, one selection that every panel shares, the Tools view and the right-click palettes, Details, Validation, About, and undo with redo, over the `grasp/2` state files the old page opens and saves. The old page, `canvas/index.html` built from `canvas/src/`, stays beside it, unchanged, until the new one draws everything it draws (`canvas/README.md` says what each does). This file is for whoever changes the application, as `canvas/src/README.md` is for the old page.

## The words

- **The application** is this folder's code. **The page** it builds is `canvas/dist/index.html`. "The old page" is `canvas/index.html`.
- **The core** is the part with no React in it, `src/core/`. It runs in Node too, so its tests need no browser (`test/core.mjs` bundles it in memory beside the model library).
- **The session** is the file open in the page: its model (which the history holds), notes, archive and log, its name and handle, and whether it has unsaved changes.
- **The adapter** is the one function that turns a `grasp/2` view into a plane's nodes and edges (`project`), with its rules of place and size.
- **A view's store** keeps one view's nodes and edges outside React, since Dockview unmounts a hidden tab and the tab must find its state again. React reads it through `useSyncExternalStore`.
- **A strip** is the narrow bar at the window's left or right edge that names a side's panels and stays when the side is collapsed.

## How it is laid out

```
canvas/app/
  build.mjs           canvas/app/ → canvas/dist/; --check fails when canvas/dist/ is not what it builds
  index.html          the page's shell, copied as it is
  tsconfig.json       the types, checked by npm run check; nothing is emitted
  src/
    main.tsx          the entry: the theme's CSS variables on :root, then React into #root
    vendor.ts         every library the application may import, on window.GraspVendor
    app.css, fonts.css, types.d.ts
    core/             no React: history, session, files, adapter, selection, commands, checks, probe, roboto, index
    shell/            App, TopBar, Dock, EmptyCard, About, Toasts, theme, dockContext
    panels/           Explorer, Tools, Details, Validation, SidePanel; explorerRows and fieldHooks, their parts without React
    plane/            Plane, viewStore, MiniMap, Palette, NotDrawnYet; nodes/ (BoxNode, PortNode, SmallNode); edges/ (LineEdge, markers)
  test/               helpers.mjs, core.mjs, *.test.mjs, shots.mjs and shots/, unchanged.json, and two writers of files
  shots/              the screenshots, committed
canvas/dist/          what the build writes, committed: the page that is opened
```

Each file starts with a comment that says what it is for, and its contract is the comment above its main export: the tests are written from those comments, not the other way round. The plan's section 3 named most of the files. These came to be as the steps were built, each for a reason of its own:

| File | Why it exists |
|---|---|
| `src/core/index.ts` | The one place the application and the core's tests import the core from. |
| `src/core/checks.ts` | Step 12: the model library's problems and the specification's diagnostics, kept for a session outside React and worked out again after a pause, so that Validation and a plane read one result. |
| `src/core/roboto.ts` | Session 21: Roboto regular's advance widths, by which the adapter wraps a compartment's rows exactly as Chromium draws them. Written by `test/roboto-widths.mjs`; never edited by hand. |
| `src/panels/SidePanel.tsx` | The frame every side panel is put into the dock with: the header row and the root that scrolls. |
| `src/panels/explorerRows.ts` | The Explorer's rows without React (which rows, which are unfolded, what each says), kept per session, so that a 5,000-element tree is reworded rather than rebuilt (step 9). |
| `src/panels/fieldHooks.ts` | Details' fields without React: the form for what is picked, what a change writes and says, and the hooks for what a field's row in the model library cannot say (step 10). |
| `src/plane/MiniMap.tsx` | Step 8: a minimap of our own in place of React Flow's, which held one subscription per node and redrew at every step of a pan. |
| `src/plane/edges/markers.tsx` | The five line-end markers, defined once for the page: two planes side by side would otherwise define the same ids. |
| `src/shell/dockContext.ts` | What the dock hands to what it holds (`useDock()`), apart from `Dock.tsx` so that a panel imports it and not the dock, which imports the panels. |
| `src/fonts.css`, `src/types.d.ts` | Roboto's three weights, so that the build copies three font files; and what the application knows of the page's other globals and of stylesheet imports. |
| `src/*/*.css` | Each stylesheet beside the component it styles (`plane/marquee.css`, `plane/minimap.css`, `plane/palette.css`, `panels/details.css`, `panels/explorer.css`). |
| `test/shots/*.mjs` | The screenshots of steps 8 to 12, a file each, so that no two steps changed one file (`test/shots.mjs` holds those of steps 5 to 7). |
| `test/old-layout.mjs`, `test/old-layout.json` | The old page's own layout, written down from `canvas/index.html`, which the adapter's tests compare the adapter with. |
| `test/roboto-widths.mjs` | Writes `src/core/roboto.ts` from the built page's font; `--check` fails when the file is not what the font gives. |
| `test/unchanged.json` | The hashes of every file of the old page, the model library and their tests, as slice 1 found them; `unchanged.test.mjs` fails on one changed byte. |

## Which way a change goes

The pieces fit in one direction, and nothing goes the other way:

1. **A gesture on a plane or a widget in a panel calls `edit()`** of the session's history (`core/history.ts`), with a function that changes the model and the words that say what it did. Nothing else writes the model. A gesture that moves or resizes is one `edit()` at its end; its steps before that are drawn from places the adapter works out (`placesFor`, `projectStep`) and write nothing.
2. **The history tells** its listeners what the change touched: which elements, relationships and views, and whether the structure changed. Undo and Redo are told the same way.
3. **The adapter projects** each touched view again (`project`), keeping every node and edge that did not change as the same object, so that React Flow redraws only what moved.
4. **The stores hand over**: each view's store (`plane/viewStore.ts`) takes its new projection and tells its plane, which React Flow draws.
5. **The panels read again** only what was touched: the Explorer rewords its rows, Details reads its form again, the checks go stale and run again after a pause, and the session marks the file as changed.

The selection (`core/selection.ts`) is one list for the session, which every plane and panel reads and sets; a click on a plane becomes one `Hit` and goes through `clicked(hit)` in `Plane.tsx`, which offers it to the tool in hand first (`core/commands.ts`, `toolsOf(session)`).

## How to add

- **A side panel.** A file under `src/panels/` exporting a component that takes no props, reads `useDock()` (`session` may be null: a panel is mounted before any file is open and stays mounted while hidden), and renders inside `SidePanel` with its `data-testid`. Then a line in `COMPONENTS` of `shell/Dock.tsx` and the panel made in its `onReady`, on the left or right strip. Its text with no file, and with a file but nothing to show, is decided with it.
- **A node shape.** A name in `SHAPES` of `core/adapter.ts` (and in `BOX_SHAPES` or `BORDER_SHAPES` when it is one), the data the adapter gives it, and the component that draws it in `NODE_TYPES` of `plane/Plane.tsx`: a shape missing there is drawn as React Flow's default, silently. A kind is drawn by the shape its row in the model library names (`shapeOf`).
- **A field's hook.** Most fields need none: a field is its row's property in the model library, shown by its row's type and changed in the generic words. A field whose value, writing, words or lock its row cannot say gets an entry in `FIELD_HOOKS` of `panels/fieldHooks.ts`, whose comment lists what each hook may give; its look and group, in `FIELD_LOOKS` and `GROUP_ORDER`.
- **A command.** The Tools view and the palettes have one table, `core/commands.ts`: what a view kind offers comes from its row in the model library, `VIEW_KINDS[kind].tools` (`toolGroups`), its title, hint and base name from `TOOL_TITLE`, `TOOL_HINT` and `BASE_NAME`, and what it makes from `place` (an element) or `draw` (a line), each one `edit()`.
- **A line of About.** An entry in `PROBE_LINES` of `core/probe.ts`, in the order About shows them, and its question in the probe's `ask()`, which answers it `yes`, `no` or `told` with the words of `SAID`.

## The rules a change keeps

- **Colours and measures in `shell/theme.ts`**, and nowhere else: stylesheets read them as `--grasp-*` variables, which `main.tsx` puts on `:root`. One file keeps the look in one place until slice 7.
- **Libraries only through `src/vendor.ts`.** The build answers each import from its table and refuses a package that is not in it, and a package whose licence is not on its list. An icon is imported by its path, one by one.
- **A stylesheet beside its component**, imported by it.
- **The tests open the built page from `file://`**, as it is opened for real: build before a browser test. They end by checking that the page logged no error and no warning, and none turns on the CSS domain of the DevTools protocol, which makes Chromium log an error on a page from `file://`.
- **`window.Grasp` is for looking only**: the session, the selection and the views' stores, for Claude and for a person at the console. No test reads it; a test finds what the page shows by the `data-testid` names listed at the top of `test/helpers.mjs`.
- **The old page, the model library and their tests are not touched** while the two pages stand side by side: `test/unchanged.json` lists them.
- **No test is loosened, skipped or marked todo to pass.** A speed limit that cannot be held goes to Damon with its numbers and where the time goes (`plan/slice-1.md`, step 8).

## The commands

From the repository's root:

```sh
npm ci                  # the libraries, at the versions package-lock.json pins
npm run build           # canvas/app/ → canvas/dist/
npm run check           # fails when canvas/dist/ is not what the sources build, or the types do not hold
npm test                # the new page's tests, in Node and in Chromium from file://, one file at a time
npm run shots           # the screenshots into canvas/app/shots/; npm run shots -- shell takes one
npm run test:old        # the old page's and the model library's tests
```

`npm test` runs its files one after another (`--test-concurrency=1`): beside each other, each running a Chromium that draws in software, the timed tests fail on a machine of four processors. One file: `node --test --test-timeout=600000 canvas/app/test/<file>`. The limit is for a whole file, whatever a test inside it allows itself: the test of every line by dragging (`connect.test.mjs`) has five minutes of its own. The timed tests (`scale.test.mjs`, `instant.test.mjs`) print their medians as the runner's diagnostics, and a limit they miss is their failure's message, with every sample split into the script's part and the frame's.

## The screenshots

`npm run shots` writes six PNGs into `shots/`, at 1400 by 900 and twice the density: `shell` (the page as it opens, with no file), `example` (the Stronghold example fitted, both sides collapsed), `nodes` (the interconnection fixture's boxes, ports and lines up close), `scale` (the 5,000-element model's general view, fitted), `palette` (a right-click palette open on a plane), and `about` (the About panel). Steps 5 to 7's are rows of `SHOTS` in `test/shots.mjs`; steps 8 to 12's are files of `test/shots/`. Each was checked by a reviewer that saw only the image and its list from `plan/slice-1.md`, section 4, and `shell.png` and `example.png` were rated on four points as well (`plan/notes.md`, sessions 18 to 27). A change to what a shot shows retakes it in the same commit.
