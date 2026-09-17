#!/usr/bin/env node
/**
 * security-check — Node built-ins only, no dependencies.
 *
 *   node scripts/security-check.mjs build [--root <dir>] [--dir <build output>]
 *   node scripts/security-check.mjs live --url <url> --expect public|protected
 *
 * What it covers and what it does not: .claude/skills/security-check/SKILL.md.
 * Exit code: 0 every check passed, 1 a check failed or could not run, 2 bad usage.
 * It never prints a secret — only its type, where it was found, and a masked prefix.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// --- patterns ------------------------------------------------------------
// Provider-specific formats only. No entropy guessing: a secret with no
// recognisable format is not caught, and the skill says so.

const CREDENTIALS = [
  { name: 'GitHub token (classic)', re: /\bgh[pousr]_[A-Za-z0-9]{36}\b/g },
  { name: 'GitHub token (fine-grained)', re: /\bgithub_pat_[A-Za-z0-9]{22}_[A-Za-z0-9]{59}\b/g },
  { name: 'Airtable personal access token', re: /\bpat[A-Za-z0-9]{14}\.[a-f0-9]{64}\b/g },
  { name: 'Figma personal access token', re: /\bfigd_[A-Za-z0-9_-]{38,}/g },
  { name: 'Asana personal access token', re: /\b[12]\/\d{16}(?:\/\d{16})?:[a-f0-9]{32}\b/g },
  { name: 'Anthropic API key', re: /\bsk-ant-(?:api03|admin01)-[A-Za-z0-9_-]{80,}/g },
  { name: 'npm access token', re: /\bnpm_[A-Za-z0-9]{36}\b/g },
  { name: 'AWS access key ID', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { name: 'Private key block', re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY(?: BLOCK)?-----/g },
];

const hasMixedId = (s) => /[0-9]/.test(s) && /[A-Z]/.test(s) && /[a-z]/.test(s);

const PRIVATE_ID_PATTERNS = [
  { name: 'Airtable ID', re: /\b(?:app|tbl|fld|viw|rec)[A-Za-z0-9]{14}\b/g, accept: (m) => hasMixedId(m.slice(3)) },
  { name: 'Vercel project ID', re: /\bprj_[A-Za-z0-9]{28}\b/g },
  { name: 'Vercel team ID', re: /\bteam_[A-Za-z0-9]{24}\b/g },
];

const SECRET_NAME = /(SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE|API_?KEY|ACCESS_?KEY|CREDENTIAL|AUTH)/i;
const ENV_REFERENCE = /\b(?:process\.env|import\.meta\.env)\.([A-Za-z_][A-Za-z0-9_]*)/g;

const BINARY_EXT = /\.(png|jpe?g|gif|webp|avif|ico|bmp|woff2?|ttf|otf|eot|mp4|webm|mp3|wav|wasm|zip|gz|br|pdf)$/i;
const MAX_BYTES = 20 * 1024 * 1024;

// --- helpers -------------------------------------------------------------

const mask = (s) => `${s.slice(0, 6)}…(${s.length} chars)`;

function lineOf(text, index) {
  let line = 1;
  for (let i = text.indexOf('\n'); i !== -1 && i < index; i = text.indexOf('\n', i + 1)) line++;
  return line;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile()) out.push(p);
  }
  return out;
}

function readText(path) {
  if (BINARY_EXT.test(path) || statSync(path).size > MAX_BYTES) return null;
  const buf = readFileSync(path);
  if (buf.subarray(0, 8000).includes(0)) return null;
  return buf.toString('utf8');
}

function run(cmd, args, cwd) {
  return spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: 120000, maxBuffer: 64 * 1024 * 1024 });
}

/** npm's own CLI script, run through this Node — no shell, so no argument is ever re-parsed. */
function npmCli() {
  const bin = dirname(process.execPath);
  return [
    process.env.npm_execpath,
    join(bin, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    join(bin, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ].find((p) => p && p.endsWith('.js') && existsSync(p));
}

/** Private identifiers the project actually uses, from the gitignored registry config. */
function knownPrivateIds(root) {
  const p = join(root, '.claude', 'registry.local.json');
  if (!existsSync(p)) return [];
  const ids = [];
  const collect = (v) => {
    if (typeof v === 'string' && /^(app|tbl|fld|viw)[A-Za-z0-9]{14}$/.test(v)) ids.push(v);
    else if (v && typeof v === 'object') Object.values(v).forEach(collect);
  };
  collect(JSON.parse(readFileSync(p, 'utf8')));
  return ids;
}

/** Secret-looking environment values, from the process and any local .env files. Names only are ever reported. */
function secretEnvValues(root) {
  const found = new Map();
  const add = (name, value) => {
    if (SECRET_NAME.test(name) && typeof value === 'string' && value.length >= 8) found.set(value, name);
  };
  for (const [k, v] of Object.entries(process.env)) add(k, v);
  for (const file of readdirSync(root)) {
    if (!/^\.env(\..+)?$/.test(file) || file === '.env.example') continue;
    for (const line of readFileSync(join(root, file), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) add(m[1], m[2].replace(/^['"]|['"]$/g, ''));
    }
  }
  return found;
}

// --- scanners over a set of { label, text } sources ------------------------

function scanCredentials(sources) {
  const hits = [];
  for (const { label, text } of sources) {
    for (const { name, re } of CREDENTIALS) {
      for (const m of text.matchAll(re)) hits.push(`${label}:${lineOf(text, m.index)}  ${name}  ${mask(m[0])}`);
    }
  }
  return hits;
}

function scanPrivateIds(sources, known) {
  const hits = [];
  for (const { label, text } of sources) {
    for (const id of known) {
      for (let i = text.indexOf(id); i !== -1; i = text.indexOf(id, i + 1)) {
        hits.push(`${label}:${lineOf(text, i)}  registry ID from .claude/registry.local.json  ${mask(id)}`);
      }
    }
    for (const { name, re, accept } of PRIVATE_ID_PATTERNS) {
      for (const m of text.matchAll(re)) {
        if (known.includes(m[0]) || (accept && !accept(m[0]))) continue;
        hits.push(`${label}:${lineOf(text, m.index)}  ${name}  ${mask(m[0])}`);
      }
    }
  }
  return hits;
}

function scanEnvLeaks(sources, secretValues) {
  const hits = [];
  for (const { label, text } of sources) {
    for (const m of text.matchAll(ENV_REFERENCE)) {
      if (SECRET_NAME.test(m[1])) hits.push(`${label}:${lineOf(text, m.index)}  secret-named env reference left in client code  ${m[1]}`);
    }
    for (const [value, name] of secretValues) {
      const i = text.indexOf(value);
      if (i !== -1) hits.push(`${label}:${lineOf(text, i)}  value of environment variable ${name} is in client code`);
    }
  }
  return hits;
}

// --- reporting -----------------------------------------------------------

const results = [];
function record(check, hits, detail = '') {
  results.push({ check, ok: hits.length === 0, hits, detail });
}
function fail(check, reason) {
  results.push({ check, ok: false, hits: [reason], detail: 'could not run' });
}
function report(title) {
  console.log(`security-check · ${title}`);
  for (const { check, ok, hits, detail } of results) {
    const summary = ok ? 'pass' : detail || `${hits.length} found`;
    console.log(`${ok ? '✓' : '✗'} ${check.padEnd(22)} ${summary}`);
    for (const h of hits.slice(0, 50)) console.log(`    ${h}`);
    if (hits.length > 50) console.log(`    … and ${hits.length - 50} more`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(failed ? `FAIL — ${failed} of ${results.length} checks failed` : `PASS — ${results.length} checks`);
  // exitCode, not process.exit(): exiting while fetch sockets are open crashes Node on Windows.
  process.exitCode = failed ? 1 : 0;
}

// --- modes ---------------------------------------------------------------

function buildMode(args) {
  const root = resolve(args.root ?? process.cwd());
  const dir = resolve(root, args.dir ?? 'storybook-static');

  if (!existsSync(dir)) {
    fail('build output', `not found: ${dir} — run the build first`);
    return report(`build · ${dir}`);
  }

  const build = walk(dir)
    .map((p) => ({ label: relative(root, p).replaceAll('\\', '/'), text: readText(p) }))
    .filter((s) => s.text !== null);

  // Tracked source: committed files must not carry credentials or private IDs either.
  const ls = run('git', ['ls-files', '-z'], root);
  const tracked = ls.status === 0
    ? ls.stdout.split('\0').filter(Boolean)
        .map((f) => ({ label: f, path: join(root, f) }))
        .filter(({ path }) => existsSync(path))
        .map(({ label, path }) => ({ label, text: readText(path) }))
        .filter((s) => s.text !== null)
    : [];

  const known = knownPrivateIds(root);

  record('credentials', scanCredentials([...build, ...tracked]));
  record('private identifiers', scanPrivateIds([...build, ...tracked], known));

  const committedEnv = tracked
    .map((s) => s.label)
    .filter((f) => /(^|\/)\.env(\.[^/]+)?$/.test(f) && !f.endsWith('.env.example'))
    .map((f) => `${f}  environment file is committed`);
  const clientCode = build.filter((s) => /\.(m?js|cjs|html|map)$/.test(s.label));
  record('environment leakage', [...committedEnv, ...scanEnvLeaks(clientCode, secretEnvValues(root))]);

  try {
    const cli = npmCli();
    if (!cli) throw new Error('npm CLI not found beside this Node');
    const audit = run(process.execPath, [cli, 'audit', '--json'], root);
    const json = JSON.parse(audit.stdout);
    if (json.error) throw new Error(json.error.summary || json.error.code);
    const v = json.metadata.vulnerabilities;
    const hits = Object.entries(json.vulnerabilities ?? {})
      .filter(([, x]) => x.severity === 'high' || x.severity === 'critical')
      .map(([name, x]) => `${name}  ${x.severity}  ${x.range}`);
    record('dependency advisories', hits, hits.length ? `${v.critical} critical, ${v.high} high` : '');
  } catch (e) {
    fail('dependency advisories', `npm audit did not produce a report (${e.message}) — offline or no lockfile`);
  }

  const status = run('git', ['status', '--porcelain'], root);
  if (status.status !== 0) fail('working tree', 'git status failed — not a git repository?');
  else record('working tree', status.stdout.split(/\r?\n/).filter(Boolean).map((l) => `uncommitted  ${l}`));

  report(`build · ${relative(root, dir).replaceAll('\\', '/')}`);
}

async function liveMode(args) {
  const { url, expect } = args;
  if (!url || !['public', 'protected'].includes(expect)) usage();

  const origin = new URL(url).origin;
  let current = url;
  let res;
  let signal = null;
  try {
    for (let hop = 0; hop < 5; hop++) {
      res = await fetch(current, { redirect: 'manual' });
      if (res.status < 300 || res.status >= 400) break;
      const next = new URL(res.headers.get('location'), current);
      if (next.origin !== origin || /(login|signin|sso|auth)/i.test(next.pathname)) {
        signal = `redirects to ${next.origin}${next.pathname}`;
        break;
      }
      current = next.href;
    }
  } catch (e) {
    fail('access', `could not reach ${url} (${e.message})`);
    return report(`live · ${url} · expected ${expect}`);
  }

  if (!signal && [401, 403, 407].includes(res.status)) signal = `responds ${res.status}`;
  const isProtected = signal !== null;
  const isPublic = !isProtected && res.status === 200;

  if (!isProtected && !isPublic) {
    fail('access', `responds ${res.status} — neither a public page nor an access wall`);
  } else if (expect === 'public') {
    record('access', isPublic ? [] : [`meant to be public, but ${signal}`]);
  } else {
    record('access', isProtected ? [] : ['meant to be protected, but the page is served to an anonymous request (200)']);
  }

  if (isPublic) {
    const html = await res.text();
    const sources = [{ label: current, text: html }];
    const refs = [...html.matchAll(/<(?:script[^>]+src|link[^>]+href)=["']([^"']+\.m?js)["']/gi)].map((m) => new URL(m[1], current));
    for (const ref of refs.filter((r) => r.origin === origin).slice(0, 50)) {
      const r = await fetch(ref);
      if (r.ok) sources.push({ label: ref.href, text: await r.text() });
    }
    record('credentials', scanCredentials(sources));
    record('private identifiers', scanPrivateIds(sources, knownPrivateIds(process.cwd())));
    record('environment leakage', scanEnvLeaks(sources, secretEnvValues(process.cwd())));
  }

  report(`live · ${url} · expected ${expect}`);
}

function usage() {
  console.error('usage: node scripts/security-check.mjs build [--root <dir>] [--dir <build output>]');
  console.error('       node scripts/security-check.mjs live --url <url> --expect public|protected');
  process.exit(2);
}

const [mode, ...rest] = process.argv.slice(2);
const args = {};
for (let i = 0; i < rest.length; i += 2) {
  if (!rest[i].startsWith('--') || rest[i + 1] === undefined) usage();
  args[rest[i].slice(2)] = rest[i + 1];
}
if (mode === 'build') buildMode(args);
else if (mode === 'live') await liveMode(args);
else usage();
