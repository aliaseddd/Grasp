// The details view in the model library, as SysON's: what its two tabs hold for an element, a line or a view, from the
// metaclass it stands on. SysON's Details view (its user manual's details.adoc; docs/sysml/syson/features/views.md,
// "Details view & property forms") shows a Core tab, a group titled "<Metaclass> Properties" with the metaclass's core
// features (the declared name, the qualified name, the declared short name, a feature's direction, isIndividual,
// isParallel…) and then untitled groups (Typed by, Specializes, Subsets…); and an Advanced tab, the same title over
// every other attribute of the metaclass, in the metamodel's order, inherited first. The canvas holds some of those
// attributes as fields, can say the value of a few more (an element's id, its name), and can't set the rest yet; each
// row says which. The Specializes and Subsets fields are here too: the first specialization line an element starts,
// which the panel retargets or takes away, as SysON's widgets edit an element's Subclassification and Subsetting.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const {
    METAMODEL, KINDS, RELATIONSHIPS, VIEW_KINDS, FIELDS, conforms, textName, idsOf, chain, childrenOf, linesFrom, specializes,
    elementsOfKind, quote, qualified, describe, EXTRA
  } = lib;

  // ---- Specializes and Subsets.

  // What an element's first specialization line may end on: an element of its own kind, never itself, never one that
  // specializes it already (a circle), and for a usage one in the same box, as the line's rule says.
  function generals(model, el) {
    const usage = KINDS[el.kind].usage;
    return elementsOfKind(model, el.kind).filter((e) => e.id !== el.id && (!usage || e.owner === el.owner) && !specializes(model, e, el));
  }
  Object.assign(FIELDS, {
    // A definition's first Specialization line (SysON's Subclassification: Specializes), and a usage's (its
    // Subsetting: Subsets). Not a value of the element but the line, as the definition is the usage's typing: the
    // panel shows it while the element has such a line, and picking nothing takes the line away.
    specializes: { type: 'ref', label: 'specialization', stored: false, options: generals },
    subsets: { type: 'ref', label: 'subsetting', stored: false, options: generals },
  });
  // Every kind with a name in the text lists the one that fits it.
  Object.keys(KINDS).forEach((kind) => {
    if (textName({ kind: kind }) === null) return;
    KINDS[kind].fields.push(KINDS[kind].definition ? 'specializes' : 'subsets');
  });
  // The first Specialization line an element starts, or null.
  function firstGeneral(model, el) { return linesFrom(model, el.id, 'Specialization')[0] || null; }

  // ---- The tabs.

  // A name of the metamodel in words, as EMF shows a feature's: declaredName is Declared Name, elementId Element Id.
  function words(name) {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
  }
  // The groups' title: the metaclass in words, a usage's without "Usage", then "Properties" (Part Properties, Part
  // Definition Properties).
  function detailsTitle(metaclass) { return words(metaclass).replace(/ Usage$/, '') + ' Properties'; }
  // The class an item stands on: its kind's, its relationship kind's, or a view's, ViewUsage. type is 'el', 'rel' or
  // 'view'.
  function metaclassOf(type, item) {
    return type === 'el' ? KINDS[item.kind].metaclass : type === 'rel' ? RELATIONSHIPS[item.kind].metaclass : 'ViewUsage';
  }
  // SysON's core features of a class, in its order: every element's names; a feature's direction; isIndividual on an
  // occurrence usage (not a port, a state or a view, which show a feature's set only) and on an occurrence definition,
  // where it takes isAbstract's place; isAbstract on any other type that isn't a feature; isParallel on a state; a view's
  // exposed elements; a specialization's general and specific ends, and a typing's type and typed feature.
  function coreFeatures(metaclass) {
    const is = (c) => conforms(metaclass, c);
    const out = ['declaredName', 'qualifiedName', 'declaredShortName'];
    if (is('Specialization')) {
      out.push('general', 'specific');
      if (is('FeatureTyping')) out.push('type', 'typedFeature');
      return out;
    }
    if (is('Feature')) out.push('direction');
    const featureSet = is('PortUsage') || is('StateUsage') || is('ViewUsage') || is('RequirementUsage');
    if (is('OccurrenceUsage') && !featureSet) out.push('isIndividual');
    if (is('Type') && !is('Feature') && !is('OccurrenceDefinition')) out.push('isAbstract');
    if (is('OccurrenceDefinition')) out.push('isIndividual');
    if (is('StateUsage') || is('StateDefinition')) out.push('isParallel');
    if (is('ViewUsage')) out.push('exposedElement');
    return out;
  }
  // Every feature of a class, its own and those it has from its supertypes, supertypes first, in the metamodel's order,
  // each once: { feature, of }.
  function allFeatures(metaclass) {
    const out = [];
    const seen = new Set();
    const names = new Set();
    (function walk(name) {
      if (seen.has(name) || !METAMODEL[name]) return;
      seen.add(name);
      (METAMODEL[name].general || []).forEach(walk);
      (METAMODEL[name].fields || []).forEach((f) => { if (!names.has(f.name)) { names.add(f.name); out.push({ feature: f, of: name }); } });
    })(metaclass);
    return out;
  }
  // Whether a feature is an attribute SysON's tabs show a widget for: one value, of a primitive type or an enumeration.
  // A list (aliasIds) and a reference get none here; SysON shows the changeable references, which the canvas edits as
  // its lines and its Typed by, Specializes and Subsets.
  function shownAttribute(f) {
    const primitive = ['Boolean', 'String', 'Integer', 'Real'].indexOf(f.type) >= 0 || !!(METAMODEL[f.type] && METAMODEL[f.type].literals);
    return primitive && f.upper !== '*';
  }
  // The fields an item's kind lists, by the attribute each holds.
  function heldFields(type, item) {
    const table = type === 'el' ? KINDS : type === 'rel' ? RELATIONSHIPS : null;
    const list = table ? table[item.kind].fields : VIEW_KINDS[item.kind].fields;
    const out = {};
    list.forEach((fld) => { if (FIELDS[fld] && FIELDS[fld].attribute) out[FIELDS[fld].attribute] = fld; });
    return out;
  }
  // The qualified name of a line: the path of the element it is declared in, or the package, and its name; '' while
  // it has none.
  function lineQualified(model, rel, ids) {
    const name = String(rel.name || '').trim();
    if (!name) return '';
    const owner = RELATIONSHIPS[rel.kind].owner ? RELATIONSHIPS[rel.kind].owner(model, rel, ids) : null;
    const home = owner ? ids.get(owner) : null;
    return (home ? qualified(model, home, ids) : quote(model.package.name)) + '::' + quote(name);
  }
  // The value the canvas knows for an attribute or end it doesn't keep as a field, or undefined when it can't say: the
  // element's id; its name, as it is written; its qualified name; that it is not a library's; a line's ends.
  function knownValue(model, type, item, name, ids) {
    if (name === 'elementId') return item.id;
    if (name === 'isLibraryElement') return false;
    if (name === 'name') {
      // An element whose kind has no name in the text (a start node) has none to give; an unnamed one's is empty.
      if (type === 'el') { const n = textName(item); return n === null ? undefined : n; }
      return type === 'view' || RELATIONSHIPS[item.kind].fields.indexOf('name') >= 0 ? String(item.name || '').trim() : undefined;
    }
    if (type === 'view' && name === 'exposedElement') {
      // What the view shows: a browser view every element under its roots; any other view what its layout holds.
      if (VIEW_KINDS[item.kind].renderer === 'browser') return 'every element under its roots';
      const shown = Object.keys(item.layout || {}).map((id) => ids.get(id)).filter(Boolean)
        .map((e) => (textName(e) === null ? KINDS[e.kind].label : textName(e) || '(unnamed)'));
      return shown.length ? shown.slice(0, 6).join(', ') + (shown.length > 6 ? ' and ' + (shown.length - 6) + ' more' : '') : 'nothing yet';
    }
    if (name === 'qualifiedName') {
      if (type === 'el') return qualified(model, item, ids);
      if (type === 'view') return quote(model.package.name) + '::' + quote(String(item.name || '').trim() || 'unnamed');
      return lineQualified(model, item, ids);
    }
    if (type === 'rel' && (name === 'general' || name === 'type' || name === 'specific' || name === 'typedFeature')) {
      const end = ids.get(name === 'general' || name === 'type' ? item.to : item.from);
      return end ? describe(model, end, ids) : undefined;
    }
    return undefined;
  }
  // What the details view shows for an item (type 'el', 'rel' or 'view'): { metaclass, title, core, advanced }. core
  // is a row per core feature, in SysON's order; advanced a row per other attribute of the metaclass, supertypes'
  // first. A row is { name, label, field } when a field of the item's kind holds it (the panel's own input), { name,
  // label, value } when the canvas knows its value (shown, not edited), or { name, label, held: false } when the canvas
  // can't set it yet.
  function detailsOf(model, type, item) {
    const ids = idsOf(model);
    const metaclass = metaclassOf(type, item);
    const held = heldFields(type, item);
    const row = (name) => {
      const label = words(name);
      if (held[name]) return { name: name, label: label, field: held[name] };
      const value = knownValue(model, type, item, name, ids);
      return value === undefined ? { name: name, label: label, held: false } : { name: name, label: label, value: value };
    };
    const core = coreFeatures(metaclass);
    const advanced = allFeatures(metaclass).filter((x) => shownAttribute(x.feature) && core.indexOf(x.feature.name) < 0).map((x) => row(x.feature.name));
    return { metaclass: metaclass, title: detailsTitle(metaclass), core: core.map(row), advanced: advanced };
  }

  EXTRA.detailsOf = detailsOf;
  EXTRA.detailsTitle = detailsTitle;
  EXTRA.coreFeatures = coreFeatures;
  EXTRA.firstGeneral = firstGeneral;
  EXTRA.generals = generals;
})(typeof globalThis !== 'undefined' ? globalThis : window);
