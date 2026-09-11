/**
 * Storybook — Horizon design tokens.
 *
 * There are no components in this repo, so this Storybook is a documentation
 * surface for the tokens themselves. The stories read the CSS that config.js
 * generates, which means the docs cannot drift from what ships: if a token is
 * not in the build output, it is not on the page.
 *
 * `npm run storybook` runs `build:tokens` first for that reason.
 *
 * @type {import('@storybook/html-vite').StorybookConfig}
 */
export default {
  framework: '@storybook/html-vite',
  stories: ['../stories/**/*.stories.js'],
  addons: ['@storybook/addon-docs'],
};
