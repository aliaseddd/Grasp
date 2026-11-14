# Stage D, second part, of the scaffold (package 2-1): the document tests and the screenshots' skeletons

Built in /home/user/Grasp, on claude/gracious-fermi-hxid8e, from stage C's commit df6b93d. One local commit: see "The
commit" at the end. Read first: stage-0.md, stage-A.md, stage-B.md and stage-C.md in this folder. No report of stage D's
first part was in this folder while I worked, and I changed none of its five files (helpers.mjs, core.mjs,
fixtures.test.mjs, connect.test.mjs, reconnect.test.mjs).

Nothing a person meets changes in this stage: every file is under canvas/app/test/, and canvas/dist/ is byte for byte
stage C's.

## What was built, file by file

All under canvas/app/test/.

- `capabilities.test.mjs` (new; 2-14 owns it): the one test "every capability of plan/slice-2.md names a test that
  exists under that name", marked todo. It reads the rows of section 7 out of the plan and looks for each name among
  the titles of the tests its file declares.
- `refusals.test.mjs` (new; 2-14): the one test "every action of the table, asked where it does not apply, says why",
  in Node through `ask()`, marked todo. The brief's two tests in the page are a comment in its header, with what each
  finds, for package 2-14 to write at the slice's close.
- `retired.test.mjs` (new; 2-15): the one test "the old page is out of canvas/ and in archive/old-page/, and no
  script, test or pin names it", marked todo.
- `camera.test.mjs` (new; 2-14): a header comment with the five names of lines 8 to 11 and 15 and what is decided for
  the camera; no test.
- `shots.mjs` (changed): imports and lists the nine new shots after slice 1's six, in section 6's order; its header
  says how a shot of slice 2 differs; a pending shot of a package is left out with "Left out <name>.png: package 2-N
  takes it." (a pending shot of slice 1 still reads "step N builds it").
- `shots/connect-menu.mjs` (2-2), `shots/label-editor.mjs` (2-3), `shots/badges.mjs` (2-6), `shots/notes.mjs` (2-7),
  `shots/text-tab.mjs` (2-9), `shots/sequence.mjs` (2-10), `shots/geometry.mjs` (2-11), `shots/grid.mjs` (2-12),
  `shots/browser.mjs` (2-13) (new skeletons): each is `{ name, package, pending: true, take }`, its `take()` throws
  "<name>: package 2-N takes it", and its comment holds its row of section 6 word for word: the scenario, the numbered
  list of what must be seen, whether it is one of the five that are rated, and how a shot is taken.

## The three todo tests: what each fails for today, and its first line

| Test | Fails because | First line of the failure |
|---|---|---|
| capabilities | 73 names are of tests not written yet; and one name of slice 1 is not a test's title (open question 1) | `73 of the 112 capabilities of plan/slice-2.md, section 7, name a test that does not exist under that name (1 of them a test of slice 1 or of the scaffold, which should exist today):` |
| refusals | 28 of section 5's 32 rows are not in the table | `28 of the 32 actions of plan/slice-2.md, section 5, are not in the table yet, and 0 things are wrong with the 4 that are (asked 2 times where they do not apply):` |
| retired | the old page is in canvas/ | `The old page is not retired: 79 files of it are still in canvas/, 77 files of it are not in archive/old-page/, 11 scripts, tests and pins name it, 1 thing beside is not as package 2-15 leaves it.` |

The capability count drops once stage D's first part is in the main tree: to 68 if its three files declare all five
names that section 7 gives them (lines 7, 23 and 31 in fixtures.test.mjs, line 36 in connect.test.mjs, line 40 in
reconnect.test.mjs; line 16 is package 2-2's own). I have not seen those files. Stage E should read the number then.

## How each test works, for whoever owns it next

### capabilities.test.mjs

- A row of section 7 is `| n | A person can | Built by | \`file › name\` |`, between "## 7." and "## 8.". The test
  fails when the rows are not 112 (`N`, criterion 3's number), when they are not numbered from 1 without a gap, or
  when a row's last cell is not `file › name`.
- "Exists" is: the name is the title of a `test()` call in that file, written as one string. A string in quotes is
  compared with its escapes taken out; a template is compared as the source has it, so lines 34 and 35 find
  `` `every tool of ${w.name} row is used once: …` `` in tools.test.mjs. A name in a comment is not found, nor a
  `test(` after `//` on its line, nor a title put together from parts or held in a variable. camera.test.mjs's
  header names its five tests in a comment for this reason, and none of them counts.
- It does not look at whether the test passes, or whether it is itself todo: the plan says "names a test that exists
  under that name", and the lead counts the names against the runner's passing tests before 2-15.
- The failure lists the missing names by "Built by", slice 1's and the scaffold's first, and its first line counts
  those apart: a name missing there was never "still to be written".

### refusals.test.mjs

- It reads section 5's table out of the plan (25 lines, 32 ids; a table of another size fails), with each row's file
  and package, its title and its key where the cell gives one for each id ("the four arrow keys" is read as
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown; the titles of the four pans and of the two message rows are not
  compared, since the plan writes them short: "Move left, right, up, down").
- Ten places, each a state file as it opens, the view in front and what is picked, made from the "Applies" column
  alone; 47 asks when every row is built. Every row that can be refused has at least one place:
  1. the example, its general view in front, nothing picked (20 rows);
  2. the example before any view is in front (the camera's 7: "No view is in front.");
  3. the grid fixture, its table in front (the camera's 7: "… has no zoom: it scrolls.");
  4. the example, its view picked (`delete`);
  5. the browser fixture, its tree in front, nothing picked (`show-in-view`);
  6. the same with Host picked (`remove-from-view`);
  7. the interconnection fixture, `v-defs` in front, an element picked that has no place in it (`remove-from-view`,
     `edit-label`, `type-label`);
  8. the action flow fixture, its start node picked (`edit-label`, `type-label`, `add-note`, `add-code-link`);
  9. the example, a part def with no code link picked (`remove-code-link`);
  10. the sequence fixture, its general view in front, a message picked (`message-up`, `message-down`).
- For each ask: `applies(session, null)` is not `true`; what it answers is a sentence (words, a full stop at the end);
  `ask()` returns `{ refused }` with that sentence; `saysOf(session).said` holds it with a larger number; and the
  model, the history's steps, the notes, what is picked, the view in front and `unsaved` are as before.
- The five that always apply are named (`ALWAYS`), must be the five whose "Applies" cell begins "Always" in the plan,
  and each must answer `true` at every one of the ten places. They are not run (Save would call the shell's hand).
- A row of the table that section 5 does not hold is a finding ("no place is known where it would be refused").
- The rows that are built are asked even while others are missing, and their findings come before the list of
  unbuilt rows. So the failure shrinks as packages land, and a built row that says nothing shows in it. It is still
  one todo test: nothing fails the run for it before 2-14's close.
- `says` beside a row is the plan's sentence there. The test quotes it in a failure and does not compare it.

### retired.test.mjs

- `MOVED` is every file that moves whole, as its path from canvas/: index.html, save-state.mjs, canvas.png,
  src/core/page.html, the 16 scripts of src/core/page/, the 10 page.js, the 11 style.css and style-end.css, the 33
  Playwright test files by name, fake-claude.mjs, build.test.mjs: 77 files. Each must be gone from canvas/ and be at
  archive/old-page/<the same path>. Also gone: the folder canvas/src/core/page/ and canvas/app/test/old-layout.mjs.
- canvas/test/ keeps the five Node test files (lookups, metamodel, model-lib, store-dump, stored) and index.js, and
  holds no other `*.test.mjs`. canvas/app/test/old-layout.json stays.
- canvas/test/helpers.mjs, as the brief has it ("once the Node tests that stay read nothing of it"): if no test that
  stays imports it, it must have moved; if one still does, it must be there, and is then scanned like the others.
- archive/old-page/index.html must have the SHA-256 that unchanged.json pins canvas/index.html with today
  (016ba5bc…), and archive/old-page/README.md must exist and hold a commit's hash (7 to 40 hex digits).
- "Names it" is read in code, with comments taken out: package.json's scripts, canvas/build.mjs, canvas/export.mjs,
  canvas/check.sh, docs/sysml/check.sh, canvas/app/build.mjs, every .mjs and .js of canvas/test/, canvas/app/test/
  and canvas/app/test/shots/, and the keys of unchanged.json. In canvas/ and canvas/test/ any `index.html` is the old
  page's; in canvas/app/ only `canvas/index.html` (or `'canvas', 'index.html'`) is, since the new page is
  canvas/dist/index.html. The other names: page.html, page.js and core/page/, the stylesheets, save-state,
  old-layout.mjs, fake-claude, old-page.
- What names it today, so what 2-15 changes: canvas/build.mjs; canvas/test/helpers.mjs, lookups, metamodel,
  model-lib, store-dump and stored; canvas/app/test/adapter.test.mjs (imports old-layout.mjs), history-walk.test.mjs
  (reads core/page/changes.js), unchanged.test.mjs (`PINNED`); and 76 keys of unchanged.json.

## Built otherwise than the plan says, each with its reason

1. **A shot's skeleton is `pending: true` as well as throwing, and carries `package` where a shot of slice 1 carries
   `step`.** The plan says "each a file of test/shots/ whose skeleton throws until its package writes it"; the task
   adds "in the way shots.mjs already leaves a pending shot out". shots.mjs's one message for a left-out shot read
   "step N builds it", so it now says "package 2-N takes it" for a shot with `package`.
2. **The package takes `pending` off in its own file**, with its take(). In slice 1 a step's closing did (the lead,
   in the same file). Here each shot's file is its package's and shots.mjs is the scaffold's, so nobody but the
   package can without changing a file it does not own. Each skeleton's comment says so.
3. **refusals.test.mjs checks more than "a sentence that ends in a full stop"**: the title and the key where the
   plan's cell gives them, that the refusal was said through saysOf, that nothing changed, and that the table holds
   no row section 5 does not. Each is section 5's or seam 8's own words (a refusal "is said"; a row "does not run").
   If the lead wants the brief's three checks and no more, they are the lines of `found.push` to take out.
4. **refusals.test.mjs asks a row at more than one place** where the plan gives it more than one sentence and the
   state is certain from the Applies column. The brief says "a place".
5. **The built rows are asked while the test is still todo** (above). The brief says only what the test holds.
6. **retired.test.mjs reads "names" as "names in code"**. A comment that says which file of the old page a rule was
   ported from (adapter.test.mjs, files.test.mjs, most of canvas/app/src) is no naming, and the test asks for none of
   them to change. The brief does not say.
7. **retired.test.mjs holds the built page's SHA-256 and a commit's hash in the README**; the brief says "keeping
   each file's path" and "the commit it was taken at".
8. **capabilities.test.mjs finds a name only as a test's title**, not anywhere in the file's text. "Looks for each
   name in its file" could be read as a search of the text; then camera.test.mjs's header, which the task asked for,
   would make lines 8 to 11 and 15 found with no test written.

## Tests of slice 1 that were changed

None. No test was loosened or skipped. Three tests are marked todo, each one of the plan's seven (checks 3, 8 and 12
of section 9).

## Open questions for the lead

1. **Line 32 of section 7 names a test of slice 1 that does not exist under that name.** The plan:
   `tools-panel.test.mjs › the Tools view lists the tools of the view in front, in the groups of its kind`. The test
   (tools-panel.test.mjs, line 114, unchanged since slice 1):
   `the Tools view lists the tools of the view in front, in the groups of its kind's row`. The plan says "A test of
   slice 1 exists under that name today", and capabilities.test.mjs cannot pass at the slice's close while the two
   differ. I changed neither: the plan is Damon's, and renaming a test of slice 1 to fit is the lead's (contract 27).
   The other 37 names of slice 1 and line 20's are found.
2. **Lines 34 and 35 name one test**, so the 112 capabilities name 111 tests. By the plan; said so that the count
   before 2-15 is not taken for a miss.
3. **An empty test file counts as one passing test** in node's summary: camera.test.mjs adds 1 to `# tests` and to
   `# pass` until its first test is written.
4. **refusals.test.mjs's places are read from the plan, not from code**, for 28 rows. I ran the test with every row
   built by stand-ins written from the Applies column (below) and it passes, but a package may order its checks
   otherwise (which sentence comes first when two apply) or read "the view in front" otherwise. The test does not
   compare wording, so only a row that APPLIES at one of the ten places would fail it; the place is then wrong or
   the row is, and the plan's Applies cell decides. Three readings to know of: `show-in-view` is asked in the
   example, whose one general view has a place for all 13 elements ("Everything … is shown … already."), and in the
   browser fixture's tree ("A browser view shows every element", 2-4's brief, said there of Remove from view);
   `add-code-link` is asked with a start node picked, on the strength of the plan's own sentence "<A start> holds no
   code links."; a refusal that only `run` gives is not asked.
5. **What retired.test.mjs does not hold**, from 2-15's brief: plane/NotDrawnYet.tsx's sentence; the four READMEs
   and plan/REPO_MAP.md; `npm run test:old` passing; the parts of store-dump.test.mjs and model-lib.test.mjs that
   move (the two files stay and must only stop naming the old page); comments. canvas/check.sh's usage line and
   canvas/export.mjs's header say "canvas/index.html" in a comment today and would pass as they are.
6. **canvas/test/scale-model.mjs stays in canvas/test/**: the brief does not list it among what moves, and eleven
   files of canvas/app/test/ import it. The test lets it stay.
7. **`npm run shots` rewrites the six committed PNGs** with other bytes (the left strip names Notes since stage C). I
   ran it once to see it write six and leave nine out, and put the six committed files back from a copy; the tree
   holds no changed image.

## Measurements

Container: 4 processors, Node 22.23.4. The load average was 0.5 when the full run began and 1.4 when it ended; I saw
no other run beside it, but the first part of stage D may have been working.

| Command | Result |
|---|---|
| `npm run build` | exit 0; canvas/dist unchanged from stage C |
| `npm run check` | exit 0: "canvas/dist is what the sources build.", and the types hold |
| `npm test` (the tree that is committed, but for a comment of capabilities.test.mjs changed during the run) | **553 tests, 60 suites: 550 pass, 0 fail, 3 todo; 394 s** |
| `node --test … capabilities, refusals, retired, camera, unchanged` afterwards, on the committed tree | 5 tests: 2 pass, 0 fail, 3 todo |
| `npm run shots` | exit 0: "Left out" nine times, "Wrote" six times (shell, example, nodes, scale, palette, about) |
| `npm run shots -- connect-menu` | exit 1: "connect-menu: package 2-2 takes it" |

553 is stage C's 549, the three todo tests, and camera.test.mjs counted as one. No timed test failed, so none was run
again. scale.test.mjs's medians in that full run (starting / following, or opening / joining): the 5,000-element
model opens in 635 ms (limit 5,000); a drag step 15.2 / 11.4 ms (16); a keystroke in a name 36.7 / 32.6 ms (50); a
keystroke with Validation shown 35.0 / 28.7 ms (50); a pan step of definitions 10.4 / 10.4, of deployment 11.6 / 9.2
(16), of workflows 17.1 / 20.3 (25). This stage adds nothing to a step: it changes no source of the page.

## How the three tests were seen to pass and to fail, with nothing committed for it

Each test can only fail today, so its passing path and each of its checks were run against stand-ins. The scripts are
in /tmp/claude-0/-home-user-Grasp/c7f4c0c3-3293-5171-8b1a-2fc91a0152d6/scratchpad/d2/; each writes a copy of the test
beside the real one under a `tmp-` name, runs it and deletes it (none is left: `git status` shows none).

- `cap-mutate.mjs` (capabilities, against doctored copies of the plan): every line naming a test that exists passes;
  a line taken out fails with "Section 7 holds 111 lines, not the 112 of criterion 3."; a line doubled fails with 113
  and the numbering; one letter changed in a name fails with that name; a last cell that is no `file › name` fails
  naming the line. `titles.mjs`: the title reader finds 536 titles for the 537 `test(` calls of the suite (the one it
  leaves is keys.test.mjs's `test(what, …)`), and finds none in a comment.
- `ref-standins.mjs` (refusals, with all 32 rows built by stand-ins through `loadCoreWith`): passes, 47 asks. Then
  one stand-in spoiled at a time, each failing for its reason: a sentence with no full stop; a one-word answer; a
  row that applies where it should not (`delete-view` in the example; the camera in a grid view); a wrong key; a
  wrong title; a row section 5 does not hold; one of the five refusing; a refusal that changes what is in front; one
  file's rows missing.
- `retired-mock.mjs` (retired, against a copy of the repository's relevant files with the moves made): passes. Then
  sixteen ways of spoiling it, each failing for its reason, among them: the page copied and not moved; a file left
  in core/page/; the archived page changed by a byte; one file not archived; no README, or one with no commit; a pin
  left, or the archive pinned; a script naming index.html, or running the archive's tests; a test reading
  canvas/index.html; an old test left; helpers.mjs left with nobody reading it; old-layout.json gone; build.mjs
  naming index.html. A test that names the old page only in a comment passes.
- `make-shots.mjs` wrote the nine skeletons from section 6's table, so that each comment is the plan's row.

## What I tried and dropped

- **A second, passing test in refusals.test.mjs for the rows that are built** ("every row that is built says why"),
  so that a landed row that says nothing fails the run at once and not only inside a todo failure. Dropped: the plan
  names one test, and a package whose row is right but which my place misjudged would meet a failing test it does
  not own. The one test asks the built rows and lists their findings first instead.
- **The same for capabilities.test.mjs** (a passing test for the 39 names that should exist today). Dropped for the
  same reason, and because line 32 would fail it now (open question 1).
- **Comparing each refusal with the plan's sentence.** Dropped: the `<…>` are the library's words, and the brief
  asks for "a sentence that ends in a full stop". The plan's sentence is kept beside each row and quoted in failures.
- **Reading "names it" with comments counted** in retired.test.mjs. It would ask 2-15 to rewrite the comments of
  adapter.test.mjs, files.test.mjs and others that cite where a rule was ported from; the brief asks for no such
  change.
- **A separate retired.json with the SHA-256 of all 77 files.** Dropped: section 3 lists no such file, and the built
  page's one hash says whether the archive holds the page slice 1 found.
- **Reading the list of moved files from the folders at test time.** It cannot be done before the move and proves
  nothing after it, so the lists are written into the test.

## Left for later stages

- **Stage E**: the five files of stage D's first part into the main tree, after which `# todo` is 7 and the
  capability count drops (above); plan/status.json's checks 3, 8 and 12 are "todo" by these three tests. Open
  question 1 wants a decision before 2-14 closes, not before the scaffold lands.
- **Each package with a screenshot**: writes take() in its shots/<name>.mjs and takes `pending` off.
- **2-14**: camera.test.mjs's five tests; the two page tests of refusals.test.mjs; the todo marks of capabilities and
  refusals at the close. **2-15**: retired.test.mjs's mark.

## The commit

See the structured answer for the hash: local, not pushed, "wip(2-1): stage D2, the document tests and the
screenshots' skeletons". 14 files, all under canvas/app/test/: four new test files, shots.mjs, nine skeletons under
shots/. Nothing under canvas/src, canvas/test, canvas/dist or plan/ changed, no file that unchanged.json lists
(unchanged.test.mjs passes), and none of the first part's five files.

The log of the full run: /tmp/claude-0/-home-user-Grasp/c7f4c0c3-3293-5171-8b1a-2fc91a0152d6/scratchpad/stage-d2-test-1.log.
