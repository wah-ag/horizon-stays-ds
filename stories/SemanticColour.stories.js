import { from, aliasOf, value, groupBy } from './lib/tokens.js';
import { page, group, rows, el, note } from './lib/ui.js';

export default {
  title: 'Semantic/Colour',
};

const LIGHT_JSON = 'semantics-color.on-light.tokens.json';
const DARK_JSON = 'semantics-color.on-dark.tokens.json';

/** `color-text-brand-primary` -> `text`. The role is what a designer reaches for. */
const roleOf = (t) => t.name.split('-')[1];

/**
 * One semantic token, both modes at once.
 *
 * Light and dark are separate files with separate alias chains, so a token can
 * point at grey/300 in light and grey/600 in dark. Showing them side by side is
 * the only way to see a mode that was missed.
 */
function pair(name) {
  const light = value('semantic-light.css', name);
  const dark = value('semantic-dark.css', name);

  const cell = (mode, hex, alias) =>
    el(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      el('div', {
        class: 'hz-chip',
        style: { background: hex ?? 'transparent', width: '32px', flex: '0 0 auto' },
      }),
      el(
        'div',
        {},
        el('div', { class: 'hz-mono' }, hex ? hex.toUpperCase() : `missing in ${mode}`),
        el('div', { class: 'hz-meta' }, alias ? `→ ${alias}` : 'raw value'),
      ),
    );

  return el(
    'div',
    {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(200px, 28ch) 1fr 1fr',
        gap: '16px',
        alignItems: 'center',
        paddingBlock: '6px',
        borderBlockEnd: '1px solid var(--color-border-secondary)',
      },
    },
    el('div', { class: 'hz-name' }, name),
    cell('light', light, aliasOf(LIGHT_JSON, name)),
    cell('dark', dark, aliasOf(DARK_JSON, name)),
  );
}

export const LightAndDark = () => {
  const roles = groupBy(from('semantic-light.css'), roleOf);

  const header = el(
    'div',
    {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(200px, 28ch) 1fr 1fr',
        gap: '16px',
        paddingBlockEnd: '8px',
        fontWeight: '600',
      },
    },
    el('div', {}, 'Token'),
    el('div', {}, 'Light'),
    el('div', {}, 'Dark'),
  );

  return page(
    'Semantic colour',
    'The layer the product actually consumes. Each token resolves to a core ramp step, and the arrow shows which one — per mode, because light and dark alias independently.',
    note(
      'Dark mode ships as [data-theme="dark"]. The toolbar Theme switch sets that attribute on the document, exactly as a consuming app would.',
    ),
    ...roles.map(([role, tokens]) => group(role, el('div', {}, header, rows(tokens.map((t) => pair(t.name)))))),
  );
};

export const InContext = () => {
  const panel = (theme) =>
    el(
      'div',
      { class: 'hz-pane', dataset: { theme } },
      el('div', { style: { fontWeight: '600', marginBottom: '12px' } }, `${theme} mode`),
      el(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        el('div', {}, 'Primary text on the primary background.'),
        el('div', { style: { color: 'var(--color-text-secondary)' } }, 'Secondary text, for supporting copy.'),
        el(
          'div',
          {
            style: {
              display: 'flex',
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--border-radius-sm)',
              background: 'var(--color-background-surface)',
              border: '1px solid var(--color-border-primary)',
            },
          },
          el(
            'span',
            {
              style: {
                padding: '4px 12px',
                borderRadius: 'var(--border-radius-pill)',
                background: 'var(--color-background-interactive-white-foreground-brand-idle)',
                color: '#fff',
              },
            },
            'Brand',
          ),
          el(
            'span',
            {
              style: {
                padding: '4px 12px',
                borderRadius: 'var(--border-radius-pill)',
                background: 'var(--color-background-interactive-white-foreground-danger-idle)',
                color: '#fff',
              },
            },
            'Danger',
          ),
          el(
            'span',
            {
              style: {
                padding: '4px 12px',
                borderRadius: 'var(--border-radius-pill)',
                background: 'var(--color-background-interactive-white-foreground-positive-idle)',
                color: '#fff',
              },
            },
            'Positive',
          ),
        ),
      ),
    );

  return page(
    'Light and dark, side by side',
    'The same markup under both modes. Nothing here sets a colour directly — every value comes through a semantic token, so this is what a component gets for free.',
    el('div', { class: 'hz-pair' }, panel('light'), panel('dark')),
  );
};
