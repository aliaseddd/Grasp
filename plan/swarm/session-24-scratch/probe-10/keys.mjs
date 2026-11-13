import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(path.resolve(import.meta.dirname, 'widgets.html')).href);
const type = page.locator('[data-testid="field-type"]');
await type.focus();
const hi = () => page.evaluate(() => [document.querySelectorAll('[role=option]').length, document.querySelector('[role=option].Mui-focused')?.getAttribute('data-option') ?? null, document.querySelector('[data-testid="field-type"]').getAttribute('aria-activedescendant')]);
console.log('focused, list', await hi());
await page.keyboard.press('ArrowDown'); console.log('ArrowDown', await hi());
await page.keyboard.press('ArrowDown'); console.log('ArrowDown', await hi());
await page.keyboard.press('Enter'); console.log('Enter', await hi(), await type.getAttribute('data-value'));
await page.keyboard.press('ArrowUp'); console.log('ArrowUp', await hi());
await page.keyboard.press('ArrowUp'); console.log('ArrowUp', await hi());
await page.keyboard.press('Enter'); console.log('Enter', await hi(), await type.getAttribute('data-value'));
// typing narrows
await page.keyboard.type('Ser'); console.log('typed Ser', await hi(), await page.evaluate(() => [...document.querySelectorAll('[role=option]')].map((o) => o.getAttribute('data-option'))));
await page.keyboard.press('Escape'); console.log('Escape', await hi(), await type.inputValue());
await page.keyboard.press('Escape'); console.log('Escape2', await hi(), await type.inputValue());
await page.keyboard.press('Tab'); console.log('Tab', await type.inputValue(), await type.getAttribute('data-value'));
// checkbox by space, radios by arrow
await page.locator('[data-testid="field-abstract"]').focus(); await page.keyboard.press('Space');
console.log('checkbox', await page.locator('[data-testid="field-abstract"]').isChecked());
await page.locator('[data-testid="field-direction"] input:checked').focus(); await page.keyboard.press('ArrowRight');
console.log('radio', await page.locator('[data-testid="field-direction"] input:checked').getAttribute('value'));
// tabs by arrows
await page.getByRole('tab', { name: 'Core' }).focus(); await page.keyboard.press('ArrowRight');
console.log('tab', await page.getByRole('tab', { name: 'Advanced' }).getAttribute('aria-selected'), await page.evaluate(() => document.activeElement.textContent));
console.log(await page.evaluate(() => window.log));
await browser.close();
