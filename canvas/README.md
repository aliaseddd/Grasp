# The design canvas

`index.html` is a SysML v2 model drawn as one general view on an endless plane, in one HTML file with its script inline. You draw part definitions, port definitions, parts, and ports, and the lines between them; you pin notes to any box, port, or line; and the drawing exports as textual SysML v2 that the SysML v2 Pilot Implementation's own validator accepts. Claude reads your notes and changes the model on its side of the loop. This is the first slice of the design artifact described in the Stronghold developer log: enough to prove the loop, not the whole tool.

![The canvas showing the Stronghold proof as a general view](canvas.png)

## What it does

- **An endless plane.** Drag the plane to move around, scroll to pan, pinch or hold Ctrl or ⌘ while scrolling to zoom. Fit brings the whole drawing back. The frame around the drawing is the view: `«view» proofStructure : GeneralView`, and it grows with the drawing.
- **One view kind, the standard GeneralView.** The palette adds `part def`, `port def`, `part`, and `port`, and draws three lines: *specializes* (a hollow triangle at the general end), *defined by* (the same triangle with two dots, from a part to its part def or a port to its port def), and *connection* (between two ports or two parts). Click a tool, then click where the thing goes, or the two ends of the line. A part dropped inside a part def or a part belongs to it; a port sits on the border of whatever you click. Drag a box to move it, with everything inside; drag a port along its border.
- **The selection panel.** Click a box, a port, or a line to see and change its name, whether it is abstract, what it is defined by (shown as `name : Type` on the box, and as a line too if you tick the box), its multiplicity, whether a port is conjugated, and its doc. Delete removes it with everything inside it and every line touching it.
- **Notes on elements and lines.** Select something and Add note. The note is listed in the panel and pinned on the drawing with its number; the number takes you there. A note Claude has answered shows the answer under it, and a resolved one is drawn dashed. Free-floating notes and the archive are not in this slice.
- **Export SysML.** The model as textual SysML v2, with each note as a `comment` about its element. Problems that keep the text from being correct SysML are listed above it. Copy puts it on the clipboard.

Not in this slice: the other seven standard view kinds, code attached to elements, free-floating notes, the archive, checks while you draw, and attributes, items, actions, and the rest of the language. The export covers exactly what the palette can draw.

## How the loop works

The design is worked on in a loop, and git is its memory between conversations.

1. **Load.** Claude publishes `index.html` to its page on claude.ai, https://claude.ai/artifact/V7Fw94cGMbtPnwmyDNmnjU. The page is private until it is shared from its Share menu. It starts from the model and the notes saved in the file.
2. **Draw and annotate.** You change the drawing and pin notes. On the published page, every change saves as you work, into the page's own store, where Claude reads it.
3. **Review and respond.** You ask Claude to look. Claude reads the working model and the notes from the store, exports the model with `export.mjs`, checks it with `check.sh`, makes the changes the notes ask for, answers each note, and republishes the page. The page picks up the new model.
4. **Save.** When you say so, Claude writes the model and the notes into `index.html` with `save-state.mjs` and commits. Nothing reaches GitHub until then.

Where the model and the notes are kept:

- **On the published page**, in the page's store: one document, `model/working`, holds the working model as `{ baseRevision, model, changes, updated }`, where `baseRevision` is the `revision` of the model saved in the file the page was published from and `changes` is a list of `{ at, text }` saying what was done, newest last. A collection `notes` holds one document per note, named by the note's id, with `no`, `target` (the id of the element or line it is on), `targetLabel`, `text`, `by` (`user` or `claude`), `created`, `updated`, `response`, and `resolved`. The page ignores a working model whose `baseRevision` is not the file's, so a republished file starts clean.
- **In git**, inside `index.html`: the model between `<!-- model:start -->` and `<!-- model:end -->`, the notes between `<!-- notes:start -->` and `<!-- notes:end -->`.
- **Opened as a file** in a browser, the page needs no server. It starts from what is saved in it and keeps your changes in that browser. Download state saves them as `canvas-state.json`, which Import state, or `save-state.mjs`, takes back.

How Claude responds to a note: it sets `response`, and `resolved` once the note is dealt with, on the note's document. How Claude changes the model: it edits the model JSON, checks the export, and republishes the page with the new model saved in it, or writes the new model into `model/working` for the page to pick up live.

## The scripts

```sh
node canvas/export.mjs                     # the model saved in index.html, as textual SysML v2
node canvas/export.mjs canvas-state.json   # a state file, the same way
canvas/check.sh [canvas-state.json]        # export, then check with the pilot implementation's validator
node canvas/save-state.mjs canvas-state.json   # write a state into index.html, with a new revision
node --test canvas/test/                   # the Chromium tests
```

`export.mjs` runs the page's own model script (`<script id="model-lib">` in `index.html`) in Node, so the text it prints is the text the Export button shows. `check.sh` hands that text to `docs/sysml/check.sh`, which runs the validator inside the pilot implementation's Jupyter kernel; its first run downloads the kernel. The tests need Playwright and Chromium the way `hosts/dev` does.

## How the model is written out

Each box is a definition or usage with its doc; a part or port inside a box is declared in its body, and one with the same name as a feature it inherits is written as a redefinition (`port :>> api`), which is what the validator expects. A connection is declared in the innermost box that holds both its ends, with paths like `hosts.api`. A note is `comment <n3> about StrongholdProof::Host /* ... */`; a note on a named connection is about the connection, and a note on a specializes or defined-by line, which have no names in the textual notation, is about the line's source element with the line named in the text. Names that are not plain identifiers, or that are keywords, are quoted. The view is declared last: `view proofStructure : StandardViewDefinitions::GeneralView { expose StrongholdProof::*::**; }`.

The model saved here is the Stronghold proof's structure from `docs/sysml/stronghold-proof.sysml`, restricted to what the palette can draw: the page, the app, the host and its three specializations, their ports, and the connection `mount`. The attributes, the package `HostFiles`, and the end multiplicities on `mount` are left out.

## What was checked

On November 6, 2026, in a Linux container:

- The saved model's export parses and validates with the pilot implementation's kernel (`jupyter-sysml-kernel` 0.63.1, the release `2026-09.1`) with no errors and no warnings: `canvas/check.sh`.
- The textual forms the exporter uses were each run through the same validator first, including the forms it avoids: a feature declared again under an inherited name warns unless it redefines; a specialization or a feature typing cannot be named, so a comment cannot be about one; a comment body cannot contain `*/`.
- In Chromium, through `canvas/test/`, 17 tests: panning and zooming, placing each kind, drawing each line, renaming, deleting, notes and their pins, the export, the shared store (with a stand-in for the page's store, `test/fake-claude.mjs`) in both directions, including a response and a changed model written from Claude's side reaching the open page, and a working model from another revision being left alone.
- By hand in Chromium: dragging a part out of its owner and back in, dragging a port to another side, the Delete key, the dark theme, and the phone width, where the page never scrolls sideways.

Not done: opening the published page on a phone, and a second person on the same page at the same time.
