// ─────────────────────────────────────────────────────────────────────────────
// Supabase User Repository
//
// Table: users — actual columns observed in production:
//   id (uuid), username (text), email (text), display_name (text),
//   status (text: "active"|"inactive"|…), created_at, updated_at
//
// Columns absent from DB are filled with sensible defaults so the domain
// model stays consistent regardless of how many optional fields the table has.
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type { IUserRepository } from "../userRepository";
import type { User } from "../../models/user";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function str(v: unknown, fallback = ""): string {
  return (v != null && v !== "") ? String(v) : fallback;
}
function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return isFinite(n) ? n : fallback;
}
function mapStatus(raw: unknown): User["status"] {
  if (raw === "online" || raw === "away" || raw === "offline") return raw;
  return "online";
}

// ─── Row → Domain mapping ─────────────────────────────────────────────────────

function toUser(row: Record<string, unknown>): User {
  console.log("[SupabaseUserRepository] toUser raw row:", JSON.stringify(row));
  return {
    id:              str(row["id"]),
    username:        str(row["username"], "unknown"),
    title:           str(row["display_name"] ?? row["title"], "Universe Member"),
    status:          mapStatus(row["status"]),
    level:           num(row["level"], 1),
    xp:              num(row["xp"], 0),
    maxXp:           num(row["max_xp"], 1000),
    progressPercent: num(row["progress_percent"], 0),
    joinedAt:        str(row["joined_at"] ?? row["created_at"]),
    createdAt:       str(row["created_at"]),
    updatedAt:       str(row["updated_at"]),
  };
}

function toRow(user: User): Record<string, unknown> {
  return {
    id:               user.id,
    username:         user.username,
    title:            user.title,
    status:           user.status,
    level:            user.level,
    xp:               user.xp,
    max_xp:           user.maxXp,
    progress_percent: user.progressPercent,
    joined_at:        user.joinedAt,
    updated_at:       new Date().toISOString(),
  };
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class SupabaseUserRepository implements IUserRepository {
  private get db() { return getSupabaseClient(); }

  async getById(id: string): Promise<User | null> {
    if (!isValidUuid(id)) return null;
    const { data, error } = await this.db
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`SupabaseUserRepository.getById: ${error.message}`);
    return data ? toUser(data) : null;
  }

  async getAll(): Promise<User[]> {
    const { data, error } = await this.db.from("users").select("*");
    if (error) throw new Error(`SupabaseUserRepository.getAll: ${error.message}`);
    return (data ?? []).map(toUser);
  }

  async create(user: User): Promise<User> {
    const now = new Date().toISOString();
    const { data, error } = await this.db
      .from("users")
      .insert({ ...toRow(user), created_at: now, updated_at: now })
      .select()
      .single();
    if (error) throw new Error(`SupabaseUserRepository.create: ${error.message}`);
    return toUser(data);
  }

  async update(user: User): Promise<User | null> {
    const { data, error } = await this.db
      .from("users")
      .update(toRow(user))
      .eq("id", user.id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`SupabaseUserRepository.update: ${error.message}`);
    return data ? toUser(data) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.db.from("users").delete().eq("id", id);
    if (error) throw new Error(`SupabaseUserRepository.delete: ${error.message}`);
    return true;
  }
}
