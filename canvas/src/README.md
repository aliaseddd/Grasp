# The canvas's sources

`canvas/build.mjs` stitches the files in this folder into `canvas/index.html`, the one self-contained page that is published on claude.ai and opened as a file. Don't edit `index.html` by hand: change the files here, or `canvas/state.json` (the saved model, notes and archive), and run `node canvas/build.mjs`. `node canvas/build.mjs --check` fails when `index.html` isn't what the sources build, and the tests run it, so commit the built page with its sources.

## Folders

One folder per feature, and `core` for what every feature builds on:

| Folder | What it holds |
|---|---|
| `core/` | The page's shell (`page.html`: the head, the markup, and one line per block the build fills in), the core styles, the model library's tables, helpers, checks and export, and the page's state, layout, drawing, camera, undo, tools, views, panel, notes, store and pointer handling. |
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

- The model library's scripts share `SysMLModelLib`, `lib` in each script. The first creates it; the last builds `SysMLModel` from it the way it always has, freezes it, and removes `SysMLModelLib`, so the page, `export.mjs` and `save-state.mjs` see only `SysMLModel`.
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

## Changing the model

Every change to the model goes through `C.edit(change, key)`, in `core/page/changes.js`. `change()` makes the change and returns what it did, in the words the Undo button and the log Claude reads will use; `edit` records the undo step with the ids of the elements, relationships and views the change touched, logs it, redraws the drawing, and schedules the save. The panel, the selection and the status line are the caller's to bring up to date afterwards.

- Read the model anywhere; write it only inside the function given to `edit`, or in what that function calls, such as a renderer's `place`, `drag` and `drop`, which only `edit` calls.
- A `key` joins a run of changes into one undo step: the keystrokes of one field, the moves of one drag. The run is logged once, in its last words, when it ends: at `endEdit()`, which the field's change event or the drag's drop calls, or when a change with another key comes. A run that ends where it started is no step.
- Each change, and Undo, first checks that the model is as the last change left it. A change made anywhere else would be in no undo step and missing from what changes touched, so it is thrown as an error, which the console and the tests see.
- Outside `edit`, only `changes.js` replaces the whole model: Undo, and `loadModel` for a model from storage. Import state replaces it through `edit`, as one undo step.
