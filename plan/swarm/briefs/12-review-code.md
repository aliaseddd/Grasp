# Brief: `12-review-code`

You are one agent of a swarm that builds slice 1 of Grasp, a SysML v2 design canvas, from a scaffold: the design is written already, as contract comments in skeleton files and as `plan/swarm/step-12.md`. You have this brief and the files it names, and nothing else; you can do the task from them without asking anything. You work in a git worktree that the lead made for you. Its root is the repository's root, and every path below is from there.

## The goal, and why

Review the code of step 12 of slice 1, "Validation and About", against the plan's own text, and try in the built page whatever you doubt. Step 12 is built and its tests pass. You have not seen how it was designed, and that is the point: the two serious defects of an earlier step were behaviours its design never spelled out, which the tests therefore never asked for, and which only a reader who came from the plan found. Send back defects, each reproduced. You change nothing.

## Read, in this order

1. `plan/slice-1.md`: section 2, the items "What Validation lists", "What About reports" and "Which editing is slice 1's"; section 3, the words; section 4, "The shell" (sizes, type) and "How the look is checked"; section 5, step 12; section 7, Damon's choice 1 (React Flow's mark); section 10, the criteria.
2. `plan/direction.md`: "What was checked", the paragraphs "What a page opened from disk can do" and "Damon's machine"; decision 7's last sentence, on the About panel.
3. The step's code, each file whole, with the contract comments in it: `canvas/app/src/core/checks.ts`, `canvas/app/src/core/probe.ts`, `canvas/app/src/panels/Validation.tsx`, `canvas/app/src/shell/About.tsx`, and the About button in `canvas/app/src/shell/TopBar.tsx`. What the swarm added to the skeletons: `git diff $(git log --diff-filter=A --format=%H -- canvas/app/src/core/checks.ts) -- canvas/app/src canvas/app/test` (the commit that first held `checks.ts` is the scaffold's).
4. The step's tests: `canvas/app/test/checks.test.mjs`, `probe.test.mjs`, `validation.test.mjs`, `about.test.mjs`, `canvas/app/test/shots/about.mjs`.
5. What the code builds on, as far as you need it: `canvas/app/src/core/selection.ts`, `core/history.ts`, `core/session.ts`, `shell/App.tsx`, `panels/SidePanel.tsx`, and the old page's `canvas/src/validation/page.js` and `check()` in `canvas/src/core/page/render.js`, which the Validation panel ports.

Do not read `plan/swarm/step-12.md`: it is the design, and you are to judge the code by the plan and by what a person meets.

## The files you own

None. Your probes and their screenshots go in a folder outside the repository.

## The tests and the commands

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/; a browser test opens the built page, so build before you run one
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Do not run `npm test`, the whole suite: other agents share this machine, and the lead runs it alone. A timed test is judged by the lead alone: a time taken while other agents work proves nothing. If a timed test fails beside your work, say so in what you send back and go on. `canvas/dist/` is built to run the tests and is not handed over: the lead builds it.

Build first. A probe opens `canvas/dist/index.html` from `file://` with Playwright's Chromium (`canvas/app/test/helpers.mjs` shows how: `openPage`, `openStateFile` on a page opened with `picker: false`). No request may leave the page: route `https://api.github.com/rate_limit` on the context before you open About, with a good answer, as `about.test.mjs` does.

What to try, beyond what you doubt on reading:

- The Validation panel with no file open; with the example; with a second file opened over the first; with the first file changed and not saved when the second is asked for.
- Two elements given one name, by typing into Details: what is listed, when, and what stays listed while the typing goes on; then Undo, Redo, and Undo by the keyboard while the name field has the focus.
- A click on each kind of entry: about an element, a line, a line no plane draws, a view, the package. What is picked, on the plane, in the Explorer, in Details. An entry whose element an Undo has just taken out of the model.
- The panel hidden behind the Explorer, and its side collapsed, while changes are made; then shown again. The panel in a window of 800 by 600.
- About: opened with no file and with one; opened, closed and opened again quickly; closed each way; the keys (Ctrl + Z, Ctrl + S) while it is up and a file has changes; Tab through it; the page reloaded while it is up.
- About with a picker taken away, with all three, with localStorage or IndexedDB made to throw, with `WebAssembly` deleted, with GitHub's answer held back for longer than 10 s.
- "Remember a folder…" with the picker closed without a choice, and with a folder stood in for; then a reload.
- About in a window of 800 by 600 and of 1400 by 900: is anything cut off?
- Whether anything runs, is made or is asked when the page loads, before About is first opened; and what the timing loop does to the page while it runs.

## What done is

- You have read every file of the step whole.
- Each defect you send back was reproduced in the built page, or, for the core, in a script.

## What to send back

Defects, the worst first. For each: what you did, step by step; what the page did; what it should have done, with the sentence of the plan, of a contract comment or of plain sense that says so; and how bad it is for a person using the page. Give the probe's essential lines, since your scratch folder is not kept.

Then, in a few lines, what you tried that held up, so that nobody tries it again. And anything a test claims that the code would still pass if it were broken.

Do not send back style, and do not propose a redesign: say what is wrong.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

## Two sayings

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
