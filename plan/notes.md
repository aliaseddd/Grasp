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
