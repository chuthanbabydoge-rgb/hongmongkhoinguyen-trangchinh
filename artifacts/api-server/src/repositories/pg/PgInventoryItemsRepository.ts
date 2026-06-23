// ─────────────────────────────────────────────────────────────────────────────
// PgInventoryItemsRepository
//
// Uses the Replit PostgreSQL pool (DATABASE_URL) to query inventory_items.
// Tables: inventory_items, inventory_categories
// ─────────────────────────────────────────────────────────────────────────────

import { pool } from "@workspace/db";
import type {
  IInventoryItemsRepository,
  InventoryItem,
  InventoryCategory,
  Rarity,
  ItemStatus,
  InventorySummary,
  ItemFilters,
} from "../inventoryItemsRepository";

export class PgInventoryItemsRepository implements IInventoryItemsRepository {
  async getItems(userId: string, filters: ItemFilters = {}, limit = 50): Promise<InventoryItem[]> {
    const conditions: string[] = ["user_id = $1"];
    const params: unknown[] = [userId];
    let idx = 2;

    if (filters.category) { conditions.push(`category_id = $${idx++}`); params.push(filters.category); }
    if (filters.rarity)   { conditions.push(`rarity = $${idx++}`);      params.push(filters.rarity); }
    if (filters.status)   { conditions.push(`status = $${idx++}`);      params.push(filters.status); }

    params.push(limit);
    const where = conditions.join(" AND ");
    const sql = `
      SELECT id, category_id, name, rarity, status, acquired_at
      FROM   inventory_items
      WHERE  ${where}
      ORDER  BY acquired_at DESC
      LIMIT  $${idx}
    `;

    const { rows } = await pool.query(sql, params);
    return rows.map((r): InventoryItem => ({
      id:         r.id,
      category:   r.category_id as InventoryCategory,
      name:       r.name,
      rarity:     r.rarity as Rarity,
      status:     r.status as ItemStatus,
      acquiredAt: r.acquired_at,
    }));
  }

  async getSummary(userId: string): Promise<InventorySummary> {
    const sql = `
      SELECT category_id, COUNT(*)::int AS cnt
      FROM   inventory_items
      WHERE  user_id = $1
      GROUP  BY category_id
    `;
    const { rows } = await pool.query(sql, [userId]);

    const counts: Record<string, number> = {};
    let total = 0;
    for (const r of rows) {
      counts[r.category_id] = r.cnt;
      total += r.cnt;
    }

    return {
      pets:            counts["pets"]          ?? 0,
      footballPlayers: counts["football"]      ?? 0,
      tickets:         counts["tickets"]       ?? 0,
      worldAssets:     counts["world-assets"]  ?? 0,
      items:           counts["items"]         ?? 0,
      total,
    };
  }
}
