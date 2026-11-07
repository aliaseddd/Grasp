// The model as the page's store keeps it on the published page: layout 2. The store takes documents of at most
// 256 KiB serialized and 32 levels deep, and at most 25,000 of them, so a large model can't be one document. It is
// kept as a head and its parts:
//
//   - model/current, the head: the store's own fields (layout, baseRevision, parts, changes, updated) and the model's
//     own fields in the model's key order (format, revision, package), each of its three lists given as the number
//     of records it has in the parts. parts is the ids of the parts, in order.
//   - model/current/parts/<id>, one document per part, { records: [...] }. The model's content is one sequence of
//     records: each element in model order, each relationship in model order, then for each view in model order the
//     view with the number of its layout's entries in place of its layout, followed by those entries, each [the id of
//     an element or a line, its place], in the layout's own key order. The sequence is cut into parts after each
//     record whose identity (its id, or its view's id and its own) hashes to a boundary, and before a record that
//     would take a part past 192 KiB, so an insertion or a removal changes the part it falls in, and perhaps one
//     beside it, and not every part after it. A part's id is a hash of what it holds: a part that didn't change keeps
//     its id, and the store keeps it as it is.
//
// model/working holds a whole model handed over from elsewhere, { baseRevision, model, changes, updated } (layout 1, as
// older pages kept the model, and as Claude may write one): the page takes it, saves it in layout 2, and deletes it.
// splitModel and storeHead make the documents, assembleModel makes the model of them again, JSON for JSON, and
// readStore reads the model from a dump of the store's documents the way the page does, for export.mjs and
// save-state.mjs.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const { isObject } = lib;

  // The layout the page writes, its documents' paths, and the store's limits (db.d.ts): a document of at most 256 KiB
  // serialized, counted in UTF-8 bytes, and 32 levels deep. A part holds at most 192 KiB, well inside them. A record
  // ends a part when its identity's hash is a multiple of every, one record in every on average, which makes the
  // parts of the scale models about 64 KiB.
  const STORE = Object.freeze({
    layout: 2,
    working: 'model/working', head: 'model/current', parts: 'model/current/parts', notes: 'notes', archive: 'archive',
    documentBytes: 256 * 1024, depth: 32, partBytes: 192 * 1024, every: 640,
  });
  const LISTS = ['elements', 'relationships', 'views'];
  // The head's fields that are the store's, not the model's.
  const OWN = ['layout', 'baseRevision', 'parts', 'changes', 'updated'];
  // A part's body around its records: {"records":[]}.
  const EMPTY = 14;

  // How many bytes a text takes in UTF-8, the way the store counts a document's size.
  function utf8Bytes(text) {
    if (!/[^\x00-\x7f]/.test(text)) return text.length;
    let bytes = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c < 0x80) bytes += 1;
      else if (c < 0x800) bytes += 2;
      else if (c >= 0xd800 && c < 0xdc00 && (text.charCodeAt(i + 1) & 0xfc00) === 0xdc00) { bytes += 4; i += 1; }
      else bytes += 3;
    }
    return bytes;
  }
  // How many levels a JSON text nests, the way the store counts them: an object or a list is one level more than the
  // deepest value in it. The most brackets open at once outside the text's strings.
  function depthOf(text) {
    let open = 0;
    let most = 0;
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (quoted) {
        if (c === 92) i += 1;               // a backslash: the next character is escaped
        else if (c === 34) quoted = false;  // the closing quote
      } else if (c === 34) quoted = true;
      else if (c === 123 || c === 91) { open += 1; if (open > most) most = open; }
      else if (c === 125 || c === 93) open -= 1;
    }
    return most;
  }
  // How many objects and lists a JSON text opens at most: its { and [, those in its strings too. A text can't nest
  // deeper than that, so a record that opens few needs no closer look (depthOf reads every character).
  function opens(text) {
    let n = 0;
    for (let i = text.indexOf('{'); i >= 0; i = text.indexOf('{', i + 1)) n += 1;
    for (let i = text.indexOf('['); i >= 0; i = text.indexOf('[', i + 1)) n += 1;
    return n;
  }
  // A document body's size and depth, as the store measures them: { bytes, depth }.
  function measureBody(body) {
    const text = JSON.stringify(body);
    return { bytes: utf8Bytes(text), depth: depthOf(text) };
  }
  // A hash of a text: two 32-bit lanes, each multiplying in every character, mixed into each other at the end. (imul is
  // taken once: in Node the library runs in a context of its own, where every lookup of a global is slow.)
  const imul = Math.imul;
  function hash(text) {
    let a = 0xdeadbeef;
    let b = 0x41c6ce57;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      a = imul(a ^ c, 2654435761);
      b = imul(b ^ c, 1597334677);
    }
    a = imul(a ^ (a >>> 16), 2246822507) ^ imul(b ^ (b >>> 13), 3266489909);
    b = imul(b ^ (b >>> 16), 2246822507) ^ imul(a ^ (a >>> 13), 3266489909);
    return [a >>> 0, b >>> 0];
  }
  const hex = (n) => ('0000000' + n.toString(16)).slice(-8);
  // A part's id: the 64-bit hash of its body's JSON, as 16 hex digits.
  function partId(text) {
    const h = hash(text);
    return hex(h[1]) + hex(h[0]);
  }
  const copy = (value) => JSON.parse(JSON.stringify(value));
  // The key of an object's member that takes the most room as JSON (why: 'bytes'), or nests the deepest (why: 'depth'),
  // or null for anything but an object: what to shorten in a record or a head the store can't take.
  function culprit(value, why) {
    if (!isObject(value)) return null;
    let found = null;
    let most = -1;
    Object.keys(value).forEach((key) => {
      const text = JSON.stringify(value[key]);
      const size = text === undefined ? 0 : why === 'depth' ? depthOf(text) : text.length;
      if (size > most) { most = size; found = key; }
    });
    return found;
  }
  const kib = (bytes) => (bytes / 1024).toFixed(1).replace(/\.0$/, '');
  // The error for something the store can't take, with its record saying which it is and why: { list (elements,
  // relationships, views, layout for an entry of a view's layout, or head), id, view (an entry's), why (bytes: too
  // large; depth: nested too deep), bytes, depth (of the document it would be in), limit, field (its member that takes
  // the most room, what to shorten) }.
  function refusal(what, value, why, bytes, depth) {
    const limit = why === 'depth' ? STORE.depth : what.list === 'head' ? STORE.documentBytes : STORE.partBytes;
    const record = { list: what.list, id: what.id === undefined ? null : what.id };
    if (what.view !== undefined) record.view = what.view;
    Object.assign(record, { why: why, bytes: bytes, depth: depth, limit: limit, field: culprit(value, why) });
    const name = what.list === 'head' ? 'The head of the model' : 'The record of ' + what.list + ' ' + record.id + (record.view ? ' in view ' + record.view : '');
    const error = new Error(name + (why === 'depth'
      ? ' would nest ' + depth + ' levels deep, more than a document of the store holds (' + limit + ').'
      : ' is ' + kib(bytes) + ' KiB, more than ' + (what.list === 'head' ? 'a document of the store' : 'a part') + ' holds (' + kib(limit) + ' KiB).'));
    error.record = record;
    return error;
  }

  // The model in layout 2: { fields, parts }. fields is what the head holds of the model: its own fields in its key
  // order, each list as the number of records it has in the parts. parts is the parts in order, each { id, text,
  // bytes, records }: text is the part's body as JSON, { records: [...] }, which JSON.parse makes the body to write;
  // bytes its size in UTF-8; records how many it holds. The model is read, never kept or changed: what is returned is
  // made of its JSON. A record that can't go into a part, too large for one or nested too deep for a document of the
  // store, is refused with an error whose record says which it is and why (refusal).
  function splitModel(model) {
    if (!isObject(model)) throw new TypeError('A model to store is an object.');
    const fields = {};
    Object.keys(model).forEach((key) => {
      if (OWN.indexOf(key) >= 0) throw new TypeError('A model to store has no field ' + key + ': the head of the model keeps that name for the store.');
      if (LISTS.indexOf(key) >= 0) {
        if (!Array.isArray(model[key])) throw new TypeError('A model to store keeps its ' + key + ' in a list.');
        fields[key] = model[key].length;
        return;
      }
      const text = JSON.stringify(model[key]);
      if (text !== undefined) fields[key] = JSON.parse(text);
    });
    const parts = [];
    let texts = [];
    let bytes = EMPTY;
    const close = () => {
      if (!texts.length) return;
      const text = '{"records":[' + texts.join(',') + ']}';
      parts.push({ id: partId(text), text: text, bytes: bytes, records: texts.length });
      texts = [];
      bytes = EMPTY;
    };
    const add = (value, identity, what) => {
      const text = JSON.stringify(value) || 'null';
      const size = utf8Bytes(text);
      // In its part, a record is two levels down ({ records: [ … ] }) and among at least {"records":[]}. Its depth is
      // read only when it opens enough to nest too deep; otherwise what it opens is bound enough.
      const most = opens(text);
      const depth = (most + 2 > STORE.depth ? depthOf(text) : most) + 2;
      if (EMPTY + size > STORE.partBytes) throw refusal(what, value, 'bytes', EMPTY + size, depth);
      if (depth > STORE.depth) throw refusal(what, value, 'depth', EMPTY + size, depth);
      if (texts.length && bytes + 1 + size > STORE.partBytes) close();
      bytes += (texts.length ? 1 : 0) + size;
      texts.push(text);
      if (hash(identity)[0] % STORE.every === 0) close();
    };
    const idOf = (item) => (isObject(item) && typeof item.id === 'string' ? item.id : null);
    ['elements', 'relationships'].forEach((list) => {
      if (Array.isArray(model[list])) model[list].forEach((item, i) => add(item, String(idOf(item) || list + ' ' + i), { list: list, id: idOf(item) }));
    });
    if (Array.isArray(model.views)) {
      model.views.forEach((view, i) => {
        if (!isObject(view)) throw new TypeError('A model to store has views that are objects.');
        const layout = view.layout;
        if (layout !== undefined && !isObject(layout)) throw new TypeError('A view to store keeps its layout in an object.');
        const id = idOf(view) || 'views ' + i;
        const own = {};
        Object.keys(view).forEach((key) => { own[key] = key === 'layout' && layout !== undefined ? Object.keys(layout).length : view[key]; });
        add(own, id, { list: 'views', id: idOf(view) });
        if (layout !== undefined) Object.keys(layout).forEach((key) => add([key, layout[key]], id + ' ' + key, { list: 'layout', id: key, view: idOf(view) }));
      });
    }
    close();
    return { fields: fields, parts: parts };
  }

  // The head for a model split by splitModel: { layout, baseRevision, the model's own fields, parts, changes, updated }.
  // changes is the log of what was done that Claude reads, newest last: when the head would be more than a document of
  // the store holds, its oldest entries are left out until it fits. A head that doesn't fit with no changes at all is
  // refused as a record too large is, its record naming the model's field that takes the most room.
  function storeHead(split, extra) {
    extra = extra || {};
    const head = { layout: STORE.layout, baseRevision: extra.baseRevision === undefined ? null : extra.baseRevision };
    Object.keys(split.fields).forEach((key) => { head[key] = split.fields[key]; });
    head.parts = split.parts.map((part) => part.id);
    head.changes = [];
    head.updated = extra.updated === undefined ? null : extra.updated;
    const bare = measureBody(head);
    if (bare.bytes > STORE.documentBytes || bare.depth > STORE.depth) {
      const fields = {};
      Object.keys(split.fields).forEach((key) => { if (LISTS.indexOf(key) < 0) fields[key] = split.fields[key]; });
      throw refusal({ list: 'head' }, fields, bare.bytes > STORE.documentBytes ? 'bytes' : 'depth', bare.bytes, bare.depth);
    }
    const changes = Array.isArray(extra.changes) ? extra.changes : [];
    let bytes = bare.bytes;
    let kept = 0;
    for (let i = changes.length - 1; i >= 0; i--) {
      const text = JSON.stringify(changes[i]) || 'null';
      const more = utf8Bytes(text) + (kept ? 1 : 0);
      if (bytes + more > STORE.documentBytes || depthOf(text) + 2 > STORE.depth) break;
      bytes += more;
      kept += 1;
    }
    head.changes = copy(changes.slice(changes.length - kept));
    return head;
  }

  // What model a head holds, as a text: its model's fields and its parts. Two heads with the same key hold the same
  // model, since a part's id says what it holds; their changes and times may differ.
  function storedKey(head) {
    if (!isObject(head)) return null;
    const own = {};
    Object.keys(head).forEach((key) => { if (key === 'parts' || OWN.indexOf(key) < 0) own[key] = head[key]; });
    return JSON.stringify(own);
  }

  // A count the head or a view's record gives: a whole number, 0 or more.
  function count(value, what) {
    if (!Number.isInteger(value) || value < 0) throw new Error('The head of the model gives ' + what + ' as ' + JSON.stringify(value) + ', which is no count of records.');
    return value;
  }
  // The model a head and its parts hold, made again, JSON for JSON: the inverse of splitModel. partOf(id) gives the
  // body of the part with that id, or nothing while there is none; until every part the head names is there, the model
  // is null. The model shares nothing with the head or the bodies. A head and parts that don't fit together (more
  // records than the head counts, or fewer, or a record where a view or a layout's entry should be) are an error.
  function assembleModel(head, partOf) {
    if (!isObject(head) || !Array.isArray(head.parts)) throw new Error('The head of the model names no parts.');
    const records = [];
    for (const id of head.parts) {
      const body = partOf(id);
      if (!isObject(body) || !Array.isArray(body.records)) return null;
      for (let i = 0; i < body.records.length; i++) records.push(body.records[i]);
    }
    let at = 0;
    const next = (what) => {
      if (at >= records.length) throw new Error('The parts of the model hold fewer records than its head counts: ' + what + ' is missing.');
      return records[at++];
    };
    const lists = {};
    ['elements', 'relationships'].forEach((list) => {
      if (head[list] === undefined) return;
      const n = count(head[list], list);
      lists[list] = [];
      for (let i = 0; i < n; i++) lists[list].push(next('one of the ' + list));
    });
    if (head.views !== undefined) {
      const n = count(head.views, 'views');
      lists.views = [];
      for (let i = 0; i < n; i++) {
        const record = next('a view');
        if (!isObject(record)) throw new Error('The parts of the model hold ' + JSON.stringify(record) + ' where a view should be.');
        const view = {};
        Object.keys(record).forEach((key) => {
          if (key !== 'layout') { put(view, key, record[key]); return; }
          const entries = count(record.layout, 'the layout of a view');
          const layout = {};
          for (let j = 0; j < entries; j++) {
            const entry = next('an entry of the layout of view ' + record.id);
            if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string') throw new Error('The parts of the model hold ' + JSON.stringify(entry) + ' where an entry of the layout of view ' + record.id + ' should be.');
            put(layout, entry[0], entry[1]);
          }
          view.layout = layout;
        });
        lists.views.push(view);
      }
    }
    if (at !== records.length) throw new Error('The parts of the model hold ' + (records.length - at) + ' records more than its head counts.');
    const model = {};
    Object.keys(head).forEach((key) => {
      if (OWN.indexOf(key) < 0) put(model, key, LISTS.indexOf(key) >= 0 ? lists[key] : head[key]);
    });
    return copy(model);
  }
  // Sets an object's own member, even one named __proto__, which plain assignment would take for the prototype.
  function put(object, key, value) {
    Object.defineProperty(object, key, { value: value, enumerable: true, writable: true, configurable: true });
  }

  // What a dump of the page's store holds: its documents' bodies by path (what the tests' __store.dump() gives, and
  // what Claude can write from what it reads). Returns { model, from, baseRevision, changes, notes, archive }: the
  // model the page would take, made of the documents it was in; from, the path of the document it came from
  // (model/working or model/current), null when the store holds no model; the notes and the archived notes of the
  // collections notes and archive, each with its id, in the order of their numbers. The page takes a whole model in
  // model/working before the one model/current holds, as new input, and only one based on the revision of the file it
  // was published from: given that revision, a model based on it is taken before one that isn't. A head in a layout
  // this library doesn't read is an error, and so is one whose parts the dump doesn't hold.
  function readStore(dump, revision) {
    if (!isObject(dump)) throw new TypeError('A dump of the store is an object of documents by path.');
    const working = isObject(dump[STORE.working]) && isObject(dump[STORE.working].model) ? dump[STORE.working] : null;
    const head = isObject(dump[STORE.head]) ? dump[STORE.head] : null;
    const based = (body) => !!body && revision !== undefined && revision !== null && body.baseRevision === revision;
    const pick = [based(working) && working, based(head) && head, working, head].find(Boolean) || null;
    let model = null;
    if (pick === working && working) model = copy(working.model);
    else if (pick) {
      if (pick.layout !== STORE.layout) {
        throw new Error(STORE.head + ' is in layout ' + JSON.stringify(pick.layout) + (typeof pick.layout === 'number' && pick.layout > STORE.layout
          ? ', which a newer version of the canvas wrote.' : ', which is no layout of the canvas.') + ' This one reads layout ' + STORE.layout + '.');
      }
      model = assembleModel(pick, (id) => dump[STORE.parts + '/' + id]);
      if (!model) throw new Error(STORE.head + ' names a part the dump doesn\'t hold: ' + pick.parts.filter((id) => !isObject(dump[STORE.parts + '/' + id])).join(', ') + '.');
    }
    const collected = (collection) => Object.keys(dump)
      .filter((path) => path.indexOf(collection + '/') === 0 && path.split('/').length === 2 && isObject(dump[path]))
      .map((path) => Object.assign(copy(dump[path]), { id: path.slice(collection.length + 1) }))
      .sort((a, b) => ((a.no || 0) - (b.no || 0)) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return {
      model: model,
      from: !pick ? null : pick === working ? STORE.working : STORE.head,
      baseRevision: pick && pick.baseRevision !== undefined ? pick.baseRevision : null,
      changes: pick && Array.isArray(pick.changes) ? copy(pick.changes) : [],
      notes: collected(STORE.notes),
      archive: collected(STORE.archive),
    };
  }

  Object.assign(lib, { STORE, measureBody, splitModel, storeHead, storedKey, assembleModel, readStore });
})(typeof globalThis !== 'undefined' ? globalThis : window);
