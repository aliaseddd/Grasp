// What the application knows of the globals the page's other scripts set, and of stylesheet imports. A global
// declaration file: it has no import or export of its own.

/** The part of the model library (model-lib.js, window.SysMLModel) the application uses so far. */
interface SysMLModelLibrary {
  /** The saved format's name, 'grasp/2'. */
  readonly FORMAT: string;
}

interface Window {
  SysMLModel: SysMLModelLibrary;
  /** The libraries, by import path, set by vendor.js. */
  GraspVendor: Record<string, unknown>;
}

declare module '*.css';
