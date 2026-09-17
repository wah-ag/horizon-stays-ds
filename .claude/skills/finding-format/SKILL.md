---
name: finding-format
description: The shape of one QA finding — expected, saw, where — and where each part goes in a Staging Testing row. Use whenever QA records a case.
---

# Finding format

## When to use this
Every time QA records a case in `Staging Testing`, pass or fail. A finding is written so an
engineer can act on it without asking a question.

## The shape
Paired evidence, always: the deployed story showing what happened, and the Figma node showing
what it should be.

```
ButtonCTA · primary · hovered
Expected  background uses --color-background-interactive-white-foreground-brand-hovered
Saw       background is transparent
Where     ButtonCTA.css, .horizon-btn-cta--primary.is-hovered
```

- **Expected** names the token or the prop, from the Figma node.
- **Saw** is a measurement from the deployed staging build, with the token it resolves to when
  one matches.
- **Where** is the file and selector, or the story, that carries the defect.

A finding that says "the colour looks off" is not a finding.

## Where each part goes
| Part | `Staging Testing` field |
|---|---|
| The case | `Component/Sub Component`, `Variants`, `Size`, `State` |
| Expected | `Expected Results` |
| Saw and Where | `Suggestion for Improvement` |
| Theme, story, staging build, commit, substitutions | `Context` |

A pass uses the same shape: `Suggestion for Improvement` says what was measured, so the pass can
be checked later.

## Self-check
- [ ] Expected came from the Figma node, not the story file
- [ ] Saw is a number or a named token, not an impression
- [ ] Where points at a file, selector or story
- [ ] A design gap is called a gap, not logged against the engineer
