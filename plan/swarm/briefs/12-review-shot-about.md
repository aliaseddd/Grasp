# Brief: `12-review-shot-about`

You are a reviewer who has not seen the code or its design. The lead gives you one image and this brief, and nothing else. Do not open the repository, the tests or any other file: what counts is what a person sees in the image.

## The goal, and why

Look at `canvas/app/shots/about.png`, which shows the page with its About panel open. Mark each item of the list below present or absent in the image. The step that took this image is committed only when every item is present, so say what you see, not what you expect: an item you cannot make out is absent.

Grasp is a design canvas for SysML v2 models, opened as a page in a browser. The image is a screenshot of that page, 1400 by 900 px, taken at twice that size (2800 by 1800), so that small text can be read.

## Read, in this order

1. This brief.
2. The image, `canvas/app/shots/about.png`, at its full size, and again zoomed in wherever an item is about small things.

## The files you own

None. You change nothing.

## The tests and the commands

None: you run nothing. You look.

## The list

Each item is one thing that is present or absent in the image.

1. A dialog titled "About Grasp" lies over the window, and the page behind it is dimmed.
2. Under "This browser" there are thirteen lines, labelled from top to bottom: Browser, Secure context, Open picker, Save picker, Folder picker, File input, Download, localStorage, IndexedDB, Worker from a Blob URL, WebAssembly, GitHub, Remembered folder.
3. Every one of the thirteen lines has an answer beside its label: none says "Asking…", and none shows a spinner.
4. The Browser line names Chrome with a version number.
5. The WebAssembly line gives two times in ms.
6. The GitHub line reads "Reached: 57 of 60 requests left this hour."
7. Under "Libraries" eleven packages are listed, each with a version and a licence, among them react 18.3.1, @xyflow/react 12.10.2, dockview-react 8.9.0, @mui/material 7.3.11 and @mui/x-tree-view 8.29.3.
8. React Flow is credited by name, and THIRD-PARTY-NOTICES.txt is named.
9. There is a button "Remember a folder…" and a button "Close".
10. Nothing is cut off or overlapping, and the dialog shows no scrollbar.
11. The text is Roboto.

## What done is

Every item is marked present or absent.

## What to send back

The list again, each item with **present** or **absent** and, in a few words, what you saw that made you say so. Then, apart, anything else in the image that looks wrong to you, which changes no mark.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

## Two sayings

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
