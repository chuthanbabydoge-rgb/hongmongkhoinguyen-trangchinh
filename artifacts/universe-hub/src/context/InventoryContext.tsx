import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { apiFetch, ApiError } from "@/lib/apiClient";
import type {
  Pet,
  FootballPlayer,
  WorldAsset,
  Ticket,
  InventoryItem,
  Rarity,
  InventoryCategory,
  ItemStatus,
  PetElement,
  PetStatus,
  Position,
  AssetType,
  AssetStatus,
  TicketType,
  TicketValidity,
  ItemCategory as InventoryItemCategory,
} from "@/types/inventory";
import {
  PET_CATALOG,
  PLAYER_CATALOG,
  WORLD_ASSET_CATALOG,
  TICKET_CATALOG,
  ITEM_CATALOG,
} from "@/lib/inventoryCatalog";

// ─── Re-export types for convenience ─────────────────────────────────────────

export type { InventoryCategory, Rarity, ItemStatus };

// ─── API item shape ───────────────────────────────────────────────────────────

interface ApiInventoryItem {
  id:         string;
  category:   string;
  name:       string;
  rarity:     string;
  status:     string;
  acquiredAt: string;
}

// ─── Mappers: API item → rich frontend types ──────────────────────────────────

function toPet(item: ApiInventoryItem): Pet {
  const cat = PET_CATALOG.get(item.id);
  return {
    id:          item.id,
    name:        item.name,
    category:    "pets",
    rarity:      item.rarity as Rarity,
    quantity:    cat?.quantity    ?? 1,
    value:       cat?.value       ?? 0,
    status:      item.status as ItemStatus,
    image:       cat?.image       ?? "🐾",
    createdAt:   item.acquiredAt,
    species:     cat?.species     ?? "—",
    element:     cat?.element     ?? ("fire" as PetElement),
    level:       cat?.level       ?? 1,
    maxLevel:    cat?.maxLevel    ?? 100,
    power:       cat?.power       ?? 0,
    hp:          cat?.hp          ?? 0,
    attack:      cat?.attack      ?? 0,
    defense:     cat?.defense     ?? 0,
    speed:       cat?.speed       ?? 0,
    petStatus:   cat?.petStatus   ?? ("active" as PetStatus),
    description: cat?.description ?? "",
  };
}

function toPlayer(item: ApiInventoryItem): FootballPlayer {
  const cat = PLAYER_CATALOG.get(item.id);
  return {
    id:             item.id,
    name:           item.name,
    category:       "football",
    rarity:         item.rarity as Rarity,
    quantity:       cat?.quantity       ?? 1,
    value:          cat?.value          ?? 0,
    status:         item.status as ItemStatus,
    image:          cat?.image          ?? "⚽",
    createdAt:      item.acquiredAt,
    position:       cat?.position       ?? ("CM" as Position),
    team:           cat?.team           ?? "—",
    nationality:    cat?.nationality    ?? "—",
    flag:           cat?.flag           ?? "🏳",
    rating:         cat?.rating         ?? 60,
    level:          cat?.level          ?? 1,
    stats:          cat?.stats          ?? { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
    specialAbility: cat?.specialAbility ?? "—",
  };
}

function toWorldAsset(item: ApiInventoryItem): WorldAsset {
  const cat = WORLD_ASSET_CATALOG.get(item.id);
  return {
    id:          item.id,
    name:        item.name,
    category:    "world-assets",
    rarity:      item.rarity as Rarity,
    quantity:    cat?.quantity    ?? 1,
    value:       cat?.value       ?? 0,
    status:      item.status as ItemStatus,
    image:       cat?.image       ?? "🌍",
    createdAt:   item.acquiredAt,
    assetType:   cat?.assetType   ?? ("land" as AssetType),
    world:       cat?.world       ?? "—",
    coordinates: cat?.coordinates ?? "—",
    size:        cat?.size        ?? 0,
    assetStatus: cat?.assetStatus ?? ("owned" as AssetStatus),
    income:      cat?.income      ?? 0,
    description: cat?.description ?? "",
  };
}

function toTicket(item: ApiInventoryItem): Ticket {
  const cat = TICKET_CATALOG.get(item.id);
  const validity: TicketValidity =
    item.status === "expired" ? "expired"
    : item.status === "used"   ? "used"
    : "valid";
  return {
    id:             item.id,
    name:           item.name,
    category:       "tickets",
    rarity:         item.rarity as Rarity,
    quantity:       cat?.quantity       ?? 1,
    value:          cat?.value          ?? 0,
    status:         item.status as ItemStatus,
    image:          cat?.image          ?? "🎫",
    createdAt:      item.acquiredAt,
    ticketType:     cat?.ticketType     ?? ("match" as TicketType),
    event:          cat?.event          ?? "—",
    date:           cat?.date           ?? "—",
    time:           cat?.time           ?? "—",
    venue:          cat?.venue          ?? "—",
    seatInfo:       cat?.seatInfo       ?? "—",
    perks:          cat?.perks          ?? [],
    ticketValidity: validity,
  };
}

function toInventoryItem(item: ApiInventoryItem): InventoryItem {
  const cat = ITEM_CATALOG.get(item.id);
  return {
    id:           item.id,
    name:         item.name,
    category:     "items",
    rarity:       item.rarity as Rarity,
    quantity:     cat?.quantity     ?? 1,
    value:        cat?.value        ?? 0,
    status:       item.status as ItemStatus,
    image:        cat?.image        ?? "🎒",
    createdAt:    item.acquiredAt,
    itemCategory: cat?.itemCategory ?? ("equipment" as InventoryItemCategory),
    power:        cat?.power        ?? 0,
    effect:       cat?.effect       ?? "—",
    usableIn:     cat?.usableIn     ?? [],
    description:  cat?.description  ?? "",
  };
}

// ─── Analytics shape types ────────────────────────────────────────────────────

type InventoryStats = {
  totalItems:     number;
  totalValue:     number;
  legendaryCount: number;
  mythicCount:    number;
  weeklyIncome:   number;
};

type ValueTrendPoint     = { label: string; value: number };
type CategoryBreakdown   = { name: string; count: number; value: number; color: string };
type RarityBreakdown     = { name: string; count: number; color: string };

// ─── State ────────────────────────────────────────────────────────────────────

interface InventoryState {
  pets:              Pet[];
  footballPlayers:   FootballPlayer[];
  worldAssets:       WorldAsset[];
  tickets:           Ticket[];
  items:             InventoryItem[];
  stats:             InventoryStats;
  valueTrend:        ValueTrendPoint[];
  categoryBreakdown: CategoryBreakdown[];
  rarityBreakdown:   RarityBreakdown[];
  isLoading:         boolean;
  error:             string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface InventoryActions {
  getPet:            (id: string) => Pet | undefined;
  getPetsByRarity:   (rarity: Rarity) => Pet[];

  getPlayer:         (id: string) => FootballPlayer | undefined;
  getPlayersByRarity:(rarity: Rarity) => FootballPlayer[];

  getAsset:          (id: string) => WorldAsset | undefined;
  getAssetsByRarity: (rarity: Rarity) => WorldAsset[];

  getTicket:         (id: string) => Ticket | undefined;
  getValidTickets:   () => Ticket[];

  getItem:           (id: string) => InventoryItem | undefined;
  getItemsByRarity:  (rarity: Rarity) => InventoryItem[];

  searchAll: (query: string) => {
    pets:            Pet[];
    footballPlayers: FootballPlayer[];
    worldAssets:     WorldAsset[];
    tickets:         Ticket[];
    items:           InventoryItem[];
  };

  getTotalValue: () => number;

  refreshInventory:  () => Promise<void>;
  refreshCategory:   (category: InventoryCategory) => Promise<void>;
}

export type InventoryContextValue = InventoryState & InventoryActions;

// ─── Context ──────────────────────────────────────────────────────────────────

const InventoryContext = createContext<InventoryContextValue | null>(null);
InventoryContext.displayName = "InventoryContext";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [pets,            setPets]            = useState<Pet[]>([]);
  const [footballPlayers, setFootballPlayers] = useState<FootballPlayer[]>([]);
  const [worldAssets,     setWorldAssets]     = useState<WorldAsset[]>([]);
  const [tickets,         setTickets]         = useState<Ticket[]>([]);
  const [items,           setItems]           = useState<InventoryItem[]>([]);
  const [isLoading,       setIsLoading]       = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  // ── Pets ──────────────────────────────────────────────────────────────────
  const getPet          = useCallback((id: string) => pets.find((p) => p.id === id), [pets]);
  const getPetsByRarity = useCallback((r: Rarity) => pets.filter((p) => p.rarity === r), [pets]);

  // ── Football Players ──────────────────────────────────────────────────────
  const getPlayer          = useCallback((id: string) => footballPlayers.find((p) => p.id === id), [footballPlayers]);
  const getPlayersByRarity = useCallback((r: Rarity) => footballPlayers.filter((p) => p.rarity === r), [footballPlayers]);

  // ── World Assets ──────────────────────────────────────────────────────────
  const getAsset          = useCallback((id: string) => worldAssets.find((a) => a.id === id), [worldAssets]);
  const getAssetsByRarity = useCallback((r: Rarity) => worldAssets.filter((a) => a.rarity === r), [worldAssets]);

  // ── Tickets ───────────────────────────────────────────────────────────────
  const getTicket      = useCallback((id: string) => tickets.find((t) => t.id === id), [tickets]);
  const getValidTickets = useCallback(() => tickets.filter((t) => t.ticketValidity === "valid"), [tickets]);

  // ── Items ─────────────────────────────────────────────────────────────────
  const getItem          = useCallback((id: string) => items.find((i) => i.id === id), [items]);
  const getItemsByRarity = useCallback((r: Rarity) => items.filter((i) => i.rarity === r), [items]);

  // ── Cross-category search ─────────────────────────────────────────────────
  const searchAll = useCallback(
    (query: string) => {
      const q = query.toLowerCase().trim();
      if (!q) return { pets, footballPlayers, worldAssets, tickets, items };
      return {
        pets:            pets.filter((p) => p.name.toLowerCase().includes(q) || p.species.toLowerCase().includes(q)),
        footballPlayers: footballPlayers.filter((p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q)),
        worldAssets:     worldAssets.filter((a) => a.name.toLowerCase().includes(q) || a.world.toLowerCase().includes(q)),
        tickets:         tickets.filter((t) => t.name.toLowerCase().includes(q) || t.event.toLowerCase().includes(q)),
        items:           items.filter((i) => i.name.toLowerCase().includes(q)),
      };
    },
    [pets, footballPlayers, worldAssets, tickets, items],
  );

  const getTotalValue = useCallback(
    () => [...pets, ...footballPlayers, ...worldAssets, ...tickets, ...items]
      .reduce((s, i) => s + i.value * i.quantity, 0),
    [pets, footballPlayers, worldAssets, tickets, items],
  );

  // ── Computed analytics from real data ─────────────────────────────────────

  const allItems = useMemo(
    () => [...pets, ...footballPlayers, ...worldAssets, ...tickets, ...items],
    [pets, footballPlayers, worldAssets, tickets, items],
  );

  const stats = useMemo<InventoryStats>(() => ({
    totalItems:     allItems.length,
    totalValue:     allItems.reduce((s, i) => s + i.value * i.quantity, 0),
    legendaryCount: allItems.filter((x) => x.rarity === "legendary").length,
    mythicCount:    allItems.filter((x) => x.rarity === "mythic").length,
    weeklyIncome:   worldAssets.reduce((s, a) => s + a.income, 0),
  }), [allItems, worldAssets]);

  const valueTrend = useMemo<ValueTrendPoint[]>(() => {
    if (allItems.length === 0) return [];
    const total = allItems.reduce((s, i) => s + i.value * i.quantity, 0);
    return [{ label: "Hiện tại", value: total }];
  }, [allItems]);

  const categoryBreakdown = useMemo<CategoryBreakdown[]>(() => [
    { name: "Thú cưng",    count: pets.length,            value: pets.reduce((s, p) => s + p.value, 0),            color: "#c084fc" },
    { name: "Cầu thủ",    count: footballPlayers.length,  value: footballPlayers.reduce((s, p) => s + p.value, 0), color: "#60a5fa" },
    { name: "Tài sản TG", count: worldAssets.length,      value: worldAssets.reduce((s, a) => s + a.value, 0),     color: "#34d399" },
    { name: "Vé",         count: tickets.length,           value: tickets.reduce((s, t) => s + t.value, 0),         color: "#fbbf24" },
    { name: "Vật phẩm",  count: items.length,             value: items.reduce((s, i) => s + i.value * i.quantity, 0), color: "#f87171" },
  ], [pets, footballPlayers, worldAssets, tickets, items]);

  const rarityBreakdown = useMemo<RarityBreakdown[]>(() => [
    { name: "Thần thoại",  count: allItems.filter((x) => x.rarity === "mythic").length,    color: "#fb7185" },
    { name: "Huyền thoại", count: allItems.filter((x) => x.rarity === "legendary").length, color: "#fbbf24" },
    { name: "Sử thi",      count: allItems.filter((x) => x.rarity === "epic").length,      color: "#c084fc" },
    { name: "Hiếm",        count: allItems.filter((x) => x.rarity === "rare").length,      color: "#60a5fa" },
    { name: "Thông thường",count: allItems.filter((x) => x.rarity === "common").length,    color: "#9ca3af" },
  ], [allItems]);

  // ── Refresh all ───────────────────────────────────────────────────────────

  const refreshInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [petsRes, footballRes, assetsRes, ticketsRes, itemsRes] = await Promise.all([
        apiFetch<ApiInventoryItem[]>("/inventory/items?category=pets"),
        apiFetch<ApiInventoryItem[]>("/inventory/items?category=football"),
        apiFetch<ApiInventoryItem[]>("/inventory/items?category=world-assets"),
        apiFetch<ApiInventoryItem[]>("/inventory/items?category=tickets"),
        apiFetch<ApiInventoryItem[]>("/inventory/items?category=items"),
      ]);
      setPets(petsRes.map(toPet));
      setFootballPlayers(footballRes.map(toPlayer));
      setWorldAssets(assetsRes.map(toWorldAsset));
      setTickets(ticketsRes.map(toTicket));
      setItems(itemsRes.map(toInventoryItem));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Vui lòng đăng nhập để xem kho hàng.");
      } else {
        setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu kho hàng");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Refresh single category ────────────────────────────────────────────────

  const refreshCategory = useCallback(async (category: InventoryCategory) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ApiInventoryItem[]>(`/inventory/items?category=${category}`);
      switch (category) {
        case "pets":         setPets(data.map(toPet));              break;
        case "football":     setFootballPlayers(data.map(toPlayer)); break;
        case "world-assets": setWorldAssets(data.map(toWorldAsset)); break;
        case "tickets":      setTickets(data.map(toTicket));         break;
        case "items":        setItems(data.map(toInventoryItem));    break;
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Vui lòng đăng nhập để xem kho hàng.");
      } else {
        setError(err instanceof Error ? err.message : `Lỗi khi tải danh mục: ${category}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void refreshInventory(); }, [refreshInventory]);

  // ── Memoised value ────────────────────────────────────────────────────────

  const value = useMemo<InventoryContextValue>(
    () => ({
      pets, footballPlayers, worldAssets, tickets, items,
      stats, valueTrend, categoryBreakdown, rarityBreakdown,
      isLoading, error,
      getPet, getPetsByRarity,
      getPlayer, getPlayersByRarity,
      getAsset, getAssetsByRarity,
      getTicket, getValidTickets,
      getItem, getItemsByRarity,
      searchAll, getTotalValue,
      refreshInventory, refreshCategory,
    }),
    [
      pets, footballPlayers, worldAssets, tickets, items,
      stats, valueTrend, categoryBreakdown, rarityBreakdown,
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
  if (!ctx) throw new Error("useInventory phải được dùng trong <InventoryProvider>");
  return ctx;
}

export { InventoryContext };
