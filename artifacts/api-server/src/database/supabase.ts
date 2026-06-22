// ─────────────────────────────────────────────────────────────────────────────
// Supabase client singleton
//
// Import `supabase` from this file everywhere a Supabase client is needed.
// The client is lazy-validated: it is only created if both env vars are present.
// Calling `getSupabaseClient()` in an environment without the vars throws a
// clear error rather than silently returning a broken client.
//
// Required env vars (set in Replit Secrets):
//   SUPABASE_URL      — Project URL, e.g. https://xxxx.supabase.co
//   SUPABASE_ANON_KEY — anon / public API key
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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
  });

  return _client;
}

/** True when Supabase credentials are present in the environment. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_ANON_KEY"]);
}
