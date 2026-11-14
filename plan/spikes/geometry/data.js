// The spike's test data, made from canvas/test/fixtures/geometry.json (window.GEO_FIXTURE, written by build.cjs).
// Nothing here changes the fixture's file: what the fixture lacks is added to a copy.

const part = (id, name, owner, fields) => Object.assign(
  { id, kind: 'PartUsage', name, multiplicity: '', doc: '', shape: '', length: '', width: '', height: '', radius: '', posX: 0, posY: 0, posZ: 0, unit: 'm' },
  owner ? { owner } : {}, fields);

function add(M, model, view, el) {
  model.elements.push(el);
  view.layout[el.id] = M.placement(el, { x: 0, y: 0 });
}

/**
 * The fixture's room (a room of 8 by 6 m holding a desk, a cabinet and a pillar), and what it lacks:
 *   room.table        a large round shape (radius 0.9 m), for the click in the corner of its bounding square
 *   room.table.vase   a round part in mm, nested in a round owner, whose origin is its centre
 *   room.desk.lamp    a box in mm, nested two deep, in a view in m: a small footprint on top of its owner's
 *   room.shelf        a box whose sizes and position are no whole px (0.33 by 1.237 m at 7.31, 4.27)
 *   rug               no part of the room, lying over the room and over half the cabinet: later in the model, so on top
 *   spare             no shape: dashed, at its kind's default size
 *   beam              a Box with a length and no width: dashed
 *   drum              a cylinder with no radius: a dashed circle
 */
export function roomModel(M, fixture) {
  const model = M.normalize(JSON.parse(JSON.stringify(fixture.model)));
  const view = model.views[0];
  add(M, model, view, part('room.table', 'table', 'room', { shape: 'CircularCylinder', radius: 0.9, height: 0.7, posX: 2.2, posY: 4.3 }));
  add(M, model, view, part('room.table.vase', 'vase', 'room.table', { shape: 'Sphere', radius: 120, posX: 300, posY: 250, unit: 'mm' }));
  add(M, model, view, part('room.desk.lamp', 'lamp', 'room.desk', { shape: 'Box', length: 300, width: 200, height: 400, posX: 200, posY: 300, unit: 'mm' }));
  add(M, model, view, part('room.shelf', 'shelf', 'room', { shape: 'Box', length: 0.33, width: 1.237, height: 2, posX: 7.31, posY: 4.27 }));
  add(M, model, view, part('rug', 'rug', null, { shape: 'Rectangle', length: 1.2, width: 1, posX: 5.8, posY: 0.3 }));
  add(M, model, view, part('spare', 'spare', null, { posX: 9.4, posY: 4.2 }));
  add(M, model, view, part('beam', 'beam', null, { shape: 'Box', length: 1.2, posX: 9.4, posY: 1.9 }));
  add(M, model, view, part('drum', 'drum', null, { shape: 'CircularCylinder', height: 1, posX: 10.3, posY: 0.3 }));
  return model;
}

/** The marks of the room: a count of problems, the notes pinned to footprints (the fixture's note 1 is on the desk), a free note. */
export const ROOM_MARKS = {
  badges: { beam: 2, 'room.table': 1 },
  pins: { 'room.desk': [1], 'room.table': [3], room: [4, 5] },
  free: [{ no: 2, x: 420, y: -262 }],
};

/** The fixture's view with nothing in it. */
export function emptyModel(M, fixture) {
  const model = M.normalize(JSON.parse(JSON.stringify(fixture.model)));
  model.views[0].layout = {};
  return model;
}

/** A view of owners x (1 + per) footprints: owners of 4 by 4 m in rows of ten (of 25 above 100 owners), each holding `per` parts of 1 by 1 m. */
export function syntheticModel(M, fixture, owners = 50, per = 9) {
  const model = M.normalize(JSON.parse(JSON.stringify(fixture.model)));
  const view = model.views[0];
  view.layout = {};
  model.elements = model.elements.filter((e) => e.kind === 'PartDefinition');
  model.relationships = [];
  const row = owners > 100 ? 25 : 10;
  for (let i = 0; i < owners; i++) {
    const id = 'o' + i;
    add(M, model, view, part(id, 'owner' + i, null, { shape: 'Box', length: 4, width: 4, height: 1, posX: (i % row) * 5, posY: Math.floor(i / row) * 5 }));
    for (let k = 0; k < per; k++) {
      add(M, model, view, part(id + '.p' + k, 'p' + k, id, { shape: k % 3 === 2 ? 'CircularCylinder' : 'Box', length: 1, width: 1, height: 1, radius: 0.5, posX: 0.3 + (k % 3) * 1.2 + (k % 3 === 2 ? 0.5 : 0), posY: 0.3 + Math.floor(k / 3) * 1.2 + (k % 3 === 2 ? 0.5 : 0) }));
    }
  }
  return model;
}
