# Design findings — CardImage (component set in frame 115:3938)

Raised rather than filled in, per `CLAUDE.md`. Each item says what the design
does, what the code does, and what a designer needs to decide.

Figma: https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=115-3938

The set has two variant properties and one boolean:

| Property | Values | Symbols |
|---|---|---|
| `state` | `idle`, `hovered` | — |
| `ratio` | `1:1`, `3:2` | 115:3936, 115:3937, 115:3935, 115:3934 |
| `overlayAction` | true, false | boolean, multiplies all four |

Each symbol holds a "Slide Image" layer, an `IconButton` instance, and — on the
two hovered symbols — an "overlay" gradient layer.

Findings 1, 2 and 3 are visible: they change what ships. The rest are naming and
geometry.

---

## 1. The overlay action is an IconButton, and IconButton does not exist

The `overlayAction` slot holds an **instance** — `IconButton`, nodes 114:3883
(hovered 1:1), 115:3923 (idle 3:2) and 114:3874 (idle 1:1) — which wraps a
second component, `Favorite` (114:3782, property `type=outline`). Everything
that makes the control look like a control lives there:

| Property | Bound to | Value |
|---|---|---|
| size | `sizing/8` | 40 |
| corner radius | `border/radius/pill` | 1000 |
| fill | `color/background/base` | `#ffffff` |
| stroke | `border/width/sm` + `color/border/secondary` | 1px, `#e5e7ea` |
| icon colour | `color/icon/secondary` | `#626e7a` |
| effect, hovered only | `elevation/level1` | two stacked shadows |

Neither `IconButton` nor `Favorite` exists in `src/components/`, and neither has
a row in the Airtable `Components` table. The nine rows there are ButtonCTA,
CardContainer, CardImage, CardLayout, CardText, Card, InputField, PasswordField
and OTPInput.

**Code:** `CardImage` positions and stacks the slot and takes whatever is put in
it (`action`). It draws no pill, no fill, no stroke, no icon, and it does not
apply `elevation/level1` on hover — that effect is applied to the IconButton
instance, not to the well. Reproducing any of it here would be copying a
component's styles instead of importing the component, which `CLAUDE.md`
forbids. The stories fill the slot with a labelled 40 x 40 stand-in so the
geometry can still be measured.

**Consequence for QA:** the deployed build renders no favourite button and no
hover elevation on it. That is this finding, not a coding defect.

**Decision:** add `IconButton` and `Favorite` (or a single `Icon`) to the
registry as components with their own Figma nodes, build them, then have
CardImage import IconButton and record it in `Composes`. Until then CardImage
cannot be complete.

## 2. The hover overlay is built out of core primitives, and its style is not exported

The "overlay" layer (114:3907 on 1:1, 115:3929 on 3:2) is a top-to-bottom
gradient between two variables:

| Stop | Figma variable | Layer |
|---|---|---|
| top | `color/grey/800A` | core primitive |
| bottom | `color/grey/0A` | core primitive |

`CLAUDE.md` is explicit that components consume semantic roles, not the core
ramp — "a component referencing `--color-blue-500` is wrong". There is no
semantic role in front of these two. The nearest thing in the export is
`--color-background-overlay`, which is `rgba(229, 231, 234, 0.6)`: a flat pale
grey, not a dark-to-light gradient, and so not a substitute.

The node also carries a **style** named `card overlay`. It comes back from the
Figma API with an empty definition, and nothing by that name exists in
`tokens/effects.styles.tokens.json`, which carries only `elevation-level1`,
`-level2` and `-level3`. So the one named thing that describes this gradient
does not ship.

**Code:** the gradient is drawn from exactly the two variables the node binds —
`--color-grey-800a` and `--color-grey-0a` — and nothing is substituted or
invented. This is the one place in the component that reaches past the semantic
layer, and it does so because the design does.

**Decision:** either add a semantic gradient/scrim role
(`color/background/scrim-*`, say) and rebind the layer to it, or export
`card overlay` as a composite style so the component can reference one name.
Then this rule references a semantic token and the exception goes away.

## 3. The overlay layer's own opacity overrides the alpha of the tokens it binds

The variables resolve to one thing; the layer renders as another:

| Stop | Token value in the build | What the layer renders |
|---|---|---|
| top | `--color-grey-800a` = `rgba(49, 55, 61, 0.6)` | `rgba(49, 55, 61, 0.2)` |
| bottom | `--color-grey-0a` = `rgba(255, 255, 255, 0.5)` | `rgba(255, 255, 255, 0.1)` |

A layer opacity has been set on top of the bound colour, three times lighter at
the top and five times lighter at the bottom. A token that is overridden where
it is used is not really the value in use, and nothing downstream can know that.

**This one is visible.** Built from the tokens as bound, the hover overlay is
markedly darker than the canvas shows. QA measuring the deployed build against
the node will see the difference immediately.

**Code:** the tokens as bound, at their shipped alpha. Nothing dimmed by hand —
picking 0.2 and 0.1 would be exactly the guess that looks like a decision.

**Decision:** clear the layer opacity and bind stops that already carry the
intended alpha, or add the alpha variants the design actually wants
(`color/grey/800a` at 0.2, `color/grey/0a` at 0.1) and rebind. Either way the
token and the pixel should agree.

## 4. The symbols' widths are raw, and the two ratios disagree by one pixel

`ratio=1:1` is drawn 362 wide; `ratio=3:2` is drawn 363 wide. Both are bound to
no variable, neither is on the 4px grid, and there is no reason for a media well
to be one pixel wider when its crop changes.

**Code:** the well fills the width it is given (`width: 100%`) and takes its
height from the ratio. That is what a media well inside CardContainer does. The
stories draw each symbol at its own canvas width so the two can be put side by
side.

**Decision:** confirm the well is fluid. If cards really do have fixed widths,
that width belongs in a sizing token, on CardLayout, and it should be the same
number for both ratios.

## 5. `ratio=3:2` is not drawn at 3:2

The two `3:2` symbols are 363 x 272. 363 / 272 is 1.335 — near enough 4:3. At
363 wide, a 3:2 crop is 242 tall, 30px shorter. The `1:1` symbols are exactly
362 x 362, so the set is precise where it means to be.

Either the property value is wrong or the frame is. This matters beyond the
component: a card grid laid out on the promise of 3:2 will not line up with a
4:3 image.

**Code:** `aspect-ratio: 3 / 2`, the ratio the property names. The property value
is the designer's stated decision; 272 is an unbound raw number, and the rule
here is to trust the decision and raise the number.

**Consequence for QA:** measured against the node, the `3:2` stories are 30px
shorter at the canvas width. That is this finding.

**Decision:** redraw the `3:2` symbols at 3:2 — 363 x 242 — or rename the
property value to `4:3` and say so.

## 6. The overlay action's inset is bound to no variable

The IconButton sits 12px from the frame's top and right outer edges (x = 310,
y = 12 in a 362 frame with a 1px stroke; 11px measured from inside the stroke).
Nothing binds it. 12 is `spacing/padding/md` on web, but the node does not say
so, and `spacing/padding/*` resolves differently on mobile and back-office.

**Code:** `calc(var(--spacing-padding-md) - var(--border-width-sm))` on `top` and
`right` — the frame's own padding step, less the stroke an absolute offset is
measured from inside of. It is composed from the two tokens the frame already
uses rather than from a third number, and it lands on the node's 11px on web.

**Decision:** bind the inset to `spacing/padding/md`, and confirm it is meant to
follow the platform padding scale rather than being a fixed 12.

## 7. A hovered state, but no focused, pressed or disabled state

The set responds to the pointer and to nothing else.

Unlike CardContainer, this one clearly is interactive: it holds a button. A
favourite control that can be hovered but gives no focus indication is an
accessibility defect in the design rather than in the code — and whether the
image itself is clickable (opening the listing) is not answered anywhere.

**Code:** the well renders a `<div>` with a CSS `:hover` rule. It is not
focusable and takes no click handler. The focus behaviour of the button in the
corner belongs to IconButton (finding 1).

**Decision:** say whether the image is a click target. Design a focused symbol
for whatever is — the button, the image, or both.

## 8. `border/radius/8` is not a name the export carries

All four symbols bind their corner radius to a variable named
`border/radius/8`, value 8.

The radius ramp that ships is named by step, not by number:
`border-radius-none`, `-xs`, `-sm` (8px), `-md`, `-lg`, `-xl`, `-pill`. There is
no `border-radius-8` anywhere in `tokens/` or in `config/css/`, so a component
that trusted this name would render square corners.

Same shape as CardContainer finding 1: a variable whose name the Design Tokens
export does not carry.

**Code:** `--border-radius-sm` — the name that exists in the build output at
exactly 8px, and the step whose own description reads "The default. Buttons,
inputs, chips, small cards."

**Decision:** rebind all four symbols to `border/radius/sm` and delete the
numeric duplicate, then re-export.

## 9. The idle 3:2 symbol strokes itself with two variables named as CSS `var()` expressions

Three of the four symbols bind their stroke to `border/width/sm` (1) and
`color/border/secondary` (`#e5e7ea`). `ratio=3:2, state=idle` (115:3937) binds
it to two variables whose **names** are literally CSS `var()` calls:

| Figma variable name | Value |
|---|---|
| `var(--horizon-semantic-border-width-default)` | 1 |
| `var(--horizon-semantic-color-border-default)` | `#eaeff4` |

A variable name is a name, not an expression. Neither appears in `tokens/`, so
no build output can resolve them. `#eaeff4` is not in any Horizon ramp — it is
not `--color-border-secondary` (`#e5e7ea`) and not `--color-grey-100`. It comes
from somewhere else entirely.

This is the same family as CardContainer finding 1, and the `horizon-semantic-`
namespace is the same one. It is spreading between components.

**Code:** `--border-width-sm` and `--color-border-secondary`, the properly-named
bindings its three siblings use. One stroke declaration serves all four symbols.

**Decision:** rebind 115:3937 to `border/width/sm` and `color/border/secondary`,
and sweep the file for the rest of the `var(--horizon-semantic-*)` variables —
this is now the second component to hit them.

## 10. `color/grey/800A` reads opaque

`CLAUDE.md`: "An `a` suffix means the token carries an alpha channel. If it
exports opaque, it is misnamed — report it."

Read live through the Figma API, `color/grey/800A` resolves to `#31373d` —
opaque — while its sibling `color/grey/0A` resolves to `#ffffff80`, which does
carry alpha. The Design Tokens export disagrees with the first of those and
gives `--color-grey-800a: rgba(49, 55, 61, 0.6)`.

So one of the two readings of the same variable is wrong, and the variable that
disagrees is the top stop of the overlay in finding 2.

**Code:** the build output, `--color-grey-800a`, since that is what ships.

**Decision:** confirm in Figma whether `grey/800A` carries alpha. If it does not,
it is misnamed; if it does, something is flattening it on the way out and the
export is the thing to trust.

## 11. Two spellings and a stacking order, for the record

Neither changes a pixel; both are the kind of thing that costs an afternoon
later.

- **`overlayAction`.** The Figma MCP reports the boolean property as
  `overlayAction`. ButtonCTA's non-variant properties are kebab-case in Figma
  (`label-text`, `show-leading-icon`) and kebab-case in code, filed in
  `docs/naming-conflicts.md`. If this property is really spelled
  `overlay-action`, the prop should be renamed to match — the rule is that the
  names agree. It is built as `overlayAction`, as reported.
- **IconButton's stacking order.** The button sits at `z-index: 3` in three
  symbols and at `2` in `idle, ratio=1:1` (114:3874). Nothing overlaps it in
  that symbol, so it is invisible today. The code stacks image 1, overlay 2,
  action 3 everywhere.

**Decision:** confirm the property spelling; set the same order on all four
symbols.
