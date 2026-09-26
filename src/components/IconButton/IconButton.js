/**
 * IconButton — Horizon icon-only button.
 *
 * Figma: IconButton — component set 114:3800
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=114-3800
 *
 * Props are the Figma component properties, spelled as Figma spells them. The
 * set has exactly one:
 *
 *   state   'idle' | 'hovered'                                   (variant)
 *
 * Two props are not Figma properties, because Figma has no way to express them:
 *
 *   label    the accessible name, default 'Favorite'. An icon-only button has
 *            no visible text, so without this a screen reader announces
 *            "button" and nothing else. Figma names the icon layer "favorite";
 *            the default is that name.
 *   onClick  click handler.
 *
 * The icon is fixed. Both symbols hold the same instance of the `favorite`
 * icon component (114:3782, `type=outline`), and the set exposes no
 * instance-swap property, so there is nothing to pass. It is drawn as the
 * Material Symbols `favorite` glyph, per `CLAUDE.md` — see
 * docs/design-findings-iconbutton.md, finding 1, for why it is a glyph and not
 * its own component, and finding 2 for the outline-to-fill toggle the icon
 * component carries and this set does not expose.
 *
 * An unknown `state` falls back to Figma's default, `idle`.
 *
 * `state` is 'idle' on a real page: Figma wires ON_HOVER onto the idle symbol,
 * so the browser raises hover through `:hover`. Passing 'hovered' pins the look
 * open so the docs can show it standing still.
 *
 * The set has no focused, pressed or disabled symbol. None is invented here —
 * finding 3. The element is a native `<button>`, so it is focusable and
 * keyboard-operable, and focus shows the browser's own indicator.
 */

import './IconButton.css';

/** Every option of Figma's `state` property, idle first (Figma's default). */
export const STATES = ['idle', 'hovered'];

/** The Material Symbols glyph the `favorite` icon component draws. */
const GLYPH = 'favorite';

const pick = (value, options) => (options.includes(value) ? value : options[0]);

export function IconButton({ state = 'idle', label = 'Favorite', onClick } = {}) {
  const st = pick(state, STATES);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = [
    'horizon-icon-button',
    // Only idle responds to the pointer: Figma's ON_HOVER interaction lives on
    // the idle symbol alone, so a pinned `hovered` does not repaint.
    st === 'idle' ? 'is-interactive' : '',
    st === 'hovered' ? 'is-hovered' : '',
  ]
    .filter(Boolean)
    .join(' ');
  button.setAttribute('aria-label', label);

  // Figma layer "favorite" (114:3788 / 114:3795), instance of 114:3782.
  const icon = document.createElement('span');
  icon.className = 'horizon-icon-button__icon material-symbols-outlined';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = GLYPH;
  button.append(icon);

  if (typeof onClick === 'function') button.addEventListener('click', onClick);

  return button;
}
