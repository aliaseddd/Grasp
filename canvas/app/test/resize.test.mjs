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

/**
 * Selects Host and drags its bottom right handle by DRAG px and waits for the plane to draw it grown.
 * Returns the box as it was and as it is.
 */
async function resizeBox(page, view) {
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
  return { was, resized };
}

describe('resizing a box', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('a box resized by its handles keeps its size after save and reload', async () => {
    const example = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8'));
    const view = example.model.views[0];
    const name = path.basename(EXAMPLE);
    const opened = await openPage(browser, { picker: false });
    const { page, dialogs } = opened;
    await openStateFile(page, stateFileAt(EXAMPLE));
    await viewTab(page, view);
    await untilDrawn(page, view);

    const { was, resized } = await resizeBox(page, view);

    // Save: the state file comes as a download under the name it was opened by.
    const save = page.locator(byTestId(TESTIDS.save));
    assert.ok((await save.count()) === 1, `The page has no Save button (data-testid "${TESTIDS.save}").`);
    assert.ok(await save.isEnabled(), 'Save is disabled after the resize: the page holds no change to save.');
    // By the clock, started before the click: a download comes from another process, and frames are not time.
    const downloading = page.waitForEvent('download', { timeout: WAIT });
    await save.click({ timeout: WAIT });
    const download = await downloading.catch(() => null);
    assert.ok(download, `A click on Save downloaded no file in ${WAIT} ms.`);
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

  test('a save through the picker writes back through the file\'s handle', async () => {
    const example = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8'));
    const view = example.model.views[0];
    const name = path.basename(EXAMPLE);
    const opened = await openPage(browser);
    const { page } = opened;
    // A stand-in for the browser's picker: it hands out a handle whose file is the example, and whose writable records
    // what it is given, and whether it was closed, in a global of the test's own.
    await page.evaluate(([text, fileName]) => {
      window.__written = { texts: [], closed: 0, created: 0 };
      const handle = {
        kind: 'file',
        name: fileName,
        getFile: async () => new File([text], fileName, { type: 'application/json' }),
        queryPermission: async () => 'granted',
        requestPermission: async () => 'granted',
        createWritable: async () => {
          window.__written.created++;
          return {
            write: async (data) => { window.__written.texts.push(typeof data === 'string' ? data : await new Blob([data]).text()); },
            close: async () => { window.__written.closed++; },
          };
        },
      };
      window.showOpenFilePicker = async () => [handle];
    }, [fs.readFileSync(EXAMPLE, 'utf8'), name]);
    const downloads = [];
    page.on('download', (d) => downloads.push(d.suggestedFilename()));

    await page.locator(byTestId(TESTIDS.open)).click({ timeout: WAIT });
    await soon(page, () => page.evaluate(([selector, file]) => [...document.querySelectorAll(selector)].some((el) => el.textContent.includes(file)),
      [byTestId(TESTIDS.fileName), name]), `After the picker gave a handle for ${name}, the bar does not show that name: the file is not open.`);
    await viewTab(page, view);
    await untilDrawn(page, view);
    const { resized } = await resizeBox(page, view);

    const bar = page.locator(byTestId(TESTIDS.fileName));
    await soon(page, async () => ((await bar.textContent()) ?? '').endsWith(' •'), async () => `After the resize the bar shows "${await bar.textContent()}", with no " •" for unsaved changes.`);
    const save = page.locator(byTestId(TESTIDS.save));
    assert.ok(await save.isEnabled(), 'Save is disabled after the resize: the page holds no change to save.');
    await save.click({ timeout: WAIT });
    const written = () => page.evaluate(() => window.__written);
    await soon(page, async () => (await written()).closed > 0, async () => {
      const w = await written();
      return `A click on Save wrote nothing back through the file's handle (createWritable called ${w.created} times, ${w.texts.length} writes, ${w.closed} closes). Downloads: ${JSON.stringify(downloads)}.`;
    }, BROWSER_FRAMES);
    const got = await written();
    assert.equal(got.texts.length, 1, 'the file is written in one write');
    const saved = JSON.parse(got.texts[0]);
    assert.equal(saved.format, 'grasp/2', 'the written text is a state file in format grasp/2');
    const { w, h } = saved.model.views.find((v) => v.id === view.id).layout[BOX];
    assert.ok(Math.abs(w - resized.w) <= 1 && Math.abs(h - resized.h) <= 1,
      `The written layout holds ${BOX} as ${w} by ${h}, and the plane draws it ${resized.w} by ${resized.h}.`);
    assert.deepEqual(downloads, [], 'a save through a handle downloads nothing');
    await soon(page, async () => !((await bar.textContent()) ?? '').includes('•'), async () => `After the save the bar still shows "${await bar.textContent()}".`);
    assert.equal(await bar.textContent(), name, 'the bar shows the file name alone once saved');
    await finish(opened);
  });

  test('a save that the browser refuses says so and leaves the file unsaved', async () => {
    const example = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8'));
    const view = example.model.views[0];
    const name = path.basename(EXAMPLE);
    const opened = await openPage(browser);
    const { page } = opened;
    // A picker whose handle's writable refuses the write, and records whether it was aborted or closed.
    await page.evaluate(([text, fileName]) => {
      window.__refused = { created: 0, aborted: 0, closed: 0 };
      const handle = {
        kind: 'file',
        name: fileName,
        getFile: async () => new File([text], fileName, { type: 'application/json' }),
        queryPermission: async () => 'granted',
        requestPermission: async () => 'granted',
        createWritable: async () => {
          window.__refused.created++;
          return {
            write: async () => { throw new Error('disk full'); },
            abort: async () => { window.__refused.aborted++; },
            close: async () => { window.__refused.closed++; },
          };
        },
      };
      window.showOpenFilePicker = async () => [handle];
    }, [fs.readFileSync(EXAMPLE, 'utf8'), name]);

    await page.locator(byTestId(TESTIDS.open)).click({ timeout: WAIT });
    await soon(page, () => page.evaluate(([selector, file]) => [...document.querySelectorAll(selector)].some((el) => el.textContent.includes(file)),
      [byTestId(TESTIDS.fileName), name]), `After the picker gave a handle for ${name}, the bar does not show that name: the file is not open.`);
    await viewTab(page, view);
    await untilDrawn(page, view);
    await resizeBox(page, view);

    const bar = page.locator(byTestId(TESTIDS.fileName));
    await soon(page, async () => ((await bar.textContent()) ?? '').endsWith(' •'), async () => `After the resize the bar shows "${await bar.textContent()}", with no " •" for unsaved changes.`);
    const save = page.locator(byTestId(TESTIDS.save));
    await save.click({ timeout: WAIT });
    // Other elements may carry role "alert" (empty live regions): the one that names the file is the page's.
    const alertTexts = async () => (await page.getByRole('alert').allTextContents()).map((t) => t.trim());
    const want = `${name} wasn't saved: disk full`;
    await soon(page, async () => (await alertTexts()).includes(want), async () => `The browser refused the write, and no element with role "alert" says "${want}". The alerts: ${JSON.stringify(await alertTexts())}.`, BROWSER_FRAMES);
    assert.ok(((await bar.textContent()) ?? '').endsWith(' •'), `the write failed, and the bar shows "${await bar.textContent()}", with no " •": the file is not unsaved`);
    assert.ok(await save.isEnabled(), 'the write failed, and Save is disabled');
    assert.deepEqual(await page.evaluate(() => window.__refused), { created: 1, aborted: 1, closed: 0 },
      'a refused write aborts its writable once and does not close it (createWritable, abort and close calls)');
    await finish(opened);
  });

  // Slice 2 (plan/slice-2.md, seam 4): a box's marks lie across its top edge at its right end (plane/marks/marks.css),
  // where its top right handle is. The handles stay over the marks, so a marked box can be resized from every corner.
  // Nothing marks a box in the scaffold's page, so the test puts a row of one 16 px mark into the node as Badge would.
  test('a mark on a selected box leaves its four corner handles to the pointer', async () => {
    const view = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8')).model.views[0];
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await openStateFile(page, stateFileAt(EXAMPLE));
    await viewTab(page, view);
    await untilDrawn(page, view);
    await selectBox(page, view, BOX);
    const handles = page.locator(`${nodeOf(view.id, BOX)} ${HANDLE}`);
    await soon(page, async () => (await handles.count()) === 4, `${BOX}, selected, does not show its four corner handles (${HANDLE}).`);
    const seen = await page.evaluate(([node, handle]) => {
      const el = document.querySelector(node);
      const row = document.createElement('div');
      row.className = 'grasp-marks nodrag nopan';
      const mark = document.createElement('span');
      mark.style.cssText = 'display: block; width: 16px; height: 16px';
      row.appendChild(mark);
      el.appendChild(row);
      const middle = (r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
      const corners = [...el.querySelectorAll(handle)].map((h) => {
        const at = middle(h.getBoundingClientRect());
        const top = document.elementFromPoint(at.x, at.y);
        return { handle: h.className, free: top === h, under: top === h ? null : top?.tagName };
      });
      const at = middle(mark.getBoundingClientRect());
      const markFree = document.elementFromPoint(at.x, at.y) === mark;
      row.remove();
      return { corners, markFree };
    }, [nodeOf(view.id, BOX), HANDLE]);
    for (const corner of seen.corners) assert.ok(corner.free, `With a mark on ${BOX}, the handle "${corner.handle}" lies under a ${corner.under} at its middle, so the box cannot be resized from that corner.`);
    assert.ok(seen.markFree, `The mark on ${BOX} lies under something at its middle: a click there would not reach it.`);
    await finish(opened);
  });
});
