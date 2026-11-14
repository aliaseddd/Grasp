# Stage E of the scaffold (package 2-1): integration

Worked in /home/user/Grasp, on claude/gracious-fermi-hxid8e, alone, from stage D2's commit 80bd2bc. One local commit,
not pushed: `2db8784`, "wip(2-1): stage E, the stages brought together: the tests of criteria 2, 4 and 5, the shared
helpers, status.json". The tree is clean after it, and the two worktrees are removed. Read first: stage-0.md,
stage-A.md, stage-B.md, stage-C.md, stage-D1.md and stage-D2.md in this folder.

Where the scaffold stands: `npm ci`, `npm run build` and `npm run check` exit 0; `npm test`: **559 tests, 63 suites,
552 pass, 0 fail, 7 todo**, 401 s, no timed test over its limit. The seven todo tests are the plan's seven.

Three points need the lead before round 1 starts. They are first under "Open points".

## What was done, step by step

### 1. Stage D's five files, and the helpers

- `helpers.mjs`, `core.mjs`, `fixtures.test.mjs`, `connect.test.mjs`, `reconnect.test.mjs` copied whole from
  /home/user/wt/2-1-tests. `helpers.mjs` and `core.mjs` were untouched in the main tree since stage B, so nothing was
  merged by hand.
- **Moved into `helpers.mjs`, and their copies taken out of the test files:**

  | Was | In | Now |
  |---|---|---|
  | `thingsOf(page, viewId)` | seams.test.mjs | `thingsIn` (stage D's) |
  | `thingOn(viewId, 'el:Host')` | seams.test.mjs | `thingOf(viewId, 'el', 'Host')` (stage D's) |
  | `toastOf(page)` | seams.test.mjs, keys.test.mjs | `toast` (stage D's) |
  | `nextToast(page, after, why)` | seams.test.mjs, and written out in keys.test.mjs | `toastAfter` (stage D's) |
  | `control(id)` | seams.test.mjs | `actionControl` (stage D's) |
  | `cameraOf(page, viewId)` | seams.test.mjs | `cameraOf`, **added to helpers.mjs by this stage** |
  | `idle(page)` | seams.test.mjs (10 frames), keys.test.mjs (60, slice 1's) | `idle(page, frames = FRAMES)`, **added by this stage**; seams passes 10, keys keeps 60 |

- **Left in seams.test.mjs, as that file's own** (no other file needs them, and none is seam 12's): `rectOf`,
  `controlOf`, `tipOf`, `stripOf`, `editorTabs`, `paletteRows`, the bench (`bench`, `B`, `vendorPlugin`,
  `standInPlugin`, `BENCH_ENTRY`), `shellBench` with `SHELL_SWAPS` and the stand-in sources. `tooltipOf` of
  keys.test.mjs and of move.test.mjs are slice 1's and stay.
- **`thingOf` gives a list of two selectors** (the plane's, the component body's). Where seams.test.mjs goes on from
  it to a child it now writes `:is(${thingOf(...)}) > [data-grip="left"]`. The helper is as stage D tried it.
- **The helpers stage D could not try, tried against what stage C built** (all in seams.test.mjs, which passes):

  | Helper | Tried how | Verdict |
  |---|---|---|
  | `toast`, `toastAfter` | every toast of seams.test.mjs and keys.test.mjs now goes through them: a refused key, a tool's saying, a stand-in action's | right |
  | `openNotes` | "the Notes panel stands on the left strip…" opens the panel through it, in the built page | right |
  | `rightClickOn` | the local right-click of the shell tests is built on it: a box and the ground, in the application with stand-in rows | right |
  | `chooseAction(page, id)` | Delete and Add note chosen through it in the palette | right |
  | `chooseAction(page, id, choice)` | a new step of "the palette lists an action that applies": `show-in-view` with `App`, through the second level (`data-choices`, `data-choice`) | right |
  | `actionControl` | every `[data-action]` selector of seams.test.mjs | right |
  | `pinOf` | the bench's stand-in free pin is found by it (one assertion added to the marks test) | right |
  | `noteIn` | nothing draws a note's card yet | **not tried against the application** |

  No helper had to be mended.

### 2. The whole diff against section 4 and the brief: what fell between the stages

Read: `git diff 780788b` for canvas/app/src (82 files) against seams 1 to 12, section 3's list, the brief of 2-1 and
the "Owns" and "Fills" of every later brief. Found and mended:

1. **A grip carried no `data-testid="grip"`** (seam 12 lists it; stage D1's open point 3). `plane/nodes/Grips.tsx`:
   each of a node's grips and each of a line's two now carries it, and the contract says so. Seen in the page with
   the stand-in in: 40 grips of 40.
2. **Four files of section 3's list did not exist**: `plane/nodes/sequence/LifelineNode.tsx`, `MessageEdge.tsx`,
   `plane/nodes/geometry/FootprintNode.tsx`, `AxesNode.tsx` (the list writes "nodes/sequence/* 2-1 → 2-10 index.ts
   (the types the registry takes), LifelineNode.tsx, MessageEdge.tsx", and the same for geometry). Each is now a
   skeleton: its package's contract as its comment, from the brief's "Decided", and one component that renders
   nothing. Nothing imports them; `index.ts` still exports `nodeTypes` and `edgeTypes` as null, so the two kinds keep
   their cards. See "Built otherwise", 2, for the one thing in them the plan does not give.

Checked and found right: every export of seams 1 to 11 with its signature (the departures are the ones stages A, B
and C reported, and are listed again below); every function that should throw `"<name>: package 2-N builds it"` (19
of them: `grep -rn "builds it" canvas/app/src`); every skeleton component renders nothing (`Badge`, `Pins`,
`FreePins`, `ConnectLayer`, `ConnectMenu`, `LabelEditor`, `ZoomReadout`, `TextTab`, the three sections, and now the
four node files); every reader, body, placer, ender and set of node types that is not built is null; every array of
rows is empty with its rows of section 5 as its comment (checked row by row against the table: ids, titles, keys,
sentences); every skeleton names its own `data-testid` of seam 12. No stale pointer to a stage is left in a comment.

Found and NOT mended, because each is the plan's to settle: the three open points at the top of "Open points".

### 3. plan/status.json

Slice 2 stays "in progress", `"plan"` and `"criteria"` as they were, `"package": "2-1"`, `"next_package": "2-2 to
2-9"`, a note of two sentences, and `"checks"`: the twelve of section 9's table in the form of slice 1's (`id`,
`check`, `test` as "file › name", `status`). Seven are "todo" (1, 3, 8, 9, 10, 11, 12) and five "pass" (2, 4, 5, 6,
7), as the column "After the scaffold" says. Each `test` was checked to be a title in its file. The note names no
session number: the lead adds it. Nothing else of the file changed.

### 4. The stand-in for the measurement of criterion 9

`/tmp/claude-0/-home-user-Grasp/c7f4c0c3-3293-5171-8b1a-2fc91a0152d6/scratchpad/scaffold/standin-connect.patch`: one
file, `canvas/app/src/plane/gestures/connect.ts`, the last five lines (`export const connectOf … = null;` and its
comment) replaced by stage 0's stand-in block. From /home/user/Grasp: `git apply <patch>` puts it in, `npm run build`,
measure, `git apply -R <patch>` takes it out, `npm run build` again. It applies to `2db8784` (checked after the
commit). Never committed.

With it in and the page built (`node …/scratchpad/e/standin-look.mjs`; the picture is `e/standin-example.png`):

- The example's plane carries `data-grips`; **13 of its 13 nodes hold their grips, 40 grips** (four on each of the 9
  boxes, one on each of the 4 border items), each with `data-testid="grip"`. The view opens at 54%, so every node is
  near.
- With the pointer on a node its grips show: 13 of 13, and each has a grip that can be pressed.
- A press on Page's grip, dragged onto App and let go: `data-connecting` while it lasts, the stand-in saw the press
  with the node's element and the pointer over App; afterwards the same things are drawn, the camera and the boxes
  are where they were, nothing is picked, Undo is greyed, no toast, nothing logged.

`node --test --test-timeout=120000 canvas/app/test/scale.test.mjs`, alone, once, stand-in in: **7 of 7 pass.** Its
medians are in the table under "Measurements".

**Which tests of the full suite fail with the stand-in in** (one full `npm test` with it in, run for this: 559 tests,
551 pass, **1 fail**, 7 todo, 393 s):

- `seams.test.mjs › without a gesture no grip is mounted and the root says nothing of grips`: it holds exactly what
  the stand-in undoes ("The skeleton mounts a grip…": 40 grips and `data-grips` where it asks for 0 and none). It is
  the only one.
- No other test notices the grips, and no timed test went over its limit in that run.
- `npm run check` fails while the stand-in is in the sources and not in `canvas/dist`, or passes if dist was built
  with it; it is no test of the suite.
- The three todo tests of criteria 4 and 5 stay todo and fail further on, as stage D1 said: connect at its first
  drag ("no new toast came up"), both of reconnect at the first line's grip ("The "to" grip of the line s-ServerHost
  … lies under something else"). They do not count as failures.

Then the stand-in was taken out and the page built again: `git status` showed no change in `connect.ts` or in
`canvas/dist` from it, and `npm run check` held.

### 5. The worktrees

`git worktree remove --force` for /home/user/wt/2-1-grips and /home/user/wt/2-1-tests; `git worktree list` shows the
main tree alone. Kept before that, in this folder: `stage-0-probe/` (stage 0's `probe.mjs`, `classes.mjs`,
`ports.mjs`, `near.mjs`, `shots.mjs`, `linehover.mjs`, `variants.sh`, `pan.sh`, `sum.py`, `pansum.py`, `plane.diff`,
`small.diff`, `last.json`, `grips.keep.css`, `connect.keep.ts`, `handover/`), beside `connect-stand-in.ts`, which was
here already and is byte for byte `connect.keep.ts`. Stage 0's shell scripts still name the removed worktree's
paths. Stage D1's scratch scripts in `scratchpad/d1/` imported from the tests' worktree; their paths now name
/home/user/Grasp.

### 6. The last run

In this order, nothing else running: `npm ci` (exit 0), `npm run build` (exit 0; 12 files, 3819.3 kB), `npm run
check` (exit 0: "canvas/dist is what the sources build.", and the types hold), `npm test`:

```
# tests 559
# suites 63
# pass 552
# fail 0
# cancelled 0
# skipped 0
# todo 7
# duration_ms 400981
```

559 is stage D2's 553 and the six tests of fixtures, connect and reconnect. The seven todo: fixtures (17 views),
capabilities, connect, reconnect (two), refusals, retired. No timed test failed, so none was run again.
`capabilities.test.mjs` now counts 68 of 112 names without a test, as stage D2 foresaw.

## What changed in this stage, file by file

- `canvas/app/test/helpers.mjs`, `core.mjs`: stage D1's; `helpers.mjs` plus `cameraOf` and `idle`.
- `canvas/app/test/fixtures.test.mjs`, `connect.test.mjs`, `reconnect.test.mjs`: stage D1's, unchanged.
- `canvas/app/test/seams.test.mjs`: takes eleven helpers from helpers.mjs; its own copies gone; two steps added (a
  choice made through `chooseAction`; `pinOf` on the bench's free pin). No assertion taken out or weakened.
- `canvas/app/test/keys.test.mjs`: `toast`, `toastAfter` and `idle` from helpers.mjs; its two copies gone.
- `canvas/app/src/plane/nodes/Grips.tsx`: `data-testid="grip"`.
- `canvas/app/src/plane/nodes/sequence/LifelineNode.tsx`, `MessageEdge.tsx`, `geometry/FootprintNode.tsx`,
  `AxesNode.tsx`: new skeletons.
- `canvas/dist/app.js`: rebuilt (the grips' attribute).
- `plan/status.json`: slice 2's entry.

Nothing under canvas/src or canvas/test, no file that unchanged.json lists (unchanged.test.mjs passes), no plan/*.md,
no package.

## Built otherwise than the plan says, each with its reason

1. **`cameraOf` and `idle` are in helpers.mjs, and seam 12's table names neither.** `cameraOf` was in seams.test.mjs
   only; `camera.test.mjs` (2-14, five tests of the camera) will need the same read, and no package may change
   helpers.mjs. `idle` was written twice (seams, keys).
2. **The four node skeletons type their props as React Flow's bare `NodeProps` and `EdgeProps`.** The plan gives the
   files' names and no signature. Their packages own them and write them whole; nothing imports them.
3. **`LifelineNode.tsx` exports one component** though the brief names two node types of it (`lifeline`,
   `lifeline-line`). The comment says both are the file's.

The departures of the earlier stages stand as their reports give them; the ones the lead still has to accept or turn
down are gathered under "Open points", 4.

## Tests of slice 1 that were changed

None in this stage. In keys.test.mjs only helpers moved: slice 1's `idle` is now helpers.mjs's with the same 60
frames, and the scaffold's own three tests there read the toast through `toast` and `toastAfter`. Over the whole
scaffold the changed tests of slice 1 are stage A's four (commands.test.mjs twice, tools.test.mjs, adapter.test.mjs)
and stage B's one (validation.test.mjs), each with its sentence in its stage's report.

## Measurements

Container: 4 processors, Node 22.23.4. Nothing else was running; the load average was 0.4 to 1.7, my own runs.

scale.test.mjs's medians, in ms (starting / following, or opening / joining):

| | stand-in in, alone | stand-in in, full run | **the last full run (2db8784)** | `elevateEdgesOnSelect` tried, full run | limit |
|---|---|---|---|---|---|
| the 5,000-element model opens | 792 | 677 | **680** | 700 | 5,000 |
| a drag step | 13.9 / 9.3 | 11.8 / 9.8 | **14.4 / 10.7** | 15.6 / 11.4 | 16 |
| a keystroke in a name | 43.2 / 33.9 | 34.1 / 26.8 | **39.7 / 33.2** | 38.6 / 29.8 | 50 |
| a keystroke, Validation shown, 150 problems | 33.0 / 30.9 | 25.4 / 22.9 | **36.7 / 30.1** | 32.1 / 35.0 | 50 |
| a pan step, definitions | 9.9 / 10.5 | 10.9 / 11.5 | **10.8 / 10.4** | 9.5 / 9.5 | 16 |
| a pan step, deployment | 10.5 / 12.2 | 8.7 / 12.0 | **10.5 / 11.2** | 9.1 / 10.3 | 16 |
| a pan step, workflows (2,112 nodes) | 15.0 / 17.5 | 20.4 / 15.1 | **15.5 / 17.9** | 19.3 / 18.5 | 25 |

instant.test.mjs's medians, in ms:

| | stand-in in, full run | **the last full run** | limit |
|---|---|---|---|
| the page is ready | 202.0 | **193.0** | 500 |
| the example is drawn | 107.7 | **97.0** | 1000 |
| a tab switch | 37.3 | **33.0** | 100 |
| a drag step of the example | 3.6 | **4.1** | 16 |
| a keystroke in a name of the example | 9.7 | **10.9** | 16 |

| Command | Result |
|---|---|
| `git apply standin-connect.patch && npm run build && node …/e/standin-look.mjs` | 13 of 13 nodes with grips, 40 grips; a press does no harm |
| `node --test --test-timeout=120000 canvas/app/test/scale.test.mjs` (stand-in in) | 7 of 7 |
| `npm test` (stand-in in) | 559 tests: 551 pass, 1 fail (the seams test that holds "no grip is mounted"), 7 todo; 393 s |
| `npm ci`; `npm run build`; `npm run check` (the tree that is committed) | exit 0 each |
| `npm test` (the tree that is committed) | **559 tests: 552 pass, 0 fail, 7 todo; 401 s** |
| `git apply try-elevate-edges.patch && npm run build && npm test` (open point 2; taken out again) | 559 tests: 552 pass, 0 fail, 7 todo; 393 s |

**Criterion 9's measurement is not complete by this stage.** The plan asks for three runs of `npm test` in a row with
the grips mounted, each of the four medians into plan/notes.md. This stage made one full run with the stand-in in
(every limit held) and one run of scale.test.mjs alone. Two more full runs with the patch in are the lead's.

The logs, beside this folder: `stage-e-standin-scale-1.log`, `stage-e-standin-test-1.log`, `stage-e-npmci.log`,
`stage-e-build.log`, `stage-e-check.log`, `stage-e-test-1.log`, `stage-e-elevate-test-1.log`.

## Open points for the lead

Before round 1:

1. **`npm test` cancels a test file after 120 s, whatever a test's own limit is** (stage D1's open point 1). The plan
   gives criterion 4's test "a time limit of its own of five minutes"; `package.json` runs every file with
   `--test-timeout=120000`, and node applies that to the file's process. Stage D1 measured 73 s for the 776 drags
   alone with the stand-in, before package 2-2's gesture adds its checks to each and seven more tests to the file. So
   `connect.test.mjs` will be cancelled once 2-2 builds it, and 2-2 owns neither `package.json` nor a way around it.
   Not mended: `package.json` is in no list of section 3, and a longer limit for every file is the lead's call (a hung
   test would then take that long to fail). What would mend it: a longer `--test-timeout` in the `test` script; or
   criterion 4's test in a file of its own, run by a second command of the script.
2. **19 of the 116 line-end grips of the ten files cannot be pressed as the scaffold draws them, criterion 5's first
   line among them** (stage D1's open point 2, stage 0's point 5). With React Flow's `elevateEdgesOnSelect` on the
   plane, 0 of 116. `Plane.tsx` is the scaffold's, seam 3 allows a package no other plane prop, and the prop changes
   what a person meets (a selected line is drawn over the boxes it crosses), which the brief's four differences do
   not list. So it is not built. What this stage adds to the numbers: with the one line in (`try-elevate-edges.patch`
   in this folder, applied, measured and taken out), the full suite is as without it, 552 pass, 0 fail, 7 todo, and
   the medians are in the table above. No test of slice 1 notices it. The other way stage 0 named is a portal for
   `EndGrips`, which needs the relationship's id as a prop, a change of seam 6's `EndGrips({ points })`.
3. **Line 32 of section 7 names a test of slice 1 that does not exist under that name** (stage D2's open question 1):
   the plan ends "…in the groups of its kind", the test "…in the groups of its kind's row". `capabilities.test.mjs`
   cannot pass at the slice's close while they differ. The plan is Damon's and the test's name is the lead's; neither
   was changed.

To accept or turn down, from the earlier stages (each is in its stage's report with its reason):

4. `--grasp-zoom` by a rule of a `<style>`, not on the plane's root (B, 1: 136 to 180 ms a zoom step against 27).
   Save is an ActionButton only while the file is unsaved (C, 1). The keydown listener in the capture phase (C, 8).
   `KeyPlace.widget`, a fourth field (A, 1). Backspace is no alias of Delete, against seam 8's comment (A, 2).
   `NodeGrips`'s optional `side`, a small node's grip at the bottom, a press on a grip never a click on its node,
   grips in the view's units, 3.4 to 6.7 px on the screen as the files open (stage 0, 1 to 4). The Validation test of
   slice 1 that the plan does not name among the tests that change (B). `sequenceReader` as `Reader<Projection>`, and
   `SequenceEnd` with no form (A, 11). The Notes skeleton's sentence, "The notes come with package 2-7." (C, 14).
   `attend` and `point` of the pass-through `notesOf` throw too, though they change no note (A).
5. Keys that acted in slice 1 and are no shortcut now: Ctrl + Shift + S, Ctrl + Shift + Y, Escape with a modifier
   (A, 3; C, 2). Escape lets go of the selection from more places than before (C, 3).
6. For the briefs of round 1: the palette lists an action only where it applies, so "Add note is greyed and says
   why" cannot be met in the palette (C, 5; for 2-7); the focus after an entry of the palette (C, 6; for 2-3);
   `hitAt` answers with a line where a line crosses a box (stage 0, 5; D1, 10; for 2-2); a line's marks are outside
   the line's element, so `Badge` makes the Hit itself for a line (B, 5; for 2-6); package 2-5 owns no stylesheet and
   outlines the landing box through the class `landing` (B, 7).
7. `noteIn` of helpers.mjs is tried against a made-up page only. Package 2-7 is the first to meet it.
8. `npm run shots` rewrites the six committed pictures with other bytes, since the left strip names Notes (D2, 7). No
   picture was retaken; the plan gives that to 2-14.
9. An empty test file counts as one passing test: `camera.test.mjs` is one of the 552.

## What I tried and dropped

- **`thingOf` wrapped in `:is(…)` inside helpers.mjs**, so that a caller can go on from it to a child. Dropped: stage
  D tried the helper as it is in about 1,900 presses, and the two callers that need it wrap it themselves.
- **The bench of seams.test.mjs moved into helpers.mjs.** One file uses it, and it would bring esbuild into every
  test file's imports.
- **`tipOf` and `controlOf` moved into helpers.mjs** for 2-14's two page tests of refusals. No file but
  seams.test.mjs uses them today, and 2-14 owns refusals.test.mjs and can write what it reads.
- **`package.json`'s `--test-timeout` raised** (open point 1), and **`elevateEdgesOnSelect` kept** (open point 2):
  each was looked at, the second measured, and both left out as the lead's.
- **The first write of status.json** cut the file at the wrong `{ "id": 3,` (a check of slice 1); the file was put
  back from the commit and written again. Nothing of it reached a commit.

## Left for the lead

- The three open points, before the briefs of round 1 go out.
- Two more full runs with `standin-connect.patch` in, for criterion 9, and the four medians into plan/notes.md.
- plan/notes.md's entry for the package (criterion 11): this folder's seven reports hold every measurement with its
  command, every file built otherwise than the plan names, and everything tried and dropped.
- The five wip commits (2199594, a12091d, df6b93d, 80bd2bc, 2db8784) squashed into the package's one commit.
