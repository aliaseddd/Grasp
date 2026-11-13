// The bar's Save, Undo and Redo and the keys that work them, and the page's asks before a change would be lost: step 7
// of slice 1. The example is opened through the file input and Host is dragged by its blank header with the mouse, which
// is the change every test makes. What a test reads is the page as a person sees it: the buttons' states, their tooltips,
// where Host is drawn, the downloads and the dialogs.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  boxOf, BROWSER_FRAMES, byTestId, closePages, EXAMPLE, finish, frame, FRAMES, headerOf, launch, near, openPage, openStateFile, soon,
  stateFileAt, stateFileOf, TESTIDS, untilDrawn, viewTab, WAIT,
} from './helpers.mjs';

const NAME = path.basename(EXAMPLE);
const VIEW = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8')).model.views[0];
const BOX = 'Host';
/** How far Host is dragged, in px on the screen. */
const DRAG = { x: 90, y: 50 };
const STEP = 'Moved part def Host';

/** Opens the example in a page with the file input, on the plane of its view. */
async function openExample(browser, options = {}) {
  const opened = await openPage(browser, { picker: false, ...options });
  await openStateFile(opened.page, stateFileAt(EXAMPLE));
  await viewTab(opened.page, VIEW);
  await untilDrawn(opened.page, VIEW);
  return opened;
}

/** Waits for some frames, so that a thing that should not happen has had its time to. */
async function idle(page) {
  for (let i = 0; i < FRAMES; i++) await frame(page);
}

/** Waits until Host is drawn at `where` (px, give or take 2), or fails with `what`. */
function seenAt(page, where, what, was) {
  return soon(page, async () => { const now = await boxOf(page, VIEW.id, BOX); return now && near(now.x, where.x, 2) && near(now.y, where.y, 2) ? now : null; },
    async () => {
      const now = await boxOf(page, VIEW.id, BOX);
      return `${what}: ${BOX} should be at ${where.x.toFixed(1)}, ${where.y.toFixed(1)}${was ? ` (it was at ${was.x.toFixed(1)}, ${was.y.toFixed(1)})` : ''}, ` +
        `and is at ${now ? `${now.x.toFixed(1)}, ${now.y.toFixed(1)}` : 'nowhere'}.`;
    });
}

/**
 * Drags Host by its blank header, DRAG px, and returns where it was. With `check`, fails unless Host is drawn moved after,
 * and moved against App: a plane that pans on a press on a box takes every box with it, and moves none against another.
 */
async function dragHost(page, check = true) {
  const was = await boxOf(page, VIEW.id, BOX);
  const app = await boxOf(page, VIEW.id, 'App');
  assert.ok(was && app, `The plane of ${VIEW.name} draws no node for ${BOX} or App.`);
  const from = headerOf(was);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + DRAG.x / 3, from.y + DRAG.y / 3, { steps: 3 });
  await page.mouse.move(from.x + DRAG.x, from.y + DRAG.y, { steps: 3 });
  await page.mouse.up();
  if (check) {
    const apart = async () => { const h = await boxOf(page, VIEW.id, BOX); const a = await boxOf(page, VIEW.id, 'App'); return h && a ? { x: h.x - a.x, y: h.y - a.y } : null; };
    const want = { x: was.x - app.x + DRAG.x, y: was.y - app.y + DRAG.y };
    await soon(page, async () => { const o = await apart(); return o && near(o.x, want.x, 2) && near(o.y, want.y, 2); }, async () => {
      const o = await apart();
      return `A drag of ${BOX} by its header, ${DRAG.x} by ${DRAG.y} px, did not move it against App: its offset from App should be ${want.x.toFixed(1)}, ${want.y.toFixed(1)}, ` +
        `and is ${o ? `${o.x.toFixed(1)}, ${o.y.toFixed(1)}` : 'nowhere'} (it was ${(was.x - app.x).toFixed(1)}, ${(was.y - app.y).toFixed(1)}).`;
    });
    await seenAt(page, { x: was.x + DRAG.x, y: was.y + DRAG.y }, `A drag of ${BOX} by its header, ${DRAG.x} by ${DRAG.y} px, did not move it`, was);
  }
  return was;
}

const button = (page, id) => page.locator(byTestId(id));

/** The text of the tooltip of a bar button, after the pointer rests on it. */
async function tooltipOf(page, id) {
  await page.mouse.move(700, 600);
  await soon(page, async () => (await page.locator('[role="tooltip"]').count()) === 0, 'A tooltip stays on the page after the pointer left its button.');
  const box = await button(page, id).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const tip = page.locator('[role="tooltip"]');
  await soon(page, async () => (await tip.count()) > 0, `The pointer rests on ${id}, and no tooltip (role "tooltip") is shown.`);
  return (await tip.first().textContent()).trim();
}

describe('save, undo, redo and their keys', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('Save, Undo and Redo are enabled only when they have something to do', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const enabled = async () => ({ save: await button(page, TESTIDS.save).isEnabled(), undo: await button(page, TESTIDS.undo).isEnabled(), redo: await button(page, TESTIDS.redo).isEnabled() });
    assert.deepEqual(await enabled(), { save: false, undo: false, redo: false }, 'just opened, Save, Undo and Redo have nothing to do and are disabled');

    await dragHost(page, false);
    await soon(page, async () => { const e = await enabled(); return e.save && e.undo; },
      async () => `After a drag of ${BOX}, Save, Undo and Redo are enabled as ${JSON.stringify(await enabled())}: Save and Undo should be enabled.`);
    assert.equal(await button(page, TESTIDS.redo).isEnabled(), false, 'after a drag Redo is still disabled');
    assert.equal(await tooltipOf(page, TESTIDS.undo), `Undo ${STEP}`, 'Undo\'s tooltip names the step it takes back');

    await button(page, TESTIDS.undo).click({ timeout: WAIT });
    await soon(page, async () => (await enabled()).redo, async () => `After Undo, Redo is disabled: ${JSON.stringify(await enabled())}.`);
    assert.equal(await button(page, TESTIDS.undo).isEnabled(), false, 'after the only step is undone, Undo is disabled');
    assert.equal(await tooltipOf(page, TESTIDS.redo), `Redo ${STEP}`, 'Redo\'s tooltip names the step it makes again');
    await finish(opened);
  });

  for (const [what, undo, redo] of [
    ['Ctrl + Z undoes, Ctrl + Y and Ctrl + Shift + Z redo', 'Control+z', ['Control+y', 'Control+Shift+z']],
    ['Meta + Z undoes, Meta + Y and Meta + Shift + Z redo', 'Meta+z', ['Meta+y', 'Meta+Shift+z']],
  ]) {
    test(what, async () => {
      const opened = await openExample(browser);
      const { page } = opened;
      const was = await dragHost(page);
      const moved = { x: was.x + DRAG.x, y: was.y + DRAG.y };
      for (const key of redo) {
        await page.keyboard.press(undo);
        await seenAt(page, was, `${undo} did not undo the drag`);
        await page.keyboard.press(key);
        await seenAt(page, moved, `${key} did not redo the drag`);
      }
      await finish(opened);
    });
  }

  test('Ctrl + S saves the file, and is the page\'s even with no file open', async () => {
    // What a window listener of the test, in the bubble phase after the page's own, sees of each Ctrl + S.
    const listen = () => {
      window.__saves = [];
      addEventListener('keydown', (e) => { if (e.ctrlKey && e.key.toLowerCase() === 's') window.__saves.push(e.defaultPrevented); });
    };
    const opened = await openExample(browser);
    const { page } = opened;
    await page.evaluate(listen);
    await dragHost(page);
    // The wait is by the clock, started before the key: a download comes from another process, and frames are not time.
    const downloading = page.waitForEvent('download', { timeout: WAIT });
    await page.keyboard.press('Control+s');
    const download = await downloading.catch(() => null);
    assert.ok(download, `Ctrl + S with a file open and changes downloaded no file in ${WAIT} ms.`);
    assert.equal(download.suggestedFilename(), NAME, 'the download has the name of the file');
    assert.deepEqual(await page.evaluate(() => window.__saves), [true], 'the key\'s default is prevented, so the browser\'s own Save does not open');

    // No file open: a fresh page.
    const bare = await openPage(browser, { picker: false });
    const downloads = [];
    bare.page.on('download', (d) => downloads.push(d.suggestedFilename()));
    await bare.page.evaluate(listen);
    await bare.page.keyboard.press('Control+s');
    await soon(bare.page, async () => (await bare.page.evaluate(() => window.__saves)).length > 0, 'Ctrl + S reached no listener of the page.');
    await idle(bare.page);
    assert.deepEqual(await bare.page.evaluate(() => window.__saves), [true], 'with no file open Ctrl + S is still the page\'s: its default is prevented');
    assert.deepEqual(downloads, [], 'with no file open Ctrl + S downloads nothing');
    await finish(bare);
    await finish(opened);
  });

  test('Ctrl + S held down saves once', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await page.evaluate(() => {
      window.__saves = [];
      addEventListener('keydown', (e) => { if (e.ctrlKey && e.key.toLowerCase() === 's') window.__saves.push([e.repeat, e.defaultPrevented]); });
    });
    await dragHost(page);
    const downloads = [];
    page.on('download', (d) => downloads.push(d.suggestedFilename()));
    // The key goes down and repeats five times before it comes up, as it does when held for half a second.
    await page.keyboard.down('Control');
    for (let i = 0; i < 6; i++) await page.keyboard.down('s');
    await page.keyboard.up('s');
    await page.keyboard.up('Control');
    const start = Date.now();
    while (downloads.length === 0 && Date.now() - start < WAIT) await page.waitForTimeout(50);
    // By the clock: a download comes from another process, and one too many would come as late as the first.
    await page.waitForTimeout(1000);
    assert.deepEqual(downloads, [NAME], `Ctrl + S held through five repeats saved the file ${downloads.length} times; it should save once.`);
    assert.deepEqual(await page.evaluate(() => window.__saves), [[false, true], ...Array(5).fill([true, true])],
      'each keydown of the held Ctrl + S, the repeats too, has its default prevented, so the browser\'s own Save never opens');
    await finish(opened);
  });

  test('the keys change nothing while the question before Open is up', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const was = await dragHost(page);
    const moved = await boxOf(page, VIEW.id, BOX);
    const downloads = [];
    page.on('download', (d) => downloads.push(d.suggestedFilename()));
    await page.evaluate(() => {
      window.__saves = [];
      addEventListener('keydown', (e) => { if (e.ctrlKey && e.key.toLowerCase() === 's') window.__saves.push(e.defaultPrevented); });
    });
    const ask = page.getByRole('dialog');
    await button(page, TESTIDS.open).click({ timeout: WAIT });
    await soon(page, async () => (await ask.count()) === 1, 'Open, with unsaved changes, showed no dialog (role "dialog").', BROWSER_FRAMES);

    await page.keyboard.press('Control+z');
    await idle(page);
    const behind = await boxOf(page, VIEW.id, BOX);
    assert.ok(near(behind.x, moved.x, 2) && near(behind.y, moved.y, 2),
      `Ctrl + Z, with the question before Open up, undid the drag behind it: ${BOX} is at ${behind.x.toFixed(1)}, ${behind.y.toFixed(1)}, and was at ${moved.x.toFixed(1)}, ${moved.y.toFixed(1)}.`);
    assert.equal(await button(page, TESTIDS.fileName).textContent(), `${NAME} •`, 'the file still has the changes the question speaks of');
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(1000);
    assert.deepEqual(downloads, [], 'Ctrl + S, with the question before Open up, saved the file behind it');
    assert.deepEqual(await page.evaluate(() => window.__saves), [true], 'Ctrl + S is still the page\'s then: the browser\'s own Save does not open');

    // Once the question is answered the keys are the file's again.
    await ask.getByRole('button', { name: 'Cancel' }).click({ timeout: WAIT });
    await soon(page, async () => (await ask.count()) === 0, 'The dialog is still shown after Cancel.', BROWSER_FRAMES);
    await page.keyboard.press('Control+z');
    await seenAt(page, was, 'Ctrl + Z, after the question was cancelled, did not undo the drag', moved);
    await finish(opened);
  });

  test('a key in a text field undoes nothing of the model', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    const was = await dragHost(page);
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.id = 'test-input';
      input.style.cssText = 'position:fixed;left:700px;top:500px;z-index:99999';
      document.body.append(input);
      input.focus();
    });
    assert.ok(await page.evaluate(() => document.activeElement?.id === 'test-input'), 'the test\'s input has the focus');
    await page.keyboard.press('Control+z');
    await idle(page);
    await seenAt(page, { x: was.x + DRAG.x, y: was.y + DRAG.y }, 'Ctrl + Z in a text field undid the drag of the model');
    await finish(opened);
  });

  test('the page asks before a reload loses changes, and not once saved', async () => {
    const opened = await openExample(browser);
    const { page, dialogs } = opened;
    const unloads = () => dialogs.filter((d) => d.startsWith('beforeunload'));
    await dragHost(page);
    await page.reload();
    await page.waitForSelector(byTestId(TESTIDS.app));
    assert.equal(unloads().length, 1, `a reload with unsaved changes asks once in a beforeunload dialog. The dialogs: ${JSON.stringify(dialogs)}.`);

    await openStateFile(page, stateFileAt(EXAMPLE));
    await viewTab(page, VIEW);
    await untilDrawn(page, VIEW);
    await dragHost(page);
    const downloading = page.waitForEvent('download', { timeout: WAIT });
    await button(page, TESTIDS.save).click({ timeout: WAIT });
    assert.ok(await downloading.catch(() => null), `A click on Save downloaded no file in ${WAIT} ms.`);
    await page.reload();
    await page.waitForSelector(byTestId(TESTIDS.app));
    assert.equal(unloads().length, 1, `a reload after Save asks nothing more. The dialogs: ${JSON.stringify(dialogs)}.`);
    await finish(opened);
  });

  test('Open asks before another file takes the place of one with unsaved changes', async () => {
    // The ask is in the page, not in the browser's confirm(): a confirm's time counts against the click's user
    // activation (about 5 s in Chromium), and a chooser opened after it is refused.
    const opened = await openExample(browser);
    const { page, dialogs } = opened;
    const choosers = [];
    page.on('filechooser', (c) => choosers.push(c));
    await dragHost(page);
    const ask = page.getByRole('dialog');
    const askOpen = async () => {
      await button(page, TESTIDS.open).click({ timeout: WAIT });
      await soon(page, async () => (await ask.count()) === 1, 'Open, with unsaved changes, showed no dialog (role "dialog") before taking another file.', BROWSER_FRAMES);
      assert.ok(((await ask.textContent()) ?? '').includes(`${NAME} has changes that aren't saved. Open another file and lose them?`),
        `the dialog names the file and says its changes would be lost. It says: ${await ask.textContent()}`);
      assert.equal(await ask.getByRole('button', { name: 'Cancel' }).count(), 1, 'the dialog has a Cancel button');
      assert.equal(await ask.getByRole('button', { name: 'Open another' }).count(), 1, 'the dialog has an Open another button');
    };
    const gone = () => soon(page, async () => (await ask.count()) === 0, 'The dialog is still shown.', BROWSER_FRAMES);
    const stays = async (what) => {
      await idle(page);
      assert.equal(choosers.length, 0, `${what}, and a chooser opened all the same`);
      assert.ok(((await button(page, TESTIDS.fileName).textContent()) ?? '').startsWith(NAME), `${what}, and the file is no longer open`);
    };

    await askOpen();
    await ask.getByRole('button', { name: 'Cancel' }).click({ timeout: WAIT });
    await gone();
    await stays('Cancel closed the dialog');
    await askOpen();
    await page.keyboard.press('Escape');
    await gone();
    await stays('Escape closed the dialog');

    // The answer comes late: the click on Open another is its own, with a user activation of its own.
    await askOpen();
    await page.waitForTimeout(6000);
    const chooser = page.waitForEvent('filechooser', { timeout: WAIT });
    await ask.getByRole('button', { name: 'Open another' }).click({ timeout: WAIT });
    const given = await chooser.catch(() => null);
    assert.ok(given, 'Open another, clicked 6 s after the dialog came up, opened no file chooser: the click\'s user activation did not reach it.');
    await given.setFiles({ name: 'other.json', mimeType: 'application/json', buffer: fs.readFileSync(EXAMPLE) });
    await soon(page, async () => (await button(page, TESTIDS.fileName).textContent()) === 'other.json',
      async () => `The other file was given, and the bar shows "${await button(page, TESTIDS.fileName).textContent()}".`, BROWSER_FRAMES);
    await gone();
    assert.deepEqual(dialogs, [], 'the browser\'s own dialogs stay empty: the question is the page\'s');
    await finish(opened);
  });
});
