export * from '/home/user/wt/12-review-code/canvas/app/test/helpers.mjs';
import { byTestId } from '/home/user/wt/12-review-code/canvas/app/test/helpers.mjs';
export const RATE = { resources: { core: { limit: 60, used: 3, remaining: 57, reset: 1794571200 } } };
export async function stubGitHub(context, hold) {
  await context.route('https://api.github.com/rate_limit', async (route) => {
    if (hold) await hold;
    await route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' }, body: JSON.stringify(RATE) }).catch(() => {});
  });
}
export const V = byTestId('validation');
export const readV = (page) => page.evaluate((root) => {
  const el = document.querySelector(root + ' .grasp-validation-lists');
  return {
    stale: el ? el.getAttribute('data-stale') : null,
    text: document.querySelector(root)?.innerText.slice(0, 2000),
    lists: [...document.querySelectorAll(root + ' section[data-list]')].map((s) => ({ list: s.dataset.list, entries: [...s.querySelectorAll('[data-entry]')].map((e) => [e.dataset.entry, e.getAttribute('role'), e.getAttribute('aria-current'), e.textContent.slice(0, 80)]) })),
  };
}, V);
export const aboutLines = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="about-panel"] [data-line]')].map((el) => [el.dataset.line, el.dataset.state, el.querySelector('.grasp-about-value')?.textContent]));
