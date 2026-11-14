export const meta = {
  name: 'slice-2-land',
  description: 'Land built packages of slice 2 in the main tree, one after another: one commit each, checked alone, pushed',
  phases: [
    { title: 'Land', detail: 'one package at a time, nothing else running' },
  ],
}

// args: { base, branch, session, packages: [{ id, name, brief, title, statusPackage, statusNext, todoAfter, marksOff, open, base? }] }
// A package's own `base` is the commit its worktree started from, when that is not the round's (2-3: the scaffold with the camera on top).
const S = '/tmp/claude-0/-home-user-Grasp/a16aa6a9-ce16-503b-882a-57c3a81fda9e/scratchpad'
const PK = S + '/packages'
const OPTS = { model: 'opus', effort: 'high' }
const BASE = args.base
const BRANCH = args.branch

const LANDED = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['landed', 'stopped'] },
    commit: { type: 'string', description: 'The hash of the landing commit, when landed' },
    pushed: { type: 'boolean' },
    summary: { type: 'string' },
    testSummary: { type: 'string', description: 'The runner summary of the last full npm test on the tree you committed: # tests, # pass, # fail, # todo, the seconds' },
    timed: { type: 'array', items: { type: 'string' }, description: 'Each timed test\'s medians in that run, and in every rerun alone, as the runner printed them' },
    filesTaken: { type: 'array', items: { type: 'string' } },
    notTaken: { type: 'array', items: { type: 'string' }, description: 'Each change in the worktree you did not take, with the reason' },
    slice1Changed: { type: 'array', items: { type: 'object', properties: { test: { type: 'string' }, planSentence: { type: 'string' } }, required: ['test', 'planSentence'] } },
    mended: { type: 'array', items: { type: 'string' }, description: 'Each thing you had to mend to make the tree pass, with the file and the reason' },
    stoppedReason: { type: 'string' },
  },
  required: ['status', 'summary', 'testSummary', 'pushed'],
}

const lander = (p, prev) => `
You are landing package ${p.id}, "${p.name}", of slice 2 ("Editing parity") of Grasp, for the lead. Grasp is a SysML v2 design canvas that opens from disk in Chromium. The lead's tree is /home/user/Grasp, on branch ${BRANCH}. Nothing else is running on this machine while you work, so what you measure counts.

The package was built in the worktree /home/user/wt/${p.id}, on top of commit ${p.base || BASE}, by a builder; a reviewer who did not write it read it and tried it, and what came back was reworked. The record is in ${PK}/${p.id}/ (report.md, rework-*.md). ${p.open ? 'What the review left open, for you to weigh:\n' + p.open + '\n' : ''}
Other packages built from the same commit have landed before this one${prev.length ? ' (' + prev.join(', ') + ')' : ' (none yet)'}; this package was never run together with them. Your job is to bring it into the lead's tree as ONE commit that passes by itself, and push it.

Read first: plan/slice-2.md, section 8 ("The rules every brief carries" and "${p.brief}"), section 9 ("How a package is built and landed", "The checks of the slice", "When the state documents change"), and package 2-14's line "What the lead changes in slice 1's tests". Then plan/notes.md, the entry of session ${args.session} (the last entry), to see how a package's subsection is written.

Steps.
  1. Before anything: in /home/user/Grasp, git status --porcelain is empty and the branch is ${BRANCH}. If not, stop and say what you found; do not clean up what you did not make.
  2. Read what the package changed: git -C /home/user/wt/${p.id} log --oneline ${p.base || BASE}..HEAD, then git -C /home/user/wt/${p.id} diff --name-status ${p.base || BASE} HEAD -- . ':!canvas/dist'. Sort every changed file into: (a) owned by the package (the brief's "Owns", files it creates that the brief names, its screenshot canvas/app/shots/<name>.png); (b) a test of slice 1 the package makes fail by design, changed in the commit titled "lead: tests of slice 1 changed by design, package ${p.id}"; (c) anything else.
  3. Take (a) into the lead's tree as a patch, not as a copy, so that nothing an earlier landing changed is lost: git -C /home/user/wt/${p.id} diff --binary ${p.base || BASE} HEAD -- <the owned files> | git -C /home/user/Grasp apply --3way --index. A conflict means an earlier landing touched the same file: read both sides, keep both intents, and say so in your answer.
  4. For (b), read each hunk against the sentence of the plan that asks for it (the brief's "It names…" line, and package 2-14's "What the lead changes in slice 1's tests"). Take a hunk only if it is what that sentence asks and loosens nothing else; apply it the same way, as a patch. A hunk that goes further is not taken: change the test yourself by as little as the sentence asks.
  5. (c) is not taken. If the package cannot work without it, that is a stop: say which file and why.
  6. ${p.marksOff ? p.marksOff : 'This package earns no todo mark off: the todo tests stay as they are.'}
  7. npm run build; npm run check; then the whole suite, alone: npm test > ${PK}/${p.id}/land-test.log 2>&1 (it takes six to ten minutes: run it in the background or with a long timeout, and read the summary lines at the end). It must end with # fail 0 and # todo ${p.todoAfter}.
     - A timed test (scale.test.mjs, instant.test.mjs) that misses its limit: run its file alone, up to three times (node --test --test-timeout=600000 canvas/app/test/scale.test.mjs), and write down every run's medians. This container runs close to the limits with no change at all (session 31's container gave, on untouched code, alone: a drag step 10 to 17 ms starting against 16; a pan step 10 to 18 against 16 and 14 to 26 against 25 for the 2,112-node view; and failed one run in three. This container is faster: the scaffold's commit gave a drag step 14 ms, a pan step 8 to 10 and 14 to 15, a keystroke 31 to 34 against 50). If the file passes alone at least twice in three, write the numbers down and go on. If it fails alone twice or more, find out whether this package made it slower (git stash, or the file run on the parent commit in a spare worktree, in turn with yours) and report the numbers: that is a stop for the lead, never a reason to change a limit or a test.
     - Any other failure is real until shown otherwise. Run the file alone once to see whether it repeats. If it does, find the cause. If the cause is this package meeting one that landed before it, mend it in this package's own files with the smallest change, with a test where a test can hold it, and say so. If mending it needs another package's file, or the plan to change, stop and say what you found.
     - Never loosen, skip or mark a test todo, and never raise a time limit.
  8. plan/status.json: under slice 2, "package": "${p.statusPackage}", "next_package": "${p.statusNext}", and each check's status as section 9's table gives it after this landing (the runner's # todo must equal the number of checks that are "todo"). Keep the file's form.
  9. plan/notes.md: at the end of the entry of session ${args.session}, add a subsection "### Package ${p.id}: ${p.name}" in the manner of the entry's other subsections. It holds what cannot be read from the plan or from the code: each measurement with its command (the timed tests' medians of your run); each file built otherwise than the plan names, with its reason; each thing tried and dropped; each test of slice 1 changed by design, with the plan's sentence; what the review found that mattered and what was done; whatever you mended at landing. Take these from ${PK}/${p.id}/ and from what you did. Plain sentences, no praise, nothing that the code already says.
  10. One commit holds it all: the package's sources and tests, its screenshot, canvas/dist/ as you built it, plan/status.json and plan/notes.md. git add -A; check git status first so that nothing stray goes in (no .review/, no logs). The message:

slice 2, package ${p.id}: ${p.title}

<three to eight lines: what the package adds for a person, the tests it adds, the tests of slice 1 it changed by design, the # tests / # pass / # todo of the run>

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0185AdPfZmfw38svKCvvqkgT

      No other name of a model or of a tool anywhere in the commit.
  11. Push: git push -u origin ${BRANCH}. On a network error try again up to four times, waiting 2, 4, 8 and 16 seconds. Push to no other branch, never force, and open no pull request.

If you stop, leave the lead's tree clean (git reset --hard to the commit you started from, and git status empty), and say exactly where you stopped and what you would need.
`

phase('Land')
const out = []
const landed = []
for (const p of args.packages) {
  const r = await agent(lander(p, landed), { ...OPTS, label: 'land ' + p.id, phase: 'Land', schema: LANDED })
  out.push({ id: p.id, ...(r || { status: 'stopped', stoppedReason: 'no answer' }) })
  if (!r || r.status !== 'landed') { log('landing stopped at ' + p.id); break }
  landed.push(p.id)
}
return out
