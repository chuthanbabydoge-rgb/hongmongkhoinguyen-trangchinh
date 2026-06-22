import { type Request, type Response } from "express";
import { getProfile } from "../services/profileService";

const MOCK_USER_ID = "user-001";

export async function handleGetProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.params["userId"] as string | undefined) ?? MOCK_USER_ID;
    const profile = await getProfile(userId);
    res.json({ ok: true, data: profile });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Không thể tải hồ sơ người dùng." });
  }
}
