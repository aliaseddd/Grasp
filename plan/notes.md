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

### Step 6: the planes, built

**Built** by one agent in 12 min (85 tool calls), against the real adapter and the tests: the store, `Plane`, the card,
the three node components, `LineEdge`, the markers, 263 lines at the end of `app.css`, and the wiring (`ViewPanel` in
`Dock.tsx` renders `Plane` with the tab's own session; `App.tsx` puts the session's stores on `window.Grasp.views` and
renders the markers once). No colour was added to `theme.ts`, and none is written anywhere else. As it came:
`viewStore.test.mjs` 12 of 12, `open.test.mjs` 2 of 2, `plane.test.mjs` 16 of 17, `instant.test.mjs` 3 of 3, and "the
example shows its general view on a tab" passing under its todo mark.

It stopped on the 17th, as its brief told it to, and was right: **test 10's last assertion could not pass, and the
fault was the outline's.** The notes above say that six doc lines of the ten files are single words longer than their
box. They are not. My measurement counted the docs of every placed element, small shapes among them, which draw no
compartment: a fork 60 wide "overflowed" by 60 px. In the boxes that have compartments no row of the ten files is too
long: the tightest is "Moves fuel while commanded." in `interconnection.json`, 163 px of text in 174 px of room. So the
ten files exercise no ellipsis. The test now holds that none of their rows is cut, and exercises the rule on a part def
made for it, 120 wide, whose doc begins with a word of 45 letters: that row is cut and stays inside its box.

Where it read the contracts its own way, each kept:
- Each node file's exported component only hands `data`, `selected` and the size to a memoized inner one. React Flow
  calls the outer one at every move of a node; the inner one skips. `LineEdge` is built the same way, with its two
  `useInternalNode` results as the keys.
- The gate keeps one boolean in state, whether the root has a size, and reads the size itself where it is used (the
  camera as React Flow mounts, the fit button at a click). So a change of the window's size renders nothing. It also
  reads the size at once in a layout effect, so the tab in front mounts React Flow without waiting for the observer.
- `--grasp-node-tail` joins the other `--grasp-node-*` variables, for the 6 px under a compartment's last row.

**The switch of tab needed no lever.** Built the plain way, the three timed tests, run alone on the built page: the
page ready in 182 ms (limit 500), the example drawn 50.7 ms after the file is given (limit 1,000), a switch between
`interconnection.json`'s two tabs in 32.6 ms (limit 100), each by its median. Neither `width` and `height` on React
Flow nor `flushSync` in the observer was tried, since nothing called for them.

**Taken in.** On the adapter with the review's changes, the todo mark of check 2 taken off by my hand: `npm run check`
passes; `npm test` gives 135 tests, 130 pass, 0 fail, 5 todo, in 35 s, the timed tests among the others.

**Rows 15 apart, not 16: a departure from section 4 of the plan.** The first `example.png` showed what the
measurement had said: with a title row of 16 and rows 16 apart, `Page`'s third doc line ends 1 px above `hosts`, and
reads as sitting on it. The ten files were laid out by the old page, whose rows are 15 apart. `LOOK` now keeps the old
page's 15 and differs from `OLD_LOOK` in the title row alone (16 for 18): the third line ends 3.5 px above `hosts`,
`Host` is 137 high (139 on the old page), and no saved layout meets a compartment that the old page kept clear of.
Section 4 says "16 px apart"; the plan is not rewritten, and this is the place that says the page is built otherwise.
The adapter's test of the new measures is named for 15, and seven pinned sizes in its fixtures' test follow.

### Step 6: the planes' and the store's tests, each seen to fail with its thing broken

An agent, in a worktree (4.3 min, 39 tool calls), made each breakage the lists name, built the page, ran the test that
guards it, and put the source back: 17 rows of `plane.test.mjs`, one of `open.test.mjs`, 12 of `viewStore.test.mjs`.
26 of the 30 named tests failed under their breakage as worded. The four that did not:

| Row | Why the test still passed | What was done |
|---|---|---|
| plane 15, the inert handle left out of a far box | The test zoomed out from near, and a node that is already mounted keeps the handles its own object carries; only a node that mounts while far is measured from the DOM without them | The test now holds one `.grasp-node-handle.source.target` in every node, far and near, and leaves `interconnection.json`'s first view far, shows the other, and comes back: every line must still be drawn. Seen to fail with the handle left out of far boxes |
| store 4, subscribers told before the projection | Reordered literally (`tell(); refresh();`), a listener's own `getSnapshot()` projects the stale store, so it still reads the new snapshot | Nothing: telling before the store is even marked stale fails the test ("getSnapshot() inside the listener must already give the new snapshot"), and that is the fault the row means |
| store 6, `by: 'end'` treated as a change | The history sends an end with `views: []`, which the store's check of `told.views` already turns away; the line that asks `by === 'end'` is a second lock on the same door | Nothing: the line stays, as the contract's words; an end sent with `views: null` projecting is caught |
| store 12, a method reading `this` | The bundle the Node tests load runs sloppy, so a bare call's `this` is the global object and reads `undefined` without throwing | Nothing: a method that reads `this.session` fails the test |

Noticed by the agent and left: `camera()` called with no size and nothing remembered gives 100% at the origin without
remembering it; `nodesChanged` calls its subscribers without asking whether there are any.

### Step 6: committed, and what is still open

Committed at 135 tests, 130 pass, 0 fail, 5 todo; `npm run check` passes; check 2 is `"pass"` and `plan/status.json`
names step 6. Damon said the context was nearly full, so the step was folded and pushed before its last reviews were
closed. A later session must not take these as done:

- **`example.png`, by a reviewer that saw only the image and the plan's list** (on the image before the last change):
  7 of 8 items present. **Item 6, "three hollow triangles pointing at `Host`", is absent as worded**: the three
  specializations end at one point, `Host`'s bottom middle, as the old page's `elbow` puts them, so one triangle shows
  with three lines into it. Criterion 3 asks for every item. Damon's to decide: count the shared triangle, or spread
  lines that arrive at one point (a rule the old page does not have).
- **Its four scores: alignment and spacing 3, type and contrast 4, nothing cut off or overlapping 4, boxes and lines
  4.** Criterion 4 asks 4. The 3 names the example's own saved places (`hosts` 89 px from `Page`'s left and `app` 11
  from its right; `Host` and `App` of unequal height), which the page may not change, and two things it may: a 2 px
  step in the line from `hosts` to `Host`, and `mount` 30 px from its line. The step is gone: `Look.snap` (4; 0 in
  `OLD_LOOK`) draws an elbow whose ends are that little out of line as one straight stroke. `mount` keeps the old
  page's 30, which keeps it clear of the ports' names. The retaken image has not been rated.
- **The independent code review was still running** at the commit; its findings are not in.
- **Not done:** the timed tests' own breakages (alone); three runs of `npm test` in a row; what the other test files
  cost the timed tests; `Look.snap` has no test of its own; the worktrees under `.claude/worktrees/` and the local
  branch `wip/step-6` are not removed.

The method's log: test writers 2.7, 8.1 and 14.3 min; the adapter 4.3 min; the planes 12 min; breakage passes 2.8 and
4.3 min; the shell's look 3.7 min. Rework: one test, on a wrong claim of the outline's (mine); five weak or missing
tests found by the breakage passes, written by me. Nothing went back to an implementer.

### Step 6: the independent review, which came after the commit

A reviewer on this session's model, given the diff and the plan's step 6 and section 4 but not the outline, with its
scripts and screenshots in the session's scratchpad (gone with the container). The five test files passed for it, 56
of 56. **None of these is fixed.** Each was reproduced in the built page unless it says otherwise.

1. **Step 8's pan limit will not hold with the minimap drawn.** `scale.test.mjs` at this commit: a pan step of 21,
   17.5 and 30 ms for the three views, against 16. On scratch builds, by the median of 5 rounds (definitions,
   deployment, workflows): as built 14.7, 13.6, 34.7 ms; without `<MiniMap>` 11.0, 9.8, 25.6; without it and with no
   lines while far 8.4, 7.2, 14.7; with it and no lines while far, workflows 18.8. The time is React Flow's
   subscriptions per node and per edge; `app.js` takes 0.4 ms a step. So step 8 needs both levers: a minimap of our
   own, which session 17 kept in reserve, and no lines below 25%.
2. **A floated tab shows nothing usable.** Dockview passes the plane through 100 by 244 px, where a view never shown is
   fitted, at 2%, for good; one shown before keeps the big tab's camera and draws no node. Fit then gives 3.8%, since
   `FIT_PAD` and `FIT_BAND` keep 228 of 244 px free whatever the plane's size.
3. **Under about 256 px of width the minimap covers the zoom and fit buttons.** At 800 by 600 in a fresh browser the
   plane is 168 px wide; the example opens there at 6%, and at 1024 by 700 at 22%, as wordless outlines.
4. After a split or a change of the window's size the view stays cut off until Fit is clicked: the contract's "a
   later change of size fits nothing", reported for judging.
5. **A port's name takes no click**, and a click on it clears the selection (`.grasp-port-svg` takes no pointer); the
   square is 8.7 px at the fitted zoom.
6. **The scale test's drag check passes with no dragging built** (4.0 ms): the press pans, and the test only asks
   where the box is on screen. Step 7 or 8 takes its todo mark off and must make it fail first.
7. The build defines `NODE_ENV` as production, which strips React's and React Flow's warnings, so "nothing logged"
   cannot see them. A development copy logged nothing in the same scenarios: a blind spot, not a fault.
8. The three control buttons show the browser's focus ring, not the theme's teal one.

What held up: tabs switched, closed and shown again; eleven files opened over one another and the same one twice,
with sessions, stores and planes all collected and no listener left; the first fit in 7 window sizes; both zoom
limits; far and near at exactly 25%; clicks on a box, a nested box, a port, a line, a label and the ground; the
5,000-element model opening in 0.56 s with every node and edge drawn, none of the application's components rendering
on a pan and nothing projected. A switch of tab there takes 0.5 to 1.4 s, and crossing 25% one frame of 85 to 130 ms.

### For the next session

- Damon's word on `example.png`'s item 6 (one shared triangle, or lines spread), then the retaken image rated.
- Faults 2, 3, 5 and 8 above are step 6's to fix: fit margins that follow the plane's size, a refit when a view was
  fitted into less than it is shown in, a minimap that gives way in a narrow plane, a port's name that takes the
  click, the teal ring on the controls. 1 and 6 belong to steps 8 and 7.
- A test of `Look.snap`; the timed tests' breakages; three runs of `npm test` in a row.
- Pull request #46 carries the branch.
## Session 21, November 13, 2026: step 6 closed

On `claude/pensive-rubin-sjrv3g`. The baseline, in this container (Node 22.23.4): `npm ci` 13 s; `npm run check` passes;
`npm test` gives 135 tests, 130 pass, 0 fail, 5 todo, in 35 s, as session 20 left it.

### The branch: step 6 was merged into main and reverted there

Pull request #46 merged this branch into `main` at 08:05 UTC, a minute after session 20's last commit (`fdcfb64`),
while step 6 still had its reviews open; pull request #47 reverted the merge at 08:06. So `main` (`488d11d`) holds
`fdcfb64` in its history and none of step 6 in its files, session 20's notes among them. A later merge of this branch
would then leave step 6's files out, since `main` counts `fdcfb64` as merged. The branch is therefore moved forward onto
`main` (a fast-forward, nothing rewritten) and one commit, `e191ddf`, reverts the revert: its tree is `fdcfb64`'s, byte
for byte. The session's work is on top of it, and the branch's difference from `main` is the whole of step 6.

A worktree an agent is given by the harness (`isolation: worktree`) is made from `main`, not from this branch: the
first agent of the session found no step 6 in its worktree, and stopped. A worktree for an agent is made by hand, from
the branch's commit (`git worktree add --detach <path> <commit>`, outside the repository's folder), and removed after.

### What Damon decided

Asked on November 13, with the retaken `example.png` rated by a reviewer that saw only the image and its list:

1. **Item 6 of `example.png`'s list, "three hollow triangles pointing at `Host`".** The shared triangle counts. The
   three specializations are drawn as the old page draws them, three lines that join into one trunk with one hollow
   triangle at `Host`'s bottom middle, and the item is read as "the three specializations end in a hollow triangle at
   `Host`". No rule spreads lines that arrive at one point. `plan/slice-1.md` is not rewritten; this is the place that
   says how the item is read.
2. **The score of 3 for alignment and spacing.** Doc text is wrapped by Roboto's real widths now, not by the old
   page's count of characters; the image is rated once more, that score is recorded, and step 6 closes. The routing
   of lines and the places of a connection's name and of the ports' names stay the old page's.

### The outline: a compartment's rows wrapped by the font's own widths

A departure from session 17's design ("Compartment text is wrapped in the adapter by character count, as `graphLayout`
does") and from session 20's finding ("So the old page's counts are kept"), on Damon's word. What stays of that design:
a box's height is known without the DOM, in Node as in the page, and a row is plain text.

- **`canvas/app/src/core/roboto.ts`** holds Roboto regular's advance width for each of the 230 characters the page's
  font file draws, in units of 1/2048 em, and `textWidth(text, px)`, their sum; a character the file has no glyph
  for counts one em. It is written by **`canvas/app/test/roboto-widths.mjs`** (`node canvas/app/test/roboto-widths.mjs`,
  2 s; `--check` fails when the file is not what the font gives), which opens the built page and asks Chromium for
  each width at a font size of 2048 px with kerning off. Neither file is in the plan's list.
- **Why a table is exact.** Measured in this Chromium at device scales 1, 1.25, 1.5 and 2, plain and under a scaled
  transform, on seven lines of 37 to 212 characters: with `font-kerning: none` a line's width in the page is the sum
  of the font's widths to a hundredth of a pixel (1130.53 for the 212 characters of `Page`'s first two doc lines);
  with kerning on it is 1.3 px less there, and 11 px less on a line of `AV`, `To` and `We`. So the rows are drawn
  with kerning and ligatures off. A plane's zoom is a transform, which lays text out at 12 px whatever the zoom.
- **What is not known.** Whether Chrome on Windows at 100% rounds each character's width to a whole pixel, as it once
  did. So a row's right padding in the page is 4 px, not the 12 the wrap leaves: a row up to 8 px longer than the
  table says is still drawn whole.
- **`Look.rowType`**, 12 in `LOOK` and 0 in `OLD_LOOK`: the size of a row's text, or 0 for the old page's counts.
  `rowRoom(look, width)` is the room of a row: the box's saved width less `pad` at each side, at least `ROW_LEAST`
  (56, the room of the narrowest box). Rule 2 of `project()`'s comment says how a doc, a send or accept, and a code
  link are fitted.

The tests, written before the rule is built (today `LOOK` still wraps by the count, so each fails for that):

| # | Test | The breakage that must fail it |
|---|---|---|
| `adapter.test.mjs` 1 | a compartment's rows are as long as the box's saved width allows, by Roboto's widths: over the eleven views, no row of two words or more is wider than its room, no row could take the next row's first word, and the rows hold the text's words in order | `LOOK` wrapping by the count of characters |
| 2 | a word wider than its box stands on a row by itself; a blank line is an empty row; the room is never under 56 | the least room left out |
| 3 | a character the font does not draw counts one em | an unknown character counted as nothing |
| 4 | a code link too wide for its box keeps the longest tail that fits behind `…` | the path cut by a count of characters |
| 5 | `textWidth` is the sum of the font's widths | a width halved |
| 6 | given the old page's measures, rows are still wrapped by the old page's counts (the two tests of the old layout, which stand) | `OLD_LOOK` given `rowType` 12 |
| `plane.test.mjs` 1 | a row is as wide in the page as the adapter measured it, and ends `pad` short of its box's side or sooner | `font-kerning: none` taken out of `app.css` |
| 2 | the table of widths is what the page's font gives | a width changed in `roboto.ts` |

**The tests, written** by one agent in a worktree at the outline's commit (6.1 min, 33 tool calls), while the rule was
built apart from it, by my hand: `wrapWidth` and `fitTail` in `adapter.ts`, 40 lines, and four lines of `app.css`.
Against the outline, 9 tests failed for the count, or for kerning still on. The rest passed, as they must: the table
is final, so `textWidth`'s test and the table's own are checked by breaking a width, and the two tests of the old
layout stand (given `rowType` 12, `OLD_LOOK` fails both). The writer checked its tests against a throwaway rule of its own; taken into the
main tree they met mine for the first time: `adapter.test.mjs` 28 of 28, `plane.test.mjs` 19 of 19. Two rules written
apart agree on every row of the eleven views.

- Four existing tests pinned the count under `LOOK` and are restated by the contract: the rows' distance (`Host` is
  now its saved 130 high with a doc of 4 rows, where the count gave 5 rows and 137; a box made for the test shows
  the title row, 107 high against the old measures' 109), the box grown past its saved width, what the example's
  boxes say (the rows of `Page` and `Host` pinned as text, worked out by the writer's own greedy wrap), and the
  fixtures' rows. The narrow limits of 12, 10 and 8 characters are the old page's, and are now tested under
  `OLD_LOOK`.
- `Page`'s doc is 2 rows where it was 3, its first row 734.67 px in a room of 736; `StrongholdApp`'s is 1.
- "At least the path's last character" cannot be reached at 12 px, where `…` and two characters always fit 56 px:
  its test gives a look of its own, `rowType` 36.
- `lib.normalize` lifts a saved width to 80, so the least room is tested on a layout changed after it.

### What the reviews found, and what was done

Three readings of step 6 came in this session: session 20's own reviewer, whose eight findings that session wrote
down above ("Step 6: the independent review") from a container that still ran; a second reviewer of this session, on
the same model, given the diff and the files' own contracts (16 min, 51 tool calls); and the reviewer of
`example.png`. The second found no wrong drawing for a model the library has normalized.

| Finding | From | What was done |
|---|---|---|
| A view fitted into a small plane stays tiny: a floated tab passes through 100 by 244, a pane 208 high has no room at all, and the margins keep 228 px free whatever the plane's size | both | `fitMargins(width, height)`: `pad` is 48 or a twelfth of the plane's smaller side, whichever is less; `band` is 180 only where the minimap is shown, else `pad`. `store.sized(width, height)`: a view that is still as fitted is fitted again when its plane's size changes; one somebody has panned or zoomed stays, until Fit. A floated tab of 298 by 244 now shows the whole example, at 21.9% |
| After a split or a change of the window's size the view stays cut off | session 20 | the same `sized`: a fitted view follows its plane. The contract's "a later change of size fits nothing" is gone |
| Under 256 px of width the minimap covers the zoom buttons | session 20 | `hasMinimap(width, height)`: only in a plane at least 480 by 480 |
| A port's name takes no click, and a click on it lets the selection go | session 20 | a border item's name and a small node's name take the pointer; a click selects their node |
| The control buttons show the browser's focus ring | session 20 | the theme's ring, inside the button |
| A name or a label leaves the plane while still in the window: React Flow culls a node by its own rectangle and a line by its two nodes', with no margin, and a port's name, a control node's name and a line's label stand outside those | this session | a view is culled only when it has more than 300 nodes (`CULL_OVER` in `Plane.tsx`). A larger view, near, still loses a name at the window's edge a moment early: React Flow has no margin to give |
| `Plane` read `store.drawn` once: a view whose kind changes, or that leaves the model, kept an empty React Flow | this session | `store.watch(listener)`, called when `drawn` changes; it does not make a store live, so a hidden tab still costs nothing |
| One store's projection throwing kept the session's other stores from hearing the change | this session | each store hears it; the first error goes on to the history, which reports it. A place that is not an object is no longer read (`layout[id] = null` threw) |
| Shift with a drag drew React Flow's selection rectangle, which then lay over the boxes and took their clicks | this session | `selectionKeyCode={null}` until step 9 gives the marquee its meaning |
| A press that moved 2 px before its release panned and selected nothing | this session | `paneClickDistance={4}`. The view still moves those pixels: a press on a box pans the ground until step 7 |
| A bullseye saved with no size logged two errors (a negative radius) | this session | the radii are never under 0. No test: `normalize` gives every place a size, so no file reaches it |
| Rule 1 said "one node for each element the layout places" and the code, like the old page, leaves several out | this session | the rule now names them |

Left as they are, and why. **To step 8:** the pan limit does not hold with the minimap drawn (session 20's
measurements). **To step 7:** the scale test's drag check passes with nothing dragged, so step 7 must see it fail
first. **Known and kept:** the build defines `NODE_ENV` as production, so React's and React Flow's own warnings cannot
be seen by "nothing logged"; a selection is lost when a view is removed and the removal undone; a view whose first
fit is far projects twice as it mounts; a store whose projection throws shows what it showed until the next change
(it is not asked again at the next read, which is React's render, where a throw takes the page down); in a plane too
small for the minimap the zoom buttons stand over a fitted view's bottom left corner.

Tried and put back: the reviewer's "set `stale` only after `project` returns". A stale store is projected at every
read, and React reads in its render.

### `example.png`, rated

Each time by a fresh reviewer given the image and its list and nothing else, the list as eight items.

| Image | Items present | Alignment and spacing | Type and contrast | Nothing cut off or overlapping | Boxes and lines easy to read |
|---|---|---|---|---|---|
| As session 20 left it (rows by the count, `snap` in) | 7 of 8: item 6 absent as worded, one shared triangle | 3 | 4 | 4 | 4 |
| With rows by the font's widths, item 6 read as Damon decided | 8 of 8 | 4 | 4 | 5 | 4 |

So criteria 3 and 4 hold for `example.png` at step 6. The first reviewer's 3 named, of the page's own doing: doc text
that ends up to 115 px short of its box, `mount` 25 px under its line with the two ports' names above and below it,
the `doc` title 2 px under its rule, the turn in the line from `app` to `App`, and the view not centred down the
plane (the band the minimap stands in). The second still names `mount` and the ports' names first, then the two dots
of a defined-by line (about 2 px on screen at 92.6%), the `doc` title, the grey of the keywords and of the strips'
names, and the minimap 15 px from `DevHost`. Those are kept for slice 7, with session 20's list for `shell.png`.

### The review's fixes: tests, each seen to fail

The fixes were built by my hand, each smaller than its brief, in `adapter.ts`, `viewStore.ts`, `Plane.tsx`,
`SmallNode.tsx` and `app.css`. Their tests were written by two agents, each in a worktree of its own, in new files so that no two
writers shared one.

**`fit.test.mjs` (Node, 5) and `small.test.mjs` (the page, 5)**, written against stubs before the fixes existed (3.7
min, 22 tool calls); all ten failed on the stubs for the reason listed, and passed against my fixes when the two met.

| Test | Failed before the fix with |
|---|---|
| a fitted view's margins follow its plane | the pad 48 and the band 180 whatever the size |
| a view fitted into any plane lies inside it, clear of its margins | the bounds pushed out of the small planes |
| a view still as fitted is fitted again when its plane's size changes | `sized` giving nothing |
| a view somebody has placed stays when its plane's size changes, until it is fitted again | the same; and with `moved` never marking the view as placed |
| a refit that crosses 25% tells the plane, far or near | no refit, no far snapshot |
| a view nobody has moved follows its plane's size | the zoom staying at 54.4% when the sides collapse, not 92.6% |
| a view somebody has panned stays where it was put when its plane's size changes | after Fit, the view not following again |
| a narrow plane has no minimap, and a wide one has | the minimap always drawn |
| a click on a port's name selects the port, and on a control node's name the node | nothing selected |
| the zoom buttons and the fit button show the theme's focus ring | the browser's ring |

One existing test changed: the adapter's test of `fit` took 90 by 828 and four more windows for ones with no room,
which they no longer are; it now takes windows with no side, or too small for 2%.

**`sturdy.test.mjs` (Node, 3) and `gestures.test.mjs` (the page, 5)**, written after the fixes, so each was seen to
fail the other way round, with its fix broken (3.8 min, 20 tool calls). All eight passed as built and failed broken:

| Test | Its fix broken | Failed with |
|---|---|---|
| a place that is not an object places nothing and throws nothing | the check of the place taken out of `build()` | "Cannot read properties of null (reading 'w')" |
| a store whose projection throws does not keep the session's other stores from hearing the change | the try around each store's hearing taken out | "The other view's subscriber must be called once although v-ic's projection threw before it." |
| a watcher is told when its view stops being drawn, and watching does not make the store live | the watchers never called; `watch` adding to the subscribers | "A view that becomes a kind no plane draws must call its watcher once."; "A rename must call no watcher." |
| a name outside its node stays drawn while its node is just outside the plane | every view culled | "The node of System.tank.fuelOut left the document … while its name, 93 px wide, is still partly inside it." |
| a view of thousands of nodes mounts only what its window shows | `CULL_OVER` a thousand million | "mounts 1544 of the 1544 nodes the view places" |
| Shift with a drag draws no rectangle and leaves nothing over the boxes | `selectionKeyCode` left at React Flow's | "the plane draws a selection rectangle" |
| a press that moves 3 px before its release still selects the box | `paneClickDistance` left at React Flow's | "did not select the box" |
| a hidden tab's body is out of the document and holds no React Flow | the gate mounting whatever the size | "The plane of a hidden tab, out of the document, still holds 1 React Flow." |

The last is the test the second reviewer asked for: `plane.test.mjs`'s "a tab that is hidden holds no React Flow"
counts nodes through the document, which a hidden tab's body has left, so it passes with or without the gate. The
stores hear the history in the order they were made, so the second test makes the failing view's store first, and
says so.

### What session 20 left not done, done

- **`Look.snap` has a test**: "an elbow whose ends are no more than `snap` out of line is one straight stroke, at the
  far end's centre", over the four directions at 1, 2 and 4 px out of line, the step at 4.5 and 5, the old page's
  measures, and the example's line from `hosts` to `Host`. Seen to fail with `snap` ignored, and with `<` for `<=`.
  The rule changes seven lines of the ten files, two of them in `behavior-actions.json`.
- **The timed tests' own breakages**, by an agent in a worktree (1.9 min): 600 ms of work before the first render
  gives 803.5 ms against 500; a second's wait before the first projection 1,056.2 ms against 1,000; 120 ms of work
  as a plane mounts 149.5 ms against 100. Each failed its own test and no other. The second fails by the 50 ms the
  drawing takes: a wait of 950 ms would pass.
- **What the other test files cost the timed tests.** The three tests now say their median and samples as a `#` line
  of the runner's output. By the median of three runs, with nothing else running on the machine:

  | | Limit | Alone (`node --test canvas/app/test/instant.test.mjs`) | In `npm test` |
  |---|---|---|---|
  | The page is ready | 500 ms | 208.5 ms | 238.5 ms |
  | The example is drawn | 1,000 ms | 49.8 ms | 77.1 ms |
  | A switch of tab | 100 ms | 33.7 ms | 35.1 ms |

  So the files go on running side by side, and `package.json` does not change.
- **Three runs of `npm test` in a row**, at the step's last code: 161 tests, 156 pass, 0 fail, 5 todo each, in 41, 38
  and 39 s. The suite was 135 tests when the session began; the 26 more are 1 for `snap`, 7 for the wrap, 10 for
  session 20's review and 8 for this session's.
- The worktrees and the local branch `wip/step-6` went with session 20's container.
- **The step's last commit by itself** (criterion 7): `b1f5bba`, checked out into a new worktree, passes `npm ci &&
  npm run check && npm test` with 161 tests, 156 pass, 0 fail, 5 todo; `plan/status.json` names step 6 and has 5
  checks still `"todo"`. This entry's own commit comes after it and changes only this file.

### For the next session

- Step 7, from `plan/slice-1.md` and session 17's design ("The four steps"). Nothing waits for Damon.
- Before step 7 takes the todo mark off "a drag step takes under 16 ms at 5,000 elements", it must see that test
  fail: today it passes with nothing dragged (session 20's review, item 6).
- Step 7 makes boxes draggable: `paneClickDistance` and the 2 or 3 px a press still pans can then go, and a drag's
  steps must leave a view "as fitted" or not on purpose (`store.sized` reads only what `moved` was told).
- Step 8 needs both levers session 20 measured: a minimap of our own, and no lines below 25%.
- Step 9 turns the marquee on: `selectionKeyCode` is `null` until then.
- If `@fontsource/roboto` changes version, `node canvas/app/test/roboto-widths.mjs` writes the table again; a test
  fails until it does.
- The branch is one commit of history ahead of what `main` reverted (`e191ddf`), then this session's commits. No
  pull request is open: #46 was merged and reverted. A new one carries the whole of step 6.

The method's log, this session: three test writers (6.1, 3.7 and 3.8 min), one breakage pass (1.9 min), two reviewers
of the image (2.1 and 2.2 min) and one of the code (16 min); every fix and the wrap's rule written by me. Rework:
none went back to an agent. One agent was sent out three times before it could start, on a worktree made from `main`.

## Session 22, November 13, 2026: step 7 of slice 1, moving, resizing, undo, redo and save

On `claude/charming-archimedes-i2vi31`, from `964ffb2` (main, with step 6 merged by pull request #48). Damon's word:
"Execute step 7. Parallelize the work whenever possible." The method is session 17's, as session 20 tightened it.

The baseline, in this container (Node 22.23.4, `node_modules` present): `npm run check` passes; `npm test` gives 161
tests, 156 pass, 0 fail, 5 todo, in 39 s.

### Step 7: the outline

The contracts are in the files, as comments over bodies that throw; nothing calls them yet, so the page is the one
step 6 left:

- `core/adapter.ts`: `Ask` (a `move` to a position, or a `resize` to a position and size, in React Flow's numbers),
  `Placed`, `placesFor(lib, model, view, start, asks)` with its seven rules, and `project()`'s `places` option (rule
  7), so that a gesture's step is drawn by the very rules that draw the model its end writes. `describe` joins the
  library's declared names. Session 17 named `withAsks` and `placeOf`; one function that gives places, and project()
  reading them, says the same with no second copy of the layout.
- `plane/viewStore.ts`: a gesture's steps and its end. Nothing is written during a gesture; the end is one
  `history.edit()` with key null, writing only the keys that differ. An undo heard mid-gesture ends the gesture
  unwritten.
- `plane/Plane.tsx`: nodes draggable, `deleteKeyCode={null}`. `plane/nodes/BoxNode.tsx`: NodeResizer while selected
  and near, with the kind's least size and no callbacks.
- `shell/TopBar.tsx`: Save, Undo, Redo and the keys, `onSave`. `shell/App.tsx`: Save, its failure in the Alert, and
  the question before Open loses changes. `core/files.ts`: `LOSE_QUESTION`, `askBeforeLeaving`.

The rules a gesture keeps, from the old page's graph renderer (`drawing.js`, `dragStart`, `drag`, `drop`;
`layout.js`, `nearestBorder`): a nested box no further left than 12 or up than 48 from its owner's corner, the owner
growing by the layout's own rule; a port to its owner's nearest border, `at` clamped to 0.05 .. 0.95 and rounded to
0.01; a resize held at the kind's least, at what the box holds at its new width, and at 4000, with the side not
dragged kept where it was. The old page has no resize by handles; its words are kept: "Moved part def Host", "Moved
port api in hosts to the right side", and "Resized part def Host" beside them.

### The order of work, by what blocks what

| # | Task | Who | Needs | Beside |
|---|---|---|---|---|
| O | The outline, committed and pushed | me | | |
| A | `placesFor` and `project()`'s `places` | agent | O | N, B1, B2, S |
| N | Node tests: `adapter.test.mjs` (the seven rules; a gesture's layout is the projection of what its end writes), `viewStore.test.mjs` (a gesture in the store) | agent | O | A, B1, B2, S |
| B1 | `move.test.mjs`, and the `nodes` row of `shots.mjs` | agent | O | A, N, B2, S |
| B2 | `resize.test.mjs` (the todo mark off; a save through a stubbed picker's handle), `keys.test.mjs`, the example's drag step in `instant.test.mjs`, and the scale test's drag made to fail with nothing dragged | agent | O | A, N, B1, S |
| S | The bar, Save, the keys and the questions: `TopBar.tsx`, `App.tsx`, `files.ts` | agent | O | A, N, B1, B2 |
| P | The gesture half of the store, the planes' props, NodeResizer and its look | agent | A taken in, the tests seen to fail | |
| R, F, C, E | Reviews, fixes, the checks alone, the commit | me, agents | P | |

The tests are seen to fail at O, where nothing is draggable and the bar's three buttons are disabled; S and A run
beside the test writers, so P is the only implementer that waits, and it waits for A alone. `keys.test.mjs` is a
file the plan does not name: the keys and the questions are the bar's, not a gesture's, and a second writer on
`move.test.mjs` would have owned one file with another.

### Step 7: the tests, written first, and the first two implementers

Five agents (Sonnet, medium effort), each in a worktree at the outline, `695a789`, all at once: the adapter's
`placesFor` (2.1 min), the bar (2.3 min), and three test writers (4.0, 4.4 and 5.1 min). Their commits were taken
into a local branch, `wip/step-7`, never pushed, from which the planes' implementer started. Two of five worktrees were
made from `main`, not from the outline, and their agents moved them back as the brief told them to.

Each new test was run at the outline and failed for want of what it checks:

| File | Tests | At the outline, they fail with |
|---|---|---|
| `adapter.test.mjs`, "placesFor: a gesture's places" | 16 | "placesFor: step 7 builds it" |
| `viewStore.test.mjs`, "a gesture in the store" | 8 | the store ignores the change: "A step of a drag must give a new snapshot.", "The end of a drag must write one undo step.", and the like |
| `move.test.mjs` | 9 | 8: "A drag of Host by its header did not move a box: it panned the plane by 80 x 40 px (a node is not draggable).", "Host, selected, shows no resize controls", "... no resize handle at its top left corner" |
| `resize.test.mjs` | 2 | check 5, its todo mark taken off, and the save through a stubbed picker's handle: "Host, selected, shows no resize handle at its bottom right corner" |
| `keys.test.mjs` | 6 | "After a drag of Host, Save, Undo and Redo are enabled as {save: false, undo: false, redo: false}", and "A drag of Host ... did not move it against App" |
| `instant.test.mjs`, "a drag step of the example takes under 16 ms" | 1 | "Host's offset from App changed by -0.0 by 0.0 px: the drag did not move Host against App" |

- **"Backspace and Delete remove nothing"** passes at the outline, where nothing removes anything. It is checked the
  other way round, by giving React Flow its Delete key back.
- **The scale test's drag** (check 8, still todo until step 8) now asks that the box moved against a neighbour that
  was not dragged. At the outline it fails, as a todo, with "Against Store81, which was not dragged, it went 0.0 by
  0.0 px: a plane that pans takes both." Session 20's review found it passing with nothing dragged.
- A press on a box pans the plane at the outline, so each browser test that drags measures the box against another
  one, or against its owner, and none can pass on a pan.
- The adapter's 16 tests and its implementer worked from the same contract without seeing each other's work; all 16
  passed at the first run against it, the hand-worked numbers included (Host resized to 200 wide is 182 high, its 8
  rows of doc at that width; from the top left to 100 by 30 it is held at 80 by 377, its corner at 400, 530 kept).
- Two of the store's tests were mine to correct, to what React Flow 12.10.2 sends (NodeResizer, in
  `@xyflow/react`'s `dist/esm/index.mjs`): a top or left handle's position comes with no `dragging` key, beside the
  resizing dimensions; and a position with no `dragging` and no resize beside it is no gesture. Step 6's "a change
  that is not a selection changes nothing" sent a position with `dragging: true`, which step 7 makes a gesture: its
  position line now has no `dragging`.
- `helpers.mjs` gained one option: `openPage(browser, { dialog })`, a handler for the browser's dialogs, accepting
  them as before unless given (the Open question's Cancel needs a dismiss).

What the two first implementers decided where the contract was silent:
- `placesFor`, rule 4: the edges kept are the drawn ones (position + drawn size), a handle counts as dragged on an
  axis whose position differs from the start, the width is held before the compartments are wrapped at it and the
  height held after, and the owner's 12 and 48 apply only on an axis whose handle was dragged, so a resize by the
  bottom right never changes a saved x or y.
- The bar: one `keydown` listener in `TopBar`, per session. Ctrl or ⌘ + Z that acts prevents the browser's default
  even with nothing to undo; Ctrl or ⌘ + S with no file open prevents it and does nothing. The confirm before Open
  leaves the click's user activation for the file input, seen in a probe.

### Step 7: the planes' gestures, built

One agent (Sonnet, medium, 7.3 min) from `wip/step-7` with every test of the step in it: the gesture half of
`viewStore.ts`, the planes' props, NodeResizer, and the controls' look. `npm test` with it: 203 tests, 199 pass, 0
fail, 4 todo. No test file changed. Beyond the outline, three props of `Plane.tsx`, each because a test failed without
it, each in the contract's comment:
- `nodeDragThreshold={0}`: with React Flow's 1 px a drag's tracking starts at the first move, and the box trailed the
  pointer by that move all the way (76 of 86.4 units in the first move test).
- `selectNodesOnDrag={false}` with `nodeClickDistance` 4: otherwise a press dragged 12 px selected the box, and step
  6's gestures test asks that it select nothing.
- `autoPanOnNodeDrag={false}`: a nested box dragged toward the plane's edge panned the plane under it.
- `paneClickDistance` stays: a press on the ground still pans, and a click that slips must still clear the selection.

**"Backspace and Delete remove nothing", checked the other way round**, in a scratch worktree: with
`deleteKeyCode={null}` taken out it still passed, since the store takes no `remove` from React Flow either; with the
store also dropping the nodes React Flow removes, it failed: "Backspace removed Host from the plane." Two locks, and
the test sees through both.

**`canvas/check.sh` on a file the new page saved** (a probe: the example opened through the file input, Host dragged,
Page resized by its bottom right handle, Save): `ok ... (Package StrongholdProof)`. The file held Host at x 124, y 455
and Page at 899 by 352.

### `nodes.png`, looked at twice

The first, of the example, by a reviewer that saw only the image and the list: 4 of 6 present. Absent: **the four
side handles**, which React Flow draws as 1 px lines along the sides, lost under the selected box's 2 px outline; and
**a port with its arrow**, because none of the example's four ports has a direction (their kind's glyph hook gives
null for each), so the page rightly draws none. So:
- Each side's control keeps its line, which takes the pointer along the whole side, and gains a mark at its middle, a
  teal bar 16 by 6 px with a white edge, as the corners have their round handles (`app.css`).
- The shot is taken in the interconnection fixture's view `v-ic`, whose ports have directions: at 150%, CtrlLink's
  corner kept 60 px in, the part def Tank selected (its doc, the item `stored` inside it), the part `pump` in System
  below with its four ports.

The second, by a fresh reviewer on the retaken image: **6 of 6 present**: the zoom (judged from the dots' spacing,
30 px), Tank selected, its doc, eight handles (four round at the corners, a bar at each side's middle), `pump`'s round
corners, the ports' arrows (↓, ↔, ←). It also saw two things that are not step 7's: the dark line under the tab bar
running past the tab in front, and a flow's filled head touching the port square it ends at. The rest it named is cut
by the plane's edge.

### Step 7: the independent review

A reviewer on this session's model (8.6 min, 48 tool calls), given the diff and the plan's step 7 but not the
outline, its probes in its own scratch folder. Four defects, all reproduced in the built page:

1. **A click on a box that slips 2 or 3 px wrote "Moved part def Host"**, x 32 to 35, and so an unsaved file and a
   question at reload. The old page began a drag only after 4 px (`pointing.js` 117). With `nodeDragThreshold` 0, every
   press is a drag to React Flow.
2. **An undo in the middle of a drag did not cancel it.** The store dropped the gesture, and the drag's next step
   began a new one, which its release wrote; the redo list was lost. In a resize the undone size came back, since
   React Flow's resizer works from the size it began with.
3. **The browser's confirm before Open spends the click's user activation**: answered after 6 s, no chooser opens and
   nothing is said (with the picker, "Must be handling a user gesture to show a file picker.").
4. **A write refused through a file handle left the writable open**, neither aborted nor closed.

And four smaller: `keys.test.mjs`'s Ctrl + S waited for its download by frames and failed under load; the status file
still had check 5 as todo; the port's test checked only what is drawn, and the least size of a top left resize only
`>= 40`; zooming across 25% in mid-drag showed the dragged box at its model place for a frame.

What held up, by its probes: a box dragged with its owner selected moves the owner only; three boxes are one step; a
nested part's port slides and changes side by `nearestBorder`; a nested box resized from the top left into its
owner's corner stops at 12, 48 with its right and bottom edges kept; undo and redo of a resize put the port back; no
handles in the far form; no node left `dragging`; the keys; NodeResizer's props stable; nothing logged.

### What the review found, fixed

Two agents (Sonnet, high effort, as rework goes), each in a worktree, at once: the planes (6.4 min) and the bar with
the files (28 min, most of it on the flaky download). Each test written first and seen to fail on the code before:

| Fix | Test | Failed before with |
|---|---|---|
| A drag or a resize is no gesture until the pointer has gone 4 screen px (`CLICK_DISTANCE`, now the store's) from the press; until then it draws and writes nothing | `move.test.mjs` "a click that slips a few pixels moves nothing"; `viewStore.test.mjs`, two; `gestures.test.mjs`'s 3 px press also asks that Undo stay disabled | "A press that slipped 3 px moved Host by 2.8 x 0.0 px against App." |
| A history change heard mid-gesture cancels it: the snapshot is the model's, and the gesture's later steps are ignored until its end, which writes nothing | `move.test.mjs` "an undo by the keyboard in the middle of a drag cancels the drag"; `viewStore.test.mjs`, a drag and a resize, with steps between the undo and the end | "Host is 130.0 x 43.0 units from where it was: the drag that an undo interrupted was written." |
| Crossing 25% mid-drag projects with the gesture's places | `viewStore.test.mjs` | "A far projection during a drag must keep Host where the drag put it." |
| Open's question is an in-page MUI dialog ("Cancel", "Open another"), whose own click opens the chooser | `keys.test.mjs`, with the dialog up 6 s before "Open another" | "Open, with unsaved changes, showed no dialog (role "dialog") before taking another file." |
| A refused write aborts its writable | `resize.test.mjs` "a save that the browser refuses says so and leaves the file unsaved" | "a refused write aborts its writable once and does not close it" (aborted 0) |

- **The port's test** now saves and reads `{ side: 'bottom', at }` from the file, and Undo's words; **the top left
  resize's least** is Host's 80 wide. Both passed before: they ask more of what was right.
- **The flaky Ctrl + S was not the wait.** The downloads are now waited for by the clock, and still about 6 runs in
  100 lost theirs: the page was clean, so `saveFile` had run, and no download came in 20 s. Chromium now and then drops
  a download started inside the keydown's own task. `App` now runs Save a task later (`setTimeout` 0): 0 lost in 240
  runs, against about 8 in 160. The deferral is in `App`, not in `download()`, which `files.test.mjs` asks to click
  before `saveFile` resolves. A task later is well inside the click's user activation, which writing through a picked
  file's handle may ask for.
- **Departs from session 17's design:** "both questions are the browser's own". The one before leaving still is
  (`beforeunload`); the one before Open is the page's, for the reason above.

### Step 7: the checks, alone

- `npm run check` passes. `npm test`, three runs in a row with nothing else running: 210 tests, 206 pass, 0 fail, 4
  todo, in 47, 46 and 46 s. Four checks are `"todo"` in `plan/status.json`, as the runner's `# todo` says.
- **Criterion 6's drag step** of the example ("a drag step of the example takes under 16 ms", `instant.test.mjs`): by
  the median of 9 samples, 4.1, 4.6 and 4.1 ms alone (`node --test canvas/app/test/instant.test.mjs`), 7.7 ms in
  `npm test`.
- **For step 8**: "a drag step takes under 16 ms at 5,000 elements" (todo), now that a drag moves the box, alone:
  "1.5 ms when it starts a drag and 23.6 ms when it follows one, by the median". The first step is under the 4 px, so
  it draws nothing; a step that follows projects the general view's 1,544 places with the gesture's: placesFor runs
  over the start, but project() reads the view whole. Session 17 kept the lever: a step that lays out only over the
  numbers the projection holds.
- `nodes.png` is retaken with the fixes; the look did not change.

### For the next session

- Step 8, from `plan/slice-1.md` and session 17's design. It has the drag test's numbers above to start from, and the
  pan test's from session 20's review (the minimap of our own, no lines below 25%).
- The two things the second image reviewer saw are not step 7's: the dark line under the tab bar past the tab in front,
  and a flow's head touching its port's square.
- Pull request #49 (aliaseddd/Grasp) carries the branch: the outline, `695a789`, and the step, one commit on
  `claude/charming-archimedes-i2vi31`.

The method's log, this session: test writers 4.0, 4.4 and 5.1 min; implementers 2.1 (adapter), 2.3 (bar) and 7.3
(planes); reviewers of the image 0.7 and 0.5, of the code 8.6; rework 6.4 and 28. Rework, by whose fault: the review's
two serious defects were the outline's, which did not say that a press is not yet a drag, nor what an undo's later
steps do; the dropped download and the confirm's user activation were not in the outline either. Two store tests and
the shot's view were mine to correct. Five agents ran at once at the start, and two at the end.

## Session 23, November 13, 2026: step 7 reviewed again, three defects fixed

On `claude/charming-archimedes-i2vi31`, from `a558ad5`. Damon's word: "Review the code", then "Make the fixes." No
agents: the review, the tests and the fixes are mine, in one session.

The baseline: `npm run check` passes; `npm test` gives 210 tests, 206 pass, 0 fail, 4 todo, in 51 s.

### What the review found

Read against `plan/slice-1.md` step 7, section 10's criteria and session 17's design; each defect reproduced in the
built page by a probe before anything was changed:

1. **A resize from the top or left dragged what the box holds along with its corner.** Page's top left handle dragged
   61 by 40 units: Page.hosts moved 61 by 40 on the screen. Session 17's design, event 8: "A top or left resize keeps
   the far corner, shifts the boxes inside so they stay put, and stops where one would pass 12 or 48." `placesFor`'s
   rule 4 gave a place to the resized box alone, and session 22 did not note it as a departure. No test saw it: the
   resize tests from the top left use Host, which holds no box.
2. **Ctrl + S held down saved once per repeat of the key.** One press held through 5 repeats: 6 downloads.
3. **Ctrl + Z acted behind the question before Open.** With the dialog up, the drag was undone behind it, and the
   dialog still said the file has changes that aren't saved while the session had none.
4. `viewStore.ts`'s `writing` flag never changed anything: `finish()` sets `gesture` to null before it writes, so the
   history's listener never finds a gesture then.

Tried and found sound, so nothing was changed: the far corner in a top left resize at 70%, over 37 steps (0.00 off at
each); a box dragged out of the plane in the 5,000-element general view, which culls (React Flow keeps a dragged node
mounted, the gesture ends and writes one step); rule 2 against the old page's `nearestBorder`, the order of ties too.

### The fixes, each test seen to fail first

| Fix | Test | Failed before with |
|---|---|---|
| `placesFor`, rule 4: when a top or left handle moves a box's corner, each box inside it is placed as far the other way from the corner (in the same `places`, so the store's one `edit()` writes them), and the corner stops where one would pass 12 or 48 | `adapter.test.mjs`, "rule 4: a box resized from its top or left leaves the boxes inside it where they were" and "... stops where a box inside would pass 12 or 48", and two cases more in "a gesture's step is drawn as the model its end writes would be"; `move.test.mjs`, "a resize of an owner from its top left leaves what it holds where it was, in one undo step" | "After Page was resized from its top left, Page.hosts is drawn -50.0 by -36.1 px from where it was" |
| Ctrl or ⌘ + S saves at the press, not at its repeats (`event.repeat`); each repeat's default is still prevented | `keys.test.mjs`, "Ctrl + S held down saves once" | "Ctrl + S held through five repeats saved the file 6 times; it should save once." |
| While a modal dialog is up (`[role="dialog"][aria-modal="true"]`, which MUI's Dialog is), the keys undo, redo and save nothing; Save's default is prevented all the same | `keys.test.mjs`, "the keys change nothing while the question before Open is up" | "Ctrl + Z, with the question before Open up, undid the drag behind it: Host is at 360.0, 422.2, and was at 449.8, 472.2." |
| The `writing` flag taken out | `viewStore.test.mjs`, unchanged, passes | |

- **Rule 4, as it now reads.** By the hand-worked numbers of the tests: Page (32, 72, 760 by 250) resized from its top
  left to -28, 32 gives Page -28, 32, 820 by 290, Page.hosts 156, 144 and Page.app 628, 144; dragged 200 right and 100
  down it stops at 116, 128, 676 by 194, with Page.hosts at 12, 48. On an axis whose top or left handle is dragged, what
  the box holds is the room to its nearest box inside; the far edges of the boxes inside are held by the kept right or
  bottom edge. A bottom or right handle is as before, and places the box alone. The words count the asked box only:
  "Resized part def Page".
- **The store did not change for it**: it writes every place `placesFor` gives. React Flow's resizer sends positions
  for the child nodes too (no `dragging` key); the store ignores them as before, and the adapter's are the ones drawn.
- **The modal check is by the document, not by a prop**, so that step 12's About dialog is covered when it comes. For
  the 200 ms or so in which MUI takes a closed dialog out of the document, the keys still do nothing.
- **`canvas/check.sh` on a file saved after a top left resize of Page** (a probe): `ok ... (Package StrongholdProof)`,
  the file holding Page at -20, 33, 812 by 289, Page.hosts at 148, 143 and Page.app at 620, 143.
- The look did not change, so `nodes.png` is not retaken.

### The checks, alone

`npm run check` passes. `npm test`, two runs in a row: 215 tests, 211 pass, 0 fail, 4 todo, in 54 and 53 s. Four
checks are `"todo"` in `plan/status.json`, as the runner's `# todo` says; the status file did not change.

### For the next session

As session 22 left it: step 8, with the drag test's and the pan test's numbers. A top or left resize of an owner now
gives a place per box inside it at every step; at 5,000 elements that is the general view's packages, and step 8's
measure of a drag step does not cover a resize.

## Session 25, November 13, 2026: steps 8 and 9 of slice 1 closed by the swarm; steps 10 to 12 built and kept aside

On `claude/wonderful-goldberg-f8hyy1`, from `102d983` (main, with session 24's scaffold merged by pull request #50).
Damon's word: "Finish slice 1."; then, while step 8 was being closed, "Stop once you're finished with step 8 and 9. Sync
everything to GitHub after." The lead is Claude, on the session's model; the agents are those `plan/swarm/tasks.json`
names, run as `plan/swarm/README.md` says. Each task's worktree was made by hand under `/home/user/wt/<task>`, from the
last closed step's commit with the owned files of every task it needs checked out on top and committed as its base;
`node_modules/` was hard-linked from the main tree (`cp -al`) in place of `npm ci`. Each agent was given its brief's
path in its worktree and the worktree's place, and nothing else of the lead's context.

The baseline, in this container (Node 22.23.4, 4 processors): `npm ci` 15 s; `npm run check` passes in 4 s; `npm test`
gives 215 tests, 211 pass, 0 fail, 4 todo, in 56 s.

### How the swarm was run

As `plan/swarm/README.md` says, with these particulars:

- **Worktrees.** Each task's worktree was made by hand under `/home/user/wt/<task>`, from the last closed step's commit (`102d983` until step 8 closed), with the owned files of every task it needs, directly or not, checked out on top from those tasks' final commits and committed as its base. `node_modules/` was hard-linked from the main tree (`cp -al`), which takes a second, in place of `npm ci`. A task's result was its last commit in its worktree, read by the lead (`git diff <base> <head>`, every change outside what the task owns flagged) and kept as a local ref, `refs/swarm/<task>`, never pushed. A step's closing checks the owned files of its tasks out of those refs into the main tree.
- **What each agent was given**: the path of its brief inside its worktree, the worktree's place, and that `node_modules/` is in place; nothing else of the lead's context. The reviewers of a screenshot got the image, copied outside the repository, and its list, and nothing else.
- **Models.** As `tasks.json` names them, Sonnet at medium for tests, code, breakages and screenshots. The code reviews (`fable` at `high`) could not run on Fable: its usage limit was reached at 14:05 ("resets Nov 16, 5pm UTC") and both first reviewers stopped at their start. The README's reason for the model is "a fresh instance of the lead's own model, which has not seen the outline", and this session's lead runs on Opus 5.5, so every review ran on Opus at high. Reworks ran on Sonnet at high.
- **Speed.** An agent took 9 s (a screenshot) to 15 min (a code review); a test or code task 0.5 to 8 min, a breakage task 5 to 13 min. Up to fifteen ran at once, on this container's 4 processors (load average up to 9), which slows a browser test but does not break one: `soon()` counts frames, not milliseconds. Every timing that decides anything was taken by the lead with no agent running.
- **What the agents' tests got wrong, and the lead fixed** (each smaller than a brief; each test then seen to pass against the code it tests): four test files compared an array from the model library, which `loadLib()` makes in another realm, with `assert.deepEqual` (`commands.test.mjs` test 24, `tools-panel.test.mjs` test 2, `details.test.mjs` two places; the same in `tools.test.mjs` 1 to 4, left for step 11): a library array is not a test array to the strict assert, though both read the same. `probe.test.mjs` test 7 flaked under load (2 of 6 runs): its stand-in hands the probe the real `WebAssembly.instantiate`, and `settle()`'s 20 turns were sometimes too few for the compile; it now awaits the compile (8 of 8 then passed at a load of 8.8). Two rows of `step-10.md`'s list were wrong: row 21 of `details-fields.test.mjs` ticks Is Abstract on Host, which the example has abstract already (the test now ticks App), and row 20 looks for the type's picker while the Advanced tab is shown (the test shows Core first). `step-9.md`'s list gives `built` 4 after two undos in R11; the contract counts every change of structure, so 5, and the test holds 5.

### Step 8: each change measured alone, and the pan limit

`8-checks-measure`, the lead's, with nothing else running (13:52 to 14:03): `npm run build && node --test --test-timeout=120000 canvas/app/test/scale.test.mjs`, three runs per build, the median of the three runs' medians, in ms. Build A is the scaffold; B adds change 1 (`projectStep`), with `linesDrawn` put back to `return true`; C adds change 2 (no lines for a large view while far); D adds change 3 (the minimap of our own).

| Build | Opens | Drag step, starting / following | Pan step, `definitions` | `deployment` | `workflows` |
|---|---|---|---|---|---|
| A | 691.5 | 2.4 / 38.0 | 22.2 / 25.4 | 19.8 / 16.7 | 39.7 / 46.2 |
| B | 655.9 | 2.2 / 12.8 | 22.4 / 16.5 | 14.5 / 19.1 | 35.2 / 34.3 |
| C | 539.5 | 1.9 / 11.8 | 12.6 / 12.2 | 11.3 / 11.1 | 20.6 / 21.4 |
| D | 492.8 | 1.0 / 11.6 | 15.6 / 11.1 | 10.9 / 8.9 | 17.8 / 19.4 |
| D, three runs more | 493.5 | 1.3 / 10.7 | 9.8 / 11.4 | 9.1 / 9.0 | 23.4 / 18.1 |

- **Change 1 kept**: a drag step that follows one went from 38.0 (runs 36.4 to 43.2) to 12.8 (12.2 to 12.9). In Node, `projectStep` works a step of `definitions` out in 0.53 ms by the median of 50 (the slow way, 14.6 to 18 ms).
- **Change 2 kept**: a pan step of `workflows` went from 35.2 / 34.3 to 20.6 / 21.4, more than the runs of one build differ.
- **Change 3 kept**, on the following steps of a pan, lower in all three views (12.2 to 11.1, 11.1 to 8.9, 21.4 to 19.4); for `deployment` the move is less than its runs' spread, and the starting steps are mixed. Its other gain, the minimap's subscriptions per node gone, is not in these numbers.
- **This container is slower than session 24's**: the scaffold's `workflows` pan step is 39.7 / 46.2 here against 29.9 / 30.0 then, 1.3 to 1.5 times. Session 24's prototype of the same three changes gave 12 to 13 ms on the same test; times 1.4 that is what build D measures.

**The pan limit still fails, for `workflows` alone**: 2,112 nodes fitted at 4.3%, 17.8 to 23.4 ms starting and 18.1 to 19.4 following, against 16, while `definitions` and `deployment` hold at 9 to 12. So the pan test has its todo mark back, with these numbers in its reason, and the limit goes to Damon (`plan/slice-1.md`, step 8, "If a limit still fails"). Where the time of a `workflows` pan step goes, from a Chromium trace of 20 steps of build D (`devtools.timeline`; not the CSS domain): the browser's handling of the mouse move, 16.7 ms, of which the page's script (d3's handler, React Flow's store, React) 7.7, the hit test of the pointer against 2,112 mounted nodes 6.1 to 6.6, and Chromium's handling of a pressed mouse moved as a text selection's drag (`MouseEventManager::handleMouseDraggedEvent`) 4.9; then the frame: layerizing and pushing the paint to the compositor 5.9 each (every node has its own transform), layout 2.4, paint 1.1. Tried on build D, alone, and not kept:

| Tried | `workflows`, starting / following | Why it is not kept |
|---|---|---|
| `.react-flow__pane.dragging .react-flow__node { pointer-events: none }` | 17.8 / 19.8 | No gain: the hit test still walks every transformed node |
| The default of a mousedown on the pane prevented (capturing, on the plane's root) | 10.2 / 11.4 (definitions 9.3 / 7.4, deployment 6.9 / 7.4); the pan test passed 2 of 3 runs | It stops the press from moving the focus, and Dockview makes a group active when its content takes the focus: the view in front would no longer follow a press in a split editor, and a field of Details would keep the focus on a click on the ground. Kept as a lever for Damon, with what it would have to put back |
| `.react-flow__pane { user-select: none }` | 19.6 / 11.2 | Halves the following steps but not the starting ones; the test still fails in 2 of 3 runs |

**What Damon is asked**, with the measurement above: restate the pan limit (for instance "under 16 ms for a fitted view of up to 1,600 nodes, under 25 ms for the 2,112-node view", or the limit for a working zoom, as `plan/direction.md`'s item allows), or have the press's default prevented with the focus put back by hand (about 10 to 11 ms here, passing 2 of 3 runs), or a far form drawn as one picture with no node mounted (not slice 1's: a click on a far plane would mean something else). The other three limits hold.

### Step 8: what the reviews found, and what was done

`8-checks-break` made every breakage of the step's three test files (step 16, minimap 11, scale 5) and each failed its test. It noted that `MiniMap.tsx`'s comments still said it was React Flow's (fixed), that minimap test 1 fails first at the missing path so its "no `.react-flow__minimap-node`" half was not seen alone, and that step test 9 alone guards that a copy of a projection carries its `read` (without it a drag goes the slow way, silently).

`8-review-code` (on Opus, as said above) found three defects, each reproduced:

1. **The drag test's starting sample timed a move that draws nothing.** Its first move is 3 by 2 px, and since step 7 the store starts a gesture only once a step has gone 4 screen px (`CLICK_DISTANCE`, the larger axis, times the zoom): so a drag's first drawn step was the second move, filed with the following ones, where a median of 9 hides it. Fixed in `scale.test.mjs`: a drag's first move is now `DRAG_START`, 6 by 3 px (a pan keeps 3 by 2: d3 pans at the first move). Seen, alone, under a breakage that makes each drag's first drawn step 30 ms slow (a busy loop at the gesture's first `step()` in `viewStore.ts`): the old test passed (starting 1.5 ms; the slow steps, 54.3, 44.9 and 43.8 ms, among the following, median 11.8), the new one failed ("A drag step takes 43.1 ms when it starts a drag", against 16).
2. **A line selected before a large view went far came back selected after a click had let everything go while far**: React Flow can unselect only the lines it holds, and a far large view hands it none. Not fixed at step 8: step 9's selection, the session's, sets `selected` on every projection, which ends it; checked on step 9's build (below).
3. **A top or left resize of an owner drawn larger than 4000 units moved it instead of resizing it** (step 7's rule 4 capped the size at 4000 a side, below the size the owner is drawn at, then kept the far corner from the capped size). Fixed in `adapter.ts`: a resize is held to 4000 or to the box's drawn size, the larger. Its test, `adapter.test.mjs` › "rule 4: an owner drawn larger than 4000 keeps its far corner when resized from its top left", failed first ("x: 1224, w: 4000", Page.hosts at -1096) and passes.

The review's hints, which no limit covers: `placesFor` reads the whole model at each step of a drag (1.7 to 4.7 ms in a profile), and the minimap's path of 1,544 rectangles is made again at each step of a drag (about 1.7 ms at 5,000 elements).

`8-review-shot-scale` saw `scale.png` of build D: items 1, 3, 4, 5, 6 and 7 present; item 2 "absent (partly)", with every condition of it said present (the grid whole, bare ground on every side, nothing cut) and the reservation that the model's last row is shorter and its last boxes flatter, which is the scale model's content. Other notes: the minimap's top band is veiled (the fit leaves 48 px above the view and 180 below it, so the window does not reach the top of the minimap's picture), a wider gap before the third tab, the grid above the plane's middle.

### Step 8: the checks, alone, and what it changed beyond its files

- **The test files run one at a time** from step 8 on (change 4 of `plan/swarm/step-8.md`): `package.json`'s `test` is `node --test --test-concurrency=1 --test-timeout=120000 canvas/app/test/*.test.mjs`. Beside the other files the timed tests fail on this machine's four processors, each file running a Chromium that draws in software. A run of the suite takes 2 min 16 s to 2 min 22 s where it took 56 s.
- **`npm test` three times in a row, nothing else running**: 245 tests, 243 pass, 0 fail, 2 todo (the keystroke, step 10's; the pan step, Damon's), each time. By run, in ms: the model opens in 566.8, 557.0, 502.0; a drag step 13.9 / 12.8, 13.5 / 9.0, 10.9 / 9.3 (starting / following; the starting step is now a drawn one); a pan step of `definitions` 12.5 / 10.1, 11.0 / 10.9, 11.4 / 10.1, of `deployment` 9.3 / 9.3, 9.3 / 8.1, 8.8 / 9.3, of `workflows` 14.4 / 24.0, 22.9 / 23.4, 13.9 / 18.0. Checks 7 and 8 of `plan/status.json` pass; check 10 stays todo, with a note.
- **`scale.png`**, taken from the step's build (`npm run shots -- scale`; the shot is no longer pending) and looked at by a fresh reviewer with the image and its list only: 7 of 7 present. The reviewer's other notes, none of them items: the boxes are faint at this zoom, the minimap's top band is veiled (the window does not reach the top of its picture), the last row of the grid is short (the model's).
- **Beyond step 8's files**: `canvas/app/test/adapter.test.mjs` gained the rule 4 test above, and `canvas/app/src/core/adapter.ts`'s rule 4 (step 7's) changed with it.

### Step 9: the shared selection and the Explorer

Built by its ten tasks as `plan/swarm/step-9.md` lays it out, with nothing built otherwise than it says but what follows.

- **What the tests found in their lists**: `step-9.md`'s row R11 gives `built` 4 after two undos; the contract of `explorerRows.ts` counts every change of structure, so 5 (one build, two edits, two undos), and the test holds 5.
- **`9-checks-break`**: 60 breakages, 58 failed their tests. Kept, with the reason: K5's (`selectionMode` left at Partial) is inert by design, since the marquee's picks come from the store's `marquee(rect)` and `selection.set`, and React Flow's own select changes pick nothing; the covering rule itself is caught (K5 fails when the store takes a box the rectangle only cuts). S7's (the dock's `onDidRemovePanel` listener taken out) passed: Dockview 8.9.0 fires `onDidActivePanelChange` in every case the page's own gestures make (the tab in front closed, the last tab closed), so the listener guards a removal that leaves the active panel unchanged, which no gesture was found to make; the branch that lets the view in front go when its panel is gone is caught. V2's first reading (a method reading `this.viewId`) passed only because `core.mjs` bundles the sources as sloppy-mode CommonJS, where a bare call's `this` is `globalThis`; a method that reads `this.<x>.<y>` is caught.
- **`9-review-code`** (Opus) reproduced four defects, sent back to their files' owners at Sonnet, high, each fixed with tests seen to fail first:
  1. Shift + click on a row of the Explorer threw "Invalid range" (logged as a page error) after another file was opened, or once the anchor's element had left the model: MUI X Tree View's selection plugin keeps a `lastSelectedItem` the tree no longer holds.
  2. Shift + click on a row picked nothing when no row had been clicked before (a box picked on the plane, then Shift + click on a row).
  3. After a Shift range the anchor, not the row clicked or moved to, was the last picked, so it was what the Explorer scrolled to (and what Details will show).
  4. The view in front became none while a tab was still shown, after the last tab of a split or floating group was closed (Dockview then has no view's panel active, and the view that was in front has none).

  `9-rework-explorer` (6.2 min): Shift + click and Shift + Space make the range themselves, from the shown row of `selection.last` to the row clicked, the row clicked first and the rest in the tree's order; with no shown anchor, the row alone. Tree View's own `expandSelectionRange` is not used for them (`defaultMuiPrevented`). Shift + an arrow key keeps Tree View's stretch, with the row moved to put first. Four tests in `explorer.test.mjs`, each seen to fail first: "Shift + click on el:Fuel in the file opened after another ... the selected rows are [] ... page error: Invalid range"; "Shift + click on el:DevHost with nothing picked should pick that row alone: ... []"; two on the last picked, seen through the Explorer's scroll on a 60-element model. `explorerRows.ts`'s and `Explorer.tsx`'s contracts say what the code now does.

  `9-rework-dock` (1.5 min): the front rule's last case is now "otherwise the view of the active panel of the first editor group whose active panel is a view's panel of this session, and none only when no view of this session has a panel". Two tests in `selection.test.mjs`, a split group closed and a floating one, each seen to fail first ("the rows marked aria-current are [], not [view:v-ic]").
- **The renames' cost** (R13, 100 renames under 200 ms at 5,000 elements): 274.5 ms beside other work and 175 to 190 ms alone, as built: `lib.idsOf` made a 5,000-entry map through the history's Proxy at each reword, and `typingOf` and `describeRel` indexes of every relationship. The Explorer's rework keeps an index of its own, made at each build and checked at use, and rewords only the shown rows: 26.6 to 53.9 ms. It widened the global declaration of `describeRel` by its optional `ids`, which the library takes; no other file declares it globally.
- **Step 8's review, defect 2**, the line that came back selected after a click let everything go while far: gone with step 9, whose selection is the session's (checked on this build with the reviewer's probe, below).

### Step 9: the checks, alone, and the drag step's first step

- **`npm test` three times in a row, nothing else running**: 308 tests, 306 pass, 0 fail, 2 todo, each time (2 min 50 s to 2 min 57 s). By run, in ms: the model opens in 657.1, 622.3, 701.6; a drag step 12.2 / 10.2, 12.6 / 9.3, 11.4 / 10.7 (starting / following); a pan step of `workflows` 19.4 / 17.5, 21.0 / 19.3, 27.0 / 23.6 (the other two views 9 to 17).
- **`scale.test.mjs` and `instant.test.mjs` alone**, each file by itself (`node --test --test-timeout=120000 <file>`; run together in one command, node runs the two files side by side, which is not alone): `instant.test.mjs` passed 3 of 3 (the page ready under 500 ms, the example drawn within 1 s, a tab switch under 100 ms, a drag step of the example under 16 ms). `scale.test.mjs` failed its drag test in 3 of 6 runs: starting 12.6, 20.4, 11.6, 18.9, 13.3, 18.8 by the median, following 10.6 to 13.6. The same file on step 8's build, alone: starting 11.3, 14.6, 17.0, 9.4 (1 of 4 over).
- **Why**: since step 8's review, a drag's first move (6 by 3 px) starts the drag, so the starting samples are a drag's first drawn step, which the earlier first move of 3 by 2 px never was. The first drag of a page is cold, 15 to 27 ms (script 13 to 21, frame 1 to 6); the later ones take 7 to 14. With three drags, the median is the second drag, which is sometimes as slow as the first. A step that follows holds at 9 to 13. So the drag test has its todo mark back too, with its numbers, and check 8 of `plan/status.json` is `"todo"` again with a note: the drag limit goes to Damon with the pan's. `npm test` now reports `# todo 3`, as the three checks still `"todo"` say (8, 9 and 10). Where the first step's time goes is not measured beyond the script and frame split; the review's hints are that `placesFor` reads the whole model at each step (1.7 to 4.7 ms) and the minimap's path is made again at each step (about 1.7 ms).
- **Step 8's review, defect 2**, checked on step 9's build with the reviewer's probe (`p5-lines.mjs`, its paths pointed at the main tree): the line clicked at 100%, the view taken far, a box clicked and then the ground clicked: near again, no line is selected; a click on a box while far picks the box alone.
- **The timed Node tests of step 9**, in the three runs of `npm test`: 100 renames reword the Explorer's rows in 22.3, 21.7 and 34.6 ms (under 200; 175 to 190 before the rework); 2,000 picks take 7 ms (under 300).
- **No screenshot** at step 9, as its file says.
- **Each step's commit, checked out by itself** into a new worktree, `npm ci && npm run check && npm test` (criterion 7): step 8's, `5a5f38e`, 245 tests, 243 pass, 0 fail, 2 todo, as its `plan/status.json` says; step 9's, `857bd90`, 308 tests, 305 pass, 0 fail, 3 todo, as its says. Both pushed, and carried with the session's notes by pull request #51 (https://github.com/aliaseddd/Grasp/pull/51).

### Steps 10 to 12: built, partly reviewed, and kept aside

Damon's word stopped the session after step 9. By then the swarm had finished every task of steps 10 to 12 but the closings and step 11's breakage and reviews. Their files are in `plan/swarm/session-25-wip/<task>/` (the folder's README says how they go back), not in `canvas/app/`: a step enters `canvas/app/` only at its closing. In `plan/swarm/tasks.json` the finished tasks are `"done"`; the rest are `"open"`.

- **Step 10, Details.** All its tests and code are built: `fieldHooks.test.mjs` 15 of 15 against `fieldHooks.ts`; `details.test.mjs` and `details-fields.test.mjs` 30 of 30 with step 10's four code tasks together; the keystroke of `instant.test.mjs` passes. The lead fixed four test faults (two library-realm arrays in `details.test.mjs`; in `details-fields.test.mjs`, row 21 of `step-10.md` ticked Is Abstract on Host, which the example has abstract already, so the test ticks App, and row 20 looked for a Core field on the Advanced tab). `10-impl-dock`'s title listener was re-applied by the lead on step 9's reworked `Dock.tsx` (the copy kept here is that one). `10-checks-break`: 44 of 45 breakages failed their tests; details-fields 7 cannot see Details' unmount cleanup (the blur on removal ends the run first). `10-review-code` (Opus) found: (1) Ctrl + Z in a text field of Details reaches the browser's one undo stack for the page, so after typing into one field and moving to another it undoes the first field's typing as a new step (and after a pick in "Typed by", whose input is a text input, it reverts the earlier typing, not the pick); (2) no key undoes a pick while the focus stays in the picker; (3, minor) a click anywhere along a checkbox's row ticks it. Its probes are in `probes/10-review-code/`. Step 10's closing must also take the keystroke test's todo mark off and judge it alone (45.0 / 33.4 ms beside other work, before step 8 was in).
- **Step 11, the Tools view and the palettes.** Tests and code built: `commands.test.mjs` 26 of 26, `tools-panel.test.mjs` 11 of 11 (each after the lead's fix of a library-realm array), `palette.test.mjs` 11 of 12, `tools.test.mjs` 9 of 14. What fails, as `11-impl-plane` reported it, all in the tests: tools 1 to 4 compare a library-realm array (`problemsOf`) with a plain one; tools 10 waits for `[data-testid="details"] .grasp-details` with nothing picked, when Details then shows only its sentence; palette 7 clicks the bar's file name with Playwright's locator while the menu is open, which the menu's backdrop takes, as its contract says (a click by the pointer's position is what a person does). `11-checks-break`, `11-review-code` and `11-review-shot-palette` were not run; `palette.png` was taken by `11-impl-plane` and not looked at.
- **Step 12, Validation and About.** Tests and code built: `checks` 13 of 13, `probe` 16 of 16 (test 7 made to await the real compile by the lead: it flaked under load), `validation` 6 of 6, `about` 7 of 7; `about.png`, looked at by a reviewer with the image and its list, 11 of 11 present. With About enabled, `shell.test.mjs`'s "keyboard focus can be seen" fails: the second Tab lands on About; step 12's closing must restate its Tab order with About as a stop (white ring on the bar). `12-checks-break`: 42 of 42 breakages failed their tests. `12-review-code` (Opus) found: (1, medium) with Validation shown on the 5,000-element model given 151 problems, a name's first keystroke took 59 to 93 ms (turning the checks stale redraws every entry, and `aboutProblem` and `aboutDiagnostic` search `model.elements` through the Proxy); (2) while the lists are stale, an entry whose relationship left the model stays a button and a click on it empties the selection; (3) About opened and closed within 0.4 s still runs the timing loop after, freezing the page for about half a second; (4) Undo with an entry focused drops the focus to the body; (5) "Remember a folder…" stays enabled when IndexedDB is not there. Its probes are in `probes/12-review-code/`. `12-review-shot-shell` and `12-review-shot-example` (the retaken shots, rated) were not run.

### The two limits that go to Damon

The opening (about 0.6 s against 5 s) holds, and so do the following steps of a drag (9 to 13 ms); the keystroke is step 10's. Two limits do not hold on this container, and `plan/slice-1.md` (step 8, "If a limit still fails") brings them to Damon with their numbers rather than loosening a test:

1. **A pan step of the fitted action flow view**, 2,112 nodes at 4.3%: 17.8 to 27.0 ms by the median, alone, against 16, where the other two views hold at 9 to 13. Where it goes, the browser's handling of each move (script 7.7 ms, the hit test of 2,112 transformed nodes about 6, the text-selection drag about 5) and the frame (layerizing about 6). The levers measured are in the table of step 8 above. Proposals: restate the limit (under 16 ms for a fitted view of up to about 1,600 nodes, under 25 ms for the 2,112-node one, or the limit for a working zoom, as `plan/direction.md`'s item allows); or prevent the default of a press on the ground and put the focus back by hand, which gave 10 to 11 ms here and passed 2 of 3 runs; or a far view drawn as one picture with no node mounted, which is not slice 1's.
2. **The first drawn step of a drag**, at 5,000 elements: since step 8's review the test times it apart, and the median of three is over 16 ms in 3 of 6 runs alone with steps 8 and 9 built (1 of 4 with step 8): the first drag of a page is cold, 15 to 27 ms, the later ones 7 to 14. Proposals: restate the limit for the first step of a gesture (for instance the starting median under 25 ms, the following under 16), or make the first step lighter (the review's leads: `placesFor` reads the whole model at each step, 1.7 to 4.7 ms; the minimap's path is made again at each step, about 1.7 ms), which no measurement here has tried.

Checks 8 and 10 of `plan/status.json` are `"todo"` with a note each, and their tests carry their todo marks with these numbers.

### The method's log

Fifty-five agents beside the lead: forty-four Sonnet tasks at medium (21 that wrote tests, 19 that wrote code, 4 that made the breakages), six code reviews (two on Fable that stopped at its limit at their start, then four on Opus at high: steps 8, 9, 10 and 12), two step 9 reworks on Sonnet at high, and three reviewers of a screenshot (`scale.png` twice, `about.png`). Each one's own time, from its notification: tests 0.5 to 6.6 min (median about 2.3); code 0.4 to 8 min (`8-impl-step` 7.0, `10-impl-details` 7.9, `11-impl-plane` 6.6); breakages 5.4 to 13.2 min; code reviews 11.6 to 15.4 min; reworks 1.5 and 6.2 min; a screenshot's review 8 to 9 s. Rework and whose fault: the two step 9 reworks came from the review's defects, which the outline had not said (the Explorer's ranges under Tree View's own anchor, the view in front when a group closes); every other fix was the lead's, of a test (six, listed under "How the swarm was run") or of a list in a step's file (`step-9.md` R11, `step-10.md` rows 20 and 21). One agent left its work uncommitted (`12-impl-probe`), and one sent "placeholder" as its report (`10-impl-dock`); the lead committed the first and read and ran the second itself.

### For the next session

- **Damon's answer on the two limits comes first** (above): it decides what checks 8 and 10 become, and whether `plan/direction.md`'s item "Compartment rows at Grasp's scale" is answered with a restated limit.
- **Then step 10's closing, from the kept work**: take `plan/swarm/session-25-wip/10-*/` into the tree on top of step 9's commit, fix or keep each finding of `10-review-code` and `10-checks-break` (above) with a test seen to fail first, take the keystroke test's todo mark off, and close it as `plan/swarm/briefs/10-checks-close.md` says. Steps 11 and 12 follow the same way, with step 11's breakage, review and `palette.png` review still to run, and step 12's shell and example shots to retake and rate.
- **How the swarm was run** is above, and `plan/swarm/session-25-wip/scripts/swarm.mjs` makes a task's worktree from a closed step's commit and the files of the tasks it needs (its paths are this session's).
- **Two things in the tests to keep in mind**: a library array is not a test array to `node:assert/strict` (copy it first), and `core.mjs`'s bundle is sloppy-mode CommonJS, so a bare method's `this` is `globalThis`.
