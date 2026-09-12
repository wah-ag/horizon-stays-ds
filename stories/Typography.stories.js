import { json, value, describe } from './lib/tokens.js';
import { page, el, note } from './lib/ui.js';

export default {
  title: 'Type/Styles',
};

const STYLES_JSON = 'typography.styles.tokens.json';

/** The 15 authored roles, in the order a designer sees them in Figma. */
const ROLES = Object.keys(json[STYLES_JSON] ?? {});

const PROPS = ['font-family', 'font-weight', 'font-size', 'line-height', 'letter-spacing'];

/** Read a role's five resolved properties out of one platform's stylesheet. */
function resolve(file, role) {
  return Object.fromEntries(PROPS.map((prop) => [prop, value(file, `${role}-${prop}`)]));
}

function specimen(file, role) {
  const style = resolve(file, role);
  const spec = [
    style['font-size'],
    style['line-height'],
    style['font-weight'] && `weight ${style['font-weight']}`,
    style['letter-spacing'] && `tracking ${style['letter-spacing']}`,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return el(
    'div',
    { style: { paddingBlock: '12px', borderBlockEnd: '1px solid var(--color-border-secondary)' } },
    el(
      'div',
      {
        style: {
          fontFamily: style['font-family'] ?? 'inherit',
          fontWeight: style['font-weight'] ?? 'inherit',
          fontSize: style['font-size'] ?? 'inherit',
          lineHeight: style['line-height'] ?? 'normal',
          letterSpacing: style['letter-spacing'] ?? 'normal',
          textDecoration: role.endsWith('-underlined') ? 'underline' : 'none',
        },
      },
      'Horizon Stays — a night in the Shan hills',
    ),
    el(
      'div',
      { style: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' } },
      el('div', { class: 'hz-name' }, role),
      el('div', { class: 'hz-mono' }, spec),
      // A 0px size renders nothing at all above, which otherwise just looks
      // like a blank row rather than a broken token.
      Number.parseFloat(style['font-size']) === 0
        ? el('div', { class: 'hz-mono hz-zero' }, 'font-size is 0 — nothing renders on this scale')
        : null,
    ),
    describe(STYLES_JSON, role)
      ? el('div', { class: 'hz-meta', style: { marginTop: '2px' } }, describe(STYLES_JSON, role))
      : null,
  );
}

/**
 * Roles whose line-height came through as `normal`.
 *
 * config.js emits that when the Figma source has a line-height of 0, so this
 * list is read out of the build rather than kept by hand — it was two roles
 * before the title-xs export added a third, and a hardcoded list would already
 * be wrong.
 */
function unsetLineHeights(file) {
  return ROLES.filter((role) => value(file, `${role}-line-height`) === 'normal');
}

/** One story per platform — the roles are shared, the measurements are not. */
function platformStory(label, file, lede) {
  return () => {
    const unset = unsetLineHeights(file);
    return page(
      `Typography — ${label}`,
      lede,
      unset.length
        ? note(
            `${unset.join(', ')} ${unset.length === 1 ? 'has' : 'have'} a line-height of 0 in the Figma source, so the build emits "normal" and ${unset.length === 1 ? 'it renders' : 'they render'} looser than intended. That is a source-data fix in Figma, not a pipeline fix — config.js warns about it on every run.`,
          )
        : null,
      el('div', {}, ROLES.map((role) => specimen(file, role))),
    );
  };
}

export const Web = platformStory(
  'web',
  'typography-web.css',
  'Every typography role at its web measurements. Each specimen is styled from the generated CSS, so what you read is what ships.',
);

export const Mobile = platformStory(
  'mobile',
  'typography-mobile.css',
  'The same roles against the mobile scale.',
);

export const BackOffice = platformStory(
  'back office',
  'typography-back-office.css',
  'The same roles against the back-office scale — denser throughout, because these screens are read by staff all day rather than browsed.',
);
