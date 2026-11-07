# The metamodel

The canvas's kinds stand on the SysML v2 metamodel: what each kind of element is, what it may contain, and its fields. This folder holds that metamodel as the SysML v2 Pilot Implementation defines it, and the script that turns it into the kind lists the canvas reads.

| File | What it is |
|---|---|
| `SysML.ecore` | The metamodel, as the pilot implementation's EMF code is generated from it: 182 classifiers, 175 classes and 7 enumerations, with their 415 features. Copied unchanged. |
| `LICENSE` | The license `SysML.ecore` is under, the Eclipse Public License 2.0, copied unchanged from the same release. |
| `generate.mjs` | Writes `../src/core/lib/metamodel.js`, the kind lists, from `SysML.ecore`. Node, no dependencies. |

## Where it comes from

`org.omg.sysml/model/SysML.ecore` of [Systems-Modeling/SysML-v2-Pilot-Implementation](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation), at the release tagged `2026-09.1`: commit [`d81b2ad`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/d81b2ad5016f2e2d3d4364b3d06d01d8bb12a896) of October 28, 2026, where `org.omg.sysml` is version 0.63.1. The metamodel names itself `https://www.omg.org/spec/SysML/20250201`. The file's SHA-256 is `dd3960e0a0031d074adb01162d9b7ec6551b2e7aa1d92b26b6f7a0ea45b464d6`.

It is that release because `canvas/check.sh` validates the export with the same release's Jupyter kernel, 0.63.1, so the kinds the canvas knows and the validator that checks its text agree.

## Its license

`SysML.ecore` carries no notice of its own, so the pilot implementation's license covers it: the Eclipse Public License 2.0, the `LICENSE` beside it. The kind lists are generated from its contents, so `src/core/lib/metamodel.js`, and the built `canvas/index.html` that holds them, carry them too.

On November 7, 2026, Damon decided to use it now and settle the licensing later. What the license asks, and the ways it could be settled, are in `plan/notes.md` (session 6). Until then, the license's text stays beside the file, and the lists name their source and its license in their header.

## The kind lists

`node canvas/metamodel/generate.mjs` checks that `SysML.ecore` is the file above, by its SHA-256, and writes `src/core/lib/metamodel.js`, the model library's first script. It holds `METAMODEL`: every classifier by name, in the ecore's order.

- A class has `general`, its direct supertypes; `abstract`, when it is; `owns`, what an element of it may contain; and `fields`, every other feature it declares. It has the features of its supertypes too, which the lists don't repeat.
- What an element may contain is the features through which it owns other elements and relationships: a containment, `Element::ownedElement` or `Namespace::ownedMember`, or a feature that subsets or redefines one of those, directly or through others. A part def's `ownedPart` subsets `ownedItem`, which subsets `ownedOccurrence`, `ownedUsage`, `Type::ownedFeature`, and so `Namespace::ownedMember`. 130 features are of that kind.
- Its fields are the other 285: its attributes (`declaredName`, `isAbstract`, `direction`) and its references to elements it doesn't own (`FeatureTyping::type`, `Usage::definition`).
- A feature has its name; its type, a classifier of the lists or `Boolean`, `String`, `Integer` or `Real`; its bounds, when they aren't 0..1; its default; `derived`, when it is computed from others; and what it subsets and redefines, as `Class::name`.
- An enumeration has its literals.

The ecore's documentation, its operations, and EMF's own settings (ordered, unique, volatile, opposites) are left out. The lists are frozen in the page: nothing changes them.

Running the generator again on the same file writes the same bytes. `node canvas/metamodel/generate.mjs --check` writes nothing and fails when the lists aren't what the file generates; `test/metamodel.test.mjs` runs it, and reads the ecore a second way to check the lists against it. After generating, run `node canvas/build.mjs` to put the lists in the page, and commit both.

## Moving to another release

1. Replace `SysML.ecore` and `LICENSE` with the new release's, and change `SOURCE` in `generate.mjs` to name it: the tag, the commit, the version, the SHA-256.
2. Run `node canvas/metamodel/generate.mjs` and `node canvas/build.mjs`.
3. Run the tests. Where the new metamodel renames or drops a class a kind stands on, or changes what one may contain or which fields it has, the library refuses to load, or `test/metamodel.test.mjs` says which kind and what.

Move `canvas/check.sh` to the same release's kernel at the same time, so the kinds and the validator keep agreeing.
