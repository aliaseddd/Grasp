import json
tasks=[]
for n in (8,9,10,11,12,13): tasks+=json.load(open(f'plan/swarm/tasks-{n}.json'))
out={
 "about": "The tasks of the swarm that fills in the scaffold of steps 8 to 13 of slice 1. plan/swarm/README.md says what each field means and how the lead runs them.",
 "scaffold": "the last commit of session 24 on its branch; plan/notes.md, session 24, names it",
 "rework": {"model": "sonnet", "effort": "high"},
 "tasks": tasks,
}
open('plan/swarm/tasks.json','w').write(json.dumps(out, indent=2)+"\n")
print(len(tasks), 'tasks')
