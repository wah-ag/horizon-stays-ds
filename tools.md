# tools.md — what this project is built with

Stack facts and commands only. Rules about how we work live in `CLAUDE.md`.

## Stack

- Language: JavaScript, ES modules (`"type": "module"`). No TypeScript.
- Runtime: Node 24, npm 11.
- Package manager: npm.
- Tokens: Style Dictionary 5, reading the Figma "Design Tokens" plugin export
  (DTCG format — `$type` / `$value` / `$description`).
- Styling: CSS custom properties, generated from tokens. No CSS framework, no
  preprocessor, no CSS-in-JS.
- Component workshop: Storybook 10 (`@storybook/html-vite`) with
  `@storybook/addon-docs`. **HTML framework, not React** — stories build DOM
  directly and there is no JSX.
- Bundler: Vite 7, used only by Storybook.
- Platform outputs: CSS, Android XML, and Swift, all from one build.

## Commands

| Job | Command |
|---|---|
| Install | `npm install` |
| Build tokens | `npm run build:tokens` |
| Run Storybook | `npm run storybook` (port 6006) |
| Build Storybook | `npm run build-storybook` |
| Security check | `node scripts/security-check.mjs build` · `node scripts/security-check.mjs live --url <url> --expect public\|protected` |
| Deploy | **No command.** Vercel deploys from git — see below. |

`npm run build` is an alias of `npm run build:tokens`. Both Storybook scripts
run the token build first, so the docs can never render a stale build.

## Deploying

There is nothing to run. Vercel's Git integration builds this repo, so
"deploy" means pushing and then verifying the build Vercel made:

- Merging to `main` builds **production**; the stable address is
  `https://horizon-stays-ds-doy7.vercel.app`.
- Pushing to `staging` builds a **preview**, whose deployment-specific URL is
  what goes in the registry's `Staging Storybook`.
- Preview deployments are public: no login wall, so QA and the PM can open a
  staging link, and `security-check live --expect public` passes.
- The Vercel project is **`horizon-stays-ds-doy7`**. Two other Vercel projects,
  `horizon-stays-ds` and `horizon-stays-ds-5777`, also build from this repo and
  fail every time — ignore them, or delete them in Vercel.
- The Vercel connection cannot see this team, so find a deployment through
  GitHub instead:
  `gh api repos/wah-ag/horizon-stays-ds/deployments?sha=<sha>` then
  `/statuses` — take the one whose environment names `horizon-stays-ds-doy7`
  and whose state is `success`.

**`npm run build:tokens:legacy` is broken** — it points at `build-tokens.js`,
which does not exist. Do not use it; delete it or restore the file.

## Paths

- Token source: `tokens/` — nine files from Figma, committed, **never edited by
  hand**. `manifest.json` plus one file per collection and mode:
  `core.value`, `semantics-color.on-light` / `.on-dark`,
  `type-scale.web` / `.mobile` / `.back-office`,
  `typography.styles`, `effects.styles`.
- Token config: `config.js` at the repo root. Its header comment explains why
  it runs one Style Dictionary instance per mode — read it before changing the
  build.
- Generated output: `config/` (never edit by hand, gitignored)
  - `config/css/` — `core`, `semantic-light`, `semantic-dark`, `elevation`,
    `type-scale-*`, `typography-*`, and the `index*.css` entry points
  - `config/android/` — `values/*.xml` plus `values-night/colors.xml`
  - `config/ios/` — `Horizon*.swift`
- Storybook config: `.storybook/`
- Stories: `stories/`, with shared helpers in `stories/lib/`
- Storybook output: `storybook-static/` (generated, gitignored)
- Agents: `.claude/agents/`
- Skills: `.claude/skills/` (empty)
- Dev server config: `.claude/launch.json`

## Entry points

Consume one of these, never an individual token file:

| Target | Import |
|---|---|
| Web | `config/css/index.css` |
| Mobile | `config/css/index-mobile.css` |
| Back office | `config/css/index-back-office.css` |

Each pulls in core, both semantic colour modes, elevation, and that platform's
type scale and typography. Light is the default on `:root`; dark is
`[data-theme="dark"]` on an ancestor, with a `prefers-color-scheme` fallback.

## Known build output

`npm run build:tokens` prints source-data warnings for line heights that are
`0` in Figma and get emitted as `normal`. These come from the export, not the
pipeline — see `CLAUDE.md` on reporting rather than filling in.


