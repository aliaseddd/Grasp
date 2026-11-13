# Brief: `12-review-shot-example`

You are a reviewer who has not seen the code or its design. The lead gives you one image and this brief, and nothing else. Do not open the repository, the tests or any other file: what counts is what a person sees in the image.

## The goal, and why

Look at `canvas/app/shots/example.png`, which shows the page with an example model open: one view, a diagram of boxes and lines, fitted to the window, with the side panels collapsed. Mark each item of the list below present or absent in the image. Then rate the image on four points. The step that took this image is committed only when every item is present, and when each of the four scores is 4 or more, so say what you see, not what you expect: an item you cannot make out is absent.

Grasp is a design canvas for SysML v2 models, opened as a page in a browser. The image is a screenshot of that page, 1400 by 900 px, taken at twice that size (2800 by 1800), so that small text can be read.

## Read, in this order

1. This brief.
2. The image, `canvas/app/shots/example.png`, at its full size, and again zoomed in wherever an item is about small things.

## The files you own

None. You change nothing.

## The tests and the commands

None: you run nothing. You look.

## The list

Each item is one thing that is present or absent in the image.

1. The example is fitted: the whole view lies on the plane.
2. `Page` holds `hosts` and `app`.
3. Each `api` port lies across its owner's border.
4. Each port's name is outside its owner.
5. `mount` joins the two ports.
6. The three specializations end in a hollow triangle at `Host`: three lines that join into one trunk, with one hollow triangle at `Host`'s bottom middle.
7. The two defined-by lines, each with its two dots.
8. No line passes through a name.

## The four points

Rate the image from 1 to 5 on each of these four points, in whole numbers: 1 is a broken layout, 3 a working prototype, 5 a finished workbench of the kind of SysON's (a professional modelling tool in a browser).

1. Alignment and spacing.
2. Type and contrast.
3. Nothing cut off or overlapping.
4. Boxes and lines easy to read.

## What done is

Every item is marked present or absent, and each of the four points has its score.

## What to send back

The list again, each item with **present** or **absent** and, in a few words, what you saw that made you say so. Then the four scores, each with one sentence of reason. For a score under 4, say what in the image costs the point and where it is. Then, apart, anything else in the image that looks wrong to you, which changes no mark.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

## Two sayings

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
