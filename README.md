# Stronghold · the proof

The first code for [Stronghold](https://github.com/aliaseddd/Stronghold): one web page that says "Hello world!", built the way `ARCHITECTURE.md` plans the whole app. The plan calls this the proof (`ARCHITECTURE.md`, The proof): a small app, built with current tools, loaded by a thin SharePoint Framework (SPFx) host from the host's own package. This repository is where the experiment lives; the decisions and the design stay in the Stronghold repository.

![The dev host showing Hello world! inside the web part zone](docs/dev-host.png)

## What's here

| Folder | What it is | Built with |
|---|---|---|
| `app/` | Stronghold itself: the shell, the hello module, the `HostServices` contract, and the loader every host uses. | webpack 5, TypeScript 5.9, Node 22+ |
| `hosts/server/` | The web part for SharePoint Server. | SPFx 1.4.1, TypeScript 2.4, Node 8 |
| `hosts/online/` | The web part for SharePoint Online, which is also the Teams tab. | SPFx 1.24.1, Heft, Node 22.14+ |
| `hosts/dev/` | A plain page that mounts the app the way the SharePoint hosts do, and the Chromium test. Never ships. | tsc, Playwright |
| `docs/` | The screenshot above, the Teams icon source, the repo map aider drew, a SysML v2 model of the proof's structure, and aider's map of the SysML v2 Pilot Implementation (`docs/sysml/pilot-implementation`). | |
| `canvas/` | The design canvas: a SysML v2 model drawn as a general view on an endless plane, with notes and an export to textual SysML v2, worked on with Claude in a loop. One HTML file. | SVG, no libraries; Node for the scripts |

Each folder has a README that says why it is the way it is.

## How it fits together

1. `app/` builds a handful of flat files, each named with a hash of its contents: the entry file, one file per module, and the font files. A small JSON says which file is the entry.
2. A host's build reads that name into its own code (`hosts/*/scripts/prepare-shared.js`) and copies the files into its SharePoint package, next to the host's bundle (`hosts/*/scripts/copy-app.js`).
3. On a page, the host's web part asks SharePoint where its files were served from, adds one `<script>` for the entry file there, and waits for `window.Stronghold` (`app/src/host/load-app.ts`). It has no settings: it only ever loads the app from its own package.
4. It calls `Stronghold.mount(container, services)`. The app draws inside a shadow root with the design's tokens and font, loads the hello module's file, and the module says hello.

No inline script, no `eval`, no Microsoft Graph, nothing fetched from the internet at run time.

## Build it

```sh
# 1. The app (Node 22 or later)
cd app && npm install && npm test && npm run build && cd ..

# 2. Try it in Chromium (the browser download is a one-time step per machine)
cd hosts/dev && npm install && npx playwright install chromium && npm test && cd ../..

# 3. The Server package (Node 8.17.0, or Docker)
hosts/server/build.sh            # → hosts/server/sharepoint/solution/stronghold-server.sppkg

# 4. The Online package (Node 22.14+, 24, or 26, or Docker)
cd hosts/online && npm ci && npm run build   # → sharepoint/solution/stronghold-online.sppkg
```

## What was checked, and what wasn't

Done here on November 2, 2026, in a Linux container:

| Check | Result |
|---|---|
| The app type-checks, and its two shared host files compile with TypeScript 2.4.2 | Yes (`app: npm test`) |
| The app builds: an entry file under 15 KiB, a hello module under 400 bytes, three font files | Yes |
| In Chromium: "Hello world!" inside a shadow root, the module file fetched on its own after the entry, the page's hostile CSS kept out, Inter loaded from the app's files, one script tag per page, clean unmount and remount, and the loader's failure paths (a missing file, a file that registers nothing, two callers at once) | Yes, nine tests (`hosts/dev: npm test`) |
| The Server package builds with the real SPFx 1.4.1 toolchain on Node 8.17.0, with no lint warnings, and the `.sppkg` holds the app's files in `ClientSideAssets` next to the web part bundle | Yes |
| The Online package builds with SPFx 1.24.1 on Node 22, and the `.sppkg` holds the app's files and the Teams icons | Yes |

And on November 6, 2026, for the design canvas (`canvas/README.md` has the detail):

| Check | Result |
|---|---|
| The canvas's saved model, and a state with every kind of note, export as textual SysML v2 that the SysML v2 Pilot Implementation's validator accepts with no errors and no warnings | Yes (`canvas/check.sh`) |
| In Chromium: moving around, placing each kind, drawing each line, renaming, deleting, notes and pins, the export, and the shared store in both directions | Yes, 17 tests (`node --test canvas/test/`) |
| A review of the page's code, export, and design, with each finding reproduced before it was fixed | Done for the findings reproduced before the review was stopped; the rest are listed in `canvas/README.md` |

Not done here:

- Installing either package and opening the page in Chrome, and Teams. That needs someone with access to the farm and the tenant. The READMEs in `hosts/server` and `hosts/online` list exactly what to look at.
- Running either `build.sh` under Docker: this container has no Docker daemon. The Server package was built with Node 8.17.0 installed directly, which is what the script does inside the `node:8.17.0` image. Proof step 5 is that script on a machine with Docker.
- Proof step 4, the signed-in person and the REST API. `HostServices` is empty until then.

## What this code takes from the plan

**Decided** (`DECISIONS.md`): one app with small hosts; the hosts are the only SPFx code; SharePoint data through the REST API; built for Chrome; the first code is the proof on SharePoint Server.

**Decided on November 5, 2026**, from what this proof built:

- Three hosts to design for: a Server host on SPFx 1.4.1, an Online host on current SPFx, and a Teams tab, probably through the Online host. Until then, the Online web part is also the Teams tab. A dev host never ships.
- One package per SPFx host. The hosts stay thin, and both carry the same app files. This changes the October 31 "one package" decision.
- The folder layout: `app/`, `hosts/server/`, `hosts/online/`, `hosts/dev/`.
- `HostServices` and the loader as the only code every toolchain compiles, written for TypeScript 2.4.
- Loading the app with a `<script>` element from the package's own files; drawing in a shadow root; fonts declared on the page.
- webpack 5 as the bundler (`app/README.md` says why, and when Vite would come back).
- The shell's module registry, with one `import()` per module (`app/src/shell/registry.ts`).
- The design's tokens as CSS variables on `:host`, and the fonts bundled in the package.
- Tests in Chromium through the dev host, with Node's test runner and Playwright (`hosts/dev/test`). A unit test runner is picked when the first screen has logic to test.

**Decided on November 6, 2026**, from the developer log entry on the design artifact:

- Architecture is worked on as SysML v2 models with the code of each modeled component linked to it, and that model with its code is the design artifact to standardize. The tool for it is a web page, because the workplace machines allow nothing installed.
- The tool is built in slices, in this repository, under `canvas/`. The first slice proves the loop: an endless plane, one view kind (GeneralView), notes on elements and lines, export to textual SysML v2, and Claude reading the notes and changing the model.
- The artifact is one HTML file with its script inline, hand-written SVG, no libraries. Published on claude.ai, it keeps the working model and the notes in the page's own store, which Claude reads; the file in git is the saved state, written back by `canvas/save-state.mjs` and committed only on request.
- Anything from the SysML v2 Pilot Implementation that needs Java runs on Claude's side, in its own environment, during its turn: the validator through `canvas/check.sh`, never in the browser.
- What the pilot implementation gives this tool, out of its repository and the aider maps in `docs/sysml/pilot-implementation`: the graphical notation grammar for the drawing, the textual grammar and the validator for the export, the comment and `doc` syntax for notes, the standard view definitions for the view kinds, and the example models as reference. Nothing in it runs in a browser.
- Deferred to later slices: the other seven view kinds, code attached to elements, free-floating notes, the archive, and checks while drawing.

**Assumed**, under the open question "Which SharePoint Server version?": SPFx 1.4.1 for the Server host. It runs on SharePoint Server 2019 and on Subscription Edition, so those answers only decide whether 1.5 becomes an option. A 2016 answer would send the Server host back to SPFx 1.1, as `ARCHITECTURE.md` notes.

**Still proposed** in `ARCHITECTURE.md`, and not used here: React for the screens, SCSS modules, the shell's frame and hash routing, the data rules, sign-in and roles. Tailwind and Fluent UI aren't used either, as the plan proposes.

## Facts that update the plan's notes

`ARCHITECTURE.md` marked its toolchain notes as unconfirmed search results. These come from Microsoft's documentation source (the `SharePoint/sp-dev-docs` repository as it stood on November 2, 2026; the compatibility and setup pages are dated October 29, 2026, the Teams pages October 28, 2026, and the SharePoint Server 2019 and Subscription Edition page February 14, 2020) and from the SPFx generator packages on npm:

- Current SPFx is **1.24.1** (1.24 went GA on October 28, 2026). It needs **Node 22.14+, 24, or 26**, uses **TypeScript 5.8** and **React 18.3.1**, and builds with **Heft**. The gulp toolchain is unsupported from 1.24 on.
- **SharePoint Server 2019** supports SPFx 1.0 to 1.4.1. **Subscription Edition** supports 1.0 to 1.5. **2016 with Feature Pack 2** supports 1.0 to 1.1. So 1.4.1 is right for 2019 and Subscription Edition, and only a 2016 answer would change the Server host.
- The on-premises scaffold still comes from the **1.10.0 generator** with the `onprem19` environment, which writes SPFx 1.4.x dependencies. Its templates are what `hosts/server/` follows.
- SPFx 1.4.1's `--ship` build fails on any tslint warning, and reads its lint rules from `config/tslint.json`, not the root `tslint.json` later generators write.
- Under Node 8, npm runs install scripts as `nobody` when it is root, so a container build needs `--unsafe-perm`.
- SPFx 1.4.1 web parts have no `supportedHosts`; the Teams tab exists only in the Online package.

## Next

1. Install `stronghold-server.sppkg` on the SharePoint Server farm and go through the checks in `hosts/server/README.md`. That settles proof steps 1, 2, and 3. Step 5 is `hosts/server/build.sh` on a machine with Docker.
2. Proof step 4: grow `HostServices` with the signed-in person and the REST client, in both hosts and the dev host.
3. The same checks on SharePoint Online and in a Teams tab.
4. The design canvas's first loop: open https://claude.ai/artifact/V7Fw94cGMbtPnwmyDNmnjU, draw and pin notes, and ask Claude to review. Then the next slice, starting with code attached to elements and the archive (`canvas/README.md`, "What it does").

## Recorded in the Stronghold repository

The November 5 decisions and the facts above are written into the Stronghold repository's `DECISIONS.md`, `ARCHITECTURE.md`, `README.md`, and `CLAUDE.md`, on its branch `claude/youthful-einstein-4a5w20`. They take effect there once that branch is merged. The November 6 decisions on the design artifact are recorded only here so far; they belong in the Stronghold repository's `DECISIONS.md` as well.
