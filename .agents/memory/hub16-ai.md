---
name: HUB-16 AI system (Nova)
description: Universe AI Companion "Nova" — architecture decisions, seeding gotchas, and typecheck fixes
---

## App Registry seeding
`SEED_APPS` in `artifacts/api-server/src/services/appRegistryService.ts` is the ONLY correct place to add new app slugs. `appRegistryService.registerApp(...)` in `container.ts` silently fails for any relative URL (e.g. `/ai`) because `isValidUrl()` requires a full HTTP URL. Always use `${REPLIT_HUB_URL}/ai` pattern from SEED_APPS.

**Why:** `isValidUrl` wraps `new URL(value)` which throws on relative paths. The `.catch(() => {})` swallows the error silently.

**How to apply:** When a new HUB sprint needs to seed an app, add it to `SEED_APPS` array, not via `registerApp()` in container.ts.

## DrizzleAiRepository — lastMessageAt null guard
`lastMessageAt` in AiConversation model is `string | null`. When setting it back in `.set()`, guard against null before `new Date()`:
```ts
set["lastMessageAt"] = updates.lastMessageAt !== null ? new Date(updates.lastMessageAt) : null;
```
`new Date(null)` has no valid TS overload.

## container.ts category must match APP_CATEGORIES
`APP_CATEGORIES` = `["SPORT","ANIMAL","WORLD","FINANCE","SECURITY","SOCIAL","AI","UTILITY","OTHER"]`. There is no "METAVERSE". Use "WORLD" for world-related apps.

## DB tables (10 tables)
`ai_conversations`, `ai_messages`, `ai_memories`, `ai_suggestions`, `ai_usage_logs`, `ai_feedback`, `ai_personality`, `ai_prompt_templates`, `ai_sessions`, `ai_context_cache`

## API routes (16 endpoints)
- `GET  /api/ai` and `GET /api/ai/status` — public, returns `{ name, version, status, codename: "Nova" }`
- `GET  /api/ai/dashboard` — requireAuth
- `GET/POST /api/ai/conversations` — requireAuth
- `GET/DELETE /api/ai/conversations/:id` — requireAuth
- `GET  /api/ai/messages/:conversationId` — requireAuth
- `POST /api/ai/chat` — requireAuth
- `GET/POST /api/ai/memory`, `DELETE /api/ai/memory/:id` — requireAuth
- `GET /api/ai/suggestions`, `DELETE /api/ai/suggestions/:id`, `POST /api/ai/suggestions/generate` — requireAuth
- `POST /api/ai/feedback` — requireAuth

## AI provider selection
`OPENAI_API_KEY` → OpenAI, `GEMINI_API_KEY`/`GOOGLE_AI_API_KEY` → Gemini, otherwise MockProvider (logs "Container: AI provider → mock").

## Frontend pages
`artifacts/universe-hub/src/pages/ai/`: AiDashboard, AiChat, AiMemory, AiSuggestions, AiSettings. Hook: `useAi.ts`. Sidebar entry included.
