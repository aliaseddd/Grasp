// The node of a border item: a port or a parameter, a child node of its owner that the adapter keeps on the owner's
// border (plan/slice-1.md, section 4 and decision 5 of section 7).

import type { Node, NodeProps } from '@xyflow/react';
import type { BorderData, Shape } from '../../core';

export type PortNodeProps = NodeProps<Node<BorderData, Shape>>;

/**
 * The contract.
 *
 * - The square is React Flow's own node element, by CSS: white, a 1.5 px teal border, corners of 2.5 px for `port` and
 *   5 px for `param`.
 * - **Near**: the arrow that data.glyph names, as the old page draws it (canvas/src/core/page/drawing.js 126-149): a
 *   shaft through the square's middle, across the owner's border, with a head pointing into the owner (`in`), out of
 *   it (`out`) or both (`inout`); none for null. And the name, `.grasp-port-name`, 12 px, outside the square at
 *   data.nameAt (a baseline's start, middle or end, from the square's corner), in an svg that does not clip.
 * - **Far**: neither. Always the one inert element with the classes `source target`, as BoxNode has it. Memoized.
 */
export function PortNode(props: PortNodeProps): JSX.Element {
  void props;
  throw new Error('plane/nodes/PortNode.tsx: PortNode is not built yet (step 6).');
}
