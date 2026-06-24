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

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: SessionUser;
}

interface SessionContextValue {
  session: StoredSession | null;
  isAuthenticated: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): void;
  getAccessToken(): string | null;
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

const SESSION_KEY = "universe_hub_session_v1";

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StoredSession;
    return s;
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

// ─── Context ─────────────────────────────────────────────────────────────────

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(loadSession);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── auto-refresh ────────────────────────────────────────────────────────────

  const scheduleRefresh = useCallback((s: StoredSession) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const msUntilExpiry = s.expiresAt - Date.now();
    const delay = Math.max(msUntilExpiry - 60_000, 0); // refresh 60 s before expiry
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ refreshToken: s.refreshToken }),
        });
        const envelope = await res.json() as {
          ok: boolean;
          data?: { accessToken: string; expiresIn: number };
        };
        if (envelope.ok && envelope.data) {
          const updated: StoredSession = {
            ...s,
            accessToken: envelope.data.accessToken,
            expiresAt:   Date.now() + envelope.data.expiresIn * 1000,
          };
          saveSession(updated);
          setSession(updated);
          scheduleRefresh(updated);
        } else {
          setSession(null);
          clearSession();
        }
      } catch {
        setSession(null);
        clearSession();
      }
    }, delay);
  }, []);

  useEffect(() => {
    if (session) scheduleRefresh(session);
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [session, scheduleRefresh]);

  // ── login ───────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const envelope = await res.json() as {
      ok: boolean;
      data?: { accessToken: string; refreshToken: string; expiresIn: number; user: SessionUser };
      error?: string;
    };
    if (!envelope.ok || !envelope.data) {
      throw new Error(envelope.error ?? "Đăng nhập thất bại.");
    }
    const { accessToken, refreshToken, expiresIn, user } = envelope.data;
    const s: StoredSession = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
      user,
    };
    saveSession(s);
    setSession(s);
    scheduleRefresh(s);
  }, [scheduleRefresh]);

  // ── logout ──────────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    clearSession();
    setSession(null);
  }, []);

  // ── getAccessToken ──────────────────────────────────────────────────────────

  const getAccessToken = useCallback((): string | null => {
    const s = loadSession();
    if (!s) return null;
    if (Date.now() > s.expiresAt) return null;
    return s.accessToken;
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ session, isAuthenticated: !!session, login, logout, getAccessToken }),
    [session, login, logout, getAccessToken],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be inside <SessionProvider>");
  return ctx;
}
