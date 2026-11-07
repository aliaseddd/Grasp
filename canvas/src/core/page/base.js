// The page's first script. It makes the object the page's scripts share, window.SysMLCanvas (C in each script,
// with what the page shows and does now as C.state, S), and holds the page's constants, the words for the core's
// tools, the tables the features fill in (TOOLS, ACTIONS, VIEW_PANELS, FIELD_HOOKS), and the page's elements the
// scripts use.
(function (C) {
  'use strict';

  const M = window.SysMLModel;
  const NS = 'http://www.w3.org/2000/svg';
  const STATE_KEY = 'stronghold-canvas:';          // + the revision of the saved model, when the page is opened as a file
  const CAMERA_KEY = 'stronghold-canvas-camera:v1';
  // The shared store's documents for the model, in its layout 2 (the library's stored.js says what each holds): the
  // head, the collection of the parts it names, and a whole model handed over from elsewhere, which the page takes,
  // saves in layout 2 and deletes.
  const CURRENT = M.STORE.head;                      // model/current
  const PARTS = M.STORE.parts;                       // model/current/parts
  const WORKING = M.STORE.working;                   // model/working
  const NOTES = 'notes';                             // the shared store's collection of notes
  const PAUSE = 800;                                 // how long a change waits before it is saved, in ms
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 6;
  const HEADER = 40;      // the keyword and the name
  const HEAD_H = 18;      // a compartment's heading
  const LEAD = 15;        // a line in a compartment
  const PAD = 12;         // inside a box
  const CHILD_TOP = 48;   // where a nested box may start
  const PORT = 16;        // a port's square
  const MARGIN = 48;      // from the drawing to the view's frame
  const MIN_FRAME = [440, 280];  // a frame is never smaller than this
  const VIEW_GAP = 96;    // between a new frame and the one to its left
  const HISTORY = 100;    // how many changes undo remembers
  const NARROW = window.matchMedia('(max-width: 720px)');
  const WHERE = {
    loading: '',
    shared: 'Changes and notes save as you work, into this page\'s shared store, where Claude reads them. Ask Claude to save the model to GitHub.',
    local: 'This browser keeps your changes and notes. Download the state to keep it, or to hand it to Claude.',
    read: 'You can look at this model here but not change it.'
  };
  // What the palette's buttons say on hover, and what the HUD says while a tool is armed. A tool without an entry
  // gets a plain sentence made from its label.
  const TOOL_TITLE = {
    PartDefinition: 'A part definition: square corners',
    PortDefinition: 'A port definition',
    PartUsage: 'A part: rounded corners, on the plane or inside a part def or part',
    PortUsage: 'A port: a small square on the border of a part def or part',
    Specialization: 'One definition specializes another, or one part or port subsets another',
    FeatureTyping: 'A usage is defined by a definition: a part by a part def, an action by an action def, a state by a state def',
    ConnectionUsage: 'A connection between two ports or two parts'
  };
  const TOOL_HINT = {
    PartDefinition: 'Click where the part def goes.',
    PortDefinition: 'Click where the port def goes.',
    PartUsage: 'Click where the part goes: on the plane, or inside a part def or a part.',
    PortUsage: 'Click a part def or a part to put a port on its border.',
    Specialization: ['Click the element that specializes…', 'Now click the element it specializes.'],
    FeatureTyping: ['Click the ' + M.definable() + ' to define…', 'Now click the definition it is defined by.'],
    ConnectionUsage: ['Click one port or part…', 'Now click the other end.']
  };
  const BASE_NAME = { PartDefinition: 'PartDef', PortDefinition: 'PortDef', PartUsage: 'part', PortUsage: 'port' };
  // Tools that are neither an element kind to place nor a relationship kind to draw (the Note tool): on a click with
  // the tool armed, TOOLS[tool](hit, p, event) runs, with what was clicked, the point on the plane, and the event.
  const TOOLS = {};
  // What a click on a drawn thing with data-action does: ACTIONS[action](hit, p, event), where hit.id is the thing's
  // data-for and hit.view the view it is drawn in. A renderer's own controls (the browser's disclosure) go here.
  const ACTIONS = {};
  // The panel's options for a kind of view: VIEW_PANELS[kind](view, write) fills the kind's div.view-options in
  // #view-fields, which renderViewFields shows for the selected view's kind and hides for the others.
  const VIEW_PANELS = {};
  // What the panel needs to know of a field beyond its row in M.FIELDS, by the field's name. Every field goes the one
  // way panel.js has: shown by its row's type, changed through the same listeners and edit(). A hook says only what
  // the row can't, and is given the field x, { item, type ('el', 'rel' or 'view'), fld, spec, input, hooks }:
  // shown(x), whether the panel shows the field for this item; value(x), the value the field shows, when it isn't
  // the item's property; none, the words for a ref's empty choice ('nothing' unless said); write(x, value), the change,
  // made inside edit(), in place of setting the item's property; said(x), the words for the change, in place of 'Set
  // the <label> of <what> to <value>'; done(x), what the page does once the change is made, or, for a field that takes
  // typing, once the field is left. panel.js has the core's; a feature's page.js adds its own.
  const FIELD_HOOKS = {};

  const $ = (id) => document.getElementById(id);
  const canvas = $('canvas');
  const svg = $('drawing');
  const hint = $('hint');
  const status = $('status');
  const zoomLevel = $('zoom-level');
  const hud = document.querySelector('.hud');
  const eyebrow = document.querySelector('.eyebrow');
  const palette = document.querySelector('.palette');
  const panel = $('panel');
  const showPanel = $('show-panel');
  const inspectorEmpty = $('inspector-empty');
  const fields = $('fields');
  const fKind = $('f-kind');
  const fName = $('f-name');
  const fPath = $('f-path');
  const fViews = $('f-views');
  const addNoteButton = $('add-note');
  const removeFromViewButton = $('remove-from-view');
  const deleteButton = $('delete-selected');
  const viewFields = $('view-fields');
  const vKind = $('v-kind');
  const vName = $('v-name');
  const vShow = $('v-show');
  const vMeta = $('v-meta');
  const vShowAdd = $('v-show-add');
  const deleteViewButton = $('delete-view');
  const problemsList = $('problems-list');
  const problemsButton = $('problems');
  const undoButton = $('undo');
  const newViewButton = $('new-view');
  const newViewKind = $('new-view-kind');
  const list = $('notes-list');
  const notesEmpty = $('notes-empty');
  const notesCount = $('notes-count');
  const where = $('where');
  const warning = $('storage-warning');
  const exportPanel = $('export-panel');
  const exportText = $('export-text');
  const exportProblems = $('export-problems');
  const downloadButton = $('download-state');
  const importButton = $('import-state');
  const fileInput = $('import-file');

  const str = (v, d) => (typeof v === 'string' ? v : (d === undefined ? '' : d));

  Object.assign(C, {
    M, NS, STATE_KEY, CAMERA_KEY, CURRENT, PARTS, WORKING, NOTES, PAUSE, MIN_ZOOM, MAX_ZOOM, HEADER, HEAD_H, LEAD, PAD, CHILD_TOP,
    PORT, MARGIN, MIN_FRAME, VIEW_GAP, HISTORY, NARROW, WHERE, TOOL_TITLE, TOOL_HINT, BASE_NAME, TOOLS, ACTIONS,
    VIEW_PANELS, FIELD_HOOKS, $, canvas, svg, hint, status, zoomLevel, hud, eyebrow, palette, panel, showPanel,
    inspectorEmpty, fields, fKind, fName, fPath, fViews, addNoteButton, removeFromViewButton, deleteButton, viewFields,
    vKind, vName, vShow, vMeta, vShowAdd, deleteViewButton, problemsList, problemsButton, undoButton, newViewButton,
    newViewKind, list, notesEmpty, notesCount, where, warning, exportPanel, exportText, exportProblems, downloadButton,
    importButton, fileInput, str
  });
})(window.SysMLCanvas = { state: {} });   // the object the scripts share, and the state they share in it
