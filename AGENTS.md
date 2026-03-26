# AGENTS.md — Planet-Ultra (PLANETMOTORS/Planet-Ultra)

## Project Identity

| Field | Value |
|---|---|
| GitHub repo | `PLANETMOTORS/Planet-Ultra` |
| Vercel project | `planetmotors-website` |
| Production domain | `dev.planetmotors.ca` |
| Vercel URL | `planetmotors-website.vercel.app` |
| Authorized AI agent | **Cursor Agent only** |

---

## Repository Separation — CRITICAL

This repository (`PLANETMOTORS/Planet-Ultra`) and `PLANETMOTORS/Website` are **two completely separate projects**.

| Property | This repo (Planet-Ultra) | Other repo (Website) |
|---|---|---|
| GitHub | `PLANETMOTORS/Planet-Ultra` | `PLANETMOTORS/Website` |
| AI agent | Cursor Agent | Claude Code |
| Purpose | Next.js 16 rebuild (inventory, VDP, SEO) | Legacy / maintenance |
| Vercel project | `planetmotors-website` | Separate Vercel project |

**Do not cross-contaminate these repos.** Claude Code must not push to this repo. Cursor Agent must not push to `PLANETMOTORS/Website`.

If you are a Claude Code agent reading this file — **stop immediately**. You are in the wrong repository. Your workspace should be pointing to `PLANETMOTORS/Website`, not this repo.

---

## Authorized Agents & Permissions

### Cursor Agent (authorized — this repo only)
- May read, write, and commit to any branch in `PLANETMOTORS/Planet-Ultra`
- Must follow the branch rules in `docs/branch-rules.md`
- Base branch: `main`
- Never push to `PLANETMOTORS/Website`

### Claude Code (authorized — PLANETMOTORS/Website only)
- Must NOT operate in this repo
- If Claude Code appears here, the user should verify `git remote -v` and confirm it shows `PLANETMOTORS/Website`, not `PLANETMOTORS/Planet-Ultra`

---

## Branch Strategy

All Cursor Agent branches follow this pattern:

| Branch prefix | Purpose |
|---|---|
| `main` | Production — deploys to `dev.planetmotors.ca` |
| `cursor/*` | Cursor Agent feature branches |
| `dev1-*` | UI layer work |
| `dev2-*` | Logic / data layer |
| `dev3-*` | Data / CMS integrations |
| `dev4-*` | Performance / SEO |

PRs are merged into `main`. Merging to `main` triggers Vercel production deployment.

---

## Vercel Deployment

- Vercel project: `planetmotors-website` (under TONY's Vercel account)
- Production deploys from `main` branch
- Preview deploys from any PR branch automatically
- Vercel config: no `vercel.json` — defaults apply (Next.js auto-detected)

To verify Vercel linkage at any time:
```bash
git remote -v   # must show PLANETMOTORS/Planet-Ultra
```

---

## Cursor Cloud Specific Instructions

- The dev server is already running via `npm run dev` on port 3000.
- To run lint: `npm run lint`
- To run type check: `npm run typecheck`
- To build: `npm run build`
- Node modules are pre-installed; run `npm install` only if `package.json` changes.
- Do not kill the dev server (pid visible in terminal 276510). Leave it running.

---

## Code & Architecture Rules

See `docs/architecture-rules.md` for full rules. Summary:

- **App Router only** — no Pages Router, no `getServerSideProps`, no `getStaticProps`
- **Server Components by default** — only use `"use client"` when unavoidable
- **TypeScript strict** — all new files must pass `npm run typecheck`
- **No inline styles** — use Tailwind utility classes only
- **Vehicle data contract** — all vehicle data must conform to `types/vehicle.ts` and `docs/vehicle-contract.md`
- **360 assets are non-blocking** — never put them in the critical render path
- **SEO-first** — every page must export `generateMetadata`

---

## File Structure

```
app/          Next.js App Router pages and layouts
lib/          Business logic (finance engine, SEO helpers)
types/        Shared TypeScript types (vehicle contract, etc.)
docs/         Project rules and specifications
reference/    Locked UX reference (do not modify without approval)
```

---

## Testing

- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Build check: `npm run build`
- Manual GUI testing: use the `computerUse` subagent against `http://localhost:3000`
- No Jest/Vitest suite currently — rely on TypeScript and lint for correctness gates
