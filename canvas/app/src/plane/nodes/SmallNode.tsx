// The node of the six small shapes, which keep the old page's forms (plan/slice-1.md, section 4): bar (a fork or a
// join), diamond (a decision or a merge), dot (a start), bullseye (a done), entry (a state's initial node), event.

import type { Node, NodeProps } from '@xyflow/react';
import type { Shape, SmallData } from '../../core';

export type SmallNodeProps = NodeProps<Node<SmallData, Shape>>;

/**
 * The contract.
 *
 * - The shape fills the node's own size and is drawn far and near alike, as on the old page
 *   (canvas/src/behavior/page.js 86-117, canvas/src/sequence/page.js 28-37): a bar is an ink rectangle with corners
 *   of 3 px; a diamond joins the middles of the node's four sides; a dot is an ink disc; a bullseye a ring with an
 *   ink disc 5 px inside it; an entry an ink rectangle with corners of 4 px; an event an ink disc of radius 6.
 * - **Near**, a name when data.name has one, `.grasp-small-name`, 12 px, outside the shape: below and to the right of
 *   a bar or a diamond, to the right of and above an event.
 * - Always the one inert element with the classes `source target`, as BoxNode has it. Memoized.
 */
export function SmallNode(props: SmallNodeProps): JSX.Element {
  void props;
  throw new Error('plane/nodes/SmallNode.tsx: SmallNode is not built yet (step 6).');
}
