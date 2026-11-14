export const meta = {
  name: 'scaffold-review',
  description: 'Adversarial review of the scaffold of slice 2 (package 2-1): the seams against the plan, and each later package played by a builder who has only its brief',
  phases: [
    { title: 'Review', detail: 'one reviewer for each group of seams and each later package' },
  ],
}

// args: { base, head, pick: [keys] }
const S = '/tmp/claude-0/-home-user-Grasp/c7f4c0c3-3293-5171-8b1a-2fc91a0152d6/scratchpad'
const OPTS = { model: 'fable', effort: 'high' }
const BASE = args.base
const HEAD = args.head

const FOUND = {
  type: 'object',
  properties: {
    findings: { type: 'array', items: { type: 'object', properties: {
      title: { type: 'string' },
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'], description: 'blocker: a later package cannot be built from its brief, or a rule or criterion of the plan fails. major: the scaffold does otherwise than the plan says in a way a builder or a person will meet. minor: the rest.' },
      where: { type: 'string', description: 'The file and the place' },
      plan: { type: 'string', description: 'The sentence of plan/slice-2.md (with its section or line) that says what should be' },
      actual: { type: 'string', description: 'What the tree has or does instead, and how you saw it (the command, the script, the lines)' },
      fix: { type: 'string', description: 'The smallest change that would mend it, and the file it belongs in' },
      forDamon: { type: 'boolean', description: 'True only when mending it would need the plan itself, a contract of plan/architecture.md, the form of a grasp/2 model or a lib.js to change' },
    }, required: ['title', 'severity', 'where', 'plan', 'actual', 'fix'] } },
    held: { type: 'array', items: { type: 'string' }, description: 'What you checked that held, one line each' },
    treeLeftAsFound: { type: 'boolean' },
  },
  required: ['findings', 'held', 'treeLeftAsFound'],
}

const COMMON = `
You are a reviewer working for the lead of slice 2 ("Editing parity") of Grasp, a SysML v2 design canvas that opens from disk in Chromium. The repository is /home/user/Grasp. The slice's plan is plan/slice-2.md, approved by Damon; it is the authority for every signature, name and sentence.

What you review. Package 2-1, the scaffold, was just built in /home/user/Grasp by several builders, one after another: the seams of section 4, a skeleton of every file that packages 2-2 to 2-15 own, and the tests the plan asks of it. It is the difference between commit ${BASE} (the end of slice 1) and ${HEAD}: git -C /home/user/Grasp diff ${BASE} ${HEAD} -- . ':!canvas/dist' (read it by file; it is large). The builders' own reports are in ${S}/scaffold/ (stage-0.md, stage-A.md to stage-E.md): read the diff before any report, and treat a report as a claim to check, not as a fact. Where a builder says it built something otherwise than the plan says, judge whether the plan's intent is kept and whether a later builder, who reads only the plan and the skeleton, would be misled.

Eight to thirteen builders will start from this commit at the same time, each with one brief of section 8 and nothing else, each in its own worktree, none able to change a file it does not own. So what is wrong or missing here is paid for many times over, and cannot be mended by them. Your job is to find it now. Nobody is helped by an approval that missed something.

Rules for you. Change nothing in /home/user/Grasp: no file, no build, no commit (canvas/dist/ is built from ${HEAD} already; do not run npm run build, npm test or npm run shots there, since other reviewers read the same tree at the same time). If you need to run something that writes, make your own copy: git -C /home/user/Grasp worktree add --detach /home/user/wt/rv-<your key> ${HEAD}, then npm ci there (Playwright and Chromium are installed for every folder; never install them), and remove it when you are done (git -C /home/user/Grasp worktree remove --force <path>). Reading, npm run check's parts that write nothing, and single Node test files (node --test --test-timeout=120000 canvas/app/test/<file>) may be run in /home/user/Grasp. Throwaway scripts go under ${S}/review/<your key>/. This container has 4 processors and other reviewers are working: a timed test (scale.test.mjs, instant.test.mjs) may miss its limit for that reason alone; do not report that.

What to send back. Findings, each one checked by you (say how): what the plan says, with its section, and what the tree has. Rank honestly; taste is no finding, and neither is what the plan leaves to a later package or to slice 7. Where the plan itself is unclear or contradicts itself, say so as a finding with what the scaffold chose. If after really trying you find nothing in an area, say what you tried under "held".
`

const SEAMS = [
  { key: 'core', what: `the core's seams: seam 1 (readers), seam 4 (marks), seam 5 (who a node is, and a code compartment's rows), the core's half of seam 7 (core/labels.ts), seam 8's core half (core/commands.ts: Action, actions(), ask(), PALETTE, editable, gesturesOf, drawProblem, freshElement, freshRelationship; core/keys.ts; core/says.ts; core/hands.ts) and seam 11 (the notes in a session and in a state file). Read section 4 for these seams line by line against canvas/app/src/core/: every exported type, function and field named in the plan exists with that name and that signature; every comment's contract is in the skeleton; what is not built is null, empty or throws "<name>: package 2-N builds it" as the brief of package 2-1 says under "What a skeleton is". Then section 5's action table: the scaffold's rows (which rows are in the table now, and are the others' skeletons in core/actions/* with the id, title, key and words section 5 gives?). Then the brief's "Changes in existing files" for core/commands.ts (the moved typing; hasReader where isDrawn was; place going to the kind's placer). Run actions.test.mjs, readers.test.mjs, marks.test.mjs, says.test.mjs, session-notes.test.mjs and judge whether each test the brief lists under "Tests it writes, which pass at its commit" is there and would fail if what it guards broke (break three you trust least in your own worktree copy).` },
  { key: 'plane', what: `the plane's and the views' seams: seam 2 (views/bodies.ts, views/ViewHost.tsx, views/BodyFrame.tsx, views/bodyContext.ts), seam 3 (a graph body of another renderer: plane/viewStore.ts and plane/Plane.tsx), seam 6 (grips: plane/nodes/Grips.tsx, plane/gestures/connect.ts, the classes and data attributes, connectOf null in the scaffold so that no grip is mounted), seam 7's plane half (data-label anchors on every label; plane/LabelEditor.tsx's skeleton), the marks' places on a node and an edge (seam 4's plane half), and the brief's "Changes in existing files" for plane/Plane.tsx (middle button pans; --grasp-zoom set on a zoom and never on a pan; data-grips and data-connecting; the swallowed click after a gesture's release; an entry's flow props; the camera's hand: zoom by 1.2 about the middle, move by 80 px, fit, reveal) and plane/viewStore.ts. Read section 4 for these seams line by line against canvas/app/src/plane/ and canvas/app/src/views/. Build your own worktree copy and try the page (open canvas/dist/index.html from file:// as canvas/app/test/helpers.mjs does): the example opens and looks as in slice 1; no grip is mounted; a body that is not built shows its card; the middle button pans; a pan does not rewrite --grasp-zoom; nothing is logged. Apply ${S}/scaffold/standin-connect.patch in your copy if it exists, build, and check that grips mount on near nodes and a press on one neither moves the node nor pans nor starts a marquee; then judge whether the stand-in measures what criterion 9 means it to (grips on every near node).` },
  { key: 'shell', what: `the shell's and the panels' seams: seam 8's shell half (shell/ActionControl.tsx: ActionButton and ActionItem; the palette listing actions; App's one keydown listener going through pressed(); shell/Toasts.tsx showing what was said last with data-said; shell/TopBar.tsx with Undo, Redo and Save as ActionButtons and the Text button hidden until its row exists), seam 9 (panels/sections.ts, panels/hooks/*, the option rows, setViewOption), seam 10 (the dock: shell/Dock.tsx and shell/dockContext.ts: the Notes panel's place, the text tab, tabs following views, the New view button) and the Notes panel's skeleton. Read section 4 for these seams line by line against canvas/app/src/shell/ and canvas/app/src/panels/. Then the four changes "for a person, on purpose" of package 2-1's brief: build your own worktree copy and try each in the page, and try that NOTHING ELSE changed for a person: walk the page as slice 1 left it (open the example; pick, drag, type a name in Details; Undo and Redo by key and by button; a tool in hand and Escape; the palette by right click; the Explorer; Save by key), and in particular the keys: section 2 "The keys' aliases, and the page with no file" and section 5's rule of where a key is the page's (typing in a field; inside a tree, menu, listbox, tablist, radiogroup or grid; a modal dialog open; no file open). Look for a key that acted in slice 1 and no longer does, or acts where it should not (Escape in an open menu or a checkbox; Backspace; Ctrl+Shift+Z; Ctrl+S with no file).` },
  { key: 'tests', what: `the tests and the state documents. (1) Section 9's table of the slice's twelve checks against plan/status.json and the test files: each test exists under exactly the name the table gives, in the file it gives; the seven marked todo after the scaffold are todo and the five others pass; a todo test has a real body that would run (not an empty stub), was "seen to fail" as the brief says, and nothing else in the suite is todo or skipped. Count: the runner's # todo must be 7. (2) Seam 12 (what the tests share: canvas/app/test/helpers.mjs and core.mjs): every helper the seam names exists with the signature it gives (thingsIn, gripOf, dragBetween, toast, withNote, pairsState and the rest); read each helper's code and judge whether it does what the seam says for a builder who will call it blind. (3) capabilities.test.mjs: it reads the tables of section 7 and looks for each name in its file; check its reading of the tables against the plan's text (count the capabilities it finds: the plan says 112) and that it reports each missing name. (4) refusals.test.mjs, fixtures.test.mjs, connect.test.mjs, reconnect.test.mjs, retired.test.mjs, camera.test.mjs, seams.test.mjs: read each against its lines in section 8 (packages 2-1, 2-2, 2-14, 2-15) and sections 9 and 10: does each test check what its criterion asks, or less? A test written by the scaffold for a later package to pass is a contract: is anything in it impossible to satisfy from that package's owned files, or so loose that a wrong build passes? (5) The tests of slice 1 the scaffold changed (the reports list them): for each, the sentence of the plan that asks for it, and whether the change loosened anything beyond that. git diff ${BASE} ${HEAD} --stat -- canvas/app/test shows them. (6) canvas/app/test/shots.mjs and test/shots/: the nine new screenshots by name, each a skeleton that throws until its package writes it; section 6's table gives the names. (7) canvas/app/test/unchanged.json still pins what it pinned, and nothing it lists changed.` },
  { key: 'layout', what: `the layout and the ownership. Section 3 "The files, and the package that owns each" is a table of every file of the slice with its owner. Check it against the tree at ${HEAD}, file by file: every file the table names exists (a skeleton if a later package owns it); no file of canvas/app/src or canvas/app/test exists that the table does not name or that slice 1 did not have (git diff --name-status ${BASE} ${HEAD}); no file is owned by two packages of one round; each brief's "Owns" list in section 8 agrees with the table. Then "Who calls whom" and "Who owns each piece of state" of section 3 against the imports of the tree: list every import that crosses a boundary the section forbids (a component reading a model record's field; a panel importing the plane; the core importing React). Then rule 6 of "The rules every brief carries": which modules read a field of a model's record today, and is each one of contract 22's. Then no colour outside shell/theme.ts and no import outside src/vendor.ts (npm run check has checks for some of this: read what it checks and what it does not). Then the documents: plan/status.json (slice 2 in progress, package 2-1, the twelve checks as section 9 gives them) and canvas/app/README.md.` },
]

const PACKAGES = [
  ['2-2', 'Package 2-2. Lines by dragging'],
  ['2-3', 'Package 2-3. Label editing'],
  ['2-4', 'Package 2-4. Deleting, showing, and views'],
  ['2-5', 'Package 2-5. Moving a box into another owner'],
  ['2-6', 'Package 2-6. Badges, and the checks while drawing'],
  ['2-7', 'Package 2-7. Notes and the archive'],
  ['2-8', 'Package 2-8. Code links in Details'],
  ['2-9', 'Package 2-9. The text tab'],
  ['2-10', 'Package 2-10. The sequence view'],
  ['2-11', 'Package 2-11. The geometry view'],
  ['2-12', 'Package 2-12. The grid view'],
  ['2-13', 'Package 2-13. The browser view, and renaming in a tree'],
  ['2-14', 'Package 2-14. The fixtures, the limits and the camera\'s keys'],
  ['2-15', 'Package 2-15. Retiring the old page'],
]

const seamPrompt = (r) => `${COMMON}
Your part: ${r.what}
`

const packagePrompt = (id, brief) => `${COMMON}
Your part: play the builder of ${id}. You are handed one brief, section 8's "The rules every brief carries" and "${brief}", and you may read only what that brief names under "Read first", the sections of the plan it cites, and the files of the tree. Do not build the package. Walk through building it, step by step, as far as needed to find where you would be stuck or misled:
  1. Every file the brief lists under "Owns" and every skeleton it says you fill: does it exist at ${HEAD}, with the exported names and signatures the brief and section 4 use? Does its comment give the contract, or would you have to guess?
  2. Everything the brief says you call, read or mount that you do NOT own (a seam of section 4, a helper of seam 12, a hook, a hand, an icon in src/vendor.ts, a colour in shell/theme.ts, a place in Plane.tsx, Dock.tsx, TopBar.tsx, Details or the palette where your part appears): is it there and wired, so that filling only your own files makes your part appear and work in the page? Follow each call path in the code from the person's hand to your skeleton and back to the screen. A place where your part would need a line changed in a file you do not own is a blocker: name the file and the line.
  3. The tests the brief says you write first, and the tests the scaffold wrote for you to pass (connect.test.mjs, reconnect.test.mjs, fixtures, refusals, capabilities, camera, retired, as they concern you): can each be satisfied by filling only your owned files? Do the shared helpers you would call (canvas/app/test/helpers.mjs, core.mjs) do what you need? Does section 7 give each of your lines a test name and a file you own?
  4. The tests of slice 1 your package will make fail by design, as your brief and package 2-14's brief name them: are they the right ones, and would any OTHER test of slice 1 fail once your part is built as briefed (a test that pins today's card, today's empty list, today's "not built" words)? Grep the tests for what your part changes.
  5. Your screenshot, if the brief names one: its skeleton under canvas/app/test/shots/ and its name in shots.mjs; can its scenario (section 6) be set up from your owned files?
  6. Another package of the same round (first round: 2-2 to 2-9 and the camera's part of 2-14; second round: 2-10 to 2-13) that owns a file you would need to change, or that must land before your tests can pass: the plan says none exists inside a round. Check it for your package.
  7. Where the scaffold's builders say they departed from the plan (their reports), does a departure change what your brief tells you?
For package 2-14, the camera's keys and the readout (core/actions/camera.ts, plane/ZoomReadout.tsx, camera.test.mjs) are built in the first round by a builder, and the rest is the lead's closing: check both. For package 2-15, check that what the brief moves and changes is all still where the brief says it is, and that retired.test.mjs asks exactly what the brief delivers.
`

const pick = new Set(args.pick)
const jobs = []
for (const r of SEAMS) if (pick.has(r.key)) jobs.push({ key: r.key, prompt: seamPrompt(r) })
for (const [id, brief] of PACKAGES) if (pick.has(id)) jobs.push({ key: id, prompt: packagePrompt(id, brief) })

phase('Review')
const results = await parallel(jobs.map((j) => () =>
  agent(j.prompt, { ...OPTS, label: 'review ' + j.key, phase: 'Review', schema: FOUND }).then((r) => ({ key: j.key, ...(r || { findings: [], held: [], treeLeftAsFound: false, noAnswer: true }) }))))
return results
