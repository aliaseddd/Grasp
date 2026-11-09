# The scope: SysON's 620 entries and the 23 strategies, by what Damon needs

This appendix of [`direction.md`](direction.md) sorts every entry of [`core.md`](../docs/sysml/syson/port/core.md) and [`useful.md`](../docs/sysml/syson/port/useful.md) in `docs/sysml/syson/port/` by which of the needs it serves, and each strategy of [`extensibility-strategies.md`](extensibility-strategies.md) by its fate. It was produced by readers working from the brief of November 8, 2026, one reader per range of the port files, and is a sorting aid, not a commitment: an entry under a need is a candidate for the slices that serve that need. The provider is the part that would most plausibly supply the entry: a library (react-flow, dockview, mui, elk, opensysml), Grasp's own model library (grasp-library), new code of our own (hand-written), the pilot implementation on Claude's side, or nothing (n/a).

## Counts

| Need | Entries |
|---|---|
| The look and feel | 238 |
| Reading and writing SysML v2 text | 45 |
| All of SysML's concepts | 221 |
| The loop: files, Claude and GitHub | 6 |
| Later, if ever | 100 |
| Out | 10 |
| Total | 620 |

By provider: react-flow 64, dockview 20, mui 72, elk 4, opensysml 59, grasp-library 131, hand-written 260, n/a 10.

## The strategies by fate

### Kept as Grasp's own code (1)

- **Text forms declared by rows, read by the writer, the label editor and the drawn label** (39 entries; grasp-library): Two of the three places that spell a value's textual form stay Grasp's own code: the writer's `headOf` in `core/lib/sysml.js`, because OpenSysML's wasm build has no `convert` and the text Grasp writes is still ours, and the label editor's `readLabel`, `applyLabel` and `labelText` in `labels/lib.js`, which implement SysON's direct-edit grammar and are tested; the third, `nameLine` in `core/page/drawing.js`, becomes a React label component reading the same rows. Declaring each text form once in its row, as the strategy proposed, is an internal refactor that pays only if the kinds representation and Grasp's writer stay. Under a metamodel-faithful element graph with a generic printer the keywords and operators would come from the metamodel and the printer, and the row declarations would not be needed. Kept: `core/lib/sysml.js headOf()`, `labels/lib.js readLabel()`, `labels/lib.js applyLabel()`, `labels/lib.js labelText()`, `core/lib/model.js KEYWORDS`.

### Kept in another form (11)

- **Commands registered with where they apply** (169 entries; hand-written): No library in the stack provides a command system, but MUI supplies menus, toolbars and a command-palette dialog and React Flow the right-click and node-toolbar events, so the planned table that `core/page/tools.js`, `core/page/pointing.js` and `core/page.html` would consult becomes a small React command registry (where it shows, when it applies, its key, its action) feeding Damon's Tools view and right-click palettes (decision 10), while the header palette, `buildPalette` and the hand-written action buttons go. It shrinks to the commands Grasp's own kinds need rather than SysON's 169 placements, whose sections and ordering are detail Damon did not ask for. `VIEW_KINDS[kind].tools` in `core/lib/model.js` stays as the data saying which creation tools a view kind offers; under a metamodel-faithful element graph that list would be derived from what a view's elements may own. Kept: `core/lib/model.js VIEW_KINDS[kind].tools`, `core/lib/model.js admits()`.
- **Namespaces, memberships and imports in the saved model** (120 entries; grasp-library): Packages, imports, memberships, owned views and comments must be held either way, since need (2) asks for every concept and text read by OpenSysML carries them, but the form is the representation decision: with Grasp's JSON of kinds it is the planned version 3 of `core/lib/model.js` (`blank`, `normalize`, `UPGRADES`, a package kind, `owner` on views, import rows); with a metamodel-faithful element graph with ids it dissolves into holding every metaclass, Package, NamespaceImport, Membership and Comment among them. Name resolution across models and into the libraries, which `labels/lib.js` and the writer's `headOf` were to learn, is absorbed by OpenSysML's reader (`find` returns resolved typings and qualified ids), while the writer's side, the shortest resolvable name and the imports it needs, stays Grasp's because the wasm build has no `convert`. Cross-model references by model id plus element id and the tree's roots in `browser/lib.js` remain our own design. Kept: `core/lib/model.js normalize()`, `core/lib/model.js UPGRADES`, `core/lib/model.js childrenOf()`, `core/lib/model.js qualified()`, `core/lib/model.js featurePath()`, `core/lib/sysml.js headOf()`, `browser/lib.js browserRoots()`.
- **How each element appears in a view, by mapping rules** (95 entries; hand-written): React Flow supplies the substrate the strategy meant to build in SVG (node types as React components, parent nodes for nesting, edges for a usage drawn apart with a composition line, handles for border items), so `graphLayout` in `core/page/layout.js`, `COMPARTMENTS` and `drawBox` in `core/page/drawing.js`, `hitOf` in `pointing.js`, the marks in `render.js` and the compartments of `behavior/page.js` and `annotations/page.js` are all replaced. The mapping itself, which form an element takes in which view kind and compartments as selectable rows, stays our own code as node components and one mapping function; OpenSysML's `renderView` (spike C) already computes a view's tree with compartments, ports and an inherited flag, so part of it can come from the reader where a view is defined by exposes. Spike B showed SysML-style nodes with compartments, but row-level selection and label editing inside a node at Grasp's scale are untested, and `inheritedFeatures` in `core/lib/model.js` serves only while the kinds representation stands, since OpenSysML returns inherited attributes itself. Kept: `core/lib/model.js inheritedFeatures()`, `core/lib/model.js admits()`, `labels/lib.js readLabel()`.
- **Per-view state as registered keys of layout entries** (76 entries; grasp-library): React Flow holds per-node state at run time (position, measured and resized size, hidden, parentId, free `data`) and per-edge type and data, but saves nothing, and need (3) wants Claude to read and edit the diagrams themselves, so the saved per-view record is the heart of this strategy and stays ours: a record per shown element and line carrying place, size, hidden, faded, pinned, collapsed, shown compartments, bend points and style overrides, mapped onto React Flow nodes and edges on load. `placement()` and the layout part of `normalize` in `core/lib/model.js`, which keep only x, y, w and h today, grow into that record, and the planned table of registered keys is unnecessary since the record is one schema we own; `touchedBy` in `core/page/changes.js` and the readers in `layout.js` and `drawing.js` go with the page. Whether the layout sits in the model file or in a diagram file beside it (SysON keeps it apart from the semantic model) goes with the representation decision. Kept: `core/lib/model.js placement()`, `core/lib/model.js normalize() (layout entries)`, `core/lib/model.js VIEW_KINDS[kind].options`.
- **Expressions held as text and read by the page's SysML v2 reader** (38 entries; opensysml): The page's SysML v2 reader is now OpenSysML, whose wasm capabilities include expression parsing and evaluation, so the planned `expressions/lib.js` over a hand-written reader is replaced by parsing the holding element's text with OpenSysML and reading its diagnostics, with an MUI Dialog as the editor. Storing the expression as text stays our choice for the field, as the guard, trigger and effect strings in `behavior/lib.js` already are and as `core/lib/sysml.js` writes them through. Under a metamodel-faithful element graph the expressions could instead be the owned expression elements OpenSysML parses, which is what renaming a feature inside an expression would need; under the kinds JSON they stay text and that renaming problem, which the strategy named, stays open. Kept: `behavior/lib.js guard, trigger and effect fields`, `core/lib/model.js MULTIPLICITY`.
- **Model formats as reader-writer pairs, with a SysML v2 reader in the page** (19 entries; opensysml): The reader half, the strategy's largest unknown (a hand-written full-grammar parser in a `text/` folder), is absorbed by OpenSysML's wasm module: parse, diagnostics, name resolution and the standard libraries, about 0.8 s from disk (spike D), with XMI and SysON JSON dropped since Damon did not ask for them. The writer half stays Grasp's `toSysML` in `core/lib/sysml.js`, since the wasm build lacks `convert`; `canvas/export.mjs` and `canvas/check.sh` keep running it on Claude's side with the pilot validator as the authority, and a round trip (write, read back with OpenSysML, compare) becomes the test the strategy asked for. The glue that remains, turning OpenSysML's symbols into Grasp's model, depends on the representation decision: into kinds it is lossy (`normalize` drops what has no row, against need 2), into a metamodel-faithful element graph it is faithful, and how ids stay stable across a re-read of text is open either way. Kept: `core/lib/sysml.js toSysML()`, `core/lib/sysml.js textOf()`, `core/lib/sysml.js exposesOf()`.
- **Workspaces as files that hold several models, with a start screen** (18 entries; hand-written): Decisions 5 to 7 stand and spike A answered the strategy's open question: from a file page the File System Access API is present (`showDirectoryPicker`, `showSaveFilePicker`), so a workspace is a folder picked once, read and written back, with a download and a file input as the fallback, and `fetch` to api.github.com passes CORS, so pushing and pulling through GitHub from the page is a workable way for files to reach Claude (one of the options the brief's decision 7 leaves open). The claude.ai store goes entirely: `core/lib/stored.js`, `core/page/store.js`, the store's tests and `canvas/save-state.mjs`'s store dumps, along with `core/page/io.js`'s Download and Import state and `STATE_KEY` in `core/page/base.js`, while the start screen and project menu become MUI components. The model file's reader, `normalize` and `UPGRADES` in `core/lib/model.js`, remains if the kinds JSON stays and is the upgrade path from `grasp/2` if the format changes. Kept: `core/lib/model.js normalize()`, `core/lib/model.js UPGRADES`.
- **Validation rules as rows that feature folders add** (17 entries; opensysml): The specification's rules for every metaclass, which the strategy would have gathered one feature folder at a time, come from OpenSysML's diagnostics (`diagnostic_codes`, `strict_conformance`; spike D caught two definitions named App and a port typed by a part def), with the pilot validator on Claude's side staying the authority, so the rules table in `core/lib/model.js` and `canvas/build.mjs`'s ordering are not needed. Grasp's 15 rules in `validation/lib.js` and the per-kind `check` hooks stay as the checks while drawing until OpenSysML is shown to cover them (it agrees with the pilot on 522 of 924 corpus files and claims no conformance), and the Validation view becomes a Dockview panel listing both sources. Getting OpenSysML's diagnostics after a graphical edit means writing the model to text and re-parsing (124 ms for a 10-line package in the browser); the cost at Grasp's scale is untested. Kept: `validation/lib.js RULES`, `validation/lib.js validateSpec()`, `core/lib/model.js check hooks of kind and relationship rows`.
- **Relationship ends as feature paths, connectors as elements** (15 entries; grasp-library): Text read by OpenSysML carries connector ends as feature chains and connectors as usages, so the change is needed for need (1) either way, but its form is the representation decision: with the kinds JSON it is the planned version-3 change to `normalize` and `UPGRADES` in `core/lib/model.js` (ends as paths of ids, connector usages as elements with a list of ends); with a metamodel-faithful element graph it is nothing extra, since ConnectionUsage, end features and feature chains are metaclasses the graph holds. The writer's `featurePath` in `core/lib/model.js` and the connector writing in `core/lib/sysml.js` and `interconnection/lib.js` remain Grasp's because the writer stays ours. `endpoints` in `core/page/layout.js` and `connectStep` in `core/page/tools.js` go with the page, React Flow's handles and edges taking the drawing. Kept: `core/lib/model.js featurePath()`, `core/lib/model.js acrossDefinitions()`, `interconnection/lib.js flowEnd()`, `interconnection/lib.js flowEndPath()`, `interconnection/lib.js connectorStatement()`.
- **Every metaclass held, with default kinds from the metamodel** (14 entries; grasp-library): This strategy is need (2) itself and becomes the model-representation decision: either default kinds generated from `METAMODEL` for every concrete metaclass, as planned, keeping Grasp's JSON of kinds with hand-written rows refining them, or a metamodel-faithful element graph with ids in which every element is a metaclass instance and the hand-written kinds become drawing and tool refinements. Either way `normalize` in `core/lib/model.js` must stop dropping elements whose kind has no row, since OpenSysML hands the page every symbol with its metaclass kind (`partUsage`, `connectionUsage`, `viewUsage`; spike C), and the generic writer the strategy asked of `core/lib/sysml.js` is needed in both forms. `core/lib/metamodel.js`, generated from the pilot's `SysML.ecore` by `canvas/metamodel/generate.mjs`, `addKinds` and `conforms` in `core/lib/model.js` and `details/lib.js`'s attribute lists stay useful in both. Kept: `core/lib/metamodel.js METAMODEL`, `core/lib/model.js addKinds()`, `core/lib/model.js addRelationships()`, `core/lib/model.js conforms()`, `core/lib/model.js attributeField()`, `details/lib.js allFeatures()`.
- **Change history from recorded writes, with redo and trial runs** (10 entries; hand-written): React Flow has no built-in undo and none of the other libraries keeps history, so undo and redo, part of the look Damon asked for, stay our own code; the approach changes because the Proxy-recorded writes of `core/page/changes.js` assume the page's mutable model objects while React state is updated immutably. Either `edit()`, `track()` and `undo()` are carried over onto a model kept outside React and pushed into it, gaining the redo the strategy planned, or a patch history over immutable updates replaces them; the choice goes with the representation decision. Trial runs for impact analysis are a SysON feature Damon did not ask for and are dropped, and `HISTORY` in `core/page/base.js` and the key handling in `pointing.js` go. Kept: `core/page/changes.js edit()`, `core/page/changes.js track()`, `core/page/changes.js undo()`.

### A thin layer over a library (2)

- **Panel fields drawn from their rows, with widgets by type** (79 entries; mui): MUI provides every widget the strategy would have written (TextField, Checkbox, RadioGroup, Select, Autocomplete chips for references, Dialog for browse), so the hand-written field markup in `core/page.html` and the `if` branches of `core/page/panel.js` go, leaving a thin Details component that walks the rows, picks a widget by type and commits through the model's edit path. The rows survive: `FIELDS` and `attributeField` in `core/lib/model.js`, and `details/lib.js` (`coreFeatures`, `allFeatures`, `detailsOf`), which already list a metaclass's attributes from `METAMODEL` in SysON's Core and Advanced groups. Under a metamodel-faithful element graph the rows come from `METAMODEL` directly and OpenSysML's `symbol_attributes` gives values for read-only library elements; under the kinds JSON they stay as today. Kept: `core/lib/model.js FIELDS`, `core/lib/model.js attributeField()`, `details/lib.js coreFeatures()`, `details/lib.js allFeatures()`, `details/lib.js detailsOf()`, `core/lib/metamodel.js METAMODEL`.
- **The selection as an ordered list that views and panels follow** (47 entries; react-flow): React Flow provides multi-selection on the canvas (Ctrl/Cmd+click, Shift+drag marquee, group moves, `onSelectionChange`, `fitView` on a node list to reveal), so `S.selection`, `select()` and `applyMarks` in `core/page/state.js`, `panel.js` and `render.js`, and the camera code in `camera.js`, go. Decision 11, one selection shared by every view, the tree, Details and across tabs, is React state we own: a small store that each canvas's `onSelectionChange` writes and every panel reads, with the rule that only a selection made outside the plane moves the camera. Nothing of Grasp's remains, since the whole strategy was page code.

### Provided by a library (7)

- **Pointer gestures registered by feature folders** (69 entries; react-flow): React Flow has the gestures built in: node drag and multi-select moves, NodeResizer handles (the resizing Damon asked for), connection handles with a connection line and `isValidConnection`, edge reconnection, marquee selection, snap to grid, and the documented drag-and-drop from a side panel onto the pane. The pointer-down arbitration in `core/page/pointing.js`, the graph renderer's `dragStart`, `drag` and `drop` in `core/page/drawing.js`, `pinDragStart` in `annotations/page.js` and the planned gesture table all go. What stays ours is the rules that say whether a connection or a drop is valid (`acrossDefinitions` and `canContain` in `core/lib/model.js`), and, if ever wanted, bend-point editing and helper lines, which React Flow lacks and SysON adds itself. Kept: `core/lib/model.js canContain()`, `core/lib/model.js acrossDefinitions()`.
- **One host for dialogs, pop-overs and messages** (67 entries; mui): MUI's Dialog, Popover, Menu and Snackbar with Alert severities are the host the strategy proposed to write as `core/page/dialog.js`, with focus handling, Escape and click-away included. The one status line `say()` in `core/page/state.js` and the floating `#export-panel` and `#validation-panel` in `core/page.html` go. Nothing of Grasp's remains useful here.
- **Libraries held read-only beside the model** (58 entries; opensysml): OpenSysML's wasm module bundles the 94 standard library files of the pilot's 2026-09 release (plus 16 extensions) and resolves names and inherited features into them (spike C returned `mass` typed `ScalarValues::Real`; spike D did the same from disk, 82 MB of heap, about 0.8 s to a resolved model), which answers the strategy's open question about size and load time and makes the planned generator beside `canvas/metamodel/`, the slot in `canvas/build.mjs` and the cross-library lookups in `core/lib/model.js`, `labels/lib.js` and `details/lib.js` unnecessary. What remains ours is small: listing library namespaces read-only in the Explorer from `model.walk()`, skipping them in validation, and the writer's `needImport` in `core/lib/sysml.js`, which still adds the imports a model's text needs. User libraries become model files a workspace opens read-only. Kept: `core/lib/sysml.js needImport()`.
- **Side panels and bars that host registered views** (35 entries; dockview): Dockview provides the docked, resizable, collapsible panel groups with draggable tabs that the strategy's table of workbench views and `core/page.html`'s floating `#panel`, `#validation-panel` and `#export-panel` would have become, and MUI the icon strips and toolbars; spike B showed Explorer, editor and Details panels with sashes that resize. The registry of views becomes Dockview panels written as React components (Explorer, Details, Validation, Tools; Search later), so `core/page/base.js`, `panel.js`, `tools.js`, `notes.js`, `export.js`, `validation/page.js` and the browser renderer in `browser/page.js` are rewritten. `browser/lib.js`'s tree rows remain the Explorer's data while the kinds representation stands; under an element graph the tree would walk the model or OpenSysML's symbols directly. Kept: `browser/lib.js treeRows()`, `browser/lib.js browserRoots()`.
- **Layout and routing algorithms given the whole view** (16 entries; elk): elkjs, bundled without a worker as `elk.bundled.js`, provides arrange-all in layers with options per view kind, which spike B ran from disk, so the strategy's fear of a layered layout too slow without a library is gone, and keeping pinned boxes in place becomes a constraint we pass to or apply around ELK rather than an algorithm of ours. React Flow's edge types (straight, bezier, smoothstep, step) replace `ROUTES` in `core/page/layout.js`, `gridPlace` in `core/lib/model.js` gives way to ELK for boxes a view has not placed, and the planned `arrange/` folder is not written. Routes that go round boxes and gaps where lines cross are not in the stack (SysON adds `pathfinding`) and are a later nicety.
- **Tabs, each a plane of its own** (13 entries; dockview): Dockview gives the tab bar, groups, drag to reorder, close and reopen, and floating or popout groups; a plane per tab (decision 1) maps onto one React Flow instance per Dockview panel, its viewport the plane and its view frames parent nodes, as spike B showed with 'view1 : GeneralView' and 'Package1.sysml' tabs. `drawAll` in `core/page/render.js`, `fit` and the camera in `core/page/camera.js`, `S.active` in `state.js` and the frame handling in `layout.js`, `drawing.js` and `pointing.js` go. What each tab holds, its views, their places and its camera, is saved in the workspace file by us, and a view's `x` and `y` leave the model as the strategy planned.
- **A view drawn whole off-screen for export** (4 entries; react-flow): Image export is part of the mature look Damon asked for, and React Flow's documented pattern covers it: `getNodesBounds` and `getViewportForBounds` with `html-to-image` (MIT, 1.11.11, which Sirius Web uses) render a whole view to PNG or SVG at full detail, saved through the File System Access API or a download. The region drawing of `render` in `core/page/render.js`, `onScreen` in `core/page/drawing.js` and the planned `image/` folder are not needed. `html-to-image` is one small library to vendor beside the stack.

### Dropped (2)

- **Table views whose columns are rows** (18 entries; mui): Seventeen of its 18 entries are SysON's Requirements Table View, which is not among Damon's needs, so the mechanism of declared column rows shared by table kinds is dropped from the plan. Grasp's grid view, one of the eight standard view kinds, stays a feature and would be redrawn over MUI's Table (or material-react-table, MIT, SysON's own choice, which brings sorting, filtering, column resizing and cell editing) when its slice comes, so `grid/page.js` is rewritten and nothing of ours needs to declare columns beyond `GRID_COLUMNS` in `grid/lib.js`. Kept: `grid/lib.js GRID_COLUMNS`, `grid/lib.js gridOptions()`.
- **Copy and paste as a model fragment with new ids** (7 entries; n/a): Duplicating an element with its contents is a nicety among SysON's features, not one of Damon's four needs, and Claude can duplicate model content by editing the files directly. The planned `clipboard/` folder and the id helper in `core/lib/model.js` are not written, and the Copy in `core/page/export.js` goes with the export panel. If wanted later it is a small function on the model that copies elements, relationships and places with new ids.

## The entries by need

### The look and feel (238)

#### Workbench (60)

- `core.md › SysON color theme` · missing · mui: Shell colours are the look Damon asked for; MUI createTheme carries palette and typography to every widget; SysON's exact hues are optional.
- `core.md › Representation tabs` · missing · dockview: Damon asked for tabs, one plane each; Dockview gives tabbed groups, close buttons, drag, active tab; icons and open-from-tree are our glue.
- `core.md › Navigation bar layout` · partly · mui: Replaces the header Damon rejected with a slim top bar; MUI AppBar and Toolbar give it; SysON's project and library pages are not needed.
- `core.md › Workbench four-region layout` · partly · dockview: The frame of a mature workbench; Dockview gives left, editor and right regions as resizable groups; the top bar is MUI.
- `core.md › Left panel: project-level views` · partly · dockview: Side panel with Explorer, Views, Validation, Search is workbench shell; Dockview gives the resizable tabbed group; the view contents are our own React.
- `core.md › Right panel: selection-dependent views` · partly · dockview: Selection panel with Details and related views is shell; Dockview gives the resizable group; Details is our form; the server-side Query view drops.
- `core.md › Editor area with multiple representation editors` · partly · dockview: Many open diagrams switched by tab replaces the endless plane; Dockview panels host one React Flow canvas each, one plane per tab.
- `core.md › Element search from the command palette` · missing · mui: Finding any element by name is explorer/search feel; MUI Dialog and Autocomplete give the Ctrl+K palette; label matching over model and libraries is ours.
- `core.md › Tree item context (more) menu` · missing · mui: Per-row menus are the palettes-and-menus feel; MUI IconButton and Menu give the ⋮ button and anchored list; entries come from our tree model.
- `core.md › Explorer view` · partly · mui: Side-panel model tree is the core explorer feel; MUI X Tree View (community) gives expand, select and accordion; server subscription becomes in-memory refresh.
- `core.md › Tree item row layout` · partly · mui: Compact rows with chevron, icon, label, ellipsis and trailing ⋮ are explorer feel; MUI X TreeItem slots give them; drop zones belong to move entries.
- `core.md › Clicking a representation in the tree opens it` · partly · dockview: Opening or focusing a diagram tab from the tree is tab-shell behaviour; Dockview's addPanel and setActive do it; listing views under elements is ours.
- `core.md › Semantic element entries` · partly · mui: Create, duplicate, rename, delete from the tree is menu-driven editing feel; MUI Menu gives the list; actions reuse Grasp's model library and new-object dialog.
- `core.md › Reference widget (chips autocomplete)` · partly · mui: Chips in a type-to-filter field for every reference is mature Details feel; MUI Autocomplete multiple with Chip gives it; candidates come from name resolution.
- `core.md › New representation entry` · partly · mui: A tree menu entry creating a diagram on its element is explorer/menu feel; MUI MenuItem gives it; hiding on libraries and typed views is ours.
- `core.md › New representation dialog` · partly · mui: Naming a new diagram and picking its kind in a dialog is mature creation feel; MUI Dialog, TextField and Select give it; defaults are ours.
- `core.md › Rename a representation` · partly · mui: Inline F2 rename in the tree is direct-manipulation feel; MUI X Tree View label editing gives it; the broadcast to other viewers is collaboration, dropped.
- `useful.md › Project name and project menu in the navigation bar` · missing · mui: Shell header naming the open workspace with a menu for rename, save and export; MUI AppBar and Menu; share and settings are server-side.
- `useful.md › Roboto font` · missing · mui: Typographic feel of the reference workbench; MUI's theme assumes Roboto; vendor the woff2 files (inline as data URIs if file:// blocks them).
- `useful.md › Sidebar view selector icon strips` · missing · hand-written: Shell chrome; Dockview has no activity bar, so a strip of MUI icon buttons adds, removes and highlights Dockview panels.
- `useful.md › Collapsible view header (view accordion) with merged toolbar` · missing · dockview: Folding view headers; Dockview's Paneview stacks collapsible panes with header bars and an actions slot for each view's toolbar.
- `useful.md › Editor toolbar groups` · partly · mui: Damon called the header the wrong design; a grouped MUI AppBar (workspace, actions, help) replaces the palette-and-buttons row.
- `useful.md › Toast notifications for action messages` · partly · mui: Stacked, levelled, auto-hiding feedback is standard workbench shell; MUI Snackbar with Alert severities replaces Grasp's single status line.
- `useful.md › SysON diagram tool feedback messages` · partly · grasp-library: Refusals naming element and reason already come from Grasp's checks; keep them, add a level, show them as toasts.
- `useful.md › Three-zone resizable panel group` · partly · dockview: Damon's resizing pain; Dockview's grid gives left, main and right groups with draggable sashes, minimum sizes and collapse.
- `useful.md › Resize and collapse side panels by dragging separators` · partly · dockview: Direct pain point; Dockview sashes resize groups and its API collapses them; the spike's sash drag resized panels from disk.
- `useful.md › Registered workbench views (ids, titles, icons)` · partly · dockview: View registry; each side view is a Dockview panel with id, title and tab icon; Query (server AQL) drops.
- `useful.md › Toggle views on and off; several views stacked in one panel` · partly · dockview: Dockview adds and removes panels at run time and stacks several in one group or Paneview; Grasp shows one view per side.
- `useful.md › Collapse/expand a side panel from the active view's icon` · partly · dockview: Collapsing a side group to zero width and reopening it is Dockview's group API; the icon strip only calls it.
- `useful.md › Default panel layout` · partly · dockview: Starting layout (Explorer left, Details right) is a Dockview layout JSON via fromJSON; the workspace file can override it.
- `useful.md › Search view and query field` · missing · mui: Search view is named in the look definition; MUI TextField in a Dockview panel; the query walks the loaded model by name.
- `useful.md › Search results list and navigation` · missing · mui: MUI List rows with icon and label; a click sets the shared selection so Explorer, Details and diagrams follow.
- `useful.md › Representations listed under their element` · missing · hand-written: Opening a view from the tree; views are ViewUsage children in the model, sorted first by our tree builder; a click opens a tab.
- `useful.md › Item icons with overlays` · missing · hand-written: Standard presentation; one icon per metaclass with overlays; a vendored SVG set (SysON's icons are EPL-2.0) rendered in tree rows.
- `useful.md › Ctrl/Cmd+F tree filter bar` · missing · hand-written: Explorer browsing; a keydown listener on the tree container shows an MUI text field instead of the browser's find.
- `useful.md › Filter bar field` · missing · mui: MUI TextField with adornment buttons; live highlighting of matching labels is a small tweak in the tree row renderer.
- `useful.md › Highlight vs. hide toggle` · missing · hand-written: Part of the filter bar; a flag that switches the tree's row filter from highlighting to hiding non-matches; MUI icon button.
- `useful.md › Tree multi-selection with Ctrl/Shift+click` · missing · mui: Selection behaviour; MUI X Tree View's multiSelect handles Ctrl toggle and Shift range; the result feeds the shared selection.
- `useful.md › Arrow-key tree navigation` · missing · mui: MUI X Tree View ships arrow-key navigation (up, down, expand, collapse, to parent); Grasp's arrow keys pan the plane.
- `useful.md › Tree item palette (diagram-style)` · missing · hand-written: Damon's right-click palettes; one palette component of ours in an MUI Popper, reused on diagram nodes and tree rows.
- `useful.md › Open or close the Explorer from the left sidebar` · partly · dockview: Shell; the left icon strip activates panels in Dockview's left group and collapses that group; Grasp has only a Hide button.
- `useful.md › Tree toolbar layout` · partly · mui: Explorer header row of MUI icon buttons (new, filters, filter, reveal), placed in the panel or Dockview's header actions slot.
- `useful.md › Reveal selected elements button` · partly · mui: Controlled expandedItems on MUI X Tree View unfold the shared selection's ancestors and scroll to it; a crosshair button triggers it.
- `useful.md › Label: ViewDefinition suffix on ViewUsages` · partly · grasp-library: Label rule once views are ViewUsage rows in the tree; Grasp's labels module appends the typing in a muted colour.
- `useful.md › Selected highlight and auto-scroll` · partly · mui: Shared selection highlights the row through MUI X Tree View's selectedItems; a scrollIntoView effect brings it into view.
- `useful.md › Expand all entry` · partly · mui: Explorer browsing; with MUI X Tree View's controlled expandedItems, expanding a subtree is collecting its descendant ids.
- `useful.md › Drag tree items (single or multi-selection)` · missing · hand-written: Direct manipulation; HTML5 dragstart on tree rows carries element ids; React Flow's pane onDrop and other tree rows accept them.
- `useful.md › Move an element by dropping it on another in the tree` · missing · grasp-library: Direct manipulation; the drop handler calls Grasp's library move with checks (no descendant, no library target) and toasts refusals.
- `useful.md › Explorer Delete uses SysON delete semantics` · partly · grasp-library: Grasp's library already cascades and undoes deletes; the tree palette calls the same operation; an MUI confirmation dialog is optional.
- `useful.md › Edit ("...") button` · missing · mui: Browsing the whole model for a reference value is mature Details behaviour; an MUI icon button opening the browse or transfer dialog.
- `useful.md › Click a reference value to select the referenced element` · missing · hand-written: One shared selection everywhere (Damon's decision): clicking a reference navigates to it; MUI chips, the cross-view selection wiring is ours.
- `useful.md › Browse dialog "Select an object"` · missing · mui: Picking one reference value from a model tree in a dialog, as mature tools do; MUI Dialog and tree, candidate scoping is ours.
- `useful.md › Model browser tree` · missing · mui: A filterable pick tree unfolded to current values scales to many models and libraries; MUI tree view, type-compatibility filtering is ours.
- `useful.md › Text fields commit on Enter or blur` · partly · mui: Fields committing on Enter or blur, one undo step per edit, is mature form behaviour; MUI TextField with our commit handlers.
- `useful.md › 'Create a new Representation' card` · missing · dockview: With nothing open, the empty editor group offers views to create, replacing the header's New view button; Dockview's watermark slot hosts our card.
- `useful.md › Views Explorer view` · missing · mui: With views in tabs, not one plane, a tree of all views is how closed ones are reopened; MUI tree view over the workspace.
- `useful.md › Open an existing Representation card` · partly · dockview: With nothing open, the empty editor group lists existing views to open; Dockview's watermark slot hosts our paged list.
- `useful.md › Representation entries` · partly · grasp-library: Right-click menu on a view in the Explorer; Grasp's library renames and deletes views, duplicating one with its layout is new; MUI menu.
- `useful.md › Open representations by selecting them` · partly · dockview: Selecting a view in the Explorer opens or activates its tab, one shared selection; Dockview's panel API, the selection wiring is ours.
- `useful.md › Closing a representation tab` · partly · dockview: Closable tabs with sensible next-tab rules come built into Dockview; Grasp has no tabs, only foldable frames on one plane.

#### Canvas interaction (91)

- `core.md › Ctrl/Cmd + click multi-selection` · missing · react-flow: Multi-selection is basic mature-canvas selection behaviour; React Flow's multiSelectionKeyCode adds and removes nodes and edges with Ctrl/Cmd+click out of the box.
- `core.md › Single global selection` · partly · hand-written: Shared selection across Explorer, Details and canvases is decided workbench behaviour; neither Dockview nor React Flow shares state across panels, so the store is ours.
- `core.md › Diagram selection published to the workbench` · partly · hand-written: Canvas selection must drive Details and the shared selection; React Flow's onSelectionChange reports selected nodes and edges, the bridge to element ids is ours.
- `core.md › Mouse selection gestures listed as shortcuts` · partly · react-flow: Click, Ctrl+click and Shift+drag marquee are standard selection gestures; React Flow has all three built in through selectionKeyCode and multiSelectionKeyCode.
- `core.md › Click to select` · partly · react-flow: Basic selection behaviour of the canvas; React Flow selects nodes and edges on click natively, the right-click palette is its own entry.
- `core.md › Del deletes the selection` · partly · react-flow: Keyboard delete over a multi-selection is expected editing behaviour; React Flow's deleteKeyCode and onDelete fire for selected nodes and edges, Grasp's library removes the elements.
- `core.md › Diagram toolbar panel` · partly · mui: A floating bar of view actions is workbench feel; MUI icon buttons in a React Flow Panel, calling React Flow's fitView, zoom, minimap and snap.
- `core.md › Fit to screen` · partly · react-flow: Viewport navigation of a mature canvas; React Flow's fitView with a nodes list and duration fits the selection or everything, animated.
- `core.md › Node resize modes` · missing · react-flow: Damon asked for resizable boxes; React Flow's NodeResizer gives eight handles, minimum size and keepAspectRatio, per-kind modes by choosing which handles render.
- `core.md › Node dragging` · partly · react-flow: Dragging with a click threshold is core direct manipulation; React Flow's nodeDragThreshold, drag handles and z-index on selection are built in, persistence is ours.
- `core.md › Border node movement` · partly · hand-written: Sliding ports along the owner's border is direct manipulation; React Flow's parent extent won't pin to a border, so side snapping is ours.
- `core.md › Drag elements from the Explorer onto a diagram` · partly · hand-written: Explorer-to-canvas drag is workbench feel; MUI's tree view starts the drag, React Flow's onDrop and screenToFlowPosition place it, exposing the element is ours.
- `core.md › Diagram drop re-parents and re-exposes` · partly · grasp-library: Drop-to-reparent is direct manipulation Grasp already has; the library's owner move needs self/descendant refusals and view re-expose, React Flow's getIntersectingNodes finds the target.
- `core.md › Delete from model` · partly · grasp-library: Deleting from the model is editing a mature tool must do; Grasp's library already deletes with undo, a MUI confirmation Dialog and multi-selection complete it.
- `core.md › Drag-to-connect with a connector palette of valid edge kinds` · missing · react-flow: Drag-between-nodes edge creation is direct manipulation; React Flow's Handles, connection line and onConnect give the gesture, the valid-kinds menu uses Grasp's relationship rules.
- `core.md › Creation handles on a selected node` · missing · react-flow: Visible edge-start affordances are direct manipulation; React Flow source Handles rendered outside the four sides of a selected node start its native connection drag.
- `core.md › Reconnect an edge by dragging its end` · missing · react-flow: Reconnecting by dragging an edge end is direct manipulation; React Flow 12's onReconnect, reconnectEdge and isValidConnection do it, the model end change is Grasp's.
- `core.md › Arrange elements split button` · missing · elk: One-click auto layout is a mature-tool staple; ELK's layered and rectpacking algorithms arrange React Flow nodes, a MUI split button picks the layout.
- `core.md › Editable edge paths` · missing · hand-written: Reshaping edges by dragging segments and bend points is direct manipulation; React Flow has no bend-point editing (Sirius Web wrote its own), so it's ours.
- `core.md › Manhattan (rectilinear) edges` · partly · react-flow: Right-angled edges are the standard notation presentation; React Flow's step and smoothstep edge types route them, stored bend points would need our custom edge.
- `core.md › Add existing elements (recursive)` · missing · grasp-library: Populating a view with an element's members in one click is palette convenience; Grasp's library extends Show to members and descendants, ELK places them.
- `core.md › Node Show/Hide section` · partly · react-flow: Visibility tools are standard palette fare; React Flow's hidden flag on nodes and edges does the hiding, the Show/Hide section and content rules are ours.
- `core.md › Hide quick tool` · partly · react-flow: Hiding nodes and lines without removing them is standard view control; React Flow's hidden flag hides a node with its edges, reveal resets it.
- `core.md › Right-click opens the contextual palette` · missing · react-flow: Damon's decided replacement for the header palette; React Flow's node, edge, pane and selection context-menu events open it at the cursor, MUI draws it.
- `core.md › Palette targets: background, node, label, edge, multi-selection` · missing · hand-written: Per-target tool sets are the palette's substance and ours; React Flow only distinguishes pane, node, edge and selection context events, labels live inside our nodes.
- `core.md › Element palette on nodes` · missing · hand-written: A palette that follows the selected element is workbench feel; its contents come from Grasp's generated metamodel (what an element may contain), MUI lists them.
- `core.md › Floating palette popup` · missing · mui: The compact floating palette is the look Damon wants instead of the header; MUI Popper, Paper, TextField search and lists build it directly.
- `core.md › Default quick tools (Edit, Pin, Fade, Hide, Delete...)` · partly · hand-written: A standard quick-tool row on every palette; React Flow supplies hidden and resize state, pin, fade, adjust-size and resets are our node flags and CSS.
- `core.md › Node quick-access tools (Delete from Diagram, Duplicate Element)` · partly · grasp-library: Palette quick tools on nodes; Grasp's library already removes an element from a view, duplicating an element with its children is a new library operation.
- `core.md › Palette sections and their order` · partly · hand-written: Grouping creation tools by concept in a fixed order is palette organisation; a metaclass-to-section table and alphabetical sort are ours, rendered with MUI lists.
- `core.md › Common definition/usage node palette` · missing · hand-written: Node palettes with create, edit, show/hide and related tools are the workbench's editing surface; assembling them per element kind from Grasp's metamodel is ours.
- `useful.md › Reveal selected elements in the diagram` · missing · hand-written: Selection behaviour of the workbench; React Flow selects and fits nodes, but the command bridging Explorer and diagram panels is ours.
- `useful.md › Rectangle (marquee/lasso) selection with Shift + drag` · missing · react-flow: Core mature-canvas selection gesture; React Flow's built-in selection box with Shift key and partial mode; nested-without-container rule needs a small tweak.
- `useful.md › Edge selection handles` · missing · react-flow: Selection feedback of a mature canvas; React Flow's reconnectable edges show end handles when selected, with onReconnect for dragging them.
- `useful.md › Delete from diagram (multi-selection)` · missing · hand-written: Multi-selection editing of a mature canvas; React Flow supplies the selection, removing places from a view while keeping elements is our view model.
- `useful.md › Delete from model on a multi-selection` · missing · grasp-library: Multi-selection editing; React Flow's selection feeds the library's existing deletion of elements and relationships, one undoable edit.
- `useful.md › Post-tool selection mechanism` · partly · hand-written: Selection behaviour after a palette tool; our tools select what they created, MUI Snackbar shows their messages as toasts.
- `useful.md › Explicit cross-view synchronization` · unclear · hand-written: Selection policy across panels is ours; Damon decided one shared selection everywhere, so views follow it automatically rather than on explicit reveal.
- `useful.md › Selection applied to views` · unclear · hand-written: The shared selection store Damon decided on; Explorer tree expands to the items and Details rebinds; MUI tree view gives expansion.
- `useful.md › Workbench selection applied to the diagram` · unclear · react-flow: Shared selection shown on the canvas; React Flow selects nodes by id and fits the viewport to them; element-to-node mapping is ours.
- `useful.md › Mini map overlay and toggle` · missing · react-flow: Standard navigation aid of a mature canvas; React Flow's MiniMap component, shown in the spike; toggle and per-diagram memory are a few lines.
- `useful.md › Toggle snap to grid` · missing · react-flow: Direct-manipulation aid for tidy diagrams; React Flow's snapToGrid and snapGrid props, switched by a toolbar toggle held per diagram.
- `useful.md › Helper lines while moving nodes` · missing · hand-written: Direct-manipulation feel of a mature canvas; not built into React Flow, but its documented helper-lines example on onNodeDrag is ours to port.
- `useful.md › Initial fit to screen on open` · partly · react-flow: Viewport behaviour of a mature canvas; React Flow's fitView on init; the workspace file's saved camera can still take precedence.
- `useful.md › Reveal selected nodes in the viewport` · partly · react-flow: Shared selection follow-through; React Flow's fitView with a node list and duration pans to selected nodes, skipping those already visible.
- `useful.md › Move multiple selected elements` · missing · react-flow: Basic multi-selection manipulation Grasp lacks; React Flow drags every selected node together by default, parents unchanged.
- `useful.md › Resize persistence` · missing · react-flow: Damon asked to resize boxes; React Flow's NodeResizer gives handles and size changes, the view layout stores width and height.
- `useful.md › Drop a definition on a usage to type it` · missing · hand-written: Explorer-to-canvas direct manipulation of a mature workbench; tree drag onto a React Flow node (onDrop) is ours, the library already sets typing.
- `useful.md › Explorer drop resolution and no-duplicate rule` · missing · hand-written: Explorer drops onto the canvas; where a dropped element lands and the already-shown warning are our view-model rules over React Flow's onDrop.
- `useful.md › Multi-node drag and drop` · missing · hand-written: Multi-selection manipulation; React Flow drags the group, but re-parenting every dropped node into the container (model and parentId) is our drop handler.
- `useful.md › Duplicate element on the diagram` · missing · grasp-library: Editing basic of a mature tool (Ctrl+D); deep-copying an element with content as a sibling is a library operation, the canvas shows the copy.
- `useful.md › Compatible drop targets` · partly · hand-written: Direct-manipulation feedback; React Flow's getIntersectingNodes finds nodes under the drag, the library's containment rules filter candidates, deepest wins.
- `useful.md › Drop target feedback` · partly · hand-written: Mature drag feedback; node components are ours, so highlighting valid and invalid targets during onNodeDrag is a class toggle with MUI theme colours.
- `useful.md › Move checks and feedback messages` · partly · grasp-library: Refusal feedback on moves; the rules (no descendant target, no read-only library target) belong in the model library, MUI Snackbar reports them.
- `useful.md › Connection line` · missing · react-flow: Mature connect gesture; React Flow draws a preview connection line while dragging from a handle, custom via connectionLineComponent.
- `useful.md › Compatible-target highlighting during connection` · missing · hand-written: Mature connect feedback; React Flow's useConnection and isValidConnection expose the in-progress connection, dimming incompatible nodes is our node styling.
- `useful.md › Reconnect composition edges` · missing · grasp-library: Reconnecting is mature direct manipulation; React Flow's onReconnect gives the gesture, moving the child to its new owner with cycle check is library work.
- `useful.md › Reconnect connector edges with owner recomputation` · missing · grasp-library: Reconnecting connectors is mature direct manipulation; React Flow's onReconnect gives the gesture, recomputing the best common owner is a library computation.
- `useful.md › Reconnect palette tool` · partly · react-flow: Mature edge editing; React Flow's reconnectable edges let the user drag an end, and an edge palette entry can start the same change.
- `useful.md › Single edge tool auto-invoked` · partly · hand-written: Palette behaviour of a mature workbench; our connector palette skips its menu when the library's rules allow one relationship kind between the ends.
- `useful.md › Connector palette filtered by target compatibility` · partly · hand-written: Palette behaviour; our connector palette filters tools by the library's end-type rules, and React Flow's isValidConnection gates the drop itself.
- `useful.md › Standard diagram description invariants` · partly · react-flow: Every line reconnectable, every box and line editable and deletable; React Flow's reconnectable edges fill Grasp's one gap, direct edit and delete exist.
- `useful.md › Arrange all: Flow Layout` · missing · elk: Arrange is a mature-tool staple and places what Claude adds to a view; elkjs layered with direction DOWN, as the spike ran.
- `useful.md › Arrange all execution behavior` · missing · elk: Arrange pass of a mature tool; elkjs handles nesting and order, React Flow's fitView finishes, pinned nodes and persistence are our glue.
- `useful.md › Layout section of the group palette` · missing · hand-written: Menus of a mature workbench; a multi-selection palette (MUI menu) over our align, distribute and size functions, plain arithmetic on React Flow nodes.
- `useful.md › Align left / Align center / Align right` · missing · hand-written: Alignment tools are mature-editor staples; setting x of selected React Flow nodes against the last-selected reference is a few lines of ours.
- `useful.md › Align top / Align middle / Align bottom` · missing · hand-written: Alignment tools are mature-editor staples; setting y of selected React Flow nodes against the last-selected reference is a few lines of ours.
- `useful.md › Distribute horizontal spacing / Distribute vertical spacing` · missing · hand-written: Distribute tools are mature-editor staples; equalising gaps between three or more sibling React Flow nodes is coordinate arithmetic of ours.
- `useful.md › Adjust size` · missing · hand-written: Once boxes are resizable (Damon's ask), a reset-to-content tool clears the stored size; our node components measure their own content.
- `useful.md › Multiple edges and self-loops` · missing · hand-written: Self-transitions and parallel relationships must draw apart; React Flow's built-in edges overlap, so our edge component offsets parallels and draws loops.
- `useful.md › Handle ordering on a node side` · missing · hand-written: Clean edge attachment is part of mature notation; React Flow handles are fixed, so spreading edge ends along a side is our layout code.
- `useful.md › SysON views' layout settings` · partly · elk: Matches the reference workbench's top-down arrangement; a per-view-kind direction passed to elkjs, and no auto-arrange on open keeps saved places.
- `useful.md › Automatic handle side selection` · partly · hand-written: Edges leaving the facing side is standard notation presentation; React Flow handles are fixed, so the floating-edges pattern picks the side, as Grasp's elbows do.
- `useful.md › Border node default placement and parent resize` · partly · hand-written: Resizable boxes (Damon's ask) need ports re-stacked along their side on resize; port child nodes under React Flow's NodeResizer are our layout code.
- `useful.md › Show content as Nested / as Tree` · missing · hand-written: Standard SysML alternative presentation of composition (nested or decomposition tree); hand-written view logic toggling React Flow nodes and edges, ELK re-lays out.
- `useful.md › Add existing connected elements` · missing · hand-written: Mature palette tool to populate a view from the model, vital once text is read; hand-written relationship walk, React Flow adds nodes and edges.
- `useful.md › Related Elements section on nodes` · missing · hand-written: Palette section exposing nested or connected elements, the mature way to fill a view; hand-written over the model graph, replacing Grasp's Show list.
- `useful.md › Background Related Elements and New Comment` · missing · hand-written: Background palette sections of a mature workbench; New Comment also serves comments-as-elements; hand-written tool wiring over the model library.
- `useful.md › Add existing elements in a compartment` · partly · hand-written: Fills compartments from the model, needed once elements arrive from text; hand-written expose into compartment nodes, Grasp's Show list nesting today.
- `useful.md › Close button, click-away and Escape` · missing · mui: Standard behaviour of the right-click palette Damon chose over the header palette; MUI Popover gives click-away and Escape closing.
- `useful.md › Quick-access tool bar` · missing · hand-written: Icon shortcuts atop the palette are part of the mature palette feel; hand-written row of MUI IconButtons over our tool table.
- `useful.md › Tool sections with drill-down navigation` · missing · hand-written: Sectioned palette replaces Grasp's flat header palette (Damon's decision); hand-written drill-down over MUI List, needed once tools cover every metaclass.
- `useful.md › Extension sections: Appearance, Layout, Show in` · missing · hand-written: Align, distribute and same-size are mature direct manipulation; hand-written position math on React Flow nodes with MUI icons; Appearance needs a style model.
- `useful.md › Palette search field ('Search Tool')` · missing · mui: A search field makes a palette holding tools for every metaclass usable; MUI TextField with clear adornment, the filtering is ours.
- `useful.md › Flat search results with keyboard navigation` · missing · hand-written: Type, arrow, Enter is how a mature palette runs a tool among many; hand-written flat result list with document-level key handling.
- `useful.md › Group palette on multi-selection` · missing · hand-written: Multi-selection is mature selection behaviour Grasp lacks; React Flow gives marquee and shift-select, the group palette and its tools are ours.
- `useful.md › Diagram background palette` · partly · hand-written: Damon's decision: right-click palettes replace the header palette; hand-written palette opened from React Flow's pane context-menu event.
- `useful.md › Edge palette and edge selection feedback` · partly · react-flow: Selected-edge feedback and an edge palette are mature selection behaviour; React Flow selects edges and fires edge context-menu events, palette rows ours.
- `useful.md › Tool list item` · partly · mui: Icon, label, tooltip and shortcut rows give the palette its mature look; MUI ListItem, ListItemIcon and Tooltip; metaclass icons vendored.
- `useful.md › Default edge palette` · partly · react-flow: Reconnecting an edge end by dragging is direct manipulation; React Flow's reconnectable edges give it, Delete, Edit and Hide are palette rows.
- `useful.md › Selection dialog for tools` · missing · mui: An element-picker modal is the mature way to choose a type or target; MUI Dialog with a tree list; Grasp's panel selects do this today.

#### Notation (45)

- `core.md › Definition owned-usage composition edges` · missing · hand-written: Standard notation for ownership Grasp already holds; a custom React Flow edge with a diamond marker, reconnect re-owning the usage via the model library.
- `core.md › Composite vs reference nested-usage composition edges` · missing · hand-written: Filled or hollow diamond from isReference is presentation of ownership Grasp holds; a custom React Flow edge of ours, hidden when the child nests.
- `core.md › Relationship edges appear automatically` · partly · hand-written: Synchronized edges are mature-diagram behaviour; our view code derives edges from model relationships whenever both ends are shown, nothing from React Flow.
- `core.md › Subclassification edge` · partly · react-flow: Grasp draws it; the gap is dragging an end to reconnect. React Flow's edge reconnection, the model library updating the relationship ends.
- `core.md › Feature typing edge` · partly · react-flow: Grasp draws its defined-by line; the gap is reconnecting ends. React Flow's edge reconnection, our marker for the dotted closed arrowhead.
- `core.md › View frame node rendering` · partly · hand-written: Standard frame notation; Grasp has the tab-and-frame look, the gap is a view nested as a node. A custom React Flow group node of ours.
- `core.md › Interconnection View diagram` · partly · hand-written: Creating a view on a chosen element from the Explorer is workbench flow; our explorer menu (MUI) makes a typed ViewUsage and opens its tab.
- `core.md › Port usage border node` · partly · hand-written: Matching SysON's port glyphs and outside labels is presentation only; a custom border-node component of ours clamped to the parent's edge in React Flow.
- `core.md › Interface edge` · partly · react-flow: Grasp draws it; the gap is reconnecting ends by drag. React Flow edge reconnection, the model library recomputing the owner from the new ends.
- `core.md › Flow edge` · partly · react-flow: Grasp draws flows; the gap is reconnecting ends. React Flow edge reconnection with our filled-arrow marker and editable 'name : Type' label.
- `core.md › Binding connector edge` · partly · react-flow: Grasp draws bindings; the gap is reconnecting ends. React Flow edge reconnection, the model library recomputing owner and end chains.
- `core.md › Connection usage edge` · partly · react-flow: Grasp draws connections; the gaps are reconnecting ends (React Flow reconnection) and typing by label edit, which our grammar and the model library add.
- `core.md › Action Flow View diagram` · partly · hand-written: Grasp has the view kind; creating it on a chosen package or action from the Explorer is workbench flow; our explorer menu built on MUI.
- `core.md › New Parameter In / Inout / Out` · partly · hand-written: Grasp has parameters and direction; per-direction palette tools are workbench convenience. Our palette tools in MUI menus, calling the model library.
- `core.md › Control nodes` · partly · hand-written: Grasp has every control node; only the bar colour differs. Custom React Flow node components of ours, restyled to actionGreen.
- `core.md › Decision and Merge nodes` · partly · hand-written: Glyph size and label placement are presentation; custom React Flow node components of ours with SysON-style images and a bottom-centred outside label.
- `core.md › Fork and Join nodes` · partly · react-flow: Colour and resizability are look; React Flow's NodeResizer gives horizontal resizing, our node component draws the green bar with edges attaching to it.
- `core.md › Succession edge` · partly · react-flow: Grasp shows guards; the gap is reconnecting ends. React Flow edge reconnection, our dashed open-arrow edge with '[guard]' begin label.
- `core.md › State Transition View diagram` · partly · hand-written: Grasp has the view kind; creating it on a chosen part or state from the Explorer is workbench flow; our explorer menu built on MUI.
- `core.md › Start and Done state nodes` · partly · hand-written: Grasp has start and done; the gap is the standard circle glyphs and sizes. Custom React Flow node components of ours with SysON-style images.
- `core.md › Transition edge and its label format` · partly · hand-written: Label format and the dashed-or-solid rule are presentation; our custom React Flow edge builds the label from trigger, receiver, guard and effects.
- `useful.md › InterfaceDefinition palette` · partly · hand-written: Right-click node palettes replace the header palette Damon dislikes; per-metaclass tool lists are our code, hosted in MUI menus.
- `useful.md › PartDefinition palette` · partly · hand-written: A right-click palette on part definitions replaces the header palette; the tool list by metaclass is our code in MUI menus.
- `useful.md › PartUsage palette` · partly · hand-written: Same right-click palette on part usages, adding subsetting, typing, flows and composite/ref toggles; our tool lists in MUI menus.
- `useful.md › Node display rule` · unclear · hand-written: Root versus nested placement of exposed elements is the view-to-nodes mapping we write (React Flow parentId); OpenSysML renderView also reports parents.
- `useful.md › Moving and removing nodes inside Package nodes` · missing · react-flow: Dragging a node into a package and keeping child positions is direct manipulation; React Flow drag and parentId, re-owning on drop is ours.
- `useful.md › ViewUsage frame palette` · missing · hand-written: A right-click palette on a view frame creating members exposed in it; our tool list in MUI menus, same as the background palette.
- `useful.md › Note node layout` · partly · react-flow: Notes sized to their text with a kept user size; React Flow's DOM-measured nodes and NodeResizer, minimum-size CSS ours.
- `useful.md › View frame node layout` · partly · hand-written: Frames growing to fit children while keeping a user-resized size is a layout handler we write; React Flow's NodeResizer gives the handles.
- `useful.md › Custom node interactions` · partly · react-flow: Resize handles, connection handles, selection outline, drop feedback and fading on every node come built in with React Flow; Grasp lacks handles and resizing.
- `useful.md › Custom node layout` · partly · hand-written: Packages, frames and notes growing to fit with user sizes and minimums is the resizable-box behaviour Damon asked for; a layout handler of ours.
- `useful.md › Compartments hidden by default (nodes start collapsed)` · missing · hand-written: Mature-workbench node behaviour; React Flow nodes are our components, so collapsed-by-default is our per-node view state, not a library feature.
- `useful.md › Reveal a suitable compartment after creation` · missing · hand-written: Direct-manipulation polish that follows collapsed-by-default; a reveal rule after creation is our own view-state logic, nothing in React Flow does it.
- `useful.md › Free-form compartments grow with their node` · partly · react-flow: Resizing boxes is Damon's explicit ask; React Flow's NodeResizer resizes the node and a flex layout lets the free-form compartment take the remaining height.
- `useful.md › Free-form compartments inside list nodes` · partly · react-flow: Nested free-form areas are how a mature node shows action flows or interconnections; React Flow sub-flows (parent nodes, extent) place children freely inside our compartment.
- `useful.md › Compartment emptiness rules for single-entry compartments` · partly · hand-written: Palettes that hide inapplicable tools feel mature; the precondition is a single-entry check on the model that our palette builder makes before listing tools.
- `useful.md › PartUsage node palette` · partly · hand-written: Right-click palettes replacing the header palette are Damon's decision; the per-kind tool list is ours, MUI supplies the menu and sections.
- `useful.md › Border node palettes and labels` · partly · hand-written: Port palette with delete, edit, duplicate and 'name : Type' labels is workbench polish; border nodes and labels are our React Flow components, palette ours.
- `useful.md › Port-to-port edge kind choice` · partly · react-flow: Connect first, then choose interface or binding, is the direct-manipulation order; React Flow's onConnect gives the gesture, a small MUI menu the choice.
- `useful.md › Background Behavior section custom tools` · partly · hand-written: The plane's right-click palette replaces the header palette; its Behavior section is our tool list, conditioned on the view's root action.
- `useful.md › ActionDefinition node palette` · partly · hand-written: Right-click palette per node kind replaces the header palette Damon dislikes; Structure, Behavior and View-as sections are our tool list in MUI menus.
- `useful.md › ActionUsage node palette` · partly · hand-written: Same right-click palette pattern on action usages; our per-kind tool list (attributes, parts, parameters, items, nested behaviour) in an MUI menu.
- `useful.md › Accept action payload and receiver tools and dialogs` · partly · mui: Selection dialogs offering 'create new' or 'pick existing' are workbench interaction; MUI Dialog and list widgets, the choices filled from the model by us.
- `useful.md › Drop action into action flow compartment` · unclear · react-flow: Dragging a node into another's compartment with its content intact is direct manipulation; React Flow parent nodes carry children when reparented, we update the model.
- `useful.md › StateUsage / StateDefinition node palette` · partly · hand-written: Right-click palette on states (start, done, nested, parallel, entry/do/exit) replaces the view's top palette; our tool list in MUI menus; exhibit states need the kind.

#### Editing (23)

- `core.md › Multi-line node label format` · partly · grasp-library: Standard «keyword» / 'wheels[4] : Wheel' presentation with redefinitions and values; label text composed by the kept library, drawn in React Flow nodes.
- `core.md › SysON node label presentation` · partly · hand-written: Centred wrapping headers, rule only with children, ellipsis on packages, icons: CSS and layout of our React Flow node components.
- `core.md › Coloured per-metaclass SysML icons` · missing · hand-written: Much of the mature tree and diagram look; no library supplies SysML icons, so vendor SysON's EPL-2.0 SVG set or draw ours.
- `core.md › Default diagram colors` · partly · hand-written: SysON's white nodes, black 1 px edges and labels are our node and edge component styles; React Flow imposes no colours.
- `core.md › Edge arrow markers` · partly · hand-written: Full standard arrowhead set with selection colour; React Flow edges take marker ids but ship only two shapes, so SVG defs are ours.
- `useful.md › Prefix `abstract`` · missing · grasp-library: Grasp already holds isAbstract (Advanced tab); typing 'abstract' in a label is direct manipulation; a small addition to the kept label library.
- `useful.md › Direction prefixes `in` / `out` / `inout`` · missing · grasp-library: Direction is already held (set in the panel); typing 'in'/'out' on a row is direct manipulation; the kept label library's row rule.
- `useful.md › Direct edit of edge begin, center and end labels` · partly · hand-written: Editing a succession's guard at the edge start is direct manipulation; React Flow's EdgeLabelRenderer hosts the labels, the edit tool is ours.
- `useful.md › Delete a part by leaving its operator empty` · partly · grasp-library: Direct-manipulation convention Grasp follows for ':' and '[]'; extend to ':>', ':>>' and '<>' in the kept label library as those parts arrive.
- `useful.md › Tokens that end the name part` · unclear · grasp-library: Predictable in-place editing needs SysON's name-ending tokens; check the kept label library's tokeniser against ':', ':>', '::', ':>>', ':=', '[', default, ordered, nonunique.
- `useful.md › Multiplicity before or after typing/subsetting/redefinition` · unclear · grasp-library: Editing ergonomics: '[n]' accepted after the type as after the name; the kept label library reads a multiplicity after each part, so verify only.
- `useful.md › Wrapped node labels` · missing · react-flow: Damon asked for resizable boxes; a narrower box needs its name to wrap; React Flow's NodeResizer plus CSS wrapping on HTML labels.
- `useful.md › Control node and actor outside labels` · partly · hand-written: Standard notation puts fork, join, decision and merge names below the symbol; the custom React Flow node renders an outside label; actors come with concepts.
- `useful.md › Edge begin, center and end labels` · partly · react-flow: Mature edge presentation: a label near each end and one at the middle; React Flow's EdgeLabelRenderer places HTML labels at points computed on the path.
- `useful.md › Outside labels` · partly · hand-written: Labels below a node (control nodes, actors) are standard presentation; a custom React Flow node renders them outside its box, as Grasp does for ports.
- `useful.md › Label overflow strategy` · partly · hand-written: Resizable boxes need a wrap-or-ellipsis policy for labels; CSS (overflow-wrap, text-overflow) on React Flow's HTML labels; no per-description configuration needed.
- `useful.md › Header separator display mode` · partly · hand-written: A rule under the header only when compartments follow is standard presentation Grasp already approximates; CSS in the custom node's header.
- `useful.md › Label auto-wrap and containment` · unclear · hand-written: Names must wrap inside a resized box and keep typed line breaks; CSS (white-space: pre-line, overflow-wrap) on React Flow's HTML labels.
- `useful.md › Rectangular node rendering` · partly · react-flow: Standard node drawing with fill, border colour, radius and dash; React Flow custom nodes styled by CSS replace Grasp's hand-drawn SVG rectangles.
- `useful.md › Image node style` · partly · react-flow: Start, done, decision, merge and direction glyphs as image nodes; React Flow custom nodes can hold SVG, and Grasp's glyphs can move in.
- `useful.md › List compartment style` · partly · react-flow: SysON's compartment look: centred italic 12pt header, border, list layout; compartments as child areas of React Flow custom nodes styled by CSS.
- `useful.md › Default node sizes` · partly · hand-written: SysON's default sizes per kind give the familiar proportions; a constants table in our node descriptions that React Flow sizes nodes from.
- `useful.md › Edge style properties` · partly · react-flow: Standard edge notation: colour, dash patterns, arrowheads and orthogonal routing; React Flow edge types and markers, SysON adds pathfinding for Manhattan routes.

#### Model behaviour (8)

- `core.md › Redo and undo keyboard shortcuts` · missing · hand-written: Undo/redo is part of the workbench feel; React Flow has no history, Grasp's changes.js has no redo, so a new command stack.
- `core.md › Ctrl/Cmd+Z undo in the project editor` · partly · hand-written: Workbench-wide undo with redo; a hand-written history over model and layout changes, since React Flow and Dockview provide none.
- `core.md › In-memory change history (undo/redo)` · partly · hand-written: Per-action change records with reverse and reapply; Grasp's Proxy recorder undoes but cannot redo, no library supplies this.
- `core.md › Undo/redo of Explorer changes` · partly · hand-written: Tree edits must join the same undo/redo history; the Explorer panel and its commands are ours.
- `core.md › Undo and redo of Details view edits` · partly · hand-written: Property edits from MUI fields recorded as one step each, redoable; our history, with focus-aware shortcuts SysON lacks.
- `core.md › Undo of moves, resizes and label moves` · partly · hand-written: Moves and resizes come as React Flow node changes; recording them as undoable, redoable steps is our history code.
- `useful.md › Inline validation messages in forms` · partly · mui: Details-view polish of a mature workbench; MUI fields take error and helperText props, our Details view maps diagnostics to fields.
- `useful.md › Diagram-state undo/redo` · partly · hand-written: Undo/redo belongs to the workbench feel; React Flow has no undo, so our stack must record view state (places, folds, hiding) with the model.

#### Libraries (5)

- `useful.md › Libraries directory in the Explorer` · missing · hand-written: Explorer view showing the 94 bundled standard libraries, decided read-only; our tree content over OpenSysML's library symbols, MUI tree widget.
- `useful.md › Explorer library filters` · missing · hand-written: Explorer filters keep the bundled standard libraries from swamping the tree; our filter logic on each symbol's origin file from OpenSysML.
- `useful.md › 'Search in libraries' switch` · missing · hand-written: Search view option needed once libraries are bundled, else every search hits them; our search over OpenSysML's walk, skipping library files.
- `useful.md › Qualified names for standard-library targets in diagram labels` · missing · hand-written: Standard notation detail in labels; our label code, using OpenSysML's resolved qualified id and origin file to tell library targets apart.
- `useful.md › Read-only rules for libraries and read-only imports` · missing · hand-written: Bundled libraries are read-only by decision, so Explorer, Details and diagrams must refuse edits; our predicate on OpenSysML's origin file.

#### Tables and the Requirements Table View (2)

- `useful.md › Row header column and selection` · partly · hand-written: One shared selection everywhere is Damon's decision; a row click must select the element in Explorer and Details; our selection store.
- `useful.md › Table selection highlighting` · partly · hand-written: Selection behaviour: rows of selected elements marked from the shared selection; our selection store drives material-react-table's row selection state.

#### Projects, files, persistence and image export (4)

- `core.md › Export the diagram as an image menu` · missing · hand-written: Image export is in the workbench feel; React Flow has none, so html-to-image for PNG as Sirius Web, our SVG serializer.
- `useful.md › PNG export` · missing · hand-written: Image export is in the look list; React Flow has none built in; html-to-image over the viewport as Sirius Web does, vendored.
- `useful.md › SVG export (default)` · missing · hand-written: Image export; html-to-image's toSvg snapshots React Flow's HTML nodes into SVG; React Flow itself offers no export.
- `useful.md › SVG (Experimental) native export` · missing · hand-written: True vector SVG needs our own converter from React Flow's HTML nodes; Grasp's current SVG drawing made this nearly free.

### Reading and writing SysML v2 text (45)

#### Workbench (2)

- `useful.md › Read-only Details widgets for read-only elements` · partly · hand-written: Bundled read-only standard libraries (Damon's decision) need locked Details; a read-only predicate of ours, OpenSysML's symbol origins tell library content apart.
- `useful.md › Diagram on an existing typed ViewUsage` · missing · opensysml: A view typed in imported text must become a diagram of that kind; OpenSysML resolves the ViewUsage's typing and renders its exposed tree.

#### Notation (2)

- `useful.md › Connecting to an inherited port uses it without redefining it` · unclear · grasp-library: Correct text for an inherited port end is a feature chain, not a redefinition; the writer (Grasp's toSysML or its successor) must emit chains.
- `useful.md › Implicit succession source/target` · partly · opensysml: Reading 'then' shorthand needs implicit source and target resolved; that belongs to OpenSysML's resolver on import, the writer keeps emitting then-chains.

#### Editing (5)

- `core.md › Typing `: Type`` · partly · opensysml: Name resolution against libraries with imports added; OpenSysML resolves scoped then global with the bundled standard library, which Grasp lacks.
- `useful.md › Automatic SI unit import` · missing · hand-written: Name resolution of unprefixed units; OpenSysML resolves SI::name against bundled libraries but adds no import, so the retry and insertion are ours.
- `useful.md › All-or-nothing validation (warnings count as errors)` · missing · opensysml: Only a parsed, resolved expression is stored; OpenSysML's diagnostics on the re-parsed text decide acceptance, nothing is written until they pass.
- `useful.md › Expression textual representation` · missing · grasp-library: Expressions must be written as SysML text for labels, tree and export; Grasp's writer prints no expressions yet, or keep the typed text verbatim.
- `useful.md › Serializer operator coverage` · missing · grasp-library: Every operator the reader accepts must be written back; OpenSysML parses them all, Grasp's writer prints no expressions yet.

#### Model behaviour (3)

- `core.md › Name resolution of direct-edit specializations` · partly · opensysml: Resolving ':', ':>' and ':>>' names through libraries, imports and qualified names; OpenSysML resolves them, Grasp only in its one package.
- `useful.md › Name lookup: scoped resolution then global fallback` · partly · opensysml: Name resolution is a text need; OpenSysML resolves by scope with imports, qualified and short names; SysON's global fallback is lenience we would add.
- `useful.md › Project models only` · partly · opensysml: Bundled standard libraries exist for resolution; OpenSysML diagnostics would need filtering to the user's files, their per-file origin unverified in the spikes.

#### Text (28)

- `core.md › Import a .sysml/.kerml file as a new model` · missing · opensysml: Reading text is need 1; OpenSysML parses .sysml/.kerml in the page with diagnostics as the import report; file via File System Access.
- `core.md › Download a model as a textual .sysml file` · partly · grasp-library: Grasp's toSysML already writes pilot-valid text; saving it as a .sysml file is showSaveFilePicker glue. OpenSysML wasm cannot convert.
- `core.md › Definitions` · partly · grasp-library: Writing every definition kind: extend toSysML with variation, individual and metadata prefixes and all def keywords.
- `core.md › Usage declarations` · partly · grasp-library: Writing usages: toSysML lacks '::>' references, ordered/nonunique and general values; extended alongside the fuller model.
- `core.md › Connections` · partly · grasp-library: Writing connections: toSysML writes binary connect a to b, lacks n-ary ends and end multiplicities.
- `core.md › Textual notation as exchange format with other SysML v2 tools` · partly · opensysml: Round trips with other tools need the reader; OpenSysML reads their text, Grasp's writer already passes the pilot validator.
- `core.md › SysML v2 textual export format` · partly · grasp-library: Clean text: quoting, '* /' escape, shortest resolvable names, warnings; toSysML does quoting and escape, lacks warnings; shortest names unchecked.
- `useful.md › New objects from text (Insert SysML v2 text dialog)` · missing · opensysml: Insert text, need (1); OpenSysML parses the fragment and reports; an MUI dialog and splicing under the chosen parent are our code.
- `useful.md › Names in inserted text resolve against the existing model` · missing · opensysml: Inserted text must link to existing elements; OpenSysML resolves names on demand across sources and the bundled standard library (spike D).
- `useful.md › Partial import on syntax errors` · missing · opensysml: Import must survive syntax errors and locate them; OpenSysML gives positioned diagnostics; how far it recovers past an error is unverified.
- `useful.md › Unresolvable reference warning and unset` · missing · opensysml: Unknown names must warn, not block; OpenSysML keeps a syntax-only AST and resolves on demand, so unresolved names become diagnostics, not dangling proxies.
- `useful.md › Import dependencies first` · missing · opensysml: SysON's ordering constraint; OpenSysML parses all files as one source set (Apollo 11, 28 files) and resolves on demand, so order should not matter.
- `useful.md › Name resolution with the specification's local namespaces` · missing · opensysml: Spec-faithful scoping makes imported models link up; OpenSysML implements it, agreeing with the pilot on 522 of 924 corpus files; pilot remains the check.
- `useful.md › Textual import coverage` · missing · opensysml: Breadth of readable text, need (1); OpenSysML's parser covers SysML v2 and KerML 1.1, all 110 library files parse; conformance not certified.
- `useful.md › Graphical views from imported textual models` · missing · hand-written: Text-to-diagram round trip; our view layer maps the parsed model to React Flow nodes; OpenSysML's renderView can seed view contents.
- `useful.md › Upload format detection and sanitization` · missing · hand-written: Open .sysml/.kerml or Grasp JSON by extension through the File System Access API; OpenSysML parses and reports; XMI and EMF JSON are Sirius-only, dropped.
- `useful.md › Upload model button and dialog` · partly · hand-written: Entry point for reading .sysml files, need (1); showOpenFilePicker works from file:// (spike A), replacing the upload dialog; OpenSysML parses.
- `useful.md › Switching between graphical and textual` · partly · hand-written: Round trip between diagram and text; a text tab beside diagram tabs in Dockview; keeping both in step via OpenSysML reparse is our code.
- `useful.md › Partial textual editing` · partly · hand-written: Editing model fragments as text; Grasp's label direct edit stays (grasp-library); a text editor pane with OpenSysML diagnostics is new code.
- `useful.md › Shortest resolvable qualified name (deresolver)` · partly · grasp-library: Writer concern, need (1); Grasp's toSysML prints plain names in one package; shortening across namespaces needs scope-aware rules, verifiable with OpenSysML resolution.
- `useful.md › Namespaces, packages and libraries` · partly · grasp-library: Export side of nested packages (a decided format change); Grasp's writer prints one package; libraries are bundled read-only and never written.
- `useful.md › Usage prefixes and when 'ref' is written` · partly · grasp-library: Prefix order and 'ref' rules in exported text; Grasp's writer has direction and abstract; constant, derived, end and ref are small additions.
- `useful.md › Values and literals` · partly · grasp-library: Printing feature values once the model holds them (a concepts gap); Grasp's writer prints shape dimensions only; literal rules are straightforward.
- `useful.md › Comments, documentation and textual representations` · partly · grasp-library: Printing comments, docs and reps; Grasp writes doc and rep; comments with about/locale follow the decision to make comments elements.
- `useful.md › Imports and exposes` · partly · grasp-library: Printing user imports and exposes in every form; Grasp's writer emits only its own imports and view exposes; the model must hold user imports.
- `useful.md › Action nodes` · partly · grasp-library: Printing action kinds; Grasp writes send and accept; assign and perform need the model kinds (concepts) plus writer rules.
- `useful.md › Textual export coverage` · partly · grasp-library: Writing every kind the model will hold, needs (1)(2); OpenSysML wasm has no convert, so Grasp's kept writer must grow metamodel-driven.
- `useful.md › Interoperability support matrix (project/model exchange)` · partly · hand-written: A README statement of formats in (.sysml, .kerml, own JSON) and out (text, JSON, image); the standard API line is server-only, dropped.

#### Libraries (4)

- `core.md › KerML Standard Library (bundled)` · missing · opensysml: Libraries are needed for resolution and typing; OpenSysML bundles the pilot 2026-09 standard library files, all parsing; Grasp ships none.
- `core.md › All standard libraries in every project` · missing · opensysml: Every model resolves against all 94 libraries; OpenSysML loads them for name resolution; Explorer filters showing them are ours.
- `core.md › SysML Standard Library (bundled)` · partly · opensysml: Units, quantities, Parts, Ports, Views to type by; in OpenSysML's bundled library, read-only as Damon decided; Grasp's page holds none.
- `useful.md › Standard-library type resolution with automatic import` · missing · opensysml: Name resolution against the standard libraries is reading text; OpenSysML resolves and bundles them; finding the namespace and adding the import is ours.

#### Projects, files, persistence and image export (1)

- `core.md › Upload a model (XMI / JSON)` · partly · opensysml: Opening .sysml/.kerml as a new model via showOpenFilePicker; OpenSysML parses it; SysON's XMI and JSON formats are not needed.

### All of SysML's concepts (221)

#### Workbench (29)

- `core.md › New object dialog (child element)` · partly · grasp-library: Creating any allowed child by type is a creation tool for every kind; Grasp's metamodel.js gives metaclasses, allowed-child rules need writing; MUI dialog shows them.
- `core.md › Base, feature and type core features` · partly · grasp-library: Per-metaclass Details fields (short name, individual, parallel, reqId) are Details for every attribute; metamodel.js already drives Core/Advanced tabs; MUI widgets render.
- `core.md › New representation creates a typed ViewUsage` · partly · grasp-library: A ViewUsage owned by any element through the right membership is faithful SysML structure; model.js creates typed view usages today, ownership and memberships need adding.
- `useful.md › Tree filters menu` · missing · hand-written: Needed once memberships, the 94 libraries and expression internals are in the tree; predicates of ours over element kinds; MUI checkbox menu.
- `useful.md › Label: short-name prefix` · missing · grasp-library: Grasp holds no short names; add the field to its model (OpenSysML's parse supplies it) and prefix the row label.
- `useful.md › Hide Memberships` · partly · hand-written: A metamodel-faithful model has Membership nodes; our tree builder elides them by default and shows them on request.
- `useful.md › Root contents and order` · partly · opensysml: Roots are the open .sysml files, then a read-only Libraries folder; OpenSysML loads and resolves the 94 standard files.
- `useful.md › Label: main text` · partly · grasp-library: Grasp's labels module already builds row text; extend it to every metaclass and to expressions, whose text comes from the source range.
- `useful.md › Candidates on a Package or root Namespace` · partly · grasp-library: Creating every concrete kind under a Package; Grasp's generated metamodel.js lists the metaclasses; a containment table picks the candidates.
- `useful.md › Candidates on Definitions` · partly · grasp-library: Any Definition takes every Usage and Import kind plus Subclassification and docs; a per-metaclass containment table over Grasp's metamodel.
- `useful.md › Candidates on Attribute, Enumeration, Port and Requirement Definitions` · partly · grasp-library: Specific lists for attribute, enum, port and requirement definitions; rows of the same containment table; Grasp lacks three of these defs.
- `useful.md › Candidates on Usages` · partly · grasp-library: Usages take attributes, typings, subsettings, redefinitions and literals; containment table over Grasp's metamodel; literals are new to Grasp.
- `useful.md › Child creation candidates per container` · partly · grasp-library: New object dialog offering only kinds valid in the container; MUI Select over Grasp's containment table; Grasp's palette follows the view kind.
- `useful.md › Child creation candidates for definitions, usages and memberships` · partly · grasp-library: The full containment table (FeatureMembership takes any Feature, OwningMembership any non-Membership); derived from Grasp's generated metamodel.js.
- `useful.md › Move converts membership kind and keeps exposes` · partly · grasp-library: Needs explicit Membership and Expose elements in the model; Grasp's library move must create the fitting membership and redirect exposes.
- `useful.md › Generic reference widget` · missing · grasp-library: Any changeable reference set from the form; Grasp's generated metamodel lists them, its model must hold them; MUI Autocomplete draws the picker.
- `useful.md › Comment text area` · missing · grasp-library: Comments as elements (Damon's decision) edited from the Details; Grasp's library must hold Comment annotations; an MUI multiline field edits the body.
- `useful.md › Visibility radio` · missing · grasp-library: Membership visibility is a SysML concept Grasp's model does not hold; the library must keep it, an MUI radio group edits it.
- `useful.md › Redefines widget` · missing · grasp-library: Redefinition is a relationship Grasp's model does not keep; the library must hold it, an MUI reference picker edits each one.
- `useful.md › Transition Source and Target widgets` · missing · grasp-library: Retargeting a transition from the form covers a concept Grasp edits only by drawing; the library changes relationship ends, MUI pickers filtered to states.
- `useful.md › Core page group order` · partly · hand-written: More Core groups (visibility, redefinition, kind, expressions) make the form cover more concepts; the group order is our own form description.
- `useful.md › Advanced page` · partly · grasp-library: Every metaclass attribute seen and set: Grasp's generated metamodel already lists them, its model must hold the 'not held yet' ones; MUI checkboxes.
- `useful.md › Relationship core features` · partly · hand-written: Every relationship kind showing its two ends covers more concepts; our form must add dependencies, subsettings and redefinitions, the library holds ends.
- `useful.md › Multi-line body text area` · partly · mui: Bodies of Comment, Documentation and TextualRepresentation in a multiline field; MUI gives it, the model must hold comments and textual representations.
- `useful.md › State sub-action Kind radio` · partly · mui: Switching entry, do or exit from the form is Details coverage of a membership kind Grasp already holds; an MUI radio group.
- `useful.md › ViewUsage created in a diagram gets its own diagram` · missing · hand-written: Views as owned ViewUsages that can sit inside a diagram and get their own tab; the view-to-tab link is workspace logic of ours.
- `useful.md › Node 'View as': wrap elements in a new nested view` · missing · hand-written: Nested ViewUsages (a view inside a view) are SysML constructs Grasp cannot hold; React Flow parent nodes draw frames, the expose-moving mutation is ours.
- `useful.md › General View creatable on any Namespace` · partly · grasp-library: Views owned by any namespace rather than the one package: a format change in Grasp's library giving views an owner, which Damon's decisions allow.
- `useful.md › Exposed-element resolution` · partly · opensysml: Expose and recursive expose, SysML import concepts, decide a view's content; OpenSysML's renderView resolves exposes into a node tree, Grasp lists elements per view.

#### Canvas interaction (17)

- `core.md › Connector palette actions between nodes` · partly · grasp-library: Nesting, owning, typing, satisfying and subclassing by edge cover more SysML relationships; Grasp's library (generated metamodel) must know which kinds relate, the menu is ours.
- `core.md › Connector palette per source kind` · partly · grasp-library: Which relationships each source and target kind allow is metamodel knowledge for all SysML concepts; Grasp's library holds the rules, a MUI menu offers them.
- `core.md › Background Structure section` · partly · grasp-library: Creation tools for attributes, packages, references, imports and all structural kinds extend Grasp's SysML coverage; the library's generated metamodel supplies the kinds, MUI the menu.
- `core.md › Background Behavior section` · partly · grasp-library: Creation tools for allocations, occurrences, exhibit states and the rest of behaviour widen Grasp's SysML coverage; the library's generated metamodel supplies the kinds.
- `core.md › Top-level creation tools and initial compartments` · partly · grasp-library: Creating every element kind from the background, with compartments, is concept coverage; Grasp's generated metamodel lists the kinds, compartments are our React Flow nodes.
- `useful.md › Drag a list item between compartments` · missing · grasp-library: Re-owning under subject, objective and constraint memberships needs those memberships modelled; a library move does it, compartment item drag is ours.
- `useful.md › Droppable element kinds` · partly · hand-written: Showing more metaclasses: comment, documentation and package nodes Grasp lacks; node components for those kinds are ours, matching the plan's doc-as-element decision.
- `useful.md › No circular containment of nested parts` · unclear · grasp-library: A model-integrity rule of SysML ownership; the library's move and re-parent operations refuse a containment cycle and report it.
- `useful.md › Diagrams Options menu` · missing · opensysml: Showing inherited members presents specialization semantics (need 2); OpenSysML's renderView and attributes flag inherited members, the switches are a small MUI popper.
- `useful.md › Avoid duplicate nodes on creation and expose` · partly · hand-written: Placement per metaclass (compartment row, border port, free node) is notation correctness for more kinds; hand-written expose rules in the view layer.
- `useful.md › Per-view display rules for tree nodes` · partly · hand-written: Which metaclasses each standard view admits extends Grasp's view-kind rules to all kinds; hand-written filter table over the metamodel.
- `useful.md › SysON palette tool overrides` · missing · hand-written: Expression create, edit and delete reach SysML expressions (need 2); hand-written palette rows and editor modal, OpenSysML parses the text; Rotate is a nicety.
- `useful.md › Creation tool naming and icons` · partly · hand-written: Deriving 'New <Metaclass>' tools from the metamodel is how creation covers every kind; hand-written name rule, SysON's EPL-2.0 icons vendored.
- `useful.md › Background Analysis and Extension sections` · missing · hand-written: Cases, use cases and metadata definitions are SysML kinds Grasp lacks (need 2); hand-written palette sections generated from the metamodel table.
- `useful.md › Compartment item creation tools (New <Type>)` · missing · grasp-library: One New tool per compartment with the right membership is how every nested kind gets created; the model library must grow memberships, rows generated.
- `useful.md › Background creation tool mechanics` · partly · grasp-library: Creating into the view's owner with a membership and exposing it makes views real ViewUsages, a SysML concept Grasp lacks; model library work.
- `useful.md › Creation tools inside existing usages` · partly · grasp-library: Nesting attributes, parts and ports in actions, constraints and ports covers more owner kinds; the metamodel's containment references say what nests where.

#### Notation (118)

- `core.md › General View diagram` · partly · hand-written: Showing any exposed namespace member needs nodes for every metaclass; our view description on React Flow, which supplies the minimap.
- `core.md › Representable element categories (user manual)` · partly · hand-written: Six element categories, one titled compartment per content kind, is SysML coverage Grasp lacks; our node components define what a General View holds.
- `core.md › Definition nodes` · partly · hand-written: Grasp has the look; the gap is seventeen definition kinds. Our custom React Flow node component, with React Flow's NodeResizer for resizing.
- `core.md › Usage nodes` · partly · hand-written: Grasp has the rounded look; the gap is twenty usage kinds. Our custom React Flow node component, resizable through NodeResizer.
- `core.md › Edge kinds (user manual)` · partly · hand-written: Dependency, redefinition, allocation and containment edges are missing relationship kinds; custom React Flow edges of ours with SysML arrowhead markers.
- `core.md › New Package (top-level and nested)` · missing · grasp-library: Nested packages are a namespace concept Grasp's one-package model lacks; the model library must own packages, a palette tool of ours creates them.
- `core.md › Package node (folder) rendering` · missing · hand-written: Package nodes make namespaces visible and editable on diagrams; a custom folder-shaped React Flow parent node of ours holding child nodes.
- `core.md › Annotating element (note) nodes` · missing · hand-written: Comments, documentation and textual representations as SysML elements drawn as notes; a custom React Flow node of ours, shown when the annotated element is.
- `core.md › Show Inherited Members` · missing · opensysml: Inherited features are SysML semantics Grasp lacks; OpenSysML resolves inherited members (spike C), our compartments list them with ^, an MUI toggle.
- `core.md › Inherited compartment items` · missing · opensysml: Read-only italic ^ rows need resolved inheritance; OpenSysML supplies inherited features and their origin, our compartment rows render them without edit tools.
- `core.md › Compartment item (list row) node` · missing · hand-written: Feature rows in compartments are how most SysML members appear; our node component renders icon-label rows, direct edit through the label grammar.
- `core.md › List node (compartment list)` · partly · hand-written: Stacked list compartments underpin showing every member; a flex-column layout inside our React Flow node component, no engine support needed.
- `core.md › Compartment node presentation` · partly · hand-written: Titled compartments per feature group show more of SysML than Grasp's doc and code; our node component draws italic headers over item lists.
- `core.md › List compartments on definitions` · partly · hand-written: Which compartments each definition kind shows is SysML coverage; a table of ours per metaclass drives compartment rendering in the node component.
- `core.md › List compartments on usages` · partly · hand-written: Compartments per usage kind extend SysML coverage beyond doc and code; the same per-metaclass table of ours drives the node component.
- `core.md › Interconnection compartment` · partly · hand-written: A compartment holding nested parts, actions and satisfy requirements extends what parts show; our React Flow parent-node component with a titled growable area.
- `core.md › New Port / New Port In / New Port Out` · partly · grasp-library: Direction belongs on the port usage, not only its definition; the model library sets it, palette tools of ours create and select for renaming.
- `core.md › New Binding Connector As Usage (bind)` · partly · grasp-library: Feature-chain ends across nesting levels are SysML semantics Grasp lacks; the model library computes shortest path and owner, our edge tool calls it.
- `core.md › Action flow compartment` · partly · hand-written: A titled action flow compartment on parts and in any view extends where behaviour shows; our React Flow parent-node component with free-form children.
- `core.md › Parameter border nodes` · partly · grasp-library: Parameters as directed ReferenceUsages, not items, is a metaclass gap; the model library holds them, OpenSysML adds inherited ones, our border-node component draws them.
- `core.md › Guard expressions on successions and transitions` · partly · opensysml: Guards as parsed, validated SysML expressions are a concept gap; OpenSysML parses and diagnoses the text, an MUI dialog of ours hosts it.
- `core.md › New Action / New Accept Action / New Assignment Action (action flow)` · partly · grasp-library: AssignmentActionUsage is a missing kind; the model library must hold it, palette tools of ours create and reveal it in the compartment.
- `core.md › New State / New Parallel State` · partly · grasp-library: States owned by parts, not only by states, is containment Grasp's model refuses; the model library allows it, palette tools of ours reveal the compartment.
- `core.md › New Entry / Do / Exit Action` · partly · grasp-library: Perform actions referencing an existing action (ReferenceSubsetting) is a concept gap; the model library holds the reference, an MUI selection dialog picks the action.
- `core.md › New Requirement (background or nested)` · missing · grasp-library: Requirement definitions and usages are missing kinds; the model library must hold them, background and node palette tools of ours create them nested or top-level.
- `core.md › Requirement nodes on the General View` · missing · hand-written: Requirement nodes reuse the definition and usage shapes; once the kinds exist in the model library, our node components draw them like any other.
- `useful.md › ConnectionDefinition node` · missing · hand-written: Connection definitions are a metaclass Grasp lacks; a custom React Flow node with ends compartment is our code once the library holds the kind.
- `useful.md › Set as composite / Set as ref` · missing · grasp-library: isComposite is a Feature attribute Grasp's model does not hold; the library must store and edit it; the palette toggle is thin UI.
- `useful.md › Interface definition port ends (New End / New Port as end)` · partly · grasp-library: Ends on connection, allocation and interface definitions with source/target initializers are model-library work; Grasp has interface end ports only.
- `useful.md › PortDefinition / PortUsage palettes` · partly · grasp-library: Ports owning parts, references and undirected items is a containment rule Grasp's model lacks; the library's nesting rules, then the palette follows.
- `useful.md › Dependency edge` · missing · react-flow: Dependency is a relationship Grasp lacks; React Flow draws the dashed open-arrow edge with a label once the library holds the kind.
- `useful.md › Redefinition edge` · missing · react-flow: Redefinition is a relationship Grasp lacks; React Flow edge with a custom barred-arrow SVG marker of ours, kind from the library.
- `useful.md › Feature value (implicit binding) edge` · missing · opensysml: Needs FeatureValue expressions and their resolved referent, which OpenSysML resolves; the '=' edge itself is a plain React Flow edge; Grasp holds no values.
- `useful.md › New Dependency` · missing · grasp-library: Creating a Dependency in the source's package with client and supplier is a model-library edit; the edge tool is thin React Flow UI.
- `useful.md › New Redefinition` · missing · grasp-library: Adding an owned Redefinition between usages is a model-library edit of a relationship Grasp lacks; the connect gesture comes from React Flow.
- `useful.md › ReferenceUsage node` · missing · hand-written: ReferenceUsage is a metaclass Grasp lacks; a generic metamodel-driven usage node of ours shows it once the library holds the kind.
- `useful.md › PerformActionUsage and ExhibitStateUsage nodes` · missing · hand-written: Perform actions and exhibit states are metaclasses Grasp lacks; our usage node component renders them with the library's new kinds.
- `useful.md › Actor node (stick figure)` · missing · hand-written: Actors are missing from Grasp; a stick-figure image node with the label below is our React Flow node, NodeResizer keeping aspect ratio.
- `useful.md › Subject node` · missing · hand-written: Subjects (ReferenceUsage in SubjectMembership) are missing from Grasp; shown by our usage node once the library holds subject memberships.
- `useful.md › AllocationDefinition and AllocationUsage nodes` · missing · hand-written: Allocations are a key traceability concept Grasp lacks; our definition/usage nodes render them, the library initializing source and target ends.
- `useful.md › Allocate edge` · missing · react-flow: An AllocationUsage drawn as a solid «allocate» edge with open arrow between usages; React Flow draws it once the library holds allocations.
- `useful.md › New Allocation` · missing · grasp-library: Creating and initializing an AllocationUsage between two usages is a model-library edit; the connect gesture is React Flow's.
- `useful.md › Case and Use Case nodes` · missing · hand-written: Cases and use cases are missing from Grasp; our nodes need subject, objective and actors compartments over the library's new kinds.
- `useful.md › Occurrence nodes` · missing · hand-written: Occurrence definitions and usages are metaclasses Grasp lacks outside lifelines; our generic definition/usage nodes render them.
- `useful.md › Include use case edge` · missing · react-flow: IncludeUseCaseUsage as a solid «include» edge with filled arrow; React Flow draws it once use cases exist in the library.
- `useful.md › New Include Use Case` · missing · grasp-library: Creating an IncludeUseCaseUsage with a ReferenceSubsetting between use cases is a model-library edit; Grasp has no use cases.
- `useful.md › "objective" compartment` · missing · hand-written: A case's objective requirement and its documentation in a compartment; our compartment component over the library's objective membership.
- `useful.md › New Perform Action` · missing · grasp-library: Creating a PerformActionUsage that optionally references an existing action is a model-library edit; the picker is an MUI tree dialog.
- `useful.md › New Exhibit State / Exhibit Parallel State` · missing · grasp-library: Creating an ExhibitStateUsage, standalone or referencing a state, parallel or not, is a model-library edit; the picker is an MUI tree dialog.
- `useful.md › New Reference` · missing · grasp-library: Creating a ReferenceUsage typed by a classifier or subsetting a feature is a model-library edit; the optional picker is an MUI tree dialog.
- `useful.md › "perform actions" compartment` · missing · hand-written: Compartment listing owned and inherited perform actions; our compartment component, with inherited members from OpenSysML's resolution.
- `useful.md › "actors" compartment` · missing · hand-written: Actors listed on cases, concerns and requirements; our compartment component over ActorMemberships the library must hold.
- `useful.md › New Actor` · missing · grasp-library: Creating a PartUsage in an ActorMembership, optionally typed by or subsetting a picked part, is a model-library edit; MUI tree dialog picks.
- `useful.md › "subject" compartment` · missing · hand-written: Subject compartment on cases, concerns and requirements; our compartment component over SubjectMemberships the library must hold.
- `useful.md › New Subject` · missing · grasp-library: Creating the single subject ReferenceUsage in a SubjectMembership, optionally specialized by a picked type, is a model-library edit; MUI dialog picks.
- `useful.md › Package node layout and description` · missing · react-flow: Packages as nodes holding members are missing from Grasp; React Flow parent nodes and NodeResizer give nesting and resize, grow-to-fit is ours.
- `useful.md › Package node palette` · missing · hand-written: Creating any element inside a package through its right-click palette; our per-metaclass tool list in MUI menus, over library namespaces.
- `useful.md › Creation inside packages` · missing · hand-written: An element created in a package node appears only inside it; a rule of our view-to-nodes mapping once packages exist.
- `useful.md › Recursive Package expose` · missing · grasp-library: An Expose with isRecursive showing a package's whole content is an import-like concept for the model library; experimental in SysON.
- `useful.md › Imported package (NamespaceImport) node` · missing · hand-written: Imports are missing from Grasp; a custom React Flow node showing «visibility» and the imported namespace is our code.
- `useful.md › New Namespace Import` · missing · opensysml: Importing a library package such as SI needs the bundled 94 libraries and resolution OpenSysML brings; the import element and MUI tree dialog are ours.
- `useful.md › Add existing nested elements` · missing · hand-written: Showing a package's existing members inside its node is an expose-related tool of our view mapping; Grasp has no package nodes.
- `useful.md › Note node rendering` · missing · hand-written: Comment, Documentation and TextualRepresentation as folded-corner note nodes; a custom React Flow node of ours once they are elements.
- `useful.md › Note labels «comment», «doc», «rep»` · missing · hand-written: Keyword, name, language and body labels for annotating elements extend our label grammar; «rep» is how Grasp exports code links.
- `useful.md › Direct edit of comment, documentation and textual-representation bodies` · missing · hand-written: Direct edit writing body instead of declaredName on annotating elements extends Grasp's label editor once comments and docs are elements.
- `useful.md › Documentation as note node` · partly · hand-written: Documentation shown as a linked note when owned by a package, import or view; a rule of our view mapping over documentation elements.
- `useful.md › Comment as note node` · partly · hand-written: SysML Comments as note nodes linked to the annotated element; our note node component; Grasp's pinned notes for Claude are a different device.
- `useful.md › New Comment / Documentation / Textual Representation on any node` · partly · grasp-library: Owning a Comment, Documentation or TextualRepresentation from any node is a model-library edit; rep also carries Grasp's code links today.
- `useful.md › Annotation edge` · partly · react-flow: Dashed arrowless edge from a note to its annotated element; a React Flow edge, but annotating an edge needs an edge-to-edge anchor of ours.
- `useful.md › ViewUsage frame node` · partly · react-flow: A view exposed inside another view as a «view» frame; React Flow parent nodes give the nesting Grasp's frames lack, label style ours.
- `useful.md › Show Inherited Members from Standard Libraries` · missing · opensysml: Inherited members are SysML semantics; OpenSysML reports each symbol's origin file, so a library filter toggle is cheap; SysON's server-wide singleton is not copied.
- `useful.md › Inherited compartment items computation` · missing · opensysml: Showing inheritance is a SysML concept; OpenSysML resolves inherited attributes and flags inherited renderView nodes; redefinition filtering and flag combination are a small pass.
- `useful.md › "parts" compartments` · missing · hand-written: Compartment notation for nested parts; our React Flow node component draws the list, OpenSysML's renderView already names each child's compartment.
- `useful.md › "enums" compartment` · missing · grasp-library: Enumeration definitions are a SysML kind Grasp drops today; metamodel.js knows the metaclass, KINDS needs the row, then a compartment row list.
- `useful.md › Inherited port, item and parameter border nodes` · missing · opensysml: Inherited ports as ^ border nodes is SysML inheritance made visible; OpenSysML's renderView lists ports with an inherited flag; our border-node components draw them.
- `useful.md › Graphical inheritance of nested elements` · missing · opensysml: A specialization showing its general's nested features is core SysML inheritance; OpenSysML resolves inherited features (probe showed inherited mass); nodes draw them with ^.
- `useful.md › Inherited member computation and flag combination` · missing · opensysml: The semantic side of inheritance: inheritedFeature minus redefined ones; OpenSysML's resolver supplies it, the two visibility flags are a small filter of ours.
- `useful.md › "ends" compartments` · partly · hand-written: Ends of connection, allocation and interface definitions are SysML content Grasp shows only as ports; the compartment is our node component listing end features.
- `useful.md › "items" compartments on ports` · partly · hand-written: Items owned by ports and port definitions deserve a titled compartment; our node component draws it from nested item memberships (exact ItemUsage type).
- `useful.md › Inherited memberships` · partly · opensysml: KerML membership inheritance with visibility and conjugation underlies every inherited row; OpenSysML's resolver implements it, Grasp's name-based guess would go.
- `useful.md › Attributes compartment in child parts` · missing · grasp-library: Attribute usages are a core SysML kind Grasp lacks entirely; the model library must hold them before any node can list them in a compartment.
- `useful.md › Root-level elements` · partly · hand-written: Documentation and comments as view elements match Damon's decision to make them model elements; drawing them at the root is our node description.
- `useful.md › ConjugatedPortDefinition support` · partly · grasp-library: A metaclass Grasp doesn't hold; implicit in text (~Type), so the model library must create it beside each port definition for Details and typing.
- `useful.md › Part compartment content` · partly · hand-written: A part's doc, attribute, part and port compartments are standard notation; our node component draws them once the model holds attributes.
- `useful.md › Item border nodes on actions and ports` · partly · hand-written: Standard notation for items and parameters on borders; our React Flow border-node component with direction glyphs, reused from the port border node.
- `useful.md › Connector ends from border-node parents` · unclear · grasp-library: Connector ends as feature chains through the drawn part are SysML semantics; Grasp's library already chains, the planned feature-path ends extend it to inherited ports.
- `useful.md › Direction of a feature relative to a type` · unclear · opensysml: Direction reversal through conjugated port definitions is KerML semantics; OpenSysML's resolver is the plausible source (not probed), our glyph reads the result.
- `useful.md › New Assignment Action` · missing · grasp-library: Assignment actions are a SysML kind Grasp lacks; metamodel.js has the metaclass, KINDS needs a row, then a palette tool and node.
- `useful.md › 'items' compartment` · missing · hand-written: Item rows with direction and 'name = value' bindings show expressions, a concept Grasp lacks; our node component lists them, values printed from the model.
- `useful.md › Transitions between actions` · missing · grasp-library: Transitions between actions, with guards in the label, widen Grasp's state-only transitions; the model library must allow them, React Flow draws the edge.
- `useful.md › New Accept Action` · partly · grasp-library: An accept action's payload and receiver as real parameter elements, not text fields, is metamodel fidelity; the model library must create and own them.
- `useful.md › "parameters" compartment` · partly · hand-written: A parameters compartment beside border parameters is standard notation; our node component lists directed features, inherited ones flagged by OpenSysML.
- `useful.md › State transition compartment` · partly · hand-written: A titled 'state transition' free-form compartment on parts and states is spec notation; our React Flow node component with a sub-flow area draws it.
- `useful.md › State and State Definition nodes` · partly · hand-written: States and state definitions in the General View too; a view-description matter: our General View node set must include every kind, not a per-view subset.
- `useful.md › Concern Definition and Concern Usage nodes` · missing · hand-written: Concern kinds are SysML v2 concepts Grasp lacks; React Flow hosts custom nodes, but the concern node shape and kinds are ours.
- `useful.md › Satisfy Requirement Usage nodes` · missing · hand-written: Satisfy usages are a missing SysML v2 kind; the node component on React Flow and its interconnection-compartment variant are ours.
- `useful.md › Requirements and concerns compartments on parts` · missing · hand-written: More SysML content shown on part boxes; compartments are our node component's work, React Flow only hosts the node.
- `useful.md › Actors and subjects on requirement nodes` · missing · hand-written: Actor and subject compartments and subject nodes are requirement notation Grasp lacks; drawn by our node components on React Flow.
- `useful.md › Inherited elements in requirement compartments` · missing · opensysml: Listing inherited members needs name resolution; OpenSysML's resolved model flags inherited features, the compartment listing itself is ours.
- `useful.md › New Stakeholder` · missing · grasp-library: Creates a PartUsage in a StakeholderMembership, a model operation for a missing kind; the library adds it, an MUI dialog picks the part.
- `useful.md › New Satisfy` · missing · grasp-library: Model operation creating a SatisfyRequirementUsage with ReferenceSubsetting to a picked requirement; the library must hold satisfy, MUI gives the dialog.
- `useful.md › New Satisfy Requirement (node tool)` · missing · grasp-library: Creates a satisfy usage typed or subsetting a pick, a model operation on a missing kind; library does it, MUI the tree dialog.
- `useful.md › New Framed Concern (node tool)` · missing · grasp-library: Creates a FramedConcernMembership with a new or referenced ConcernUsage; memberships of this kind must enter the model library first.
- `useful.md › New Require / Assume constraint` · missing · grasp-library: Creates RequirementConstraintMemberships of kind requirement or assumption, new or referencing a constraint; a library operation, with an MUI dialog.
- `useful.md › Objective, subject, actor and stakeholder creation` · missing · grasp-library: Fills cases and requirements with objective, subject, actor and stakeholder memberships, typed or subsetting a pick; model operations the library lacks.
- `useful.md › Requirement compartments redesign` · missing · hand-written: Requirement boxes with subject, constraints, actors and stakeholders compartments per the specification; our node components on React Flow, nothing exists today.
- `useful.md › Require and assume constraints compartments` · missing · hand-written: Compartments listing constraints as `name { expression }`, with visibility toggle and direct edit; our node components, React Flow only hosts them.
- `useful.md › Frames compartment` · missing · hand-written: Compartment listing framed concerns plus inherited ones on requirement nodes; our node component, with the concern kinds added to the library.
- `useful.md › Satisfy requirements compartment` · missing · hand-written: Part and definition boxes listing satisfy usages and inherited items with two creation tools; our node component, the kinds in the library.
- `useful.md › New Satisfy Requirement edge tool` · missing · grasp-library: Drawing feature to requirement creates a satisfy relationship; React Flow's connect gesture triggers it, the library must create the satisfy usage.
- `useful.md › New Derived Requirement edge tool` · missing · grasp-library: Creates a #derivation ConnectionUsage with #original/#derive ends and imports RequirementDerivation; needs metadata, annotations and bundled libraries in the library.
- `useful.md › Derivation «derive» edge` · missing · react-flow: Dashed labelled edge with open arrow between requirement nodes; React Flow edges give dash, label and marker, direction from metadata is ours.
- `useful.md › New Framed Concern / New Assume Constraint / New Require Constraint edge tools` · missing · grasp-library: Connect gestures that create framed-concern and constraint memberships referencing existing elements; React Flow supplies the gesture, the library the memberships.
- `useful.md › Satisfy requirement edge and label` · missing · react-flow: Solid «satisfy» edge from feature to requirement, both ends reconnectable; React Flow gives edges, labels, markers and reconnection, validation and retargeting are ours.
- `useful.md › RequirementUsage / SatisfyRequirementUsage palette` · missing · hand-written: Per-kind tool list for requirement nodes; palette mechanism is look, its requirement content is concepts; MUI menus show what we define.
- `useful.md › RequirementDefinition palette` · missing · hand-written: Tool list for requirement definition nodes, meaningful only with requirement kinds; the per-kind palette definition is ours, MUI renders menus.
- `useful.md › Background Requirements section` · missing · hand-written: Background tools creating concern, constraint and requirement definitions and usages; the palette section is ours, each kind needs library support.
- `useful.md › ReqId mirrors the declared short name` · missing · grasp-library: Semantic rule tying reqId to declaredShortName across labels, Details and tables; Grasp keeps no short names, the model library must.

#### Editing (34)

- `core.md › Node direct-edit syntax order` · partly · grasp-library: Gap is prefix keywords, ref and short names: more SysML in labels; Grasp's labels/lib.js readLabel grammar is kept and extended.
- `core.md › Default initial direct-edit text for nodes and list items` · partly · grasp-library: Prefill must show prefixes, short name and ':>>' too; the kept library's labelText composes it from the element.
- `useful.md › Compartment list-item direct edit` · missing · grasp-library: Rows for attributes, ports and items edited in place with the row rule; the kept label library gains a list-item rule, nodes gain rows.
- `useful.md › List-item direct-edit syntax order` · missing · grasp-library: Row text adds direction, constant, derived, end, ordered and nonunique, properties Grasp doesn't hold; extend the kept label library's grammar and model.
- `useful.md › Short name `<...>`` · missing · grasp-library: declaredShortName is a SysML attribute Grasp parses but drops; the kept model library must store it and the label grammar apply '<id>' and '<>'.
- `useful.md › Prefix keywords in any order` · missing · grasp-library: Variation, variant, constant, derived, end, snapshot and timeslice are flags Grasp doesn't hold; extend the kept label grammar and the model behind it.
- `useful.md › `ref` keyword (referential vs composite)` · missing · grasp-library: isComposite=false is a SysML property Grasp doesn't keep; the kept model library stores it and the label grammar sets and resets 'ref'.
- `useful.md › Redefinition `:>> feature`` · missing · grasp-library: Redefinition relationships aren't kept; the kept library adds them and its grammar creates them from ':>>'; name lookup can use OpenSysML.
- `useful.md › Restricted direct edit on binding, flow, interface and connection edges` · partly · grasp-library: Typing connectors and editing their prefixes by label; Grasp doesn't type connections; the kept label library has a restricted mode to extend.
- `useful.md › Dependency and succession edge direct edit` · partly · grasp-library: Dependencies are a SysML relationship Grasp lacks; their label edit uses the full node rule the kept label library already applies to successions.
- `useful.md › Two grammar entry points (node vs list item)` · partly · grasp-library: A list-item rule beside the node rule lets rows edit direction and flags; extend the kept label library, which has the node rule only.
- `useful.md › Feature-expression ordering` · partly · grasp-library: Redefinition ':>>' isn't kept by Grasp; the order of typing and subsetting/redefinition with multiplicities is a grammar detail in the kept library.
- `useful.md › Quoted names and qualified references` · partly · opensysml: Qualified and quoted names in references must resolve across packages and libraries; OpenSysML's find does that, Grasp resolves within one package.
- `useful.md › Value part in labels (`=`, `:=`, `default`)` · missing · grasp-library: Feature values (default, initial) are SysML Grasp doesn't hold; the kept model library stores them and its labelText prints ' = v', ':=', 'default'.
- `useful.md › Prefix and multiplicity keywords in labels` · missing · grasp-library: Row labels showing direction, flags and ordered/nonunique presuppose rows and properties Grasp lacks; the kept library's labelText prints them.
- `useful.md › Compartment item label format` · missing · grasp-library: The full row label (flags, '<short> name', '[mult] ordered nonunique', ': T', ':>> X', value) shows more SysML; printed by the kept library's labelText.
- `useful.md › Stereotype prefix lines` · partly · hand-written: «variation», «variant», «individual», «snapshot», «timeslice» mark properties Grasp doesn't hold; the custom node's header prints the lines above the keyword.
- `useful.md › Special node labels (actor, reference, perform, assign, accept)` · partly · hand-written: Actors, reference usages, perform and assignment actions are concepts Grasp lacks; their labels belong in the custom node components.
- `useful.md › Identification '<short> name' and state subaction kind` · partly · grasp-library: Short names aren't kept by Grasp; once stored, the kept library's labelText prints '<short> name'; subaction kinds already show.
- `useful.md › Compartment title naming` · partly · hand-written: Compartments for attributes, parts, ports, actions and states show more SysML than Grasp's doc, code and actions; titles derive from the row metaclass.
- `useful.md › Edge label formats` · partly · grasp-library: Edge labels with type, '▶ flow' and «satisfy» need typed connections, flows in connections and satisfy relationships Grasp lacks; the kept library's labelText prints them.
- `useful.md › Center label per edge kind` · partly · hand-written: «allocate», «frame», «include», «derive», «satisfy», «require», «assume» label relationships Grasp lacks; a per-kind table in the custom edge component.
- `useful.md › Expression editor dialog (Create/Edit Expression)` · missing · mui: Expressions are a SysML concept Grasp cannot hold; MUI Dialog and multiline TextField give the modal, OpenSysML checks the typed text.
- `useful.md › Default value / Initial value checkboxes` · missing · mui: FeatureValue's isDefault and isInitial are metamodel attributes Grasp lacks; MUI Checkbox gives the controls, the writer emits 'default' and ':='.
- `useful.md › New / Edit Expression palette tools` · missing · hand-written: Palette tools to create, edit and delete expressions on attributes, constraints and transitions; applicability rules and wiring are ours, menus from MUI.
- `useful.md › Set a constraint predicate with New Expression` · missing · opensysml: Constraints with predicates are a concept Grasp lacks; OpenSysML parses and resolves the typed predicate, the model stores it as the result expression.
- `useful.md › Bind an item's value with New Expression` · missing · hand-written: A FeatureValue referencing another feature; deriving the '=' binding edge and label from the model is ours, React Flow draws the edge.
- `useful.md › Expressions shown as text in the Explorer` · missing · hand-written: Explorer rule showing an expression as one leaf labelled with its text; a label and filter rule of ours over the tree widget.
- `useful.md › Constraint labels show their expression` · missing · hand-written: Notation for constraints Grasp lacks: name plus '{ expression }' in nodes and rows; label rules of ours inside React Flow nodes.
- `useful.md › Expression value section in Details` · partly · mui: Details row showing a value, guard or result expression with Edit or Create; MUI form widgets, Grasp has only a plain guard field.
- `useful.md › Which elements hold expressions` · partly · grasp-library: Ownership rules: every Feature a FeatureValue, transitions a guard, functions a result; Grasp's generated metamodel knows the metaclass hierarchy they rest on.
- `useful.md › Expression entries` · partly · hand-written: Explorer context-menu entries to create, edit and delete expressions; MUI menus hold them, the applicability rules and dialog wiring are ours.
- `useful.md › Custom node style types` · missing · react-flow: Package tab, imported package and folded-corner note shapes show packages, imports and comments Grasp lacks; React Flow custom node components draw them.
- `useful.md › Private and protected visibility decorators` · missing · hand-written: Membership visibility is a SysML attribute Grasp never shows; an icon overlay in our Explorer items and node labels.

#### Model behaviour (19)

- `core.md › SysML v2 / KerML metamodel conformance` · partly · opensysml: Holding every KerML/SysML kind is need 2; OpenSysML's symbol graph covers all kinds, Grasp's KINDS rows a subset.
- `core.md › SysML v2 specification rules` · partly · opensysml: Conformance to the specification's constraints; OpenSysML diagnostics run in the page beyond Grasp's 15 rules, the pilot validator staying the authority.
- `useful.md › Automatic namespace import when referencing another package` · missing · hand-written: Cross-package references need imports (concepts); OpenSysML tells whether a name resolves, our editing code must insert the NamespaceImport.
- `useful.md › Import insertion and coverage check` · missing · hand-written: Namespaces and imports are a concepts need; OpenSysML's scoped resolution answers coverage, the insertion into the nearest package is our code.
- `useful.md › Numbered default names` · partly · grasp-library: Creating every kind needs metaclass-based default names; Grasp's library already numbers by next free index and holds metaclass names from the ecore.
- `useful.md › Effective names and naming feature` · partly · opensysml: KerML naming semantics for unnamed redefinitions and conjugated ports; OpenSysML symbols carry names and specializations; naming-feature fallback unverified in the probe.
- `useful.md › Action rules` · missing · opensysml: Specification validation rules are a concepts need; OpenSysML diagnostics run in the page, the pilot validator on Claude's side stays the authority.
- `useful.md › Part and item rules` · missing · opensysml: Validation rules belong to concepts; OpenSysML diagnostics in the page (partial agreement with the pilot), pilot on Claude's side authoritative.
- `useful.md › Port rules` · missing · opensysml: Port well-formedness checks are concepts; OpenSysML reports diagnostics live (the probe caught a port typed by a part def); pilot remains authority.
- `useful.md › Connection, interface and allocation rules` · missing · opensysml: Connection and interface rules are concepts; OpenSysML diagnostics would report them in the page, the pilot on Claude's side confirms.
- `useful.md › Connector, binding and succession rules` · missing · opensysml: Connector arity and binding rules are concepts; OpenSysML diagnostics complement Grasp's palette refusals with specification checks; pilot stays authority.
- `useful.md › Flow rules` · missing · opensysml: Flow end and payload rules are concepts; OpenSysML diagnostics in the page, pilot validator on Claude's side as authority; Grasp runs none.
- `useful.md › Control node rules` · partly · opensysml: Action-flow control node rules are concepts; OpenSysML diagnostics add specialization and multiplicity checks to Grasp's five own rules; pilot authoritative.
- `useful.md › State rules` · partly · opensysml: State machine rules are concepts; OpenSysML diagnostics would cover specialization, exhibit-state and membership rules Grasp lacks; pilot on Claude's side authoritative.
- `useful.md › Transition rules` · partly · opensysml: Transition trigger, guard and effect rules are concepts; OpenSysML diagnostics in the page beyond Grasp's one trigger check; pilot stays authority.
- `useful.md › Feature rules` · partly · opensysml: 33 KerML feature rules are concepts; OpenSysML, a KerML implementation, would report them in the page; Grasp has one; pilot authoritative.
- `useful.md › Feature value, end membership and multiplicity rules` · partly · opensysml: Multiplicity and feature value rules are concepts; OpenSysML diagnostics in the page add to Grasp's bound-types rule; pilot validator remains authority.
- `useful.md › Type, specialization, subsetting and redefinition rules` · partly · opensysml: Specialization conformance rules are concepts; OpenSysML type facts and diagnostics report them in the page; Grasp has only redefinition direction; pilot authoritative.
- `useful.md › Namespace, element, annotation and import rules` · partly · opensysml: Distinguishability and import rules are concepts; OpenSysML diagnostics would flag clashes and misplaced imports; Grasp has distinguishability only; pilot authoritative.

#### Libraries (4)

- `useful.md › Implicit specializations to standard-library types` · missing · opensysml: Spec-required semantics that give inherited members; OpenSysML computes them, the probe showed inherited library attributes; Grasp's library adds none.
- `useful.md › Implicit specializations computed virtually` · missing · opensysml: Implied supertypes without stored clutter; OpenSysML resolves on demand with semantic state in side tables, its syntax AST stays immutable.
- `useful.md › Implicit subclassification of definitions` · missing · opensysml: Each definition kind's library base per the spec; OpenSysML's semantics cover it, as inherited attributes showed; conformance is not certified.
- `useful.md › Tools that rely on standard-library elements` · partly · hand-written: Creation tools must type views by StandardViewDefinitions and target Actions::Action::start; our tools, with OpenSysML finding library elements by qualified name.

### The loop: files, Claude and GitHub (6)

#### Projects, files, persistence and image export (6)

- `useful.md › Create a new Model card` · missing · hand-written: Several model files per workspace is decided, so adding a model file from the page is needed; File System Access API writes it.
- `useful.md › SysON 'Create a new Model' actions: SysMLv2 and SysMLv2-Library` · missing · hand-written: One-click new SysMLv2.sysml with Package1 or a LibraryPackage1 file in the workspace; our action writing a minimal .sysml file.
- `useful.md › Upload a project page` · partly · hand-written: Grasp's Import state is today's loop; replaced by opening the workspace folder with showDirectoryPicker, which the spike showed works from file://.
- `useful.md › Download (export) a project` · partly · hand-written: Grasp's Download state is today's loop; replaced by writing model, view and workspace files into the opened folder for git.
- `useful.md › Layout and view state kept on project import` · partly · hand-written: View files Claude reads and edits must carry layout, hidden and faded state, label and handle positions; our file format.
- `useful.md › Layout persistence (layoutDiagram mutation)` · partly · hand-written: Every move, resize and bend point must reach the view file for Claude; React Flow reports node changes, edge bends and saving are ours.

### Later, if ever (100)

#### Workbench (18)

- `useful.md › Onboard area` · missing · dockview: Empty-editor welcome cards; no need asks for them; Dockview's watermark component renders when a group has no panel.
- `useful.md › Accessibility affordances in the shell` · partly · mui: No need asks for it; MUI components and MUI X Tree View ship ARIA attributes and keyboard handling, so most comes free.
- `useful.md › Ctrl+K / Cmd+K toggles the omnibox` · missing · hand-written: A command palette is in none of the needs; a document keydown listener opening an MUI dialog is a few lines later.
- `useful.md › 'Run commands...' omnibox button in the navigation bar` · missing · mui: Navbar button with a key hint; MUI Button in the AppBar; only worth adding once a command palette exists.
- `useful.md › Omnibox command dialog` · missing · mui: MUI Dialog, autofocused TextField and scrolling List give the dialog; the command registry behind it is our own, later.
- `useful.md › Context-aware command mode` · missing · hand-written: Commands filtered by the selection need a command registry of ours; no server involved; a nicety none of the needs asks for.
- `useful.md › Related Elements view` · missing · grasp-library: Tracing nicety none of the needs names; Grasp's relationships array (from, to) yields incoming and outgoing; three MUI tree panels.
- `useful.md › Incoming panel` · missing · grasp-library: Elements pointing at the selection are relationships whose 'to' is it in Grasp's model; a filter, shown later.
- `useful.md › Outgoing panel` · missing · grasp-library: Targets the selection refers to are relationships whose 'from' is it, grouped by kind; a filter over Grasp's model, later.
- `useful.md › 'Show in' section` · partly · hand-written: Mostly moot with one shared selection everywhere; 'Show in <diagram>' opening that tab and selecting the node is a small palette section.
- `useful.md › Duplicate object (Ctrl/Cmd+D) with dialog` · missing · grasp-library: None of the needs names duplication; a deep copy with fresh ids and memberships in Grasp's library; MUI dialog for the container.
- `useful.md › Multi-selection in the Details view` · missing · hand-written: A Details form over several selected objects is a refinement none of the needs ask for; the shared-field logic would be ours.
- `useful.md › Pin the Details view (synchronization button)` · missing · hand-written: Freezing the Details on one element while selecting elsewhere is a nicety; an MUI icon button plus a pinned flag of ours.
- `useful.md › Create an object ("+") button` · partly · mui: Creating a new element straight from a reference field is a convenience none of the needs ask for; an MUI icon button and create dialog.
- `useful.md › 'View as': retype the current diagram` · missing · grasp-library: Changing an open view's kind in place is a convenience no need asks for; a view's kind is a field in Grasp's library, re-rendering follows.
- `useful.md › Related Views view` · missing · hand-written: A side list of every view showing the selected element is a nicety; a small Dockview panel of ours computed from view contents.
- `useful.md › Open a representation from its URL` · missing · hand-written: Opening a named view from a link is a nicety; a hash parameter of ours could do it, the workspace file already restores open tabs.
- `useful.md › SysON representation candidates` · partly · mui: Grasp already offers all eight standard view kinds; only a requirements table is missing, a nicety an MUI-based table could add later.

#### Canvas interaction (32)

- `useful.md › Toggle full screen mode` · missing · dockview: No need asks for it; Dockview's maximize-group gives a near equivalent and browser requestFullscreen is one call if wanted.
- `useful.md › Alt held disables node dragging (Alt + drag pans)` · partly · react-flow: A modifier convenience no need asks for; React Flow's panActivationKeyCode (Space by default) already gives a hold-to-pan mode.
- `useful.md › Drag outside node label` · missing · hand-written: A tidiness nicety no need asks for; node components are ours, so a draggable label with a stored offset is our code.
- `useful.md › Draggable edge labels with persisted position` · missing · hand-written: A tidiness nicety; React Flow's EdgeLabelRenderer places labels anywhere, so dragging and storing an offset in the layout is our code.
- `useful.md › Edges on edges` · missing · hand-written: A nicety no need asks for; React Flow has no edge endpoints on edges, it would take an invisible anchor node as Sirius Web does.
- `useful.md › Edge tool with a selection dialog` · missing · mui: No Grasp relationship needs a choice before creation; if one did, an MUI Dialog in the connector flow would serve.
- `useful.md › Add target as nested <Type>` · missing · hand-written: An alternative nesting gesture; Grasp already nests by dragging into a box, so a connector-palette tool calling the library's move can wait.
- `useful.md › Pin / Unpin elements` · missing · hand-written: A companion nicety to Arrange all; a pinned flag in the view layout that our arrange pass keeps fixed while elkjs lays out the rest.
- `useful.md › Smart Manhattan (obstacle-avoiding) edges` · missing · hand-written: Experimental even in Sirius Web and not SysON's default; React Flow has no obstacle routing, a pathfinding edge component would be ours.
- `useful.md › Oblique edges with editable bend points` · missing · hand-written: Manual edge paths are a nicety; a custom React Flow edge with bend points stored in the view layout is our code.
- `useful.md › Edges avoid passing through other nodes` · missing · hand-written: Same routing nicety as Smart Manhattan; elkjs routes edges round nodes only at arrange time, interactive avoidance would be our edge code.
- `useful.md › Rectilinear bend point dragging` · missing · hand-written: Manual edge editing is a nicety; orthogonal bend-point dragging on a custom React Flow edge would be our code.
- `useful.md › Rectilinear segment dragging` · missing · hand-written: Manual edge editing is a nicety; dragging whole segments of a custom orthogonal React Flow edge would be our code.
- `useful.md › Reset bending points` · missing · hand-written: Only meaningful once edges have manual bend points; clearing them from the view layout is a trivial palette tool of ours.
- `useful.md › Edge crossing tunnels (cross-fade gaps)` · missing · hand-written: A readability nicety no need asks for; crossing detection and dash gaps on our edge components after drags would be our code.
- `useful.md › Border node side follows connected edges` · missing · hand-written: An automatic port-placement nicety; port child nodes are ours, so flipping an unmoved port to the facing side is our layout code.
- `useful.md › Edge Type option` · partly · react-flow: A per-line routing choice is a nicety; React Flow's step, smoothstep and straight edge types cover Manhattan and Oblique if wanted.
- `useful.md › Reveal hidden elements` · missing · react-flow: Hiding and revealing is a focus nicety beyond Remove from view; React Flow's hidden flag makes reveal-all one toolbar button.
- `useful.md › Filter elements button` · missing · mui: Visual filtering is a nicety none of the needs ask for; an MUI Menu anchored on a toolbar IconButton holds the form.
- `useful.md › Filter elements panel: element tree and selection` · missing · mui: Checkbox tree of diagram nodes for bulk actions, a nicety; needs the separate MUI X Tree View package, hierarchy from React Flow parent nodes.
- `useful.md › Filter elements panel: bulk actions` · missing · hand-written: Bulk hide, fade, pin and collapse are niceties; hand-written actions setting flags on React Flow nodes behind an MUI split button.
- `useful.md › Fade / Unfade elements` · missing · hand-written: Dimming to focus is a nicety none of the needs ask for; a faded flag on node and edge data mapped to CSS opacity.
- `useful.md › Manage visibility eye icon` · missing · hand-written: Per-node compartment visibility is a nicety; Grasp shows every non-empty compartment; a hover icon in the hand-written React Flow node header.
- `useful.md › Manage visibility modal` · missing · mui: Nicety; MUI Popover with a TextField and a checkbox List gives the panel, keeping it inside the diagram bounds is a few lines.
- `useful.md › Manage visibility: toggle a child` · missing · react-flow: Nicety; React Flow's hidden flag on the compartment child node does the hiding, the parent's compartment re-layout is ours.
- `useful.md › Manage visibility menu: Reveal valued content only` · missing · hand-written: Grasp already shows only non-empty compartments; a menu entry restoring that state is a nicety, hand-written over the hidden flags.
- `useful.md › Edge Show/Hide section` · partly · react-flow: Hiding one edge is a nicety beyond Grasp's undraw-from-details; React Flow's hidden flag on edges, one palette row.
- `useful.md › Last used tool pinned at the top` · missing · hand-written: Repeat-last-tool convenience none of the needs ask for; a remembered tool per palette kind in React state.
- `useful.md › Fuzzy matching with smart case and highlighting` · missing · hand-written: Subsequence matching with highlights refines the search; plain substring serves first; a small hand-written matcher and highlighted label.
- `useful.md › Palette tools run from keyboard shortcuts` · missing · hand-written: Per-tool key bindings are a power-user nicety; Grasp's fixed keys suffice; a hand-written key map resolved against the current palette.
- `useful.md › New Flow tool with payload dialog` · missing · hand-written: Grasp already draws flows and sets their item; a New Flow shortcut from a connection edge with a payload dialog is a convenience.
- `useful.md › Directional In/Out/Inout creation tools` · partly · hand-written: Grasp already sets direction in the panel; In/Out/Inout tool variants with direction-suffixed names are a convenience, trivial over the generic tool.

#### Notation (4)

- `useful.md › New Feature Typing (PartUsage node tool)` · partly · hand-written: Typing ': Name' in the label already creates and types a definition; a one-click palette tool is a small convenience for later.
- `useful.md › Revealing a compartment hides duplicate tree nodes` · missing · hand-written: Only matters if the General View draws both compartment rows and composition-edge tree nodes; Grasp nests once, so a consistency rule for later.
- `useful.md › Inherited content in free-form compartments` · missing · opensysml: Drawing inherited sub-actions and successions in a specialized action's flow is a late SysON nicety; OpenSysML can supply the inherited members when wanted.
- `useful.md › Rotate (fork and join nodes)` · missing · hand-written: Swapping a fork or join bar's width and height is a small direct-manipulation nicety; a palette tool over our node's size, easy to add later.

#### Editing (14)

- `useful.md › Direct edit of a composition edge label` · missing · hand-written: Edits multiplicity on a composition edge; Grasp nests parts in boxes and no need asks for composition edges; a custom edge label edit if ever.
- `useful.md › Label style properties (bold, italic, colour, border)` · missing · hand-written: User-chosen bold, italic, colour, border and icons per label; no need asks for styling; CSS on React Flow's HTML labels if ever wanted.
- `useful.md › Appearances tab: style customizations table` · missing · mui: A per-project list of switchable style customizations; none of the needs ask for it; an MUI settings dialog with checkboxes would do.
- `useful.md › SysON standard diagrams theme` · missing · hand-written: Optional, experimental family colouring, off by default in SysON, so not part of the reference look; a style rule in our node components.
- `useful.md › Theme family: Structure` · missing · hand-written: Lavender palette for structure metaclasses within the optional theme; a colour table in our node styles.
- `useful.md › Theme family: Behavior` · missing · hand-written: Green palette for behaviour metaclasses within the optional theme; a colour table in our node styles.
- `useful.md › Appearance section in the palette` · missing · mui: Per-element colour, font and border editing is a nicety none of the needs ask for; MUI inputs would form it.
- `useful.md › Per-property reset` · missing · mui: Reset buttons per customized style property; follows the appearance editor, which none of the needs ask for; an MUI IconButton.
- `useful.md › Rectangular node editor` · missing · mui: Background, border colour, radius, size and line style inputs for one node; part of appearance editing, a nicety; MUI colour and number inputs.
- `useful.md › Edge editor` · missing · mui: Edge colour, width, line style, arrows and routing type editor; a nicety; MUI inputs over React Flow edge types and markers.
- `useful.md › Label editor` · missing · mui: Per-label font, colour, border and hide controls; a nicety none of the needs ask for; MUI inputs, styles applied in our labels.
- `useful.md › Custom node Appearance section` · missing · mui: Appearance editing for package, import and note nodes; follows the appearance editor, a nicety; MUI inputs.
- `useful.md › Project style theme on custom nodes` · missing · hand-written: Theme tints for packages, imports, notes and view frames; the optional theme is a nicety; our node style rules.
- `useful.md › Persisted style customizations` · missing · hand-written: Per-node style overrides saved in the view file and resettable; only needed if appearance editing comes; our view format.

#### Model behaviour (3)

- `useful.md › Undo and redo of appearance edits` · missing · hand-written: Appearance styling is asked for by no need; if ever added, our own undo stack must record it, since React Flow has none.
- `useful.md › Deletion confirmation dialog` · missing · mui: Undo already covers mistaken deletes, so a confirmation is a nicety; MUI Dialog would supply it with a remembered opt-out.
- `useful.md › Impact analysis dialog` · missing · hand-written: No need asks for change previews; it would take our own dry-run diff of the model shown in an MUI dialog.

#### Tables and the Requirements Table View (23)

- `useful.md › Create a Requirements Table View` · missing · hand-written: A requirements table is a representation none of the four needs asks for; requirement kinds come first; a new view kind of our own.
- `useful.md › Hierarchical sub-rows` · missing · mui: Table nicety; material-react-table over MUI has expandable sub-rows built in; nested requirements must exist in the model first.
- `useful.md › Edit name and ReqId in cells` · missing · mui: In-place table editing is a nicety; material-react-table gives editable text cells; writing declaredName and reqId needs requirement kinds first.
- `useful.md › Edit documentation in cell` · missing · hand-written: Table nicety; the textarea cell is MUI's, but writing or creating a Documentation element in an OwningMembership is our model edit.
- `useful.md › Create requirement` · missing · hand-written: Creating a RequirementUsage plus MembershipExpose from a table menu; our code; the requirement kind itself belongs to the concepts need.
- `useful.md › New Nested Requirement` · missing · hand-written: Row menu creating a nested RequirementUsage with an expose; our code once requirement nesting exists; table-only convenience.
- `useful.md › Per-column filters` · missing · mui: Table filtering nicety; material-react-table filters columns client-side, no server needed; Grasp's grid has none.
- `useful.md › Global table search` · missing · mui: Table search nicety; material-react-table's global filter searches visible columns client-side; a workbench Search view is the look item.
- `useful.md › Tools menu` · missing · mui: Table toolbar menu holding CSV export and tools; a MUI Menu with our entries; nothing in the needs asks for it.
- `useful.md › Export page data as CSV` · missing · hand-written: Spreadsheet export of table rows; a few lines of ours plus a Blob download; no need asks for it.
- `useful.md › Column resizing` · missing · mui: Damon's resizing ask covers panels, frames and boxes, not table columns; material-react-table resizes columns built in; width persistence ours.
- `useful.md › Row actions menu` · missing · mui: Per-row command menu; material-react-table's row actions column gives it; entries are our delete and nested-requirement commands.
- `useful.md › Inline cell editing` · missing · mui: Editing in table cells is a nicety beside Details and label editing; material-react-table's cell editing; writes go through our model edits.
- `useful.md › Table content is the ViewUsage's exposed elements` · partly · grasp-library: Rows as the view's exposes kept in the model; Grasp's views already expose elements, so the kept library carries it; the table is a nicety.
- `useful.md › Requirements table rows` · partly · hand-written: One row per exposed requirement, depth-first with icon; our row derivation; requirement kinds and a table view come first.
- `useful.md › Requirements table columns` · partly · mui: Name, ReqId and documentation columns, resizable, sortable, filterable; material-react-table column definitions give all three; ReqId needs requirement kinds.
- `useful.md › Import all existing requirements` · partly · hand-written: Exposes a namespace's requirements recursively in the table; our code, like Grasp's grid Show all; table and requirement kinds first.
- `useful.md › Delete from table` · partly · grasp-library: Removes exposes but keeps the element; Grasp's library already has Remove from view; only the row menu is new.
- `useful.md › Delete from model` · partly · grasp-library: Deletes the element from a row; Grasp's library Delete does this today; the table row menu is the only addition.
- `useful.md › Multi-column sorting` · partly · mui: Sorting nicety; material-react-table sorts by several columns client-side; Grasp's grid sorts by one column already.
- `useful.md › Table representation` · partly · mui: Grasp's grid view tabulates elements already; none of the needs names tables; material-react-table would make cells editable if the grid is kept.
- `useful.md › Table toolbar layout` · partly · mui: Table chrome: Tools, search, filters, column chooser, full screen; material-react-table renders this toolbar by default; no need asks.
- `useful.md › Show/Hide columns (column management menu)` · partly · mui: Column visibility, order and pinning; material-react-table's column menu gives all three; Grasp's panel ticks grid columns today.

#### Projects, files, persistence and image export (6)

- `useful.md › Projects browser (homepage)` · missing · hand-written: A start page is a nicety; the file-based tool opens a workspace folder with showDirectoryPicker, no server project list exists.
- `useful.md › Existing Projects table` · missing · hand-written: Server project list; a recent-workspaces list is possible since folder handles persist in IndexedDB, but nothing asks for it.
- `useful.md › 'Create a new project' card area` · partly · hand-written: A start gallery of templates, blank and open-folder choices is a nicety; our start page, no server template service.
- `useful.md › SysON template set and order` · partly · hand-written: Three starting templates; bundled example .sysml files our start page offers; nothing in the needs asks for templates.
- `useful.md › Empty SysMLv2 template with Package1 and a view1 General View` · partly · hand-written: Default content of a fresh model is a nicety; our new-model action could write Package1 with a view1 GeneralView ViewUsage.
- `useful.md › Template: Batmobile (example project)` · partly · hand-written: A bundled Apache-2.0 example model; nice as a reader test corpus for OpenSysML and views, but no need asks for it.

### Out (10)

#### Libraries (10)

- `useful.md › Libraries picker at creation` · missing · n/a: Picks server-published libraries at project creation; Grasp has no server or projects; standard libraries are bundled, other models are workspace files.
- `useful.md › Command 'Import published library'` · missing · n/a: Command palette entry into the server's published-library import; no registry exists for a file-based one-person tool; workspace model files replace it.
- `useful.md › Libraries page (published library browser)` · missing · n/a: Server page listing published libraries; nothing to list without a server; the bundled standard libraries show in the Explorer instead.
- `useful.md › Open a library as a read-only project` · missing · n/a: Read-only workbench route for a server-published library; the Explorer's Libraries directory covers browsing bundled libraries read-only.
- `useful.md › Omnibox command 'Publish SysML project contents as library'` · missing · n/a: Publishing to a server registry; a one-person file-based tool shares models as files in git, not as published libraries.
- `useful.md › Import libraries dialog` · missing · n/a: Dialog over the server's published-library table; no registry without a server; adding a model file to the workspace replaces it.
- `useful.md › Import by reference (read-only)` · missing · n/a: Server dependency on a published snapshot; a workspace model file imported by name gives reuse, with OpenSysML resolving across files.
- `useful.md › Import by copy (editable)` · missing · n/a: Copies server library documents into a project; copying a .sysml file into the workspace folder does the same without a feature.
- `useful.md › Library update impact analysis` · missing · n/a: Dry-runs a published-library version update on a server snapshot; no registry or versions here; git diffs serve the one-person review.
- `useful.md › Published library versions (immutable snapshots)` · missing · n/a: Server-side publication with namespace, name and version in a database; git history of model files is Grasp's versioning.

