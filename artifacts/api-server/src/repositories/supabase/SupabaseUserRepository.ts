// ─────────────────────────────────────────────────────────────────────────────
// Supabase User Repository
//
// Table: users
// Columns (snake_case in DB → camelCase in domain model):
//   id, username, title, status, level, xp, max_xp, progress_percent,
//   joined_at, created_at, updated_at
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase";
import type { IUserRepository } from "../userRepository";
import type { User } from "../../models/user";

// ─── Row → Domain mapping ─────────────────────────────────────────────────────

function toUser(row: Record<string, unknown>): User {
  return {
    id:              row["id"] as string,
    username:        row["username"] as string,
    title:           row["title"] as string,
    status:          row["status"] as User["status"],
    level:           row["level"] as number,
    xp:              row["xp"] as number,
    maxXp:           row["max_xp"] as number,
    progressPercent: row["progress_percent"] as number,
    joinedAt:        row["joined_at"] as string,
    createdAt:       row["created_at"] as string,
    updatedAt:       row["updated_at"] as string,
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
