---
name: registry
description: The contract every agent reads before it reads or writes the Airtable registry — where it is, who owns each column, how the derived status is computed, how the shared Testing Results column changes hands, and what nobody may do.
---

# The registry contract

Read this before you touch the registry — before a read, and always before a write. The
registry is the Airtable base **Horizon-ds**. It is the source of truth for every table, field and
value name an agent uses. When this file, an agent file or the FigJam board disagrees with the
base, the base wins and the disagreement is reported.

## Where it is
IDs never go in the repo. They live in a local, gitignored file:

- **`.claude/registry.local.json`** — the base ID and the table IDs. Resolve every ID from here.
- **`.claude/registry.example.json`** — committed; the same shape with placeholders.

If `registry.local.json` is missing, stop and say so. Do not look the IDs up and write them
anywhere else, and do not guess.

In scope: `Components`, `Staging Testing`, `GitHub Commits`. `DS Feedback` and
`One-Off Components` are out of scope for now.

## Owners
Every column has one owner. An agent writes only the columns it owns. A column marked **—** is
computed by Airtable, and nobody writes it.

### `Components`
| Column | Owner | Note |
|---|---|---|
| `Components` | Not set | The row's name. |
| `Category` | Not set | |
| `Figma` | Designer (human) | |
| `Design` | Human | A human's sign-off. No agent nudges it. |
| `Staging Storybook` | Engineer | Written after opening the deployed page; rewritten after each repair deploy. |
| `Commit` | Engineer | |
| `GitHub Commits` | Engineer | Filled by the Engineer's `GitHub Commits` row. |
| `Composes` | Engineer | |
| `Composed Into` | Engineer, through `Composes` | Never edited directly. See the flags. |
| `[Staging] Test Records` | QA | Filled by QA's `Staging Testing` rows. |
| `Production Storybook` | DevOps | Written after opening the live page and passing the deploy gate. |
| `Astro Link` | Skipped for now | No agent writes it. |
| `Release Review` | Not set | |
| `Release Verdict` | Not set | |
| `Development` | — | Formula. See below. |
| `Synchronization %` | — | Formula: `Staging Passed Count` ÷ `Total Staging Tests`. |
| `Staging Testing Results Summary` | — | Rollup of `Testing Results`. |
| `Total Staging Tests`, `Staging Passed Count` | — | Counts. |
| `Staging Passed Tests` | — | Rollup. |
| `Last Modified` | — | |

### `Staging Testing`
| Column | Owner |
|---|---|
| `Component/Sub Component`, `Composed In`, `Variants`, `Size`, `State`, `Context`, `Attachment`, `Expected Results`, `Suggestion for Improvement` | QA |
| `Testing Results` | **Shared** — QA and Engineer. See the protocol. |

### `GitHub Commits`
| Column | Owner |
|---|---|
| `Commit Hash`, `Message`, `Author`, `Date Committed`, `Link to Components`, `Files Changed`, `Commit URL`, `Commit Type` | Engineer |

## `Development` — the derived status
`Development` is a formula. **Nobody writes it** — no agent and no human. To change it, change the
evidence underneath it. First match wins, in this order:

1. `Staging Testing Results Summary` contains `Failed` **and** "re-test" → `Fixing`
2. contains `Failed` → `To be fixed`
3. contains "re-test" → `Fixed`
4. `Astro Link` set, `Release Review` set, and `Release Verdict` = `Cleared` → `Released`
5. `Production Storybook` set → `Completed`
6. `Staging Testing Results Summary` is not empty → `To be deployed`
7. `Staging Storybook` set → `Ready for Testing`
8. `Figma` set and `Design` = `Done` → `To-do`
9. otherwise blank

Use these strings exactly: `Fixing`, `To be fixed`, `Fixed`, `Released`, `Completed`,
`To be deployed`, `Ready for Testing`, `To-do`.

### Two consequences that will surprise you
**A failure outranks everything below it.** Steps 1 and 2 sit above `Released` and `Completed`,
so a component that is already live and fails a re-test reads `To be fixed`, not `Completed`. That
is correct: it is broken, and being live is what makes it urgent. Do not read `To be fixed` as
"never shipped", and do not reason that a live component must be fine.

**`Released` needs all three cells, not just the link.** `Astro Link`, `Release Review` and
`Release Verdict` = `Cleared` must all hold together; any one alone leaves the row at `Completed`.
With `Astro Link` skipped for now, no row can reach `Released`, and `Completed` is the last status
this crew produces. Rows that already read `Released` were set before the skip.

A third that bites in practice: step 6 fires on the first test row that has no `Failed` and no
re-test beside it. A QA run still writing its rows can read `To be deployed` before the matrix is
complete.

## The shared column — `Staging Testing` → `Testing Results`
Two agents write this column. Each may make only its own transitions, only on its own evidence.

| From | To | Who | Only when |
|---|---|---|---|
| (new row) | `Passed` or `Failed` | QA | QA created the row after testing the case on the deployed staging build. |
| `Failed` | `Fixed (To re-test)` | Engineer | The Engineer repaired that case, deployed it to staging, opened the page, and rewrote `Staging Storybook`. |
| `Fixed (To re-test)` | `Passed` or `Failed` | QA | QA re-tested that case on the deployed staging build. The row is updated in place. |
| `Passed` | `Failed` | QA | A regression re-test failed. The row is updated in place. |
| `Failed` | `Passed` | QA | **A design-side fix.** The node changed, the code did not, and QA re-tested that case on the same deployed staging build and found it now matches the updated node. The row is updated in place, and `Context` names what changed in the node. |

No other transition exists. In particular:
- The Engineer never writes `Passed` or `Failed`, never touches a row it did not repair, and never
  creates a row.
- QA never writes `Fixed (To re-test)`.
- A `Failed` row clears only through a fresh measurement — the Engineer's repair, re-tested, or
  QA's own design-side re-test. Never because somebody says the design has been fixed.
- Nobody sets `Testing Results` blank, and nobody deletes a row.
- Nobody adds an option. The options are exactly `Passed`, `Failed`, `Fixed (To re-test)`.

## Never
- Write `Development`, or any column marked **—**.
- Write a column you do not own. A column whose owner is **Not set** is written by no agent.
- Write `Astro Link`.
- Put a base, table or field ID in any committed file.
- Add an option to a select field — including by writing a value that does not exist.
- Change a table, a field, a formula or a description. The schema belongs to a human.
- Delete a row.
- Write a link before opening it.
- Make a `Testing Results` transition the protocol does not list.
- Use a spelling from the board or from memory instead of the base.
- Read a filtered view and treat it as the whole table.

## Flags — where a column's description and its behaviour disagree
These are reported, not fixed. The schema is a human's to change.

1. **`Release Review`** — the description says it "does not feed Development". The formula reads
   it at step 4.
2. **`Release Verdict`** — the description says it is "Deliberately not wired into Development".
   The formula reads it at step 4 (`= "Cleared"`).
3. **`Staging Passed Tests`** — the description says it "Counts only test rows marked Passed" and
   "Feeds Synchronization %". `Synchronization %` reads `Staging Passed Count` instead, and this
   rollup reads `0` on `ButtonCTA` (28 test rows) and `Card` (44 test rows), whose rows all read
   `Passed`.
4. **`Composed Into`** — the description says it is "Derived automatically… nobody writes this
   directly". It is an ordinary two-way link, the inverse of `Composes`: it can be edited, and
   editing it rewrites `Composes` on the other row.
5. **`Astro Link`** — the description says "DevOps owns this" and names a "Release" agent. This
   crew has no Release agent and skips `Astro Link` for now.
6. **`Release Review`** — the description points at `.claude/skills/release-review/SKILL.md` and
   `VERSIONING.md`. Neither exists in the repo.

Not a disagreement, but unverified: **`Staging Passed Count`** has no description, and through the
API its configuration looks the same as `Total Staging Tests`. If it counts every row rather than
only `Passed` rows, `Synchronization %` reads `100%` whenever any test row exists.
