/**
 * stories/lib/ui.js — presentation for the token stories.
 *
 * The docs chrome is built from the tokens it documents: spacing, radii,
 * elevation and type all come through `var(--…)`. If a token regresses, this
 * page gets uglier, which is the point.
 */

const STYLE_ID = 'horizon-docs-style';

const SHEET = `
  .hz {
    font-family: var(--body-md-font-family, system-ui, sans-serif);
    font-size: var(--body-md-font-size, 14px);
    line-height: var(--body-md-line-height, 20px);
    color: var(--color-text-primary, #1a1d21);
    background: var(--color-background-base, #fff);
    padding: var(--spacing-margin-md, 32px);
    box-sizing: border-box;
    min-height: 100vh;
  }
  .hz-lede {
    max-width: var(--size-container-md, 640px);
    color: var(--color-text-secondary, #4a525b);
    margin: 0 0 var(--spacing-margin-md, 32px);
  }
  .hz-group { margin-block-end: var(--spacing-margin-md, 32px); }
  .hz-group > h3 {
    font-family: var(--title-sm-font-family, system-ui, sans-serif);
    font-size: var(--title-sm-font-size, 18px);
    line-height: var(--title-sm-line-height, 24px);
    font-weight: var(--title-sm-font-weight, 600);
    margin: 0 0 var(--spacing-gap-md, 16px);
  }
  .hz-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--spacing-gap-md, 16px);
  }
  .hz-rows { display: flex; flex-direction: column; gap: var(--spacing-gap-sm, 8px); }
  .hz-row {
    display: grid;
    grid-template-columns: minmax(180px, 22ch) 6ch 1fr;
    align-items: center;
    gap: var(--spacing-gap-md, 16px);
    padding-block: var(--spacing-padding-xs, 4px);
    border-block-end: var(--border-width-sm, 1px) solid var(--color-border-secondary, #e5e7ea);
  }
  .hz-chip {
    height: var(--size-avatar-sm, 32px);
    border-radius: var(--border-radius-sm, 8px);
    border: var(--border-width-sm, 1px) solid var(--color-border-secondary, #e5e7ea);
  }
  /* Checkerboard ground. Translucent tokens (grey-0a is white at 50%) are
     invisible against a white card without it. */
  .hz-swatch {
    height: var(--sizing-12, 64px);
    border-radius: var(--border-radius-sm, 8px);
    border: var(--border-width-sm, 1px) solid var(--color-border-secondary, #e5e7ea);
    margin-block-end: var(--spacing-gap-xs, 4px);
    background-color: #fff;
    background-image:
      linear-gradient(45deg, #d8dce0 25%, transparent 25%, transparent 75%, #d8dce0 75%),
      linear-gradient(45deg, #d8dce0 25%, transparent 25%, transparent 75%, #d8dce0 75%);
    background-size: 12px 12px;
    background-position: 0 0, 6px 6px;
    overflow: hidden;
  }
  .hz-swatch > span { display: block; height: 100%; }
  .hz-name {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: var(--label-sm-font-size, 12px);
    overflow-wrap: anywhere;
  }
  .hz-meta {
    font-size: var(--label-sm-font-size, 12px);
    color: var(--color-text-secondary, #4a525b);
  }
  .hz-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: var(--label-sm-font-size, 12px);
    color: var(--color-text-secondary, #4a525b);
    white-space: nowrap;
  }
  .hz-zero {
    color: var(--color-text-warning, #b45309);
    font-weight: 600;
  }
  .hz-bar {
    background: var(--color-background-interactive-white-foreground-brand-idle, #3b82f6);
    height: var(--spacing-4, 8px);
    border-radius: var(--border-radius-xs, 4px);
    min-width: 1px;
  }
  .hz-box {
    background: var(--color-background-brand-surface, #dbeafe);
    border: var(--border-width-sm, 1px) solid var(--color-border-brand-primary, #3b82f6);
    border-radius: var(--border-radius-xs, 4px);
  }
  .hz-pair { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-gap-lg, 24px); }
  .hz-pane {
    padding: var(--spacing-padding-lg, 16px);
    border-radius: var(--border-radius-md, 12px);
    background: var(--color-background-surface, #fff);
    border: var(--border-width-sm, 1px) solid var(--color-border-secondary, #e5e7ea);
    color: var(--color-text-primary, #1a1d21);
  }
  .hz-note {
    padding: var(--spacing-padding-md, 12px) var(--spacing-padding-lg, 16px);
    border-inline-start: var(--border-width-md, 2px) solid var(--color-border-brand-primary, #3b82f6);
    background: var(--color-background-surface, #f2f4f6);
    border-radius: var(--border-radius-xs, 4px);
    margin-block-end: var(--spacing-margin-md, 32px);
    color: var(--color-text-secondary, #4a525b);
  }
  @media (max-width: 800px) { .hz-pair { grid-template-columns: 1fr; } }
`;

/** Inject the docs stylesheet once per preview iframe. */
function ensureSheet() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = SHEET;
  document.head.append(style);
}

/** Terse DOM builder: el('div', { class: 'x' }, child, 'text'). */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (val == null || val === false) continue;
    if (key === 'style' && typeof val === 'object') Object.assign(node.style, val);
    else if (key === 'dataset') Object.assign(node.dataset, val);
    else node.setAttribute(key, val);
  }
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

/** The page shell every story returns. */
export function page(title, lede, ...sections) {
  ensureSheet();
  return el(
    'div',
    { class: 'hz' },
    el('h2', { style: { margin: '0 0 8px', font: 'inherit', fontSize: '24px', fontWeight: '600' } }, title),
    lede ? el('p', { class: 'hz-lede' }, lede) : null,
    ...sections,
  );
}

/** A titled block of related tokens. */
export function group(heading, body) {
  return el('section', { class: 'hz-group' }, el('h3', {}, heading), body);
}

export function note(text) {
  return el('p', { class: 'hz-note' }, text);
}

/**
 * Colour swatch card: the colour, its token name, its shipped value.
 *
 * The colour goes on an inner layer so the checkerboard behind it shows
 * through anything translucent.
 */
export function swatch({ name, value, caption }) {
  // config.js emits opaque colours as hex, so an rgba()/hsla() or a 4-/8-digit
  // hex is the build telling us the token carries an alpha channel.
  const translucent = /rgba\(|hsla\(|^#(?:[0-9a-f]{4}|[0-9a-f]{8})$/i.test(value);
  return el(
    'div',
    { title: caption || '' },
    el('div', { class: 'hz-swatch' }, el('span', { style: { background: value } })),
    el('div', { class: 'hz-name' }, name),
    el('div', { class: 'hz-meta' }, value.toUpperCase(), translucent ? ' · translucent' : ''),
  );
}

/** One measured token: name, value, and a bar drawn at true size. */
export function measure({ name, value, size, description, cap = 320 }) {
  return el(
    'div',
    { class: 'hz-row' },
    el('div', {}, el('div', { class: 'hz-name' }, name), description ? el('div', { class: 'hz-meta' }, description) : null),
    el('div', { class: 'hz-mono' }, value),
    el('div', { class: 'hz-bar', style: { width: `${Math.min(size, cap)}px` } }),
  );
}

export function rows(children) {
  return el('div', { class: 'hz-rows' }, children);
}

export function grid(children) {
  return el('div', { class: 'hz-grid' }, children);
}
