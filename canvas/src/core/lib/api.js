// The model library's last script: SysMLModel, what the page, export.mjs and save-state.mjs use, made of what the
// scripts before it registered. SysMLModelLib is removed, so SysMLModel is all that stays.
(function (root) {
  'use strict';
  const lib = root.SysMLModelLib;
  const {
    METAMODEL, VERSION, FORMAT, VIEW_DEF, KINDS, RELATIONSHIPS, VIEW_KINDS, FIELDS, SIDES, MULTIPLICITY, canContain, admits,
    hasTrait, textName, blank, placement, versionOf, upgrade, normalize, index, relIndex, viewIndex, lookups, reading,
    idsOf, elementsOfKind, linesOfKind, linesFrom, linesTo, linesAt, shownIn, chain, childrenOf, descendants, typingOf,
    inUsage, specializes, commonOwner, isName, quote, qualified, featurePath, an, definable, describe, describeRel,
    describeView, labelFor, inheritedFeatures, inheritedFeature, EXTRA, validate, toSysML
  } = lib;

  // The library, with what the slices put in EXTRA beside it.
  root.SysMLModel = Object.freeze(Object.assign({
    METAMODEL, VERSION, FORMAT, KINDS, RELATIONSHIPS, VIEW_KINDS, FIELDS, SIDES, MULTIPLICITY, VIEW_DEF,
    blank, versionOf, upgrade, normalize, validate, toSysML, placement, canContain, admits, hasTrait, textName, index, relIndex, viewIndex,
    lookups, reading, idsOf, elementsOfKind, linesOfKind, linesFrom, linesTo, linesAt, shownIn, chain, childrenOf,
    descendants, typingOf, inUsage, specializes, commonOwner, featurePath, quote, qualified, describe, describeRel, describeView,
    labelFor, isName, inheritedFeatures, inheritedFeature, an, definable,
  }, EXTRA));
  delete root.SysMLModelLib;
})(typeof globalThis !== 'undefined' ? globalThis : window);
