// The commands: the one table that feeds the Tools view and the right-click palettes, what each command makes, and
// the tool in hand (plan/slice-1.md, step 11; plan/swarm/shared.md, "The tool in hand", and plan/swarm/step-11.md).
// It ports the old page's place, freeName and createRel (canvas/src/core/page/tools.js and drawing.js, with the
// additions of interconnection/page.js and behavior/page.js) and asks the model library's rules.
//
// What is where:
// - The table is the library's: a view kind's `tools` row (VIEW_KINDS[kind].tools). toolGroups() reads it.
// - The words are here: TOOL_TITLE (a tool's tooltip), TOOL_HINT (what the Tools view says while a tool is in hand)
//   and BASE_NAME (what a new element is named after), each the old page's, word for word.
// - What a command makes is place() for an element kind and draw() for a relationship kind: one history.edit() each.
// - The tool in hand is a session's Tools (toolsOf): the Tools view arms it, a plane gives it every click, a palette
//   asks it what can be made at a point and gives it the choice, and the toasts say what it has to say.
//
// Nothing here is React's and nothing asks for a browser: the core's tests run it in Node
// (canvas/app/test/commands.test.mjs).

import { LOOK, isDrawn, project } from './adapter';
import type { LineRow, Projection, Rect } from './adapter';
import { selectionOf } from './selection';
import type { Model, ModelElement, ModelRelationship } from './history';
import type { Session } from './session';
import type { Hit, Picked } from './selection';

// ---- The model library, as far as the commands read it.

/**
 * The part of the model library the commands read. It is written out here and read through libOf(), not merged into
 * the global SysMLModelLibrary, so that no two steps' files declare one member of that interface twice.
 */
export interface CommandsLibrary {
  readonly KINDS: Readonly<Record<string, {
    /** The kind in a sentence, and what a tool is called: 'part def'. */
    label: string;
    /** The kinds an element of this kind may own, or false for none. */
    contains: readonly string[] | false;
    /** Whether it sits on its owner's border (a port, a parameter). */
    onBorder?: boolean;
    /** The size a new one gets. */
    size: [number, number];
    /** The fields it holds, each a row of FIELDS. */
    fields: readonly string[];
  }>>;
  readonly RELATIONSHIPS: Readonly<Record<string, {
    /** What a tool is called: 'specializes', 'defined by', 'connection'. */
    label: string;
    fields: readonly string[];
    line: LineRow;
    /** What rules out `a` as the first end: a sentence, or null. */
    first(model: Model, a: ModelElement, ids: Map<string, ModelElement>): string | null;
    /** What rules out the pair as the two ends: a sentence, or null. */
    ends(model: Model, a: ModelElement, b: ModelElement, ids: Map<string, ModelElement>): string | null;
  }>>;
  readonly VIEW_KINDS: Readonly<Record<string, {
    /** 'graph' for the four kinds a plane draws. */
    renderer: string;
    /** 'general view'. */
    label: string;
    /** Element and relationship kinds, with '|' between groups; empty for a grid or a browser view. */
    tools: readonly string[];
  }>>;
  readonly FIELDS: Readonly<Record<string, { type: string; stored?: boolean; values?: readonly unknown[]; fresh?: () => unknown }>>;
  canContain(ownerKind: string, childKind: string): boolean;
  /** The elements an element owns, in the model's order; with null, those at the top of the package. */
  childrenOf(model: Model, id: string | null): ModelElement[];
  /** Every element by its id. */
  idsOf(model: Model): Map<string, ModelElement>;
  textName(el: { kind: string; name?: unknown }): string | null;
  typingOf(model: Model, el: ModelElement): ModelRelationship | null;
  an(label: string, capital?: boolean): string;
  /** 'part def Host', 'port api in hosts', 'start in Release'. */
  describe(model: Model, el: ModelElement): string;
  /** 'App specializes Page', 'connection hosts to app'. */
  describeRel(model: Model, rel: ModelRelationship): string;
  /** 'part, port, item, action, parameter or state': the usages that a definition defines. */
  definable(): string;
  isActionOwner(kind: string): boolean;
  isStateOwner(kind: string): boolean;
}

/** The library a session was opened with, as the commands read it. */
export const libOf = (session: Session): CommandsLibrary => session.lib as unknown as CommandsLibrary;

// ---- The words, which are the old page's (canvas/src/core/page/base.js, interconnection/page.js, behavior/page.js).

/**
 * What a tool's button says on hover, by kind: every element and relationship kind in the row of a view kind that a
 * plane draws. A kind with no entry has no tooltip.
 */
export const TOOL_TITLE: Readonly<Record<string, string>> = {
  PartDefinition: 'A part definition: square corners',
  PortDefinition: 'A port definition',
  PartUsage: 'A part: rounded corners, on the plane or inside a part def or part',
  PortUsage: 'A port: a small square on the border of a part def or part',
  Specialization: 'One definition specializes another, or one part or port subsets another',
  FeatureTyping: 'A usage is defined by a definition: a part by a part def, an action by an action def, a state by a state def',
  ConnectionUsage: 'A connection between two ports or two parts',
  ItemDefinition: 'An item definition: what flows, or what a part holds',
  ItemUsage: 'An item: inside a part def, a part, or a port def, where it has a direction',
  InterfaceDefinition: 'An interface definition: the two ports on its border are its ends',
  InterfaceUsage: 'An interface between two ports, typed by an interface def whose ends they match',
  FlowConnectionUsage: 'A flow of an item from one port, item or parameter to another',
  BindingConnectorAsUsage: 'A binding: two ports, items or parameters that are one and the same',
  ActionDefinition: 'An action definition: square corners, holding its parameters, actions and control nodes',
  ActionUsage: 'An action: rounded corners, on the plane or inside an action def, an action, a part or a state',
  ParameterUsage: 'A parameter: a small box on the border of an action def or an action, pointing its way',
  ForkNode: 'A fork: a bar where the flow splits into paths that run side by side',
  JoinNode: 'A join: a bar where paths that ran side by side meet',
  DecisionNode: 'A decision: a diamond whose outgoing successions carry guards, and one of them else',
  MergeNode: 'A merge: a diamond where alternative paths meet',
  StartNode: 'The start of the flow: a filled circle',
  DoneNode: 'Where the flow or the state machine ends: a bullseye',
  SuccessionAsUsage: 'A succession: what happens next, dashed, from an action or node to the next',
  StateDefinition: 'A state definition: square corners, holding its states, their actions and the initial node',
  StateUsage: 'A state: rounded corners, inside a state def, a state, a part def or a part, or on the plane',
  InitialNode: 'The initial node: where a state begins, with one transition to its first state',
  TransitionUsage: 'A transition from a state to the next: trigger [guard] / effect',
};

/**
 * What the Tools view says while a tool is in hand, by kind: one sentence for an element kind; two for a relationship
 * kind, before its first end is taken and after. `{definable}` stands for the library's definable(). toolHint() reads
 * it, and says what a kind with no entry gets.
 */
export const TOOL_HINT: Readonly<Record<string, string | readonly [string, string]>> = {
  PartDefinition: 'Click where the part def goes.',
  PortDefinition: 'Click where the port def goes.',
  PartUsage: 'Click where the part goes: on the plane, or inside a part def or a part.',
  PortUsage: 'Click a part def or a part to put a port on its border.',
  Specialization: ['Click the element that specializes…', 'Now click the element it specializes.'],
  FeatureTyping: ['Click the {definable} to define…', 'Now click the definition it is defined by.'],
  ConnectionUsage: ['Click one port or part…', 'Now click the other end.'],
  ItemDefinition: 'Click where the item def goes.',
  ItemUsage: 'Click where the item goes: inside a part def, a part, or a port def.',
  InterfaceDefinition: 'Click where the interface def goes, then put two ports on its border.',
  InterfaceUsage: ['Click one port…', 'Now click the port at the other end.'],
  FlowConnectionUsage: ['Click the port, item or parameter the flow starts from…', 'Now click the one it arrives at.'],
  BindingConnectorAsUsage: ['Click one port, item or parameter…', 'Now click the one it is bound to.'],
  ActionDefinition: 'Click where the action def goes.',
  ActionUsage: 'Click where the action goes: on the plane, or inside an action def, an action, a part or a state.',
  ParameterUsage: 'Click an action def or an action to put a parameter on its border.',
  ForkNode: 'Click inside an action def or an action to put the fork there.',
  JoinNode: 'Click inside an action def or an action to put the join there.',
  DecisionNode: 'Click inside an action def or an action to put the decision there.',
  MergeNode: 'Click inside an action def or an action to put the merge there.',
  StartNode: 'Click inside an action def or an action to put its start there.',
  DoneNode: 'Click inside an action def, an action, a state def or a state to put its done there.',
  SuccessionAsUsage: ['Click the action, node or event that comes first…', 'Now click what comes next.'],
  StateDefinition: 'Click where the state def goes.',
  StateUsage: 'Click where the state goes: inside a state def or a state, or on the plane.',
  InitialNode: 'Click inside a state def or a state to put its initial node there.',
  TransitionUsage: ['Click the state the transition leaves…', 'Now click the state it leads to.'],
};

/** What a new element is named after, by kind: PartDef1, part1. A kind with no entry is named after its own name. */
export const BASE_NAME: Readonly<Record<string, string>> = {
  PartDefinition: 'PartDef', PortDefinition: 'PortDef', PartUsage: 'part', PortUsage: 'port',
  ItemDefinition: 'ItemDef', ItemUsage: 'item', InterfaceDefinition: 'InterfaceDef',
  ActionDefinition: 'ActionDef', ActionUsage: 'action', ParameterUsage: 'param', ForkNode: 'fork', JoinNode: 'join',
  DecisionNode: 'decision', MergeNode: 'merge', StartNode: 'start', DoneNode: 'done',
  StateDefinition: 'StateDef', StateUsage: 'state', InitialNode: 'initial',
};

/**
 * Where a control node, a start, a done and an initial node may stand, by kind (the old page's BEHAVIOR_NODE_HOME):
 * inside an action def or an action (the library's isActionOwner), inside a state def or a state (isStateOwner), or
 * inside either. place() refuses one anywhere else, and puts one that fits with its middle at the click's height.
 */
export const NODE_HOME: Readonly<Record<string, 'action' | 'state' | 'either'>> = {
  ForkNode: 'action', JoinNode: 'action', DecisionNode: 'action', MergeNode: 'action', StartNode: 'action', DoneNode: 'either', InitialNode: 'state',
};

/** What a refusal by a relationship's rule ends with, since the tool stays in hand after it. */
export const ESCAPE_HINT = ' Escape puts the tool down.';

// ---- A tool, and the table.

/** A tool of a view kind: an element kind to place, or a relationship kind to draw between two elements. */
export interface Tool {
  /** The kind's name in the model library: 'PartDefinition', 'Specialization'. */
  readonly kind: string;
  /** Whether it places an element or draws a relationship. */
  readonly type: 'el' | 'rel';
  /** What the Tools view and a palette call it: the kind's label in the library, 'part def'. */
  readonly label: string;
}

/**
 * The tools of a view kind, in the groups its row gives: VIEW_KINDS[viewKind].tools cut at each '|', each name made a
 * Tool (type 'el' for a key of KINDS, 'rel' for a key of RELATIONSHIPS; its label the row's own `label`).
 *
 * The answer is empty ([]) for a kind whose row is empty (a grid view, a browser view), for a kind the library does
 * not hold, and for a kind no plane draws (isDrawn() of core/adapter.ts is false: a sequence view and a geometry view
 * list tools in the library, but a tool that nothing can be clicked with is worse than none, so slice 1 lists none;
 * slice 2 draws those kinds and lists them). A name in a row that is neither an element kind nor a relationship kind
 * is left out, and so is a group left empty by that.
 */
export function toolGroups(lib: SysMLModelLibrary, viewKind: string): Tool[][] {
  const l = lib as unknown as CommandsLibrary;
  const row = l.VIEW_KINDS[viewKind];
  if (!row || !isDrawn(lib, viewKind)) return [];
  const groups: Tool[][] = [[]];
  for (const name of row.tools) {
    if (name === '|') { groups.push([]); continue; }
    const el = l.KINDS[name];
    const rel = l.RELATIONSHIPS[name];
    if (el) groups[groups.length - 1].push({ kind: name, type: 'el', label: el.label });
    else if (rel) groups[groups.length - 1].push({ kind: name, type: 'rel', label: rel.label });
  }
  return groups.filter((group) => group.length > 0);
}

/**
 * What the Tools view says while the tool of `kind` is in hand: TOOL_HINT's sentence for an element kind, and for a
 * relationship kind its first sentence while `step` is 0 (no first end yet) and its second while `step` is 1, with
 * `{definable}` replaced by the library's definable(). A kind with no entry gets 'Click where the <label> goes.' when
 * it is an element kind, and 'Click the first end…' then 'Now click the other end.' when it is a relationship kind.
 */
export function toolHint(lib: SysMLModelLibrary, kind: string, step: 0 | 1): string {
  const l = lib as unknown as CommandsLibrary;
  const hint = TOOL_HINT[kind];
  let text: string;
  if (kind in l.RELATIONSHIPS) {
    if (typeof hint === 'string') text = hint;
    else text = (hint ?? ['Click the first end…', 'Now click the other end.'])[step];
  } else if (typeof hint === 'string') text = hint;
  else if (hint) text = hint[step];
  else text = `Click where the ${l.KINDS[kind]?.label ?? kind} goes.`;
  return text.replace('{definable}', l.definable());
}

// ---- What a command makes.

/** What came of a command: what it made, with the words of its undo step, or the sentence that says why not. */
export type Outcome =
  | { readonly made: Picked; readonly words: string }
  | { readonly refused: string };

/**
 * The first free name for a new element of `kind` owned by `ownerId` (null: at the top of the package), as the old
 * page's freeName gives it: BASE_NAME[kind] (the kind's own name when it has no entry) followed by the smallest whole
 * number from 1 that makes a name none of the owner's elements has. The names taken are lib.textName() of each of
 * lib.childrenOf(model, ownerId); an element with no name in the text (a start node: textName is null) takes none, so
 * every start node is named start1 for the page's own use.
 */
export function freeName(lib: SysMLModelLibrary, model: Model, kind: string, ownerId: string | null): string {
  const l = lib as unknown as CommandsLibrary;
  const base = BASE_NAME[kind] ?? kind;
  const taken = new Set(l.childrenOf(model, ownerId).map((el) => l.textName(el)));
  let i = 1;
  while (taken.has(base + i)) i++;
  return base + i;
}

// ---- Helpers shared by place(), draw() and the tools.

/** A new id: the letter, the time in ms in base 36, five characters of Math.random in base 36; made again while taken. */
function newId(letter: string, taken: (id: string) => boolean): string {
  let id: string;
  do id = letter + Date.now().toString(36) + Math.random().toString(36).slice(2, 7).padEnd(5, '0');
  while (taken(id));
  return id;
}

/** Gives `item` the starting value of a field, by its row in FIELDS (the old page's blankField). */
function blankField(l: CommandsLibrary, item: Record<string, unknown>, field: string): void {
  const spec = l.FIELDS[field];
  if (!spec || spec.stored === false) return;
  if (spec.fresh) item[field] = spec.fresh();
  else if (spec.type === 'bool') item[field] = false;
  else if (spec.type === 'enum') item[field] = spec.values?.[0];
  else item[field] = '';
}

const clamp = (n: number, low: number, high: number): number => Math.min(high, Math.max(low, n));
const holds = (r: Rect, p: { x: number; y: number }): boolean => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

type Plan =
  | { readonly refused: string }
  | { readonly owner: ModelElement | null; readonly place: Record<string, unknown> };

/** Where an element of `kind` would go at `hit`, or why not: what place() does before it writes. */
function plan(l: CommandsLibrary, model: Model, projection: Projection, view: Model['views'][number], kind: string, hit: Hit): Plan {
  const row = l.KINDS[kind];
  const ids = l.idsOf(model);
  const p = hit.at;
  const under = hit.type === 'el' && hit.id !== null ? ids.get(hit.id) ?? null : null;

  const boxUnder = (): ModelElement | null => {
    let best: { el: ModelElement; area: number } | null = null;
    for (const node of projection.nodes) {
      const el = ids.get(node.id);
      const r = projection.rects.get(node.id);
      if (!el || !r || !Array.isArray(l.KINDS[el.kind]?.contains) || !l.canContain(el.kind, kind) || !holds(r, p)) continue;
      if (!best || r.w * r.h < best.area) best = { el, area: r.w * r.h };
    }
    return best ? best.el : null;
  };

  if (row.onBorder) {
    let owner: ModelElement | null;
    if (under) {
      if (l.canContain(under.kind, kind)) owner = under;
      else if (l.KINDS[under.kind]?.onBorder) {
        const up = under.owner !== undefined ? ids.get(under.owner) ?? null : null;
        owner = up && l.canContain(up.kind, kind) ? up : null;
      } else owner = boxUnder();
    } else owner = boxUnder();
    const r = owner ? projection.rects.get(owner.id) : undefined;
    if (!owner || !r || !view.layout[owner.id]) {
      return { refused: kind === 'ParameterUsage'
        ? 'Click an action def or an action in this view to put a parameter on its border.'
        : `Click a part def or a part in this view to put a ${row.label} on its border.` };
    }
    const sides = [
      { side: 'top', dist: Math.abs(p.y - r.y), at: (p.x - r.x) / r.w },
      { side: 'bottom', dist: Math.abs(p.y - (r.y + r.h)), at: (p.x - r.x) / r.w },
      { side: 'left', dist: Math.abs(p.x - r.x), at: (p.y - r.y) / r.h },
      { side: 'right', dist: Math.abs(p.x - (r.x + r.w)), at: (p.y - r.y) / r.h },
    ];
    let near = sides[0];
    for (const d of sides) if (d.dist < near.dist) near = d;
    return { owner, place: { side: near.side, at: Math.round(clamp(near.at, 0.05, 0.95) * 100) / 100 } };
  }

  const owner = boxUnder();
  const home = NODE_HOME[kind];
  if (home) {
    const ok = owner !== null && (home === 'action' ? l.isActionOwner(owner.kind)
      : home === 'state' ? l.isStateOwner(owner.kind)
      : l.isActionOwner(owner.kind) || l.isStateOwner(owner.kind));
    if (!ok) {
      const where = home === 'action' ? 'an action def or an action' : home === 'state' ? 'a state def or a state'
        : 'an action def, an action, a state def or a state';
      return { refused: `Click inside ${where} to put the ${row.label} there.` };
    }
  }
  const [w, h] = row.size;
  const r = owner ? projection.rects.get(owner.id) : undefined;
  if (owner && r) {
    const y = home ? Math.max(LOOK.childTop, Math.round(p.y - r.y - h / 2)) : Math.max(LOOK.childTop, Math.round(p.y - r.y - 20));
    return { owner, place: { x: Math.max(LOOK.pad, Math.round(p.x - r.x - w / 2)), y, w, h } };
  }
  return { owner: null, place: { x: Math.round(p.x - w / 2), y: Math.round(p.y - 20), w, h } };
}

/** The view of the model that hit names, which a plane draws; throws for a view the caller should not have named. */
function drawnView(session: Session, viewId: string, what: string): Model['views'][number] {
  const view = session.model.views.find((v) => v.id === viewId);
  if (!view) throw new Error(`${what}: the model holds no view ${viewId}.`);
  if (!isDrawn(session.lib, view.kind)) throw new Error(`${what}: no plane draws a view of kind ${view.kind}.`);
  return view;
}

/**
 * Places a new element of `kind` where `hit` says, in the view `hit.view`: the old page's place (the graph renderer's
 * in drawing.js, inside the two wrappers of interconnection/page.js and behavior/page.js). It checks first and writes
 * after, so a refusal writes nothing and makes no undo step.
 *
 * **What it reads.** `p` is `hit.at`, in the view's own units from the view's origin. The boxes are the view as a
 * plane draws it now: `project(lib, model, view)` of core/adapter.ts (near, LOOK), whose `rects` are every node's
 * rectangle from the view's origin and whose `nodes` are in drawing order. A hit of type 'el' whose id names no element
 * of the model is read as a hit on the ground at the same point.
 *
 * **The box under the point**, for a kind: among the projection's nodes, in their order, each element that may own
 * things (its row's `contains` is a list), that lib.canContain(its kind, kind), and whose rectangle holds p (its
 * edges included), the one of the smallest area (w * h); of two equal, the earlier. None: the ground. This is the old
 * page's containerAt.
 *
 * **A kind that sits on a border** (its row's `onBorder`: a port, a parameter).
 * 1. The owner. When the hit is an element (`under`): if lib.canContain(under.kind, kind) it is `under`; if `under`
 *    itself sits on a border (a port clicked to put a port beside it), it is under's owner when that owner's kind can
 *    hold `kind`, and nobody otherwise; in every other case, and for a hit on the ground or on a line, it is the box
 *    under the point.
 * 2. With no owner, or with one the view does not place (`view.layout[owner]` is missing), it refuses:
 *    'Click a part def or a part in this view to put a <label> on its border.', and for a ParameterUsage
 *    'Click an action def or an action in this view to put a parameter on its border.'
 * 3. Otherwise the element is owned by that owner, and its place is { side, at } on the nearest border of the owner's
 *    rectangle `r`, as the old page's nearestBorder: of the four distances |p.y - r.y| (top), |p.y - (r.y + r.h)|
 *    (bottom), |p.x - r.x| (left), |p.x - (r.x + r.w)| (right) the smallest, ties in that order; `at` is
 *    (p.x - r.x) / r.w for top and bottom and (p.y - r.y) / r.h for left and right, held to 0.05 .. 0.95 and rounded
 *    to 0.01.
 *
 * **Any other kind** (a box, a control node).
 * 1. The owner is the box under the point, or nobody: then the element stands at the top of the package and on the
 *    view's ground. The hit's own element does not decide it; the point does (a part def clicked onto a port def
 *    lands on the ground at that point, since a port def holds no part def).
 * 2. A kind of NODE_HOME is refused unless it has an owner of the kind its entry names:
 *    'Click inside an action def or an action to put the <label> there.' ('action'),
 *    'Click inside a state def or a state to put the <label> there.' ('state'),
 *    'Click inside an action def, an action, a state def or a state to put the <label> there.' ('either').
 * 3. Its place is { x, y, w, h } with w, h the kind's `size`. On the ground: x = round(p.x - w / 2),
 *    y = round(p.y - 20). Inside an owner whose rectangle is r: x = max(LOOK.pad, round(p.x - r.x - w / 2)) and
 *    y = max(LOOK.childTop, round(p.y - r.y - 20)), so never left of 12 or above 48 from the owner's corner; for a
 *    kind of NODE_HOME, which has no header to hang from, y = max(LOOK.childTop, round(p.y - r.y - h / 2)). The owner
 *    grows to hold it by the adapter's own rule; nothing is written to the owner.
 *
 * **The element.** Its id is 'e', then the time in ms in base 36, then five characters by Math.random in base 36 (the
 * old page's newId), made again while the model holds that id. Its keys, in this order: id, kind, name
 * (freeName(lib, model, kind, owner or null)), doc (''), then each other field of its kind's row that FIELDS holds
 * and stores, at its starting value (the old page's blankField: a row with `stored: false` gets nothing; `fresh()`
 * when the row has one; false for a bool; the first of `values` for an enum; '' for the rest), then `owner` when it
 * has one. Two starting values differ: a ParameterUsage's `direction` is 'in', and an element whose `direction` would
 * be '' and whose owner is a PortDefinition gets 'out' (an item on a port def has to go some way).
 *
 * **The write** is one history.edit(), with no key: the element pushed onto model.elements, and its place put into
 * view.layout under its id. Its words, for Undo's tooltip and the log: 'Added ' + lib.describe(model, the element),
 * as 'Added part def PartDef1', 'Added part part1 in Host', 'Added start in test'. It returns
 * { made: { type: 'el', id }, words }. It picks nothing and says nothing: Tools does (below).
 *
 * A view the model does not hold, a view of a kind no plane draws and a kind that is no element kind are mistakes of
 * the caller: it throws.
 */
export function place(session: Session, kind: string, hit: Hit): Outcome {
  const l = libOf(session);
  if (!l.KINDS[kind]) throw new Error(`place: ${kind} is no element kind.`);
  const model = session.model;
  const view = drawnView(session, hit.view, 'place');
  const projection = project(session.lib, model, view);
  const found = plan(l, model, projection, view, kind, hit);
  if ('refused' in found) return { refused: found.refused };

  const owner = found.owner;
  const taken = new Set(model.elements.map((e) => e.id));
  const el: ModelElement = { id: newId('e', (id) => taken.has(id)), kind, name: freeName(session.lib, model, kind, owner ? owner.id : null), doc: '' };
  for (const field of l.KINDS[kind].fields) if (el[field] === undefined) blankField(l, el, field);
  if (kind === 'ParameterUsage') el.direction = 'in';
  else if (el.direction === '' && owner && owner.kind === 'PortDefinition') el.direction = 'out';
  if (owner) el.owner = owner.id;

  let words = '';
  session.history.edit(() => {
    session.model.elements.push(el);
    session.model.views.find((v) => v.id === view.id)!.layout[el.id] = found.place as never;
    words = 'Added ' + l.describe(session.model, el);
    return words;
  });
  return { made: { type: 'el', id: el.id }, words };
}

/**
 * Draws a relationship of `kind` from the element `fromId` to the element `toId`: the old page's pairProblem and
 * createRel. It checks first and writes after.
 *
 * **The checks**, in this order, each a refusal with the sentence given, bare (Tools adds ESCAPE_HINT):
 * 1. the kind's own rule on the first end, RELATIONSHIPS[kind].first(model, from, lib.idsOf(model));
 * 2. the two ends are one element: 'Pick two different elements.';
 * 3. the model already holds a relationship of this kind from the one to the other, hidden or not:
 *    'That is already drawn.';
 * 4. the kind's own rule on the pair, RELATIONSHIPS[kind].ends(model, from, to, ids).
 *
 * **The relationship.** Its id is 'r' and the rest as an element's. Its keys, in this order: id, kind, from, to, then
 * each field of its kind's row at its starting value, as for an element. It is never hidden.
 *
 * **The write** is one history.edit(), with no key. For a FeatureTyping, a usage has one definition: the typing the
 * usage has already (lib.typingOf(model, from), hidden or not) is taken out of model.relationships first, in the same
 * step, so Undo brings it back where it was. Then the new relationship is pushed onto model.relationships. Its
 * words: 'Drew ' + lib.describeRel(model, the relationship), as 'Drew App specializes Page', 'Drew hosts defined by
 * App', 'Drew connection hosts to app'. It returns { made: { type: 'rel', id }, words }.
 *
 * **The notes.** On the old page the notes on a replaced typing move to the new line. Slice 1 neither shows nor
 * changes a note (plan/slice-1.md, section 7, item 10), and the session's notes are outside the history, so a note
 * moved here would stay moved after Undo brought the old line back. So `session.notes` is not touched: a note on the
 * replaced line keeps naming it by its id and its kept label, the old page lists such a note under that label and
 * leaves it out of the export, and Undo makes it right again. Slice 2, which shows notes, moves them.
 *
 * An id that names no element and a kind that is no relationship kind are mistakes of the caller: it throws.
 */
export function draw(session: Session, kind: string, fromId: string, toId: string): Outcome {
  const l = libOf(session);
  const row = l.RELATIONSHIPS[kind];
  if (!row) throw new Error(`draw: ${kind} is no relationship kind.`);
  const model = session.model;
  const ids = l.idsOf(model);
  const from = ids.get(fromId);
  const to = ids.get(toId);
  if (!from) throw new Error(`draw: no element ${fromId}.`);
  if (!to) throw new Error(`draw: no element ${toId}.`);

  const first = row.first(model, from, ids);
  if (first) return { refused: first };
  if (from.id === to.id) return { refused: 'Pick two different elements.' };
  if (model.relationships.some((r) => r.kind === kind && r.from === from.id && r.to === to.id)) return { refused: 'That is already drawn.' };
  const ends = row.ends(model, from, to, ids);
  if (ends) return { refused: ends };

  const taken = new Set(model.relationships.map((r) => r.id));
  const rel: ModelRelationship = { id: newId('r', (id) => taken.has(id)), kind, from: from.id, to: to.id };
  for (const field of row.fields) blankField(l, rel, field);

  let words = '';
  session.history.edit(() => {
    const rels = session.model.relationships;
    if (kind === 'FeatureTyping') {
      const old = l.typingOf(session.model, session.model.elements.find((e) => e.id === from.id)!);
      if (old) rels.splice(rels.findIndex((r) => r.id === old.id), 1);
    }
    rels.push(rel);
    words = 'Drew ' + l.describeRel(session.model, rel);
    return words;
  });
  return { made: { type: 'rel', id: rel.id }, words };
}

// ---- The tool in hand.

/** Something the tools have to say: a sentence, and a number that grows with each saying, so the same sentence said twice is said anew. */
export interface Saying {
  readonly text: string;
  readonly n: number;
}

/**
 * The tool in hand, for a session. Its methods are bound: each can be handed over as it is.
 *
 * **What it holds.**
 * - **`armed`** is the tool in hand, or null. A new session has none.
 * - **`first`** is the id of the element taken as the first end of the relationship being drawn, or null. It is null
 *   whenever `armed` is null or an element tool.
 * - **`hint`** is what to do next with the tool in hand: toolHint(lib, armed.kind, first === null ? 0 : 1); null with
 *   no tool in hand.
 * - **`said`** is what the last thing the tools did has to say: a new Saying when a click was refused or a tool was
 *   given up with something to say, and null after everything else the tools do (arm, putDown, a click that made
 *   something or took a first end, a choice). The toasts show it (shell/Toasts.tsx). A new session's is null.
 *
 * **Arming.**
 * - **`arm(kind)`** with no tool in hand takes the tool of `kind` in hand ({ kind, type, label } as toolGroups makes
 *   it). With that very kind in hand it puts the tool down, as the old page's palette button does. With another kind
 *   in hand, that kind is in hand instead. In every case `first` is null and `said` is null afterwards. It does not
 *   ask which view is in front: the click does. A kind the library does not hold is a mistake of the caller: it
 *   throws.
 * - **`putDown()`** puts the tool down: `armed`, `first` and `said` are null. With no tool in hand it changes nothing
 *   and tells nobody. Escape calls it (panels/Tools.tsx).
 *
 * **`click(hit)`** offers a click on a plane to the tool in hand, before the click picks anything
 * (plane/Plane.tsx, `clicked`). With no tool in hand it does nothing and returns false, and the click then picks
 * (the selection's click()). With a tool in hand it returns true whatever came of the click, made or refused: while
 * a tool is in hand a click on a plane picks nothing by itself, and what the tool makes is picked by the tool.
 * `hit.add` (Ctrl or ⌘ held) changes nothing. With a tool in hand:
 * 1. **The view.** When the model holds no view `hit.view`, or a plane does not draw its kind, the tool is put down
 *    and nothing is said. When toolGroups() of the view's kind does not list the tool, the tool is put down and
 *    `said` is '<A view kind's label> has no <the tool's label> tool, so the tool was put down.', as 'A state
 *    transition view has no part def tool, so the tool was put down.' (lib.an(label, true) begins it).
 * 2. **An element tool**: place(session, armed.kind, hit). Made: the tool is put down, `said` is null, and the
 *    element is picked, selectionOf(session).set([made]). Refused: nothing is written, the tool stays in hand, and
 *    `said` is the refusal as place() gives it.
 * 3. **A relationship tool, on the ground or on a line** (`hit.type` is not 'el', or its id names no element): the
 *    tool is put down. With a first end taken, `said` is 'Put down: nothing was drawn.'; with none, null.
 * 4. **A relationship tool, on an element, with no first end**: the kind's rule is asked,
 *    RELATIONSHIPS[kind].first(model, element, ids). A sentence: `said` is that sentence + ESCAPE_HINT, the tool stays
 *    in hand and no first end is taken. Null: `first` is the element's id, and `said` is null.
 * 5. **A relationship tool, on an element, with a first end**: draw(session, armed.kind, first, hit.id). Refused:
 *    `said` is the refusal + ESCAPE_HINT, and the tool and its first end stay, so another second end can be clicked.
 *    Made: the tool is put down and the relationship is picked, selectionOf(session).set([made]). `said` is null,
 *    unless no view of a kind a plane draws places both ends in its layout (a first end clicked on one plane and a
 *    second on another): then nothing draws the line, and `said` is the step's words + '. No view shows both ends, so
 *    the line is not drawn anywhere yet.'
 * The order, when something is made: the history.edit() (whose listeners draw it), then `armed`, `first` and `said`
 * with the tools' listeners told once, then the pick.
 *
 * **What puts a tool down by itself**, beside what it made:
 * - **The view in front** (selectionOf(session).view, heard through the selection's listen): when it changes to null,
 *   or to a view whose kind's toolGroups() does not list the tool in hand, the tool is put down and nothing is said.
 *   A change to another view that lists it changes nothing, and the first end stays.
 * - **Another file opened**: the tools are the session's, and the new session's have none in hand.
 * - Nothing else. A change of the model by another hand (a box dragged, a field typed into, an undo, a redo) leaves
 *   the tool in hand, as on the old page. Only this: when the history tells of a change that altered the structure
 *   (`told.structure`) and the model no longer holds the element `first` names, `first` becomes null and the tool
 *   waits for a first end again; nothing is said.
 *
 * **The palette** (plane/Palette.tsx).
 * - **`offers(hit)`** is what can be made at a right-click: the tools of toolGroups() of the hit's view kind, each
 *   group keeping the tools the rules would not refuse there, a group left empty left out. [] when nothing can be
 *   made, when the model holds no such view and when no plane draws its kind. It does not read the tool in hand, and
 *   changes nothing.
 *   - On the ground: each element kind that place() would put there (so no port, no parameter, no control node), and
 *     no relationship kind.
 *   - On an element: each element kind that place() would give that very element as its owner (what the box can
 *     hold; on a port or a parameter, which holds nothing, none), and each relationship kind whose `first` rule
 *     accepts the element as a first end.
 *   - On a line, and for an id that names nothing: nothing.
 * - **`choose(kind, hit)`** is a choice from the palette: whatever is in hand is put down, the tool of `kind` is
 *   taken in hand, and it is given the click `hit`, exactly as click(hit) above. So an element kind is placed at the
 *   right-click's point, inside the box that was clicked, and is picked, with no tool in hand afterwards; and a
 *   relationship kind has the clicked element as its first end and stays in hand for the second click. The listeners
 *   are told once.
 *
 * **`listen(listener)`** calls listener after every change of `armed`, `first`, `hint` or `said`: once for each call
 * of arm(), putDown(), click() or choose() that changed any of them, and once when the view in front or a change of
 * the model put the tool down or let the first end go. It returns what stops it. Every listener is called even when
 * another throws; the first error is thrown on once all have been told.
 */
export interface Tools {
  readonly armed: Tool | null;
  readonly first: string | null;
  readonly hint: string | null;
  readonly said: Saying | null;
  arm(kind: string): void;
  putDown(): void;
  click(hit: Hit): boolean;
  offers(hit: Hit): Tool[][];
  choose(kind: string, hit: Hit): void;
  listen(listener: () => void): () => void;
}

/**
 * The tools of a session: the same object each time it is asked for, kept by the session object itself, weakly, as
 * its selection is (core/selection.ts). The first call adds the tools' one listener to the session's selection and
 * one to its history.
 */
export function toolsOf(session: Session): Tools {
  let kept = KEPT.get(session);
  if (!kept) {
    kept = makeTools(session);
    KEPT.set(session, kept);
  }
  return kept;
}

const KEPT = new WeakMap<Session, Tools>();

function makeTools(session: Session): Tools {
  const l = libOf(session);
  const sel = selectionOf(session);
  const listeners = new Set<() => void>();
  let armed: Tool | null = null;
  let first: string | null = null;
  let said: Saying | null = null;
  let n = 0;
  let depth = 0;
  let dirty = false;

  const tell = (): void => {
    let failed: { error: unknown } | null = null;
    for (const listener of Array.from(listeners)) {
      try { listener(); } catch (error) { failed ??= { error }; }
    }
    if (failed) throw failed.error;
  };
  /** Runs fn; the listeners are told once afterwards when it changed anything, with the state whole. */
  const batch = <T,>(fn: () => T): T => {
    depth++;
    try { return fn(); } finally {
      depth--;
      if (depth === 0 && dirty) { dirty = false; tell(); }
    }
  };
  const setArmed = (next: Tool | null): void => { if (next?.kind !== armed?.kind) { armed = next; dirty = true; } };
  const setFirst = (next: string | null): void => { if (next !== first) { first = next; dirty = true; } };
  const setSaid = (text: string | null): void => {
    if (text === null) { if (said !== null) { said = null; dirty = true; } return; }
    said = { text, n: ++n };
    dirty = true;
  };
  const putDown = (): void => batch(() => { setArmed(null); setFirst(null); setSaid(null); });

  const toolOf = (kind: string): Tool => {
    if (l.KINDS[kind]) return { kind, type: 'el', label: l.KINDS[kind].label };
    if (l.RELATIONSHIPS[kind]) return { kind, type: 'rel', label: l.RELATIONSHIPS[kind].label };
    throw new Error(`arm: the library holds no kind ${kind}.`);
  };
  const take = (tool: Tool): void => { setArmed(tool); setFirst(null); setSaid(null); };
  const arm = (kind: string): void => batch(() => {
    const tool = toolOf(kind);
    if (armed && armed.kind === kind) putDown();
    else take(tool);
  });

  const viewOf = (id: string) => session.model.views.find((v) => v.id === id);
  const lists = (viewKind: string, kind: string): boolean => toolGroups(session.lib, viewKind).some((g) => g.some((t) => t.kind === kind));

  const click = (hit: Hit): boolean => {
    if (!armed) return false;
    const tool = armed;
    batch(() => {
      const view = viewOf(hit.view);
      if (!view || !isDrawn(session.lib, view.kind)) { putDown(); return; }
      if (!lists(view.kind, tool.kind)) {
        putDown();
        setSaid(`${l.an(l.VIEW_KINDS[view.kind].label, true)} has no ${tool.label} tool, so the tool was put down.`);
        return;
      }
      const ids = l.idsOf(session.model);
      const element = hit.type === 'el' && hit.id !== null ? ids.get(hit.id) : undefined;

      if (tool.type === 'el') {
        const out = place(session, tool.kind, hit);
        if ('refused' in out) { setSaid(out.refused); return; }
        putDown();
        sel.set([out.made]);
        return;
      }
      if (!element) {
        const had = first !== null;
        putDown();
        if (had) setSaid('Put down: nothing was drawn.');
        return;
      }
      const taken = first !== null ? ids.get(first) : undefined;
      if (!taken) {
        setFirst(null);
        const problem = l.RELATIONSHIPS[tool.kind].first(session.model, element, ids);
        if (problem) setSaid(problem + ESCAPE_HINT);
        else { setFirst(element.id); setSaid(null); }
        return;
      }
      const out = draw(session, tool.kind, taken.id, element.id);
      if ('refused' in out) { setSaid(out.refused + ESCAPE_HINT); return; }
      const shown = session.model.views.some((v) => isDrawn(session.lib, v.kind) && v.layout[taken.id] && v.layout[element.id]);
      putDown();
      if (!shown) setSaid(out.words + '. No view shows both ends, so the line is not drawn anywhere yet.');
      sel.set([out.made]);
    });
    return true;
  };

  const offers = (hit: Hit): Tool[][] => {
    const view = viewOf(hit.view);
    if (!view || !isDrawn(session.lib, view.kind)) return [];
    const model = session.model;
    const ids = l.idsOf(model);
    const element = hit.type === 'el' && hit.id !== null ? ids.get(hit.id) : undefined;
    if (hit.type === 'rel' || (hit.type === 'el' && !element)) return [];
    const projection = project(session.lib, model, view);
    const kept = (tool: Tool): boolean => {
      if (tool.type === 'el') {
        const found = plan(l, model, projection, view, tool.kind, hit);
        if ('refused' in found) return false;
        return element ? found.owner?.id === element.id : true;
      }
      return element ? l.RELATIONSHIPS[tool.kind].first(model, element, ids) === null : false;
    };
    return toolGroups(session.lib, view.kind).map((group) => group.filter(kept)).filter((group) => group.length > 0);
  };

  const choose = (kind: string, hit: Hit): void => batch(() => {
    const tool = toolOf(kind);
    putDown();
    take(tool);
    click(hit);
  });

  let front = sel.view;
  sel.listen(() => {
    if (sel.view === front) return;
    front = sel.view;
    if (!armed) return;
    const view = front === null ? undefined : viewOf(front);
    if (!view || !lists(view.kind, armed.kind)) putDown();
  });
  session.history.listen((told) => {
    if (!told.structure || first === null) return;
    if (!l.idsOf(session.model).has(first)) batch(() => setFirst(null));
  });

  return {
    get armed() { return armed; },
    get first() { return first; },
    get hint() { return armed ? toolHint(session.lib, armed.kind, first === null ? 0 : 1) : null; },
    get said() { return said; },
    arm,
    putDown,
    click,
    offers,
    choose,
    listen(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}
