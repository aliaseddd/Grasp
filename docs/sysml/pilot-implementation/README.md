# SysML v2 Pilot Implementation map

A map of [Systems-Modeling/SysML-v2-Pilot-Implementation][repo], the open-source pilot implementation of KerML and SysML v2. It holds the parsers, the semantics, the Eclipse editors, and the Jupyter kernel whose release build `../check.sh` runs to check SysML files, the canvas's export among them ([`../README.md`](../README.md)). The map was drawn from master at commit [`378a870`][commit] of November 4, 2026: version 0.64.0-SNAPSHOT, which comes after the release tagged `2026-09.1`.

[aider](https://aider.chat) drew the maps: for each file, the definitions it would hand a model as context, chosen by how much the rest of the code refers to them. This page adds what the maps can't show: how the projects fit together, and the files aider can't read.

## What's here

| File | What it is |
|---|---|
| [`REPO_MAP.md`](REPO_MAP.md) | aider's map of the whole repository: the 122 files it ranks highest, 65 of them from the metamodel and 32 from the semantics. |
| [`projects/`](projects) | A map of each project with code aider can read, 22 in all. aider ranks each project's files among themselves, so every project gets its own view. [What the maps cover](#what-the-maps-cover) lists them. |
| [`draw-maps.sh`](draw-maps.sh), [`pilot.aiderignore`](pilot.aiderignore) | Draw all the maps again from a clone. |

## How the code fits together

The repository is a set of Eclipse plug-in projects that Maven and Tycho build together, on Java 21. Each layer below uses the ones before it, as each project's `META-INF/MANIFEST.MF` or `pom.xml` says.

**1. The metamodel.** [`org.omg.sysml.model`](projects/org.omg.sysml.model.md) is the EMF code generated from `SysML.ecore`, whose 182 classifiers cover KerML and SysML: the interfaces in `org.omg.sysml.lang.sysml` (`Element`, `Namespace`, `Type`, `Feature`, `PartUsage`, and so on), their implementations in `impl`, `SysMLPackage`, and `SysMLFactory`. 23 of its files have hand edits, marked `@generated NOT`. `org.omg.sysml.model.bundle` wraps its jar as a plug-in. EMF imported `SysML.ecore` from the UML model `SysML.uml`; both, with the genmodel, are in `org.omg.sysml/model`, and the QVTo transforms that prepare the metamodel are in `org.omg.sysml/transforms`.

**2. The semantics.** [`org.omg.sysml.logic`](projects/org.omg.sysml.logic.md) computes what the metamodel leaves derived, with plain EMF and no Xtext.

- 287 setting delegates each compute one derived property: `Type_endFeature_SettingDelegate` computes `Type::endFeature`. 115 invocation delegates do the same for operations, such as `Expression::evaluate`. The 400 `http://www.omg.org/spec/SysML` annotations in `SysML.ecore` tie them to the model, and `SysMLLogicStandaloneSetup` registers them with EMF.
- 123 adapters, one per metaclass, work out what a model implies but doesn't say, such as each element's default supertype (`TypeAdapter.computeImplicitGeneralTypes`, `ImplicitGeneralizationMap`). `ElementUtil.transformAll` runs them.
- `expressions` evaluates expressions in a model, and `util` holds the helpers the rest of the code calls (`ElementUtil`, `TypeUtil`, `FeatureUtil`, and so on).

`org.omg.sysml.logic.bundle` wraps its jar as a plug-in.

**3. The shared plug-in.** [`org.omg.sysml`](projects/org.omg.sysml.md) registers the EMF package and holds what the language projects share: `SysMLUtil` (`io/`), the base class for reading model files into an EMF resource set, which `SysMLInteractive` and the converters extend; a client for the SysML v2 API (`util/repository`, `lib/sysml-v2-api-client-all.jar`) and the traversal that publishes models to it (`util/traversal`); JSON schemas (`json-schema/`); and Xtend generators that write the standard library's reflective `KerML` and `SysML` packages from the UML metamodel (`generation/`).

**4. The languages.** Three Xtext grammars define the textual notation: [`KerMLExpressions.xtext`][expressions] (577 lines), the expressions both languages share, and [`KerML.xtext`][kerml] (1,123 lines) and [`SysML.xtext`][sysml] (2,438 lines), which both extend it. Xtext generates a parser from each into `src-gen/`. The SysML parser is so big that a generator fragment, `InternalParserSplitterFragment`, splits it into 29 classes. The rest of [`org.omg.kerml.xtext`](projects/org.omg.kerml.xtext.md) and [`org.omg.sysml.xtext`](projects/org.omg.sysml.xtext.md) is written by hand:

- `scoping/`: name resolution, in Xtend (`KerMLScopeProvider`, `KerMLGlobalScopeProvider`), and the linker. Once Xtext has linked a file, `KerMLLinker` runs a post-processor on each element (`postprocessing/`, a class per metaclass).
- `library/`: finds the standard library's elements, with the help of the index in `sysml.library/.index.json`.
- `validation/`: `KerMLResourceValidator` runs the adapters' transforms over a file before checking it, and the checks are in `KerMLValidator.xtend` and `SysMLValidator.xtend`.
- `util/`: conversion to JSON and XMI, and loading from and saving to an API repository.

The `.ide` projects add content assist, and the `.ui` projects ([KerML](projects/org.omg.kerml.xtext.ui.md), [SysML](projects/org.omg.sysml.xtext.ui.md)) are the Eclipse editors.

**5. Running models outside Eclipse.** [`org.omg.sysml.interactive`](projects/org.omg.sysml.interactive.md) is the engine behind the Jupyter kernel. `SysMLInteractive.loadLibrary` reads the standard library, and `process` parses a piece of SysML into a new resource, validates it with every check, and keeps it if it has no errors. Its other methods (`eval`, `show`, `publish`, `viz`, and so on) carry out the kernel's commands. `SysMLInteractiveLibraryIndexGenerator` writes `sysml.library/.index.json`; the Maven build runs it, and the CI build fails if the committed index is out of date.

- [`org.omg.sysml.execution`](projects/org.omg.sysml.execution.md) adds library functions (sequence, string, numerical, trigonometric, and so on) to the expression evaluator in `logic`, for `SysMLInteractive` and `SysML2PlantUMLText`.
- [`org.omg.sysml.plantuml`](projects/org.omg.sysml.plantuml.md) turns a model into PlantUML text for `%viz` (`SysML2PlantUMLText` and its `V*` visitors).
- [`org.omg.sysml.jupyter.kernel`](projects/org.omg.sysml.jupyter.kernel.md) is the kernel: `SysMLKernel`, on jupyter-jvm-basekernel 2.3.0, with a class per magic command in `magic/`: `%eval`, `%export`, `%help`, `%list`, `%load`, `%projects`, `%publish`, `%repo`, `%show`, `%view`, and `%viz`.
- [`org.omg.sysml.jupyter.jupyterlab`](projects/org.omg.sysml.jupyter.jupyterlab.md) highlights SysML in JupyterLab, and [`org.omg.sysml.jupyter.installer`](projects/org.omg.sysml.jupyter.installer.md) packages the installer (`install.sh`, `install.bat`, `install.py`).

**6. Eclipse.** Besides the `.ui` editors, [`org.omg.sysml.edit`](projects/org.omg.sysml.edit.md) and [`org.omg.sysml.editor`](projects/org.omg.sysml.editor.md) are the tree editor EMF generates for a metamodel, and [`org.omg.sysml.plantuml.eclipse`](projects/org.omg.sysml.plantuml.eclipse.md) gives diagrams to the PlantUML plug-in's view. `org.omg.sysml.feature`, `org.omg.sysml.editor.feature`, `org.omg.sysml.plantuml.feature`, `org.omg.sysml.site` (the update site), `org.omg.sysml.target` (the target platform), and `org.omg.sysml.installer` (the Oomph setup) package them.

**7. Tests.** [`org.omg.kerml.xpect.tests`](projects/org.omg.kerml.xpect.tests.md) and [`org.omg.sysml.xpect.tests`](projects/org.omg.sysml.xpect.tests.md) hold Xpect tests: `.xt` files of KerML or SysML with expectations about parsing, imports, linking, scoping, and validation, which JUnit runs. The build runs them unless `xpect.tests.skip` is set. [`org.omg.sysml.interactive.tests`](projects/org.omg.sysml.interactive.tests.md) tests through `SysMLInteractive`, and `org.omg.sysml.logic` has 13 test files in `src/test`.

**8. Models.** `sysml.library` is the standard library: 36 KerML files in `Kernel Libraries`, and 58 SysML files in `Systems Library` and `Domain Libraries`. `sysml/src` holds example, training, and validation models, and `kerml/src` holds KerML examples.

**9. Outside the Maven build.** [`org.omg.kerml.owl`](projects/org.omg.kerml.owl.md), with its `.ide` and `.ui`, is an Xtext grammar for OWL and a QVTo transform from SysML to it. [`org.omg.sysml.uml.ecore.importer`](projects/org.omg.sysml.uml.ecore.importer.md) is EMF's UML importer, customized for SysML. [`tool-support`](projects/tool-support.md) holds Python tools: `bnf_grammar_tools` extracts the grammars from the specifications' HTML, `quantities_lib_generator` generates the ISO/IEC 80000 quantities and units libraries, and `syntax-highlighting` generates highlighting for VS Code, JetBrains IDEs, and Jupyter from the grammars.

## What the maps cover

aider parses each file it can read with tree-sitter, collecting definitions and references. For Java, the definitions are classes, interfaces, and methods, and the references are method calls, `new`, superclasses, and the types after `implements` or `extends`; a type that only appears as a variable's or parameter's type isn't counted as used. aider ranks files with PageRank over those references, shares each file's rank among the definitions it refers to, and fits the best-ranked definitions into the token budget, which it doubles when no files are in the chat. Each file then shows the lines around its chosen definitions. A file named without lines has none of them.

It can read the Java, Python, TypeScript, JavaScript, and `.properties` files here. It can't read Xtend (88 files, including the scope providers, the validators, and the Xtext modules), the four `.xtext` grammars, the 194 `.kerml` and 387 `.sysml` files, the 432 Xpect `.xt` tests, the 8 QVTo transforms, or the 4 MWE2 workflows. Those appear only by name, and only in maps with room left.

`pilot.aiderignore` leaves out the 314 files Xtext generates into `src-gen/` and 1,313 pictures, most of them icons for the EMF editor, so aider reads 3,064 of the 4,691 files git tracks. Without it, the whole-repository map shows 19 generated files in place of 15 hand-written ones such as `SysML2PlantUMLText`, `SysMLFactory`, and `SysMLLibraryUtil`; 15 of the 19 are classes generated for the OWL grammar.

Also worth knowing when reading them:

- aider cuts every line at 100 characters, file names included. A long path loses its end, and with it the colon that says lines follow.
- In the metamodel, the lines around a definition are mostly EMF's generated Javadoc.
- Two things that aider's ranking depends on vary from run to run: the order in which Python iterates over sets, and the order in which tree-sitter returns a file's tags. `draw-maps.sh` sets `PYTHONHASHSEED=0` to fix the first; without it, two runs on the same clone drew the metamodel's map with 72 files and with 57. aider's tags cache fixes the second once it has read a clone's files, so runs on the same clone repeat exactly. A fresh clone of the same commit drew 19 of the 23 maps the same. In the other 4, some lines near the edge changed, and the `org.omg.sysml.logic` map showed 47 files instead of 46.

The whole repository is drawn with `--map-tokens 8192`, which aider doubles to 16,384 tokens, and each project with `--subtree-only --map-tokens 4096`, which it doubles to 8,192.

| Map | Files aider read | Files shown | With definitions |
|---|--:|--:|--:|
| [Whole repository](REPO_MAP.md) | 3,064 | 122 | 122 |
| [`org.omg.kerml.owl`](projects/org.omg.kerml.owl.md) | 28 | 28 | 2 |
| [`org.omg.kerml.xpect.tests`](projects/org.omg.kerml.xpect.tests.md) | 394 | 232 | 16 |
| [`org.omg.kerml.xtext`](projects/org.omg.kerml.xtext.md) | 91 | 54 | 54 |
| [`org.omg.kerml.xtext.ui`](projects/org.omg.kerml.xtext.ui.md) | 25 | 25 | 3 |
| [`org.omg.sysml`](projects/org.omg.sysml.md) | 76 | 20 | 20 |
| [`org.omg.sysml.edit`](projects/org.omg.sysml.edit.md) | 188 | 44 | 44 |
| [`org.omg.sysml.editor`](projects/org.omg.sysml.editor.md) | 13 | 13 | 6 |
| [`org.omg.sysml.execution`](projects/org.omg.sysml.execution.md) | 54 | 54 | 47 |
| [`org.omg.sysml.interactive`](projects/org.omg.sysml.interactive.md) | 23 | 23 | 9 |
| [`org.omg.sysml.interactive.tests`](projects/org.omg.sysml.interactive.tests.md) | 31 | 18 | 18 |
| [`org.omg.sysml.jupyter.installer`](projects/org.omg.sysml.jupyter.installer.md) | 13 | 13 | 0 |
| [`org.omg.sysml.jupyter.jupyterlab`](projects/org.omg.sysml.jupyter.jupyterlab.md) | 13 | 13 | 1 |
| [`org.omg.sysml.jupyter.kernel`](projects/org.omg.sysml.jupyter.kernel.md) | 32 | 32 | 16 |
| [`org.omg.sysml.logic`](projects/org.omg.sysml.logic.md) | 617 | 46 | 46 |
| [`org.omg.sysml.model`](projects/org.omg.sysml.model.md) | 376 | 57 | 57 |
| [`org.omg.sysml.plantuml`](projects/org.omg.sysml.plantuml.md) | 35 | 16 | 16 |
| [`org.omg.sysml.plantuml.eclipse`](projects/org.omg.sysml.plantuml.eclipse.md) | 11 | 11 | 4 |
| [`org.omg.sysml.uml.ecore.importer`](projects/org.omg.sysml.uml.ecore.importer.md) | 16 | 16 | 9 |
| [`org.omg.sysml.xpect.tests`](projects/org.omg.sysml.xpect.tests.md) | 244 | 244 | 10 |
| [`org.omg.sysml.xtext`](projects/org.omg.sysml.xtext.md) | 65 | 65 | 25 |
| [`org.omg.sysml.xtext.ui`](projects/org.omg.sysml.xtext.ui.md) | 23 | 23 | 4 |
| [`tool-support`](projects/tool-support.md) | 94 | 94 | 8 |

The other 21 top-level folders have no map, because they hold no Java, Python, TypeScript, or JavaScript outside `src-gen/`: `org.omg.kerml.expressions.xtext` and its `.ide` and `.ui`; `org.omg.kerml.xtext.ide` and `org.omg.sysml.xtext.ide`; `org.omg.kerml.owl.ide` and `.ui`; the two `.bundle` wrappers; the three features, the site, the target, and the installer; `sysml.library`, `sysml`, and `kerml`; and `.github`, `.mvn`, and `.settings`.

## How they were drawn

On November 5, 2026, in a Linux container, with aider 0.86.2, the latest release on PyPI, which needs Python 3.10 to 3.12:

```sh
uv tool install --python 3.12 aider-chat==0.86.2
```

`draw-maps.sh` runs this from the clone's root, and again from each project's folder with `--subtree-only --map-tokens 4096`:

```sh
PYTHONHASHSEED=0 COLUMNS=160 aider --show-repo-map --map-tokens 8192 --aiderignore pilot.aiderignore \
  --no-pretty --yes-always --no-check-update --no-analytics --no-show-model-warnings --no-gitignore --model gpt-4o
```

aider needs a model name to start, and counts tokens with that model's tokenizer, but drawing a map makes no API call. `--no-gitignore` keeps it from adding its own files to the clone's `.gitignore`. This repository's own map, [`docs/REPO_MAP.md`](../../REPO_MAP.md), was drawn with a build of aider's main branch, 0.86.3.dev. For the repo map, main differs from 0.86.2 only in also reading shell scripts.

To draw the maps again, from this repository's root:

```sh
git clone --filter=blob:none https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation.git /tmp/pilot
git -C /tmp/pilot checkout 378a8700c0bc5dfc08a97a5bb637f61dd8cfed02
docs/sysml/pilot-implementation/draw-maps.sh /tmp/pilot
```

At that commit, with aider 0.86.2, the maps come out the same or differ only near their edges, as [What the maps cover](#what-the-maps-cover) says, and the date in their headers changes. At a later commit, the maps follow the code, but this page has to be checked by hand.

## What was checked, and what wasn't

- The maps are aider's output with only its opening lines taken off: its version and settings, its warning about large repositories, and the lines that introduce a map to a model. A new run of aider on the same clone, compared line by line with `REPO_MAP.md`, gives the same text.
- Two runs of `draw-maps.sh` on the same clone drew identical maps. A run on a fresh clone of the same commit, following the steps above, drew 19 of the 23 maps the same, and 4 with some lines changed near their edges.
- Every statement on this page about the code was checked against the repository at commit `378a870`: the manifests, poms, and `plugin.xml` files, the build workflow, and the classes it names.
- The pilot implementation wasn't built or run here, and its tests weren't run.

[repo]: https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation
[commit]: https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02
[expressions]: https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/blob/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.kerml.expressions.xtext/src/org/omg/kerml/expressions/xtext/KerMLExpressions.xtext
[kerml]: https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/blob/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.kerml.xtext/src/org/omg/kerml/xtext/KerML.xtext
[sysml]: https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/blob/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.xtext/src/org/omg/sysml/xtext/SysML.xtext
