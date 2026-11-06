#!/usr/bin/env bash
# Exports the model as textual SysML v2 and checks it with the SysML v2 Pilot Implementation's own parser and
# validator, through docs/sysml/check.sh.
#
#   canvas/check.sh                     # the model and the notes saved in canvas/index.html
#   canvas/check.sh canvas-state.json   # a state file (see export.mjs)
#
# Exits 1 if the export has problems or the validator reports an error. The exported text is left in a temporary
# folder whose path is printed, so an error can be read against its line numbers.

set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$(mktemp -d)/model.sysml"
if ! node "$HERE/export.mjs" "$@" > "$OUT"; then
  echo "The export has problems (above), so it wasn't checked." >&2
  exit 1
fi
echo "Exported to $OUT"
"$HERE/../docs/sysml/check.sh" "$OUT"
