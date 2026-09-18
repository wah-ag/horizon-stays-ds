---
name: finding-format
description: The shape of one QA finding — the case, what was expected and where that came from, what was seen, and where it lives in the code — and where each part goes in a Staging Testing row. Use whenever QA records a case.
---

# Finding format

## When to use this
Every time QA records a case in `Staging Testing`, pass or fail.

A finding is what QA hands the engineer. It must be actionable without a follow-up question: if
the engineer has to ask which button, which state, how QA knows, or which file, the finding is
not finished.

## Required parts
Every finding has all five. A missing part is a missing finding.

| Part | What it holds |
|---|---|
| **Case** | The component, and the exact variant, size and state — by their Figma property names. |
| **Expected** | The token or prop the design specifies. |
| **Source** | Where that expectation came from: the Figma node ID and the property or binding read from it. Never the story file. |
| **Saw** | What the deployed staging build actually did, as the token or prop it resolves to. |
| **Where** | The file and selector, or the story, that carries it. |

## The rule
**Name the token or the prop, never a raw value.** A measured value may sit beside the token it
resolves to, as evidence. It never stands in for the token. When a measured value matches no
token, say that in words — "resolves to no semantic token" — and give the value as evidence.

"The colour looks off" is not a finding.

## A good finding
An illustration of the shape, not a live defect:

```
Case      ButtonCTA · type=primary · size=md · state=idle, hovered by a real pointer
Expected  background --color-background-interactive-white-foreground-brand-hovered
Source    Figma 80:359 (ButtonCTA), primary "while hovering" interaction — fill binding
Saw       background stays --color-background-interactive-white-foreground-brand-idle
          (measured rgb value unchanged from idle)
Where     ButtonCTA.css, .horizon-btn-cta--primary.is-interactive:hover
          story components-buttoncta--idle-interactions
```

The engineer knows which button and which state, which token it should be and why, which token it
is instead, and which rule to open.

## A bad finding
```
Button hover — the colour looks off. It's #5f98f5, should be a bit darker.
```

It fails on every part:
- **Case** — no type, size or state. There are six idle buttons that hover.
- **Expected** — "a bit darker" names no token, so there is nothing to check a fix against.
- **Source** — none. The engineer cannot tell if this came from Figma, a screenshot or a hunch.
- **Saw** — a raw hex instead of the token it resolves to.
- **Where** — no file, selector or story.

The engineer's first move would be to ask a question, which is exactly what a finding exists to
prevent.

## Where each part goes
| Part | `Staging Testing` field |
|---|---|
| Case | `Component/Sub Component`, `Variants`, `Size`, `State` |
| Expected and Source | `Expected Results` |
| Saw and Where | `Suggestion for Improvement` |
| The screenshot of the failing case | `Attachment` |
| Theme, story, staging build, commit, substitutions, screenshot path | `Context` |

## In the row: bullets, not prose
A row is read at a glance, in a narrow cell. Write facts, not sentences:

- One fact per bullet, at most four bullets per field.
- Name the token or the prop. Sizes as `w × h`.
- No preamble, no "it appears that", no repeating the case.

```
Expected Results
• Border: 1px --color-border-brand-primary
• Size: 117 × 32
• Source: Figma 132:957 (primary/sm/focused)

Suggestion for Improvement
• Saw: no border, 114.11 × 32
• Where: ButtonCTA.css, .horizon-btn-cta--primary:focus-visible
• Fix: add the 1px border — or fix the node, since lg and md have none
```

The long form belongs in `reports/<Component>.md`, not in the cell.

## A pass writes nothing but its result
A `Passed` row leaves `Expected Results`, `Suggestion for Improvement` and `Attachment` **empty**.
Its evidence is the screenshot named in `Context`. A green row means QA tested that case on the
deployed build and it matched the node — nothing to read, nothing to act on.

## The screenshot
`Attachment` carries the failing case's screenshot, and only a failing case's. Airtable attaches
from a URL and this connection cannot upload a local file, so the file is committed on QA's
`qa/…` branch and attached by its commit-sha `raw.githubusercontent.com` URL — never a branch
URL, which moves. If that is not possible, `Attachment` stays empty, the path stays in `Context`,
and QA says so in its report.

## Self-check
- [ ] The case names component, variant, size and state
- [ ] Expected names a token or prop, and Source names the Figma node it came from
- [ ] Saw names a token or prop; any raw value sits beside one, never alone
- [ ] Where points at a file and selector, or a story
- [ ] An engineer could act on it without asking a question
- [ ] The row is bullets, four or fewer per field, with no sentences
- [ ] A failure carries its screenshot; a pass carries none, and no finding fields
- [ ] A design gap is called a gap, not logged against the engineer
