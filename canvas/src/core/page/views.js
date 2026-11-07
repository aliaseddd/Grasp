// Views: making, moving, showing things in, and deleting them.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, PAD, CHILD_TOP, MARGIN, VIEW_GAP, removeFromViewButton, vName, vShow, vShowAdd, deleteViewButton, newViewButton,
    newViewKind, say, editable, newId, plural, viewById, activeView, viewLayout, viewShowing, rendererFor, fit, edit,
    setActive
  } = C;

  // ---- Views: making, moving, showing things in, and deleting them.

  function freeViewName() {
    const taken = new Set(S.model.views.map((v) => v.name.trim()));
    let i = 1;
    while (taken.has('view' + i)) i++;
    return 'view' + i;
  }
  // A new, empty view of a kind: to the right of the rightmost frame, its top in line with that frame's.
  function newView(kind) {
    if (!M.VIEW_KINDS[kind]) return;
    let view = null;
    edit(() => {
      let beside = null;
      S.layout.views.forEach((L) => { if (!beside || L.frameRect.x + L.frameRect.w > beside.x + beside.w) beside = L.frameRect; });
      view = {
        id: newId('v'), kind: kind, name: freeViewName(), doc: '',
        x: beside ? beside.x + beside.w + VIEW_GAP + MARGIN : 0, y: beside ? beside.y + MARGIN + 12 : 0,
        layout: {}, options: JSON.parse(JSON.stringify(M.VIEW_KINDS[kind].options))
      };
      S.model.views.push(view);
      return { what: 'Added the ' + M.describeView(S.model, view), log: 'Added the ' + M.describeView(S.model, view) + ', ' + M.an(M.VIEW_KINDS[kind].label) };
    });
    if (!view) return;
    setActive(view.id);
    C.select({ type: 'view', id: view.id });
    fit();
    say('Added ' + M.describeView(S.model, view) + ', ' + M.an(M.VIEW_KINDS[view.kind].label) + ', to the right of the others. Name it in the panel.');
    vName.focus({ preventScroll: true });
    vName.select();
  }
  newViewButton.addEventListener('click', () => newView(newViewKind.value));
  function deleteView(view) {
    if (!editable() || !view) return;
    if (S.model.views.length === 1) { say('This is the only view, so it stays. Add another view first to delete this one.'); return; }
    const shown = Object.keys(view.layout).length;
    const what = M.describeView(S.model, view);
    edit(() => {
      S.model.views.splice(S.model.views.indexOf(view), 1);
      if (S.active === view.id) S.active = S.model.views[0].id;
      return 'Deleted the ' + what;
    });
    setActive(S.active);
    C.select(null);
    say('Deleted the ' + what + '. ' + (shown ? 'The ' + plural(shown, 'element') + ' it showed stay in the model' : 'It showed nothing') +
      '; the other views are as they were.');
  }
  deleteViewButton.addEventListener('click', () => deleteView(C.selectedView()));
  // Takes an element, with everything inside it, out of one view: the active view when it shows the element, else
  // the first view that does. It stays in the model.
  function removeFromView(el) {
    if (!editable() || !el) return;
    const vid = activeView().layout[el.id] ? S.active : viewShowing(el.id);
    const view = viewById(vid);
    if (!view) { say(M.describe(S.model, el) + ' is not drawn in any view.'); return; }
    if (rendererFor(view).showsAll) { say(M.describeView(S.model, view) + ' shows every element, so nothing can be taken out of it.'); return; }
    const what = 'Removed ' + M.describe(S.model, el) + ' from ' + M.describeView(S.model, view);
    let gone = [];
    edit(() => {
      gone = [el].concat(M.descendants(S.model, el.id)).filter((e) => view.layout[e.id]);
      gone.forEach((e) => { delete view.layout[e.id]; });
      return what;
    });
    C.renderInspector();
    const elsewhere = (S.layout.where.get(el.id) || []).map((id) => M.describeView(S.model, viewById(id)));
    say(what + (gone.length > 1 ? ', with ' + plural(gone.length - 1, 'element') + ' inside it' : '') + '. It stays in the model' +
      (elsewhere.length ? ' and in ' + elsewhere.join(', ') : '') + '; the view\'s Show list brings it back.');
  }
  removeFromViewButton.addEventListener('click', () => removeFromView(C.selectedElement()));
  // The elements a view could show and doesn't: those its kind admits, border items only once their owner is shown;
  // none for a view whose renderer shows everything.
  function showable(view) {
    if (rendererFor(view).showsAll) return [];
    return S.model.elements.filter((e) => !view.layout[e.id] && M.admits(view.kind, e.kind) &&
      (!M.KINDS[e.kind].onBorder || (e.owner !== undefined && view.layout[e.owner])));
  }
  // Shows an element in a view: a border item on its owner's right side, a box inside its nearest owner the view
  // shows, below what is there, else on the view's ground below the view's content.
  function showInView(view, el) {
    if (!editable() || !view || !el) return;
    if (M.KINDS[el.kind].onBorder && !view.layout[el.owner]) { say('Show ' + M.describe(S.model, S.layout.ids.get(el.owner)) + ' first; ' + M.an(M.KINDS[el.kind].label) + ' sits on its border.'); return; }
    const L = viewLayout(view.id);
    const what = 'Showed ' + M.describe(S.model, el) + ' in ' + M.describeView(S.model, view);
    edit(() => {
      if (M.KINDS[el.kind].onBorder) {
        const used = M.childrenOf(S.model, el.owner).filter((s) => view.layout[s.id] && view.layout[s.id].side === 'right').map((s) => view.layout[s.id].at);
        const at = [0.5, 0.3, 0.7, 0.2, 0.8, 0.4, 0.6].find((a) => used.every((u) => Math.abs(u - a) > 0.06));
        view.layout[el.id] = M.placement(el, { side: 'right', at: at === undefined ? 0.5 : at });
      } else {
        let p = el.owner;
        while (p !== undefined && !view.layout[p]) { const o = S.layout.ids.get(p); p = o ? o.owner : undefined; }
        if (p !== undefined) {
          const pr = L.rects.get(p);
          let bottom = CHILD_TOP;
          (L.kids.get(p) || []).forEach((kid) => { const r = L.rects.get(kid.id); if (r && !r.port) bottom = Math.max(bottom, r.y + r.h - pr.y + PAD); });
          view.layout[el.id] = M.placement(el, { x: PAD, y: bottom });
        } else {
          const fr = L.frameRect;
          view.layout[el.id] = M.placement(el, { x: 0, y: L.shown.size ? fr.y + fr.h - MARGIN - view.y + 32 : 0 });
        }
      }
      return what;
    });
    C.renderInspector();
    say(what + '. Drag it where it goes.');
  }
  vShowAdd.addEventListener('click', () => {
    const view = C.selectedView();
    const el = view && vShow.value ? S.layout.ids.get(vShow.value) : null;
    if (el) showInView(view, el);
  });

  Object.assign(C, { deleteView, showable });
})(window.SysMLCanvas);
