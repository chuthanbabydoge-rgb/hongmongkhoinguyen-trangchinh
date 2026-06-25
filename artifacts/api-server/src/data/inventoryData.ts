// ─────────────────────────────────────────────────────────────────────────────
// Mock inventory data
// Replace with DB queries when integrating a database.
// ─────────────────────────────────────────────────────────────────────────────

export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export type ItemStatus = "active" | "inactive" | "locked" | "trading" | "equipped";
export type InventoryCategory = "pets" | "football" | "world-assets" | "tickets" | "items";

export interface InventoryItem {
  id: string;
  category: InventoryCategory;
  name: string;
  rarity: Rarity;
  status: ItemStatus;
  acquiredAt: string;
}

export interface InventorySummary {
  pets: number;
  footballPlayers: number;
  tickets: number;
  worldAssets: number;
  items: number;
  total: number;
}

export interface InventoryData {
  userId: string;
  summary: InventorySummary;
  items: InventoryItem[];
}

const ITEMS: InventoryItem[] = [
  { id: "inv-001", category: "pets",         name: "Rồng Lửa",           rarity: "legendary", status: "active",   acquiredAt: "2024-01-10T10:00:00Z" },
  { id: "inv-002", category: "pets",         name: "Sói Băng",            rarity: "epic",      status: "equipped", acquiredAt: "2024-02-14T08:00:00Z" },
  { id: "inv-003", category: "football",     name: "Striker Alpha",       rarity: "legendary", status: "active",   acquiredAt: "2024-03-05T12:00:00Z" },
  { id: "inv-004", category: "football",     name: "Keeper Prime",        rarity: "rare",      status: "active",   acquiredAt: "2024-03-20T09:00:00Z" },
  { id: "inv-005", category: "world-assets", name: "Đảo Thiên Hà",       rarity: "mythic",    status: "active",   acquiredAt: "2023-11-01T07:00:00Z" },
  { id: "inv-006", category: "world-assets", name: "Trạm Không gian K7", rarity: "epic",      status: "active",   acquiredAt: "2024-01-20T11:00:00Z" },
  { id: "inv-007", category: "tickets",      name: "Vé Giải Vô địch S5", rarity: "rare",      status: "active",   acquiredAt: "2024-04-01T06:00:00Z" },
  { id: "inv-008", category: "tickets",      name: "Vé VIP Galaxy Cup",  rarity: "epic",      status: "active",   acquiredAt: "2024-04-10T14:00:00Z" },
  { id: "inv-009", category: "items",        name: "Giáp Plasma Mk.III", rarity: "legendary", status: "equipped", acquiredAt: "2024-02-28T16:00:00Z" },
  { id: "inv-010", category: "items",        name: "Vũ khí Tia Sáng",   rarity: "epic",      status: "active",   acquiredAt: "2024-03-15T13:00:00Z" },
];

export const INVENTORY: InventoryData = {
  userId: "",
  summary: {
    pets: 0,
    footballPlayers: 0,
    tickets: 0,
    worldAssets: 0,
    items: 0,
    total: 0,
  },
  items: ITEMS,
};
