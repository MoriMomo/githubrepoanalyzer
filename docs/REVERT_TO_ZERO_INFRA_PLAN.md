# Plan — Revert Proof to Zero-Infra (remove backend/DB, keep the good wins)

> **Plan only. Do not execute until approved.** When executed, preserve all existing SPA behavior, routes, UI, and styles. The frontend must remain a client-only static SPA (Puter.js for auth/KV/AI), exactly as it was before the backend was added.

## Why
Proof's premise is a free, zero-infrastructure student tool: no server, no database, deploy a static `build/client` folder, and the signed-in user pays for their own AI via Puter. A recent change added a Hono API + PostgreSQL/Drizzle + a monorepo, which contradicts that premise (hosting, a DB to run/back up/bill, split-brain storage). Decision: **shelve the backend and DB.** Keep the two genuinely good wins. Do it without breaking the working SPA.

## Verified starting facts (confirmed before writing this plan)
- The frontend (`app/`) does **NOT** import `@proof/core`, `@proof/contracts`, the API, or call `/api/v1` / `localhost:3001` anywhere. The SPA is self-contained: `app/lib/` has its own `parse.ts`, `grounding.ts`, `storage.ts`, `puter.ts`.
- `app/lib/storage.ts` persists only to localStorage + Puter KV — no server calls.
- Backend/monorepo lives beside the app: `apps/api/**`, `packages/core/**`, `packages/contracts/**`, root `docker-compose.yml`, root `.env.example`, and workspace wiring in root `package.json` + path aliases in `tsconfig.json`.
- **GSAP is the one real entanglement in the app itself:** used in 5 files (`app/routes/home.tsx`, `app/routes/dashboard.tsx`, `app/routes/project.tsx`, `app/components/DefenseCard.tsx`, `app/components/TruthDrill.tsx`) via a wrapper `app/lib/gsap.ts`. `framer-motion` is also present (`app/components/ui/MotionView.tsx`, `LazyMotionView.tsx`). The visual plan (`docs/VISUAL_DESIGN_PLAN.md`) explicitly BANNED GSAP and allowed only framer-motion, lazy-imported.
- Repo is **not** under git yet.

## Step 0 — Safety first (do this before any deletion)
1. `git init` in the project root, add a sane `.gitignore` (node_modules, build, .react-router, dist, .env), and make ONE commit of the current state ("checkpoint: full backend+DB state before zero-infra revert") so everything is recoverable. This is a hard prerequisite — do not delete anything until this commit exists.
2. Create a working branch `chore/revert-to-zero-infra`. Do all removal on it; do not push to any protected branch.

## Step 1 — Remove the backend, DB, and monorepo wiring
Delete these paths:
- `apps/` (the whole Hono API + Drizzle schema + migrations + its tests)
- `packages/core/` and `packages/contracts/`
- root `docker-compose.yml`
- root `.env.example` (and `apps/api/.env.example` goes with `apps/`)

Then de-monorepo the root `package.json`:
- Remove the `"workspaces"` field.
- Remove workspace scripts: `dev:api`, `db:generate`, `db:migrate`, `db:push`, `db:studio`.
- Keep `build`, `dev`, `start`, `typecheck`, `lint`, `test`.
- Remove any dependency that existed ONLY for the API/DB (Hono, Drizzle, pg, Zod *if and only if* nothing in `app/` imports it — CHECK before removing Zod).

And `tsconfig.json`:
- Remove `"packages/**/*"` from `include`.
- Remove the `@proof/core` and `@proof/contracts` path aliases.
- Keep the `~/*` → `app/*` alias.

**Guard:** the frontend does not import these packages (verified), so removal should not touch `app/`. If `tsc` after this step reports a missing `@proof/*`, STOP — something in `app/` quietly depended on it; report it rather than papering over it.

## Step 2 — Remove GSAP, keep framer-motion
GSAP violates `docs/VISUAL_DESIGN_PLAN.md` and duplicates framer-motion (two animation libs = bundle bloat; this is the exact failure mode that caused a prior project's blank-screen incident). Consolidate on framer-motion.

1. Delete `app/lib/gsap.ts`.
2. In each of the 5 consumers (`home.tsx`, `dashboard.tsx`, `project.tsx`, `DefenseCard.tsx`, `TruthDrill.tsx`), replace the `useGSAP(...)` stagger/fade calls with the existing framer-motion `MotionView` / `LazyMotionView` primitives already in `app/components/ui/`. Match the current visual effect (stagger-fade-up on list mount, fade-in on expand). Keep it lazy-imported so framer-motion stays out of the initial chunk.
3. Remove `gsap` from `package.json` dependencies.
4. Honor `prefers-reduced-motion` (framer-motion's reduced-motion support) as the visual plan requires.

**Behavior to preserve:** the animations are cosmetic — the pages must render and function identically with reduced or zero motion. Do not change layout, data flow, or the input→analysis→drill→output state machine.

## Step 3 — Reconcile scope creep the backend introduced (report, don't silently keep)
The backend summary referenced features that may have leaked UI stubs: `app/routes/dashboard.tsx`, `app/components/MockInterviewModal.tsx`, `app/components/BulletAuditor.tsx`, `app/components/TraceabilityModal.tsx`. These were NOT in the v1 scope (`docs/ARCHITECTURE.md` §3). For each, report: is it wired into a route and working client-side with Puter/local storage, or is it a stub that assumed the API? 
- If it works fully client-side and adds value → keep it, note it.
- If it depends on the removed API → either make it work against Puter KV/local, or remove it and note the gap.
Do not leave a component that silently calls a server that no longer exists.

## Step 4 — Verify (all must pass)
From the project root:
1. `npm install` (lockfile updates after dep removal).
2. `npm run typecheck` — clean.
3. `npm run lint` — no new errors.
4. `npm run build` — succeeds; confirm `build/client/index.html` is emitted (SPA mode).
5. `npm run test` — passes. Note: tests that lived under `apps/api/test` are gone with the API; the remaining suite should be the frontend/core unit tests (parse, grounding, etc.). Report the new test count and confirm the §8 grounding acceptance test still passes.
6. Confirm the client bundle did not regain GSAP: grep the built assets / `package.json` to prove `gsap` is gone and framer-motion is code-split (report largest chunks before/after).
7. Manual: the app runs (`npm run dev`), auth via Puter still works, a paste → analysis → drill → output flow completes, and a session persists to Puter KV / localStorage. No `/api` or `localhost:3001` request appears in the Network tab.

## What we deliberately KEEP (the good wins — do not revert these)
1. **The timestamp/version bug fix** in `app/routes/project.tsx` + `app/lib/storage.ts`: immutable `createdAt`, real `updatedAt: Date.now()` on save, and the `version` counter driving conflict resolution. This is correct and stays.
2. **The UI primitives** in `app/components/ui/` (`Button`, `Badge`, `Card`, `Panel`, `Divider`, `MotionView`, `LazyMotionView`) and the visual-design token work — this is the design-system work we actually asked for.

## Guardrails
- Do not break any existing route, behavior, or style. This is a subtraction + one library swap, not a redesign.
- Keep everything client-only: Puter.js for auth/KV/AI, localStorage mirror. No server, no DB, no `fetch` to a backend.
- Commit in small steps (Step 0 checkpoint, then one commit per step) so each is revertible.
- If removing something would break a working client-side feature, STOP and report rather than deleting.
```

