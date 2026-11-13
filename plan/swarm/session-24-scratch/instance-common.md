# What every scaffold instance does

You are one of four instances of Claude working at the same time, each on one step of slice 1 of Grasp. This file is the part of your brief that all four share. Your own message names your step, your worktree and what is particular to your step.

## The goal, and why

Grasp is a SysML v2 design canvas being rebuilt in seven slices. Slice 1, "The shell and the planes", has thirteen steps; steps 1 to 7 are built, steps 8 to 13 are left. Until now each step went: Claude wrote that step's outline (skeleton files, a test list), Sonnet agents wrote its tests and its code, and only then was the next step outlined. This run changes the method: the outlines for all of steps 8 to 13 are written now, as one **scaffold**, and a later run hands the scaffold to a swarm of Sonnet instances at medium effort, which fill it in, many at once.

You write the scaffold for **one step**. You write no implementation, start no agent of any kind, and run no Sonnet model.

The scaffold is good enough when a Sonnet instance can do its task from its brief and the files the brief names, **without making a design decision and without asking a question**. Session 22's log shows where the care must go: both serious defects its review found came from an outline that left a behaviour unsaid (a press is not yet a drag; what an undo in the middle of a gesture does to the gesture's later steps). So say every behaviour a test or an implementer needs: what happens with no file open, with nothing picked, with several things picked, when another file is opened, when the thing shown leaves the model after an undo, at the keyboard, when a rule refuses. And build nothing for needs slice 1 does not have: where slice 2 gives something its meaning (`plan/slice-1.md`, section 2, "Which editing is slice 1's"), the scaffold says so and leaves it out.

## Read first, in this order

Make no claim about code you have not opened. Paths are from the repository's root, which is your worktree.

1. `plan/swarm/README.md` and `plan/swarm/shared.md`: the method, the fields of `tasks.json`, the rules every brief carries, and the contracts all steps share. These came with the commit your worktree is at, `bddd5d2`.
2. `plan/slice-1.md`: sections 2 to 4 (what is settled, the layout, the look and how it is checked), your step in section 5, sections 6 and 7 (the rules for tests, state documents and decisions), and section 10 (the eight success criteria: a step is done when its "Done when" and the criteria both hold).
3. `plan/direction.md`: "The slices", item 1; "Decided for slice 1"; "What is not settled yet".
4. `plan/notes.md` from the heading "Session 17" to the end, about 1,700 lines. Above all: "How each step is built" and "The architecture" (session 17); the five rules of a brief and "The DOM contract" with its test tables (session 20), which are the model for your test lists; every "For the next session"; and each session's log of rework and whose fault it was (sessions 19, 21, 22, 23).
5. The code your step builds on, under `canvas/app/src/` and `canvas/app/test/` (`helpers.mjs` whole), and the parts of the old page your step ports, under `canvas/src/` (`canvas/src/README.md` says where each part lives). Open the libraries' own sources under `node_modules/` wherever your contract leans on what a library does (React Flow 12.10.2, Dockview 8.9.0, Material UI 7.3.11, MUI X Tree View 8.29.3): past sessions were wrong where they guessed and right where they read.

## The shared contracts

They are in the code at `bddd5d2`, each as the comment in its file, and `plan/swarm/shared.md` says who relies on each:

- `canvas/app/src/core/selection.ts`: the selection (`Picked`, `Hit`, `Selection`, `selectionOf`).
- `canvas/app/src/core/commands.ts`: the tool in hand, as far as other steps need it (`Tool`, `Tools`, `toolsOf`).
- `canvas/app/src/shell/dockContext.ts`, `panels/SidePanel.tsx`, and the four panel files under `panels/`: how a side panel is put into the dock. `shell/Toasts.tsx` and `shell/About.tsx` likewise, rendered by `App`.
- The end of the contract comments in `plane/Plane.tsx`, `plane/viewStore.ts`, `shell/Dock.tsx`, `shell/App.tsx` and `shell/TopBar.tsx`: what each step changes there.
- `canvas/app/test/helpers.mjs` (its end) and `test/core.mjs` (`loadWith`): what the tests share. `test/shots.mjs` and `test/shots/*.mjs`: one file per new shot.

**You do not change a shared contract.** If you find one wrong, or too weak for your step, or impossible with what a library does, stop working on what depends on it and say so in what you send back: what is wrong, the evidence (file and line, or what you ran), and what you would have it say. Go on with everything that does not depend on it.

The files you may not change, because the lead owns them and other instances rely on them: everything listed in section 5 of `shared.md` as changed by "No task" or by another step, and `core/selection.ts`, `shell/dockContext.ts`, `panels/SidePanel.tsx`, `plane/Plane.tsx`, `plane/viewStore.ts`, `shell/Dock.tsx`, `shell/App.tsx`, `shell/TopBar.tsx`, `core/adapter.ts`, `core/index.ts`, `app.css`, `shell/theme.ts`, `vendor.ts`, `test/helpers.mjs`, `test/core.mjs`, `test/shots.mjs`, `package.json`, `plan/status.json`, `plan/notes.md`, `plan/slice-1.md`, `plan/direction.md`, `plan/swarm/README.md`, `plan/swarm/shared.md`. Where your step needs something in one of them (a colour in `theme.ts`, an icon in `vendor.ts`, a helper or a test id in `helpers.mjs`, a sentence more or other in a contract comment), write the exact text to add in what you send back, and write your scaffold as if it were there.

Nothing under `canvas/src`, `canvas/test` or the rest of `canvas/app/test/unchanged.json`'s list may change by one byte.

## What you make

All of it in your worktree, committed there (a commit on the detached HEAD; add files by name, never `git add -A`), so the lead can read your diff against `bddd5d2`.

### 1. Skeleton files

Each new source file the plan names for your step exists under `canvas/app/src/`, with its exported types and signatures, and each contract written as a comment over a body that throws `"<name>: step N builds it"`, as step 7's outline did (see commit `695a789` with `git show 695a789 --stat` and its files). The contract comment is the specification: it says every behaviour, in plain words and full sentences, in the style of the comments already in `canvas/app/src/` (read `plane/viewStore.ts`'s `ViewStore` comment and `shell/Dock.tsx`'s for the style).

A file the page already loads keeps doing what it does today. That holds for your step's panel file under `panels/` and for `shell/Toasts.tsx`, `shell/About.tsx`: the exported component keeps its present body until the swarm builds it; you add the contract as its comment, and any types, constants and helper signatures (with bodies that throw) the implementer is to fill in. Nothing that runs when the page loads may throw or change what the page shows.

Test files are not created now: the swarm's test writers write them from your test lists.

`npm run build` then `npm run check` must pass in your worktree before you commit, and `canvas/dist/` is not committed by you (the lead builds it). Do not run the whole test suite: four instances share this machine, and the lead runs it alone at the end. You may run single test files and small probes of your own (kept outside the repository, under your worktree's parent folder) to find out what a library does.

### 2. `plan/swarm/step-N.md`

Your step's file, with these sections in this order. Write for a reader with no other context than the files it names.

1. **What the step delivers**: the plan's own sentences for the step, quoted, then in a list what the plan leaves open for it and how you settle each, with the reason. This is where your design is.
2. **The files**: each file the step creates or changes, what it holds, and which task owns it.
3. **The contract between tests and code**: every test id, role, accessible name, attribute, class and word that a test reads and a component gives; every sentence the page says (the exact words); every number (sizes, times, limits). A table, as session 20's "The DOM contract". Test writers and implementers work without seeing each other's work, so this must be complete: if a test must find it or type it or wait for it, it is here.
4. **The test lists**: one table per test file. Each row is one test:
   - its exact name, as the string given to `test()`;
   - what it does, step by step, and its fixture (which state file, which view, which elements by id);
   - what it asserts;
   - **the message it must fail with before its code exists**, when run against the scaffold (the first line: a sentence in the page's own terms, such as "Details shows no name field for Host");
   - **the breakage that must fail it once the code is built**: one small change to the built code under which this test, and as far as can be no other, fails. A test that cannot fail before its code exists (it passes against the scaffold) is marked so, and its breakage is then the only way it is seen to fail.

   Include every test the step's "Done when" names, under that very name; every test section 10's criteria add at your step (criterion 6 has parts at steps 7 and 10; criteria 2 and 6 must go on holding); and any other test a behaviour of your contract needs. A behaviour with no test is a behaviour the swarm may get wrong unseen. Where an existing test's contract is restated by your step (an existing test that asks for what your step changes), list it with its file, its present name, and exactly what it asks after your step: no test is loosened, a restated test asks for the new contract as strictly as it asked for the old.
5. **The screenshot** (if the plan's table in section 4 gives your step one): the scenario for its shot file under `canvas/app/test/shots/`, step by step, as exactly as a test's; and the list its reviewer checks, each item one thing that is present or absent in the image. The reviewer sees only the image and the list.
6. **Decisions**: each thing you decided where the plan is silent, one line each with its reason. And each thing tried and dropped.

### 3. One brief per swarm task, `plan/swarm/briefs/<task-id>.md`

For test writers, implementers, reviewers and checks alike. `plan/swarm/README.md` gives a step's pattern of tasks and what a brief holds, in order: the goal and its reason; where to read (files and sections, in reading order); the files owned; the tests and the commands; what to send back; the five rules with their reasons, word for word from the README; and the two sayings (tests check the code and do not define it; something that looks wrong is a reason to stop and say why). A reader with no other context must be able to follow it, so a brief names the worktree's commands in full (`npm ci`, `npm run build`, `npm run check`, `node --test --test-timeout=120000 canvas/app/test/<file>`), says that a timed test is judged by the lead alone, and says what "done" is.

Split the step into tasks so that no two tasks that can run at the same time own the same file, and so that as much as possible runs side by side: a test writer per test file or small group of files; an implementer per part that shares no file with another. Use these ids where they apply, because other steps' tasks name them in their needs:

- `9-impl-selection` owns `canvas/app/src/core/selection.ts`. `9-impl-plane` owns `plane/Plane.tsx` and `plane/viewStore.ts`. `9-impl-dock` owns `shell/Dock.tsx` and `shell/App.tsx`. `9-impl-explorer` owns `panels/Explorer.tsx`.
- `10-impl-details` owns `panels/Details.tsx` and `panels/fieldHooks.ts`. `10-impl-dock` owns `shell/Dock.tsx` and needs `9-impl-dock`.
- `11-impl-commands` owns `core/commands.ts`. `11-impl-plane` owns `plane/Plane.tsx`, `plane/viewStore.ts` and `plane/Palette.tsx`, and needs `9-impl-plane`.
- `12-impl-bar` owns `shell/TopBar.tsx`.
- Every step N ends with `N-checks-break`, `N-review-code`, one `N-review-shot-<name>` per screenshot, and `N-checks-close`, which is the lead's and needs every other task of the step and `(N-1)-checks-close`.

Test writers run on `sonnet` at `medium`, implementers on `sonnet` at `medium`, `N-checks-break` on `sonnet` at `medium`, `N-review-shot-*` on `sonnet` at `medium`, `N-review-code` on `fable` at `high`, and `N-checks-close` is `lead`.

### 4. `plan/swarm/tasks-N.json`

Your step's tasks, as an array of the objects `plan/swarm/README.md` describes (`id`, `step`, `kind`, `brief`, `owns`, `needs`, `model`, `effort`, `status: "open"`). The lead joins the steps' arrays into `plan/swarm/tasks.json`.

## What to send back

Your final message is read by the lead, who has read your diff first. Keep it to what the diff does not say:

1. The commit you made.
2. Your decisions where the plan is silent, one line each with its reason.
3. Anything in the shared contracts you found wrong, each with its evidence and what you would have it say.
4. Each exact addition you need in a file you may not change: the file, the place, the text.
5. What you could not settle, and what you would need to settle it.
6. What you verified by running something, and what you only read.

## Style

The repository writes in plain words and full sentences, and names things once: read a few of its comments and its notes before you write. Use the plan's words with the plan's meanings ("the application", "the page", "the core", "the session", "the adapter", "a view's store", "a strip"; "slice" for the seven parts of the redesign and "step" for the parts of a slice). Do not invent a name where the plan or the code has one; where you must name something new, say what it is where you first use it.
