// Criterion 3 of slice 2 as a test (plan/slice-2.md, sections 7, 9 and 10): everything a person can do on the old
// page is a line of section 7, 112 of them, and each line names the test that proves it on the new page, as
// `file › name`. This test reads those tables out of the plan and looks for each name among the tests its file
// declares. It is check 3 of plan/status.json, "the Playwright suite, rewritten for the new page, passes".
//
// The scaffold (package 2-1) wrote it first and marked it todo: 38 lines name a test of slice 1 and one a test of the
// scaffold, which are written already; the others name a test that its package writes first, under exactly the
// plan's name. So it fails until the last package has landed, and node's runner reports that failure as todo. Its
// failure lists every name that is missing, package by package. The lines of slice 1 and of the scaffold come first
// and are counted in its first line: a name missing there is no test still to be written, it is a test that was
// renamed or lost, or a name the plan has otherwise than the test. Package 2-14 owns the file and takes the todo mark
// off when it closes the slice.
//
// What "exists under that name" means here. The file the line gives is read as text, and the name must be the title
// of a test in it: the first argument of a call of test(), written as one string in the source. A name is compared as
// the source has it, so a title that is a template with a placeholder is found with the placeholder in it (lines 34
// and 35 name `every tool of ${w.name} row is used once: …`, which tools.test.mjs declares once for each view kind).
// A name that stands only in a comment is not a test, and a call of test() after `//` on its line is not one either.
// Whether the test passes is the runner's to say: before package 2-15 the lead counts the 112 names against the
// runner's list of passing tests (section 8, "Package 2-15", "Before it runs").

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { ROOT } from './core.mjs';

/** The plan, whose section 7 is the list. */
const PLAN = path.join(ROOT, 'plan', 'slice-2.md');
/** Where a line's test file is. */
const TESTS = path.join(ROOT, 'canvas', 'app', 'test');
/** Criterion 3's N: "N is 112" (section 7), approved with the plan. A list of another length is not that list. */
const N = 112;

/**
 * The lines of section 7: `{ n, can, by, file, name }` for each row of its tables, in the plan's order, and what is
 * wrong with the tables themselves, one sentence each. A row is `| n | A person can | Built by | \`file › name\` |`.
 */
function capabilities(plan) {
  const from = plan.indexOf('\n## 7. ');
  const to = plan.indexOf('\n## 8. ');
  const wrong = [];
  if (from < 0 || to < from) return { lines: [], wrong: ['plan/slice-2.md has no section 7 before a section 8.'] };
  const lines = [];
  for (const row of plan.slice(from, to).split('\n')) {
    if (!/^\| \d+ \|/.test(row)) continue;
    const cells = row.replace(/^\|/, '').replace(/\|\s*$/, '').split(' | ').map((cell) => cell.trim());
    const named = cells.length === 4 ? cells[3].match(/^`([^`›]+\.test\.mjs) › ([^`]+)`$/) : null;
    if (!named) { wrong.push(`Line ${cells[0]} of section 7 does not read "| n | A person can | Built by | \`file › name\` |": ${row}`); continue; }
    lines.push({ n: Number(cells[0]), can: cells[1], by: cells[2], file: named[1], name: named[2] });
  }
  if (lines.length !== N) wrong.push(`Section 7 holds ${lines.length} lines, not the ${N} of criterion 3.`);
  const misnumbered = lines.findIndex((line, i) => line.n !== i + 1);
  if (misnumbered >= 0) wrong.push(`The lines of section 7 are not numbered from 1 without a gap: line ${misnumbered + 1} is numbered ${lines[misnumbered].n}.`);
  return { lines, wrong };
}

/**
 * The titles of the tests a file declares: the first argument of each call of test(), where it is one string. A
 * string in quotes is given as it reads once its escapes are taken out; a template is given as the source has it,
 * `${…}` and all. A call after `//` on its line, or on a line of a block comment, is not counted, nor is one whose
 * title is a name or is put together from parts.
 */
function titlesIn(source) {
  const titles = new Set();
  const call = /(?<![\w.$])test\(\s*(['"`])/g;
  for (let found = call.exec(source); found; found = call.exec(source)) {
    const lineStart = source.lastIndexOf('\n', found.index) + 1;
    const before = source.slice(lineStart, found.index);
    if (before.includes('//') || /^\s*\/?\*/.test(before)) continue;
    const quote = found[1];
    let title = '';
    let at = call.lastIndex;
    let depth = 0; // inside the ${ } of a template, where a quote does not end the title
    for (; at < source.length; at++) {
      const c = source[at];
      if (c === '\\') {
        const next = source[at + 1];
        title += quote === '`' && depth ? c + next : ({ n: '\n', t: '\t' })[next] ?? next;
        at++;
      } else if (quote === '`' && c === '$' && source[at + 1] === '{') { depth++; title += '${'; at++; }
      else if (depth && c === '{') { depth++; title += c; }
      else if (depth && c === '}') { depth--; title += c; }
      else if (c === quote && !depth) break;
      else title += c;
    }
    // One string and nothing more: a title put together from parts ('a' + b) is not found by what its first part says.
    if (at < source.length && /^\s*[,)]/.test(source.slice(at + 1))) titles.add(title);
  }
  return titles;
}

test('every capability of plan/slice-2.md names a test that exists under that name', { todo: 'Most of the 74 tests that slice 2 writes are not written yet: each package writes its own first. Package 2-14 takes this mark off at the slice\'s close.' }, () => {
  const { lines, wrong } = capabilities(fs.readFileSync(PLAN, 'utf8'));
  const titles = new Map();
  const titlesOf = (file) => {
    if (!titles.has(file)) {
      const at = path.join(TESTS, file);
      titles.set(file, fs.existsSync(at) ? titlesIn(fs.readFileSync(at, 'utf8')) : null);
    }
    return titles.get(file);
  };
  const missing = lines.filter((line) => !titlesOf(line.file)?.has(line.name));
  if (!wrong.length && !missing.length) return;

  // What is missing, by who builds it: slice 1's and the scaffold's first, since their tests exist already and a
  // name that went missing there is a test that was renamed or lost, not one still to be written.
  const due = (line) => /^slice 1/.test(line.by) || line.by === '2-1';
  const order = (by) => (/^slice 1/.test(by) ? [0, 0] : by.split('-').map(Number));
  const groups = [...new Set(missing.map((line) => line.by))].sort((a, b) => order(a)[0] - order(b)[0] || order(a)[1] - order(b)[1]);
  const said = [];
  if (missing.length) {
    const lost = missing.filter(due).length;
    said.push(`${missing.length} of the ${lines.length} capabilities of plan/slice-2.md, section 7, name a test that does not exist under that name`
      + ` (${lost} of them a test of slice 1 or of the scaffold, which should exist today):`);
  }
  said.push(...wrong);
  for (const by of groups) {
    const mine = missing.filter((line) => line.by === by);
    said.push(`  ${/^slice 1/.test(by) ? by : `package ${by}`}, ${mine.length} missing:`);
    for (const line of mine) said.push(`    ${line.n}. ${line.file} › ${line.name}${titlesOf(line.file) ? '' : '  (no such file)'}`);
  }
  assert.fail(said.join('\n'));
});
