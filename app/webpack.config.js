'use strict';

// The app's build. One entry file plus one file per module, all flat in dist/, ready to be copied into a host's
// package as they are. README.md says why webpack and not Vite.

const path = require('node:path');
const webpack = require('webpack');
const pkg = require('./package.json');

/**
 * Writes dist/stronghold-app.json, which names the entry file. Every file in dist/ carries a hash of its contents,
 * the entry included, so a host's build reads the entry's name from here (hosts/server and hosts/online, scripts/prepare-shared.js) and
 * the dev page fetches it. No fixed name, so no browser cache can pair an old entry file with new module files.
 */
class EntryNamePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('EntryNamePlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: 'EntryNamePlugin', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE },
        () => {
          const files = compilation.entrypoints.get('stronghold-app').getFiles().filter((file) => file.endsWith('.js'));
          const manifest = { entry: files[0], version: pkg.version };
          compilation.emitAsset('stronghold-app.json', new webpack.sources.RawSource(JSON.stringify(manifest, null, 2) + '\n'));
        },
      );
    });
  }
}

module.exports = () => ({
  entry: {
    // dist/stronghold-app.<hash>.js, named in dist/stronghold-app.json (EntryNamePlugin above).
    'stronghold-app': './src/main.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    // Module files: dist/stronghold-app.hello.1a2b3c4d.js. The name comes from the webpackChunkName comment in
    // src/shell/registry.ts; the hash changes when the module's code does, so SharePoint never serves a stale copy.
    chunkFilename: 'stronghold-app.[name].[contenthash:8].js',
    // Fonts and other files the code imports: dist/stronghold-app.inter-latin-400-normal.1a2b3c4d.woff2.
    assetModuleFilename: 'stronghold-app.[name].[contenthash:8][ext]',
    // Everything stays flat and starts with "stronghold-app." because SharePoint's package deploys it next to the
    // host's own bundle, in one folder.
    //
    // 'auto': at run time the entry file reads its own URL from the <script> element that loaded it and fetches
    // module files and fonts from the same folder. So the build doesn't need to know where SharePoint will put it.
    publicPath: 'auto',
    // The entry file's exports become window.Stronghold. That's how a host finds mount() without inline script.
    library: { name: 'Stronghold', type: 'window' },
    // Namespaces webpack's runtime globals (the chunk-loading array and the data-webpack marker), so the app can't
    // collide with SharePoint's own webpack bundles, nor with another version of itself if two ever meet on a page.
    uniqueName: 'stronghold-' + pkg.version,
    clean: true,
  },
  // .browserslistrc: Chrome only.
  target: 'browserslist',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' },
      // CSS comes in as a string: the shell puts it in a stylesheet inside its shadow root (src/shell/styles.ts).
      { test: /\.css$/, type: 'asset/source' },
      // Fonts come in as URLs and are copied to dist/ (src/shell/fonts.ts).
      { test: /\.woff2$/, type: 'asset/resource' },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({ __APP_VERSION__: JSON.stringify(pkg.version) }),
    new EntryNamePlugin(),
  ],
  optimization: {
    // Keep webpack's runtime inside the entry file: a host loads exactly one file to start.
    runtimeChunk: false,
  },
  performance: { hints: false },
});
