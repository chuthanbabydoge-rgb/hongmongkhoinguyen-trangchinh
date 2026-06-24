import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useSession } from "@/context/SessionContext";
import type {
  ProfileDTO,
  AvatarDTO,
  ReputationDTO,
} from "@/services/accountBridgeTypes";

export interface UserProfile {
  id: string;
  username: string;
  title: string;
  status: "online" | "away" | "offline";
  level: number;
  xp: number;
  maxXp: number;
  progressPercent: number;
  reputation: number;
  joinedAt: string;
}

export interface UserAvatar {
  userId: string;
  initials: string;
  imageUrl: string | null;
  frameColor: string;
  badgeIcon: string | null;
}

export interface UserLevel {
  current: number;
  xp: number;
  maxXp: number;
  progressPercent: number;
  rank: string;
}

export interface UserReputation {
  score: number;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  upvotes: number;
  downvotes: number;
  badges: string[];
}

export type NotificationType = "reward" | "transaction" | "system" | "social" | "marketplace";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AccountState {
  profile: UserProfile | null;
  avatar: UserAvatar | null;
  level: UserLevel | null;
  reputation: UserReputation | null;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

// ─── DTO → frontend type mappers ──────────────────────────────────────────────

function reputationLevelToTier(level: string): UserReputation["tier"] {
  const l = level.toLowerCase();
  if (l.includes("diamond") || l.includes("kim cương")) return "diamond";
  if (l.includes("platinum") || l.includes("bạch kim"))  return "platinum";
  if (l.includes("gold") || l.includes("vàng") || l.includes("ưu tú")) return "gold";
  if (l.includes("silver") || l.includes("bạc"))          return "silver";
  return "bronze";
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function mapProfile(p: ProfileDTO, r: ReputationDTO): UserProfile {
  const name = p.displayName ?? p.username;
  return {
    id:              p.userId ?? p.id,
    username:        name,
    title:           "Universe Member",
    status:          "online",
    level:           r.score > 0 ? Math.floor(r.score / 10) : 1,
    xp:              r.score,
    maxXp:           Math.ceil((r.score + 1) / 100) * 100,
    progressPercent: r.score % 100,
    reputation:      r.score,
    joinedAt:        p.createdAt,
  };
}

function mapAvatar(p: ProfileDTO, a: AvatarDTO): UserAvatar {
  const name = p.displayName ?? p.username;
  return {
    userId:    p.userId ?? p.id,
    initials:  initials(a.avatarName || name),
    imageUrl:  a.avatarUrl ?? p.avatarUrl ?? null,
    frameColor: a.frame || "#7c3aed",
    badgeIcon:  a.accessories?.[0] ?? null,
  };
}

function mapLevel(a: AvatarDTO, r: ReputationDTO): UserLevel {
  return {
    current:         r.score > 0 ? Math.floor(r.score / 10) : 1,
    xp:              r.score,
    maxXp:           Math.ceil((r.score + 1) / 100) * 100,
    progressPercent: r.score % 100,
    rank:            a.title || r.level || "Member",
  };
}

function mapReputation(r: ReputationDTO): UserReputation {
  return {
    score:    r.score,
    tier:     reputationLevelToTier(r.level),
    upvotes:  r.positiveEvents,
    downvotes: r.negativeEvents,
    badges:   r.badge ? [r.badge] : [],
  };
}

// ─── Hub /me response shape ───────────────────────────────────────────────────

interface HubMeResponse {
  profile:    ProfileDTO;
  avatar:     AvatarDTO;
  reputation: ReputationDTO;
  settings:   unknown;
}

interface ApiNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// apiFetch unwraps { ok, data } envelope → returns envelope.data directly,
// which for GET /api/notifications is ApiNotification[] (the array itself).
type NotifArray = ApiNotification[];

// ─── Hook ─────────────────────────────────────────────────────────────────────

const INITIAL_STATE: AccountState = {
  profile:      null,
  avatar:       null,
  level:        null,
  reputation:   null,
  notifications: [],
  unreadCount:  0,
  loading:      true,
  error:        null,
};

export function useAccount(): AccountState {
  const { isAuthenticated } = useSession();
  const [state, setState]   = useState<AccountState>(INITIAL_STATE);

  useEffect(() => {
    if (!isAuthenticated) {
      setState({ ...INITIAL_STATE, loading: false });
      return;
    }

    let cancelled = false;

    async function load() {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const [me, notifArray] = await Promise.all([
          apiFetch<HubMeResponse>("/hub/me"),
          // apiFetch unwraps envelope.data → returns ApiNotification[] directly
          apiFetch<NotifArray>("/notifications").catch(() => [] as NotifArray),
        ]);

        if (cancelled) return;

        const { profile: p, avatar: a, reputation: r } = me;

        const notifications: Notification[] = (notifArray ?? []).map(n => ({
          id:        n.id,
          type:      n.type,
          title:     n.title,
          message:   n.message,
          isRead:    n.isRead,
          createdAt: n.createdAt,
        })).sort((x, y) => Number(x.isRead) - Number(y.isRead));

        setState({
          profile:       mapProfile(p, r),
          avatar:        mapAvatar(p, a),
          level:         mapLevel(a, r),
          reputation:    mapReputation(r),
          notifications,
          unreadCount:   notifications.filter(n => !n.isRead).length,
          loading:       false,
          error:         null,
        });
      } catch (err) {
        if (cancelled) return;
        setState(prev => ({
          ...prev,
          loading: false,
          error:   err instanceof Error ? err.message : "Không thể tải thông tin tài khoản.",
        }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  return state;
}
