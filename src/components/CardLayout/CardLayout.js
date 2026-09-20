/**
 * CardLayout — Horizon card arrangement.
 *
 * Figma: CardLayout — component set 118:110
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=118-110
 *
 * The node's own description: "subcomponent of card · act as card
 * alignment(horizontal, vertical)". So this is the arrangement and nothing
 * else — direction, gap, and which region gets the free space. CardContainer
 * is the surface it sits on; CardImage and CardText are the things it arranges.
 *
 * Props are the Figma component properties, spelled exactly as Figma spells
 * them. The set has exactly one:
 *
 *   layout   'vertical' | 'horizontal'                            (variant)
 *
 * Three props are not Figma properties, because Figma expresses them as layers
 * rather than as properties:
 *
 *   cardImage  the CardImage instance — 118:58 in vertical, 118:79 in
 *              horizontal.
 *   cardText   the CardText instance — 118:66 in vertical, 118:125 in
 *              horizontal.
 *   slot       Figma's slot node — 118:103 in vertical, 118:126 in horizontal.
 *              The two symbols name the same slot differently ("vertical slot"
 *              and "horizontal slot"), so there is no one Figma name to match;
 *              see docs/design-findings-cardlayout.md, finding 3. Passing
 *              nothing leaves the slot out entirely, which is Figma's
 *              show/hide on that layer.
 *
 * Each takes a Node, a string, or an array of either. A region given nothing
 * is not rendered at all, so an empty region contributes no gap — the same as
 * turning the layer off on the canvas.
 *
 * **CardImage and CardText are separate components and are not in the tree
 * yet.** This component does not draw either one and never will: it hands each
 * a region and lets it size itself. Once `src/components/CardImage/` and
 * `src/components/CardText/` land, a card imports them and passes the
 * instances in — it never copies their styles. See the report and
 * docs/design-findings-cardlayout.md, finding 5.
 *
 * An unknown `layout` falls back to Figma's default, `vertical`.
 *
 * The set defines no interaction states — no hovered, pressed, focused,
 * disabled or destructive symbol — and this component invents none. It draws no
 * fill, stroke or text of its own, so there is nothing of its own to restyle
 * under the pointer; the card's hover lives on CardContainer, and the favourite
 * button's on CardImage.
 */

import './CardLayout.css';

/** Every option of Figma's `layout` property, in Figma's order. */
export const LAYOUTS = ['vertical', 'horizontal'];

const pick = (value, options) => (options.includes(value) ? value : options[0]);

/** A region wrapper, or nothing at all when the region is empty. */
function region(modifier, content) {
  const children = [content].flat().filter((child) => child != null && child !== false);
  if (children.length === 0) return null;

  const node = document.createElement('div');
  node.className = `horizon-card-layout__${modifier}`;
  node.append(...children);
  return node;
}

export function CardLayout({
  layout = 'vertical',
  cardImage = null,
  cardText = null,
  slot = null,
} = {}) {
  const lo = pick(layout, LAYOUTS);

  const root = document.createElement('div');
  root.className = `horizon-card-layout horizon-card-layout--${lo}`;

  const image = region('image', cardImage);
  const text = region('text', cardText);
  const filler = region('slot', slot);

  if (lo === 'horizontal') {
    // Frame 118:124 — text and slot share a column beside the image.
    root.append(...[image].filter(Boolean));

    const body = document.createElement('div');
    body.className = 'horizon-card-layout__body';
    body.append(...[text, filler].filter(Boolean));

    // An empty body column would still eat the row's free width, so it is only
    // added when it holds something.
    if (body.childElementCount > 0) root.append(body);
  } else {
    // 118:109 — all three stack in one column.
    root.append(...[image, text, filler].filter(Boolean));
  }

  return root;
}
