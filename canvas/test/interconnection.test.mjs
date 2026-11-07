// The interconnection view: its palette, and an item def, an item inside a part placed in it; a flow drawn between two
// ports, whose written ends are the directed items of their port defs once the item is picked in the panel, and the
// pairings the flow and binding tools refuse; a binding and a typed interface drawn and exported, with the interface
// def's ends checked against the ports; the direction select on an item, which the item's header and the glyphs of the
// ports that carry it follow; and the checks on an interface def and on an item in a port def. The fixture is the fuel
// system in fixtures/interconnection.json, brought in through Import state.

import assert from 'node:assert/strict';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { checked, clickElement, exportText, finish, launch, openCanvas, placeElement, rename, until } from './helpers.mjs';

const FIXTURE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'interconnection.json');
const SAVED = 'v-proof'; // the view the embedded model saves

async function addView(page, kind) {
  const before = await page.locator('#drawing g.frame[data-view]').count();
  await page.selectOption('#new-view-kind', kind);
  await page.click('#new-view');
  await until(page, (count) => document.querySelectorAll('#drawing g.frame[data-view]').length > count, before, 'a new frame appears');
  return page.getAttribute('#drawing g.frame.is-active', 'data-view');
}

/** Deletes the saved general view, so the plane holds one frame and every empty spot is a place in it. */
async function deleteSavedView(page) {
  await page.locator(`#drawing g.frame[data-view="${SAVED}"] rect.tab`).click();
  await until(page, (id) => document.querySelector(`#drawing g.frame[data-view="${id}"]`)?.classList.contains('is-selected'), SAVED, 'the saved view is selected');
  await page.click('#delete-view');
  await until(page, () => document.querySelectorAll('#drawing g.frame[data-view]').length === 1, null, 'one frame is left');
}

/** Brings a state file into the page (opened as a file, the import takes it straight from #import-file). */
async function importState(page, file) {
  await page.setInputFiles('#import-file', file);
  await until(page, () => /^Imported /.test(document.querySelector('#status')?.textContent || ''), null, 'the page says it imported the state');
}

/**
 * Wheel-pans the plane until the element sits in the middle of the open part of the stage, away from the HUD and the
 * zoom controls along the bottom, which otherwise take a click meant for a port drawn under them.
 */
async function lookAt(page, id) {
  const stage = await page.locator('#canvas').boundingBox();
  const box = await page.locator(`g[data-el="${id}"]`).first().boundingBox();
  const panel = await page.locator('#panel').boundingBox();
  const openWidth = panel ? panel.x - stage.x : stage.width;
  await page.mouse.move(stage.x + 200, stage.y + 200);
  await page.mouse.wheel(Math.round(box.x + box.width / 2 - (stage.x + openWidth / 2)), Math.round(box.y + box.height / 2 - (stage.y + stage.height / 2)));
  await until(page, (elId) => {
    const r = document.querySelector(`g[data-el="${elId}"]`).getBoundingClientRect();
    return r.top > 80 && r.bottom < innerHeight - 120;
  }, id, `${id} is in the middle of the screen`);
}

/** Clicks a port's square, never the name beside it. */
async function clickPort(page, id) {
  await page.locator(`g[data-el="${id}"] > .outline`).first().click();
}

/** Arms a relationship tool, clicks the squares of the two ports, and returns the new line's id. */
async function drawBetween(page, tool, a, b) {
  const before = await page.locator('g[data-rel]').count();
  await page.click(`.palette button[data-tool="${tool}"]`);
  await clickPort(page, a);
  await clickPort(page, b);
  await until(page, (count) => document.querySelectorAll('g[data-rel]').length > count, before, `a ${tool} line appears`);
  const ids = await page.$$eval('g[data-rel]', (groups) => groups.map((g) => g.getAttribute('data-rel')));
  const added = ids.filter((id, i) => ids.indexOf(id) === i).slice(-1);
  assert.equal(await page.locator(`g[data-rel="${added[0]}"]`).count(), 1, `drawing a ${tool} added one line`);
  return added[0];
}

/** How many heads a port's glyph has: two for inout, one for in or out, none when the port has no directed items. */
const glyphHeads = (page, id) => page.evaluate((elId) => {
  const glyph = document.querySelector(`g[data-el="${elId}"] path.glyph`);
  return glyph ? (glyph.getAttribute('d').match(/M/g) || []).length - 1 : 0;
}, id);

describe('interconnection view', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('a new interconnection view offers its tools, and takes an item def and an item inside a part', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    const view = await addView(page, 'InterconnectionView');
    assert.match(await page.textContent(`#drawing g.frame[data-view="${view}"] rect.tab title`), /^view view\d+, an interconnection view\./, 'the tab says what the view is, with the article its label takes');
    const tools = await page.$$eval('.palette button[data-tool]:not([data-tool="Note"])', (buttons) => buttons.map((b) => b.getAttribute('data-tool')));
    for (const tool of ['PartDefinition', 'PartUsage', 'PortUsage', 'ItemDefinition', 'ItemUsage', 'InterfaceDefinition', 'ConnectionUsage', 'InterfaceUsage', 'FlowConnectionUsage', 'BindingConnectorAsUsage', 'FeatureTyping']) {
      assert.ok(tools.includes(tool), `the palette offers ${tool}: ${JSON.stringify(tools)}`);
    }
    assert.match(await page.getAttribute('.palette button[data-tool="FlowConnectionUsage"]', 'title'), /flow/i, 'the flow tool says what it is');
    await deleteSavedView(page);
    const itemDef = await placeElement(page, 'ItemDefinition');
    assert.equal(await page.getAttribute(`g[data-el="${itemDef}"]`, 'data-kind'), 'ItemDefinition');
    assert.equal(await page.locator(`#drawing g.frame[data-view="${view}"] g[data-el="${itemDef}"]`).count(), 1, 'the item def is drawn in the interconnection view');
    assert.ok(await page.locator('#f-abstract').isVisible(), 'an item def can be abstract');
    await rename(page, itemDef, 'Fuel');
    const part = await placeElement(page, 'PartUsage');
    await rename(page, part, 'pump');
    const box = await page.locator(`g[data-el="${part}"]`).boundingBox();
    const item = await placeElement(page, 'ItemUsage', { x: box.x + box.width / 2, y: box.y + box.height / 2 });
    assert.equal(await page.locator(`g[data-el="${part}"] g[data-el="${item}"][data-kind="ItemUsage"]`).count(), 1, 'the item is drawn inside the part');
    assert.match(await page.textContent('#f-kind'), /^item item1 in pump$/);
    assert.ok(await page.locator('#f-direction').isVisible(), 'the panel offers the item\'s direction');
    assert.equal(await page.inputValue('#f-direction'), '', 'an item in a part starts undirected');
    assert.equal(await page.textContent(`g[data-el="${item}"] text.kw`), '«item»', 'the header reads «item»');
    const text = await exportText(page);
    assert.match(text, /\bitem def Fuel;/, 'the export declares the item def');
    assert.match(text, /part pump \{\s+item item1;\s+\}/, 'the export declares the item inside the part');
    await finish(ctx);
  });

  test('a flow between two ports is written through the directed items of their port defs once its item is picked, and the tools refuse a part and a mismatched binding', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await importState(page, FIXTURE);
    assert.ok(await page.locator('#problems').isHidden(), 'the fixture has no problems');
    await lookAt(page, 'System.pump');
    // The return line: the pump's inlet is a conjugated FuelPort, so its back item goes out of it and into the tank's outlet.
    const flow = await drawBetween(page, 'FlowConnectionUsage', 'System.pump.fuelIn', 'System.tank.fuelOut');
    assert.equal(await page.getAttribute(`g[data-rel="${flow}"]`, 'data-kind'), 'FlowConnectionUsage');
    assert.ok(await page.locator('#f-item').isVisible(), 'the panel offers the item that flows');
    await checked(page);
    assert.match((await page.locator('#problems-list li').allTextContents()).join(' '), /needs an item/, 'until the item is picked, the flow has a problem');
    await page.selectOption('#f-item', 'Fuel');
    await until(page, () => document.querySelectorAll('#problems-list li').length === 0, null, 'the problem goes once the item is picked');
    await page.fill('#f-name', 'back');
    await until(page, (id) => document.querySelector(`g[data-rel="${id}"]`)?.textContent.includes('back of Fuel'), flow, 'the line is labelled with the name and the item');
    // A part can't start a flow: refused on the first click, nothing drawn.
    const lines = await page.locator('g[data-rel]').count();
    await page.click('.palette button[data-tool="FlowConnectionUsage"]');
    await clickElement(page, 'System.pump');
    assert.match(await page.textContent('#status'), /part pump in System is a part/);
    assert.equal(await page.locator('g[data-rel]').count(), lines, 'nothing was drawn');
    await page.keyboard.press('Escape');
    // Two ports of different port defs can't be bound: refused on the second click.
    await page.click('.palette button[data-tool="BindingConnectorAsUsage"]');
    await clickPort(page, 'System.pump.fuelOut');
    await clickPort(page, 'System.pump.ctrl');
    assert.match(await page.textContent('#status'), /one definition.*FuelPort.*CtrlPort/);
    assert.equal(await page.locator('g[data-rel]').count(), lines, 'still nothing was drawn');
    await page.keyboard.press('Escape');
    const text = await exportText(page);
    assert.match(text, /flow back of Fuel from pump\.fuelIn\.back to tank\.fuelOut\.back;/, 'the flow names the items its ports carry');
    assert.match(text, /flow command of Signal from controller\.ctrl\.cmd to pump\.ctrl\.cmd;/, 'the fixture\'s flow is written the same way');
    await finish(ctx);
  });

  test('a binding and a typed interface are drawn between ports and written as bind and interface statements', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await importState(page, FIXTURE);
    await lookAt(page, 'System.pump');
    const binding = await drawBetween(page, 'BindingConnectorAsUsage', 'System.tank.fuelOut', 'System.pump.fuelIn');
    assert.equal(await page.getAttribute(`g[data-rel="${binding}"]`, 'data-kind'), 'BindingConnectorAsUsage');
    assert.equal((await page.textContent(`g[data-rel="${binding}"]`)).trim(), '=', 'a binding is labelled =');
    await page.fill('#f-name', 'same');
    const iface = await drawBetween(page, 'InterfaceUsage', 'System.controller.ctrl', 'System.pump.ctrl');
    assert.ok(await page.locator('#f-interfaceDef').isVisible(), 'the panel offers the interface def');
    await checked(page);
    assert.equal(await page.locator('#problems-list li').count(), 0, 'an untyped interface is fine');
    await page.selectOption('#f-interfaceDef', 'FuelLine');
    await until(page, () => /matches no end of interface def FuelLine/.test(document.querySelector('#problems-list')?.textContent || ''), null, 'the wrong interface def is a problem that names the end');
    await page.selectOption('#f-interfaceDef', 'CtrlLink');
    await until(page, () => document.querySelectorAll('#problems-list li').length === 0, null, 'the right interface def clears it');
    await page.fill('#f-name', 'cmdLink');
    await until(page, (id) => document.querySelector(`g[data-rel="${id}"]`)?.textContent.includes('«interface» cmdLink : CtrlLink'), iface, 'the line is labelled with the keyword, the name and the def');
    const text = await exportText(page);
    assert.match(text, /binding same bind tank\.fuelOut = pump\.fuelIn;/);
    assert.match(text, /interface cmdLink : CtrlLink connect controller\.ctrl to pump\.ctrl;/);
    assert.match(text, /bind pump\.fuelOut = outlet \{/, 'the fixture\'s unnamed binding keeps its doc body');
    assert.match(text, /interface def CtrlLink \{\s+doc[^]*?end port c : ~CtrlPort;\s+end port p : CtrlPort;\s+\}/, 'the interface def\'s ports are its ends');
    await finish(ctx);
  });

  test('the direction of an item is set in the panel, and its header and the glyphs of the ports that carry it follow', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await importState(page, FIXTURE);
    assert.equal(await glyphHeads(page, 'System.tank.fuelOut'), 2, 'a FuelPort carries fuel out and back: inout');
    assert.equal(await glyphHeads(page, 'System.pump.fuelIn'), 2, 'so does its conjugate');
    assert.equal(await glyphHeads(page, 'System.pump.ctrl'), 1, 'a CtrlPort only takes commands: one head');
    assert.equal(await glyphHeads(page, 'System.controller.ctrl'), 1, 'and its conjugate only sends them');
    await lookAt(page, 'FuelPort');
    await clickElement(page, 'FuelPort.supply');
    await until(page, () => document.querySelector('g[data-el="FuelPort.supply"]')?.classList.contains('is-selected'), null, 'the item is selected');
    assert.equal(await page.inputValue('#f-direction'), 'out');
    assert.equal(await page.textContent('g[data-el="FuelPort.supply"] text.kw'), '«out item»');
    await page.selectOption('#f-direction', 'in');
    await until(page, () => document.querySelector('g[data-el="FuelPort.supply"] text.kw')?.textContent === '«in item»', null, 'the header follows the direction');
    assert.equal(await glyphHeads(page, 'System.tank.fuelOut'), 1, 'with both items coming in, the port shows one head');
    assert.equal(await glyphHeads(page, 'System.pump.fuelIn'), 1, 'and so does its conjugate, the other way');
    assert.match(await page.getAttribute('#undo', 'title'), /Set the direction of item supply in FuelPort to in/);
    assert.match(await exportText(page), /port def FuelPort \{\s+doc[^]*?in item supply : Fuel;\s+in item back : Fuel;\s+\}/);
    await finish(ctx);
  });

  test('an interface def with fewer than two ports and an undirected item on a port def are problems, and the export writes end ports and directed items', async () => {
    const ctx = await openCanvas(browser);
    const { page } = ctx;
    await addView(page, 'InterconnectionView');
    await deleteSavedView(page);
    const idef = await placeElement(page, 'InterfaceDefinition');
    await rename(page, idef, 'Link');
    await checked(page);
    assert.match((await page.locator('#problems-list li').allTextContents()).join(' '), /needs two ports/, 'an interface def without ports is a problem');
    let box = await page.locator(`g[data-el="${idef}"]`).boundingBox();
    const a = await placeElement(page, 'PortUsage', { x: box.x + 12, y: box.y + box.height / 2 });
    assert.equal(await page.locator(`g[data-el="${idef}"] g[data-el="${a}"][data-kind="PortUsage"]`).count(), 1, 'the port sits on the interface def');
    await checked(page);
    assert.ok(await page.locator(`g[data-el="${idef}"].is-problem`).count() >= 1, 'one port is still a problem');
    box = await page.locator(`g[data-el="${idef}"] > .outline`).boundingBox();
    await placeElement(page, 'PortUsage', { x: box.x + box.width - 12, y: box.y + box.height / 2 });
    await until(page, (id) => !document.querySelector(`g[data-el="${id}"]`)?.classList.contains('is-problem'), idef, 'two ports clear it');
    const pdef = await placeElement(page, 'PortDefinition');
    await rename(page, pdef, 'P');
    box = await page.locator(`g[data-el="${pdef}"] > .outline`).boundingBox();
    const item = await placeElement(page, 'ItemUsage', { x: box.x + box.width / 2, y: box.y + box.height - 10 });
    assert.equal(await page.locator(`g[data-el="${pdef}"] g[data-el="${item}"]`).count(), 1, 'the item is drawn inside the port def');
    assert.equal(await page.inputValue('#f-direction'), 'out', 'an item placed on a port def starts out going out');
    await checked(page);
    assert.equal(await page.locator('#problems-list li').count(), 0, 'so it has no problem');
    await page.selectOption('#f-direction', { value: '' });
    await until(page, () => /needs a direction/.test(document.querySelector('#problems-list')?.textContent || ''), null, 'an undirected item on a port def is a problem');
    assert.ok(await page.locator(`g[data-el="${item}"].is-problem`).count() >= 1, 'the item is marked');
    await page.selectOption('#f-direction', 'in');
    await until(page, () => document.querySelectorAll('#problems-list li').length === 0, null, 'a direction clears it');
    const text = await exportText(page);
    assert.match(text, /interface def Link \{\s+end port port1;\s+end port port2;\s+\}/, 'the interface def\'s ports are written as its ends');
    assert.match(text, /port def P \{\s+in item item1;\s+\}/, 'the item on the port def is written with its direction');
    await finish(ctx);
  });
});
