/**
 * CardContainer — Horizon card shell.
 *
 * Figma: CardContainer — component set 118:286, inside frame 118:352
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=118-352
 *
 * The node's own description: "subcomponent of card · act as card container ·
 * card layout (horizontal, vertical) will be added to card container". So this
 * is the surface — fill, stroke, radius, padding, elevation — and nothing else.
 * CardLayout, CardImage and CardText are separate components and go inside it.
 *
 * Props are the Figma component properties, spelled exactly as Figma spells
 * them. The set has exactly one:
 *
 *   state    'idle' | 'hovered'                                   (variant)
 *
 * One prop is not a Figma property, because Figma has no way to express it:
 *
 *   children  a Node, a string, or an array of either — whatever fills the
 *             `cardItems` slot (118:288). In Figma that slot holds a fixed
 *             115px placeholder; here it takes the card's real content and the
 *             container hugs it, which is what "card layout will be added to
 *             card container" describes.
 *
 * An unknown `state` falls back to Figma's default, `idle`.
 *
 * `state` is 'idle' on a real page: the browser raises hover through `:hover`,
 * and only the idle symbol carries that behaviour. Passing 'hovered' pins the
 * look open so the docs can show it standing still.
 *
 * The set has no focused and no pressed symbol — see docs/design-findings-cardcontainer.md,
 * finding 6. Nothing here invents them.
 */

import './CardContainer.css';

/** Every option of Figma's `state` property, in Figma's order. */
export const STATES = ['idle', 'hovered'];

const pick = (value, options) => (options.includes(value) ? value : options[0]);

export function CardContainer({ state = 'idle', children = null } = {}) {
  const st = pick(state, STATES);

  const container = document.createElement('div');
  container.className = [
    'horizon-card-container',
    // Only idle responds to the pointer, so a pinned documentation state does
    // not repaint when the mouse crosses it.
    st === 'idle' ? 'is-interactive' : '',
    st === 'hovered' ? 'is-hovered' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Figma node 118:288, "cardItems" — the slot every card fills.
  const items = document.createElement('div');
  items.className = 'horizon-card-container__items';

  if (children != null) {
    items.append(...[children].flat().filter((child) => child != null && child !== false));
  }

  container.append(items);
  return container;
}
