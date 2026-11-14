// The node and edge types a geometry view adds to every plane. THE SCAFFOLD'S SKELETON: package 2-11 owns this folder
// (index.ts, FootprintNode.tsx, AxesNode.tsx, geometry.css) and builds it. geometry.css does not exist yet: the
// package creates it and imports it from this file.
//
// What it fills (plan/slice-2.md, section 8, package 2-11; section 2, "The sequence view and the geometry view: a
// graph body each"; section 4, seams 2, 3, 4 and 7):
// - `nodeTypes`, in place of null: `footprint` and `axes`.
// - `edgeTypes`, in place of null: none (an empty table): a plan draws no line.
// The registry (views/bodies.ts) reads both when it is asked; a geometry view is drawn by a plane from the commit in
// which `nodeTypes` and the reader of core/readers/geometry.ts are both there. Its entry already sets
// `flow: { elevateNodesOnSelect: false }`, so a picked footprint is not raised over what lies on it.
//
// What the scaffold fixes for a node component of another renderer is said in plane/nodes/sequence/index.ts and, in
// full, in plane/Plane.tsx: who it is (`data-of`), its marks (`.grasp-marks`), its anchors (`data-label`), its own
// selected look and its own look under a gesture (`data-over`). The axes are a node whose `data.element` is null: it
// carries no `data-of`, a click on it is a click on the ground, and the store never marks or selects it.

import type { EdgeTypes, NodeTypes } from '@xyflow/react';

/** The node components a geometry view adds, by type. Null until package 2-11 builds them. */
export const nodeTypes: NodeTypes | null = null;

/** The edge components a geometry view adds, by type. Null until package 2-11 builds them. */
export const edgeTypes: EdgeTypes | null = null;
