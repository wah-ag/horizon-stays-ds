import '../config/css/index.css';

/** @type {import('@storybook/html-vite').Preview} */
export default {
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    options: {
      storySort: {
        order: [
          'Overview',
          'Core',
          ['Colour ramps', 'Spacing', 'Sizing', 'Radius & border', 'Elevation primitives'],
          'Semantic',
          'Type',
          ['Scale', 'Styles'],
          'Elevation',
        ],
      },
    },
  },

  // Semantic colour ships as `:root, [data-theme="light"]` and
  // `[data-theme="dark"]`, so the toolbar switch is just that attribute — the
  // same mechanism a consuming app would use.
  globalTypes: {
    theme: {
      description: 'Semantic colour mode',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },

  decorators: [
    (story, context) => {
      document.documentElement.dataset.theme = context.globals.theme;
      return story();
    },
  ],
};
