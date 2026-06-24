// ─────────────────────────────────────────────────────────────────────────────
// requireAuth middleware — HUB-5
//
// Validates that an Authorization: Bearer <token> header is present.
// Attaches the raw header value to req for downstream controllers.
//
// Does NOT verify the token signature locally — token validation happens
// on the Universe Account API when the controller calls accountBridgeService.
// A missing header short-circuits with 401 before any Account API call is made.
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response, type NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ ok: false, code: "UNAUTHORIZED", error: "Authorization header bắt buộc." });
    return;
  }
  next();
}
