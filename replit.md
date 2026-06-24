# Universe Hub

Universe Hub là cổng vào chính của toàn bộ Universe Ecosystem — quản lý identity, wallet, inventory, marketplace, và launcher cho mọi ứng dụng trong hệ sinh thái.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `SUPABASE_URL`, `SUPABASE_ANON_KEY` — when set, uses Supabase repositories; otherwise falls back to InMemory/Mock repositories

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- API: Express 5 (port 8080)
- Frontend: React 19 + Vite (port 5000), Tailwind CSS 4, Shadcn UI
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Real-time: WebSockets (`ws`) on `/ws/marketplace`

## Where things live

- `artifacts/api-server/` — Express backend
  - `src/models/` — domain models
  - `src/repositories/` — interfaces + InMemory implementations
  - `src/repositories/supabase/` — Supabase implementations
  - `src/services/` — business logic
  - `src/controllers/` — HTTP handlers
  - `src/routes/` — Express routers
  - `src/container.ts` — dependency injection wiring
- `artifacts/universe-hub/` — main React frontend
- `lib/db/src/schema/` — Drizzle schema (source of truth for DB)
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)

## Architecture decisions

- **Dual-repo pattern**: every data layer has an InMemory repo (used when Supabase is not configured) and a Supabase repo. `container.ts` selects based on `isSupabaseConfigured()`.
- **Fallback repos**: for core entities (users, wallets, etc.) a Fallback wrapper tries Supabase first, then InMemory. This keeps the app running in dev without credentials.
- **No local auth**: identity comes from Universe Account (HUB-1 AccountBridge). Hub does not store passwords or users.
- **Registry-first launcher**: HUB-3 AppLauncherService validates apps against HUB-2 AppRegistryService before generating SSO tokens.
- **In-memory activities/notifications**: launcher activities and first-launch notifications are stored in-process (suitable for dev; replace with DB in production).

## Product

- **Dashboard**: user profile, wallet balances (Credits/XU/Token), inventory summary
- **Wallet**: transaction history, currency management
- **Inventory**: item browser across all ecosystem apps
- **Marketplace**: listings, auctions, bids, watchlists, saved searches, reputation
- **Ecosystem Registry** (HUB-2): discover and manage apps in the Universe ecosystem
- **App Launcher** (HUB-3): launch any ecosystem app with SSO token, track history, dashboard

## API Endpoints (HUB-3 — App Launcher)

- `POST /api/launcher/launch` — launch an app, returns `{ app, launchUrl, accessToken, expiresAt }`
- `GET  /api/launcher/recent` — recent apps for current user
- `GET  /api/launcher/favorites` — most-used apps for current user
- `GET  /api/launcher/dashboard` — full launcher dashboard
- `DELETE /api/launcher/history` — clear launch history

## User preferences

- Vietnamese is used in service logs and some error messages (matching the existing codebase style).
- Sprint reports must include: files created/modified, API endpoints, test results, typecheck status, sample responses, acceptance criteria.

## Gotchas

- Pre-existing typecheck errors in `marketplaceSavedSearch.test.ts`, `marketplaceSearch.test.ts`, `marketplaceReputationController.ts` — do NOT fix unless asked; they predate HUB-3.
- The `Start API Server` workflow runs `pnpm run start` (not `dev`) — it requires a prior build step (`node ./build.mjs`).
- Vite proxy in `universe-hub/vite.config.ts` forwards `/api/*` → `localhost:8080` and `/ws/*` → `ws://localhost:8080`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- DB schema: `lib/db/src/schema/index.ts`
- Container (DI): `artifacts/api-server/src/container.ts`
- API routes entry: `artifacts/api-server/src/routes/index.ts`
