// The core: the part of the application with no React in it. It runs in Node too, so its tests need no browser
// (canvas/app/test/core.mjs bundles this file and runs it beside the model library). The application imports the core
// from here.
//
// The core reads no global for the model library: whatever opens a file gives it (window.SysMLModel in the page,
// loadLib() of canvas/export.mjs in Node), and the session keeps it.

export * from './history';
export * from './session';
export * from './files';
export * from './adapter';
export * from './roboto';
export * from './selection';
export * from './commands';
