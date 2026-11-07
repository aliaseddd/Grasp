#!/usr/bin/env bash
# Draws aider's repo maps of SysON into this folder: REPO_MAP.md for the whole repository, and
# projects/<path>.md for each module with code aider can read (Java, Python, TypeScript, JavaScript).
# A module is a leaf Maven module or npm package; scripts/ and the Python examples in doc/content,
# which belong to neither, get a map each too. README.md says what the maps show and what they leave out.
#
# Usage: docs/sysml/syson/draw-maps.sh <clone of eclipse-syson/syson>
#
# Needs git and aider on the PATH. aider needs a model name to start, but drawing a map makes no API
# call. It leaves its tags cache and history files in the clone; they are untracked there.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
clone=$(cd "${1:?usage: draw-maps.sh <clone of eclipse-syson/syson>}" && pwd)
url=https://github.com/eclipse-syson/syson
commit=$(git -C "$clone" rev-parse HEAD)
version=$(aider --version)
today=$(date +'%B %e, %Y' | tr -s ' ')
code=('*.java' '*.py' '*.ts' '*.tsx' '*.js' '*.cjs' '*.mjs')

# Runs aider in <dir> and prints what it prints. Extra options go to aider. Its stdin is /dev/null so
# that it can't read the module names the loop below is reading.
#
# PYTHONHASHSEED=0 turns off Python's hash randomization. aider builds its ranking by iterating over
# sets, so without it, definitions with near-equal ranks come out in a different order on each run,
# and the map is cut at a different place. With it, runs on the same clone repeat exactly.
run_aider() {
  local dir=$1 tokens=$2
  shift 2
  (cd "$dir" && PYTHONHASHSEED=0 COLUMNS=160 aider --show-repo-map --map-tokens "$tokens" --aiderignore "$here/syson.aiderignore" \
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
  mkdir -p "$(dirname "$out")"
  {
    printf '# %s\n\n' "$title"
    printf 'Drawn by %s on %s with `draw-maps.sh`, from %s at commit [`%s`](%s/tree/%s), with `%s`. ' \
      "$version" "$today" "$scope" "${commit:0:7}" "$url" "$commit" "$options"
    printf 'Git tracks %s files there; aider read the %s that `syson.aiderignore` leaves in, and the map shows %s of them, %s with definitions. ' \
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
write_map "$raw" "$here/REPO_MAP.md" "Repo map: SysON" \
  "[the whole repository]($url)" "--map-tokens 8192" "$(git -C "$clone" ls-files | wc -l)" "README.md"

# The modules: folders below the root with a pom.xml or package.json and no module below them, plus
# scripts/ and doc/content. Each is drawn only if it has code that syson.aiderignore leaves in.
modules() {
  local dirs
  dirs=$(git -C "$clone" ls-files -- '*/pom.xml' '*/package.json' | xargs -n1 dirname | sort -u)
  printf '%s\n' "$dirs" | awk '{ all[NR] = $0 }
    END { for (i = 1; i <= NR; i++) { leaf = 1; for (j = 1; j <= NR; j++) if (index(all[j], all[i] "/") == 1) leaf = 0; if (leaf) print all[i] } }'
  printf '%s\n' scripts doc/content
}

rm -rf "$here/projects"
mkdir -p "$here/projects"
modules | sort |
while read -r module; do
  files=$(cd "$clone" && comm -23 <(git ls-files -- "${code[@]/#/$module/}" | sort) \
    <(git ls-files -c -i --exclude-from="$here/syson.aiderignore" -- "$module" | sort) | wc -l)
  [ "$files" -gt 0 ] || { echo "$module: no code aider reads, no map"; continue; }
  depth=$(printf '%s' "$module" | tr -cd / | wc -c)
  readme=$(printf '../%.0s' $(seq 0 "$depth"))README.md
  run_aider "$clone/$module" 4096 --subtree-only > "$raw"
  write_map "$raw" "$here/projects/$module.md" "Repo map: $module" \
    "[\`$module\`]($url/tree/$commit/$module)" "--subtree-only --map-tokens 4096" \
    "$(git -C "$clone" ls-files -- "$module" | wc -l)" "$readme"
done
