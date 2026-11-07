// The geometry view in the model library: the spatial fields of a part or item drawn to scale (its shape, its
// dimensions, its position and unit), their checks, and their text in the Geometry and units libraries' terms.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const {
    KINDS, VIEW_KINDS, FIELDS, hasTrait, textName, chain, quote, describe, inheritedFeatures, EXTRA, BODY
  } = lib;

  Object.assign(VIEW_KINDS, {
    // A plan of parts (and items, once that kind is in) drawn to scale: scale is the pixels per unit of the view's unit.
    GeometryView: { name: 'GeometryView', label: 'geometry view', qualified: 'StandardViewDefinitions::GeometryView', renderer: 'geometry',
      admits: ['PartUsage', 'ItemUsage'], tools: ['PartUsage', 'ItemUsage'], options: { scale: 40, unit: 'm' } },
  });
  Object.assign(FIELDS, {
    // The spatial fields of a part or item drawn to scale in a geometry view: its shape (a ShapeItems kind whose
    // dimensions are plain attributes; Box is RectangularCuboid), the dimensions that shape has, the position of the
    // shape's origin in its owner's frame, all numbers in the element's own unit. The panel shows them only while the
    // selection is drawn in a geometry view.
    shape: { type: 'enum', label: 'shape', values: ['', 'Box', 'Rectangle', 'CircularCylinder', 'Sphere', 'CircularCone'], views: ['GeometryView'] },
    length: { type: 'number', label: 'length', views: ['GeometryView'] },
    width: { type: 'number', label: 'width', views: ['GeometryView'] },
    height: { type: 'number', label: 'height', views: ['GeometryView'] },
    radius: { type: 'number', label: 'radius', views: ['GeometryView'] },
    posX: { type: 'number', label: 'x position', views: ['GeometryView'] },
    posY: { type: 'number', label: 'y position', views: ['GeometryView'] },
    posZ: { type: 'number', label: 'z position', views: ['GeometryView'] },
    unit: { type: 'enum', label: 'unit', values: ['m', 'mm', 'cm', 'km', 'ft', 'in'], views: ['GeometryView'] },
  });

  // A part, and an item once that kind is in, can be drawn to scale: the spatial trait and the spatial fields.
  ['PartUsage', 'ItemUsage'].forEach((k) => {
    if (!KINDS[k]) return;
    KINDS[k].traits.push('spatial');
    KINDS[k].fields.push('shape', 'length', 'width', 'height', 'radius', 'posX', 'posY', 'posZ', 'unit');
  });
  // Geometry. A part or item with the spatial trait may carry a shape with its dimensions and a position, numbers in
  // its own unit; a number that isn't set is '' and is neither drawn to scale nor written. The dimensions a shape has
  // are exactly those its ShapeItems kind owns (Box is RectangularCuboid), so a dimension always names a feature of the
  // shape: with SI::* imported a wrong name would resolve to the ISQ quantity and pass the validator silently.
  const GEO_DIMS = { Box: ['length', 'width', 'height'], Rectangle: ['length', 'width'], CircularCylinder: ['radius', 'height'], Sphere: ['radius'], CircularCone: ['radius', 'height'] };
  const GEO_UNITS = ['m', 'mm', 'cm', 'km', 'ft', 'in'];
  const GEO_METRES = { m: 1, mm: 0.001, cm: 0.01, km: 1000, ft: 0.3048, in: 0.0254 };
  // The names the text brings in from the library when anything is drawn to scale, and the packages it imports them
  // from (an element named SI beside private import SI::*; takes the import's place, and no unit resolves); an element
  // named like one would shadow it in the text.
  const GEO_LIBRARY_NAMES = new Set(['ShapeItems', 'SpatialItems', 'MeasurementReferences', 'SI', 'USCustomaryUnits', 'SpatialItem', 'Translation', 'TranslationRotationSequence'].concat(Object.keys(GEO_DIMS), GEO_UNITS));
  function geoDims(shape) { return GEO_DIMS[shape] || null; }
  function geoUnitOf(el) { return GEO_UNITS.indexOf(el.unit) >= 0 ? el.unit : 'm'; }
  // A length in one unit, in another.
  function geoConvert(value, from, to) { return value * GEO_METRES[GEO_UNITS.indexOf(from) >= 0 ? from : 'm'] / GEO_METRES[GEO_UNITS.indexOf(to) >= 0 ? to : 'm']; }
  function geoSet(v) { return typeof v === 'number' && Number.isFinite(v); }
  // Whether an element has a position: any of its three coordinates set (the others count as 0).
  function geoPlaced(el) { return hasTrait(el.kind, 'spatial') && (geoSet(el.posX) || geoSet(el.posY) || geoSet(el.posZ)); }
  // The dimensions of its shape an element sets.
  function geoDimsSet(el) { const dims = hasTrait(el.kind, 'spatial') ? geoDims(el.shape) : null; return dims ? dims.filter((d) => geoSet(el[d])) : []; }
  // Whether the text says anything spatial about an element: a shape, or a position.
  function geoExported(el) { return hasTrait(el.kind, 'spatial') && (!!geoDims(el.shape) || geoPlaced(el)); }
  // A number as the text writes it: as JavaScript prints it, but never in exponent form.
  function geoNumber(v) {
    const s = String(v);
    if (!/e/i.test(s)) return s;
    return Math.abs(v) >= 1e21 ? BigInt(Math.round(v)).toString() : v.toFixed(12).replace(/0+$/, '').replace(/\.$/, '');
  }
  // A quantity with its unit: 2 [m], 24 ['in'] (in is a keyword, so quote() quotes it).
  function geoQuantity(v, unit) { return geoNumber(v) + ' [' + quote(unit) + ']'; }
  // The usages an element takes bound values from in the text: the inherited feature it redefines (the same name as one
  // its owner inherits, which headOf writes as :>>), the usages it specializes (:>), and theirs in turn. A dimension or
  // the position one of them binds can't be bound again on the element: the validator refuses to override it.
  function geoGenerals(model, el, ids) {
    const out = [];
    const seen = new Set([el.id]);
    const walk = (e) => {
      const owner = e.owner !== undefined ? ids.get(e.owner) : null;
      const inherited = owner && textName(e) ? inheritedFeatures(model, owner, ids).get(textName(e)) : null;
      const next = model.relationships.filter((r) => r.kind === 'Specialization' && r.from === e.id).map((r) => ids.get(r.to));
      if (inherited && inherited.kind === e.kind) next.push(inherited);
      next.forEach((g) => { if (g && !seen.has(g.id)) { seen.add(g.id); out.push(g); walk(g); } });
    };
    walk(el);
    return out;
  }
  // What keeps a spatial element's text from being right, beyond what the validator says: a dimension that isn't a
  // length, a position on a usage that stands for several parts (the text would place them all at one point), and a
  // dimension or position bound twice along the :>> and :> chain ("Cannot override a binding feature value").
  function geoCheck(model, el, ids, add) {
    if (!hasTrait(el.kind, 'spatial')) return;
    const what = describe(model, el, ids);
    const dims = geoDimsSet(el);
    dims.forEach((d) => { if (el[d] <= 0) add(el.id, 'The ' + d + ' of ' + what + ' is ' + geoNumber(el[d]) + '; a dimension must be more than 0.'); });
    const placed = geoPlaced(el);
    if (placed && el.multiplicity && el.multiplicity !== '1') add(el.id, what + ' has a position, which places one ' + KINDS[el.kind].label + ', but its multiplicity is ' + el.multiplicity + '. Make it 1 or clear it.');
    if (!placed && !dims.length) return;
    geoGenerals(model, el, ids).forEach((g) => {
      const from = describe(model, g, ids);
      if (placed && geoPlaced(g)) add(el.id, what + ' takes its position from ' + from + ' and sets one of its own. The text can\'t bind it twice: clear one of them.');
      geoDimsSet(g).filter((d) => dims.indexOf(d) >= 0).forEach((d) => add(el.id, what + ' takes its ' + d + ' from ' + from + ' and sets one of its own. The text can\'t bind it twice: clear one of them.'));
    });
  }
  // An element named like a library name the geometry text imports shadows it where that text can see it, and the
  // text breaks. The text sits in the body of the element drawn to scale, where a name resolves through the members
  // of that body, of each owner's body on the way up (inherited ones included) and of the package; a port named in
  // on a part beside the spatial one is out of its sight (the pilot resolves ['in'] to the unit there), and an
  // element with no name in the text (a start node, whatever name the page keeps in it) shadows nothing.
  function geoNameCheck(model, el, ids, add) {
    const name = textName(el);
    if (!name || !GEO_LIBRARY_NAMES.has(name) || !model.elements.some((x) => geoExported(x) && geoSees(model, x, el, ids))) return;
    add(el.id, 'The name ' + name + ' is one the geometry text brings in from the library, so the text would mix them up. Rename ' + describe(model, el, ids) + '.');
  }
  // Whether the geometry text of x sees el by name: el is at the top of the package, or right inside x or one of its
  // owners, or a feature x or one of its owners inherits.
  function geoSees(model, x, el, ids) {
    return el.owner === undefined || chain(model, x, ids).some((a) => a.id === el.owner || inheritedFeatures(model, a, ids).get(textName(el)) === el);
  }
  // The spatial statements of a usage's body: its shape with the dimensions it sets, then its position as a translation
  // of its coordinate frame, with the imports they need (validated: critique/g01, g02, g08b, g10, g11; the units, a
  // shape without dimensions and the heads headOf makes, slices/geometry/v01, v03, v04).
  function writeGeometry(model, el, depth, h) {
    if (!geoExported(el)) return;
    const unit = geoUnitOf(el);
    const dims = geoDims(el.shape);
    h.needImport('SI::*');
    if (unit === 'ft' || unit === 'in') h.needImport('USCustomaryUnits::*');
    if (dims) {
      h.needImport('ShapeItems::*');
      const set = dims.filter((d) => geoSet(el[d]));
      if (!set.length) h.line(depth, 'item :>> shape : ' + el.shape + ';');
      else {
        h.line(depth, 'item :>> shape : ' + el.shape + ' {');
        set.forEach((d) => h.line(depth + 1, ':>> ' + d + ' = ' + geoQuantity(el[d], unit) + ';'));
        h.line(depth, '}');
      }
    }
    if (geoPlaced(el)) {
      h.needImport('SpatialItems::*');
      h.needImport('MeasurementReferences::*');
      const at = ['posX', 'posY', 'posZ'].map((k) => geoQuantity(geoSet(el[k]) ? el[k] : 0, unit)).join(', ');
      h.line(depth, 'attribute :>> coordinateFrame {');
      h.line(depth + 1, ':>> transformation : TranslationRotationSequence {');
      h.line(depth + 2, ':>> elements = (new Translation((' + at + ')));');
      h.line(depth + 1, '}');
      h.line(depth, '}');
    }
  }
  BODY.push(writeGeometry);
  // A positioned usage is typed as a spatial item, after whatever head it has, and sits among its owner's spatial parts
  // (or items) when the owner has a position too; under a plain owner or the package it is only typed, since
  // subSpatialParts resolves only in a spatial item (validated heads: g08b, g10, g11, v01, v02, v04).
  function wrapGeometryHead(kind, subset) {
    const prev = kind.head;
    kind.head = function (model, el, h) {
      const base = prev ? prev(model, el, h) : h.headOf(el);
      if (base === null || !geoPlaced(el)) return base;
      const owner = el.owner !== undefined ? h.ids.get(el.owner) : null;
      return base + ' : SpatialItem' + (owner && geoPlaced(owner) ? ' :> ' + subset : '');
    };
  }
  function wrapCheck(kind, check) {
    const prev = kind.check;
    kind.check = function (model, el, ids, add) { if (prev) prev(model, el, ids, add); check(model, el, ids, add); };
  }
  if (KINDS.PartUsage) { wrapGeometryHead(KINDS.PartUsage, 'subSpatialParts'); wrapCheck(KINDS.PartUsage, geoCheck); }
  if (KINDS.ItemUsage) { wrapGeometryHead(KINDS.ItemUsage, 'subSpatialItems'); wrapCheck(KINDS.ItemUsage, geoCheck); }
  Object.keys(KINDS).forEach((k) => wrapCheck(KINDS[k], geoNameCheck));
  EXTRA.GEO_UNITS = GEO_UNITS;
  EXTRA.geoDims = geoDims;
  EXTRA.geoUnitOf = geoUnitOf;
  EXTRA.geoConvert = geoConvert;
  EXTRA.geoPlaced = geoPlaced;
  EXTRA.geoNumber = geoNumber;
})(typeof globalThis !== 'undefined' ? globalThis : window);
