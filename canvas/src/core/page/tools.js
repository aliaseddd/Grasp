// Tools: the palette, adding elements, and drawing relationships.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, NARROW, TOOL_TITLE, TOOL_HINT, BASE_NAME, TOOLS, canvas, svg, hint, eyebrow, palette, fName, say, editable,
    newId, paletteButtons, viewById, activeView, rendererFor, viewAt, blankField, applyMarks, edit
  } = C;

  // ---- Tools: adding elements and drawing relationships.

  function setTool(next) {
    S.tool = S.tool === next ? null : next;
    S.pending = null;
    paletteButtons().forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-tool') === S.tool));
    canvas.classList.toggle('has-tool', !!S.tool);
    applyMarks();
    hint.textContent = baseHint();
  }
  function toolHint(kind, step) {
    const h = TOOL_HINT[kind];
    if (M.KINDS[kind]) return h || 'Click where the ' + M.KINDS[kind].label + ' goes.';
    if (typeof h === 'string') return h; // a tool of TOOLS, with one hint
    return (h || ['Click the first end…', 'Now click the other end.'])[step];
  }
  function baseHint() {
    if (S.tool) return toolHint(S.tool, S.pending ? 1 : 0);
    if (!editable()) return 'Drag to move around · scroll to pan · pinch or Ctrl/⌘ + scroll to zoom';
    const view = activeView();
    if (view && !M.VIEW_KINDS[view.kind].tools.length) return M.an(M.VIEW_KINDS[view.kind].label, true) + ' fills from its panel, not the palette · click another frame to draw there';
    return NARROW.matches
      ? 'Tap to select · drag a box to move it · drag the plane to move around'
      : 'Click to select · drag a box to move it · drag the plane to move around · Ctrl/⌘ + scroll to zoom';
  }
  function freeName(kind, ownerId) {
    const base = BASE_NAME[kind] || kind;
    const taken = new Set(M.childrenOf(S.model, ownerId).map((e) => e.name.trim()));
    let i = 1;
    while (taken.has(base + i)) i++;
    return base + i;
  }
  // The palette follows the active view's kind: a button per tool its kind offers, a rule between the groups.
  S.paletteKind = null;
  function buildPalette() {
    const view = activeView();
    S.paletteKind = view ? view.kind : null;
    paletteButtons().forEach((b) => b.remove());
    palette.querySelectorAll('.sep').forEach((s) => s.remove());
    const tools = view ? M.VIEW_KINDS[view.kind].tools : [];
    // The free tools (TOOLS: the Note tool) follow the kind's own in every palette, while the page is editable.
    const free = editable() ? Object.keys(TOOLS) : [];
    palette.querySelector('.label').hidden = !tools.length && !free.length;
    const sep = () => {
      const s = document.createElement('span');
      s.className = 'sep';
      s.setAttribute('aria-hidden', 'true');
      palette.appendChild(s);
    };
    const button = (t) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-tool', t);
      b.title = TOOL_TITLE[t] || '';
      b.textContent = M.KINDS[t] ? M.KINDS[t].label : M.RELATIONSHIPS[t] ? M.RELATIONSHIPS[t].label : t;
      b.disabled = !editable();
      b.classList.toggle('is-active', t === S.tool);
      palette.appendChild(b);
    };
    tools.forEach((t) => { if (t === '|') sep(); else button(t); });
    if (free.length) {
      if (tools.length) sep(); // a rule between the kind's tools and the free ones, never one at the start
      free.forEach((t) => button(t));
    }
    if (S.tool && tools.indexOf(S.tool) < 0 && free.indexOf(S.tool) < 0) setTool(null);
  }
  palette.addEventListener('click', (event) => {
    const b = event.target.closest ? event.target.closest('button[data-tool]') : null;
    if (!b || !editable()) return;
    setTool(b.getAttribute('data-tool'));
    canvas.focus({ preventScroll: true });
    if (S.tool) say('');
  });
  // The active view is the one tools add into: shown with is-active, named in the eyebrow, its kind's tools in the
  // palette.
  function setActive(id) {
    const view = viewById(id) || S.model.views[0];
    S.active = view.id;
    svg.querySelectorAll('.frame').forEach((g) => g.classList.toggle('is-active', g.getAttribute('data-view') === S.active));
    eyebrow.textContent = 'SysML v2 · ' + M.VIEW_KINDS[view.kind].label + ' · ' + (view.name.trim() || '(unnamed)');
    if (view.kind !== S.paletteKind) buildPalette();
    hint.textContent = baseHint();
  }
  // The view a click with a tool adds into: the frame the click is in, else the active view.
  function targetView(hit, p) {
    return viewById(hit.view || viewAt(p) || S.active);
  }
  function place(kind, hit, p) {
    const k = M.KINDS[kind];
    const view = targetView(hit, p);
    if (!view) return;
    if (!M.admits(view.kind, kind)) {
      say(M.an(k.label, true) + ' can\'t go in ' + M.an(M.VIEW_KINDS[view.kind].label) + '. Click inside a view that takes one; Escape puts the tool down.');
      return;
    }
    if (view.id !== S.active) setActive(view.id);
    let el = null;
    edit(() => {
      el = rendererFor(view).place(view, kind, p, hit);
      return el ? 'Added ' + M.describe(S.model, el) : null;
    });
    if (!el) return;
    setTool(null);
    C.select({ type: 'el', id: el.id }, view.id);
    // A kind with no name field (a start node) has nothing to name, and the panel shows no name input for it.
    if (!M.hasName(kind)) { say('Added ' + M.describe(S.model, el) + ' to ' + M.describeView(S.model, view) + '.'); return; }
    say('Added ' + M.describe(S.model, el) + ' to ' + M.describeView(S.model, view) + '. Name it in the panel.');
    fName.focus({ preventScroll: true });
    fName.select();
  }
  // What rules out a pair as a line's two ends: the kind's own rule, and a line that is already there.
  function pairProblem(kind, a, b) {
    if (a.id === b.id) return 'Pick two different elements.';
    if (S.model.relationships.some((r) => r.kind === kind && r.from === a.id && r.to === b.id)) return 'That is already drawn.';
    return M.RELATIONSHIPS[kind].ends(S.model, a, b, S.layout.ids);
  }
  function connectStep(kind, hit) {
    if (hit.type !== 'el') {
      if (S.pending) say('Put down: nothing was drawn.');
      setTool(null);
      return;
    }
    if (!S.pending) {
      const problem = M.RELATIONSHIPS[kind].first(S.model, S.layout.ids.get(hit.id), S.layout.ids);
      if (problem) { say(problem + ' Escape puts the tool down.'); return; }
      S.pending = hit.id;
      if (hit.view) setActive(hit.view);
      applyMarks();
      hint.textContent = baseHint();
      return;
    }
    const a = S.layout.ids.get(S.pending);
    const b = S.layout.ids.get(hit.id);
    if (!a) { setTool(null); say('The first end is gone. Start the line again.'); return; }
    const problem = pairProblem(kind, a, b);
    if (problem) { say(problem + ' Escape puts the tool down.'); return; }
    createRel(kind, a, b, false, null, hit.view);
  }
  // Draws a relationship, as one undo step: what names it for Undo and the log when the plain "Drew …" won't do.
  // Returns the relationship, or null when the page can't be changed.
  function createRel(kind, a, b, hidden, what, viewId) {
    let rel = null;
    let text = '';
    edit(() => {
      rel = { id: newId('r'), kind: kind, from: a.id, to: b.id };
      M.RELATIONSHIPS[kind].fields.forEach((fld) => blankField(rel, fld));
      if (hidden && M.RELATIONSHIPS[kind].hideable) rel.hidden = true;
      // One definition per usage: the old line goes, and the notes on it move to the new one once it is in.
      const old = kind === 'FeatureTyping' ? M.typingOf(S.model, a) : null;
      if (old) S.model.relationships.splice(S.model.relationships.indexOf(old), 1);
      S.model.relationships.push(rel);
      if (old) S.notes.filter((n) => n.target === old.id).forEach((n) => { n.target = rel.id; n.targetLabel = M.describeRel(S.model, rel); C.noteChanged(n, ['target', 'targetLabel']); });
      S.pending = null;
      text = what || 'Drew ' + M.describeRel(S.model, rel);
      return text;
    });
    if (!rel) return null;
    setTool(null);
    C.select({ type: 'rel', id: rel.id }, viewId);
    const drawn = (S.layout.where.get(rel.id) || []).length > 0;
    say(text + (kind === 'ConnectionUsage' ? '. Name it in the panel.' : '.') +
      (!drawn && !rel.hidden ? ' No view shows both ends, so the line is not drawn anywhere yet.' : ''));
    return rel;
  }

  Object.assign(C, { setTool, baseHint, freeName, setActive, place, connectStep, createRel });
})(window.SysMLCanvas);
