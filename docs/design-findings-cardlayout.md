# Design findings — CardLayout (component set 118:110)

Raised rather than filled in, per `CLAUDE.md`. Each item says what the design
does, what the code does, and what a designer needs to decide.

Figma: https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=118-110

The set has one property, `layout`, with two symbols: `vertical` (118:109) and
`horizontal` (118:108). Each holds a CardImage instance, a CardText instance,
and a Figma slot. The only values the design bound to a variable are the two
gaps — `spacing/gap/sm` (8) on the vertical column and inside the horizontal
body, `spacing/gap/md` (16) between image and body. Both resolve exactly in the
build output as `--spacing-gap-sm` and `--spacing-gap-md`, and both are used.

Everything below is a value the design left unbound, or a structural question
the two symbols answer differently.

---

## 1. The corner radius is a bare `12`, bound to nothing

Both symbols set `border-radius: 12` on the CardLayout root. No variable is
bound to it — it is a literal number typed on the node.

`--border-radius-md` ships at exactly `12px`, so the temptation is to reach for
it. That would be a guess shipped as code. The build skill is explicit: an
unbound property is a design gap to report, never to fill with the nearest
token.

Two further reasons to leave it out rather than guess:

- **The radius is inert on this node.** The CardLayout root has no fill, no
  stroke and no clipping. A radius on a transparent, unclipped frame changes
  nothing that renders. Whatever it was for, it is not doing it here.
- **CardContainer already owns the card's corner.** `CardContainer.css` binds
  `--border-radius-md` on the surface that actually has a fill and a stroke.
  A second 12 on the layout inside it is either redundant or a leftover.

**Code:** no `border-radius` in `CardLayout.css`.

**Decision:** delete the radius from both symbols if CardContainer owns the
corner, or bind it to a real variable if the layout is meant to clip its own
children. Then re-export.

---

## 2. The horizontal symbol binds a raw `399` width; the vertical binds none

`layout=horizontal` (118:108) is drawn `w-[399px]`, bound to no variable.
`layout=vertical` (118:109) has no width binding at all and renders at 363,
the width of the frame around it.

Neither number is a design decision. 399 is the width the symbol happens to be
laid out at on the canvas, exactly as CardContainer is drawn at 301
(`docs/design-findings-cardcontainer.md`). A layout atom fills what it is
given.

**Code:** `width: 100%` on the root, no fixed width anywhere. The story file
holds 363 and 399 so a tester can put a story and the symbol side by side; the
component carries neither.

**Decision:** set both symbols to fill width, or bind the width to a sizing
variable if a card really is meant to be a fixed 399 everywhere. Consistency
between the two symbols is the point — right now they disagree.

---

## 3. The same slot is named two different things

The vertical symbol's slot (118:103) is named `vertical slot`. The horizontal
symbol's (118:126) is named `horizontal slot`. They are the same region of the
same component, holding the same thing, in two symbols of one set.

This is not cosmetic. Figma's code generator turns a slot layer name into a
prop name, so the two symbols generate `verticalSlot` / `showVerticalSlot` and
`horizontalSlot` / `showHorizontalSlot`. A consumer switching `layout` would
have to rename the prop it passes, which is exactly the kind of break the
variant axis exists to prevent.

**Code:** one prop, `slot`, on both layouts. There is no single Figma name to
match here, so `CardLayout.js` documents the choice at the top rather than
picking one symbol's spelling and leaving the other silently wrong.

**Decision:** rename both layers to one name — `slot` — and re-export. The
layout axis already says which symbol it is; repeating it in the layer name is
what created the split.

---

## 4. The horizontal body column is a bare `135` height

Frame 118:124 — the column holding CardText and the slot beside the image — is
drawn at a fixed `h-[135px]`. That is the image's own square side, repeated as
a literal on a second node.

**Code:** `align-self: stretch` on `.horizon-card-layout__body`, which says
"exactly as tall as the row", without hardcoding a number that belongs to
CardImage. If CardImage's square ratio ever changes, the column follows.

**Decision:** set the body column's vertical resizing to fill rather than
fixed, so the two nodes stop carrying the same number independently. If the
column really is meant to be fixed and independent of the image, bind it to a
sizing variable and say so.

---

## 5. CardImage and CardText are not in the repo yet

CardLayout composes two components that do not exist in `src/components/`:

| Figma | Node | Status |
|---|---|---|
| CardImage | 115:3938 | not built |
| CardText | 105:116 | not built |

Per `CLAUDE.md`, a component imports its subcomponents and never copies their
styles, so CardLayout draws neither. It hands each a region and lets it size
itself. The stories fill those regions with labelled dashed stand-ins carrying
the geometry the node draws them at.

This is a **dependency, not a design gap** — it is recorded here so the gap
between what the stories show and what a finished card looks like is not read
as a defect.

**Action:** once both components land, a card composes
`CardImage` + `CardLayout` + `CardText` inside `CardContainer`, and this row's
`Composes` in the registry is filled in. Nothing in `CardLayout.css` needs to
change for that: the regions are already unstyled wrappers.

---

## 6. The set defines no interaction states

`CardLayout` has one property and no state axis — no hovered, pressed, focused,
disabled or destructive symbol. `CardContainer` (118:286) has the same shape:
`idle` and `hovered`, and no focused or pressed
(`docs/design-findings-cardcontainer.md`, finding 6).

For CardLayout this looks correct rather than missing: the node draws no fill,
no stroke and no text of its own, so it has nothing to restyle under a pointer.
The card's hover belongs to CardContainer and the favourite button's to
CardImage. It is recorded so a tester reading "every state" in `CLAUDE.md` does
not go looking for states that were deliberately never drawn.

**Decision:** none needed, unless a whole card is meant to respond as one
target — in which case that behaviour belongs on CardContainer, not here.

---

## 7. Observed, but not CardLayout's to raise

Inside the CardImage instance on the **vertical** symbol (118:58), the border
binds two variables whose names are literally CSS `var()` calls:

| Figma variable name | Value | Bound to |
|---|---|---|
| `var(--horizon-semantic-border-width-default)` | 1 | border width |
| `var(--horizon-semantic-color-border-default)` | `#eaeff4` | border colour |

The **horizontal** symbol's CardImage instance (118:79) binds `border/width/sm`
and `color/border/secondary` to the same two properties — real names, and a
different colour (`#e5e7ea`). So the two instances of one component do not
match.

This is the same class of defect as `docs/design-findings-cardcontainer.md`,
finding 1: a variable name is a name, not an expression, and neither of these
appears in `tokens/`, so no build output can resolve them.

It lives inside CardImage (115:3938), which is a separate component being built
separately. It is recorded here only because it was visible from this node, and
belongs in CardImage's findings.
