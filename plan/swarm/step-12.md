# Step 12, "Validation and About": the scaffold

This file is step 12's part of the scaffold that `plan/swarm/README.md` describes. `plan/swarm/shared.md` holds what the steps share. The skeletons are in the code: `canvas/app/src/core/checks.ts`, `core/probe.ts`, `panels/Validation.tsx` and `shell/About.tsx`, each with its contract as its comment. Where this file and a contract comment say the same thing, the comment is the contract and this file is its table for the tests.

## 1. What the step delivers

The plan's own sentences, from `plan/slice-1.md`.

Section 5, step 12:

> - **What it delivers.** The Validation panel and the About panel are as section 2 settles them.
> - **Files.** The step creates `canvas/app/src/panels/Validation.tsx`, `canvas/app/src/shell/About.tsx`, `canvas/app/src/core/probe.ts`, `canvas/app/test/validation.test.mjs`, `about.test.mjs` and `canvas/app/shots/about.png`.
> - **Done when.** `validation.test.mjs` passes: the example has no entry, and the panel says so; two part defs given one name are listed 0.8 s after the change, under Grasp's problems and under the specification's rules in SysON's words, and both entries go with Undo; a click selects what an entry is about. `about.test.mjs` passes: each line reports what this Chromium does, with GitHub's answer stubbed; with the pickers taken away, the panel says so and Open falls back to the file input. `about.png` shows what its row lists.

Section 2:

> - **What Validation lists.** It lists both lists the library gives, Grasp's own problems (`M.validate`) and the specification's rules (`M.validateSpec`), worked out once the changes pause for 0.8 s, as today. A click on an entry selects what it is about.
> - **What About reports.** When it is opened, it reports the browser's version, whether the page is a secure context, the three pickers, the file input and download, localStorage, IndexedDB, a worker made from a Blob URL, WebAssembly with the probe's timing loop, a request to `api.github.com/rate_limit`, and the libraries' versions. A button remembers a folder's handle, so the next opening can say whether it survived. The network is asked only when the panel is opened.

Section 7, Damon's choice 1: "hidden on the planes, credited in About and in the notices file" (React Flow's mark). Section 4's table: `about.png`, step 12, "The About panel with every line answered".

Step 12 is also the last step that section 10's criteria cover. Section 7 of this file lists the checks its closing carries.

### What the plan leaves open, and how it is settled

**Validation**

1. **Where the checks live.** In a store outside React, kept for a session: `checksOf(session)` in `core/checks.ts`, as the selection and a view's store are kept. The 0.8 s, the undo and the hidden panel are then behaviours of a file that Node tests run with a stand-in for the timer. The plan names no such file; `Validation.tsx` could not be loaded by a Node test, since it imports React.
2. **When the lists are worked out.** Only while the panel is shown: the store checks only while it has a listener, and the panel listens only while it is shown. A check of the 5,000-element model takes about 40 ms (the table below), which is more than two frames and most of the 50 ms that step 10's keystroke may take there. The old page checked after every pause because it drew badges; slice 1 draws none, so nothing but the panel needs a result. While the panel is shown:
   - **0.8 s after the last change**, as the old page (`PAUSE`, 800 ms): each change starts the wait again, so the keystrokes of a name are checked once, after the last. A check therefore never runs inside the event that made the change.
   - **At once when a file is opened**, and at once when the panel is shown after changes it did not see (the old page's `checkNow()` when its Validation view was opened).
   - **At once after an undo or a redo**, as the old page does (`undo()` draws everything anew, and `render()` with nothing touched runs `check()`). A list that kept an entry for 0.8 s after the Undo that removed its cause would read as an Undo that did not work.
   - **Never while the panel's tab is hidden or its side is collapsed.** A side panel stays mounted then (`shared.md`, section 3), so the panel finds out by itself whether it is shown, with a ResizeObserver on its own element, as `Plane.tsx` does. Seen in a probe on the built page: a hidden panel's element is out of the document and observed at 0 by 0; a collapsed side's is in the document and laid out at 0 by 0; both come back at 280 wide.
3. **The two lists and their titles.** "Grasp's problems" first, then "The specification's rules", each with the number of its entries beside its title. Under the second title, the old page's note, with Grasp for "the canvas": "The SysML v2 specification's validation rules that Grasp can check, as SysON runs them: 15 of its 388. The others are met by any text Grasp writes, or are about what it doesn't make." Without it "No rule is broken." would claim more than the 15 rules that are checked.
4. **An entry's words and its order.** A problem's entry is its `message`. A diagnostic's entry is its `text`, SysON's label, whole: `#<rule>·····[<package>/<qualified name>]·····Constraint on type 'sysml:<Metaclass>' is not respected: <message>` (five middle dots, U+00B7, each time). Each list is in the order the library gives it: problems by element, then view, then relationship, in the model's order; diagnostics by rule and then by qualified name. The old page folded the diagnostics under "Warning"; with one kind of severity and a side panel's width, the fold is left out.
5. **What an entry is about, and what a click picks** (`aboutProblem`, `aboutDiagnostic`). A click calls `selectionOf(session).set(pick)` and nothing else.

   | The entry is about | `data-entry` | A click picks |
   |---|---|---|
   | An element | `el:<id>` | the element |
   | A relationship that is drawn | `rel:<id>` | the relationship |
   | A relationship that is hidden (`hidden: true`, a port's "defined by" line) | `rel:<id>` | the relationship, then the element it starts from: the line cannot be pointed at on any plane (the old page's `marksFor`) |
   | A view | `view:<id>` | the view |
   | The package (a problem with a null id; a diagnostic of type null) | `package:` | nothing: the selection cannot hold the package. The entry is no button |
   | Something the model no longer holds (an entry of a result that is out of date) | `none:<id>` | nothing. The entry is no button |

   A problem's id is looked for among the elements, then the relationships, then the views, as the old page's `selectionFor` does. A click opens no tab and moves no camera: the plan says "selects", and bringing what is selected into sight is slice 2's ("showing an element in a view").
6. **What the panel shows otherwise.** With no file: "No file is open." A list with no entry says so under its title: "No problems found." and "No rule is broken." While a result is out of date (a change was made and its pause is not over) the lists stay as they were, at 60% opacity, with `data-stale="true"` and `aria-busy="true"`; no sentence comes and goes, so nothing moves while a name is typed. Before the first result the lists' element is empty; that lasts one render, since the first listener's check runs at once.
7. **The entry of what is picked** is marked (`aria-current="true"`, Material UI's selected look), as a plane marks its node and the Explorer its row: with two entries that read alike ("Two elements are named Host in the package." twice), the mark says which box each is about.
8. **Badges on the drawing** are slice 2's (`plan/slice-1.md`, section 2, "Which editing is slice 1's"). Nothing is built for them.

**About**

9. **Where the questions live.** `core/probe.ts` holds every question, its words, and the order of the asking, worked out from a `ProbeEnv`: a Node test hands in stand-ins, and `browserEnv()` makes the real one from the window, as `core/files.ts` keeps what needs no browser apart from what does. `About.tsx` only draws the probe's lines.
10. **What is asked when.** Opening the panel starts a round that asks every line again, GitHub with one request. Nothing is asked before the first opening, and nothing when the page loads. The timing loop is the exception: it is run once for the page's life, since it keeps the page busy for some tenths of a second, and it waits 400 ms after the first opening so that the panel is drawn first. The folder is asked for only by a click on "Remember a folder…".
11. **The timing loop.** The probe page of `plan/notes.md`, session 13, is not in the repository, so the loop is Grasp's own: from x = 0, for i from 0 to n − 1, x becomes (x × 31 + i) xor (x >>> 7), in 32-bit whole numbers; 50 million steps; the same in a WebAssembly module of 77 bytes written out in `probe.ts` and in JavaScript. Both give 1249568185. In Chromium 153 in this container: 86 to 96 ms in WebAssembly and 350 to 380 ms in JavaScript (Damon's machine, with the first probe's loop: 39 and 277 ms). The line gives both times and no verdict: the JavaScript time is the yardstick on a machine nobody has measured.
12. **The libraries' versions** come from the build. `canvas/app/build.mjs` defines `__GRASP_LIBRARIES__` when it bundles the application: the JSON text of the dependencies of `package.json`, in the order of their names, each with the version and the licence of the package as installed. `probe.ts` parses it into `LIBRARIES`. It is a text because esbuild puts a text where the name stands, while a list becomes a module of its own that every file of the bundle starts (seen in a probe: 1.5 kB more in `app.js`, with nothing reading it). No package is added and no file beside the page is asked for. (Only React and Material UI export a version at run time; React Flow and Dockview do not.)
13. **The remembered folder.** The button calls `showDirectoryPicker()` and keeps the handle in IndexedDB (database `grasp-app`, object store `kept`, key `folder`) with the folder's name, the time, and a name for the page load (`String(performance.timeOrigin)`). At the next opening, a record made in another page load "survived", and the line gives the answer of `queryPermission({ mode: 'readwrite' })`, which asks the person nothing. A record made in this page load only says that it was remembered now.
14. **The panel** is a Material UI Dialog, 900 px wide, in two parts side by side: "This browser" with the thirteen lines and the button, "Libraries" with the eleven packages, the credit to React Flow and the notices file. At 1400 by 900 it is 637 px high and nothing scrolls (a throwaway build of this contract, in a probe). It closes by its Close button, by Escape and by a click outside it.

### What a check costs

`M.validate` and `M.validateSpec` each run in a reading of the model (`reading(model, …)` in `canvas/src/core/lib/validate.js` and `validation/lib.js`); a check runs both inside one reading, so the lookups are made once. In Node 22 in this container, by the median of 21 runs, while three other processes worked the machine:

| Model | `validate` | `validateSpec` | Both, in one reading |
|---|---|---|---|
| `scaleState(5000)` as `normalize` gives it | 19.9 ms | 5.4 ms | 25.6 ms |
| The same through a session's history (its Proxy), as the page holds it | 28.9 ms | 12.1 ms | 37.4 ms |

The measure, run from the repository's root as a file under `canvas/app/test/` or with the two imports' paths made absolute:

```js
import { scaleState } from '../../test/scale-model.mjs';
import { loadCore, lib } from './core.mjs';
const { openText } = await loadCore();
const model = openText(lib, JSON.stringify(scaleState(5000)), { name: 'scale.json' }).model;
const median = (run) => { const t = []; for (let i = 0; i < 21; i += 1) { const a = performance.now(); run(); t.push(performance.now() - a); } return t.sort((a, b) => a - b)[10]; };
console.log(median(() => lib.validate(model)), median(() => lib.validateSpec(model)),
  median(() => lib.reading(model, () => [lib.validate(model), lib.validateSpec(model)])));
```

So: the keystroke test of step 10 (`scale.test.mjs`, 50 ms at 5,000 elements) runs with the Explorer in front, where the checks are idle and cost nothing. With the Validation panel shown, a check comes 0.8 s after the last keystroke, in a task of its own.

## 2. The files

| File | What it holds | Task |
|---|---|---|
| `canvas/app/src/core/checks.ts` | New, and not in the plan's list. `PAUSE`, `Problem`, `Diagnostic`, `Found`, `ChecksState`, `Checks`, `checksOf(session, options)`, `EntryAbout`, `aboutProblem`, `aboutDiagnostic`. | `12-impl-checks` |
| `canvas/app/src/core/probe.ts` | New. `LIBRARIES`; the lines (`PROBE_LINES`, `ProbeLine`, `ProbeState`); their words (`SAID` and the functions beside it, final); the loop (`WASM_LOOP`, `jsLoop`, `LOOP_STEPS`, `LOOP_RESULT`, `LOOP_DELAY`, final); `ProbeEnv`, `Kept`, `FolderRecord`; `browserOf`, `createProbe`, `browserEnv`. | `12-impl-probe` |
| `canvas/app/src/panels/Validation.tsx` | The panel's body. Its words are exported constants, final. | `12-impl-validation` |
| `canvas/app/src/shell/About.tsx` | The dialog. Its words are exported constants, final. | `12-impl-about` |
| `canvas/app/src/shell/TopBar.tsx` | About enabled, calling `onAbout` (the end of the "Open" item of its contract). | `12-impl-bar` |
| `canvas/app/test/checks.test.mjs` | New, and not in the plan's list: the checks in Node. | `12-tests-checks` |
| `canvas/app/test/probe.test.mjs` | New, and not in the plan's list: the probe in Node. | `12-tests-probe` |
| `canvas/app/test/validation.test.mjs` | The panel in the page. | `12-tests-validation` |
| `canvas/app/test/about.test.mjs` | The dialog in the page. | `12-tests-about` |
| `canvas/app/test/shots/about.mjs` | The shot `about.png`: `take()` written. `pending: true` is taken off at the closing. | `12-tests-about`, then `12-checks-close` |
| `canvas/app/shots/about.png`, `shell.png`, `example.png`; `canvas/dist/`; `plan/status.json`; `plan/notes.md` | Taken, built and written at the closing. | `12-checks-close` |

Two files that no task owns carry what the step needs, put there by the scaffold: `canvas/app/src/core/index.ts` exports `checks` and `probe`, and `canvas/app/build.mjs` defines `__GRASP_LIBRARIES__` when it bundles the application (the JSON text of the dependencies of `package.json`, sorted by name, each `{ name, version, licence }` as installed). Neither changes `canvas/dist/` while nothing reads the two files: the page built from the scaffold is byte for byte the page of step 7. The application imports everything of the core from `'../core'`; a Node test loads the two files with `loadWith('core/checks')` and `loadWith('core/probe')`. No stylesheet is added: both panels take their colours and sizes from the theme, in `sx`.

Nothing changes in `Dock.tsx`, `App.tsx` (it renders `About` with `open` and `onClose` already), `Plane.tsx`, `viewStore.ts`, `helpers.mjs`, `core.mjs`, `shots.mjs`, `theme.ts` or `vendor.ts`. `@mui/material` is in `vendor.ts` whole, so `Dialog`, `List`, `ListItemButton`, `CircularProgress` and `Link` need no new import there. No icon is added.

## 3. The contract between tests and code

### The Validation panel

| What | How a test finds it, and what it holds |
|---|---|
| The panel's root | `[data-testid="validation"]` (`TESTIDS.validation`), SidePanel's root; its title row says "Validation". `showSide(page, 'Validation')` brings it to the front. |
| The panel's own element | `.grasp-validation` inside the root: always there; it is what the panel observes to know whether it is shown. |
| With no file | Under its title the panel says **`No file is open.`** and nothing else. There is no `.grasp-validation-lists`. |
| The lists' element | `.grasp-validation-lists`, inside `.grasp-validation`, only while a file is open and the panel is shown. `data-stale` is `"false"` when the lists are up to date and `"true"` from a change until the check that follows it; `aria-busy` says the same. |
| A list | `section[data-list="problems"]`, then `section[data-list="rules"]`. `data-count` is the number of its entries. |
| A list's title and count | `.grasp-validation-title`: **`Grasp's problems`**, **`The specification's rules`**. `.grasp-validation-count`: the number, as text (`0`, `2`). |
| The rules' note | `.grasp-validation-note` in the rules' list: **`The SysML v2 specification's validation rules that Grasp can check, as SysON runs them: 15 of its 388. The others are met by any text Grasp writes, or are about what it doesn't make.`** |
| A list with no entry | `.grasp-validation-none`: **`No problems found.`** in the problems' list, **`No rule is broken.`** in the rules'. Absent from a list that has an entry. |
| An entry | `[data-entry="<type>:<id>"]` inside its list, in the list's order. Its `textContent` is exactly the problem's `message` or the diagnostic's `text`. Types: `el`, `rel`, `view`, `package` (id empty: `package:`), `none`. |
| An entry that takes a click | It has the ARIA role `button` and is in the tab order; a click, or Enter while it has the focus, picks. An entry of type `package` or `none` has no role `button`. |
| The entry of what is picked | `aria-current="true"`; the other entries have no `aria-current`. |
| What a click does to the rest of the page | What step 9 gives the selection: the plane marks the node (`boxOf(page, viewId, id).selected`), Details shows its fields. |

Numbers: the pause is 800 ms (`PAUSE`). The first check of a panel that is shown, and the check after an undo or a redo, come in the same task as what caused them; a test gives them 10 frames.

### The About panel

| What | How a test finds it, and what it holds |
|---|---|
| The bar's button | `[data-testid="about"]` (`TESTIDS.about`), named "About Grasp": enabled with no file open and with one. |
| The panel | `[data-testid="about-panel"]` (`TESTIDS.aboutPanel`): the element with `role="dialog"` and `aria-modal="true"`, named **`About Grasp`** (`page.getByRole('dialog', { name: 'About Grasp' })`). Not in the document while closed; it leaves the document about 200 ms after it is closed. |
| Closing | The button named **`Close`** inside the panel; Escape; a click outside the panel (at 20, 450 in a 1400 by 900 window). |
| A line | `[data-line="<id>"]` inside the panel, thirteen, in this order: `browser`, `secure`, `open-picker`, `save-picker`, `folder-picker`, `file-input`, `download`, `local-storage`, `indexed-db`, `worker`, `wasm`, `github`, `folder`. `data-state` is `pending`, `yes`, `no` or `told`. |
| A line's label and value | `.grasp-about-label` and `.grasp-about-value` inside the line; the table below has the words. |
| The button that remembers a folder | `[data-testid="about-remember"]`, named **`Remember a folder…`**. Disabled unless the `folder-picker` line is `yes`, and while the `indexed-db` line is `no` (step 12's closing, from the review). |
| A library | `[data-library="<package name>"]`, one for each dependency of `package.json`, in the order of their names; inside it `.grasp-about-library-name`, `.grasp-about-library-version`, `.grasp-about-library-licence`. |
| The credit to React Flow | `[data-testid="about-react-flow"]`: **`The planes are drawn with React Flow (@xyflow/react).`** Its link reads "React Flow" and has `href="https://reactflow.dev"`. |
| The notices file | `[data-testid="about-notices"]`: **`Every library's licence is in THIRD-PARTY-NOTICES.txt, beside the page.`** Its link reads "THIRD-PARTY-NOTICES.txt" and has `href="THIRD-PARTY-NOTICES.txt"`. |
| The other titles | "This browser" and "Libraries" over the two parts; "What this browser lets the page do, and what the page is built on." under the dialog's title. |

The lines, their labels and what each says. `<reason>` is the browser's own error message; a sentence made from one ends in a full stop unless the message ends a sentence itself.

| `data-line` | Label | `yes` | `no` | Other |
|---|---|---|---|---|
| `browser` | Browser | | | `told`: the name and version from the user agent, `Chrome 153.0.8010.12`; an unknown user agent whole; `Not told.` for an empty one |
| `secure` | Secure context | `Yes.` | `No: the file pickers need one.` | |
| `open-picker` | Open picker | `Present.` | `Missing: Open asks through a file input, and Save downloads the file.` | |
| `save-picker` | Save picker | `Present.` | `Missing.` | |
| `folder-picker` | Folder picker | `Present.` | `Missing: no folder can be remembered.` | |
| `file-input` | File input | `Present.` | `Missing.` | |
| `download` | Download | `Present.` | `Missing.` | |
| `local-storage` | localStorage | `Works.` | `Blocked: <reason>` | |
| `indexed-db` | IndexedDB | `Works.` | `Blocked: <reason>`; `Blocked: what was written did not come back.` | `pending` until answered |
| `worker` | Worker from a Blob URL | `Works.` | `Blocked: <reason>`; `Blocked: no answer within 3 s.` | `pending` until answered |
| `wasm` | WebAssembly | `Runs: 50 million steps in 88 ms; the same loop in JavaScript took 365 ms.` (the two times, rounded to whole ms) | `Missing.`; `Blocked: <reason>`; `Runs, with a wrong result.` | `pending` until the loop has run, 400 ms and the loop's own time after the first opening |
| `github` | GitHub | `Reached: 57 of 60 requests left this hour.` (from `resources.core.remaining` and `.limit` of the answer); `Reached.` when the answer has no such numbers | `Answered with HTTP 403.`; `Not reached: <reason>`; `Not reached: no answer within 10 s.`; `Not reached: this browser has no fetch.` | `pending` until answered |
| `folder` | Remembered folder | `Survived: grasp-folder, remembered 2026-11-13T12:00:00.000Z. Permission: granted.` (the folder's name, the time as an ISO string, and `granted`, `prompt`, `denied` or `not told`) | `Cannot be read: <reason>`; after a click, `Not remembered: <reason>` | `told`: `None is remembered.`; `told`: `Remembered now: grasp-folder. Reload the page, or restart the browser, and open About again.`; `pending` until answered |

A line that is `pending` says **`Asking…`** (with U+2026).

Numbers: the loop has 50,000,000 steps and gives 1249568185; it waits 400 ms (`LOOP_DELAY`); GitHub is waited for 10 s (`GITHUB_WAIT`), a worker 3 s; the request goes to `https://api.github.com/rate_limit` (`GITHUB_URL`) and nowhere else.

### GitHub's answer in a test

No test lets a request leave the page. Every test that opens About first routes the address on its context, before the click:

```js
const RATE = { resources: { core: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } }, rate: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } };
await opened.context.route('https://api.github.com/rate_limit', (route) => route.fulfill({
  status: 200,
  headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(RATE),
}));
```

Seen in a probe from the page at `file://`: the page's `fetch` gets the stubbed answer and reads its JSON; the request is in `opened.requests`. A stubbed status of 403, and a route that is aborted, each make Chromium log a console error ("Failed to load resource: …"), which `finish()` reports. So a browser test stubs a good answer only, and what the line says of a bad one is tested in Node (`probe.test.mjs`).

Two tests elsewhere hold that the page asks for nothing outside its own folder as it opens: `build.test.mjs`, "the page asks for nothing outside its own folder", and `shell.test.mjs`'s Roboto test. Both go on passing unchanged, since nothing is asked before About is opened.

### What a test takes away or stands in for

| What | How |
|---|---|
| `showOpenFilePicker` | `openPage(browser, { picker: false })`, or `openIn`. |
| `showSaveFilePicker`, `showDirectoryPicker` | `openPage(withInit(browser, () => { delete window.showSaveFilePicker; delete window.showDirectoryPicker; }), { picker: false })`. Each is an own property of the window in Chromium 153, so `delete` takes it away (seen in a probe). |
| A folder picked | `openPage(withInit(browser, () => { window.showDirectoryPicker = async () => ({ kind: 'directory', name: 'grasp-folder' }); }))`. A headless test cannot answer the folder picker, and a page at `file://` gets no real directory handle another way (`navigator.storage.getDirectory()` is refused there with a SecurityError). The plain object is kept by IndexedDB and is there after `page.reload()` in the same context (seen in a probe); it has no `queryPermission`, so the line then says `Permission: not told.` The permissions `granted`, `prompt` and `denied` are tested in Node. |
| How many times the page checks | The model library is frozen, and `window.SysMLModel` is read when a file is opened. Before a file is opened: `await page.evaluate(() => { const M = window.SysMLModel; window.__checks = 0; window.SysMLModel = Object.freeze({ ...M, validate: (model) => { window.__checks += 1; return M.validate(model); } }); })`. The session then counts each check. This is the model library's global, not `window.Grasp`. |
| The timer, in Node | `checksOf(session, { later })` with `const waits = []; const later = (run, ms) => { const wait = { run, ms, off: false }; waits.push(wait); return () => { wait.off = true; }; };`. A test runs a wait by calling `wait.run()`. `ProbeEnv.later` is stood in for the same way. |
| The model library, counted, in Node | `Object.freeze({ ...lib, validate: (model) => { calls += 1; return lib.validate(model); } })`, given to `openText` in place of `lib`. |

## 4. The test lists

Every browser test opens the page from `file://` through `openPage` or `openIn` and ends with `finish(opened)`. A wait is `soon(page, check, missing, frames)`; `frames` is `FRAMES` unless the row says otherwise. Messages are in the page's own terms.

"Fails before" is the first line of the failure when the test is run against the scaffold. "The breakage" is the change to the built code under which the test must fail.

### `canvas/app/test/checks.test.mjs` (Node)

`const core = await loadWith('core/checks')` (`canvas/app/test/core.mjs`). A session is `core.openText(lib, readText(EXAMPLE), { name: 'stronghold-proof.json' }, { now: clock() })`; `el(id)` is `session.model.elements.find((e) => e.id === id)`. "Rename App to Host" is `session.history.edit(() => { el('App').name = 'Host'; return 'Renamed part def App to Host'; }, 'name:App')`. The stand-in timer is the `later` of section 3. Compare what the library made as JSON (`plain`).

The two sentences every test of the twins uses:

- `TWINS = 'Two elements are named Host in the package.'`
- `RULE = "#validateNamespaceDistinguishibility·····[StrongholdProof/StrongholdProof]·····Constraint on type 'sysml:Namespace' is not respected: Its members part def Host and part def Host have the same name, and one is a kind of the other, so they can't be told apart."`

After the rename, the library gives the problems `[{ id: 'Host', message: TWINS }, { id: 'App', message: TWINS }]`, in that order, and one diagnostic, `{ rule: 'validateNamespaceDistinguishibility', metaclass: 'Namespace', type: null, id: null, path: 'StrongholdProof', severity: 'warning', text: RULE }` with `message` the part of RULE after "is not respected: ".

| # | Name | What it does | What it asserts | Fails before | The breakage |
|---|---|---|---|---|---|
| 1 | a session has one set of checks, and a new one has no result | `checksOf(session, { later })` twice, and for a second session. | The same object both times; another for the other session; `state` is `{ found: null, stale: true }`; no wait was started; the library's `validate` was not called. | `checksOf: step 12 builds it` | `checksOf` making new checks at each call |
| 2 | the first listener has the checks run at once, and the example has no entry | `listen(l)`. | Before `listen` returns: `validate` was called once; `plain(state)` is `{ found: { problems: [], diagnostics: [] }, stale: false }`; `l` was not called; no wait was started. | the same | the first listener's check left to a wait of `PAUSE` |
| 3 | a change waits 800 ms for a pause, and a second change starts the wait again | Listen. Edit `el('App').name = 'Hos'` with the key `name:App`; then rename App to Host with the same key; then run the second wait. | After the first edit: `l` called once; `state.stale` true; `state.found` the object it was; one wait, of 800, not called off; `validate` not called again. After the second: the first wait is called off; a second wait of 800 runs; `l` not called again. After the wait runs: `validate` called once more; `state.stale` false; `l` called once more. | the same | a wait that is running left running when the next change comes |
| 4 | two part defs given one name are found under Grasp's problems and under the specification's rules, in SysON's words | Listen, rename App to Host, run the wait. | `plain(state.found.problems)` is the two problems above, in order; `state.found.diagnostics` has one entry, whose `text` is RULE, `type` null and `id` null. | the same | `validateSpec` left out of the check |
| 5 | an undo and a redo check at once | As 4; then `history.undo()`; then `history.redo()`. | After the undo, with no wait run: both lists empty, `stale` false, `l` called once for it, no new wait. After the redo: the twins' lists again, at once. With a change waiting (rename, then undo before the wait runs): the wait is called off, and the lists are empty at once. | the same | an undo waiting for the pause as an edit does |
| 6 | with no listener nothing is checked, and the next listener checks at once | The library counted. Listen, then stop. Rename App to Host. Then listen again. | After the rename: no wait started; `validate` not called; `state.stale` true and `state.found` the object it was. After the second `listen`: `validate` called once more before it returns; the twins' lists; the new listener not called. | the same | the checks live whether or not anybody listens |
| 7 | a listener that leaves during the wait calls the wait off | Listen, rename, stop the listener. | The wait is called off; `state.stale` stays true. | the same | the wait left running when the last listener goes |
| 8 | the end of a run of changes checks nothing | Listen, rename with its key, `history.endEdit()`. | `endEdit` starts no wait, calls nothing off, and calls `l` no more. | the same | the end of a run heard as a change |
| 9 | a result that reads the same is the same object | Listen (the example: both lists empty). `history.edit(() => { el('DevHost').doc = 'x'; return 'Changed a doc'; })`, run the wait. Then `history.undo()`. | After the wait: `state.found` is the very object it was; `stale` false; `l` called twice in all (stale, then fresh). After the undo: `state` is the very object it was, and `l` is called no more. | the same | every check giving a new `found` |
| 10 | the checks of two sessions do not hear each other | Two sessions of the example, each listened to with its own stand-in timer. Rename in the first. | The first is stale with a wait; the second's `state` is the object it was, with no wait and its listener not called. | the same | the checks kept by the module, not by the session |
| 11 | what an entry is about, and what a click on it picks | On the example's model: `aboutProblem` for the ids `Host`, `s-DevHost`, `t-hosts-api`, `v-proof`, null and `gone`; `aboutDiagnostic` for `{ type: null, id: null }`, `{ type: 'el', id: 'Page' }`, `{ type: 'rel', id: 's-DevHost' }` and `{ type: 'el', id: 'gone' }`. | `{ type: 'el', id: 'Host', pick: [{ type: 'el', id: 'Host' }] }`; `rel` `s-DevHost` picking itself; `rel` `t-hosts-api` (hidden) picking `[{ type: 'rel', id: 't-hosts-api' }, { type: 'el', id: 'Page.hosts.api' }]`; `view` `v-proof` picking itself; `{ type: 'package', id: '', pick: [] }` for null; `{ type: 'none', id: 'gone', pick: [] }`; and the four diagnostics: package, `el` `Page`, `rel` `s-DevHost`, `none` `gone`. | `aboutProblem: step 12 builds it` | a hidden relationship picked alone |
| 12 | every listener is told even when one throws | The session opened with `{ now: clock(), mistake: (error) => mistakes.push(error) }`, so that the history hands a listener's error to the test. Two listeners, the first throws `new Error('first')`. Rename. | The second was called; `state.stale` is true; `mistakes` holds one error, whose message is `first` (the checks throw it on to the history, which reports it). | `checksOf: step 12 builds it` | the telling stopped at the first listener that throws |
| 13 | the checks' methods can be handed over as they are | `const { listen } = checksOf(session, { later }); listen(l)`. | It checks at once as in 2. | the same | `listen` reading `this` for the session |

### `canvas/app/test/probe.test.mjs` (Node)

`const core = await loadWith('core/probe')`. A stand-in environment is made by a function of the test file, `envOf(over)`, whose members a test replaces:

```js
const CHROME = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36';
const RATE = { resources: { core: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } }, rate: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } };
function envOf(over = {}) {
  const store = new Map();
  const waits = [];
  const times = [0, 39, 316];
  return {
    userAgent: CHROME, secure: true, openPicker: true, savePicker: true,
    pickFolder: async () => ({ name: 'grasp-folder', queryPermission: async () => 'granted' }),
    fileInput: true, download: true,
    tryStorage() {},
    kept: { get: async (key) => store.get(key), put: async (key, value) => { store.set(key, value); }, remove: async (key) => { store.delete(key); } },
    tryWorker: async () => {},
    wasm: { instantiate: (bytes) => WebAssembly.instantiate(bytes) },
    fetch: async () => ({ ok: true, status: 200, json: async () => RATE }),
    now: () => times.shift(), date: () => '2026-11-13T12:00:00.000Z', load: 'load-1',
    later: (run, ms) => { const wait = { run, ms, off: false }; waits.push(wait); return () => { wait.off = true; }; },
    store, waits, ...over,
  };
}
```

`settle()` lets every promise that is ready run: `for (let i = 0; i < 20; i += 1) await new Promise((resolve) => setImmediate(resolve));`. `line(probe, id)` is `probe.lines.find((l) => l.id === id)`. The loop's wait is `env.waits.find((w) => w.ms === 400)`; GitHub's is the one of 10000.

| # | Name | What it does | What it asserts | Fails before | The breakage |
|---|---|---|---|---|---|
| 1 | before it is asked, every line is pending and says Asking…, in the panel's order | `createProbe(env)` with `fetch`, `kept.get` and `tryWorker` counted. | Thirteen lines with the ids and labels of section 3, in order; each `pending`, `Asking…`; nothing was called, and no wait started. | `createProbe: step 12 builds it` | the probe asking as it is made |
| 2 | a round answers the lines that need no waiting at once, and the others as their answers come | `probe.listen(l)`; `probe.ask()`; read; `await settle()`; read. | Straight after `ask()`: `browser` `told` `Chrome 153.0.8010.12`; `secure` `yes` `Yes.`; the three pickers, `file-input`, `download` `yes` `Present.`; `local-storage` `yes` `Works.`; `indexed-db`, `worker`, `wasm`, `github`, `folder` `pending` `Asking…`; `l` called once. After settling: `indexed-db` `yes` `Works.`; `worker` `yes` `Works.`; `github` `yes` `Reached: 57 of 60 requests left this hour.`; `folder` `told` `None is remembered.`; `wasm` still `pending`; `env.store` has no key `probe`; `fetch` was called once, with `https://api.github.com/rate_limit` and an init whose `cache` is `no-store` and whose `signal` is an AbortSignal. | the same | the IndexedDB line answered with its key left in the store |
| 3 | what is missing or blocked is said on its line | A round with `secure: false`, `openPicker: false`, `savePicker: false`, `pickFolder: null`, `fileInput: false`, `download: false`, `tryStorage` throwing `new Error('The operation is insecure.')`, every method of `kept` rejecting `new Error('Internal error opening backing store')`, `tryWorker` rejecting `new Error('no answer within 3 s')`. A second round elsewhere with `kept.get` resolving 2 for the key `probe`. A third with `openPicker: true, savePicker: false`. | `secure` `no` `No: the file pickers need one.`; `open-picker` `no` `Missing: Open asks through a file input, and Save downloads the file.`; `save-picker` `no` `Missing.`; `folder-picker` `no` `Missing: no folder can be remembered.`; `file-input` and `download` `no` `Missing.`; `local-storage` `no` `Blocked: The operation is insecure.`; `indexed-db` `no` `Blocked: Internal error opening backing store.`; `worker` `no` `Blocked: no answer within 3 s.`; `folder` `no` `Cannot be read: Internal error opening backing store.` Second: `indexed-db` `no` `Blocked: what was written did not come back.` Third: `open-picker` `yes`, `save-picker` `no`. | the same | the save picker's line read from the open picker |
| 4 | the browser's name and version come from its user agent | `browserOf` on six texts. | CHROME gives `Chrome 153.0.8010.12`; `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36` gives `Chrome 157.0.0.0`; the same with ` Edg/157.0.0.0` at its end gives `Edge 157.0.0.0`; `Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0` gives `Firefox 140.0`; `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.1 Safari/605.1.15` gives `Safari 19.1`; `curl/8` gives `curl/8`; three spaces give `Not told.` | `browserOf: step 12 builds it` | Chrome looked for before Edge |
| 5 | GitHub's answer: reached with what is left, reached, answered with a status, not reached | A round for each `fetch`: the default; `json` resolving `{}`; `json` rejecting; `json` resolving `{ rate: { limit: 60, remaining: 57 } }`; `{ ok: false, status: 403 }`; rejecting `new TypeError('Failed to fetch')`; `fetch: null`. | `yes` `Reached: 57 of 60 requests left this hour.`; `yes` `Reached.` three times; `no` `Answered with HTTP 403.`; `no` `Not reached: Failed to fetch.`; `no` `Not reached: this browser has no fetch.` In the first, the wait of 10000 is called off once the answer came. | `createProbe: step 12 builds it` | an answer that is not `ok` said to be reached |
| 6 | GitHub that does not answer within 10 s is given up, and its late answer changes nothing | `fetch` returns a promise the test keeps, and records its `init.signal`. `ask()`, settle, run the wait of 10000, read; then resolve the fetch with a good answer, settle, read. | After the wait: `github` `no` `Not reached: no answer within 10 s.`, and the signal is aborted. After the late answer: the line is the object it was. | the same | the late answer written over the line |
| 7 | the loop runs once for the page, after the panel is up, and gives both times | `instantiate` counted. `ask()`, settle; `ask()` again, settle; run the wait of 400, settle; `ask()` a third time, settle. | After two rounds: `wasm` `pending`; exactly one wait of 400, not called off; `instantiate` not called. After the wait: `wasm` `yes` `Runs: 50 million steps in 39 ms; the same loop in JavaScript took 277 ms.` After the third round: the `wasm` line is the object it was, straight after `ask()` too; still one wait of 400 in all; `instantiate` called once. | the same | the loop run again at every round |
| 8 | WebAssembly that is missing, blocked or wrong says so | Three probes: `wasm: null`; `instantiate` rejecting `new Error('Wasm code generation disallowed by embedder')`; `instantiate` resolving `{ instance: { exports: { run: () => 7 } } }`. Each: `ask()`, run the wait of 400, settle. | `no` `Missing.`; `no` `Blocked: Wasm code generation disallowed by embedder.`; `no` `Runs, with a wrong result.` | the same | a wrong result said to run |
| 9 | the loop in WebAssembly and the loop in JavaScript give the same number | `WebAssembly.instantiate(core.WASM_LOOP)`; its `run` and `core.jsLoop` for 0, 1, 2, 10, 1000 and `core.LOOP_STEPS`. | 0, 0, 1, 88467921, -472873864 and 1249568185, from both; `core.LOOP_RESULT` is 1249568185; the module is 77 bytes. | **Passes against the scaffold**: the loop is final. | the module's `0x1f` (the 31) changed to `0x1e` |
| 10 | the words of the lines | The final functions. | `runs(39.4, 276.6)` is `Runs: 50 million steps in 39 ms; the same loop in JavaScript took 277 ms.`; `blocked('x')` is `Blocked: x.` and `blocked('x.')` is `Blocked: x.`; `reasonOf(new Error(' a '))` is `a`; `reasonOf('')` and `reasonOf(undefined)` are `no reason given`; `reasonOf({ message: 'm' })` is `m`; `reachedWith(57, 60)`, `answered(403)`, `notReached('x')`, `rememberedNow('grasp-folder')`, `survived('grasp-folder', '2026-11-13T12:00:00.000Z', 'granted')`, `notRemembered('x')`, `notRead('x')` and `SAID.asking`, `.noFolder`, `.noAnswer` read as section 3's table has them. | **Passes against the scaffold**: the words are final. | `blocked` adding a full stop after one |
| 11 | a folder is remembered at a click, and the next page load says it survived | Probe A on `envOf()`: `ask()`, settle; `await probe.remember()`; read; `ask()`, settle; read. Probe B on `envOf({ load: 'load-2' })` given A's `kept`: `ask()`, settle. Then B again with the record's handle replaced, in the store, by `{ name: 'grasp-folder' }`, by one whose `queryPermission` rejects, and by one that resolves `prompt`. | A: `pickFolder` called once; the store's `folder` is `{ handle, name: 'grasp-folder', at: '2026-11-13T12:00:00.000Z', load: 'load-1' }` with the handle the picker gave; the line is `told` `Remembered now: grasp-folder. Reload the page, or restart the browser, and open About again.`, and the same after the next round. B: `yes` `Survived: grasp-folder, remembered 2026-11-13T12:00:00.000Z. Permission: granted.`; then `Permission: not told.` twice; then `Permission: prompt.` | the same as 1 | a record said to have survived in the page load that made it |
| 12 | a picker that is closed changes nothing, and one that fails says why | After a settled round: `remember()` with `pickFolder` rejecting `Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' })`; with it rejecting `new Error('nope')`; with `kept.put` rejecting `new Error('full')`; with `pickFolder: null`. And: call `probe.remember()` without awaiting it and look at once. | Closed: the `folder` line is the object it was. Failed: `no` `Not remembered: nope.` Put refused: `no` `Not remembered: full.` No picker: the promise resolves and nothing was called. `pickFolder` was called before `remember()` returned its promise. No `remember()` rejects. | the same | a closed picker said as a failure |
| 13 | an answer of an older round is dropped | `tryWorker` returns a promise the test keeps, one for each call. `ask()`, `ask()`; reject the second with `new Error('late')`, settle; resolve the first, settle. | `worker` is `no` `Blocked: late.` after both. | the same | every answer written, whatever its round |
| 14 | a click's answer for the folder is newer than a round's that began before it | `kept.get` for the key `folder` returns a promise the test keeps. `ask()`; `await probe.remember()`; then resolve the kept promise with undefined, settle. | The line stays `told` `Remembered now: grasp-folder. …`. | the same | a round's answer for the folder always written |
| 15 | a line that did not change is the object it was | A settled round; keep `lines`; `listen(l)`; `ask()`; settle. | Straight after `ask()`: `lines` is another array; the `browser` and `secure` lines are the objects they were; `l` was called once by `ask()` itself. | the same | every line made anew at each change |
| 16 | every listener is told even when one throws | Two listeners, the first throws `new Error('first')`; `ask()` in a `try`. | The second was called, and `ask()` threw the error `first` on. | the same | the telling stopped at the first listener that throws |

Tests 7, 8 and 9 run the real loop, some tenths of a second each.

### `canvas/app/test/validation.test.mjs` (the page)

`const view = modelOf(EXAMPLE).views[0]` (`v-proof`, `proofStructure : GeneralView`). The helpers of the test file:

- `read(page)`: one read in the page, so that its parts belong to one moment: `stale`, the `data-stale` of `.grasp-validation-lists` (null when there is none), and `lists`: for each `section[data-list]` under `[data-testid="validation"]`, its `data-list`, `data-count`, title, count, note, the sentence of `.grasp-validation-none` or null, and its entries as `[data-entry, textContent, role, aria-current]`.
- `said(page)`: what the panel says under its title: the root's `textContent` without the text of its title row (`.grasp-side-title`).
- `untilLists(page)`: `soon` until both sections are there; its message is `The Validation panel shows no list of Grasp's problems (data-list "problems"): it says "<said(page)>".`
- `rename(page, id, name)`: `selectBox(page, view, id)`, then `fieldIn(page, 'name').fill(name)`: one change, as a paste is. Its message when Details has no such field is step 10's own.

TWINS and RULE are the sentences of `checks.test.mjs`. For the two parts: `IN_PAGE = 'Two elements are named hosts in Page.'` and `PAGE_RULE = "#validateNamespaceDistinguishibility·····[StrongholdProof/StrongholdProof::Page]·····Constraint on type 'sysml:Namespace' is not respected: Its members part hosts in Page and part hosts in Page have the same name, and one is a kind of the other, so they can't be told apart."`

Tests 2, 3, 4 and 6 need steps 9 and 10 in the page (a box picked on the plane, a name typed into Details). Each begins with `untilLists`, before it touches either, so that against the scaffold it fails for want of the lists.

| # | Name | What it does | What it asserts | Fails before | The breakage |
|---|---|---|---|---|---|
| 1 | the example has no entry, and the panel says so | `openIn(browser, stateFileAt(EXAMPLE))`; `showSide(page, 'Validation')`; `untilLists`. | Two lists, `problems` then `rules`; titles `Grasp's problems` and `The specification's rules`; counts `0` and `0`, as `data-count` and as text; `No problems found.` and `No rule is broken.`; no `[data-entry]`; the rules' note is section 3's sentence, with 15 and 388; `stale` is `"false"`. | `The Validation panel shows no list of Grasp's problems (data-list "problems"): it says "The model's problems come in step 12.".` | the sentence of a list with no entry left out |
| 2 | two part defs given one name are listed 0.8 s after the change, under Grasp's problems and under the specification's rules in SysON's words, and both entries go with Undo | `openIn` the example; `showSide(page, 'Validation')`; `untilLists`; `untilDrawn(page, view)`. In the page: note the time of the first `input` event (a capturing listener on the window) and, with a MutationObserver on the panel's root, the time the first `[data-entry]` appears. `rename(page, 'App', 'Host')`. `soon`, with 10 frames, until a `read` has `stale` `"true"`: that read is the one judged "while stale". Then `soon`, with `BROWSER_FRAMES`, until three entries are listed. Then `undo(page)`, and `soon`, with 10 frames, until none is. | While stale: no entry yet, both counts still `0`, both sentences still there. Once listed: `problems` has `el:Host` then `el:App`, both saying TWINS, count `2`, no `.grasp-validation-none`; `rules` has `package:` saying RULE, count `1`; `stale` is `false`; the first entry appeared at least 790 ms after the `input` event (the pause is 800; the page's clock is coarse). After Undo: both lists empty with their sentences, counts `0`, `stale` `false`; the box `App` reads "App" again. | the same as 1 | the rules' entries saying the diagnostic's `message`, not its `text` |
| 3 | a click selects what an entry is about | As 2 up to the three entries. Click `[data-list="problems"] [data-entry="el:Host"]`. Then give `[data-entry="el:App"]` the focus and press Enter. Then click `[data-list="rules"] [data-entry="package:"]`. | After the first: `boxOf(page, view.id, 'Host').selected` and not `App`'s; `el:Host` has `aria-current="true"` and `el:App` has none. After the second: `App` selected and not `Host`; the mark has moved. Both have the role `button`; `package:` has not, and after the click on it `App` is still selected. | the same as 1 | a click on an entry picking nothing |
| 4 | a click on a rule's entry selects the namespace it is about | Open, show, `untilLists`, `untilDrawn`; `rename(page, 'Page.app', 'hosts')`; `soon`, with `BROWSER_FRAMES`, until three entries. Click `[data-list="rules"] [data-entry="el:Page"]`. | `problems`: `el:Page.hosts` then `el:Page.app`, both IN_PAGE; `rules`: `el:Page` saying PAGE_RULE, with the role `button`. After the click: `Page` is selected on the plane, `Page.app` is not, and the entry has `aria-current="true"`. | the same as 1 | the rules' entries drawn as no buttons |
| 5 | a file is checked at once when it is opened, and another file's lists take its place | `openPage(browser, { picker: false })`; `showSide(page, 'Validation')`. Then `openStateFile(page, stateFileOf('twins.json', state))`, where `state` is the example's state file with `App`'s name set to `Host`; `soon`, with 10 frames, until three entries. Then `openStateFile(page, stateFileAt(EXAMPLE))`; `soon`, with 10 frames, until none. | With no file: `said(page)` is `No file is open.` and there is no `.grasp-validation-lists`. With `twins.json`: the entries of test 2, without any change being made. With the example: both lists empty with their sentences. | `With no file open the Validation panel says "The model's problems come in step 12.", not "No file is open.".` | the first check of a panel that is shown left to a wait of `PAUSE` |
| 6 | a hidden or collapsed Validation panel checks nothing, and shown again it is up to date at once | `openPage(browser, { picker: false })`; count the checks (section 3); `openStateFile` the example; `untilDrawn`. `showSide(page, 'Validation')`; `untilLists`. `showSide(page, 'Explorer')`. `rename(page, 'App', 'Host')`. Wait until a second has passed on the page's clock (`until(page, (t) => performance.now() - t >= 1000, t0, 'a second passes', 3000)`: the one wait by the clock, since what is waited for is that nothing happens). `showSide(page, 'Validation')`; `soon`, with 10 frames, until three entries. Then click the strip's name `Validation` (it is in front, so the side collapses) and `soon` until the root is under 1 px wide; `undo(page)`; a second by the clock again; click the name `Validation` again; `soon`, with 10 frames, until no entry is listed. | The count of checks is 0 before the panel is first shown, 1 once it is; still 1 after the hidden second; 2 once shown again, with the twins listed; still 2 after the collapsed second; 3 once the side is open, with both lists empty. | the same as 1 (it shows the panel before anything else, but after counting) | the lists mounted whether or not the panel is shown |

### `canvas/app/test/about.test.mjs` (the page)

The helpers of the test file:

- `stubGitHub(context, hold)`: section 3's route; with `hold` (a promise), the answer waits for it.
- `openAbout(page)`: asserts that `[data-testid="about"]` is enabled, with the message `About is disabled (data-testid "about"), so the About panel cannot be opened.`; clicks it; `soon` until `[data-testid="about-panel"]` is in the document, with the message `A click on About showed no About panel (data-testid "about-panel").`
- `closed(page)`: `soon` until the panel is out of the document.
- `lines(page)`: for each `[data-line]` of the panel, `[id, data-state, label, value]`.
- `answered(page)`: `soon`, with `BROWSER_FRAMES`, until the panel has a line and none is `pending`; it gives `lines(page)`.
- `outside(opened)`: `opened.requests` without those under `DIST_URL` and those that begin `data:`, `blob:` or `about:`.

Every test calls `stubGitHub` before it opens About.

| # | Name | What it does | What it asserts | Fails before | The breakage |
|---|---|---|---|---|---|
| 1 | About opens from the bar, with no file open and with one, and closes by its button, by Escape and by a click outside it | `openPage(browser, { picker: false })`. `openAbout`; click the button named `Close` in the panel; `closed`. `openAbout`; press Escape; `closed`. `openAbout`; `page.mouse.click(20, 450)`; `closed`. `openStateFile` the example; `openAbout`. | The panel has `role="dialog"` and `aria-modal="true"`, and `page.getByRole('dialog', { name: 'About Grasp' })` finds it. It leaves the document each of the three ways. With the example open, About is enabled and opens the panel again. | `About is disabled (data-testid "about"), so the About panel cannot be opened.` | Escape made to close nothing |
| 2 | each line reports what this Chromium does, with GitHub's answer stubbed | `openPage(browser)` (the pickers are there); `openAbout`; `answered`. | Thirteen lines, with the ids, in the order, and with the labels of section 3. `browser`: `told`, `Chrome <version>`, the version digits and dots with the same first number as `browser.version()`. `secure` `yes` `Yes.`; `open-picker`, `save-picker`, `folder-picker`, `file-input`, `download` each `yes` `Present.`; `local-storage`, `indexed-db`, `worker` each `yes` `Works.`; `wasm` `yes`, matching `/^Runs: 50 million steps in \d+ ms; the same loop in JavaScript took \d+ ms\.$/`; `github` `yes` `Reached: 57 of 60 requests left this hour.`; `folder` `told` `None is remembered.`; the button `Remember a folder…` is enabled. | the same as 1 | the worker's line left out of the panel |
| 3 | the libraries' versions are the installed ones, and React Flow and the notices file are credited | `openPage(browser)`; `openAbout`. In Node: the names of `dependencies` in the root `package.json`, sorted, and for each the `version` and `license` of `node_modules/<name>/package.json`. | The `data-library` values are those names in that order (eleven). Each row's version and licence are the installed package's (`react` `18.3.1` `MIT`, `@xyflow/react` `12.10.2` `MIT`, `elkjs` `0.11.0` `EPL-2.0`, and so on). The credit and the notices sentence read as in section 3, with their two links' texts and `href`s. | the same as 1 | the libraries' rows left out |
| 4 | with the pickers taken away, the panel says so and Open falls back to the file input | `openPage(withInit(browser, …), { picker: false })` with the two other pickers deleted (section 3); `openAbout`; `answered`; close by `Close`; `closed`; `openStateFile(page, stateFileAt(EXAMPLE))`; `viewTab(page, view)`. | `open-picker` `no` `Missing: Open asks through a file input, and Save downloads the file.`; `save-picker` `no` `Missing.`; `folder-picker` `no` `Missing: no folder can be remembered.`; `file-input` and `download` still `yes` `Present.`; `Remember a folder…` is disabled. Then Open asks through a file input (`openStateFile` fails otherwise), the bar shows `stronghold-proof.json`, and the view has its tab. | the same as 1 | the pickers' lines saying `Present.` whatever the window has |
| 5 | the network is asked only when About is opened, once at each opening, and the timing loop runs once | `openPage(browser)`; let the fonts load (`document.fonts.ready`) and a frame pass; read `outside`. `openAbout`; `answered`; read. Close; `closed`; `openAbout`; read the `wasm` line at once; `answered`; read. | Before About: `outside` is empty. After the first opening: exactly `['https://api.github.com/rate_limit']`. After the second: that address twice, and nothing else. At the second opening the `wasm` line is `yes` at the first look, with the very text it had. | the same as 1 | GitHub asked once for the page, its answer kept |
| 6 | a line says Asking… until its answer comes | `openPage(browser)`; `stubGitHub(opened.context, hold)`, with `hold` a promise the test keeps; `openAbout`; `soon`, with `BROWSER_FRAMES`, until `indexed-db`, `worker` and `folder` are not `pending`. Read. Let the answer go; `answered`. | While held: `github` is `pending` and says `Asking…`; `secure` is `yes`. Once let go: `github` `yes` `Reached: 57 of 60 requests left this hour.` | the same as 1 | the GitHub line said to be reached before its answer comes |
| 7 | a folder remembered survives a reload, and the next opening says so | `openPage(withInit(browser, …))` with the folder picker stood in for (section 3); note the time. `openAbout`; `answered`; click `[data-testid="about-remember"]`; `soon` until the `folder` line begins `Remembered now`. Close; `closed`; `openAbout`; `answered`; read. `page.reload()`, wait for `[data-testid="app"]`; `openAbout`; `answered`; read. | Before the click: `told` `None is remembered.` After it, and at the next opening in the same page load: `told` `Remembered now: grasp-folder. Reload the page, or restart the browser, and open About again.` After the reload: `yes`, matching `/^Survived: grasp-folder, remembered (\S+)\. Permission: not told\.$/`, the time an ISO string between the time noted and now. | the same as 1 | a record said to have survived in the page load that made it |

Once `12-impl-bar` is built and `About.tsx` is not, each fails with `A click on About showed no About panel (data-testid "about-panel").`

### Tests that exist and must go on passing unchanged

No existing test asks for what step 12 changes: none reads the Validation panel's words, and none asks that About be disabled. `shell.test.mjs`, `keys.test.mjs`, `build.test.mjs`, `open.test.mjs` (criterion 2), `instant.test.mjs` (criterion 6) and `scale.test.mjs` (criterion 5) are not restated.

## 5. The screenshot

### `about.png`: the scenario, `canvas/app/test/shots/about.mjs`

The file exports the shot `{ name: 'about', step: 12, pending: true, take }`, with no `picker` (the page keeps its pickers, so their lines say `Present.`). `pending: true` stays until `12-checks-close` takes it off: `npm run shots` then leaves the shot out while About is not built, and `npm run shots -- about` runs it all the same. `take(page, out)` gets the page as it opens, 1400 by 900 at device scale 2, with no file:

1. Route GitHub's address on `page.context()` with section 3's stub.
2. Click `[data-testid="about"]`, and wait (`soon`) for `[data-testid="about-panel"]`.
3. Wait, with `BROWSER_FRAMES`, until the panel has thirteen lines and none is `pending`. The `folder` line then says `None is remembered.`
4. Move the mouse to 700, 880 (off the bar's button, so that its tooltip goes), and wait until the page holds no `[role="tooltip"]` and the dialog's fade is over: the computed `opacity` of `.MuiDialog-container` is `1`.
5. `await document.fonts.ready` and two animation frames, as the other shots do.
6. `page.screenshot({ path: path.join(out, 'about.png') })`.

A step that does not come throws an error that says what the page lacks. The two times on the WebAssembly line differ from run to run, so the image differs a little each time it is taken.

### `about.png`: the list its reviewer checks

Each item is present or absent in the image.

1. A dialog titled "About Grasp" lies over the window, and the page behind it is dimmed.
2. Under "This browser" there are thirteen lines, labelled from top to bottom: Browser, Secure context, Open picker, Save picker, Folder picker, File input, Download, localStorage, IndexedDB, Worker from a Blob URL, WebAssembly, GitHub, Remembered folder.
3. Every one of the thirteen lines has an answer beside its label: none says "Asking…", and none shows a spinner.
4. The Browser line names Chrome with a version number.
5. The WebAssembly line gives two times in ms.
6. The GitHub line reads "Reached: 57 of 60 requests left this hour."
7. Under "Libraries" eleven packages are listed, each with a version and a licence, among them react 18.3.1, @xyflow/react 12.10.2, dockview-react 8.9.0, @mui/material 7.3.11 and @mui/x-tree-view 8.29.3.
8. React Flow is credited by name, and THIRD-PARTY-NOTICES.txt is named.
9. There is a button "Remember a folder…" and a button "Close".
10. Nothing is cut off or overlapping, and the dialog shows no scrollbar.
11. The text is Roboto.

### `shell.png` and `example.png`, retaken at the end of step 12

Criterion 4 asks that both be retaken and rated again once step 12 is built. Their scenarios are the rows `shell` and `example` of `canvas/app/test/shots.mjs`, which do not change.

**`shell.png`** is the page as it opens, with no file. By step 12 the panels are built, so it shows: the bar, with Open and About bright and Save, Undo and Redo dim (nothing is open); the left strip with Explorer in front, and Tools and Validation; the Explorer panel saying what step 9 has it say with no file; the card "Open a model" in the editor; the Details panel saying what step 10 has it say with nothing picked; the right strip with Details. Its reviewer's list is the plan's row, as session 18 read it, in seven items:

1. The whole window is shown.
2. One bar across the top, 40 px high (80 px of the image, which is taken at device scale 2).
3. The bar holds four actions (Open, Save, Undo, Redo) and About, each an icon.
4. Three names on the left strip: Explorer, Tools, Validation.
5. One name on the right strip: Details.
6. Nothing is wrapped or cut off. A sentence that runs onto a second line inside its panel or its card is a paragraph's ordinary wrap, not a cut (`plan/notes.md`, session 18).
7. The text is Roboto.

**`example.png`** is the example fitted, with both sides collapsed. Its list is the plan's row in eight items, the sixth read as Damon decided (`plan/notes.md`, session 21, "What Damon decided", 1):

1. The example is fitted: the whole view lies on the plane.
2. `Page` holds `hosts` and `app`.
3. Each `api` port lies across its owner's border.
4. Each port's name is outside its owner.
5. `mount` joins the two ports.
6. The three specializations end in a hollow triangle at `Host`: three lines that join into one trunk, with one hollow triangle at `Host`'s bottom middle.
7. The two defined-by lines, each with its two dots.
8. No line passes through a name.

**The four points**, for each of the two images (criterion 4): alignment and spacing; type and contrast; nothing cut off or overlapping; boxes and lines easy to read. Each from 1 to 5: 1 is a broken layout, 3 a working prototype, 5 a finished workbench of SysON's kind. Each of the eight scores must be 4 or more.

## 6. Decisions

Where the plan is silent:

1. **The checks are a store of the core, `core/checks.ts`**, a file the plan does not name: the 0.8 s, the undo and the hidden panel are then tested in Node.
2. **A hidden or collapsed panel checks nothing**: a check costs about 40 ms at 5,000 elements, and nothing but the panel reads its result in slice 1.
3. **An undo and a redo check at once**, as the old page does; an edit waits for the pause.
4. **Every change makes a result out of date**, a move included: a view kind's own check may read places, and a check after a drag's end costs one check.
5. **A click picks and does nothing else**: no tab is opened, no camera moves.
6. **A hidden line's entry picks the line and the element it starts from**, as the old page marks both.
7. **An entry about the package is no button**: the selection cannot hold the package.
8. **The entry of what is picked is marked**, so that two entries that read alike can be told apart.
9. **No fold by severity**: every diagnostic is a warning, and a side panel is narrow.
10. **While a result is out of date the lists dim and say nothing**, so that nothing moves as a name is typed.
11. **The old page's note stands under the rules' title**, since only 15 of the 388 rules are checked.
12. **The probe is a store too**, with every question behind a `ProbeEnv`; `browserEnv()` is the only part a Node test cannot run.
13. **Each opening asks every line again, GitHub included; the loop runs once for the page**, 400 ms after the first opening.
14. **The loop is Grasp's own**, since the probe page is not in the repository; the line gives both times and no verdict.
15. **The three pickers are three lines**, and the file input and download two, so that each can be seen missing by itself.
16. **The libraries are `package.json`'s dependencies as installed**, defined by the build; elkjs is among them, shipped beside the page and not loaded.
17. **A remembered folder is known to have survived by the page load it was remembered in**; the permission is read with `queryPermission`, never asked for.
18. **The About panel is two parts side by side, 900 px wide**, so that at 1400 by 900 nothing scrolls and `about.png` shows every line.
19. **A line's state is shown by a dot, a ring or a spinner drawn in CSS**: no icon is added to `vendor.ts`, and a check mark is not in Roboto's Latin file.
20. **Neither panel has a stylesheet**: colours and sizes come from the theme, in `sx`.
21. **Two test files beyond the plan's two**, `checks.test.mjs` and `probe.test.mjs`, for what needs no browser.
22. **A browser test stubs a good answer from GitHub only**: a bad one makes Chromium log an error. The bad answers are tested in Node.

Tried and dropped:

- **A real folder handle for the test**, from `navigator.storage.getDirectory()`: a page at `file://` is refused it with a SecurityError. The test hands a plain object in, and the permission is tested in Node.
- **Counting the checks by replacing `window.SysMLModel.validate`**: the library is frozen, and the assignment does nothing. The global itself is replaced by a frozen copy before a file is opened.
- **Timing the pause from the moment the lists turn stale**: 798 ms in a probe, since the page marks them stale a moment after the timer starts. The test times from the `input` event, which comes before the change.
- **The libraries' versions from the libraries themselves**: only React and Material UI export one at run time.
- **Checks that always run after a pause**, as on the old page: 40 ms at 5,000 elements every time the changes pause, for a list nobody sees.

## 7. What the closing of step 12 carries

Step 12 is the last step that section 10's criteria cover. `12-checks-close`, the lead's, carries the last checks of five of them; its brief has the list. In short:

| Criterion | Its last check, at the commit that ends step 12 |
|---|---|
| 1 | `npm run check` exits 0; `npm test` reports `# fail 0` and `# todo 0`; all ten checks of `plan/status.json` read `"pass"`; every test that steps 5 to 12 name exists under its name. |
| 3 | `about.png` checked against its list by `12-review-shot-about`: every item present. |
| 4 | `shell.png` and `example.png` retaken, each rated on the four points by `12-review-shot-shell` and `12-review-shot-example`: eight scores, each 4 or more. |
| 5 | Three runs of `npm test` in a row, with nothing else running: the model opens in under 5 s, a drag step under 16 ms, a pan step of each fitted view under 16 ms, a keystroke in a name under 50 ms, each by the median, in each run. |
| 6 | In the same three runs, `instant.test.mjs` whole: the page ready in under 500 ms, the example drawn within 1 s, a drag step and a keystroke in a name under 16 ms by the median of 9, a switch of tab under 100 ms. |

Criterion 7's run of all eight step commits and criterion 8's five questions come after step 12 and are step 13's (`plan/swarm/step-13.md`).
