# SysON features Grasp lacks: useful

The 488 useful features from Eclipse SysON v2026.11.0 that Grasp lacks fully or partly, collated from 608 records in the per-part files in this folder (`application.md`, `views.md`, `diagrams.md`, `sysml-views.md`, `representations.md`, `model.md`, `platform.md`). Records describing the same feature in different parts are merged into one entry. Grasp status: missing 295, partly 181, unclear 12.

Each entry lists the SysON features it encompasses. For each one, **What it is** is the inventory's description from `docs/sysml/syson/features/`, **For Grasp** is the extraction's note on why it matters and what Grasp lacks, and **Sources** names the SysON or Sirius Web files it came from. Within each group, missing comes before partly before unclear.

The core list is in [`core.md`](core.md).

## Workbench

### Workbench layout, shell and panels (15)

The application frame: navigation bar, theme, notifications, side panels, view toggles and editor area.

#### Project name and project menu in the navigation bar

**Grasp: missing** · parts: application

SysON features encompassed (3):

- **Project title and project menu in the editor navigation bar** · application / App shell, navigation, theming & notifications · Sirius Web · useful · Grasp: missing
  - What it is: on the edit-project page, the center of the navigation bar shows the project name (navbar-title) as a one-line h6, truncated with an ellipsis after 100 characters. The title area is compact and the menu icon is aligned with it. A small white vertical-dots ('more') button next to the title opens the project menu (navbar-contextmenu) with, in this order: - Rename (rename; needs canRename) - Share (share-project; always shown) - Duplicate (duplicate; needs canDuplicate): while it runs a 15px spinner replaces the icon and the entry is disabled; on success the browser does a full page load of /projects/<newId>/edit - Download (download-link; needs canDownload): a plain link to /api/projects/<id> (plus ?name=<name> for a named editing context) - any entries contributed through the editProjectNavbarMenu#entry extension point - Settings (project-settings-link; needs settings.canView) - Delete (delete; needs canDelete): opens the delete-project dialog, and after a successful deletion the page redirects to /projects
  - For Grasp: shows which model is open and gathers rename, download, settings and delete; Grasp shows no model name or model menu.
  - Sources: `EditProjectNavbarContextMenu.tsx`, `ProjectTitle.tsx`, `DuplicateProjectMenuItem.tsx`
- **Editor project actions menu** · application / Homepage, project browser & project lifecycle · Sirius Web, experimental · useful · Grasp: missing
  - What it is: In the Project Editor, a menu (vertical-dots 'more' button) next to the project name in the navigation bar ('Project Options Menu' in the docs) lists, in order: Rename (if canRename; edit icon), Share (always; share icon), Duplicate (if canDuplicate; library-add icon), Download (if canDownload; download icon), menu entries contributed by extensions, Settings (if settings.canView; gear icon; goes to `/projects/{id}/settings`) and Delete (if canDelete; trash icon). Test ids: button `more`, menu `navbar-contextmenu`, entries `rename`, `share-project`, `duplicate`, `download-link`, `project-settings-link`, `delete`. Entries come from the `editProjectNavbarMenu#entry` extension point, and `editProjectNavbarMenu#container` can wrap the menu (since v2024.11.0). Download here exports the editing context named in the editor URL. _(Sirius Web; experimental)_
  - For Grasp: a menu beside the project name for rename, share, duplicate, download, settings and delete; Grasp has no model menu.
  - Sources: `EditProjectNavbarContextMenu.tsx`, `EditProjectNavbarMenuExtensionPoints.tsx`, `editor.adoc`
- **Project name in the editor navigation bar** · application / Homepage, project browser & project lifecycle · Sirius Web · useful · Grasp: missing
  - What it is: The editor's navigation bar shows the project name as an h6 title (test id `navbar-title`, one line, ellipsized beyond 100 characters' width) followed by the small white vertical-dots button of the project menu. The title updates live: the editor subscribes to `projectEvent(projectId)`, and when anyone renames the project the server pushes a `ProjectRenamedEventPayload` (projectId, newName) and every open editor shows the new name without reloading. Deleting a project ends its subscriptions. Subscription errors appear as toasts. The title area was made more compact and the menu icon aligned with the title in 2026.7.0; a rename made before 2023.8.0 needed a page refresh to show. The whole center of the navigation bar (normally this title and menu) can be replaced through `navigationBarCenterContributionExtensionPoint` (2025.2.0), which receives the page's own content as children. _(Sirius Web)_
  - For Grasp: the open project's name sits in the top bar; Grasp's header shows 'Grasp' and the active view, not the model's name.
  - Sources: `EditProjectNavbar.tsx`, `NavigationBar.tsx`, `CHANGELOG.adoc` v2026.7.0

#### Roboto font

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Roboto font** · application / App shell, navigation, theming & notifications · Sirius Web · useful · Grasp: missing
  - What it is: the app bundles and loads the Roboto font in weights 300, 400, 500 and 700, which the theme uses, so every machine renders the UI identically. _(Sirius Web)_
  - For Grasp: Roboto gives SysON its typographic feel on every machine; Grasp uses Inter and IBM Plex Mono.
  - Sources: `index.tsx`, `CHANGELOG.adoc`

#### Sidebar view selector icon strips

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Sidebar view selector icon strips** · application / Workbench layout & panels · Sirius Web · useful · Grasp: missing
  - What it is: a vertical strip of icon buttons sits on the far left and another on the far right of the workbench (sidebar-left/sidebar-right), with one button (viewselector-{title}) per available view. Each button has a tooltip with the view title (250ms delay, placed toward the center). Active views are drawn in the primary color with a 2px border on the outer edge; inactive ones are disabled gray. _(Sirius Web)_
  - For Grasp: icon strips on both edges switch views on and off; Grasp toggles its Validation view with a header button.
  - Sources: `Sidebar.tsx`, `user-interface-navigation.adoc`, `site.cy.ts`

#### Collapsible view header (view accordion) with merged toolbar

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Collapsible view header (view accordion) with merged toolbar** · application / Workbench layout & panels · Sirius Web · useful · Grasp: missing
  - What it is: each workbench view owns a 28px header bar that merges its title bar and toolbar, on a grayish background (theme palette view.background). The header holds a chevron (down when expanded, right when collapsed), a bold title, and an optional toolbar on the right that shows only while the view is expanded. Clicking the header collapses the view to its header and gives the freed space to the other expanded views. The header has a keyboard focus outline and aria-expanded/aria-controls. Views start expanded, and their content scrolls inside a definite-height area. _(Sirius Web)_
  - For Grasp: each view has a slim header that folds it, with its tools on the right; Grasp's panels have no folding headers.
  - Sources: `ViewAccordion.tsx`, `2026.11.0.adoc`, `CHANGELOG.adoc`

#### Onboard area

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Onboard area** · application / Workbench layout & panels · Sirius Web · useful · Grasp: missing
  - What it is: when no representation is open, the main area shows the replaceable default main-area component, OnboardArea (onboard-area). It is a padded, scrollable responsive grid of cards (auto-fit, minimum 400px wide) holding 'Create a new Model', 'Create a new Representation' and 'Open an existing Representation'. It reloads whenever the selection changes. _(Sirius Web)_
  - For Grasp: an empty editor offers to create a model, create a diagram or open one; Grasp starts on an empty plane with a hint.
  - Sources: `OnboardArea.tsx`, `DefaultExtensionRegistry.tsx`, `Workbench.tsx`

#### Editor toolbar groups

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Editor toolbar groups** · application / App shell, navigation, theming & notifications · Sirius Web · useful · Grasp: partly
  - What it is: the docs describe the project editor's top toolbar in groups. SysON's editor page lists three: Homepage, Project Actions (labeled with the project name) and an Actions menu. Sirius Web's workbench page lists four: Homepage (back to the home screen), Project Actions (shown with the project name), Omnibox (run commands and search elements) and Help (documentation, support and other resources). SysON's homepage page describes the project browser's toolbar in three groups: Homepage, Command Palette (project-level commands such as creating a blank project or searching elements across projects) and Links (Projects, Libraries, Help). _(Sirius Web)_
  - For Grasp: the editor's top bar grouped as home, project actions, command palette and help; Grasp's header has palette and actions but no omnibox or help.
  - Sources: `workbench.adoc`, `editor.adoc`, `homepage.adoc`

#### Toast notifications for action messages

**Grasp: partly** · parts: application

SysON features encompassed (2):

- **Toast notifications (snackbars)** · application / App shell, navigation, theming & notifications · Sirius Web · useful · Grasp: partly
  - What it is: notifications are notistack snackbars (#notistack-snackbar) stacked at the bottom right of every page. At most 5 show at once; each auto-hides after 10 seconds and has a small close (X) button. The variants default, success, error, warning and info are colored with the theme's primary, success, error, warning and info colors. The close button has aria-label 'close'. A message's level picks the variant (ERROR, INFO, WARNING, SUCCESS). Client-side errors raised through addErrorMessage (network/GraphQL failures, 'An unexpected error has occurred...', query errors) pass the lowercase level 'error'. That level matches none of these, so they fall back to the default variant and show in the primary color (#292253 in SysON), not in error red. Only server messages with level ERROR are red. _(Sirius Web)_
  - For Grasp: stacked, auto-hiding messages report what each action did; Grasp reports in a single status line instead of toasts.
  - Sources: `ToastProvider.tsx`, `MultiToast.ts`, `useReporting.ts`
- **Server feedback messages as multi-toasts** · application / App shell, navigation, theming & notifications · Sirius Web · useful · Grasp: partly
  - What it is: backend success and error payloads (ErrorPayload#messages) carry a list of messages, each with a body and a level (ERROR, INFO, WARNING or SUCCESS). Each message becomes its own snackbar with the matching variant; any other level uses the default variant. This is supported for tool actions, DropOnDiagram, DeleteFromDiagram, ReconnectEdge, EditLabel, form operations, insert text and other mutations. Examples: 'The element part1 is already visible in its parent ...', 'Cannot drop part1 on itself', or entering an invalid value such as '1r' in a number field of the Details view. Successful operations such as Arrange all show no snackbar. _(Sirius Web)_
  - For Grasp: each message from an action shows on its own with its severity; Grasp's status line shows one message without a level.
  - Sources: `useReporting.ts`, `CHANGELOG.adoc` v2026.9.0, `details.cy.ts`

#### SysON diagram tool feedback messages

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **SysON diagram tool feedback messages** · application / App shell, navigation, theming & notifications · SysON · useful · Grasp: partly
  - What it is: SysON diagram tools report outcomes as feedback messages at INFO, WARNING or ERROR level, shown as toasts. Examples include duplicate relationships, refused drops, owner changes and unresolved names. Some messages embed the element's SysML text, produced with simple names and no escaping.
  - For Grasp: tool refusals name the element and the reason, such as a refused drop; Grasp's palette refuses in words in its status line.
  - Sources: `DiagramQueryElementService.java`, `ViewLabelService.java`

#### Accessibility affordances in the shell

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Accessibility affordances in the shell** · application / App shell, navigation, theming & notifications · Sirius Web · useful · Grasp: partly
  - What it is: the shell's ARIA and keyboard support comes from individual components; there is no accessibility settings page. - Workbench: sidebar view-selector buttons carry aria-label = the view title. Each view header is a button with aria-expanded/aria-controls, a 1px primary-color focus-visible outline, and its content is a role="region" labelled by the header. Representation tabs carry a11y ids (simple-tab-<id>, aria-controls simple-tabpanel-<id>). - Dialogs and icons: dialogs (confirmation, share, rename, new model/object/representation, upload, delete) use aria-labelledby. Toast close buttons and the filter-bar clear button have aria-labels ('close', 'clear'). The SysON and Sirius logos are SVGs with role="img". - Keyboard: tree items are tabIndex 0 with arrow-key navigation, and the omnibox and palette search lists support arrow keys. - Gaps: the diagram canvas has tabIndex -1, so Tab does not reach it.
  - For Grasp: labelled view buttons, focusable headers and keyboard tree navigation; Grasp labels its canvas and buttons but has no keyboard tree.
  - Sources: `ViewAccordion.tsx`, `Sidebar.tsx`, `SysONIcon.tsx`

#### Three-zone resizable panel group

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Three-zone resizable panel group** · application / Workbench layout & panels · Sirius Web · useful · Grasp: partly
  - What it is: the workbench body is a horizontal resizable group: left side panel, main representation area, right side panel. 1px divider-colored separators ('left-resizer' and 'right-resizer') divide the zones. Each side panel starts at 25% width, has a 10% minimum and can collapse to 0%, while the main area keeps at least 30%. _(Sirius Web)_
  - For Grasp: side panels and the editor in one row the modeller can resize; Grasp's panel can be hidden but not resized.
  - Sources: `Panels.tsx`, `Workbench.tsx`, `SidePanel.tsx`

#### Resize and collapse side panels by dragging separators

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Resize and collapse side panels by dragging separators** · application / Workbench layout & panels · Sirius Web · useful · Grasp: partly
  - What it is: dragging a vertical separator resizes the adjacent side panel. The grab target is at least 5px wide for fine pointers and 15px for coarse (touch) pointers, and the resize cursor appears across the whole hit area. Dragging a panel below its minimum collapses it to zero width, and the panel's open/closed state follows the collapse. A panel configured as closed starts collapsed at the correct size, and collapsed views are not rendered. Panel sizes can be in px or rem, and resizing can be disabled. _(Sirius Web)_
  - For Grasp: drag a divider to widen or collapse a panel; Grasp hides and shows its panel with a button only.
  - Sources: `SidePanel.tsx`, `Panels.tsx`, `CHANGELOG.adoc`

#### Registered workbench views (ids, titles, icons)

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Registered workbench views (ids, titles, icons)** · application / Workbench layout & panels · Sirius Web · useful · Grasp: partly
  - What it is: the side panels can host these views, each with an id, a title and an icon in the icon strip: - explorer 'Explorer' (AccountTree icon) - views-explorer 'Views' (Filter icon) - validation 'Validation' (Warning icon) - search 'Search' (Search magnifier icon) - details 'Details' (Menu icon) - query 'Query' (PlayArrow icon) - related-views 'Related Views' (Filter icon) - related-elements 'Related Elements' (Link icon)
  - For Grasp: eight named views, each with its icon; Grasp has Details and Validation, and its Browser and Grid are view frames.
  - Sources: `DefaultExtensionRegistry.tsx`

#### Toggle views on and off; several views stacked in one panel

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Toggle views on and off; several views stacked in one panel** · application / Workbench layout & panels · Sirius Web · useful · Grasp: partly
  - What it is: clicking an inactive view's icon adds that view to its panel and highlights its icon, and several views can be shown at once, stacked vertically in configuration order. Clicking an active view's icon removes it from the panel. _(Sirius Web)_
  - For Grasp: several views shown at once, stacked in one panel; Grasp shows one view per side.
  - Sources: `SidePanel.tsx`, `site.cy.ts`, `CHANGELOG.adoc`

#### Collapse/expand a side panel from the active view's icon

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Collapse/expand a side panel from the active view's icon** · application / Workbench layout & panels · Sirius Web · useful · Grasp: partly
  - What it is: clicking the icon of the only active view collapses its panel to zero width, and clicking it again reopens the panel with that view. Activating a different view while the panel is collapsed expands it; activating one while it is expanded leaves it expanded. A panel also closes when all its views are deselected or it is resized to the minimum. This works for both the left and the right panel. _(Sirius Web)_
  - For Grasp: click a view's icon to fold its panel away; Grasp folds its panel with Hide panel and Panel buttons.
  - Sources: `SidePanel.tsx`, `user-interface-navigation.adoc`, `site.cy.ts`

#### Default panel layout

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Default panel layout** · application / Workbench layout & panels · Sirius Web · useful · Grasp: partly
  - What it is: by default (in projects and libraries alike): - Left panel: open, with Explorer active and Views, Validation and Search available. - Right panel: open, with Details active and Query, Related Views and Related Elements available. - Main panel: no representation editor open, so it shows the onboard area.
  - For Grasp: opens with Explorer on the left, Details on the right and no diagram; Grasp opens on the plane with the panel on the right.
  - Sources: `DefaultWorkbenchConfigurationProvider.java`, `workbench-configuration.cy.ts`, `site.cy.ts`

### Command palette, search and related elements (9)

The Ctrl/Cmd+K omnibox, element search and the views that trace references to and from the selection.

#### Ctrl+K / Cmd+K toggles the omnibox

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Ctrl+K / Cmd+K toggles the omnibox** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · useful · Grasp: missing
  - What it is: pressing Ctrl+K (Cmd/Meta+K on macOS) anywhere in the document opens the omnibox, a command palette for running commands and searching elements, or closes it if it is already open. The browser default for that key is suppressed. Only a lowercase 'k' key value matches, so with Shift or Caps Lock held (key 'K') the shortcut does nothing. The dialog component is unmounted while closed, so each opening starts fresh. The listener is on the document and does not check the focused element, so it also fires while typing in a text field. It exists only while the project editor or project browser is mounted; on other pages the key is not intercepted. Escape or a click outside the dialog also closes it. It is available in the project workbench and on the project browser (homepage). The command palette was introduced in 2024.11/2025.1.0; at that SysON release its only command was element search ('Click to select the element'), and SysON's library commands came later. _(Sirius Web)_
  - For Grasp: one shortcut opens a palette to run commands and find elements; Grasp has no command palette.
  - Sources: `OmniboxProvider.tsx`, `workbench.adoc`, `2025.1.0.adoc`

#### 'Run commands...' omnibox button in the navigation bar

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **'Run commands...' omnibox button in the navigation bar** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · useful · Grasp: missing
  - What it is: a navigation-bar button shows a '>' chevron, the text 'Run commands...' and a small bold key hint in a rounded outlined box at 70% opacity ('⌘ + K' on Apple platforms, detected from navigator.platform matching Mac, iPhone, iPod or iPad; 'Ctrl + K' elsewhere). The hint is only a label: both Ctrl+K and Cmd+K work on every platform. Clicking it opens the omnibox. It appears only on the project browser (/projects) and the project editor (/projects/:projectId/edit/...), not on settings, libraries or error pages. _(Sirius Web)_
  - For Grasp: a 'Run commands...' button with its key hint in the top bar; Grasp has no command palette.
  - Sources: `OmniboxButton.tsx`, `DefaultExtensionRegistry.tsx`, `sirius-components-core.json`

#### Omnibox command dialog

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Omnibox command dialog** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · useful · Grasp: missing
  - What it is: a full-width dialog (testid omnibox) positioned 10% from the top, with a large '>' icon, a borderless autofocused input (1.5rem font) and a submit button. The submit button shows a return-arrow icon, which a spinner replaces while loading. The placeholder is "Hit 'Enter' to search a command..." in Command mode and "Hit 'Enter' to search an element..." in Search mode. The result list scrolls, with a maximum height of 330px. _(Sirius Web)_
  - For Grasp: a large input with results below, near the top of the screen; Grasp has no command palette.
  - Sources: `Omnibox.tsx`, `sirius-components-core.json`

#### Context-aware command mode

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Context-aware command mode** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · useful · Grasp: missing
  - What it is: in Command mode, the typed query and the ids of the selected objects are sent to the backend (workbenchOmniboxCommands(editingContextId, selectedObjectIds, query)). The backend returns the commands available for the current project, configuration and selection, each with an icon, a label and a description. The command list is extensible, so studios and derived products such as SysON add their own commands. The Sirius Web docs say results narrow as you type part of a command name, representation type or element label and that the best candidates are highlighted; in the code the query is only sent on Enter and rows are not highlighted. _(Sirius Web)_
  - For Grasp: commands offered depend on the project and the selection; Grasp has no command palette.
  - Sources: `WorkbenchOmnibox.tsx`, `workbench-omnibox.graphqls`, `workbench.adoc`

#### Search view and query field

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Search view and query field** · views / Related elements, query & search views · Sirius Web · useful · Grasp: missing
  - What it is: a left-panel 'Search' view (added in Sirius Web 2025.12.0; side-panel entry 'Search' with a magnifier icon) with an autofocused, spell-check-free text field with a search icon and placeholder 'Hit Ctrl+Enter to launch search'; Ctrl+Enter (Cmd+Enter) runs the search. _(Sirius Web)_
  - For Grasp: a left-panel search for elements by name, run with Ctrl/Cmd+Enter; Grasp has no search.
  - Sources: `SearchQueryInput.tsx`, `sirius-web-application.json`

#### Search results list and navigation

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Search results list and navigation** · views / Related elements, query & search views · Sirius Web · useful · Grasp: missing
  - What it is: matches (resources/documents as well as elements) appear in a flat virtualized list (34px rows; virtualized for performance on large result sets; grouping of results was only proposed in ADR-212) with icon (alt 'Icon of the object') and label, truncated with an ellipsis and highlighted on hover; clicking a match makes it the global selection and pushes it to every view, so the explorer reveals it. The results area keeps a minimum height and the view scrolls when short. The Search view does not react to selections made elsewhere (it has no applySelection handler), and results are not refreshed when the model changes until the search is run again. _(Sirius Web)_
  - For Grasp: a results list where a click selects the element everywhere; Grasp has no search.
  - Sources: `SearchResults.tsx`, `SearchView.tsx`, `CHANGELOG.adoc` (Sirius Web) 2025.12.0

#### Related Elements view

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Related Elements view** · views / Related elements, query & search views · Sirius Web, experimental · useful · Grasp: missing
  - What it is: a right-panel view that follows the selection and shows contextual information about the selected element as three tree panels (the first group of the server form; subscription relatedElementsEvent, relatedElements://?objectIds=[...]), with icons. Shows 'No object selected' when empty, has a pin button (same 'Pinned. Click to follow the global selection.' / 'Unpinned. Click to pin the view to the current selection.' tooltips), and is read-only unless canEdit. Its side-panel entry is titled 'Related Elements' with a link icon; panel titles are 'Incoming', 'Current' and 'Outgoing'. Available and error-free in SysML projects. _(Sirius Web; experimental)_
  - For Grasp: a side view of what points to, contains and is referenced by the selection, for tracing; Grasp has none.
  - Sources: `RelatedElementsView.tsx`, `relatedelements-view.graphqls`, `RelatedElementsViewTests.java`

#### Incoming panel

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Incoming panel** · views / Related elements, query & search views · Sirius Web · useful · Grasp: missing
  - What it is: lists the elements that reference (point to) the selection. _(Sirius Web)_
  - For Grasp: lists the elements that reference the selection; Grasp has no incoming-references list.
  - Sources: `IncomingTreeDescriptionProvider.java`, `related-elements.adoc`

#### Outgoing panel

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Outgoing panel** · views / Related elements, query & search views · Sirius Web · useful · Grasp: missing
  - What it is: one category per non-containment reference that points to something, listing the targets the selection refers to. _(Sirius Web)_
  - For Grasp: lists what the selection refers to, grouped by reference; Grasp has no outgoing-references list.
  - Sources: `OutgoingTreeDescriptionProvider.java`, `related-elements.adoc`

### Explorer tree: rows, labels, filters and navigation (20)

How the model tree looks and is browsed: rows, labels, filters, multi-selection, keyboard and row menus.

#### Tree filters menu

**Grasp: missing** · parts: representations, views

SysON features encompassed (2):

- **Filters menu (tree filters)** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: A filter-list icon button titled "Filters" (`tree-filter-menu-icon`, with a tooltip, greyed while open) appears only when the active explorer description defines filters. It opens a menu with one checkbox per filter, each showing its label and starting from the description's defaultState. Toggling a checkbox changes the active filter ids, which are sent with the tree subscription, so the server changes what it puts in the tree. The menu stays open while you toggle, so several filters can be changed in a row, each change re-subscribing at once; it closes on Esc or a click outside, and focus then returns to the button. The current expansion is kept when filters change. The filter list is fetched again when another explorer is chosen, and user-set states are kept for filters with the same id. Filter states are saved in the workbench configuration and in share links. In SysON the menu lists seven filters, in this order: Hide Memberships (on), Hide KerML Standard Libraries (off), Hide SysML Standard Libraries (off), Hide User Libraries (off), Hide Root Namespaces (on), Hide Expose Elements (on), Hide Expression Internals (on). The plain Sirius Web explorer offers none of them. _(Sirius Web)_
  - For Grasp: toggles what the tree hides (memberships, libraries, expressions) to cut clutter; Grasp's Browser has no filter options.
  - Sources: `TreeFiltersMenu.tsx`, `useTreeFiltering.tsx`, `SysONTreeFilterProvider.java`
- **Tree filters** · representations / Tree representations · Sirius Web · useful · Grasp: missing
  - What it is: a tree description exposes filters (id, label, defaultState) that users toggle in the tree's filter menu to hide categories of items. - The SysON Explorer offers "Hide Memberships" (on by default), "Hide KerML Standard Libraries" (off), "Hide SysML Standard Libraries" (off), "Hide User Libraries" (off), "Hide Root Namespaces" (on), "Hide Expose Elements" (on) and "Hide Expression Internals" (on). - The studio explorer adds "Hide In-Memory Studio Color Palettes" (on by default). - In the tree view toolbar, the filters menu is a "Filters" button (filter-list icon, greyed while open) that drops down one checkbox per filter. It is shown only when the tree has filters. Since v2024.3.0, tree representations support filters (activeFilterIds).
  - For Grasp: Explorer switches such as Hide Memberships and Hide Standard Libraries keep the tree readable; Grasp's browser only picks its roots.
  - Sources: `tree.graphqls`, `TreeFiltersMenu.tsx`, `SysONTreeFilterProvider.java`

#### Representations listed under their element

**Grasp: missing** · parts: views

SysON features encompassed (2):

- **Element children: representations first** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: Expanding an element lists first the representations (diagrams, tables) whose target object is that element, sorted by label (plain, case-sensitive string order), and then its semantic contents. A resource node lists its root contents. _(Sirius Web)_
  - For Grasp: an element's diagrams are listed first among its children, so views are found from the model; Grasp's Browser lists no views.
  - Sources: `ExplorerServices.java`, `SysONDefaultExplorerServices.java`
- **Representations listed under their target element** · views / Representations: creation, management & views list · Sirius Web · useful · Grasp: missing
  - What it is: when an element is expanded in the Explorer, the representations that target it come first, sorted by label, before its semantic children; in SysON an element that has a representation is always expandable even with no other children, and representation items are always renamable (the read-only check applies only to elements and documents). _(Sirius Web)_
  - For Grasp: an element's diagrams are listed under it in the tree, sorted by name; Grasp's Browser lists no views.
  - Sources: `ExplorerServices.java`, `SysONDefaultExplorerServices.java`

#### Item icons with overlays

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Item icons with overlays** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: An item's icon is drawn from a list of icon URLs stacked as overlays (base icon plus decorators), with the item kind as alt text. An item without an icon gets a generic empty-square (CropDin) icon. _(Sirius Web)_
  - For Grasp: each row shows an icon with decorators for the element kind; Grasp's rows show a «keyword» instead of an icon.
  - Sources: `TreeItemIcon.tsx`

#### Label: short-name prefix

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Label: short-name prefix** · views / Explorer view (model tree) · SysON · useful · Grasp: missing
  - What it is: When an element has a non-blank short name, its label starts with the short name in angle brackets followed by a space (e.g. `<LA> Drone_LogicalArchitecture`), drawn in muted blue #64669b (since 2025.12.0).
  - For Grasp: a short name such as <LA> leads the row in muted blue; Grasp doesn't keep short names.
  - Sources: `SysONExplorerTreeDescriptionProvider.java`, `SysONDefaultExplorerServices.java`

#### Ctrl/Cmd+F tree filter bar

**Grasp: missing** · parts: application, views

SysON features encompassed (2):

- **Ctrl/Cmd+F opens the tree filter bar** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · useful · Grasp: missing
  - What it is: pressing Ctrl+F (Cmd+F on macOS; lowercase 'f' only) while focus is inside the Explorer tree container opens the filter bar ('Type to filter', filterbar-textfield) instead of the browser's find, and resets the filter text and the filter (tree filtering) mode. The handler is meant to toggle, but it reads the open state captured when it was installed, so in practice each press opens the bar again and clears its text rather than closing it. The bar's close (X) button closes it, and the docs only promise that the shortcut displays the filter bar. It applies only when the key event does not come from an INPUT element, so the browser shortcut still works while typing in a field, including the filter field itself. _(Sirius Web)_
  - For Grasp: Ctrl/Cmd+F opens a filter bar over the tree; Grasp's Browser has no filter.
  - Sources: `FilterBarContext.tsx`, `filter-bar.spec.ts`, `keyboard-shortcuts.adoc`
- **Open the filter bar (Ctrl/Cmd+F)** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: With a tree item focused (not in an input), Ctrl+F (Windows/Linux) or Cmd+F (macOS) toggles a filter bar above the tree, overriding the browser's find. The key listener sits on the Explorer's tree area (not the toolbar) and checks only a lowercase "f". While the focus is in the filter field itself the shortcut is not intercepted, so the browser's own find opens. The shortcut handler always sets the bar to open (it reads the state from when it was registered), so pressing Ctrl/Cmd+F again on a tree item does not close the bar: it keeps it open and resets the highlight text, while the uncontrolled field may still show the old text. Close the bar with its X button or the toolbar Filter button, which does toggle it. Opening or closing the bar always resets the text and the hide-non-matching mode. _(Sirius Web)_
  - For Grasp: Ctrl/Cmd+F in the tree opens a filter bar for finding rows fast; Grasp's Browser has no filter bar.
  - Sources: `FilterBarContext.tsx`, `ExplorerTreeRenderer.tsx`, `keyboard-shortcuts.adoc`

#### Filter bar field

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Filter bar field** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: The bar holds an autofocused small outlined text field (`filterbar-textfield`, placeholder "Type to filter", spellcheck off), an inline filter-toggle icon button and a close (X) button. Typed text is highlighted in every visible label that contains it, exact matches included, live on every keystroke (no debounce, no Enter needed). The field is 24px high and full width. Escape does not close the bar; only the X button or the toolbar Filter button does. Closing the bar clears the text and turns hiding off. _(Sirius Web)_
  - For Grasp: typing highlights matching labels live, with no Enter needed; Grasp's Browser has no type-to-filter.
  - Sources: `FilterBar.tsx`, `FilterBarContext.tsx`, `sirius-components-core.json`

#### Highlight vs. hide toggle

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Highlight vs. hide toggle** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: The filter-list icon inside the field switches between highlight-only mode (the default, icon in the secondary color) and filter mode (icon in the primary color), which hides every visible item whose label does not contain the text. The mode resets to highlight-only whenever the bar is opened, toggled or closed. _(Sirius Web)_
  - For Grasp: switches between highlighting matches and hiding the rest; Grasp has no tree filter.
  - Sources: `FilterBar.tsx`, `explorer-view.adoc`, `explorer.adoc`

#### Tree multi-selection with Ctrl/Shift+click

**Grasp: missing** · parts: application, representations, views

SysON features encompassed (4):

- **Explorer modifier clicks** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · useful · Grasp: missing
  - What it is: in the Explorer and other trees that allow multi-selection: - Ctrl/Cmd+click toggles one item and makes it the new range pivot. - Shift+click selects the range from the pivot (the last plainly clicked or Ctrl-clicked item, else the first root item) to the clicked item, replacing the selection. - Ctrl/Cmd+Shift+click merges that range into the current selection. - A plain click selects only the clicked item, including right after a range selection. Ranges cover the visible children of expanded items, and successive Shift+clicks keep the original pivot.
  - For Grasp: Ctrl, Shift and Ctrl+Shift clicks select several tree items, for example to drag them onto a diagram; Grasp selects one item.
  - Sources: `useTreeSelection.tsx`, `selection.spec.ts`, `flashlight.adoc`
- **Ctrl/Cmd+click toggle** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: Ctrl+click (Cmd+click on Mac) adds an unselected item to the selection or removes a selected one, down to an empty selection. This also works after a range selection. An item added this way becomes the new range pivot. The same gesture multi-selects in representation editors. _(Sirius Web)_
  - For Grasp: Ctrl/Cmd+click builds a multi-selection to act on together; Grasp selects one thing at a time.
  - Sources: `useTreeSelection.tsx`, `selection.spec.ts`, `keyboard-shortcuts.adoc`
- **Shift+click range selection** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: Shift+click selects every selectable item between the pivot (the last plainly clicked or Ctrl-clicked item, or the first root item when none is set) and the clicked item. It walks visible items in depth-first display order, including visible children of expanded items, and replaces the selection. Further Shift-clicks recompute the range from the original pivot, and a plain click afterwards resets to a single item. _(Sirius Web)_
  - For Grasp: Shift+click selects a range of rows; Grasp selects one thing at a time.
  - Sources: `useTreeSelection.tsx`, `selection.spec.ts`
- **Tree multi-selection (click, Ctrl+click, Shift+click)** · representations / Tree representations · Sirius Web · useful · Grasp: missing
  - What it is: a plain click selects one item and makes it the range pivot. Ctrl/Cmd+click toggles an item in the selection, and adding an item makes it the new pivot. Shift+click selects every selectable item between the pivot and the clicked item, walking through expanded items in display order, and replaces the selection; Shift+Ctrl/Cmd+click adds that range to it. If no pivot has been set, the first root item is used. Tree representations sync this selection with the workbench. _(Sirius Web)_
  - For Grasp: select ranges or sets of elements in the Explorer to act on together; Grasp selects one thing at a time.
  - Sources: `useTreeSelection.tsx`, `TreeRepresentation.tsx`

#### Arrow-key tree navigation

**Grasp: missing** · parts: application, representations, views

SysON features encompassed (3):

- **Arrow-key tree navigation** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · useful · Grasp: missing
  - What it is: with a tree item focused, ArrowUp and ArrowDown select the previous or next visible item. ArrowRight expands a collapsed item that has children, otherwise moves to the next item. ArrowLeft collapses an expanded item, otherwise jumps to its parent. Keys pressed inside input fields are ignored. Moving works by programmatically clicking the target item, so each step replaces the selection: the Details view follows, and arrowing onto a representation item opens it. The items come from a document-wide [data-treeitemid] query, so navigation can run past the end of one tree into another visible tree. _(Sirius Web)_
  - For Grasp: arrow keys move, expand and fold through the tree; Grasp's arrow keys pan the plane, not the Browser.
  - Sources: `Tree.tsx`
- **Arrow-key navigation** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: With a tree item focused and no input being typed in, Down/Up select the next/previous visible item. Right expands a collapsed item that has children, or else selects the next visible item (the first child when expanded). Left collapses an expanded item, or else selects its parent. Moving works by simulating a click on the target row, so it acts like a plain click: it leaves a single selection, and landing on a representation opens it. The Details view follows the selection (SysON tests use this to reach anonymous transitions). _(Sirius Web)_
  - For Grasp: arrow keys move through, unfold and fold the tree; Grasp's arrow keys pan the plane instead.
  - Sources: `Tree.tsx`, `details.cy.ts`, `CHANGELOG.adoc`
- **Tree keyboard navigation** · representations / Tree representations · Sirius Web · useful · Grasp: missing
  - What it is: with a tree item focused, the arrow keys move through the tree (ignored inside text inputs): - Up and Down select the previous or next visible item. - Right expands a collapsed item that has children, otherwise selects the next item, which for an expanded item is its first child (v2023.6.0). - Left collapses an expanded item, otherwise selects its parent.
  - For Grasp: arrow keys walk, open and close the model tree; Grasp's arrow keys pan the plane instead.
  - Sources: `Tree.tsx`

#### Tree item palette (diagram-style)

**Grasp: missing** · parts: representations, views

SysON features encompassed (2):

- **Tree item palette (diagram-style)** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: When the tree's `useTreePalette` capability is on (property `sirius.web.tree.new-palette.enabled`, default true; false brings back the classic menu), the ⋮ button opens the same Palette component used on diagrams (since 2026.7.0, with full diagram-palette parity in 2026.9.0). The palette opens in a popper to the right of the item for the current selection. It has a header with a drag indicator and Close, a quick-access bar, a "Search Tool" fuzzy search field (with a "Clear" button), palette entries and tool sections (each with icon, label and key bindings), the last-used tool (also remembered for overridden tools such as SysON's), and a "Show in" section. It stays inside the tree container (flip/prevent-overflow, 8px padding), is rendered within the workbench, and repositions when its size changes. The shared palette is 250px wide (up from 200px in 2026.7.0). Closing the menu or entering rename mode hides it. _(Sirius Web)_
  - For Grasp: the row menu is the diagram palette, with search and last-used tool, so both feel alike; Grasp has no row menu.
  - Sources: `TreeItemPalette.tsx`, `TreeItemContextMenu.tsx`, `TreeCapabilitiesUseTreePaletteDataFetcher.java`
- **Tree item palette** · representations / Tree representations · Sirius Web · useful · Grasp: missing
  - What it is: when a tree uses the palette (the explorer does; editor-area tree representations do not), the "⋮" button opens the same palette component as diagrams, in a popper to the right of the item and kept inside the tree. It holds quick-access tools and tool sections, and runs single-click or fetch tools. A "Show in" extension section lists the selection targets other than the explorer with a back button, or "No available targets" when there are none. The diagram palette has been reused for trees since v2026.7.0 (the server property `sirius.web.tree.new-palette.enabled=false` brings back the classic menu), and the palette has come from the TreeDescription palette query since v2026.9.0, when tool labels also became translated on the backend and the tree palette reached parity with the diagram palette (search, last used tool). Fixed in v2026.9.0: the impact-analysis dialog now opens after Update Library from the tree palette. _(Sirius Web)_
  - For Grasp: the Explorer's "⋮" opens the diagram palette with search and last used tool; Grasp's browser rows have no palette.
  - Sources: `TreeItemPalette.tsx`, `ShowInSection.tsx`, `CHANGELOG.adoc` v2026.7.0

#### Open or close the Explorer from the left sidebar

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Open or close the Explorer from the left sidebar** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: partly
  - What it is: The Explorer is one of the views in the left panel's vertical icon bar (with Validation and Views). With no saved workbench configuration, the left panel opens expanded with "Explorer" as the active, highlighted view. Clicking another view's icon switches to it, and clicking the icon of the active view collapses or expands the panel. A workbench configuration (e.g. from a share link) can open the panel collapsed. The left panel always shows project-level information, not the current selection. _(Sirius Web)_
  - For Grasp: an icon bar switches Explorer, Validation and Views and collapses the left panel; Grasp opens its Validation view from a button, with no icon bar.
  - Sources: `user-interface-navigation.adoc`, `workbench.adoc`, `workbench-configuration.cy.ts`

#### Tree toolbar layout

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Tree toolbar layout** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: partly
  - What it is: The Explorer header toolbar shows, from left to right: contributed toolbar components (New model, Upload model; disabled when read-only), the Filters menu (only when the tree description defines filters), view-specific extra buttons (such as the Explorers menu), the Filter (search) button and the Reveal selection button. It stays visible while the tree scrolls. The toolbar renders nothing until the list of explorer descriptions has loaded and an active one is known. _(Sirius Web)_
  - For Grasp: one header row for creating, filtering and revealing in the tree; Grasp's Browser has Unfold-all in its panel but no filter or reveal.
  - Sources: `TreeToolBar.tsx`, `ExplorerToolbarRenderer.tsx`, `CHANGELOG.adoc`

#### Hide Memberships

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Hide Memberships** · views / Explorer view (model tree) · SysON · useful · Grasp: partly
  - What it is: On by default (since 2024.3.0). Every Membership child is replaced by the elements it owns, so elements appear directly under their owner without an intermediate membership node. Turn it off to see memberships such as a FramedConcernMembership created from New object. Because each membership is replaced by its owned related elements, a membership that owns nothing (a non-owning Membership, e.g. an alias) disappears entirely while the filter is on.
  - For Grasp: elements sit straight under their owner with no membership rows; Grasp always shows them so, with no memberships to reveal.
  - Sources: `SysONExplorerFilterService.java`, `HideMembershipsTreeItemAlteredContentProvider.java`, `2026.7.0.adoc`

#### Reveal selected elements button

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Reveal selected elements button** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: partly
  - What it is: A crosshair (LocationSearching) button (`explorer-reveal-selection-button`) reveals the current workbench selection in the tree: elements selected or created in a diagram or table, or an omnibox result. The SysON docs call it "Select element in Explorer". It asks the server for the tree path of the selected elements, expands the missing ancestors, raises the max depth and selects the items. The tooltip defaults to "Reveal selected elements". When it opens it fetches the selected objects' labels, showing "Reveal selected elements (loading details...)" meanwhile, then "Select A, B", or "Select <first 5> (and N more)" when there are more than five. The same path computation runs automatically when another view pushes a selection to the explorer. Clicking it does nothing when the workbench selection is empty. The explorer keeps its own selected items: selecting something in a diagram or table does not change the explorer's highlighted items until this button is used or another view pushes the selection to the explorer ("Show in Explorer"). Picking an element in the omnibox pushes it to the explorer, which reveals and selects it, even on the first search right after the project opens (fix in 2026.1.0). _(Sirius Web)_
  - For Grasp: finds a diagram selection in the tree, unfolding its ancestors; Grasp's Browser marks the selected row but doesn't unfold to reveal it.
  - Sources: `RevealSelectionButton.tsx`, `ExplorerSelectionContext.tsx`, `explorer.adoc`

#### Root contents and order

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Root contents and order** · views / Explorer view (model tree) · SysON · useful · Grasp: partly
  - What it is: At the root the SysON Explorer lists every model resource (document) of the project that is not a KerML standard library, a SysML standard library or a user library, in resource-set order, followed by a single "Libraries" directory placed last. With the default filters, root namespaces and memberships are not shown.
  - For Grasp: documents at the root, then one Libraries folder; Grasp's Browser roots are the package or elements picked in its panel, with no libraries.
  - Sources: `SysONDefaultExplorerServices.java`, `SysONExplorerTests.java`

#### Label: main text

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Label: main text** · views / Explorer view (model tree) · SysON · useful · Grasp: partly
  - What it is: The main fragment is the fixed label for library directories, the textual SysML form for expression definitions, the name for Types (empty if unnamed), and otherwise the element's label from the label service.
  - For Grasp: the row reads as the element's name, or an expression's text; Grasp shows the name with keyword, type and multiplicity, and holds no expressions.
  - Sources: `SysONDefaultExplorerServices.java`

#### Label: ViewDefinition suffix on ViewUsages

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Label: ViewDefinition suffix on ViewUsages** · views / Explorer view (model tree) · SysON · useful · Grasp: partly
  - What it is: A ViewUsage whose view definition is set gets the suffix " [<ViewDefinition declared name>]" (e.g. " [GeneralView]") in gold #ab8b01, showing which standard view it uses. Default ViewUsage names therefore no longer include the ViewDefinition name (2025.10.0).
  - For Grasp: a view's kind follows its name, as view1 [GeneralView]; Grasp's frame tab reads «view» name : Kind, but views aren't in its tree.
  - Sources: `SysONDefaultExplorerServices.java`, `SysONExplorerTreeDescriptionProvider.java`, `CHANGELOG.adoc` v2025.10.0

#### Selected highlight and auto-scroll

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Selected highlight and auto-scroll** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: partly
  - What it is: Selected items get the theme's "selected" background, which stays on hover. An item that becomes selected, including through selections made in other views, is smoothly scrolled into view (block/inline "nearest"). _(Sirius Web)_
  - For Grasp: the selected row is highlighted and scrolled into view wherever it was selected; Grasp outlines the selected row, but nothing brings it into view.
  - Sources: `TreeItem.tsx`

#### 'Show in' section

**Grasp: partly** · parts: diagrams, views

SysON features encompassed (2):

- **Show in section** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: partly
  - What it is: The item menu has a "Show in" section with one "Show in <target>" entry (`push-selection-to-{target}`) per open view or representation, e.g. "Details" or a diagram such as "Topography", where it selects the matching node. Targets in a closed side panel are not offered; closing Details removes "Show in Details". The section opens as a sub-list headed by a "Show in" back entry (left-arrow icon) that returns to the main palette list. Each target row shows the target's icon and label with the tooltip "Show in <target>", pushes all selected tree items to that target and closes the palette. With no target, it reads "No available targets". _(Sirius Web)_
  - For Grasp: pushes a tree selection into the Details view or a chosen diagram; Grasp's single selection already shows in the panel and its views.
  - Sources: `ShowInSection.tsx`, `selection.spec.ts`, `sirius-web-application.json`
- **'Show in' section** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: partly
  - What it is: Diagram and Explorer palettes have a 'Show in' section listing targets as 'Show in {target}', or 'No available targets' when there are none. In the diagram it pushes the local selection (single or multiple, nodes and edges) to the Explorer (push-diagram-selection-to-explorer, which reveals and selects the items) or to the Details view (push-diagram-selection-to-details). The targets are every open workbench view that accepts a selection (listed by its view title and icon, a generic web-asset icon otherwise) plus the displayed representation if it is not this diagram; each row has the tooltip 'Show in <target>'. Clicking one sends the semantic elements (targetObjectIds) of the selected nodes and edges to that target and closes the palette; the sub-list's bold back entry reads 'Show in'. _(Sirius Web)_
  - For Grasp: Show in sends the selection to the Explorer or Details view; Grasp's panel follows selection, but nothing reveals it in the browser view.
  - Sources: `ShowInSection.tsx`, `useSelectionTargets.tsx`, `sirius-web-application.json`

#### Expand all entry

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Expand all entry** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: partly
  - What it is: "Expand all" (unfold icon, `expand-all`) recursively expands an item and all its descendants, down to representation leaves, including models with several root objects. The SysON palette appends it last on any item with children except the Libraries, KerML, SysML and User libraries directories (made consistent in 2025.8.0). It stays enabled in read-only workbenches. The docs warn it can take a long time on very large hierarchies. After a click the palette stays open, with no progress indicator, until the server returns the path, then it closes and the subtree unfolds. There is no "Collapse all" counterpart: items are collapsed one at a time (arrow, double-click or Left key). _(Sirius Web)_
  - For Grasp: unfolds one row and everything under it; Grasp's Browser panel unfolds the whole view, not one row's subtree.
  - Sources: `ExpandAllToolContribution.tsx`, `SysONDefaultExplorerServices.java`, `explorer.adoc`

### Explorer tree: creating, duplicating, moving and deleting elements (11)

Model editing from the tree: new-object dialogs and candidates, duplicate, drag to move, and delete.

#### Duplicate object (Ctrl/Cmd+D) with dialog

**Grasp: missing** · parts: application, model, views

SysON features encompassed (4):

- **Ctrl/Cmd+D duplicates the selected explorer element** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · useful · Grasp: missing
  - What it is: with exactly one semantic tree item selected (kind starting with siriusComponents://semantic) and the project editable, Ctrl+D (Cmd+D on macOS) in the Explorer opens the Duplicate object dialog, overriding the browser's bookmark shortcut. It is inactive in read-only projects. After duplication the new object is selected in the workbench and the Explorer. The listener sits on the Explorer tree element and matches only a lowercase 'd' with Ctrl or Meta. It cancels the browser default even when the selected item is a document or representation, in which case nothing opens. It does not skip text inputs, so Ctrl+D while renaming a tree item also triggers it. _(Sirius Web)_
  - For Grasp: Ctrl/Cmd+D duplicates the selected element from the Explorer; Grasp cannot duplicate elements.
  - Sources: `DuplicateObjectKeyboardShortcut.tsx`, `ExplorerTreeRenderer.tsx`
- **Duplicate object entry** · views / Explorer view (model tree) · SysON · useful · Grasp: missing
  - What it is: "Duplicate object" (`duplicate-object`) duplicates a semantic element. It was specified in 2025.8.0 and implemented in 2026.1.0. SysON adds it only on editable (not read-only) SysML Elements that are not Relationships, and the duplicate delegate refuses Memberships.
  - For Grasp: copies an element without redrawing it; Grasp has no duplicate.
  - Sources: `SysONExplorerTreeItemContextMenuEntryProvider.java`, `SysONDuplicateDelegate.java`, `explorer.adoc`
- **Duplicate object dialog** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: The entry, or Ctrl/Cmd+D on a selected element in the Explorer (disabled on read-only projects; runs only when invoked from the Explorer view), opens the modal "Duplicate object" (`duplicate-object-dialog`). Ctrl/Cmd+D (lowercase "d") is caught on the Explorer's tree area, and the browser's bookmark shortcut is always suppressed there. It acts only on an item selected by a plain click or arrow-key move, because Ctrl- or Shift-click selections leave no single item, and only on semantic elements: on a model or representation nothing happens. It contains a model-browser tree titled "Select the container", where only containers are selectable, and a "Select the containment type" drop-down (`containment-feature-name`) filled from the server for that container and object. The drop-down preselects the first option, is disabled when there is none, and resets when another container is clicked. Three checkboxes follow: "Duplicate the content" (on), "Copy outgoing references" (on) and "Update incoming references" (off). "Duplicate" is enabled once a containment type is chosen and no request is pending. It runs `duplicateObject`, selects the copy, expands the item and closes. Keystrokes stay inside the dialog so typing does not jump to menu items. _(Sirius Web)_
  - For Grasp: Ctrl/Cmd+D copies an element into a chosen container, with or without its content; Grasp has no duplicate.
  - Sources: `DuplicateObjectModal.tsx`, `DuplicateObjectKeyboardShortcut.tsx`, `useDuplicateObject.ts`
- **Duplicate object (Explorer) for SysML elements** · model / Model semantics & editing services · Sirius Web · useful · Grasp: missing
  - What it is: Explorer element context menu > Duplicate object (added in v2026.1.0) is offered only on editable (not read-only, not expression-definition) SysML Elements that are not Relationships; it opens Sirius Web's 'Duplicate object' dialog (target container, containment type, three options, 'Duplicate' button, disabled until a containment type is set and while the mutation runs; the copy is then selected in the Explorer). SysON creates the needed Membership so the copy is validly owned, and duplicating a ViewUsage also duplicates its representation. Keyboard: Ctrl+D (Cmd+D on macOS) in the Explorer opens the same dialog for the selected tree item, except in read-only projects; the shortcut only checks that the item is a semantic object (not SysON's context-menu restrictions), and on success the copy is selected in the tree. _(Sirius Web)_
  - For Grasp: copy an element, optionally with its content, into a chosen owner; Grasp has no duplicate.
  - Sources: `SysONExplorerTreeItemContextMenuEntryProvider.java`, `DuplicateObjectKeyboardShortcut.tsx`, `add_duplicate_object_action_for_sysml.adoc`, `explorer.adoc`

#### Drag tree items (single or multi-selection)

**Grasp: missing** · parts: representations, views

SysON features encompassed (2):

- **Drag tree items (single or multi-selection)** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: missing
  - What it is: Any row can be dragged. An unselected item is dragged alone, without changing the current selection, and an item that is part of the selection drags the whole selection, e.g. several Ctrl+clicked elements dragged onto a diagram together. The payload is a JSON list of item ids under the shared `sirius-component/drag/sources` type, and the drag image is the item's icon and label. Tree rows and drop zones, diagrams, portals and the reference widget (property section and transfer dialog) accept it, and drop targets ignore unsupported elements. _(Sirius Web)_
  - For Grasp: drag rows, alone or as a selection, onto diagrams or other rows; Grasp's Browser rows can't be dragged.
  - Sources: `TreeItem.tsx`, `dataTransferTypes.ts`, `flashlight.adoc`
- **Tree drag and drop** · representations / Tree representations · Sirius Web · useful · Grasp: missing
  - What it is: any tree item can be dragged. If it is part of the selection, the whole selection is dragged; otherwise it is dragged alone, with its icon and label as the drag image. - Dropping onto an item sends dropTreeItem with index -1. - Dropping onto the thin 2px zone just above an item sends that item's index, to insert before it. - The hovered drop zone is highlighted. - The tree description must provide a drop handler; otherwise the server answers "No drop handler provided". - Since v2025.4.0 the drag data only carries the dragged tree item ids (no kind). A Chrome glitch where item backgrounds stayed highlighted after a drag was fixed in v2025.10.0. - Explorer drag and drop came in v2024.11.0. Since v2024.1.0 any kind of element can be dragged, not just semantic ones.
  - For Grasp: drag Explorer items to move them in the model or onto diagrams; Grasp's browser rows can't be dragged.
  - Sources: `TreeItem.tsx`, `tree.graphqls`, `CHANGELOG.adoc` v2024.11.0

#### Move an element by dropping it on another in the tree

**Grasp: missing** · parts: model, views

SysON features encompassed (2):

- **SysON move on drop** · views / Explorer view (model tree) · SysON · useful · Grasp: missing
  - What it is: In the SysON Explorer, dropping one or more items onto a SysML element moves each one, with its owning membership, under the target through SysON's move-element service (since 2025.2.0), e.g. a PartDefinition onto a Package. Each element moves independently. Refusals are warnings of the form "Unable to move {element} in {target}: {reason}", with the reasons "Unable to move an Element to one of its descendant", "Unable to move a read only Element", "Unable to move a Element to a read only Element" (dragging to or from a read-only library is forbidden) and "Membership can't be used as a target of a move". A dropped non-SysML item gives "The dropped element is not a SysML Element", and a non-element target gives "Unable to move the element in selected target". So models and representations cannot be moved by drag and drop, and nothing can be dropped onto a model item: to move an element to a model's top level, drop it onto the model's top Package (or its root Namespace, shown once Hide Root Namespaces is off). Dropped ids that resolve to nothing are skipped silently, and unnamed elements are named by their metaclass in the messages. The move adapts the owning membership: an element moved into a Package gets an OwningMembership and one moved anywhere else a FeatureMembership, with MembershipExposes redirected to the new membership. A moved Import becomes the target's first owned relationship, and other elements are appended last.
  - For Grasp: drag an element onto another to move it there, with clear refusals; Grasp's Browser can't reparent by drag.
  - Sources: `DropTreeItemHandler.java`, `SysMLMoveElementCheckerService.java`, `explorer.adoc`
- **Explorer drag and drop moves SysML elements** · model / Model semantics & editing services · SysON · useful · Grasp: missing
  - What it is: dropping one or more Explorer items on a SysML element moves each through the SysON move service; each failure adds a warning toast 'Unable to move <element> in <target>: <reason>' ('The dropped element is not a SysML Element' for non-SysML items, 'Unable to move the element in selected target' when the target is not a SysML element). If at least one item moved the change is saved; otherwise nothing is persisted.
  - For Grasp: drag tree items onto another element to re-parent them; Grasp's browser view doesn't take drops.
  - Sources: `DropTreeItemHandler.java`

#### Candidates on a Package or root Namespace

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Candidates on a Package or root Namespace** · views / Explorer view (model tree) · SysON · useful · Grasp: partly
  - What it is: Every concrete Definition, Usage, Import and Package subclass (so sub-Packages, since 2024.7.0), plus OwningMembership, Documentation, Comment (2024.11.0), TextualRepresentation and Dependency (2024.11.0).
  - For Grasp: top level can hold every definition, usage, package, import, comment and dependency; Grasp's palettes offer fewer kinds, without packages, imports or comments.
  - Sources: `GetChildCreationSwitch.java`, `CHANGELOG.adoc` v2024.11.0

#### Candidates on Definitions

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Candidates on Definitions** · views / Explorer view (model tree) · SysON · useful · Grasp: partly
  - What it is: A Definition without a specific rule (e.g. Part, Action, Item, Interface and State definitions) offers every concrete Usage and Import subclass, plus Subclassification, Documentation, Comment and TextualRepresentation.
  - For Grasp: a definition can hold any usage kind; Grasp nests only the kinds its views draw, such as parts and ports.
  - Sources: `GetChildCreationSwitch.java`

#### Candidates on Attribute, Enumeration, Port and Requirement Definitions

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Candidates on Attribute, Enumeration, Port and Requirement Definitions** · views / Explorer view (model tree) · SysON · useful · Grasp: partly
  - What it is: AttributeDefinition: AttributeUsage, ReferenceUsage, Subclassification, FeatureMembership, Documentation, Comment, TextualRepresentation. EnumerationDefinition: only EnumerationUsage and Subclassification. PortDefinition: AttributeUsage, ItemUsage, PortUsage, ReferenceUsage, Subclassification, FeatureMembership, Documentation, Comment, TextualRepresentation. RequirementDefinition: the generic Definition list plus SubjectMembership, FramedConcernMembership and ConcernUsage.
  - For Grasp: attribute, enumeration, port and requirement definitions each get fitting children; Grasp has port defs with items and ports, but no attribute, enum or requirement defs.
  - Sources: `GetChildCreationSwitch.java`

#### Candidates on Usages

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Candidates on Usages** · views / Explorer view (model tree) · SysON · useful · Grasp: partly
  - What it is: Every Usage offers AttributeUsage, FeatureTyping, Subsetting, Redefinition, ReferenceSubsetting, LiteralBoolean, LiteralInfinity, LiteralInteger, LiteralRational, LiteralString, FeatureMembership, Documentation, Comment and TextualRepresentation. Specific additions: ActionUsage +ActionUsage, ItemUsage; AttributeUsage +ReferenceUsage; ConstraintUsage +ConcernUsage; InterfaceUsage +PortUsage; ItemUsage +ReferenceUsage; PartUsage +PartUsage, PortUsage; PortUsage +PortUsage, ReferenceUsage; ReferenceUsage +ReferenceUsage; RequirementUsage +SubjectMembership, FramedConcernMembership, ConcernUsage.
  - For Grasp: usages can hold attributes, typings, subsettings, redefinitions and literals; Grasp's usages hold parts and ports, with no attributes or literals.
  - Sources: `GetChildCreationSwitch.java`

#### Child creation candidates per container

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Child creation candidates per container** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: the Explorer New object type list depends on the container: Package and Namespace propose Dependency, Documentation, Comment, TextualRepresentation, OwningMembership, Package plus any Definition, Usage or Import; ViewUsage proposes MembershipExpose, NamespaceExpose, Documentation, Comment, TextualRepresentation, ViewUsage; RequirementDefinition/RequirementUsage propose Subclassification, Documentation, Comment, TextualRepresentation, SubjectMembership, FramedConcernMembership, ConcernUsage among others; FramedConcernMembership proposes only ConcernUsage. Shown in the 'Create a new object' dialog (Explorer element context menu > 'New object', offered only on editable elements: not read-only and not an expression definition): an 'Object type' select whose entries carry the metaclass icon and EMF label, sorted case-insensitively by label, first entry preselected, then 'Create' (disabled with no type); a failed query or creation shows the toast 'An unexpected error has occurred, please refresh the page', messages of a server error payload appear as toasts, and on success the dialog closes and the new object becomes the selection (selected in the tree, its parent expanded). Containers outside the SysML metamodel get Sirius Web's default candidates.
  - For Grasp: New object offers only kinds valid in the chosen container; Grasp's palette follows the view kind, with no New object menu in its browser.
  - Sources: `GetChildCreationSwitchTest.java`, `SysMLv2EditService.java`, `NewObjectModal.tsx`

#### Child creation candidates for definitions, usages and memberships

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Child creation candidates for definitions, usages and memberships** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: the rest of the per-metaclass candidate table behind Explorer > New object. Any Definition: every concrete Usage and Import metaclass plus Subclassification, Documentation, Comment, TextualRepresentation. Any Usage: AttributeUsage, FeatureTyping, Subsetting, Redefinition, ReferenceSubsetting, the five literals (LiteralBoolean, LiteralInfinity, LiteralInteger, LiteralRational, LiteralString), FeatureMembership, Documentation, Comment, TextualRepresentation. On top of the Usage list: ActionUsage adds ActionUsage and ItemUsage; PartUsage adds PartUsage and PortUsage; PortUsage adds PortUsage and ReferenceUsage; ItemUsage, AttributeUsage and ReferenceUsage add ReferenceUsage; InterfaceUsage adds PortUsage; ConstraintUsage adds ConcernUsage. AttributeDefinition offers only AttributeUsage, ReferenceUsage, Subclassification, FeatureMembership, Documentation, Comment, TextualRepresentation; PortDefinition the same plus ItemUsage and PortUsage; EnumerationDefinition only EnumerationUsage and Subclassification. A FeatureMembership offers every concrete Feature metaclass, an OwningMembership every concrete non-Membership metaclass. The Package list (also used for root Namespaces and LibraryPackages) is every concrete Definition, Usage, Import and Package metaclass plus OwningMembership, Documentation, Comment, TextualRepresentation, Dependency; other metaclasses offer nothing.
  - For Grasp: the full per-metaclass list of what may be created inside what; Grasp allows far fewer kinds, chosen by view.
  - Sources: `GetChildCreationSwitch.java`, `GetChildCreationSwitchTest.java`

#### Explorer Delete uses SysON delete semantics

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Explorer Delete uses SysON delete semantics** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: deleting a SysML element through the edit service (Explorer context menu > Delete) calls SysON's delete-from-model service rather than the plain EMF delete, so SysON's cascade rules apply. The 'Delete' entry sends `deleteTreeItem` only for deletable items, after the confirmation dialog 'Are you sure?' ('This action will delete the selected element(s).' / 'You won't be able to revert this.', button 'Delete') when the project setting 'Enable confirmation dialogs' is on; returned messages appear as toasts.
  - For Grasp: tree delete cascades like diagram delete, after an optional confirmation; Grasp's Delete cascades and can be undone, with no confirmation dialog.
  - Sources: `SysMLv2EditService.java`, `useDelete.tsx`, `sirius-components-core.json`

#### Move converts membership kind and keeps exposes

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Move converts membership kind and keeps exposes** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: on Explorer drag and drop, diagram re-parenting and other moves, an element ending up in a Package gets an OwningMembership, anywhere else a FeatureMembership; when the kind must change, the new membership is created first, MembershipExposes pointing at the old one are redirected, then the old one is deleted. A moved Import is inserted first among the new parent's owned relationships. A membership whose kind already fits is moved as is; the new membership is added to the new parent before the element is moved into it so cross-references survive. 'Fits' is tested only as 'is a FeatureMembership or not': outside Packages any FeatureMembership subtype (ActorMembership, ParameterMembership, EndFeatureMembership, ObjectiveMembership...) is kept unchanged, and inside a Package any non-FeatureMembership owning membership (e.g. a VariantMembership) is kept; a non-Feature element (e.g. a PartDefinition) moved into a Usage is wrapped in a FeatureMembership. The replaced membership is removed with the SysON delete-from-model service.
  - For Grasp: moving an element fixes its membership and keeps it shown in views; Grasp's drop changes the owner, but it has no explicit memberships.
  - Sources: `DefaultSysMLMoveElementService.java`, `SysMLMoveElementCheckerService.java`, `CHANGELOG.adoc`

### Details view and property forms (19)

The selection-dependent property form: pages, widgets, reference pickers and browse dialogs.

#### Multi-selection in the Details view

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Multi-selection in the Details view** · views / Details view & property forms · Sirius Web · useful · Grasp: missing
  - What it is: the view accepts several selected objects (passed as `objectIds`) and can show details of any element kind, graphical elements included. Page descriptions are tested against the first selected object and the whole selection, widgets receive both, and if no page applies a default properties form is used. The form is titled with the first selected object's label ("Properties" as fallback). _(Sirius Web)_
  - For Grasp: several selected elements share one details form; Grasp selects one thing at a time.
  - Sources: `PropertiesEventProcessorFactory.java`, `DetailsViewFormDescriptionAggregator.java`, `CHANGELOG.adoc` v2022.3.0

#### Pin the Details view (synchronization button)

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Pin the Details view (synchronization button)** · views / Details view & property forms · Sirius Web · useful · Grasp: missing
  - What it is: the Details view header (a collapsible "Details" panel in the right side panel) has a sync icon button (`details-toggle-pin`). Unpinned it shows a sync icon with the tooltip "Unpinned. Click to pin the view to the current selection."; clicking pins the view, which then keeps showing the same element whatever is selected elsewhere, with a sync-lock icon and the tooltip "Pinned. Click to follow the global selection.". Clicking again follows the global selection again. While pinned, other views can push their selection into it with "Show in" > Details (diagram palette or Explorer item palette, "Show in {target}"; available from a diagram multi-selection since 2026.3.0). With nothing shown the button shows as unpinned. Since 2026.11.0 view headers and toolbars are hidden outside workbench side panels, so the Details header no longer overlaps the form when embedded (e.g. VS Code extension). _(Sirius Web)_
  - For Grasp: pins the details to one element while selecting elsewhere, for comparing; Grasp's panel always follows the selection.
  - Sources: `SynchronizationButton.tsx`, `DetailsView.tsx`, `CHANGELOG.adoc` v2025.10.0 / v2026.11.0

#### Generic reference widget

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Generic reference widget** · views / Details view & property forms · SysON · useful · Grasp: missing
  - What it is: every other changeable non-containment reference feature gets a reference widget with label, help text, a create button and a clear button; setting a value writes the reference (`handleReferenceWidgetNewValue` with the reference name); disabled when read-only.
  - For Grasp: any other changeable reference can be set from the form; Grasp edits references only as lines and Typed by, Specializes and Subsets.
  - Sources: `SysONDetailsViewDescriptionProvider.java`

#### Comment text area

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Comment text area** · views / Details view & property forms · SysON · useful · Grasp: missing
  - What it is: "Comment" text area in the Core group, before Documentation; shows the body of the element's first non-Documentation Comment, looked up among owned annotations, else among owned elements. Typing when none exists creates a Comment in a new OwningMembership (since 2024.11.0). Help text "Use 'shift + enter' to add new lines"; hidden on annotating elements; disabled for read-only elements. Clearing the text sets the existing Comment's body to empty but keeps the Comment element (it is never deleted from here); with no Comment yet, leaving the field empty sends nothing, so no empty Comment is created.
  - For Grasp: a Comment field writes the element's comment, creating it if needed; Grasp keeps documentation but no comments.
  - Sources: `SysONDetailsViewDescriptionProvider.java`, `MetamodelQueryElementService.java`, `CHANGELOG.adoc` v2024.11.0

#### Visibility radio

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Visibility radio** · views / Details view & property forms · SysON · useful · Grasp: missing
  - What it is: untitled group "Membership Properties" with a "Visibility" radio (private, protected, public) that edits the visibility of the element's owning membership directly from the element (shown only when the element's container is a Membership, never for Imports); disabled when read-only (since 2024.5.0).
  - For Grasp: a Visibility radio sets public, protected or private; Grasp doesn't hold visibility.
  - Sources: `SysONDetailsViewDescriptionProvider.java`, `FormQueryElementService.java`, `CHANGELOG.adoc` v2024.5.0

#### Redefines widget

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Redefines widget** · views / Details view & property forms · SysON · useful · Grasp: missing
  - What it is: untitled group "Redefinition Properties" repeated for each owned Redefinition; each copy has a "Redefines" reference widget editing redefinedFeature, with create and clear buttons, disabled when read-only.
  - For Grasp: a Redefines field per redefinition; Grasp doesn't keep redefinitions.
  - Sources: `SysONDetailsViewDescriptionProvider.java`

#### Transition Source and Target widgets

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Transition Source and Target widgets** · views / Details view & property forms · SysON · useful · Grasp: missing
  - What it is: untitled group "Transition Source and Target Properties" for a TransitionUsage (since 2024.7.0) with "Source" and "Target" reference widgets accepting only ActionUsages (states); each has a create button and no clear button (since 2026.11.0, so source/target cannot be cleared from the Details view), disabled when read-only. Setting the source (`setTransitionSourceParameter`) updates the source membership and the succession's source end; setting the target (`setTransitionTargetParameter`) updates the succession's second end. A chosen value that is not an ActionUsage is ignored without any message, and if the succession has fewer than two end features the target change silently does nothing.
  - For Grasp: Source and Target fields retarget a transition; Grasp changes a transition's ends only by drawing.
  - Sources: `SysONDetailsViewDescriptionProvider.java`, `FormMutationElementService.java`, `CHANGELOG.adoc` v2026.11.0

#### Edit ("...") button

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Edit ("...") button** · views / Details view & property forms · Sirius Web · useful · Grasp: missing
  - What it is: icon button titled "Edit" at the end of the field (`<label>-more`) that opens the browse dialog for single-valued or the transfer dialog for many-valued references; shown when selectable or many-valued; disabled when read-only. _(Sirius Web)_
  - For Grasp: a ... button opens a dialog to browse the whole model for a value; Grasp has only the select's list.
  - Sources: `ValuedReferenceAutocomplete.tsx`, `widget-reference.spec.ts`

#### Click a reference value to select the referenced element

**Grasp: missing** · parts: application, views · note: Grasp no/unclear

SysON features encompassed (2):

- **Click a value to select the referenced element** · views / Details view & property forms · Sirius Web · useful · Grasp: missing
  - What it is: clicking a chip or list value sets the workbench selection to the referenced element, revealing it in the Explorer and other views, even when hidden by Explorer filters. _(Sirius Web)_
  - For Grasp: clicking a value selects that element everywhere, to follow references; Grasp's selects don't navigate.
  - Sources: `ReferencePropertySection.tsx`, `CHANGELOG.adoc` v2023.12.0
- **Reference widget chip click selects the referenced element** · application / Workbench layout & panels · Sirius Web · useful · Grasp: unclear
  - What it is: clicking or double-clicking a reference widget's value chip makes the referenced element the workbench selection, so the explorer, diagrams and Details view move to it. Chips stay clickable even when the widget is read-only. _(Sirius Web)_
  - For Grasp: clicking a reference in Details jumps to the referenced element; whether Grasp's typed-by field selects its definition is not stated.
  - Sources: `ReferencePropertySection.tsx`, `ValuedReferenceAutocomplete.tsx`

#### Browse dialog "Select an object"

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Browse dialog "Select an object"** · views / Details view & property forms · Sirius Web · useful · Grasp: missing
  - What it is: from Edit on a single-valued reference (`browse-modal`): full-width, 400px-tall dialog with a model browser tree titled "Choices" (`tree-root-elements`), current value preselected; clicking an item selects it and "Select" (`select-value`) sets the first selected element; backdrop or Escape closes without change; Select disabled when not selectable. _(Sirius Web)_
  - For Grasp: a Select an object dialog browses the model tree for one value; Grasp has no browse dialog.
  - Sources: `BrowseModal.tsx`, `sirius-components-widget-reference.json`, `widget-reference.spec.ts`

#### Model browser tree

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Model browser tree** · views / Details view & property forms · Sirius Web · useful · Grasp: missing
  - What it is: tree used by the Browse, Create and Transfer dialogs (and the Explorer's Duplicate object dialog) with a "Type to filter" bar that filters and highlights, a title, a bordered 500px scrolling area, bold marked items, automatic expansion down to selected items/current values, an "expand all" hover button on items with children; read-only with no context palette; subtrees without compatible values are removed and ancestors can be selected. Candidates are scoped by owner kind, target type, owner, description and containment. _(Sirius Web)_
  - For Grasp: the pick dialogs' filterable tree, unfolded to current values, with only compatible items selectable; Grasp has no pick tree.
  - Sources: `ModelBrowserTreeView.tsx`, `useModelBrowserSubscription.tsx`, `CHANGELOG.adoc` v2024.9.0 / v2023.8.0

#### Core page group order

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Core page group order** · views / Details view & property forms · SysON · useful · Grasp: partly
  - What it is: the titled main group "<Metaclass> Properties", then untitled groups (empty label), each shown only when its semantic candidate exists: Membership Properties (Visibility), Reference Subsetting Properties, Redefinition Properties, Statesubaction Properties, Subclassification Properties, Subsetting Properties, Typing Properties, Kind Properties (requirement constraint), Accept Action Usage Properties, Transition Source and Target Properties, then the Expression Value groups for feature value, expression, result expression and guard expression, and finally the missing-expression group.
  - For Grasp: Core groups follow in a set order: properties, visibility, redefinition, typing, kind, expressions; Grasp has the main, typing and specializes groups only.
  - Sources: `SysONDetailsViewDescriptionProvider.java`

#### Advanced page

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Advanced page** · views / Details view & property forms · SysON · useful · Grasp: partly
  - What it is: one group "<Metaclass> Properties" listing every structural feature of the element's metaclass that is not a core feature, with the same widget rules; e.g. a "Name" label and the checkboxes Is Composite, Is Reference, Is Portion, Is Abstract, Is Variation, Is End, Is Ordered, Is Unique, Is Derived. Unchecking "Is Composite" turns a part usage into a reference (Flashlight tutorial). Widget order follows the metaclass's full feature list (`eAllStructuralFeatures`, inherited features first), while Core widgets follow the order of the core-feature list; there is no sorting, search or collapsing of properties on either page.
  - For Grasp: every other metaclass attribute, such as Is Composite, can be seen and set; Grasp lists them but many say "not held yet".
  - Sources: `SysONDetailsViewDescriptionProvider.java`, `FormQueryElementService.java`, `flashlight.adoc`

#### Relationship core features

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Relationship core features** · views / Details view & property forms · SysON · useful · Grasp: partly
  - What it is: Dependency shows client and supplier; Specialization general and specific; Subclassification adds subclassifier and superclassifier; FeatureTyping adds type and typedFeature; Subsetting shows subsettedFeature and subsettingFeature; Redefinition adds redefinedFeature and redefiningFeature; ReferenceSubsetting shows referencedFeature and referencingFeature; FeatureChaining shows chainingFeature; PortConjugation shows conjugatedType and originalPortDefinition; all with the base name fields.
  - For Grasp: relationships show their two ends, such as general and specific; Grasp shows them for specializations and typings, not dependencies, subsettings or redefinitions.
  - Sources: `CoreFeaturesSwitch.java`

#### Multi-line body text area

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Multi-line body text area** · views / Details view & property forms · SysON · useful · Grasp: partly
  - What it is: the `body` of Comment, Documentation and TextualRepresentation is edited in a multi-line textarea instead of a single-line field (since 2025.4.0); disabled when read-only, writes the value back on change.
  - For Grasp: comment, documentation and textual representation bodies get a multi-line area; Grasp has this for documentation, but no comments or textual representations.
  - Sources: `SysONDetailsViewDescriptionProvider.java`, `2025.4.0.adoc`, `CHANGELOG.adoc` v2025.4.0

#### State sub-action Kind radio

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **State sub-action Kind radio** · views / Details view & property forms · SysON · useful · Grasp: partly
  - What it is: untitled group "Statesubaction Properties" with a "Kind" radio (do, entry, exit) when the element is owned by a StateSubactionMembership; edits the membership's kind; disabled when read-only.
  - For Grasp: a Kind radio switches a state's action among entry, do and exit; Grasp draws these actions but switches kind from no radio.
  - Sources: `SysONDetailsViewDescriptionProvider.java`, `StateSubactionKind.java`

#### Read-only Details widgets for read-only elements

**Grasp: partly** · parts: application, views

SysON features encompassed (2):

- **Read-only Details widgets for read-only elements** · application / Collaboration, undo/redo & change safety · SysON · useful · Grasp: partly
  - What it is: independently of the project capability, each widget is computed read-only when the selected object is read-only (standard-library or library element, read-only document): the default EMF property widgets are read-only for read-only objects and for non-changeable attributes, view-based reference widgets for read-only objects or when their enablement expression is false. SysON's Details add per-feature rules: a feature is read-only when its element is read-only or the feature is read-only, 'isParallel' of a state definition/usage is read-only once it owns transitions, a ViewUsage's exposed elements are always read-only, a LibraryPackage's 'isStandard' checkbox is always read-only (SysON supports no normative libraries beyond KerML/SysML; v2025.6.0), Conjugation's conjugatedType and PortConjugation's originalPortDefinition are read-only, and single-valued string attributes that are derived, not changeable, the elementId, or on a ConjugatedPortDefinition are shown read-only. SysON doesn't offer creating an expression on a read-only element.
  - For Grasp: library elements and derived features show as read-only, and Is Parallel locks once a state has transitions; Grasp locks Is Parallel but has no library elements.
  - Sources: `WidgetReadOnlyProvider.java`, `ReferenceWidgetPropertiesConverter.java`, `FormQueryElementService.java`
- **Read-only elements and features** · views / Details view & property forms · SysON · useful · Grasp: partly
  - What it is: all widgets are disabled for read-only elements (e.g. standard library content and imported user libraries, since 2025.2.0); derived or unchangeable features are disabled; conjugatedType, originalPortDefinition and LibraryPackage isStandard are always read-only; every string attribute of a ConjugatedPortDefinition is shown as a read-only label (ConjugatedPortDefinition handled in the Details view since 2024.5.0). Read-only detection was made more flexible and extended to more kinds of objects, including Resources and EAnnotations (2025.6.0), and standardized in 2025.10.0: a resource is read-only when it is a Sirius Web library imported by reference, a textual SysML file imported as read-only, or a KerML/SysML standard library, and every other resource is read-write (libraries imported by copy can be edited). Since 2026.5.0 library documents are always read-only, fixing a bug that let users edit library objects from the Details view. The SysON predicate (shared by the Explorer and Details views) treats a resource as read-only when it is a KerML/SysML standard library resource or its resource metadata is flagged read-only (read-only imported libraries); an element is read-only when its resource is, or when it lies inside a standard LibraryPackage even in an editable resource; an EAnnotation follows its resource.
  - For Grasp: library content and derived features are locked against edits; Grasp shows derived values read-only but holds no library content.
  - Sources: `FormQueryElementService.java`, `SysONReadOnlyObjectPredicateDelegate.java`, `CHANGELOG.adoc` v2024.5.0 / v2025.2.0 / v2025.6.0 / v2025.10.0 / v2026.5.0

#### Text fields commit on Enter or blur

**Grasp: partly** · parts: application, views · note: Grasp partly/unclear

SysON features encompassed (2):

- **Textfield widget** · views / Details view & property forms · Sirius Web · useful · Grasp: partly
  - What it is: single-line input (`input-<label>`) using its label as placeholder, browser spell-checking off. Supports Ctrl/Cmd+A select-all; the value is sent (`editTextfield`) when the user presses Enter/Return or focus leaves the widget (focus moving inside the widget does not commit), and only if it differs from the server value. While the field has focus a server refresh (e.g. another user's edit) does not overwrite the text being typed; the new server value is taken over only when the field is not focused. Escape only closes completion proposals and does not revert the typed text; there is no cancel gesture other than retyping the old value. Changes propagate to diagram and Explorer labels (renaming updates node labels; emptying a name empties the label). SysON uses it for names and other string and number properties. _(Sirius Web)_
  - For Grasp: a text field commits on Enter or leaving it, not while typing; Grasp writes as you type, one undo step per field.
  - Sources: `TextfieldPropertySection.tsx`, `PlaywrightDetails.ts`, `label.spec.ts`
- **Enter commits form text fields and table text cells** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · useful · Grasp: unclear
  - What it is: in Details/form text fields and in table text cells, Enter without Shift sends the edited value (as leaving the field does); in form text fields Escape dismisses the completion proposals and Ctrl+Space requests them when the widget supports completion. The form date/time widget also sends its value on Enter or blur. In the diagram palette's Appearance section, color and number fields commit on Enter or blur. _(Sirius Web)_
  - For Grasp: Enter commits a Details field or a table cell; how Grasp's panel fields commit beyond change events is not stated.
  - Sources: `TextfieldPropertySection.tsx`, `TextfieldCell.tsx`, `DateTimeWidgetPropertySection.tsx`

#### Create an object ("+") button

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Create an object ("+") button** · views / Details view & property forms · Sirius Web · useful · Grasp: partly
  - What it is: when configured, a "+" icon button (`<label>-add`) titled "Create an object" opens the create dialog; disabled when read-only. In SysON it is configured on Redefines, References, Specializes, Subsets, Payload, Receiver, Source, Target and the generic widget, not on Typed by. Creating on a non-empty single-valued reference gives a meaningful message. _(Sirius Web)_
  - For Grasp: a + button creates a new element and sets it as the value; Grasp makes a new definition only when a typed label names one.
  - Sources: `ValuedReferenceAutocomplete.tsx`, `SysONDetailsViewDescriptionProvider.java`, `CHANGELOG.adoc` v2023.8.0

### Representations: creating, opening and managing views (15)

Creating diagrams as view usages, retyping them with View as, and listing, opening, renaming and closing them.

#### 'Create a new Representation' card

**Grasp: missing** · parts: application, views · note: Grasp no/partly

SysON features encompassed (2):

- **'Create a new Representation' card** · views / Representations: creation, management & views list · Sirius Web · useful · Grasp: missing
  - What it is: with no representation open, an onboard card lists the representation descriptions applicable to the first selected element, sorted by default name; each item shows the default name with the description label underneath. Clicking one creates a representation with that default name on the element, then selects and opens it. Subtitles: 'Select the representation to create', 'There are no representations available for the current selection', or 'You need edit access to create representations' when read-only; a failed creation shows the toast 'An unexpected error has occurred, please refresh the page'. _(Sirius Web)_
  - For Grasp: with nothing open, a card lists diagrams to create for the selection; Grasp's plane always shows its frames.
  - Sources: `NewRepresentationArea.tsx`, `CHANGELOG.adoc` (Sirius Web)
- **Create a new Representation card** · application / Workbench layout & panels · Sirius Web · useful · Grasp: partly
  - What it is: titled 'Create a new Representation' with the subtitle 'Select the representation to create', it lists the representation types available for the current selection. Entries are sorted by default name and each shows a Collections icon, the default name and, underneath, the representation description's label (since 2025.10.0), so it is clear which description will be used. Clicking one creates the representation, named with that default name, on the first selected element, then selects it, which opens it in a tab. When there are none it says 'There are no representations available for the current selection'. Without edit rights it shows 'You need edit access to create representations'. _(Sirius Web)_
  - For Grasp: lists the diagrams that can be made on the selection; Grasp's New view adds a frame of the picked kind.
  - Sources: `NewRepresentationArea.tsx`, `sirius-web-application.json`

#### ViewUsage created in a diagram gets its own diagram

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **ViewUsage created in a diagram gets its own diagram** · views / Representations: creation, management & views list · SysON · useful · Grasp: missing
  - What it is: creating a ViewUsage from any standard diagram (palette 'New View' tools) also creates a diagram associated with that ViewUsage.
  - For Grasp: a view made inside a diagram is drawn there and gets its own diagram; Grasp's views are only top-level frames.
  - Sources: `2025.12.0.adoc`, `GVViewUsageTests.java`

#### 'View as': retype the current diagram

**Grasp: missing** · parts: diagrams, model, views · note: Grasp no/partly

SysON features encompassed (3):

- **Background 'View as': retype the current diagram** · views / Representations: creation, management & views list · SysON · useful · Grasp: missing
  - What it is: the diagram background palette's View as section (also in a ViewUsage node's palette) offers General View, Interconnection View, ActionFlow View and StateTransition View, each with the ViewUsage.svg icon. Each retypes the diagram's ViewUsage via setAsView: adds a FeatureTyping to the chosen StandardViewDefinitions::* when untyped, otherwise redirects the first owned FeatureTyping. The open diagram switches view kind and re-renders with the new view's node and edge descriptions without being recreated.
  - For Grasp: View as switches an open diagram to another standard view kind in place; Grasp can't change a view's kind.
  - Sources: `SetAsViewToolProvider.java`, `ModelMutationElementService.java`, `2025.10.0.adoc`
- **Background 'View as' section** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: 'General View', 'Interconnection View', 'ActionFlow View' and 'StateTransition View' retype the diagram's own ViewUsage with the chosen standard view definition (setAsView), switching the diagram's behavior.
  - For Grasp: retype a diagram as another standard view kind; Grasp fixes a view's kind when it is made.
  - Sources: `SDVDiagramDescriptionProvider.java`, `SetAsViewToolProvider.java`
- **Set as view (retyping a ViewUsage)** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: the 'View as' tools on the diagram background / ViewUsage frame add a FeatureTyping to the chosen standard view definition when the ViewUsage is untyped, or replace the type of its first owned FeatureTyping otherwise. As coded, the retyping only happens when the ViewUsage's very first owned relationship is a FeatureTyping (if another relationship comes first, a typed ViewUsage is left unchanged); the view definition is looked up by qualified name (e.g. StandardViewDefinitions::InterconnectionView) across all resources of the project.
  - For Grasp: switch a view to another standard kind in place; Grasp sets the kind only when a view is added.
  - Sources: `ModelMutationElementService.java`

#### Node 'View as': wrap elements in a new nested view

**Grasp: missing** · parts: diagrams, sysml-views, views

SysON features encompassed (4):

- **Node 'View as': move the element into a new view** · views / Representations: creation, management & views list · SysON · useful · Grasp: missing
  - What it is: on an element node, View as > General View / Interconnection View / ActionFlow View / StateTransition View creates a new ViewUsage typed by the chosen definition as a sibling owned by the current ViewUsage's owner, moves the element (and existing exposes of its descendants) from the current view into it, exposes the new ViewUsage in the current view so it appears as an embedded view node, and creates a diagram for it labelled with its name. On a part, Interconnection View exposes the part with its composed parts; on a Package it exposes the Package; Packages also have General View.
  - For Grasp: View as on a node moves the element into a new nested view of a chosen kind; Grasp has no nested views.
  - Sources: `ViewNodeAsToolProvider.java`, `DiagramMutationElementService.java`, `GVViewAsOnNodeTests.java`
- **'View as' targets per node kind** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: ActionUsage/ActionDefinition: General View, Interconnection View, ActionFlow View. StateUsage/StateDefinition: General View, Interconnection View, StateTransition View. Package: all four. CaseDefinition, CaseUsage, ConcernDefinition, ConcernUsage, ConnectionDefinition (and subtypes without their own palette, such as AllocationDefinition), ConstraintUsage, InterfaceDefinition, ItemDefinition, ItemUsage, MetadataDefinition, OccurrenceDefinition, OccurrenceUsage, PartDefinition, PartUsage, RequirementDefinition, RequirementUsage, UseCaseDefinition and UseCaseUsage: General View and Interconnection View.
  - For Grasp: open an element in another view kind with View as; Grasp can't make a view of an element from it.
  - Sources: `SDVNodeToolSectionSwitch.java`, `PackageNodeDescriptionProvider.java`
- **View as** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: The palette's View as section lists the view definitions to switch to: General View and Interconnection View on most nodes, ActionFlow View on action definitions/usages, StateTransition View on state elements. On the background it switches the diagram's kind; on a ViewUsage node it retypes that ViewUsage; on another element it creates a new ViewUsage typed by that view definition next to the current ViewUsage, moves the element and its exposed descendants into it, exposes the new ViewUsage in the current one (showing its frame) and creates its (unopened) diagram. Supports multi-selection; the layout may be lost when switching. Examples from tests: View as > Interconnection View on partB (linked by composition to partA and partC) creates an IV-typed ViewUsage shown in the General View containing partB and partC; on a Package it contains the Package; the group tool on partA and a PartDefinition creates a single IV ViewUsage holding both. This lets part of a diagram be shown another way, such as an Interconnection View inside a General View (v2025.12.0).
  - For Grasp: shows part of a diagram as another view kind, or retypes a view; Grasp views can't nest or change kind.
  - Sources: `GVViewAsOnNodeTests.java`, `ViewNodeAsToolProvider.java`, `DiagramMutationElementService.java`, `manage_update_of_view_usages_in_diagrams.adoc`
- **'View as >' wraps a node in a new ViewUsage** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: the View as menu on an element node creates a new ViewUsage typed by a standard ViewDefinition (General View, Interconnection View, ActionFlow View, StateTransition View) and shows the node inside it as a container, so part of a diagram can use another view (e.g. an Interconnection View inside a General View); multi-selection since 2026.5.0, where one shared ViewUsage is created holding all selected elements (e.g. a PartUsage and a PartDefinition). It also works on a Package node, the new ViewUsage containing the Package; applied to partB in a composition chain partA > partB > partC, the new frame contains partB and its exposed descendant partC. Mechanics: the new ViewUsage (icon ViewUsage.svg on the tools) is created and initialized in a membership of the owner of the nearest existing ViewUsage and typed with the chosen ViewDefinition; the Exposes of the selected elements and of their exposed descendants are moved into it (a MembershipExpose is added for any selected element not yet exposed); the new ViewUsage is exposed in the existing one; then a diagram representation is created and saved on the new ViewUsage, labelled with its name, without being opened.
  - For Grasp: View as wraps selected nodes in a new typed view inside the current one; Grasp views can't nest.
  - Sources: `ViewNodeAsToolProvider.java`, `DiagramMutationElementService.java`, `DiagramMutationDiagramService.java`

#### Related Views view

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Related Views view** · views / Representations: creation, management & views list · Sirius Web · useful · Grasp: missing
  - What it is: a right-sidebar view (id 'related-views', inactive by default; called 'Representations' before Sirius Web 2026.1.0 and still in SysON's docs) that follows the selection and lists, as a list widget, every representation whose target is the selected element, giving an overview of how it is represented. Clicking an entry opens it in a new tab, or switches to its tab if already open. It shows only the first widget of the server form (subscription relatedViewsEvent, relatedviews://?objectIds=[...]), shows 'No object selected' when nothing is selected or the subscription ends, has a pin/unpin synchronization toggle that freezes it on the current element (sync icon, tooltip 'Unpinned. Click to pin the view to the current selection.'; sync-lock icon when pinned, tooltip 'Pinned. Click to follow the global selection.'), and is read-only unless the server reports canEdit. Its side-panel entry is titled 'Related Views' (filter icon), and the list widget is labelled 'Related Views'; a loading indicator shows until the form arrives. The form re-renders only on representation creation, deletion or renaming and on portal view additions/removals (not on other model edits); entries come straight from the metadata store for that target id, with no sorting, and the form's title is the selected element's label. _(Sirius Web)_
  - For Grasp: a side view lists every diagram about the selected element; Grasp has no such list.
  - Sources: `RelatedViewsView.tsx`, `RelatedViewsFormDescriptionProvider.java`, `representations-view.adoc`

#### Views Explorer view

**Grasp: missing** · parts: views

SysON feature encompassed (1):

- **Views Explorer view** · views / Representations: creation, management & views list · Sirius Web · useful · Grasp: missing
  - What it is: a left-panel 'Views' view (added to SysON in 2026.3.0) shows a live tree of all the project's representations (subscription viewsExplorerEvent, viewsexplorer://?expandedIds=[...]), grouped by representation kind (DIAGRAM, TABLE...) then by description, groups and representations sorted alphabetically. Group nodes have no item menu; selecting a representation opens it in the main area. Its side-panel entry is titled 'Views' (filter icon); a loading indicator shows until the tree arrives. Empty state: 'No representation available'. _(Sirius Web)_
  - For Grasp: a left-panel tree of every diagram, grouped by kind; Grasp's frames sit on the plane with no list of them.
  - Sources: `ViewsExplorerView.tsx`, `DefaultViewsExplorerContentService.java`, `2026.3.0.adoc`

#### Open a representation from its URL

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Open a representation from its URL** · application / Workbench layout & panels · Sirius Web · useful · Grasp: missing
  - What it is: when the URL contains a representationId, the editor queries that representation's id, label, kind, iconURLs and description id within the project's editing context, then opens it as the initial representation in the main area. Components inside the workbench build links to a representation with the same path, /projects/<rawProjectId>/edit/<representationId>. _(Sirius Web)_
  - For Grasp: a link opens a given diagram; Grasp's page cannot open on a named view.
  - Sources: `useProjectAndRepresentationMetadata.ts`, `EditProjectView.tsx`

#### Diagram on an existing typed ViewUsage

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Diagram on an existing typed ViewUsage** · sysml-views / SysML Interconnection View · SysON · useful · Grasp: missing
  - What it is: a ViewUsage already typed by a standard view (e.g. one imported from textual SysML, shown in the Explorer as 'view1 [InterconnectionView]') can receive a diagram from New representation, even by picking 'General View': the diagram renders with the ViewUsage's own view kind, so the e2e test gets an Interconnection View this way. Since 2025.10.0 almost all node descriptions are synchronized with the ViewUsage's exposed elements, so changing the ViewUsage's ViewDefinition switches the view kind without re-creating the diagram; the Explorer label then shows the ViewDefinition name and default ViewUsage names no longer contain it. Since 2025.12.0 a standard diagram can no longer be created on a ViewUsage that already has one, and the diagram's own Delete and Duplicate context-menu entries were removed: delete the ViewUsage in the Explorer to delete its diagram.
  - For Grasp: a view typed in imported text keeps its kind and can switch kind without being recreated; Grasp imports no text and can't retype a view.
  - Sources: `diagram.spec.ts`, `2025.10.0.adoc`, `2025.12.0.adoc`

#### Open an existing Representation card

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Open an existing Representation card** · application / Workbench layout & panels · Sirius Web · useful · Grasp: partly
  - What it is: titled 'Open an existing Representation' with the subtitle 'Select the representation to open', it lists the project's existing representations (onboard-open-{label}, e.g. 'view1'), each with its icon. Clicking one selects it, which opens it. The list is paged 10 at a time, with previous and next arrow buttons (pagination-prev, pagination-next) disabled at either end; since Sirius Web 2025.6.0 it can reach every representation of the project instead of only the first 20. _(Sirius Web)_
  - For Grasp: lists the project's diagrams to open one; Grasp shows every view on the plane, and Fit brings them back.
  - Sources: `RepresentationsArea.tsx`, `flashlight.adoc`, `CHANGELOG.adoc` v2025.6.0

#### Representation entries

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Representation entries** · views / Explorer view (model tree) · SysON · useful · Grasp: partly
  - What it is: Representations offer "Duplicate" (`duplicate-representation`), "Rename" and "Delete". General View-based diagrams and requirements tables have no entries: they are not duplicable or deletable from the tree, because they live on a ViewUsage, which users delete instead.
  - For Grasp: duplicate, rename and delete a diagram from the tree; Grasp renames and deletes views from their panel and can't duplicate one.
  - Sources: `SysONExplorerTreeItemContextMenuEntryProvider.java`, `SysONExplorerTests.java`, `explorer-view.adoc`

#### SysON representation candidates

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **SysON representation candidates** · views / Representations: creation, management & views list · SysON · useful · Grasp: partly
  - What it is: on a Package, the type select offers exactly five entries: General View, Action Flow View, Interconnection View, Requirements Table View, State Transition View.
  - For Grasp: a package offers General, Action Flow, Interconnection, State Transition and Requirements Table views; Grasp offers all eight standard kinds but no requirements table.
  - Sources: `Explorer.ts`, `ExplorerViewControllerIntegrationTests.java`

#### General View creatable on any Namespace

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **General View creatable on any Namespace** · views / Representations: creation, management & views list · SysON, experimental · useful · Grasp: partly
  - What it is: 'General View' is offered for any element that is (inherits from) Namespace. _(experimental)_
  - For Grasp: a General View can be made on any namespace, scoping it there; Grasp's views all belong to its package, scoped by their roots or Show list.
  - Sources: `DiagramQueryViewService.java`, `general-view.adoc`

#### Open representations by selecting them

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Open representations by selecting them** · views / Representations: creation, management & views list · Sirius Web · useful · Grasp: partly
  - What it is: whenever the global selection contains representation ids (e.g. a click in the explorer, Views, Related Views), their metadata is fetched, the first is displayed and any not already open are added as new tabs. Opening a representation from its URL or from the onboarding area also reveals it in the Explorer (restored in Sirius Web 2024.11.0). _(Sirius Web)_
  - For Grasp: selecting a diagram anywhere opens it in a tab; Grasp's view becomes active when its tab or contents are clicked.
  - Sources: `Workbench.tsx`, `useSynchronizeRepresentationWithSelection.tsx`

#### Closing a representation tab

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Closing a representation tab** · views / Representations: creation, management & views list · Sirius Web · useful · Grasp: partly
  - What it is: the X on a tab closes it without activating it; closing an inactive tab keeps the current one; closing the displayed tab shows the tab now at the same position, or the previous one if it was last; closing the last tab returns the main area to its empty (onboarding) state. _(Sirius Web)_
  - For Grasp: close a diagram's tab, with clear rules for which tab shows next; Grasp has no tabs but can fold a view's frame.
  - Sources: `Workbench.tsx`

#### Exposed-element resolution

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Exposed-element resolution** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: root-level diagram content comes from the ViewUsage's Expose relationships; an exposed Package is shown itself, elements belonging to an exposed package are not repeated at the root, a recursive MembershipExpose adds all descendants; inside a parent node, candidates are exposed descendants of that parent filtered by node type (LibraryPackage counts as Package). Fixes in this logic: a Package created inside another Package node no longer also appears at the diagram root (v2025.12.0), elements created inside a ViewUsage node stay inside it (v2025.12.0), and an AttributeUsage of a Package nested in another Package appears only in its owning package (v2026.11.0).
  - For Grasp: exposes, recursive ones included, decide what a diagram draws and where; Grasp exposes everything or each element, no recursive per-element expose.
  - Sources: `DiagramQueryExposeService.java`, `2025.12.0.adoc`, `2026.11.0.adoc`

## Canvas interaction

### Selection and multi-selection (9)

Selecting on the canvas, multi-selection gestures and keeping the selection in sync across views.

#### Reveal selected elements in the diagram

**Grasp: missing** · parts: application, diagrams · note: Grasp no/partly

SysON features encompassed (2):

- **Reveal selected elements in diagram (toolbar button)** · application / Workbench layout & panels · Sirius Web · useful · Grasp: missing
  - What it is: a diagram toolbar button (LocationSearching icon) applies the current workbench selection (e.g. elements selected in the Explorer) to the diagram, selecting and revealing the matching elements. Hovering it fetches the selected objects' labels. While they load, the tooltip shows 'Reveal selected elements (loading details...)'. It then shows 'Select A, B', or beyond 5 labels 'Select A, B, C, D, E (and N more)'. With no labels it reads 'Reveal selected elements'. _(Sirius Web)_
  - For Grasp: a toolbar button shows the Explorer's selection on the diagram; Grasp has no reveal command.
  - Sources: `RevealSelectionInDiagramButton.tsx`, `sirius-components-diagrams.json`, `manage-toolbar-diagram.adoc`
- **Reveal selected elements** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: partly
  - What it is: toolbar button (test id diagram-reveal-selection) applies the workbench global selection (e.g. Explorer items, or an edge's semantic element) to the diagram once, selecting all top-level occurrences of each element (the diagram no longer follows global selection automatically); a selected edge shows its two connection handles. On hover the tooltip loads ("Reveal selected elements (loading details...)") and lists labels: "Select A, B" for up to 5, then "(and N more)". _(Sirius Web)_
  - For Grasp: selects in the diagram what is selected in the Explorer; Grasp selects from its browser view but can't push that into a diagram view.
  - Sources: `RevealSelectionInDiagramButton.tsx`, `sirius-components-diagrams.json`, `selection.spec.ts`

#### Rectangle (marquee/lasso) selection with Shift + drag

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Rectangle (marquee/lasso) selection with Shift + drag** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: missing
  - What it is: holding Shift and left-dragging draws a rectangle; nodes are selected live and on release every element it touches is selected, even partly inside (partial selection mode). If the drag starts inside a node, that node and all its ancestors are made temporarily unselectable (and deselected while dragging), so nested elements can be selected without their containers; started outside any node it can select containers. _(Sirius Web)_
  - For Grasp: Shift+drag box-selects many elements, nested ones without their containers; Grasp has no marquee selection.
  - Sources: `useRectangleSelection.ts`, `DiagramRenderer.tsx`, `2026.9.0.adoc`

#### Edge selection handles

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Edge selection handles** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: missing
  - What it is: edge end handles on nodes are invisible by default and shown only while their edge is selected (two black connection handles); auto-placed handles draw as small black squares, custom-positioned ones white with a black border; they are never directly connectable (pointer events off). Selecting an edge also marks it reconnectable and deselecting it clears that; in a read-only diagram this step is skipped, so a selected edge shows neither its end handles nor reconnect grips. _(Sirius Web)_
  - For Grasp: a selected edge shows its end handles for reconnecting; Grasp's selected line only thickens.
  - Sources: `ConnectionHandles.tsx`, `useSelectEdgeChange.tsx`, `edge-handle.spec.ts`

#### Delete from diagram (multi-selection)

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Delete from diagram (multi-selection)** · diagrams / Diagram: selection, editing & direct manipulation · SysON · useful · Grasp: missing
  - What it is: group-palette quick-access tool "Delete from diagram" deletes the views of all selected nodes and removes each element and its sub-node elements from the ViewUsage's exposed elements, without deleting model elements; offered only when nodes and no edges are selected. It uses diagramServices.deleteViews(nodes), the AQL service studio makers can use in group tools to remove several unsynchronized nodes while keeping their semantic elements (2026.9.0).
  - For Grasp: remove several nodes from a view at once; Grasp has no multi-selection.
  - Sources: `DiagramDefaultGroupToolsFactory.java`, `2026.9.0.adoc`, `manage-group-elements.adoc`

#### Delete from model on a multi-selection

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Delete from model on a multi-selection** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: With nodes and an edge selected, the 'Delete from model' quick tool deletes every selected element from the model. _(Sirius Web)_
  - For Grasp: delete a mixed selection from the model at once; Grasp has no multi-selection.
  - Sources: `delete-elements.spec.ts`

#### Post-tool selection mechanism

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Post-tool selection mechanism** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: partly
  - What it is: node and edge tools can define an 'Elements to Select Expression'; when a palette or connector tool returns a newSelection it is registered and, on the next refresh with cause 'layout', exactly one visible diagram element per requested semantic element is selected (edges checked first, then nodes; priority nodes before edges, containers before children, then node description order), the last node marked last-selected and everything else deselected, then applied globally to the workbench. Explicit synchronization (toolbar button or Show in) instead selects all top-level occurrences. Tool messages (info, warning, error) show as toasts; an unexpected failure shows "An unexpected error has occurred, please refresh the page". _(Sirius Web)_
  - For Grasp: a tool selects what it made and reports messages as toasts; Grasp selects the new element and says so in its status line.
  - Sources: `usePostToolSelection.ts`, `useSingleClickTool.tsx`, `CHANGELOG.adoc`

#### Explicit cross-view synchronization

**Grasp: unclear** · parts: application

SysON feature encompassed (1):

- **Explicit cross-view synchronization** · application / Workbench layout & panels · Sirius Web · useful · Grasp: unclear
  - What it is: selecting a node in a diagram does not automatically select or reveal it in the explorer, and selecting an item in the explorer does not select the node in the diagram. Synchronization is explicit, through the explorer's Reveal selection button, the diagram toolbar's reveal button, the 'Show in' menus and the omnibox. Opening a diagram does not steal the workbench selection. _(Sirius Web)_
  - For Grasp: selecting in a diagram does not select in the Explorer, except through explicit commands; whether Grasp marks a selection in every view is not stated.
  - Sources: `selection.spec.ts`, `CHANGELOG.adoc` v2025.10.0

#### Selection applied to views

**Grasp: unclear** · parts: application

SysON feature encompassed (1):

- **Selection applied to views** · application / Workbench layout & panels · Sirius Web · useful · Grasp: unclear
  - What it is: the workbench can push a selection into each view. The Explorer and Views explorer then select the items and expand the tree to reveal them. Details, Query, Related Views and Related Elements switch to the new objects. The Search view ignores pushed selections. _(Sirius Web)_
  - For Grasp: a selection sent to the tree expands it and selects the items; whether Grasp's Browser follows a selection is not stated.
  - Sources: `ExplorerSelectionContext.tsx`, `ViewsExplorerView.tsx`, `useSearchViewHandle.ts`

#### Workbench selection applied to the diagram

**Grasp: unclear** · parts: application

SysON feature encompassed (1):

- **Workbench selection applied to the diagram** · application / Workbench layout & panels · Sirius Web · useful · Grasp: unclear
  - What it is: the diagram editor registers with the workbench. A selection pushed into it (Show in, reveal button, omnibox) selects every visible node showing a selected element, except nested nodes whose ancestor is already selected for that element. Visible edges are selected only if their element was not already selected through a node, and their end nodes count as revealed. The selected elements are revealed in the viewport. An element whose node is hidden on the diagram is not selected there. _(Sirius Web)_
  - For Grasp: a selection sent to a diagram selects and reveals its nodes; whether Grasp scrolls to an element selected elsewhere is not stated.
  - Sources: `useApplySelection.ts`, `DiagramRepresentation.tsx`, `CHANGELOG.adoc`

### Viewport and navigation (7)

Diagram toolbar, fit, full screen, mini map, grid snapping, helper lines and panning.

#### Toggle full screen mode

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Toggle full screen mode** · diagrams / Diagram: viewport & navigation · Sirius Web · useful · Grasp: missing
  - What it is: the first toolbar button (Fullscreen icon, tooltip "Toggle full screen mode") requests browser full screen on the diagram's DOM element for distraction-free modeling; while active the button becomes "Exit full screen mode" and calls document.exitFullscreen(). _(Sirius Web)_
  - For Grasp: full screen for distraction-free modelling on one view; Grasp always shows its header and panel around the plane.
  - Sources: `DiagramToolbar.tsx`, `useFullscreen.tsx`, `diagram.adoc`

#### Mini map overlay and toggle

**Grasp: missing** · parts: diagrams

SysON features encompassed (2):

- **Show / hide mini map toggle** · diagrams / Diagram: viewport & navigation · Sirius Web · useful · Grasp: missing
  - What it is: toolbar button showing "Hide mini map" (CreditCardOff icon) when visible and "Show mini map" (CreditCard icon) when hidden. The choice is remembered per diagram in browser localStorage (key 'sirius-single-diagram-mini-map-visibility', a map of diagram id to {visible, lastAccessedAt}; a legacy key is removed), so hiding it on one diagram does not affect another and the diagram still has it hidden when reopened. Added to SysON's toolbar in 2025.2.0. _(Sirius Web)_
  - For Grasp: toggles an overview of a large diagram, remembered per diagram; Grasp has no mini map.
  - Sources: `DiagramToolbar.tsx`, `MiniMapContext.tsx`, `diagram.spec.ts`
- **Mini map overlay** · diagrams / Diagram: viewport & navigation · Sirius Web · useful · Grasp: missing
  - What it is: a pannable and zoomable (zoom step 2) overview of the whole diagram, 150x100 px at 75% opacity in the bottom-right corner, highlighting the current viewport; click, drag or scroll in it to navigate. Initial visibility comes from the description's minimapVisible flag (can be configured hidden by default) unless a per-diagram choice is stored; SysON's SDV description (used by General, Interconnection, Action Flow and State Transition Views, and their registration stubs) sets minimapVisible(true). On the server, DiagramDescription.minimapVisible is answered by IMinimapVisibilityProvider contributions: every provider that handles the description must return true, and the value defaults to true when it cannot be computed; the view-DSL provider reads the description's minimapVisible flag. Its size and opacity were reduced in 2025.10.0. _(Sirius Web)_
  - For Grasp: a corner overview to see and jump around a big diagram; Grasp has none.
  - Sources: `DiagramRenderer.tsx`, `SDVDiagramDescriptionProvider.java`, `MinimapVisibleEventHandler.java`

#### Toggle snap to grid

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Toggle snap to grid** · diagrams / Diagram: viewport & navigation · Sirius Web · useful · Grasp: missing
  - What it is: toolbar button "Toggle snap to grid mode" (GridOn icon) makes node moves and resizes snap to a 10 px grid; when on it becomes "Exit snap to grid mode" (GridOff icon). Off by default and held per opened diagram (not persisted). While on, the grid is visible (also while moving a non-droppable node); the docs call the grid invisible. _(Sirius Web)_
  - For Grasp: snaps moves and resizes to a 10 px grid for tidy diagrams; Grasp places freely with no snapping.
  - Sources: `DiagramToolbar.tsx`, `SnapToGridContext.tsx`, `diagram.adoc`

#### Helper lines while moving nodes

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Helper lines while moving nodes** · diagrams / Diagram: viewport & navigation · Sirius Web · useful · Grasp: missing
  - What it is: while dragging one or several nodes (as one bounding box), if its left/right edges, top/bottom edges or center come within 10 px of another node's edges or center, a vertical and/or horizontal guide is shown and the nodes snap to it (closest match wins); works for multi-selection moves. _(Sirius Web)_
  - For Grasp: alignment guides and snapping while dragging make tidy diagrams easy; Grasp has none.
  - Sources: `useHelperLines.tsx`, `layoutParams.ts`, `CHANGELOG.adoc`

#### Initial fit to screen on open

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Initial fit to screen on open** · diagrams / Diagram: viewport & navigation · Sirius Web · useful · Grasp: partly
  - What it is: when a diagram opens, once its non-hidden nodes are measured, the viewport does one animated fit (400 ms) on all nodes. For an empty diagram the initial fit is skipped and marked done, so dropping a first element keeps zoom at 1 with the node in view (no auto zoom-in). Tests disable it via document.DEACTIVATE_FIT_VIEW_FOR_CYPRESS_TESTS. _(Sirius Web)_
  - For Grasp: a diagram opens framed on its content; Grasp reopens at its saved camera and fits only on Fit or 0.
  - Sources: `useInitialFitToScreen.tsx`, `animation.spec.ts`, `Diagram.ts`

#### Reveal selected nodes in the viewport

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Reveal selected nodes in the viewport** · diagrams / Diagram: viewport & navigation · Sirius Web · useful · Grasp: partly
  - What it is: when a selection is applied from outside the diagram (e.g. Explorer) with fit enabled and any selected node is not fully inside the pane, the view pans at the current zoom to show them all, with a 400 ms animation. Applying a selection skips hidden nodes and edges, does not also select a nested occurrence whose ancestor node is already selected for the same element, skips an edge whose element is already selected as a node, and for each selected edge includes its source and target nodes in the area to reveal. Selecting an element in the Explorer can select and focus the matching edge too (2023.12.0); a selection whose node is hidden is not synchronized from the Explorer (2025.2.0). _(Sirius Web)_
  - For Grasp: pans to show what was selected elsewhere; Grasp moves the camera only when stepping through problems.
  - Sources: `useRevealNodes.ts`, `useApplySelection.ts`, `CHANGELOG.adoc`

#### Alt held disables node dragging (Alt + drag pans)

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Alt held disables node dragging (Alt + drag pans)** · application / Omnibox, commands & keyboard shortcuts · Sirius Web · useful · Grasp: partly
  - What it is: while the Alt key is held anywhere in the document, diagram nodes cannot be dragged, so Alt + drag pans the diagram instead of moving elements, which the docs recommend for large zoomed-out diagrams. Dragging is re-enabled on Alt key-up or when the browser window loses focus. _(Sirius Web)_
  - For Grasp: holding Alt lets a drag pan instead of moving nodes; Grasp pans by dragging the empty plane or scrolling, with no Alt mode.
  - Sources: `useNodesDraggable.ts`, `keyboard-shortcuts.adoc`

### Direct manipulation: drag, drop, move, resize and duplicate (14)

Moving, resizing and dropping nodes on the canvas, including drops from the Explorer.

#### Move multiple selected elements

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Move multiple selected elements** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: missing
  - What it is: all selected elements can be dragged together without changing their graphical or semantic parents. _(Sirius Web)_
  - For Grasp: drag a whole multi-selection together; Grasp moves one element at a time.
  - Sources: `manage-group-elements.adoc`

#### Resize persistence

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Resize persistence** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: missing
  - What it is: sizes are persisted in the diagram layout and shared with other subscribers, including the very first resize of a newly created node; rectangle nodes with a header can be resized. _(Sirius Web)_
  - For Grasp: sizes kept with the diagram; Grasp keeps box widths but the user can't change them.
  - Sources: `CHANGELOG.adoc`

#### Drag outside node label

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Drag outside node label** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: missing
  - What it is: a node's outside (BOTTOM_MIDDLE) label can be dragged freely with zoom-corrected distances; on release its offset is stored, movedByUser=true, and the layout persisted. Disabled on read-only diagrams. _(Sirius Web)_
  - For Grasp: drag a node's outside label clear of lines; Grasp's labels are fixed to their element.
  - Sources: `DraggableResizableOutsideLabel.tsx`, `useLabelMove.ts`, `PlaywrightNodeLabel.ts`

#### Draggable edge labels with persisted position

**Grasp: missing** · parts: diagrams

SysON features encompassed (2):

- **Drag edge labels** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: missing
  - What it is: each edge label (begin, center, end) can be dragged in an editable diagram with zoom-corrected deltas; a drag ending with an x or y offset of exactly 0 is ignored (plain click). On release the offset is stored with movedByUser=true and persisted. Edge labels render above edges (z-index 1001) with 5 px padding. Dragging a center edge label applies no extra offset to its drop position, and a center label does not stick to the edge path. _(Sirius Web)_
  - For Grasp: drag edge labels off crowded lines; Grasp's line labels sit fixed at the line's middle.
  - Sources: `DraggableResizableLabel.tsx`, `useLabelMove.ts`
- **Draggable labels with persisted position** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: outside node labels and edge labels (begin, center, end) can be dragged to a new position without offset. The position is stored in the diagram layout data (ADR-160) and persisted. On nodes only the BOTTOM_MIDDLE outside label can be dragged; inside labels are not draggable and are always saved at (0,0) with movedByUser and resizedByUser false. The center edge label's position is corrected by the grab offset, the begin and end labels take the drop position as is, and the label is flagged movedByUser. A label move is saved with autoLayoutState UNCHANGED, so it does not stop auto layout. Labels cannot be dragged in read-only mode. Manually moved edge labels keep their position after a node resize and do not stick to the edge path. _(Sirius Web)_
  - For Grasp: drag labels clear of lines and keep them there; Grasp's labels are fixed.
  - Sources: `DraggableResizableOutsideLabel.tsx`, `label.spec.ts`, `CHANGELOG.adoc` v2024.11.0

#### Drop a definition on a usage to type it

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **Drop a Definition on a Usage sets its type** · diagrams / Diagram: selection, editing & direct manipulation · SysON · useful · Grasp: missing
  - What it is: dropping a Definition from the Explorer onto a Usage node (not a ViewUsage) or list item creates no node; it sets a FeatureTyping so the usage is typed by the definition, and the usage's label updates (e.g. 'part1' becomes 'part1 : PartDefinition1'); if the definition is also shown on the diagram, a FeatureTyping edge (closed arrow with dots) appears between them.
  - For Grasp: drop a definition on a usage to type it; Grasp types through the details' Typed by or a defined-by line.
  - Sources: `DiagramMutationDndService.java`, `2024.9.0.adoc`
- **Drop a definition on a usage** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Dropping a Definition from the Explorer onto a Usage node (not a ViewUsage), or onto a usage row in a list compartment (v2024.9.0), types the usage with it (label becomes e.g. "part1 : PartDefinition1") and creates no node; if the definition is shown, a FeatureTyping edge appears.
  - For Grasp: dropping a definition from the tree onto a usage types it; Grasp has no drag from a tree.
  - Sources: `DiagramMutationDndService.java`, `dropFromExplorer.cy.ts`

#### Explorer drop resolution and no-duplicate rule

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **Explorer drop follows the no-duplicate display rule** · diagrams / Diagram: selection, editing & direct manipulation · SysON · useful · Grasp: missing
  - What it is: dropped onto a node with no suitable compartment, the element goes on the background linked to that node by a composition edge; if a suitable compartment of its semantic parent's node is visible, it is created there as a nested node.
  - For Grasp: a drop with no suitable compartment lands on the background linked by a composition edge; Grasp nests in boxes, never composition edges.
  - Sources: `2025.12.0.adoc`, `CHANGELOG.adoc` v2025.12.0
- **Explorer drop resolution rules** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: A dropped Membership is replaced by its owned element (except the standard start/done actions, which the diagram represents through their memberships). An element dropped on the background is exposed under the node of its semantic owner when that node is on the diagram, and its root node is then revealed. If the element is already exposed: a hidden representation inside the drop target is revealed; a visible one there, or one visible elsewhere, gives the warning "The element X is already visible in its parent Y" (Y is the ViewUsage owner's name when the parent is the diagram itself); dropping an element onto one of its descendants (not the background) gives "Cannot drop X on Y: X is a parent of Y". Non-exposable elements get a view created directly, with their compartments hidden.
  - For Grasp: rules for where dropped tree elements go and the warnings when already shown; Grasp has no tree drag.
  - Sources: `DiagramMutationDndService.java`

#### Multi-node drag and drop

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Multi-node drag and drop** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: missing
  - What it is: dragging a multi-selection drops all nodes in one dropNodes call (drop tools receive droppedNodes/droppedElements), preserving relative positions; e.g. two attributes dragged to another entity move in the model too, and dropping on the background can create a wrapper container. In SysON several selected nodes can be dropped at once onto a new container (2026.7.0), e.g. several top nodes into a package and back. _(Sirius Web)_
  - For Grasp: drag several nodes into a new container in one step; Grasp moves one at a time.
  - Sources: `multi-dnd.spec.ts`, `2026.7.0.adoc`, `GVDropFromDiagramTests.java`

#### Drag a list item between compartments

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Drag a list item between compartments** · diagrams / Diagram: selection, editing & direct manipulation · SysON · useful · Grasp: missing
  - What it is: a list compartment accepts drops of compartment items of the same item type from any other compartment, re-parenting the element; constraint compartments (nestedConstraint/ownedConstraint), require-constraint and assume-constraint compartments use dedicated drop services. Subject compartments accept a drop only on a Requirement or Case (Usage or Definition) that has no subject yet, and objective compartments only on a CaseUsage/CaseDefinition with an empty objective; both process only the first dropped node, as the relationship is single-valued. Require/assume constraint compartments of a Requirement take only ConstraintUsages, re-owned in a RequirementConstraintMembership of kind requirement or assumption; constraint compartments of a Constraint Usage/Definition take only ConstraintUsages, re-owned in a FeatureMembership. In those three cases the old owning membership is deleted, the old node removed and a new node created in the target compartment.
  - For Grasp: drag compartment items between compartments to re-own them; Grasp's compartments are text lines.
  - Sources: `CompartmentNodeDescriptionProvider.java`, `DiagramMutationDndService.java`, `DiagramMutationMoveService.java`

#### Duplicate element on the diagram

**Grasp: missing** · parts: diagrams, model

SysON features encompassed (2):

- **Duplicate Element (single node)** · diagrams / Diagram: selection, editing & direct manipulation · SysON · useful · Grasp: missing
  - What it is: quick-access palette tool (content_copy.svg icon), also in the Edit section, on every node that is the main representation of a SysML element (not compartments) in all SysML diagrams. It duplicates like the Explorer's Duplicate: copies the owning membership, deep-duplicates its member element with content (e.g. p1-copy with attributes x1..x3), adds it as a sibling in the same semantic owner, creates a node with the same NodeDescription under the duplicated node's graphical parent (for a compartment list item or ItemUsage border node, under the grandparent owning the compartment; the copy's root node is hidden) and exposes it. Relationships cannot be duplicated, except Usages or Definitions that are also relationships, such as Interface and Allocation nodes (restored in 2026.11.0); elements without an owning membership are skipped. Specified in 2025.8.0, implemented for the General View in 2026.1.0.
  - For Grasp: duplicate an element with its contents as a sibling; Grasp has no duplicate.
  - Sources: `AbstractNodeDescriptionProvider.java`, `DiagramMutationDiagramService.java`, `GVDuplicateNodeTest.java`
- **Diagram node Duplicate** · model / Model semantics & editing services · SysON · useful · Grasp: missing
  - What it is: the diagram Duplicate action (`duplicateElementAndExpose`) always duplicates with content and outgoing references, then exposes the copy in the diagram's ViewUsage. The copy is a sibling: a content-less copy of the original's owning membership (same Membership kind) is added to the same owner and holds the duplicate; it is exposed relative to the node's parent (border node parent, list item grandparent, or the diagram). Offered as the 'Duplicate Element' quick-access tool on usage, definition, package, imported-package, annotating and control-node nodes, compartment items and item/port/reference border nodes (not on elements that do not support it, v2026.1.0), and as 'Duplicate Elements' in the standard diagrams' group palette for multi-selection (v2026.5.0, key binding Ctrl+D), each selected element and its representation being copied once, even across different containers. Since v2026.11.0 it also works on Usage/Definition nodes that are also Relationships (interfaces, allocations).
  - For Grasp: Ctrl+D copies selected nodes beside the originals and shows them; Grasp has no duplicate on the drawing.
  - Sources: `DiagramMutationDiagramService.java`, `GVDuplicateNodeTest.java`, `2026.5.0.adoc`

#### Droppable element kinds

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Droppable element kinds** · diagrams / Diagram: selection, editing & direct manipulation · SysON · useful · Grasp: partly
  - What it is: Documentation and Comment elements dropped from the Explorer appear as their own resizable, text-wrapping doc/comment nodes (2024.11.0; e.g. a part's Documentation shows as 'add doc here'), elements with only a declared short name (e.g. `requirement <'SN'> {...}`, 2025.12.0), LibraryPackages (2026.3.0), Definitions onto a General View (fixed 2025.6.0) and nested AttributeUsages (visible on first drop, 2026.9.0) can be dropped from the Explorer; Concern Definitions and Concern Usages got drop node tools in 2025.2.0, and Satisfy Requirement Usage nodes got a drag and drop tool to move them on the diagram in 2025.4.0.
  - For Grasp: docs, comments, library packages and more can be dropped onto a diagram; Grasp shows docs as a compartment and has no comment or package nodes.
  - Sources: `2025.12.0.adoc`, `2026.3.0.adoc`, `2026.9.0.adoc`

#### Compatible drop targets

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Compatible drop targets** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: partly
  - What it is: at drag start the compatibility rules give the visible nodes that can receive the dragged nodes, excluding the dragged nodes, their descendants and hidden nodes; the deepest visible node under the cursor is the current target. Border nodes are excluded from this behavior. _(Sirius Web)_
  - For Grasp: only valid containers take a dragged node; Grasp picks the innermost box that can hold the kind but doesn't list candidates.
  - Sources: `useDropNodes.ts`, `CHANGELOG.adoc`

#### Drop target feedback

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Drop target feedback** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: partly
  - What it is: while dragging, every compatible container shows a soft green glow (success color at 50%), the hovered compatible target a solid green glow, a hovered incompatible target a red glow (error at 50%), with a 0.3 s transition; the dragged nodes and their current parent get none, dragging a border node highlights nothing, and feedback is removed on release. When dropping on the background is not allowed it turns grey and grid lines disappear. SysON's and Sirius Web's manuals describe it as authorized containers revealed, forbidden targets faded and the target highlighted; since 2026.1.0 compatible targets are highlighted instead of fading all incompatible ones. When nodes from different parents are dragged together, only the target is highlighted, not any of their current parents. Node styles are no longer left faded after a drag and drop (2025.10.0), and a valid candidate no longer randomly stays faded (2026.5.0). _(Sirius Web)_
  - For Grasp: green glow on valid targets and red on invalid while dragging; Grasp marks only the box it would drop into.
  - Sources: `useDropNodeStyle.ts`, `useDropDiagramStyle.tsx`, `manage-drag-drop.adoc`

#### Move checks and feedback messages

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Move checks and feedback messages** · diagrams / Diagram: selection, editing & direct manipulation · SysON · useful · Grasp: partly
  - What it is: moving an element onto itself is silently a no-op (absorbs tiny drags). Refusals report: 'Unable to move an Element to one of its descendant', 'Unable to move a read only Element', 'Unable to move a Element to a read only Element', 'Membership can't be used as a target of a move', 'Element is not contained in a membership', and "Unable to move X in Y: reason" (e.g. dropping a part on a read-only library package gives the warning "Unable to move part1 in Parts: Unable to move a Element to a read only Element" and the drop is prevented); since 2026.7.0 the move service reports these messages to the user, using labels. Applies to Explorer drag and drop and diagram re-parenting.
  - For Grasp: refused moves say why; Grasp's palette and drops explain refusals in the status line, with no read-only libraries to refuse.
  - Sources: `SysMLMoveElementCheckerService.java`, `DefaultSysMLMoveElementService.java`, `2026.7.0.adoc`

#### No circular containment of nested parts

**Grasp: unclear** · parts: model

SysON feature encompassed (1):

- **No circular containment of nested parts** · model / Model semantics & editing services · SysON · useful · Grasp: unclear
  - What it is: circular containment of nested parts, including self-containment, is forbidden (e.g. 'Become nested part' edge tool, drag and drop). The become-nested service and composition-edge reconnection refuse the change with the warning 'Cannot change the owner of <name>, this would create a containment cycle'; a successful become-nested move also sets the moved usage's isComposite = true.
  - For Grasp: a part can't end up inside itself; Grasp re-parents on drop, and whether it refuses cycles isn't documented.
  - Sources: `2024.5.0.adoc`, `CHANGELOG.adoc` v2024.5.0, `DiagramMutationToolService.java`

### Connecting and reconnecting edges (11)

Creating edges by dragging between nodes, the connector menu, and reconnecting edge ends.

#### Connection line

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Connection line** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: missing
  - What it is: dragging from a creation arrow draws an animated smooth-step preview line in the theme's selected color, following the rendered edge path style; it snaps to the nearest border point of the node under the cursor or, if that node is invalid, of its nearest valid ancestor. Loose connection mode, connection radius 0. _(Sirius Web)_
  - For Grasp: a live preview line follows the cursor while connecting; Grasp shows none between the two clicks.
  - Sources: `ConnectionLine.tsx`, `DiagramRenderer.tsx`, `CHANGELOG.adoc`

#### Compatible-target highlighting during connection

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Compatible-target highlighting during connection** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: missing
  - What it is: nodes whose description is a connector candidate are shown at full opacity (even if faded) and all others dimmed to 40%; a hovered compatible node gets a 2 px glow. Compatible Manhattan edges stay opaque, the hovered one turns the selected color, incompatible ones dim to 40% (Smart Manhattan and Oblique edges untouched). In SysON relationship edges can only be created between nodes matching the edge's source and target types. _(Sirius Web)_
  - For Grasp: valid targets stay bright and others dim while connecting; Grasp refuses a bad target in words but doesn't dim.
  - Sources: `useConnectorNodeStyle.tsx`, `useConnectorEdgeStyle.tsx`, `manage-relationships-diagram.adoc`

#### Edges on edges

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Edges on edges** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: missing
  - What it is: an edge's source or target can be another edge, connected through an invisible, unselectable 5x5 anchor on the host path at a persisted position ratio (edgeAnchorLayoutData, default 0.5); the anchor follows the host path, its handle faces the other end perpendicular to the host segment, and it is excluded from layout to avoid flicker. Only one end can be on an edge (rendered only when the other end is a node). Edge tools can start from or target an edge (e.g. 'E2ToEdge1A'), several edge types can start from one handle, several edges can attach along the same edge, and their handles update when the node or host edge moves. _(Sirius Web)_
  - For Grasp: an edge can start or end on another edge; Grasp's lines join elements only.
  - Sources: `EdgeAnchorNode.tsx`, `edge-on-edge.spec.ts`, `CHANGELOG.adoc`

#### Reconnect composition edges

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Reconnect composition edges** · diagrams / Diagram: selection, editing & direct manipulation · SysON · useful · Grasp: missing
  - What it is: composition edges can be reconnected (since 2024.5.0). Reconnecting the source moves the child under the new source, with a containment-cycle check (warning "Cannot change the owner of X, this would create a containment cycle") and, if the move fails, the warning "Unable to move X in Y: reason" (e.g. reconnecting the source onto a read-only element warns "Unable to move part2 in Part: Unable to move a Element to a read only Element" and no new edge is created); reconnecting the target to another usage moves the old child to the closest containing package and the new target into the source's FeatureMembership, deleting its old owning membership.
  - For Grasp: reconnecting a composition edge moves the child to its new owner; Grasp has no composition edges.
  - Sources: `DiagramMutationToolService.java`, `AbstractUsageNestedUsageEdgeDescriptionProvider.java`, `2024.5.0.adoc`

#### Reconnect connector edges with owner recomputation

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **Reconnect connector edges with owner recomputation** · diagrams / Diagram: selection, editing & direct manipulation · SysON · useful · Grasp: missing
  - What it is: reconnecting a connection, binding (BindingConnectorAsUsage), flow (FlowUsage) or interface (InterfaceUsage) end to another feature node recomputes the best common owner; if it changes the connector moves with info "The connection has been moved to a new owner <qualified name>" and a PartUsage-based connector gets isComposite by whether the new owner is a Type. Both end chains are rebuilt from border-node parents; since 2026.1.0 the services take the graphical source/target nodes, so inherited features shown on another node work. A missing other end warns "Invalid connector: missing target" (or "missing source").
  - For Grasp: reconnecting a connector recomputes its owner; Grasp can't reconnect lines.
  - Sources: `DiagramMutationElementService.java`, `DiagramMutationAQLService.java`, `AbstractFlowUsageEdgeDescriptionProvider.java`
- **Connector reconnection (binding, flow, interface, connection)** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Reconnecting either end of a connector edge recomputes the best common owner from the graphical parents of the two end nodes (ignoring ViewUsages, and using a border node's graphical parent so inherited ports work); if it differs, the connector is moved there (a connector that is a PartUsage becomes composite only when the new owner is a Type) and an info toast says "The connection has been moved to a new owner <qualified name>". The end feature memberships are then rebuilt with fresh feature chains. A connector missing its other end gives the warning "Invalid connector: missing target" (or "missing source") and is left unchanged.
  - For Grasp: dragging a connector end moves it and its owner, with a toast; Grasp can't reconnect line ends.
  - Sources: `DiagramMutationElementService.java`, `GVBindingConnectorAsUsageTests.java`

#### Edge tool with a selection dialog

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Edge tool with a selection dialog** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: An edge-creation tool (SingleClickOnTwoDiagramElementsTool) with a dialogDescriptionId first opens its dialog (unless one is already open), with the variables targetObjectId (the source's semantic element), sourceDiagramElementTargetObjectId and targetDiagramElementTargetObjectId. The edge is created only on confirm, with the dialog's variables; cancelling closes the connector palette. _(Sirius Web)_
  - For Grasp: some edge tools ask for a choice in a dialog first; Grasp's lines need no dialog.
  - Sources: `useSingleClickOnTwoDiagramElementTool.tsx`

#### Add target as nested <Type>

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Add target as nested <Type>** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: One tool per nestable Usage type ("Add target as nested Part", "Add target as nested Attribute", Action, Case, Use Case...), introduced in v2024.11.0. Drawn from a usage to a usage of that exact type, it moves the target under the source with isComposite=true (diamond composition edge, e.g. from PartUsage/ActionUsage to an attribute); in Interconnection View it reveals a suitable compartment on the source. Since v2026.9.0 the connector palette offers exactly one type-specific nesting tool for a Usage target and none for non-Usage targets. A move creating a containment cycle is refused with "Cannot change the owner of X, this would create a containment cycle"; other failures show "Unable to move X in Y: reason".
  - For Grasp: drawing to a usage moves it under the source as a nested usage; Grasp has no reparenting edge tool, only dragging into a box.
  - Sources: `ViewEdgeToolService.java`, `UsageNestedUsageDescriptionService.java`, `2026.9.0.adoc`

#### Reconnect palette tool

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Reconnect palette tool** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: partly
  - What it is: an edge's right-click palette offers a tool to change its source or target. _(Sirius Web)_
  - For Grasp: a palette tool changes an edge's source or target; Grasp's details move a specialization's or typing's end, not other lines'.
  - Sources: `diagram.adoc`

#### Single edge tool auto-invoked

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Single edge tool auto-invoked** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: partly
  - What it is: When only one edge-creation tool applies to the source/target pair, the server returns that tool instead of a palette and the client runs it immediately with no menu. The manuals describe this as the edge-type pop-up appearing only when more than one relationship kind fits. _(Sirius Web)_
  - For Grasp: one valid relationship is created without a menu; Grasp always creates the chosen tool's line.
  - Sources: `ConnectorPalette.tsx`, `useConnectorPaletteContents.types.ts`, `diagram.adoc`

#### Connector palette filtered by target compatibility

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Connector palette filtered by target compatibility** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: partly
  - What it is: In standard view diagrams the connector palette shows only edge tools that accept the selected target node. For example, New Feature Typing is not offered between two Usage nodes but is offered from a Usage to its Definition, and New Satisfy Requirement stays available when the target is a RequirementUsage or SatisfyRequirementUsage. This also applies to nodes contributed by downstream applications. The changelog tells integrators to exclude an SDVConnectorPaletteTargetFilter bean and register their own IDiagramConnectorPaletteCustomizer, but no such class exists in the v2026.11.0 sources. The filtering is done by the precondition LegacyEdgeToolConverter puts on each merged edge tool entry: an isTargetDescription check on the target node's description, AND-ed with the tool's own precondition.
  - For Grasp: the connector menu offers only relationships the target accepts; Grasp refuses a target the line's kind doesn't take.
  - Sources: `2026.11.0.adoc`, `CHANGELOG.adoc` v2026.11.0, `LegacyEdgeToolConverter.java`

#### Standard diagram description invariants

**Grasp: partly** · parts: representations

SysON feature encompassed (1):

- **Standard diagram description invariants** · representations / Studio: language & representation authoring · SysON · useful · Grasp: partly
  - What it is: SysON's standard diagrams guarantee every edge has reconnect tools, labelled edges and nodes have direct edit, every node has delete and graphical drag-and-drop tools, nodes aren't collapsible, the diagram has semantic drag and drop, and composition edges exist for nested and owned usages.
  - For Grasp: every SysON line can be reconnected and every labelled box and line edited and deleted; Grasp edits and deletes, but its README names no dragging a line's end to reconnect it.
  - Sources: `SDVDiagramDescriptionTests.java`

### Layout, alignment and edge routing (22)

Arrange all, pinning, align and distribute tools, edge routing styles, bend points and port placement.

#### Arrange all: Flow Layout

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Arrange all: Flow Layout** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: menu entry "Flow Layout" (AccountTree icon). Runs ELK `layered` with network-simplex layering and node placement; 80 px node-node, between-layer and edge-node spacing; 60 px between disconnected components; center alignment. The direction comes from the diagram description's arrangeLayoutDirection (DOWN on all SysON views, RIGHT by default in Sirius Web). _(Sirius Web)_
  - For Grasp: a layered top-down layout suited to SysML trees; Grasp has no automatic layout.
  - Sources: `useLayoutConfigurations.tsx`, `CHANGELOG.adoc` v2026.1.0

#### Arrange all execution behavior

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Arrange all execution behavior** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: the browser lays out the current nodes and edges with ELK, runs the Sirius layout pass, replaces nodes and edges, then fits the view to all nodes (200 ms animation) and persists the new layout to the server for every subscriber. Pinned nodes keep their position. Edge bend points and handles are handled. Nodes resized by the arrange are not flagged as user-resized, so they can still adapt to their content later. Children stay inside their parents and list order is kept. For edges between border nodes the edge direction is respected (target placed to the right of the source). It no longer fails on edges between a parent and its own child (fixed 2026.7) or on some edge-node configurations. Edges connected to border nodes are included in the ELK input. The layout mutation is not sent in read-only mode. _(Sirius Web)_
  - For Grasp: arrange keeps pinned nodes, nesting and list order, then fits the view; Grasp has no automatic layout.
  - Sources: `useArrangeAll.ts`, `arrange-all.spec.ts`, `CHANGELOG.adoc` v2026.7.0

#### Pin / Unpin elements

**Grasp: missing** · parts: diagrams

SysON features encompassed (2):

- **Pin / Unpin element** · diagrams / Diagram: selection, editing & direct manipulation · Sirius Web · useful · Grasp: missing
  - What it is: on a node the palette's quick-access row offers "Pin" (pin icon), which locks it so arrange-all / re-layout does not move it; on an already pinned node the same tool is "Unpin" (unpin icon). Neither has a key binding. Executed server-side as ordinary palette tools. _(Sirius Web)_
  - For Grasp: pin a node so Arrange all leaves it alone; Grasp has no automatic layout to pin against.
  - Sources: `PaletteDefaultToolsProvider.java`, `diagram.adoc`
- **Pin / Unpin and Unpin all** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: the element palette's quick-access tool labelled "Pin" (pin icon, nodes only, not edges) pins a node; on a pinned node it is labelled "Unpin" (unpin icon). The bundle keys "Pin element"/"Unpin element" are not used by the palette. On a multi-selection the group palette shows Unpin when every selected node is pinned, otherwise Pin. Pinned nodes are not moved by Arrange all or by the align, arrange-in, distribute and justify tools. The diagram toolbar button "Unpin all elements" (Unpin icon, `unpin-all-elements`, disabled when read-only) unpins every node in one `pinDiagramElement(..., false)` request covering all non-utility nodes and all edges. Unlike hide and fade, a failed pin or unpin request shows no toast (the pin hook has no error handling, although the bundle has an unused usePinDiagramElements error message). A pinned node also ignores drag moves and shows no helper lines when the user tries to move it (2024.3, 2024.9), and pinned elements are no longer unpinned unintentionally (2024.5). The Filter elements panel marks pinned nodes with a pin icon and can pin or unpin checked nodes. _(Sirius Web)_
  - For Grasp: pin nodes against Arrange all and layout tools; Grasp has no automatic layout to pin against.
  - Sources: `pin.spec.ts`, `PaletteDefaultToolsProvider.java`, `CHANGELOG.adoc` v2024.9.0

#### Layout section of the group palette

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Layout section of the group palette** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: with more than one element selected, the palette (the simplified toolbar shown on a multi-selection) has a "Layout" entry (section id `layout_section`). It opens a vertical sub-list headed by a "Layout" back entry (NavigateBefore arrow, test id `back-layout`, focused on open) that returns to the main palette list, followed by 14 tools, each with an MUI icon, a right-side tooltip repeating its label and a test id `tool-<label>`, in six divider-separated groups: Align left, Align center, Align right / Align top, Align middle, Align bottom / Arrange in row, Arrange in column, Arrange in grid / Distribute horizontal spacing, Distribute vertical spacing / Justify horizontally, Justify vertically / Make same size. Selected edges are ignored, and so are selected nodes whose parent is a list node (list compartment items). The reference node is the last-selected node, which the canvas marks with a differently colored (pink, rounded) set of corner (angle) selection handles (since 2026.1). When several nodes are caught at the same time by a rectangle (lasso) selection, only the node closest to the cursor becomes the last-selected one (since 2026.9; before, aligned nodes could all be marked). If fewer than 2 eligible nodes remain, or the last-selected node is not among them, the sub-list renders nothing even though the Layout entry was shown. _(Sirius Web)_
  - For Grasp: a Layout menu of align, arrange, distribute and size tools for several nodes; Grasp has no multi-selection.
  - Sources: `GroupPaletteLayoutSection.tsx`, `group-selection.spec.ts`, `CHANGELOG.adoc` v2026.9.0

#### Align left / Align center / Align right

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Align left / Align center / Align right** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: sets each selected node's x so that its left edge, horizontal center or right edge matches the reference (last-selected) node's, keeping the other coordinate. _(Sirius Web)_
  - For Grasp: align selected nodes left, centre or right on the last selected; Grasp has no align tools.
  - Sources: `useDistributeElements.ts`, `node-layout-tool.spec.ts`, `diagram.adoc`

#### Align top / Align middle / Align bottom

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Align top / Align middle / Align bottom** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: sets each selected node's y so that its top edge, vertical center or bottom edge matches the reference (last-selected) node's, keeping the other coordinate. _(Sirius Web)_
  - For Grasp: align selected nodes top, middle or bottom; Grasp has no align tools.
  - Sources: `useDistributeElements.ts`, `node-layout-tool.spec.ts`, `diagram.adoc`

#### Distribute horizontal spacing / Distribute vertical spacing

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Distribute horizontal spacing / Distribute vertical spacing** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: keeps the first and last node (by x or by y) fixed and moves the nodes in between so the gaps between consecutive nodes are equal. Needs at least 3 nodes sharing the same parent and silently does nothing otherwise. Pinned nodes are not moved, and selected edges are ignored. _(Sirius Web)_
  - For Grasp: even out the gaps between three or more nodes; Grasp has no distribute tools.
  - Sources: `useDistributeNodesOnGap.ts`, `CHANGELOG.adoc` v2024.5.0

#### Adjust size

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Adjust size** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: palette quick-access tool "Adjust size" (id `adjust-size`), offered on every node, alone or on a multi-selection (group palette, since 2026.1). It runs on the client: it clears the resizedByUser flag of the target nodes (and of all children of a target list node), re-runs the layout so each node shrinks or grows back to max(default size, content minimum) (e.g. back to 150x70 after an oversized manual resize), and persists the new layout. On a list node whose width was reduced below the default, it restores the default width. On SysON Package nodes it resizes the package to its content (fixed in SysON 2024.7.0). _(Sirius Web)_
  - For Grasp: shrink a node back to fit its content; Grasp's boxes always fit their content, so there is nothing to adjust.
  - Sources: `useAdjustSize.tsx`, `adjust-size.spec.ts`, `PaletteDefaultToolsProvider.java`

#### Smart Manhattan (obstacle-avoiding) edges

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Smart Manhattan (obstacle-avoiding) edges** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web, experimental · useful · Grasp: missing
  - What it is: a SmartManhattan edge routes around nodes with jump-point pathfinding (no diagonal moves) on a 10 px grid. The obstacles are the source and target, their siblings and ancestors' siblings up to the lowest common ancestor, and the parents of border-node ends, each padded by 5 px. Handle coordinates are rounded to the nearest 10 px, and the label sits at the middle of the path. If no path is found it falls back to a plain smooth-step path. These edges have no editable bend points. Routes are computed on the client and not persisted. The Sirius Web manual lists a "Smart Edges" toolbar entry; no such toolbar toggle exists in the v2026.11.0 code, so the routing is reached through Edge Type. _(Sirius Web; experimental)_
  - For Grasp: edges route round nodes in the way; Grasp's lines may cross boxes.
  - Sources: `SmartStepEdgeWrapper.tsx`, `getSmartEdge.ts`, `diagram.adoc`

#### Oblique edges with editable bend points

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Oblique edges with editable bend points** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: an Oblique edge is a straight polyline from the source through its bend points to the target, set by the style or from the Appearance palette. When it is selected, each bend point shows as a black dot and each segment midpoint as a white dot with a black outline. Dragging a midpoint inserts a new bend point; dragging a bend point moves it and recomputes the midpoints. On release the bend points (absolute, and relative to the source) are persisted. _(Sirius Web)_
  - For Grasp: straight polylines with draggable bend points; Grasp's lines have no bend points.
  - Sources: `ObliqueEdgeWrapper.tsx`, `MultiLabelObliqueEditableEdge.tsx`, `CHANGELOG.adoc` v2026.1.0

#### Edges avoid passing through other nodes

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Edges avoid passing through other nodes** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: edge routing uses a pathfinding algorithm so that edges do not pass through other nodes, and an edge between a child and its parent no longer passes entirely through the child. _(Sirius Web)_
  - For Grasp: edges avoid passing through other nodes; Grasp's lines go straight across.
  - Sources: `CHANGELOG.adoc` v2024.5.0, `CHANGELOG.adoc` v2024.9.0

#### Multiple edges and self-loops

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Multiple edges and self-loops** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: several edges between the same nodes and self-loop edges are laid out properly. _(Sirius Web)_
  - For Grasp: parallel edges and self-loops are drawn apart; Grasp refuses a line to the same element and routes two lines between one pair the same way.
  - Sources: `CHANGELOG.adoc` v2022.01.0

#### Rectilinear bend point dragging

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Rectilinear bend point dragging** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: a selected Manhattan edge shows its bend points as black dots (`bend-point-N`). Dragging one moves its neighbours with it so every segment stays orthogonal. Dragging the first or last point slides the edge end along the source or target side. Dragging that point beyond the node's side creates a new bend point, and the handle jumps to the middle of the side facing the drag. _(Sirius Web)_
  - For Grasp: drag bend points while keeping segments orthogonal; Grasp has no bend points.
  - Sources: `useBendingPoints.ts`, `RectilinearEdgeCalculation.ts`, `BendPoint.tsx`

#### Rectilinear segment dragging

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Rectilinear segment dragging** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: each segment of a selected Manhattan edge has an invisible draggable strip (`temporary-moving-line-N`; cursor ns-resize on horizontal segments, ew-resize on vertical ones) that moves the whole segment perpendicular to itself. The edge's handles are hidden during the drag. Dragging the first or last segment slides the edge end along the node side, which is also how an edge end is moved along a node border, and dragging it past the node side adds a bend point at the middle of the node border. Moving a middle segment leaves the source handle where it was on its node side. _(Sirius Web)_
  - For Grasp: drag a whole segment sideways; Grasp has no segment editing.
  - Sources: `useTemporaryLines.ts`, `BendPoint.tsx`, `edge.spec.ts`

#### Reset bending points

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Reset bending points** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: palette quick-access tool "Reset bending points" (id `reset-bending-points`; the manual calls it "Reset edge path"), offered on an edge that has stored bend points. It removes the bend points of the target edges, which return to automatic routing, and persists the layout. It is not offered once the edge has none, e.g. after Arrange all dropped the single bend point of an oblique edge. _(Sirius Web)_
  - For Grasp: reset an edge to automatic routing; Grasp's lines are always automatic.
  - Sources: `useEditableEdgePath.ts`, `PaletteDefaultToolsProvider.java`, `arrange-all.spec.ts`

#### Handle ordering on a node side

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Handle ordering on a node side** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: each edge has its own handle. When several edges attach to the same side of a node, their handles are spread evenly along it and ordered by the position of each edge's other-end node center: by x on the top and bottom sides, by y on the left and right sides. After a node is moved, the handles are repositioned this way, which reduces crossings. _(Sirius Web)_
  - For Grasp: several edges on one side spread out in order to cut crossings; Grasp's lines all aim at the box centre.
  - Sources: `layoutHandles.ts`, `ConnectionHandles.tsx`, `CHANGELOG.adoc` v2024.1.0

#### Edge crossing tunnels (cross-fade gaps)

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Edge crossing tunnels (cross-fade gaps)** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: wherever two edges really cross, the edge drawn underneath gets an 18 px gap (a stroke-dasharray with round caps), so it looks as if it passes under the other. The under edge is the one with the lower zIndex, otherwise the one whose id sorts higher. Crossings within 18 px of a path end or 12 px of an end node are ignored, as are touching or colinear segments. Hidden edges and edges that already have a dash pattern are skipped. Detection is O(E^2) and runs after a drag ends, never during it, to keep interactions smooth. Hiding a node so that the crossing disappears removes the tunnel; "Reveal hidden elements" restores it. _(Sirius Web)_
  - For Grasp: a gap in the lower edge where two edges cross makes crossings readable; Grasp draws crossings plain.
  - Sources: `detectEdgeCrossings.ts`, `buildCrossingDashArray.ts`, `edge.spec.ts`

#### Border node side follows connected edges

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Border node side follows connected edges** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: missing
  - What it is: on refresh and as nodes move, a border node the user has not moved switches to the side of its parent facing the other end of its edge (left, right, top or bottom), which simplifies paths, and is re-stacked on that side with a 10 px gap. Hidden edges are ignored when choosing the side. A border node moved by the user keeps its side, and its handle uses that side. _(Sirius Web)_
  - For Grasp: a port flips to the side facing its edge's other end; Grasp keeps the side it was placed on.
  - Sources: `layoutHandles.ts`, `layoutBorderNodes.ts`, `border-node.spec.ts`

#### SysON views' layout settings

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **SysON views' layout settings** · diagrams / Diagram: layout, arrangement & edge routing · SysON · useful · Grasp: partly
  - What it is: the General View, Interconnection View, Action Flow View and State Transition View descriptions all set arrangeLayoutDirection DOWN, so Arrange all (Flow Layout) and edge handles work top to bottom. They also set layoutOption NONE, so no automatic layout runs on open or when elements are created, keep the minimap visible, and use the default diagram toolbar.
  - For Grasp: SysON views lay out top to bottom and never auto-arrange on open; Grasp also never auto-arranges, but has no layout direction.
  - Sources: `SDVDiagramDescriptionProvider.java`, `ActionFlowViewDiagramDescriptionProvider.java`, `InterconnectionViewDiagramDescriptionProvider.java`

#### Edge Type option

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Edge Type option** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: partly
  - What it is: in the edge palette's Appearance section, the "Edge Type" select switches routing between "Manhattan", "Smart Manhattan" and "Oblique". The style's edgeType selects the renderer, and Manhattan is the fallback for unknown values. Changing or resetting it removes the edge's custom bend points and layout data, so a Manhattan edge with bend points switched to Oblique becomes a straight line. SysON's edge descriptions set no edge type, so SysON edges are Manhattan by default. _(Sirius Web)_
  - For Grasp: switch an edge between Manhattan, Smart Manhattan and Oblique; Grasp routes each line kind straight or as an elbow, with no per-line choice.
  - Sources: `EdgeAppearancePart.tsx`, `convertEdge.ts`, `appearance.spec.ts`

#### Automatic handle side selection

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Automatic handle side selection** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: partly
  - What it is: each edge end attaches to the side of its node that faces the other end. With a vertical arrange direction (DOWN/UP), angles between 30 and 150 degrees (and their opposites) pick top or bottom, otherwise left or right. With a horizontal direction (RIGHT/LEFT), angles up to 60 degrees or from 300 degrees pick left or right. With UNDEFINED, the larger of dx and dy decides. In practice RIGHT gives horizontal edges and DOWN vertical ones; all SysON views use DOWN. An edge between a container and its descendant uses the inner side. A border node uses its own side, or the opposite side when the other end is inside its parent. With bend points, the side faces the first or last bend point. _(Sirius Web)_
  - For Grasp: an edge leaves the side of a node facing its other end; Grasp's elbows pick facing sides, straight lines leave the border toward the other centre.
  - Sources: `EdgeLayout.ts`, `edge-handle.spec.ts`, `layoutParams.ts`

#### Border node default placement and parent resize

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Border node default placement and parent resize** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: partly
  - What it is: a border node without a stored position honors its initial side and is stacked along that side, starting 8 px from the corner with 25 px spacing, overlapping the parent border by 5 px (e.g. north at y=-15, east at x=parentWidth-5, size 20). Dragging one slides it along the parent border. When the parent is resized, each border node stays on its side: EAST ports follow the right edge and SOUTH ports the bottom edge, ports beyond the new size are pulled back inside, and the extents are updated. Border nodes have no resize handles. _(Sirius Web)_
  - For Grasp: ports stack along a side and stay put when the owner resizes; Grasp keeps ports on the border, with no stacking rule or owner resizing.
  - Sources: `layoutNode.ts`, `useResizeChange.ts`, `border-node.spec.ts`

### Show, hide, fade and filter (18)

Controlling what a diagram shows: hide, fade, filters, manage visibility and adding existing elements.

#### Reveal hidden elements

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Reveal hidden elements** · diagrams / Diagram: visibility, filtering & presentation · Sirius Web · useful · Grasp: missing
  - What it is: the toolbar button "Reveal hidden elements" (VisibilityOff icon) un-hides every node (except utility nodes) and every edge of the diagram in one `hideDiagramElement(..., false)` request (test id `reveal-hidden-elements`). Revealed edges keep their path. A failed request shows the toast "An unexpected error has occurred, please refresh the page", and server messages in the payload are shown as toasts. It is disabled on read-only diagrams. The Sirius Web manual calls it "Show hidden elements". Because the request covers every node, hidden or not, in SysON it also reveals every compartment that is hidden by default, so all definition and usage nodes open up; in a General View, SysON's show/hide handler then hides the background tree nodes whose element is now listed in a revealed compartment. _(Sirius Web)_
  - For Grasp: one button brings every hidden element and compartment back; Grasp has no hiding, only Remove from view and the Show list.
  - Sources: `DiagramToolbar.tsx`, `edge.spec.ts`, `manage-toolbar-diagram.adoc`

#### Filter elements button

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Filter elements button** · diagrams / Diagram: visibility, filtering & presentation · Sirius Web · useful · Grasp: missing
  - What it is: a "Filter elements" toolbar button (FilterList icon), contributed through the toolbar action slot after "Manage selection", opens a drop-down menu anchored on the button (test id `filter-elements`, aria-label "Filter elements"; it closes on a click outside) holding the diagram filter form for the current diagram. It is disabled when the diagram is read-only, keeps its collapsed state when the diagram refreshes, and is no longer hidden behind the right-side panel. The manual describes it as applying visual filters so the diagram focuses on matching elements. SysON's manual also uses it to reveal a hidden ViewUsage view frame. _(Sirius Web)_
  - For Grasp: a toolbar menu to filter what a diagram shows; Grasp's views have no filter panel.
  - Sources: `DiagramFilter.tsx`, `DefaultExtensionRegistry.tsx`, `CHANGELOG.adoc` v2025.10.0

#### Filter elements panel: element tree and selection

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Filter elements panel: element tree and selection** · diagrams / Diagram: visibility, filtering & presentation · Sirius Web · useful · Grasp: missing
  - What it is: the form (live subscription `diagramFilter://?objectIds=[<diagramId>]`) has the group title "Filter elements" and the caption "Elements on diagram". A master checkbox labelled "<n> element selected" or "<n> elements selected" checks or unchecks every node; it shows checked as soon as at least one node is checked. Below it is a checkbox tree of the diagram's nodes in their containment hierarchy, which opens fully collapsed. Each node is labelled with its inside label, else its first outside label, else its target object's label. The form is read-only when the user lacks edit capability on the project, and the panel shows nothing until the form has loaded. Only the first group of the form is rendered. _(Sirius Web)_
  - For Grasp: a checkbox tree of everything on the diagram to act on in bulk; Grasp's Show list lists only what isn't shown.
  - Sources: `DiagramFilterForm.tsx`, `DiagramFilterDescriptionProvider.java`, `messages.properties`

#### Filter elements panel: bulk actions

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Filter elements panel: bulk actions** · diagrams / Diagram: visibility, filtering & presentation · Sirius Web · useful · Grasp: missing
  - What it is: a split button labelled "Apply to <n> selected element(s):" applies one action to every checked node. Each action has its own icon and help text: Hide ("Hide selected elements"), Show ("Show selected elements"), Fade ("Fade selected elements"), Reveal faded elements ("Reveal selected faded elements"), Collapse ("Collapse selected elements"), Expand ("Expand selected elements"), Pin ("Pin selected elements") and Unpin ("Unpin selected elements"). Show is how hidden elements are brought back selectively. The buttons are white with dark-blue (#261E58) text; Hide and Show use HideTool.svg and ShowTool.svg, the others the diagram's collapse, expand, fade, reveal-faded, pin and unpin icons; and each sends the matching diagram input (e.g. HideDiagramElementInput) for the checked nodes. The action list is extensible: each action is contributed by an IDiagramFilterActionContributionProvider bean. _(Sirius Web)_
  - For Grasp: hide, show, fade, collapse or pin checked nodes in one go; Grasp has no bulk visibility actions.
  - Sources: `DiagramFilterDescriptionProvider.java`, `HideButtonDescriptionProvider.java`, `messages.properties`

#### Diagrams Options menu

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Diagrams Options menu** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: missing
  - What it is: SysON appends a small down-arrow (KeyboardArrowDown) icon button to the diagram toolbar, with the tooltip "Diagrams Options" shown on its right. It opens a fading popper below it with three checkboxes: "Show Icons", "Show Inherited Members" and "Show Inherited Members from Standard Libraries". The arrow greys out while the popper is open. Clicking outside closes it, and focus then returns to the button. Each checkbox's tooltip appears on its left. The button has test id `syson-diagram-panel-menu-icon` (aria-haspopup) and the popper `syson-diagram-panel-menu`. SysON's manual calls these "SysML actions"; the changelog called them "Show/Hide Icons in Diagrams", "Show/Hide Inherited Members in Diagrams" and "Show/Hide Inherited Members from Standard Libraries in Diagrams" actions in the Diagram Panel.
  - For Grasp: a toolbar menu of SysML display switches; Grasp has no per-diagram display options menu.
  - Sources: `SysONDiagramPanelMenu.tsx`, `SysONExtensionRegistry.tsx`, `manage-toolbar-diagram.adoc`

#### Show content as Nested / as Tree

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (3):

- **Show content as Nested / Show content as Tree** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: missing
  - What it is: two extra Show/Hide tools on definition and usage nodes (both with the ShowTool.svg icon), offered only when the diagram is a General View. "Show content as Tree" hides all of the node's child nodes (its compartments) and reveals the target node of every edge leaving it, so the content shows as separate nodes. "Show content as Nested" reveals the compartments that have at least one graphical child (it does not hide the empty ones) and hides the target node of every edge leaving the node, so the content shows nested inside the node. The code does not check the edge kind: targets of any outgoing edge (not only composition edges, e.g. also a subclassification or typing edge drawn from the node) are revealed or hidden. Example: on an action, Show content as Nested hides the composed sub-action's background node and reveals every compartment containing it.
  - For Grasp: switch a node's content between nested compartments and separate tree nodes; Grasp always nests what a box holds.
  - Sources: `AbstractNodeDescriptionProvider.java`, `DiagramMutationElementService.java`, `GVNestedAndTreeVisibilityTests.java`
- **Show content as Nested** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Node palette tool (Show/Hide section, icon ShowTool.svg, offered only when the node is in a General View, checked with isView on the selected node) that hides every node linked to the selected node by a composition edge and shows them as nested nodes inside it.
  - For Grasp: turns a tree of composition edges into boxes nested in their owner; Grasp always nests and can't switch.
  - Sources: `AbstractNodeDescriptionProvider.java`, `CHANGELOG.adoc` v2025.12.0
- **Show content as Tree** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Node palette tool (icon ShowTool.svg, General View only) that turns the nodes nested inside the selected node into separate nodes linked to it by composition edges, hiding the nested versions.
  - For Grasp: turns nested boxes into separate nodes linked by composition edges, the classic decomposition tree; Grasp only nests.
  - Sources: `AbstractNodeDescriptionProvider.java`, `CHANGELOG.adoc` v2025.12.0

#### Fade / Unfade elements

**Grasp: missing** · parts: diagrams

SysON features encompassed (2):

- **Fade / Unfade quick tool** · diagrams / Diagram: visibility, filtering & presentation · Sirius Web · useful · Grasp: missing
  - What it is: the quick-access Fade tool dims the selected nodes and edges to 0.4 opacity without hiding them. On an element that is already faded the same tool is labelled Unfade and restores it; on a group selection it shows Unfade when any selected element is faded. The toolbar's Reveal faded elements unfades everything. _(Sirius Web)_
  - For Grasp: dim elements to 40% to focus on the rest; Grasp has no fading.
  - Sources: `PaletteDefaultToolsProvider.java`, `GroupPaletteDefaultToolsProvider.java`, `palette.spec.ts`
- **Faded element rendering** · diagrams / Diagram: visibility, filtering & presentation · Sirius Web · useful · Grasp: missing
  - What it is: elements whose state is Faded are drawn at 40% opacity: nodes, their labels, and edges (stroke and labels). The faded flag comes from the backend view modifier (Normal, Faded, Hidden). _(Sirius Web)_
  - For Grasp: faded elements drawn at 40% opacity; Grasp has no fading.
  - Sources: `FreeFormNode.tsx`, `MultiLabelEdge.tsx`, `Label.tsx`

#### Manage visibility eye icon

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **Manage visibility node action (eye icon)** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: missing
  - What it is: hovering a node header shows an eye icon at its top-right, titled "Manage visibility" (action id `siriusweb_manage_visibility`). It opens the Manage visibility modal for that node at the click position. In SysON the action is offered only in the General View, on nodes that have child nodes and represent a SysML Definition or Usage drawn with a General View element node description ("simple node"). Since v2026.9.0 it replaces the removed per-node expand/collapse tools.
  - For Grasp: an eye icon on a node header opens its visibility menu; Grasp has no per-node visibility control.
  - Sources: `ManageVisibilityNodeActionProvider.java`, `SiriusWebManageVisibilityNodeAction.tsx`, `flashlight.adoc`
- **Manage visibility eye icon (General View only)** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: The node header eye action ("Manage visibility", id `siriusweb_manage_visibility`) is offered only in diagrams of the "General View" description, on nodes that have child nodes, represent a SysML Definition or Usage and use a "GV Node " description (not compartments or custom nodes). Its kebab menu adds "Reveal valued content only" (shows the compartments that have content, hides empty ones) for any node with children.
  - For Grasp: an eye icon on a node header picks which compartments show; Grasp shows every compartment that has content.
  - Sources: `ManageVisibilityNodeActionProvider.java`, `ManageVisibilityRevealValuedContentAction.java`

#### Manage visibility modal

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Manage visibility modal** · diagrams / Diagram: visibility, filtering & presentation · Sirius Web · useful · Grasp: missing
  - What it is: a floating panel, 200 px wide with a 10 px rounded border, titled "Manage visibility". It has a "Close" (X) button, a search field, an "All" checkbox with a kebab menu, and a scrollable list (max 220 px) of the node's direct child nodes, e.g. compartments such as "require constraints", "items" or "state transition". Each list item (`manage_visibility_list_item_button_<name>`) has a checkbox that is checked while the child is visible. The panel opens at the click point, shifted left/up to stay inside the diagram, and cannot be dragged. It stays in sync with live diagram changes and closes on the X button or a pointer-down outside it. The node action and modal were added in 2025.6 and the modal's UI was reworked in 2026.1. _(Sirius Web)_
  - For Grasp: a small panel of a node's compartments with checkboxes to show or hide each; Grasp shows every compartment that has content.
  - Sources: `ManageVisibilityNodeAction.tsx`, `ManageVisibilityModalListItems.tsx`, `useGetUpdatedModalPosition.tsx`

#### Manage visibility: toggle a child

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Manage visibility: toggle a child** · diagrams / Diagram: visibility, filtering & presentation · Sirius Web · useful · Grasp: missing
  - What it is: clicking a child entry hides it if it is visible, or reveals it if it is hidden. _(Sirius Web)_
  - For Grasp: click a compartment entry to toggle it; Grasp's compartments can't be toggled.
  - Sources: `ManageVisibilityNodeAction.tsx`, `PlaywrightNode.ts`

#### Manage visibility menu: Reveal valued content only

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Manage visibility menu: Reveal valued content only** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: missing
  - What it is: SysON adds "Reveal valued content only" to the menu of any node with children. It reveals the child compartments and items that contain at least one child and hides the empty ones, like the "Show valued content" palette tool. Unlike that tool it looks only at child nodes (not border nodes), it hides the empty ones instead of leaving them, and a compartment whose items are all hidden still counts as valued (action id `manage_visibility_menu_reveal_valued_content_action`).
  - For Grasp: show only the compartments with content; Grasp already shows only non-empty compartments, without a menu.
  - Sources: `ManageVisibilityRevealValuedContentAction.java`, `ManageVisibilityRevealValuedContentHandler.java`, `GVManageVisibilityTests.java`

#### Add existing connected elements

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **Add existing connected elements** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: missing
  - What it is: General View only. "Add existing connected elements", in the Related Elements section of nodes and compartments (a compartment uses its enclosing element), shows the existing project elements linked to the selection by incoming or outgoing relationships the General View supports, and adds both edge endpoints. It creates no semantic elements and never imports standard-library elements. Elements that could appear as ports or inside a selected node's compartment are not added as separate nodes, even when that compartment is hidden, and the tool does not reveal it. Since v2026.11.0 the `addExistingConnectedElements` service takes the semantic elements and the selected graphical nodes, so filtering applies to the whole selection.
  - For Grasp: add every element connected to the selection by a relationship; Grasp's Show list has no connected-elements option.
  - Sources: `ConnectedElementsToolTest.java`, `ConnectedElementRepresentationFilterTest.java`, `CHANGELOG.adoc` v2026.11.0
- **Add existing connected elements** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Related Elements tool (AddReferencedElements.svg) offered only on General View nodes, in the node palette and in the group palette for multi-selections (not when edges are selected); from a compartment it uses the enclosing element. It scans the project's resources (excluding standard libraries, importing nothing) for elements connected to the selection in either direction through supported relationships (allocation, flow, connector, transition, satisfy, include use case, feature value, framed concern, requirement constraint, annotation, dependency, feature typing, redefinition, reference subsetting, subsetting, subclassification, plus owner/owned usages), follows connections not containment, creates no semantic element, and exposes each such element as a top-level node with its edges when possible. Elements that could be shown as border nodes or inside a compartment or container of a selected node are skipped even when that compartment is hidden (it is not revealed); existing representations are kept (v2026.11.0).
  - For Grasp: shows every element linked to the selection, edges included; Grasp's Show list adds elements one by one.
  - Sources: `ToolDescriptionService.java`, `DiagramMutationExposeService.java`, `manage-existing-elements.adoc`

#### Related Elements section on nodes

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Related Elements section on nodes** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: Offers 'Add existing nested elements' and 'Add existing nested elements (recursive)', which expose the element's content (recursively for the second). In General Views only it also offers 'Add existing connected elements', which adds elements connected through inbound or outbound relationships, excluding elements displayable as ports or already inside the node (2026.11). It follows connections, not containment, and never creates semantic elements or imports from standard libraries. Elements that could be shown inside a selected node's compartments are skipped even when those compartments are hidden, and the tool does not reveal them. It is also offered on a node's compartment, using the enclosing element as the selection. From a multi-selection it considers connections to every selected node. Existing representations are kept.
  - For Grasp: show an element's nested or connected elements from its palette; Grasp's Show list has no nested or connected option.
  - Sources: `ToolDescriptionService.java`, `manage-existing-elements.adoc`, `2026.11.0.adoc`

#### Background Related Elements and New Comment

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Background Related Elements and New Comment** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: The background palette ends with a 'Related Elements' section ('Add existing elements', 'Add existing elements (recursive)') and has a section-less 'New Comment' tool.
  - For Grasp: add existing members and comments from the background palette; Grasp's Show list adds one element, with no comments.
  - Sources: `SDVDiagramDescriptionProvider.java`, `ToolDescriptionService.java`

#### Edge Show/Hide section

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Edge Show/Hide section** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: partly
  - What it is: every SysON edge palette has a "Show/Hide" section with a single "Hide" tool that hides the selected edge.
  - For Grasp: hide an edge from its palette; Grasp's defined-by line can be undrawn from the details, other lines can't be hidden.
  - Sources: `DiagramDefaultToolsFactory.java`, `AbstractEdgeDescriptionProvider.java`, `CHANGELOG.adoc` v2026.9.0

#### Avoid duplicate nodes on creation and expose

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Avoid duplicate nodes on creation and expose** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: partly
  - What it is: when an element is created or exposed from a node in the General View, SysON hides its separate node if one of the parent's visible compartments can list it or a border node can represent it. Control nodes are always hidden in that case. Attribute, port, subject and item usages (items not owned by an action) are hidden whenever any compartment or border could host them. So an attribute created on a part, part definition or action shows only in its "attributes" compartment, a port created on a part or part definition shows only as a border node, while an item created on a part shows as a separate node on the background. Introduced in 2025.12.0 ("not display them twice"): when no compartment of a node is displayed, a nested element created from it appears on the diagram background, linked to it by a composition edge; an Explorer drop onto the node follows the same rule, and lands in a visible candidate compartment when there is one.
  - For Grasp: new attributes go in a compartment, ports on the border, rather than twice; Grasp puts ports on the border and nests parts, with no composition-edge layout.
  - Sources: `DiagramMutationExposeService.java`, `GVNestedAndTreeVisibilityTests.java`, `CHANGELOG.adoc` v2025.12.0

#### Add existing elements in a compartment

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Add existing elements in a compartment** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: partly
  - What it is: running Related Elements > Add existing elements in a compartment, e.g. the "action flow" compartment of an action, displays the model's existing child elements (e.g. actions created from textual SysML) in that compartment. After "Delete from diagram" on a nested action, Add existing elements on the parent's action flow compartment shows it only in that compartment.
  - For Grasp: fill a compartment with existing children, such as actions written in text; Grasp's Show list nests an element in its shown owner.
  - Sources: `flashlight.adoc`, `GVAddExistingElementsTests.java`, `ToolDescriptionService.java`

#### Per-view display rules for tree nodes

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Per-view display rules for tree nodes** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: partly
  - What it is: each view kind limits which exposed elements become nodes. The General View shows root elements, or elements directly owned by their parent node; a package's elements show unless they live in a sub-package. The Action Flow View shows only ActionUsage and ActionDefinition, and the State Transition View only StateUsage and StateDefinition. Other views exclude indirectly nested elements. Attributes appear only in the General View. Documentation is a node only when owned by a Package, NamespaceImport or ViewUsage. Packages are never shown in Action Flow or State Transition views. Subject ReferenceUsages are always allowed.
  - For Grasp: each view kind shows only elements that suit it; Grasp's palette and Show list follow the view kind, with its own rules.
  - Sources: `ViewFilterSwitch.java`, `DiagramQueryExposeService.java`

### Contextual palette UI (16)

The right-click palette itself: targets, quick tools, sections, search, keyboard and group palettes.

#### Close button, click-away and Escape

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Close button, click-away and Escape** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: A small X icon button (tooltip 'Close', testid `Close-palette`) at the right of the header closes the palette; it replaced an earlier arrow close button in the header. Pressing the pointer anywhere outside the palette closes it (click-away on pointer down). Escape inside the palette closes it and stops the key event so it does not reach the diagram. Invoking any tool also closes it, and focus returns to the diagram. _(Sirius Web)_
  - For Grasp: close the palette with X, a click away or Escape; Grasp's Escape puts a tool down, no popup to close.
  - Sources: `Palette.tsx`, `DiagramPalette.tsx`, `sirius-components-palette.json`

#### Quick-access tool bar

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Quick-access tool bar** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: Below the header sits a horizontal row of icon-only quick-access tools that run directly without opening a section. Each icon is at least 24x24, with small gaps; the row scrolls horizontally and never wraps, and a divider follows it. Each icon shows the tool label as a tooltip, and clicking it runs the tool. Frontend-contributed quick tools for the representation kind are appended. The bar is hidden when it has no tools. The backend supplies the tools as the palette's quickAccessTools; SysON puts tools such as Delete, Edit and 'New Attribute' there (the flashlight tutorial uses 'New Attribute' on a part to add 'fov:Real' and 'illuminationLevel:Real'). Quick-access icons carry the testid '<label> - Tool' (e.g. 'Pin - Tool', 'Delete from model - Tool'), whereas section tools use 'tool-<label>'. SysON's 2025.1 release notes present them as shortcuts for actions such as delete and edit. The tooltip is only the icon image's native title attribute, not a styled tooltip. A quick tool whose icon list is empty still renders as a blank 24px clickable cell. Quick-access tools are never part of the palette search results, and they are never shown as the last used tool. _(Sirius Web)_
  - For Grasp: a row of icon shortcuts such as Edit, Hide and Delete atop the palette; Grasp's panel has Edit label, Remove from view and Delete buttons.
  - Sources: `PaletteQuickAccessToolBar.tsx`, `Tool.tsx`, `flashlight.adoc`

#### Tool sections with drill-down navigation

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Tool sections with drill-down navigation** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: Tool sections (defined in the palette of diagram, node and edge descriptions) appear as list entries with an ellipsized label (full label in a right tooltip) and a '>' chevron. Clicking one slides that section's tools in from the side. A bold, autofocused header row ('<' plus the section title) goes back with a slide-right animation. A history stack makes nested sections return to the previous level. Tool names can span several lines, and an unfolded section always stays visible above the rest of the palette. Section entries never show an icon: the entry renders only the label and the chevron, although the API carries an iconURL (View-based sections send an empty list). _(Sirius Web)_
  - For Grasp: tool sections that drill down with a back row; Grasp's palette is one flat row grouped by rules.
  - Sources: `PaletteToolSection.tsx`, `ToolSectionEntry.tsx`, `ToolSectionHeader.tsx`

#### Last used tool pinned at the top

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Last used tool pinned at the top** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: Each palette remembers the last tool invoked from it, keyed by palette id (per kind of diagram element) and held in a React context for the browser session. It shows that tool as the first entry, above a divider, so the same creation (e.g. 'New Package') can be repeated in one click. This pinned row sits outside the sliding list, so it stays visible while the user drills into a tool section or an extension section. The lookup searches only the palette's top-level entries, its tool sections and the frontend-contributed tools. If the remembered tool is not in the current palette, nothing is pinned; an older changelog entry described it as shown disabled instead. A quick-access tool is recorded but never shown as last used. Overridden tools must call `onInvoked()` to register (fixed for tree palette overrides), and the feature applies to diagram and tree palettes. Reuse became more reliable in 2026.7. The palette id this relies on is deprecated in the GraphQL types. _(Sirius Web)_
  - For Grasp: the last tool used sits at the top for one-click repeats; Grasp puts a tool down after each use.
  - Sources: `PaletteContext.tsx`, `PaletteToolSection.tsx`, `2026.7.0.adoc`

#### Extension sections: Appearance, Layout, Show in

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Extension sections: Appearance, Layout, Show in** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: After the backend tools, the palette root lists built-in entries: 'Appearance' (at least one element selected), 'Layout' (more than one element selected) and 'Show in' (at least one element selected). None appear when the palette is opened on the background. Each opens an embedded sub-list inside the palette, starting with a bold back entry (NavigateBefore icon, tooltip repeating the section title) that returns to the main list and receives initial focus. The 'Layout' sub-list holds, in divider-separated groups: 'Align left', 'Align center', 'Align right' | 'Align top', 'Align middle', 'Align bottom' | 'Arrange in row', 'Arrange in column', 'Arrange in grid' | 'Distribute horizontal spacing', 'Distribute vertical spacing' | 'Justify horizontally', 'Justify vertically' | 'Make same size'. Each Layout entry has a small MUI icon (AlignHorizontalLeft/Center/Right, AlignVerticalTop/Center/Bottom, ViewColumn, ViewStream, ViewModule, a rotated VerticalAlignCenter for the horizontal distribution, JustifyHorizontal/Vertical, PhotoSizeSelectSmall) and the testid 'tool-<label>'; the back entries are 'back-layout' and 'back-Appearance'. The Layout entries run on the client and leave the palette open, so several can be applied in a row. Children of list (compartment) nodes are dropped from the operated set. The node flagged as last selected is the reference for the align, justify and make-same-size entries; the manual notes it is shown with a different handle color. When fewer than two eligible nodes remain, or the last-selected node is not among them, the Layout sub-list renders nothing at all, not even its back entry, so the user must close the palette. _(Sirius Web)_
  - For Grasp: Appearance, Layout and Show in sections in every element palette; Grasp has none of these.
  - Sources: `DiagramPalette.tsx`, `GroupPaletteLayoutSection.tsx`, `diagram.adoc`

#### SysON palette tool overrides

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **SysON palette tool overrides** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: SysON's frontend replaces how some backend tools render and behave in the palette and its search results; each overridden tool decides its own search visibility and last-used tracking. In the Explorer (tree) palette SysON overrides 'newObjectsFromText' (insert textual SysML), 'createExpression', 'editExpression' and 'deleteExpression'. In the diagram palette it overrides 'tool_new_expression', 'tool_edit_expression', 'tool_delete_expression' (asks for confirmation before deleting an expression) and 'fork_join_node_rotate_tool' (custom rotate-node UI). The overridden rows read 'New Expression' (create.svg icon, opens the expression editor modal in create mode), 'Edit Expression' (edit.svg), 'Delete Expression' (semanticDelete.svg; the 'Are you sure?' deletion confirmation, then the palette closes) and 'Rotate' (Rotate90DegreesCw icon). The three expression rows render only when exactly one node or one edge is targeted, and all four are disabled on read-only diagrams. Rotate (testid 'overridden_tool_node-rotate') acts on the first targeted node only. It swaps the node's width and height around its center, marks it as resized by the user, clears its connection handles and the bending points of its connected edges, then re-lays out that node and those edges, turning a horizontal bar vertical and back (2026.7). The overridden rows have testids 'overridden_tool_new_expression', 'overridden_tool_edit_expression' and 'overridden_tool_delete_expression', and unlike stock rows they have no hover tooltip. Their clicks bypass the palette's generic click handler, which would close the palette. So Rotate leaves the palette open (SysON's own Playwright test closes it by hand), New Expression keeps it open until the expression modal closes, and Delete Expression closes it only once the deletion is confirmed; cancelling leaves it open.
  - For Grasp: expression and rotate tools with their own UI in the palette; Grasp has neither expression editing nor rotation.
  - Sources: `SysONExtensionRegistry.tsx`, `NewExpressionDiagramToolOverriddenContribution.tsx`, `RotateNodeToolOverriddenContribution.tsx`, `DeleteExpressionDiagramToolOverriddenContribution.tsx`, `useTool.tsx`

#### Palette search field ('Search Tool')

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Palette search field ('Search Tool')** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: An autofocused text field with a search icon and the placeholder 'Search Tool' filters tools across all sections as the user types, which helps when a representation defines many element types (e.g. to find 'New Required Constraint'). A clear button (aria-label 'Clear') appears only while there is text; it empties the field, restores the sectioned list and refocuses the field. _(Sirius Web)_
  - For Grasp: a Search Tool field finds a tool among many; Grasp's palette has no search.
  - Sources: `PaletteSearchField.tsx`, `sirius-components-palette.json`, `flashlight.adoc`

#### Fuzzy matching with smart case and highlighting

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Fuzzy matching with smart case and highlighting** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: A tool matches when the typed characters appear in its label in order, as a subsequence: 'pdf' matches 'Part Def', and 'att def' or 'NAD' find 'New Attribute Definition'. Matching is case-sensitive only when the search term starts with an uppercase letter. The matched characters are highlighted individually in the navigation background color. Contributed and overridden tools are included without dropping matching entries (2026.7/2026.9 fixes). Tools filter on `fuzzyMatch(candidate, searchTerm)` against the searchedValue, and overridden tools must apply the same check. _(Sirius Web)_
  - For Grasp: fuzzy, smart-case tool search with highlighted matches; Grasp has no search.
  - Sources: `fuzzyMatch.ts`, `HighlightedLabel.tsx`, `diagram-services.adoc`

#### Flat search results with keyboard navigation

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Flat search results with keyboard navigation** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: While the search has text, the sectioned list is replaced by one flat list of every matching tool, top-level or inside a section; dividers and section entries are not shown. Frontend-contributed tools are appended and filter themselves. Overridden tools (such as SysON's) always appear and decide their own visibility. Arrow Up/Down move the selection, wrapping at the ends, and Enter runs the selected tool. The first result is highlighted from the start, so typing and then pressing Enter runs the best match. The keys are caught at document level while results are shown. The highlighted index is not reset when the search text changes, so Enter can do nothing if the old index is past the end of the new list. Overridden tools always occupy a slot in this keyboard list, even when they hide themselves, and are never drawn as highlighted. Quick-access tools and the Appearance, Layout and Show in sections are not searched. 'No result' (hard-coded English) is centered when nothing matches. _(Sirius Web)_
  - For Grasp: search results in one list, arrows and Enter run the best match; Grasp has no keyboard tool picking.
  - Sources: `PaletteSearchResult.tsx`, `2025.1.0.adoc`

#### Palette tools run from keyboard shortcuts

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Palette tools run from keyboard shortcuts** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: A key press on the diagram (not in a text field, not a lone modifier) fetches the palette of the current selection, or of the diagram when nothing is selected. It then runs the single-click tool whose key binding matches the key plus the Ctrl, Alt and Meta flags exactly, searching quick-access tools, section-less tools and tools inside sections. The tool runs on the selected elements at the mouse position converted to diagram coordinates, through the same confirmation, dialog and impact-analysis steps as a click. When several tools match, nothing runs and an error toast says 'Found multiple tools associated to CTRL + META + ALT + <key>: <labels>' (only the pressed modifiers are listed). On a read-only diagram the palette is not fetched, so shortcuts do nothing. View-defined key bindings without Ctrl, Alt or Meta are dropped unless the key is 'Delete'. Pressing Del on a node whose palette has no delete tool does nothing: no confirmation popup and no tool request. _(Sirius Web)_
  - For Grasp: palette tools run from keyboard shortcuts; Grasp's keys are fixed (Delete, F2, Escape, zoom).
  - Sources: `useDiagramKeyBinding.ts`, `KeyBindingConverter.java`

#### Group palette on multi-selection

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (3):

- **Group palette tools on multi-selection** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: Selecting several elements and opening the palette gives a group palette, using the same palette component, whose tool sections and quick tools run on all selected elements. It offers Pin/Unpin to fix the positions of every selected element. _(Sirius Web)_
  - For Grasp: a group palette whose tools apply to all selected; Grasp has no multi-selection.
  - Sources: `CHANGELOG.adoc`
- **Standard diagram group palette** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: Selecting several nodes (no edges) opens a group palette. It has two quick-access tools, 'Duplicate Elements' and 'Delete from diagram', and three sections. 'View as': General View, Interconnection View, ActionFlow View, StateTransition View; the 2026.9 notes call the last two Action Flow View and State Transition View. 'Related Elements': Add existing elements, Add existing elements (recursive), Add existing connected elements. 'Show/Hide': Hide, Hide all content, Show all content, Reset content, Show valued content. Each tool applies only to the selected nodes; group tools are unavailable when edges are selected (2026.5, extended 2026.9). 'Delete from diagram' runs `diagramServices.deleteViews(selectedNodes)`, which sends one view-deletion request per selected node without deleting the semantic elements; it is meant for unsynchronized nodes, since synchronized ones are recreated at the next render.
  - For Grasp: a group palette of duplicate, remove, View as, related and show/hide tools; Grasp has no multi-selection.
  - Sources: `SDVDiagramDescriptionProvider.java`, `DiagramDefaultGroupToolsFactory.java`, `GVGroupPaletteTests.java`
- **Group palette (multi-selection)** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Selecting several nodes (and no edges) in a General View opens a group palette with quick-access "Duplicate Elements" (content_copy.svg, same Element/Relationship rule as Duplicate Element, applied to every selected node) and "Delete from Diagram", and three sections: View as (General View and Interconnection View offered when every selected element is a Package, Usage or Definition; ActionFlow View when each is a Package, ActionUsage or ActionDefinition; StateTransition View when each is a Package, StateUsage or StateDefinition; each tool also creates the new ViewUsage's diagram), Related Elements (Add existing elements, Add existing elements (recursive), Add existing connected elements, each run on every selected node) and the default Show/Hide section.
  - For Grasp: a multi-selection palette duplicates, removes, views or adds related elements at once; Grasp selects one thing at a time.
  - Sources: `SDVDiagramDescriptionProvider.java`, `ToolDescriptionService.java`, `GVGroupPaletteTests.java`

#### Diagram background palette

**Grasp: partly** · parts: diagrams

SysON features encompassed (2):

- **Diagram background palette** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: partly
  - What it is: The background palette holds the diagram-level tools; Fade and Hide are not offered on the background. _(Sirius Web)_
  - For Grasp: the background palette holds diagram-level creation tools; Grasp's header palette plays this part for the active view.
  - Sources: `CHANGELOG.adoc`
- **Create from the background palette** · diagrams / Diagram: palette & tool UI · SysON, experimental · useful · Grasp: partly
  - What it is: Right-click the background, click a tool section (e.g. Structure), then the creation tool. _(experimental)_
  - For Grasp: create from the background via a section and tool; Grasp picks a header tool and clicks the plane.
  - Sources: `manage-elements-diagram.adoc`

#### Edge palette and edge selection feedback

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Edge palette and edge selection feedback** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: partly
  - What it is: Selected edges get visual feedback, edges stay visible when nodes are selected, and an edge has its own palette with its tools; single-click tools can target edges. _(Sirius Web)_
  - For Grasp: edges have their own palette of tools; Grasp's panel shows a selected line's fields and Delete.
  - Sources: `CHANGELOG.adoc`

#### Tool list item

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Tool list item** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: partly
  - What it is: Each tool row shows a 16x16 icon (several icon URLs can be layered as an overlay), an ellipsized label, a right-side tooltip with the full label, and the tool's first key binding right-aligned in disabled-gray text (testid 'key-binding-<label>'). The binding reads 'Ctrl+' if Ctrl is set, then a Command-key icon if Meta is set, then 'Alt+', then the key, e.g. 'Ctrl+s' or 'Ctrl+e'. Clicking the row closes the palette, records the tool as last used, then runs it. Tools still run when their tooltip is visible. A View-defined tool with no icon expression gets a default icon: /img/DefaultNodeIcon.svg for node tools and /img/DefaultEdgeIcon.svg for edge tools. Backend-contributed tools declared with an empty icon list (e.g. SysON's Rotate before its frontend override) show no icon. _(Sirius Web)_
  - For Grasp: each tool row has an icon, label, tooltip and key binding; Grasp's buttons have a label and tooltip, no icons or shortcuts.
  - Sources: `ToolListItem.tsx`, `Palette.tsx`, `NodeToolConverter.java`

#### Default edge palette

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Default edge palette** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: partly
  - What it is: General View edges get 'Delete from Model' (Annotation edges are not deletable), 'Reconnect Source' and 'Reconnect Target' (used by dragging an edge end), an optional center-label 'Edit' tool, and a 'Show/Hide' section with 'Hide'.
  - For Grasp: edges have Delete, Reconnect, Edit and Hide; Grasp's lines have Delete and label editing.
  - Sources: `AbstractEdgeDescriptionProvider.java`, `DiagramDefaultToolsFactory.java`

#### Creation tool naming and icons

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Creation tool naming and icons** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: partly
  - What it is: Creation tools are named 'New ' plus the metaclass name split into words. A usage that has a matching definition drops the 'Usage' suffix (PartUsage gives 'New Part', AcceptActionUsage 'New Accept Action', FlowUsage 'New Flow'). ConnectorAsUsage, BindingConnectorAsUsage and SuccessionAsUsage keep it ('New Binding Connector As Usage'). Definitions keep 'Definition' ('New Attribute Definition'), and NamespaceImport gives 'New Namespace Import'. Direction-setting tools append ' In', ' Out' or ' Inout' ('New Port In'). Icons are `/icons/full/obj16/<EClassName>[Direction].svg`. Introduced in 2024.3. The broken 'New Interface' tool icon was fixed in 2026.7.
  - For Grasp: tools named New Part, New Port In with metaclass icons; Grasp's buttons use kind labels like part def, with no icons.
  - Sources: `DescriptionNameGenerator.java`, `ToolDescriptionService.java`, `DescriptionNameGeneratorTest.java`

### Palette creation tools and dialogs (7)

Background and node creation tools for structure and behaviour, directional and compartment tools, and the selection dialog.

#### Background Analysis and Extension sections

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Background Analysis and Extension sections** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: Analysis offers New Case, New Case Definition, New Use Case and New Use Case Definition; Extension offers New Metadata Definition.
  - For Grasp: cases, use cases and metadata definitions from the background; Grasp has none.
  - Sources: `SDVDiagramDescriptionProvider.java`

#### Compartment item creation tools (New <Type>)

**Grasp: missing** · parts: diagrams, model, sysml-views · note: Grasp no/partly

SysON features encompassed (3):

- **Node compartment creation tools** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: Node palettes include one creation tool per non-documentation compartment (label from the item type, e.g. 'New Attribute', 'New Port') in the section matching the item type's family, plus In/Inout/Out variants for item and port compartments. The item is created through createCompartmentItem(WithDirection), lands in the correct compartment, and that compartment is revealed. Choosing such a tool from a node header creates the element in the right compartment (2024.3).
  - For Grasp: a node palette creates items straight into its compartments; Grasp nests usages by placing them in a box.
  - Sources: `SDVNodeToolSectionSwitch.java`, `CompartmentNodeToolProvider.java`, `CHANGELOG.adoc` v2024.3.0
- **Compartment item creation tool (New <Type>)** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: Generic tool that creates the item type of a compartment's EReference in the selected element (e.g. nested attribute, documentation). Labeled "New <Type words>" with icon `/icons/full/obj16/<Type>.svg`; the element is wrapped in the right membership and initialized, then exposed, the matching compartment is revealed and the element selected. Examples: New Attribute and New Documentation on Attribute/Connection/Item/Part/Occurrence Definitions; attribute, Reference and doc on AttributeUsage, ItemUsage, PortUsage, PortDefinition, MetadataDefinition; enum values on EnumerationDefinition ("enums"); New Part on Connection/Allocation/Interface Definitions (sibling node plus "parts" row); nested item and part as sibling nodes on ItemUsage/PartUsage; New Port on an ItemUsage gives a port border node plus a "ports" row; New Item on a Part Definition (e.g. "driver"); New Attribute on a Part Definition, part or requirement, then typed by direct edit; occurrences, allocations, interfaces and documentation on occurrence, allocation and interface nodes; documentation, attributes, ports and nested usages on Concern/Constraint/Requirement/Satisfy Requirement nodes and Case/UseCase usages; New Item on a MetadataDefinition gives a sibling item node (with 4 compartments) instead of a row, and New Occurrence on an OccurrenceUsage or OccurrenceDefinition gives a sibling node with a composition edge as well as an occurrences row.
  - For Grasp: one tool per compartment adds an attribute, doc, part or port inside an element; Grasp adds parts and ports by clicking inside, no rows.
  - Sources: `CompartmentNodeToolProvider.java`, `DiagramMutationToolService.java`, `GVSubNodeStructureCreationTests.java`
- **Compartment item creation and membership** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: compartment palette > New <item> instantiates the compartment's reference type inside the owner with a FeatureMembership by default; exceptions: EnumerationUsage items get a VariantMembership, assumed constraints a RequirementConstraintMembership of kind assumption, required constraints one of kind requirement, documentation an OwningMembership, framed concerns a FramedConcernMembership. The element is then initialized.
  - For Grasp: compartment tools add items with the right membership; Grasp adds entry/do/exit and nested boxes but has no per-compartment New tools.
  - Sources: `DiagramMutationToolService.java`

#### Selection dialog for tools

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Selection dialog for tools** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: A tool whose dialog description id starts with 'siriusComponents://selectionDialogDescription' (e.g. 'Import existing types') opens the generic Selection dialog (testid selection-dialog) before running; it works for node tools and edge tools. The dialog gets the variable targetObjectId, and on confirm the tool runs with the returned variables (STRING, OBJECT_ID or OBJECT_ID_ARRAY). Only one dialog can be open at a time. The modal has a small max width, is at least 400px tall and has a 600px content area. Its title switches between the default, no-selection and with-selection variants and it shows a description; the close (X) icon or a backdrop click cancels. Nothing is drawn (no spinner) until the selection description has loaded. Dialog components are picked through a diagram-dialog extension point, and Sirius Web registers only the selection dialog for that id prefix. A tool whose dialog id no contribution handles shows nothing, and the dialog state stays 'open' with no way to close it, so later dialog-backed tools in that diagram cannot open their dialog either. _(Sirius Web)_
  - For Grasp: a modal tree dialog for picking an element before a tool runs; Grasp picks types from select lists in the panel.
  - Sources: `SelectionDialog.tsx`, `DialogContext.tsx`, `DefaultExtensionRegistry.tsx`

#### New Flow tool with payload dialog

**Grasp: missing** · parts: diagrams · note: Grasp no/partly

SysON features encompassed (2):

- **Connection edge 'New Flow' tool** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: The palette of a ConnectionUsage edge has a Behavior section with 'New Flow' (Flow.svg, opens the payload dialog). It is offered only when the connection is typed by a definition with at least two end features; on an untyped connection the section comes back empty and is hidden.
  - For Grasp: New Flow on a typed connection edge, with a payload dialog; Grasp draws flows between ports or items as their own line.
  - Sources: `ConnectionUsageEdgeDescriptionProvider.java`, `DiagramQueryElementService.java`, `GVFlowUsageTests.java`
- **New Flow payload dialog** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: partly
  - What it is: Opened by New Flow on a connection edge. Title 'New Flow', description 'Create an Flow:'. Choices: 'Create a new Flow' ('Create a new Flow without Payload') and 'Select a Payload for the new Flow' ('Create a new Flow with a Payload'); any Type is selectable. Status: 'It will create a new Flow without Payload', 'Select one Element to be added as the new Flow Payload', 'It will create an Flow with <name> as Payload'.
  - For Grasp: New Flow asks for an optional payload; Grasp sets a flow's item in the panel.
  - Sources: `FlowNodeToolProvider.java`

#### Background creation tool mechanics

**Grasp: partly** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **Background creation behavior and auto-diagram for ViewUsage** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: partly
  - What it is: Background tools create the element in the ViewUsage's owner with an appropriate membership, initialize it, expose it and select it. A newly created ViewUsage automatically gets a General View diagram, which is saved and labelled with the ViewUsage name.
  - For Grasp: background tools create, expose and select; a new view element gets its own diagram; Grasp adds views with New view, not as model elements.
  - Sources: `ToolDescriptionService.java`, `DiagramMutationDiagramService.java`, `DiagramMutationAQLService.java`
- **Background creation tool mechanics** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: Each background "New <Type>" tool (icon `/icons/full/obj16/<Type>.svg`, directional variants with the capitalized direction appended to label and icon, e.g. "New Port In" / `PortUsageIn.svg`) creates the element in a new membership of the diagram ViewUsage's owner, initializes it (default name, etc.), sets the direction for directional variants, exposes it in the diagram's ViewUsage, creates the element's own diagram when needed (e.g. a new ViewUsage gets its diagram) and selects the new element. Each tool is guarded by the current view's tool-availability rule for its metaclass.
  - For Grasp: each creation tool names, places, exposes and selects the new element; Grasp does this but has no directional variants or diagrams created for new views.
  - Sources: `ToolDescriptionService.java`, `SDVDiagramDescriptionProvider.java`

#### Creation tools inside existing usages

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Creation tools inside existing usages** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: partly
  - What it is: Creation tools, mainly for AttributeUsage, PartUsage, PortUsage and ItemUsage, are available in the palettes of ActionUsage, ConstraintUsage, InterfaceDefinition, RequirementDefinition and PortUsage nodes (2024.5).
  - For Grasp: create attributes, parts and ports inside actions, constraints and ports; Grasp nests what each view kind admits.
  - Sources: `2024.5.0.adoc`, `CHANGELOG.adoc`

#### Directional In/Out/Inout creation tools

**Grasp: partly** · parts: diagrams, model, sysml-views

SysON features encompassed (3):

- **Directional Port and Item creation tools** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: partly
  - What it is: ItemUsage and PortUsage each get three extra creation tools besides the plain one, one per direction (New Item In/Out/Inout, New Port In/Out/Inout), on the background and in node palettes (2024.7).
  - For Grasp: New Port In, Out and Inout create ports with a direction; Grasp sets direction in the panel after placing.
  - Sources: `SDVDiagramDescriptionProvider.java`, `CHANGELOG.adoc`
- **Directional item, port and parameter tools (New <Type> In/Inout/Out)** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: Directional variant of the compartment tool labeled "New <Type> In", "New <Type> Inout" or "New <Type> Out" (icon e.g. `/icons/full/obj16/ItemUsageIn.svg`). It sets the feature direction and appends the capitalized direction to the declared name (e.g. "item1In") and does not reveal the compartment. New Port In/Inout/Out on PartDefinition and PartUsage create directed PortUsages as border nodes (and rows of the ports compartment); they were fixed in v2025.2.0 after failing to run. New Parameter In/Inout/Out on actions create ReferenceUsage parameters as border nodes plus parameters rows.
  - For Grasp: In, Inout and Out tools create directed ports, items and parameters named with the direction; Grasp sets direction in the panel instead.
  - Sources: `CompartmentNodeToolProvider.java`, `GVSubNodeStructureCreationTests.java`, `2025.2.0.adoc`
- **Directional compartment items** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: compartment tools New <X> In/Out/Inout create the item, set its FeatureDirectionKind and append the capitalized direction to the default name (e.g. a port gets an 'In' suffix).
  - For Grasp: In/Out/Inout tools set direction and name the item to match; Grasp sets a parameter's direction in the panel, with no direction-named defaults.
  - Sources: `DiagramMutationToolService.java`, `ToolDescriptionService.java`

## Notation

### General View notation: definitions and usages (9)

The General View diagram and its definition and usage nodes, with their palettes and composite/ref switching.

#### ConnectionDefinition node

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **ConnectionDefinition node** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: ConnectionDefinitions are drawn as nodes (v2025.4.0). Since v2026.3.0 the label reads «connection def» (it used to read «part def»), the node has attributes, doc, parts and ends compartments, and a new ConnectionDefinition starts with two connection ends named "source" and "target".
  - For Grasp: connection defs drawn with «connection def» and source and target ends; Grasp has no connection definitions.
  - Sources: `2026.3.0.adoc`, `CHANGELOG.adoc` v2026.3.0

#### Set as composite / Set as ref

**Grasp: missing** · parts: model, sysml-views

SysON features encompassed (3):

- **Set as composite / Set as ref** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Structure tools that switch a Feature between composite and reference: Set as composite sets isComposite=true and is offered only when the feature is not composite; Set as ref sets it false and is offered only when it is composite (v2024.9.0).
  - For Grasp: switches a feature between composite and reference; Grasp holds no ref flag.
  - Sources: `SetAsCompositeToolProvider.java`, `SetAsRefToolProvider.java`, `CHANGELOG.adoc` v2024.9.0
- **Set as composite** · model / Model semantics & editing services · SysON · useful · Grasp: missing
  - What it is: node palette > Structure > 'Set as composite' (Usage, ActionUsage, PartUsage, ItemUsage, PortUsage, StateUsage, AcceptActionUsage, AssignmentActionUsage, OccurrenceUsage, etc.) sets isComposite = true; shown only on a Feature whose isComposite is false; OwningMembership icon.
  - For Grasp: turn a reference feature into a composite one from the palette; Grasp doesn't hold composite versus ref.
  - Sources: `SetAsCompositeToolProvider.java`
- **Set as ref** · model / Model semantics & editing services · SysON · useful · Grasp: missing
  - What it is: node palette > Structure > 'Set as ref' sets isComposite = false (reference); shown only on a composite Feature; Membership icon. isReference is not stored: a Usage's isReference is always the opposite of isComposite, and a ReferenceUsage, an AttributeUsage and an EventOccurrenceUsage always report isReference = true whatever isComposite holds.
  - For Grasp: mark a feature as a reference rather than owned; Grasp doesn't hold ref, and its label editor names ref as not kept.
  - Sources: `SetAsRefToolProvider.java`, `UsageImpl.java`, `ReferenceUsageImpl.java`

#### Interface definition port ends (New End / New Port as end)

**Grasp: partly** · parts: model, sysml-views

SysON features encompassed (4):

- **InterfaceDefinition default ports** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: A new InterfaceDefinition node starts with two ports named "source" and "target" in its ends compartment, shown as 2 port border nodes. Its ports and ends compartments are hidden on creation; reveal them with the node's Manage Visibility action; more ports are added with New Port as end.
  - For Grasp: a new interface def starts with ports source and target; Grasp's interface defs take end ports but start with none.
  - Sources: `2026.3.0.adoc`, `InterfaceDefinitionEndCompartmentNodeToolProvider.java`
- **New End / New Port as end** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: New End adds a connection end to ConnectionDefinition/AllocationDefinition (replacing the former "New Part as end" tool that only AllocationDefinition had); New Port as end adds a port end to an InterfaceDefinition. Both are in the definition palette's Structure section and the ends compartment palette.
  - For Grasp: adds ends to connection, allocation and interface defs; Grasp adds interface def end ports only.
  - Sources: `ConnectionDefinitionEndCompartmentNodeToolProvider.java`, `InterfaceDefinitionEndCompartmentNodeToolProvider.java`, `2026.3.0.adoc`
- **New Port as end (interface definition)** · sysml-views / SysML Interconnection View · SysON · useful · Grasp: partly
  - What it is: in the Structure section of InterfaceDefinition nodes and in the palette of its 'ends' compartment; adds a PortUsage with isEnd=true named 'port<N>' (N = owned end features + 1) in a FeatureMembership; PortUsage icon; does not reveal the compartment. Since 2026.3.0 a newly created InterfaceDefinition already has two end ports named 'source' and 'target', and its 'ports' and 'ends' compartments start hidden (reveal them with Manage Visibility).
  - For Grasp: adds an end port to an interface def, which starts with source and target; Grasp adds end ports but starts with none.
  - Sources: `InterfaceDefinitionEndCompartmentNodeToolProvider.java`, `2026.3.0.adoc`, `InterfaceDefinitionEndsCompartmentNodeDescriptionProvider.java`
- **InterfaceDefinition port ends** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: a new InterfaceDefinition gets isSufficient = true and two end PortUsages 'source' and 'target'; because caseInterfaceDefinition returns null, the ConnectionDefinition case also runs and adds two end ReferenceUsages 'source' and 'target' before the default name is applied.
  - For Grasp: a new interface definition comes with source and target port ends; Grasp's interface def has end ports, but whether it starts with two isn't documented.
  - Sources: `ElementInitializerSwitch.java`

#### New Feature Typing (PartUsage node tool)

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **New Feature Typing (PartUsage node tool)** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: Creates a sibling definition in the part's owner and types the part with it through a FeatureTyping, exposing the new definition so it appears with the typing edge (icon FeatureTyping.svg, no dialog). The definition kind matches the usage kind: FlowUsage → FlowDefinition, AllocationUsage → AllocationDefinition, InterfaceUsage → InterfaceDefinition, ConnectionUsage → ConnectionDefinition, RenderingUsage → RenderingDefinition, ViewUsage → ViewDefinition, otherwise PartDefinition. Added only if the diagram has a node description for that definition kind (v2024.11.0).
  - For Grasp: one click creates a definition for a part and types it; Grasp gets the same by typing ': NewName' in the label.
  - Sources: `PartUsageFeatureTypingNodeToolProvider.java`, `DiagramMutationToolService.java`, `GVAddNewFeatureTypingFromPartUsageTests.java`

#### InterfaceDefinition palette

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **InterfaceDefinition palette** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: Structure: New Port as end plus compartment tools (New Attribute, New Interface, New Port, New Port In, New Port Inout, New Port Out, New Part). View as: General View, Interconnection View. No Related Elements section.
  - For Grasp: interface def palette adds end ports; Grasp adds ends with its port tool, not a node palette.
  - Sources: `SDVNodeToolSectionSwitch.java`

#### PartDefinition palette

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **PartDefinition palette** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: Structure: New Item, New Item In, New Item Inout, New Item Out, New Attribute, New Port, New Port In, New Port Inout, New Port Out, New Part (compartment tools) and New Action (the custom action-flow tool, moved here from Behavior). Behavior: New Start Action, New Done Action, New Join, New Fork, New Merge, New Decision (all six hidden on parts by the control-node precondition), New Accept Action, New Assignment Action, New Perform Action, New Exhibit State, New Exhibit Parallel State, New Timeslice, New Snapshot, New State, New Parallel State (custom state-transition variants replace the generic New State). Requirements: New Requirement, New Concern (compartment tools), New Satisfy Requirement, New Satisfy. View as: General View, Interconnection View. Then Related Elements; empty sections are removed. Actions and states can be added inside PartUsage and PartDefinition since v2024.9.0.
  - For Grasp: right-click palette on a part def for ports, parts, actions, states, requirements; Grasp offers parts and ports from its top palette.
  - Sources: `SDVNodeToolSectionSwitch.java`, `2024.9.0.adoc`

#### PartUsage palette

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **PartUsage palette** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: The PartDefinition tool set (items, control nodes hidden by precondition, accept/assignment/perform actions, exhibit states, timeslice/snapshot, New State / New Parallel State, attributes/ports/parts, New Requirement / New Concern, New Satisfy Requirement, New Satisfy, View as General View / Interconnection View) with New Action in Structure. Structure also has New Subsetting, New Feature Typing (only when a node description exists for the part's matching definition kind), New Binding Connector As Usage, New Flow, New Interface, Set as composite and Set as ref. Plus Related Elements.
  - For Grasp: right-click palette on a part for nested structure, behaviour and requirements; Grasp offers parts and ports from its top palette.
  - Sources: `SDVNodeToolSectionSwitch.java`

#### PortDefinition / PortUsage palettes

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **PortDefinition / PortUsage palettes** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: PortDefinition: Structure New Part, New Reference and compartment tools (New Attribute, New Port, New Port In/Inout/Out, New Item, New Item In/Inout/Out), so Items and Parts can be created inside ports (v2024.7.0). PortUsage: the same plus Set as composite and Set as ref. Both have Related Elements.
  - For Grasp: ports and port defs can hold items, parts and refs; Grasp's port defs hold directed items only.
  - Sources: `SDVNodeToolSectionSwitch.java`, `2024.7.0.adoc`

#### Node display rule

**Grasp: unclear** · parts: sysml-views

SysON feature encompassed (1):

- **Node display rule** · sysml-views / SysML General View · SysON · useful · Grasp: unclear
  - What it is: An exposed element is displayed as a tree node when it has no graphical parent or is a directly owned member of its parent; inside a Package, elements not contained in a sub-package also qualify. In every view kind a subject ReferenceUsage is always displayed; Packages and non-subject ReferenceUsages are never tree nodes in Action Flow or State Transition Views.
  - For Grasp: an element is drawn as a node at the root or inside its owner's node; how Grasp places an element whose owner isn't in the view was not checked.
  - Sources: `ViewFilterSwitch.java`

### General View notation: relationship edges (5)

Dependency, specialization, redefinition, typing, composition and feature value edges and their tools.

#### Dependency edge

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Dependency edge** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Dashed black 1px edge from client to supplier with an open arrowhead at the target, connecting definitions, usages and packages. Its center label (getDependencyLabel: short name and name) is edited with the "Edit Dependency Label" tool through the direct-edit grammar. Reconnecting the source replaces the client, the target the supplier. Its palette offers New Comment, which annotates the dependency.
  - For Grasp: dashed open-arrow dependency with an editable label; Grasp has no dependencies.
  - Sources: `AbstractDependencyEdgeDescriptionProvider.java`, `DependencyEdgeDescriptionProvider.java`

#### Redefinition edge

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Redefinition edge** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Solid edge from the redefining to the redefined feature with a closed arrowhead with a vertical bar (CLOSED_ARROW_WITH_VERTICAL_BAR), between usages. Reconnecting the source updates redefining, subsetting and specific and moves the relationship; the target updates redefined, subsetted and general.
  - For Grasp: redefinition edge with barred arrowhead; Grasp holds no redefinitions.
  - Sources: `AbstractRedefinitionEdgeDescriptionProvider.java`, `RedefinitionEdgeDescriptionProvider.java`

#### Feature value (implicit binding) edge

**Grasp: missing** · parts: sysml-views

SysON features encompassed (2):

- **Feature value edge** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: A FeatureValue that connects two features is drawn as its implicit BindingConnectorAsUsage: a solid "=" edge without arrows from the feature with value to the value target, between item, port and reference border nodes; the implicit binding is not added to the model (v2025.6.0). Direct-editing an ItemUsage with a value referencing another ItemUsage draws the edge (nested binary operators, feature chains and bracket expressions also set FeatureValues, and an expression using an unimported namespace still works); deleting the edge deletes the FeatureValue and updates the label.
  - For Grasp: an '=' edge shows a value bound to another feature; Grasp holds no values.
  - Sources: `FeatureValueEdgeDescriptionProvider.java`, `GVItemAndAttributeExpressionTests.java`, `2025.6.0.adoc`
- **Feature value (implicit binding) edge** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: a solid edge with no arrowheads and the center label '=', drawn from a feature to the feature its FeatureValue expression references: the referent of a FeatureReferenceExpression, or the target feature of a FeatureChainExpression (e.g. 'a1.a1_1'). No edge is drawn for a default value (isDefault). Creating such a value with the expression dialog adds the edge, editing it to another reference re-targets it, and deleting the expression removes it; deleting the edge itself from the diagram deletes the FeatureValue, and the source label loses its '= ...' part (e.g. 'out a2_2'). It cannot be reconnected: dragging either end shows 'Unable to reconnect source from a FeatureValue implicit binding (= {textual})' (or the target variant), with the FeatureValue in SysML text.
  - For Grasp: an '=' edge from a feature to the feature its value references; Grasp holds no values.
  - Sources: `AbstractFeatureValueEdgeDescriptionProvider.java`, `MetamodelQueryElementService.java`, `GVItemAndAttributeExpressionTests.java`

#### New Dependency

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **New Dependency** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Creates a Dependency (client = source, supplier = target) in an OwningMembership of the source's containing package and initializes it. From usages, targets exclude start, done and control nodes; from definitions and packages any node is a valid target.
  - For Grasp: draws a dependency between any elements; Grasp has none.
  - Sources: `ViewEdgeToolService.java`, `ViewEdgeToolSwitch.java`

#### New Redefinition

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **New Redefinition** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Between two usages of the same node kind, adds an owned Redefinition to the source (redefining/subsetting/specific = source, redefined/subsetted/general = target). A PartUsage can be redefined by a usage with the same name as the redefined one (v2026.3.0).
  - For Grasp: draws a redefinition between usages; Grasp has none.
  - Sources: `ViewEdgeToolService.java`, `2026.3.0.adoc`

### Cases, actors, allocations and other element kinds (20)

SysML element kinds Grasp lacks: cases and use cases, actors and subjects, allocations, occurrences, references, perform and exhibit.

#### ReferenceUsage node

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **ReferenceUsage node** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: A ReferenceUsage node description exists although ReferenceUsage is not in any palette section list; it is displayed, accepted by Drop from Diagram, and created by the New Reference tool.
  - For Grasp: reference usages appear as nodes; Grasp holds no ref usages.
  - Sources: `SDVDiagramDescriptionProvider.java`

#### PerformActionUsage and ExhibitStateUsage nodes

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **PerformActionUsage and ExhibitStateUsage nodes** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Node descriptions exist for these although they are not in palette sections; they are created by dedicated tools (New Perform Action, New Exhibit State / New Exhibit Parallel State).
  - For Grasp: perform actions and exhibit states get nodes of their own; Grasp has neither.
  - Sources: `SDVDiagramDescriptionProvider.java`

#### Actor node (stick figure)

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Actor node (stick figure)** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: PartUsages that are actors are drawn as an actor.svg image node (default 41x92, keep aspect ratio, resizable) with the label outside at bottom center; it has no children, border nodes or palette tool sections, so nothing can be created inside it (v2024.9.0). The stick-figure image was reshaped without margins in v2026.7.0.
  - For Grasp: actors drawn as stick figures with the name below, the familiar use-case notation; Grasp has no actors.
  - Sources: `ActorNodeDescriptionProvider.java`, `2024.9.0.adoc`

#### Subject node

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Subject node** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: ReferenceUsages that are subjects get a dedicated "GV Node Subject" node (candidates from getExposedSubjects) with the regular rounded usage style and compartments; its palette comes from the generic Usage case (Set as composite, Set as ref, compartment tools, Related Elements). Since v2026.3.0 subjects can be shown as their own nodes, as well as in the subject compartment, for CaseUsage, CaseDefinition, UseCaseUsage, UseCaseDefinition, RequirementUsage, RequirementDefinition and SatisfyRequirementUsage.
  - For Grasp: a case's or requirement's subject shown as its own node; Grasp has no subjects.
  - Sources: `SubjectNodeDescriptionProvider.java`, `2026.3.0.adoc`

#### AllocationDefinition and AllocationUsage nodes

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **AllocationDefinition and AllocationUsage nodes** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Handled in the General View (Behavior section > New Allocation / New Allocation Definition) since v2024.5.0; a new AllocationDefinition starts with two ends named "source" and "target". Allocate edges are also displayed in the Action Flow View.
  - For Grasp: allocations between elements, a key traceability tool; Grasp has no allocations.
  - Sources: `2024.5.0.adoc`, `AllocateEdgeDescriptionProvider.java`

#### Allocate edge

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Allocate edge** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Solid edge for AllocationUsage with center label «allocate» and an open arrowhead, between any two usage nodes (e.g. requirement to action, attribute to attribute in the flashlight tutorial). Reconnecting source or target updates the referenced feature of the first or second end feature and requires a Usage as new end.
  - For Grasp: «allocate» edge between usages; Grasp has no allocations.
  - Sources: `AbstractAllocateEdgeDescriptionProvider.java`, `DiagramMutationElementService.java`, `flashlight.adoc`

#### New Allocation

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **New Allocation** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: From a usage to any regular Usage node (node description names ending in "Usage"), creates and initializes an AllocationUsage. The tool reuses the Dependency.svg icon.
  - For Grasp: draws an allocation between usages; Grasp has none.
  - Sources: `ViewEdgeToolService.java`, `DiagramMutationElementService.java`

#### Case and Use Case nodes

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Case and Use Case nodes** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: UseCaseDefinition and UseCaseUsage (v2024.5.0, Analysis section > New Use Case / New Use Case Definition) and CaseDefinition and CaseUsage (v2024.11.0, New Case / New Case Definition) nodes, with documentation, subject, objective and actors compartments.
  - For Grasp: use cases and cases with subject, objective and actors; Grasp has no cases.
  - Sources: `2024.5.0.adoc`, `2024.11.0.adoc`, `CaseUsageActorsCompartmentNodeDescriptionProvider.java`

#### Occurrence nodes

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Occurrence nodes** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: OccurrenceDefinition and OccurrenceUsage nodes (Behavior section > New Occurrence / New Occurrence Definition) since v2024.5.0.
  - For Grasp: occurrence defs and usages as nodes; Grasp has only event occurrences on lifelines.
  - Sources: `2024.5.0.adoc`

#### Include use case edge

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Include use case edge** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: IncludeUseCaseUsage drawn as a solid edge labeled «include» with a filled closed arrow from the owning to the included use case, between UseCaseUsage nodes (v2025.8.0). Reconnecting the source moves the owning membership to the new use case; reconnecting the target updates its ReferenceSubsetting.
  - For Grasp: «include» edge between use cases; Grasp has no use cases.
  - Sources: `IncludeUseCaseDescriptionProvider.java`, `DiagramMutationElementService.java`, `GVIncludeUseCaseUsageTests.java`

#### New Include Use Case

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **New Include Use Case** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Between two UseCaseUsage nodes, creates an IncludeUseCaseUsage in a FeatureMembership of the source with a ReferenceSubsetting to the target (IncludeUseCaseUsage icon, v2025.8.0).
  - For Grasp: draws an include between use cases; Grasp has none.
  - Sources: `ViewEdgeToolService.java`, `DiagramMutationElementService.java`, `2025.8.0.adoc`

#### "objective" compartment

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **"objective" compartment** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: CaseDefinition and CaseUsage (including use case) nodes have an "objective" compartment showing the objective requirement and, as an extra item, the objective's documentation, which can be created, edited and seen there (v2026.1.0). Its palette offers New Objective and New Objective Documentation; drops use dropObjectiveRequirementFromDiagram.
  - For Grasp: a case's objective and its documentation; Grasp has no cases.
  - Sources: `CaseDefinitionObjectiveRequirementCompartmentNodeDescriptionProvider.java`, `ObjectiveDocumentationCompartmentItemNodeDescription.java`, `2026.1.0.adoc`

#### New Perform Action

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (3):

- **New Perform Action dialog** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: Title 'New Perform Action', description 'Create a Perform Action:'. Choices: 'Create a new Perform Action' ('…without referencing an existing Action') and 'Select an existing Action to perform:' ('Create a new Perform Action referencing the selected Action'); ActionUsages are listed. A selected ActionUsage is referenced through a ReferenceSubsetting and the new element is exposed. Status: 'It will create a new Perform Action without referencing an existing Action', 'Select one Action to be referenced by the new Perform Action', 'It will create a Perform Action referencing <name>'.
  - For Grasp: New Perform Action optionally references an existing action; Grasp has no perform actions.
  - Sources: `PerformActionNodeToolProvider.java`, `TreeQuerySelectionDialogService.java`
- **New Perform Action** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Creates a PerformActionUsage; with a selected action it references (subsets) it, without one it references nothing. The tree selection dialog (v2025.6.0; title "New Perform Action", text "Create a Perform Action:", icon PerformActionUsage.svg) offers "Create a new Perform Action" ("Create a new Perform Action without referencing an existing Action") or "Select an existing Action to perform:" ("Create a new Perform Action referencing the selected Action"; e.g. "produceDirectedLight" on a part), with statuses "It will create a new Perform Action without referencing an existing Action", "Select one Action to be referenced by the new Perform Action" and "It will create a Perform Action referencing <name>"; since v2026.5.0 the two former perform-action tools are merged into this one with optional selection. The tool was labeled "New Perform action" until v2026.9.0. Available on action and part nodes and, since v2026.5.0 (fix #2197), directly on CaseUsage, CaseDefinition, UseCaseUsage and UseCaseDefinition nodes, where the perform action goes in the perform actions compartment. Creating one that references an existing Action expands every compartment that contains it (v2025.6.0). Since v2026.3.0 the new PerformActionUsage follows the common display rule: it goes in a visible compartment that can show it, otherwise on the diagram background (it used to appear on the background and in its compartments every time); since v2026.1.0 one created inside a StateUsage reveals the matching compartments.
  - For Grasp: creates a perform action referencing an existing action; Grasp has no perform actions.
  - Sources: `PerformActionNodeToolProvider.java`, `GVSubNodeActionFlowCreationTests.java`, `2026.5.0.adoc`
- **New Perform Action** · sysml-views / SysML Action Flow View · SysON · useful · Grasp: missing
  - What it is: Behavior section of ActionUsage, ActionDefinition, PartUsage, PartDefinition, PerformActionUsage, CaseUsage, CaseDefinition, UseCaseUsage and UseCaseDefinition palettes. Opens an optional tree dialog titled 'New Perform Action', description 'Create a Perform Action:': 'Create a new Perform Action' (no referenced Action) or 'Select an existing Action to perform:' (only ActionUsages selectable, the tree listing only branches that contain ActionUsages; status 'It will create a Perform Action referencing <name>'). Other dialog texts: 'Create a new Perform Action without referencing an existing Action' (choice description and status 'It will create a new Perform Action without referencing an existing Action'), 'Create a new Perform Action referencing the selected Action', and 'Select one Action to be referenced by the new Perform Action' while nothing is selected. Creates a PerformActionUsage in the membership the owner needs, always with an owned ReferenceSubsetting whose referencedFeature is the picked action (empty if none); no default name; exposed but not auto-selected and compartment not revealed by the tool; since 2026.3.0 it goes into a visible compartment that can hold it, otherwise onto the background, not both. Selecting an existing action was added in 2024.9.0 and the selection tree in 2025.6.0; the two perform tools (with and without a referenced action) were merged into this one in 2026.5.0; renamed from 'New Perform action' in 2026.9.0. The tutorial uses it on a part ('choose the second option' and pick 'produceDirectedLight').
  - For Grasp: perform actions referencing an existing action; Grasp has none.
  - Sources: `PerformActionNodeToolProvider.java`, `DiagramMutationToolService.java`, `CHANGELOG.adoc` v2026.9.0

#### New Exhibit State / Exhibit Parallel State

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (3):

- **New Exhibit State / New Exhibit Parallel State dialog** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: Title 'New Exhibit State' or 'New Exhibit Parallel State', description 'Create an Exhibit State:' or 'Create a parallel Exhibit State:'. Choices: 'Create a new Exhibit State' ('Create a new standalone Exhibit State') and 'Create an Exhibit State associated with the existing State' (parallel wording for the other variant); only StateUsages are listed. An associated state is linked through a ReferenceSubsetting, the parallel variant sets isParallel, and the containing compartment is revealed. Status: 'It will create a new standalone Exhibit State', 'Select an existing State to associate to the Exhibit State', 'It will create an Exhibit State associated with <name>'. Offered from background, package, part and state palettes (Behavior).
  - For Grasp: exhibit states, optionally of an existing state; Grasp has no exhibit states.
  - Sources: `ExhibitStateNodeToolProvider.java`, `TreeQuerySelectionDialogService.java`
- **New Exhibit State / New Exhibit Parallel State** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Behavior tools on the background and on PartUsage, PartDefinition and state nodes (icon ExhibitStateUsage.svg) that create an ExhibitStateUsage in the "exhibit states" compartment or as a node. An optional tree dialog ("Create an Exhibit State:" / "Create a parallel Exhibit State:") offers "Create a new Exhibit State" (standalone, e.g. "flashlightStates") or "Create an Exhibit State associated with the existing State" ("Select an existing State to associate to the Exhibit State you want to create"); the parallel variant uses "Exhibit State Parallel" in its texts ("Create a new Exhibit State Parallel", "Create a parallel Exhibit State associated with the existing State") and sets isParallel. Status lines: "It will create a new standalone Exhibit State", "Select an existing State to associate to the Exhibit State" and "It will create an Exhibit State associated with <name>" ("a parallel Exhibit State" for the parallel tool). Since v2026.5.0 these two tools (parallel and non-parallel) replace the former separate "New Exhibit State with referenced State" tool.
  - For Grasp: exhibits a state in a part, standalone or referencing a state; Grasp has no exhibit states.
  - Sources: `ExhibitStateNodeToolProvider.java`, `GVAddNewExhibitStateWithReferencedStateFromPartsTests.java`, `flashlight.adoc`
- **New Exhibit State / New Exhibit Parallel State** · sysml-views / SysML State Transition View · SysON · useful · Grasp: missing
  - What it is: on PartUsage, PartDefinition, StateUsage, StateDefinition nodes and the diagram background (Behavior); no precondition. Creates an ExhibitStateUsage in a FeatureMembership of the selected element (or the ViewUsage owner from the background), isParallel=true for the parallel variant. Opens an optional tree dialog ('Create an Exhibit State:' / 'Create a parallel Exhibit State:'): 'Create a new Exhibit State' (standalone) or select an existing StateUsage, referenced through an added ReferenceSubsetting. Node created in the 'state transition' compartment if the selected node is or contains one; exposed, compartment revealed when run from a node, nothing auto-selected. Icon ExhibitStateUsage.svg. Dialog texts (title = tool name): choices 'Create a new Exhibit State' / 'Create a new Exhibit State Parallel' (described 'Create a new standalone ...') or 'Create an Exhibit State associated with the existing State' / 'Create a parallel Exhibit State associated with the existing State' (described 'Select an existing State to associate to the ... you want to create'); only StateUsages are selectable; status messages 'It will create a new standalone ...', 'Select an existing State to associate to the ...', and 'It will create an Exhibit State associated with <name>' / 'It will create a parallel Exhibit State associated with <name>'. History: 'New ExhibitState' and 'New ExhibitState with referenced State' in 2024.9.0, 'New Exhibit State with referenced State' on Part Usage in 2025.6.0, replaced by these two tools in 2026.5.0.
  - For Grasp: exhibit states, standalone or referencing a state; Grasp has none.
  - Sources: `ExhibitStateNodeToolProvider.java`, `2026.5.0.adoc`, `2025.6.0.adoc`

#### New Reference

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **New Reference dialog** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: Title 'New Reference'. The tool sets no description, so the dialog shows the platform default 'A tool will be executed, choose how to proceed:'. Choices: 'Create a new reference' ('Create a new empty reference') and 'Select an existing element' ('Create a new reference with a selected element'); Features and Classifiers are selectable. A selected Classifier types the new ReferenceUsage, and a selected Feature is referenced by it. Status: 'It will create en empty reference' (sic), 'Select one element to create the new reference', 'It will use <name>'. Offered in background/package Structure and in attribute, item and port palettes (2026.11).
  - For Grasp: New Reference typed by a classifier or referencing a feature; Grasp has no reference usages.
  - Sources: `ReferenceUsageCompartmentNodeToolProvider.java`, `ReferenceUsageNodeToolProvider.java`, `2026.11.0.adoc`
- **New Reference (background and Package node)** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Background Structure and Package-node tool labeled "New Reference"; it creates a ReferenceUsage in the ViewUsage owner (or the package), creates its view as a child of the selected node and exposes it. An optional selection dialog lists Features and Classifiers: a Classifier (e.g. PartDefinition) types the reference, a Feature is reference-subsetted by it (e.g. a reference to a selected PartUsage), and no selection creates an empty ReferenceUsage (dialog since v2026.11.0). Shown only if the current view's tool-availability rule allows creating a ReferenceUsage.
  - For Grasp: creates a reference usage typed by or subsetting a picked element; Grasp has no ref usages.
  - Sources: `ReferenceUsageNodeToolProvider.java`, `PackageNodeDescriptionProvider.java`, `2026.11.0.adoc`

#### "perform actions" compartment

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **"perform actions" compartment** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Lists all perform actions (getAllPerformActions) plus inherited PerformActionUsages. Present on PartUsage, AllocationUsage and InterfaceUsage (PartUsage subtypes except ViewUsage); PartDefinition, AllocationDefinition, ConnectionDefinition and InterfaceDefinition; ActionUsage, AcceptActionUsage, AssignmentActionUsage, CaseUsage, UseCaseUsage, StateUsage, ExhibitStateUsage and PerformActionUsage; ActionDefinition, CaseDefinition, UseCaseDefinition and StateDefinition (parts since v2025.6.0, actions since v2025.6.0). Its palette offers only New Perform Action (Behavior) and Show/Hide, and it accepts drops only of perform-action items from other perform actions compartments.
  - For Grasp: lists the actions a part or action performs; Grasp has no perform actions.
  - Sources: `PerformActionsCompartmentNodeDescriptionProvider.java`, `PerformActionsCompartmentItemNodeDescriptionProvider.java`, `2025.6.0.adoc`

#### "actors" compartment

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **"actors" compartment** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: CaseDefinition, CaseUsage, ConcernDefinition, ConcernUsage, RequirementDefinition, RequirementUsage and SatisfyRequirementUsage nodes have an "actors" compartment listing getActors, with a New Actor tool; it accepts actor items dragged from other case/requirement actors compartments. Introduced on UseCase and Requirement nodes in v2024.9.0, on RequirementUsage/RequirementDefinition (again) in v2026.3.0, and actors were restored in it after a regression in v2025.8.0.
  - For Grasp: actors listed on cases and requirements; Grasp has no actors.
  - Sources: `CaseDefinitionActorsCompartmentNodeDescriptionProvider.java`, `ActorsCompartmentItemNodeDescriptionProvider.java`, `2026.3.0.adoc`

#### New Actor

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **New Actor** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Creates a PartUsage in an ActorMembership of a CaseUsage, CaseDefinition, RequirementUsage or RequirementDefinition (also offered on Use Case, Concern, Concern Definition and View nodes and in actors compartments). The selection dialog shows candidates as a tree (v2025.2.0); since v2026.1.0 a PartDefinition can be picked (it types the actor) as well as a PartUsage (the actor subsets it), and since v2026.5.0 selection is optional (no selection creates an unspecialized actor). Dialog texts (title "New Actor", icon Actor.svg): description "Create an actor:"; options "Create a new actor" ("Create a new actor without specialization") and "Select an existing Element as actor" ("Create a new specialized actor"); status lines "It will create a new actor without specialization", "Select one Element to specialize the new actor" and "It will create an actor specialized with <name>". The actor is exposed, its compartment revealed and it is selected; since v2026.9.0 actors created from ConcernUsage or ConcernDefinition are connected to their parent by an edge.
  - For Grasp: adds an actor to a case or requirement, typed or subsetting a picked part; Grasp has no actors.
  - Sources: `ActorCompartmentNodeToolProvider.java`, `DiagramMutationToolService.java`, `GVSubNodeAnalysisCreationTests.java`

#### "subject" compartment

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **"subject" compartment** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: CaseDefinition, CaseUsage, ConcernDefinition, ConcernUsage, RequirementDefinition, RequirementUsage and SatisfyRequirementUsage nodes have a "subject" compartment whose palette offers New Subject; dropping subject items from other subject compartments uses dropSubjectFromDiagram.
  - For Grasp: a case's or requirement's subject compartment; Grasp has no subjects.
  - Sources: `CaseDefinitionSubjectCompartmentNodeDescriptionProvider.java`, `RequirementUsageSubjectCompartmentNodeDescriptionProvider.java`

#### New Subject

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **New Subject** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Creates a ReferenceUsage named "subject" in a SubjectMembership of a CaseUsage, CaseDefinition, RequirementUsage or RequirementDefinition (node palettes of Case/UseCase/Requirement/Concern/View nodes and subject compartments). Offered only while the element has no subject. The dialog (title "New Subject", icon Subject.svg) "Create a subject:" offers "Create a new subject" ("Create a new subject without specialization") or "Select an existing Element as subject" ("Create a new specialized subject"), with status lines "It will create a new subject without specialization", "Select one Element to specialize the new subject" and "It will create a subject specialized with <name>"; candidates shown as a tree since v2025.1.0/v2025.4.0; since v2026.1.0 any Type can be picked: a Definition types the subject, a Usage makes it subset it. Since v2026.5.0 selection is optional. The subject is exposed, revealed and selected.
  - For Grasp: adds a case's or requirement's subject; Grasp has no subjects.
  - Sources: `SubjectCompartmentNodeToolProvider.java`, `DiagramMutationToolService.java`, `ElementInitializerSwitch.java`

### Packages, imports, notes and view frames (21)

Custom diagram nodes: package folders, namespace imports, comment and documentation notes, and nested view frames.

#### Package node layout and description

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **Package node layout** · diagrams / Diagram: layout, arrangement & edge routing · SysON · useful · Grasp: missing
  - What it is: children of a Package are kept below the header tab with 8 px padding. New children are clamped under the header, a negative x is moved to 8 px, and unplaced children are stacked after their previous sibling. Border nodes are positioned on the package. The package grows to fit its children, border-node footprints and (unless user-resized) its default size. A user-resized package can grow but never shrinks below its content. An empty package uses its default size (fallback 75x50), or, when user-resized, keeps its size with a 75x50 minimum. It is always tall enough for its label plus 16 px. Since 2025.2.0, Package and Namespace Import nodes in the General View can be resized smaller than their default size.
  - For Grasp: packages hold their members under a tab and grow to fit; Grasp has no package nodes.
  - Sources: `SysMLPackageNodeLayoutHandler.ts`, `2025.2.0.adoc`
- **Package node description** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: custom SysMLPackageNodeStyle, square corners, white background, black border, no header, top-centered name truncated with ellipsis (icon if Show Icons is on); free-form interior that can contain all definition, usage and annotating nodes, nested packages, NamespaceImport and ReferenceUsage nodes; resizable in both directions, synchronized, shows exposed packages. The ellipsis on overflowing Package labels was added in 2025.4.0 (General View and State Transition View); the Adjust size tool works on Package nodes since a 2024.7.0 fix.
  - For Grasp: package nodes hold any element, resize, and truncate long names; Grasp has no package nodes.
  - Sources: `AbstractPackageNodeDescriptionProvider.java`, `PackageNodeDescriptionProvider.java`, `2025.4.0.adoc`

#### Package node palette

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **Package node palette** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: Delete from Model; Edit (direct edit); quick-access 'Delete from Diagram' and 'Duplicate Element'; section-less 'New Comment' and 'New Documentation'. Sections Requirements, Structure, Behavior, Analysis, Extension and View as hold the background's metaclass tools, plus 'New Exhibit State' and 'New Exhibit Parallel State' (Behavior) and 'New Namespace Import' and 'New Reference' (Structure), sorted alphabetically. 'View as' (General View, Interconnection View, ActionFlow View, StateTransition View) moves the package into a new typed view. 'Related Elements' and 'Show/Hide' end the palette. Creation tools create the element inside the package through a new OwningMembership, initialize, expose and select it. A 'Drop from Diagram' tool accepts definition, usage, annotating, package, namespace-import and reference nodes.
  - For Grasp: a package's palette creates members inside it; Grasp has no packages.
  - Sources: `PackageNodeDescriptionProvider.java`, `AbstractPackageNodeDescriptionProvider.java`
- **Package node palette** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: same section layout as the background (Requirements, Structure, Behavior, Analysis, Extension, View as) with alphabetically sorted creation tools that create elements in an OwningMembership and expose them; Behavior adds New Exhibit State and New Exhibit Parallel State, Structure adds New Namespace Import and New Reference. Also Delete from Model, Edit label, Drop from Diagram, New Comment and New Documentation outside any section (Documentation since 2025.12.0), Related Elements (nested variants), Show/Hide, quick-access Delete from Diagram and Duplicate Element. View as: General View, Interconnection View, ActionFlow View, StateTransition View, each moving the package into a new typed ViewUsage and creating (but not opening) a diagram for it.
  - For Grasp: a package's palette creates any element inside it; Grasp has no package nodes.
  - Sources: `PackageNodeDescriptionProvider.java`, `AbstractPackageNodeDescriptionProvider.java`, `2025.12.0.adoc`

#### Creation inside packages

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Creation inside packages** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: a Package created inside a Package node appears only inside it, not also at the diagram root (2025.12.0); an element created inside a sub-Package node yields a single graphical node and no longer hides unrelated nodes (2026.1.0).
  - For Grasp: elements created in a package appear only inside it; Grasp has no package nodes.
  - Sources: `2025.12.0.adoc`, `2026.1.0.adoc`

#### Moving and removing nodes inside Package nodes

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Moving and removing nodes inside Package nodes** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: a node can be dragged from the diagram background into a Package node (fixed in 2025.10.0), Delete from Diagram works on elements inside a Package (fixed in 2025.10.0), and children of a Package node keep their positions when the diagram is rendered again after switching tabs (fixed in 2025.6.0). Creating a ReferenceUsage or a sub-Package inside a Package node shows it only inside that Package; a Documentation created on it appears beside the Package.
  - For Grasp: drag nodes into packages and keep their positions; Grasp has no package nodes.
  - Sources: `2025.10.0.adoc`, `2025.6.0.adoc`, `GVPackageTests.java`

#### Recursive Package expose

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Recursive Package expose** · sysml-views / SysML diagram custom nodes & annotations · SysON, experimental · useful · Grasp: missing
  - What it is: checking 'is Recursive' on the Package's expose element in the Details view exposes all contents: the Explorer label gets a '::**' suffix, contained elements appear automatically inside the Package node, no new Expose is created for new children, and Delete from Diagram has no effect on them. _(experimental)_
  - For Grasp: a recursive expose shows a package's whole content automatically; Grasp has no packages or expose.
  - Sources: `manage-existing-elements.adoc`

#### Imported package (NamespaceImport) node

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Imported package (NamespaceImport) node** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: dedicated node (2025.1.0) with SysMLImportedPackageNodeStyle, in the General View and other diagrams and inside packages; package size 200x101 (matched since 2026.1.0), resizable below default (2025.2.0); label shows «visibility» on its own line when not public, then the imported namespace's name, wrapping so nodes can be narrower (2025.4.0). Unsynchronized (appears only when explicitly added), offers every reachable NamespaceImport as candidate, no compartments. Palette: Delete from Model, Related Elements (nested), Show/Hide, quick-access Delete from Diagram and Duplicate Element; no label edit tool.
  - For Grasp: an import shown as its own node with visibility; Grasp has no imports.
  - Sources: `ImportedPackageNodeDescriptionProvider.java`, `MultiLineLabelSwitch.java`, `2025.4.0.adoc`

#### New Namespace Import

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (3):

- **New Namespace Import dialog** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: Requires picking a Package in a dialog (title 'New NamespaceImport', 'Select a Package to import:') and creates a NamespaceImport shown as an imported-package node. Offered from background, package and view palettes (Structure).
  - For Grasp: import a package with a dialog, drawn as an import node; Grasp has no packages or imports.
  - Sources: `NamespaceImportNodeToolProvider.java`, `TreeQuerySelectionDialogService.java`
- **New Namespace Import** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Background Structure tool labeled "New Namespace Import" (NamespaceImport icon) that opens a required (non-optional) tree selection dialog titled "New NamespaceImport" with the text "Select a Package to import:" (only Packages selectable), then creates a NamespaceImport of the chosen package in the ViewUsage owner and shows it as a node under the selected node.
  - For Grasp: imports a package such as SI so its names can be used; Grasp has no imports or libraries.
  - Sources: `SDVDiagramDescriptionProvider.java`, `NamespaceImportNodeToolProvider.java`
- **New Namespace Import** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: in the background Structure section and on Package node palettes (Structure); the ViewUsage frame palette's Structure section does not include it. Opens a required dialog (title 'New NamespaceImport', 'Select a Package to import:', only Packages selectable) with a tree including a non-selectable Libraries item holding non-selectable KerML and SysML directories of library packages (e.g. Libraries > SysML > SI > Namespace > SI, ISQAcoustics). Creates and initializes a NamespaceImport in the ViewUsage owner (background) or selected namespace, importedNamespace set to the pick; node created as child of the selected node or of the diagram; no precondition (nothing created if the owner is not a Namespace); not added to the view's exposed elements. Icon NamespaceImport.svg. Typical use: import SI so units like kilogram can be used.
  - For Grasp: imports a library package such as SI so units like kilogram resolve; Grasp has no libraries.
  - Sources: `NamespaceImportNodeToolProvider.java`, `DiagramMutationToolService.java`, `GVTopNodeCreationTests.java`

#### Add existing nested elements

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Add existing nested elements** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: missing
  - What it is: on Package and imported-package (NamespaceImport) nodes the Related Elements tools are titled "Add existing nested elements" and "Add existing nested elements (recursive)". They show the package's existing members inside the package node.
  - For Grasp: show a package's existing members inside its node; Grasp has no package nodes.
  - Sources: `AbstractPackageNodeDescriptionProvider.java`, `ImportedPackageNodeDescriptionProvider.java`, `ToolDescriptionService.java`

#### Note node rendering

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Note node rendering** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: Comment, Documentation and TextualRepresentation are drawn as an SVG note with a 15px folded top-right corner, fill = background, stroke = border color and width (non-scaling); the container has no border or background, so changing the background changes only the SVG fill (before the 2026.9.0 fix it also changed a Comment's border color); label padded by border width + 8px (right: half border width + 20px); text wraps to the node width.
  - For Grasp: notes drawn with a 15px folded corner; Grasp's notes are numbered pins with their text in the panel.
  - Sources: `SysMLNoteNode.tsx`, `SysMLNoteNode.test.tsx`

#### Note labels «comment», «doc», «rep»

**Grasp: missing** · parts: sysml-views

SysON features encompassed (2):

- **Note labels** · sysml-views / SysML diagram custom nodes & annotations · SysON, experimental · useful · Grasp: missing
  - What it is: annotating-element labels show the body in addition to the declared name, with keyword 'doc' for Documentation and 'comment' for Comment (prefix keywords). In code the multi-line label is: «comment», «doc» or «rep» (TextualRepresentation) on the first line, then the short name and declared name on their own line only when a declared name exists, then a blank line and the body; a TextualRepresentation also shows 'language = <language>' before its body. The direct-edit field is pre-filled with the body. The label icon follows the diagram's Show Icons setting. _(experimental)_
  - For Grasp: note labels «comment», «doc» or «rep» then the body; Grasp has no SysML note nodes.
  - Sources: `general-view.adoc`, `MultiLineLabelSwitch.java`, `AnnotatingNodeDescriptionProvider.java`
- **Note labels «comment», «doc», «rep»** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: a Comment node shows «comment», then the name if declared, then a blank line and the body. Documentation shows «doc», then the name, then the body. A TextualRepresentation shows «rep», then the name, then 'language = <language>', then the body. The «doc» and «comment» keywords were added to these labels in 2024.11.0; end-to-end tests show a new documentation as '«doc»', blank line, 'add doc here' and a new comment as '«comment»', blank line, 'add comment here', and typing a new text on them replaces the body.
  - For Grasp: note labels «comment», «doc», «rep» with their body; Grasp has no SysML note nodes.
  - Sources: `MultiLineLabelSwitch.java`, `DiagramQueryLabelService.java`

#### Direct edit of comment, documentation and textual-representation bodies

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Direct edit of comment, documentation and textual-representation bodies** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: on a Comment, Documentation or TextualRepresentation (node or documentation list item), direct edit starts with the body text and writes the edited text to `body` instead of `declaredName`; a blank text sets the body to null. Every other element gets `declaredName`.
  - For Grasp: direct edit on a note changes its body; Grasp has no SysML note nodes.
  - Sources: `AttributeToDirectEditSwitch.java`, `DiagramQueryLabelService.java`

#### ViewUsage frame palette

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **ViewUsage frame palette** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: Delete from Model; Edit; a single quick-access 'Delete from Diagram'; section-less 'New Comment', 'New Documentation' and 'New Textual Representation'. The six sections hold one tool per section metaclass, sorted alphabetically, plus 'New Exhibit State' and 'New Exhibit Parallel State' in Behavior. Its 'View as' tools retype the ViewUsage itself. It has Show/Hide but no Related Elements. Creation tools create the element in the ViewUsage's owner (not inside the ViewUsage) through a new OwningMembership, initialize it, expose it in the frame and select it.
  - For Grasp: a view frame's palette creates members exposed in the frame; Grasp's frame tab selects the view only.
  - Sources: `ViewUsageNodeDescriptionProvider.java`

#### Documentation as note node

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Documentation as note node** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: partly
  - What it is: dragging a Documentation from the Explorer shows it as a Note linked by an edge to the documented element, only when that element is on the diagram (2024.11.0). In every standard view a Documentation is a node of its own only when owned by a Package, NamespaceImport or ViewUsage; otherwise it appears elsewhere, e.g. in a documentation compartment.
  - For Grasp: documentation dropped from the tree shows as a linked note; Grasp shows doc only in the doc compartment.
  - Sources: `2024.11.0.adoc`, `ViewFilterSwitch.java`

#### Comment as note node

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Comment as note node** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: partly
  - What it is: Comments appear as Note nodes from Explorer drag and drop or a New Comment palette tool (including the General View background since 2026.1.0), linked by an edge to the annotated element, only when it is on the diagram.
  - For Grasp: comments as notes linked to the element; Grasp pins its own notes, exported as issues rather than SysML comments.
  - Sources: `2024.11.0.adoc`, `SDVDiagramDescriptionProvider.java`, `2026.1.0.adoc`

#### New Comment / Documentation / Textual Representation on any node

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **Section-less node tools** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: Every Definition and Usage node palette also has three tools outside any section: New Comment (in an OwningMembership), New Documentation (doc compartment tool) and New Textual Representation (in an OwningMembership). Dependency edges get a section-less New Comment that annotates the relationship, and Transition edges a section-less New Comment.
  - For Grasp: every node can get a comment, documentation or textual representation; Grasp adds notes, a doc field and code links instead.
  - Sources: `SDVNodeToolsWithoutSectionSwitch.java`
- **New Comment / New Documentation / New Textual Representation (section-less)** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: partly
  - What it is: every Usage and Definition node palette has these three tools outside any section: New Comment and New Textual Representation via an OwningMembership, New Documentation as a compartment item tool; e.g. New Textual Representation on a PartDefinition creates a linked node whose body is direct-editable (General View since 2025.4.0); New Documentation on a requirement creates a 'doc' whose text can be typed.
  - For Grasp: every node can get a comment, documentation or textual representation; Grasp has notes, a doc field and code links exported as rep.
  - Sources: `SDVNodeToolsWithoutSectionSwitch.java`, `GVAnnotatingElementTests.java`, `flashlight.adoc`

#### Annotation edge

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **Annotation edge** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: Dashed black 1px edge without arrows from a Comment, Documentation or TextualRepresentation note to its annotated element; the target can be any non-compartment node other than comments and documentation, or a Dependency, TransitionUsage or SatisfyRequirementUsage edge (comments created with New Comment on those edges are linked this way). Not deletable from the diagram; target reconnection moves the annotation to the new element, source reconnection does nothing.
  - For Grasp: dashed line from a comment or doc to what it annotates, edges included; Grasp pins notes on elements and lines instead.
  - Sources: `AnnotationEdgeDescriptionProvider.java`, `GVEdgeOnEdgeTests.java`
- **Annotation edge** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: partly
  - What it is: dashed black edge with no arrowheads from a Comment, Documentation or TextualRepresentation node to its annotatedElement; target can be any non-compartment node other than comments and documentation, or a Dependency, TransitionUsage or SatisfyRequirementUsage edge. Cannot be deleted from the diagram. Reconnecting the target moves the annotating element to the new target (refused for Comment and Documentation targets; warning "Unable to move X in Y: reason" on failure); source reconnection does nothing.
  - For Grasp: dashed annotation line from a note to what it annotates; Grasp pins notes on elements and lines instead.
  - Sources: `AnnotationEdgeDescriptionProvider.java`, `DiagramMutationToolService.java`

#### Note node layout

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Note node layout** · diagrams / Diagram: layout, arrangement & edge routing · SysON · useful · Grasp: partly
  - What it is: a note without stored layout defaults to 200x70, or its description's defaults. The width keeps the current or forced width, and the height is at least the label height plus borders. User-resized notes keep their size unless it is smaller than that minimum. The aspect ratio is kept when the node description requires it.
  - For Grasp: SysON note nodes size to their text; Grasp's notes are pins with panel text, not SysML comment boxes.
  - Sources: `SysMLNoteNodeLayoutHandler.ts`, `SysMLNoteNodeConverter.ts`

#### ViewUsage frame node

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **ViewUsage frame node** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: partly
  - What it is: an exposed ViewUsage (General View create/display since 2025.6.0) is drawn as a 'framed view' node (SysML v2 8.2.3.26): custom SysMLViewFrameNodeStyle, radius 10, white background, black border, free-form layout, centered top label truncated with ellipsis (reading «view» name followed by ': Type' on one line, after any occurrence prefixes such as «abstract» or «variation»), no header separator, 200x101 default, resizable in both directions, synchronized, with a dedicated palette Appearance section in the code (whose registration, at v2026.11.0, targets note nodes instead; see Custom node appearance). It is itself one of the diagram ViewUsage's exposed elements and shows the ViewUsage's exposed elements; it can nest definition, usage, annotating and package nodes (element placement inside since 2025.12.0) but not NamespaceImport or ReferenceUsage nodes. Its palette is the background palette of a diagram created on the containing element.
  - For Grasp: a view shown inside another view as a «view» name : Type frame; Grasp labels its frames this way but can't nest them.
  - Sources: `ViewUsageNodeDescriptionProvider.java`, `display_view_usages_in_diagrams.adoc`, `SysONExtensionRegistry.tsx`

#### View frame node layout

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **View frame node layout** · diagrams / Diagram: layout, arrangement & edge routing · SysON · useful · Grasp: partly
  - What it is: view frames (ViewUsage frames) lay out children like packages: below the header with 8 px padding, growing to fit content and border nodes, respecting user resize. The difference is that an existing child is pushed below the header only if its previous position was above it.
  - For Grasp: a view frame holds the elements a view shows; Grasp's views are frames that grow, but not nested inside other views.
  - Sources: `SysMLViewFrameNodeLayoutHandler.ts`

#### Custom node interactions

**Grasp: partly** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **Custom node interactions** · diagrams / Diagram: selection, editing & direct manipulation · SysON · useful · Grasp: partly
  - What it is: SysON's four custom nodes (package, imported package, note, view frame) show resize and edge-creation handles when selected, a connection target handle on hover, existing connection handles and decorators, accept drops onto themselves and show drop and connection feedback styles.
  - For Grasp: package, import, note and view frame nodes take drops and connections like other nodes; Grasp has view frames and notes but no package or import nodes.
  - Sources: `SysMLPackageNode.tsx`, `SysMLNoteNode.tsx`, `SysMLViewFrameNode.tsx`
- **Custom node interactions** · sysml-views / SysML diagram custom nodes & annotations · Sirius Web · useful · Grasp: partly
  - What it is: package, imported package, note and view frame nodes support the standard Sirius Web node interactions: a Resizer, connection creation handles when selected, a connection target handle, existing connection handles, decorators, drop handling with drop feedback, connector and connection-line feedback styles, a 1px outline in the theme's selected color when selected or hovered, and 0.4 opacity when faded. _(Sirius Web)_
  - For Grasp: resize handles, connection handles, selection outline and fading; Grasp outlines selection and hover but has no handles or resizing.
  - Sources: `SysMLPackageNode.tsx`, `SysMLViewFrameNode.tsx`

#### Custom node layout

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Custom node layout** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: partly
  - What it is: package and view frame nodes lay out their children below the header label and inside the padding, keep a moved child's previous position (pushed below the header if needed), and grow to fit their children and their north and south border nodes, never below the default size unless resized by the user; a user-resized node keeps its size but never shrinks below its content, and an empty one has a minimum of 75x50 (or the label height). Note nodes ignore children, default to 200 wide and grow in height to fit the label plus borders, keeping aspect ratio when the description asks for it.
  - For Grasp: packages and frames grow to fit children, keep user sizes, and have minimum sizes; Grasp's boxes grow to fit but can't be resized.
  - Sources: `SysMLPackageNodeLayoutHandler.ts`, `SysMLViewFrameNodeLayoutHandler.ts`, `SysMLNoteNodeLayoutHandler.ts`

### Compartments and inherited members (17)

List and free-form compartments on nodes, their visibility rules, and inherited features shown with ^.

#### Show Inherited Members from Standard Libraries

**Grasp: missing** · parts: diagrams, model

SysON features encompassed (2):

- **Show Inherited Members from Standard Libraries** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: missing
  - What it is: a separate checkbox controlling whether inherited features that come from the KerML/SysML standard libraries appear, in compartments and as inherited port border nodes. Tooltip "Hide Inherited Members from Standard Libraries in Diagrams" or "Show Inherited Members from Standard Libraries in Diagrams". It calls the `showDiagramsInheritedMembersFromStandardLibraries` mutation. Default false, yet like the other two it renders checked until the server value has loaded, with the tooltip "Show/Hide Inherited Members from Standard Libraries in Diagrams". Test id `ShowHideDiagramInheritedMembersFromStandardLibrariesCheckbox`. Errors are stored but not displayed.
  - For Grasp: optionally include members inherited from the standard libraries; Grasp shows no inherited members.
  - Sources: `ShowHideDiagramsInheritedMembersFromStandardLibraries.tsx`, `ShowDiagramsInheritedMembersFromStandardLibrariesEventHandler.java`
- **'Show Inherited Members from Standard Libraries' diagram option** · model / Libraries, standard library & publication · SysON · useful · Grasp: missing
  - What it is: a checkbox in the diagram panel menu (testid ShowHideDiagramInheritedMembersFromStandardLibrariesCheckbox) shows or hides, in diagrams, the members that elements inherit from standard-library types; a 'Show/Hide Inherited Members from Standard Libraries in Diagrams' tooltip shows until the current value has loaded. Tooltip: 'Show Inherited Members from Standard Libraries in Diagrams' (unchecked) / 'Hide Inherited Members from Standard Libraries in Diagrams' (checked). It is one server-wide value, not per diagram: default false, set by `org.eclipse.syson.show.diagrams.inherited.members.from.standard.libraries`. The menu is opened from the diagram toolbar's 'Diagrams Options' button (down-arrow icon, testid syson-diagram-panel-menu-icon), where this checkbox sits below 'Show Icons' and 'Show Inherited Members'. The menu opens automatically after 400 ms when the URL has `showIcons=false`. Until the server value has loaded the checkbox is drawn checked, and a click updates it right away without waiting for the server. It isn't disabled in read-only diagrams. Toggling it sends `showDiagramsInheritedMembersFromStandardLibraries(show)` as an editing-context mutation; only the diagram it was toggled from is refreshed (as a visibility change), and other open diagrams pick up the new value at their next refresh. Error payloads and network errors ('An unexpected error has occurred, please refresh the page') are stored in the component but never displayed; only a failure to load the initial value shows a toast. The value is held in memory by a server singleton, so a toggle affects every user and project at once and reverts to the property value on restart. It combines with the general 'Show inherited members' option: with inherited members on and this off, members inherited from standard-library types are dropped from inherited compartments; with this on and inherited members off, only standard-library inherited members are kept; with both on, all are shown. Added in v2024.9.0.
  - For Grasp: show or hide members inherited from library types in diagrams; Grasp has no library types to inherit from.
  - Sources: `ShowHideDiagramsInheritedMembersFromStandardLibraries.tsx`, `ShowDiagramsInheritedMembersService.java`, `2024.9.0.adoc`

#### Compartments hidden by default (nodes start collapsed)

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Compartments hidden by default (nodes start collapsed)** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: missing
  - What it is: every compartment of a SysON definition or usage node starts hidden (isHiddenByDefault true), in the General View and the Action Flow View alike, so new and dropped nodes appear collapsed. The user reveals compartments through Show/Hide, Manage visibility or creation tools. Creating a compartment item expands the node, revealing only the compartment that receives the new child. Exceptions: the "interconnection" free-form compartment (Interconnection View only) is visible by default when the element exposes part usages, action usages or satisfy requirement usages, and the "ends" compartments of AllocationDefinition and ConnectionDefinition are always visible.
  - For Grasp: new nodes start collapsed and compartments open as content is added; Grasp shows every non-empty compartment at once.
  - Sources: `AbstractCompartmentNodeDescriptionProvider.java`, `DiagramQueryViewService.java`, `manage-elements-diagram.adoc`

#### Inherited compartment items computation

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Inherited compartment items computation** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: missing
  - What it is: a compartment lists the type's inherited features that match the compartment's reference. Features already specialized (redefined or subsetted) by owned features or by other inherited features are removed, and the type itself is never included. With both inherited-members flags off nothing is listed. With only "inherited members" on, standard-library features are excluded. With only "from standard libraries" on, only standard-library features are kept. With both on, all are shown. Inherited features in compartments were introduced in 2024.5.0; since 2026.7.0 inherited behavior parameters also appear in the "parameters" compartment of ActionDefinition and ActionUsage nodes. Inheritance was then extended compartment by compartment: "states" and "exhibit states" (2026.7.0), then "perform actions", the "items" of ports and port definitions, "assume constraints", "require constraints", "frames", "satisfy requirements", "stakeholders", "objective", "actors" and "subject" (2026.9.0), as well as inherited parameter and item border nodes on actions and ports (2026.9.0). Backend tests check each case through subclassification and reference subsetting; a subject created in a UseCaseDefinition is not shown in the "parameters" compartment of an ActionDefinition that subclasses it.
  - For Grasp: which inherited features each compartment lists, with redefinitions removed; Grasp shows no inherited features.
  - Sources: `DiagramQueryToolService.java`, `GVCompartmentItemInheritanceTests.java`, `CHANGELOG.adoc` v2026.9.0

#### Reveal a suitable compartment after creation

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Reveal a suitable compartment after creation** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: missing
  - What it is: after a tool creates a child element (child creation, nesting edge tools), SysON reveals a hidden compartment of the target node that can display it. It does so only if no currently visible compartment can already show the element: since 2026.5, in an Interconnection View the parts compartment is not revealed if "interconnection" is visible. Tests of New Part on a PartDefinition in an Interconnection View show the four cases: nothing visible reveals only "interconnection"; "interconnection" visible keeps it alone; "parts" visible keeps "parts" alone and does not reveal "interconnection"; both visible stay visible. Candidates are searched in the node first, then in the whole diagram. In an Interconnection View the "interconnection" compartment is preferred; elsewhere the first free-form compartment is preferred over list compartments. Ports never trigger a reveal. Actions, constraints, states, and occurrence definitions and usages (including parts and items) trigger one only outside the General View. Perform actions, control nodes, unsynchronized elements and every other element always trigger one. Since 2026.11.0 the same reveal runs in Interconnection Views after the connector tools Add target as nested, Become nested and Add target as owned reparent an element: an already visible suitable compartment of the new parent is kept, otherwise its "interconnection" compartment is revealed; nesting a parent under its own child changes neither ownership nor visibility.
  - For Grasp: creating a child reveals a compartment that can show it; Grasp's compartments are never hidden.
  - Sources: `DiagramMutationCompartmentService.java`, `IVNestedUsageCompartmentRevealTests.java`, `2026.11.0.adoc`

#### Revealing a compartment hides duplicate tree nodes

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Revealing a compartment hides duplicate tree nodes** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: missing
  - What it is: in a General View, when a compartment is shown, a sibling node is automatically hidden if it is linked to the compartment's parent by a composition edge and represents an element now listed in the compartment, so the same element is not shown twice. For example, revealing an action's "action flow" or "actions" compartment hides the composed sub-action's background node, while revealing "items" keeps it. In code, the hidden nodes are targets of any edge leaving the compartment's parent whose element matches one of the compartment's child nodes. The handler takes precedence over Sirius Web's for every hide request on a General View. Its class comment also describes the reverse (hiding a compartment shows the tree node and its edge again), but v2026.11.0 does not implement it, so hiding the compartment leaves the tree node hidden.
  - For Grasp: showing a compartment hides the duplicate tree node so nothing shows twice; Grasp shows each element once per view by nesting.
  - Sources: `SysONShowHideSDVElementEventHandler.java`, `GVNestedAndTreeVisibilityTests.java`

#### "parts" compartments

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **"parts" compartments** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: A "parts" compartment, hidden by default, lists nested PartUsages of a PartUsage node (v2026.1.0, enable it via Manage Visibility); PartDefinition, ConnectionDefinition, AllocationDefinition and InterfaceDefinition nodes have a parts compartment (v2026.3.0).
  - For Grasp: a parts list on parts and definitions, hidden by default; Grasp shows nested parts only graphically.
  - Sources: `2026.1.0.adoc`, `2026.3.0.adoc`

#### "enums" compartment

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **"enums" compartment** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: The EnumerationDefinition compartment for enumerated values is named "enums" (formerly "enumerations") per the SysML v2 specification (v2026.3.0).
  - For Grasp: enumeration defs list their values under enums; Grasp has no enumerations.
  - Sources: `2026.3.0.adoc`

#### Inherited port, item and parameter border nodes

**Grasp: missing** · parts: sysml-views

SysON features encompassed (2):

- **Inherited port border nodes** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Inherited PortUsages appear as border nodes labeled with a "^" prefix (v2025.12.0), controlled by the Show inherited members option (hidden when it is off). Their palette only has Show/Hide (no rename or delete), but they still offer the bind, connect, flow and interface tools; edge tools started from or targeting them do not redefine them (in v2025.12.0, connecting an inherited port first redefined it; since v2026.3.0 the bind, flow and interface tools use inherited elements as they are, like New Connection). A specialized port replaces the inherited one, and a port inherited through several supertypes is shown once.
  - For Grasp: inherited ports appear as ^-prefixed border nodes and can be connected; Grasp shows nothing inherited.
  - Sources: `InheritedPortUsageBorderNodeDescriptionProvider.java`, `GVInheritedPortTests.java`, `display_inherited_ports_as_border_nodes.adoc`
- **Inherited port, item and parameter border nodes** · sysml-views / SysML Interconnection View · SysON · useful · Grasp: missing
  - What it is: separate border-node descriptions show the inherited members of the owner (from its inherited compartment items) as border nodes whose label is the border-node label prefixed with '^'. Their palette has only the Show/Hide section, so they cannot be deleted, edited or duplicated; since 2026.9.0 they (like inherited compartment items) also no longer get the New Expression, Edit Expression and Delete Expression tools. Inherited ports became border nodes in 2025.12.0. Inherited ports keep all four edge tools (bind, connect, flow, interface); inherited items and parameters keep bind and flow.
  - For Grasp: inherited ports, items and parameters as ^ border nodes, connectable but not editable; Grasp shows nothing inherited.
  - Sources: `InheritedPortUsageBorderNodeDescriptionProvider.java`, `InheritedItemUsageBorderNodeDescriptionProvider.java`, `InheritedReferenceUsageBorderNodeDescriptionProvider.java`

#### Inherited content in free-form compartments

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Inherited content in free-form compartments** · sysml-views / SysML Action Flow View · SysON · useful · Grasp: missing
  - What it is: action flow, state transition and interconnection compartments of a specialized element show inherited sub-actions, successions and control nodes (Fork, Join, Decision, Merge), named with a '^' prefix, with their border nodes. Inherited edges cannot be reconnected; redefinitions inside the inherited flow are not yet resolved.
  - For Grasp: specialized actions show inherited sub-actions and successions with ^; Grasp shows nothing inherited.
  - Sources: `free_form_compartment_inheritance.adoc`, `CHANGELOG.adoc` v2026.11.0

#### Graphical inheritance of nested elements

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Graphical inheritance of nested elements** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: An element specializing a base shows the base's nested elements as inherited compartment items and inherited border nodes.
  - For Grasp: a specialization shows the general element's nested features as inherited; Grasp shows nothing inherited.
  - Sources: `GVCompartmentItemInheritanceTests.java`, `GVBorderNodeInheritanceTests.java`, `GVInterfaceDefinitionEndsCompartmentItemInheritanceTests.java`

#### Inherited member computation and flag combination

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Inherited member computation and flag combination** · model / Model semantics & editing services · SysON · useful · Grasp: missing
  - What it is: inherited compartment items and border nodes come from the type's inheritedFeature list filtered to the compartment's reference type, removing features already specialized (redefined) by an owned or another inherited feature, and the type itself. Both flags off: nothing; only Show Inherited Members: standard-library features excluded; only Standard Libraries flag: only library features; both: all.
  - For Grasp: inherited members can show in compartments and on borders; Grasp doesn't draw inherited members.
  - Sources: `DiagramQueryToolService.java`

#### Free-form compartments grow with their node

**Grasp: partly** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **Free-form compartments grow inside SysON nodes** · diagrams / Diagram: layout, arrangement & edge routing · SysON · useful · Grasp: partly
  - What it is: in definition and usage nodes, every reused free-form child compartment (action flow, state transition, interconnection) is registered as a growable node of the parent's list layout, so it takes the remaining height when the node is resized. The interconnection compartment was made growable in 2026.1.0; resizing a part in an Interconnection View changes both the width and the height of its interconnection compartment.
  - For Grasp: action flow, state and interconnection compartments fill a resized node; Grasp nests what a box holds inside it, with no named compartment or resizing.
  - Sources: `AbstractUsageNodeDescriptionProvider.java`, `diagram.spec.ts`, `CHANGELOG.adoc` v2026.1.0
- **Growable interconnection compartment** · sysml-views / SysML Interconnection View · SysON · useful · Grasp: partly
  - What it is: the interconnection compartment grows with its parent node; resizing a part node resizes its interconnection compartment showing nested parts, in both width and height (made growable in 2026.1.0).
  - For Grasp: the compartment grows when the part is resized; Grasp's boxes grow with their content but can't be resized by hand.
  - Sources: `CHANGELOG.adoc` v2026.1.0, `diagram.spec.ts`

#### Free-form compartments inside list nodes

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Free-form compartments inside list nodes** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: partly
  - What it is: a node can contain free-form compartments, whose children are laid out freely, even inside a list layout. _(Sirius Web)_
  - For Grasp: free-form compartments inside list nodes hold freely laid out children; Grasp nests boxes inside boxes but not inside a named compartment.
  - Sources: `CHANGELOG.adoc` v2023.3.0

#### Compartment emptiness rules for single-entry compartments

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Compartment emptiness rules for single-entry compartments** · diagrams / Diagram: visibility, filtering & presentation · SysON · useful · Grasp: partly
  - What it is: SysON's semantic emptiness checks are preconditions of creation tools, not of the valued-content tools (those look only at graphical child nodes). New Subject is offered only while the requirement's subject compartment is empty (no subject membership), New Objective only while the use case has no objective membership, New Entry/Do/Exit Action only while the state has no subaction of that kind, and the accept action's payload and receiver tools only while it has no payload or receiver (memberships and typings).
  - For Grasp: single-entry compartments offer a creation tool only while empty; Grasp refuses a second entry action in words.
  - Sources: `DiagramQueryToolService.java`, `SubjectCompartmentNodeToolProvider.java`, `StateSubactionNodeToolProvider.java`

#### "ends" compartments

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **"ends" compartments** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: AllocationDefinition and ConnectionDefinition nodes show an always-visible "ends" compartment (connectionEnd) with a New End tool; InterfaceDefinition shows an "ends" compartment (getInterfaceEnds) with New Port as end. Ends from the standard library are filtered out, inherited ends appear with "^" (a sub InterfaceDefinition inherits the base's port ends), and the compartments accept no drops. AllocationDefinition's ends compartment lists only end Usages (v2024.5.0). Since v2026.3.0 rows no longer show the "end" keyword and direct edit on them changes only the end's name, not the full label.
  - For Grasp: connection, allocation and interface defs list their ends; Grasp shows interface ends only as border ports.
  - Sources: `ConnectionDefinitionEndsCompartmentNodeDescriptionProvider.java`, `InterfaceDefinitionEndsCompartmentNodeDescriptionProvider.java`, `2026.3.0.adoc`

#### "items" compartments on ports

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **"items" compartments on ports** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: PortDefinition (ownedItem) and PortUsage (nestedItem) nodes have an items compartment (v2026.1.0) listing only elements whose exact type is ItemUsage, so parts and other ItemUsage subtypes are not listed.
  - For Grasp: ports and port defs list their items; Grasp puts directed items in port defs without a titled list.
  - Sources: `PortDefinitionOwnedItemCompartmentItemNodeDescriptionProvider.java`, `PortUsageNestedItemCompartmentItemNodeDescriptionProvider.java`, `2026.1.0.adoc`

#### Inherited memberships

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Inherited memberships** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: a type inherits the non-private memberships of its conjugated original type and of each general type in its specializations, only through Specialization or Conjugation, not composition (owning Usage memberships removed, v2024.9.0); inherited members whose names clash with the type's own are hidden.
  - For Grasp: a type inherits its supertypes' non-private members, own names winning; Grasp works out inherited features by name but has no visibility.
  - Sources: `MembershipComputer.java`, `2024.9.0.adoc`

### Interconnection View notation (11)

The Interconnection View: parts, ports and items on borders, and interface, flow, binding and connection edges.

#### Attributes compartment in child parts

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Attributes compartment in child parts** · sysml-views / SysML Interconnection View · SysON · useful · Grasp: missing
  - What it is: child PartUsage nodes in the Interconnection View have an attributes compartment.
  - For Grasp: child parts show an attributes compartment; Grasp has no attributes.
  - Sources: `2024.5.0.adoc`

#### Root-level elements

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Root-level elements** · sysml-views / SysML Interconnection View · SysON, experimental · useful · Grasp: partly
  - What it is: from the root Usage the view can display Usage parts, ports, and annotating elements (Documentation and Comment). _(experimental)_
  - For Grasp: the root usage can show parts, ports, comments and documentation; Grasp shows parts and ports but no annotating elements.
  - Sources: `interconnection-view.adoc`

#### ConjugatedPortDefinition support

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **ConjugatedPortDefinition support** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: ConjugatedPortDefinition is handled in diagrams, the Explorer and the Details view (v2024.5.0) and its label shows its actual name instead of "null" (v2024.9.0). Creating a PortDefinition automatically creates its ConjugatedPortDefinition in an OwningMembership linked by a PortConjugation; the conjugated definition's name always mirrors the PortDefinition's name.
  - For Grasp: each port def gets its conjugated port def automatically; Grasp conjugates a typing with ~ but holds no conjugated port def element.
  - Sources: `ElementInitializerSwitch.java`, `2024.5.0.adoc`, `CHANGELOG.adoc` v2024.9.0

#### Part compartment content

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Part compartment content** · sysml-views / SysML Interconnection View · SysON, experimental · useful · Grasp: partly
  - What it is: a Usage part's compartment can display documentation, attribute, part and port elements. _(experimental)_
  - For Grasp: a part's compartments show doc, attributes, parts and ports; Grasp lacks attributes.
  - Sources: `interconnection-view.adoc`

#### PartUsage node palette

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **PartUsage node palette** · sysml-views / SysML Interconnection View · SysON · useful · Grasp: partly
  - What it is: Structure: New Item, New Item In, New Item Inout, New Item Out, other compartment-item tools, New Action (action-flow variant), New Subsetting, New Feature Typing (only if the matching definition node exists), Set as composite, Set as ref, New Binding Connector As Usage, New Flow, New Interface. Behavior: New Start Action, New Done Action, New Join, New Fork, New Merge, New Decision (all hidden by the control-node precondition), New Accept Action, New Assignment Action, New Perform Action, New Exhibit State, New Exhibit Parallel State, New Timeslice, New Snapshot, New State, New Parallel State. Requirements: New Satisfy Requirement, New Satisfy. View as: General View, Interconnection View. Then Related Elements.
  - For Grasp: the part's right-click palette in this view; Grasp offers parts and ports from its top palette.
  - Sources: `SDVNodeToolSectionSwitch.java`

#### Border node palettes and labels

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Border node palettes and labels** · sysml-views / SysML Interconnection View · SysON · useful · Grasp: partly
  - What it is: owned port, item and parameter (ReferenceUsage) border nodes share one palette: Delete from Model, Edit (label direct edit, pre-filled with the default initial direct-edit label), the Show/Hide section, and quick-access Duplicate Element. Their outside label is the declared name followed by the typing (': Type'), redefinition and subsetting parts. Edge tools: port border nodes offer New Binding Connector As Usage (bind), New Connection (connect), New Flow (flow) and New Interface (connect); item and parameter border nodes offer only bind and flow. The bind, interface and flow tools on PortUsage border nodes reached the General View in 2025.4.0, when PortUsages became border nodes of PartUsage nodes there too.
  - For Grasp: border nodes share delete, edit and duplicate, labelled 'name : Type'; Grasp deletes and edits ports but can't duplicate.
  - Sources: `PortUsageBorderNodeDescriptionProvider.java`, `2025.4.0.adoc`, `ItemUsageBorderNodeDescriptionProvider.java`, `DiagramQueryLabelService.java`

#### Port-to-port edge kind choice

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Port-to-port edge kind choice** · sysml-views / SysML Interconnection View · SysON · useful · Grasp: partly
  - What it is: connecting two ports offers a choice of InterfaceUsage or BindingConnector usage, representing how parameter values relate and propagate.
  - For Grasp: connecting two ports offers interface or binding; Grasp asks for the line kind first, through the palette.
  - Sources: `parametric-modeling.adoc`

#### Item border nodes on actions and ports

**Grasp: partly** · parts: sysml-views

SysON features encompassed (3):

- **Item border nodes** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: ActionDefinition/PortDefinition (ownedItem) and ActionUsage/PortUsage (nestedItem) nodes show their items (exact ItemUsage type) as 10x10 border nodes with the same square style and rotatable in/out/inout direction images as ports, and an outside bottom-centered label. Palette: Delete from Model, Edit, Show/Hide, quick access Duplicate Element; edge tools New Binding Connector As Usage (bind) and New Flow (flow). Items created with direction in, out or inout on an action show as border nodes and as rows in the items compartment, and also as sibling nodes. On actions since v2025.6.0, on PortDefinition and PortUsage since v2026.1.0. Since v2026.9.0, an ItemUsage without direction created on an ActionUsage or ActionDefinition whose items compartment is collapsed is also shown as a border node instead of a separate node linked by a composition edge, so directed and undirected items behave the same; v2026.1.0 fixed items created from actions not being revealed.
  - For Grasp: items drawn as small directed squares on action and port borders; Grasp draws an action's parameters this way but items elsewhere as boxes.
  - Sources: `ItemUsageBorderNodeDescriptionProvider.java`, `AbstractItemUsageBorderNodeDescriptionProvider.java`, `GVItemUsageTests.java`
- **ItemUsage border nodes** · sysml-views / SysML Interconnection View · SysON · useful · Grasp: partly
  - What it is: ItemUsage is handled in the Interconnection View (2024.9.0) as border nodes with outside labels, whose image depends on direction (feature_in.svg, feature_out.svg, feature_inout.svg), with an inherited-item variant; items can be flow sources and targets.
  - For Grasp: items as directed border squares that can be flow ends; Grasp draws items as boxes, border squares only for action parameters.
  - Sources: `AbstractItemUsageBorderNodeDescriptionProvider.java`, `InheritedItemUsageBorderNodeDescriptionProvider.java`
- **Items on actions** · sysml-views / SysML Action Flow View · SysON · useful · Grasp: partly
  - What it is: New Item, New Item In, New Item Inout, New Item Out tools create items on ActionDefinition (since 2024.7.0) and ActionUsage, e.g. New Item Out creates an output item parameter 'outdcPwr'. The new ItemUsage is revealed (2026.1.0). On action nodes whose items compartment is collapsed, an undirected ItemUsage is shown as a border node rather than a separate node with a composition edge, like directed items (2026.9.0).
  - For Grasp: items, directed or not, on actions as border nodes; Grasp's action parameters are directed items, undirected ones aren't offered.
  - Sources: `flashlight.adoc`, `2026.1.0.adoc`, `2026.9.0.adoc`

#### Connector ends from border-node parents

**Grasp: unclear** · parts: model

SysON feature encompassed (1):

- **Connector ends from border-node parents** · model / Model semantics & editing services · SysON · useful · Grasp: unclear
  - What it is: when a connector, binding, flow or interface is drawn from/to a border node, the end's container is the semantic element of the border node's graphical parent, not the feature's owner, so connectors reach inherited or nested features (e.g. part1.port1) via feature chains.
  - For Grasp: an end reaches a port through the part it's drawn on, inherited ports included; Grasp chains through the part, inherited ports undocumented.
  - Sources: `DiagramMutationElementService.java`

#### Connecting to an inherited port uses it without redefining it

**Grasp: unclear** · parts: model

SysON feature encompassed (1):

- **Connecting to an inherited port uses it without redefining it** · model / Model semantics & editing services · SysON · useful · Grasp: unclear
  - What it is: since v2026.3.0 the 'New Binding Connector As Usage (bind)', 'New Flow (flow)' and 'New Interface (connect)' edge tools started from and/or targeting an inherited port border node (label prefixed '^', e.g. '^fuelInPort : FuelPort') reference the inherited feature directly through a feature-chain end (e.g. `bind port1 = v1.fuelInPort`), as the 'New Connection (connect)' tool already did; no redefinition is added to the owner and the inherited border node stays as it was. Inherited port border nodes offer no rename or delete tools.
  - For Grasp: connecting an inherited port references it by chain, adding no redefinition; Grasp writes same-named ports as redefinitions, and inherited port display isn't documented.
  - Sources: `GVInheritedPortTests.java`, `2026.3.0.adoc`, `CHANGELOG.adoc` v2025.12.0

#### Direction of a feature relative to a type

**Grasp: unclear** · parts: model

SysON feature encompassed (1):

- **Direction of a feature relative to a type** · model / Model semantics & editing services · SysON · useful · Grasp: unclear
  - What it is: Type.directionOf(feature) returns the feature's own direction when the type owns it; otherwise it asks the supertypes (cycle-safe, first answer wins), and in a conjugated type an inherited 'in' becomes 'out' and 'out' becomes 'in' ('inout' unchanged), so a port typed by a conjugated port definition sees reversed directions. Feature.directionFor(type) delegates to it.
  - For Grasp: a conjugated port sees its items' directions reversed; Grasp's port glyph shows direction, its handling of conjugation isn't documented.
  - Sources: `TypeImpl.java`, `FeatureImpl.java`

### Action Flow View notation (12)

The Action Flow View: actions and their palettes, parameters, control nodes, successions and guards.

#### New Assignment Action

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **New Assignment Action** · sysml-views / SysML Action Flow View · SysON · useful · Grasp: missing
  - What it is: creates an AssignmentActionUsage in a FeatureMembership; only an ActionUsage or ActionDefinition owner gets one: the tool is also listed on PartUsage, PartDefinition and PerformActionUsage palettes but on parts leaves the model unchanged.
  - For Grasp: assignment actions; Grasp has none.
  - Sources: `AssignmentActionNodeToolProvider.java`, `DiagramMutationToolService.java`

#### 'items' compartment

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **'items' compartment** · sysml-views / SysML Action Flow View · SysON · useful · Grasp: missing
  - What it is: lists the action's in/out item parameters with direction prefixes; a bound value reads 'name = value'; shown through the node's eye icon (Manage Visibility); 'Related Elements > Add existing elements' and 'New Expression' run inside the action's compartments. Tutorial workflow: select an item row such as 'onOffCmd', run New Expression, type 'produceDirectedLight.onOffCmd' and click Update; the row then reads 'in onOffCmd = produceDirectedLight.onOffCmd' and an '=' edge appears showing the implied binding.
  - For Grasp: an action's items listed with direction and bound values; Grasp has no item rows or values.
  - Sources: `flashlight.adoc`, `expressions.adoc`

#### Transitions between actions

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Transitions between actions** · sysml-views / SysML Action Flow View · SysON · useful · Grasp: missing
  - What it is: General View and Action Flow View display and create TransitionUsages between ActionUsages with New Transition, including start to action, start to done, sub-action to done (stored in the container action) and ActionUsage to 'done' (2025.4.0); between nested actions of different containers creation is refused with "Can't create cross container TransitionUsage". The guard appears in the edge label, rendered by the textual SysML serializer, but direct edit cannot change it. Transition sources and targets can be reconnected, but not to another transition.
  - For Grasp: transitions between actions as well as states; Grasp's transitions join states only.
  - Sources: `AbstractTransitionEdgeDescriptionProvider.java`, `ActionFlowTests.java`, `2025.4.0.adoc`

#### Rotate (fork and join nodes)

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Rotate (fork and join nodes)** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: palette tool id 'fork_join_node_rotate_tool', label 'Rotate', in the Edit section, offered only on nodes whose element is a ForkNode or JoinNode (never on edges); the backend declares it with no icon or key binding and the frontend overrides it with a Rotate90DegreesCw icon and performs the rotation (2026.7.0). It swaps the node's width and height around its center (horizontal/vertical bar), marks it as user-resized, resets the bend points of connected edges, lays them out again and saves the layout. Disabled in read-only diagrams; hidden when the palette search does not fuzzy-match 'Rotate'. Clicking it first closes the palette, then rotates only the first selected diagram element, clears the node's connection handles, and nulls the bend points of edges whose source or target is that node before the partial layout; the result is saved as a 'layout' layout-data synchronization. Workflow covered by the e2e test: right-click a Fork node, open the Edit section, click Rotate (test id 'overridden_tool_node-rotate'); the node's on-screen width and height are swapped. The rotation hooks are exported from @eclipse-syson/syson-components (2026.11.0).
  - For Grasp: rotates a fork or join bar between horizontal and vertical; Grasp's bars can't be rotated.
  - Sources: `rotate-node.spec.ts`, `RotateNodeToolOverriddenContribution.tsx`, `CHANGELOG.adoc` v2026.11.0

#### Background Behavior section custom tools

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Background Behavior section custom tools** · sysml-views / SysML Action Flow View · SysON · useful · Grasp: partly
  - What it is: adds New Exhibit State, New Exhibit Parallel State, New Start Action, New Done Action, New Join, New Decision, New Fork and New Merge. The six control-node tools (start, done, join, decision, fork, merge) appear only in an Action Flow View whose ViewUsage owner (root element) is an ActionUsage or ActionDefinition (since 2026.7.0).
  - For Grasp: background tools for control nodes and exhibit states; Grasp puts control nodes only inside actions and has no exhibit states.
  - Sources: `SDVDiagramDescriptionProvider.java`, `AFVAddTopControlNodeActionTests.java`, `2026.7.0.adoc`

#### ActionDefinition node palette

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **ActionDefinition palette** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: Structure: New Item, New Item In, New Item Inout, New Item Out, New Parameter In, New Parameter Inout, New Parameter Out. Behavior: New Start Action, New Done Action, New Join, New Fork, New Merge, New Decision, New Accept Action, New Assignment Action, New Perform Action, New Action (not for StateDefinition). View as: General View, Interconnection View, ActionFlow View. Plus Related Elements.
  - For Grasp: right-click palette on an action def for items, parameters, control nodes and actions; Grasp creates these from its top palette only.
  - Sources: `SDVNodeToolSectionSwitch.java`
- **ActionDefinition node palette** · sysml-views / SysML Action Flow View · SysON · useful · Grasp: partly
  - What it is: Structure: New Item, New Item In, New Item Inout, New Item Out, New Parameter In, New Parameter Inout, New Parameter Out. Behavior: New Start Action, New Done Action, New Join, New Fork, New Merge, New Decision, New Accept Action, New Assignment Action, New Perform Action, New Action. View as: General View, Interconnection View, ActionFlow View. Then Related Elements.
  - For Grasp: right-click palette on an action def; Grasp creates the same things from its top palette.
  - Sources: `SDVNodeToolSectionSwitch.java`

#### ActionUsage node palette

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **ActionUsage palette** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: Structure: New Attribute, New Part, New Parameter In/Inout/Out, New Item, New Item In/Inout/Out, Set as composite, Set as ref. Behavior: New Start Action, New Done Action, New Join, New Fork, New Merge, New Decision, New Accept Action, New Assignment Action, New Perform Action, New Action. View as: General View, Interconnection View, ActionFlow View. Plus Related Elements.
  - For Grasp: right-click palette on an action for parameters, items and nested behaviour; Grasp creates these from its top palette only.
  - Sources: `SDVNodeToolSectionSwitch.java`
- **ActionUsage node palette** · sysml-views / SysML Action Flow View · SysON · useful · Grasp: partly
  - What it is: Structure: New Attribute, New Part, New Parameter In/Inout/Out, the nested item compartment tools, Set as composite, Set as ref. Behavior: New Start Action, New Done Action, New Join, New Fork, New Merge, New Decision, New Accept Action, New Assignment Action, New Perform Action, New Action. View as: General View, Interconnection View, ActionFlow View. Then Related elements.
  - For Grasp: right-click palette on an action; Grasp creates the same things from its top palette.
  - Sources: `SDVNodeToolSectionSwitch.java`

#### New Accept Action

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **New Accept Action** · sysml-views / SysML Action Flow View · SysON · useful · Grasp: partly
  - What it is: creates an AcceptActionUsage in a FeatureMembership; runs only when the owner (or, from the background, the ViewUsage owner) is a PartUsage, PartDefinition, ActionUsage or ActionDefinition, otherwise does nothing; the node is exposed and the 'action flow' compartment revealed when run from a node. The new action gets the default name 'acceptAction<N>' and two parameters in ParameterMemberships: an inout ReferenceUsage 'payload' and an in ReferenceUsage 'receiver', which the payload and receiver tools later fill. In palettes of ActionUsage, ActionDefinition, PartUsage, PartDefinition and PerformActionUsage (Behavior). Handled in the General View since 2024.5.0 and in action bodies since 2024.7.0.
  - For Grasp: an accept action created with payload and receiver parameters; Grasp's accept has payload and target fields but no parameter elements.
  - Sources: `AcceptActionNodeToolProvider.java`, `DiagramMutationToolService.java`

#### "parameters" compartment

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **"parameters" compartment** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: ActionDefinition (ownedReference) and ActionUsage (nestedReference) nodes have a "parameters" list compartment (directed features, v2025.6.0) inserted right after the doc compartment (first if there is no doc), listing parameter items and inherited parameters prefixed with "^". Its palette offers New Parameter In, New Parameter Inout and New Parameter Out; it accepts no drops from the diagram. A subject created in a UseCaseDefinition is not shown in the parameters compartment of an ActionDefinition subclassing it.
  - For Grasp: an action lists its parameters in a compartment; Grasp shows parameters only on the action's border.
  - Sources: `ActionDefinitionParametersCompartmentNodeDescriptionProvider.java`, `ActionUsageParametersCompartmentNodeDescriptionProvider.java`, `GVUseCaseDefinitionSubjectItemNonInheritanceTests.java`

#### Implicit succession source/target

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Implicit succession source/target** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: the first two ReferenceUsages of a SuccessionAsUsage without explicit reference subsetting implicitly reference-subset source and target: the transition's source/target, or the previous/next feature in the owning namespace (skipping connectors and transitions), supporting the 'then' shorthand; `getSourceFeature()` resolves e.g. `action ax1; then decide;` to ax1.
  - For Grasp: 'then' successions take the previous feature as source; Grasp writes then-chains in its text but keeps each succession as an explicit line.
  - Sources: `ImplicitSpecializationSwitch.java`, `2025.4.0.adoc`

#### Accept action payload and receiver tools and dialogs

**Grasp: partly** · parts: diagrams, sysml-views

SysON features encompassed (4):

- **Accept action payload dialog** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: partly
  - What it is: 'New <ItemDefinition|PartDefinition> as Payload' on an accept action opens an optional dialog titled 'Set payload' ('<Type> as payload'). Choices: 'Create a New <Type>' ('Set the payload with a New <Type>') and 'Select an existing <Type>' ('Set the payload with an existing <Type>'); only that type is selectable. Status: 'It will set the payload with a New <Type>', 'Select one <Type>', 'It will set the payload with <name>'.
  - For Grasp: an accept action's payload chosen from existing or new; Grasp types its payload as text in the panel.
  - Sources: `AcceptActionPayloadNodeToolProvider.java`
- **Accept action receiver dialog** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: partly
  - What it is: Opened by New Port as Receiver. Title 'Set the receiver', description 'PortUsage as receiver'. Choices: 'Create a New PortUsage' ('Set the receiver with a New PortUsage') and 'Select an existing PortUsage' ('Set the receiver with an existing PortUsage'). Status: 'It will set the receiver with a New PortUsage', 'Select one PortUsage', 'It will set the receiver with <name>'.
  - For Grasp: an accept action's receiver port chosen in a dialog; Grasp types its target in the panel.
  - Sources: `AcceptActionPortUsageReceiverToolNodeProvider.java`
- **AcceptActionUsage palette** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: Structure: New Item Definition as Payload, New Part Definition as Payload (only while the payload is empty), New Port as Receiver, Set as composite, Set as ref; plus Related Elements.
  - For Grasp: an accept action's palette sets its payload and receiver; Grasp sets payload and target in the panel, with no right-click palette.
  - Sources: `SDVNodeToolSectionSwitch.java`
- **Accept action payload and receiver tools** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: New Item Definition as Payload / New Part Definition as Payload (only while the payload is empty) and New Port as Receiver (only while the receiver is empty, isEmptyAcceptActionUsageReceiver) use selection dialogs: the payload may be a PartDefinition or ItemDefinition (or none), the receiver a PortUsage; New Port as Receiver opens the optional dialog "Set the receiver" ("PortUsage as receiver") with "Create a New PortUsage" ("Set the receiver with a New PortUsage") or "Select an existing PortUsage" ("Set the receiver with an existing PortUsage"), statuses "It will set the receiver with a New PortUsage", "Select one PortUsage" and "It will set the receiver with <name>". The payload tools open the optional dialog "Set payload" ("<ItemDefinition|PartDefinition> as payload") with "Create a New <Type>" / "Select an existing <Type>" and statuses "It will set the payload with a New <Type>", "Select one <Type>", "It will set the payload with <name>".
  - For Grasp: sets an accept action's payload and receiver, creating new definitions if wanted; Grasp sets them in the panel from existing elements.
  - Sources: `AcceptActionPortUsageReceiverToolNodeProvider.java`, `GVSubNodeActionFlowCreationTests.java`

#### Drop action into action flow compartment

**Grasp: unclear** · parts: sysml-views

SysON feature encompassed (1):

- **Drop action into action flow compartment** · sysml-views / SysML Action Flow View · SysON · useful · Grasp: unclear
  - What it is: dropping an action from the diagram into an action flow compartment keeps its content.
  - For Grasp: dragging an action into a flow compartment keeps its content; Grasp moves boxes into boxes, whether content follows wasn't checked.
  - Sources: `CHANGELOG.adoc` v2024.9.0

### State Transition View notation (3)

The State Transition View: states, parallel states, entry/do/exit actions, start/done and transitions.

#### StateUsage / StateDefinition node palette

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **StateDefinition / StateUsage palettes** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: Behavior: New Start State, New Done State, New State, New Parallel State, New Exhibit State, New Exhibit Parallel State, New Entry Action, New Do Action, New Exit Action; plus New Documentation. View as: General View, Interconnection View, StateTransition View. StateUsage also has Set as composite and Set as ref. Plus Related Elements.
  - For Grasp: state palette for start, done, nested and parallel states, entry, do, exit; Grasp offers these from the state view's palette, without exhibit states.
  - Sources: `SDVNodeToolSectionSwitch.java`, `GVSubNodeStateTransitionCreationTests.java`
- **StateUsage / StateDefinition node palette** · sysml-views / SysML State Transition View · SysON · useful · Grasp: partly
  - What it is: Behavior: New Start State, New Done State, New State, New Parallel State, New Exhibit State, New Exhibit Parallel State, New Entry Action, New Do Action, New Exit Action. StateUsage also gets Set as composite and Set as ref (Structure). View as: General View, Interconnection View, StateTransition View. Then Related elements, including Add existing elements (since 2024.5.0).
  - For Grasp: right-click palette on states for start, done, nested, parallel, exhibit, entry, do, exit; Grasp has these in its top palette, minus exhibit.
  - Sources: `SDVNodeToolSectionSwitch.java`, `2024.5.0.adoc`

#### State transition compartment

**Grasp: partly** · parts: sysml-views

SysON features encompassed (2):

- **State transition compartment** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: PartDefinition and StateDefinition (ownedState) and PartUsage, StateUsage and ExhibitStateUsage (nestedState) nodes have a free-form "state transition" compartment (default height 150) where states and transitions are drawn. It is hidden by default and shown through the eye icon on the node header (Manage Visibility, check "state transition").
  - For Grasp: a state transition compartment on parts and states, hidden until revealed; Grasp nests states in states and state defs only.
  - Sources: `StateTransitionCompartmentNodeDescriptionProvider.java`, `flashlight.adoc`
- **"state transition" free-form compartment** · sysml-views / SysML State Transition View · SysON · useful · Grasp: partly
  - What it is: free-form compartment labelled "state transition" on StateUsage, StateDefinition and ExhibitStateUsage nodes (also in the General View since 2025.6.0). Renders StateUsage, StateDefinition and start/done state nodes. Palette Behavior: start state, done state, New State, New Parallel State, New Exhibit State, New Exhibit Parallel State. Accepts drops of StateUsage nodes and its own items; creation tools target and reveal it. Hidden by default; transparent rectangle with square corners, default 155 wide and 150 high, not user-resizable, synchronized, header label "state transition" top-centered in italic 12pt without icon or separator; its palette also has the Show/Hide section. Tutorial workflow: create an exhibit state from the background (first dialog option), rename it, show this compartment with the node's eye icon, add nested states with Behavior > New State, then draw transitions between them and rename them (e.g. 'init', 'off_To_on').
  - For Grasp: a titled state transition compartment, hidden until revealed; Grasp nests states in state boxes without a titled compartment.
  - Sources: `StateTransitionCompartmentNodeDescriptionProvider.java`, `DiagramQueryViewService.java`, `2025.6.0.adoc`

#### State and State Definition nodes

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **State and State Definition nodes** · sysml-views / SysML General View · SysON · useful · Grasp: partly
  - What it is: State, StateDefinition and the other State Transition View concepts are available in the General View (Behavior section > New State / New State Definition) since v2024.7.0.
  - For Grasp: states and state defs in the General View too; Grasp draws states only in state transition views.
  - Sources: `2024.7.0.adoc`

### Requirements and concerns notation (24)

Requirement, concern and satisfy nodes, their compartments and tools, and derive, satisfy and frame edges.

#### Concern Definition and Concern Usage nodes

**Grasp: missing** · parts: representations, sysml-views

SysON features encompassed (2):

- **Concern Definition and Concern Usage nodes** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Concern Definitions and Concern Usages are drawn as nodes (v2025.2.0), created with Requirements-section tools or by dragging them from the Explorer onto the background.
  - For Grasp: concerns as nodes for stakeholder-driven requirements; Grasp has no concerns.
  - Sources: `2025.2.0.adoc`
- **Concern Definition and Concern Usage nodes** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: the General View supports ConcernDefinition and ConcernUsage nodes. Their creation tools are in the Requirements section of the palette, and both can be dragged from the Explorer onto the diagram background. Stakeholders of concerns and requirements (definitions and usages) are displayed. Added in v2025.2.0.
  - For Grasp: concerns and their stakeholders on the general view; Grasp has no concern kinds.
  - Sources: `2025.2.0.adoc`

#### Satisfy Requirement Usage nodes

**Grasp: missing** · parts: representations, sysml-views

SysON features encompassed (2):

- **Satisfy Requirement Usage node** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Satisfy Requirement Usages are drawn as nodes (v2025.4.0), created with a Requirements-section tool or by dragging one from the Explorer onto the background.
  - For Grasp: satisfy requirement usages as nodes; Grasp has no requirements.
  - Sources: `2025.4.0.adoc`
- **Satisfy Requirement Usage nodes** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: the General View supports SatisfyRequirementUsage nodes, created from the Requirements section of the palette or dragged from the Explorer onto the background (v2025.4.0). Since v2026.1.0, Interconnection View diagrams can create and show SatisfyRequirementUsage nodes in the interconnection compartment.
  - For Grasp: shows which parts satisfy which requirements, also in interconnection views; Grasp has no satisfy.
  - Sources: `2025.4.0.adoc`, `2026.1.0.adoc`

#### Requirements and concerns compartments on parts

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Requirements and concerns compartments on parts** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: PartUsage and PartDefinition nodes have "requirements" and "concerns" compartments. The New Requirement and New Concern tools on those nodes create elements in them. Added in v2026.9.0.
  - For Grasp: a part box lists its requirements and concerns; Grasp's part boxes have no such compartments.
  - Sources: `2026.9.0.adoc`

#### Actors and subjects on requirement nodes

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Actors and subjects on requirement nodes** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: RequirementUsage and RequirementDefinition nodes have an "actors" compartment. The release notes add it to UseCase and Requirement nodes in v2024.9.0, and again to RequirementUsage and RequirementDefinition nodes in v2026.3.0. Since v2026.3.0, subjects of cases, use cases and requirements are also shown as graphical nodes, in addition to the subject compartment.
  - For Grasp: a requirement's actors and subject shown in compartments or as nodes; Grasp has no requirements.
  - Sources: `2024.9.0.adoc`, `2026.3.0.adoc`

#### Inherited elements in requirement compartments

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Inherited elements in requirement compartments** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: the frames, assume constraints, require constraints and stakeholders compartments of requirement nodes, and the satisfy requirements compartment of part nodes, also list the elements inherited from supertypes. Require-constraint inheritance also applies to subtypes of requirements. Added in v2026.9.0.
  - For Grasp: compartments also list what a requirement inherits from its supertypes; Grasp has no requirement compartments.
  - Sources: `2026.9.0.adoc`

#### New Stakeholder

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **New Stakeholder** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: Structure > New Stakeholder in the palette of RequirementUsage, RequirementDefinition, ConcernUsage and ConcernDefinition nodes, and in the stakeholders compartment palette. It creates a PartUsage inside a StakeholderMembership of a RequirementUsage or RequirementDefinition (ConcernUsage and ConcernDefinition count, since they specialize them; the tests create stakeholders in Requirement, RequirementDefinition, Concern and ConcernDefinition) and does nothing for other owners. With no selection the stakeholder is created without subsetting. An optional dialog lists PartUsages: an ItemUsage pick makes the stakeholder subset it, and an ItemDefinition pick types it. The new stakeholder is exposed, revealed and selected.
  - For Grasp: adds a stakeholder to a requirement or concern, optionally typed or subsetting an existing one; Grasp has no requirements.
  - Sources: `StakeholdersCompartmentNodeToolProvider.java`, `DiagramMutationToolService.java`

#### New Satisfy

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **New Satisfy** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: Requirements > New Satisfy in the palette of PartUsage and PartDefinition nodes. It creates a SatisfyRequirementUsage as a child of the part, with a ReferenceSubsetting to an existing RequirementUsage that must be picked in a required dialog (title "New Satisfy", description "Select an existing Requirement:"). This models `satisfy req by subj` with the part as subject, and the result is exposed in the view. The same tool is also offered in the "satisfy requirements" compartment. The v2026.3.0 changelog describes New Satisfy as a tool on RequirementUsage nodes, but in v2026.11.0 it is registered only on PartUsage and PartDefinition nodes and that compartment.
  - For Grasp: a part tool for `satisfy req by part`, picking an existing requirement; Grasp has no satisfy relationship.
  - Sources: `SatisfyNodeToolProvider.java`, `SDVNodeToolSectionSwitch.java`, `CHANGELOG.adoc` v2026.3.0

#### New Satisfy Requirement (node tool)

**Grasp: missing** · parts: diagrams, representations, sysml-views

SysON features encompassed (3):

- **New Satisfy Requirement dialog** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: On parts (Requirements section). Title 'New Satisfy Requirement' (description 'Create a Satisfy Requirement with <name> as subject:'). Choices: 'Create a new Satisfy Requirement' ('…without specialization') and 'Select an existing Element as specialization' ('Create a new specialized Satisfy Requirement'); Definitions and RequirementUsages are selectable. The node is thus created standalone, feature-typed by the picked Definition, or subsetting the picked RequirementUsage by reference (2026.5). The same tool is used in the Interconnection View's interconnection compartment. Status: 'It will create a new Satisfy Requirement without specialization', 'Select one Element to specialize the new Satisfy Requirement', 'It will create a Satisfy Requirement specialized with <name>'.
  - For Grasp: Satisfy Requirement with a part as subject; Grasp has no requirements.
  - Sources: `SatisfyRequirementNodeToolProvider.java`
- **New Satisfy Requirement (node tool)** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: On PartUsage and PartDefinition nodes (and in the interconnection compartment), creates a SatisfyRequirementUsage in "satisfy requirements". Optional tree dialog titled "New Satisfy Requirement" (icon SatisfyRequirementUsage.svg) with the text "Create a Satisfy Requirement with <node name> as subject:": "Create a new Satisfy Requirement" ("Create a new Satisfy Requirement without specialization", standalone) or "Select an existing Element as specialization" ("Create a new specialized Satisfy Requirement"; RequirementUsages and definitions selectable): a requirement makes it subset by reference, a definition types it. Statuses: "It will create a new Satisfy Requirement without specialization", "Select one Element to specialize the new Satisfy Requirement", "It will create a Satisfy Requirement specialized with <name>". Optional selection since v2026.5.0.
  - For Grasp: a part satisfies a requirement through a satisfy usage; Grasp has no requirements.
  - Sources: `SatisfyRequirementNodeToolProvider.java`, `GVSatisfyRequirementTests.java`, `2026.5.0.adoc`
- **New Satisfy Requirement (node tool)** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: Requirements > New Satisfy Requirement in the palette of PartUsage and PartDefinition nodes. It creates a SatisfyRequirementUsage child of the part. The dialog is optional and its description is computed as "Create a Satisfy Requirement with <part name> as subject:". Picking a Definition types the new element, picking a RequirementUsage adds a ReferenceSubsetting, and picking nothing makes it standalone. The result is exposed in the view.
  - For Grasp: creates a satisfy requirement with the part as subject, typed or subsetting a pick; Grasp lacks it.
  - Sources: `SatisfyRequirementNodeToolProvider.java`, `ModelMutationElementService.java`

#### New Framed Concern (node tool)

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **New Framed Concern (node tool)** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: Requirements > New Framed Concern in the palette of RequirementUsage and RequirementDefinition nodes. It creates a FramedConcernMembership holding a new ConcernUsage. If an existing ConcernUsage is picked in the optional dialog, the new concern gets a ReferenceSubsetting to it. The membership's referenced concern is exposed in the view.
  - For Grasp: frames a concern in a requirement, new or referencing an existing one; Grasp has no concerns.
  - Sources: `FramedConcernNodeToolProvider.java`, `ModelMutationElementService.java`

#### New Require / Assume constraint

**Grasp: missing** · parts: representations, sysml-views

SysON features encompassed (3):

- **New Require constraint / New Assume constraint** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Requirement and concern node tools (named this way since v2025.6.0). Since v2026.7.0 each opens an optional tree dialog titled with the tool name ("Create a Require Constraint" / "Create an Assume Constraint"; the flashlight tutorial calls the tool "New Required Constraint", found with the palette filter, and shows "Create a New Require Constraint" then Confirm) to create a new constraint ("Create a New Require Constraint" / "Create a New Assume Constraint", described "... without referencing an existing Constraint") or "Select an existing Constraint to require" / "Select an existing Constraint to assume" (a ConstraintUsage to reference, described "... referencing the selected Constraint"). Status lines: "It will create a New Require Constraint without referencing an existing Constraint" (assume equivalent), "Select one Constraint to require" / "Select one Constraint to assume" and "It will create a new Constraint referencing <name>". The tool creates a RequirementConstraintMembership of kind requirement or assumption and exposes both the owned and referenced constraint; picking an existing ConstraintUsage displays an assume/require edge, and an owned constraint subsetted by reference is hidden. New constraints appear in the require/assume constraints compartment.
  - For Grasp: adds require or assume constraints to requirements; Grasp has no constraints.
  - Sources: `RequireConstraintNodeToolProvider.java`, `AssumeConstraintNodeToolProvider.java`, `flashlight.adoc`
- **New Require constraint** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: Requirements > New Require constraint in the palette of RequirementUsage, RequirementDefinition, ConcernUsage and ConcernDefinition nodes. In a requirement usage or definition, it creates a RequirementConstraintMembership of kind requirement holding a new ConstraintUsage. If an existing ConstraintUsage is picked in the optional dialog, the new constraint gets a ReferenceSubsetting to it. Both the owned and the referenced constraint are exposed.
  - For Grasp: adds a require constraint to a requirement, the core of a requirement's meaning; Grasp has no constraints.
  - Sources: `RequireConstraintNodeToolProvider.java`, `ModelMutationElementService.java`
- **New Assume constraint** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: Requirements > New Assume constraint in the palette of RequirementUsage, RequirementDefinition, ConcernUsage and ConcernDefinition nodes. It works like New Require constraint but creates a RequirementConstraintMembership of kind assumption. Both the owned and the referenced constraint are exposed.
  - For Grasp: adds an assumed constraint to a requirement; Grasp has no constraints.
  - Sources: `AssumeConstraintNodeToolProvider.java`, `ModelMutationElementService.java`

#### Objective, subject, actor and stakeholder creation

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Objective, subject, actor and stakeholder creation** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: palette tools with a selection dialog on requirement and case nodes. - Case usages and definitions (CaseUsage, CaseDefinition, UseCaseUsage, UseCaseDefinition) can get a new objective RequirementUsage that subsets a selected requirement or is typed by a selected RequirementDefinition; with nothing selected the objective is created without specialization. - Case and requirement elements can get a subject ReferenceUsage that subsets a selected usage or is typed by a selected definition. - They can also get an actor PartUsage that subsets a selected ItemUsage or is typed by an ItemDefinition (tests: a Part pick subsets, a PartDefinition pick types, no pick gives a plain actor). Actors can also be created in Concerns and ConcernDefinitions. - Requirements can get a stakeholder PartUsage in the same way. - The subject and objective tools are offered only while those compartments are empty.
  - For Grasp: palette tools fill cases and requirements with typed or subsetting objectives, subjects, actors and stakeholders; Grasp has none.
  - Sources: `DiagramMutationToolService.java`, `DiagramQueryToolService.java`, `GVSubNodeRequirementCreationTests.java`

#### Requirement compartments redesign

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Requirement compartments redesign** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: the compartments of RequirementDefinition and RequirementUsage nodes on the General View were redesigned to fit the specification and its examples (subject, constraints, actors, stakeholders compartments). Released in v2024.5.0.
  - For Grasp: requirement boxes laid out like the specification's examples (subject, constraints, actors, stakeholders); Grasp has no requirement boxes.
  - Sources: `2024.5.0.adoc`, `CHANGELOG.adoc` v2024.5.0, `RequirementUsageSubjectCompartmentNodeDescriptionProvider.java`

#### Require and assume constraints compartments

**Grasp: missing** · parts: representations, sysml-views

SysON features encompassed (3):

- **"require constraints" and "assume constraints" compartments** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: RequirementDefinition, RequirementUsage, ConcernDefinition and ConcernUsage nodes have "require constraints" (RequirementConstraintKind requirement) and "assume constraints" (assumption) compartments with items and inherited items. Hidden until checked in the node's Manage Visibility dialog (eye icon); constraints created with the require-constraint tool appear there, can be selected, and have their own palette (Edit section with New Expression and Edit).
  - For Grasp: requirements list their assumed and required constraints; Grasp has no constraints.
  - Sources: `RequireConstraintCompartmentNodeDescription.java`, `AssumeConstraintCompartmentNodeDescription.java`, `flashlight.adoc`
- **Assume constraints compartment** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: a compartment on requirement nodes labelled "assume constraints". It lists assumed-constraint items plus inherited items and has a creation tool for assume constraints. It accepts no node drops at compartment level. A named constraint with an expression is listed as `name { expression }`; direct edit on that item starts with the name only and changes only the name, leaving the expression intact.
  - For Grasp: lists assumed constraints as `name { expression }`, editing the name only; Grasp has no requirement compartments.
  - Sources: `AssumeConstraintCompartmentNodeDescription.java`, `AssumeConstraintCompartmentItemNodeDescription.java`, `ExpressionsControllersIntegrationTests.java`
- **Require constraints compartment** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: a compartment on requirement nodes labelled "require constraints". It lists required-constraint items plus inherited items, has a creation tool for require constraints, and has no droppable node types.
  - For Grasp: lists a requirement's required constraints, inherited ones too; Grasp lacks it.
  - Sources: `RequireConstraintCompartmentNodeDescription.java`, `RequireConstraintCompartmentItemNodeDescription.java`

#### Frames compartment

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Frames compartment** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: a compartment on requirement nodes labelled "frames". Its items are the requirement's framed concerns (getFramedConcerns) plus inherited items. It has a framed-concern creation tool and no droppable nodes.
  - For Grasp: lists the concerns a requirement frames; Grasp has no concerns.
  - Sources: `FramedConcernCompartmentNodeDescription.java`, `FramedConcernCompartmentItemNodeDescription.java`

#### Satisfy requirements compartment

**Grasp: missing** · parts: representations, sysml-views

SysON features encompassed (2):

- **"satisfy requirements" compartment** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: PartUsage (nestedRequirement) and PartDefinition (ownedRequirement) nodes have a "satisfy requirements" compartment listing SatisfyRequirement items and inherited items (v2026.1.0).
  - For Grasp: parts list the requirements they satisfy; Grasp has no requirements.
  - Sources: `SatisfyRequirementCompartmentNodeDescription.java`, `2026.1.0.adoc`
- **Satisfy requirements compartment** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: a compartment on definition and usage nodes labelled "satisfy requirements". It lists the owner's SatisfyRequirementUsage features (exact type) and inherited satisfy items, offers two creation tools ("satisfy requirement" and "satisfy"), and accepts no drops.
  - For Grasp: a part box lists the requirements it satisfies; Grasp has no satisfy.
  - Sources: `SatisfyRequirementCompartmentNodeDescription.java`, `SatisfyRequirementInheritedCompartmentItemNodeDescription.java`

#### New Satisfy Requirement edge tool

**Grasp: missing** · parts: representations, sysml-views

SysON features encompassed (2):

- **New Satisfy Requirement (edge tool)** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: From a Feature node (e.g. PartUsage) to a RequirementUsage node, creates a SatisfyRequirementUsage edge; since v2026.3.0 it can only target a RequirementUsage (not e.g. an ActionUsage); the accepted target node descriptions are the RequirementUsage and SatisfyRequirementUsage nodes.
  - For Grasp: draws a satisfy from a feature to a requirement; Grasp has no requirements.
  - Sources: `GVEdgeCreationTests.java`, `2026.3.0.adoc`
- **New Satisfy Requirement edge tool** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: an edge tool from any Feature node to a RequirementUsage or SatisfyRequirementUsage node. It creates a satisfy relationship (ModelMutationAQLService.createSatisfy).
  - For Grasp: drawing from a feature to a requirement creates a satisfy; Grasp has no satisfy line.
  - Sources: `ViewEdgeToolService.java`

#### New Derived Requirement edge tool

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **New Derived Requirement edge tool** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: an edge tool between two RequirementUsage nodes that creates a requirement derivation. The edge is drawn from the derived requirement to the original one, which is also the direction the derivation is read and displayed in. It creates, in the derived requirement's owning namespace, the same shape as textual SysML: a ConnectionUsage annotated with `#derivation` whose ends are annotated `#original` and `#derive`. An import of the RequirementDerivation standard library is added to that namespace when missing, so the derivation is valid on its own; if the library's metadata cannot be found, nothing is created. Added in v2026.9.0, with a fix in the same release.
  - For Grasp: draws a requirement derivation, adding the library import it needs; Grasp has no requirements.
  - Sources: `ViewEdgeToolService.java`, `ModelMutationElementService.java`, `CHANGELOG.adoc` v2026.9.0

#### Derivation «derive» edge

**Grasp: missing** · parts: representations, sysml-views

SysON features encompassed (2):

- **Requirement derivation «derive» edge** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: A binary requirement derivation (ConnectionUsage annotated #derivation or typed by DerivationConnections::Derivation) is drawn as a dashed edge labeled «derive» with an open arrow from the derived to the original requirement (dashed to tell it from satisfy). Direction comes from the #original/#derive end metadata, falling back on end order, so declaration order does not matter. Appears automatically once both requirements are on the diagram (e.g. dropped from the Explorer); reconnection is not supported (v2026.9.0).
  - For Grasp: dashed «derive» edge between requirements; Grasp has no requirements.
  - Sources: `RequirementDerivationEdgeDescriptionProvider.java`, `GVRequirementDerivationEdgeTests.java`, `2026.9.0.adoc`
- **Derivation («derive») edge display** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: a requirement derivation (a `#derivation connection` whose ends are `#original` and `#derive`, or a ConnectionUsage typed by `DerivationConnections::Derivation`; only binary derivations are drawn) is shown on the General View as a dashed edge labelled «derive», from the derived requirement to the original one. The «derive» label tells it apart from a «satisfy» edge. The edge appears automatically once both requirements are on the diagram, e.g. after dropping them from the Explorer. The `#original` and `#derive` metadata fix its direction, whatever order the ends are declared in. Derivations can also come from textual SysML through Upload model or New objects from text. Added in v2026.9.0.
  - For Grasp: dashed «derive» lines appear between requirements on the diagram; Grasp lacks requirement derivation.
  - Sources: `2026.9.0.adoc`

#### New Framed Concern / New Assume Constraint / New Require Constraint edge tools

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **New Framed Concern / New Assume Constraint / New Require Constraint edge tools** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: edge tools from requirement usages and definitions. "New Framed Concern" targets a ConcernUsage and frames it. "New Assume Constraint" and "New Require Constraint" target a ConstraintUsage and link it through a constraint membership of kind assumption or requirement. The resulting "frame", "assume" and "require" edges are also drawn when the node tools New Framed Concern, New Require constraint or New Assume constraint reference another existing concern or constraint picked in their dialog. Added in v2026.7.0.
  - For Grasp: frame, assume and require lines drawn from a requirement; Grasp has none of these.
  - Sources: `ViewEdgeToolService.java`, `2026.7.0.adoc`

#### Satisfy requirement edge and label

**Grasp: missing** · parts: representations, sysml-views

SysON features encompassed (2):

- **Satisfy requirement edge** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: SatisfyRequirementUsage drawn as a solid edge with an open arrow and a satisfy label from the satisfying feature (or the owner if none) to the satisfied requirement; sources are feature nodes, targets requirement nodes; both ends reconnectable, accepting valid ends and refusing invalid ones. Reconnecting the source to a Feature retargets the subsetting of the satisfy's subject parameter (or creates a SubjectMembership with a ReferenceUsage subsetting the new feature when there is none), otherwise warns "The satisfy source must be a Feature"; reconnecting the target to a RequirementUsage retargets (or creates) its ReferenceSubsetting, otherwise warns "The satisfy target must be a RequirementUsage".
  - For Grasp: «satisfy» edge from a feature to a requirement, reconnectable; Grasp has no requirements.
  - Sources: `SatisfyRequirementEdgeDescriptionProvider.java`, `DiagramMutationElementService.java`, `GVSatisfyRequirementTests.java`
- **Satisfy edge label** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: a SatisfyRequirementUsage edge is labelled «satisfy».
  - For Grasp: satisfy lines read «satisfy», telling them apart from other lines; Grasp has no satisfy.
  - Sources: `DiagramQueryLabelService.java`

#### RequirementUsage / SatisfyRequirementUsage palette

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **RequirementUsage / SatisfyRequirementUsage palette** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Structure: New Item, New Item In/Inout/Out, New Part, New Subject, New Actor, New Stakeholder, Set as composite, Set as ref. Requirements: New Requirement, New Framed Concern, New Require constraint, New Assume constraint. View as: General View, Interconnection View. Plus compartment tools and Related Elements.
  - For Grasp: requirement palette for subject, actors, frames and constraints; Grasp has no requirements.
  - Sources: `SDVNodeToolSectionSwitch.java`

#### RequirementDefinition palette

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **RequirementDefinition palette** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Requirements: New Framed Concern, New Require constraint, New Assume constraint. Structure: New Subject, New Actor, New Stakeholder. View as: General View, Interconnection View. Plus compartment tools (New Attribute, New Requirement) and Related Elements.
  - For Grasp: requirement def palette; Grasp has no requirements.
  - Sources: `SDVNodeToolSectionSwitch.java`

#### Background Requirements section

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Background Requirements section** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: New Concern, New Concern Definition, New Constraint, New Constraint Definition, New Requirement, New Requirement Definition, New Satisfy Requirement.
  - For Grasp: background tools for concerns, constraints and requirements; Grasp models no requirements.
  - Sources: `SDVDiagramDescriptionProvider.java`

#### ReqId mirrors the declared short name

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **ReqId mirrors the declared short name** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: a requirement's reqId and its declared short name are the same value. Setting reqId sets the short name, and setting the short name changes reqId. This holds for RequirementUsage and RequirementDefinition, and it is the value shown in the table's ReqId column, in the details view and in `<short> name` labels and direct edit. The synchronization arrived in v2026.3.0. The ReqId property of RequirementUsage moved from the Advanced tab to the Core tab of the Details view in v2025.10.0, and RequirementDefinition's ReqId appears in the Core tab since v2026.3.0.
  - For Grasp: one value serves as requirement id and `<short name>`, in table, details and labels; Grasp keeps no short names.
  - Sources: `RequirementUsageImplTest.java`, `2026.3.0.adoc`, `2025.10.0.adoc`

## Editing

### Direct edit and label syntax (18)

Editing labels in place with SysML-like text: names, short names, prefixes, typing, redefinition and multiplicity.

#### Direct edit of a composition edge label

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Direct edit of a composition edge label** · diagrams / Diagram: selection, editing & direct manipulation · SysON · useful · Grasp: missing
  - What it is: direct-editing the label of a composition (nested/owned usage) edge edits the target element's multiplicity range, starting from the text given by getMultiplicityLabel.
  - For Grasp: editing a composition edge's label sets the part's multiplicity; Grasp nests parts in boxes and has no composition edges.
  - Sources: `AbstractUsageNestedUsageEdgeDescriptionProvider.java`, `AbstractDefinitionOwnedUsageEdgeDescriptionProvider.java`

#### Compartment list-item direct edit

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Compartment list-item direct edit** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: compartment rows have an 'Edit' tool that parses the input with the `listItemExpression` rule (`directEditListItem`). The initial text is the row label without its value; for a Documentation or Comment row it is the body. For ConstraintUsage rows (e.g. assume constraints in a requirement), everything from `{` onward is dropped, so editing starts from the name only; renaming a constraint shown as a list item used to raise an error, fixed in 2026.7.0 (#2306).
  - For Grasp: compartment rows edited with the row grammar, direction included; Grasp has no rows.
  - Sources: `CompartmentItemNodeDescriptionProvider.java`, `DiagramMutationLabelService.java`, `DiagramQueryAQLService.java`

#### List-item direct-edit syntax order

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **List-item direct-edit syntax order** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: `[in|out|inout|abstract|variation|constant|derived|end]* [ref] [<shortName>] [name] [[multiplicity]] [ordered] [nonunique] [feature expressions]`. The `ordered`/`nonunique` suffixes must be preceded by whitespace.
  - For Grasp: row text adds direction, constant, derived, end, ordered and nonunique; Grasp has no rows.
  - Sources: `DirectEdit.g4`

#### Short name `<...>`

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Short name `<...>`** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: since 2024.11.0, `<id>` before the name sets `declaredShortName` (e.g. '<1.1>' keeps the name and sets the short name). An empty `<>` clears it (sets it to an empty string).
  - For Grasp: a label can set an element's short name, as in '<1.1> Brakes'; Grasp recognises '<id>' but doesn't keep it.
  - Sources: `DiagramDirectEditListener.java`, `model-management.adoc`, `CHANGELOG.adoc` v2024.11.0

#### Prefix keywords in any order

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Prefix keywords in any order** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: list items accept `in`, `out`, `inout`, `abstract`, `variation`, `constant`, `derived` and `end` in any order; graphical nodes accept `abstract`, `variation`, `variant`, `timeslice` and `snapshot`. Since 2024.9.0, only keywords the label can display are editable. The `constant` prefix replaced `readonly` when the 2025 metamodel alignment renamed isReadOnly to isVariable and added isConstant. A keyword not accepted by the rule in use is not an error: since the name part accepts any token, it simply becomes part of the name (e.g. 'constant x' typed on a graphical node renames it 'constant x', and 'timeslice p' on a list item gives the name 'timeslice p').
  - For Grasp: prefix keywords accepted in any order; Grasp parses none.
  - Sources: `DirectEdit.g4`, `2024.9.0.adoc`, `CHANGELOG.adoc` v2025.8.0

#### Prefix `abstract`

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Prefix `abstract`** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: `abstract ` sets isAbstract=true on a Usage. When it is absent from a node label edit, isAbstract resets to false unless the usage is a variation (a variation is always abstract); on a compartment list item the reset is not applied, so removing `abstract ` there does not make the usage concrete. On a Definition node the keyword is accepted but neither sets nor clears isAbstract, and a definition's prefilled text shows no prefix keyword at all (only usages get prefixes), so a definition's abstractness cannot be changed by direct edit.
  - For Grasp: 'abstract' in the text sets or clears a usage's abstractness; Grasp leaves abstract to the Advanced tab.
  - Sources: `DiagramDirectEditListener.java`, `DiagramQueryLabelService.java`

#### Direction prefixes `in` / `out` / `inout`

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Direction prefixes `in` / `out` / `inout`** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: on compartment list items (including port rows), `in `, `out ` or `inout ` sets the Usage direction (the Flashlight tutorial renames a port to 'out dcPwrOutPort'). On port border nodes and graphical nodes, which use the node rule, the keyword is not parsed as a direction and stays in the name. On list items, a missing prefix clears the direction (null). Directed items and ports then show the prefix in their labels ('in onOffCmd', 'out lightOut').
  - For Grasp: 'in', 'out' or 'inout' on a row sets direction; Grasp sets direction in the panel.
  - Sources: `DiagramDirectEditListener.java`, `flashlight.adoc`, `DirectEdit.g4`

#### `ref` keyword (referential vs composite)

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **`ref` keyword (referential vs composite)** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: since 2024.9.0, `ref ` sets isComposite=false on a Usage (a reference). When `ref` is absent from a node label edit, isComposite goes back to true; on a compartment list item it is not reset, so deleting `ref ` from a row leaves the usage referential. This applies to every Usage, including attributes and ConnectionDefinition ends, whose prefilled label never shows `ref`; Definitions are unaffected. Example: 'ref battery[2]' gives a referential part with multiplicity 2.
  - For Grasp: 'ref' makes a usage referential, its absence composite; Grasp names ref as not kept.
  - Sources: `DiagramDirectEditListener.java`, `flashlight.adoc`, `CHANGELOG.adoc` v2024.9.0

#### Redefinition `:>> feature`

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Redefinition `:>> feature`** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: `:>> Name` resolves a Feature and sets or creates a Redefinition, adding an import when needed. When the redefining usage has the same name as the target, it is temporarily renamed during lookup so it doesn't resolve to itself. A simple name that doesn't resolve creates a usage of the same metaclass in the nearest Package. An unresolvable qualified name shows 'The qualified name used for the redefinition does not exist'. Example: 'bulletProofWheels[4] :>> wheels' sets multiplicity 4 and shows a 'redefines' edge to 'wheels'.
  - For Grasp: ':>> wheels' redefines a feature; Grasp names redefinition as not kept.
  - Sources: `DiagramDirectEditListener.java`, `model-management.adoc`, `batmobile.adoc`

#### Direct edit of edge begin, center and end labels

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Direct edit of edge begin, center and end labels** · sysml-views / Direct edit & label syntax · Sirius Web · useful · Grasp: partly
  - What it is: an edge's center, begin and end labels can each have an edit tool. Edit Begin Label and Edit End Label tools may define an Initial Direct Edit Label Expression with `semanticEdgeSource`/`semanticEdgeTarget` variables. The changelog says a begin or end label is edited by double-click and the center label by F2 or typing. At v2026.11.0 double-click is not wired, so only the center label is reachable (F2, typing, palette Edit). _(Sirius Web)_
  - For Grasp: edges have editable begin, center and end labels; Grasp edits only a line's main label.
  - Sources: `CHANGELOG.adoc` v2023.10.0 (Sirius Web), `CHANGELOG.adoc` v2023.3.0 (Sirius Web), `useDiagramDirectEdit.tsx`

#### Restricted direct edit on binding, flow, interface and connection edges

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Restricted direct edit on binding, flow, interface and connection edges** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: center labels of binding connector, flow, interface and connection edges are edited with `editEdgeCenterLabel`, which turns redefinition and subsetting off, so only the name, typing and multiplicity apply. The text goes through the node rule, so prefix keywords still count: the initial text includes the connector's `abstract`, `variation`, `ref` or portion-kind prefixes, and deleting one resets that property on the connector usage.
  - For Grasp: connector labels edit name, typing and multiplicity only; Grasp edits names and an interface's definition but doesn't type connections.
  - Sources: `DiagramMutationLabelService.java`, `AbstractBindingConnectorAsUsageEdgeDescriptionProvider.java`, `ConnectionUsageEdgeDescriptionProvider.java`

#### Dependency and succession edge direct edit

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Dependency and succession edge direct edit** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: dependency edges have an 'Edit Dependency Label' tool and succession edges an 'Edit Succession Label' tool on their center label. Both parse the text with the full node rule and no restriction (name, short name, prefixes, multiplicity, typing, subsetting, redefinition all apply), and, having no initial-text expression, start from the displayed center label.
  - For Grasp: dependency and succession labels edited with the full grammar; Grasp edits successions but has no dependencies.
  - Sources: `AbstractDependencyEdgeDescriptionProvider.java`, `AbstractSuccessionEdgeDescriptionProvider.java`

#### Two grammar entry points (node vs list item)

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Two grammar entry points (node vs list item)** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: direct-edit text is parsed by an ANTLR grammar (`DirectEdit.g4`) with two top-level rules: `nodeExpression` for graphical nodes and edges, `listItemExpression` for compartment list items. A listener walks the parse tree and applies each recognized part to the edited element, so different node kinds (compartment item vs container) show and edit different levels of information. Editing can create and delete model elements on the fly; for example 'attr1' to 'attr1 : MyType' creates a FeatureTyping (and MyType if missing), and 'attr1 :>> attr2' back to 'attr1' deletes the Redefinition (ADR-001).
  - For Grasp: separate grammars for nodes and list rows; Grasp has the node form only, without row prefixes such as direction.
  - Sources: `DirectEdit.g4`, `DiagramMutationLabelService.java`, `001_support_direct_edit_in diagrams.adoc`

#### Feature-expression ordering

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Feature-expression ordering** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: either (redefinition or subsetting, then an optional multiplicity) followed by (typing, then an optional multiplicity); or typing first, then subsetting or redefinition with an optional multiplicity; or a lone multiplicity. Only one of `:>` or `:>>` per edit.
  - For Grasp: redefinition or subsetting and typing may come in either order; Grasp parses typing and ':>' but not ':>>'.
  - Sources: `DirectEdit.g4`

#### Quoted names and qualified references

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Quoted names and qualified references** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: references in feature expressions are qualified names, built from segments separated by `::`. The lexer recognizes single-quoted names (`'...'`) and identifiers `[a-zA-Z_][a-zA-Z_0-9-]*`. Name matching accepts a quoted query even though the quotes are not stored in the model.
  - For Grasp: qualified names with '::' and quoted names resolve in references; Grasp resolves qualified paths, quoting not checked.
  - Sources: `DirectEdit.g4`, `ElementUtil.java`

#### Delete a part by leaving its operator empty

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Delete a part by leaving its operator empty** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: a trailing operator with nothing after it deletes that part. `:` deletes the FeatureTyping ('newName :'), `:>` the Subsetting (usages) or Subclassification (definitions), `:>>` the Redefinition, `[]` the multiplicity, and `<>` the short name. The dangling `:`, `:>` or `:>>` deletes only when it is the first feature part after the name (the parser then reports a no-viable-alternative error on it); after another part (e.g. 'p : T :>') nothing is deleted. Each deletion is skipped when the matching option (TYPING_OFF, SUBSETTING_OFF, REDEFINITION_OFF) is set, so restricted edge edits cannot delete those relationships. Partial edits that delete information were fixed in 2024.11.0.
  - For Grasp: a trailing ':', ':>' or ':>>' removes that relationship; Grasp removes typing with a lone ':' and multiplicity with '[]'.
  - Sources: `DiagramDirectEditListener.java`, `DiagramDirectEditListenerTest.java`, `CHANGELOG.adoc` v2024.3.0

#### Tokens that end the name part

**Grasp: unclear** · parts: sysml-views

SysON feature encompassed (1):

- **Tokens that end the name part** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: unclear
  - What it is: the name may contain any token except `:`, `:>`, `::`, `:>>`, `:=`, `[`, ` default`, ` ordered` and ` nonunique`, which end it ('default' stays part of a name unless a space precedes it: 'default Attr1' and 'defaultAttr1' are names, while 'Attr1 default' gives the name 'Attr1' and the rest is dropped). The lexer also defines a `const ` prefix token that no rule uses, so 'const x' is simply a name. The user doc gives a different list: `:`, `:>`, `::>`, `:>>`, `=`, `:=`, `[`, ` constant`, ` default`, ` end`, ` nonunique`, ` ordered`, ` variation`; it also wrongly says `::>` sets a redefinition and `:>>` a reference subsetting. To put such tokens in a name, use the 'Declared Name' text field of the Details view.
  - For Grasp: which tokens end the name part; Grasp's exact tokenisation was not checked.
  - Sources: `DirectEdit.g4`, `model-management.adoc`

#### Multiplicity before or after typing/subsetting/redefinition

**Grasp: unclear** · parts: sysml-views

SysON feature encompassed (1):

- **Multiplicity before or after typing/subsetting/redefinition** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: unclear
  - What it is: since 2026.1.0, the multiplicity may follow the name or the typing, subsetting or redefinition part: `part p1[4] :> p2`, `part p1 :> p2[4]`, `part p6 :>> p1[4]` and `part p1 : DefA[4]` are all valid. Either form updates the cardinality of the first element of the expression.
  - For Grasp: the multiplicity may follow the name or the type; whether Grasp accepts ': Def[4]' wasn't checked.
  - Sources: `DirectEdit.g4`, `model-management.adoc`, `CHANGELOG.adoc` v2026.1.0

### Label formats and presentation (17)

How node, compartment and edge labels read and are laid out, including outside, wrapped and multi-part labels.

#### Value part in labels (`=`, `:=`, `default`)

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Value part in labels (`=`, `:=`, `default`)** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: since 2024.7.0, usage node and list-item labels end with the feature value expression (e.g. ' = 10'). Since 2025.2.0 a FeatureValue with isInitial uses ':=' and one with isDefault adds the 'default' keyword ('default = 1', 'default := 1').
  - For Grasp: labels end with the value, ' = 10', ':=' or 'default'; Grasp holds no values.
  - Sources: `DiagramQueryLabelService.java`, `DiagramQueryLabelServiceTest.java`, `CHANGELOG.adoc` v2025.2.0

#### Prefix and multiplicity keywords in labels

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Prefix and multiplicity keywords in labels** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: since 2024.9.0, usage list-item labels show prefix keywords (direction, abstract, variation, constant, derived, end...) and the suffixes ordered/nonunique. Definition and usage node labels show their prefix keywords.
  - For Grasp: row labels show prefix keywords and ordered/nonunique; Grasp has no rows.
  - Sources: `2024.9.0.adoc`, `CHANGELOG.adoc` v2024.9.0

#### Compartment item label format

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Compartment item label format** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: a usage row shows the direction (in/out/inout), abstract (if not a variation), variation, constant and end (both left out inside a ConnectionDefinition), derived, and ref (not for attributes or ConnectionDefinition ends). Then come '<short> name', '[a..b] ordered nonunique', ': Type', ':>> X', ':> Y', '::> Z', and the value as ' = v', ' := v' (initial) or ' default = v' / ' default := v'.
  - For Grasp: row labels show direction, flags, name, [mult], relationships and value; Grasp has no rows.
  - Sources: `DiagramQueryLabelService.java`, `DiagramQueryLabelServiceTest.java`

#### Label style properties (bold, italic, colour, border)

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (2):

- **Label style properties** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: missing
  - What it is: A label's text style supports bold, italic, underline and strike-through (combinable), font size, color, visibility (visible or hidden), a list of icon URLs and a max width. Its content box supports background, borderColor, borderRadius, borderSize and borderStyle (Solid, Dash, Dot, Dash_Dot). Each label reports which properties are user-customized (customizedStyleProperties). _(Sirius Web)_
  - For Grasp: labels can be bold, italic, underlined, coloured, bordered and sized; Grasp's labels are styled by role only.
  - Sources: `convertLabel.ts`, `labelFragment.ts`, `diagram.graphqls`
- **Label box content and styling** · sysml-views / Direct edit & label syntax · Sirius Web · useful · Grasp: missing
  - What it is: labels render optional icons before the text (a list of icon URLs drawn stacked on top of each other at 16x16, with a right margin), keep explicit line breaks (multi-line labels), and can have a fixed width/height and their own background and border colors. The label style carries bold, italic, font size, color, underline and strike-through (combined text decoration), border color, radius, size and line style (Solid, Dash, Dot, Dash_Dot), background, an optional max width and visibility (visible/hidden); text alignment is LEFT, RIGHT, CENTER (default) or JUSTIFY. Labels of faded elements render at 40% opacity, and labels are marked `nopan` so dragging on them does not pan the diagram. Each label also reports which style properties the user customized. _(Sirius Web)_
  - For Grasp: labels can carry icons, bold, italic, colours and borders; Grasp's labels have one fixed style.
  - Sources: `Label.tsx`, `convertLabel.ts`, `diagram.graphqls`

#### Wrapped node labels

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Wrapped node labels** · sysml-views / SysML General View · SysON · useful · Grasp: missing
  - What it is: Labels of Usage nodes (e.g. Part) and Definition nodes (e.g. Part Definition) wrap, so nodes with long names can be resized narrower (v2025.4.0).
  - For Grasp: long names wrap so nodes can be narrowed; Grasp draws the name line on one line and boxes can't be resized.
  - Sources: `2025.4.0.adoc`, `CHANGELOG.adoc` v2025.4.0

#### Stereotype prefix lines

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Stereotype prefix lines** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: above the keyword line, a node label can show «variation», «variant» (when owned by a VariantMembership or by a variation parent) and «abstract». Occurrences add «individual» and «snapshot» or «timeslice» from their portion kind (shown on OccurrenceUsage and subclasses since 2026.3.0). Parallel states and state definitions add «parallel».
  - For Grasp: «abstract», «variation», «parallel» and the like on lines above the keyword; Grasp puts abstract and parallel on the keyword line.
  - Sources: `MultiLineLabelSwitch.java`, `CHANGELOG.adoc` v2026.3.0

#### Special node labels (actor, reference, perform, assign, accept)

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Special node labels (actor, reference, perform, assign, accept)** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: a PartUsage acting as an actor shows no keyword line. A ReferenceUsage shows «parameter» when an action owns it, «subject» when it is a subject, otherwise «reference». A perform node shows «perform action» when it performs itself, otherwise «perform» followed by the performed action's name. An assignment shows «assign» then 'referent:=value'. An accept action shows a «accept»payload:Type line and a «via»receiver line.
  - For Grasp: special labels for actors, references, perform, assign and accept with «via»; Grasp labels send and accept actions but none of the others.
  - Sources: `MultiLineLabelSwitch.java`

#### Identification '<short> name' and state subaction kind

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Identification '<short> name' and state subaction kind** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: an element's identification renders as '<shortName> declaredName'; since 2024.11.0 container and compartment-item labels show the short name. An ActionUsage in a StateSubactionMembership is prefixed with its kind (entry, do or exit).
  - For Grasp: labels show '<short> name' and a subaction's entry, do or exit; Grasp shows the subaction kind but no short names.
  - Sources: `DiagramQueryLabelService.java`, `CHANGELOG.adoc` v2024.11.0

#### Control node and actor outside labels

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Control node and actor outside labels** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: fork, join, decision and merge nodes show their plain name as an outside label below the node; actor nodes show their container label (identification, multiplicity, typing...) as an outside label under the actor figure. Elements with no dedicated case (e.g. plain Element) show only their identification.
  - For Grasp: control node and actor names sit outside below the shape; Grasp puts control node names at lower right and has no actors.
  - Sources: `AbstractControlNodeActionNodeDescriptionProvider.java`, `ActorNodeDescriptionProvider.java`, `MultiLineLabelSwitch.java`

#### Compartment title naming

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Compartment title naming** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: a compartment's title derives from its item type. A Usage type is lower-camel-cased with 'Usage' replaced by 's' ('attributes', 'parts', 'ports', 'actions', 'states'), Documentation gives 'doc', and other types use the type name. Custom titles override this: 'enums', 'assume constraints', 'require constraints', 'perform actions', 'parameters', 'subject', 'actors', 'stakeholders', 'objective', 'ends', 'frames', 'satisfy requirements', 'states', 'exhibit states', 'action flow', 'state transition', 'interconnection'.
  - For Grasp: compartment titles such as attributes, parts, ports, actions; Grasp titles only doc, code and actions compartments.
  - Sources: `AbstractCompartmentNodeDescriptionProvider.java`, `CompartmentNodeDescriptionProvider.java`

#### Edge label formats

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Edge label formats** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: the default edge label is the identification plus ': type'. The begin label shows '[expression]' when the element has exactly one expression; only succession edges define a begin label, so this is how a succession's guard or value expression appears. A ConnectionUsage label adds ' ▶ <flow name>' (or ' ▶ Flow') when it owns a FlowUsage. A Dependency shows its identification, including the short name (as do interface edges), and a satisfy edge shows '«satisfy»'. Since 2024.11.0, relationships are created without default names and edge labels are computed generically (e.g. succession labels). Composite (nested-part) edges with a multiplicity range have an empty center label.
  - For Grasp: edge labels show name and type, a guard as '[expr]', ▶ flow and «satisfy»; Grasp labels connections and guards only.
  - Sources: `DiagramQueryLabelService.java`, `DiagramQueryLabelServiceTest.java`, `CHANGELOG.adoc` v2024.11.0

#### Center label per edge kind

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Center label per edge kind** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: partly
  - What it is: fixed keyword labels: allocation «allocate», frame concern «frame», include use case «include», requirement derivation «derive», satisfy «satisfy», requirement constraint «require» or «assume» (from the membership kind), binding connector and feature value '='. Computed labels: dependency (identification), flow, interface and succession (identification + ': type'), connection (plus ' ▶ flow'), transition (trigger/guard/effect). No label: feature typing, subclassification, subsetting, redefinition, annotation and the nested actor, stakeholder and subject edges; composition edges have an empty label kept only for direct edit.
  - For Grasp: keyword labels per edge kind: «allocate», «frame», «include», '='; Grasp has '=' only.
  - Sources: `AbstractAllocateEdgeDescriptionProvider.java`, `RequirementConstraintEdgeDescriptionProvider.java`, `FrameConcernEdgeDescriptionProvider.java`

#### Edge begin, center and end labels

**Grasp: partly** · parts: diagrams, sysml-views

SysON features encompassed (3):

- **Edge label placement** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: partly
  - What it is: begin and end labels are placed according to the edge's handle positions. Edge labels are better centered. Newly created edge labels are positioned correctly. _(Sirius Web)_
  - For Grasp: end labels sit by their ends and centre labels on the middle; Grasp puts a line's label at its middle only.
  - Sources: `CHANGELOG.adoc` v2024.1.0, `CHANGELOG.adoc` v2025.12.0
- **Edge labels: begin, center, end** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: partly
  - What it is: Edges can show begin, center and end labels, positioned correctly and not hidden by other nodes. _(Sirius Web)_
  - For Grasp: edges have begin, centre and end labels; Grasp puts a single label at a line's middle.
  - Sources: `diagram.graphqls`, `CHANGELOG.adoc`
- **Edge begin, center and end label rendering** · sysml-views / Direct edit & label syntax · Sirius Web · useful · Grasp: partly
  - What it is: an edge can show a begin label near its source, a center label, and an end label near its target. Begin and end labels are offset from the endpoint by handle side (translate(2%,-100%) on right or top, (-102%,-100%) on left, (2%,0%) on bottom). The center label sits in the middle of the middle segment (even bend-point count) or on the middle bend point (odd count), shifted by half its width or height along the segment unless the user moved it. It is placed from the edge path geometry, so it follows the path instead of keeping a stale offset. A label whose visibility is hidden is not rendered. _(Sirius Web)_
  - For Grasp: begin, center and end labels placed along the edge; Grasp shows only a center label.
  - Sources: `DraggableEdgeLabels.tsx`, `MultiLabelRectilinearEditableEdge.tsx`, `edge-label.spec.ts`

#### Outside labels

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Outside labels** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: partly
  - What it is: Nodes can have outside labels in addition to the inside label, at BOTTOM_BEGIN, BOTTOM_MIDDLE or BOTTOM_END (initially bottom center only). Outside labels are not truncated, and label edit tools work on nodes with outside labels. _(Sirius Web)_
  - For Grasp: labels outside a node, below it; Grasp puts port names outside the owner, but not other labels.
  - Sources: `diagram.graphqls`, `CHANGELOG.adoc`

#### Label overflow strategy

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Label overflow strategy** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: partly
  - What it is: overflowStrategy on inside and outside labels: NONE (the node grows to show the whole label), WRAP (wraps onto new lines) or ELLIPSIS (end replaced with '...'). In CSS, NONE keeps white space as typed (pre) and ignores the label's max width. WRAP hides overflow and breaks long words (overflow-wrap: break-word). ELLIPSIS forces a single line (nowrap) with text-overflow ellipsis. Label text otherwise uses pre-line, so typed line breaks show. Label icons sit to the left of the text with an 8px gap. Inside labels get a default padding of 8px 16px, used by rectangle, image, list and SysON's custom nodes; icon-label (compartment item) rows use 0 8px. A faded element's labels drop to 0.4 opacity. _(Sirius Web)_
  - For Grasp: labels grow, wrap or cut with an ellipsis; Grasp wraps compartment text but not by a chosen strategy.
  - Sources: `node-description.adoc`, `Label.tsx`, `convertLabel.ts`

#### Header separator display mode

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Header separator display mode** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: partly
  - What it is: A header label can draw a separator line using the node's border style (borderSize, borderStyle, borderColor), below a TOP header or above a BOTTOM header. Modes: NEVER, ALWAYS, IF_CHILDREN (only when the node has at least one visible child). The separator appears as soon as a list child is added, spans the full node width, and adds the border width to the header footprint. The header's bottom border is hidden when the node is collapsed. SysON uses IF_CHILDREN and NEVER. _(Sirius Web)_
  - For Grasp: a rule under the header only when there is content below; Grasp draws compartments below the header only when they have content.
  - Sources: `convertLabel.ts`, `layoutNode.ts`, `diagram.graphqls`

#### Label auto-wrap and containment

**Grasp: unclear** · parts: diagrams

SysON feature encompassed (1):

- **Label auto-wrap and containment** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: unclear
  - What it is: Node labels wrap to fit the node width, do not exceed their container, wrapped labels do not overflow, and manual line breaks are rendered. _(Sirius Web)_
  - For Grasp: labels wrap to the node width and keep typed line breaks; Grasp wraps doc text, but the README doesn't say for names.
  - Sources: `CHANGELOG.adoc`

### Expressions (14)

Creating, editing, validating and showing expressions for values, constraints and guards.

#### Expression editor dialog (Create/Edit Expression)

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Expression editor dialog (Create/Edit Expression)** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: a medium-width modal titled 'Create Expression' or 'Edit Expression', with the hint 'Enter a valid expression below' and a multiline outlined text field holding the expression in textual SysML, fixed at 5 rows (minimum and maximum), so longer text scrolls inside it. Key presses inside it don't reach the explorer or diagram behind. Escape or a click outside closes it like Cancel. It opens from the diagram palette, the Explorer and the Details view.
  - For Grasp: a modal for typing an expression in textual SysML, from palette, tree or details; Grasp has no expression editor.
  - Sources: `EditSysMLExpressionModal.tsx`, `EditSysMLExpressionModal.types.ts`, `expressions.adoc`

#### Default value / Initial value checkboxes

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Default value / Initial value checkboxes** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: since 2026.7.0, when the expression is (or will be) the value of a FeatureValue (e.g. of an AttributeUsage), a 'Properties' row shows 'Default value' (isDefault) and 'Initial value' (isInitial) checkboxes. The two checkboxes are independent (both can be checked) and are disabled while loading or submitting. They are prefilled from the owning FeatureValue, sent with create/edit only when the element supports them (otherwise no properties are sent), and applied to the owning FeatureValue of the new expression. They also work when the selected element is the FeatureValue itself. They are hidden for ConstraintUsage predicates and transition guards. Toggling a checkbox does not reset the validation status, and a flag-only change still goes through Update, which re-parses the unchanged text and replaces the expression.
  - For Grasp: Default value and Initial value checkboxes set ':=' and 'default'; Grasp holds no values.
  - Sources: `ExpressionFeatureValueProperties.tsx`, `expressions.adoc`, `CHANGELOG.adoc` v2026.7.0

#### Automatic SI unit import

**Grasp: missing** · parts: model, sysml-views

SysON features encompassed (2):

- **Automatic SI import for unit expressions** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: since 2026.9.0, when an expression entered in the dialog uses unprefixed standard units, a NamespaceImport of SI is created under the closest ancestor Package of the element holding the expression, or in the root Namespace if there is none. It happens during name resolution of the parsed text: a name that does not resolve in any of the element's resolving namespaces is retried as `SI::<name>`, and on success the import (of the SI library namespace) is added and the reference bound; the same resolver serves textual import. If the element has no owning namespace at all, the error 'Unable to find owning Namespace of X' is reported. Example from the tests: creating '1 [g]' on attribute 'x1' without any SI import succeeds and its node then reads 'x1 = 1 [g]'. (The Flashlight tutorial still adds an SI Namespace Import by hand before typing 'actualweight <= 0.25 [kg]'.)
  - For Grasp: units like '[kg]' in an expression import SI automatically; Grasp has no units or libraries.
  - Sources: `2026.9.0.adoc`, `ProxyResolver.java`, `CHANGELOG.adoc` v2026.9.0
- **Automatic SI unit import** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: missing
  - What it is: when a name does not resolve, the importer retries it as 'SI::<name>'; on success it adds a NamespaceImport of the SI library package to the closest Package ancestor of the referencing element (or the outermost Namespace). Un-prefixed standard units in imported text and in the expression dialog therefore work without a manual import (v2026.9.0).
  - For Grasp: standard units work in text without an explicit import; Grasp has no text import, though its export adds the units import it needs.
  - Sources: `ProxyResolver.java`, `2026.9.0.adoc`

#### New / Edit Expression palette tools

**Grasp: missing** · parts: diagrams, sysml-views

SysON features encompassed (3):

- **Expression tools in the Edit section** · diagrams / Diagram: palette & tool UI · SysON · useful · Grasp: missing
  - What it is: New Expression, Edit Expression and Delete Expression appear in the default 'Edit' section of an element's palette and are found by the palette search. They are not offered on inherited border nodes or inherited compartment items. 'New expression' appears only on non-read-only elements that can own an expression and do not have one yet (the manual lists Attributes, Constraints, Successions and Transitions). 'Edit expression' appears on an expression node itself, or on an element that owns exactly one expression when its owner does not also own one. 'Delete expression' appears only in the latter case, since a plain Delete removes an expression node. The 2026.7 release notes still speak of an 'Expression(s)' palette section, but that same release moved the tools into the default 'Edit' section.
  - For Grasp: create, edit and delete expressions from the palette; Grasp has no expression editing beyond guard and effect fields.
  - Sources: `ExpressionsPaletteToolsProvider.java`, `expressions.adoc`, `CHANGELOG.adoc`
- **'New Expression' palette tool** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: backend tool `tool_new_expression` ('New expression') in the palette's default 'Edit' section (`edit-section`, since 2026.7.0), shown in the frontend as 'New Expression' with icon `/api/images/palette/create.svg`. It is offered when exactly one node or edge is targeted whose element is not read-only, can contain an expression (a Feature such as an attribute, constraint or transition) and doesn't already have exactly one. It opens the dialog in create mode, and the palette closes when the dialog closes. Disabled in read-only diagrams and filtered by palette search (fuzzy match on the frontend label): non-matching expression tools are hidden, but unlike the Explorer versions the diagram entries render a plain label, so the matched characters are not highlighted although the 2026.9.0 changelog says they are. The expression tools are contributed as an extra 'Edit' section only when at least one of them applies, and never as quick-access tools.
  - For Grasp: palette tool to add an expression to an attribute, constraint or transition; Grasp holds no expressions besides guard text.
  - Sources: `ExpressionsPaletteToolsProvider.java`, `NewExpressionDiagramToolOverriddenContribution.tsx`, `CHANGELOG.adoc` v2026.7.0
- **'Edit Expression' palette tool** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: backend tool `tool_edit_expression` ('Edit expression') in the 'Edit' section, shown as 'Edit Expression' with icon `/api/images/diagram-images/edit.svg`. It is offered on a node or edge whose element is a top-level Expression, or holds exactly one expression while its owner does not also hold exactly one; unlike New, the backend doesn't check read-only. It opens the dialog in edit mode, prefilled with the current expression.
  - For Grasp: palette tool to edit an element's expression; Grasp holds no expressions besides guard text.
  - Sources: `ExpressionsPaletteToolsProvider.java`, `EditExpressionDiagramToolOverriddenContribution.tsx`

#### Set a constraint predicate with New Expression

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Set a constraint predicate with New Expression** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: on a constraint, 'New Expression' in the Edit section opens the dialog; typing e.g. 'actualweight <= 0.25 [kg]' and clicking Update sets it as the constraint's predicate. Assume constraints and other raw expression elements are edited this way instead of by direct edit.
  - For Grasp: a constraint's predicate such as 'weight <= 0.25 [kg]' set through the dialog; Grasp has no constraints.
  - Sources: `flashlight.adoc`, `expressions.adoc`

#### Bind an item's value with New Expression

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Bind an item's value with New Expression** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: in the Action Flow View, 'New Expression' on an item in an items compartment with a feature reference (e.g. 'produceDirectedLight.onOffCmd') sets the item's value. Its label then reads '... = produceDirectedLight.onOffCmd' and a binding edge appears.
  - For Grasp: an item's value bound to another feature draws an '=' edge; Grasp holds no values.
  - Sources: `flashlight.adoc`

#### Expressions shown as text in the Explorer

**Grasp: missing** · parts: sysml-views, views

SysON features encompassed (2):

- **Expression labels** · views / Explorer view (model tree) · SysON · useful · Grasp: missing
  - What it is: Expression elements show their full textual representation as their label (e.g. "attr1 < 1", "100.0 * minVolume", "pressure <= maxPressure"; since 2026.5.0). Their internal sub-elements are hidden by default.
  - For Grasp: an expression shows as its text, such as attr1 < 1; Grasp holds guards as plain text and no expression elements.
  - Sources: `SysONDefaultExplorerServices.java`, `SysONExplorerTests.java`, `CHANGELOG.adoc` v2026.5.0
- **Expressions shown as text in the Explorer** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: tree items for top-level expressions display the full textual representation of the whole expression instead of the raw AST. Their internal elements (operands, sub-expressions, parameters) are hidden by the Explorer filter 'Hide Expression Internals', on by default since 2026.7.0, which drops every element directly owned by a top-level expression so the expression shows as a leaf; turning the filter off reveals them. Every expression item, internal sub-expressions included, is labelled with its own serialized text (e.g. an operand shows '1' or 'x').
  - For Grasp: the tree shows an expression as its text, internals hidden; Grasp has no expressions.
  - Sources: `expressions.adoc`, `SysONDefaultExplorerServices.java`, `SysONExplorerFilterService.java`

#### Constraint labels show their expression

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Constraint labels show their expression** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: since 2026.7.0, a constraint node shows its name and, if set, its expression on a new line as '{ expression }'. A constraint row shows its name and '::> referenced' (or the referenced constraint's name when unnamed), followed by ' { expr }' (e.g. 'name { 1 >= x.y.z }'). Expression-type rows such as assume constraints show the full serialized text. Direct edit ignores the braces part.
  - For Grasp: a constraint node shows '{ expression }' under its name; Grasp has no constraints.
  - Sources: `DiagramQueryLabelService.java`, `ExpressionsControllersIntegrationTests.java`, `CHANGELOG.adoc` v2026.7.0

#### All-or-nothing validation (warnings count as errors)

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **All-or-nothing validation (warnings count as errors)** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: an expression is created or replaced only when parsing and transformation produce no WARNING or ERROR and yield an expression. Otherwise every element added to the model is rolled back in reverse order, nothing changes, and the messages are returned in an ErrorPayload (unlike 'New objects from text', which keeps partial results). By design, malformed expressions are never stored, and the original formatting (whitespace) is not kept once parsed. Parser reports are mapped by severity to INFO, WARNING or ERROR messages (other severities are dropped); after a failure the dialog keeps the typed text so it can be fixed.
  - For Grasp: a malformed expression is never stored, all or nothing; Grasp doesn't parse guard text.
  - Sources: `SysideExpressionEditor.java`, `ASTTransformer.java`, `expressions.adoc`

#### Expression textual representation

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Expression textual representation** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: expressions are turned to text by the SysML serializer with '\n' line separators, tab indentation, shortest resolvable (file-name deresolved) names and no escape characters. This text feeds constraint labels, edge begin labels, the Explorer, the dialog and the Details section.
  - For Grasp: expressions are written as SysML text for labels and the tree; Grasp holds no expressions.
  - Sources: `MetamodelQueryElementService.java`

#### Serializer operator coverage

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Serializer operator coverage** · sysml-views / Expressions · SysON · useful · Grasp: missing
  - What it is: binary/unary operators `| & xor .. == != === !== < > <= >= + - * / % ^ ** ~ not`; classification (`istype`, `hastype`, `@`, `as`); bracket `[` units; sequences `,`; conditional binary (`??`, `and`, `or`, `implies`); `meta` casts; feature chains `a.b`; invocations. Unary `+ - ~` are written without a space, `not` with one.
  - For Grasp: the operators expressions can be written with; Grasp holds no expressions.
  - Sources: `SysMLElementSerializer.java`

#### Expression value section in Details

**Grasp: partly** · parts: sysml-views, views

SysON features encompassed (2):

- **Expression value section** · views / Details view & property forms · SysON · useful · Grasp: partly
  - What it is: when an Expression, or an element owning a single Expression (feature value, expression, result expression, guard expression), is selected, an "Expression value" row shows the expression's textual SysML as a read-only label (not a text field) with an Edit button ("..." more-horizontal icon, tooltip "Edit") opening the Edit Expression modal. An element that could own an expression but has none shows "<none>" in grey with a Create button ("+" icon, tooltip "Create") opening the Create Expression modal (since 2026.7.0). The backend emits a label widget keyed `syson:expression-value-widget` or `syson:missing-expression-value-widget`, which the frontend replaces with this section (matched by a label prefix on a LabelWidget); the component computes a style class from the label's color, font size, italic, bold, underline and strike-through but never applies it, so label styles have no visible effect; the button only opens the dialog when the view targets exactly one object. For FeatureValue-related expressions the Create popup also offers "Default value" (isDefault) and "Initial value" (isInitial) checkboxes. Fixes: expressions on TransitionUsage and the Edit expression modal on a selected FeatureValue (2026.7.0), creation and editing on SuccessionAsUsage (2026.9.0). `ExpressionPropertySection` is exported (2026.9.0) so downstream apps with their own extension registry can show the section. Candidate rules: a directly selected Expression qualifies only if it is not a Usage or Definition (so calculation or constraint usages show their owned expression instead); the feature-value group uses a selected FeatureValue that has a value, or a Feature's first owned FeatureValue; the guard group uses a TransitionFeatureMembership's expression or a TransitionUsage's first guard; the result group uses a ResultExpressionMembership, or a Namespace's one, that has a result expression; the "<none>"/Create group appears only on elements that are not read-only, can contain an expression and do not already have a single one. The row label is always "Expression value"; the target id is taken from the form id `details://?objectIds=[<uuid>]` only when it names a single UUID. The Edit/Create button itself does not check the read-only state. Creating an expression from Create leaves a single Expression value row showing the new text, and the element's palette then offers "Edit expression" instead of "New expression". In the modal (shared with the Explorer and diagram palettes; titled "Create Expression" or "Edit Expression", 5-row SysML text area focused on open, Ctrl+Enter also submits), "Update" validates the text; in Edit mode, emptying the text and clicking Update deletes the expression and closes the modal, so the row falls back to "<none>" with Create, while in Create mode Update stays disabled on blank text; a valid expression is applied and the modal closes, an invalid one keeps the modal open with the errors in an expandable accordion and leaves the model unchanged. The Default value / Initial value checkboxes are not shown for ConstraintUsage predicates or transition guards (feature value properties sent there are ignored), and properties left out of an edit keep their previous values. Test ids: `details-expression-value`, `Edit-expression-button`, `Create-expression-button`.
  - For Grasp: an expression row shows a value's text with Edit or Create, checked on save; Grasp types guards as unparsed text.
  - Sources: `ExpressionPropertySection.tsx`, `FormQueryElementService.java`, `CHANGELOG.adoc` v2026.7.0 / v2026.9.0
- **'Expression value' section** · sysml-views / Expressions · SysON · useful · Grasp: partly
  - What it is: since 2026.7.0, the Details Core page shows an 'Expression value' label widget (not a text field) with the expression's textual SysML and an icon button with the tooltip 'Edit' (three-dots icon) that opens the dialog in edit mode, targeting the object shown by the Details form; the button does nothing when the form shows several objects (its id must hold exactly one object id). The value is shown as plain body text: the section computes the label widget's style (color, font size, bold, italic, underline, strike-through) but never applies it. The groups behind it are untitled list-mode groups named 'Expression Value', placed at the end of the Core page after the other property groups (feature value, expression, result expression, guard, then missing expression). Four groups use the custom widget `syson:expression-value-widget`: the feature value of a Feature or selected FeatureValue (e.g. '80 [SI::centimetre]'), a selected Expression (not a Usage or Definition), the result expression of a function-like Namespace or ResultExpressionMembership, and the guard expression of a TransitionUsage or TransitionFeatureMembership (e.g. 'scanEnvironment.status == StatusKind::safe'; TransitionUsage support fixed in 2026.7.0).
  - For Grasp: the details view shows an element's value, guard or result expression with an Edit button; Grasp has a plain guard field only.
  - Sources: `SysONDetailsViewDescriptionProvider.java`, `ExpressionPropertySection.tsx`, `details.cy.ts`

#### Which elements hold expressions

**Grasp: partly** · parts: sysml-views

SysON feature encompassed (1):

- **Which elements hold expressions** · sysml-views / Expressions · SysON · useful · Grasp: partly
  - What it is: an element is an expression definition if it is an Expression but neither a Usage nor a BooleanExpression. A top-level expression has no expression ancestor. Through text, an expression attaches as a FeatureValue of a Feature, the guard of a TransitionUsage, or the result expression of a Function or Expression (e.g. a ConstraintUsage). SuccessionAsUsage is supported since 2026.9.0 (expression creation and editing on successions fixed, e.g. editing a succession's feature value from the succession). The user doc lists the supported elements as Attributes, Constraints, Successions and Transitions. "Can contain an expression" is true for every Feature (the only compatible ownership is a FeatureValue), so New Expression is offered on parts, ports, items and successions as well as attributes, constraints and transitions. A single expression is found when exactly one candidate is owned directly or through FeatureValues. When an element owns several candidate expressions (ambiguous), no Edit or Delete expression entry is offered for it and the New expression entry stays available.
  - For Grasp: attributes, constraints, successions and transitions can hold expressions; Grasp holds guard text on successions and transitions only.
  - Sources: `MetamodelQueryElementService.java`, `SysideExpressionEditor.java`, `CHANGELOG.adoc` v2026.9.0

#### Expression entries

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Expression entries** · views / Explorer view (model tree) · SysON · useful · Grasp: partly
  - What it is: "Create Expression" (`createExpression`) appears on a non-read-only Element that can contain an expression definition and has none yet. "Edit Expression" appears on a top-level Expression, which is deleted with the normal Delete. Its owner, when it holds a single root expression, gets both "Edit Expression" and "Delete Expression" (the latter with deletion confirmation). They open the same expression dialogs as on diagrams. "Delete Expression" calls `deleteExpression(editingContextId, parentElementId)` on the owner. The edit dialog is prefilled from `expressionTextualRepresentation(elementId)`, which also returns the feature value's isDefault/isInitial flags. Expression creation and editing are supported on Features (e.g. attributes), Constraints and Transitions (guard conditions) (2026.7.0), and expression operations are also offered on the expression's parent element (2026.7.0). In the palette, "Create Expression" shows a "+" icon and opens the expression dialog in create mode; all three entries match and highlight in the palette search (2026.9.0). The expressions doc also lists Successions among the supported owners. In the modal, "Update" or Ctrl+Enter validates. A valid expression is applied and the modal closes, while an invalid one keeps the modal open and lists the errors (e.g. unresolved names) in an expandable accordion. When the expression is owned by a FeatureValue, "Default value" and "Initial value" checkboxes are prefilled and saved together with the expression.
  - For Grasp: create, edit and delete expressions on features, constraints and guards, checked on save; Grasp types guards as plain unparsed text.
  - Sources: `SysONExplorerTreeItemContextMenuEntryProvider.java`, `NewExpressionExplorerToolOverriddenContribution.tsx`, `CHANGELOG.adoc` v2026.7.0

### Styling, icons and appearance (19)

Per-element appearance editors, project themes, default colours and sizes, arrowheads and SysML icons.

#### Appearances tab: style customizations table

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Appearances tab: style customizations table** · application / Project settings & customization · Sirius Web · useful · Grasp: missing
  - What it is: Titled 'Appearances' with the description 'Enable or disable style customizations to change the appearance of elements in representations'. A cursor-paginated table (default 20 rows, same pagination control as the projects table) lists the style customizations every provider offers for the project, one row each (duplicate registrations ignored; fixed in 2026.11), with columns: enable checkbox (no header), 'Name' and 'Description' (one line each; e.g. 'Power Status' and 'Status' in Sirius Web's Flow sample). The table has no search, sorting, row selection, column menus, filters, density, full-screen or column-hiding controls. The page title is an h3 'Appearances' over the description in grey. The table itself appears only once the project's capabilities have loaded (before that, only the title and description show); an empty list shows the table's 'No records to display', and a failed query shows its message as a toast. These labels come from a separate label bundle of the style-customizations module. Backed by `project.styleCustomizations(first, after, last, before)`, which needs the list-style-customizations capability (otherwise it returns an empty page and logs 'Access denied'). Rows come in provider order (not sorted), each node being `StyleCustomization {id, name, description, enabled}` with `enabled` computed from the project's stored settings; cursors are Relay global ids of type 'StyleCustomization'. What a customization does depends on the application. _(Sirius Web)_
  - For Grasp: a list of style customizations to switch on per project, such as SysON's theme; Grasp has no appearance settings.
  - Sources: `ProjectAppearancesSettingsView.tsx`, `ProjectStyleCustomizationsTable.tsx`, `ProjectStyleCustomizationSearchApplicationService.java`

#### SysON standard diagrams theme

**Grasp: missing** · parts: application, diagrams

SysON features encompassed (2):

- **SysON standard diagrams theme** · application / Project settings & customization · SysON, experimental · useful · Grasp: missing
  - What it is: SysON's one style customization, 'SysON standard diagrams theme' (id `syson-standard-diagrams-theme-style-customization`, 'Colors standard diagram elements according to their SysML element family (Structure, Behavior, ...)'). It is off by default and enabled per project in the Appearances tab. At render time a variable says whether the project has it enabled; it is only set for General View diagrams. Manual appearance changes take precedence over the theme, and resetting them restores the theme if it is enabled. For a themed node it sets the background, compartment background and border colors from its family's theme (compartments take their graphical ancestor's theme); colors can still be changed through the palette's Appearance section. The release notes call it a theme for 'standard diagrams' and the user manual includes its 'SysON Theme' section in both the General View and Interconnection View pages, but as coded only General View diagrams receive the enabled flag. New in 2026.11.0, documented as experimental and therefore off by default. _(experimental)_
  - For Grasp: colours General View nodes by SysML family, structure, behaviour and so on; Grasp draws every kind in the same colours.
  - Sources: `SDVStyleCustomizationDescriptionProvider.java`, `SDVNodeStyleCustomizer.java`, `manage-elements-diagram.adoc`
- **SysON standard diagrams theme** · diagrams / Diagram: appearance & styling · SysON, experimental · useful · Grasp: missing
  - What it is: SysON contributes one project style customization, 'SysON standard diagrams theme' (id syson-standard-diagrams-theme-style-customization), described as "Colors standard diagram elements according to their SysML element family (Structure, Behavior, ...)". It is toggled per project in Project settings > Appearances (tab described as 'Enable or disable style customizations to change the appearance of elements in representations', a table with 'Name' and 'Description' columns and a checkbox per row) and is off by default because it is experimental (2026.11). When enabled it sets node background, compartment background and border colors on nodes, compartments, compartment items and inherited items of all the project's standard diagrams, per family. Manual appearance changes take precedence, and resetting them restores the theme. _(experimental)_
  - For Grasp: an optional project theme colours elements by SysML family (structure, behaviour…); Grasp draws all boxes white with a dark border.
  - Sources: `SDVStyleCustomizationDescriptionProvider.java`, `SDVThemeProvider.java`, `2026.11.0.adoc`

#### Theme family: Structure

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Theme family: Structure** · diagrams / Diagram: appearance & styling · SysON, experimental · useful · Grasp: missing
  - What it is: PartDefinition/Usage, ItemDefinition/Usage, AttributeDefinition/Usage, PortDefinition/Usage, InterfaceDefinition/Usage, ConnectionDefinition/Usage and ReferenceUsage: node #DCD9F5, compartment #FCFAFF, border #8275BC. _(experimental)_
  - For Grasp: structure elements in lavender #DCD9F5 with #8275BC borders; Grasp has no family colours.
  - Sources: `SDVThemeProvider.java`

#### Theme family: Behavior

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Theme family: Behavior** · diagrams / Diagram: appearance & styling · SysON, experimental · useful · Grasp: missing
  - What it is: ActionDefinition/Usage, AcceptActionUsage, AssignmentActionUsage, PerformActionUsage, SendActionUsage, TerminateActionUsage, IfActionUsage, LoopActionUsage, ForLoopActionUsage, WhileLoopActionUsage, AllocationDefinition/Usage, FlowDefinition/Usage, Flow, SuccessionFlowUsage and TransitionUsage: node #DCF5C4, compartment #FAFEFC, border #186A3B. _(experimental)_
  - For Grasp: behaviour elements in green #DCF5C4 with #186A3B borders; Grasp has no family colours.
  - Sources: `SDVThemeProvider.java`

#### Appearance section in the palette

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Appearance section in the palette** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: missing
  - What it is: The palette's 'Appearance' entry (shown when at least one element is selected) edits the style of the selected elements: rectangular nodes, image nodes, inside and outside labels, edges (including edge type), edge labels (including visibility) and custom nodes. Every property has a reset button that updates its input, and edge menus are translated. SysON introduced it as a first version in 2025.6, and its 2025.10 notes say any element's appearance (color, font, ...) can be changed there. _(Sirius Web)_
  - For Grasp: restyle selected nodes, labels and edges (colours, fonts, borders) from the palette; Grasp's styling is fixed.
  - Sources: `PaletteAppearanceSection.tsx`, `2025.6.0.adoc`, `CHANGELOG.adoc`

#### Per-property reset

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Per-property reset** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: missing
  - What it is: Each property has a reset button (FormatColorReset icon) at its right. It discards the user customization of that property and restores the style computed from the description (or the theme). It is enabled only when the property is currently customized on the element. Each property row has the testid 'toolSection-Appearance-<Property label>' (e.g. 'toolSection-Appearance-Font Size', '…-Edge Type', '…-Border Radius') and its reset button '…-<Property label>-Reset'. _(Sirius Web)_
  - For Grasp: reset one customized style property back to its default; Grasp has no style customizing.
  - Sources: `TextFieldAppearanceProperty.tsx`, `useResetNodeAppearance.tsx`, `AppearanceColorPicker.tsx`

#### Rectangular node editor

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Rectangular node editor** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: missing
  - What it is: A 'Style' part with 'Background' (color), 'Border Color' (color), 'Border Radius' (number), 'Border Size' (number) and 'Border Line Style' (Solid, Dash, Dot, Dash Dot), followed by label editors for the 'Inside Label' and the 'Outside Middle Label' when present. In the Sirius Web test, Background accepts e.g. 'red' and reset restores e.g. rgb(240,240,240). _(Sirius Web)_
  - For Grasp: set a node's background, border colour, radius, size and line style; Grasp's boxes are styled by kind only.
  - Sources: `RectangularNodeAppearanceSection.tsx`, `RectangularNodePart.tsx`, `appearance.spec.ts`

#### Edge editor

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Edge editor** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: missing
  - What it is: A 'Style' part with 'Color', 'Size' (line width), 'Line Style' (Solid, Dash, Dot, Dash Dot), 'Source arrow', 'Target arrow' and 'Edge Type' (Manhattan, Oblique, Smart Manhattan), followed by label editors for the Begin, Center and End labels when present (e.g. center label font size applied on blur, border radius). In the Sirius Web test the defaults are #B1BCBE and 1px, and Color and Size have resets; SysON's own edges default to black. The Edge Type options are listed as Manhattan, Smart Manhattan, Oblique. Choosing a new edge type, or resetting it, also wipes the custom bending points of all the selected edges on the client. The 'Style' heading of this part, like the rectangular node's, is hard-coded in English. _(Sirius Web)_
  - For Grasp: set an edge's colour, width, line style, arrows and routing; Grasp's lines are styled by kind only.
  - Sources: `EdgeAppearancePart.tsx`, `EdgeAppearanceSection.tsx`, `appearance.spec.ts`

#### Label editor

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Label editor** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: missing
  - What it is: Each label editor (titled 'Inside Label', 'Outside Middle Label', 'Begin Label', 'Center Label' or 'End Label') offers 'Hide' (checkbox; hides the label and its resize anchors), 'Font Size', 'Italic', 'Bold', 'Underline', 'Strike Through', 'Border Color', 'Border Radius', 'Border Size', 'Border Line Style' (Solid/Dash/Dot/Dash Dot), 'Label Color' and 'Background'. In the Sirius Web test, changing an outside label's font size (default 14px) applies when the palette closes. 'Hide' sets CSS visibility: hidden, so the label keeps its space in the node layout. Node sections only offer an editor for the bottom-middle outside label; begin and end outside labels have none. One request edits at most one label per element. In a multi-edge selection where only some edges have a begin (or end) label, that label's edits and resets fail as a whole (see appearance errors). _(Sirius Web)_
  - For Grasp: style each label's font, colour, border and visibility; Grasp's labels are styled by role only.
  - Sources: `LabelAppearancePart.tsx`, `appearance.spec.ts`, `label.spec.ts`

#### Custom node style types

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Custom node style types** · diagrams / Diagram: appearance & styling · SysON · useful · Grasp: missing
  - What it is: Four custom node styles exist. 'customnode:sysmlpackage' (Papyrus Web-inspired package shape, GraphQL SysMLPackageNodeStyle in the INodeStyle union). 'customnode:sysmlimportedpackage' (SysMLImportedPackageNodeStyle). 'customnode:sysmlnote' (comment/documentation notes, SysMLNoteNodeStyle). 'customnode:sysmlviewframe' (SysMLViewFrameNodeStyle, which alone adds borderRadius). Each carries background (falls back to 'transparent'), borderColor (falls back to 'black'), borderSize, borderStyle (LineStyle) and the children layout strategy, all taken from the style description. The styles are stored in and read back from the persisted diagram JSON.
  - For Grasp: SysON's package shape with a tab, an import shape and a folded-corner note; Grasp has none of these shapes.
  - Sources: `SysMLPackageNodeStyle.java`, `SysMLViewFrameNodeStyleProvider.java`, `sysmlcustomnodes.graphqls`

#### Private and protected visibility decorators

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Private and protected visibility decorators** · diagrams / Diagram: appearance & styling · SysON · useful · Grasp: missing
  - What it is: Elements whose owning membership is private or protected get an overlay decorator on their icon (VisibilityKind_private.svg / VisibilityKind_protected.svg); public shows none. Applies in the Explorer and diagrams (2024.7).
  - For Grasp: private and protected members get a badge on their icon; Grasp has no visibility marks.
  - Sources: `NamespaceItemProvider.java`, `2024.7.0.adoc`, `CHANGELOG.adoc`

#### Custom node Appearance section

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Custom node Appearance section** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: the palette's Appearance entry (Sirius Web palette, header 'Appearance' with a back arrow) shows, for package, imported package and note nodes, a 'Style' block with Background and Border Color (color fields), Border Size (number field with line-weight icon) and Border Line Style (select: Solid, Dash, Dot, Dash Dot), followed by the Sirius Web 'Inside Label' block when the node has an inside label (Font Size, Bold, Italic, Underline, Strike Through, Label Color, Background, Border Color, Border Radius, Border Size, Border Line Style, Hide). The view frame variant adds Border Radius. Each field has a reset button (format-color-reset icon) enabled only when that property is customized; an edit applies to every selected node of the same custom type. Each SysON section is offered only when every selected element is a node of that custom type (mixed selections get none of them); because SysON supplies its own contribution list, it also re-registers Sirius Web's rectangular-node, image-node and edge appearance sections.
  - For Grasp: per-node background, border colour, size and line style with reset; Grasp has no node styling.
  - Sources: `SysMLPackageNodePart.tsx`, `SysMLViewFrameNodePart.tsx`, `SysONExtensionRegistry.tsx`

#### Project style theme on custom nodes

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Project style theme on custom nodes** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: when a project enables the standard-diagram style customization, family theme colors are applied to background and border of custom nodes as well as rectangular ones: NamespaceImport (imported package), Comment and Documentation nodes get the organization theme; Package and ViewUsage (view frame) nodes get a lighter organization variant that uses the compartment background color for the whole shape, a documented stopgap until their renderers can color header and content separately. TextualRepresentation notes have no theme entry.
  - For Grasp: project colour themes tint packages, imports, notes and views by element family; Grasp has no themes.
  - Sources: `SDVNodeStyleCustomizer.java`, `SDVThemeProvider.java`

#### Persisted style customizations

**Grasp: missing** · parts: sysml-views

SysON feature encompassed (1):

- **Persisted style customizations** · sysml-views / SysML diagram custom nodes & annotations · SysON · useful · Grasp: missing
  - What it is: per-node appearance handlers apply the changes and record each customized property (BACKGROUND, BORDER_COLOR, BORDER_SIZE, BORDER_STYLE, BORDER_RADIUS) so it survives diagram refreshes; a reset removes it so the description's default style applies again. When a project with diagrams is imported, dedicated diagram-importer handlers re-apply these customizations to the imported custom nodes. SysON registers no undo recorder for these styles (Sirius Web has them for rectangular, image and ellipse nodes).
  - For Grasp: style changes survive refresh and can be reset; Grasp has no node styling.
  - Sources: `SysMLViewFrameNodeAppearanceHandler.java`, `DiagramImporterSysMLNoteNodeStyleAppearanceChangeHandler.java`, `DiagramImporterUpdateService.java`

#### Rectangular node rendering

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Rectangular node rendering** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: partly
  - What it is: A RectangularNodeStyle without List layout renders as a free-form node with background color, border color, radius, size and line style (Solid; Dash is dashed; Dot is dotted; Dash_Dot is rendered dashed). The background layer's corner radii are inset by the border width per corner, so the fill never bleeds over rounded borders, while rounded images are preserved. The description-level Rectangular Node Style adds a background color to the common properties. _(Sirius Web)_
  - For Grasp: rectangles with fill, border colour, radius, width and dash style; Grasp draws rectangles with fixed fill and border per kind.
  - Sources: `RectangleNodeConverter.ts`, `FreeFormNode.tsx`, `node-description.adoc`

#### Image node style

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Image node style** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: partly
  - What it is: An ImageNodeStyle renders as a free-form node whose background is the image (server origin + imageURL), not repeated and stretched to 100% x 100%. It supports a border (color, radius, size, line style), labels, resizing, and child and border nodes like rectangles; rectangle and image nodes share the FreeFormNode renderer. SysON uses image styles for the start, done, decision and merge action nodes, the start and done state nodes, and the in/out/inout arrow images of port, item and parameter border nodes. _(Sirius Web)_
  - For Grasp: image nodes for start, done, decision, merge and direction arrows; Grasp draws these as SVG shapes and glyphs.
  - Sources: `ImageNodeConverter.ts`, `FreeFormNode.tsx`, `AbstractNodeDescriptionProvider.java`

#### List compartment style

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **List compartment style** · diagrams / Diagram: appearance & styling · SysON · useful · Grasp: partly
  - What it is: An italic 12pt centered header without icon or separator, transparent background, black border, square corners, list layout with a bottom gap of 10, default size 155x60, not user-resizable.
  - For Grasp: compartment headers in centred italic 12 pt; Grasp's compartment heads are italic 10.5 px, with no compartment border.
  - Sources: `AbstractCompartmentNodeDescriptionProvider.java`, `ViewConstants.java`

#### Default node sizes

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Default node sizes** · diagrams / Diagram: appearance & styling · SysON · useful · Grasp: partly
  - What it is: Width x height: definition 208x70, usage 194x60, package, namespace import/imported package and ViewUsage 200x101, notes (Comment, Documentation, TextualRepresentation) 200x70. Compartments are 155 wide: list 155x60, free-form 155x150, compartment item rows 155x15. Start action/state 28x28, done action/state, decision and merge 36x36, fork and join bars 100x12, actor image 41x92 (aspect ratio kept), border/parameter nodes 10x10. Default node width is 155.
  - For Grasp: definition 208x70, usage 194x60 and other default sizes; Grasp's boxes have their own default sizes.
  - Sources: `ViewConstants.java`, `NodeDefaultSizeExpressionSwitch.java`, `GVTopNodeCreationTests.java`

#### Edge style properties

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Edge style properties** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: partly
  - What it is: An edge style provides color (stroke, theme names resolved), size (stroke width) and lineStyle: Solid, Dash (dash array 5,5), Dot (2,2) or Dash_Dot (10,5,2,2,2,5). It also has source and target arrows and a routing type (Manhattan, SmartManhattan, Oblique). Edges render at z-index 2000 and carry customizedStyleProperties for the appearance editor. Description defaults: lineStyle Solid, sourceArrowStyle None, targetArrowStyle InputArrow, edgeWidth 1, edgeType Manhattan, showIcon false. Label settings are labelIcon, background, maxWidthExpression, font (fontSize 14, italic, bold, underline, strikeThrough) and border. Edges also support ConditionalEdgeStyle entries, which SysON uses for nested-usage edges. _(Sirius Web)_
  - For Grasp: edges with colour, width, dash style, arrows and routing; Grasp's lines have fixed styles per kind, e.g. dashed successions.
  - Sources: `convertDiagram.ts`, `edge-description.adoc`, `diagram.graphqls`

## Model behaviour

### Model semantics: metamodel, naming and imports (5)

Metamodel conformance, default names, name resolution and automatic namespace imports.

#### Automatic namespace import when referencing another package

**Grasp: missing** · parts: model, views

SysON features encompassed (2):

- **Automatic namespace import when setting a reference** · views / Details view & property forms · SysON · useful · Grasp: missing
  - What it is: when the generic reference widget, Redefines, References, Specializes, Subsets or Typed by sets a value, SysON checks whether the new value is visible from the owner's namespaces; if no namespace import (or recursive import of an ancestor) and no membership import (or recursive one) already provides it, it inserts a NamespaceImport of the value's owning namespace as the first relationship of the closest containing Package (or of the owning namespace when there is no package), unless that namespace is already the value's own. Payload, Receiver, Source and Target do not add imports.
  - For Grasp: picking a type from another package adds the needed import automatically; Grasp has one package and no imports.
  - Sources: `FormMutationElementService.java`, `MetamodelMutationImportService.java`
- **Automatic NamespaceImport on outside reference** · model / Model semantics & editing services · SysON · useful · Grasp: missing
  - What it is: referencing an element outside the current scope (diagram direct edit, connecting elements, edge creation, Details view reference widgets, typing a usage with a definition of another package) automatically creates a NamespaceImport so the reference resolves (introduced in v2024.1.0 so standard-library elements resolve without explicit imports); none is created when an existing MembershipImport/NamespaceImport already covers it or when the element is referenced by qualified name. For Details reference widgets an import is handled for each referenced value.
  - For Grasp: referencing another package's element adds the import so it resolves; Grasp has one package and nothing outside it.
  - Sources: `FormMutationElementService.java`, `handle_imports_and_namespaces.adoc`, `MetamodelMutationImportServiceTest.java`

#### Import insertion and coverage check

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Import insertion and coverage check** · model / Model semantics & editing services · SysON · useful · Grasp: missing
  - What it is: when an edit references an element of another namespace (typing, subsetting, redefinition, subclassification, derivation metadata, Details reference widgets), a NamespaceImport of its owning namespace is inserted first in the nearest containing Package; skipped when the namespaces are the same or an existing import already gives visibility (namespace import of that namespace, recursive import of an ancestor, membership import of the element or of a recursive ancestor). As coded: only the imports owned by the element's owning namespace and its containing namespaces are checked (imports reached through specialization or re-export are not); when there is no Package ancestor the import goes into the element's owning namespace; it is inserted at index 0 of the owned relationships and keeps the Import defaults (visibility private, not recursive, not importAll; setting visibility to null also resets it to private); nothing is added when the referenced element has no owning namespace.
  - For Grasp: the needed import is added only when no existing one covers it; Grasp has one package and adds only its own library imports.
  - Sources: `MetamodelMutationImportService.java`, `ImportImpl.java`

#### Numbered default names

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Numbered default names** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: new Definitions and Packages are named '<MetaclassName><n>' (PartDefinition1, Package1, EnumerationDefinition1); new Usages '<metaclass in lowerCamel without Usage><n>' (part1, attribute2, connection<n>, interface<n>). n is the count of members of the same kind in the owning namespace including the new one, so names never collide with SysML keywords (a new part under a PartDefinition with 5 parts is 'part6'). Applies to every creation tool (diagram palette, Explorer New object). As coded, 'same kind' means the exact same metaclass among the namespace's owned members only (a PortUsage or an inherited part does not count towards 'part<n>'), an element with no owning namespace gets n = 0, and since n is a count rather than the next free index, deleting an earlier sibling can make the next default name repeat an existing one (part1, part2, delete part1, the next part is again 'part2').
  - For Grasp: new elements get names like PartDefinition1 and part1; Grasp numbers by next free index but writes PartDef1, not PartDefinition1.
  - Sources: `ElementInitializerSwitch.java`, `ElementInitializerSwitchTest.java`, `2025.2.0.adoc`

#### Name lookup: scoped resolution then global fallback

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Name lookup: scoped resolution then global fallback** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: a name is resolved through SysML namespace scoping from the element (or its owning namespace); if that fails every resource is searched by name or short name, honoring qualified names, public imports, unnamed root namespaces and optional single quotes. Qualified names may also use short names as segments (v2025.12.0).
  - For Grasp: names resolve by scope, then across all models, short names included; Grasp looks names up in its one package.
  - Sources: `UtilService.java`, `ElementUtil.java`, `CHANGELOG.adoc` v2025.12.0

#### Effective names and naming feature

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Effective names and naming feature** · model / Model semantics & editing services · SysON · useful · Grasp: partly
  - What it is: an element's name is its effective name: declaredName by default, short name declaredShortName (getName/getShortName reimplemented in v2024.7.0). A Feature with neither declared name nor declared short name takes both from its naming feature: an unnamed constraint referencing SuperConstraint (short name SC) shows 'SuperConstraint'/'SC'; declaring either a name or a short name switches this off (a feature with only a short name then has no name). The naming feature is, by default, the target of the feature's first owned Redefinition; for a Usage owned by a VariantMembership (enumeration literal, variant) and for a ConstraintUsage in a RequirementConstraintMembership (assume/require), it is the feature it reference-subsets; for a PerformActionUsage the performed action; for a ReferenceUsage that is a TransitionUsage's second input parameter, the transition's trigger payload parameter. A ConjugatedPortDefinition is named '~' + its original PortDefinition's name (no name when the original has none). Visible in Explorer, diagram labels and Details.
  - For Grasp: an unnamed redefining feature shows the name it redefines, a conjugate '~P'; Grasp writes same-named ports as redefinitions but holds no unnamed redefinitions.
  - Sources: `FeatureImpl.java`, `UsageImpl.java`, `UsageImplTest.java`

### Validation (15)

Model checks against the SysML v2 specification rules and how problems are reported.

#### Action rules

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Action rules** · model / Validation & model checks · SysON · useful · Grasp: missing
  - What it is: ActionDefinition: checkActionDefinitionSpecialization. ActionUsage: checkActionUsageOwnedActionSpecialization, checkActionUsageSpecialization, checkActionUsageStateActionRedefinition, checkActionUsageSubactionSpecialization. AcceptActionUsage: checkAcceptActionUsageReceiverBindingConnector, checkAcceptActionUsageSpecialization, checkAcceptActionUsageSubactionSpecialization, checkAcceptActionUsageTriggerActionSpecialization, validateAcceptActionUsageParameters (at least 2 input parameters). AssignmentActionUsage: checkAssignmentActionUsageAccessedFeatureRedefinition, checkAssignmentActionUsageReferentRedefinition, checkAssignmentActionUsageSpecialization, checkAssignmentActionUsageStartingAtRedefinition, checkAssignmentActionUsageSubactionSpecialization, validateAssignmentActionUsage (the referent must be time-varying), validateAssignmentActionUsageReferent. SendActionUsage: checkSendActionUsageSpecialization, checkSendActionUsageSubactionSpecialization, validateSendActionParameters (at least 3 inputs). PerformActionUsage: checkPerformActionUsageSpecialization, validatePerformActionUsageReference. TerminateActionUsage: checkTerminateActionUsageSpecialization, checkTerminateActionUsageSubactionSpecialization.
  - For Grasp: catches malformed actions, sends and accepts the action flow view draws; Grasp checks a send's payload by its own rule, none of these.
  - Sources: `SysMLValidationRule.java`

#### Part and item rules

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Part and item rules** · model / Validation & model checks · SysON · useful · Grasp: missing
  - What it is: PartDefinition: checkPartDefinitionSpecialization. PartUsage: checkPartUsageActorSpecialization, checkPartUsageSpecialization, checkPartUsageStakeholderSpecialization, checkPartUsageSubpartSpecialization, validatePartUsagePartDefinition (at least one item definition must be a PartDefinition). ItemDefinition: checkItemDefinitionSpecialization. ItemUsage: checkItemUsageSpecialization, checkItemUsageSubitemSpecialization.
  - For Grasp: checks parts and items, e.g. a part needs a part definition; Grasp checks none of these.
  - Sources: `SysMLValidationRule.java`

#### Port rules

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Port rules** · model / Validation & model checks · SysON · useful · Grasp: missing
  - What it is: PortDefinition: checkPortDefinitionSpecialization, validatePortDefinitionConjugatedPortDefinition (exactly one owned ConjugatedPortDefinition), validatePortDefinitionOwnedUsagesNotComposite. PortUsage: checkPortUsageOwnedPortSpecialization, checkPortUsageSpecialization, checkPortUsageSubportSpecialization, validatePortUsageIsReference (referential unless owned by a port), validatePortUsageNestedUsagesNotComposite. ConjugatedPortDefinition: validateConjugatedPortDefinitionConjugatedPortDefinitionIsEmpty, validateConjugatedPortDefinitionOriginalPortDefinition.
  - For Grasp: checks port definitions and port usages are well formed; Grasp draws ports but checks none of these.
  - Sources: `SysMLValidationRule.java`

#### Connection, interface and allocation rules

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Connection, interface and allocation rules** · model / Validation & model checks · SysON · useful · Grasp: missing
  - What it is: ConnectionDefinition: checkConnectionDefinitionBinarySpecialization, checkConnectionDefinitionSpecializations, validateConnectionDefinitionIsSufficient (isSufficient must be true). ConnectionUsage: checkConnectionUsageBinarySpecialization, checkConnectionUsageSpecialization. InterfaceDefinition: checkInterfaceDefinitionBinarySpecialization, checkInterfaceDefinitionSpecialization. InterfaceUsage: checkInterfaceUsageBinarySpecialization, checkInterfaceUsageSpecialization. AllocationDefinition: checkAllocationDefinitionSpecialization. AllocationUsage: checkAllocationUsageSpecialization.
  - For Grasp: checks connection and interface definitions and usages; Grasp checks only an interface end's multiplicity, under feature rules.
  - Sources: `SysMLValidationRule.java`

#### Connector, binding and succession rules

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Connector, binding and succession rules** · model / Validation & model checks · SysON · useful · Grasp: missing
  - What it is: Connector: checkConnectorBinaryObjectSpecialization, checkConnectorBinarySpecialization, checkConnectorObjectSpecialization, checkConnectorSpecialization, checkConnectorTypeFeaturing, validateConnectorBinarySpecialization (connectors with more than 2 ends must not specialize BinaryLink), validateConnectorRelatedFeatures (a concrete connector needs at least 2 related features). BindingConnector: checkBindingConnectorSpecialization, validateBindingConnectorIsBinary. Succession: checkSuccessionSpecialization.
  - For Grasp: checks connectors have enough ends and bindings are binary; Grasp's palette refuses bad lines but runs none of these rules.
  - Sources: `SysMLValidationRule.java`

#### Flow rules

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Flow rules** · model / Validation & model checks · SysON · useful · Grasp: missing
  - What it is: FlowDefinition: checkFlowDefinitionBinarySpecialization, checkFlowDefinitionSpecialization, validateFlowDefinitionFlowEnds (at most two flow ends). FlowUsage: checkFlowUsageFlowSpecialization, checkFlowUsageSpecialization. Flow: checkFlowSpecialization, checkFlowWithEndsSpecialization, validateFlowPayloadFeature (at most one PayloadFeature). FlowEnd: validateFlowEndIsEnd, validateFlowEndNestedFeature (exactly one owned feature), validateFlowEndOwningType. PayloadFeature: checkPayloadFeatureRedefinition. SuccessionFlow: checkSuccessionFlowSpecialization. SuccessionFlowUsage: checkSuccessionFlowUsageSpecialization.
  - For Grasp: checks flows' ends and payloads; Grasp draws flows but runs none of these rules.
  - Sources: `SysMLValidationRule.java`

#### Inline validation messages in forms

**Grasp: partly** · parts: views

SysON feature encompassed (1):

- **Inline validation messages in forms** · views / Details view & property forms · Sirius Web · useful · Grasp: partly
  - What it is: when a constraint fails, a diagnostic message appears inline next to the affected field (widget diagnostics), so it can be fixed without leaving the view. Each diagnostic has a kind and a message computed by the widget description's diagnostics provider; any diagnostic puts the widget in error state (red) and the first message is shown as helper text under text fields, text areas, checkboxes, selects, multi-selects, radios, lists, date/time fields and reference widgets. View-based (studio) widgets support diagnostics since 2025.2.0, which also fixed irrelevant help texts and diagnostics being shown. In the default form, diagnostic kinds come from the EMF severity (Error, Warning, Info, otherwise Unknown), but the frontend does not tell them apart: warnings and infos also turn the widget red, and only the first message is shown. _(Sirius Web)_
  - For Grasp: a failed check shows in red beside the field it concerns; Grasp lists the selection's problems under its fields, not on each.
  - Sources: `TextfieldPropertySection.tsx`, `DiagnosticComponent.java`, `CHANGELOG.adoc` v2025.2.0

#### Project models only

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Project models only** · model / Validation & model checks · SysON · useful · Grasp: partly
  - What it is: validation covers the whole editing context, running an EMF Diagnostician recursively (VALIDATE_RECURSIVELY) from every resource's root elements and keeping the child diagnostics, but skips the standard library resources and libraries referenced from other projects, since users cannot fix them there; the library owner fixes issues in the project that contains the library. Validation runs longer than 200 ms are logged at debug level.
  - For Grasp: the modeller only sees problems they can fix, not library ones; Grasp validates its whole model but has no libraries to exclude.
  - Sources: `SysONSysMLValidationService.java`, `2025.8.0.adoc`, `2026.3.0.adoc`

#### Control node rules

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Control node rules** · model / Validation & model checks · SysON · useful · Grasp: partly
  - What it is: ControlNode: checkControlNodeSpecialization, validateControlNodeIncomingSuccessions (incoming target multiplicity 1..1), validateControlNodeIsComposite, validateControlNodeOutgoingSuccessions (outgoing source multiplicity 1..1), validateControlNodeOwningType (owned by an ActionDefinition or ActionUsage). DecisionNode: checkDecisionNodeOutgoingSuccessionSpecialization, checkDecisionNodeSpecialization, validateDecisionNodeIncomingSuccessions (at most one incoming), validateDecisionNodeOutgoingSuccessions (outgoing target multiplicity 0..1). ForkNode: checkForkNodeSpecialization, validateForkNodeIncomingSuccessions (at most one incoming). JoinNode: checkJoinNodeSpecialization, validateJoinNodeOutgoingSuccessions (at most one outgoing). MergeNode: checkMergeNodeIncomingSuccessionSpecialization, checkMergeNodeSpecialization, validateMergeNodeIncomingSuccessions (incoming source multiplicity 0..1), validateMergeNodeOutgoingSuccessions (at most one outgoing).
  - For Grasp: checks forks, joins, decisions and merges in action flows; Grasp has the owning-type and four succession-count rules, not specialization or multiplicities.
  - Sources: `SysMLValidationRule.java`

#### State rules

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **State rules** · model / Validation & model checks · SysON · useful · Grasp: partly
  - What it is: StateDefinition: checkStateDefinitionSpecialization, validateStateDefinitionParallelSubactions (owned actions of a parallel state have no transitions), validateStateDefinitionStateSubactionKind (at most one entry/do/exit of each kind). StateUsage: checkStateUsageExclusiveStateSpecialization, checkStateUsageOwnedStateSpecialization, checkStateUsageSpecialization, checkStateUsageSubstateSpecialization, validateStateUsageParallelSubactions, validateStateUsageStateSubactionKind. ExhibitStateUsage: checkExhibitStateUsageSpecialization, validateExhibitStateUsageReference. StateSubactionMembership: validateStateSubactionMembershipOwningType (owned by a StateDefinition or StateUsage).
  - For Grasp: checks parallel states and entry/do/exit; Grasp has those four, lacks specialization, exhibit-state and membership owning-type rules.
  - Sources: `SysMLValidationRule.java`

#### Transition rules

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Transition rules** · model / Validation & model checks · SysON · useful · Grasp: partly
  - What it is: TransitionUsage: checkTransitionUsageActionSpecialization, checkTransitionUsagePayloadSpecialization, checkTransitionUsageSourceBindingConnector, checkTransitionUsageSpecialization, checkTransitionUsageStateSpecialization, checkTransitionUsageSuccessionBindingConnector, checkTransitionUsageSuccessionSourceSpecialization, checkTransitionUsageTransitionFeatureSpecialization, validateTransitionUsageParameters (at least 1 input, or 2 with a trigger), validateTransitionUsageSuccession (owns a Succession to an ActionUsage), validateTransitionUsageTriggerActions (no triggers unless the source is a StateUsage). TransitionFeatureMembership: validateTransitionFeatureMembershipEffectAction (an effect is an ActionUsage), validateTransitionFeatureMembershipGuardExpression (a guard is a Boolean Expression), validateTransitionFeatureMembershipOwningType, validateTransitionFeatureMembershipTriggerAction (a trigger is an AcceptActionUsage).
  - For Grasp: checks transitions' triggers, guards and effects; Grasp checks only triggers leaving a non-state.
  - Sources: `SysMLValidationRule.java`

#### Feature rules

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Feature rules** · model / Validation & model checks · SysON · useful · Grasp: partly
  - What it is: Feature (33 rules): checkFeatureCrossingSpecialization, checkFeatureDataValueSpecialization, checkFeatureEndRedefinition, checkFeatureEndSpecialization, checkFeatureFeatureMembershipTypeFeaturing, checkFeatureFlowFeatureRedefinition, checkFeatureObjectSpecialization, checkFeatureOccurrenceSpecialization, checkFeatureOwnedCrossFeatureRedefinitionSpecialization, checkFeatureOwnedCrossFeatureSpecialization, checkFeatureOwnedCrossFeatureTypeFeaturing, checkFeatureParameterRedefinition, checkFeaturePortionSpecialization, checkFeatureResultRedefinition, checkFeatureSpecialization, checkFeatureSubobjectSpecialization, checkFeatureSuboccurrenceSpecialization, checkFeatureValuationSpecialization, validateFeatureChainingFeatureConformance, validateFeatureChainingFeatureNotOne, validateFeatureChainingFeaturesNotSelf, validateFeatureConstantIsVariable, validateFeatureCrossFeatureSpecialization, validateFeatureCrossFeatureType, validateFeatureEndIsConstant, validateFeatureEndMultiplicity (end features are 1..1), validateFeatureEndNoDirection, validateFeatureEndNotDerivedAbstractCompositeOrPortion, validateFeatureIsVariable, validateFeatureMultiplicityDomain, validateFeatureOwnedCrossSubsetting, validateFeatureOwnedReferenceSubsetting, validateFeaturePortionNotVariable (this last one has an empty message).
  - For Grasp: 33 checks on features, ends and chains; Grasp has only the end-multiplicity rule.
  - Sources: `SysMLValidationRule.java`, `2026.3.0.adoc`

#### Feature value, end membership and multiplicity rules

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Feature value, end membership and multiplicity rules** · model / Validation & model checks · SysON · useful · Grasp: partly
  - What it is: FeatureValue: checkFeatureValueBindingConnector, validateFeatureValueIsInitial (isInitial requires a variable feature). EndFeatureMembership: validateEndFeatureMembershipIsEnd. Multiplicity: checkMultiplicitySpecialization, checkMultiplicityTypeFeaturing. MultiplicityRange: checkMultiplicityRangeExpressionTypeFeaturing, validateMultiplicityRangeBoundResultTypes (bounds are Integer and non-negative), validateMultiplicityRangeBounds (bounds are the first owned members).
  - For Grasp: checks multiplicity bounds and feature values; Grasp has only the bound result types rule.
  - Sources: `SysMLValidationRule.java`

#### Type, specialization, subsetting and redefinition rules

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Type, specialization, subsetting and redefinition rules** · model / Validation & model checks · SysON · useful · Grasp: partly
  - What it is: Type: checkTypeSpecialization, validateTypeAtMostOneConjugator, validateTypeDifferencingTypesNotSelf, validateTypeIntersectingTypesNotSelf, validateTypeOwnedDifferencingNotOne, validateTypeOwnedIntersectingNotOne, validateTypeOwnedMultiplicity, validateTypeOwnedUnioningNotOne, validateTypeUnioningTypesNotSelf. Classifier: validateClassifierMultiplicityDomain. Specialization: validateSpecificationSpecificNotConjugated. Subsetting: validateSubsettingConstantConformance, validateSubsettingFeaturingTypes, validateSubsettingUniquenessConformance. Redefinition: validateRedefinitionDirectionConformance, validateRedefinitionEndConformance, validateRedefinitionFeaturingTypes. CrossSubsetting: validateCrossSubsettingCrossedFeature, validateCrossSubsettingCrossingFeature.
  - For Grasp: checks conjugation, subsetting and redefinition conformance; Grasp has only the redefinition direction rule.
  - Sources: `SysMLValidationRule.java`

#### Namespace, element, annotation and import rules

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Namespace, element, annotation and import rules** · model / Validation & model checks · SysON · useful · Grasp: partly
  - What it is: Namespace: validateNamespaceDistinguishibility (all memberships distinguishable). Element: validateElementIsImpliedIncluded. Annotation: validateAnnotationAnnotatedElementOwnership, validateAnnotationAnnotatingElement. Import: validateImportTopLevelVisibility (top-level imports must be private).
  - For Grasp: catches clashing names and misplaced imports; Grasp has the distinguishability rule, not the annotation or import ones.
  - Sources: `SysMLValidationRule.java`

### Undo, redo and change safety (4)

Undo and redo across the editor, deletion confirmation and impact previews.

#### Undo and redo of appearance edits

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **Undo and redo of appearance edits** · diagrams / Diagram: appearance & styling · Sirius Web · useful · Grasp: missing
  - What it is: Each appearance edit or reset made from the palette records an undo step on the diagram input that caused it. Undo restores each touched property's previous value if it was customized, or resets it if it was not; undoing a reset re-applies every property that was customized before. Redo replays the original changes. Recorders exist for rectangular, image and ellipse node styles, for node and edge labels, and for edges. SysON registers none for its package, imported-package, note and view-frame styles, so edits made in their Style part record no undo step (their Inside Label edits do). _(Sirius Web)_
  - For Grasp: appearance edits are undoable; Grasp has no appearance edits, and its undo covers model changes.
  - Sources: `NodeAppearanceChangeRecorder.java`, `RectangularNodeUndoAppearanceChangeRecorder.java`, `EdgeAppearanceChangeUndoRecorder.java`

#### Deletion confirmation dialog

**Grasp: missing** · parts: application, diagrams, views · note: Grasp no/partly

SysON features encompassed (4):

- **Deletion confirmation dialog** · application / App shell, navigation, theming & notifications · Sirius Web · useful · Grasp: missing
  - What it is: when confirmation dialogs are enabled, a deletion first asks "Are you sure?", explaining "This action will delete the selected element(s)." and "You won't be able to revert this.", with a Delete button. It applies to delete actions in the explorer (context menu 'Delete', tree palette delete, tree 'Delete' menu item), diagram tools flagged withDeletionConfirmationDialog, list and reference widget item removal in forms, and deletions in the form description editor. The docs list model deletion from the Explorer, representation deletion and 'Delete from model' in the palette. The dialog does not open when the selected node or edge cannot be deleted (Sirius Web 2026.1.0). It is on by default for every new project, and turning it off for one project leaves it on for the others. _(Sirius Web)_
  - For Grasp: asks before a deletion that cannot be reverted; Grasp deletes at once and relies on Undo.
  - Sources: `sirius-components-core.json`, `delete-dialog.spec.ts`, `CHANGELOG.adoc` v2026.1.0
- **Deletion confirmation dialog** · application / Collaboration, undo/redo & change safety · Sirius Web · useful · Grasp: missing
  - What it is: modal (testid confirmation-dialog) titled 'Are you sure?' with a 50px red warning icon and the centered message 'This action will delete the selected element(s).' / 'You won't be able to revert this.', a red contained 'Delete' button (confirmation-dialog-button-ok) and an outlined 'Cancel' button (confirmation-dialog-button-cancel) with initial focus; Escape or a backdrop click also cancels. It appears before the palette's 'Delete from model' tool (including via its DEL key binding), Explorer deletion of elements and models, representation deletion, SysON's delete-expression tools, and reference-widget chip delete / clear on containment references. Cancel keeps the element; Delete removes it. It isn't opened for non-deletable elements. It is the only preset of the generic confirmation dialog. _(Sirius Web)_
  - For Grasp: asks 'Are you sure?' before a deletion; Grasp deletes at once and relies on Undo.
  - Sources: `ConfirmationDialog.tsx`, `useConfirmationDialog.tsx`, `delete-dialog.spec.ts`
- **Deletion confirmation dialog with 'Disable this confirmation dialog'** · diagrams / Diagram: palette & tool UI · Sirius Web · useful · Grasp: missing
  - What it is: The confirmation shown by 'Delete from model' (from the palette, the Del key or the Explorer) is a modal (testid confirmation-dialog). It shows a large red warning icon above the title, a centered message, a red filled confirm button and an outlined 'Cancel' button, which has the initial focus. Closing or cancelling does nothing. When browser local storage is usable, the dialog also has a 'Disable this confirmation dialog' checkbox. Ticking it and confirming adds the current project's id to the 'sirius-confirmation-dialog-disabled' list in local storage. From then on, deletions in that project run at once without the dialog. Users restore it by clearing the application's data in the browser cache. _(Sirius Web)_
  - For Grasp: a confirm dialog before deleting from the model, which can be turned off; Grasp deletes at once and relies on undo.
  - Sources: `ConfirmationDialog.tsx`, `useConfirmationDialogSettings.tsx`, `manage-elements-diagram.adoc`
- **Delete with confirmation** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: partly
  - What it is: The "Delete" entry (trash icon; `semantic-delete` palette tool) appears only for deletable items and is disabled in read-only mode. It opens the shared deletion confirmation dialog, unless confirmations are disabled for the project. Only after confirmation does it call `deleteTreeItem` for the item whose menu was opened (not the rest of the selection) and close the menu. Success and error messages are toasted, with "An error has occurred while executing this action, please contact the server administrator" on transport failure. The confirmation dialog (warning icon) is titled "Are you sure?" with the message "This action will delete the selected element(s). You won't be able to revert this.", a red "Delete" button and "Cancel". When the project allows it, a "Disable this confirmation dialog" checkbox turns later confirmations off; the choice is stored in the browser and can be changed in the project settings ("Enable confirmation dialogs"). The choice is per project: localStorage key `sirius-confirmation-dialog-disabled` holds the list of project ids with confirmations off. New projects start with confirmations on, and turning them off in one project leaves the dialog in every other project. The SysON docs say the preference can be reset by clearing the site's browser data. The same dialog guards deleting a representation from the Explorer. _(Sirius Web)_
  - For Grasp: an "Are you sure?" dialog guards deletes, with a per-project opt-out; Grasp deletes at once and relies on Undo.
  - Sources: `DeleteMenuItem.tsx`, `ConfirmationDialog.tsx`, `sirius-components-core.json`

#### Impact analysis dialog

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Impact analysis dialog** · application / Collaboration, undo/redo & change safety · Sirius Web · useful · Grasp: missing
  - What it is: before a change flagged for impact analysis (diagram palette tool, Explorer menu entry/palette tool, library update/remove), a medium-width dialog (impact-analysis-dialog) titled 'You are about to <tool label>' with a primary-colored icon shows a spinner until the report arrives, then 'The <label> tool will have the following effects on your model:', bullets 'Elements added: N', 'Elements deleted: N', 'Elements modified: N' (each only when N > 0), any additional report lines, the impact tree in a bordered 300px scrolling box, and 'Are you sure you want to proceed?'. The single 'Execute' button (autofocused, disabled while loading) applies the change; closing the dialog cancels. The title icon is a 32px outlined error/warning icon in the primary color. The tree box is omitted when the report has no tree nodes. Tree items start collapsed, expand with chevron icons, show each node's icon overlays and styled label, and can't be selected or edited. Escape or a backdrop click cancels. 'Execute' closes the dialog at once and then runs the change, whose result appears as the usual toasts. There is no Cancel button. _(Sirius Web)_
  - For Grasp: shows what a change will add, delete and modify before it runs; Grasp has no preview of a change.
  - Sources: `ImpactAnalysisDialog.tsx`, `ImpactAnalysisDialogContext.tsx`, `sirius-components-core.json`

#### Diagram-state undo/redo

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Diagram-state undo/redo** · application / Collaboration, undo/redo & change safety · Sirius Web · useful · Grasp: partly
  - What it is: undo/redo also reverts diagram-only state: collapse/expand, hide/show, fade, pin, node, edge and label layout, node appearance (rectangular, image, ellipse), label appearance, edge appearance, reset of view modifiers, and created or deleted views. Undoing a delete from the diagram re-creates the view with its previous position, labels, appearance and pinned/faded/hidden state. _(Sirius Web)_
  - For Grasp: undo also reverses hiding, folding, appearance and removal from a diagram; Grasp undoes folds and view changes but has no hiding or appearance.
  - Sources: `DeleteFromDiagramChangeRecorder.java`, `ViewRequestChangeRecorder.java`, `DiagramLayoutChangeRecorder.java`

## Text

### Textual SysML import (12)

Bringing SysML v2 text into the model: file upload, inserting text, name resolution and error reporting.

#### New objects from text (Insert SysML v2 text dialog)

**Grasp: missing** · parts: model, views

SysON features encompassed (3):

- **New objects from text** · views / Explorer view (model tree) · SysON · useful · Grasp: missing
  - What it is: The "New objects from text" entry (id `newObjectsFromText`) is defined in the backend (since 2025.10.0). The palette provider adds it to every editable model object, so it is never offered on library or other read-only elements. It does not call `ISysONExplorerServiceDelegate.canCreateNewObjectsFromText(Object)`, whose default accepts only non-read-only SysML Elements, so in v2026.11.0 that delegate hook has no effect on the menu. Editable non-SysML objects in a mixed project also get the entry, since SysON treats them as editable. It is rendered by SysON's Insert textual SysML component: in the palette it is filtered and highlighted by search, and invoking it closes the palette and opens the insert dialog. The entry shows a "+" icon, the dialog is titled "Enter or paste SysMLv2 text to create new objects in the model". It is a medium-width dialog with an autofocused outlined text area fixed at 35 rows. "Create Objects" (publish icon, replaced by a spinner while running) is disabled while the text is empty, while the request runs and after a success. After a success the text area is also locked, so a second batch needs the dialog reopened. A report of the parser messages appears under the text, and invalid text leaves the dialog open with its errors toasted. "Close" (`new-object-from-text-close`) dismisses it, and when the dialog closes the item is expanded so the new objects show under it. It is not offered on a document (model) item. Text typed in the dialog stays in its text area: characters such as "s" (as in `state def InitialState`) no longer move the focus to menu items (2026.1.0 fix). The text can import standard library elements (e.g. `import ScalarValues::*; attribute myAttribute : String;` gives a FeatureTyping to String).
  - For Grasp: paste SysML text to create elements under an element, with a parse report; Grasp can't read textual SysML.
  - Sources: `SysONExplorerTreeItemContextMenuEntryProvider.java`, `InsertTextualSysMLv2ExplorerToolOverriddenContribution.tsx`, `InsertTextualSysMLv2Modal.tsx`
- **'New objects from text' entry** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: missing
  - What it is: Explorer item context menu (right-click, or the item's options 'more' menu) entry 'New objects from text' with an add (+) icon, which inserts typed or pasted SysML v2 text as new objects under the selected element. The backend offers it (palette tool id 'newObjectsFromText', label 'New objects from text'; the frontend menu item's test id is insert-textual-sysmlv2-menu) only on editable SysML semantic elements, alongside New object, New representation, Create Expression and Duplicate object (on a root namespace or package the menu holds exactly New object, New representation, New objects from text, Expand all and Duplicate object); never on documents, on non-SysML elements or on null. The frontend hides it outside the explorer tree (tree id must start with 'explorer://') and on read-only items, which removes it for libraries and in read-only mode. It is also searchable (fuzzy match) in the explorer tree palette: before v2026.9.0 it disappeared when the palette was filtered by a search, and since v2026.9.0 the matched part of its label is highlighted like the Create/Edit/Delete Expression tools. The entry was moved from a frontend-only menu item to a backend-defined one in v2025.10.0, which also fixed it being offered on every semantic element. The Flashlight tutorial uses it to paste nested requirements, parts, actions, doc comments, in/out items, ports and attributes typed with library types. Introduced in v2024.9.0, restricted to non-library elements later.
  - For Grasp: paste SysML v2 text to add elements under a chosen element; Grasp can't read text into its model.
  - Sources: `InsertTextualSysMLv2MenuContribution.tsx`, `SysONExplorerTreeItemContextMenuEntryProvider.java`, `InsertTextualSysMLv2ExplorerToolOverriddenContribution.tsx`
- **Insert SysML v2 text dialog** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: missing
  - What it is: modal (medium max width, full width) titled 'Enter or paste SysMLv2 text to create new objects in the model', with an auto-focused outlined multiline text area fixed at 35 rows, a contained 'Create Objects' button (Publish/upload icon; originally labeled 'Insert') and a contained 'Close' button. The text area shows 35 rows and scrolls beyond that. Key presses inside the dialog are stopped so they don't reach the workbench shortcuts. Besides 'Close', the dialog's standard close (click outside, Escape) also closes it and triggers the same expand-target behavior.
  - For Grasp: a large text box for typing or pasting SysML to create objects; Grasp has no text input.
  - Sources: `InsertTextualSysMLv2Modal.tsx`, `import-export-textual.adoc`, `2024.9.0.adoc`

#### Names in inserted text resolve against the existing model

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Names in inserted text resolve against the existing model** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: missing
  - What it is: names are resolved in the context of the target parent and its imports (e.g. Real via ScalarValues). For example 'flow action1.item1Out to action2.item1In;' inserted into ActionDefinition1 links the new flow's ends to the existing features; successions and flows can reference existing actions and items. Imports in the text go into ownedRelationships; unresolved names still add the element but return 'Unable to resolve name ...'. E.g. 'import ScalarValues::*; attribute myAttribute : String;' on the root namespace creates myAttribute with a FeatureTyping child, and the Details view's 'Typed by' then shows String; 'attribute myAttribute' alone appears in the Explorer after closing.
  - For Grasp: pasted text can type and connect to elements already in the model; Grasp has no text import.
  - Sources: `2025.6.0.adoc`, `ASTTransformer.java`, `MutationInsertTextualSysMLv2DataFetcherTests.java`

#### Partial import on syntax errors

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Partial import on syntax errors** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: missing
  - What it is: for uploads only (not inserted text or expressions), the file is parsed a second time with 'dump --validate --stdlib none' (colors disabled, stderr captured to a temp file). Only the first diagnostic, the line after the parser's 'There are validation errors:' header, is interpreted: if it is a syntax error ('line N: Expecting...' or 'unexpected character: ->'), the report gets the warning 'The file contains a syntax error. The elements that follow it may be missing from the imported model.' plus the verbatim parser report, capped at 64 KB with '[Report shortened]'. The parsed elements are still imported (unparsed tails don't block the import, and the report locates the error), later unresolved-name diagnostics are deliberately ignored, and valid files raise no warning. Validation never blocks the import.
  - For Grasp: a file with a syntax error still imports up to it, and the report locates the error; Grasp has no text import.
  - Sources: `SysmlToAst.java`, `SysmlToAstTest.java`, `2026.11.0.adoc`

#### Unresolvable reference warning and unset

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Unresolvable reference warning and unset** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: missing
  - What it is: each reference still unresolved after all resolution phases yields 'Unable to resolve name '<name>' for reference '<ref>' on element '[EClass] qualified::name'', and the dangling reference is removed (unset, or dropped from the list), so no proxies remain.
  - For Grasp: an import with unknown names still succeeds and names each one dropped; Grasp has no text import.
  - Sources: `AstTreeParser.java`, `LogNameProvider.java`

#### Import dependencies first

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Import dependencies first** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: missing
  - What it is: each uploaded file resolves names only against content already in the project, so all its dependencies (other SysML/KerML files, third-party libraries) must be imported first, recursively; otherwise some relationships stay unresolved.
  - For Grasp: files resolve names only against what's already loaded, so order matters; Grasp has no text import.
  - Sources: `import-export-textual.adoc`, `import_sysml_file_recipe.adoc`

#### Name resolution with the specification's local namespaces

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Name resolution with the specification's local namespaces** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: missing
  - What it is: each reference is resolved, through the SysML Namespace.resolve operation, from the local namespace the specification (8.2.3.5.2) assigns to its owner: an Import's owning namespace; for a Membership, its owning namespace, or for a FeatureReferenceExpression the nearest enclosing non-invocation namespace, or for a FeatureChainExpression the result of its argument; for a Redefinition, the supertypes of the redefining feature's owning type (not the type itself) and then its outer namespace; for a ReferenceSubsetting of a connector end, the connector's owning namespace; for a FeatureTyping of an InvocationExpression, the non-invocation namespace; otherwise the owning type's owning namespace; for a Conjugation, the owning type's namespace; for later segments of a feature chain, the previous chaining feature. The first namespace that resolves wins.
  - For Grasp: names in text resolve as the specification says, so imported models link up correctly; Grasp has no text import.
  - Sources: `DeresolvingNamespaceProvider.java`, `ProxyResolver.java`

#### Textual import coverage

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Textual import coverage** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: missing
  - What it is: the importer handles, per changelog and tests: AcceptActionUsage and MetadataUsage; TextualRepresentation; TransitionUsage guards, accept triggers, send effects and implicit sources; SuccessionAsUsage declaring a new target action after 'then'; typings and references to conjugated ports; MultiplicityRange bounds (literals or feature references) and LiteralRational values; isAbstract, isDerived, isEnd and isReadOnly; the redefinedFeature of unnamed Redefinitions and unnamed, inherited or implicitly redefined features in chains; FeatureChainingExpressions with implicit parameter redefinitions; SendActionUsage payloads in transitions; annotations on relationships; assume/require constraint kinds; escaped and double-quoted strings; and snippets referencing unknown units. Transformer unit tests also cover aliases, allocation containment, assignments (`assign count := 1;`, initial `:=` and `default :=` values, and `assign a.counter.count := a.counter.count + 1;`), booleans, documentation, feature typing, imports and namespace imports, inheritance, subclassification, redefinitions, visibility, isNonunique, the root namespace, empty strings, and empty, empty-array or null ASTs; integration tests also cover BindingConnectorAsUsage with feature chains and metadata annotating an ExposeMembership.
  - For Grasp: the breadth of SysML text SysON can read back in; Grasp reads none.
  - Sources: `CHANGELOG.adoc`, `ImportSysMLModelTest.java`, `ASTTransformerTest.java`

#### Graphical views from imported textual models

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Graphical views from imported textual models** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: missing
  - What it is: graphical views can be rendered from an imported SysML v2 textual model as long as it is structurally valid and complete.
  - For Grasp: diagrams can be drawn from an imported text model; Grasp can't import text.
  - Sources: `faq.adoc`

#### Upload format detection and sanitization

**Grasp: missing** · parts: platform

SysON feature encompassed (1):

- **Upload format detection and sanitization** · platform / Versioning, migration & data management · Sirius Web · useful · Grasp: missing
  - What it is: an uploaded file is read fully, then the first loader that recognizes it is used: a first line starting with `<?xml` is loaded as XMI, a first line starting with `{` as EMF JSON (with migration participants applied), and otherwise a name ending in `.sysml` or `.kerml` (case-insensitive) is parsed as SysML/KerML text by SysIDE and marked as imported. Anything else fails with the unexpected-error message. The loaded content is copied into a JSON resource, every element gets a fresh random id (the old-to-new id map is kept for the import), and the result is re-saved as UTF-8 EMF JSON before becoming a new document with the chosen read-only flag. A document still holding unresolvable proxies is refused ("The resource <name> contains unresolvable proxies and will not be uploaded" in the log). The import report shown in the dialog joins the loader's messages (for text, the parser and AST-transformation messages, such as "[ERR] Reference of X not found for Y"). Successful uploads are logged ("Document <id> uploaded"). _(Sirius Web)_
  - For Grasp: text files parsed on upload with a report of what did not resolve, such as "[ERR] Reference of X not found"; Grasp parses no SysML text.
  - Sources: `DocumentSanitizedJsonContentProvider.java`, `XMIExternalResourceLoaderService.java`, `SysMLExternalResourceLoaderService.java`

#### Upload model button and dialog

**Grasp: partly** · parts: model, views

SysON features encompassed (2):

- **Upload model button and dialog** · views / Explorer view (model tree) · Sirius Web · useful · Grasp: partly
  - What it is: A toolbar button (`upload-document-icon`) opens the "Upload new model" dialog, which uploads an external model file and adds it to the project as a new model. The dialog has a file picker (`input name=file`) and a split button (`upload-document-split-button`) that switches between "Upload" and "Upload (read-only)". It calls `uploadDocument(editingContextId, file, readOnly)`, which returns the new document plus an optional textual import report shown in the dialog. "Close" returns to the workbench. A failed transfer shows "An unexpected error has occurred, the file uploaded may be too large", because a 413 status may be hidden by CORS. The toolbar button is an upload (Publish) icon titled "Upload model", disabled when read-only. The file picker is a clickable area reading "Click here to select a file" that then shows the chosen file's name (one file only). The split button defaults to "Upload" (read-write) and is disabled until a file is chosen, while uploading, and after a document has been uploaded; "Close" turns into the primary (filled) button once the upload is done. Read-only uploaded models cannot be renamed or modified but can still be deleted. Plain Sirius Web accepts XMI and JSON files, and only JSON produced by its own Download can be re-uploaded. The docs say the uploaded model is created and opened automatically. _(Sirius Web)_
  - For Grasp: brings an external model file into the project, optionally read-only; Grasp imports only its own saved JSON state, not model files.
  - Sources: `UploadDocumentModal.tsx`, `FileUpload.tsx`, `model-management.adoc`
- **Upload model toolbar button** · model / Textual SysML v2: import, export & insert · Sirius Web · useful · Grasp: partly
  - What it is: an upload (Publish, upward arrow) icon button titled 'Upload model' (docs: 'Upload', opening the 'Upload Model' modal) in the Explorer toolbar opens the upload dialog; disabled in read-only mode. The dialog closes when the user clicks Close after the upload. SysON's docs say the uploaded model is created and opened automatically. _(Sirius Web)_
  - For Grasp: one button to bring a model file in; Grasp's Import state takes only its own JSON, not .sysml.
  - Sources: `UploadDocumentModalContribution.tsx`, `sirius-web-application.json`, `model-management.adoc`

#### Switching between graphical and textual

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Switching between graphical and textual** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: partly
  - What it is: users can move between graphical and textual representations of a model; a textual import/export add-on provides the textual side.
  - For Grasp: move between diagram and text; Grasp shows the text but can't take it back.
  - Sources: `interoperability.adoc`

#### Partial textual editing

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Partial textual editing** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: partly
  - What it is: SysON imports and exports SysML v2 textual notation, and some model information can be edited directly as text (direct edit); integration with the open-source SysIDE textual editor is in progress.
  - For Grasp: some model data is edited as text in labels; Grasp has label editing but no text editor.
  - Sources: `faq.adoc`

### Textual SysML export and interoperability (9)

Writing the model as SysML v2 text, its coverage and formatting, and exchanging models with other tools.

#### Shortest resolvable qualified name (deresolver)

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Shortest resolvable qualified name (deresolver)** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: partly
  - What it is: a reference is written as the shortest name that resolves to it in context, given owned members, imports (root, intermediate, recursive, private), nested packages and name collisions: the declared short name first, then the declared name, then a path relative to the nearest visible ancestor membership, walking outward; on a name conflict the full qualified name is used. Results are cached per namespace and membership lists over 100 are searched in parallel. Privately imported elements resolve correctly.
  - For Grasp: exported references read as short as they can while still resolving; Grasp writes plain names within its one package, qualified only where needed for notes.
  - Sources: `FileNameDeresolver.java`, `FileNameDeresolverTest.java`, `CHANGELOG.adoc`

#### Namespaces, packages and libraries

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Namespaces, packages and libraries** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: partly
  - What it is: an unnamed root namespace is not written, only its content; a plain Namespace prints 'namespace'; packages print 'package <short> name', library packages 'library package' (v2025.1.0; 'standard ' first for standard libraries). Children go in an indented ' { ... }' block or ';' when empty. Package bodies only include memberships and imports and skip MetadataUsage members.
  - For Grasp: packages and library packages export with their bodies; Grasp writes its one package, no nested or library packages.
  - Sources: `SysMLElementSerializer.java`, `2025.1.0.adoc`

#### Usage prefixes and when 'ref' is written

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Usage prefixes and when 'ref' is written** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: partly
  - What it is: order is direction (omitted when default: in for parameters, out for return), abstract, variation, constant (omitted for an implicitly constant end), derived, end, then 'ref'. 'ref' is written only when needed: never for attributes, reference usages, event occurrences, connectors, directed or end features, actors, or features not owned by a type.
  - For Grasp: direction and other prefixes written only when needed; Grasp writes direction and abstract, not constant, derived, end or ref.
  - Sources: `SysMLElementSerializer.java`, `SysMLElementSerializerTest.java`

#### Values and literals

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Values and literals** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: partly
  - What it is: feature values print '= v', ':= v' (initial) or 'default = v'. Reals always carry a decimal ('.0' added) and are not rounded (v2026.1.0); export normalizes them ('.5' becomes '0.5', '1E+3' becomes '1000.0'). Infinity is '*', null is 'null', booleans print true/false. LiteralString values are always double-quoted (users no longer type the quotes; v2025.4.0), an empty value exports without error, and backslash and quote are escaped in text-compliant mode (v2026.3.0).
  - For Grasp: feature values and literals export faithfully; Grasp writes shape dimensions only, no general values.
  - Sources: `SysMLElementSerializer.java`, `2025.4.0.adoc`, `2025.12.0.adoc`

#### Comments, documentation and textual representations

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Comments, documentation and textual representations** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: partly
  - What it is: a comment describing its own owning namespace (no locale, no name) prints '/* body */'; others print 'comment <short> name about A,B locale "x"' then the body on an indented line. Documentation prints 'doc <name> /* body */', its body written only when it has no locale and describes its owning namespace. A TextualRepresentation prints `language "naturalLanguage" /* ... */`, or `rep l2 language "naturalLanguage2" /* ... */` when named (v2025.4.0).
  - For Grasp: comments, docs and reps export with their bodies; Grasp writes doc and rep but has no comments with about or locale.
  - Sources: `SysMLElementSerializer.java`, `2025.4.0.adoc`

#### Imports and exposes

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Imports and exposes** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: partly
  - What it is: imports print '[private|protected] import [all] QN::*' (namespace) or '... import QN' (membership), with '::**' appended when recursive ('QN::*::**'); the QN is relative to the common ancestor. Exposes print 'expose QN::*' when isImportAll is set (the creation default), 'expose QN::**' when recursive without importAll, and 'expose QN' for membership exposes. Both end with ';' or an indented '{ ... }' body of their owned relationships.
  - For Grasp: imports and exposes export in every form; Grasp writes its own imports and namespace or per-element exposes, not user imports.
  - Sources: `SysMLElementSerializer.java`

#### Action nodes

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Action nodes** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: partly
  - What it is: '[action name] accept payload via receiver' (e.g. `action a1 accept s1 : S1 via p1;`, `accept S3 via p3;`; v2025.6.0), '[action name] send x via y to z', '[decl] assign target.feature := value', 'perform name' or 'perform action <decl>', and 'action <decl>' for plain actions.
  - For Grasp: accept, send, assign and perform export; Grasp writes send and accept, lacks assign and perform.
  - Sources: `SysMLElementSerializer.java`, `2025.6.0.adoc`

#### Textual export coverage

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Textual export coverage** · model / Textual SysML v2: import, export & insert · SysON · useful · Grasp: partly
  - What it is: the exporter handles, among others: StateUsage, StateDefinition, TransitionUsage (in actions and decision transitions), ExhibitStateUsage, AllocationUsage/AllocationDefinition, ForkNode, JoinNode, MergeNode, DecisionNode, AcceptActionUsage, TriggerInvocationExpression, ViewUsage, FlowUsage, TextualRepresentation, RequirementConstraintMembership, SatisfyRequirementUsage, ConnectionUsage, named SuccessionAsUsage, OperatorExpressions (as in semantic MetadataDefinitions) and unary operators; LibraryPackage as 'library package' and InterfaceUsage with 'interface'.
  - For Grasp: SysON exports most SysML kinds; Grasp exports all it holds, which is far fewer kinds.
  - Sources: `CHANGELOG.adoc`, `2025.12.0.adoc`, `2026.11.0.adoc`

#### Interoperability support matrix (project/model exchange)

**Grasp: partly** · parts: platform

SysON feature encompassed (1):

- **Interoperability support matrix (project/model exchange)** · platform / APIs & integrations · SysON · useful · Grasp: partly
  - What it is: projects and models can be exchanged with other tools through the Explorer and project download/upload actions and the API. The key features list these levels: - Download/Upload JSON: supported, in SysON's own format only. - SysML v2 textual format: partial. - Standard SysML v2 JSON: not supported, for import or export. - SysML v2 Standard API: partial.
  - For Grasp: tells a modeller which formats go in and out; Grasp exports SysML v2 text and its own JSON state but cannot read SysML text in.
  - Sources: `key-features.adoc`, `interoperability.adoc`, `collaboration.adoc`

## Libraries (20)

Standard KerML and SysML libraries, published user libraries, importing them, and their read-only rules.

### Libraries picker at creation

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Libraries picker at creation** · application / Homepage, project browser & project lifecycle · Sirius Web · useful · Grasp: missing
  - What it is: A collapsible 'Libraries (Optional)' section (header test id `libraries-selection-toggle`; closed by default, shown only with the Library list capability; 'Search for and select libraries that will be available in your project as references') lets the user pick published libraries to import; the dependencies are added after the project is created. It holds a table (test id `libraries-import-table`, rows `library-{namespace}:{name}:{version}`) with a selection checkbox per row and the columns 'Name', 'Version', 'Created On' (YYYY-MM-DD), 'Namespace' (dimmed) and 'Description'. It pages 20 libraries at a time with the standard table paginator (server-side paging); sorting, column menus, filters, density, full screen and column hiding are off, but the table's default global search box is left on, so it only filters the rows of the current page. Selection is kept by library id across pages, and the header checkbox selects the rows of the page. The collapsed section keeps its table mounted, so the first page of libraries is already fetched when the page opens. Changing the template resets the selection to that template's required libraries. _(Sirius Web)_
  - For Grasp: choose published libraries when creating a project; Grasp has no libraries.
  - Sources: `NewProjectView.tsx`, `LibrariesImportTable.tsx`, `CHANGELOG.adoc`

### Command 'Import published library'

**Grasp: missing** · parts: application, model

SysON features encompassed (2):

- **Omnibox command: Import published library** · application / Omnibox, commands & keyboard shortcuts · SysON · useful · Grasp: missing
  - What it is: the command id 'importPublishedLibrary', label 'Import published library', icon /images/omnibox/import.svg, description 'Imports one of the published libraries.' It is always listed, whatever the project content. SysON's frontend extension registry renders it with Sirius Web's ImportLibraryCommand component: clicking the row opens the 'Import libraries' dialog, which drives the library import, and closing the dialog closes the omnibox. Per the docs, libraries are imported by reference (a read-only dependency) or by copy (editable contents with no link to the original). An already imported library (same namespace, name and version) is not imported twice. Dependencies are reloaded, which can bring back manually removed libraries in the Explorer, and a success notification appears at the bottom right.
  - For Grasp: bring a published library into the project by reference or by copy; Grasp has no libraries.
  - Sources: `SysONOmniboxCommandProvider.java`, `ImportLibraryCommand.tsx`, `library-import.adoc`
- **Omnibox command 'Import published library'** · model / Libraries, standard library & publication · SysON · useful · Grasp: missing
  - What it is: always listed in a project's omnibox (Ctrl/Cmd+K) (id importPublishedLibrary, icon `/images/omnibox/import.svg`, description 'Imports one of the published libraries.'); it opens the 'Import libraries' dialog for the current project. It is offered even in projects without SysML content and is found by typing any part of its label (case-insensitive substring match).
  - For Grasp: bring a published library into the model from the command palette; Grasp has no libraries.
  - Sources: `SysONOmniboxCommandProvider.java`, `SysONExtensionRegistry.tsx`, `ImportLibraryCommand.tsx`

### Libraries page (published library browser)

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Libraries page (published library browser)** · model / Libraries, standard library & publication · Sirius Web · useful · Grasp: missing
  - What it is: `/libraries` shows the navigation bar, a 'Libraries' heading over a table of every library published on the server (including ones just published from a project) in a centered column, and the footer. Viewers without libraries.canList are redirected to `/errors/404`. _(Sirius Web)_
  - For Grasp: one page lists every library a modeller can reuse; Grasp has no libraries.
  - Sources: `LibraryBrowserView.tsx`, `concepts.adoc`, `publication.adoc`

### Open a library as a read-only project

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Open a library as a read-only project** · model / Libraries, standard library & publication · Sirius Web · useful · Grasp: missing
  - What it is: clicking a library name opens `/libraries/:namespace/:name/:version` (segments URL-decoded before lookup), which shows the full workbench (Explorer in the left panel, Details in the right panel, representations) in read-only mode on the library's editing context, under a navbar titled '<namespace> - <name> @<version>'. While loading only the navigation bar is shown; once loaded the workbench opens with an empty selection and the initial workbench configuration computed for the library's editing context. Representations (diagrams, tables) of the library can be opened; doing so rewrites the URL to `/libraries/{namespace}/{name}/{version}/edit/{representationId}`. An unknown namespace, name or version redirects to `/errors/404`. The library navbar holds only that centered title (no project actions menu, so no Share/Rename/Download/Settings/Delete entries), and the undo/redo shortcut handler isn't mounted on library pages; a representation's own toolbar Share link points to the `/libraries/.../edit/{representationId}` URL. The library page also has no omnibox (so no publish/import commands) and doesn't sync the selection with the URL's `selection` parameter, unlike the project editor; the Workbench gets a hard-coded readOnly flag. _(Sirius Web)_
  - For Grasp: browse a library's model and diagrams without changing it; Grasp has no libraries.
  - Sources: `DisplayLibraryView.tsx`, `DisplayLibraryNavbar.tsx`, `useLibrary.tsx`

### Omnibox command 'Publish SysML project contents as library'

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Omnibox command 'Publish SysML project contents as library'** · model / Libraries, standard library & publication · SysON · useful · Grasp: missing
  - What it is: in a project's omnibox (command palette, Ctrl/Cmd+K), the command (id publishProjectSysMLContentsAsLibrary, icon `/images/omnibox/publish.svg`, description 'Publishes the SysML contents of the project as a library that can be referenced by other projects.') is listed only when the PredicateCanEditingContextPublishSysMLProject predicate allows it, i.e. the project's semantic data uses the SysML domain (documents with SysML elements as root contents). Selecting it opens the publish dialog with publication kind Project_SysML_AllProperContents. Publishing is how dependencies between projects are defined (Sirius Web leaves the command to each studio maker; SysON ships this one). Like every workbench omnibox command, it is found by typing any part of its label (case-insensitive substring match, e.g. 'library' lists both the publish and import commands). The provider ignores the current selection.
  - For Grasp: turn a model into a reusable library from the command palette; Grasp has no libraries or command palette.
  - Sources: `PublishProjectSysMLContentsAsLibraryCommand.tsx`, `SysONOmniboxCommandProvider.java`, `PredicateCanEditingContextPublishSysMLProject.java`

### Import libraries dialog

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Import libraries dialog** · model / Libraries, standard library & publication · Sirius Web · useful · Grasp: missing
  - What it is: large (lg), full-width, paper-scrolling dialog titled 'Import libraries' with a paginated table of published libraries (20 per page; columns Name, Version, Created On, Namespace, Description; no sorting or filtering; none preselected) with row checkboxes for multi-selection. The footer reads 'Apply to N libraries:' next to a split button: the main half runs the chosen action, the drop-down arrow picks 'Import' (by reference, default) or 'Copy'. It calls `importLibraries` with the editing context, action id ('import' or 'copy') and selected library ids; the button shows a loading state, server messages appear as toasts, and the dialog closes when the server responds. With no actions the footer reads 'No import action found for the selected libraries' and the button is disabled ('No Action' if the selected index is out of range); network errors show 'An unexpected error has occurred, please refresh the page'. The action button is not disabled when no library is checked: clicking it then still returns "Libraries imported" without changing anything. Checked rows are remembered by library id while paging through the table. Unknown library ids are ignored, and a library that is already a dependency is skipped with the server log warning 'Cannot add a dependency to library <ns>:<name>:<version> since the dependency already exists'. The split-button menu closes on a click outside it and marks the current choice; the choice resets to 'Import' each time the dialog opens. There is no Cancel button: Escape or a backdrop click closes the dialog. _(Sirius Web)_
  - For Grasp: pick libraries and import them by reference or copy; Grasp has no libraries.
  - Sources: `ImportLibraryDialog.tsx`, `LibrariesImportTable.tsx`, `useImportLibraries.ts`

### Import by reference (read-only)

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Import by reference (read-only)** · model / Libraries, standard library & publication · Sirius Web · useful · Grasp: missing
  - What it is: `importLibraries(type "import")` adds the chosen libraries as project dependencies (skipping any already present) and loads them and their recursive dependencies read-only, replying "Libraries imported". The library itself is unchanged and its content is never saved into the project; the validation view shows the same number of rules after import. Referenced libraries can later be updated to another version. Since v2025.12.0, libraries made solely of LibraryPackages appear under Explorer > Libraries > User libraries, and other referenced libraries appear at the Explorer root with a '<library-name>@<library-version>' suffix (in v2025.4.0, documents whose root was a LibraryPackage went under 'User libraries'). _(Sirius Web)_
  - For Grasp: reuse a library read-only and update it later; Grasp has no libraries.
  - Sources: `ReferenceLibraryImportHandler.java`, `SysONLibraryImportByReferenceTests.java`, `library-import.adoc`

### Import by copy (editable)

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Import by copy (editable)** · model / Libraries, standard library & publication · Sirius Web · useful · Grasp: missing
  - What it is: `importLibraries(type "copy")` copies the documents of the chosen libraries and all their recursive dependencies into the project as ordinary editable models (loaded with the library documents' own ids, not flagged read-only, without library metadata, with migration participants applied when they apply to the project), with no link to the original library (library metadata, semantic data and project dependencies unchanged), so they can't be resynchronized or updated when the library gets a new version; replies "Libraries imported". _(Sirius Web)_
  - For Grasp: copy a library in to edit it freely; Grasp has no libraries.
  - Sources: `CopyLibraryImportHandler.java`, `SysONLibraryImportByCopyTests.java`, `library-import.adoc`

### Libraries directory in the Explorer

**Grasp: missing** · parts: model, views

SysON features encompassed (2):

- **Libraries directory** · views / Explorer view (model tree) · SysON · useful · Grasp: missing
  - What it is: The "Libraries" root directory (icon `icons/LibraryResource.svg`) contains a "KerML" directory and a "SysML" directory for the standard libraries, each shown as "KerML [read-only]" / "SysML [read-only]" and listing the standard library models (e.g. "Base" under KerML, holding a LibraryPackage "Base"), and a "User libraries" directory. A child is omitted when its Hide filter is active, and "User libraries" is omitted when empty. "Libraries" itself appears only when it would have children under the active filters. Standard library resources are recognized by their URI scheme (KerML or SysML library scheme) and listed in resource-set order, while user-library models are sorted by resource URI. The directories have fixed name-based UUID ids (e.g. from "SysON_Libraries_Directory"), so their expanded state survives refreshes. The four directories have the fragment class name as their kind. They can be selected but never renamed, deleted or expanded with Expand all, and their menu is empty. This layout replaced the short-lived 2025.1.0 "Standard Libraries" / "Referenced Libraries" folders.
  - For Grasp: standard KerML and SysML libraries browsable in the tree for reuse; Grasp loads no libraries.
  - Sources: `LibrariesDirectory.java`, `KerMLStandardLibraryDirectory.java`, `SysMLStandardLibraryDirectory.java`
- **Libraries directory** · model / Libraries, standard library & publication · SysON · useful · Grasp: missing
  - What it is: a virtual 'Libraries' folder, the last root item of the Explorer, groups library resources; its children are, in order, 'KerML', 'SysML' and 'User libraries'. Each sub-directory is omitted when its hide filter is active ('Hide KerML Standard Libraries' / 'Hide SysML Standard Libraries' / 'Hide User Libraries'), 'User libraries' is added only when it contains at least one resource, and the folder reports no children when both standard-library filters are on and user libraries are hidden or absent. It and its three sub-directories use the LibraryResource icon, are selectable, and can't be renamed or deleted. (The 2025.01 pitch named the sub-directories 'Standard Libraries' and 'Referenced Libraries'.)
  - For Grasp: the standard and user libraries sit in one Explorer folder, browsable like the model; Grasp has no libraries.
  - Sources: `LibrariesDirectory.java`, `SysONDefaultExplorerServices.java`, `improve_support_for_libraries_in_the_explorer.adoc`

### Explorer library filters

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Explorer library filters** · model / Libraries, standard library & publication · SysON · useful · Grasp: missing
  - What it is: the SysON Explorer's filter list offers 'Hide KerML Standard Libraries', 'Hide SysML Standard Libraries' and 'Hide User Libraries', all off by default (unlike 'Hide Memberships', 'Hide Root Namespaces' and similar filters, which start on). 'Hide User Libraries' removes from the tree every imported resource made only of LibraryPackages, as well as the 'User libraries' directory. The filters combine freely: since v2025.1.0, elements can be expanded with 'Hide Root Namespaces' off while a 'Hide KerML/SysML Standard Libraries' filter is on (this combination used to raise a getChildren error).
  - For Grasp: hide KerML, SysML or user libraries from the tree; Grasp's browser has no libraries to hide.
  - Sources: `SysONTreeFilterProvider.java`, `HideUserLibrariesTreeAlteredContentProvider.java`, `SysONExplorerFilterService.java`

### 'Search in libraries' switch

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **'Search in libraries' switch** · model / Libraries, standard library & publication · Sirius Web · useful · Grasp: missing
  - What it is: the Search view's query panel has a 'Search in libraries' switch (search-in-libraries-toggle), off by default; while it is off, resources carrying library metadata (content of imported published libraries) are skipped by the search. It sits with the 'Search in attributes', 'Match Case', 'Match Whole Word' and 'Use Regular Expression' options. SysON's own search service also skips the KerML/SysML standard-library resources while the switch is off, and searches them (plus imported libraries) when it is on; it matches resources and every element inside them, up to 1,000,000 results. _(Sirius Web)_
  - For Grasp: search can include or skip library content; Grasp has no search or libraries.
  - Sources: `SearchQueryInput.tsx`, `SysONSearchService.java`, `DefaultSearchService.java`

### Standard-library type resolution with automatic import

**Grasp: missing** · parts: model, sysml-views

SysON features encompassed (2):

- **Standard-library type resolution with automatic import** · sysml-views / Direct edit & label syntax · SysON · useful · Grasp: missing
  - What it is: a library type or feature name resolves in the standard libraries, and the needed import is added automatically. 'actualSpeed : SpeedUnit' adds an import of ISQSpaceTime; 'actualweight :> mass' uses 'mass' auto-imported from ISQBase. 'part : ISQBase::MassValue', the aliased 'ISQ::MassValue' and bare 'MassValue' resolve to ISQBase::MassValue, add 'import ISQBase::*' and create no definition. 'mass :> ISQ::mass' and 'fov:Real' are accepted.
  - For Grasp: library types such as MassValue resolve and their import is added; Grasp has no libraries.
  - Sources: `batmobile.adoc`, `flashlight.adoc`, `directEditTests.cy.ts`
- **Automatic namespace imports when using library elements** · model / Libraries, standard library & publication · SysON · useful · Grasp: missing
  - What it is: when direct edit (e.g. 'part : ISQBase::MassValue', the aliased 'part : ISQ::MassValue' or the unqualified 'part : MassValue'), a Details reference widget, or a tool sets a reference to an element that isn't already visible, SysON adds a NamespaceImport of that element's owning namespace (e.g. 'import ISQBase::*') at the top of the closest containing Package (or the element's owning namespace) unless an existing import in the namespace hierarchy already covers it; no new definition is created. Units used in attribute value direct edit (e.g. '10 [kg]', '10.0 [N*m]') resolve against SI and add 'import SI::*' (v2026.1.0). 'New objects from text' references standard-library elements through the imports written in the text (e.g. 'import ScalarValues::*; attribute myAttribute : String;').
  - For Grasp: typing a library type in a label adds its import; Grasp's label makes a new definition for an unknown name.
  - Sources: `MetamodelMutationImportService.java`, `DirectEditNamespaceProvider.java`, `directEditTests.cy.ts`

### Qualified names for standard-library targets in diagram labels

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Qualified names for standard-library targets in diagram labels** · model / Libraries, standard library & publication · SysON · useful · Grasp: missing
  - What it is: in node and compartment-item labels, the target named after ':' (typing), ':>' (subsetting), ':>>' (redefinition), '::>' (reference subsetting) and ':>' subclassification uses the element's qualified name (e.g. 'ScalarValues::Real') when it comes from a standard library, and its plain name otherwise.
  - For Grasp: labels show 'ScalarValues::Real' so library types stand out; Grasp types only by its own definitions.
  - Sources: `DiagramQueryLabelService.java`, `2024.9.0.adoc`

### Library update impact analysis

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Library update impact analysis** · model / Libraries, standard library & publication · Sirius Web · useful · Grasp: missing
  - What it is: `editingContext.updateLibraryImpactAnalysisReport(libraryId)` dry-runs the version update on a snapshot and restores the project. The impact analysis dialog (titled like the update dialog) gives counts of elements deleted, modified and created plus SysON's impact tree (default Explorer filters, hiding Membership, root Namespace and MembershipExpose): the old library documents shown as removed and the new ones as added (e.g. 'LibraryResource1 (MyLibrary@v1)' / 'SysMLv2-Library@v2'), expandable to their full models, and the model references that will be removed because their target no longer exists (e.g. 'type: AttributeDefinition1' under FeatureTyping, a PartDefinition typing a PartUsage, a removed subsettingFeature, 'extends: Map<K, V>'). 'Execute' performs the update; closing the dialog leaves models unchanged. Failures still produce a report rather than an error. For an unknown target library the report has 0 created, 0 deleted and 0 modified elements, a single extra line 'An error occurred while executing the operation: <reason>' and an empty impact tree. If the project snapshot can't be taken, the report has the single line 'An unexpected error has occurred, please contact the server administrator'. Messages returned by a successful dry run are passed along with the report. _(Sirius Web)_
  - For Grasp: preview what an update deletes, changes and creates before applying; Grasp has no libraries.
  - Sources: `InvokeUpdateLibraryImpactAnalysisHandler.java`, `SysONLibraryUpdateImpactAnalysisControllerIntegrationTests.java`, `library-update-impact-analysis.cy.ts`

### Published library versions (immutable snapshots)

**Grasp: missing** · parts: model, platform

SysON features encompassed (2):

- **Library: immutable, versioned, namespaced snapshot** · model / Libraries, standard library & publication · Sirius Web, experimental · useful · Grasp: missing
  - What it is: a library is a read-only snapshot of a project that other projects or libraries can reference; it has a namespace (id of the authoring project), name, version and description, can be neither unpublished nor overwritten, and several libraries may share a name and version if their namespaces differ. The Sirius Web user manual marks the libraries feature as experimental. _(Sirius Web; experimental)_
  - For Grasp: reusable, versioned model content shared across models; Grasp has no libraries.
  - Sources: `concepts.adoc`, `libraries.adoc`
- **Published library versions (immutable snapshots)** · platform / Versioning, migration & data management · SysON · useful · Grasp: missing
  - What it is: the only versioned snapshots of model content are published libraries, identified by namespace, name and version (unique together in the database), and `Library.versions` lists every published version of one library. SysON refuses to publish a namespace:name@version that already exists ("Library '<ns>:<name>@<version>' already exists."), because the platform relies on published libraries being immutable. A publication copies the project's own `.sysml` documents (not the standard libraries or referenced libraries) into new read-only semantic data, clears their imported flag, records the libraries they reference as dependencies, and answers "Successfully published library '<ns>:<name>@<version>'." or "Failed to publish library ...".
  - For Grasp: reuse a finished model as a read-only, versioned library in other models, refusing a duplicate version; Grasp has no user libraries.
  - Sources: `SysONSysMLLibraryPublisher.java`, `libraries.graphqls`, `03-add-library-table.xml`

### Implicit specializations to standard-library types

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Implicit specializations to standard-library types** · model / Libraries, standard library & publication · SysON · useful · Grasp: missing
  - What it is: Definitions and Usages without an explicit subclassification/subsetting get the implicit specialization the SysML spec requires toward the matching standard-library type or feature (e.g. Actions::Action, Actions::actions, Allocations::Allocation, Calculations::Calculation, Cases::Case, Connections::Connection, Interfaces::Interface, Items::Item, Metadata::MetadataItem), looked up through the LibraryNamespaceProvider; this is what lets diagrams show members inherited from standard libraries. Added v2024.9.0.
  - For Grasp: every part, action or item implicitly specializes its library base, which yields inherited members; Grasp adds none.
  - Sources: `ImplicitSpecializationSwitch.java`, `2024.9.0.adoc`, `CHANGELOG.adoc` v2025.10.0

### Implicit specializations computed virtually

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Implicit specializations computed virtually** · model / Model semantics & editing services · SysON · useful · Grasp: missing
  - What it is: SysON adds the spec's implicit standard-library specializations (since v2024.9.0) when derived features are read, not as stored elements; each has isImplied = true and is named 'subsets (implicit)', 'subclasses (implicit)', 'redefines (implicit)' or 'typed by (implicit)', and is added only when the element has no explicit specialization of that kind. They are hidden in diagrams and the Explorer. They are recomputed on every read of ownedSpecialization (supertypes(excludeImplied = true) skips them); each one is not contained anywhere but carries a virtual link so its owningRelatedElement, and therefore its library namespace and owner, still report the specializing type. Coverage is per SysML metaclass (the definition, usage, control-node, Multiplicity, TriggerInvocationExpression, timeslice/snapshot, semantic-metadata, parameter-redefinition and feature-chain cases below); no KerML-level default such as Base::Anything or Base::things is ever added for other types.
  - For Grasp: the specification's implied library specializations exist without cluttering diagrams; Grasp computes none.
  - Sources: `ImplicitSpecializationSwitch.java`, `TypeImpl.java`, `VirtualLinkAdapter.java`, `ImplicitSpecializationAccumulator.java`, `2024.9.0.adoc`

### Implicit subclassification of definitions

**Grasp: missing** · parts: model

SysON feature encompassed (1):

- **Implicit subclassification of definitions** · model / Model semantics & editing services · SysON · useful · Grasp: missing
  - What it is: ActionDefinition Actions::Action; AllocationDefinition Allocations::Allocation; AnalysisCaseDefinition AnalysisCases::AnalysisCase; CalculationDefinition Calculations::Calculation; CaseDefinition Cases::Case; ConcernDefinition Requirements::ConcernCheck; ConnectionDefinition Connections::Connection (Connections::BinaryConnection with 2 ends); ConstraintDefinition Constraints::ConstraintCheck; FlowDefinition Connections::MessageConnection; InterfaceDefinition Interfaces::Interface (Interfaces::BinaryInterface with 2 ends); ItemDefinition Items::Item; MetadataDefinition Metadata::MetadataItem; OccurrenceDefinition Occurrences::Occurrence; PartDefinition Parts::Part; PortDefinition Ports::Port; RenderingDefinition Views::Rendering; RequirementDefinition Requirements::RequirementCheck; StateDefinition States::StateAction; UseCaseDefinition UseCases::UseCase; VerificationCaseDefinition VerificationCases::VerificationCase; ViewDefinition Views::View; ViewpointDefinition Views::Viewpoint.
  - For Grasp: each definition implicitly specializes its library base, so it inherits its features; Grasp has no library.
  - Sources: `ImplicitSpecializationSwitch.java`, `ActionDefinitionImplTest.java`

### Read-only rules for libraries and read-only imports

**Grasp: missing** · parts: model, platform

SysON features encompassed (2):

- **Read-only rules for libraries and imported resources** · model / Libraries, standard library & publication · SysON · useful · Grasp: missing
  - What it is: a resource is read-only only when it is a library imported by reference (resource from a referenced library), a textual SysML file / model imported as read-only (metadata flagged read-only), or a KerML/SysML standard library (URI scheme) or SysON default library resource; everything else (local resources, copied imports containing Package and/or LibraryPackage, resources with no URI or no content) is editable. A Resource, EAnnotation or SysML Element inside a standard LibraryPackage is read-only even if its resource isn't. The check goes through IReadOnlyObjectPredicate and drives Explorer, Details and diagrams (disabled widgets, no edit actions). That predicate asks its registered delegates in turn; the first one that handles the object (SysON's delegate for Resources, EAnnotations and SysML Elements) decides. Otherwise the Sirius Web default applies, which reads the read-only flag of the object's document (false when the object has no document or no metadata).
  - For Grasp: library and read-only imports can't be edited anywhere in the UI; Grasp has no read-only content, only a read-only page state.
  - Sources: `SysONReadOnlyObjectPredicateDelegate.java`, `SysONReadOnlyObjectPredicateDelegateTests.java`, `2025.10.0.adoc`
- **Read-only documents and standard library elements** · platform / Versioning, migration & data management · SysON · useful · Grasp: missing
  - What it is: SysON treats a document as read-only when it is a standard library resource or when its metadata carries the read-only flag (set by "Upload (read-only)" and on the documents of a published library), and an element as read-only when its document is read-only or when it belongs to a standard library package, whatever its document. Annotations follow their document.
  - For Grasp: standard library elements and read-only uploads cannot be edited by mistake; Grasp shows no library elements and has no read-only models.
  - Sources: `SysONReadOnlyObjectPredicateDelegate.java`, `EditingContextPersistenceService.java`

### Tools that rely on standard-library elements

**Grasp: partly** · parts: model

SysON feature encompassed (1):

- **Tools that rely on standard-library elements** · model / Libraries, standard library & publication · SysON · useful · Grasp: partly
  - What it is: a new ViewUsage (from a tool or New Object) is typed by default by 'StandardViewDefinitions::GeneralView' (v2025.6.0); the New Derived Requirement edge tool uses the 'RequirementDerivation' metadata definitions and adds an import of that library when the model lacks one (v2026.9.0); start/done successions and transitions target the standard 'Actions::Action::start/done' and 'States::StateAction::start/done' features. These elements are looked up by qualified name in the standard LibraryPackages.
  - For Grasp: new views are typed by standard view definitions and start/done use library features; Grasp names the standard view kinds in export only.
  - Sources: `UtilService.java`, `ElementInitializerSwitch.java`, `2026.9.0.adoc`

## Tables and the Requirements Table View (25)

The requirements table and generic table representation: rows, columns, cell editing, sort, filter and CSV export.

### Create a Requirements Table View

**Grasp: missing** · parts: representations, views

SysON features encompassed (2):

- **Requirements Table View precondition** · views / Representations: creation, management & views list · SysON · useful · Grasp: missing
  - What it is: the requirements table (added in 2025.10.0, 'available on any element') has domain type Namespace and no precondition, so it is offered on any Namespace; the docs' workflow is right-click a Package (or any other element) in the Explorer > New Representation > 'Requirement Table View', set a name. The new table is empty until 'Import all existing requirements' is used.
  - For Grasp: a requirements table can be made on any namespace; Grasp's grid tabulates elements but has no requirements table.
  - Sources: `RTVTableDescriptionProvider.java`, `requirement-management.adoc`, `2025.10.0.adoc`
- **Create a Requirements Table View** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: right-click a Package (or any other element whose type is a SysML Namespace) in the Explorer, choose New Representation, pick "Requirements Table View" (the user manual calls it "Requirement Table View") and give it a name. The default title is "view" followed by the number of existing ViewUsages plus one (e.g. view1). The table is backed by a ViewUsage and starts empty. When the command is run on an element that is not a ViewUsage, SysON's input pre-processor first creates a new ViewUsage named after the representation name, inside the membership kind computed for that container, and attaches the table to it. Unlike the four standard diagrams, this ViewUsage is not typed by any ViewDefinition. Run on an existing ViewUsage, the table attaches to that ViewUsage directly. The project is saved right after creation. Released in v2025.10.0.
  - For Grasp: a table of a package's requirements, made from the Explorer; Grasp has no requirement kinds and no requirements table.
  - Sources: `RTVTableDescriptionProvider.java`, `CreateRepresentationInputProcessor.java`, `CHANGELOG.adoc` v2025.10.0

### Hierarchical sub-rows

**Grasp: missing** · parts: representations

SysON features encompassed (2):

- **Hierarchical requirements (sub-rows)** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: sub-rows are enabled, so nested RequirementUsages are shown hierarchically under their parent row. The depth level is 0 for a root requirement (one not owned by a RequirementUsage) and +1 per nesting level, and drives the indentation. A requirement shows an expander only when it owns RequirementUsages (hasChildren). Nested rows appear only when all their parent requirements are expanded, or when expand-all is on. Released in v2026.9.0.
  - For Grasp: nested requirements indent under their parent with an expander; Grasp's grid rows are flat.
  - Sources: `RTVQueryServices.java`, `RTVTableDescriptionProvider.java`, `2026.9.0.adoc`
- **Hierarchical sub-rows with expand column** · representations / Requirements & tables · Sirius Web · useful · Grasp: missing
  - What it is: when the description enables sub-rows, an expand column appears before the row header, sized 36px plus 8px per maximum depth level. Each row has a chevron indented by its depth, disabled when the row has no children (hasChildrenExpression). Expanding or collapsing changes the expandedIds sent to the server, which returns the child rows inline, so users can focus on one subtree. Added in v2025.4.0. _(Sirius Web)_
  - For Grasp: tree-shaped rows with chevrons let a table show a subtree; Grasp's grid rows are flat.
  - Sources: `RowExpandHeader.tsx`, `TableRepresentation.tsx`, `CHANGELOG.adoc` v2025.4.0

### Edit name and ReqId in cells

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Edit name and ReqId in cells** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: DeclaredName and ReqId cells are always rendered as borderless single-line text fields, so clicking one places the caret in it (there is no separate display mode). Pressing Enter or leaving the field commits the text through a SetValue operation on the requirement's declaredName or reqId. Leaving the field sends the value even when it is unchanged.
  - For Grasp: typing a name or id straight into a row is fast bulk editing; Grasp's grid cells are read-only, edits go through the panel.
  - Sources: `RTVTableDescriptionProvider.java`, `TextfieldCell.tsx`, `requirement-management.adoc`

### Edit documentation in cell

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Edit documentation in cell** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: the Documentation cell is a text area showing the body of the requirement's first Documentation (empty if there is none). Editing updates that body or, if the requirement has no Documentation, creates one inside a new OwningMembership of the requirement. Enter inserts a new line, so the edit is committed only when the field loses focus. Only the first Documentation is shown or edited; any further Documentation elements are left untouched.
  - For Grasp: writes a requirement's text in place, creating its documentation if missing; Grasp edits doc only in the panel.
  - Sources: `RTVTableDescriptionProvider.java`, `RTVMutationServices.java`, `TextareaCell.tsx`

### Create requirement

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Create requirement** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: an entry in the table's Tools menu, labelled "Create requirement" with the createRequirement.svg icon. The user manual calls it the "New Requirement" button. It creates a RequirementUsage in the namespace that owns the table's ViewUsage, wrapped in the membership kind computed for it. The new requirement gets the default name "requirement<N>" (N = number of RequirementUsages in that namespace) and isComposite true. A new MembershipExpose shows it as a row right away. If no ViewUsage is found it fails with "Unable to create a RequirementUsage". It is defined by the backend as a tool menu entry with id `add-requirement-table-tool-entry`; the toolMenuEntries query on the table returns exactly this entry and `import-existing-requirements-table-tool-entry`. In the integration test, creating one in a namespace that already holds two requirements yields a row named "requirement3".
  - For Grasp: adds a named requirement straight from the table and shows it as a row; Grasp has no requirements.
  - Sources: `RTVTableToolMenuEntriesProvider.java`, `RTVTableCreateRequirementToolExecutor.java`, `RTVMutationServices.java`

### New Nested Requirement

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **New Nested Requirement** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: an entry in the row's "..." actions menu, with the createRequirement.svg icon. It creates a RequirementUsage owned by the row's requirement, with the default name "requirement<N>", and exposes it through a MembershipExpose. The new requirement then appears as a sub-row of its parent. The parent row is not expanded for you, so the new sub-row shows once the parent is expanded (or expand-all is on). Released in v2026.9.0.
  - For Grasp: builds a requirement hierarchy from the table rows; Grasp has no requirements or nested rows.
  - Sources: `RTVTableDescriptionProvider.java`, `RTVMutationServices.java`, `2026.9.0.adoc`

### Per-column filters

**Grasp: missing** · parts: representations

SysON features encompassed (2):

- **Requirements column filters** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: per-column filters keep only rows whose DeclaredName, ReqId or first-documentation body contains the filter text. Matching is a case-sensitive substring test, and the filter value is JSON-decoded first. A row whose value is unset is excluded while that filter is active. If the filter value cannot be JSON-decoded, the row is kept and a warning is logged. Filtering runs on the server, after the expansion step, so only rows visible under the current expansion can match. A matching sub-row whose parent is filtered out is still shown, indented, without its parent. The filter ids are the column target objects ("DeclaredName", "ReqId", "Documentation").
  - For Grasp: narrows long requirement lists by text per column; Grasp's grid has no filters.
  - Sources: `RTVQueryServices.java`, `TableComponent.java`
- **Per-column filters** · representations / Requirements & tables · Sirius Web · useful · Grasp: missing
  - What it is: the "Show/Hide filters" toolbar toggle shows or hides a row of filter inputs under the column headers. Each filter restricts rows by that column's value, and active filters stack, so only rows matching all of them stay. Filtering is done on the server. Values are JSON-encoded, saved with the changeColumnFilter mutation and broadcast to other viewers. Range filters are supported, and since v2025.2.0 filters are no longer reset when the table opens. Labels: "Filter by {column}", "Filtering by {column} - {filterType} {filterValue}", "Clear filter", "Change filter mode", "Filter Mode: {filterType}". _(Sirius Web)_
  - For Grasp: stacked filters under the headers narrow large tables; Grasp's grid has no filters.
  - Sources: `useTableColumnFiltering.ts`, `table.adoc`, `CHANGELOG.adoc` v2025.1.0

### Global table search

**Grasp: missing** · parts: representations

SysON features encompassed (2):

- **Requirements global filter** · representations / Requirements & tables · SysON · useful · Grasp: missing
  - What it is: the toolbar search keeps rows whose declaredName, reqId or documentation body contains the typed text. Matching is case-sensitive and runs on the server. Blank or whitespace-only text is ignored. The global filter is applied before the column filters.
  - For Grasp: one search box across name, id and text finds a requirement quickly; Grasp's grid has no search.
  - Sources: `RTVQueryServices.java`
- **Global search** · representations / Requirements & tables · Sirius Web · useful · Grasp: missing
  - What it is: a search field (placeholder "Search") is always shown in the top toolbar. showGlobalFilter is on, and no Show/Hide search button is rendered although the label exists. It searches the textual content of all visible columns, with filtering done on the server. Each change is saved with the changeGlobalFilterValue mutation and broadcast to other viewers. "Clear search" resets it and keeps the chosen page size. For example, in the tests "Class" shows 4 of 8 rows. Labels: "Search", "Clear search", "Change search mode", "Show/Hide search", "No results found". Added in v2025.1.0. _(Sirius Web)_
  - For Grasp: one search box filters rows across all visible columns; Grasp's grid has no search.
  - Sources: `useGlobalFilter.ts`, `global-filter.spec.ts`, `CHANGELOG.adoc` v2025.1.0

### Tools menu

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Tools menu** · representations / Requirements & tables · Sirius Web · useful · Grasp: missing
  - What it is: a "Tools" button with a tools icon on the left of the top toolbar opens a menu, with a spinner while entries load. The menu always starts with "Export page data as CSV" (download icon), followed by the table's backend-defined tool menu entries (icon or blank spacer, then label) and any frontend-contributed entries. Entries are disabled only while their mutation runs, not in read-only mode, and the menu stays open after an entry is clicked. Clicking an entry no longer triggers redundant menu-entry queries. Backend entries from all providers are concatenated in provider order, not sorted. Invoking an entry that no executor handles fails with "No existing action for this menu entry". A successful entry returns its own change kind, so a semantic change refreshes the table. In SysON the backend entries are "Create requirement" and "Import all existing requirements". Renamed from "Settings" in v2025.12.0, and backend-provided and contributable since v2026.3.0. Frontend entries are contributed through the toolsButtonMenuEntryExtensionPoint, which was named settingButtonMenuEntryExtensionPoint until v2025.12.0. _(Sirius Web)_
  - For Grasp: a menu holding CSV export and the table's create and import tools; Grasp's grid has no such menu.
  - Sources: `ToolsButton.tsx`, `ToolsMenuEntries.tsx`, `CHANGELOG.adoc` v2025.12.0

### Export page data as CSV

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Export page data as CSV** · representations / Requirements & tables · Sirius Web · useful · Grasp: missing
  - What it is: Tools > "Export page data as CSV" downloads the currently loaded rows only (the current page). - It uses the visible columns only, in their display order, with column labels as headers. - The separator is ";" and the decimal separator ".". - A first `_row_header_` column holds "<index label> <row label>". - Text and textarea cells export their text, icon-label cells their label, select cells the chosen option's label, and multi-select cells their option labels joined with " ,". - Custom cells such as checkbox cells export as empty strings. - In SysON's requirements table, rows have neither an index label nor a header label, so the `_row_header_` column holds only a space. - Column headers are the column labels, so two columns with the same label would collide. - Export was added in v2025.4.0, and the changelog's "Export All in Page" action is this entry under its v2025.12.0 name.
  - For Grasp: takes table rows into a spreadsheet; Grasp exports only SysML text.
  - Sources: `ExportDataButton.tsx`, `CHANGELOG.adoc` v2025.4.0, `CHANGELOG.adoc` v2025.12.0

### Column resizing

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Column resizing** · representations / Requirements & tables · Sirius Web · useful · Grasp: missing
  - What it is: resizable columns have a drag handle on the header's right edge. The new width applies when the mouse is released (resize mode "onEnd") and is saved with the resizeTableColumn mutation. The row-header and expand columns can be resized locally only, and resizing one column keeps the header column's width. Initial widths come from the description (e.g. 250 for DeclaredName); a width of 0 or less (-1 is the default) lets the column use its automatic size. A saved width overrides the initial width on later renders. Resizing is enabled only when at least one column is resizable. "Reset column size" is in the column menu. _(Sirius Web)_
  - For Grasp: dragging a header edge widens a column, and the width is kept; Grasp's grid column widths are fixed.
  - Sources: `useTableColumnSizing.ts`, `TableContent.tsx`, `CHANGELOG.adoc` v2025.1.0

### Row actions menu

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Row actions menu** · representations / Requirements & tables · Sirius Web · useful · Grasp: missing
  - What it is: a horizontal "…" button (tooltip "Row actions") in the right-pinned actions column opens that row's backend-defined context menu entries (domain commands such as duplicate or delete), each with icon and label. - Entries are disabled in read-only mode. - Choosing an entry calls invokeRowContextMenuEntry, closes the menu and shows the server's success or error messages as toasts. - Clicks inside the menu stop propagating, so they never change the workbench selection. - "No entries found" shows when the row has no entries. - The entries of every backend provider are merged and sorted alphabetically by label. The query runs each time the menu opens, and its errors appear as toasts. - Entries run at once, with no confirmation, even destructive ones. - Entries with a missing or invalid icon still render. - Row actions work on later pages too.
  - For Grasp: a "…" menu per row with commands such as delete, run at once; Grasp's grid rows have no menu.
  - Sources: `RowAction.tsx`, `RowContextMenuContent.tsx`, `useInvokeRowContextMenuEntry.ts`

### Inline cell editing

**Grasp: missing** · parts: representations

SysON feature encompassed (1):

- **Inline cell editing** · representations / Requirements & tables · Sirius Web · useful · Grasp: missing
  - What it is: editable cells are always rendered as their borderless widget (text field, text area, dropdown or checkbox), with no separate display mode, so the value can be typed, picked or toggled in place. Clicking a cell both focuses its widget and selects its target element. Every edit is a semantic change, so the table and all other views refresh. Server messages from the edit are shown as toasts. _(Sirius Web)_
  - For Grasp: type, pick or toggle values right in the table; Grasp's grid cells are read-only.
  - Sources: `Cell.tsx`, `EditCellEventHandler.java`, `table.adoc`

### Table content is the ViewUsage's exposed elements

**Grasp: partly** · parts: representations

SysON feature encompassed (1):

- **Table content is the ViewUsage's exposed elements** · representations / Requirements & tables · SysON · useful · Grasp: partly
  - What it is: the table keeps its content in the model. It shows only the RequirementUsages that its ViewUsage exposes through MembershipExpose relationships. Adding a requirement to the table creates a MembershipExpose, and removing one from the table deletes it.
  - For Grasp: the table's rows are the view's exposes, kept in the model; Grasp's views expose elements, but no requirements table does.
  - Sources: `RTVQueryServices.java`, `RTVMutationServices.java`

### Requirements table rows

**Grasp: partly** · parts: representations

SysON feature encompassed (1):

- **Requirements table rows** · representations / Requirements & tables · SysON · useful · Grasp: partly
  - What it is: one row per exposed RequirementUsage. The row header shows the RequirementUsage icon and has no label. Row height is automatic (initial height -1), and rows cannot be resized. Exposed requirements are ordered depth-first, so children follow their parent. No index label expression is set on rows or columns, so no row numbers or column letters are shown, and the cells set no tooltip expression, so they have no hover tooltip.
  - For Grasp: one row per requirement, children after parents; Grasp's grid has a row per element but no requirement rows or row icons.
  - Sources: `RTVTableDescriptionProvider.java`, `RTVQueryServices.java`, `table.ecore`

### Requirements table columns

**Grasp: partly** · parts: representations

SysON feature encompassed (1):

- **Requirements table columns** · representations / Requirements & tables · SysON · useful · Grasp: partly
  - What it is: three columns, "DeclaredName" (initial width 250), "ReqId" (150) and "Documentation" (400). All three are resizable, sortable and filterable. The columns set no filter widget expression, so their filter variant is empty and the frontend's default filter input is used.
  - For Grasp: name, ReqId and documentation side by side; Grasp's grid has name and doc but no ReqId, resizing or filters.
  - Sources: `RTVTableDescriptionProvider.java`, `ColumnDescriptionConverter.java`, `2025.10.0.adoc`

### Import all existing requirements

**Grasp: partly** · parts: representations

SysON feature encompassed (1):

- **Import all existing requirements** · representations / Requirements & tables · SysON · useful · Grasp: partly
  - What it is: an entry in the table's Tools menu, labelled "Import all existing requirements" with the importRequirements.svg icon. It exposes in the table every RequirementUsage owned by the ViewUsage's owning namespace and, recursively, their nested RequirementUsages at any depth, which appear as sub-rows. It adds one MembershipExpose each, pointing at the requirement's owning membership, and skips requirements already shown. Only requirements owned directly by that namespace (and their nested requirements) are imported; requirements inside sub-packages or other elements are not. The two Tools entries appear in the order the provider declares them, not sorted. Failure shows "Unable to import existing requirements". Its tool menu entry id is `import-existing-requirements-table-tool-entry`. The user manual presents it as the way to populate a new, empty table. The user manual still says sub-requirements are not imported, but the v2026.11.0 code imports them.
  - For Grasp: fills an empty table with the namespace's requirements; Grasp's grid has Show all and Show kind, but no requirements.
  - Sources: `RTVTableImportExistingRequirementsToolExecutor.java`, `RTVTableToolMenuEntriesProvider.java`, `requirement-management.adoc`

### Delete from table

**Grasp: partly** · parts: representations

SysON feature encompassed (1):

- **Delete from table** · representations / Requirements & tables · SysON · useful · Grasp: partly
  - What it is: an entry in the row's "..." actions menu, with the graphicalDelete.svg icon. It deletes the MembershipExpose relationships that show the requirement, which removes it from the table but keeps it in the model. Only that requirement's own exposes are deleted, so nested requirements stay exposed. It runs at once, with no confirmation. The row menu lists its three entries sorted by label: "Delete from model", "Delete from table", "New Nested Requirement".
  - For Grasp: takes a row out of the table but keeps the element; Grasp has Remove from view, but no per-row actions menu.
  - Sources: `RTVTableDescriptionProvider.java`, `RTVMutationServices.java`, `RequirementsTableControllerIntegrationTests.java`

### Delete from model

**Grasp: partly** · parts: representations

SysON feature encompassed (1):

- **Delete from model** · representations / Requirements & tables · SysON · useful · Grasp: partly
  - What it is: an entry in the row's "..." actions menu, with the semanticDelete.svg icon. It deletes the requirement from the model (DeleteService.deleteFromModel), so the row also disappears from the table. No confirmation dialog is shown.
  - For Grasp: deletes the element from a table row; Grasp's Delete does this from the panel, with no row menu.
  - Sources: `RTVTableDescriptionProvider.java`, `RowContextMenuContent.tsx`, `requirement-management.adoc`

### Multi-column sorting

**Grasp: partly** · parts: representations

SysON features encompassed (2):

- **Requirements column sort** · representations / Requirements & tables · SysON · useful · Grasp: partly
  - What it is: sorting on DeclaredName, ReqId or Documentation (first documentation body) orders rows case-insensitively, ascending or descending, on the server. With several sorts active, each is applied in turn, in the order received, as a stable sort, so the last one applied is the primary key. Global and column filters run before sorting, and pagination comes last. Sorting reorders the flat list of visible rows, so after a sort nested requirements no longer necessarily follow their parent. The DeclaredName and ReqId comparators do not handle unset values, so a sort can fail when some row has no name or no ReqId.
  - For Grasp: sorts rows by any column, several at once; Grasp's grid sorts by one column at a time.
  - Sources: `RTVQueryServices.java`
- **Server-side multi-column sorting** · representations / Requirements & tables · Sirius Web · useful · Grasp: partly
  - What it is: columns the description marks sortable are sorted by clicking their header or sort icon. Sorting is always multi-sort, so clicking another column adds it to the sort. The sort is computed on the server, saved with the changeColumnSort mutation (column id and ascending/descending), and broadcast. Labels: "Sort by {column} ascending/descending", "Sorted by {column} ascending/descending", ", then by ", "Clear sort". Added in v2025.4.0 (ADR-187), with server-side sorting and filtering from v2024.11.0 (ADR-171). _(Sirius Web)_
  - For Grasp: clicking headers sorts by several columns at once; Grasp's grid sorts by one column, cycling up, down and off.
  - Sources: `useTableColumnSorting.ts`, `useTableColumns.tsx`, `CHANGELOG.adoc` v2025.4.0

### Table representation

**Grasp: partly** · parts: representations

SysON feature encompassed (1):

- **Table representation** · representations / Requirements & tables · Sirius Web, experimental · useful · Grasp: partly
  - What it is: a tabular view of the model, with elements as rows and their properties as columns. The table description predefines which rows, columns and actions appear (tables are configured, not free spreadsheets). Every inline change is synchronized at once with other representations and with collaborators. The Sirius Web user manual and studio-maker guide flag tables as experimental ("Before you Start" status box), while the key-features table lists them as available. _(Sirius Web; experimental)_
  - For Grasp: model elements as editable rows and properties as columns; Grasp's grid lists elements but its cells can't be edited.
  - Sources: `table.adoc`, `key-features.adoc`

### Table toolbar layout

**Grasp: partly** · parts: representations

SysON feature encompassed (1):

- **Table toolbar layout** · representations / Requirements & tables · Sirius Web · useful · Grasp: partly
  - What it is: - The top toolbar has the "Tools" button on the left. - On the right are the global "Search" field (with a clear x button) and the built-in actions: Reset Row Heights, Row filters (only when defined), Show/Hide filters, Show/Hide columns and Toggle full screen. - The bottom toolbar shows only when pagination is enabled, and holds "Rows per page" and the previous/next arrows. - Column headers show a letter index (A, B, C), an optional icon and the label, with a drag handle and a kebab menu. - The row header shows the expand chevron, row index, icon, label and a resize bar. - An "Actions" column holds the "..." row menu. - The "Toggle density" label exists, but no density button is rendered. - The user manual's screenshot and text still show a "SETTINGS" button, which is now "Tools".
  - For Grasp: Tools, search, filters, column chooser and full screen above the table; Grasp's grid options sit in the panel, with no search or filters.
  - Sources: `TableContent.tsx`, `table-description.adoc`, `table.adoc`

### Show/Hide columns (column management menu)

**Grasp: partly** · parts: representations

SysON feature encompassed (1):

- **Show/Hide columns (column management menu)** · representations / Requirements & tables · Sirius Web · useful · Grasp: partly
  - What it is: the "Show/Hide columns" toolbar button opens the column management menu. It has a switch per column to hide or show it, drag handles to reorder, and pin icons to pin left or right. Visibility changes are sent with the changeTableColumnVisibility mutation (a list of column id and visible flag) and come back as each column's hidden flag, so they are saved per table. Labels: "Hide all", "Show all", "Show all columns", "Hide {column} column", "Toggle visibility". _(Sirius Web)_
  - For Grasp: hide, show, reorder and pin columns from one menu; Grasp's panel ticks grid columns but can't reorder or pin them.
  - Sources: `useTableColumnVisibility.ts`, `table.adoc`, `CHANGELOG.adoc` v2025.1.0

### Row header column and selection

**Grasp: partly** · parts: representations

SysON feature encompassed (1):

- **Row header column and selection** · representations / Requirements & tables · Sirius Web · useful · Grasp: partly
  - What it is: a display column pinned left on every row shows the row's index label, icons and label, indented by its depth level. Clicking it selects the row's semantic element in the workbench selection, which synchronizes other views such as the Explorer and the Details view. It also holds the row resize handle, and the row header column itself can be resized. _(Sirius Web)_
  - For Grasp: clicking a row selects its element everywhere; Grasp's grid rows select too, but there is no row header with icon or index.
  - Sources: `RowHeader.tsx`, `useTableColumns.tsx`, `table.adoc`

### Table selection highlighting

**Grasp: partly** · parts: representations

SysON feature encompassed (1):

- **Table selection highlighting** · representations / Requirements & tables · Sirius Web · useful · Grasp: partly
  - What it is: rows whose element is in the workbench selection are shown as selected, and every row has a pointer cursor. When a cell's own target element is selected but its row's element is not, the cell gets a 2px dashed border in the selection color. _(Sirius Web)_
  - For Grasp: rows of selected elements are marked, and a selected cell target gets a dashed border; Grasp marks rows but has no cell targets.
  - Sources: `TableContent.tsx`

## Projects, files, persistence and image export (15)

Project browser and templates, creating, uploading and downloading projects, layout persistence and diagram image export.

### Projects browser (homepage)

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Projects browser (homepage)** · application / Homepage, project browser & project lifecycle · Sirius Web, experimental · useful · Grasp: missing
  - What it is: The application's homepage and the central place to create new projects or manage existing ones, at route `/projects` (also `/`). From top to bottom: the navigation bar with a toolbar (Homepage, Command Palette and Links groups), a centered column (8 of 12 grid columns, max width xl) holding the 'Create a new project' area above the 'Existing Projects' table, then the footer. The create area appears only if the viewer may create projects (projects canCreate), and a viewer without the projects canList capability is redirected to `/errors/404` instead of seeing the page. Both areas carry an h4 heading. The homepage hosts its own projects omnibox (command palette, added in 2025.12.0). Test ids: projects table `projects`, create entry `create`, upload entry `upload`. Each project created there opens in its own Project Editor (workbench). SysON docs call it the 'Projects browser'. _(Sirius Web; experimental)_
  - For Grasp: a home page to start a project or reopen one; Grasp is a single page holding one model.
  - Sources: `ProjectBrowserView.tsx`, `homepage.adoc`, `project-browser.adoc`

### Existing Projects table

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Existing Projects table** · application / Homepage, project browser & project lifecycle · Sirius Web, experimental · useful · Grasp: missing
  - What it is: Under the heading 'Existing Projects', a Material React Table lists projects. The 'Name' column shows each name as a link (underline on hover, ellipsized) to `/projects/{id}/edit`, and clicking it opens the project in its Project Editor; the last column, 'Actions', holds a 'More' (...) button. A loading state shows while fetching, and an empty result shows 'No records to display'. Column menus, column filters, full screen, density and column hiding are turned off. Sorting is not explicitly disabled, but the 'Name' column has no accessor (it only renders a custom cell), so the table cannot sort it and the header shows no sort control: rows always keep the server order (newest first). A failed list query shows its error message as a toast. Extensions can add or change columns through the `useProjectsTableColumn#projectsTableColumnCustomizers` data extension point. The list is fetched from the server every time the homepage is shown (the GraphQL client caches nothing), but it does not update live: projects created, renamed or deleted elsewhere appear only after a reload, a page change or one of the user's own rename/delete actions. Each row also fetches that project's download, rename, delete and duplicate capabilities, which drive its menu. Table labels come from the shared table translations. Previous/next pagination and ordering were fixed over releases. _(Sirius Web; experimental)_
  - For Grasp: a table of every project to reopen one; Grasp holds one model per page.
  - Sources: `ProjectsTable.tsx`, `useProjectsTableColumns.tsx`, `ListProjectsArea.tsx`

### Create a new Model card

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **Create a new Model card** · application / Workbench layout & panels · Sirius Web · useful · Grasp: missing
  - What it is: titled 'Create a new Model' with the subtitle 'Select the model to create', it lists the editing context's actions as dense items with a NoteAdd icon. Clicking one invokes that action on the server, with errors shown as toasts. In read-only projects the subtitle reads 'You need edit access to create models' and no items show. The card scrolls past 50 spacing units in height. _(Sirius Web)_
  - For Grasp: create a new model from the empty editor; Grasp holds one model.
  - Sources: `NewDocumentArea.tsx`, `sirius-web-application.json`

### SysON 'Create a new Model' actions: SysMLv2 and SysMLv2-Library

**Grasp: missing** · parts: application

SysON feature encompassed (1):

- **SysON 'Create a new Model' actions: SysMLv2 and SysMLv2-Library** · application / Workbench layout & panels · SysON · useful · Grasp: missing
  - What it is: SysON contributes two editing-context actions to every EMF project, listed in the 'Create a new Model' card: - 'SysMLv2' (id empty_sysmlv2): one click adds a document 'SysMLv2.sysml' containing Package1. - 'SysMLv2-Library' (id empty_sysmlv2_library): one click adds a document 'SysMLv2-Library.sysml' containing LibraryPackage1.
  - For Grasp: add a SysML model or library model to the project in one click; Grasp holds one model.
  - Sources: `SysMLv2EditingContextActionProvider.java`, `SysMLv2EditingContextActionHandler.java`, `NewDocumentArea.tsx`

### PNG export

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **PNG export** · diagrams / Diagram: export & image · Sirius Web · useful · Grasp: missing
  - What it is: renders at pixel ratio 2 with a white background (transparent backgrounds handled); the area is the bounding box of visible (non-hidden) nodes, with the viewport transform fitted to it (zoom clamped 0.5-2, padding 0.05); edge marker (arrowhead) definitions are cloned into the edges layer so arrows are kept. _(Sirius Web)_
  - For Grasp: PNG at double resolution with a white background, cropped to the visible content; Grasp has no image export.
  - Sources: `useExportToImage.tsx`, `CHANGELOG.adoc` (Sirius Web)

### SVG export (default)

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **SVG export (default)** · diagrams / Diagram: export & image · Sirius Web · useful · Grasp: missing
  - What it is: html-to-image toSvg of the viewport DOM with a white background, sized to the visible nodes' bounding box with the same fit as PNG, with edge markers cloned in, edge arrows and wrapped labels included, and a fallback to the image content type when an extension is missing; fixed to no longer loop on some diagrams. _(Sirius Web)_
  - For Grasp: SVG of the visible content with arrows and wrapped labels; Grasp's drawing is SVG but can't be downloaded.
  - Sources: `useExportToImage.tsx`, `manage-toolbar-diagram.adoc`, `CHANGELOG.adoc` (Sirius Web)

### SVG (Experimental) native export

**Grasp: missing** · parts: diagrams

SysON feature encompassed (1):

- **SVG (Experimental) native export** · diagrams / Diagram: export & image · Sirius Web, experimental · useful · Grasp: missing
  - What it is: rebuilds a true vector SVG instead of an HTML-in-SVG snapshot: renders the snapshot in a hidden container, walks elements tagged data-svg (rect, text, image, svg, defs) in nodes, edges and edge labels and converts each to native SVG, copies edge <g> paths with the viewport transform, and downloads the result as a Blob URL; its bounds use all nodes, hidden ones included. Paint order: node parts first, then edge-related parts (marker defs), then edge paths, then edge labels, then the deferred elements handlers ask to append last (e.g. partial borders); the snapshot's <style> element is copied into the SVG, which gets explicit width, height and viewBox. _(Sirius Web; experimental)_
  - For Grasp: a true vector SVG rebuilt from the drawing; Grasp draws in SVG already, so this is close at hand.
  - Sources: `useExperimentalSvgExport.tsx`, `SVGExportEngine.ts`

### 'Create a new project' card area

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **'Create a new project' card area** · application / Homepage, project browser & project lifecycle · Sirius Web, experimental · useful · Grasp: partly
  - What it is: Under the heading 'Create a new project', a 6-column grid shows at most 6 cards, minus any cards contributed by extensions. In the PROJECT_BROWSER context the server returns as many non-blank templates (sorted by label) as fit, then the Blank Project card, the 'Upload project' card (only with the project UPLOAD capability) and the 'Show all templates' card (only if at least one template exists), so in practice three templates show directly, as the docs say. In SysON the row reads Batmobile, SysMLv2, SysMLv2-Library, Blank Project, Upload project, Show all templates. Each card is 150px wide with a 150x110px visual that the template image fills completely, and a single-line ellipsized caption. On template cards the caption's tooltip is the template label; the Upload and Show-all cards show their description as tooltip. The Blank, Upload and Browse-all cards are special templates with ids `blank-project`, `upload-project` and `browse-all-project-templates` that capability voters can hide (since v2025.8.0 the backend decides which of these cards show; that release named the blank card `create-project`). Extra cards can be appended after the server cards through the `createProjectArea#card` extension point, and each contributed card reduces the number of templates requested. A template whose required libraries cannot be found is not listed. _(Sirius Web; experimental)_
  - For Grasp: starting cards for templates, a blank project and an upload; Grasp opens example files but offers no gallery of starts.
  - Sources: `CreateProjectArea.tsx`, `CreateProjectAreaCard.tsx`, `ProjectTemplateApplicationService.java`

### SysON template set and order

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **SysON template set and order** · application / Homepage, project browser & project lifecycle · SysON · useful · Grasp: partly
  - What it is: SysON ships three project templates, all illustrated with `/images/sysmlv2-logo.png`: 'Batmobile' (`batmobile-template`), 'SysMLv2' (`sysmlv2-template`) and 'SysMLv2-Library' (`sysmlv2-library-template`). The provider declares them as SysMLv2-Library, SysMLv2, Batmobile, but every list sorts by label, so they fill the first three homepage cards as Batmobile, SysMLv2, SysMLv2-Library before Blank Project, and all appear in the template dialog and the New project template select. None declares required libraries or natures, so SysON projects carry no nature. They can also be used through GraphQL `createProject(templateId)`. (Sirius Web's own docs mention Studio, Flow and Papaya, which come from its sample app.)
  - For Grasp: three starting points: an empty model, an empty library and the Batmobile example; Grasp ships one example and starts blank.
  - Sources: `SysMLv2ProjectTemplatesProvider.java`, `homepage.adoc`, `TemplatesControllerIntegrationTests.java`

### Empty SysMLv2 template with Package1 and a view1 General View

**Grasp: partly** · parts: application, views

SysON features encompassed (3):

- **Template: SysMLv2 (empty project)** · application / Homepage, project browser & project lifecycle · SysON · useful · Grasp: partly
  - What it is: Creates an empty SysML project with one document 'SysMLv2.sysml' whose root Namespace > OwningMembership holds a Package 'Package1' (generated elementId). After the semantic data is saved, a ViewUsage 'view1' typed by `StandardViewDefinitions::GeneralView` is created in Package1 with a General View diagram on it. In the Flashlight tutorial the user then opens it from the 'Open an existing Representation' card. Both tutorials start from this card: Flashlight names the project 'Flashlight' on the New project page, while the Batmobile tutorial keeps the default name 'SysMLv2' and then renames the project to 'Batmobile' from the editor's project menu (pointing to the Batmobile template for a larger example).
  - For Grasp: a new project starts with Package1 and a General View on view1; Grasp starts with an empty package 'Model' and no view.
  - Sources: `SysMLv2SemanticDataTemplatesInitializer.java`, `SysONDefaultResourceProvider.java`, `flashlight.adoc`
- **Model type "SysMLv2"** · views / Explorer view (model tree) · SysON · useful · Grasp: partly
  - What it is: This stereotype (id `empty_sysmlv2`) is listed first. It creates a model with the given name and appends ".sysml" when the name does not already end with it (case-insensitive; since 2026.3.0). The new document holds a root Namespace > OwningMembership > Package "Package1".
  - For Grasp: a new SysML model starts as Package1 in a .sysml file; Grasp starts blank with its package named Model and no file name.
  - Sources: `SysMLv2StereotypeProvider.java`, `SysMLv2StereotypeHandler.java`, `SysMLv2NewModelTests.java`
- **Template projects open with a 'view1' General View** · views / Representations: creation, management & views list · SysON · useful · Grasp: partly
  - What it is: when semantic data is created from a SysON template, the initializer takes the root Namespace's first owned member (a Package), reuses a ViewUsage declared 'view1' there or creates one typed StandardViewDefinitions::GeneralView, then creates and persists a General View diagram on it. On the homepage this applies to the 'SysML v2' template (root model with a Package and a General View) and the 'SysML v2-Library' template (root model with a LibraryPackage and a General View); a blank project has no model and no representation.
  - For Grasp: a new project opens with Package1 and a view1 General View ready; Grasp starts blank, and only a loaded model without views gets one general view.
  - Sources: `SysMLv2TemplatesRepresentationInitializer.java`, `SysMLv2TemplatesInitialization.java`, `homepage.adoc`

### Template: Batmobile (example project)

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Template: Batmobile (example project)** · application / Homepage, project browser & project lifecycle · SysON · useful · Grasp: partly
  - What it is: Creates a complete example SysML project with several concepts of each SysML type (Definitions, Usages, relationships): document 'Batmobile.sysml' loaded from the bundled `templates/Batmobile.json` (textual source `templates/Batmobile.sysml`; load time logged as 'Batmobile loaded in Xms'). The model comes from MBSE4U 'dont-panic-batmobile' (Apache-2.0), used in the book "Don't Panic - The Absolute Beginners Guide to SysML v2". Package Batmobile contains part defs Vehicle, Wheel (with boundingBox), BatmobileEngine, Batmobile (:> Vehicle, System, with seat[2], body, wheels[4], four wheel subsets, battery with powerPort, batmobileEngine with conjugated port, interface bat2eng), BatmobileNG, System, HeroAssociation, StandardEngine/XtremeEngine, StandardWheel/XtremeWheel, BatmobileConfigurations and XBatmobile; interface def PowerInterface; port def PowerIP; item defs Power, EngineCommand, Hero, ProductManagement and the individual Batman; part bm1, parts batmobileDesignV23 and systems[*]; action def 'Drive Batmobile' (with guarded transitions); enum def StatusKind (safe, alert); use case def 'Activate rocket booster' and ActivateRocketBooster; requirement def VehicleMaxSpeed and constraint; requirement batmobileSpecification (<REQ42> batmobileMaxSpeed, <REQ43> batmobileAcceleration) satisfied by batmobileDesignV23; concern 'Reduce the number of special parts'; viewpoint 'system components'; view def 'Part list' (filter @SysML::PartUsage) with view batmobileParts (render Views::asElementTable); variation part defs EngineChoices/WheelChoices; and view 'view1' : StandardViewDefinitions::GeneralView with 58 expose statements, on which a General View diagram is created. Offered on the homepage since SysON's first release (v2023.12.0, 'an example of a SysMLv2 model named Batmobile, accessible from the homepage'); updated in 2024.11.0 and again in 2025.4.0 (improved SuccessionAsUsage and TransitionUsage elements, General View can represent 'Drive Batmobile'). Serves as the larger worked example of the Batmobile tutorial.
  - For Grasp: a rich example model to learn from and try every view on; Grasp ships the Stronghold example, not Batmobile.
  - Sources: `SysMLv2SemanticDataTemplatesInitializer.java`, `Batmobile.sysml`, `CHANGELOG.adoc` v2024.11.0, v2025.4.0

### Upload a project page

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Upload a project page** · application / Homepage, project browser & project lifecycle · Sirius Web, experimental · useful · Grasp: partly
  - What it is: Route `/upload/project` (from the Upload project card) uses a narrow centered container: large title 'Upload a project', h4 subtitle 'Start with an existing project', and a paper card holding a multipart form with a file zone ('Click here to select a file', input name `file`, test id `file`) and a left-aligned 'Upload' button (test id `upload-project`) that stays disabled until a file is chosen and shows a loading state. The ZIP goes to the `uploadProject` mutation; on success the new project's editor opens (`/projects/{newId}/edit`). Errors show the server messages or 'An unexpected error has occurred, the file uploaded may be too large'. Only archives produced by Download project (SysON's JSON format) can be uploaded. Viewers without upload rights get 404; the page has no footer. SysON caps uploads at 256 MB (multipart max file and request size). If the server fails to create the project after the archive validated, it returns an error payload with an empty message. On an error payload the button leaves its loading state so the user can retry, but on a transport error or exception (e.g. a file over the size limit) only the toast appears and the button keeps spinning until the page is reloaded. The file zone does not filter by extension, so any file can be picked and is only rejected by the server. The loading indicator was added in 2025.6.0. Tests use it to restore whole projects with diagrams from .zip files. _(Sirius Web; experimental)_
  - For Grasp: bring a downloaded project back with its diagrams; Grasp's Import state reads a saved JSON state in local mode only.
  - Sources: `UploadProjectView.tsx`, `project-management.adoc`, `UploadProject.ts`

### Download (export) a project

**Grasp: partly** · parts: application

SysON feature encompassed (1):

- **Download (export) a project** · application / Homepage, project browser & project lifecycle · Sirius Web, experimental · useful · Grasp: partly
  - What it is: Available from the homepage row menu and the editor project menu ('Download', GetApp icon, only with canDownload; buttons hidden when the capability is denied). The entry is a plain link (`type="application/octet-stream"`, test id `download-link`) to `/api/projects/{projectId}`, with `?name=<editing context name>` when the editor URL names one, so the right editing context is exported. It downloads a ZIP archive of the project's models and representations in SysON's tool-specific JSON format, which can be uploaded again. Offered since the first SysON release. _(Sirius Web; experimental)_
  - For Grasp: download the project as an archive that uploads again; Grasp's Download state does this in local mode only.
  - Sources: `DownloadProjectMenuItem.tsx`, `project-management.adoc`, `CHANGELOG.adoc`

### Layout and view state kept on project import

**Grasp: partly** · parts: diagrams

SysON feature encompassed (1):

- **Layout and view state kept on project import** · diagrams / Diagram: layout, arrangement & edge routing · Sirius Web · useful · Grasp: partly
  - What it is: uploading a project with diagrams restores their layout and unsynchronized nodes (2025.6), keeps each node's view state modifier (hidden, faded, normal) for unsynchronized diagrams (2025.6), preserves label positions (2025.10) and custom edge handle positions (2026.5). Label layout data gained a size in 2025.12, with a migration participant for existing diagrams. _(Sirius Web)_
  - For Grasp: imported projects keep their layout and hidden or faded state; Grasp's state import keeps layout, with no hide or fade to keep.
  - Sources: `CHANGELOG.adoc` v2025.6.0, `CHANGELOG.adoc` v2025.10.0, `CHANGELOG.adoc` v2026.5.0

### Layout persistence (layoutDiagram mutation)

**Grasp: partly** · parts: platform

SysON feature encompassed (1):

- **Layout persistence (layoutDiagram mutation)** · platform / Versioning, migration & data management · Sirius Web · useful · Grasp: partly
  - What it is: every manual layout change (move, resize, label move or resize, bend points, handles, anchors) sends the `layoutDiagram` mutation with the whole layout. The mutation carries: - node layout data: position, size, resizedByUser, movedByUser, handle layout data, minComputedSize - edge layout data: bendingPoints, relativePositionBendingPoints, edgeAnchorLayoutData - label layout data: position, size, flags - an autoLayoutState of UNCHANGED, ACTIVATE or DEACTIVATE
  - For Grasp: every manual move, resize, label move and bend point is kept; Grasp keeps box and view positions but has no resizing, bend points or label positions.
  - Sources: `useSynchronizeLayoutData.ts`, `useSynchronizeLayoutData.types.ts`
