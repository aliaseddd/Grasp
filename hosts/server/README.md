# The Server host

The Stronghold web part for SharePoint Server, on SPFx 1.4.1, the newest SPFx that SharePoint Server 2019 runs and that Subscription Edition supports alongside 1.5. Its TypeScript is 2.4 and its Node.js is 8.

The web part does three things (`src/webparts/stronghold/StrongholdWebPart.ts`): it works out where the app's files are, loads the app's entry file with the shared loader, and calls `mount`. Everything on the screen comes from `../../app`, which is built with current tools and copied into this package.

## Build

Build the app first: `cd ../../app && npm install && npm run build`.

**With Docker**, from anywhere:

```sh
./build.sh
```

That runs `npm ci` and `npm run build` in a `node:8.17.0` container with the repository mounted, and leaves `sharepoint/solution/stronghold-server.sppkg` behind. The container runs as root, and npm 6 then runs install scripts as `nobody`, which can't write into `node_modules`; `--unsafe-perm` in `build.sh` turns that off.

**Without Docker**, with Node 8.17.0 on the path:

```sh
npm ci --unsafe-perm
npm run build
```

`npm run build` runs five steps (`package.json`):

1. `gulp clean` empties `temp/`, so a bundle from an earlier build can't end up in the package.
2. `scripts/prepare-shared.js` empties `src/shared/`, copies `app/src/host/host-services.ts` and `load-app.ts` into it, and writes `app-entry.ts` with the entry file's name from `app/dist/stronghold-app.json`. The folder is generated and not committed.
3. `gulp bundle --ship` builds the web part into `temp/deploy/`. A `--ship` build fails on any tslint warning; the rules it applies are `config/tslint.json` merged over the toolchain's defaults. (SPFx 1.4.1 reads that file, not a root `tslint.json`.)
4. `scripts/copy-app.js` copies `app/dist/*` into `temp/deploy/`, next to the web part's bundle.
5. `gulp package-solution --ship` zips `temp/deploy/` into `sharepoint/solution/stronghold-server.sppkg` as client-side assets (`config/package-solution.json`, `includeClientSideAssets`).

The install needs to download two binaries from GitHub: `node-sass` (SPFx 1.4.1's Sass, unused here but installed) and `phantomjs-prebuilt` (for SPFx's test runner, also unused). On a network that blocks GitHub, point them at a mirror with `SASS_BINARY_SITE` and `PHANTOMJS_CDNURL`.

## What's in the package

`ClientSideAssets/` in the `.sppkg` holds the web part's bundle, its strings file, and the app's files: `stronghold-app.<hash>.js`, `stronghold-app.json`, `stronghold-app.hello.<hash>.js`, and the three Inter font files. Source maps stay out.

When SharePoint installs the package, it puts `ClientSideAssets/` in the app catalog's assets library and rewrites the manifest's `loaderConfig.internalModuleBaseUrls`, which the build leaves as the placeholder `HTTPS://SPCLIENTSIDEASSETLIBRARY/`, to that library's URL. That rewrite is what SPFx's own loader relies on to find the web part's bundle; the packager's source describes the placeholder as the one "the server-side third party component provider" replaces (`node_modules/@microsoft/sp-build-core-tasks/lib/packageSolution/packageSolution/utils/normalizeSolutionDefinition.js`), and Microsoft's pages in hand don't describe it further, so the proof is where it gets confirmed on this farm. The web part reads the rewritten URL back from `this.context.manifest` and appends the entry file's name, which `src/shared/app-entry.ts` carries from the app's build. The entry file then finds the module files and fonts next to itself (`app/README.md`, "Why webpack 5").

## Install on SharePoint Server

Someone with access to the farm does this; it can't be done from here.

1. Upload `sharepoint/solution/stronghold-server.sppkg` to the farm's app catalog and trust it.
2. On a site, Site contents › New › App › Stronghold (the solution's title, `config/package-solution.json`).
3. Edit a modern page, add the "Stronghold" web part (group "Other"), and publish.

The web part has no properties. It always loads the app from its own package: a field that pointed it somewhere else would let any page editor run any script. To try a build that isn't packaged, use `../dev`.

## What to check

The five proof steps from `ARCHITECTURE.md`, in Chrome with DevTools open:

| Step | Check |
|---|---|
| 1. The 1.4.1 web part loads an app built with current tools from its own package | The page says "Hello world!" and the Network tab shows `stronghold-app.<hash>.js` loading from the app catalog's `ClientSideAssets` folder, the same folder as the web part's own bundle. |
| 2. A module's file loads only the first time someone opens it | `stronghold-app.hello.<hash>.js` appears in the Network tab after the entry file, once. |
| 3. The app draws inside a shadow root with the design's tokens and fonts | In Elements, the text sits under `#shadow-root` inside `div.stronghold`. Its computed font is Inter and its color is `#182630`. The three `.woff2` files load from `ClientSideAssets`. |
| 4. The app reads the signed-in person and calls the REST API | Not in this build. It's the next step and needs `HostServices` to grow. |
| 5. The 1.4.1 toolchain builds the package in a container | `./build.sh` on a machine with Docker. |

Things that would break it, and what they look like:

- The farm not rewriting `internalModuleBaseUrls`. Then the web part's own bundle wouldn't load either, because SPFx finds it the same way, and the page would show SharePoint's own "web part failed to load" error. If the bundle loads but the app's files don't, the two aren't in the same folder: the web part prints its failure line with the URL it tried, and the Network tab shows the 404.

- A font or script file served as a download. SharePoint Server's web application has a "Browser File Handling" setting; if it is Strict, files whose type it doesn't know come with `Content-Disposition: attachment`. Scripts still run, but check the fonts load (step 3).
- The app catalog on a different host name from the page. Classic scripts load across origins without CORS, so the entry and module files are fine. Fonts load with CORS; if they fail, the Network tab shows a CORS error on the `.woff2` requests.

## What's in package.json

The dependency list is what the 1.10.0 generator writes for a 1.4.1 web part, kept whole so the toolchain matches a generated project. The web part itself uses only `@microsoft/sp-core-library` and `@microsoft/sp-webpart-base`. The rest (`sp-lodash-subset`, `sp-office-ui-fabric-core`, the workbench, the chai and mocha types) is unused and can be trimmed once the proof has run on the farm; trimming it now would mean proving the toolchain still works without each one, which isn't what this step is for.

## Not here

- `config/deploy-azure-storage.json`: the generator writes it for publishing assets to Azure; the app catalog hosts them instead.
- The local workbench (`gulp serve`). Its page is `https://localhost:4321`, and the app's files aren't in `dist/`, so the web part has nothing to load there. Use `../dev` for development and the real server for the proof.
