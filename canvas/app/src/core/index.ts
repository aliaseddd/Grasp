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
export * from './checks';
export * from './probe';
// Slice 2 (plan/slice-2.md, section 3).
export * from './readers/index';
export * from './readers/graph';
export * from './readers/sequence';
export * from './readers/geometry';
export * from './readers/grid';
export * from './readers/browser';
export * from './marks';
export * from './notes';
export * from './codeLinks';
export * from './labels';
export * from './text';
export * from './says';
export * from './hands';
export * from './keys';
export * from './actions/file';
export * from './actions/camera';
export * from './actions/remove';
export * from './actions/views';
export * from './actions/labels';
export * from './actions/notes';
export * from './actions/code';
export * from './actions/text';
export * from './actions/browser';
export * from './actions/connect';
export * from './actions/reparent';
// The sequence view's and the geometry view's files each export `place` and `end`, as their briefs name them, and
// `place` is also the commands'. So those two files are exported by name: their rows and moveMessage here, their
// placers and enders through placerOf() and enderOf() of the readers, and each file whole under a name of its own.
export { SEQUENCE_ACTIONS, moveMessage } from './actions/sequence';
export { GEOMETRY_ACTIONS } from './actions/geometry';
export * as sequenceActions from './actions/sequence';
export * as geometryActions from './actions/geometry';
