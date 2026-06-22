// ─────────────────────────────────────────────────────────────────────────────
// Supabase Avatar Repository
//
// Table: avatars
// Columns:
//   user_id, initials, image_url, frame_color, badge_icon, updated_at
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseClient } from "../../database/supabase";
import type { IAvatarRepository } from "../avatarRepository";
import type { Avatar } from "../../models/user";

// ─── Row → Domain mapping ─────────────────────────────────────────────────────

function toAvatar(row: Record<string, unknown>): Avatar {
  return {
    userId:    row["user_id"] as string,
    initials:  row["initials"] as string,
    imageUrl:  (row["image_url"] as string | null) ?? null,
    frameColor: row["frame_color"] as string,
    badgeIcon: (row["badge_icon"] as string | null) ?? null,
    updatedAt: row["updated_at"] as string,
  };
}

function toRow(avatar: Avatar): Record<string, unknown> {
  return {
    user_id:    avatar.userId,
    initials:   avatar.initials,
    image_url:  avatar.imageUrl,
    frame_color: avatar.frameColor,
    badge_icon: avatar.badgeIcon,
    updated_at: new Date().toISOString(),
  };
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class SupabaseAvatarRepository implements IAvatarRepository {
  private get db() { return getSupabaseClient(); }

  async getByUserId(userId: string): Promise<Avatar | null> {
    const { data, error } = await this.db
      .from("avatars")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(`SupabaseAvatarRepository.getByUserId: ${error.message}`);
    return data ? toAvatar(data) : null;
  }

  async create(avatar: Avatar): Promise<Avatar> {
    const { data, error } = await this.db
      .from("avatars")
      .insert(toRow(avatar))
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
