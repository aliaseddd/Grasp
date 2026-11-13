#!/bin/bash
# Builds the scaffold's commits, one per step in step order, in a worktree of its own, from the main tree's final
# files. Each commit holds its own files and canvas/dist/ as built from them.
#   assemble.sh            builds the commits
set -euo pipefail
S=/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad
MAIN=/home/user/Grasp
ASM=$S/asm
BASE=bddd5d2
TRAILER=$'\n\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_0185AdPcDPzQuctGx2roq7Po'

cd $MAIN
git worktree remove --force $ASM 2>/dev/null || true
git worktree add --detach $ASM $BASE >/dev/null 2>&1
ln -s $MAIN/node_modules $ASM/node_modules

tasks() { # tasks.json from the fragments of the steps given
  python3 - "$@" <<'EOF'
import json, sys
main='/home/user/Grasp'
tasks=[]
for n in sys.argv[1:]: tasks+=json.load(open(f'{main}/plan/swarm/tasks-{n}.json'))
out={
 "about": "The tasks of the swarm that fills in the scaffold of steps 8 to 13 of slice 1. plan/swarm/README.md says what each field means and how the lead runs them.",
 "rework": {"model": "sonnet", "effort": "high"},
 "tasks": tasks,
}
open('/tmp/claude-0/-home-user-Grasp/ce53ff6d-635d-545e-8f5c-7c12a87c85ff/scratchpad/asm/plan/swarm/tasks.json','w').write(json.dumps(out, indent=2)+"\n")
EOF
}

commit() { # commit <message> <path>...   (a path may be a glob, relative to the repository's root)
  local msg=$1; shift
  local files=()
  for pattern in "$@"; do
    for f in $(cd $MAIN && ls -d $pattern); do
      mkdir -p "$ASM/$(dirname "$f")"
      cp "$MAIN/$f" "$ASM/$f"
      files+=("$f")
    done
  done
  (
    cd $ASM
    node canvas/app/build.mjs >/dev/null
    node canvas/app/build.mjs --check >/dev/null
    npx tsc -p canvas/app
    git add -- "${files[@]}"
    [ -f plan/swarm/tasks.json ] && git add plan/swarm/tasks.json
    git add -u canvas/dist
    git commit -q -m "$msg$TRAILER"
    echo "$(git log --oneline -1 | cut -c1-110)   [$(git show --stat --format= HEAD | tail -1 | sed 's/^ *//')]"
  )
}

A=canvas/app/src; T=canvas/app/test; P=plan/swarm

commit "canvas/app: the scaffold for steps 8 to 13, part 2: the shared contracts as the steps' scaffolds completed them

What each step's scaffold asked of the files more than one step touches: the
plane's, the store's and the dock's contracts for steps 9 and 11, the bar's
keys for step 10, the selection's two rules of cost, the tests' helpers for
Details, a shot that stays pending until its step is closed, and the two
files that say how the swarm is run and what the steps share." \
  $A/core/selection.ts $A/plane/Plane.tsx $A/plane/viewStore.ts $A/shell/Dock.tsx $A/shell/dockContext.ts $A/shell/TopBar.tsx \
  $T/helpers.mjs "$T/shots/*.mjs" $P/README.md $P/shared.md

tasks 8
commit "canvas/app: the scaffold for step 8: the planes at scale

The table of times, taken alone; a gesture's step worked out from what its
start read, no lines for a large view while it is far, and a minimap of our
own, each as a contract over what the page does today; the test lists, the
shot, ten briefs." \
  $A/core/adapter.ts $A/plane/MiniMap.tsx $A/shell/theme.ts $P/step-8.md "$P/briefs/8-*.md"

tasks 8 9
commit "canvas/app: the scaffold for step 9: the shared selection and the Explorer

Picking on a plane held against React Flow's own source, the Explorer's rows
without React, the dock's one rule for the view in front; the test lists,
thirteen briefs." \
  $A/panels/Explorer.tsx $A/panels/explorerRows.ts $A/panels/explorer.css $P/step-9.md "$P/briefs/9-*.md"

tasks 8 9 10
commit "canvas/app: the scaffold for step 10: Details

The fields' form, hooks and words as plain data, tested in Node; the panel's
widgets and what a test reads of each; the test lists, eleven briefs." \
  $A/panels/Details.tsx $A/panels/details.css $A/panels/fieldHooks.ts $P/step-10.md "$P/briefs/10-*.md"

tasks 8 9 10 11
commit "canvas/app: the scaffold for step 11: the Tools view and the right-click palettes

The commands and the tool in hand as a state machine in the core, rule for
rule the old page's; the Tools view, the palette and the toasts; the table
of every tool's use, the test lists, the shot, twelve briefs." \
  $A/core/commands.ts $A/panels/Tools.tsx $A/shell/Toasts.tsx $A/plane/Palette.tsx $A/plane/palette.css $P/step-11.md "$P/briefs/11-*.md"

tasks 8 9 10 11 12
commit "canvas/app: the scaffold for step 12: Validation and About

The checks as a store kept for a session, the probe behind stand-ins for the
browser, the two panels; the build hands About the libraries' versions; the
test lists, the shots and their reviewers' lists, fifteen briefs." \
  $A/core/checks.ts $A/core/probe.ts $A/core/index.ts canvas/app/build.mjs $A/panels/Validation.tsx $A/shell/About.tsx $P/step-12.md "$P/briefs/12-*.md"

tasks 8 9 10 11 12 13
commit "plan: session 24: step 13's brief, the swarm's tasks, and the session's notes

Steps 8 to 13 are scaffolded and none is built: plan/status.json keeps step 7
and gains a pointer to plan/swarm/tasks.json." \
  "$P/briefs/13-*.md" plan/status.json plan/notes.md

cd $ASM && git log --oneline $BASE..HEAD
