// ─────────────────────────────────────────────────────────────────────────────
// AuthController — proxies auth to Universe Account API
//
// Hub không tự tạo user. Mọi auth đều đi qua Universe Account:
//
// POST /api/auth/login        → { ok, data: { accessToken, refreshToken, expiresIn, user } }
// POST /api/auth/refresh      → { ok, data: { accessToken, expiresIn } }
// POST /api/auth/logout       → { ok: true }
// GET  /api/auth/sso/validate → { ok, data: { user, token } }  — SSO token validation
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { socialService, accountBridgeService } from "../container.js";

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

    socialService.setPresence(acct.user.id, "ONLINE").catch(() => {});
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
// Forwards logout to Universe Account API — invalidates the server-side session.
// Returns ok: true regardless so the client always clears its local session.

export async function handleLogout(req: Request, res: Response): Promise<void> {
  const auth = req.headers["authorization"];

  if (typeof auth === "string") {
    accountBridgeService.getProfileCached(auth)
      .then((profile) => {
        const userId = (profile as { userId?: string; id?: string }).userId
          || (profile as { userId?: string; id?: string }).id;
        if (userId) socialService.setPresence(userId, "OFFLINE").catch(() => {});
      })
      .catch(() => {});
  }

  if (ACCOUNT_URL) {
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

// ─── GET /api/auth/sso/validate ──────────────────────────────────────────────
// SSO token validation endpoint — called by external apps to verify a hub_token.
//
// Flow:
//   1. External app receives ?hub_token=<token> in its URL
//   2. External app calls GET /api/auth/sso/validate with Authorization: Bearer <token>
//   3. Hub forwards to Account API /api/auth/me to verify the token
//   4. Returns user profile so external app can create its own session
//
// Returns: { ok: true, data: { user: { id, email, username }, token } }

export async function handleSsoValidate(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers["authorization"];
  const queryToken = typeof req.query["token"] === "string" ? req.query["token"] : null;

  let token: string | null = null;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    res.status(401).json({ ok: false, error: "Token không hợp lệ." });
    return;
  }

  if (!ACCOUNT_URL) {
    res.status(503).json({ ok: false, error: "Account service chưa được cấu hình." });
    return;
  }

  try {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let meRes: Response | globalThis.Response;
    try {
      meRes = await fetch(`${ACCOUNT_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal:  ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!meRes.ok) {
      res.status(401).json({ ok: false, error: "Token hết hạn hoặc không hợp lệ." });
      return;
    }

    const profile = await (meRes as globalThis.Response).json() as unknown;
    const raw  = profile as Record<string, unknown>;
    const user = (raw["user"] ?? raw["data"] ?? raw) as Record<string, unknown>;

    res.json({
      ok:   true,
      data: {
        user: {
          id:       user["id"]       ?? user["userId"],
          email:    user["email"],
          username: user["username"] ?? user["name"],
        },
        token,
      },
    });
  } catch (err) {
    const e = err as Error;
    const isTimeout = e.name === "AbortError";
    res.status(isTimeout ? 504 : 502).json({
      ok:    false,
      error: isTimeout ? "Account service timeout." : "Không thể xác thực token.",
    });
  }
}
