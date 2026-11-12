// Shared by the new page's tests: where the built page is, how to open it from file:// in Chromium, and the check
// every browser test ends with, that the page logged no error and no warning.
//
// Never enable the CSS domain of Chrome's DevTools protocol from a test (a CDP session's CSS.enable, or a tool that
// turns it on): on a page opened from file:// it makes Chromium log an error, which finish() would then report.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Playwright is installed globally in this container, where only require() finds it: ESM imports ignore NODE_PATH.
const { chromium } = createRequire(import.meta.url)('playwright');

/** The repository's root. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
/** What the build writes, committed: the folder Damon opens the page from. */
export const DIST = path.join(ROOT, 'canvas', 'dist');
/** The page. */
export const PAGE = path.join(DIST, 'index.html');
/** The page's file:// URL, and the URL of its folder, which every request it makes must be under. */
export const PAGE_URL = pathToFileURL(PAGE).href;
export const DIST_URL = pathToFileURL(DIST + path.sep).href;

/** The data-testid names the tests find the page's parts by. */
export const TESTIDS = {
  app: 'app', // the application's root, mounted by main.tsx
};

/** A data-testid selector. */
export const byTestId = (name) => `[data-testid="${name}"]`;

/** Launches Chromium for a test file, after checking the page is built, so a missing page fails before any browser work. */
export function launch() {
  assert.ok(fs.existsSync(PAGE), `No page at ${PAGE}. Build it first: npm run build.`);
  return chromium.launch();
}

/**
 * Opens the page in a fresh 1400 × 900 context and waits for the application to mount. Returns the page with what it
 * logged: `problems` (console errors and warnings, and uncaught page errors) and `requests` (every URL it asked for).
 */
export async function openPage(browser, { url = PAGE_URL } = {}) {
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  const requests = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(`console ${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(url);
  await page.waitForSelector(byTestId(TESTIDS.app));
  return { context, page, problems, requests };
}

/** Checks that the page logged no error and no warning, then closes it. Every browser test ends with it. */
export async function finish({ context, problems }) {
  try {
    assert.deepEqual(problems, [], `The page logged:\n${problems.join('\n')}`);
  } finally {
    await context.close();
  }
}
