# Slice 2, session 31: hand-over. The scaffold is built and not landed

Session 31 (November 14, 2026) was halted by Damon at about 14:10 UTC so that the conversation could be moved. This
folder is what the next session needs and would otherwise have lost with the container. Once package 2-1 has landed,
the folder can go: what belongs in `plan/notes.md` is then there.

## Where things stand

- **Branch `claude/gracious-fermi-hxid8e`, one commit on top of `780788b`**: the scaffold (package 2-1 of
  `plan/slice-2.md`) as seven agents built it, in stages 0 and A to E. Each stage's own report is in `stages/`.
- **The tree passes**: `npm run check` exits 0; `npm test`, alone on the container, gave `# tests 559`, `# pass 552`,
  `# fail 0`, `# todo 7` in 401 s, with every timed test inside its limit (stage E's run, on the tree before this
  folder and the state documents were added; they change no source and no test).
- **Package 2-1 is not landed.** `plan/status.json` says so: `"package": "2-0"`, `"next_package": "2-1"`. The twelve
  checks of section 9 are in it, seven todo, as the runner counts.
- **Nothing of packages 2-2 to 2-15 is begun.**

## What is left of package 2-1, in order

1. **The lead's decisions** (below). Three need a change in the tree.
2. **A review of the scaffold**, not run. `workflows/scaffold-review.js` is written for it: five reviewers of the
   seams, and one for each of packages 2-2 to 2-15 who plays that package's builder with only its brief and looks for
   what is missing. What is wrong in the scaffold is paid for by every builder of rounds 1 and 2, who cannot mend it.
3. **The mends** that 1 and 2 ask for, then `npm run build`, `npm run check`, `npm test`.
4. **Criterion 9's measurement**: three runs of `npm test` in a row with nothing else running, with grips mounted by
   `stages/standin-connect.patch` (applied, built, run, taken out, built again; never committed), each run's four
   medians into `plan/notes.md`. Done so far: one full run and one run of `scale.test.mjs` alone with the patch in,
   every limit held. With the patch in, one test fails by design: the seams test that holds "no grip is mounted".
5. **The session's entry in `plan/notes.md`** completed from the stage reports (what cannot be read from the plan or
   the code: measurements with commands, what was built otherwise than the plan says, what was tried and dropped, the
   tests of slice 1 changed with the plan's sentence), `plan/status.json` set to package 2-1, and the landing commit.
   Whether the landing commit is made on top of this one or takes its place (a forced push) is Damon's to say:
   criterion 10 counts one landing commit for each package.

Then round 1 (packages 2-2 to 2-9 and the camera's part of 2-14), as section 9 of the plan orders it.

## Decisions waiting for the lead

Each has the lead's leaning from session 31. None was applied.

1. **A selected line's end grips.** 19 of the 116 line-end grips of the ten files cannot be pressed as drawn (they
   lie under a node or another line), criterion 5's first line among them, so package 2-2 could not make
   `reconnect.test.mjs` pass from its own files. `elevateEdgesOnSelect` on the plane's React Flow frees all 116;
   with it the full suite was 552 pass, 0 fail, 7 todo with every limit held (`stages/try-elevate-edges.patch`).
   It changes what a selected line lies over. Leaning: apply it in the scaffold.
2. **`npm test` cancels a test file after 120 s**, whatever a test's own limit is (`package.json`,
   `--test-timeout=120000`). The plan gives criterion 4's test five minutes; its 776 drags took 73 s against a
   stand-in before package 2-2's gesture and its seven other tests. Leaning: `--test-timeout=600000` in
   `package.json`, which is the lead's file. No test's own limit changes.
3. **Line 32 of section 7** names a test of slice 1 by a title it does not have: the plan ends "in the groups of its
   kind", the test "in the groups of its kind's row" (`tools-panel.test.mjs`). `capabilities.test.mjs` cannot pass at
   the slice's close while they differ. Leaning: rename the test (contract 27), so the plan stands.
4. **Departures from the plan's letter to accept or turn down.** Leaning: accept each, and write it into the notes.
   - `--grasp-zoom` is set by one style rule for `.grasp-marks`, React Flow's viewport portal and its label renderer,
     not on the plane's root: on the root it cost 136 to 180 ms a zoom step in the 2,112-node view against 27 to 28.
   - Save is an `ActionButton` only while the file has unsaved changes; otherwise the bar shows its own greyed button,
     as slice 1 does. The row `save` always applies, so an `ActionButton` would never grey it.
   - The page's one keydown listener is in the capture phase. `KeyPlace` has a fourth field, `widget`.
   - Backspace is no alias of Delete (section 2 says so; seam 8's comment says otherwise).
   - A grip is in the view's units: 3.4 to 6.7 px on the screen at the zoom the ten files open at.
   - `NodeGrips` takes an optional `side`; a small node's grip is at the bottom; a press on a grip is never a click;
     `EndGrips` takes the route's points; `drawsLines(session, viewId)` is in `core/commands.ts`.
   - `views/lends.ts` is a file the plan does not name. `viewOption` and `rootChoices` of `core/actions/views.ts`
     (package 2-4's file) are built already, because the option rows need them.
   - One test of slice 1 beyond the plan's list changed: `validation.test.mjs › a hidden or collapsed Validation
     panel checks nothing…`, by contract 8 of `plan/architecture.md` (the checks run while a body is shown).
   - Three keys that slice 1's code took and its contract never named no longer act: Ctrl/⌘+Shift+S, Ctrl/⌘+Shift+Y,
     Escape with a modifier. One Escape that closes a menu also lets go of what is picked when no tool is in hand.
5. **What the builders of rounds 1 and 2 must be told**, since the plan does not say it (the stage reports' open
   points have each with its evidence): the palette returns the focus a frame after an action ran, so an action that
   puts the focus somewhere does so a frame later (2-3, 2-7); after a click on a view's tab the focus is in a tablist,
   where arrows, F2 and typing do not act (2-3, 2-14); "Add note is greyed and says why" can only be the Notes
   panel's button, since the palette lists an action only where it applies (2-7); a line's marks are outside the
   edge's element, so `Badge` makes its `Hit` itself (2-6); `hitAt` gives a line where a line crosses a box, and the
   pointer comes to a grip from its node (2-2); a package takes `pending` off in its own `shots/<name>.mjs`; the
   class `landing` outlines the box a dragged box would land in (2-5). The briefs point a builder at the session's
   entry of `plan/notes.md`, so these go there.

## This container's times

The container of session 31 was about a quarter slower than session 30's, and ran close to the limits with no change
at all. On `780788b`, untouched: `npm test` gave 470 tests, 468 pass, 2 fail in 353 s, both failures timed tests of
`scale.test.mjs` (a drag step 17.3 ms starting against 16; a pan step of the 2,112-node view 26.0 against 25).
`scale.test.mjs` alone, three times: pass, fail (a pan step of definitions 14.7 / 18.1 against 16), pass. So a timed
failure is run again alone before anything is concluded, the scaffold's cost is judged against this baseline, and no
limit is touched.

## The files

| File | What it is |
|---|---|
| `stages/stage-0.md` | The grips tried in the page before anything was built on them: React Flow leaves a press on a grip alone, and no limit moved. `stages/stage-0-probe/` holds its scripts. |
| `stages/stage-A.md` to `stage-E.md` | Each stage's report: what it built, its tests, where it departed from the plan and why, its open points. A: the core's seams. B: the plane's and the views'. C: the shell's and the panels'. D1: the shared test parts and the tests of criteria 2, 4 and 5. D2: the tests of criteria 3 and 6, the retired page's test, the screenshots' skeletons. E: integration. |
| `stages/standin-connect.patch` | The stand-in for `connectOf` that mounts grips on every near node, for criterion 9's measurement. Never committed into the sources. |
| `stages/try-elevate-edges.patch` | Decision 1's one line. |
| `workflows/scaffold-build.js` | The workflow that built the scaffold, as it ran. |
| `workflows/scaffold-review.js` | The review of step 2 above. `args: { base, head, pick }`. |
| `workflows/round-packages.js` | Rounds 1 and 2: for each package a builder in its own worktree (`/home/user/wt/<id>`, made by hand from the round's commit, `npm ci` run), a reviewer who did not write the code, rework, and a reviewer who sees only the screenshot and its list. `workflows/make-args.py <round> <commit> "<words>"` writes its arguments from `workflows/shots.json`, which holds section 6's nine lists. |
| `workflows/land.js` | Lands built packages one after another: one commit each, checked alone, pushed. |

The scripts are for the session's Workflow tool. Each names the old session's scratch folder in a constant near its
top (`S`, `PK`): set it to the new session's. The harness runs two agents of one workflow at a time on a 4-processor
container, so round 1 was to be three workflows of three packages each, and the landings one workflow after all three
had ended, with nothing else running. Damon's word for the session: agents on Fable 5.2 at high effort
(`{ model: 'fable', effort: 'high' }`).
