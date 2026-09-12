import { from, value, px } from './lib/tokens.js';
import { page, group, el, note } from './lib/ui.js';

export default {
  title: 'Type/Scale',
};

/**
 * One collection, three modes. The same role name resolves to a different
 * measurement per platform, which is exactly why config.js runs a separate
 * Style Dictionary instance for each — loading them together would let one
 * overwrite the others.
 */
const PLATFORMS = [
  { label: 'Web', file: 'type-scale-web.css' },
  { label: 'Mobile', file: 'type-scale-mobile.css' },
  { label: 'Back office', file: 'type-scale-back-office.css' },
];

function table(head, rows) {
  const columns = `minmax(180px, 28ch) repeat(${PLATFORMS.length}, 1fr)`;
  const line = (cells, bold) =>
    el(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: columns,
          gap: '16px',
          paddingBlock: '6px',
          borderBlockEnd: '1px solid var(--color-border-secondary)',
          fontWeight: bold ? '600' : 'inherit',
        },
      },
      ...cells,
    );

  return el(
    'div',
    {},
    line([el('div', {}, head), ...PLATFORMS.map((p) => el('div', {}, p.label))], true),
    ...rows.map((cells) => line(cells)),
  );
}

/** Roles are whatever the web scale defines; the other modes are checked against it. */
function rolesFor(prefix) {
  return from('type-scale-web.css', new RegExp(`^${prefix}-`)).map((t) => t.name.slice(prefix.length + 1));
}

/**
 * A measurement of 0 is almost never intentional here — a 0px font size or
 * line height means the Figma variable was left unset for that mode. Flagging
 * it in the table is the whole reason this view compares modes side by side.
 */
function cell(file, token) {
  const v = value(file, token);
  if (v == null) return el('div', { class: 'hz-mono hz-zero' }, '— missing');
  return el('div', { class: `hz-mono${px(v) === 0 && /^0/.test(v) ? ' hz-zero' : ''}` }, v);
}

function comparison(prefix) {
  return table(
    'Role',
    rolesFor(prefix).map((role) => [
      el('div', { class: 'hz-name' }, role),
      ...PLATFORMS.map((p) => cell(p.file, `${prefix}-${role}`)),
    ]),
  );
}

export const FontSizeAndLineHeight = () =>
  page(
    'Type scale',
    'Every type role, resolved against all three platform modes at once. This view exists to catch the gaps: a highlighted cell is a 0px measurement or a role one mode is missing entirely, both of which mean an unset variable in Figma rather than a decision.',
    group('Font size', comparison('font-size')),
    group('Line height', comparison('line-height')),
  );

export const SpacingAndSizing = () =>
  page(
    'Semantic spacing & sizing',
    'These live in the type-scale collection because they are mode-dependent: back office is denser than web, and mobile needs a bigger touch target. They resolve to the core spacing and sizing steps.',
    note(
      'size-target-min is the touch target floor, not a style choice. Never compact it on a phone.',
    ),
    group('Padding', comparison('spacing-padding')),
    group('Gap', comparison('spacing-gap')),
    group('Margin', comparison('spacing-margin')),
    group('Control, row, avatar & icon', comparison('size')),
  );

export const ScaleRamp = () => {
  const sizes = from('type-scale-web.css', /^font-size-/);

  return page(
    'The web ramp, drawn',
    'Every web font size at true scale, largest first, with its paired line height.',
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
      [...sizes]
        .sort((a, b) => px(b.value) - px(a.value))
        .map((t) => {
          const role = t.name.slice('font-size-'.length);
          const lh = value('type-scale-web.css', `line-height-${role}`);
          return el(
            'div',
            { style: { display: 'flex', alignItems: 'baseline', gap: '16px', flexWrap: 'wrap' } },
            el('div', { style: { fontSize: t.value, lineHeight: lh ?? 'normal' } }, role),
            el('div', { class: 'hz-mono' }, `${t.value} / ${lh ?? 'normal'}`),
          );
        }),
    ),
  );
};
