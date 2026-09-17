import { from, groupBy } from './lib/tokens.js';
import { page, group, grid, swatch, note } from './lib/ui.js';

export default {
  title: 'Core/Colour ramps',
};

/** `color-blue-600` -> 600, `color-grey-100a` -> 100.5 so the alpha tint sorts after 100. */
function step(name) {
  const tail = name.slice(name.lastIndexOf('-') + 1);
  return Number.parseInt(tail, 10) + (tail.endsWith('a') ? 0.5 : 0);
}

export const Ramps = () => {
  const ramps = groupBy(
    from('core.css', /^color-/),
    (t) => t.name.split('-')[1],
  );

  return page(
    'Colour ramps',
    'The primitive palette. Nothing in the product should reference these directly — semantic tokens are the interface, and these are what the semantic tokens resolve to.',
    ...ramps.map(([hue, tokens]) =>
      group(
        hue,
        grid(
          [...tokens]
            .sort((a, b) => step(a.name) - step(b.name))
            .map((t) => swatch(t)),
        ),
      ),
    ),
  );
};

export const ShadowTints = () => {
  // Current exports name them elevation-shadow-*; older ones referenced
  // elevation-color-*, which config.js injects only while an export needs them.
  const tints = from('core.css', /^elevation-(shadow|color)-/);

  return page(
    'Shadow tints',
    'The core colours the elevation shadows are built from. Semantic shadow roles point at these per theme — see Elevation for how they combine.',
    tints.some((t) => t.name.startsWith('elevation-color-'))
      ? note(
          'The elevation-color-* tints are injected by config.js, not exported from Figma: this export references them without defining them. They disappear on their own once Figma exports its own shadow colours.',
        )
      : null,
    grid(tints.map((t) => swatch(t))),
  );
};
