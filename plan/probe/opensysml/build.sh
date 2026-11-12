#!/bin/sh
# Rebuild this folder's generated files from plan/spikes/node_modules (run `npm install` in plan/spikes first).
set -e
cd "$(dirname "$0")"
S=../../spikes/node_modules
cp $S/@openmbee/opensysml-wasm/wasm_exec.js .
gzip -9 -c $S/@openmbee/opensysml-wasm/sysml-wasm.wasm > /tmp/sysml-wasm.wasm.gz
node -e "const fs=require('fs');fs.writeFileSync('wasm-data.js','window.SYSML_WASM_GZ_B64='+JSON.stringify(fs.readFileSync('/tmp/sysml-wasm.wasm.gz').toString('base64'))+';\n')"
(cd ../../spikes && NODE_PATH=$PWD/node_modules npx esbuild ../probe/opensysml/app.src.js --bundle --format=iife --minify --define:process.env.NODE_ENV='"production"' --outfile=../probe/opensysml/wasm-app.js)
ls -l wasm_exec.js wasm-data.js wasm-app.js
