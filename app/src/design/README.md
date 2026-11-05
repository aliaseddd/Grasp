# Design files

`tokens.css` is a byte-for-byte copy of `design/tokens/tokens.css` from the Stronghold repository at commit `71021c2` (November 2, 2026). The design is the source of truth (`design/README.md`, "Source of truth"); when it changes, copy the file again. Don't edit it here.

The shell swaps `:root` for `:host` when it builds its stylesheet (`../shell/styles.ts`), because the tokens live inside a shadow root in the app.
