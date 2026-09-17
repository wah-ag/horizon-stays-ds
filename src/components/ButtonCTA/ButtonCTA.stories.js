/**
 * ButtonCTA stories.
 *
 * FIGMA NODE — QA tests against this, not against this file:
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=132-822
 *
 * The variant matrix is Figma's component set, all of it:
 * 2 types (primary, secondary) x 3 sizes (lg, md, sm) x 6 states (idle, hovered,
 * pressed, focused, disabled, destructive) = 36 rows, one story each, named
 * <Type><Size><State>.
 *
 * Hovered, pressed and focused stories pin that look open for comparison. On a
 * real page the browser raises them: hover and press on idle only (Figma's
 * ON_HOVER / ON_PRESS prototype interactions), focus through `:focus-visible`.
 * `Matrix` draws all 36; `LiveInteractions` gives one un-pinned idle button per
 * type and size to hover, press and tab to.
 */

import { ButtonCTA, TYPES, SIZES, STATES } from './ButtonCTA.js';
import { page, group, el } from '../../../stories/lib/ui.js';

export default {
  title: 'Components/ButtonCTA',
  render: (args) => ButtonCTA(args),
  parameters: {
    layout: 'centered',
    controls: { disable: false },
  },
  argTypes: {
    type: { control: 'inline-radio', options: TYPES },
    size: { control: 'inline-radio', options: SIZES },
    state: { control: 'select', options: STATES },
    'label-text': { control: 'text' },
    'show-leading-icon': { control: 'boolean' },
    'show-trailing-icon': { control: 'boolean' },
    'swap-icon': { control: 'text', description: 'Material Symbols icon name' },
    onClick: { table: { disable: true } },
  },
  args: {
    type: 'primary',
    size: 'lg',
    state: 'idle',
    'label-text': 'Component',
    'show-leading-icon': true,
    'show-trailing-icon': false,
    'swap-icon': 'add',
  },
};

const row = (type, size, state) => ({ args: { type, size, state } });

/* --------------------------------------------------------- primary · lg -- */
export const PrimaryLgIdle = row('primary', 'lg', 'idle');
export const PrimaryLgHovered = row('primary', 'lg', 'hovered');
export const PrimaryLgPressed = row('primary', 'lg', 'pressed');
export const PrimaryLgFocused = row('primary', 'lg', 'focused');
export const PrimaryLgDisabled = row('primary', 'lg', 'disabled');
export const PrimaryLgDestructive = row('primary', 'lg', 'destructive');

/* --------------------------------------------------------- primary · md -- */
export const PrimaryMdIdle = row('primary', 'md', 'idle');
export const PrimaryMdHovered = row('primary', 'md', 'hovered');
export const PrimaryMdPressed = row('primary', 'md', 'pressed');
export const PrimaryMdFocused = row('primary', 'md', 'focused');
export const PrimaryMdDisabled = row('primary', 'md', 'disabled');
export const PrimaryMdDestructive = row('primary', 'md', 'destructive');

/* --------------------------------------------------------- primary · sm -- */
export const PrimarySmIdle = row('primary', 'sm', 'idle');
export const PrimarySmHovered = row('primary', 'sm', 'hovered');
export const PrimarySmPressed = row('primary', 'sm', 'pressed');
export const PrimarySmFocused = row('primary', 'sm', 'focused');
export const PrimarySmDisabled = row('primary', 'sm', 'disabled');
export const PrimarySmDestructive = row('primary', 'sm', 'destructive');

/* ------------------------------------------------------- secondary · lg -- */
export const SecondaryLgIdle = row('secondary', 'lg', 'idle');
export const SecondaryLgHovered = row('secondary', 'lg', 'hovered');
export const SecondaryLgPressed = row('secondary', 'lg', 'pressed');
export const SecondaryLgFocused = row('secondary', 'lg', 'focused');
export const SecondaryLgDisabled = row('secondary', 'lg', 'disabled');
export const SecondaryLgDestructive = row('secondary', 'lg', 'destructive');

/* ------------------------------------------------------- secondary · md -- */
export const SecondaryMdIdle = row('secondary', 'md', 'idle');
export const SecondaryMdHovered = row('secondary', 'md', 'hovered');
export const SecondaryMdPressed = row('secondary', 'md', 'pressed');
export const SecondaryMdFocused = row('secondary', 'md', 'focused');
export const SecondaryMdDisabled = row('secondary', 'md', 'disabled');
export const SecondaryMdDestructive = row('secondary', 'md', 'destructive');

/* ------------------------------------------------------- secondary · sm -- */
export const SecondarySmIdle = row('secondary', 'sm', 'idle');
export const SecondarySmHovered = row('secondary', 'sm', 'hovered');
export const SecondarySmPressed = row('secondary', 'sm', 'pressed');
export const SecondarySmFocused = row('secondary', 'sm', 'focused');
export const SecondarySmDisabled = row('secondary', 'sm', 'disabled');
export const SecondarySmDestructive = row('secondary', 'sm', 'destructive');

/* ------------------------------------------------------------- overviews -- */

/** A type's grid: a row per state, a column per size — Figma's own layout. */
function typeGrid(type, states, extra = {}) {
  const table = el('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: `auto repeat(${SIZES.length}, auto)`,
      gap: 'var(--spacing-gap-lg)',
      alignItems: 'center',
      justifyItems: 'start',
    },
  });
  table.append(el('span'));
  SIZES.forEach((size) => table.append(el('span', { class: 'hz-meta' }, size)));
  for (const state of states) {
    table.append(el('span', { class: 'hz-meta' }, state));
    for (const size of SIZES) table.append(ButtonCTA({ type, size, state, ...extra }));
  }
  return group(type, table);
}

export const Matrix = {
  render: () =>
    page(
      'ButtonCTA — variant matrix',
      'All 36 symbols of Figma node 132:822. Hovered, pressed and focused are pinned open here for comparison; on a real page the browser raises them.',
      ...TYPES.map((type) => typeGrid(type, STATES)),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export const LiveInteractions = {
  render: () =>
    page(
      'ButtonCTA — live interactions',
      'Nothing is pinned. Hover and press the idle buttons, or Tab to them for the focus ring. Disabled cannot be focused or clicked; destructive takes focus but, like the design, has no hover or press response.',
      ...TYPES.map((type) => typeGrid(type, ['idle', 'disabled', 'destructive'])),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export const IconOptions = {
  render: () =>
    page(
      'ButtonCTA — icon properties',
      'show-leading-icon, show-trailing-icon and swap-icon, on the default primary lg idle button.',
      el(
        'div',
        { style: { display: 'grid', gap: 'var(--spacing-gap-md)', justifyItems: 'start' } },
        ButtonCTA({ 'label-text': 'Leading only (default)' }),
        ButtonCTA({ 'label-text': 'Both icons', 'show-trailing-icon': true }),
        ButtonCTA({ 'label-text': 'Trailing only', 'show-leading-icon': false, 'show-trailing-icon': true }),
        ButtonCTA({ 'label-text': 'Label only', 'show-leading-icon': false }),
        ButtonCTA({ 'label-text': 'Swapped icon', 'swap-icon': 'arrow_forward', 'show-trailing-icon': true }),
      ),
    ),
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};
