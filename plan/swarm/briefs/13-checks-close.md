# 13-checks-close: slice 1 closed

This task is the lead's own. Step 13 of `plan/slice-1.md` changes documents only, so this one brief is its whole scaffold: each change, and the two checks that section 10 of the plan asks for once step 12 is committed.

## The goal, and why

Slice 1 ends with its documents saying what is true, so that the session that begins slice 2 reads the state from the repository and not from anyone's memory. Section 10's criteria 7 and 8 are checked here because they can only be checked once step 12 is committed: that each step's last commit passes by itself, and that a stranger can answer five questions on the state from the repository alone.

## Read first

`plan/slice-1.md`: step 13 in section 5, section 6, and section 10 with what follows its criteria. `plan/status.json`. `plan/notes.md` from "Session 24" to the end. `README.md` and `canvas/README.md` whole. `canvas/src/README.md`, which is the model for `canvas/app/README.md`.

## The files you own

`README.md`, `canvas/README.md`, `canvas/app/README.md` (new), `plan/direction.md` (one item, as below), `plan/status.json`, `plan/notes.md`, `plan/swarm/tasks.json`, `canvas/app/shots/shell.png`.

## The two checks, before any document changes

**Criterion 7: every step ends green.** For the last commit of each of steps 5 to 12, eight commits, which `git log` and `plan/notes.md` name: check it out into a new worktree outside the repository's folder and run `npm ci && npm run check && npm test`. Each must report `# fail 0`; in each, `plan/status.json` must name that step, and its count of `"todo"` checks must equal the runner's `# todo` (6, 5, 4, 1, 1, 0, 0, 0 for steps 5 to 12). Run them one after another, with nothing else running, since each holds timed tests. Remove each worktree afterwards. The eight results go into `plan/notes.md` as a table: step, commit, tests, pass, fail, todo. A commit that fails is reported as it is; it is not rewritten, since it is pushed.

**Criterion 8: notes a stranger can use.** Start one fresh agent (`sonnet`, `medium`) in a worktree of the commit that ends step 12, with this message and nothing else:

> You are given a git repository and nothing else. Answer these five questions about the state of the project from what the repository holds. For each, give your answer in a few sentences and the files and lines you took it from. Do not run the tests or the build.
>
> 1. What is done?
> 2. What is next?
> 3. Which speed limits hold, and with what numbers?
> 4. What departs from the plan?
> 5. What is still open?

Check each answer against the repository. Right means: (1) steps 1 to 12 of slice 1 and what each delivered, with slice 1 not yet marked done; (2) step 13, then slice 2, "Editing parity"; (3) the four scale limits with the medians of step 12's three runs, and the limits of criterion 6 with theirs; (4) every departure the notes record, among them rows 15 apart, the shared triangle of `example.png`, the question before Open as the page's own dialog, `npm test` running its files one at a time, and whatever steps 8 to 12 added; (5) the repository's licence, Damon's own look through the page, and whatever steps 8 to 12 left open. Five of five right is the criterion. For an answer that is wrong because the notes do not say, the notes are completed (that is this step's work on `plan/notes.md`); the result as it first came is recorded all the same.

## The changes, file by file

1. **`README.md`**. "What's here": the new page is `canvas/dist/index.html`, built from `canvas/app/`; what it does now (the slice's delivery, in the words of `plan/direction.md`, "The slices", item 1); the old page beside it. "Run it": the block of npm commands as they are now (with `npm run shots`), and the sentence after it, which still says the screenshots come with step 5. "Next": slice 2, with `plan/status.json` as the place that says so.
2. **`canvas/README.md`**. A section for the new page: what it does, and what only the old page does until slice 2 (`plan/slice-1.md`, section 2, "Which editing is slice 1's" and "Which views a tab draws": the sequence, geometry, grid and browser views; drawing by dragging from handles; reconnecting; editing a label in place; moving a box into another owner; Delete and Remove from view; new and deleted views; showing an element in a view; badges; notes; code links; the export panel; renaming in the Explorer).
3. **`canvas/app/README.md`** (new), as `canvas/src/README.md` is for the old page: how the application is laid out (the folders of section 3 of the plan as they came to be, with each file that the plan does not name and why it exists); the direction of use (a gesture or a widget calls `edit()`; the history tells; the adapter projects; the stores hand over; the panels read again); how to add a side panel, a node shape, a field's hook, a command, a line of About; the rules a change keeps (colours in `theme.ts`, libraries through `vendor.ts`, a stylesheet beside its component, tests from `file://`, `window.Grasp` for looking only); the commands; where the screenshots come from.
4. **`plan/direction.md`**, under "What is not settled yet", the item "Compartment rows at Grasp's scale": answered, with the measurements of steps 8 and 10 as step 12's three runs gave them, what was built to hold them (a gesture's step worked out from what its start read; no lines for a large view while it is far; a minimap of our own; rows as plain text wrapped by the adapter), and any limit that was restated with Damon's approval. This is the one change to `plan/direction.md` that the plan's step 13 gives; nothing else in that file changes.
5. **`canvas/app/shots/shell.png`**, retaken (`npm run shots -- shell`): the page as it opens, with no file. It was retaken and rated at the end of step 12; it is taken once more only if a document's change touched what it shows, which it should not.
6. **`plan/status.json`**: slice 1 `"status": "done"`, `"next": 2`.
7. **`plan/notes.md`**: the session's entry, with the two checks' results, and "For the next session" pointing at slice 2 and at `plan/direction.md`, "What is not settled yet".
8. **`plan/swarm/tasks.json`**: this task `"done"`.

## Done when

From a clean clone, `npm ci && npm run build && npm run check && npm test && npm run test:old` passes, with `# todo 0`. `canvas/check.sh canvas/examples/stronghold-proof.json` accepts the example, and it accepts a file the new page saved (open the example in the page, move a box, save, and run `canvas/check.sh` on the saved file, as session 22 did). The screenshots are current. One commit, pushed, with each file added by name.

Looking through the page by hand is Damon's own step, done outside the plan, and the slice does not wait for it.

## Where you work, and the commands

You work in a git worktree the lead made for you, at a commit that holds the scaffold and the work of the tasks this one needs. Run every command from the worktree's root.

```sh
npm ci                # once: node_modules/ from package-lock.json, about 15 s
npm run build         # canvas/app/ → canvas/dist/, the page the browser tests open
npm run check         # fails when canvas/dist/ is not what the sources build, or the types do not hold
node --test --test-timeout=120000 canvas/app/test/<file>      # one test file
```

Build before you run a browser test: it opens `canvas/dist/index.html` from `file://`. Do not hand `canvas/dist/` over: the lead builds it. Other agents share this machine, so a timed test may fail for you while it would pass alone: say so in what you send back, and the lead judges it alone. Commit your owned files in the worktree, added by name (never `git add -A`), so the lead can read your diff.

## The rules, with their reasons

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

Two more things, of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** If you find a signature, a contract or a test wrong, stop and say what you found and why. Do not change a file you do not own, and do not bend your own work to fit.
