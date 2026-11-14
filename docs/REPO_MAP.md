# Repo map

Drawn by [aider](https://aider.chat) 0.86.2 with `aider --show-repo-map` on November 14, 2026, over the files git tracks. For each file, aider's tree-sitter parser lists the definitions it would hand a model as context; a bare file name means the file has none it recognizes (configuration, Markdown, CSS, JSON). The `⋮` marks lines left out.

The map is what an AI pair programmer sees of this repository before it opens a file. Read it as a table of contents: the new page's TypeScript in `canvas/app/`, the old page's scripts and the model library in `canvas/src/`, the tests in `canvas/test/` and `canvas/app/test/`, and the SysML scripts in `docs/sysml/`. The built pages (`canvas/index.html`, `canvas/dist/`) are generated, and aider doesn't read their inline or bundled scripts. Stronghold's code, which this repository held until November 7, is in the Stronghold repository now; its map from then is in this file's history.

To redraw it after changes, from the repository root (aider needs a model name to start, but drawing the map makes no API call). aider maps the files of the last commit, not staged changes, so commit first:

```sh
COLUMNS=160 aider --show-repo-map --map-tokens 8192 --no-pretty --yes-always \
  --no-check-update --no-analytics --no-show-model-warnings --model gpt-4o
```

```text
If you need to edit any of these files, ask me to *add them to the chat* first.

canvas/app/src/core/adapter.ts:
⋮
│declare global {
│  // The part of the model library that the adapter reads, beside what src/types.d.ts and session.t
│  interface SysMLModelLibrary {
│    readonly KINDS: Readonly<Record<string, KindRow>>;
│    readonly RELATIONSHIPS: Readonly<Record<string, { line: LineRow; hideable?: boolean }>>;
│    readonly VIEW_KINDS: Readonly<Record<string, ViewKindRow>>;
│    /** An element's name in the text, trimmed; '' while it has none; null when its kind has none (
│    textName(el: { kind: string; name?: unknown }): string | null;
│    /** The typing of a usage (its "defined by" line), hidden or not, or null. */
│    typingOf(model: Model, el: ModelElement): ModelRelationship | null;
│    /** 'a part def' or 'an action flow view'; `capital` makes the article's first letter a capital
│    an(label: string, capital?: boolean): string;
⋮
│export type PlaneNode = Node<NodeData, Shape> & {
│  type: Shape;
│  width: number;
│  height: number;
│  measured: { width: number; height: number };
│  className: string;
⋮
│export type EdgeData = {
│  route: 'straight' | 'elbow';
│  /** The marker's element id at the line's far end, markerId() of the row's name, or null. */
│  marker: string | null;
│  label: string;
│  /** How far below the line's middle the label's baseline sits. */
│  labelOffset: number;
│  far: boolean;
│  /** Whether each end is a border item, which a line leaves from just outside its square. */
│  sourceBorder: boolean;
⋮
│export type PlaneEdge = Edge<EdgeData, 'line'> & { type: 'line'; data: EdgeData; className: string 
│
⋮
│export interface Projection {
│  /** The view's id. */
│  readonly view: string;
│  readonly far: boolean;
│  readonly look: Look;
│  /** A box, then the boxes inside it, each with its own, then its border items; at each level in t
│  readonly nodes: PlaneNode[];
│  /** One for each relationship that is not hidden and has both ends among the nodes, in the model'
│  readonly edges: PlaneEdge[];
│  /** Every node's rectangle from the view's origin, by its id: what the old page's layout calls re
⋮
│export interface ProjectionRead {
│  /** The model object it was read from. */
│  readonly model: Model;
│  /** The id of the view it was read for. */
│  readonly view: string;
│  readonly far: boolean;
│  readonly look: Look;
│  /** Whether every place the view's nodes were laid out from, bar those of `options.places`, is th
│  readonly exact: boolean;
│  /** What each node says that no place can alter, with the view's saved place: in the order the no
⋮
│export type Viewport = { x: number; y: number; zoom: number };
│
⋮
│export interface ReadLine {
│  readonly from: number;
│  readonly to: number;
│  readonly fromBorder: boolean;
│  readonly toBorder: boolean;
│  readonly how: 'straight' | 'elbow';
│  readonly edge: PlaneEdge;
⋮

canvas/app/src/core/checks.ts:
⋮
│export interface Diagnostic {
│  /** The rule's name in the specification: 'validateNamespaceDistinguishibility'. */
│  readonly rule: string;
│  /** The metaclass the rule is on: 'Namespace'. */
│  readonly metaclass: string;
│  /** What breaks the rule: an element, a relationship, or (null) the package. */
│  readonly type: 'el' | 'rel' | null;
│  /** The element's or the relationship's id; null for the package. */
│  readonly id: string | null;
│  /** The qualified name of what breaks it. */
⋮
│declare global {
│  // The part of the model library that the checks call, beside what src/types.d.ts, session.ts and
│  interface SysMLModelLibrary {
│    /** Grasp's own problems, in the model's order: its elements', then its views', then its relati
│    validate(model: Model): Problem[];
│    /** The diagnostics of the specification's rules, sorted by rule and then by qualified name. */
│    validateSpec(model: Model): Diagnostic[];
│    /** The names of the specification's rules the library checks: 15 of the specification's 388. *
│    readonly SPEC_RULES: readonly string[];
│  }
⋮
│export interface ChecksState {
│  /** The last result, or null before the first. */
│  readonly found: Found | null;
│  /** Whether the model may have changed since `found` was worked out, or nothing has been worked o
│  readonly stale: boolean;
⋮
│export interface ChecksOptions {
│  /**
│   * Calls `run` once, `ms` from now, and returns what calls it off. Unless given: setTimeout and c
│   * read only by the call of checksOf() that makes the session's checks.
│   */
│  later?: (run: () => void, ms: number) => () => void;
⋮
│export interface EntryAbout {
│  readonly type: 'el' | 'rel' | 'view' | 'package' | 'none';
│  readonly id: string;
│  readonly pick: readonly Picked[];
⋮

canvas/app/src/core/commands.ts:
⋮
│export interface CommandsLibrary {
│  readonly KINDS: Readonly<Record<string, {
│    /** The kind in a sentence, and what a tool is called: 'part def'. */
│    label: string;
│    /** The kinds an element of this kind may own, or false for none. */
│    contains: readonly string[] | false;
│    /** Whether it sits on its owner's border (a port, a parameter). */
│    onBorder?: boolean;
│    /** The size a new one gets. */
│    size: [number, number];
⋮
│  textName(el: { kind: string; name?: unknown }): string | null;
⋮

canvas/app/src/core/files.ts:
⋮
│export interface StateFile {
│  /** The version of the format the model is saved in: the library's, grasp/2. */
│  format: string;
│  /** The revision of the model in the file this one started from: the file that was opened. */
│  revision: string | null;
│  /** When it was saved. */
│  saved: string;
│  model: Model;
│  notes: unknown[];
│  archive: unknown[];
⋮
│export function openText(lib: SysMLModelLibrary, text: string, file: FileRef, options?: SessionOpti
│  let data: unknown;
│  try {
│    // A byte order mark that an editor put at the file's start is no part of its JSON.
│    data = JSON.parse(text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text);
│  } catch {
│    throw new Error(`${file.name} isn't a state file: it isn't JSON.`);
│  }
│  return openSession(lib, data, file, options);
⋮
│type OpenFilePicker = (options?: {
│  multiple?: boolean;
│  types?: { description?: string; accept: Record<string, string[]> }[];
⋮

canvas/app/src/core/history.ts:
⋮
│export interface ModelElement {
│  id: string;
│  kind: string;
│  name: string;
│  doc: string;
│  /** The id of the element that owns it; a definition, and a usage on the package, has none. */
│  owner?: string;
│  [field: string]: unknown;
⋮
│export interface ModelRelationship {
│  id: string;
│  kind: string;
│  from: string;
│  to: string;
│  /** A line the views don't draw (a port's typing). */
│  hidden?: boolean;
│  [field: string]: unknown;
⋮
│export interface ModelView {
│  id: string;
│  kind: string;
│  name: string;
│  doc: string;
│  x: number;
│  y: number;
│  layout: Record<string, Place>;
│  options: Record<string, unknown>;
│  [field: string]: unknown;
⋮
│export interface Model {
│  format: string;
│  revision: string | null;
│  package: { name: string; doc: string };
│  elements: ModelElement[];
│  relationships: ModelRelationship[];
│  views: ModelView[];
⋮
│export interface Touched {
│  elements: string[];
│  relationships: string[];
│  views: string[];
⋮
│export interface Told {
│  /**
│   * What happened: a change made through edit(); a step taken back; a step made again; or the end 
│   * changes, which changes nothing in the model, only the steps (the run became one step, or none)
│   */
│  by: 'edit' | 'undo' | 'redo' | 'end';
│  /** What it touched. Empty lists when it touched none of the three (a change to the package, the 
│  touched: Touched;
│  /**
│   * Whether it altered which elements, relationships and views there are, or their order, kinds, o
⋮
│export interface LogEntry {
│  at: string;
│  text: string;
│  key?: string;
⋮
│export interface History {
│  /**
│   * The model, the Proxy of itself. Read it anywhere; write it only inside a change given to edit(
│   * a whole new model in its place, which is then one undo step; outside a change that is refused.
│   */
│  model: Model;
│  /** The undo steps, newest last. */
│  readonly steps: readonly Step[];
│  /** The steps Undo took back, the next for Redo last. */
│  readonly undone: readonly Step[];
⋮
│export interface HistoryOptions {
│  /** The log to start from: the one the file carried. */
│  changes?: readonly LogEntry[];
│  /** The time, as the log's entries carry it. The tests give their own clock. */
│  now?: () => string;
│  /**
│   * What is done with a mistake in the page's code: a write to the model outside edit(), a change 
│   * nothing yet changed the model, a listener that threw. Unless given, the mistake is thrown as a
│   * once what the page is doing now is done, so the page goes on while the console, and the tests,
│   */
⋮
│type ListName = (typeof LISTS)[number];
│type Key = string | number | symbol;
│/** An object or an array of the model, read and written by key. */
│type Bag = Record<Key, unknown>;
⋮
│type Home =
⋮
│interface Notes {
│  objects: Map<object, Map<Key, KeyNote>>;
│  orders: Map<object, string[]>;
│  lists: Map<unknown[], unknown[]>;
│  replaced: Model | null;
⋮
│interface Recorded {
│  what: string;
│  key: string | null;
│  touched: Touched;
│  notes: Notes;
│  log: string;
│  logKey: string | null;
│  /** The number of the state the model is in after it (mark). */
│  state: number;
│  /** While Undo has taken it back: what its keys and lists held just before, which Redo puts back.
⋮
│interface Capture {
│  elements: Map<string, string>;
│  relationships: Map<string, string>;
│  views: Map<string, string>;
│  places: Map<string, Map<string, string>>;
│  order: Record<ListName, string[]>;
│  rest: string;
⋮
│export function createHistory(model: Model, options: HistoryOptions = {}): History {
│  const now = options.now ?? (() => new Date().toISOString());
│  const report = options.mistake ?? throwLater;
│
│  // ---- The model keeps a note of every write made to it.
│  //
│  // Every object and array in the model is a Proxy of itself: its target is the plain object, whic
│  // Proxies as its children, so whatever is read from the model is a Proxy, and reads go straight 
│  // writes are trapped: before a key of an object changes, or is deleted, the object, the key and 
│  // are noted (the first time in a change); before an array changes, a copy of its items is. So ed
⋮
│  const TRAPS: ProxyHandler<object> = {
│    set(t, k, v) { noteWrite(t, k, false); (t as Bag)[k] = track(v, homeIn(t, k)); return true; },
│    deleteProperty(t, k) { noteWrite(t, k, true); return delete (t as Bag)[k]; },
│    defineProperty(t, k, d) {
│      noteWrite(t, k, false);
│      return Reflect.defineProperty(t, k, 'value' in d ? Object.assign({}, d, { value: track(d.valu
│    },
⋮

canvas/app/src/core/probe.ts:
⋮
│export type ProbeLineId = (typeof PROBE_LINES)[number]['id'];
│
⋮
│export type ProbeState = 'pending' | 'yes' | 'no' | 'told';
│
⋮
│export interface FolderHandle {
│  readonly name: string;
│  /** The browser's answer without asking the person: 'granted', 'prompt' or 'denied'. */
│  queryPermission?: (how: { mode: 'readwrite' }) => Promise<string>;
⋮
│export interface FolderRecord {
│  readonly handle: FolderHandle;
│  /** The folder's name, as its handle gave it when it was picked. */
│  readonly name: string;
│  /** When it was remembered: ProbeEnv.date() then. */
│  readonly at: string;
│  /** The page load it was remembered in: ProbeEnv.load then. */
│  readonly load: string;
⋮
│export interface ProbeEnv {
│  /** navigator.userAgent. */
│  readonly userAgent: string;
│  /** window.isSecureContext. */
│  readonly secure: boolean;
│  /** Whether window.showOpenFilePicker and window.showSaveFilePicker are functions. */
│  readonly openPicker: boolean;
│  readonly savePicker: boolean;
│  /** window.showDirectoryPicker, bound to the window, which asks the person for a folder; null whe
│  readonly pickFolder: (() => Promise<FolderHandle>) | null;
⋮

canvas/app/src/core/selection.ts:
⋮
│export type PickedType = 'el' | 'rel' | 'view';
│
⋮
│export interface Picked {
│  readonly type: PickedType;
│  readonly id: string;
⋮
│export interface Hit {
│  /** The id of the view the plane shows. */
│  readonly view: string;
│  /** The ground, a node's element, or a line's relationship. */
│  readonly type: 'ground' | 'el' | 'rel';
│  /** The element's or the relationship's id; null for the ground. */
│  readonly id: string | null;
│  /** Where the pointer was, in the view's own units from the view's origin (React Flow's screenToF
│  readonly at: { readonly x: number; readonly y: number };
│  /** Whether Ctrl or ⌘ was held: the click adds to what is picked, or lets one thing go. */
⋮
│export interface Selection {
│  readonly items: readonly Picked[];
│  /** The last picked, `items[0]`, or null: what Details shows. */
│  readonly last: Picked | null;
│  readonly view: string | null;
│  /**
│   * Whether the element, relationship or view of this id is picked. It does not search the list: a
│   * every node and line it draws, after every projection.
│   */
│  has(type: PickedType, id: string): boolean;
⋮

canvas/app/src/core/session.ts:
⋮
│declare global {
│  // The part of the model library that opening and saving use, beside what src/types.d.ts declares
│  interface SysMLModelLibrary {
│    /** The version of the saved format that the library reads and writes: 2 for grasp/2. */
│    readonly VERSION: number;
│    /** The version a saved model names; the library's own when it names none. */
│    versionOf(raw: unknown): number;
│    /** A saved model, of this version or an older one, read into the current version: the model th
│    normalize(raw: unknown): Model;
│  }
⋮
│export type SessionOptions = Omit<HistoryOptions, 'changes'>;
│
│export interface Session {
│  /** The model library the file was read with, which also names the format it is saved in. */
│  readonly lib: SysMLModelLibrary;
│  /** The file's name, which the top bar shows and a download is saved under. */
│  readonly name: string;
│  /** The file's handle, when it came through the picker: Save writes back through it. Null otherwi
│  readonly handle: FileSystemFileHandle | null;
│  /** The history: every change to the model goes through its edit(). */
│  readonly history: History;
│  /** The model, which is the history's: the Proxy of itself. */
⋮

canvas/app/src/panels/SidePanel.tsx:
⋮
│export interface SidePanelProps {
│  /** The data-testid of the panel's root (helpers.mjs, TESTIDS): 'explorer', 'tools', 'validation'
│  testId: string;
│  /** The panel's title, in its header row: the name its strip shows. */
│  title: string;
│  /** The panel's own, under the header row. */
│  children?: ReactNode;
⋮

canvas/app/src/panels/explorerRows.ts:
⋮
│declare global {
│  // The part of the model library that the Explorer's rows read, beside what the core declares of 
│  interface SysMLModelLibrary {
│    /**
│     * The rows of a browser view, in order: each element with what it owns under it, then the rela
│     * in it; the package's relationships last. A view whose options are `{ roots: null, collapsed:
│     * whole package with nothing folded: every element once, and every relationship both of whose 
│     * of the model.
│     */
│    browserRows(model: Model, view: { options: { roots: null; collapsed: string[] } }): LibraryRow[
│    /**
│     * A relationship in words: 'DevHost specializes Host', 'hosts defined by Host', 'connection mo
⋮
│export interface RowWords {
│  readonly kw: string;
│  readonly name: string;
│  readonly type: string;
⋮
│export interface ExplorerRows {
│  readonly items: readonly RowItem[];
│  readonly unfolded: readonly string[];
│  readonly built: number;
│  /**
│   * The ids of the rows that are shown, in the tree's order: the package's row, and what is inside
│   * shown row, its "Show more" row last among them. A new array at each call.
│   */
│  shown(): string[];
│  wordsOf(row: string): RowWords | null;
⋮

canvas/app/src/panels/fieldHooks.ts:
⋮
│export type GroupName = (typeof GROUP_NAMES)[number];
│
⋮
│export type FieldValue = string | number | boolean;
│
⋮
│export interface FieldRow {
│  readonly row: 'field';
│  /** The field's name in FIELDS: the widget's data-testid is `field-<field>`. */
│  readonly field: string;
│  /** FIELD_LOOKS[field].label. */
│  readonly label: string;
│  /** The row's type, never 'list'. */
│  readonly type: Exclude<FieldType, 'list'>;
│  /**
│   * What the field holds, by its hook's value() or as the item's property. A string or text: the s
⋮

canvas/app/src/plane/NotDrawnYet.tsx:
⋮
│export interface NotDrawnYetProps {
│  /** The first sentence, from the adapter's notDrawnText: "A sequence view is not drawn yet." */
│  text: string;
⋮

canvas/app/src/plane/nodes/BoxNode.tsx:
⋮
│export type BoxNodeProps = NodeProps<Node<BoxData, Shape>>;
│
⋮

canvas/app/src/plane/nodes/PortNode.tsx:
⋮
│export type PortNodeProps = NodeProps<Node<BorderData, Shape>>;
│
⋮

canvas/app/src/plane/nodes/SmallNode.tsx:
⋮
│export type SmallNodeProps = NodeProps<Node<SmallData, Shape>>;
│
⋮

canvas/app/src/plane/viewStore.ts:
⋮
│export interface ViewSnapshot {
│  readonly nodes: PlaneNode[];
│  readonly edges: PlaneEdge[];
│  /** Whether the plane is far: its zoom is under FAR. */
│  readonly far: boolean;
⋮

canvas/app/src/shell/About.tsx:
⋮
│export interface AboutProps {
│  /** Whether the panel is shown. */
│  open: boolean;
│  /** Called when the person closes it. */
│  onClose: () => void;
⋮

canvas/app/src/shell/App.tsx:
⋮
│export interface GraspGlobal {
│  /** The open file, or null. */
│  readonly session: Session | null;
│  /** The open file's view stores by view id (those made so far), or null with no file. */
│  readonly views: ReadonlyMap<string, ViewStore> | null;
│  /** The open file's selection, or null with no file. */
│  readonly selection: Selection | null;
⋮

canvas/app/src/shell/EmptyCard.tsx:
⋮
│export interface EmptyCardProps {
│  /**
│   * The open file, or null when none is: its name, how many views it has, and how many of them are
│   * have no tab anywhere. A view that is not closed floats over the editor, or the card would not 
│   */
│  file: { name: string; views: number; closed: number } | null;
│  /** Opens a file, as the bar's Open does. */
│  onOpen: () => void;
│  /** Gives the closed views their tabs again, in the editor. */
│  onShowViews: () => void;
⋮

canvas/app/src/shell/Toasts.tsx:
⋮
│export interface ToastsProps {
│  /** The open file, or null. */
│  session: Session | null;
⋮

canvas/app/src/shell/TopBar.tsx:
⋮
│export type ActionId = (typeof ACTIONS)[number]['id'];
⋮
│export interface TopBarProps {
│  /** The open file, or null: its name shows in data-testid "file-name", then a dot while `session.
│  session: Session | null;
│  /** Called by Open. */
│  onOpen: () => void;
│  /** Called by Save and by Ctrl or ⌘ + S (step 7). */
│  onSave: () => void;
│  /** Called by About: App opens the About panel. */
│  onAbout: () => void;
⋮

canvas/app/src/shell/dockContext.ts:
⋮
│export interface DockState {
│  /** The open file, or null before one is opened. */
│  session: Session | null;
│  /** Opens a file, as the bar's Open does. */
│  onOpen: () => void;
│  /** Gives every view of the open file that has no tab its tab again, in the editor. */
│  showViews: () => void;
│  /** How many of the session's views have no tab anywhere, in the editor or floating over it. */
│  closed: number;
│  /**
⋮

canvas/app/src/types.d.ts:
⋮
│interface SysMLModelLibrary {
│  /** The saved format's name, 'grasp/2'. */
│  readonly FORMAT: string;
⋮

canvas/app/test/core.mjs:
⋮
│export function loadCore() {
│  core ??= bundle();
│  return core;
⋮
│async function bundlePlanes() {
│  const result = await esbuild.build({
│    absWorkingDir: ROOT,
│    stdin: {
│      contents: "export * from './core/index'; export * from './plane/viewStore';",
│      resolveDir: path.join(ROOT, 'canvas', 'app', 'src'),
│      sourcefile: 'planes-entry.ts',
│      loader: 'ts',
│    },
│    bundle: true,
⋮
│export function loadWith(...files) {
│  const key = files.join('\n');
│  if (!bundles.has(key)) bundles.set(key, bundleWith(files));
│  return bundles.get(key);
│}
│async function bundleWith(files) {
│  const result = await esbuild.build({
│    absWorkingDir: ROOT,
│    stdin: {
│      contents: ["export * from './core/index';", ...files.map((file) => `export * from './${file}'
│      resolveDir: path.join(ROOT, 'canvas', 'app', 'src'),
│      sourcefile: 'with-entry.ts',
│      loader: 'ts',
│    },
│    bundle: true,
⋮
│export const readJSON = (file) => JSON.parse(readText(file));
⋮

canvas/app/test/files.test.mjs:
⋮
│function fakeDocument() {
│  const body = { children: [] };
│  const made = [];
│  const document = {
│    body,
│    made,
│    createElement(tag) {
│      const listeners = new Map();
│      const node = {
│        tag,
│        attributes: {},
│        clicks: 0,
│        setAttribute(name, value) { node.attributes[name] = String(value); },
│        addEventListener(type, listener) { listeners.set(type, [...(listeners.get(type) ?? []), lis
│        /** Tells the node's listeners of an event, as the browser does. */
│        fire(type) { (listeners.get(type) ?? []).forEach((listener) => listener({ type, target: nod
│        click() { node.clicks += 1; if (node.onclick) node.onclick(); },
│        remove() { body.children = body.children.filter((child) => child !== node); },
⋮
│  body.appendChild = (node) => { body.children.push(node); return node; };
⋮
│describe('asking the browser for the file, and writing it', () => {
│  test('where the browser has the picker, openFile asks it, and the session keeps the file\'s handl
│    const { openFile, hasPicker } = await loadCore();
│    const handle = fakeHandle('stronghold-proof.json', readText(EXAMPLE));
│    const asked = [];
│    const document = fakeDocument();
│    const window = { showOpenFilePicker: async (options) => { asked.push(options); return [handle];
│    const session = await withGlobals({ window, document }, async () => {
│      assert.equal(hasPicker(), true);
│      return openFile(lib);
⋮
│  test('saveFile downloads the file under its name, when it came through a file input', async () =>
│    const { openText, saveFile } = await loadCore();
│    const document = fakeDocument();
│    const later = [];
│    const session = openText(lib, readText(EXAMPLE), { name: 'stronghold-proof.json' }, { now: cloc
│    session.history.edit(() => { Object.assign(session.model.views[0].layout.Host, { w: 400, h: 160
│    let link = null;
│    let text = null;
│    await withGlobals({ window: {}, document, setTimeout: (fn, ms) => { later.push({ fn, ms }); ret
│      assert.equal(await saveFile(session), 'download');
│      [link] = document.made;
│      text = await resolveObjectURL(link.href).text();
⋮

canvas/app/test/helpers.mjs:
⋮
│export const byTestId = (name) => `[data-testid="${name}"]`;
│
⋮
│export async function openPage(browser, { url = PAGE_URL, picker = true, dialog = (d) => d.accept()
│  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
│  const page = await context.newPage();
│  const problems = [];
│  const requests = [];
│  const dialogs = [];
│  logs.set(page, problems);
│  page.on('console', (message) => {
│    if (message.type() === 'error' || message.type() === 'warning') problems.push(`console ${messag
│  });
⋮
│export const stateFileAt = (file) => ({ name: path.basename(file), buffer: fs.readFileSync(file) })
│export const stateFileOf = (name, state) => ({ name, buffer: Buffer.from(JSON.stringify(state)) });
│
⋮
│export async function openStateFile(page, file) {
│  assert.ok(await page.evaluate(() => !('showOpenFilePicker' in window)),
│    'openStateFile needs a page opened with { picker: false }: a test cannot answer the browser\'s 
│  const open = page.locator(byTestId(TESTIDS.open));
│  const buttons = await open.count();
│  assert.ok(buttons === 1, buttons
│    ? `The page has ${buttons} Open buttons (data-testid "${TESTIDS.open}"), and only the bar's car
│    : `The page has no Open button (data-testid "${TESTIDS.open}"), so ${file.name} cannot be opene
│  let chooser = null;
│  page.waitForEvent('filechooser', { timeout: WAIT }).then((asked) => { chooser = asked; }, () => {
⋮
│export const tabTitle = (view) => `${view.name} : ${view.kind}`;
⋮
│export async function untilDrawn(page, view) {
│  const placed = Object.keys(view.layout).length;
│  await soon(page, () => page.evaluate((selector) => !!document.querySelector(selector), planeOf(vi
│    `No plane shows ${view.name} (data-testid "${TESTIDS.plane}", data-view "${view.id}"): its tab 
│  const count = () => page.evaluate((selector) => document.querySelectorAll(selector).length, `${pl
│  for (let nodes = await count(); nodes < placed;) {
│    const before = nodes;
│    ({ nodes } = await soon(page, async () => { const now = await count(); return now === before ? 
│      `The plane of ${view.name} draws ${before} nodes for the ${placed} elements the view places.`
│  }
⋮
│export async function selectBox(page, view, id) {
│  const box = await boxOf(page, view.id, id);
│  assert.ok(box, `The plane of ${view.name} draws no node for ${id}.`);
│  await page.mouse.click(box.x + 24 * box.zoom, box.y + 14 * box.zoom);
│  return soon(page, async () => { const now = await boxOf(page, view.id, id); return now && now.sel
│    `A click on ${id} does not select it: its node has no class "selected".`);
⋮
│export function measure(planned, limit) {
│  const samples = [];
│  const over = () => samples.filter((s) => s.total >= limit).length;
│  return {
│    samples,
│    add(sample) { samples.push(sample); },
│    get settled() { return samples.length >= planned || over() > planned / 2 || samples.length - ov
│    get median() {
│      const sorted = samples.map((s) => s.total).sort((a, b) => a - b);
│      const middle = sorted.length >> 1;
│      return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
│    },
│    toString() {
│      const ms = (v) => v.toFixed(1);
│      return samples.map((s) => (s.script === undefined ? ms(s.total) : `${ms(s.total)} (${ms(s.scr
⋮
│export const withInit = (browser, script) => ({
│  newContext: async (options) => { const context = await browser.newContext(options); await context
⋮
│export async function showSide(page, name) {
│  const testid = SIDES[name];
│  assert.ok(testid, `No side panel is named ${name}. The side panels: ${Object.keys(SIDES).join(', 
│  const shown = () => page.evaluate((selector) => {
│    const el = document.querySelector(selector);
│    return !!el && el.getBoundingClientRect().width >= 1 && el.getBoundingClientRect().height >= 1;
│  }, byTestId(testid));
│  if (await shown()) return;
│  await page.getByRole('tab', { name, exact: true }).click();
│  await soon(page, shown, `A click on ${name} on its strip did not show the ${name} panel (data-tes
⋮
│export const untilShown = (page, type, id, how) => soon(page, async () => (await shownIn(page)) ===
⋮

canvas/app/test/history.test.mjs:
⋮
│describe('the history', () => {
│  test('a change is one step, undone and redone', async () => {
│    const { history, told } = await open();
│    const start = json(history);
│    assert.equal(history.steps.length, 0, 'a history starts with no step');
│    assert.equal(history.undo(), null, 'so there is nothing to take back');
│    assert.equal(history.redo(), null, 'and nothing to make again');
│    assert.deepEqual(told, [], 'and nobody is told');
│
│    assert.deepEqual(rename(history, 'Host', 'Hosting'), touches(['Host'], [], []), 'edit returns w
⋮
│  test('a mistake is thrown as an error of its own, once what the page is doing now is done', async
│    const { createHistory } = await loadCore();
│    const history = createHistory(lib.normalize(readJSON(EXAMPLE).model));
│    const later = [];
│    const setTimeout = globalThis.setTimeout;
│    globalThis.setTimeout = (fn, ms) => { later.push({ fn, ms }); return 0; };
│    try {
│      el(history, 'Host').doc = 'written behind edit()';
│      assert.deepEqual(rename(history, 'App', 'Application'), touches(['App'], [], []), 'the change
│    } finally {
⋮

canvas/app/test/scale.test.mjs:
⋮
│async function showView(page, view) {
│  const tab = await viewTab(page, view);
│  if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
│  await untilDrawn(page, view);
⋮

canvas/app/test/selection-core.test.mjs:
⋮
│const keys = (items) => items.map(key);
⋮

canvas/dist/app.js:
│"use strict";(()=>{var __create=Object.create;var __defProp=Object.defineProperty;var __getOwnPropD
⋮

canvas/dist/model-lib.js:
⋮
│(function (root) {
│  'use strict';
│  const lib = root.SysMLModelLib;   // what the scripts register for the ones after them; metamodel
│  const { METAMODEL } = lib;
│
│  // The kinds stand on the metamodel's classes. A class conforms to another when it is that class 
│  // directly or through others.
│  function conforms(metaclass, general) {
│    if (metaclass === general) return true;
│    const c = METAMODEL[metaclass];
⋮
│  const isObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
⋮
│  function textName(el) {
│    const kind = KINDS[el.kind];
│    return kind && kind.fields.indexOf('name') >= 0 ? str(el.name).trim() : null;
⋮
│  function childrenOf(model, id) {
│    const look = lookOf(model);
│    if (look) return look.children(id).slice();
│    return model.elements.filter((e) => (id === null || id === undefined ? e.owner === undefined : 
⋮
│(function (root) {
│  'use strict';
│  const lib = root.SysMLModelLib;
│  const {
│    KINDS, RELATIONSHIPS, VIEW_KINDS, MULTIPLICITY, textName, normalize, relIndex, reading, idsOf, 
│    childrenOf, typingOf, commonOwner, quote, shown, qualified, featurePath, nameable, describe, de
│    inheritedFeature, BODY, noteRecords, noteStatements, commentLines
│  } = lib;
│
│  // The notes and the archived notes are written together, at the end of the package (noteRecords,
⋮
│  function textOf(model, notes, archive) {
│    const ids = idsOf(model);
│    const rels = relIndex(model);
│    const noteList = noteRecords(notes, archive);
│    const out = [];
│    const imports = new Set();
│    const line = (depth, text) => out.push('    '.repeat(depth) + text);
│    const comment = (depth, head, text) => commentLines(depth, head, text).forEach((l) => out.push(
│    const noteText = (n) => n.text + (n.response.trim() ? '\nClaude: ' + n.response.trim() : '');
│    const listsBy = (list, key) => {
⋮
│    const helpers = {
│      ids: ids, line: line, comment: comment, noteText: noteText, quote: quote, featurePath: featur
│      notesOn: (id) => (notesBy.get(id) || []).slice(),
│      // A note in its standard forms (noteStatements), written at depth through this object's own 
│      // lines land where its other lines do; about null writes it inside the body it is in. Asks f
│      note: function (depth, n, about, text) { noteStatements(n, about, text).forEach((s) => this.l
│      needImport: (qualifiedName) => imports.add(qualifiedName),
│      headOf: headOf, declaredIn: declaredIn, exposesOf: exposesOf,
│      typingOf: (el) => typingOf(model, el),
│      childrenOf: (id) => childrenOf(model, id),
⋮

canvas/dist/vendor.js:
│"use strict";(()=>{var Q9=Object.create;var aS=Object.defineProperty;var J9=Object.getOwnPropertyDe
│`+PS+e}var wS=!1;function SS(e,t){if(!e||wS)return"";wS=!0;var o=Error.prepareStackTrace;Error.prep
│`),i=r.stack.split(`
│`),s=n.length-1,a=i.length-1;1<=s&&0<=a&&n[s]!==i[a];)a--;for(;1<=s&&0<=a;s--,a--)if(n[s]!==i[a]){i
│`+n[s].replace(" at new "," at ");return e.displayName&&l.includes("<anonymous>")&&(l=l.replace("<a
│`).replace(VY,"")}function Yy(e,t,o){if(t=MN(t),MN(e)!==t&&o)throw Error(Se(425))}function vb(){}va
│Error generating stack: `+i.message+`
│`+i.stack}return{value:e,source:t,stack:n,digest:null}}function BS(e,t,o){return{value:e,source:nul
⋮
│+`).split(`
│`)),c=p.reduce((d,u)=>d.concat(...u),[]);return[p,c]}return[[],[]]},[e]);return(0,ae.useEffect)(()=
│        M${C.x},${C.y}h${C.width}v${C.height}h${-C.width}z`,fillRule:"evenodd",pointerEvents:"none"
│
│  npm install dockview-enterprise
│  import 'dockview-enterprise'; // self-registers every enterprise module
│`:`dockview: ${i}, but it is not registered.`}function K5(e,t){let o=`${e}|${(t===void 0?[]:[].conc
⋮
│`,Ppe=Xo.forwardRef(function(t,o){let r=H({props:t,name:"MuiTouchRipple"}),{center:n=!1,classes:i={
│  0% {
│    transform: rotate(0deg);
│  }
│
│  100% {
│    transform: rotate(360deg);
│  }
⋮
│      `:null,$pe=typeof xI!="string"?Vr`
│        animation: ${xI} 1.4s ease-in-out infinite;
│      `:null,Gpe=e=>{let{classes:t,variant:o,color:r,disableShrink:n}=e,i={root:["root",o,`color${G
│`&&(x.value+=" ");let S=P.boxSizing,C=JT(P.paddingBottom)+JT(P.paddingTop),_=JT(P.borderBottomWidth
│`),S=x.selectionStart===T;P&&S&&x.setSelectionRange(T,T),r&&r(v)},ref:d,rows:i,style:s,...l}),(0,qg
│  0% {
│    left: -35%;
│    right: 100%;
│  }
│
│  60% {
│    left: 100%;
│    right: -90%;
│  }
│
⋮
│      `:null,_ge=e=>{let{classes:t,variant:o,color:r}=e,n={root:["root",`color${G(r)}`,o],dashed:["
│  0% {
│    opacity: 1;
│  }
│
│  50% {
│    opacity: 0.4;
│  }
│
│  100% {
⋮
│      `:null,obe=A("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(e,t)=>{let{ownerState:
│                90deg,
│                transparent,
│                ${(e.vars||e).palette.action.hover},
│                transparent
│              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,rig
│    ${e.palette.mode==="light"?e.lighten(e.alpha(e.palette.divider,1),.88):e.darken(e.alpha(e.palet
⋮

canvas/dist/vendor/elkjs/elk.bundled.js:
⋮
│var PromisedWorker = /*#__PURE__*/function () {
│  function PromisedWorker(worker) {
│    var _this2 = this;
│    _classCallCheck(this, PromisedWorker);
│    if (worker === undefined) {
│      throw new Error("Missing mandatory parameter 'worker'.");
│    }
│    this.resolvers = {};
│    this.worker = worker;
│    this.worker.onmessage = function (answer) {
⋮
│  return _createClass(PromisedWorker, [{
│    key: "postMessage",
│    value: function postMessage(msg) {
│      var id = this.id || 0;
│      this.id = id + 1;
│      msg.id = id;
│      var self = this;
│      return new Promise(function (resolve, reject) {
│        // prepare the resolver
│        self.resolvers[id] = function (err, res) {
│          if (err) {
│            self.convertGwtStyleError(err);
⋮
│},{}],2:[function(require,module,exports){
│(function (global){(function (){
│'use strict';
│
│// --------------    FAKE ELEMENTS GWT ASSUMES EXIST   -------------- 
│var $wnd;
│if (typeof window !== 'undefined')
│    $wnd = window
│else if (typeof global !== 'undefined')
│    $wnd = global // nodejs
│else if (typeof self !== 'undefined')
⋮
│function NJd(){LJd();function h(f){var g=this;this.dispatch=function(a){var b=a.data;switch(b.cmd){
│function j(b){var c=this;this.dispatcher=new h({postMessage:function(a){c.onmessage({data:a})}});th
⋮
│var dwe='object',ewe='boolean',fwe='number',gwe='string',hwe='function',iwe=2147483647,jwe='java.la
⋮

canvas/src/core/lib/model.js:
⋮
│(function (root) {
│  'use strict';
│  const lib = root.SysMLModelLib;   // what the scripts register for the ones after them; metamodel
│  const { METAMODEL } = lib;
│
│  // The kinds stand on the metamodel's classes. A class conforms to another when it is that class 
│  // directly or through others.
│  function conforms(metaclass, general) {
│    if (metaclass === general) return true;
│    const c = METAMODEL[metaclass];
⋮
│  function textName(el) {
│    const kind = KINDS[el.kind];
│    return kind && kind.fields.indexOf('name') >= 0 ? str(el.name).trim() : null;
⋮

canvas/src/core/page/changes.js:
⋮
│(function (C) {
│  'use strict';
│  const S = C.state;
│  const { M, PAUSE, HISTORY, undoButton, now, say, editable, viewById, render, applyMarks, check } 
│
│  const LISTS = ['elements', 'relationships', 'views'];
│  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
│
│  // ---- The model keeps a note of every write made to it.
│  //
⋮
│  const TRAPS = {
│    set: function (t, k, v) { noteWrite(t, k); t[k] = track(v, homeIn(t, k)); return true; },
│    deleteProperty: function (t, k) { noteWrite(t, k); return delete t[k]; },
│    defineProperty: function (t, k, d) {
│      noteWrite(t, k);
│      return Reflect.defineProperty(t, k, 'value' in d ? Object.assign({}, d, { value: track(d.valu
│    }
⋮

canvas/src/core/page/state.js:
⋮
│(function (C) {
│  'use strict';
│  const S = C.state;
│  const { M, status, palette, str } = C;
│
│  // ---- State.
│
│  const saved = readSaved();     // what this file holds: the model and the notes as last saved
│  // What the page shows and does now, which the scripts share as S.name. The scripts it belongs to
│  // the camera (camera.js), the pause before a save (changes.js), the palette's view kind (tools.j
⋮
│  function readJSON(id) {
│    const block = document.getElementById(id);
│    try { return block ? JSON.parse(block.textContent) : null; } catch (error) { return null; }
⋮

canvas/src/grid/page.js:
⋮
│(function (C) {
│  'use strict';
│  const S = C.state;
│  const {
│    M, ACTIONS, VIEW_PANELS, $, say, editable, f, plural, byNumber, viewById, frameAround, node, te
│    onScreen, marksFor, edit, renderInspector, selectedView
│  } = C;
│
│  // ---- The grid view: a table with a row per shown element, or a matrix of the shown elements ag
│  // with the relationship kinds between them in the cells. Nothing is placed or moved by hand: the
⋮
│  ACTIONS.sort = function (hit) {
│    const view = viewById(hit.view);
│    if (!view || view.kind !== 'GridView' || M.GRID_COLUMNS.indexOf(hit.id) < 0) return;
│    if (!editable()) { say('The order of the rows is part of the view, which can\'t be changed here
│    const o = M.gridOptions(view);
│    const next = o.sort === hit.id ? '-' + hit.id : o.sort === '-' + hit.id ? null : hit.id;
│    const what = next === null ? 'Put the rows of ' + M.describeView(S.model, view) + ' back in the
│      : 'Sorted the rows of ' + M.describeView(S.model, view) + ' by ' + hit.id + (next.charAt(0) =
│    edit(() => {
│      view.options.sort = next;
⋮

canvas/test/helpers.mjs:
⋮
│export async function openCanvas(browser, { shared = false, seed = {}, init = null, file = PAGE } =
│  assertPageExists(file);
│  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
│  const errors = [];
│  page.on('pageerror', (error) => errors.push(error.message));
│  page.on('dialog', (dialog) => dialog.accept());
│  if (shared) await page.addInitScript(installFakeClaude, seed);
│  if (shared && init) await page.addInitScript(init);
│  await page.goto(pathToFileURL(file).href);
│  await page.waitForSelector('#canvas svg#drawing', { state: 'attached', timeout: WAIT });
⋮
│export async function placeElement(page, tool, point) {
│  const before = await elementIds(page);
│  await page.click(`.palette button[data-tool="${tool}"]`);
│  const { x, y } = point ?? await emptyPoint(page);
│  await page.mouse.click(x, y);
│  await until(page, (count) => document.querySelectorAll('g[data-el]').length > count, before.lengt
│  const added = (await elementIds(page)).filter((id) => !before.includes(id));
│  assert.equal(added.length, 1, `placing a ${tool} added one element, not ${JSON.stringify(added)}`
│  return added[0];
⋮
│export function measure(planned, limit) {
│  const samples = [];
│  const over = () => samples.filter((s) => s.total >= limit).length;
│  return {
│    samples,
│    add(sample) { samples.push(sample); },
│    get settled() { return samples.length >= planned || over() > planned / 2 || samples.length - ov
│    get median() {
│      const sorted = samples.map((s) => s.total).sort((a, b) => a - b);
│      const middle = sorted.length >> 1;
│      return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
│    },
│    toString() {
│      const ms = (v) => v.toFixed(1);
│      return samples.map((s) => (s.script === undefined ? ms(s.total) : `${ms(s.total)} (${ms(s.scr
⋮

canvas/test/scale-model.mjs:
⋮
│export function scaleState(count) {
│  return { model: scaleModel(count), notes: [], archive: [], changes: [] };
⋮

canvas/test/store-dump.test.mjs:
⋮
│const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
⋮

plan/swarm/session-24-scratch/probe-10/ref.mjs:
⋮
│export function make(app, lib) {
│  const LOOKS = app.FIELD_LOOKS, ORDER = app.GROUP_ORDER, GROUPS = app.GROUP_NAMES;
│  const UNNAMED = app.UNNAMED, NOTHING = app.NOTHING;
│  const named = (el) => lib.textName(el) || UNNAMED;
│  const whatOf = (model, type, item) => (type === 'el' ? lib.describe(model, item) : type === 'rel'
│  const general = (verb, noun) => ({
│    none: 'nothing: take the line away',
│    shown: (x) => !!lib.firstGeneral(x.model, x.item),
│    value: (x) => { const r = lib.firstGeneral(x.model, x.item); return r ? r.to : ''; },
│    write: (x, v) => { const r = lib.firstGeneral(x.model, x.item); if (!r) return; if (!v) { x.mod
⋮
│  const find = (model, p) => (p.type === 'el' ? lib.idsOf(model).get(p.id) : p.type === 'rel' ? mod
⋮
│  function formOf(session, picked, viewId) {
│    const model = session.model;
│    return lib.reading(model, () => {
│      const item = find(model, picked);
│      if (!item) return null;
│      const d = lib.detailsOf(model, picked.type, item);
│      const kind = viewKindFor(model, picked.id, viewId);
│      const ok = (f) => has(model, picked.type, item, f, kind);
│      const rowOf = (r) => (r.field ? (ok(r.field) ? fieldRow(model, picked.type, item, r.field) : 
│      const placed = new Set(d.core.concat(d.advanced).filter((r) => r.field).map((r) => r.field));
│      const own = (g) => ORDER[g].filter((f) => !placed.has(f) && ok(f));
│      const main = d.core.map(rowOf).filter(Boolean).concat(own('main').filter((f) => f !== 'doc').
⋮

plan/swarm/session-24-scratch/probe-rd-10/ref.mjs:
⋮
│export function make(app) {
│  const { FIELD_LOOKS, GROUP_ORDER } = app;
│  const tableOf = (lib, type) => type === 'el' ? lib.KINDS : type === 'rel' ? lib.RELATIONSHIPS : l
│  const listOf = (model, type) => type === 'el' ? model.elements : type === 'rel' ? model.relations
│  const find = (model, p) => listOf(model, p.type).find((x) => x.id === p.id) || null;
│  const nameOf = (lib, el) => lib.textName(el) || UNNAMED;
│  const whatOf = (lib, model, type, item) => type === 'el' ? lib.describe(model, item) : type === '
│  const general = (verb, noun) => ({
│    none: 'nothing: take the line away',
│    shown: (x) => !!x.lib.firstGeneral(x.model, x.item),
⋮

plan/swarm/session-24-scratch/probe-rd-12/ts/t.ts:
⋮
│interface Env { readonly wasm: { instantiate(bytes: Uint8Array): Promise<{ instance: { exports: Rec
│interface Env2 { readonly wasm: { instantiate(bytes: Uint8Array<ArrayBuffer>): Promise<{ instance: 
⋮

plan/swarm/session-25-wip/10-impl-bar/canvas/app/src/shell/TopBar.tsx:
⋮
│export type ActionId = (typeof ACTIONS)[number]['id'];
⋮
│export interface TopBarProps {
│  /** The open file, or null: its name shows in data-testid "file-name", then a dot while `session.
│  session: Session | null;
│  /** Called by Open. */
│  onOpen: () => void;
│  /** Called by Save and by Ctrl or ⌘ + S (step 7). */
│  onSave: () => void;
│  /** Called by About (step 12): App opens the About panel. Until step 12 the button is disabled an
│  onAbout: () => void;
⋮

plan/swarm/session-25-wip/10-impl-hooks/canvas/app/src/panels/fieldHooks.ts:
⋮
│export type FieldValue = string | number | boolean;
│
⋮
│export interface FieldRow {
│  readonly row: 'field';
│  /** The field's name in FIELDS: the widget's data-testid is `field-<field>`. */
│  readonly field: string;
│  /** FIELD_LOOKS[field].label. */
│  readonly label: string;
│  /** The row's type, never 'list'. */
│  readonly type: Exclude<FieldType, 'list'>;
│  /**
│   * What the field holds, by its hook's value() or as the item's property. A string or text: the s
⋮

plan/swarm/session-25-wip/11-impl-commands/canvas/app/src/core/commands.ts:
⋮
│export interface CommandsLibrary {
│  readonly KINDS: Readonly<Record<string, {
│    /** The kind in a sentence, and what a tool is called: 'part def'. */
│    label: string;
│    /** The kinds an element of this kind may own, or false for none. */
│    contains: readonly string[] | false;
│    /** Whether it sits on its owner's border (a port, a parameter). */
│    onBorder?: boolean;
│    /** The size a new one gets. */
│    size: [number, number];
⋮
│  childrenOf(model: Model, id: string | null): ModelElement[];
⋮
│  textName(el: { kind: string; name?: unknown }): string | null;
⋮

plan/swarm/session-25-wip/11-impl-toasts/canvas/app/src/shell/Toasts.tsx:
⋮
│export interface ToastsProps {
│  /** The open file, or null. */
│  session: Session | null;
⋮

plan/swarm/session-25-wip/12-impl-about/canvas/app/src/shell/About.tsx:
⋮
│export interface AboutProps {
│  /** Whether the panel is shown. */
│  open: boolean;
│  /** Called when the person closes it. */
│  onClose: () => void;
⋮

plan/swarm/session-25-wip/12-impl-bar/canvas/app/src/shell/TopBar.tsx:
⋮
│export type ActionId = (typeof ACTIONS)[number]['id'];
⋮
│export interface TopBarProps {
│  /** The open file, or null: its name shows in data-testid "file-name", then a dot while `session.
│  session: Session | null;
│  /** Called by Open. */
│  onOpen: () => void;
│  /** Called by Save and by Ctrl or ⌘ + S (step 7). */
│  onSave: () => void;
│  /** Called by About: App opens the About panel. */
│  onAbout: () => void;
⋮

plan/swarm/session-25-wip/12-impl-checks/canvas/app/src/core/checks.ts:
⋮
│export interface Diagnostic {
│  /** The rule's name in the specification: 'validateNamespaceDistinguishibility'. */
│  readonly rule: string;
│  /** The metaclass the rule is on: 'Namespace'. */
│  readonly metaclass: string;
│  /** What breaks the rule: an element, a relationship, or (null) the package. */
│  readonly type: 'el' | 'rel' | null;
│  /** The element's or the relationship's id; null for the package. */
│  readonly id: string | null;
│  /** The qualified name of what breaks it. */
⋮
│declare global {
│  // The part of the model library that the checks call, beside what src/types.d.ts, session.ts and
│  interface SysMLModelLibrary {
│    /** Grasp's own problems, in the model's order: its elements', then its views', then its relati
│    validate(model: Model): Problem[];
│    /** The diagnostics of the specification's rules, sorted by rule and then by qualified name. */
│    validateSpec(model: Model): Diagnostic[];
│    /** The names of the specification's rules the library checks: 15 of the specification's 388. *
│    readonly SPEC_RULES: readonly string[];
│  }
⋮
│export interface ChecksState {
│  /** The last result, or null before the first. */
│  readonly found: Found | null;
│  /** Whether the model may have changed since `found` was worked out, or nothing has been worked o
│  readonly stale: boolean;
⋮
│export interface ChecksOptions {
│  /**
│   * Calls `run` once, `ms` from now, and returns what calls it off. Unless given: setTimeout and c
│   * read only by the call of checksOf() that makes the session's checks.
│   */
│  later?: (run: () => void, ms: number) => () => void;
⋮
│export interface EntryAbout {
│  readonly type: 'el' | 'rel' | 'view' | 'package' | 'none';
│  readonly id: string;
│  readonly pick: readonly Picked[];
⋮

plan/swarm/session-25-wip/12-impl-probe/canvas/app/src/core/probe.ts:
⋮
│export type ProbeLineId = (typeof PROBE_LINES)[number]['id'];
│
⋮
│export type ProbeState = 'pending' | 'yes' | 'no' | 'told';
│
⋮
│export interface FolderHandle {
│  readonly name: string;
│  /** The browser's answer without asking the person: 'granted', 'prompt' or 'denied'. */
│  queryPermission?: (how: { mode: 'readwrite' }) => Promise<string>;
⋮
│export interface FolderRecord {
│  readonly handle: FolderHandle;
│  /** The folder's name, as its handle gave it when it was picked. */
│  readonly name: string;
│  /** When it was remembered: ProbeEnv.date() then. */
│  readonly at: string;
│  /** The page load it was remembered in: ProbeEnv.load then. */
│  readonly load: string;
⋮
│export interface ProbeEnv {
│  /** navigator.userAgent. */
│  readonly userAgent: string;
│  /** window.isSecureContext. */
│  readonly secure: boolean;
│  /** Whether window.showOpenFilePicker and window.showSaveFilePicker are functions. */
│  readonly openPicker: boolean;
│  readonly savePicker: boolean;
│  /** window.showDirectoryPicker, bound to the window, which asks the person for a folder; null whe
│  readonly pickFolder: (() => Promise<FolderHandle>) | null;
⋮

plan/swarm/session-25-wip/probes/10-review-code/lib.mjs:
⋮
│export const log = (...a) => console.log(...a);
```
