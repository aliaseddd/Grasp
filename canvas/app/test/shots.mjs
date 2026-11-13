// Screenshots of the new page, for looking at: `npm run shots` writes them into canvas/app/shots/, and
// `npm run shots -- shell` writes only the ones named. Each step from 6 to 12 adds rows to SHOTS (example, nodes, scale,
// palette, about). A shot is { name, step, take(page) }: take() gets the page as it opens, 1400 x 900 at device scale
// 2, and writes the PNG itself, into OUT. A shot with `picker: false` gets a page without showOpenFilePicker, for
// openStateFile.

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { byTestId, collapseSides, EXAMPLE, modelOf, openStateFile, PAGE_URL, ROOT, stateFileAt, TESTIDS, untilDrawn } from './helpers.mjs';

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
];

async function main(names) {
  const unknown = names.filter((name) => !SHOTS.some((shot) => shot.name === name));
  if (unknown.length) throw new Error(`No shot is named ${unknown.join(', ')}. The shots: ${SHOTS.map((shot) => shot.name).join(', ')}.`);
  const chosen = SHOTS.filter((shot) => !names.length || names.includes(shot.name));
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
        await shot.take(page);
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
