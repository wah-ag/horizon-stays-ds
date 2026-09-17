/**
 * ButtonCTA — Horizon call-to-action button.
 *
 * Figma: ButtonCTA — component set 132:822
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=132-822
 *
 * Props are the Figma component properties, spelled exactly as Figma spells
 * them — including the kebab-case ones, which is why they are quoted keys:
 *
 *   type                 'primary' | 'secondary'                          (variant)
 *   size                 'lg' | 'md' | 'sm'                               (variant)
 *   state                'idle' | 'hovered' | 'pressed' | 'focused'
 *                        | 'disabled' | 'destructive'                     (variant)
 *   'label-text'         string, default 'Component'                      (text)
 *   'show-leading-icon'  boolean, default true                            (boolean)
 *   'show-trailing-icon' boolean, default false                           (boolean)
 *   'swap-icon'          Material Symbols name, or a DOM Node; default
 *                        the `add` glyph                                  (instance swap)
 *
 * One prop is not a Figma property, because Figma has no behaviour to carry:
 *
 *   onClick              click handler. Never fires while `state` is 'disabled',
 *                        because the native button is disabled.
 *
 * An unknown `type`, `size` or `state` falls back to that property's Figma
 * default (`primary`, `lg`, `idle`) rather than rendering an unstyled button.
 *
 * `type` collides with the native `<button type>` attribute; the DOM attribute
 * is always "button". See docs/naming-conflicts.md.
 */

import './ButtonCTA.css';

export const TYPES = ['primary', 'secondary'];
export const SIZES = ['lg', 'md', 'sm'];

/** Every option of Figma's `state` property, in Figma's order. */
export const STATES = ['idle', 'hovered', 'pressed', 'focused', 'disabled', 'destructive'];

/**
 * The three states the browser raises. Figma wires "hovered" and "pressed" onto
 * the idle symbol as prototype interactions (ON_HOVER, ON_PRESS), and focus comes
 * from `:focus-visible`. Passing one of these as `state` pins that look open so
 * the docs can show it standing still; a real app leaves `state` at 'idle'.
 */
export const INTERACTION_STATES = ['hovered', 'pressed', 'focused'];

const DEFAULT_ICON = 'add';

const pick = (value, options) => (options.includes(value) ? value : options[0]);

function buildIcon(swapIcon, position) {
  const icon = document.createElement('span');
  icon.className = `horizon-btn-cta__icon horizon-btn-cta__icon--${position}`;
  icon.setAttribute('aria-hidden', 'true');

  if (swapIcon instanceof Node) {
    icon.append(swapIcon.cloneNode(true));
  } else {
    icon.classList.add('material-symbols-outlined');
    icon.textContent = typeof swapIcon === 'string' && swapIcon ? swapIcon : DEFAULT_ICON;
  }
  return icon;
}

export function ButtonCTA({
  type = 'primary',
  size = 'lg',
  state = 'idle',
  'label-text': labelText = 'Component',
  'show-leading-icon': showLeadingIcon = true,
  'show-trailing-icon': showTrailingIcon = false,
  'swap-icon': swapIcon = null,
  onClick,
} = {}) {
  const t = pick(type, TYPES);
  const s = pick(size, SIZES);
  const st = pick(state, STATES);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = [
    'horizon-btn-cta',
    `horizon-btn-cta--${t}`,
    `horizon-btn-cta--${s}`,
    st === 'destructive' ? 'horizon-btn-cta--destructive' : '',
    // Only idle responds to the pointer: Figma's hover and press interactions
    // live on the idle symbols alone.
    st === 'idle' ? 'is-interactive' : '',
    INTERACTION_STATES.includes(st) ? `is-${st}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (st === 'disabled') button.disabled = true;

  if (showLeadingIcon) button.append(buildIcon(swapIcon, 'leading'));

  const label = document.createElement('span');
  label.className = 'horizon-btn-cta__label';
  label.textContent = labelText;
  button.append(label);

  if (showTrailingIcon) button.append(buildIcon(swapIcon, 'trailing'));

  if (typeof onClick === 'function') button.addEventListener('click', onClick);

  return button;
}
