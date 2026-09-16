# Naming conflicts

Filed per `CLAUDE.md` — "Prop names match the Figma property names exactly. If
we need a new property name suggestion due to naming conflict with other tools
and dependencies, report all the naming suggestion under `docs/`."

A human decides these. Nothing here has been renamed unilaterally.

---

## `type` — ButtonCTA (Figma `btn-CTA`, node 80:359)

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

## `btn-CTA` — component name

Not a conflict, recorded for the trail. `btn-CTA` is not a legal PascalCase
identifier, so the coded component is `ButtonCTA`, chosen over `Button` to leave
the generic name free for a future base button. Folder `src/components/ButtonCTA/`.
