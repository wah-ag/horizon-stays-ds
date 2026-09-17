---
name: test-component
description: Test a built component against its Figma node, read live over the Figma MCP connection, and report every variant, size, and state as a pass or a finding — with the measurement techniques that are easy to get wrong.
---

# Test a component

## When to use this
Use this when a component has been built or fixed and needs verifying against its design node.
Do not use it to test a component you built yourself in this same session.

**Hard gate — before anything else.** Test only what has a staging link. Read
`Staging Storybook` on the component's `Components` row in Airtable. If it is empty, do not
test — not local Storybook, not the story file. Wait, and say you are waiting. Waiting is a
correct outcome, not a failure to report.

## Expectations come from the node — never the story file
Every expected value — the matrix, each size, each token, each state — comes from the Figma
node. The story file is the code's claim about itself, and a component compared against its own
code agrees with itself by construction and proves nothing.

The node URL is at the top of the component's story file and in the build report. Reading the
URL there is fine; reading an expectation there is not. If you cannot find the node, ask.

## Measurement techniques that are easy to get wrong
Each of these produces a confident, wrong finding when skipped. Every step below leans on them.

### Fonts — measure, don't ask the API
`document.fonts.check()` is not proof. It answers "is there anything left to load for this
font?" — and for a family that was never declared or never matched, there is nothing to load, so
it returns `true` for a font that is not there.

Measure instead. After `await document.fonts.ready`, draw the same string on a canvas twice,
with the same weight, size and fallback — once in the declared family, once in a deliberately
bogus one:

```js
const ctx = document.createElement('canvas').getContext('2d');
const width = (family) => {
  ctx.font = `500 16px ${family}, monospace`;
  return ctx.measureText('Hamburgefonstiv 0123456789').width;
};
const declared = getComputedStyle(el).fontFamily.split(',')[0].trim();
const loaded = width(declared) !== width('"qa-no-such-font"');
```

Identical widths mean the declared family fell back to `monospace` — the font is missing. Every
width you were about to report is then wrong because of the font, not the component: report the
font, and report no widths until it loads.

**Check:** fonts measured as loaded, in the weight the component uses, before any width is written.

### Values — read them from the browser, not by eye
"Looks about right" is not a measurement. Read the numbers:
- Colour, padding, gap, radius, border, shadow, opacity, font — `getComputedStyle(el)` on the
  element that carries the style, not its wrapper.
- Width and height — `el.getBoundingClientRect()`, with the canvas at 100% zoom; a transform or
  Storybook zoom scales the rect.
- A computed colour comes back as `rgb()`. Resolve which token it is by reading
  `getComputedStyle(el).getPropertyValue('--token-name')` in the same element's scope, then name
  the token in the finding — never the raw value alone.

**Check:** every number in the report came from a computed value or a rect, not an impression.

### States — drive them with real input, don't inspect classes
A class name proves a class is present, not that the state works. A story pinned to `is-hovered`
proves the CSS for that class, not that hovering does anything.

Drive each state with trusted input from the browser tool, then read the computed style while
the input is held:

| State | Real input | Not proof |
|---|---|---|
| Hovered | Move the real pointer over it | `dispatchEvent(new MouseEvent('mouseover'))`, adding `is-hovered` |
| Pressed | Press and hold the real pointer | Adding `is-pressed`, `:active` in the stylesheet |
| Focused | Click an empty spot, then press Tab | `el.focus()` — it does not trigger `:focus-visible` |
| Disabled | Really click it, and confirm nothing happened — no handler, no state change | The `disabled` attribute or class being present |
| Destructive, loading, others | Render the prop, then drive it as above where it is interactive | The class name alone |

**Check:** every interactive state in the matrix was driven by real input, and its computed style
was read while that input was held.

### Theme mode — confirm both sides before calling a colour wrong
A colour can be right in one mode and wrong in the other. Before a colour is a finding, confirm
which mode **each side** is answering in, and that they match.

- **The browser side.** Storybook sets `data-theme` on `<html>` from its theme global
  (`&globals=theme:dark` in the iframe URL; light by default). Read
  `el.closest('[data-theme]')?.dataset.theme`. With no `data-theme` at all, the tokens fall back
  to `prefers-color-scheme` — read `matchMedia('(prefers-color-scheme: dark)').matches` too.
- **The Figma side.** `get_variable_defs` and `get_design_context` answer in whichever mode the
  file or frame is set to, which may not be the default. Confirm the variable mode of the node
  you are reading before taking a value from it.

Compare light with light and dark with dark. Record the mode of both sides in `Context`.

**Check:** both modes were confirmed and matched before any colour was called wrong.

## Steps

### 1 · Read the design — the Figma node is the truth
Pull the node over the Figma MCP connection before you look at the component:

| Tool | What it gives you | Use it for |
|---|---|---|
| `get_metadata` | every variant name, and each one's exact width and height | the matrix, and the geometry to measure against |
| `get_design_context` | reference code with token bindings, plus a screenshot | which token each property should carry |
| `get_variable_defs` | the Figma variable → value map, in the mode currently set | confirming a binding — after confirming the mode |
| `get_screenshot` | a render of the node | the visual comparison |

`get_metadata` on the component-set node names every variant and hands you the real pixel
dimensions — the matrix and the measurement baseline in one call.

**Check:** you have a list of expected cases that came from Figma, not from the code.

### 2 · Reconcile against the stories
List the stories that exist. This is not a source of expectations — it only finds cases that
cannot be tested. A row in Figma with no story is a **missing case**, and a finding. A story with
no row in Figma is dead or undocumented — report it, do not quietly drop it.

**Check:** every Figma case has a story or a missing-case finding.

### 3 · Open the deployed build and measure
Open each story on the deployed staging build, in Claude in Chrome, at
`<Staging Storybook>/iframe.html?id=<story-id>&viewMode=story` — adding `&globals=theme:dark`
for dark cases. Never local Storybook, never the story file.

Confirm fonts first. Then, for each case, read width and height, padding, gap, radius,
background, colour, border, shadow, opacity and font from the browser, and compare against the
node in the same theme mode.

**Check:** fonts confirmed, theme modes matched, every value read from the browser.

### 4 · Drive every state
Drive each interactive state with real input, as above, and read the computed style while it is
held. A state that only changed a class has not been tested.

**Check:** each interactive state was driven, not rendered or inferred from a class.

### 5 · Capture the visual states
Screenshot each state while it is held, including hovered, pressed, focused and disabled. Save
them to `reports/<Component>/`. Where a case fails, capture the Figma render beside it, in the
same mode.

### 6 · Check the tokens
Confirm no raw hex, px or font value appears in the component or its CSS. Token names live in
`config/css/` — generated by `npm run build:tokens`, so read it, never edit it.

A value the design left unbound is a design gap, not an engineering defect. Report it as a gap;
do not log it against the engineer.

### 7 · Write the findings
One row per case, pass or fail, in the format in `.claude/skills/finding-format/SKILL.md`: the
case, what was expected and where it came from, what was seen, and where it lives.

## Judgement — what is and is not a defect
Do not burn a finding on these:

- **Sub-pixel width drift.** Figma and the browser rasterise text differently. A consistent ~1px
  difference across every row is the renderer, not the component. The same delta on *every* case
  points at something systemic; a delta on *one* case is a real finding.
- **A colour that differs across modes.** If the two sides were answering in different modes, the
  finding is that you compared the wrong modes, not that the colour is wrong.
- **A border that does not change the box.** A Figma stroke set to inside does not add to the
  frame size; an inset ring in CSS is a faithful translation, not a bug.

## References
- The build under test: the `Staging Storybook` link on the component's Airtable row
- The finding format: `.claude/skills/finding-format/SKILL.md`
- The generated tokens: `config/css/` (read-only, never hand-edited)
- Theme wiring: `.storybook/preview.js` — `data-theme` on `<html>` from the theme global
- Commands and stack: `tools.md`
- What a component must satisfy: `CLAUDE.md`

## Self-check
- [ ] A `Staging Storybook` link existed, and every case was tested on that deployed build — never local
- [ ] Every expectation came from the Figma node, not the story file
- [ ] Fonts were measured loaded — two widths, declared and bogus — before any width was reported
- [ ] Every value came from `getComputedStyle` or a rect, not from looking
- [ ] Every interactive state was driven by real input, never inferred from a class
- [ ] Both sides' theme modes were confirmed and matched before any colour was called wrong
- [ ] Every failure has a screenshot and follows the finding format
- [ ] Design gaps are reported as gaps, not as engineering defects
- [ ] You changed nothing in `src/components/`
