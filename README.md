# Planet-Ultra — PLANETMOTORS/Planet-Ultra

Next.js 16 rebuild of the Planet Motors platform: inventory, VDP, SEO, and performance.

**Production:** [dev.planetmotors.ca](https://dev.planetmotors.ca)
**Vercel project:** `planetmotors-website`
**GitHub:** `PLANETMOTORS/Planet-Ultra`
**Authorized AI agent:** Cursor Agent

---

## Repository Separation

This repo is **separate** from `PLANETMOTORS/Website` (Claude Code's workspace).

| | This repo | Other repo |
|---|---|---|
| GitHub | `PLANETMOTORS/Planet-Ultra` | `PLANETMOTORS/Website` |
| Agent | Cursor Agent | Claude Code |
| Vercel | `planetmotors-website` | Separate project |
| Domain | `dev.planetmotors.ca` | Separate domain |

To verify you are in the correct repo:
```bash
git remote -v   # must show PLANETMOTORS/Planet-Ultra
```

---

## Build Priorities
1. Locked VDP rebuild
2. Inventory rebuild
3. Sell / Trade rebuild
4. Server-first SEO
5. Fast image delivery
6. 360 media outside critical path

## Locked UX Reference
See `reference/locked-ux/`. Do not modify without explicit approval.

## Documentation
| Doc | Purpose |
|---|---|
| `docs/architecture-rules.md` | Code and framework rules |
| `docs/branch-rules.md` | Branch naming and PR workflow |
| `docs/vehicle-contract.md` | Vehicle data source of truth |
| `docs/vdp-lock-spec.md` | VDP locked UX specification |
| `docs/seo-architecture.md` | SEO and metadata rules |
| `docs/cache-strategy.md` | ISR and fetch caching strategy |
| `docs/page-priority-and-nav-structure.md` | Route map and nav labels |
| `docs/team-execution-plan.md` | Phase plan and agent ownership |
| `AGENTS.md` | AI agent rules and environment config |

## Commands
```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```
