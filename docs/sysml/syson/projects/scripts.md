# Repo map: scripts

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`scripts`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/scripts) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 11 files there; aider read the 11 that `syson.aiderignore` leaves in, and the map shows 11 of them, 1 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
scripts/bump-version

scripts/check-changelog.js

scripts/check-copyright.js

scripts/check-coverage.jsh

scripts/check-frontend-dependencies.js

scripts/check-labels.js

scripts/check-milestone.js

scripts/check-ts.js

scripts/prepare-release.js

scripts/restart-postgresql.sh

scripts/update-sirius-web.js:
⋮
│const updatePomProperty = (pomXmlPath, propertyName, value) => {
│  const pomXmlContent = fs.readFileSync(pomXmlPath, { encoding: "utf-8" });
│  const tag = `<${propertyName}>`;
│  const closingTag = `</${propertyName}>`;
│  const startTagIndex = pomXmlContent.indexOf(tag);
│  const endTagIndex = pomXmlContent.indexOf(closingTag);
│  if (startTagIndex === -1 || endTagIndex === -1) {
│    throw new Error(`Could not find <${propertyName}> in ${pomXmlPath}`);
│  }
│
⋮
```
