// The camera: where the window looks on the plane and how far in it is zoomed, kept in this browser.
(function (C) {
  'use strict';
  const S = C.state;
  const { CAMERA_KEY, MIN_ZOOM, MAX_ZOOM, canvas, svg, zoomLevel, hud, panel, clamp, renderPins, render } = C;

  // ---- The camera.

  S.camera = readCamera();     // the top-left corner of the window in drawing units, and pixels per unit; null: fit

  function readCamera() {
    try {
      const c = JSON.parse(localStorage.getItem(CAMERA_KEY) || 'null');
      if (c && isFinite(c.x) && isFinite(c.y) && isFinite(c.k) && c.k > 0) return { x: +c.x, y: +c.y, k: clamp(+c.k, MIN_ZOOM, MAX_ZOOM) };
    } catch (error) { /* start fitted */ }
    return null;
  }
  function stageSize() {
    const r = canvas.getBoundingClientRect();
    return { left: r.left, top: r.top, width: Math.max(r.width, 1), height: Math.max(r.height, 1) };
  }
  // The part of the window the panel doesn't cover.
  function openArea() {
    const s = stageSize();
    const area = { x: 0, y: 0, width: s.width, height: s.height };
    if (!panel.hidden && s.width > 720) area.width = Math.max(200, s.width - panel.offsetWidth - 24);
    if (s.width <= 720) {
      area.y = hud.offsetHeight + 20;
      area.height = Math.max(160, s.height - area.y - 60 - (panel.hidden ? 0 : panel.offsetHeight + 12));
    }
    return area;
  }
  function applyCamera() {
    const s = stageSize();
    svg.setAttribute('viewBox', [S.camera.x, S.camera.y, s.width / S.camera.k, s.height / S.camera.k].map((v) => v.toFixed(2)).join(' '));
    svg.classList.toggle('is-far', S.camera.k < 0.35);
    zoomLevel.textContent = Math.round(S.camera.k * 100) + '%';
    if (S.layout) renderPins();
    try { localStorage.setItem(CAMERA_KEY, JSON.stringify(S.camera)); } catch (error) { /* a convenience only */ }
  }
  // Fits every frame into the open part of the window.
  function fit() {
    if (!S.layout) render();
    const area = openArea();
    const fr = S.layout.bounds;
    const k = clamp(Math.min(area.width / fr.w, area.height / fr.h) * 0.94, MIN_ZOOM, MAX_ZOOM);
    S.camera = { k: k, x: fr.x + fr.w / 2 - (area.x + area.width / 2) / k, y: fr.y + fr.h / 2 - (area.y + area.height / 2) / k };
    applyCamera();
  }
  function zoomAt(factor, clientX, clientY) {
    const s = stageSize();
    const px = clientX - s.left;
    const py = clientY - s.top;
    const wx = S.camera.x + px / S.camera.k;
    const wy = S.camera.y + py / S.camera.k;
    const k = clamp(S.camera.k * factor, MIN_ZOOM, MAX_ZOOM);
    S.camera = { k: k, x: wx - px / k, y: wy - py / k };
    applyCamera();
  }
  function zoomAtCenter(factor) {
    const s = stageSize();
    const area = openArea();
    zoomAt(factor, s.left + area.x + area.width / 2, s.top + area.y + area.height / 2);
  }
  function showPoint(x, y) {
    const area = openArea();
    S.camera = { k: S.camera.k, x: x - (area.x + area.width / 2) / S.camera.k, y: y - (area.y + area.height / 2) / S.camera.k };
    applyCamera();
  }
  function toDrawing(clientX, clientY) {
    const point = new DOMPoint(clientX, clientY).matrixTransform(svg.getScreenCTM().inverse());
    return { x: point.x, y: point.y };
  }

  Object.assign(C, { stageSize, applyCamera, fit, zoomAt, zoomAtCenter, showPoint, toDrawing });
})(window.SysMLCanvas);
