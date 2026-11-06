// A stand-in for window.claude on a published artifact, for the shared-mode tests. page.addInitScript(installFakeClaude,
// seed) runs it in the page before any of the page's own scripts. Playwright serializes the function, so it reaches
// nothing outside itself. The shapes follow the db capability's db.d.ts: use('db') resolves an in-memory document
// store, use('user') the signed-in viewer, any other name null, each on a later tick and never synchronously. The
// store is also exposed as window.__store, so a test can read it with page.evaluate: __store.get(path) is one
// document's body, __store.dump() every document by path, __store.log every call the page made ({op, path}).
// `seed` is documents to start with, by path: { 'model/working': {...} }.

export function installFakeClaude(seed) {
  const docs = new Map(); // path -> frozen body
  const snaps = new Map(); // path -> the snapshot handed out for the body now stored, so an unchanged document keeps its object
  const listeners = new Set();
  const log = [];
  let minted = 0;

  const metadata = Object.freeze({ fromCache: false, hasPendingWrites: false });
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const freeze = (value) => {
    if (value && typeof value === 'object') Object.values(value).forEach(freeze), Object.freeze(value);
    return value;
  };
  const isBody = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const later = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 0));
  const refuse = (code, message) => Promise.reject({ code, message });

  const SEGMENT = /^[A-Za-z0-9_\-.~:@+]+$/;
  function checkPath(path, odd, what) {
    if (typeof path !== 'string') throw new TypeError(`${what} path must be a string`);
    const parts = path.split('/');
    if (parts.some((s) => !SEGMENT.test(s) || s === '.' || s === '..')) throw new TypeError(`${what} path "${path}" has a bad segment`);
    if (parts.length % 2 !== (odd ? 1 : 0)) throw new TypeError(`${what} path "${path}" has ${parts.length} segments, needs an ${odd ? 'odd' : 'even'} number`);
    return parts;
  }
  const parent = (path) => path.slice(0, path.lastIndexOf('/'));

  function snapshot(path) {
    if (!snaps.has(path)) {
      const body = docs.get(path);
      snaps.set(path, Object.freeze({ id: path.slice(path.lastIndexOf('/') + 1), exists: body !== undefined, data: () => body, metadata }));
    }
    return snaps.get(path);
  }

  function passes(body, { field, op, value }) {
    const v = body[field];
    switch (op) {
      case '==': return JSON.stringify(v) === JSON.stringify(value);
      case '!=': return v !== undefined && JSON.stringify(v) !== JSON.stringify(value);
      case '<': return v !== undefined && v < value;
      case '<=': return v !== undefined && v <= value;
      case '>': return v !== undefined && v > value;
      case '>=': return v !== undefined && v >= value;
      case 'in': return Array.isArray(value) && value.includes(v);
      case 'not-in': return Array.isArray(value) && !value.includes(v);
      case 'array-contains': return Array.isArray(v) && v.includes(value);
      default: throw new TypeError(`unknown where operator "${op}"`);
    }
  }
  const compare = (a, b) => (a === b ? 0 : a === undefined ? 1 : b === undefined ? -1 : a < b ? -1 : 1);

  /** The documents a query matches now, in its order, as snapshots. */
  function run(query) {
    const rows = [...docs.keys()]
      .filter((path) => parent(path) === query.path && query.filters.every((filter) => passes(docs.get(path), filter)))
      .sort((a, b) => {
        const byField = query.order ? compare(docs.get(a)[query.order.field], docs.get(b)[query.order.field]) : 0;
        if (byField) return query.order.dir === 'desc' ? -byField : byField;
        return a < b ? -1 : 1;
      });
    return (query.limit ? rows.slice(0, query.limit) : rows).map(snapshot);
  }

  function querySnapshot(query, previous) {
    const now = run(query);
    const docChanges = () => {
      const changes = [];
      now.forEach((doc, newIndex) => {
        const oldIndex = previous.findIndex((old) => old.id === doc.id);
        if (oldIndex < 0) changes.push({ type: 'added', doc, oldIndex: -1, newIndex });
        else if (previous[oldIndex] !== doc) changes.push({ type: 'modified', doc, oldIndex, newIndex });
      });
      previous.forEach((old, oldIndex) => {
        if (!now.some((doc) => doc.id === old.id)) changes.push({ type: 'removed', doc: old, oldIndex, newIndex: -1 });
      });
      return changes;
    };
    return Object.freeze({ docs: now, size: now.length, empty: now.length === 0, docChanges, metadata });
  }

  /** Hands a listener its next snapshot on a later tick, unless it unsubscribed meanwhile. */
  function deliver(listener) {
    setTimeout(() => {
      if (!listeners.has(listener)) return;
      if (listener.path !== undefined) return listener.next(snapshot(listener.path));
      const snap = querySnapshot(listener.query, listener.last);
      listener.last = snap.docs;
      listener.next(snap);
    }, 0);
  }
  function changed(path) {
    snaps.delete(path);
    for (const listener of listeners) {
      if (listener.path === path || (listener.query && listener.query.path === parent(path))) deliver(listener);
    }
  }
  function subscribe(listener) {
    listeners.add(listener);
    deliver(listener);
    return () => listeners.delete(listener);
  }
  function write(path, body) {
    docs.set(path, freeze(clone(body)));
    changed(path);
  }
  function merge(into, from) {
    for (const [key, value] of Object.entries(from)) into[key] = isBody(value) && isBody(into[key]) ? merge(into[key], value) : value;
    return into;
  }

  function doc(path) {
    const parts = checkPath(path, false, 'document');
    const ref = {
      id: parts[parts.length - 1],
      path,
      get() { log.push({ op: 'get', path }); return later(snapshot(path)); },
      set(data) {
        log.push({ op: 'set', path });
        if (!isBody(data)) return refuse('invalid_argument', 'a document body must be a plain object');
        write(path, data);
        return later(undefined);
      },
      update(data) {
        log.push({ op: 'update', path });
        if (!isBody(data)) return refuse('invalid_argument', 'an update must be a plain object');
        if (!docs.has(path)) return refuse('invalid_argument', `update of a document that does not exist: ${path}`);
        write(path, merge(clone(docs.get(path)), clone(data)));
        return later(undefined);
      },
      delete() {
        log.push({ op: 'delete', path });
        docs.delete(path);
        changed(path);
        return later(undefined);
      },
      acquire({ holder, ttlMs, data } = {}) {
        log.push({ op: 'acquire', path });
        if (data) write(path, merge(clone(docs.get(path) || {}), clone(data)));
        const ttl = Math.min(600000, Math.max(1000, ttlMs || 30000));
        return later({ acquired: true, version: 1, expiresAt: new Date(Date.now() + ttl).toISOString(), holder });
      },
      onSnapshot(next) { log.push({ op: 'onSnapshot', path }); return subscribe({ path, next }); },
      collection(sub) { return collection(`${path}/${sub}`); },
    };
    return ref;
  }

  function query(spec) {
    return {
      where: (field, op, value) => query({ ...spec, filters: [...spec.filters, { field, op, value }] }),
      orderBy: (field, dir = 'asc') => query({ ...spec, order: { field, dir } }),
      limit: (n) => query({ ...spec, limit: n }),
      get() { log.push({ op: 'get', path: spec.path }); return later(querySnapshot(spec, [])); },
      onSnapshot(next) { log.push({ op: 'onSnapshot', path: spec.path }); return subscribe({ query: spec, next, last: [] }); },
    };
  }
  function collection(path) {
    checkPath(path, true, 'collection');
    return Object.assign(query({ path, filters: [], order: null, limit: 0 }), {
      path,
      doc: (id) => doc(`${path}/${id ?? `fake${(minted += 1)}`}`),
      add(data) { const ref = doc(`${path}/fake${(minted += 1)}`); return ref.set(data).then(() => ref); },
    });
  }

  for (const [path, body] of Object.entries(seed || {})) {
    checkPath(path, false, 'seed document');
    if (!isBody(body)) throw new TypeError(`seed document ${path} must be a plain object`);
    docs.set(path, freeze(clone(body)));
  }

  const db = { doc, collection };
  const user = { can: () => later(true), isOwner: () => later(true), canEdit: () => later(true), id: () => later('u1') };
  window.claude = {
    use(name) {
      log.push({ op: 'use', path: name });
      return later(name === 'db' ? db : name === 'user' ? user : null);
    },
  };
  window.__store = {
    db,
    log,
    get: (path) => (docs.has(path) ? clone(docs.get(path)) : undefined),
    dump: () => Object.fromEntries([...docs].map(([path, body]) => [path, clone(body)])),
  };
}
