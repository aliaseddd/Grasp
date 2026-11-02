// Renders icons.html into the two PNGs Teams wants for the tab, named after the web part's id:
//   hosts/online/teams/<id>_color.png    192 × 192, the Keep on its teal tile
//   hosts/online/teams/<id>_outline.png   32 × 32, the Keep in white on nothing
// Run from the repository root after `npm install` in hosts/dev (which has Playwright):
//   node docs/teams-icons/render.mjs
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const { chromium } = createRequire(path.join(root, 'hosts', 'dev', 'package.json'))('playwright');

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'hosts/online/src/webparts/stronghold/StrongholdWebPart.manifest.json'), 'utf8'));
const out = path.join(root, 'hosts', 'online', 'teams');

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
await page.goto(`file://${path.join(here, 'icons.html')}`);
await page.locator('#color').screenshot({ path: path.join(out, `${manifest.id}_color.png`), omitBackground: true });
await page.locator('#outline').screenshot({ path: path.join(out, `${manifest.id}_outline.png`), omitBackground: true });
await browser.close();
console.log(`Wrote ${manifest.id}_color.png and ${manifest.id}_outline.png to ${out}`);
