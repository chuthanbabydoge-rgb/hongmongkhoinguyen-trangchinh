---
name: HUB-12 Quest System
description: Key patterns and gotchas from implementing the Quest/Mission system
---

# HUB-12 Quest System

## Auth token property
`AuthContextValue` exposes `accessToken` (not `token`). Frontend hooks must destructure `{ accessToken }` from `useAuth()`.

**Why:** The context interface was updated but some older hooks still used `token` (pre-existing errors in `useReputation.ts`). New hooks must use `accessToken`.

**How to apply:** Any new hook doing `const { ... } = useAuth()` should use `accessToken`, not `token`.

## Extending union types across the stack
When adding a new domain (e.g. "quest") that produces activities or notifications, three type definitions must be updated together:
1. `artifacts/api-server/src/repositories/activitiesRepository.ts` — `ActivityType`
2. `artifacts/api-server/src/repositories/notificationsRepository.ts` — `NotificationType`
3. `artifacts/universe-hub/src/hooks/useAccount.ts` — frontend `NotificationType`

And `NotificationDropdown.tsx` `TYPE_META` record must include the new key.

**Why:** The frontend has its own `NotificationType` copy in `useAccount.ts` separate from the backend repository type. They must stay in sync manually.

## achievementService.checkAndUnlock context shape
The context parameter only accepts `{ totalPoints?: number; itemCount?: number }`. Do not pass domain-specific keys (e.g. `questId`, `difficulty`) — they cause type errors.

## Pre-existing frontend typecheck errors (do not fix)
- `useReputation.ts` — uses `token` instead of `accessToken` (4 errors)
- `ActivityFeed.tsx` — `Type 'unknown' is not assignable to type 'ReactNode'` (2 errors)
- These predate HUB-12.
