/**
 * The development host: a plain page that does what the SharePoint hosts do, with the same loader
 * (app/src/host/load-app.ts), and nothing SharePoint-specific. It is for development, tests, and comparing screens
 * with design/screens/html/. It never ships (ARCHITECTURE.md, "The app and its hosts").
 *
 * The page's own styles are deliberately hostile (index.html), so a leak from the page into the app shows at once.
 *
 * Where the app comes from: the entry file that /app/dist/stronghold-app.json names, served from the repository
 * root by serve.mjs, or whatever ?app=<url> says. That query exists only here, for development: the web parts
 * have no such setting and always load the app from their own package.
 */

import type { AppHandle } from '../../../app/src/host/host-services.js';
import { loadApp } from '../../../app/src/host/load-app.js';

interface DevHost {
  /** The entry file this page loads, once known. */
  readonly appUrl: string | undefined;
  /** The mounted app, if any. */
  readonly handle: AppHandle | undefined;
  /** Settles when the first mount has finished, for the tests. */
  readonly ready: Promise<void>;
  mount(): Promise<void>;
  unmount(): void;
}

declare global {
  interface Window {
    /** The page's controls, for the tests and the console. */
    devHost: DevHost;
  }
}

const BUILD_MANIFEST = '/app/dist/stronghold-app.json';

const container = document.getElementById('web-part') as HTMLElement;
const status = document.getElementById('status') as HTMLElement;

let appUrl: string | undefined;
let handle: AppHandle | undefined;

/** The entry file's URL: ?app=<url> if given, else the file the app's build manifest names. */
async function findAppUrl(): Promise<string> {
  if (appUrl) {
    return appUrl;
  }
  const override = new URLSearchParams(location.search).get('app');
  if (override) {
    appUrl = new URL(override, location.href).href;
    return appUrl;
  }
  const response = await fetch(BUILD_MANIFEST);
  if (!response.ok) {
    throw new Error(`${BUILD_MANIFEST} answered ${response.status}. Run "npm run build" in app/ first.`);
  }
  const manifest = (await response.json()) as { entry: string };
  appUrl = new URL(`/app/dist/${manifest.entry}`, location.href).href;
  return appUrl;
}

async function mount(): Promise<void> {
  const url = await findAppUrl();
  const app = await loadApp(url);
  if (handle) {
    return;
  }
  handle = app.mount(container, {});
  status.textContent = `Mounted Stronghold ${app.version} from ${url}`;
}

function unmount(): void {
  handle?.unmount();
  handle = undefined;
  status.textContent = 'Unmounted.';
}

const ready = mount().catch((error: unknown) => {
  status.textContent = `Could not load the app${appUrl ? ` from ${appUrl}` : ''}: ${error instanceof Error ? error.message : String(error)}`;
  throw error;
});

window.devHost = {
  get appUrl() {
    return appUrl;
  },
  get handle() {
    return handle;
  },
  ready,
  mount,
  unmount,
};

(document.getElementById('mount') as HTMLElement).addEventListener('click', () => {
  void mount();
});
(document.getElementById('unmount') as HTMLElement).addEventListener('click', unmount);
