# Session 25's work on steps 10 to 12, kept aside

Session 25 ran the swarm of `plan/swarm/tasks.json` and closed steps 8 and 9 of slice 1. Damon then asked it to stop after step 9 and to put everything on GitHub. The agents had already built most of steps 10, 11 and 12, which no commit of `canvas/app/` holds yet: a step enters `canvas/app/` only at its closing, which checks it whole. This folder keeps that work so that the next session starts from it rather than over again. `plan/notes.md`, session 25, says what each task found and what is still to do.

## What is here

| Path | What it holds |
|---|---|
| `<task>/<path>` | The files a finished task owns, as its last commit holds them, at their paths in the repository: `10-impl-details/canvas/app/src/panels/Details.tsx` is that task's `Details.tsx`. |
| `manifest.json` | One row per finished task: its id, step, kind, the commit it was built on (`base`) and its last commit (`commit`), and the files kept. The commits are local to session 25's container and are not on GitHub; the files here are what they held. |
| `probes/10-review-code/`, `probes/12-review-code/` | The scripts the reviews of steps 10 and 12 reproduced their defects with (Playwright from `file://`). They import from the reviewer's worktree (`/home/user/wt/<task>/...`): point those paths at the tree they should run in. |
| `scripts/` | The lead's helpers: `swarm.mjs` (the worktrees, their bases and the taking of a task's files), `archive-wip.mjs` (this folder), `scale-figures.mjs` (the figures of a run of the scale tests), `measure8.sh` (step 8's builds A to D), `trace.mjs` (where a pan step of the action flow view goes, from a Chromium trace). Their paths are session 25's. |
| `rework-briefs/` | The two briefs of step 9's reworks, which are in `canvas/app/` since step 9's commit. |

## How a task's files go back into the tree

From the repository's root, for a task whose files are wanted:

```sh
cp -r plan/swarm/session-25-wip/<task>/canvas .
```

The tasks of a step depend on one another as `plan/swarm/tasks.json` says (`needs`); a step's files go in together, at its closing. Every task of steps 10 to 12 here was built on a tree that held step 9's work (and, for step 12's About panel, step 10's bar), but not step 8's: each step's closing builds, checks and runs the whole suite on the tree as it then is, as `plan/swarm/README.md` says.
