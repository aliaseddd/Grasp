// The node and edge types a sequence view adds to every plane. THE SCAFFOLD'S SKELETON: package 2-10 owns this folder
// (index.ts, LifelineNode.tsx, MessageEdge.tsx, sequence.css) and builds it.
//
// What it fills (plan/slice-2.md, section 8, package 2-10; section 2, "The sequence view and the geometry view: a
// graph body each"; section 4, seams 2, 3, 4, 6 and 7):
// - `nodeTypes`, in place of null: `lifeline` (a lifeline's head) and `lifeline-line` (its dashed line). An event is
//   slice 1's node type `event`, which every plane has.
// - `edgeTypes`, in place of null: `message`. A succession is slice 1's edge type `line`.
// The registry (views/bodies.ts) reads both when it is asked; a sequence view is drawn by a plane from the commit in
// which `nodeTypes` and the reader of core/readers/sequence.ts are both there.
//
// What the scaffold fixes for a node or an edge component of another renderer (plane/Plane.tsx says each in full):
// - **Who it is.** One element that is a direct child of the node's own React Flow element carries
//   `data-of="el:<data.element>"`, far and near; a node that stands for no element carries none. An edge carries
//   `data-of="rel:<data.relationship>"` on one element inside its own. Tests, the label editor and the body's outline
//   find a thing in a plane by it (two nodes of one element both carry it), and nothing reads a node's id as an
//   element's.
// - **Marks**: near, and only when `data.marks` is not NO_MARKS, one element `.grasp-marks` with the classes
//   `nodrag nopan`, holding `<Pins marks={data.marks} of="el:<id>" />` and then `<Badge marks of />`
//   (plane/marks/); plane/marks/marks.css keeps it its size on the screen, and the type's own stylesheet says where it
//   stands. An edge renders the same pair through React Flow's EdgeLabelRenderer, at its middle.
// - **Anchors**: whatever shows a label that can be edited carries `data-label="<type>:<id>"`.
// - **Grips**: `{NodeGrips({ far, side? })}` in a node, `{EndGrips({ points })}` last in a selected, near edge, each called as a
//   plain function
//   (plane/nodes/Grips.tsx).
// - **Its own selected look, and its own look while a gesture is over it** (`data-over` on its React Flow element,
//   'fits' or 'no'): the page's rules are written for the 13 shapes and the line of slice 1 (plane/nodes/grips.css).
// - **A gesture React Flow does not report as a node's drag** (a message moved by its line) hears its own
//   pointerdown, follows the pointer on the window, hands each step to the store's preview(), adds itself to
//   gesturesOf(session), calls useBody().swallow() once it has moved, and ends in the kind's action.

import type { EdgeTypes, NodeTypes } from '@xyflow/react';

/** The node components a sequence view adds, by type. Null until package 2-10 builds them. */
export const nodeTypes: NodeTypes | null = null;

/** The edge components a sequence view adds, by type. Null until package 2-10 builds them. */
export const edgeTypes: EdgeTypes | null = null;
