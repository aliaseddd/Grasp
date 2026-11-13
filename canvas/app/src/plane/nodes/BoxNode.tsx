// The node of the five shapes with a header and compartments: rect, rounded, item, action, state (plan/slice-1.md,
// section 4, "A node on a plane"). It draws one node from its `data`, and knows no model, no session and no store.

import { memo } from 'react';
import type { Node, NodeProps } from '@xyflow/react';
import type { BoxData, Shape } from '../../core';

export type BoxNodeProps = NodeProps<Node<BoxData, Shape>>;

/**
 * The contract.
 *
 * - **The outline is not drawn here.** It is CSS on React Flow's own node element, `.react-flow__node-<shape>` with
 *   the node's className (`def` or `usage`, `abstract`, `far`, and React Flow's `selected`): a white ground, a 1 px ink
 *   border, corners of radius 0 for `rect` and for a state that is a definition, 10 px for `rounded`, `item` and
 *   `action`, 16 px for a state that is a usage; selected, a 2 px teal outline. So a far node is that element alone.
 * - **Near**, in this order: `.grasp-node-keyword` (data.keyword, centred, 11 px, grey) and `.grasp-node-name`
 *   (data.name, centred, 13 px, medium; italic when the node is `abstract`), together `--grasp-node-header` high;
 *   the send or accept mark at the top left when data.glyph says one; then each compartment as
 *   `.grasp-compartment`: a 1 px rule, `.grasp-compartment-head` (italic, centred, `--grasp-node-head` high), and one
 *   `.grasp-compartment-row` for each line (12 px, left-aligned, `--grasp-node-pad` from the box's sides,
 *   `--grasp-node-lead` apart). A row or a name too long for the box is cut with an ellipsis, never wrapped: the
 *   box's height is the adapter's.
 * - **Far** (data.far): no word and no mark, only the inert element below.
 * - **Always one inert element** with the bare classes `source target` (and `grasp-node-handle`), 0 by 0 at the
 *   node's corner, taking no pointer: React Flow reads a mounted node's handles from the DOM, and a node without both
 *   loses its lines. Nothing else in a node carries the class `source` or `target`, and none `react-flow__handle`.
 * - Memoized: it renders again only when its `data`, `selected` or size changes, not when the node moves.
 */
export function BoxNode({ data, selected, width, height }: BoxNodeProps): JSX.Element {
  return <Box data={data} selected={selected} width={width} height={height} />;
}

interface BoxViewProps {
  data: BoxData;
  selected: boolean;
  width: number | undefined;
  height: number | undefined;
}

// The notation's marks, from the old page (behavior/page.js 64-65): a send's convex pentagon and an accept's notched one.
const GLYPHS = { send: 'M8,8 h10 l5,5 l-5,5 h-10 Z', accept: 'M8,8 h15 v10 h-15 l5,-5 Z' } as const;

// Memoized here, below the component React Flow calls, which is called again at every move of the node.
const Box = memo(function Box({ data }: BoxViewProps): JSX.Element {
  return (
    <>
      <span className="grasp-node-handle source target" />
      {!data.far && (
        <>
          {data.glyph && (
            <svg className="grasp-node-glyph" width="26" height="26" aria-hidden="true">
              <path d={GLYPHS[data.glyph]} />
            </svg>
          )}
          <div className="grasp-node-header">
            <div className="grasp-node-keyword">{data.keyword}</div>
            <div className="grasp-node-name">{data.name}</div>
          </div>
          {data.compartments.map((compartment, i) => (
            <div className="grasp-compartment" key={i}>
              <div className="grasp-compartment-head">{compartment.head}</div>
              {compartment.lines.map((line, j) => <div className="grasp-compartment-row" key={j}>{line}</div>)}
            </div>
          ))}
        </>
      )}
    </>
  );
}, (a, b) => a.data === b.data && a.selected === b.selected && a.width === b.width && a.height === b.height);
