// Generates the kind lists the canvas's kinds stand on, from the metamodel of the SysML v2 Pilot Implementation:
// SysML.ecore, in this folder, in; src/core/lib/metamodel.js, the model library's first script, out. No dependencies.
//
//   node canvas/metamodel/generate.mjs           # writes src/core/lib/metamodel.js
//   node canvas/metamodel/generate.mjs --check   # writes nothing; fails when that file isn't what the ecore generates
//
// Then node canvas/build.mjs puts the lists in the page. Running it again on the same ecore writes the same bytes.
//
// For each of the ecore's classifiers, in the ecore's order, it writes: for a class, its direct supertypes (general),
// whether it is abstract, what an element of it may contain (owns) and its fields (fields); for an enumeration, its
// literals. What an element may contain is the features through which it owns other elements and relationships: a
// containment, Element::ownedElement or Namespace::ownedMember, or a feature that subsets or redefines one of those,
// directly or through others (Definition::ownedPart subsets ownedItem, which subsets ownedOccurrence, ownedUsage,
// Type::ownedFeature and so Namespace::ownedMember). Its fields are every other feature it declares: its attributes,
// and its references to elements it doesn't own. A class lists only the features it declares; it has those of its
// supertypes too. Each feature has its name, its type (a classifier's name, or Boolean, String, Integer, Real), its
// bounds when they aren't 0..1, its default, whether it is derived, and what it subsets and redefines, as Class::name.
// The ecore's documentation, its operations, and EMF's own settings (ordered, unique, volatile, opposites) are left
// out.
//
// The ecore is the file SOURCE names, checked by its SHA-256 before anything is read. To move to another release,
// replace SysML.ecore and LICENSE with that release's, change SOURCE, and run this; then run the tests, which say
// what the new lists change for the canvas's kinds.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ECORE = path.join(here, 'SysML.ecore');
export const OUT = path.join(here, '..', 'src', 'core', 'lib', 'metamodel.js');

// Where SysML.ecore comes from: the release of the pilot implementation whose Jupyter kernel canvas/check.sh
// validates the export with.
export const SOURCE = {
  repository: 'https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation',
  path: 'org.omg.sysml/model/SysML.ecore',
  release: '2026-09.1',
  commit: 'd81b2ad5016f2e2d3d4364b3d06d01d8bb12a896',
  version: '0.63.1',
  sha256: 'dd3960e0a0031d074adb01162d9b7ec6551b2e7aa1d92b26b6f7a0ea45b464d6',
  license: 'the Eclipse Public License 2.0 (EPL-2.0)',
};

// The XML an ecore is written in, read as elements with their attributes: { name, attrs, children }. Comments, the
// declaration and the text between elements are skipped. What it can't read, it refuses rather than guesses: markup
// it doesn't recognize, a tag left open, an end tag that doesn't match, an entity it doesn't know.
const ENTITIES = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
function entities(value) {
  return value.replace(/&([^;\s]*);/g, (whole, name) => {
    if (ENTITIES[name] !== undefined) return ENTITIES[name];
    const m = /^#(?:x([0-9a-fA-F]+)|([0-9]+))$/.exec(name);
    if (!m) throw new Error(`an entity the generator doesn't know: ${whole}`);
    return String.fromCodePoint(m[1] ? parseInt(m[1], 16) : parseInt(m[2], 10));
  });
}
export function readXml(text) {
  const top = { name: null, attrs: {}, children: [] };
  const open = [top];
  const tag = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g;
  let end = 0;
  const unread = (from, to) => {
    const at = text.slice(from, to).indexOf('<');
    if (at >= 0) throw new Error(`markup the generator can't read at character ${from + at}: ${text.slice(from + at, from + at + 40)}`);
  };
  for (const m of text.matchAll(tag)) {
    unread(end, m.index);
    end = m.index + m[0].length;
    if (!m[2]) continue;
    if (m[1]) {
      const closed = open.pop();
      if (closed === top || closed.name !== m[2]) throw new Error(`</${m[2]}> closes ${closed === top ? 'nothing' : '<' + closed.name + '>'}.`);
      continue;
    }
    const attrs = {};
    for (const a of m[3].matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attrs[a[1]] = entities(a[2] !== undefined ? a[2] : a[3]);
    const element = { name: m[2], attrs, children: [] };
    open[open.length - 1].children.push(element);
    if (!m[4]) open.push(element);
  }
  unread(end, text.length);
  if (open.length > 1) throw new Error(`<${open[open.length - 1].name}> is never closed.`);
  if (top.children.length !== 1) throw new Error(`the XML has ${top.children.length} top elements, not one.`);
  return top.children[0];
}

// A feature's or a supertype's type: a classifier of the package (#//PartUsage), or one of Ecore's data types.
const DATA_TYPES = { EBoolean: 'Boolean', EString: 'String', EInt: 'Integer', EDouble: 'Real' };
function typeName(eType) {
  const local = /^#\/\/(\w+)$/.exec(eType || '');
  if (local) return local[1];
  const data = /^ecore:EDataType http:\/\/www\.eclipse\.org\/emf\/2002\/Ecore#\/\/(\w+)$/.exec(eType || '');
  if (data && DATA_TYPES[data[1]]) return DATA_TYPES[data[1]];
  throw new Error(`a type the generator doesn't know: ${eType}`);
}
// The features an annotation names: '#//Definition/ownedItem #//Type/feature' is Definition::ownedItem, Type::feature.
function featureNames(references) {
  return (references || '').split(/\s+/).filter(Boolean).map((r) => {
    const m = /^#\/\/(\w+)\/(\w+)$/.exec(r);
    if (!m) throw new Error(`an annotation names something that isn't a feature: ${r}`);
    return `${m[1]}::${m[2]}`;
  });
}

function readFeature(f) {
  const a = f.attrs;
  if (a['xsi:type'] !== 'ecore:EAttribute' && a['xsi:type'] !== 'ecore:EReference') throw new Error(`a feature of a kind the generator doesn't know: ${a['xsi:type']} ${a.name}`);
  const named = (source) => f.children.filter((x) => x.name === 'eAnnotations' && x.attrs.source === source).flatMap((x) => featureNames(x.attrs.references));
  return {
    name: a.name,
    type: typeName(a.eType),
    lower: a.lowerBound === undefined ? 0 : Number(a.lowerBound),
    upper: a.upperBound === undefined ? 1 : Number(a.upperBound),
    default: a.defaultValueLiteral,
    derived: a.derived === 'true',
    containment: a.containment === 'true',
    subsets: named('subsets'),
    redefines: named('redefines'),
  };
}

/**
 * An ecore's text, read: its namespace URI, and its classifiers in its order, each { name, abstract, general, features }
 * for a class or { name, literals } for an enumeration.
 */
export function readEcore(text) {
  const pkg = readXml(text);
  if (pkg.name !== 'ecore:EPackage') throw new Error(`the ecore's top element is <${pkg.name}>, not <ecore:EPackage>.`);
  const classifiers = pkg.children.filter((x) => x.name === 'eClassifiers').map((c) => {
    const kind = c.attrs['xsi:type'];
    if (kind === 'ecore:EEnum') return { name: c.attrs.name, literals: c.children.filter((x) => x.name === 'eLiterals').map((l) => l.attrs.name) };
    if (kind !== 'ecore:EClass') throw new Error(`a classifier of a kind the generator doesn't know: ${kind} ${c.attrs.name}`);
    return {
      name: c.attrs.name,
      abstract: c.attrs.abstract === 'true',
      general: (c.attrs.eSuperTypes || '').split(/\s+/).filter(Boolean).map(typeName),
      features: c.children.filter((x) => x.name === 'eStructuralFeatures').map(readFeature),
    };
  });
  // Everything named is there: each supertype is a class, each type a classifier or a data type, each feature an
  // annotation names a feature.
  const byName = new Map(classifiers.map((c) => [c.name, c]));
  const features = new Set(classifiers.flatMap((c) => (c.features || []).map((f) => `${c.name}::${f.name}`)));
  const types = new Set(Object.values(DATA_TYPES));
  for (const c of classifiers) {
    for (const g of c.general || []) if (!byName.has(g) || !byName.get(g).features) throw new Error(`${c.name} specializes ${g}, which isn't a class of the ecore.`);
    for (const f of c.features || []) {
      if (!byName.has(f.type) && !types.has(f.type)) throw new Error(`${c.name}::${f.name} has the type ${f.type}, which the ecore doesn't define.`);
      for (const k of f.subsets.concat(f.redefines)) if (!features.has(k)) throw new Error(`${c.name}::${f.name} subsets or redefines ${k}, which the ecore doesn't define.`);
    }
  }
  return { nsURI: pkg.attrs.nsURI, classifiers };
}

// The features through which an element owns others, as Class::name: the containments, Element::ownedElement and
// Namespace::ownedMember, and whatever subsets or redefines one of them, directly or through others.
const OWNING = ['Element::ownedElement', 'Namespace::ownedMember'];
export function owningFeatures(classifiers) {
  const all = new Map(classifiers.flatMap((c) => (c.features || []).map((f) => [`${c.name}::${f.name}`, f])));
  const owning = new Set(OWNING);
  for (const key of OWNING) if (!all.has(key)) throw new Error(`the ecore has no ${key}, which says what an element owns.`);
  for (const [key, f] of all) if (f.containment) owning.add(key);
  let grew = true;
  while (grew) {
    grew = false;
    for (const [key, f] of all) {
      if (!owning.has(key) && f.subsets.concat(f.redefines).some((k) => owning.has(k))) { owning.add(key); grew = true; }
    }
  }
  return owning;
}

// The generated script.
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const list = (items) => `[${items.map(q).join(', ')}]`;
function featureLiteral(f) {
  const parts = [`name: ${q(f.name)}`, `type: ${q(f.type)}`];
  if (f.lower !== 0) parts.push(`lower: ${f.lower}`);
  if (f.upper !== 1) parts.push(`upper: ${f.upper < 0 ? q('*') : f.upper}`);
  if (f.default !== undefined) parts.push(`default: ${f.type === 'Boolean' ? String(f.default === 'true') : q(f.default)}`);
  if (f.derived) parts.push('derived: true');
  if (f.subsets.length) parts.push(`subsets: ${list(f.subsets)}`);
  if (f.redefines.length) parts.push(`redefines: ${list(f.redefines)}`);
  return `{ ${parts.join(', ')} }`;
}
function featureList(features) {
  return features.length ? `[\n${features.map((f) => `        ${featureLiteral(f)},\n`).join('')}      ]` : '[]';
}

/** The text of src/core/lib/metamodel.js for an ecore's text. */
export function generate(text) {
  const sha256 = crypto.createHash('sha256').update(text).digest('hex');
  if (sha256 !== SOURCE.sha256) {
    throw new Error(`SysML.ecore isn't the file SOURCE names: its SHA-256 is ${sha256}, not ${SOURCE.sha256}. Put back the file of release ${SOURCE.release}, or change SOURCE to the release it is.`);
  }
  const { nsURI, classifiers } = readEcore(text);
  const owning = owningFeatures(classifiers);
  const classes = classifiers.filter((c) => c.features).length;
  const entries = classifiers.map((c) => {
    if (!c.features) return `    ${c.name}: { literals: ${list(c.literals)} },\n`;
    const owns = c.features.filter((f) => owning.has(`${c.name}::${f.name}`));
    const fields = c.features.filter((f) => !owning.has(`${c.name}::${f.name}`));
    return `    ${c.name}: {${c.abstract ? ' abstract: true,' : ''} general: ${list(c.general)},\n` +
      `      owns: ${featureList(owns)},\n` +
      `      fields: ${featureList(fields)} },\n`;
  });
  return `// Generated by canvas/metamodel/generate.mjs from canvas/metamodel/SysML.ecore. Don't edit it by hand: run
// node canvas/metamodel/generate.mjs, then node canvas/build.mjs.
//
// The source: ${SOURCE.path} of the SysML v2 Pilot Implementation,
// ${SOURCE.repository}, release ${SOURCE.release} (commit ${SOURCE.commit.slice(0, 7)}, org.omg.sysml ${SOURCE.version}), the
// release canvas/check.sh validates the export with. The metamodel it holds is ${nsURI}.
// SHA-256 of the file: ${sha256}.
// It is under ${SOURCE.license}: canvas/metamodel/LICENSE, and canvas/metamodel/README.md.
//
// The model library's first script, so it creates SysMLModelLib. METAMODEL holds the metamodel's ${classifiers.length} classifiers by
// name, ${classes} classes and ${classifiers.length - classes} enumerations, in the ecore's order. A class has general, its direct supertypes;
// abstract, when it is; owns, what an element of it may contain: the features through which it owns other elements
// and relationships; and fields, every other feature it declares. It has the features of its supertypes too. A
// feature has its name; its type, a classifier of METAMODEL or Boolean, String, Integer or Real; lower and upper, its
// bounds, when they aren't 0 and 1 ('*' is no upper bound); its default; derived, when it is computed from others;
// and subsets and redefines, the features it subsets and redefines, as Class::name. An enumeration has its literals.
// METAMODEL is frozen: the canvas's kinds stand on it (KINDS in core/lib/model.js), and nothing changes it.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib = {};   // what the scripts register for the ones after them; api.js removes it

  const freeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === 'object') freeze(v); }); return Object.freeze(o); };
  const METAMODEL = freeze({
${entries.join('')}  });

  Object.assign(lib, { METAMODEL });
})(typeof globalThis !== 'undefined' ? globalThis : window);
`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  let text;
  try {
    text = generate(fs.readFileSync(ECORE, 'utf8'));
  } catch (error) {
    console.error(`The generator failed: ${error.message}`);
    process.exit(1);
  }
  const rel = path.relative(process.cwd(), OUT) || OUT;
  if (check) {
    const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
    if (current === text) {
      console.log(`${rel} is what SysML.ecore generates.`);
    } else {
      const a = (current || '').split('\n');
      const b = text.split('\n');
      let line = 0;
      while (line < a.length && line < b.length && a[line] === b[line]) line++;
      console.error(current === null ? `${rel} doesn't exist.` : `${rel} isn't what SysML.ecore generates: it differs from line ${line + 1}.`);
      console.error('Run node canvas/metamodel/generate.mjs to write it, then node canvas/build.mjs, and commit both.');
      process.exit(1);
    }
  } else {
    fs.writeFileSync(OUT, text);
    console.log(`Wrote ${rel}: ${text.split('\n').length - 1} lines, ${Buffer.byteLength(text)} bytes.`);
  }
}
