# 9-impl-explorer: the Explorer: its rows and its panel

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is built in `canvas/app/` (React, React Flow for the planes, Dockview for the tabs and side panels, MUI X Tree View for the Explorer), beside an old page that must not change. Slice 1 of the rebuild is built in thirteen steps; this task is part of step 9, "The shared selection and the Explorer": one selection, kept for the open file, that every plane and every panel reads and sets, and the Explorer, a tree of the model at the left. The step's design is settled in `plan/swarm/step-9.md`, which was checked against the libraries' sources and a throwaway build. You make no design decision: where something you need is not said, stop and say what is missing.

You build the Explorer: `canvas/app/src/panels/explorerRows.ts`, a session's rows with no React in them, and `canvas/app/src/panels/Explorer.tsx`, the panel that draws them with MUI X Tree View 8.29.3 (the free edition, which has no virtualization) and joins them to the session's selection. Both files hold their contracts as comments, written against Tree View's own source and a throwaway build that drew the 5,000-element model's tree. The stylesheet, `explorer.css`, is written; you import it.

## Where to read, in this order

1. `plan/swarm/README.md`, "Words" and "The rules every brief carries", and `plan/swarm/shared.md`, sections 1, 3 and 7.
2. `canvas/app/src/panels/explorerRows.ts`, whole, and `canvas/app/src/panels/Explorer.tsx`, whole: the two contracts. Then `canvas/app/src/panels/explorer.css`, `canvas/app/src/panels/SidePanel.tsx` and `canvas/app/src/shell/dockContext.ts`.
3. `canvas/app/src/core/selection.ts`, whole: the selection you read and set. It is built already in your worktree.
4. `plan/swarm/step-9.md`: section 1, "The Explorer"; section 3, "The Explorer"; section 4, the tables of `explorer-rows.test.mjs` and `explorer.test.mjs`; section 6, the measurements.
5. `canvas/src/browser/lib.js` (`browserRows`) and `canvas/src/browser/page.js`, `browserRowParts`: the old page's rows and their words, which you port. Read only.
6. Tree View's own source, under `node_modules/@mui/x-tree-view/`: `useTreeItem/useTreeItem.mjs` (what `getRootProps`, `getContentProps`, `getIconContainerProps` and `getGroupTransitionProps` give, and where `event.defaultMuiPrevented` is read), `TreeItem/TreeItem.mjs` from line 212 (how its own item is put together around `TreeItemProvider`), `internals/plugins/selection/itemPlugin.mjs` (the `aria-checked` you take off), `internals/plugins/keyboardNavigation/TreeViewKeyboardNavigationPlugin.mjs` (the keys), `RichTreeView/useExtractRichTreeViewParameters.mjs` (the props).
7. `canvas/app/src/core/adapter.ts`, lines 60 to 90: what of the model library is declared already. `KindRow` has no `label`, and a row of `RELATIONSHIPS` is declared with its `line` only: read a kind's and a relationship kind's `label` through a cast of your own in `explorerRows.ts`, since a property of the library's type cannot be declared twice with two types.
8. `canvas/app/test/explorer-rows.test.mjs` and `canvas/app/test/explorer.test.mjs`: the tests you make pass.

## The files you own

- `canvas/app/src/panels/explorerRows.ts`
- `canvas/app/src/panels/Explorer.tsx`
- `canvas/app/src/panels/explorer.css`

## The work, the tests and the commands

All from the root of your worktree, which the lead made for you from the commit that holds what you need:

```sh
npm ci                # node_modules/ from the lockfile, about 15 s; once
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open; again after every change to a source file
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Run single test files, never `npm test`: other agents share this machine, and the lead runs the whole suite alone. You build `canvas/dist/` to run browser tests and do not hand it over. A timed test (one that fails on a number of milliseconds) is judged by the lead alone, with nothing else running: if one fails for you beside other work, say so with its numbers and go on.

**`explorerRows.ts`:** fill in `explorerRowsOf`. The exported names and signatures stay. `rowId`, `rowOf`, `pickedOf` and the constants are final. Keep a session's rows in a `WeakMap` by the session, as `viewStoreOf` keeps a session's stores.

**`Explorer.tsx`:** replace the body of `ExplorerPanel` and add what it needs in the file, as its comment says. In short: `RichTreeView`, `useTreeItem` and `TreeItemProvider` come from `@mui/x-tree-view`, which `vendor.ts` holds whole. The row is a `forwardRef` component given to `slots.item`; it receives `itemId`, `label`, `id` and `children`. `getContentProps()` also returns a `status` object, which must not reach the `div`. `getRootProps({ onKeyDown })` calls your `onKeyDown` before Tree View's own, which is skipped when you set `event.defaultMuiPrevented = true`. A row reaches the session's rows, the selection and `showView` through a React context that this file makes and provides around the tree, never through a module-level variable. Import `./explorer.css`.

`explorer.css` is written and was seen to give the measures the tests ask. Change it only where a test or the contract asks for something it does not give, and say so.

What not to do: do not use Tree View's own `TreeItem`, its checkboxes or its label editing; do not key the tree by the session or mount it again while a file is open; do not unfold a row or show more of a list to reveal what was picked elsewhere; do not give Tree View new `items` when only a row's words changed; do not change `SidePanel.tsx`, `dockContext.ts`, `Dock.tsx` or `app.css`.

`useDock().showView` throws until the dock's task builds it, which comes after yours. None of the tests you are to pass clicks a view's row.

The commands: `node --test --test-timeout=120000 canvas/app/test/explorer-rows.test.mjs` (13 of 13); after `npm run build`, `canvas/app/test/explorer.test.mjs` (8 of 8). Then `canvas/app/test/shell.test.mjs`, `canvas/app/test/open.test.mjs` and `canvas/app/test/instant.test.mjs`, which passed before you began and must still pass: a tree that widens its panel fails `shell.test.mjs`. `selection.test.mjs`, if it is in your worktree, fails until the plane's and the dock's parts are built. Then `npm run check`.

Done is: those two files pass whole, the three others pass as before, `npm run check` passes, and your three files are committed.

## What to send back

- The files you own, in your worktree, committed there (add them by name; never `git add -A`; not `canvas/dist/`).
- The summary line of each test file the brief names (`# pass`, `# fail`), and for each failing test its name and first line.
- Each thing you decided because the contract was silent, with what you chose; and anything in a contract or a test that you found wrong, with the evidence. If you stopped on one, say where.
- Each place where your code departs from what `plan/swarm/step-9.md` says, with the reason.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings that are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
