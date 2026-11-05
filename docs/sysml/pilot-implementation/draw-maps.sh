#!/usr/bin/env bash
# Draws aider's repo maps of the SysML v2 Pilot Implementation into this folder: REPO_MAP.md for the
# whole repository, and projects/<project>.md for each top-level project with code aider can read
# (Java, Python, TypeScript, JavaScript). README.md says what the maps show and what they leave out.
#
# Usage: docs/sysml/pilot-implementation/draw-maps.sh <clone of Systems-Modeling/SysML-v2-Pilot-Implementation>
#
# Needs git and aider on the PATH. aider needs a model name to start, but drawing a map makes no API
# call. It leaves its tags cache and history files in the clone; they are untracked there.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
clone=$(cd "${1:?usage: draw-maps.sh <clone of SysML-v2-Pilot-Implementation>}" && pwd)
url=https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation
commit=$(git -C "$clone" rev-parse HEAD)
version=$(aider --version)
today=$(date +'%B %e, %Y' | tr -s ' ')

# Runs aider in <dir> and prints what it prints. Extra options go to aider. Its stdin is /dev/null so
# that it can't read the project names the loop below is reading.
#
# PYTHONHASHSEED=0 turns off Python's hash randomization. aider builds its ranking by iterating over
# sets, so without it, definitions with near-equal ranks come out in a different order on each run, and
# the map is cut at a different place: two runs drew the metamodel's map with 72 files and with 57.
# With it, runs on the same clone repeat exactly. A fresh clone can still differ near a map's edges:
# tree-sitter returns a file's tags in an order that changes from one process to the next, and aider's
# tags cache keeps the order it saw first.
run_aider() {
  local dir=$1 tokens=$2
  shift 2
  (cd "$dir" && PYTHONHASHSEED=0 COLUMNS=160 aider --show-repo-map --map-tokens "$tokens" --aiderignore "$here/pilot.aiderignore" \
    --no-pretty --yes-always --no-check-update --no-analytics --no-show-model-warnings --no-gitignore \
    --model gpt-4o "$@" < /dev/null 2>/dev/null)
}

commas() { awk -v n="$1" 'BEGIN { s = n ""; while (s ~ /[0-9][0-9][0-9][0-9]/) sub(/[0-9][0-9][0-9]($|,)/, ",&", s); print s }'; }

# Writes one map file: a short header, then aider's map with its preamble taken off.
write_map() {
  local raw=$1 out=$2 title=$3 scope=$4 options=$5 tracked=$6 readme=$7
  local read_files map shown defs
  read_files=$(sed -n 's/^Git repo: .* with \(.*\) files$/\1/p' "$raw")
  grep -q '^If you need to edit any of these files' "$raw" || { echo "no map in $raw" >&2; exit 1; }
  map=$(sed '1,/^If you need to edit any of these files/d' "$raw" | sed '1{/^$/d;}')
  read -r shown defs < <(printf '%s\n' "$map" | awk '
    /^(⋮|│)/ { if (entry) { defs++; entry = 0 } next }
    NF       { shown++; entry = 1; next }
             { entry = 0 }
    END      { print shown + 0, defs + 0 }')
  {
    printf '# %s\n\n' "$title"
    printf 'Drawn by %s on %s with `draw-maps.sh`, from %s at commit [`%s`](%s/tree/%s), with `%s`. ' \
      "$version" "$today" "$scope" "${commit:0:7}" "$url" "$commit" "$options"
    printf 'Git tracks %s files there; aider read the %s that `pilot.aiderignore` leaves in, and the map shows %s of them, %s with definitions. ' \
      "$(commas "$tracked")" "$read_files" "$shown" "$defs"
    printf '[The README](%s) says how to read it and what it leaves out.\n\n' "$readme"
    printf '```text\n%s\n```\n' "$map"
  } > "$out"
  echo "$out: $shown files shown, $defs with definitions, of $read_files read"
}

raw=$(mktemp)
trap 'rm -f "$raw"' EXIT

# The whole repository.
run_aider "$clone" 8192 > "$raw"
write_map "$raw" "$here/REPO_MAP.md" "Repo map: SysML v2 Pilot Implementation" \
  "[the whole repository]($url)" "--map-tokens 8192" "$(git -C "$clone" ls-files | wc -l)" "README.md"

# One map per project with code aider can read, each ranked within the project alone.
rm -rf "$here/projects"
mkdir -p "$here/projects"
git -C "$clone" ls-files -- '*.java' '*.py' '*.ts' '*.js' ':!:**/src-gen/**' | awk -F/ 'NF > 1 { print $1 }' | sort -u |
while read -r project; do
  run_aider "$clone/$project" 4096 --subtree-only > "$raw"
  write_map "$raw" "$here/projects/$project.md" "Repo map: $project" \
    "[\`$project\`]($url/tree/$commit/$project)" "--subtree-only --map-tokens 4096" \
    "$(git -C "$clone" ls-files -- "$project" | wc -l)" "../README.md"
done
