// The reader of the four graph kinds (general, interconnection, action flow, state transition): the adapter, in the
// readers' form (plan/slice-2.md, section 4, seam 1). Its data is a Projection, which a plane hands React Flow.

import { elementOf, project, relationshipOf } from '../adapter';
import type { Projection } from '../adapter';
import type { Listed, Reader } from './index';

/**
 * - **`read`** is the adapter's project(lib, model, view, { far, previous, places }): its six rules, and a gesture's
 *   places standing in for the view's own. `previous` is handed on when it is given; project() takes from it only
 *   what is a projection of the same view.
 * - **`sizeOf`** is the projection's bounds, as wide and as high as the rectangle around every node; 0 by 0 for a view
 *   that places nothing.
 * - **`listed`** gives one entry for each node, in the nodes' order, then one for each edge, in the edges' order.
 *   A node is listed as an 'el' by its element (elementOf: a node that stands for no element is left out), with what
 *   its node says, a box's keyword and name ('«part def» Host') and a border item's or a small node's name, and with
 *   its rectangle from the view's origin. An edge is listed as a 'rel' by its relationship, with its label, and
 *   `rect` null: a line has no place of its own. The words are the projection's, so ask a near one: far, a node and a
 *   line say nothing.
 * It has no `at` and no `step`: what lies at a point of a graph view is place()'s to work out from the projection,
 * and a step of a drag is the adapter's placesFor and projectStep, which the view's store calls.
 */
export const graphReader: Reader<Projection> = {
  read(lib, model, view, options) {
    return project(lib, model, view, {
      far: options?.far,
      previous: options?.previous === undefined || options.previous === null ? null : (options.previous as Projection),
      places: options?.places,
    });
  },
  sizeOf(data) {
    return data.bounds ? { width: data.bounds.w, height: data.bounds.h } : { width: 0, height: 0 };
  },
  listed(data) {
    const out: Listed[] = [];
    for (const node of data.nodes) {
      const id = elementOf(node);
      if (id === null) continue;
      const rect = data.rects.get(node.id);
      const words = node.data.form === 'box' ? `${node.data.keyword} ${node.data.name}`.trim() : node.data.name;
      out.push({ type: 'el', id, words, rect: rect ? { x: rect.x, y: rect.y, w: rect.w, h: rect.h } : null });
    }
    for (const edge of data.edges) out.push({ type: 'rel', id: relationshipOf(edge), words: edge.data.label, rect: null });
    return out;
  },
};
