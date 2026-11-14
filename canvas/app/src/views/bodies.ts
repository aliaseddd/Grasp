// The registry of bodies (plan/slice-2.md, section 4, seams 2, 3 and 9; plan/architecture.md, contract 6): which body
// draws the views of each renderer. A view kind names its renderer in its row of the model library (`graph`,
// `sequence`, `geometry`, `grid`, `browser`); the registry maps that word to an entry: the kind's reader, its options
// as the view's section of Details draws them, and its body. The scaffold writes all five entries. Packages 2-10 to
// 2-13 fill the files an entry reads, and never this one.
//
// Who asks it: views/ViewHost.tsx, the one place that picks a view's body; plane/Plane.tsx, for its node and edge
// types and an entry's plane props; the view's section of Details, for a kind's options. It reads no field of a
// model's record (contract 22): what an option's row must know of a view it asks of core/actions/views.ts.

import type { EdgeTypes, NodeTypes } from '@xyflow/react';
import { readerOf, rendererOf, rootChoices, viewOption } from '../core';
import type { Reader, Session } from '../core';
import { LineEdge } from '../plane/edges/LineEdge';
import { BoxNode } from '../plane/nodes/BoxNode';
import { PortNode } from '../plane/nodes/PortNode';
import { SmallNode } from '../plane/nodes/SmallNode';
import { edgeTypes as geometryEdgeTypes, nodeTypes as geometryNodeTypes } from '../plane/nodes/geometry/index';
import { edgeTypes as sequenceEdgeTypes, nodeTypes as sequenceNodeTypes } from '../plane/nodes/sequence/index';
import type { Shape } from '../core';
import { BrowserBody } from './BrowserBody';
import { GridBody } from './GridBody';

/** What a body is given, and nothing else (contract 6): the session, and the id of the view it draws. */
export interface BodyProps { session: Session; viewId: string }

/** One option of a view kind, as the view's section of Details draws it. */
export interface OptionRow {
  /** The key in view.options: 'spacing', 'scale', 'unit', 'mode', 'columns', 'sort', 'roots'. */
  name: string;
  /** What the widget is called: 'Row spacing'. */
  label: string;
  /** A number field, radio buttons, or ticked boxes. */
  type: 'number' | 'enum' | 'set';
  /** An enum's or a set's choices. */
  values?(session: Session, viewId: string): { value: string; label: string }[];
  /** A number's least and most, both allowed. "Above 0" is written as Number.MIN_VALUE, the least number above it. */
  range?: [number, number];
  /** Why it cannot be changed now, in a sentence, or null. */
  locked?(session: Session, viewId: string): string | null;
}

/**
 * One entry of the registry.
 *
 * - `renderer` is the word of the model library's row: 'graph', 'sequence', 'geometry', 'grid', 'browser'.
 * - `reader()` is readerOf(renderer): null until the kind's package has built it.
 * - `options` are the kind's option rows, in the order the view's section draws them.
 * - `body` is 'graph' when the plane draws the kind (plane/Plane.tsx); or the component that draws it, which takes
 *   BodyProps and draws itself inside views/BodyFrame.tsx; or null while that component is not built.
 * - `nodeTypes` and `edgeTypes`, for a graph body: the node and edge components the entry adds to every plane, by
 *   type. Null while the kind's package has not built them; absent for an entry that adds none.
 * - `flow`: the props of React Flow the entry sets for its planes, from the short list the scaffold allows
 *   (FLOW_PROPS). Plane.tsx spreads them; no other prop of the plane can be changed by a package.
 *
 * `body`, `nodeTypes` and `edgeTypes` are read from the kind's own file when they are asked for, so an entry is built
 * from the moment that file exports something else than null.
 */
export interface BodyEntry {
  renderer: string;
  reader(): Reader<unknown> | null;
  options: readonly OptionRow[];
  body: 'graph' | ((props: BodyProps) => JSX.Element) | null;
  nodeTypes?: NodeTypes | null;
  edgeTypes?: EdgeTypes | null;
  flow?: { elevateNodesOnSelect?: boolean };
}

/** The props of React Flow an entry's `flow` may set (seam 3). Plane.tsx hands on these and no other. */
export const FLOW_PROPS = ['elevateNodesOnSelect'] as const;

// The 13 shapes and the line that slice 1 built: what the four graph kinds draw, and what every plane can draw (an
// event of a sequence view is the shape `event`, a succession the edge `line`).
const SHAPE_TYPES = {
  rect: BoxNode, rounded: BoxNode, item: BoxNode, action: BoxNode, state: BoxNode,
  port: PortNode, param: PortNode,
  bar: SmallNode, diamond: SmallNode, dot: SmallNode, bullseye: SmallNode, entry: SmallNode, event: SmallNode,
} satisfies Record<Shape, unknown> as unknown as NodeTypes;
const LINE_TYPES = { line: LineEdge } as unknown as EdgeTypes;

const NONE: { value: string; label: string }[] = [];
/** A library's list of words as an option's choices, each word its own label. */
const wordsOf = (session: Session, table: string): { value: string; label: string }[] => {
  const list = (session.lib as unknown as Record<string, unknown>)[table];
  return Array.isArray(list) ? list.map((word) => ({ value: String(word), label: String(word) })) : NONE;
};

// The option rows, as seam 9's table has them. Their words are the old page's (canvas/src/core/page.html, the views'
// panels; canvas/src/grid/page.js).
const SEQUENCE_OPTIONS: readonly OptionRow[] = [
  { name: 'spacing', label: 'Row spacing', type: 'number', range: [24, 400] },
];
const GEOMETRY_OPTIONS: readonly OptionRow[] = [
  // Pixels for one unit: above 0.
  { name: 'scale', label: 'Scale', type: 'number', range: [Number.MIN_VALUE, Number.MAX_VALUE] },
  { name: 'unit', label: 'Unit', type: 'enum', values: (session) => wordsOf(session, 'GEO_UNITS') },
];
const GRID_OPTIONS: readonly OptionRow[] = [
  {
    name: 'mode', label: 'Grid', type: 'enum',
    values: () => [{ value: 'table', label: 'table: a row per element' }, { value: 'matrix', label: 'matrix: the elements against each other' }],
  },
  {
    name: 'columns', label: 'Columns', type: 'set',
    values: (session) => wordsOf(session, 'GRID_COLUMNS'),
    locked: (session, viewId) => (viewOption(session, viewId, 'mode') === 'matrix' ? 'A matrix has no columns: it sets the elements against each other. Show the grid as a table to choose its columns.' : null),
  },
  {
    // None (the model's order, the value ''), or a column each way: its key, and its key after '-' for descending.
    name: 'sort', label: 'Sort', type: 'enum',
    values: (session) => [
      { value: '', label: 'the model\'s order' },
      ...wordsOf(session, 'GRID_COLUMNS').flatMap(({ value }) => [{ value, label: `${value}, A to Z` }, { value: `-${value}`, label: `${value}, Z to A` }]),
    ],
  },
];
const BROWSER_OPTIONS: readonly OptionRow[] = [
  // The whole package (the value ''), or the elements at its top.
  { name: 'roots', label: 'Roots of the tree', type: 'set', values: rootChoices },
];

/** The five entries, one for each renderer of the model library. */
export const BODIES: readonly BodyEntry[] = [
  { renderer: 'graph', reader: () => readerOf('graph'), options: [], body: 'graph', nodeTypes: SHAPE_TYPES, edgeTypes: LINE_TYPES },
  {
    renderer: 'sequence', reader: () => readerOf('sequence'), options: SEQUENCE_OPTIONS, body: 'graph',
    get nodeTypes() { return sequenceNodeTypes; },
    get edgeTypes() { return sequenceEdgeTypes; },
  },
  {
    // A picked footprint is not raised over what lies on it (section 2, the geometry probe's fourth rule).
    renderer: 'geometry', reader: () => readerOf('geometry'), options: GEOMETRY_OPTIONS, body: 'graph', flow: { elevateNodesOnSelect: false },
    get nodeTypes() { return geometryNodeTypes; },
    get edgeTypes() { return geometryEdgeTypes; },
  },
  { renderer: 'grid', reader: () => readerOf('grid'), options: GRID_OPTIONS, get body() { return GridBody; } },
  { renderer: 'browser', reader: () => readerOf('browser'), options: BROWSER_OPTIONS, get body() { return BrowserBody; } },
];

/** The entry of a view kind: the one whose renderer its row names. Null for a kind the library does not hold, and for a renderer with no entry. */
export function bodyOf(lib: SysMLModelLibrary, viewKind: string): BodyEntry | null {
  const renderer = rendererOf(lib, viewKind);
  return renderer === null ? null : BODIES.find((entry) => entry.renderer === renderer) ?? null;
}

/**
 * Whether an entry is built (seam 2): its reader is there, and so is its body: for a graph body the node types it
 * adds (an entry that adds none counts as there), for a component body the component. ViewHost shows the card until
 * then.
 */
export function isBuilt(entry: BodyEntry): boolean {
  if (entry.reader() === null) return false;
  return entry.body === 'graph' ? entry.nodeTypes !== null : entry.body !== null;
}

let merged: { nodeTypes: NodeTypes; edgeTypes: EdgeTypes } | null = null;
/**
 * The node and edge types of every plane: what each entry with a graph body adds, the 13 shapes and the line of
 * slice 1 among them. The same two objects at every call, as React Flow asks of `nodeTypes` and `edgeTypes`. A type
 * two entries name is the earlier entry's. So a new shape needs no change to Plane.tsx or to the adapter: its package
 * exports it from its `nodeTypes`.
 */
export function planeTypes(): { nodeTypes: NodeTypes; edgeTypes: EdgeTypes } {
  if (!merged) {
    const nodeTypes: NodeTypes = {};
    const edgeTypes: EdgeTypes = {};
    for (const entry of BODIES) {
      if (entry.body !== 'graph') continue;
      for (const [type, component] of Object.entries(entry.nodeTypes ?? {})) if (!(type in nodeTypes)) nodeTypes[type] = component;
      for (const [type, component] of Object.entries(entry.edgeTypes ?? {})) if (!(type in edgeTypes)) edgeTypes[type] = component;
    }
    merged = { nodeTypes, edgeTypes };
  }
  return merged;
}
