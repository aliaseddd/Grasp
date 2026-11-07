// Annotations in the model library: the code links an element carries, written as textual representations, and
// the notes, open and archived, written as metadata in the standard library's forms.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const { KINDS, FIELDS, str, textName, quote, nameable, RESERVED_NAMES, EXTRA, BODY } = lib;

  Object.assign(FIELDS, {
    // The code links an element carries: a list of { path, language, text }, read by tidyCode. The annotations slice's
    // own section of the panel edits them (there is no #f-code input, so renderExtraFields leaves the field alone).
    code: { type: 'list', label: 'code links', read: tidyCode, fresh: function () { return []; } },
  });

  // Every kind the text declares may carry code links, so the panel's code section and the export's textual
  // representations apply to every such element. A start, done or initial node has no name and no line of its own in
  // the text, so a rep inside it would have nowhere to go: the kinds whose elements have no name in the text don't
  // carry the field.
  Object.keys(KINDS).filter((k) => textName({ kind: k }) !== null).forEach((k) => KINDS[k].fields.push('code'));

  // The names the notes' forms take from the standard library (private import ModelingMetadata::*): a model element
  // named like one of them would shadow the import, and the validator then can't type the metadata.
  ['Issue', 'Rationale', 'StatusInfo', 'StatusKind', 'ModelingMetadata'].forEach((n) => RESERVED_NAMES.add(n));

  // The code links of an element from what a file carries: a list of { path, language, text } strings, the language in
  // lower case; anything that isn't a list is no links. A link with neither a path nor a text is kept: the page adds a
  // link empty and fills it in, and undoing the path must bring the empty link back, not drop it.
  function tidyCode(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    for (const c of raw) {
      if (!c || typeof c !== 'object') continue;
      out.push({ path: str(c.path), language: str(c.language).toLowerCase(), text: str(c.text) });
    }
    return out;
  }
  // A SysML string literal: double quotes, with the backslash, the quote, the line breaks and the tabs escaped.
  function metaString(s) {
    return '"' + String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r\n?/g, '\n').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + '"';
  }
  // A code link as a textual representation inside its element's body: rep '<path>' language "<language>", then the
  // text as the comment body, on the same line when it is one line, else as a block with each line after a star (the
  // form the pilot reads indentation back from). A link with no path takes the bare form, language "…" /* … */. The
  // one change made to the text is that */ is written * /, since it would end the comment.
  function codeLines(depth, link) {
    const ind = '    '.repeat(depth);
    const head = (link.path.trim() ? 'rep ' + quote(link.path) + ' ' : '') + 'language ' + metaString(link.language);
    const text = link.text.replace(/\r\n?/g, '\n').replace(/\*\//g, '* /').replace(/^\n+|\n+$/g, '');
    if (!text) return [ind + head + ' /* */'];
    if (text.indexOf('\n') < 0) return [ind + head + ' /* ' + text + ' */'];
    return [ind + head, ind + '/*'].concat(text.split('\n').map((l) => ind + ' * ' + l)).concat([ind + ' */']);
  }
  // The body writer: every element's code links, after its doc.
  function writeCodeReps(model, el, depth, h) {
    if (!Array.isArray(el.code)) return;
    el.code.forEach((link) => codeLines(depth, link).forEach((l) => h.line(0, l)));
  }
  BODY.push(writeCodeReps);
  // A note on an element the text can't name (it, or what it is in, has no name) can't be about it by name, so it is
  // written inside the element's body, where it annotates the element itself: the unnamed connection's form.
  function writeBodyNotes(model, el, depth, h) {
    if (nameable(model, el, h.ids)) return;
    h.notesOn(el.id).forEach((n) => h.note(depth, n, null));
  }
  BODY.push(writeBodyNotes);

  // The notes the text writes, open and archived together: each with its number (in number order, each number used
  // once, so a note's short name <nN> is its own), its target (an id, or null for a note that floats free on the
  // plane), its text, Claude's response, whether it is resolved, and, for an archived note, that it is and the
  // resolution it was archived with.
  function noteRecords(notes, archive) {
    const take = (list, archived) => (Array.isArray(list) ? list : [])
      .filter((n) => n && typeof n === 'object' && (typeof n.target === 'string' || n.target === null) && typeof n.text === 'string')
      .map((n) => ({
        no: n.no >= 1 ? Math.floor(n.no) : 0, target: n.target, text: n.text, response: str(n.response),
        resolved: n.resolved === true || archived, archived: archived, resolution: archived ? str(n.resolution) : ''
      }));
    const list = take(notes, false).concat(take(archive, true)).map((n, i) => Object.assign(n, { i: i })).sort((a, b) => (a.no - b.no) || (a.i - b.i));
    const used = new Set();
    let top = list.reduce((m, n) => Math.max(m, n.no), 0);
    for (const n of list) {
      if (!n.no || used.has(n.no)) n.no = ++top;
      used.add(n.no);
    }
    return list;
  }
  // A note in the standard library's forms (ModelingMetadata): an Issue named <nN> with the note's text, about what
  // about names (nothing: the statement's owner, which is the package for a free note and the relationship for a note
  // inside its body); a Rationale about the issue with Claude's response, or with the resolution of an archived note,
  // when there is one; and a StatusInfo about it: open, done once the note is resolved, closed once it is archived.
  // text, when given, replaces the note's own (a note on a line that has to be named in it).
  function noteStatements(n, about, text) {
    const name = 'n' + n.no;
    const why = (n.archived ? n.resolution : n.response).trim();
    const out = ['metadata <' + name + '> : Issue' + (about ? ' about ' + about : '') + ' { text = ' + metaString(text === undefined ? n.text : text) + '; }'];
    if (why) out.push('metadata Rationale about ' + name + ' { text = ' + metaString(why) + '; }');
    out.push('metadata StatusInfo about ' + name + ' { status = StatusKind::' + (n.archived ? 'closed' : n.resolved ? 'done' : 'open') + '; }');
    return out;
  }
  EXTRA.tidyCode = tidyCode;
  EXTRA.noteRecords = noteRecords;
  EXTRA.noteStatements = noteStatements;

  Object.assign(lib, { noteRecords, noteStatements });
})(typeof globalThis !== 'undefined' ? globalThis : window);
