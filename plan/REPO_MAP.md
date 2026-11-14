# Repo map

Drawn by [aider](https://aider.chat) 0.86.2 with `aider --show-repo-map` on November 14, 2026, over the files git tracks. For each file, aider's tree-sitter parser lists the definitions it would hand a model as context; a bare file name means the file has none it recognizes (configuration, Markdown, CSS, JSON). The `⋮` marks lines left out.

The map is what an AI pair programmer sees of this repository before it opens a file. Read it as a table of contents: the new page's TypeScript in `canvas/app/`, the old page's scripts and the model library in `canvas/src/`, the tests in `canvas/test/` and `canvas/app/test/`, and the SysML scripts in `docs/sysml/`. The built pages (`canvas/index.html`, `canvas/dist/`) are generated, and aider doesn't read their inline or bundled scripts. Stronghold's code, which this repository held until November 7, is in the Stronghold repository now; its map from then is in this file's history.

It is one of the project state documents: read it with `status.json` (where the work stands) and `notes.md` (what the last session left), and use it to find the file to open. It lists code only; the plan and the decisions are in `direction.md` and `slice-1.md`.

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
│export type NodeData = BoxData | BorderData | SmallData;
│
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
│export interface ProjectOptions {
│  /** Whether the plane is far (its zoom is under FAR). Default false. */
│  far?: boolean;
│  /** The projection before this one, of the same view: what reads the same is taken from it. */
│  previous?: Projection | null;
│  /** The measures. Default LOOK. */
│  look?: Look;
│  /**
│   * Places that stand in for the view's own, by element id (step 7): what a gesture asks, before i
│   * A place given here is read as if the view's layout held it, and nothing is written to the mode
⋮
│export type Viewport = { x: number; y: number; zoom: number };
│
⋮
│type SavedPlace = { x?: unknown; y?: unknown; w?: unknown; h?: unknown; side?: unknown; at?: unknow
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
│export interface ReadNode {
│  readonly id: string;
│  readonly el: ModelElement;
│  readonly row: KindRow;
│  readonly shape: Shape;
│  /** The index of the entry of its parent node, or -1 at ground level. */
│  readonly parent: number;
│  readonly parentId: string | undefined;
│  readonly border: boolean;
│  readonly isBox: boolean;
⋮

canvas/app/src/core/checks.ts:
⋮
│export interface Problem {
│  /** The id of the element, the relationship or the view it is about; null when it is about the pa
│  readonly id: string | null;
│  /** The sentence: "Two elements are named Host in the package." */
│  readonly message: string;
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
│export interface Checks {
│  readonly state: ChecksState;
│  listen(listener: () => void): () => void;
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
│  childrenOf(model: Model, id: string | null): ModelElement[];
⋮
│  textName(el: { kind: string; name?: unknown }): string | null;
⋮
│  describeRel(model: Model, rel: ModelRelationship): string;
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
│  now(): string;
⋮

canvas/app/src/panels/Details.tsx:
⋮
│export type DetailsTab = (typeof TABS)[number];
⋮
│export interface PickedFormProps {
│  /** The open file. */
│  session: Session;
│  /** The tab that is shown, and what a change of it calls. */
│  tab: DetailsTab;
│  onTab: (tab: DetailsTab) => void;
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
│    describeRel(model: Model, rel: ModelRelationship, ids?: { get(id: string): ModelElement | undef
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
│type Labelled = Readonly<Record<string, { label: string; keyword?: string | null; usage?: boolean }
⋮

canvas/app/src/panels/fieldHooks.ts:
⋮
│export interface FieldLibrary {
│  readonly FIELDS: Readonly<Record<string, FieldSpec>>;
│  readonly KINDS: Readonly<Record<string, { label: string; fields: string[]; definedBy?: string }>>
│  readonly RELATIONSHIPS: Readonly<Record<string, {
│    label: string;
│    fields: string[];
│    /** The id of the element whose body declares the relationship, or null for the package. */
│    owner(model: Model, rel: ModelRelationship, ids: Map<string, ModelElement>): string | null;
│  }>>;
│  readonly VIEW_KINDS: Readonly<Record<string, { label: string; fields: string[] }>>;
⋮
│  describeRel(model: Model, rel: ModelRelationship): string;
│  /** A view in words: 'view proofStructure'. */
│  describeView(model: Model, view: ModelView): string;
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
│export function readText(spec: FieldSpec, text: string): string | number {
│  if (spec.type === 'number') return text.trim() !== '' && Number.isFinite(+text) ? +text : '';
│  return spec.trim ? text.trim() : text;
⋮

canvas/app/src/plane/MiniMap.tsx:
⋮
│export interface PlaneMiniMapProps {
│  /** The store of the view the plane shows. */
│  store: ViewStore;
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
│export interface ViewStore {
│  readonly session: Session;
│  readonly viewId: string;
│  /** Whether a plane draws this view's kind (the adapter's isDrawn). When false the tab shows the 
│  readonly drawn: boolean;
│  /** What the card says first (the adapter's notDrawnText). */
│  readonly notDrawn: string;
│  /** How many times the store has projected its view: for the tests, and for looking through windo
│  readonly projected: number;
│  subscribe(listener: () => void): () => void;
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

canvas/app/test/adapter.test.mjs:
⋮
│function scaleModel() {
│  scale ??= lib.normalize(scaleState(5000).model);
│  return { model: scale, views: Array.from(scale.views).filter(isGraph) };
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
│export const readText = (file) => fs.readFileSync(file, 'utf8');
│/** A file's JSON. */
│export const readJSON = (file) => JSON.parse(readText(file));
⋮

canvas/app/test/fieldHooks.test.mjs:
⋮
│describe('the fields of Details, without a browser', () => {
│  test('the form of every element, line and view of the ten files is the library\'s details, laid o
│    let forms = 0;
│    for (const file of stateFiles()) {
│      const { session, mistakes, model } = open(file);
│      const front = model.views[0].id;
│      for (const { type, item } of everything(model)) {
│        const where = `${file.name}, ${type} ${item.id}`;
│        const form = formOf(session, pick(type, item.id), front);
│        forms++;
⋮
│  test('Specializes and Subsets are the element\'s first specialization line', () => {
│    const { session, mistakes, model, history } = example();
│    const form = (id) => formOf(session, pick('el', id), 'v-proof');
│    const wordsOf = () => said(history);
│    assert.equal(fieldRow(form('Host'), 'specializes'), undefined, 'Host starts no specialization l
│    const server = pick('el', 'ServerHost');
│    const row = fieldRow(form('ServerHost'), 'specializes');
│    assert.ok(groupOf(form('ServerHost'), 'general').rows.includes(row) || groupOf(form('ServerHost
│    assert.deepEqual(plain(row.choice), { id: 'Host', label: 'Host' });
│
⋮
│    const push = (rel) => history.edit(() => { model.relationships.push(rel); return 'Drew a line';
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

canvas/app/test/history-walk.test.mjs:
⋮
│function oldPage(model) {
│  const timers = [];
│  const rendered = [];
│  const C = {
│    state: { model, history: [], changes: [], layout: null, selection: null, active: null, pending:
│    M: lib, PAUSE: 800, HISTORY: 100, undoButton: {}, now: clock(), say() {}, editable: () => true,
│    viewById: (id) => C.state.model.views.find((v) => v.id === id) || null,
│    render: (touched, how) => { C.state.layout = { ids: lib.idsOf(C.state.model) }; rendered.push({
│    applyMarks() {}, check() {}, persist() {}, resolve: () => null, setActive() {}, renderInspector
│  };
⋮
│describe('the history, walked at random', () => {
│  const files = stateFiles();
│
│  test('change for change, it does what the old page\'s changes.js does', async (t) => {
│    const { createHistory } = await loadCore();
│    const count = { changes: 0, keyOrder: 0, stale: 0 };
│    for (const { name, file } of files) {
│      // Seed 22 is among them because one of its walks meets the rarer of the two differences allo
│      for (const seed of [1, 2, 22]) {
│        const r = random(seed * 7919 + name.length);
⋮
│  test('where it differs from changes.js by design, each difference is the one meant', async () => 
│    const { createHistory } = await loadCore();
│    // The same things asked of either side: the old script, and the new history.
│    const sides = () => {
│      const old = oldPage(lib.normalize(readJSON(EXAMPLE).model));
│      const mistakes = [];
│      const history = createHistory(lib.normalize(readJSON(EXAMPLE).model), { now: clock(), mistake
│      return [{
│        get model() { return old.S.model; },
│        replace: (model) => { old.S.model = model; },
│        edit: (change, key) => old.C.edit(change, key),
│        undo: () => old.C.undo(),
│        steps: () => old.S.history.map((step) => step.what),
│        mistakes: old.mistakes,
│      }, {
│        get model() { return history.model; },
│        replace: (model) => { history.model = model; },
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

canvas/app/test/selection-core.test.mjs:
⋮
│const keys = (items) => items.map(key);
⋮

canvas/build.mjs:
⋮
│export function readStateFile(file = STATE) {
│  const state = JSON.parse(fs.readFileSync(file, 'utf8'));
│  if (!state || typeof state !== 'object' || !state.model || typeof state.model !== 'object') throw
│  for (const key of ['notes', 'archive']) {
│    if (state[key] !== undefined && !Array.isArray(state[key])) throw new Error(`${file}: ${key} is
│  }
│  return { model: state.model, notes: state.notes || [], archive: state.archive || [] };
⋮
│export function libraryCode() {
│  checkLinkage(LIBRARY, SHARED.library, []);
│  return stitch(LIBRARY, (name) => `// ==== ${name}`);
⋮

canvas/dist/app.js:
│"use strict";(()=>{var __create=Object.create;var __defProp=Object.defineProperty;var __getOwnPropD
⋮
│`)){let line="";for(let word of para.split(/\s+/).filter(Boolean))line&&(line+" "+word).length>maxC
│`).split(`
│`)){let line="",width=0;for(let word of para.split(/\s+/).filter(Boolean)){let w=textWidth(word,px)

canvas/dist/model-lib.js:
⋮
│(function (root) {
│  'use strict';
│  const lib = root.SysMLModelLib = {};   // what the scripts register for the ones after them; api.
│
│  const freeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === 'object') freeze(
│  const METAMODEL = freeze({
│    AcceptActionUsage: { general: ['ActionUsage'],
│      owns: [
│        { name: 'payloadParameter', type: 'ReferenceUsage', lower: 1, derived: true, subsets: ['Usa
│      ],
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
│  function hasTrait(kind, trait) {
│    const k = KINDS[kind];
│    return !!(k && k.traits) && k.traits.indexOf(trait) >= 0;
⋮
│  function textName(el) {
│    const kind = KINDS[el.kind];
│    return kind && kind.fields.indexOf('name') >= 0 ? str(el.name).trim() : null;
⋮
│  function lookups(model) {
│    const maps = new Map();
│    const made = (key, make) => {
│      let map = maps.get(key);
│      if (!map) { map = make(); maps.set(key, map); }
│      return map;
│    };
│    const push = (map, key, item) => {
│      const list = map.get(key);
│      if (list) list.push(item); else map.set(key, [item]);
⋮
│  function linesFrom(model, id, kind) {
│    const look = lookOf(model);
│    return look ? look.from(id, kind).slice() : model.relationships.filter((r) => r.from === id && 
⋮
│  function childrenOf(model, id) {
│    const look = lookOf(model);
│    if (look) return look.children(id).slice();
│    return model.elements.filter((e) => (id === null || id === undefined ? e.owner === undefined : 
⋮
│  function featurePath(model, ownerId, el, ids) {
│    const c = chain(model, el, ids);
│    const start = ownerId === null ? 0 : c.findIndex((e) => e.id === ownerId) + 1;
│    return c.slice(start).map(segment).join('.');
⋮
│  function describeRel(model, rel, ids) {
│    ids = ids || idsOf(model);
│    const a = ids.get(rel.from);
│    const b = ids.get(rel.to);
│    // An end with no name in the text is said by its kind (describe), not as "(unnamed)".
│    const end = (e) => (!e ? '?' : textName(e) === null ? describe(model, e, ids) : shown(textName(
│    const from = end(a);
│    const to = end(b);
│    if (rel.kind === 'Specialization') return from + ' specializes ' + to;
│    if (rel.kind === 'FeatureTyping') return from + ' defined by ' + to;
⋮
│  function describeView(model, view) { return 'view ' + shown(view.name); }
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
│(function (root) {
│  'use strict';
│  const lib = root.SysMLModelLib;
│  const { isObject } = lib;
│
│  // The layout the page writes, its documents' paths, and the store's limits (db.d.ts): a document
│  // serialized, counted in UTF-8 bytes, and 32 levels deep. A part holds at most 192 KiB, well ins
│  // ends a part when its identity's hash is a multiple of every, one record in every on average, w
│  // parts of the scale models about 64 KiB.
│  const STORE = Object.freeze({
⋮
│  function readStore(dump, revision) {
│    if (!isObject(dump)) throw new TypeError('A dump of the store is an object of documents by path
│    const working = isObject(dump[STORE.working]) && isObject(dump[STORE.working].model) ? dump[STO
│    const head = isObject(dump[STORE.head]) ? dump[STORE.head] : null;
│    const based = (body) => !!body && revision !== undefined && revision !== null && body.baseRevis
│    const pick = [based(working) && working, based(head) && head, working, head].find(Boolean) || n
│    let model = null;
│    if (pick === working && working) model = copy(working.model);
│    else if (pick) {
│      if (pick.layout !== STORE.layout) {
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
│function btb(){function e(){this.obj=this.createObject()}
│;e.prototype.createObject=function(a){return Object.create(null)};e.prototype.get=function(a){retur
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
│  const isObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
⋮
│  function textName(el) {
│    const kind = KINDS[el.kind];
│    return kind && kind.fields.indexOf('name') >= 0 ? str(el.name).trim() : null;
⋮
│  function lookups(model) {
│    const maps = new Map();
│    const made = (key, make) => {
│      let map = maps.get(key);
│      if (!map) { map = make(); maps.set(key, map); }
│      return map;
│    };
│    const push = (map, key, item) => {
│      const list = map.get(key);
│      if (list) list.push(item); else map.set(key, [item]);
⋮
│  function linesFrom(model, id, kind) {
│    const look = lookOf(model);
│    return look ? look.from(id, kind).slice() : model.relationships.filter((r) => r.from === id && 
⋮
│  function childrenOf(model, id) {
│    const look = lookOf(model);
│    if (look) return look.children(id).slice();
│    return model.elements.filter((e) => (id === null || id === undefined ? e.owner === undefined : 
⋮
│  function describe(model, el, ids) {
│    ids = ids || idsOf(model);
│    const owner = el.owner !== undefined ? ids.get(el.owner) : null;
│    const name = textName(el);
│    return KINDS[el.kind].label + (name === null ? '' : ' ' + shown(name)) + (owner ? ' in ' + show
│  }
│  function describeRel(model, rel, ids) {
│    ids = ids || idsOf(model);
│    const a = ids.get(rel.from);
│    const b = ids.get(rel.to);
│    // An end with no name in the text is said by its kind (describe), not as "(unnamed)".
│    const end = (e) => (!e ? '?' : textName(e) === null ? describe(model, e, ids) : shown(textName(
│    const from = end(a);
│    const to = end(b);
│    if (rel.kind === 'Specialization') return from + ' specializes ' + to;
│    if (rel.kind === 'FeatureTyping') return from + ' defined by ' + to;
⋮

canvas/src/core/lib/stored.js:
⋮
│(function (root) {
│  'use strict';
│  const lib = root.SysMLModelLib;
│  const { isObject } = lib;
│
│  // The layout the page writes, its documents' paths, and the store's limits (db.d.ts): a document
│  // serialized, counted in UTF-8 bytes, and 32 levels deep. A part holds at most 192 KiB, well ins
│  // ends a part when its identity's hash is a multiple of every, one record in every on average, w
│  // parts of the scale models about 64 KiB.
│  const STORE = Object.freeze({
⋮
│  function readStore(dump, revision) {
│    if (!isObject(dump)) throw new TypeError('A dump of the store is an object of documents by path
│    const working = isObject(dump[STORE.working]) && isObject(dump[STORE.working].model) ? dump[STO
│    const head = isObject(dump[STORE.head]) ? dump[STORE.head] : null;
│    const based = (body) => !!body && revision !== undefined && revision !== null && body.baseRevis
│    const pick = [based(working) && working, based(head) && head, working, head].find(Boolean) || n
│    let model = null;
│    if (pick === working && working) model = copy(working.model);
│    else if (pick) {
│      if (pick.layout !== STORE.layout) {
⋮

canvas/src/core/lib/sysml.js:
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
│      describe: (el) => describe(model, el, ids),
│      commonOwner: (a, b) => commonOwner(model, a, b, ids),
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

canvas/src/core/page/panel.js:
⋮
│(function (C) {
│  'use strict';
│  const S = C.state;
│  const {
│    M, VIEW_PANELS, FIELD_HOOKS, $, panel, showPanel, inspectorEmpty, fields, fKind, fPath, fViews,
│    removeFromViewButton, deleteButton, viewFields, vKind, vShow, vMeta, vShowAdd, deleteViewButton
│    problemsButton, undoButton, say, editable, newId, plural, relById, viewById, viewLayout, viewSh
│    center, endpoints, marksFor, applyMarks, showPoint, blankField, edit, endEdit, undo, setActive,
│  } = C;
│
⋮
│  function setPanel(open) {
│    panel.hidden = !open;
│    showPanel.hidden = open;
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
│  function viewLayout(id) { return S.layout ? S.layout.views.get(id) || null : null; }
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

canvas/test/build.test.mjs:
⋮
│function copyCanvas() {
│  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'canvas-build-'));
│  copies.push(dir);
│  for (const name of ['build.mjs', 'state.json', 'index.html']) fs.copyFileSync(path.join(CANVAS, n
│  fs.cpSync(path.join(CANVAS, 'src'), path.join(dir, 'src'), { recursive: true });
│  return dir;
⋮

canvas/test/fake-claude.mjs:
⋮
│export function installFakeClaude(seed) {
│  const LIMIT = { body: 256 * 1024, depth: 32, documents: 25000, segment: 200, path: 1000, segments
│  const docs = new Map(); // path -> frozen body
│  const snaps = new Map(); // path -> the snapshot handed out for the body now stored, so an unchan
│  const listeners = new Set();
│  const log = [];
│  let minted = 0;
│  let waiting = 0; // answers on their way
│  let lastActive = performance.now(); // when a call was last made or answered
│
⋮
│  const freeze = (value) => {
│    if (value && typeof value === 'object') Object.values(value).forEach(freeze), Object.freeze(val
│    return value;
⋮

canvas/test/helpers.mjs:
⋮
│export function assertPageExists(file = PAGE) {
│  assert.ok(fs.existsSync(file), `No canvas page at ${file}. Build index.html first: node canvas/bu
⋮
│export function pageSource(file = PAGE) {
│  assertPageExists(file);
│  return fs.readFileSync(file, 'utf8');
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
│export const elementIds = (page) => page.$$eval('g[data-el]', (groups) => groups.map((g) => g.getAt
│export const relationshipIds = (page) => page.$$eval('g[data-rel]', (groups) => groups.map((g) => g
⋮
│export async function exportText(page) {
│  await page.click('#export');
│  await page.waitForSelector('#export-panel', { state: 'visible', timeout: WAIT });
│  await until(page, () => document.querySelector('#export-text')?.value.trim().length > 0, null, '#
│  return page.inputValue('#export-text');
⋮
│export async function emptyPoint(page) {
│  for (let attempt = 0; attempt < 6; attempt++) {
│    const point = await page.evaluate(findEmptyPoint);
│    if (point) return point;
│    const canvas = await page.locator('#canvas').boundingBox();
│    await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
│    await page.mouse.wheel(0, 600);
│  }
│  assert.fail('found no empty spot on the plane to click, even after panning down six times');
⋮
│export async function clickElement(page, id) {
│  const group = page.locator(`g[data-el="${id}"]`).first();
│  const box = await group.boundingBox();
│  assert.ok(box, `element ${id} has a bounding box`);
│  await group.click({ position: { x: box.width * 0.35, y: box.height * 0.35 } });
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
│export const storedModel = (page) => page.evaluate(() => {
│  try { return window.SysMLModel.readStore(window.__store.dump()).model; } catch (error) { return n
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
│export function scaleModel(count) {
│  if (!Number.isInteger(count) || count < SHARED.length) throw new RangeError(`a scale model has at
│  const services = Math.floor((count - SHARED.length) / PER_SERVICE);
│  const spares = count - SHARED.length - services * PER_SERVICE;
│  const elements = [];
│  const relationships = [];
│  const layouts = { definitions: {}, deployment: {}, workflows: {} };
│  const columns = Math.max(1, Math.ceil(Math.sqrt(services + spares / 3)));
│  const cell = (view, i) => ({ x: ORIGIN.x + (i % columns) * CELL[view][0], y: ORIGIN.y + Math.floo
│
⋮
│export function scaleState(count) {
│  return { model: scaleModel(count), notes: [], archive: [], changes: [] };
⋮

canvas/test/store-dump.test.mjs:
⋮
│const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
⋮

docs/sysml/draw.mjs:
⋮
│function draw(variant) {
│  const page = variant === 'page';
│  const ACCENT = page ? '#2F8C7E' : '#176B61';
│  const out = [];
│  const push = (s) => out.push(s);
│
│  function text(x, y, str, style, anchor = 'start') {
│    const st = STYLE[style];
│    let a = `<text x="${x}" y="${y}"`;
│    if (anchor !== 'start') a += ` text-anchor="${anchor}"`;
⋮
```
