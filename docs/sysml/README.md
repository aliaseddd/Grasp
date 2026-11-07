# SysML model

`stronghold-proof.sysml` is the proof's structure in SysML v2 textual notation: the page, the app, the three hosts, and the contract between them. `stronghold-proof.svg` draws the model's one view, `proofStructure`, a general view in SysML v2's graphical notation.

The code the model describes is in the Stronghold repository (`aliaseddd/Stronghold`) since November 7, 2026, so the paths on this page and in the model (`app/src/host/load-app.ts`, `hosts/server`) name files there.

![The proofStructure view: a page holds the hosts and one app, connected by the mount interface; three hosts specialize Host; the contract sits in HostFiles](stronghold-proof.svg)

## What it says

- A `Page` holds one or more host web parts and exactly one app: every web part on a page mounts the same app, because the first entry file to load wins (`app/src/host/load-app.ts`). The `1..*` and `1` on the `mount` interface say that. The page isn't a folder here; it is where the hosts and the app meet at run time.
- A host reaches the app through a `StrongholdApp` port. The app has the port, and each host has its conjugate (`~StrongholdApp`), so what one side sends the other receives: the host sends the container and `HostServices`, the app sends back the `AppHandle` and its version. In the code, the port is `window.Stronghold`.
- `ServerHost`, `OnlineHost`, and `DevHost` specialize `Host`, so each one has the same loader and the same port. They differ in their toolchain and in what they ship.
- `HostFiles` is `app/src/host`, the only code every host's toolchain compiles.

## Reading the notation

- Square corners are definitions (`part def`, `port def`, `attribute def`, `item def`). Rounded corners are usages: a part inside the thing that owns it.
- A box inside a box belongs to it.
- A small square on an edge is a port. `~` before its type means the conjugate: the same features with `in` and `out` swapped.
- A hollow triangle means "specializes": each host specializes the `Host` its line's triangle touches. With two dots behind the triangle, it means "defined by": the part `hosts` is defined by `Host`.
- Compartments are named in italics. `:>>` redefines an inherited feature, so `:>> ships[0]` says the dev host ships nothing.

## Notes on the drawing

`stronghold-proof.html` is the same drawing on an endless plane you can move around and annotate. Drag the background to move around, scroll to pan, and pinch or hold Ctrl or ⌘ while scrolling to zoom; Fit brings the whole drawing back. Click to add a note. The note belongs to the element under the pointer (a box, a port, a line, or the view itself), and you can drag its pin onto another element or out onto the plane. A note's number in the list takes you to its pin. Copy as Markdown lists the notes with each element's qualified name, ready for an issue or a chat.

Each note keeps the number it was given. When Claude has acted on a note, it moves the note to the archive, listed under the notes, with a line on what changed.

Where the notes are kept:

- **On the published page** (claude.ai), in the page's database. Notes save as you type, everyone who can open the page sees them, and Claude reads them there.
- **In git**, inside `stronghold-proof.html` between `<!-- notes:start -->` and `<!-- notes:end -->`: the notes and the archive as they were last saved. `node docs/sysml/save-notes.mjs notes.json` writes them there.
- **Opened as a file** in a browser, the page needs no server. It shows the notes saved in it and keeps the ones you add in that browser. Download notes saves them to a file, which Import notes, or `save-notes.mjs`, takes back.

## The canvas

Since November 6, 2026, the same model can be drawn and changed on the design canvas in `canvas/`, which replaces the hand-laid-out page below for the loop: boxes are placed and lines drawn there rather than in `draw.mjs`, and the drawing exports the textual model instead of being copied from it. This folder keeps the full model, which has attributes and the package `HostFiles` that the canvas can't draw yet, and the page below as it was.

## Working on it with Claude

The design is worked on in a loop, and git is its memory between conversations.

1. **Load.** Claude reads this folder and publishes `stronghold-proof.html` to its page, https://claude.ai/artifact/8fV31WD4frJN56rVcprRHH. The page is private until it's shared from its Share menu. If the notes on the page differ from the ones saved in the file, Claude says how before changing either.
2. **Annotate.** You pin notes to the drawing.
3. **Change.** Claude reads the notes and makes the changes you decide on, in `stronghold-proof.sysml` and in the layout in `draw.mjs`, checks the model with `docs/sysml/check.sh`, then runs `node docs/sysml/draw.mjs` and republishes the page. Each note it acts on moves to the archive with a line on what changed.
4. **Save.** Claude writes the notes and the archive into the HTML with `save-notes.mjs`, and commits the model, the drawing, and the notes together.

How Claude reaches the notes: the page's database has two collections, `notes` and `archive`, with one document per note named by the note's `id`. A note has `no`, `el` (the qualified name of the element it's on), `label`, `x` and `y` (where its pin sits, in drawing units), `text`, `created`, and `updated`. An archived note also has `resolution` and `archived`. Archiving a note is one batch: delete `notes/<id>`, and set `archive/<id>` to the note with those two fields added. Saving reads both collections into a file shaped `{ "notes": [...], "archive": [...] }` and runs `save-notes.mjs` on it. A page published somewhere new starts with no notes, so Claude loads the saved ones into it the same way, one batch of sets.

## How it was checked

By the SysML v2 Pilot Implementation's own parser and validator. On November 6, 2026, `check.sh` ran the model through the command-line REPL inside the Jupyter kernel of the [SysML v2 release](https://github.com/Systems-Modeling/SysML-v2-Release), tag `2026-09.1` (`jupyter-sysml-kernel` 0.63.1), and it parsed and validated with no errors. Before that, it had been checked by reading, against the release's textual grammar (`bnf/SysML-textual-bnf.kebnf`) and its training examples, construct by construct.

```sh
docs/sysml/check.sh                       # every .sysml file in this folder
docs/sysml/check.sh path/to/model.sysml   # the files given
```

It prints `ok` or `FAIL` for each file, with the kernel's errors under a failure, and exits 1 if any file fails. Each file is checked in a fresh process. The script needs Java 17 or later and python3. Its first run downloads the kernel from conda-forge (about 120 MB), checks the download's SHA-256, and unpacks it into `~/.cache/sysml-kernel-0.63.1`; no Jupyter or conda is needed. A check takes about 8 seconds after that.

The drawing follows the release's graphical notation (`bnf/SysML-graphical-bnf.html`). It is laid out by hand in `draw.mjs`, not generated from the model, so a change to the model needs the same change there. Every `doc` line in the drawing is copied word for word from the model. `node docs/sysml/draw.mjs` writes `stronghold-proof.svg` and the drawing inside `stronghold-proof.html`, so the two stay the same.

To have the kernel draw the model as well, install the release's Jupyter kernel (`install/jupyter`), paste the file into a cell, run it, and run `%viz StrongholdProof`.

## The pilot implementation

[`pilot-implementation/`](pilot-implementation) maps the code of the SysML v2 Pilot Implementation, which the release's Jupyter kernel is built from: aider's repo maps of it, and how its projects fit together, from the grammars to the kernel.
