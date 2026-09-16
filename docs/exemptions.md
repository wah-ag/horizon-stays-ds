# Rule exemptions

`CLAUDE.md` forbids raw hex, px, or font values inside a component file. Where
an exemption has been granted, it is recorded here with its reasoning, so a
reviewer does not have to re-litigate it and a future token can retire it.

---

## Material Symbols font axes — `ButtonCTA.css`

**Rule:** no raw font values inside a component file.

**What is there:** `font-variation-settings: 'opsz' N, 'wght' 400, 'FILL' 0,
'GRAD' 0` on the icon span, once per size —
[ButtonCTA.css](../src/components/ButtonCTA/ButtonCTA.css).

**Why it is exempt:** these are variable-font axis settings for the Material
Symbols face, not design decisions. `wght` here selects a glyph outline from the
icon font; it is not the text weight the type scale owns, which the label takes
from `--title-sm-font-weight` as normal. No icon-axis token exists in the build,
so there is nothing to reference — this is a gap in the token layer rather than
a shortcut taken in the component.

**Granted:** 2026-09-12, by the repo owner, after QA raised it. No preference was
expressed between adding tokens and writing the exemption, so the lower-churn
option was taken.

**What would retire it:** icon axes becoming real tokens in Figma
(`icon/axis/weight`, `icon/axis/optical-size`, and so on). If that happens,
rebind and delete this entry.

**One detail worth keeping:** `opsz` tracks the icon size, but the Material
Symbols axis floor is 20, so the 16px `sm` icon correctly asks for `opsz 20`
rather than 16. That is not an oversight.
