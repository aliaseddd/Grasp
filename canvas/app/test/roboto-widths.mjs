// Roboto's own widths, written down: `node canvas/app/test/roboto-widths.mjs` opens the built page from file://,
// asks Chromium for the advance width of every character the page's Roboto regular holds, and writes them into
// canvas/app/src/core/roboto.ts, which the adapter wraps a compartment's rows by (plan/notes.md, session 21). With
// `--check` it writes nothing and fails when the file is not what the font gives.
//
// The page's Roboto is @fontsource/roboto's Latin file, roboto-latin-400-normal.woff2, which the build copies into
// canvas/dist/fonts/. Its characters are those of the unicode-range @fontsource declares for that file, less the ones
// the file has no glyph for. A width is the font's own number, in units of 1/2048 em: the width Chromium measures at a
// font size of 2048 px, with kerning off, kept to a thousandth of a unit. A row of a compartment is drawn with kerning and ligatures off (app.css), so
// its width in the page is the sum of its characters' widths, at any zoom and device scale; plane.test.mjs holds the
// page to that.
//
// This script is not a test and `npm test` does not run it; plane.test.mjs uses its measureRoboto(). Run it again when
// @fontsource/roboto's version changes.

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const PAGE = pathToFileURL(path.join(ROOT, 'canvas', 'dist', 'index.html')).href;
export const ROBOTO_TS = path.join(ROOT, 'canvas', 'app', 'src', 'core', 'roboto.ts');
const PACKAGE = path.join(ROOT, 'node_modules', '@fontsource', 'roboto', 'package.json');

/** The font's units per em. */
export const EM = 2048;

/**
 * The characters @fontsource declares for roboto-latin (the unicode-range of its 400.css), as [first, last] code
 * points, without the controls below U+0020 and from U+007F to U+009F, the combining marks (U+0304, U+0308, U+0329)
 * and U+FEFF, none of which stands in a row by itself.
 */
export const RANGES = [
  [0x20, 0x7e], [0xa0, 0xff], [0x131, 0x131], [0x152, 0x153], [0x2bb, 0x2bc], [0x2c6, 0x2c6], [0x2da, 0x2da], [0x2dc, 0x2dc],
  [0x2000, 0x206f], [0x20ac, 0x20ac], [0x2122, 0x2122], [0x2191, 0x2191], [0x2193, 0x2193], [0x2212, 0x2212], [0x2215, 0x2215],
  [0xfffd, 0xfffd],
];

/**
 * Runs in the page: the width of each code point of `ranges` in the page's Roboto regular, in units of 1/`em` em, as
 * [[codePoint, width], ...] in the code points' order. A code point the font has no glyph for is left out: it is
 * drawn in another font, so its width changes with the font that stands in; it is told by measuring behind two
 * stand-ins of different widths, monospace and serif.
 */
async function measureInPage([ranges, em]) {
  await document.fonts.load(`400 ${em}px Roboto`);
  if (!document.fonts.check(`400 ${em}px Roboto`)) throw new Error('The page has not loaded Roboto regular.');
  const context = document.createElement('canvas').getContext('2d');
  context.fontKerning = 'none';
  const width = (font, text) => { context.font = `400 ${em}px ${font}`; return context.measureText(text).width; };
  const out = [];
  const unsure = [];
  for (const [first, last] of ranges) {
    for (let code = first; code <= last; code++) {
      const ch = String.fromCodePoint(code);
      const [a, b] = [width('Roboto, monospace', ch), width('Roboto, serif', ch)];
      if (a !== b) continue; // drawn by the stand-in: Roboto has no glyph
      if (width('monospace', ch) === width('serif', ch)) { unsure.push(code); continue; }
      out.push([code, a]);
    }
  }
  return { widths: out, unsure };
}

/**
 * The widths the page's Roboto regular gives: { widths: [[codePoint, units], ...], unsure: [codePoint, ...] }, on a
 * page that has the application loaded (so that its @font-face is known). `unsure` holds the code points whose two
 * stand-ins are equally wide, of which nothing can be told: they are left out of the table, and are format controls.
 */
export async function measureRoboto(page) {
  const { widths, unsure } = await page.evaluate(measureInPage, [RANGES, EM]);
  // Whole numbers but for the spaces the font derives from its em (U+2004 is a third of one): kept to a thousandth.
  return { widths: widths.map(([code, units]) => [code, Math.round(units * 1000) / 1000]), unsure };
}

const hex = (code) => `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;

/** A character as a TypeScript string literal's content: ASCII as itself, anything else as \u escapes. */
function escaped(code) {
  const ch = String.fromCodePoint(code);
  if (ch === '\\' || ch === "'") return `\\${ch}`;
  if (code >= 0x21 && code <= 0x7e) return ch;
  return `\\u${code.toString(16).padStart(4, '0')}`;
}

/** The text of canvas/app/src/core/roboto.ts for these widths. */
export function robotoSource(widths, version) {
  const byWidth = new Map();
  for (const [code, units] of widths) {
    if (!byWidth.has(units)) byWidth.set(units, []);
    byWidth.get(units).push(code);
  }
  const rows = [...byWidth].sort(([a], [b]) => a - b).map(([units, codes]) => `  [${units}, '${codes.map(escaped).join('')}'],`);
  return `// Roboto regular's widths. Written by canvas/app/test/roboto-widths.mjs from @fontsource/roboto ${version},
// roboto-latin-400-normal.woff2, as Chromium measures it; do not edit. \`node canvas/app/test/roboto-widths.mjs --check\`
// fails when this file is not what the font gives.
//
// The adapter wraps a compartment's rows by these (core/adapter.ts), so a box's height is known without the DOM, in
// Node as in the page. A row is drawn with kerning and ligatures off (app.css), so its width in the page is the sum
// of its characters' widths.

/** The font's units per em. */
export const ROBOTO_EM = ${EM};

// [width in units of 1/${EM} em, the characters that wide], ${widths.length} characters in all.
const ADVANCES: readonly (readonly [number, string])[] = [
${rows.join('\n')}
];

const WIDTHS = new Map<number, number>();
for (const [units, chars] of ADVANCES) for (const ch of chars) WIDTHS.set(ch.codePointAt(0) as number, units);

/**
 * The width of a character the font has no glyph for, in units: one em. Another font draws it, which this file knows
 * nothing of; an em is as wide as the widest letters, so a row with such characters is wrapped early, not late.
 */
export const ROBOTO_UNKNOWN = ROBOTO_EM;

/** Whether Roboto regular's Latin file draws this character itself. */
export function robotoHas(ch: string): boolean {
  return WIDTHS.has(ch.codePointAt(0) as number);
}

/**
 * The width of one line of text in Roboto regular at \`px\` px, with kerning and ligatures off: the sum of its
 * characters' widths, a character by code point. Not rounded.
 */
export function textWidth(text: string, px: number): number {
  let units = 0;
  for (const ch of text) units += WIDTHS.get(ch.codePointAt(0) as number) ?? ROBOTO_UNKNOWN;
  return (units * px) / ROBOTO_EM;
}
`;
}

async function main(check) {
  const { chromium } = createRequire(import.meta.url)('playwright');
  const version = JSON.parse(fs.readFileSync(PACKAGE, 'utf8')).version;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(PAGE);
    await page.waitForSelector('[data-testid="app"]');
    const { widths, unsure } = await measureRoboto(page);
    const source = robotoSource(widths, version);
    const rel = path.relative(ROOT, ROBOTO_TS);
    if (check) {
      const kept = fs.existsSync(ROBOTO_TS) ? fs.readFileSync(ROBOTO_TS, 'utf8') : null;
      if (kept !== source) throw new Error(`${rel} is not what the page's Roboto gives. Run node canvas/app/test/roboto-widths.mjs and look at the difference.`);
      console.log(`${rel} is what the page's Roboto gives: ${widths.length} characters.`);
    } else {
      fs.writeFileSync(ROBOTO_TS, source);
      console.log(`Wrote ${rel}: ${widths.length} characters. Left out, nothing can be told of them: ${unsure.map(hex).join(' ') || 'none'}.`);
    }
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.includes('--check')).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
