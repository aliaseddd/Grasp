// Screenshots of the new page, for looking at: `npm run shots` writes them into canvas/app/shots/, and
// `npm run shots -- shell` writes only the ones named. A shot is { name, step, take(page, out) }: take() gets the page
// as it opens, 1400 x 900 at device scale 2, and writes the PNG itself, into `out` (canvas/app/shots/). A shot with
// `picker: false` gets a page without showOpenFilePicker, for openStateFile.
//
// The shots of steps 5 to 7 (shell, example, nodes) are rows of SHOTS below. Each shot of steps 8 to 12 (scale,
// palette, about) is a file of its own under shots/, which its step writes, so that no two steps change one file. A
// shot marked `pending: true` is not built yet: `npm run shots` leaves it out and says so, and naming it runs it.

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import {
  boxOf, byTestId, collapseSides, EXAMPLE, frame, modelOf, openStateFile, PAGE_URL, planeOf, ROOT, selectBox, soon, stateFileAt, TESTIDS,
  untilDrawn, viewTab, FIXTURES,
} from './helpers.mjs';

import about from './shots/about.mjs';
import palette from './shots/palette.mjs';
import scale from './shots/scale.mjs';

const INTERCONNECTION = path.join(FIXTURES, 'interconnection.json');

const { chromium } = createRequire(import.meta.url)('playwright');

const OUT = path.join(ROOT, 'canvas', 'app', 'shots');

/** The shots: `name` is the file's name without .png; `step` is the plan's step that added it. */
export const SHOTS = [
  // The page as it opens, with no file: the bar, the strips and panels, and the card in the editor.
  { name: 'shell', step: 5, take: (page) => page.screenshot({ path: path.join(OUT, 'shell.png') }) },
  // The example fitted, with both sides collapsed first (a view is fitted once, when it first has a size): the page has
  // no file picker, so that openStateFile can give it the file through the file input.
  {
    name: 'example',
    step: 6,
    picker: false,
    take: async (page) => {
      await collapseSides(page);
      await openStateFile(page, stateFileAt(EXAMPLE));
      await untilDrawn(page, modelOf(EXAMPLE).views[0]);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      await page.screenshot({ path: path.join(OUT, 'example.png') });
    },
  },
  // Step 7: at 150%, a selected part def with its doc compartment and eight handles, a part with round corners, ports
  // with their arrows: in the interconnection fixture's view, the plane zoomed about a point that keeps the boxes on it.
  {
    name: 'nodes',
    step: 7,
    picker: false,
    take: async (page) => {
      // The interconnection fixture's view: the example's ports carry no direction, so none of them has an arrow, and
      // this view's do (CtrlLink's c out and p in). The camera keeps CtrlLink's corner 60 px in, so that CtrlLink, the
      // part def Pump and the selected part def Tank, with its doc, are on the plane, and the part pump in System below.
      const view = modelOf(INTERCONNECTION).views.find((v) => v.id === 'v-ic');
      const AIM = 'CtrlLink';
      const PICK = 'Tank';
      await collapseSides(page);
      await openStateFile(page, stateFileAt(INTERCONNECTION));
      await viewTab(page, view);
      await untilDrawn(page, view);
      await selectBox(page, view, PICK);
      const plane = await page.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }, planeOf(view.id));
      let box = await boxOf(page, view.id, AIM);
      // Ctrl + wheel zooms about the pointer, so the pointer goes where a zoom by k keeps AIM's top left corner 60 px in
      // from the plane's: P = (k L - L') / (k - 1); AIM's middle when that is off the plane or k is near 1.
      const aim = (k) => {
        const point = (l, target, low, high, middle) => {
          const p = Math.abs(k - 1) < 0.05 ? middle : (k * l - target) / (k - 1);
          return p > low + 4 && p < high - 4 ? p : middle;
        };
        return {
          x: point(box.x, plane.x + 60, plane.x, plane.x + plane.width, box.x + box.width / 2),
          y: point(box.y, plane.y + 60, plane.y, plane.y + plane.height, box.y + box.height / 2),
        };
      };
      let rate = 0.002; // the power of 2 that 1 px of the wheel zooms by
      await page.keyboard.down('Control');
      try {
        for (let turn = 0; turn < 10 && Math.abs(Math.log(box.zoom / 1.5)) > 0.02; turn++) {
          const was = box;
          const delta = Math.max(-1500, Math.min(1500, Math.log2(was.zoom / 1.5) / rate));
          const at = aim(1.5 / was.zoom);
          await page.mouse.move(at.x, at.y);
          await page.mouse.wheel(0, delta);
          box = await soon(page, async () => {
            const now = await boxOf(page, view.id, AIM);
            return now && Math.abs(now.zoom - was.zoom) > 1e-9 ? now : null;
          }, 'The plane does not zoom when the wheel turns with Ctrl held.');
          const seen = Math.log2(box.zoom / was.zoom) / -delta;
          if (seen > 0) rate = seen;
        }
      } finally {
        await page.keyboard.up('Control');
      }
      if (Math.abs(Math.log(box.zoom / 1.5)) > 0.03) throw new Error(`The plane is at ${(box.zoom * 100).toFixed(1)}%, not 150%.`);
      const picked = await boxOf(page, view.id, PICK);
      if (!picked.selected) throw new Error(`${PICK} is not selected.`);
      for (const box of [await boxOf(page, view.id, AIM), picked]) if (box.x < plane.x || box.y < plane.y || box.x + box.width > plane.x + plane.width || box.y + box.height > plane.y + plane.height) {
        throw new Error('A box of the shot, at 150%, does not lie wholly on the plane.');
      }
      await page.mouse.move(plane.x + plane.width - 40, plane.y + plane.height - 40); // away from the box
      await frame(page);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      await page.screenshot({ path: path.join(OUT, 'nodes.png') });
    },
  },
  scale,
  palette,
  about,
];

async function main(names) {
  const unknown = names.filter((name) => !SHOTS.some((shot) => shot.name === name));
  if (unknown.length) throw new Error(`No shot is named ${unknown.join(', ')}. The shots: ${SHOTS.map((shot) => shot.name).join(', ')}.`);
  const chosen = SHOTS.filter((shot) => (names.length ? names.includes(shot.name) : !shot.pending));
  for (const shot of SHOTS) if (!names.length && shot.pending) console.log(`Left out ${shot.name}.png: step ${shot.step} builds it.`);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const shot of chosen) {
      const context = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
      try {
        const page = await context.newPage();
        // A shot that opens a file asks for a page with no file picker (`picker: false`), as openPage does.
        if (shot.picker === false) await page.addInitScript(() => { delete window.showOpenFilePicker; });
        await page.goto(PAGE_URL);
        await page.waitForSelector(byTestId(TESTIDS.app));
        try {
          await page.waitForSelector(byTestId(TESTIDS.topBar), { timeout: 5000 });
        } catch {
          throw new Error(`The page has no top bar (data-testid "${TESTIDS.topBar}"): the shell is not built, so there is nothing to take a picture of.`);
        }
        await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        await shot.take(page, OUT);
        console.log(`Wrote ${path.relative(ROOT, path.join(OUT, `${shot.name}.png`))}`);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}

main(process.argv.slice(2)).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
