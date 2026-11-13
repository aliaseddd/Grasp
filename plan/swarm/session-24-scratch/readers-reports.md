# What the readers found, session 24 (not yet applied except for step 8)

Each reader was a fresh instance that read one step's briefs as the Sonnet agent would. Step 8's list was applied in the working commits. The lists for steps 11 and 12 (with step 13's brief) are below and are NOT applied. The readers for steps 9 and 10 had not reported when work stopped, so there are no lists for them.

## Step 8 (applied)

Fixed: view compared by id not identity in `projectStep`; edges are `previous.edges` only when `previous.far` equals `far`; rows 10/13 of `step.test.mjs` extended (resize and far steps, near step after far); `ProjectionRead` gained `view`; minimap panel classes and formula notes; step 4 of the scale shot scenario (pointer at 700, 20); `zoomTo` for zooming out; owns and needs of `8-checks-measure`; `fable` model named in the README.

## Step 11 (NOT applied)

**11-tests-commands**
1. Row 23: breakage "`choose` toggling the tool in hand off" cannot fail; make the third step "with `PartDefinition` in hand, `choose('PartDefinition', ground hit)`".
2. Rows 24 and tools 1-4: `lib.validate` returns `{ id, message }`, id random; say "compare the `message` of each entry".
3. Row 16: the example holds no notes, so the notes assertion is empty; add a note targeting `t-hosts` or drop the claim.
4. Open small choices: row 2 titles non-empty or distinct (all 27 distinct); read tools from `lib.VIEW_KINDS` not `toolGroups`; row 10 "on StrongholdApp" should be "in"; row 18 hits lack `type`/`at` and words; row 26 what to assert.

**11-impl-commands**
1. `said` bullet lists "a choice" as clearing `said` but `choose` is "exactly as click(hit)" and row 23 expects a sentence: write "a choice that made something or took a first end".
2. `armed` and `said` must be the same object at every read until changed (useSyncExternalStore); add to comment and `assert.equal(t.armed, t.armed)` in row 4.
3. First end let go by an undo: say `said` becomes null.
4. Say whether `Saying.n` restarts per session (see toasts 1).

**11-tests-panel**: row 10 say "`v-ic`'s row"; row 8 wait until a tooltip reads (two tooltips can coexist briefly).

**11-impl-tools**
1. Escape rule cites the bar's text-field test, which step 10 changes; write the rule out in `Tools.tsx` in full.
2. MUI `<Divider />` is an `<hr>` with no role; contract must say `component="div"`.
3. "Mounted from the page's start" untested: add to `palette.test` 6, with the Tools view never shown, Escape puts the tool down.

**11-impl-toasts**: a let-go `n` can swallow the next file's first toast; say what was let go is forgotten when the session changes; add to `tools.test` 13 a refusal after another file is opened.

**11-tests-tools**
1. Row 1 breakage "`clicked()` picking before it asks the tool" leaves test 1 passing; move to row 9, give row 1 "`set([made])` left out".
2. Row 8 selector: `[data-testid="tools"] .grasp-side-title`.
3. Name `wordsOf(page, 'undo')` for Undo's words, drop `undoWords`.
4. Compare `message` in rows 1-4.
5. Row 10: read "view not selected" as `rowItemIn(page, 'view', 'v-proof')` lacking `aria-selected="true"`.
6. Section 4's "each boxed use lands in an owner that already holds something" is false for `Release.publish`.

**11-tests-palette**
1. Brief says rewrite `shots/palette.mjs` without `pending`; should leave `pending: true`.
2. Row 4: disabled MenuItem has `pointer-events: none`; use `page.mouse.click` at its middle.
3. Row 5 breakage "placed at the box's corner" does not fail; right-click at 300 by 100 or assert corner 94 by 80 from Host's.
4. Row 7 breakage "menu root not stopping the event" does not fail; use "menu root given no `onContextMenu`"; correct the reason in `Palette.tsx` and the plane brief.
5. Row 8: press Escape after each right-click that opened a menu.
6. Row 6: add Escape check with the Tools view never shown.
7. Section 5 step 4: give the sentence to throw.

**11-impl-plane**
1. Where `at` and `<Palette>` live is open: state is `Plane`'s, `Flow` gets its setter; correct "hidden tab closes the palette" (outer `Plane` stays mounted at 0 by 0).
2. "`onClose` called once per closing" cannot hold on a choice; say a second call is harmless.

**11-checks-break**: four rows would not fail as worded (commands 23, tools 1, palette 5, palette 7); commands 3 fails most of its file, say expected.

**11-checks-close / tasks-11**: closing owns `tasks.json` but fragment file name differs; step 8's shot retake after review needs a re-review.

**Assumed of step 9:** dock tells `front` when a file opens and when another opens; a side panel made active never changes `front`; `front(null)` when last tab closed; whether a press on a non-front plane tells `front` before the click reaches `clicked` (then the "no such tool" toast cannot be met in the page); `clicked` never receives a drag's release, `hit.at` is `screenToFlowPosition`; picked-by-tool node gets class `selected`; Explorer rows for new elements and every line kind are in the document without unfolding, rows leave on undo, a view's row has `aria-selected`; with no tool a click picks, ground picks the view; marquee rectangle is React Flow's; `Plane` stays a root with an inner Flow.

**Assumed of step 10:** Details shows forms for everything a tool makes with nothing logged; name field present for a box and a view and `fill` writes at once; Escape in a Details field reaches the window with the input as target; Details does not take focus on pick; bar after `10-impl-bar` lets Ctrl+Z act from a menu entry; which text-field rule the bar ends with; `10-checks-close` leaves `# todo 0`.

## Step 12 and 13 (NOT applied)

**12-tests-probe**
1. Row 7 cannot pass reliably (`settle()` is 20 `setImmediate` turns; real `WebAssembly.instantiate` needed up to 166): have the counted `instantiate` keep its promise, `await` it, then `settle()`.
2. Row 11: say the record is in A's `env.store`, and "`ask()` on B again, settle".
3. Row 12: "nothing" = `kept.put` not called and `lines` unchanged.
4. Row 4: seven texts, not six.

**12-impl-probe**
1. `probe.ts`: `WASM_LOOP: Uint8Array` and `instantiate(bytes: Uint8Array)` fail `tsc` (TS 6.0.2); declare both `Uint8Array<ArrayBuffer>` or name the cast `bytes as BufferSource`.
2. Give the words of `browserEnv`'s own errors (no localStorage; value not written; no IndexedDB; no Worker; worker error event; "no answer within 3 s").
3. No test runs `browserEnv` failure branches: add row 8 to `about.test.mjs` using `withInit` (localStorage getter throws, `indexedDB` undefined, `WebAssembly` and `Worker` deleted); asserts the four `no` sentences.
4. `ask()` that changes no line: new array or same? Whether a superseded round aborts its GitHub request and calls off its 10 s wait.

**12-tests-checks**: introduction should say every session opens with the counted library; contract should order "wait started before listeners are told" and row 12 assert one wait of 800; add a row for a throwing `validate` (state stays `{ found: null, stale: true }`).

**12-tests-validation**: define `rename` as `pickBox` then `fieldIn(page,'name').fill(name)`; row 6 "Fails before" parenthesis contradicts its steps; row 2 how a box's name is read (`.grasp-node-name` in `nodeOf(view.id,'App')`); add `aria-busy` to `read`; rel/hidden/view/none entries only in Node.

**12-impl-validation**: Plane's gate asks width and height; `.grasp-validation` is 0 high while empty, so the gate is width only.

**12-tests-about**: scenario step 2 should fail with "About is disabled (data-testid "about"), so the About panel cannot be opened." when disabled; row 3 `getAttribute('href')`; rows missing for keys behind About, closed picker, `browserEnv` failures.

**12-checks-break**: "`git status` shows nothing changed" should say "outside `canvas/dist/`".

**12-review-code**: the diff command holds steps 8-11 too; end it with step 12's files.

**12-review-shot-***: "zoomed in" contradicts "run nothing" (allow one crop command or lead hands crops); shell item 2 "40 px high" cannot be judged by eye; shell point 4 should say "here: the panels, card, strips and rules".

**12-checks-close**: order undecided (reviews vs fixes vs timed runs: re-run after the last source change, fresh reviewers); item 7 names only step 12's tests; item 8 retakes six shots but owns three; own `step-12.md` and the tasks file; `step-13.md` does not exist (it is `briefs/13-checks-close.md`).

**13-checks-close**: give the commit hashes of steps 5-7 (candidates `36f57c5`/`7ae92f5`, `b1f5bba`/`e9bb6f9`, `70acc9f`/`f608a0e`); say a commit failing only timed tests is rerun and both runs recorded; define "right" for the five questions and what follows fewer than 5; `shell.png` contradiction (retake vs only if touched); define "screenshots current"; `check.sh` needs Java and ~120 MB from conda.anaconda.org, say what to do if refused and how the saved file is made; `"step"` in status.json (13 or stays 12); one name for the tasks file; notes need a "Session 24" heading (draft is `notes-24-draft.md`); change 4 "as step 8's notes say was kept"; cut the agent-only paragraph.

**Assumed of step 9 (by step 12):** `set(...)` from outside a plane gives the node `selected`; `selectBox` still picks with step 9 built (nested `Page.app`); no `set` opens or fronts a tab or moves a camera; a plane ignores a pick it does not draw without logging; with no file the Explorer's sentence fits.

**Assumed of step 10 (by step 12):** `fill()` is one `history.edit`; a rename keeps the id; `10-impl-bar` leaves About's `_onAbout` and comments as scaffolded; with no file Details says "No file is open."; Details keystroke tests never bring Validation to the front.

## Steps 9 and 10

Readers were still running; no report.
