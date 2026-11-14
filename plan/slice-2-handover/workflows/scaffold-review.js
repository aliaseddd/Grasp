export const meta = {
  name: 'scaffold-review',
  description: 'Adversarial review of the scaffold of slice 2 (package 2-1): the seams against the plan, and each later package played by a builder who has only its brief',
  phases: [
    { title: 'Review', detail: 'one reviewer for each group of seams and each later package' },
  ],
}

// args: { base, head, pick: [keys] }
const S = '/tmp/claude-0/-home-user-Grasp/a16aa6a9-ce16-503b-882a-57c3a81fda9e/scratchpad'
const OPTS = { model: 'opus', effort: 'high' }
const BASE = args.base
const HEAD = args.head
const REPORTS = '/home/user/Grasp/plan/slice-2-handover'

const FOUND = {
  type: 'object',
  properties: {
    findings: { type: 'array', items: { type: 'object', properties: {
      title: { type: 'string' },
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'], description: 'blocker: a later package cannot be built from its brief, or a rule or criterion of the plan fails. major: the scaffold does otherwise than the plan says in a way a builder or a person will meet. minor: the rest.' },
      where: { type: 'string', description: 'The file and the place (line numbers at the reviewed commit)' },
      plan: { type: 'string', description: 'The sentence of plan/slice-2.md (with its section or line) that says what should be. At most three sentences.' },
      actual: { type: 'string', description: 'What the tree has or does instead, and how you saw it (the command, the script, the lines). At most four sentences.' },
      fix: { type: 'string', description: 'The smallest change that would mend it, and the file it belongs in. At most three sentences.' },
      forDamon: { type: 'boolean', description: 'True only when mending it would need the plan itself, a contract of plan/architecture.md, the form of a grasp/2 model or a lib.js to change' },
      tellBuilders: { type: 'string', description: 'If no change of the tree is needed but a builder must be told something the plan does not say: the sentence to tell, and which packages. Else empty.' },
    }, required: ['title', 'severity', 'where', 'plan', 'actual', 'fix'] } },
    held: { type: 'array', items: { type: 'string' }, description: 'What you checked that held, one short line each, at most twelve' },
    treeLeftAsFound: { type: 'boolean' },
  },
  required: ['findings', 'held', 'treeLeftAsFound'],
}

const COMMON = `
You are a reviewer working for the lead of slice 2 ("Editing parity") of Grasp, a SysML v2 design canvas that opens from disk in Chromium. The repository is /home/user/Grasp. The slice's plan is plan/slice-2.md, approved by Damon (the project's owner); it is the authority for every signature, name and sentence.

What you review. Package 2-1, the scaffold, was built in /home/user/Grasp by several builders, one after another: the seams of section 4, a skeleton of every file that packages 2-2 to 2-15 own, and the tests the plan asks of it. It is the difference between commit ${BASE} (the end of slice 1, with the plan) and ${HEAD} (the tree as it is checked out now): git -C /home/user/Grasp diff ${BASE} ${HEAD} -- canvas/app package.json plan/status.json (read it by file; it is large; canvas/dist is built output and need not be read). The builders' own reports are in ${REPORTS}/stages/ (stage-0.md, stage-A.md to stage-E.md), and ${REPORTS}/README.md is the hand-over that sums them up: read the diff before any report, and treat a report as a claim to check, not as a fact.

What the lead has decided already, so do not report it again as a finding unless it blocks a package or would mislead a builder who reads only the plan and the skeleton (then say exactly what, and what the builder must be told): the hand-over's "Decisions waiting for the lead", items 1 to 3, are applied in ${HEAD} (elevateEdgesOnSelect on the plane; npm test gives a file ten minutes; the test of slice 1 renamed to the name line 32 of section 7 gives), and the departures of its item 4 are accepted. Its item 5 lists what the builders of the later packages will be told beyond the plan; they will be pointed at plan/notes.md, where the lead writes those sentences before they start. If a builder needs to be told more than that list, say so (the field tellBuilders).

Eight to thirteen builders will start from this commit at the same time, each with one brief of section 8 and nothing else, each in its own worktree, none able to change a file it does not own. So what is wrong or missing here is paid for many times over, and cannot be mended by them. Your job is to find it now. Nobody is helped by an approval that missed something, and nobody is helped by a finding you did not check: say how you saw each.

Rules for you. Change nothing in /home/user/Grasp: no file, no build, no commit, no stash, no checkout (canvas/dist/ is built from ${HEAD} already; do not run npm run build, npm test or npm run shots there, since other reviewers read the same tree at the same time). If you need to run something that writes, make your own copy: git -C /home/user/Grasp worktree add --detach /home/user/wt/rv-<your key> ${HEAD}, then npm ci there (Playwright and Chromium are installed for every folder; never install them), and remove it when you are done (git -C /home/user/Grasp worktree remove --force <path>). Reading, and single Node test files that open no browser (node --test --test-timeout=600000 canvas/app/test/<file>), may be run in /home/user/Grasp. Throwaway scripts go under ${S}/review/<your key>/ (make the folder). This container has 4 processors and seven other reviewers are working: a timed test (scale.test.mjs, instant.test.mjs) may miss its limit for that reason alone; do not report that, and do not run the whole of npm test: run the files your part concerns.

What to send back. Findings, each one checked by you: what the plan says, with its section, and what the tree has. Rank honestly; taste is no finding, and neither is what the plan leaves to a later package or to slice 7. Where the plan itself is unclear or contradicts itself, say so as a finding with what the scaffold chose. Keep each field short, as its description says: the lead reads nineteen such reports. If after really trying you find nothing in an area, say what you tried under "held". Also write your findings in full, with whatever evidence does not fit the short fields, to ${S}/review/<your key>/findings.md.
`

const SEAMS = [
  { key: 'core', what: `the core's seams: seam 1 (readers), seam 4 (marks), seam 5 (who a node is, and a code compartment's rows), the core's half of seam 7 (core/labels.ts), seam 8's core half (core/commands.ts: Action, actions(), ask(), PALETTE, editable, gesturesOf, drawProblem, freshElement, freshRelationship; core/keys.ts; core/says.ts; core/hands.ts) and seam 11 (the notes in a session and in a state file). Read section 4 for these seams line by line against canvas/app/src/core/: every exported type, function and field named in the plan exists with that name and that signature; every comment's contract is in the skeleton; what is not built is null, empty or throws "<name>: package 2-N builds it" as the brief of package 2-1 says under "What a skeleton is". Then section 5's action table: the scaffold's rows (which rows are in the table now, and are the others' skeletons in core/actions/* with the id, title, key and words section 5 gives?). Then the brief's "Changes in existing files" for core/commands.ts (the moved typing; hasReader where isDrawn was; place going to the kind's placer). Run actions.test.mjs, readers.test.mjs, marks.test.mjs, says.test.mjs, session-notes.test.mjs and judge whether each test the brief lists under "Tests it writes, which pass at its commit" is there and would fail if what it guards broke (break three you trust least in your own worktree copy).` },
  { key: 'plane', what: `the plane's and the views' seams: seam 2 (views/bodies.ts, views/ViewHost.tsx, views/BodyFrame.tsx, views/bodyContext.ts), seam 3 (a graph body of another renderer: plane/viewStore.ts and plane/Plane.tsx), seam 6 (grips: plane/nodes/Grips.tsx, plane/gestures/connect.ts, the classes and data attributes, connectOf null in the scaffold so that no grip is mounted), seam 7's plane half (data-label anchors on every label; plane/LabelEditor.tsx's skeleton), the marks' places on a node and an edge (seam 4's plane half), and the brief's "Changes in existing files" for plane/Plane.tsx (middle button pans; --grasp-zoom set on a zoom and never on a pan; data-grips and data-connecting; the swallowed click after a gesture's release; an entry's flow props; the camera's hand: zoom by 1.2 about the middle, move by 80 px, fit, reveal) and plane/viewStore.ts. Read section 4 for these seams line by line against canvas/app/src/plane/ and canvas/app/src/views/. Build your own worktree copy and try the page (open canvas/dist/index.html from file:// as canvas/app/test/helpers.mjs does): the example opens and looks as in slice 1; no grip is mounted; a body that is not built shows its card; the middle button pans; a pan does not rewrite --grasp-zoom; nothing is logged. Apply ${REPORTS}/stages/standin-connect.patch in your copy, build, and check that grips mount on near nodes and a press on one neither moves the node nor pans nor starts a marquee, and that both end grips of a selected line can be pressed (elevateEdgesOnSelect: try a line that crosses a box, and look at what a selected line now covers); then judge whether the stand-in measures what criterion 9 means it to (grips on every near node).` },
  { key: 'shell', what: `the shell's and the panels' seams: seam 8's shell half (shell/ActionControl.tsx: ActionButton and ActionItem; the palette listing actions; App's one keydown listener going through pressed(); shell/Toasts.tsx showing what was said last with data-said; shell/TopBar.tsx with Undo, Redo and Save as ActionButtons and the Text button hidden until its row exists), seam 9 (panels/sections.ts, panels/hooks/*, the option rows, setViewOption), seam 10 (the dock: shell/Dock.tsx and shell/dockContext.ts: the Notes panel's place, the text tab, tabs following views, the New view button) and the Notes panel's skeleton. Read section 4 for these seams line by line against canvas/app/src/shell/ and canvas/app/src/panels/. Then the four changes "for a person, on purpose" of package 2-1's brief: build your own worktree copy and try each in the page, and try that NOTHING ELSE changed for a person: walk the page as slice 1 left it (open the example; pick, drag, type a name in Details; Undo and Redo by key and by button; a tool in hand and Escape; the palette by right click; the Explorer; Save by key), and in particular the keys: section 2 "The keys' aliases, and the page with no file" and section 5's rule of where a key is the page's (typing in a field; inside a tree, menu, listbox, tablist, radiogroup or grid; a modal dialog open; no file open). Look for a key that acted in slice 1 and no longer does, or acts where it should not (Escape in an open menu or a checkbox; Backspace; Ctrl+Shift+Z; Ctrl+S with no file), beyond the ones the hand-over's item 4 already lists.` },
  { key: 'tests', what: `the tests and the state documents. (1) Section 9's table of the slice's twelve checks against plan/status.json and the test files: each test exists under exactly the name the table gives, in the file it gives; the seven marked todo after the scaffold are todo and the five others pass; a todo test has a real body that would run (not an empty stub), was "seen to fail" as the brief says, and nothing else in the suite is todo or skipped. Count: the runner's # todo must be 7 (the lead's last full run, alone: 559 tests, 552 pass, 0 fail, 7 todo). (2) Seam 12 (what the tests share: canvas/app/test/helpers.mjs and core.mjs): every helper the seam names exists with the signature it gives (thingsIn, gripOf, dragBetween, toast, withNote, pairsState and the rest); read each helper's code and judge whether it does what the seam says for a builder who will call it blind. (3) capabilities.test.mjs: it reads the tables of section 7 and looks for each name in its file; check its reading of the tables against the plan's text (count the capabilities it finds: the plan says 112) and that it reports each missing name. (4) refusals.test.mjs, fixtures.test.mjs, connect.test.mjs, reconnect.test.mjs, retired.test.mjs, camera.test.mjs, seams.test.mjs: read each against its lines in section 8 (packages 2-1, 2-2, 2-14, 2-15) and sections 9 and 10: does each test check what its criterion asks, or less? A test written by the scaffold for a later package to pass is a contract: is anything in it impossible to satisfy from that package's owned files, or so loose that a wrong build passes? (5) The tests of slice 1 the scaffold changed (the reports list them): for each, the sentence of the plan that asks for it, and whether the change loosened anything beyond that. git diff ${BASE} ${HEAD} --stat -- canvas/app/test shows them. (6) canvas/app/test/shots.mjs and test/shots/: the nine new screenshots by name, each a skeleton that throws until its package writes it; section 6's table gives the names. (7) canvas/app/test/unchanged.json still pins what it pinned, and nothing it lists changed. (8) package.json now gives a test file ten minutes (--test-timeout=600000): is there a test of the suite whose own limit relied on the old two minutes, or a place (a README, a script, unchanged.test.mjs) that still says 120000 for the new page's tests and would mislead a builder?` },
  { key: 'layout', what: `the layout and the ownership. Section 3 "The files, and the package that owns each" is a table of every file of the slice with its owner. Check it against the tree at ${HEAD}, file by file: every file the table names exists (a skeleton if a later package owns it); no file of canvas/app/src or canvas/app/test exists that the table does not name or that slice 1 did not have (git diff --name-status ${BASE} ${HEAD}); no file is owned by two packages of one round; each brief's "Owns" list in section 8 agrees with the table. Then "Who calls whom" and "Who owns each piece of state" of section 3 against the imports of the tree: list every import that crosses a boundary the section forbids (a component reading a model record's field; a panel importing the plane; the core importing React). Then rule 6 of "The rules every brief carries": which modules read a field of a model's record today, and is each one of contract 22's. Then no colour outside shell/theme.ts and no import outside src/vendor.ts (npm run check has checks for some of this: read what it checks and what it does not). Then the documents: plan/status.json (slice 2 in progress; the twelve checks as section 9 gives them; it still says package 2-0 and next 2-1 on purpose, since the package is not landed) and canvas/app/README.md (does it describe the tree as the scaffold leaves it, for a builder who reads it first?).` },
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
Your key: ${r.key}
Your part: ${r.what}
`

const packagePrompt = (id, brief) => `${COMMON}
Your key: ${id}
Your part: play the builder of ${id}. You are handed one brief, section 8's "The rules every brief carries" and "${brief}", and you may read only what that brief names under "Read first", the sections of the plan it cites, and the files of the tree. Do not build the package. Walk through building it, step by step, as far as needed to find where you would be stuck or misled:
  1. Every file the brief lists under "Owns" and every skeleton it says you fill: does it exist at ${HEAD}, with the exported names and signatures the brief and section 4 use? Does its comment give the contract, or would you have to guess?
  2. Everything the brief says you call, read or mount that you do NOT own (a seam of section 4, a helper of seam 12, a hook, a hand, an icon in src/vendor.ts, a colour in shell/theme.ts, a place in Plane.tsx, Dock.tsx, TopBar.tsx, Details or the palette where your part appears): is it there and wired, so that filling only your own files makes your part appear and work in the page? Follow each call path in the code from the person's hand to your skeleton and back to the screen. A place where your part would need a line changed in a file you do not own is a blocker: name the file and the line.
  3. The tests the brief says you write first, and the tests the scaffold wrote for you to pass (connect.test.mjs, reconnect.test.mjs, fixtures, refusals, capabilities, camera, retired, as they concern you): can each be satisfied by filling only your owned files? Do the shared helpers you would call (canvas/app/test/helpers.mjs, core.mjs) do what you need? Does section 7 give each of your lines a test name and a file you own?
  4. The tests of slice 1 your package will make fail by design, as your brief and package 2-14's brief name them: are they the right ones, and would any OTHER test of slice 1 or of the scaffold fail once your part is built as briefed (a test that pins today's card, today's empty list, today's "not built" words, "no grip is mounted")? Grep the tests for what your part changes.
  5. Your screenshot, if the brief names one: its skeleton under canvas/app/test/shots/ and its name in shots.mjs; can its scenario (section 6) be set up from your owned files?
  6. Another package of the same round (first round: 2-2 to 2-9 and the camera's part of 2-14; second round: 2-10 to 2-13) that owns a file you would need to change, or that must land before your tests can pass: the plan says none exists inside a round. Check it for your package. A package of the second round may count on everything the first round builds, as its brief says.
  7. Where the scaffold's builders say they departed from the plan (their reports, and the hand-over's items 4 and 5), does a departure change what your brief tells you?
For package 2-14, the camera's keys and the readout (core/actions/camera.ts, plane/ZoomReadout.tsx, camera.test.mjs) are built in the first round by a builder who owns exactly those three files, and the rest is the lead's closing: check both. For package 2-15, check that what the brief moves and changes is all still where the brief says it is, and that retired.test.mjs asks exactly what the brief delivers.
`

const pick = new Set(args.pick)
const jobs = []
for (const r of SEAMS) if (pick.has(r.key)) jobs.push({ key: r.key, prompt: seamPrompt(r) })
for (const [id, brief] of PACKAGES) if (pick.has(id)) jobs.push({ key: id, prompt: packagePrompt(id, brief) })

phase('Review')
const results = await parallel(jobs.map((j) => () =>
  agent(j.prompt, { ...OPTS, label: 'review ' + j.key, phase: 'Review', schema: FOUND }).then((r) => ({ key: j.key, ...(r || { findings: [], held: [], treeLeftAsFound: false, noAnswer: true }) }))))
return results
