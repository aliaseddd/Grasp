# 8-review-code: step 8's code, read by someone who has not seen its outline

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is being built in steps, each by agents that work from an outline. An outline's author reads the result with the outline in mind and misses what the outline itself left out: both serious defects of step 7 were found by a reviewer who had not seen its outline (`plan/notes.md`, session 22). You are that reviewer for step 8. You read the step's whole diff against what the plan asks of the step, try what you doubt in the built page, and send back defects, each reproduced. You change nothing.

## Read first, in this order

1. `plan/slice-1.md`: step 8 in section 5, section 4 (the look, and how it is checked), and section 10 (the success criteria; criterion 5 is this step's).
2. `plan/direction.md`, "What is not settled yet", the item "Compartment rows at Grasp's scale".
3. The diff the lead names: every change under `canvas/app/` since the scaffold commit. Read the changed files whole, not only the changed lines: `canvas/app/src/core/adapter.ts`, `canvas/app/src/plane/MiniMap.tsx`, `canvas/app/src/plane/minimap.css`, the tests `step.test.mjs`, `minimap.test.mjs`, `scale.test.mjs`, and `plane/viewStore.ts` and `plane/Plane.tsx`, which call what changed.

Do not read `plan/swarm/step-8.md` or the briefs under `plan/swarm/briefs/`: they are the outline.

## The files you own

None. Keep your probes and screenshots in a folder of your own outside the repository.

## What to do

Look for what is wrong, not for what is right. In particular:

- A step of a drag or of a resize that is drawn otherwise than the model its end writes would be drawn: nested boxes, an owner that grows or shrinks, a port that slides and changes side, a top or left resize of an owner, a box whose doc wraps anew as it is resized, a drag across 25% of zoom, an undo in the middle of a drag, a drag begun right after another change (a rename has no interface yet: use undo and redo of a drag or a resize).
- Lines at a far zoom: a large view and a small one, crossing 25% both ways, a line that was selected before the view went far, a tab hidden and shown again while far.
- The minimap: against the plane, after a pan, a zoom, a drag, a resize, an undo, a change of the window's size, a split of the editor, a floated tab, an empty view, a view of another file opened over the first.
- The 5,000-element model: opening, each tab, a drag in each of the three views (the tests time only the general view's), a pan of each, a resize of a package-sized owner.
- Whether a test could pass with the thing it names broken.
- Anything the page logs: the tests hold that it logs nothing.

Build the page (`npm run build`) and try each doubt in it, with Playwright from `file://` as the tests do (`canvas/app/test/helpers.mjs` has `openPage`, `openStateFile` and the rest). A timing you take while other agents work is a hint, not a finding: say how you took it.

## What to send back

Each defect: what you did, what the page did, what it should have done and where the plan says so, and how to see it again (a script or exact steps). Then what you tried that held up, in a few lines, so that the lead knows what was looked at. No praise and no summary of the code.

## Where you work, and the commands

You work in a git worktree the lead made for you, at a commit that holds the scaffold and the work of the tasks this one needs. Run every command from the worktree's root.

```sh
npm ci                # once: node_modules/ from package-lock.json, about 15 s
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open
npm run check         # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Build before you run a browser test: it opens `canvas/dist/index.html` from `file://`. Do not hand `canvas/dist/` over: the lead builds it. Other agents share this machine, so a timed test may fail for you while it would pass alone: say so in what you send back, and the lead judges it alone. Commit your owned files in the worktree, added by name (never `git add -A`), so the lead can read your diff.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

Two more things, of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** If you find a signature, a contract or a test wrong, stop and say what you found and why. Do not change a file you do not own, and do not bend your own work to fit.
