/**
 * The contract between Stronghold and its hosts (ARCHITECTURE.md, "The app and its hosts").
 *
 * A host is the small piece of code that plugs the app into one place: a SharePoint Server page, a SharePoint
 * Online page, a Teams tab, or the development page. Every host gives the app the same HostServices and starts it
 * with one mount call. The app asks what a host can do, never which host it is.
 *
 * Every host's toolchain compiles this file, including SPFx 1.4.1's TypeScript 2.4, so it uses only what that
 * compiler understands (README.md in this folder). `npm test` in app/ checks that.
 */

/**
 * What a host gives the app.
 *
 * Empty on purpose: the hello-world proof takes nothing from its host. Proof step 4 (ARCHITECTURE.md, The proof)
 * adds the signed-in person and SharePoint's REST API here. Keeping the parameter on `mount` now means that step
 * changes no host's call.
 */
export interface HostServices {
}

/** What `mount` hands back. */
export interface AppHandle {
  /** Takes the app off the page and lets go of what it holds. A host calls this when its web part is disposed. */
  unmount(): void;
}

/** What the app's entry file registers on `window.Stronghold`. */
export interface StrongholdApp {
  /** The app's version, from app/package.json. */
  version: string;
  /** Draws the app inside `container` and returns the handle that takes it down again. */
  mount(container: HTMLElement, services: HostServices): AppHandle;
}

declare global {
  interface Window {
    /** Set by the app's entry file when it runs (app/webpack.config.js, output.library). Absent until then. */
    Stronghold?: StrongholdApp;
  }
}
