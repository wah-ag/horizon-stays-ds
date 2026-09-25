/**
 * CardText — Horizon card text block.
 *
 * Figma: CardText — component 105:116
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=105-116
 *
 * The node's own description: "subcomponent of card · act as card text". So
 * this is the type stack that sits inside a card — title, location, rating row,
 * price row — and nothing else. CardContainer is the surface it goes into;
 * CardImage and CardLayout are separate components.
 *
 * 105:116 is a plain component, not a component set: there is no variant
 * property, so no type, no size and no state axis. It carries no interaction
 * state at all — no hovered, pressed, focused or disabled symbol exists — which
 * is correct for a static text atom. Nothing here invents one.
 *
 * Props are the Figma component properties, spelled exactly as Figma spells
 * them. The component has four:
 *
 *   cardTitle  string    text property   (default "Casa do Bairro")
 *   location   string    text property   (default "Alfama, Lisbon · 1.2 km from centre")
 *   review     boolean   visibility of the rating row, node 104:110 (default true)
 *   price      boolean   visibility of the price row, node 104:113  (default true)
 *
 * Four props are NOT Figma properties, because the node does not expose them.
 * The four texts inside the rating and price rows — "4.7", "(318 reviews)",
 * "121 EUR", "per night" — are hard text inside the symbol with no text
 * property in front of them, so a consumer of the Figma component cannot change
 * a rating or a price. That is finding 4 in docs/design-findings-cardtext.md.
 * Until the design exposes them, they are props here, defaulting to exactly the
 * strings the node draws, so the code renders the node by default and a real
 * listing can still pass its own numbers:
 *
 *   ratingScore  string   node 104:111
 *   ratingInfo   string   node 104:112
 *   priceAmount  string   node 104:114
 *   priceInfo    string   node 104:115
 *
 * `location` shadows the `window.location` global when destructured. It is kept
 * because `CLAUDE.md` says prop names match the Figma property names exactly;
 * nothing in this file reads the global, so the shadowing is inert. Raised as
 * finding 6 rather than renamed.
 *
 * The rating and price rows carry `spacing/gap/xs` between the value and its
 * label, as the node now binds it (finding 1, resolved).
 */

import './CardText.css';

/** Figma's text properties and their defaults, for the stories and the docs. */
export const DEFAULTS = {
  cardTitle: 'Casa do Bairro',
  location: 'Alfama, Lisbon · 1.2 km from centre',
  ratingScore: '4.7',
  ratingInfo: '(318 reviews)',
  priceAmount: '121 EUR',
  priceInfo: 'per night',
};

/** A `<p>` carrying one type role and one colour role. */
const line = (className, text) => {
  const p = document.createElement('p');
  p.className = className;
  p.textContent = text;
  return p;
};

export function CardText({
  cardTitle = DEFAULTS.cardTitle,
  location = DEFAULTS.location,
  review = true,
  price = true,
  ratingScore = DEFAULTS.ratingScore,
  ratingInfo = DEFAULTS.ratingInfo,
  priceAmount = DEFAULTS.priceAmount,
  priceInfo = DEFAULTS.priceInfo,
} = {}) {
  // 105:116 — auto layout, vertical, start-aligned, hug height.
  const root = document.createElement('div');
  root.className = 'horizon-card-text';

  // 104:106 — title and location.
  const heading = document.createElement('div');
  heading.className = 'horizon-card-text__heading';
  heading.append(
    line('horizon-card-text__title', cardTitle), // 104:107
    line('horizon-card-text__location', location), // 104:108
  );
  root.append(heading);

  // 104:109 — the rating row and the price row, stacked.
  const facts = document.createElement('div');
  facts.className = 'horizon-card-text__facts';

  if (review) {
    // 104:110
    const row = document.createElement('div');
    row.className = 'horizon-card-text__row';
    row.append(
      line('horizon-card-text__rating-score', ratingScore), // 104:111
      line('horizon-card-text__rating-info', ratingInfo), // 104:112
    );
    facts.append(row);
  }

  if (price) {
    // 104:113
    const row = document.createElement('div');
    row.className = 'horizon-card-text__row';
    row.append(
      line('horizon-card-text__price', priceAmount), // 104:114
      line('horizon-card-text__price-info', priceInfo), // 104:115
    );
    facts.append(row);
  }

  // Both rows hidden: 104:109 collapses rather than leaving the container's
  // gap hanging under the location line.
  if (review || price) root.append(facts);

  return root;
}
