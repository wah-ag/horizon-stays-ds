# Design findings: IconButton (component set 114:3800)

These are reported here, not filled in, per `CLAUDE.md`. Each item says what the design
does, what the code does, and what a designer needs to decide.

Figma: https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=114-3800

All values below were read live through the Figma Plugin API, read only, on 2026-09-26.

| Property | Values | Symbols |
|---|---|---|
| `state` | `idle`, `hovered` | 114:3799, 114:3798 |

That is the whole property surface. The set has no size, boolean, text or
instance-swap property. Each symbol holds one instance of the `favorite` icon
component (`114:3788` in idle, `114:3795` in hovered) of `114:3782`,
`type=outline`, in the `favorite` set `114:3781`.

What each symbol binds:

| Property | Bound to | Value | Code |
|---|---|---|---|
| width, height | `sizing/8` | 40 | `--sizing-8` (finding 4) |
| corner radius | `border/radius/pill` | 1000 | `--border-radius-pill` |
| fill | `color/background/base` | `#ffffff` | `--color-background-base` |
| stroke colour | `color/border/secondary` | `#e5e7ea` | not drawn (finding 6) |
| stroke weight | nothing | raw `1` | not drawn (finding 6) |
| padding | nothing | raw `10` all sides | none (finding 5) |
| icon fill | `color/icon/secondary` | `#626e7a` | `--color-icon-secondary` |
| icon size | nothing | raw 24 x 24 | Material Symbols default (finding 7) |
| effect, hovered only | `elevation/level1` style | two stacked shadows | `--elevation-level1` |
| prototype | idle: ON_HOVER to hovered | | `:hover` on idle only |

Findings 1 to 3 cover structure and behaviour. Finding 6 is the one visible
difference from the node that ships. Finding 9 is a small shadow-alpha mismatch
in the token layer.

---

## 1. `favorite` is a Material Symbols glyph, not its own component

**Decision taken in code:** the icon is the Material Symbols Outlined `favorite`
glyph, rendered inside IconButton. It is not a separate `Favorite` component.

Reasoning:

- `CLAUDE.md` says icons are Material Symbols, loaded from Google Fonts. The
  `favorite` set is a drawing of that glyph: a 24 x 24 "Bounding box" rectangle
  plus one vector named `favorite`, 20 x 18.35, which is the Material Symbols
  heart at optical size 24. A component that wraps one font glyph copies the
  icon font into the component library, one icon at a time.
- The icon has no geometry, layout or behaviour of its own that IconButton does
  not already own. Its only design-side properties are a colour and a
  fill/outline switch (finding 2), and both are properties of a glyph.
- The subcomponent rule in `CLAUDE.md` covers composed UI, such as the
  organism-level pieces of Card. It does not cover single icons. ButtonCTA
  treats its icon as a glyph (`swap-icon`) in the same way, so this keeps the two
  buttons consistent.

**What this leaves open:** if the team wants a reusable `Icon` atom (one
component that renders any Material Symbol at a size token, with a
fill/outline switch), that is the right home for finding 2, and both ButtonCTA
and IconButton would import it. It would be one generic `Icon`, not one
component per glyph. **`Favorite` has no registry row, and none was created.**
If a human decides on an `Icon` atom, it needs a row, a Figma node that
represents the general case, and its own build.

## 2. The icon component toggles outline to fill on click, and IconButton does not expose it

The `favorite` set (114:3781) has a variant property `type` with `outline` and
`fill`:

| Variant | Node | Vector fill |
|---|---|---|
| `type=outline` | 114:3782 | `color/icon/secondary` |
| `type=fill` | 114:3783 | `color/icon/danger` (`#c1362f`) |

`type=outline` carries a prototype interaction, **ON_CLICK to `type=fill`**,
and the instance inside IconButton keeps it. So the prototype shows a
favourite toggle: grey outline heart, click, red filled heart.

IconButton's own component set does not model this. It has no `selected`,
`pressed` or `type` property, and no symbol shows the filled heart. The toggle
exists only as a nested prototype link, with no reverse link (fill never goes
back to outline).

**Code:** not built. The only prop that matches a Figma property is `state`.
Adding a toggle would mean inventing a property name, an ARIA pattern
(`aria-pressed`) and a way back to outline that the design does not show.
Drawing the filled glyph would also need the Material Symbols `FILL` axis. The
only exemption for raw font-axis values in `docs/exemptions.md` belongs to
ButtonCTA, and it is not this agent's to extend.

**Decision:** say whether IconButton is a toggle. If it is, add a variant or
boolean to 114:3800 (for example `selected: true/false`, or pass `type`
through), draw the selected symbol with the filled heart in
`color/icon/danger`, and say whether a second click un-favourites. Then this
becomes a prop and an `aria-pressed` state.

## 3. There is no focused, pressed or disabled design

The set responds to the pointer and to nothing else. A button that can be
hovered but shows no focus indication is an accessibility gap in the design.
Hover also does not exist on touch devices, so on mobile the button has no
feedback at all.

**Code:** the element is a native `<button type="button">`, so it can take focus,
Enter and Space activate it, and it fires `click`. Focus shows the **browser's
default** focus indicator, which is left unstyled. Nothing is invented for
pressed or disabled, and there is no `disabled` prop.

**Decision:** design a focused symbol (ButtonCTA's focus ring, `border/width/md`
in `color/border/brand-secondary` offset by `spacing/padding/xxs`, is the
existing pattern), a pressed symbol, and a disabled symbol if the product ever
disables this control.

## 4. Size is bound to a core primitive, `sizing/8`

Both symbols bind width and height to `sizing/8` (40). That is a core primitive
from `config/css/core.css`. `CLAUDE.md` says components use semantic tokens only.
No semantic size token has a fixed 40 on every platform:

| Semantic token | web | mobile | back-office |
|---|---|---|---|
| `size/control/md` | 40 | 44 | 32 |
| `size/control/lg` | 48 | 56 | 40 |
| `size/target-min` | varies (32/44) | | |

**Code:** `--sizing-8`, which is the binding on the node. Substituting
`--size-control-md` would change the button to 44 on mobile and 32 on
back-office, and that is a design decision, not a translation. This follows the
precedent of CardImage finding 2, where the node binds primitives and the code
uses exactly what is bound.

**Decision:** rebind to a semantic size and accept its per-platform values.
`size/control/md` gives 40 on web and 44 on mobile, and 44 meets the touch-target
minimum. If the button must stay 40 on every platform, add a semantic token for
it instead.

## 5. Padding is a raw `10` and cannot take effect

Both symbols set `10` padding on all four sides, bound to no variable. In a
fixed 40 x 40 frame with an inside stroke, 10 + 10 leaves 20 of content room
(18 inside the stroke), which is less than the 24px icon. Figma overflows the
padding and centres the icon at x = y = 8, so the padding is never applied.

**Code:** `padding: 0`, with centre/centre alignment. That reproduces the
node's 8px icon offset without the raw number. Nothing is substituted.

**Decision:** remove the padding, or bind it to `spacing/padding/sm` (8) if the
intent is "icon inset by 8". Either way, the value on the node should match what
renders.

## 6. The stroke weight is unbound, so no stroke is drawn

The stroke **colour** is bound to `color/border/secondary`. The stroke
**weight** is a raw `1` (`strokeAlign: INSIDE`) on both symbols, bound to no
variable. The same holds on the three CardImage instances (114:3883, 115:3923,
114:3874): each binds its stroke colour but not its stroke weight.

This contradicts CardImage finding 1, which lists the stroke as
`border/width/sm` + `color/border/secondary`. Read live, neither the
component set nor its instances bind `border/width/sm`. That table should be
corrected.

**Code:** `border: 0`. An unbound value is a design gap. Filling it with
`--border-width-sm`, even though it matches, would ship a guess that looks like
a decision. This is the rule CardText finding 1 and ButtonCTA finding 6a
followed.

**Consequence for QA:** this is **the one visible difference from the node**.
The deployed button has no 1px `#e5e7ea` ring. On a white page the white button
reads as a floating icon in idle and a white disc with a shadow on hover.

**Decision:** bind the stroke weight on 114:3799 and 114:3798 to
`border/width/sm`. The code then adds one `border` declaration.

## 7. The icon size is unbound

The `favorite` instance is 24 x 24, bound to no variable, in both symbols and in
the icon component itself.

**Code:** no size is set. The glyph renders at the Material Symbols stylesheet's
own default, `font-size: 24px`, which matches the node. It uses the variable
font's default axes, which give the outline style. No raw value appears in the
component. `--size-icon-lg` is 24 on web but 32 on mobile and 20 on back-office,
so using it would be a guess about platform behaviour.

**Decision:** bind the icon size to a `size/icon/*` token and say whether it
should follow the platform scale.

## 8. For CardImage: what consuming IconButton would take

This task does not modify CardImage. This is for whoever builds that change.

- **Import, not copy.** `CardImage` already takes the button as its `action`
  prop and positions it. A consumer passes `action: IconButton({ ... })`. Inside
  CardImage's own stories, the dashed 40 x 40 `actionSlot()` stand-in should be
  replaced with `IconButton()`, and `IconButton` recorded in CardImage's
  `Composes` in the registry.
- **Card hover lifts the button.** CardImage's hovered 1:1 symbol holds an
  IconButton at `state=hovered` (114:3883), and its idle symbols hold
  `state=idle` (114:3874, 115:3923). So when the image is hovered, the button
  should show `elevation/level1` too, even if the pointer is not on the button.
  IconButton lifts only on its own `:hover`. CardImage should create the
  button with `state: 'hovered'` when it is pinned hovered. For live hover it
  needs a rule, owned by CardImage, that raises the button while the well is
  hovered. That rule should apply IconButton's own hovered class or state, not
  copy the shadow. The cleanest option is a documented IconButton hook, such as
  honouring an ancestor `:hover`. A human should decide which one before
  CardImage is repaired.
- **CardImage finding 1 needs correcting** on the stroke weight (finding 6
  above).
- The favourite toggle (finding 2) will show up as a CardImage question too:
  the card is where a "saved" listing would render.

## 9. `elevation/level1` in Figma and in the export swap their two alphas

This is a token-layer issue, not an IconButton issue. It shows up here because
IconButton is the first component to use `elevation/level1` on hover.

| Shadow | Figma style, read live on 114:3798 | Export (`tokens/effects.styles.tokens.json`) |
|---|---|---|
| tight, `0 1 2` | `elevation/color-8A`, 0.08 | `shadow-depth-1`, 0.06 |
| wide, `0 2 8` | `elevation/color-6A`, 0.06 | `shadow-depth-2`, 0.08 |

The token's own `$description` agrees with the export: "0 1 2 … 0.06 + 0 2 8 …
0.08". The live Figma style disagrees. The difference is small, 0.02 of alpha
on each layer, but QA measuring the hovered shadow against the node will see the
swap.

**Code:** `--elevation-level1` as built. Nothing is hand-assembled.

**Decision:** decide which is intended, fix it in Figma (the style bindings or
the description), and re-export. Do not patch `tokens/`.

## 10. Naming

`state` is the only Figma property, and the prop uses the same name. It does not
collide with anything in HTML. The two non-Figma props, `label` (rendered as
`aria-label`) and `onClick`, follow ButtonCTA's precedent for behaviour that
Figma cannot express. Nothing is added to `docs/naming-conflicts.md`.
