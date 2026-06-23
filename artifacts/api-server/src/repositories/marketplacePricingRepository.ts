// ─────────────────────────────────────────────────────────────────────────────
// MarketplacePricingRepository (V2.8)
//
// Provides historical sale records that the pricing service uses to compute
// market metrics (averages, medians, trends, etc.).
// Source of truth: completed marketplace_transactions + settled auction bids.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface SaleRecord {
  id:       string;
  itemId:   string;
  itemName: string;
  category: string;
  rarity:   string;
  price:    number;
  currency: string;
  soldAt:   string; // ISO 8601
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IMarketplacePricingRepository {
  /** All historical sales for one item, newest first. */
  getSalesByItemId(itemId: string): Promise<SaleRecord[]>;
  /** Historical sales for one category, newest first. */
  getSalesByCategory(category: string, limit?: number): Promise<SaleRecord[]>;
  /** Recent sales across all items within the last `limitDays` days, newest first. */
  getAllRecentSales(limitDays?: number, limit?: number): Promise<SaleRecord[]>;
}

// ─── Mock implementation ──────────────────────────────────────────────────────

export class MockMarketplacePricingRepository
  implements IMarketplacePricingRepository
{
  private store: SaleRecord[] = [];

  /** Add a pre-built record (useful in tests that need exact timestamps). */
  addRecord(record: SaleRecord): void {
    this.store.push(record);
  }

  /**
   * Convenience helper: add a record using a relative offset.
   * @param hoursAgo  How many hours in the past `soldAt` should be set.
   */
  addSale(
    itemId:   string,
    itemName: string,
    category: string,
    rarity:   string,
    price:    number,
    currency  = "credits",
    hoursAgo  = 0,
  ): void {
    this.store.push({
      id:       crypto.randomUUID(),
      itemId,
      itemName,
      category,
      rarity,
      price,
      currency,
      soldAt:   new Date(Date.now() - hoursAgo * 3_600_000).toISOString(),
    });
  }

  async getSalesByItemId(itemId: string): Promise<SaleRecord[]> {
    return [...this.store]
      .filter(r => r.itemId === itemId)
      .sort((a, b) => b.soldAt.localeCompare(a.soldAt));
  }

  async getSalesByCategory(category: string, limit = 500): Promise<SaleRecord[]> {
    return [...this.store]
      .filter(r => r.category === category)
      .sort((a, b) => b.soldAt.localeCompare(a.soldAt))
      .slice(0, limit);
  }

  async getAllRecentSales(limitDays = 30, limit = 1000): Promise<SaleRecord[]> {
    const cutoff = new Date(Date.now() - limitDays * 86_400_000).toISOString();
    return [...this.store]
      .filter(r => r.soldAt >= cutoff)
      .sort((a, b) => b.soldAt.localeCompare(a.soldAt))
      .slice(0, limit);
  }
}
