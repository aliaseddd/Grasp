// A throwaway reading of fieldHooks.ts's contract, to check that it can be met and to pin numbers. Not for the implementer.
export function make(app, lib) {
  const LOOKS = app.FIELD_LOOKS, ORDER = app.GROUP_ORDER, GROUPS = app.GROUP_NAMES;
  const UNNAMED = app.UNNAMED, NOTHING = app.NOTHING;
  const named = (el) => lib.textName(el) || UNNAMED;
  const whatOf = (model, type, item) => (type === 'el' ? lib.describe(model, item) : type === 'rel' ? 'the ' + lib.describeRel(model, item) : lib.describeView(model, item));
  const general = (verb, noun) => ({
    none: 'nothing: take the line away',
    shown: (x) => !!lib.firstGeneral(x.model, x.item),
    value: (x) => { const r = lib.firstGeneral(x.model, x.item); return r ? r.to : ''; },
    write: (x, v) => { const r = lib.firstGeneral(x.model, x.item); if (!r) return; if (!v) { x.model.relationships.splice(x.model.relationships.indexOf(r), 1); return; } r.to = v; },
    said: (x) => { const r = lib.firstGeneral(x.model, x.item); const g = r ? x.model.elements.find((e) => e.id === r.to) : null; return g ? 'Made ' + lib.describe(x.model, x.item) + ' ' + verb + ' ' + named(g) : 'Took away the ' + noun + ' of ' + lib.describe(x.model, x.item); },
  });
  const HOOKS = {
    name: { said: (x) => (x.type === 'el' ? 'Renamed to ' + lib.describe(x.model, x.item) : x.type === 'rel' ? 'Named the ' + lib.describeRel(x.model, x.item) : 'Renamed the view to ' + (String(x.item.name).trim() || UNNAMED)) },
    abstract: { said: (x) => (x.item.abstract ? 'Made abstract: ' : 'Made concrete: ') + lib.describe(x.model, x.item) },
    conjugated: { said: (x) => (x.item.conjugated ? 'Conjugated ' : 'Unconjugated ') + lib.describe(x.model, x.item) },
    doc: { said: (x) => 'Wrote the doc of ' + whatOf(x.model, x.type, x.item) },
    type: {
      none: 'nothing yet',
      value: (x) => { const t = lib.typingOf(x.model, x.item); return t ? t.to : ''; },
      write: (x, v) => {
        const t = lib.typingOf(x.model, x.item);
        if (!v) { if (t) x.model.relationships.splice(x.model.relationships.indexOf(t), 1); return; }
        if (t) { t.to = v; return; }
        let id; do { id = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); } while (x.model.relationships.some((r) => r.id === id));
        x.model.relationships.push({ id, kind: 'FeatureTyping', from: x.item.id, to: v, hidden: true });
      },
      said: (x) => { const t = lib.typingOf(x.model, x.item); const d = t ? x.model.elements.find((e) => e.id === t.to) : null; return d ? 'Defined ' + lib.describe(x.model, x.item) + ' by ' + named(d) : 'Undefined ' + lib.describe(x.model, x.item); },
    },
    typeLine: {
      shown: (x) => !!lib.typingOf(x.model, x.item),
      value: (x) => { const t = lib.typingOf(x.model, x.item); return !!t && !t.hidden; },
      write: (x, v) => { const t = lib.typingOf(x.model, x.item); if (!t) return; if (v) delete t.hidden; else t.hidden = true; },
      said: (x) => { const t = lib.typingOf(x.model, x.item); return t ? (t.hidden ? 'Hid the line ' : 'Drew the line ') + lib.describeRel(x.model, t) : null; },
    },
    specializes: general('specialize', 'specialization'),
    subsets: general('subset', 'subsetting'),
    parallel: { locked: (x) => { const ids = lib.idsOf(x.model); return lib.linesOfKind(x.model, 'TransitionUsage').some((r) => lib.RELATIONSHIPS.TransitionUsage.owner(x.model, r, ids) === x.item.id) ? 'Is Parallel can\'t change while ' + lib.describe(x.model, x.item) + ' holds transitions, as in SysON.' : null; } },
    order: { locked: () => app.ORDER_LOCKED },
  };
  const find = (model, p) => (p.type === 'el' ? lib.idsOf(model).get(p.id) : p.type === 'rel' ? model.relationships.find((r) => r.id === p.id) : model.views.find((v) => v.id === p.id)) || null;
  const listed = (type, item) => (type === 'el' ? lib.KINDS : type === 'rel' ? lib.RELATIONSHIPS : lib.VIEW_KINDS)[item.kind].fields;
  const viewKindFor = (model, id, viewId) => {
    const front = model.views.find((v) => v.id === viewId) || null;
    const view = front && front.layout[id] ? front : model.views.find((v) => !!v.layout[id]) || front;
    return view ? view.kind : null;
  };
  const xOf = (model, type, item, field) => ({ lib, model, type, item, field, spec: lib.FIELDS[field] });
  const valueOf = (x) => { const h = HOOKS[x.field]; return h && h.value ? h.value(x) : x.item[x.field]; };
  const has = (model, type, item, field, kind) => {
    const spec = lib.FIELDS[field];
    if (!listed(type, item).includes(field) || !spec || spec.type === 'list' || !LOOKS[field]) return false;
    if (spec.views && !spec.views.includes(kind)) return false;
    const h = HOOKS[field];
    return !(h && h.shown && !h.shown(xOf(model, type, item, field)));
  };
  const fieldRow = (model, type, item, field) => {
    const x = xOf(model, type, item, field); const spec = x.spec; const look = LOOKS[field]; const h = HOOKS[field] || {};
    const v = valueOf(x);
    const row = { row: 'field', field, label: look.label, type: spec.type, value: v, locked: h.locked ? h.locked(x) : null };
    if (spec.type === 'bool') row.value = v === true;
    else if (spec.type === 'enum') { row.value = spec.values.includes(v) ? v : spec.values[0]; row.choices = spec.values.map((value) => ({ value, label: (look.choices && look.choices[value]) ?? value })); }
    else if (spec.type === 'ref') { const el = typeof v === 'string' && v ? lib.idsOf(model).get(v) : null; row.value = el ? v : ''; row.choice = el ? { id: v, label: named(el) } : { id: '', label: h.none || NOTHING }; }
    else if (spec.type === 'number') row.value = typeof v === 'number' && Number.isFinite(v) ? v : '';
    else row.value = v === undefined || v === null ? '' : String(v);
    if (look.placeholder) row.placeholder = look.placeholder;
    return row;
  };
  function formOf(session, picked, viewId) {
    const model = session.model;
    return lib.reading(model, () => {
      const item = find(model, picked);
      if (!item) return null;
      const d = lib.detailsOf(model, picked.type, item);
      const kind = viewKindFor(model, picked.id, viewId);
      const ok = (f) => has(model, picked.type, item, f, kind);
      const rowOf = (r) => (r.field ? (ok(r.field) ? fieldRow(model, picked.type, item, r.field) : null) : r.value !== undefined ? { row: 'known', name: r.name, label: r.label, value: r.value } : { row: 'notHeld', name: r.name, label: r.label });
      const placed = new Set(d.core.concat(d.advanced).filter((r) => r.field).map((r) => r.field));
      const own = (g) => ORDER[g].filter((f) => !placed.has(f) && ok(f));
      const main = d.core.map(rowOf).filter(Boolean).concat(own('main').filter((f) => f !== 'doc').map((f) => fieldRow(model, picked.type, item, f)));
      if (own('main').includes('doc')) main.push(fieldRow(model, picked.type, item, 'doc'));
      const core = [{ name: 'main', rows: main }].concat(GROUPS.slice(1).map((g) => ({ name: g, rows: own(g).map((f) => fieldRow(model, picked.type, item, f)) }))).filter((g) => g.rows.length);
      return { type: picked.type, id: picked.id, what: picked.type === 'rel' ? lib.describeRel(model, item) : whatOf(model, picked.type, item), title: d.title, core, advanced: d.advanced.map(rowOf).filter(Boolean) };
    });
  }
  function optionsOf(session, picked, field) {
    const model = session.model;
    return lib.reading(model, () => {
      const item = find(model, picked); const spec = lib.FIELDS[field];
      if (!item || !spec || spec.type !== 'ref' || !has(model, picked.type, item, field, viewKindFor(model, picked.id, null))) return [];
      const h = HOOKS[field] || {};
      const out = [{ id: '', label: h.none || NOTHING }].concat(spec.options(model, item).map((e) => ({ id: e.id, label: named(e) })));
      const row = fieldRow(model, picked.type, item, field);
      if (row.choice.id && !out.some((o) => o.id === row.choice.id)) out.push(row.choice);
      return out;
    });
  }
  const readText = (spec, text) => (spec.type === 'number' ? (text.trim() !== '' && Number.isFinite(+text) ? +text : '') : spec.trim ? text.trim() : text);
  function changeField(session, picked, field, value, key) {
    const model = session.model;
    const pre = lib.reading(model, () => {
      const item = find(model, picked); const spec = lib.FIELDS[field];
      if (!item || !has(model, picked.type, item, field, viewKindFor(model, picked.id, changeField.view ?? null))) return null;
      const x = xOf(model, picked.type, item, field); const h = HOOKS[field] || {};
      if (h.locked && h.locked(x)) return null;
      if (spec.type === 'enum' && !spec.values.includes(value)) return null;
      if (value === valueOf(x)) return null;
      return x;
    });
    if (!pre) return null;
    const h = HOOKS[field] || {};
    return session.history.edit(() => {
      if (h.write) h.write(pre, value); else pre.item[field] = value;
      return lib.reading(model, () => {
        if (h.said) return h.said(pre);
        const v = valueOf(pre);
        let said = v === '' || v === undefined || v === null ? NOTHING : String(v);
        if (pre.spec.type === 'ref' && v) { const e = lib.idsOf(model).get(v); said = e ? named(e) : NOTHING; }
        return 'Set the ' + pre.spec.label + ' of ' + whatOf(model, pre.type, pre.item) + ' to ' + said;
      });
    }, key);
  }
  function endTyping(session, key) { const steps = session.history.steps; const top = steps[steps.length - 1]; if (top && top.key === key) session.history.endEdit(); }
  return { formOf, optionsOf, readText, changeField, endTyping, viewKindFor, whatOf, HOOKS };
}
