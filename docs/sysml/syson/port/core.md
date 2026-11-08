# SysON features Grasp lacks: core

The 132 core features from Eclipse SysON v2026.11.0 that Grasp lacks fully or partly, collated from 178 records in the per-part files in this folder (`application.md`, `views.md`, `diagrams.md`, `sysml-views.md`, `representations.md`, `model.md`, `platform.md`). Records describing the same feature in different parts are merged into one entry. Grasp status: missing 33, partly 99, unclear 0.

Each entry lists the SysON features it encompasses. For each one, **What it is** is the inventory's description from `docs/sysml/syson/features/`, **For Grasp** is the extraction's note on why it matters and what Grasp lacks, and **Sources** names the SysON or Sirius Web files it came from. Within each group, missing comes before partly before unclear.

The useful list is in [`useful.md`](useful.md).

## Workbench

### Workbench layout, shell and panels (7)

The application frame: navigation bar, theme, notifications, side panels, view toggles and editor area.

#### SysON color theme

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **SysON color theme** · application / App shell, navigation, theming & notifications · SysON · core · Grasp: missing
  - What it is: SysON passes its own MUI light theme to SiriusWebApplication, on top of the core fallback theme. It keeps the core's 12px base font, responsive sizes and h1-h6/subtitle/body settings: h1 3.42rem, h2 2.5rem, h3 2.142rem, h4 1.7rem (all weight 400); h5, h6, subtitle1 and subtitle2 bold (700); body1/body2 weight 400 with line heights 1.5/1.43. - Primary and secondary: main #292253 for both; primary dark #64669B, primary light #534E75; secondary dark #64669B, secondary light #D2D3D9. - Text: #292253, disabled #29225354. - Status: error #DE1000, success #43A047, warning #FF9800, info #2196F3, the same as Sirius Web. - Surfaces: divider #E0E0E0; left/right side navigation backgrounds #E8E9F0; navigation bar background #292253 with a yellow #FBBF52 top border strip; view (header) background #F1F0F6. - States: selected color #8321FF; action hover #A1A4C436; action selected #A1A4C460; disabled background #E0E0E0. - Components: the AppBar uses the secondary color; MUI Avatars default to the primary color #292253 (no avatar is rendered by the default Sirius Web/SysON UI, so this only affects contributed components); tooltips have a black background. - Links: unlike Sirius Web's theme (magenta #BE1A78 and navy), SysON's does not underline links only on hover.
  - For Grasp: the navy, lavender and violet palette is the colour of every SysON screen; Grasp uses its own teal-and-grey tokens.
  - Sources: `sysonTheme.ts`, `index.tsx`, `theme.ts`

#### Representation tabs

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Representation tabs** · application / Workbench layout & panels · Sirius Web · core · Grasp: missing
  - What it is: above the editor, a scrollable tab bar with scroll buttons lists every opened representation as a tab (representation-tab-{label}, carrying its representation id). - Each tab shows a 12px computed icon of the representation (possibly overlaid icons), an ellipsized label, a tooltip with the full label, and a small close (X) button (close-representation-tab-{label}). Tabs are compact (24px minimum height, 6px padding), and labels keep their original case rather than MUI's default uppercase. Clicking the X closes the tab without first activating it. - The active tab is underlined in the primary color. - Clicking a tab sets the global selection to that representation, which displays it, and the URL becomes /projects/{id}/edit/{representationId}. - Creating a representation opens its tab immediately. Selecting a representation in the explorer opens it in a new tab, or focuses its tab if it is already open. On every selection change the workbench queries representation metadata for all selected ids. If several representations are selected at once, all of them are added as tabs and the first becomes active. New tabs are appended at the end. - Only the active tab's editor is mounted (keyed by editingContextId#representationId), so switching tabs unmounts the previous editor and remounts the new one. - A recently closed representation can be opened again. - Closing the active tab activates the tab that takes its place (the next one), or the previous one when the closed tab was last; closing the last tab leaves the onboard area. Closing an inactive tab keeps the current one.
  - For Grasp: tabs above the editor for open diagrams; Grasp has frame tabs on the plane but no editor tab bar.
  - Sources: `RepresentationNavigation.tsx`, `Workbench.tsx`, `explorer.adoc`

#### Navigation bar layout

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Navigation bar layout** · application / App shell, navigation, theming & notifications · Sirius Web · core · Grasp: partly
  - What it is: every page (project browser, new/upload project, project settings, libraries, library display, error page, project editor) starts with a navigation bar: a 4px colored strip (palette navigationBar.border) above a dense AppBar (min height 36px, palette navigationBar.background) laid out as a 3-column grid. Left: home icon, then left contributions. Center: page-specific content such as the project or library title. Right: right contributions such as the omnibox button, then the navigation menu button. _(Sirius Web)_
  - For Grasp: the dark top bar with its coloured strip frames every SysON screen; Grasp's header holds title, palette and actions but looks different.
  - Sources: `NavigationBar.tsx`, `NavigationBarExtensionPoints.tsx`

#### Workbench four-region layout

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Workbench four-region layout** · application / Workbench layout & panels · Sirius Web · core · Grasp: partly
  - What it is: the edit-project workbench (Project Editor), the main workspace for editing project content, has four regions: a top Toolbar (navigation bar), a Left panel of project-level views, a central Editor area of representation tabs, and a Right panel of selection-level views. _(Sirius Web)_
  - For Grasp: the frame every SysON screen sits in; Grasp lacks editor tabs and a side Explorer panel.
  - Sources: `workbench.adoc`, `editor.adoc`

#### Left panel: project-level views

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Left panel: project-level views** · application / Workbench layout & panels · Sirius Web · core · Grasp: partly
  - What it is: the left panel shows project-level views, never the current selection. By default it holds Explorer (open/active), Views (the views explorer), Validation and Search, in that order, at 25% of the width. SysON's how-to describes only Explorer and Validation, and SysON does not override this configuration. The Views explorer, added in Sirius Web 2026.3.0 and announced in SysON 2026.3.0, lists all the project's diagrams and tables hierarchically; selecting one opens it in the main area. _(Sirius Web)_
  - For Grasp: the left panel holds Explorer, Views, Validation and Search; Grasp has Validation on the left, its tree is a Browser view frame.
  - Sources: `DefaultWorkbenchConfigurationProvider.java`, `user-interface-navigation.adoc`, `workbench.adoc`

#### Right panel: selection-dependent views

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Right panel: selection-dependent views** · application / Workbench layout & panels · Sirius Web · core · Grasp: partly
  - What it is: the right panel shows information about the current selection. By default it holds Details (element properties; open/active), Query, Related Views (the representations attached to the element, formerly 'Representations', as the docs still call it) and Related Elements (related semantic elements), in that order, at 25% of the width. The Sirius Web docs say it is shown or hidden from its icon in the editor toolbar. _(Sirius Web)_
  - For Grasp: the right panel holds Details, Query and related views; Grasp's panel shows details only.
  - Sources: `DefaultWorkbenchConfigurationProvider.java`, `user-interface-navigation.adoc`, `workbench.adoc`

#### Editor area with multiple representation editors

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Editor area with multiple representation editors** · application / Workbench layout & panels · Sirius Web · core · Grasp: partly
  - What it is: the main area edits models and representations (diagrams, forms, tables...). Users can open as many editors as they like and switch between them without leaving the editor. _(Sirius Web)_
  - For Grasp: open many diagrams and switch between them; Grasp shows all its views at once as frames on one plane.
  - Sources: `workbench.adoc`, `editor.adoc`

### Command palette, search and related elements (1)

The Ctrl/Cmd+K omnibox, element search and the views that trace references to and from the selection.

#### Element search from the command palette

**Grasp: missing** · parts: application, views · note: tagged core/useful

SysON features encompassed (2):

- **'Search' command and element search mode** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · core · Grasp: missing
  - What it is: the 'Search' command ('Search an element in the project', search icon) switches the omnibox to Search mode and clears the input, with the placeholder "Hit 'Enter' to search an element...". - Searching: Enter sends the query and current selection to workbenchOmniboxSearch. It matches every element in the project whose label contains the query (case-insensitive), including elements hidden in the current view, and lists results with icons, shortest label first, each described 'Click to select the element'. The backend walks every content of the editing context's resource set: documents themselves and, in SysON, the loaded standard and referenced libraries. There is no result limit, and an empty query (Enter right after choosing Search) lists everything. Labels are the elements' styled labels. - Picking a result: closes the omnibox and makes the element the global selection. The selection is applied to every view and to the open representation, so the element is selected in the diagram, shown in the Details view (whose page tab appears) and revealed in the Explorer, even on the first search right after the project opens.
  - For Grasp: find any element by part of its name and jump to it; Grasp has no search, only the Browser and the Grid's sort.
  - Sources: `WorkbenchOmnibox.tsx`, `WorkbenchOmniboxSearchEventHandler.java`, `omnibox.cy.ts`
- **Omnibox element search** · views / Related elements, query & search views · Sirius Web · useful · Grasp: missing
  - What it is: besides the Search view, the workbench command palette (Ctrl+K / Cmd+K) has a 'Search' command ('Search an element in the project') that finds elements whose label contains the query (case-insensitive, shortest label first, each described 'Click to select the element'), offers the last 10 searches from browser localStorage ('sirius_web_search_history') as "Search '<query>'" entries, and selects the picked element in every view. Picking a result right after the project opens also reveals it in the Explorer (fixed in Sirius Web 2026.1.0). In SysON the command palette came in 2025.1.0, opened with Ctrl+K or from the top right of the workbench; element search was then its only command. _(Sirius Web)_
  - For Grasp: Ctrl/Cmd+K finds an element by name and selects it, with recent searches; Grasp has no command palette.
  - Sources: `WorkbenchOmnibox.tsx`, `WorkbenchOmniboxSearchEventHandler.java`, `OmniboxProvider.tsx`

### Explorer tree: rows, labels, filters and navigation (4)

How the model tree looks and is browsed: rows, labels, filters, multi-selection, keyboard and row menus.

#### Tree item context (more) menu

**Grasp: missing** · parts: representations, views · note: tagged core/useful; Grasp no/partly

SysON features encompassed (2):

- **Tree item context menu** · representations / Tree representations · Sirius Web · core · Grasp: partly
  - What it is: each item has a small vertical "⋮" (more) button that opens its context menu, anchored bottom-right. Entries appear in this order: - Frontend-contributed entries. - The backend entries, each with an icon (or a blank spacer), its label and its first key binding shown as a shortcut, all disabled in read-only mode. Contributions can override how an entry is rendered. - One "Show in <target>" entry per selection target other than the explorer (e.g. an open diagram), which pushes the current tree selection into it. - "Rename" (pencil icon), only for editable items and disabled when read-only. - "Delete" (trash icon), only for deletable items and disabled when read-only. It asks for confirmation in the deletion dialog, then runs deleteTreeItem. A failed request shows "An error has occurred while executing this action, please contact the server administrator".
  - For Grasp: each Explorer item's menu holds create, Show in, Rename and Delete; Grasp offers Rename and Delete in the panel, with no per-row menu.
  - Sources: `TreeItemContextMenu.tsx`, `DeleteMenuItem.tsx`, `RenameMenuItem.tsx`
- **Item action (⋮ more) button** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: Each row ends with a small vertical-ellipsis button (12px icon, test id `<label>-more`). It opens the item's palette or context menu, anchored to the button, and passes along the current tree selection. A view can replace this trailing action with its own renderer. The docs speak of right-click, but in v2026.11.0 the trees register no right-click handler, so the ⋮ button is the entry point. The click on ⋮ also reaches the row, so it selects the item like a click on the row: a plain click on ⋮ collapses a multi-selection to that item, while Ctrl/Shift held keeps the multi-selection rules. _(Sirius Web)_
  - For Grasp: a ⋮ button on every row opens that element's actions; Grasp puts actions in the panel, with no per-row menu.
  - Sources: `TreeItemAction.tsx`, `TreeItem.tsx`, `Explorer.ts`

#### Explorer view

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Explorer view** · views / Explorer view (model tree) · Sirius Web · core · Grasp: partly
  - What it is: The "Explorer" view in the left side panel shows the project as an expandable, collapsible tree: models (documents) at the root, semantic elements inside them, each representation (diagram, table) as a child of the element it targets, and a "Libraries" directory. The tree comes from a live subscription (`explorer://?treeDescriptionId=...&expandedIds=[...]&activeFilterIds=[...]`, GraphQL `explorerEvent(editingContextId, representationId)`) and refreshes whenever the server pushes an update. The header holds a toolbar, and an optional filter bar sits above the scrollable tree. A loading indicator shows until the first tree arrives, and subscription errors appear as toasts. The view is a collapsible accordion section titled "Explorer" (toolbar in the accordion header), and its workbench configuration saves the active explorer description and the active tree filters. _(Sirius Web)_
  - For Grasp: the model tree every SysON session works from; Grasp's Browser view is a frame on the plane, not a side panel with a toolbar.
  - Sources: `ExplorerView.tsx`, `useExplorerSubscription.tsx`, `useExplorerViewHandle.ts`

#### Tree item row layout

**Grasp: partly** · parts: representations, views · note: tagged core/useful

SysON features encompassed (2):

- **Tree item row** · representations / Tree representations · Sirius Web · core · Grasp: partly
  - What it is: each item is a 22px row indented 24px per depth level. It has an expand chevron (right when collapsed, down when expanded), shown only when the item has children; childless items get a blank spacer instead. - Clicking the chevron toggles expansion without changing the selection, and double-clicking the icon or label also toggles it. - The label is cut with an ellipsis beyond 100 characters, and marked items are shown in bold. - A hovered item gets a hover background and a selected one a selection background. - The whole row is clickable and draggable: clicking the empty area to the left (indent) or right of the label also selects the item (the clickable zone was widened in v2024.3.0). - A selected item is smoothly scrolled into view. - The focused item has a dotted black border. - Expanding or collapsing no longer makes tree representations flicker (fixed in v2026.1.0).
  - For Grasp: the Explorer's compact rows with chevrons, hover and selection backgrounds and scroll-into-view; Grasp's browser rows lack double-click toggling, ellipsis and a focus border.
  - Sources: `TreeItem.tsx`, `TreeItemArrow.tsx`, `CHANGELOG.adoc` v2026.1.0
- **Tree item row layout** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: partly
  - What it is: Each item is a 22px-high row, indented 24px per depth level, holding an expand arrow, icon, label and a trailing action button. Labels are single-line with ellipsis truncation (max 100ch), and text selection is disabled on rows. A 2px drop zone sits above every row. _(Sirius Web)_
  - For Grasp: compact 22px rows indented by depth, with icon, label and trailing menu button; Grasp's rows have no icon or menu button.
  - Sources: `TreeItem.tsx`

#### Clicking a representation in the tree opens it

**Grasp: partly** · parts: views

SysON features encompassed (2):

- **Clicking a representation opens it** · views / Explorer view (model tree) · Sirius Web · core · Grasp: partly
  - What it is: Selecting a representation item opens it in a new editor tab, or brings its existing tab to the front. Clicking a representation that is already selected still opens and focuses it, and a representation whose tab was just closed can be opened again the same way. The docs say a new representation opens automatically and appears in the Explorer under its element. _(Sirius Web)_
  - For Grasp: clicking a diagram in the tree opens or focuses it; Grasp's views are always-open frames, made active by a click, not listed in its tree.
  - Sources: `explorer-view.adoc`, `CHANGELOG.adoc`
- **Open a representation from the explorer** · views / Representations: creation, management & views list · Sirius Web · core · Grasp: partly
  - What it is: representations appear as items under their semantic element; clicking one opens it in the main area with an editor tab, runs its initial layout, and updates the URL to /projects/{id}/edit/{representationId}. _(Sirius Web)_
  - For Grasp: clicking a diagram in the tree opens it in an editor tab; Grasp's views are frames always on the plane, made active by a click.
  - Sources: `Explorer.ts`, `PlaywrightDiagram.ts`

### Explorer tree: creating, duplicating, moving and deleting elements (2)

Model editing from the tree: new-object dialogs and candidates, duplicate, drag to move, and delete.

#### Semantic element entries

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Semantic element entries** · views / Explorer view (model tree) · SysON · core · Grasp: partly
  - What it is: An editable model element offers, in order: "New object", "New representation", "New objects from text", "Create Expression" (when the element can contain an expression and has none yet), and "Duplicate object" (SysML Elements that are not Relationships). Then come "Edit Expression" / "Delete Expression" (non-read-only Elements, see Expressions), "Update library" / "Remove library" (library items), "Expand all" (items with children), and finally "Rename" / "Delete". The root namespace and Packages get New object, New representation, New objects from text, Expand all and Duplicate object.
  - For Grasp: create, duplicate, rename and delete elements from the tree; Grasp's Browser renames and its panel deletes, but creating happens only in drawing views.
  - Sources: `SysONExplorerTreeItemContextMenuEntryProvider.java`, `SysONExplorerTests.java`, `explorer-view.adoc`

#### New object dialog (child element)

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **New object dialog (child element)** · views / Explorer view (model tree) · Sirius Web · core · Grasp: partly
  - What it is: "New object" (+ icon, id `new-object`) on an element opens the "Create a new object" modal. Its "Object type" select (`childCreationDescription`) lists, with icons, the child creation descriptions the server allows for that container, with the first preselected. Entries combine containment feature and type (ids like `elements-Processor`, or in SysON `SysMLv2EditService-PartUsage`). "Create" (`create-object`) runs `createChild(objectId, childCreationDescriptionId)`. Creating into a filled single-valued containment is refused with an upper-bound warning, and failures show "An unexpected error has occurred, please refresh the page" or the server messages. `childCreationDescriptions(containerId, referenceKind)` provides the list. The dialog is extra-small, with no Cancel button: Esc or a click on the backdrop dismisses it. With no candidates the select is empty and Create stays disabled. Create is not disabled while the request is in flight, and the type select is locked only while the list loads or the creation runs. _(Sirius Web)_
  - For Grasp: creates any allowed child of an element by picking its type from a list; Grasp creates children only by drawing them in a view.
  - Sources: `NewObjectModal.tsx`, `DefaultEditService.java`, `core.graphqls`

### Details view and property forms (2)

The selection-dependent property form: pages, widgets, reference pickers and browse dialogs.

#### Base, feature and type core features

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Base, feature and type core features** · views / Details view & property forms · SysON · core · Grasp: partly
  - What it is: every element shows declaredName (text field "Declared Name"), qualifiedName (read-only label "Qualified Name", e.g. `Package1::p`) and declaredShortName (on Core since 2024.11.0). Features add direction; Types that are not Features or OccurrenceDefinitions add isAbstract; OccurrenceUsages add isIndividual (after direction); OccurrenceDefinitions (e.g. PartDefinition) add isIndividual instead of isAbstract; PortUsages show only the Feature set; RequirementUsages add reqId after direction (Core since 2025.10.0); RequirementDefinitions add reqId (Core since 2026.3.0); StateUsages add isParallel; StateDefinitions add isIndividual and isParallel; ViewUsages add exposedElement; Comments (including Documentation) add body; TextualRepresentations add language and body. StateUsage, RequirementUsage and ViewUsage build on the plain Feature set, so they show no isIndividual; RequirementDefinition builds on the base name fields only, so it shows no isAbstract or isIndividual; literals (LiteralBoolean, LiteralInteger, LiteralRational, LiteralString) show the Feature set plus value. Every feature not in the core list goes to the Advanced page.
  - For Grasp: names, qualified name, short name, direction, abstract, individual, parallel per metaclass; Grasp lists the same set but can't set short name or individual.
  - Sources: `CoreFeaturesSwitch.java`, `CHANGELOG.adoc` v2024.11.0 / v2025.10.0 / v2026.3.0

#### Reference widget (chips autocomplete)

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Reference widget (chips autocomplete)** · views / Details view & property forms · Sirius Web · core · Grasp: partly
  - What it is: edits a reference; current values appear as chips (icon plus label, `reference-value-<label>`) inside an autocomplete field (testid = label) that scrolls vertically, with label and pending spinner above; placeholder "Values" for many-valued, "Value" for empty single-valued, blank when not selectable. The widget carries label, iconURL, ownerId, descriptionId, ownerKind, referenceKind, containment and manyValued flags, values (id, label, kind, iconURL), selectable/removable flags and style. Used in the Details view, form representations, Related Elements and the diagram filter; in SysON for Typed by, Specializes, Subsets, Redefines, References, Payload, Receiver, Source, Target and every other reference feature. _(Sirius Web)_
  - For Grasp: values as chips in a type-to-filter field, used for Typed by, Specializes and every reference; Grasp uses plain selects for its few references.
  - Sources: `ValuedReferenceAutocomplete.tsx`, `ReferencePropertySection.tsx`, `reference.graphqls`

### Representations: creating, opening and managing views (4)

Creating diagrams as view usages, retyping them with View as, and listing, opening, renaming and closing them.

#### New representation entry

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **New representation entry** · views / Explorer view (model tree) · Sirius Web · core · Grasp: partly
  - What it is: "New representation" (`new-representation`) on an editable element opens the dedicated new-representation dialog. SysON hides it on library elements and on ViewUsages that already have their standard view. _(Sirius Web)_
  - For Grasp: creates a diagram on the element it is about, straight from the tree; Grasp's New view adds a view to the package, not on an element.
  - Sources: `NewRepresentationToolContribution.tsx`, `SysONExplorerTreeItemContextMenuEntryProvider.java`

#### New representation dialog

**Grasp: partly** · parts: views · note: tagged core/useful

SysON features encompassed (2):

- **New representation dialog** · views / Representations: creation, management & views list · Sirius Web · core · Grasp: partly
  - What it is: 'New representation' in an element's Explorer context menu (Element Options / 'more' menu) opens the 'Create a new representation' dialog. It has an autofocused 'Name' field (placeholder 'Enter the name of the representation', helper 'The name cannot be empty', which is always shown and turns into an error when the name is blank; the field is disabled until a representation type is available). Below it is a 'Representation type' select listing the representation descriptions applicable to the element, sorted; because of a label bug, the caption above the select also reads 'Name'. Help text under the select shows the selected description's end-user documentation (none of SysON's descriptions set an endUserDocumentation, so the help text stays empty in SysON). The name defaults to the first description's default name and follows the selected type until the user edits it. 'Create' is disabled for a blank name or no type; it runs createRepresentation, then selects (and so opens) the new representation in an editor tab, expands the element so the representation appears under it, and closes the menu. Keystrokes are kept inside the dialog. In the tree palette (used by default, sirius.web.tree.new-palette.enabled=true) the entry (testid new-representation) has a '+' (Add) icon, takes its label from the backend tool, is disabled in read-only mode and is hidden when the palette search text does not fuzzy-match it. _(Sirius Web)_
  - For Grasp: names a new diagram and picks its kind for the element it is about; Grasp picks the kind beside New view and names it view<N>, no dialog.
  - Sources: `NewRepresentationModal.tsx`, `sirius-web-application.json`, `representation-operations.adoc`
- **Create a new representation dialog** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: partly
  - What it is: An extra-small dialog titled "Create a new representation". A "Name" field (autofocused, placeholder "Enter the name of the representation", helper "The name cannot be empty", shown in error while blank) is prefilled with the default name of the selected type and follows the type selection until the user edits it. It is disabled while no type is available. The type select (labeled "Name" in the UI, although the bundle also has "Representation type") lists the representation descriptions available for the element, with the first preselected and the selected type's documentation as helper text. "Create" (`create-representation`) is disabled while the name is blank or no type is selected. On success the new representation becomes the selection (so it opens), the item is expanded and the menu closes; errors are toasted. Typing in the dialog does not move the focus to menu items. _(Sirius Web)_
  - For Grasp: names the new diagram and picks its kind, with a default name; Grasp picks the kind beside the button and names it view<N>, no dialog.
  - Sources: `NewRepresentationModal.tsx`, `NewRepresentationToolContribution.tsx`, `sirius-web-application.json`

#### New representation creates a typed ViewUsage

**Grasp: partly** · parts: model, views · note: tagged core/useful

SysON features encompassed (3):

- **Creating a view creates a typed ViewUsage** · model / Model semantics & editing services · SysON · core · Grasp: partly
  - What it is: Explorer > New representation of a standard view on an element that is not a ViewUsage first creates a ViewUsage inside it (with the intermediate membership the container needs), named after the representation and typed by StandardViewDefinitions::GeneralView/InterconnectionView/ActionFlowView/StateTransitionView, then attaches the diagram to it; on an existing ViewUsage the diagram is attached directly; the model is then persisted. A ViewUsage that already has a General View diagram or a Requirements table offers no 'New representation' (v2025.12.0), so each ViewUsage carries at most one such representation; the created ViewUsage is typed by the ViewDefinition of the chosen view (fixed v2025.12.0), and Interconnection View can also be created on Packages (v2025.12.0). As coded: the new ViewUsage's declared name is the name typed for the representation (proposed by default as 'view<n+1>', n being the number of ViewUsages directly owned by the container) and it does not go through the default-name initializer; a ViewUsage created for a Requirements table is left untyped; the four standard diagrams are all created from the single General View diagram description, the view kind coming only from the ViewUsage typing; the wrapping membership is chosen from the container's own metaclass (OwningMembership in a Package, Namespace or Definition, FeatureMembership in most Usages, and, by the same rule, a RequirementConstraintMembership in a RequirementUsage and a FramedConcernMembership in a ConcernUsage).
  - For Grasp: a new diagram is a view usage typed by its standard kind, inside a chosen element; Grasp's views are typed but always sit in the package.
  - Sources: `CreateRepresentationInputProcessor.java`, `SysONExplorerTreeItemContextMenuEntryProvider.java`, `CHANGELOG.adoc` v2025.12.0
- **SysON New representation creates a ViewUsage** · views / Explorer view (model tree) · SysON · useful · Grasp: partly
  - What it is: When a General View, Interconnection View, Action Flow View, State Transition View or Requirements table is created on an element that is not a ViewUsage, SysON first creates a ViewUsage named after the new representation under that element, typed with the matching standard ViewDefinition (none for the requirements table), and attaches the representation to it (2025.6.0). All four standard diagrams are then created as General View-based diagrams. On an existing ViewUsage, the representation is attached to that ViewUsage. The General View is proposed first (2025.4.0), Interconnection Views can be created from Packages (2025.12.0), and diagrams can be created directly on the root Namespace (2025.4.0).
  - For Grasp: a new diagram is a view usage owned by the element it is made on; Grasp's views are view usages too, but all owned by its package.
  - Sources: `CreateRepresentationInputProcessor.java`, `CHANGELOG.adoc` v2025.6.0, `CHANGELOG.adoc` v2025.12.0
- **New representation creates a ViewUsage** · views / Representations: creation, management & views list · SysON · useful · Grasp: partly
  - What it is: choosing a standard view or Requirements Table on an element that is not a ViewUsage first creates a new ViewUsage inside it (with the right membership), named with the representation name entered, and attaches the representation to it; the model is saved right after. In the Explorer the ViewUsage appears as e.g. 'view1 [GeneralView]' (the ViewDefinition's declared name in brackets) and the diagram is a child item under it.
  - For Grasp: a new diagram creates a view usage under the element, named after it; Grasp's views are view usages, but always under its package.
  - Sources: `CreateRepresentationInputProcessor.java`, `SysONDefaultExplorerServices.java`, `2025.6.0.adoc`

#### Rename a representation

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Rename a representation** · views / Representations: creation, management & views list · Sirius Web · core · Grasp: partly
  - What it is: 'Rename' in a representation's Explorer context menu (or F2) turns its label into an inline field showing the current value (placeholder 'Enter the new value'); Enter or clicking away commits, Escape cancels; a failed rename shows the toast 'An unexpected error has occurred, please refresh the page'. The SysON how-to describes it as Rename, update the editable field, then 'Rename'. All representation kinds go through one generic rename handler, and the rename is broadcast in real time to other viewers. _(Sirius Web)_
  - For Grasp: rename a diagram in place in the tree; Grasp renames a view from its panel, not inline.
  - Sources: `TreeItemDirectEditInput.tsx`, `representation-operations.adoc`, `CHANGELOG.adoc` (Sirius Web)

## Canvas interaction

### Selection and multi-selection (6)

Selecting on the canvas, multi-selection gestures and keeping the selection in sync across views.

#### Ctrl/Cmd + click multi-selection

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Ctrl/Cmd + click multi-selection** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · core · Grasp: missing
  - What it is: click one element, then Ctrl (Cmd on Mac) + click others to add them to, or remove them from, the selection; works on nodes and edges, and also in the Explorer view. _(Sirius Web)_
  - For Grasp: Ctrl/⌘+click builds a multi-selection for group moves and tools; Grasp selects one thing at a time.
  - Sources: `keyboard-shortcuts.adoc`, `diagram.adoc`, `PlaywrightEdge.ts`

#### Single global selection

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Single global selection** · application / Workbench layout & panels · Sirius Web · core · Grasp: partly
  - What it is: one global selection (a list of entry ids) is shared by the whole workbench. Applying a selection pushes it to every visible view that supports it and to the displayed representation. Selecting an element in the Explorer shows its properties in the Details view and the other selection-driven views. _(Sirius Web)_
  - For Grasp: one selection drives every view; Grasp's single selection drives its panel but cannot hold several elements.
  - Sources: `SelectionContext.tsx`, `Workbench.tsx`, `explorer.adoc`

#### Diagram selection published to the workbench

**Grasp: partly** · parts: application, diagrams · note: tagged core/useful

SysON features encompassed (2):

- **Diagram selection published to the workbench** · application / Workbench layout & panels · Sirius Web · core · Grasp: partly
  - What it is: whenever the diagram selection changes, the semantic elements (targetObjectId) of all selected nodes and edges become the global workbench selection, with the last-selected node first. With several nodes selected, the Details view shows the last one. The diagram keeps a stable order of selected element ids: previously selected first, new ones appended. _(Sirius Web)_
  - For Grasp: the elements behind every selected node become the selection; Grasp selects one box or line at a time.
  - Sources: `useDiagramSelection.ts`, `selection.spec.ts`
- **Diagram selection published to the workbench** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: partly
  - What it is: each change of the canvas selection publishes the semantic elements (target object ids) of all selected nodes and edges as the global selection, with the last-selected node's element first, so the Details view (and other right-side views) and the address bar's ?selection= parameter follow it. The Explorer does not: selecting a node does not select or reveal it in the Explorer tree until the user clicks the Explorer toolbar's "Reveal selected elements" button (test id explorer-reveal-selection-button) or uses the palette's Show in > Explorer entry (which also pushes a node-plus-edge multi-selection); likewise selecting in the Explorer does not select in the diagram until Reveal selected elements or Show in is used; an empty canvas selection publishes nothing (a background click publishes the diagram itself). The diagram also keeps its own ordered list of selected element ids (elements still selected keep their order, newly selected ones are appended), which decides the group palette's targets and the last element for the selection context menu. _(Sirius Web)_
  - For Grasp: canvas selection drives the Details view; Grasp's panel follows selection, but there is no multi-selection or URL selection.
  - Sources: `useDiagramSelection.ts`, `SelectionSynchronizer.tsx`

#### Mouse selection gestures listed as shortcuts

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Mouse selection gestures listed as shortcuts** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · core · Grasp: partly
  - What it is: SysON's keyboard-shortcuts page (marked experimental) also lists: left-click selects an element without opening its palette (right-click opens the palette); Ctrl + click adds another element to the selection, in the representation editor and in the Explorer; Shift + drag draws a rectangle that selects every element in it on release. Sirius Web's diagram page adds that Ctrl/Cmd + click both adds and removes elements, and that a rectangle started on a node excludes that node and its containers. While dragging, those already-selected nodes are deselected, and a child can still be caught without its container. To include containers, start the rectangle outside any node. With several elements selected, the palette shows the multi-element tools, including arrange and align. _(Sirius Web)_
  - For Grasp: click selects, Ctrl+click adds, Shift+drag draws a selection rectangle; Grasp selects one thing by click and has no rectangle.
  - Sources: `keyboard-shortcuts.adoc`, `diagram.adoc`, `selection.spec.ts`

#### Click to select

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Click to select** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · core · Grasp: partly
  - What it is: left-clicking a node or edge selects it (class 'selected') without opening the palette; right-click opens the element's palette. _(Sirius Web)_
  - For Grasp: left-click selects and right-click opens the element's palette; Grasp selects on click but has no right-click palette.
  - Sources: `keyboard-shortcuts.adoc`, `group-selection.spec.ts`, `PlaywrightEdge.ts`

#### Del deletes the selection

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Del deletes the selection** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · core · Grasp: partly
  - What it is: pressing Del in a representation editor deletes the selected element, and with several elements selected it removes them all. On diagrams this works because Sirius Web's default semantic delete tool 'Delete from model' is bound to the Delete key. It runs on a multi-selection, after the deletion confirmation dialog when that is enabled. The Delete binding is added only for elements whose description defines a delete handler. It sits on the palette-section copy of 'Delete from model', not on its quick-tool copy, which has none, and on the group palette's multi-element 'Delete from model'. It also deletes selected edges (keyboard edge deletion fixed in Sirius Web 2025.10.0). In read-only diagrams the palette, and so the binding, is never fetched, so Del does nothing; keyboard delete has been disabled there since Sirius Web 2023.3.0. Both manuals warn: 'Use the DEL key cautiously, as it's a direct shortcut for the delete operation.' _(Sirius Web)_
  - For Grasp: Del removes the selected elements from the model; Grasp's Delete removes one selection, with no prompt and no multi-select.
  - Sources: `keyboard-shortcuts.adoc`, `model-management.adoc`, `useDiagramKeyBinding.ts`

### Viewport and navigation (2)

Diagram toolbar, fit, full screen, mini map, grid snapping, helper lines and panning.

#### Diagram toolbar panel

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Diagram toolbar panel** · diagrams / Diagram: viewport & navigation · Sirius Web · core · Grasp: partly
  - What it is: a floating horizontal toolbar (MUI Paper overlay panel) pinned at the top-left of the diagram canvas, just below the representation tabs, grouping the global diagram actions with tooltips. In order: Toggle full screen mode, Fit to screen, Show/Hide mini map, Zoom in, Zoom out, Share diagram, export image, Toggle snap to grid mode, Show/Hide helper lines, Arrange all (main button of a split button), Reveal hidden elements, Reveal faded elements, Unpin all elements, Reveal selected elements, Manage selection, then contributed actions (Filter elements, SysON's Diagrams Options). SysON's manual lists: Display full screen, Fit selection to screen, Zoom group, Share the diagram link, Export diagram as SVG, Toggle snap to grid, Show helper line, Arrange all elements, Reveal hidden elements, Reveal faded elements, Unpin all elements, Select element in the diagram from the Explorer selection, Filter elements, SysML actions. The toolbar is rendered only when the diagram description declares a toolbar; older descriptions were migrated to declare one, and an API enables or disables it. SysON declares one (and an empty default diagram style) on all its descriptions: General, Interconnection, Action Flow and State Transition View. The export button's tooltip reads "Export the diagram as an image" with an "Experimental" marker; Sirius Web's manual describes it as downloading the view as SVG, HTML SVG or PNG. In read-only diagrams Show/Hide helper lines, Arrange all, Reveal hidden elements, Reveal faded elements and Unpin all elements are disabled. Test ids: diagram-toolbar, fit-to-screen, hide-mini-map/show-mini-map, zoom-in, zoom-out, share, hide-helper-lines/show-helper-lines, reveal-hidden-elements, reveal-faded-elements, unpin-all-elements. Sirius Web's manual also lists a "Smart Edges" toolbar action (experimental edge routing that avoids crossing nodes, computed client-side and not saved), but the 2026.11.0 toolbar has no such button: Smart Manhattan exists only as an edge type in the appearance editor. The manual's tip: combine Arrange All, Helper Lines and Snap to Grid to clean up complex diagrams quickly. _(Sirius Web)_
  - For Grasp: a floating bar of every global view action; Grasp has only a zoom group with Fit, no full screen, mini map, snap or arrange buttons.
  - Sources: `DiagramToolbar.tsx`, `manage-toolbar-diagram.adoc`, `diagram.adoc`

#### Fit to screen

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Fit to screen** · diagrams / Diagram: viewport & navigation · Sirius Web · core · Grasp: partly
  - What it is: toolbar button (AspectRatio icon, tooltip "Fit to screen") animates the viewport over 200 ms to fit the currently selected nodes, or all nodes when nothing is selected. _(Sirius Web)_
  - For Grasp: fits the view to the selection or everything; Grasp's Fit always fits every frame, never just the selection.
  - Sources: `DiagramToolbar.tsx`, `useFitView.tsx`, `diagram.adoc`

### Direct manipulation: drag, drop, move, resize and duplicate (6)

Moving, resizing and dropping nodes on the canvas, including drops from the Explorer.

#### Node resize modes

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Node resize modes** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · core · Grasp: missing
  - What it is: a selected node's resize controls follow its description's userResizable (BOTH, HORIZONTAL, VERTICAL, NONE). BOTH shows 8 round handles (four corners top.left/top.right/bottom.left/bottom.right plus sides) and border lines in the selected color; HORIZONTAL shows inert corner dots plus invisible draggable left/right lines; VERTICAL inert dots plus top/bottom lines; NONE inert dots only as selection marks. keepAspectRatio is honoured, the minimum is the node's computed content minimum (minComputedWidth/Height), resizing from top or left also moves the node, and there are no resizers on border nodes or in read-only diagrams. GraphQL exposes default width/height, resize direction, keep-aspect-ratio and a deletable flag; border nodes start on WEST, EAST, SOUTH, NORTH or NONE. SysON uses BOTH (definition, usage, package nodes), HORIZONTAL and NONE (compartment list items). _(Sirius Web)_
  - For Grasp: resize nodes from eight handles to make room or tidy a diagram; Grasp's boxes size themselves and can't be resized.
  - Sources: `Resizer.tsx`, `diagram.graphqls`, `CompartmentItemNodeDescriptionProvider.java`

#### Node dragging

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Node dragging** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · core · Grasp: partly
  - What it is: nodes move by dragging after a 5 px drag threshold (was 1 px), so a click does not nudge them; free-form and image nodes drag from their body (custom drag handle). A moved node is brought to z-index 1, flagged movedByUser, and its x/y persisted in the diagram layout and shared with other subscribers. Dragging is disabled on read-only diagrams. _(Sirius Web)_
  - For Grasp: drag nodes with a threshold so clicks don't nudge; Grasp drags after 4 px, but shows no z-order bump or read-only lock.
  - Sources: `useMoveChange.tsx`, `DiagramRenderer.tsx`, `diagram.spec.ts`

#### Border node movement

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Border node movement** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · core · Grasp: partly
  - What it is: a border node (port) can only be dragged within an extent around its parent's border (overlapping 5 px, entering the parent by 8 px), moves smoothly to any side, and its side (WEST, EAST, NORTH, SOUTH) is recomputed after a move (corner cases keep the previous side). It is never re-parented by drag and drop, stays movable when an edge is selected or child nodes aren't draggable, keeps position across parent changes, parent bounds changes and hidden edges, and its label does not overlap the parent. Dragging a border node more than 5 px into its parent's interior snaps it back onto the nearest side (north, east, south or west by shortest distance); a parent's node layout handler can instead compute the position itself (calculateCustomNodeBorderNodePosition, used by Sirius Web's sample ellipse node to keep ports on the outline). Border nodes cannot be resized; resizing the parent keeps each border node on its side and attached to the parent, a hidden edge is not considered when positioning border nodes, and dragging a border node highlights no other node as a drop target. _(Sirius Web)_
  - For Grasp: ports slide around their owner's border and switch sides; Grasp keeps ports on the border but recomputes side only when placed.
  - Sources: `layoutBorderNodes.ts`, `useDropNodes.ts`, `CHANGELOG.adoc`

#### Drag elements from the Explorer onto a diagram

**Grasp: partly** · parts: diagrams, sysml-views, views

SysON features encompassed (4):

- **Drag from the Explorer onto a SysON diagram** · views / Explorer view (model tree) · SysON · core · Grasp: partly
  - What it is: Explorer items dragged onto a diagram's background or onto a container node are shown on the diagram and exposed in its ViewUsage. Only elements in the same resource set as the diagram can be dropped, and elements represented as edges cannot. If the element's node is already there but hidden, the drop reveals it. If it is already visible, a warning reads "The element <name> is already visible in its parent <parent>". A Definition dropped on a Usage (or in a list compartment) types it (2024.9.0). Drops also work on the information box of an empty diagram (2024.11.0). A dropped Comment or Documentation node appears only when its annotated element is on the diagram, linked to it by an edge. Dropped nodes come with their compartments hidden, except the interconnection compartment on Interconnection Views (2026.3.0). When the target node shows no suitable compartment, the element is created on the background and linked to the target by a composition edge (2025.12.0). Dropping onto one of the element's own children is refused (2024.9.0).
  - For Grasp: drag elements from the tree onto a diagram to show them there; Grasp shows them through a view's Show list instead.
  - Sources: `manage-drag-drop.adoc`, `DiagramMutationDndService.java`, `GVDropFromExplorerTests.java`
- **Semantic drag and drop from the Explorer** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · core · Grasp: partly
  - What it is: dragging tree items onto the diagram background reveals them on the diagram; dropping onto a target node shows them inside it. The drop runs the diagram's drop tool with the dragged item (not the current selection) and creates a node (e.g. in unsynchronized diagrams). Dragged items carry their ids under the data type 'sirius-component/drag/sources', also read by the Details view's reference widgets. _(Sirius Web)_
  - For Grasp: drag elements from the model tree onto a diagram to show them; Grasp shows existing elements through the view's Show list, not by dragging from the browser.
  - Sources: `diagram.adoc`, `dataTransferTypes.ts`, `TreeItem.tsx`
- **Drop from Explorer in SysML views** · diagrams / Diagram: selection, editing & direct manipulation · SysON · core · Grasp: partly
  - What it is: dragging an element from the Explorer onto the diagram background or a node runs 'Drop from Explorer' (dropElementFromExplorer), which exposes it in the ViewUsage and displays it in the drop target, along with its existing relationships to displayed elements (e.g. dropping 'Wheel' shows its 'Typed By' edge to 'wheels'); onto a container node it is shown inside (e.g. 'lamp', 'optics', 'structure' into 'flashlight' in an Interconnection View) with no semantic change. Any element in the same resourceSet can be dropped on the background, which exposes it under its semantic parent's node when present and reveals its root node; the diagram's root element can be dropped too. A Membership drops its owned element, except standard start and done actions, dropped as memberships.
  - For Grasp: dropping from the Explorer exposes the element and its links to what is shown; Grasp's Show list draws it and its lines, without drag and drop.
  - Sources: `DiagramMutationDndService.java`, `ToolDescriptionService.java`, `manage-drag-drop.adoc`
- **Drop elements from the Explorer onto the General View** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: Dragging a Package or a PartUsage from the Explorer onto the diagram background shows it as a node with its compartments hidden; dropping the same element again keeps a single node and shows the snackbar "The element part1 is already visible in its parent General View"; dropping a node's element onto its own node is refused with "Cannot drop part1 on itself". A PartDefinition dropped on the background and then onto a PartUsage node types the usage and draws a feature typing edge (closed arrow with dots).
  - For Grasp: drag elements from the Explorer onto a diagram, each shown once; Grasp adds existing elements through each view's Show list.
  - Sources: `dropFromExplorer.cy.ts`, `DiagramMutationDndService.java`

#### Diagram drop re-parents and re-exposes

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Diagram drop re-parents and re-exposes** · model / Model semantics & editing services · SysON · core · Grasp: partly
  - What it is: dropping a node onto another node moves the semantic element into the target element; on success its Exposes (and those of its displayed sub-nodes) are removed from the ViewUsage and it is exposed again under the target node, otherwise the warning 'Unable to move <element> in <target>: <reason>' appears. A ConstraintUsage dropped into a requirement's assume/require compartment gets a new RequirementConstraintMembership of the matching kind and its old OwningMembership is deleted. Before moving, a drop of an element onto itself or onto one of its descendants (from the Explorer or within the diagram) is refused with the warning 'Cannot drop <name> on itself' or 'Cannot drop <X> on <Y>: <X> is a parent of <Y>' (v2024.9.0: such drops used to delete the element, its children and possibly the representation). A dropped container keeps its content, and a re-parented PartUsage keeps its existing relationships such as its feature typing (v2024.9.0).
  - For Grasp: dropping a node into another makes it its child, refusing drops on itself; Grasp re-parents on drop, its refusals undocumented.
  - Sources: `DiagramMutationMoveService.java`, `DiagramMutationDndService.java`, `2024.9.0.adoc`

#### Delete from model

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Delete from model** · diagrams / Diagram: selection, editing & direct manipulation · SysON · core · Grasp: partly
  - What it is: SysON names the palette delete tool on definition, usage, package, imported-package, note (annotating), view usage, compartment-item and owned item/port/reference border nodes, and the default delete tool on edges, "Delete from Model"; it deletes the semantic element (DeleteService.deleteFromModel), removing it from every view. Exceptions: on the «frame» (FramedConcernMembership) and «require»/«assume» (RequirementConstraintMembership) edges it deletes only the ReferenceSubsetting of the owned concern or constraint, i.e. the link to the referenced element. Sirius Web's default quick tool "Delete from model" (semantic delete icon, in quick access and the Edit section) is offered when the element's description has a delete handler, works on multi-selection, carries the Delete key binding (only its Edit-section copy and the group-palette copy declare it; the quick-access copy has none) and opens a confirmation dialog (also when deleting from the Model Explorer): a red warning icon, title "Are you sure?", message "This action will delete the selected element(s)." / "You won't be able to revert this.", a red "Delete" button and an outlined, focused "Cancel" button. Its "Disable this confirmation dialog" checkbox (shown only when browser local storage works) takes effect on Delete and is stored per project in local storage key 'sirius-confirmation-dialog-disabled' (a list of project ids); the project settings' "Enable confirmation dialogs" switch turns it back on, and clearing the browser data resets it. The how-to warns the deletion removes the element and its children (semantic elements and representations), affects every user, and cannot be recovered; its steps are to select the element, then click the Delete tool of the "Contextual Toolbar" (the palette) or press the Del key, cautioning that Del is a direct shortcut.
  - For Grasp: Delete from Model with a confirmation dialog; Grasp deletes from the model with undo but no confirmation.
  - Sources: `AbstractUsageNodeDescriptionProvider.java`, `PaletteDefaultToolsProvider.java`, `manage-elements-diagram.adoc`

### Connecting and reconnecting edges (5)

Creating edges by dragging between nodes, the connector menu, and reconnecting edge ends.

#### Drag-to-connect with a connector palette of valid edge kinds

**Grasp: missing** · parts: diagrams · note: tagged core/useful; Grasp no/partly

SysON features encompassed (3):

- **Drag-to-connect gesture and connector palette** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · core · Grasp: partly
  - What it is: click a node, press its border arrow and drag to the target; a preview edge is drawn and the target highlighted. On release a menu of applicable edge tools appears (e.g. 'New Subclassification', 'Become nested part'); if only one tool applies the edge is created directly (connectorPalette(source, target); SingleClickOnTwoDiagramElementsTool via invokeSingleClickOnTwoDiagramElementsTool with both positions). If none applies a warning reads "No edge found between selected source and target". In SysON standard views the menu lists only the edge tools that accept the released target node (2026.11.0). In SysON, a duplicate relationship that is not valid is refused with a feedback message, and structural edges such as ConnectionUsage are owned by the most specific common context of source and target. _(Sirius Web)_
  - For Grasp: drag between two nodes, then pick the relationship from a menu of valid ones; Grasp picks the line tool first, then clicks both ends.
  - Sources: `useConnectorPaletteContents.tsx`, `diagram.graphqls`, `manage-relationships-diagram.adoc`
- **Connector palette after drawing a connection** · diagrams / Diagram: palette & tool UI · Sirius Web · core · Grasp: partly
  - What it is: When a connection drag from a creation handle is released on a target, the server's connector palette for that source/target pair (quick-access tools, tool sections, dividers) opens as a draggable palette at the release point. It is the same palette component used elsewhere (2026.9) and shares its lifecycle. A temporary animated edge is drawn from source to target in the meantime. Clicking a tool creates the edge. Escape or closing removes the palette and the temporary edge. The precondition's self is the connection's semantic source. It is never shown in read-only diagrams. _(Sirius Web)_
  - For Grasp: after connecting, a palette at the release point lists the valid relationships; Grasp picks the relationship before clicking the ends.
  - Sources: `ConnectorPalette.tsx`, `useTemporaryEdge.tsx`, `2026.9.0.adoc`
- **Edge kind selection pop-up (SysON guide)** · diagrams / Diagram: palette & tool UI · Sirius Web, experimental · useful · Grasp: missing
  - What it is: After the drag is released on a target, a pop-up lists the edge kinds that can be created between source and target. In standard views it shows only tools that accept the target node (2026.11), and a single possible kind is created directly. _(Sirius Web; experimental)_
  - For Grasp: SysON's guide shows the pop-up of edge kinds valid between two ends; Grasp has no such pop-up.
  - Sources: `manage-relationships-diagram.adoc`, `CHANGELOG.adoc` v2026.11.0

#### Creation handles on a selected node

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Creation handles on a selected node** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · core · Grasp: missing
  - What it is: when exactly one node is selected in an editable diagram and it can be the source of a connector tool, four 24 px arrow buttons (creationhandle--top/right/bottom/left) appear 20 px outside the middle of each side, centered on the node, rendered in a dedicated layer so they stay clickable when edges pass in front. The client asks connectorToolCandidateDescriptionIds for the description ids that can be targets; edge tool preconditions are not evaluated for this (2026.11.0); on the server the first IConnectorToolCandidateDescriptionIdsProvider that handles the description answers, and for view-DSL diagrams (SysON's) it collects the target node and edge descriptions of every edge tool in the source node's or edge's palette, the query is skipped for multi-selection and errors show as toasts. They turn the selected color on hover/press, hide while the node is dragged, follow it when resized, are smaller when creating from an edge, and no longer stay highlighted after a connection. _(Sirius Web)_
  - For Grasp: four arrows round a selected node start a new edge by dragging; Grasp draws lines with palette tools, clicking two ends.
  - Sources: `ConnectionCreationHandles.tsx`, `useConnectionCandidatesQuery.ts`, `2026.11.0.adoc`

#### Reconnect an edge by dragging its end

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Reconnect an edge by dragging its end** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · core · Grasp: missing
  - What it is: a selected edge's source or target end is dragged by its reconnect circle (radius 4 px, pointer cursor; on Manhattan edges inset 12 px inside the end node by handle side) onto another element; only selected edges can be reconnected, invalid targets are faded, it sends reconnectEdge with kind SOURCE or TARGET, the new end id and drop position ((0,0) near the center), keeps the custom handle side, and is disabled on read-only diagrams. The edge cannot start a second reconnection until the current drag ends; the end handles (edge updaters) were enlarged to make grabbing easier (2023.10.0). Server messages, or "An unexpected error has occurred, please refresh the page", show as toasts. View DSL descriptions define separate source and target reconnection tools. _(Sirius Web)_
  - For Grasp: drag an edge end to another element to reconnect it; Grasp redraws lines or changes them in the panel.
  - Sources: `useReconnectEdge.tsx`, `ReactFlow.css`, `edge-reconnection.spec.ts`

#### Connector palette actions between nodes

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Connector palette actions between nodes** · diagrams / Diagram: palette & tool UI · SysON · core · Grasp: partly
  - What it is: Dragging a connector between two nodes offers target-specific actions. Between usages: 'Add target as nested <TargetType>' and 'Become nested <SourceType>'. From definitions: 'Add target as owned <TargetType>' (e.g. owned Allocation, owned Case). Also 'New Feature Typing' (usage to definition), 'New Satisfy Requirement' (to a requirement), and 'New Subclassification' (between definitions of the same kind; not for EnumerationDefinition, not definition to usage). No nested/owned tools are offered when the target is a Definition.
  - For Grasp: connecting two nodes offers nest, own, feature typing, satisfy and subclassification; Grasp offers specializes, defined by and connection lines, not nesting by edge.
  - Sources: `GVEdgeCreationTests.java`, `ViewEdgeToolSwitchTest.java`

#### Connector palette per source kind

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Connector palette per source kind** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: Dragging from a node's connection handle offers tools by source kind. Any Feature: New Satisfy Requirement. Any Usage: New Satisfy Requirement, New Dependency, New Redefinition, New Subsetting, New Reference Subsetting, New Allocation, Add target as nested <Type>, Become nested <Type>, New Feature Typing (only if a matching Definition node exists) and New Connection (connect). ActionUsage adds New Succession and New Transition. AcceptActionUsage adds New Succession and feature typing to ActionDefinition. Control nodes (Decision, Fork, Join, Merge) get only New Succession and New Transition. StateUsage adds New Transition (to states and the done state). UseCaseUsage adds New Include Use Case. Requirement and Concern usages add "Become objectiveRequirement" (to use cases), New Framed Concern, New Assume Constraint, New Require Constraint and New Derived Requirement. Definitions get Add target as owned <Type>, New Dependency and New Subclassification (not on EnumerationDefinition). RequirementDefinition adds New Framed Concern, New Assume Constraint and New Require Constraint. Package gets New Dependency (to any node). Since v2026.11.0 (#2526) the palette lists only the tools that accept the target node under the cursor: e.g. New Feature Typing is no longer offered between two Usage nodes but stays from a Usage to its matching Definition, and New Satisfy Requirement stays when the target is a RequirementUsage or SatisfyRequirementUsage.
  - For Grasp: dragging from a node offers only the relationship tools valid for that source and target; Grasp picks the line tool first and refuses bad ends in words.
  - Sources: `ViewEdgeToolSwitch.java`, `ViewEdgeToolService.java`

### Layout, alignment and edge routing (3)

Arrange all, pinning, align and distribute tools, edge routing styles, bend points and port placement.

#### Arrange elements split button

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Arrange elements split button** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · core · Grasp: missing
  - What it is: a split button in the diagram toolbar, tooltip "Arrange elements" (test ids `arrange-all-main-button` and `arrange-all-menu-toggle`), re-lays out the whole diagram. The main part runs the last layout configuration used, or the first one (Flow Layout) if none has been used yet, and shows that layout's icon. The attached down-arrow opens a menu of every layout configuration with its icon and label (test ids `arrange-all-{id}`, e.g. `arrange-all-elk-rect-packing`). The last-used layout is held only in the button's component state: it is not persisted and falls back to Flow Layout when the diagram is reopened or the page reloaded. While an arrange runs, a circular spinner (`arrange-all-circular-loading`) replaces the icon and the menu (`arrange-all-actions`) is not rendered. Both parts are disabled while it runs and on read-only diagrams; in the v2026.11.0 code read-only is the only other disabling condition. The arrow's aria-label uses the key `openMenu`, which has no entry in the label bundle. _(Sirius Web)_
  - For Grasp: one button re-lays out a messy diagram, with a menu of layouts; Grasp has no automatic layout.
  - Sources: `ArrangeAllButton.tsx`, `sirius-components-diagrams.json`, `manage-toolbar-diagram.adoc`

#### Editable edge paths

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Editable edge paths** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · core · Grasp: missing
  - What it is: selecting an edge shows handles to edit its route, and the custom route is persisted. The Sirius Web manual describes three gestures: drag a black handle to move an existing segment, drag a gray midpoint handle to insert a new bend point, and double-click a bend point to remove it. Later releases refined this. A single click no longer adds a bend point. Bend points have a larger interaction radius, and new ones are placed in the middle of a segment. New ones are created only when the source or target handle would change side. Segments are kept from running parallel to node borders, and nodes do not overlap their edges' bend points. Custom routing points are kept when one end moves, and deleting an edge does not change the layout of other edges. _(Sirius Web)_
  - For Grasp: reshape an edge by dragging segments and adding or removing bend points; Grasp's lines can't be edited.
  - Sources: `diagram.adoc`, `edge.spec.ts`, `CHANGELOG.adoc` v2025.8.0

#### Manhattan (rectilinear) edges

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Manhattan (rectilinear) edges** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · core · Grasp: partly
  - What it is: without stored bend points, a Manhattan edge computes a smooth-step route between its handles, turns the curve's control points into orthogonal bend points, and draws them as straight L segments. With stored bend points it draws them as-is (a "custom" edge) and keeps the first and last segments aligned with the moving endpoints. _(Sirius Web)_
  - For Grasp: SysON's default right-angled edges; Grasp draws some line kinds as a three-piece elbow, others straight.
  - Sources: `SmoothStepEdgeWrapper.tsx`, `useBendingPoints.ts`

### Show, hide, fade and filter (3)

Controlling what a diagram shows: hide, fade, filters, manage visibility and adding existing elements.

#### Add existing elements (recursive)

**Grasp: missing** · parts: diagrams, model, sysml-views · note: tagged core/useful; Grasp no/partly

SysON features encompassed (5):

- **Add existing elements / Add existing elements (recursive)** · diagrams / Diagram: visibility, filtering & presentation · SysON · core · Grasp: partly
  - What it is: the "Related Elements" palette section, on the diagram background and on nodes, has "Add existing elements" (AddExistingElements.svg) and "Add existing elements (recursive)" (AddExistingElementsRecursive.svg). The first displays the existing semantic elements directly contained by the clicked element (for the background, the ViewUsage's owner) by adding them to the ViewUsage's exposed elements (addToExposedElements, since v2025.10.0). The recursive variant also marks the created MembershipExpose as recursive, so all descendants appear. Only elements that can be exposed are added. On an Action Flow View created on an action, the background tool does not expose a nested PartUsage.
  - For Grasp: add an element's existing members to a diagram, optionally recursively; Grasp's Show list adds one element at a time and Show all fills a grid.
  - Sources: `ToolDescriptionService.java`, `DiagramMutationExposeService.java`, `manage-existing-elements.adoc`
- **Add existing elements (recursive)** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: Displays the whole cluster of objects contained in the selected node, creating child nodes for nested and owned usages inside their parent node rather than at the diagram root; works on PartUsage (2024.3).
  - For Grasp: show a whole containment cluster at once; Grasp has no recursive show.
  - Sources: `2024.3.0.adoc`, `CHANGELOG.adoc` v2024.3.0
- **Add existing elements tool** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: partly
  - What it is: Shows on the diagram the existing semantic children of the selected node (or of the diagram root) by adding them to the view's exposed elements. It was rewritten in 2024.7 to work on packages and to skip siblings already rendered by another node (e.g. in a compartment), and fixed in 2024.9 for start/done actions inside actions and parts. Multi-selection is supported through a group-palette variant (2026.1). Variants: 'Add existing elements', 'Add existing nested elements' (nested elements, on nodes) and their '(recursive)' forms, with the AddExistingElements.svg / AddExistingElementsRecursive.svg icons.
  - For Grasp: show existing children of a node; Grasp's Show list shows one element at a time.
  - Sources: `ToolDescriptionService.java`, `CHANGELOG.adoc`
- **Background Related Elements tools** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: The background palette's last section, "Related Elements", has "Add existing elements" (AddExistingElements.svg) and "Add existing elements (recursive)" (AddExistingElementsRecursive.svg); both run on the ViewUsage owner and add its existing members (recursively for the second) to the diagram's exposed elements. "Add existing connected elements" is only offered on nodes and multi-selections, not on the background.
  - For Grasp: one click shows an owner's existing members, recursively or not; Grasp has a Show list per view and Show all only in grids.
  - Sources: `ToolDescriptionService.java`, `SDVDiagramDescriptionProvider.java`
- **Children added by 'Add existing elements'** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: ActionUsage and PartUsage contribute nested usages plus succession sources/targets (including standard-library start/done memberships); ActionDefinition and PartDefinition owned usages plus succession ends; other usages nested usages; other definitions owned usages; other namespaces owned members and owned imports. Recursive mode adds only unsynchronized descendants individually; each child is filtered by the view's display rules; ViewUsages and already-exposed elements are skipped.
  - For Grasp: one action shows an element's existing children in a view; Grasp's Show list adds elements one by one, and only the grid has Show all.
  - Sources: `DiagramMutationExposeService.java`, `DiagramQueryExposeService.java`

#### Node Show/Hide section

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Node Show/Hide section** · diagrams / Diagram: visibility, filtering & presentation · SysON · core · Grasp: partly
  - What it is: every SysON node palette has a "Show/Hide" section, built by SysON's own DiagramDefaultToolsFactory rather than Sirius Web's default tools. Hide tools use HideTool.svg and show tools ShowTool.svg. It holds five tools. "Hide" hides the node. "Hide all content" hides all child and border nodes, and is offered only when the node has children. "Show all content" reveals all child and border nodes, offered only when some are hidden. "Reset content" resets the visibility modifiers of the children and border nodes, offered when the node has children. "Show valued content" reveals only the child or border nodes that have content of their own, offered when some are hidden. The tools are AQL calls on the diagram services: Hide is `diagramServices.hide(Sequence{selectedNode})`; Hide all content and Show all content hide or reveal `getChildNodes()` united with `getBorderNodes()`; Reset content calls `resetViewModifiers` on them, which restores each child's own hidden- and faded-by-default state, so SysON compartments go back to hidden; Show valued content reveals those of them that have at least one graphical child or border node, whether or not that content is itself visible, and leaves the others as they are. The "has children" precondition is that the node has child or border nodes; the "has hidden children" precondition is that at least one of them isHidden. Hide tools returned to the palette in 2024.5.0.
  - For Grasp: hide a node, or hide, show or reset all its content, from its palette; Grasp only removes elements from a view one at a time.
  - Sources: `DiagramDefaultToolsFactory.java`, `2024.5.0.adoc`, `CHANGELOG.adoc` v2026.9.0

#### Hide quick tool

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Hide quick tool** · diagrams / Diagram: visibility, filtering & presentation · Sirius Web · core · Grasp: partly
  - What it is: the element palette's quick-access Hide tool, available on a single element or a group selection, hides nodes (including border nodes) and edges. A hidden node takes its edges with it, and a parent list shrinks. The toolbar's Reveal hidden elements, or Show in the Filter elements panel, brings them back. _(Sirius Web)_
  - For Grasp: hide a node or edge without removing it, and bring it back; Grasp's Remove from view and Show list do this for elements but not lines.
  - Sources: `PaletteDefaultToolsProvider.java`, `palette.spec.ts`, `diagram.adoc`

### Contextual palette UI (7)

The right-click palette itself: targets, quick tools, sections, search, keyboard and group palettes.

#### Right-click opens the contextual palette

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Right-click opens the contextual palette** · diagrams / Diagram: palette & tool UI · Sirius Web · core · Grasp: missing
  - What it is: In every diagram the palette opens on right-click (context menu) at the cursor; it opened on left-click before SysON 2025.2. Right-click on a node or edge that is not selected adds it to the selection and targets it alone. Right-click on an element that is part of a multi-selection opens the group palette for every selected element. Right-click on the background clears the selection, selects the diagram in the workbench and opens the diagram palette. Shift+right-click does nothing, and Alt+right-click or Ctrl+right-click shows the browser's native context menu instead. A selection-context-menu handler can also open the group palette, but SysON's CSS makes the multi-selection rectangle click-through. The palette contents (quick-access tools, tool sections, tools) are fetched from the server for the targeted element ids. The tools' semantic target is the first element's target object (or the diagram's). A failed fetch shows the toast "An unexpected error has occurred, please refresh the page". Tutorials call it the "Contextual Toolbar". _(Sirius Web)_
  - For Grasp: right-click anywhere opens a palette of what can be done there; Grasp's tools sit in a fixed header palette and right-click does nothing.
  - Sources: `useOnClickElement.ts`, `DiagramPalette.tsx`, `2025.2.0.adoc`

#### Palette targets: background, node, label, edge, multi-selection

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Palette targets: background, node, label, edge, multi-selection** · diagrams / Diagram: palette & tool UI · Sirius Web · core · Grasp: missing
  - What it is: Right-clicking the background, a node, a label or an edge opens the palette (testid `Palette`) at that position with quick tools and collapsible tool sections (`toolSection-{name}`, e.g. Structure, Behavior, Requirements, Create, Edit, Show/Hide, Related Elements) holding tools (`tool-{name}`), plus a close button (`Close-palette`). On a multi-selection it is a group palette, rendered by the same component with the same `Palette` testid: no `GroupPalette` testid exists in the v2026.11.0 frontend, and that name survives only in an unused helper of SysON's Cypress page objects. Its tools depend on the selection (one element, several, or the diagram) and on the domain and representation description. _(Sirius Web)_
  - For Grasp: background, node, label, edge and group palettes, each with its own tools; Grasp has one palette per view kind and panel buttons.
  - Sources: `palette.spec.ts`, `nodeCreationTests.cy.ts`, `diagram.adoc`

#### Element palette on nodes

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Element palette on nodes** · diagrams / Diagram: palette & tool UI · Sirius Web · core · Grasp: missing
  - What it is: The node palette shows the tools of the current selection, with creation tools in a stable order. _(Sirius Web)_
  - For Grasp: a node's palette offers what can be created inside or from it; Grasp's palette doesn't change with the selected element.
  - Sources: `CHANGELOG.adoc`

#### Floating palette popup

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Floating palette popup** · diagrams / Diagram: palette & tool UI · Sirius Web · core · Grasp: missing
  - What it is: A fixed-position floating panel opens at the right-click position: 250px wide, at most 280px tall, 1px divider-colored border, 10px rounded corners, elevation 3. From top to bottom it stacks a header, the quick-access tool bar, the search field, then either the search results or the sectioned tool list. Clicks inside the palette do not reach the canvas. _(Sirius Web)_
  - For Grasp: a compact floating panel of quick tools, search and sections at the cursor; Grasp has no popup palette.
  - Sources: `Palette.tsx`, `DiagramPalette.tsx`

#### Default quick tools (Edit, Pin, Fade, Hide, Delete...)

**Grasp: partly** · parts: diagrams, representations · note: tagged core/useful

SysON features encompassed (2):

- **Default palette tools added to View-based diagrams** · representations / Studio: language & representation authoring · Sirius Web · core · Grasp: partly
  - What it is: Every node and edge palette of a View-based diagram description (studio or programmatic, so SysON's diagrams too) gets server-contributed tools: an 'Edit' section with Edit (when a label edit tool exists), Collapse or Expand (collapsible nodes, by current state) and 'Delete from model' (Delete key, when a delete tool exists); and quick-access tools Edit, Pin/Unpin (nodes), 'Reset outside labels positions' and 'Reset labels sizes' (only when a label was moved or resized), 'Reset bending points' and 'Reset handles positions' (edges with custom bend points or handles), 'Adjust size' (nodes), Fade or Unfade (by state), Hide and 'Delete from model'. The group palette gets Pin/Unpin (Unpin when all are pinned), Fade, Unfade (if any is faded), Hide, Adjust size and 'Delete from model' (Delete key). _(Sirius Web)_
  - For Grasp: the Edit, Delete from model, Hide, Fade, Pin, Adjust size and reset tools on every SysON palette; Grasp has Edit label, Delete and Remove from view, but no pin, fade, adjust size or resets.
  - Sources: `PaletteDefaultToolsProvider.java`, `GroupPaletteDefaultToolsProvider.java`, `sirius-components-view-emf.properties`
- **Default quick tools and Edit section** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: partly
  - What it is: For nodes and edges the default tools are split in two. The quick-access row holds Edit (if the label is editable), Pin/Unpin (nodes), the conditional reset tools (reset outside label position, reset label resize, reset bending points, and reset handles position, shown only when handles were moved), Adjust size (nodes), Fade/Unfade, Hide, and Delete from model (if deletable, including deletable and editable edges). A default 'Edit' section holds Edit, Collapse/Expand (collapsible nodes) and Delete from model. Only this section's copy of Delete from model carries a key binding, the bare 'Delete' key with no modifier; the quick-access copy has none. The section label 'Edit' is hard-coded in English, not translated. The tooltips/labels shown are 'Edit', 'Pin' / 'Unpin', 'Reset outside labels positions', 'Reset labels sizes', 'Reset bending points', 'Reset handles positions', 'Adjust size', 'Fade' / 'Unfade', 'Hide', 'Delete from model', 'Collapse' / 'Expand'. _(Sirius Web)_
  - For Grasp: default quick tools Edit, Pin, resets, Adjust size, Fade, Hide and Delete; Grasp offers Edit label and Delete only.
  - Sources: `PaletteDefaultToolsProvider.java`, `sirius-components-view-emf.properties`, `CHANGELOG.adoc`

#### Node quick-access tools (Delete from Diagram, Duplicate Element)

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Node quick-access tools (Delete from Diagram, Duplicate Element)** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: "Delete from Diagram" (graphicalDelete.svg) deletes the node's view and also removes the element from the diagram ViewUsage's exposed elements (removeFromExposedElements), so it does not come back on refresh; the model element is kept. "Duplicate Element" (content_copy.svg) duplicates the element and exposes the copy (duplicateElementAndExpose); it is offered on any SysML Element except pure Relationships (relationships that are also Usages or Definitions, such as connections, are allowed).
  - For Grasp: Delete from Diagram keeps the model element and Duplicate copies it; Grasp has Remove from view but no duplicate.
  - Sources: `AbstractNodeDescriptionProvider.java`

#### Palette sections and their order

**Grasp: partly** · parts: diagrams, sysml-views · note: tagged core/useful

SysON features encompassed (2):

- **Palette tool sections** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: The diagram palette groups node-creation tools into sections by concept: Requirements (Concern, Concern Definition, Satisfy Requirement, Requirement, Requirement Definition, Constraint, Constraint Definition), Structure (Attribute, Attribute Definition, Connection Definition, Enumeration Definition, Interface, Interface Definition, Item, Item Definition, Package, Part, Part Definition, Port, Port Definition), Behavior (Allocation, Allocation Definition, Accept Action, Action, Action Definition, Assignment Action, Occurrence, Occurrence Definition, State, State Definition, View), Analysis (Case, Case Definition, Use Case, Use Case Definition), Extension (Metadata Definition) and View as. Besides one "New <Type>" tool per listed metaclass, Structure also holds New Item In/Out/Inout and New Port In/Out/Inout (ItemUsage and PortUsage are the directional elements), New Namespace Import and New Reference; Behavior also holds New Exhibit State, New Exhibit Parallel State and the six control-node tools (New Start Action, New Done Action, New Join, New Decision, New Fork, New Merge, visible only in an ActionFlow View whose ViewUsage owner is an action); View as holds four set-as-view tools (General View, Interconnection View, ActionFlow View, StateTransition View). Sections introduced in v2024.3.0.
  - For Grasp: the background palette groups tools by concept (Requirements, Structure, Behavior...); Grasp's palette has groups by view kind but few metaclasses.
  - Sources: `SDVDiagramDescriptionProvider.java`, `ToolConstants.java`, `2024.3.0.adoc`
- **Default sections and order** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: partly
  - What it is: Standard-view background, node and compartment palettes are built from the sections Requirements, Structure, Behavior, Analysis, Extension and 'View as', in that fixed order (ToolSectionDescription: a section name plus the EClasses whose creation tools go there). 'Related Elements' and 'Show/Hide' are appended where applicable, and an 'Edit' section holds editing tools such as duplicate and the expression tools. Each creation tool goes into its metaclass's section, tools inside a section are sorted alphabetically, and empty sections are removed (removeEmptyNodeToolSections).
  - For Grasp: palette sections Requirements, Structure, Behavior, Analysis, Extension, View as in a fixed order; Grasp groups tools by view kind instead.
  - Sources: `ToolDescriptionService.java`, `ToolConstants.java`, `ToolSectionDescription.java`

### Palette creation tools and dialogs (4)

Background and node creation tools for structure and behaviour, directional and compartment tools, and the selection dialog.

#### Common definition/usage node palette

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Common definition/usage node palette** · diagrams / Diagram: palette & tool UI · SysON · core · Grasp: missing
  - What it is: Each definition or usage node palette has Delete from Model, Edit (direct edit prefilled with getDefaultInitialDirectEditLabel), quick-access 'Delete from Diagram' (removes the element from the exposed elements) and 'Duplicate Element'. These two quick tools are shown after Sirius Web's default quick tools (Edit, Pin, Adjust size, Fade, Hide, Delete from model…), because provider tools come first. It then shows the type-specific sections (Requirements, Structure, Behavior, Analysis, Extension, View as) sorted alphabetically with empty ones removed, a 'Related Elements' section and a 'Show/Hide' section.
  - For Grasp: a definition or usage node's palette of create, edit, show/hide and related tools; Grasp has no element palette.
  - Sources: `AbstractUsageNodeDescriptionProvider.java`, `AbstractNodeDescriptionProvider.java`

#### Background Structure section

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Background Structure section** · diagrams / Diagram: palette & tool UI · SysON · core · Grasp: partly
  - What it is: New Attribute, New Attribute Definition, New Connection Definition, New Enumeration Definition, New Interface, New Interface Definition, New Item, New Item In, New Item Inout, New Item Out, New Item Definition, New Namespace Import, New Package, New Part, New Part Definition, New Port, New Port In, New Port Inout, New Port Out, New Port Definition, New Reference.
  - For Grasp: background Structure tools for attributes, parts, ports, items, interfaces, packages and more; Grasp has part, port, item and interface tools, no attributes, packages or references.
  - Sources: `SDVDiagramDescriptionProvider.java`

#### Background Behavior section

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Background Behavior section** · diagrams / Diagram: palette & tool UI · SysON · core · Grasp: partly
  - What it is: New Accept Action, New Action, New Action Definition, New Allocation, New Allocation Definition, New Assignment Action, New Decision, New Done Action, New Exhibit State, New Exhibit Parallel State, New Fork, New Join, New Merge, New Occurrence, New Occurrence Definition, New Start Action, New State, New State Definition, New View. The control-node tools (Start, Done, Join, Decision, Fork, Merge) and the two Exhibit State tools are custom tools appended to the section.
  - For Grasp: background Behavior tools for actions, states, control nodes, allocations and views; Grasp has actions, states and control nodes, no allocations, occurrences or exhibit states.
  - Sources: `SDVDiagramDescriptionProvider.java`

#### Top-level creation tools and initial compartments

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Top-level creation tools and initial compartments** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: Background tools create Attribute Definition (2 compartments), Attribute (3), Allocation (3), Allocation Definition (4, with 2 end items, 1 visible), Accept Action (2), Action Definition (6), Action (7), Assignment Action (1), Comment/note (0), Concern Definition (8), Concern (8), Constraint Definition (2), Constraint (4), Connection Definition (5), Enumeration Definition (2), Exhibit State (6, selection dialog), Interface Definition (7, with 2 port border nodes), Interface (4), Item Definition (2), Item (4), Metadata Definition (3), Occurrence Definition (3), Occurrence (2), Package (0), Part Definition (13), Part (13), Port Definition (5), Port (5), Reference (0, selection dialog), Requirement Definition (9), Requirement (9), Use Case Definition (5), Use Case (7), Satisfy Requirement (8), State Definition (6), State (6) and View. Compartments are hidden on creation. New elements appear in both the Explorer and the diagram.
  - For Grasp: the full set of element kinds a modeller creates from the background; Grasp lacks attributes, requirements, packages, use cases, constraints and more.
  - Sources: `GVTopNodeCreationTests.java`, `nodeCreationTests.cy.ts`, `batmobile.adoc`

## Notation

### General View notation: definitions and usages (4)

The General View diagram and its definition and usage nodes, with their palettes and composite/ref switching.

#### General View diagram

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **General View diagram** · sysml-views / SysML General View · SysON, experimental · core · Grasp: partly
  - What it is: Diagram representation named "General View" (view id `GeneralViewDiagram`, internal element-name prefix "GV") whose domain type is `sysml::Namespace`; it can be created on any Namespace element (canCreateDiagram is true for any Namespace) from the Explorer (New representation > General View). It is the most general SysML view, displaying any members of the elements exposed by the ViewUsage it is created on, and is implemented as an unsynchronized diagram whose node candidates are the ViewUsage's exposed elements. All its nodes, compartments, border nodes, edges and palettes are built by SDVDiagramDescriptionProvider. Diagram-level settings: arrange-layout direction DOWN, no automatic layout (layout option NONE), minimap visible, default toolbar, and a default title "view" followed by one plus the number of existing ViewUsages (e.g. "view1"; only the target Namespace's directly owned members whose exact type is ViewUsage are counted). The manual's tip: being unsynchronized, it does not show all model information by default and users must add existing elements manually. The first General View (early releases) could only be created on Packages and handled Attribute/Enumeration/Interface/Item/Metadata/Part/Port Definitions and Usages plus Package; since v2025.10.0 it is one of the standard diagrams of the syson-standard-diagrams-view module. The user-manual page carries the "experimental" banner. _(experimental)_
  - For Grasp: the main SysML view, showing any exposed members of a namespace; Grasp's general view draws only parts, ports and their defs, and has no minimap.
  - Sources: `SDVDiagramDescriptionProvider.java`, `general-view.adoc`, `CHANGELOG.adoc` v2025.10.0

#### Representable element categories (user manual)

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Representable element categories (user manual)** · sysml-views / SysML General View · SysON, experimental · core · Grasp: partly
  - What it is: The manual says six categories of elements can be represented: Definition elements, Usage elements, elements inside Definition compartments, elements inside Usage compartments, Package elements and Annotating elements, plus a set of relationship edges. Each kind of element contained in a Definition or Usage node gets its own compartment, identified by a title, so a node that can contain several kinds has several compartments. _(experimental)_
  - For Grasp: sets what a General View can hold, with one titled compartment per kind of content; Grasp lacks packages, annotating elements and most compartments.
  - Sources: `general-view.adoc`

#### Definition nodes

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Definition nodes** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: Nodes for ActionDefinition, AllocationDefinition, AttributeDefinition, CaseDefinition, ConcernDefinition, ConnectionDefinition, ConstraintDefinition, EnumerationDefinition, InterfaceDefinition, ItemDefinition, MetadataDefinition, OccurrenceDefinition, PartDefinition, PortDefinition, RequirementDefinition, UseCaseDefinition and StateDefinition, with candidates from the ViewUsage's exposed elements. Drawn as square-cornered rectangles, 208x70 by default, white background and black border, with a top-centered wrapping multi-line label showing «keyword def» and the name (optional icon). A header separator appears only when there are children. Compartments are stacked in a list layout, free-form compartments grow to fill space, and children cannot be dragged out of the list. Resizable in both directions and synchronized. Palette: Delete from Model, Edit, Drop from Diagram, sorted section tools, Show/Hide (plus Show content as Nested and Show content as Tree), and quick access Delete from Diagram and Duplicate Element.
  - For Grasp: square-cornered white boxes with «keyword def» and the name, compartments below; Grasp matches the look but covers only a few definition kinds.
  - Sources: `AbstractDefinitionNodeDescriptionProvider.java`, `DefinitionNodeDescriptionProvider.java`, `general-view.adoc`

#### Usage nodes

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Usage nodes** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: Nodes for AcceptActionUsage, ActionUsage, AssignmentActionUsage, AllocationUsage, AttributeUsage, CaseUsage, ConcernUsage, ConstraintUsage, ExhibitStateUsage, InterfaceUsage, ItemUsage, OccurrenceUsage, PartUsage, PerformActionUsage, PortUsage, RequirementUsage, SatisfyRequirementUsage, UseCaseUsage, StateUsage and ViewUsage (ViewUsage has its own frame node). Drawn as rounded rectangles (border radius 10), 194x60 by default, white background and black border, with a wrapping top-centered multi-line label, list-layout compartments with growable free-form compartments and non-draggable children. Resizable and synchronized; subclasses can add a precondition. Palette: Delete from Model, Edit, sorted section tools, Show/Hide (plus Show content as Nested and Show content as Tree), quick access Delete from Diagram and Duplicate Element; unlike definitions there is no Drop from Diagram tool.
  - For Grasp: usages as rounded boxes (radius 10) with compartments; Grasp matches the rounded look for parts but covers few usage kinds.
  - Sources: `AbstractUsageNodeDescriptionProvider.java`, `SDVNodeDescriptionProviderSwitch.java`, `general-view.adoc`

### General View notation: relationship edges (6)

Dependency, specialization, redefinition, typing, composition and feature value edges and their tools.

#### Definition owned-usage composition edges

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Definition owned-usage composition edges** · sysml-views / SysML General View · SysON · core · Grasp: missing
  - What it is: When a definition's owned usage is a separate node, a tree-style solid edge with a filled diamond at the definition links them (not domain-based); hidden when the usage is drawn nested inside the definition. Exists for owned AcceptActionUsage, ActionUsage, AssignmentActionUsage, DecisionNode, ForkNode, JoinNode, MergeNode, AllocationUsage, AttributeUsage, CaseUsage, RequirementUsage, ConstraintUsage, ConcernUsage, InterfaceUsage, ItemUsage, OccurrenceUsage (OccurrenceDefinition to nested OccurrenceUsages since v2025.4.0), PartUsage, PerformActionUsage, PortUsage, SatisfyRequirementUsage, StateUsage, ExhibitStateUsage, UseCaseUsage and ViewUsage. The empty center label edits only the multiplicity (name, typing, redefinition and subsetting ignored), starting from the current multiplicity text; Delete from Model does not delete the usage but moves it into the closest containing package, breaking the composition. Reconnecting the source moves the usage under the new owner; reconnecting the target to another Usage moves the old child into the closest containing package and puts the new target in its place; either move is refused with "Cannot change the owner of <name>, this would create a containment cycle" when it would create a cycle, and a failed move warns "Unable to move <element> in <owner>: <reason>".
  - For Grasp: filled-diamond edges from a definition to its usages drawn apart, the decomposition tree; Grasp shows ownership only by nesting.
  - Sources: `AbstractDefinitionOwnedUsageEdgeDescriptionProvider.java`, `DiagramMutationToolService.java`, `GVRelationshipTests.java`

#### Composite vs reference nested-usage composition edges

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **Composite vs reference nested usage edges** · diagrams / Diagram: appearance & styling · SysON · core · Grasp: missing
  - What it is: Nested composite usages are connected by a filled-diamond edge, nested reference usages by an empty-diamond edge (2024.9; conditional edge style).
  - For Grasp: composite usages hang off a filled diamond, references off a hollow one; Grasp nests usages and draws no composition edges.
  - Sources: `AbstractUsageNestedUsageEdgeDescriptionProvider.java`, `CHANGELOG.adoc` v2024.9.0
- **Usage nested-usage composition edges** · sysml-views / SysML General View · SysON · core · Grasp: missing
  - What it is: A tree edge from a usage to each nested usage shown as a separate node, with a filled diamond (hollow diamond when the nested usage isReference); hidden when the child is drawn nested. Exists for nested ConstraintUsage, ConcernUsage, RequirementUsage, SatisfyRequirementUsage, AttributeUsage, InterfaceUsage, ItemUsage, PartUsage, PortUsage, AcceptActionUsage, ActionUsage, DecisionNode, ForkNode, JoinNode, MergeNode, AllocationUsage, ExhibitStateUsage, OccurrenceUsage, PerformActionUsage, StateUsage, CaseUsage, UseCaseUsage and ViewUsage (composite edges to nested actions, constraints and requirement constraints since v2024.5.0). The center label edits multiplicity only, and delete moves the child to the closest containing package. Source and target reconnection behave as for definition composition edges (move to the new owner, cycle check). Internal edge names are "Usage Nested <Type>" (and "Definition Owned <Type>" for the definition variant).
  - For Grasp: diamond edges from a usage to nested usages, hollow for refs; Grasp shows ownership only by nesting.
  - Sources: `AbstractUsageNestedUsageEdgeDescriptionProvider.java`, `SDVDiagramDescriptionProvider.java`, `2024.5.0.adoc`

#### Edge kinds (user manual)

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Edge kinds (user manual)** · sysml-views / SysML General View · SysON, experimental · core · Grasp: partly
  - What it is: The manual lists Dependency, Subclassification, Redefinition, Subsetting, Feature Typing, Allocation, Containment relation, Succession and Connection Usage as General View edges, each with its notation image. _(experimental)_
  - For Grasp: the General View edge set: dependency, specialization, redefinition, typing, allocation, containment, succession, connection; Grasp lacks dependency, redefinition, allocation, containment.
  - Sources: `general-view.adoc`

#### Relationship edges appear automatically

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Relationship edges appear automatically** · sysml-views / SysML General View · SysON, experimental · core · Grasp: partly
  - What it is: Relationship edges are synchronized: once both ends are on the diagram the edge is drawn without any tool, e.g. dropping the Wheel part definition from the Explorer shows its feature typing edge to the "wheels" part, and direct-editing labels to `Batmobile :> Vehicle`, `frontRightWheel :> wheels` or `bulletProofWheels[4] :>> wheels` draws subclassification, subsetting and redefinition edges. They cannot be removed from the diagram only; deleting one deletes the relationship (containment relationships excepted, per the manual). _(experimental)_
  - For Grasp: relationship edges draw themselves once both ends are shown, e.g. after typing ':> Vehicle'; Grasp draws specialization lines this way, defined-by only on request.
  - Sources: `batmobile.adoc`, `manage-relationships-diagram.adoc`

#### Subclassification edge

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Subclassification edge** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: Solid edge from subclassifier to superclassifier with a hollow closed triangle arrowhead (INPUT_CLOSED_ARROW) and no label, between definitions and packages (restored in v2024.3.0 after a regression). Reconnecting the source moves the relationship into the new subclassifier (subclassifier/specific); reconnecting the target updates superclassifier/general.
  - For Grasp: solid line with hollow triangle to the general definition; Grasp draws it but can't drag an end to reconnect.
  - Sources: `AbstractSubclassificationEdgeDescriptionProvider.java`, `SubclassificationEdgeDescriptionProvider.java`, `CHANGELOG.adoc` v2024.3.0

#### Feature typing edge

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Feature typing edge** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: Solid edge from a usage (typed feature) to a definition (type) with a closed arrowhead with dots (CLOSED_ARROW_WITH_DOTS) and no label. Reconnecting the source updates typedFeature/specific and moves the FeatureTyping into the new source; reconnecting the target updates type/general.
  - For Grasp: usage to definition with dotted closed arrowhead; Grasp draws its defined-by line alike but can't reconnect it.
  - Sources: `AbstractFeatureTypingEdgeDescriptionProvider.java`, `FeatureTypingEdgeDescriptionProvider.java`

### Packages, imports, notes and view frames (4)

Custom diagram nodes: package folders, namespace imports, comment and documentation notes, and nested view frames.

#### New Package (top-level and nested)

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **New Package (top-level and nested)** · sysml-views / SysML General View · SysON · core · Grasp: missing
  - What it is: Structure > New Package on the background creates a package; on an existing package node it creates a nested package (the tutorial builds Requirements, ActionTree, PartsTree, RequirementsAllocation this way).
  - For Grasp: packages organise every model and nest; Grasp holds one package and cannot draw or nest packages.
  - Sources: `flashlight.adoc`

#### Package node (folder) rendering

**Grasp: missing** · parts: sysml-views

SysON features encompassed (2):

- **Package node** · sysml-views / SysML General View · SysON · core · Grasp: missing
  - What it is: Drawn as a folder whose label carries the keyword `package` (manual). Package nodes accept every definition and usage kind, Namespace Imports and nested Packages. Elements created from a Package node's palette (Part, sub-Part, sub-Package, ReferenceUsage, Item...) appear only inside the package (a sub-part on the same level, with a composition edge); a Documentation created on a Package is shown beside it; creating an item in a sub-package keeps the parent package's existing items visible. In the General View a Package node reuses (and accepts as drops) every definition, usage and annotating (Comment, Documentation, TextualRepresentation) node, nested Packages, NamespaceImport and ReferenceUsage nodes; its palette has the background's six sections with one tool per section metaclass, plus New Exhibit State / New Exhibit Parallel State (Behavior), New Namespace Import / New Reference (Structure) and four "View as" tools (General View, Interconnection View, ActionFlow View, StateTransition View) that move the package into a new typed ViewUsage. A New Documentation tool was added to Package node palettes in v2025.12.0. Fixes: a Package created inside another Package is no longer also created at the diagram root (v2025.12.0), and an element created inside a sub-Package gives one node instead of two and no longer hides unrelated nodes (v2026.1.0).
  - For Grasp: packages drawn as folders holding any element, with a full palette inside; Grasp has no package nodes.
  - Sources: `GVPackageTests.java`, `PackageNodeDescriptionProvider.java`, `GVSubNodeStructureCreationTests.java`
- **Package node rendering** · sysml-views / SysML diagram custom nodes & annotations · SysON · core · Grasp: missing
  - What it is: folder shape: a tab header at top-left (as wide as its label, widened for long labels, max 70% of the node, no bottom border, left-aligned single-line label clipped on overflow) above a body rectangle with 8px padding, both using the node background and border color/size/style; children cannot overlap the body's west border. The user manual describes the label as carrying the 'package' keyword, but in the v2026.11.0 code the label is only the short name and declared name, with no keyword.
  - For Grasp: packages drawn as a folder: a tab with the name over a body; Grasp has no package nodes.
  - Sources: `SysMLPackageNode.tsx`, `MultiLineLabelSwitch.java`, `general-view.adoc`

#### Annotating element (note) nodes

**Grasp: missing** · parts: sysml-views · note: tagged core/useful; Grasp no/partly

SysON features encompassed (2):

- **Annotating element nodes** · sysml-views / SysML General View · SysON, experimental · core · Grasp: partly
  - What it is: Documentation and Comment elements are drawn as note nodes whose label shows the element's body plus its declared name, with the keyword `doc` for Documentation and `comment` for Comment (manual). Dropping a part's Documentation or Comment from the Explorer shows it as a note (default bodies "add doc here" / "add comment here"). The General View also draws TextualRepresentation elements as note nodes (the third annotating kind, created with the section-less New Textual Representation tool). _(experimental)_
  - For Grasp: comments, documentation and textual representations drawn as note boxes; Grasp pins its own notes and shows doc in a compartment, not as SysML note nodes.
  - Sources: `general-view.adoc`, `dropFromExplorer.cy.ts`, `SDVDiagramDescriptionProvider.java`
- **Note (annotating element) node** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: custom SysMLNoteNodeStyle (2024.11.0), 200x70 by default, white background, black border, wrapping top-centered label; resizable (Documentation resize without text overflow since 2026.5.0); unsynchronized, shown only when at least one annotated element is on the diagram (node or edge not being deleted) or is the diagram's ViewUsage or its owner. Palette: Delete from Model, Edit, Show/Hide, quick-access Delete from Diagram and Duplicate Element, and a dedicated palette appearance section for the note's background color and inside-label style.
  - For Grasp: comment and documentation note nodes, shown when what they annotate is shown; Grasp has no SysML note nodes.
  - Sources: `AnnotatingNodeDescriptionProvider.java`, `DiagramQueryAnnotatingService.java`, `SysMLNoteNodePaletteAppearanceSection.tsx`

#### View frame node rendering

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **View frame node rendering** · sysml-views / SysML diagram custom nodes & annotations · SysON · core · Grasp: partly
  - What it is: rounded-corner container (radius from style, default 10) with a name compartment tab pinned at top-left (70% width, 4px 8px padding, square bottom-left and top-right corners) holding the left-aligned label.
  - For Grasp: a nested view drawn as a rounded frame with a name tab; Grasp's views are tabbed frames on the plane, never nested in another view.
  - Sources: `SysMLViewFrameNode.tsx`

### Compartments and inherited members (7)

List and free-form compartments on nodes, their visibility rules, and inherited features shown with ^.

#### Show Inherited Members

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Show Inherited Members** · diagrams / Diagram: visibility, filtering & presentation · SysON · core · Grasp: missing
  - What it is: checkbox that shows or hides inherited features: those from specializations such as subclassification, typing and subsetting, from user models. They appear in compartments as "^"-prefixed items (e.g. "^isSolid = null"), and inherited ports and parameters appear as border nodes. When it is off, no inherited features or ports are shown. Tooltip "Hide Inherited Members in Diagrams" when checked, "Show Inherited Members in Diagrams" when unchecked. It calls the `showDiagramsInheritedMembers` mutation and triggers a visibility-change refresh. Default true. Test id `ShowHideDiagramInheritedMembersCheckbox`. As with Show Icons, an error message ("An unexpected error has occurred, please refresh the page" or the payload's messages) is stored in the component's state but never displayed.
  - For Grasp: inherited features show in compartments with a "^" prefix and as inherited ports; Grasp shows only owned features.
  - Sources: `ShowHideDiagramsInheritedMembers.tsx`, `ShowDiagramsInheritedMembersEventHandler.java`, `display_inherited_ports_as_border_nodes.adoc`

#### Inherited compartment items

**Grasp: missing** · parts: diagrams, sysml-views · note: tagged core/useful

SysON features encompassed (2):

- **Inherited compartment items** · diagrams / Diagram: visibility, filtering & presentation · SysON · core · Grasp: missing
  - What it is: inherited features appear in compartments as italic rows prefixed with "^", using the same item label format. They are read-only: their palette has only the Show/Hide section, with no delete, edit or duplicate, and since 2026.9.0 no expression tools are offered on inherited compartment items or inherited border nodes. Clicking one opens that palette instead of raising an error (since 2024.9). An inherited feature no longer lists itself (fixed 2024.5.0).
  - For Grasp: inherited features listed read-only in italics with "^"; Grasp shows no inherited features.
  - Sources: `InheritedCompartmentItemNodeDescriptionProvider.java`, `CHANGELOG.adoc` v2024.9.0
- **Inherited compartment items** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Every list compartment also shows inherited features (getInheritedCompartmentItems) as italic rows prefixed with "^"; inherited rows only offer the Show/Hide section (no delete or edit). Since v2026.7.0 items compartments show inherited ItemUsages and actions compartments inherited ActionUsages (Behavior and Step list items) on ActionDefinition, ActionUsage, PartUsage and other nodes.
  - For Grasp: inherited features shown as italic rows prefixed ^; Grasp shows nothing inherited.
  - Sources: `InheritedCompartmentItemNodeDescriptionProvider.java`, `2026.7.0.adoc`

#### Compartment item (list row) node

**Grasp: missing** · parts: sysml-views · note: tagged core/useful

SysON features encompassed (2):

- **Compartment item (list row)** · sysml-views / SysML General View · SysON · core · Grasp: missing
  - What it is: Each feature in a list compartment is an icon+label row (height 15, top-left, left-aligned wrapping label from getCompartmentItemLabel, optional icon), not resizable. Its palette has Delete from Model, Edit (direct edit with getInitialDirectEditListItemLabel), quick-access Duplicate Element and the Show/Hide section.
  - For Grasp: each feature appears as an editable icon-and-label row in a compartment; Grasp has no feature rows.
  - Sources: `CompartmentItemNodeDescriptionProvider.java`
- **Compartment item row node** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: each feature in a compartment is a list row in the icon-label style (height 15, width 155), with a top-left, left-aligned wrapping label and an optional icon. The row cannot be resized and is synchronized. Its palette has Delete from Model, the 'Edit' tool (list-item grammar), the quick-access Duplicate Element, and Show/Hide. Rows are filtered by exact metaclass (oclIsTypeOf), or by kind (oclIsKindOf) when the compartment type is the abstract Usage, Definition, Feature or Type.
  - For Grasp: each feature row is 15px high with icon and wrapping label; Grasp has no rows.
  - Sources: `CompartmentItemNodeDescriptionProvider.java`, `CompartmentItemPreconditionSwitch.java`

#### List node (compartment list)

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **List node (compartment list)** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · core · Grasp: partly
  - What it is: a node whose children layout strategy is List (the layout strategy is separate from the style) renders as a list node that stacks its children vertically, with no unwanted space between the header and the first item. Its options are areChildNodesDraggable (default true), topGap, bottomGap (default 0) and growableNodeIds. Children are placed at x = border width, starting below the header plus topGap, each directly under the previous one. List compartments get a bottom separator border (0 0 1px); free-form compartments get none. Children span the parent width (minus the 2 px border) and follow horizontal resizes. Moving a list keeps its size. _(Sirius Web)_
  - For Grasp: definitions and usages show their features as stacked list compartments; Grasp's compartments are text lines, not item nodes.
  - Sources: `ListNodeLayoutHandler.ts`, `ListNodeConverter.ts`, `list.spec.ts`

#### Compartment node presentation

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Compartment node presentation** · diagrams / Diagram: visibility, filtering & presentation · SysON · core · Grasp: partly
  - What it is: each feature-group compartment (e.g. parts, attributes, ports, doc) is a transparent 155x60 rectangle with a top-centered italic 12 pt header label and no icon. Its items are stacked in a list layout with a bottom gap of 10. It cannot be resized, and it is synchronized. The label comes from the reference type: a usage type becomes lower case with "Usage" replaced by "s" ("parts", "attributes"), Documentation becomes "doc", and other types use the type name. Its palette has a Drop from Diagram tool, an item creation tool in the matching section, and Show/Hide.
  - For Grasp: named compartments (parts, attributes, ports, doc) in italic headers list a node's features; Grasp has doc, code and state action compartments but nests usages as boxes.
  - Sources: `AbstractCompartmentNodeDescriptionProvider.java`

#### List compartments on definitions

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **List compartments on definitions** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: ActionDefinition (doc, items, actions), AllocationDefinition (doc, parts), AttributeDefinition (doc, attributes), CaseDefinition (doc), ConcernDefinition (doc, attributes, requirements), ConnectionDefinition (doc, attributes, parts), ConstraintDefinition (doc, constraints), EnumerationDefinition (doc, enums), InterfaceDefinition (doc, attributes, interfaces, ports, parts), ItemDefinition (doc, attributes), MetadataDefinition (doc, attributes, references), OccurrenceDefinition (doc, attributes, occurrences), PartDefinition (doc, attributes, ports, actions, states, parts, requirements, concerns), PortDefinition (doc, attributes, ports, references, items), RequirementDefinition (doc, attributes, requirements), StateDefinition (doc, actions, states), UseCaseDefinition (doc), plus the specific compartments below. The manual lists attributes on Attribute/Interface/Item/Metadata/Occurrence/Part/Port/Requirement Definitions, constraints on Constraint Definition, documentation on every Definition, enumerated values on Enumeration Definition, interfaces on Interface Definition, ports on Interface/Part Definitions, references on Metadata/Port Definitions, occurrences on Occurrence Definition, and assumed/required constraints on Requirement Definition.
  - For Grasp: definition nodes list their attributes, ports, parts, actions and more in titled compartments; Grasp shows only doc, code and a state's actions.
  - Sources: `SDVDiagramDescriptionProvider.java`, `general-view.adoc`

#### List compartments on usages

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **List compartments on usages** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: AcceptActionUsage (doc), ActionUsage (doc, attributes, items, actions), AllocationUsage (doc, allocations), AttributeUsage (doc, attributes, references), CaseUsage (doc, attributes, ports), ConcernUsage (doc, attributes, ports), ConstraintUsage (doc, attributes, constraints, ports), ExhibitStateUsage (doc, actions, states), InterfaceUsage (doc, attributes, ports), ItemUsage (doc, attributes, ports, references), OccurrenceUsage (doc, occurrences), PartUsage (doc, attributes, actions, parts, ports, states, requirements, concerns), PerformActionUsage (doc, items, actions), PortUsage (doc, attributes, references, ports, items), RequirementUsage (doc, attributes, ports), SatisfyRequirementUsage (doc, attributes, assume constraints, require constraints, ports), StateUsage (doc, actions, states), UseCaseUsage (doc, attributes, ports), plus the specific compartments below. The manual lists items on Action Usage, allocations on Allocation Usage, attributes on Attribute/Interface/Item/Part/Port/Requirement Usages, references on Attribute/Item/Port Usages, constraints on Constraint Usage, documentation on every Usage, ports on Interface/Part Usages, occurrences on Occurrence Usage, and assumed/required constraints on Requirement Usage.
  - For Grasp: usage nodes list nested features in titled compartments; Grasp nests parts and ports graphically but shows only doc and code compartments.
  - Sources: `SDVDiagramDescriptionProvider.java`, `general-view.adoc`

### Interconnection View notation (9)

The Interconnection View: parts, ports and items on borders, and interface, flow, binding and connection edges.

#### Interconnection View diagram

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Interconnection View diagram** · sysml-views / SysML Interconnection View · SysON, experimental · core · Grasp: partly
  - What it is: shows the encapsulated structural contents of Usage elements (parts, properties, connectors, ports, interfaces); the user manual calls it an unsynchronized diagram. Created from the explorer context menu > New representation > Interconnection View (view id InterconnectionViewDiagram, domain sysml::Element), offered on a Package, Usage or Definition or any subtype (isSuperTypeOf check). History: first only on PartUsage, since 2024.5.0 on any Usage or Definition, in 2024.9.0 the separate for-Definition and for-Usage diagrams were merged into one with a single root node, and since 2025.12.0 also on Packages. The provider is only a registration stub: the diagram actually created is the shared standard diagram (SDV), default name 'view<N>'. On creation from the explorer, a non-ViewUsage element first gets a new ViewUsage (named after the representation) typed through a FeatureTyping by StandardViewDefinitions::InterconnectionView, and the General View description is rendered on it; a ViewUsage is used as is; the project is then persisted. Tutorial workflow: create the view on a part, then drag the part from the explorer onto the new view to start the diagram. _(experimental)_
  - For Grasp: shows a usage's internal parts, ports and connectors; Grasp has an interconnection view frame but can't create one on a chosen part or package.
  - Sources: `InterconnectionViewDiagramDescriptionProvider.java`, `InterconnectionViewCreateService.java`, `interconnection-view.adoc`

#### Interconnection compartment

**Grasp: partly** · parts: sysml-views · note: tagged core/useful

SysON features encompassed (2):

- **"interconnection" free-form compartment** · sysml-views / SysML Interconnection View · SysON · core · Grasp: partly
  - What it is: free-form compartment labelled "interconnection", available only in Interconnection View diagrams, on PartUsage and PartDefinition nodes. It renders nested PartUsage, ActionUsage and SatisfyRequirementUsage as nodes and accepts drag and drop of part, action and satisfy-requirement nodes. Right-click opens its palette: quick-access Pin, Adjust size, Fade, Hide; sections in order Requirements (New Satisfy Requirement, runs without a selected requirement; added 2026.1.0), Structure (New Part, New Action; added 2026.1.0), Show/Hide, Related Elements, Edit. Tools create the element inside the compartment. Since 2026.5.0 its New Satisfy Requirement is the same tool as elsewhere, with an optional dialog creating the satisfy requirement standalone, feature typed, or subsetting a RequirementUsage by reference. Since 2026.3.0, when an element is dragged into a diagram its node's compartments are hidden except the interconnection compartment. Hidden by default unless the element has exposed nested PartUsages, ActionUsages or SatisfyRequirementUsages. Style: transparent rectangle, square corners, default 155 wide and 150 high, not user-resizable (it is a growable child of the part's list layout), synchronized, header label "interconnection" top-centered in italic 12pt with no icon and no separator. The compartment was added to PartDefinition nodes in 2025.10.0 (before that only on PartUsage).
  - For Grasp: a titled interconnection compartment inside parts holding nested parts, actions and satisfy requirements; Grasp nests parts without a compartment title.
  - Sources: `InterconnectionCompartmentNodeDescriptionProvider.java`, `DiagramQueryViewService.java`, `IVInterconnectionCompartmentToolsTests.java`, `CHANGELOG.adoc` v2026.5.0
- **"interconnection" compartment** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: PartUsage and PartDefinition nodes have a growable free-form "interconnection" compartment (155x150 by default, not user-resizable on its own) where nested parts and their ports and connections can be drawn. Although the description is part of the General View, its precondition renders it only when the element belongs to an Interconnection View (the diagram's ViewUsage, or an enclosing ViewUsage frame, typed InterconnectionView), so plain General View part nodes do not show it; when rendered it is shown by default only when parts, actions or satisfy requirements are exposed inside.
  - For Grasp: parts show nested parts and connections in an interconnection compartment; Grasp nests them graphically without a titled compartment.
  - Sources: `InterconnectionCompartmentNodeDescriptionProvider.java`, `SDVDiagramDescriptionProvider.java`

#### New Port / New Port In / New Port Out

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **New Port / New Port In / New Port Out** · sysml-views / SysML Interconnection View · SysON · core · Grasp: partly
  - What it is: Structure > New Port on a part creates an undirected port shown as a border node (e.g. 'cmdPort'); New Port In and New Port Out create directional ports (e.g. 'inPort', 'outPort'); ports are the connection points used for parametric modeling. The new port (default name 'port1') is selected automatically, so typing at once renames it through direct edit and Enter confirms, with the selection kept and revealable in the Explorer (start-typing on new elements since 2026.1.0). Since 2025.12.0 creating a port no longer reveals the 'ports' compartment, the border node being enough. Directional port tools were added in 2024.7.0.
  - For Grasp: New Port, In and Out put a port on a part's border and select it for renaming; Grasp's port tool does this but takes direction from the definition.
  - Sources: `flashlight.adoc`, `diagram-selection.spec.ts`, `2025.12.0.adoc`

#### Port usage border node

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Port usage border node** · sysml-views / SysML Interconnection View · SysON · core · Grasp: partly
  - What it is: ports are 10x10 border nodes on their owner, not resizable, synchronized. Without direction: a white square with a black border (rectangular style). With a direction: image feature_in.svg, feature_out.svg or feature_inout.svg, rotated according to the side of the parent it sits on (introduced in 2024.5.0 as a rotative image pointing into the parent). Label outside the node, bottom-centered, 12pt, no icon (outside labels since 2024.5.0).
  - For Grasp: 10px port squares, white when undirected, with rotated in/out/inout images and outside labels; Grasp draws 16px squares with arrow glyphs and names beside.
  - Sources: `AbstractPortUsageBorderNodeDescriptionProvider.java`, `feature_in.svg`, `2024.5.0.adoc`

#### Interface edge

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **Interface usage edge** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: Solid edge without arrows between port border nodes (own or inherited), with an editable center label; source and target can be reconnected.
  - For Grasp: plain solid interface line between ports with an editable label; Grasp draws it but can't reconnect its ends.
  - Sources: `InterfaceUsageEdgeDescriptionProvider.java`, `AbstractInterfaceUsageEdgeDescriptionProvider.java`
- **Interface edge** · sysml-views / SysML Interconnection View · SysON · core · Grasp: partly
  - What it is: solid edge with no arrowheads for an exact InterfaceUsage between connector source and target; center label "name : Type", editable; reconnectable with owner recomputation.
  - For Grasp: solid interface line with 'name : Type' label; Grasp draws interfaces but can't reconnect ends.
  - Sources: `AbstractInterfaceUsageEdgeDescriptionProvider.java`

#### Flow edge

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **Flow usage edge** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: Solid edge with a filled closed arrow and an editable center label, from ports, items or references (own or inherited) to ports, items or references (inherited items excluded as targets); e.g. between ItemUsage border nodes of actions, between action parameters, or between ports. Source and target can be reconnected.
  - For Grasp: flow with filled arrowhead between ports, items or parameters; Grasp draws it but can't reconnect its ends.
  - Sources: `FlowUsageEdgeDescriptionProvider.java`, `GVFlowUsageTests.java`
- **Flow edge** · sysml-views / SysML Interconnection View · SysON · core · Grasp: partly
  - What it is: solid edge for an exact FlowUsage from the source output feature to the target input feature, filled closed arrowhead (INPUT_FILL_CLOSED_ARROW); center label "name : Type", editable with redefinition and subsetting off; source and target reconnectable.
  - For Grasp: solid flow line with filled arrowhead and 'name : Type' label; Grasp draws flows but can't reconnect ends.
  - Sources: `AbstractFlowUsageEdgeDescriptionProvider.java`, `IVFlowFromPartUsageTests.java`

#### Binding connector edge

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **Binding connector edge** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: BindingConnectorAsUsage drawn as a solid edge labeled "=" without arrows between port, item and reference border nodes (inherited items only as source), with an editable label and reconnectable ends (between ItemUsage border nodes since v2025.6.0).
  - For Grasp: '=' binding between ports, items and refs; Grasp draws bindings but can't reconnect their ends.
  - Sources: `BindingConnectorAsUsageEdgeDescriptionProvider.java`, `AbstractBindingConnectorAsUsageEdgeDescriptionProvider.java`, `2025.6.0.adoc`
- **Binding connector edge** · sysml-views / SysML Interconnection View · SysON · core · Grasp: partly
  - What it is: solid edge with no arrowheads for an exact BindingConnectorAsUsage, center label "="; label editable through the direct-edit grammar with redefinition and subsetting parsing off; reconnecting either end recomputes the owner and the end chains.
  - For Grasp: solid '=' line without arrowheads, label editable, ends reconnectable; Grasp draws it but can't reconnect ends.
  - Sources: `AbstractBindingConnectorAsUsageEdgeDescriptionProvider.java`

#### Connection usage edge

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Connection usage edge** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: ConnectionUsage drawn as a solid edge without arrows between connectable usage nodes, only when its exact type is ConnectionUsage, it is not a requirement derivation, and shouldRenderConnectorEdge accepts its graphical ends (interfaces, flows and allocations use their own edges). Center label getConnectionUsageLabel, edited via editEdgeCenterLabel; direct editing it sets the connection's type. Ends are reconnectable: within the same context the container is kept, to a new context it changes. Its palette has a Behavior section with New Flow.
  - For Grasp: connection line between usages, typed by editing its label, reconnectable; Grasp draws connections but can't type or reconnect them.
  - Sources: `ConnectionUsageEdgeDescriptionProvider.java`, `GVConnectionUsageEdgeTests.java`

#### New Binding Connector As Usage (bind)

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **New Binding Connector As Usage (bind)** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: Between items, ports or references, creates a binding placed in the best common container, computing the shortest feature path and creating feature chains for non-direct features (1 or 2 levels, e.g. binding i0 to i11 yields a1.a11.i11 placed in a0) and direct references for siblings; reconnecting a source or target moves the binding to the new common container and recomputes the chain (v2025.8.0).
  - For Grasp: binds ports, items or refs, building feature chains across levels; Grasp binds within one definition, without chains.
  - Sources: `GVBindingConnectorAsUsageTests.java`, `2025.8.0.adoc`
- **New Binding Connector As Usage (bind)** · sysml-views / SysML Interconnection View · SysON · core · Grasp: partly
  - What it is: edge tool creating a BindingConnectorAsUsage between two features, owned by the closest common namespace that is not read-only. Offered from port, item and reference border nodes; from port and reference border nodes any connectable usage node is a target, from item border nodes only item border nodes. Example: bind 'cmdPort' of 'flashlight' to 'cmdPort' of nested 'switch'. If no owner: warning 'Unable to find a suitable owner for this BindingConnector in <QN> containment tree.' Since 2025.8.0 the tool computes the shortest feature path between source and target features and creates a feature chain when needed (e.g. binding 'i0' to 'i11' yields the chain a1.a11.i11); binding two ItemUsage border nodes works since 2025.6.0.
  - For Grasp: binds two features, adding a feature chain when they sit at different depths; Grasp binds within one definition, without chains.
  - Sources: `ViewEdgeToolService.java`, `flashlight.adoc`, `2025.8.0.adoc`

### Action Flow View notation (10)

The Action Flow View: actions and their palettes, parameters, control nodes, successions and guards.

#### Action Flow View diagram

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Action Flow View diagram** · sysml-views / SysML Action Flow View · SysON, experimental · core · Grasp: partly
  - What it is: view of input and output flows between actions for analyzing dynamic behavior and action sequences (user manual: under development). Created from the explorer context menu > New representation > Action Flow View (view id ActionFlowViewDiagram, domain sysml::Namespace, ViewDefinition StandardViewDefinitions::ActionFlowView), offered on a Package, ActionDefinition or ActionUsage including subtypes (isSuperTypeOf). Added in 2024.3.0 on Packages, extended to ActionDefinition/ActionUsage in 2024.9.0; the Create Package tool is not offered in it. The provider only registers the menu entry; the diagram created is the shared SDV diagram. _(experimental)_
  - For Grasp: shows flows and successions between actions; Grasp has an action flow view but can't create one on a chosen action from a tree.
  - Sources: `ActionFlowViewDiagramDescriptionProvider.java`, `ActionFlowViewCreateService.java`, `action-flow-view.adoc`

#### New Parameter In / Inout / Out

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **New Parameter In / Inout / Out** · sysml-views / SysML Action Flow View · SysON · core · Grasp: partly
  - What it is: creates a ReferenceUsage parameter in a FeatureMembership of the selected action with direction in, inout or out; compartment not revealed; icons parameterIn.svg, parameterInout.svg, parameterOut.svg. In the Structure section of ActionUsage/ActionDefinition palettes and in the palette of their parameters compartment.
  - For Grasp: creates in, inout or out parameters on an action; Grasp places parameters and sets direction in the panel, no per-direction tools.
  - Sources: `ParameterCompartmentNodeToolProvider.java`, `ActionUsageParametersCompartmentNodeDescriptionProvider.java`

#### Action flow compartment

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **Action flow compartment** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: ActionUsage, PartUsage, PerformActionUsage (nestedAction) and ActionDefinition, PartDefinition (ownedAction) nodes have a free-form "action flow" compartment (default height 150) where sub-actions, control nodes and successions are drawn graphically. The manual lists Action, Accept action, Start action, Done action, Fork action, Join action, Merge action, Decision action and Perform action as body content of Action Definition and Action Usage nodes.
  - For Grasp: a free-form action flow compartment on actions and parts; Grasp nests flows inside action boxes but not in parts or a general view.
  - Sources: `ActionFlowCompartmentNodeDescriptionProvider.java`, `SDVDiagramDescriptionProvider.java`, `general-view.adoc`
- **"action flow" free-form compartment** · sysml-views / SysML Action Flow View · SysON · core · Grasp: partly
  - What it is: free-form compartment labelled "action flow" (italic 12pt, transparent, 150 high by default) on ActionUsage, ActionDefinition and part nodes, where nested actions are laid out freely and connected with edges. Renders Comment, ActionUsage, AcceptActionUsage, AssignmentActionUsage, PerformActionUsage, start/done action and Join/Fork/Merge/Decision nodes. Palette: Behavior (action creation, start, accept action, decision, fork, join, merge, done, perform action), Show/Hide, Related Elements. Accepts drops of ActionUsage, AcceptActionUsage, PerformActionUsage, its own items and Join/Fork/Merge/Decision nodes; creation tools target and reveal it.
  - For Grasp: a titled action flow compartment inside actions and parts; Grasp nests flows in action boxes without a titled compartment.
  - Sources: `ActionFlowCompartmentNodeDescriptionProvider.java`, `2024.5.0.adoc`

#### Control nodes

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Control nodes** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: Custom nodes for the standard start action (28x28), done action (36x36), JoinNode and ForkNode (100x12 bars filled with actionGreen #466044), and MergeNode and DecisionNode (36x36), drawn inside action flow compartments. Their palettes offer "Remove Join", "Remove Fork", "Remove Merge" and "Remove Decision" respectively. A Decision, Fork, Join or Merge node at the top level of a diagram whose ViewUsage is typed General View is hidden by default.
  - For Grasp: fork and join bars in actionGreen #466044, decision and merge diamonds, start and done; Grasp draws all but its bars are filled in the text colour.
  - Sources: `AbstractControlNodeActionNodeDescriptionProvider.java`, `JoinActionNodeDescriptionProvider.java`, `DecisionActionNodeDescriptionProvider.java`

#### Decision and Merge nodes

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Decision and Merge nodes** · sysml-views / SysML Action Flow View · SysON · core · Grasp: partly
  - What it is: 36x36 images (decision_action.svg, merge_action.svg); not resizable or collapsible; name as outside label at bottom center without icon; synchronized with exposed-element candidates; edge tools New Succession and New Transition.
  - For Grasp: 36x36 decision and merge images with the name below; Grasp draws hollow diamonds with the name at lower right.
  - Sources: `DecisionActionNodeDescriptionProvider.java`, `MergeActionNodeDescriptionProvider.java`

#### Fork and Join nodes

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Fork and Join nodes** · sysml-views / SysML Action Flow View · SysON · core · Grasp: partly
  - What it is: solid rectangular bars filled with the "actionGreen" color (#466044), no border, radius 0, 100x12 by default; name below the bar; not collapsible; edge tools New Succession and New Transition. Since 2026.3.0 edges always attach to the bar instead of empty space. At v2026.11.0 a Join bar resizes only horizontally while a Fork bar resizes in both directions, although the 2026.3.0 release notes state that both moved to a rectangular node style restricted to horizontal resizing.
  - For Grasp: green #466044 fork and join bars, 100x12, rotatable; Grasp's bars are filled in the text colour and can't be resized.
  - Sources: `ForkActionNodeDescriptionProvider.java`, `JoinActionNodeDescriptionProvider.java`, `SDVDescriptionProvider.java`

#### Parameter border nodes

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **Parameter (ReferenceUsage) border nodes** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: ActionDefinition and ActionUsage nodes show reference-usage parameters (getReferenceUsagesParameters) as 10x10 non-resizable border nodes with conditional styles and an outside bottom label. Palette: Delete from Model, Edit, Duplicate Element, Show/Hide; edge tools bind and flow. Inherited parameters (getInheritedCompartmentItems("parameter")) appear as "^"-prefixed 10x10 border nodes with only Show/Hide, still offering bind and flow.
  - For Grasp: action parameters as border squares with direction images; Grasp draws them, as items rather than reference usages, and shows no inherited ones.
  - Sources: `ReferenceUsageBorderNodeDescriptionProvider.java`, `InheritedReferenceUsageBorderNodeDescriptionProvider.java`
- **Parameter (reference usage) border nodes** · sysml-views / SysML Action Flow View · SysON · core · Grasp: partly
  - What it is: parameters (ReferenceUsages) of ActionUsage and ActionDefinition are 10x10 border nodes (2025.12.0); directional ones use the rotatable images parameter_in.svg, parameter_out.svg, parameter_inout.svg; label outside, bottom-centered; edge tools New Binding Connector As Usage (bind) and New Flow (flow). Inherited parameters also appear as border nodes (2026.9.0).
  - For Grasp: parameters as 10px border squares with direction images; Grasp draws them with arrow glyphs, as items, and no inherited ones.
  - Sources: `AbstractReferenceUsageBorderNodeDescriptionProvider.java`, `2025.12.0.adoc`, `2026.9.0.adoc`

#### Succession edge

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Succession edge** · sysml-views / SysML Action Flow View · SysON · core · Grasp: partly
  - What it is: dashed edge with an open arrowhead at the target; begin label shows the guard expression as "[expr]" when defined (2026.7.0); center label shows name and type, edited with "Edit Succession Label"; shown only when both ends are in the same graphical container and the succession is not owned by a TransitionUsage; reconnecting an end updates its reference subsetting, and a target can be reconnected to 'done'. Since 2025.4.0 a succession's source and target are computed from its sourceFeature and targetFeature; successions starting or ending at an inherited standard-library action (start, done) made earlier may then display wrongly and must be deleted and recreated (by drag and drop or Add existing elements).
  - For Grasp: dashed open-arrow succession with '[guard]' begin label, reconnectable; Grasp shows guards but can't reconnect ends.
  - Sources: `AbstractSuccessionEdgeDescriptionProvider.java`, `2025.4.0.adoc`, `DiagramQueryLabelService.java`, `2026.7.0.adoc`

#### Guard expressions on successions and transitions

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Guard expressions on successions and transitions** · sysml-views / SysML Action Flow View · SysON · core · Grasp: partly
  - What it is: Successions and Transitions are, with Attributes and Constraints, the elements that can hold an expression: from the Edit section of their edge palette or their Explorer context menu, 'New expression' (only while no expression exists) opens a modal where the guard is typed as text and validated on Update, errors shown in an expandable accordion; 'Edit expression' reopens it pre-filled; Default value / Initial value checkboxes are not shown for transition guards. Expression support on TransitionUsage was fixed in 2026.7.0 and on SuccessionAsUsage in 2026.9.0; the guard then appears as the succession's '[expr]' begin label or in the transition label.
  - For Grasp: guards typed in a validated expression dialog; Grasp edits a guard as a plain panel field.
  - Sources: `expressions.adoc`, `ExpressionsPaletteToolsProvider.java`, `2026.9.0.adoc`

#### New Action / New Accept Action / New Assignment Action (action flow)

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **New Action / New Accept Action / New Assignment Action (action flow)** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: On action and part nodes, New Action creates a sub-action (createSubActionUsage), exposes it, reveals the action flow compartment and selects it (nested actions also listed in "actions" and as sibling node); New Accept Action and New Assignment Action create those actions in the action flow compartment.
  - For Grasp: creates nested, accept and assignment actions in an action flow; Grasp has actions, send and accept, but no assignment.
  - Sources: `ActionFlowCompartmentNodeToolProvider.java`, `AcceptActionNodeToolProvider.java`, `GVSubNodeActionFlowCreationTests.java`

### State Transition View notation (5)

The State Transition View: states, parallel states, entry/do/exit actions, start/done and transitions.

#### State Transition View diagram

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **State Transition View diagram** · sysml-views / SysML State Transition View · SysON, experimental · core · Grasp: partly
  - What it is: view of a system's states and transitions in response to events or stimuli (user manual: under development). Created from the explorer context menu > New representation > State Transition View (view id StateTransitionViewDiagram, domain sysml::Namespace, ViewDefinition StandardViewDefinitions::StateTransitionView). Unlike the other views it uses strict EClass equality: offered only on elements whose exact metaclass is Package, PartUsage, PartDefinition, StateUsage or StateDefinition (subclasses such as ExhibitStateUsage are refused). Added in 2024.5.0 on Packages; parts and states since 2024.9.0. The diagram created is the shared SDV diagram. _(experimental)_
  - For Grasp: shows a system's states and transitions; Grasp has a state transition view but can't create one on a chosen part or state.
  - Sources: `StateTransitionViewDiagramDescriptionProvider.java`, `StateTransitionViewCreateService.java`, `state-transition-view.adoc`

#### New State / New Parallel State

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **New State / New Parallel State** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: On parts and states, create a child state (the parallel one sets isParallel) via createChildState in the "states" / state transition compartment and reveal the target compartment (e.g. nested states "initial", "off", "on").
  - For Grasp: adds nested or parallel states to parts and states; Grasp nests states in states and state defs, not in parts.
  - Sources: `StateTransitionCompartmentNodeToolProvider.java`, `flashlight.adoc`
- **New State / New Parallel State** · sysml-views / SysML State Transition View · SysON · core · Grasp: partly
  - What it is: create a child StateUsage in a FeatureMembership of the selected StateUsage, StateDefinition, PartUsage or PartDefinition, with default name; 'New Parallel State' sets isParallel=true (availability conditions fixed in 2024.7.0). The node is created inside the 'state transition' compartment whether the tool runs on the compartment or the parent node, then exposed, revealed and selected. On PartUsage and PartDefinition these replace the generic New State tool.
  - For Grasp: nested and parallel states in states and parts, selected on creation; Grasp nests and marks parallel states, not inside parts.
  - Sources: `StateTransitionCompartmentNodeToolProvider.java`, `DiagramMutationElementService.java`, `UtilService.java`

#### New Entry / Do / Exit Action

**Grasp: partly** · parts: diagrams, sysml-views · note: tagged core/useful

SysON features encompassed (3):

- **New Entry Action / New Do Action / New Exit Action** · sysml-views / SysML State Transition View · SysON · core · Grasp: partly
  - What it is: on StateUsage and StateDefinition nodes (Behavior); each creates a PerformActionUsage in a new StateSubactionMembership of kind entry, do or exit (2025.6.0, per the SysML v2 spec). An optional dialog (title = tool name, description 'Create a <Kind> Action:' with Kind capitalized as Entry, Do or Exit) offers 'Create a new <Kind> Action' ('Create a new <Kind> Action without reference to an existing Action') or 'Select an existing Action referenced by the <Kind> Action you want to create' ('Create a new <Kind> Action referencing the selected Action'); only ActionUsages are selectable; status messages 'It will create a new <Kind> Action without reference to an existing Action', 'Select an Action referenced by the new <Kind> Action' and 'It will create a <Kind> Action referencing <name>'. A picked ActionUsage is referenced by a ReferenceSubsetting. Each tool shows only while the state has no subaction of that kind. After creation the matching compartments are revealed (2026.1.0); not explicitly exposed, not auto-selected. Icon PerformActionUsage.svg.
  - For Grasp: entry, do and exit actions as perform actions, optionally referencing an action; Grasp adds them but can't reference another action.
  - Sources: `StateSubactionNodeToolProvider.java`, `DiagramMutationToolService.java`, `DiagramQueryToolService.java`
- **New Entry/Do/Exit Action dialog** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: partly
  - What it is: Title 'New <Kind> Action' (Entry, Do or Exit), description 'Create a <Kind> Action:'. Choices: 'Create a new <Kind> Action' ('…without reference to an existing Action') and 'Select an existing Action referenced by the <Kind> Action you want to create'; ActionUsages are listed. Status: 'It will create a new <Kind> Action without reference to an existing Action', 'Select an Action referenced by the new <Kind> Action', 'It will create a <Kind> Action referencing <name>'.
  - For Grasp: entry, do and exit actions can reference an existing action; Grasp creates them inside a state, without a reference.
  - Sources: `StateSubactionNodeToolProvider.java`, `TreeQuerySelectionDialogService.java`
- **New Entry / Do / Exit Action** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: State-node tools, each available only while the state has no subaction of that kind (isEmptyOfActionKindCompartment). Each opens an optional tree dialog (title "New Entry Action" / "New Do Action" / "New Exit Action", text "Create a <Kind> Action:") to create a new subaction ("Create a new <Kind> Action", status "It will create a new <Kind> Action without reference to an existing Action") or "Select an existing Action referenced by the <Kind> Action you want to create" (statuses "Select an Action referenced by the new <Kind> Action" and "It will create a <Kind> Action referencing <name>"; only ActionUsages selectable) (e.g. picking "produceDirectedLight" as the do action), then calls createStateSubaction with kind entry, do or exit and reveals the target compartment. A Do Action on a StateUsage inside a state transition compartment reveals its perform action compartment; with a referenced action the PerformActionUsage shows in the state.
  - For Grasp: adds entry, do and exit actions, optionally referencing an existing action; Grasp adds them but can't reference another action.
  - Sources: `StateSubactionNodeToolProvider.java`, `StateCompartmentRevealTests.java`, `GVStateDoActionWithReferencedActionTests.java`

#### Start and Done state nodes

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **Start and Done state nodes** · sysml-views / SysML General View · SysON · core · Grasp: partly
  - What it is: Custom Start State (28x28) and Done State nodes represent the standard start/done states inside state transition compartments.
  - For Grasp: start and done states inside a state's compartment; Grasp has done and an initial node drawn as a filled rounded bar, not a start circle.
  - Sources: `StartStateNodeDescriptionProvider.java`, `SDVDiagramDescriptionProvider.java`
- **Start state and Done state nodes** · sysml-views / SysML State Transition View · SysON · core · Grasp: partly
  - What it is: start state is a 28x28 image (images/start_action.svg), done state a 36x36 image (images/done_action.svg), representing the standard-library start and done states (their semantic candidate is States::StateAction::start or ::done, whatever the containing state); unsynchronized, not resizable or collapsible; no label; palette only quick-access Delete from Diagram and Show/Hide (no delete from model, the library element is read-only). They are not top-level diagram nodes: their descriptions are reused only inside 'state transition' compartments (and held by a hidden zero-size holder node). Start state offers New Transition (to StateUsage nodes) and New Connection (to any connectable StateUsage) edge tools; done state has no edge tool.
  - For Grasp: start state a 28px image, done a 36px image, not top-level; Grasp's initial node is a filled rounded bar.
  - Sources: `StartStateNodeDescriptionProvider.java`, `DoneStateNodeDescriptionProvider.java`, `AbstractFakeNodeDescriptionProvider.java`

#### Transition edge and its label format

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **Transition edge** · sysml-views / SysML State Transition View · SysON · core · Grasp: partly
  - What it is: TransitionUsage edge (1px, default edge color, open INPUT_ARROW target arrowhead, no source arrowhead), dashed by default and solid whenever its target is a StateUsage (so also action-to-state transitions); center label shows triggers, guard and effects as '<accept parameter parts joined by " | "> [guard1& guard2] / effect1, effect2'; drawn only between nodes in the same graphical container; candidates exclude standard libraries; ends only on action or state nodes drawn as boxes, never compartment rows; done nodes cannot be sources and start nodes cannot be targets. Label examples from the tests: 'TurnOn via commPort' (accept trigger with receiver), 'after 5 [min] via ' (time trigger without receiver), '[x > 0]' (guard only); the accepter part was added to the label in 2025.6.0. A transition is drawn in every container showing both its states, e.g. once between background state nodes and again inside a 'state transition' compartment. Since 2025.6.0 a transition is no longer drawn twice when its source or target appears several times in the diagram.
  - For Grasp: label 'trigger via receiver [guard] / effect', dashed unless it ends on a state; Grasp labels 'trigger [guard] / effect' without the via part.
  - Sources: `AbstractTransitionEdgeDescriptionProvider.java`, `GVStateTransitionUsageTests.java`, `2025.6.0.adoc`
- **Transition label format** · sysml-views / Direct edit & label syntax · SysON · core · Grasp: partly
  - What it is: a transition label reads trigger accept-parameter parts joined by ' | ', then the guards as '[g1& g2]', then '/ effect1, effect2', built from each effect action's direct-edit label (for an accept effect, its payload's). Test labels: 'TurnOn via commPort', 'after 5 [min] via '. The 2025.6.0 notes describe the accepter shown as 'accept TurnOn via commPort' and guards as 'if x > 0.0'; the v2026.11.0 code prints no 'accept'/'if' keywords and puts guards in brackets. Since 2025.4.0 guard expressions in the label are produced by the SysML serializer; the 2025.4.0 note already warned they could be displayed but not edited through direct edit.
  - For Grasp: transition label 'trigger via receiver [guard] / effect'; Grasp writes 'trigger [guard] / effect' without the via part.
  - Sources: `DiagramQueryLabelService.java`, `GVStateTransitionUsageTests.java`, `2025.6.0.adoc`

### Requirements and concerns notation (2)

Requirement, concern and satisfy nodes, their compartments and tools, and derive, satisfy and frame edges.

#### New Requirement (background or nested)

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **New Requirement (background or nested)** · sysml-views / SysML General View · SysON · core · Grasp: missing
  - What it is: Click the background to open the palette and choose Requirements > New Requirement to create a requirement; the same tool on an existing element (e.g. another requirement) creates a nested requirement. A RequirementUsage created from a Package node is revealed on the diagram (v2026.3.0). RequirementDefinition palettes also create Requirements inside the definition (v2024.7.0). The requirements page of the manual is outdated: it still says the General View can only create Requirement Definitions and Requirement Usages and that satisfy relationships are not yet available.
  - For Grasp: requirements are a central SysML concept, top-level or nested; Grasp has no requirement elements.
  - Sources: `requirement-management.adoc`, `flashlight.adoc`, `CHANGELOG.adoc` v2026.3.0

#### Requirement nodes on the General View

**Grasp: missing** · parts: representations, sysml-views · note: tagged core/useful

SysON features encompassed (2):

- **Requirement nodes on the General View** · representations / Requirements & tables · SysON · core · Grasp: missing
  - What it is: requirements are created from the diagram background palette (click the background to show it) or inside another element such as a requirement. A Requirement Definition is drawn as a rectangle and a Requirement Usage as a rectangle with rounded corners. A tool to create Requirements inside a RequirementDefinition was added in v2024.7.0, and creating a RequirementUsage from a Package node reveals it since v2026.3.0. The user manual still says only Requirement Definitions and Usages can be created and that Satisfy relationships are not yet available, which is outdated.
  - For Grasp: requirement definitions and usages drawn as boxes are basic SysML v2 notation; Grasp's general view has no requirement kinds.
  - Sources: `requirement-management.adoc`, `2024.7.0.adoc`, `2026.3.0.adoc`
- **Requirement node shapes** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: A Requirement Definition is drawn as a rectangle and a Requirement Usage as a rounded rectangle.
  - For Grasp: requirement defs square, requirement usages rounded; Grasp has no requirements.
  - Sources: `requirement-management.adoc`

## Editing

### Direct edit and label syntax (3)

Editing labels in place with SysML-like text: names, short names, prefixes, typing, redefinition and multiplicity.

#### Node direct-edit syntax order

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Node direct-edit syntax order** · sysml-views / Direct edit & label syntax · SysON · core · Grasp: partly
  - What it is: `[abstract|variation|variant|timeslice|snapshot]* [ref] [<shortName>] [name] [[multiplicity]] [feature expressions]`. Prefix keywords count only when followed by whitespace (`abstract ` vs `abstractFoo`).
  - For Grasp: node text: prefixes, ref, <short> name, [mult], then relationships; Grasp parses name, multiplicity and relationships but not prefixes, ref or short names.
  - Sources: `DirectEdit.g4`

#### Typing `: Type`

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Typing `: Type`** · sysml-views / Direct edit & label syntax · SysON · core · Grasp: partly
  - What it is: `: Name` (simple, qualified with `::`, short name or qualified short name) types a Usage; on a Definition the typing part is ignored. The name resolves first through namespace scoping from the element (or its owning namespace), then by a global search of all resources by name or short name; with several candidates the closest in scope wins. An import of the type's namespace is added when needed. The existing FeatureTyping is updated (isImplied cleared when the type changes) or a new one is created, and any ConjugatedPortTyping is removed; subsettings, redefinitions and subclassifications follow the same rule (the first existing one is retargeted and loses isImplied, else one is created). ': Type' types without renaming. The type name is read with its inner spaces, so an unquoted name with spaces (': My Type') resolves, or is created, as 'My Type'. Qualified names that go through a namespace publicly importing the target resolve: 'myAttribute : ISQ::MassValue' types with ISQBase::MassValue (2024.9.0).
  - For Grasp: ': Type' types a usage, resolving nearest first then anywhere, adding imports; Grasp resolves alike but has no libraries or imports.
  - Sources: `DiagramDirectEditListener.java`, `UtilService.java`, `GVDirectEditTests.java`

#### Default initial direct-edit text for nodes and list items

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Default initial direct-edit text for nodes and list items** · sysml-views / Direct edit & label syntax · SysON · core · Grasp: partly
  - What it is: the editor is prefilled, for usages only, with the prefixes (portion kind timeslice/snapshot, variation, variant, abstract, and ref when referential and not an attribute or ConnectionDefinition end; definitions, packages and other non-usages get no prefix; compartment rows instead start with the row prefixes direction, abstract, variation, constant, derived, end and ref, with no portion kind or variant), then '<short> name', the multiplicity `[a..b]` (with ordered and nonunique on list items), ': Type', ':>> redefined', ':> subsetted' and ':> superclassifier'. Values are never included. Standard-library references appear qualified, and expression bounds use resolvable, escaped SysML names. Comments, documentation and textual representations start with their body. Round-trip quirks at v2026.11.0: the `variant` prefix is written without a trailing space, so it is glued to the next word (e.g. 'variantwheel') and re-parsed as part of the name unless the user fixes it; graphical-node text includes ' ordered'/' nonunique' after the multiplicity although the node rule has no such suffix (a syntax error is logged and the flags stay unchanged); list-item text includes a '::> referenced' reference-subsetting part that the grammar has no rule for (`::` ends the name and the part is ignored).
  - For Grasp: the editor prefills prefixes, <short> name, [mult], ': Type', ':>>', ':>'; Grasp prefills name, multiplicity, type and ':>' only.
  - Sources: `DiagramQueryLabelService.java`, `LabelConstants.java`, `DirectEdit.g4`

### Label formats and presentation (2)

How node, compartment and edge labels read and are laid out, including outside, wrapped and multi-part labels.

#### Multi-line node label format

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Multi-line node label format** · sysml-views / Direct edit & label syntax · SysON · core · Grasp: partly
  - What it is: definition and usage node labels show stereotype lines first, then «[ref ]keyword» on its own line, then a name line. The name line holds the short name, the multiplicity in brackets just before the specialization (e.g. 'wheels[4] : Wheel'), ': Type', ':>> redefined', '::> referenced', ':> subsetted' and the value. Usage keywords: accept action, action, allocation, attribute, assign, case, concern, constraint, exhibit state, interface, item, occurrence, part, port, requirement, satisfy requirement, use case, state. Definitions show '<kind> def' plus ':> superclassifier' (e.g. «part def» then 'Batmobile :> Vehicle'), for action, allocation, attribute, case, concern, constraint, connection, enumeration, interface, item, metadata, occurrence, part, port, requirement, use case, state. A ViewUsage shows «view» followed by the name and ': Type' on the same line. Packages show only their name (the General View doc says a package label has the keyword `package`, which the code does not add). ConnectionDefinition nodes show «connection def» since 2026.3.0 (they wrongly showed «part def» before). The user doc (experimental) describes the same: keywords on the first line, then the simple name or a subset of the textual syntax.
  - For Grasp: «keyword» line then 'wheels[4] : Wheel' with redefinitions and value; Grasp puts the multiplicity after the type and shows no redefinitions or values.
  - Sources: `MultiLineLabelSwitch.java`, `MultilineLabelSwitchTest.java`, `manage-labels-diagram.adoc`

#### SysON node label presentation

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **SysON node label presentation** · sysml-views / Direct edit & label syntax · SysON · core · Grasp: partly
  - What it is: definition and usage nodes put their label at TOP_CENTER, centered, wrapping, as a header with a separator line drawn only when the node shows children (IF_CHILDREN). Note (comment, documentation, representation) nodes use TOP_CENTER, centered, wrapping, without separator. Package and ViewUsage labels are truncated with an ellipsis instead of wrapping (Package ellipsis added in 2025.4.0 for the General View and State Transition View; Package header width was widened for long labels in 2024.3.0). Wrapping of Usage and Definition labels, which lets users narrow nodes with long names, came in 2025.4.0, as did wrapping of NamespaceImport labels. Compartment rows are TOP_LEFT, left-aligned and wrapping. Label text is black, and the element icon before the text depends on the diagram's Show icons toggle (`ViewLabelService.showIcon`).
  - For Grasp: labels centred at the top, wrapping, with icons and a rule only when children show; Grasp centres headers but has no icons or wrapping.
  - Sources: `AbstractDefinitionNodeDescriptionProvider.java`, `AbstractPackageNodeDescriptionProvider.java`, `CompartmentItemNodeDescriptionProvider.java`

### Styling, icons and appearance (3)

Per-element appearance editors, project themes, default colours and sizes, arrowheads and SysML icons.

#### Coloured per-metaclass SysML icons

**Grasp: missing** · parts: diagrams, views · note: tagged core/useful

SysON features encompassed (3):

- **Per-metaclass SysML icons** · views / Explorer view (model tree) · SysON · core · Grasp: missing
  - What it is: Each SysML metaclass has an item provider that supplies an SVG icon (198 files in `icons/full/obj16`, e.g. PartUsage.svg, Package.svg, Comment.svg), used for every element and resource through the label service. Since 2026.11.0 the SysML icons are redrawn in color, matching the diagram icons (e.g. ActionDefinition, ActionUsage, PartUsage, StateUsage, CaseUsage, ConstraintUsage).
  - For Grasp: a colour icon per metaclass, matching the diagrams, is much of how SysON's tree looks; Grasp shows text keywords instead.
  - Sources: `PartUsageItemProvider.java`, `2026.11.0.adoc`, `SysONDefaultExplorerServices.java`
- **Icons for all SysML elements** · diagrams / Diagram: appearance & styling · SysON · useful · Grasp: missing
  - What it is: Every SysML element has its own icon (2024.5); State, Conjugation, Port (in, in/out, out) and Item (in, in/out, out) icons were added in 2024.7. Icons appear in the Explorer, diagrams and Details view.
  - For Grasp: every SysML element has its own icon in tree, diagram and details; Grasp uses keyword text instead.
  - Sources: `2024.5.0.adoc`, `CHANGELOG.adoc`
- **Harmonized colored SysML icons** · diagrams / Diagram: appearance & styling · SysON · useful · Grasp: missing
  - What it is: SysML icons were redesigned and are colored in all diagrams and in the Explorer (e.g. new ActionDefinition, ActionUsage, PartUsage, StateUsage, CaseUsage and ConstraintUsage icons) (2026.11).
  - For Grasp: redesigned coloured SysML icons everywhere; Grasp has no icons.
  - Sources: `2026.11.0.adoc`, `CHANGELOG.adoc` v2026.11.0

#### Default diagram colors

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Default diagram colors** · diagrams / Diagram: appearance & styling · SysON · core · Grasp: partly
  - What it is: Without the theme or manual styling, nodes have a white background, black border and black labels; compartments are transparent; edges are black and 1 pixel wide; fork and join bars use actionGreen.
  - For Grasp: white nodes, black borders and labels, 1 px black edges; Grasp's boxes are white with a near-black 1.25 px border and teal ports.
  - Sources: `ViewConstants.java`, `ConnectionUsageEdgeDescriptionProvider.java`

#### Edge arrow markers

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Edge arrow markers** · diagrams / Diagram: appearance & styling · Sirius Web · core · Grasp: partly
  - What it is: Each end is one of None, OutputArrow, InputArrow, OutputClosedArrow, InputClosedArrow, OutputFillClosedArrow, InputFillClosedArrow, Diamond, FillDiamond, InputArrowWithDiamond, InputArrowWithFillDiamond, Circle, FillCircle, CrossedCircle, ClosedArrowWithVerticalBar, ClosedArrowWithDots or ClosedArrowWith4Dots (like ClosedArrowWithDots with a second pair of dots). Unknown values fall back to InputFillClosedArrow. Markers are React Flow edge markers: they scale with stroke width, auto-orient (auto-start-reverse) and use the edge color, and hollow shapes are filled with the canvas background. Each edge gets its own marker definitions in a shared SVG defs block, with a '--selected' variant in the selection color swapped in while the edge is selected. _(Sirius Web)_
  - For Grasp: a full set of arrowheads in the edge colour, swapped for the selection colour; Grasp has the arrowheads its line kinds need.
  - Sources: `MarkerDefinitions.tsx`, `diagram.graphqls`, `CHANGELOG.adoc`

## Model behaviour

### Model semantics: metamodel, naming and imports (2)

Metamodel conformance, default names, name resolution and automatic namespace imports.

#### SysML v2 / KerML metamodel conformance

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **SysML v2 / KerML metamodel conformance** · model / Model semantics & editing services · SysON · core · Grasp: partly
  - What it is: SysON ships built-in implementations of the OMG SysML v2 and KerML metamodels, aiming at full compliance, with KerML/SysML library support; every SysON model adheres to the SysML v2 metamodel.
  - For Grasp: every model conforms to the SysML v2 metamodel; Grasp's kinds stand on the Pilot's SysML.ecore but cover a small subset.
  - Sources: `key-features.adoc`, `faq.adoc`, `concepts.adoc`

#### Name resolution of direct-edit specializations

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Name resolution of direct-edit specializations** · model / Model semantics & editing services · SysON · core · Grasp: partly
  - What it is: the names typed after ':', ':>' or ':>>' in a diagram label are resolved with these behaviors, all covered by tests: an unqualified standard-library name (`part : MassValue`) resolves to the library element (shown as 'ISQBase::MassValue') and adds the NamespaceImport `import ISQBase::*` next to the part without creating any new definition; a qualified name through a re-exporting package (`ISQ::MassValue`) resolves via its public import to ISQBase::MassValue (v2024.9.0); a short name (`: PDef2`), a qualified short name or a full qualified name types the part with the matching definition, the candidate in the same scope winning when several match; `x :>> x` redefines the inherited feature of the same name rather than the element itself (v2026.3.0); `:> parts` resolves to Parts::parts; a name matching nothing (`p1 :> aNewPart`) creates a new element of the appropriate kind in the same container.
  - For Grasp: ':', ':>' and ':>>' in a label resolve to the right element or make one; Grasp resolves ':' and ':>' in its package, without libraries, qualified names or ':>>'.
  - Sources: `GVDirectEditTests.java`, `directEditTests.cy.ts`, `model-management.adoc`

### Validation (1)

Model checks against the SysML v2 specification rules and how problems are reported.

#### SysML v2 specification rules

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **SysML v2 specification rules** · model / Validation & model checks · SysON, experimental · core · Grasp: partly
  - What it is: SysON implements the constraints (validation rules) of the SysML v2 specification as 383 built-in rules (the SysMLValidationRule enumeration) and runs them on the user's models. The rules were introduced in v2025.2.0, turned into an enumeration in v2026.3.0, and updated for the 2024-12 specification (v2025.4.0) and aligned with the 2025-04 specification (v2025.8.0). The user manual marks this experimental. _(experimental)_
  - For Grasp: conformance to the specification's own constraints is SysON's validation; Grasp checks 15 of the rules, not the 383.
  - Sources: `SysMLValidationRule.java`, `validation.adoc`, `2025.8.0.adoc`

### Undo, redo and change safety (6)

Undo and redo across the editor, deletion confirmation and impact previews.

#### Redo and undo keyboard shortcuts

**Grasp: missing** · parts: application · note: Grasp no/partly

SysON features encompassed (2):

- **Redo shortcuts** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · core · Grasp: missing
  - What it is: Redo is Ctrl+Shift+Z on Linux/macOS and Ctrl+Y on Windows; in fact both combinations, with Ctrl or Cmd/Meta, work on every platform. It sends a redo mutation for the most recent entry of the redo stack. _(Sirius Web)_
  - For Grasp: Ctrl+Shift+Z or Ctrl+Y redoes what was undone; Grasp has no redo.
  - Sources: `CHANGELOG.adoc` v2025.2.0, `UndoRedo.tsx`
- **Undo/redo keyboard shortcuts** · application / Collaboration, undo/redo & change safety · Sirius Web · core · Grasp: partly
  - What it is: in the edit-project workbench (window-level keydown listeners), Ctrl+Z / Cmd+Z undoes the last recorded action and Ctrl+Y or Ctrl+Shift+Z (Cmd variants) redoes it; result messages and errors appear as toasts. Introduced in Sirius Web v2024.11 / SysON v2025.2.0 for semantic changes from the Explorer and Details only (resource deletion excluded), later extended to diagram changes. There is no Undo/Redo button or menu entry: keyboard only. The listeners don't check focus and don't call preventDefault, so the shortcuts also fire while typing in a text field (where the browser's own text undo runs too). Each press sends one undo/redo for the top entry of the stack and does nothing when the stack is empty. Each tab's stack holds only the mutations sent from that tab, so a user undoes their own operations, not other users'. Library pages don't mount the handler. _(Sirius Web)_
  - For Grasp: keyboard undo and redo while editing; Grasp undoes with Ctrl/⌘+Z but has no redo.
  - Sources: `UndoRedo.tsx`, `2025.2.0.adoc`, `CHANGELOG.adoc` v2025.2.0

#### Ctrl/Cmd+Z undo in the project editor

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Ctrl/Cmd+Z undo in the project editor** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · core · Grasp: partly
  - What it is: anywhere on the edit-project page, Ctrl+Z (Cmd+Z) sends an undo mutation (undo(editingContextId, inputId)) for the most recent recorded change; Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z redoes it. - Recording: an Apollo link pushes the input id of every GraphQL mutation (except undo, redo and layoutDiagram) onto an undo stack in sessionStorage and clears the redo stack; diagram layout synchronizations push their own mutation id. Both stacks are reset when the page loads and whenever a project editor opens, so history is per tab and lost on reload. The stacks have no size limit, and with an empty stack the shortcut does nothing. The handlers never call preventDefault, so in a text field the browser's own text undo/redo runs as well as the server undo. - A successful undo moves the entry to the redo stack (and redo moves it back); success and error payload messages are shown as toasts, and network errors as error toasts. - No button: undo and redo are keyboard-only. There is no toolbar button or menu entry, and nothing shows whether an undo is available. - Scope: SysON's 2025.2.0 release notes describe undo/redo of semantic changes made in the Explorer and Details views, 'not available yet in diagrams'; Sirius Web later added undo/redo of diagram layout, label, edge and appearance changes (2025.10.0). Since SysON 2025.12.0, undoing the deletion of a diagram node restores the graphical node, which a backend test checks (create a part with 'New Part', delete it, undo, the node is back). Deleting a resource is not undoable. Integrators can make the backend recorder skip more mutation inputs with IUndoRedoIgnoreInputPredicate (Sirius Web 2026.1.0). The listener is on the window and does not check the focused element, so Ctrl+Z inside a text field also triggers a server undo.
  - For Grasp: Ctrl/Cmd+Z undoes anywhere in the editor; Grasp undoes with Ctrl/Cmd+Z and a button but cannot redo.
  - Sources: `UndoRedo.tsx`, `ApolloLinkUndoRedoStack.tsx`, `2025.2.0.adoc`

#### In-memory change history (undo/redo)

**Grasp: partly** · parts: platform

SysON feature encompassed (1):

- **In-memory change history (undo/redo)** · platform / Versioning, migration & data management · Sirius Web · core · Grasp: partly
  - What it is: each editing context keeps, in memory, the EMF change recorded for each mutation input, keyed by the input id, plus representation changes (node, edge and label layout and appearance, hide, fade, collapse, view requests). Undo applies the reverse of one input's change and redo reapplies it. The web client keeps undo and redo stacks of mutation input ids in sessionStorage, reset when the page loads: every mutation except `undo`, `redo` and `layoutDiagram` pushes its id and clears the redo stack. Known read-only inputs (palettes, creation descriptions, searches, tooltips, selection dialogs...) and layout changes are not recorded, which also avoids the recording cost. The history is not persisted and is lost when the editing context is unloaded. _(Sirius Web)_
  - For Grasp: undo and redo of model and layout changes, one step per action; Grasp undoes up to a hundred changes but has no redo.
  - Sources: `UndoEventHandler.java`, `ApolloLinkUndoRedoStack.tsx`, `UndoRedoIgnoreInputPredicate.java`

#### Undo/redo of Explorer changes

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Undo/redo of Explorer changes** · views / Explorer view (model tree) · Sirius Web · core · Grasp: partly
  - What it is: Semantic changes made from the Explorer can be undone with Ctrl+Z and redone with Ctrl+Y, keyboard only, with no button (SysON 2025.2.0 release notes, which add that diagrams did not support undo yet). The project editor pushes every mutation's input id (except undo, redo and layout) onto a per-tab undo stack, and Ctrl/Cmd+Shift+Z also redoes. _(Sirius Web)_
  - For Grasp: Ctrl+Z undoes tree changes and Ctrl+Y redoes them; Grasp undoes with Ctrl/⌘+Z but has no redo.
  - Sources: `2025.2.0.adoc`, `CHANGELOG.adoc` v2025.2.0

#### Undo and redo of Details view edits

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Undo and redo of Details view edits** · views / Details view & property forms · Sirius Web · core · Grasp: partly
  - What it is: semantic changes made from the Details view (text, checkbox, radio, reference edits) can be undone with Ctrl+Z and redone with Ctrl+Y (or Ctrl+Shift+Z), like Explorer changes, since 2025.2.0; there is no undo button. The shortcut listener is window-wide and does not check focus, so pressing Ctrl+Z while typing in a Details text field triggers a server-side undo of the last recorded change rather than a local text undo. _(Sirius Web)_
  - For Grasp: Ctrl+Z and Ctrl+Y undo and redo property edits; Grasp undoes each field edit as one step but has no redo.
  - Sources: `2025.2.0.adoc`, `UndoRedo.tsx`

#### Undo of moves, resizes and label moves

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Undo of moves, resizes and label moves** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · core · Grasp: partly
  - What it is: node layout changes (moves, resizes), label layout and appearance, and edge layout and appearance are recorded as undoable steps, so Ctrl/Cmd+Z restores the previous position or size and redo re-applies it (added 2026.1.0); SysON fixed undoing the deletion of a graphical node so the node comes back correctly (2025.12.0). _(Sirius Web)_
  - For Grasp: layout moves are undoable and redoable; Grasp undoes moves but has no redo and no resizes or label moves.
  - Sources: `CHANGELOG.adoc` v2026.1.0, `CHANGELOG.adoc` v2025.12.0

## Text

### Textual SysML import (1)

Bringing SysML v2 text into the model: file upload, inserting text, name resolution and error reporting.

#### Import a .sysml/.kerml file as a new model

**Grasp: missing** · parts: model, views

SysON features encompassed (2):

- **SysON upload of textual SysML/KerML files** · views / Explorer view (model tree) · SysON · core · Grasp: missing
  - What it is: In SysON, the Upload model dialog accepts SysML v2 textual files and SysON's own JSON export. A file is parsed as textual SysML when its name ends in ".sysml" or ".kerml" (case-insensitive) and its first line does not start with "{". The text is parsed and transformed into a new model flagged as imported, and the parser and transformation messages become the import report shown in the dialog. Only JSON produced by SysON's Download can be re-uploaded. The SysON how-to says only ".sysml" files are processed as textual SysML, although the loader also accepts ".kerml". Requirement derivations, for example, can be created by uploading SysML text (2026.9.0).
  - For Grasp: reading .sysml text is how models arrive from other tools; Grasp exports textual SysML but cannot read it back in.
  - Sources: `SysMLExternalResourceLoaderService.java`, `model-management.adoc`, `CHANGELOG.adoc` v2025.4.0
- **Import a .sysml/.kerml file as a new model** · model / Textual SysML v2: import, export & insert · SysON, experimental · core · Grasp: missing
  - What it is: SysON's textual loader (since v2024.3.0, rewritten on an Ecore-based strategy in v2024.7.0) takes uploaded files whose name ends in .sysml or .kerml, case-insensitive (.SYSML, .SysML, .KERML, .KerML; since v2025.6.0) and whose first line does not start with '{'. Other extensions (e.g. .sysml2) and JSON content are not handled by it. The file is parsed (a .kerml file with its own extension) and converted into a new dedicated document holding the imported model; the document takes the uploaded file's name (e.g. 'Flashlight.sysml') and a fresh id, so downloading it later yields a file with the same name. Documented steps: click the upload model icon in the Explorer, select the '.sysml' file, click UPLOAD; a message reports success or failure; CLOSE returns to the workbench, where the model appears in its own document. The manual's sample file is a 'package PictureTaking' with part def Exposure, action defs Focus (out xrsl) and Shoot (in xsf), and an action takePicture with a flow from focus.xrsl to shoot.xsf. The user manual still says only '.sysml' files are processed; the code also accepts .kerml (since v2025.1.0). _(experimental)_
  - For Grasp: opening a textual SysML file is how existing models get in; Grasp exports text but can't read it.
  - Sources: `SysMLExternalResourceLoaderService.java`, `SysMLExternalResourceLoaderServiceTests.java`, `import-export-textual.adoc`

### Textual SysML export and interoperability (6)

Writing the model as SysML v2 text, its coverage and formatting, and exchanging models with other tools.

#### Download a model as a textual .sysml file

**Grasp: partly** · parts: model, platform, views · note: tagged core/useful

SysON features encompassed (4):

- **Download model** · views / Explorer view (model tree) · Sirius Web · core · Grasp: partly
  - What it is: "Download" on a model navigates to `GET /api/editingcontexts/{editingContextId}/documents/{documentId}`, which returns the model as an attachment named after it (or "resource"). The format is negotiated from the Accept header: application/json (native JSON) or application/xml (XMI with xmi:type). SysON adds a text/html exporter that, for models whose first root is a SysML Element, returns the model's textual SysML (tab-indented). SysON also adds a lookup that finds standard library documents by id. The endpoint returns 404 when no exporter matches. The entry (download icon, followed by a divider) is a plain link to that URL and closes the palette when clicked. The server walks the request's Accept values in their order and uses the first exporter that handles one. The SysON docs say the model downloads in SysON's JSON format unless its name ends with ".sysml", in which case it downloads as a textual SysML v2 file. _(Sirius Web)_
  - For Grasp: downloads a model as a .sysml text file or JSON; Grasp shows the text to copy and downloads only its JSON state.
  - Sources: `DownloadDocumentToolContribution.tsx`, `DocumentDownloadController.java`, `import-export-textual.adoc`
- **Download a SysML model as textual SysML v2** · model / Textual SysML v2: import, export & insert · SysON · core · Grasp: partly
  - What it is: since v2024.5.0, SysMLv2DocumentExporter plugs into the document download. The backend picks the first exporter matching the request's Accept media types: SysON's textual exporter for text/html when the document's first root object is a SysML Element, the JSON exporter for application/json and the XML exporter for application/xml. A browser click sends text/html, so it returns the first root (normally the root Namespace with all its content) as OMG-standard SysML v2 text; any further root objects of the same document are not written. The file is saved under the document's name. The model-management docs still describe the default as SysON's JSON format.
  - For Grasp: the model leaves SysON as standard SysML v2 text; Grasp exports the same text but only to copy, not as a .sysml file.
  - Sources: `SysMLv2DocumentExporter.java`, `DocumentDownloadController.java`, `model-management.adoc`
- **Download a model** · platform / Versioning, migration & data management · Sirius Web · core · Grasp: partly
  - What it is: the "Download" entry of a model's Explorer context menu downloads that model as a file named after it. Sirius Web's docs describe the tool's own JSON format, but the entry is a plain browser link whose Accept header starts with text/html, so in SysON a model whose first root is a SysML element downloads as SysML v2 text; a client asking for `application/json` or `application/xml` gets JSON or XMI. The textual-format page warns that the document must be named with a ".sysml" suffix to download as a textual SysML v2 file; the exporter itself checks only the first root, and the saved file simply takes the document's name, so a model named without the suffix downloads as a file without the extension. _(Sirius Web)_
  - For Grasp: save the model as a .sysml text file named after it; Grasp's Export SysML copies the text to the clipboard but downloads no file.
  - Sources: `model-management.adoc`, `DownloadDocumentTreeItemContextMenuContribution.tsx`, `DocumentDownloadController.java`
- **Download entry on documents** · model / Textual SysML v2: import, export & insert · Sirius Web, experimental · useful · Grasp: partly
  - What it is: on a model (document) item, the Explorer context menu's 'Download' entry (download icon, followed by a divider; entry id DOWNLOAD_DOCUMENT, offered only on models alongside New object and Expand all) is a link to /api/editingcontexts/<editingContextId>/documents/<documentId> with type application/octet-stream. SysON offers it on every document, read-only ones included, while 'New object' needs an editable document; standard libraries can be downloaded too (their download returned a 404 until v2025.2.0). Clicking closes the menu; the entry is also found by fuzzy search in the tree palette. Because the entry is a real link (an anchor with href and no download attribute, the file name coming from the server's attachment header), the browser's own link gestures work on it, such as middle-click, open in new tab or copy link address. SysON's manual flags the Download page experimental. _(Sirius Web; experimental)_
  - For Grasp: a menu entry saves a model as a file; Grasp shows the text to copy and downloads only its JSON state.
  - Sources: `DownloadDocumentTreeItemContextMenuContribution.tsx`, `DownloadDocumentToolContribution.tsx`, `SysONExplorerTests.java`

#### Definitions

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Definitions** · model / Textual SysML v2: import, export & insert · SysON · core · Grasp: partly
  - What it is: '[abstract] [variation] [individual] <keyword> def <short> name :> Super1, Super2', then '#Metadata' prefixes and the body; implied subclassifications omitted. Covers 'metadata def', 'state def ... parallel', 'use case def' and 'viewpoint def'.
  - For Grasp: every definition kind exports with abstract and specializations; Grasp writes its kinds with abstract, lacks variation, individual and metadata prefixes.
  - Sources: `SysMLElementSerializer.java`

#### Usage declarations

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Usage declarations** · model / Textual SysML v2: import, export & insert · SysON · core · Grasp: partly
  - What it is: '<short> name', then ':>> redefined', '::> referenced', ':> subsetted' and ': Type' (comma-separated when several), then '[l..u]' with 'ordered'/'nonunique', then the value. Implied relationships and proxies are skipped; proxies are reported as warnings.
  - For Grasp: usages export with typing, subsetting, redefinition, multiplicity and value; Grasp lacks references, ordered/nonunique and general values.
  - Sources: `SysMLElementSerializer.java`

#### Connections

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Connections** · model / Textual SysML v2: import, export & insert · SysON · core · Grasp: partly
  - What it is: a ConnectionUsage prints 'connection <decl>' only when it has a declaration, value or body, then 'connect a to b', or '(a, b, c)' for n-ary: binary `connect a to b`, ends with multiplicities `connect [1] p1 to [1] p2`, n-ary `connect (p1, p2, Parts::part3)`, chains `connect p1.po1 to p2.po2` and metadata-annotated `end #original ::> ...` (v2025.12.0). Connector ends keep '#metadata' prefixes and multiplicity.
  - For Grasp: connections export as connect a to b with chains; Grasp writes binary connections, lacks n-ary ends and end multiplicities.
  - Sources: `SysMLElementSerializer.java`, `2025.12.0.adoc`

#### Textual notation as exchange format with other SysML v2 tools

**Grasp: partly** · parts: model, platform · note: tagged core/useful

SysON features encompassed (3):

- **Textual notation as exchange format** · model / Textual SysML v2: import, export & insert · SysON · core · Grasp: partly
  - What it is: SysON supports the SysML v2 textual syntax for import and export; the most important concepts are translated, while some are still under development for complete round trips.
  - For Grasp: standard text is how models move in and out; Grasp exports it but can't import it.
  - Sources: `import-export-textual.adoc`
- **Sharing with other vendors' tools** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: partly
  - What it is: the FAQ states the intent to be fully compatible with the SysML v2 standard so models can be shared with other SysML v2 tools through the textual notation and the SysML v2 API.
  - For Grasp: standard text lets models move to other SysML v2 tools; Grasp's export passes the Pilot validator but nothing comes back in.
  - Sources: `faq.adoc`
- **Model sharing with other SysML v2 tools** · platform / APIs & integrations · SysON · useful · Grasp: partly
  - What it is: models are meant to be exchanged with other vendors' SysML v2 tools through the SysML v2 textual notation (download as `.sysml`) and the SysML v2 API.
  - For Grasp: the textual notation as the bridge to other vendors' tools; Grasp writes text that other tools accept but cannot read their text back.
  - Sources: `faq.adoc`

#### SysML v2 textual export format

**Grasp: partly** · parts: platform

SysON feature encompassed (1):

- **SysML v2 textual export format** · platform / APIs & integrations · SysON · core · Grasp: partly
  - What it is: the textual exporter serializes only the document's first root element (normally the root Namespace) with tab indentation, the server platform's line separator and escaping of special characters. Cross-references are written as the shortest name that resolves from the referencing element's context, computed with caches of visible memberships, deresolved names and qualified names. A name is written between single quotes when it contains characters outside the basic-name set, does not start with a letter or underscore, or is a SysML keyword. Comment bodies cannot contain `*/` in the grammar, so that sequence is written as `* /` and a warning is reported (since 2026.9.0); backslashes in LiteralString values are escaped. Serializer status messages are written to the server log, and a document that serializes to nothing gives an empty file. The text is encoded with the server JVM's default charset. A per-export membership cache speeds up large models.
  - For Grasp: export text that reads cleanly: quoted non-basic names and keywords, `*/` written `* /`; Grasp does both but gives no warning, and whether it writes shortest resolvable names was not checked.
  - Sources: `SysMLv2DocumentExporter.java`, `NameHelper.java`, `CHANGELOG.adoc` v2026.9.0

## Libraries (3)

Standard KerML and SysML libraries, published user libraries, importing them, and their read-only rules.

### KerML Standard Library (bundled)

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **KerML Standard Library (bundled)** · model / Libraries, standard library & publication · SysON · core · Grasp: missing
  - What it is: ships as 36 JSON resources (kerml.libraries): Base, BaseFunctions, BooleanFunctions, Clocks, CollectionFunctions, Collections, ComplexFunctions, ControlFunctions, ControlPerformances, DataFunctions, FeatureReferencingPerformances, IntegerFunctions, KerML, Links, Metaobjects, NaturalFunctions, NumericalFunctions, Objects, Observation, OccurrenceFunctions, Occurrences, Performances, RationalFunctions, RealFunctions, ScalarFunctions, ScalarValues, SequenceFunctions, SpatialFrames, StatePerformances, StringFunctions, Transfers, TransitionPerformances, TrigFunctions, Triggers, VectorFunctions, VectorValues; each loaded under the KerML library URI scheme and named after its file base name. First introduced in v2024.1.0 with a partial set (Base, BooleanFunctions, Clocks, CollectionFunctions, Collections, ComplexFunctions, ControlFunctions, DataFunctions, IntegerFunctions, KerML, Links, NaturalFunctions, NumericalFunctions, RationalFunctions, RealFunctions, ScalarFunctions, ScalarValues, SequenceFunctions, StringFunctions, TrigFunctions, VectorFunctions, VectorValues).
  - For Grasp: the base types (ScalarValues, Base, functions) every model can use; Grasp ships no library.
  - Sources: `SysONDefaultLibrariesConfiguration.java`, `kerml.libraries`, `2024.1.0.adoc`

### All standard libraries in every project

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **All standard libraries in every project** · model / Libraries, standard library & publication · SysON · core · Grasp: missing
  - What it is: since v2024.3.0 all KerML and SysML standard libraries are part of every project; their elements can be referenced from the Details view reference widgets or through diagram direct edit. They were initially hidden in the Explorer; visibility is now controlled by Explorer filters.
  - For Grasp: library elements are always there to reference from labels and Details; Grasp has none to reference.
  - Sources: `2024.3.0.adoc`, `CHANGELOG.adoc` v2024.3.0

### SysML Standard Library (bundled)

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **SysML Standard Library (bundled)** · model / Libraries, standard library & publication · SysON · core · Grasp: partly
  - What it is: ships as 58 JSON resources (sysml.libraries): Actions, Allocations, AnalysisCases, AnalysisTooling, Attributes, Calculations, Cases, CausationConnections, CauseAndEffect, Connections, Constraints, DerivationConnections, Flows, ISQ, ISQAcoustics, ISQAtomicNuclear, ISQBase, ISQCharacteristicNumbers, ISQChemistryMolecular, ISQCondensedMatter, ISQElectromagnetism, ISQInformation, ISQLight, ISQMechanics, ISQSpaceTime, ISQThermodynamics, ImageMetadata, Interfaces, Items, MeasurementRefCalculations, MeasurementReferences, Metadata, ModelingMetadata, ParametersOfInterestMetadata, Parts, Ports, Quantities, QuantityCalculations, RequirementDerivation, Requirements, RiskMetadata, SI, SIPrefixes, SampledFunctions, ShapeItems, SpatialItems, StandardViewDefinitions, StateSpaceRepresentation, States, SysML, TensorCalculations, Time, TradeStudies, USCustomaryUnits, UseCases, VectorCalculations, VerificationCases, Views.
  - For Grasp: units, quantities, parts, ports and views to type by; Grasp's export names a few of these packages but the page holds none.
  - Sources: `SysONDefaultLibrariesConfiguration.java`, `sysml.libraries`

## Projects, files, persistence and image export (2)

Project browser and templates, creating, uploading and downloading projects, layout persistence and diagram image export.

### Export the diagram as an image menu

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Export the diagram as an image menu** · diagrams / Diagram: export & image · Sirius Web · core · Grasp: missing
  - What it is: a diagram toolbar dropdown button (image icon + arrow, tooltip 'Export the diagram as an image') opens a menu with 'SVG', 'PNG' and 'SVG (Experimental)'; each entry shows a spinner and is disabled while the diagram metadata loads; choosing one downloads the file and closes the menu. The button (aria-label 'export to image', testid export-diagram-to-image) sits in the collapsible part of the top-left diagram toolbar, right after Share, so it is hidden while the toolbar is collapsed; it is never disabled in read-only mode. The diagram label used for the file name is fetched only when the menu opens. Replaced the former Explorer 'export as SVG' menu; PNG added in Sirius Web/SysON 2025.2.0. The Sirius Web manual calls the action 'Export SVG' ('downloads the current view of the diagram as an SVG, HTML SVG or PNG image'), SysON's toolbar page lists only 'Export diagram as SVG', and the FAQ recommends SVG for presentations, documents and reviews. _(Sirius Web)_
  - For Grasp: download a diagram as SVG or PNG for documents and reviews; Grasp exports only SysML text.
  - Sources: `ExportImageButton.tsx`, `diagram.adoc`, `faq.adoc`

### Upload a model (XMI / JSON)

**Grasp: partly** · parts: platform

SysON feature encompassed (1):

- **Upload a model (XMI / JSON)** · platform / Versioning, migration & data management · Sirius Web · core · Grasp: partly
  - What it is: in the project workbench, the "Upload model" button of the Explorer toolbar opens the "Upload new model" dialog, where the user clicks the dashed zone ("Click here to select a file", then the file name) to pick one file. XMI and JSON files are supported (SysON adds textual SysML/KerML), and the uploaded model is created and opened automatically. A split button submits either "Upload" or "Upload (read-only)"; after success the dialog reads "The document has been successfully uploaded", may offer "Download report" (saved as `upload-document-report.txt`), and "Close" dismisses it. A transport failure shows "An unexpected error has occurred, the file uploaded may be too large". _(Sirius Web)_
  - For Grasp: open a .sysml/.kerml text file, or XMI or the tool's JSON, as a new model, optionally read-only; Grasp's Import state reads only its own JSON.
  - Sources: `model-management.adoc`, `UploadDocumentModal.tsx`, `UploadDocumentReport.tsx`
