# GitHub ↔ Vercel Workflow (Operational)

## Purpose
Keep GitHub quality gates and Vercel deployments aligned for `main` and `trigger-vercel-deploy`.

## Workflows Added
1. `.github/workflows/ci.yml`
- Runs on PR to `main` and pushes to `main`/`trigger-vercel-deploy`
- Executes: `npm ci`, `lint`, `typecheck`, `build`

2. `.github/workflows/vercel-sync.yml`
- On push:
  - `trigger-vercel-deploy` -> preview deploy hook
  - `main` -> production deploy hook
- Also supports manual run via `workflow_dispatch`

## Required GitHub Secrets
Set in repository settings:
- `VERCEL_PREVIEW_DEPLOY_HOOK_URL`
- `VERCEL_PRODUCTION_DEPLOY_HOOK_URL`

## Recommended Branch Policy
- Require `CI` workflow to pass before merge to `main`.
- Keep docs and execution board updates on `trigger-vercel-deploy`.
- Merge to `main` only when gate evidence is attached in docs.
