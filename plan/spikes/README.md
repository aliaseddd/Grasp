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
