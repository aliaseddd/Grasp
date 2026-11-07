# Notes between sessions

Each session reads this file, `plan/status.json`, and the recent git log first, and adds what it changed and what the
next session needs. Newest session last.

## Session 1, November 7, 2026: the baseline

No canvas code was changed. This session created `plan/status.json` and this file, and recorded how the canvas stands
before step 1.

### The machine

- Node 22.23.4, OpenJDK 21.0.12, Python 3.13.18, 4 CPUs.
- Playwright 1.63.0, the version the tests pin, comes pre-installed globally in this container with its Chromium, and
  `canvas/test/helpers.mjs` finds it through `require`. So the setup line
  `npm install --no-save playwright@1.63.0 && npx playwright install chromium` was not needed and was not run;
  the container's own instructions say not to install Playwright again, since another copy would not find its browser.
- `canvas/check.sh` downloads the pilot implementation's Jupyter kernel 0.63.1 on its first run into
  `~/.cache/sysml-kernel-0.63.1`. The download took a few seconds here. The cache lives in the container, so expect
  the first check of each new session to download it again.

### The test suite: 95 of 95 pass

`node --test --test-timeout=120000 canvas/test/*.test.mjs` passed twice in a row, in 29 s and 28 s, with nothing
skipped or marked todo:

| Suite (file) | Tests |
|---|---|
| the archive (`annotations-archive`) | 3 |
| code links (`annotations-code`) | 3 |
| free notes and the Note tool (`annotations-notes-free`) | 4 |
| behavior: action flow view (`behavior-actions`) | 7 |
| behavior: state transition view (`behavior-states`) | 5 |
| browser view (`browser`) | 5 |
| camera (`camera`) | 2 |
| checks while drawing (`checks`) | 1 |
| drawing (`drawing`) | 7 |
| export (`export`) | 2 |
| geometry view (`geometry`) | 6 |
| grid view (`grid`) | 7 |
| interconnection view (`interconnection`) | 5 |
| the loop from the store side (`loop`) | 3 |
| model-lib (`model-lib`) | 16 |
| sequence view (`sequence`) | 9 |
| shared mode (`shared`) | 3 |
| undo (`undo`) | 3 |
| views (`views`) | 4 |
| **19 suites** | **95** |

### The export check: valid

- `node canvas/export.mjs` exits 0 with no problems and prints 66 lines.
- `canvas/check.sh` prints `ok … (Package StrongholdProof)`: the pilot's validator accepts the saved model.
- Every fixture in `canvas/test/fixtures/` passes `canvas/check.sh <fixture>` too. Two print validator warnings, which
  are not errors: `behavior-actions.json` (2) and `behavior-states.json` (1) give "Duplicate of inherited member name
  'self' from DataValue, Item" (or "from Action, DataValue"). Both come from guard expressions that read a feature
  (`if test.passed then publish;`, `if loading.fetchEntry.done`). The warning is about how the validator's standard
  library resolves those expressions, and `check.sh` passes them.

### What every export prints now

Later steps must keep these texts the same (steps 1–4 by their nature; step 4 and step 8 say so outright). Check with
`node canvas/export.mjs [FILE] | sha256sum` and compare with this table, which is the SHA-256 of the exact bytes
printed:

| Input | Lines | SHA-256 |
|---|---|---|
| the model saved in `index.html` | 66 | `9825ca068df8c7ab9415765c7b5d932dbf091048c270bd5754bbef0df5d92868` |
| `annotations.json` | 90 | `f73e4fdc63d13332ec55502497162e4e2eefce6be627043a46b9b00dfb20b7ae` |
| `behavior-actions.json` | 87 | `193b976aadb7c50bc92e11c939d4654a73b8e7f155f1e115f241cf4bb0557967` |
| `behavior-states.json` | 63 | `005bde98287133687821410e11ddf3bf7ece4117908ce3d8d37e2b5d1ea43d01` |
| `browser.json` | 87 | `886e82cdb24e51895c249fb649287d7501354cc7d13e05423241d0a781f1969f` |
| `format1.json` | 66 | `9825ca068df8c7ab9415765c7b5d932dbf091048c270bd5754bbef0df5d92868` |
| `geometry.json` | 86 | `6d77b09804a3ef2dfb488bf23941f1ed999f691c6fc881f9eae4fe5c1c377e55` |
| `grid.json` | 94 | `fb0f9d0f31dfa5eed9d46037b3011149b2cfc58aabff8b99894c5adbe6f3fb8e` |
| `interconnection.json` | 108 | `51e6cd7fca1bf12cf6685f2804b407f9a93b86cae174f8083f7cbd8fd3200a49` |
| `sequence.json` | 49 | `7697a98e9291558ce1f6d3ef7d646ca3b6cdf1221d1257ef47a1662742f0dede` |

`format1.json` is the saved model written in format 1, and it exports byte for byte the same text.

### The plan's facts, checked against the code

- `canvas/index.html` is 6,943 lines and 415,281 bytes. Its parts, by line: the CSS 15–383; the markup from 385; the
  saved model (`<script type="application/json" id="model">`, between `<!-- model:start -->` and `<!-- model:end -->`)
  572–636; the saved notes and archive (`id="saved-notes"`, between the `notes` markers) 638–645; the model library
  (`<script id="model-lib" data-lib>`, ending in `root.SysMLModel = Object.freeze(…)`) 647–2687; the page script
  2689–6941, which starts `const M = window.SysMLModel;`.
- The library tables match the plan: `KINDS` 20, `RELATIONSHIPS` 9, `VIEW_KINDS` 8, `FIELDS` 28. Step 5's "29 existing
  kinds" is the 20 element kinds and the 9 relationship kinds together.
- The page tables: `TOOLS`, `ACTIONS` and `VIEW_PANELS` start empty (2742–2748) and are filled further down by the
  page's feature sections, which the code calls slices (see the comment at 3470); `MARKERS` (3107), `SHAPES` (3178)
  and `RENDERERS` (3331) are written out.
- The edit routine: `commit(what, key, before)` (5432) records the undo copy, `logChange` (5412) logs for Claude,
  `changed()` schedules the save, and `render()` (5308) redraws. Besides their definitions, a search finds 36 calls of
  `commit(`, 40 of `logChange(` and 46 of `changed()`. Step 2 should take its own count when it starts.
- The saved format is `stronghold-canvas/2` (`SysMLModel.FORMAT`); `format1.json` is `stronghold-canvas/1`. The saved
  model has 13 elements, 10 relationships, 1 view, and no notes.
- `SysML.ecore`, which step 5 reads, is not in this repository. `docs/sysml/pilot-implementation/README.md` confirms
  its 182 classifiers but says nothing about its license, so step 5 has to fetch the file from the pilot
  implementation's repository and read the license there.

### Next

Step 1, Split the source.

## Session 2, November 7, 2026: step 1, Split the source

Step 1 is done. The page is now built from `canvas/src/` and `canvas/state.json` by `canvas/build.mjs`, and it
behaves as before. Four commits, each with every test passing: the build and `state.json` with the scripts still
whole, then the library split, then the page's script split, then these notes.

### Where things are now

- `canvas/build.mjs` stitches `src/` into `index.html` in the fixed order of its three lists (`STYLES`, `LIBRARY`,
  `SCRIPTS`), into the four slots of the shell `src/core/page.html`, and puts `state.json` between the model and
  notes markers. `--check` fails when `index.html` isn't what the sources build; `test/build.test.mjs` runs it.
  Every file in the built page follows a line naming its source (`// ==== src/core/page/panel.js`), so a line
  of `index.html` in an error can be traced back.
- `src/README.md` has the layout and the rules. In short: every script is a plain script (an IIFE). The library's
  scripts share `SysMLModelLib` (`lib`), which `core/lib/api.js` turns into the same frozen `SysMLModel` as before
  and then removes. The page's scripts share `window.SysMLCanvas` (`C`), and the state they share is `C.state`
  (`S`): `S.model`, `S.selection`, `S.layout`, 19 fields in all. A script takes what earlier scripts registered
  with one `const { … } = C;` at its top, calls later scripts as `C.name(…)` (47 places), and registers what others
  use with `Object.assign(C, { … })`. The build checks these rules and refuses a file in `src/` that no list names.
- 45 files. The library: `core/lib/model.js` (the tables' core rows and the shared helpers), a `lib.js` per
  feature, then `core/lib/validate.js`, `core/lib/sysml.js`, `core/lib/api.js`. The page: 15 core scripts in
  `core/page/`, a `page.js` per feature, then `core/page/boot.js`, which calls `start()`. The styles: the core's,
  a `style.css` per feature, then `core/style-end.css`. The largest file is `behavior/lib.js` at 38 KB.
- The panel's markup is all still in `src/core/page.html`, feature fields included. Step 6 turns the hand-wired
  fields into field-table rows, which is the time to let a feature bring its own fields.
- `export.mjs` reads `state.json` and runs the library from `src/` (the code the build puts in the page);
  `save-state.mjs` writes `state.json` and builds the page, writing nothing if the build fails.
- `index.html` is now 7,604 lines and 437,188 bytes: the saved JSON is written by `JSON.stringify` (the same data,
  one value per line), and each file has its marker line. The notes block's `saved` is the model's revision, as
  `save-state.mjs` always wrote it; the old file had `null` there, and the page never reads it.

### How the split was checked

- Tests: 100 of 100 pass, the 95 from session 1 and 5 new build tests.
- Exports: every input in session 1's table still prints the same bytes (same SHA-256), and `canvas/check.sh`
  accepts the saved model.
- The library: `SysMLModel` has the same 61 names in the same order, and its four tables are the same, with their
  keys, lists and hook sources in the same order. The features load in the order their rows had in the tables.
- The page: the stitched script uses the same 28 globals as the old one, so no name was left unresolved; no
  function or constant is ever reassigned, so what a script takes is always the live value; no element gets
  listeners from two scripts, so loading the features after the core changes no listener order; and nothing a
  script runs while loading needs a later script (the camera is now read as `camera.js` loads).
- In Chromium, the old page and the new one draw the same SVG, palette and panel and export the same text for the
  saved model and each of the nine fixtures, imported through Import state.
- The split was made by scripts on Claude's side (acorn and eslint-scope, in the session's scratchpad, not
  committed), so the code was moved, not retyped. The only edits are the `S.`/`C.` rewrites above, the moved
  declarations, and the comments that described the one file's regions.

### For the next session

- Change the files in `src/` (or `state.json`), run `node canvas/build.mjs`, and commit `index.html` with them.
- Step 2: the edit routine's pieces are defined in `src/core/page/changes.js` (`logChange`, `changed`, `commit`;
  `snapshot` and `endEdit` too). Calls, not counting the definitions: 36 of `commit(` (panel.js 12, views.js 4,
  grid 4, annotations 4, browser 3, sequence 2, geometry 2, tools.js 2, pointing.js 2, io.js 1), 40 of
  `logChange(` and 46 of `changed()`. The one edit function belongs in `changes.js`, registered on `C`.
- `docs/REPO_MAP.md`, the map aider draws of this repository, still shows the old single file; aider wasn't
  available here to draw it again.

## Session 3, November 7, 2026: step 2, One edit function

Step 2 is done. Every change to the model goes through one function, `edit(change, key)` in
`src/core/page/changes.js`, and each change records which elements, relationships and views it touched. Four
commits, each with every test passing: `edit()` with the core's sites routed through it, then the features' sites
with the old pieces made private, then the check for changes made outside `edit()` with the new tests, then these
notes.

### Where things are now

- `edit(change, key)`: `change()` changes the model and returns what it did, in words: a string for the Undo button
  and the log alike, `{ what, log, key }` when the log needs other words or another key, or nothing when it did
  nothing (the model must then be as it was). `edit` records the undo step, logs it, calls `render()`, and schedules
  the save; the panel, the selection and the status line stay the caller's. It returns what the change touched, or
  null when nothing was done. `src/README.md` has the rule under "Changing the model".
- A `key` joins a run of changes into one undo step: a field's keystrokes (`name:<id>`, `doc:<id>`, `mult:<id>`,
  `<field>:<id>`, `code:…`, `scale:<view>`, `spacing:<view>`) and a drag's moves (`move:<id>`). A run is logged once,
  in its last words, when it ends: at `endEdit()` (the field's change event, the drag's drop), when a change with
  another key comes, or when Undo is pressed. A run that ends with the model as it was before it is taken off the
  history and logs nothing (a box dragged out and back). A change with no key is logged at once, as before.
- What a change touched is `{ elements, relationships, views }`, lists of ids, found by comparing the model's parts
  before and after the change (`capture` and `difference` in `changes.js`): each element and relationship by id,
  each view by id without its layout, each layout entry, and the order of the three lists. Added, removed and changed
  ones count; a layout entry touches its view and the element (or line) it places; a reorder touches only what moved
  (those off the longest run kept in order), not what shifted. It is kept on each undo entry as `touched` (merged
  across a run) and returned by `edit()`. Nothing else reads it yet: step 8 is meant to.
- Each change, and Undo, first compares the model with what the last change left (`checkSettled`). A difference is a
  change made outside `edit()`; it is thrown as an error of its own after the change at hand, so the page goes on and
  the console and `finish()` in the tests see it. So is a change that says it did nothing yet changed the model (it
  is recorded all the same, as "Changed the model"). The whole suite runs with this check on.
- `commit`, `snapshot` and `changed` are no longer registered on `C`, so the build refuses a script that takes them.
  `logChange` stays registered for the store's notice when it writes over a change made elsewhere, the one log entry
  that isn't a change to the model. `loadModel(raw)` replaces the model with one from storage (this browser's at
  start, the shared store's later) and clears the history; Undo and `loadModel` are the only assignments to `S.model`
  outside `edit()`, besides the first one in `state.js`.
- 39 calls of `edit()`: panel.js 12, views.js 4, pointing.js 4, tools.js 2, io.js 1, annotations 4, grid 4,
  browser 3, sequence 3, geometry 2. That is the 36 old undo sites, plus the two kinds of drag move (which changed the
  model on every move and recorded nothing until the drop) and the sequence view's sort after a message's order is
  typed (which ran after the field's undo step, outside any record). `panel.js` registers `extraFieldOf` and
  `fieldChangeText` so that sort joins the field's run in the same words.

What a user can notice, all small: a drag's moves now schedule the save as they happen, so a long drag can save
before the drop; a drag that ends where it started is no longer an undo step; Undo while a field's run is open logs the run first; typing in a view's doc redraws the drawing, as every
other field does; Import state checks that the page can still be changed once the file is read; clearing a
definition that isn't there no longer schedules a save; and when a retype replaces a usage's definition, the notes on
the old line move to the new one after it is in the model, so a save made by the note in local mode never holds a
model without the line.

### How it was checked

- Tests: 109 of 109 pass: the 100 from session 2, 8 in the new `test/edit.test.mjs` (what placing, drawing, moving,
  deleting, adding a view and showing in it touch; a reorder touches what moved; typing is one step logged when the
  field is left; a drag is one step logged at the drop, and a drag out and back is no step; both kinds of mistake are
  reported; the old pieces aren't on `C`), and 1 in `test/sequence.test.mjs` (a message's order and the reordering it
  brings undo as one step).
- The new tests fail when `edit()` is broken: kept no-op runs, the check for outside changes taken out, and reorders
  compared place by place each made the matching tests fail, and the source was then put back.
- Exports: every input in session 1's table still prints the same bytes, and `canvas/check.sh` accepts the saved
  model (the kernel downloaded again, as session 1 said it would).
- The search the step asks for: an AST pass over the page's 22 scripts (acorn, in the session's scratchpad, not
  committed) found 525 writes to object properties, 54 of them inside functions given to `edit()`. Of the 471 others,
  all are to the DOM, the page's own state (`S.selection`, `S.drag`, `S.camera` and the rest), notes, the page's tables
  as they load, local objects, or `changes.js` itself, except the renderers' `place`, `drag` and `drop`, `freshElement`,
  `blankField`, `insertEvent`, `sortMessages` and `gridShow`, whose every call is inside a function given to `edit()`
  or inside a renderer hook that only those call. The same pass over the library found it writes only to its own
  tables as it loads and to the fresh model `normalize` builds (`gridPlace` included), never to a model handed to it.
- Before any code changed, a read-only inventory by subagents listed the sites, file by file, and agreed with the
  reading here. Its later agents read files after this session had changed them, so it was stopped; the remarks from
  them that are kept are in the "Noticed" list below, as things left for later, not as checks of this work.
- Time: on a generated model of 1,200 elements in 3 general views (part defs with two parts and a port each),
  `edit()`'s own work, two captures and two comparisons, takes about 9 ms against about 188 ms for `render()`. One
  keystroke in the name field took 185 to 210 ms before and after the change, run to run, so the difference is inside
  the noise. At 30 elements it takes 4 to 5 ms either way. The capture grows with the model, not the change.

### For the next session

- Step 3: one naming owner. `M.hasName(kind)` exists already (core/lib/model.js) and is called from 12 files; the
  behavior library names `StartNode`, `DoneNode` and `InitialNode` 22 times and gives them a `noHead` head. Start by
  listing every place that decides whether an element's name is written in the text.
- For step 8: the record of what changed is `S.history[i].touched` and the return value of `edit()`. Computing it
  costs a pass over the whole model per change (two, with the check for outside changes); at 5,000 elements that alone
  would take much of step 7's 50 ms and all of its 16 ms. Keeping the last capture (`settled`) as the next change's
  "before" would halve it, at the cost of the check. Undo and saving could use the entries' `touched` directly.
- Noticed, outside this step, and left as they were: the store sets aside a model from elsewhere while `S.drag` is
  set, and a plain click on an element sets it, so a model that arrives during a click waits for the next save to
  write over it; notes deleted with an element, or moved by a retype, aren't brought back by Undo; an error thrown
  inside a change leaves what it did unrecorded until the next change reports it; the panel's typed fields ignore the
  `trim` their FIELDS rows ask for; leaving the page saves the model but doesn't end an open run, so a run open then
  isn't logged; and `S.model` is the same object as `saved.model` until the first replacement (only its revision is
  read later, so nothing breaks).
- `docs/REPO_MAP.md` still shows the old single file.
