# Naming conflicts

Filed per `CLAUDE.md` — "Prop names match the Figma property names exactly. If
we need a new property name suggestion due to naming conflict with other tools
and dependencies, report all the naming suggestion under `docs/`."

A human decides these. Nothing here has been renamed unilaterally.

---

## `type` — ButtonCTA (Figma component set 132:822; first raised on 80:359)

**The collision.** Figma's variant property is `type`, with values `primary` and
`secondary`. `type` is also a native attribute of `<button>`, where it means
`button | submit | reset`. Two different meanings, one word, on the same element.

**What was built.** `type` is kept verbatim as the component property, and the
DOM attribute is set separately and unconditionally to `type="button"`. They
never touch, because the component takes an options object and nothing is spread
onto the element. So the collision is currently latent, not active.

**Why it still matters.** It is a trap for the next person:

- A consumer who wants a real submit button has no way to ask for one, and the
  obvious guess (`ButtonCTA({ type: 'submit' })`) silently produces a primary
  button that does not submit.
- If anyone ever adds prop spreading, or ports this to React — where `type` on a
  `<button>` *is* the DOM attribute — the collision becomes real and silent.
- Every other design system in this class renames it for exactly this reason.

**Suggestions, in the order I would pick them.**

| Option | Component API | Cost |
|---|---|---|
| 1. Rename to `variant` | `variant: 'primary' \| 'secondary'` | Breaks the "match Figma exactly" rule; needs the Figma property renamed to match, or a documented mapping. Conventional and unambiguous. |
| 2. Rename to `emphasis` | `emphasis: 'primary' \| 'secondary'` | Same cost as above. Describes what the axis actually varies, and stays free if a `variant` axis is ever needed for something else. |
| 3. Keep `type`, add `htmlType` | `type` + `htmlType: 'button' \| 'submit'` | Keeps Figma parity. Adds a second confusing name, and `htmlType` is itself a workaround other systems have regretted. |
| 4. Keep `type` as built | `type` only, DOM always `button` | Zero change. Leaves the trap in place and no route to a submit button. |

**Recommendation:** option 1, `variant`, with the Figma property renamed to match
so the two stay in sync — the design system's own rule is that the names agree,
and `type` is the name that cannot survive contact with HTML.

**Blocked on:** a designer renaming the Figma property, or an explicit decision
to let code and design diverge here.

---

## Kebab-case property names — ButtonCTA (component set 132:822)

**What changed.** The redesigned component set names its non-variant properties
`label-text`, `show-leading-icon`, `show-trailing-icon` and `swap-icon`. The
previous node used `labelText`, `showLeadingIcon`, `showTrailingIcon` and
`swapIcon`.

**What was built.** The props match Figma exactly, so they are quoted keys:
`ButtonCTA({ 'label-text': 'Save', 'show-trailing-icon': true })`. This breaks
anything calling the old camelCase names; nothing in the repo did besides the
component's own stories, which were rewritten.

**Why it matters.** Kebab-case is a legal JavaScript object key, but it cannot be
destructured without renaming, cannot be written as a bare identifier, and does
not carry over to React, where component props are camelCase by convention.

**Suggestions.**

| Option | Component API | Cost |
|---|---|---|
| 1. Keep kebab-case, as built | `'label-text'` etc. | Exact Figma parity. Quoted keys in every call. |
| 2. Rename in Figma to camelCase | `labelText` etc. | One Figma edit; code follows. Back to the previous API. |
| 3. Accept both in code | kebab-case and camelCase aliases | Two spellings of one API — an undocumented-behaviour risk. |

**Recommendation:** option 2, so design and code share names that work in code.

**Blocked on:** a designer choosing the spelling.

---

## `btn-CTA` — component name — RESOLVED

The Figma component set is now named `ButtonCTA`, matching the coded component
and its folder `src/components/ButtonCTA/`.
