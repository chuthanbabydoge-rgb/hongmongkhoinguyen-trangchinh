// ─────────────────────────────────────────────────────────────────────────────
// InventoryItemsRepository
//
// Interface + types for querying and mutating individual inventory items.
// The backing table is `inventory_items` (PostgreSQL via Drizzle).
// ─────────────────────────────────────────────────────────────────────────────

export type Rarity           = "common" | "rare" | "epic" | "legendary" | "mythic";
export type ItemStatus       = "active" | "inactive" | "locked" | "trading" | "equipped" | "used" | "expired";
export type InventoryCategory = "pets" | "football" | "world-assets" | "tickets" | "items";

export interface InventoryItem {
  id:           string;
  category:     InventoryCategory;
  name:         string;
  description:  string | null;
  rarity:       Rarity;
  status:       ItemStatus;
  quantity:     number;
  image:        string | null;
  metadata:     Record<string, unknown> | null;
  acquiredAt:   string;
}

export interface InventorySummary {
  pets:            number;
  footballPlayers: number;
  tickets:         number;
  worldAssets:     number;
  items:           number;
  total:           number;
}

export interface ItemFilters {
  category?: InventoryCategory;
  rarity?:   Rarity;
  status?:   ItemStatus;
}

export interface CreateInventoryItemInput {
  category:    InventoryCategory;
  name:        string;
  description?: string;
  rarity:      Rarity;
  status?:     ItemStatus;
  quantity?:   number;
  image?:      string;
  metadata?:   Record<string, unknown>;
}

export interface UpdateInventoryItemInput {
  name?:        string;
  description?: string;
  rarity?:      Rarity;
  status?:      ItemStatus;
  quantity?:    number;
  image?:       string;
  metadata?:    Record<string, unknown>;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IInventoryItemsRepository {
  getItems(userId: string, filters?: ItemFilters, limit?: number): Promise<InventoryItem[]>;
  getSummary(userId: string): Promise<InventorySummary>;
  getById(id: string, userId: string): Promise<InventoryItem | null>;
  create(userId: string, input: CreateInventoryItemInput): Promise<InventoryItem>;
  update(id: string, userId: string, input: UpdateInventoryItemInput): Promise<InventoryItem | null>;
  delete(id: string, userId: string): Promise<boolean>;
}

// ─── Mock implementation (used when DB is not configured) ─────────────────────

let mockIdCounter = 100;

const MOCK_ITEMS: InventoryItem[] = [
  { id: "inv-001", category: "pets",         name: "Rồng Lửa",           description: "Thú cưng huyền thoại từ vùng núi lửa",  rarity: "legendary", status: "active",   quantity: 1, image: null, metadata: { element: "fire", level: 42 },  acquiredAt: "2024-01-10T10:00:00Z" },
  { id: "inv-002", category: "pets",         name: "Sói Băng",            description: "Sói phương bắc với khả năng đóng băng",  rarity: "epic",      status: "equipped", quantity: 1, image: null, metadata: { element: "ice",  level: 35 },  acquiredAt: "2024-02-14T08:00:00Z" },
  { id: "inv-003", category: "football",     name: "Striker Alpha",       description: "Tiền đạo mùa giải S4",                  rarity: "legendary", status: "active",   quantity: 1, image: null, metadata: { position: "FW", rating: 94 }, acquiredAt: "2024-03-05T12:00:00Z" },
  { id: "inv-004", category: "football",     name: "Keeper Prime",        description: "Thủ môn phản xạ cực nhanh",             rarity: "rare",      status: "active",   quantity: 1, image: null, metadata: { position: "GK", rating: 82 }, acquiredAt: "2024-03-20T09:00:00Z" },
  { id: "inv-005", category: "world-assets", name: "Đảo Thiên Hà",       description: "Hòn đảo nổi trong vũ trụ kỹ thuật số",  rarity: "mythic",    status: "active",   quantity: 1, image: null, metadata: { world: "Galaxy", income: 1200 }, acquiredAt: "2023-11-01T07:00:00Z" },
  { id: "inv-006", category: "world-assets", name: "Trạm Không Gian K7", description: "Căn cứ quỹ đạo tầm thấp",               rarity: "epic",      status: "active",   quantity: 1, image: null, metadata: { world: "Orbit",  income: 450 },  acquiredAt: "2024-01-20T11:00:00Z" },
  { id: "inv-007", category: "tickets",      name: "Vé Giải Vô Địch S5", description: "Vé tham dự giải đấu mùa 5",             rarity: "rare",      status: "active",   quantity: 2, image: null, metadata: { event: "Championship S5", expiresAt: "2025-01-01" }, acquiredAt: "2024-04-01T06:00:00Z" },
  { id: "inv-008", category: "tickets",      name: "Vé VIP Galaxy Cup",  description: "Vé VIP khu vực đặc biệt",               rarity: "epic",      status: "active",   quantity: 1, image: null, metadata: { event: "Galaxy Cup", seat: "VIP-A1" }, acquiredAt: "2024-04-10T14:00:00Z" },
  { id: "inv-009", category: "items",        name: "Giáp Plasma Mk.III", description: "Giáp chiến đấu công nghệ cao",           rarity: "legendary", status: "equipped", quantity: 1, image: null, metadata: { defense: 850, durability: 100 },  acquiredAt: "2024-02-28T16:00:00Z" },
  { id: "inv-010", category: "items",        name: "Vũ Khí Tia Sáng",   description: "Vũ khí năng lượng thế hệ mới",          rarity: "epic",      status: "active",   quantity: 1, image: null, metadata: { attack: 720, range: "long" },      acquiredAt: "2024-03-15T13:00:00Z" },
];

const mockStore = new Map<string, InventoryItem>(MOCK_ITEMS.map(i => [i.id, { ...i }]));

export class MockInventoryItemsRepository implements IInventoryItemsRepository {
  async getItems(_userId: string, filters: ItemFilters = {}, limit = 50): Promise<InventoryItem[]> {
    let items = Array.from(mockStore.values());
    if (filters.category) items = items.filter(i => i.category === filters.category);
    if (filters.rarity)   items = items.filter(i => i.rarity   === filters.rarity);
    if (filters.status)   items = items.filter(i => i.status   === filters.status);
    return items.slice(0, limit);
  }

  async getSummary(_userId: string): Promise<InventorySummary> {
    const items = Array.from(mockStore.values());
    return {
      pets:            items.filter(i => i.category === "pets").length,
      footballPlayers: items.filter(i => i.category === "football").length,
      tickets:         items.filter(i => i.category === "tickets").length,
      worldAssets:     items.filter(i => i.category === "world-assets").length,
      items:           items.filter(i => i.category === "items").length,
      total:           items.length,
    };
  }

  async getById(id: string, _userId: string): Promise<InventoryItem | null> {
    return mockStore.get(id) ?? null;
  }

  async create(_userId: string, input: CreateInventoryItemInput): Promise<InventoryItem> {
    const id   = `inv-${++mockIdCounter}`;
    const item: InventoryItem = {
      id,
      category:    input.category,
      name:        input.name,
      description: input.description ?? null,
      rarity:      input.rarity,
      status:      input.status ?? "active",
      quantity:    input.quantity ?? 1,
      image:       input.image ?? null,
      metadata:    input.metadata ?? null,
      acquiredAt:  new Date().toISOString(),
    };
    mockStore.set(id, item);
    return { ...item };
  }

  async update(id: string, _userId: string, input: UpdateInventoryItemInput): Promise<InventoryItem | null> {
    const existing = mockStore.get(id);
    if (!existing) return null;
    const updated: InventoryItem = {
      ...existing,
      ...(input.name        !== undefined && { name:        input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.rarity      !== undefined && { rarity:      input.rarity }),
      ...(input.status      !== undefined && { status:      input.status }),
      ...(input.quantity    !== undefined && { quantity:    input.quantity }),
      ...(input.image       !== undefined && { image:       input.image }),
      ...(input.metadata    !== undefined && { metadata:    input.metadata }),
    };
    mockStore.set(id, updated);
    return { ...updated };
  }

  async delete(id: string, _userId: string): Promise<boolean> {
    return mockStore.delete(id);
  }
}
