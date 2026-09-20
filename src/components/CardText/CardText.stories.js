/**
 * CardText stories.
 *
 * FIGMA NODE — QA tests against this, not against this file:
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=105-116
 *
 * The variant matrix is Figma's component 105:116, all of it. 105:116 is a
 * plain component, NOT a component set: it has no variant property, so there is
 * no type axis, no size axis and no state axis, and no interaction state exists
 * to pin open. What it does have is two boolean properties, `review` (node
 * 104:110) and `price` (node 104:113), so the matrix is:
 *
 *   review x price = 4 rows, one story each, named <Review><Price>.
 *
 * Figma's default symbol is both on — that is `ReviewPrice`.
 *
 * `cardTitle` and `location` are text properties and vary content, not shape,
 * so they are controls rather than matrix rows. `ratingScore`, `ratingInfo`,
 * `priceAmount` and `priceInfo` are controls too, and they are NOT Figma
 * properties — the node hardcodes those four strings with no text property in
 * front of them (docs/design-findings-cardtext.md, finding 4). Every default
 * below is the exact string the node draws, so the default story is the node.
 *
 * Two gaps are visibly missing on purpose. The rating and price rows set a 4px
 * gap in Figma bound to no variable, so the score sits flush against its label
 * here — reported, not filled in (finding 1). `Gaps` shows exactly where.
 */

import { CardText, DEFAULTS } from './CardText.js';
import { page, group, el } from '../../../stories/lib/ui.js';

/** The width the symbol is drawn at on the canvas. The component carries none. */
const NODE_WIDTH = '246px';

/** The block at the width the symbol is drawn at, so it can be measured against it. */
const atNodeWidth = (...children) =>
  el('div', { style: { width: NODE_WIDTH } }, ...children);

export default {
  title: 'Components/CardText',
  render: (args) => atNodeWidth(CardText(args)),
  parameters: {
    layout: 'centered',
    controls: { disable: false },
  },
  argTypes: {
    cardTitle: { control: 'text' },
    location: { control: 'text' },
    review: { control: 'boolean' },
    price: { control: 'boolean' },
    ratingScore: { control: 'text' },
    ratingInfo: { control: 'text' },
    priceAmount: { control: 'text' },
    priceInfo: { control: 'text' },
  },
  args: {
    ...DEFAULTS,
    review: true,
    price: true,
  },
};

const row = (review, price) => ({ args: { review, price } });

/* ------------------------------------------------------------ the matrix -- */

/** Figma's default: both rows on. */
export const ReviewPrice = row(true, true);
export const ReviewNoPrice = row(true, false);
export const NoReviewPrice = row(false, true);
export const NoReviewNoPrice = row(false, false);

/* ------------------------------------------------------------- overviews -- */

const MATRIX = [
  ['review · price', true, true],
  ['review · no price', true, false],
  ['no review · price', false, true],
  ['no review · no price', false, false],
];

export const Matrix = {
  render: () =>
    page(
      'CardText — variant matrix',
      'Every combination of Figma node 105:116’s two boolean properties. There is no variant, size or state axis: 105:116 is a plain component, not a component set, and carries no interaction state.',
      group(
        'review x price',
        el(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: `auto ${NODE_WIDTH}`,
              gap: 'var(--spacing-gap-lg)',
              alignItems: 'start',
              width: 'max-content',
            },
          },
          ...MATRIX.flatMap(([label, review, price]) => [
            el('span', { class: 'hz-meta' }, label),
            CardText({ review, price }),
          ]),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export const Gaps = {
  render: () =>
    page(
      'CardText — the two unbound gaps',
      'The rating row (104:110) and the price row (104:113) each set a 4px horizontal gap in Figma that is bound to no variable, while their own parent (104:109) binds the identical 4px to spacing/gap/xs. An unbound value is a design gap to report, not a decision to make, so the nearest token is not substituted in: the score sits flush against its label below, and will keep doing so until the design binds those two gaps. This is the one known difference from the node. See docs/design-findings-cardtext.md, finding 1.',
      group(
        'as built — 4.7(318 reviews), 121 EUR per night with no gap',
        el('div', { style: { width: NODE_WIDTH } }, CardText()),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export const Content = {
  render: () =>
    page(
      'CardText — content',
      'The block fills the width it is given and hugs its own height. Figma draws it at a fixed 246px; the component carries no width. Long names and addresses wrap rather than widening the card.',
      group(
        'three widths',
        el(
          'div',
          { style: { display: 'grid', gap: 'var(--spacing-gap-lg)', justifyItems: 'start' } },
          el('div', { style: { width: NODE_WIDTH } }, CardText()),
          el(
            'div',
            { style: { width: 'var(--size-container-sm)' } },
            CardText({
              cardTitle: 'Quinta da Serra — Casa Grande with sea view',
              location: 'Ponta do Sol, Madeira · 18 km from Funchal centre',
              ratingScore: '4.92',
              ratingInfo: '(1,204 reviews)',
              priceAmount: '243 EUR',
              priceInfo: 'per night',
            }),
          ),
          el(
            'div',
            { style: { width: NODE_WIDTH } },
            CardText({
              cardTitle: 'A new listing with no reviews yet',
              location: 'Baixa, Porto · 0.4 km from centre',
              review: false,
            }),
          ),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};
