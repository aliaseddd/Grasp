# Brief: `12-impl-probe`

You are one agent of a swarm that builds slice 1 of Grasp, a SysML v2 design canvas, from a scaffold: the design is written already, as contract comments in skeleton files and as `plan/swarm/step-12.md`. You have this brief and the files it names, and nothing else; you can do the task from them without asking anything. You work in a git worktree that the lead made for you. Its root is the repository's root, and every path below is from there.

## The goal, and why

Fill in `canvas/app/src/core/probe.ts`: `browserOf`, `createProbe` and `browserEnv`, whose bodies throw today. The file finds out what this browser lets the page do, one line for each question, for the About panel, which another agent builds from the same contract: the browser's version, whether the page is a secure context, the three file pickers, the file input and download, localStorage, IndexedDB, a worker made from a Blob URL, WebAssembly with a timing loop, a request to GitHub, and whether a folder's handle that was remembered is still there.

Why it is laid out so: Grasp is opened from disk on machines nobody has measured, where a policy may block any of these. Every question goes through a `ProbeEnv`, so that the lines, their words and the order of the asking are tested in Node with stand-ins; `browserEnv()` makes the real one from the window, and only a browser test sees it.

## Read, in this order

1. `canvas/app/src/core/probe.ts`, whole: its comments are the contract. `LIBRARIES`, `PROBE_LINES`, `SAID`, the sentence functions, `reasonOf`, the loop (`WASM_LOOP`, `jsLoop`, the three numbers), the addresses and keys, and every type are final: leave them as they are.
2. `plan/swarm/step-12.md`: section 1, the list under "About" (items 9 to 14); section 3, "The About panel" (the table of the lines and their words) and "What a test takes away or stands in for".
3. `canvas/app/src/core/files.ts`: how this application keeps what asks the browser apart from what does not, and how it reads a picker from the window.
4. `plan/direction.md`, "What was checked", the paragraphs "What a page opened from disk can do" and "Damon's machine": what the questions are for.
5. `canvas/app/test/probe.test.mjs`: the tests you are to make pass.

## The files you own

`canvas/app/src/core/probe.ts`. Nothing else: `canvas/app/src/core/index.ts` exports it already, and `canvas/app/build.mjs` defines `__GRASP_LIBRARIES__` already.

## The tests and the commands

```sh
npm ci              # once: node_modules/ from package-lock.json, about 15 s
npm run build       # canvas/app/ -> canvas/dist/; a browser test opens the built page, so build before you run one
npm run check       # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Do not run `npm test`, the whole suite: other agents share this machine, and the lead runs it alone. A timed test is judged by the lead alone: a time taken while other agents work proves nothing. If a timed test fails beside your work, say so in what you send back and go on. `canvas/dist/` is built to run the tests and is not handed over: the lead builds it.

Your tests: `node --test --test-timeout=120000 canvas/app/test/probe.test.mjs`, sixteen tests, in Node; they need no build. Tests 9 and 10 pass before you begin and must go on passing.

`browserEnv()` is run by no Node test. Write it to the letter of `ProbeEnv`'s comments; `npm run check` holds its types, and `about.test.mjs` runs it in Chromium once the panel is built, by an agent that needs your file. What the contract fixes of it: the database `grasp-app`, version 1, whose upgrade makes the object store `kept`, opened at each call and closed after; a transaction's `oncomplete` as the moment a write is done; the localStorage key `grasp-app:probe`; the worker's source, which answers a number with its double, and its 3 s; `performance.timeOrigin` as the page load's name. It must ask nothing, open no dialog and write nothing as it is made.

`remember()` must call `env.pickFolder()` before anything that waits: a browser opens a picker only from a click.

## What done is

- The sixteen tests of `probe.test.mjs` pass.
- `npm run build` and then `npm run check` pass.
- Only `canvas/app/src/core/probe.ts` differs from what you were given, and its final parts are as they were.

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
