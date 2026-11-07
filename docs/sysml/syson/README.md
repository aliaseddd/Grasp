# SysON map

A map of [eclipse-syson/syson][repo], Eclipse SysON: a web-based SysML v2 modeling tool built on Sirius Web, by Obeo and CEA. Where the [pilot implementation](../pilot-implementation) parses and checks SysML v2 text, SysON edits SysML v2 models in the browser, in diagrams, forms, trees, and tables, and imports and exports the textual notation. The map was drawn from commit [`7e33415`][commit] of November 6, 2026, "[releng] Bump version to 2026.11.0", which is tagged `v2026.11.0`.

[aider](https://aider.chat) drew the maps: for each file, the definitions it would hand a model as context, chosen by how much the rest of the code refers to them. This page adds what the maps can't show: how the modules fit together, and the files aider can't read.

## What's here

| File | What it is |
|---|---|
| [`REPO_MAP.md`](REPO_MAP.md) | aider's map of the whole repository: the 107 files it ranks highest, 39 of them from the metamodel, 13 from the application's configuration, and 12 from the frontend's components. |
| [`projects/`](projects) | A map of each module with code aider can read, 33 in all, at the module's path in the repository. aider ranks each module's files among themselves, so every module gets its own view. [What the maps cover](#what-the-maps-cover) lists them. |
| [`draw-maps.sh`](draw-maps.sh), [`syson.aiderignore`](syson.aiderignore) | Draw all the maps again from a clone. |

## How the code fits together

SysON is a Spring Boot 4.1 application on Java 21, built with Maven, and a React frontend built with Vite, with Sirius Web 2026.11.0 underneath both: Sirius Web stores projects in PostgreSQL, holds each open project as an EMF resource set, sends diagrams, forms, and trees to the browser over GraphQL, and draws them there. SysON adds the SysML v2 metamodel and its semantics, describes the editors with Sirius Web's view builder API, and adds the import, export, and validation. Each module below uses the ones before it, as its `pom.xml` says. The backend's modules sit in five groups under `backend/`: `metamodel`, `services`, `views`, `application`, and `tests`.

**1. The metamodel.** [`syson-sysml-metamodel`](projects/backend/metamodel/syson-sysml-metamodel.md) is the EMF code generated from `src/main/resources/model/sysml.ecore`, whose 182 classifiers (175 classes and 7 enumerations) cover KerML and SysML, under the namespace `http://www.eclipse.org/syson/sysml`: the interfaces in `org.eclipse.syson.sysml` (`Element`, `Namespace`, `Type`, `Feature`, `PartUsage`, and so on), their implementations in `impl`, `SysmlPackage`, and `SysmlFactory`. 136 of its Java files have hand edits marked `@generated NOT`, which compute derived properties such as `Type::endFeature` (in `TypeImpl.getEndFeature`). Its `helper/` package (implicit specializations, memberships, names) is marked deprecated in favour of copies in `syson-sysml-metamodel-services` (step 2), but the metamodel's own classes still use it, because the metamodel depends on no other SysON module, and on nothing from Sirius Web. [`syson-sysml-metamodel-edit`](projects/backend/metamodel/syson-sysml-metamodel-edit.md) is the EMF.Edit layer generated from the same genmodel: an item provider per metaclass, which gives each element its label and icon (about half of its 391 files are icons).

[`syson-siriusweb-customnodes-metamodel`](projects/backend/metamodel/syson-siriusweb-customnodes-metamodel.md) and its [`-edit`](projects/backend/metamodel/syson-siriusweb-customnodes-metamodel-edit.md) extend Sirius Web's diagram description metamodel with four node styles that Sirius Web doesn't draw: `SysMLPackageNodeStyleDescription`, `SysMLImportedPackageNodeStyleDescription`, `SysMLNoteNodeStyleDescription`, and `SysMLViewFrameNodeStyleDescription`. The frontend draws them (step 6).

**2. The semantics and the textual notation.** [`syson-sysml-metamodel-services`](projects/backend/services/syson-sysml-metamodel-services.md) builds on the metamodel with plain EMF, and most of the backend uses it:

- `metamodel/helper/`: the implicit specializations a model implies but doesn't say (`ImplicitSpecializationSwitch`, `ImplicitSpecializationAccumulator`), memberships (`MembershipComputer`), and names (`NameHelper`, `DeresolvingNamespaceProvider`). These are the newer copies of the metamodel's `helper/`, and have drifted from them: `ImplicitSpecializationSwitch` differs in 108 lines.
- `metamodel/services/`: querying and changing elements (`MetamodelQueryElementService`, `MetamodelMutationElementService`, `ElementInitializerSwitch`, `FeatureChainComputer`).
- `metamodel/services/textual/`: `SysMLElementSerializer`, which writes a model as SysML v2 text, with the language's keywords in `SysMLv2Keywords`. The export (step 5) uses it.

**3. The services.** The modules in `backend/services` are the Java services that the editors' descriptions call, in AQL expressions such as `aql:self.getAllReachable(...)`, and that the GraphQL data fetchers use.

- [`syson-services`](projects/backend/services/syson-services.md) is shared by all of them: services for elements, labels, and tools, and the constants and helpers in `util/` (`StandardDiagramsConstants` names the view kinds).
- `syson-direct-edit-grammar` is an ANTLR 4.13.2 grammar, `DirectEdit.g4` (385 lines), for what a user types into a label on a diagram: prefixes such as `abstract` or `in`, a short name and a name, a multiplicity, typing, subsetting, and redefinition, and a value. ANTLR generates the lexer, parser, and listeners into `src/main/java` on every build, and they are committed. `DiagramDirectEditListener` in `syson-services` walks the parse to change the element.
- [`syson-model-services`](projects/backend/services/syson-model-services.md), [`syson-diagram-services`](projects/backend/services/syson-diagram-services.md), [`syson-form-services`](projects/backend/services/syson-form-services.md), [`syson-tree-services`](projects/backend/services/syson-tree-services.md), [`syson-table-services`](projects/backend/services/syson-table-services.md), and [`syson-representation-services`](projects/backend/services/syson-representation-services.md) hold the services for one kind of representation each, or, for the model services, for the model itself.
- [`syson-sysml-rest-api-services`](projects/backend/services/syson-sysml-rest-api-services.md) implements two of Sirius Web's REST service delegates, `SysONObjectRestService` and `SysONProjectDataVersioningRestService`, so that the SysML v2 standard REST API the documentation describes answers with SysML elements, which `SysMLv2JsonSerializer` writes as JSON.

**4. The editors.** The modules in `backend/views` describe the representations with Sirius Web's view builder API, in Java.

- [`syson-standard-diagrams-view`](projects/backend/views/syson-standard-diagrams-view.md) holds the diagrams, one description for each of four of SysML v2's eight standard view kinds: the General View (`SDVDiagramDescriptionProvider`), the Interconnection View, the Action Flow View, and the State Transition View, each with its node and edge descriptions in `nodes/` and `edges/`. A diagram is tied to the standard library's view definitions, such as `StandardViewDefinitions::GeneralView`.
- [`syson-diagram-common-view`](projects/backend/views/syson-diagram-common-view.md) holds what the diagrams share: the node and edge descriptions, the palette's tools (`tools/`, 50 files), and the GraphQL data fetchers they need. [`syson-common-view`](projects/backend/views/syson-common-view.md) holds what every representation shares.
- [`syson-tree-explorer-view`](projects/backend/views/syson-tree-explorer-view.md) is the explorer's tree of models, libraries, and representations, with its context menu and its duplicate action, and [`syson-table-requirements-view`](projects/backend/views/syson-table-requirements-view.md) is a table of requirements.
- [`syson-diagram-tests`](projects/backend/views/syson-diagram-tests.md) is test support for checking diagram descriptions, which `syson-standard-diagrams-view` uses in its tests.

**5. The application.** The modules in `backend/application` put it together.

- [`syson-sysml-import`](projects/backend/application/syson-sysml-import.md) reads SysML v2 text, for an uploaded `.sysml` file and for the `insertTextualSysMLv2` mutation. It doesn't parse the text itself: `SysmlToAst` writes `syside-cli.js`, a 4 MB bundle of the command-line tool of SysIDE 0.9.0, Sensmetry's SysML v2 language server, to a temporary file and runs `node syside-cli.js dump` on the input, which prints the syntax tree as JSON. `ASTTransformer` and the handlers in `parser/` turn that tree into EMF elements, and resolve references with proxies. So the server needs Node on its path to import. It runs SysIDE a second time with `--validate --stdlib none`, to report a syntax error that made the parser stop early. The `createExpression` and `editExpression` mutations parse expressions through SysIDE the same way (`SysideExpressionEditor`).
- [`syson-sysml-export`](projects/backend/application/syson-sysml-export.md) writes a model as a `.sysml` document (`SysMLv2DocumentExporter`, with `SysMLElementSerializer` from step 2).
- [`syson-sysml-validation`](projects/backend/application/syson-sysml-validation.md) checks models: `SysMLValidationRule` is an enumeration of 204 constraints, which its Javadoc calls all the validation rules from the language specification, from `checkAcceptActionUsageReceiverBindingConnector` on. Each is an AQL expression on a metaclass, and `SysONSysMLValidator`, an EMF validator, evaluates them.
- [`syson-application-configuration`](projects/backend/application/syson-application-configuration.md) configures Sirius Web for SysML: the standard library, as 36 KerML and 58 SysML libraries stored as EMF JSON in `kerml.libraries/` and `sysml.libraries/` and loaded into one resource set when the server starts (`SysONDefaultLibrariesConfiguration`); project templates (`sysmlv2/`); publishing a project as a library (`publication/`); the search index (`index/`); migrations of older models (`migration/`, 15 files); the details view; and the GraphQL mutations that change the custom nodes' appearance (`nodes/`).
- [`syson-starter`](projects/backend/application/syson-starter.md) is one Spring configuration, `SysONStarterConfiguration`, and a pom that brings in the rest of the backend. [`syson-application`](projects/backend/application/syson-application.md) is the server: `SysONApplication`, its `application.properties`, and 245 test files. The 119 integration tests extend `AbstractIntegrationTests`, which starts PostgreSQL in Testcontainers. `syson-frontend` has no code: the CI build copies the frontend's `dist/` into its `src/main/resources/static`, so the server's jar serves the frontend.

**6. The frontend.** [`frontend/syson`](projects/frontend/syson.md) is the web page: `src/index.tsx` renders Sirius Web's `SiriusWebApplication` with SysON's extension registry and node types. [`frontend/syson-components`](projects/frontend/syson-components.md), published as `@eclipse-syson/syson-components`, holds what SysON adds to Sirius Web's React components: the four custom nodes in `nodes/` (`package`, `imported_package`, `note`, and `view_frame`), and in `extensions/` an editor for expressions, a tool that rotates nodes, the omnibox's commands, and the navigation bar's menu. The Sirius Web packages it uses are at 2026.11.0, like the backend's.

**7. Tests.** Besides each backend module's unit tests, [`backend/tests/syson-tests`](projects/backend/tests/syson-tests.md) is the shared test support: `GivenSysONServer` and `SysONServerInit` for tests that need a server, and `AbstractCodingRulesTests`, the base class of the modules' tests of rules for the code. Its own tests check rules across the repository, and the form of commit messages (`GitCommitMessageTests`). [`integration-tests-cypress`](projects/integration-tests-cypress.md) and [`integration-tests-playwright`](projects/integration-tests-playwright.md) drive the whole application in a browser. `backend/releng/syson-test-coverage` aggregates the test coverage of every module, and has no code.

**8. Documentation and tooling.** `doc/` is the documentation site, built with Antora: the pages in `doc/content` (176 AsciiDoc files, and 12 Python examples of the REST API in [`doc/content`](projects/doc/content.md)), the site's theme in [`doc/doc-ui`](projects/doc/doc-ui.md), Vale's style rules in `doc/styles`, and four architecture decision records in `doc/adrs`. [`scripts/`](projects/scripts.md) holds the checks that the CI runs: on each pull request, the copyright headers, the changelog, the labels, the milestone, and the TypeScript versions, and in the build, the frontend's dependencies; and tooling for releases and for updating Sirius Web. `docker-compose.yml` runs the published image, `eclipsesyson/syson:v2026.11.0`, with PostgreSQL 15.

## What the maps cover

aider parses each file it can read with tree-sitter, collecting definitions and references. For Java, the definitions are classes, interfaces, and methods, and the references are method calls, `new`, superclasses, and the types after `implements` or `extends`; a type that only appears as a variable's or parameter's type isn't counted as used. aider ranks files with PageRank over those references, shares each file's rank among the definitions it refers to, and fits the best-ranked definitions into the token budget, which it doubles when no files are in the chat. Each file then shows the lines around its chosen definitions. A file named without lines has none of them.

It can read the Java, TypeScript, TSX, JavaScript, and Python files here. It can't read the 21 `.sysml` files (test models and examples), the 94 standard libraries, which are JSON, the 55 SQL scripts that the integration tests load into the database, the GraphQL schemas, the ANTLR grammar, or the AsciiDoc pages. Those appear only by name, and only in maps with room left.

In the frontend, aider counts a React component as a definition only when it is declared with `function` or `class`. Most of SysON's components are arrow functions assigned to a constant, such as `export const SysONIcon = (props) => …`, and aider's TypeScript query doesn't tag those. That is why the map of `frontend/syson` shows its 16 files with no definitions, and the map of `frontend/syson-components` shows mostly the types and interfaces of its props.

`syson.aiderignore` leaves out 683 files, so aider reads 2,886 of the 3,569 files git tracks:

- the 8 files ANTLR generates from `DirectEdit.g4`, including a parser of 2,781 lines;
- two bundles of third-party code: `syside-cli.js` in the import, which otherwise takes a place in the whole-repository map and fills a third of the import's map with SysIDE's internals, and the minified scripts in `doc/doc-ui/src/js/vendor`;
- 672 pictures: 395 screenshots in the documentation, 211 icons in the metamodel's edit modules, and the rest.

It doesn't leave out the generated metamodel, as the pilot implementation's map doesn't: its interfaces are the vocabulary of everything else, and the whole-repository map is mostly made of them. The metamodel's `SysmlPackage.java` alone is 5.5 MB.

Also worth knowing when reading them:

- aider cuts every line at 100 characters, file names included. A long path loses its end, and with it the colon that says lines follow. Most of SysON's paths are longer than that.
- In the metamodel, the lines around a definition are mostly EMF's generated Javadoc.
- Two things that aider's ranking depends on vary from run to run: the order in which Python iterates over sets, and the order in which tree-sitter returns a file's tags. `draw-maps.sh` sets `PYTHONHASHSEED=0` to fix the first. aider's tags cache fixes the second once it has read a clone's files, so runs on the same clone repeat exactly. A fresh clone of the same commit drew 24 of the 34 maps the same. In the other 10, some lines near the edge changed: the whole-repository map showed 103 files instead of 107, and the map of `syson-sysml-metamodel-edit` changed most, 154 of its 956 lines.

The whole repository is drawn with `--map-tokens 8192`, which aider doubles to 16,384 tokens, and each module with `--subtree-only --map-tokens 4096`, which it doubles to 8,192.

A module here is a folder with a `pom.xml` or a `package.json` and no module inside it, so the Maven aggregators (`backend/application`, `backend/services`, and so on) have no map of their own; `scripts/` and `doc/content`, which belong to no module, get one each. Four modules have no map, because they hold no code that aider reads: `syson-direct-edit-grammar` (its only code is the generated parser), `syson-frontend`, `syson-test-coverage`, and `doc/docs-site`.

| Map | Files aider read | Files shown | With definitions |
|---|--:|--:|--:|
| [Whole repository](REPO_MAP.md) | 2,886 | 107 | 107 |
| [`backend/application/syson-application`](projects/backend/application/syson-application.md) | 332 | 55 | 55 |
| [`backend/application/syson-application-configuration`](projects/backend/application/syson-application-configuration.md) | 244 | 61 | 61 |
| [`backend/application/syson-starter`](projects/backend/application/syson-starter.md) | 8 | 8 | 2 |
| [`backend/application/syson-sysml-export`](projects/backend/application/syson-sysml-export.md) | 16 | 16 | 4 |
| [`backend/application/syson-sysml-import`](projects/backend/application/syson-sysml-import.md) | 93 | 26 | 26 |
| [`backend/application/syson-sysml-validation`](projects/backend/application/syson-sysml-validation.md) | 26 | 26 | 12 |
| [`backend/metamodel/syson-siriusweb-customnodes-metamodel`](projects/backend/metamodel/syson-siriusweb-customnodes-metamodel.md) | 31 | 31 | 16 |
| [`backend/metamodel/syson-siriusweb-customnodes-metamodel-edit`](projects/backend/metamodel/syson-siriusweb-customnodes-metamodel-edit.md) | 20 | 20 | 7 |
| [`backend/metamodel/syson-sysml-metamodel`](projects/backend/metamodel/syson-sysml-metamodel.md) | 439 | 58 | 58 |
| [`backend/metamodel/syson-sysml-metamodel-edit`](projects/backend/metamodel/syson-sysml-metamodel-edit.md) | 192 | 42 | 42 |
| [`backend/services/syson-diagram-services`](projects/backend/services/syson-diagram-services.md) | 51 | 29 | 29 |
| [`backend/services/syson-form-services`](projects/backend/services/syson-form-services.md) | 24 | 24 | 11 |
| [`backend/services/syson-model-services`](projects/backend/services/syson-model-services.md) | 21 | 21 | 8 |
| [`backend/services/syson-representation-services`](projects/backend/services/syson-representation-services.md) | 17 | 17 | 4 |
| [`backend/services/syson-services`](projects/backend/services/syson-services.md) | 64 | 38 | 38 |
| [`backend/services/syson-sysml-metamodel-services`](projects/backend/services/syson-sysml-metamodel-services.md) | 62 | 28 | 28 |
| [`backend/services/syson-sysml-rest-api-services`](projects/backend/services/syson-sysml-rest-api-services.md) | 19 | 19 | 6 |
| [`backend/services/syson-table-services`](projects/backend/services/syson-table-services.md) | 17 | 17 | 4 |
| [`backend/services/syson-tree-services`](projects/backend/services/syson-tree-services.md) | 47 | 26 | 26 |
| [`backend/tests/syson-tests`](projects/backend/tests/syson-tests.md) | 19 | 19 | 4 |
| [`backend/views/syson-common-view`](projects/backend/views/syson-common-view.md) | 15 | 15 | 4 |
| [`backend/views/syson-diagram-common-view`](projects/backend/views/syson-diagram-common-view.md) | 158 | 45 | 45 |
| [`backend/views/syson-diagram-tests`](projects/backend/views/syson-diagram-tests.md) | 27 | 27 | 14 |
| [`backend/views/syson-standard-diagrams-view`](projects/backend/views/syson-standard-diagrams-view.md) | 111 | 52 | 52 |
| [`backend/views/syson-table-requirements-view`](projects/backend/views/syson-table-requirements-view.md) | 20 | 20 | 10 |
| [`backend/views/syson-tree-explorer-view`](projects/backend/views/syson-tree-explorer-view.md) | 38 | 38 | 26 |
| [`doc/content`](projects/doc/content.md) | 201 | 201 | 12 |
| [`doc/doc-ui`](projects/doc/doc-ui.md) | 91 | 91 | 26 |
| [`frontend/syson`](projects/frontend/syson.md) | 16 | 16 | 0 |
| [`frontend/syson-components`](projects/frontend/syson-components.md) | 99 | 52 | 52 |
| [`integration-tests-cypress`](projects/integration-tests-cypress.md) | 43 | 43 | 17 |
| [`integration-tests-playwright`](projects/integration-tests-playwright.md) | 22 | 22 | 9 |
| [`scripts`](projects/scripts.md) | 11 | 11 | 1 |

## How they were drawn

On November 7, 2026, in a Linux container, with aider 0.86.2, the latest release on PyPI, which needs Python 3.10 to 3.12:

```sh
uv tool install --python 3.12 aider-chat==0.86.2
```

`draw-maps.sh` runs this from the clone's root, and again from each module's folder with `--subtree-only --map-tokens 4096`:

```sh
PYTHONHASHSEED=0 COLUMNS=160 aider --show-repo-map --map-tokens 8192 --aiderignore syson.aiderignore \
  --no-pretty --yes-always --no-check-update --no-analytics --no-show-model-warnings --no-gitignore --model gpt-4o
```

aider needs a model name to start, and counts tokens with that model's tokenizer, but drawing a map makes no API call. `--no-gitignore` keeps it from adding its own files to the clone's `.gitignore`. A run takes about three minutes.

To draw the maps again, from this repository's root:

```sh
git clone --filter=blob:none https://github.com/eclipse-syson/syson.git /tmp/syson
git -C /tmp/syson checkout v2026.11.0
docs/sysml/syson/draw-maps.sh /tmp/syson
```

At that commit, with aider 0.86.2, the maps come out the same or differ only near their edges, as [What the maps cover](#what-the-maps-cover) says, and the date in their headers changes. At a later commit, the maps follow the code, but this page has to be checked by hand.

## What was checked, and what wasn't

- The maps are aider's output with only its opening lines taken off: its version and settings, its warning about large repositories, and the lines that introduce a map to a model.
- Two runs of `draw-maps.sh` on the same clone drew identical maps. A run on a fresh clone of the same commit drew 24 of the 34 maps the same, and 10 with some lines changed near their edges.
- Every statement on this page about the code was checked against the repository at commit `7e33415`: the poms and `package.json` files, the build workflow, `sysml.ecore` and its genmodel, and the classes it names.
- SysON wasn't built or run here, and its tests weren't run.

[repo]: https://github.com/eclipse-syson/syson
[commit]: https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858
