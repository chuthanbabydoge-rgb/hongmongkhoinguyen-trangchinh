---
name: HUB-4.2 Auth userId pattern
description: How controllers resolve the current user's ID — never hardcode, always use the Bearer token via accountBridgeService.
---

## Rule
Never hardcode `"user-001"` or any fixed user ID in controllers. Always extract the userId from the incoming Authorization header.

## Pattern (copy into any new controller)
```typescript
async function resolveUserId(req: Request): Promise<string> {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) throw Object.assign(new Error("Chưa xác thực."), { status: 401 });
  const profile = await accountBridgeService.getProfileCached(auth);
  return profile.userId || profile.id;
}
```

**Why:** HUB-4.2 requirement — all dashboard endpoints must serve live per-user data. Hardcoded IDs were shared across all users and impossible to test with real auth.

**How to apply:** Import `accountBridgeService` from `container.ts`. Call `resolveUserId(req)` at the top of any handler that needs the current user. Return 401 if no token. The result is the userId from the Universe Account service.

## Remaining controllers with user-001 (out of HUB-4.2 scope)
- `marketplaceController.ts` — buyer/seller IDs fall back to user-001
- `notificationsController.ts` — userId param falls back to user-001
- `appLauncherController.ts` — x-user-id header falls back to user-001
- `notificationSyncController.ts` — x-user-id header falls back to user-001
- `marketplaceRecommendationController.ts` — userId query param falls back to user-001

These are outside the dashboard scope and should be cleaned up in a future sprint.
