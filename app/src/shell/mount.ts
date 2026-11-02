import type { AppHandle, HostServices } from '../host/host-services';
import { ensureFonts } from './fonts';
import { modules } from './registry';
import { shellStyles } from './styles';

/**
 * Starts Stronghold inside `container`. Hosts reach this through window.Stronghold.mount (main.ts).
 *
 * The app draws inside a shadow root, so the page's CSS can't reach in and Stronghold's can't leak out
 * (ARCHITECTURE.md, "How a host loads the app"). Then it loads the first module and hands it the page area.
 *
 * It works in the document that loaded the entry file, which is where every host mounts it. Fonts and the
 * stylesheet are made once per page and shared by every mount on it.
 */
export function mount(container: HTMLElement, services: HostServices): AppHandle {
  void services; // Nothing to take from the host yet. See host-services.ts.

  ensureFonts();

  const host = document.createElement('div');
  host.className = 'stronghold';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.adoptedStyleSheets = [shellStyles()];
  const root = document.createElement('div');
  root.className = 'app';
  shadow.append(root);
  container.append(host);

  let live = true;
  let unmountModule: (() => void) | undefined;

  // Until there is a router, the first module in the registry is the one to open.
  const entry = modules[0];
  entry
    .load()
    .then((module) => {
      if (live) {
        unmountModule = module.mount(root);
      }
    })
    .catch((error: unknown) => {
      // The file didn't load, or the module threw while drawing. Either way, say so instead of showing nothing.
      if (live) {
        root.textContent =
          `Stronghold could not open its ${entry.id} module. Reload the page. If it keeps happening, tell your supervisor.`;
        console.error(`[Stronghold] The ${entry.id} module did not open.`, error);
      }
    });

  return {
    unmount(): void {
      live = false;
      try {
        unmountModule?.();
      } catch (error) {
        console.error(`[Stronghold] The ${entry.id} module failed while closing.`, error);
      }
      host.remove();
    },
  };
}
