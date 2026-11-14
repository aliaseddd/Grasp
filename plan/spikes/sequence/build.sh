#!/bin/sh
# Bundles the three pages into dist/ (ignored by git), as classic scripts. Run from anywhere.
cd "$(dirname "$0")/../../.." || exit 1
for name in a b c; do
  node_modules/.bin/esbuild "plan/spikes/sequence/$name.jsx" --bundle --format=iife --jsx=automatic --minify \
    --define:process.env.NODE_ENV='"production"' --log-level=warning "--outfile=plan/spikes/sequence/dist/$name.js" || exit 1
done
ls -l plan/spikes/sequence/dist | awk 'NR > 1 { print $5, $9 }'
