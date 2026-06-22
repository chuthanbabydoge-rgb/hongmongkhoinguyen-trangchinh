// ─────────────────────────────────────────────────────────────────────────────
// Supabase client singleton
//
// Import `getSupabaseClient` from this file everywhere a Supabase client is
// needed. The client is lazy-created on first call; calling it without the
// required env vars throws a clear error.
//
// Node.js < 22 has no native WebSocket, so we pass the `ws` package as the
// realtime transport — the official supabase-js workaround for Node 20.
//
// Required env vars (set in Replit Secrets):
//   SUPABASE_URL      — Project URL, e.g. https://xxxx.supabase.co
//   SUPABASE_ANON_KEY — anon / public API key
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_ANON_KEY"];

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_ANON_KEY must be set to use Supabase repositories.",
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
    realtime: { transport: ws as unknown as typeof WebSocket },
  });

  return _client;
}

/** True when Supabase credentials are present in the environment. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_ANON_KEY"]);
}

/**
 * Returns true when `id` is a well-formed UUID (v1–v5).
 * Supabase tables use UUID primary keys; non-UUID IDs (e.g. mock "user-001")
 * would cause a PostgreSQL type error.  Guard every repository read with this
 * before sending a query so callers receive `null` / `[]` instead of an
 * "invalid input syntax for type uuid" error.
 */
export function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
