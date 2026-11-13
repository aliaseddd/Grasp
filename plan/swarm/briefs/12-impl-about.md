# Brief: `12-impl-about`

You are one agent of a swarm that builds slice 1 of Grasp, a SysML v2 design canvas, from a scaffold: the design is written already, as contract comments in skeleton files and as `plan/swarm/step-12.md`. You have this brief and the files it names, and nothing else; you can do the task from them without asking anything. You work in a git worktree that the lead made for you. Its root is the repository's root, and every path below is from there.

## The goal, and why

Build the About panel: replace the body of `About` in `canvas/app/src/shell/About.tsx`, which renders nothing today, with what its contract comment says. It is a Material UI Dialog that the bar's About button opens. It shows the probe's thirteen lines (what this browser lets the page do), a button that remembers a folder, the libraries the page is built on with their versions and licences, the credit to React Flow, and the name of the notices file.

Why: Grasp is opened from disk on machines nobody has measured, and the panel is how a person there, and Claude through them, learns what works. It is also where React Flow is credited, whose mark the planes hide.

The questions themselves, their words and the order of the asking are not yours: they are `canvas/app/src/core/probe.ts`, which is built. You draw what the probe gives.

## Read, in this order

1. `canvas/app/src/shell/About.tsx`, whole: the contract in the component's comment. The constants above it are final.
2. `canvas/app/src/core/probe.ts`: the comments of `Probe`, `ProbeLine`, `ProbeState`, `PROBE_LINES`, `LIBRARIES`, `createProbe` and `browserEnv`. You import them from `'../core'`.
3. `plan/swarm/step-12.md`: section 1, the list under "About" (items 9 to 14); section 3, "The About panel"; section 5, the scenario of `about.png` and the list its reviewer checks: your panel must show every item of that list in a window of 1400 by 900.
4. `canvas/app/src/shell/App.tsx`: how `About` is rendered, and its own Dialog as a model of Material UI's Dialog in this application.
5. `canvas/app/src/shell/theme.ts`: the theme's colours (`primary`, `text.primary`, `text.secondary`, `divider`) and sizes (13 px; 12 px for `caption`).
6. `canvas/app/src/shell/TopBar.tsx`, the item on the keys in its contract: why the panel must be a modal dialog.
7. `canvas/app/test/about.test.mjs` and `canvas/app/test/shots/about.mjs`: the tests and the shot you are to satisfy.

## The files you own

`canvas/app/src/shell/About.tsx`. Nothing else. No stylesheet: colours and sizes come from the theme, in `sx`.

## The tests and the commands

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/; a browser test opens the built page, so build before you run one
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Do not run `npm test`, the whole suite: other agents share this machine, and the lead runs it alone. A timed test is judged by the lead alone: a time taken while other agents work proves nothing. If a timed test fails beside your work, say so in what you send back and go on. `canvas/dist/` is built to run the tests and is not handed over: the lead builds it.

`npm run build`, then:

- `node --test --test-timeout=120000 canvas/app/test/about.test.mjs`: seven tests.
- `npm run shots -- about`, which writes `canvas/app/shots/about.png`. Look at it against the list in section 5 of `plan/swarm/step-12.md`. You do not hand the image over: the lead takes it again.
- `node --test --test-timeout=120000 canvas/app/test/shell.test.mjs`, `canvas/app/test/keys.test.mjs` and `canvas/app/test/build.test.mjs`, which must go on passing: the page asks for nothing outside its own folder as it opens, so nothing may be asked, and no probe made, before the panel is first opened.

Everything of Material UI is imported from `'@mui/material'`, which `vendor.ts` holds whole. No icon is added: a line's mark is drawn in CSS, and the spinner is Material UI's CircularProgress.

If a test fails for a reason that lies in `probe.ts` (a line's words, what `browserEnv()` reads) or in `TopBar.tsx`, stop on it and say what you saw: those files are not yours.

## What done is

- The seven tests of `about.test.mjs` pass, and `shell.test.mjs`, `keys.test.mjs` and `build.test.mjs` still pass.
- `npm run shots -- about` writes an image in which every item of the reviewer's list is present.
- `npm run build` and then `npm run check` pass.
- Only `canvas/app/src/shell/About.tsx` differs from what you were given.

## What to send back

Your last message is read by the lead, who has read your diff first. Keep it to what the diff does not say:

1. The tests you ran and what each file reported (how many passed).
2. Each thing the contract left open that you settled, one line each, with what you chose and why.
3. Anything in a contract, a signature or a test that you found wrong, with the evidence (file and line, or what you ran). Stop on what depends on it, say so, and finish the rest.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

## Two sayings

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.
