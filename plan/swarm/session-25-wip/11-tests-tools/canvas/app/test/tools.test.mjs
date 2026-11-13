// The tools at work on the planes, and the toasts that say why a rule refused a click. Written in step 11, before what
// it checks (plan/swarm/step-11.md, section 4, the table headed canvas/app/test/tools.test.mjs).
//
// Every test opens a file through the file input and reads only what the page shows: the Tools view's buttons, a
// plane's nodes and lines and the attributes of its root, the Explorer's rows, Details's fields, the bar's buttons, the
// toasts, and the files the bar's Save downloads. None reads the application's own objects. `M.validate` is asked here
// in Node, on the model of the file the page saved.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { after, afterEach, before, describe, test } from 'node:test';
import {
  BROWSER_FRAMES, boxOf, byTestId, closePages, cssColor, EXAMPLE, FIXTURES, fieldIn, finish, frame, groundPoint, headerOf, launch, lib,
  modelOf, near, drawn, openIn, planeOf, rowIn, selectBox, showSide, showView, soon, stateFileAt, TEAL, TESTIDS, undo, until, WAIT, wordsOf,
} from './helpers.mjs';
import path from 'node:path';

const fixture = (name) => path.join(FIXTURES, `${name}.json`);
const GENERAL = modelOf(EXAMPLE).views.find((v) => v.id === 'v-proof');

// ---- The helpers of this file.

/** The tools' list holds the button of a kind: its label is the kind's. */
const labelOf = (kind) => (lib.KINDS[kind] ?? lib.RELATIONSHIPS[kind]).label;
const toolButton = (page, kind) => page.locator(`${byTestId(TESTIDS.tools)} button[data-testid="tool"][data-tool=${JSON.stringify(kind)}]`);
const pressedTools = (page) => page.evaluate(() => [...document.querySelectorAll('button[data-testid="tool"][aria-pressed="true"]')].map((b) => b.getAttribute('data-tool')));

/** Shows the Tools panel and clicks the tool's button, then waits until the button is pressed. */
async function arm(page, kind) {
  await showSide(page, 'Tools');
  const button = toolButton(page, kind);
  await soon(page, async () => (await button.count()) === 1,
    `The Tools view has no ${labelOf(kind)} tool (data-testid "tool", data-tool "${kind}") to click.`);
  await button.click();
  await soon(page, async () => (await button.getAttribute('aria-pressed')) === 'true', `A click on the ${labelOf(kind)} tool did not take it in hand: its button is not pressed.`);
}

/** A click inside a box, where its header is blank, or at the middle of a node less than 40 units wide. */
async function clickIn(page, view, id) {
  const box = await boxOf(page, view.id, id);
  assert.ok(box, `The plane of ${view.name} draws no node for ${id}.`);
  const at = box.w < 40 ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : headerOf(box);
  await page.mouse.click(at.x, at.y);
  await frame(page);
}

/** A click on bare ground. */
async function clickGround(page, view) {
  const at = await groundPoint(page, view);
  await page.mouse.click(at.x, at.y);
  await frame(page);
}

/** Waits for a node (`type` 'el') or a line (`type` 'rel') the plane did not draw before, and returns its id. */
async function made(page, view, before, type) {
  const key = type === 'el' ? 'nodes' : 'edges';
  return soon(page, async () => (await drawn(page, view.id))[key].find((id) => !before[key].includes(id)) ?? null,
    `The plane of ${view.name} draws no new ${type === 'el' ? 'node' : 'line'} after the click.`);
}

/** The toast's text, once it is there. */
const toast = (page) => soon(page, async () => (await page.locator(byTestId(TESTIDS.toast)).count()) > 0 ? page.locator(byTestId(TESTIDS.toast)).first().textContent() : null,
  'The page shows no toast (data-testid "toast").');
const toasts = (page) => page.locator(byTestId(TESTIDS.toast)).count();
const noToast = (page, what) => soon(page, async () => (await toasts(page)) === 0, `A toast is still shown ${what}.`);

/** Whether one of the bar's buttons is disabled. */
const disabled = (page, name) => page.evaluate((selector) => {
  const el = document.querySelector(selector);
  return el ? el.disabled || el.getAttribute('aria-disabled') === 'true' : null;
}, byTestId(TESTIDS[name]));

/** The attribute of a plane's root. */
const rootAttr = (page, view, name) => page.locator(planeOf(view.id)).getAttribute(name);

/** What a node of the plane has computed, or null. */
const styleOf = (page, selector, props) => page.evaluate(([sel, names]) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const style = getComputedStyle(el);
  return Object.fromEntries(names.map((n) => [n, style[n]]));
}, [selector, props]);

/** Whether the node or the line of a plane has the class `selected`. */
const isSelected = (page, view, type, id) => page.evaluate(([plane, cls, name]) => {
  const el = document.querySelector(`${plane} ${cls}[data-id=${JSON.stringify(name)}]`);
  return el ? el.classList.contains('selected') : null;
}, [planeOf(view.id), type === 'el' ? '.react-flow__node' : '.react-flow__edge', id]);

/** The bar's Save, and the state file it downloads, as JSON. */
async function saved(page) {
  const save = page.locator(byTestId(TESTIDS.save));
  assert.ok(await save.isEnabled(), 'Save is disabled after the tool made something: the page holds no change to save.');
  const downloading = page.waitForEvent('download', { timeout: WAIT });
  await save.click({ timeout: WAIT });
  const download = await downloading.catch(() => null);
  assert.ok(download, `A click on Save downloaded no file in ${WAIT} ms.`);
  return JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
}

/** What `M.validate` says of a state file's model, as sorted sentences. */
const problemsOf = (model) => lib.validate(lib.normalize(model)).map((p) => p.message).sort();

/** The words of the step Undo would take back, or a failure saying there is none. */
async function undoWords(page) {
  return soon(page, () => wordsOf(page, 'undo'), 'The bar\'s Undo names no step: nothing was done.');
}

// ---- The table of uses (step-11.md, section 4), written once as data.

const USES = {
  v_proof: [
    { tool: 'PartDefinition', at: 'ground', words: 'Added part def PartDef1' },
    { tool: 'PortDefinition', at: 'ground', words: 'Added port def PortDef1' },
    { tool: 'PartUsage', at: 'Host', words: 'Added part part1 in Host' },
    { tool: 'PortUsage', at: 'App', words: 'Added port port1 in App' },
    { tool: 'Specialization', from: 'App', to: 'Page', words: 'Drew App specializes Page' },
    { tool: 'FeatureTyping', from: 'Page.hosts', to: 'App', words: 'Drew hosts defined by App', replaces: 't-hosts' },
    { tool: 'ConnectionUsage', from: 'Page.hosts', to: 'Page.app', words: 'Drew connection hosts to app' },
  ],
  v_ic: [
    { tool: 'PartDefinition', at: 'ground', words: 'Added part def PartDef1' },
    { tool: 'PortDefinition', at: 'ground', words: 'Added port def PortDef1' },
    { tool: 'PartUsage', at: 'Tank', words: 'Added part part1 in Tank' },
    { tool: 'PortUsage', at: 'Tank', words: 'Added port port1 in Tank' },
    { tool: 'ItemDefinition', at: 'ground', words: 'Added item def ItemDef1' },
    { tool: 'ItemUsage', at: 'CtrlPort', words: 'Added item item1 in CtrlPort' },
    { tool: 'InterfaceDefinition', at: 'ground', words: 'Added interface def InterfaceDef1', adds: ['interface def InterfaceDef1 needs two ports on its border, its ends; it has none.'] },
    { tool: 'ConnectionUsage', from: 'System.tank', to: 'System.pump', words: 'Drew connection tank to pump' },
    { tool: 'InterfaceUsage', from: 'System.controller.ctrl', to: 'System.pump.ctrl', words: 'Drew interface ctrl to ctrl' },
    { tool: 'FlowConnectionUsage', from: 'System.tank.fuelOut', to: 'System.pump.fuelIn', words: 'Drew flow fuelOut to fuelIn', adds: ['The flow fuelOut to fuelIn needs an item: pick in the panel what flows through the ports.'] },
    { tool: 'BindingConnectorAsUsage', from: 'System.pump.ctrl', to: 'System.controller.ctrl', words: 'Drew binding ctrl to ctrl' },
    { tool: 'FeatureTyping', from: 'FuelPort.back', to: 'Signal', words: 'Drew back defined by Signal' },
  ],
  v_release: [
    { tool: 'ActionDefinition', at: 'ground', words: 'Added action def ActionDef1' },
    { tool: 'ActionUsage', at: 'Release', words: 'Added action action1 in Release' },
    { tool: 'ParameterUsage', at: 'Release.test', words: 'Added parameter param1 in test' },
    { tool: 'ForkNode', at: 'Release', words: 'Added fork fork1 in Release' },
    { tool: 'JoinNode', at: 'Release', words: 'Added join join1 in Release' },
    { tool: 'DecisionNode', at: 'Release', words: 'Added decision decision1 in Release' },
    { tool: 'MergeNode', at: 'Release', words: 'Added merge merge1 in Release' },
    { tool: 'StartNode', at: 'Release.test', words: 'Added start in test' },
    { tool: 'DoneNode', at: 'Release.lint', words: 'Added done in lint' },
    { tool: 'SuccessionAsUsage', from: 'Release.compile', to: 'Release.test', words: 'Drew succession compile to test' },
    // The flow needs a parameter that goes in on another action; the fixture has none, so this use makes one first.
    { tool: 'FlowConnectionUsage', from: 'Release.test.passed', to: 'the new parameter', before: { tool: 'ParameterUsage', at: 'Release.publish', words: 'Added parameter param1 in publish' }, words: 'Drew flow passed to param1', undos: 2 },
    { tool: 'BindingConnectorAsUsage', from: 'Release.source', to: 'Release.bundle', words: 'Drew binding source to bundle' },
    { tool: 'FeatureTyping', from: 'Release.compile', to: 'Release', words: 'Drew compile defined by Release' },
  ],
  v_host: [
    { tool: 'StateDefinition', at: 'ground', words: 'Added state def StateDef1' },
    { tool: 'StateUsage', at: 'HostLifecycle', words: 'Added state state1 in HostLifecycle' },
    { tool: 'InitialNode', at: 'HostLifecycle.loading', words: 'Added initial node in loading', adds: ['The initial node in loading needs a transition to the first state.'] },
    { tool: 'ActionUsage', at: 'HostLifecycle.loading', words: 'Added action action1 in loading' },
    { tool: 'DoneNode', at: 'HostLifecycle.loading', words: 'Added done in loading' },
    { tool: 'TransitionUsage', from: 'HostLifecycle.idle', to: 'HostLifecycle.running', words: 'Drew transition idle to running' },
    { tool: 'FeatureTyping', from: 'HostLifecycle.idle', to: 'HostLifecycle', words: 'Drew idle defined by HostLifecycle' },
  ],
};

/** The four graph view kinds: the file, the view, its kind, and its uses. */
const WALKS = [
  { name: 'a general view\'s', file: EXAMPLE, view: 'v-proof', kind: 'GeneralView', uses: USES.v_proof },
  { name: 'an interconnection view\'s', file: fixture('interconnection'), view: 'v-ic', kind: 'InterconnectionView', uses: USES.v_ic },
  { name: 'an action flow view\'s', file: fixture('behavior-actions'), view: 'v-release', kind: 'ActionFlowView', uses: USES.v_release },
  { name: 'a state transition view\'s', file: fixture('behavior-states'), view: 'v-host', kind: 'StateTransitionView', uses: USES.v_host },
];

/** Whether a use makes a line (it has two ends) or an element. */
const typeOf = (use) => (use.from ? 'rel' : 'el');

/** Takes a tool in hand and makes what the use says: one click for an element, two for a line. Returns what was made. */
async function carryOut(page, view, use) {
  const before = await drawn(page, view.id);
  await arm(page, use.tool);
  if (use.from) {
    await clickIn(page, view, use.from);
    await soon(page, async () => (await rootAttr(page, view, 'data-first')) === use.from,
      `A click on ${use.from} with the ${labelOf(use.tool)} tool in hand took no first end: the plane's root has no data-first "${use.from}".`);
    await clickIn(page, view, use.to);
  } else if (use.at === 'ground') {
    await clickGround(page, view);
  } else {
    await clickIn(page, view, use.at);
  }
  const id = await made(page, view, before, typeOf(use));
  return { id, before };
}

/** Every tool of a view kind's row is used once, and each use is checked. */
async function walk(browser, { file, view: viewId, kind, uses }) {
  const view = modelOf(file).views.find((v) => v.id === viewId);
  const row = [...lib.VIEW_KINDS[kind].tools].filter((t) => t !== '|');
  assert.deepEqual(uses.map((u) => u.tool), row, `the uses are the tools of the ${kind} row, in its order`);
  const opened = await openIn(browser, stateFileAt(file));
  const { page } = opened;
  await showView(page, view);
  const problems = problemsOf(modelOf(file));
  for (const use of uses) {
    const what = `The ${labelOf(use.tool)} tool in ${view.name}`;
    let step = null;
    if (use.before) {
      step = await carryOut(page, view, use.before);
      assert.equal(await wordsOf(page, 'undo'), use.before.words, `${what}: the tool made before it did not make "${use.before.words}".`);
    }
    const target = use.to !== 'the new parameter';
    const done = await carryOut(page, view, target ? use : { ...use, to: step.id });
    const { id, before } = done;
    assert.match(id, typeOf(use) === 'el' ? /^e[0-9a-z]+$/ : /^r[0-9a-z]+$/, `${what} made ${id}, which is no new id.`);
    await showSide(page, 'Tools');
    assert.deepEqual(await pressedTools(page), [], `${what} made something, and its button is still pressed: the tool is not put down.`);
    await soon(page, async () => (await isSelected(page, view, typeOf(use), id)) === true, `${what} made ${id}, and its ${typeOf(use) === 'el' ? 'node' : 'line'} has no class "selected": what a tool makes is not picked.`);
    if (use.replaces) {
      const after = await drawn(page, view.id);
      assert.ok(before.edges.includes(use.replaces) && !after.edges.includes(use.replaces), `${what}: the line ${use.replaces} is still drawn, though a usage has one definition.`);
    }
    assert.equal(await undoWords(page), use.words, `${what}: Undo names "${await wordsOf(page, 'undo')}", not "${use.words}".`);
    await showSide(page, 'Explorer');
    await soon(page, async () => (await rowIn(page, typeOf(use), id).count()) === 1, `The Explorer shows no row for the ${typeOf(use) === 'el' ? 'element' : 'line'} ${id} the ${labelOf(use.tool)} tool made (data-row "${typeOf(use)}:${id}").`);
    const state = await saved(page);
    assert.deepEqual(problemsOf(state.model), [...problems, ...(use.adds ?? [])].sort(), `${what}: what M.validate says of the saved model is not the file's plus ${JSON.stringify(use.adds ?? [])}.`);

    for (let i = 0; i < (use.undos ?? 1); i++) await undo(page);
    const gone = use.undos === 2 ? [id, step.id] : [id];
    await soon(page, async () => { const now = await drawn(page, view.id); return gone.every((g) => !now.nodes.includes(g) && !now.edges.includes(g)); },
      `Undo did not take ${gone.join(' and ')} off the plane of ${view.name}.`);
    for (const g of gone) {
      const type = g === id ? typeOf(use) : 'el';
      await soon(page, async () => (await rowIn(page, type, g).count()) === 0, `Undo left the row of ${g} in the Explorer.`);
    }
    if (use.replaces) {
      await soon(page, async () => (await drawn(page, view.id)).edges.includes(use.replaces), `Undo did not bring the line ${use.replaces} back onto the plane.`);
    }
  }
  await finish(opened);
}

describe('the tools at work on the planes', () => {
  let browser;
  before(async () => { browser = await launch(); });
  afterEach(() => closePages(browser));
  after(async () => { await browser?.close(); });

  const EXAMPLE_FILE = stateFileAt(EXAMPLE);
  const openExample = async () => {
    const opened = await openIn(browser, EXAMPLE_FILE);
    await showView(opened.page, GENERAL);
    return opened;
  };

  for (const w of WALKS) {
    test(`every tool of ${w.name} row is used once: it appears on the plane and in the Explorer, validates, and Undo takes it back`, async () => {
      await walk(browser, w);
    });
  }

  test('a port clicked onto the empty ground is refused, and the toast says where it can go', async () => {
    const opened = await openExample();
    const { page } = opened;
    const was = await drawn(page, GENERAL.id);
    await arm(page, 'PortUsage');
    await clickGround(page, GENERAL);
    assert.equal(await toast(page), 'Click a part def or a part in this view to put a port on its border.');
    assert.deepEqual((await drawn(page, GENERAL.id)).nodes, was.nodes, 'The refused click drew a new node.');
    assert.equal(await disabled(page, 'undo'), true, 'Undo is enabled after a refused click: something was written.');
    assert.deepEqual(await pressedTools(page), ['PortUsage'], 'After the refusal the port tool is not the one in hand.');
    await finish(opened);
  });

  test('a specialization from a part def to a port def is refused in the library\'s sentence', async () => {
    const opened = await openExample();
    const { page } = opened;
    const model = modelOf(EXAMPLE);
    const byId = (id) => model.elements.find((e) => e.id === id);
    const sentence = `${lib.RELATIONSHIPS.Specialization.ends(model, byId('Host'), byId('StrongholdApp'), lib.idsOf(model))} Escape puts the tool down.`;
    assert.equal(sentence, 'part def Host can only specialize another part def. Escape puts the tool down.');
    const was = await drawn(page, GENERAL.id);
    await arm(page, 'Specialization');
    await clickIn(page, GENERAL, 'Host');
    await soon(page, async () => (await rootAttr(page, GENERAL, 'data-first')) === 'Host', 'A click on Host with the specializes tool in hand took no first end: the plane\'s root has no data-first "Host".');
    await clickIn(page, GENERAL, 'StrongholdApp');
    assert.equal(await toast(page), sentence);
    assert.deepEqual((await drawn(page, GENERAL.id)).edges, was.edges, 'The refused click drew a new line.');
    assert.equal(await disabled(page, 'undo'), true, 'Undo is enabled after a refused click: something was written.');
    assert.deepEqual(await pressedTools(page), ['Specialization'], 'After the refusal the specializes tool is not the one in hand.');
    assert.equal(await rootAttr(page, GENERAL, 'data-first'), 'Host', 'After the refusal the first end is not Host any more.');
    await clickIn(page, GENERAL, 'Page');
    await made(page, GENERAL, was, 'rel');
    await noToast(page, 'after the line was drawn');
    await finish(opened);
  });

  test('Escape puts the tool down', async () => {
    const opened = await openExample();
    const { page } = opened;
    const was = await drawn(page, GENERAL.id);
    await arm(page, 'PortUsage');
    await clickGround(page, GENERAL);
    await toast(page);
    await page.keyboard.press('Escape');
    await soon(page, async () => (await pressedTools(page)).length === 0, 'Escape did not put the tool down: its button is still pressed.');
    await soon(page, async () => (await rootAttr(page, GENERAL, 'data-tool')) === null, 'Escape did not put the tool down: the plane\'s root still has data-tool.');
    await noToast(page, 'after Escape');
    await clickIn(page, GENERAL, 'Host');
    await soon(page, async () => (await boxOf(page, GENERAL.id, 'Host')).selected, 'A click in Host with no tool in hand does not select it.');
    assert.deepEqual((await drawn(page, GENERAL.id)).nodes, was.nodes, 'A click with the tool put down drew a new node.');
    await finish(opened);
  });

  test('Escape in a text field of Details is the field\'s, and the tool stays in hand', async () => {
    const opened = await openExample();
    const { page } = opened;
    await selectBox(page, GENERAL, 'Host');
    await arm(page, 'PartDefinition');
    const name = fieldIn(page, 'name');
    await soon(page, async () => (await name.count()) === 1, 'Details shows no name field for Host (data-testid "field-name").');
    await name.click();
    await page.keyboard.press('Escape');
    await frame(page);
    assert.deepEqual(await pressedTools(page), ['PartDefinition'], 'Escape in the name field of Details put the tool down: the key is the field\'s.');
    await page.locator(`${byTestId(TESTIDS.tools)} .grasp-side-title`).click();
    await page.keyboard.press('Escape');
    await soon(page, async () => (await pressedTools(page)).length === 0, 'Escape with the focus out of the text field did not put the tool down.');
    await finish(opened);
  });

  test('while a tool is in hand the plane shows a crosshair, and a click picks nothing by itself', async () => {
    const opened = await openExample();
    const { page } = opened;
    const pane = `${planeOf(GENERAL.id)} .react-flow__pane`;
    const node = `${planeOf(GENERAL.id)} .react-flow__node[data-id="Host"]`;
    assert.equal(await rootAttr(page, GENERAL, 'data-tool'), null, 'The plane\'s root has data-tool before any tool is in hand.');
    await arm(page, 'Specialization');
    await soon(page, async () => (await rootAttr(page, GENERAL, 'data-tool')) === 'Specialization', 'With the specializes tool in hand the plane\'s root has no data-tool "Specialization".');
    await soon(page, async () => (await styleOf(page, pane, ['cursor']))?.cursor === 'crosshair', 'With a tool in hand the cursor over the ground of the plane is not a crosshair.');
    assert.equal((await styleOf(page, node, ['cursor'])).cursor, 'crosshair', 'With a tool in hand the cursor over Host is not a crosshair.');
    await clickIn(page, GENERAL, 'Host');
    await soon(page, async () => (await rootAttr(page, GENERAL, 'data-first')) === 'Host', 'A click on Host with the specializes tool in hand left the plane\'s root with no data-first "Host".');
    assert.equal(await isSelected(page, GENERAL, 'el', 'Host'), false, 'A click with a tool in hand selected Host: a click picks nothing by itself.');
    const teal = await cssColor(page, TEAL);
    const outline = await styleOf(page, node, ['outlineStyle', 'outlineWidth', 'outlineColor']);
    assert.equal(outline.outlineStyle, 'dashed', 'The first end Host has no dashed outline.');
    assert.equal(outline.outlineWidth, '2px', 'The first end Host\'s outline is not 2 px wide.');
    assert.equal(outline.outlineColor, teal, 'The first end Host\'s outline is not teal.');
    assert.equal(await page.locator(byTestId('tool-hint')).textContent(), 'Now click the element it specializes.');
    await page.keyboard.press('Escape');
    await soon(page, async () => (await rootAttr(page, GENERAL, 'data-tool')) === null && (await rootAttr(page, GENERAL, 'data-first')) === null, 'After Escape the plane\'s root still has data-tool or data-first.');
    assert.notEqual((await styleOf(page, node, ['outlineStyle'])).outlineStyle, 'dashed', 'After Escape Host still has its dashed outline.');
    assert.notEqual((await styleOf(page, pane, ['cursor'])).cursor, 'crosshair', 'After Escape the cursor over the ground is still a crosshair.');
    await finish(opened);
  });

  test('a click on the ground puts a relationship tool down, and says that nothing was drawn', async () => {
    const opened = await openExample();
    const { page } = opened;
    await arm(page, 'ConnectionUsage');
    await clickIn(page, GENERAL, 'Page.hosts');
    await soon(page, async () => (await rootAttr(page, GENERAL, 'data-first')) === 'Page.hosts', 'A click on Page.hosts with the connection tool in hand took no first end.');
    await clickGround(page, GENERAL);
    assert.equal(await toast(page), 'Put down: nothing was drawn.');
    assert.deepEqual(await pressedTools(page), [], 'A click on the ground left the connection tool in hand.');
    assert.equal(await rootAttr(page, GENERAL, 'data-first'), null, 'A click on the ground left the plane\'s root with a data-first.');
    assert.notEqual(await page.locator(`${byTestId(TESTIDS.details)} .grasp-details`).getAttribute('data-picked'), `view:${GENERAL.id}`, 'The click on the ground, with a tool in hand, picked the view.');
    await arm(page, 'ConnectionUsage');
    await noToast(page, 'when another tool was armed');
    await clickGround(page, GENERAL);
    await soon(page, async () => (await pressedTools(page)).length === 0, 'A click on the ground with no first end left the tool in hand.');
    assert.equal(await toasts(page), 0, 'A click on the ground with no first end said something: it had drawn nothing to say so of.');
    await finish(opened);
  });

  test('a drag with a tool in hand still moves the box, and the tool stays in hand', async () => {
    const opened = await openExample();
    const { page } = opened;
    const was = await drawn(page, GENERAL.id);
    await arm(page, 'PartUsage');
    const host = await boxOf(page, GENERAL.id, 'Host');
    const app = await boxOf(page, GENERAL.id, 'App');
    const start = headerOf(host);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 40, start.y);
    await page.mouse.move(start.x + 80, start.y);
    await page.mouse.up();
    await frame(page);
    const moved = await soon(page, async () => { const now = await boxOf(page, GENERAL.id, 'Host'); return Math.abs(now.x - host.x) > 1 ? now : null; },
      'Host did not move when it was dragged with a tool in hand.');
    const againstApp = (moved.x - (await boxOf(page, GENERAL.id, 'App')).x) - (host.x - app.x);
    assert.ok(near(againstApp, 80, 2), `Host was dragged by 80 px and moved by ${againstApp.toFixed(1)} px against App.`);
    assert.deepEqual((await drawn(page, GENERAL.id)).nodes, was.nodes, 'The end of the drag drew a new node: it was given to the tool as a click.');
    assert.deepEqual(await pressedTools(page), ['PartUsage'], 'The drag put the part tool down.');
    assert.equal(await undoWords(page), 'Moved part def Host');
    await finish(opened);
  });

  test('a toast is one sentence at the bottom of the window, and a new one takes its place', async () => {
    const opened = await openExample();
    const { page } = opened;
    await arm(page, 'PortUsage');
    await clickGround(page, GENERAL);
    await toast(page);
    const first = page.locator(byTestId(TESTIDS.toast)).first();
    assert.ok(await first.evaluate((el) => el.getAttribute('role') === 'status' || !!el.closest('[role="status"]') || !!el.querySelector('[role="status"]')), 'The toast has no role "status".');
    const rect = await first.boundingBox();
    const { width, height } = page.viewportSize();
    assert.ok(near(rect.x + rect.width / 2, width / 2, 2), `The toast is centred at ${(rect.x + rect.width / 2).toFixed(1)} px, not at the window's ${width / 2}.`);
    assert.ok(near(height - (rect.y + rect.height), 24, 2), `The toast's bottom edge is ${(height - rect.y - rect.height).toFixed(1)} px above the window's bottom, not 24.`);
    await arm(page, 'Specialization');
    await noToast(page, 'when another tool was armed');
    await clickIn(page, GENERAL, 'Host');
    await soon(page, async () => (await rootAttr(page, GENERAL, 'data-first')) === 'Host', 'A click on Host with the specializes tool in hand took no first end.');
    await clickIn(page, GENERAL, 'Host');
    assert.equal(await toast(page), 'Pick two different elements. Escape puts the tool down.');
    await frame(page);
    assert.equal(await toasts(page), 1, 'The page shows more than one toast at once.');
    await finish(opened);
  });

  test('a toast leaves by itself after 8 s', async () => {
    const opened = await openExample();
    const { page } = opened;
    await arm(page, 'PortUsage');
    await clickGround(page, GENERAL);
    const clicked = Date.now();
    await toast(page);
    const plane = await page.locator(planeOf(GENERAL.id)).boundingBox();
    await page.mouse.move(plane.x + 4, plane.y + 4);
    await until(page, (selector) => !document.querySelector(selector), byTestId(TESTIDS.toast), 'the toast leaves by itself', 12000);
    const took = Date.now() - clicked;
    assert.ok(took >= 7000 && took <= 12000, `The toast left ${(took / 1000).toFixed(1)} s after the click, not between 7 and 12 s.`);
    assert.deepEqual(await pressedTools(page), ['PortUsage'], 'The toast leaving put the port tool down.');
    await finish(opened);
  });

  test('a view renamed is named so in the Tools view', async () => {
    const opened = await openExample();
    const { page } = opened;
    await clickGround(page, GENERAL);
    const name = fieldIn(page, 'name');
    await soon(page, async () => (await name.count()) === 1, `Details shows no name field for the view ${GENERAL.name}.`);
    await name.fill('overview');
    await page.keyboard.press('Enter');
    await showSide(page, 'Tools');
    const title = page.locator(byTestId('tools-view'));
    await soon(page, async () => (await title.count()) === 1 && (await title.textContent()) === 'overview : GeneralView',
      async () => `The Tools view names the view "${(await title.count()) ? await title.textContent() : 'nothing'}", not "overview : GeneralView".`);
    await finish(opened);
  });
});
