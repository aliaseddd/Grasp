// The Validation panel in the built page, opened from file://: its two lists (Grasp's own problems and the
// diagnostics of the SysML v2 specification's rules), when they are worked out, and what a click on an entry picks.
// Written in step 12, before what it checks (plan/swarm/step-12.md, sections 3 and 4).
//
// Every test reads only what the page shows: the panel's lists by their data attributes, the plane's nodes, Details's
// name field and the bar's Undo. None reads the application's own objects. The one wrapper of the model library's
// global (test 6) counts the checks, as step-12.md, section 3, says.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  BROWSER_FRAMES, boxOf, byTestId, closePages, EXAMPLE, fieldIn, finish, frame, launch, modelOf, nodeOf, openIn, openPage, openStateFile, selectBox, showSide,
  pickRow, soon, stateFileAt, stateFileOf, TESTIDS, undo, until, untilDrawn,
} from './helpers.mjs';

const view = modelOf(EXAMPLE).views[0];
const ROOT = byTestId(TESTIDS.validation);
const LISTS = `${ROOT} .grasp-validation-lists`;

const TWINS = 'Two elements are named Host in the package.';
const RULE = "#validateNamespaceDistinguishibility·····[StrongholdProof/StrongholdProof]·····Constraint on type 'sysml:Namespace' is not respected: Its members part def Host and part def Host have the same name, and one is a kind of the other, so they can't be told apart.";
const IN_PAGE = 'Two elements are named hosts in Page.';
const PAGE_RULE = "#validateNamespaceDistinguishibility·····[StrongholdProof/StrongholdProof::Page]·····Constraint on type 'sysml:Namespace' is not respected: Its members part hosts in Page and part hosts in Page have the same name, and one is a kind of the other, so they can't be told apart.";
const NOTE = "The SysML v2 specification's validation rules that Grasp can check, as SysON runs them: 15 of its 388. The others are met by any text Grasp writes, or are about what it doesn't make.";
const NO_PROBLEMS = 'No problems found.';
const NO_RULES = 'No rule is broken.';

/** One read in the page, so that its parts belong to one moment. */
const read = (page) => page.evaluate(([root, lists]) => {
  const text = (el) => (el ? el.textContent : null);
  const el = document.querySelector(lists);
  return {
    stale: el ? el.getAttribute('data-stale') : null,
    busy: el ? el.getAttribute('aria-busy') : null,
    lists: [...document.querySelectorAll(`${root} section[data-list]`)].map((section) => ({
      list: section.getAttribute('data-list'),
      count: section.getAttribute('data-count'),
      title: text(section.querySelector('.grasp-validation-title')),
      shown: text(section.querySelector('.grasp-validation-count')),
      note: text(section.querySelector('.grasp-validation-note')),
      none: text(section.querySelector('.grasp-validation-none')),
      entries: [...section.querySelectorAll('[data-entry]')].map((entry) => [
        entry.getAttribute('data-entry'), entry.textContent, entry.getAttribute('role'), entry.getAttribute('aria-current'),
      ]),
    })),
  };
}, [ROOT, LISTS]);

/** What the panel says under its title: the root's text without its title row's. */
const said = (page) => page.evaluate((root) => {
  const el = document.querySelector(root);
  if (!el) return null;
  const copy = el.cloneNode(true);
  copy.querySelectorAll('.grasp-side-title').forEach((title) => title.remove());
  return copy.textContent;
}, ROOT);

/** Waits until both lists are there. */
const untilLists = (page) => soon(page, async () => {
  const now = await read(page);
  return now.lists.length === 2 && now.lists[0].list === 'problems' && now.lists[1].list === 'rules' ? now : null;
}, async () => `The Validation panel shows no list of Grasp's problems (data-list "problems"): it says "${await said(page)}".`, BROWSER_FRAMES);

const entriesOf = (now) => now.lists.reduce((sum, list) => sum + list.entries.length, 0);
const untilEntries = (page, count, frames, missing) => soon(page, async () => {
  const now = await read(page);
  return now.lists.length === 2 && entriesOf(now) === count ? now : null;
}, async () => {
  const now = await read(page);
  return `${missing} The panel lists ${entriesOf(now)} entries (${now.lists.map((l) => `${l.list}: ${l.entries.length}`).join(', ') || 'no list'}), stale ${now.stale}.`;
}, frames);

/** Picks a box on the plane and types a new name into Details: one change, as a paste is. */
async function rename(page, id, name) {
  await selectBox(page, view, id);
  const field = fieldIn(page, 'name');
  await soon(page, async () => (await field.count()) > 0, `Details shows no name field (data-testid "field-name") for ${id}.`);
  await field.fill(name);
}

/** Both lists empty, with their sentences. */
function assertEmpty(now, where) {
  assert.equal(now.lists.length, 2, `${where}: the panel shows ${now.lists.length} lists.`);
  const [problems, rules] = now.lists;
  assert.deepEqual(problems.entries, [], `${where}: Grasp's problems lists entries.`);
  assert.deepEqual(rules.entries, [], `${where}: the specification's rules list entries.`);
  assert.equal(problems.none, NO_PROBLEMS, `${where}: Grasp's problems does not say "${NO_PROBLEMS}".`);
  assert.equal(rules.none, NO_RULES, `${where}: the specification's rules does not say "${NO_RULES}".`);
  assert.deepEqual([problems.count, problems.shown, rules.count, rules.shown], ['0', '0', '0', '0'], `${where}: the counts are not 0 and 0.`);
  assert.equal(now.stale, 'false', `${where}: the lists are marked stale (data-stale "${now.stale}").`);
}

/** The twins' lists, as test 2 holds them. */
function assertTwins(now, where) {
  const [problems, rules] = now.lists;
  assert.deepEqual(problems.entries.map(([key, text]) => [key, text]), [['el:Host', TWINS], ['el:App', TWINS]],
    `${where}: Grasp's problems lists ${JSON.stringify(problems.entries.map(([key, text]) => [key, text]))}, not el:Host then el:App, each saying "${TWINS}".`);
  assert.deepEqual(rules.entries.map(([key, text]) => [key, text]), [['package:', RULE]],
    `${where}: the specification's rules list ${JSON.stringify(rules.entries.map(([key, text]) => [key, text]))}, not package: saying SysON's label.`);
  assert.deepEqual([problems.count, problems.shown, rules.count, rules.shown], ['2', '2', '1', '1'], `${where}: the counts are not 2 and 1.`);
  assert.equal(problems.none, null, `${where}: Grasp's problems says "${problems.none}" beside its entries.`);
  assert.equal(rules.none, null, `${where}: the specification's rules says "${rules.none}" beside its entry.`);
  assert.equal(now.stale, 'false', `${where}: the lists are marked stale (data-stale "${now.stale}").`);
}

/** The example's state file with App named Host. */
function twinsFile() {
  const state = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8'));
  const app = state.model.elements.find((e) => e.id === 'App');
  assert.ok(app, 'The example has no element App.');
  app.name = 'Host';
  return stateFileOf('twins.json', state);
}

const entryOf = (list, key) => `${LISTS} section[data-list="${list}"] [data-entry=${JSON.stringify(key)}]`;

describe('the Validation panel', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  test('the example has no entry, and the panel says so', async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showSide(page, 'Validation');
    const now = await untilLists(page);
    const [problems, rules] = now.lists;
    assert.deepEqual([problems.list, rules.list], ['problems', 'rules'], 'The lists are not Grasp\'s problems then the specification\'s rules.');
    assert.equal(problems.title, "Grasp's problems", `The first list's title reads "${problems.title}".`);
    assert.equal(rules.title, "The specification's rules", `The second list's title reads "${rules.title}".`);
    assertEmpty(now, 'The example');
    assert.equal(rules.note, NOTE, `The rules' note (.grasp-validation-note) reads ${JSON.stringify(rules.note)}.`);
    assert.equal(problems.note, null, "Grasp's problems carries the rules' note.");
    await finish(opened);
  });

  test('two part defs given one name are listed 0.8 s after the change, under Grasp\'s problems and under the specification\'s rules in SysON\'s words, and both entries go with Undo', async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showSide(page, 'Validation');
    await untilLists(page);
    await untilDrawn(page, view);
    await page.evaluate((root) => {
      const marks = { input: null, entry: null };
      window.__marks = marks;
      window.addEventListener('input', () => { if (marks.input === null) marks.input = performance.now(); }, { capture: true });
      new MutationObserver(() => {
        if (marks.entry === null && document.querySelector(`${root} [data-entry]`)) marks.entry = performance.now();
      }).observe(document.querySelector(root), { childList: true, subtree: true });
    }, ROOT);
    await rename(page, 'App', 'Host');
    const stale = await soon(page, async () => { const now = await read(page); return now.stale === 'true' ? now : null; },
      'After App was renamed to Host the lists never became stale (data-stale "true" on .grasp-validation-lists).', 10);
    assert.equal(entriesOf(stale), 0, 'While stale the panel already lists entries: it checked inside the change, not after the pause.');
    assert.deepEqual(stale.lists.map((l) => [l.count, l.shown, l.none]), [['0', '0', NO_PROBLEMS], ['0', '0', NO_RULES]],
      'While stale the lists changed: they should stay as they were until the check comes.');
    assert.equal(stale.busy, 'true', `While stale aria-busy is "${stale.busy}", not "true".`);
    const listed = await untilEntries(page, 3, BROWSER_FRAMES, 'Renaming App to Host did not list the two entries of Grasp\'s problems and the one of the rules.');
    assertTwins(listed, 'After the pause');
    assert.equal(listed.busy, 'false', `Once checked aria-busy is "${listed.busy}", not "false".`);
    const marks = await page.evaluate(() => window.__marks);
    assert.ok(marks.input !== null && marks.entry !== null, `The page did not note its input event and its first entry (${JSON.stringify(marks)}).`);
    assert.ok(marks.entry - marks.input >= 790,
      `The first entry appeared ${(marks.entry - marks.input).toFixed(0)} ms after the name was typed; the panel waits for a pause of 800 ms.`);

    await undo(page);
    const gone = await untilEntries(page, 0, 10, 'Undo did not take the entries away at once.');
    assertEmpty(gone, 'After Undo');
    const text = await page.evaluate((selector) => document.querySelector(selector)?.textContent ?? null, nodeOf(view.id, 'App'));
    assert.ok(text !== null && text.includes('App'), `After Undo the box App reads ${JSON.stringify(text)}, not "App".`);
    await finish(opened);
  });

  test('a click selects what an entry is about', async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showSide(page, 'Validation');
    await untilLists(page);
    await untilDrawn(page, view);
    await rename(page, 'App', 'Host');
    await untilEntries(page, 3, BROWSER_FRAMES, 'Renaming App to Host did not list the entries.');
    const picked = (id) => soon(page, async () => (await boxOf(page, view.id, id))?.selected, `${id} is not selected on the plane (its node has no class "selected").`);
    const marked = async (list, key) => (await read(page)).lists.find((l) => l.list === list).entries.find(([k]) => k === key);

    await page.locator(entryOf('problems', 'el:Host')).click();
    await picked('Host');
    assert.equal((await boxOf(page, view.id, 'App')).selected, false, 'A click on the entry of Host selected App as well.');
    await soon(page, async () => (await marked('problems', 'el:Host'))[3] === 'true', 'After a click on the entry el:Host it has no aria-current="true".');
    assert.equal((await marked('problems', 'el:App'))[3], null, 'The entry el:App has aria-current although App is not picked.');

    await page.locator(entryOf('problems', 'el:App')).focus();
    await page.keyboard.press('Enter');
    await picked('App');
    assert.equal((await boxOf(page, view.id, 'Host')).selected, false, 'Enter on the entry of App left Host selected.');
    await soon(page, async () => (await marked('problems', 'el:App'))[3] === 'true' && (await marked('problems', 'el:Host'))[3] === null,
      'After Enter on the entry el:App the mark (aria-current) did not move from el:Host to el:App.');

    const now = await read(page);
    for (const key of ['el:Host', 'el:App']) {
      assert.equal(now.lists[0].entries.find(([k]) => k === key)[2], 'button', `The entry ${key} has no role "button".`);
    }
    const rule = now.lists[1].entries.find(([k]) => k === 'package:');
    assert.ok(rule, 'The rules list has no entry package:.');
    assert.equal(rule[2], null, `The entry package: has the role "${rule[2]}": it picks nothing, so it is no button.`);
    await page.locator(entryOf('rules', 'package:')).click();
    await frame(page);
    assert.equal((await boxOf(page, view.id, 'App')).selected, true, 'A click on the entry package: unselected App: it should pick nothing.');
    await finish(opened);
  });

  // DevHost made to specialize StrongholdApp, a port def: one problem, about the line s-DevHost. DevHost is renamed in
  // Details, which turns the lists stale, and then, within the pause, its Specializes emptied takes the line out of the
  // model; the stale lists still list it. A click on that entry then changes nothing: DevHost stays picked (step 12's review, defect 2).
  test('while the lists are stale, a click on an entry whose relationship has left the model changes nothing', async () => {
    const state = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8'));
    state.model.relationships.find((r) => r.id === 's-DevHost').to = 'StrongholdApp';
    const opened = await openIn(browser, stateFileOf('bad-specialization.json', state));
    const { page } = opened;
    await showSide(page, 'Validation');
    await untilDrawn(page, view);
    const listed = await untilEntries(page, 1, BROWSER_FRAMES, 'The specialization of DevHost by a port def is not listed.');
    assert.deepEqual(listed.lists[0].entries.map(([key]) => key), ['rel:s-DevHost'], 'Grasp\'s problems does not list the line s-DevHost alone.');
    // Two changes within one pause: a rename turns the lists stale, then the line leaves the model while they are.
    await rename(page, 'DevHost', 'DevHost2');
    await soon(page, async () => (await read(page)).stale === 'true', 'Renaming DevHost did not turn the lists stale.');
    const picker = fieldIn(page, 'specializes');
    await soon(page, async () => (await picker.count()) > 0, 'Details shows no Specializes field (data-testid "field-specializes") for DevHost.');
    await picker.click();
    const empty = page.locator('[role="listbox"] [role="option"][data-option=""]');
    await soon(page, async () => (await empty.count()) === 1, 'The Specializes picker offers no empty choice (data-option "").');
    await empty.click();
    const stale = await soon(page, async () => {
      const now = await read(page);
      return now.stale === 'true' ? now : null;
    }, 'Taking the specialization away did not turn the lists stale.');
    assert.deepEqual(stale.lists[0].entries.map(([key]) => key), ['rel:s-DevHost'], 'The stale list no longer holds rel:s-DevHost, so the case cannot be tried.');
    await page.locator(entryOf('problems', 'rel:s-DevHost')).click();
    await frame(page);
    await frame(page);
    assert.equal((await boxOf(page, view.id, 'DevHost')).selected, true,
      'A click on the stale entry of s-DevHost, which the model no longer holds, let DevHost go: it should change nothing.');
    await untilEntries(page, 0, BROWSER_FRAMES, 'After the pause the stale entry did not go.');
    await finish(opened);
  });

  // DevHost and ServerHost given names the specification reserves list two problems, ServerHost's first. With the focus
  // on DevHost's entry, Undo takes ServerHost's name back and its entry goes; DevHost's stays listed and keeps the focus,
  // and Redo, which puts ServerHost's entry back in front of it, leaves it there too (the closing's review).
  test('an entry keeps the keyboard focus when an entry before it goes or comes', async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showSide(page, 'Validation');
    await untilLists(page);
    await untilDrawn(page, view);
    await rename(page, 'DevHost', 'SysML');
    await untilEntries(page, 1, BROWSER_FRAMES, 'Naming DevHost SysML listed no problem.');
    await rename(page, 'ServerHost', 'Views');
    const both = await untilEntries(page, 2, BROWSER_FRAMES, 'Naming ServerHost Views listed no second problem.');
    assert.deepEqual(both.lists[0].entries.map(([key]) => key), ['el:ServerHost', 'el:DevHost'], 'The two problems are not listed ServerHost first.');
    const focused = () => page.evaluate(() => document.activeElement?.getAttribute('data-entry') ?? document.activeElement?.tagName ?? null);
    await page.locator(entryOf('problems', 'el:DevHost')).focus();
    assert.equal(await focused(), 'el:DevHost', 'The entry el:DevHost could not be given the focus.');
    await page.keyboard.press('Control+z');
    await untilEntries(page, 1, BROWSER_FRAMES, 'Undo did not take the entry of ServerHost away.');
    assert.equal(await focused(), 'el:DevHost', 'Undo took an entry before el:DevHost away, and el:DevHost, still listed, lost the focus.');
    await page.keyboard.press('Control+y');
    await untilEntries(page, 2, BROWSER_FRAMES, 'Redo did not put the entry of ServerHost back.');
    assert.equal(await focused(), 'el:DevHost', 'Redo put an entry back before el:DevHost, and el:DevHost lost the focus.');
    await finish(opened);
  });

  test('a click on a rule\'s entry selects the namespace it is about', async () => {
    const opened = await openIn(browser, stateFileAt(EXAMPLE));
    const { page } = opened;
    await showSide(page, 'Validation');
    await untilLists(page);
    await untilDrawn(page, view);
    await rename(page, 'Page.app', 'hosts');
    const now = await untilEntries(page, 3, BROWSER_FRAMES, 'Renaming Page.app to hosts did not list the entries.');
    const [problems, rules] = now.lists;
    assert.deepEqual(problems.entries.map(([key, text]) => [key, text]), [['el:Page.hosts', IN_PAGE], ['el:Page.app', IN_PAGE]],
      `Grasp's problems lists ${JSON.stringify(problems.entries.map(([key, text]) => [key, text]))}, not el:Page.hosts then el:Page.app, each saying "${IN_PAGE}".`);
    assert.deepEqual(rules.entries.map(([key, text, role]) => [key, text, role]), [['el:Page', PAGE_RULE, 'button']],
      `The specification's rules list ${JSON.stringify(rules.entries.map(([key, text, role]) => [key, text, role]))}, not el:Page saying SysON's label, as a button.`);
    await page.locator(entryOf('rules', 'el:Page')).click();
    await soon(page, async () => (await boxOf(page, view.id, 'Page'))?.selected, 'A click on the rule\'s entry el:Page did not select Page on the plane (its node has no class "selected").');
    assert.equal((await boxOf(page, view.id, 'Page.app')).selected, false, 'The click on el:Page left Page.app selected.');
    await soon(page, async () => (await read(page)).lists[1].entries[0][3] === 'true', 'After a click on the entry el:Page it has no aria-current="true".');
    await finish(opened);
  });

  test('a file is checked at once when it is opened, and another file\'s lists take its place', async () => {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await showSide(page, 'Validation');
    const none = await said(page);
    assert.equal(none, 'No file is open.', `With no file open the Validation panel says "${none}", not "No file is open.".`);
    assert.equal(await page.locator(LISTS).count(), 0, 'With no file open the Validation panel has lists (.grasp-validation-lists).');

    await openStateFile(page, twinsFile());
    const twins = await untilEntries(page, 3, 10, 'twins.json was opened and the panel lists no entry at once, with no change made.');
    assertTwins(twins, 'With twins.json');

    await openStateFile(page, stateFileAt(EXAMPLE));
    const example = await untilEntries(page, 0, 10, 'The example was opened over twins.json and the panel still lists its entries.');
    assertEmpty(example, 'With the example');
    await finish(opened);
  });

  test('a hidden or collapsed Validation panel checks nothing, and shown again it is up to date at once', async () => {
    const opened = await openPage(browser, { picker: false });
    const { page } = opened;
    await page.evaluate(() => {
      const M = window.SysMLModel;
      window.__checks = 0;
      window.SysMLModel = Object.freeze({ ...M, validate: (model) => { window.__checks += 1; return M.validate(model); } });
    });
    const checks = () => page.evaluate(() => window.__checks);
    const aSecond = async () => {
      const t0 = await page.evaluate(() => performance.now());
      await until(page, (t) => performance.now() - t >= 1000, t0, 'a second passes on the page\'s clock', 3000);
    };
    const tab = page.getByRole('tab', { name: 'Validation', exact: true });
    await openStateFile(page, stateFileAt(EXAMPLE));
    await untilDrawn(page, view);
    // From slice 2 the checks run while any body or panel that shows them is shown (plan/architecture.md, contract 8):
    // a plane shows the marks, so the example's plane has the model checked once, with the Validation panel hidden.
    assert.equal(await checks(), 1, `With the example's plane shown and the Validation panel hidden the model was checked ${await checks()} times, not once.`);
    // No body shown from here on: the view's tab is closed, and only the panel can have the model checked.
    const viewTabOf = page.getByRole('tab', { name: `${view.name} : ${view.kind}`, exact: true });
    await viewTabOf.hover();
    await viewTabOf.locator('.dv-default-tab-action').first().click();
    await soon(page, async () => (await viewTabOf.count()) === 0, `The close control of the tab of ${view.name} was clicked and its tab is still there.`);
    await showSide(page, 'Validation');
    await untilLists(page);
    assert.equal(await checks(), 1, `Showing the Validation panel, with the result up to date, made ${(await checks()) - 1} checks, not none.`);

    await showSide(page, 'Explorer');
    // The rename is made from the Explorer's row, since no plane is shown to click the box on.
    await pickRow(page, 'el', 'App');
    const name = fieldIn(page, 'name');
    await soon(page, async () => (await name.count()) > 0, 'Details shows no name field (data-testid "field-name") for App.');
    await name.fill('Host');
    await aSecond();
    assert.equal(await checks(), 1, `A change made while the Validation panel was hidden was checked after the pause (${await checks()} checks, not 1).`);
    await showSide(page, 'Validation');
    const twins = await untilEntries(page, 3, 10, 'Showing the Validation panel again, after a change it did not see, listed no entries at once.');
    assertTwins(twins, 'Shown again');
    assert.equal(await checks(), 2, `Showing the panel again made ${(await checks()) - 1} checks, not 1 (${await checks()} in all, not 2).`);

    await tab.click();
    await soon(page, () => page.evaluate((root) => { const el = document.querySelector(root); return !el || el.getBoundingClientRect().width < 1; }, ROOT),
      'A click on the name Validation in front did not collapse its side: the panel is still wider than 1 px.');
    await undo(page);
    await aSecond();
    assert.equal(await checks(), 2, `An Undo made while the Validation side was collapsed was checked (${await checks()} checks, not 2).`);
    await tab.click();
    const back = await soon(page, async () => {
      const now = await read(page);
      return now.lists.length === 2 && entriesOf(now) === 0 ? now : null;
    }, 'Opening the collapsed Validation side again, after an Undo it did not see, still lists the entries.', 10);
    assertEmpty(back, 'Opened again');
    assert.equal(await checks(), 3, `Opening the side again made ${(await checks()) - 2} checks, not 1 (${await checks()} in all, not 3).`);
    await finish(opened);
  });
});
