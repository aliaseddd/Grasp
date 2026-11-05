# The app

Stronghold itself: the shell, the modules, and the contract its hosts use. It is written once, with current tools, and built into a handful of plain files in `dist/`. A host (`../hosts`) puts those files in its own package and loads them into a page. Nothing here knows about SharePoint.

| Folder | What it holds |
|---|---|
| `src/main.ts` | The entry file. Its exports become `window.Stronghold`. |
| `src/shell/` | What runs first: the shadow root, the styles, the fonts, the module registry, and `mount`. |
| `src/modules/hello/` | The hello-world module. BOLOs and Logbooks will sit next to it. |
| `src/host/` | The two files every host compiles: the `HostServices` contract and the loader. See its README. |
| `src/design/` | A byte-for-byte copy of the design's tokens. See its README. |
| `scripts/` | The TypeScript 2.4 check for `src/host/`. |

## Commands

Node 22 or later.

```sh
npm install
npm run build        # dist/, minified, with source maps
npm run build:dev    # the same, readable
npm run watch
npm test             # type-check, then compile src/host/*.ts with TypeScript 2.4.2
```

`npm test` doesn't open a browser. The browser test lives in `../hosts/dev`, because it needs a page to mount into.

## What the build makes

```
dist/
  stronghold-app.<hash>.js                            the entry file: shell, registry, webpack's runtime
  stronghold-app.json                                 names the entry file, for the hosts' builds and the dev page
  stronghold-app.hello.<hash>.js                      the hello module, fetched the first time it opens
  stronghold-app.inter-latin-400-normal.<hash>.woff2
  stronghold-app.inter-latin-500-normal.<hash>.woff2
  stronghold-app.inter-latin-600-normal.<hash>.woff2
  *.map                                               source maps; the hosts leave them out of their packages
```

Everything is flat and starts with `stronghold-app.`, because a host's package puts these files in the same folder as its own bundle. Every file's name carries a hash of its contents, the entry file included, so a new version is a new file and no browser cache can pair an old entry file with new module files. The one fixed name is `stronghold-app.json`, which says what the entry file is called; a host's build reads it when it generates `src/shared/app-entry.ts` (`hosts/*/scripts/prepare-shared.js`), and the dev page fetches it.

## Why webpack 5, and not Vite

`ARCHITECTURE.md` left the bundler to the proof: "whichever finds its module files most reliably from a SharePoint page." The proof uses webpack 5, and it was kept on November 5, 2026 (`ARCHITECTURE.md`, "How a host loads the app"). The reason is how the files get loaded.

Vite builds ES modules. A browser fetches ES modules with CORS, so if the app's files live on a different origin from the page, the server has to send `Access-Control-Allow-Origin`, or the module doesn't load. On an intranet that is a real possibility: an app catalog on its own host header, or SharePoint Online's files served through the Microsoft 365 CDN. SharePoint's own SPFx bundles are classic scripts for the same reason.

webpack can build classic scripts that still load module files on demand: it adds a `<script>` element for each one. With `publicPath: 'auto'` it reads its own URL from the script element that loaded it, so the build doesn't need to know where SharePoint will put the files. That is the mechanism SPFx itself has used on SharePoint pages for years.

The cost is a longer build config than Vite's. If the proof shows that the app's files are always same-origin, Vite becomes an option again. Nothing in `src/` depends on the bundler except the `webpackChunkName` comment in `src/shell/registry.ts`.

## How it draws

**A shadow root.** `mount` creates one element in the host's container and draws everything inside a shadow root. The page's CSS can't select anything inside, and Stronghold's can't leak out. Inherited properties, such as the page's font and color, still flow through the host element, so the shell's wrapper resets them with `all: initial` and sets the design's instead (`src/shell/shell.css`). The reset sits on the wrapper and not on `:host`, because page styles can override `:host` rules on the host element but can't reach the wrapper.

**Constructed stylesheets.** The styles go into a `CSSStyleSheet` built from script and adopted by the shadow root (`src/shell/styles.ts`). There is no `<style>` element and nothing inline. The design's tokens are declared on `:root`; the shell swaps that for `:host` when it builds the sheet, so the token file stays identical to the design's.

**Fonts from the package.** Chrome ignores an `@font-face` declared inside a shadow root, but text inside one can use any font the page has. So the shell registers Inter on the page through the CSS Font Loading API (`src/shell/fonts.ts`), with URLs that webpack resolved to the package's own files. No `<link>`, no `<style>`, no Google Fonts. Inter comes in the three weights the design uses, Latin letters only for now. IBM Plex Mono joins with the first screen that shows a number.

**One page.** The app works in the document that loaded its entry file, which is where every host mounts it. The font faces and the stylesheet are made once per page and shared by every mount. webpack's runtime globals carry the app's version (`uniqueName` in `webpack.config.js`), so two builds could share a page without swapping each other's module files.

**Modules.** `src/shell/registry.ts` lists the modules and loads each with `import()`, which webpack turns into a separate file. Until there is a router, `mount` opens the first module in the list. A module gets an element, draws into it, and returns the function that cleans up (`src/shell/module.ts`).

## What a host sees

A host loads the entry file with a `<script>` element and waits for `window.Stronghold`. Then it calls `Stronghold.mount(container, services)` and keeps the handle to call `unmount()` when the web part goes away. `src/host/load-app.ts` does the loading, and `src/host/host-services.ts` is the contract. `HostServices` is empty for now: hello world takes nothing from its host. Proof step 4 adds the signed-in person and SharePoint's REST API.

## Not here yet

- A router. One module, no routes.
- React. `ARCHITECTURE.md` proposes current React for the screens; it waits for Damon's approval, and hello world doesn't need it. A module that uses React would create its root inside the element it is given.
- The screens, the header, and the menu. They come from the design after its rework.
- IBM Plex Mono, and the stores.
