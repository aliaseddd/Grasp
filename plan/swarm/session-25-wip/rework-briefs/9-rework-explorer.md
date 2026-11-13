# 9-rework-explorer: the Explorer's ranges, and a rename's cost, after step 9's review

## The goal, and why

Step 9 of slice 1 of Grasp (`plan/slice-1.md`, step 9) built the shared selection and the Explorer. An independent review of the built page, by someone who had not seen the outline, reproduced the defects below. You fix them, each with a test that you first see fail. The work is a rework of task `9-impl-explorer` (whose brief is `plan/swarm/briefs/9-impl-explorer.md`, and whose contract is the comment in `canvas/app/src/panels/Explorer.tsx` and `explorerRows.ts`); the files are yours for this task.

## Read first, in this order

1. `plan/slice-1.md`, step 9 (section 5), and section 2's last item (the Explorer with thousands of elements).
2. `canvas/app/src/panels/Explorer.tsx` and `canvas/app/src/panels/explorerRows.ts`, whole: their contract comments, and the code.
3. `canvas/app/src/core/selection.ts`: the selection's contract (`items`, `last`, `set`, `toggle`, `has`).
4. `canvas/app/test/explorer.test.mjs`, `canvas/app/test/explorer-rows.test.mjs` and `canvas/app/test/helpers.mjs` (how a test opens the page, finds a row, and waits).
5. The reviewer's probes, which reproduce each defect, are in `/home/user/probes/9-review-code/` (`p1.mjs`, `p5.mjs`, `p6.mjs`, `p14.mjs`, `rename.mjs`, `rename2.mjs`); run one with `cd /home/user/wt/9-rework-explorer && npm run build && node /home/user/probes/9-review-code/<file>`. Read them; do not change them. A probe may read `window.Grasp`; a test may not.

## The defects

1. **Shift + click on a row throws "Invalid range" after another file is opened.** Open the example, click row `el:Host`, open `interconnection.json`, Shift + click row `el:Fuel`: the page logs `page error: Invalid range` and picks nothing. The same when the anchor row's element has left the model through an undo. Cause: MUI X Tree View's selection plugin keeps `lastSelectedItem`, which still names a row the tree no longer holds, and its `expandSelectionRange` throws. The page must log nothing, ever.
2. **Shift + click on a row picks nothing when no row was clicked before** (a box picked on the plane, then Shift + click on row `el:DevHost`: the selection stays `[el:App]`). MUI's range returns when it has no anchor.
3. **After a Shift range, the row just clicked (or moved to with Shift + an arrow key) is not the last picked.** Row Host, then Shift + click on DevHost gives `[el:Host, …, el:DevHost]`, so `selection.last` (what Details shows from step 10 on, and what the Explorer scrolls to) is the anchor. The plan's selection is "a list … with the last picked first".
4. **A rename costs too much at 5,000 elements.** `explorer-rows.test.mjs` › "100 renames reword them in under 200" took 274 ms beside other work and 175 to 190 ms alone (the limit is 200). Most of it is `lib.idsOf(model)`, a 5,000-entry Map built through the history's Proxy at every reword, though about 200 rows are shown. Make a reword cost in proportion to the rows shown, not to the model.

## What the fix should be

- A range is the shown rows, in the tree's order, from an anchor to the row clicked (or moved to). The anchor is the item the shared selection picked last (`selection.last`) when it has a shown row; else there is no range, and Shift + click picks the row clicked alone. So a pick on the plane anchors a range in the tree too, and a stale anchor of Tree View's cannot be used: do not rely on MUI's own `expandSelectionRange` for a click (handle Shift + click yourself, and keep Tree View from running its own range for it).
- The range is set with the row clicked or moved to first, then the rest of the range in the tree's order. The package's row and "Show more" rows are never picked, as now.
- Keep every other behaviour of the contract as it is; change a contract comment only to say what the code now does, and say so in what you send back.

## The files you own

`canvas/app/src/panels/Explorer.tsx`, `canvas/app/src/panels/explorerRows.ts`, `canvas/app/test/explorer.test.mjs`.

## Tests

Add to `explorer.test.mjs` one test per defect 1 and 2 (each ending with `finish(opened)`, which fails on any logged error), and one for defect 3 that shows the order in the page itself if you can find a way a person sees it (the Explorer scrolls to the last picked row: a range whose clicked row is far from its anchor, in a list long enough to scroll); defect 4 is held by the existing timed test. Run each new test against the code as you found it and see it fail with a sentence that says what the page lacks, before you fix the code. Then:

```sh
npm run build && npm run check
node --test --test-timeout=120000 canvas/app/test/explorer.test.mjs canvas/app/test/explorer-rows.test.mjs canvas/app/test/selection.test.mjs canvas/app/test/selection-core.test.mjs canvas/app/test/shell.test.mjs
```

All must pass. The 100-renames test is timed: other agents share this machine, so give its figures, and the lead judges it alone.

## What to send back

1. For each defect: the test that holds it, the first line it failed with before the fix, and that it passes now.
2. The test files' summaries after the fix, and the renames test's time.
3. Anything in a contract that you changed, and why.

## Where you work, and the rules

Your worktree is `/home/user/wt/9-rework-explorer`, at a commit that holds step 9 whole, with `node_modules/` in place (skip `npm ci`). Run every command from there (`cd /home/user/wt/9-rework-explorer && …`), and change files only under it. `/home/user/Grasp` is the lead's and every other folder under `/home/user/wt/` is another agent's: never change anything there. Playwright and its Chromium come with the machine; install nothing. When done, commit the files you own, each added by name.

1. Change only the files you own. 2. Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`. 3. No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold. 4. No test is loosened, skipped or marked todo. 5. No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol. An array from the model library (`lib`, loaded in its own realm) is copied into a plain array before `assert.deepEqual`. Something that looks wrong is a reason to stop and say why.
