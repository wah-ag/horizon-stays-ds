---
name: deploy-gate
description: Check a production deployment is live and whole before its link is written to the registry — every tested story loads, the console is clean, fonts and tokens loaded. Not a design test.
---

# Deploy gate

## When to use this
After DevOps has deployed a merge to production and opened the page, and before it writes
`Production Storybook`. Run it against the live production URL, never staging or local.

This is not QA. It does not compare anything against Figma. It proves the thing QA passed
actually arrived in production, whole.

## Checks
Every check must pass. One failure means the link is not written.

### 1 · The deployment is the merge
The production deployment was built from the merge commit on `main` that carried the tested work.

**Check:** the deployment's commit is that merge commit.

### 2 · Every tested story loads
The story list comes from the component's linked `Staging Testing` rows — the story ids named in
their `Context`. Not from the story file, and not from the production sidebar.

Open each at `<production URL>/iframe.html?id=<story-id>&viewMode=story`.

**Check:** every story renders the component, with no error overlay and no missing story.

### 3 · The console is clean
**Check:** no errors in the console on any story from check 2.

### 4 · The fonts actually loaded
`document.fonts.check()` is not proof. Measure a string on a canvas in the declared family and
again in a deliberately bogus family name.

**Check:** the widths differ — the design system's fonts are present.

### 5 · The tokens loaded
**Check:** a semantic custom property such as `--color-text-brand` is defined on `:root`, so the
`config/css/` entry point reached production. Its value is not judged here.

## Result
- **All pass:** write `Production Storybook`.
- **Any fail:** write nothing. Report the check, the story and what was seen. Fix nothing.

## Self-check
- [ ] Every check ran against the production URL
- [ ] The story list came from the `Staging Testing` rows
- [ ] Nothing was fixed, and nothing was written after a failure
