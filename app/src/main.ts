/**
 * The app's entry file: the one file a host points its <script> at.
 *
 * webpack puts these exports on window.Stronghold (webpack.config.js, output.library). That's what a host's loader
 * (src/host/load-app.ts) waits for. Everything else loads from here on demand.
 */

export { mount } from './shell/mount';

/** The app's version, from package.json. Hosts can show it when something goes wrong. */
export const version: string = __APP_VERSION__;
