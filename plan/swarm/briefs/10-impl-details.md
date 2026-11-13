# 10-impl-details: the panel

You are one agent of a swarm that builds step 10 of slice 1 of Grasp, a SysML v2 design canvas: the Details panel of the new page. This brief is all you are given. It and the files it names are enough to do the task; where they are not, that is a reason to stop and say so.

## The goal, and why

Build the Details panel: fill in `canvas/app/src/panels/Details.tsx` and `canvas/app/src/panels/details.css` until the tests named below pass.

Details shows the fields of what was picked last as Material UI widgets, on a Core and an Advanced tab, and every change a widget makes goes through the history, so it is an undo step with words of its own. Your worktree already holds what the panel stands on: the selection, the Explorer and picking on a plane (step 9), and `panels/fieldHooks.ts`, built, which gives the form of what is picked as plain data (`formOf`) and makes every change (`changeField`). So this task is the React: draw the form, hold what is typed into a text field, and say when a run of typing ends. The contract is long because every behaviour of a field is in it; build what it says and nothing beside it.

## Where to read, in this order

1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `canvas/app/src/panels/Details.tsx`, whole: the comments of `DetailsPanel`, `PickedForm` and `FormRow` are the contract. The constants are final. `DetailsPanel`'s present body is the shell's empty state, which you replace; `PickedForm` and `FormRow` throw until you write them; helpers and components of your own go in the same file.
3. `plan/swarm/step-10.md`, whole: section 1 (what is settled and why), section 3 (every selector, role, name, word and number the tests read: your DOM must give exactly these), section 4 (the tests).
4. `canvas/app/src/panels/fieldHooks.ts`: the types `Form`, `Group`, `Row`, `FieldRow`, `KnownRow`, `NotHeldRow`, `Option`, and the comments of `formOf`, `optionsOf`, `readText`, `fieldKey`, `changeField`, `endTyping`, `NOT_HELD`, `notHeldWhy`. You call these; you do not change the file.
5. `canvas/app/src/core/selection.ts` (`selectionOf`, and how React reads it), `canvas/app/src/shell/dockContext.ts` (`useDock`), `canvas/app/src/panels/SidePanel.tsx`, `canvas/app/src/panels/Explorer.tsx` as step 9 built it (a panel of the same kind), `canvas/app/src/core/history.ts` (`listen`, `mark`), `canvas/app/src/shell/theme.ts` (the theme and the CSS variables), `canvas/app/src/app.css`, the rules of `.grasp-side-*`.
6. `canvas/app/src/shell/TopBar.tsx`, the comment on the keys: Undo and Redo by key do not act when the event comes from an input, so in a text field Ctrl + Z is the browser's own.
7. `canvas/app/test/details.test.mjs`, `canvas/app/test/details-fields.test.mjs`, the last test of `canvas/app/test/instant.test.mjs`, and `a keystroke in a name takes under 50 ms at 5,000 elements` in `canvas/app/test/scale.test.mjs`. They check your code; they do not define it.

## The files you own

- `canvas/app/src/panels/Details.tsx`
- `canvas/app/src/panels/details.css` (it is imported by `Details.tsx` already, and holds only its header)

## The tests and the commands

Run from the root of your worktree, which the lead made for you from the commit your task starts at:

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/, the page the browser tests open from file://
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Build before every run of a browser test: the tests open `canvas/dist/index.html`, not the sources. `canvas/dist/` is yours to build and not to hand over: the lead builds it. Do not run the whole suite (`npm test`): other agents share this machine. A timed test (one that measures milliseconds in the page) is judged by the lead alone, with nothing else running: if one fails for you beside other work, send back its numbers and conclude nothing from them.

```sh
npm run build && npm run check
node --test --test-timeout=120000 canvas/app/test/details.test.mjs
node --test --test-timeout=120000 canvas/app/test/details-fields.test.mjs
node --test --test-timeout=120000 canvas/app/test/instant.test.mjs
node --test --test-timeout=120000 canvas/app/test/scale.test.mjs
node --test --test-timeout=120000 canvas/app/test/fieldHooks.test.mjs
```

Done is: `npm run check` passes; `details.test.mjs` passes but for one test, `a view's name, on its tab and its row`, which needs the dock's part, another task's (it must fail at the tab's title and nowhere before); `details-fields.test.mjs` passes 20 of 20; `instant.test.mjs` passes, your keystroke among them; in `scale.test.mjs` the keystroke test, which is still marked todo, passes under its mark; `fieldHooks.test.mjs` still passes; and every browser test file that passed in your worktree before you began still passes (`shell`, `selection`, `plane`, `keys`, `move`: run those you touch the ground of).

What was read in Material UI 7.3.11's sources and seen in a page built from this repository's `vendor.js`, so that you need not find it again:

- `TextField`: `slotProps.htmlInput` lands on the `<input>`, or with `multiline` on the visible `<textarea>` (the second, hidden textarea that sizes it gets none of it). An `id` on the TextField is the input's id, so `<label for>` names it. `size="small"` gives a box 40 px high: the 32 px are yours to set (`sx` on `.MuiInputBase-root`, with the input's vertical padding 0).
- `Checkbox` and `Radio`: `slotProps.input` lands on the `<input>`. A small Checkbox's label row is 38 px high as it comes.
- `RadioGroup`: its root has role `radiogroup` and takes `data-testid` and `aria-labelledby` as props; `name` goes to each radio.
- `Autocomplete`: `renderInput={(params) => <TextField {...params} slotProps={{ htmlInput: { ...params.inputProps, 'data-testid': ..., 'data-value': ... } }} />}` puts both on the input beside `role="combobox"`. `renderOption={(props, option) => { const { key, ...rest } = props; return <li key={key} {...rest} data-option={option.id}>{option.label}</li>; }}`. Give it `getOptionLabel`, `getOptionKey`, `isOptionEqualToValue` (by id) and `disableClearable`. Its `id` prop is the input's id. Its list is rendered at the end of `<body>`, with role `listbox`; a pick keeps the focus in the input; text that picks nothing is put back when the input loses the focus; Escape closes the list. 600 options open in about 50 ms.
- `Tabs` with `selectionFollowsFocus`: the arrow keys show the other tab. Its row is 48 px high as it comes.
- A React-controlled `<input>` whose `value` is always the text it already holds keeps the browser's own undo: Ctrl + Z in it sends an input event with the text before.
- Material UI's Tooltip in the bar puts its title as `aria-label` on the element around the button; you change nothing there.
- Every one of these comes from `@mui/material`, which `vendor.ts` holds whole. Nothing else is needed.

Colours: none is written in your files. In `sx` use the theme's (`'text.secondary'`, `'divider'`, `'primary.main'`); in `details.css` the variables `shell/theme.ts` sets (`var(--grasp-text-secondary)`, `var(--grasp-line)`, `var(--grasp-ink)`).

The two timed tests (the example's keystroke, 16 ms; the scale test's, 50 ms) are judged by the lead alone. What you owe them is the contract's "What a keystroke may cost": the change is made in the keystroke's own handler; one `formOf` a render; no picker's options but when it opens; rows memoized on their content.

## What to send back

- The runner's summary for each of the five test files, and the lines the two timed tests printed.
- Each thing the contract did not settle and you did, one line each.
- Each test that failed by a mistake of its own (a selector or a word that section 3 of `step-10.md` does not give, a step that cannot be done as written): which test, where, and what section 3 says. Do not change the test, and do not bend the panel to it.
- Anything in the contract, in `fieldHooks.ts` or in step 9's selection that you found wrong, with the file and line.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
