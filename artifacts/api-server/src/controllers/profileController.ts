import { type Request, type Response } from "express";
import { profileService, accountBridgeService } from "../container";
import { AccountUnauthorizedError, AccountServiceUnavailableError } from "../services/accountClient";
import { questEventBus } from "../realtime/questEventBus.js";

// Track USER_LOGIN once per userId per UTC day to avoid duplicate quest events
const _loginTracker = new Map<string, string>();
function trackLoginOncePerDay(userId: string): void {
  const today = new Date().toISOString().slice(0, 10);
  if (_loginTracker.get(userId) === today) return;
  _loginTracker.set(userId, today);
  questEventBus.publish({ userId, type: "USER_LOGIN", amount: 1 });
}

async function resolveUserId(req: Request): Promise<string> {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) throw Object.assign(new Error("Chưa xác thực."), { status: 401 });
  const profile = await accountBridgeService.getProfileCached(auth);
  return profile.userId || profile.id;
}

export async function handleGetProfile(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.params["userId"] as string | undefined
      ?? await resolveUserId(req);
    trackLoginOncePerDay(userId);
    const profile = await profileService.getProfile(userId);
    res.json({ ok: true, data: profile });
  } catch (err) {
    if (err instanceof AccountUnauthorizedError || (err as { status?: number }).status === 401) {
      res.status(401).json({ ok: false, error: "Chưa xác thực. Vui lòng đăng nhập." });
      return;
    }
    if (err instanceof AccountServiceUnavailableError) {
      res.status(503).json({ ok: false, error: "Không thể kết nối Account service." });
      return;
    }
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `profileController error: ${msg}`);
    res.status(500).json({
      ok: false,
      error: "Không thể tải hồ sơ người dùng.",
      detail: msg,
    });
  }
}
