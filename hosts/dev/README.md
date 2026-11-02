# The dev host

A plain page that mounts the built app the way the SharePoint hosts do, with the same loader (`app/src/host/load-app.ts`) and nothing SharePoint-specific. It is for development, tests, and comparing screens with `design/screens/html/`. It never ships.

The page's own styles are deliberately hostile: Georgia, purple text, red italic underlined paragraphs, letter-spacing on every `div`. They stand in for SharePoint's and Teams's CSS. If any of it shows inside the app, the shadow root has a hole.

## Commands

Node 22 or later. Build the app first (`cd ../../app && npm run build`).

```sh
npm install
npm run build   # compiles src/ and the two shared host files into dist/
npm start       # http://127.0.0.1:4173/hosts/dev/
npm test        # builds, then runs test/ in Chromium
```

`?app=<url>` on the page loads the app from somewhere else. It exists only here, for development: the web parts have no such setting and always load the app from their own package. The Mount and Unmount buttons exercise what a web part does when it is added, disposed, and added again.

## What the test checks

`test/hello.test.mjs` opens the page in Chromium, the browser Stronghold is built for, and checks what the proof on SharePoint Server will check by hand (`ARCHITECTURE.md`, The proof):

1. The app says "Hello world!" inside a shadow root, and nothing else, with no page errors.
2. The hello module's file is requested on its own, after the entry file.
3. The page's styles stay out: the text is the design's color, size, and font, not red Georgia italics.
4. Inter loads in its three weights, from the app's own files.
5. One script tag per page. Unmount removes the app. A second mount reuses the loaded app without fetching the entry file again.
6. The loader's other paths, from a blank page (`test/fixtures/`): two callers during one load share one script tag and one app; a missing entry file rejects, and so does a second call for it, without a second tag; a file that runs but registers nothing rejects instead of hanging; and the page shows the failure when `?app=` points at nothing.

Playwright is pinned to the version this environment has installed. On another machine, `npx playwright install chromium` once.
