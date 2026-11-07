// A stand-in for window.claude on a published artifact, for the shared-mode tests. page.addInitScript(installFakeClaude,
// seed) runs it in the page before any of the page's own scripts. Playwright serializes the function, so it reaches
// nothing outside itself. The shapes follow the db capability's db.d.ts: use('db') resolves an in-memory document
// store, use('user') the signed-in viewer, any other name null, each on a later tick and never synchronously. The
// store is also exposed as window.__store, so a test can read it with page.evaluate: __store.get(path) is one
// document's body, __store.dump() every document by path, __store.log every call the page made ({op, path}), and
// __store.idle() how long, in ms, the store has had nothing to do (0 while a call waits for its answer).
// `seed` is documents to start with, by path: { 'model/working': {...} }.
//
// The store keeps the limits db.d.ts gives numbers for (runtime contract 0.2.96), as the real one does:
// - A document body is a plain object of at most 256 KiB serialized (its JSON, in UTF-8 bytes) and 32 levels deep. A
//   write that breaks either, an update or an acquire whose merged body would, rejects invalid_argument.
// - The store holds at most 25,000 documents. Creating one more rejects quota_exceeded; writes to the documents it
//   holds still succeed.
// - A path's segments are at most 200 bytes, the path at most 1000 bytes and 16 segments: doc() and collection()
//   throw a TypeError for one that breaks them, as for a bad segment or the wrong parity.
// - A query has at most 10 filters, an `in` or `not-in` value array of at most 30, at most one orderBy, and a limit
//   from 1 to 1000. One that breaks these rejects invalid_argument from get() and on onSnapshot's error callback.
// - A view has at most 64 active subscriptions: the 65th gets resource_exhausted on its error callback.
// db.d.ts names other budgets without numbers (the per-viewer call rate, concurrent writes, a query that scans too
// many documents, the total size of the database), so the fake doesn't keep those.
// A seed that breaks a limit is a mistake in the test, and throws.

export function installFakeClaude(seed) {
  const LIMIT = { body: 256 * 1024, depth: 32, documents: 25000, segment: 200, path: 1000, segments: 16, filters: 10, values: 30, page: 1000, subscriptions: 64 };
  const docs = new Map(); // path -> frozen body
  const snaps = new Map(); // path -> the snapshot handed out for the body now stored, so an unchanged document keeps its object
  const listeners = new Set();
  const log = [];
  let minted = 0;
  let waiting = 0; // answers on their way
  let lastActive = performance.now(); // when a call was last made or answered

  const metadata = Object.freeze({ fromCache: false, hasPendingWrites: false });
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const freeze = (value) => {
    if (value && typeof value === 'object') Object.values(value).forEach(freeze), Object.freeze(value);
    return value;
  };
  const isBody = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const called = (op, path) => { log.push({ op, path }); lastActive = performance.now(); };
  const later = (value) => {
    waiting += 1;
    return new Promise((resolve) => setTimeout(() => { waiting -= 1; lastActive = performance.now(); resolve(value); }, 0));
  };
  const refuse = (code, message) => Promise.reject({ code, message });
  const bytes = (text) => new TextEncoder().encode(text).length;
  const depth = (value) => (value && typeof value === 'object' ? 1 + Object.values(value).reduce((most, v) => Math.max(most, depth(v)), 0) : 0);

  // What keeps a body from being stored, in the words of the refusal, or '' when nothing does.
  function bodyProblem(body) {
    if (!isBody(body)) return 'a document body must be a plain object';
    const size = bytes(JSON.stringify(body));
    if (size > LIMIT.body) return `a document is at most 256 KiB serialized, and this one is ${(size / 1024).toFixed(1)} KiB`;
    if (depth(body) > LIMIT.depth) return 'a document is at most 32 levels deep';
    return '';
  }

  const SEGMENT = /^[A-Za-z0-9_\-.~:@+]+$/;
  function checkPath(path, odd, what) {
    if (typeof path !== 'string') throw new TypeError(`${what} path must be a string`);
    const parts = path.split('/');
    if (parts.some((s) => !SEGMENT.test(s) || s === '.' || s === '..')) throw new TypeError(`${what} path "${path}" has a bad segment`);
    if (parts.some((s) => bytes(s) > LIMIT.segment)) throw new TypeError(`${what} path "${path}" has a segment over 200 bytes`);
    if (bytes(path) > LIMIT.path) throw new TypeError(`${what} path "${path}" is over 1000 bytes`);
    if (parts.length > LIMIT.segments) throw new TypeError(`${what} path "${path}" has ${parts.length} segments, over 16`);
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
  // What keeps a query from running, in the words of the refusal, or '' when nothing does.
  function queryProblem(spec) {
    if (spec.filters.length > LIMIT.filters) return `a query has at most 10 filters, and this one has ${spec.filters.length}`;
    if (spec.filters.some((f) => (f.op === 'in' || f.op === 'not-in') && (!Array.isArray(f.value) || f.value.length > LIMIT.values))) return 'an in or not-in filter takes an array of at most 30 values';
    if (spec.orders > 1) return 'a query has at most one orderBy';
    if (spec.limit !== null && !(Number.isInteger(spec.limit) && spec.limit >= 1 && spec.limit <= LIMIT.page)) return `a query's limit is from 1 to 1000, not ${spec.limit}`;
    return '';
  }

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
  /** Ends a subscription before it starts, with its one terminal error on a later tick (reported, without a callback). */
  function fail(listener, code, message) {
    setTimeout(() => {
      const error = { code, message };
      if (listener.error) listener.error(error); else reportError(new Error(`${code}: ${message}`));
    }, 0);
    return () => {};
  }
  function subscribe(listener) {
    if (listeners.size >= LIMIT.subscriptions) return fail(listener, 'resource_exhausted', 'a view has at most 64 active subscriptions');
    listeners.add(listener);
    deliver(listener);
    return () => listeners.delete(listener);
  }
  // Stores a whole body at path, if the limits allow it, and answers as a write does.
  function put(path, body) {
    const problem = bodyProblem(body);
    if (problem) return refuse('invalid_argument', problem);
    if (!docs.has(path) && docs.size >= LIMIT.documents) return refuse('quota_exceeded', 'documents in this artifact\'s database: it holds at most 25,000');
    docs.set(path, freeze(clone(body)));
    changed(path);
    return later(undefined);
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
      get() { called('get', path); return later(snapshot(path)); },
      set(data) {
        called('set', path);
        return put(path, data);
      },
      update(data) {
        called('update', path);
        if (!isBody(data)) return refuse('invalid_argument', 'an update must be a plain object');
        if (!docs.has(path)) return refuse('invalid_argument', `update of a document that does not exist: ${path}`);
        return put(path, merge(clone(docs.get(path)), clone(data)));
      },
      delete() {
        called('delete', path);
        docs.delete(path);
        changed(path);
        return later(undefined);
      },
      acquire({ holder, ttlMs, data } = {}) {
        called('acquire', path);
        const ttl = Math.min(600000, Math.max(1000, ttlMs || 30000));
        const granted = { acquired: true, version: 1, expiresAt: new Date(Date.now() + ttl).toISOString(), holder };
        if (!data) return later(granted);
        return put(path, merge(clone(docs.get(path) || {}), clone(data))).then(() => granted);
      },
      onSnapshot(next, error) { called('onSnapshot', path); return subscribe({ path, next, error }); },
      collection(sub) { return collection(`${path}/${sub}`); },
    };
    return ref;
  }

  function query(spec) {
    return {
      where: (field, op, value) => query({ ...spec, filters: [...spec.filters, { field, op, value }] }),
      orderBy: (field, dir = 'asc') => query({ ...spec, order: { field, dir }, orders: spec.orders + 1 }),
      limit: (n) => query({ ...spec, limit: n }),
      get() {
        called('get', spec.path);
        const problem = queryProblem(spec);
        return problem ? refuse('invalid_argument', problem) : later(querySnapshot(spec, []));
      },
      onSnapshot(next, error) {
        called('onSnapshot', spec.path);
        const problem = queryProblem(spec);
        return problem ? fail({ next, error }, 'invalid_argument', problem) : subscribe({ query: spec, next, error, last: [] });
      },
    };
  }
  function collection(path) {
    checkPath(path, true, 'collection');
    return Object.assign(query({ path, filters: [], order: null, orders: 0, limit: null }), {
      path,
      doc: (id) => doc(`${path}/${id ?? `fake${(minted += 1)}`}`),
      add(data) { const ref = doc(`${path}/fake${(minted += 1)}`); return ref.set(data).then(() => ref); },
    });
  }

  for (const [path, body] of Object.entries(seed || {})) {
    checkPath(path, false, 'seed document');
    const problem = bodyProblem(body);
    if (problem) throw new TypeError(`seed document ${path}: ${problem}`);
    docs.set(path, freeze(clone(body)));
  }
  if (docs.size > LIMIT.documents) throw new TypeError(`the seed holds ${docs.size} documents, over 25,000`);

  const db = { doc, collection };
  const user = { can: () => later(true), isOwner: () => later(true), canEdit: () => later(true), id: () => later('u1') };
  window.claude = {
    use(name) {
      called('use', name);
      return later(name === 'db' ? db : name === 'user' ? user : null);
    },
  };
  window.__store = {
    db,
    log,
    get: (path) => (docs.has(path) ? clone(docs.get(path)) : undefined),
    dump: () => Object.fromEntries([...docs].map(([path, body]) => [path, clone(body)])),
    idle: () => (waiting ? 0 : performance.now() - lastActive),
  };
}
