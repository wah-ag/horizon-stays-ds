import { from, describe } from './lib/tokens.js';
import { page, el, note } from './lib/ui.js';

export default {
  title: 'Elevation/Shadows',
};

const EFFECTS_JSON = 'effects.styles.tokens.json';

export const Levels = () => {
  const levels = from('elevation.css', /^elevation-level/);

  return page(
    'Elevation',
    'Three composite shadows, each a pair of layers: a tight contact shadow plus a wider ambient one. They are the only shadows in the system.',
    note(
      'Every layer is tinted grey/800 rather than pure black, which keeps shadows from going muddy over coloured surfaces.',
    ),
    el(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '32px',
          padding: '16px 0 48px',
        },
      },
      levels.map((t) =>
        el(
          'div',
          {},
          el(
            'div',
            {
              style: {
                background: 'var(--color-background-surface, #fff)',
                borderRadius: 'var(--border-radius-md)',
                boxShadow: t.value,
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              },
            },
            el('span', { class: 'hz-name' }, t.name),
          ),
          el('div', { class: 'hz-meta' }, describe(EFFECTS_JSON, t.name)),
          el('div', { class: 'hz-mono', style: { marginTop: '4px', whiteSpace: 'normal' } }, t.value),
        ),
      ),
    ),
  );
};
