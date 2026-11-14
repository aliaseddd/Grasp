**A graph body**: every item of the list worked on React Flow 12.10.2 through its public props and node fields alone, with nothing patched and no defect left to see (all 143 checks pass, the clicks and drags in them made with real pointer events; 60 of 60 drops are reported within 0.0005 m, which is the rounding itself; the painted outlines are within 0.12 px of their place at zooms 1, 2 and 4), so the geometry view gets the plane's camera, marquee, right-click and frames for nothing. It is close: the component body passed every item too, with half the code and, on a page just loaded, half the mount time, and the graph body is right only while the design keeps the five rules below, each of which answers a defect this spike reproduced.

This is the probe at the start of slice 2 that contract 6 of `plan/architecture.md` waits for, for the geometry view. It was run on November 14, 2026, in headless Chromium through Playwright, in a window of 1000 by 700 at device scale 1.

## The five rules a graph body must keep

Each was found by breaking candidate A. `run.cjs` brings each of the seven defects back on purpose, through a switch of the page, and marks it `SHOWN`.

1. **A footprint's node takes no pointer itself; what is drawn in it does.** The node carries `style: { pointerEvents: 'none' }`, and the outline, the words and the marks carry `pointer-events: auto`. Without it, as every node of the page is today, a click in the corner of the round table's bounding square, outside the circle, counted as the table and not as the room under it.
2. **The outline is SVG inside the node, put in its place by a `transform`.** A box drawn by CSS, as `BoxNode` draws one, has its size rounded to whole px of the view before the plane's zoom: a footprint of 13.2 by 49.48 px was painted 13 by 49, which is 1.71 px off at zoom 4. A place given by CSS `left` and `top` is rounded the same way: 1.22 px off at zoom 4.
3. **The node's rectangle covers everything the footprint draws**, its words below it and its marks above it. The page turns `onlyRenderVisibleElements` on for a view of more than 300 nodes, and React Flow then mounts a node only while its rectangle is in sight. With the node as large as the outline alone, a footprint just outside the plane's edge lost its words, which were 4 to 34 px inside the plane.
4. **`zIndex` is the place in the drawing order, and a picked footprint is not raised.** Without `zIndex`, React Flow puts what a footprint holds above every footprint that is not held, whatever the order: a click on the rug, where it lies over the room's cabinet, hit the cabinet. With `elevateNodesOnSelect`, which is React Flow's default and the page's setting today, the picked room was raised over a rug that lies on it and is no part of it: the rug was no longer seen, and a click on it hit the room. Either the plane sets `elevateNodesOnSelect={false}`, or the picks of a geometry view go into the nodes' `data` and never into React Flow's `selected`. Both ways were run.
5. **The plane has no snap grid.** The page sets none today. With `snapToGrid` and a grid of 10 px, a drop was reported up to 0.115 m from where the pointer let go, against 0.0005 m without. React Flow's snap is the whole plane's: no node can opt out.

Rules 3, 4 and 5 are about props of the whole plane. In slice 3 a plane holds several views, so a setting made for graph views reaches the geometry views on the same plane. Rules 3 and 4 have a way that needs nothing of the plane: the node's rectangle, and the picks in `data`, which the view's store must then do for this kind of view. Rule 5 has none.

## Run it again

```sh
node plan/spikes/geometry/build.cjs      # bundles into dist/ (ignored by git), with esbuild from the repository's node_modules
node plan/spikes/geometry/run.cjs        # about 80 s: prints each check and the measurements, writes a.png and b.png; exits 1 if a check fails
```

Nothing is installed. `build.cjs` calls esbuild with the options of the other spikes (`bundle`, `format: iife`, `jsx: automatic`, `minify`, `process.env.NODE_ENV` as `"production"`) and writes the fixture as a classic script, since a page opened from disk cannot fetch a file beside it. The pages open from `file://` by hand too:

| Page | What it shows |
|---|---|
| `a.html` | Candidate A, the graph body. `?show=fixture`, `empty`, `synthetic` or `synthetic5000` picks the view (default: the room). |
| `b.html` | Candidate B, the component body. The same `?show=`. |
| `nest.html` | One React Flow plane with two frames: A's nodes as children of a frame, and B drawn inside a frame's node. `?frame=any` or `?frame=fixed` changes how B's frame is dragged. |

`a.html` takes six switches that each bring back one defect: `?pass=0` (a node takes the pointer itself), `?css=1` (the outline as a CSS box), `?place=layout` (the outline put by `left` and `top`), `?box=foot` (the node as large as the outline alone), `?z=none` (no `zIndex`), `?snap=10` (a snap grid). The seventh defect needs the console: `spike.show('room', { elevate: true })` mounts A with `elevateNodesOnSelect`, and `{ cull: true }` with `onlyRenderVisibleElements`. `?pick=data` keeps the picks in the nodes' `data`. `?bar=zoom` on either candidate redraws the scale bar for the zoom. `spike.store` holds the view's state.

The test data is the fixture's room with what the fixture lacks added to a copy (`data.js`): a round table of radius 0.9 m, a vase in mm nested in it, a lamp in mm nested two deep, a shelf whose sizes are no whole px, a rug that is no part of the room and lies over it, a part with no shape, a box with no width, a cylinder with no radius. `run.cjs` works out what it expects from the model's numbers, not from the layout under test.

## The items, per candidate

"Works" means every check of the item passes; the clicks, the drags and the wheel in them are real pointer events. A workaround named here is in the candidate as built.

| # | Item | A: graph body | B: component body |
|---|---|---|---|
| 1 | Draws each footprint to scale, nested ones in their owner's frame with y up, the words inside or below, dashed without a shape, the axes and the scale bar | Works with a workaround: rules 2 and 3. All 12 footprints are within 0.00003 px of their place at zooms 0.1 to 4, by the document's own geometry. | Works. The same numbers. |
| 2 | To scale at every zoom, and the scale bar true | Works with a workaround: rule 2. The painted outlines are within 0.12 px of their place. The bar is part of the axes' node and zooms with the plane: it is 1 m of the drawing at zooms 0.1 to 4. A bar redrawn for the zoom was run too (the node reads the zoom with React Flow's `useStore`): 40 to 80 px long, reading "5 m" at zoom 0.25 and "0.5 m" at zoom 4. | Works. The same two ways; the redrawn bar is one small component that listens to the camera. |
| 3 | A click on a footprint or the ground, with the id and the point in the view's units; a circle's corner; a small footprint on its owner | Works with a workaround: rules 1 and 4. The point comes from `screenToFlowPosition`. A right-click gives the same hit through `onNodeContextMenu` and `onPaneContextMenu`. | Works. SVG's own hit testing; the point comes from the drawing's `getScreenCTM()`. A right-click needs a listener of its own (8 lines). |
| 4 | Selection shown on several footprints, driven from outside | Works with a workaround: rule 4. The plane's marquee (Shift and a drag) draws over the footprints, begun on the ground or on a footprint. | Works. It has no marquee. |
| 5 | The drag: live steps, rounded as `geoRound` does in the part's own unit, what it holds moves with it, one result at its end, no resize handles | Works; rule 5 must hold. Several picked footprints dragged by one of them move together, each rounded in its own unit, which is React Flow's own behaviour. | Works. Only the pressed footprint moves. |
| 6 | A badge and a numbered pin on a footprint's top edge; a free pin at a point | Works. The marks are elements inside the node; the free pin is a node. | Works. All SVG. |
| 7 | The name as an element whose screen rectangle can be read | Works. A `<span>`; an editor laid over its rectangle covers it at zooms 0.5 to 3.3. | Works. A `<tspan>`; the same. |
| 8 | The wheel pans, Ctrl and the wheel zoom, a drag on the ground pans; the camera outside React | Works, with no code: it is React Flow's, with the page's props. | Works, with about 30 lines of its own, which copy React Flow's measure of a zoom step. |
| 9 | Draws in any rectangle; says how large its content is, an empty view included | Works. | Works. |
| 10 | Slice 3: inside a frame on a plane | Works. Each node's id carries the frame's id, the top footprints get the frame as `parentId`, and the view's origin is added to their places. A click on the view's ground is then a click on the frame's node, which the plane must turn into the view's ground. Run at plane zooms 1 and 1.5. | Works with a workaround: the footprints and pins carry React Flow's class names `nodrag` and `nopan`, the body stops its clicks from reaching the frame's node, and it has no camera of its own there. Run in a frame dragged by its title, in one dragged from anywhere and in one not dragged at all, at plane zooms 1 and 1.5. |

No item fails on either candidate.

## The measurements

Four runs of the code as it stands gave the ranges below. Each time is a median: of 7 page loads for a mount, of 30 steps for a step.

| | A: graph body | B: component body |
|---|---|---|
| 1. Lines of code of the drawing and the input (no blank lines, no comments) | 247 in `a.jsx`: the projection 71, the store's reading of React Flow's changes 67, three node components 44, the plane's props and its gate 94. The page already has the last two parts in `Plane.tsx` and `viewStore.ts`, so about 115 lines would be new. | 122 in `b.jsx`, of which about 30 are the camera. |
| 2. Mount to the first painted frame, the fixture (4 footprints), on a page just loaded | 35 to 42 ms | 18 to 24 ms |
| The same, mounted again in the same page (a tab shown again) | 9 to 13 ms | 12 to 14 ms |
| 2. Mount, 500 footprints (50 owners of 9 parts), on a page just loaded | 153 to 174 ms | 50 to 69 ms |
| The same, mounted again in the same page | 83 to 112 ms | 36 to 64 ms |
| 3. One step of a drag of an owner with its 9 parts, 500 footprints all in sight | 5.5 to 6.6 ms | 4.5 to 5.9 ms |
| The same at zoom 1 | 4.3 to 5.1 ms (228 nodes mounted) | 4.5 to 5.5 ms (all 500 mounted) |
| 4. Largest error of a drop, 60 drops at zooms 0.5, 1 and 2 | 0.0005 m (0.5 mm for the part in mm) | 0.0005 m (0.5 mm) |
| Where the footprint is drawn after the drop, against the reported position | within 0.0000012 m | within 0.0000006 m |
| The painted outline against its place, zooms 1, 2 and 4, read from screenshots | within 0.12 px | within 0.12 px |

How to read them:

- **Mount.** The time ends at the end of the first frame in which every footprint is in the document and shown. Frames are 16.7 ms apart, so about 17 ms is "the first frame" and about 35 ms "the second". On a page just loaded, A's first mount also pays for React Flow's code running for the first time; the page will have drawn other planes by then, and mounted again the two are a frame each.
- **A step.** Timed inside the page from the `pointermove` to the end of the next frame. Chromium hands the move to the page at the start of a frame, so no waiting is counted. Both candidates are well inside a frame at 500 footprints.
- **A drop.** The error is the rounding and nothing else. At zoom 2 a screen px is 0.0125 m and a position is rounded to 0.001 m, so the largest error is half of that step; at zooms 0.5 and 1 a px is a whole number of thousandths and the error is 0. Both candidates give the same numbers for the same drops.

Beyond the brief, to find where each candidate breaks under load:

| | A | B |
|---|---|---|
| One step of a pan by the wheel, 500 footprints | 5.4 to 6.6 ms | 1.8 to 2.2 ms |
| 5,000 footprints: mount | 1,117 to 1,264 ms | 540 to 606 ms |
| 5,000 footprints, all in sight: one step of the drag | 61 to 66 ms | 44 to 64 ms |
| 5,000 footprints, all in sight: one step of a pan | 60 to 77 ms | 14 to 20 ms |

Neither holds 60 frames a second in a drag at 5,000 footprints in sight. A has React Flow's culling once the plane is zoomed in; B has none. Neither has the far form the page gives a graph view below 25% of zoom, which is what A's slow pan asks for.

## What the design must know

### What a graph body gets from the plane, and what it costs

It gets, with no code of its own: the camera with its fit and its memory (`viewStore`), the wheel and the pinch, the zoom buttons, the marquee, the hits of a left and a right click, the ground's dots, the culling above 300 nodes, the rule that a press is no drag until it has gone 4 px, a drag of several picked footprints, and in slice 3 a place in a frame with no new rule for the pointer. A component body has to build each of these, or do without.

It costs: the five rules; two to three times the mount time and three times the pan step at 500 footprints, both small there; and one thing the contracts take for granted. Today "graph body" means boxes whose places are the view's own, free to move, resize and arrange. A geometry view's footprints are not that: their places are the model's `posX` and `posY`, and their sizes are the model's dimensions. So these must tell a geometry graph body from the four graph kinds:

- the store's drag: contract 5 already names the way (`step` of the reader, and the kind's action at the drag's end) in place of `placesFor` and `projectStep`;
- the resize handles (none), a drop into another owner (none: the owner stays), align, distribute and same size of contract 4, and Arrange all of contract 6;
- the store's `marquee`, which must leave out the nodes that are no element (the axes, the free pins);
- the rule in `app.css` that gives every selected node an outline around its rectangle, which would frame a circle's square and a small footprint's words.

These four come from reading the contracts and the page's code. None was run against the page.

### How the layout maps onto React Flow's places

The layout (`layout.js`) works in the view's own units: px at 100% of zoom, x to the right, y down, from the view's origin, where the plan's coordinate frame stands. A part's origin is its owner's origin plus `posX * pxPer` to the right and `posY * pxPer` up, where `pxPer` is the view's scale times the part's unit in the view's unit. A Box or Rectangle is the rectangle up and to the right of its origin; a round shape is centred on it.

React Flow wants each node's top-left corner from its parent node's top-left corner. The projection takes both corners from the layout and subtracts. So y up and an owner's origin never reach React Flow. Three things follow:

- When an owner's size changes, its corner moves and its origin stays, so every node it holds gets a new `position` though no part moved. Run: the room's width set from 6 m to 7 m moves the room's top edge by 80 px at zoom 2 and leaves the table where it was.
- A step of a drag is read as how far the node is from where it was at the press. That difference is the same in every frame, and `movedBy` turns it into `posX`, `posY` in the part's own unit and rounds it. The store answers with the rounded place, and React Flow draws that, since the nodes are controlled. React Flow works each step out from the pointer, not from the last place, so the rounding does not add up.
- A footprint may lie outside its owner's rectangle. That works as long as no node has `extent` or `expandParent`.

### How a circle's hit area was made right

In A, React Flow listens on the node's element, which is the bounding rectangle. The node's `style` makes that element pass the pointer, and the SVG circle inside it takes the pointer over its own shape only; the event then rises to the node's element, where React Flow hears it. A press in the square's corner goes to whatever lies under: the owner's footprint, or the ground. This leans on one detail of React Flow 12.10.2: it writes a node's `style` after its own inline `pointer-events`, so the node's wins.

In B, the SVG circle is hit over its own shape and nothing has to be done.

In both, the words of a footprint take the pointer for their footprint, as on the old page. So the words below a small footprint cover part of what lies under them. `footAt` in `layout.js`, which stands for the reader's `at`, knows the outlines only and says what lies under the words; the body and the reader disagree there. In A the words' block is one rectangle around both lines, a little more than the letters that B's SVG text takes.

### What had to be worked around in React Flow

Nothing in React Flow was patched, and no private field was read. What A uses beyond the page's props today: a node's `style`, `zIndex`, `selectable` and `draggable`; the prop `elevateNodesOnSelect`; for the redrawn scale bar only, the hook `useStore` to read the zoom, as the page's own minimap does.

### What a component body would need

- In a tab: its own camera (built here), and its own zoom buttons, fit that follows the tab's size, marquee and minimap (not built). Or it is drawn inside one node of a plane in slice 2 already, as slice 3 will do; the frame run shows that works, and the plane's camera then serves it. The marquee and the minimap would still see one node.
- A point of the screen in the view's units through `getScreenCTM()`, which takes the plane's zoom around the body into account (run at plane zoom 1.5). Its numbers are single precision: a click at 120.2 came back as 120.19999695. That is far below the rounding, and matters only at pan distances of a million px.
- In a frame that is dragged by its title, a drag on the view's ground inside the frame does nothing on either candidate: React Flow gives every draggable node the class `nopan`.

### The reader

`layout.js` is the reader both candidates share, in the shape of contract 5: `readView` reads the model once (what no position can alter: the words, the units, each footprint's form and size), `layOut` places the footprints and is all a drag's step runs, `movedBy` is the step's rounding, `footAt` is `at`, `listed` and the layout's `bounds` are `listed` and `sizeOf`, and `drawnBox` is the rectangle around all a footprint draws. A footprint that reads the same as before is the same object. For a graph body the reader would also give the nodes (`project` in `a.jsx`).

The words of small footprints overlap one another in the room, as they would on the old page: the rule that puts two lines below every small footprint does not look for room. That is the layout's, and the same for both bodies.

### Not verified

- Touch and the keyboard.
- The candidates inside the page itself: A rebuilds the pattern of `Plane.tsx` and `viewStore.ts` rather than using them. The page's own minimap, palette and far form, and what its marquee picks, were not run with footprints; of the marquee only React Flow's rectangle was seen.
- Whether a port's name, which also lies outside its node's rectangle, is lost the same way today above 300 nodes (rule 3). It follows from how React Flow culls; it was not run on the page.
- A snap grid for the graph views with the geometry views kept out of it (rule 5): no way was looked for.

## The files

| File | What it is |
|---|---|
| `layout.js` | The layout, shared and pure: ported from `geoFootprint`, `geometryLayout`, `geoRound` and the scale bar of `canvas/src/geometry/page.js`. |
| `store.js` | One view's state outside React, shared: the layout, the picked ids, the marks, the camera, the drag in progress. |
| `axes.jsx` | The axes and the scale bar as SVG, drawn by both. |
| `a.jsx` | Candidate A: the projection, the store's reading of React Flow's changes, the node components, the plane's props. |
| `b.jsx` | Candidate B: one SVG component with its pointer, wheel and camera. |
| `nest.jsx`, `nest.html` | Frames on a plane, for item 10. |
| `data.js`, `harness.jsx`, `page-a.jsx`, `page-b.jsx`, `a.html`, `b.html`, `spike.css` | The test data, `window.spike`, the pages and their look. |
| `build.cjs`, `run.cjs` | The build and the script that tests and measures. |
| `a.png`, `b.png` | Each candidate showing the room, with the desk and the pillar picked. |
