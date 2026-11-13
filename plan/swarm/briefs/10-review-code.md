# 10-review-code: the step's code, read by someone who did not design it

You are one agent of a swarm that builds step 10 of slice 1 of Grasp, a SysML v2 design canvas: the Details panel of the new page. This brief is all you are given. It and the files it names are enough to do the task; where they are not, that is a reason to stop and say so.

## The goal, and why

Review step 10 of slice 1 as built: read its whole diff against the plan's own text for the step, try what you doubt in the built page, and send back defects, each reproduced. You change nothing.

You are given the plan and the code, and on purpose not the step's outline (`plan/swarm/step-10.md`): a reviewer who has read the outline checks the code against it, and misses what the outline itself left out. Sessions 20 to 23 of `plan/notes.md` show what such reviews found: a click that slipped two pixels written as a move, an Undo in the middle of a gesture that did not cancel it, a key that acted behind a dialog. Each was a behaviour nobody had said. Look for those.

## Where to read, in this order

1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief). Do not open `plan/swarm/step-10.md` or the briefs.
2. `plan/slice-1.md`: sections 2 to 4, step 10 in section 5, and section 10 (criteria 5 and 6 have a part at this step: a keystroke in a name under 50 ms at 5,000 elements and under 16 ms on the example).
3. The diff of the step: `git diff <the scaffold commit the lead names> -- canvas/app/src/panels/Details.tsx canvas/app/src/panels/details.css canvas/app/src/panels/fieldHooks.ts canvas/app/src/shell/Dock.tsx canvas/app/test/fieldHooks.test.mjs canvas/app/test/details.test.mjs canvas/app/test/details-fields.test.mjs canvas/app/test/instant.test.mjs`, and each of those files whole, comments included: a file's comment is its own contract.
4. What the code stands on: `canvas/app/src/core/history.ts` (`edit`, `endEdit`, runs and keys), `canvas/app/src/core/selection.ts`, `canvas/app/src/shell/TopBar.tsx` (the keys).
5. What it ports: `canvas/src/core/page/panel.js`, `canvas/src/details/page.js`, `canvas/src/details/lib.js`, and `canvas/src/README.md`, "The panel's fields". `canvas/test/fields.test.mjs` is the old page's test of the same.

## The files you own

Nothing in the repository. Your probes and screenshots go in a folder of your own outside it, beside your worktree.

## The tests and the commands

Run from the root of your worktree, which the lead made for you from the commit your task starts at:

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/, the page the browser tests open from file://
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Build before every run of a browser test: the tests open `canvas/dist/index.html`, not the sources. `canvas/dist/` is yours to build and not to hand over: the lead builds it. Do not run the whole suite (`npm test`): other agents share this machine. A timed test (one that measures milliseconds in the page) is judged by the lead alone, with nothing else running: if one fails for you beside other work, send back its numbers and conclude nothing from them.

Try what you doubt in the built page, opened from `file://` with Playwright as the tests open it (`canvas/app/test/helpers.mjs` shows how; a probe of yours may read `window.Grasp`, which a test may not). At the least, try: no file open; a file open and nothing picked; a box, a port, a line, a line that is not drawn, a view, and a view no plane draws, each picked; several things picked; a field typed into and then left by Tab, by a click on the plane, by a click on another tab of the panel, by a click on another view's tab, by Open; Undo and Redo by the bar and by the keys, with the focus in a text field, on a checkbox, in a picker's list and on the plane; an Undo that takes away what Details shows; each kind of widget by the keyboard alone; a name emptied; a number field given text; two things renamed to one name; the same file opened twice; the 5,000-element model of `canvas/test/scale-model.mjs`, with a box picked and a name typed.

Read the tests as code too: a test that cannot fail, a wait that hides a fault, an assertion weaker than its name.

Done is: a list of defects, or the statement that you found none, with what you tried.

## What to send back

- Each defect: what a person does, what the page does, what the plan or the file's own comment says it should do, and how you reproduced it (the probe's steps). Serious ones first.
- What held up under your probes, in a few lines, so the lead knows what was tried.
- What you could not judge, and why.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
