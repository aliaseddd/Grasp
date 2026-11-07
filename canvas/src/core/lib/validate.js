// The model library's checks: everything validate finds wrong, from the tables' rules and the features' hooks.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const {
    KINDS, RELATIONSHIPS, VIEW_KINDS, MULTIPLICITY, textName, reading, idsOf, childrenOf, shown, an, describe,
    inheritedFeature, boundsOk, RESERVED_NAMES
  } = lib;

  // What keeps the model from being correct SysML. Each problem names the element, relationship, or view it is about
  // (null: the package). The checks run in a reading of the model, so the helpers they ask answer from its lookups.
  function validate(model) {
    return reading(model, () => problemsOf(model));
  }
  function problemsOf(model) {
    const problems = [];
    const ids = idsOf(model);
    const add = (id, message) => problems.push({ id, message });
    const siblings = new Map();
    const definitionNames = new Set(model.elements.filter((e) => KINDS[e.kind].definition).map(textName).filter(Boolean));
    const inRelationship = new Set();
    model.relationships.forEach((r) => { inRelationship.add(r.from); inRelationship.add(r.to); });
    const pkgName = model.package.name.trim();
    for (const el of model.elements) {
      const kind = KINDS[el.kind];
      // An element with no name in the text (null: a start node) is never unnamed ('').
      const name = textName(el);
      const owner = el.owner !== undefined ? ids.get(el.owner) : null;
      const where = owner ? ' in ' + shown(textName(owner)) : '';
      if (name === '') {
        if (kind.definition) add(el.id, an(kind.label, true) + ' has no name.');
        else if (inRelationship.has(el.id) || childrenOf(model, el.id).length) add(el.id, an(kind.label, true) + where + ' has no name, so nothing can refer to it. Name it.');
      }
      if (el.multiplicity && (!MULTIPLICITY.test(el.multiplicity) || !boundsOk(el.multiplicity))) {
        add(el.id, 'The multiplicity "' + el.multiplicity + '" of ' + describe(model, el, ids) + ' is not like 1, 0..1, or 1..*.');
      }
      // The name rules are for names the text writes: an element with no name in the text (a start node, which the page
      // names start1 for itself) takes no part in them.
      if (name) {
        // Two with one name beside each other: both are marked, since either could be the one to rename.
        const key = (el.owner === undefined ? '' : el.owner) + '/' + name;
        const twin = siblings.get(key);
        if (twin) {
          const message = 'Two elements are named ' + name + (owner ? where : ' in the package') + '.';
          if (!twin.marked) { twin.marked = true; add(twin.el.id, message); }
          add(el.id, message);
        } else siblings.set(key, { el: el, marked: false });
        if (kind.usage && definitionNames.has(name)) add(el.id, describe(model, el, ids) + ' is named like a definition, so the text would mix them up. Rename one.');
        if (name === pkgName) add(el.id, describe(model, el, ids) + ' is named like the package, so the text would mix them up. Rename one.');
        if (RESERVED_NAMES.has(name)) add(el.id, 'The name ' + name + ' belongs to the standard library. Rename ' + describe(model, el, ids) + '.');
        const inherited = owner ? inheritedFeature(model, owner, name, ids) : null;
        if (inherited && inherited.kind !== el.kind) {
          add(el.id, describe(model, el, ids) + ' is named like the ' + KINDS[inherited.kind].label + ' ' + name + ' that ' + shown(textName(owner)) + ' inherits. Rename it.');
        }
      }
      if (kind.check) kind.check(model, el, ids, add);
    }
    // Views: named like something at the top of the package, or two with one name; then the kind's own checks.
    const viewNames = new Map();
    for (const v of model.views) {
      const vname = v.name.trim();
      if (vname) {
        if (siblings.has('/' + vname) || vname === pkgName) add(v.id, 'The view ' + vname + ' is named like something else in the package. Rename one.');
        if (viewNames.has(vname)) add(v.id, 'Two views are named ' + vname + '. Rename one.');
        viewNames.set(vname, v);
      }
      const vkind = VIEW_KINDS[v.kind];
      if (vkind && vkind.check) vkind.check(model, v, ids, add);
    }
    // Relationships: the kind's rule on the pair of ends, then its own checks.
    for (const rel of model.relationships) {
      const a = ids.get(rel.from);
      const b = ids.get(rel.to);
      if (!a || !b) continue;
      const kind = RELATIONSHIPS[rel.kind];
      const problem = kind.ends(model, a, b, ids);
      if (problem) add(rel.id, problem);
      if (kind.check) kind.check(model, rel, ids, add);
    }
    return problems;
  }

  Object.assign(lib, { validate });
})(typeof globalThis !== 'undefined' ? globalThis : window);
