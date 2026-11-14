# Stage D, first part, of the scaffold (package 2-1): what the tests share, and the tests of criteria 2, 4 and 5

Built in the worktree `/home/user/wt/2-1-tests`, a detached checkout of stage B's commit `a12091d`. No commit was made
anywhere, and nothing in `/home/user/Grasp` was changed. Stage C worked in the main tree at the same time. Read first:
stage-0.md, stage-A.md and stage-B.md in this folder.

## For stage E: what to bring into the main tree

Five files, each whole, from `/home/user/wt/2-1-tests/canvas/app/test/`:

| File | State |
|---|---|
| `helpers.mjs` | changed: 427 lines added, 5 changed. Stage C did not touch it. |
| `core.mjs` | changed: 141 lines added. Stage C did not touch it. |
| `fixtures.test.mjs` | new: 3 tests, 1 todo |
| `connect.test.mjs` | new: 1 test, todo |
| `reconnect.test.mjs` | new: 2 tests, both todo |

Nothing else in the worktree differs from `a12091d`: the stand-in is out of `plane/gestures/connect.ts`, `Plane.tsx` is
as stage B left it, and `canvas/dist` is the build of those sources (`npm run check` exits 0).

Three open points need the lead before package 2-2 starts. They are first under "Open points".

## The verdicts asked for

1. **The numbers of `plan/notes.md` hold**, every one, worked out again in Node from the library's `first` and `ends`
   and draw's two own checks: 2,260 ordered pairs in the 11 graph views, 1,742 refused, 456 that fit one kind, 62 that
   fit several, 221 classes, each of the eight kinds allowed in some class. Each of the nine relationship kinds has a
   line that a graph view draws with another node that may take one of its ends; for a connection it is `sensing`,
   and the message's is in the sequence fixture's general view, as the notes say.
2. **Each todo test fails for the reason its check names** (the first lines are below).
3. **With the stand-in gesture in, criterion 4's test drives the page correctly, all of it**: 776 drags of 776, each
   pressed on a grip of the right element and let go over the right element.
4. **With the stand-in in, criterion 5's two tests do not reach their first drag as the scaffold stands**: the `to`
   grip of the first line, `s-ServerHost`, lies under another line. With one prop more on the plane
   (`elevateEdgesOnSelect`, tried and taken out again) they drive the page correctly for all nine kinds. Open point 2.

## What was built, file by file

### `helpers.mjs`

- `TESTIDS`: the fifteen names of seam 12 (`body`, `notes`, `note`, `archiveList`, `pin`, `badge`, `grip`,
  `connectMenu`, `labelEditor`, `textTab`, `text`, `textProblems`, `viewSection`, `codeSection`, `newView`).
- `SIDES` gains `Notes`. `showSide` now fails in a sentence when no strip names the panel (it waited 30 s before).
- The helpers of seam 12's table: `thingsIn`, `thingIn`, `linesIn`, `gripOf`, `dragBetween`, `rightClickOn`,
  `chooseAction`, `toast`, `pressKey`, `saveAndRead`, `exportOf`, `withNote`, `openNotes`, `noteIn`, `pinOf`.
- Beside the table, because the table's helpers or both drag test files need them: `bodyOf(viewId)` (a component
  body's root), `thingOf(viewId, type, id)` (the selector behind `thingIn`), `actionControl(id)`, `lineClass(kind)`,
  `pointOn(page, viewId, type, id)` with `freePointOf` (a point where a click, a press or a drop is on the thing
  itself), `endsAt(page, viewId, relId, fromId, toId)` (how far a line's drawn ends lie from two elements' nodes),
  `labelIn(page, viewId, type, id)`, `saidSoFar(page)`, `toastAfter(page, after, why)`, `EXPORT`.

What each one does that the seam's table does not say:

- **`thingsIn`** reads `data-of` inside a plane and `data-thing` inside a component body, each once, sorted, and keeps
  only what begins with `el:` or `rel:`. A view that shows the card gives `[]`.
- **`linesIn`** gives `cls` as the one class of the edge that is a `line.cls` of the library, sorted by id.
- **`pointOn` and `gripOf` answer in whole px, and try the point as such.** A real mouse move to a fractional point can
  land on something other than what `document.elementFromPoint()` answers there: 1 px above a box's top edge
  `elementFromPoint(459.7, 540.9)` gave a line's grip, and the mouse moved to the same point was on the box (it became
  `:hover` and its own grip came up). Mouse events report whole px (`clientX` 100 for a move to 100.7). At whole px
  the two agreed in every press made here, about 1,900.
- **`gripOf(page, viewId, id, grip = null, { covered = 'fail' })`.** With no grip named it gives the first of a node's
  grips that nothing covers, and says which (`{ x, y, grip }`). For a node it first puts the pointer on the node
  where the node itself is on top, so the grip is reached from its node. For a line it selects the line by a click
  where nothing lies over it; when another line lies along all of it, by its row of the Explorer. `covered: 'null'`
  gives null for a grip that is mounted and shown but lies under something, for a test that then takes another pair.
- **`dragBetween`** waits for nothing after the release.
- **`chooseAction`** clicks `[data-action]` inside the palette; with a choice, `[data-choices="<id>"] [data-choice]`,
  which are the names stage C built.
- **`toast`** gives `said` null for a toast with no `data-said`. `toastAfter` then says so.
- **`pressKey`** reads `Mod`, `Shift` and `Alt` before the key, and presses a letter as a keyboard sends it.
- **`saveAndRead`** saves by Ctrl + S, not by the bar's button: the button is greyed while nothing is unsaved.
- **`exportOf`** runs `canvas/export.mjs` on a file of its own and gives its stdout. A state with problems (exit 1,
  lines "problem: …" on stderr) still gives its text.
- **`withNote(state, target, text)`** takes an id or `{ type, id }`. The note is the last of the copy's `notes`, with
  the id `n-test-<no>`.

### `core.mjs`

- `pairsState()` (async): the generated model, as a state file's object, made once for a test file. Beside it
  `graphKinds()` and `admittedBy(viewKind)`.
- `loadWith`: no code changed. Its comment now says which modules of slice 2 load in Node: `views/lends`,
  `plane/gestures/connect`, `plane/gestures/pin` (each tried), beside `plane/viewStore` and `panels/fieldHooks`.

`pairsState()` holds 82 elements in four views: 40 in the general view, 14, 18 and 10 in the other three. The pairs of
kinds are 400, 49, 81 and 25: 555. By the rules, of those 555: 493 refused, 57 fit one kind, 5 fit several (general
374 / 23 / 3, interconnection 43 / 4 / 2, action flow 53 / 28 / 0, state transition 23 / 2 / 0).

### `fixtures.test.mjs`

| Test | Now |
|---|---|
| the example and the nine fixtures each open: 17 views, each drawn by its own body, nothing logged | todo |
| each of the ten files, opened and saved from the page, exports its pinned text | passes |
| two views of one model are shown side by side, each drawn | passes |

The third passes today with no todo mark, so it is written: the interconnection fixture's two graph views, the second
tab dragged by the mouse to the right half of the first. When the four bodies have landed, package 2-14 may want a
file whose two views are of different renderers.

### `connect.test.mjs`

One test, todo, with a time limit of its own of 300,000 ms: "in each graph view kind, a drag between each pair of node
kinds draws what the rules allow and says why for what they refuse". It asserts the notes' numbers itself before its
first drag.

### `reconnect.test.mjs`

Two tests, both todo, under the plan's names. The nine lines and what is done with each:

| Kind | File, view | Line | End | Goes to | May not go to, and why |
|---|---|---|---|---|---|
| Specialization | stronghold-proof.json, proofStructure | `s-ServerHost` | to | `Page` | `Page.hosts`: "part def ServerHost can only specialize another part def." |
| FeatureTyping | the same | `t-hosts` | to | `Page` | `Page.hosts`: "Pick two different elements." |
| ConnectionUsage | interconnection.json, fuelSystem | `sensing` | to | `System.pump` | `Fuel`: "A connection joins two parts, two ports or two items; item def Fuel is none of those." |
| InterfaceUsage | the same | `fuelLine` | to | `System.outlet` | `Fuel`: "An interface joins two ports." |
| FlowConnectionUsage | the same | `command` | to | `System.outlet` | `Fuel`: "A flow joins two ports or items." |
| BindingConnectorAsUsage | the same | `outletBinding` | to | `System.tank.fuelOut` | `Fuel`: "A binding joins two ports or two items." |
| SuccessionAsUsage | behavior-actions.json, releaseFlow | `s-start` | to | `Release.test` | `Release`: "A succession leads to an action or a control node; action def Release is neither." |
| TransitionUsage | behavior-states.json, hostStates | `t-initial` | to | `HostLifecycle.loading` | `HostLifecycle`: "A transition leads to a state, an action or done; state def HostLifecycle is none of those." |
| Message | sequence.json, loginStructure | `m-login` | to | `Login.client` | `Client`: "A message joins events and lifelines; part def Client is neither." |

## How each todo test fails, first line

Without the stand-in, on the tree that is handed over:

| Test | First line of its failure |
|---|---|
| fixtures, 17 views | "6 of the 17 views are not drawn by their own body: In browser.json, modelTree (a browser view) shows the card "A browser view is not drawn yet.", not the view drawn by its own body." Then the other five: `pageTree`, `plan`, `elementTable`, `definitionMatrix`, `loginSequence`. |
| connect | "The node of Page in the view v-proof holds no grip (data-grip), so no line can be dragged from it: a grip is mounted on a near node, and at each end of a selected line, of a view that draws lines, once lines are drawn by dragging." |
| reconnect, both | "The selected line s-ServerHost in the view v-proof holds no "to" grip (data-grip), so its end cannot be dragged: a grip is mounted on a near node, and at each end of a selected line, of a view that draws lines, once lines are drawn by dragging." |

With the stand-in gesture in `plane/gestures/connect.ts` (stage 0's block, from `connect-stand-in.ts` in this folder):

| Test | How far it gets |
|---|---|
| connect | The first drag is made (`Page` to `Page.hosts`), then: "In stronghold-proof.json, proofStructure: a line dragged from part def Page to part hosts in Page must be refused with "part def Page can only specialize another part def.": no new toast came up (data-testid "toast", after data-said 0). No toast is up." |
| reconnect, both | Not to the drag: "The "to" grip of the line s-ServerHost in the view v-proof lies under something else, so the pointer cannot press it: to under `<g class="react-flow__edge react-flow__edge-line specialization nopan selectable">`." |
| reconnect, with `elevateEdgesOnSelect` on the plane as well | The drag is made. Test 1: "…the to end of the specializes line s-ServerHost (ServerHost specializes Host), dragged to part def Page, is not drawn to it. Its drawn ends are {"from":0.000015735626220703125,"to":113.19727063179016} px away from ServerHost and Page." Test 2: "…dropped on part hosts in Page, must be refused with "part def ServerHost can only specialize another part def.": no new toast came up…" |

**Every drag checked against the stand-in.** A copy of each test file, with its comparisons replaced by a reading of
the stand-in's `data-probe`, was run in the worktree and deleted again:

- **connect: 776 drags of 776 right.** For each: the press was on a grip of the first element (`saw.element`), the
  line went past 4 px, the pointer at the release was over the second element (`saw.overType` `el`, `saw.over`), one
  `pointerup`, no cancel, no lost capture. 221 of them are the classes of the ten files (18 in the example, 83 in
  behavior-actions, 24 in behavior-states, 1 in geometry, 90 in interconnection, 5 in sequence) and 555 the generated
  model's. No class and no pair of kinds was left without a pair that could be dragged.
- **reconnect, with `elevateEdgesOnSelect`: 27 drags of 27 right.** For each of the nine kinds: the `to` grip pressed
  with the line's relationship, let go over the node that takes it; over the node that refuses it; over the ground.

## Open points for the lead

1. **`npm test` cancels a test file after 120 s, whatever a test's own limit is.** The plan gives criterion 4's test "a
   time limit of its own of five minutes". With `node --test --test-timeout=120000`, the runner gives each *file* that
   limit and cancels it there; a test's own `timeout` does not lengthen it. Tried: a file with one 8 s test whose own
   limit is 20 s, run with `--test-timeout=5000`, is reported "test timed out after 5000ms", cancelled. The 776 drags
   alone, checked by nothing but the stand-in's probe, took 113 s with 6 moves a drag and 73 s with 3 (the test now
   uses 3). Package 2-2's gesture adds its own cost to each, its checks about 10 to 40 ms each, and its brief puts
   seven more tests into the same file. So `connect.test.mjs` will pass the 120 s once 2-2 lands. `package.json` is
   not this stage's. What would mend it: a longer `--test-timeout` in the `test` script, or the test in a file of its
   own with nothing beside it. The plan says neither.
2. **19 of the 116 line-end grips of the ten files cannot be pressed**, as the scaffold draws them, at the zoom each
   view opens at. Criterion 5's first line is one of them. What lies over each:
   - `s-ServerHost` and `s-OnlineHost`, `to` end, in `proofStructure` (in five of the files, so 10 of the 19): three
     specializations end at one point of `Host`, and a later line lies over the selected line's grip.
   - Six in `releaseFlow` of behavior-actions: `s-split-lint` to, `s-test-rejoin` from, `s-publish` from, `s-notify`
     from, `s-publish-collect` to, `s-notify-collect` to.
   - `sensing`, `from` end, in `fuelSystem`: wholly under the port `System.controller.ctrl`, which sits at the middle
     of that side. Its `to` end, the one criterion 5 drags, can be pressed only on a sliver beside `System.tank`.
   - `m-check`, both ends, in `loginStructure`: the line `m-ok` runs along all of it.
   With `elevateEdgesOnSelect` on the plane's React Flow (one line in `Plane.tsx`, tried here and taken out again):
   **0 of 116**. This is stage 0's open point 5 with its numbers. As the scaffold stands, package 2-2 cannot make
   `reconnect.test.mjs` pass by its own files: `Plane.tsx` is the scaffold's.
3. **A grip carries no `data-testid="grip"`.** Seam 12 lists `grip` (with `data-grip`) among the new names;
   `plane/nodes/Grips.tsx` gives a grip `data-grip` and `data-pass` only. `gripOf` finds a grip by `data-grip`, so it
   works either way. `TESTIDS.grip` is there and nothing uses it.
4. **The order of kinds in `pairsState()` is the view kind's own `admits` list**, and the library's order of kinds
   where the row admits all. The brief says "two elements of each kind the view admits" and gives no order. It
   matters in the state transition view only: by `admits` the done nodes land in the first state def; by the
   library's order they would land in the first action.
5. **Where `pairsState()` puts things is this stage's choice** (the brief gives the order of tries, not the points):
   rows on the ground, a border item at a quarter and three quarters of a side, control nodes in three columns. The
   model is made twice, the first time to learn each owner's final size. The function throws if two boxes of one
   owner overlap.
6. **A line drawn says nothing, by the test.** After a drawn line the test asserts that no new toast came up. Flow 1
   has only refusals said; the plan does not say outright that a drawn line is silent.
7. **A "defined by" line drawn from a usage that has one already** is checked as the plan's section 5 has it: no new
   line, the usage's one typing with its other end moved. "One new line of that kind", the brief's words, is not true
   of that case when the typing is drawn in the view already, so the test also checks, for every drawn line, that it
   runs from the one node to the other (`endsAt`, within 2 px).
8. **"Its label kept" is read as**: the line says what its kind's row says of the relationship with the one end
   moved (the library's `line.label`, asked in Node), and the saved relationship is the old one with that end changed
   and nothing else.
9. **One rule of `reconnect.test.mjs` is not exercised by the ten files**: the usage end of a "defined by" line going
   to a usage that has a definition already (package 2-2's own sentence). Every one of the nine lines has its `to`
   end dragged. The test's `refusal()` holds the rule after the library's four checks; the brief does not say which
   comes first.
10. **`hitAt` finds a line where a line crosses a box** (stage 0's point). `pointOn` gives a point of the box where
    the box itself is on top, so the drops of these tests never fall on such a line.

## Helpers tried, and not

Tried against the worktree's built page (stage B's sources, with the stand-in where a grip is needed):

| Helper | How |
|---|---|
| `thingsIn`, `thingIn`, `linesIn` | The 11 graph views of the ten files: equal to what the graph reader lists, and to the views' lines with their kinds' classes. |
| `pointOn` | Every node and every line of the 11 views: the thing is on top at its point. One line has none (`m-check`). |
| `gripOf` (node), `dragBetween` | 153 nodes of 153 have a free grip; 153 drags to the next node, and the 776 of the connect test, each read back from the probe. |
| `gripOf` (line) | 97 of 116 line ends; 116 of 116 with `elevateEdgesOnSelect`. |
| `rightClickOn` | A box, a line and the ground of the example: the palette opens with its tools. |
| `pressKey` | Fourteen keys read back from a `keydown` listener; `Mod+Z` undoes a rename. |
| `saveAndRead`, `exportOf` | The ten files, in `fixtures.test.mjs`. |
| `withNote` | The example with a note on `Host`, opened and saved: the note comes back as written. Nine lines in the reconnect probe. |
| `endsAt`, `labelIn` | The nine lines of the reconnect tests, before any drag. |

Tried against stage C's built page, read only (`file:///home/user/Grasp/canvas/dist/index.html`, its commit
`df6b93d`): `toast` with its `said` and `toastAfter` (Ctrl + Z twice: "There is nothing to undo." with 1, then 2),
`openNotes` (the skeleton's panel shows), `pressKey('Escape')` lets go of what is picked, `saveAndRead` by Ctrl + S.

Tried only on a made-up page (a `data-testid="body"` with `data-thing` rows, a pin, a toast, a palette with a second
level, a Notes panel, put into the document by the script): `thingsIn`, `thingIn` and `pointOn` for a component body,
`rightClickOn` on a row and on a body's ground, `chooseAction` with and without a choice, `noteIn`, `pinOf`.

Not tried against anything the application renders: `chooseAction` (no action is in the palette yet), `noteIn` and
`pinOf` (no note and no pin is drawn), anything in a real component body (none is built).

## Measurements

Container: 4 processors, Node 22.23.4. Stage C worked in the main tree beside every run (load average 1.4 to 2.8).

| Command | Result |
|---|---|
| `npm run build` | exit 0 |
| `npm run check` | exit 0: "canvas/dist is what the sources build.", and the types hold |
| `npm test`, first run | 543 tests, 60 suites: 539 pass, 0 fail, 4 todo; 397 s |
| `npm test`, second run, on the tree that is handed over | **543 tests, 60 suites: 538 pass, 1 fail, 4 todo; 408 s.** The one: a timed test, below |
| `node --test --test-timeout=120000 canvas/app/test/scale.test.mjs`, alone, afterwards | 7 of 7 pass, first run |

The 543 are stage B's 537 and the 6 new. Between the two full runs only comments of `core.mjs` and one unused name
changed.

The timed failure of the second full run: `scale.test.mjs` › "a pan step of a fitted view takes under 16 ms at 5,000
elements, under 25 ms for the 2,112-node action flow view": a pan step of `definitions` took 20.2 ms starting and
10.6 ms following, against 16. This stage changes no source of the page. The medians, in ms (starting / following, or
opening / joining):

| | full run 1 | full run 2 | alone | limit |
|---|---|---|---|---|
| the 5,000-element model opens | 835 | 880 | 768 | 5,000 |
| a drag step | 15.8 / 9.5 | 10.6 / 11.6 | 13.7 / 9.1 | 16 |
| a keystroke in a name | 34.5 / 26.8 | 45.6 / 32.2 | 40.1 / 40.9 | 50 |
| a keystroke, Validation shown, 150 problems | 31.2 / 28.2 | 34.7 / 29.7 | 34.0 / 35.5 | 50 |
| a pan step, definitions | 9.5 / 9.6 | **20.2** / 10.6 | 10.9 / 11.2 | 16 |
| a pan step, deployment | 9.3 / 10.5 | 8.0 / 10.3 | 12.9 / 10.0 | 16 |
| a pan step, workflows (2,112 nodes) | 15.0 / 15.8 | 14.9 / 15.8 | 13.1 / 12.2 | 25 |

`instant.test.mjs`, full runs 1 and 2: ready 215 and 225, the example drawn 116 and 108, a tab switch 35 and 34, a
drag step 4.8 and 4.0, a keystroke 11.6 and 9.4 (limits 500, 1000, 100, 16, 16).

How long the new files take in a full run: `fixtures.test.mjs` 13.4 s, `connect.test.mjs` 1.0 s, `reconnect.test.mjs`
1.2 s (the two fail at their first grip). With the stand-in: the 776 drags 113 s at 6 moves a drag, 73 s at 3
(146 and 94 ms a drag; a mouse move waits for a frame). The reconnect probe, 27 drags with their files opened: 13.5 s.

Worked out in Node:

- The rules as `connect.test.mjs` holds them (the library's `first` and `ends` and the two own checks) against the
  core's `drawProblem`, for every ordered pair and every kind of the row, in the ten files and `pairsState()`: 15,412
  answers, 0 different. The test itself asks nothing of the core but `pairsState()`.
- `pairsState()` takes about 0.2 to 0.3 s to make.

The scratch scripts are in `/tmp/claude-0/-home-user-Grasp/c7f4c0c3-3293-5171-8b1a-2fc91a0152d6/scratchpad/d1/`
(they import from the worktree): `numbers.mjs` (the notes' numbers), `rc.mjs` (criterion 5's nine lines), `eq.mjs`
(the rules against `drawProblem`), `try-helpers.mjs` (every node, line and grip of the 11 views; it needs the
stand-in), `try2.mjs`, `try3.mjs` (the made-up page), `try-c.mjs` (stage C's page), `diag3.mjs` (the whole-px
finding). The logs: `stage-d1-test-1.log`, `stage-d1-test-2.log` and `stage-d1-scale-1.log`, beside this folder.

## Built otherwise than the plan says, each with its reason

1. **Helpers beside seam 12's table** (listed above). `pointOn` is what `gripOf` and `rightClickOn` need inside, and
   the drag tests need it for where a line is let go. `toastAfter` is the wait every refusal's test makes.
2. **`gripOf` has a fifth parameter, and `grip` may be left out.** The table writes `gripOf(page, viewId, id, grip)`.
   A box's four grips are not all free (stage 0), and the test must be able to take another pair.
3. **`connect.test.mjs` drags with 3 moves, not `dragBetween`'s 6.** For time, open point 1. The helper's default is
   the seam's.
4. **A class of the ten files has stand-by pairs**: when no grip of the first pair's first element can be pressed, the
   next pair of that class in the same view is dragged. In the ten files none is needed today: each of the 153 nodes
   has a free grip. Whether the generated model used one was not counted. The brief says "one pair of each class".
5. **`fixtures.test.mjs`'s first test gathers every view that is wrong** and fails once, with all of them, so that the
   message shrinks as the four bodies land.
6. **`loadWith` gained no entry**: it takes any path already, and the three new modules load. Its comment names them.
7. **No commit**, as the task says for this stage.

## Tests of slice 1 that were changed

None. In `helpers.mjs`, `showSide` asks that the strip names the panel before it clicks; every test that calls it
passes as before.

## What was tried and dropped

- **Points with fractions of a px.** The first `pointOn` and `gripOf` gave a grip's exact middle. A press 1 px above
  `ServerHost` then landed on the box's own grip and not on the line's. Whole px since.
- **Rings of points around a line's grip, tried in Node.** Replaced by every whole px of the grip's rectangle, tried
  in the page in one call.
- **`pairsOfKinds(state)` in `core.mjs`**, one pair for each pair of kinds. Dropped: the test groups the pairs
  itself, with stand-bys, and the brief asks `core.mjs` for `pairsState()` only.
- **Children put beside each other inside an owner by a click past the owner's edge.** `place()` takes a click
  outside the owner for the ground. The click is on the owner's bottom edge instead, and the owner grows.
- **One making of `pairsState()` with a fixed grid.** The first action def grows to 334 high with its twelve control
  nodes; a grid wide enough for it put the general view near the far zoom.
- **A row of 2,200 for the ground.** With the side panels open the general view then opened at about 34%. 1,600
  gives about 46%.
- **`exportOf` failing on any stderr.** A state with problems prints them there and still prints its text.
- **The words of the undo step read from the bar's tooltip** (`wordsOf`) for "one undo step". The tests press
  Ctrl + Z once instead and look at the plane, the saved file and whether Undo is greyed.

## Left for later stages

- **Stage D, second part**: `capabilities.test.mjs`, `refusals.test.mjs`, `retired.test.mjs` with their three todo
  marks, and the screenshots' skeletons. `# todo` is 4 here and 7 with those.
- **Stage E**: the five files into the main tree. `seams.test.mjs` holds its own `thingsOf`, `thingOn`, `toastOf` and
  `nextToast`; `thingsIn`, `thingOf`, `toast` and `toastAfter` of `helpers.mjs` do the same, and `cameraOf` is still
  only there. The measurement of criterion 9 with the stand-in.
- **Package 2-2**: the three todo marks; open points 1, 2, 6 and 9 touch its tests.
