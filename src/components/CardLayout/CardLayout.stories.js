/**
 * CardLayout stories.
 *
 * FIGMA NODE — QA tests against this, not against this file:
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=118-110
 *
 * The variant matrix is Figma's component set (118:110), all of it:
 * 1 property x 2 layouts (vertical, horizontal) = 2 rows, one story each,
 * named <Layout>. There is no size axis and no state axis on this component —
 * the set defines no hovered, pressed, focused, disabled or destructive symbol,
 * and nothing here invents one.
 *
 * **The regions are stand-ins, not the real children.** CardImage (115:3938)
 * and CardText (105:116) are separate components and are not in the tree yet,
 * so every story fills the regions with a labelled dashed box carrying the
 * geometry the node draws that region at. Those numbers live here so a tester
 * can put a story and the symbol side by side; CardLayout itself carries none
 * of them and never will. When the two components land, a card imports them and
 * passes the instances in — see docs/design-findings-cardlayout.md, finding 5.
 */

import { CardLayout, LAYOUTS } from './CardLayout.js';
import { CardContainer } from '../CardContainer/CardContainer.js';
import { page, group, note, el } from '../../../stories/lib/ui.js';

/* The geometry the two symbols are drawn at on the canvas. Every one of these
 * numbers belongs to a child component or to the frame CardLayout was laid out
 * in — none is a CardLayout value, and none appears in CardLayout.css. */
const NODE = {
  vertical: { width: '363px', image: '184px', text: '86px', slot: '67px' },
  horizontal: { width: '399px', image: '135px', text: '88px', slot: '39px' },
};

/** A labelled dashed box standing in for a child component or slot content. */
const stand = (label, style = {}) =>
  el(
    'div',
    {
      style: {
        // border-box, or the dashed outline adds itself to the height above
        // and the region measures taller than the symbol.
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 'var(--border-radius-xs)',
        border: 'var(--border-width-sm) dashed var(--color-border-secondary)',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--label-sm-font-size)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        ...style,
      },
    },
    label,
  );

/** The three regions of one symbol, at that symbol's drawn geometry. */
const regions = (layout) => {
  const n = NODE[layout];
  return {
    layout,
    cardImage: stand(
      'CardImage',
      layout === 'horizontal'
        ? { width: n.image, height: n.image }
        : { height: n.image },
    ),
    // `height: 100%` so the stand-in shows the whole region it was given. In
    // horizontal that region is stretched to the image's height; in vertical it
    // has no height of its own and the min-height decides.
    cardText: stand('CardText', { minHeight: n.text, width: '100%', height: '100%' }),
    slot: stand(`${layout} slot`, { height: n.slot, width: '100%' }),
  };
};

/** The layout at the width its symbol is drawn at, so it can be measured. */
const atNodeWidth = (layout, ...children) =>
  el('div', { style: { width: NODE[layout].width } }, ...children);

export default {
  title: 'Components/CardLayout',
  render: (args) => atNodeWidth(args.layout, CardLayout({ ...args, ...regions(args.layout) })),
  parameters: {
    layout: 'centered',
    controls: { disable: false },
  },
  argTypes: {
    layout: { control: 'inline-radio', options: LAYOUTS },
    cardImage: { table: { disable: true } },
    cardText: { table: { disable: true } },
    slot: { table: { disable: true } },
  },
  args: {
    layout: 'vertical',
  },
};

/* ------------------------------------------------------------ the matrix -- */

export const Vertical = { args: { layout: 'vertical' } };
export const Horizontal = { args: { layout: 'horizontal' } };

/* ------------------------------------------------------------- overviews -- */

export const Matrix = {
  render: () =>
    page(
      'CardLayout — variant matrix',
      'Both symbols of Figma node 118:110. The only difference is direction and gap: vertical stacks the three regions with spacing/gap/sm, horizontal puts the image beside a body column with spacing/gap/md and spacing/gap/sm inside it. The dashed boxes stand in for CardImage and CardText, which are separate components.',
      group(
        'layout',
        el(
          'div',
          {
            style: {
              display: 'flex',
              gap: 'var(--spacing-gap-xl)',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            },
          },
          ...LAYOUTS.map((layout) =>
            el(
              'div',
              { style: { display: 'grid', gap: 'var(--spacing-gap-sm)' } },
              el('span', { class: 'hz-meta' }, layout),
              atNodeWidth(layout, CardLayout(regions(layout))),
            ),
          ),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export const EmptyRegions = {
  render: () =>
    page(
      'CardLayout — a region given nothing',
      'Figma shows and hides the slot layer on each symbol. Here a region passed nothing is not rendered at all, so it contributes no gap either — an omitted slot leaves image and text exactly one gap apart, not two.',
      note(
        'The set has no interaction states, so there is nothing to click through on this page. The card’s hover belongs to CardContainer and the favourite button’s to CardImage.',
      ),
      group(
        'vertical, slot omitted',
        atNodeWidth('vertical', CardLayout({ ...regions('vertical'), slot: null })),
      ),
      group(
        'horizontal, slot omitted',
        atNodeWidth('horizontal', CardLayout({ ...regions('horizontal'), slot: null })),
      ),
      group(
        'vertical, image omitted',
        atNodeWidth('vertical', CardLayout({ ...regions('vertical'), cardImage: null })),
      ),
      group(
        'horizontal, text and slot omitted',
        atNodeWidth(
          'horizontal',
          CardLayout({ ...regions('horizontal'), cardText: null, slot: null }),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export const Widths = {
  render: () =>
    page(
      'CardLayout — the width it is given',
      'Neither symbol’s drawn width is a design decision: vertical binds no width at all and horizontal binds a raw 399, the width of the frame it was laid out in. The component fills its container instead. In horizontal the image keeps its size and the body column takes the rest — see docs/design-findings-cardlayout.md, finding 2.',
      group(
        'horizontal at three widths',
        el(
          'div',
          { style: { display: 'grid', gap: 'var(--spacing-gap-lg)', justifyItems: 'start' } },
          ...[NODE.horizontal.width, 'var(--size-container-sm)', 'var(--size-container-md)'].map((width) =>
            el('div', { style: { width } }, CardLayout(regions('horizontal'))),
          ),
        ),
      ),
      group(
        'vertical at two widths',
        el(
          'div',
          {
            style: {
              display: 'flex',
              gap: 'var(--spacing-gap-lg)',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            },
          },
          el('div', { style: { width: NODE.vertical.width } }, CardLayout(regions('vertical'))),
          el(
            'div',
            { style: { width: 'var(--size-container-sm)' } },
            CardLayout(regions('vertical')),
          ),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export const InCardContainer = {
  render: () =>
    page(
      'CardLayout — inside CardContainer',
      'CardContainer’s own node says "card layout (horizontal, vertical) will be added to card container". The container is imported, never restyled: it brings its own fill, stroke, radius, padding and hover, and CardLayout brings the arrangement inside it.',
      group(
        'both layouts, in the container',
        el(
          'div',
          {
            style: {
              display: 'flex',
              gap: 'var(--spacing-gap-xl)',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            },
          },
          ...LAYOUTS.map((layout) =>
            el(
              'div',
              { style: { width: NODE[layout].width } },
              CardContainer({ children: CardLayout(regions(layout)) }),
            ),
          ),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};
