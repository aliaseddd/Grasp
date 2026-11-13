# 10-impl-bar: the bar's Undo and Redo keys act from a checkbox and a radio button

## The goal, and why

Grasp is a SysML v2 design canvas whose new page is being built in steps (`plan/slice-1.md`). The bar across the top of the page (`canvas/app/src/shell/TopBar.tsx`) hears Ctrl or ⌘ + Z, Y and Shift + Z on the window and undoes or redoes, unless the key comes from a text field, where the field's own undo is meant. Its code takes every `<input>` for a text field. Until step 10 the page had no other kind of input. Step 10's Details brings checkboxes and radio buttons, and after a person ticks one the focus stays on it: Ctrl + Z then does nothing, where it should take the tick back. You make "a text field" exact.

## Read first, in this order

1. `canvas/app/src/shell/TopBar.tsx` whole. The contract is the comment over `TopBar`; the item "The keys", with its sentence "Step 10", is what you build.
2. `plan/swarm/step-10.md`, section 4, the list for `canvas/app/test/details-fields.test.mjs`, row 21: the test that holds this.
3. `canvas/app/test/keys.test.mjs`: the tests of the keys that must go on passing.

## The file you own

`canvas/app/src/shell/TopBar.tsx`.

## What to do

In the `keydown` handler, the test of the event's target becomes what the comment's "Step 10" sentence says: the keys do not act when the target is a textarea, a select, anything contenteditable, or an input whose `type` is none of checkbox, radio, button, submit, reset, range, file, color and image; from any other target they act. Nothing else in the file changes: Save's key, the modal dialog's rule and the buttons are as they are.

You are done when `npm run build` and `npm run check` pass, and after the build `node --test --test-timeout=120000 canvas/app/test/keys.test.mjs` passes as before and `node --test --test-timeout=120000 --test-name-pattern="Ctrl \+ Z takes a tick back" canvas/app/test/details-fields.test.mjs` passes.

## What to send back

1. Which tests pass.
2. Anything in the contract or the test that looks wrong, with why.

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
