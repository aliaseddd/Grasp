import {
  launch, openIn, stateFileAt, EXAMPLE, modelOf, untilDrawn, pickBox, fieldIn, steps, undone, active, val, shown, tick, log, showSide, el, wordsOf, showTab, byTestId,
} from './lib.mjs';

const VIEW = modelOf(EXAMPLE).views[0];
const browser = await launch();
const o = await openIn(browser, stateFileAt(EXAMPLE));
const { page } = o;
await untilDrawn(page, VIEW);
await showSide(page, 'Details');
await pickBox(page, VIEW, 'Host');
await fieldIn(page, 'name').click();
await page.keyboard.press('End');
await page.keyboard.type('A');
await page.keyboard.press('Tab');
await tick(page, 2);
log('1. typed A in name, Tab', { steps: await steps(page), active: await active(page), name: await val(page, 'field-name'), model: (await el(page, 'Host')).name, unsaved: await page.locator(byTestId('file-name')).textContent() });
await page.keyboard.press('Control+z');
await tick(page, 3);
log('2. Ctrl+Z in the documentation, which was not typed into', { steps: await steps(page), undone: await undone(page), active: await active(page), name: await val(page, 'field-name'), model: (await el(page, 'Host')).name, undoTip: await wordsOf(page, 'undo') });
await page.keyboard.press('Tab');
await tick(page, 2);
log('3. Tab', { steps: await steps(page), undone: await undone(page), active: await active(page), model: (await el(page, 'Host')).name, undoTip: await wordsOf(page, 'undo'), file: await page.locator(byTestId('file-name')).textContent() });
// Now a second scenario: Redo through the browser
await fieldIn(page, 'doc').click();
await page.keyboard.press('Control+Shift+z');
await tick(page, 3);
log('4. Ctrl+Shift+Z in doc', { steps: await steps(page), undone: await undone(page), active: await active(page), model: (await el(page, 'Host')).name });
await page.keyboard.press('Tab');
await tick(page, 2);
// cross element: pick App, Ctrl+Z in its name
await pickBox(page, VIEW, 'App');
await fieldIn(page, 'name').click();
await page.keyboard.press('Control+z');
await tick(page, 3);
log('5. App picked, Ctrl+Z in its name', { steps: await steps(page), active: await active(page), shown: await shown(page), host: (await el(page, 'Host')).name, app: (await el(page, 'App')).name });
log('problems', o.problems);
await browser.close();
