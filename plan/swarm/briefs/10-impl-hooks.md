# 10-impl-hooks: the fields without React

You are one agent of a swarm that builds step 10 of slice 1 of Grasp, a SysML v2 design canvas: the Details panel of the new page. This brief is all you are given. It and the files it names are enough to do the task; where they are not, that is a reason to stop and say so.

## The goal, and why

Fill in `canvas/app/src/panels/fieldHooks.ts` until `canvas/app/test/fieldHooks.test.mjs` passes, 15 of 15.

The file is the part of the Details panel that needs no browser: the form of what is picked as plain data (`formOf`), the one function through which a widget changes a field (`changeField`), the list a picker opens (`optionsOf`), how a typed text is read (`readText`), when a run of typing ends (`endTyping`), and the hooks, which say what a field's row in the model library cannot. It ports the old page's panel, which stays untouched. Another agent then builds the panel's React on your functions, so their signatures, and every exported name, stay exactly as the skeleton has them.

## Where to read, in this order

1. `plan/swarm/README.md`, "The rules every brief carries" (they are repeated at the end of this brief).
2. `canvas/app/src/panels/fieldHooks.ts`, whole. Each comment is the contract of what stands under it. What is final already: the types, the words (`UNNAMED`, `NOTHING`, `NOT_HELD`, `notHeldWhy`, `ORDER_LOCKED`), `FIELD_LOOKS`, `GROUP_NAMES`, `GROUP_ORDER`, `fieldLibOf`, `fieldKey`. What you write: the functions of `FIELD_HOOKS` (its `none` words are final), `formOf`, `viewKindFor`, `whatOf`, `optionsOf`, `readText`, `changeField`, `endTyping`, and helpers of your own in the same file.
3. `plan/swarm/step-10.md`: section 1, section 3 ("The words the page says", "The words of each change", "The numbers"), section 4's first table (the tests you must pass), and the appendix (the example's forms).
4. The old page's code that you port. It is the reference for every rule, and where the contract and it differ the contract says so:
   - `canvas/src/core/page/panel.js`, lines 127 to 268 (`fieldsOf`, `valueOf`, `viewKindShowing`, `renderFields`, `readInput`, `whatOf`, `fieldChangeText`, `changeField`, and the one pair of listeners) and 311 to 380 (the hooks of `name`, `abstract`, `conjugated`, `doc`, `type`, `typeLine`).
   - `canvas/src/details/page.js`, lines 60 to 89 (`renderDetails`: the layout of the two tabs) and 106 to 148 (the hooks of `specializes`, `subsets`, `parallel`).
   - `canvas/src/details/lib.js`, whole: `detailsOf` and what its rows are.
   - `canvas/src/core/page/state.js`, line 35 (`newId`), and `viewShowing` at line 80.
5. `canvas/app/src/core/history.ts`: `History` (`edit`, `endEdit`, `steps`), `Said`, and the header on what a change may do. `canvas/app/src/core/session.ts`: `Session`. `canvas/app/src/core/adapter.ts`, lines 65 to 86: what the core already declares of the library (`reading`, `textName`, `typingOf`, `describe`).
6. `canvas/app/test/fieldHooks.test.mjs`: the tests. They check your code; they do not define it.

## The files you own

- `canvas/app/src/panels/fieldHooks.ts`.

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

## What to send back

- The runner's summary for the test file, and test 14's two medians.
- Each thing the contract did not settle and you did, one line each.
- Anything in the contract, the old page's code or a test that you found wrong or in conflict, with the file and line. If a test and the contract disagree, do not bend the code: stop and say which.

## The rules, and why

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings, which are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
