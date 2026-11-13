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

## Session 4, November 7, 2026: step 3, One naming owner

Step 3 is done. `textName(el)` in `src/core/lib/model.js` (`M.textName` on the page) is the one place that decides
whether an element has a name in the text. Two commits, each with every test passing: the naming owner with its tests
and the rule in `src/README.md`, then these notes.

### Where things are now

- `textName(el)` returns the element's name, trimmed, when its kind has a name field, or `''` while it has none; it
  returns `null` when its kind has none (StartNode, DoneNode, InitialNode), whatever the name field holds. The page
  still keeps a name in those nodes for itself (`freeName` gives start1, done1, initial1 from `BASE_NAME`; the
  fixtures keep `''`), and nothing reads it now.
- `hasName(kind)` is gone from the library and from `SysMLModel`. To ask about a kind, ask `textName({ kind })`, as
  `annotations/lib.js` does to give the code field only to kinds whose elements have a name in the text.
- A path in the text reaches an element with no name in the text by its kind's keyword (`segment` in `model.js`, used
  by `qualified` and `featurePath`), so `first start then a1;` comes from the core. The behavior library's
  `behaviorEndName` and `behaviorEndPath`, with their StartNode and DoneNode tests, are gone: successions and
  transitions call `featurePath`. The KINDS comment says what `keyword` means for such a kind.
- Every read of an element's name goes through `textName`. A syntax-tree pass over `src/` (acorn, in the session's
  scratchpad, not committed) found two other reads of an element's `name`, both of which store it rather than read it:
  `normalize` (what a file carries) and the panel's Name box (`fName.value = el.name`). Every other `.name` read is of a
  relationship (each one inside a relationship kind's label, check or writer, `describeRel`, `nameTakenBeside`, or the
  panel's relationship branch), a view, the package, a view kind's row, a File, or the browser's row parts.
- The 15 kind tests left in `behavior/lib.js` are placement and flow rules: where each node may sit
  (`checkPseudoNode`), what may lead into or out of it (`successionFirst`, `successionEnds`, `transitionFirst`,
  `transitionEnds`), and the initial node's own rules and finding it (`stateBody`, `checkState`, `checkTransition`,
  `writeTransition`). None decides a name.

What a user can notice, all small: the panel's path line for a start, done or initial node ends in start, done or
entry (it showed the kept name: `StrongholdProof::ActionDef1::start1`); a fresh name beside such a node is free even
when it is the name the node keeps (only a file written elsewhere can do that, since the page's own kept names start
with start, done or initial); the "Defined … by …" status line names an unnamed definition "(unnamed)" (it printed the
raw name); and a line in a file that the rules refuse no longer writes a kept name into the text: a connection
between a start and a done node reads `connect start to done;`, a transition into an initial node `then entry`, and a
note on a specializes line between two start nodes is about `P::A::start, P::A::start`. Those lines were problems
before and still are.

### How it was checked

- Tests: 114 of 114 pass: the 109 from session 3 and 5 in the new `test/naming.test.mjs`. They cover `textName`'s three
  answers and that `hasName` is gone; ten cases of a name beside a start, done or initial node, each equal to the name
  the node keeps (a sibling action or state, a named succession, a named transition, a definition, the package, a
  library name, an inherited feature, a view), with no problem found and the expected text; the text and the problems
  never holding a kept name, even with three refused lines and notes on them, and `qualified`, `featurePath`,
  `describe` and `labelFor` saying start, done and entry; and, on the page, the panel's path, kind line, Name box and
  Add note for the three nodes, an action named like the start node beside it, and a fresh name beside a start node
  that keeps action1.
- Before the change, 4 of the 5 new tests failed, each for a reason above (no `textName`; three kept names in the
  text; the panel's path; the fresh name came out action2). The rules test passed, as cover for the guards the old
  checks already had, now extended to done and initial nodes.
- Mutations, in a scratch copy: letting `textName` give every kind a name failed all 5 new tests and 8 older ones
  (model-lib, grid, behavior-states); dropping the keyword from paths failed 3 new tests and model-lib's start1 test.
- Exports: every input in session 1's table still prints the same bytes, and `canvas/check.sh` accepts the saved model
  (the kernel downloaded again).

### For the next session

- Step 4: version the file format. `FORMAT` is `stronghold-canvas/2` (`core/lib/model.js`); `normalize` reads format 1
  as it goes (elements that carry their own places, an old `view`), with no upgrade function yet.
  `test/fixtures/format1.json` exports the same bytes as the saved model.
- Relationship names are still read as `rel.name` in each relationship kind's own code. They have no kept-name problem,
  since `normalize` gives a relationship a name only when its kind has the field, so step 3 left them.
- `docs/REPO_MAP.md` still shows the old single file.

## Session 5, November 7, 2026: step 4, Version the file format

Step 4 is done. The library reads the version a saved model names and upgrades an older one, one version at a time,
before it reads anything else. Three commits, each with every test passing: the text every fixture exports pinned
beside it, before any code changed; then the version number and the upgrades, with their tests and the rule in
`src/README.md`; then these notes.

### Where things are now

- The version is on the model, where it always was: `format: 'stronghold-canvas/2'`. `VERSION` (2) in
  `core/lib/model.js` is the version the library reads and writes, and `FORMAT` is made from it. `versionOf(model)`
  reads the number a model's format names; a model that names none (written by hand) counts as the current version.
  `SysMLModel` has `VERSION`, `versionOf` and `upgrade`.
- `UPGRADES`, just above `normalize`, holds one function per older version. `UPGRADES[n]` takes a model saved in
  version n, as raw JSON, to version n + 1, saying the same thing, and leaves the model it was given untouched.
  `upgrade(model)` runs them in turn from the model's version; a model already in the current version, or in one newer
  than the library knows, comes back as it is. `normalize` runs `upgrade` first, so everything after it reads the
  current version only. Every way a model comes in goes through `normalize`: the model saved in the page, this
  browser's copy, the store's `model/working`, Import state, Undo, `export.mjs`, `save-state.mjs`, and `toSysML`.
- `UPGRADES[1]` is what `normalize` used to do for format 1 by itself: the one view, named by `view.name`, becomes the
  model's view, with each element's place (`x`, `y`, `w`, `h`, or `side`, `at`) in its layout, and the elements keep the
  rest. `normalize` no longer reads `view.name`. Its two conveniences for models written by hand stay, as version-2
  rules: an element carrying a place of its own is placed into the view its `view` field names, else the first; and a
  model with no views gets one general view showing every element.
- The text each fixture exports is pinned beside it, in `canvas/test/fixtures/<name>.sysml`, written by `export.mjs`
  before the code changed. The nine texts have the SHA-256 session 1 recorded (commit 3a94193's message says ten: it
  is nine, one per fixture). `format1.json` is the one fixture saved in version 1; the other eight are version 2.
- `src/README.md`, under "The saved format", says how to change the format: add 1 to `VERSION`, add the upgrade from
  the version before it, keep the old fixtures as they were saved, and add one saved in the new version with its
  export pinned. A change under which older models still read right (a new kind, a new field whose default is what
  older models meant) needs no new version.

What a user can notice: nothing, for any file the canvas wrote. Three hand-made cases read differently: an element in a
version-1 file that carried no place now goes where version 1 itself put it, at its owner's top left (or the middle of
its owner's right side, for a port), instead of into a grid, and the elements shown and the export are the same; and a
model that holds version 1's `view.name` while naming no format, or naming format 2, no longer gives its one general
view that name, so the export leaves that view out, as it leaves out any unnamed view. The version-1 page always
wrote the format and every element's place, so no file it saved is any of these.

### How it was checked

- Tests: 121 of 121 pass: the 114 from session 4 and 7 in the new `test/format.test.mjs`. They cover `versionOf` (a
  version named, the current one, a newer one, and ten values that name none); an upgrade from every older version to
  the current one, which takes even a bare model of its version and writes nothing to the model it was given (it is
  frozen, and the library runs in strict mode); a fixture saved in every version from 1 to the current one; a pinned
  export beside every fixture and a fixture behind every pinned export; every fixture, upgraded, in the current
  version, untouched, normalizing to the same model as without the explicit upgrade, and exporting its pinned text
  (the step's "done when"); version 1's upgrade piece by piece, with elements that carried no place, a size only, a
  port's side, and an id given twice; and the page opening `format1.json` through Import state: the current version, one
  view, every element drawn, and the pinned text in the export panel.
- Before the code changed, `normalize`'s output was recorded for every fixture, the saved model and 14 edge inputs
  (junk, a version-1 file without a format, without places, with an id twice, without a view, with junk elements, a
  version-2 file with carried places or no views, a version-99 file). After it, every fixture and the saved model came
  out byte for byte the same, and only the three cases above differed, as intended.
- Mutations, each applied to the source, built, tested and taken back: an upgrade that forgets to name the new
  version, keeps the places on the elements, drops the view's name, or writes to its input; `normalize` without
  `upgrade`; `versionOf` ignoring the format; no upgrade from version 1; places left out for elements that carried
  none. Each made between 1 and 7 tests fail, and the ones meant to catch it among them.
- Exports: every fixture and the saved model still print the same bytes; `export.mjs` on `format1.json` prints the
  saved model's text; `save-state.mjs` on `format1.json`, run in a scratch copy of `canvas/`, saved it in version 2
  with one view named `proofStructure` holding 13 places and nothing left on the elements. `canvas/check.sh` accepts
  the saved model and every fixture, with the same three validator warnings session 1 recorded.

### For the next session

- Step 5: generate the kind lists. First fetch `SysML.ecore` from the pilot implementation's repository and read its
  license there (session 1's note). If the generated lists rename a kind or a field that models save, that is a new
  version: `VERSION` 3 and `UPGRADES[2]`, as `src/README.md` says, with the eight version-2 fixtures kept as they are.
  If they only add, no new version is needed.
- Step 8 can upgrade stores through the same functions: the store's `model/working` holds a model that names its
  version, so an old store reads as `M.upgrade(data.model)` before it is written in the new layout. Two things to weigh
  then: a page reads a model from a newer version as well as it can and writes it back in its own version, dropping
  what it doesn't know, which matters if a tab with an older page stays open while a newer one is published; and the
  notes and the archive carry no version of their own (their readers, `tidyNote` and `tidyArchived`, take any shape).
- The format's name has Stronghold in it. If step 9 renames it, `versionOf` must still read `stronghold-canvas/1` and
  `stronghold-canvas/2`, and the format tests will say so.
- `docs/REPO_MAP.md` still shows the old single file.

## Session 6, November 7, 2026: step 5, Generate the kind lists, is blocked

Step 5 is blocked, and no code was written for it. `SysML.ecore` is under the Eclipse Public License 2.0, the license the
standing rules keep SysON's code out of the canvas for, and lists generated from it would bring that license's terms
into the published page. One commit: `plan/status.json` and these notes. The session then went on to step 6, the first
step neither done nor blocked (below).

### What was checked

In a scratch clone of the pilot implementation, in the session's scratchpad (not committed):

- The release the validator runs, kernel 0.63.1, is the tag `2026-09.1` (commit `d81b2ad`, October 28, 2026), where
  `org.omg.sysml` is version 0.63.1. Its `org.omg.sysml/model/SysML.ecore` holds the 182 classifiers (175 classes and 7
  enumerations; SHA-256 `dd3960e0…b464d6`). The file carries no copyright or license notice of its own, so the
  repository's license governs it.
- That license is `LICENSE` at the repository's root: the Eclipse Public License 2.0, with no secondary license named
  (its Exhibit A is the license's blank template). The README says "This software is licensed under the Eclipse Public
  License. See the files LICENSE and LICENSE-GPL"; `LICENSE-GPL` no longer exists. Master at `378a870`, which the maps
  in `docs/sysml/pilot-implementation` were drawn from, is the same.
- The license changed on May 11, 2026, in commit `1e4405d` ("ST6RI-922 Updated the repository README.adoc and the
  LICENSE file"), which replaced the LGPL 3.0 with the EPL 2.0 and deleted the GPL 3.0 text. An ecore from before that
  date is under the LGPL 3.0, whose terms would come into the page the same way, so an older release doesn't help.
- The OMG's release repository, `Systems-Modeling/SysML-v2-Release`, moved to the EPL 2.0 three days later (commit
  `9baca59`, May 14, 2026).
- `www.omg.org` is blocked by this environment's network policy (the proxy refuses it), so the OMG's own terms for the
  machine-readable metamodel files it publishes with the specification could not be read here.

### Why it blocks the step

This is a reading of the license's text, not legal advice.

- The EPL 2.0 lets anyone copy and change the program, on conditions. A "Modified Work" includes, in its words, "any new
  file in Source Code form that contains any contents of the Program" (section 1), and a Modified Work passed on as
  source "must be made available under this Agreement", with a copy of the license (section 3.2).
- The generated lists would be the ecore's contents: its classifiers' names, their supertypes, what each may contain,
  and their fields, copied out by a script. The build would put them into `canvas/index.html`, the one file the page is
  published as. That file would then be a Modified Work, and the page, with all of the canvas's own code in it, would
  have to be offered under the EPL 2.0.
- The license leaves out works that hold a program's declarations "solely ... in order to link to, bind by name, or
  subclass the Program". The canvas doesn't link to the pilot implementation; it would copy the declarations to build
  lists of its own, so that exception doesn't fit.
- That is the outcome the standing rules name for SysON: "copied code would bring its license terms into the canvas."

### What would unblock it

Damon's decision, one of:

1. Accept the EPL 2.0 for the generated lists and so for the published page (`index.html`) as a whole: ship the
   license's text with it, keep the notices, and keep the source available. The files in `src/` that hold none of the
   lists could stay under his own terms, since the EPL 2.0 binds file by file.
2. Ask the pilot implementation's copyright holders for permission to use the metamodel's structure under other terms.
3. Read the metamodel from a source under other terms: the OMG publishes machine-readable metamodel files with the
   specification, under its own terms, which couldn't be checked from here. If they allow it, the generator would read
   those files instead of the pilot's ecore, which changes the step as written; a session would need `www.omg.org`
   allowed in the environment's network to fetch them.
4. Keep writing kinds by hand from the specification's text, as the 29 are now, and rescope or drop step 5.

Steps 6 to 9 don't need step 5. Step 10's features need kinds that don't exist yet (SysON has many more), so the
decision matters before step 10.

### Noticed, outside this step

- `docs/sysml/pilot-implementation` and `docs/sysml/syson` hold aider's maps, which quote lines of both projects' EPL 2.0
  code, with no copy of the license beside them. They aren't in the page.

## Session 6, continued: step 6, Panels from field lists

Step 6 is done. Every field the panel shows, for an element, a line or a view, goes one way: its row in `FIELDS`, by
which the panel shows it, and the panel's one pair of listeners, which make every change through `edit()`. No field
has listeners of its own. Three commits, each with every test passing: the fields of elements and lines with the new
tests, then the view's fields, then `src/README.md`'s rule and these notes.

### Where things are now

- `FIELDS` rows have no `core` flag. The box that draws the defined-by line is a field of its own, `typeLine` (a bool,
  `stored: false`, like `type`), listed after `type` in the six kinds that have a definition: PartUsage, PortUsage,
  ItemUsage, ActionUsage, ParameterUsage, StateUsage. Its input is `#f-typeLine` (it was `#f-type-line`).
- Every view kind's row lists `fields: ['name', 'doc']`. `normalize` keeps a view's listed fields by their rows (a no-op
  for name and doc, which it sets first), and a new view gets the starting value of any listed field `views.js` doesn't
  set, as `freshElement` does for an element.
- `core/page/panel.js`: `renderFields` shows the selection's fields by their rows' types; `fieldOf` finds the field an
  event is about; `changeField` makes the change through `edit()`, with the key `<field>:<id>` for a field that takes
  typing; one pair of listeners on `#fields` and on `#view-fields`; `renderHead` writes the lines around the fields (an
  element's kind, path and views; a view's kind and what it shows).
- `FIELD_HOOKS` in `core/page/base.js` says what a row can't: `shown`, `value`, `none`, `write`, `said`, `done`, each
  given the field `x`. The core's rows are in `panel.js` (name, abstract, conjugated, doc, type, typeLine); the sequence
  view's `order` row sorts the messages inside the same change, in place of a listener of its own.
- Gone from `C`: `extraFieldOf`, `fieldChangeText`, and the refs `fAbstract`, `fType`, `fTypeLine`, `fMult`, `fConj`,
  `fDoc`, `vDoc`. `fName` and `vName` stay: `tools.js` and `views.js` focus them after placing an element or adding a view.
- `src/README.md` has the rule, under "The panel's fields": a new field is a row in `FIELDS`, an entry in its kind's
  `fields`, and a label holding an input in `core/page.html`; anything else goes in `FIELD_HOOKS`.
- Not fields, and not moved: a view kind's options (`VIEW_PANELS`: row spacing, scale and unit, grid mode and columns,
  browser roots), each with rules of its own, and the code links, a list the annotations section edits. Both keep their
  own controls, as the README says.

What a user can notice, all small:

- Picking another definition in "Defined by" moves the end of the usage's typing rather than replacing the typing with
  a new one. The line keeps its id and its place in the model's list, so the notes on it stay on it (before, they were
  moved to the new line), and their labels follow the new end. Picking a definition in the panel no longer puts down an
  armed tool or forgets the first end of a line being drawn, which the palette's code it borrowed did.
- A field whose row trims (multiplicity, payload, target, guard, trigger, effect) holds its value trimmed as it is
  typed. The multiplicity did already; the other five kept the spaces until the model was read again.
- Once a view's name is left, the notes on the view take its new name. Before, they took it at the next element's
  rename, or when the model was replaced.
- A keystroke that leaves a field's value as it was (a space at the end of a trimmed field, "1." in a number field) is
  no change at all, rather than a step that the run's end then dropped. The multiplicity's run key is
  `multiplicity:<id>` (it was `mult:<id>`), the key its log entries carry to join a run.

### How it was checked

- Tests: 127 of 127 pass: the 121 from session 5 and 6 in the new `test/fields.test.mjs`.
  - No field's input has listeners of its own, read through Chrome's DevTools protocol for every row's input in both
    panels; `#fields` and `#view-fields` each have the one pair; every row but `code` has an input.
  - Every field of every kind, 123 in all (85 of the 20 element kinds, 22 of the 9 line kinds, 16 of the 8 view
    kinds), changed through its input as a person does it (two keystrokes and Tab, a click, a pick in a select): each
    change is one undo step, logged once in that step's words, schedules the save, and the save writes it; Undo brings
    back the value, the model and what the panel shows. The model is the fixtures merged, each fixture's ids prefixed,
    with a fixture that adds no kind left out, one view of each view kind, every usage typed, and the first element of
    each kind with a view-restricted field shown in a view of that kind.
  - The definition: another definition keeps the typing's id and its note, whose label follows, and the save (the real
    one, after its pause) writes it; the box hides and draws the line; nothing undefines and the box goes; a definition
    for an undefined part is a new typing shown as text, with the status line's hint; five Undos bring it all back.
  - The core's own words, nine cases; a view's name (the eyebrow follows each keystroke, the note on the view takes the
    name once the field is left, the name's and the doc's words); and trimming as typed.
- Mutations, each built, tested and taken back: changing the field without `edit()`, a listener of its own on a field,
  no trimming, a new typing in place of moving the old one's end, the generic words for a rename, and the line box
  always shown. Each failed one to four of the new tests. The view-name test also fails on the page from the commit
  before the view's fields moved, and only at the notes' label, the one thing that changed there.
- Exports: every fixture and the saved model print the same bytes; `canvas/check.sh` accepts the saved model and every
  fixture, with the same validator warnings session 1 recorded.
- The panel, screenshotted for a part, a port, a part def, a connection and a view, is pixel for pixel what the page
  showed before this session.
- Time: the suite takes about 46 s (38 s before). The field walk is 19 s of it, since each change draws the merged model
  (130 elements, 8 views) again, which takes 30 to 50 ms here.

### For the next session

- Step 5 waits for Damon's decision on the license (above). Step 7 is next: the scale tests.
- To put a view kind's options or the code links on the field table, their rows would need a value that lives in
  `view.options` or in a list, and hooks for their rules (a range, a scale that follows the unit, a table that keeps a
  column). That would be a step of its own.
- `docs/REPO_MAP.md` still shows the old single file.

## Session 7, November 7, 2026: step 5, Generate the kind lists

Step 5 is done. Damon unblocked it at the start of the session: "For the EPL issue, just use whatever we need that's
licensed and we'll figure out licensing later." The canvas's 29 kinds now stand on kind lists generated from the pilot
implementation's `SysML.ecore`, and behave as before. Three commits, each with every test passing: the vendored ecore
with the generator and the generated lists; the kinds moved onto them, with their tests and the rules in the READMEs;
then these notes.

### The license

`SysML.ecore` is under the Eclipse Public License 2.0, as session 6 found: it carries no notice of its own, and the
pilot implementation's `LICENSE` covers it. Damon's decision is to use it now and settle the licensing later, so the
question session 6 laid out is still open, and now it is live: `src/core/lib/metamodel.js`, and the built `index.html`
that holds it, carry the ecore's contents (its classes' names, supertypes and features, without its documentation).
Until it is settled:

- `canvas/metamodel/` keeps the file as fetched, beside `LICENSE`, the EPL 2.0's text copied from the same release, which
  the license asks to go with every copy of the file; `canvas/metamodel/README.md` names the source and the license and
  points to session 6's notes for what the license asks and the ways to settle it.
- The generated file's header names its source, its version, its SHA-256 and its license.
- Nothing from SysON was used. The standing rule on SysON's code and icons is unchanged.

### Where things are now

- `canvas/metamodel/SysML.ecore`: release `2026-09.1`, commit `d81b2ad` (October 28, 2026), `org.omg.sysml` 0.63.1, the
  release whose kernel `check.sh` validates with; the metamodel names itself `https://www.omg.org/spec/SysML/20250201`.
  SHA-256 `dd3960e0…b464d6`, the file session 6 checked. 624 KB, unchanged.
- `canvas/metamodel/generate.mjs` (Node, no dependencies) checks the file's SHA-256 against its `SOURCE` and writes
  `src/core/lib/metamodel.js`; `--check` writes nothing and fails when the file isn't what the ecore generates. It reads
  the ecore with a small XML reader of its own, which refuses what it can't read. The output is 1,135 lines, 65 KB.
- `METAMODEL`, the lists: 182 classifiers by name, in the ecore's order. A class has `general` (its direct supertypes),
  `abstract` when it is, `owns` (what an element of it may contain: 130 features) and `fields` (the other 285 features
  it declares); an enumeration has `literals`. A feature has its name, its type (a classifier, or Boolean, String,
  Integer, Real), its bounds when not 0..1, its default, `derived`, and what it subsets and redefines as `Class::name`.
  What an element may contain is a containment, `Element::ownedElement` or `Namespace::ownedMember`, or whatever subsets
  or redefines one of them, directly or through others; the ecore has no subsets link from `ownedMember` up to the
  containments, so those two are named. The ecore's documentation, operations, and EMF settings are left out.
- `core/lib/metamodel.js` is the model library's first script, so it creates `SysMLModelLib`; `model.js` takes it.
  `METAMODEL` is deep-frozen, and `SysMLModel.METAMODEL` exposes it.
- In `core/lib/model.js`: `addKinds(rows)` and `addRelationships(rows)` add the rows of `KINDS` and `RELATIONSHIPS`
  (every feature's `lib.js` uses them in place of `Object.assign`). Each kind stands on a class: `metaclass`, its own
  name unless its row names another. Six do: `ParameterUsage` on `ItemUsage`; `StartNode`, `DoneNode`, `InitialNode` on
  `ActionUsage` (start and done are `action start: Action :>> startShot;` and its twin in `Actions::Action`, and an
  initial node is a state's `entry;` action, as the pilot's grammar and library at the release say);
  `FlowConnectionUsage` and `Message` on `FlowUsage` (`flow …` and `message …` both declare one in the grammar). The
  other 23 are named after their classes. A class that doesn't exist, or an abstract one, is refused as the library
  loads. `definition` and `usage` are set from the class (a `Definition`, a `Usage`), and a row that says either is
  refused; they came out exactly as the rows said by hand.
- `attributeField(attribute, row)` makes a `FIELDS` row for a field that holds an attribute: its type and an enum's values
  come from the attribute. `name` holds `declaredName`, `abstract` `isAbstract`, `direction` `direction`, `parallel`
  `isParallel`. `direction`'s values are now `['', 'in', 'inout', 'out']`, FeatureDirectionKind's order (they were
  `['', 'in', 'out', 'inout']`); only membership and the first value are ever read, and the panel's choices come from
  the markup, so nothing shows it.
- `contains`, `definedBy`, `fields` and the rest stay written by hand, as the step says. `test/metamodel.test.mjs`
  checks the rules against the lists. Each nesting goes through exactly one most specific owning feature of the
  owner's class, pinned in its table `THROUGH`: a part def nests parts through `Definition::ownedPart`, ports through
  `ownedPort`, items, parameters through `ownedItem`, actions, control nodes, start, done and the initial node through
  `ownedAction`, states through `ownedState`; a usage the same through `Usage::nested…`, and a part's events through
  `nestedOccurrence`. These are the features SysON's compartments list. Each `definedBy` conforms to the type of the
  feature the usage's class is typed by (pinned in `TYPED_BY`: `PartUsage::partDefinition : PartDefinition`,
  `ItemUsage::itemDefinition : Structure`, `ActionUsage::actionDefinition : Behavior`, and so on). Each field that holds
  an attribute is one the kind's class has, in all 34 places a kind shows one.
- `src/README.md` has the rule under "The kinds"; `canvas/README.md` lists the generator with the scripts;
  `canvas/metamodel/README.md` says what the lists hold, where the file comes from, and how to move to another release.

What a user can notice: nothing. The page is 520 KB (450 KB before), and the library takes about 4.7 ms to run as the
page loads (1.1 ms before), most of it making and freezing the lists.

### How it was checked

- Tests: 138 of 138 pass, in about 49 s: the 127 from session 6 and 11 in the new `test/metamodel.test.mjs`. The first
  five are the lists': `--check` passes and a second run in a copy writes the same bytes; an edited list fails the
  check and a changed ecore is refused with nothing written; the header names the source, version, SHA-256 and license;
  the lists hold the ecore's 182 classifiers in order, with the abstract flags, supertypes, literals and every feature's
  name and type, read a second way, with patterns rather than the generator's reader, and 415 features in all; and
  what is owned and what is a field, on 32 named features, with bounds, defaults, derivations and annotations. The other
  six are the kinds': the class each stands on; definition and usage against what the rows said by hand; the nestings
  against `THROUGH`; the definitions against `TYPED_BY`; the attribute fields; and what the library refuses (a kind on no
  class, an enumeration, an abstract class, a row that says it is a usage, a kind twice, a field on no attribute or on a
  reference, a field that says its type), with three new kinds that load (an attribute, an attribute def, a KerML class,
  which is neither a definition nor a usage).
- Mutations, each made in the source, built, tested and taken back: the owning rule without `ownedMember`, the bounds
  left out of the lists, a parameter on `PartUsage`, an item defined by an action def, `abstract` written by hand as a
  string, a part def showing `direction`, and `definition` read from `Classifier`. Each failed one to three of the new
  tests. The last one passed at first, since every definition is a classifier and no usage is; the KerML class was
  added to the tests to tell them apart.
- The tables: `KINDS`, `RELATIONSHIPS`, `VIEW_KINDS` and `FIELDS`, dumped from the page before this session and after it
  (every hook by its source, every key, every order), differ only by `metaclass` on each of the 29 rows, `attribute` on
  the four fields, and `direction`'s order. `SysMLModel` gains `METAMODEL`.
- The page: for the saved model and each of the nine fixtures, imported through Import state, the page before this
  session and after it draw the same SVG, the same palette for every view, and the same panel for every view and for the
  first element of every kind and the first line of every relationship kind, with the same problems and no page errors.
- Exports: every fixture and the saved model print the same bytes as before the session (session 1's SHA-256 and the
  pinned `.sysml` files); `canvas/check.sh` accepts the saved model and all nine fixtures, with the three validator
  warnings session 1 recorded.

### For the next session

- Step 7 is next: the scale tests.
- For step 10: a new kind is a row through `addKinds` named after its class (or with `metaclass`), with its words, its
  drawing and its rules; its nestings go in `THROUGH` and its definition in `TYPED_BY`, with the features
  `test/metamodel.test.mjs` names when they're missing. The lists' `owns` are what SysON's compartments are made of, and
  their `fields` what a details view can show for any class, an attribute's type giving its input
  (`attributeField` already maps String, Boolean, Integer, Real and enumerations).
- The view kinds don't stand on the lists yet: the step names the 29 element and relationship kinds. A view is a
  `ViewUsage` in the text (`view proofStructure : StandardViewDefinitions::GeneralView`), and its `name` field holds a
  `declaredName` too; `VIEW_KINDS` could stand on `ViewUsage` the same way.
- Moving to another release: `canvas/metamodel/README.md`. Move `check.sh`'s kernel at the same time.
- The licensing of `metamodel.js` and `index.html` is open (above).
- `docs/REPO_MAP.md` still shows the old single file.

## Session 8, November 7, 2026: step 7, Scale tests first

Step 7 is done. Four scale tests hold the canvas to the plan's limits on generated models. They are marked todo, each
runs and misses its limit for the reasons the plan measured, and the rest of the suite passes. Three commits, each with
every test passing: the fake store keeping the real store's limits, with the test that pins them; the model generator
and the four scale tests; then these notes. No canvas code changed.

### Where things are now

- `canvas/test/scale-model.mjs` generates the models. `scaleModel(count)` (and `scaleState(count)`, a state file holding
  it) has exactly `count` elements: 5 shared definitions (`Service`, `Store`, `Storage`, `Request`, `Reply`), then as
  many services as fit, 26 elements and 25 lines each, then spare part defs for the rest. A service has its part def,
  its store's and its API's in a general view (`definitions`), the site it runs on in an interconnection view
  (`deployment`: a part def holding the service and its store as typed parts, their ports redefined, a connection and a
  binding), and how it answers a request in an action flow view (`workflows`: an action def with parameters, a start, a
  fork, two actions, a join, an answer, done, and eight successions). Every usage is typed. The same count always gives
  the same model. The models have no problems from 31 to 10,000 elements, and `canvas/check.sh` accepts the export at 57
  and 300 elements with no warnings. `middleService(count)` names the part def the typing and drag tests work on, and
  `VIEWS` the three views' ids.
- Four test files, one limit each, so each stays far under the documented command's 120 s per file:
  - `scale-typing.test.mjs`: at 5,000 elements, the middle service's part def is put in the middle of the window at 100%
    (`lookAt`), clicked, and three names of three letters each are typed into its name field, with Tab between. The
    median of the keystrokes that open a name's undo step, and of those that join it, must each be under 50 ms. The name
    must end up as typed.
  - `scale-drag.test.mjs`: at 5,000 elements, the same box is dragged three times, four moves of 12 by 6 px each, there
    and back. The medians of the moves that open a drag's undo step and of those that join one must each be under 16 ms.
    The box must end where the moves put it.
  - `scale-checks.test.mjs`: `SysMLModel.validate` in the page on a 10,000-element model, which must find no problems;
    then the median of up to five more runs must be under 100 ms.
  - `scale-save.test.mjs`: in shared mode, an empty store, 10,000 elements imported through Import state. Once the page
    has written to the store and the store has been quiet for 2 s, the page must still be editable, and a second page
    opened on the store's documents must show the same model (the SHA-256 of the model's JSON).
- How a time is taken (`timing` in `helpers.mjs`): the input is real, sent by Playwright. The script's time runs from
  when the event reaches the window, before the page's listeners, to when it has been through them: for a keystroke from
  keydown to the end of the input event, for a drag move the one pointermove. The frame's time is the main thread's work
  for the frame that follows, from its animation callbacks until after it is painted. The total is the two; the wait for
  the frame to begin isn't counted. `measure(planned, limit)` keeps the samples and their median, and says the measure
  is settled once more than half of the planned samples are on one side of the limit, since the median is then on that
  side whatever the rest would be. So a todo run stops early: each scale file takes 12 to 25 s now.
- The fake store (`fake-claude.mjs`) keeps every limit `db.d.ts` gives a number for, as the real store does: a body of
  at most 256 KiB serialized and 32 levels deep (else `invalid_argument`, for an update's or an acquire's merged body
  too), at most 25,000 documents (creating one more is `quota_exceeded`; the documents held can still be written), path
  segments of at most 200 bytes and paths of at most 1000 bytes and 16 segments (a `TypeError`, as the real builders
  throw), queries of at most 10 filters, `in` arrays of at most 30, one orderBy and a limit from 1 to 1000
  (`invalid_argument`), and 64 active subscriptions (the 65th gets `resource_exhausted` on its error callback). A seed
  past a limit throws. `__store.idle()` says how long the store has had nothing to do. `fake-store.test.mjs` pins all of
  it; the 138 earlier tests pass unchanged with it.
- `until()` in `helpers.mjs` takes a wait longer than its 5 s when asked; the scale tests wait up to `SCALE_WAIT`, 60 s.
  Its failure message cuts a store dump over 20,000 characters.
- A test marked `{ todo: '…' }` runs, and node's test runner reports its failure as todo, not as a failure: the
  documented command exits 0. `canvas/README.md` says so under the tests, and `test/index.js` says the one-process run
  now takes about three minutes (give it no timeout, or 360000 or more).

### The measured times

Taken one size at a time in this container (4 CPUs, Node 22.23.4, Playwright 1.63.0's Chromium), on the generated
models, the way the tests take them. The keystroke and the drag move are medians of three that open an undo step and six
or nine that join one; the checks are medians of five after a first run.

| Elements | Drawn SVG nodes | Keystroke, opening / joining | Drag move, opening / joining | The frame's part of a drag move |
|---|---|---|---|---|
| 31 | 240 | 10 / 9 ms | 9.5 / 8.5 ms | 2–3 ms |
| 1,200 | 6,940 | 249 / 189 ms | 176 / 192 ms | 29–31 ms |
| 2,500 | 14,440 | 527 / 447 ms | 582 / 625 ms | 67–70 ms |
| 5,000 | 28,902 | 1,691 / 1,692 ms | 1,759 / 1,725 ms | 111–118 ms |
| 10,000 | 57,734 | 5,196 / 4,865 ms | 5,271 / 5,048 ms | 226–234 ms |

A keystroke's frame is small (7 to 22 ms at 5,000 and 10,000): its script already makes the browser lay the new drawing
out (below). Importing takes 4.3 s at 5,000 elements and 13 s at 10,000.

| Elements | Checks in the page | Checks in Node | Export in Node | The one-document save |
|---|---|---|---|---|
| 1,250 | 40 ms | 57 ms | 0.9 s | 362 KiB |
| 2,500 | 183 ms | 115 ms | 3.7 s | 728 KiB |
| 5,000 | 594 ms | 424 ms | 13.8 s | 1,479 KiB |
| 10,000 | 1,835 ms | 1,910 ms | 57 s | 2,974 KiB |

Against the limits: a keystroke at 5,000 elements takes 1.7 s against 50 ms, a drag move 1.7 s against 16 ms, the checks
at 10,000 elements 1.8 s against 100 ms, and the save at 10,000 elements sends one document of 2,974 KiB to a store that
takes 256 KiB. The one-document save passes 256 KiB at 889 elements of these models. In the full suite, run several
files at a time, the scale tests reported the same times within about 15%.

### Why they miss

From Chrome's CPU profiles at 5,000 elements (the time in a function and what it calls):

- One keystroke, 1.94 s of work: `render()` takes 1.90 s of it. Drawing every view again takes 0.91 s, 0.62 s of that in
  the port glyphs, which ask which way each port's items go by looking through the model (`portWay`, `portItems`,
  `typingOf`, `definitionOf`). Checking the whole model takes 0.76 s (`inheritedFeatures` 0.48 s, `typingOf` 0.18 s,
  `childrenOf` 0.11 s). The browser lays out the new drawing when the camera reads the stage's size, 0.19 s
  (`applyCamera`, `stageSize`, `getBoundingClientRect`). `edit()`'s own capture and comparison take 12 to 13 ms. Opening
  an undo step also copies the whole model (8 ms at 5,000 elements, 16 ms at 10,000), and the history keeps up to 100
  such copies: about 145 MB at 5,000 elements and 290 MB at 10,000.
- One drag move, 1.83 s of work: the same `render()`, 1.76 s (drawing 0.87 s, port glyphs 0.63 s, checks 0.62 s, layout
  0.23 s). Then the frame, 110 to 120 ms, which grows with the drawing.
- The checks at 10,000 elements, 1.91 s: `inheritedFeatures` 1.15 s, `typingOf` 0.43 s, `nameTakenBeside` 0.22 s,
  `childrenOf` 0.15 s, and the behavior checks' `checkControlNode`, `ends` and `checkPseudoNode`. Each looks through all
  the model's elements or lines for each element, so the checks grow three to four times for each doubling of the model.
- The save: `persist()` writes the model as one document, `model/working`. The store refuses it with `invalid_argument`,
  which `refused()` takes to mean the viewer may not write, so the page turns read-only and says "You can look at this
  model here but not change it." Its status line still says the import worked.

Those are the plan's reasons: every change lays out, draws and checks the whole model again; undo keeps full copies; the
checks look through the model instead of looking things up; the whole model saves as one document. Two more show up: the
drawing looks through the model too (the port glyphs), and the browser's own frame grows with what is drawn, so drawing
only what's on screen counts twice for the drag move.

Against the plan's measurements: a keystroke took 4 ms at 30 elements and 382 ms at 1,200 there, and 10 ms at 31 and 190
to 250 ms at 1,200 here. The checks took 353 ms at 9,000 elements there and 1.8 s at 10,000 here, and the export 1.9 s
at 9,000 there and 57 s at 10,000 here. The plan doesn't record its model; these have a line for nearly every element
(9,600 at 10,000), most of them typings. The export's time is in `declaredIn`, which looks through every line for each
element to find the lines declared in it (2.85 s of 3.3 s at 2,500 elements).

### How it was checked

- Tests: 143, of which 139 pass and the 4 scale tests are todo, with no failures. The documented command exits 0 in 73
  to 76 s (46 to 48 s before). The fake store's test takes 1.3 s.
- Each scale test, run on a small model in a scratch copy (57 elements for typing and dragging, 300 for the checks and
  the save), passes: the measures can come in under the limits, and the save test's second page shows the same model
  when the store took it.
- No canvas code changed: `node canvas/build.mjs --check` passes, the saved model exports the bytes session 1 recorded
  (SHA-256 `9825ca06…`), `canvas/check.sh` accepts it, and `test/format.test.mjs` checks the fixtures' pinned texts.

### For the next session

- Step 8: make the scale tests pass, then take their `{ todo: … }` marks off, and the README's sentence about todo with
  them. Each failure message says where the time went: script and frame per sample.
- The timing tests run alongside other test files under the documented command, three at a time here, so leave room
  under the limits. The keystroke and the drag are timed with the camera at 100% on the element, which drawing only
  what's on screen counts on.
- The save test waits until the page has written to the store and the store has been quiet for 2 s, past the page's
  0.8 s pause. A save that spaces its writes further apart than that needs a better signal. The second page is opened
  with `openCanvas(…, { shared: true, seed })`, which waits for a read of `model/working` or `model`: a new store layout
  must change that helper, which the other shared-mode tests use too.
- The fake store can't keep the budgets `db.d.ts` names without numbers: the per-viewer call rate, too many concurrent
  writes, a query that scans too many documents ("keep queried collections modest — hundreds to low thousands of
  documents"; a collection too large to read whole comes as `fromCache: true`), and the database's total size. A store
  layout of thousands of small documents should keep collections modest and writes paced, and needs trying against the
  real store on the published page before it is relied on.
- The record of what each change touched is `S.history[i].touched` and the return value of `edit()` (session 3).
- The export takes 57 s at 10,000 elements. Step 8 doesn't name it, but the lookups that would make the checks fast
  (owner to children, element to typing, owner to declared lines) would make `declaredIn` fast too.
- `docs/REPO_MAP.md` still shows the old single file.

## Session 9, November 7, 2026: step 8, Scale work

Step 8 is done. The four scale tests pass and their todo marks are gone: at 5,000 elements in 3 views a keystroke in the
name field takes about 5.5 ms and a drag move about 6 ms; at 10,000 elements the checks take about 25 ms and the model
saves to the store as 49 parts within its limits, which a second page reads back as the same model. Every fixture still
exports its pinned text. Two large tracks that touch no page code were each done by an agent in its own git worktree, as
the plan allows (the library's lookups; the store's layout), and merged here after the page's own work; their reports
and their scratch tools are in the session's scratchpad. 20 commits and 2 merges, each with every test passing; the
last takes the todo marks off and adds these notes.

### Where things are now

The model records its own changes (`core/page/changes.js`):

- Every object and array in the model is a `Proxy` of itself, whose target is the plain object, holding the same Proxies
  as its children. Reads go straight to the target (no get trap); the set, deleteProperty and defineProperty traps note
  each write before making it: for an object, each key and what it held first (`{ had, old }`); for an array, a copy of
  its items. `track(value, home)` makes a value part of the model, and `homes` says where each object sits (the model,
  a list, an item of a list, inside an item, a view's layout, a place in it), which is how the notes name what a
  change touched.
- `edit()` keeps one change's notes, `touchedBy(notes)` gives `{ elements, relationships, views }` in model order (null
  when every key holds what it held), and an undo step keeps its notes, merged across a run (`absorb`), not a copy of
  the model. `restore(notes)` is Undo. A run back where it started is no step, as before. A change that puts a whole
  model in place of the old one (Import state) keeps the old one as `notes.replaced`, and its touched still comes from
  comparing the two (`capture`, `difference`, kept for this).
- A write made while no change is open goes into `stray`, reported at the next change or Undo with the same words as
  before ("The model was changed outside edit(): …").
- `howToDraw(notes)` tells `render` what the change needs: `{ views, patch, structure, shown }`: a change that only
  wrote places and views' x and y (patch), one that also put places in layouts or took them out (shown), or any other
  (views null); structure says it changed which elements, lines and views there are, their order, ids, kinds, owners or
  ends.
- An object a change makes and puts into the model becomes its Proxy there, while the change's own variable stays the
  plain object: code that looks for it again by identity reads it back from the model. The graph renderer's `place`
  returns `S.model.elements[last]`, and the behavior view's refusal finds the node it took back by id (it used
  `indexOf`, which worked by luck).
- Reads through the Proxies cost about 2.5 times a plain object's in V8, and `JSON.stringify` about 3 times
  (measured in Node on the 5,000-element model: a full scan 2.4 ms against 0.8 ms).

What is drawn (`render.js`, `layout.js`, `drawing.js`, `camera.js`; `src/README.md`, "Drawing"):

- Each view draws only what the window shows, with a margin of half the window on each side, at least 240 units
  (`S.region`); `applyCamera` draws again once the window leaves it, or the zoom crosses 25% (`covered`). Below 25% a
  graph view draws boxes as outlines (a shape's `radius`, a number or a function of the element), border items as
  squares, and lines without labels. The frames' own pieces are always drawn (`data-chrome`).
- `computeLayout(previous, plan)` lays out again only the views a change can have altered: for a move, the views it
  touched, keeping their lines (`L.rels`, `L.drawn`, `L.byEnd`) and every box's compartments; for showing or hiding,
  the views it touched; for anything else every view, unless its renderer's `keeps(view, L, plan, ids)` says the layout
  still holds (the graph's: no box the change touched has other compartments now, and none shows a compartment that
  reads beyond its element, `own: false`). A change that left the structure as it was keeps the element index, which
  is the lookups' own (`idsOf`). `where.get(id)` is worked out per call from the views' `shown` and `drawn`.
- A renderer may `patch(view, g, before, L, region, moving)` what it drew. The graph renderer's `patchMoves` draws again
  the boxes and border items whose rect changed, the lines on them and the border items at those lines' ends, and the
  frame's pieces; its `patchContent` compares each drawn group's `sign` (what its drawing is made from: the element's
  fields, rect, compartments, name line, and a border item's glyph and name place; a line's fields, points, label) and
  draws again those that differ. Anything coming on screen, going, or changing order makes the view draw again whole.
- The browser's rows and a grid's rows and a matrix's columns are drawn as they come on screen. The sequence and geometry
  views draw their whole content while their frame is on screen, and are drawn again whole after a change.
- The stage's size is read once and kept (`stageSize`), refreshed on resize and at each gesture's start, so a drag move
  doesn't make the browser lay the page out.
- The page keeps `M.lookups(S.model)` from one drawing to the next and makes it again only after a change to the
  structure (`reading`, `forget` in `render.js`); a line by id comes from it too (`lineById`).

When the checks run: once the changes pause, as the save does (`S.checkTimer`, `check()` in `render.js`); at once when
the model is a new one (the page starting, a model from elsewhere, Undo, an import); and at once when something needs
them (`checkNow()`: the export panel, the HUD's button). A view whose renderer draws the problems (`problems: true`, the
grid) is drawn again when they change.

The library's lookups (the agent's track; `src/README.md`, "Lookups"): `lookups(model)` holds maps of the model's
structure, each made on its first use; `reading(model, fn, look)` makes every helper asked about that model object
answer from them, and `perReading` keeps what depends on names for one reading. `validate`, `toSysML`, `descendants`
and `browserRows` read in a reading. New helpers on `SysMLModel`: `lookups`, `reading`, `idsOf`, `elementsOfKind`,
`linesOfKind`, `linesFrom`, `linesTo`, `linesAt`, `inheritedFeature`. `nameTakenBeside`'s fourth argument is now
`{ before, kind }`. A look must be made again after an element, line or view is added, removed or replaced, an id, kind,
owner or end changes, or a list is reordered; the model must not change while a reading runs (the sequence view's order
renumbering stays inside its change, outside any reading).

The store's layout 2 (the agent's track; `canvas/README.md`, "On the published page"; `src/README.md`, "The store"):

- `core/lib/stored.js`: `STORE` (the paths, the store's limits, the 192 KiB cap on a part), `splitModel`, `storeHead`,
  `storedKey`, `assembleModel`, `readStore`, `measureBody`. The head, `model/current`, is `{ layout: 2, baseRevision,
  format, revision, package, elements, relationships, views (each list's record count), parts: [ids], changes, updated }`;
  each part, `model/current/parts/<id>`, is `{ records: [...] }`, cut where a record's identity hashes to a boundary (or
  before 192 KiB), and named by a 64-bit hash of what it holds. A view's record keeps its `layout` key holding the count
  of the `[id, place]` entries after it, so the model comes back JSON for JSON.
- `core/page/store.js`: a save writes the parts the store hasn't got, three at a time, then the head, then deletes the
  parts no head names; it listens to the head, the parts and `model/working`; a model in `model/working` with the file's
  revision (an older page's store, or one Claude hands over whole) is taken through `normalize`, and so `M.upgrade`,
  saved in layout 2, and deleted; a head in a newer layout turns the page read-only and is never written over; a part a
  shown head names that disappears is written again (`repair`). A record too large for a part is named in the status
  and not sent.
- `refused()` says what went wrong by the store's code and the store's own words; the page turns read-only only for
  revoked or not_granted, or invalid_argument while the platform hasn't said whether the viewer may write
  (`can('data.write')` null), as `db.d.ts` advises. `attempt()` retries an unavailable call once and a busy one twice,
  and a busy save is tried again from 2 s to 30 s.
- `export.mjs` and `save-state.mjs` take a dump of the store's documents by path as well as a state file (what Claude
  writes from what it reads); `check.sh` passes it through.

What a user can notice:

- The problems show once the changes pause (0.8 s), not at each keystroke; the export panel and the problems button
  check at once.
- Zoomed out below 25%, the graph views draw outlines without words, glyphs or labels.
- Large models stay quick to type in, drag in and import, and keep saving past the 900 elements where saving stopped.
- A refused save says what went wrong and leaves the page editable, unless the store says this viewer may not write.
- The store holds the model as `model/current` and its parts; `model/working` still takes a whole model handed over live
  (small models: a document is at most 256 KiB), and older stores open and move to layout 2 by themselves.

### The measured times

This container, quiet, on the generated models, the way the tests take them (medians; the keystroke and the drag move
are opening / joining an undo step). Before is session 8's table.

| What | Before | After |
|---|---|---|
| Keystroke at 5,000 elements | 1,691 / 1,692 ms | 5.8 / 5.4 ms |
| Drag move at 5,000 elements | 1,759 / 1,725 ms | 5.9 / 5.8 ms (the frame 1.1–1.5 ms; it was 111–118 ms) |
| Keystroke at 10,000 elements | 5,196 / 4,865 ms | 8.9 / 8.7 ms |
| Drag move at 10,000 elements | 5,271 / 5,048 ms | 12.5 / 8.0 ms |
| Checks at 10,000 elements, in the page | 1,835 ms | 22.5 ms (the scale test's own samples: 27 ms) |
| Checks at 10,000, on the page's own model after the pause | (in every render) | about 37 ms |
| Export at 10,000 elements, Node | 57 s (47.9 s on a quiet machine) | 0.14 s |
| Import at 5,000 / 10,000 elements | 4.3 s / 13 s | 0.4 s / 0.7 s |
| Save at 10,000 elements | one 2,974 KiB document, refused | 49 parts, 2,994 KiB in all, the largest 192 KiB, a head of 1.3 KiB, written in 118 ms (fake store); about 30 ms of the page's time to split |
| A rename's save at 10,000 elements | the whole model | 1 part of 107 KiB and the head, 1 old part deleted |

### How it was checked

- Tests: 175 of 175 pass, none todo. The documented command exits 0, three runs in a row in about 70 s each; the
  one-process run (`node --test canvas/test/`) passes too. New: `visible.test.mjs` (6: what the window shows, the far
  drawing, a browser's and a grid's rows, a drag that patches in place and leaves what drawing everything again draws
  after each move and drop, a rename that draws again only the definition and the part it types, with a letter typed
  and taken back, a doc, and the checks after the pause and at the export), `lookups.test.mjs` (5), `stored.test.mjs`
  (10), `store-dump.test.mjs` (3), `store-layout.test.mjs` (8: an old store upgraded, a refused save by quota and by
  invalid_argument, busy, unknown permission, a doc too large, a model written over, a lost part written again, a newer
  layout).
- Mutations: taking out the patch's lines, its frame, or the border items at a line's ends fails the drag test; leaving
  the name line out of a sign fails the rename test; a redraw that doesn't keep the new sign (a real bug, found by the
  code-links test, fixed) fails the typed-and-taken-back test. The lookups agent put 12 faults into the lookups one at a
  time, and each fails `lookups.test.mjs`.
- Equivalence of the lookups: a differential tester ran the library from the start of the session beside the new one,
  over the fixtures, `state.json`, scale models from 31 to 10,000 elements and 480 mutated models per seed with many
  problems (three seeds): 15 million helper answers each time, and `normalize`, `validate` and `toSysML` byte for byte,
  with no difference.
- Exports: the saved model prints SHA-256 `9825ca06…`, every fixture its pinned `.sysml`, and `canvas/check.sh` accepts
  the saved model and all nine fixtures with the three warnings session 1 recorded. A dump of a page's store holding a
  300-element model exports the same text as its state file, and `check.sh` accepts it.
- Tests changed, assertions kept: `lookAt` finds the element through the layout (an element off screen isn't drawn);
  eight problem assertions in `behavior-actions`, `interconnection` and `naming` first wait for the checks
  (`checked` in `helpers.mjs`), since they run once the changes pause, which also keeps "nothing is wrong" from passing
  before the checks have run; `shared.test.mjs` and `loop.test.mjs` read the store's model through the new helper
  `storedModel` (Claude's live `model/working` test is unchanged); `fake-store.test.mjs` counts the page's 5
  subscriptions (the refusal comes at the 60th it makes, not the 62nd). The four scale tests lost their todo marks only.

### For the next session

- Step 9: make the repository the tool's own. Ask Damon for the new name; the format's name (`stronghold-canvas/2`)
  and the store and camera keys carry Stronghold too.
- The store's layout needs trying on the published page before it is relied on: the first save of 10,000 elements is
  49 writes, three at a time, and `db.d.ts` gives no numbers for the call rate or concurrent writes. Two pages editing
  one store at once are only last-writer-wins plus `repair`.
- A save splits the whole model each time (about 30 ms at 10,000 elements, after the pause); the notes `edit()` keeps say
  which records a change touched, which would make it incremental. The checks after the pause take about 37 ms there.
- A drag at 10,000 elements lays its view out again (about 3,000 boxes); laying out only what moved would halve it.
- The sequence and geometry views are drawn again whole after each change, and the grid's matrix still makes a cell per
  pair; all three are small today.
- Agents' worktrees live under `.claude/worktrees`, which is in this clone's `.git/info/exclude`, not in `.gitignore`.
- The licensing of `metamodel.js` is still open (session 7). `docs/REPO_MAP.md` still shows the old single file.

## Session 10, November 7, 2026: step 9, Make the repo the tool's own

Step 9 is done. The canvas starts from a blank model, Stronghold's models are labeled as examples, the README's decision
record says the page is one file built from several and the saved state lives in `canvas/state.json`, and the tool is
named Grasp. Damon gave the name when asked, once the rest was committed: the repository becomes Grasp (it was
Playground), and the page's title and heading carry the name. Five commits, each with every test passing: the
Stronghold model kept as an example with the tests opening the canvas holding it; the blank start, the page's title and
its tests; the READMEs and the decision record; these notes as they stood before the name; the renames. These notes, as
they stand now, are the sixth.

### Where things are now

- `canvas/state.json` holds a blank model, the one SysON's "SysMLv2" template (its empty project) starts with
  (`docs/sysml/syson/features/application.md`, "SysON project templates"): the package `Package1` with an empty doc,
  holding one general view, `view1` (id `v-1`, at 0, 0, an empty layout), and no elements, lines, notes or archive. Its
  format is `grasp/2` and its revision `2026-11-07T16:43:21.719Z`, both written by `save-state.mjs`, which also built
  `index.html`. It exports as `package Package1 {`, a blank line, `view view1 : StandardViewDefinitions::GeneralView;`,
  `}` (SHA-256 `a8423a94…`), and the page draws one empty frame whose palette is the general view's. The package's name
  can't be changed on the page (no field has it), as before; Claude changes it on its side.
- `canvas/examples/stronghold-proof.json` is the old `state.json` byte for byte, its format `stronghold-canvas/2` and
  its revision `2026-11-06T11:57:16.000Z` included: the Stronghold proof's structure. It exports session 1's
  saved-model text (SHA-256 `9825ca06…`). `canvas/examples/README.md` says what it is and how to open it (Import
  state; `export.mjs`, `check.sh`).
- The tests open the canvas holding that example, the model they were written against. In `test/helpers.mjs`, `PAGE` is
  now a page built from the sources with the example as its saved state (`build(readStateFile(EXAMPLE))`, written into
  a folder in the system's temp folder, once per process, removed at exit). It is `index.html` with another saved
  state, since `build.test.mjs` checks that `index.html` is what the sources build. `INDEX` is `index.html` itself and
  `EXAMPLE` the example's path; `openCanvas(browser, { file })`, `pageSource(file)` and `assertPageExists(file)` take
  another page; `PAGE_URL` is gone (nothing used it). No assertion changed for this.
- Two Node tests read `state.json` itself: the save test in `store-dump.test.mjs` now saves the example (it pins notes
  on the model's first element) from a dump based on `state.json`'s revision, and `stored.test.mjs` splits the example
  as well as the saved model.
- `test/start.test.mjs` (4 tests) opens `index.html` itself: the blank model it saves; its text, with no problems; the
  page opening on one empty, active general view with its palette, nothing to undo, no problems, the export panel's
  text, the title and heading Grasp, and nothing the page shows naming Stronghold; and a first part def going into
  `Package1`, which the view then exposes as `Package1::*::**`.
- The name, Grasp:
  - The page's title and heading say Grasp (they said Stronghold Design Canvas). `README.md`'s title is Grasp.
  - The saved format is `grasp/2` (`FORMAT` in `core/lib/model.js`): the same version 2 under a new name, so `VERSION`
    is unchanged. `versionOf` reads `grasp/N` and `stronghold-canvas/N` alike, and must go on reading the old name for
    the files already saved; version 1's upgrade writes `grasp/2`. A page from before the rename finds no version in
    `grasp/2` and reads it as its own current version, 2, so files pass both ways. The fixtures and the example keep the
    old name, as they were saved, and so do the models several tests build (`model-lib`, `naming`, `stored`, `visible`,
    `scale-model.mjs`), which now also check that old files read.
  - The browser's keys are `grasp:` (plus the saved revision, for the page opened as a file) and `grasp-camera:v1` in
    `core/page/base.js`. A copy kept under the old key was set aside by the new revision anyway; the camera forgets
    where it was, once.
  - `src/README.md`, `canvas/README.md` and the decision record in `README.md` say all this.
- `core/style.css`'s comment says the colors and type were first taken from the Stronghold project's design tokens;
  `interconnection/lib.js`'s comment says `~Api` for `~StrongholdApp`.
- `canvas/canvas.png` was taken again, the same scene under the title Grasp: `annotations.json` with the grid fixture's
  `v-table` and the browser fixture's `v-tree` (moved to x 1400, y 560) added, imported through Import state into
  `index.html` at 1400 × 900 and device scale 2, then Fit, then a click on the empty plane at (200, 250) to clear the
  status line. The script was the session's own, in its scratchpad.
- The READMEs: `README.md` says what Grasp is, that it was first built to draw Stronghold's design, lists
  `canvas/examples/` and `plan/`, shows the build and an example's check under Run it, and its decision record gains
  November 7, 2026 (the canvas a tool of its own with a blank start and Stronghold's models as examples; the name;
  one file built from several; the saved state in `canvas/state.json`), with the November 6 entry pointing to it.
  `canvas/README.md` says what the page starts from, where the examples are, and what the tests open, and writes its
  examples of the text in `Package1`'s names. `docs/sysml/README.md` puts first what the canvas uses (the validator
  script, the maps) and the Stronghold proof last, under "The example", its text kept but for two sentences (below).

What a user can notice: the page is called Grasp and opens blank, and the Stronghold model opens with Import state.

### How it was checked

- Tests: 179 of 179 pass, the 175 from session 9 and the 4 in `start.test.mjs`; the documented command takes about 70 s,
  as before. Before the renames, the one-process run (`node --test canvas/test/`) passed too, 179 of 179 in 2.5 minutes,
  with one page built for all the files.
- The first commit changed only how the tests reach their model: while `state.json` was still the example, the page the
  tests open was `index.html` byte for byte, and 175 of 175 passed.
- The start tests fail when they should: on an `index.html` holding the Stronghold example all four fail, and under the
  old title the page test fails.
- The format's names: a `versionOf` that knows only `grasp` fails five of the format tests (old files no longer
  upgrade), and one that knows only `stronghold-canvas` fails the first.
- Exports: the saved model prints `a8423a94…`, before and after the renames, and `canvas/check.sh` accepts it
  (`Package Package1`); the example prints session 1's `9825ca06…` and `check.sh` accepts it (`Package
  StrongholdProof`), as it does `format1.json`; every fixture prints its pinned text.
- `docs/sysml/README.md`: every line of the old file is in the new one word for word, except the title, the demoted
  headings, the script's comment, and the two sentences changed on purpose (the paths "in this section"; the canvas's
  example named).

### For the next session

- Step 10: SysON's features, in the order of `features` in `plan/status.json`, label editing first.
- Damon renames the GitHub repository to Grasp himself. GitHub sends the old address on to the new one, so a clone of
  `aliaseddd/Playground` keeps working; the session's tools may need the new name once it changes.
- The published page, https://claude.ai/artifact/V7Fw94cGMbtPnwmyDNmnjU, was built from the revision
  `2026-11-06T11:57:16.000Z`, the example's. Published again from this `index.html`, it starts blank, and its store's
  model, based on the old revision, is set aside, not deleted. If Damon drew on the page, read the store first:
  `save-state.mjs` now refuses a dump based on the old revision (it isn't `state.json`'s), but `export.mjs` reads it
  with a note, and `SysMLModel.readStore(dump, '2026-11-06T11:57:16.000Z')` gives `{ model, notes, archive }` to keep as
  a state file, in `canvas/examples/` or wherever Damon says.
- Step 10's tests can open the canvas holding the example (the default), import a fixture, or open another page with
  `openCanvas(browser, { file })`.
- Noticed, outside this step: Fit on the blank model's empty frame zooms to 221%, so the first element is placed large.
- `docs/REPO_MAP.md` still shows the old single file and the old helper (`PAGE_URL`).

## Session 11, November 7, 2026: step 10, Features from SysON

Damon asked to hear what step 10 is before it started, approved it with three choices made SysON's way (the zoom keys
type while something editable is selected; what the canvas can't hold yet is named as not kept; the keyword isn't
part of the text edited), and asked for the whole step. SysON's user manual was read from its repository at the map's
commit (`git` sparse checkout of `doc/content` into the session's scratchpad), never its code; the inventory in
`docs/sysml/syson/features/` is the rest of the spec.

### Label editing (done)

Two commits, each with every test passing: the library's part, then the page's.

Where it is (`canvas/src/labels/`, the feature's folder; `src/README.md` and `canvas/README.md` say what it does):

- `lib.js`: `readLabel(text)` reads a text as SysON's node rule (keywords, `ref`, `<short>`, the name, `[m]` before or
  after the type, `: Type` with `~`, `:>`, `:>>`, a bare operator that takes its part away when it comes first, a value,
  `ordered`/`nonunique`, what can't be read). `labelText(model, target)` is the text the box starts from, SysON's
  initial text: `wheels[4] : Wheel`, `api : ~App`, `ServerHost :> Host`, an interface's `: Def`; a reference whose
  name would end a reference is quoted, and one a simple name wouldn't find is a path from the package.
  `applyLabel(model, target, text, make)` makes it, in place, inside the page's `edit()`, and returns `{ done,
  created, notKept, unread, refused }`; `labelWords` and `labelLeftOut` give the words. `labelEditable` and
  `renamable` say what has a label to edit and what a browser row can rename. All on `SysMLModel` through `EXTRA`.
- `page.js`: the box (`.label-editor`, a textarea in `.stage`, outside `#canvas`), `editTarget()` (the selection, in
  the active view, which must draw it), `openLabelEditor(typed)`, `labelKey(event)` (pointing.js asks it first, so a
  printable key opens the box and the zoom keys don't zoom while something editable is selected), F2 on the document,
  the panel's `#edit-label` button (`renderLabelButton`, which panel.js calls; Rename in a browser view), and
  `placeLabelEditor` (camera.js calls it, so the box follows the camera).
- Each drawn label is marked `data-label` by `asLabel` (drawing.js) in the eight places a name or a line's label is
  drawn (box, border item, line, behavior header, control node, item, event, footprint tspan, browser row tspan); the
  box opens over its bounding box, or, when none is drawn, over a place from the layout.

How it follows SysON, and where it doesn't:

- SysON's grammar has a list-item rule (compartment rows, with `in`/`out`/`inout`); the canvas draws no compartment
  rows, so every label is read with the node rule, and a border item's `in x` stays in the name, as SysON's border
  nodes do. Direction stays the panel's.
- A definition's `abstract` and typing part are left aside, as SysON does; the usages' keywords, short names, `ref`,
  redefinitions, values, `ordered`/`nonunique`, and a multiplicity on what has none are "not kept", said in the status.
- The manual lists `=` among what ends a name (SysON's grammar at v2026.11.0 doesn't); the canvas follows the manual,
  since a value is not kept anyway.
- Resolution is SysON's scoping (own members, each owner going out, the package, then anywhere), filtered to what the
  canvas's rules accept (the usage's definition kind; the same kind, and for a usage the same box), and never the
  element itself. A simple name nothing in scope has makes a definition at the top of the package (definitions here
  are never nested) or, for `:>` on a usage, a usage beside it (SysON puts it in the package; the canvas's rule wants
  it in the same box). Nothing is made beside an element with the same name. A qualified name or a `~` never makes.
- A refused part (a definition of another kind, a circle, a usage in another box) is refused with the canvas's own
  rule sentence (`RELATIONSHIPS[kind].ends`), and the other parts are still made.
- SysON keeps a typed line break in a label (Shift+Enter); the canvas's labels are one line, so it is read as a space.
- A click on the drawing commits the box and then selects what it is on, which clears the status line (as any
  selection does); leaving the box any other way leaves the status's words up.

How it was checked:

- Tests: 201 of 201 pass, the 179 from session 10 and 22 in `test/labels.test.mjs` (13 Node: reading, starting text,
  what a text changes, lines, a property test that every label of the example and the fixtures edited to its own
  starting text changes nothing; 9 browser: F2, a key, the button, Enter, Escape, leaving the box, undo, the log and
  the save, the zoom keys, a grid, a start node, a page that can't be changed, lines, a transition, the browser's
  rename, and the box over the label in a general, sequence and geometry view).
- Faults put in one at a time, each failing a test: no typed key, no focus back, a new typing drawn as a line, a late
  bare operator taking its part away, `=` read into the name, the keywords not named, F2 renaming a browser row, a
  grid opening a box.
- Exports: the saved model and the example print their pinned texts. The example, `interconnection.json` and
  `behavior-actions.json`, each changed through labels in Node (new definitions, a subsetting, renamed lines, an
  interface retyped, a conjugation), export with no problems, and `canvas/check.sh` accepts all three (the example
  with a warning that a subsetting feature's upper bound, 2..*, is larger than the subsetted one's, 1, which the edit
  asked for).

### Details view (done)

One commit, every test passing (211 of 211), every export unchanged.

Where it is (`canvas/src/details/`; `src/README.md`, "The panel's fields", says how a field is placed):

- `lib.js`: `detailsOf(model, type, item)` gives `{ metaclass, title, core, advanced }`: the title ("Part Properties":
  the metaclass in words, a usage's without "Usage"); `core`, SysON's core features of the metaclass in its order
  (`coreFeatures`, after SysON's `CoreFeaturesSwitch` as the inventory describes it); `advanced`, every other
  single-valued attribute of the metaclass from `METAMODEL`, supertypes' first. A row is `{ field }` (a field of the
  kind holds the attribute: `FIELDS[f].attribute`), `{ value }` (what the canvas knows: `elementId`, `name`,
  `qualifiedName`, `isLibraryElement` false, a view's exposed elements, a specialization's or typing's ends), or
  `{ held: false }`. It adds two FIELDS rows, `specializes` (definitions) and `subsets` (usages), `stored: false`,
  the first `Specialization` line an element starts (`firstGeneral`), with the choices its rule allows (`generals`).
  `conforms` (model.js) is now on the library's shared object.
- `page.js`: `renderDetails(s)`, which panel.js calls after it fills the fields: it moves each field's label to the
  tab and place its attribute has, adds the rows, titles the groups, shows the tab `S.detailsTab` names (kept as the
  selection changes), and hides a group with nothing shown in it. The tabs' buttons (`#tab-core`, `#tab-advanced`,
  and `#v-tab-…` in a view's panel) have their own listeners; no field does. The hooks of `specializes`, `subsets`
  (retarget the line, keeping its notes; nothing takes it away) and `parallel` (`locked` while a state holds
  transitions: the new hook says why, and the panel disables the input and puts the reason on its label's title).
- The panel's markup (`core/page.html`): `#fields` holds the tabs, `#page-core` with `#g-main` (title, body),
  `#g-typing`, `#g-general` and `#g-geometry`, and `#page-advanced`; `#view-fields` the same with `v-` ids. The labels
  are SysON's where the field is a SysON feature (Declared Name, Qualified Name, Typed by, Documentation, Is Abstract,
  Is Parallel, Specializes, Subsets). The heading is Details, and the empty panel says "No object selected".
- A choice (an `enum` field: direction, the kind of action, the kind under a state, a footprint's shape and unit) is
  now radio buttons, a `fieldset.radios`; panel.js reads and writes them (`choiceOf`, `setChoice`, `inputOf`).

How it follows SysON, and where it doesn't:

- SysON's Advanced tab shows a widget for every attribute; values the canvas can't know (an `isComposite` the parser
  works out, which the ecore's default, false, would misstate) are shown as "not held yet", never as a default.
- SysON repeats a Specializes or Subsets group per line; the canvas shows the first line's, as Typed by shows the
  first typing; the others stay lines on the drawing. Like SysON's, the group is there only while a line is.
- SysON has no multiplicity widget (it is edited by direct edit); the canvas keeps its Multiplicity field on Core,
  among its own fields, and its other fields (payload, target, guard, trigger, effect, order, item, the geometry) too.
- References on Advanced: SysON shows the changeable ones; the canvas edits its references as lines and as Typed by,
  Specializes and Subsets, so Advanced lists attributes only.

How it was checked:

- Tests: `test/details.test.mjs`, 10 (5 Node: titles, core features per metaclass, a part's and a definition's rows,
  every kind and line and view of the example and the fixtures with each attribute field in one tab once, a view's
  and a line's values and Specializes' choices; 5 browser: the tabs and their order and the tab kept, Is Abstract on
  Advanced as one step, Specializes and Subsets retargeting and taking the line away and Undo, radio buttons with
  unset and Is Parallel locked, a view's and a line's details and a page that can't be changed).
- Tests changed, assertions kept: the six that picked a choice from a select now pick a radio button (`choose`,
  `chosen` in `helpers.mjs`); two open the Advanced tab to find Is Abstract (`detailsTab`); `fields.test.mjs` opens
  the tab a field is on, picks radio buttons, reads Specializes and Subsets from the line, skips a field locked now
  (it is changed on another element of its kind), and its merged model gives the first element of each kind that
  lists Specializes or Subsets a line, made to another of its kind (made beside it when none is), so every such
  field is changed through the panel as before.
- Faults put in one at a time, each failing a test: no lock, isIndividual on a port, Advanced fields left on Core,
  the tab reset on each selection, Specializes making a new line, radio buttons not set, a circle among the choices,
  empty groups shown.

### Validation rules (done)

One commit, every test passing (221 of 221), every export unchanged.

How many there are: the specification's validation rules are the constraints of its metamodel. The pilot
implementation's `org.omg.sysml/model/SysML.uml`, at the release the canvas's metamodel comes from (`2026-09.1`),
holds 388: 180 `validate…` and 208 `check…`. SysON 2026.11.0 runs 383, its `SysMLValidationRule` enumeration, which
its own unit test holds to that number (`docs/sysml/syson/features/model.md`). The 204 that `docs/sysml/syson/README.md`
gave, and the plan repeated, was wrong; that README now says 383. `SysML.uml` was read in the scratchpad (fetched from
the pilot's repository at the release's commit), never committed; the canvas's messages are its own words.

Which ones the canvas checks, and why only those:

- The 208 check rules ask for what the SysML parser adds to any text (the library's specializations, binding
  connectors, redefinitions): any text the canvas writes gets them, so they hold by construction.
- Of the 180 validate rules, most are about what the canvas doesn't make (variations, individuals, portions,
  expressions, requirements, cases, metadata, views' renderings) or hold for anything it writes (a connector's two
  ends, a port def's conjugated port def, a directed usage being referential). Each candidate was tried by writing a
  text that breaks it and running `docs/sysml/check.sh` on it (`*.sysml` in the session's scratchpad,
  `rules-probe/`): the pilot reports the parallel state's transitions, a trigger out of an action and a redefined
  parameter's direction as errors, an end's multiplicity and duplicate names as warnings, and leaves the successions
  on control nodes unchecked (as the canvas's own checks say); a negative bound doesn't parse.
- The 15 the canvas checks, `SPEC_RULES` in `validation/lib.js`: validateNamespaceDistinguishibility,
  validateFeatureEndMultiplicity, validateMultiplicityRangeBoundResultTypes, validateTransitionUsageTriggerActions,
  validateStateUsageParallelSubactions, validateStateDefinitionParallelSubactions, validateStateUsageStateSubactionKind,
  validateStateDefinitionStateSubactionKind, validateControlNodeOwningType, validateForkNodeIncomingSuccessions,
  validateDecisionNodeIncomingSuccessions, validateJoinNodeOutgoingSuccessions, validateMergeNodeOutgoingSuccessions,
  validateSendActionUsagePayloadArgument, validateRedefinitionDirectionConformance. Several overlap the canvas's own
  checks, which stay as they were: those are the canvas's problems on the drawing; these are SysON's warnings in its
  Validation view, under the specification's names.

Where it is (`canvas/src/validation/`; `src/README.md`, "The specification's rules", says how to add one):

- `lib.js`: the rules, `{ name, metaclass, check }`; `validateSpec(model)` checks every element and line against the
  rules on its metaclass in the text or a class it is a kind of (an action that sends is a `SendActionUsage`), and the
  package as a namespace; a diagnostic is `{ rule, metaclass, type, id, path, message, severity: 'warning', text }`,
  sorted by rule then path, `text` in SysON's form (`#rule·····[document/path]·····Constraint on type
  'sysml:Metaclass' is not respected: message`, the document being the package; an unnamed line's path is
  `<ID: id>`). Two rules on what the canvas keeps on the element (a multiplicity, a parameter's redefinition) are
  checked on the element (`of`).
- `page.js`: `checkRules()`, which `check()` in `render.js` calls first, keeps `S.diagnostics` and draws the view
  again when they change; the view (`#validation-panel`, opened by `#validation` in the bar, closed by
  `#close-validation`) groups them by kind in `<details>` sections, folded at first, with their count; the sections
  opened stay open. "No diagnostic available" when there are none.

How it follows SysON, and where it doesn't:

- Namespace distinguishability is the specification's (`isDistinguishableFrom`): two members are alike only when one's
  metaclass is a kind of the other's, so a part and a port of one name, or a view and a part def, pass, though the
  pilot warns about any duplicate name (see below). Inherited members aren't compared; the canvas's own check for a
  usage named like an inherited feature of another kind stays.
- SysON's subject for a multiplicity or a redefinition rule is the MultiplicityRange or the Redefinition, which have no
  qualified name; the canvas names the element that holds them.
- The view sits on the left of the plane, as SysON's left panel does, opened from the bar, since the canvas has no
  side bar of views. It shows no Error or Info sections, as SysON shows none: all its rules are warnings.

How it was checked:

- Tests: `test/validation.test.mjs`, 9 (8 Node: the rule list; the example and every fixture keep every rule; each
  rule on a model that breaks it and on what is near it but keeps it; SysON's label and the unnamed line's path; 1
  browser: the button, the view on the left, none, a folded Warning section with its count, the diagnostic's label,
  the count following a change after the pause, the section kept open, Undo, Close).
  `test/scale-checks.test.mjs` gains a case: the rules under 100 ms at 10,000 elements (measured: about 9 ms in the
  page, beside about 27 ms for the canvas's own checks).
- Faults put in one at a time, each failing a test: any same name clashing, two successions allowed, the rules not run
  with the checks, an opened section not kept, an end's multiplicity unchecked, a trigger out of a state flagged, an
  inout redefinition unchecked, the diagnostics unsorted.
- Exports: unchanged (the saved model `a8423a94…`, the example `9825ca06…`, every fixture its pinned text), and
  `canvas/check.sh` accepts the saved model and the example.

### For the next session

- Step 10's listed features are done, and its status says so. To go on, add the next of SysON's features to
  `features` in `plan/status.json` and set step 10 back to open; the inventory's areas (`docs/sysml/syson/features/
  README.md`) are where to choose from.
- The details view's "not held yet" rows are a list of what the canvas could hold next: short names, `ref`
  (isComposite), variations, individuals, portion kinds, `ordered`/`nonunique`, `end`, `derived`, `constant`; label
  editing already names each of them as not kept when typed.
- The canvas draws a usage's name line as `name : Type [m]`; SysON draws `name[m] : Type`, with a definition's
  `:> General` on it too ("Node labels" in the inventory's direct-edit section). Drawing labels as SysON does would be
  a feature of its own; the label editor already starts from SysON's text.
- Noticed, outside this step: the pilot warns ("Duplicate of other owned member name") about a view named like an
  element of the package, which neither the canvas's checks nor the specification's rule catch.
- The published page (https://claude.ai/artifact/V7Fw94cGMbtPnwmyDNmnjU) was not published again this session.

## Session 12, November 8 and 9, 2026: the reframing, and the plan cut to it

Damon asked for the extensibility document, then reframed the goal: the tool is unpleasant to use (the header palette, nothing resizable, every view on one plane with no tabs), what he wants is a mature look and feel, and the architecture change was only a means to it. He does not need SysON's feature set; he needs four things: read and write SysML v2 text, hold and edit every KerML and SysML v2 concept, Claude able to understand and edit the diagrams, and code in GitHub linked to elements, written by Claude alone and reviewed by him. The constraints changed: not one HTML file any more, nothing installed on the workplace machine (no installers, no compilers) but downloaded files are fine, so vendored libraries are allowed, and files on disk are allowed. He confirmed a paraphrase point by point (SysON as the reference workbench, any such would do; resize covers panels, frames and boxes; SysML v2 is what matters, KerML as it needs; Claude's loop through files, the claude.ai store drops out). The result is `plan/direction.md`, with `plan/scope.md` as its appendix and `plan/spikes/` as its experiments.

What was done, in order:

- **Research** (the deep research protocol was read first): what SysON is built from (React Flow 12.10.2, elkjs 0.11.0, MUI 7, `react-resizable-panels`, `pathfinding`, `html-to-image`, `material-react-table`; EPL-2.0 and MIT), docking shells (Dockview, MIT), diagram engines (maxGraph Apache-2.0 at 0.25.1, JointJS core MPL-2.0 with its editor controls in the paid tier), elkjs, and the SysML v2 parsers of November 2026: OpenSysML (OpenMBEE, Go, Apache-2.0, nightly builds, the pilot's 2026-09 libraries bundled, two browser builds), `sysml-v2-lsp` (ANTLR4, MIT, grammar pinned to 2026-09), SysIDE Editor Legacy (Langium, EPL-2.0, archived at 2024-12), `tree-sitter-sysml`. URLs are in `direction.md`, "What was checked".
- **Spikes**, kept in `plan/spikes/` with a README of the commands: what a page opened from `file://` can do in Chromium 153; React 18 + React Flow + Dockview + elkjs bundled by esbuild to a classic script and opened from disk; React Flow with 5,000 nodes; OpenSysML's typed module in Node and in a page opened from disk (embedded as gzip in a base64 script); and, last, OpenSysML's command-line build converting `docs/sysml/stronghold-proof.sysml` to the standard API JSON element form (189 elements) and back to identical text and elements.
- **The map**: readers classified the 23 strategies by fate and every one of the 620 port entries by the need it serves (look 238, text 45, concepts 221, loop 6, later 100, out 10) and by what would provide it; `plan/scope.md` holds the result.
- **The plan**: three drafts from different angles (needs-first, look-first, continuity-first), three judges (needs and constraints, risk and sequencing, daily use; two chose needs-first, one continuity-first), then 21 refuters on the plan's 12 load-bearing claims, 17 of which reported before the model's usage limit stopped the rest and the synthesis step. The refuters corrected the plan in five places: the import fallback (unexposed statements have no positions to slice by), the "same release" wording (the library files are identical between 2026-09 and 2026-09.1, the validator's code is not, and the files are EPL-2.0), the licence conditions (a notices file, elkjs as its own file), ELK off the page's thread (a Blob-URL worker), React Flow's identity-based state and the page's timings, and, the largest, that OpenSysML's command-line build prints and converts in the browser after all, which turned the model into the standard element form and OpenSysML into the printer, with Grasp's writer as the cross-check.

What the next session should know:

- Nothing in `canvas/` changed; the old page and its tests stand until the new page retires them kind by kind. The first slice is the shell and the planes, in a new React application bundled by esbuild into `canvas/dist/`, with the About panel that reports what Damon's machine allows.
- The Workflow tool runs two agents at a time on this machine, so the readers and the refuters ran as background agents; the Design and Judge phases ran as a workflow, whose synthesis step was first too large (everything inline, 287,000 tokens of context, probes of its own) and then stopped by the usage limit. The drafts and judgments are in the session's scratchpad only; the plan was written by hand from them.
- Four checks did not complete: the reasoning lenses on the file-page claim, the licence claim and the React Flow scale claim, and the source lens on the release claim; their sibling lenses did, and their findings are in the plan.

## Session 13, November 12, 2026: Damon's machine probed

No code changed. This session answered the unknowns of `plan/direction.md` that only Damon's work machine could
answer, and brought the state documents (`plan/status.json`, `direction.md`, the README) in line with the redesign.

How it was probed: one self-contained page, `grasp-probe.html`, opened from disk in Chrome 157 on Windows (20 cores,
16 GB); it was first run in Chromium 153 on Claude's side as a baseline, and the results matched.

| Test | Result |
|---|---|
| Today's page (`canvas/index.html`) from the extracted repo | Opens; Download state and Import state work |
| Secure context and pickers from `file://` | Yes, all three pickers present |
| Folder pick, write and read back | Works |
| Remembered folder handle | Survives a reload with permission `granted`, and a full Chrome restart (Damon confirmed) |
| Save picker, open picker, file input, download | All work (Damon confirmed) |
| Policies in `chrome://policy` | Nothing blocking (Damon confirmed) |
| Blob workers, IndexedDB, localStorage | All work |
| GET to api.github.com, raw.githubusercontent.com, github.com | All reachable |
| GitHub PUT with an `Authorization` header (invalid token, nothing written) | 401, so the preflight passes |
| WebAssembly | Not blocked; a 50M-step loop took 39 ms against 277 ms in JavaScript, so it runs compiled |

What it means for the plan: the workspace folder works as decision 7 plans it, with none of its fallbacks needed on
this machine; Pull and Push through the GitHub API should work once a real token is used; nothing suggests WebAssembly
or just-in-time compilation is restricted. `direction.md` records this under "What was checked" and narrows "What is
not settled yet" to match.

Not tested: OpenSysML's real module (about 15 MB) on that machine. The WebAssembly result makes it very likely to
work; its load and parse times there are unmeasured.

The probe's branch and pull request were deleted, so the probe is not in the repository; the only copy of
`grasp-probe.html` is the one sent to Damon.

### For the next session

- The objective is the redesign in `plan/direction.md`; `plan/status.json` now lists its seven slices, with `next`
  naming the one to do. Start slice 1, the shell and the planes: a React application bundled by esbuild into
  `canvas/dist/`, beside the old page, which stays untouched until slice 2 retires it kind by kind.
- At the start of slice 3, make one real write to GitHub from the page with a throwaway token.
- At the start of slice 4, measure the real OpenSysML module's load and parse times on Damon's machine.

## Session 14, November 12, 2026: slice 1 planned, approved and begun

Slice 1, "The shell and the planes", was planned in one container and begun in another. The plan was written on
`claude/grasp-slice-1-plan-mmntfd`, which was never pushed; its text reached the next session through Damon's message
and is committed unchanged as `plan/slice-1.md`, except where it asked for the approval, which it now records. The
building is done on `claude/gallant-tesla-cs1o59`, from `1ab5c53`.

What Damon decided: he approved the plan and took its three recommendations. React Flow's mark is hidden on the planes
and credited in About and the notices file; the theme is light only until slice 7; relationships are drawn by two
clicks in this slice. `plan/direction.md` gains "Decided for slice 1", which gives the plan's additions in short.

The baseline, in this container, before any change:

| Command | Result |
|---|---|
| `node --test --test-timeout=120000 canvas/test/*.test.mjs` | 221 tests in 47 suites: 221 pass, 0 fail, 0 todo, in 80 s |
| `node canvas/build.mjs --check` | `canvas/index.html` is what the sources build |
| `node canvas/metamodel/generate.mjs --check` | `canvas/src/core/lib/metamodel.js` is what SysML.ecore generates |
| `node canvas/export.mjs canvas/examples/stronghold-proof.json \| sha256sum` | `9825ca06…`, the bytes of `canvas/test/fixtures/format1.sysml` |

What the planning session tried outside the repository, in its scratchpad (section 1 of the plan has it in full):

- `npm install` of the whole stack took 13 s (118 packages). React 18.3.1, `@xyflow/react` 12.10.2, Dockview,
  `@mui/material` 7.3.11, `@mui/x-tree-view` 8.29.3 and Roboto bundled with esbuild 0.28.2 in under half a second, as
  one classic script of 1.08 MB or as two (the libraries on one global, 1.38 MB, and the page's own code).
- Opened from `file://` in Chromium 153, both forms were ready in 250 to 400 ms with no console error or warning; Roboto
  loaded from font files beside the stylesheet; a right-click menu opened; a sash drag widened the Explorer from 240 to
  338 px; a handle drag resized a box from 220 × 96 to 280 × 141.
- Dockview's edge groups collapse, expand, resize by a sash and are held by `toJSON()`, from `file://`.
- A port made as a child node stays put when its owner is resized; keeping it on the border is Grasp's to write.
- TypeScript 6.0.2 checks code against these libraries' types in 2.5 s.
- Two traps: enabling the CSS domain of Chrome's DevTools protocol makes Chromium log an error on a `file://` page, so
  the tests must not; and `dockview-react` 8.8.3 now installs `dockview-core` 8.9.0, so all three Dockview packages
  are pinned at 8.9.0.

What the execution plan checked on npm before step 2: every pinned version exists (react and react-dom 18.3.1,
@xyflow/react 12.10.2, dockview-react 8.9.0, @mui/material and @mui/icons-material 7.3.11, @mui/x-tree-view 8.29.3,
@emotion/react 11.14.0, @emotion/styled 11.14.1, @fontsource/roboto 5.3.0, elkjs 0.11.0, esbuild 0.28.2, typescript
6.0.2, @types/react 18.3.31, @types/react-dom 18.3.7). All are MIT except elkjs (EPL-2.0), Roboto (OFL-1.1) and
TypeScript (Apache-2.0); their licence files have varied names (Dockview's `LICENCE.md`, clsx's `license`, elkjs's
`LICENSE.md`). `dockview-react` 8.9.0 asks for `dockview` `^8.9.0`, which asks for `dockview-core` `^8.9.0`, so the
root `package.json` pins the other two through npm `overrides`.

### Step 2: install, build, check, test

The commands of the plan's step 2 work, and `canvas/dist/index.html` is a page that is empty but real: it loads the
model library and the libraries, mounts React with MUI's theme, and says Grasp in Roboto, from `file://`, with no
console error or warning, ready in about 270 ms.

Times in this container: `npm ci` 10 s (119 packages, from `rm -rf node_modules`); `npm run build` 0.5 s; `npm run
check` 2 s (the build in memory, then `tsc`); `npm test` 4 s (8 tests); `npm run test:old` 221 of 221.

What `canvas/dist/` holds:

| File | Size |
|---|---|
| `index.html` | 802 B |
| `model-lib.js` | 307.4 kB |
| `vendor.js` | 1354.1 kB |
| `vendor.css` | 155.1 kB |
| `app.js` | 3.1 kB |
| `app.css` | 54 B |
| `fonts/roboto-latin-{400,500,700}-normal.woff2` | 21.4, 21.7, 21.7 kB |
| `vendor/elkjs/elk.bundled.js`, `LICENSE.md` | 1589.4 kB, 14.1 kB |
| `THIRD-PARTY-NOTICES.txt` | 101.4 kB: 52 packages, then elkjs and SysML.ecore |

The licences of the bundled packages: 40 MIT, 8 ISC, 3 BSD-3-Clause, 1 OFL-1.1 (Roboto), and elkjs's and
SysML.ecore's EPL-2.0. Every package ships a licence file, so no licence text had to be added by hand.

What was built otherwise than the plan names, or beyond it:

- **`canvas/app/src/fonts.css`**, a file the plan did not list: three `@font-face` rules naming only Roboto's
  `.woff2` files, so the build copies three font files, not six. esbuild resolves the package path inside `url()`
  (`@fontsource/roboto/files/…`) without help.
- **The shim.** Each library import in the application's code becomes a CommonJS module whose exports are
  `window.GraspVendor[path]`, marked `__esModule`. Checked in Chromium: `import React from 'react'`, `import * as`
  and named imports all give the same functions as one bundle would. An import of a package that `vendor.ts` does
  not hold fails the build, naming the file, the line and the path.
- **The notices list every package the build read**, even one the bundler left out entirely (`dockview`, whose
  file only re-exports `dockview-core`, and `prop-types`); such an entry says it is in none of the page's files.
  `hoist-non-react-statics`'s licence holds a line of `=`, so the rule between entries is 80 of them.
- **`overrides`** in `package.json` pin `dockview` and `dockview-core` at 8.9.0 beside `dockview-react`;
  `npm ls dockview dockview-core` shows both as overridden at 8.9.0.
- **`build.mjs` exports** `buildFiles()`, `isAllowedLicence()`, `packageOf()` and `difference()` for the tests;
  writing refuses a folder that holds anything but an earlier build.
- **`npm run shots`** is not in `package.json` yet: it comes with step 5 and the script it runs.

The tests: `build.test.mjs` (7: `canvas/dist/` is what the sources build; `--check --out` names a changed `app.js`,
an extra file and a missing font; the page's `model-lib.js` is `libraryCode()` and loads before `vendor.js` and
`app.js`; every package in the metafiles is in the notices with its version, licence and licence text, and elkjs and
SysML.ecore have theirs; the licence list; elkjs byte for byte and in no bundle; the page asks for nothing outside
its folder, Roboto included) and `shell.test.mjs` (1: check 1 of the slice). 8 pass. `plan/status.json` marks check
1 as passing.

### For the next session

- Step 3 of `plan/slice-1.md`: the remaining "Done when" checks as named tests marked todo, and
  `unchanged.test.mjs` with `unchanged.json`.
- `npm ci` first: `node_modules/` is not committed.

## Session 15, November 12, 2026: steps 3 and 4 of slice 1, built in parallel

Steps 3 and 4 of `plan/slice-1.md` were built at the same time, on `claude/determined-fermi-2fudi6`, from `4d1d725`.
They share no source file, so each had a worker of its own, in a git worktree of its own, and a lead reviewed both
diffs, checked the one place the steps meet, and put the results on the branch as two commits, step 3's and then
step 4's, as if the steps had been done in order. The lead wrote `plan/status.json` and this entry in place of the
workers, so that no two wrote the same file. The old suite ran only before the workers started and after both had
finished: its scale tests time single steps in milliseconds, and other work on the machine can fail them.

The baseline, in this container (Node 22.23.4, 4 processors), at `4d1d725`, before any change:

| Command | Result |
|---|---|
| `npm ci` | 119 packages in 13 s |
| `npm run check` | `canvas/dist is what the sources build.`, and `tsc` silent, in 2.4 s |
| `npm test` | 8 tests in 3 suites: 8 pass, 0 fail, 0 todo, in 5 s |
| `npm run test:old` | 221 tests in 47 suites: 221 pass, 0 fail, 0 todo, in 86 s |

Every command passed at its first run.

### Step 3: the "Done when" tests, written first

Each of the slice's ten checks is a test of exactly the name `plan/status.json` gives it. Eight are marked todo and
fail because what they check is not built: three in `shell.test.mjs`, one in `resize.test.mjs`, four in
`scale.test.mjs`. `unchanged.test.mjs` passes with no mark, so check 6 is `"pass"`. With step 3 alone, `npm test`
reports 17 tests: 9 pass, 0 fail, 8 todo, in 12.6 s (5 s before). The eight todo tests take 0.3 to 0.5 s each today;
`unchanged.test.mjs` takes 7 to 9 s, since the six library test files need about 16 s of processor time.

What each todo test says today:

| Test | Message |
|---|---|
| shell › the example shows its general view on a tab | `The page has no Open button (data-testid "open"), so stronghold-proof.json cannot be opened.` |
| shell › no header palette or button row exists | `The page has no top bar (data-testid "top-bar"): the shell that replaces the old header is not built.` |
| shell › a sash drag resizes the Explorer | `The page shows no Explorer (data-testid "explorer"), so there is no sash to drag.` |
| resize › a box resized by its handles keeps its size after save and reload | `The page has no Open button (data-testid "open"), so stronghold-proof.json cannot be opened.` |
| scale › all four | `The page has no Open button (data-testid "open"), so scale-5000.json cannot be opened.` |

Six of the eight stop at the Open button, the first part missing, so today's page cannot show how they fail further
on. The worker therefore ran them against a throwaway page on the real `vendor.js` (Dockview, React Flow, MUI), in a
scratch folder, deleted since. With every part built all eight passed (the scale tests on a 57-element model). With
one part left out at a time, each failed in 1.3 to 1.9 s with a message naming that part: no file asked for, no file
name in the bar, no tab, no plane, no nodes, no edges, a bar of two rows, a button with text, no sash, no selection,
no handle, a resize not written to the model, no download, no fit when a tab is shown, no zoom on Ctrl + wheel, no
name field, a limit not held.

`unchanged.test.mjs`:

- **`unchanged.json`** pins the SHA-256 of 130 files, hashed from the blobs of `1ab5c53`, where the slice began; the
  lead hashed the same paths at `1ab5c53` and at `4d1d725` and found the same 130. The test walks the eleven pinned
  paths on disk and names each file that has changed, is gone or is new. Nothing writes the JSON again.
- **The six files** (`build`, `lookups`, `metamodel`, `model-lib`, `store-dump`, `stored`) run in a `node --test` of
  their own with `NODE_TEST_CONTEXT` taken out, and the test compares the runner's summary with 50 tests, 50 pass. A
  runner that inherits the variable runs nothing and exits 0 (Node 22.23.4); the test was seen to fail with the
  variable left in, with one file not run (`tests 40`), with a failing old test, and with a changed, new or missing
  file.

What the tests need of the page is listed at the top of `canvas/app/test/helpers.mjs`, and steps 5 to 10 build to it:

- `data-testid`: `top-bar`; `open`, `save`, `undo`, `redo` and `about`, each on its `<button>` with an `aria-label`;
  `file-name`; `dock`; `explorer`; `details`; `plane` with `data-view="<view id>"`; `field-name` inside `details`.
- From the libraries: a tab has the role `tab` and is named `name : kind`; a React Flow node's id is its element's and
  an edge's is its relationship's; a selected node has the class `selected`; the resize handle is
  `.react-flow__resize-control.handle.bottom.right`.
- Gestures: Ctrl + wheel zooms, a drag of the ground pans, and Save downloads under the opened file's name.
- No test reads `window.Grasp`: each finds what it checks in the document.

What was built otherwise than the plan names, or beyond it:

- **`moveTiming`, a second timing helper.** The plan's step 8 has a drag step "timed as `timing` takes it today".
  `timing` is copied as the plan asks, and only the keystroke test can use it: React Flow hears drags, pans and
  resizes through d3, whose `mousemove` listener on the window calls `stopImmediatePropagation`, so
  `timing(page, 'pointermove', 'mousemove')` waited 60 s for a sample that never came. Chromium handles a mouse move
  at the start of a frame, in one task with the frame's animation callbacks, so `moveTiming` takes the script's time
  from the `pointermove` reaching the window to those callbacks, and the frame's time from there to after paint.
  Listeners busy for exactly 8 ms measured 8.0 to 8.3 ms over 200 moves. A move that a press or a release follows at
  once is handled before its frame, and `time()` fails on such a sample. Step 8's text and this differ; the plan
  changes only with Damon's approval, so it stands as written until he says.
- **`soon(page, check, missing)`** waits by the page's animation frames, not by the clock: it gives up after 60 frames
  the page had to itself, about 1 s. A page busy for seconds over 5,000 elements is waited for, and a part that is
  not built is found missing in about a second. With `until` and its 60 s, the scale tests alone would cost four
  minutes a run between steps 5 and 8. `until` is kept as copied; its failure carries what the page logged, in place
  of the old page's `#status`.
- **A gesture is one move of 3 by 2 px, then three of 12 by 6.** The old tests made four of 12 by 6. React Flow takes
  the first move to tell a drag from a click, so with four equal moves the box went 36 by 18 px for 48 by 24.
- **The pan test pans each of the three views**, and each must hold the limit. **The open test** times from the page
  being given the file to three tabs shown and the first plane drawing all its 1,544 elements, against 5 s.
- **`openPage` also returns `dialogs`** and accepts each, so a `beforeunload` question at a reload is an assertion,
  not a 30 s hang. **`afterEach` closes the pages** a failed test left open.
- **`assert.ok` where the message is the whole sentence:** `assert.equal(a, b, message)` in Node 22.23 prints
  `0 !== 1` after the message.

Found on the throwaway page, for the steps that build the planes:

- **Dockview and `fitView`.** Dockview 8.9.0 mounts a panel's React component when the panel is added, in an element
  outside the document until its tab is shown. React Flow then measures 0 by 0, and a `fitView` at mount fits
  nothing: scale 0.01, half the nodes drawn. Step 6 must fit when the plane's container first has a size.
- **First numbers at 5,000 elements**, plain boxes, every node in the DOM when fitted, no culling: opening 1.5 to
  2.9 s; a drag step at 100% 10 to 12 ms; a pan step, fitted, 35 to 54 ms in two views and 93 ms in the action flow
  view; a keystroke 415 ms when the page projects all three views again.
- **Contention at step 8.** Under `npm test`, `unchanged.test.mjs` keeps three processor-bound processes busy for 7 to
  9 s while `scale.test.mjs` runs. Today that costs only time; once the scale tests measure for real, step 8 may
  need `--test-concurrency` or another order.
- **Sizes within a tolerance.** The resize test allows 2 units on growth and 1 between the plane and the file; a page
  that snapped sizes to a coarse grid would fail it.

### Step 4: the core, without an interface

`canvas/app/src/core/` holds the history with undo and redo (`history.ts`), the session (`session.ts`), opening and
saving a state file (`files.ts`) and `index.ts`, in TypeScript with no React, tested in Node. `main.tsx` and
`canvas/dist/` are as they were: the page starts to use the core in step 5. Each test was written and seen to fail
before its code (`history.test.mjs` 19 of 19 failing with no core; `files.test.mjs` 21 of 22 with no `openText`);
cases added afterwards were checked the other way round, by breaking the core in 51 ways, each of which failed a
test.

With both steps, `npm test` reports 64 tests in 9 suites: 56 pass, 0 fail, 8 todo, in 15 s; `npm run check` passes in
5 s; `npm run test:old` passes 221 of 221 in 82 s. Step 4 alone: 55 tests, 55 pass, in 6 s.

The tests: `history.test.mjs` (21: the six cases the plan lists, by those names, and the rest of the port),
`files.test.mjs` (23: the example and each of the nine fixtures, opened and saved with no change, hold the same
model, notes, archive and code links, and `canvas/export.mjs` prints each one's pinned text from the saved file,
`format1.sysml` for the example; then the session, and the browser's part played by stand-ins) and
`history-walk.test.mjs` (3).

What was built otherwise than the plan names, or beyond it:

- **`canvas/app/test/history-walk.test.mjs`**, a file the plan did not list. It runs the old page's
  `canvas/src/core/page/changes.js` in Node, with stand-ins for the page, beside the new history on 2,889 seeded
  random changes, and compares what `edit` returned, what was told, the steps, the log and the mistakes after each,
  and the models every tenth change. It makes each intended difference on both sides. And it walks the new history
  alone with Redo: 3,465 steps undone and 3,020 redone, the model compared as JSON text each time. The first two
  tests read `changes.js`, so they go when the old page goes. Scratch runs of the same comparison agreed over
  200,000 random changes on the ten files.
- **`history.ts` differs from `changes.js` beyond redo, listeners and the empty history.** Its header lists each:
  - Undo and Redo put an object's keys back in their order. The old script puts a restored key last, so the JSON
    text differs after undoing a delete; `canvas/test/fields.test.mjs` compares JSON text after Undo, and step 10
    ports that walk.
  - "Nothing changed" is by identity: an equal list or item put in place of another is a change. The old script
    dropped it when the change said nothing, and Undo then could not take back the step before it.
  - A change that throws is put back. `edit`, `undo`, `redo` or `endEdit` called inside a change throws.
  - What was touched is in the model's order even when a place's id names nothing: such an id comes last, where the
    old comparison gave NaN.
  - A run that turns out to be no step gives the redo list back.
  - Whether a place is a line's is asked of the element ids the model had before the change; the old script asked
    its drawing's layout.
  - `mark()` is a number naming the model's state. The session's `unsaved` compares it with the mark at the last
    save, so Undo back to the saved state reads as saved.
  - Left out: `editable()`, `say`, `updateUndo` and the save and check timers, which are the page's.
- **What listeners are told:** `{ by: 'edit' | 'undo' | 'redo' | 'end', touched, structure, replaced, views, moved,
  shown }`, the old `howToDraw` flattened: its `patch` is `moved`, and its `views: null` for a new model is
  `replaced: true`. `'end'` is sent when a run ends. A change to the package has empty `touched` lists and
  `views: null`. A listener that throws is reported as a mistake, and the others are still told.
- **The library is an argument** to whatever opens a file (`openFile(lib)`, `openText(lib, text, { name, handle })`),
  and the session keeps it; the core reads no global. `VERSION`, `versionOf` and `normalize` are added to
  `SysMLModelLibrary` by `declare global` in `session.ts`, since `types.d.ts` was not step 4's to change; a later
  step may move the three lines there.
- **Three choices the plan left open, for Damon to see.** A file saved in a newer version of the format is refused,
  because saving would write over it in an older one, and so is a `model` that is not an object (the old page would
  open a blank model). The saved file's top-level `revision` is the opened file's model revision (the old page wrote
  its stored model's; nothing reads the field). Notes and the archive pass through as the file has them, as the plan
  says; the old page tidies them on import, which for the ten files gives the same data.
- **`saveFile`** ends an open run first, so the log matches the file, and marks the session saved at the state the
  text was made from, so a change made while the browser writes stays unsaved. A byte order mark at the start of a
  file is skipped.

Measured: the old page (`canvas/index.html` from `file://`) imported 20 files the core saved, the ten unchanged and
the ten after a change, and held the same model key for key, the notes, the archive and the log, exported the
expected text, and logged nothing. At 5,000 elements in Node, a drag move or a keystroke through `edit` takes
0.004 ms by the median, placing an element 6 ms, a delete with its Undo 10 ms, all as the old script;
`createHistory` 32 ms, `openText` 90 ms, `stateText` 46 ms.

To know when building on the core: the model's objects are Proxies, so `structuredClone` refuses them (copy through
JSON); models from `loadLib()` belong to another realm, so tests compare them as JSON (`plain` in `core.mjs`).

### Where the two steps meet: how a state file is opened

Neither side had to move. Step 4's `openFile` uses the picker when `typeof window.showOpenFilePicker` is
`'function'`; otherwise it appends a hidden `<input type="file" data-testid="file-input">` to the body, clicks it,
and removes it once a file is chosen or the dialog is closed. Step 3's `openPage(browser, { picker: false })` deletes
`window.showOpenFilePicker` in an init script (it is an own property of `window`; deleting it from
`Window.prototype` does nothing), and `openStateFile` starts listening for Playwright's `filechooser` event before it
clicks Open, then answers the chooser. That order matters: with nobody listening, headless Chromium closes the
dialog at once and the input is gone, so `setInputFiles` on the input after the click finds nothing. The lead ran
the one against the other on a scratch page (the core bundled, an Open button calling `openFile`, the name in
`file-name`): the example opened through the input with no handle, no step and nothing unsaved, no input was left in
the page, Save came as a download named `stronghold-proof.json` in `grasp/2`, and the page logged nothing. The
helper does not use the input's `data-testid`; it reaches the input through the chooser.

### For the next session

- Step 5 of `plan/slice-1.md`: the shell (the top bar, the dock with its two strips and the editor group, the
  empty-editor card, the theme, Roboto). It takes the todo marks off checks 3 and 4, so `# todo` becomes 6.
- The shell builds to the names at the top of `canvas/app/test/helpers.mjs`, and Open calls the core's `openFile`
  with `window.SysMLModel`.
- For Damon: step 8's "timed as `timing` takes it today" against `moveTiming`; `history-walk.test.mjs` beside step
  4's file list; and the three choices of `session.ts` above.
- `npm ci` first: `node_modules/` is not committed.

## Session 16, November 12, 2026: the open points decided, and success criteria for steps 5 to 12

No code changed. On `claude/determined-volta-6k6awq`, from `d468dd3`, in one commit: `plan/slice-1.md`,
`plan/status.json` and this entry. Damon left the points that session 15 had kept for Damon to Claude's judgment ("Do
as you see fit for the items waiting on me"), and chose success criteria for steps 5 to 12 of the slice with the
prompt-success skill. Step 13 was left out of the criteria.

### The decisions

`plan/slice-1.md`, section 7, items 6 to 12, has them with their reasons. In short:

- `moveTiming` takes a step of a drag or of a pan, and `timing` the keystroke; step 8's text says so now.
- `canvas/app/test/history-walk.test.mjs` stays.
- The three choices of `session.ts` stand: a file from a newer version of the format, or one whose model is not an
  object, is refused; the saved file's top-level `revision` is the opened file's; notes and the archive pass through
  as the file has them, until slice 2 shows notes.
- The licence is left open on purpose, and no licence file is added. `aliaseddd/Grasp` is public (asked of GitHub in
  this session), so with no licence file nobody else may use or change Grasp's own code.
- Looking through the page by hand is Damon's own step. It is taken out of step 13, and no session builds anything to
  stand in for it.

### The success criteria

`plan/slice-1.md`, section 10, holds the eight Damon chose, as XML, each with what grades it and when it is checked,
and then how they meet the steps as written. `plan/status.json` points there from slice 1's entry (`criteria`).

| # | Criterion | What it adds to the plan |
|---|---|---|
| 1 | Every "Done when" passes | Nothing: the plan's own measure, counted at the commit that ends step 12 |
| 2 | All ten files open | A browser test over the example and the nine fixtures, from step 6 |
| 3 | Checklist per screenshot | The look at each screenshot is made by a reviewer that sees only the image and its list |
| 4 | Rated as a workbench | Eight scores of 4 or more, for `shell.png` and `example.png` |
| 5 | The four scale limits | Three runs of `npm test` in a row at the end of step 12 |
| 6 | Small models feel instant | A timed test on the 13-element example, from step 6 |
| 7 | Every step ends green | Each step's last commit passes by itself; all eight are run again after step 12 |
| 8 | Notes a stranger can use | Five questions put to a fresh session after step 12 |

How they were made: Anthropic's page "Define success criteria and build evaluations"
(platform.claude.com/docs/en/test-and-evaluate/develop-tests) and the skill's own list were read, and 28 candidates in
eight themes were put to Damon in two rounds. Not chosen, so that no later session offers them again:

- Anything that stands in for Damon's own look through the page: a scripted walkthrough of step 13's list, a random
  walk of gestures.
- Three whole themes, which Damon turned down as not Damon's to rule on: what the steps must leave untouched (the old
  page pinned, bad files refused, nothing asked for outside the page's folder, only the plan's files changed), how the
  tests are trusted (seen to fail first, deliberate breakages, repeated runs), and properties of the code (every change
  through `edit()`, components chosen by kind rows, strict types, no new packages). The plan's practices and the
  earlier sessions' go on as before; they are not criteria.
- Of the themes Damon did choose from: saved files still exporting after a move and a resize, the three complaints
  shown gone beyond the plan's cases, text fitting everywhere, three window sizes, the suite staying quick, no
  questions back, and reports backed by runs.

For a session that puts choices to Damon: offer what is Damon's to decide (what the page does, how it looks, how fast
it is, what a run leaves behind), not what is Claude's to get right.

The counts in criterion 2 were taken in this session from the ten files as they are on disk: 17 views, of which 11 are
of the four graph kinds (8 general, 1 interconnection, 1 action flow, 1 state transition) and 6 are not (2 browser, 2
grid, 1 geometry, 1 sequence). `format1.json` is saved in version 1, where the elements carry their own places: its
one view places its 13 elements only once `M.normalize` has upgraded it, so the test counts places in the model as
read.

### The suite, in this container

Node 22.23.4, at `d468dd3` with this session's changes to `plan/` in the working tree:

| Command | Result |
|---|---|
| `npm ci` | 16 s |
| `npm run check` | `canvas/dist is what the sources build.`, and `tsc` silent, in 3 s |
| `npm test` | 64 tests in 9 suites: 56 pass, 0 fail, 8 todo, in 15 s |

`npm run test:old` was not run: nothing under `canvas/` changed.

### For the next session

- Step 5 of `plan/slice-1.md`: the shell. `npm ci` first.
- Step 5 answers to criteria 1 (its own tests), 3 and 4 (`shell.png`, its checklist and its four scores, by a
  reviewer that is given the image and the list and nothing else), 7 and 8.
- Nothing waits for Damon.

## Session 17, November 12, 2026: steps 5 to 8 of slice 1 designed; nothing built yet

On `claude/inspiring-sagan-fcjr0x`, from `2b80240`. This session loaded the state and designed steps 5 to 8 as one
architecture, under plan mode, and then ran out of context before any step was begun. No code, test, skeleton or
`canvas/dist/` file changed; `plan/status.json` is as session 16 left it (`step` 4). This entry is the session's plan
file, as written and as an independent agent checked it against the plan, the written tests and the libraries'
sources. Where it says "after approval", read "in the next session".

The baseline, in this container (Node 22.23.4): `npm run check` passes in 3 s; `npm test` gives 64 tests, 56 pass,
0 fail, 8 todo, in 10 s. `npm ci` was not run; `npm ls` shows every pinned version installed.

### For the next session

- `npm ci`, then start at step 5 as "How each step is built" below describes: outline, outline commit, tests first,
  implementers, review, checks, screenshot, step commit.
- The method is an experiment Damon asked for: one model designs, reviews and measures; Sonnet subagents at medium
  effort write the tests and fill in the skeletons. The notes are to log, per step, the time, the briefs, the rework
  and whose fault it was, and what the designer wrote.
- Nothing waits for Damon.


### Context

`plan/slice-1.md` is the approved plan for the new page. Steps 1 to 4 are done: the build, the "Done when" checks as
todo tests, and the core (history with redo, session, state files). This session builds steps 5 (the shell), 6 (the
adapter and the planes), 7 (moving, resizing, undo, redo, save) and 8 (the planes at scale), each to a pushed commit.

It is also an experiment in method: I design and review, Sonnet subagents write the tests and fill in the code. What I
hand over is an outline in three parts: the architecture (in `plan/notes.md`), a skeleton (types, signatures and
contracts in the files a step names), and a test list.

Plan mode held back two things the prompt asked for at once. They come first after approval: `npm ci`, and the
architecture written into `plan/notes.md` and pushed on its own. The design below is that architecture.

### What loading the state found

- `plan/status.json`: slice 1 in progress, `step` 4, checks 1 and 6 pass, eight are todo. Matches the notes.
- `npm run check` passes (3 s). `npm test`: 64 tests, **56 pass, 0 fail, 8 todo**, as session 16 left it.
  `npm ls` shows every pinned version installed. `npm ci` was not run (it rewrites `node_modules/`).
- The ten files hold 17 views: 11 of the four graph kinds, 6 not (counted again through `M.normalize`).
- The example's view is 1,176 by 648 units. In a 744 px wide plane (both side panels open) it fits at about 55%.
  The three views of the 5,000-element model fit at about 6%, 7% and 4.5%.

The design rests on the libraries' own sources. Two agents read them, a third checked the design against them, and I
opened each passage the design leans on.

**React Flow 12.10.2**
1. Every store write runs every subscribed selector: one per mounted node, three per mounted edge (one of them works
   out the edge's position), a scan of all nodes and all edges for what is visible, and the minimap's bounds and one
   selector per node. A pan step is one store write. So what is mounted decides what a pan step costs.
2. With `nodes` controlled, a drag step writes nothing to React Flow's store. It calls `onNodesChange`; the store
   changes when the new `nodes` prop arrives, in a pass over all nodes that reuses a node only when the object given is
   the same object as before. A step is worked out from the pointer and the gesture's start, so answering it with a
   clamped or rounded place starts no fight.
3. A parent that comes after its child in the array is a plain `console.warn`, in production too.
4. An edge is drawn only when both end nodes have a handle. A measured node's handles are whatever elements with the
   classes `source` and `target` it holds; a node with none loses its edges. A node that carries `handles` and
   `measured` in its object counts as initialized without being mounted. A node without them is mounted once just to
   be measured, even with `onlyRenderVisibleElements`.
5. The `fitView` prop is used up without fitting when the nodes already carry `measured`. `minZoom` defaults to 0.5,
   and the first viewport is clamped to it.
6. `NodeResizer` shows eight controls. React Flow's own warnings are compiled out of a production build.
7. d3 stops `mousemove` at the window during a drag and a pan (session 15's finding, confirmed). A store's update is
   rendered in a microtask of the same task, so inside what `moveTiming` measures.

**Dockview 8.9.0**
1. `api.addEdgeGroup('left' | 'right', { id, initialSize, collapsed })` needs no registration. Panels join it with
   `position: { referenceGroup }`. Its tab strip is vertical, at the outer side. A click on the name in front
   collapses the group to the strip; a click on a name opens it. The sash is 4 px with `ew-resize`.
2. `onDidLayoutChange` does not fire for an edge group's sash or its collapse. The group's own
   `onDidDimensionsChange` and `onDidCollapsedChange` do.
3. `addPanel` with no position adds to the active group, which can be an edge group. `api.clear()` empties the edge
   groups and collapses them.
4. Without the `theme` prop the edge groups take the dark theme whatever `className` says.
5. A panel's React component is mounted when the panel is added and stays mounted while its tab is hidden; only its
   element leaves the document (session 15's finding, confirmed). Panels are portals in the host's React tree, so
   context reaches them.
6. By default a side tab can be dragged into the editor, a whole side group dragged by the blank part of its strip,
   an editor tab dropped into a strip, and any tab floated by Shift + press. Nothing pops a tab out without an API
   call. With no group in the centre, the `watermarkComponent` shows.

### The architecture

#### Modules and their boundaries

| Module | Owns | Must not know |
|---|---|---|
| `core/adapter.ts` | Which view kinds a plane draws. One view projected into nodes and edges (the plan's six rules). Every rule of place and size: growth, border items, the 12 and 48 of a nested box, least sizes, what a gesture's step may give. The routes of lines, as plain geometry. | React, the DOM, React Flow (it writes the node's shape out itself), stores, selection, events |
| `plane/viewStore.ts` | One view's state outside React: its projection, whether a plane shows it, its camera, far or near, React Flow's own fields (`selected`, `dragging`), what a gesture in progress asks, and the one `edit()` that settles it | React, Dockview, the DOM, how a node looks, any rule of place or size |
| `plane/Plane.tsx` | A view's tab body: the card for a kind no plane draws, else the gate that mounts React Flow only while the tab is shown, React Flow's props and gestures, ground, zoom buttons, minimap, marker definitions | Dockview, the model's elements, the history, files |
| `plane/nodes/*`, `edges/*` | Drawing one node or one line from its `data` | The model, the session, the store. `LineEdge` reads its two ends' rectangles from React Flow. |
| `plane/NotDrawnYet.tsx` | The card itself | |
| `shell/App.tsx` | The session (open, replace), what went wrong, `window.Grasp` | Dockview, React Flow |
| `shell/TopBar.tsx` | The bar; from step 7 its actions and their keys | The planes |
| `shell/Dock.tsx` | Dockview: the two strips, the side panels, the saved layout, one editor tab per view, each showing `Plane` | React Flow, the adapter, how a file is opened |
| `shell/EmptyCard.tsx`, `theme.ts` | The card (props only). Every colour, the MUI theme, the CSS variables `app.css` reads. | |

The direction of use is the plan's: gesture → store → `history.edit()` → listeners → adapter → store → React.

#### What crosses a boundary

- **`PlaneNode`** (adapter → store → React Flow), in the shape of React Flow's `Node`, which `tsc` checks where
  `Plane` hands the nodes over:
  - `id`: the element's id. `type`: the kind row's `shape` (unknown: `rect`, or `port` on a border).
  - `position`: the box's `x, y`, relative to its parent node; a border item's, from `side`, `at` and its owner's size.
  - `parentId`: the nearest owner the view shows. Parents come first in the array.
  - `width`, `height`: the size by `graphLayout`'s rule, whole numbers. `measured`: the same two numbers.
  - `handles`: one shared constant, so an unmounted node counts as initialized.
  - `className`: `def` or `usage`, `abstract`, `far`. `data`: what the component draws (below).
  - `selected`, and `dragging` while a drag lasts: React Flow's own, kept when a node gets a new object.
- **`NodeData`**, one of three, each a plain record with a `far` flag:
  - box (`rect`, `rounded`, `item`, `action`, `state`): keyword line, name line, compartments as wrapped lines
    (`{ head, lines }`), the send or accept glyph, its kind's least size.
  - border item (`port`, `param`): side, which way its arrow points, name line, where the name sits.
  - small (`bar`, `diamond`, `dot`, `bullseye`, `entry`, `event`): its name.
- **`PlaneEdge`**: `id` the relationship's, `source`, `target`, `type: 'line'`, and `data` from the row's `line`:
  route, markers, class, label (empty when far), label offset, whether each end is a border item.
- **`Projection`**: `{ view, far, nodes, edges, bounds }` and the adapter's own index. A node or edge that reads the
  same as in the projection before is the same object.
- **`Ask`** (store → adapter, step 7): what a gesture's step asks for one node, as React Flow gave it: a move to a
  point, or a resize to a rectangle from the rectangle the gesture started with.
- **`ViewSnapshot`** (store → Plane): `{ nodes, edges, far }`, a new object only when something in it changed.
- React Flow's `NodeChange`, `EdgeChange` and `Viewport` (Plane → store).
- **`Told`** (history → store), as step 4 built it.
- **The layout record** (Dock ↔ localStorage `grasp-app:layout:1`): each side's width, whether it is collapsed, and
  which left view is in front. Not Dockview's own JSON, which would hold the open file's tabs.

Compartment text is wrapped in the adapter by character count, as `graphLayout` does, and drawn one row per line. A
box's height is then known without the DOM, in Node as in the page, and rows are plain text from the start. The
adapter's measures (header 40, row 16, and the rest) reach `app.css` as CSS variables that `Plane` sets, so each
number is written once.

#### Each event, from the gesture to the paint

1. **Open a file.** Open (bar or card) → `openFile(lib)` → a `Session` in App's state and in context. The bar shows
   the name. `Dock` removes the old view tabs and adds one per view, titled `name : kind`, the first with a
   direction, the rest against it, the first in front. A file that cannot be opened is said in an alert, in
   `files.ts`'s own sentence, and the open file stays.
2. **Show a tab.** Dockview puts the tab's body in the document → `Plane`'s ResizeObserver sees a size → the inner
   component mounts and reads `viewStoreOf(session, viewId)`. The read projects when the store is stale; subscribing
   makes it live. `store.camera(width, height)` gives the remembered viewport, or fits the projection's bounds and
   decides far or near from that zoom, before React Flow mounts. A view with nothing placed opens at 100%. React Flow
   gets `defaultViewport` and the same zoom limits the store fitted with (2% to 400%), mounts only the nodes in the
   window, then their lines. The fit button calls the store's fit, so there is one fit.
3. **Hide a tab.** The body leaves the document → size 0 → the inner component unmounts. The store keeps its nodes,
   selection and camera, and with no subscriber only marks itself stale when the model changes.
4. **Pan and zoom.** d3 → React Flow's store, one write → `onViewportChange` → `store.moved(viewport)` remembers it
   and tells nobody. Crossing 25% projects again, far or near, and tells React.
5. **Select.** A click → React Flow's `select` changes → the store gives each changed node a new object.
6. **A drag step** (step 7). d3 `mousemove` → `onNodesChange` → the store keeps what React Flow asks for each dragged
   node and calls the adapter: `withAsks(projection, asks)` lays the view out as the rules allow. A place is whole
   numbers; a nested box is never left of 12 or above 48; a border item goes to the nearest point of its owner's
   border; an owner grows and its ports follow; a port's name keeps clear of its line. Only what changed is a new
   object. React renders the plane inside the same task.
7. **A drag's end.** The changes with `dragging: false` → one `history.edit()`, with no key. It writes the places as
   laid out, not as last asked, into the keys of each place in `view.layout`, so the history says `moved`. Writing
   nothing returns nothing, which is no step. The words are the old page's ("Moved part def Host"; "Moved 3
   elements" for several). The history tells its listeners, the store projects from the model, and every object is
   the one already shown: a gesture's layout is the projection of the model its end writes.
8. **A resize** (step 7). `NodeResizer` → `dimensions` changes with `resizing` → asks → `withAsks`. A top or left
   resize keeps the far corner, shifts the boxes inside so they stay put, and stops where one would pass 12 or 48.
   The children's positions React Flow sends are ignored; the adapter works them out. The end is one `edit()`
   writing `x, y, w, h` as shown: never under what the box holds, nor under `placement()`.
9. **What is not a gesture.** A `dimensions` change without `resizing` is a measurement and changes nothing. A
   `remove` changes nothing. Arrow keys move no node (`disableKeyboardA11y`).
10. **Undo, redo.** The bar or the key → `history.undo()` or `redo()` → live stores project again, hidden ones go
    stale.
11. **Save.** `saveFile(session)`, as step 4 built it. From step 7, with unsaved changes, a reload and opening
    another file both ask first.
12. **A sash drag, a collapse.** Dockview → Dock's listeners on each edge group → the layout record. A width is
    remembered when its sash was dragged, not when the window was resized.

#### What step 8's limits fix about steps 6 and 7

- **Culling from step 6**, not added at step 8: `onlyRenderVisibleElements`, with every node carrying `measured` and
  `handles`, and one inert element with the classes `source` and `target` in each node. A drag step at 100% then
  costs the few nodes on screen, and returning to a zoomed-in tab mounts only those.
- **The far form is nothing but the node's own element.** The outline is CSS on React Flow's node element, chosen by
  the shape's class. A node's component draws only words and glyphs, and draws none when far. So 2,112 fitted nodes
  are 2,112 elements with one inert child each. The ground's dots are left out when far, as on the old page.
- **No per-step work over the whole model in Grasp's code.** A drag step runs the layout pass over plain numbers the
  projection keeps, and reads nothing through the model's Proxies.
- **Nothing of Grasp's renders on a viewport change.** The camera is remembered in a field. Node components are
  memoized on `data`, `selected` and size, not on absolute position, so a dragged owner's children don't render.
- **Hidden tabs cost nothing per change**: stale, not projected.
- **Levers kept for step 8's measuring**, in the plan's order: lines without labels below 25%, then no lines. Beyond
  the plan's list, and only if the measures point there: a lighter minimap of our own that draws the same picture,
  `contain` on nodes, the viewport promoted to a layer while it pans.
- **`npm test` runs its files side by side**, so a timed test runs while `unchanged.test.mjs` keeps three processes
  busy. Step 6, the first step whose commit holds a timed test, measures what that costs and, if it costs a limit,
  runs the files one at a time from then on.

#### Checked against the plan's rules and session 15

- The tests' contract at the top of `helpers.mjs` holds: every `data-testid`, tabs named `name : kind`, node and edge
  ids, the class `selected`, `.react-flow__resize-control.handle.bottom.right`, Ctrl + wheel, the ground pans, Save
  downloads under the file's name. New parts are found by role and text, so `helpers.mjs` gains no name.
- A fitted view draws a node for every placed element (`untilDrawn`), because fitting shows them all.
- Sizes are whole numbers with no grid, inside the resize test's tolerance. A bottom-right resize writes one place.
- History outside React, node components chosen by kind rows, one adapter (decision 9).
- No frame, no ELK, light only, React Flow's mark hidden, four graph kinds and a card for the rest.
- Session 15's four findings are each answered: fit when sized; the 5,000-element numbers (culling, the far form, the
  levers); contention; sizes within a tolerance.
- One difference from the old page, by React Flow's layering: a line between two top-level boxes passes under any box
  it crosses. A line with an end inside a box is drawn over that box.

### How each step is built

For each step, in this order. One line to Damon at every change of stage.

1. **Outline.** I refine the design with what the last step taught, and write the skeleton and the test list. A
   skeleton's new files are not imported yet, so the page is unchanged.
2. **Outline commit, pushed**: the skeleton, the notes, and `canvas/dist/` as built. It passes by itself with the
   same `# todo` as the step before, so it is a commit a session could end on, and Damon can read the interfaces
   while the code is written.
3. **Tests first.** A Sonnet agent (medium effort) writes the tests from the list, without todo marks. I run them and
   read each failure against the reason I gave. A test that cannot fail before its code is said so in the notes and
   checked the other way round, by breaking the code.
4. **Implementers.** Sonnet, medium effort, each in a git worktree of its own, with `npm ci` there. The worktrees are
   made from a local commit that adds the tests; it is never pushed and is folded into the step's commit. A brief
   gives the goal, where to read, the files owned, the tests and commands, what to send back, and the five rules
   with their reasons. An implementer who finds a signature or a test wrong stops and says why.
5. **Review.** I read each diff against the outline before its report, then copy the owned files into the main tree.
6. **Checks, alone.** `npm run build`, `npm run check`, `npm test`, with no agent running when anything is timed.
7. **Screenshot.** `npm run shots`, then a fresh agent gets the image and its list and nothing else: present or
   absent per item; for `shell.png` and `example.png` also the four scores, each to be 4 or more.
8. **Step commit, pushed**: the code, the tests, the todo marks of the step's checks off, `canvas/dist/`,
   `plan/status.json` (`step`, the checks), the notes. Worktrees and scratch files removed.

Rework goes back as a brief when the outline was right and the code wrong (then at high effort), and into the
outline when the outline was wrong. A fix smaller than its brief I make myself. The notes log, per step: time, briefs,
rework and whose fault, what I wrote.

### The four steps

#### Step 5, the shell

- **Skeleton (mine):** `shell/App.tsx`, `TopBar.tsx`, `Dock.tsx`, `EmptyCard.tsx`, `theme.ts`.
- **Tests** in `shell.test.mjs`, beside the two todo tests it has. Each fails today for want of the strip, the card
  or the Open button it reads:
  - a side panel collapses to its strip and opens again
  - the panels' sizes are remembered across a reload, and a narrow window does not rewrite them
  - the text is drawn in Roboto, loaded from the page's folder (the bar's, a strip's and the card's)
  - a file opens from the card, and each of its views gets a tab
  - a file that cannot be opened says why, and the open file stays
  - a side view cannot leave its strip (dragged by its name, and by the blank part of the strip)
  - with every tab closed, the card offers to show the views again
- **Agents:** one for the tests, `shots.mjs` and the `shots` script; one for the shell.
- **Set in the outline:** the left strip holds Explorer, Tools, Validation, the right one Details, each an empty
  state until its step. Explorer is in front and open in a fresh browser, 280 px beside its strip; Details 320 px.
  Side tabs have no close button. Neither a side tab nor a side group can be dragged out or floated, and the strips
  take no drop. Save, Undo and Redo are disabled until step 7, About until step 12.
- **Ends with:** checks 3 and 4 pass, `# todo 6`, `shell.png` reviewed and scored. At this step the fourth score
  ("boxes and lines easy to read") can only rate the shell's own boxes and lines.

#### Step 6, the adapter and the planes

- **Skeleton:** `core/adapter.ts`, `plane/viewStore.ts`, `Plane.tsx`, `NotDrawnYet.tsx`, `nodes/BoxNode.tsx`,
  `PortNode.tsx`, `SmallNode.tsx`, `edges/LineEdge.tsx`, `markers.tsx`.
- **Tests:**
  - `adapter.test.mjs`, in Node, over the example, the fixtures and the 5,000-element model: the plan's four (parents
    come first; every placed element is a node and every drawn line an edge; a box holds what is inside it; a port
    lies on its owner's border), and: the same reading is the same object; far leaves the words out; a line's route.
  - `plane.test.mjs`: the plan's four (a part sits inside its part def; each line kind has its marker; a definition's
    corners are square and a usage's round; a sequence view's tab says it is not drawn yet), and: the view is fitted
    once it has a size; the wheel pans and Ctrl with the wheel zooms; a double click does not zoom; below 25% a box
    is its outline; the blank model's empty view opens.
  - Criterion 2: all ten files open, 17 views, no console error or warning.
  - Criterion 6: the page ready in under 500 ms; the example drawn within 1 s; a switch of tab under 100 ms. The
    first has passed since step 2, so it cannot be seen to fail; it is checked the other way round.
  - `shell.test.mjs`: "the example shows its general view on a tab" loses its mark.
- **Agents:** adapter tests → the adapter, while the plane tests are written → the planes (store, Plane, nodes,
  edges, styles, wiring) against the real adapter and the real tests.
- **Ends with:** check 2 passes, `# todo 5`, `example.png` reviewed and scored.

#### Step 7, moving, resizing, undo, redo and save

- **Skeleton:** the gesture half of `viewStore.ts`; `withAsks` and what it needs in `adapter.ts`; the bar's actions
  and keys in `TopBar.tsx`; the `beforeunload` guard in `files.ts`; `NodeResizer` in `BoxNode.tsx`.
- **Tests:**
  - `resize.test.mjs`: the todo test, and a save through a stubbed picker's handle.
  - `move.test.mjs`: the plan's five (a drag is one undo step, undone and redone; three boxes dragged together are
    one step; a nested box cannot leave its owner, and the owner grows; a port dragged past a corner changes side; a
    resize from the top left keeps the opposite corner), and: eight resize controls; a port stays on the border
    after a resize; a resize never leaves a box smaller than what it holds; the keys; the page asks before a reload
    or another file loses changes; a drag step of the example moves the box and takes under 16 ms (criterion 6).
  - `adapter.test.mjs`: a gesture's layout is the projection of the model its end writes.
  - Backspace and Delete remove nothing: it cannot fail first, so it is checked the other way round.
- **By hand:** `canvas/check.sh` on a file the page saved.
- **Ends with:** check 5 passes, `# todo 4`, `nodes.png` reviewed.

#### Step 8, the planes at scale

- **Mine:** the measuring, with nothing else running, and the choice of what to tune. Time is split into script and
  frame per view, with and without lines and minimap, before anything is changed.
- **The proof the plan asks for** is taken by a test of its own in `scale.test.mjs`: the moment the dragged node's
  transform, or the viewport's, changes in the DOM must fall between the `pointermove` and the frame's callbacks.
  The page carries no mark for it, and `helpers.mjs` does not change. One thing is known to fall outside: React
  Flow's own `dragging` class on the first step of each drag, rendered a task later. Its cost is measured and noted.
- **Tuning** in the plan's order, each change kept only if the numbers move. A change larger than its brief goes to
  an implementer.
- **Ends with:** checks 7, 8 and 10 pass in three runs of `npm test` in a row, `# todo 1`, `scale.png` reviewed, the
  table of times in the notes. A limit the plan's tuning cannot hold stays todo and comes to Damon with its numbers.

### Files changed beyond a step's list, known now

Each gets its reason in the notes. The plan's lists leave the wiring out.

- Step 5: `src/vendor.ts` (the five icons, by path, as its header says), `package.json` (the `shots` script).
- Step 6: `core/index.ts` (exports the adapter, which the Node tests load from there), `shell/Dock.tsx` (a view's tab
  shows its `Plane`), `shell/App.tsx` (`window.Grasp` gains the views' stores), `app.css` (the planes' rules),
  `shell.test.mjs` (the todo mark), `shots.mjs` (the new shot).
- Step 7: `core/adapter.ts` and `adapter.test.mjs` (a gesture is laid out by the adapter's rules, not by a second
  copy of them in the store), `shell/App.tsx` (the question before another file is opened, which only now can have
  something to lose), `app.css`, `shots.mjs`.
- Step 8: `shots.mjs`.
- `package.json`, at step 6, only if the test files must run one at a time.
- Library types are declared where they are used (`declare global`), as `session.ts` does, not in `types.d.ts`.

Two choices of mine inside the plan's wording: `shell.png` is taken as the page opens, with no file, since every
panel is an empty state until its step; `example.png` is taken with both side panels collapsed, so the example fits
at full size. Both scenarios go in the notes.

### Verification

- At every pushed commit: `npm ci && npm run check && npm test` with `# fail 0`, and `# todo` equal to the todo
  checks in `plan/status.json`: 6, 5, 4 and 1 at the four steps' last commits.
- Every new test seen to fail, for the reason listed, before its code; the two that cannot, checked by breaking it.
- Screenshots looked at by a reviewer that sees only the image and the list.
- Step 7: `canvas/check.sh` accepts a saved file. Step 8: three runs in a row, medians reported.
- `unchanged.test.mjs` passes throughout: the old page, the library and their tests are not touched.
- At the end: a report per step (counts, timings, scores), what departs from the plan, what waits for Damon.

### What stops me

Only what the prompt names: a scale limit the plan's tuning cannot hold, and anything that needs
`plan/slice-1.md` or `plan/direction.md` to change.

### Appendix: working detail for the skeletons

Not needed to approve the plan. It is here so the detail outlasts this context.

**A skeleton never breaks the page.** New files hold types, signatures, contracts and bodies that throw, and nothing
imports them yet; the implementer does the wiring (`main.tsx`, a panel's body). So an outline commit builds the page
the step before left. `npm run build` runs before every commit, and `canvas/dist/` goes in whatever it gives.

**Commits per step.** Outline commit O, pushed. Then a local commit T = O + the tests, from which the worktrees are
made. At the end `git reset --soft O` and one step commit S, pushed. T is never pushed, so nothing is rewritten on
the remote.

**Step 5**
- `theme.ts`: `INK #182630`, `TEAL #176B61`, and the old page's greys (ground `#EEF2F4`, lines `#E2E7EB` and
  `#CBD3D9`, dots `#B9C3CB`, soft teal `#E7F1EF`, secondary text `#5B6973`); bar 40, tab bar 32, type 13 px;
  `cssVariables` put on `:root` by `main.tsx`, so `app.css` names no colour.
- `Dock.tsx`: `LAYOUT_KEY`, `LayoutRecord`, `readLayout(text)` (tolerant), `DockProps { session, onOpen }`,
  `viewTitle(view)` = `` `${name} : ${kind}` ``. An edge group's `initialSize` counts its strip.
  - `theme={themeLight}`; edge groups made in `onReady`; side panels with a tab component that hides the close
    button. Shift + press is cancelled by a native `pointerdown` listener on the tab's own element that calls
    `preventDefault()`: React's handler would run after Dockview's.
  - `onWillDragPanel` and `onWillDragGroup` cancel a side tab's and a side group's drag; both edge groups locked
    against drops.
  - View panels: id `view:<id>`, component `view`, params `{ viewId }`. The first goes in with
    `position: { direction }` when the centre is empty, the rest against a view panel. Never `api.clear()`.
    "Show the views again" adds only views that have no panel: adding a live panel's id throws.
  - Panel bodies, the watermark and the tab component are module-level components that read a context Dock provides.
  - Names run up the left strip, first name on top. The strip's name in front is teal.
  - A size change counts as the user's when the dock's own size did not change with it.
- `TopBar.tsx`: `[data-testid]` on each `<button>` with a fixed `aria-label`; the tooltip is separate (the child's
  own `aria-label` wins), and a disabled button sits in a `<span>` under its tooltip. `file-name` holds the name,
  then a dot while unsaved.
- `EmptyCard.tsx`: `{ fileName, onOpen, onShowViews }`. Its button is named otherwise than "Open" and carries no
  `data-testid="open"`, or every test that opens a file fails.
- Page readiness (criterion 6) is measured by the test's own init script, not by a mark in the application.

**Step 6**
- `adapter.ts` writes its node and edge types out itself and imports nothing from React Flow. Constants: `HEADER 40`,
  `HEAD_H 18`, `LEAD 16`, `PAD 12`, `CHILD_TOP 48`, `PORT 16`, `FAR 0.25`, `MIN_ZOOM 0.02`, `MAX_ZOOM 4`, and the
  width of a character in a 12 px row (about 6.3 px, tuned on `example.png`).
- `project(lib, model, view, { far, previous?, look? }) → Projection`; `isDrawn(lib, viewKind)`;
  `route(how, a, b) → { points, mid }` for `straight` and `elbow`, used by `LineEdge` and by a port's name.
- Ported into the adapter from page scripts: `nameLine`, the three compartments (doc, code, send or accept),
  `portName`, `portRect`, `graphLayout`'s sizes, `straight`, `elbow`, the glyph hook's default (`inout`).
- Node order: a box, then the boxes inside it, then its border items. Everything in Roboto; no monospace.
- `viewStore.ts`: `viewStoreOf(session, viewId)`, one history listener per session; `drawn`, the kind's label for
  the card, `subscribe`, `getSnapshot` (projects on demand when stale), `camera(width, height)`, `fit(width, height)`,
  `moved(viewport)`, `nodesChanged`, `edgesChanged`. Step 6 handles `select` only; nodes are not draggable until
  step 7.
- `Plane.tsx` props: `nodeTypes` keyed by the 13 shapes, `edgeTypes { line }`, `onlyRenderVisibleElements`,
  `minZoom`, `maxZoom`, `defaultViewport`, `onViewportChange`, `panOnScroll`, `zoomOnScroll={false}`, `zoomOnPinch`,
  `zoomOnDoubleClick={false}`, `nodesConnectable={false}`, `nodesFocusable={false}`, `edgesFocusable={false}`,
  `disableKeyboardA11y`, `proOptions.hideAttribution`. No `fitView`, `width` or `height` prop. Every prop object is
  stable. Controls without the lock button, its fit button on the store's fit, which never zooms past 100%.
- Each node holds one inert element with the classes `source` and `target`. Markers are plain `<marker>` elements
  rendered with the plane and referenced by our own `marker-end`, drawn with `context-stroke`.
- `NotDrawnYet` says `M.an(label, true) + ' is not drawn yet.'`, and that the old page draws it until slice 2.

**Step 7**
- `withAsks(lib, model, projection, asks) → Projection` and `placeOf(projection, id) → Place`, in `adapter.ts`.
  `Ask` is `{ move: { x, y } }` or `{ resize: { x, y, w, h }, from: Rect }`; a border item's move is where React
  Flow put its square, which the adapter turns into `side` and `at`.
- `NodeResizer` gets only its kind's least size and no callbacks, so its props never change in mid-gesture.
- The settle writes keys (`place.x = …`), only those that differ, through `M.placement`'s rounding and limits.
- Words: "Moved part def Host", "Moved 3 elements", "Moved port api in hosts to the right side", "Resized …".
- Keys act unless the event comes from a text field; Ctrl + S always. Both questions are the browser's own
  (`beforeunload`, `confirm`), which the tests' `dialogs` record.

**Step 8**
- Switches kept in one place in `plane/`: lines below 25%.
- The 5,000-element views leave free ground above and below when fitted, which the pan test needs.

## Session 18, November 13, 2026: step 5 of slice 1, the shell

On `claude/quirky-hawking-ia0e3v`, from `ee5f9fa`, begun 04:37 UTC. The method is session 17's ("How each step is
built", above): I outline and review; Sonnet subagents at medium effort write the tests and fill in the skeleton.
Damon asked for the work to be parallelized as needed.

The baseline, in this container (Node 22.23.4): `npm ci` 12 s; `npm run check` passes in 2.5 s; `npm test` gives 64
tests in 9 suites, 56 pass, 0 fail, 8 todo, in 11.9 s.

### Step 5: the outline

Session 17's design for the step stands. Checked against `node_modules/dockview-core` 8.9.0's typings:
`api.addEdgeGroup(position, { id, initialSize, collapsed, minimumSize, maximumSize, collapsedSize })`, the group
API's `collapse()`, `expand()`, `onDidCollapsedChange` and `onDidDimensionsChange`, `onWillDragPanel` and
`onWillDragGroup` (each event has `nativeEvent` and its panel or group), `themeLight`, and a group's `locked`
(`true` or `'no-drop-target'`). There is also a `disableFloatingGroups` option; it is not used, because the direction
keeps floating for editor tabs, so Shift + press is cancelled on side tabs only.

The skeleton, in `canvas/app/src/shell/`, imported by nothing yet, so the page is the one step 4 left:

- `theme.ts`, complete: the colours, the measures, the MUI theme and the CSS variables.
- `Dock.tsx`: `LAYOUT_KEY`, the side panels' ids and titles, `LayoutRecord`, `DEFAULT_LAYOUT`, `readLayout` (final),
  `viewTitle`, `viewPanelId`, `DockProps`; the component's contract in its comment, its body throws.
- `TopBar.tsx`: `ACTIONS` (data-testid and aria-label of each button), the icons by path, `TopBarProps`; contract.
- `EmptyCard.tsx`: `EmptyCardProps`; contract. Its button is "Open a file…", so the bar's Open stays the page's only
  `data-testid="open"`.
- `App.tsx`: `GraspGlobal` (`window.Grasp.session`); contract.

The test list, all in `shell.test.mjs`, each to be seen failing for the reason given:

| Test | Fails today because |
|---|---|
| "no header palette or button row exists", todo mark off | no top bar |
| "a sash drag resizes the Explorer", todo mark off | no Explorer |
| a side panel collapses to its strip and opens again | no strip tab named Explorer |
| the panels' sizes are remembered across a reload, and a narrow window does not rewrite them | no Explorer |
| the text is drawn in Roboto, loaded from the page's folder (the bar's, a strip's and the card's) | no top bar |
| a file opens from the card, and each of its views gets a tab (`browser.json`, three views) | no card |
| a file that cannot be opened says why, and the open file stays | no Open button |
| a side view cannot leave its strip (dragged by its name, by the blank part of the strip, and Shift + press) | no strip tab named Explorer |
| with every tab closed, the card offers to show the views again | no Open button |

`canvas/app/test/shots.mjs` and `npm run shots` come with the tests: `shell.png` at 1400 × 900, device scale 2, the
page as it opens, with no file.

### Step 5: built

From 04:37 to 04:50 UTC. The two agents ran side by side, each in a git worktree, on Damon's word to parallelize:
the test writer for 3.5 min of wall time (22 tool calls) and the shell builder for 5.7 min (55). Their reports guessed
25 and 45 min; the harness's figures are the ones above. Both worktrees were made at `ee5f9fa`, one commit before the
outline, so both were told to fast-forward to `65eb7a7` before starting: a cost of the tool, not of a brief.

**Tests first.** The nine tests failed before the shell existed, each for the reason in the table above (the first
lines of their messages: no top bar, no Explorer, no strip tab named Explorer, no card, no Open button). Choices the
test writer made that the list did not settle: a view's tab is closed by Dockview's own close control,
`.dv-default-tab-action`, after a hover; the refused file is `{ format: 'grasp/2', model: 'not a model' }`; a
floating group is counted as `.dv-resize-container, .dv-floating-overlay-host > *`. That last selector was checked
the other way round, since a side tab that cannot float gives it nothing to find: Shift + drag of an editor tab
floats it, and the count goes from 0 to 1.

**The shell, and where it departs from the outline.**
- The first view's tab goes into a group made by `api.addGroup()`. With `position: { direction: 'right' }` relative
  to the left group, as the outline said, Dockview put the tabs into the edge group in place of the Explorer. The
  contract in `Dock.tsx` says so now.
- Both edge groups get `collapsedSize: 32`, the tab bar's height; Dockview's 35 left a 3 px gap beside the strip.
- A width is remembered only while the dock's own width is unchanged and the side is open; the collapsed flag is
  kept apart, so collapsing does not lose the width.
- The icons are imported whole by path (`import * as`) in `vendor.ts`, because the build's shim hands an application
  import the namespace, and the icon is its `default`.
- The refused file's message is an MUI Alert laid over the top of the dock, so the dock still fills the window.
- MUI Buttons are not upper-cased (`theme.ts`).

**My rework, after reading the diff** (the outline was right and the fixes were smaller than a brief):
- The builder removed Dockview's empty `role="alert"` live region from the page, so that the page held one alert. I
  took that out: it deletes a library's element, and the test finds the alert by the file's name anyway.
- A colour written in `TopBar.tsx` (the disabled icons' white at 35%) moved into `theme.ts` as `BAR_DISABLED`.
- The first independent look at `shell.png` marked "nothing wrapped" absent: the side panels' placeholders broke
  "(step 9)" across two lines. They now read "The model's tree comes in step 9." and the like. Its scores were 4, 4,
  4, 4.

**`shell.png`**, the page as it opens with no file, looked at again by a fresh reviewer that saw only the image and
its list: all seven items present. Its one caveat on "nothing wrapped": the card's sentence on where the example and
the blank model are runs onto a second line, which is a paragraph's ordinary wrap, not a cut. The four scores:
alignment and spacing 4, type and contrast 4, nothing cut off or overlapping 5, boxes and lines easy to read 4. What
both reviewers would change, kept for slice 7, "The finish of the look": an accent bar on a strip's tab in front and
the same rule between the names on both strips; a header row with a rule under each panel's title; brighter
disabled icons on the bar; the two sides at one width.

**The suite**, nothing else running: `npm run check` passes; `npm test` gives 71 tests, 65 pass, 0 fail, 6 todo, in
12.4 s. Checks 3 and 4 pass, and `plan/status.json` names step 5 with six checks todo, as the runner says.

### For the next session

- Step 6: the adapter and the planes, as session 17's outline gives it. `npm ci` first.
- Agents made with a worktree start one commit behind a commit made in the same session: fast-forward them first.

## Session 19, November 13, 2026: step 5 reviewed, and what the review found fixed

On `claude/quirky-hawking-ia0e3v`, from `29c88de`. Damon asked for a review of step 5's code, then for its findings to
be fixed, the small ones too. No step was begun: `plan/status.json` still names step 5, with six checks todo.

### What the review found

The step's own "Done when" held: from a clean clone, `npm ci && npm run check && npm test` gave 71 tests, 65 pass, 0
fail, 6 todo at `29c88de`, and 64, 56, 0, 8 at the outline commit; `npm run shots` gave the committed `shell.png`
byte for byte. Ten things were wrong beside it, each reproduced in the built page except the eighth:

1. Details's width was never remembered. `api.width` is the width of Dockview's editor area, not of the dock, and a
   layout tells the left group, lays out the editor, then tells the right group, each time, changed or not. So the
   right handler always found `api.width` changed and took its own sash's drag for the window's doing.
2. For the same reason the left handler took every layout for the user's, and a window under 700 px (the two sides
   and the editor's least 100 px) wrote the squeezed width over the remembered one.
3. Material UI's text was 14.86 px, not 13: `typography.fontSize` scales the type scale by fontSize / 14.
4. The keyboard's focus could not be seen: no ripple, and nothing in its place; a tab's ring was Dockview's, 1 px in
   the pale colour of the tabs' dividers.
5. With a view floating and the others closed, the card said all the views were closed, and "Show the views again"
   put them into the floating window.
6. The narrow-window half of the sizes test could not fail: at 800 px nothing is squeezed.
7. The strip test passed with the whole left side dragged into the editor (its tab then sits at x = 32, inside the
   test's 40 px), and nothing tested a tab dropped onto a strip.
8. When another file is opened, React renders the old file's tabs once more, with the new session in the dock's
   context, before the effect takes them away. Nothing reads it yet; step 6's planes would have.
9. A remembered width was taken at any size: 100000 left the editor Dockview's least 100 px.
10. The side panels were 248 and 288 px wide, since Dockview's `initialSize` counts the strip; the plan's section 4
    and session 17's outline give 280 and 320 beside the strips. Session 18's notes did not say so.

The lesson for the method: a test seen to fail for want of the whole shell has not been seen to fail for each thing
it claims. Session 17's rule ("checked the other way round, by breaking the code") is for those claims too.

### How it was fixed

The tests were written first, by a forked agent, while the sources were changed, and each was seen to fail on
`29c88de` for its own reason; the two that guard something already right were seen to fail with the guard taken out
(`locked`, and `onWillDragGroup`).

- **The record** (`Dock.tsx`). A width is remembered when a sash was dragged: at the release that ends the drag, for
  each open side whose width the drag changed, written there and then. Nothing else writes a width, so a narrow
  window cannot. When the dock grows again, or a side is opened, a side narrower than its remembered width is set
  back to it (`setSize`), so the squeeze goes with the window that made it. A remembered size under what a side can
  be (its strip and Dockview's 50 px) is taken for none, and a side opens at no more than 40% of the dock
  (`fitSide`), the record keeping the size as it was remembered.
- **Two things tried and dropped there.** Reading the widths a task after the release (`setTimeout`): a reload
  straight after the drag came first, and nothing was written. Reading the dock's width from its element: Dockview
  lays out one frame after the window changed, and a window made narrow and wide again within that frame showed the
  wide width at both layouts, so the dock never seemed to grow. The width is now the sum of the three parts as
  Dockview laid them out, read when the right group, the last of a layout, is told its size.
- **The sides' widths**: 280 and 320 beside the strips, as the plan has them, so the record's fresh sizes are 312 and
  352. The editor is 736 px wide at 1400, which is what session 17's fit of the example assumed.
- **The type** (`theme.ts`): body, button and tooltip sizes are given per variant, in rem: 13 px, and 12 px for a
  tooltip. An icon button on the bar is 30 px now, where it was 28.56.
- **The focus**: a 2 px teal ring standing off a Material UI button (the theme), a white one inside a button of the
  ink bar (`TopBar.tsx`), and a teal one inside a tab, over Dockview's (`app.css`).
- **The views**: the closed ones go back into the editor, beside a view that is in it or into a new group, never
  beside one that floats. The card says what is true: all closed; so many of so many closed, the others floating;
  or all floating. `EmptyCard`'s props changed for it (`file: { name, views, closed }`).
- **A tab's session** is in its panel's params (`ViewParams`), with the view's id. Step 6's `Plane` draws that one,
  not the context's. It cannot be tested until a tab draws something.
- **The small ones**: the "Skeleton:" lines are gone from the four shell files and the icons' note sits with the
  imports; a collapsed strip marks no name in teal; the bar's file name has its whole name as its `title`; the
  record is written once per drag, not at every layout; the editor with no group and no card is the ground's colour.

Still Dockview's own, and left: with the last tab of the editor floated by Shift + drag, Dockview shows no card until
something else changes the editor.

### How it was checked

`npm run check` passes. `npm test`, three runs in a row, nothing else running: 77 tests, 71 pass, 0 fail, 6 todo.
`shell.test.mjs` gained six tests and four changed: the sizes test (the right sash, a 500 px window, the widths back
without a reload), the strip test (each strip tab where it was), the collapse test (no teal name while collapsed),
the card's open test (the file name's title); new are the fresh widths, a remembered width that does not fit, 13 px,
the focus, a tab dropped on a strip or a side panel, and the card with a view floating.

### `shell.png`, retaken, and the fourth score

The fixes change the look (13 px text, sides of 280 and 320 px), so `shell.png` was retaken and looked at by a fresh
reviewer that saw only the image and its list: all seven items present; scores 4, 4, 5 and **3** for "boxes and lines
easy to read" (hairline dividers too pale, panel titles with no header row, the strip's name in front not marked).
Criterion 4 asks for 4. One round of changes answered those three remarks: the lines that part the window are darker
(`LINE_STRONG` `#B4BFC8`, was `#CBD3D9`); a side panel has a header row as high as the editor's tab bar with a rule
under it; the name of the view that is shown has a teal bar at the window's edge. A second fresh reviewer, on the
image retaken after them: all seven present; 4, 4, 5 and **3** again, for other reasons: the strips are the same
grey as the editor's ground, a line parts the tab in front from its own panel, and the window has no bottom edge or
status bar. Session 18's two reviewers gave that point 4 for the look before any of this.

I stopped there. The remarks differ from one reviewer to the next and now ask for design the plan does not have (a
status bar), which is Damon's to decide, with slice 7, "The finish of the look". So the step's code is fixed and
green, and criterion 4's fourth point stands at 3 by the two latest reviewers. Both also said, with session 18's:
About reads as disabled (it is, until step 12).

### For the next session

- Damon's word on the fourth score: take session 18's 4, or have the strips toned and the tab in front joined to its
  panel now, or leave it to slice 7.
- Then step 6, as session 17's outline gives it. `npm ci` first. A view's tab draws the session in its params
  (`ViewParams` in `Dock.tsx`); the sides are 312 and 352 px with their strips, so the editor is 736 px wide at 1400.
- A test that guards something is seen to fail with that thing broken, not only before the code exists.

## Session 20, November 13, 2026: step 6 of slice 1, the adapter and the planes

On `claude/pensive-rubin-sjrv3g`, from `5127985`. Planned from 06:25 UTC under plan mode; Damon approved the plan at
07:03 and the work began then. The method is session 17's ("How each step is built"), tightened by what session 19
taught, on Damon's word.

The baseline, in this container (Node 22.23.4): `npm ci` 14 s; `npm run check` passes in 5 s; `npm test` gives 77
tests, 71 pass, 0 fail, 6 todo, in 18 s; `npm run test:old` passes 221 of 221 in 80 s.

### What Damon decided

1. **The shell's fourth score**, which session 19 left at 3. Before step 6's code, the two strips get a tone apart
   from the editor's ground, and the strip's tab in front is joined to its panel. `shell.png` is retaken and rated once
   more; that score is recorded and the step goes on. No status bar is added.
2. **The method.** Session 17's, tightened: I outline, review and measure; Sonnet subagents at medium effort, each in a
   git worktree, write the tests and fill in the skeletons; each test is seen to fail with the thing it guards broken;
   and a reviewer that has not seen the outline reads the step's diff before its commit.

### The order of work, by what blocks what

| # | Task | Who | Needs | Beside |
|---|---|---|---|---|
| 0 | `npm ci`, the baseline | me | | |
| L | The shell's look: tests first, then the strips and the tab | agent | 0 | 1a, X |
| X | The old page's own layout of the ten files and the 5,000-element model, read from the old page | agent | 0 | 1a, L |
| 1a | Outline, part 1: `core/adapter.ts`'s skeleton, its export, the adapter's test list | me | 0 | L, X |
| T1 | `adapter.test.mjs` | agent | 1a, X | 1b |
| 1b | Outline, part 2: the skeletons under `plane/`, the DOM contract, the browser's and the store's test lists | me | 1a | T1 |
| I1 | The adapter | agent | T1 seen to fail | 1b, T2, T3 |
| T2 | `plane.test.mjs`, `open.test.mjs`, `instant.test.mjs`, the `example` row of `shots.mjs` | agent | 1b | I1, T3 |
| T3 | `viewStore.test.mjs` | agent | 1b | I1, T2 |
| I2 | The planes: the store, `Plane`, the card, the nodes, the edges, the markers, the styles, the wiring | agent | I1 taken in, L landed, T2 and T3 seen to fail | my reading of I1 |
| R | On the whole: my reading of the diff; each breakage the test lists name, made by an agent; an independent reviewer; a first `example.png` before a reviewer that sees only it | me, three agents | I2 | each other |
| F | What the reviews found, fixed | me, or an agent at high effort | R | |
| C | Alone: build, check, `npm test` three times, what the other test files cost the timed tests; the shots retaken if the look changed | me | F | nothing |
| E | The step's commit, pushed | me | C | |

The longest chain is 0 → 1a → T1 → I1 → I2 → R → F → C → E. The outline is in two parts so that the adapter's tests and
code start while the planes' skeleton is still being written. The planes are not started before the adapter is real:
their tests run against one. Two things moved after the plan was approved, on the word of the agent that checked it
against the libraries' sources: the old page's layout is read from the start (X), and the first look at `example.png`
comes beside the reviews, before the timed runs, which a change to the look would void.

No two workers own a file at the same time, since an owned file is taken whole. L: `shell/theme.ts`, `app.css`,
`shell.test.mjs`, `shots/shell.png`. T1: `test/adapter.test.mjs`. T2: `test/plane.test.mjs`, `open.test.mjs`,
`instant.test.mjs`, `shots.mjs`, additions to `helpers.mjs`. T3: `test/viewStore.test.mjs`, `test/core.mjs`. I1:
`core/adapter.ts`. I2: everything under `plane/`, `app.css`, `shell/Dock.tsx`, `shell/App.tsx`, and `shell/theme.ts`
for a colour the planes need. Mine throughout: `plan/`, `core/index.ts`, `canvas/dist/` (a worker builds it to run its
tests and does not hand it over), and the todo mark of check 2 in `shell.test.mjs`.

A brief gives the goal, where to read, the files owned, the tests and commands, what to send back, and five rules with
their reasons:

1. Change only the files you own: another worker is changing the others.
2. Nothing under `canvas/src`, `canvas/test` or the rest of `unchanged.json`'s list: one changed byte fails
   `unchanged.test.mjs`.
3. No new package, and no import that `src/vendor.ts` does not hold: the build refuses it.
4. No test is loosened, skipped or marked todo. A signature or a test that looks wrong is a stop: say why.
5. No colour outside `shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools
   protocol.

The harness keeps the agents' worktrees under `.claude/worktrees/` in the repository's folder. It is named in
`.git/info/exclude`, which is not committed, so `git status` stays quiet; never `git add -A` here.

### The shell's look: the strips toned, the tab in front joined

One agent, 3.7 min (26 tool calls), in a worktree at `5127985`; its commit is taken as it came. Two tests in
`shell.test.mjs`, written first and seen to fail, each for its own reason:

| Test | Failed before the change with |
|---|---|
| a strip is a tone apart from the editor's ground | "The left strip is rgb(238, 242, 244), the same as the editor's ground (--grasp-ground)" |
| the tab in front is joined to its panel | "The left tab in front ends 1.0 px from its panel: its box does not reach the panel." |

The second also reads a screenshot's pixels across the boundary (the PNG decoded with `node:zlib`, no library), and
holds that the rest of the strip keeps its 1 px line and that no tab is white while its side is collapsed.

- `shell/theme.ts`: `STRIP` `#E3E8EC`, as `--grasp-strip`. `TEXT_SECONDARY` on it has a contrast of 4.58 to 1; a darker
  strip would take the names of the tabs not in front under 4.5.
- `app.css`: the strip no longer has a border, which ran past the tab in front and parted it from its panel. Each part
  of the strip draws its own line as an inset shadow on the panel's side: the tabs not in front, a collapsed side's
  tab, and the empty rest. The tab in front draws none and fills the strip's 32 px.
- Dockview colours a tab through variables that the editor's tabs share, and its own rule is stronger than a selector
  of ours, so the strips set those variables on `.dv-edge-group`. Dockview also keeps `dv-active-tab` on a collapsed
  side's tab: a tab is "in front" only while its group lacks `dv-edge-collapsed`.
- Tried and dropped by the agent: a negative margin on the tab (the strip clips it).

`npm test` with it: 79 tests, 73 pass, 0 fail, 6 todo. `shell.png` is retaken; its rating is under "`shell.png`, rated again" below.

### What reading the code and the libraries found

Three explorers read the code as step 5 left it, the old page's drawing rules, and React Flow 12.10.2; an architect
agent then traced eight points of session 17's design through React Flow's and Dockview's sources (27 min, 89 tool
calls; nothing ran in a browser, so its frame counts are derived). The design holds. What step 6 takes from them, each
checked in the source it names:

**Where the planes plug in**
- A view's tab body is `ViewPanel` in `shell/Dock.tsx`, an empty `div.grasp-view-body`. It gets `params.session` and
  `params.viewId` (`ViewParams`). `window.Grasp` holds only `session`. `vendor.ts` already holds `@xyflow/react` whole,
  with `dist/style.css`, so it does not change.
- The library was typed for four members. `core/adapter.ts` declares what the planes read, and `plane/*` reaches the
  library only through the adapter's exports.

**The old page's rules**
- Its measures (`canvas/src/core/page/base.js` 22 to 29): `HEADER 40`, `HEAD_H 18`, `LEAD 15`, `PAD 12`,
  `CHILD_TOP 48`, `PORT 16`. A compartment takes `HEAD_H + LEAD * rows + 6`.
- Compartments are wrapped by a count of characters to the box's saved width, not its grown one: a doc at
  `floor((w - 24) / 6.1)`, at least 12; a send or accept at `/ 6.6`, at least 10; a code link is not wrapped but cut
  to as many characters, at least 8, keeping its tail behind `…`. Their order is doc, send or accept, code.
- `CHILD_TOP` is no part of sizing: it only holds a box that is placed or dropped. A border item's `at` is never
  rounded, so its position is a fraction. A view's own `x, y` are added to every rectangle on the old page's one plane.
- A line's label sits at its middle, `labelOffset ?? 30` below (a connection's name is 30 below its line).
- The wheel pans by the wheel's own delta, and with Ctrl or ⌘ zooms about the pointer (`pointing.js` 245).

**Roboto in the old page's boxes**, measured in Chromium over the 65 docs of the eleven graph views (115 boxes):
- Roboto at 12 px averages 5.27 px a character, so every line wrapped at the old page's counts fits its box. Six lines
  are single words longer than their box, which no wrapping helps: a row clips those with an ellipsis. None of the 105
  name lines is wider than its box. So the old page's counts are kept, and session 17's "about 6.3 px" is dropped.
- Roboto at 12 px is 11 above its baseline and 3 below. In the example, `hosts` and `app` sit 104 below `Page`'s top,
  under `Page`'s three doc lines, which the old page ends 2 px above them. With rows 16 apart and a title row of 18
  the third line would run into `hosts`; with a title row of 16 it ends 1 px above. So `LOOK` is the old page's
  measures with `head 16` and `lead 16`, and `OLD_LOOK` has the old `18` and `15`.

**React Flow**
- A node that carries `width`, `height`, `measured` and `handles` is initialized without being mounted
  (`isNodeInitialized`), and is then culled by its rectangle. Every mounted node is measured once, forced: no
  `dimensions` change comes while its size is whole numbers and unchanged, but its `handleBounds` is read again from
  the DOM, from the elements with the bare classes `source` and `target` in its subtree. A mounted node without them
  loses its lines, far or near; one element with both classes serves, and it must not carry `react-flow__handle`.
- `onViewportChange` is called for a viewport that is not controlled. `minZoom` defaults to 0.5 and the first viewport
  is clamped to it. Ctrl with the wheel zooms under `panOnScroll` with `zoomOnPinch`. `panOnScrollSpeed` defaults to
  0.5: it is set to 1, the old page's.
- `Controls` calls React Flow's own `fitView` before `onFitView`, a frame later, with its own padding and zoom limit:
  the fit button is a `ControlButton` of ours, with `showFitView={false}`.
- A string given as an edge's `markerEnd` is taken for a marker's id; `LineEdge` sets `marker-end` on its own path. A
  path with the class `react-flow__edge-path` takes the stylesheet's grey. A node type missing from `nodeTypes` falls
  back to `default`, with its padding and border, silently.
- Layers: an edge's z is the larger z of its ends that have a parent, and a child's z is its parent's plus one. A line
  between two boxes at ground level is under every node; a line with an end inside a box is over that box, and under
  any node of the same or a higher z. In the example no line passes behind a box. In `behavior-actions.json` two
  successions pass behind sibling actions for 150 to 170 px, where the old page drew them over the boxes. A label in
  `EdgeLabelRenderer` would lie under every node, so a line's label is drawn in the edge's own svg.
- A border item half outside its parent is not clipped, as long as neither `extent: 'parent'` nor `expandParent` is set.
- Types at the hand-over, probed with `tsc`: a node's `data` must be a type alias, not an interface; `handles` cannot
  be a readonly array; a handle's `position` is React Flow's enum. So the adapter imports React Flow's types, and only
  its types: nothing of React Flow runs in the core.
- Keep stable, or every node renders again: `nodes` and `edges`, each on its own; `nodeTypes` and `edgeTypes`; the
  three callbacks; `defaultViewport`; and the `subscribe` given to `useSyncExternalStore`.

**Dockview and a switch of tab**
- A press on a tab opens its panel a frame later (`requestAnimationFrame`, under the HTML5 drag backend, the default
  for a mouse). The plane's observer fires in that frame; its state update renders from a later task; React Flow's
  first commit has no node, since its store starts 0 by 0, and the nodes and edges come with the next. So a switch
  takes two frames at least, 17 to 33 ms of waiting, before any work. `timing` and `moveTiming` take one event and one
  frame, so the switch's test has a clock of its own, from the press to the painted frame that holds every node.

**Fitting**
- Fitted into 736 by 828 with 48 px a side, no node of the eleven views or of the 5,000-element model's three is left
  outside. The parameters' names in `behavior-actions.json` hang 48 out, so 48 is kept: the old frame's `MARGIN`.
- With both sides collapsed the example would fit at 100% with `DevHost` under React Flow's minimap (200 by 150, 15
  from the corner). So a fitted view also stays above the band the zoom buttons and the minimap stand in: `FIT_BAND`,
  180 px. The example then fits at 92.6% with the sides collapsed and at 54.4% with both open.
- `shots.mjs` hands `take` a page that has the picker, which `openStateFile` refuses: the `example` shot needs a page
  without it, and the sides collapsed before the file is opened, since a view is fitted once.

### Step 6: the outline, part 1, the adapter

`canvas/app/src/core/adapter.ts` holds the contract: the types, the constants, the rules in `project()`'s comment, and
bodies that throw. `core/index.ts` exports it, so `loadCore()` gives it to the Node tests; nothing calls it yet, and
the page is the one step 5 left. Final already: `isDrawn`, `notDrawnText`, `markerId`, the constants.

What it settles beyond session 17's design:
- **`Look`**, the measures as a value. `project()` and `route()` take one, `LOOK` by default. Given `OLD_LOOK`, the
  adapter must give the old page's layout exactly, which is now a test (below).
- **`Projection.rects`**, every node's rectangle from the view's origin, beside the nodes' own positions, which are
  from their parents. The tests and the fit read it; `LineEdge` reads React Flow's.
- **`fit(bounds, width, height)`** is the adapter's: one fit, with `FIT_PAD` and `FIT_BAND`, never past 100%.
- **`project()` returns `previous` itself** when nothing in it reads otherwise, so a store's snapshot stays the same
  object.
- **Far** empties the words in `data` and adds `far` to `className`; sizes stay.
- **A border item's `nameAt`** is worked out by the adapter (the old page's `portName`, which moves a name clear of
  the port's first line), from the square's corner, as a baseline's start, middle or end.

Where the rules are on the old page, for whoever builds the adapter (paths under `canvas/src/`):

| Rule | File and lines |
|---|---|
| The measures | `core/page/base.js` 22-29 |
| `wrap` | `core/page/layout.js` 12-24 |
| `portRect` | `core/page/layout.js` 26-34 |
| `graphLayout`: what is shown 44; a box's parent 47-55; the order of what a box holds 56-58; `size()` 64-88; `place()` 89-96 | `core/page/layout.js` 42-108 |
| Which lines are drawn | `core/page/layout.js` 189-193 |
| `straight` 205-226, `elbow` 229-239, the fallback 244, `endpoints` and `mid` 249-260 | `core/page/layout.js` |
| `nameLine` | `core/page/drawing.js` 47-58 |
| The keyword line and the header | `core/page/drawing.js` 66-74 |
| `lineWay` 77-87, `portName` 106-115, a port's arrow 126-149 | `core/page/drawing.js` |
| The doc compartment and `compartmentsOf` | `core/page/drawing.js` 163-175 |
| The far form 224-240; a line's label 298-300 | `core/page/drawing.js` |
| An item's keyword line | `interconnection/page.js` 30-40 |
| An action's and a state's keyword lines, the send and accept marks, the control nodes and their names | `behavior/page.js` 59-127 |
| The send or accept compartment | `behavior/page.js` 129-137; `sendWord` in `behavior/lib.js` 489 |
| The code compartment and `fitPath` | `annotations/page.js` 315-320 |
| The event | `sequence/page.js` 22, 28-37 |
| The rows: kinds, lines, view kinds, `placement`, `textName`, `typingOf`, `an`, `reading` | `core/lib/model.js` 103-109, 137, 166, 190, 216, 291, 301, 623, 727, 853; `interconnection/lib.js` 12-30, 57-61, 90-94, 119, 131, 157-161, 202-206; `behavior/lib.js` 13-41, 50, 57, 62-66, 380-383, 452-458; `sequence/lib.js` 12-31, 58-62, 80 |

**The old page's layout as a fixture.** `canvas/app/test/old-layout.json` holds what the old page's `graphLayout` and
`endpoints` worked out for every graph view of the example and the nine fixtures, from each view's own origin: 153
rectangles and 58 lines in 11 views, one to a row. For the 5,000-element model it holds a SHA-256 of each of the three
views' layouts (1,544, 1,344 and 2,112 rectangles; 384, 384 and 1,536 lines). `canvas/app/test/old-layout.mjs` wrote
it, from `canvas/index.html` opened from `file://` and given each file through Import state (`node
canvas/app/test/old-layout.mjs`, 20 s); it exports `layoutHash`, which the test uses too. Neither file is in the
plan's list. The script reads the old page and goes when it goes; the JSON stays, as what "by `graphLayout`'s rule"
means. An agent first read the same numbers by a script of its own, and the two readings are equal.

The adapter's tests, `adapter.test.mjs`, in Node, over the example, the nine fixtures, the blank model and the
5,000-element model. Each fails today because `project()`, `route()` or `fit()` throws "is not built yet":

| # | Test | The breakage that must fail it |
|---|---|---|
| 1 | parents come first, and a box's parent is its nearest owner that the view shows | a node's parent taken to be its owner, shown or not |
| 2 | every placed element is a node and every drawn line an edge, and no other | hidden lines made edges too |
| 3 | a box holds what is inside it | the growth left out of a box's size |
| 4 | a port lies on its owner's border | `at` measured along the wrong side |
| 5 | given the old page's measures, the rectangles and the lines' points of the eleven views are the old page's | the rows' distance taken from `LOOK` whatever look is given |
| 6 | given the old page's measures, the 5,000-element model's three views hash to the old page's | a port's line begun at its square's centre |
| 7 | with the new measures a compartment's rows are 16 apart under a title row of 16 | the title row left at 18 |
| 8 | the same reading is the same object | every call making new objects |
| 9 | a changed element renews its own node and the nodes that name it, and keeps what React Flow set | `selected` dropped from a renewed node |
| 10 | far leaves the words out and keeps the sizes | `far` ignored |
| 11 | a line's route: straight, each elbow, a port's end, the middle | an elbow drawn straight |
| 12 | what the example's boxes and ports say | the `~` of a conjugated port left out |
| 13 | what an item, an action, a state and a control node say | the send's compartment left out |
| 14 | a line's marker, class, label and offset come from its row | every line given `m-general` |
| 15 | a port's name keeps clear of its line | `nameAt` the same on every side |
| 16 | a view that places nothing, and a view of a kind no plane draws, project to nothing | |
| 17 | the 5,000-element model's three views project in under 1 s together | the model read outside `lib.reading` |
| 18 | a fitted view lies inside the window, clear of its sides and of the band, at no more than 100% | the band left out |
| 19 | `isDrawn` and `notDrawnText` say which kinds a plane draws, and how the card begins | passes today, since both are final: checked by breaking |

### `shell.png`, rated again

A fresh reviewer, given the retaken image and section 4's list and nothing else (6 min): all seven items present.
Alignment and spacing 4, type and contrast 4, nothing cut off or overlapping 5, boxes and lines easy to read **4**
("regions part cleanly by tone and hairline; active tabs join their panels"). So criterion 4 holds for `shell.png` at
this step. What it would still change, kept for slice 7: the names on the strips sit 2 to 3 px right of the strip's
middle; About is as dim as the disabled actions (it is disabled until step 12); the tabs not in front have no bounds
of their own; the card's edge is faint; Save and Undo are not parted. It also read "comes in step 9" as a developer's
note, which it is until those steps.

### Step 6: the outline, part 2, the planes

The skeletons are under `canvas/app/src/plane/`: `viewStore.ts`, `Plane.tsx`, `NotDrawnYet.tsx`, `nodes/BoxNode.tsx`,
`nodes/PortNode.tsx`, `nodes/SmallNode.tsx`, `edges/LineEdge.tsx`, `edges/markers.tsx`. Each holds its contract in its
comment and a body that throws; nothing imports them, so the page is unchanged.

What they settle beyond session 17's design:
- **The store is live or stale.** With a subscriber it projects when a change can have altered its view; with none it
  only marks itself stale. `projected` counts its projections, so a test can see that a hidden tab costs nothing.
- **The camera is decided before React Flow mounts**: the inner component reads `store.camera(width, height)` once,
  which fits the first time and sets far or near, so the first render is already the right form.
- **One fit**: the adapter's, through `store.fit`, from a button of ours in `Controls`.
- **The outline of a node is CSS on React Flow's own node element**, so a far node is that element and the one inert
  handle element. The component draws words and marks only.
- **A line draws its label in its own svg**, and sets `marker-end` itself.
- **The markers are one svg for the page**, rendered by `App`.

**The DOM contract**, which the browser's tests are written to:

| What | How a test finds it |
|---|---|
| A view's tab body, drawn or card | `[data-testid="plane"][data-view="<view id>"]` (`planeOf` in `helpers.mjs`) |
| The card | its text, inside the tab body: `notDrawnText`, then "The old page draws it until slice 2." No `.react-flow` inside. |
| A node | `.react-flow__node.react-flow__node-<shape>[data-id="<element id>"]`, with the words `def` or `usage`, `abstract`, `far`, and React Flow's `selected` |
| A node's outline | that element's own computed border, radius and background |
| A box's words, near | `.grasp-node-keyword`, `.grasp-node-name`; each compartment `.grasp-compartment` with `.grasp-compartment-head` and `.grasp-compartment-row`s |
| A border item's name, near | `.grasp-port-name` inside the item's node |
| A small node's name, near | `.grasp-small-name` |
| A far node | has the word `far` and no text |
| The inert handle | `.grasp-node-handle.source.target`, one in every node, far or near |
| An edge | `.react-flow__edge.react-flow__edge-line[data-id="<relationship id>"]`, with its row's class |
| A line's path, its marker, its label | `path.grasp-line`, whose `marker-end` is `url(#grasp-<the row's marker>)` or absent; `text.grasp-line-label` |
| The markers | `svg.grasp-markers marker#grasp-m-general` and the four others, once in the page |
| The zoom buttons, the fit button, the minimap | `.react-flow__controls`; a button named "Fit the view"; `.react-flow__minimap` |
| The zoom | a node's width on the screen over its `offsetWidth` (`boxOf`) |

Numbers: the fit keeps 48 px at the left, right and top and 180 px at the bottom, at no more than 100% and no less
than 2%; far is under 25%; the wheel pans by its own delta; a switch of tab is timed from the `pointerdown` on the tab
to the painted frame in which the other view's plane holds all its nodes and edges.

**The browser's tests.** Each fails today because no plane exists (`untilDrawn` finds no `data-testid="plane"`), and
each names the breakage that must fail it once the planes are built.

`plane.test.mjs`:

| # | Test | The breakage that must fail it |
|---|---|---|
| 1 | a part sits inside its part def | the nodes handed over without `parentId` |
| 2 | each line kind has its marker | `marker-end` left off the path |
| 3 | a definition's corners are square and a usage's round | the radius rule taken out of `app.css` |
| 4 | a sequence view's tab says it is not drawn yet | React Flow mounted whatever `store.drawn` says |
| 5 | the view is fitted once it has a size, clear of the window's sides and of the minimap | `defaultViewport` left at React Flow's own |
| 6 | the wheel pans by its own delta, and Ctrl with the wheel zooms about the pointer | `panOnScrollSpeed` left at React Flow's 0.5 |
| 7 | a double click does not zoom | `zoomOnDoubleClick` left on |
| 8 | below 25% a box is its outline and a line has no label, and both come back above it | `moved` not given to React Flow |
| 9 | the blank model's empty view opens at 100% | the fit of nothing dividing by zero |
| 10 | no row of a compartment and no name runs past its box, in the example and the fixtures | the ellipsis rule taken out |
| 11 | a click selects a box and a line, and a click on the ground lets go | `nodesChanged` ignoring `select` |
| 12 | a line's label is over the box it lies in | the label drawn in `EdgeLabelRenderer` |
| 13 | the fit button fits the view again | `Controls` left with its own fit |
| 14 | a tab that is hidden holds no React Flow, and shown again finds its zoom and its selection | the camera not remembered |
| 15 | far or near, every line stays drawn | the inert handle left out of a far node |
| 16 | the planes' words are Roboto: 13 px medium for a name, 11 px for a keyword, 12 px in a row | a font size changed in `app.css` |
| 17 | a port's square lies across its owner's border, with its name outside the owner | the port drawn at its owner's corner |

`open.test.mjs`, criterion 2: "the example and the nine fixtures each open: 17 tabs, 11 planes, 6 cards, nothing
logged". For each file, each view's tab is brought forward; a graph view's plane has one node for each element the
view places and one edge for each line that is not hidden and has both ends placed, the model read through
`M.normalize` (so `format1.json`'s places count); another kind's tab has the card and no React Flow. Its breakage: a
card shown for a state transition view.

`instant.test.mjs`, criterion 6's parts for this step, each by the median of the samples it names, timed inside the
page:

| Test | Samples | The breakage that must fail it (checked alone) |
|---|---|---|
| the page is ready in under 500 ms | 5 loads, from the navigation's start to the first frame painted with the top bar | 600 ms of work before the first render; it passes today, so only breaking it shows it can fail |
| the example is drawn within 1 s of the file being given | 5 openings, from the file being given to the painted frame that holds its 13 nodes and 6 edges | a second's wait before the first projection |
| a switch between the two tabs of the interconnection fixture takes under 100 ms | 9 switches, there and back | 120 ms of work as a plane mounts |

**The store's tests**, `viewStore.test.mjs`, in Node, on a session opened from the example and from
`interconnection.json`. Each fails today because `viewStoreOf()` throws "is not built yet":

| # | Test | The breakage that must fail it |
|---|---|---|
| 1 | a session's view has one store | a new store at each call |
| 2 | a snapshot is the same object until something in it changes | a new snapshot object at each `getSnapshot()` |
| 3 | a store with no subscriber only goes stale | every store projecting at each change |
| 4 | a live store projects when its view can have changed, and tells its subscribers once | subscribers told before the projection |
| 5 | a change to another view's places leaves the snapshot the object it was | `told.views` not read |
| 6 | the end of a run projects nothing | `by: 'end'` treated as a change |
| 7 | a selection renews only the node or the line it names, and is kept through the next change | `selected` set on the projection's own object in place |
| 8 | a change React Flow sends that is not a selection changes nothing | a `remove` taken |
| 9 | the camera is the fit the first time and what was last seen after | `moved` not remembered |
| 10 | crossing 25% projects again, far or near, and tells; a step that does not cross it tells nobody | far decided once |
| 11 | a view of a kind no plane draws is not drawn and has the empty snapshot | `drawn` always true |
| 12 | the store's methods can be handed over as they are | a method reading `this` |

### Step 6: the tests, written first

Three writers side by side, each in a worktree, from the lists above.

**The store's, `viewStore.test.mjs`** (2.7 min, 17 tool calls). All 12 fail today with `plane/viewStore.ts: viewStoreOf()
is not built yet (step 6).`, the reason listed. `loadPlanes()` in `test/core.mjs`, beside `loadCore()`, bundles the
core and the store from one in-memory entry, so the store and the session it is given share one copy of the core; the
store imports React Flow's types only, so none of the library is in the bundle. What the list left open and the writer
settled:
- `v-ic` places every element of `interconnection.json`, so "an element the view does not place" is one the test adds
  first, outside any layout, and then renames.
- `projected` before the first `getSnapshot()`, and whether `moved()` before any `camera()` tells anyone, are not
  asserted: the contract does not say.

**The browser's** (8.1 min, 34 tool calls): `plane.test.mjs` (17), `open.test.mjs` (2), `instant.test.mjs` (3), and the
`example` row of `shots.mjs`. Run today, 21 of the 22 fail and "the page is ready in under 500 ms" passes, as listed.
The failures name what is missing: "No plane shows proofStructure (data-testid "plane", data-view "v-proof"): its tab
has nothing drawn on it."; "No plane holds the card of loginSequence"; "The plane of view1 holds no .react-flow";
"3025 ms after the page was given the example, its plane holds 0 nodes and 0 edges, not 13 and 6".
- How each timed test takes its time, inside the page, judged by `measure(n, limit)`'s median, the samples in the
  failure's message. Ready: an init script of the test's own notes the first painted frame with the top bar (a
  MutationObserver, then an animation frame, then a message, which comes after the paint), from the navigation's
  start; 5 loads. Drawn: the same watch for the plane's 13 nodes and 6 edges, less the mark `openStateFile` leaves
  when the file is given; 5 pages. The switch: a capturing `pointerdown` on the window starts the clock, and the same
  watch stops it at the painted frame in which the other view's plane holds all its nodes and edges; 9 clicks, there
  and back.
- `open.test.mjs` has a second test the list did not: "another file opened takes the first file's planes away", which
  is where session 19's `ViewParams` is at last tested.
- A shot can ask for a page without the picker (`picker: false`), which `openStateFile` needs; `shell` is unchanged.
- `helpers.mjs` gains, appended: `lib`, `FIXTURES`, `BLANK`, `TEN`, `modelOf`, `isGraph`, `placedOf`, `linesOf`,
  `cardOf`, `near`, `withInit`, `untilLines`, `showView`, `collapseSides`, `cssColor`, `INK`, `TEAL`, `TAKEN`,
  `groundOf`, `groundPoint`, `rectsOf`, `zoomTo`, `headerOf`. The plan said `helpers.mjs` would gain no name: it gains
  no `data-testid`, and these.
- What the list left open and the writer settled: a line's label must take the pointer for `elementFromPoint` to find
  it (test 12), which is the builder's to give; a hidden tab shown again is waited for by one node, `Pump`, since a
  zoomed view culls the others; Ctrl with the wheel is sent 40 px and must change the zoom by more than 0.5%; the
  corners are read on `Tank.stored`, `Release.compile`, `HostLifecycle` and `HostLifecycle.idle`.

**The adapter's, `adapter.test.mjs`** (14.3 min, 54 tool calls; 909 lines). 18 of the 19 fail today, 17 with
"core/adapter.ts: project() is not built yet (step 6)." and the route's with `route()`'s; the 19th passes, as listed.
The writer also wrote a throwaway port of the old page's rules outside the repository and ran the tests against it:
all 19 pass, the eleven views' rectangles and lines and the three hashes among them, the three scale views in 80 ms.
So the tests can be met, and agree with the old page; no expected value was taken from the port, which is kept out of
the implementer's sight and used at review as a second reading of the contract.
- Pinned beyond the list: the items, actions, parameters, control nodes, states and the event of the fixtures, by id
  (`FuelPort.supply` reads `«out item»` and `supply : Fuel`; `Release.notify` is a send whose rows are `new Warning()
  to` and `maintainer`; `HostLifecycle.running` reads `«state» «parallel»`; `fetchEntry` `«entry action»`); the port
  arrows of `interconnection.json` (`FuelLine.a` `inout`, `CtrlLink.c` `out`, `CtrlLink.p` `in`); the narrow limits
  of the three compartments on a hand-made model; and every branch of `portName` on a hand-made part def with a port
  on each side, 17 directions of the first line, forward and reversed.
- What the contract left open and the writer settled by the old page's code: rectangles that touch count as wholly
  above (the old `<=`); an elbow at a border item leaves from its square's sides, and only a straight line moves a
  border item's end 9 px out; a box's size is asserted as exactly the largest of its saved size, its header with its
  compartments, and the room for what it holds. Left unpinned: a border item whose owner the view does not place
  (`normalize` drops those), and whether a renewed edge keeps `selected` (the implementer is told it does).

### Step 6: the adapter, built and reviewed

**Built** by one agent in 4.3 min (23 tool calls), from the skeleton, the notes' table of the old page's rules and
the 19 tests: `core/adapter.ts`, 729 lines. `adapter.test.mjs` passes 19 of 19; the 5,000-element model's three views
project in 37 ms together (1,544, 1,344 and 2,112 nodes), against the test's 1 s. It found no contradiction between a
test, the contract and the old page, and dropped nothing. What it settled where the contract was silent, none of it
met by the ten files:
- a border item with no shown owner gets no node, as the old page's `place` never placed one, and neither does an
  element whose nearest shown owner is a border item; an element of a kind the library has no row for is not placed
  (the old page would throw); a walk up the owners stops after as many steps as there are elements;
- `abstract` is a word of a box's and a small node's class, not a border item's (the old `elClass`); only a bar and a
  diamond say `textName`, an event says its name line, a start, a done and an entry say nothing;
- `nameAt` is worked out far and near alike; `previous` is ignored when it is another view's;
- with no room in the window `fit` gives `MIN_ZOOM` and still centres, so the viewport stays finite.

**Two readings compared.** The test writer's throwaway port and the implementer's adapter were written apart, the
second without sight of the first. A scratch script ran both over every view of the ten files, the blank model and the
5,000-element model, with `LOOK` and with `OLD_LOOK`, near and far (84 projections): every node, edge, rectangle and
bound, every edge's route by each side's own `route()`, `fit` over 25 windows and bounds, and that each returns
`previous` itself for an unchanged model. 0 differences. With tests 5 and 6, which hold the adapter to the old page's
own numbers, that is the adapter's rectangles and lines checked three ways.

**My reading of the diff**, against the outline: a port, in the old page's order of arithmetic, with nothing invented.
One thing added by my hand, smaller than a brief: a node or edge that changed only in place or size keeps the `data`
object it had (rule 5 says so now), so that a box's component, memoized on `data`, does not render at each step of
step 7's drag; with a test of it, "a box that only moved is a new node with the data object it had", seen to fail
without the two lines. `adapter.test.mjs` has 20 tests.

**Each test seen to fail with its thing broken.** An agent, in a worktree (2.8 min, 16 tool calls), made each
breakage the list names in `adapter.ts`, ran the test that guards it and then the whole file, and put the file back.
All 19 named tests failed under their breakage. Three things it showed, each closed by my hand and then seen to fail
under its breakage:

| What was weak | What holds it now |
|---|---|
| The timed test's 1 s: with the model read outside `lib.reading` the three views took 1,041 ms alone and 955 ms in the whole file's run, so the test passed and failed by turns | The bound is 300 ms and the test is named for it: read as built it takes about 40 ms, read outside `lib.reading` 979 ms |
| A renewed edge dropping `selected` failed nothing | "a changed line is a new edge that keeps what React Flow set": `mount` renamed while selected |
| Rows wrapped to a box's grown width failed nothing: no box of the ten files is both grown wider and wrapped | "a box grown past its saved width still wraps its rows to the saved width", on a hand-made part def |

`adapter.test.mjs` has 22 tests. Noticed by the agent and left: `Look.childTop` is read by nothing until step 7; the
order of the compartments is held by the fixtures' test alone; a left port with no line has its name below its square
and a right one above, which is the old page's own.
