# 9-review-code: the independent review of step 9

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is built in `canvas/app/`, beside an old page that must not change. Slice 1 of the rebuild is built in thirteen steps by many agents from outlines; step 9, "The shared selection and the Explorer", has just been built and its tests pass. You review it as someone who has not seen its outline: you read the plan's own text for the step and the code that was written, and you try in the built page whatever you doubt. Past reviews of this kind found what the outlines had left unsaid (a press that was not yet a drag; an undo in the middle of a gesture), which is why the review does not start from the outline: do not open `plan/swarm/step-9.md` or the briefs under `plan/swarm/briefs/`.

## Where to read, in this order

1. `plan/slice-1.md`: sections 2 to 4, step 9 in section 5, and section 10 (the success criteria; criteria 2 and 6 must go on holding).
2. `plan/direction.md`, "The slices", item 1, and "Decided for slice 1".
3. The step's diff: `git diff <the scaffold commit>..HEAD -- canvas/app/src canvas/app/test`, where the scaffold commit is the one the lead names when it hands you this brief. Read it whole, and the contract comments of the files it touches as they now stand: `canvas/app/src/core/selection.ts`, `plane/viewStore.ts`, `plane/Plane.tsx`, `panels/explorerRows.ts`, `panels/Explorer.tsx`, `shell/Dock.tsx`, `shell/dockContext.ts`.
4. `canvas/app/test/helpers.mjs`, for how a probe opens the page and finds its parts.
5. The libraries' sources under `node_modules/` wherever the code leans on what a library does (`@xyflow/react`, `@xyflow/system`, `dockview-core`, `@mui/x-tree-view`).

## The files you own

None. You change no file of the repository.

## The work, the tests and the commands

All from the root of your worktree, which the lead made for you from the commit that holds what you need:

```sh
npm ci                # node_modules/ from the lockfile, about 15 s; once
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open; again after every change to a source file
npm run check         # the built page is what the sources build, and the types hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Run single test files, never `npm test`: other agents share this machine, and the lead runs the whole suite alone. You build `canvas/dist/` to run browser tests and do not hand it over. A timed test (one that fails on a number of milliseconds) is judged by the lead alone, with nothing else running: if one fails for you beside other work, say so with its numbers and go on.

Look for defects: behaviour that the plan's text for step 9 asks and the page does not give; behaviour the code's own contract comments promise and the code does not keep; a case the comments do not cover and the code handles badly (nothing picked, several things picked, another file opened, a picked thing that leaves the model after an undo, a tab closed or floated, the editor split, the keyboard, the 5,000-element model of `canvas/test/scale-model.mjs`, `scaleState(5000)`); a test that would pass with the thing it guards broken; a slower page (the plan's limits: the 5,000-element model opens in under 5 s, a step of a drag and of a pan take under 16 ms, and step 10 will need a keystroke under 50 ms).

Try what you doubt in the built page: `npm run build`, then a script of your own with Playwright, kept outside the repository, that opens `canvas/dist/index.html` as the tests do. A probe may read `window.Grasp` (the session, the selection, the views' stores); a test may not. You change no file of the repository.

Done is: every doubt you had is either reproduced as a defect or tried and found sound.

## What to send back

- Each defect: what a person does, what the page does, what it should do and where that is asked (the plan's sentence, or the contract comment), the probe that showed it, and where in the code you think it comes from. A defect you could not reproduce is said to be unreproduced.
- What you tried and found sound, in a line each, so that it is not tried again.
- Tests that would pass with their thing broken.
- Nothing about style, naming or what you would have designed otherwise, unless it hides a defect.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings that are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
