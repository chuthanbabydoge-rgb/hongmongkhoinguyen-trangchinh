// ─────────────────────────────────────────────────────────────────────────────
// Supabase Avatar Repository
//
// Table: avatars — actual columns observed in production:
//   id (uuid pk), user_id (uuid), avatar_name (text), avatar_image (text|null),
//   title (text|null), level (int), experience (int), metadata (jsonb),
//   created_at (timestamptz), updated_at (timestamptz)
//
// Domain Avatar fields without a direct DB column are derived:
//   initials   ← computed from avatar_name (first letter of each word, max 2)
//   frameColor ← metadata.frameColor   (default "#7c3aed")
//   badgeIcon  ← metadata.badgeIcon    (default null)
//   imageUrl   ← avatar_image
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient, isValidUuid } from "../../database/supabase";
import type { IAvatarRepository } from "../avatarRepository";
import type { Avatar } from "../../models/user";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

function toAvatar(row: Record<string, unknown>): Avatar {
  const meta = (row["metadata"] ?? {}) as Record<string, unknown>;
  const name  = String(row["avatar_name"] ?? "");
  console.log("[SupabaseAvatarRepository] toAvatar raw row:", JSON.stringify(row));
  return {
    userId:     String(row["user_id"] ?? ""),
    initials:   computeInitials(name),
    imageUrl:   row["avatar_image"] != null ? String(row["avatar_image"]) : null,
    frameColor: String(meta["frameColor"] ?? "#7c3aed"),
    badgeIcon:  meta["badgeIcon"] != null ? String(meta["badgeIcon"]) : null,
    updatedAt:  String(row["updated_at"] ?? ""),
  };
}

function toRow(avatar: Avatar): Record<string, unknown> {
  return {
    user_id:      avatar.userId,
    avatar_name:  avatar.initials,
    avatar_image: avatar.imageUrl,
    metadata: {
      frameColor: avatar.frameColor,
      badgeIcon:  avatar.badgeIcon,
    },
    updated_at: new Date().toISOString(),
  };
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class SupabaseAvatarRepository implements IAvatarRepository {
  private get db() { return getSupabaseClient(); }

  async getByUserId(userId: string): Promise<Avatar | null> {
    if (!isValidUuid(userId)) return null;
    const { data, error } = await this.db
      .from("avatars")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(`SupabaseAvatarRepository.getByUserId: ${error.message}`);
    return data ? toAvatar(data) : null;
  }

  async create(avatar: Avatar): Promise<Avatar> {
    const now = new Date().toISOString();
    const { data, error } = await this.db
      .from("avatars")
      .insert({ ...toRow(avatar), created_at: now })
      .select()
      .single();
    if (error) throw new Error(`SupabaseAvatarRepository.create: ${error.message}`);
    return toAvatar(data);
  }

  async update(avatar: Avatar): Promise<Avatar | null> {
    const { data, error } = await this.db
      .from("avatars")
      .update(toRow(avatar))
      .eq("user_id", avatar.userId)
      .select()
      .maybeSingle();
    if (error) throw new Error(`SupabaseAvatarRepository.update: ${error.message}`);
    return data ? toAvatar(data) : null;
  }

  async delete(userId: string): Promise<boolean> {
    const { error } = await this.db.from("avatars").delete().eq("user_id", userId);
    if (error) throw new Error(`SupabaseAvatarRepository.delete: ${error.message}`);
    return true;
  }
}
