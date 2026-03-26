# Branch Rules — PLANETMOTORS/Planet-Ultra

## Authorized repository
GitHub: `PLANETMOTORS/Planet-Ultra`
Authorized agent: **Cursor Agent only**

---

## Branch naming

| Prefix | Used by | Purpose |
|---|---|---|
| `main` | — | Production — protected |
| `cursor/*` | Cursor Agent | Agent-driven features and fixes |
| `dev1-*` | UI dev | UI / layout / component work |
| `dev2-*` | Logic dev | Business logic, finance, routing |
| `dev3-*` | CMS dev | Data integrations, CMS, APIs |
| `dev4-*` | Perf/SEO dev | Performance, metadata, Core Web Vitals |

## Rules

1. `main` is the production branch — all merges require a PR.
2. Cursor Agent always creates branches with the `cursor/` prefix.
3. Branch names must be lowercase with hyphens only (no underscores, no spaces).
4. Each branch targets a single concern — do not bundle unrelated changes.
5. Delete branches after merge.

## Vercel preview deployments

Every PR branch automatically gets a Vercel preview URL. Merging to `main` triggers the production deploy to `dev.planetmotors.ca`.

## Cross-repo rule

Cursor Agent branches must never reference or push to `PLANETMOTORS/Website`.
Claude Code branches must never reference or push to `PLANETMOTORS/Planet-Ultra`.
