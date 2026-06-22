import { type Request, type Response } from "express";
import {
  getMarketplace,
  getListings,
  getAuctions,
  getTrades,
} from "../services/marketplaceService";

const MOCK_USER_ID = "user-001";

export async function handleGetMarketplace(_req: Request, res: Response): Promise<void> {
  try {
    const marketplace = await getMarketplace();
    res.json({ ok: true, data: marketplace });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Không thể tải dữ liệu chợ." });
  }
}

export async function handleGetListings(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query["status"] as "active" | "sold" | "cancelled" | "expired" | undefined;
    const listings = await getListings(status);
    res.json({ ok: true, data: listings, total: listings.length });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Không thể tải danh sách niêm yết." });
  }
}

export async function handleGetAuctions(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query["status"] as "live" | "ended" | "cancelled" | undefined;
    const auctions = await getAuctions(status);
    res.json({ ok: true, data: auctions, total: auctions.length });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Không thể tải phiên đấu giá." });
  }
}

export async function handleGetTrades(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.params["userId"] as string | undefined) ?? MOCK_USER_ID;
    const trades = await getTrades(userId);
    res.json({ ok: true, data: trades, total: trades.length });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Không thể tải danh sách trao đổi." });
  }
}
