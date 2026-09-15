---
name: build-component
description: Build one design system component from one Figma node, in four checked stages.
---

# Build a component

## When to use this
Use this when you are turning one Figma component into one coded component in
`src/components/`, or fixing one after a QA report. Do not use it for building a
whole screen, or for anything that spans more than one node.

## Steps

### 1 · Schema — read the design
Pull the node through the Figma connection. Write down the **variant matrix**:
every variant property, every size, every state in the component set. That list
drives the props, the stories, and the QA pass.

**Check:** every property in the design has a prop or a token binding written down.
Nothing is "I'll work it out when I write it."

### 2 · Tokens — resolve, don't choose
For each visual property, find the semantic token that carries that meaning in
`build/tokens/css/tokens.css`. Never a raw value. Never a base token directly —
the `--primitives-*` names in that file are the base layer, and a component that
reaches for one has skipped the semantic token that should sit in front of it.

That file is generated. Read it, never edit it.

A property the design leaves unbound is a design gap. Report it and build the rest.

**Check:** every value resolves to a semantic token, and the unbound ones are raised
rather than invented.

### 3 · Implement — structure and behaviour
Create `src/components/<Name>/<Name>.tsx` and `<Name>.css`. Prop names match the
Figma property names exactly. Every CSS value uses `var(--token-name)`.

Layout is translated, not eyeballed: auto-layout becomes flex or grid carrying its
direction and alignment, gap and padding come from their spacing tokens.

Interactions actually work. Disabled, hover, focus, loading — behaviour, not just a
class that changes colour.

**Check:** `npm run lint` passes.

### 4 · Check — render it and compare
Write `<Name>.stories.tsx`, one story per row of your matrix. **Record the Figma
node URL at the top of that file** — QA tests against the node, not against your
story file, and cannot start without it.

Then run
`npm run storybook` and **look at it**: the sidebar lists your stories, the canvas
draws them, the console is clean, every state clicks through.

Then compare each story against the Figma node: spacing, colour, size, radius, states.

**Check:** every matrix row matches its node, or the difference is reported.

This stage is your **self-check**, and local Storybook is the right place for it.
It is not the handoff, and it is not QA. Do not hand anything to QA from here.

### 5 · Deploy — staging, then the registry, in that order
Only once stage 4 is fully green. Never before, and never partly.

1. Merge the component branch into `staging` by PR. Never into `main`.
2. Deploy that staging build to Vercel.
3. **Open the deployed URL yourself and see the component render.** A link to a
   build you have not looked at is a lie in a cell.
4. Write that URL into the registry's `Staging Storybook` column, plus `Commit`
   and a `GitHub Commits` row.

Writing `Staging Storybook` flips `Development` to `Ready for Testing`, which is
what wakes QA. **That cell is the entire handoff** — QA starts from the link in
the registry, in Claude in Chrome, and tests that deployed build and nothing
else. QA refuses when the cell is empty, so a component you did not deploy is a
component nobody tests.

**Check:** the staging URL is deployed, opened, seen to render, and written to
`Staging Storybook`.

## References
- The token source: `build/tokens/css/tokens.css` (generated, read-only)
- The good example to copy: `src/components/button/` (camelCase folder, per `CLAUDE.md`)
- Naming and conventions: `CLAUDE.md`
- Commands and stack: `tools.md`

## Self-check
- [ ] Prop names match the Figma property names exactly
- [ ] Every visual value is a `var(--token)`, with no raw hex, px, or font names
- [ ] Every row of the matrix has a story
- [ ] The Figma node URL is recorded at the top of the story file
- [ ] Storybook renders every story with no console errors
- [ ] `npm run lint` passes
- [ ] The staging build is deployed, and I opened it myself before recording it
- [ ] `Staging Storybook` holds that URL — the handoff is the cell, not a message
- [ ] Anything the design left unbound is reported, not guessed
