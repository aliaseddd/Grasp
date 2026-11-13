# Brief: `12-impl-validation`

You are one agent of a swarm that builds slice 1 of Grasp, a SysML v2 design canvas, from a scaffold: the design is written already, as contract comments in skeleton files and as `plan/swarm/step-12.md`. You have this brief and the files it names, and nothing else; you can do the task from them without asking anything. You work in a git worktree that the lead made for you. Its root is the repository's root, and every path below is from there.

## The goal, and why

Build the Validation panel: replace the body of `ValidationPanel` in `canvas/app/src/panels/Validation.tsx`, which shows a placeholder today, with what its contract comment says. The panel lists what the open file's checks found: Grasp's own problems, and the diagnostics of the SysML v2 specification's rules in SysON's words. A click on an entry picks what the entry is about, through the session's selection.

Why it listens only while it is shown: a side panel stays mounted while its tab is hidden, and a check of a 5,000-element model takes about 40 ms. The checks run only while they have a listener, so a panel that is not shown must not listen.

When the checks run, and what an entry is about, are not yours: they are `canvas/app/src/core/checks.ts`, which is built. You draw what it gives, and you are its only listener.

## Read, in this order

1. `canvas/app/src/panels/Validation.tsx`, whole: the contract in the component's comment. The constants above it are final.
2. `canvas/app/src/core/checks.ts`: the comments of `Checks`, `ChecksState`, `Found`, `checksOf`, `EntryAbout`, `aboutProblem` and `aboutDiagnostic`. You import them from `'../core'`.
3. `canvas/app/src/core/selection.ts`: the comment of `Selection` (`set`, `has`, `listen`) and `selectionOf`.
4. `plan/swarm/step-12.md`: section 1, the list under "Validation" (items 1 to 8); section 3, "The Validation panel".
5. `plan/swarm/shared.md`, section 3, "How a side panel is put into the dock"; `canvas/app/src/panels/SidePanel.tsx`; `canvas/app/src/shell/dockContext.ts`.
6. `canvas/app/src/plane/Plane.tsx`, the item "The gate" of its contract and the layout effect with the ResizeObserver in `Plane`: the model for your gate.
7. `canvas/app/src/shell/theme.ts`: the theme's colours and sizes.
8. `canvas/app/test/validation.test.mjs`: the tests you are to make pass.

## The files you own

`canvas/app/src/panels/Validation.tsx`. Nothing else. No stylesheet: colours and sizes come from the theme, in `sx`.

## The tests and the commands

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/; a browser test opens the built page, so build before you run one
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Do not run `npm test`, the whole suite: other agents share this machine, and the lead runs it alone. A timed test is judged by the lead alone: a time taken while other agents work proves nothing. If a timed test fails beside your work, say so in what you send back and go on. `canvas/dist/` is built to run the tests and is not handed over: the lead builds it.

`npm run build`, then:

- `node --test --test-timeout=120000 canvas/app/test/validation.test.mjs`: six tests. Four of them pick a box on a plane and type a name into Details; your worktree holds steps 9 and 10 for that.
- `node --test --test-timeout=120000 canvas/app/test/shell.test.mjs` and `canvas/app/test/open.test.mjs`, which must go on passing.

Everything of Material UI is imported from `'@mui/material'`, which `vendor.ts` holds whole.

The panel must render with no file open, since it is mounted from the page's start, and must follow the session when another file is opened. It draws nothing on a plane: badges are slice 2's.

If a test fails for a reason that lies in `checks.ts`, in the selection, in a plane or in Details, stop on it and say what you saw: those files are not yours.

## What done is

- The six tests of `validation.test.mjs` pass, and `shell.test.mjs` and `open.test.mjs` still pass.
- `npm run build` and then `npm run check` pass.
- Only `canvas/app/src/panels/Validation.tsx` differs from what you were given.

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
