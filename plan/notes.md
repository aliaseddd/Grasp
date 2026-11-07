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
