/**
 * ButtonCTA stories.
 *
 * FIGMA NODE — QA tests against this, not against this file:
 * https://www.figma.com/design/T1W7l8fmInchVupyLK7sW9/HorizonStays.Global.Component.V1.0.In-Progress?node-id=132-822
 *
 * The pickable matrix is 2 types x 3 sizes x 3 resting states = 18 rows, one
 * story each, named <Type><Size><State>.
 *
 * Hovered, pressed and focused are deliberately NOT in that matrix. The first
 * two are Figma prototype interactions ("while hovering" / "while pressing")
 * wired onto the idle button; the third is raised by `:focus-visible`. All three
 * are browser-driven, so no consumer picks them. `Matrix` draws the 18;
 * `IdleInteractions` draws the three browser-driven states beside idle.
 */

import { ButtonCTA, TYPES, SIZES, STATES, INTERACTION_STATES } from './ButtonCTA.js';

export default {
  title: 'Components/ButtonCTA',
  parameters: {
    layout: 'centered',
    controls: { disable: false },
  },
};

const row = (type, size, state) => () => ButtonCTA({ type, size, state });

/* ------------------------------------------------------- primary - small -- */
export const PrimarySmIdle = row('primary', 'sm', 'idle');
export const PrimarySmDisabled = row('primary', 'sm', 'disabled');
export const PrimarySmDestructive = row('primary', 'sm', 'destructive');

/* ------------------------------------------------------ primary - medium -- */
export const PrimaryMdIdle = row('primary', 'md', 'idle');
export const PrimaryMdDisabled = row('primary', 'md', 'disabled');
export const PrimaryMdDestructive = row('primary', 'md', 'destructive');

/* ------------------------------------------------------- primary - large -- */
export const PrimaryLgIdle = row('primary', 'lg', 'idle');
export const PrimaryLgDisabled = row('primary', 'lg', 'disabled');
export const PrimaryLgDestructive = row('primary', 'lg', 'destructive');

/* ----------------------------------------------------- secondary - small -- */
export const SecondarySmIdle = row('secondary', 'sm', 'idle');
export const SecondarySmDisabled = row('secondary', 'sm', 'disabled');
export const SecondarySmDestructive = row('secondary', 'sm', 'destructive');

/* ---------------------------------------------------- secondary - medium -- */
export const SecondaryMdIdle = row('secondary', 'md', 'idle');
export const SecondaryMdDisabled = row('secondary', 'md', 'disabled');
export const SecondaryMdDestructive = row('secondary', 'md', 'destructive');

/* ----------------------------------------------------- secondary - large -- */
export const SecondaryLgIdle = row('secondary', 'lg', 'idle');
export const SecondaryLgDisabled = row('secondary', 'lg', 'disabled');
export const SecondaryLgDestructive = row('secondary', 'lg', 'destructive');

/* ------------------------------------------------------------- layout -- */

const caption = (text) => {
  const el = document.createElement('span');
  el.textContent = text;
  el.style.font = '500 12px/1.4 system-ui, sans-serif';
  el.style.opacity = '0.6';
  return el;
};

/** One type's grid: a row per size, a column per state. */
function grid(type, states) {
  const section = document.createElement('section');

  const heading = document.createElement('h3');
  heading.textContent = type;
  heading.style.font = '600 14px/1.4 system-ui, sans-serif';
  heading.style.margin = '0 0 12px';
  section.append(heading);

  const table = document.createElement('div');
  table.style.display = 'grid';
  table.style.gridTemplateColumns = `auto repeat(${states.length}, auto)`;
  table.style.gap = '16px';
  table.style.alignItems = 'center';
  table.style.justifyItems = 'start';

  table.append(document.createElement('span'));
  states.forEach((state) => table.append(caption(state)));

  for (const size of SIZES) {
    table.append(caption(size));
    for (const state of states) {
      table.append(ButtonCTA({ type, size, state }));
    }
  }

  section.append(table);
  return section;
}

function page(states, note) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'grid';
  wrapper.style.gap = '32px';
  wrapper.style.padding = '24px';

  if (note) {
    const p = document.createElement('p');
    p.textContent = note;
    p.style.font = '400 13px/1.5 system-ui, sans-serif';
    p.style.opacity = '0.7';
    p.style.margin = '0';
    p.style.maxWidth = '60ch';
    wrapper.append(p);
  }

  TYPES.forEach((type) => wrapper.append(grid(type, states)));
  return wrapper;
}

/* ------------------------------------------------------- the 18 variants -- */

export const Matrix = () =>
  page(
    STATES,
    'The resting states a consumer picks. Hover, press and focus are not here — the browser raises those, see Idle Interactions.',
  );
Matrix.parameters = { layout: 'fullscreen' };

/* --------------------------------------------------- idle's interactions -- */

export const IdleInteractions = () =>
  page(
    ['idle', ...INTERACTION_STATES],
    'The three browser-driven states, beside the idle button they act on. Figma wires "while hovering" and "while pressing" onto idle; focus is raised by :focus-visible. The three right-hand columns are pinned open for reference and stay put under the mouse, while the idle column responds to a real pointer. Disabled and destructive have no pointer response by design.',
  );
IdleInteractions.parameters = { layout: 'fullscreen' };

/* --------------------------------------------------------- icon options -- */

export const IconOptions = () => {
  const stack = document.createElement('div');
  stack.style.display = 'grid';
  stack.style.gap = '16px';
  stack.style.justifyItems = 'start';
  stack.append(
    ButtonCTA({ labelText: 'Both icons' }),
    ButtonCTA({ labelText: 'Leading only', showTrailingIcon: false }),
    ButtonCTA({ labelText: 'Trailing only', showLeadingIcon: false }),
    ButtonCTA({ labelText: 'Label only', showLeadingIcon: false, showTrailingIcon: false }),
    ButtonCTA({ labelText: 'Swapped icon', swapIcon: 'arrow_forward' }),
  );
  return stack;
};
