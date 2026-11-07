// Moving around and pointing at things: the pointer, the wheel, the keys, and the zoom buttons.
(function (C) {
  'use strict';
  const S = C.state;
  const {
    M, MIN_ZOOM, MAX_ZOOM, TOOLS, ACTIONS, $, canvas, svg, hint, say, clamp, editable, noteById, viewById, rendererFor,
    viewAt, marksFor, stageSize, applyCamera, fit, zoomAt, zoomAtCenter, toDrawing, edit, endEdit, undo, setTool,
    baseHint, place, connectStep, select, selectionFor, renderInspector, deleteSelection, noteTimers, focusNote,
    persist, writeShared
  } = C;

  // ---- Moving around and pointing at things.

  const pointers = {};
  let gesture = null;
  function pointerCount() { return Object.keys(pointers).length; }
  function twoPointers() {
    const ids = Object.keys(pointers);
    const a = pointers[ids[0]];
    const b = pointers[ids[1]];
    return { mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, dist: Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1) };
  }
  // What is under the pointer: a pin, a problem's badge, a renderer's own control (anything with data-action, run
  // through ACTIONS; never dragged), an element, a line, a frame's tab, or the plane; with the view it belongs to,
  // from the frame it is drawn in. The lines are drawn over the boxes with a wide hit stroke, so when the pointer is
  // on a line and at, the pointer's client point, is given, a border item or an element's own text under that point
  // is the hit instead: a line leaves a box where a port may sit, and crosses names.
  function hitOf(target, at) {
    const closest = (sel) => (target.closest ? target.closest(sel) : null);
    const frame = closest('.frame');
    const view = frame ? frame.getAttribute('data-view') : null;
    const pin = closest('.pin');
    if (pin) return { type: 'pin', id: pin.getAttribute('data-note'), view: pin.getAttribute('data-view') };
    const badge = closest('.problem');
    if (badge) return { type: 'problem', id: badge.getAttribute('data-for'), view: badge.getAttribute('data-view') };
    const action = closest('[data-action]');
    if (action) return { type: 'action', action: action.getAttribute('data-action'), id: action.getAttribute('data-for'), g: action, view: view, hint: action.getAttribute('data-hint') };
    const elG = closest('[data-el]');
    if (elG) return { type: 'el', id: elG.getAttribute('data-el'), g: elG, view: view };
    const relG = closest('[data-rel]');
    if (relG) {
      const under = at ? underLine(at) : null;
      if (under) return { type: 'el', id: under.getAttribute('data-el'), g: under, view: view };
      return { type: 'rel', id: relG.getAttribute('data-rel'), g: relG, view: view };
    }
    if (closest('.tab')) return { type: 'tab', id: view, view: view };
    return { type: 'plane', view: null };
  }
  // Among what is drawn at the client point under a line, the group of the first border item, or of the first
  // element one of whose own texts (its keyword, its name, a compartment's lines) is at the point; null when the
  // point is on a box's body or on nothing, which leaves the line the hit.
  function underLine(at) {
    if (!document.elementsFromPoint) return null;
    const onText = (g) => Array.from(g.children).some((c) => {
      if (c.tagName !== 'text') return false;
      const b = c.getBoundingClientRect();
      return at.x >= b.left && at.x <= b.right && at.y >= b.top && at.y <= b.bottom;
    });
    for (const n of document.elementsFromPoint(at.x, at.y)) {
      if (n === svg || !svg.contains(n) || !n.closest) continue;
      const g = n.closest('[data-el]');
      if (!g) continue;
      if (g.classList.contains('port') || n.tagName === 'text' || n.tagName === 'tspan' || (n.parentNode === g && onText(g))) return g;
    }
    return null;
  }

  svg.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button > 1) return;
    event.preventDefault();
    C.stageChanged(); // where the stage is, read afresh as a gesture starts, while the page is laid out
    canvas.focus({ preventScroll: true });
    pointers[event.pointerId] = { x: event.clientX, y: event.clientY, button: event.button };
    try { svg.setPointerCapture(event.pointerId); } catch (error) { /* not capturable */ }
    canvas.classList.add('is-pointer');
    if (pointerCount() === 2) {
      const t = twoPointers();
      gesture = { pinch: { mid: t.mid, dist: t.dist, cx: S.camera.x, cy: S.camera.y, k: S.camera.k }, moved: true };
      if (S.drag && S.drag.moved) finishDrag(event); // the move so far stays, and is saved
      S.drag = null;
      return;
    }
    if (pointerCount() > 2) return;
    const hit = hitOf(event.target, { x: event.clientX, y: event.clientY });
    const el = hit.type === 'el' ? S.layout.ids.get(hit.id) : null;
    const view = hit.view ? viewById(hit.view) : null;
    const movable = editable() && !S.tool && event.button !== 1 && view && (el || hit.type === 'tab');
    const p = toDrawing(event.clientX, event.clientY);
    S.drag = null;
    if (movable) {
      S.drag = hit.type === 'tab'
        ? { kind: 'view', id: view.id, view: view.id, start: p, from: { x: view.x, y: view.y }, moved: false }
        : rendererFor(view).dragStart(view, el, p);
    } else if (hit.type === 'pin' && editable() && !S.tool && event.button !== 1) S.drag = C.pinDragStart(hit, p); // a pin moves too
    gesture ={ x: event.clientX, y: event.clientY, cx: S.camera.x, cy: S.camera.y, moved: false, hit: hit, pan: !S.drag };
  });
  svg.addEventListener('pointermove', (event) => {
    const p = pointers[event.pointerId];
    if (!p) { hover(event); return; }
    p.x = event.clientX;
    p.y = event.clientY;
    if (!gesture) return;
    if (gesture.pinch) {
      if (pointerCount() < 2) return;
      const s = stageSize();
      const t = twoPointers();
      const g = gesture.pinch;
      const k = clamp(g.k * t.dist / g.dist, MIN_ZOOM, MAX_ZOOM);
      const wx = g.cx + (g.mid.x - s.left) / g.k;
      const wy = g.cy + (g.mid.y - s.top) / g.k;
      S.camera = { k: k, x: wx - (t.mid.x - s.left) / k, y: wy - (t.mid.y - s.top) / k };
      applyCamera();
      return;
    }
    const dx = p.x - gesture.x;
    const dy = p.y - gesture.y;
    if (!gesture.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
    if (!gesture.moved) {
      gesture.moved = true;
      if (gesture.pan) canvas.classList.add('is-panning');
      setHover(null);
    }
    if (gesture.pan) {
      S.camera = { k: S.camera.k, x: gesture.cx - dx / S.camera.k, y: gesture.cy - dy / S.camera.k };
      applyCamera();
    } else if (S.drag) {
      moveDrag(event);
    }
  });
  // A drag moves a view by its tab, or an element in its view through the view's renderer. Each move is a change,
  // and the moves and the drop are one run, keyed by what is dragged (finishDrag ends it), so the whole drag is one
  // undo step, logged once.
  function moveDrag(event) {
    const p = toDrawing(event.clientX, event.clientY);
    const first = !S.drag.moved;
    S.drag.moved = true;
    if (S.drag.kind === 'pin') { C.movePin(S.drag, event); return; }
    if (first) endEdit(); // a drag is a step of its own
    const d = S.drag;
    if (d.kind === 'view') {
      const view = viewById(d.id);
      if (!view) return;
      edit(() => {
        view.x = Math.round(d.from.x + (p.x - d.start.x));
        view.y = Math.round(d.from.y + (p.y - d.start.y));
        return 'Moved the ' + M.describeView(S.model, view);
      }, 'move:' + view.id);
      return;
    }
    const view = viewById(d.view);
    const el = S.layout.ids.get(d.id);
    if (!view || !el || !view.layout[el.id]) return;
    edit(() => {
      rendererFor(view).drag(view, el, d, p);
      return 'Moved ' + M.describe(S.model, el, S.layout.ids);
    }, 'move:' + el.id);
    // The box it would drop into is marked, and only that one: a drawing that moved things kept the other groups.
    const over = S.drag.over ? svg.querySelector('.frame[data-view="' + view.id + '"] [data-el="' + S.drag.over + '"]') : null;
    svg.querySelectorAll('[data-el].is-drop').forEach((g) => { if (g !== over) g.classList.remove('is-drop'); });
    if (over) over.classList.add('is-drop');
  }
  // Ends a drag: a pin's, a view's, or an element's through its renderer's drop, the last change of the drag's run,
  // which ends with it. The record comes off drag first, so the render that follows no longer makes way for what was
  // dragged: a box dropped in its owner is drawn held by it at once. A drop that puts the element back has no words of
  // its own, and the run, back where it started, is then no step at all.
  function finishDrag(event) {
    const d = S.drag;
    S.drag = null;
    if (d.kind === 'pin') { C.dropPin(d, event); return; }
    svg.querySelectorAll('[data-el].is-drop').forEach((g) => g.classList.remove('is-drop'));
    let said = '';
    if (d.kind === 'view') {
      const view = viewById(d.id);
      if (view) edit(() => {
        const what = 'Moved the ' + M.describeView(S.model, view);
        said = what + '.';
        return what;
      }, 'move:' + view.id);
    } else {
      const view = viewById(d.view);
      const el = S.layout.ids.get(d.id);
      if (view && el && view.layout[el.id]) {
        edit(() => {
          const result = rendererFor(view).drop(view, el, d, toDrawing(event.clientX, event.clientY), event);
          if (result) said = result.say || result.text + '.';
          return result && result.undo ? { what: result.undo, log: result.text, key: result.key } : 'Moved ' + M.describe(S.model, el);
        }, 'move:' + el.id);
        renderInspector();
      }
    }
    endEdit();
    if (said) say(said);
  }
  function endPointer(event) {
    const p = pointers[event.pointerId];
    if (!p) return;
    delete pointers[event.pointerId];
    const left = pointerCount();
    if (left === 1) {
      const q = pointers[Object.keys(pointers)[0]];
      gesture = { x: q.x, y: q.y, cx: S.camera.x, cy: S.camera.y, moved: true, hit: { type: 'plane' }, pan: true };
      S.drag = null;
      return;
    }
    if (left > 0) return;
    const g = gesture;
    gesture = null;
    canvas.classList.remove('is-panning');
    if (!g || g.pinch) { S.drag = null; return; }
    if (g.moved) {
      if (S.drag && S.drag.moved) finishDrag(event);
      S.drag = null;
      return;
    }
    S.drag = null;
    if (event.type !== 'pointerup' || p.button !== 0) return;
    click(g.hit, event);
  }
  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', endPointer);
  // A click: on a renderer's control, its action runs; with a tool, it places or draws (or does what a tool of TOOLS
  // does); without one, it selects what is under it. The empty plane inside a frame selects the view; outside every
  // frame it clears the selection and leaves the active view as it is.
  function click(hit, event) {
    if (hit.type === 'pin') { focusNote(hit.id); return; }
    const p = toDrawing(event.clientX, event.clientY);
    if (hit.type === 'problem') {
      const sel = selectionFor(hit.id);
      if (sel) select(sel, hit.view);
      say(S.problems.filter((q) => marksFor(q).indexOf(hit.id) >= 0).map((q) => q.message).join(' '));
      return;
    }
    if (hit.type === 'action') { if (ACTIONS[hit.action]) ACTIONS[hit.action](hit, p, event); return; }
    if (S.tool && !editable()) { setTool(null); return; }
    if (S.tool && TOOLS[S.tool]) { TOOLS[S.tool](hit, p, event); return; }
    if (S.tool && M.KINDS[S.tool]) { place(S.tool, hit, p); return; }
    if (S.tool) { connectStep(S.tool, hit); return; }
    if (hit.type === 'el' || hit.type === 'rel') { select({ type: hit.type, id: hit.id }, hit.view); return; }
    if (hit.type === 'tab') { select({ type: 'view', id: hit.id }); return; }
    const vid = viewAt(p);
    if (vid) { select({ type: 'view', id: vid }); return; }
    select(null);
  }

  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stageSize().height : 1;
    let dx = event.deltaX * scale;
    let dy = event.deltaY * scale;
    if (event.ctrlKey || event.metaKey) {
      zoomAt(Math.exp(-dy * 0.01), event.clientX, event.clientY);
    } else {
      if (event.shiftKey && !dx) { dx = dy; dy = 0; }
      S.camera = { k: S.camera.k, x: S.camera.x + dx / S.camera.k, y: S.camera.y + dy / S.camera.k };
      applyCamera();
    }
  }, { passive: false });

  canvas.addEventListener('keydown', (event) => {
    canvas.classList.remove('is-pointer');
    const step = 80 / S.camera.k;
    let handled = true;
    if ((event.ctrlKey || event.metaKey) && (event.key === 'z' || event.key === 'Z')) { undo(); event.preventDefault(); return; }
    switch (event.key) {
      case 'ArrowLeft': S.camera.x -= step; applyCamera(); break;
      case 'ArrowRight': S.camera.x += step; applyCamera(); break;
      case 'ArrowUp': S.camera.y -= step; applyCamera(); break;
      case 'ArrowDown': S.camera.y += step; applyCamera(); break;
      case '+': case '=': zoomAtCenter(1.25); break;
      case '-': case '_': zoomAtCenter(0.8); break;
      case '0': fit(); break;
      case 'Escape': if (S.tool) setTool(null); else select(null); break;
      case 'Delete': deleteSelection(); break;
      default: handled = false;
    }
    if (handled) event.preventDefault();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && S.tool && !(event.target.closest && event.target.closest('input, textarea, select'))) setTool(null);
  });
  $('zoom-in').addEventListener('click', () => zoomAtCenter(1.25));
  $('zoom-out').addEventListener('click', () => zoomAtCenter(0.8));
  $('zoom-fit').addEventListener('click', fit);

  let hovered = null;            // the element or line the pointer is over, marked is-hover
  function setHover(g) {
    if (hovered === g) return;
    if (hovered) hovered.classList.remove('is-hover');
    hovered = g;
    if (g) g.classList.add('is-hover');
  }
  function hover(event) {
    const hit = hitOf(event.target, { x: event.clientX, y: event.clientY });
    if (hit.type === 'pin') { setHover(null); hint.textContent = editable() ? 'Click the pin to read its note · drag it to move the note onto something else, or onto the plane.' : 'Click the pin to read its note.'; return; }
    if (hit.type === 'problem') { setHover(null); hint.textContent = 'Click the badge to select what has the problem; the panel says what it is.'; return; }
    if (hit.type === 'action') { setHover(null); hint.textContent = hit.hint || baseHint(); return; }
    if (hit.type === 'tab') {
      setHover(null);
      const view = viewById(hit.id);
      hint.textContent = (view ? M.describeView(S.model, view) : 'view') + (editable() ? ' · click to select, drag to move the view' : ' · click to select');
      return;
    }
    if (hit.type === 'plane') { setHover(null); hint.textContent = baseHint(); return; }
    setHover(hit.g);
    const what = M.labelFor(S.model, hit.id);
    if (S.tool) hint.textContent = what + ' · ' + baseHint();
    else if (hit.type === 'el') hint.textContent = what + (editable() ? ' · click to select, drag to move' : ' · click to select');
    else hint.textContent = what + ' · click to select';
  }
  svg.addEventListener('pointerleave', () => { setHover(null); hint.textContent = baseHint(); });

  const resized = () => { C.stageChanged(); if (S.camera && S.layout) applyCamera(); };
  if (window.ResizeObserver) new ResizeObserver(resized).observe(canvas);
  else window.addEventListener('resize', resized);

  // A change still waiting for its pause is saved when the page is left or put away.
  const flush = () => { if (S.saveTimer) { clearTimeout(S.saveTimer); persist(); } Object.keys(noteTimers).forEach((id) => { clearTimeout(noteTimers[id]); const n = noteById(id); if (n) writeShared(n, ['text', 'updated']); delete noteTimers[id]; }); };
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

  Object.assign(C, { hitOf });
})(window.SysMLCanvas);
