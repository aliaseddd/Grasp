# Work-machine probe

Answers the questions in `plan/direction.md`, "What is not settled yet", that only Damon's work machine can answer. Nothing to install: download the repository (or this folder), open `index.html` from disk in Edge or Chrome.

## Steps on the work machine

1. Open `plan/probe/index.html` (from `file://`). Click **Run automatic checks**. Then click buttons 1 to 6 in turn (5 and 6 need a file and a look at your downloads); for 2, press F5 first.
2. Open `edge://policy` or `chrome://policy` and note any policy whose name contains `FileSystemAccess`, `AllowFileSelectionDialogs`, `JavaScriptJit` or `DefaultJavaScriptJitSetting`; in Edge note whether Enhanced Security is on (`edge://settings/privacy`).
3. Click **Copy report**, paste it into the chat, with the policy notes.
4. Optional, about 15 MB: open `opensysml/index.html`, wait for "Done", copy its report too.

Nothing is sent anywhere except requests to api.github.com, raw.githubusercontent.com and github.com. The GitHub PUT uses an invalid token and writes nothing; a 401 answer proves the browser's pre-check passed.

## What each result decides

| Result | Decides |
|---|---|
| pickers `function`; folder write/read ok; handle survives reload | the workspace folder as planned (decision 7) |
| pickers blocked, or file input fails | download-to-save and file input; if both fail, files pass through the conversation |
| GitHub PUT answers 401 | Pull and Push through the GitHub API; a network failure means the conversation carries the files |
| WebAssembly speed `ok`, module total under about 3 s | OpenSysML in the page |
| WebAssembly slow (interpreter-like) or blocked | text import on Claude's side only |

## Reference numbers (4-core server, Chromium 153, `node run.cjs`)

Secure context yes; three pickers present; module script, sibling `fetch` and file Worker blocked; Blob Worker ok; GitHub GET 200 and PUT 401; 50M-iteration wasm loop about 56 ms against JS 268 ms; OpenSysML module total about 1.0 s with four diagnostics on the sample.

## Rebuilding

`node run.cjs` runs both pages under Playwright as a baseline. `opensysml/build.sh` regenerates `wasm_exec.js`, `wasm-data.js` (13 MB, the module gzipped as base64) and `wasm-app.js` from `plan/spikes/node_modules` (`npm install` there first); `opensysml/app.src.js` is the source of `wasm-app.js`.
