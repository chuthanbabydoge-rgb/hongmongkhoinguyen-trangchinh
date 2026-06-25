import { type Request, type Response } from "express";
import { socialService, accountBridgeService, userReputationService, achievementService } from "../container.js";
import { SocialError } from "../services/socialService.js";
import type { PresenceStatus } from "../repositories/socialRepository.js";

const VALID_PRESENCE: PresenceStatus[] = ["ONLINE", "AWAY", "OFFLINE"];

async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) return null;
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    return (profile as { userId?: string; id?: string }).userId
      || (profile as { userId?: string; id?: string }).id
      || null;
  } catch {
    return null;
  }
}

function handleError(err: unknown, res: Response): void {
  if (err instanceof SocialError) {
    res.status(err.status).json({ ok: false, code: err.code, error: err.message });
    return;
  }
  const msg = err instanceof Error ? err.message : String(err);
  res.status(500).json({ ok: false, error: msg });
}

// ── Friend requests ──────────────────────────────────────────────────────────

export async function handleSendFriendRequest(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const { toUserId } = req.body as { toUserId?: string };
    if (!toUserId?.trim()) {
      res.status(400).json({ ok: false, error: "toUserId là bắt buộc." });
      return;
    }

    const request = await socialService.sendFriendRequest(userId, toUserId.trim());
    res.status(201).json({ ok: true, data: request });
  } catch (err) { handleError(err, res); }
}

export async function handleAcceptFriendRequest(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const { id } = req.params as { id: string };
    const request = await socialService.acceptFriendRequest(id, userId);
    res.json({ ok: true, data: request });
  } catch (err) { handleError(err, res); }
}

export async function handleDeclineFriendRequest(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const { id } = req.params as { id: string };
    const request = await socialService.declineFriendRequest(id, userId);
    res.json({ ok: true, data: request });
  } catch (err) { handleError(err, res); }
}

export async function handleGetFriends(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const friends = await socialService.getFriends(userId);
    res.json({ ok: true, data: friends, total: friends.length });
  } catch (err) { handleError(err, res); }
}

export async function handleGetPendingRequests(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const requests = await socialService.getPendingRequests(userId);
    res.json({ ok: true, data: requests, total: requests.length });
  } catch (err) { handleError(err, res); }
}

export async function handleGetSentRequests(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const requests = await socialService.getSentRequests(userId);
    res.json({ ok: true, data: requests, total: requests.length });
  } catch (err) { handleError(err, res); }
}

// ── Follow system ────────────────────────────────────────────────────────────

export async function handleFollowUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const { userId: targetId } = req.params as { userId: string };
    const rel = await socialService.followUser(userId, targetId);
    res.status(201).json({ ok: true, data: rel });
  } catch (err) { handleError(err, res); }
}

export async function handleUnfollowUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const { userId: targetId } = req.params as { userId: string };
    await socialService.unfollowUser(userId, targetId);
    res.json({ ok: true, data: { unfollowed: true } });
  } catch (err) { handleError(err, res); }
}

export async function handleGetFollowers(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const followers = await socialService.getFollowers(userId);
    res.json({ ok: true, data: followers, total: followers.length });
  } catch (err) { handleError(err, res); }
}

export async function handleGetFollowing(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const following = await socialService.getFollowing(userId);
    res.json({ ok: true, data: following, total: following.length });
  } catch (err) { handleError(err, res); }
}

// ── Profiles ─────────────────────────────────────────────────────────────────

async function buildFullProfile(userId: string, displayName: string, avatarUrl: string | null) {
  const [counts, presence, rep, achievements] = await Promise.allSettled([
    socialService.getSocialCounts(userId),
    socialService.getPresence(userId),
    userReputationService.getReputation(userId),
    achievementService.getUserAchievements(userId),
  ]);

  const countsData = counts.status === "fulfilled" ? counts.value : { friends: 0, followers: 0, following: 0, onlineFriends: 0 };
  const presenceData = presence.status === "fulfilled" ? presence.value : null;
  const repData = rep.status === "fulfilled" ? { totalPoints: rep.value.totalPoints, level: rep.value.level } : null;
  const achievementsData = achievements.status === "fulfilled"
    ? achievements.value.map((ua: { achievement?: { key?: string; title?: string; icon?: string }; achievementKey: string; unlockedAt: string }) => ({
        key:   ua.achievement?.key   ?? ua.achievementKey,
        title: ua.achievement?.title ?? ua.achievementKey,
        icon:  ua.achievement?.icon  ?? "",
        unlockedAt: ua.unlockedAt,
      }))
    : [];

  return {
    userId,
    displayName,
    avatarUrl,
    ...countsData,
    presence:     presenceData?.status ?? "OFFLINE" as PresenceStatus,
    reputation:   repData,
    achievements: achievementsData,
  };
}

export async function handleGetMyProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const auth = req.headers["authorization"] as string;
    let displayName = userId;
    let avatarUrl: string | null = null;
    try {
      const profile = await accountBridgeService.getProfileCached(auth);
      const p = profile as { displayName?: string; username?: string; avatarUrl?: string; avatar?: { url?: string } };
      displayName = p.displayName ?? p.username ?? userId;
      avatarUrl   = p.avatarUrl ?? p.avatar?.url ?? null;
    } catch { /* ignore — use defaults */ }

    await socialService.syncPublicProfile(userId, displayName, avatarUrl);

    const data = await buildFullProfile(userId, displayName, avatarUrl);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

export async function handleGetPublicProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const { userId: targetId } = req.params as { userId: string };
    const profile = await socialService.getPublicProfile(targetId);

    if (!profile) {
      res.status(404).json({ ok: false, error: "Hồ sơ không tìm thấy." });
      return;
    }

    const data = await buildFullProfile(targetId, profile.displayName, profile.avatarUrl);
    res.json({ ok: true, data });
  } catch (err) { handleError(err, res); }
}

// ── Search ───────────────────────────────────────────────────────────────────

export async function handleSearchUsers(req: Request, res: Response): Promise<void> {
  try {
    const q     = (req.query["q"] as string | undefined) ?? "";
    const limit = req.query["limit"] ? Math.min(Number(req.query["limit"]), 50) : 20;

    const results = await socialService.searchUsers(q, limit);
    res.json({ ok: true, data: results, total: results.length });
  } catch (err) { handleError(err, res); }
}

// ── Presence ─────────────────────────────────────────────────────────────────

export async function handleSetPresence(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const { status } = req.body as { status?: string };
    if (!status || !VALID_PRESENCE.includes(status as PresenceStatus)) {
      res.status(400).json({ ok: false, error: `status phải là: ${VALID_PRESENCE.join(", ")}.` });
      return;
    }

    const presence = await socialService.setPresence(userId, status as PresenceStatus);
    res.json({ ok: true, data: presence });
  } catch (err) { handleError(err, res); }
}

export async function handleGetPresence(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params as { userId: string };
    const presence = await socialService.getPresence(userId);

    res.json({
      ok: true,
      data: presence ?? { userId, status: "OFFLINE", lastSeenAt: null, updatedAt: null },
    });
  } catch (err) { handleError(err, res); }
}

// ── Social counts (for dashboard widget) ─────────────────────────────────────

export async function handleGetSocialCounts(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }

    const counts = await socialService.getSocialCounts(userId);
    res.json({ ok: true, data: counts });
  } catch (err) { handleError(err, res); }
}
