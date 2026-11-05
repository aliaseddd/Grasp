# Teams icons

Teams shows two icons for a tab: a 192 × 192 color icon and a 32 × 32 white-on-transparent outline icon. SPFx packages them from `hosts/online/teams/`, named after the web part's id. The SPFx generator ships placeholder icons; these are the Keep mark instead, taken from `design/assets/logo/` in the Stronghold repository and rendered to PNG by Chromium.

- `icons.html` holds the two marks at their sizes: the tile (`stronghold-mark-tile.svg`) and the glyph (`stronghold-mark-glyph.svg`) filled white.
- `render.mjs` screenshots them into `hosts/online/teams/`. It is not in that folder because the packager puts everything in `teams/` into the package.
