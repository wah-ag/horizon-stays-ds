/**
 * config.js — Horizon design tokens build
 * ---------------------------------------------------------------------------
 * Run:  node config.js        (or: npm run build:tokens)
 *
 * Output tree:
 *   config/
 *     css/      light + dark split, per type-scale files, typography classes
 *     android/  values/*.xml  + values-night/colors.xml
 *     ios/      *.swift
 *
 * Why this file is shaped the way it is
 * ---------------------------------------------------------------------------
 * 1. The Figma export uses the SAME token names in several files:
 *      semantics-color.on-light  ↔  semantics-color.on-dark
 *      type-scale.web  ↔  .mobile  ↔  .back-office
 *    Loading them into one Style Dictionary run makes them overwrite each
 *    other. So we run one Style Dictionary INSTANCE per mode instead.
 *
 * 2. Older exports had effects.styles.tokens.json referencing four colours
 *    that no token file defined:
 *      elevation-color-6a / -8a / -10a / -12a
 *    They are grey/800 (#31373D) at 6/8/10/12% alpha. We inject them below,
 *    but ONLY when the effects file still references them and core does not
 *    define them. An export that carries its own shadow colours needs no
 *    injection, so this retires itself.
 *
 * 5. Shadow colours can vary by theme. When a shadow layer references a
 *    semantic token (shadow-depth-1, defined in both on-light and on-dark),
 *    elevation.css emits `var(--shadow-depth-1)` instead of a resolved colour,
 *    and declares the shadows on `:root, [data-theme]`. That selector matters:
 *    a custom property resolves its var()s where it is declared, so a shadow
 *    declared only on :root would carry light colours into a dark subtree.
 *    Re-declaring it on every [data-theme] element lets it pick up that
 *    element's colours. The effects are resolved against BOTH themes, so a
 *    shadow colour missing from one mode fails the build instead of shipping
 *    a shadow that silently vanishes in that theme.
 *
 * 3. "Regular" is a Figma style name, not a CSS font-weight → mapped to 400.
 *
 * 4. Every bare number is a PX measurement. A bare `64` in CSS line-height
 *    means "64 × font-size", so every numeric value gets an explicit unit
 *    (px on web, dp/sp on Android, CGFloat points on iOS).
 * ---------------------------------------------------------------------------
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(ROOT, 'tokens');
const BUILD_DIR = path.join(ROOT, 'config'); // <- change here to rename output root

/** Style Dictionary wants POSIX-ish paths for globbing. */
const src = (file) => path.join(TOKENS_DIR, file).split(path.sep).join('/');
const out = (...parts) => path.join(BUILD_DIR, ...parts).split(path.sep).join('/') + '/';

const FILES = {
  core: src('core.value.tokens.json'),
  light: src('semantics-color.on-light.tokens.json'),
  dark: src('semantics-color.on-dark.tokens.json'),
  typography: src('typography.styles.tokens.json'),
  effects: src('effects.styles.tokens.json'),
  scale: {
    web: src('type-scale.web.tokens.json'),
    mobile: src('type-scale.mobile.tokens.json'),
    'back-office': src('type-scale.back-office.tokens.json'),
  },
};

/* ==========================================================================
 * 0. Missing tokens injected into the graph
 * ========================================================================== */

const GREY_800 = [0.1921568661928177, 0.21568627655506134, 0.239215686917305]; // #31373D

const shadowTint = (alpha) => ({
  $type: 'color',
  $value: { colorSpace: 'srgb', components: GREY_800, alpha },
  $description: `grey/800 #31373D at ${Math.round(alpha * 100)}% — shadow tint.`,
});

/** What older exports referenced from effects.styles.tokens.json without defining. */
const LEGACY_SHADOW_TINTS = {
  'elevation-color-6a': shadowTint(0.06),
  'elevation-color-8a': shadowTint(0.08),
  'elevation-color-10a': shadowTint(0.1),
  'elevation-color-12a': shadowTint(0.12),
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/** Every `{token-name}` reference inside a token file's values. */
function referencesIn(file) {
  const refs = new Set();
  const walk = (node) => {
    if (typeof node === 'string') {
      const match = node.match(/^\{([^{}]+)\}$/);
      if (match) refs.add(match[1]);
    } else if (node && typeof node === 'object') {
      for (const [key, child] of Object.entries(node)) if (key !== '$description') walk(child);
    }
  };
  walk(readJson(file));
  return refs;
}

const EFFECT_REFERENCES = referencesIn(FILES.effects);
const CORE_NAMES = new Set(Object.keys(readJson(FILES.core)));

/** Only the legacy tints this export still needs — none, once Figma exports its own. */
const INJECTED_TOKENS = Object.fromEntries(
  Object.entries(LEGACY_SHADOW_TINTS).filter(
    ([name]) => EFFECT_REFERENCES.has(name) && !CORE_NAMES.has(name),
  ),
);

/* ==========================================================================
 * 1. Small helpers
 * ========================================================================== */

const WARNINGS = [];
const warn = (msg) => {
  if (!WARNINGS.includes(msg)) WARNINGS.push(msg);
};

const round = (n, precision = 4) => Number(Number(n).toFixed(precision));

/** DTCG puts the value on `$value`; transformed tokens may land on `value`. */
const valueOf = (token) => (token.$value !== undefined ? token.$value : token.value);
const typeOf = (token) => token.$type ?? token.type;

/** Fixes the `typograghy` typo that ships in the Figma export. */
const cleanPath = (token) => token.path.map((p) => p.replace(/typograghy/g, 'typography'));

const pascal = (str) =>
  str
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');

/* ---- colour ------------------------------------------------------------- */

/** Accepts a DTCG colour object or a hex string → {r,g,b,a} with r/g/b 0-255. */
function toRgba(value) {
  if (typeof value === 'string') {
    // Inside a composite the colour arrives already transformed to CSS.
    const fn = value.trim().match(/^rgba?\(([^)]+)\)$/i);
    if (fn) {
      const [r, g, b, a = 1] = fn[1]
        .split(/[,\s/]+/)
        .filter(Boolean)
        .map(Number);
      return { r, g, b, a };
    }

    const hex = value.trim().replace(/^#/, '');
    const full =
      hex.length === 3 || hex.length === 4
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1,
    };
  }

  if (value && typeof value === 'object' && Array.isArray(value.components)) {
    const [r = 0, g = 0, b = 0] = value.components.map((c) => (c === 'none' ? 0 : c));
    const alpha = value.alpha === undefined || value.alpha === 'none' ? 1 : value.alpha;
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a: alpha,
    };
  }

  warn(`Unrecognised colour value: ${JSON.stringify(value)}`);
  return { r: 0, g: 0, b: 0, a: 1 };
}

const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');

const cssColor = (value) => {
  const { r, g, b, a } = toRgba(value);
  return a === 1 ? `#${hex2(r)}${hex2(g)}${hex2(b)}` : `rgba(${r}, ${g}, ${b}, ${round(a, 3)})`;
};

/**
 * `{shadow-depth-1}` → `var(--shadow-depth-1)`, named exactly as
 * horizon/name/kebab names the token it points at. Not a reference → null.
 */
const cssReference = (value) => {
  const match = typeof value === 'string' && value.match(/^\{([^{}]+)\}$/);
  if (!match) return null;
  const name = match[1].replace(/typograghy/g, 'typography').replace(/\./g, '-').toLowerCase();
  return `var(--${name})`;
};

/** Android wants #AARRGGBB. */
const androidColor = (value) => {
  const { r, g, b, a } = toRgba(value);
  return `#${hex2(a * 255)}${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase();
};

const swiftColor = (value) => {
  const { r, g, b, a } = toRgba(value);
  return `UIColor(red: ${round(r / 255, 4)}, green: ${round(g / 255, 4)}, blue: ${round(
    b / 255,
    4,
  )}, alpha: ${round(a, 3)})`;
};

/* ---- dimension ---------------------------------------------------------- */

/**
 * Normalises every dimension shape the export can produce into {value, unit}.
 * A BARE NUMBER IS PX — this is the fix for `line-height: 64` (which CSS reads
 * as 64 × font-size) vs `line-height: 64px`.
 */
function toDimension(value) {
  if (typeof value === 'number') return { value, unit: 'px' };

  if (typeof value === 'string') {
    const match = value.trim().match(/^(-?[\d.]+)\s*([a-z%]*)$/i);
    if (match) return { value: Number(match[1]), unit: match[2] || 'px' };
    return null;
  }

  if (value && typeof value === 'object' && typeof value.value === 'number') {
    return { value: value.value, unit: value.unit || 'px' };
  }

  return null;
}

const cssDimension = (value) => {
  const dim = toDimension(value);
  if (!dim) {
    warn(`Unrecognised dimension value: ${JSON.stringify(value)}`);
    return String(value);
  }
  return `${round(dim.value, 3)}${dim.unit}`;
};

/** Font metrics are scale-independent on Android → sp. Everything else → dp. */
const isFontMetric = (token) =>
  /^(font-size|line-height|letter-spacing)/.test(cleanPath(token).join('-'));

const androidDimension = (value, token) => {
  const dim = toDimension(value);
  if (!dim) return String(value);
  return `${round(dim.value, 2)}${isFontMetric(token) ? 'sp' : 'dp'}`;
};

const swiftDimension = (value) => {
  const dim = toDimension(value);
  return dim ? String(round(dim.value, 3)) : String(value);
};

/* ---- font weight -------------------------------------------------------- */

/**
 * Figma stores the STYLE NAME ("Regular", "Semi Bold"). CSS/Android/iOS all
 * want the numeric weight.
 */
const FONT_WEIGHTS = {
  thin: 100,
  hairline: 100,
  extralight: 200,
  ultralight: 200,
  light: 300,
  regular: 400,
  normal: 400,
  book: 400,
  medium: 500,
  semibold: 600,
  demibold: 600,
  bold: 700,
  extrabold: 800,
  ultrabold: 800,
  black: 900,
  heavy: 900,
};

function toFontWeight(value) {
  if (typeof value === 'number') return value;
  const key = String(value).toLowerCase().replace(/[\s_-]/g, '');
  if (FONT_WEIGHTS[key] === undefined) {
    warn(`Unknown font weight "${value}" — defaulted to 400.`);
    return 400;
  }
  return FONT_WEIGHTS[key];
}

const SWIFT_WEIGHTS = {
  100: '.ultraLight',
  200: '.thin',
  300: '.light',
  400: '.regular',
  500: '.medium',
  600: '.semibold',
  700: '.bold',
  800: '.heavy',
  900: '.black',
};

/* ==========================================================================
 * 2. Transforms
 * ========================================================================== */

const isColorToken = (token) => typeOf(token) === 'color';
const isDimensionToken = (token) => typeOf(token) === 'dimension';
const isTypographyToken = (token) => typeOf(token) === 'typography';
const isShadowToken = (token) => typeOf(token) === 'shadow';

/* name ------------------------------------------------------------------- */

StyleDictionary.registerTransform({
  name: 'horizon/name/kebab',
  type: 'name',
  transform: (token) => cleanPath(token).join('-').toLowerCase(),
});

StyleDictionary.registerTransform({
  name: 'horizon/name/snake',
  type: 'name',
  transform: (token) => cleanPath(token).join('_').toLowerCase().replace(/-/g, '_'),
});

StyleDictionary.registerTransform({
  name: 'horizon/name/camel',
  type: 'name',
  transform: (token) => {
    const kebab = cleanPath(token).join('-').toLowerCase();
    return kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  },
});

/* value: css -------------------------------------------------------------- */

StyleDictionary.registerTransform({
  name: 'horizon/color/css',
  type: 'value',
  filter: isColorToken,
  transform: (token) => cssColor(valueOf(token)),
});

StyleDictionary.registerTransform({
  name: 'horizon/size/css',
  type: 'value',
  filter: isDimensionToken,
  transform: (token) => cssDimension(valueOf(token)),
});

StyleDictionary.registerTransform({
  name: 'horizon/shadow/css',
  type: 'value',
  filter: isShadowToken,
  // Composite values hold references, and Style Dictionary skips
  // NON-transitive value transforms on any token whose original value
  // references another token. Without this flag the shadow never gets
  // formatted and lands in the CSS as "[object Object]".
  transitive: true,
  transform: (token) => {
    const asLayers = (value) => (Array.isArray(value) ? value : [value]);
    const layers = asLayers(valueOf(token));
    // References are already resolved in `layers`; the original keeps them.
    const authored = asLayers(token.original?.$value ?? token.original?.value ?? []);
    return layers
      .map((layer, i) => {
        const parts = ['offsetX', 'offsetY', 'blur', 'spread']
          .map((key) => cssDimension(layer[key] ?? 0))
          .join(' ');
        // A referenced colour stays a reference, so a theme-dependent shadow
        // colour resolves per theme. See note 5 at the top of this file.
        const color = cssReference(authored[i]?.color) ?? cssColor(layer.color);
        return `${parts} ${color}`;
      })
      .join(', ');
  },
});

/* value: android ---------------------------------------------------------- */

StyleDictionary.registerTransform({
  name: 'horizon/color/android',
  type: 'value',
  filter: isColorToken,
  transform: (token) => androidColor(valueOf(token)),
});

StyleDictionary.registerTransform({
  name: 'horizon/size/android',
  type: 'value',
  filter: isDimensionToken,
  transform: (token) => androidDimension(valueOf(token), token),
});

/* value: ios -------------------------------------------------------------- */

StyleDictionary.registerTransform({
  name: 'horizon/color/ios',
  type: 'value',
  filter: isColorToken,
  transform: (token) => swiftColor(valueOf(token)),
});

StyleDictionary.registerTransform({
  name: 'horizon/size/ios',
  type: 'value',
  filter: isDimensionToken,
  transform: (token) => swiftDimension(valueOf(token)),
});

/* value: typography (shared, platform-neutral numbers) --------------------- */

StyleDictionary.registerTransform({
  name: 'horizon/typography/normalize',
  type: 'value',
  filter: isTypographyToken,
  // See horizon/shadow/css. Because references resolve first, the sub-values
  // arrive here already platform-transformed ("24px" on web, "24sp" on
  // Android, "24" on iOS) — toDimension() normalises all three back.
  transitive: true,
  transform: (token) => {
    const value = valueOf(token) ?? {};
    const fontSize = toDimension(value.fontSize);
    const lineHeight = toDimension(value.lineHeight);
    const letterSpacing = toDimension(value.letterSpacing) ?? { value: 0, unit: 'px' };

    // The Figma export ships 0px line-heights on a few back-office roles.
    // 0 would collapse the text box, so fall back to `normal` and shout.
    let resolvedLineHeight = lineHeight;
    if (!lineHeight || lineHeight.value === 0) {
      warn(
        `line-height for "${token.path.join('.')}" is 0 in ${path.basename(
          token.filePath,
        )} — emitted as "normal". Fix the source token in Figma.`,
      );
      resolvedLineHeight = null;
    }

    return {
      fontFamily: String(value.fontFamily ?? 'Inter'),
      fontWeight: toFontWeight(value.fontWeight),
      fontSize: fontSize ?? { value: 16, unit: 'px' },
      lineHeight: resolvedLineHeight,
      letterSpacing,
    };
  },
});

/* ==========================================================================
 * 3. Formats
 * ========================================================================== */

const HEADER = (extra = []) =>
  ['/**', ' * Horizon design tokens — generated by config.js.', ' * Do not edit directly.', ...extra.map((l) => ` * ${l}`), ' */', ''].join(
    '\n',
  );

const comment = (token) =>
  token.$description ? String(token.$description).replace(/\r?\n/g, ' ').replace(/\*\//g, '* /') : null;

/** CSS custom properties, one or more selectors, optional dark media query. */
StyleDictionary.registerFormat({
  name: 'horizon/css/variables',
  format: ({ dictionary, options }) => {
    const {
      selector = ':root',
      showComments = true,
      darkMediaQuery = false,
      note = [],
    } = options;

    const declarations = dictionary.allTokens.map((token) => {
      const description = showComments ? comment(token) : null;
      const line = `  --${token.name}: ${valueOf(token)};`;
      return description ? `  /* ${description} */\n${line}` : line;
    });

    const block = (sel) => `${sel} {\n${declarations.join('\n')}\n}\n`;

    let body = block(selector);

    if (darkMediaQuery) {
      const indented = declarations.map((d) => d.split('\n').map((l) => '  ' + l).join('\n'));
      body +=
        '\n@media (prefers-color-scheme: dark) {\n' +
        '  :root:not([data-theme="light"]) {\n' +
        indented.join('\n') +
        '\n  }\n}\n';
    }

    return HEADER(note) + '\n' + body;
  },
});

/** Typography: per-part custom properties + a ready-to-use utility class. */
StyleDictionary.registerFormat({
  name: 'horizon/css/typography',
  format: ({ dictionary, options }) => {
    const { prefix = 'horizon', note = [] } = options;

    const vars = [];
    const classes = [];

    dictionary.allTokens.forEach((token) => {
      const v = valueOf(token);
      const name = token.name;
      const lineHeight = v.lineHeight ? `${round(v.lineHeight.value, 3)}${v.lineHeight.unit}` : 'normal';

      const description = comment(token);
      if (description) vars.push(`  /* ${description} */`);
      vars.push(
        `  --${name}-font-family: "${v.fontFamily}", system-ui, sans-serif;`,
        `  --${name}-font-weight: ${v.fontWeight};`,
        `  --${name}-font-size: ${round(v.fontSize.value, 3)}${v.fontSize.unit};`,
        `  --${name}-line-height: ${lineHeight};`,
        `  --${name}-letter-spacing: ${round(v.letterSpacing.value, 3)}${v.letterSpacing.unit};`,
        '',
      );

      const decls = [
        `  font-family: var(--${name}-font-family);`,
        `  font-weight: var(--${name}-font-weight);`,
        `  font-size: var(--${name}-font-size);`,
        `  line-height: var(--${name}-line-height);`,
        `  letter-spacing: var(--${name}-letter-spacing);`,
      ];
      if (name.endsWith('-underlined')) decls.push('  text-decoration: underline;');

      classes.push(`.${prefix}-${name} {\n${decls.join('\n')}\n}`);
    });

    return (
      HEADER(note) +
      '\n:root {\n' +
      vars.join('\n').replace(/\n+$/, '') +
      '\n}\n\n' +
      classes.join('\n\n') +
      '\n'
    );
  },
});

/** Android <resources> of <color> or <dimen>. */
const androidResources = (tag) => ({ dictionary, options }) => {
  const rows = dictionary.allTokens.map((token) => {
    const description = comment(token);
    const line = `  <${tag} name="${token.name}">${valueOf(token)}</${tag}>`;
    return description ? `  <!-- ${description.replace(/--+/g, '-')} -->\n${line}` : line;
  });

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<!-- Horizon design tokens — generated by config.js. Do not edit directly.${
      options.note?.length ? ' ' + options.note.join(' ') : ''
    } -->\n` +
    '<resources>\n' +
    rows.join('\n') +
    '\n</resources>\n'
  );
};

StyleDictionary.registerFormat({ name: 'horizon/android/colors', format: androidResources('color') });
StyleDictionary.registerFormat({ name: 'horizon/android/dimens', format: androidResources('dimen') });

/** Android TextAppearance styles. letterSpacing on Android is in em, not sp. */
StyleDictionary.registerFormat({
  name: 'horizon/android/type',
  format: ({ dictionary, options }) => {
    const parent = options.parentStyle ?? 'TextAppearance.AppCompat';

    const styles = dictionary.allTokens.map((token) => {
      const v = valueOf(token);
      const em = v.fontSize.value ? round(v.letterSpacing.value / v.fontSize.value, 4) : 0;
      const items = [
        `    <item name="android:fontFamily">@font/${v.fontFamily.toLowerCase().replace(/\s+/g, '_')}</item>`,
        `    <item name="android:textFontWeight">${v.fontWeight}</item>`,
        `    <item name="android:textSize">${round(v.fontSize.value, 2)}sp</item>`,
      ];
      if (v.lineHeight) {
        items.push(`    <item name="android:lineHeight">${round(v.lineHeight.value, 2)}sp</item>`);
      }
      items.push(`    <item name="android:letterSpacing">${em}</item>`);

      return `  <style name="TextAppearance.Horizon.${pascal(token.name)}" parent="${parent}">\n${items.join(
        '\n',
      )}\n  </style>`;
    });

    return (
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<!-- Horizon design tokens — generated by config.js. Do not edit directly. -->\n' +
      '<resources>\n' +
      styles.join('\n\n') +
      '\n</resources>\n'
    );
  },
});

/** Swift enum of static constants. */
StyleDictionary.registerFormat({
  name: 'horizon/ios/swift',
  format: ({ dictionary, options }) => {
    const { className = 'HorizonTokens', note = [] } = options;

    const lines = dictionary.allTokens.map((token) => {
      const value = valueOf(token);
      const type = typeOf(token);
      const description = comment(token);

      let declaration;
      if (type === 'color') declaration = `    public static let ${token.name} = ${value}`;
      else if (type === 'dimension') declaration = `    public static let ${token.name}: CGFloat = ${value}`;
      else declaration = `    public static let ${token.name}: String = "${value}"`;

      return description ? `    /// ${description}\n${declaration}` : declaration;
    });

    return (
      HEADER(note) +
      '\nimport UIKit\n\n' +
      `public enum ${className} {\n` +
      lines.join('\n') +
      '\n}\n'
    );
  },
});

/** Swift typography constants built on the shared HorizonTextStyle struct. */
StyleDictionary.registerFormat({
  name: 'horizon/ios/typography',
  format: ({ dictionary, options }) => {
    const { className = 'HorizonTypography', note = [] } = options;

    const lines = dictionary.allTokens.map((token) => {
      const v = valueOf(token);
      const description = comment(token);
      const lineHeight = v.lineHeight ? round(v.lineHeight.value, 2) : round(v.fontSize.value * 1.2, 2);

      const declaration =
        `    public static let ${token.name} = HorizonTextStyle(\n` +
        `        fontFamily: "${v.fontFamily}",\n` +
        `        fontWeight: ${SWIFT_WEIGHTS[v.fontWeight] ?? '.regular'},\n` +
        `        fontSize: ${round(v.fontSize.value, 2)},\n` +
        `        lineHeight: ${lineHeight},\n` +
        `        letterSpacing: ${round(v.letterSpacing.value, 3)}\n` +
        `    )`;

      return description ? `    /// ${description}\n${declaration}` : declaration;
    });

    return (
      HEADER(note) + '\nimport UIKit\n\n' + `public enum ${className} {\n` + lines.join('\n\n') + '\n}\n'
    );
  },
});

/* ==========================================================================
 * 4. Platform scaffolding
 * ========================================================================== */

const CSS_TRANSFORMS = [
  'horizon/name/kebab',
  'horizon/color/css',
  'horizon/size/css',
  'horizon/shadow/css',
  'horizon/typography/normalize',
];

const ANDROID_TRANSFORMS = [
  'horizon/name/snake',
  'horizon/color/android',
  'horizon/size/android',
  'horizon/typography/normalize',
];

const IOS_TRANSFORMS = [
  'horizon/name/camel',
  'horizon/color/ios',
  'horizon/size/ios',
  'horizon/typography/normalize',
];

/** Match a token by the source file it came from. */
const from = (...tokenFiles) => {
  const wanted = tokenFiles.map((f) => path.basename(f));
  return (token) => wanted.includes(path.basename(token.filePath ?? ''));
};

/** Injected tokens have no filePath — match them by name prefix instead. */
const isInjected = (token) => Object.keys(INJECTED_TOKENS).includes(token.path.join('-'));

const baseConfig = (overrides) => ({
  usesDtcg: true,
  log: {
    warnings: 'warn',
    verbosity: 'verbose',
    errors: { brokenReferences: 'throw' },
  },
  tokens: INJECTED_TOKENS,
  ...overrides,
});

async function build(config) {
  const sd = new StyleDictionary(config);
  await sd.buildAllPlatforms();
}

/* ==========================================================================
 * 5. The six builds
 * ========================================================================== */

const SCALES = ['web', 'mobile', 'back-office'];

async function buildCore() {
  const coreFilter = (token) => from(FILES.core)(token) || isInjected(token);

  await build(
    baseConfig({
      source: [FILES.core],
      platforms: {
        css: {
          transforms: CSS_TRANSFORMS,
          buildPath: out('css'),
          files: [
            {
              destination: 'core.css',
              format: 'horizon/css/variables',
              filter: coreFilter,
              options: { note: ['Primitives — colour ramps, spacing, sizing, radii, borders.'] },
            },
          ],
        },
        android: {
          transforms: ANDROID_TRANSFORMS,
          buildPath: out('android'),
          files: [
            {
              destination: 'values/colors_core.xml',
              format: 'horizon/android/colors',
              filter: (token) => coreFilter(token) && isColorToken(token),
            },
            {
              destination: 'values/dimens_core.xml',
              format: 'horizon/android/dimens',
              filter: (token) => coreFilter(token) && isDimensionToken(token),
            },
          ],
        },
        ios: {
          transforms: IOS_TRANSFORMS,
          buildPath: out('ios'),
          files: [
            {
              destination: 'HorizonCore.swift',
              format: 'horizon/ios/swift',
              filter: (token) => coreFilter(token) && !isShadowToken(token),
              options: { className: 'HorizonCore' },
            },
          ],
        },
      },
    }),
  );
}

/**
 * Composite shadows. CSS only — shadows have never had an Android or iOS
 * format; native targets get the shadow colours per theme through the
 * semantic colour files instead.
 *
 * Resolved against each theme in turn. Dark is a check only: it throws if a
 * shadow references a colour the dark mode does not define. Light writes the
 * file, with theme-dependent colours left as var() references (note 5).
 */
async function buildElevation() {
  const elevationConfig = (themeFile, platforms) =>
    baseConfig({ include: [FILES.core, themeFile], source: [FILES.effects], platforms });

  await new StyleDictionary(
    elevationConfig(FILES.dark, { css: { transforms: CSS_TRANSFORMS, files: [] } }),
  ).exportPlatform('css');

  await build(
    elevationConfig(FILES.light, {
      css: {
        transforms: CSS_TRANSFORMS,
        buildPath: out('css'),
        files: [
          {
            destination: 'elevation.css',
            format: 'horizon/css/variables',
            filter: from(FILES.effects),
            options: {
              selector: ':root, [data-theme]',
              showComments: true,
              note: [
                'Composite box-shadow tokens.',
                'Declared on every [data-theme] element so theme-dependent shadow colours resolve per theme.',
              ],
            },
          },
        ],
      },
    }),
  );
}

async function buildTheme(mode) {
  const file = mode === 'dark' ? FILES.dark : FILES.light;
  const filter = from(file);
  const Mode = pascal(mode);

  await build(
    baseConfig({
      include: [FILES.core],
      source: [file],
      platforms: {
        css: {
          transforms: CSS_TRANSFORMS,
          buildPath: out('css'),
          files: [
            {
              destination: `semantic-${mode}.css`,
              format: 'horizon/css/variables',
              filter,
              options: {
                selector: mode === 'dark' ? '[data-theme="dark"]' : ':root, [data-theme="light"]',
                darkMediaQuery: mode === 'dark',
                showComments: false,
                note: [`Semantic colour — ${mode} mode.`],
              },
            },
          ],
        },
        android: {
          transforms: ANDROID_TRANSFORMS,
          buildPath: out('android'),
          files: [
            {
              destination: mode === 'dark' ? 'values-night/colors.xml' : 'values/colors.xml',
              format: 'horizon/android/colors',
              filter,
            },
          ],
        },
        ios: {
          transforms: IOS_TRANSFORMS,
          buildPath: out('ios'),
          files: [
            {
              destination: `HorizonColor${Mode}.swift`,
              format: 'horizon/ios/swift',
              filter,
              options: { className: `HorizonColor${Mode}` },
            },
          ],
        },
      },
    }),
  );
}

async function buildScale(scale) {
  const scaleFile = FILES.scale[scale];
  const scaleFilter = from(scaleFile);
  const typeFilter = from(FILES.typography);
  const Scale = pascal(scale);
  const snake = scale.replace(/-/g, '_');

  await build(
    baseConfig({
      include: [FILES.core],
      source: [scaleFile, FILES.typography],
      platforms: {
        css: {
          transforms: CSS_TRANSFORMS,
          buildPath: out('css'),
          files: [
            {
              destination: `type-scale-${scale}.css`,
              format: 'horizon/css/variables',
              filter: scaleFilter,
              options: { showComments: false, note: [`Type scale + layout scale — ${scale}.`] },
            },
            {
              destination: `typography-${scale}.css`,
              format: 'horizon/css/typography',
              filter: typeFilter,
              options: { note: [`Typography roles resolved against the ${scale} scale.`] },
            },
          ],
        },
        android: {
          transforms: ANDROID_TRANSFORMS,
          buildPath: out('android'),
          files: [
            {
              destination: `values/dimens_${snake}.xml`,
              format: 'horizon/android/dimens',
              filter: scaleFilter,
            },
            {
              destination: `values/type_${snake}.xml`,
              format: 'horizon/android/type',
              filter: typeFilter,
            },
          ],
        },
        ios: {
          transforms: IOS_TRANSFORMS,
          buildPath: out('ios'),
          files: [
            {
              destination: `HorizonScale${Scale}.swift`,
              format: 'horizon/ios/swift',
              filter: scaleFilter,
              options: { className: `HorizonScale${Scale}` },
            },
            {
              destination: `HorizonTypography${Scale}.swift`,
              format: 'horizon/ios/typography',
              filter: typeFilter,
              options: { className: `HorizonTypography${Scale}` },
            },
          ],
        },
      },
    }),
  );
}

/* ==========================================================================
 * 6. Hand-written support files
 * ========================================================================== */

function writeSupportFiles() {
  const cssDir = path.join(BUILD_DIR, 'css');

  for (const scale of SCALES) {
    const name = scale === 'web' ? 'index.css' : `index-${scale}.css`;
    const contents = [
      `/* Horizon design tokens — ${scale} entry point. Generated by config.js. */`,
      '',
      '@import "./core.css";',
      '@import "./semantic-light.css";',
      '@import "./semantic-dark.css";',
      '@import "./elevation.css";',
      `@import "./type-scale-${scale}.css";`,
      `@import "./typography-${scale}.css";`,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(cssDir, name), contents, 'utf8');
  }

  // Shared Swift struct — declared once so the three typography files can use it.
  const iosDir = path.join(BUILD_DIR, 'ios');
  fs.writeFileSync(
    path.join(iosDir, 'HorizonTextStyle.swift'),
    [
      '/**',
      ' * Horizon design tokens — generated by config.js.',
      ' * Do not edit directly.',
      ' */',
      '',
      'import UIKit',
      '',
      'public struct HorizonTextStyle {',
      '    public let fontFamily: String',
      '    public let fontWeight: UIFont.Weight',
      '    public let fontSize: CGFloat',
      '    public let lineHeight: CGFloat',
      '    public let letterSpacing: CGFloat',
      '',
      '    public var font: UIFont {',
      '        UIFont(name: fontFamily, size: fontSize)',
      '            ?? .systemFont(ofSize: fontSize, weight: fontWeight)',
      '    }',
      '',
      '    /// Feed straight into NSAttributedString.',
      '    public var attributes: [NSAttributedString.Key: Any] {',
      '        let paragraph = NSMutableParagraphStyle()',
      '        paragraph.minimumLineHeight = lineHeight',
      '        paragraph.maximumLineHeight = lineHeight',
      '        return [',
      '            .font: font,',
      '            .kern: letterSpacing,',
      '            .paragraphStyle: paragraph,',
      '        ]',
      '    }',
      '}',
      '',
    ].join('\n'),
    'utf8',
  );
}

/* ==========================================================================
 * 7. Run
 * ========================================================================== */

fs.rmSync(BUILD_DIR, { recursive: true, force: true });

await buildCore();
await buildTheme('light');
await buildTheme('dark');
await buildElevation();
for (const scale of SCALES) await buildScale(scale);

writeSupportFiles();

console.log('\n✓ Horizon tokens built → config/');
console.log('  css/      core, semantic-light, semantic-dark, elevation, type-scale-*, typography-*, index*');
console.log('  android/  values/*.xml, values-night/colors.xml');
console.log('  ios/      HorizonCore, HorizonColor*, HorizonScale*, HorizonTypography*, HorizonTextStyle');

if (WARNINGS.length) {
  console.log('\n⚠ Source-data warnings (fix these in Figma, not here):');
  for (const message of WARNINGS) console.log(`  - ${message}`);
}
