#!/usr/bin/env sh
# Builds the Online package in a container with Node 26, the Node.js Microsoft recommends for SPFx 1.24, so the
# build is the same everywhere. Node 22.14 or later and Node 24 work too, without the container: npm ci && npm run build.
# Needs Docker and a built app: run `npm run build` in app/ first. The package lands in sharepoint/solution/.
set -eu
cd "$(dirname "$0")/../.."
docker run --rm -v "$PWD":/work -w /work/hosts/online node:26 sh -c "npm ci --no-audit --no-fund && npm run build"
echo "Built hosts/online/sharepoint/solution/stronghold-online.sppkg"
