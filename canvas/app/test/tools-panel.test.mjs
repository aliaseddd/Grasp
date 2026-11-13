// The Tools view by itself (plan/slice-1.md, step 11; plan/swarm/step-11.md, section 4): what it lists for the view in
// front, how a click, a key or a hover on a tool behaves, and what it says when it has nothing to list. No test here
// clicks a plane: what a tool makes on a plane is tools.test.mjs's. Written before the panel was built.

import assert from 'node:assert/strict';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  byTestId, closePages, EXAMPLE, finish, FIXTURES, frame, launch, lib, modelOf, openIn, openPage, openStateFile, showSide, soon, stateFileAt,
  tabTitle, TESTIDS, viewTab,
} from './helpers.mjs';

/** The panel's root, and what it holds that the application gives a data-testid (the four are not in TESTIDS). */
const PANEL = byTestId(TESTIDS.tools);
const TOOL = `${PANEL} button[data-testid="tool"]`;
const LIST = `${PANEL} [data-testid="tool-list"]`;
const VIEW = `${PANEL} [data-testid="tools-view"]`;
const HINT = `${PANEL} [data-testid="tool-hint"]`;

const fixture = (name) => path.join(FIXTURES, `${name}.json`);
const INTERCONNECTION = fixture('interconnection');

/** A view of a file, by its id, as the model holds it. */
const viewOf = (file, id) => {
  const view = modelOf(file).views.find((one) => one.id === id);
  assert.ok(view, `${path.basename(file)} has no view ${id}`);
  return view;
};

/** A tool's label: what its button says. */
const labelOf = (kind) => (lib.KINDS[kind] || lib.RELATIONSHIPS[kind]).label;
/** The tools row of a view kind, in the library: kinds and '|'. */
const rowOf = (view) => [...lib.VIEW_KINDS[view.kind].tools]; // a plain array: the library's realm is not the test's

/** Runs in the page: the list as the tests read it, one entry for each button (its data-tool) and '|' for each separator. */
const listIn = (page) => page.evaluate((selector) => {
  const list = document.querySelector(selector);
  if (!list) return null;
  return [...list.querySelectorAll('button[data-tool], [role="separator"]')].map((el) => (el.getAttribute('role') === 'separator' ? '|' : el.getAttribute('data-tool')));
}, LIST);

/** Runs in the page: the text of the panel's own sentence (`.grasp-side-text`), or null while it says nothing. */
const saysTools = (page) => page.evaluate((root) => document.querySelector(`${root} .grasp-side-text`)?.textContent ?? null, PANEL);

/** The kinds of the buttons that are pressed now. */
const pressedIn = (page) => page.evaluate((selector) => [...document.querySelectorAll(selector)]
  .filter((el) => el.getAttribute('aria-pressed') === 'true').map((el) => el.getAttribute('data-tool')), TOOL);

/** The hint's text, or null while the page has none. */
const hintIn = (page) => page.evaluate((selector) => document.querySelector(selector)?.textContent ?? null, HINT);

/** Waits for the Tools view to say `expected` in its own sentence, and fails with what it says instead. */
async function untilSays(page, expected, where = '') {
  await soon(page, async () => (await saysTools(page)) === expected, async () => {
    const said = await saysTools(page);
    return `The Tools view says ${said === null ? 'nothing' : `"${said}"`}${where}, not "${expected}"`;
  });
}

/** Waits for the Tools view to list the tools of `view`, and returns the list. The failure names the view. */
async function untilListed(page, view) {
  await soon(page, async () => (await page.locator(LIST).count()) > 0, `The Tools view lists no tools for ${view.name} (data-testid "tool-list").`);
  return soon(page, async () => {
    const list = await listIn(page);
    return JSON.stringify(list) === JSON.stringify(rowOf(view)) ? list : null;
  }, async () => `The Tools view lists ${JSON.stringify(await listIn(page))} for ${view.name}, not its row ${JSON.stringify(rowOf(view))}.`);
}

/** Waits for the button of a tool, and returns its locator. `verb` is what the test wants to do with it. */
async function toolButton(page, kind, verb) {
  const button = page.locator(`${TOOL}[data-tool=${JSON.stringify(kind)}]`);
  await soon(page, async () => (await button.count()) > 0, `The Tools view has no ${labelOf(kind)} tool (data-testid "tool", data-tool "${kind}") to ${verb}.`);
  return button;
}

/** Waits until exactly `kinds` are pressed. */
const untilPressed = (page, kinds, what) => soon(page, async () => JSON.stringify(await pressedIn(page)) === JSON.stringify(kinds),
  async () => `${what}: the pressed tools (aria-pressed "true") are ${JSON.stringify(await pressedIn(page))}, not ${JSON.stringify(kinds)}.`);

/** Waits until the hint reads `text`, or, for null, is not in the document. */
const untilHint = (page, text, what) => soon(page, async () => (await hintIn(page)) === text,
  async () => `${what}: the Tools view's hint (data-testid "tool-hint") ${(await hintIn(page)) === null ? 'is not there' : `reads "${await hintIn(page)}"`}, not ${text === null ? 'absent' : `"${text}"`}.`);

/** Closes a view's tab by Dockview's own close control, as shell.test.mjs does. */
async function closeTab(page, view) {
  const tab = await viewTab(page, view);
  await tab.hover();
  const close = tab.locator('.dv-default-tab-action');
  await soon(page, async () => (await close.count()) > 0, `The tab "${tabTitle(view)}" has no close control (class dv-default-tab-action).`);
  await close.first().click();
  await soon(page, async () => (await page.getByRole('tab', { name: tabTitle(view), exact: true }).count()) === 0,
    `The close control of "${tabTitle(view)}" was clicked and its tab is still there.`);
}

/** Runs in the page: the tooltips that are in the document, as their texts. */
const tooltipsIn = (page) => page.evaluate(() => [...document.querySelectorAll('[role="tooltip"]')].map((el) => el.textContent));

describe('the Tools view', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('with no file open the Tools view says so', async () => {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await showSide(page, 'Tools');
    await untilSays(page, "Open a model to see its views' tools.");
    assert.equal(await page.locator(TOOL).count(), 0, 'With no file open the Tools view lists a tool (data-testid "tool").');
    assert.equal(await page.locator(VIEW).count(), 0, 'With no file open the Tools view names a view (data-testid "tools-view").');
    await finish(opened);
  });

  test("the Tools view lists the tools of the view in front, in the groups of its kind's row", async () => {
    const cases = [[EXAMPLE, 'v-proof'], [INTERCONNECTION, 'v-ic'], [fixture('behavior-actions'), 'v-release'], [fixture('behavior-states'), 'v-host']];
    for (const [file, id] of cases) {
      const view = viewOf(file, id);
      const opened = await openIn(browser, stateFileAt(file));
      const { page } = opened;
      await (await viewTab(page, view)).click();
      await showSide(page, 'Tools');
      const list = await untilListed(page, view);
      assert.deepEqual(list, rowOf(view), `The Tools view lists ${JSON.stringify(list)} for ${view.name}, not its row.`);
      await soon(page, async () => (await page.locator(VIEW).textContent().catch(() => null)) === tabTitle(view),
        async () => `The Tools view names the view (data-testid "tools-view") "${await page.locator(VIEW).textContent().catch(() => null)}", not "${tabTitle(view)}".`);
      for (const kind of list.filter((one) => one !== '|')) {
        const label = labelOf(kind);
        const button = await toolButton(page, kind, 'read');
        assert.equal((await button.textContent()).trim(), label, `The ${label} tool of ${view.name} does not say "${label}".`);
        const named = page.locator(PANEL).getByRole('button', { name: label, exact: true });
        assert.equal(await named.count(), 1, `The Tools view of ${view.name} has ${await named.count()} buttons named "${label}", not one.`);
        assert.equal(await button.getAttribute('aria-pressed'), 'false', `The ${label} tool of ${view.name} is pressed (aria-pressed) with no tool in hand.`);
        const box = await button.boundingBox();
        assert.ok(box && Math.abs(box.height - 28) <= 0.5, `The ${label} tool of ${view.name} is ${box?.height} px high, not 28.`);
      }
      assert.equal(await page.locator(HINT).count(), 0, `The Tools view of ${view.name} shows a hint (data-testid "tool-hint") with no tool in hand.`);
      await finish(opened);
    }
  });

  test('the Tools view follows the tab in front', async () => {
    const defs = viewOf(INTERCONNECTION, 'v-defs');
    const ic = viewOf(INTERCONNECTION, 'v-ic');
    const opened = await openIn(browser, stateFileAt(INTERCONNECTION));
    const { page } = opened;
    await showSide(page, 'Tools');
    await (await viewTab(page, defs)).click();
    await untilListed(page, defs);
    await soon(page, async () => (await page.locator(VIEW).textContent().catch(() => null)) === tabTitle(defs),
      `The Tools view does not name the view in front, "${tabTitle(defs)}" (data-testid "tools-view").`);
    await (await viewTab(page, ic)).click();
    await untilListed(page, ic);
    await soon(page, async () => (await page.locator(VIEW).textContent().catch(() => null)) === tabTitle(ic),
      `The Tools view does not follow the tab in front to "${tabTitle(ic)}" (data-testid "tools-view").`);
    await finish(opened);
  });

  test('a view no plane draws has no tools here', async () => {
    for (const [file, id, an] of [[fixture('sequence'), 'v-seq', 'A sequence view'], [fixture('grid'), 'v-table', 'A grid view']]) {
      const view = viewOf(file, id);
      const opened = await openIn(browser, stateFileAt(file));
      const { page } = opened;
      await (await viewTab(page, view)).click();
      await showSide(page, 'Tools');
      await untilSays(page, `${an} has no tools here yet. The old page draws it until slice 2.`, ` for ${view.name}`);
      assert.equal(await page.locator(TOOL).count(), 0, `The Tools view lists a tool for ${view.name}, which no plane draws.`);
      await finish(opened);
    }
  });

  test('with every tab closed the Tools view says no view is in front', async () => {
    const view = viewOf(EXAMPLE, 'v-proof');
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showSide(page, 'Tools');
    await closeTab(page, view);
    await untilSays(page, "No view is in front. Click a view's tab to see its tools.", ' with every tab closed');
    assert.equal(await page.locator(TOOL).count(), 0, 'With every tab closed the Tools view still lists a tool.');
    await finish(opened);
  });

  test('a click takes a tool in hand, a second click puts it down, and another tool takes its place', async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showSide(page, 'Tools');
    const click = async (kind) => (await toolButton(page, kind, 'click')).click();

    await click('PartDefinition');
    await untilPressed(page, ['PartDefinition'], 'After a click on part def');
    await untilHint(page, 'Click where the part def goes.', 'After a click on part def');
    await click('PortUsage');
    await untilPressed(page, ['PortUsage'], 'After a click on port, with part def in hand');
    await untilHint(page, 'Click a part def or a part to put a port on its border.', 'After a click on port');
    await click('PortUsage');
    await untilPressed(page, [], 'After a second click on port');
    await untilHint(page, null, 'After a second click on port');
    await click('Specialization');
    await untilPressed(page, ['Specialization'], 'After a click on specializes');
    await untilHint(page, 'Click the element that specializes…', 'After a click on specializes');
    await finish(opened);
  });

  test('Escape puts the tool down', async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showSide(page, 'Tools');
    const button = await toolButton(page, 'PartDefinition', 'click');
    await button.click();
    await untilPressed(page, ['PartDefinition'], 'After a click on part def');
    await button.focus();
    await page.keyboard.press('Escape');
    await untilPressed(page, [], 'After Escape with the focus on the part def tool');
    await untilHint(page, null, 'After Escape');
    await page.keyboard.press('Escape');
    await frame(page);
    await frame(page);
    assert.deepEqual(await pressedIn(page), [], 'A second Escape, with no tool in hand, pressed a tool.');
    assert.equal(await hintIn(page), null, 'A second Escape, with no tool in hand, brought a hint.');
    await finish(opened);
  });

  test("a tool's tooltip says what it makes, and its name stays its label", async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showSide(page, 'Tools');
    for (const [kind, title] of [['PartDefinition', 'A part definition: square corners'],
      ['Specialization', 'One definition specializes another, or one part or port subsets another']]) {
      const button = await toolButton(page, kind, 'hover');
      await button.hover();
      await soon(page, async () => JSON.stringify(await tooltipsIn(page)) === JSON.stringify([title]),
        async () => `A hover on the ${labelOf(kind)} tool shows the tooltips ${JSON.stringify(await tooltipsIn(page))}, not [${JSON.stringify(title)}] ([role="tooltip"]).`);
      const named = page.locator(PANEL).getByRole('button', { name: labelOf(kind), exact: true });
      assert.equal(await named.count(), 1, `While its tooltip shows, the ${labelOf(kind)} tool is not found by its name, "${labelOf(kind)}" (role button).`);
    }
    await finish(opened);
  });

  test('the tools are armed from the keyboard', async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showSide(page, 'Tools');
    const first = rowOf(viewOf(EXAMPLE, 'v-proof'))[0];
    const button = await toolButton(page, first, 'focus');
    const [, second] = (await untilListed(page, viewOf(EXAMPLE, 'v-proof'))).filter((one) => one !== '|');
    await button.focus();
    await page.keyboard.press('Space');
    await untilPressed(page, [first], `After Space on the ${labelOf(first)} tool`);
    await page.keyboard.press('Tab');
    await soon(page, () => page.evaluate((kind) => document.activeElement?.getAttribute('data-tool') === kind, second),
      async () => `After Tab from the ${labelOf(first)} tool the focus is on ${await page.evaluate(() => document.activeElement?.getAttribute('data-tool') ?? document.activeElement?.tagName)}, not on the ${labelOf(second)} tool, the next of the list.`);
    await page.keyboard.press('Enter');
    await untilPressed(page, [second], `After Enter on the ${labelOf(second)} tool`);
    await finish(opened);
  });

  test('another file opened starts with no tool in hand', async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showSide(page, 'Tools');
    await (await toolButton(page, 'PartDefinition', 'click')).click();
    await untilPressed(page, ['PartDefinition'], 'After a click on part def');
    await openStateFile(page, stateFileAt(INTERCONNECTION));
    await showSide(page, 'Tools');
    await soon(page, async () => /^fuelSystem|^definitions/.test((await page.locator(VIEW).textContent().catch(() => '')) ?? ''),
      'After another file was opened the Tools view still names no view of it (data-testid "tools-view").');
    const title = await page.locator(VIEW).textContent();
    const view = modelOf(INTERCONNECTION).views.find((one) => tabTitle(one) === title);
    assert.ok(view, `The Tools view names "${title}", which is no view of the file opened.`);
    await untilListed(page, view);
    assert.deepEqual(await pressedIn(page), [], 'After another file was opened a tool is still in hand (aria-pressed "true").');
    assert.equal(await hintIn(page), null, 'After another file was opened the Tools view still shows a hint.');
    await finish(opened);
  });

  test('a tool stays in hand while the Tools view is hidden', async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showSide(page, 'Tools');
    await (await toolButton(page, 'PartDefinition', 'click')).click();
    await untilPressed(page, ['PartDefinition'], 'After a click on part def');
    await showSide(page, 'Explorer');
    await showSide(page, 'Tools');
    await untilPressed(page, ['PartDefinition'], 'After the Tools view was hidden and shown again');
    await untilHint(page, 'Click where the part def goes.', 'After the Tools view was hidden and shown again');
    await finish(opened);
  });
});
