---
name: HUB-5 Unified Authentication (SSO)
description: AuthProvider pattern, logout sync, requireAuth middleware, MockUserRepository removal
---

## AuthProvider (universe-hub)
- Canonical file: `artifacts/universe-hub/src/context/AuthContext.tsx`
- Exposes: `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `login()`, `logout()`, `refreshSession()`
- `logout()` is async — calls `POST /api/auth/logout` with Bearer token before clearing localStorage
- `SessionContext.tsx` re-exports `AuthProvider as SessionProvider` and `useAuth as useSession` for backward compat — do NOT delete it
- `App.tsx` uses `AuthProvider` + `useAuth` directly; all child consumers use `useSession` alias

**Why:** Spec required explicit state fields (not nested `session` object) and server-side logout invalidation.

## requireAuth middleware (api-server)
- File: `artifacts/api-server/src/middlewares/requireAuth.ts`
- Applied to: `GET /api/hub/me`, `GET /api/hub/dashboard` in `routes/accountBridge.ts`
- Rejects missing/non-Bearer Authorization with 401 before hitting accountBridgeService
- Token signature validation still happens at Account API level (not locally)

## MockUserRepository removal
- `userRepository.ts` → renamed to `InMemoryUserRepository`, SEED_USERS with user-001 removed (empty store)
- `repositories/index.ts` → exports `InMemoryUserRepository` (not Mock)
- `container.ts` → all three branches (Supabase fallback, Drizzle, Mock) now use `InMemoryUserRepository`
- Remaining `user-001` strings in `data/*.ts`, `mockMarketplaceRepository.ts`, `accountGateway.ts` are marketplace/fallback mock data — not auth path

## Notifications fix (HUB-5)
- `notificationsController.ts` removed `MOCK_USER_ID = "user-001"`; now resolves userId from Bearer token via `accountBridgeService.getProfileCached()`
- Returns empty `{ok:true, data:[], unreadCount:0}` when unauthenticated (graceful degradation, no 401)
- `useAccount.ts` notifications now use `apiFetch<NotifResponse>("/notifications")` — apiFetch unwraps envelope, result shape is `{data, unreadCount}` directly

## Logout sync on api-server
- `authController.handleLogout` → forwards `Authorization` header to `UNIVERSE_ACCOUNT_API_URL/api/auth/logout`
- Fire-and-forget with timeout; always returns `{ok:true}` regardless of upstream result
