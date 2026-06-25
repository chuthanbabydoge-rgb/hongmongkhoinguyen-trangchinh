import { eq, or, desc, count } from "drizzle-orm";
import { db, marketplacePaymentsTable } from "@workspace/db";
import type { IMarketplacePaymentRepository, MarketplaceWalletTransaction, FindPaymentsOptions } from "../marketplacePaymentRepository";

function rowToPayment(row: typeof marketplacePaymentsTable.$inferSelect): MarketplaceWalletTransaction {
  return {
    id:          row.id,
    buyerId:     row.buyerId,
    sellerId:    row.sellerId,
    totalAmount: row.totalAmount,
    feeAmount:   row.feeAmount,
    netAmount:   row.netAmount,
    currency:    row.currency as MarketplaceWalletTransaction["currency"],
    sourceType:  row.sourceType as MarketplaceWalletTransaction["sourceType"],
    sourceId:    row.sourceId,
    createdAt:   typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
  };
}

export class DrizzlePaymentRepository implements IMarketplacePaymentRepository {
  async create(tx: MarketplaceWalletTransaction): Promise<MarketplaceWalletTransaction> {
    const [inserted] = await db
      .insert(marketplacePaymentsTable)
      .values({
        id:          tx.id,
        buyerId:     tx.buyerId,
        sellerId:    tx.sellerId,
        totalAmount: tx.totalAmount,
        feeAmount:   tx.feeAmount,
        netAmount:   tx.netAmount,
        currency:    tx.currency,
        sourceType:  tx.sourceType,
        sourceId:    tx.sourceId,
        createdAt:   tx.createdAt ?? new Date().toISOString(),
      })
      .returning();
    return rowToPayment(inserted!);
  }

  async findAll(opts: FindPaymentsOptions = {}): Promise<{ data: MarketplaceWalletTransaction[]; total: number }> {
    const [totalRow] = await db.select({ count: count() }).from(marketplacePaymentsTable);
    const rows = await db
      .select()
      .from(marketplacePaymentsTable)
      .orderBy(desc(marketplacePaymentsTable.createdAt))
      .limit(opts.limit ?? 50)
      .offset(opts.offset ?? 0);
    return { data: rows.map(rowToPayment), total: totalRow?.count ?? 0 };
  }

  async findById(id: string): Promise<MarketplaceWalletTransaction | null> {
    const rows = await db.select().from(marketplacePaymentsTable).where(eq(marketplacePaymentsTable.id, id)).limit(1);
    return rows[0] ? rowToPayment(rows[0]) : null;
  }

  async findByUser(userId: string, opts: FindPaymentsOptions = {}): Promise<{ data: MarketplaceWalletTransaction[]; total: number }> {
    const condition = or(eq(marketplacePaymentsTable.buyerId, userId), eq(marketplacePaymentsTable.sellerId, userId));
    const [totalRow] = await db.select({ count: count() }).from(marketplacePaymentsTable).where(condition);
    const rows = await db
      .select()
      .from(marketplacePaymentsTable)
      .where(condition)
      .orderBy(desc(marketplacePaymentsTable.createdAt))
      .limit(opts.limit ?? 50)
      .offset(opts.offset ?? 0);
    return { data: rows.map(rowToPayment), total: totalRow?.count ?? 0 };
  }
}
