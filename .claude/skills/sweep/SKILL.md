---
name: sweep
description: The registry audit procedure — read every row, reconcile each status against its evidence, open every link, hunt contradictions, and write the report in a fixed order. Use for every PM sweep.
---

# Sweep the registry

## When to use this
Every audit of the registry — the scheduled sweep, or a human asking where things stand. Read
`.claude/skills/registry/SKILL.md` first: it holds where the registry is, who owns each column,
and the `Development` precedence this procedure reconciles against.

A sweep reads and reports. It writes nothing to the registry and fixes nothing it finds.

In scope: `Components`, `Staging Testing`, `GitHub Commits`.

## Steps
Each step's check must hold before the next starts. A step that cannot finish — a connector down,
a page that will not load — is reported as not checked, never skipped silently.

### 1 · Read the last report
Read the previous `reports/registry-audit.md`, if there is one, so this sweep can say what
changed.

**Check:** you know the last sweep's counts, contradictions and dead links, or that there was none.

### 2 · Read every row — not a filtered view
Read each table in full through the API, following pagination to the last page. Never a saved
view, a filter or a sort that could hide rows: a view is somebody's question, and an audit
answers all of them.

**Check:** for each table, the rows you hold equal the table's total record count.

### 3 · Reconcile each status against its evidence
`Development` is a formula, so it is only as right as the evidence under it and the formula
itself. For every `Components` row, work the status out yourself from the evidence, using the
precedence in the registry contract:

- Read `Testing Results` from the linked `Staging Testing` rows directly — not from
  `Staging Testing Results Summary`.
- Read `Astro Link`, `Release Review`, `Release Verdict`, `Production Storybook`,
  `Staging Storybook`, `Figma` and `Design` from the row.
- Take the first rule that matches.

Compare your answer with the `Development` value. Also recompute from the linked rows:
- `Total Staging Tests` — the number of linked test rows.
- `Synchronization %` — linked rows reading `Passed` ÷ linked rows.

Any difference is a contradiction: the formula, a rollup or a count is not saying what the
evidence says.

**Check:** every `Components` row has a derived status, and every mismatch is written down.

### 4 · Open every link — never count them
A filled cell is not a working link. Open each one:

| Link | Good when | Dead when |
|---|---|---|
| `Staging Storybook`, `Production Storybook` | The page renders the component in the browser | Error, blank page, login wall, or it renders something else |
| `Figma` | The node reads through the Figma connection | Node not found, no access |
| `Commit` (Components), `Commit URL` (GitHub Commits) | The commit exists in GitHub | Not found, or in another repository |
| `Attachment` | Not checked | — |

**Check:** every link was opened, and each has a result — good, dead, or not checked with a reason.

### 5 · Hunt contradictions
A contradiction is anything the registry says that its own rows, or the repo, disagree with.

**A row whose status disagrees with its evidence**
- Every mismatch from step 3.
- `Staging Storybook` is set, but `Figma` is empty or `Design` is not `Done`.
- `Production Storybook` is set, but `Staging Storybook` is empty, no test rows exist, or
  `Synchronization %` is not `100%`.
- `Synchronization %` reads `100%`, but a linked test row reads `Failed` or `Fixed (To re-test)`.
- `Development` reads `Completed` or `Released`, but a link it rests on is dead.

**A test row linked to nothing**
- A `Staging Testing` row with no `Composed In` link, or linked to a row that no longer exists.
- A `Staging Testing` row with a blank `Testing Results`.
- A `GitHub Commits` row with no `Link to Components`.

**A component in the repo with no row, or a row with no component**
- List `src/components/*` on `main` and on `staging` with git, not the working tree.
- A folder with no `Components` row of exactly that name.
- A row with `Production Storybook` set and no folder on `main`; a row with `Staging Storybook`
  set and no folder on `staging`. A missing `staging` branch is itself a contradiction.
- `Commit` points outside this repository, or its commit has no `GitHub Commits` row.

Names in `Staging Testing` → `Component/Sub Component` are not compared; `Composed In` is the
link that counts.

**Check:** every rule ran against every row, and every hit names its row, column and owner.

### 6 · Write the report
Overwrite `reports/registry-audit.md`, in this order:

1. **What you should do today** — every finding a human owns or whose owner is not set, and every
   open pull request waiting for a human. Most blocking first.
2. **What changed since last sweep** — new, resolved and still-open findings; status moves.
3. **Counts** — each `Development` value, blank included, with every row behind each count.
4. **Waiting on** — per owner, the rows and what each needs.
5. **Contradictions** — from step 5, grouped as above.
6. **Dead links** — row, column, URL, and what happened when it was opened.

Every finding names the row, the column, what disagrees, and the owner — or "Owner: not set".
Owners come from the registry contract. What a row is waiting on comes from its status:

| `Development` | Waiting on |
|---|---|
| blank, `Figma` set, `Design` not `Done` | Designer (human) |
| `To-do`, `To be fixed` | Engineer |
| `Ready for Testing`, `Fixed`, `Fixing` | QA |
| `To be deployed` | DevOps — or a human, when its pull request to `main` is open |
| `Completed`, `Released` | Nobody — still checked in full |

**Check:** the sections are in this order, and every count has its rows listed.

## Self-check
- [ ] I read every row of every table, and the row counts matched the table totals
- [ ] I derived every status from the evidence myself and compared it with `Development`
- [ ] I opened every link rather than counting them
- [ ] Every contradiction rule ran against every row
- [ ] Every finding names its row, column and owner
- [ ] Every count has its rows listed
- [ ] Anything I could not check is in the report as not checked, with the reason
- [ ] I wrote nothing to the registry
