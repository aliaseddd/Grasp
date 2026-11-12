// A box resized by its handles keeps its size after save and reload: the fifth of slice 1's "Done when" checks,
// written in step 3, before what it checks, and marked todo until step 7 writes a resize into the model and saves the
// file.
//
// The test opens the example through the file input, selects Host on the plane of the example's view, and drags the
// handle at its bottom right corner. It saves, which downloads the state file, since a file that came through an input
// has no handle to write back through. It reads the download: the format, the size in the view's layout, everything
// else as it was, and the text canvas/export.mjs prints from it. Then it reloads the page, opens the saved file, and
// finds the size on the plane.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  boxOf, BROWSER_FRAMES, byTestId, closePages, EXAMPLE, finish, HANDLE, launch, nodeOf, openPage, openStateFile, planeOf, ROOT,
  selectBox, soon, stateFileAt, TESTIDS, untilDrawn, viewTab, WAIT,
} from './helpers.mjs';

const EXPORT = path.join(ROOT, 'canvas', 'export.mjs');
/** The textual SysML v2 of the example, which a change to a box's size leaves as it is. */
const EXPORTED = path.join(ROOT, 'canvas', 'test', 'fixtures', 'format1.sysml');
/** The box that is resized, and how far its handle is dragged, in px on the screen. */
const BOX = 'Host';
const DRAG = { x: 60, y: 40 };

describe('resizing a box', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('a box resized by its handles keeps its size after save and reload', { todo: 'step 7 writes a resize into the model and saves the file' }, async () => {
    const example = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8'));
    const view = example.model.views[0];
    const name = path.basename(EXAMPLE);
    const opened = await openPage(browser, { picker: false });
    const { page, dialogs } = opened;
    await openStateFile(page, stateFileAt(EXAMPLE));
    await viewTab(page, view);
    await untilDrawn(page, view);

    // The handle at the bottom right corner of the selected box, dragged down and to the right.
    const was = await selectBox(page, view, BOX);
    const handle = page.locator(`${nodeOf(view.id, BOX)} ${HANDLE}.bottom.right`);
    await soon(page, async () => (await handle.count()) === 1,
      `${BOX}, selected, shows no resize handle at its bottom right corner (${HANDLE}.bottom.right).`);
    const grip = await handle.boundingBox();
    assert.ok(grip, `The resize handle at the bottom right corner of ${BOX} is not shown.`);
    const from = { x: grip.x + grip.width / 2, y: grip.y + grip.height / 2 };
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x + DRAG.x / 2, from.y + DRAG.y / 2);
    await page.mouse.move(from.x + DRAG.x, from.y + DRAG.y);
    await page.mouse.up();
    // The box follows its handle: it grows by what the handle moved, in the view's units, give or take a rounding.
    const grown = { w: was.w + DRAG.x / was.zoom, h: was.h + DRAG.y / was.zoom };
    const resized = await soon(page, async () => {
      const now = await boxOf(page, view.id, BOX);
      return now && Math.abs(now.w - grown.w) <= 2 && Math.abs(now.h - grown.h) <= 2 ? now : null;
    }, async () => {
      const now = await boxOf(page, view.id, BOX);
      return `The handle at the bottom right corner of ${BOX} was dragged ${DRAG.x} by ${DRAG.y} px at ${Math.round(was.zoom * 100)}%, which makes a box of ` +
        `${was.w} by ${was.h} one of ${Math.round(grown.w)} by ${Math.round(grown.h)}. It is ${now?.w} by ${now?.h}.`;
    });

    // Save: the state file comes as a download under the name it was opened by.
    const save = page.locator(byTestId(TESTIDS.save));
    assert.ok((await save.count()) === 1, `The page has no Save button (data-testid "${TESTIDS.save}").`);
    assert.ok(await save.isEnabled(), 'Save is disabled after the resize: the page holds no change to save.');
    let download = null;
    page.waitForEvent('download', { timeout: WAIT }).then((got) => { download = got; }, () => {});
    await save.click({ timeout: WAIT });
    await soon(page, async () => download, 'A click on Save downloaded no file.', BROWSER_FRAMES);
    assert.equal(download.suggestedFilename(), name, 'the download has the name of the file that was opened');
    const file = await download.path();
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));

    // The saved file: today's format, the new size, and nothing else changed.
    assert.equal(saved.format, 'grasp/2', 'the saved file names its format');
    assert.equal(saved.model.format, 'grasp/2', 'the saved model is in the format the old page reads');
    assert.deepEqual(saved.notes, example.notes, 'the notes are as they were');
    assert.deepEqual(saved.archive, example.archive, 'the archive is as it was');
    const layout = saved.model.views.find((v) => v.id === view.id).layout;
    const { w, h, ...place } = layout[BOX];
    assert.ok(Math.abs(w - resized.w) <= 1 && Math.abs(h - resized.h) <= 1,
      `The saved layout holds ${BOX} as ${w} by ${h}, and the plane draws it ${resized.w} by ${resized.h}.`);
    assert.deepEqual(place, { x: view.layout[BOX].x, y: view.layout[BOX].y }, `${BOX} is saved where it was: its bottom right handle moves no other corner`);
    assert.deepEqual({ ...layout, [BOX]: null }, { ...view.layout, [BOX]: null }, 'every other place in the view is as it was');
    assert.equal(execFileSync(process.execPath, [EXPORT, file], { encoding: 'utf8' }), fs.readFileSync(EXPORTED, 'utf8'),
      'canvas/export.mjs prints from the saved file what it prints from the example');

    // Reload: the page remembers no file, and asks nothing, since the file was saved.
    await page.reload();
    await page.waitForSelector(byTestId(TESTIDS.app));
    assert.deepEqual(dialogs, [], 'the page asks nothing before the reload: the file was saved');
    assert.equal(await page.locator(planeOf(view.id)).count(), 0, 'after the reload no file is open');

    // The saved file, opened: the box has the size it was given.
    await openStateFile(page, { name, buffer: fs.readFileSync(file) });
    await viewTab(page, view);
    await untilDrawn(page, view);
    const reopened = await boxOf(page, view.id, BOX);
    assert.ok(reopened, `The plane of ${view.name} draws no node for ${BOX} once the saved file is open.`);
    assert.deepEqual({ w: reopened.w, h: reopened.h }, { w: resized.w, h: resized.h }, `${BOX} has the size it was resized to, after save and reload`);
    await finish(opened);
  });
});
