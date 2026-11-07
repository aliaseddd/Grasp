// The model library: what the drawing holds, what is wrong with it, and how it reads as textual SysML v2. Pure
// functions, shared with export.mjs and save-state.mjs, which run the library's scripts in Node. After the
// metamodel's classifiers (metamodel.js, generated), this script holds the four tables that say what the canvas
// knows, with the core's rows (the element kinds, the relationship kinds, the view kinds, and the fields), and the
// helpers every feature uses: the names the text reserves and how a name is quoted, how a model saved in an older
// version of the format is upgraded and how normalize reads what a file carries, and what owns what in a model and
// what an element is called in a sentence. Each feature's lib.js adds its rows to the tables, reaches into rows
// before its own (a hook to wrap, a list to push onto), and adds the functions it needs; validate.js and sysml.js
// read it all, and api.js makes SysMLModel of it.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;   // what the scripts register for the ones after them; metamodel.js creates it

  // The saved format. A model names the version of the format it was saved in, format: 'stronghold-canvas/2' for
  // version 2. VERSION is the version this library reads and writes; a model saved in an older one is upgraded as it
  // is read (UPGRADES, by normalize).
  const VERSION = 2;
  const FORMAT = 'stronghold-canvas/' + VERSION;
  const VIEW_DEF = 'StandardViewDefinitions::GeneralView';

  // Element kinds. keyword is the word the text declares an element of the kind with (part def, port), or, for a kind
  // whose elements have no name in the text (no name field: textName), the word the text has for what they stand for
  // (start, done); label is the kind in sentences. contains is the kinds an element may own (false: none); onBorder
  // draws it on its owner's border; definedBy is the definition kind a usage is typed by; size the default box; shape
  // names the entry of the page's SHAPES that draws it (rect, rounded, port; an unknown shape is drawn as a rect, or as
  // a port on a border); fields the panel's fields that apply, each a row of FIELDS below, which normalize keeps by
  // their types; traits the words the relationship rules may ask about with hasTrait (connectable, flowEnd, bindable,
  // lifeline…).
  // A kind may also carry hooks for the export and the checks: head(model, el, h) returns the head of its
  // declaration, everything before the ' {' or ';' (h.headOf(el) is the generated one, to build on), or null for an
  // element the text doesn't declare (a start node), which is then left out with everything inside it; body(model,
  // el, depth, h) writes statements inside its body through h.line and h.comment, after the doc and before the
  // children; after(model, el, depth, h) writes statements right after the element, at its depth; writeOrder (a
  // number, 0 unless said) puts a kind's children before (lower) or after the others in a body; check(model, el,
  // ids, add) adds the problems validate doesn't know about; glyph(model, el) says which way a border item's glyph
  // points (in, out, inout, or null for none).
  const KINDS = {
    // Structure.
    PartDefinition: { keyword: 'part def', label: 'part def', definition: true, usage: false, contains: ['PartUsage', 'PortUsage'], onBorder: false, size: [220, 72], shape: 'rect', fields: ['name', 'abstract', 'doc'], traits: [] },
    PortDefinition: { keyword: 'port def', label: 'port def', definition: true, usage: false, contains: false, onBorder: false, size: [220, 72], shape: 'rect', fields: ['name', 'abstract', 'doc'], traits: [] },
    PartUsage: { keyword: 'part', label: 'part', definition: false, usage: true, contains: ['PartUsage', 'PortUsage'], onBorder: false, definedBy: 'PartDefinition', size: [180, 60], shape: 'rounded', fields: ['name', 'type', 'typeLine', 'multiplicity', 'doc'], traits: ['connectable'] },
    PortUsage: { keyword: 'port', label: 'port', definition: false, usage: true, contains: false, onBorder: true, definedBy: 'PortDefinition', size: [16, 16], shape: 'port', fields: ['name', 'type', 'typeLine', 'multiplicity', 'conjugated', 'doc'], traits: ['connectable'] },
  };

  // Relationship kinds. fields are the panel's fields that apply (rows of FIELDS), which normalize keeps by their
  // types; hideable lets the line be left undrawn. first(model, a, ids) says what rules out a as the first end and
  // ends(model, a, b, ids) what rules out the pair: a sentence, or null. The palette and validate both ask them, so
  // each rule is stated once; check(model, rel, ids, add), when present, adds the problems that need more than the
  // pair. owner(model, rel, ids) is the element whose body declares the relationship (null: the package). line says
  // how the graph renderer draws it: the route (a key of the page's ROUTES: straight or elbow), the marker at the end
  // and markerStart at the start (keys of the page's MARKERS), a class, a label (label(rel, model, ids), a string or
  // null), and labelOffset, how far below the line's middle the label sits (30 unless said; negative is above).
  // toSysML(model, rel, ownerId,
  // depth, out, h) writes it as a statement in that body; it is null when the relationship is written in the head
  // of its from element instead (:> for a specialization, : for a typing).
  const RELATIONSHIPS = {
    // Structure.
    Specialization: {
      label: 'specializes', fields: [], hideable: false,
      first: function () { return null; },
      ends: function (model, a, b, ids) {
        if (a.kind !== b.kind) return describe(model, a, ids) + ' can only specialize another ' + KINDS[a.kind].label + '.';
        if (KINDS[a.kind].usage && a.owner !== b.owner) return describe(model, a, ids) + ' and ' + describe(model, b, ids) + ' must sit in the same box for one to specialize the other.';
        if (specializes(model, b, a)) return 'Specializing ' + describe(model, b, ids) + ' would go round in a circle: it already specializes ' + describe(model, a, ids) + '.';
        return null;
      },
      owner: function () { return null; },
      line: { route: 'elbow', marker: 'm-general', cls: 'specialization', label: null },
      toSysML: null,
    },
    FeatureTyping: {
      label: 'defined by', fields: [], hideable: true,
      // The first end is a usage of a kind that has a definition kind (definedBy): a definition is defined by nothing,
      // and so is a usage of a kind without one (a fork, a start node, an event).
      first: function (model, a, ids) {
        const kind = KINDS[a.kind];
        if (!kind.usage) return 'Only a usage is defined by something; ' + describe(model, a, ids) + ' is a definition.';
        if (!kind.definedBy) return an(kind.label, true) + ' isn\'t defined by anything; a ' + definable() + ' is.';
        return null;
      },
      ends: function (model, a, b, ids) {
        const problem = RELATIONSHIPS.FeatureTyping.first(model, a, ids);
        if (problem) return problem;
        if (KINDS[a.kind].definedBy !== b.kind) {
          // The definition kind may be one another slice brings; when it isn't in KINDS, its name has to do.
          const def = KINDS[a.kind].definedBy;
          return describe(model, a, ids) + ' can only be defined by ' + an(KINDS[def] ? KINDS[def].label : def) + '.';
        }
        return null;
      },
      // One definition per usage: the first typing of a usage stands, and every later one is the problem.
      check: function (model, rel, ids, add) {
        const first = model.relationships.find((r) => r.kind === 'FeatureTyping' && r.from === rel.from && ids.has(r.to));
        if (first !== rel) add(rel.id, describe(model, ids.get(rel.from), ids) + ' is defined by more than one definition.');
      },
      owner: function () { return null; },
      line: { route: 'elbow', marker: 'm-defined', cls: 'typing', label: null },
      toSysML: null,
    },
    ConnectionUsage: {
      label: 'connection', fields: ['name', 'doc'], hideable: false,
      // An end is a usage with the connectable trait (a part, a port, an item): an action or a state in the same body
      // is no connector end, and the pilot refuses connect a1 to a2 there.
      first: function (model, a, ids) {
        return hasTrait(a.kind, 'connectable') ? null : 'A connection joins two parts, two ports or two items; ' + describe(model, a, ids) + ' is none of those.';
      },
      ends: function (model, a, b, ids) {
        const problem = RELATIONSHIPS.ConnectionUsage.first(model, a, ids) || RELATIONSHIPS.ConnectionUsage.first(model, b, ids);
        if (problem) return problem;
        if (a.kind !== b.kind) return 'A connection joins two parts, two ports or two items.';
        return acrossDefinitions(model, 'A connection', a, b, ids);
      },
      // A named connection is a feature of the element it is declared in, so its name can't be that of a feature
      // declared there, or of a connection declared there before it.
      check: function (model, rel, ids, add) {
        const cname = rel.name.trim();
        if (!cname) return;
        const before = model.relationships.slice(0, model.relationships.indexOf(rel));
        if (nameTakenBeside(model, rel, ids, before.filter((r) => r.kind === 'ConnectionUsage'))) add(rel.id, 'The connection ' + cname + ' is named like something else beside it. Rename one.');
      },
      owner: function (model, rel, ids) { return commonOwner(model, ids.get(rel.from), ids.get(rel.to), ids); },
      line: { route: 'straight', marker: null, cls: 'connection', label: function (rel) { return rel.name.trim(); } },
      toSysML: function (model, rel, ownerId, depth, out, h) {
        const a = h.ids.get(rel.from);
        const b = h.ids.get(rel.to);
        const head = (rel.name.trim() ? 'connection ' + quote(rel.name) + ' ' : '') +
          'connect ' + featurePath(model, ownerId, a, h.ids) + ' to ' + featurePath(model, ownerId, b, h.ids);
        // A note on an unnamed connection can't be about it by name, so it goes inside the connection's body.
        const inside = rel.name.trim() ? [] : h.notesOn(rel.id);
        if (!rel.doc.trim() && !inside.length) { h.line(depth, head + ';'); return; }
        h.line(depth, head + ' {');
        if (rel.doc.trim()) h.comment(depth + 1, 'doc', rel.doc);
        inside.forEach((n) => h.note(depth + 1, n, null));
        h.line(depth, '}');
      },
    },
  };

  // View kinds. renderer names the page's renderer for the kind; admits the element kinds a view of the kind may
  // show (null: every kind); tools the palette, element and relationship kinds with '|' between groups; fields the
  // panel's fields that apply (rows of FIELDS), which normalize keeps by their types; options the defaults of the
  // view's own options, which normalize keeps the keys of; check(model, view, ids, add), when
  // present, adds the view's own problems; exposes(model, view, h), when present, returns the statements of the
  // view's body in the export (expose …;, render …;) in place of those the core makes from the view's layout
  // (h.exposesOf(view) gives those, to build on). The core has the general view; each feature's script adds the rows
  // of the view kinds it draws.
  const VIEW_KINDS = {
    GeneralView: { name: 'GeneralView', label: 'general view', qualified: 'StandardViewDefinitions::GeneralView', renderer: 'graph',
      admits: null, tools: ['PartDefinition', 'PortDefinition', 'PartUsage', 'PortUsage', '|', 'Specialization', 'FeatureTyping', 'ConnectionUsage'], fields: ['name', 'doc'], options: {} },
  };

  // The fields the panel can show and normalize keeps, by name, for elements (KINDS[kind].fields), relationships
  // (RELATIONSHIPS[kind].fields) and views (VIEW_KINDS[kind].fields). type says what the value is: string or text (a
  // string; trim takes the ends off), bool (true or false), enum (one of values, else the first), number (a finite
  // number, else ''), ref (the id of an element, else ''; options(model, item) returns the elements the field may
  // name). label is the field's name in sentences. views, when present, lists the view kinds the field shows in
  // (absent: every kind). The page shows and changes every field through its row, each with a <label id="l-<field>">
  // holding an <input id="f-<field>"> in the panel, or l-v-<field> and v-<field> for a view's (the page's FIELD_HOOKS
  // add what a row can't say). read(raw), when present, replaces the reading by type
  // (for a value that is none of these, a list say), and fresh(), when present, gives a new element's or
  // relationship's starting value. stored: false marks a field that is no value of the item, which normalize keeps out
  // of the model: type is the usage's FeatureTyping relationship, and typeLine whether that relationship is drawn as a
  // line or shown as text only.
  const FIELDS = {
    name: { type: 'string', label: 'name' },
    abstract: { type: 'bool', label: 'abstract' },
    type: { type: 'ref', label: 'definition', stored: false, options: function (model, item) { return model.elements.filter((e) => e.kind === KINDS[item.kind].definedBy); } },
    typeLine: { type: 'bool', label: 'defined-by line', stored: false },
    multiplicity: { type: 'string', label: 'multiplicity', trim: true },
    conjugated: { type: 'bool', label: 'conjugated' },
    doc: { type: 'text', label: 'doc' },
    // Two rows several slices share, stated once: which way a feature goes (none, in, out, inout), and the item a flow
    // or a message carries, an ItemDefinition (a kind no core row has yet, so the select offers nothing until a slice
    // brings it). No core kind lists them, so the panel shows neither until a slice's kind does.
    direction: { type: 'enum', label: 'direction', values: ['', 'in', 'out', 'inout'] },
    item: { type: 'ref', label: 'item', options: function (model) { return model.elements.filter((e) => e.kind === 'ItemDefinition'); } },
  };

  const SIDES = ['top', 'right', 'bottom', 'left'];
  const ID = /^[A-Za-z0-9_.:-]{1,64}$/;
  const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
  const MULTIPLICITY = /^(\d+|\*)(\.\.(\d+|\*))?$/;
  // Words the textual notation reserves. A name that is one of these, or that isn't a plain identifier, is quoted.
  const KEYWORDS = new Set(('about abstract accept action actor after alias all allocate allocation analysis and as ' +
    'assert assign assume at attribute bind binding by calc case comment concern connect connection constant ' +
    'constraint crosses decide def default defined dependency derived do doc else end entry enum event exhibit exit ' +
    'expose false filter first flow for fork frame from hastype if implies import in include individual inout ' +
    'interface istype item join language library locale loop merge message meta metadata new nonunique not null ' +
    'objective occurrence of or ordered out package parallel part perform port private protected public redefines ' +
    'ref references render rendering rep require requirement return satisfy send snapshot specializes stakeholder ' +
    'standard state subject subsets succession terminate then timeslice to transition true until use variant ' +
    'variation verification verify via view viewpoint when while xor').split(' '));

  const str = (v, d) => (typeof v === 'string' ? v : (d === undefined ? '' : d));
  const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v
    : (typeof v === 'string' && v.trim() !== '' && Number.isFinite(+v) ? +v : d));
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const isObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const copy = (v) => JSON.parse(JSON.stringify(v));

  function canContain(ownerKind, childKind) {
    const k = KINDS[ownerKind];
    return !!(k && k.contains) && k.contains.indexOf(childKind) >= 0;
  }
  function admits(viewKind, elKind) {
    const v = VIEW_KINDS[viewKind];
    return !!v && !!KINDS[elKind] && (v.admits === null || v.admits.indexOf(elKind) >= 0);
  }
  // Whether a kind carries a trait, one of the words in its traits; a kind without traits carries none.
  function hasTrait(kind, trait) {
    const k = KINDS[kind];
    return !!(k && k.traits) && k.traits.indexOf(trait) >= 0;
  }
  // Whether an element has a name in the text, and which: the one place that decides it. An element whose kind has a
  // name field has its name, trimmed, or '' while it has none (an unnamed part, which the text may still write, as
  // part : Host;). An element whose kind has none has no name in the text at all, whatever its name field holds:
  // null. Those are the start, done and initial nodes, which stand for what the text has already (the start and done
  // every action inherits, a state's entry), so the name the page keeps in one for itself (start1) is never written,
  // shown or compared. Whatever asks whether an element is named, or reads an element's name, asks here; to ask it of
  // a kind, ask it of an element of the kind with no name yet, { kind }: '' when the kind's elements take names.
  function textName(el) {
    const kind = KINDS[el.kind];
    return kind && kind.fields.indexOf('name') >= 0 ? str(el.name).trim() : null;
  }

  function blank() {
    return { format: FORMAT, revision: null, package: { name: 'Model', doc: '' }, elements: [], relationships: [], views: [] };
  }

  // A layout entry for an element in a view: a border item's side and place along it, or a box's place and size.
  function placement(el, p) {
    const kind = KINDS[el.kind];
    p = isObject(p) ? p : {};
    if (kind.onBorder) return { side: SIDES.includes(p.side) ? p.side : 'right', at: clamp(num(p.at, 0.5), 0.05, 0.95) };
    // A box is never smaller than 80 x 40, unless its kind's own size is (a 16 x 16 node keeps its size).
    return {
      x: Math.round(num(p.x, 0)), y: Math.round(num(p.y, 0)),
      w: Math.round(clamp(num(p.w, kind.size[0]), Math.min(80, kind.size[0]), 4000)), h: Math.round(clamp(num(p.h, kind.size[1]), Math.min(40, kind.size[1]), 4000))
    };
  }

  // Places for the elements a view doesn't place yet: top-level boxes in rows of three, nested boxes in a row inside
  // their owner, border items spread along their owner's right side.
  function gridPlace(model, view) {
    const roots = childrenOf(model, null).filter((e) => !KINDS[e.kind].onBorder);
    roots.filter((e) => !view.layout[e.id]).forEach((el, i) => {
      view.layout[el.id] = placement(el, { x: 32 + (i % 3) * 320, y: 72 + Math.floor(i / 3) * 220 });
    });
    const walk = (parent) => {
      const kids = childrenOf(model, parent.id);
      const boxes = kids.filter((k) => !KINDS[k.kind].onBorder);
      const ports = kids.filter((k) => KINDS[k.kind].onBorder);
      boxes.filter((k) => !view.layout[k.id]).forEach((k, i) => { view.layout[k.id] = placement(k, { x: 12 + i * 200, y: 48 }); });
      ports.filter((k) => !view.layout[k.id]).forEach((k, i) => { view.layout[k.id] = placement(k, { side: 'right', at: (i + 1) / (ports.length + 1) }); });
      boxes.forEach(walk);
    };
    roots.forEach(walk);
  }

  // The value of a field from what a file carries, by its row in FIELDS. A ref is kept as the string it names and
  // checked by checkRefs once the elements are known.
  function readField(spec, v) {
    if (spec.read) return spec.read(v);
    if (spec.type === 'bool') return v === true;
    if (spec.type === 'enum') return spec.values.indexOf(v) >= 0 ? v : spec.values[0];
    if (spec.type === 'number') return num(v, '');
    const s = str(v);
    return spec.trim ? s.trim() : s;
  }
  // Keeps the fields of an element or a relationship from raw on item, each by its row in FIELDS. A field item has
  // already (name and doc, which every element gets first) and one that is not stored as a value (type) are left alone.
  function keepFields(fields, raw, item) {
    for (const f of fields) {
      const spec = FIELDS[f];
      if (!spec || spec.stored === false || item[f] !== undefined) continue;
      item[f] = readField(spec, raw[f]);
    }
  }
  // A ref names an element that exists, or nothing.
  function checkRefs(fields, item, ids) {
    for (const f of fields) {
      const spec = FIELDS[f];
      if (spec && spec.type === 'ref' && spec.stored !== false && item[f] !== '' && !ids.has(item[f])) item[f] = '';
    }
  }

  // The upgrades, one for each older version of the saved format. UPGRADES[n] takes a model saved in version n, as
  // it came (any JSON: a file may have been written by hand), to version n + 1, saying the same thing, and leaves the
  // model it was given as it was. upgrade runs them in turn, so normalize reads the current version only, and what an
  // older version did differently is written here, once. To change the format: add 1 to VERSION, add the upgrade
  // from the version before it, and keep a test fixture saved in every version (test/format.test.mjs checks that each
  // still exports the text it exported when it was saved).
  const UPGRADES = {
    // Version 1, the first slice's, drew the model in one general view, which view.name named, and each element
    // carried its own place in it: x, y, w and h for a box, side and at for a port on its owner's border. Version 2
    // keeps places in views: the one view becomes the model's view, its layout holding each element's place, and the
    // elements keep the rest. An element that carried no place gets an empty one, which placement reads the way
    // version 1 did: at the top left of its owner, at its kind's size, or in the middle of its owner's right side.
    1: function (raw) {
      const place = (key) => ['x', 'y', 'w', 'h', 'side', 'at'].indexOf(key) >= 0;
      const model = pick(raw, (key) => key !== 'view');
      const places = new Map();
      if (Array.isArray(raw.elements)) {
        model.elements = raw.elements.map((e) => {
          if (!isObject(e)) return e;
          if (typeof e.id === 'string' && !places.has(e.id)) places.set(e.id, pick(e, place));
          return pick(e, (key) => !place(key));
        });
      }
      model.format = 'stronghold-canvas/2';
      model.views = [{ kind: 'GeneralView', name: isObject(raw.view) ? raw.view.name : '', layout: Object.fromEntries(places) }];
      return model;
    },
  };
  // The keys of an object that keep(key) keeps, with their values, as a new object.
  function pick(o, keep) {
    return Object.fromEntries(Object.entries(o).filter((entry) => keep(entry[0])));
  }
  // The version of the format a model was saved in: the number its format names, or, for a model that names none (one
  // written by hand), the version this library reads and writes.
  function versionOf(raw) {
    const match = isObject(raw) ? /^stronghold-canvas\/([1-9][0-9]*)$/.exec(str(raw.format)) : null;
    return match ? Number(match[1]) : VERSION;
  }
  // A model saved in any version, in the current version: the upgrade of each version from the one it was saved in.
  // A model in the current version is returned as it is, and so is one in a version newer than this library knows,
  // which normalize then reads as well as it can, as it reads any JSON.
  function upgrade(raw) {
    let model = raw;
    for (let version = versionOf(raw); version < VERSION; version += 1) model = UPGRADES[version](model);
    return model;
  }

  // Takes any JSON and returns a model this page can draw: known kinds, unique ids, owners that exist and can hold
  // what they own, no cycles, relationships whose two ends exist, and views whose layouts place elements the view's
  // kind admits. A model saved in an older version of the format is upgraded first, so what follows reads the current
  // version only.
  function normalize(raw) {
    const r = upgrade(raw && typeof raw === 'object' ? raw : {});
    const m = blank();
    m.revision = typeof r.revision === 'string' ? r.revision : null;
    const pkg = isObject(r.package) ? r.package : {};
    m.package.name = str(pkg.name).trim() || 'Model';
    m.package.doc = str(pkg.doc);

    // Elements. A place an element carries itself, a convenience for edits made outside the page, is kept aside and
    // goes into a view's layout below.
    const carried = new Map();
    const seen = new Set();
    for (const e of Array.isArray(r.elements) ? r.elements : []) {
      if (!e || typeof e !== 'object' || !KINDS[e.kind] || typeof e.id !== 'string' || !ID.test(e.id) || seen.has(e.id)) continue;
      const kind = KINDS[e.kind];
      const el = { id: e.id, kind: e.kind, name: str(e.name), doc: str(e.doc) };
      if (typeof e.owner === 'string' && e.owner !== e.id) el.owner = e.owner;
      keepFields(kind.fields, e, el);
      if (kind.onBorder ? (e.side !== undefined || e.at !== undefined) : (e.x !== undefined || e.y !== undefined)) {
        carried.set(el.id, { view: str(e.view), place: e });
      }
      seen.add(el.id);
      m.elements.push(el);
    }

    let ids = new Map(m.elements.map((e) => [e.id, e]));
    for (const el of m.elements) {
      if (KINDS[el.kind].definition) { delete el.owner; continue; }
      if (el.owner !== undefined) {
        const o = ids.get(el.owner);
        if (!o || !canContain(o.kind, el.kind)) delete el.owner;
      }
    }
    for (const el of m.elements) {
      const walked = new Set([el.id]);
      let cur = el;
      while (cur && cur.owner !== undefined) {
        if (walked.has(cur.owner)) { delete el.owner; break; }
        walked.add(cur.owner);
        cur = ids.get(cur.owner);
      }
    }
    m.elements = m.elements.filter((el) => !(KINDS[el.kind].onBorder && el.owner === undefined));
    ids = new Map(m.elements.map((e) => [e.id, e]));
    for (const el of m.elements) checkRefs(KINDS[el.kind].fields, el, ids);

    const rseen = new Set();
    for (const x of Array.isArray(r.relationships) ? r.relationships : []) {
      if (!x || typeof x !== 'object' || !RELATIONSHIPS[x.kind] || typeof x.id !== 'string' || !ID.test(x.id)) continue;
      if (rseen.has(x.id) || seen.has(x.id) || !ids.has(x.from) || !ids.has(x.to) || x.from === x.to) continue;
      const kind = RELATIONSHIPS[x.kind];
      const rel = { id: x.id, kind: x.kind, from: x.from, to: x.to };
      keepFields(kind.fields, x, rel);
      checkRefs(kind.fields, rel, ids);
      if (kind.hideable && x.hidden === true) rel.hidden = true;
      rseen.add(x.id);
      m.relationships.push(rel);
    }

    // Views. Ids are unique across elements, relationships, and views; a view with no id, or one already taken, gets
    // the first free v1, v2…, so a model written by hand without ids still reads the same way every time.
    const taken = new Set();
    seen.forEach((id) => taken.add(id));
    rseen.forEach((id) => taken.add(id));
    const vseen = new Set();
    let serial = 0;
    const freeViewId = () => { do { serial += 1; } while (taken.has('v' + serial) || vseen.has('v' + serial)); return 'v' + serial; };
    for (const v of Array.isArray(r.views) ? r.views : []) {
      if (!isObject(v)) continue;
      const kindName = v.kind === undefined || v.kind === null || v.kind === '' ? 'GeneralView' : v.kind;
      const kind = VIEW_KINDS[kindName];
      if (!kind) continue;
      const id = typeof v.id === 'string' && ID.test(v.id) && !taken.has(v.id) && !vseen.has(v.id) ? v.id : freeViewId();
      const view = { id: id, kind: kindName, name: str(v.name).trim(), doc: str(v.doc), x: Math.round(num(v.x, 0)), y: Math.round(num(v.y, 0)), layout: {}, options: copy(kind.options) };
      keepFields(kind.fields, v, view);
      if (isObject(v.options)) for (const key in view.options) if (v.options[key] !== undefined) view.options[key] = copy(v.options[key]);
      const lay = isObject(v.layout) ? v.layout : {};
      for (const eid in lay) {
        const el = ids.get(eid);
        if (!el || !admits(kindName, el.kind) || !isObject(lay[eid])) continue;
        view.layout[eid] = placement(el, lay[eid]);
      }
      vseen.add(id);
      m.views.push(view);
    }
    // Places carried by elements go into the view their view field names, else the first view.
    carried.forEach((c, eid) => {
      const el = ids.get(eid);
      if (!el) return;
      const view = m.views.find((v) => v.id === c.view) || m.views[0];
      if (!view || view.layout[eid] || !admits(view.kind, el.kind)) return;
      view.layout[eid] = placement(el, c.place);
    });
    // A model with no views (one written without them) gets one general view showing every element, at the places
    // the elements carried, else in a grid, so nothing is invisible after a load.
    if (!m.views.length) {
      const view = { id: freeViewId(), kind: 'GeneralView', name: '', doc: '', x: 0, y: 0, layout: {}, options: {} };
      carried.forEach((c, eid) => { const el = ids.get(eid); if (el) view.layout[eid] = placement(el, c.place); });
      gridPlace(m, view);
      m.views.push(view);
    }
    // A border item is shown only where its owner is.
    for (const view of m.views) {
      for (const eid in view.layout) {
        const el = ids.get(eid);
        if (KINDS[el.kind].onBorder && !(el.owner !== undefined && view.layout[el.owner])) delete view.layout[eid];
      }
    }
    return m;
  }

  function index(model) { return new Map(model.elements.map((e) => [e.id, e])); }
  function relIndex(model) { return new Map(model.relationships.map((r) => [r.id, r])); }
  function viewIndex(model) { return new Map(model.views.map((v) => [v.id, v])); }
  // The ids of the views that show an element.
  function shownIn(model, id) { return model.views.filter((v) => !!v.layout[id]).map((v) => v.id); }

  // The element and its owners, outermost first.
  function chain(model, el, ids) {
    ids = ids || index(model);
    const out = [];
    const guard = new Set();
    let cur = el;
    while (cur && !guard.has(cur.id)) {
      guard.add(cur.id);
      out.unshift(cur);
      cur = cur.owner !== undefined ? ids.get(cur.owner) : null;
    }
    return out;
  }
  function childrenOf(model, id) {
    return model.elements.filter((e) => (id === null || id === undefined ? e.owner === undefined : e.owner === id));
  }
  function descendants(model, id) {
    const out = [];
    const walk = (parent) => childrenOf(model, parent).forEach((c) => { out.push(c); walk(c.id); });
    walk(id);
    return out;
  }
  function typingOf(model, el) {
    return model.relationships.find((r) => r.kind === 'FeatureTyping' && r.from === el.id) || null;
  }
  function inUsage(model, el, ids) { return chain(model, el, ids).some((e) => e.kind === 'PartUsage'); }
  // Whether sub specializes general, directly or through others.
  function specializes(model, sub, general) {
    const seen = new Set();
    const stack = [sub.id];
    while (stack.length) {
      const id = stack.pop();
      if (id === general.id) return true;
      if (seen.has(id)) continue;
      seen.add(id);
      model.relationships.filter((r) => r.kind === 'Specialization' && r.from === id).forEach((r) => stack.push(r.to));
    }
    return false;
  }

  // The owner a connection is declared in: the innermost element that holds both ends, or null for the package.
  function commonOwner(model, a, b, ids) {
    ids = ids || index(model);
    const ca = chain(model, a, ids).slice(0, -1).map((e) => e.id);
    const cb = new Set(chain(model, b, ids).slice(0, -1).map((e) => e.id));
    let found = null;
    for (const id of ca) if (cb.has(id)) found = id;
    return found;
  }
  // What rules out a and b as the two ends of a connector (what is its kind in a sentence, "A flow"): with no common
  // owner and an end inside a definition, the connector would reach across definitions, which the notation can't
  // write. advice, when given, replaces the closing sentence that says where to draw it instead.
  function acrossDefinitions(model, what, a, b, ids, advice) {
    if (commonOwner(model, a, b, ids) === null && (KINDS[chain(model, a, ids)[0].kind].definition || KINDS[chain(model, b, ids)[0].kind].definition)) {
      return what + ' between ' + describe(model, a, ids) + ' and ' + describe(model, b, ids) + ' reaches across definitions. ' + (advice || 'Connect things inside the same part def or part.');
    }
    return null;
  }
  // Whether a named relationship's name is taken beside it: by an element declared right in the body the relationship
  // is written in (the package when its owner is null), or by another named relationship written there, among those
  // given. Each kind's check says which it looks at (the ones before it, or every other one), so which line is marked
  // when two clash still depends on the kinds and their order.
  function nameTakenBeside(model, rel, ids, among) {
    const name = str(rel.name).trim();
    const o = RELATIONSHIPS[rel.kind].owner(model, rel, ids) || '';
    return model.elements.some((e) => textName(e) === name && (e.owner === undefined ? '' : e.owner) === o) ||
      among.some((r) => r !== rel && str(r.name).trim() === name && ids.has(r.from) && ids.has(r.to) && (RELATIONSHIPS[r.kind].owner(model, r, ids) || '') === o);
  }

  function isName(s) { return NAME.test(s) && !KEYWORDS.has(s); }
  function quote(name) {
    const n = String(name == null ? '' : name).trim() || 'unnamed';
    return isName(n) ? n : "'" + n.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  }
  function shown(name) { return String(name == null ? '' : name).trim() || '(unnamed)'; }
  // An element as a step of a path in the text: its name, quoted (unnamed when it has none, the name an unnamed
  // definition is written with), or, for an element with no name in the text, its kind's keyword, the word the text has
  // for what it stands for: first start then a1; leaves the start of the action it is in, which a start node draws.
  function segment(el) {
    const name = textName(el);
    return name === null ? KINDS[el.kind].keyword : quote(name);
  }
  function qualified(model, el, ids) {
    return [quote(model.package.name)].concat(chain(model, el, ids).map(segment)).join('::');
  }
  // The path to a feature from the element it is declared in: hosts.api from Page, done from an action.
  function featurePath(model, ownerId, el, ids) {
    const c = chain(model, el, ids);
    const start = ownerId === null ? 0 : c.findIndex((e) => e.id === ownerId) + 1;
    return c.slice(start).map(segment).join('.');
  }
  // Whether the text can name an element by its qualified name: it and every owner have a name in the text. A start
  // node (no name in the text), or anything inside an unnamed part, can't be exposed or annotated by name.
  function nameable(model, el, ids) {
    return chain(model, el, ids).every((c) => !!textName(c));
  }
  // A label with its indefinite article: "a part", "an item", "an action flow view". Some labels start with a vowel,
  // so 'a ' + label reads wrong for them; capital gives the "A"/"An" that opens a sentence.
  function an(label, capital) {
    const article = /^[aeiou]/i.test(label) ? 'an' : 'a';
    return (capital ? article.charAt(0).toUpperCase() + article.slice(1) : article) + ' ' + label;
  }
  // The kinds that are defined by something, as the defined-by rule and the page's hint list them: "part, port, item,
  // action, parameter or state".
  function definable() {
    const labels = Object.keys(KINDS).filter((k) => KINDS[k].definedBy).map((k) => KINDS[k].label);
    return labels.length > 1 ? labels.slice(0, -1).join(', ') + ' or ' + labels[labels.length - 1] : labels.join('');
  }

  // An element in a sentence: its kind's label, its name (or "(unnamed)"), and the owner it is in. An element with no
  // name in the text is just its label: "start in a1".
  function describe(model, el, ids) {
    ids = ids || index(model);
    const owner = el.owner !== undefined ? ids.get(el.owner) : null;
    const name = textName(el);
    return KINDS[el.kind].label + (name === null ? '' : ' ' + shown(name)) + (owner ? ' in ' + shown(textName(owner)) : '');
  }
  function describeRel(model, rel, ids) {
    ids = ids || index(model);
    const a = ids.get(rel.from);
    const b = ids.get(rel.to);
    // An end with no name in the text is said by its kind (describe), not as "(unnamed)".
    const end = (e) => (!e ? '?' : textName(e) === null ? describe(model, e, ids) : shown(textName(e)));
    const from = end(a);
    const to = end(b);
    if (rel.kind === 'Specialization') return from + ' specializes ' + to;
    if (rel.kind === 'FeatureTyping') return from + ' defined by ' + to;
    return RELATIONSHIPS[rel.kind].label + ' ' + (rel.name && rel.name.trim() ? rel.name.trim() + ', ' : '') + from + ' to ' + to;
  }
  function describeView(model, view) { return 'view ' + shown(view.name); }
  function labelFor(model, targetId) {
    const el = index(model).get(targetId);
    if (el) return describe(model, el);
    const rel = relIndex(model).get(targetId);
    if (rel) return describeRel(model, rel);
    const view = viewIndex(model).get(targetId);
    return view ? describeView(model, view) : '';
  }

  // The features a type gets from elsewhere, by name: those of what it is defined by and of what it specializes,
  // all the way up, and, for a usage that redefines a feature of its owner's type, those of that feature. An element
  // with no name in the text (a start node, which the page names start1 for itself) has no name to inherit.
  function inheritedFeatures(model, type, ids, seen) {
    ids = ids || index(model);
    seen = seen || new Set();
    const out = new Map();
    const take = (t) => {
      if (!t || seen.has(t.id)) return;
      seen.add(t.id);
      childrenOf(model, t.id).forEach((c) => { const name = textName(c); if (name && !out.has(name)) out.set(name, c); });
      inheritedFeatures(model, t, ids, seen).forEach((c, name) => { if (!out.has(name)) out.set(name, c); });
    };
    const typing = typingOf(model, type);
    if (typing) take(ids.get(typing.to));
    model.relationships.filter((r) => r.kind === 'Specialization' && r.from === type.id).forEach((r) => take(ids.get(r.to)));
    const typeName = textName(type);
    if (!typing && type.owner !== undefined && typeName) {
      const owner = ids.get(type.owner);
      const redefined = owner ? inheritedFeatures(model, owner, ids, seen).get(typeName) : null;
      if (redefined && redefined.kind === type.kind) take(redefined);
    }
    return out;
  }
  const MAX_BOUND = 2147483647;
  function boundsOk(mult) {
    return mult.split('..').every((b) => b === '*' || +b <= MAX_BOUND);
  }
  const RESERVED_NAMES = new Set(['StandardViewDefinitions', 'SysML', 'KerML', 'Views', 'Parts', 'Ports', 'Items']);

  // What the slices add to the library: EXTRA the functions they export on SysMLModel (EXTRA.successionsOf =
  // successionsOf), BODY the writers run for every element's body in the export (function (model, el, depth, h),
  // after the doc and before the kind's own body hook: the code links' textual representations, say). The functions
  // themselves live in the features' scripts.
  const EXTRA = {};
  const BODY = [];

  // Breaks a paragraph into lines of at most width characters, at spaces.
  function wrapText(text, width) {
    const out = [];
    for (const para of text.split('\n')) {
      let line = '';
      for (const word of para.split(/\s+/).filter(Boolean)) {
        if (line && (line + ' ' + word).length > width) { out.push(line); line = word; }
        else line = line ? line + ' ' + word : word;
      }
      out.push(line);
    }
    return out;
  }
  function commentLines(depth, head, text) {
    const body = String(text == null ? '' : text).replace(/\r\n?/g, '\n').replace(/\*\//g, '* /').trim();
    const ind = '    '.repeat(depth);
    if (!body.includes('\n') && (ind + head + body).length <= 96) return [ind + head + ' /* ' + body + ' */'];
    return [ind + head, ind + '/*'].concat(wrapText(body, 92 - ind.length).map((l) => ind + ' * ' + l)).concat([ind + ' */']);
  }

  Object.assign(lib, {
    VERSION, FORMAT, VIEW_DEF, KINDS, RELATIONSHIPS, VIEW_KINDS, FIELDS, SIDES, NAME, MULTIPLICITY, str, isObject,
    canContain, admits, hasTrait, textName, blank, placement, versionOf, upgrade, normalize, index, relIndex, viewIndex,
    shownIn, chain, childrenOf, descendants, typingOf, inUsage, specializes, commonOwner, acrossDefinitions,
    nameTakenBeside, isName, quote, shown, qualified, featurePath, nameable, an, definable, describe, describeRel,
    describeView, labelFor, inheritedFeatures, boundsOk, RESERVED_NAMES, EXTRA, BODY, commentLines
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
