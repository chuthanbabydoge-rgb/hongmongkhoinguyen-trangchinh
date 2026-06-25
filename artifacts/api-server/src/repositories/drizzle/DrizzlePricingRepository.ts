import { eq, desc, gte } from "drizzle-orm";
import { db, marketplacePricingTable } from "@workspace/db";
import type { IMarketplacePricingRepository, SaleRecord } from "../marketplacePricingRepository";

function rowToSale(row: typeof marketplacePricingTable.$inferSelect): SaleRecord {
  return {
    id:       row.id,
    itemId:   row.itemId,
    itemName: row.itemName,
    category: row.category,
    rarity:   row.rarity,
    price:    row.price,
    currency: row.currency,
    soldAt:   typeof row.soldAt === "string" ? row.soldAt : new Date(row.soldAt).toISOString(),
  };
}

export class DrizzlePricingRepository implements IMarketplacePricingRepository {
  async getSalesByItemId(itemId: string): Promise<SaleRecord[]> {
    const rows = await db
      .select()
      .from(marketplacePricingTable)
      .where(eq(marketplacePricingTable.itemId, itemId))
      .orderBy(desc(marketplacePricingTable.soldAt));
    return rows.map(rowToSale);
  }

  async getSalesByCategory(category: string, limit = 50): Promise<SaleRecord[]> {
    const rows = await db
      .select()
      .from(marketplacePricingTable)
      .where(eq(marketplacePricingTable.category, category))
      .orderBy(desc(marketplacePricingTable.soldAt))
      .limit(limit);
    return rows.map(rowToSale);
  }

  async getAllRecentSales(limitDays = 30, limit = 100): Promise<SaleRecord[]> {
    const since = new Date(Date.now() - limitDays * 86400_000).toISOString();
    const rows = await db
      .select()
      .from(marketplacePricingTable)
      .where(gte(marketplacePricingTable.soldAt, since))
      .orderBy(desc(marketplacePricingTable.soldAt))
      .limit(limit);
    return rows.map(rowToSale);
  }
}
