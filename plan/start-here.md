# Start here

What a session reads first, so that loading the project's state costs little. Read this file, `plan/status.json`, and the last session of `plan/notes.md` (`grep -n '^## Session' plan/notes.md | tail -1` gives its line; read from there to the end). Open anything else only when the work needs it: the table below says which document answers what.

Keep this file to one page. The session that changes where the work stands (a slice or a step closed, a decision made, an open point settled) brings "Where the work stands" and "What is open" up to date in the same commit. Where this file and `plan/status.json` disagree, `status.json` is right.

## Where the work stands

As of November 14, 2026:

- **Slice 1, the shell and the planes, is done** (session 28): the new page in `canvas/app/`, built into `canvas/dist/`, with all ten checks of `plan/status.json` passing. Check 10's pan limit is restated to 25 ms for the 2,112-node action flow view, with Damon's approval.
- **Slice 2, editing parity, is next**, and nothing of it is begun. Its plan is written first, as `plan/slice-1.md` was, and approved by Damon before any code. It starts with a day's probe per view kind for the sequence and geometry views (React Flow nodes, or SVG inside the tab).
- **The old page in `canvas/` stays, unchanged**, until the new one draws everything it draws. `canvas/README.md`, "The new page", lists what only the old page does yet.
- Slices 3 to 7 are open: the workspace folder and the loop through GitHub; every concept in the standard form; text in the page; code links; the finish of the look.

## What is open

- **The repository's licence**: it has none, and it is Damon's to choose.
- **Damon's own look through the new page**, outside the plan.
- **Kept for later**: the focus after Undo in Validation (slice 2); the screenshot reviewers' notes that were no items, and the minimap's path made again at each drag step (slice 7).
- What each later slice finds out first is in `plan/direction.md`, "What is not settled yet".

## Which document answers what

| Question | Open | Size |
|---|---|---|
| Which slice, step or check is done? | `plan/status.json` | 4 KB |
| What did the last session do, and what does it leave? | `plan/notes.md`, its last session only | 346 KB whole; a session is 5 to 25 KB |
| Why was something built the way it was? | `plan/notes.md`: `grep -n '^## Session\|^### '` for the headings, then the one section | |
| What is a slice for, and when is it done? | `plan/direction.md`, "The slices" | 48 KB whole; the section 7 KB |
| What must a slice find out first? | `plan/direction.md`, "What is not settled yet" | 5 KB |
| What was decided, and what was rejected? | `plan/direction.md`, "The decisions" and "Decided for slice 1" | 15 KB |
| What do the libraries, the browser and Damon's machine allow? | `plan/direction.md`, "What was checked" | 13 KB |
| Where is the code for something? | `plan/REPO_MAP.md` | 47 KB |
| How is the new application laid out, and how is it added to? | `canvas/app/README.md` | |
| What does each page do, and how does the loop with Claude go? | `canvas/README.md` | |
| How is the old page's source laid out, and how does the format change? | `canvas/src/README.md` | |
| What did slice 1's plan say? | `plan/slice-1.md`; its departures are listed in session 28 of the notes | 71 KB |
| Which contract does a test or a source of `canvas/app/` cite? | `plan/swarm/shared.md`, `plan/swarm/step-8.md` to `step-12.md`, by section | 18 to 76 KB each |
| Which of SysON's features serves which need? | `plan/scope.md` | 159 KB |
| What was the plan before the redesign? | `plan/extensibility-strategies.md`, superseded by `direction.md` | 166 KB |
| What do SysON and the pilot implementation hold? | `docs/sysml/syson/`, `docs/sysml/pilot-implementation/` | |

## What holds in every session

- Change sources and build; never edit what is built. `canvas/dist/` (from `canvas/app/`) and `canvas/index.html` (from `canvas/src/`) are committed; `npm run check` fails when the first is not what its sources build, `node canvas/build.mjs --check` when the second is not.
- `canvas/state.json` is committed only on request.
- The pilot implementation's validator, through `canvas/check.sh`, is the authority on whether a text is SysML v2.
- A scale limit that fails comes back to Damon with its measurement; it is not restated without his word.
- Playwright and its Chromium come with Claude's container: do not install them again.
- Each session adds to `plan/notes.md` what it changed and what the next one needs.

## The commands

```sh
npm ci              # the libraries, at the versions package-lock.json pins
npm run build       # canvas/app/ → canvas/dist/
npm run check       # the built files are what the sources build, and the types hold
npm test            # the new page's tests, one file at a time (the timed ones fail beside each other)
npm run test:old    # the old page's and the model library's tests
canvas/check.sh     # the saved model's text through the pilot's validator (downloads its kernel once per container)
```

Redrawing the repo map: the command is at the top of `plan/REPO_MAP.md`.
