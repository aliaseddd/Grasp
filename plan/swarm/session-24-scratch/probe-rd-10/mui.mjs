import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { fieldIn } from '../rd-all/canvas/app/test/helpers.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch(); const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
const problems = []; page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(m.text()); }); page.on('pageerror', (e) => problems.push('pageerror ' + e.message));
await page.goto(pathToFileURL(path.join(here, 'mui.html')).href);
await page.waitForSelector('.grasp-details');
const D = page.locator('[data-testid="details"]');
const c = async (sel) => page.locator(sel).count();
console.log('text', await c('input[type="text"][data-testid="field-name"]'), 'byLabel', await D.getByLabel('Declared Name', { exact: true }).getAttribute('data-testid'));
console.log('textarea', await c('textarea[data-testid="field-doc"]'), 'all textareas', await c('textarea'), 'byLabel', await D.getByLabel('Documentation', { exact: true }).count());
console.log('checkbox', await c('input[type="checkbox"][data-testid="field-abstract"]'), 'role', await D.getByRole('checkbox', { name: 'Is Abstract', exact: true }).count(), 'known', await D.getByRole('checkbox', { name: 'Is Library Element' }).count(), await D.getByRole('checkbox', { name: 'Is Library Element' }).isDisabled());
console.log('radiogroup', await c('[role="radiogroup"][data-testid="field-direction"]'), 'role name', await D.getByRole('radiogroup', { name: 'Direction' }).count(), 'empty', await c('[data-testid="field-direction"] input[type="radio"][value=""]'), 'vals', await page.locator('[data-testid="field-direction"] input[type="radio"]').evaluateAll((els) => els.map((e) => [e.getAttribute('value'), e.name])));
console.log('checked', await page.locator('[data-testid="field-direction"] input:checked').getAttribute('value'), 'fieldIn radio value', await fieldIn(page, 'direction').getAttribute('value'));
await page.locator('[data-testid="field-direction"] input:checked').focus(); await page.keyboard.press('ArrowLeft');
console.log('after ArrowLeft', await page.locator('[data-testid="field-direction"] input:checked').getAttribute('value'));
await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
console.log('after 2 ArrowRight (wrap)', JSON.stringify(await page.locator('[data-testid="field-direction"] input:checked').getAttribute('value')), JSON.stringify(await page.locator('[data-testid="field-direction"] input:checked').inputValue().catch((e) => 'ERR ' + e.message.split('\n')[0])));
await page.locator('[data-testid="field-direction"] input[value="in"]').click(); console.log('click in', await page.locator('[data-testid="field-direction"] input:checked').getAttribute('value'));
// picker
const P = fieldIn(page, 'type');
console.log('combobox', await c('input[role="combobox"][data-testid="field-type"]'), 'data-value', await P.getAttribute('data-value'), 'value', await P.inputValue(), 'byLabel', await D.getByLabel('Typed by', { exact: true }).count());
await P.click(); console.log('listbox', await c('[role="listbox"]'), 'options', await page.locator('[role="listbox"] [role="option"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-option') + '=' + e.textContent)), 'in details?', await D.locator('[role="listbox"]').count());
await page.locator('[role="listbox"] [role="option"][data-option="ServerHost"]').click();
console.log('picked', await P.getAttribute('data-value'), await P.inputValue(), 'listbox', await c('[role="listbox"]'), 'focus on input', await page.evaluate(() => document.activeElement.getAttribute('data-testid')));
await P.click(); await page.locator('[role="listbox"] [role="option"][data-option=""]').click(); console.log('empty picked', JSON.stringify(await P.getAttribute('data-value')), await P.inputValue());
await P.click(); await page.locator('[role="listbox"] [role="option"][data-option="Host"]').click();
await page.mouse.click(700, 880);
await P.focus(); await page.keyboard.press('ArrowDown');
console.log('ArrowDown open', await c('[role="listbox"]'), 'lit', await page.locator('[role="option"].Mui-focused').evaluateAll((els) => els.map((e) => e.getAttribute('data-option'))));
await page.keyboard.press('ArrowDown'); console.log('lit2', await page.locator('[role="option"].Mui-focused').evaluateAll((els) => els.map((e) => e.getAttribute('data-option'))));
await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); console.log('enter', await P.getAttribute('data-value'), 'listbox', await c('[role="listbox"]'));
await P.click(); const open1 = await c('[role="listbox"]'); await page.keyboard.press('Escape'); console.log('click open', open1, 'after esc', await c('[role="listbox"]'), await P.getAttribute('data-value'));
await P.click(); console.log('reopen after esc by click', await c('[role="listbox"]')); await page.keyboard.press('Control+A'); await page.keyboard.type('Ser');
console.log('narrowed', await page.locator('[role="listbox"] [role="option"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-option'))));
await page.keyboard.press('Control+A'); await page.keyboard.type('zzz'); console.log('zzz listbox', await c('[role="listbox"]'), await page.locator('.MuiAutocomplete-noOptions').count()); await page.keyboard.press('Tab');
console.log('after tab', await P.inputValue(), await P.getAttribute('data-value'), 'listbox', await c('[role="listbox"]'));
// tabs
console.log('tablist', await D.getByRole('tablist', { name: 'Details' }).count(), 'tabs', await D.getByRole('tab').evaluateAll((els) => els.map((e) => e.textContent + ':' + e.getAttribute('aria-selected'))));
await D.getByRole('tab', { name: 'Core', exact: true }).focus(); await page.keyboard.press('ArrowRight');
console.log('after ArrowRight', await D.getByRole('tab').evaluateAll((els) => els.map((e) => e.textContent + ':' + e.getAttribute('aria-selected'))), await page.locator('.grasp-details-page').getAttribute('data-tab'));
await page.keyboard.press('ArrowLeft'); console.log('after ArrowLeft', await page.locator('.grasp-details-page').getAttribute('data-tab'));
// text: native undo
const N = fieldIn(page, 'name'); await N.click(); await page.keyboard.press('End'); await page.keyboard.type('X'); console.log('typed', await N.inputValue());
await page.keyboard.press('Control+z'); console.log('ctrl+z', await N.inputValue(), 'focus', await page.evaluate(() => document.activeElement.getAttribute('data-testid')), JSON.stringify(await page.evaluate(() => window.log.filter((l) => l[0] === 'change' && l[1] === 'name'))));
await page.keyboard.type('Y'); await page.keyboard.press('Control+z'); await page.keyboard.press('Control+y'); console.log('redo', await N.inputValue());
// doc
const Doc = fieldIn(page, 'doc'); await Doc.click(); await page.keyboard.press('Control+End'); await page.keyboard.press('Enter'); await page.keyboard.type('Z'); console.log('doc', JSON.stringify(await Doc.inputValue()));
// checkbox focus
const C = fieldIn(page, 'abstract'); await C.click(); console.log('checked', await C.isChecked(), 'active is checkbox', await page.evaluate(() => document.activeElement.getAttribute('data-testid')));
await C.focus(); await page.keyboard.press('Space'); console.log('space', await C.isChecked());
// sizes
console.log('heights', await page.evaluate(() => ({ text: document.querySelector('[data-testid="field-name"]').parentElement.getBoundingClientRect().height, tabs: document.querySelector('[role=tablist]').getBoundingClientRect().height, check: document.querySelector('[data-testid="field-abstract"]').closest('label').getBoundingClientRect().height, parentTag: document.querySelector('[data-testid="field-name"]').parentElement.className, pickerParent: document.querySelector('[data-testid="field-type"]').parentElement.className, pickerH: document.querySelector('[data-testid="field-type"]').parentElement.getBoundingClientRect().height })));
console.log('problems', problems);
await browser.close();
