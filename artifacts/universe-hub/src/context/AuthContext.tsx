// ─────────────────────────────────────────────────────────────────────────────
// AuthContext — HUB-5 Unified Authentication (SSO)
//
// Single source of truth for authentication state across Universe Hub.
//
// State:   user · accessToken · refreshToken · isAuthenticated
// Methods: login() · logout() · refreshSession()
//
// logout() calls /api/auth/logout on the server to invalidate the Account
// session before clearing local storage — satisfying "Logout Synchronization".
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

/** @internal stored in localStorage */
interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

export interface AuthContextValue {
  // State
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Methods
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  refreshSession(): Promise<void>;

  // Legacy helpers (kept for backward compat — prefer the fields above)
  getAccessToken(): string | null;
  /** @deprecated use the individual fields instead */
  session: StoredSession | null;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const SESSION_KEY = "universe_hub_session_v1";

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function saveSession(s: StoredSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(loadSession);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived state ─────────────────────────────────────────────────────────

  const user         = session?.user         ?? null;
  const accessToken  = session?.accessToken  ?? null;
  const refreshToken = session?.refreshToken ?? null;
  const isAuthenticated = !!session;

  // ── refreshSession ────────────────────────────────────────────────────────

  const refreshSession = useCallback(async (): Promise<void> => {
    const current = loadSession();
    if (!current?.refreshToken) {
      setSession(null);
      clearSession();
      return;
    }
    const res = await fetch("/api/auth/refresh", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken: current.refreshToken }),
    });
    const envelope = await res.json() as {
      ok: boolean;
      data?: { accessToken: string; expiresIn: number };
    };
    if (envelope.ok && envelope.data) {
      const updated: StoredSession = {
        ...current,
        accessToken: envelope.data.accessToken,
        expiresAt:   Date.now() + envelope.data.expiresIn * 1000,
      };
      saveSession(updated);
      setSession(updated);
    } else {
      setSession(null);
      clearSession();
    }
  }, []);

  // ── Auto-refresh timer ────────────────────────────────────────────────────

  const scheduleRefresh = useCallback((s: StoredSession) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const msUntilExpiry = s.expiresAt - Date.now();
    const delay = Math.max(msUntilExpiry - 60_000, 0); // 60 s before expiry
    refreshTimerRef.current = setTimeout(async () => {
      try {
        await refreshSession();
      } catch {
        setSession(null);
        clearSession();
      }
    }, delay);
  }, [refreshSession]);

  useEffect(() => {
    if (session) scheduleRefresh(session);
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [session, scheduleRefresh]);

  // ── login ─────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const res = await fetch("/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const envelope = await res.json() as {
      ok: boolean;
      data?: { accessToken: string; refreshToken: string; expiresIn: number; user: AuthUser };
      error?: string;
    };
    if (!envelope.ok || !envelope.data) {
      throw new Error(envelope.error ?? "Đăng nhập thất bại.");
    }
    const { accessToken: at, refreshToken: rt, expiresIn, user: u } = envelope.data;
    const s: StoredSession = {
      accessToken:  at,
      refreshToken: rt,
      expiresAt:    Date.now() + expiresIn * 1000,
      user:         u,
    };
    saveSession(s);
    setSession(s);
    scheduleRefresh(s);
  }, [scheduleRefresh]);

  // ── logout ────────────────────────────────────────────────────────────────
  // Invalidates the Account session on the server first, then clears locally.

  const logout = useCallback(async (): Promise<void> => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    // Fire-and-forget server logout — clear local state regardless of result
    const token = session?.accessToken;
    try {
      await fetch("/api/auth/logout", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // Network error is non-fatal — session cleared below
    }

    clearSession();
    setSession(null);
  }, [session]);

  // ── getAccessToken (legacy) ───────────────────────────────────────────────

  const getAccessToken = useCallback((): string | null => {
    const s = loadSession();
    if (!s) return null;
    if (Date.now() > s.expiresAt) return null;
    return s.accessToken;
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      login,
      logout,
      refreshSession,
      getAccessToken,
      session, // legacy
    }),
    [user, accessToken, refreshToken, isAuthenticated, login, logout, refreshSession, getAccessToken, session],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
