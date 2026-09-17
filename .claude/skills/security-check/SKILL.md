---
name: security-check
description: Run scripts/security-check.mjs before a build is deployed and against the live URL after — known-format credentials, private identifiers, environment leakage, dependency advisories, a dirty tree, and whether a URL is public or protected as intended. States plainly what it does not catch.
---

# Security check

## What this is
A gate with a short, stated list of checks. It catches the specific mistakes listed below and
nothing else. **No gate protects against every attack**, and a gate that claims to is one nobody
should trust. A pass means "none of these known mistakes were found" — not "this is secure".

The script is `scripts/security-check.mjs`. It uses Node built-ins, `git` and `npm` only — no
dependencies. It never prints a secret: only its type, where it was found, and a masked prefix.

| Exit | Meaning |
|---|---|
| `0` | Every check ran and passed |
| `1` | A check failed, **or could not run** — a check that cannot run is a failure, never a skip |
| `2` | Bad usage |

## Build mode
```
npm run build-storybook
node scripts/security-check.mjs build
```
Scans `storybook-static/` (override with `--dir`) and every git-tracked file, from the project
root (override with `--root`).

| Check | Fails when |
|---|---|
| **Credentials** | A token in a provider's own format appears in the build output or a tracked file: GitHub (classic and fine-grained), Airtable, Figma, Asana, Anthropic, npm, AWS access key ID, or a private key block. |
| **Private identifiers** | An ID from `.claude/registry.local.json` appears anywhere, or anything shaped like an Airtable base/table/field/view/record ID, a Vercel project ID or a Vercel team ID. |
| **Environment leakage** | A `.env` file other than `.env.example` is committed; client code still references a secret-named `process.env.*` or `import.meta.env.*`; or the value of a secret-named variable — from the environment or a local `.env*` file — appears in client code. |
| **Dependency advisories** | `npm audit` reports a high or critical advisory, or cannot produce a report (offline, no lockfile). |
| **Working tree** | `git status` shows any uncommitted or untracked change — the build is not the commit it claims to be. |

## Live mode
```
node scripts/security-check.mjs live --url <url> --expect public
node scripts/security-check.mjs live --url <url> --expect protected
```
`--expect` is required; there is no default. It fails either way round:

- **`--expect public`** fails if the URL answers 401, 403 or 407, or redirects to another origin or
  a login/SSO path. When it is public, the page and its same-origin scripts (up to 50) are scanned
  for credentials, private identifiers and environment leakage.
- **`--expect protected`** fails if an anonymous request gets the page (200).
- Anything else — unreachable, 404, 5xx — fails both ways.

## Who runs it, and when
| Who | When | Command |
|---|---|---|
| **Engineer** | After `npm run build-storybook` passes, before merging to `staging` | `build` |
| **Engineer** | After the staging deploy, before writing `Staging Storybook` | `live --expect public` |
| **DevOps** | After a human merges to `main`, before deploying to production | `build` |
| **DevOps** | After the production deploy, with the deploy gate, before writing `Production Storybook` | `live --expect public` |
| **A human** | Decides whether each environment is meant to be public or protected, and handles every credential finding | — |

Staging is `--expect public` because QA and the PM must open the `Staging Storybook` link without
logging in. If staging becomes protected, a human changes this row, and QA and the PM need a way in.

QA and the PM do not run it.

## When it fails
- Stop. Do not deploy, and do not write the registry link.
- Report the check, the file or URL, and the type — never the secret itself.
- Do not "fix" it by editing build output or deleting the line and rebuilding.
- **A credential found in anything already deployed or pushed is already exposed.** Removing it
  does not un-expose it. A human rotates it at the provider; no agent does.

## What it does not cover
Read this before trusting a pass.

- **Secrets with no known format.** Detection is provider patterns, not entropy. A Vercel token, a
  database password, a generic API key, or a base64-encoded, split or obfuscated secret will pass.
- **Providers not in the list** — Slack, Stripe, Google, OpenAI and every other — pass.
- **Git history.** Only the current tracked files and build output are scanned. A secret committed
  and later deleted is still in history, and this does not look there.
- **Binary files** — images, fonts, archives — are skipped.
- **Advisories nobody has reported.** `npm audit` knows published advisories only. A malicious or
  compromised package with no advisory passes. Moderate and low advisories do not fail.
- **Anything at runtime.** No XSS, CSP, security headers, CORS, cookies, or server-side checks.
- **Access beyond one URL.** Live mode checks the one URL it is given with one anonymous request.
  It does not prove other paths are protected, that a protection cannot be bypassed, or that the
  right people can get in.
- **Private data other than registry, Airtable and Vercel IDs** — email addresses, Figma file
  keys, Asana IDs — is not detected.
- **It is not a penetration test**, a code review, or a substitute for either.

## Self-check
- [ ] I ran the mode the table above names for my role, at the point it names
- [ ] The exit code was 0 — not "mostly passed", not a skipped check
- [ ] I reported any finding by type and location, never by value
- [ ] I did not describe a pass as "secure"
