// Probe helpers for 10-review-code. Reuses the worktree's test helpers.
export * from '/home/user/wt/10-review-code/canvas/app/test/helpers.mjs';
import { byTestId, DETAILS, frame } from '/home/user/wt/10-review-code/canvas/app/test/helpers.mjs';

export const G = (page, fn, arg) => page.evaluate(fn, arg);
export const steps = (page) => page.evaluate(() => window.Grasp.session.history.steps.map((s) => `${s.what}${s.key ? ' [' + s.key + ']' : ''}`));
export const undone = (page) => page.evaluate(() => window.Grasp.session.history.undone.map((s) => s.what));
export const active = (page) => page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}${a.getAttribute('data-testid') ? '#' + a.getAttribute('data-testid') : ''}${a.getAttribute('role') ? '[' + a.getAttribute('role') + ']' : ''}` : null; });
export const val = (page, tid) => page.evaluate((s) => { const el = document.querySelector(s); return el ? (el.type === 'checkbox' ? el.checked : el.value) : null; }, `${DETAILS} [data-testid="${tid}"]`);
export const shown = (page) => page.evaluate((root) => document.querySelector(`${root} .grasp-details`)?.getAttribute('data-picked') ?? document.querySelector(`${root} .grasp-side-text`)?.textContent ?? null, DETAILS);
export const el = (page, id) => page.evaluate((i) => JSON.parse(JSON.stringify(window.Grasp.session.model.elements.find((e) => e.id === i) ?? null)), id);
export const sel = (page) => page.evaluate(() => window.Grasp.selection.items.map((p) => `${p.type}:${p.id}`));
export const tick = async (page, n = 2) => { for (let i = 0; i < n; i++) await frame(page); };
export const log = (...a) => console.log(...a);
