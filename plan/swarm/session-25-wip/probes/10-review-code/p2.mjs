import path from 'node:path';
import {
  launch, openIn, stateFileAt, EXAMPLE, FIXTURES, modelOf, untilDrawn, pickBox, pickRow, fieldIn, steps, undone, active, val, shown, tick, log,
  groundPoint, showTab, byTestId, sel, DETAILS, showSide, el, wordsOf, openStateFile, viewTab, undo, redo,
} from './lib.mjs';

const VIEW = modelOf(EXAMPLE).views[0];
const fx = (n) => path.join(FIXTURES, `${n}.json`);
const browser = await launch();
const only = process.argv.slice(2);

async function ex(file = EXAMPLE) {
  const o = await openIn(browser, stateFileAt(file));
  if (file === EXAMPLE) await untilDrawn(o.page, VIEW);
  await showSide(o.page, 'Details');
  return o;
}
const typeEnd = async (page, field, text) => { await fieldIn(page, field).click(); await page.keyboard.press('End'); await page.keyboard.type(text); await tick(page); };
const state = async (page, extra = {}) => ({ steps: await steps(page), undone: await undone(page), active: await active(page), shown: await shown(page), ...extra });

const probes = {
  // Undo by key with focus in a picker, after a pick by keyboard
  async pickerKeyUndo() {
    const o = await ex(fx('interconnection'));
    const { page } = o;
    await pickRow(page, 'el', 'FuelPort.supply');
    await showTab(page, 'Core');
    const p = fieldIn(page, 'type');
    await p.focus();
    await page.keyboard.press('ArrowDown'); await tick(page);
    await page.keyboard.press('ArrowDown'); await tick(page);
    await page.keyboard.press('Enter'); await tick(page);
    log('after pick by keys', await state(page, { value: await p.getAttribute('data-value'), text: await p.inputValue() }));
    await page.keyboard.press('Control+z'); await tick(page, 3);
    log('after Ctrl+Z in picker', await state(page, { value: await p.getAttribute('data-value'), text: await p.inputValue() }));
    // type to narrow then pick
    await page.keyboard.press('Control+a'); await page.keyboard.type('Fu'); await tick(page);
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await tick(page, 3);
    log('after narrow+pick', await state(page, { value: await p.getAttribute('data-value'), text: await p.inputValue() }));
    await page.keyboard.press('Control+z'); await tick(page, 3);
    log('after Ctrl+Z', await state(page, { value: await p.getAttribute('data-value'), text: await p.inputValue() }));
    await page.keyboard.press('Tab'); await tick(page, 3);
    log('after Tab', await state(page, { value: await fieldIn(page, 'type').getAttribute('data-value'), text: await fieldIn(page, 'type').inputValue() }));
    log('problems', o.problems);
    await o.context.close();
  },
  // Browser undo after bar Undo
  async browserUndoAfterBarUndo() {
    const o = await ex();
    const { page } = o;
    await pickBox(page, VIEW, 'Host');
    await typeEnd(page, 'name', 'abc');
    await page.keyboard.press('Tab'); await tick(page);
    await undo(page); await tick(page);
    log('after bar undo', await state(page, { name: await val(page, 'field-name') }));
    await fieldIn(page, 'name').click(); await page.keyboard.press('End');
    await page.keyboard.press('Control+z'); await tick(page, 3);
    log('after Ctrl+Z in field', await state(page, { name: await val(page, 'field-name'), model: (await el(page, 'Host')).name }));
    await page.keyboard.press('Control+z'); await tick(page, 3);
    log('after 2nd Ctrl+Z in field', await state(page, { name: await val(page, 'field-name'), model: (await el(page, 'Host')).name }));
    await page.keyboard.press('Tab'); await tick(page, 3);
    log('after Tab', await state(page, { name: await val(page, 'field-name'), model: (await el(page, 'Host')).name }));
    log('problems', o.problems);
    await o.context.close();
  },
  // A line that is not drawn, and a line, a port, a view
  async kinds() {
    const o = await ex();
    const { page } = o;
    for (const [t, id] of [['rel', 't-hosts-api'], ['rel', 'mount'], ['el', 'Page.hosts.api'], ['view', 'v-proof'], ['rel', 's-ServerHost']]) {
      try {
        await pickRow(page, t, id);
        const form = await page.evaluate((root) => ({
          what: document.querySelector(`${root} .grasp-details-what`)?.textContent,
          title: document.querySelector(`${root} .grasp-details-title`)?.textContent,
          fields: [...document.querySelectorAll(`${root} .grasp-field`)].map((e) => e.getAttribute('data-field')),
        }), DETAILS);
        log(t, id, form);
      } catch (e) { log(t, id, 'ERR', e.message.split('\n')[0]); }
    }
    log('problems', o.problems);
    await o.context.close();
  },
  // typeLine on a port: tick, plane draws, undo
  async typeLine() {
    const o = await ex();
    const { page } = o;
    await pickBox(page, VIEW, 'Page.hosts').catch(() => {});
    await pickRow(page, 'el', 'Page.hosts.api');
    await showTab(page, 'Core');
    const edgesBefore = await page.evaluate(() => document.querySelectorAll('.react-flow__edge').length);
    await fieldIn(page, 'typeLine').click(); await tick(page, 3);
    const edgesAfter = await page.evaluate(() => document.querySelectorAll('.react-flow__edge').length);
    log({ edgesBefore, edgesAfter, ...(await state(page)) });
    await page.keyboard.press('Control+z'); await tick(page, 3);
    log('after ctrl+z on checkbox', { edges: await page.evaluate(() => document.querySelectorAll('.react-flow__edge').length), ...(await state(page)) });
    // now select the typing line that is drawn
    log('problems', o.problems);
    await o.context.close();
  },
  // Two things renamed to one name
  async sameName() {
    const o = await ex();
    const { page } = o;
    await pickBox(page, VIEW, 'ServerHost');
    await fieldIn(page, 'name').click(); await page.keyboard.press('Control+a'); await page.keyboard.type('Host'); await page.keyboard.press('Tab'); await tick(page, 3);
    await pickBox(page, VIEW, 'OnlineHost');
    await showTab(page, 'Core');
    const p = fieldIn(page, 'specializes');
    await p.click(); await tick(page, 2);
    const opts = await page.evaluate(() => [...document.querySelectorAll('[role="listbox"] [role="option"]')].map((e) => `${e.getAttribute('data-option')}=${e.textContent}`));
    log({ opts, ...(await state(page)) });
    await page.keyboard.press('Escape');
    log('problems', o.problems);
    await o.context.close();
  },
  // Same file opened twice
  async sameFileTwice() {
    const o = await ex();
    const { page } = o;
    await pickBox(page, VIEW, 'Host');
    await typeEnd(page, 'name', 'Q');
    // open again, without leaving the field by Tab
    let chooser = null;
    page.waitForEvent('filechooser', { timeout: 5000 }).then((c) => { chooser = c; }, () => {});
    await page.locator(byTestId('open')).click();
    await tick(page, 5);
    const dialog = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((d) => d.textContent));
    log('after Open click', { chooser: !!chooser, dialog, ...(await state(page)) });
    const buttons = await page.locator('[role="dialog"] button').allTextContents();
    log('buttons', buttons);
    o.context.close();
  },
  // Ctrl+Z with focus on the plane after typing; on the Details tab; in doc
  async keysAround() {
    const o = await ex();
    const { page } = o;
    await pickBox(page, VIEW, 'Host');
    await typeEnd(page, 'name', 'A');
    await page.keyboard.press('Tab');
    await typeEnd(page, 'doc', 'B');
    await page.keyboard.press('Tab'); await tick(page);
    log('two steps', await state(page));
    await page.locator(DETAILS).getByRole('tab', { name: 'Core' }).focus();
    await page.keyboard.press('Control+z'); await tick(page, 3);
    log('ctrl+z on Details tab', await state(page));
    const b = await page.evaluate(() => { const n = document.querySelector('.react-flow__node[data-id="Host"]').getBoundingClientRect(); return { x: n.x + 30, y: n.y + 12 }; });
    await page.mouse.click(b.x, b.y); await tick(page, 2);
    log('focus after box click', await active(page));
    await page.keyboard.press('Control+z'); await tick(page, 3);
    log('ctrl+z on plane', await state(page));
    await page.keyboard.press('Control+y'); await tick(page, 3);
    log('ctrl+y on plane', await state(page, { name: await val(page, 'field-name') }));
    log('problems', o.problems);
    await o.context.close();
  },
  // Undo by bar while picker list is open
  async undoWithListOpen() {
    const o = await ex();
    const { page } = o;
    await pickBox(page, VIEW, 'Page.hosts');
    await showTab(page, 'Core');
    await fieldIn(page, 'multiplicity').click(); await page.keyboard.press('End'); await page.keyboard.type('5'); await page.keyboard.press('Tab');
    await fieldIn(page, 'type').click(); await tick(page, 2);
    log('list open', await page.evaluate(() => !!document.querySelector('[role="listbox"]')));
    await page.keyboard.press('Control+z'); await tick(page, 3);
    log('ctrl+z with list open', await state(page, { list: await page.evaluate(() => !!document.querySelector('[role="listbox"]')) }));
    await page.locator(byTestId('undo')).click(); await tick(page, 3);
    log('bar undo with list open', await state(page, { list: await page.evaluate(() => !!document.querySelector('[role="listbox"]')), mult: await val(page, 'field-multiplicity') }));
    log('problems', o.problems);
    await o.context.close();
  },
  // Several things picked
  async several() {
    const o = await ex();
    const { page } = o;
    await pickBox(page, VIEW, 'Host');
    const b = await page.evaluate(() => { const n = document.querySelector('.react-flow__node[data-id="App"]').getBoundingClientRect(); return { x: n.x + 24, y: n.y + 12 }; });
    await page.keyboard.down('Control'); await page.mouse.click(b.x, b.y); await page.keyboard.up('Control'); await tick(page, 3);
    log('ctrl-click App', { sel: await sel(page), shown: await shown(page) });
    await page.keyboard.down('Control'); await page.mouse.click(b.x, b.y); await page.keyboard.up('Control'); await tick(page, 3);
    log('ctrl-click App again', { sel: await sel(page), shown: await shown(page) });
    log('problems', o.problems);
    await o.context.close();
  },
  // view no plane draws: rename it, tab follows
  async viewNotDrawn() {
    const o = await ex(fx('sequence'));
    const { page } = o;
    await pickRow(page, 'view', 'v-seq');
    const f = await page.evaluate((root) => [...document.querySelectorAll(`${root} .grasp-field`)].map((e) => e.getAttribute('data-field')), DETAILS);
    log('fields', f);
    await typeEnd(page, 'name', 'Z');
    const tabs = await page.evaluate(() => [...document.querySelectorAll('[role="tab"]')].map((t) => t.textContent));
    log({ tabs, ...(await state(page)) });
    await pickRow(page, 'rel', 'm-login');
    const r = await page.evaluate((root) => [...document.querySelectorAll(`${root} .grasp-field`)].map((e) => `${e.getAttribute('data-field')}${e.classList.contains('locked') ? '(locked)' : ''}`), DETAILS);
    log('message fields', r);
    log('problems', o.problems);
    await o.context.close();
  },
};
for (const [name, fn] of Object.entries(probes)) {
  if (only.length && !only.includes(name)) continue;
  log('=====', name);
  try { await fn(); } catch (e) { log(name, 'ERR', e.message.split('\n').slice(0, 3).join(' | ')); }
}
await browser.close();
