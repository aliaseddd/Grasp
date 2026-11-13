# 11-review-code: review step 11's code against the plan

## The goal, and why

Step 11 of slice 1 of Grasp is built and its tests pass. You review it as a reader who has **not** seen the outline it was built from: the plan says what the step must do, and an outline can be wrong in the same way as the code built from it. Both serious defects of step 7 were found this way (`plan/notes.md`, sessions 22 and 23). You read the step's whole diff against the plan's text, try in the built page whatever you doubt, and send back defects, each reproduced.

You change nothing.

## Where to read, in this order

1. `plan/slice-1.md`: section 5, step 11 ("What it delivers", "Done when"); section 2, "Which editing is slice 1's"; section 4, the row of `palette.png`; section 7, Damon's decision 3; section 10, the criteria.
2. `plan/direction.md`, "The slices", item 1.
3. The step's diff: `git diff <the commit the lead names>..HEAD -- canvas/app/src canvas/app/test`. The code is `core/commands.ts`, `panels/Tools.tsx`, `shell/Toasts.tsx`, `plane/Plane.tsx`, `plane/Palette.tsx` and `plane/palette.css`.
4. The old page's rules, which the commands port: `canvas/src/core/page/tools.js`, the graph renderer's `place` in `canvas/src/core/page/drawing.js`, and the ends of `canvas/src/interconnection/page.js` and `canvas/src/behavior/page.js`.

Do **not** read `plan/swarm/step-11.md` or the briefs before you have written down your findings. After that you may read it, to tell a defect of the code from a decision the outline made on purpose; a decision you think wrong is still a finding.

## The files you own

None.

## What to try

Whatever you doubt. At least these, in the built page (`npm run build`, then a script of your own with Playwright, kept outside the repository, as `canvas/app/test/helpers.mjs` opens the page): every tool of each of the four graph view kinds, from the Tools view and from the palette; each refusal, and whether its sentence is the library's; what stays in hand and what is put down after a refusal, after Escape from each place the focus can be, after an undo in the middle of a two-click line, after another file is opened, after the tab in front changes; a drag and a marquee with a tool in hand; a right-click on everything a plane holds; the palette at the window's edge; two views of one file side by side, with the first end on one and the second on the other; Undo and Redo of each thing made, and a file saved after it and checked with `canvas/check.sh`; the 5,000-element model (`scaleState(5000)` of `canvas/test/scale-model.mjs`) with a tool in hand.

## The commands

Run these from the root of your worktree, which the lead made for you from a commit that holds everything your task needs:

```sh
npm ci                # once; node_modules/ from package-lock.json
npm run build         # canvas/app/ -> canvas/dist/, which the browser tests open
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/<file>
```

Build before every run of a browser test: the test opens `canvas/dist/index.html`. Do not run `npm test`: other agents share this machine, and the whole suite is the lead's to run. No test of this step is a timed test; if one of the suite's timed tests (`scale.test.mjs`, `instant.test.mjs`) fails beside your work, say so and do not judge it: a timing is valid only when the lead takes it with nothing else running. Do not commit `canvas/dist/`; the lead builds it.

## What to send back

- Each defect: what you did, what the page did, what the plan asks, and the script or the steps that reproduce it. Mark each as serious (the page does something wrong a person would meet) or small.
- What you tried and found sound, in a list, so the lead knows what was covered.
- Each place where the code and the plan agree and you still think the plan's reader would be surprised.

"Done" is: the diff is read whole; every doubt was tried in the built page; the findings are written with their reproductions.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are rules of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
