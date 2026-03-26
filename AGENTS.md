# AGENTS.md

## Cursor Cloud specific instructions

This is a **Next.js 16** (App Router) frontend for Planet Motors, a used-car dealership website. There are no backend services, databases, or Docker dependencies — only the Next.js dev server is needed.

### Quick reference

Standard commands are in `README.md` and `package.json` scripts. Key ones:

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Build | `npm run build` |

### Notes

- **Node.js ≥ 22** is required (Next.js 16 + React 19).
- No `.env` file is needed; `NEXT_PUBLIC_SITE_URL` defaults to `https://planetmotors.ca`.
- ESLint produces 2 warnings about anonymous default exports in config files (`eslint.config.mjs`, `prettier.config.mjs`) — these are benign.
- `npm run build` may modify `tsconfig.json` (sets `jsx` to `react-jsx`, adds `.next/dev/types/**/*.ts` to `include`) — this is normal Next.js behavior.
- The site is a UI shell with placeholder content; navigation links point to `#` anchors.
