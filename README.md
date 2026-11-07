# Playground

The design canvas and the SysML v2 work behind it. They started here beside the first code for [Stronghold](https://github.com/aliaseddd/Stronghold), the proof. On November 7, 2026, this repository was split: the proof's code (`app/`, `hosts/`) and its README moved to the Stronghold repository, where the README is now `docs/PROOF.md`. The canvas and the SysML files stayed here as a project of their own, even where they describe Stronghold. Stronghold's code, design and decisions are all in the Stronghold repository.

## What's here

| Folder | What it is | Built with |
|---|---|---|
| `canvas/` | The design canvas: SysML v2 models drawn in the eight standard view kinds on one endless plane, with undo, checks while drawing, notes pinned to elements or left free on the plane, an archive, code attached to elements, and an export to textual SysML v2, worked on with Claude in a loop. One HTML file. | SVG, no libraries; Node for the scripts, Playwright for the tests |
| `docs/sysml/` | A SysML v2 model of the proof's structure and its drawing, the validator script `check.sh` the canvas exports through, aider's maps of the SysML v2 Pilot Implementation (`docs/sysml/pilot-implementation`) and of Eclipse SysON (`docs/sysml/syson`), and an inventory of SysON's features (`docs/sysml/syson/features`). | Java 17+ and python3 for `check.sh` |
| `docs/REPO_MAP.md` | The repo map aider draws of this repository. | aider |

Each folder has a README that says why it is the way it is. The model and the canvas's saved model describe Stronghold's code, so paths in them like `app/src/host/load-app.ts` name files in the Stronghold repository.

## Run it

```sh
# Export the canvas's saved model as textual SysML v2, and check it with the pilot implementation's validator
node canvas/export.mjs
canvas/check.sh

# The canvas's Chromium tests (Playwright once per machine)
npm install --no-save playwright@1.63.0 && npx playwright install chromium
node --test --test-timeout=120000 canvas/test/*.test.mjs
```

`canvas/README.md` has the rest: the loop with Claude, the state files, and how the model is written out.

## Decided on November 6, 2026

From the developer log entry on the design artifact:

- Architecture is worked on as SysML v2 models with the code of each modeled component linked to it, and that model with its code is the design artifact to standardize. The tool for it is a web page, because the workplace machines allow nothing installed.
- The tool is built in slices, in this repository, under `canvas/`. The first slice proves the loop: an endless plane, one view kind (GeneralView), notes on elements and lines, export to textual SysML v2, and Claude reading the notes and changing the model.
- The artifact is one HTML file with its script inline, hand-written SVG, no libraries. Published on claude.ai, it keeps the working model and the notes in the page's own store, which Claude reads; the file in git is the saved state, written back by `canvas/save-state.mjs` and committed only on request.
- Anything from the SysML v2 Pilot Implementation that needs Java runs on Claude's side, in its own environment, during its turn: the validator through `canvas/check.sh`, never in the browser.
- What the pilot implementation gives this tool, out of its repository and the aider maps in `docs/sysml/pilot-implementation`: the graphical notation grammar for the drawing, the textual grammar and the validator for the export, the comment and `doc` syntax for notes, the standard view definitions for the view kinds, and the example models as reference. Nothing in it runs in a browser.
- Deferred at first to later slices, and built the same day as the second slice: the other seven view kinds, code attached to elements, free-floating notes, the archive, and checks while drawing, with an Undo button (`canvas/README.md`).

These decisions are recorded here and in the Stronghold repository's `docs/PROOF.md`. They belong in its `DECISIONS.md` as well.

## Next

The canvas's first loop: draw in the views on https://claude.ai/artifact/V7Fw94cGMbtPnwmyDNmnjU (republished with the second slice on November 7), pin notes, and ask Claude to review.
