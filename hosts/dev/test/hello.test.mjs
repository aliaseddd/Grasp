// Checks the built app through the dev host in Chromium, the browser Stronghold is built for. It covers what the
// proof on SharePoint Server will check by hand (ARCHITECTURE.md, The proof): the text, the module file loading on
// its own, the shadow root keeping the page's styles out, the font coming from the package, and a clean unmount.
// Build the app first: cd app && npm run build. Then here: npm test.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startServer } from '../serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const buildManifest = path.join(root, 'app', 'dist', 'stronghold-app.json');
const appVersion = JSON.parse(fs.readFileSync(path.join(root, 'app', 'package.json'), 'utf8')).version;
/** Matches the entry file's URL, whose name carries a hash of its contents. */
const ENTRY_URL = /\/app\/dist\/stronghold-app\.[0-9a-f]{8}\.js$/;

let server;
let browser;

before(async () => {
  assert.ok(fs.existsSync(buildManifest), `No app build at ${buildManifest}. Run "npm run build" in app/ first.`);
  server = await startServer(0);
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.server.close();
});

/** Opens the dev host, waits for the app to say hello, and returns the page with every URL it requested. */
async function openHello() {
  const page = await browser.newPage();
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${server.url}hosts/dev/`);
  await page.evaluate(() => window.devHost.ready);
  await page.waitForFunction(() =>
    document.querySelector('.stronghold')?.shadowRoot?.textContent?.includes('Hello world!'));
  return { page, requests, errors };
}

/** Reads what the app drew, from inside its shadow root. */
function readApp() {
  const shadow = document.querySelector('.stronghold').shadowRoot;
  const line = shadow.querySelector('.app p');
  const style = getComputedStyle(line);
  return {
    text: shadow.querySelector('.app').textContent.trim(),
    color: style.color,
    fontFamily: style.fontFamily,
    fontStyle: style.fontStyle,
    fontSize: style.fontSize,
    textDecorationLine: style.textDecorationLine,
    letterSpacing: style.letterSpacing,
    background: getComputedStyle(shadow.querySelector('.app')).backgroundColor,
    interFaces: [...document.fonts].filter((face) => face.family === 'Inter').map((face) => `${face.weight}:${face.status}`),
    scriptTags: document.querySelectorAll('script[data-stronghold-app]').length,
    version: window.Stronghold.version,
  };
}

test('says Hello world! inside a shadow root, and nothing else', async () => {
  const { page, errors } = await openHello();
  const app = await page.evaluate(readApp);
  assert.equal(app.text, 'Hello world!');
  assert.deepEqual(errors, []);
  await page.close();
});

test('loads the hello module from its own file, after the entry file', async () => {
  const { page, requests } = await openHello();
  const entryIndex = requests.findIndex((url) => ENTRY_URL.test(url));
  const moduleIndex = requests.findIndex((url) => /\/app\/dist\/stronghold-app\.hello\.[0-9a-f]{8}\.js$/.test(url));
  assert.ok(entryIndex >= 0, 'the entry file was requested');
  assert.ok(moduleIndex > entryIndex, `the hello module file was requested after the entry file: ${requests.join('\n')}`);
  await page.close();
});

test("keeps the page's styles out and uses the design's tokens", async () => {
  const { page } = await openHello();
  const app = await page.evaluate(readApp);
  // index.html paints p red, italic, underlined, letter-spaced, in Georgia. The design says otherwise.
  assert.equal(app.color, 'rgb(24, 38, 48)', '--sh-text-primary');
  assert.equal(app.background, 'rgb(248, 250, 251)', '--sh-surface-page');
  assert.equal(app.fontStyle, 'normal');
  assert.equal(app.textDecorationLine, 'none');
  assert.equal(app.letterSpacing, 'normal');
  assert.equal(app.fontSize, '14px', '--sh-type-body');
  assert.match(app.fontFamily, /^Inter\b/);
  await page.close();
});

test("loads Inter from the package's own files", async () => {
  const { page, requests } = await openHello();
  await page.evaluate(() => document.fonts.ready);
  const app = await page.evaluate(readApp);
  assert.deepEqual(app.interFaces.sort(), ['400:loaded', '500:loaded', '600:loaded']);
  const fontRequests = requests.filter((url) => /\/app\/dist\/stronghold-app\.inter-latin-\d{3}-normal\.[0-9a-f]{8}\.woff2$/.test(url));
  assert.equal(fontRequests.length, 3, `font files came from app/dist: ${requests.join('\n')}`);
  await page.close();
});

test('adds one script tag per page, unmounts cleanly, and mounts again without reloading', async () => {
  const { page, requests } = await openHello();
  let app = await page.evaluate(readApp);
  assert.equal(app.scriptTags, 1);
  assert.equal(app.version, appVersion);

  await page.evaluate(() => window.devHost.unmount());
  assert.equal(await page.evaluate(() => document.querySelectorAll('.stronghold').length), 0);

  const entryRequestsBefore = requests.filter((url) => ENTRY_URL.test(url)).length;
  await page.evaluate(() => window.devHost.mount());
  await page.waitForFunction(() =>
    document.querySelector('.stronghold')?.shadowRoot?.textContent?.includes('Hello world!'));
  app = await page.evaluate(readApp);
  assert.equal(app.text, 'Hello world!');
  assert.equal(app.scriptTags, 1, 'the second mount reused the loaded app');
  assert.equal(requests.filter((url) => ENTRY_URL.test(url)).length, entryRequestsBefore);
  await page.close();
});

// The loader's other paths (app/src/host/load-app.ts), driven from a blank page that imports the compiled loader.

const LOADER = '/hosts/dev/dist/app/src/host/load-app.js';

/** Opens the blank fixture page and returns a helper that calls loadApp in it. */
async function openBlank() {
  const page = await browser.newPage();
  await page.goto(`${server.url}hosts/dev/test/fixtures/blank.html`);
  return page;
}

test('two callers while the entry file is still loading share one script tag and one app', async () => {
  const page = await openBlank();
  const result = await page.evaluate(async (loader) => {
    const { loadApp } = await import(loader);
    const { entry } = await (await fetch('/app/dist/stronghold-app.json')).json();
    const url = `${location.origin}/app/dist/${entry}`;
    const [first, second] = await Promise.all([loadApp(url), loadApp(url)]);
    const third = await loadApp(url);
    return {
      same: first === second && second === third,
      tags: document.querySelectorAll('script[data-stronghold-app]').length,
      state: document.querySelector('script[data-stronghold-app]').getAttribute('data-stronghold-state'),
      version: first.version,
    };
  }, LOADER);
  assert.equal(result.same, true);
  assert.equal(result.tags, 1);
  assert.equal(result.state, 'loaded');
  assert.equal(result.version, appVersion);
  await page.close();
});

test('a missing entry file rejects, and a second call for it rejects without a second script tag', async () => {
  const page = await openBlank();
  const result = await page.evaluate(async (loader) => {
    const { loadApp } = await import(loader);
    const url = `${location.origin}/hosts/dev/test/fixtures/missing.js`;
    const messages = [];
    for (let i = 0; i < 2; i++) {
      try {
        await loadApp(url);
        messages.push('resolved');
      } catch (error) {
        messages.push(error.message);
      }
    }
    return {
      messages,
      tags: document.querySelectorAll('script[data-stronghold-app]').length,
      state: document.querySelector('script[data-stronghold-app]').getAttribute('data-stronghold-state'),
    };
  }, LOADER);
  assert.match(result.messages[0], /did not load from .*missing\.js/);
  assert.match(result.messages[1], /did not load from .*missing\.js/);
  assert.equal(result.tags, 1);
  assert.equal(result.state, 'failed');
  await page.close();
});

test('a file that runs but registers nothing rejects instead of hanging', async () => {
  const page = await openBlank();
  const message = await page.evaluate(async (loader) => {
    const { loadApp } = await import(loader);
    try {
      await loadApp(`${location.origin}/hosts/dev/test/fixtures/not-the-app.js`);
      return 'resolved';
    } catch (error) {
      return error.message;
    }
  }, LOADER);
  assert.match(message, /did not register window\.Stronghold/);
  await page.close();
});

test('the dev host shows the failure when the entry file cannot be loaded', async () => {
  const page = await browser.newPage();
  await page.goto(`${server.url}hosts/dev/?app=/hosts/dev/test/fixtures/missing.js`);
  await page.evaluate(() => window.devHost.ready.catch(() => undefined));
  const status = await page.textContent('#status');
  assert.match(status, /Could not load the app from .*missing\.js/);
  assert.equal(await page.evaluate(() => document.querySelectorAll('.stronghold').length), 0);
  await page.close();
});
