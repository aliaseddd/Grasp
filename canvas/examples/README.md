# Examples

Models to look at or start from. Each is a state file, `{ model, notes, archive }`, the shape the page's Download state
saves, so the canvas and its scripts open it like any other:

- On the page, Import state opens one. On the published page it replaces the shared model and deletes its notes, so the
  page asks first.
- `node canvas/export.mjs canvas/examples/<name>.json` prints its textual SysML v2, and
  `canvas/check.sh canvas/examples/<name>.json` checks that text with the pilot implementation's validator.

## stronghold-proof.json

The structure of the Stronghold proof: the part def `Page`, which holds one or more `hosts` and one `app`, connected
through their `api` ports by `mount`; the part defs `App` and `Host`, which is abstract, with the three that specialize
it, `ServerHost`, `OnlineHost` and `DevHost`; and the port def `StrongholdApp`, which types every `api` port. One general
view, `proofStructure`, shows it all. It is drawn from the full model in `docs/sysml/stronghold-proof.sysml`, without
the attributes, the package `HostFiles`, and the end multiplicities on `mount`, which the canvas couldn't draw when it
was made.

The canvas was first built to draw Stronghold's design, and this was its saved model until November 7, 2026. It is kept
here as it was then, revision included. The code it describes is in the Stronghold repository (`aliaseddd/Stronghold`),
so the paths in its docs, like `app/src/host/load-app.ts`, name files there.

The tests open the canvas holding this example, the model they were written against (`canvas/test/helpers.mjs`), so a
change to it changes what they test: run them after one.
