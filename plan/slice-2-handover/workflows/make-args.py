#!/usr/bin/env python3
"""Write the args of a round's workflows: make-args.py <round> <base hash> "<base in words>".
Each group is one workflow (two agents at a time inside it)."""
import json, sys

S = '/tmp/claude-0/-home-user-Grasp/c7f4c0c3-3293-5171-8b1a-2fc91a0152d6/scratchpad'
shots = json.load(open(S + '/shots.json'))
by_package = {s['package']: s for s in shots.values()}

NAMES = {
    '2-2': 'Package 2-2. Lines by dragging',
    '2-3': 'Package 2-3. Label editing',
    '2-4': 'Package 2-4. Deleting, showing, and views',
    '2-5': 'Package 2-5. Moving a box into another owner',
    '2-6': 'Package 2-6. Badges, and the checks while drawing',
    '2-7': 'Package 2-7. Notes and the archive',
    '2-8': 'Package 2-8. Code links in Details',
    '2-9': 'Package 2-9. The text tab',
    '2-10': 'Package 2-10. The sequence view',
    '2-11': 'Package 2-11. The geometry view',
    '2-12': 'Package 2-12. The grid view',
    '2-13': 'Package 2-13. The browser view, and renaming in a tree',
    '2-14c': "Package 2-14. The fixtures, the limits and the camera's keys",
}

EXTRA = {
    '2-14c': (
        "Your part of this brief is the camera only. Package 2-14 is the lead's own, and runs through the whole slice; "
        "in this round a builder builds its camera's keys and the zoom's readout, and nothing else of it. You own exactly "
        "three files: canvas/app/src/core/actions/camera.ts, canvas/app/src/plane/ZoomReadout.tsx and "
        "canvas/app/test/camera.test.mjs (the tests named by lines 8 to 11 and 15 of section 7, whose skeleton the scaffold wrote). "
        "Read the brief's \"Decided for the camera\", the camera's rows of section 5's action table, and the camera's hand in "
        "seam 2 and in plane/Plane.tsx. The other test files the brief lists under \"Owns\" (fixtures, capabilities, refusals, "
        "scale, instant, and slice 1's tests) are the lead's: change none of them. The brief's \"The closing\" is not yours."
    ),
    '2-2': (
        "The scaffold wrote three of your tests first and marked them todo: connect.test.mjs \"in each graph view kind, a drag "
        "between each pair of node kinds draws what the rules allow and says why for what they refuse\", and the two of "
        "reconnect.test.mjs. Your package is what makes them pass: take each todo mark off only when the test passes as it is "
        "written. If one cannot pass as written, that is a stop: say why, and leave its mark."
    ),
}

GROUPS = {
    '1': [['2-2', '2-4', '2-8'], ['2-7', '2-3', '2-9'], ['2-6', '2-5', '2-14c']],
    '2': [['2-10', '2-12'], ['2-11', '2-13']],
}

rnd, base, words = sys.argv[1], sys.argv[2], sys.argv[3]
for i, group in enumerate(GROUPS[rnd], 1):
    packages = []
    for pid in group:
        shot = by_package.get(pid)
        packages.append({
            'id': pid,
            'name': NAMES[pid].split('. ', 1)[1],
            'brief': NAMES[pid],
            'extra': EXTRA.get(pid, ''),
            'shot': {'name': shot['name'], 'rated': shot['rated'], 'items': shot['items']} if shot else None,
        })
    out = f'{S}/args-round-{rnd}-{i}.json'
    json.dump({'base': base, 'baseWords': words, 'packages': packages}, open(out, 'w'), indent=1)
    print(out, [p['id'] for p in packages])
