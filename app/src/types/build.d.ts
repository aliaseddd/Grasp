// What the build provides to the code. See webpack.config.js.

/** The app's version, from package.json (DefinePlugin). */
declare const __APP_VERSION__: string;

/** A CSS file imported as its text (module.rules, asset/source). */
declare module '*.css' {
  const source: string;
  export default source;
}

/** A font file imported as the URL it will have at run time (module.rules, asset/resource). */
declare module '*.woff2' {
  const url: string;
  export default url;
}
