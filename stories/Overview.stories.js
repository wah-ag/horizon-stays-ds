import { css, json, census, conflicting } from './lib/tokens.js';
import { page, group, el, note } from './lib/ui.js';

export default {
  title: 'Overview',
};

const COLLECTIONS = [
  {
    name: 'core',
    file: 'core.value.tokens.json',
    modes: ['value'],
    what: 'Primitives — colour ramps, spacing, sizing, radii, border widths, shadow parts, font family.',
  },
  {
    name: 'semantics-color',
    file: 'semantics-color.on-light.tokens.json',
    modes: ['on-light', 'on-dark'],
    what: 'Roles the product consumes: background, border, icon, text. Each aliases a core ramp step, independently per mode.',
  },
  {
    name: 'type-scale',
    file: 'type-scale.web.tokens.json',
    modes: ['web', 'mobile', 'back-office'],
    what: 'Font sizes, line heights, and the mode-dependent spacing and sizing steps.',
  },
  {
    name: 'typography (styles)',
    file: 'typography.styles.tokens.json',
    modes: ['× 3 scales'],
    what: 'Composite roles — family, weight, size, line height, tracking — resolved against each scale.',
  },
  {
    name: 'effects (styles)',
    file: 'effects.styles.tokens.json',
    modes: ['—'],
    what: 'Composite box shadows, two layers each.',
  },
];

function row(cells, bold) {
  return el(
    'div',
    {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(140px, 20ch) 8ch 12ch 1fr',
        gap: '16px',
        paddingBlock: '8px',
        borderBlockEnd: '1px solid var(--color-border-secondary)',
        fontWeight: bold ? '600' : 'inherit',
        alignItems: 'baseline',
      },
    },
    ...cells,
  );
}

export const WhatIsHere = () => {
  const authored = COLLECTIONS.reduce((sum, c) => sum + Object.keys(json[c.file] ?? {}).length, 0);
  const shipped = census().reduce((sum, f) => sum + f.count, 0);

  return page(
    'Horizon design tokens',
    'The tokens are exported from Figma into tokens/*.json, and config.js builds them into CSS, Android XML and Swift. This Storybook documents the CSS build — the same files the web app consumes.',

    note(
      `${authored} authored token names across ${COLLECTIONS.length} collections, resolving to ${shipped} CSS custom properties once every mode is expanded. Nothing on these pages is typed by hand: each story parses config/css/*.css at build time, so a token that is not in the build cannot appear here, and one that is added shows up on its own.`,
    ),

    // Dead space in a healthy build. It earns its keep the day a generator
    // change makes one stylesheet declare a token twice with two values.
    ...Object.entries(conflicting).map(([file, list]) =>
      note(`${file} declares ${list.length} token(s) twice with different values: ${list.map((c) => c.name).join(', ')}`),
    ),

    group(
      'Collections',
      el(
        'div',
        {},
        row([el('div', {}, 'Collection'), el('div', {}, 'Tokens'), el('div', {}, 'Modes'), el('div', {}, 'What it covers')], true),
        ...COLLECTIONS.map((c) =>
          row([
            el('div', { class: 'hz-name' }, c.name),
            el('div', { class: 'hz-mono' }, String(Object.keys(json[c.file] ?? {}).length)),
            el('div', { class: 'hz-mono' }, c.modes.join(', ')),
            el('div', { class: 'hz-meta' }, c.what),
          ]),
        ),
      ),
    ),

    group(
      'Generated stylesheets',
      el(
        'div',
        {},
        ...census().map((f) =>
          row([
            el('div', { class: 'hz-name' }, f.file),
            el('div', { class: 'hz-mono' }, String(f.count)),
            el('div', { class: 'hz-mono' }, 'custom props'),
            el('div', { class: 'hz-meta' }, (css[f.file]?.[0]?.name ?? '') && `first: --${css[f.file][0].name}`),
          ]),
        ),
      ),
    ),

    group(
      'How to consume',
      el(
        'div',
        { class: 'hz-meta' },
        el('p', {}, 'Web: import config/css/index.css for the web scale, index-mobile.css or index-back-office.css for the others. Set data-theme="dark" on a container to switch semantic colour; light is the default on :root.'),
        el('p', {}, 'Android: config/android/values/ with values-night/colors.xml for dark. iOS: config/ios/*.swift.'),
        el('p', {}, 'config/ is generated and gitignored. Run npm run build:tokens after any change to tokens/.'),
      ),
    ),
  );
};
