# 9-rework-dock: the view in front, when a split or floating group closes

## The goal, and why

Step 9 of slice 1 of Grasp (`plan/slice-1.md`, step 9) built the shared selection, which knows which view is in front (`selection.view`, set by the dock through `selection.front()`). The Explorer marks that view's row (`aria-current`), and from step 11 the Tools view lists that view's tools. An independent review of the built page reproduced this defect:

- Open `interconnection.json`; drag the `definitions` tab to the editor's right edge, which splits the editor; close that tab with its ×. Now `selection.view` is null and no row is marked, while `fuelSystem` is the one tab left, shown in front. Floating the tab (Shift + drag) and then closing the floating tab does the same. The Tools view would then say that no view is in front while one is shown.
- Cause: `apply()` of the front rule in `canvas/app/src/shell/Dock.tsx`. When Dockview removes the active group, its `activePanel` is not a view panel, and the view that was in front has no panel left, so the rule sets none without looking at the views whose panels are still there.

You fix the rule, with a test that you first see fail. This is a rework of task `9-impl-dock` (brief: `plan/swarm/briefs/9-impl-dock.md`); the files are yours for this task.

## Read first, in this order

1. `plan/slice-1.md`, step 9 (section 5).
2. `canvas/app/src/shell/Dock.tsx` (the front rule at the end of its contract comment and the effect that applies it) and `canvas/app/src/shell/dockContext.ts`.
3. `canvas/app/src/core/selection.ts` (`front`, `view`).
4. `canvas/app/test/selection.test.mjs` (test "the row of the view in front is marked, and follows the tabs") and `canvas/app/test/helpers.mjs`.
5. The reviewer's probes `/home/user/probes/9-review-code/p12.mjs` and `p13.mjs`, which reproduce it (split, and floating); run one with `cd /home/user/wt/9-rework-dock && npm run build && node /home/user/probes/9-review-code/p12.mjs`. Read them; do not change them. A probe may read `window.Grasp`; a test may not.

## What the rule becomes

When Dockview's active panel is a view's panel of this session, that view is in front (as now). Otherwise the view that was in front stays while it still has a panel (as now). Otherwise, in place of none: the view of an editor group's active panel that is a view's panel of this session, the first such group in Dockview's order (`api.groups`); none only when no view of this session has a panel. Say so in the contract comment of `Dock.tsx`, in its words.

## The files you own

`canvas/app/src/shell/Dock.tsx`, `canvas/app/test/selection.test.mjs`.

## Tests

Add to `selection.test.mjs` one test for the split case and one for the floating case, each by the gestures a person makes (a tab dragged to the editor's right edge; a tab dragged with Shift held), ending with `finish(opened)`: after the tab is closed, the remaining view's row carries `aria-current="true"`. See each fail against the code as you found it, with a sentence that says what the page lacks, before you fix the code. Then:

```sh
npm run build && npm run check
node --test --test-timeout=120000 canvas/app/test/selection.test.mjs canvas/app/test/shell.test.mjs canvas/app/test/explorer.test.mjs canvas/app/test/plane.test.mjs
```

All must pass.

## What to send back

The two tests' first failing lines before the fix; the files' summaries after it; the contract's new words.

## Where you work, and the rules

Your worktree is `/home/user/wt/9-rework-dock`, at a commit that holds step 9 whole, with `node_modules/` in place (skip `npm ci`). Run every command from there (`cd /home/user/wt/9-rework-dock && …`), and change files only under it. `/home/user/Grasp` is the lead's and every other folder under `/home/user/wt/` is another agent's: never change anything there. Playwright and its Chromium come with the machine; install nothing. When done, commit the files you own, each added by name.

1. Change only the files you own. 2. Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`. 3. No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold. 4. No test is loosened, skipped or marked todo. 5. No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol. Something that looks wrong is a reason to stop and say why.
