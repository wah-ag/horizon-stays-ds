# Design findings — CardText (component 105:116)

Raised rather than filled in, per `CLAUDE.md`. Each item says what the design
does, what the code does, and what a designer needs to decide.

Figma: https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=105-116

105:116 is a plain component, **not a component set**. It has no variant
property, so there is no type, size or state axis, and no interaction state
exists — no hovered, pressed, focused or disabled symbol. That is correct for a
static text atom and is recorded here only so nobody looks for the missing
states later.

Its structure, 246 x 86:

| Node | Name | Role |
|---|---|---|
| 104:106 | Container | title over location |
| 104:107 | Title | `title/md` on `color/text/bold` |
| 104:108 | Location Info | `body/sm` on `color/text/secondary` |
| 104:109 | Container | rating row over price row |
| 104:110 | Container | the rating row |
| 104:111 | Rating Score | `title/xs` on `color/text/update` |
| 104:112 | Rating Info | `body/sm` on `color/text/secondary` |
| 104:113 | Container | the price row |
| 104:114 | Price | `title/xs` on `color/text/primary` |
| 104:115 | Price Info | `body/sm` on `color/text/secondary` |

Every colour and every type role above resolved to a token that already exists,
in every mode. Findings 1, 2 and 3 are the values that did not.

---

## 1. The two row gaps are bound to nothing — and the code shows it

Nodes **104:110** (rating) and **104:113** (price) are horizontal auto layouts
with a gap of **4px bound to no variable**.

Their own parent, 104:109, binds the *identical* 4px to `spacing/gap/xs`. So the
system already has the right token for this value, one level up, and these two
rows simply missed it.

**Code:** `.horizon-card-text__row` sets **no `gap` at all**. An unbound value is
a design gap to report, not a decision to make, and substituting
`--spacing-gap-xs` — obvious as it is — would ship a guess that looks exactly
like a decision the designer made, which is the failure `CLAUDE.md` names. So
the score renders flush against its label: `4.7(318 reviews)` and
`121 EURper night`.

**This is the one known, deliberate difference between the build and the node.**
The `Gaps` story exists to make it impossible to miss.

**Decision:** bind both gaps to `spacing/gap/xs` in Figma and re-export. Then
`.horizon-card-text__row` gets `gap: var(--spacing-gap-xs)` and this finding
closes.

---

## 2. The root gap reaches past the semantic layer into a core primitive

Node **105:116** binds its vertical gap to **`spacing/4`** — value 8.

`spacing/4` is a **core primitive** (`config/css/core.css`,
`--spacing-4: 8px`), not a semantic role. `CLAUDE.md` is explicit that
components consume semantic tokens only and that reaching for a primitive means
the semantic token that belongs in front of it was skipped. The three sibling
gaps in this very component are all bound correctly — `spacing/gap/xxs` on
104:106, `spacing/gap/xs` on 104:109 — so this one is an outlier inside its own
node.

**Code:** `gap: var(--spacing-4)` — the designer's literal binding, honoured
exactly. It is **not** swapped for the nearest semantic role, because there is
no stable nearest: 8px is `--spacing-gap-sm` on web and mobile but
`--spacing-gap-md` on back-office, so any pick would resolve to the wrong value
in one of the three modes. Honouring the binding keeps the mistake visible and
fixable; substituting would bury it.

This is the only line in `CardText.css` that touches the core layer, and it is
commented as such.

**Decision:** rebind 105:116's gap to a `spacing/gap/*` role in Figma and
re-export. Whichever role the designer picks, the code changes to that name and
the core reference goes.

---

## 3. `title/xs` line height: the node and the token disagree

The node renders **Rating Score (104:111)** and **Price (104:114)** at **auto
leading** — Figma reports `title/xs` as `lineHeight: 100` and the node draws
both text boxes 15px tall inside 16px rows.

The exported token says something else:

| Mode | `--title-xs-font-size` | `--title-xs-line-height` |
|---|---|---|
| web | 12px | **20px** |
| mobile | 12px | **20px** |
| back-office | 10px | **18px** |

**Code:** `line-height: var(--title-xs-line-height)`. The token layer is the
source of visual values, and the alternative — `line-height: normal` — is a raw
value in a component file, which is not allowed and would also make the
component the only thing in the system that disagrees with its own type token.

**Effect:** the rating and price rows measure taller in the build than on the
canvas — 20px against the node's 16px, per row.

**Decision:** either set `title/xs` in Figma to the fixed leading the token
already carries and re-apply the style to 104:111 and 104:114, or change the
token's line height to match the auto leading the node actually uses. Both are
fine; the two disagreeing is not.

---

## 4. Four visible texts have no text property

The component exposes **two** text properties, `cardTitle` and `location`. The
four strings in the rating and price rows are **hard text inside the symbol**:

| Node | Text | Property? |
|---|---|---|
| 104:111 | `4.7` | none |
| 104:112 | `(318 reviews)` | none |
| 104:114 | `121 EUR` | none |
| 104:115 | `per night` | none |

A consumer placing this component in Figma therefore cannot change a rating, a
review count, a price or a billing period — every listing would read 4.7 and
121 EUR. For a card that exists to show a specific listing, that cannot be the
intent.

**Code:** exposed as four props — `ratingScore`, `ratingInfo`, `priceAmount`,
`priceInfo` — each defaulting to the exact string the node draws, so the default
render *is* the node. They are documented in `CardText.js` as **not** Figma
properties, following the precedent `CardContainer` set with its `children`
prop.

**Decision:** add four text properties to 105:116. When they exist, their Figma
names replace the four placeholder names above, exactly as spelled.

---

## 5. The 246px width is frame geometry, not a design decision

105:116 is drawn 246px wide, bound to no variable — the width of the frame it
was laid out in. `CardContainer` had the same thing at 301px.

**Code:** `width: 100%`. A text block inside a card fills what the card gives
it; the component carries no width. The stories draw it at 246px so a tester can
put it beside the symbol.

**Decision:** none needed unless 246 was meant to be a real constraint, in which
case it needs a `size/*` token.

---

## 6. `location` shadows a browser global

The Figma property is named `location`. Destructured in a browser module, that
identifier shadows `window.location`.

**Code:** kept as `location`, because `CLAUDE.md` says prop names match the
Figma property names exactly. Nothing in `CardText.js` reads the global, so the
shadowing is inert today.

**Decision:** this is a naming suggestion, not a defect — if the team would
rather avoid the shadow, `locationInfo` matches the node's own layer name
("Location Info") and reads better beside `cardTitle`. Renaming is a design-side
change, so it is raised here rather than done.

---

## 7. `spacing/gap/xxs` collapses to zero in the back-office mode

Not a gap in this node — an observation about a token this node depends on.

The title-to-location gap (104:106) binds `spacing/gap/xxs`:

| Mode | `--spacing-gap-xxs` |
|---|---|
| web | 2px |
| mobile | 2px |
| back-office | **0px** |

So on back-office the title and the location line sit with no gap between them.
Their line boxes (20px and 16px) keep them from overlapping, but the pairing
reads as one block rather than two lines.

**Decision:** confirm 0px is intended for `gap/xxs` in the back-office scale. If
it is, nothing changes here.

---

## Not findings — checked and clean

- **Colour, every mode.** `color/text/bold`, `color/text/secondary`,
  `color/text/update` and `color/text/primary` all ship in both `on-light` and
  `on-dark`. Dark mode resolves through the cascade; nothing branches.
- **Type, every mode.** `title/md`, `body/sm` and `title/xs` all ship in
  `web`, `mobile` and `back-office`. No role is missing from a mode.
- **Letter spacing.** `body/sm`'s 0.1px comes through
  `--body-sm-letter-spacing`; it is not typed in anywhere.
- **No icon.** The rating row has no star glyph in this node, so no Material
  Symbol is imported. If a star is wanted, it belongs in the node first.
- **Storybook shows the web scale only.** `.storybook/preview.js` imports
  `config/css/index.css`. The mobile and back-office renderings of findings 3
  and 7 cannot be seen in Storybook and were read from the build output.
