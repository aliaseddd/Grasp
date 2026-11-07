# The canvas's sources

`canvas/build.mjs` stitches the files in this folder into `canvas/index.html`, the one self-contained page that is published on claude.ai and opened as a file. Don't edit `index.html` by hand: change the files here, or `canvas/state.json` (the saved model, notes and archive), and run `node canvas/build.mjs`. `node canvas/build.mjs --check` fails when `index.html` isn't what the sources build, and the tests run it, so commit the built page with its sources.

## Folders

One folder per feature, and `core` for what every feature builds on:

| Folder | What it holds |
|---|---|
| `core/` | The page's shell (`page.html`: the head, the markup, and one line per block the build fills in), the core styles, the metamodel's classifiers (`lib/metamodel.js`, generated), the model library's tables, helpers, checks and export, and the page's state, layout, drawing, camera, undo, tools, views, panel, notes, store and pointer handling. |
| `interconnection/` | Items, interface defs, interfaces, flows and bindings, and the interconnection view. |
| `behavior/` | The action flow view and the state transition view. |
| `sequence/` | The sequence view. |
| `geometry/` | The geometry view and the spatial fields. |
| `grid/` | The grid view. |
| `browser/` | The browser view. |
| `annotations/` | Free notes, pins that can be dragged, the archive, and code links. |

A feature's folder holds up to three files: `lib.js`, its part of the model library (its rows in the library's tables, and the rules and the export behind them); `page.js`, its part of the page (its tools, shapes, markers, renderer and panel); and `style.css`, its styles. `build.mjs` lists every file in the order it is stitched, and a file in this folder that no list names fails the build. The panel's markup is all in `core/page.html` for now.

## How a script is laid out

The scripts are plain scripts, not modules, so stitching them needs no bundler: each runs once, in the order `build.mjs` lists them, inside the page's one `<script>` (or the library's `<script id="model-lib" data-lib>`). Each is a function that runs at once, and the scripts share one object, the way the library has always registered `SysMLModel`:

- The model library's scripts share `SysMLModelLib`, `lib` in each script. The first creates it; the last builds `SysMLModel` from it the way it always has, freezes it, and removes `SysMLModelLib`, so the page, `export.mjs` and `save-state.mjs` see only `SysMLModel`. The first, `core/lib/metamodel.js`, is generated from the SysML metamodel by `canvas/metamodel/generate.mjs` (`canvas/metamodel/README.md`): change the generator and run it, never the file by hand.
- The page's scripts share `window.SysMLCanvas`, `C` in each script, which the first (`core/page/base.js`) creates. What the page shows and changes as it runs, the state its scripts share, is `C.state`, `S` in each script: `S.model`, `S.selection`, `S.layout`, and the rest. `core/page/state.js` sets most of it and names the scripts that set the others.

A page script looks like this:

```js
// What the script is for.
(function (C) {
  'use strict';
  const S = C.state;
  const { M, say, render } = C;               // what the scripts before this one registered

  function saySelected() {
    if (S.selection) say(M.labelFor(S.model, S.selection.id));
    render();
    C.renderInspector();                      // registered by a script after this one
  }

  Object.assign(C, { saySelected });          // what other scripts use
})(window.SysMLCanvas);
```

The rules, which `build.mjs` checks as it stitches:

1. Take what the scripts before this one registered with one `const { … } = C;` at the top (`= lib;` in the library).
2. Reach what a script after this one registers as `C.name`, inside a function that runs once the page has loaded (an event handler, a renderer, anything `start()` leads to): when this script runs, the later one hasn't yet.
3. Register what other scripts use with `Object.assign(C, { name, … })`, names only. Each name is registered by one script.
4. Keep the state other scripts read or change on `S`. A `let` that only this script uses stays a `let` in it.

Order matters in two more ways. A feature's rows land in the library's tables in the order the features are listed, and that is the order the palette, the panel, the checks and the export follow. And a script may change what the scripts before it registered (wrap a kind's hooks, push onto a row's lists), never what comes after it. The styles are stitched in cascade order: the core's, each feature's, then `core/style-end.css`, the rules that must come after everything else.

## The kinds

Every element kind and relationship kind stands on a class of the SysML metamodel: `METAMODEL`, the lists `canvas/metamodel/generate.mjs` writes from the pilot implementation's `SysML.ecore` into `core/lib/metamodel.js`, the library's first script. A class there has its supertypes, what an element of it may contain (`owns`), and its fields; `canvas/metamodel/README.md` says what they hold and where they come from.

- Add a kind's row with `addKinds({ Name: row })` or `addRelationships({ Name: row })`, never into `KINDS` or `RELATIONSHIPS` directly. The kind stands on the class of its name, or on the one its row names as `metaclass` when the canvas splits a class into kinds of its own (a parameter is an `ItemUsage`; start, done and the initial node are `ActionUsage`s; a flow and a message are `FlowUsage`s). A name that is no class of the metamodel, or an abstract one, is refused as the library loads.
- What the class is, the kind is: `addKinds` sets `definition`, whether the class is a `Definition`, and `usage`, whether it is a `Usage`, and refuses a row that says either.
- The rest of a row is written by hand: the words (`keyword`, `label`), the drawing (`size`, `shape`, `onBorder`), and the rules (`contains`, `definedBy`, `fields`, `traits`, the hooks). The rules are the canvas's choices within what the metamodel allows, and `test/metamodel.test.mjs` checks them against it: each kind a row nests, its class may own, through one most specific feature (a part def nests parts through `Definition::ownedPart`); its `definedBy` conforms to what its class is typed by (`PartUsage::partDefinition : PartDefinition`); and each field it shows that holds an attribute, its class has. A new nesting or definition goes in that test's tables, `THROUGH` and `TYPED_BY`, with the feature it goes through.
- `METAMODEL` is frozen. To read the metamodel, read it; to change it, change the generator or move to another release, as `canvas/metamodel/README.md` says.

## Changing the model

Every change to the model goes through `C.edit(change, key)`, in `core/page/changes.js`. `change()` makes the change and returns what it did, in the words the Undo button and the log Claude reads will use; `edit` records the undo step with the ids of the elements, relationships and views the change touched, logs it, redraws the drawing, and schedules the save. The panel, the selection and the status line are the caller's to bring up to date afterwards.

- Read the model anywhere; write it only inside the function given to `edit`, or in what that function calls, such as a renderer's `place`, `drag` and `drop`, which only `edit` calls.
- A `key` joins a run of changes into one undo step: the keystrokes of one field, the moves of one drag. The run is logged once, in its last words, when it ends: at `endEdit()`, which the field's change event or the drag's drop calls, or when a change with another key comes. A run that ends where it started is no step.
- The model records its own changes. Every object and array in it is a `Proxy` of itself, whose traps note each write before it is made: the key and what it held, or an array's items. So `edit` learns what a change touched from its notes, without looking through the model; an undo step keeps those notes, not a copy of the model, and Undo puts back what they say. Reads go straight through, and what is read from the model is always its own `Proxy`, so `===` and `indexOf` work as on plain objects. An object a change makes and puts into the model becomes part of it there: to find it again, read it back from the model (a renderer's `place` returns `S.model.elements[…]`, not the object it made).
- A write made while no change is open is noted too, and reported as an error when the next change, or Undo, comes: it would be in no undo step and missing from what changes touched. The console and the tests see it.
- Outside `edit`, only `changes.js` replaces the whole model: Undo, and `loadModel` for a model from storage. Import state replaces it through `edit`, as one undo step.

## Lookups

The library's helpers (`childrenOf`, `typingOf`, `inheritedFeatures`, and the rest) find what they are asked about a model by looking through its lists, a pass over the whole model for each answer, which is right however the model changed since the last question. Asked once for each element, that is a pass for each element, so the checks and the export answer from lookups instead:

- `lookups(model)` (`SysMLModel.lookups`) holds maps of the model: the elements by id, what each element owns in model order, the elements and the lines of each kind, the lines that start or end at each element, and where each line stands in the list. Each is made on its first use, in one pass, from the model as it is then. A look reads the model's structure only (which elements, lines and views there are, in what order, and of each its id, kind, and owner or ends), never a name or another field, and it holds the model's own objects, changing nothing and keeping nothing on them. So it stays right while names, fields and places change, and is made again once the structure changes.
- `reading(model, fn, look)` (`SysMLModel.reading`) runs `fn` and returns what it returns. While it runs, every helper asked about that model object answers from `look` (a new `lookups(model)` when none is given), in a step or in as many as the answer is long, and what an answer needs beyond the structure (the names beside each owner, the features each type inherits) is worked out once for the reading, by `perReading`. The answers are the ones the helpers give outside a reading, in the same order, and a list is a new one each time. The model must not change while `fn` runs. A reading of the same model inside `fn` goes on in it; a reading of another model opens its own beside it. Outside a reading, the helpers look through the model as before.
- `validate` and `toSysML` do all their work in a reading of the model. The `ids` a check or a writer is given is then the look's own map: read it, never change it.

A new check, hook or writer asks the helpers for what it needs (`childrenOf`, `typingOf`, `linesFrom`, `linesTo`, `linesAt`, `elementsOfKind`, `inheritedFeature`, `nameTakenBeside`…) rather than looking through `model.elements` or `model.relationships` for each element. What no helper answers yet becomes one in `core/lib/model.js` that answers from the look during a reading (a map made from the structure only) or from `perReading` (what depends on names or fields), and looks through the model outside one. `test/lookups.test.mjs` checks that every helper and hook answers the same inside a reading as outside one.

## Drawing

`render()` (`core/page/render.js`) brings the drawing up to date after each change, from what `edit` says the change touched and what it wrote:

- A change that only moved things (it wrote places in views' layouts, or a view's `x` and `y`) lays out again just the views it touched, and their renderers may patch what they drew: the graph renderer draws again just the boxes, border items and lines that moved, in the groups already drawn. A change that showed or hid things in views lays out just those views again and draws them again. Any other change can have moved anything, so every view is laid out and drawn again.
- Each view draws only what the window shows, with a margin of half the window on each side (`S.region`), and the window leaving that region, or the zoom crossing 25%, draws it again (`applyCamera`). Below 25% a graph view draws its boxes as outlines (a shape's `radius` gives their corners), its border items as squares and its lines without their labels.
- A renderer's `draw(view, g, L, region)` gets the region, and keeps to it as far as it can (`onScreen`, `pointsOnScreen` in `drawing.js`); the frame itself is always drawn. A renderer may add `patch(view, g, before, L, region)`, which draws again only what moved and returns true, or returns false to have the view drawn again whole. A renderer whose drawing shows what the checks found carries `problems: true`.
- The pins and badges are drawn at screen size on top, for what is drawn; the marks (`is-selected`, `is-problem`) go on what is drawn, whenever it is drawn.
- The checks (`check()`) run once the changes pause, as the save does, at once when the model is a new one (the page starting, a model from elsewhere, Undo, an import), and at once when something needs them up to date (`checkNow()`: the export panel, the HUD's button). A test that reads the problems right after a change waits for them (`checked` in `test/helpers.mjs`).
- The drawing and the checks read the model inside the library's lookups (`reading` in `render.js`, see "Lookups" above), made once for the model as it is and kept until a change alters its structure: an element, line or view added, removed or replaced, an id, kind, owner or end changed, a list reordered (`howToDraw` in `changes.js` says which changes do). After any other change the drawing keeps the element index too.

## The panel's fields

Every field the panel shows, for an element, a line or a view, goes one way, so a new field, or a new panel of fields, is rows in tables rather than code of its own:

1. A row in `FIELDS` (in `core/lib/model.js`, or in the feature's `lib.js`) says what the value is: its type, its label in sentences, and how `normalize` reads it. A field that holds an attribute of the metamodel is made with `attributeField(attribute, row)`, which takes its type from the attribute: `name` holds `declaredName`, `abstract` `isAbstract`, `direction` `direction`, `parallel` `isParallel`.
2. The kind's row lists it: `KINDS[kind].fields`, `RELATIONSHIPS[kind].fields` or `VIEW_KINDS[kind].fields`. Then `normalize` keeps it, a new element, line or view gets its starting value, and the panel shows it for the kind.
3. Its markup, in `core/page.html`: a `<label id="l-<field>">` holding its input, `id="f-<field>"`, in `#fields`, or `l-v-<field>` and `v-<field>` in `#view-fields` for a view's. A `bool` is a checkbox, an `enum` or a `ref` a select (an enum's options are written in the markup), the rest a text input or a textarea.

The panel (`core/page/panel.js`) shows each field by its row's type, and its one pair of listeners, on `#fields` and on `#view-fields`, makes every change through `edit()`: typing in a string, text or number field is one undo step per field, logged once the field is left, and a checkbox or a select changes at once. No field has listeners of its own. What a row can't say goes in `FIELD_HOOKS` (`core/page/base.js` lists the hooks): the words of a change, a value that isn't the item's own property (the definition is the usage's typing, a relationship), whether the field shows, and what the page does once it changed. `test/fields.test.mjs` changes every field each kind lists through its input, and checks each change is one undo step, logged in its words, saved, and undone.

Two things in the panel aren't fields, and keep controls of their own: a view kind's options (`VIEW_PANELS`: a sequence view's row spacing, a geometry view's scale and unit, a grid view's mode and columns, a browser view's roots), each with its own rules, and the code links, a list of links that the annotations section edits.

## Names

Whether an element has a name in the text is decided in one place, `textName(el)` in `core/lib/model.js` (`M.textName` on the page). It returns the element's name, trimmed; `''` while it has none (an unnamed part, which the text may still write, as `part : Host;`); or `null` when the text has no name for it at all, whatever its name field holds. That is a start, done or initial node, whose kind has no name field: the page keeps a name such as `start1` in one for itself, and that name is never written, shown or compared with another.

- Read an element's name through `textName`, never as `el.name`, and never decide it by testing the element's kind or its kind's fields. The two exceptions store the name rather than read it: `normalize`, which keeps what a file carries, and the panel's Name box, which edits it.
- To ask it of a kind, ask it of an element of the kind with no name yet: `textName({ kind })` is `null` for a kind whose elements have no name in the text, `''` otherwise.
- A path in the text (`qualified`, `featurePath`) reaches an element with no name in the text by its kind's keyword, the word the text has for what it stands for: `first start then a1;`. A relationship's name is still read from the relationship.

## The saved format

A model names the version of the format it was saved in: `format: 'grasp/2'` is version 2. Files saved before the canvas was named Grasp name it `'stronghold-canvas/1'` or `'stronghold-canvas/2'`, and `versionOf` reads both names, so they keep opening; a new version is written under Grasp's name only. `VERSION` in `core/lib/model.js` is the version the library reads and writes, and `UPGRADES` beside `normalize` holds one function per older version, which takes a model saved in that version to the next. `normalize` runs them first (`upgrade`), so everything after it reads the current version only, and whatever an older version did differently is written once, in its upgrade. `SysMLModel` has `VERSION`, `versionOf(model)` and `upgrade(model)` for the scripts and the tests.

To change what a saved model holds, or how it holds it:

1. Add 1 to `VERSION`.
2. Add the upgrade from the version before it to `UPGRADES`. It takes any JSON that names that version, since a file may have been written by hand, returns a new model that names the next version and says the same thing, and changes nothing in the model it was given.
3. Keep the fixtures in `canvas/test/fixtures/` as they were saved, and add one saved in the new version, with its export pinned beside it: `node canvas/export.mjs canvas/test/fixtures/X.json > canvas/test/fixtures/X.sysml`. `test/format.test.mjs` checks that there is a fixture of every version and that each, upgraded, still exports its pinned text.

A change under which older models still read right as they are needs no new version: a new kind, say, or a new field whose default is what older models meant, since `normalize` gives a field that a model doesn't carry its default.

## The store

On the published page the model is kept in the page's store in layout 2, which `core/lib/stored.js` defines and `canvas/README.md` describes for Claude: a head, `model/current`, and parts, `model/current/parts/<id>`, each a run of the model's records within the store's limits (a document of at most 256 KiB and 32 levels deep), named by a hash of what it holds. The library makes the documents (`splitModel`, `storeHead`) and reads them back (`assembleModel`, and `readStore` for a dump of the store's documents), so the page, `export.mjs` and `save-state.mjs` read the store the one way; `core/page/store.js` writes them, the parts before the head and old parts only once the new head is in, and listens for them.

- What a model holds is the saved format's (above), not the store's: the records are the model's elements, lines, views and places, whatever they hold, so a new field needs nothing here.
- To change the layout itself, add 1 to `STORE.layout`, and have the page read the layout before it the way it reads `model/working`, a whole model handed over: take the model, save it in the new layout, and delete what held it. A page that finds a head in a newer layout than its own turns read-only rather than write over it.
- A save sends nothing the store would refuse for its size: a record that can't fit in a part is named in the status, with the field to shorten, and the model saves once it fits. When the store refuses a write, `refused()` says why by the store's code, and the page turns read-only only when the store says this viewer may not write.
