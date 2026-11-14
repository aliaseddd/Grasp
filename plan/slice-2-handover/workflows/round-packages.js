export const meta = {
  name: 'slice-2-packages',
  description: 'Build packages of slice 2 side by side, each in its own worktree: build, independent review, rework, screenshot review',
  phases: [
    { title: 'Build', detail: 'one builder per package, tests first, in its own worktree' },
    { title: 'Review', detail: 'a reviewer that did not write the code reads the diff and tries the page' },
    { title: 'Rework', detail: 'defects go back to a builder with the brief' },
    { title: 'Look', detail: 'a reviewer that sees only the screenshot and its list' },
  ],
}

// args: { base, baseWords, packages: [{ id, name, brief, extra, shot: { name, rated, items } | null }] }
const PK = '/tmp/claude-0/-home-user-Grasp/a16aa6a9-ce16-503b-882a-57c3a81fda9e/scratchpad/packages'
const OPTS = { model: 'opus', effort: 'high' }
const BASE = args.base

const BUILT = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['done', 'stopped'] },
    summary: { type: 'string', description: 'What was built, in at most 10 lines' },
    commits: { type: 'array', items: { type: 'string' }, description: 'The hashes of your commits in the worktree, in order' },
    filesOutsideOwned: { type: 'array', items: { type: 'string' }, description: 'Any file you changed that your brief does not list under Owns (other than the tests of slice 1 it names, and canvas/dist), with the reason. Should be empty.' },
    tests: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, name: { type: 'string' }, failedFirstWith: { type: 'string' }, passes: { type: 'boolean' } }, required: ['file', 'name', 'passes'] } },
    slice1ByDesign: { type: 'array', items: { type: 'object', properties: { test: { type: 'string' }, planSentence: { type: 'string' }, change: { type: 'string' } }, required: ['test', 'planSentence'] } },
    checkPassed: { type: 'boolean' },
    testSummary: { type: 'string', description: 'The runner summary of your last full npm test (# tests, # pass, # fail, # todo), with every failure named and explained' },
    measurements: { type: 'array', items: { type: 'string' } },
    builtOtherwise: { type: 'array', items: { type: 'string' } },
    triedAndDropped: { type: 'array', items: { type: 'string' } },
    stops: { type: 'array', items: { type: 'string' }, description: 'Each thing you stopped at: a contract, a signature or a test that looks wrong, a file you would need and do not own' },
    screenshot: { type: 'string', description: 'The path of the screenshot you took, or empty' },
  },
  required: ['status', 'summary', 'checkPassed', 'testSummary', 'tests'],
}

const REVIEWED = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['accept', 'rework'] },
    defects: { type: 'array', items: { type: 'object', properties: {
      title: { type: 'string' },
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      steps: { type: 'string', description: 'Exactly what you did, so that another can do it again' },
      expected: { type: 'string', description: 'What should happen, with the sentence of the plan or the contract that says so' },
      actual: { type: 'string' },
      where: { type: 'string', description: 'The file and the place, when you know it' },
    }, required: ['title', 'severity', 'steps', 'expected', 'actual'] } },
    tried: { type: 'array', items: { type: 'string' }, description: 'What you tried that held' },
    treeLeftAsFound: { type: 'boolean' },
  },
  required: ['verdict', 'defects', 'tried', 'treeLeftAsFound'],
}

const LOOKED = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'object', properties: { no: { type: 'number' }, present: { type: 'boolean' }, seen: { type: 'string' } }, required: ['no', 'present', 'seen'] } },
    scores: { type: 'object', properties: {
      alignmentAndSpacing: { type: 'number' }, typeAndContrast: { type: 'number' }, nothingCutOffOrOverlapping: { type: 'number' }, easyToRead: { type: 'number' },
    } },
    reasons: { type: 'array', items: { type: 'string' } },
  },
  required: ['items'],
}

const CONTAINER = `
About this container. It has 4 processors, and other agents are building other packages on it at the same time, each running a Chromium. So a test can time out, and a timed test (scale.test.mjs, instant.test.mjs) can miss its limit, for no fault of yours: run a test that timed out again before you conclude anything, and report a timed test's medians without judging them; the lead judges those with nothing else running. Never raise a time limit or loosen a test to get past this. For reference, on this container at the scaffold's commit with nothing else running, scale.test.mjs gave: a drag step 14 ms starting (limit 16), a pan step 8 to 10 ms (limit 16) and 14 to 15 ms for the 2,112-node view (limit 25), a keystroke 31 to 34 ms (limit 50).

How to run things, from your worktree: npm run build (a browser test opens the built page, so build before one); npm run check; one test file: node --test --test-timeout=600000 canvas/app/test/<file>; npm test for the whole suite, which takes six minutes alone and much longer beside the other builders (a test file has ten minutes), so run it in the background or with a ten-minute timeout, with its output sent to a file, and read the summary lines (# tests, # pass, # fail, # todo) at the end. Run the whole suite when your package is finished, not after every change; while you work, run your own files and the neighbours you may have disturbed. Playwright and its Chromium are installed for every folder; never install either.
`

const builder = (p) => `
You are the builder of package ${p.id}, "${p.name}", of slice 2 ("Editing parity") of Grasp, a SysML v2 design canvas that opens from disk in Chromium.

Where you work. /home/user/wt/${p.id}: a git worktree of the repository, detached at commit ${BASE} (${args.baseWords}), with npm ci already run. Work only inside it. /home/user/Grasp is the lead's tree: change nothing there. Other builders work in other worktrees at the same time, on other packages; no two packages own one file.

What you build from. Your brief is in plan/slice-2.md, section 8: "The rules every brief carries", then "${p.brief}". Read your brief, then the sections of the plan and the files it names under "Read first", in that order; then canvas/app/README.md and, in plan/notes.md, in the entry of session 32, the section "What the builders of rounds 1 and 2 must know that the plan does not say": its part "Every builder" and your package's part. That section is what the scaffold's builders and nineteen reviewers found that the plan does not say, with the lead's decisions where the plan is silent; where it and your brief disagree, say so in your hand-back. The skeleton of every file you fill is in the tree already, with its contract as a comment. A signature in section 4 of the plan is the contract.
${p.extra ? '\n' + p.extra + '\n' : ''}
How to work.
  1. Write your tests first, in the files and under the exact names your brief and section 7 give (a later test finds each by its name), and see each fail for the reason its line names. Keep the first line of each failure for your report.
  2. Fill the skeletons you own until your tests pass. Change only the files your brief lists under "Owns" (and files you create that it names). A change you need in any other file is a reason to stop and say which file and why: do not make it, and do not bend your work around it.
  3. Tests check the code and do not define it: the contract is the skeleton's comment and the plan. When a test and the contract disagree, the contract stands. Something that looks wrong (a signature, a contract, a test, a seam that does not give what the plan says) is a reason to stop at that point and say what you found; go on with everything that does not depend on it.
  4. If your brief names tests of slice 1 that your package makes fail by design, those tests are the lead's. Once your own work is committed, change each as little as the plan's sentence asks, in a commit of its own titled "lead: tests of slice 1 changed by design, package ${p.id}", so that the lead can take it or leave it. A test of slice 1 that fails and that your brief does not name is not yours to change: it is a defect in your work, or a reason to stop.
  5. If your brief names a screenshot: write its file under canvas/app/test/shots/, take it with npm run shots -- <name>, and look at the image yourself against its list in section 6 of the plan before you hand it over. Every item must be there to see.
  6. When your package is finished: npm run build, npm run check, npm test. Then commit in your worktree (git add -A; git commit); never push. canvas/dist/ is built so that your tests run; the lead builds its own.

What you hand back. Write ${PK}/${p.id}/report.md (make the folder): the files you changed; for each test, the first line of its failure before the code and that it passes after; each test of slice 1 you changed by design, with the plan's sentence; each measurement with its command; whatever you built otherwise than your brief says, with the reason; what you tried and dropped; where you stopped and why. Your final answer is the structured summary of that report.
${CONTAINER}`

const reviewer = (p, round) => `
You are a reviewer working for the lead of slice 2 ("Editing parity") of Grasp, a SysML v2 design canvas that opens from disk in Chromium. You did not write the code you are about to read, and your job is to find what is wrong with it before it is merged. Nobody is helped by an approval that missed something.

Package ${p.id}, "${p.name}", was built in the worktree /home/user/wt/${p.id}, on top of commit ${BASE}. ${round > 1 ? 'It has been reviewed once and reworked: the earlier defects and what was done about each are in ' + PK + '/' + p.id + '/ (review-*.json, rework-*.md). Check that each was mended, and that the mending broke nothing else; then look for what the first review missed.' : ''}

Read, in this order: plan/slice-2.md, section 8 ("The rules every brief carries" and "${p.brief}"), then the sections of the plan that brief names; then, in plan/notes.md, in the entry of session 32, the section "What the builders of rounds 1 and 2 must know that the plan does not say" ("Every builder" and this package's part: the builder was given it with the brief, and it holds the lead's decisions where the plan is silent); then the diff itself: git -C /home/user/wt/${p.id} log --oneline ${BASE}..HEAD and git -C /home/user/wt/${p.id} diff ${BASE} HEAD -- . ':!canvas/dist'. Read the diff before the builder's report, ${PK}/${p.id}/report.md.

Check, and try what you doubt in the built page: run npm run build in the worktree, and write throwaway Playwright scripts of your own under /home/user/wt/${p.id}/.review/ (open canvas/dist/index.html from file:// as canvas/app/test/helpers.mjs does), which you delete when you are done.
  1. Every sentence of the brief's "Delivers" and "Decided", and each flow of section 5 the brief names: is it built, and does the page behave so? Try the edges a builder forgets: Undo and Redo of each step; Escape in the middle; the same thing drawn in a second view; a far zoom; nothing picked; several things picked; a tool in hand; a second file opened after the first.
  2. The rules of the brief: only the files it lists under "Owns" are changed (the commit titled "lead: tests of slice 1 changed by design" apart); nothing under canvas/src, canvas/test or listed in canvas/app/test/unchanged.json; no colour outside shell/theme.ts; no import outside src/vendor.ts; which modules read a field of a model's record (rule 6 of the brief's rules); every control that asks an action is an ActionButton or an ActionItem; every refusal is a sentence, said through saysOf or carried by a greyed control; one gesture or one action is one edit(); no test reads window.Grasp.
  3. The tests: each name that the brief and section 7 give exists to the letter. Each test would fail if what it guards broke: take the three you trust least, break the code each one guards, run it, and put the code back.
  4. The seams: the package uses the scaffold's seams as section 4 says and does not reach around them.
  5. The commit "lead: tests of slice 1 changed by design", if there is one: each change is only what the plan's sentence asks, and loosens nothing else.
Leave the worktree exactly as you found it: git status and git diff must show nothing when you finish.

Send back defects, each reproduced: what you did, what should happen with the sentence of the plan that says so, and what happened. Rank each: blocker (a capability, a criterion or a rule fails), major (it works wrongly in a case a person will meet), minor. Taste is no defect, and neither is a thing the plan leaves to slice 7. If you find none after really trying, say what you tried. Verdict "rework" when there is a blocker or a major defect; "accept" otherwise, with the minor ones listed.
${CONTAINER}`

const reworker = (p, defects, what) => `
You are a builder taking package ${p.id}, "${p.name}", of slice 2 of Grasp back after ${what}. The package is in the worktree /home/user/wt/${p.id}, built on commit ${BASE}; work only there, and never push.

Read your brief first: plan/slice-2.md, section 8, "The rules every brief carries" and "${p.brief}", and the sections it names; then the first builder's report, ${PK}/${p.id}/report.md; then the diff, git diff ${BASE} HEAD -- . ':!canvas/dist'.

What came back:
${JSON.stringify(defects, null, 2)}

For each point: reproduce it first. Mend it inside the files the package owns, and where a test can hold it, write the test first and see it fail. A point you find to be wrong is answered with what you tried and what the plan says. A point that needs a file the package does not own is a stop: say which file and why, and change nothing there. Then: npm run build, npm run check, the package's tests, and the whole of npm test once; retake the screenshot if what it shows changed (npm run shots -- <name>) and look at it yourself against its list in section 6; commit in the worktree.

Write ${PK}/${p.id}/rework-${what.replace(/[^a-z0-9]+/g, '-')}.md: for each point, what you found and what you did. Your final answer is the structured summary, as a builder's.
${CONTAINER}`

const looker = (p) => `
You are looking at one screenshot of a web application, a modelling workbench. You have not seen its code and you must not look at it or at anything else in the repository: read only the image at ${'/home/user/wt/' + p.id + '/canvas/app/shots/' + p.shot.name + '.png'} (the Read tool shows an image).

For each item of the list below, say whether it is present in the image or absent, with one line of what you see. Be strict: an item is present only if all of it can be seen as it is worded. If the image cannot be read or does not exist, every item is absent.

The list for ${p.shot.name}.png:
${p.shot.items.map((t, i) => '  ' + (i + 1) + '. ' + t).join('\n')}
${p.shot.rated ? `
Then rate the image from 1 to 5 on each of four points: alignment and spacing; type and contrast; nothing cut off or overlapping; easy to read. 1 is a broken layout, 3 is a working prototype, 5 is a finished workbench of the kind of Eclipse SysON. Give one line of reason for each score, naming what you see.` : ''}`

const lookFails = (p, look) => {
  if (!look) return ['The screenshot could not be reviewed.']
  const out = look.items.filter((i) => !i.present).map((i) => 'Item ' + i.no + ' of the list of ' + p.shot.name + '.png is absent: "' + p.shot.items[i.no - 1] + '". The reviewer saw: ' + i.seen)
  if (p.shot.rated) {
    const s = look.scores || {}
    for (const k of ['alignmentAndSpacing', 'typeAndContrast', 'nothingCutOffOrOverlapping', 'easyToRead']) {
      if (!(s[k] >= 4)) out.push('The screenshot ' + p.shot.name + '.png is rated ' + s[k] + ' of 5 on "' + k + '", and every score must be 4 or more. The reviewer\'s reasons: ' + (look.reasons || []).join(' | '))
    }
  }
  return out
}

const one = async (p) => {
  const tag = p.id
  const built = await agent(builder(p), { ...OPTS, label: tag + ' build', phase: 'Build', schema: BUILT })
  if (!built) return { id: p.id, stopped: 'the builder gave no answer', built }
  const history = { id: p.id, built, reviews: [], reworks: [], looks: [] }

  // Review, and rework while there is a blocker or a major defect: at most two rounds of rework.
  for (let round = 1; round <= 3; round++) {
    const review = await agent(reviewer(p, round), { ...OPTS, label: tag + ' review ' + round, phase: 'Review', schema: REVIEWED })
    history.reviews.push(review)
    if (!review) break
    const serious = review.defects.filter((d) => d.severity !== 'minor')
    if (review.verdict === 'accept' && serious.length === 0 && review.defects.length === 0) break
    if (round === 3) { log(tag + ': defects remain after two reworks; the lead decides'); break }
    if (review.defects.length === 0) break
    const rework = await agent(reworker(p, review.defects, 'review ' + round), { ...OPTS, label: tag + ' rework ' + round, phase: 'Rework', schema: BUILT })
    history.reworks.push(rework)
    if (serious.length === 0) break   // only minor points were mended: no second review for those
  }

  // The look: a reviewer that sees only the image and its list.
  if (p.shot) {
    for (let round = 1; round <= 3; round++) {
      const look = await agent(looker(p), { ...OPTS, label: tag + ' look ' + round, phase: 'Look', schema: LOOKED })
      history.looks.push(look)
      const fails = lookFails(p, look)
      if (fails.length === 0) break
      if (round === 3) { log(tag + ': the screenshot still fails its list after two reworks; the lead decides'); break }
      const rework = await agent(reworker(p, fails, 'look ' + round), { ...OPTS, label: tag + ' rework look ' + round, phase: 'Rework', schema: BUILT })
      history.reworks.push(rework)
    }
  }
  return history
}

const results = await parallel(args.packages.map((p) => () => one(p)))
return results
