# The spikes behind `plan/direction.md`

Three small experiments run on November 8, 2026, kept so the next session can run them again. Install once in this folder (`npm install`, which writes only `node_modules/`, ignored by git), with Playwright and its Chromium where `canvas/README.md` says they go. Their results are summarized in `plan/direction.md`, "What was checked".

## `file-page/`: what a page opened from disk can do

`node file-page/run.cjs` opens `file-page/index.html` from `file://` in Chromium and prints what works: it is a secure context with `showDirectoryPicker`, `showOpenFilePicker` and `showSaveFilePicker`; classic scripts, stylesheets and images load; localStorage and IndexedDB work; `fetch` to api.github.com passes CORS. Module scripts, dynamic `import()`, `fetch` and XMLHttpRequest of a sibling file and a Worker from a file are blocked; a Worker from a Blob URL works.

## `stack/`: the candidate UI stack, bundled, opened from disk

```sh
npx esbuild stack/app.jsx --bundle --format=iife --jsx=automatic --minify --define:process.env.NODE_ENV='"production"' --outfile=stack/dist/app.js
cp stack/index.html stack/dist/ && node stack/ui.cjs          # Dockview + React Flow + ELK: tabs, sashes, resize handles; three screenshots in stack/dist/
npx esbuild stack/scale.jsx --bundle --format=iife --jsx=automatic --minify --define:process.env.NODE_ENV='"production"' --outfile=stack/dist/scale.js
cp stack/scale.html stack/dist/ && node stack/scale.cjs       # React Flow with 1,000 and 5,000 nodes from disk: first render, nodes in the DOM, idle fps, a drag and a pan
```

## `opensysml/`: OpenSysML's wasm module, in Node and in a page opened from disk

```sh
node opensysml/probe.mjs                                      # connectWasm inline in Node: parse, find, walk, renderView; which capabilities the wasm build lacks (convert, renderDocument, query)
mkdir -p opensysml/dist && cp node_modules/@openmbee/opensysml-wasm/wasm_exec.js opensysml/dist/
gzip -9 -c node_modules/@openmbee/opensysml-wasm/sysml-wasm.wasm > opensysml/dist/sysml-wasm.wasm.gz
node -e "const fs=require('fs');fs.writeFileSync('opensysml/dist/wasm-data.js','window.SYSML_WASM_GZ_B64='+JSON.stringify(fs.readFileSync('opensysml/dist/sysml-wasm.wasm.gz').toString('base64'))+';\n')"
npx esbuild opensysml/wasm-app.js --bundle --format=iife --minify --define:process.env.NODE_ENV='"production"' --outfile=opensysml/dist/wasm-app.js
cp opensysml/index.html opensysml/dist/ && node opensysml/wasm-page.cjs   # the module embedded as gzip+base64 in a classic script, decompressed and started in the page: timings of each step
```

### The command-line build: text to the standard JSON element form and back

The same npm package ships `sysml-prod.wasm.gz`, the browser build of OpenSysML's command line and REPL, which the typed client does not use. `opensysml/convert.cjs` runs it under Node with a minimal environment (its arguments and environment must stay under about 8 KiB):

```sh
gunzip -c node_modules/@openmbee/opensysml-wasm/sysml-prod.wasm.gz > opensysml/sysml-prod.wasm   # 64.8 MB
cp node_modules/@openmbee/opensysml-wasm/wasm_exec.js opensysml/
cd opensysml
node convert.cjs -convert api-json ../../../docs/sysml/stronghold-proof.sysml > proof.api.json   # 189 elements, 258 KB, 1.6 s; ids derived from qualified names, identical on every run
node convert.cjs -from api-json -convert sysml proof.api.json > proof.back.sysml               # 139 lines, comments and documentation kept
node convert.cjs -convert api-json proof.back.sysml > proof.back.api.json                      # the same 189 elements, type for type and name for name
```

OpenSysML prints a notice that the conversion is experimental: it covers model structure and the behaviour bodies state, refuses what it cannot write back, and its vocabulary may change without a compatibility path.

## `sequence/` and `geometry/`: the two probes at the start of slice 2

Run on November 14, 2026, to answer one question of `plan/direction.md`, "What is not settled yet": whether React Flow nodes serve the sequence view and the geometry view, or SVG inside the tab does. Each folder builds both ways on one layout function ported from the old page, drives both with real pointer events, and says the answer in the first line of its own `README.md`: a graph body, for both. They install nothing: React, React Flow and esbuild are read from the repository's own `node_modules` (`npm ci` at the root).

```sh
plan/spikes/sequence/build.sh && node plan/spikes/sequence/run.cjs                              # about 10 minutes
node plan/spikes/geometry/build.cjs && node plan/spikes/geometry/run.cjs                        # about 80 s
```

`plan/slice-2.md`, section 2, says what the slice takes from them.
