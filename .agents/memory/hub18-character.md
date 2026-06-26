---
name: HUB-18 Character System
description: Architecture decisions and gotchas for the Universe Character/Avatar/Progression system
---

# HUB-18 — Universe Character / Avatar / Progression System

## App registry category
Use `"UTILITY"` — not `"GAME"`. APP_CATEGORIES does not include GAME.

## DB constraint: one active character per user
`characters(user_id, is_active)` has a unique index. Only one active character per user at a time.
**Why:** The system is designed as single-character-per-account.

## Seeding behavior
`characterRepo.seedLevelTable()` and `characterRepo.seedSkillTrees()` run async on container startup.
- `character_levels`: 100 rows (levels 1–100)
- `skill_trees`: 4 skills × 6 classes = 24 per seed call. Multiple server restarts = multiple rows (no unique constraint on class+name). Acceptable in dev.

## Skill upgrade PL/pgSQL gotcha (test script only)
In PL/pgSQL, `skill_id` as a variable name conflicts with `character_skills.skill_id` column. Rename variable to `v_skill_id` in raw SQL tests.

## Sidebar icons
- Universe Character → `Users`, path `/character`
- Trang bị (Equipment) → `Sword`, path `/character/equipment`
- Kỹ năng (Skills) → `Sparkles`, path `/character/skills`
- Danh hiệu (Titles) → `Crown`, path `/character/titles`
All four icons must be imported from `lucide-react` in `Sidebar.tsx`.

## Frontend routes
- `/character` → CharacterDashboard (create-character form if no char)
- `/character/profile` → CharacterProfile
- `/character/stats` → CharacterStats + XP logs
- `/character/equipment` → EquipmentPage (10 equipment slots)
- `/character/skills` → SkillTree
- `/character/titles` → CharacterTitles
- `/character/appearance` → Appearance (skin/hair/eye customization)
- `/character/loadouts` → Loadouts (preset save/load)

## API routes (all require auth)
```
GET    /api/characters/me
POST   /api/characters
PUT    /api/characters/me
DELETE /api/characters/me
GET    /api/characters/stats
POST   /api/characters/xp
GET    /api/characters/xp/logs
GET    /api/characters/equipment
POST   /api/characters/equip
POST   /api/characters/unequip
GET    /api/characters/skills
POST   /api/characters/skills/:id   (body: { upgrade: bool })
GET    /api/characters/titles
POST   /api/characters/titles/:id/select
GET    /api/characters/presets
POST   /api/characters/presets
GET    /api/characters/appearance
PUT    /api/characters/appearance
```

## CharacterService constructor
Takes: `(repo, notificationsService, activitiesService, userReputationRepo)`
Same pattern as CraftingService (pass repo, not service).
