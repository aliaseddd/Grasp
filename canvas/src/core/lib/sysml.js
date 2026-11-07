// The model library's export: the model as textual SysML v2, from the tables' writers and the features' hooks.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const {
    KINDS, RELATIONSHIPS, VIEW_KINDS, MULTIPLICITY, textName, normalize, relIndex, reading, idsOf, linesFrom,
    childrenOf, typingOf, commonOwner, quote, shown, qualified, featurePath, nameable, describe, describeRel,
    inheritedFeature, BODY, noteRecords, noteStatements, commentLines
  } = lib;

  // The notes and the archived notes are written together, at the end of the package (noteRecords, noteStatements).
  // The text is written in a reading of the model, so the helpers the writers ask answer from its lookups.
  function toSysML(model, notes, archive) {
    model = normalize(model);
    return reading(model, () => textOf(model, notes, archive));
  }
  function textOf(model, notes, archive) {
    const ids = idsOf(model);
    const rels = relIndex(model);
    const noteList = noteRecords(notes, archive);
    const out = [];
    const imports = new Set();
    const line = (depth, text) => out.push('    '.repeat(depth) + text);
    const comment = (depth, head, text) => commentLines(depth, head, text).forEach((l) => out.push(l));
    const noteText = (n) => n.text + (n.response.trim() ? '\nClaude: ' + n.response.trim() : '');
    const listsBy = (list, key) => {
      const map = new Map();
      list.forEach((item) => { const k = key(item); if (map.has(k)) map.get(k).push(item); else map.set(k, [item]); });
      return map;
    };
    // The relationships written as statements in an element's body (null: the package's), by each kind's own rule,
    // each kind's owner asked once for each relationship; and the notes on each element or relationship.
    const declared = listsBy(model.relationships.filter((r) => RELATIONSHIPS[r.kind].toSysML), (r) => RELATIONSHIPS[r.kind].owner(model, r, ids));
    const declaredIn = (ownerId) => (declared.get(ownerId) || []).slice();
    const notesBy = listsBy(noteList, (n) => n.target);
    // What the hooks may use (a kind's head and body, a relationship kind's toSysML): line(depth, text) and
    // comment(depth, head, text) write out; needImport(qualifiedName) asks for a private import at the top of the
    // package; headOf(el) is the generated head of an element; the rest are the library's functions with the model
    // and its index filled in.
    const helpers = {
      ids: ids, line: line, comment: comment, noteText: noteText, quote: quote, featurePath: featurePath, shown: shown,
      notesOn: (id) => (notesBy.get(id) || []).slice(),
      // A note in its standard forms (noteStatements), written at depth through this object's own line, so a hook's
      // lines land where its other lines do; about null writes it inside the body it is in. Asks for the import.
      note: function (depth, n, about, text) { noteStatements(n, about, text).forEach((s) => this.line(depth, s)); imports.add('ModelingMetadata::*'); },
      needImport: (qualifiedName) => imports.add(qualifiedName),
      headOf: headOf, declaredIn: declaredIn, exposesOf: exposesOf,
      typingOf: (el) => typingOf(model, el),
      childrenOf: (id) => childrenOf(model, id),
      describe: (el) => describe(model, el, ids),
      commonOwner: (a, b) => commonOwner(model, a, b, ids),
      qualified: (el) => qualified(model, el, ids)
    };

    // The head of an element's declaration, everything before the ' {' or ';'. A feature declared again under the
    // name of one its owner inherits, of the same kind, redefines it: :>>.
    function headOf(el) {
      const kind = KINDS[el.kind];
      const owner = el.owner !== undefined ? ids.get(el.owner) : null;
      const name = textName(el);
      const inherited = owner && name ? inheritedFeature(model, owner, name, ids) : null;
      const redefines = !!inherited && inherited.kind === el.kind;
      // A usage may go unnamed ("part : Host;"); a definition can't, so an unnamed one is written as unnamed.
      const written = name ? quote(name) : (kind.definition ? quote('unnamed') : '');
      let head = (el.abstract ? 'abstract ' : '') + kind.keyword + (redefines ? ' :>> ' + quote(name) : (written ? ' ' + written : ''));
      if (kind.usage) {
        const typing = typingOf(model, el);
        if (typing) head += ' : ' + (el.conjugated ? '~' : '') + quote(textName(ids.get(typing.to)));
        if (el.multiplicity && MULTIPLICITY.test(el.multiplicity)) head += ' [' + el.multiplicity + ']';
      }
      const general = linesFrom(model, el.id, 'Specialization').map((r) => quote(textName(ids.get(r.to))));
      if (general.length) head += ' :> ' + general.join(', ');
      return head;
    }
    // The head an element is written with: the kind's head hook's when it has one (null: the element is not written),
    // else the generated one. Asked once per element, since the parent asks before the child is written.
    const heads = new Map();
    function headFor(el) {
      const kind = KINDS[el.kind];
      if (!heads.has(el.id)) heads.set(el.id, kind.head ? kind.head(model, el, helpers) : headOf(el));
      return heads.get(el.id);
    }
    // An element: its head, then, when there is anything to put in it, a body with the doc, what the body writers and
    // the kind's body hook add, the children, and the relationships declared here; then what the kind's after hook
    // writes at the element's own depth. An element whose head is null is left out, with everything inside it (the
    // start and done nodes a view draws, which the notation has already). Returns whether anything was written.
    function element(el, depth) {
      const kind = KINDS[el.kind];
      const head = headFor(el);
      if (head === null) return false;
      // The children that are written, in the order they are written: by their kinds' writeOrder (lower first; every
      // core kind is at 0), then the border items before the boxes, then as the model has them (the sort is stable).
      const rank = (k) => (KINDS[k.kind].onBorder ? 0 : 1);
      const kids = childrenOf(model, el.id).filter((k) => headFor(k) !== null)
        .sort((a, b) => ((KINDS[a.kind].writeOrder || 0) - (KINDS[b.kind].writeOrder || 0)) || (rank(a) - rank(b)));
      const declared = declaredIn(el.id);
      // The hooks write into lines of their own first, so an element with nothing else gets a body when they add to it.
      const extra = [];
      const into = Object.assign({}, helpers, { line: (d, t) => extra.push('    '.repeat(d) + t), comment: (d, h, t) => commentLines(d, h, t).forEach((l) => extra.push(l)) });
      BODY.forEach((write) => write(model, el, depth + 1, into));
      if (kind.body) kind.body(model, el, depth + 1, into);
      if (!el.doc.trim() && !extra.length && !kids.length && !declared.length) line(depth, head + ';');
      else {
        line(depth, head + ' {');
        if (el.doc.trim()) comment(depth + 1, 'doc', el.doc);
        extra.forEach((l) => out.push(l));
        kids.forEach((k) => element(k, depth + 1));
        declared.forEach((r) => RELATIONSHIPS[r.kind].toSysML(model, r, el.id, depth + 1, out, helpers));
        line(depth, '}');
      }
      // What follows the element at its own depth, right after its line or its closing brace (a decision's "if g then
      // a;" lines after its "decide d;").
      if (kind.after) kind.after(model, el, depth, helpers);
      return true;
    }
    // The expose lines a view's layout gives: everything when every element is shown, else each shown element by its
    // qualified name (a start, done or initial node has no name in the text, nor has anything inside an unnamed
    // element, so those are left out). A kind's exposes hook may build on them through h.exposesOf(view).
    function exposesOf(v) {
      const shownCount = Object.keys(v.layout).length;
      return shownCount && shownCount === model.elements.length
        ? ['expose ' + quote(model.package.name) + '::*::**;']
        : model.elements.filter((e) => v.layout[e.id] && nameable(model, e, ids)).map((e) => 'expose ' + qualified(model, e, ids) + ';');
    }

    line(0, 'package ' + quote(model.package.name) + ' {');
    if (model.package.doc.trim()) comment(1, 'doc', model.package.doc);
    const importAt = out.length; // where the imports the bodies ask for go, once they are known
    const top = childrenOf(model, null);
    const ordered = top.filter((e) => KINDS[e.kind].definition).concat(top.filter((e) => !KINDS[e.kind].definition));
    ordered.forEach((el) => { out.push(''); if (!element(el, 1)) out.pop(); });
    const topRels = declaredIn(null);
    if (topRels.length) out.push('');
    topRels.forEach((r) => RELATIONSHIPS[r.kind].toSysML(model, r, null, 1, out, helpers));

    // Notes, in the standard library's forms at the end of the package (noteStatements): each an Issue named <nN>
    // about what it is on, with its status and Claude's answer about it, a blank line between notes. A note on a
    // specializes or defined-by line, which has no name in the textual notation, is about both of the line's ends,
    // with the line named in the text; a free note is about nothing, so it annotates the package; a note inside an
    // unnamed relationship's body is written there by the relationship's own toSysML (h.note), and a note on an element
    // the text can't name inside the element's body (writeBodyNotes).
    for (const n of noteList) {
      const el = n.target === null ? null : ids.get(n.target);
      const rel = n.target === null ? null : rels.get(n.target);
      let about = null;
      let text = n.text;
      if (el) {
        if (!nameable(model, el, ids)) continue; // written inside the element's body
        about = qualified(model, el, ids);
      } else if (rel && RELATIONSHIPS[rel.kind].toSysML) {
        if (!rel.name || !rel.name.trim()) continue; // written inside the relationship's body
        const o = RELATIONSHIPS[rel.kind].owner(model, rel, ids);
        about = (o ? qualified(model, ids.get(o), ids) : quote(model.package.name)) + '::' + quote(rel.name);
      } else if (rel) {
        about = qualified(model, ids.get(rel.from), ids) + ', ' + qualified(model, ids.get(rel.to), ids);
        text = 'On ' + describeRel(model, rel, ids) + ': ' + text;
      } else if (n.target !== null) {
        continue; // on something that is gone
      }
      out.push('');
      helpers.note(1, n, about, text);
    }

    // The views, each exposing what it shows (exposesOf), unless its kind says itself what the view's body holds (a
    // browser's layout is empty, so its kind's exposes hook does).
    for (const v of model.views) {
      if (!v.name.trim()) continue;
      const vkind = VIEW_KINDS[v.kind];
      const head = 'view ' + quote(v.name) + ' : ' + vkind.qualified;
      const exposes = vkind.exposes ? vkind.exposes(model, v, helpers) : exposesOf(v);
      out.push('');
      if (!v.doc.trim() && !exposes.length) { line(1, head + ';'); continue; }
      line(1, head + ' {');
      if (v.doc.trim()) comment(2, 'doc', v.doc);
      exposes.forEach((x) => line(2, x));
      line(1, '}');
    }
    line(0, '}');
    // The imports the bodies asked for: private, sorted, right after the package's doc, then a blank line unless the
    // next line is one already. Nothing asks for one yet, so the text is as it was.
    if (imports.size) {
      const lines = Array.from(imports).sort().map((q) => '    private import ' + q + ';');
      if (out[importAt] !== '') lines.push('');
      out.splice.apply(out, [importAt, 0].concat(lines));
    }
    return out.join('\n') + '\n';
  }

  Object.assign(lib, { toSysML });
})(typeof globalThis !== 'undefined' ? globalThis : window);
