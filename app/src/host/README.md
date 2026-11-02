# The host files

`ARCHITECTURE.md` ("The app and its hosts", proposed) makes `HostServices` the only code every toolchain compiles. This proof adds one more file to that set, the loader, because both hosts load the app the same way and one copy of that logic is better than two. Both wait for Damon's approval; the root README lists the deviation.

- `host-services.ts`: the contract. What a host gives the app, what it gets back, and the `window.Stronghold` global.
- `load-app.ts`: how a host loads the app's entry file into a page.

Each host copies them into its own `src/shared/` folder before it builds (`hosts/*/scripts/prepare-shared.js`), next to a generated `app-entry.ts` that names the app's entry file. The copies are generated and not committed, so this folder is the one place to edit them.

## The oldest compiler sets the rules

The Server host is built with SPFx 1.4.1, whose TypeScript is 2.4, and its `--ship` build fails on any tslint warning. So these files use only what that compiler and that lint accept:

- No `unknown` (it came in TypeScript 3.0), no `import type`, no `?.` or `??`, no `!:` on class fields.
- No ES2015 library calls such as `Array.prototype.find` or `String.prototype.endsWith`, because the Server host targets ES5 with the `es5` library.
- Concrete types everywhere: a type on every variable, and no `any`. `ARCHITECTURE.md` says "`any` rather than `unknown`", meaning that `unknown` isn't available; the Server build's lint (`no-any`) rules out `any` as well, so the shared files use neither. The global is typed instead: `window.Stronghold` is declared in `host-services.ts`.
- No two blank lines in a row.
- Interface names don't need an `I` prefix: that rule is switched off in `hosts/server/config/tslint.json`, because `HostServices` is the name Damon decided on.

`npm test` in `app/` runs `scripts/check-host-files.mjs`, which compiles these two files with TypeScript 2.4.2 and fails if they use something it can't understand. That way a mistake shows up in seconds here, not in the Node 8 build. The lint rules are checked by the Server build itself.
