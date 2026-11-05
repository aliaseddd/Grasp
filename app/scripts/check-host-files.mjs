// Compiles the two files every host copies (src/host/*.ts) with TypeScript 2.4.2, the compiler SPFx 1.4.1 uses.
// A construct the Server host can't understand fails here, in seconds, instead of in the Node 8 build.
// Run with `npm run check:host` or as part of `npm test`.

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

// package.json installs typescript@2.4.2 under the name typescript-2.4, next to the current TypeScript.
const tsc = require.resolve('typescript-2.4/bin/tsc');

// tsconfig.host-check.json names the two files and uses the Server host's target and library, with strict checks
// and no automatic @types, which a 2.4 compiler can't parse.
const args = [tsc, '-p', path.join(appDir, 'scripts', 'tsconfig.host-check.json')];

const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
if (result.status !== 0) {
  console.error('\nThe host files do not compile with TypeScript 2.4.2. See app/src/host/README.md for what it understands.');
  process.exit(result.status ?? 1);
}
console.log('OK: src/host/*.ts compile with TypeScript 2.4.2, the SPFx 1.4.1 compiler.');
