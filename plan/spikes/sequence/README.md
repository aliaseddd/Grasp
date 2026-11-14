A graph body: all nine items work on React Flow 12.10.2 through its public props and hooks, with nothing drawn wrong once the reader gives a lifeline as two nodes (three other shapes each show a defect, reproduced below), so the sequence view takes the plane's camera, connecting, culling and frames as they are; the component body is half the code and about twice as fast (one step of a message-row drag on 20 lifelines and 300 messages: 3.7 ms against 7.7 ms), so it is close on cost and not close on what the view gets for free.

# The sequence view: a graph body or a component body

A probe for slice 2, run on November 14, 2026. Its question: should the sequence view be drawn by React Flow as nodes and edges on a plane (a graph body), or by one React component that draws SVG and handles the pointer and the camera itself (a component body)? Both were built on one shared layout function and put through the same script.

## How to run it again

From the repository's root. Nothing is installed: React 18.3.1, @xyflow/react 12.10.2 and esbuild 0.28.2 are read from `node_modules`, and Playwright with its Chromium must be there as `canvas/README.md` says.

```sh
plan/spikes/sequence/build.sh            # bundles a.jsx, b.jsx and c.jsx into plan/spikes/sequence/dist/ (ignored by git)
node plan/spikes/sequence/run.cjs        # every item on each candidate, the tries to break them, the measurements; writes a.png and b.png (about 10 minutes)
node plan/spikes/sequence/run.cjs items     # the items and the tries only (about 4 minutes)
node plan/spikes/sequence/run.cjs measure   # the measurements only
```

The pages open from disk, with classic scripts only: `a.html` (candidate A, React Flow), `b.html` (candidate B, one SVG component), `c.html` (candidate B inside one node of a React Flow plane). Each loads `canvas/dist/model-lib.js` by a relative `<script src>`. What an address may ask for:

| Address | What it shows |
|---|---|
| `?data=synthetic` | 20 lifelines, 270 events, 300 messages instead of the fixture |
| `?camera=x,y,zoom` | the camera to begin with instead of the fit |
| `?long=1` | a lifeline whose name is too long for its head |
| `a.html?frame=1` | A's nodes as children of one frame node (slice 3) |
| `a.html?rows=nodes` | A with a message drawn as a node instead of an edge |
| `a.html?connect=1` | A with real connection handles, and React Flow's own connecting (`?connect=inert`: with the page's inert handle kept, which breaks it) |
| `a.html?cull=1` or `0` | A with only what the window shows mounted, or everything; left out, the page's rule (more than 300 nodes) |
| `a.html?shape=tall`, `?shape=heads`, `?flat=1` | the three reader shapes that show a defect (below) |
| `b.html?spill=1` | B without its cut of a head's name |

The files:

| File | What it is |
|---|---|
| `layout.js` | The layout rule, shared by both candidates, pure: ported from `RENDERERS.sequence.layout`, `insertEvent` and `moveMessageRow` of `canvas/src/sequence/page.js`. `layout()` lays a view out, `at()` says what lies at a point, `write()` writes a gesture's end. |
| `store.js` | One view's state outside React, shared by both: the model, the picked ids, the marks, the camera, the gesture in progress, and a log of the clicks and the gestures' ends. |
| `data.js` | The two models: the fixture with what it lacks added, and the synthetic view. |
| `a-body.jsx`, `a.css` | Candidate A's drawing and input. |
| `b-body.jsx`, `b.css` | Candidate B's drawing and input. |
| `a.jsx`, `b.jsx`, `c.jsx`, `harness.js`, `markers.jsx`, `common.css`, `*.html` | The pages: what each mounts, and `window.Spike`, which the script drives. |
| `build.sh` | Bundles the three pages with esbuild. |
| `run.cjs` | The Playwright script. |
| `a.png`, `b.png` | Each candidate as it opens, 1000 by 700, with a lifeline, an event and a message selected. |

## The items, per candidate

Every check of the script passes on both candidates: 79 checks each (items 1 to 8 on a page of their own, item 9 on the frame's page). "Works" below means the script's checks for the item passed with real pointer events. A workaround is named where one was needed; none patches React Flow or reads its internals.

| Item | A: a graph body (React Flow) | B: a component body (SVG) |
|---|---|---|
| 1. Draws heads, dashed lines, events, messages on rows in time order with labels and closed unfilled heads, a loop, a succession | **Works with a workaround**: the reader must give a lifeline as two nodes and raise the edges (see "The three shapes that fail"). | **Works with a workaround**: SVG text is not cut at a box's edge, so the body cuts a head's name itself (an `<svg>` inside the svg). It has no ellipsis. |
| 2. A click on a head, an event, a message or the ground is told apart, with the id and the point in the view's units; a point on a dashed line resolves to "on lifeline L, between events i and i+1" | **Works.** React Flow's `onNodeClick`, `onEdgeClick`, `onPaneClick`, and `screenToFlowPosition`. The dashed line takes no pointer: a click on it is a ground click, and the reader's `at` resolves its point. | **Works.** One `pointerdown` listener and `closest('[data-seq]')`. The same `at`. |
| 3. Selection shown on a lifeline, an event and a message, several at once, driven from outside | **Works.** `selected` on the nodes and edges, as the page's store sets it. | **Works.** A set of ids from the store. |
| 4a. Drag a head sideways only; the others keep their order rule | **Works with a workaround**: React Flow's own node drag, answered by the store with the layout's place at each step. React Flow drags every selected node, so the store takes only the node `onNodeDragStart` names. | **Works.** |
| 4b. Drag an event up and down its own lifeline only | **Works**, the same way. | **Works.** |
| 4c. Drag a message to another row, the other rows making room | **Works with a workaround**: React Flow drags no edge. The message's edge component takes `pointerdown` on its line and its label, and the store follows the pointer on `window` to the button's release (35 lines). Or the message is a node (`?rows=nodes`), and React Flow's node drag moves it: that works too. | **Works.** |
| 5. A badge with a count on a head, an event and a message's middle, a numbered pin, a free pin at a point | **Works.** Drawn by the node and edge components from their `data`. The free pin is a node that takes no pointer. | **Works.** |
| 6. The name of a head, an event and a message is an element whose screen rectangle can be read at any zoom | **Works.** A `span` in the head; SVG `text` for an event and a message. | **Works.** SVG `text`. |
| 7. The wheel pans, Ctrl with the wheel zooms, a drag on the ground pans; the camera is kept outside React | **Works, with no code of its own**: React Flow with the page's props, `defaultViewport` and `onViewportChange`. | **Works**, with 35 lines of its own. It has no zoom buttons, no fit button and no minimap. |
| 8. Draws in whatever rectangle its host gives it, and says how large its content is | **Works.** | **Works.** |
| 9. Inside a frame on a plane (slice 3) | **Works** (`a.html?frame=1`): its nodes are children of a frame node, and every check of items 1, 2 and 4 passes there. | **Works** (`c.html`): the body inside one React Flow node, and every check of items 1, 2 and 4 passes there. |

For each gesture the script checks that every step is shown (the thing is where the pointer asks at each of six moves, and nowhere else: a head's height does not change, an event's dot stays on its dashed line), that nothing is reported before the end, that exactly one result is reported at the end (`{ kind: 'lifeline', id, x }`, `{ kind: 'event', id, lifeline, index, y }`, `{ kind: 'message', id, row, order }`), that the end is no click, and that the plane's camera did not move.

## The three shapes that fail on React Flow

Each is a way the reader could give the view to React Flow that looks right on the fixture and shows a defect on a larger view. The script reproduces each and prints a line that begins with FAIL. (It prints six such lines in all: four for these three shapes, one for the inert handle below, and one for candidate B with its cut left out. Every other line is ok.)

1. **A lifeline as its head node alone, with the dashed line drawn out of it** (`a.html?shape=heads&data=synthetic&cull=1&camera=20,20,1`, then scroll down). With only what the window shows mounted, which the page turns on above 300 nodes, React Flow unmounts a head that has left the window, and its dashed line goes with it: 0 of 4 dashed lines in the window were drawn. It also decides whether an edge is in the window from the rectangles of its two nodes, so a message between two lifelines vanishes once both heads are out of the window: 3 of 4 rows were drawn.
2. **A lifeline as one node as tall as the view** (`a.html?shape=tall&data=synthetic&cull=0`, select a lifeline that a message's label crosses: the script takes `part9`, which `msg1` crosses). React Flow raises a selected node by 1000, so the selected lifeline's dashed line is drawn across the labels of the messages that cross it. This shape also needs the node's own element to take no pointer (`style: { pointerEvents: 'none' }` on the node, with the head taking it back in CSS).
3. **Edges at React Flow's own depth** (`a.html?flat=1&frame=1&data=synthetic&cull=0`). React Flow draws a node over an edge of the same depth, and gives an edge the depth of an end node that has a parent. Outside a frame a line node can lie under the edges (`zIndex: -1`). In a frame it cannot: React Flow draws a child over its parent whatever its `zIndex`, so the line node comes level with the edges, and its dashed line is drawn across the labels it crosses. With one tall node per lifeline the same shows outside a frame too (`a.html?shape=tall&flat=1&data=synthetic&cull=0`).

The shape that passes everything: a lifeline is **two nodes**, its head (the element's id, 180 by 60, what a person picks and drags) and its dashed line (`<id>:line`, as tall as the view, `zIndex: -1`, `selectable: false`, `draggable: false`, no pointer). Events are children of the line node. Messages and successions are edges with `zIndex: 1`, from and to an event's node, else the lifeline's line node.

## Found on the way, in both candidates or in the page

- **The page's inert handle breaks connecting** (`a.html?connect=inert`). Every node of the page holds, first, one element with the classes `source target` and no side, so that React Flow draws lines to the node. React Flow counts it as the node's first source handle. Once nodes are connectable, a drag begun from a real handle that has no id is taken to begin from the inert one, and React Flow's connection line throws (`getBezierPath`: `getControlWithCurvature is not a function or its return value is not iterable`); no line follows the pointer and nothing is joined. Slice 2's real handles must replace the inert element or come before it (both run); giving them ids should do too (not run). With the inert element gone (`a.html?connect=1`) and `connectionMode="loose"`, a drag from an event's dot to another lifeline's dashed line joins the two (`onConnect` gives the two node ids, `onConnectEnd` the point, which `at` resolves): the script runs three such drags.
- **A relationship whose two ends are one element is dropped by the library's `normalize()`**, so a message back to its own lifeline runs from the lifeline to an event on it (or between two of its events). The layout calls it a loop when both ends are drawn on one lifeline.
- **Where a succession runs down a lifeline it covers the dashed line.** A click there is the succession's. The reader's `at` still says where on the lifeline the point is, so a tool that places an event can read `at` whatever was hit.
- **A press on the ground inside a frame, dragged, does nothing** on both `a.html?frame=1` and `c.html`: it neither pans the plane nor moves the frame, because React Flow gives every draggable node the class that stops the pan, and the frame is dragged by its title only (`dragHandle`). The wheel over a frame pans the plane. Slice 3 must decide what the ground of a frame does.

## The measurements

One whole run of the script, on a 4-core Intel Xeon at 2.1 GHz, Chromium 153 headless, a window of 1000 by 700 at device scale 1. Over four whole runs a time moved by up to a quarter (one step of a message-row drag: A 6.9 to 8.8 ms, B 3.7 to 5.0 ms), and the order of the rows below did not change. The synthetic view has 20 lifelines, 270 events and 300 messages; it is opened at scale 1, so about 12 of its 300 rows are in the window.

**Lines of the drawing-and-input part** (the shared layout, 232 lines of code, and the shared store, 76, are not counted):

| | all lines | lines of code |
|---|---|---|
| A: `a-body.jsx`, `a.css` | 536 | 450 |
| B: `b-body.jsx`, `b.css` | 246 | 215 |

By a rough count, 80 of A's lines are the switches kept for this probe (the failing shapes, a message as a node, the handles, the frame), and 15 of B's (the frame, the cut left out); 150 of A's are its store, most of which the page already has in `plane/viewStore.ts`. The bundle with React Flow is 348 kB minified, without it 161 kB; the page already loads React Flow.

**From mount to the first painted frame** (median of 5; to the end of the first animation frame in which the whole view is in the document):

| | the fixture | 20 lifelines, 300 messages |
|---|---|---|
| A, everything mounted | 44 ms | 148 ms |
| A, only what the window shows mounted (the page's rule for the synthetic view, which has 310 nodes) | 38 ms | 79 ms |
| A with a message a node, everything mounted | 46 ms | 139 ms |
| B (everything mounted) | 22 ms | 52 ms |

**One step of a drag on the synthetic view** (median of 30 steps, then of 3 runs; measured in the page from the `pointermove` to the end of the next animation frame, main thread only; in headless Chromium that frame begins as soon as the move is handled):

| | a message-row drag | a lifeline drag that pushes 18 lifelines | a lifeline drag that pushes none | a pan by a drag on the ground |
|---|---|---|---|---|
| A, everything mounted (3,101 elements) | 7.7 ms | 18.9 ms | 7.1 ms | 4.1 ms |
| A, only what the window shows mounted (651 elements) | 5.3 ms | 8.7 ms | 4.6 ms | 1.7 ms |
| A with a message a node, everything mounted | 4.2 ms | 17.1 ms | 7.8 ms | 3.0 ms |
| B (everything mounted, 2,429 elements) | 3.7 ms | 10.3 ms | 4.2 ms | 1.0 ms |

The layout itself takes about 1 ms of each step in every row. "Pushes 18 lifelines" is the worst case of the order rule: the second lifeline is dragged into the third, every lifeline to its right is pushed along, and the whole view is laid out and drawn again at each step. With everything mounted, A is over one frame of 16.7 ms there on this machine; with only what the window shows mounted, which is the page's rule for a view of this size, it is not.

## What the reader's design must know

### What a message's row must hold

For either body, the layout gives a message as `{ id, row, y, from, to, fromLifeline, toLifeline, self, dotA, dotB, points, mid, label, lifted }`: its place in time among the view's rows and that row's height; its two ends and the lifeline each is drawn on (an end can be a lifeline itself, an event, or something a lifeline owns that the view does not place); whether it comes back to its own lifeline; whether each end is a drawn event, where the line stops at the dot's edge; its line; where its label and marks sit; and whether it is the row being dragged.

For a graph body the reader turns that into an edge: `source` and `target` are the event's node when the end is a drawn event, else the lifeline's line node; `data` holds `sy` and `ty`, how far under each of those nodes' tops the line runs (8 for an event, the row's height for a line node, 20 more at the far end of a loop), with `self`, `dotA`, `dotB`, `label` and the marks. The edge component works out its line from its two nodes' rectangles (`useInternalNode`, as the page's `LineEdge` does) and those offsets, so it follows a lifeline or a frame that moves without a new edge object.

### The steps of a gesture, and its end

The reader's `step` takes one of `{ kind: 'lifeline', id, x }`, `{ kind: 'event', id, y }`, `{ kind: 'message', id, y }` and gives the view as that step leaves it, with a `result` that the end writes: the new x; the new index among the lifeline's events; the new row, with every message's id in the new time order. Each layout hands back the same object for a lifeline, an event, a message or a succession that reads the same as before.

- A message's step reads the model as the drop would leave it (the messages re-ordered), so the other rows make room and the events on those rows go with them; only the dragged row is at the pointer's height.
- An event's step lays the other events out as if the dragged one were not there. An event a message starts or ends on stays on the message's row; its end says `pinned` and writes nothing.
- A lifeline's step replaces its saved x; the order rule (sorted by x, a head pushed clear of the one before it) does the rest, so a head can be drawn to the right of where the pointer asks.

### How a drag is constrained on React Flow

The nodes are controlled, as on the page: React Flow reports where the pointer would put the dragged node (`onNodesChange`, a `position` change with `dragging: true`), the store asks the layout for the step and hands back nodes at the layout's places. React Flow never moves a controlled node itself, and works each step out from the pointer and the place at the press, so nothing drifts: a head keeps its height, an event stays on its line, to the pixel, at every step the script reads. No `extent` and no `expandParent` is used. A press that has not gone 4 screen px writes and draws nothing, as on the page.

### What had to be worked around in React Flow

None of these patches React Flow or reads its internals. Each leans on how 12.10.2 behaves, and the script would show a change.

1. Two nodes for a lifeline, and `zIndex: 1` on the edges: the three shapes above.
2. A message's drag: React Flow drags nodes only. The edge's own `pointerdown` starts it; `useReactFlow().screenToFlowPosition` gives the height; the plane does not pan under it because React Flow puts the `nopan` class on every edge; the click that follows the release is dropped by a flag that the next press clears. The other way, a message as a node, needs no pointer code, and costs that a node then stands for a relationship: the plane's `onNodeClick`, the store's marks and the marquee all read a node as an element today. This probe would keep the message an edge: every other part of the plane then reads it as a relationship as it stands, and the row's drag is the one new path into the store.
3. Only the node under the pointer moves: the store takes the id from `onNodeDragStart` and ignores the position changes of the other selected nodes.
4. Real handles in place of the inert one, for connecting. A lifeline's handle is a strip 16 px wide down its dashed line, on its line node; it takes the pointer there, so with handles shown a press on a dashed line that moves begins a connection, not a pan. A click on it is still a ground click whose point `at` resolves (run once by hand, not in the script).
5. As the page already does: every node carries `width`, `height`, `measured` and `handles`, so the lines are drawn in the first frame.

### Slice 3: several views on one plane, each in a frame

- **A graph body** (`a.html?frame=1`, run): each node gets `parentId`, the frame's node, and its place from the frame's corner. Dragging the frame by its title moves the whole view and changes one node only; the edges follow because they read their nodes' rectangles. The store must take the frame's inside corner off a click's point and off a message drag's height. A line node's id is not an element's id, which contract 5 already expects from slice 3.
- **A component body** (`c.html`, run): the body takes `framed`: it has no camera, takes its content's size, and leaves the wheel and the ground to the plane. Its heads, events and messages carry the classes `nodrag nopan`, so React Flow neither drags the node nor pans under a gesture; its pointer capture works inside the node; it finds a point's place from its own element's rectangle, so the plane's zoom is counted. The plane sees the view as one rectangle: its marquee, its minimap and its culling cannot look inside, and a line from outside the frame has no node inside to end on.

### What a graph body takes from the plane, and what it costs

Run in this probe: the camera with no code (item 7); React Flow's zoom buttons; connecting by a drag from a handle (`?connect=1`); mounting only what the window shows (`?cull=1`); frames (`?frame=1`); React Flow's minimap mounts (`?minimap=1`, looked at once, not checked by the script).

Not run, read from the page's code: the page's own minimap draws the store's node rectangles, so it would draw this view; the right-click palette comes from React Flow's three context-menu callbacks, the same path as the clicks; the marquee picks nodes whose whole rectangle lies inside it and edges both of whose ends do, which would pick a head and an event but never a message between two line nodes, so for this view it must pick by the reader's `listed` rectangles; the actions that change places (align, distribute, Arrange all) must leave this view alone, since its places are the layout rule's.

The cost: about twice the code and about twice the time of the component body; four rules the reader must follow or a defect shows (two nodes for a lifeline, the edges raised, a message's ends on line nodes with their offsets, real handles); and a message's drag that is not a React Flow gesture.

### If the component body were chosen instead

It would need, beyond what `b-body.jsx` has: zoom buttons and a fit; a minimap, a marquee, a right-click that gives a Hit, and connecting by a drag, each made again for it; an ellipsis for a name that is cut (the adapter's font widths can give the width); and the plane's own rule to leave clicks inside it alone in slice 3.

### Where the shared layout differs from the old page

- A message is moved by dragging, to any row, not by two arrows that swap neighbours.
- A dragged event passes the events below it. In the old page's layout, as its code reads (not run), a dragged event pushes the next event that no message ends on ahead of it.
- Places are counted from the view's origin; the view's own x and y are not added.

## Not verified

- Only Chromium was run, headless, with a mouse. No touch, no trackpad pinch, no other browser.
- The times count the main thread to the end of a frame's painting, not the raster on the GPU.
- The marquee, the right-click palette, the page's own minimap, a head's resize handles, the far view below a zoom of 0.25, an undo in the middle of a drag, and image export were not run on either candidate.
- No drag was taken out of the window, so it is not known what either React Flow variant does when a dragged row's node or edge is unmounted in mid-drag. The edge's own drag listens on `window`, which should carry it (not run).
- Real handles with ids beside the inert handle were not run.
- Several sequence views on one plane were not run: one frame was.
