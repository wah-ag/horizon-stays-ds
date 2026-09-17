import { from, value, describe } from './lib/tokens.js';
import { page, el, note } from './lib/ui.js';

export default {
  title: 'Elevation/Shadows',
};

const EFFECTS_JSON = 'effects.styles.tokens.json';

/**
 * The colour a shadow layer resolves to in one theme. A layer colour is either
 * a var() reference — looked up in that theme's semantic file, then core — or
 * already a literal colour.
 */
function layerColours(shadow, theme) {
  return [...shadow.matchAll(/var\(--([\w-]+)\)|(rgba?\([^)]*\)|#[0-9a-f]{3,8})/gi)].map(
    ([, ref, literal]) =>
      literal ?? value(`semantic-${theme}.css`, ref) ?? value('core.css', ref) ?? `missing: --${ref}`,
  );
}

/**
 * One theme's worth of cards. The pane sets data-theme itself, so the shadows
 * inside resolve through the same cascade a consuming app would use — this is
 * the check that a dark subtree really gets dark shadows.
 */
function pane(theme, levels) {
  return el(
    'div',
    {
      dataset: { theme },
      style: {
        background: 'var(--color-background-base)',
        color: 'var(--color-text-primary)',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid var(--color-border-secondary)',
        padding: '24px',
      },
    },
    el('div', { style: { fontWeight: '600', marginBottom: '20px' } }, `${theme} mode`),
    el(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px' } },
      levels.map((t) =>
        el(
          'div',
          {},
          el(
            'div',
            {
              style: {
                background: 'var(--color-background-surface)',
                borderRadius: 'var(--border-radius-md)',
                boxShadow: `var(--${t.name})`,
                height: '96px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              },
            },
            el('span', { class: 'hz-name' }, t.name.replace('elevation-', '')),
          ),
          el('div', { class: 'hz-mono', style: { whiteSpace: 'normal' } }, layerColours(t.value, theme).join('  +  ')),
        ),
      ),
    ),
  );
}

export const Levels = () => {
  const levels = from('elevation.css', /^elevation-level/);

  return page(
    'Elevation',
    'Three composite shadows, each a pair of layers: a tight contact shadow plus a wider ambient one. They are the only shadows in the system.',
    note(
      'Shadow colours can differ by theme, so each level is shown in both. The colours under each card are read from the build, not typed here. Each pane sets data-theme on itself, so a card in the dark pane proves a dark subtree gets dark shadows even inside a light page.',
    ),
    el('div', { class: 'hz-pair', style: { marginBottom: '32px' } }, pane('light', levels), pane('dark', levels)),
    el(
      'div',
      {},
      levels.map((t) =>
        el(
          'div',
          { style: { paddingBlock: '12px', borderBlockEnd: '1px solid var(--color-border-secondary)' } },
          el('div', { class: 'hz-name' }, t.name),
          el('div', { class: 'hz-meta', style: { marginTop: '4px' } }, describe(EFFECTS_JSON, t.name)),
          el('div', { class: 'hz-mono', style: { marginTop: '4px', whiteSpace: 'normal' } }, t.value),
        ),
      ),
    ),
  );
};
