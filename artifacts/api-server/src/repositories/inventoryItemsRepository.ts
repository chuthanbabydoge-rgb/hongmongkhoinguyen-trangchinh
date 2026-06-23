// ─────────────────────────────────────────────────────────────────────────────
// InventoryItemsRepository
//
// Interface + types for querying individual inventory items with filters.
// The backing table is `inventory_items` (Supabase).
// ─────────────────────────────────────────────────────────────────────────────

export type Rarity        = "common" | "rare" | "epic" | "legendary" | "mythic";
export type ItemStatus    = "active" | "inactive" | "locked" | "trading" | "equipped" | "used" | "expired";
export type InventoryCategory = "pets" | "football" | "world-assets" | "tickets" | "items";

export interface InventoryItem {
  id:         string;
  category:   InventoryCategory;
  name:       string;
  rarity:     Rarity;
  status:     ItemStatus;
  acquiredAt: string;
}

export interface InventorySummary {
  pets:           number;
  footballPlayers: number;
  tickets:        number;
  worldAssets:    number;
  items:          number;
  total:          number;
}

export interface ItemFilters {
  category?: InventoryCategory;
  rarity?:   Rarity;
  status?:   ItemStatus;
}

export interface IInventoryItemsRepository {
  getItems(userId: string, filters?: ItemFilters, limit?: number): Promise<InventoryItem[]>;
  getSummary(userId: string): Promise<InventorySummary>;
}

// ─── Mock implementation (used when Supabase is not configured) ───────────────

const MOCK_ITEMS: InventoryItem[] = [
  { id: "inv-001", category: "pets",         name: "Rồng Lửa",           rarity: "legendary", status: "active",   acquiredAt: "2024-01-10T10:00:00Z" },
  { id: "inv-002", category: "pets",         name: "Sói Băng",            rarity: "epic",      status: "equipped", acquiredAt: "2024-02-14T08:00:00Z" },
  { id: "inv-003", category: "football",     name: "Striker Alpha",       rarity: "legendary", status: "active",   acquiredAt: "2024-03-05T12:00:00Z" },
  { id: "inv-004", category: "football",     name: "Keeper Prime",        rarity: "rare",      status: "active",   acquiredAt: "2024-03-20T09:00:00Z" },
  { id: "inv-005", category: "world-assets", name: "Đảo Thiên Hà",       rarity: "mythic",    status: "active",   acquiredAt: "2023-11-01T07:00:00Z" },
  { id: "inv-006", category: "world-assets", name: "Trạm Không Gian K7", rarity: "epic",      status: "active",   acquiredAt: "2024-01-20T11:00:00Z" },
  { id: "inv-007", category: "tickets",      name: "Vé Giải Vô Địch S5", rarity: "rare",      status: "active",   acquiredAt: "2024-04-01T06:00:00Z" },
  { id: "inv-008", category: "tickets",      name: "Vé VIP Galaxy Cup",  rarity: "epic",      status: "active",   acquiredAt: "2024-04-10T14:00:00Z" },
  { id: "inv-009", category: "items",        name: "Giáp Plasma Mk.III", rarity: "legendary", status: "equipped", acquiredAt: "2024-02-28T16:00:00Z" },
  { id: "inv-010", category: "items",        name: "Vũ Khí Tia Sáng",   rarity: "epic",      status: "active",   acquiredAt: "2024-03-15T13:00:00Z" },
];

export class MockInventoryItemsRepository implements IInventoryItemsRepository {
  async getItems(_userId: string, filters: ItemFilters = {}, limit = 50): Promise<InventoryItem[]> {
    let items = MOCK_ITEMS;
    if (filters.category) items = items.filter(i => i.category === filters.category);
    if (filters.rarity)   items = items.filter(i => i.rarity   === filters.rarity);
    if (filters.status)   items = items.filter(i => i.status   === filters.status);
    return items.slice(0, limit);
  }

  async getSummary(_userId: string): Promise<InventorySummary> {
    return { pets: 2, footballPlayers: 2, tickets: 2, worldAssets: 2, items: 2, total: 10 };
  }
}
