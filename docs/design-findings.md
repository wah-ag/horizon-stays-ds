# Design findings — ButtonCTA (component set 132:822)

Raised rather than filled in, per `CLAUDE.md`. Each item says what the design
does, what the code does, and what a designer needs to decide.

Figma: https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=132-822

This replaces the findings for the previous node, `80:359`. The redesign carries
most of them forward; node IDs below are the new ones.

---

## 1. Primitive used where a semantic token belongs — height

Four symbols bind height to `sizing/10`, a **core primitive**, where every other
symbol of the same size binds `size/control/lg`. All four are **primary lg**:
`idle` (132:827), `hovered` (132:847), `pressed` (132:851), `destructive`
(132:843). Both resolve to 48px today.

**Code:** `--size-control-lg` for every lg button.

**Decision:** rebind those four to `size/control/lg`.

## 2. Primitive used where a semantic token belongs — secondary md padding

`secondary/md` `idle` (132:907), `disabled` (132:911) and `destructive` (132:915)
bind horizontal padding to `spacing/4` while vertical is `spacing/padding/sm`.
Their `hovered` and `pressed` siblings (132:965, 132:855) and the focused inner
button (132:942) use `spacing/padding/sm` on all four sides. Both are 8px.

**Code:** `--spacing-padding-sm` on all sides.

**Decision:** rebind the three to `spacing/padding/sm`.

## 3. Primitive used where a semantic token belongs — focus ring inset

All six focused symbols (132:931, 132:936, 132:941, 132:946, 132:951, 132:956)
bind the ring frame's horizontal padding to `spacing/1` and its vertical padding
to `spacing/padding/xxs`. Both are 2px.

**Code:** `outline-offset: var(--spacing-padding-xxs)`.

**Decision:** rebind horizontal padding to `spacing/padding/xxs`.

## 4. Focus ring frame — unbound item spacing, and a derived radius

- The ring frame's item spacing is a raw `10`, bound to nothing, on all six
  focused symbols. It has no visual effect (the frame holds one child), so nothing
  in code carries it. Bind it or zero it.
- The ring's outer corner is bound to `border/radius/md` (12px). Code draws the
  ring as `outline` + `outline-offset`, whose curve CSS derives from the button's
  own radius: `radius-sm` 8 + offset 2 + width 2 = 12px. It matches today but
  does not reference `radius-md`; if either token moves alone, they diverge. A
  wrapper element would bind it exactly, at the cost of an extra DOM node.

**Decision:** accept the derived radius, or ask for the wrapper.

## 5. A label colour bound to a border token — visible

`secondary/sm/destructive` (132:927, text node 132:929) binds its label to
`color/border/danger-primary` (`#b0312b`). Its md and lg siblings (132:915,
132:903) bind `color/text/danger` (`#c1362f`). **These values now differ**, so
the sm label is visibly darker than md and lg in Figma.

**Code:** `--color-text-danger` for all three sizes. The sm label will therefore
read `#c1362f` where the symbol reads `#b0312b`.

**Decision:** rebind the sm label to `color/text/danger`.

## 6. Secondary loses its border when pressed

`secondary/pressed` at every size (132:823, 132:855, 132:875) has no stroke,
while the other five secondary states carry `border/width/sm` inside the layout.
Each pressed symbol is 2px narrower (lg 131 vs 133, md 119 vs 121, sm 115 vs
117), so the button would shrink at the moment of press.

**Code:** keeps the border and makes it transparent; the brand fill paints under
it. No stroke is visible and the box holds still, so the pressed button is 2px
wider than its symbol.

**Decision:** confirm the shrink was unintentional.

## 7. `primary/sm/focused` has a border its siblings do not

The inner button of 132:956 (node 132:957) carries a `border/width/sm` stroke in
`color/border/brand-primary`; lg (132:937) and md (132:952) carry none. Invisible
(same colour as the fill), but it makes the sm symbol 2px wider: 125 where 123
follows from its siblings.

**Code:** no border on any primary button.

**Decision:** drop the stroke from 132:957.

## 8. `primary/md/destructive` is left-aligned

132:863 sets its primary-axis alignment to start; every other symbol centres.
No visual effect while the button hugs its content, but it shows as soon as a
width is set.

**Code:** centred, like every other symbol.

**Decision:** set 132:863 to centre.

## 9. Destructive has no focused variant

`state` is one axis, so there is no destructive-and-focused symbol. A keyboard
user can still focus a destructive button.

**Code:** a destructive button takes the same focus ring as every other button
on `:focus-visible`, and keeps its own fill. Removing focus indication would be
an accessibility bug.

**Decision:** confirm the ring, or design a focused destructive.

## 10. Hovered and pressed live on idle only

The idle symbols carry the prototype interactions ON_HOVER and ON_PRESS; no other
state does. Destructive therefore gives no pointer feedback, as before.

**Code:** hover and press repaint idle only. Destructive and disabled are inert
under the pointer.

## 11. Disabled primary — icon and label are different colours

`primary/disabled` binds the label to `color/text/disabled-primary` (`#f2f3f5`)
and the icon to `color/icon/white` (`#ffffff`). `secondary/disabled` binds both to
the same disabled value.

**Code:** reproduces the design exactly.

**Decision:** intended, or should the icon use a disabled token?

## 12. Token naming — carried forward

- `color/background/disabled-brand` is `#ffffff80` — it carries alpha without the
  `a` suffix `CLAUDE.md` describes.
- `typograghy/font-family/inter` and `typograghy/font-weight/medium-500` are
  misspelled (`typography`).

**Decision:** rename in Figma and re-run the sync.

## 13. Component description — "Don't use button component as tag"

The component set's description ends with that sentence. It is read here as
"do not use this button as a tag or chip". If it means "do not render an HTML
`<button>`", say so: the code renders a native `<button>`, which is what gives it
keyboard focus, disabled behaviour and its accessible role.
