// A reference port of fieldHooks.ts by its contract comment, for probing the test list. Not in the repo.
export const UNNAMED = '(unnamed)', NOTHING = 'nothing';
export const ORDER_LOCKED = 'The order can\'t be changed here yet. The old page changes it until slice 2.';
export function make(app) {
  const { FIELD_LOOKS, GROUP_ORDER } = app;
  const tableOf = (lib, type) => type === 'el' ? lib.KINDS : type === 'rel' ? lib.RELATIONSHIPS : lib.VIEW_KINDS;
  const listOf = (model, type) => type === 'el' ? model.elements : type === 'rel' ? model.relationships : model.views;
  const find = (model, p) => listOf(model, p.type).find((x) => x.id === p.id) || null;
  const nameOf = (lib, el) => lib.textName(el) || UNNAMED;
  const whatOf = (lib, model, type, item) => type === 'el' ? lib.describe(model, item) : type === 'rel' ? 'the ' + lib.describeRel(model, item) : lib.describeView(model, item);
  const general = (verb, noun) => ({
    none: 'nothing: take the line away',
    shown: (x) => !!x.lib.firstGeneral(x.model, x.item),
    value: (x) => { const r = x.lib.firstGeneral(x.model, x.item); return r ? r.to : ''; },
    write: (x, v) => { const r = x.lib.firstGeneral(x.model, x.item); if (!r) return; if (!v) { x.model.relationships.splice(x.model.relationships.indexOf(r), 1); return; } r.to = v; },
    said: (x) => { const r = x.lib.firstGeneral(x.model, x.item); const g = r ? x.lib.idsOf(x.model).get(r.to) : null;
      return g ? 'Made ' + x.lib.describe(x.model, x.item) + ' ' + verb + ' ' + nameOf(x.lib, g) : 'Took away the ' + noun + ' of ' + x.lib.describe(x.model, x.item); },
  });
  const HOOKS = {
    name: { said: (x) => x.type === 'el' ? 'Renamed to ' + x.lib.describe(x.model, x.item) : x.type === 'rel' ? 'Named the ' + x.lib.describeRel(x.model, x.item) : 'Renamed the view to ' + (String(x.item.name).trim() || UNNAMED) },
    abstract: { said: (x) => (x.item.abstract ? 'Made abstract: ' : 'Made concrete: ') + x.lib.describe(x.model, x.item) },
    conjugated: { said: (x) => (x.item.conjugated ? 'Conjugated ' : 'Unconjugated ') + x.lib.describe(x.model, x.item) },
    doc: { said: (x) => 'Wrote the doc of ' + whatOf(x.lib, x.model, x.type, x.item) },
    type: { none: 'nothing yet',
      value: (x) => { const t = x.lib.typingOf(x.model, x.item); return t ? t.to : ''; },
      write: (x, v) => { const t = x.lib.typingOf(x.model, x.item);
        if (!v) { if (t) x.model.relationships.splice(x.model.relationships.indexOf(t), 1); return; }
        if (t) { t.to = v; return; }
        let id; do { id = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); } while (x.model.relationships.some((r) => r.id === id));
        x.model.relationships.push({ id, kind: 'FeatureTyping', from: x.item.id, to: v, hidden: true }); },
      said: (x) => { const t = x.lib.typingOf(x.model, x.item); const d = t ? x.lib.idsOf(x.model).get(t.to) : null;
        return d ? 'Defined ' + x.lib.describe(x.model, x.item) + ' by ' + nameOf(x.lib, d) : 'Undefined ' + x.lib.describe(x.model, x.item); } },
    typeLine: { shown: (x) => !!x.lib.typingOf(x.model, x.item),
      value: (x) => { const t = x.lib.typingOf(x.model, x.item); return !!t && !t.hidden; },
      write: (x, v) => { const t = x.lib.typingOf(x.model, x.item); if (!t) return; if (v) delete t.hidden; else t.hidden = true; },
      said: (x) => { const t = x.lib.typingOf(x.model, x.item); return t ? (t.hidden ? 'Hid the line ' : 'Drew the line ') + x.lib.describeRel(x.model, t) : null; } },
    specializes: general('specialize', 'specialization'),
    subsets: general('subset', 'subsetting'),
    parallel: { locked: (x) => { const ids = x.lib.idsOf(x.model);
      return x.lib.linesOfKind(x.model, 'TransitionUsage').some((r) => x.lib.RELATIONSHIPS.TransitionUsage.owner(x.model, r, ids) === x.item.id)
        ? 'Is Parallel can\'t change while ' + x.lib.describe(x.model, x.item) + ' holds transitions, as in SysON.' : null; } },
    order: { locked: () => ORDER_LOCKED },
  };
  function viewKindFor(model, id, viewId) {
    const front = viewId === null ? null : model.views.find((v) => v.id === viewId) || null;
    if (front && front.layout && front.layout[id]) return front.kind;
    const first = model.views.find((v) => v.layout && v.layout[id]);
    if (first) return first.kind;
    return front ? front.kind : null;
  }
  const fieldOf = (lib, model, type, item, field) => {
    const spec = lib.FIELDS[field];
    if (!spec || spec.type === 'list' || !FIELD_LOOKS[field] || !tableOf(lib, type)[item.kind].fields.includes(field)) return null;
    const x = { lib, model, type, item, field, spec };
    const hook = HOOKS[field] || {};
    if (hook.shown && !hook.shown(x)) return null;
    return { x, hook };
  };
  const valueOf = (x, hook) => hook.value ? hook.value(x) : x.item[x.field];
  function rowOf(f, ids) {
    const { x, hook } = f; const spec = x.spec; const look = FIELD_LOOKS[x.field];
    let v = valueOf(x, hook);
    const row = { row: 'field', field: x.field, label: look.label, type: spec.type };
    if (spec.type === 'bool') row.value = v === true;
    else if (spec.type === 'enum') { row.value = spec.values.includes(v) ? v : spec.values[0]; }
    else if (spec.type === 'ref') { row.value = typeof v === 'string' && ids.get(v) ? v : ''; }
    else if (spec.type === 'number') row.value = typeof v === 'number' ? v : '';
    else row.value = v === undefined || v === null ? '' : String(v);
    if (look.placeholder !== undefined) row.placeholder = look.placeholder;
    if (spec.type === 'enum') row.choices = spec.values.map((value) => ({ value, label: (look.choices && look.choices[value]) ?? value }));
    if (spec.type === 'ref') row.choice = row.value ? { id: row.value, label: nameOf(x.lib, ids.get(row.value)) } : { id: '', label: hook.none || NOTHING };
    row.locked = hook.locked ? hook.locked(x) : null;
    return row;
  }
  function formOf(session, picked, viewId) {
    const lib = session.lib; const model = session.model;
    return lib.reading(model, () => {
      const item = find(model, picked); if (!item) return null;
      const d = lib.detailsOf(model, picked.type, item);
      const ids = lib.idsOf(model);
      const vk = viewKindFor(model, picked.id, viewId);
      const has = (field) => { const f = fieldOf(lib, model, picked.type, item, field); if (!f) return null; if (f.x.spec.views && !f.x.spec.views.includes(vk)) return null; return f; };
      const onTabs = new Set([...d.core, ...d.advanced].filter((r) => r.field).map((r) => r.field));
      const rows = (list) => list.map((r) => { if (r.field) { const f = has(r.field); return f ? rowOf(f, ids) : null; }
        return r.value !== undefined ? { row: 'known', name: r.name, label: r.label, value: r.value } : { row: 'notHeld', name: r.name, label: r.label }; }).filter(Boolean);
      const own = (g) => GROUP_ORDER[g].filter((f) => !onTabs.has(f) && (g !== 'main' || f !== 'doc')).map((f) => has(f)).filter(Boolean).map((f) => rowOf(f, ids));
      const main = [...rows(d.core), ...own('main')];
      if (!onTabs.has('doc')) { const f = has('doc'); if (f) main.push(rowOf(f, ids)); }
      const core = [];
      if (main.length) core.push({ name: 'main', rows: main });
      for (const g of ['typing', 'general', 'geometry']) { const r = own(g); if (r.length) core.push({ name: g, rows: r }); }
      return { type: picked.type, id: picked.id, what: picked.type === 'el' ? lib.describe(model, item) : picked.type === 'rel' ? lib.describeRel(model, item) : lib.describeView(model, item), title: d.title, core, advanced: rows(d.advanced) };
    });
  }
  function optionsOf(session, picked, field) {
    const lib = session.lib; const model = session.model;
    return lib.reading(model, () => {
      const item = find(model, picked); if (!item) return [];
      const f = fieldOf(lib, model, picked.type, item, field); if (!f || f.x.spec.type !== 'ref') return [];
      const out = [{ id: '', label: f.hook.none || NOTHING }];
      for (const e of f.x.spec.options(model, item)) out.push({ id: e.id, label: nameOf(lib, e) });
      const v = valueOf(f.x, f.hook); const e = typeof v === 'string' && v ? lib.idsOf(model).get(v) : null;
      if (e && !out.some((o) => o.id === e.id)) out.push({ id: e.id, label: nameOf(lib, e) });
      return out;
    });
  }
  function readText(spec, text) {
    if (spec.type === 'number') return text.trim() !== '' && Number.isFinite(+text) ? +text : '';
    return spec.trim ? text.trim() : text;
  }
  function changeField(session, picked, field, value, key) {
    const lib = session.lib; const model = session.model;
    const item = find(model, picked); if (!item) return null;
    const f = fieldOf(lib, model, picked.type, item, field); if (!f) return null;
    const { x, hook } = f;
    if (hook.locked && lib.reading(model, () => hook.locked(x))) return null;
    if (x.spec.type === 'enum' && !x.spec.values.includes(value)) return null;
    if (value === valueOf(x, hook)) return null;
    return session.history.edit(() => {
      if (hook.write) hook.write(x, value); else item[field] = value;
      return lib.reading(model, () => {
        if (hook.said) return hook.said(x);
        const v = valueOf(x, hook);
        let says = v === '' || v === undefined || v === null ? NOTHING : String(v);
        if (x.spec.type === 'ref' && v) { const e = lib.idsOf(model).get(v); says = e ? nameOf(lib, e) : NOTHING; }
        return 'Set the ' + x.spec.label + ' of ' + whatOf(lib, model, picked.type, item) + ' to ' + says;
      });
    }, key);
  }
  function endTyping(session, key) { const last = session.history.steps.at(-1); if (last && last.key === key) session.history.endEdit(); }
  return { formOf, optionsOf, changeField, endTyping, readText, viewKindFor, whatOf, HOOKS };
}
