// The old page's own layout, written down: `node canvas/app/test/old-layout.mjs` opens canvas/index.html from
// file://, gives it each state file through Import state, and writes what its graphLayout and endpoints worked out
// into old-layout.json beside this script. adapter.test.mjs compares the adapter with it: given the old page's
// measures (OLD_LOOK), the adapter's rectangles and lines must be these.
//
// For the example and the nine fixtures, every graph view's rectangles and line points are kept, from the view's own
// origin (the old page puts every view on one plane, at the view's x, y; a tab has one view, so they are taken off).
// For the 5,000-element model of canvas/test/scale-model.mjs only a SHA-256 of each view's layout is kept, made by
// layoutHash() below, which the test uses too.
//
// This script is not a test and `npm test` does not run it. It reads the old page, so it goes when the old page goes;
// old-layout.json stays, as what "graphLayout's rule" gave. Written once, in session 20 (plan/notes.md).

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OLD_TESTS = path.resolve(HERE, '..', '..', 'test');
const EXAMPLE = path.resolve(HERE, '..', '..', 'examples', 'stronghold-proof.json');
export const OLD_LAYOUT = path.join(HERE, 'old-layout.json');
/** How many elements the scale model has. */
export const SCALE = 5000;

const round3 = (value) => Math.round(value * 1000) / 1000;

/**
 * The SHA-256 of a view's layout: its rectangles by id, in the ids' order, and its lines' points in the lines' own
 * order, each coordinate rounded to a thousandth so that two ways of adding the same numbers give one hash.
 * `rects` is an object or a Map of { x, y, w, h } by id; `lines` is [{ id, points: [[x, y], ...] }].
 */
export function layoutHash(rects, lines) {
  const entries = rects instanceof Map ? [...rects] : Object.entries(rects);
  const text = JSON.stringify({
    rects: entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([id, r]) => [id, round3(r.x), round3(r.y), r.w, r.h]),
    lines: lines.map((line) => [line.id, line.points.map(([x, y]) => [round3(x), round3(y)])]),
  });
  return crypto.createHash('sha256').update(text).digest('hex');
}

/** What the old page holds for each graph view of the model it has open, from each view's own origin. */
function readLayout() {
  const C = window.SysMLCanvas;
  const S = C.state;
  const M = window.SysMLModel;
  const views = [];
  for (const view of S.model.views) {
    if (M.VIEW_KINDS[view.kind].renderer !== 'graph') continue;
    const L = S.layout.views.get(view.id);
    const rects = {};
    L.rects.forEach((r, id) => {
      rects[id] = r.port
        ? { x: r.x - view.x, y: r.y - view.y, w: r.w, h: r.h, side: r.side }
        : { x: r.x - view.x, y: r.y - view.y, w: r.w, h: r.h };
    });
    const lines = L.rels.map((rel) => {
      const e = C.endpoints(rel, L);
      return { id: rel.id, points: e.pts.map((p) => [p.x - view.x, p.y - view.y]), mid: [e.mid.x - view.x, e.mid.y - view.y] };
    });
    views.push({ id: view.id, kind: view.kind, rects, lines });
  }
  return views;
}

async function main() {
  const { launch, openCanvas, importLarge } = await import(path.join(OLD_TESTS, 'helpers.mjs'));
  const { scaleState } = await import(path.join(OLD_TESTS, 'scale-model.mjs'));
  const inputs = [{ file: path.basename(EXAMPLE), state: JSON.parse(fs.readFileSync(EXAMPLE, 'utf8')) }];
  for (const name of fs.readdirSync(path.join(OLD_TESTS, 'fixtures')).filter((n) => n.endsWith('.json')).sort()) {
    inputs.push({ file: name, state: JSON.parse(fs.readFileSync(path.join(OLD_TESTS, 'fixtures', name), 'utf8')) });
  }
  inputs.push({ file: `scale-${SCALE}.json`, state: scaleState(SCALE), scale: true });

  const browser = await launch();
  const files = [];
  let scale = null;
  try {
    for (const input of inputs) {
      const { page, errors } = await openCanvas(browser);
      await page.evaluate(() => { document.querySelector('#status').textContent = ''; });
      await importLarge(page, input.state, input.file);
      const views = await page.evaluate(readLayout);
      if (errors.length) throw new Error(`The old page logged, with ${input.file}: ${errors.join('; ')}`);
      await page.close();
      for (const view of views) console.log([input.file, view.id, view.kind, Object.keys(view.rects).length, view.lines.length].join('\t'));
      if (input.scale) {
        scale = {
          elements: SCALE,
          views: views.map((view) => ({ id: view.id, kind: view.kind, rects: Object.keys(view.rects).length, lines: view.lines.length, sha256: layoutHash(view.rects, view.lines) })),
        };
      } else {
        files.push({ file: input.file, views });
      }
    }
  } finally {
    await browser.close();
  }

  // One rectangle and one line to a row, so that the file can be read and its changes seen.
  const row = (value) => JSON.stringify(value);
  const text = [
    '{',
    `  "about": ${row('The old page\'s layout of every graph view of the example and the nine fixtures, from each view\'s own origin, and a hash of each view of the 5,000-element model. Written by old-layout.mjs; adapter.test.mjs compares the adapter with it.')},`,
    '  "files": [',
    files.map((file) => [
      `    { "file": ${row(file.file)}, "views": [`,
      file.views.map((view) => [
        `      { "id": ${row(view.id)}, "kind": ${row(view.kind)},`,
        '        "rects": {',
        Object.entries(view.rects).map(([id, r]) => `          ${row(id)}: ${row(r)}`).join(',\n'),
        '        },',
        '        "lines": [',
        view.lines.map((line) => `          ${row(line)}`).join(',\n'),
        '        ] }',
      ].filter((part) => part !== '').join('\n')).join(',\n'),
      '    ] }',
    ].join('\n')).join(',\n'),
    '  ],',
    `  "scale": ${row(scale)}`,
    '}',
    '',
  ].join('\n');
  JSON.parse(text);
  fs.writeFileSync(OLD_LAYOUT, text);
  console.log(`Wrote ${path.relative(process.cwd(), OLD_LAYOUT)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
