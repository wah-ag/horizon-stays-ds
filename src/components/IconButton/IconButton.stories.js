/**
 * IconButton stories.
 *
 * FIGMA NODE — QA tests against this, not against this file:
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=114-3800
 *
 * The variant matrix is Figma's component set, all of it:
 *
 *   state (idle, hovered) = 2 rows, one story each: `Idle`, `Hovered`.
 *
 * The symbols are 114:3799 (idle) and 114:3798 (hovered). The set has no size
 * property and no other variant, boolean, text or instance-swap property.
 *
 * `Hovered` pins that look open for comparison. On a real page the browser
 * raises it: Figma wires ON_HOVER onto the idle symbol, and the code follows
 * through `:hover`. `LiveInteraction` gives one un-pinned button to hover,
 * click and tab to.
 *
 * Known, deliberate differences from the node — each is a design gap, raised in
 * docs/design-findings-iconbutton.md rather than filled in:
 *
 * - No stroke. The stroke colour is bound; the stroke weight is a raw 1 bound
 *   to no variable (finding 6).
 * - The 24px icon size and the 10px padding are unbound. The icon renders at
 *   the Material Symbols default of 24, and no padding is applied because it
 *   cannot take effect in a 40px box (findings 5 and 7).
 * - The outline-to-fill toggle on the nested `favorite` icon component is not
 *   built: IconButton exposes no property for it (finding 2).
 * - No focused, pressed or disabled look: none is designed (finding 3).
 */

import { IconButton, STATES } from './IconButton.js';
import { page, group, el } from '../../../stories/lib/ui.js';

export default {
  title: 'Components/IconButton',
  render: (args) => IconButton(args),
  parameters: {
    layout: 'centered',
    controls: { disable: false },
  },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
    label: { control: 'text', description: 'Accessible name (aria-label). Not a Figma property.' },
    onClick: { table: { disable: true } },
  },
  args: {
    state: 'idle',
    label: 'Favorite',
  },
};

/* ------------------------------------------------------------ the matrix -- */

export const Idle = { args: { state: 'idle' } };
export const Hovered = { args: { state: 'hovered' } };

/* ------------------------------------------------------------- overviews -- */

export const Matrix = {
  render: () =>
    page(
      'IconButton — variant matrix',
      'Both symbols of the set. Hovered is pinned open here; on a real page the browser raises it. The only difference between the two is the elevation/level1 shadow — nothing moves and nothing recolours.',
      group(
        'state',
        el(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(2, max-content)',
              gap: 'var(--spacing-gap-lg)',
              alignItems: 'center',
              justifyItems: 'center',
            },
          },
          ...STATES.map((state) => el('span', { class: 'hz-meta' }, state)),
          ...STATES.map((state) => IconButton({ state })),
        ),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export const LiveInteraction = {
  render: () => {
    const log = el('span', { class: 'hz-meta' }, 'Clicks: 0');
    let clicks = 0;
    const button = IconButton({
      onClick: () => {
        clicks += 1;
        log.textContent = `Clicks: ${clicks}`;
      },
    });
    return page(
      'IconButton — live interaction',
      'Nothing is pinned. Hover the button and it lifts onto elevation/level1; move away and it settles. Click it and the counter moves. Tab to it and the browser draws its own focus indicator — the set has no focused, pressed or disabled symbol, so none is styled. See docs/design-findings-iconbutton.md.',
      group(
        'idle, un-pinned',
        el(
          'div',
          { style: { display: 'flex', gap: 'var(--spacing-gap-lg)', alignItems: 'center' } },
          button,
          log,
        ),
      ),
    );
  },
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};
