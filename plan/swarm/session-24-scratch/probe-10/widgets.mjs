import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
const problems = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(m.text()); });
page.on('pageerror', (e) => problems.push('pageerror ' + e.message));
await page.goto(pathToFileURL(path.resolve(import.meta.dirname, 'widgets.html')).href);
await page.waitForSelector('[data-testid="field-name"]');
const html = async (sel) => console.log(sel, '=>', await page.evaluate((s) => [...document.querySelectorAll(s)].map((e) => e.outerHTML.replace(/class="[^"]*"/g, '').replace(/style="[^"]*"/g, '').slice(0, 600)), sel));
await html('[data-testid="field-name"]');
await html('textarea');
await html('[data-testid="field-abstract"]');
await html('[data-testid="field-direction"]');
await html('[data-testid="field-type"]');
await html('[data-testid="field-order"]');
await html('[role="tab"]');
console.log('tablist', await page.evaluate(() => document.querySelector('[role=tablist]').outerHTML.replace(/class="[^"]*"/g, '').slice(0, 300)));
// label association
console.log('byLabel name', await page.getByLabel('Declared Name').count(), 'abstract', await page.getByLabel('Is Abstract').count(), await page.getByRole('checkbox', { name: 'Is Abstract' }).count());
console.log('radiogroup', await page.getByRole('radiogroup', { name: 'Direction' }).count(), 'radio in', await page.getByRole('radio', { name: 'in', exact: true }).count());
console.log('combobox', await page.getByRole('combobox', { name: 'Typed by' }).count());
// typing
const name = page.locator('[data-testid="field-name"]');
await name.click(); await page.keyboard.press('End'); await page.keyboard.type('xy');
console.log('name value', await name.inputValue());
await page.keyboard.press('Enter');
await page.keyboard.press('Escape');
await page.keyboard.press('Tab');
// checkbox
await page.locator('[data-testid="field-abstract"]').click();
console.log('checked', await page.locator('[data-testid="field-abstract"]').isChecked());
// radio
await page.locator('[data-testid="field-direction"] input[value="in"]').click();
console.log('radio checked', await page.locator('[data-testid="field-direction"] input:checked').getAttribute('value'));
// autocomplete
const type = page.locator('[data-testid="field-type"]');
console.log('type value', await type.inputValue(), await type.getAttribute('data-value'));
await type.click();
await html('[role="listbox"]');
await html('[role="option"]');
await page.locator('[role="listbox"] [data-option="ServerHost"]').click();
console.log('type value', await type.inputValue(), await type.getAttribute('data-value'), 'focused', await page.evaluate(() => document.activeElement.getAttribute('data-testid')));
console.log('listbox after pick', await page.locator('[role="listbox"]').count());
// keyboard on autocomplete: open with ArrowDown, choose with Enter
await page.keyboard.press('ArrowDown');
console.log('listbox after ArrowDown', await page.locator('[role="listbox"]').count());
await page.keyboard.press('Escape');
console.log('listbox after Escape', await page.locator('[role="listbox"]').count(), 'value', await type.inputValue());
// type text that matches nothing then blur
await type.click(); await page.keyboard.type('zzz'); await page.keyboard.press('Tab');
console.log('after junk + Tab', await type.inputValue());
// tabs
await page.getByRole('tab', { name: 'Advanced' }).click();
console.log('tab selected', await page.getByRole('tab', { name: 'Advanced' }).getAttribute('aria-selected'));
console.log(await page.evaluate(() => window.log));
console.log('problems', problems);
await browser.close();
