# Stage C of the scaffold (package 2-1): the shell's and the panels' seams

Built in /home/user/Grasp, on claude/gracious-fermi-hxid8e, from stage B's commit a12091d. One local commit: see "The
commit" at the end. Read first: stage-0.md, stage-A.md and stage-B.md in this folder.

After this stage a person meets three differences, the brief's own: a key of the table pressed where its action does not
apply says why in a toast (Ctrl + Z with nothing to undo, Ctrl + Y with nothing to redo); Escape with no tool in hand
lets go of what is picked; the greyed Undo and Redo carry their sentence as their tooltip. And one the brief does not
list by itself but seam 10 asks for: the left strip names a fourth panel, Notes, which says one sentence. Everything
else is as stage B left it: no row but the scaffold's four is in the table, so no entry of the palette, no Text button
and no New view button shows.

## For stage D and stage E: what a test finds, and what moves into helpers.mjs

Names the page now carries:

- **A control of an action**: `[data-action="<id>"]`, on the `<button>` or on the menu entry (role `menuitem`) itself.
  Greyed: a button is `disabled`, a menu entry carries `aria-disabled="true"`; either carries the sentence as
  `aria-description`, and as its tooltip. A control whose action applies has no `aria-description`.
- **A menu of choices** (an action with `choices`, asked with none): its list carries `data-choices="<action id>"`,
  each entry `data-choice="<choice id>"` and the role `menuitem`. The plan names neither attribute; these two are mine.
  So `chooseAction(page, actionId, choice?)` is: click `[data-testid="palette"] [data-action="<id>"]`, then, with a
  choice, click `[data-choices="<id>"] [data-choice="<choice>"]`.
- **The toast**: `data-said` on the element with `data-testid="toast"`, the saying's number, which grows with every
  saying of the session, a tool's or saysOf's.
- **The Notes panel**: `data-testid="notes"`; its name on the strip is "Notes". `SIDES` of helpers.mjs needs
  `Notes: 'notes'` before `showSide(page, 'Notes')` works; my tests click the strip's tab themselves.
- **New view**: `data-testid="new-view"`, an icon button at the end of each editor group's tab bar (none in the built
  page yet). **The text tab**: Dockview panel id `text`, its tab titled `<package name>.sysml`.
- **The bar**: Undo and Redo carry `data-action` while a file is open; Save carries `data-action="save"` only while the
  file has unsaved changes ("Built otherwise", 1). `wordsOf(page, 'undo' | 'redo')` of helpers.mjs still answers as
  before: the span around the button keeps the bare title as its `aria-label` while the button is greyed.

Helpers that live in a test file of mine and belong in helpers.mjs:

| Where | Helper | What it is |
|---|---|---|
| seams.test.mjs | `toastOf(page)` | Seam 12's `toast(page)`: `{ text, said }` of the toast that is up, or null. keys.test.mjs has a copy |
| seams.test.mjs | `nextToast(page, after, why)` | Waits for a toast whose `said` is larger than `after` |
| seams.test.mjs | `control(id)`, `controlOf(page, selector)` | The selector of an action's control; what a control says of itself (`action`, `testid`, `tag`, `name`, `greyed`, `says`) |
| seams.test.mjs | `tipOf(page, selector)` | The words of an element's tooltip, after the pointer rests on it (keys.test.mjs has slice 1's `tooltipOf`, for a test id) |
| seams.test.mjs | `stripOf(page)`, `editorTabs(page)` | The names on the strips; the editor's tabs with which is in front |
| seams.test.mjs | `idle(page, frames)` | Some frames to itself (keys.test.mjs has its own) |
| seams.test.mjs | `shellBench()`, `SHELL_SWAPS` and the six `STAND_IN_*` beside it | The application itself (src/main.tsx) bundled with stand-ins into a temporary folder: rows for `delete`, `show-in-view`, `new-view`, `open-text`, `add-note`, the camera's three keys, and a code section. `refusals.test.mjs` cannot use it for the built page, but a test of a control with choices can |

`pressKey(page, key)` needs nothing of mine: `page.keyboard.press('Control+z')` reaches the page's listener. A lone `+`
is pressed as `page.keyboard.press('+')`.

## What was built, file by file

Paths under canvas/app/src/ unless they begin otherwise.

### New, built

- `shell/ActionControl.tsx`: seam 8's `ActionControlProps`, `ActionButton`, `ActionItem`; `MenuEntryProps`.
- `panels/sections.ts`: seam 9's `SectionProps`, `Section`, `SECTIONS` (shown, view, code).

### New, skeletons (each with its package's contract as its comment)

- `panels/ShownSection.tsx` (2-4), `panels/ViewSection.tsx` (2-4), `panels/CodeSection.tsx` (2-8): each exports its
  component, which renders nothing, and its `Section` (`shownSection`, `viewSection`, `codeSection`), whose `applies`
  answers false.
- `panels/hooks/sequence.ts` (2-10): `SEQUENCE_HOOKS` with slice 1's locked `order` hook, and `ORDER_LOCKED`, moved as
  they were. `panels/hooks/geometry.ts` (2-11): `GEOMETRY_HOOKS`, empty.
- `panels/Notes.tsx` (2-7): `NotesPanel`, which says "The notes come with package 2-7." inside
  `<SidePanel testId="notes" title="Notes">`.
- `views/TextTab.tsx` (2-9): `TextTab({ session })`, which renders nothing.

### Changed

- `shell/App.tsx`: the page's one keydown listener, on the window, in the capture phase; `placeOf(target)`, which
  reads the four answers of `KeyPlace` off the event; `<LabelEditor session />` while a file is open; `onSave` handed
  to the dock.
- `shell/TopBar.tsx`: no key listener. Undo and Redo are ActionButtons; Save is one while the file is unsaved; a Text
  button for `open-text`. `TopBarProps` lost `onSave`. The bar's colours for an icon button moved from each button to
  one rule on the bar's root, so an ActionButton looks as the bar's own.
- `shell/Toasts.tsx`: whichever was said last, by a tool or through saysOf; `data-said`.
- `shell/Dock.tsx`, `shell/dockContext.ts`: seam 10 (below).
- `plane/Palette.tsx`: the actions under the creation tools.
- `panels/Details.tsx`: the sections under the form.
- `panels/fieldHooks.ts`: `FIELD_HOOKS` is its own hooks, then `SEQUENCE_HOOKS`, then `GEOMETRY_HOOKS`; it exports
  what the two files export.
- `panels/Tools.tsx`: no key listener; the views through `viewsOf(session)`.
- `core/session.ts`: `packageNameOf(session)` ("Built otherwise", 7). `core/commands.ts`: one comment (`putDown`: who
  calls it at Escape).
- `canvas/dist/`: rebuilt (`npm run check` holds).

### Seam 10 as built, in `shell/Dock.tsx`

- `LEFT_PANELS` is explorer, tools, validation, notes; `COMPONENTS` gains `notes` and `text`.
- `showText()` (the context's and the hand's): the panel `text`, titled `textTitle(session)`, beside a view's tab or
  in a new group, in front; asked again, brought to the front. Another file opened takes it away with the views' tabs.
- The tabs follow the model: at a change of the structure a view new to the model gets its tab, in front, beside the
  view in front; the tab of a view that left goes. A tab a person closed stays closed.
- The dock, the card of the empty editor and the Tools view read `viewsOf(session)`; no file of shell/ or
  panels/Tools.tsx reads `session.model`.
- `TabBarEnd` (Dockview's `leftHeaderActionsComponent`): the New view ActionButton in each group of the editor.
- The hands: `handsOf(session).give({ save: onSave, showText, showView, showPanel, camera: lentCamera, reveal:
  lentReveal, copy })` while the session is in the dock, null when it leaves.

### Tests (canvas/app/test/)

- `seams.test.mjs`: 9 more. In the built page: "a greyed ActionButton carries its sentence"; "the toast shows what was
  said last, by a tool or through saysOf, and carries data-said"; "the Notes panel stands on the left strip after
  Validation, and the controls of rows that are not built are not shown". In the application with stand-in rows: "the
  palette lists an action that applies"; "a key of an action acts from the page, and says why where the action does not
  apply"; "New view opens its choices as a menu, and the tabs follow the model's views"; "the dock lends its hands: the
  text tab, and a side panel shown"; "Details shows, under its form, each section that applies". In Node: "fieldHooks
  holds its own hooks, the sequence file's and the geometry file's, and a hook a package adds is the field's".
- `keys.test.mjs`: 3 more: "a key pressed where its action does not apply says why in a toast"; "with no file open a
  key does nothing and says nothing"; "Escape with no tool in hand lets go of what is picked".

## Built otherwise than the plan says, each with its reason

1. **Save is an ActionButton only while the file has unsaved changes.** The brief says "Undo, Redo and Save become
   ActionButtons", and section 5 says the row `save` applies always (Ctrl + S saves whether or not anything is
   unsaved; `refusals.test.mjs` names it among the five that always apply). An ActionButton greys itself by `applies`
   alone, so a Save that is one at every moment is never greyed. But slice 1 greys Save until there is something to
   save, `keys.test.mjs › Save, Undo and Redo are enabled only when they have something to do` holds that and is line
   83 of section 7 by its name, and the brief says everything but its four differences is as slice 1 left it. So while
   the file is saved, and for all three buttons while no file is open (there is no session to ask an action with), the
   bar shows its own greyed button, with the same test id, name and tooltip and no `data-action`. **The lead's to
   decide**: open question 1.
2. **`ActionItem` takes two props beyond `ActionControlProps`**: `autoFocus` and `tabIndex` (`MenuEntryProps`).
   Material UI's MenuList gives them to the child it puts the focus on as its menu opens; an ActionItem that dropped
   them would leave a menu that begins with an action with no entry focused.
3. **`label` on an icon button is its tooltip's words while its action applies.** The seam says of `label`: "the
   words shown, when they are not the action's title". The top bar needs it so: "Undo Moved part def Host" is slice
   1's tooltip, and the seam gives no other prop for it. The button's accessible name stays the action's title.
4. **A control listens to the session and to the selection**, not to the notes by themselves: `session.listen` tells
   after every change the notes tell of (stage A's session.ts), so a third listener would ask `applies` twice.
5. **Greyed, a button is `disabled`; a menu entry is `aria-disabled` and still takes the pointer.** The seam says
   "greyed … A click calls ask". A disabled button takes no click, as slice 1's did, and its tooltip hangs on a span
   around it. A greyed menu entry cannot be wrapped (a MenuList's children must be its entries), so it keeps the
   pointer for its tooltip; a click on it asks, which says the sentence as a toast too, and the menu stays open.
6. **`data-choices` and `data-choice`** name a menu of choices and its entries. The plan names no way to find them.
7. **`packageNameOf(session)` in `core/session.ts`**, which is not mine. Seam 10 titles the text tab
   `<package name>.sysml`, and a component may read no field of a model's record (contract 22); `core/session.ts` is
   the module of that contract that gives the dock the views. A package with no name gives `model.sysml`.
8. **The keydown listener is in the capture phase.** The seam says "on the window". Material UI's Menu stops Escape
   before it reaches the window (React stops the native event at the portal's container), and slice 1's
   `palette.test.mjs › a right-click is not the tool's click, and Escape closes the menu and puts the tool down` holds
   that one Escape does both; slice 1's Tools panel listened in the capture phase for the same reason.
9. **A saying that was shown before a later one does not come up again.** "Whichever was said last" would show
   saysOf's older saying again as soon as the tool takes its newer one back (the tool is put down), since saysOf never
   takes a saying back. The toast keeps the largest number it has shown.
10. **Each section's file exports its `Section` object**, which `sections.ts` lists. The seam gives the type and the
    list and does not say where a section's `applies` is written; the brief of 2-4 says "each with its `applies`".
11. **The sections are drawn inside the form's root** (`.grasp-details`), after the page, whichever tab is shown, with
    no wrapper of Details' own. So a field of a section is inside `data-history-keys`, and Ctrl + Z in it is the
    history's, which the code links and a view's options need (each is a run of typing in one undo step).
12. **`fieldHooks.ts` exports everything the two hook files export** (`export *`), and `ORDER_LOCKED` moved into
    `hooks/sequence.ts` with the hook. So package 2-10 can drop the sentence with the locked hook without touching
    `fieldHooks.ts`; slice 1's tests still find `ORDER_LOCKED` on the module until then.
13. **The New view button stands in every group of the editor**, a split or a floating one too, since Dockview's
    header actions are a group's. A new view's tab goes beside the view in front.
14. **The Notes skeleton says "The notes come with package 2-7."**, with or without a file. The task named "the empty
    state every panel had in slice 1"; slice 1's skeletons said "The model's problems come in step 12." in that place.
15. **`hands.copy` rejects with an Error ("This page has no clipboard.") when the browser gives the page no
    clipboard**, and otherwise with the browser's own. Nothing calls it yet, and no test of mine does.
16. **`TopBarProps` lost `onSave` and `DockProps` gained it**: the bar asks the action, and the action's hand is given
    by the dock.

## Tests of slice 1 that were changed, each with the plan's sentence

None. I added three tests to `keys.test.mjs` and changed none of slice 1's. The task expected changes for the keys,
Escape and the greyed buttons; the reasons none was needed:

- The keys' tests press keys where their actions apply, or behind a dialog, or in a text field; `pressed()` holds
  those rules unchanged.
- `tools-panel.test.mjs › Escape puts the tool down` presses a second Escape with nothing picked.
- No test read a greyed Undo's tooltip. `wordsOf` of helpers.mjs reads the `aria-label` of the span around the
  button, and that stays the bare title while the button is greyed ("Built otherwise", 3 and the comment of
  `ActionButton`); the sentence is the tooltip's text and the button's `aria-description`.
- No test counted the names on the left strip.

No test was loosened, skipped or marked todo. `# todo` is 0: none of the plan's seven todo tests is in this tree yet
(they are stage D's).

## The tests written first, and how each failed before the code

Run against stage B's tree (`stage-c-seams-before.log`, `stage-c-keys-before.log`):

| Test | Before the code |
|---|---|
| a greyed ActionButton carries its sentence | Undo's `action` null, `says` null: not strictly deep-equal |
| the toast shows what was said last… | "Ctrl + Z with nothing to undo: no new toast came up" |
| the Notes panel stands on the left strip… | the strips name Explorer, Tools, Validation, Details |
| the palette lists an action that applies | the palette's rows end with the tools |
| a key of an action acts from the page… | "Delete with nothing picked: no new toast came up" |
| New view opens its choices as a menu… | no `[data-testid="new-view"]` |
| the dock lends its hands… | no control of `open-text` in the bar |
| Details shows, under its form, each section that applies | "With Host picked, Details holds [what, tabs, page]" |
| fieldHooks holds its own hooks… | `SEQUENCE_HOOKS` undefined |
| a key pressed where its action does not apply says why in a toast | "Control+z with nothing to do said nothing new" |
| with no file open a key does nothing and says nothing | **passed**: slice 1 says nothing there either; it is held from here on |
| Escape with no tool in hand lets go of what is picked | "After Escape with no tool in hand Host is still picked." |

Two mistakes of my own tests showed only once the code was there, and were mended in the tests: the palette's tools
depend on the right-click's point (the test now gives the core the same point), and a tab's close button shows only on
the tab in front.

Seven mutations were tried against the new tests and put back, each failing the test named: the palette listing every
built row of PALETTE whether it applies or not (seams, "the palette lists"); a click that opened a second level going
on to the list (the same); the dock not following the views (seams, "New view"); the geometry table not joined (seams,
"fieldHooks"); an older saying coming up again (seams, "the toast"); no `aria-description` on a greyed button (seams,
"a greyed ActionButton"); the listener in the bubble phase (`palette.test.mjs`, slice 1's "Escape closes the menu and
puts the tool down").

## Measurements

Container: 4 processors, Node 22.23.4. Stage D ran its own `npm test` beside most of these (the load average was 2.8 to
3.9 through the second full run and the three runs alone, and rose again during the third full run), so none but the
first full run is near a measurement judged alone.

| Command | Result |
|---|---|
| `npm run build` | exit 0; app.js 207.9 kB (194.2 after stage B), app.css 19.7 kB |
| `npm run check` | exit 0 |
| `npm test`, run 1 (before the bar lost its `onSave` prop and the ActionButton's span became unconditional) | 549 tests, 60 suites: 549 pass, 0 fail, 0 todo; 394 s |
| `npm test`, run 2, on the tree that is committed, load 3.2 | 549 tests: 547 pass, 2 fail, 0 todo; 404 s. Both failures are timed tests of scale.test.mjs, below |
| `node --test --test-timeout=120000 canvas/app/test/scale.test.mjs`, three times, load 2.8 to 3.7 | 6 of 7, 7 of 7, 7 of 7 |
| `npm test`, run 3, on the tree that is committed, after stage D's run had ended (load 1.6 at its start, 3.6 at its end) | **549 tests, 60 suites: 549 pass, 0 fail, 0 todo; 407 s** |

The timed failures of run 2: a drag step 17.2 ms starting and 12.5 following, against 16; a pan step of definitions
16.9 / 12.9 against 16, and of workflows 26.6 / 12.7 against 25. Run by itself three times afterwards each passed each
time. In the first of those three another timed test failed once: a keystroke 51.8 ms opening a step, against 50; the
other two runs gave 40.6 and 41.7.

scale.test.mjs's medians, in ms (starting / following, or opening / joining):

| | full run 1 | full run 2 (load 3.2) | alone 1 | alone 2 | alone 3 | full run 3 (committed) | limit |
|---|---|---|---|---|---|---|---|
| the 5,000-element model opens | 720 | 910 | 852 | 849 | 812 | 736 | 5,000 |
| a drag step | 12.4 / 14.6 | **17.2** / 12.5 | 12.1 / 11.1 | 10.7 / 9.5 | 11.5 / 11.0 | 14.3 / 11.4 | 16 |
| a keystroke in a name | 32.9 / 29.9 | 41.2 / 36.6 | **51.8** / 34.1 | 40.6 / 32.7 | 41.7 / 31.8 | 42.8 / 28.4 | 50 |
| a keystroke, Validation shown, 150 problems | 36.3 / 28.8 | 45.8 / 39.1 | 39.7 / 33.7 | 36.6 / 31.1 | 32.6 / 35.0 | 29.1 / 31.5 | 50 |
| a pan step, definitions | 11.2 / 9.5 | **16.9** / 12.9 | 11.6 / 9.1 | 8.9 / 11.0 | 10.4 / 12.7 | 13.4 / 12.1 | 16 |
| a pan step, deployment | 9.6 / 10.7 | 10.3 / 11.3 | 9.5 / 9.5 | 11.3 / 8.9 | 10.7 / 9.6 | 9.8 / 10.9 | 16 |
| a pan step, workflows (2,112 nodes) | 22.0 / 15.5 | **26.6** / 12.7 | 20.6 / 20.8 | 15.6 / 16.9 | 15.8 / 19.0 | 15.4 / 14.9 | 25 |

instant.test.mjs passed in every run.

What stage C adds to a step: at each change the session tells of, two or three ActionButtons of the bar ask `applies`
(one comparison of a list's length each), and the Tools view compares the views' rows; at a keystroke in a name the
bar's Undo renders with new words, as slice 1's did. Nothing is added to a step of a drag or of a pan. No limit was
changed. Stage E's three runs with nothing else running are still to be made.

## What I tried and dropped

Built, and taken out again:

- **The tooltip only around a control that has one.** The button would then be another element each time its action's
  answer changed, and lose the focus with it. The span and the tooltip are always there now; an empty tooltip shows
  nothing.
- **`onSave` kept in `TopBarProps` though the bar no longer called it**, "as the bar's contract with App had it". A
  prop nothing reads is no contract; it went.

Weighed, and not built:

- **Save as an ActionButton at every moment**, greyed by nothing: it changes what a person meets beyond the brief's
  list and turns over a test of slice 1 whose name section 7 cites.
- **A greyed ActionButton with `aria-disabled` in place of `disabled`**, so that it keeps the keyboard's focus and a
  click on it says the sentence in a toast: slice 1's buttons are `disabled`, and the brief changes their tooltip only.
- **The greyed button's sentence as the `aria-label` of the span around it** (what Material UI's Tooltip does by
  itself): `wordsOf` of helpers.mjs, which I may not change, would read the sentence as a step's words.
- **The palette closing before the action is asked** (a capturing click on its list): it cannot tell a click that
  only opens a second level from one that asks. The entry stops the first kind instead, and the list closes on what
  comes up to it.
- **Reading the package's name in the dock** (`session.model.package.name`): contract 22.
- **Clearing a saysOf toast when the model changes**: the plan has a saying stay until the next, and an action may
  say something right after its own edit.

## Open points for the lead

1. **Save's button against its row** ("Built otherwise", 1). The plan asks for an ActionButton of a row that always
   applies, and for the page to behave as slice 1, where Save is greyed while there is nothing to save. As built, the
   greyed Save is the bar's own button and carries no sentence.
2. **Keys that acted in slice 1 and are no shortcut now** (stage A's open point 3) are live from this stage: Ctrl or ⌘
   + Shift + S is no longer taken, so the browser's own Save opens for it; Ctrl or ⌘ + Shift + Y no longer redoes;
   Escape with Shift, Ctrl or Alt held no longer puts the tool down. No test presses them. Slice 1's written contract
   named none of the three; its code took them.
3. **Escape lets go of what is picked from more places than a person may expect.** One Escape that closes a
   right-click palette, a menu of choices or a toast also lets go of the selection when no tool is in hand (section 5:
   "`Delete` and `Escape` act from such a widget"; slice 1 already had one Escape close the palette and put the tool
   down). Escape also acts with the focus on a checkbox or a radio button of Details, where slice 1's Tools panel did
   nothing (stage A's open point 4): `KeyPlace.typing` is the top bar's narrower test of a text field.
4. **A toast said through saysOf stays** until its 8 s, Escape, or the next saying. After "There is nothing to redo."
   a drag or a working Undo leaves it up. The tool's own toast leaves when the tool does something else.
5. **Line 66 of section 7 against seam 8.** The palette lists an action only where it applies, so "Add note is greyed
   and says why" cannot be met in the palette on a start node: the entry is not there. The Notes panel's Add note
   button, asked with no hit, is where it is greyed. Package 2-7's brief should say which.
6. **The focus after an entry of the palette.** The palette closes in the same render in which the action ran, and
   Material UI then gives the focus back to what had it before the menu. An action that puts the focus somewhere
   (the label editor's box, a note's text) must do it after that frame. 2-7's brief says so; 2-3's does not, and
   `edit-label` is an entry of the palette.
7. **After a click on a view's tab the focus is on the tab**, which Dockview gives the role `tab` inside a `tablist`.
   By section 5's rule the arrows, F2 and a typed character do not act from there, so the arrow keys will not move
   the plane and typing will not open the label editor until the plane is clicked. For 2-3 and 2-14.
8. **The palette's list is still named "Make here"** (`aria-label`), though it now also lists what can be done.
9. **`shell.png`, `example.png` and the other screenshots show the left strip**, which now names Notes. The plan has
   2-14 retake `example.png` and `shell.png` at the slice's close; I retook none.
10. **canvas/app/README.md** is staler by this stage ("three keys are listened for by components", the list of
    panels, "How to add: a command"). The plan gives it to 2-14's closing.
11. **`TOOLS_TEXT.notDrawn` and the card still say "The old page draws it until slice 2."** Untouched: slice 1's tests
    hold the sentences, and the bodies' packages change them.

## Left for later stages

- **Stage D**: `SIDES` and `TESTIDS` of helpers.mjs (`notes`, `new-view`, the toast's `data-said`), and the helpers
  of the table above, from this report's first section.
- **Stage E**: the helpers moved; the three runs with nothing else running.
- **Packages**: 2-3 (`LabelEditor` is mounted by App; `edit-label` shows in the palette once its row is built), 2-4
  (the two sections, the New view button, the rows of the palette), 2-7 (the Notes panel, `showPanel('notes')`), 2-8
  (the code section), 2-9 (the text tab and the bar's Text button), 2-10 and 2-11 (the hook files), 2-14 (the
  camera's rows reach a plane through `hands.camera`, which the stand-in rows of seams.test.mjs already use).

## The commit

`df6b93d`, local, not pushed: "wip(2-1): stage C, the shell's and the panels' seams". 23 files: canvas/app/src/shell/
(6), panels/ (10), plane/Palette.tsx, views/TextTab.tsx, core/ (2), canvas/app/test/ (2) and canvas/dist/app.js. Nothing
under canvas/src, canvas/test or plan/ changed, no file that unchanged.json lists (unchanged.test.mjs passes), and none
of stage D's five files (helpers.mjs, core.mjs, fixtures.test.mjs, connect.test.mjs, reconnect.test.mjs). The tree is
clean after it.

The logs of this stage are beside this folder, in
/tmp/claude-0/-home-user-Grasp/c7f4c0c3-3293-5171-8b1a-2fc91a0152d6/scratchpad/: stage-c-seams-before.log,
stage-c-keys-before.log, stage-c-test-1.log to stage-c-test-3.log, stage-c-scale-1.log to stage-c-scale-3.log, and the
four pictures of the application with stand-in rows in look-c/.
