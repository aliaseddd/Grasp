# The scaffold for steps 8 to 13 of slice 1, and how a swarm fills it in

> **Finished, kept as a reference.** The swarm's work is done: slice 1 closed in session 28. On November 14, 2026 the working files were removed from this folder: `briefs/`, `tasks*.json`, `session-24-scratch/` and `session-25-wip/`. What stays is this README, `shared.md` and `step-8.md` to `step-12.md`, whose contracts (test ids, accessible names, words) the tests and sources of `canvas/app/` cite by section. Where the text below names a brief, a task file or a scratch folder, read it from git history: `git show cc7eae2:plan/swarm/<path>`.

Session 24 (November 13, 2026) designed steps 8 to 13 of `plan/slice-1.md` in one go and wrote this scaffold. Until then each step went: Claude wrote that step's outline, Sonnet agents wrote its tests and its code, and only then was the next step outlined (`plan/notes.md`, session 17, "How each step is built"). For steps 8 to 13 the outlines exist already, here, so stages 1 and 2 of that method are done for every step. Stages 3 to 8 remain, and this folder says how a later session runs them with many agents at once.

Nothing in this folder is implementation. The page built from the scaffold behaves as it did at the end of step 7.

## What is here

| File | What it holds |
|---|---|
| `README.md` | This file: the method, the fields of `tasks.json`, the rules every brief carries. |
| `shared.md` | The contracts that more than one step builds on: the selection, the tool in hand, how a side panel is put into the dock, what the plane takes from each step, which task owns each file that several steps touch, and what the tests share. |
| `step-8.md` to `step-12.md` | One step's scaffold each: what the plan left open and how it is settled, the contract between tests and code (test ids, roles, accessible names, words), the test list of each test file, and each screenshot's scenario with the list its reviewer checks. |
| `tasks.json` | Every task of the swarm. |
| `briefs/<task-id>.md` | One brief per task. A brief stands alone: an agent given the brief and the files it names can do the task. Step 13 changes documents only, so its one brief, `briefs/13-checks-close.md`, is its whole scaffold: each change, and the two checks that section 10 of the plan asks for after step 12. |

The skeletons are in the code, not here: each new file a step creates exists under `canvas/app/`, with its exported types and signatures and each contract written as a comment. A function nothing calls yet has a body that throws `"<name>: step N builds it"`. A file the page already loads (a side panel's body, the toasts, the About panel, the minimap) holds what the page shows today, and its step replaces that.

## Words

- **The lead** is the session that runs the swarm: Claude, on the model the session runs on. The lead starts the agents, reads their work, takes their files into the main tree, runs the checks, and commits.
- **A task** is one piece of work for one agent, with one brief. **A swarm task's kind** is one of four: `tests` (writes tests from a test list), `implement` (fills in skeletons until the tests pass), `review` (reads a diff or looks at a screenshot, and changes nothing), `checks` (runs things and reports, or is the lead's own closing of a step).
- **Owns**: a task owns the files it may create or change. It changes no other file.
- **The scaffold commit** is the last commit of session 24 on the working branch. Every worktree starts from it, or from a commit made on top of it.

## `tasks.json`

```json
{
  "tasks": [
    {
      "id": "9-tests-selection",
      "step": 9,
      "kind": "tests",
      "brief": "plan/swarm/briefs/9-tests-selection.md",
      "owns": ["canvas/app/test/selection.test.mjs"],
      "needs": [],
      "model": "sonnet",
      "effort": "medium",
      "status": "open"
    }
  ]
}
```

- `id` begins with the step's number, then the kind (`tests`, `impl`, `review`, `checks`), then a name.
- `needs` lists the tasks that must be `done` before this one starts. A task with no needs can start at once.
- `owns` lists files, each by its path from the repository's root. No two tasks that can run at the same time own the same file: when two tasks own one file, one of them needs the other, directly or through other tasks.
- `model` and `effort` say how the task is run. `sonnet` at `medium` writes tests and code, makes the breakages and looks at a screenshot. `fable` at `high` reads a step's code (`N-review-code`): a fresh instance of the lead's own model, which has not seen the outline. `lead` means the lead does the task itself. Rework, which is a task sent back because its result was wrong while its brief was right, runs on `sonnet` at `high`.
- `status` is `open`, then `running`, then `done`. The lead sets it. A task that came back wrong goes to `open` again with a note in the session's entry of `plan/notes.md`.

## How the lead runs the swarm

1. **Start.** `npm ci`, `npm run check`, `npm test`, and read `plan/status.json`, this file and `shared.md`.
2. **Pick.** Every `open` task whose needs are all `done` can start. Start them all at once when the machine allows it, except while a timed test is being judged (step 6 below).
3. **A worktree per agent.** Make it by hand, outside the repository's folder, from a commit of the working branch: `git worktree add --detach <path> <commit>`, then `npm ci` there. The harness's own worktree option starts from `main` and must not be used (`plan/notes.md`, session 21). The commit is the scaffold commit plus the files of every task the new task needs. Keep those on a local branch that is never pushed, as session 22 kept `wip/step-7`.
4. **Hand over the brief.** The agent gets its brief's text and nothing else from the lead's own context. Name the model and the effort each time, since the harness may start another by default.
5. **Read the diff before the report.** Compare what came back with the step's file and with `shared.md`. Then copy the files the task owns into the main tree, and no other. A change outside what the task owns is not taken.
6. **Timed tests are judged alone.** A timing taken while other agents work is not valid. A timed test that fails beside other work is run again with nothing else running before anything is concluded from it.
7. **Close each step in step order** with its `N-checks-close` task, which is the lead's: build, check, `npm test` (three times where the step has a timed test), the screenshots the step takes, each looked at by a reviewer that sees only the image and its list, the todo marks the step takes off, `plan/status.json`, the session's entry in `plan/notes.md`, one commit, pushed. The commit of step N comes after the commit of step N - 1, and passes `npm ci && npm run check && npm test` when checked out by itself, with `# fail 0` and `# todo` equal to the checks still `"todo"` in `plan/status.json` (criterion 7).
8. **What stops the lead** is what `plan/slice-1.md` names: a scale limit that the plan's tuning cannot hold, and anything that needs the text of `plan/slice-1.md` or `plan/direction.md` to change. The lead then goes on with every task that does not depend on Damon's answer.

A step's tasks follow one pattern, and `tasks.json` holds the exact needs:

| Task | Kind | What it does |
|---|---|---|
| `N-tests-…` | tests | Writes one or more test files from the step's test list. Runs them against the scaffold and sends back the first line of each failure, which must be the one the list gives. |
| `N-impl-…` | implement | Fills in the skeletons it owns until the tests the brief names pass. |
| `N-checks-break` | checks | For each test of the step, makes the breakage the test list names in the built code, runs the test, and puts the code back. Sends back every test that still passed. |
| `N-review-code` | review | Reads the step's whole diff against the plan's text for the step, without the outline, and tries what it doubts in the built page. Sends back defects, each reproduced. |
| `N-review-shot-…` | review | Looks at one screenshot with its list and nothing else, and marks each item present or absent. Just before it starts, the lead builds the page from the tasks it needs and takes the image with `npm run shots -- <name>`. |
| `N-checks-close` | checks | The lead's closing of the step (7 above). |

Step 8 has one task more, `8-checks-measure`, the lead's: it measures each of the step's changes alone and keeps it only if the numbers move.

## The rules every brief carries

Each brief repeats these, with the reasons, because a rule without its reason is applied too widely or not at all.

1. **Change only the files you own.** Other agents are changing the others at the same time, and the lead takes only your owned files.
2. **Nothing under `canvas/src`, `canvas/test`, or any other file listed in `canvas/app/test/unchanged.json`.** One changed byte there fails `unchanged.test.mjs`: the old page, the library and their tests stay as slice 1 found them.
3. **No new package, and no import of a library that `canvas/app/src/vendor.ts` does not hold.** The build refuses it. An import you need and cannot make is a reason to stop.
4. **No test is loosened, skipped or marked todo.** A signature, a contract or a test that looks wrong is a reason to stop and say why. Do not work around it.
5. **No colour outside `canvas/app/src/shell/theme.ts`; no test reads `window.Grasp`; no test turns on the CSS domain of the DevTools protocol.** Colours in one file keep the look in one place until slice 7. `window.Grasp` is for looking, and a test that reads it tests the page's inside, not what a person meets. The CSS domain makes Chromium log an error on a page opened from `file://`, which every browser test would then report.

And two sayings that are not rules of conduct but of judgment:

- **Tests check the code and do not define it.** The contract is the comment in the skeleton and the step's file. When a test and the contract disagree, the contract stands and the test is wrong.
- **Something that looks wrong is a reason to stop.** An agent that finds a signature, a contract or a test wrong stops and says what it found and why. It does not change a file it does not own, and it does not bend its own work to fit.

## What a brief holds

In this order: the goal and its reason; where to read (files and sections, in reading order); the files owned; the tests and the commands; what to send back; the rules above with their reasons, and the two sayings. A test writer and an implementer of the same thing work without seeing each other's work, so everything the two must agree on is in the step's file under "The contract between tests and code".
