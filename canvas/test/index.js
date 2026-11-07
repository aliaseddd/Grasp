// Makes `node --test canvas/test/` work on Node 22, whose test runner takes a positional path as a file to run and
// resolves a folder through its index.js: this loads every *.test.mjs in the folder into one process, where each
// file's describe() keeps its own browser. The folder is then one test file to the runner, so a --test-timeout
// bounds the whole suite, which takes about three minutes with its twenty-seven browsers, the scale tests seventy
// seconds of it: give none, or 360000 or more. The documented command, `node --test --test-timeout=120000
// canvas/test/*.test.mjs`, runs the same files one process each, several at once, and its timeout bounds each file.
'use strict';

const fs = require('node:fs');
const path = require('node:path');

for (const file of fs.readdirSync(__dirname).filter((name) => name.endsWith('.test.mjs')).sort()) {
  require(path.join(__dirname, file));
}
