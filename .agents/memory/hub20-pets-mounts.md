---
name: HUB-20 Pet & Mount System
description: Architecture and gotchas for the pet & mount system (HUB-20)
---

## Key decisions

- **Category**: both pets and mounts registerApp with `category: "ANIMAL"` — "GAME" is not in the APP_CATEGORIES union type.
- **DB**: 20 tables in `lib/db/src/schema/pets.ts`, exported from `lib/db/src/schema/index.ts`, pushed via `pnpm --filter @workspace/db run push`.
- **Repos**: `DrizzlePetRepository` + `DrizzleMountRepository` in `src/repositories/drizzle/`.
- **Services**: `PetService(petRepo, notifSvc, actSvc, userReputationRepo)`, `MountService(mountRepo, notifSvc, actSvc, userReputationRepo)`.
- **Seeds**: petRepo.seedSpecies/seedLevelTable/seedSkills + mountRepo.seedMountTypes/seedLevelTable/seedRoutes called in container.ts.
- **Routes**: `artifacts/api-server/src/routes/pets.ts`, mounted at `/api/pets` and `/api/mounts` via `routes/index.ts`.
- **Frontend hooks**: `usePets.ts`, `useMounts.ts` in `artifacts/universe-hub/src/hooks/`.
- **Frontend pages**: 7 pet pages in `pages/pets/`, 5 mount pages in `pages/mounts/`.
- **App.tsx**: pet routes `/pets/*` before wildcard `<Route path="/pets/:id">` (specific paths first).
- **Sidebar**: `Rabbit` + `Footprints` + `PawPrint` + `Sparkles` + `Globe` icons from lucide-react.

**Why:** "GAME" is not an accepted APP_CATEGORY value — ANIMAL is the correct category for pets/mounts.
