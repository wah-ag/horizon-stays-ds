/**
 * stories/lib/tokens.js — the docs' single source of values
 * ---------------------------------------------------------------------------
 * Two inputs, deliberately:
 *
 *   config/css/*.css   the SHIPPED values. Parsed, not re-derived, so a swatch
 *                      can never show a colour the build does not emit.
 *   tokens/*.json      the AUTHORED intent — $description text and the alias
 *                      chains ({color-grey-300}) that the CSS flattens away.
 *
 * Nothing here hardcodes a token name or value. Add tokens in Figma, run
 * `npm run build:tokens`, and they appear in the stories on their own.
 */

const CSS = import.meta.glob('../../config/css/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const JSON_SRC = import.meta.glob('../../tokens/*.tokens.json', {
  import: 'default',
  eager: true,
});

/**
 * `/* description *\/ --name: value;` with the comment optional.
 *
 * The comment body cannot contain `*\/`, which keeps a file-level header from
 * being swallowed as the description of the first token below it.
 */
const DECL = /(?:\/\*((?:[^*]|\*(?!\/))*)\*\/\s*)?--([\w-]+)\s*:\s*([^;]+);/g;

function basename(path) {
  return path.slice(path.lastIndexOf('/') + 1);
}

/**
 * Parse one generated stylesheet into ordered token records.
 *
 * First occurrence wins. semantic-dark.css declares every token twice — once
 * under [data-theme="dark"] and again under @media (prefers-color-scheme: dark)
 * — with identical values, so deduping keeps a token from being counted or
 * listed twice. If those two blocks ever disagreed it would be a build bug, and
 * `duplicates()` below is what would surface it.
 */
function parseCss(source) {
  const byName = new Map();
  for (const [, comment, name, value] of source.matchAll(DECL)) {
    if (byName.has(name)) continue;
    byName.set(name, {
      name,
      value: value.trim(),
      description: comment ? comment.trim().replace(/\s+/g, ' ') : '',
    });
  }
  return [...byName.values()];
}

/** Names declared more than once in a stylesheet with *different* values. */
function conflicts(source) {
  const seen = new Map();
  const bad = [];
  for (const [, , name, value] of source.matchAll(DECL)) {
    const v = value.trim();
    if (seen.has(name) && seen.get(name) !== v) bad.push({ name, a: seen.get(name), b: v });
    else seen.set(name, v);
  }
  return bad;
}

/** Every generated stylesheet, keyed by filename: `css['core.css']`. */
export const css = Object.fromEntries(
  Object.entries(CSS).map(([path, source]) => [basename(path), parseCss(source)]),
);

/**
 * Any token a stylesheet declares twice with disagreeing values, keyed by
 * filename. Empty in a healthy build; the Overview page shows it if not.
 */
export const conflicting = Object.fromEntries(
  Object.entries(CSS)
    .map(([path, source]) => [basename(path), conflicts(source)])
    .filter(([, list]) => list.length > 0),
);

/** Every authored token file, keyed by filename. */
export const json = Object.fromEntries(
  Object.entries(JSON_SRC).map(([path, data]) => [basename(path), data]),
);

/** Ordered token records from a stylesheet whose names match `pattern`. */
export function from(file, pattern) {
  const list = css[file] ?? [];
  return pattern ? list.filter((t) => pattern.test(t.name)) : list;
}

/** Look one token up by name across a stylesheet. */
export function value(file, name) {
  return (css[file] ?? []).find((t) => t.name === name)?.value;
}

/**
 * The alias a semantic token points at, as authored — `{color-grey-300}`
 * becomes `color-grey-300`. Returns null for tokens authored as raw values.
 */
export function aliasOf(jsonFile, name) {
  const raw = json[jsonFile]?.[name]?.$value;
  return typeof raw === 'string' && raw.startsWith('{') ? raw.slice(1, -1) : null;
}

/** The `$description` a designer wrote in Figma, newlines flattened. */
export function describe(jsonFile, name) {
  return (json[jsonFile]?.[name]?.$description ?? '').replace(/\s+/g, ' ').trim();
}

/** Group records into `[label, records]` pairs by a key function, order kept. */
export function groupBy(records, key) {
  const groups = new Map();
  for (const record of records) {
    const label = key(record);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(record);
  }
  return [...groups];
}

/** `24px` -> 24. Used to sort and to scale the ruler bars. */
export function px(value) {
  return Number.parseFloat(value) || 0;
}

/** How many token values ship in total, for the overview page. */
export function census() {
  return Object.entries(css)
    .filter(([file]) => !file.startsWith('index'))
    .map(([file, list]) => ({ file, count: list.length }))
    .sort((a, b) => b.count - a.count);
}
