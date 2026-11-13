# Brief: `12-impl-bar`

You are one agent of a swarm that builds slice 1 of Grasp, a SysML v2 design canvas, from a scaffold: the design is written already, as contract comments in skeleton files and as `plan/swarm/step-12.md`. You have this brief and the files it names, and nothing else; you can do the task from them without asking anything. You work in a git worktree that the lead made for you. Its root is the repository's root, and every path below is from there.

## The goal, and why

Enable the bar's About button. In `canvas/app/src/shell/TopBar.tsx` the button `about` is disabled and its handler unused; step 12 enables it, with a file open or not, and has a click call `onAbout`, which `App` already hands to the bar and which opens the About panel. That is the whole change. It is a task of its own because `TopBar.tsx` is one file and the About panel another, built by another agent at the same time.

## Read, in this order

1. `canvas/app/src/shell/TopBar.tsx`, whole: the contract in the component's comment, where the item on Open and About ends "About is disabled until step 12, which enables it, with or without a file open, and has it call `onAbout`". The item on the keys says that they do nothing behind a modal dialog; the About panel is one, and you change nothing for it.
2. `canvas/app/src/shell/App.tsx`: where `onAbout` comes from.
3. `plan/swarm/step-12.md`, section 3, "The About panel", the row "The bar's button".
4. `canvas/app/test/about.test.mjs`: its helper `openAbout` and its first test.

## The files you own

`canvas/app/src/shell/TopBar.tsx`. Nothing else.

## The tests and the commands

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/; a browser test opens the built page, so build before you run one
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Do not run `npm test`, the whole suite: other agents share this machine, and the lead runs it alone. A timed test is judged by the lead alone: a time taken while other agents work proves nothing. If a timed test fails beside your work, say so in what you send back and go on. `canvas/dist/` is built to run the tests and is not handed over: the lead builds it.

`npm run build`, then:

- `node --test --test-timeout=120000 canvas/app/test/about.test.mjs`. Before your change every test fails with `About is disabled (data-testid "about"), so the About panel cannot be opened.` After it, while the panel itself is not built, every test fails with `A click on About showed no About panel (data-testid "about-panel").` That second sentence is what you are to see: the panel is another agent's.
- `node --test --test-timeout=120000 canvas/app/test/shell.test.mjs` and `node --test --test-timeout=120000 canvas/app/test/keys.test.mjs`, which pass before your change and must pass after it.

Keep the button's `data-testid`, its `aria-label` ("About Grasp"), its tooltip and its place at the bar's right end. Take the underscore off the unused `onAbout` and the "until step 12" out of the comments that no longer hold.

## What done is

- About is enabled with no file open and with one, and a click calls `onAbout`.
- `about.test.mjs` fails only for want of the panel; `shell.test.mjs` and `keys.test.mjs` pass.
- `npm run build` and then `npm run check` pass.
- Only `canvas/app/src/shell/TopBar.tsx` differs from what you were given.

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
