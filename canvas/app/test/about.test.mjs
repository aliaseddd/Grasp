// The About panel in the built page, opened from file://: step 12 of slice 1 (plan/swarm/step-12.md, sections 3 and 4).
// A dialog that reports, line by line, what this browser lets the page do, and names the libraries the page is built on.
// GitHub's address is routed on every context before About is opened, so that no request leaves the page.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  BROWSER_FRAMES, byTestId, closePages, DIST_URL, EXAMPLE, finish, frame, launch, modelOf, openPage, openStateFile, ROOT, soon, stateFileAt,
  TESTIDS, viewTab, withInit,
} from './helpers.mjs';

const GITHUB = 'https://api.github.com/rate_limit';
const RATE = { resources: { core: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } }, rate: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } };
const REACHED = 'Reached: 57 of 60 requests left this hour.';
const PANEL = byTestId(TESTIDS.aboutPanel);
const REMEMBER = byTestId('about-remember');
const NO_PANEL = `A click on About showed no About panel (data-testid "${TESTIDS.aboutPanel}").`;

/** The thirteen lines, in order, with their labels. */
const LABELS = [
  ['browser', 'Browser'], ['secure', 'Secure context'], ['open-picker', 'Open picker'], ['save-picker', 'Save picker'],
  ['folder-picker', 'Folder picker'], ['file-input', 'File input'], ['download', 'Download'], ['local-storage', 'localStorage'],
  ['indexed-db', 'IndexedDB'], ['worker', 'Worker from a Blob URL'], ['wasm', 'WebAssembly'], ['github', 'GitHub'], ['folder', 'Remembered folder'],
];
const IDS = LABELS.map(([id]) => id);
const WASM_TEXT = /^Runs: 50 million steps in \d+ ms; the same loop in JavaScript took \d+ ms\.$/;
const REMEMBERED_NOW = 'Remembered now: grasp-folder. Reload the page, or restart the browser, and open About again.';

/** GitHub's answer, stubbed on the context; with `hold` (a promise), the answer waits for it. */
async function stubGitHub(context, hold) {
  await context.route(GITHUB, async (route) => {
    if (hold) await hold;
    await route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(RATE),
    });
  });
}

/** Clicks the bar's About and waits for the panel. */
async function openAbout(page) {
  const button = page.locator(byTestId(TESTIDS.about));
  const enabled = (await button.count()) > 0 && (await button.isEnabled());
  assert.ok(enabled, `About is disabled (data-testid "${TESTIDS.about}"), so the About panel cannot be opened.`);
  await button.click();
  await soon(page, async () => (await page.locator(PANEL).count()) > 0, NO_PANEL);
}

const closed = (page) => soon(page, async () => (await page.locator(PANEL).count()) === 0, 'The About panel is still in the document after it was closed.', BROWSER_FRAMES);

/** For each line of the panel: [id, data-state, label, value]. */
const lines = (page) => page.evaluate((panel) => [...document.querySelectorAll(`${panel} [data-line]`)].map((el) => [
  el.getAttribute('data-line'), el.getAttribute('data-state'),
  el.querySelector('.grasp-about-label')?.textContent.trim() ?? null, el.querySelector('.grasp-about-value')?.textContent.trim() ?? null,
]), PANEL);

/** Waits until the panel has a line and none is pending; gives the lines. */
const answered = (page) => soon(page, async () => { const all = await lines(page); return all.length > 0 && all.every((line) => line[1] !== 'pending') ? all : null; },
  async () => { const all = await lines(page); return all.length ? `Lines of the About panel still say Asking…: ${all.filter((l) => l[1] === 'pending').map((l) => l[0]).join(', ')}.` : 'The About panel has no line (data-line).'; },
  BROWSER_FRAMES);

/** What the page asked for outside its own folder. */
const outside = (opened) => opened.requests.filter((url) => !url.startsWith(DIST_URL) && !/^(data|blob|about):/.test(url));

const lineOf = (all, id) => all.find((line) => line[0] === id);
const stateOf = (all, id) => { const line = lineOf(all, id); assert.ok(line, `The About panel has no line "${id}".`); return line.slice(1, 4).filter((_, i) => i !== 1); };

describe('the About panel', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('About opens from the bar, with no file open and with one, and closes by its button, by Escape and by a click outside it', async () => {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await stubGitHub(opened.context);
    await openAbout(page);
    const panel = page.locator(PANEL);
    assert.equal(await panel.getAttribute('role'), 'dialog', 'The About panel has no role "dialog".');
    assert.equal(await panel.getAttribute('aria-modal'), 'true', 'The About panel is not aria-modal "true".');
    assert.equal(await page.getByRole('dialog', { name: 'About Grasp' }).count(), 1, 'No dialog is named "About Grasp".');
    await page.locator(PANEL).getByRole('button', { name: 'Close', exact: true }).click();
    await closed(page);
    await openAbout(page);
    await page.keyboard.press('Escape');
    await closed(page);
    await openAbout(page);
    await page.mouse.click(20, 450);
    await closed(page);
    await openStateFile(page, stateFileAt(EXAMPLE));
    await openAbout(page);
    assert.equal(await page.getByRole('dialog', { name: 'About Grasp' }).count(), 1, 'With a file open, no dialog is named "About Grasp".');
    await finish(opened);
  });

  test('each line reports what this Chromium does, with GitHub\'s answer stubbed', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    await stubGitHub(opened.context);
    await openAbout(page);
    const all = await answered(page);
    assert.deepEqual(all.map((line) => line[0]), IDS, 'The About panel\'s lines (data-line) are not the thirteen, in order.');
    assert.deepEqual(all.map((line) => line[2]), LABELS.map(([, label]) => label), 'The lines\' labels are not as expected.');
    const browserLine = lineOf(all, 'browser');
    assert.equal(browserLine[1], 'told', 'The browser line is not "told".');
    const version = /^Chrome (\d+(?:\.\d+)*)$/.exec(browserLine[3]);
    assert.ok(version, `The browser line says "${browserLine[3]}", not "Chrome <version>".`);
    assert.equal(version[1].split('.')[0], browser.version().split('.')[0], 'The browser line\'s version has not the first number of the browser\'s.');
    assert.deepEqual(stateOf(all, 'secure'), ['yes', 'Yes.'], 'secure');
    for (const id of ['open-picker', 'save-picker', 'folder-picker', 'file-input', 'download']) assert.deepEqual(stateOf(all, id), ['yes', 'Present.'], id);
    for (const id of ['local-storage', 'indexed-db', 'worker']) assert.deepEqual(stateOf(all, id), ['yes', 'Works.'], id);
    const wasm = lineOf(all, 'wasm');
    assert.equal(wasm[1], 'yes', `The wasm line is "${wasm[1]}" and says "${wasm[3]}".`);
    assert.match(wasm[3], WASM_TEXT, 'The wasm line\'s words');
    assert.deepEqual(stateOf(all, 'github'), ['yes', REACHED], 'github');
    assert.deepEqual(stateOf(all, 'folder'), ['told', 'None is remembered.'], 'folder');
    assert.equal(await page.locator(REMEMBER).isEnabled(), true, 'Remember a folder… is disabled although the browser has a folder picker.');
    await finish(opened);
  });

  test('the libraries\' versions are the installed ones, and React Flow and the notices file are credited', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    await stubGitHub(opened.context);
    await openAbout(page);
    const names = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).dependencies).sort();
    const installed = names.map((name) => { const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules', name, 'package.json'), 'utf8')); return [name, p.version, p.license]; });
    const rows = await soon(page, async () => {
      const found = await page.evaluate((panel) => [...document.querySelectorAll(`${panel} [data-library]`)].map((el) => [
        el.getAttribute('data-library'), el.querySelector('.grasp-about-library-name')?.textContent.trim() ?? null,
        el.querySelector('.grasp-about-library-version')?.textContent.trim() ?? null, el.querySelector('.grasp-about-library-licence')?.textContent.trim() ?? null,
      ]), PANEL);
      return found.length ? found : null;
    }, 'The About panel lists no library (data-library).');
    assert.deepEqual(rows.map((row) => row[0]), names, 'The libraries listed (data-library) are not the dependencies of package.json, in the order of their names.');
    assert.deepEqual(rows.map((row) => [row[0], row[2], row[3]]), installed, 'A library\'s version or licence is not the installed package\'s.');
    assert.deepEqual(rows.map((row) => row[1]), names, 'A library\'s name is not its package\'s name.');
    const credit = page.locator(byTestId('about-react-flow'));
    assert.equal((await credit.textContent()).trim(), 'The planes are drawn with React Flow (@xyflow/react).', 'The credit to React Flow (data-testid "about-react-flow")');
    assert.equal((await credit.locator('a').first().textContent()).trim(), 'React Flow', 'The credit\'s link does not read "React Flow".');
    assert.equal(await credit.locator('a').first().getAttribute('href'), 'https://reactflow.dev', 'The credit\'s link does not go to https://reactflow.dev.');
    const notices = page.locator(byTestId('about-notices'));
    assert.equal((await notices.textContent()).trim(), 'Every library\'s licence is in THIRD-PARTY-NOTICES.txt, beside the page.', 'The notices sentence (data-testid "about-notices")');
    assert.equal((await notices.locator('a').first().textContent()).trim(), 'THIRD-PARTY-NOTICES.txt', 'The notices link does not read "THIRD-PARTY-NOTICES.txt".');
    assert.equal(await notices.locator('a').first().getAttribute('href'), 'THIRD-PARTY-NOTICES.txt', 'The notices link does not go to THIRD-PARTY-NOTICES.txt.');
    await finish(opened);
  });

  test('with the pickers taken away, the panel says so and Open falls back to the file input', async () => {
    const taken = withInit(browser, () => { delete window.showSaveFilePicker; delete window.showDirectoryPicker; });
    const opened = await openPage(taken, { picker: false });
    const { page } = opened;
    await stubGitHub(opened.context);
    await openAbout(page);
    const all = await answered(page);
    assert.deepEqual(stateOf(all, 'open-picker'), ['no', 'Missing: Open asks through a file input, and Save downloads the file.'], 'open-picker');
    assert.deepEqual(stateOf(all, 'save-picker'), ['no', 'Missing.'], 'save-picker');
    assert.deepEqual(stateOf(all, 'folder-picker'), ['no', 'Missing: no folder can be remembered.'], 'folder-picker');
    assert.deepEqual(stateOf(all, 'file-input'), ['yes', 'Present.'], 'file-input');
    assert.deepEqual(stateOf(all, 'download'), ['yes', 'Present.'], 'download');
    assert.equal(await page.locator(REMEMBER).isDisabled(), true, 'Remember a folder… is enabled although the browser has no folder picker.');
    await page.locator(PANEL).getByRole('button', { name: 'Close', exact: true }).click();
    await closed(page);
    await openStateFile(page, stateFileAt(EXAMPLE));
    await viewTab(page, modelOf(EXAMPLE).views[0]);
    await finish(opened);
  });

  test('the network is asked only when About is opened, once at each opening, and the timing loop runs once', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    await stubGitHub(opened.context);
    await page.evaluate(() => document.fonts.ready);
    await frame(page);
    assert.deepEqual(outside(opened), [], 'The page asked for something outside its folder before About was opened.');
    await openAbout(page);
    const first = await answered(page);
    assert.deepEqual(outside(opened), [GITHUB], 'After the first opening, the page should have asked for GitHub\'s address once, and nothing else.');
    const wasm = lineOf(first, 'wasm');
    await page.locator(PANEL).getByRole('button', { name: 'Close', exact: true }).click();
    await closed(page);
    await openAbout(page);
    const at = lineOf(await lines(page), 'wasm');
    assert.deepEqual([at[1], at[3]], [wasm[1], wasm[3]], 'At the second opening the wasm line is not, at first look, what it was: the timing loop ran again or the line was asked again.');
    assert.equal(at[1], 'yes', 'At the second opening the wasm line is not "yes" at first look.');
    await answered(page);
    assert.deepEqual(outside(opened), [GITHUB, GITHUB], 'After the second opening, the page should have asked for GitHub\'s address twice, and nothing else.');
    await finish(opened);
  });

  test('a line says Asking… until its answer comes', async () => {
    const opened = await openPage(browser);
    const { page } = opened;
    let release;
    const hold = new Promise((resolve) => { release = resolve; });
    await stubGitHub(opened.context, hold);
    try {
      await openAbout(page);
      const all = await soon(page, async () => {
        const now = await lines(page);
        return ['indexed-db', 'worker', 'folder'].every((id) => { const l = lineOf(now, id); return l && l[1] !== 'pending'; }) ? now : null;
      }, 'The IndexedDB, worker and remembered-folder lines still say Asking…, or are not in the panel.', BROWSER_FRAMES);
      assert.deepEqual(stateOf(all, 'github'), ['pending', 'Asking…'], 'While GitHub\'s answer is held, the github line should be pending and say Asking….');
      assert.equal(lineOf(all, 'secure')[1], 'yes', 'While GitHub\'s answer is held, the secure line is not "yes".');
    } finally {
      release();
    }
    const done = await answered(page);
    assert.deepEqual(stateOf(done, 'github'), ['yes', REACHED], 'github, once its answer came');
    await finish(opened);
  });

  test('a folder remembered survives a reload, and the next opening says so', async () => {
    const standIn = withInit(browser, () => { window.showDirectoryPicker = async () => ({ kind: 'directory', name: 'grasp-folder' }); });
    const opened = await openPage(standIn);
    const { page } = opened;
    await stubGitHub(opened.context);
    const before = Date.now();
    await openAbout(page);
    assert.deepEqual(stateOf(await answered(page), 'folder'), ['told', 'None is remembered.'], 'folder, before the click');
    await page.locator(REMEMBER).click();
    await soon(page, async () => (lineOf(await lines(page), 'folder')?.[3] ?? '').startsWith('Remembered now'),
      async () => `The remembered-folder line, after a click on Remember a folder…, says "${lineOf(await lines(page), 'folder')?.[3]}", not "Remembered now…".`);
    assert.deepEqual(stateOf(await lines(page), 'folder'), ['told', REMEMBERED_NOW], 'folder, after the click');
    await page.locator(PANEL).getByRole('button', { name: 'Close', exact: true }).click();
    await closed(page);
    await openAbout(page);
    assert.deepEqual(stateOf(await answered(page), 'folder'), ['told', REMEMBERED_NOW], 'folder, at the next opening in the same page load');
    await page.reload();
    await page.waitForSelector(byTestId(TESTIDS.app));
    await openAbout(page);
    const [state, value] = stateOf(await answered(page), 'folder');
    assert.equal(state, 'yes', `After a reload, the remembered-folder line is "${state}" and says "${value}".`);
    const survived = /^Survived: grasp-folder, remembered (\S+)\. Permission: not told\.$/.exec(value);
    assert.ok(survived, `After a reload, the remembered-folder line says "${value}", not "Survived: grasp-folder, remembered <time>. Permission: not told."`);
    const at = Date.parse(survived[1]);
    assert.ok(new Date(at).toISOString() === survived[1] && at >= before && at <= Date.now(), `The time remembered, "${survived[1]}", is not an ISO time between the click and now.`);
    await finish(opened);
  });
});
