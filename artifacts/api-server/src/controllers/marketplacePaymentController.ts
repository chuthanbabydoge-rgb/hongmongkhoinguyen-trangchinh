// ─────────────────────────────────────────────────────────────────────────────
// MarketplacePaymentController
//
// Exposes payment history for the wallet and marketplace UI.
//
// Routes (registered in routes/marketplace.ts):
//   GET /api/marketplace/payments        — paginated list with filters
//   GET /api/marketplace/payments/:id    — single payment record
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { marketplacePaymentService }   from "../container";
import type { MarketplaceCurrency }    from "../repositories/marketplaceRepository";
import type { PaymentSourceType }      from "../repositories/marketplacePaymentRepository";

const VALID_CURRENCIES:    MarketplaceCurrency[] = ["credits", "stars", "eth"];
const VALID_SOURCE_TYPES:  PaymentSourceType[]   = ["listing", "auction"];

// ─── GET /api/marketplace/payments ───────────────────────────────────────────

export async function handleGetPayments(req: Request, res: Response): Promise<void> {
  try {
    const rawUserId     = req.query["userId"]     as string | undefined;
    const rawCurrency   = req.query["currency"]   as string | undefined;
    const rawSourceType = req.query["sourceType"] as string | undefined;
    const limit         = req.query["limit"]  ? Math.max(1, Number(req.query["limit"]))  : 50;
    const offset        = req.query["offset"] ? Math.max(0, Number(req.query["offset"])) : 0;

    const currency   = rawCurrency   && VALID_CURRENCIES.includes(rawCurrency as MarketplaceCurrency)
      ? (rawCurrency   as MarketplaceCurrency)
      : undefined;
    const sourceType = rawSourceType && VALID_SOURCE_TYPES.includes(rawSourceType as PaymentSourceType)
      ? (rawSourceType as PaymentSourceType)
      : undefined;

    const result = await marketplacePaymentService.getPayments({
      userId: rawUserId,
      currency,
      sourceType,
      limit,
      offset,
    });

    res.json({ ok: true, total: result.total, data: result.data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplacePaymentController.getPayments: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải lịch sử thanh toán." });
  }
}

// ─── GET /api/marketplace/payments/:id ───────────────────────────────────────

export async function handleGetPayment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const payment = await marketplacePaymentService.getPaymentById(id);

    if (!payment) {
      res.status(404).json({ ok: false, error: `Không tìm thấy giao dịch thanh toán: ${id}.` });
      return;
    }

    res.json({ ok: true, data: payment });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, `marketplacePaymentController.getPayment: ${msg}`);
    res.status(500).json({ ok: false, error: "Không thể tải giao dịch thanh toán." });
  }
}
