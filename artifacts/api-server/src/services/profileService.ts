// ─────────────────────────────────────────────────────────────────────────────
// Profile service
// Swap the return values with DB queries when integrating a database.
// Example: return await db.query.users.findFirst({ where: eq(users.id, userId) });
// ─────────────────────────────────────────────────────────────────────────────

import { PROFILE, type ProfileData } from "../data/profileData";

export async function getProfile(_userId: string): Promise<ProfileData> {
  return PROFILE;
}
