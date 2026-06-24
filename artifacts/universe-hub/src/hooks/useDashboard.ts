import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useSession } from "@/context/SessionContext";
import type {
  ProfileDTO,
  AvatarDTO,
  ReputationDTO,
  WalletSnapshot,
  InventorySnapshot,
} from "@/services/accountBridgeTypes";

export interface DashboardProfile {
  id: string;
  username: string;
  title: string;
  level: number;
  xp: number;
  maxXp: number;
  progressPercent: number;
  reputation: number;
  reputationTier: string;
}

export interface DashboardAvatar {
  initials: string;
  imageUrl: string | null;
  frameColor: string;
  badgeIcon: string | null;
}

export interface DashboardState {
  profile:      DashboardProfile | null;
  avatar:       DashboardAvatar | null;
  wallet:       WalletSnapshot | null;
  inventory:    InventorySnapshot | null;
  reputation:   ReputationDTO | null;
  achievementCount: number;
  loading:      boolean;
  error:        string | null;
}

interface HubDashboardApiResponse {
  profile:             ProfileDTO;
  avatar:              AvatarDTO;
  reputation:          ReputationDTO;
  achievementCount:    number;
  unreadNotifications: number;
  wallet:              WalletSnapshot;
  inventory:           InventorySnapshot;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function mapProfile(p: ProfileDTO, r: ReputationDTO): DashboardProfile {
  const name  = p.displayName ?? p.username;
  const score = r.score ?? 0;
  return {
    id:              p.userId ?? p.id,
    username:        name,
    title:           r.level || "Universe Member",
    level:           score > 0 ? Math.floor(score / 10) : 1,
    xp:              score,
    maxXp:           Math.ceil((score + 1) / 100) * 100,
    progressPercent: score % 100,
    reputation:      score,
    reputationTier:  r.badge || r.level || "bronze",
  };
}

function mapAvatar(p: ProfileDTO, a: AvatarDTO): DashboardAvatar {
  const name = p.displayName ?? p.username;
  return {
    initials:   initials(a.avatarName || name),
    imageUrl:   a.avatarUrl ?? p.avatarUrl ?? null,
    frameColor: a.frame || "#7c3aed",
    badgeIcon:  a.accessories?.[0] ?? null,
  };
}

const INITIAL: DashboardState = {
  profile:          null,
  avatar:           null,
  wallet:           null,
  inventory:        null,
  reputation:       null,
  achievementCount: 0,
  loading:          true,
  error:            null,
};

export function useDashboard(): DashboardState {
  const { isAuthenticated } = useSession();
  const [state, setState]   = useState<DashboardState>(INITIAL);

  useEffect(() => {
    if (!isAuthenticated) {
      setState({ ...INITIAL, loading: false });
      return;
    }

    let cancelled = false;

    async function load() {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const data = await apiFetch<HubDashboardApiResponse>("/hub/dashboard");
        if (cancelled) return;

        setState({
          profile:          mapProfile(data.profile, data.reputation),
          avatar:           mapAvatar(data.profile, data.avatar),
          wallet:           data.wallet,
          inventory:        data.inventory,
          reputation:       data.reputation,
          achievementCount: data.achievementCount,
          loading:          false,
          error:            null,
        });
      } catch (err) {
        if (cancelled) return;
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Không thể tải dữ liệu dashboard.",
        }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  return state;
}
