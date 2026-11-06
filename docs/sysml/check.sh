#!/usr/bin/env bash
# Checks SysML v2 models with the SysML v2 Pilot Implementation's own parser and validator: the command-line REPL
# inside the release's Jupyter kernel (jupyter-sysml-kernel 0.63.1, the version the release's install/jupyter installs).
#
#   docs/sysml/check.sh                       # every .sysml file in this folder
#   docs/sysml/check.sh path/to/model.sysml   # the files given
#
# Each file is checked in a fresh process, so files checked one after another can't see each other. A file passes
# when the kernel reports no errors; the script exits 1 if any file has one.
#
# Needs Java 17 or later and python3. The first run downloads the kernel from conda-forge (about 120 MB), checks its
# SHA-256, and unpacks it into SYSML_KERNEL_CACHE (default ~/.cache/sysml-kernel-0.63.1). The package is zstd
# compressed; if this Python can't read zstd, the script installs the zstandard package into that cache with pip.
# No Jupyter or conda is needed.

set -euo pipefail

VERSION=0.63.1
PACKAGE="jupyter-sysml-kernel-$VERSION-pyhd8ed1ab_0.conda"
URL="https://conda.anaconda.org/conda-forge/noarch/$PACKAGE"
SHA256=8da665d2b2131dcfbde62d32926864d0d03a62393ffdf4598efa64e0bc4b2251

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CACHE="${SYSML_KERNEL_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/sysml-kernel-$VERSION}"
KERNEL="$CACHE/share/jupyter/kernels/sysml"
JAR="$KERNEL/jupyter-sysml-kernel-$VERSION-all.jar"

command -v java >/dev/null || { echo "Java 17 or later is needed to run the kernel." >&2; exit 2; }

if [ ! -f "$JAR" ]; then
  command -v python3 >/dev/null || { echo "python3 is needed to unpack the kernel." >&2; exit 2; }
  mkdir -p "$CACHE"
  download="$CACHE/$PACKAGE"
  echo "Downloading $PACKAGE ..." >&2
  curl -fsSL -o "$download.part" "$URL"
  echo "$SHA256  $download.part" | sha256sum -c --quiet - || {
    echo "The download's SHA-256 doesn't match, so it wasn't unpacked." >&2
    rm -f "$download.part"
    exit 2
  }
  mv "$download.part" "$download"

  # Python 3.14 reads zstd itself; older versions need the zstandard package.
  if ! python3 -I -c 'import compression.zstd' 2>/dev/null; then
    python3 -I -c 'import zstandard' 2>/dev/null ||
      python3 -I -c 'import sys; sys.path.insert(0, sys.argv[1]); import zstandard' "$CACHE/python" 2>/dev/null ||
      PIP_ROOT_USER_ACTION=ignore python3 -m pip install --quiet --target "$CACHE/python" zstandard
  fi

  # A .conda file is a zip holding pkg-*.tar.zst, which holds share/jupyter/kernels/sysml.
  python3 -I - "$download" "$CACHE" <<'PY'
import io, sys, tarfile, zipfile
sys.path.insert(0, sys.argv[2] + '/python')
package, cache = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(package) as z:
    name = next(n for n in z.namelist() if n.startswith('pkg-') and n.endswith('.tar.zst'))
    data = z.read(name)
try:
    from compression import zstd
    raw = zstd.decompress(data)
except ImportError:
    import zstandard
    raw = zstandard.ZstdDecompressor().stream_reader(io.BytesIO(data)).read()
with tarfile.open(fileobj=io.BytesIO(raw)) as t:
    members = [m for m in t.getmembers() if m.name.startswith('share/jupyter/kernels/sysml/')]
    t.extractall(cache, members=members, filter='data')
PY
  rm -f "$download"
  [ -f "$JAR" ] || { echo "The package didn't hold $JAR." >&2; exit 2; }
fi

if [ "$#" -eq 0 ]; then
  set -- "$HERE"/*.sysml
fi

failed=0
for file in "$@"; do
  # The REPL takes a model between two lines that hold only %, then %exit ends it.
  out="$({ echo '%'; cat "$file"; echo; echo '%'; echo '%exit'; } |
    java -Xss8m -cp "$JAR" org.omg.sysml.interactive.SysMLInteractive "$KERNEL/sysml.library/" 2>&1 |
    grep -v '^Picked up JAVA_TOOL_OPTIONS\|^Reading \|^log4j:\|^SysML v2 Pilot Implementation' |
    sed 's/^[0-9]*> //; s/ ([0-9a-f-]\{36\})$//' | grep -v '^$' || true)"
  if printf '%s\n' "$out" | grep -q 'ERROR:'; then
    echo "FAIL $file"
    printf '%s\n' "$out" | grep 'ERROR:' | sed 's/^/  /'
    failed=1
  else
    echo "ok   $file ($(printf '%s' "$out" | tr '\n' ',' | sed 's/,$//; s/,/, /g'))"
  fi
done
exit "$failed"
