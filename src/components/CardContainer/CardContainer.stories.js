/**
 * CardContainer stories.
 *
 * FIGMA NODE — QA tests against this, not against this file:
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=118-352
 *
 * The variant matrix is Figma's component set (118:286), all of it:
 * 1 property x 2 states (idle, hovered) = 2 rows, one story each, named
 * <State>. There is no type and no size axis on this component.
 *
 * `Hovered` pins that look open for comparison. On a real page the browser
 * raises it: hover lives on the idle symbol, through `:hover`.
 * `LiveInteraction` gives one un-pinned card to hover over.
 *
 * The demo content below stands in for Figma's `cardItems` placeholder
 * (118:288, 301 x 115). Those two numbers are the node's own frame geometry,
 * bound to no variable, and they belong to the story so a tester can put the
 * rendered card and the symbol side by side — the component itself carries
 * neither, and fills whatever width it is given.
 */

import { CardContainer, STATES } from './CardContainer.js';
import { page, group, el } from '../../../stories/lib/ui.js';

/** Figma's cardItems placeholder: fill width, 115px tall. */
const NODE_SLOT_HEIGHT = '115px';
/** The width the symbol is drawn at on the canvas. */
const NODE_WIDTH = '301px';

const slot = (label = 'cardItems') =>
  el(
    'div',
    {
      style: {
        // border-box, or the dashed outline below adds itself to the 115px and
        // the card measures taller than the symbol.
        boxSizing: 'border-box',
        height: NODE_SLOT_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--border-radius-xs)',
        border: 'var(--border-width-sm) dashed var(--color-border-secondary)',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--label-sm-font-size)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      },
    },
    label,
  );

/** The card at the width the symbol is drawn at, so it can be measured against it. */
const atNodeWidth = (...children) =>
  el('div', { style: { width: NODE_WIDTH } }, ...children);

export default {
  title: 'Components/CardContainer',
  render: (args) => atNodeWidth(CardContainer({ ...args, children: slot() })),
  parameters: {
    layout: 'centered',
    controls: { disable: false },
  },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
    children: { table: { disable: true } },
  },
  args: {
    state: 'idle',
  },
};

/* ------------------------------------------------------------ the matrix -- */

export const Idle = { args: { state: 'idle' } };
export const Hovered = { args: { state: 'hovered' } };

/* ------------------------------------------------------------- overviews -- */

export const Matrix = {
  render: () =>
    page(
      'CardContainer — variant matrix',
      'Both symbols of Figma node 118:286. Hovered is pinned open here for comparison; on a real page the browser raises it. The only difference is elevation/level1 — nothing moves.',
      group(
        'state',
        el(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: `auto ${NODE_WIDTH}`,
              gap: 'var(--spacing-gap-lg)',
              alignItems: 'center',
              // Keep the state label beside its card rather than at the far
              // edge of the page.
              width: 'max-content',
            },
          },
          ...STATES.flatMap((state) => [
            el('span', { class: 'hz-meta' }, state),
            CardContainer({ state, children: slot() }),
          ]),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export const LiveInteraction = {
  render: () =>
    page(
      'CardContainer — live interaction',
      'Nothing is pinned. Hover the card and the elevation appears; move away and it goes. The set has no focused or pressed symbol, so the container takes neither — see docs/design-findings-cardcontainer.md.',
      group(
        'idle, un-pinned',
        el(
          'div',
          { style: { width: NODE_WIDTH } },
          CardContainer({ children: slot('hover me') }),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export const Content = {
  render: () =>
    page(
      'CardContainer — the cardItems slot',
      'The container hugs whatever fills it and takes the width it is given. Figma draws the slot at a fixed 301 x 115; the component carries neither number.',
      group(
        'three widths, content-sized height',
        el(
          'div',
          { style: { display: 'grid', gap: 'var(--spacing-gap-lg)', justifyItems: 'start' } },
          el('div', { style: { width: NODE_WIDTH } }, CardContainer({ children: slot() })),
          el(
            'div',
            { style: { width: 'var(--size-container-sm)' } },
            CardContainer({ children: el('p', { style: { margin: '0' } }, 'A single line of content.') }),
          ),
          el(
            'div',
            { style: { width: 'var(--size-container-md)' } },
            CardContainer({
              children: [
                el('h4', { style: { margin: '0 0 var(--spacing-gap-xs)' } }, 'Several children'),
                el('p', { style: { margin: '0' } }, 'Passed as an array, stacked by the container’s own auto layout.'),
              ],
            }),
          ),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};
