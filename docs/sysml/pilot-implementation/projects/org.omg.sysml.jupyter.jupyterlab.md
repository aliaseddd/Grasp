# Repo map: org.omg.sysml.jupyter.jupyterlab

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.jupyter.jupyterlab`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.jupyter.jupyterlab) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 13 files there; aider read the 13 that `pilot.aiderignore` leaves in, and the map shows 13 of them, 1 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.jupyter.jupyterlab/.classpath

org.omg.sysml.jupyter.jupyterlab/.gitignore

org.omg.sysml.jupyter.jupyterlab/.project

org.omg.sysml.jupyter.jupyterlab/.settings/org.eclipse.buildship.core.prefs

org.omg.sysml.jupyter.jupyterlab/.settings/org.eclipse.core.resources.prefs

org.omg.sysml.jupyter.jupyterlab/.settings/org.eclipse.jdt.core.prefs

org.omg.sysml.jupyter.jupyterlab/README.md

org.omg.sysml.jupyter.jupyterlab/package.json

org.omg.sysml.jupyter.jupyterlab/pom.xml

org.omg.sysml.jupyter.jupyterlab/src/main/fold.ts:
⋮
│function isInStringCommentOrVariable(state: EditorState, pos: number): boolean {
│    const tree = syntaxTree(state);
│    let node: SyntaxNode | null = tree.resolveInner(pos, 1);
│    
│    while (node) {
│        const nodeType = node.type.name;
│        // Check if we're in a string, comment, or other non-code context
│        // Note that 'variableName' correesponds to a quoted name
│        if (nodeType === 'String' || 
│            nodeType === 'Comment' || 
⋮
│function findMatchingCloseBrace(state: EditorState, openPos: number): number | null {
│    const docLength = state.doc.length;
│    let nest = 1;
│    let pos = openPos + 1;
│    
│    while (pos < docLength && nest > 0) {
│        const char = state.sliceDoc(pos, pos + 1);
│        // Skip if we're in a string, comment, or variable
│        if (!isInStringCommentOrVariable(state, pos)) {
│            if (char === '{') {
⋮
│function computeFoldRange(state: EditorState, lineStart: number, lineEnd: number) {
│    // Check the language first
│    const lang = state.facet(language);
│    if (!lang || lang.name !== 'sysml') return null;
│
│    const lineText = state.sliceDoc(lineStart, lineEnd);
│    
│    for (let i = 0; i < lineText.length; i++) {
│        const char = lineText[i];
│        if (char === '{') {
⋮
│export function sysmlFoldServiceSelection(options: IEditorExtensionFactory.IOptions): Extension {
│    const mimeType = options.model.mimeType;
│    if (mimeType === 'text/x-sysml'
│        // In the newly created notebook, the first cell is initialized as 'text/plain'
│        // We check the language in the foldService as well to avoid misapplication.
│        || mimeType === 'text/plain') {
│        return [ foldService.of(computeFoldRange) ];
│    } else {
│        return [];
│    }
⋮

org.omg.sysml.jupyter.jupyterlab/src/main/mode.ts

org.omg.sysml.jupyter.jupyterlab/src/main/plugin.ts

org.omg.sysml.jupyter.jupyterlab/tsconfig.json
```
