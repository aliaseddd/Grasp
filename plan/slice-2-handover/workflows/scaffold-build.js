export const meta = {
  name: 'scaffold-2-1',
  description: 'Package 2-1 of slice 2: the scaffold, built in serial stages, with a grips probe beside the first stage',
  phases: [
    { title: 'Core', detail: 'the grips probe in a worktree, beside the core seams in the main tree' },
    { title: 'Plane', detail: 'the store, the plane, the bodies, grips, anchors, the marks places' },
    { title: 'Shell', detail: 'shell and panels in the main tree; the shared test parts and criteria tests in a worktree' },
    { title: 'Integrate', detail: 'the tests brought in, status.json, the measurement stand-in, everything green' },
  ],
}

const S = '/tmp/claude-0/-home-user-Grasp/c7f4c0c3-3293-5171-8b1a-2fc91a0152d6/scratchpad/scaffold'
const OPTS = { model: 'fable', effort: 'high' }

const STAGE = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['done', 'stopped'] },
    summary: { type: 'string', description: 'What was built, in at most 12 lines' },
    checkPassed: { type: 'boolean', description: 'npm run check exits 0 on the tree you leave' },
    testSummary: { type: 'string', description: 'The runner summary of your last full npm test: # tests, # pass, # fail, # todo, and any timed failure with its medians' },
    wipCommit: { type: 'string', description: 'The hash of the local commit you made, or empty' },
    slice1TestsChanged: { type: 'array', items: { type: 'object', properties: { test: { type: 'string' }, why: { type: 'string' } }, required: ['test', 'why'] } },
    deviations: { type: 'array', items: { type: 'string' }, description: 'Each thing built otherwise than the plan says, with its reason' },
    openQuestions: { type: 'array', items: { type: 'string' }, description: 'What the plan leaves wrong, contradictory or unbuildable, and what later stages must know' },
    stoppedReason: { type: 'string' },
  },
  required: ['status', 'summary', 'checkPassed', 'testSummary'],
}

const PROBE = {
  type: 'object',
  properties: {
    gripsWork: { type: 'boolean', description: 'A press on a grip reaches the gesture and React Flow neither drags, pans, marquees nor picks' },
    limits: { type: 'string', enum: ['hold', 'fail', 'unclear'] },
    summary: { type: 'string' },
    findings: { type: 'array', items: { type: 'string' } },
    medians: { type: 'string', description: 'Every median measured with grips mounted, beside the baseline' },
    filesForStageB: { type: 'array', items: { type: 'string' } },
  },
  required: ['gripsWork', 'limits', 'summary', 'findings', 'medians'],
}

const COMMON = `
You are a builder working for the lead of slice 2 ("Editing parity") of Grasp, a SysML v2 design canvas that opens from disk in Chromium. The repository is /home/user/Grasp, on the branch claude/gracious-fermi-hxid8e. The slice's approved design is plan/slice-2.md. The layer above it is plan/architecture.md. How the application is laid out, and the rules a change keeps, are in canvas/app/README.md.

The lead is building package 2-1, "the scaffold", in stages, one agent per stage. The scaffold fixes twelve seams (plan/slice-2.md, section 4) and leaves a skeleton of every file that packages 2-2 to 2-15 will own. Each of those packages is later built by an agent that sees only its own brief (section 8), the sections it names and the files they name, side by side with the others. So the scaffold must carry every signature of section 4 to the letter, with its contract as a comment, and no later package may need to change a file it does not own. Build what the plan says, not what seems nicer.

The stages:
  0. In a throwaway worktree, beside stage A: the grips tried in the page (the plan's one unproved technique) and what they cost.
  A. The core's seams (no React, runs in Node): readers, marks, who a node is, code rows, the action table, keys, sayings, hands, the notes in a session and in a state file.
  B. The plane's and the views' seams: the view's store, Plane.tsx, the registry of bodies, ViewHost, BodyFrame, BodyContext, the grips, the label anchors, the places of the marks, and the skeletons under plane/ and views/.
  C. The shell's and the panels' seams: ActionControl, the palette's actions, the one keydown listener, the top bar, the toasts, the dock, the sections and hooks of Details, Tools, the Notes panel's skeleton.
  D. What the tests share (helpers.mjs, core.mjs) and the tests of criteria 2, 4 and 5, written first and marked todo; in a worktree beside stage C. Then, after C, the document tests (capabilities, refusals, retired), the screenshots' skeletons.
  E. Integration: D's files brought into the main tree, plan/status.json, the stand-in for the measurement, everything green together.

The rules of every stage, each with its reason:
  1. Nothing under canvas/src or canvas/test changes, nor any file that canvas/app/test/unchanged.json lists; the form of a grasp/2 model does not change; no lib.js changes. The old page, the model library and the fixtures stay as they are until package 2-15, and one changed byte fails unchanged.test.mjs.
  2. No new npm package. A library is imported only through canvas/app/src/vendor.ts (the build refuses anything else); an icon is imported by its path, one by one.
  3. The core (canvas/app/src/core/) has no React and no DOM in it, and runs in Node.
  4. Colours and measures are in shell/theme.ts and nowhere else. A stylesheet sits beside its component. No test reads window.Grasp. No test turns on the CSS domain of the DevTools protocol (it makes Chromium log an error on a page from file://).
  5. Only the modules that contract 22 of plan/architecture.md names may read a field of a model's record (in this slice also: the readers, core/actions/*, core/labels.ts, core/codeLinks.ts, core/notes.ts for a view's x and y only, panels/hooks/*). A component asks one of them.
  6. No test is loosened, skipped or marked todo, except the seven tests that section 9 of the plan itself marks todo. The scaffold is the lead's package and the lead owns slice 1's tests (contract 27): where the plan asks for behaviour that a test of slice 1 pins otherwise, change that test as little as the plan's sentence asks and list it in your report with that sentence. Never change a test so that your own code passes.
  7. What a skeleton is: section 8, "Package 2-1. The scaffold", "What a skeleton is". The page behaves as before the scaffold except for the four differences that brief lists under "What changes for a person, on purpose".
  8. If the plan is wrong, contradicts itself or cannot be built as written, do not bend the work to fit and do not guess silently. Build everything that does not depend on it, and report the point under openQuestions with what you found and why. Answer status "stopped" only when nothing sensible can go on.
  9. Git: never push; never run git stash, reset, clean, rebase, or a checkout that discards changes; never touch plan/*.md. When your stage ends in the main tree, make one local commit of everything (git add -A, then git commit -m "wip(2-1): stage <letter>, <what>"). It is a working snapshot that the lead squashes into the package's one commit.
  10. Timed tests (scale.test.mjs, instant.test.mjs) are judged with nothing else running, and another agent may be working beside you. A timed test that fails in a full run is run again by itself, up to three times; report the medians either way. A limit is never changed.
  11. Do the work yourself; do not hand it to sub-agents.

How to run things. From the tree you work in: npm run build (canvas/app/ to canvas/dist/; a browser test opens the built page, so build before one), npm run check (canvas/dist/ is what the sources build, and the types hold), npm test (every test file, one at a time; it takes six to eight minutes, so run it with a ten-minute timeout or in the background, with its output sent to a file, and read the summary lines # tests, # pass, # fail, # todo at the end), and one file: node --test --test-timeout=120000 canvas/app/test/<file>. Playwright and its Chromium are installed for every folder; never install either.

The baseline of this session, at commit 780788b on this container (4 processors, Node 22.23.4): npm ci and npm run check exit 0; npm test: 470 tests in 42 suites, 468 pass, 2 fail, 0 todo, 353 s. The two failures were timed tests of scale.test.mjs (a drag step 17.3 ms starting against 16; a pan step of the 2,112-node view 26.0 ms starting against 25). scale.test.mjs run by itself three times afterwards, on the same untouched code: pass (drag 11.4 and 9.0 ms; pan 11.8/11.4, 10.3/11.6, 19.0/22.0), fail (a pan step of definitions 14.7/18.1 against 16), pass (drag 14.6/10.8). So this container runs close to the limits before any change, about a quarter slower than the one session 30 measured on. Every other test passed.

Your stage ends, in the tree you work in, with npm run build, npm run check and npm test all passing: # fail 0 (a timed failure is handled as rule 10 says and reported), and # todo equal to the number of the plan's seven todo tests that exist so far.

Hand-over. Write a report to ${S}/stage-<letter>.md for the stages after you and for the lead, who have not seen your work: what you built, file by file, one line each; what you left for which later stage; each thing built otherwise than the plan says, with its reason; each test of slice 1 you changed, with the plan's sentence; each measurement with its command; what you tried and dropped. Read the reports of the stages before you in ${S}/ first. Your final answer is the structured summary; keep it short, the report file holds the detail.
`

const STAGE_0 = COMMON + `
YOU ARE STAGE 0: the grips tried in the page. You work in /home/user/wt/2-1-grips, a detached checkout of commit 780788b with npm ci already run. Stage A is working in /home/user/Grasp at the same time: change nothing there. You make no commit.

Why. plan/slice-2.md, section 12, "What is not proved": the grips and the line in hand have not run in the page, and the four limits have not been measured with grips mounted. plan/notes.md (session 30, its last section) asks that the scaffold begin by building the grips, pressing one in the page, and measuring. If React Flow takes a press on a grip in spite of its classes, or a limit does not hold with the grips mounted, the scaffold stops and the plan goes back to Damon. Your answer decides whether stage B builds seam 6 as written.

Read: plan/slice-2.md section 2 ("Lines by dragging are Grasp's own gesture, on grips of its own"), section 4 seams 2, 4 and 6, section 5 flows 1 and 2, section 6 (a grip; the line in hand), section 12 ("What is not proved"); plan/notes.md, session 30, "What the three reviewers changed" (the click after a grip's release; a grip at a side's middle sits on a port); canvas/app/src/plane/Plane.tsx, plane/viewStore.ts, plane/nodes/*.tsx, plane/edges/LineEdge.tsx, shell/theme.ts; canvas/app/test/helpers.mjs and scale.test.mjs.

Build, in the worktree, as seam 6 and section 6 describe them. This is code stage B takes over, so write it as the page's own:
  - plane/nodes/Grips.tsx: NodeGrips({ far }) and EndGrips({ points }); plane/nodes/grips.css (grips shown by CSS when the pointer is over the node, when the node is selected, and on every near node while data-connecting is set; the thin teal outline of the node or line under the pointer), with any colour it needs added to shell/theme.ts.
  - The grips mounted by BoxNode, PortNode and SmallNode (four on a box, each 14 px outside the middle of a side; one on a border item and on a small node, on its outer side) and EndGrips by LineEdge on a selected, near line. Far (below 25% zoom) no grip is mounted.
  - plane/gestures/connect.ts with seam 6's types and connectOf; in Plane.tsx the attributes data-grips and data-connecting on the root, the capture-phase pointerdown that hands a press of the main button on a grip to the gesture as a GripPress, and the dropped click after a gesture's release (swallow, by the flag that already drops the click ending a marquee).
  - A stand-in gesture, for this probe only: connectOf is not null; press() captures the pointer on the grip, follows pointermove and pointerup on the window, and past 4 px adds itself to nothing, sets its state, calls swallow, and records what it saw where your script can read it from the DOM (attributes on the plane's root, for instance). It writes nothing to the model. Keep the stand-in in one small, clearly marked block of connect.ts, so that stage B can put "export const connectOf = null" in its place and the lead can put the stand-in back for a measurement.

Then try it in the built page with real pointer events: a Playwright script of your own in /home/user/wt/2-1-grips/.probe/ (never committed), opening canvas/dist/index.html from file:// as helpers.mjs does, on the example (canvas/examples/stronghold-proof.json) and on the interconnection fixture. Answer each of these with what you saw:
  1. A press on a grip and a drag of 100 px: the press reaches the plane's capturing listener; the node does not move; the plane does not pan; the pointer capture holds and the window's pointermove and pointerup are heard to the end.
  2. The same with Shift held: no marquee starts (the class nokey). With Ctrl held: nothing is picked or let go.
  3. The click after the release: the grip's node is not picked; with a tool in hand nothing is placed. A release before 4 px does nothing at all.
  4. Where the grips are: 14 px outside the middle of each side, clear of every border item (over the graph views of the ten files of TEN in helpers.mjs, count the boxes with a border item at the middle of a side, and say whether any grip overlaps one); what a grip measures on the screen at 50%, 100% and 200% zoom; the one grip of a port and of a small node; the grip at each drawn end of a selected line.
  5. hitAt as seam 2 describes it (document.elementsFromPoint, passing over whatever carries data-pass): with the pointer on a grip that lies over another node, that node is found.
  6. What the grips cost: with the stand-in in (grips on every near node), run canvas/app/test/scale.test.mjs and instant.test.mjs, each by itself, three times; give every median beside the baseline's above. Stage A is working beside you, so the numbers are noisy: say so, and run a failing file again.
  7. Which existing tests fail with the grips mounted, and why: one full npm test with the stand-in in.
  8. What surprised you: an event React Flow swallows, a class that is needed, a z-index, the edge label renderer, the far view, the hover rule's cost.

Write the report to ${S}/stage-0.md: each answer; the exact paths of the files stage B should take from the worktree; the stand-in block, quoted; and a verdict. gripsWork is true only if answers 1 to 3 are all as the plan needs them.
`

const STAGE_A = COMMON + `
YOU ARE STAGE A: the core's seams. You work in /home/user/Grasp, the main tree. Stage 0 works beside you in another folder and changes nothing here.

Read first: plan/slice-2.md: "In short", sections 1 to 5, section 8 ("The rules every brief carries" and "Package 2-1. The scaffold"; skim the "Fills" of every other package, since you write their skeletons), sections 9 and 12; plan/architecture.md, section 2 and contracts 1 to 5, 7 to 10, 13, 15, 22 and 27; canvas/app/README.md; every file of canvas/app/src/core/; canvas/app/test/core.mjs; the tests that hold what you change (commands.test.mjs, adapter.test.mjs, files.test.mjs, history.test.mjs, selection-core.test.mjs, viewStore.test.mjs).

Build (paths under canvas/app/src/):
  Seam 1. core/readers/index.ts (Listed, ReadOptions, Reader, rendererOf, readerOf, hasReader, readView, Placer, placerOf, Ender, enderOf). core/readers/graph.ts, built: read is the adapter's project, sizeOf the projection's bounds, listed as the seam says. The skeletons core/readers/sequence.ts, geometry.ts, grid.ts and browser.ts: each exports its reader as a constant that is null, with what its package fills (section 8, packages 2-10 to 2-13, "Fills") as its comment, types included where the brief gives them. core/commands.ts asks hasReader where it asks isDrawn today (toolGroups, place, the tool's click and offers), and place() goes to placerOf(renderer) for a renderer other than graph. isDrawn stays in the adapter with its old meaning.
  Seam 4. core/marks.ts, in full: Pinned, Marks, FreePin, NO_MARKS, MarksOf, marksOf. It listens to the checks and the notes only while something listens to it.
  Seam 5. core/adapter.ts: NodeData gains element, view and marks; EdgeData gains relationship, view and marks; elementOf and relationshipOf. Every new node and edge gets NO_MARKS, and the field is carried over from the node before, as selected is; the adapter never reads or sets marks otherwise. core/codeLinks.ts with codeRowsOf built (the adapter takes a code compartment's rows from it and cuts each as today), and the rest of package 2-8's contract as a skeleton.
  Seam 8. core/commands.ts: Action, actions(), actionOf(), ask(), editable(), drawProblem, freshElement, freshRelationship, gesturesOf, and the list PALETTE. core/keys.ts (KeyPress, KeyPlace, keyOf, pressed, ALIASES; no DOM in it; every rule of where a key is the page's from section 5, "Four things about the table", and from seam 8). core/says.ts. core/hands.ts (ShellHands, handsOf). core/actions/file.ts with its four rows built: undo, redo, save, put-down, as section 5's table and the brief of package 2-1 say them. A skeleton for each of core/actions/camera.ts, code.ts, browser.ts, connect.ts, labels.ts, remove.ts, views.ts, reparent.ts, notes.ts, text.ts, sequence.ts and geometry.ts: its rows as an empty exported array, with the ids, titles and keys of section 5 as its comment, and every other export its package's brief lists under "Fills", typed (a function nothing calls yet throws "<name>: package 2-N builds it"; place and end of sequence.ts and geometry.ts are null; setViewOption of views.ts throws). actions() joins the arrays the first time it is called.
  Seam 7, the core's half. core/labels.ts: LabelEdit, labelEditOf and rename, as a skeleton.
  Seam 11. core/notes.ts: Note as contract 9 has it, NotePlace, Notes, and notesOf as the pass-through the seam describes. core/session.ts: viewsOf; fileNotesOf; unsaved follows the notes' mark too; saved(mark?, notesMark?); listen also tells after a change of the notes; session.notes and session.archive stay, as what file() gives. core/files.ts: stateFile writes notes and archive from notesOf(session).file().
  Also. core/text.ts: exportText and TextResult of contract 13, as a skeleton. core/checks.ts gains Entry and entriesOf() as a skeleton that gives an empty list; change nothing else in that file. core/index.ts exports every new module.
  And the two changes the brief of package 2-1 makes to core/commands.ts: draw() of a "defined by" line from a usage that has a definition already no longer takes the old line out, it moves the old line's other end and shows the line, as the Typed by field of Details does, so that the line keeps its id (section 2); and the words of the sequence view's tools, as the old page has them (read canvas/src/sequence/ and canvas/src/core/page/tools.js; never change them), join TOOL_TITLE, TOOL_HINT and BASE_NAME.

Tests, written first and seen to fail, in canvas/app/test/, all in Node (add what they need to core.mjs): actions.test.mjs, readers.test.mjs, marks.test.mjs, says.test.mjs and session-notes.test.mjs, with what the brief of package 2-1 lists for each, as far as the core goes. The test "Escape calls off a gesture, or puts the tool down, or lets go of what is picked" must exist under exactly that name in actions.test.mjs: it is line 20 of section 7. The parts of readers.test.mjs and marks.test.mjs that need the view's store (a stand-in reader of another renderer asked for the projection, a step and the end, with only the pressed node moving; the store putting marks on its nodes) are stage B's: leave them out and say so in your report.

What is not yours: plane/, views/, shell/, panels/. Your changes force small edits there (a new field of NodeData; the callers of isDrawn in plane/viewStore.ts and panels/Tools.tsx, which from now on ask hasReader). Make only the smallest edit that keeps the build, the types and the tests whole, and list each. Until stage C nothing in the page calls ask() or pressed(): the keydown listeners of TopBar.tsx and Tools.tsx stay where they are for now.
`

const STAGE_B = COMMON + `
YOU ARE STAGE B: the plane's and the views' seams. You work in /home/user/Grasp, the main tree, alone. Stage A's commit is the tree you start from; stage 0's worktree, /home/user/wt/2-1-grips, holds the grips as they were tried in the page.

Read first: ${S}/stage-0.md and ${S}/stage-A.md; plan/slice-2.md: "In short", sections 1 to 6, section 8 ("The rules every brief carries", "Package 2-1. The scaffold", and the briefs of packages 2-2, 2-3, 2-5, 2-6, 2-7, 2-10, 2-11, 2-12 and 2-13, whose builders fill what you leave), sections 9 and 12; plan/architecture.md, section 2 and contracts 3 to 7, 14, 22, 26 and 27; canvas/app/README.md; every file of canvas/app/src/plane/ and of core/readers/, core/marks.ts, core/commands.ts, core/hands.ts, core/adapter.ts; shell/Dock.tsx and dockContext.ts; the tests viewStore.test.mjs, step.test.mjs, move.test.mjs, plane.test.mjs, picking.test.mjs, gestures.test.mjs, open.test.mjs.

Build (paths under canvas/app/src/):
  Seam 2. views/bodies.ts (BodyProps, OptionRow, BodyEntry, BODIES with all five entries and the option rows of seam 9's table, bodyOf). views/bodyContext.ts (BodyHands, BodyContext, useBody). views/ViewHost.tsx. views/BodyFrame.tsx. Plane takes its node and edge types from the registry. The skeletons views/GridBody.tsx and views/BrowserBody.tsx (each exports its body as null), plane/nodes/sequence/index.ts and plane/nodes/geometry/index.ts (each exports nodeTypes and edgeTypes as null). The dock's tab holds ViewHost: change shell/Dock.tsx by that one swap and no more (stage C owns the rest of the dock).
  Seam 3. plane/viewStore.ts: the projection, a step, which nodes a drag moves, the gesture's end and the marquee for a graph body of another renderer; dragStarted, preview, zoom and watchZoom; a node that is no element; a refusal said through saysOf. The store asks hasReader and the registry, not isDrawn.
  Seam 4, the plane's half. The store puts marks on its nodes and edges beside selected, a new object only where the marks differ, and listens to marksOf only while it is itself listened to. Each node component renders the element .grasp-marks with Badge and Pins; LineEdge renders the same pair at the line's middle through EdgeLabelRenderer, only for a line that has a mark; Plane renders FreePins inside the viewport; the root carries --grasp-zoom, set when the zoom changes and never on a pan. The skeletons plane/marks/Badge.tsx (Badge), plane/marks/Pin.tsx (Pins, FreePins) and plane/gestures/pin.ts (PinGesture, pinOf) render or do nothing.
  Seam 5, the plane's half. Plane.tsx builds every Hit from elementOf(node) and relationshipOf(edge), never from a node's id. A click on a node with no element is a click on the ground.
  Seam 6. plane/nodes/Grips.tsx and grips.css, taken from stage 0's worktree and brought to what its report found; NodeGrips in the three node components and EndGrips in LineEdge; plane/gestures/connect.ts with the seam's types and "export const connectOf = null" (the stand-in goes; keep it as the report describes it for the lead, outside the tree); Grips render nothing while connectOf is null; data-grips and data-connecting; the capture-phase pointerdown and GripPress; swallow. The skeletons plane/gestures/ConnectLayer.tsx and plane/ConnectMenu.tsx render nothing, and Plane mounts both where the seam says.
  Seam 7, the plane's half. The anchors: data-label="<type>:<id>" on a box's name line, a border item's name, a small node's name and a line's label. The skeleton plane/LabelEditor.tsx renders nothing (stage C mounts it in App.tsx).
  The plane's other changes in the brief of package 2-1: panOnDrag takes the middle button too; an entry's flow props are spread onto React Flow, from the short list the seam allows; the camera's hand (a zoom by a step of 1.2 about the plane's middle, a move by 80 px, a fit) and reveal; the skeleton plane/ZoomReadout.tsx, mounted between the zoom buttons, rendering nothing. plane/NotDrawnYet.tsx is shown by ViewHost inside the same root as today (data-testid="plane", data-view), so that slice 1's tests of the card hold.
  The hands a body lends. ShellHands.camera and ShellHands.reveal are the plane's and a component body's, and the shell gives one ShellHands to handsOf(session) (stage C does that, in the dock). Build the place where a mounted body leaves what it lends, by view id (the camera of a plane; reveal of a plane and of a BodyFrame), and say in your report exactly how stage C reads it to make ShellHands.camera and ShellHands.reveal.
  How a test finds what a plane shows. Seam 12's helper thingsIn(page, viewId) must give "type:id" for every node (by its element) and edge of a plane, and a lifeline will later be two nodes of one element, with ids that are no element's id. Decide what in the DOM says which element a node stands for and which relationship an edge, put it on slice 1's three node components and on LineEdge, write it as a comment where later node types will read it, and say it in your report: stage D writes the helper from your report.
  shell/theme.ts: the colours the slice's parts need, added once (the badge's warning colour, the grey of a resolved pin and of a line in hand that fits nothing, and what the grips use). src/vendor.ts: the icons the brief of package 2-1 lists.

Tests, written first and seen to fail (canvas/app/test/): the store's parts of readers.test.mjs and marks.test.mjs that stage A left (a stand-in reader of another renderer is asked for the projection, a step and the end, and only the pressed node moves; an unmarked node keeps NO_MARKS and stays the same object through a projection; the store is idle with no listener); and the plane's parts of seams.test.mjs, in the page: every anchor carries data-label; every node and edge gives its element; ViewHost shows a card for a kind with no body; a BodyFrame with stand-in rows turns a click into a Hit and opens the palette; the middle button drags the plane. For a test that needs something the built page does not hold (a BodyFrame with stand-in rows), bundle a small page of its own from the test, in memory or in a temporary folder, as test/core.mjs bundles the core and the probes of plan/spikes/ bundle theirs; never put a stand-in into canvas/dist/ and never read window.Grasp. Whatever helper your tests need goes into your test file for now, not into helpers.mjs: stage D owns helpers.mjs from your commit on and works beside stage C.

What is not yours: shell/ (but the one swap in Dock.tsx, theme.ts and what the plane must import), panels/, shell/ActionControl.tsx, plane/Palette.tsx's list of actions (stage C adds the ActionItems to the palette; BodyFrame mounts the palette as it is today), the keydown listener, the toasts. After your stage the page still behaves as before, plus this: the middle mouse button drags the plane.
`

const STAGE_C = COMMON + `
YOU ARE STAGE C: the shell's and the panels' seams. You work in /home/user/Grasp, the main tree. Stage D works beside you in a worktree of its own, on canvas/app/test/helpers.mjs, canvas/app/test/core.mjs and the new test files fixtures.test.mjs, connect.test.mjs and reconnect.test.mjs: you do not change those five files. A helper your tests need goes into your own test file, and you name it in your report so that stage E can move it.

Read first: ${S}/stage-0.md, ${S}/stage-A.md and ${S}/stage-B.md; plan/slice-2.md: "In short", sections 1 to 6, section 8 ("The rules every brief carries", "Package 2-1. The scaffold", and the briefs of packages 2-3, 2-4, 2-6, 2-7, 2-8, 2-9, 2-13 and 2-14, whose builders fill what you leave), sections 9 and 12; plan/architecture.md, section 2 and contracts 2 to 4, 11, 12, 14, 22, 26 and 27; canvas/app/README.md; every file of canvas/app/src/shell/ and of panels/; plane/Palette.tsx; core/commands.ts, core/keys.ts, core/says.ts, core/hands.ts, core/session.ts, core/notes.ts; views/; the tests keys.test.mjs, shell.test.mjs, tools-panel.test.mjs, tools.test.mjs, palette.test.mjs, details.test.mjs, details-fields.test.mjs, fieldHooks.test.mjs, validation.test.mjs.

Build (paths under canvas/app/src/):
  Seam 8, the shell's half. shell/ActionControl.tsx: ActionButton and ActionItem, with everything the seam says of them (data-action; greyed with the sentence as tooltip and aria-description; asked again when the session, the selection or the notes tell; an action with choices and no choice opens them as a menu; a click calls ask). plane/Palette.tsx: under the creation tools and a rule, an ActionItem for each action of PALETTE that is in the table and applies at the Hit; an action with choices opens them as a second level. shell/App.tsx: the page's one keydown listener on the window, which describes the event and where it came from and calls pressed(); it mounts LabelEditor. shell/TopBar.tsx and panels/Tools.tsx lose their key listeners, whose rules now live in core/keys.ts unchanged. TopBar: Undo, Redo and Save become ActionButtons; a Text button for open-text, shown once that row is in the table. shell/Toasts.tsx shows what was said last, by a tool or through saysOf, and carries data-said, a number that grows with each saying.
  Seam 9. panels/sections.ts (SectionProps, Section, SECTIONS in the seam's order) and the skeletons panels/ViewSection.tsx, panels/ShownSection.tsx and panels/CodeSection.tsx (applies answers false; the component renders nothing). panels/Details.tsx renders, under the form, each section that applies. panels/fieldHooks.ts joins the hooks of panels/hooks/sequence.ts and panels/hooks/geometry.ts to its own; today's locked order hook moves into hooks/sequence.ts as it is; hooks/geometry.ts is an empty table with its contract.
  Seam 10. shell/Dock.tsx and shell/dockContext.ts: the Notes panel on the left strip after Validation (panels/Notes.tsx, a skeleton that shows the empty state every panel had in slice 1: read plan/swarm/shared.md, section 3, for how a panel is put in); the tab that is not a view (showText, panel id text, the skeleton views/TextTab.tsx, titled <package name>.sysml); the tabs follow the model's views as views come and go; the dock and the Tools view read the views through viewsOf(session); a New view button at the end of the editor's tab bar, an ActionButton for new-view that shows once that row is in the table; the dock gives its hands to handsOf(session), with the camera and reveal that the bodies lend as stage B's report says.
  panels/Tools.tsx asks hasReader where it asked isDrawn.
  The three differences for a person that are yours (the brief of package 2-1): a key of the table pressed where its action does not apply says why in a toast (Mod+Z with nothing to undo, Mod+Y with nothing to redo); Escape with no tool in hand lets go of what is picked; the Undo and Redo buttons, when greyed, carry their sentence as their tooltip. With no file open a key does nothing and says nothing.

Tests, written first and seen to fail (canvas/app/test/): the shell's parts of seams.test.mjs, in the page (the palette lists an action that applies; a greyed ActionButton carries its sentence; and what else the brief of package 2-1 lists for that file that stage B's report leaves to you), and whatever holds the three differences above in the page. For a test that needs an action the table does not hold yet (a palette entry; a control with choices), bundle a small page of its own from the test, as stage B did for BodyFrame; never put a stand-in into canvas/dist/. Change the tests of slice 1 that pin what the brief changes on purpose (the keys' tests of keys.test.mjs, Escape, the greyed buttons), each as little as the plan's sentence asks, and list each.

What is not yours: plane/ but Palette.tsx, views/ but TextTab.tsx's skeleton, core/ (a defect you find there you may mend, saying what and why), canvas/app/test/helpers.mjs and core.mjs.
`

const STAGE_D1 = COMMON + `
YOU ARE STAGE D, first part: what the tests share, and the tests of criteria 2, 4 and 5, written first. You work in a worktree of your own, because stage C is changing the shell in the main tree at the same time. Make it now: from /home/user/Grasp run "git worktree add --detach /home/user/wt/2-1-tests HEAD" (HEAD is stage B's commit), then npm ci in /home/user/wt/2-1-tests. Work only there. You make no commit in /home/user/Grasp; stage E copies your files in.

You own, and change nothing else: canvas/app/test/helpers.mjs, canvas/app/test/core.mjs, canvas/app/test/fixtures.test.mjs, canvas/app/test/connect.test.mjs, canvas/app/test/reconnect.test.mjs.

Read first: ${S}/stage-0.md, ${S}/stage-A.md and ${S}/stage-B.md (how a test finds what a plane shows; the stand-in gesture that mounts the grips); plan/slice-2.md: "In short", sections 1 to 5, seam 12 above all, section 8 ("The rules every brief carries", "Package 2-1. The scaffold", "Package 2-2. Lines by dragging" in full, "Package 2-14"), sections 9 and 10; plan/architecture.md, contract 27; plan/notes.md, session 30, "The numbers behind criteria 4 and 5"; plan/swarm/shared.md, section 6 (what every test keeps to); canvas/app/test/helpers.mjs, core.mjs, open.test.mjs, tools.test.mjs, move.test.mjs, files.test.mjs; canvas/export.mjs; core/commands.ts (draw, drawProblem, toolGroups, place), core/readers/.

Build:
  1. helpers.mjs: every new data-testid name of seam 12 in TESTIDS, and every helper of its table: thingsIn, thingIn, linesIn, gripOf, dragBetween, rightClickOn, chooseAction, toast, pressKey, saveAndRead, exportOf, withNote, openNotes, noteIn, pinOf. Write each from the seam's words and from stages B's report. Try each against the built page as far as the page holds its thing today; for the grips, put stage 0's stand-in gesture into your worktree's plane/gestures/connect.ts while you try (and take it out again before you finish: your worktree's sources are not handed over, only your five files). What cannot be tried yet (toast's data-said, the Notes panel, a pin, an action in the palette) is written from the contract, and your report says which helpers were tried and which were not.
  2. core.mjs: loadWith entries the new modules need, and pairsState(), exactly as the brief of package 2-2 describes it under "How criterion 4's test is generated".
  3. fixtures.test.mjs: "the example and the nine fixtures each open: 17 views, each drawn by its own body, nothing logged" (criterion 2: for each view, what thingsIn finds in the page is what the view's reader lists, one for one, and no card is shown), marked todo, since six views still show their card; and "each of the ten files, opened and saved from the page, exports its pinned text" (the saved file, given to canvas/export.mjs, prints the pinned .sysml byte for byte), which passes today and is held from now on. The third test of that file in the brief of package 2-14, "two views of one model are shown side by side, each drawn", is written only if it passes today without a todo mark; otherwise leave a comment that package 2-14 writes it.
  4. connect.test.mjs: "in each graph view kind, a drag between each pair of node kinds draws what the rules allow and says why for what they refuse" (criterion 4), generated as the brief of package 2-2 says, over the ten files' classes and pairsState(), with what must happen worked out in Node from the model library's first and ends and draw's two own checks, apart from whatever package 2-2 will write; one test, with a time limit of its own of five minutes; marked todo.
  5. reconnect.test.mjs: "each kind of line has an end dragged to a node that may take it: one undo step, its label and its notes kept" and "an end dropped on a node that may not take it, or on the ground, leaves the line as it was, and a toast says why" (criterion 5), found as the brief says under "How criterion 5's test finds its lines"; both marked todo.
  Work the numbers of plan/notes.md out again in Node and say in your report whether they hold: 2,260 ordered pairs in the 11 graph views, 1,742 refused, 456 that fit one kind, 62 that fit several, 221 classes, each of the eight kinds allowed in some class; and for each of the nine relationship kinds a line that a graph view draws with another node that may take one of its ends.
  See each todo test fail for the reason its check names (a card where a body should be; no grip to drag from), and give the first line of each failure. With the stand-in gesture in, the two files of criteria 4 and 5 should get as far as the drag itself: say how far each gets, so that package 2-2's builder starts from tests that are known to drive the page correctly.

Your stage ends with, in your worktree: npm run build, npm run check, npm test passing with # fail 0 and # todo 4, and the stand-in out of the sources. Write your report to ${S}/stage-D1.md.
`

const STAGE_D2 = COMMON + `
YOU ARE STAGE D, second part: the document tests and the screenshots' skeletons. You work in /home/user/Grasp, the main tree, after stage C. The first part of stage D may still be working in its worktree, /home/user/wt/2-1-tests, on canvas/app/test/helpers.mjs, core.mjs, fixtures.test.mjs, connect.test.mjs and reconnect.test.mjs: you do not change those five files, and a helper you need goes into your own test file.

Read first: every report in ${S}/; plan/slice-2.md: sections 3, 5 (the action table), 6 (the screenshots' table), 7 (the capability list), 8 ("Package 2-1", "Package 2-14", "Package 2-15"), 9 and 10; plan/architecture.md, contracts 20 and 27; canvas/app/test/shots.mjs and canvas/app/test/shots/; canvas/app/test/unchanged.test.mjs; core/commands.ts.

Build, in canvas/app/test/:
  1. capabilities.test.mjs: "every capability of plan/slice-2.md names a test that exists under that name". It reads the tables of section 7 and looks for each test's name in the file the line gives. A name with a placeholder (the line 34 and 35 name holds \${w.name}) is found as the source has it. Marked todo: it fails today because most of the 74 tests of slice 2 are not written. Its failure lists the names that are missing, and it must also fail if section 7 does not hold 112 lines.
  2. refusals.test.mjs: "every action of the table, asked where it does not apply, says why", in Node through ask(), as the brief of package 2-14 describes it: every row of section 5 is in the table; each row that can be refused is asked at a place where it does not apply and gives a sentence that ends in a full stop; the five that always apply are named as such. Marked todo: most rows are not built. Leave the brief's two tests in the page as a comment that package 2-14 writes them at the slice's close.
  3. retired.test.mjs: "the old page is out of canvas/ and in archive/old-page/, and no script, test or pin names it", from the brief of package 2-15. Marked todo.
  4. camera.test.mjs: a file with its header comment (the names of lines 8 to 11 and 15 of section 7, which package 2-14 writes with the camera's keys) and no test yet.
  5. shots.mjs names all nine new screenshots of section 6, each a file of canvas/app/test/shots/ whose skeleton throws "<name>: package 2-N takes it" until its package writes it, in the way shots.mjs already leaves a pending shot out (plan/swarm/shared.md, section 5, the row of shots.mjs), so that npm run shots still writes the six of slice 1 and nothing else.
  See each of the three todo tests fail for the reason its check names, and give the first line of each failure.

Your stage ends with npm run build, npm run check and npm test passing in the main tree with # fail 0 and # todo 3 (the four other todo tests are in the worktree still). Write your report to ${S}/stage-D2.md, and commit as rule 9 says.
`

const STAGE_E = COMMON + `
YOU ARE STAGE E: integration. You work in /home/user/Grasp, the main tree, alone; nothing else is running.

Read first: every report in ${S}/; plan/slice-2.md: sections 3, 4, 8 ("Package 2-1. The scaffold"), 9 (the checks of the slice, and "When the state documents change") and 10 (criteria 9 to 11); plan/status.json.

Do, in this order:
  1. Bring stage D's five files from /home/user/wt/2-1-tests into the main tree: canvas/app/test/helpers.mjs, core.mjs, fixtures.test.mjs, connect.test.mjs, reconnect.test.mjs. Stages B, C and the second part of D wrote helpers inside their own test files and named them in their reports: where one of them is a helper of seam 12 or is needed by more than one test file, the test file now takes it from helpers.mjs, and its own copy goes. Check each helper that stage D could not try (toast with data-said, openNotes, the palette's actions) against what stage C built, and mend the helper or report the mismatch.
  2. Read the whole diff of the scaffold (git diff 780788b) against section 4 and the brief of package 2-1, for what fell between the stages: a seam's export that is missing or differs from its signature; a file of section 3's list that does not exist; a skeleton without its contract; a function that should throw "<name>: package 2-N builds it" and does not; a component that should render nothing and renders something. Mend what you find and list it.
  3. plan/status.json, which the lead owns and asks you to write: slice 2 stays "in progress" with "plan" and "criteria" as they are, "package": "2-1", "next_package": "2-2 to 2-9", a short "note" that says package 2-1 is built and the first round is next, and "checks": the twelve of section 9's table, each with "id", "check", "test" (as "file › name") and "status", "pass" or "todo" as the column "After the scaffold" says. Keep the file's form as slice 1's checks have it.
  4. The stand-in for the measurement of criterion 9. Write ${S}/standin-connect.patch: a patch against the main tree (git apply puts it in, git apply -R takes it out) that puts a stand-in gesture in place of "export const connectOf = null" so that the grips are mounted on every near node and a press on one does no harm. It is never committed. Put it in, build, and confirm in the page that every near node of the example shows its grips; run canvas/app/test/scale.test.mjs by itself once and give its medians; say which tests of the full suite would fail with the stand-in in, and why. Then take it out, build again, and confirm git status shows no change from it.
  5. Remove the two worktrees (git worktree remove --force /home/user/wt/2-1-grips, and the same for /home/user/wt/2-1-tests) once nothing more is needed from them; before that, copy stage 0's probe script and its stand-in block into ${S}/ if they are not there.
  6. npm ci, npm run build, npm run check, npm test: # fail 0 and # todo 7, with nothing else running. Give the runner's summary and every timed median of scale.test.mjs and instant.test.mjs from that run.
  7. Commit as rule 9 says. Write your report to ${S}/stage-E.md.
`

const ok = (r) => !!r && r.status === 'done'

phase('Core')
log('Stage 0 (grips probe, worktree) and stage A (core seams, main tree) start together')
const [probe, a] = await parallel([
  () => agent(STAGE_0, { ...OPTS, label: '2-1 stage 0: grips probe', phase: 'Core', schema: PROBE }),
  () => agent(STAGE_A, { ...OPTS, label: '2-1 stage A: core seams', phase: 'Core', schema: STAGE }),
])
if (!probe || !probe.gripsWork) {
  log('The grips probe did not confirm the technique: stopping before stage B')
  return { stoppedAt: 'stage 0', probe, a }
}
if (!ok(a)) return { stoppedAt: 'stage A', probe, a }

phase('Plane')
const b = await agent(STAGE_B, { ...OPTS, label: '2-1 stage B: plane and views', phase: 'Plane', schema: STAGE })
if (!ok(b)) return { stoppedAt: 'stage B', probe, a, b }

phase('Shell')
const [lane, d1] = await parallel([
  async () => {
    const c = await agent(STAGE_C, { ...OPTS, label: '2-1 stage C: shell and panels', phase: 'Shell', schema: STAGE })
    if (!ok(c)) return { c, d2: null }
    const d2 = await agent(STAGE_D2, { ...OPTS, label: '2-1 stage D2: document tests, shots', phase: 'Shell', schema: STAGE })
    return { c, d2 }
  },
  () => agent(STAGE_D1, { ...OPTS, label: '2-1 stage D1: shared test parts, criteria 2, 4, 5', phase: 'Shell', schema: STAGE }),
])
const c = lane ? lane.c : null
const d2 = lane ? lane.d2 : null
if (!ok(c) || !ok(d2) || !ok(d1)) return { stoppedAt: 'stage C or D', probe, a, b, c, d1, d2 }

phase('Integrate')
const e = await agent(STAGE_E, { ...OPTS, label: '2-1 stage E: integration', phase: 'Integrate', schema: STAGE })
return { stoppedAt: ok(e) ? null : 'stage E', probe, a, b, c, d1, d2, e }
