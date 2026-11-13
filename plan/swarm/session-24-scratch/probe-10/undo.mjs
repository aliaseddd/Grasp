import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(path.resolve(import.meta.dirname, 'widgets.html')).href);
const name = page.locator('[data-testid="field-name"]');
await name.click(); await page.keyboard.press('End');
await page.keyboard.press('x');
console.log('after x', await name.inputValue());
await page.keyboard.press('Control+z');
console.log('after ctrl+z', await name.inputValue());
await page.keyboard.press('Control+y');
console.log('after ctrl+y', await name.inputValue());
await page.keyboard.type('yz');
await page.keyboard.press('Control+z');
console.log('after yz, ctrl+z', await name.inputValue());
await page.keyboard.press('Control+z');
console.log('after ctrl+z again', await name.inputValue());
await page.keyboard.press('Control+Shift+z');
console.log('after ctrl+shift+z', await name.inputValue());
// radio keyboard & sizes
const size = async (sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.width, r.height]; }, sel);
console.log('input root size', await page.evaluate(() => { const r = document.querySelector('[data-testid="field-name"]').parentElement.getBoundingClientRect(); return [r.width, r.height, document.querySelector('[data-testid="field-name"]').parentElement.className]; }));
console.log('tablist', await size('[role=tablist]'), 'checkbox label', await page.evaluate(() => { const r = document.querySelector('[data-testid="field-abstract"]').closest('label').getBoundingClientRect(); return [r.width, r.height]; }));
console.log(await page.evaluate(() => window.log));
// many options
await browser.close();
