// Builds the spike into dist/ (ignored by git): the three pages' bundles as classic scripts, and the fixture as a
// classic script that puts it on window.GEO_FIXTURE (a page opened from disk cannot fetch a file beside it).
//   node plan/spikes/geometry/build.cjs
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const here = __dirname;
const dist = path.join(here, 'dist');
fs.mkdirSync(dist, { recursive: true });
const fixture = fs.readFileSync(path.join(here, '..', '..', '..', 'canvas', 'test', 'fixtures', 'geometry.json'), 'utf8');
fs.writeFileSync(path.join(dist, 'fixture.js'), 'window.GEO_FIXTURE = ' + JSON.stringify(JSON.parse(fixture)) + ';\n');
for (const [entry, out] of [['page-a.jsx', 'a'], ['page-b.jsx', 'b'], ['nest.jsx', 'nest']]) {
  esbuild.buildSync({
    entryPoints: [path.join(here, entry)], bundle: true, format: 'iife', jsx: 'automatic', minify: true,
    define: { 'process.env.NODE_ENV': '"production"' }, outfile: path.join(dist, out + '.js'), logLevel: 'warning',
  });
  // A bundle that imports no stylesheet writes none: the page's <link> must still find a file.
  if (!fs.existsSync(path.join(dist, out + '.css'))) fs.writeFileSync(path.join(dist, out + '.css'), '');
  console.log(out + '.js', fs.statSync(path.join(dist, out + '.js')).size, 'bytes');
}
