import { createRequire } from 'node:module'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch(); const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(here, 'mui2.html')).href); await page.waitForSelector('input');
console.log('named checkbox by aria-label prop:', await page.getByRole('checkbox', { name: 'Is Library Element' }).count(), await page.evaluate(() => document.querySelector('input[type=checkbox]').outerHTML + ' || ' + document.querySelector('input[type=checkbox]').parentElement.getAttribute('aria-label')));
console.log(await page.evaluate(() => document.querySelector('[data-testid=undo]').parentElement.getAttribute('aria-label')));
await browser.close();
