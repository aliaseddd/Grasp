// The fit and the plane's size (plan/notes.md, "Step 6: the independent review, which came after the commit", items 2,
// 3, 5 and 8): written before the fixes, from the contracts in canvas/app/src/core/adapter.ts (FIT_PAD, FIT_BAND,
// hasMinimap, fitMargins, fit), in canvas/app/src/plane/viewStore.ts ("The camera", "Fitted, or placed by hand",
// sized) and in Plane.tsx. They run in Node and need no browser. The browser's half is small.test.mjs.

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, test } from 'node:test';
import { EXAMPLE, FIXTURES, clock, lib, loadPlanes, plain, readText } from './core.mjs';

const VIEW = 'v-proof';
const near = (a, b, eps, what) => assert.ok(Math.abs(a - b) <= eps, `${what}: ${a} is not within ${eps} of ${b}.`);

/** A session from a file's text. */
async function session(file = EXAMPLE) {
  const core = await loadPlanes();
  return core.openText(lib, readText(file), { name: path.basename(file) }, { now: clock() });
}
/** The example's store, and the bounds of its view. */
async function example() {
  const core = await loadPlanes();
  const s = await session();
  const store = core.viewStoreOf(s, VIEW);
  const view = s.model.views.find((v) => v.id === VIEW);
  const { bounds } = core.project(s.lib, s.model, view);
  return { core, session: s, store, bounds: plain(bounds) };
}
/** The bounds of the first view of a fixture that a plane draws. */
async function boundsOf(name) {
  const core = await loadPlanes();
  const s = await session(path.join(FIXTURES, name));
  const view = s.model.views.find((v) => core.isDrawn(s.lib, v.kind));
  return plain(core.project(s.lib, s.model, view).bounds);
}

describe('the fit, and a plane that changes its size', () => {
  test("a fitted view's margins follow its plane", async () => {
    const { fitMargins, hasMinimap } = await loadPlanes();
    const margins = (w, h) => plain(fitMargins(w, h));
    assert.deepEqual(margins(1304, 828), { pad: 48, band: 180 }, 'A large plane keeps 48 px at its sides and 180 at the bottom.');
    assert.deepEqual(margins(1920, 1080), { pad: 48, band: 180 }, 'A larger plane keeps the same.');
    assert.deepEqual(margins(392, 600), { pad: 32, band: 32 }, 'A plane 392 by 600 keeps a twelfth of 392 (32) all round: it has no minimap.');
    assert.deepEqual(margins(100, 244), { pad: 8, band: 8 }, 'A plane 100 by 244 keeps a twelfth of 100 (8) all round.');
    assert.deepEqual(margins(480, 480), { pad: 40, band: 180 }, 'A plane 480 by 480 keeps 40 at its sides and 180 at the bottom: it has the minimap.');
    assert.deepEqual(margins(479, 900), { pad: 39, band: 39 }, 'A plane 479 wide has no minimap, so the band is the pad.');
    assert.deepEqual(margins(900, 479), { pad: 39, band: 39 }, 'A plane 479 high has no minimap, so the band is the pad.');
    assert.equal(hasMinimap(480, 480), true, 'A plane 480 by 480 shows the minimap.');
    assert.equal(hasMinimap(479, 900), false, 'A plane 479 wide shows no minimap.');
    assert.equal(hasMinimap(900, 479), false, 'A plane 479 high shows no minimap.');
    assert.equal(hasMinimap(1304, 828), true, 'A plane 1304 by 828 shows the minimap.');
  });

  test('a view fitted into any plane lies inside it, clear of its margins', async () => {
    const { fit, MIN_ZOOM } = await loadPlanes();
    const ex = await example();
    const views = { 'the example': ex.bounds, 'interconnection': await boundsOf('interconnection.json'), 'behavior-actions': await boundsOf('behavior-actions.json') };
    assert.deepEqual(ex.bounds, { x: 32, y: 72, w: 1176, h: 648 }, "The example's bounds are 32, 72, 1176 by 648.");
    const sizes = [[100, 244], [200, 300], [392, 600], [479, 900], [480, 480], [600, 400], [736, 828], [800, 600], [900, 479], [1304, 828], [1336, 828], [1920, 1080]];
    for (const [name, bounds] of Object.entries(views)) {
      for (const [width, height] of sizes) {
        const label = `${name} in ${width} by ${height}`;
        // The contract's margins, worked out here: a twelfth of the smaller side, at most 48; the bottom band only where the minimap shows.
        const pad = Math.min(48, Math.floor(Math.min(width, height) / 12));
        const band = width >= 480 && height >= 480 ? 180 : pad;
        const v = fit(bounds, width, height);
        assert.ok(v.zoom >= MIN_ZOOM && v.zoom <= 1, `${label}: the zoom ${v.zoom} lies between MIN_ZOOM and 1.`);
        const left = bounds.x * v.zoom + v.x;
        const right = (bounds.x + bounds.w) * v.zoom + v.x;
        const top = bounds.y * v.zoom + v.y;
        const bottom = (bounds.y + bounds.h) * v.zoom + v.y;
        const eps = 1e-6;
        const clamped = v.zoom === MIN_ZOOM;
        if (!clamped) {
          assert.ok(left >= pad - eps && right <= width - pad + eps, `${label}: the bounds lie between ${pad} and ${width - pad} across, not ${left} to ${right}.`);
          assert.ok(top >= pad - eps && bottom <= height - band + eps, `${label}: the bounds lie between ${pad} and ${height - band} down, not ${top} to ${bottom}.`);
        }
        near(left - pad, width - pad - right, eps, `${label}: the bounds are centred across the room`);
        near(top - pad, height - band - bottom, eps, `${label}: the bounds are centred down the room`);
        const fillsAcross = Math.abs((right - left) - (width - 2 * pad)) < eps;
        const fillsDown = Math.abs((bottom - top) - (height - pad - band)) < eps;
        assert.ok(v.zoom === 1 || clamped || fillsAcross || fillsDown, `${label}: the zoom ${v.zoom} is the largest that fits: 1, or one direction filling its room.`);
      }
    }
    const tiny = fit(ex.bounds, 100, 244).zoom;
    assert.ok(tiny > 0.05, `The example in a plane 100 by 244 is fitted at ${(tiny * 100).toFixed(1)}%, which is not above 5%: its margins eat the plane.`);
  });

  test("a view still as fitted is fitted again when its plane's size changes", async () => {
    const { fit } = await loadPlanes();
    const { store, bounds } = await example();
    assert.deepEqual(plain(store.camera(100, 244)), plain(fit(bounds, 100, 244)), 'The first camera is the fit of the plane it first has.');
    const big = store.sized(1304, 828);
    assert.deepEqual(plain(big), plain(fit(bounds, 1304, 828)), 'A view as fitted, in a plane that grew, gets the fit for the new size.');
    assert.deepEqual(plain(store.camera()), plain(fit(bounds, 1304, 828)), 'camera() then gives the new fit.');
    assert.equal(store.sized(1304, 828), null, 'A size whose fit is the viewport the view has gives null.');
    // The plane sets that viewport and React Flow tells moved() of it: the view is still as fitted.
    store.moved(plain(big));
    store.moved({ ...plain(big), x: big.x + 0.005 });
    assert.deepEqual(plain(store.sized(736, 828)), plain(fit(bounds, 736, 828)), 'A viewport that is the fit (or 0.005 off in x) leaves the view as fitted, so a new size fits it again.');
  });

  test("a view somebody has placed stays when its plane's size changes, until it is fitted again", async () => {
    const { fit } = await loadPlanes();
    const { store, bounds } = await example();
    store.camera(736, 828);
    store.moved({ x: 10, y: 20, zoom: 0.5 });
    for (const [w, h] of [[1304, 828], [100, 244], [736, 828], [480, 480]]) {
      assert.equal(store.sized(w, h), null, `A view placed by hand gets no viewport for a plane ${w} by ${h}.`);
      assert.deepEqual(plain(store.camera()), { x: 10, y: 20, zoom: 0.5 }, `A view placed by hand keeps its viewport when the plane is ${w} by ${h}.`);
    }
    assert.deepEqual(plain(store.fit(1304, 828)), plain(fit(bounds, 1304, 828)), 'fit() fits the view.');
    assert.deepEqual(plain(store.sized(736, 828)), plain(fit(bounds, 736, 828)), 'After fit() the view is as fitted again, so a new size fits it.');
    store.moved({ x: 11, y: 20, zoom: 0.5 });
    assert.equal(store.sized(1304, 828), null, 'A viewport 1 px off the fit in x places the view by hand again.');
    store.camera();
    store.fit(1304, 828);
    store.moved({ ...plain(store.camera()), zoom: store.camera().zoom + 0.001 });
    assert.equal(store.sized(736, 828), null, 'A zoom 0.001 off the fit places the view by hand.');
  });

  test('a refit that crosses 25% tells the plane, far or near', async () => {
    const { store, bounds, core } = await example();
    const { FAR, fit } = core;
    let calls = 0;
    store.subscribe(() => { calls++; });
    assert.ok(store.camera(1304, 828).zoom >= FAR, 'The example in 1304 by 828 is near.');
    assert.equal(store.getSnapshot().far, false, 'It is near.');
    const small = fit(bounds, 300, 244);
    assert.ok(small.zoom < FAR, `The example in a plane 300 by 244 is fitted at ${small.zoom}, under FAR.`);
    const got = store.sized(300, 244);
    assert.deepEqual(plain(got), plain(small), 'sized() gives the fit for the small plane.');
    assert.equal(store.getSnapshot().far, true, 'A refit under 25% makes the snapshot far.');
    assert.equal(calls, 1, 'A refit under 25% calls the subscriber once.');
    assert.equal(store.sized(300, 244), null, 'The same size again gives null.');
    assert.equal(calls, 1, 'A sized() that returns null calls nobody.');
    assert.ok(store.sized(1304, 828), 'A plane that grew again fits the view again.');
    assert.equal(store.getSnapshot().far, false, 'A refit over 25% makes the snapshot near.');
    assert.equal(calls, 2, 'A refit back over 25% calls the subscriber once more.');
    assert.equal(store.sized(1304, 828), null, 'And the same size again gives null.');
    assert.equal(calls, 2, 'which calls nobody.');
  });
});
