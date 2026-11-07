// The fake store (fake-claude.mjs) keeps the limits the db capability's db.d.ts gives numbers for, as the page's real
// store does: a document of at most 256 KiB serialized and 32 levels deep, at most 25,000 documents, paths, queries and
// subscriptions within their bounds. The shared-mode tests, and the scale test that saves 10,000 elements, mean what
// they say only if it does.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { finish, launch, openCanvas } from './helpers.mjs';

describe('the fake store', () => {
  let browser;
  before(async () => { browser = await launch(); });
  after(() => browser?.close());

  test('refuses what the real store refuses: a document too big or too deep, a document past 25,000, a path, query or subscription past its limit', async () => {
    const ctx = await openCanvas(browser, { shared: true });
    const { page } = ctx;
    const answers = await page.evaluate(async () => {
      const db = window.__store.db;
      const code = (promise) => promise.then(() => 'ok', (error) => error.code);
      const throws = (fn) => { try { fn(); return 'ok'; } catch (error) { return error.name; } };
      const sized = (bytes) => ({ text: 'x'.repeat(bytes - JSON.stringify({ text: '' }).length) }); // `bytes` serialized
      const nested = (levels) => { let body = {}; for (let i = 1; i < levels; i++) body = { in: body }; return body; };
      const out = {};
      out.atSize = await code(db.doc('limits/big').set(sized(256 * 1024)));
      out.overSize = await code(db.doc('limits/bigger').set(sized(256 * 1024 + 1)));
      out.overSizeMerged = await code(db.doc('limits/big').update({ more: 'x' }));
      out.atDepth = await code(db.doc('limits/deep').set(nested(32)));
      out.overDepth = await code(db.doc('limits/deeper').set(nested(33)));
      out.longSegment = throws(() => db.doc('limits/' + 'x'.repeat(201)));
      out.longPath = throws(() => db.doc(Array.from({ length: 10 }, () => 'y'.repeat(101)).join('/')));
      out.manySegments = throws(() => db.doc(Array.from({ length: 18 }, (_, i) => 's' + i).join('/')));
      const many = db.collection('limits');
      out.pageOver = await code(many.limit(1001).get());
      out.pageAt = await code(many.limit(1000).get());
      out.filtersOver = await code(Array.from({ length: 11 }).reduce((q, _, i) => q.where('f' + i, '==', i), many).get());
      out.valuesOver = await code(many.where('f', 'in', Array.from({ length: 31 }, (_, i) => i)).get());
      out.ordersOver = await code(many.orderBy('a').orderBy('b').get());
      // Fill the store to 25,000 documents: the next one is refused, while the ones it holds can still be written.
      const held = Object.keys(window.__store.dump()).length;
      for (let i = held; i < 25000; i += 1000) {
        await Promise.all(Array.from({ length: Math.min(1000, 25000 - i) }, (_, k) => db.doc(`filler/d${i + k}`).set({ n: i + k })));
      }
      out.held = Object.keys(window.__store.dump()).length;
      out.oneMore = await code(db.doc('filler/extra').set({ n: 0 }));
      out.rewrite = await code(db.doc('filler/d' + held).set({ n: -1 }));
      // A view's 65th subscription: the page holds 3 (the working model, the notes, the archive).
      const subscribed = [];
      out.subscriptionError = await new Promise((resolve) => {
        for (let i = 0; i < 70; i++) subscribed.push(db.doc('limits/s' + i).onSnapshot(() => {}, (error) => resolve(`${error.code} at ${i + 1}`)));
      });
      subscribed.forEach((unsubscribe) => unsubscribe());
      return out;
    });
    assert.deepEqual(answers, {
      atSize: 'ok', overSize: 'invalid_argument', overSizeMerged: 'invalid_argument', atDepth: 'ok', overDepth: 'invalid_argument',
      longSegment: 'TypeError', longPath: 'TypeError', manySegments: 'TypeError',
      pageOver: 'invalid_argument', pageAt: 'ok', filtersOver: 'invalid_argument', valuesOver: 'invalid_argument', ordersOver: 'invalid_argument',
      held: 25000, oneMore: 'quota_exceeded', rewrite: 'ok', subscriptionError: 'resource_exhausted at 62',
    });
    await finish(ctx);
  });
});
