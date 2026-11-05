const spfxProfile = require('@microsoft/eslint-config-spfx/lib/flat-profiles/default');

module.exports = [
  ...spfxProfile,
  {
    // Build outputs. The profile skips release/ but not the packager's debug copy under sharepoint/, which
    // holds the app's minified files from the previous build.
    ignores: ['sharepoint/**', 'temp/**', 'lib*/**', 'dist/**']
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json'
      }
    }
  }
];
