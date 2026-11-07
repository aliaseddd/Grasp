# SysON feature inventory

Everything [Eclipse SysON][syson] offers at v2026.11.0, the release [the SysON map](../README.md) was drawn from: its user interface, the workflows through it, and the backend functions behind them, 3,294 features in all. It includes what SysON gets from [Sirius Web][sirius-web] v2026.11.0, the platform it runs on, because that is most of what a SysON user sees: the project browser, the workbench and its views, the explorer, the details view, the diagram editor and its palette, the omnibox, and the tables. It was drawn up to decide what to bring into the canvas, so nothing is left out for being minor, obvious, already in the canvas, or hard to do in a browser.

## How to read it

Each bullet is one feature: its name in bold, then what it does, where it is and how it's started, its options, defaults, and limits, and at the end the files it was read from. The seven parts below go from the application and its projects, through its views, diagrams, SysML notation, and other representations, to the model's services and the platform; within an area, the headings go from what's on screen to what happens behind it. An area ends with "Removed or replaced" when SysON or Sirius Web took something out.

Untagged features, 1,666 of them, are SysON's own. A tag in italics says where any other feature comes from:

| Tag | Features | Meaning |
|---|--:|---|
| _(Sirius Web)_ | 1,147 | Sirius Web's, and a SysON user has it. |
| _(Sirius Web, studio)_ | 416 | Sirius Web's, but there only for someone who writes their own domain and representation descriptions, in a Sirius Web studio or in code: the studio itself, and the Deck, Gantt, and Portal representations, which only such descriptions create. Sirius Web turns studios on only when `sirius.web.enabled` lists `studio` or `*`, and SysON sets neither, so a SysON user doesn't see these. |
| _(Sirius Web, unclear in SysON)_ | 65 | Sirius Web's, and the sources don't show whether SysON exposes it. |

_(experimental)_ and _(deprecated)_ follow SysON's and Sirius Web's own markings. Sources are file names in SysON's repository or Sirius Web's, and `CHANGELOG.adoc` with a version is that release's entry. Where the documentation and the code disagree, the bullet says what the code does and notes the difference.

## How it was made

- 32 agents read the two repositories at those tags, a slice each. SysON's slices were its user manual, release notes, changelog, developer and installation guides, frontend, diagram descriptions, explorer, table, and details view, semantics and direct-edit grammar, application configuration, import, export, validation, and REST API, and its tests. Sirius Web's were its user manual, studio-maker guide, changelog, GraphQL schemas, backend application, end-to-end tests, and frontend packages. Each agent logged every feature its slice showed, with the files as evidence. A second agent per slice then checked each record against those files, dropped what didn't hold, fixed what was wrong, and added what the first had missed. That made 4,807 records.
- For each group of areas, an agent merged the records that described the same feature. Then three more agents in turn looked for what was still missing, each a different way: in what the merge had folded, and in the UI's label files; in the code and the GraphQL schemas; and in the documentation, tests, and changelogs. A fourth looked again where the third still found ten or more.
- SysON wasn't built or run, so nothing here was seen on screen: every feature comes from the code and the documentation.

[syson]: https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858
[sirius-web]: https://github.com/eclipse-sirius/sirius-web/tree/113288de7704b4e32a87855e7dff19c598041adb

## Contents

### [Application, projects, and workbench](application.md) (345)

- [App shell, navigation, theming & notifications](application.md#app-shell-navigation-theming--notifications) (52)
- [Homepage, project browser & project lifecycle](application.md#homepage-project-browser--project-lifecycle) (83)
- [Project settings & customization](application.md#project-settings--customization) (23)
- [Workbench layout & panels](application.md#workbench-layout--panels) (73)
- [Omnibox, commands & keyboard shortcuts](application.md#omnibox-commands--keyboard-shortcuts) (51)
- [Collaboration, undo/redo & change safety](application.md#collaboration-undoredo--change-safety) (63)

### [Explorer, details, and other views](views.md) (470)

- [Explorer view (model tree)](views.md#explorer-view-model-tree) (178)
- [Details view & property forms](views.md#details-view--property-forms) (173)
- [Representations: creation, management & views list](views.md#representations-creation-management--views-list) (76)
- [Related elements, query & search views](views.md#related-elements-query--search-views) (43)

### [Diagrams](diagrams.md) (639)

- [Diagram: viewport & navigation](diagrams.md#diagram-viewport--navigation) (33)
- [Diagram: selection, editing & direct manipulation](diagrams.md#diagram-selection-editing--direct-manipulation) (142)
- [Diagram: layout, arrangement & edge routing](diagrams.md#diagram-layout-arrangement--edge-routing) (114)
- [Diagram: visibility, filtering & presentation](diagrams.md#diagram-visibility-filtering--presentation) (84)
- [Diagram: palette & tool UI](diagrams.md#diagram-palette--tool-ui) (151)
- [Diagram: appearance & styling](diagrams.md#diagram-appearance--styling) (99)
- [Diagram: export & image](diagrams.md#diagram-export--image) (16)

### [SysML views and notation](sysml-views.md) (538)

- [SysML General View](sysml-views.md#sysml-general-view) (214)
- [SysML Interconnection View](sysml-views.md#sysml-interconnection-view) (49)
- [SysML Action Flow View](sysml-views.md#sysml-action-flow-view) (48)
- [SysML State Transition View](sysml-views.md#sysml-state-transition-view) (20)
- [SysML diagram custom nodes & annotations](sysml-views.md#sysml-diagram-custom-nodes--annotations) (45)
- [Direct edit & label syntax](sysml-views.md#direct-edit--label-syntax) (113)
- [Expressions](sysml-views.md#expressions) (49)

### [Tables, trees, and other representations](representations.md) (511)

- [Requirements & tables](representations.md#requirements--tables) (137)
- [Tree representations](representations.md#tree-representations) (35)
- [Other representations: deck, gantt, portal, charts, forms](representations.md#other-representations-deck-gantt-portal-charts-forms) (103)
- [Studio: language & representation authoring](representations.md#studio-language--representation-authoring) (236)

### [Model, text, validation, and libraries](model.md) (487)

- [Validation & model checks](model.md#validation--model-checks) (53)
- [Textual SysML v2: import, export & insert](model.md#textual-sysml-v2-import-export--insert) (144)
- [Libraries, standard library & publication](model.md#libraries-standard-library--publication) (90)
- [Model semantics & editing services](model.md#model-semantics--editing-services) (200)

### [APIs, data, and administration](platform.md) (304)

- [APIs & integrations](platform.md#apis--integrations) (108)
- [Versioning, migration & data management](platform.md#versioning-migration--data-management) (57)
- [Administration, deployment, security & performance](platform.md#administration-deployment-security--performance) (139)
