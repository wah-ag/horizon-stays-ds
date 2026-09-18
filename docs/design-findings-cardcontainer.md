# Design findings — CardContainer (component set 118:286)

Raised rather than filled in, per `CLAUDE.md`. Each item says what the design
does, what the code does, and what a designer needs to decide.

Figma: https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=118-352

The set has one property, `state`, with two symbols: `idle` (118:287) and
`hovered` (118:289). Both are 301 x 141 and hold one child, `cardItems`
(118:288). Nothing below changed what the component looks like — every value
resolved to a token that already exists.

---

## 1. Three variables are named as CSS `var()` expressions

The node binds three variables whose **names** are literally CSS `var()` calls:

| Figma variable name | Value | Bound to |
|---|---|---|
| `var(--horizon-semantic-border-radius-control)` | 12 | corner radius, both symbols |
| `var(--horizon-semantic-spacing-padding-md)` | 16 | horizontal padding, `hovered` |
| `var(--horizon-semantic-spacing-padding-sm)` | 12 | vertical padding, `hovered` |

A variable name is a name, not an expression. None of the three appears
anywhere in `tokens/`, so the Design Tokens export does not carry them and no
build output can ever resolve them — a component that trusted these names would
render unstyled.

They also break the convention in `CLAUDE.md` twice over: a `--` prefix and a
`horizon-semantic-` namespace, where token names read category → property →
role (`border-radius-md`, `spacing-padding-lg`).

**Code:** `--border-radius-md` (12px), `--spacing-padding-lg` (16px web) and
`--spacing-padding-md` (12px web) — the names that exist in the build output at
exactly those values. Nothing invented, nothing renamed in the pipeline.

**Decision:** rename all three in Figma to real token names and rebind, or drop
them in favour of the variables `idle` already uses (finding 2). Then re-export.

## 2. The two symbols bind different variables to the same padding

`idle` binds horizontal padding to `spacing/padding/lg` (16) and vertical to
`spacing/padding/md` (12). `hovered` binds the same two edges to the malformed
pair in finding 1 — also 16 and 12.

Identical today, so nothing moves between the states, which is why this is
invisible rather than broken. It stops being invisible the moment either ramp
moves: the card would change size under the pointer.

**Code:** one padding declaration, from `idle`'s properly-named bindings, used
for both states.

**Decision:** rebind `hovered` to `spacing/padding/lg` and `spacing/padding/md`.

## 3. `idle` leaves its stroke weight unbound

`hovered` binds the stroke weight to `border/width/sm`. `idle` draws a raw `1`,
bound to nothing. Both are 1px, so the two symbols agree today.

Same shape as ButtonCTA finding 6a — the states that agree on a value disagree
on whether it is a token.

**Code:** one `--border-width-sm` declaration on the base class; the hover rule
adds elevation and touches nothing else.

**Decision:** bind `idle`'s stroke weight to `border/width/sm`.

## 4. The container's width is a raw 301px

Both symbols are drawn 301px wide, bound to no variable. 301 is not on the 4px
grid and matches no sizing token; it is the width of the frame the symbol was
laid out in.

**Code:** the container fills the width it is given (`width: 100%`) and hugs its
content vertically. That is what a container does, and what the node's own
description — "card layout (horizontal, vertical) will be added to card
container" — describes. The stories draw it at 301px so it can be measured
against the symbol side by side.

**Decision:** confirm the container is meant to be fluid. If cards do have fixed
widths, they belong in a sizing token and on CardLayout, not here.

## 5. Hover uses `Elevation/level1`, and the token's own description says otherwise

`hovered` applies `Elevation/level1`; `idle` has no elevation at all. The two
elevation tokens carry these descriptions in the export:

- **`elevation-level1`** — "…primary CTA buttons, navigation bars, **resting
  cards**."
- **`elevation-level2`** — "…signalling an active or dynamic state — **a card on
  hover**, an item being dragged."

So the design uses the resting-card shadow for hover, and gives the resting card
none. Either the descriptions are wrong or the bindings are. This one is
**visible**: if the bindings are wrong, every card in the product sits flat and
lifts too little on hover.

**Code:** `--elevation-level1` on hover, exactly as the node binds it. Nothing
substituted.

**Decision:** confirm `level1` on hover with no resting elevation, or rebind to
`level1` at rest and `level2` on hover — which is what both descriptions
describe.

## 6. A hovered state, but no focused state

The set responds to the pointer and to nothing else. There is no focused symbol
and no pressed symbol.

If a card is only ever a surface, that is correct and there is nothing to do. If
cards are clickable — and a hover response usually means they are — then keyboard
users get no indication of where they are, which is an accessibility defect in
the design rather than in the code.

**Code:** the container renders a `<div>` with a CSS `:hover` rule. It is not
focusable and takes no click handler, because inventing either would ship a
decision nobody made.

**Decision:** say whether cards are interactive. If they are, design a focused
symbol — and the interaction belongs on CardLayout or on the Card organism,
which is where the click target would live.
