# The Online host, which is also the Teams tab

The Stronghold web part for SharePoint Online, on SPFx 1.24.1 and its Heft toolchain. Its manifest lists `TeamsTab` under `supportedHosts`, so the same web part is the Teams tab; Teams needs no host of its own (`ARCHITECTURE.md`, "The app and its hosts", proposed).

The web part is the Server host's twin in current TypeScript (`src/webparts/stronghold/StrongholdWebPart.ts`): it works out where the app's files are, loads the entry file with the shared loader, and calls `mount`. It has no properties, for the reason its source comment gives. Keep the two in step.

## Build

Build the app first: `cd ../../app && npm install && npm run build`. Then, with Node 22.14 or later, 24, or 26:

```sh
npm ci
npm run build
```

or, with Docker and Node 26, the version Microsoft recommends for SPFx 1.24: `./build.sh`.

`npm run build` runs four steps (`package.json`):

1. `scripts/prepare-shared.js` empties `src/shared/`, copies `app/src/host/host-services.ts` and `load-app.ts` into it, and writes `app-entry.ts` with the entry file's name from `app/dist/stronghold-app.json`. The folder is generated and not committed. The copies pass this host's ESLint profile as they are, so nothing is skipped; ESLint does skip the build output folders (`eslint.config.js`).
2. `heft test --clean --production` empties `release/` and `lib/`, builds the web part into `release/assets/`, lints it, and runs the (empty) test phase.
3. `scripts/copy-app.js` copies `app/dist/*` into `release/assets/`.
4. `heft package-solution --production` zips `release/assets/` and `teams/` into `sharepoint/solution/stronghold-online.sppkg`.

## What's in the package

Built and checked on November 2, 2026, 24 entries:

- `ClientSideAssets/`: the web part's bundle and strings file; the app's `stronghold-app.<hash>.js`, `stronghold-app.json`, `stronghold-app.hello.<hash>.js`, and three Inter font files; the two Teams icons.
- The web part's feature and `AppManifest.xml`.

The manifest in the package has `internalModuleBaseUrls: ["HTTPS://SPCLIENTSIDEASSETLIBRARY/"]`, the placeholder SharePoint Online replaces with the real assets URL at install, which is the app catalog's library or the Microsoft 365 CDN in front of it (the packager's source calls it the URL "the server-side third party component provider" replaces; SPFx's own loader depends on the same rewrite to find the web part's bundle). The web part appends the entry file's name, which `src/shared/app-entry.ts` carries from the app's build.

## Settings that differ from the generator's defaults

- `skipFeatureDeployment: true` in `config/package-solution.json`: Teams needs the solution deployed to all sites (`build-for-teams-considerations.md` in Microsoft's docs). The admin still chooses at upload time.
- `supportsThemeVariants: false` in the manifest: the design has one light theme. Teams's dark and high-contrast themes are a design question first (`ARCHITECTURE.md`, "Design questions from Teams").
- `supportedHosts: ["SharePointWebPart", "TeamsTab"]`: a page and a tab. Not a personal app, not a full-page app.
- The Teams icons are the Keep mark, not the generator's placeholders (`docs/teams-icons/`).

## Install on SharePoint Online and in Teams

Someone with the tenant does this; it can't be done from here.

1. Upload `sharepoint/solution/stronghold-online.sppkg` to the tenant app catalog. Tick "Make this solution available to all sites in the organization" and deploy.
2. On a site, edit a page, add the "Stronghold" web part (group "Advanced"), publish.
3. For Teams: in the app catalog, select the package and choose **Add to Teams** (SharePoint builds the Teams app package from the manifest and the icons). Then, in a team, add a tab and pick Stronghold.

## What to check

The same five steps as `../server/README.md`, on a SharePoint Online page and then in a Teams tab, plus:

- The Content Security Policy. SharePoint Online is reported to block inline scripts (`ARCHITECTURE.md` lists that among its unconfirmed notes; Microsoft's page on it wasn't reachable from here). Nothing here is inline either way: the host adds a `<script>` with a `src`, the app's styles are constructed stylesheets, and the fonts register through the Font Loading API. The DevTools console would say `Refused to execute inline script` if anything slipped.
- The assets origin. If the tenant serves assets from the Microsoft 365 CDN, the entry file and module files load as classic scripts, and the fonts load with CORS from the CDN. Check the `.woff2` requests succeed.
- In Teams, the tab's page belongs to the team's site, not the intranet's. The app's files still come from the app catalog, so nothing changes for hello world.

## What's in package.json

The dependency list is what the 1.24.1 generator writes for a web part, minus two packages the web part doesn't use and the plan rules out or doesn't need: `@fluentui/react` (`ARCHITECTURE.md`, Styling: "Don't use Fluent UI") and `@microsoft/sp-property-pane` (there is no property pane). The build passes without them. `sp-lodash-subset`, `sp-office-ui-fabric-core`, `css-loader`, and the Jest types are also unused by the web part but may be used by the Heft rig; they stay until the proof has run, when trimming them is worth the check.

## Not here

- `config/deploy-azure-storage.json`: the generator writes it for publishing assets to Azure; the app catalog hosts them instead.
- `heft start` and the workbench: the app's files aren't served by Heft's dev server. Use `../dev` for development.
