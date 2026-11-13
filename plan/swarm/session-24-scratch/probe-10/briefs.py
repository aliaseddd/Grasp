import os
OUT = '../wt-10/plan/swarm/briefs'

RULES = """## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
"""

COMMANDS = """Run from the root of your worktree, which the lead made for you from the commit your task starts at:

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/, the page the browser tests open from file://
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Build before every run of a browser test: the tests open `canvas/dist/index.html`, not the sources. `canvas/dist/` is yours to build and not to hand over: the lead builds it. Do not run the whole suite (`npm test`): other agents share this machine. A timed test (one that measures milliseconds in the page) is judged by the lead alone, with nothing else running: if one fails for you beside other work, send back its numbers and conclude nothing from them.
"""

def brief(task, title, goal, read, owns, tests, back, extra=''):
    text = f"# {task}: {title}\n\n"
    text += "You are one agent of a swarm that builds step 10 of slice 1 of Grasp, a SysML v2 design canvas: the Details panel of the new page. This brief is all you are given. It and the files it names are enough to do the task; where they are not, that is a reason to stop and say so.\n\n"
    text += "## The goal, and why\n\n" + goal.strip() + "\n\n"
    text += "## Where to read, in this order\n\n" + read.strip() + "\n\n"
    text += "## The files you own\n\n" + owns.strip() + "\n\n"
    text += "## The tests and the commands\n\n" + COMMANDS + "\n" + tests.strip() + "\n\n"
    if extra:
        text += extra.strip() + "\n\n"
    text += "## What to send back\n\n" + back.strip() + "\n\n"
    text += RULES
    with open(os.path.join(OUT, task + '.md'), 'w') as f:
        f.write(text)

# ---------------------------------------------------------------------------------------------------------------------
brief('10-tests-hooks', 'the Node tests of the fields',
goal="""
Write `canvas/app/test/fieldHooks.test.mjs`: the fifteen tests of the table "`canvas/app/test/fieldHooks.test.mjs`, in Node" in `plan/swarm/step-10.md`, section 4, each under the exact name the table gives.

They test `canvas/app/src/panels/fieldHooks.ts`, the part of Details that needs no browser: what the panel shows for an element, a line or a view (the form), what a change to a field writes and says, and the hooks. Today that file is a skeleton whose functions throw `"<name>: step 10 builds it"`. Another agent fills it in, without seeing your work, until your tests pass. So the tests are written first and seen to fail, each for the reason the table gives, and what the two of you must agree on is in `step-10.md`, not in each other's files.
""",
read="""
1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `plan/swarm/step-10.md`: section 1 (what the step is), section 3 ("The words the page says", "The words of each change", "The numbers"), section 4's first table, and the appendix. This is your test list.
3. `canvas/app/src/panels/fieldHooks.ts`, whole: every exported name, and the comments of `FIELD_HOOKS`, `formOf`, `viewKindFor`, `optionsOf`, `readText`, `changeField` and `endTyping`. The comments are the contract.
4. `canvas/app/test/core.mjs`, whole: `loadWith`, `lib`, `stateFiles`, `readJSON`, `plain`, `clock`, and its header on the two realms.
5. `canvas/app/test/viewStore.test.mjs`, its first 80 lines: how a Node test of the application opens a session and reads it.
6. `canvas/app/src/core/history.ts`, the interfaces `History`, `Step` and `LogEntry`; `canvas/app/src/core/session.ts`, `openSession` and `Session`.
7. `canvas/src/details/lib.js` (`detailsOf`, `firstGeneral`, `generals`) and `canvas/src/core/lib/model.js`, lines 220 to 248 (the rows of `FIELDS`, and what a row may say) and `describe`, `describeRel`, `describeView`, `typingOf`: the library your tests work the expected values out with. `canvas/test/scale-model.mjs` for test 14 (`scaleState`, `middleService`).
""",
owns="""
- `canvas/app/test/fieldHooks.test.mjs` (new).
""",
tests="""
```sh
node --test --test-timeout=120000 canvas/app/test/fieldHooks.test.mjs
```

No build is needed: the file runs in Node. Against your worktree, where `fieldHooks.ts` is the skeleton, tests 1 to 14 must fail, each with the first line its row gives under "Fails before" (`formOf: step 10 builds it`, `changeField: step 10 builds it`, `readText: step 10 builds it`, `optionsOf: step 10 builds it`), and test 15 must pass, since the tables it reads are final. A test that fails with another first line is wrong: order its steps so that the function the row names is the first one called.

What the table does not spell out is yours to settle from the contract, and to list in what you send back. Three things to keep to:

- Open a session with `app.openSession(lib, readJSON(file), { name }, { now: clock(), mistake: (error) => mistakes.push(error) })`, and end every test by asserting that `mistakes` is empty.
- What the model library makes belongs to another realm: compare it as JSON or through `plain()`, never with `deepEqual` directly.
- Work every expected value out from the library and from `step-10.md`, never from `fieldHooks.ts`'s own exports, except the constants the table names (`ORDER_LOCKED`, `FIELD_LOOKS`, `GROUP_ORDER`, `fieldKey`). Test 1 restates the layout's rules in the test.

Done is: the file exists, `node --test` runs it to the end, tests 1 to 14 fail for their listed reason and test 15 passes.
""",
back="""
- The first line of each test's failure, test by test, as the runner printed it.
- Each thing the list did not settle and you did, one line each.
- Anything in the list, in `fieldHooks.ts`'s comments or in `core.mjs` that you found wrong or could not test as written, with the file and line.
""")

# ---------------------------------------------------------------------------------------------------------------------
BROWSER_READ = """
1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `plan/swarm/step-10.md`, whole. Section 3 is the contract between your tests and the code: every selector, role, name, word and number you may read. Section 4 holds your test list. "What the browser's test files share" holds helpers that your file holds word for word.
3. `plan/swarm/shared.md`, section 6, "What the tests share": what every test keeps to.
4. `canvas/app/test/helpers.mjs`, whole. You use `openIn`, `openPage`, `openStateFile`, `stateFileAt`, `stateFileOf`, `finish`, `closePages`, `launch`, `soon`, `frame`, `showSide`, `rowIn`, `fieldIn`, `undo`, `redo`, `selectBox`, `boxOf`, `headerOf`, `nodeOf`, `planeOf`, `viewTab`, `groundPoint`, `modelOf`, `lib`, `TEN`, `EXAMPLE`, `FIXTURES`, `TESTIDS`, `byTestId`, `BROWSER_FRAMES`.
5. `canvas/app/test/move.test.mjs`: the shape of a browser test file here (`describe`, `before`, `afterEach(() => closePages(browser))`, `after`), and how a download is waited for and read after a click on Save (its test of a port's drop).
6. `canvas/app/src/panels/Details.tsx` and `canvas/app/src/panels/fieldHooks.ts`, their comments: the contract your tests are of. `canvas/app/src/core/selection.ts`, the comment of `Selection`: what a click picks.
"""

BROWSER_NOTE = """
Against your worktree Details is not built: it shows "The selection's fields come in step 10." So every test must fail today with the first line its table gives, which comes from `nothingPicked` (or, for the one test that opens no file first, from its own first assertion). That is all of a test you can see run. The rest you cannot run until Details and step 9's picking exist, so read each test once more against section 3 before you send it: every selector, role and word in it must be one the tables give. Do not guess at what the page will render beyond them; what a test needs and section 3 does not give is a reason to stop and say so.

What every test keeps to (the reasons are in `helpers.mjs` and `shared.md`): it opens the page through `openIn` or `openPage` and ends with `finish(opened)`; it finds what the application renders by the names of section 3 and never reads `window.Grasp`; a wait is `soon(page, check, missing)` with a sentence that says what the page lacks, in the page's own terms, never a fixed sleep; a failure's message says what is missing ("Details shows no Typed by field for hosts"), not what the test did.
"""

brief('10-tests-details', 'the tests that "Done when" names',
goal="""
Write `canvas/app/test/details.test.mjs`: the nine tests of the table "`canvas/app/test/details.test.mjs`, in the page" in `plan/swarm/step-10.md`, section 4, each under the exact name the table gives, the two groups as `describe` blocks named by the plan's own words.

They are what `plan/slice-1.md` asks of step 10: every field that every kind of element, line and view lists, changed through its widget in the page, is one undo step, undone and redone; a rename shows on the box, the tab and the row as it is typed; picking another definition moves the end of the usage's typing. Another agent builds the panel without seeing your work, so the tests are written first, and what the two of you must agree on is section 3 of `step-10.md`.
""",
read=BROWSER_READ + """7. `canvas/test/fields.test.mjs`, lines 31 to 103: `mergedFixtures`, which your file copies whole (reading a file under `canvas/test` is allowed; changing one is not), and lines 180 to 228, the old `changeField`, with the test `every field of every kind of element, line and view: ...` further down: the old walk, which yours repeats in the new page's terms.
""",
owns="""
- `canvas/app/test/details.test.mjs` (new).
""",
tests="""
```sh
npm run build
node --test --test-timeout=120000 canvas/app/test/details.test.mjs
```
""" + BROWSER_NOTE + """
The walk (`walk`, `changeOnce`, the save at the end) is described step by step under the table's heading; write it as one pair of functions that the five tests share. Each test of the walk must stay well under the runner's 120 s: it makes 16 to 45 changes, so avoid a hover or a fixed wait per change (`wordsOf` reads Undo's words without one).

Done is: the file exists, the nine tests run, and each fails today with the first line the table gives.
""",
back="""
- The first line of each test's failure, test by test.
- Each thing the list did not settle and you did, one line each.
- Anything in section 3 or 4 of `step-10.md`, or in `helpers.mjs`, that you found wrong, missing or impossible to test as written, with the place.
""")

brief('10-tests-fields', 'the tests of every behaviour of a field',
goal="""
Write `canvas/app/test/details-fields.test.mjs`: the twenty tests of the table "`canvas/app/test/details-fields.test.mjs`, in the page" in `plan/swarm/step-10.md`, section 4, each under the exact name the table gives.

They hold the Details panel to what a person meets beyond the plain change of a field: what it says with no file and with nothing picked; which thing it shows of several; its two tabs; when a run of typing ends; what Enter, Escape and Ctrl + Z do in a field; a text that is no number; a locked field; a field that an undo takes away. Each is a behaviour the contract states in a sentence, and a behaviour with no test is one the builder may get wrong unseen. Another agent builds the panel without seeing your work.
""",
read=BROWSER_READ,
owns="""
- `canvas/app/test/details-fields.test.mjs` (new).
""",
tests="""
```sh
npm run build
node --test --test-timeout=120000 canvas/app/test/details-fields.test.mjs
```
""" + BROWSER_NOTE + """
Three of the tests reach a state that a person's click cannot reach in this slice, a change of what is picked, or an Undo, while a text field keeps the focus. They use `scripted(locator)`, which the table defines: the element's own `click()` run in the page. Use it only where the table says so; everywhere else a click is Playwright's, as a person's.

Done is: the file exists, the twenty tests run, and each fails today with the first line the table gives.
""",
back="""
- The first line of each test's failure, test by test.
- Each thing the list did not settle and you did, one line each.
- Anything in section 3 or 4 of `step-10.md`, or in `helpers.mjs`, that you found wrong, missing or impossible to test as written, with the place.
""")

brief('10-tests-instant', 'the example\'s keystroke, timed',
goal="""
Add one test to `canvas/app/test/instant.test.mjs`: `a keystroke in a name of the example takes under 16 ms`, as the table "`canvas/app/test/instant.test.mjs`: one test more" in `plan/swarm/step-10.md`, section 4, gives it.

`plan/slice-1.md`, section 10, criterion 6, "Small models feel instant", asks that with the 13-element example a keystroke in a name take under 16 ms by the median of 9 samples, timed inside the page. The file already holds the criterion's other parts. The test is written before Details exists, and seen to fail for want of the name field.
""",
read="""
1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `plan/swarm/step-10.md`: section 3, the rows on a text field and on a box's name; section 4, the table for `instant.test.mjs`.
3. `canvas/app/test/instant.test.mjs`, whole: its limits, `verdict`, and `a drag step of the example takes under 16 ms`, which your test is shaped as.
4. `canvas/app/test/helpers.mjs`: `timing` and its comment (a keystroke is timed from the keydown reaching the window to the end of the input event, plus the frame that follows), `measure`, `selectBox`, `fieldIn`, `nodeOf`, `soon`.
5. `canvas/app/test/scale.test.mjs`, the test `a keystroke in a name takes under 50 ms at 5,000 elements`: the same measure at scale, which stands as written.
""",
owns="""
- `canvas/app/test/instant.test.mjs`. You add one test at the end of its `describe` and a constant for its limit beside the others. Nothing else in the file changes: not a name, not a limit, not another test.
""",
tests="""
```sh
npm run build
node --test --test-timeout=120000 canvas/app/test/instant.test.mjs
```

Against your worktree the file's four tests pass as before and yours fails with `Details shows no name field for Host, picked (data-testid "field-name" in "details").` It picks `Host` with `selectBox`, which works today; it never reads `window.Grasp`; it reports its median and samples through `verdict`, as the file's other tests do.

Done is: the one test is added, fails today with that line, and the four others still pass.
""",
back="""
- The first line of your test's failure, and the runner's summary for the file.
- Anything you settled where the table was silent, one line each.
""")

# ---------------------------------------------------------------------------------------------------------------------
brief('10-impl-hooks', 'the fields without React',
goal="""
Fill in `canvas/app/src/panels/fieldHooks.ts` until `canvas/app/test/fieldHooks.test.mjs` passes, 15 of 15.

The file is the part of the Details panel that needs no browser: the form of what is picked as plain data (`formOf`), the one function through which a widget changes a field (`changeField`), the list a picker opens (`optionsOf`), how a typed text is read (`readText`), when a run of typing ends (`endTyping`), and the hooks, which say what a field's row in the model library cannot. It ports the old page's panel, which stays untouched. Another agent then builds the panel's React on your functions, so their signatures, and every exported name, stay exactly as the skeleton has them.
""",
read="""
1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `canvas/app/src/panels/fieldHooks.ts`, whole. Each comment is the contract of what stands under it. What is final already: the types, the words (`UNNAMED`, `NOTHING`, `NOT_HELD`, `notHeldWhy`, `ORDER_LOCKED`), `FIELD_LOOKS`, `GROUP_NAMES`, `GROUP_ORDER`, `libOf`, `fieldKey`. What you write: the functions of `FIELD_HOOKS` (its `none` words are final), `formOf`, `viewKindFor`, `whatOf`, `optionsOf`, `readText`, `changeField`, `endTyping`, and helpers of your own in the same file.
3. `plan/swarm/step-10.md`: section 1, section 3 ("The words the page says", "The words of each change", "The numbers"), section 4's first table (the tests you must pass), and the appendix (the example's forms).
4. The old page's code that you port. It is the reference for every rule, and where the contract and it differ the contract says so:
   - `canvas/src/core/page/panel.js`, lines 127 to 268 (`fieldsOf`, `valueOf`, `viewKindShowing`, `renderFields`, `readInput`, `whatOf`, `fieldChangeText`, `changeField`, and the one pair of listeners) and 311 to 380 (the hooks of `name`, `abstract`, `conjugated`, `doc`, `type`, `typeLine`).
   - `canvas/src/details/page.js`, lines 60 to 89 (`renderDetails`: the layout of the two tabs) and 106 to 148 (the hooks of `specializes`, `subsets`, `parallel`).
   - `canvas/src/details/lib.js`, whole: `detailsOf` and what its rows are.
   - `canvas/src/core/page/state.js`, line 35 (`newId`), and `viewShowing` at line 80.
5. `canvas/app/src/core/history.ts`: `History` (`edit`, `endEdit`, `steps`), `Said`, and the header on what a change may do. `canvas/app/src/core/session.ts`: `Session`. `canvas/app/src/core/adapter.ts`, lines 65 to 86: what the core already declares of the library (`reading`, `textName`, `typingOf`, `describe`).
6. `canvas/app/test/fieldHooks.test.mjs`: the tests. They check your code; they do not define it.
""",
owns="""
- `canvas/app/src/panels/fieldHooks.ts`.
""",
tests="""
```sh
npm run check
node --test --test-timeout=120000 canvas/app/test/fieldHooks.test.mjs
```

What to hold to while you write:

- **No React, no DOM, no import but types from `'../core'`.** `canvas/app/test/core.mjs` bundles this file for Node with `loadWith('panels/fieldHooks')`; an import of a library, or a read of `window` or `document`, breaks every test.
- **Read the model inside `lib.reading(model, ...)`.** The library's helpers (`idsOf`, `describe`, `linesOfKind`, a row's `options`) search the whole model at each call outside a reading and answer from maps made once inside one. At 5,000 elements Specializes's options take 400 ms outside and 2 ms inside. `formOf` is one reading; `optionsOf` is one; `changeField` reads the change's words in one, begun after the write (the model must not change while a reading runs).
- **`formOf` asks no row for its `options`.** Test 13 counts the calls.
- **Every write is inside `history.edit()`.** A write outside it is reported as a mistake, which the tests collect and assert empty.
- **The hooks get the model's own objects** (`session.model` is the history's Proxy of itself: read it anywhere, write it only inside a change). `model.relationships.splice(...)`, `.push(...)`, `typing.to = id` and `delete typing.hidden` are the writes the hooks make.
- The times of test 14 are coarse bounds, ten times what a plain port measures (2 to 4 ms and 3 to 5 ms). If you are near them, something walks the model outside a reading.

Done is: `npm run check` passes, the test file passes 15 of 15, and no exported name or signature of the skeleton has changed.
""",
back="""
- The runner's summary for the test file, and test 14's two medians.
- Each thing the contract did not settle and you did, one line each.
- Anything in the contract, the old page's code or a test that you found wrong or in conflict, with the file and line. If a test and the contract disagree, do not bend the code: stop and say which.
""")

# ---------------------------------------------------------------------------------------------------------------------
brief('10-impl-details', 'the panel',
goal="""
Build the Details panel: fill in `canvas/app/src/panels/Details.tsx` and `canvas/app/src/panels/details.css` until the tests named below pass.

Details shows the fields of what was picked last as Material UI widgets, on a Core and an Advanced tab, and every change a widget makes goes through the history, so it is an undo step with words of its own. Your worktree already holds what the panel stands on: the selection, the Explorer and picking on a plane (step 9), and `panels/fieldHooks.ts`, built, which gives the form of what is picked as plain data (`formOf`) and makes every change (`changeField`). So this task is the React: draw the form, hold what is typed into a text field, and say when a run of typing ends. The contract is long because every behaviour of a field is in it; build what it says and nothing beside it.
""",
read="""
1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `canvas/app/src/panels/Details.tsx`, whole: the comments of `DetailsPanel`, `PickedForm` and `FormRow` are the contract. The constants are final. `DetailsPanel`'s present body is the shell's empty state, which you replace; `PickedForm` and `FormRow` throw until you write them; helpers and components of your own go in the same file.
3. `plan/swarm/step-10.md`, whole: section 1 (what is settled and why), section 3 (every selector, role, name, word and number the tests read: your DOM must give exactly these), section 4 (the tests).
4. `canvas/app/src/panels/fieldHooks.ts`: the types `Form`, `Group`, `Row`, `FieldRow`, `KnownRow`, `NotHeldRow`, `Option`, and the comments of `formOf`, `optionsOf`, `readText`, `fieldKey`, `changeField`, `endTyping`, `NOT_HELD`, `notHeldWhy`. You call these; you do not change the file.
5. `canvas/app/src/core/selection.ts` (`selectionOf`, and how React reads it), `canvas/app/src/shell/dockContext.ts` (`useDock`), `canvas/app/src/panels/SidePanel.tsx`, `canvas/app/src/panels/Explorer.tsx` as step 9 built it (a panel of the same kind), `canvas/app/src/core/history.ts` (`listen`, `mark`), `canvas/app/src/shell/theme.ts` (the theme and the CSS variables), `canvas/app/src/app.css`, the rules of `.grasp-side-*`.
6. `canvas/app/src/shell/TopBar.tsx`, the comment on the keys: Undo and Redo by key do not act when the event comes from an input, so in a text field Ctrl + Z is the browser's own.
7. `canvas/app/test/details.test.mjs`, `canvas/app/test/details-fields.test.mjs`, the last test of `canvas/app/test/instant.test.mjs`, and `a keystroke in a name takes under 50 ms at 5,000 elements` in `canvas/app/test/scale.test.mjs`. They check your code; they do not define it.
""",
owns="""
- `canvas/app/src/panels/Details.tsx`
- `canvas/app/src/panels/details.css` (it is imported by `Details.tsx` already, and holds only its header)
""",
tests="""
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
""",
back="""
- The runner's summary for each of the five test files, and the lines the two timed tests printed.
- Each thing the contract did not settle and you did, one line each.
- Each test that failed by a mistake of its own (a selector or a word that section 3 of `step-10.md` does not give, a step that cannot be done as written): which test, where, and what section 3 says. Do not change the test, and do not bend the panel to it.
- Anything in the contract, in `fieldHooks.ts` or in step 9's selection that you found wrong, with the file and line.
""")

# ---------------------------------------------------------------------------------------------------------------------
brief('10-impl-dock', 'a view\'s tab follows its name',
goal="""
Make a view's tab show its view's name at every moment: build the last item of `Dock`'s comment in `canvas/app/src/shell/Dock.tsx`, the one that begins "**Step 10**".

A view's tab is titled `viewTitle(view)`, its name and its kind, when the tab is made. With step 10 a view can be renamed, in the Details panel, and its tab must read the new name as it is typed, and the old one again after an Undo. Your worktree holds step 9's dock and step 10's Details, built.
""",
read="""
1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `canvas/app/src/shell/Dock.tsx`, whole, as step 9 left it. The contract is the comment over `Dock`; your part is its last item: when the session's history tells of a change that touched a view (`told.touched.views` is not empty, or `told.views === null`), the panel of each view that has one gets its title again (`panel.api.setTitle(viewTitle(view))`).
3. `canvas/app/src/core/history.ts`: `History.listen` and `Told`.
4. `plan/swarm/step-10.md`, section 4, test 7 of `details.test.mjs`: `a view's name, on its tab and its row`.
5. `node_modules/dockview-core/dist/dockview-core.js`, the two methods named `setTitle` (search for `setTitle(title) {`): a panel's `setTitle` does nothing when the title is the one it has, and otherwise the default tab draws the new title and the tab's element takes it as its `aria-label`.
""",
owns="""
- `canvas/app/src/shell/Dock.tsx`. You add the listening and nothing else: no other item of the dock's contract changes.
""",
tests="""
```sh
npm run build && npm run check
node --test --test-timeout=120000 canvas/app/test/details.test.mjs
node --test --test-timeout=120000 canvas/app/test/shell.test.mjs
node --test --test-timeout=120000 canvas/app/test/selection.test.mjs
```

What to hold to:

- One listener on `session.history` for each session, taken away when another file is opened or the dock goes (an effect over `api` and `session`).
- Every view of `session.model.views` that has a panel (`api.getPanel(viewPanelId(view.id))`), in the editor or floating over it, gets `setTitle`. A view with no tab gets none, and nothing is added or removed.
- It runs at every keystroke of a name in Details, so it does nothing but that loop.

Done is: `npm run check` passes; `details.test.mjs` passes 9 of 9, `a view's name, on its tab and its row` among them; `shell.test.mjs` and `selection.test.mjs` pass as they did.
""",
back="""
- The runner's summary for the three test files.
- Anything you settled where the contract was silent, and anything in it you found wrong.
""")

# ---------------------------------------------------------------------------------------------------------------------
brief('10-checks-break', 'each test seen to fail with its thing broken',
goal="""
For each test of step 10, make the breakage its row names in the built code, see the test fail, and put the code back. Send back every test that still passed.

A test that was seen to fail only before its code existed has not been seen to fail for the thing it claims: it failed then for want of the whole panel. Session 19 of `plan/notes.md` found two tests that could not fail for what they were named for. So each test is run once more against code that is wrong in exactly the way the test is there to catch.
""",
read="""
1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `plan/swarm/step-10.md`, section 4: the four tables. The last column of each row is the breakage, in words; where it says which other tests the breakage fails too, those are expected.
3. `canvas/app/src/panels/fieldHooks.ts`, `canvas/app/src/panels/Details.tsx`, `canvas/app/src/panels/details.css`, `canvas/app/src/shell/Dock.tsx`, as built: where the breakages are made.
4. `plan/notes.md`, session 20, "Step 6: the planes' and the store's tests, each seen to fail with its thing broken": what such a pass reports, and how a breakage that fails nothing is told.
""",
owns="""
Nothing. You change the built code to break it and put every change back: your worktree ends as it began (`git status` shows nothing but `canvas/dist/`, which you rebuild from the clean sources at the end).
""",
tests="""
For each row, in this order: make the one change; `npm run build` when the test is a browser test; run the row's test alone; note the first line of its failure, or that it passed; `git checkout -- canvas/app/src` to put the code back.

```sh
node --test --test-timeout=120000 --test-name-pattern="<the test's name>" canvas/app/test/<file>
```

- `fieldHooks.test.mjs`, 15 rows: no build is needed. Test 15 passes against the scaffold by design, so its breakage is the only way it is seen to fail.
- `details.test.mjs`, 9 rows, and `details-fields.test.mjs`, 20 rows: build after each change.
- The two timed rows (`instant.test.mjs`'s keystroke and `scale.test.mjs`'s) are not yours: the lead checks them alone, since a timing taken beside other work proves nothing.

Make each breakage the smallest change that does what the row's words say. Where the words can be read two ways, make the one that a careless builder would most plausibly have made, and say which. A breakage that cannot be made as worded (the code is not built that way) is reported as such, with what the code does instead.

Done is: a table of 44 rows, each with the change you made (file and line) and the first line of the failure, or "passed".
""",
back="""
- The table.
- Every test that still passed under its breakage, first, with your reading of why: the test is weak, or the breakage does not break what the test checks.
- Anything you noticed in the built code while breaking it that looks wrong. Do not fix it.
""")

# ---------------------------------------------------------------------------------------------------------------------
brief('10-review-code', 'the step\'s code, read by someone who did not design it',
goal="""
Review step 10 of slice 1 as built: read its whole diff against the plan's own text for the step, try what you doubt in the built page, and send back defects, each reproduced. You change nothing.

You are given the plan and the code, and on purpose not the step's outline (`plan/swarm/step-10.md`): a reviewer who has read the outline checks the code against it, and misses what the outline itself left out. Sessions 20 to 23 of `plan/notes.md` show what such reviews found: a click that slipped two pixels written as a move, an Undo in the middle of a gesture that did not cancel it, a key that acted behind a dialog. Each was a behaviour nobody had said. Look for those.
""",
read="""
1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief). Do not open `plan/swarm/step-10.md` or the briefs.
2. `plan/slice-1.md`: sections 2 to 4, step 10 in section 5, and section 10 (criteria 5 and 6 have a part at this step: a keystroke in a name under 50 ms at 5,000 elements and under 16 ms on the example).
3. The diff of the step: `git diff <the scaffold commit the lead names> -- canvas/app/src/panels/Details.tsx canvas/app/src/panels/details.css canvas/app/src/panels/fieldHooks.ts canvas/app/src/shell/Dock.tsx canvas/app/test/fieldHooks.test.mjs canvas/app/test/details.test.mjs canvas/app/test/details-fields.test.mjs canvas/app/test/instant.test.mjs`, and each of those files whole, comments included: a file's comment is its own contract.
4. What the code stands on: `canvas/app/src/core/history.ts` (`edit`, `endEdit`, runs and keys), `canvas/app/src/core/selection.ts`, `canvas/app/src/shell/TopBar.tsx` (the keys).
5. What it ports: `canvas/src/core/page/panel.js`, `canvas/src/details/page.js`, `canvas/src/details/lib.js`, and `canvas/src/README.md`, "The panel's fields". `canvas/test/fields.test.mjs` is the old page's test of the same.
""",
owns="""
Nothing in the repository. Your probes and screenshots go in a folder of your own outside it, beside your worktree.
""",
tests="""
Try what you doubt in the built page, opened from `file://` with Playwright as the tests open it (`canvas/app/test/helpers.mjs` shows how; a probe of yours may read `window.Grasp`, which a test may not). At the least, try: no file open; a file open and nothing picked; a box, a port, a line, a line that is not drawn, a view, and a view no plane draws, each picked; several things picked; a field typed into and then left by Tab, by a click on the plane, by a click on another tab of the panel, by a click on another view's tab, by Open; Undo and Redo by the bar and by the keys, with the focus in a text field, on a checkbox, in a picker's list and on the plane; an Undo that takes away what Details shows; each kind of widget by the keyboard alone; a name emptied; a number field given text; two things renamed to one name; the same file opened twice; the 5,000-element model of `canvas/test/scale-model.mjs`, with a box picked and a name typed.

Read the tests as code too: a test that cannot fail, a wait that hides a fault, an assertion weaker than its name.

Done is: a list of defects, or the statement that you found none, with what you tried.
""",
back="""
- Each defect: what a person does, what the page does, what the plan or the file's own comment says it should do, and how you reproduced it (the probe's steps). Serious ones first.
- What held up under your probes, in a few lines, so the lead knows what was tried.
- What you could not judge, and why.
""")

# ---------------------------------------------------------------------------------------------------------------------
brief('10-checks-close', 'closing step 10 (the lead\'s)',
goal="""
Close step 10: take the step's files into the main tree, run the checks alone, take the todo mark off the keystroke's scale test, and commit the step.

This is the lead's own task, the closing every step ends with (`plan/swarm/README.md`, "How the lead runs the swarm", 7). After it, all ten checks of `plan/status.json` read "pass" and the runner's `# todo` is 0.
""",
read="""
1. `plan/swarm/README.md` and `plan/swarm/shared.md`, section 8.
2. `plan/swarm/step-10.md`, whole, and what each of the step's tasks sent back: the test writers' first lines, the builders' decisions, `10-checks-break`'s table, `10-review-code`'s defects.
3. `plan/slice-1.md`, step 10 and section 10.
""",
owns="""
- `canvas/app/test/scale.test.mjs`: the todo mark of `a keystroke in a name takes under 50 ms at 5,000 elements` comes off, and nothing else in the file changes.
- `plan/status.json`, `plan/notes.md`, and `canvas/dist/` as built.
""",
tests="""
In this order, with no agent running once anything is timed:

1. Every owned file of the step's tasks is in the main tree, and no other file of theirs.
2. What `10-review-code` and `10-checks-break` found is settled: a defect fixed by a task sent back (at high effort) or by your own hand when the fix is smaller than its brief, each with a test seen to fail first; a weak test strengthened and seen to fail under its breakage.
3. `npm run build`, `npm run check`.
4. The two timed breakages, alone: 20 ms of busy work in the name's `onChange` must fail `instant.test.mjs`'s `a keystroke in a name of the example takes under 16 ms` and no other test of the file; `formOf` asking each picker's options outside `lib.reading` must fail `a keystroke in a name takes under 50 ms at 5,000 elements`.
5. The todo mark off that test in `scale.test.mjs`.
6. `npm test`, three runs in a row: `# fail 0`, `# todo 0`. The keystroke's medians at 5,000 elements (the one that opens a step, the ones that join it) and on the example, from each run, go into the notes with their commands. A limit that does not hold is not loosened: the test keeps its todo mark, the numbers and where the time goes come to Damon, and the steps that do not depend on it go on (`plan/slice-1.md`, section 7, item 4).
7. `plan/status.json`: `step` 10, check 9 `"pass"`.
8. `plan/notes.md`, the session's entry for the step: the times; what was built otherwise than `step-10.md` says, with the reason; what the review found and what was done; the method's log (each task's time, rework and whose fault).
9. One commit with the sources, the tests, `canvas/dist/`, `plan/status.json` and the notes, pushed. Checked out by itself it passes `npm ci && npm run check && npm test` (criterion 7).

Three things this step's scaffold left for you to decide, each said in the scaffold instance's report: whether Ctrl + Z should act while a checkbox or a radio button has the focus (`shell/TopBar.tsx` counts every `<input>` as a text field); whether the id maker of a new typing moves into the core for step 11; and whether the helpers the two browser test files share move into `helpers.mjs`.
""",
back="""
Nothing is sent back: the commit and the notes are the result.
""")
print('written', sorted(os.listdir(OUT)))
