import { type Request, type Response } from "express";
import { profileService } from "../container";

const MOCK_USER_ID = "72e296a9-cbff-496f-8c9c-65de33c9b930";

export async function handleGetProfile(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = (req.params["userId"] as string | undefined) ?? MOCK_USER_ID;
    console.log("PROFILE USER ID =", userId);
    const profile = await profileService.getProfile(userId);
    res.json({ ok: true, data: profile });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `profileController error: ${msg}`);
    res.status(500).json({
      ok: false,
      error: "Không thể tải hồ sơ người dùng.",
      detail: msg,
    });
  }
}
