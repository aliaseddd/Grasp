#!/usr/bin/env bash
# 8-checks-measure: builds A to D of plan/swarm/step-8.md, section 6, three runs of scale.test.mjs each, alone.
# Run from the measure worktree's root. Writes runs into $OUT, and prints each run's figures.
set -u
OUT=/tmp/claude-0/-home-user-Grasp/e9b8ddbf-df6f-5a0b-8c71-a9c82bd8bd62/scratchpad/measure8
FIG=/tmp/claude-0/-home-user-Grasp/e9b8ddbf-df6f-5a0b-8c71-a9c82bd8bd62/scratchpad/scale-figures.mjs
SCAFFOLD=102d983
ADAPTER=canvas/app/src/core/adapter.ts
MINIMAP=canvas/app/src/plane/MiniMap.tsx
mkdir -p "$OUT"
cp "$ADAPTER" "$OUT/adapter.impl.ts"
cp "$MINIMAP" "$OUT/MiniMap.impl.tsx"
# B's adapter: projectStep built, linesDrawn back to `return true`.
node -e '
const fs = require("fs");
const src = fs.readFileSync(process.argv[1], "utf8");
const re = /(export function linesDrawn\([^)]*\)[^{]*\{)([\s\S]*?)(\n\})/;
if (!re.test(src)) { console.error("linesDrawn not found"); process.exit(1); }
fs.writeFileSync(process.argv[2], src.replace(re, (m, a, body, z) => `${a}\n  void nodes;\n  void far;\n  return true;${z}`));
' "$OUT/adapter.impl.ts" "$OUT/adapter.B.ts"
git show "$SCAFFOLD:$ADAPTER" > "$OUT/adapter.A.ts"
git show "$SCAFFOLD:$MINIMAP" > "$OUT/MiniMap.A.tsx"

build() { # build letter adapter minimap
  cp "$2" "$ADAPTER"; cp "$3" "$MINIMAP"
  npm run build > "$OUT/build-$1.txt" 2>&1 || { echo "build $1 failed"; cat "$OUT/build-$1.txt"; exit 1; }
}
for letter in ${LETTERS:-A B C D}; do
  case $letter in
    A) build A "$OUT/adapter.A.ts" "$OUT/MiniMap.A.tsx" ;;
    B) build B "$OUT/adapter.B.ts" "$OUT/MiniMap.A.tsx" ;;
    C) build C "$OUT/adapter.impl.ts" "$OUT/MiniMap.A.tsx" ;;
    D) build D "$OUT/adapter.impl.ts" "$OUT/MiniMap.impl.tsx" ;;
  esac
  for run in 1 2 3; do
    node --test --test-timeout=120000 canvas/app/test/scale.test.mjs > "$OUT/$letter-$run.txt" 2>&1
    echo "$letter run $run: load $(cut -d' ' -f1 /proc/loadavg)"
  done
  node "$FIG" "$OUT/$letter-1.txt" "$OUT/$letter-2.txt" "$OUT/$letter-3.txt"
done
# Back to the built step.
cp "$OUT/adapter.impl.ts" "$ADAPTER"; cp "$OUT/MiniMap.impl.tsx" "$MINIMAP"
npm run build > /dev/null 2>&1
git status --short | grep -v canvas/dist
