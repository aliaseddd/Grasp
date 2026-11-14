# Stage B of the scaffold (package 2-1): the plane's and the views' seams

Built in /home/user/Grasp, on claude/gracious-fermi-hxid8e, from stage A's commit 2199594. One local commit: see "The
commit" at the end. Read first: stage-0.md and stage-A.md in this folder.

After this stage the page behaves as stage A left it. Nothing a person meets is new: no grip is mounted, the skeletons
draw nothing, and the middle button dragged the plane already (open point 3).

## For stage C: the two hands a mounted body lends

`views/lends.ts` is the place. A plane lends its camera and its `reveal` while React Flow is mounted; a `BodyFrame`
lends `reveal` when its body gave one. The shell's two hands are these two lines, wherever the dock gives its
`ShellHands` to `handsOf(session)`:

```ts
import { lentCamera, lentReveal } from '../views/lends';

handsOf(session).give({
  save, showText, showView, showPanel, copy,                      // the shell's own
  camera: (viewId, how) => { lentCamera(session, viewId, how); },
  reveal: (viewId, rect) => lentReveal(session, viewId, rect),
});
```

- `lentCamera(session, viewId, how): boolean` moves the camera of that view's plane and answers whether one was
  moved. It does nothing for a view whose body is not mounted, or has no camera.
- `lentReveal(session, viewId, rect): void` brings a place into the body's window. When no body of that view is
  mounted (a hidden tab, or a tab `showView` brought to the front in this very event), the place is kept and revealed
  when the body mounts, the last one asked for only. So an action may call `showView` and then `reveal` at once.
- `core/actions/camera.ts` (2-14) can tell whether a view has a camera without the shell: `graphBodied(renderer)` of
  `core/readers/index.ts`.
- The bench of `seams.test.mjs` gives the hands exactly so (`BENCH_ENTRY`, `handsOf(made).give`), and its tests move a
  plane through them.

Also for stage C:

- `plane/LabelEditor.tsx` is a skeleton that renders nothing. `App.tsx` mounts the one `<LabelEditor session />`.
- `plane/Palette.tsx` is untouched. `BodyFrame` mounts it beside its root, `Plane` inside its root, both as today.
- `shell/Dock.tsx` has the one swap (`ViewHost` in a view's tab) and nothing else of seam 10.
- `shell/theme.ts` gained `WARNING`, `RESOLVED`, `UNFIT`, `GRIP`, `GRIP_OFF`, `BADGE`, `PIN` and their variables
  (`--grasp-warning`, `--grasp-resolved`, `--grasp-unfit`, `--grasp-grip`, `--grasp-grip-off`, `--grasp-badge`,
  `--grasp-pin`). `src/vendor.ts` has the seven icons of the brief.
- `seams.test.mjs` exists. Stage C adds its two page tests there (the palette lists an action that applies; a greyed
  `ActionButton` carries its sentence). The bench in that file can mount any component with stand-ins.

## For stage D: how a test finds what a plane shows

**`data-of`.** One element inside each node's and each edge's own React Flow element carries
`data-of="el:<element id>"` or `data-of="rel:<relationship id>"`, far and near.

- On slice 1's three node components it is the inert `span.grasp-node-handle`, a direct child of `.react-flow__node`.
- On `LineEdge` it is `path.grasp-line-hit`, inside `.react-flow__edge`.
- A node that stands for no element carries none. Two nodes of one element both carry it (a lifeline's head and line).
- Nothing reads `data-id` as an element's or a relationship's id. It stays React Flow's node or edge id.

So, as `seams.test.mjs` already has them (`thingsOf`, `thingOn`, to move into helpers.mjs):

```js
// thingsIn(page, viewId), for a plane: every data-of inside it, each once, sorted
[...new Set([...document.querySelectorAll(`${planeOf(viewId)} [data-of]`)].map((el) => el.getAttribute('data-of')))].sort()
// thingIn(page, viewId, type, id), for a plane: the React Flow element of the thing; .first() for an element with two nodes
`${planeOf(viewId)} :is(.react-flow__node, .react-flow__edge):has([data-of="${type}:${id}"])`
```

- For a component body the things are `[data-thing="<type>:<id>"]` inside `[data-testid="body"][data-view="<id>"]`
  (seam 2), on the element that takes the click. A `data-thing` that begins with neither `el:` nor `rel:` is no thing.
- `linesIn(page, viewId)`: each `.react-flow__edge` of the plane, its relationship from the `data-of` inside it, its
  `cls` from the edge element's class (the adapter's `className`, beside React Flow's own words).
- `gripOf`: a node's grips are `> [data-grip="top|right|bottom|left"]`, direct children of its `.react-flow__node`;
  a selected line's are `circle[data-grip="from|to"]` inside its `.react-flow__edge`. A grip shows only while the
  pointer is over its node (come to it from inside the node), the node is selected, or a line is in hand. Where a
  border item sits at the middle of a side, the way to that side's grip is under it: select the box, or use another
  side (`Host` of the example: use `left`). Come to a line's end grip from the ground, not across the box it ends on.
- A plane's camera: `cameraOf(page, viewId)` in `seams.test.mjs` reads React Flow's viewport transform.
- The bench (`bench({ files, views, swaps })`, `B(page, name, ...args)`, the two bundler plugins) is in
  `seams.test.mjs`. `connect.test.mjs` cannot use it for the built page, but a test that needs a stand-in can.
- `core.mjs` gained `STAND_IN_PLANE_READER` and `STAND_IN_PLANE_ACTIONS`: a graph body of another renderer, for the
  sequence fixture. `loadWith('views/lends')` works in Node.
- New names a test finds: `data-testid="body"`, `data-renderer`, `data-thing`, `data-of`, `data-label`, `data-grip`,
  `data-grips`, `data-connecting`, `data-over`, `data-pass`, `.grasp-marks`, `.grasp-zoom-readout`.

## What was built, file by file

Paths under canvas/app/src/ unless they begin otherwise.

### New, built

- `views/bodies.ts`: seam 2's `BodyProps`, `OptionRow`, `BodyEntry`, `BODIES` (five entries, with seam 9's option
  rows), `bodyOf`. Beside them `FLOW_PROPS`, `isBuilt(entry)` and `planeTypes()` (see "Built otherwise", 4).
- `views/bodyContext.ts`: `BodyHands`, `BodyContext`, `useBody`.
- `views/ViewHost.tsx`: a view's tab: `Plane`, a component body, or the card in a root like a plane's. `VIEW_GONE`.
- `views/BodyFrame.tsx`, `views/body-frame.css`: the root, the clicks, the palette, the context, `reveal`, `onShown`.
- `views/lends.ts`: `lend`, `lentCamera`, `lentReveal`, `Lent`, `CameraMove`, `ViewRect`.
- `plane/nodes/Grips.tsx`, `plane/nodes/grips.css`: stage 0's, with the outline of what a gesture is over
  (`data-over`) and of the box a dragged box would land in (`.landing`) added to the stylesheet.
- `plane/marks/marks.css`: where `.grasp-marks` stands on a box, a border item, a small node and a line, and its
  scale.
- `plane/zoom.css`: the order of the zoom controls, and the readout's box.

### New, skeletons (each with its package's contract as its comment)

- `views/GridBody.tsx` (2-12), `views/BrowserBody.tsx` (2-13): each exports its body as `null`.
- `plane/nodes/sequence/index.ts` (2-10), `plane/nodes/geometry/index.ts` (2-11): `nodeTypes`, `edgeTypes` as `null`.
  The first holds what the scaffold fixes for any node or edge component of another renderer.
- `plane/gestures/connect.ts` (2-2): seam 6's types to the letter, `GRIP_DISTANCE`, `connectOf = null`.
- `plane/gestures/ConnectLayer.tsx`, `plane/ConnectMenu.tsx` (2-2): render nothing.
- `plane/gestures/pin.ts` (2-7): `PinGesture`, `pinOf` (an idle gesture: nothing in hand, press and cancel do nothing).
- `plane/marks/Badge.tsx` (2-6), `plane/marks/Pin.tsx` (2-7: `Pins`, `FreePins`): render nothing.
- `plane/LabelEditor.tsx` (2-3), `plane/ZoomReadout.tsx` (2-14): render nothing.

### Changed

- `plane/viewStore.ts`: seam 3 (`dragStarted`, `preview`, `zoom`, `watchZoom`; a graph body of another renderer
  read, stepped and ended through its reader and its ender; its marquee by `listed`; a refusal said through
  `saysOf`); the marks beside `selected`, set by `data.element` and `data.relationship`; the store listens to
  `marksOf` only while it has a subscriber; a view whose body is a component has the empty snapshot.
- `plane/Plane.tsx`: node and edge types from `planeTypes()`; every Hit from `elementOf` and `relationshipOf`, a node
  with no element being the ground; `BodyContext` provided; `data-grips`, `data-connecting`, the capturing
  `pointerdown` and the GripPress; one flag for the click that is no click (`swallow`, a marquee, a press on a grip);
  `panOnDrag` the main and the middle button; `onNodeDragStart`; an entry's `flow` spread; the camera and `reveal`
  lent; `ConnectLayer`, `ConnectMenu`, `FreePins`, `ZoomReadout` mounted; `--grasp-zoom`. It no longer shows the card.
- `plane/nodes/BoxNode.tsx`, `PortNode.tsx`, `SmallNode.tsx`: `data-of`, `data-label`, `.grasp-marks` with `Pins`
  and `Badge` when marked and near, the grips.
- `plane/edges/LineEdge.tsx`: `data-of`, `data-label`, `EndGrips` when selected and near, `.grasp-marks` through
  `EdgeLabelRenderer` when marked and near.
- `plane/NotDrawnYet.tsx`: its comment only.
- `shell/Dock.tsx`: the one swap. `shell/theme.ts`, `vendor.ts`: as said above.
- `core/readers/index.ts`: `graphBodied(renderer)`. `core/commands.ts`: `drawsLines(session, viewId)`.
- `core/actions/views.ts` (2-4's skeleton): `viewOption` and `rootChoices`, built, which the option rows are made of.
- `canvas/dist/`: rebuilt (`npm run check` holds).

### Tests (canvas/app/test/)

- `readers.test.mjs`: 7 more, "a graph body of another renderer in a view's store".
- `marks.test.mjs`: 2 more, "the marks on a view's nodes and edges".
- `seams.test.mjs`, new: 4 in the built page, 7 on a bench, 1 in Node.
- `core.mjs`: `STAND_IN_PLANE_READER`, `STAND_IN_PLANE_ACTIONS`.
- `validation.test.mjs`: one test of slice 1 changed (below).

## Built otherwise than the plan says, each with its reason

1. **`--grasp-zoom` is not on the plane's root.** Seam 4 puts it there. A custom property on the root is inherited by
   every node, so writing it styles the whole plane again: in the 2,112-node view a step of a Ctrl + wheel zoom took
   136 and 180 ms (median of 12, two runs) against 24 and 33 ms with nothing written. One rule of a `<style>` element
   in the root now gives the variable to every `.grasp-marks`, to React Flow's viewport portal (free pins, the line in
   hand) and to its label renderer (a line's marks): 27 and 28 ms against 23 and 24. It is still written when the
   zoom changes and never on a pan. What follows: a node's own stylesheet cannot read the variable outside those
   three places; the label editor and the readout ask the store (`zoom`, `watchZoom`). Putting it on the root as
   well later would break nothing that is built on the narrower promise. **The lead's to accept.**
2. **A slice 1 test pins the checks to the Validation panel**, and contract 8 has them run while a body shows them.
   Changed, below.
3. **`views/lends.ts` is a file the plan does not name.** The task asked for the place; it is its own module so that
   the shell imports no React from it and Node loads it.
4. **`views/bodies.ts` exports three things beside seam 2's**: `isBuilt(entry)` (the seam's sentence "an entry counts
   as built when…", which ViewHost needs), `planeTypes()` (the merged node and edge types, the same two objects at
   each call, as React Flow asks) and `FLOW_PROPS` (the short list).
5. **`graphBodied(renderer)` in `core/readers/index.ts`.** The store must not take a grid reader's data for a
   Projection, and it cannot import the registry, which imports React components and stylesheets (the store runs in
   Node). So "its body is a graph body" is said twice: `body: 'graph'` in the registry, and this function. They agree
   today; no test holds the two together in Node, since Node cannot load the registry.
6. **`viewOption` and `rootChoices` in `core/actions/views.ts`, built now.** An `OptionRow`'s `values` and `locked`
   must know a view's mode and the package's top elements, and a file of views/ may read no record (rule 5). 2-4 owns
   the file from the scaffold's commit; these two are finished and its section may use them.
7. **The option rows' words are mine where the plan gives none**: the labels ("Row spacing", "Scale", "Unit", "Grid",
   "Columns", "Sort", "Roots of the tree": the old page's); the sort's choices (`''` "the model's order", then each
   column as `name` "name, A to Z" and `-name` "name, Z to A"); the scale's range as
   `[Number.MIN_VALUE, Number.MAX_VALUE]` for "above 0"; the sentence a matrix locks its columns with ("A matrix has
   no columns: it sets the elements against each other. Show the grid as a table to choose its columns.").
8. **`NodeGrips` and `EndGrips` are called as plain functions** (`{NodeGrips({ far: data.far })}`), as the seam
   writes them. As components they cost a fiber for every node, grip or not, which showed when the 2,112-node view
   is first drawn (599 to 704 ms against stage A's 576 to 654; 558 to 654 as functions).
9. **`.grasp-marks` is rendered only on a marked thing**, node and line alike. The seam says so for a line and says
   "a badge and a pin exist only on a marked thing"; an empty element on each of 2,112 nodes would be a cost.
10. **`FreePins` is mounted only while the view has a free pin**, and near. React Flow's `ViewportPortal` holds a
    subscription whose selector searches the document at every change of React Flow's store, a pan step among them.
11. **A body's outline of what a gesture is over is the attribute `data-over`** (`fits` or `no`) on the React Flow
    element or on the `data-thing` element, drawn by `grips.css` and `body-frame.css`. Stage 0 wrote a rule that
    named the node by its `data-id`, which seam 5 forbids. A node or edge type of another renderer styles its own
    `data-over` where the page's rule does not suit it.
12. **`mark`, `swallow`, the camera and the grips are tested on a bench with stand-ins**, in `seams.test.mjs`, beyond
    the five page tests the brief lists for the plane. The seams are what 2-2, 2-6, 2-7, 2-10 and 2-11 build on, and
    neither probe ran inside the page's own `Plane.tsx` and `viewStore.ts`.
13. **`ZoomReadout` stands after both zoom buttons in the document**, and `zoom.css` orders it between them
    (`order`). React Flow's `Controls` renders its own buttons before its children.
14. **The camera's `left` shows what is to the left** (the plane's content moves right by 80 px), as the old page's
    arrow key does. The plan says "moves by a step".
15. **`reveal` moves the camera only as far as needed**: nothing when the place is 24 px inside the window, to the
    window's middle when it is larger than the window, at the zoom it has. The plan says "brings a place into the
    window".
16. **`BodyFrame`: a control of the body's own stops its click.** Otherwise a click on a header that sorts, or on a
    row's triangle, is also a click on the ground or the row. And `onShown` is not called for the size the root
    mounts with.
17. **`pinOf` gives an idle gesture** where "what a skeleton is" would let it throw: the task said "render or do
    nothing".
18. **Stage 0's six points stand as it built them**, for the lead: `NodeGrips`'s optional `side`; a small node's grip
    at the bottom; a press on a grip is never a click on its node; `EndGrips({ points })` takes the route's points; a
    line's grips are circles in the edge's own svg (half under a node at that end); `drawsLines` in
    `core/commands.ts`.

## Tests of slice 1 that were changed, each with the plan's sentence

1. `validation.test.mjs › a hidden or collapsed Validation panel checks nothing, and shown again it is up to date at
   once`. It asserted 0 checks before the panel was shown, with the example's plane drawn. The sentence
   (plan/architecture.md, contract 8, "Changed in: Slice 2"): "the checks run while any body or panel that shows them
   is shown, not only the Validation panel." And plan/slice-2.md, seam 4: "`marksOf` listens to the checks and the
   notes only while a store listens to it. So the checks run while a body is shown (contract 8), and a hidden tab
   costs nothing." What changed: the first assertion is 1 check, the plane's; then the view's tab is closed, so that
   no body is shown; the rename is made from the Explorer's row, since no plane is left to click the box on; one
   message is reworded. Every other assertion is as it was: with no body shown a hidden or collapsed panel still
   checks nothing. The plan's list of slice 1's tests that change (package 2-14) does not name this test.

No test was loosened, skipped or marked todo. `# todo` is 0: none of the plan's seven todo tests exists yet.

## The tests written first, and how each failed before the code

Node, against stage A's code (`stage-b-node-before.log`), the nine of readers.test.mjs and marks.test.mjs failed:

| Test | Before the code |
|---|---|
| a stand-in reader of another renderer is asked for the projection, a step and the end, and only the pressed node moves | "core.graphBodied is not a function" |
| crossing 25% asks the reader again, far, and a step of a drag in between is drawn far too | "Far, the reader is asked with `far`." |
| preview draws a step that is no node's drag and writes nothing, and null puts the model's projection back | "store.preview is not a function" |
| a marquee picks the things whose rectangle, as the reader lists it, lies inside it | "Only the head lies inside: the node that stands for no element is left out…" |
| in a view of a graph kind every node React Flow reports still moves, whatever the press named | "store.dragStarted is not a function" |
| the store tells its zoom, and whoever watches it hears a zoom and never a pan | "Before any camera the zoom is 1. undefined !== 1" |
| the store of a view whose body is a component draws nothing and asks its reader nothing | "core.graphBodied is not a function" |
| the store puts the marks on its nodes and edges, a new object only where the marks differ, and an unmarked node keeps NO_MARKS and stays the same object through a projection | "Only the node and the edge whose marks differ are new objects." |
| the store listens to the marks only while it is itself listened to: a hidden tab runs no check | "A store that is listened to makes the marks live. 2 !== 3" |

seams.test.mjs, run against stage A's tree with its own built page (`stage-b-seams-before.log`):

| Test | Before the code |
|---|---|
| every node and edge gives its element | "the plane's data-of are not its projection's elements and relationships" |
| every anchor carries data-label | TypeError: no `data-of` in the node of an anchor |
| ViewHost shows a card for a kind with no body | **passed**: slice 1's plane shows the card in the same root |
| the middle button drags the plane | **passed**: open point 3 |
| the seven on the bench | "Could not resolve ./views/lends, ./views/ViewHost" |
| what a mounted body lends the shell (Node) | "Could not resolve ./views/lends" |

Six mutations were tried against the new tests and put back, each failing the test named: the store taking every
dragged node of another renderer (readers); the marks never let go (marks, "hidden tab"); the marks never set (marks);
a Hit built from the node's id, the entry's `flow` not spread, `onNodeDragStart` not handed on (seams, "a graph body
of another renderer"). The last one passed at first: the test pressed the earlier of two picked heads, which is also
the store's fallback. It now presses the later one.

## Measurements

Container: 4 processors, Node 22.23.4. Nothing else of mine ran beside the timed runs below; whether another agent
did, I cannot say (the load average was under 1 before each).

| Command | Result |
|---|---|
| `npm run build` | exit 0; app.js 194.2 kB (172.6 after stage A), app.css 19.7 kB |
| `npm run check` | exit 0 |
| `npm test`, first run | 536 tests, 57 suites: 535 pass, 1 fail, 0 todo; 375 s. The one: the Validation test above |
| `npm test`, last run, on the tree that is committed | **537 tests, 57 suites: 537 pass, 0 fail, 0 todo; 375 s** |
| `node --test … scale.test.mjs`, twice, alone | 7 of 7, 7 of 7 |

scale.test.mjs's medians, in ms (starting / following, or opening / joining):

| | full run 1 | alone 1 | alone 2 | full run 2 (committed) | limit |
|---|---|---|---|---|---|
| the 5,000-element model opens | 737 | 1008 | 735 | 738 | 5,000 |
| a drag step | 15.2 / 12.2 | 11.9 / 13.0 | 11.1 / 10.9 | 10.3 / 8.5 | 16 |
| a keystroke in a name | 33.3 / 33.0 | 38.0 / 39.6 | 31.2 / 28.1 | 42.7 / 31.0 | 50 |
| a keystroke, Validation shown, 150 problems | 34.7 / 29.4 | 31.8 / 33.2 | 44.2 / 39.6 | 35.8 / 34.1 | 50 |
| a pan step, definitions | 10.4 / 9.3 | 9.6 / 12.7 | 8.9 / 9.6 | 12.0 / 11.0 | 16 |
| a pan step, deployment | 9.1 / 10.9 | 8.4 / 9.5 | 9.3 / 10.2 | 8.9 / 12.0 | 16 |
| a pan step, workflows (2,112 nodes) | 15.4 / 15.5 | 14.3 / 19.8 | 15.9 / 16.3 | 17.0 / 17.1 | 25 |

The first three columns were measured before the grips became plain functions and before `--grasp-zoom` left the
root; neither touches a step of a drag, a keystroke or a pan. No timed test failed in any run of this stage.

instant.test.mjs: ready 231 and 234, the example drawn 97 and 120, a tab switch 35 and 35, a drag step 3.8 and 4.2,
a keystroke 11.1 and 10.1 (full runs 1 and 2; limits 500, 1000, 100, 16, 16).

What stage B adds, and what it costs:

- **A step of a drag or of a projection**: one lookup of the marks for each node and edge, beside the lookup of the
  selection that was there. Not measurable in the drag step.
- **A pan step**: nothing. `--grasp-zoom` is not written, no portal is mounted without a free pin, and an unmarked
  node has no new element.
- **The checks are live while a plane is shown** (contract 8). Opening a file checks once, in the plane's first
  subscription: the 5,000-element model opens in 709 to 878 ms over eight runs alone (stage A: 683 to 804). After an
  edit the check runs 0.8 s later; an Undo or a Redo checks inside its event, as with the Validation panel shown.
- **A zoom step** (`node probe-b/zoom.mjs <dist> workflows`, 12 Ctrl + wheel steps of 30 px in the 2,112-node view,
  from the wheel event to the painted frame, median): the variable on the root 135.6 and 179.5 ms; no variable 23.6,
  32.6, 25.3, 28.0, 23.6, 22.8; the rule as built 30.6, 33.2 (the probe's build), 26.6, 27.9 (canvas/dist).
- **A large view first drawn** (`node --test --test-name-pattern="model opens" …scale.test.mjs`, "workflows drew its
  2112 elements N ms after its tab was asked for"): stage A 576, 616, 623, 654; grips as components 599, 654, 704,
  704, 749; as built 558, 599, 602, 654.

## What I tried and dropped

- **`--grasp-zoom` on the root**, as the plan has it: the cost above. And the rule written through the CSSOM
  (`insertRule` once, then `rule.style.setProperty`): a tab's body is not in the document when its plane mounts, so
  the `<style>` has no sheet yet. The rule's text is written instead.
- **The grips as components**: the cost above.
- **The outline of what a gesture is over as a rule of a `<style>`** (stage 0's): it had to name the node by its id,
  or by `:has()`, and every change of it styles the plane again. An attribute on the few elements costs nothing.
- **`data-thing` on a plane's nodes**, the name seam 2 gives a component body's things. There it is on the element
  that takes the click and whose rectangle is the thing's; in a plane the carrier is an inert element of no size. Two
  meanings under one name would have misled the label editor. Hence `data-of`, the word `Badge` and `Pins` take.
- **A shared `NodeMarks` component** for the three node components: the seam writes the pair out in each.
- **A `ReactFlowProvider` around the plane**, to reach React Flow's inside from where `BodyContext` is provided: it
  changes how React Flow's store is made. The hands reach it through a ref that `Picking` fills.
- **Keeping the Validation test's flow and asserting the new counts**: every assertion but one would have turned
  over, and the test's name with them.

## Open points for the lead

1. **`--grasp-zoom` by a rule, not on the root** ("Built otherwise", 1). Seam 4's sentence is otherwise.
2. **The Validation test** ("Tests of slice 1"). The plan does not name it among the tests that change.
3. **The middle button dragged the plane before the scaffold.** React Flow lets button 1 pan whenever `panOnDrag` is
   true (`@xyflow/system`, `createFilter`: `!event.button || event.button <= 1`), from the ground, a node or a line.
   `panOnDrag` is now `[0, 1]`, which says it and changes nothing. So the brief's fourth difference for a person is
   none, and the test passed before the code.
4. **A selected line's end grip under a hovered box's grip.** While the pointer is over a box, or on one of its
   grips, the way to the box's own grip at a side's middle lies over a line's grip that ends there (`s-DevHost` on
   `Host`'s bottom). Coming from the ground the line's grip is free. For package 2-2's brief, with stage 0's points.
5. **A line's marks are outside the line's element** (the label renderer, as seam 4 says). So a click on a line's
   badge reaches no edge: `Badge` must make the Hit itself for a line. Its skeleton says so; 2-6's brief does not.
6. **The first end's outline still names its node by `data-id`** (`Plane.tsx`, the `<style>` of step 11). It is right
   while a head's id is its element's; slice 3 must change it. I left it: the plan asks for Hits only.
7. **Package 2-5 owns no stylesheet** and must outline the box a dragged box would land in. `grips.css` now outlines
   a node whose `className` holds `landing`, and the store's contract says so. The plan names no way.
8. **`PlaneNode` and `NodeData` still cannot hold a node of another renderer without a cast** (stage A's point 6).
   The stand-ins use the shape `rect`. The store and the plane read only `id`, `position`, `data.element`,
   `data.marks`, `data.far`, `selected` and `dragging` of a node, so a cast is safe.
9. **`hasReader` and `isBuilt` can differ** inside a body's own worktree (stage A's point 7): tools are listed from
   the reader alone, the body is drawn from both.
10. **canvas/app/README.md** now has stale lines ("the component that draws it in `NODE_TYPES` of `plane/Plane.tsx`").
    The plan gives the README to 2-14's closing.
11. **Criterion 9's stand-in for `connectOf`** is kept outside the tree as
    `scaffold/connect-stand-in.ts` in this folder: stage 0's whole `connect.ts`, with its stand-in block. Put the
    block in place of the last line of `plane/gestures/connect.ts`. It reads `press.element`, which is now the
    node's element, so it works unchanged.

## Left for later stages

- **Stage C**: the shell's `ShellHands` with the two lent hands (top of this report); `<LabelEditor session />` in
  `App.tsx`; the palette's `ActionItem`s; the rest of seam 10 in `Dock.tsx`; its two tests in `seams.test.mjs`.
- **Stage D**: `thingsIn`, `thingIn`, `linesIn`, `gripOf` and the bench into helpers.mjs, from what is said above;
  `open.test.mjs` and `plane.test.mjs` still find a plane's nodes by `data-id`, which is right for them.
- **Stage E**: the measurement of criterion 9 with the stand-in (`connect-stand-in.ts` in this folder). With it the
  grips are mounted on every near node, `data-grips` is on every plane that draws lines, and the hover outline of
  `grips.css` is live. The checks now run while a plane is shown, which stage A's report foresaw: three full runs with
  nothing else running are still to be made.
- **Packages**: each skeleton's comment is its contract. 2-10 and 2-11 read `plane/nodes/sequence/index.ts` and the
  part of `Plane.tsx`'s contract headed "What slice 2's scaffold adds" for what a node or an edge of another renderer
  must carry (`data-of`, `.grasp-marks`, `data-label`, the grips, its own look for `selected` and `data-over`).

## The commit


`a12091d`, local, not pushed: "wip(2-1): stage B, the plane's and the views' seams". 43 files: canvas/app/src/views/
(8), plane/ (21), core/ (3), shell/ (2), vendor.ts, canvas/app/test/ (5) and canvas/dist/ (3). Nothing under
canvas/src, canvas/test or plan/ changed, and no file that unchanged.json lists (unchanged.test.mjs passes). The tree
is clean after it.

The logs of this stage are beside this folder, in
/tmp/claude-0/-home-user-Grasp/c7f4c0c3-3293-5171-8b1a-2fc91a0152d6/scratchpad/: stage-b-node-before.log,
stage-b-seams-before.log, stage-b-test-1.log, stage-b-test-2.log, and probe-b/zoom.mjs.
