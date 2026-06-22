import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  PETS,
  FOOTBALL_PLAYERS,
  WORLD_ASSETS,
  TICKETS,
  ITEMS,
  INVENTORY_STATS,
  INVENTORY_VALUE_TREND,
  CATEGORY_BREAKDOWN,
  RARITY_BREAKDOWN,
  type Pet,
  type FootballPlayer,
  type WorldAsset,
  type Ticket,
  type InventoryItem,
  type Rarity,
} from "@/lib/inventoryMockData";

// ─── Category identifier ──────────────────────────────────────────────────────

export type InventoryCategory =
  | "pets"
  | "football"
  | "world-assets"
  | "tickets"
  | "items";

export const INVENTORY_CATEGORIES: Record<
  InventoryCategory,
  { label: string; icon: string }
> = {
  pets:          { label: "Thú cưng",         icon: "🐾" },
  football:      { label: "Cầu thủ bóng đá",  icon: "⚽" },
  "world-assets":{ label: "Tài sản thế giới", icon: "🌍" },
  tickets:       { label: "Vé",               icon: "🎫" },
  items:         { label: "Vật phẩm",         icon: "🎒" },
};

// ─── State ────────────────────────────────────────────────────────────────────

interface InventoryState {
  pets: Pet[];
  footballPlayers: FootballPlayer[];
  worldAssets: WorldAsset[];
  tickets: Ticket[];
  items: InventoryItem[];
  stats: typeof INVENTORY_STATS;
  valueTrend: typeof INVENTORY_VALUE_TREND;
  categoryBreakdown: typeof CATEGORY_BREAKDOWN;
  rarityBreakdown: typeof RARITY_BREAKDOWN;
  isLoading: boolean;
  error: string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface InventoryActions {
  // Pets
  getPet: (id: string) => Pet | undefined;
  getPetsByRarity: (rarity: Rarity) => Pet[];

  // Football Players
  getPlayer: (id: string) => FootballPlayer | undefined;
  getPlayersByRarity: (rarity: Rarity) => FootballPlayer[];

  // World Assets
  getAsset: (id: string) => WorldAsset | undefined;
  getAssetsByRarity: (rarity: Rarity) => WorldAsset[];

  // Tickets
  getTicket: (id: string) => Ticket | undefined;
  getValidTickets: () => Ticket[];

  // Items
  getItem: (id: string) => InventoryItem | undefined;
  getItemsByRarity: (rarity: Rarity) => InventoryItem[];

  // Global
  searchAll: (query: string) => {
    pets: Pet[];
    footballPlayers: FootballPlayer[];
    worldAssets: WorldAsset[];
    tickets: Ticket[];
    items: InventoryItem[];
  };
  getTotalValue: () => number;

  // API-ready refresh (simulates network call; swap body for real fetch later)
  refreshInventory: () => Promise<void>;
  refreshCategory: (category: InventoryCategory) => Promise<void>;
}

export type InventoryContextValue = InventoryState & InventoryActions;

// ─── Context ──────────────────────────────────────────────────────────────────

const InventoryContext = createContext<InventoryContextValue | null>(null);
InventoryContext.displayName = "InventoryContext";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>(PETS);
  const [footballPlayers, setFootballPlayers] =
    useState<FootballPlayer[]>(FOOTBALL_PLAYERS);
  const [worldAssets, setWorldAssets] = useState<WorldAsset[]>(WORLD_ASSETS);
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS);
  const [items, setItems] = useState<InventoryItem[]>(ITEMS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Pets ──────────────────────────────────────────────────────────────────
  const getPet = useCallback(
    (id: string) => pets.find((p) => p.id === id),
    [pets],
  );
  const getPetsByRarity = useCallback(
    (rarity: Rarity) => pets.filter((p) => p.rarity === rarity),
    [pets],
  );

  // ── Football Players ───────────────────────────────────────────────────────
  const getPlayer = useCallback(
    (id: string) => footballPlayers.find((p) => p.id === id),
    [footballPlayers],
  );
  const getPlayersByRarity = useCallback(
    (rarity: Rarity) => footballPlayers.filter((p) => p.rarity === rarity),
    [footballPlayers],
  );

  // ── World Assets ──────────────────────────────────────────────────────────
  const getAsset = useCallback(
    (id: string) => worldAssets.find((a) => a.id === id),
    [worldAssets],
  );
  const getAssetsByRarity = useCallback(
    (rarity: Rarity) => worldAssets.filter((a) => a.rarity === rarity),
    [worldAssets],
  );

  // ── Tickets ───────────────────────────────────────────────────────────────
  const getTicket = useCallback(
    (id: string) => tickets.find((t) => t.id === id),
    [tickets],
  );
  const getValidTickets = useCallback(
    () => tickets.filter((t) => t.status === "valid"),
    [tickets],
  );

  // ── Items ─────────────────────────────────────────────────────────────────
  const getItem = useCallback(
    (id: string) => items.find((i) => i.id === id),
    [items],
  );
  const getItemsByRarity = useCallback(
    (rarity: Rarity) => items.filter((i) => i.rarity === rarity),
    [items],
  );

  // ── Search across all categories ──────────────────────────────────────────
  const searchAll = useCallback(
    (query: string) => {
      const q = query.toLowerCase().trim();
      if (!q)
        return { pets, footballPlayers, worldAssets, tickets, items };
      return {
        pets: pets.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.species.toLowerCase().includes(q),
        ),
        footballPlayers: footballPlayers.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.team.toLowerCase().includes(q),
        ),
        worldAssets: worldAssets.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.world.toLowerCase().includes(q),
        ),
        tickets: tickets.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.event.toLowerCase().includes(q),
        ),
        items: items.filter((i) => i.name.toLowerCase().includes(q)),
      };
    },
    [pets, footballPlayers, worldAssets, tickets, items],
  );

  // ── Total value ───────────────────────────────────────────────────────────
  const getTotalValue = useCallback(
    () =>
      footballPlayers.reduce((s, p) => s + p.value, 0) +
      worldAssets.reduce((s, a) => s + a.value, 0) +
      tickets.reduce((s, t) => s + t.price, 0) +
      items.reduce((s, i) => s + i.value * i.quantity, 0),
    [footballPlayers, worldAssets, tickets, items],
  );

  // ── Refresh all (API-ready stub) ─────────────────────────────────────────
  const refreshInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: replace with real API calls, e.g.:
      // const [petsRes, playersRes, ...] = await Promise.all([
      //   fetch("/api/inventory/pets").then(r => r.json()),
      //   ...
      // ]);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPets(PETS);
      setFootballPlayers(FOOTBALL_PLAYERS);
      setWorldAssets(WORLD_ASSETS);
      setTickets(TICKETS);
      setItems(ITEMS);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải dữ liệu kho hàng",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Refresh single category (API-ready stub) ──────────────────────────────
  const refreshCategory = useCallback(
    async (category: InventoryCategory) => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: replace with a targeted fetch, e.g.:
        // const data = await fetch(`/api/inventory/${category}`).then(r => r.json());
        await new Promise((resolve) => setTimeout(resolve, 500));
        switch (category) {
          case "pets":
            setPets(PETS);
            break;
          case "football":
            setFootballPlayers(FOOTBALL_PLAYERS);
            break;
          case "world-assets":
            setWorldAssets(WORLD_ASSETS);
            break;
          case "tickets":
            setTickets(TICKETS);
            break;
          case "items":
            setItems(ITEMS);
            break;
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Lỗi khi tải danh mục: ${category}`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // ── Memoised context value ────────────────────────────────────────────────
  const value = useMemo<InventoryContextValue>(
    () => ({
      pets,
      footballPlayers,
      worldAssets,
      tickets,
      items,
      stats: INVENTORY_STATS,
      valueTrend: INVENTORY_VALUE_TREND,
      categoryBreakdown: CATEGORY_BREAKDOWN,
      rarityBreakdown: RARITY_BREAKDOWN,
      isLoading,
      error,
      getPet,
      getPetsByRarity,
      getPlayer,
      getPlayersByRarity,
      getAsset,
      getAssetsByRarity,
      getTicket,
      getValidTickets,
      getItem,
      getItemsByRarity,
      searchAll,
      getTotalValue,
      refreshInventory,
      refreshCategory,
    }),
    [
      pets, footballPlayers, worldAssets, tickets, items,
      isLoading, error,
      getPet, getPetsByRarity,
      getPlayer, getPlayersByRarity,
      getAsset, getAssetsByRarity,
      getTicket, getValidTickets,
      getItem, getItemsByRarity,
      searchAll, getTotalValue,
      refreshInventory, refreshCategory,
    ],
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx)
    throw new Error("useInventory phải được dùng trong <InventoryProvider>");
  return ctx;
}

export { InventoryContext };
