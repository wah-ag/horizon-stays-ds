/**
 * CardImage — Horizon card media.
 *
 * Figma: CardImage — component set inside frame 115:3938
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=115-3938
 *
 * The node's own description: "subcomponent of card · act as card media image
 * with two types of image ratio · overlay action (favourite icon)". So this is
 * the media well — the crop, the rounded clip, the hover overlay, and a corner
 * slot for the overlay action — and nothing else. CardContainer is the surface
 * it sits in; CardLayout and CardText are separate components.
 *
 * Props are the Figma component properties, spelled as Figma spells them. The
 * set has three:
 *
 *   state          'idle' | 'hovered'                            (variant)
 *   ratio          '1:1' | '3:2'                                 (variant)
 *   overlayAction  boolean, default true                         (boolean)
 *
 * Two props are not Figma properties, because Figma has no way to express them:
 *
 *   src / alt   the photograph. In the node this is a fixed placeholder fill on
 *               a layer called "Slide Image"; in a product it is data, so it is
 *               a prop. With no `src` the well renders empty rather than
 *               shipping a stand-in image nobody chose.
 *
 *   action      the node that fills the overlay-action slot. In Figma that slot
 *               holds an **IconButton instance** (114:3883 / 115:3923 /
 *               114:3874) wrapping the `Favorite` icon component (114:3782).
 *               Neither IconButton nor Favorite exists in `src/components/`, and
 *               neither has a row in the registry — see
 *               docs/design-findings-cardimage.md, finding 1. CardImage places
 *               and stacks the slot; it does not draw a button, because copying
 *               another component's styles is exactly what this system forbids.
 *
 * An unknown `state` or `ratio` falls back to Figma's default — `idle`, `1:1`.
 *
 * `state` is 'idle' on a real page: the browser raises hover through `:hover`,
 * and only the idle symbol carries that behaviour. Passing 'hovered' pins the
 * look open so the docs can show it standing still.
 *
 * The set has no focused, pressed or disabled symbol — see
 * docs/design-findings-cardimage.md, finding 7. Nothing here invents them.
 */

import './CardImage.css';

/** Every option of Figma's `state` property, in Figma's order. */
export const STATES = ['idle', 'hovered'];

/** Every option of Figma's `ratio` property, in Figma's order. */
export const RATIOS = ['1:1', '3:2'];

/** Figma's ratio values are not legal in a class name; these are. */
const RATIO_SUFFIX = { '1:1': '1x1', '3:2': '3x2' };

const pick = (value, options) => (options.includes(value) ? value : options[0]);

export function CardImage({
  state = 'idle',
  ratio = '1:1',
  overlayAction = true,
  src = null,
  alt = '',
  action = null,
} = {}) {
  const st = pick(state, STATES);
  const rt = pick(ratio, RATIOS);

  const root = document.createElement('div');
  root.className = [
    'horizon-card-image',
    `horizon-card-image--ratio-${RATIO_SUFFIX[rt]}`,
    // Only idle responds to the pointer, so a pinned documentation state does
    // not repaint when the mouse crosses it.
    st === 'idle' ? 'is-interactive' : '',
    st === 'hovered' ? 'is-hovered' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Figma layer "Slide Image" (114:3869 / 115:3922 / 114:3885 / 115:3930).
  if (src) {
    const media = document.createElement('img');
    media.className = 'horizon-card-image__media';
    media.src = src;
    media.alt = alt;
    root.append(media);
  }

  // Figma layer "overlay" (114:3907 / 115:3929). Present only on the hovered
  // symbols; kept in the DOM at every state and shown by CSS, so hover needs no
  // JavaScript. Decorative, so it is hidden from assistive technology.
  const overlay = document.createElement('div');
  overlay.className = 'horizon-card-image__overlay';
  overlay.setAttribute('aria-hidden', 'true');
  root.append(overlay);

  // Figma's `overlayAction` boolean: the IconButton pinned to the top-right
  // corner. The slot is positioned here; what goes in it is passed in.
  if (overlayAction) {
    const slot = document.createElement('div');
    slot.className = 'horizon-card-image__action';
    if (action != null) {
      slot.append(...[action].flat().filter((child) => child != null && child !== false));
    }
    root.append(slot);
  }

  return root;
}
