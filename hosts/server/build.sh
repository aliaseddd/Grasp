#!/usr/bin/env sh
# Builds the Server package in a container with Node 8.17.0, the Node.js that SPFx 1.4.1 supports, so anyone can
# rebuild it without installing Node 8 (ARCHITECTURE.md, The proof, step 5).
# Needs Docker and a built app: run `npm run build` in app/ first. The package lands in sharepoint/solution/.
# --unsafe-perm: the container runs as root, and npm 6 would otherwise run install scripts as `nobody`, which
# can't write the node-sass and phantomjs binaries into node_modules.
set -eu
cd "$(dirname "$0")/../.."
docker run --rm -v "$PWD":/work -w /work/hosts/server node:8.17.0 sh -c "npm ci --unsafe-perm --no-audit --no-fund && npm run build"
echo "Built hosts/server/sharepoint/solution/stronghold-server.sppkg"
