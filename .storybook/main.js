/**
 * Storybook — Horizon design tokens and components.
 *
 * `stories/` documents the tokens themselves. Those stories read the CSS that
 * config.js generates, which means the docs cannot drift from what ships: if a
 * token is not in the build output, it is not on the page.
 *
 * `src/components/` holds the components, each with its stories beside it.
 *
 * `npm run storybook` runs `build:tokens` first for that reason.
 *
 * @type {import('@storybook/html-vite').StorybookConfig}
 */
export default {
  framework: '@storybook/html-vite',
  stories: ['../stories/**/*.stories.js', '../src/**/*.stories.js'],
  addons: ['@storybook/addon-docs'],
};
