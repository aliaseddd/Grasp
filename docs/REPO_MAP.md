# Repo map

Drawn by [aider](https://aider.chat) 0.86.3.dev with `aider --show-repo-map` on November 2, 2026, over the files git tracks. For each file, aider's tree-sitter parser lists the definitions it would hand a model as context; a bare file name means the file has none it recognizes (configuration, Markdown, CSS, JSON). The `⋮` marks lines left out.

The map is what an AI pair programmer sees of this repository before it opens a file. Read it as a table of contents: the contract and the loader in `app/src/host`, the shell in `app/src/shell`, the one module, the two web parts, and the dev host's page, server, and test.

To redraw it after changes, from the repository root (aider needs a model name to start, but drawing the map makes no API call):

```sh
COLUMNS=160 aider --show-repo-map --map-tokens 8192 --no-pretty --yes-always \
  --no-check-update --no-analytics --no-show-model-warnings --model gpt-4o
```

```text
.gitignore

README.md

app/.browserslistrc

app/.gitignore

app/README.md

app/package-lock.json

app/package.json

app/scripts/check-host-files.mjs

app/scripts/tsconfig.host-check.json

app/src/design/README.md

app/src/design/tokens.css

app/src/host/README.md

app/src/host/host-services.ts:
⋮
│export interface HostServices {
⋮
│export interface AppHandle {
│  /** Takes the app off the page and lets go of what it holds. A host calls this when its web part 
│  unmount(): void;
⋮
│export interface StrongholdApp {
│  /** The app's version, from app/package.json. */
│  version: string;
│  /** Draws the app inside `container` and returns the handle that takes it down again. */
│  mount(container: HTMLElement, services: HostServices): AppHandle;
⋮
│declare global {
│  interface Window {
│    /** Set by the app's entry file when it runs (app/webpack.config.js, output.library). Absent un
│    Stronghold?: StrongholdApp;
│  }
⋮

app/src/host/load-app.ts:
⋮
│function getRegisteredApp(): StrongholdApp | undefined {
│  const app: StrongholdApp | undefined = window.Stronghold;
│  return app && typeof app.mount === 'function' ? app : undefined;
⋮
│function findScript(entryUrl: string): HTMLScriptElement | undefined {
│  const scripts: ArrayLike<HTMLScriptElement> = document.getElementsByTagName('script');
│  for (let i: number = 0; i < scripts.length; i++) {
│    const script: HTMLScriptElement | undefined = scripts[i];
│    if (script && script.getAttribute(SCRIPT_ATTRIBUTE) === entryUrl) {
│      return script;
│    }
│  }
│  return undefined;
⋮
│function addScript(entryUrl: string): HTMLScriptElement {
│  const element: HTMLScriptElement = document.createElement('script');
│  element.setAttribute(SCRIPT_ATTRIBUTE, entryUrl);
│  element.setAttribute(STATE_ATTRIBUTE, 'loading');
│  element.addEventListener('load', (): void => {
│    element.setAttribute(STATE_ATTRIBUTE, 'loaded');
│  });
│  element.addEventListener('error', (): void => {
│    element.setAttribute(STATE_ATTRIBUTE, 'failed');
│  });
⋮
│export function loadApp(entryUrl: string): Promise<StrongholdApp> {
│  const registered: StrongholdApp | undefined = getRegisteredApp();
│  if (registered) {
│    return Promise.resolve(registered);
│  }
│
│  return new Promise<StrongholdApp>((resolve: (app: StrongholdApp) => void, reject: (error: Error) 
│    const settle: () => void = (): void => {
│      const app: StrongholdApp | undefined = getRegisteredApp();
│      if (app) {
⋮

app/src/main.ts

app/src/modules/hello/index.ts:
⋮
│export const hello: StrongholdModule = {
│  id: 'hello',
│  mount(root) {
│    const line = document.createElement('p');
│    line.textContent = 'Hello world!';
│    root.append(line);
│    return () => {
│      line.remove();
│    };
│  },
⋮

app/src/shell/fonts.ts:
⋮
│export function ensureFonts(): void {
│  if (added) {
│    return;
│  }
│  added = true;
│  for (const [weight, url] of faces) {
│    // Quoted, because a package path can contain parentheses or an apostrophe, which end an unquot
│    const face = new FontFace('Inter', `url("${url}") format("woff2")`, { weight, style: 'normal', 
│    document.fonts.add(face);
│    face.load().catch(() => {
⋮

app/src/shell/module.ts:
⋮
│export interface StrongholdModule {
│  /** The module's id. It is also its folder under src/modules/ and, once there is a router, its ro
│  id: string;
│  /**
│   * Draws the module into `root` and owns it from then on. Returns the function that takes the mod
│   * again; the shell calls it on unmount.
│   */
│  mount(root: HTMLElement): () => void;
⋮

app/src/shell/mount.ts:
⋮
│export function mount(container: HTMLElement, services: HostServices): AppHandle {
│  void services; // Nothing to take from the host yet. See host-services.ts.
│
│  ensureFonts();
│
│  const host = document.createElement('div');
│  host.className = 'stronghold';
│  const shadow = host.attachShadow({ mode: 'open' });
│  shadow.adoptedStyleSheets = [shellStyles()];
│  const root = document.createElement('div');
⋮
│  return {
│    unmount(): void {
│      live = false;
│      try {
│        unmountModule?.();
│      } catch (error) {
│        console.error(`[Stronghold] The ${entry.id} module failed while closing.`, error);
│      }
│      host.remove();
│    },
⋮

app/src/shell/registry.ts:
⋮
│export interface ModuleEntry {
│  id: string;
│  /** Loads the module's file. The first call fetches it; the browser caches the file for later cal
│  load(): Promise<StrongholdModule>;
⋮

app/src/shell/shell.css

app/src/shell/styles.ts:
⋮
│export function shellStyles(): CSSStyleSheet {
│  if (!sheet) {
│    sheet = new CSSStyleSheet();
│    sheet.replaceSync(tokens.replace(/:root\b/g, ':host') + '\n' + shell);
│  }
│  return sheet;
⋮

app/src/types/build.d.ts

app/tsconfig.json

app/webpack.config.js:
⋮
│class EntryNamePlugin {
│  apply(compiler) {
│    compiler.hooks.thisCompilation.tap('EntryNamePlugin', (compilation) => {
│      compilation.hooks.processAssets.tap(
│        { name: 'EntryNamePlugin', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE },
│        () => {
│          const files = compilation.entrypoints.get('stronghold-app').getFiles().filter((file) => f
│          const manifest = { entry: files[0], version: pkg.version };
│          compilation.emitAsset('stronghold-app.json', new webpack.sources.RawSource(JSON.stringify
│        },
│      );
⋮
│module.exports = () => ({
│  entry: {
│    // dist/stronghold-app.<hash>.js, named in dist/stronghold-app.json (EntryNamePlugin above).
│    'stronghold-app': './src/main.ts',
│  },
│  output: {
│    path: path.resolve(__dirname, 'dist'),
│    filename: '[name].[contenthash:8].js',
│    // Module files: dist/stronghold-app.hello.1a2b3c4d.js. The name comes from the webpackChunkNam
│    // src/shell/registry.ts; the hash changes when the module's code does, so SharePoint never ser
⋮

docs/REPO_MAP.md

docs/dev-host.png

docs/teams-icons/README.md

docs/teams-icons/icons.html

docs/teams-icons/render.mjs

hosts/dev/.gitignore

hosts/dev/README.md

hosts/dev/index.html

hosts/dev/package-lock.json

hosts/dev/package.json

hosts/dev/serve.mjs:
⋮
│function handle(request, response) {
│  let url;
│  let pathname;
│  try {
│    url = new URL(request.url, 'http://localhost');
│    pathname = decodeURIComponent(url.pathname);
│  } catch {
│    response.writeHead(400, { 'Content-Type': 'text/plain' }).end('Bad request: malformed URL');
│    return;
│  }
⋮
│export function startServer(port = 0) {
│  return new Promise((resolve) => {
│    const server = http.createServer(handle);
│    server.listen(port, '127.0.0.1', () => {
│      const url = `http://127.0.0.1:${server.address().port}/`;
│      resolve({ server, url });
│    });
│  });
⋮

hosts/dev/src/dev-host.ts:
⋮
│interface DevHost {
│  /** The entry file this page loads, once known. */
│  readonly appUrl: string | undefined;
│  /** The mounted app, if any. */
│  readonly handle: AppHandle | undefined;
│  /** Settles when the first mount has finished, for the tests. */
│  readonly ready: Promise<void>;
│  mount(): Promise<void>;
│  unmount(): void;
⋮
│declare global {
│  interface Window {
│    /** The page's controls, for the tests and the console. */
│    devHost: DevHost;
│  }
⋮
│async function findAppUrl(): Promise<string> {
│  if (appUrl) {
│    return appUrl;
│  }
│  const override = new URLSearchParams(location.search).get('app');
│  if (override) {
│    appUrl = new URL(override, location.href).href;
│    return appUrl;
│  }
│  const response = await fetch(BUILD_MANIFEST);
⋮
│async function mount(): Promise<void> {
│  const url = await findAppUrl();
│  const app = await loadApp(url);
│  if (handle) {
│    return;
│  }
│  handle = app.mount(container, {});
│  status.textContent = `Mounted Stronghold ${app.version} from ${url}`;
⋮
│function unmount(): void {
│  handle?.unmount();
│  handle = undefined;
│  status.textContent = 'Unmounted.';
⋮
│window.devHost = {
│  get appUrl() {
│    return appUrl;
│  },
│  get handle() {
│    return handle;
│  },
│  ready,
│  mount,
│  unmount,
⋮

hosts/dev/test/fixtures/blank.html

hosts/dev/test/fixtures/not-the-app.js

hosts/dev/test/hello.test.mjs:
⋮
│async function openHello() {
│  const page = await browser.newPage();
│  const requests = [];
│  page.on('request', (request) => requests.push(request.url()));
│  const errors = [];
│  page.on('pageerror', (error) => errors.push(error.message));
│  await page.goto(`${server.url}hosts/dev/`);
│  await page.evaluate(() => window.devHost.ready);
│  await page.waitForFunction(() =>
│    document.querySelector('.stronghold')?.shadowRoot?.textContent?.includes('Hello world!'));
⋮
│function readApp() {
│  const shadow = document.querySelector('.stronghold').shadowRoot;
│  const line = shadow.querySelector('.app p');
│  const style = getComputedStyle(line);
│  return {
│    text: shadow.querySelector('.app').textContent.trim(),
│    color: style.color,
│    fontFamily: style.fontFamily,
│    fontStyle: style.fontStyle,
│    fontSize: style.fontSize,
⋮
│async function openBlank() {
│  const page = await browser.newPage();
│  await page.goto(`${server.url}hosts/dev/test/fixtures/blank.html`);
│  return page;
⋮

hosts/dev/tsconfig.json

hosts/online/.gitignore

hosts/online/.yo-rc.json

hosts/online/README.md

hosts/online/build.sh

hosts/online/config/config.json

hosts/online/config/package-solution.json

hosts/online/config/rig.json

hosts/online/config/sass.json

hosts/online/config/serve.json

hosts/online/config/typescript.json

hosts/online/config/write-manifests.json

hosts/online/eslint.config.js

hosts/online/package-lock.json

hosts/online/package.json

hosts/online/scripts/copy-app.js

hosts/online/scripts/prepare-shared.js

hosts/online/src/webparts/stronghold/StrongholdWebPart.manifest.json

hosts/online/src/webparts/stronghold/StrongholdWebPart.ts:
⋮
│export interface IStrongholdWebPartProps {
⋮
│export default class StrongholdWebPart extends BaseClientSideWebPart<IStrongholdWebPartProps> {
│  /** The mounted app, once it is up. */
│  private _app: AppHandle | undefined;
│  /** True once render() has started loading; SPFx may call render() again, and there is nothing to
│  private _appStarted: boolean = false;
│  /** True once SharePoint has disposed the web part, so a load that finishes late mounts nothing. 
│  private _appDisposed: boolean = false;
│
│  public render(): void {
│    if (this._appStarted) {
│      return;
│    }
│    this._appStarted = true;
│    this.domElement.textContent = '';
│    const urls: string[] = this._appUrls();
│    if (urls.length === 0) {
│      this._showFailure(new Error('SharePoint gave this web part no base URL for its files.'), urls
│      return;
⋮
│  protected onDispose(): void {
│    this._appDisposed = true;
│    if (this._app) {
│      this._app.unmount();
│      this._app = undefined;
│    }
│    super.onDispose();
⋮
│  protected get dataVersion(): Version {
│    return Version.parse('1.0');
⋮
│  private _appUrls(): string[] {
│    const bases: string[] = this.context.manifest.loaderConfig.internalModuleBaseUrls || [];
│    return bases.map((base: string): string => (base.endsWith('/') ? base : `${base}/`) + APP_ENTRY
⋮
│  private _loadFrom(urls: string[], index: number): void {
│    loadApp(urls[index]).then((app) => {
│      if (this._appDisposed) {
│        return;
│      }
│      try {
│        this._app = app.mount(this.domElement, {});
│      } catch (error) {
│        // The file loaded; the app failed while drawing. Another URL would give the same app, so s
│        this._showFailure(error, [urls[index]]);
⋮
│  private _showFailure(error: unknown, urls: string[]): void {
│    this.domElement.textContent = `${strings.LoadFailed} ${urls.join(', ')}`;
│    console.error('[Stronghold]', error);
⋮

hosts/online/src/webparts/stronghold/loc/en-us.js

hosts/online/src/webparts/stronghold/loc/mystrings.d.ts:
│declare interface IStrongholdWebPartStrings {
⋮

hosts/online/teams/46df236a-2538-43ca-968c-fe5a6de88004_color.png

hosts/online/teams/46df236a-2538-43ca-968c-fe5a6de88004_outline.png

hosts/online/tsconfig.json

hosts/server/.gitignore

hosts/server/.yo-rc.json

hosts/server/README.md

hosts/server/build.sh

hosts/server/config/config.json

hosts/server/config/copy-assets.json

hosts/server/config/package-solution.json

hosts/server/config/serve.json

hosts/server/config/tslint.json

hosts/server/config/write-manifests.json

hosts/server/gulpfile.js

hosts/server/package-lock.json

hosts/server/package.json

hosts/server/scripts/copy-app.js

hosts/server/scripts/prepare-shared.js

hosts/server/src/index.ts

hosts/server/src/webparts/stronghold/StrongholdWebPart.manifest.json

hosts/server/src/webparts/stronghold/StrongholdWebPart.ts:
⋮
│export interface IStrongholdWebPartProps {
⋮
│export default class StrongholdWebPart extends BaseClientSideWebPart<IStrongholdWebPartProps> {
│  /** The mounted app, once it is up. */
│  private _app: AppHandle | undefined;
│  /** True once render() has started loading; SPFx may call render() again, and there is nothing to
│  private _appStarted: boolean = false;
│  /** True once SharePoint has disposed the web part, so a load that finishes late mounts nothing. 
│  private _appDisposed: boolean = false;
│
│  public render(): void {
│    if (this._appStarted) {
│      return;
│    }
│    this._appStarted = true;
│    this.domElement.textContent = '';
│    const urls: string[] = this._appUrls();
│    if (urls.length === 0) {
│      this._showFailure(new Error('SharePoint gave this web part no base URL for its files.'), urls
│      return;
⋮
│  protected onDispose(): void {
│    this._appDisposed = true;
│    if (this._app) {
│      this._app.unmount();
│      this._app = undefined;
│    }
│    super.onDispose();
⋮
│  protected get dataVersion(): Version {
│    return Version.parse('1.0');
⋮
│  private _appUrls(): string[] {
│    const bases: string[] = this.context.manifest.loaderConfig.internalModuleBaseUrls || [];
│    const urls: string[] = [];
│    for (let i: number = 0; i < bases.length; i++) {
│      let base: string = bases[i];
│      if (base.charAt(base.length - 1) !== '/') {
│        base += '/';
│      }
│      urls.push(base + APP_ENTRY_FILE);
│    }
⋮
│  private _loadFrom(urls: string[], index: number): void {
│    loadApp(urls[index]).then((app) => {
│      if (this._appDisposed) {
│        return;
│      }
│      try {
│        this._app = app.mount(this.domElement, {});
│      } catch (error) {
│        // The file loaded; the app failed while drawing. Another URL would give the same app, so s
│        this._showFailure(error, [urls[index]]);
⋮
│  private _showFailure(error: Error, urls: string[]): void {
│    this.domElement.textContent = strings.LoadFailed + ' ' + urls.join(', ');
│    console.error('[Stronghold]', error);
⋮

hosts/server/src/webparts/stronghold/loc/en-us.js

hosts/server/src/webparts/stronghold/loc/mystrings.d.ts:
│declare interface IStrongholdWebPartStrings {
⋮

hosts/server/tsconfig.json
```
