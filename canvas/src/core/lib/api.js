// The model library's last script: SysMLModel, what the page, export.mjs and save-state.mjs use, made of what the
// scripts before it registered, the same names as ever. SysMLModelLib is removed, so SysMLModel is all that stays.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const {
    FORMAT, VIEW_DEF, KINDS, RELATIONSHIPS, VIEW_KINDS, FIELDS, SIDES, MULTIPLICITY, canContain, admits, hasTrait,
    textName, blank, placement, normalize, index, relIndex, viewIndex, shownIn, chain, childrenOf, descendants,
    typingOf, inUsage, specializes, commonOwner, isName, quote, qualified, featurePath, an, definable, describe,
    describeRel, describeView, labelFor, inheritedFeatures, EXTRA, validate, toSysML
  } = lib;

  // The library, with what the slices put in EXTRA beside it.
  root.SysMLModel = Object.freeze(Object.assign({
    FORMAT, KINDS, RELATIONSHIPS, VIEW_KINDS, FIELDS, SIDES, MULTIPLICITY, VIEW_DEF,
    blank, normalize, validate, toSysML, placement, canContain, admits, hasTrait, textName, index, relIndex, viewIndex, shownIn, chain, childrenOf,
    descendants, typingOf, inUsage, specializes, commonOwner, featurePath, quote, qualified, describe, describeRel, describeView,
    labelFor, isName, inheritedFeatures, an, definable,
  }, EXTRA));
  delete root.SysMLModelLib;
})(typeof globalThis !== 'undefined' ? globalThis : window);
