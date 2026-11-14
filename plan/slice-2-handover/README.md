# Slice 2: the workflow scripts of its rounds

Session 31 left this folder as a hand-over: the scaffold of slice 2 (package 2-1 of `plan/slice-2.md`) built and not
landed, with its stages' reports. Session 32 landed the package. What the reports held is in `plan/notes.md`, in the
entry of session 32, and the reports are gone. What stays here until the slice closes is the scripts the rounds are
run with. Once package 2-15 has landed, the folder can go.

Where the slice stands is in `plan/status.json`; what the last session did and what is next, in `plan/notes.md`.

## The scripts

They are for the session's Workflow tool. Each names the session's scratch folder in a constant near its top (`S`,
`PK`) and the agents' model and effort in `OPTS`: set both to the session's. The harness runs two agents of one
workflow at a time on a container of four processors, so a round is several workflows side by side.

| File | What it is |
|---|---|
| `workflows/round-packages.js` | Builds packages side by side: for each a builder in its own worktree (`/home/user/wt/<id>`, made by hand from the round's commit with `git worktree add --detach`, `npm ci` run), a reviewer who did not write the code, rework, and a reviewer who sees only the screenshot and its list. `args: { base, baseWords, packages }`. |
| `workflows/make-args.py` | `make-args.py <round> <commit> "<words>"` writes a round's arguments, one file for each workflow, from `shots.json`. Its `GROUPS` say which packages share a workflow; its `EXTRA`, the words a package gets beyond its brief. Round `1` is packages 2-2 and 2-4 to 2-9 and the camera's keys of 2-14 (`2-14c`); `1b` is 2-3, which starts once the camera is built; `2` is the four bodies. |
| `workflows/shots.json` | Section 6's nine screenshots: the package, the scenario, the list of what must be seen, and whether it is rated. |
| `workflows/land.js` | Lands built packages one after another in the lead's tree: the owned files as a patch, the tests of slice 1 that fail by design, the full suite alone, `plan/status.json`, the package's subsection of `plan/notes.md`, one commit, pushed. `args: { base, branch, session, packages }`; a package may carry a `base` of its own. |
| `workflows/scaffold-review.js` | The review of the scaffold as session 32 ran it: five reviewers of the seams, and one for each of packages 2-2 to 2-15 who plays its builder with its brief alone. `args: { base, head, pick }`. It reads the stages' reports, which are gone: kept as the record of how the review was asked. |
| `workflows/scaffold-build.js` | The workflow that built the scaffold in session 31, as it ran. A record. |

## What the builders are told beyond their briefs

`plan/notes.md`, the entry of session 32, "What the builders of rounds 1 and 2 must know that the plan does not say".
`round-packages.js` points every builder and every reviewer at it. Before round 2 the lead reads its part for the
four bodies again, and mends the tests of slice 1 that more than one body makes fail by design ("What the lead owes
later, from the review", in the same entry).
