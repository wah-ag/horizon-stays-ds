# Design findings — btn-CTA (node 80:359)

Raised rather than filled in, per `CLAUDE.md`. Each item says what the design
does, what the code does, and what a designer needs to decide.

Figma: https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=80-359

---

## 1. Primitive used where a semantic token belongs — height

Four symbols bind height to `sizing/10`, a **core primitive**, where their
siblings use the semantic `size/control/lg`. All four are **large primary**:
`idle` (80:345), `hovered` (80:342), `pressed` (80:348) and `destructive`
(80:343). Primary md and sm bind `size/control/md` and `size/control/sm`
correctly, as does every `secondary` symbol and `primary/disabled`. Both tokens
resolve to 48px today, so nothing looks wrong.

**Code:** uses `--size-control-lg` everywhere.

**Decision:** rebind those four in Figma to `size/control/lg`. If the control
scale ever moves independently of the raw sizing ramp, they silently stop
tracking the others.

## 2. Secondary loses its border when pressed

`secondary/pressed` has no border at **any** size, while all five other
`secondary` states carry `border/width/sm`. Each pressed frame is 2px narrower
than its siblings — lg 159 vs 161 (80:350), md 143 vs 145 (80:351), sm 135 vs
137 (80:333) — so the button shrinks at the moment of press in all three sizes.

**Code:** keeps the 1px border and tints it to the fill, so the outer box is
stable and the button reads as borderless.

**Decision:** confirm this was unintentional. If the shrink is wanted, say so and
it goes back in.

## 3. Focus ring corner radius

Focus is drawn as a wrapping frame: `border/width/md` in
`color/border/brand-secondary` at `border/radius/md` (12px), held
`spacing/padding/xxs` clear of the button.

**Code:** `outline` + `outline-offset`, which is the same geometry with no extra
DOM node. CSS derives the ring's radius from the button's own
(`border-radius-sm` 8px + 2px offset = 10px), so the ring is 10px where the
design says 12px.

**Decision:** accept 10px, or accept a wrapper element to hit 12px exactly.

## 4. Destructive has no hovered or pressed variant — RESOLVED

Originally raised as a gap. The designer has since confirmed that hovered and
pressed are prototype interactions ("while hovering" / "while pressing") wired
onto the **idle** button only, and that not every variant needs them.

**Code:** hover and press repaint the idle button and are scoped away from
destructive and disabled. The `danger-hovered` fill that was briefly used for
destructive hover has been removed — it was filling in a gap that turned out not
to be one. No `danger-pressed` token is needed.

**Consequence, worth a second look:** a destructive button now gives no pointer
feedback at all. That is faithful to the design, but it is the one place where a
real cursor gets no response to a click it is about to make. Say the word if
destructive should pick up the same interaction treatment as idle.

## 5. Disabled primary — icon and label are different colours

`primary/disabled` sets the label to `color/text/disabled-primary` (`#f2f3f5`)
but the exported icon SVG is filled `#ffffff` — `color/icon/white`, not
`color/icon/disabled`. A 13-unit difference, visible on close inspection.

**Code:** reproduces the design exactly — label `--color-text-disabled-primary`,
icon `--color-icon-white`.

**Decision:** intended, or should the icon drop to the same disabled ramp as the
label? `secondary/disabled` binds both to the same value (`#b0b8c1`), which
suggests primary is the odd one out.

## 6. Token naming — `color/background/disabled-brand` carries alpha

Its value is `#ffffff80`, 50% white. `CLAUDE.md` says an `a` suffix means the
token carries an alpha channel. This one does and is not suffixed.

**Decision:** rename to `disabled-branda`, or whatever the ramp convention is for
a semantic alpha token. Note that `primary/disabled` works by stacking this over
`.../brand-idle`, which the code reproduces as a flat layer over the fill.

## 7. Token naming — `typograghy` is misspelled

`typograghy/font-family/inter` and `typograghy/font-weight/medium-500` — should
be `typography`. The typo is in the Figma variable names, so it travels into
every export and every platform output.

**Decision:** rename in Figma and re-run the sync. Worth doing before anything
else consumes these names.

## 8. Unrelated, already known

`npm run build:tokens` still warns that `title-xs`, `headline-xl` and
`body-md-underlined` have a line-height of 0 and are emitted as `normal`.
Pre-existing, listed in `tools.md`, not introduced here.

---

Items 9–12 were found by QA reading the Figma file independently, after the
first eight were written. None of them changes what renders today.

## 9. Every focused symbol binds height to a raw number

The inner `btn-cta` of all six focused symbols uses a literal `48px` / `40px` /
`32px` rather than `size/control/*`: primary `80:328`, `80:324`, `80:323` and
secondary `80:326`, `80:355`, `81:366`.

**Code:** uses `--size-control-*` throughout.

**Decision:** same fix and same reasoning as item 1 — a raw number cannot track
the control scale. This is the larger instance of that problem: six symbols
rather than four, and a literal rather than a mis-scoped token.

## 10. Two more primitives standing in for semantic tokens

- The focus frame's horizontal padding is `spacing/1` while its vertical is
  `spacing/padding/xxs`. Both are 2px; only one is semantic. All six focused
  symbols.
- Secondary md binds horizontal padding to `spacing/4` while its vertical uses
  `spacing/padding/sm`. Both 8px. Nodes `80:331`, `80:341`, `80:330`.

**Code:** uses `--spacing-padding-*` in both places.

**Decision:** rebind to the semantic tokens so the padding scale stays one thing.

## 11. A label colour bound to a border token

`secondary/sm/destructive` (node `80:340`, text node `77:57`) binds its label to
`color/border/danger-primary`. Its md and lg siblings (`80:330`, `80:353`) use
`color/text/danger`. Same value, wrong role.

**Code:** uses `--color-text-danger` for all three.

**Decision:** rebind the sm label. A text colour reading from a border token will
break the moment the two ramps diverge.

## 12. `primary/sm/focused` has a border its siblings do not

Node `80:323` carries `border/width/sm` in `color/border/brand-primary` on its
inner button; `80:328` (lg) and `80:324` (md) carry none. Invisible today because
the border colour equals the fill, but it makes the sm focus frame 145px wide
where 143 would follow from its siblings.

**Code:** renders no border on any primary focused — correct for lg and md, 2px
narrower than the sm symbol.

**Decision:** drop the border from `80:323`, or add it to all three.
