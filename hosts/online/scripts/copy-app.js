'use strict';

// Copies the app's build (app/dist) into release/assets, the folder `heft package-solution --production` zips
// into the .sppkg as client-side assets (every file there but source maps). That is how the app ships inside this
// package, next to the web part's own bundle, so the web part finds it under the same base URL
// (StrongholdWebPart.ts, _appUrls).
// Run after `heft test --clean --production`, which creates release/assets, and before `heft package-solution`.

const fs = require('fs');
const path = require('path');

const from = path.resolve(__dirname, '..', '..', '..', 'app', 'dist');
const to = path.resolve(__dirname, '..', 'release', 'assets');

if (!fs.existsSync(path.join(from, 'stronghold-app.json'))) {
  console.error('No app build in ' + from + '. Run `npm run build` in app/ first.');
  process.exit(1);
}
if (!fs.existsSync(to)) {
  console.error('No ' + to + '. Run `heft test --clean --production` first.');
  process.exit(1);
}

let copied = 0;
for (const name of fs.readdirSync(from)) {
  const source = path.join(from, name);
  if (!fs.statSync(source).isFile()) {
    continue; // the build is flat on purpose (app/webpack.config.js)
  }
  if (/\.map$/.test(name)) {
    continue; // source maps stay out of the package; the packager leaves its own out too
  }
  fs.copyFileSync(source, path.join(to, name));
  copied++;
}
console.log('Copied ' + copied + ' app files into ' + to);
