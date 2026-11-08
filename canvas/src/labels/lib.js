// Label editing in the model library: what a label's text says (readLabel), the text a label's editor starts from
// (labelText), and what that text changes in the model (applyLabel). It is SysON's direct edit, taken from SysON's user
// manual (model-management.adoc, "Direct edit tool and shortcuts"; manage-labels-diagram.adoc) and from the inventory
// in docs/sysml/syson/features/sysml-views.md ("Direct edit & label syntax"). The canvas draws no compartment rows, so
// every label it edits is read the way SysON reads a node's label: prefix keywords, ref, a short name in <>, the name,
// a multiplicity in [], then : Type, :> General and :>> Redefined, each with a multiplicity after it or not.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const { KINDS, RELATIONSHIPS, str, textName, idsOf, chain, childrenOf, linesFrom, typingOf, describe, describeRel, an, EXTRA } = lib;

  // ---- Reading what was typed.

  // The keywords a node's label may open with, each followed by white space, in any order (SysON's node rule), and
  // ref after them. A keyword with no white space after it is the start of a name: abstractPart.
  const PREFIX = /^(abstract|variation|variant|timeslice|snapshot)\s+/;
  const REF = /^ref\s+/;
  // The words that end a name or a reference when white space comes before them; what follows them is not read as the
  // name. default opens a value; ordered and nonunique are a feature's suffixes, which a node's label doesn't take.
  const CLOSING = /^\s(default|ordered|nonunique)(?![A-Za-z0-9_])/;
  const MULTIPLICITY = /^(-?\d+|\*)(?:\s*\.\.\s*(-?\d+|\*))?$/;

  // Where the name that starts at i ends: at a colon (:, :>, :>>, ::, :=), a bracket, an equals sign, or a closing word.
  // The manual lists = among what a name can't hold, since it opens a value.
  function nameEnd(text, i) {
    for (let j = i; j < text.length; j++) {
      const c = text[j];
      if (c === ':' || c === '[' || c === '=') return j;
      if (/\s/.test(c) && CLOSING.test(text.slice(j))) return j;
    }
    return text.length;
  }
  // Where a step of a reference that isn't quoted ends: as a name does, and at the :: before the next step.
  const stepEnd = nameEnd;
  // The quoted name that opens at i, as { name, end } (end just past the closing quote), or null when no quote closes
  // it. The text writes \' for a quote inside it and \\ for a backslash.
  function quoted(text, i) {
    let name = '';
    for (let j = i + 1; j < text.length; j++) {
      const c = text[j];
      if (c === '\\' && j + 1 < text.length) { name += text[++j]; continue; }
      if (c === '\'') return { name: name, end: j + 1 };
      name += c;
    }
    return null;
  }
  function skipSpace(text, i) {
    while (i < text.length && /\s/.test(text[i])) i++;
    return i;
  }
  // The reference that starts at i, after an operator: { steps, conjugated, end }. A step is a name, quoted or not; an
  // unquoted one keeps its inner spaces (: My Type names My Type); :: goes from one step to the next. steps is null when
  // nothing follows the operator, and bad is true when a step is empty (A::, ::B).
  function readReference(text, i, tilde) {
    let j = skipSpace(text, i);
    let conjugated = false;
    if (tilde && text[j] === '~') { conjugated = true; j = skipSpace(text, j + 1); }
    const steps = [];
    for (;;) {
      j = skipSpace(text, j);
      const q = text[j] === '\'' ? quoted(text, j) : null;
      if (q) { steps.push(q.name); j = q.end; }
      else { const e = stepEnd(text, j); steps.push(text.slice(j, e).trim()); j = e; }
      const k = skipSpace(text, j);
      if (text.startsWith('::', k) && text[k + 2] !== '>') { j = k + 2; continue; }
      break;
    }
    if (steps.length === 1 && steps[0] === '') return { steps: null, conjugated: conjugated, end: j };
    return { steps: steps, conjugated: conjugated, end: j, bad: steps.some((s) => s === '') };
  }
  // A reference as it was typed, for the words that say what wasn't kept.
  function referenceText(steps) { return steps.map((s) => (/[\s:'[\]=]/.test(s) ? '\'' + s.replace(/\\/g, '\\\\').replace(/'/g, '\\\'') + '\'' : s)).join('::'); }

  // What a label's text says, part by part, the way SysON's direct edit reads a node's label. Each part is there only
  // when the text has it:
  // - prefixes: the keywords before the name (abstract, variation, variant, timeslice, snapshot); ref: true after them;
  // - short: the short name in <> before the name ('' for <>);
  // - name: the name, its inner spaces kept and its ends trimmed; absent when the text starts with another part;
  // - multiplicity: { text } with the bounds as the canvas writes them ('1..*'), '' for [], which takes it away;
  // - typing (:), subsets (:>) and redefines (:>>): { steps, conjugated } for a reference (conjugated: the typing had ~),
  //   or { remove: true } for an operator with nothing after it, which takes that part away when it is the first part
  //   after the name, as in SysON;
  // - value: what follows =, := or default, which a label never sets; suffixes: ordered or nonunique, which only a
  //   compartment row takes;
  // - unread: what couldn't be read (a multiplicity like [a], a second typing, a step after ::), as typed.
  // blank is true when the text is nothing but white space, which takes the name away.
  function readLabel(text) {
    const s = str(text);
    const out = { prefixes: [], ref: false, suffixes: [], unread: [], blank: s.trim() === '' };
    if (out.blank) return out;
    let i = skipSpace(s, 0);
    for (let m = PREFIX.exec(s.slice(i)); m; m = PREFIX.exec(s.slice(i))) { out.prefixes.push(m[1]); i += m[0].length; }
    const ref = REF.exec(s.slice(i));
    if (ref) { out.ref = true; i += ref[0].length; }
    const short = /^<([^>]*)>/.exec(s.slice(i));
    if (short) { out.short = short[1].trim(); i += short[0].length; }
    const end = nameEnd(s, i);
    const name = s.slice(i, end).trim();
    if (name) out.name = name;
    i = end;
    let first = true;   // no typing, subsetting or redefinition read yet
    while ((i = skipSpace(s, i)) < s.length) {
      const rest = s.slice(i);
      if (rest[0] === '[') {
        const close = s.indexOf(']', i);
        if (close < 0) { out.unread.push(rest.trim()); break; }
        const inner = s.slice(i + 1, close).trim();
        const m = MULTIPLICITY.exec(inner);
        if (out.multiplicity || (inner && !m)) out.unread.push('[' + inner + ']');
        else out.multiplicity = { text: !inner ? '' : m[2] === undefined ? m[1] : m[1] + '..' + m[2] };
        i = close + 1;
        continue;
      }
      if (rest.startsWith(':=') || rest[0] === '=' || /^default(?![A-Za-z0-9_])/.test(rest)) { out.value = rest.trim(); break; }
      const word = /^(ordered|nonunique)(?![A-Za-z0-9_])/.exec(rest);
      if (word) { out.suffixes.push(word[1]); i += word[0].length; continue; }
      const op = /^(::>|::|:>>|:>|:)/.exec(rest);
      if (op) {
        const r = readReference(s, i + op[1].length, op[1] === ':');
        const typed = s.slice(i, r.end).trim();
        i = r.end;
        const part = op[1] === ':' ? 'typing' : op[1] === ':>' ? 'subsets' : op[1] === ':>>' ? 'redefines' : null;
        // A reference subsetting (::>) and a bare :: have no rule in a node's label, and only one of :> and :>> is read.
        const taken = part === 'typing' ? out.typing : out.subsets || out.redefines;
        if (!part || r.bad || taken || (!r.steps && (!first || r.conjugated))) { out.unread.push(typed); first = false; continue; }
        out[part] = r.steps ? { steps: r.steps, conjugated: r.conjugated } : { remove: true };
        first = false;
        continue;
      }
      // Anything else: up to where a name would end, or one character.
      const e = Math.max(nameEnd(s, i + 1), i + 1);
      out.unread.push(s.slice(i, e).trim());
      i = e;
    }
    return out;
  }

  // ---- Finding what a reference names.

  // The elements a simple name may mean, seen from an element (null: the package), nearest first, as SysON looks: the
  // element's own members, then those of each owner going out, then the package's, then anywhere in the model. found is
  // the first that accept(e) takes; near is the first element with the name, in scope, that it refuses, which says why
  // nothing in scope fits. The element looked from is never one of them: SysON keeps a usage from finding itself.
  function lookUp(model, from, steps, accept) {
    const ids = idsOf(model);
    if (steps.length > 1) {
      // A qualified name is a path from the package: its first step the package's name, or an element at the top.
      let path = steps.slice();
      if (path[0] === str(model.package && model.package.name).trim() && path.length > 1) path = path.slice(1);
      let at = null;
      for (const step of path) {
        at = childrenOf(model, at ? at.id : null).find((c) => textName(c) === step) || null;
        if (!at) return { found: null, near: null };
      }
      return accept(at) ? { found: at, near: null } : { found: null, near: at };
    }
    const name = steps[0];
    const scopes = from ? chain(model, from, ids).reverse().map((e) => e.id) : [];
    scopes.push(null);
    let near = null;
    for (const scope of scopes) {
      for (const c of childrenOf(model, scope)) {
        if (textName(c) !== name || (from && c.id === from.id)) continue;
        if (accept(c)) return { found: c, near: null };
        if (!near) near = c;
      }
    }
    const anywhere = model.elements.find((e) => textName(e) === name && (!from || e.id !== from.id) && accept(e));
    return { found: anywhere || null, near: anywhere ? null : near };
  }
  // A name as a step of a reference in a label: as it is, when reading it back gives it whole; else quoted.
  function stepText(name) {
    const plain = name !== '' && name === name.trim() && name[0] !== '\'' && name[0] !== '~' && name[0] !== '<' &&
      nameEnd(name, 0) === name.length && name.indexOf('::') < 0;
    return plain ? name : '\'' + name.replace(/\\/g, '\\\\').replace(/'/g, '\\\'') + '\'';
  }
  // How a label names target, seen from an element: by its name when that finds it, else by its path from the package.
  // null when the target, or something it is in, has no name to give.
  function reference(model, from, target, accept) {
    const name = textName(target);
    if (!name) return null;
    if (lookUp(model, from, [name], accept).found === target) return stepText(name);
    const steps = chain(model, target).map(textName);
    if (steps.some((s) => !s)) return null;
    return [str(model.package && model.package.name).trim() || 'Model'].concat(steps).map(stepText).join('::');
  }

  // ---- The text an editor starts from.

  // The lines whose label can be edited, and how much of it: SysON edits a binding's, a flow's, an interface's and a
  // connection's name, typing and multiplicity only (restricted), and a succession's with the whole rule. A message is
  // a flow too. A transition's label (trigger [guard] / effect) is not edited, and neither are the specialization and
  // defined-by lines, which have none.
  const LINE_LABELS = {
    ConnectionUsage: 'restricted', InterfaceUsage: 'restricted', FlowConnectionUsage: 'restricted',
    BindingConnectorAsUsage: 'restricted', Message: 'restricted', SuccessionAsUsage: 'whole'
  };
  // Whether an element's or a line's label can be edited: an element with a name in the text (not a start, a done or
  // an initial node), a line of LINE_LABELS. type is 'el' or 'rel'.
  function labelEditable(type, item) {
    if (!item) return false;
    if (type === 'el') return !!KINDS[item.kind] && textName(item) !== null;
    return type === 'rel' && !!LINE_LABELS[item.kind];
  }
  // Whether a browser row can be renamed: an element with a name in the text, or a line with a name.
  function renamable(type, item) {
    if (!item) return false;
    if (type === 'el') return !!KINDS[item.kind] && textName(item) !== null;
    return type === 'rel' && !!RELATIONSHIPS[item.kind] && RELATIONSHIPS[item.kind].fields.indexOf('name') >= 0;
  }
  // The element a line is declared in (null: the package), which its references are looked up from.
  function lineHome(model, rel) {
    const ids = idsOf(model);
    const owner = RELATIONSHIPS[rel.kind].owner ? RELATIONSHIPS[rel.kind].owner(model, rel, ids) : null;
    return owner ? ids.get(owner) || null : null;
  }
  // What a usage's typing may end on, and what an element may specialize: an element of the kind the usage is defined
  // by; an element of its own kind, never itself, and for a usage one in the same box.
  function typeTaker(el) { return (e) => e.kind === KINDS[el.kind].definedBy; }
  function generalTaker(el) {
    const usage = KINDS[el.kind].usage;
    return (e) => e !== el && e.id !== el.id && e.kind === el.kind && (!usage || e.owner === el.owner);
  }
  // The text a label's editor starts from, as SysON's: the name, the multiplicity right after it, then : Type (with ~
  // for a conjugated port) and :> General. A definition's label has no keyword before its name: SysON's starts with the
  // prefixes a usage has set (abstract, ref…), and a usage here holds none. A line's is its name, and an interface's
  // : Def after it. target is { type: 'el' or 'rel', item }.
  function labelText(model, target) {
    const item = target.item;
    const ids = idsOf(model);
    if (target.type === 'rel') {
      let s = str(item.name).trim();
      const def = item.kind === 'InterfaceUsage' && item.interfaceDef ? ids.get(item.interfaceDef) : null;
      const ref = def ? reference(model, lineHome(model, item), def, (e) => e.kind === 'InterfaceDefinition') : null;
      if (ref) s += ' : ' + ref;
      return s.trim();
    }
    const el = item;
    const kind = KINDS[el.kind];
    let s = textName(el) || '';
    if (kind.fields.indexOf('multiplicity') >= 0 && str(el.multiplicity).trim()) s += '[' + str(el.multiplicity).trim() + ']';
    if (kind.usage) {
      const typing = typingOf(model, el);
      const def = typing ? ids.get(typing.to) : null;
      const ref = def ? reference(model, el, def, typeTaker(el)) : null;
      if (ref) s += ' : ' + (el.conjugated && kind.fields.indexOf('conjugated') >= 0 ? '~' : '') + ref;
    }
    const general = linesFrom(model, el.id, 'Specialization').map((r) => ids.get(r.to)).find(Boolean);
    const ref = general ? reference(model, el, general, generalTaker(el)) : null;
    if (ref) s += ' :> ' + ref;
    return s.trim();
  }

  // ---- What a label's text changes.

  // Makes what a label's text says in the model, in place: the page calls it inside edit(). target is { type: 'el' or
  // 'rel', item } and text what was typed. make gives a new element or line the page's way: make.element(kind, name,
  // owner) and make.line(kind, from, to) return a new plain object, with its id and its fields at their starting values.
  // Returns what happened:
  // - done: what it changed, in words ("renamed it engine", "defined it by Wheel, a new part def"); nothing changed
  //   when it is empty;
  // - created: the elements it made, as the model holds them;
  // - notKept: the parts of the text the canvas doesn't hold yet (a short name, ref, a redefinition, a value…), as
  //   typed;
  // - unread: what couldn't be read, as typed;
  // - refused: sentences saying why a part wasn't made (a definition of another kind, a circle).
  // As in SysON, a part the text leaves out stays as it was (a name alone keeps the type), and a part that can't be
  // made leaves the others to be made. Keywords a usage here can't hold (abstract, variation, ref…) are not kept;
  // on a definition, SysON leaves them aside, and its abstract stays as it is.
  function applyLabel(model, target, text, make) {
    const parts = readLabel(text);
    const item = target.item;
    const res = { done: [], created: [], notKept: [], unread: parts.unread.slice(), refused: [] };
    const line = target.type === 'rel';
    if (!labelEditable(target.type, item)) return res;
    const restricted = line && LINE_LABELS[item.kind] === 'restricted';
    const kind = line ? null : KINDS[item.kind];
    const has = (fld) => (line ? RELATIONSHIPS[item.kind].fields : kind.fields).indexOf(fld) >= 0;
    const usage = line || kind.usage;   // a connector is a usage too
    // The name: the whole text blank takes it away; a text without one keeps it.
    if (parts.blank) {
      if (str(item.name) !== '') { item.name = ''; res.done.push('took its name away'); }
      return res;
    }
    if (parts.name !== undefined && parts.name !== str(item.name)) { item.name = parts.name; res.done.push('renamed it ' + parts.name); }
    // What the canvas doesn't hold yet: a usage's keywords (a definition's are left aside, as SysON does), a short name.
    parts.prefixes.forEach((p) => { if (usage && p !== 'variant') res.notKept.push(p); });
    if (parts.ref && usage) res.notKept.push('ref');
    if (parts.short) res.notKept.push('<' + parts.short + '>');
    // The multiplicity, on what has one.
    if (parts.multiplicity) {
      const m = parts.multiplicity.text;
      if (has('multiplicity')) {
        if (str(item.multiplicity) !== m) { item.multiplicity = m; res.done.push(m ? 'set its multiplicity to ' + m : 'took its multiplicity away'); }
      } else if (m) res.notKept.push('[' + m + ']');
    }
    if (parts.typing) applyTyping(model, target, parts.typing, make, res);
    if (parts.subsets) {
      if (line) { if (!restricted && !parts.subsets.remove) res.notKept.push(':> ' + referenceText(parts.subsets.steps)); }
      else applySpecialization(model, item, parts.subsets, make, res);
    }
    if (parts.redefines && !parts.redefines.remove && !restricted) res.notKept.push(':>> ' + referenceText(parts.redefines.steps));
    if (parts.value) res.notKept.push(parts.value);
    parts.suffixes.forEach((s) => res.notKept.push(s));
    return res;
  }
  // A new element, as the model holds it.
  function addElement(model, make, kind, name, owner) {
    const el = make.element(kind, name, owner);
    if (owner === undefined || owner === null) delete el.owner; else el.owner = owner;
    model.elements.push(el);
    return model.elements[model.elements.length - 1];
  }
  function addLine(model, make, kind, from, to) {
    const rel = make.line(kind, from, to);
    model.relationships.push(rel);
    return model.relationships[model.relationships.length - 1];
  }
  // The definition a reference names, or a new one when a simple name names nothing in scope, as SysON makes the
  // definition a typing names when it finds none: of kind, at the top of the package (definitions here are never
  // inside anything), or in owner. refuse(near) gives the sentence when something in scope has the name but can't be
  // it. Nothing is made beside something with the same name (the element edited, say: x :> x), which the checks would
  // refuse. Returns { el, created } or null when refused.
  function resolveOrMake(model, from, part, accept, kind, make, res, refuse, nothingThere, owner) {
    const look = lookUp(model, from, part.steps, accept);
    if (look.found) return { el: look.found, created: false };
    if (look.near) { res.refused.push(refuse(look.near)); return null; }
    if (part.steps.length > 1 || part.conjugated || !kind) { res.refused.push(nothingThere()); return null; }
    const taken = childrenOf(model, owner === undefined ? null : owner).find((c) => textName(c) === part.steps[0]);
    if (taken) {
      res.refused.push(taken === from || (from && taken.id === from.id)
        ? describe(model, taken) + ' can\'t be ' + (KINDS[kind].definition ? 'defined by' : 'made to ' + (KINDS[taken.kind].usage ? 'subset' : 'specialize')) + ' itself.'
        : describe(model, taken) + ' already has the name ' + part.steps[0] + ' there, so no ' + KINDS[kind].label + ' of that name is made.');
      return null;
    }
    const el = addElement(model, make, kind, part.steps[0], owner);
    res.created.push(el);
    return { el: el, created: true };
  }
  // : Type. A usage is defined by the definition it names (made when none has the name), its typing taking the new end
  // so the notes on it stay; ~ conjugates a port. An interface is defined by an interface def. A definition's typing is
  // left aside, as SysON does; what can't be defined by anything here isn't kept. A lone : takes the typing away.
  function applyTyping(model, target, typing, make, res) {
    const item = target.item;
    const ids = idsOf(model);
    if (target.type === 'rel') {
      if (item.kind !== 'InterfaceUsage') { if (!typing.remove) res.notKept.push(': ' + (typing.conjugated ? '~' : '') + referenceText(typing.steps)); return; }
      if (typing.remove) { if (item.interfaceDef) { item.interfaceDef = ''; res.done.push('took its interface def away'); } return; }
      if (typing.conjugated) { res.refused.push('Only a port\'s definition is conjugated with ~; an interface isn\'t.'); return; }
      const got = resolveOrMake(model, lineHome(model, item), typing, (e) => e.kind === 'InterfaceDefinition', 'InterfaceDefinition', make, res,
        (near) => 'The interface ' + (str(item.name).trim() || '(unnamed)') + ' can only be defined by an interface def; ' + describe(model, near, ids) + ' isn\'t one.',
        () => 'There is no interface def ' + referenceText(typing.steps) + ' to define the interface by.');
      if (got && item.interfaceDef !== got.el.id) {
        item.interfaceDef = got.el.id;
        res.done.push('defined it by ' + textName(got.el) + (got.created ? ', a new interface def' : ''));
      }
      return;
    }
    const el = item;
    const kind = KINDS[el.kind];
    if (kind.definition) return;
    const conj = kind.fields.indexOf('conjugated') >= 0;
    if (!kind.definedBy || kind.fields.indexOf('type') < 0) {
      if (!typing.remove) res.notKept.push(': ' + (typing.conjugated ? '~' : '') + referenceText(typing.steps));
      return;
    }
    const current = typingOf(model, el);
    if (typing.remove) {
      if (current) { model.relationships.splice(model.relationships.indexOf(current), 1); res.done.push('took its definition away'); }
      if (conj && el.conjugated) { el.conjugated = false; if (!current) res.done.push('unconjugated it'); }
      return;
    }
    if (typing.conjugated && !conj) { res.refused.push(an(kind.label, true) + ' isn\'t conjugated with ~; only a port is.'); return; }
    const defLabel = KINDS[kind.definedBy] ? KINDS[kind.definedBy].label : kind.definedBy;
    const got = resolveOrMake(model, el, typing, typeTaker(el), kind.definedBy, make, res,
      (near) => RELATIONSHIPS.FeatureTyping.ends(model, el, near, ids) || describe(model, el, ids) + ' can only be defined by ' + an(defLabel) + '.',
      () => typing.conjugated && typing.steps.length === 1
        ? 'There is no ' + defLabel + ' ' + referenceText(typing.steps) + ' to conjugate.'
        : 'There is no ' + defLabel + ' at ' + referenceText(typing.steps) + ' to define ' + describe(model, el, ids) + ' by.');
    if (!got) return;
    const def = got.el;
    let retyped = false;
    if (!current) {
      const rel = addLine(model, make, 'FeatureTyping', el.id, def.id);
      rel.hidden = true;   // a new typing shows as text, as one picked in the panel does
      retyped = true;
    } else if (current.to !== def.id) { current.to = def.id; retyped = true; }
    const flipped = conj && !!el.conjugated !== !!typing.conjugated;
    if (flipped) el.conjugated = !!typing.conjugated;
    if (retyped) res.done.push('defined it by ' + (typing.conjugated ? '~' : '') + textName(def) + (got.created ? ', a new ' + defLabel : ''));
    else if (flipped) res.done.push(typing.conjugated ? 'conjugated it' : 'unconjugated it');
  }
  // :> General. A definition specializes the definition it names, a usage subsets the usage it names in the same box
  // (the canvas's one line for both); the first such line takes the new end, or a new line is drawn. A simple name
  // that names nothing in scope makes the general one, as SysON does: a definition at the top of the package, a usage
  // beside the one that subsets it (SysON puts it in the package; here a subsetted usage must sit in the same box). The
  // canvas's rules for the line stand (same kind, same box, no circle). A lone :> takes the first line away.
  function applySpecialization(model, el, part, make, res) {
    const ids = idsOf(model);
    const kind = KINDS[el.kind];
    const first = linesFrom(model, el.id, 'Specialization')[0] || null;
    const verb = kind.usage ? 'subset' : 'specialize';
    if (part.remove) {
      if (first) { model.relationships.splice(model.relationships.indexOf(first), 1); res.done.push('took its ' + (kind.usage ? 'subsetting' : 'specialization') + ' away'); }
      return;
    }
    const got = resolveOrMake(model, el, part, generalTaker(el), el.kind, make, res,
      (near) => RELATIONSHIPS.Specialization.ends(model, el, near, ids) || describe(model, el, ids) + ' can\'t ' + verb + ' ' + describe(model, near, ids) + '.',
      () => 'There is no ' + kind.label + ' at ' + referenceText(part.steps) + ' for ' + describe(model, el, ids) + ' to ' + verb + '.',
      kind.usage ? el.owner : undefined);
    if (!got) return;
    const general = got.el;
    if (linesFrom(model, el.id, 'Specialization').some((r) => r.to === general.id)) return;
    const problem = RELATIONSHIPS.Specialization.ends(model, el, general, idsOf(model));
    if (problem) { res.refused.push(problem); return; }
    if (first) first.to = general.id; else addLine(model, make, 'Specialization', el.id, general.id);
    res.done.push((kind.usage ? 'made it subset ' : 'made it specialize ') + textName(general) + (got.created ? ', a new ' + kind.label : ''));
  }

  // What a label edit says: { what, log } for edit() (the Undo button's words, and the log's), from what applyLabel
  // returned; null when it changed nothing. target is the item after the change.
  function labelWords(model, target, res) {
    if (!res.done.length) return null;
    const what = 'Edited the label of ' + (target.type === 'rel' ? 'the ' + describeRel(model, target.item) : describe(model, target.item));
    return { what: what, log: what + ': ' + res.done.join(', ') };
  }
  // The status line's sentences for what a label edit couldn't make: the refusals, what isn't kept, what wasn't read.
  function labelLeftOut(res) {
    const out = res.refused.slice();
    if (res.notKept.length) out.push('Not kept, as the canvas doesn\'t hold it yet: ' + res.notKept.join(', ') + '.');
    if (res.unread.length) out.push('Couldn\'t read: ' + res.unread.join(', ') + '.');
    return out.join(' ');
  }

  EXTRA.readLabel = readLabel;
  EXTRA.labelText = labelText;
  EXTRA.applyLabel = applyLabel;
  EXTRA.labelEditable = labelEditable;
  EXTRA.renamable = renamable;
  EXTRA.labelWords = labelWords;
  EXTRA.labelLeftOut = labelLeftOut;
  EXTRA.LINE_LABELS = LINE_LABELS;
})(typeof globalThis !== 'undefined' ? globalThis : window);
