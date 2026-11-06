// Makes `node --test canvas/test/` work on Node 22, whose test runner takes a positional path as a file to run and
// resolves a folder through its index.js: this loads every *.test.mjs in the folder into one process, where each
// file's describe() keeps its own browser. `node --test canvas/test/*.test.mjs` runs the same files, one process each.
'use strict';

const fs = require('node:fs');
const path = require('node:path');

for (const file of fs.readdirSync(__dirname).filter((name) => name.endsWith('.test.mjs')).sort()) {
  require(path.join(__dirname, file));
}
