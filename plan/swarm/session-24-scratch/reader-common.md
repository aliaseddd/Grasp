# What a reader does

You are a reader of one step's scaffold. This file is the part of your brief that every reader shares; your own message names your step and your worktree.

## What this is for

Grasp is a SysML v2 design canvas whose new page is built step by step (`plan/slice-1.md`). For steps 8 to 13 the outlines of all steps were written at once, as a scaffold: skeleton files in the code, one file per step under `plan/swarm/`, and one brief per task under `plan/swarm/briefs/`. A later run hands each brief to a Sonnet instance at medium effort, many at once. Those instances cannot ask anyone a question, and anything a brief leaves open they will settle by guessing, each in its own way: a test writer and an implementer of the same thing work without seeing each other's work.

The scaffold is good enough when a Sonnet instance can do its task from its brief and the files the brief names, **without making a design decision and without asking a question**. You find out whether it is. The last step built this way had two serious defects, and both came from an outline that left a behaviour unsaid.

## What you do

For each brief of your step, under `plan/swarm/briefs/` (the files whose names begin with your step's number):

1. Read the brief as the agent it is written for would, and then everything the brief tells that agent to read, in the order it gives. Read nothing the brief does not name, except to check a claim: you may open any file to see whether what the brief or the step's file says about it is true.
2. Walk through the task in your head, from the first command to what is sent back, as that agent: what would I write first, what would I look up, where would I stop. **Do not do the task**: write no test and no implementation, and change no file.
3. Note every place where that agent would be stuck or would have to choose:
   - **a question** it would have to ask: something it needs that neither the brief nor the files it names say;
   - **a decision** it would have to make: something two reasonable agents would settle differently (a name, a selector, a message's words, an order, an edge case's behaviour, which of two files a thing goes in);
   - **a contradiction**: between the brief and the step's file, between either and a contract comment in the code, between a test list and what the code or a library can do, between two briefs of the step;
   - **something that cannot work**: a helper, export, test id, fixture, element id or command that does not exist or does not do what is said; a test that cannot fail with the message its list gives, or cannot pass with the contract as written; a breakage that would not fail its test; a task that needs a file another task owns, or a task whose needs do not hold what it must start from.
   Check claims against the code and, where a contract leans on a library, against the library's source under `node_modules/`. You may run small probes of your own (a Node one-liner, a single existing test file, a short Playwright script from `file://` using `canvas/app/test/helpers.mjs`), kept outside the repository. Do not run the whole test suite: other instances share this machine.

For a test list, do this for every row: could the test writer write exactly this test without choosing anything? Would the implementer, who never sees the test, make exactly what the test looks for? For a behaviour the contract states: is there a test that would catch its absence? For a behaviour a person would meet (no file open, nothing picked, several things picked, another file opened, an undo that removes what is shown, the keyboard, a refusal): does the contract say what happens?

Also check the step's entries in its `plan/swarm/tasks-N.json`: every file a brief says its task owns is in `owns`; no two tasks that can run at the same time own one file; `needs` holds every task whose work this one starts from; and every test the plan's "Done when" names for the step (`plan/slice-1.md`, section 5) and every check section 10's criteria put at this step belongs to a task.

## What you send back

A list, grouped by brief, and nothing else. Each item:

- **where**: the brief, and the file and place (section, row, or line) the gap is in;
- **what**: the question, decision, contradiction or impossibility, in one or two sentences, concrete enough to act on, with the evidence when you checked something (file and line, or what you ran and what it printed);
- **the smallest fix**: what one would add or change, and where, to close it, when you can say.

Order each brief's items by how badly an agent would go wrong. Leave out matters of taste and anything an agent would get right anyway. If a brief has nothing, say "nothing" for it. Do not praise, and do not summarise the scaffold.
