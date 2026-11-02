'use strict';

// Copies the app's build (app/dist) into temp/deploy, the folder `gulp package-solution --ship` zips into the
// .sppkg as client-side assets. That is how the app ships inside this package, next to the web part's own bundle,
// so the web part finds it under the same base URL (StrongholdWebPart.ts, _appUrls).
// Run after `gulp bundle --ship`, which creates temp/deploy, and before `gulp package-solution --ship`.
// Plain Node 8 JavaScript, because this host builds on Node 8.

var fs = require('fs');
var path = require('path');

var from = path.resolve(__dirname, '..', '..', '..', 'app', 'dist');
var to = path.resolve(__dirname, '..', 'temp', 'deploy');

if (!fs.existsSync(path.join(from, 'stronghold-app.json'))) {
  console.error('No app build in ' + from + '. Run `npm run build` in app/ first.');
  process.exit(1);
}
if (!fs.existsSync(to)) {
  console.error('No ' + to + '. Run `gulp bundle --ship` first.');
  process.exit(1);
}

var copied = 0;
fs.readdirSync(from).forEach(function (name) {
  var source = path.join(from, name);
  if (!fs.statSync(source).isFile()) {
    return; // the build is flat on purpose (app/webpack.config.js)
  }
  if (/\.map$/.test(name)) {
    return; // source maps stay out of the package, as SPFx keeps its own out
  }
  fs.copyFileSync(source, path.join(to, name));
  copied++;
});
console.log('Copied ' + copied + ' app files into ' + to);
