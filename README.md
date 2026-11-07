# Grasp

Grasp is a design canvas: a SysML v2 modeling tool that runs in a web browser, with nothing to install. You draw a model in the eight standard view kinds on one endless plane, the page checks the model as you draw, and it exports textual SysML v2 that the SysML v2 Pilot Implementation's own validator accepts. You pin notes to the drawing, and Claude reads them and changes the model, in a loop. Its layout and behavior follow the design of Eclipse SysON, a SysML v2 modeling tool, as far as possible.

The canvas was first built here to draw the design of [Stronghold](https://github.com/aliaseddd/Stronghold), beside that project's first code. On November 7, 2026, this repository was split: the Stronghold proof's code (`app/`, `hosts/`) and its README moved to the Stronghold repository, where the README is now `docs/PROOF.md`, and the canvas and the SysML files stayed here as a project of their own. Stronghold's models stay here as examples. Stronghold's code, design and decisions are in the Stronghold repository.

## What's here

| Folder | What it is | Built with |
|---|---|---|
| `canvas/` | The design canvas: SysML v2 models drawn in the eight standard view kinds on one endless plane, with undo, checks while drawing, notes pinned to elements or left free on the plane, an archive, code attached to elements, and an export to textual SysML v2, worked on with Claude in a loop. Published as one HTML file, built from the sources in `canvas/src/`. | SVG, no libraries; Node for the scripts, Playwright for the tests |
| `canvas/examples/` | Models to open in the canvas: Stronghold's proof structure, the model the canvas started with. | The canvas: state files, which its Import state opens |
| `docs/sysml/` | The validator script `check.sh` the canvas exports through, aider's maps of the SysML v2 Pilot Implementation (`docs/sysml/pilot-implementation`) and of Eclipse SysON (`docs/sysml/syson`), an inventory of SysON's features (`docs/sysml/syson/features`), and an example: Stronghold's proof structure in textual SysML v2, with the page it was drawn and annotated on before the canvas existed. | Java 17+ and python3 for `check.sh` |
| `docs/REPO_MAP.md` | The repo map aider draws of this repository. | aider |
| `plan/` | The plan the canvas is built to, step by step (`status.json`), and the notes each working session leaves for the next (`notes.md`). | JSON and Markdown |

The READMEs in `canvas/`, its folders, and `docs/sysml/` say why each is the way it is. The Stronghold examples describe Stronghold's code, so paths in them like `app/src/host/load-app.ts` name files in the Stronghold repository.

## Run it

```sh
# Build the page, canvas/index.html, from its sources in canvas/src/ and the saved state in canvas/state.json
node canvas/build.mjs

# Export the canvas's saved model as textual SysML v2, and check it with the pilot implementation's validator
node canvas/export.mjs
canvas/check.sh

# The same check for an example
canvas/check.sh canvas/examples/stronghold-proof.json

# The canvas's Chromium tests (Playwright once per machine)
npm install --no-save playwright@1.63.0 && npx playwright install chromium
node --test --test-timeout=120000 canvas/test/*.test.mjs
```

`canvas/README.md` has the rest: the loop with Claude, the state files, and how the model is written out.

## Decided on November 6, 2026

From the developer log entry on the design artifact:

- Architecture is worked on as SysML v2 models with the code of each modeled component linked to it, and that model with its code is the design artifact to standardize. The tool for it is a web page, because the workplace machines allow nothing installed.
- The tool is built in slices, in this repository, under `canvas/`. The first slice proves the loop: an endless plane, one view kind (GeneralView), notes on elements and lines, export to textual SysML v2, and Claude reading the notes and changing the model.
- The artifact is one HTML file with its script inline, hand-written SVG, no libraries. Published on claude.ai, it keeps the working model and the notes in the page's own store, which Claude reads; the file in git is the saved state, written back by `canvas/save-state.mjs` and committed only on request. (Since November 7, the file is built from several, and the saved state is `canvas/state.json`: see below.)
- Anything from the SysML v2 Pilot Implementation that needs Java runs on Claude's side, in its own environment, during its turn: the validator through `canvas/check.sh`, never in the browser.
- What the pilot implementation gives this tool, out of its repository and the aider maps in `docs/sysml/pilot-implementation`: the graphical notation grammar for the drawing, the textual grammar and the validator for the export, the comment and `doc` syntax for notes, the standard view definitions for the view kinds, and the example models as reference. Nothing in it runs in a browser.
- Deferred at first to later slices, and built the same day as the second slice: the other seven view kinds, code attached to elements, free-floating notes, the archive, and checks while drawing, with an Undo button (`canvas/README.md`).

These decisions were made for Stronghold's design artifact, so the Stronghold repository records them too, in `docs/PROOF.md`.

## Decided on November 7, 2026

- The canvas is a tool of its own, for anyone's SysML v2 models, and it will outlive the Stronghold work it started with. It starts from a blank model, as SysON's empty SysML v2 project does: the package `Package1`, holding one general view, `view1`. Stronghold's models are examples, in `canvas/examples/` and `docs/sysml/`.
- The tool and this repository are named Grasp; the repository was named Playground. The page's title says Grasp, and the saved format is named after it, `grasp/2`. Files saved under the format's earlier name, `stronghold-canvas/1` or `stronghold-canvas/2`, still open, and always will.
- The page is published as one file built from several. The sources are in `canvas/src/`, one folder per feature, as plain scripts that need no bundler; `canvas/build.mjs` stitches them, in a fixed order, with the saved state into `canvas/index.html`. That is still the one self-contained HTML file, published on claude.ai and opened as a local file. Change the sources and build, rather than editing `index.html`; `node canvas/build.mjs --check` fails when it isn't what the sources build.
- The saved state lives in `canvas/state.json`: the model, the notes and the archive, as `{ model, notes, archive }`. `canvas/save-state.mjs` writes it and builds the page from it, and it is committed only on request.

## Next

The steps `plan/status.json` has left, the last of them SysON's features, one at a time. The canvas's page on claude.ai, https://claude.ai/artifact/V7Fw94cGMbtPnwmyDNmnjU, shows the model it was last published with until it is published again; then it starts from the blank model, and the Stronghold example opens in it with Import state.
