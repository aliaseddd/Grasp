/**
 * Loads Stronghold's entry file into the page and hands back what it registered.
 *
 * Every host uses this, so it is written for the oldest compiler among them, SPFx 1.4.1's TypeScript 2.4, and
 * for that host's lint rules (README.md in this folder).
 *
 * How it works: the host adds one <script> element that points at the entry file inside the host's own package.
 * The entry file is built so that running it sets window.Stronghold (app/webpack.config.js, output.library). No
 * inline script and no eval are involved, which SharePoint Online's Content Security Policy requires. Module files
 * and fonts load later from the same folder, because the entry file works out its own URL from the script element
 * that loaded it (webpack's publicPath: 'auto').
 *
 * The entry file's name carries a hash of its contents (app/webpack.config.js), so the caller passes the full URL:
 * the hosts get the name at build time from app/dist/stronghold-app.json, the dev page fetches that file.
 *
 * One app per page: the first entry file to load wins, and later calls get the same app, whatever URL they pass.
 */

import { StrongholdApp } from './host-services';

/** Marks the <script> this loader added, with the URL it loads, so a second web part on the page finds it. */
const SCRIPT_ATTRIBUTE: string = 'data-stronghold-app';

/** 'loading', 'loaded', or 'failed', kept on the <script> so a second caller knows what happened to it. */
const STATE_ATTRIBUTE: string = 'data-stronghold-state';

/** The app, if an entry file has already registered it on this page. */
function getRegisteredApp(): StrongholdApp | undefined {
  const app: StrongholdApp | undefined = window.Stronghold;
  return app && typeof app.mount === 'function' ? app : undefined;
}

/** The <script> a previous call added for `entryUrl`, if there is one. */
function findScript(entryUrl: string): HTMLScriptElement | undefined {
  const scripts: ArrayLike<HTMLScriptElement> = document.getElementsByTagName('script');
  for (let i: number = 0; i < scripts.length; i++) {
    const script: HTMLScriptElement | undefined = scripts[i];
    if (script && script.getAttribute(SCRIPT_ATTRIBUTE) === entryUrl) {
      return script;
    }
  }
  return undefined;
}

/** Adds the <script> for `entryUrl` to the page and keeps its state on it. */
function addScript(entryUrl: string): HTMLScriptElement {
  const element: HTMLScriptElement = document.createElement('script');
  element.setAttribute(SCRIPT_ATTRIBUTE, entryUrl);
  element.setAttribute(STATE_ATTRIBUTE, 'loading');
  element.addEventListener('load', (): void => {
    element.setAttribute(STATE_ATTRIBUTE, 'loaded');
  });
  element.addEventListener('error', (): void => {
    element.setAttribute(STATE_ATTRIBUTE, 'failed');
  });
  element.src = entryUrl;
  document.head.appendChild(element);
  return element;
}

/**
 * Loads the entry file at `entryUrl` once and resolves with the app it registered.
 * Rejects if the file can't be fetched, or if it ran without registering the app.
 */
export function loadApp(entryUrl: string): Promise<StrongholdApp> {
  const registered: StrongholdApp | undefined = getRegisteredApp();
  if (registered) {
    return Promise.resolve(registered);
  }

  return new Promise<StrongholdApp>((resolve: (app: StrongholdApp) => void, reject: (error: Error) => void): void => {
    const settle: () => void = (): void => {
      const app: StrongholdApp | undefined = getRegisteredApp();
      if (app) {
        resolve(app);
      } else {
        reject(new Error('The file at ' + entryUrl + ' ran, but it did not register window.Stronghold. ' +
          'Is it the app\'s entry file?'));
      }
    };
    const fail: () => void = (): void => {
      reject(new Error('The app did not load from ' + entryUrl + '.'));
    };

    let script: HTMLScriptElement | undefined = findScript(entryUrl);
    if (!script) {
      script = addScript(entryUrl);
    } else {
      const state: string | null = script.getAttribute(STATE_ATTRIBUTE);
      if (state === 'loaded') {
        settle();
        return;
      }
      if (state === 'failed') {
        fail();
        return;
      }
    }
    script.addEventListener('load', settle);
    script.addEventListener('error', fail);
  });
}
