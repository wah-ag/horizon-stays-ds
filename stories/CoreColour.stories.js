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
  const tints = from('core.css', /^elevation-color-/);

  return page(
    'Shadow tints',
    'grey/800 at four alphas. These exist only so the elevation tokens have something to resolve against.',
    note(
      'These four are injected by config.js, not exported from Figma: effects.styles.tokens.json references them but core.value.tokens.json does not define them. See the comment at the top of config.js.',
    ),
    grid(tints.map((t) => swatch(t))),
  );
};
