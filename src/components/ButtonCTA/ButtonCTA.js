/**
 * ButtonCTA — Horizon call-to-action button.
 *
 * Figma: btn-CTA — node 80:359
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=80-359
 *
 * Prop names are the Figma property names verbatim, per `.CLAUDE.md`. `type`
 * collides with the native `<button type>` attribute — the DOM attribute is set
 * to "button" independently and the collision is written up in
 * `docs/naming-conflicts.md` for a human to settle.
 */

import './ButtonCTA.css';

export const TYPES = ['primary', 'secondary'];
export const SIZES = ['sm', 'md', 'lg'];

/** The resting states a consumer picks. One of these is how the button sits. */
export const STATES = ['idle', 'disabled', 'destructive'];

/**
 * Browser-driven states, not variants anyone selects. Hover and press are
 * prototype interactions wired onto the idle button in Figma; focus is raised by
 * `:focus-visible`. A real app never sets these — passing one pins it open so
 * the docs can show it standing still.
 *
 * Only idle carries `is-interactive`, which is what the `:hover` and `:active`
 * rules key off. Every other state is therefore inert under the pointer, so a
 * pinned state stays exactly as drawn when the mouse crosses it.
 */
export const INTERACTION_STATES = ['hovered', 'pressed', 'focused'];

const DEFAULT_ICON = 'add';

const FORCED_STATE_CLASS = {
  hovered: 'is-hovered',
  pressed: 'is-pressed',
  focused: 'is-focused',
};

function buildIcon(swapIcon, position) {
  if (swapIcon instanceof Node) {
    const wrapper = document.createElement('span');
    wrapper.className = `horizon-btn-cta__icon horizon-btn-cta__icon--${position}`;
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.append(swapIcon.cloneNode(true));
    return wrapper;
  }

  const glyph = document.createElement('span');
  glyph.className = `horizon-btn-cta__icon horizon-btn-cta__icon--${position} material-symbols-outlined`;
  glyph.setAttribute('aria-hidden', 'true');
  glyph.textContent = typeof swapIcon === 'string' && swapIcon ? swapIcon : DEFAULT_ICON;
  return glyph;
}

export function ButtonCTA({
  labelText = 'Component',
  type = 'primary',
  size = 'lg',
  state = 'idle',
  showLeadingIcon = true,
  showTrailingIcon = true,
  swapIcon = null,
  onClick,
} = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = [
    'horizon-btn-cta',
    `horizon-btn-cta--${type}`,
    `horizon-btn-cta--${size}`,
    state === 'destructive' ? 'horizon-btn-cta--destructive' : '',
    state === 'idle' ? 'is-interactive' : '',
    FORCED_STATE_CLASS[state] ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  if (state === 'disabled') button.disabled = true;

  if (showLeadingIcon) button.append(buildIcon(swapIcon, 'leading'));

  const label = document.createElement('span');
  label.className = 'horizon-btn-cta__label';
  label.textContent = labelText;
  button.append(label);

  if (showTrailingIcon) button.append(buildIcon(swapIcon, 'trailing'));

  if (onClick) button.addEventListener('click', onClick);

  return button;
}
