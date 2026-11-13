# 8-checks-break: each test of step 8 seen to fail with the thing it guards broken

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is being built in steps. Step 8's tests were written before its code and seen to fail for want of it. That shows a test can fail; it does not show that it fails for the one thing it claims to guard (`plan/notes.md`, session 19: "a test seen to fail for want of the whole shell has not been seen to fail for each thing it claims"). So each test is now seen to fail with that one thing broken in the built code. You make each breakage, run the test, and put the code back. You hand over no code.

## Read first

`plan/swarm/step-8.md`, section 5: three test lists, each row with a "Breakage" column. Then the files the breakages are made in: `canvas/app/src/core/adapter.ts` (`projectStep`, `project`, `linesDrawn`), `canvas/app/src/plane/MiniMap.tsx` with `canvas/app/src/plane/minimap.css`, and for two rows `canvas/app/src/plane/viewStore.ts` (`refresh()`, `step()`, `adopt()`).

## The files you own

None. You change source files only to break them, in your own worktree, and restore each before the next (`git checkout -- <file>`). Nothing of yours is taken into the main tree.

## What to do

For each row of the three lists, in order:

1. Make the row's breakage: the smallest change to the built code that does what the row's words say.
2. For a browser test, `npm run build`. Run the row's test alone: `node --test --test-timeout=120000 --test-name-pattern="<the test's name>" canvas/app/test/<file>`.
3. Note whether it failed, and the first line of the failure.
4. Run the whole test file once with the breakage in, and note which other tests of the file failed.
5. Put the code back, and check with `git status --short` that no source file differs.

A row whose test still passes under its breakage is a finding: say what you changed, exactly, and why you think the test did not see it. Do not change the test.

The timed rows of `scale.test.mjs` (tests 1, 2, 3) are judged on times, and other agents may be running: note the figures, and say that the lead should run them again alone if a result is near the limit. The pan half of test 5 has no breakage, as the list says.

## What to send back

One line per row: the test's name; "failed, as it should" with the first line of the failure, or "still passed" with what you changed; and which other tests of the file failed under the same breakage. Then anything that looks wrong in a test or in the code, with why.

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
