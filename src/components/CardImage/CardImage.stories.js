/**
 * CardImage stories.
 *
 * FIGMA NODE — QA tests against this, not against this file:
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=115-3938
 *
 * The variant matrix is Figma's component set, all of it:
 *
 *   state (idle, hovered) x ratio (1:1, 3:2) x overlayAction (true, false)
 *   = 8 rows, one story each, named <State><Ratio>[NoAction].
 *
 * The four symbols are 115:3936 (idle 1:1), 115:3937 (idle 3:2),
 * 115:3935 (hovered 1:1) and 115:3934 (hovered 3:2). `overlayAction` is a
 * boolean property, not a variant, so it multiplies each of them.
 *
 * `Hovered*` pins that look open for comparison. On a real page the browser
 * raises it: hover lives on the idle symbol, through `:hover`.
 * `LiveInteraction` gives one un-pinned well to hover over.
 *
 * Two things a tester should know before measuring:
 *
 * - The overlay-action slot holds an **IconButton** in Figma. That component
 *   does not exist in this repo and has no registry row, so these stories fill
 *   the slot with a labelled stand-in at the node's 40 x 40. The pill, its
 *   white fill, its stroke, the Favorite icon and the elevation the node raises
 *   it with on hover are all missing, by design — see
 *   docs/design-findings-cardimage.md, finding 1.
 * - The `3:2` symbols are drawn 363 x 272, which is not 3:2. The component uses
 *   the ratio the property names. Finding 5.
 *
 * The photograph is data, not a design asset: Figma's placeholder fill stands
 * for whatever the product supplies. The stand-in below is drawn from raw
 * values on purpose — it is story scenery, not a component value, and it must
 * not be mistaken for a token.
 */

import { CardImage, STATES, RATIOS } from './CardImage.js';
import { page, group, el } from '../../../stories/lib/ui.js';

/** The widths the symbols are drawn at on the canvas. */
const NODE_WIDTH = { '1:1': '362px', '3:2': '363px' };

/** Story scenery: a stand-in photograph, so `object-fit: cover` has something to crop. */
const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
       <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="#8fb6e8"/><stop offset="1" stop-color="#e6eef8"/>
       </linearGradient></defs>
       <rect width="600" height="400" fill="url(#s)"/>
       <circle cx="470" cy="90" r="42" fill="#fdf3d0"/>
       <path d="M0 300 L150 190 L260 300 Z" fill="#7d9b86"/>
       <path d="M190 300 L360 160 L520 300 Z" fill="#5f8070"/>
       <rect y="300" width="600" height="100" fill="#4c6a5d"/>
     </svg>`,
  );

/**
 * Story scenery: what the IconButton instance would occupy. 40 x 40 is the
 * node's `sizing/8`; the dashed outline says plainly that no button is drawn.
 */
const actionSlot = () =>
  el(
    'div',
    {
      title: 'IconButton — not built; see docs/design-findings-cardimage.md',
      style: {
        boxSizing: 'border-box',
        width: 'var(--sizing-8)',
        height: 'var(--sizing-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--border-radius-pill)',
        border: 'var(--border-width-sm) dashed var(--color-border-primary)',
        background: 'var(--color-background-base)',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--label-sm-font-size)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      },
    },
    'Icon',
  );

/** The well at the width its symbol is drawn at, so it can be measured against it. */
const atNodeWidth = (ratio, ...children) =>
  el('div', { style: { width: NODE_WIDTH[ratio] } }, ...children);

export default {
  title: 'Components/CardImage',
  render: (args) =>
    atNodeWidth(
      args.ratio,
      CardImage({ ...args, src: PHOTO, alt: 'A stand-in photograph', action: actionSlot() }),
    ),
  parameters: {
    layout: 'centered',
    controls: { disable: false },
  },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
    ratio: { control: 'inline-radio', options: RATIOS },
    overlayAction: { control: 'boolean' },
    src: { table: { disable: true } },
    alt: { table: { disable: true } },
    action: { table: { disable: true } },
  },
  args: {
    state: 'idle',
    ratio: '1:1',
    overlayAction: true,
  },
};

/* ------------------------------------------------------------ the matrix -- */

export const Idle1x1 = { args: { state: 'idle', ratio: '1:1', overlayAction: true } };
export const Idle1x1NoAction = { args: { state: 'idle', ratio: '1:1', overlayAction: false } };
export const Idle3x2 = { args: { state: 'idle', ratio: '3:2', overlayAction: true } };
export const Idle3x2NoAction = { args: { state: 'idle', ratio: '3:2', overlayAction: false } };
export const Hovered1x1 = { args: { state: 'hovered', ratio: '1:1', overlayAction: true } };
export const Hovered1x1NoAction = { args: { state: 'hovered', ratio: '1:1', overlayAction: false } };
export const Hovered3x2 = { args: { state: 'hovered', ratio: '3:2', overlayAction: true } };
export const Hovered3x2NoAction = { args: { state: 'hovered', ratio: '3:2', overlayAction: false } };

/* ------------------------------------------------------------- overviews -- */

export const Matrix = {
  render: () =>
    page(
      'CardImage — variant matrix',
      'All four symbols of the set, each with overlayAction on and off. Hovered is pinned open here; on a real page the browser raises it. The only difference between the two states is the overlay gradient — nothing moves.',
      ...RATIOS.map((ratio) =>
        group(
          `ratio = ${ratio}`,
          el(
            'div',
            {
              style: {
                display: 'grid',
                gridTemplateColumns: `auto ${NODE_WIDTH[ratio]} ${NODE_WIDTH[ratio]}`,
                gap: 'var(--spacing-gap-lg)',
                alignItems: 'start',
                width: 'max-content',
              },
            },
            el('span', { class: 'hz-meta' }, ''),
            el('span', { class: 'hz-meta' }, 'overlayAction = true'),
            el('span', { class: 'hz-meta' }, 'overlayAction = false'),
            ...STATES.flatMap((state) => [
              el('span', { class: 'hz-meta' }, state),
              CardImage({
                state,
                ratio,
                overlayAction: true,
                src: PHOTO,
                alt: '',
                action: actionSlot(),
              }),
              CardImage({ state, ratio, overlayAction: false, src: PHOTO, alt: '' }),
            ]),
          ),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export const LiveInteraction = {
  render: () =>
    page(
      'CardImage — live interaction',
      'Nothing is pinned. Hover the image and the overlay appears; move away and it goes. The set has no focused, pressed or disabled symbol, so the well takes none — see docs/design-findings-cardimage.md.',
      group(
        'idle, un-pinned',
        el(
          'div',
          { style: { display: 'flex', gap: 'var(--spacing-gap-lg)', alignItems: 'flex-start' } },
          ...RATIOS.map((ratio) =>
            el(
              'div',
              { style: { width: NODE_WIDTH[ratio] } },
              CardImage({
                ratio,
                src: PHOTO,
                alt: 'Hover me',
                action: actionSlot(),
              }),
            ),
          ),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export const Content = {
  render: () =>
    page(
      'CardImage — the media well',
      'The well fills the width it is given and takes its height from the ratio. Figma draws the symbols at a fixed 362 x 362 and 363 x 272; the component carries neither number. With no src it renders empty rather than shipping a stand-in nobody chose.',
      group(
        'three widths, height from the ratio',
        el(
          'div',
          { style: { display: 'grid', gap: 'var(--spacing-gap-lg)', justifyItems: 'start' } },
          ...['180px', 'var(--size-container-sm)', 'var(--size-container-md)'].map((width) =>
            el(
              'div',
              { style: { width } },
              CardImage({ ratio: '3:2', src: PHOTO, alt: '', action: actionSlot() }),
            ),
          ),
        ),
      ),
      group(
        'no src',
        el(
          'div',
          { style: { width: NODE_WIDTH['1:1'] } },
          CardImage({ ratio: '1:1', action: actionSlot() }),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};
