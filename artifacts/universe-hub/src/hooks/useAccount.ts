import { useEffect, useState } from "react";
import {
  accountService,
  type UserProfile,
  type UserAvatar,
  type UserLevel,
  type UserReputation,
  type Notification,
} from "@/services/accountService";

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

const INITIAL_STATE: AccountState = {
  profile: null,
  avatar: null,
  level: null,
  reputation: null,
  notifications: [],
  unreadCount: 0,
  loading: true,
  error: null,
};

export function useAccount(): AccountState {
  const [state, setState] = useState<AccountState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [profile, avatar, level, reputation, notifications] =
          await Promise.all([
            accountService.getUserProfile(),
            accountService.getUserAvatar(),
            accountService.getUserLevel(),
            accountService.getUserReputation(),
            accountService.getNotifications(),
          ]);

        if (cancelled) return;

        setState({
          profile,
          avatar,
          level,
          reputation,
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error
              ? err.message
              : "Không thể tải thông tin tài khoản.",
        }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
