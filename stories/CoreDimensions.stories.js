import { from, describe, px } from './lib/tokens.js';
import { page, group, rows, measure, el, note } from './lib/ui.js';

export default {
  title: 'Core/Dimensions',
};

const CORE_JSON = 'core.value.tokens.json';

/** Sort by the trailing index so spacing-10 lands after spacing-9, not after spacing-1. */
function byIndex(a, b) {
  const n = (t) => Number(t.name.match(/(\d+)a?$/)?.[1] ?? 0);
  return n(a) - n(b);
}

function ruler(pattern, cap) {
  return rows(
    [...from('core.css', pattern)].sort(byIndex).map((t) =>
      measure({
        name: t.name,
        value: t.value,
        size: px(t.value),
        description: describe(CORE_JSON, t.name),
        cap,
      }),
    ),
  );
}

export const Spacing = () =>
  page(
    'Spacing',
    'A 4px grid with a 2px sub-grid for back office, where density matters more than air. Bars are drawn at true size up to 320px.',
    ruler(/^spacing-\d+$/, 320),
  );

export const Sizing = () =>
  page(
    'Sizing',
    'Control heights, icon sizes, avatars, thumbnails and container widths. Bars are capped at 480px, so the largest steps are shown by value rather than by length.',
    ruler(/^sizing-\d+$/, 480),
  );

export const RadiusAndBorder = () => {
  const radii = from('core.css', /^border-radius-/);
  const widths = from('core.css', /^border-width-/);

  return page(
    'Radius & border width',
    'Corner radii and stroke weights.',
    group(
      'Radius',
      el(
        'div',
        { class: 'hz-grid' },
        radii.map((t) =>
          el(
            'div',
            { title: describe(CORE_JSON, t.name) },
            el('div', {
              class: 'hz-box',
              style: { height: '64px', borderRadius: `var(--${t.name})` },
            }),
            el('div', { class: 'hz-name', style: { marginTop: '4px' } }, t.name),
            el('div', { class: 'hz-meta' }, t.value),
          ),
        ),
      ),
    ),
    group(
      'Border width',
      el(
        'div',
        { class: 'hz-grid' },
        widths.map((t) =>
          el(
            'div',
            { title: describe(CORE_JSON, t.name) },
            el('div', {
              class: 'hz-box',
              style: {
                height: '64px',
                background: 'transparent',
                borderWidth: `var(--${t.name})`,
                borderStyle: 'solid',
              },
            }),
            el('div', { class: 'hz-name', style: { marginTop: '4px' } }, t.name),
            el('div', { class: 'hz-meta' }, t.value),
          ),
        ),
      ),
    ),
    note(
      'border-radius-pill is 1000px — a sentinel for "fully rounded", not a measurement. Any value above half the shorter side gives the same result.',
    ),
  );
};

export const ElevationPrimitives = () =>
  page(
    'Elevation primitives',
    'The y-offsets and blur radii that the composite shadow tokens are assembled from. You would not reference these directly; they are here so the shadows are traceable.',
    group('Y offset', ruler(/^elevation-y\d+$/, 320)),
    group('Blur', ruler(/^elevation-blur-\d+$/, 320)),
  );
