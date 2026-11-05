import type { StrongholdModule } from './module';

/** How the shell loads a module without having its code yet. */
export interface ModuleEntry {
  id: string;
  /** Loads the module's file. The first call fetches it; the browser caches the file for later calls. */
  load(): Promise<StrongholdModule>;
}

/**
 * Every module Stronghold ships, in menu order.
 *
 * Each `import()` here becomes its own file in the build (webpack.config.js, chunkFilename), fetched the first time
 * someone opens the module and never before (DECISIONS.md, 2026-10-31). Adding a module means a folder under
 * src/modules/ and one line here.
 */
export const modules: readonly [ModuleEntry, ...ModuleEntry[]] = [
  {
    id: 'hello',
    load: () => import(/* webpackChunkName: "hello" */ '../modules/hello').then((m) => m.hello),
  },
];
