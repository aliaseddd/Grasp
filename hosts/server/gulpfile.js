'use strict';

// SPFx 1.4.1's build, unchanged from what its generator writes. The steps around it, copying the shared files in
// and the app's build out, are plain Node scripts in scripts/, run by `npm run build` (package.json).

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

build.initialize(require('gulp'));
