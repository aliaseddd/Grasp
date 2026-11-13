import { launch, openIn, stateFileAt, EXAMPLE, modelOf, showView, linesOf, byTestId, TESTIDS, selectBox, boxOf, headerOf, frame, finish } from '../wt-10/canvas/app/test/helpers.mjs';
const browser = await launch();
const opened = await openIn(browser, stateFileAt(EXAMPLE));
const { page } = opened;
const model = modelOf(EXAMPLE);
const view = model.views[0];
await showView(page, view, linesOf(model, view).length);
console.log('undo wrapper', await page.locator(byTestId(TESTIDS.undo)).evaluate((b) => b.parentElement.outerHTML.replace(/class="[^"]*"/g, '').slice(0, 300)));
console.log('edge', await page.evaluate(() => document.querySelector('.react-flow__edge').outerHTML.replace(/class="[^"]*"/g, '').slice(0, 400)));
console.log('edges', await page.evaluate(() => [...document.querySelectorAll('.react-flow__edge')].map((e) => [e.getAttribute('data-id'), e.getAttribute('aria-label')])));
console.log('host text', await page.evaluate(() => document.querySelector('.react-flow__node[data-id="Page.hosts"]').textContent));
// drag host to get a step
const was = await boxOf(page, view.id, 'Host'); const from = headerOf(was);
await page.mouse.move(from.x, from.y); await page.mouse.down(); for (let i = 1; i <= 5; i++) await page.mouse.move(from.x + i * 8, from.y + i * 4); await page.mouse.up(); await frame(page);
console.log('undo wrapper after drag', await page.locator(byTestId(TESTIDS.undo)).evaluate((b) => b.parentElement.getAttribute('aria-label')));
console.log('details', await page.locator(byTestId(TESTIDS.details)).evaluate((b) => b.outerHTML));
console.log('active', await page.evaluate(() => document.activeElement.tagName));
await finish(opened);
await browser.close();
