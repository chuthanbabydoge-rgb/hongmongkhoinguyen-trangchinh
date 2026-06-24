// ─────────────────────────────────────────────────────────────────────────────
// AuthController — proxies login/refresh to Universe Account API
//
// POST /api/auth/login    → { ok, data: { accessToken, refreshToken, expiresIn, user } }
// POST /api/auth/refresh  → { ok, data: { accessToken, expiresIn } }
// POST /api/auth/logout   → { ok: true }
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";

const ACCOUNT_URL = (process.env["UNIVERSE_ACCOUNT_API_URL"] ?? "").replace(/\/$/, "");
const TIMEOUT_MS  = 10_000;

async function proxyPost<T>(path: string, body: unknown): Promise<T> {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${ACCOUNT_URL}${path}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
      signal:  ctrl.signal,
    });
    const text = await res.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { json = { error: text }; }
    if (!res.ok) {
      const msg = (json as Record<string, unknown>)?.["error"] as string | undefined;
      throw Object.assign(new Error(msg ?? `HTTP ${res.status}`), { status: res.status });
    }
    return json as T;
  } finally {
    clearTimeout(timer);
  }
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────

export async function handleRegister(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, username } = req.body as {
      email?: string;
      password?: string;
      username?: string;
    };
    if (!email || !password || !username) {
      res.status(400).json({ ok: false, error: "email, password và username là bắt buộc." });
      return;
    }

    const acct = await proxyPost<{
      user: { id: string; email: string; username: string; createdAt: string };
      tokens: { accessToken: string; refreshToken: string; expiresIn: number };
    }>("/api/auth/register", { email, password, username });

    res.status(201).json({
      ok: true,
      data: {
        accessToken:  acct.tokens.accessToken,
        refreshToken: acct.tokens.refreshToken,
        expiresIn:    acct.tokens.expiresIn,
        user:         acct.user,
      },
    });
  } catch (err) {
    const e = err as Error & { status?: number };
    const status = e.status === 409 ? 409 : e.status === 400 ? 400 : 502;
    res.status(status).json({ ok: false, error: e.message ?? "Đăng ký thất bại." });
  }
}

// ─── POST /api/auth/login ────────────────────────────────────────────────────

export async function handleLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ ok: false, error: "email và password là bắt buộc." });
      return;
    }

    const acct = await proxyPost<{
      user: { id: string; email: string; username: string; createdAt: string };
      tokens: { accessToken: string; refreshToken: string; expiresIn: number };
    }>("/api/auth/login", { email, password });

    res.json({
      ok: true,
      data: {
        accessToken:  acct.tokens.accessToken,
        refreshToken: acct.tokens.refreshToken,
        expiresIn:    acct.tokens.expiresIn,
        user:         acct.user,
      },
    });
  } catch (err) {
    const e = err as Error & { status?: number };
    const status = e.status === 401 ? 401 : 502;
    res.status(status).json({ ok: false, error: e.message ?? "Đăng nhập thất bại." });
  }
}

// ─── POST /api/auth/refresh ──────────────────────────────────────────────────

export async function handleRefresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      res.status(400).json({ ok: false, error: "refreshToken là bắt buộc." });
      return;
    }

    const acct = await proxyPost<{
      tokens: { accessToken: string; expiresIn: number };
    }>("/api/auth/refresh", { refreshToken });

    res.json({
      ok: true,
      data: {
        accessToken: acct.tokens.accessToken,
        expiresIn:   acct.tokens.expiresIn,
      },
    });
  } catch (err) {
    const e = err as Error & { status?: number };
    res.status(401).json({ ok: false, error: e.message ?? "Phiên đăng nhập hết hạn." });
  }
}

// ─── POST /api/auth/logout ───────────────────────────────────────────────────
// HUB-5 Logout Synchronization:
// Forwards the logout to Universe Account API so the session is invalidated
// server-side. Returns ok: true regardless — the client must clear its local
// session even if the Account API call fails.

export async function handleLogout(req: Request, res: Response): Promise<void> {
  if (ACCOUNT_URL) {
    const auth = req.headers["authorization"];
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      await fetch(`${ACCOUNT_URL}/api/auth/logout`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(typeof auth === "string" ? { Authorization: auth } : {}),
        },
        signal: ctrl.signal,
      });
    } catch {
      // Non-fatal — always return ok so the client clears its local session
    } finally {
      clearTimeout(timer);
    }
  }
  res.json({ ok: true });
}
