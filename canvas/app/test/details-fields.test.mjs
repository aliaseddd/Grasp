// Every behaviour of a field of Details, and of the panel around it, that a person meets beyond the plain change of a
// field (step 10, plan/swarm/step-10.md, section 4): what the panel says with no file and with nothing picked, which
// thing it shows of several, its two tabs, when a run of typing ends, what Enter, Escape and Ctrl + Z do in a field, a
// text that is no number, a locked field, and a field that an undo takes away. Written in step 10, before what it checks.
//
// Every test reads only what the page shows, by the names of section 3 of the step's file, and opens its file through the
// file input. Three tests reach a state a person's click cannot reach in this slice (a change of what is picked, or an
// Undo, while a text field keeps the focus) by the element's own click(), `scripted` below.

import assert from 'node:assert/strict';
import path from 'node:path';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  boxOf, byTestId, closePages, DETAILS, EXAMPLE, FIXTURES, fieldIn, finish, frame, groundPoint, headerOf, launch, modelOf, nodeOf, NO_FILE,
  NOTHING_PICKED, nothingPicked, openIn, openPage, openStateFile, pickBox, pickRow, redo, rowIn, rowOfField, saysIn, shownIn, showSide,
  showTab, soon, stateFileAt, TESTIDS, undo, untilDrawn, untilShown, viewTab, wordsOf,
} from './helpers.mjs';

const VIEW = modelOf(EXAMPLE).views[0];
const fixture = (name) => path.join(FIXTURES, `${name}.json`);

/** Opens the example and waits until its plane is drawn. The test then calls nothingPicked. */
async function openExample(browser) {
  const opened = await openIn(browser, stateFileAt(EXAMPLE));
  await untilDrawn(opened.page, VIEW);
  return opened;
}

/** The element's own click(), run in the page: it runs the listeners and does not move the focus. */
const scripted = (locator) => locator.evaluate((el) => el.click());

const inDetails = (page, selector) => page.evaluate(([root, s]) => document.querySelector(`${root} ${s}`)?.textContent?.trim() ?? null, [DETAILS, selector]);
const countIn = (page, selector) => page.evaluate(([root, s]) => document.querySelectorAll(`${root} ${s}`).length, [DETAILS, selector]);

/** What a field's widget shows now: a text field's text, a radio group's checked value, a checkbox's state; null when absent. */
const shownBy = (page, field) => page.evaluate(([root, id]) => {
  const el = document.querySelector(`${root} [data-testid="${id}"]`);
  if (!el) return null;
  if (el.matches('input[type="checkbox"]')) return el.checked;
  if (el.matches('input, textarea')) return el.value;
  return el.querySelector('input:checked')?.value ?? null;
}, [DETAILS, TESTIDS.field(field)]);

/** Waits until a field shows `expected`. */
const untilField = (page, field, expected, what) => soon(page, async () => (await shownBy(page, field)) === expected,
  async () => {
    const now = await shownBy(page, field);
    return now === null ? `Details shows no ${field} field (data-testid "${TESTIDS.field(field)}" in "details"), ${what}.`
      : `The ${field} field reads ${JSON.stringify(now)}, not ${JSON.stringify(expected)}, ${what}.`;
  });

/** The name line of a box on the example's plane, or null. */
const boxName = (page, id) => page.evaluate((selector) => document.querySelector(`${selector} .grasp-node-name`)?.textContent?.trim() ?? null, nodeOf(VIEW.id, id));
const untilBox = (page, id, expected, what) => soon(page, async () => (await boxName(page, id)) === expected,
  async () => `The box of ${id} reads ${JSON.stringify(await boxName(page, id))}, not ${JSON.stringify(expected)}, ${what}.`);

/** Waits until Undo's (or Redo's) words are `expected`, null for no step. */
const untilWords = (page, which, expected, what = '') => soon(page, async () => (await wordsOf(page, which)) === expected,
  async () => `${which === 'undo' ? 'Undo' : 'Redo'} ${(await wordsOf(page, which)) === null ? 'has no step' : `says "${await wordsOf(page, which)}"`}, ${expected === null ? 'where it should have none' : `not "${expected}"`}${what ? `, ${what}` : ''}.`);

/** A text field is clicked and its caret put at the end. */
async function clickEnd(page, field) {
  const input = fieldIn(page, field);
  await soon(page, async () => (await input.count()) > 0, `Details shows no ${field} field (data-testid "${TESTIDS.field(field)}" in "details").`);
  await input.click();
  await page.keyboard.press('Control+End');
}
/** Whether the focus is on a field's input. */
const focusedOn = (page, field) => page.evaluate((id) => document.activeElement?.getAttribute('data-testid') === id, TESTIDS.field(field));
const mustFocus = async (page, field, what) => assert.ok(await focusedOn(page, field), `The focus is not in the ${field} field ${what}.`);

const selectedTab = (page) => page.evaluate((root) => [...document.querySelectorAll(`${root} [role="tab"]`)].find((el) => el.getAttribute('aria-selected') === 'true')?.textContent.trim() ?? null, DETAILS);
const untilTab = (page, name, what) => soon(page, async () => (await selectedTab(page)) === name,
  async () => `Details shows the tab ${JSON.stringify(await selectedTab(page))}, not ${name}, ${what}.`);

/** What Details says in words and its title, once it shows `type:id`. */
async function shows(page, type, id, what, title, how) {
  await untilShown(page, type, id, how);
  for (const [selector, expected] of [['.grasp-details-what', what], ['.grasp-details-title', title]]) {
    await soon(page, async () => (await inDetails(page, selector)) === expected,
      async () => `Details, showing ${type} ${id}, has ${selector} ${JSON.stringify(await inDetails(page, selector))}, not ${JSON.stringify(expected)}.`);
  }
}

/** The rows of the tab shown, in order: "field:<name>" and "detail:<attribute>". */
const rowsOf = (page) => page.evaluate((root) => [...document.querySelectorAll(`${root} .grasp-details-page .grasp-field, ${root} .grasp-details-page .grasp-detail`)]
  .map((el) => (el.classList.contains('grasp-field') ? `field:${el.getAttribute('data-field')}` : `detail:${el.getAttribute('data-detail')}`)), DETAILS);

/** A row the library knows or Grasp does not hold, as it is now, waited for. */
async function detailOf(page, attribute) {
  const read = () => page.evaluate(([root, a]) => {
    const row = document.querySelector(`${root} .grasp-detail[data-detail="${a}"]`);
    if (!row) return null;
    return {
      notHeld: row.classList.contains('not-held'),
      label: row.querySelector('.grasp-detail-label')?.textContent.trim() ?? null,
      value: row.querySelector('.grasp-detail-value')?.textContent.trim() ?? null,
      title: row.getAttribute('title'),
      inputs: [...row.querySelectorAll('input, textarea, select')].map((el) => ({ disabled: el.disabled, checked: el.checked })),
    };
  }, [DETAILS, attribute]);
  return soon(page, read, `Details shows no row for ${attribute} (.grasp-detail, data-detail "${attribute}") on the tab shown.`);
}
async function detailReads(page, attribute, expected) {
  await soon(page, async () => (await detailOf(page, attribute)).value === expected,
    async () => `The row ${attribute} reads ${JSON.stringify((await detailOf(page, attribute)).value)}, not ${JSON.stringify(expected)}.`);
}

/** Shows the tab a field's row is on, Core or Advanced, and returns its name. */
async function tabOf(page, field) {
  for (const name of ['Core', 'Advanced']) {
    await showTab(page, name);
    if (await rowOfField(page, field)) return name;
  }
  return assert.fail(`Details shows no ${field} row on either tab.`);
}

/** The file's name in the bar. */
const barName = (page) => page.evaluate((selector) => document.querySelector(selector)?.textContent ?? '', byTestId(TESTIDS.fileName));
const mustBeSaved = async (page, what) => assert.ok(!(await barName(page)).includes('•'), `The bar shows "${await barName(page)}", with the dot of unsaved changes, ${what}.`);

/** Clicks a picker, and waits for its list. */
async function openList(page, field) {
  await fieldIn(page, field).click();
  return soon(page, async () => (await page.locator('[role="listbox"]').count()) > 0, `A click on the ${field} picker opens no list (role "listbox").`);
}
const optionsOf = (page) => page.evaluate(() => [...document.querySelectorAll('[role="listbox"] [role="option"]')].map((el) => el.getAttribute('data-option')));
const optionLabels = (page) => page.evaluate(() => [...document.querySelectorAll('[role="listbox"] [role="option"]')].map((el) => el.textContent.trim()));
const listOpen = (page) => page.evaluate(() => !!document.querySelector('[role="listbox"]'));
async function pickOption(page, id) {
  const option = page.locator(`[role="listbox"] [role="option"][data-option=${JSON.stringify(id)}]`);
  await soon(page, async () => (await option.count()) === 1, async () => `The list has no option for ${JSON.stringify(id)} (data-option); it offers ${JSON.stringify(await optionsOf(page))}.`);
  await option.click();
  await frame(page);
}
const valueOfPicker = (page, field) => fieldIn(page, field).getAttribute('data-value');

/** Ctrl held while the page is clicked at a point. */
async function ctrlClick(page, point) {
  await page.keyboard.down('Control');
  try { await page.mouse.click(point.x, point.y); } finally { await page.keyboard.up('Control'); }
}

describe('the behaviours of a field of Details', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('with no file open Details says so, and with a file open and nothing picked it says that', async () => {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await showSide(page, 'Details');
    const says = await soon(page, () => saysIn(page), 'Details says nothing: it holds no paragraph (.grasp-side-text) and no form.');
    assert.equal(says, NO_FILE, `Details reads "${says}", not "${NO_FILE}": Details is not built.`);
    assert.equal(await countIn(page, '.grasp-details'), 0, 'Details shows a form (.grasp-details) with no file open.');
    assert.equal(await countIn(page, '[role="tab"]'), 0, 'Details shows tabs with no file open.');
    await openStateFile(page, stateFileAt(EXAMPLE));
    await nothingPicked(page);
    await finish(opened);
  });

  test('Details shows what was picked last: a box, a line, a view, and of several the last', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    await shows(page, 'el', 'Host', 'part def Host', 'Part Definition Properties', 'picked on the plane');
    await ctrlClick(page, headerOf(await boxOf(page, VIEW.id, 'App')));
    await shows(page, 'el', 'App', 'part def App', 'Part Definition Properties', 'with App added by Ctrl and a click');
    await ctrlClick(page, headerOf(await boxOf(page, VIEW.id, 'App')));
    await shows(page, 'el', 'Host', 'part def Host', 'Part Definition Properties', 'with App let go again by Ctrl and a click');
    await pickRow(page, 'rel', 'mount');
    await shows(page, 'rel', 'mount', 'connection mount, api to api', 'Connection Properties', 'picked by its row');
    const ground = await groundPoint(page, VIEW);
    await page.mouse.click(ground.x, ground.y);
    await shows(page, 'view', 'v-proof', 'view proofStructure', 'View Properties', 'picked by a click on its ground');
    await showTab(page, 'Core');
    await detailReads(page, 'exposedElement', 'Page, hosts, api, app, api, Host and 7 more');
    await finish(opened);
  });

  test('the Core and Advanced tabs each hold their rows, and the tab shown stays as the selection changes', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    await untilTab(page, 'Core', 'when a box is first picked');
    assert.equal(await countIn(page, '.grasp-details-page[data-tab="Advanced"]'), 0, 'The Advanced page is in the document while Core is shown.');
    assert.deepEqual(await rowsOf(page), ['field:name', 'detail:qualifiedName', 'detail:declaredShortName', 'detail:isIndividual', 'field:doc'], 'The rows of the Core page of Host, in order');
    await showTab(page, 'Advanced');
    await untilTab(page, 'Advanced', 'after a click on it');
    assert.equal(await countIn(page, '.grasp-details-page[data-tab="Core"]'), 0, 'The Core page is in the document while Advanced is shown.');
    assert.deepEqual(await rowsOf(page), ['detail:elementId', 'detail:isImpliedIncluded', 'detail:isLibraryElement', 'detail:name', 'detail:shortName', 'field:abstract', 'detail:isConjugated', 'detail:isSufficient', 'detail:isVariation'],
      'The rows of the Advanced page of Host, in order');
    await pickBox(page, VIEW, 'App');
    await untilTab(page, 'Advanced', 'after another box is picked');
    await detailReads(page, 'elementId', 'App');
    await pickRow(page, 'rel', 'mount');
    await untilTab(page, 'Advanced', 'after a line is picked');
    await showTab(page, 'Core');
    await pickBox(page, VIEW, 'Host');
    await untilTab(page, 'Core', 'after Core was clicked and a box picked');
    await finish(opened);
  });

  test('what the library knows is shown, and the rest says "not held yet"', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    const noEnabledInput = async (where) => {
      const rows = await page.evaluate((root) => [...document.querySelectorAll(`${root} .grasp-detail`)].map((row) => ({ name: row.getAttribute('data-detail'), enabled: [...row.querySelectorAll('input, textarea, select')].filter((el) => !el.disabled).length })), DETAILS);
      assert.deepEqual(rows.filter((row) => row.enabled), [], `Rows the library knows hold enabled inputs on ${where}.`);
    };
    await showTab(page, 'Core');
    await detailReads(page, 'qualifiedName', 'StrongholdProof::Host');
    assert.equal((await detailOf(page, 'qualifiedName')).label, 'Qualified Name', 'The label of the row qualifiedName');
    const short = await detailOf(page, 'declaredShortName');
    assert.ok(short.notHeld, 'The row declaredShortName has no class "not-held".');
    assert.equal(short.value, 'not held yet', 'The row declaredShortName reads');
    assert.equal(short.title, "The canvas doesn't hold Declared Short Name yet: the text leaves it as SysML has it.", 'The title of the row declaredShortName');
    await noEnabledInput('the Core tab of Host');
    await showTab(page, 'Advanced');
    await detailReads(page, 'elementId', 'Host');
    const library = await detailOf(page, 'isLibraryElement');
    assert.deepEqual(library.inputs, [{ disabled: true, checked: false }], 'The row isLibraryElement should hold one disabled checkbox that is not checked');
    const box = page.locator(DETAILS).locator('.grasp-detail[data-detail="isLibraryElement"]').getByRole('checkbox', { name: 'Is Library Element' });
    assert.equal(await box.count(), 1, 'The row isLibraryElement holds no checkbox named "Is Library Element".');
    await detailReads(page, 'name', 'Host');
    await noEnabledInput('the Advanced tab of Host');
    await pickRow(page, 'rel', 't-hosts');
    await showTab(page, 'Core');
    await detailReads(page, 'qualifiedName', '(none)');
    await detailReads(page, 'general', 'part def Host');
    await detailReads(page, 'typedFeature', 'part hosts in Page');
    await noEnabledInput('the Core tab of t-hosts');
    await finish(opened);
  });

  test('typing is one undo step, ended when the field is left', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    await clickEnd(page, 'name');
    await page.keyboard.type('Xy');
    await page.keyboard.press('Tab');
    await untilWords(page, 'undo', 'Renamed to part def HostXy', 'after Xy was typed in the name and the field left');
    await clickEnd(page, 'name');
    await page.keyboard.type('Z');
    await page.keyboard.press('Tab');
    await untilWords(page, 'undo', 'Renamed to part def HostXyZ', 'after Z was typed in a second visit to the name');
    await undo(page);
    await untilField(page, 'name', 'HostXy', 'after one Undo (the second visit was a step of its own)');
    await untilBox(page, 'Host', 'HostXy', 'after one Undo');
    await undo(page);
    await untilField(page, 'name', 'Host', 'after two Undos (the first visit\'s two keys were one step)');
    await untilBox(page, 'Host', 'Host', 'after two Undos');
    await untilWords(page, 'undo', null, 'after two Undos');
    await mustBeSaved(page, 'with every change undone');
    await finish(opened);
  });

  test('Enter in a one-line field ends the step, and in the documentation it is a new line', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    await clickEnd(page, 'name');
    await page.keyboard.type('X');
    await page.keyboard.press('Enter');
    await mustFocus(page, 'name', 'after Enter');
    await page.keyboard.type('Y');
    await untilField(page, 'name', 'HostXY', 'after Enter and Y: the focus should have stayed in the field');
    await page.keyboard.press('Tab');
    await undo(page);
    await untilField(page, 'name', 'HostX', 'after one Undo (Enter ended the first step)');
    await undo(page);
    await untilField(page, 'name', 'Host', 'after two Undos');
    const doc = await shownBy(page, 'doc');
    assert.notEqual(doc, null, 'Details shows no documentation field (data-testid "field-doc" in "details") for Host.');
    await clickEnd(page, 'doc');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Z');
    await page.keyboard.press('Tab');
    await untilField(page, 'doc', `${doc}\nZ`, 'after Enter and Z in the documentation: Enter should be a new line');
    await undo(page);
    await untilField(page, 'doc', doc, 'after one Undo of the documentation');
    await finish(opened);
  });

  test('a field that goes while it is typed into ends its step', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await showSide(page, 'Explorer');
    await pickBox(page, VIEW, 'Host');
    await clickEnd(page, 'name');
    await page.keyboard.type('X');
    await untilField(page, 'name', 'HostX', 'after X was typed');
    await scripted(rowIn(page, 'el', 'App'));
    await untilShown(page, 'el', 'App', 'by the row of App\'s own click, the focus left in the name of Host');
    await scripted(rowIn(page, 'el', 'Host'));
    await untilShown(page, 'el', 'Host', 'by the row of Host\'s own click');
    await untilField(page, 'name', 'HostX', 'after Host was shown again');
    await clickEnd(page, 'name');
    await page.keyboard.type('Y');
    await page.keyboard.press('Tab');
    await undo(page);
    await untilField(page, 'name', 'HostX', 'after one Undo: the first typing should have been a step that ended when its field went');
    await untilBox(page, 'Host', 'HostX', 'after one Undo');
    await undo(page);
    await untilField(page, 'name', 'Host', 'after two Undos');
    await finish(opened);
  });

  test('a field whose row trims holds the value trimmed, and shows it so once it is left', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Page.hosts');
    const input = fieldIn(page, 'multiplicity');
    await soon(page, async () => (await input.count()) > 0, 'Details shows no multiplicity field (data-testid "field-multiplicity" in "details") for Page.hosts.');
    await input.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('  0..1  ');
    await untilField(page, 'multiplicity', '  0..1  ', 'while the focus is in it: the draft should show as typed');
    await untilBox(page, 'Page.hosts', 'hosts : Host [0..1]', 'while the multiplicity is typed');
    await untilWords(page, 'undo', 'Set the multiplicity of part hosts in Page to 0..1', 'while the multiplicity is typed');
    await page.keyboard.press('Tab');
    await untilField(page, 'multiplicity', '0..1', 'once the field is left: it should show the value trimmed');
    await undo(page);
    await untilField(page, 'multiplicity', '1..*', 'after one Undo');
    await finish(opened);
  });

  test('a number field: a text that is no number leaves the field unset, and is gone once the field is left', async () => {
    const file = fixture('geometry');
    const opened = await openIn(browser, stateFileAt(file));
    const { page } = opened;
    await nothingPicked(page);
    await pickRow(page, 'el', 'room');
    await untilField(page, 'length', '8', 'for room');
    await fieldIn(page, 'length').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('9.5');
    await untilWords(page, 'undo', 'Set the length of part room to 9.5', 'after 9.5 was typed in Length');
    await page.keyboard.press('Control+A');
    await page.keyboard.type('abc');
    await untilField(page, 'length', 'abc', 'while it is typed into');
    await untilWords(page, 'undo', 'Set the length of part room to nothing', 'after abc was typed in Length');
    await page.keyboard.press('Tab');
    await untilField(page, 'length', '', 'once the field is left: the text that was no number should be gone');
    await undo(page);
    await untilField(page, 'length', '8', 'after one Undo');
    await finish(opened);
  });

  test('an Undo while a field is typed into: the field shows what the model holds', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    await clickEnd(page, 'name');
    await page.keyboard.type('X');
    await untilField(page, 'name', 'HostX', 'after X was typed');
    await scripted(page.locator(byTestId(TESTIDS.undo)));
    await frame(page);
    await untilField(page, 'name', 'Host', 'after an Undo with the focus in the field');
    await untilBox(page, 'Host', 'Host', 'after an Undo');
    await mustFocus(page, 'name', 'after the Undo');
    await page.keyboard.type('Z');
    await untilField(page, 'name', 'HostZ', 'after Z was typed');
    await untilBox(page, 'Host', 'HostZ', 'after Z was typed');
    await page.keyboard.press('Tab');
    await undo(page);
    await untilField(page, 'name', 'Host', 'after one more Undo');
    await finish(opened);
  });

  test('what a redo takes out of the model leaves Details', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'ServerHost');
    await soon(page, async () => (await fieldIn(page, 'specializes').count()) > 0, 'Details shows no Specializes field (data-testid "field-specializes" in "details") for ServerHost.');
    assert.equal(await valueOfPicker(page, 'specializes'), 'Host', 'Specializes of ServerHost holds');
    await openList(page, 'specializes');
    await pickOption(page, '');
    await untilWords(page, 'undo', 'Took away the specialization of part def ServerHost');
    await soon(page, async () => !(await rowOfField(page, 'specializes')), 'The Specializes row is still shown after its empty choice was picked.');
    await undo(page);
    await soon(page, async () => (await rowOfField(page, 'specializes')) && (await valueOfPicker(page, 'specializes')) === 'Host', 'The Specializes row is not back with Host after an Undo.');
    await pickRow(page, 'rel', 's-ServerHost');
    await redo(page);
    await soon(page, async () => (await saysIn(page)) === NOTHING_PICKED,
      async () => `Details does not say "${NOTHING_PICKED}" after a Redo took the line away: it shows ${(await shownIn(page)) ?? `"${await saysIn(page)}"`}.`);
    await undo(page);
    assert.equal(await saysIn(page), NOTHING_PICKED, 'After the Undo Details should still say that nothing is picked (nothing is picked again by itself), and it says');
    assert.equal(await shownIn(page), null, 'Details shows a form again after the Undo, by itself.');
    await pickRow(page, 'rel', 's-ServerHost');
    await finish(opened);
  });

  test('a locked field cannot be changed and says why', async () => {
    const opened = await openIn(browser, stateFileAt(fixture('behavior-states')));
    const { page } = opened;
    await nothingPicked(page);
    await pickRow(page, 'el', 'HostLifecycle');
    await tabOf(page, 'parallel');
    const input = fieldIn(page, 'parallel');
    assert.ok(await input.isDisabled(), 'The Is Parallel checkbox of HostLifecycle is not disabled.');
    assert.equal(await input.isChecked(), false, 'The Is Parallel checkbox of HostLifecycle is checked.');
    const row = await rowOfField(page, 'parallel');
    assert.ok(row.locked, 'The Is Parallel row of HostLifecycle has no class "locked".');
    assert.equal(row.why, "Is Parallel can't change while state def HostLifecycle holds transitions, as in SysON.", 'The reason under the Is Parallel field');
    await input.click({ force: true });
    await frame(page);
    assert.equal(await input.isChecked(), false, 'A click on the locked Is Parallel checkbox changed it.');
    await untilWords(page, 'undo', null, 'after a click on a locked field');
    await pickRow(page, 'el', 'HostLifecycle.running');
    await tabOf(page, 'parallel');
    const free = fieldIn(page, 'parallel');
    assert.ok(await free.isEnabled(), 'The Is Parallel checkbox of HostLifecycle.running is disabled.');
    assert.ok(await free.isChecked(), 'The Is Parallel checkbox of HostLifecycle.running is not checked.');
    const open = await rowOfField(page, 'parallel');
    assert.ok(!open.locked && open.why === null, `The Is Parallel row of HostLifecycle.running is locked or gives a reason: ${JSON.stringify(open)}.`);
    await free.click();
    await untilField(page, 'parallel', false, 'after a click on it');
    await untilWords(page, 'undo', 'Set the parallel of state running in HostLifecycle to false', 'after Is Parallel was unticked');
    await finish(opened);
  });

  test('a field that shows only in some views follows the view in front', async () => {
    const file = fixture('geometry');
    const model = modelOf(file);
    const plan = model.views.find((view) => view.id === 'v-plan');
    const structure = model.views.find((view) => view.id === 'v-structure');
    const opened = await openIn(browser, stateFileAt(file));
    const { page } = opened;
    await nothingPicked(page);
    await pickRow(page, 'el', 'room');
    await showTab(page, 'Core');
    const group = '.grasp-details-group[data-group="geometry"]';
    await soon(page, async () => (await countIn(page, group)) === 1, 'Details shows no geometry group (data-group "geometry") on Core for room, with v-plan in front.');
    await untilField(page, 'shape', 'Box', 'for room');
    await untilField(page, 'unit', 'm', 'for room');
    await untilField(page, 'length', '8', 'for room');
    const bring = async (view) => {
      const tab = await viewTab(page, view);
      await tab.click();
      await soon(page, async () => (await tab.getAttribute('aria-selected')) === 'true', `The tab of ${view.name} is not brought forward by a click.`);
    };
    await bring(structure);
    await soon(page, async () => (await countIn(page, group)) === 0, 'Details still shows the geometry group of room with v-structure in front.');
    assert.equal(await shownIn(page), 'el:room', 'Details should still show room when the view in front changes.');
    await bring(plan);
    await soon(page, async () => (await countIn(page, group)) === 1, 'Details does not show the geometry group of room again with v-plan in front.');
    await pickRow(page, 'el', 'Room');
    for (const tab of ['Core', 'Advanced']) {
      await showTab(page, tab);
      assert.equal(await countIn(page, group), 0, `Details shows a geometry group for the part def Room on ${tab}.`);
    }
    await finish(opened);
  });

  // Review of step 10, defect 1: the browser has one undo stack for the page's text fields, so a Ctrl + Z in a field
  // that was not typed into undid the typing of another as a new change, and left it on the history as a step.
  test('Ctrl + Z in a field that was not typed into takes back the newest step, undone and not made again as a new step', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    await clickEnd(page, 'name');
    await page.keyboard.type('A');
    await untilBox(page, 'Host', 'HostA', 'after A was typed');
    await page.keyboard.press('Tab');
    await fieldIn(page, 'doc').click();
    await mustFocus(page, 'doc', 'after the click on it');
    await page.keyboard.press('Control+z');
    await untilBox(page, 'Host', 'Host', 'after Ctrl + Z in the documentation');
    await untilField(page, 'name', 'Host', 'after Ctrl + Z in the documentation');
    await untilWords(page, 'undo', null, 'the typing was the history\'s one step, and Ctrl + Z in another field took it back (it was not made again as a new step)');
    await untilWords(page, 'redo', 'Renamed to part def HostA', 'the step Ctrl + Z in the documentation took back');
    await mustBeSaved(page, 'with the one step taken back');
    await page.keyboard.press('Control+y');
    await untilBox(page, 'Host', 'HostA', 'after Ctrl + Y in the documentation');
    await untilWords(page, 'redo', null, 'after Ctrl + Y made the step again');
    await untilWords(page, 'undo', 'Renamed to part def HostA', 'after Ctrl + Y made the step again');
    await finish(opened);
  });

  // Review of step 10, defect 2: a picker's input is a text input, so no key took a pick back while the focus stayed there,
  // and the browser's own undo took back an earlier typing instead.
  test('Ctrl + Z with the focus in a picker takes the pick back, and Ctrl + Y makes it again', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Page.hosts');
    await showTab(page, 'Core');
    await clickEnd(page, 'name');
    await page.keyboard.type('Z');
    await page.keyboard.press('Tab');
    const before = await valueOfPicker(page, 'type');
    await openList(page, 'type');
    await pickOption(page, 'ServerHost');
    assert.equal(await valueOfPicker(page, 'type'), 'ServerHost', 'the picker holds the pick');
    await mustFocus(page, 'type', 'after the pick');
    await page.keyboard.press('Control+z');
    await soon(page, async () => (await valueOfPicker(page, 'type')) === before, async () => `Ctrl + Z in the picker leaves it holding ${JSON.stringify(await valueOfPicker(page, 'type'))}, not ${JSON.stringify(before)}.`);
    await untilWords(page, 'undo', 'Renamed to part hostsZ in Page', 'the pick was taken back and the typing before it was not');
    await untilField(page, 'name', 'hostsZ', 'after Ctrl + Z in the picker');
    await untilWords(page, 'redo', 'Defined part hostsZ in Page by ServerHost', 'the pick Ctrl + Z took back');
    await page.keyboard.press('Control+y');
    await soon(page, async () => (await valueOfPicker(page, 'type')) === 'ServerHost', async () => `Ctrl + Y in the picker leaves it holding ${JSON.stringify(await valueOfPicker(page, 'type'))}, not "ServerHost".`);
    await finish(opened);
  });

  test('Ctrl + Z in a text field takes the step of its typing back', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    await clickEnd(page, 'name');
    await page.keyboard.type('X');
    await untilBox(page, 'Host', 'HostX', 'after X was typed');
    await page.keyboard.press('Control+z');
    await untilField(page, 'name', 'Host', 'after Ctrl + Z in the field');
    await untilBox(page, 'Host', 'Host', 'after Ctrl + Z in the field');
    await mustFocus(page, 'name', 'after Ctrl + Z');
    await page.keyboard.press('Tab');
    await untilWords(page, 'undo', null, 'once the field is left: the run ended where it began');
    await mustBeSaved(page, 'once the run ended where it began');
    await finish(opened);
  });

  test('Escape changes nothing in a field, and closes a picker\'s list', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    await clickEnd(page, 'name');
    await page.keyboard.type('X');
    await page.keyboard.press('Escape');
    await page.keyboard.type('Y');
    await page.keyboard.press('Tab');
    await untilField(page, 'name', 'HostXY', 'after X, Escape and Y: Escape should change nothing');
    await undo(page);
    await untilField(page, 'name', 'Host', 'after one Undo (Escape ended nothing)');
    await pickBox(page, VIEW, 'Page.hosts');
    const words = await wordsOf(page, 'undo');
    await openList(page, 'type');
    await page.keyboard.press('Escape');
    await soon(page, async () => !(await listOpen(page)), 'Escape did not close the Typed by list.');
    assert.equal(await valueOfPicker(page, 'type'), 'Host', 'The Typed by picker holds');
    assert.equal(await wordsOf(page, 'undo'), words, 'Undo\'s words changed with Escape in the picker');
    await finish(opened);
  });

  test('a picker narrows its list as text is typed, and drops text that picks nothing', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Page.hosts');
    const words = await wordsOf(page, 'undo');
    await openList(page, 'type');
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Ser');
    await soon(page, async () => JSON.stringify(await optionsOf(page)) === '["ServerHost"]',
      async () => `The list, narrowed by "Ser", offers ${JSON.stringify(await optionsOf(page))}, not ["ServerHost"].`);
    await page.keyboard.press('Control+A');
    await page.keyboard.type('zzz');
    await page.keyboard.press('Tab');
    await soon(page, async () => (await fieldIn(page, 'type').inputValue()) === 'Host',
      async () => `The Typed by picker reads "${await fieldIn(page, 'type').inputValue()}" after text that picks nothing and a Tab, not "Host".`);
    assert.equal(await valueOfPicker(page, 'type'), 'Host', 'The Typed by picker holds');
    assert.equal(await wordsOf(page, 'undo'), words, 'Undo\'s words changed after text that picks nothing was dropped');
    await finish(opened);
  });

  test('the keyboard alone changes a checkbox, a choice, a picker and the tab', async () => {
    const opened = await openIn(browser, stateFileAt(fixture('interconnection')));
    const { page } = opened;
    await nothingPicked(page);
    await pickRow(page, 'el', 'FuelPort.supply');
    const details = page.locator(DETAILS);
    await showTab(page, 'Core');
    await details.getByRole('tab', { name: 'Core', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await untilTab(page, 'Advanced', 'after ArrowRight on the Core tab');
    await page.keyboard.press('ArrowLeft');
    await untilTab(page, 'Core', 'after ArrowLeft on the Advanced tab');
    await soon(page, async () => (await shownBy(page, 'direction')) === 'out', 'The Direction of supply does not read "out".');
    await page.locator(`${DETAILS} ${byTestId(TESTIDS.field('direction'))} input:checked`).focus();
    await page.keyboard.press('ArrowLeft');
    await untilField(page, 'direction', 'inout', 'after ArrowLeft on the checked button');
    await untilWords(page, 'undo', 'Set the direction of item supply in FuelPort to inout');
    const picker = fieldIn(page, 'type');
    assert.equal(await valueOfPicker(page, 'type'), 'Fuel', 'The Typed by picker of supply holds');
    await picker.focus();
    await page.keyboard.press('ArrowDown');
    const lit = () => page.evaluate(() => document.querySelector('[role="listbox"] [role="option"].Mui-focused')?.getAttribute('data-option') ?? null);
    await soon(page, async () => (await lit()) === 'Fuel', async () => `After ArrowDown the list lights ${JSON.stringify(await lit())}, not "Fuel" (the present choice).`);
    await page.keyboard.press('ArrowDown');
    await soon(page, async () => (await lit()) === 'Signal', async () => `After a second ArrowDown the list lights ${JSON.stringify(await lit())}, not "Signal".`);
    await page.keyboard.press('Enter');
    await soon(page, async () => !(await listOpen(page)), 'Enter did not close the list.');
    await soon(page, async () => (await valueOfPicker(page, 'type')) === 'Signal', 'Enter did not pick Signal: the picker does not hold it.');
    await untilWords(page, 'undo', 'Defined item supply in FuelPort by Signal');
    await pickRow(page, 'el', 'Fuel');
    await showTab(page, 'Advanced');
    await fieldIn(page, 'abstract').focus();
    await page.keyboard.press('Space');
    await untilField(page, 'abstract', true, 'after Space on the focused checkbox');
    await untilWords(page, 'undo', 'Made abstract: item def Fuel');
    await finish(opened);
  });

  test('an empty name is an unnamed element', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    await clickEnd(page, 'name');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Tab');
    await untilField(page, 'name', '', 'after the name was emptied');
    await soon(page, async () => (await inDetails(page, '.grasp-details-what')) === 'part def (unnamed)',
      async () => `Details says "${await inDetails(page, '.grasp-details-what')}" for the emptied name, not "part def (unnamed)".`);
    await untilWords(page, 'undo', 'Renamed to part def (unnamed)');
    await soon(page, async () => (await boxName(page, 'Host')) !== 'Host', 'The box still reads Host after the name was emptied.');
    await undo(page);
    await untilField(page, 'name', 'Host', 'after an Undo');
    await untilBox(page, 'Host', 'Host', 'after an Undo');
    await finish(opened);
  });

  test('another file opened: Details lets the first file\'s pick go, keeps its tab, and shows the new file\'s', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    await showTab(page, 'Advanced');
    await openStateFile(page, stateFileAt(fixture('interconnection')));
    await soon(page, async () => (await saysIn(page)) === NOTHING_PICKED,
      async () => `After another file was opened Details shows ${(await shownIn(page)) ?? `"${await saysIn(page)}"`}, not "${NOTHING_PICKED}".`);
    await pickRow(page, 'el', 'Fuel');
    await shows(page, 'el', 'Fuel', 'item def Fuel', 'Item Definition Properties', 'picked by its row in the second file');
    await untilTab(page, 'Advanced', 'in the second file: the tab shown should have been kept');
    await finish(opened);
  });

  // Review of step 10, defect 3 (minor): the label around a checkbox stretched across the panel, so a click on the empty
  // ground of its row changed the field.
  test('a click on the empty ground along a checkbox\'s row changes nothing', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    await tabOf(page, 'abstract');
    const emptyOf = async (selector) => {
      const row = await page.evaluate(([root, s]) => {
        const label = document.querySelector(`${root} ${s}`).closest('label');
        const panel = document.querySelector(`${root} .grasp-details-page`).getBoundingClientRect();
        const r = label.getBoundingClientRect();
        return { right: r.right, left: r.left, y: r.top + r.height / 2, panelRight: panel.right, panelWidth: panel.width };
      }, [DETAILS, selector]);
      return { x: row.panelRight - 12, y: row.y, wide: row.right - row.left, panel: row.panelWidth };
    };
    const abstract = await emptyOf(`input[data-testid="${TESTIDS.field('abstract')}"]`);
    assert.ok(abstract.wide < abstract.panel - 40, `the label of Is Abstract is ${Math.round(abstract.wide)} px wide, as wide as the panel: it should end with its text, as wide as the box and the words need.`);
    const before = await shownBy(page, 'abstract');
    await page.mouse.click(abstract.x, abstract.y);
    await frame(page);
    await frame(page);
    assert.equal(await shownBy(page, 'abstract'), before, `A click on the empty ground beside the label of Is Abstract (at ${Math.round(abstract.x)}, ${Math.round(abstract.y)}) changed the checkbox: its label is ${Math.round(abstract.wide)} px wide.`);
    await untilWords(page, 'undo', null, 'after a click beside the label');
    await fieldIn(page, 'abstract').click();
    await untilField(page, 'abstract', !before, 'after a click on the checkbox itself');
    await finish(opened);
  });

  test('the fields are dense, in Roboto', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    await pickBox(page, VIEW, 'Host');
    await showTab(page, 'Core');
    const near = (a, b, eps) => Math.abs(a - b) <= eps;
    const looks = await page.evaluate(([root, nameId]) => {
      const input = document.querySelector(`${root} input[data-testid="${nameId}"]`);
      const label = document.querySelector(`${root} .grasp-field-label`);
      const tablist = document.querySelector(`${root} [role="tablist"]`);
      const style = input ? getComputedStyle(input) : null;
      const box = input ? (input.closest('.MuiInputBase-root') ?? input.parentElement) : null;
      return {
        input: !!input, boxHeight: box?.getBoundingClientRect().height, fontSize: style?.fontSize, family: style?.fontFamily,
        tabs: tablist?.getBoundingClientRect().height, label: label ? getComputedStyle(label).fontSize : null,
      };
    }, [DETAILS, TESTIDS.field('name')]);
    assert.ok(looks.input, 'Details shows no name field (data-testid "field-name" in "details") for Host.');
    assert.ok(near(looks.boxHeight, 32, 0.5), `The name field's box is ${looks.boxHeight} px high, not 32.`);
    assert.equal(looks.fontSize, '13px', 'The text of the name field is');
    assert.ok(/^["']?Roboto/.test(looks.family), `The font family of the name field is ${looks.family}, which does not begin with Roboto.`);
    assert.ok(near(looks.tabs, 32, 0.5), `The tabs' row is ${looks.tabs} px high, not 32.`);
    assert.equal(looks.label, '12px', 'The font size of a label (.grasp-field-label) is');
    const fits = async (where) => {
      const wide = await page.evaluate((root) => {
        const panel = document.querySelector(root);
        const width = panel.getBoundingClientRect().width;
        return {
          scrolls: panel.scrollWidth > panel.clientWidth,
          wide: [...panel.querySelectorAll('[data-testid^="field-"]')].filter((el) => el.getBoundingClientRect().width > width - 24).map((el) => el.getAttribute('data-testid')),
        };
      }, DETAILS);
      assert.ok(!wide.scrolls, `Details scrolls sideways on ${where}.`);
      assert.deepEqual(wide.wide, [], `Widgets wider than the panel less 24 px on ${where}.`);
    };
    await fits('Core');
    await showTab(page, 'Advanced');
    const around = await fieldIn(page, 'abstract').evaluate((el) => el.closest('label')?.getBoundingClientRect().height ?? null);
    assert.ok(around !== null && around <= 28.5, `The label around the Is Abstract checkbox is ${around} px high, which is more than 28.`);
    await fits('Advanced');
    await showTab(page, 'Core'); // the tab shown is kept across picks, and the type's picker is on Core
    await pickBox(page, VIEW, 'Page.hosts');
    const picker = await fieldIn(page, 'type').evaluate((el) => (el.closest('.MuiInputBase-root') ?? el.parentElement).getBoundingClientRect().height);
    assert.ok(near(picker, 32, 0.5), `The picker's box is ${picker} px high, not 32.`);
    await finish(opened);
  });

  test('Ctrl + Z takes a tick back while the focus is still on the checkbox', async () => {
    const opened = await openExample(browser);
    const { page } = opened;
    await nothingPicked(page);
    // App, not Host as step-10.md's row says: Host is abstract in the example already, so a click would untick it.
    await pickBox(page, VIEW, 'App');
    await showTab(page, 'Advanced');
    await fieldIn(page, 'abstract').click();
    await untilField(page, 'abstract', true, 'after a click on it');
    await untilWords(page, 'undo', 'Made abstract: part def App');
    await mustFocus(page, 'abstract', 'after a click on the checkbox');
    await page.keyboard.press('Control+z');
    await untilField(page, 'abstract', false, 'after Ctrl + Z with the focus on the checkbox');
    await untilWords(page, 'undo', null, 'after Ctrl + Z took the tick back');
    await page.keyboard.press('Control+y');
    await untilField(page, 'abstract', true, 'after Ctrl + Y');
    await finish(opened);

    const second = await openIn(browser, stateFileAt(fixture('interconnection')));
    const other = second.page;
    await nothingPicked(other);
    await pickRow(other, 'el', 'FuelPort.supply');
    await showTab(other, 'Core');
    await untilField(other, 'direction', 'out', 'for supply');
    await other.locator(`${DETAILS} ${byTestId(TESTIDS.field('direction'))} input[value="in"]`).click();
    await untilField(other, 'direction', 'in', 'after a click on the in button');
    await other.keyboard.press('Control+z');
    await untilField(other, 'direction', 'out', 'after Ctrl + Z with the focus on a radio button');
    await finish(second);
  });
});
