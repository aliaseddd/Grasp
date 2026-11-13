# Step 10 of slice 1: Details

This file is the scaffold of one step. `README.md` in this folder says how a swarm fills a scaffold in, and `shared.md` holds the contracts the steps share. The contracts of this step are the comments in `canvas/app/src/panels/fieldHooks.ts` and `canvas/app/src/panels/Details.tsx`, and the end of `Dock`'s comment in `canvas/app/src/shell/Dock.tsx`. Where this file and a comment disagree, the comment stands and this file is wrong.

## 1. What the step delivers

`plan/slice-1.md`, section 5, step 10:

> - **What it delivers.** Details shows the fields of what was picked last, as Material UI widgets laid out by `M.detailsOf`: a Core and an Advanced tab under the metaclass's title. A `string`, `text` or `number` row is a text field, a `bool` a checkbox, an `enum` radio buttons, a `ref` a picker of the row's `options`. What the library knows but does not hold as a field is shown, and the rest says "not held yet", as today. Every change goes through `edit()`. Typing uses the key `<field>:<id>`, so a field is one undo step, ended when the field is left.
> - **The hooks.** `fieldHooks.ts` ports them: the definition and its line, Specializes and Subsets, the lock on Is Parallel, and the words of each change. A message's `order` is shown but cannot be changed until slice 2 draws sequence views, because changing it must re-sort the messages. The code links wait for slice 2 as well.
> - **Files.** The step creates `canvas/app/src/panels/Details.tsx`, `fieldHooks.ts` and `canvas/app/test/details.test.mjs`. It changes `canvas/app/test/scale.test.mjs`.
> - **Done when.** `details.test.mjs` passes: every field that every kind, line and view lists in the example and the fixtures, changed through its widget, is one undo step, undone and redone, as `canvas/test/fields.test.mjs` walks them today; a rename shows on the box, the tab and the row as it is typed; picking another definition moves the typing's end. "a keystroke in a name takes under 50 ms at 5,000 elements" passes without its todo mark.

Section 10 adds, at this step, a part of criterion 6: "With the 13-element example ... a keystroke in a name [takes] under 16 ms by the median of 9 samples", a test in `instant.test.mjs`. Criterion 5's keystroke limit is the scale test above. Criteria 2 and 6's earlier parts go on holding: no test of theirs changes.

"The typing's end" in "Done when" is the end of the usage's FeatureTyping relationship, its `to`: the old test's "picking another moves the line's end".

What the plan leaves open, and how this scaffold settles each:

1. **Where the port lives.** Everything that needs no React is in `panels/fieldHooks.ts`: the hooks, the labels, the form of what is picked as plain data (`formOf`), the one function that changes a field (`changeField`), and the end of a run of typing (`endTyping`). `Details.tsx` only draws the form and holds what is typed. So the words, the layout and every field of every item of the ten files are tested in Node, in milliseconds, and the browser's tests are about widgets.
2. **What "every field ... in the example and the fixtures" walks.** Two walks. In Node, every field of every element, line and view of the ten files, 262 items and about 790 changes, through `changeField`. In the page, one item of each kind, each of its fields once through its widget, 139 changes, on the fixtures merged into one model as `canvas/test/fields.test.mjs` merges them today: its `mergedFixtures` gives every usage a definition and every kind a specialization line, so that the fields which show only then (the box that draws the line, Specializes, Subsets) show for every kind. The page's walk is five tests, since one test of 139 changes would run for most of a minute.
3. **The layout.** The tabs first, then on each tab the metaclass's title over its rows: the picture of section 4 and the old page both have it so, and "under the metaclass's title" is read as "each tab's rows are under the title". Above the tabs one line says what is shown (`part def Host`), since with several things picked, or a line, nothing else on the panel says which thing the fields are of.
4. **The labels and the order.** The old page's own, from its markup (`canvas/src/core/page.html`), in `FIELD_LOOKS` and `GROUP_ORDER`: "Declared Name", "Typed by", "draw the defined-by line". A row of `FIELDS` has only the field's word in a sentence ("definition").
5. **A label above its field.** Material UI's floating label is drawn at three quarters of the text's size, under 10 px at the plan's 13 px. A text field and a picker carry their label above them at 12 px, as the plan's picture has it.
6. **A `ref` is Material UI's Autocomplete.** Its empty choice is the first entry of its list, in the old page's words ("nothing yet"; "nothing: take the line away"), so it has no clear button. Its list is worked out when it is opened, never when the form is made: at 5,000 elements Specializes's list costs 400 ms outside a reading of the model. The list is not limited: 600 choices open in 50 ms, and a windowed list belongs to slice 4's generic form.
7. **Radio buttons** are in the order of the row's `values`, so a value added to a row needs no second list. The old markup had `in, out, inout` where the row has `in, inout, out`.
8. **Where typed text lives.** In the row's own draft, shown while it still reads as what the model holds. The model gets the text as the row reads it (trimmed, or a number) at every keystroke; the input keeps exactly what was typed, so React never rewrites it under the caret; an Undo that changes the field shows the model's value. When the field is left the draft goes, and the field shows what the model holds: `  0..1  ` becomes `0..1`, and a text that was no number is gone.
9. **When a run of typing ends.** When the field loses the focus; at Enter in a one-line field; when the row is unmounted with its run open; and by the history's own rule when another change, an Undo or a Redo comes first. The old page ended it at the input's `change` event, which is the first two.
10. **Escape** does nothing in a field, as on the old page. Step 11 gives Escape to the tool in hand, and must leave alone an Escape that comes from a text field, as the old page does.
11. **A locked field** is disabled and says why under itself, where the old page said it only on hover.
12. **A message's order** is locked with a sentence of its own, `ORDER_LOCKED`.
13. **An empty name** is allowed and means an unnamed element, as today: the words say `(unnamed)`. Nothing is refused by Details; the Validation panel (step 12) is where a missing name is said.
14. **Several things picked.** Details shows the last picked, `selection.last`, and says nothing of the others.
15. **A field that shows only in some kinds of view** (the nine spatial fields, in a geometry view) is checked against the view in front when it places the item, else the first view that places it, else the view in front: the old page's `viewKindShowing`, with "the active view" read as "the view in front".
16. **The tab that is shown** is kept while the selection changes and while another file is opened, and starts at Core at every load of the page.
17. **What Details says with nothing to show**: `NO_FILE` with no file, `NOTHING_PICKED` with a file and nothing picked.
18. **What slice 1 leaves out** and how it shows: nothing is shown for it at all. The code links (`code`, which has no look and so no row), notes, Delete, Remove from view, Edit label, a view kind's options and "Show in this view", "Shown in ..." under the fields, the selection's problems. Each is slice 2's by section 2 of the plan, except the problems, which are the Validation panel's in the new page.
19. **The old hooks' `done`** is not ported. It redrew the panel (the listeners do), relabelled notes (slice 2), and wrote the status line, which the new page has not. The one sentence a person might miss, "It shows as text; tick the box to draw the line too.", is said by the box itself, which appears unticked under the picker.
20. **The dense sizes**: a one-line field's box and the tabs' row are 32 px high (`FIELD_HEIGHT`), a checkbox's and a radio's row 28 px (`CHECK_HEIGHT`). They are constants of `Details.tsx`; `shell/theme.ts` is not changed.

## 2. The files

| File | What it holds | Task |
|---|---|---|
| `canvas/app/src/panels/fieldHooks.ts` | New. The library's rows as the fields read them, the words that are no field's, `FIELD_LOOKS` and `GROUP_ORDER` (final), `FIELD_HOOKS`, `formOf`, `viewKindFor`, `whatOf`, `optionsOf`, `readText`, `fieldKey` (final), `changeField`, `endTyping`. No React, no DOM. | `10-impl-hooks` |
| `canvas/app/src/panels/Details.tsx` | `DetailsPanel` (today's empty state until built), `PickedForm`, `FormRow`, the panel's words and sizes. | `10-impl-details` |
| `canvas/app/src/panels/details.css` | The panel's own rules, for classes beginning `grasp-details`, `grasp-detail` and `grasp-field`. | `10-impl-details` |
| `canvas/app/src/shell/Dock.tsx` | A view's tab follows its view's name: the last item of `Dock`'s comment. | `10-impl-dock` |
| `canvas/app/src/shell/TopBar.tsx` | The bar's Undo and Redo keys act from a checkbox and a radio button: the keys' item of `TopBar`'s comment, "Step 10". Session 24's scaffolding found that the bar took every `<input>` for a text field. | `10-impl-bar` |
| `canvas/app/test/fieldHooks.test.mjs` | New. Node tests of `fieldHooks.ts`. | `10-tests-hooks` |
| `canvas/app/test/details.test.mjs` | New. The tests "Done when" names. | `10-tests-details` |
| `canvas/app/test/details-fields.test.mjs` | New. Every behaviour of a field and of the panel. The plan does not name this file: one writer on `details.test.mjs` would have owned forty tests. | `10-tests-fields` |
| `canvas/app/test/instant.test.mjs` | One test more: criterion 6's keystroke. | `10-tests-instant` |
| `canvas/app/test/scale.test.mjs` | The todo mark of "a keystroke in a name takes under 50 ms at 5,000 elements" comes off. Nothing else in it changes. | `10-checks-close` (the lead) |
| `plan/status.json`, `plan/notes.md`, `canvas/dist/` | Check 9 passes, `step` 10; the session's entry; the built page. | `10-checks-close` (the lead) |

Step 10 takes no screenshot. `shell.png`, retaken at step 13, will read "No file is open." in Details.

The tasks, which `tasks-10.json` holds with their needs. The four test writers and `10-impl-hooks` need nothing of step 9 and can start with the swarm (`10-impl-hooks` once `10-tests-hooks` is in). `10-impl-details` needs `10-impl-hooks`, the three browser test files, and step 9's `9-impl-selection`, `9-impl-explorer`, `9-impl-plane` and `9-impl-dock`. `10-impl-dock` needs `9-impl-dock` and `10-impl-details`, since its one test renames a view through Details. Then `10-checks-break` and `10-review-code`, side by side, and `10-checks-close`.

## 3. The contract between tests and code

### What the page renders

Everything below is inside `[data-testid="details"]` (the panel's root, `SidePanel`'s), except a picker's list, which Material UI puts at the end of `<body>`.

| What | How a test finds it |
|---|---|
| What Details says while it shows no form | `.grasp-side-text`, whose text is `NO_FILE` or `NOTHING_PICKED`; then no `.grasp-details` is in the panel |
| The form of what was picked last | `.grasp-details[data-picked="<type>:<id>"]`, type `el`, `rel` or `view`; then no `.grasp-side-text` is in the panel |
| What is shown, in words | `.grasp-details-what`: `part def Host`, `connection mount, api to api`, `view proofStructure` |
| The tabs | role `tablist` named "Details"; in it role `tab` named "Core" and "Advanced", the one shown with `aria-selected="true"` |
| The page of the tab shown | `.grasp-details-page[role="tabpanel"][data-tab="Core"]` or `[data-tab="Advanced"]`; only the one shown is in the document |
| The metaclass's title | `.grasp-details-title` in the page: `Part Definition Properties` |
| A group of rows | `.grasp-details-group[data-group="main"]`, `"typing"`, `"general"`, `"geometry"` on Core, in that order, an empty one absent; `[data-group="advanced"]` on Advanced |
| A field's row | `.grasp-field[data-field="<field>"]`; with the class `locked` when it cannot be changed, and then `.grasp-field-why` in it holds the reason |
| A text field (`string`, `number`) | `input[type="text"][data-testid="field-<field>"]`; `disabled` when locked |
| The documentation (`text`) | `textarea[data-testid="field-doc"]` |
| A checkbox (`bool`) | `input[type="checkbox"][data-testid="field-<field>"]` |
| Radio buttons (`enum`) | `[role="radiogroup"][data-testid="field-<field>"]` holding one `input[type="radio"][value="<value>"]` per value, in the row's order; the empty value is `value=""` |
| A picker (`ref`) | `input[role="combobox"][data-testid="field-<field>"]`, whose `data-value` is the id it holds (`""` for none) and whose value is that choice's label |
| A picker's list, while open | `[role="listbox"]` anywhere in the page, holding one `[role="option"][data-option="<id>"]` per choice, the empty choice first with `data-option=""` |
| A widget's name | its label: `getByLabel('Declared Name', { exact: true })` inside the panel finds a text field's input or a picker's; `getByRole('checkbox', { name })`, `getByRole('radiogroup', { name })` the others. A text field's and a picker's label is `label.grasp-field-label` above it |
| A row the library knows | `.grasp-detail[data-detail="<attribute>"]` with `.grasp-detail-label` and `.grasp-detail-value`; an empty string reads `(none)`; true or false is a disabled checkbox named by the label |
| A row Grasp does not hold | `.grasp-detail.not-held[data-detail="<attribute>"]`, whose value reads `not held yet` and whose `title` is "The canvas doesn't hold `<label>` yet: the text leaves it as SysML has it." |

`fieldIn(page, name)` of `helpers.mjs` finds each widget's input: the text field's, the textarea, the checkbox, the first radio button, the picker's.

Outside the panel, read by this step's tests:

| What | How a test finds it |
|---|---|
| The words of the step Undo takes back, and Redo makes again | The `aria-label` of the element around the bar's button, which Material UI's Tooltip sets to its title: "Undo Renamed to part def HostX"; just "Undo" with no step. `wordsOf` below reads it without a hover. |
| A box's name on a plane | `.grasp-node-name` in `nodeOf(viewId, id)`; a usage's name line holds its definition, `hosts : Host [1..*]` |
| A line's two ends on a plane | React Flow's `aria-label` on `.react-flow__edge[data-id="<id>"]`: "Edge from Page.hosts to Host" |
| A view's tab | role `tab` named `tabTitle(view)`: `proofStructure : GeneralView` |
| A row of the Explorer | `rowIn(page, type, id)`; its `textContent` holds the element's or the view's name |

### How a test reads and changes each widget

| Row type | Read | Change |
|---|---|---|
| `string`, `text` | `fieldIn(page, f).inputValue()` | `.click()`, `Control+End`, `page.keyboard.type(...)`; `Tab` leaves the field |
| `number` | the same | `.click()`, `Control+A`, type the number, `Tab` |
| `bool` | `fieldIn(page, f).isChecked()` | `.click()`; by the keyboard, `.focus()` and `Space` |
| `enum` | the `value` of `[data-testid="field-<f>"] input:checked` | `.click()` on `[data-testid="field-<f>"] input[value="<v>"]`; by the keyboard, focus the checked one and `ArrowRight` |
| `ref` | `fieldIn(page, f).getAttribute('data-value')`; `.inputValue()` is the label | `.click()` opens the list; `.click()` on `[role="listbox"] [role="option"][data-option="<id>"]` picks. By the keyboard: `ArrowDown` opens the list with the present choice lit (`.Mui-focused`), `ArrowDown` and `ArrowUp` move, `Enter` picks, `Escape` closes |
| The tabs | `aria-selected` of each | `.click()`; by the keyboard, focus a tab and `ArrowRight` or `ArrowLeft` shows the other |

A text field's change is in the model at once, at every keystroke. A checkbox's, a radio button's and a picker's is a step at once.

### The words the page says

| Where | Words |
|---|---|
| No file open | `No file is open.` |
| A file open, nothing to show | `Nothing is picked. Click a box, a line or a row of the Explorer to see its fields.` |
| The tabs | `Core`, `Advanced` |
| A row Grasp does not hold | `not held yet` |
| An empty known value | `(none)` |
| A picker's empty choice | `nothing yet` (Typed by, of a usage); `nothing: take the line away` (Specializes, Subsets); `nothing` (Item, and an interface's Typed by) |
| An element with no name, in a picker and in a change's words | `(unnamed)` |
| Is Parallel, locked | `Is Parallel can't change while <describe> holds transitions, as in SysON.` |
| A message's order, locked | `The order can't be changed here yet. The old page changes it until slice 2.` |

The fields' labels and placeholders are `FIELD_LOOKS` in `fieldHooks.ts`, which is final. An enum's choices are labelled by their values, except the empty one: `unset` for Direction and for Kind under a state, `none` for Shape.

### The words of each change

They are the undo step's words, so Undo's and Redo's tooltips, and the log's entry. `describe` is the library's `describe(model, el)`; `describeRel` its `describeRel(model, rel)`.

| Field | Words | In the example |
|---|---|---|
| `name` of an element | `Renamed to ` + describe | `Renamed to part hostsx in Page` |
| `name` of a line | `Named the ` + describeRel | `Named the connection mountx, api to api`; emptied, `Named the connection api to api` |
| `name` of a view | `Renamed the view to ` + the name, trimmed, or `(unnamed)` | `Renamed the view to proofStructureXy` |
| `abstract` | `Made abstract: ` or `Made concrete: ` + describe | `Made abstract: part def Page` |
| `conjugated` | `Conjugated ` or `Unconjugated ` + describe | `Unconjugated port api in hosts` |
| `doc` | `Wrote the doc of ` + what | `Wrote the doc of part def Page`; `Wrote the doc of the connection mount, api to api`; `Wrote the doc of view proofStructure` |
| `type` | `Defined ` + describe + ` by ` + the definition's name; `Undefined ` + describe | `Defined part hosts in Page by ServerHost`; `Undefined part hosts in Page` |
| `typeLine` | `Drew the line ` or `Hid the line ` + describeRel of the typing | `Hid the line hosts defined by ServerHost` |
| `specializes` | `Made ` + describe + ` specialize ` + name; `Took away the specialization of ` + describe | `Made part def ServerHost specialize App`; `Took away the specialization of part def ServerHost` |
| `subsets` | `Made ` + describe + ` subset ` + name; `Took away the subsetting of ` + describe | |
| Any other | `Set the ` + the row's `label` + ` of ` + what + ` to ` + the value | `Set the multiplicity of part app in Page to 1..2`; emptied, `... to nothing` |

`what` is describe for an element, `the ` + describeRel for a line, the library's `describeView` for a view. The value is `nothing` for an empty one, an element's name for a ref, and else the value as text. In other fixtures: `Set the length of part room to 9` and `Set the shape of part room to Sphere` (`geometry.json`); `Set the item of the flow command, ctrl to ctrl to Fuel`, `Set the interface def of the interface fuelLine, fuelOut to fuelIn to CtrlLink` and `Set the direction of item supply in FuelPort to in` (`interconnection.json`); `Set the parallel of state running in HostLifecycle to false` and `Set the guard of the transition mount, idle to loading to ready` (`behavior-states.json`); `Set the kind of action compile in Release to send` (`behavior-actions.json`).

### The numbers

| What | Value |
|---|---|
| The key of a field's run of typing | `<field>:<id>`: `name:Host` |
| A one-line field's box; the tabs' row | 32 px high |
| A checkbox's row, a radio button's row | 28 px high |
| Text in a field | Roboto, 13 px; a label, a title, a reason: 12 px |
| A keystroke in a name, 5,000 elements | under 50 ms by the median, the keystroke that opens a step and those that join it each (`scale.test.mjs`) |
| A keystroke in a name, the example | under 16 ms by the median of 9 samples (`instant.test.mjs`) |
| `formOf` at 5,000 elements, in Node | 2 to 4 ms as measured; the test's bound is 50 ms |
| `optionsOf` at 5,000 elements, in Node | 3 to 5 ms as measured; the test's bound is 100 ms |

### What the browser's test files share

`canvas/app/test/helpers.mjs` holds these, at its end, since the scaffold; `details.test.mjs` and `details-fields.test.mjs` import them from there by these names and do not write them again. Their text, as it stands in `helpers.mjs` (there each is exported):

```js
const DETAILS = byTestId(TESTIDS.details);
const NO_FILE = 'No file is open.';
const NOTHING_PICKED = 'Nothing is picked. Click a box, a line or a row of the Explorer to see its fields.';

/** What Details says while it shows no form, or null. */
const saysIn = (page) => page.evaluate((root) => document.querySelector(`${root} .grasp-side-text`)?.textContent ?? null, DETAILS);
/** What Details shows the form of, "<type>:<id>", or null. */
const shownIn = (page) => page.evaluate((root) => document.querySelector(`${root} .grasp-details`)?.getAttribute('data-picked') ?? null, DETAILS);

/**
 * With a file open and nothing picked, Details says so. Every test calls it once its file is open and before it
 * picks anything, so that against a page whose Details is not built the test fails for that, in these words.
 */
async function nothingPicked(page) {
  await showSide(page, 'Details');
  const says = await soon(page, () => saysIn(page), 'Details says nothing: it holds no paragraph (.grasp-side-text) and no form.');
  assert.equal(says, NOTHING_PICKED, `Details reads "${says}", not "${NOTHING_PICKED}": Details is not built.`);
}

/** Waits until Details shows the form of an item. `how` says how it was picked, for the failure. */
const untilShown = (page, type, id, how) => soon(page, async () => (await shownIn(page)) === `${type}:${id}`,
  async () => `Details does not show ${type} ${id}, ${how}: it shows ${(await shownIn(page)) ?? `"${await saysIn(page)}"`}.`);

/** Picks an element, a line or a view by a click on its row of the Explorer, and waits until Details shows it. */
async function pickRow(page, type, id) {
  await showSide(page, 'Explorer');
  const row = rowIn(page, type, id);
  await soon(page, async () => (await row.count()) === 1, `The Explorer shows no row for ${type} ${id} (data-row "${type}:${id}").`);
  await row.scrollIntoViewIfNeeded();
  await row.click();
  await untilShown(page, type, id, 'picked by its row of the Explorer');
}

/** Picks a box by a click on its header on the plane, and waits until Details shows it. */
async function pickBox(page, view, id) {
  await selectBox(page, view, id);
  await untilShown(page, 'el', id, 'picked on the plane');
}

/**
 * The words of the step Undo would take back ('undo') or Redo make again ('redo'), or null when there is none: the
 * button's tooltip, which Material UI's Tooltip puts as aria-label on the element around the button.
 */
const wordsOf = (page, which) => page.evaluate(([selector, label]) => {
  const tip = document.querySelector(selector).parentElement.getAttribute('aria-label') ?? '';
  return tip === label ? null : tip.slice(label.length + 1);
}, [byTestId(TESTIDS[which]), which === 'undo' ? 'Undo' : 'Redo']);

/** Shows a tab of Details, 'Core' or 'Advanced'. */
async function showTab(page, name) {
  const tab = page.locator(DETAILS).getByRole('tab', { name, exact: true });
  if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
  await soon(page, () => page.evaluate(([root, n]) => !!document.querySelector(`${root} .grasp-details-page[data-tab="${n}"]`), [DETAILS, name]),
    `Details does not show its ${name} tab's page (.grasp-details-page, data-tab "${name}").`);
}

/** A field's row, as it is now on the tab shown: null when absent, else whether it is locked and why. */
const rowOfField = (page, field) => page.evaluate(([root, f]) => {
  const row = document.querySelector(`${root} .grasp-field[data-field="${f}"]`);
  return row ? { locked: row.classList.contains('locked'), why: row.querySelector('.grasp-field-why')?.textContent ?? null } : null;
}, [DETAILS, field]);
```

A test opens a file with `openIn(browser, stateFileAt(file))` and ends with `finish(opened)`. The example's view is `modelOf(EXAMPLE).views[0]`, `v-proof`. Both sides are open in a fresh page at 1400 by 900, so the Explorer, a plane 736 px wide and Details are on the screen together.

### What every item of these tests rests on, from step 9

- `selectionOf(session)` as its comment says: `items`, `view`, `listen`.
- A click on a box of a plane picks it; with Ctrl held it adds it, or lets it go. A click on the ground picks the plane's view.
- A click on a row of the Explorer picks its element, line or view. In a model of 500 elements or fewer every row is in the document as the file opens (`plan/slice-1.md`, section 2: only above 500 does the Explorer start folded). Every relationship has a row, a hidden one too, since the rows are the library's `browserRows`.
- The dock tells the selection which view is in front, when a view's tab is brought forward.

## 4. The test lists

In every table: "Fails before" is the first line of the failure when the test is run against the scaffold, where `fieldHooks.ts`'s functions throw and Details is the shell's empty state. "The breakage" is one small change to the built code under which the test fails; where it also fails another test, the row says which.

### `canvas/app/test/fieldHooks.test.mjs`, in Node

`const app = await loadWith('panels/fieldHooks')` from `core.mjs` gives the core and `fieldHooks.ts` in one bundle. A session is `app.openSession(lib, readJSON(file), { name }, { now: clock(), mistake: (error) => mistakes.push(error) })`; every test ends by asserting that `mistakes` is empty, which is how a write outside `edit()` is seen. The model the library made belongs to another realm: compare it as JSON, or through `plain()`. The ten files are `stateFiles()`. An item is `{ type, id }`. "The first view" of a file is `session.model.views[0].id`.

| # | Test | What it does and asserts | Fails before | The breakage |
|---|---|---|---|---|
| 1 | `the form of every element, line and view of the ten files is the library's details, laid out as the old panel` | For each file, each element, relationship and view, `formOf(session, item, the first view)`. Asserts, with the rules of `formOf`'s comment restated in the test from the library alone (`lib.detailsOf`, the kinds' `fields`, `lib.FIELDS`, `lib.typingOf`, `lib.firstGeneral`): `type`, `id`; `title` is `detailsOf`'s; `what` is `lib.describe`, `lib.describeRel` or `lib.describeView`; `advanced` is `detailsOf().advanced` row for row, by kind of row (`field`, `known`, `notHeld`) and name; the `main` group begins with `detailsOf().core` row for row, then holds the kind's other fields of `GROUP_ORDER.main` that apply, `doc` last; `typing`, `general` and `geometry` hold the fields of their `GROUP_ORDER` that have a row, and a group with none is absent; no field is in the form twice; `code` is in none; every field the kind lists that applies and is shown in the view is in it. 262 forms. | `formOf: step 10 builds it` | The `main` group's own fields put before the library's core rows |
| 2 | `what the example's Host, ServerHost, hosts, api, mount, a defined-by line and the view show, row by row` | `formOf` of `Host`, `ServerHost`, `Page.hosts`, `Page.hosts.api`, `mount`, `t-hosts`, `v-proof` with `v-proof` in front, each compared whole with a literal written in the test from the appendix of this file (labels, types, values, choices, the present choice, `locked: null`, known values). | `formOf: step 10 builds it` | A field's label taken from the row of `FIELDS`, not from `FIELD_LOOKS` |
| 3 | `a field that shows in some kinds of view is checked against the view that shows the item` | `geometry.json`. `formOf` of `room` with `v-plan` in front has the group `geometry`: `shape` "Box", `unit` "m", `length` 8, `width` 6, `height` 3, `radius` "", `posX` 0, `posY` 0, `posZ` 0, in that order. With `v-structure` in front, which places `room` too, no `geometry` group. With null, the group (the first view that places it is `v-plan`). `viewKindFor(model, 'room', 'v-plan')` is `GeometryView`, with `'v-structure'` `GeneralView`, with null `GeometryView`, with `'no-such-view'` `GeometryView`; of `Room`, which only `v-structure` places, with `'v-plan'` `GeneralView`; of an id nothing places, with `'v-plan'` `GeometryView` and with null null. | `formOf: step 10 builds it` | `viewKindFor` answering the view in front whether or not it places the item |
| 4 | `the definition is the usage's typing: picking another moves its end, the box draws or hides its line, nothing takes it away` | The example, `Page.hosts`, through `changeField` with no key. The form's `type` row: `value` "Host", `choice` `{ id: 'Host', label: 'Host' }`; `typeLine` `value` true. `type` to "ServerHost": the model's typings from `Page.hosts` are `[['t-hosts', 'ServerHost']]` (id, to); the step's words and the log's last entry `Defined part hosts in Page by ServerHost`. `typeLine` to false: `t-hosts.hidden === true`; `Hid the line hosts defined by ServerHost`. To true: the relationship has no `hidden` key; `Drew the line hosts defined by ServerHost`. `type` to "": no typing from `Page.hosts`; `Undefined part hosts in Page`; the form has no `typeLine` row, and `type`'s `choice` is `{ id: '', label: 'nothing yet' }`. `type` to "Host": one typing, the last relationship of the model, whose keys are exactly `id, kind, from, to, hidden` in that order, `kind` "FeatureTyping", `hidden` true, its id matching `/^r[0-9a-z]+$/` and no other relationship's; the form has `typeLine` with `value` false. Five `history.undo()`: the model's JSON is what it was at the start. `changeField(..., 'type', 'Host')` again, when it holds "Host": null, no step. | `formOf: step 10 builds it` | A second typing pushed where the usage has one |
| 5 | `Specializes and Subsets are the element's first specialization line` | The example. `Host`, which starts no such line: no `specializes` row. `ServerHost`: `specializes` in the group `general`, `choice` `{ id: 'Host', label: 'Host' }`. To "App": `s-ServerHost.to === 'App'`, the same relationship; `Made part def ServerHost specialize App`. To "": the model holds no `s-ServerHost`; `Took away the specialization of part def ServerHost`; no `specializes` row. Then, in one `history.edit()` of the test's own, a line `{ id: 'sub', kind: 'Specialization', from: 'Page.hosts', to: 'Page.app' }` is pushed: `Page.hosts` has a `subsets` row with `choice` `{ id: 'Page.app', label: 'app' }`; to "": `Took away the subsetting of part hosts in Page`. Undo, then `subsets` to "Page.app" changes nothing (it holds it). A second line from `Page.hosts` pushed after the first: `subsets` to "" takes away the first only. | `formOf: step 10 builds it` | Subsets said with the verb "specialize" |
| 6 | `Is Parallel is locked while a state holds transitions, and a message's order always` | `behavior-states.json`: the `parallel` row of `HostLifecycle` has `locked` "Is Parallel can't change while state def HostLifecycle holds transitions, as in SysON."; of `HostLifecycle.running`, null. `changeField` of `HostLifecycle`'s `parallel` to true: null, no step, the model as it was. Of `HostLifecycle.running`'s to false: a step, `Set the parallel of state running in HostLifecycle to false`. `sequence.json`: the `order` row of `m-login` has `value` 1, `type` "number", `locked` `app.ORDER_LOCKED`; `changeField(..., 'order', 5, 'order:m-login')` is null and the model as it was. | `formOf: step 10 builds it` | Is Parallel locked whenever the model holds a transition |
| 7 | `the words of every change, for Undo and for the log` | Each row of "The words of each change" above, on the file it names, in the order given for the example (the old test's order: `Page.hosts` renamed first, so `Unconjugated port api in hostsx` after it), through `changeField`, a typed field with its key and then `endTyping`. After each: `history.steps.at(-1).what` and `history.changes.at(-1).text` are both the words. Also: `multiplicity` of `Page.app` to "" says `... to nothing`; `item` of `command` to "" says `Set the item of the flow command, ctrl to ctrl to nothing`; a view's name to "  " says `Renamed the view to (unnamed)`; `Host`'s name to "" says `Renamed to part def (unnamed)`. | `changeField: step 10 builds it` | The generic words naming a line without "the " |
| 8 | `every field of every element, line and view of the ten files, changed, is one undo step, undone and redone` | For each file, each item, each `field` row of its form (the first view in front) that is not locked: a new value by its type (a string or text: `readText(spec, value + 'xy')`, and `value + '  xy  '` for a row that trims; a number: 42, or 43 when it holds 42; a bool: the other; an enum: the first other value; a ref: the id of the first entry of `optionsOf` that is not the present one, and the field is skipped when there is none). `changeField`, with `fieldKey` and then `endTyping` for a string, text or number. Asserts: it returned what it touched (not null); one step more, with `key` null; the log's last entry is the step's words; the form's row now has the new value (or is gone, for Specializes or Subsets set to ""); after `undo()` the model's JSON is what it was; after `redo()` what it was after the change; then `undo()` again, so the next field starts from the file. At the end: the count of changes is at least 780, and of fields skipped as locked exactly 5 (`HostLifecycle`'s `parallel`, and the four messages' `order`). | `formOf: step 10 builds it` | The write made before `edit()` is called, outside the change |
| 9 | `typing is one run: its keystrokes are one step, a run back where it began is none, and only its own key ends it` | The example. `fieldKey('name', 'Host')` is `'name:Host'`. `changeField(Host, 'name', v, 'name:Host')` for "HostX", "HostXy", "HostXyz": one step, whose `key` is `'name:Host'` and words `Renamed to part def HostXyz`; the log has no entry for it yet. `endTyping(session, 'doc:Host')`: the step's key is still `'name:Host'`. `endTyping(session, 'name:Host')`: its key is null, the log's last entry is its words. `endTyping` again: nothing changes. Then "HostXyz!" and back to "HostXyz" under the key, and `endTyping`: no step more, the model as before. Then a change of the name under `'name:Host'` and, with that run open, one of the doc under `'doc:Host'`: two steps more, the name's with `key` null (the other key ended it) and the doc's open. | `changeField: step 10 builds it` | `endTyping` ending whatever run is open |
| 10 | `what a typed text is read as` | `readText` with rows of `lib.FIELDS`: `name` (no trim) `'  a b '` is `'  a b '`; `multiplicity` (trim) `'  0..1  '` is `'0..1'`; `doc` `' x\n'` is `' x\n'`; `length` (number): `'42'` 42, `' 4.5 '` 4.5, `'-3'` -3, `'1e3'` 1000, `''` `''`, `'   '` `''`, `'abc'` `''`, `'1,5'` `''`, `'Infinity'` `''`. And through `changeField`: `multiplicity` of `Page.hosts` set to what it holds (`'1..*'`) is null and no step; `geometry.json`'s `room` `length` to `''` says `Set the length of part room to nothing` and the model holds `''`. | `readText: step 10 builds it` | A number field read as its text |
| 11 | `a picker's list: the empty choice first, in its field's words, then what the row allows` | The example. `optionsOf(Page.hosts, 'type')`: `nothing yet` with id "", then `Page, Host, App, ServerHost, OnlineHost, DevHost` (id and label equal). `optionsOf(ServerHost, 'specializes')`: `nothing: take the line away`, then `Page, Host, App, OnlineHost, DevHost`. `interconnection.json`: `optionsOf(command, 'item')`: `nothing`, `Fuel`, `Signal`; `optionsOf(fuelLine, 'interfaceDef')`: `nothing`, `FuelLine`, `CtrlLink`. With `App` renamed to "" by the test's own edit, its entry in `Page.hosts`'s list is labelled `(unnamed)`. With `Page.hosts`'s typing moved by the test's own edit to `StrongholdApp`, a port def, which the row does not allow: the list ends with `{ id: 'StrongholdApp', label: 'StrongholdApp' }`. `optionsOf(Host, 'name')` and `optionsOf(Host, 'specializes')` are empty lists. | `optionsOf: step 10 builds it` | The empty choice left out of the list |
| 12 | `an item the model no longer holds has no form, and a change to it is none` | `formOf`, `optionsOf` and `changeField` for `{ type: 'el', id: 'nope' }`, `{ type: 'rel', id: 'nope' }`, `{ type: 'view', id: 'nope' }`: null, `[]`, null, nothing thrown, no step. `mount` taken out of the model by the test's own edit: `formOf` of it is null; after `undo()` it is a form again. `changeField(Host, 'multiplicity', '1')` (a field its kind does not list) and `changeField(Host, 'code', [])`: null. `changeField(FuelPort.supply, 'direction', 'sideways')` in `interconnection.json`: null. | `formOf: step 10 builds it` | The item looked for without asking whether it was found |
| 13 | `the form asks no picker for its options` | The example and `interconnection.json`. Each `options` of `lib.FIELDS` (`type`, `item`, `interfaceDef`, `specializes`, `subsets`) is wrapped by the test to count its calls, and put back in a `finally`. `formOf` of every item: 0 calls. `optionsOf(Page.hosts, 'type')`: 1 call. | `formOf: step 10 builds it` | `formOf` filling each ref's row with its list |
| 14 | `at 5,000 elements a form is read in under 50 ms and a picker's list in under 100 ms` | `scaleState(5000)` of `canvas/test/scale-model.mjs`, opened as a session. By the median of 5, after one call that is not counted: `formOf` of `middleService(5000)` with `v-definitions` in front; `optionsOf` of `Service1`'s `specializes` (it starts a specialization line). The times go to the runner's output (`t.diagnostic`). Coarse bounds, ten times what was measured: not one of the lead's timed tests. | `formOf: step 10 builds it` | `optionsOf` asking the row's `options` outside `lib.reading` (400 ms) |
| 15 | `every field the library has is given a look, but the code links; and no look or hook is for a field it has not` | The keys of `lib.FIELDS` without `code` are the keys of `app.FIELD_LOOKS`, as sets. Every field of every `GROUP_ORDER` list has a look whose `group` is that list's, and every look is in exactly one list. Every key of `app.FIELD_HOOKS` is a key of `lib.FIELDS`. `NOT_HELD`, `UNNAMED`, `NOTHING`, `ORDER_LOCKED` and `notHeldWhy('Short Name')` are the words of section 3. | Passes against the scaffold: the tables are final | A field taken out of `FIELD_LOOKS`. Seen to fail only so |

### `canvas/app/test/details.test.mjs`, in the page

The tests "Done when" names, each under the plan's own words. The two that are several tests are `describe` blocks named by the plan's words.

**The model of the walk.** `mergedFixtures(lib)` is copied into the test file from `canvas/test/fields.test.mjs` (the function whole, lines 41 to 103; it reads `FIXTURES` and `lib`, which `helpers.mjs` exports). It is opened as `stateFileOf('fields.json', { model: mergedFixtures(lib), notes: [], archive: [] })`. What the page holds is `M = JSON.parse(JSON.stringify(lib.normalize(mergedFixtures(lib))))`: 124 elements, 117 relationships, 10 views, every id prefixed by its fixture's letter (`a-Page`, `c-HostLifecycle`). The tests read `M` and the library in Node to choose what to pick, and the page for everything they assert.

**The walk**, a function of the file, `walk(page, type, kinds)`, with `type` `'el'`, `'rel'` or `'view'`:

1. For each kind of `kinds`, `left` is the fields its row lists (`lib.KINDS[kind].fields`, or `RELATIONSHIPS`, or `VIEW_KINDS`), without `code` and without `order`.
2. For each item of that kind in `M`, in the model's order, while `left` is not empty: `fronts` is `[null]`, then each view of `M` whose kind is in the `views` of a field still in `left` and whose layout places the item. For each front, while `left` is not empty: a front that is a view has its tab clicked (`viewTab(page, view)`, then a click, then a wait until its `aria-selected` is "true"); then `pickRow(page, type, item.id)`.
3. For each field of `left`: its tab is Advanced when `lib.detailsOf(M, type, item).advanced` has a row whose `field` is it, else Core; `showTab`; `rowOfField`. A row that is absent or locked leaves the field in `left` for another item. Else the field is changed once (below) and taken out of `left`.
4. After the kind's items: `left` must be empty, else the test fails with `<kind>'s <field> was not changed through its widget: no <label of the kind> of the merged fixtures shows it unlocked.`

**One change**, `changeOnce(page, type, id, field)`, with `spec = lib.FIELDS[field]`:

1. `before` is what the widget shows; `undoBefore = await wordsOf(page, 'undo')`.
2. The change, by `spec.type`, as the table "How a test reads and changes each widget" says. A string or text: `xy` typed at the end (`  xy  ` for a row that trims), then `Tab`; expected `before + 'xy'`. A number: `42` typed over everything (`43` when it shows `42`), then `Tab`; expected that text. A bool: a click; expected the other. An enum: a click on the first radio button whose value is neither `before` nor `""`, or on `""` when there is no other; expected its value. A ref: the list opened, the ids of its options read; a click on the first that is neither `before` nor `""`, or on `""` when `before` is not `""` and there is no other (when the list holds only the present choice, the test fails: `<field> of <id> offers no other choice`); expected its id.
3. The widget shows `expected` (a ref: its `data-value`). The one exception: Specializes or Subsets set to `""`, whose row is gone from the form.
4. `words = await wordsOf(page, 'undo')` is a string and is not `undoBefore`: the change is a step with words of its own.
5. `undo(page)`: the widget shows `before` again; `wordsOf(page, 'undo')` is `undoBefore`, which is what shows the change was one step and no more; `wordsOf(page, 'redo')` is `words`.
6. `redo(page)`: the widget shows `expected` again (or the row is gone again); `wordsOf(page, 'undo')` is `words`; `wordsOf(page, 'redo')` is null.
7. The change is left in the model, and `{ type, id, field, expected }` is kept.

**At the end of each test of the walk**, the file is saved once (a click on the bar's Save; the download read as `move.test.mjs` reads one) and each change kept is looked up in the saved model: a stored field is the item's property, `=== expected` (a number field 42 as a number; a trimmed row trimmed); `type` is the `to` of the item's FeatureTyping, or no typing for `""`; `typeLine` is `!typing.hidden`; `specializes` and `subsets` the `to` of its first Specialization line, or none. So what the widgets showed is what the model holds, and what a file gets.

| # | Test | What it does and asserts | Fails before | The breakage |
|---|---|---|---|---|
| | `describe('every field that every kind, line and view lists in the example and the fixtures, changed through its widget, is one undo step, undone and redone')` | | | |
| 1 | `the definitions: part def, port def, item def, interface def, action def, state def` | `nothingPicked`; `walk(page, 'el', ['PartDefinition', 'PortDefinition', 'ItemDefinition', 'InterfaceDefinition', 'ActionDefinition', 'StateDefinition'])`: 25 changes. `c-HostLifecycle`'s Is Parallel is locked, so the state def's is changed on `c-HostLifecycle-general`. | `Details reads "The selection's fields come in step 10.", not "Nothing is picked. Click a box, a line or a row of the Explorer to see its fields.": Details is not built.` | A checkbox's change calling `changeField` with the state the box had before the click. Fails 2 and 3 too |
| 2 | `the usages of structure: part, port, item, parameter` | `walk(page, 'el', ['PartUsage', 'PortUsage', 'ItemUsage', 'ParameterUsage'])`: 45 changes, the nine spatial fields of a part and of an item among them (`a-Page.hosts` shows them once the tab of `f-v-plan`, the geometry view, is in front). | The same | A number field's text handed to `changeField` unread, so the model holds "42", a string. Fails `details-fields` 9 too |
| 3 | `the usages of behaviour: action, fork, join, decision, merge, state, event; a start, a done and an initial node have no field` | `walk(page, 'el', ['ActionUsage', 'ForkNode', 'JoinNode', 'DecisionNode', 'MergeNode', 'StateUsage', 'EventOccurrenceUsage'])`: 32 changes. Then `b-Release.start`, `b-Release.done` and `c-HostLifecycle.initial`, each picked: the title is `Action Properties`, and neither tab's page holds a `.grasp-field`. | The same | A radio group showing its first value whatever its row holds. Fails 2 too |
| 4 | `the lines: connection, interface, flow, binding, succession, transition, message; a specialization and a defined-by line have no field` | `walk(page, 'rel', ['ConnectionUsage', 'InterfaceUsage', 'FlowConnectionUsage', 'BindingConnectorAsUsage', 'SuccessionAsUsage', 'TransitionUsage', 'Message'])`: 21 changes. Then `i-m-login`: its `order` field is disabled, shows `1`, and its row says `The order can't be changed here yet. The old page changes it until slice 2.` Then `a-s-ServerHost` and `a-t-hosts`: titles `Specialization Properties` and `Feature Typing Properties`, no `.grasp-field` on either tab. | The same | A locked field's widget left enabled. Fails `details-fields` 12 too |
| 5 | `the views: one of each of the eight kinds` | `walk(page, 'view', Object.keys(lib.VIEW_KINDS))`: 16 changes, a name and a documentation each. A view's row brings its tab forward; the test finds no tab by its title after the walk began, since the walk renames the views. | The same | A picked view given no form (`PickedForm` showing `NOTHING_PICKED` for it). Fails 7 and `details-fields` 2 too |
| | `describe('a rename shows on the box, the tab and the row as it is typed')` | | | |
| 6 | `an element's name, on its box and its row` | The example. `nothingPicked`; `pickBox(page, view, 'Host')`; the name field is clicked, `End`, then `X` and `y` are pressed one at a time. After each key, with the focus still in the field: the field holds the text so far; `.grasp-node-name` of `Host`'s box reads it; `rowIn(page, 'el', 'Host')`'s text holds it; `.grasp-details-what` reads `part def ` and it; the row `[data-detail="qualifiedName"]` reads `StrongholdProof::` and it; `wordsOf(page, 'undo')` is `Renamed to part def ` and it. Then `Tab`; `undo(page)`: the box, the row and the field read `Host`, and Undo has no step; `redo(page)`: `HostXy` on all three. | The same | The change made when the field is left, not at each keystroke |
| 7 | `a view's name, on its tab and its row` | The example. `nothingPicked`; a click on the ground of the plane (`groundPoint`), then `untilShown(page, 'view', 'v-proof', 'picked by a click on its ground')`. `Xy` typed at the end of the name, a key at a time. After each key: a tab is titled the name so far and ` : GeneralView` (role `tab`, that exact name, one of them); `rowIn(page, 'view', 'v-proof')`'s text holds the name. Then `Tab`: `wordsOf(page, 'undo')` is `Renamed the view to proofStructureXy`. `undo(page)`: the tab is `proofStructure : GeneralView`. `redo(page)`: `proofStructureXy : GeneralView`. | The same | The dock not giving a tab its title again after a change (`10-impl-dock`'s part: this test alone) |
| 8 | `picking another definition moves the typing's end` | The example. `nothingPicked`; `pickBox(page, view, 'Page.hosts')`. Typed by holds `Host` (`data-value` and label); "draw the defined-by line" is ticked; the edge `t-hosts` reads "Edge from Page.hosts to Host". The list, opened: `""` labelled `nothing yet`, then `Page, Host, App, ServerHost, OnlineHost, DevHost`. `ServerHost` picked: `data-value` `ServerHost`; the edge `t-hosts` reads "Edge from Page.hosts to ServerHost" (the same line, its end moved); the box of `Page.hosts` reads `hosts : ServerHost`; Undo's words `Defined part hosts in Page by ServerHost`. The box unticked: no edge `t-hosts` on the plane; `Hid the line hosts defined by ServerHost`. Ticked: the edge is back; `Drew the line hosts defined by ServerHost`. `""` picked: the picker reads `nothing yet`; no `typeLine` row; the box does not read `ServerHost`; `Undefined part hosts in Page`. `Host` picked: the `typeLine` row is there, unticked; no edge from `Page.hosts` to `Host` is drawn; the box reads `hosts : Host`; `Defined part hosts in Page by Host`. Save: the file's model has one FeatureTyping from `Page.hosts`, to `Host`, `hidden` true, whose id is not `t-hosts`. Five `undo(page)`: the edge `t-hosts` reads "Edge from Page.hosts to Host", the box is ticked, and Undo has no step. | The same | A picker's change calling `changeField` with the option's label, not its id (the empty choice then writes "nothing yet") |
| 9 | `the example and the nine fixtures: Details shows an element, a line, a line that is not drawn and a view of each` | For each of `TEN`: `openIn`; `nothingPicked`; with `m = modelOf(file)`, the first element, the first relationship, the first relationship with `hidden` (if any) and the first view are each picked by its row; for each, `.grasp-details-title` is `lib.detailsOf(m, type, item).title`, `.grasp-details-what` is the library's words for it, the Core page's rows that are not fields have the `data-detail` names of `detailsOf().core`'s rows without a `field`, in order, and the Advanced page's those of `advanced`. `finish`: nothing logged, in ten files. | The same | No form for a relationship that is hidden |

### `canvas/app/test/details-fields.test.mjs`, in the page

Every behaviour of a field and of the panel. On the example unless the row names another file. Each test calls `nothingPicked` once its file is open (test 1 apart), so each fails before with: `Details reads "The selection's fields come in step 10.", not "Nothing is picked. Click a box, a line or a row of the Explorer to see its fields.": Details is not built.`

`scripted(locator)` below is `locator.evaluate((el) => el.click())`: the element's own `click()`, which runs its listeners and does not move the focus. It stands for whatever picks or undoes without taking the focus from a field.

| # | Test | What it does and asserts | The breakage |
|---|---|---|---|
| 1 | `with no file open Details says so, and with a file open and nothing picked it says that` | `openPage`; `showSide(page, 'Details')`; `saysIn` is `No file is open.`, and the panel holds no `.grasp-details` and no tab. Then the example is opened: `NOTHING_PICKED`. Fails before with `Details reads "The selection's fields come in step 10.", not "No file is open.": Details is not built.` | `NOTHING_PICKED` said with no file open |
| 2 | `Details shows what was picked last: a box, a line, a view, and of several the last` | `pickBox` `Host`: `data-picked` `el:Host`, what `part def Host`, title `Part Definition Properties`. Ctrl held, a click on `App`'s header: `el:App`, `part def App`. Ctrl + click on `App` again: `el:Host`. `pickRow('rel', 'mount')`: `connection mount, api to api`, `Connection Properties`. A click on the ground: `view:v-proof`, `view proofStructure`, `View Properties`, and `[data-detail="exposedElement"]` reads `Page, hosts, api, app, api, Host and 7 more`. | The form made of the first picked, not the last |
| 3 | `the Core and Advanced tabs each hold their rows, and the tab shown stays as the selection changes` | `pickBox` `Host`: Core is shown (`aria-selected`), and its page holds, in order, the field `name`, the rows `qualifiedName`, `declaredShortName`, `isIndividual`, and the field `doc`; no Advanced page is in the document. A click on Advanced: its page holds `elementId`, `isImpliedIncluded`, `isLibraryElement`, `name`, `shortName`, the field `abstract`, `isConjugated`, `isSufficient`, `isVariation`, in order, and no Core page is in the document. `pickBox` `App`: Advanced is still shown, with `App`'s rows (`elementId` reads `App`). `pickRow('rel', 'mount')`: still Advanced. A click on Core, `pickBox` `Host`: Core. | The tab set back to Core when another thing is picked |
| 4 | `what the library knows is shown, and the rest says "not held yet"` | `pickBox` `Host`. Core: `qualifiedName` reads `StrongholdProof::Host`, its label `Qualified Name`; `declaredShortName` has the class `not-held`, reads `not held yet`, and its `title` is "The canvas doesn't hold Declared Short Name yet: the text leaves it as SysML has it." Advanced: `elementId` reads `Host`; `isLibraryElement` holds a checkbox named `Is Library Element`, disabled and not checked; `name` reads `Host`. `pickRow('rel', 't-hosts')`, Core: `qualifiedName` reads `(none)`; `general` reads `part def Host`; `typedFeature` reads `part hosts in Page`. No known row holds an enabled input. | A row Grasp does not hold left without its `title` |
| 5 | `typing is one undo step, ended when the field is left` | `pickBox` `Host`; `Xy` typed at the end of the name, then `Tab`. Undo's words are `Renamed to part def HostXy`. The name is clicked again, `Z` typed, `Tab`: Undo's words `Renamed to part def HostXyZ`. `undo(page)`: the field and the box read `HostXy` (the second visit was a step of its own). `undo(page)`: `Host`, and Undo has no step (the first visit's two keys were one). The file's name in the bar has no dot. | `endTyping` not called when the field loses the focus |
| 6 | `Enter in a one-line field ends the step, and in the documentation it is a new line` | `pickBox` `Host`; in the name `X`, `Enter`, `Y`, then `Tab`: the focus stayed in the field through Enter (the `Y` arrived); `undo(page)` leaves `HostX`, `undo(page)` again `Host`. In the documentation: a click, `Control+End`, `Enter`, `Z`, `Tab`: the textarea's value is the doc, a new line and `Z`; one `undo(page)` brings the doc back as it was. | Enter in a one-line field ending nothing |
| 7 | `a field that goes while it is typed into ends its step` | `pickBox` `Host`; `X` typed in the name, the focus left there. `scripted(rowIn(page, 'el', 'App'))`: Details shows `el:App`. `scripted(rowIn(page, 'el', 'Host'))`: `el:Host`, the name reads `HostX`. The name is clicked, `Y` typed, `Tab`. `undo(page)`: the name and the box read `HostX`, not `Host`: the first typing was a step that ended when its field went. `undo(page)`: `Host`. | A row's cleanup not ending its run |
| 8 | `a field whose row trims holds the value trimmed, and shows it so once it is left` | `pickBox` `Page.hosts`; the Multiplicity field: `Control+A`, then `  0..1  ` typed. With the focus in it: the field reads `  0..1  `, as typed; the box reads `hosts : Host [0..1]`; Undo's words `Set the multiplicity of part hosts in Page to 0..1`. `Tab`: the field reads `0..1`. One `undo(page)`: `1..*`. | The draft still shown once the field is left |
| 9 | `a number field: a text that is no number leaves the field unset, and is gone once the field is left` | `geometry.json`, whose first view, `v-plan`, is in front. `pickRow('el', 'room')`; Length reads `8`. `Control+A`, `9.5` typed: Undo's words `Set the length of part room to 9.5`. `Control+A`, `abc` typed: the field reads `abc`; Undo's words `Set the length of part room to nothing`. `Tab`: the field is empty. One `undo(page)`: `8`. | A number field's text handed to `changeField` unread (the words then end `to abc`). Fails `details` 2 too |
| 10 | `an Undo while a field is typed into: the field shows what the model holds` | `pickBox` `Host`; `X` typed in the name, the focus left there; `scripted` on the bar's Undo. The field reads `Host`, the box `Host`, and the field still has the focus. `Z` typed: `HostZ` in the field and on the box. `Tab`; `undo(page)`: `Host`. | A draft shown whatever the model holds |
| 11 | `what a redo takes out of the model leaves Details` | `pickBox` `ServerHost`; Specializes holds `Host`; its empty choice is picked: Undo's words `Took away the specialization of part def ServerHost`, and the row is gone. `undo(page)`: the row is back, with `Host`. `pickRow('rel', 's-ServerHost')`: Details shows `rel:s-ServerHost`. `redo(page)`: Details says `NOTHING_PICKED`. `undo(page)`: it still does (nothing is picked again by itself), and `pickRow('rel', 's-ServerHost')` shows it again. | The last form kept while nothing is picked |
| 12 | `a locked field cannot be changed and says why` | `behavior-states.json`. `pickRow('el', 'HostLifecycle')`: the Is Parallel checkbox is disabled, not checked, its row has the class `locked` and says "Is Parallel can't change while state def HostLifecycle holds transitions, as in SysON."; a click on it with `{ force: true }` changes nothing, and Undo has no step. `pickRow('el', 'HostLifecycle.running')`: enabled, checked, no reason; a click unticks it; Undo's words `Set the parallel of state running in HostLifecycle to false`. | The reason left out under a locked field. (`details` 4's breakage fails this test too) |
| 13 | `a field that shows only in some views follows the view in front` | `geometry.json`. `pickRow('el', 'room')`: the group `geometry` is on Core, with Shape `Box` checked, Unit `m`, Length `8`. The tab of `v-structure` is clicked: no `geometry` group, and `room` is still what Details shows. The tab of `v-plan`: the group is back. `pickRow('el', 'Room')` (the part def): no `geometry` group under either tab. | The view in front read once, when the form is first made |
| 14 | `Ctrl + Z in a text field is the field's own undo` | `pickBox` `Host`; `X` typed in the name: the box reads `HostX`. `Control+z`: the field reads `Host`, the box `Host`, the focus is still in the field. `Tab`: Undo has no step (the run ended where it began) and the bar's file name has no dot. | Ctrl + Z stopped by the field (its default prevented) |
| 15 | `Escape changes nothing in a field, and closes a picker's list` | `pickBox` `Host`; in the name `X`, `Escape`, `Y`, `Tab`: the field reads `HostXY`; one `undo(page)` leaves `Host`. `pickBox` `Page.hosts`; the picker is clicked: a list is open; `Escape`: no list, the picker holds `Host`, Undo's words are what they were. | Escape in a text field ending its run |
| 16 | `a picker narrows its list as text is typed, and drops text that picks nothing` | `pickBox` `Page.hosts`; the picker is clicked, `Control+A`, `Ser` typed: the list's options are `ServerHost` alone. `Control+A`, `zzz` typed, `Tab`: the picker reads `Host` again, `data-value` `Host`, and Undo has no step. | An option's `li` left without `data-option` |
| 17 | `the keyboard alone changes a checkbox, a choice, a picker and the tab` | `interconnection.json`. `pickRow('el', 'FuelPort.supply')` (an item with a direction). The Core tab focused, `ArrowRight`: Advanced is shown; `ArrowLeft`: Core. The Direction group's checked button (`out`) focused, `ArrowLeft`: `inout` is checked, and Undo's words are `Set the direction of item supply in FuelPort to inout`. The picker Typed by (it holds `Fuel`) focused, `ArrowDown`: a list is open and `Fuel` is lit (`[role="option"].Mui-focused`); `ArrowDown`: `Signal` is lit; `Enter`: the list is closed, the picker's `data-value` is `Signal`, and Undo's words are `Defined item supply in FuelPort by Signal`. `pickRow('el', 'Fuel')`, Advanced; the Is Abstract checkbox focused, `Space`: checked; `Made abstract: item def Fuel`. | `selectionFollowsFocus` left off the tabs |
| 18 | `an empty name is an unnamed element` | `pickBox` `Host`; the name: `Control+A`, `Backspace`, `Tab`. The field is empty; Details says `part def (unnamed)`; Undo's words `Renamed to part def (unnamed)`; the box's name no longer reads `Host`. `undo(page)`: the field and the box read `Host`. | A change to an empty text not made |
| 19 | `another file opened: Details lets the first file's pick go, keeps its tab, and shows the new file's` | `pickBox` `Host`; Advanced shown. `openStateFile(page, stateFileAt(interconnection.json))` (no change was made, so nothing is asked): `NOTHING_PICKED`. `pickRow('el', 'Fuel')`: `el:Fuel`, `item def Fuel`, and Advanced is the tab shown. | The selection of the first session still read after another file is opened |
| 20 | `the fields are dense, in Roboto` | `pickBox` `Host`. The name's input: its parent's box is 32 px high (within 0.5); its computed font size `13px`, its family begins with Roboto. The tabs' row (role `tablist`) is 32 px high. A label (`.grasp-field-label`) is `12px`. On Advanced, the label around the Is Abstract checkbox is no higher than 28 px. No widget is wider than the panel less 24 px, and the panel does not scroll sideways (`scrollWidth <= clientWidth`). `pickBox` `Page.hosts`: the picker's box is 32 px high. | `FIELD_HEIGHT` 40 |
| 21 | `Ctrl + Z takes a tick back while the focus is still on the checkbox` | `pickBox` `Host`; `showTab(page, 'Advanced')`; a click on the Is Abstract checkbox (`fieldIn(page, 'abstract')`): it is checked, and Undo's words are `Made abstract: part def Host`. The checkbox still has the focus (`document.activeElement` is that input). `Control+z` is pressed: the checkbox is unchecked and `wordsOf(page, 'undo')` is null. `Control+y`: it is checked again. `showTab(page, 'Core')`; a click on a button of the Direction choice of an item is not needed: the same is asked of a radio button on `interconnection.json`, `pickRow('el', 'FuelPort.supply')`, a click on the `in` button of Direction, then `Control+z`: `out` is checked again. | A checkbox or a radio button counted as a field that takes typing (the bar's keys asking the target's tag name alone) |

### `canvas/app/test/instant.test.mjs`: one test more

| Test | What it does and asserts | Fails before | The breakage (checked alone) |
|---|---|---|---|
| `a keystroke in a name of the example takes under 16 ms` | The example, opened as the file's other tests open it. `selectBox(page, view, 'Host')`; `fieldIn(page, 'name')` is waited for. `time = await timing(page, 'keydown', 'input')`. The name is clicked, `End`; the letters `a` to `i` are pressed one at a time, each a sample of `measure(9, 16)`. Then: the field reads `Hostabcdefghi`, and so does `.grasp-node-name` of the box. `verdict(t, m, 16, 'A keystroke in the name of Host')`, as the file's other tests end. `Tab`, `finish`. | `Details shows no name field for Host, picked (data-testid "field-name" in "details").` | 20 ms of busy work in the name's `onChange` |

### `canvas/app/test/scale.test.mjs`: the test that stands

`a keystroke in a name takes under 50 ms at 5,000 elements` is as step 3 wrote it and is not changed, but for its todo mark, which `10-checks-close` takes off. It finds the name field as `fieldIn` does and asks that the field hold the element's name, that every keystroke reach it, and that the box read what was typed. Today it fails, as a todo, with `Details shows no name field for Service96, selected (data-testid "field-name" in "details").` Its breakage, checked alone: `formOf` asking each picker's options outside a reading (400 ms a keystroke).

### Existing tests

No other existing test asks for what step 10 changes, so none is restated. `shell.test.mjs` reads Details's width and its strip, which stay. The tests of criterion 2 (`open.test.mjs`) and of criterion 6's earlier parts (`instant.test.mjs`'s first four) go on as they are; `10-tests-instant` adds to the file and changes none of them.

## 5. The screenshot

None: the plan's table in section 4 gives step 10 none.

## 6. Decisions

Each where the plan is silent, with its reason. The longer ones are in section 1.

- `fieldHooks.ts` holds the form and the change, not only the hooks: what needs no React is tested in Node.
- The library's rows are typed in `fieldHooks.ts` (`FieldLibrary`, reached by `fieldLibOf`), not added to the global `SysMLModelLibrary`: `RELATIONSHIPS`'s rows are declared in `core/adapter.ts` with an inline type that cannot be added to from another file, and two files that declare one property must agree to the letter.
- The page's walk is over the merged fixtures, five tests; the ten files as saved are walked in Node, and opened in the page by one test that picks four items of each.
- Every browser test first asks that Details say nothing is picked, so that against the scaffold each fails for want of Details and not for want of step 9's picking.
- A view's tab follows its name through `Dock.tsx` (`10-impl-dock`), which waits for Details: no test can rename a view without it.
- `10-impl-details` is two tasks: `10-impl-hooks` builds `fieldHooks.ts` against the Node tests alone and can start with the swarm; `10-impl-details` builds the panel on it once step 9's picking is built.
- Details reads the model again at every change of `history.mark()`, a drag's end included: one `formOf`, 2 to 4 ms at 5,000 elements. Reading `told` to skip a move would have needed a listener of its own beside the store React reads.
- The new typing's id is made as the old page's `newId('r')`. Step 11's commands need the same maker for what they place; the lead may move it into the core then.
- No look is written for the code links, so `formOf` gives them no row; slice 2 adds the look and the widget.
- A known Boolean is a disabled checkbox, as on the old page, and a known string is text, not a read-only field: nothing that cannot be changed looks as if it could.

Tried and dropped:

- **Material UI's floating label.** At 13 px it is drawn at 9.75 px.
- **A native `<select>` for a ref**, as the old page. It lists every choice in the document as the form is made, which is what a keystroke must not pay for at 5,000 elements.
- **The form recomputed only for the rows a change touched.** `detailsOf` and the hooks read names of owners and ends, so any change can alter any row; one reading of 2 to 4 ms is cheaper than the bookkeeping.
- **A key per session on `PickedForm`.** Between two files Details shows `NOTHING_PICKED`, which unmounts every row, so nothing can be carried over.

## Appendix: the example's forms, for test 2 of `fieldHooks.test.mjs`

Written from the library's `detailsOf` on `canvas/examples/stronghold-proof.json` and this file's rules. `[field]` is a FieldRow, `Label = value` a KnownRow by its label, `Label: nh` a NotHeldRow. A row's `name` is the attribute's (`Qualified Name` is `qualifiedName`, `Is Individual` `isIndividual`, `Element Id` `elementId`).

**`Host`**: what `part def Host`, title `Part Definition Properties`.
- `main`: `[name]` string "Host", label "Declared Name"; `Qualified Name = "StrongholdProof::Host"`; `Declared Short Name: nh`; `Is Individual: nh`; `[doc]` text, label "Documentation", the element's doc.
- No other group.
- Advanced: `Element Id = "Host"`; `Is Implied Included: nh`; `Is Library Element = false`; `Name = "Host"`; `Short Name: nh`; `[abstract]` bool true, label "Is Abstract"; `Is Conjugated: nh`; `Is Sufficient: nh`; `Is Variation: nh`.

**`ServerHost`**: as `Host` with its own id, name and doc, `[abstract]` false, and a group `general`: `[specializes]` ref "Host", label "Specializes", choice `{ id: 'Host', label: 'Host' }`.

**`Page.hosts`**: what `part hosts in Page`, title `Part Properties`.
- `main`: `[name]` "hosts"; `Qualified Name = "StrongholdProof::Page::hosts"`; `Declared Short Name: nh`; `Direction: nh`; `Is Individual: nh`; `[multiplicity]` string "1..*", label "Multiplicity", placeholder "1, 0..1, or 1..*"; `[doc]` "".
- `typing`: `[type]` ref "Host", label "Typed by", choice `{ id: 'Host', label: 'Host' }`; `[typeLine]` bool true, label "draw the defined-by line".
- No `geometry` group (`v-proof` is a general view), no `general` group.
- Advanced: `Element Id = "Page.hosts"`; `Is Implied Included: nh`; `Is Library Element = false`; `Name = "hosts"`; then not held, in order: `Short Name`, `Is Abstract`, `Is Conjugated`, `Is Sufficient`, `Is Composite`, `Is Constant`, `Is Derived`, `Is End`, `Is Ordered`, `Is Portion`, `Is Unique`, `Is Variable`, `Is Reference`, `Is Variation`, `May Time Vary`, `Portion Kind`.

**`Page.hosts.api`**: what `port api in hosts`, title `Port Properties`.
- `main`: `[name]` "api"; `Qualified Name = "StrongholdProof::Page::hosts::api"`; `Declared Short Name: nh`; `Direction: nh`; `[multiplicity]` ""; `[doc]` "".
- `typing`: `[type]` "StrongholdApp", choice `{ id: 'StrongholdApp', label: 'StrongholdApp' }`; `[typeLine]` false; `[conjugated]` bool true, label "conjugated (~), the other side of the port".

**`mount`**: what `connection mount, api to api`, title `Connection Properties`.
- `main`: `[name]` "mount"; `Qualified Name = "StrongholdProof::Page::mount"`; `Declared Short Name: nh`; `Direction: nh`; `Is Individual: nh`; `[doc]` "".
- Advanced begins `Element Id = "mount"`; `Is Implied Included: nh`; `Is Library Element = false`; `Name = "mount"`.

**`t-hosts`**: what `hosts defined by Host`, title `Feature Typing Properties`. No field on either tab.
- `main`: `Declared Name: nh`; `Qualified Name = ""`; `Declared Short Name: nh`; `General = "part def Host"`; `Specific = "part hosts in Page"`; `Type = "part def Host"`; `Typed Feature = "part hosts in Page"`.
- Advanced: `Element Id = "t-hosts"`; `Is Implied Included: nh`; `Is Library Element = false`; `Name: nh`; `Short Name: nh`; `Is Implied: nh`.

**`v-proof`**: what `view proofStructure`, title `View Properties`.
- `main`: `[name]` "proofStructure"; `Qualified Name = "StrongholdProof::proofStructure"`; `Declared Short Name: nh`; `Direction: nh`; `Exposed Element = "Page, hosts, api, app, api, Host and 7 more"`; `[doc]` "".
- Advanced begins `Element Id = "v-proof"`; `Is Implied Included: nh`; `Is Library Element = false`; `Name = "proofStructure"`.

Where the appendix gives only the beginning of a tab, or says nothing of the Advanced tab, the test compares what is given and takes the rest from `lib.detailsOf`, by the rules of `formOf`.
