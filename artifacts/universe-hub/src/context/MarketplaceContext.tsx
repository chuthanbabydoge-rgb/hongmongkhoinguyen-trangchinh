import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type {
  Listing,
  Auction,
  MarketTransaction,
  ListingStatus,
  ListingCategory,
  MarketRarity,
  TxType,
} from "@/lib/marketplaceMockData";
import type { Trade, TradeStatus } from "@/types/marketplace";
import { apiFetch, ApiError } from "@/lib/apiClient";

// ─── Re-export types for convenience ─────────────────────────────────────────

export type { ListingCategory, MarketRarity, ListingStatus, TxType, Trade, TradeStatus };

// ─── Derived stats type ───────────────────────────────────────────────────────

export interface MarketplaceStats {
  totalListings:     number;
  activeListings:    number;
  totalAuctions:     number;
  totalTransactions: number;
  totalVolume:       number;
  totalFees:         number;
  avgPrice:          number;
  highestSale:       number;
  uniqueSellers:     number;
  uniqueBuyers:      number;
  volumeTrend:       { label: string; volume: number; txCount: number }[];
  categoryVolume:    { name: string; value: number; txCount: number; color: string }[];
  topSellers:        { name: string; avatar: string; sales: number; volume: number; rating: number }[];
}

// ─── State / Actions ──────────────────────────────────────────────────────────

interface MarketplaceState {
  listings:     Listing[];
  auctions:     Auction[];
  trades:       Trade[];
  transactions: MarketTransaction[];
  stats:        MarketplaceStats;
  isLoading:    boolean;
  error:        string | null;
}

interface MarketplaceActions {
  getListing:              (id: string) => Listing | undefined;
  getListingsByCategory:   (category: ListingCategory) => Listing[];
  getListingsByRarity:     (rarity: MarketRarity) => Listing[];
  getListingsByStatus:     (status: ListingStatus) => Listing[];
  searchListings:          (query: string) => Listing[];

  getAuction:              (id: string) => Auction | undefined;
  getActiveAuctions:       () => Auction[];
  getHotAuctions:          () => Auction[];
  getAuctionsByCategory:   (category: ListingCategory) => Auction[];

  getTrade:                (id: string) => Trade | undefined;
  getTradesByStatus:       (status: TradeStatus) => Trade[];
  proposeTrade:            (trade: Omit<Trade, "id">) => void;
  respondToTrade:          (id: string, response: "accepted" | "declined") => void;

  getTransaction:          (id: string) => MarketTransaction | undefined;
  getTransactionsByType:   (type: TxType) => MarketTransaction[];
  getTransactionsByCategory:(category: ListingCategory) => MarketTransaction[];

  refreshMarketplace:      () => Promise<void>;
  refreshListings:         () => Promise<void>;
  refreshAuctions:         () => Promise<void>;
  refreshTrades:           () => Promise<void>;
}

export type MarketplaceContextValue = MarketplaceState & MarketplaceActions;

// ─── API response shapes ──────────────────────────────────────────────────────

interface ApiListing {
  id:        string;
  sellerId:  string;
  itemId:    string;
  itemName:  string;
  category:  string;
  rarity:    string;
  price:     number;
  currency:  string;
  status:    string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

interface ApiAuction {
  id:            string;
  sellerId:      string;
  itemId:        string;
  itemName:      string;
  category:      string;
  rarity:        string;
  startingPrice: number;
  currentPrice:  number;
  currency:      string;
  status:        string;
  bidCount:      number;
  startsAt:      string;
  endsAt:        string;
  createdAt:     string;
}

interface ApiMarketTxn {
  id:        string;
  listingId: string;
  buyerId:   string;
  sellerId:  string;
  itemName:  string;
  price:     number;
  currency:  string;
  createdAt: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  pets:           "🐾",
  football:       "⚽",
  "world-assets": "🌍",
  tickets:        "🎫",
  items:          "🎒",
};

function mapCurrency(c: string): "CR" | "COIN" | "TOKEN" {
  if (c === "credits") return "CR";
  if (c === "stars")   return "COIN";
  return "TOKEN";
}

function mapAuctionStatus(s: string): "active" | "ended" | "cancelled" {
  if (s === "live")      return "active";
  if (s === "cancelled") return "cancelled";
  return "ended";
}

function apiListingToFrontend(item: ApiListing): Listing {
  return {
    id:            item.id,
    itemId:        item.itemId,
    itemName:      item.itemName,
    name:          item.itemName,
    image:         CATEGORY_ICONS[item.category] ?? "📦",
    category:      item.category as ListingCategory,
    rarity:        item.rarity as MarketRarity,
    seller:        item.sellerId,
    sellerAvatar:  item.sellerId.slice(0, 2).toUpperCase(),
    price:         item.price,
    currency:      mapCurrency(item.currency),
    originalValue: item.price,
    quantity:      1,
    description:   "",
    listedAt:      item.createdAt,
    createdAt:     item.createdAt,
    views:         0,
    favorites:     0,
    status:        item.status as ListingStatus,
    tags:          [item.category, item.rarity],
  } as Listing;
}

function apiAuctionToFrontend(item: ApiAuction): Auction {
  return {
    id:           item.id,
    itemId:       item.itemId,
    itemName:     item.itemName,
    name:         item.itemName,
    image:        CATEGORY_ICONS[item.category] ?? "📦",
    category:     item.category as ListingCategory,
    rarity:       item.rarity as MarketRarity,
    seller:       item.sellerId,
    sellerAvatar: item.sellerId.slice(0, 2).toUpperCase(),
    startPrice:   item.startingPrice,
    minimumBid:   item.currentPrice,
    currentBid:   item.currentPrice,
    buyNowPrice:  null,
    minIncrement: Math.max(100, Math.floor(item.startingPrice * 0.05)),
    endTime:      item.endsAt,
    endDate:      item.endsAt,
    status:       mapAuctionStatus(item.status),
    bids:         [],
    watchers:     item.bidCount,
    isHot:        item.bidCount >= 3,
    description:  "",
  } as unknown as Auction;
}

function apiTxnToFrontend(tx: ApiMarketTxn): MarketTransaction {
  return {
    id:           tx.id,
    itemName:     tx.itemName,
    itemImage:    "📦",
    category:     "items" as ListingCategory,
    rarity:       "common" as MarketRarity,
    buyer:        tx.buyerId,
    buyerAvatar:  tx.buyerId.slice(0, 2).toUpperCase(),
    seller:       tx.sellerId,
    sellerAvatar: tx.sellerId.slice(0, 2).toUpperCase(),
    price:        tx.price,
    type:         "purchase" as TxType,
    date:         tx.createdAt,
    fee:          Math.floor(tx.price * 0.025),
  } as MarketTransaction;
}

// ─── Stats computation ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  "world-assets": "#34d399",
  football:       "#60a5fa",
  pets:           "#c084fc",
  items:          "#f87171",
  tickets:        "#fbbf24",
};

const CATEGORY_NAME_VI: Record<string, string> = {
  "world-assets": "Tài sản TG",
  football:       "Cầu thủ",
  pets:           "Thú cưng",
  items:          "Vật phẩm",
  tickets:        "Vé",
};

function computeStats(
  listings:     Listing[],
  auctions:     Auction[],
  transactions: MarketTransaction[],
): MarketplaceStats {
  const totalVolume = transactions.reduce((s, t) => s + t.price, 0);
  const totalFees   = transactions.reduce((s, t) => s + t.fee, 0);
  const prices      = transactions.map((t) => t.price);

  const catMap = new Map<string, { value: number; txCount: number }>();
  for (const tx of transactions) {
    const cat = tx.category as string;
    if (!catMap.has(cat)) catMap.set(cat, { value: 0, txCount: 0 });
    const e = catMap.get(cat)!;
    e.value   += tx.price;
    e.txCount += 1;
  }

  const categoryVolume = Array.from(catMap.entries()).map(([cat, e]) => ({
    name:    CATEGORY_NAME_VI[cat] ?? cat,
    value:   e.value,
    txCount: e.txCount,
    color:   CATEGORY_COLORS[cat] ?? "#9ca3af",
  })).sort((a, b) => b.value - a.value);

  const sellerMap = new Map<string, { sales: number; volume: number }>();
  for (const tx of transactions) {
    if (!sellerMap.has(tx.seller)) sellerMap.set(tx.seller, { sales: 0, volume: 0 });
    const e = sellerMap.get(tx.seller)!;
    e.sales  += 1;
    e.volume += tx.price;
  }

  const topSellers = Array.from(sellerMap.entries())
    .sort((a, b) => b[1].volume - a[1].volume)
    .slice(0, 5)
    .map(([name, e]) => ({
      name,
      avatar: name.slice(0, 2).toUpperCase(),
      sales:  e.sales,
      volume: e.volume,
      rating: 4.5,
    }));

  const monthMap = new Map<string, { volume: number; txCount: number; label: string }>();
  const MONTH_LABELS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
  for (const tx of transactions) {
    const d = new Date(tx.date as string);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap.has(key)) monthMap.set(key, { volume: 0, txCount: 0, label: MONTH_LABELS[d.getMonth()] });
    const e = monthMap.get(key)!;
    e.volume  += tx.price;
    e.txCount += 1;
  }
  const volumeTrend = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, e]) => ({ label: e.label, volume: e.volume, txCount: e.txCount }));

  return {
    totalListings:     listings.length,
    activeListings:    listings.filter((l) => l.status === "active").length,
    totalAuctions:     auctions.length,
    totalTransactions: transactions.length,
    totalVolume,
    totalFees,
    avgPrice:    prices.length ? Math.round(totalVolume / prices.length) : 0,
    highestSale: prices.length ? Math.max(...prices) : 0,
    uniqueSellers: new Set(transactions.map((t) => t.seller)).size,
    uniqueBuyers:  new Set(transactions.map((t) => t.buyer)).size,
    volumeTrend,
    categoryVolume,
    topSellers,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);
MarketplaceContext.displayName = "MarketplaceContext";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [listings,     setListings]     = useState<Listing[]>([]);
  const [auctions,     setAuctions]     = useState<Auction[]>([]);
  const [trades,       setTrades]       = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<MarketTransaction[]>([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // ── Listings ──────────────────────────────────────────────────────────────

  const getListing            = useCallback((id: string) => listings.find((l) => l.id === id), [listings]);
  const getListingsByCategory = useCallback((c: ListingCategory) => listings.filter((l) => l.category === c), [listings]);
  const getListingsByRarity   = useCallback((r: MarketRarity) => listings.filter((l) => l.rarity === r), [listings]);
  const getListingsByStatus   = useCallback((s: ListingStatus) => listings.filter((l) => l.status === s), [listings]);

  const searchListings = useCallback(
    (query: string) => {
      const q = query.toLowerCase().trim();
      if (!q) return listings;
      return listings.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.seller.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)),
      );
    },
    [listings],
  );

  // ── Auctions ──────────────────────────────────────────────────────────────

  const getAuction            = useCallback((id: string) => auctions.find((a) => a.id === id), [auctions]);
  const getActiveAuctions     = useCallback(() => auctions.filter((a) => new Date(a.endTime) > new Date()), [auctions]);
  const getHotAuctions        = useCallback(() => auctions.filter((a) => a.isHot), [auctions]);
  const getAuctionsByCategory = useCallback((c: ListingCategory) => auctions.filter((a) => a.category === c), [auctions]);

  // ── Trades (no backend endpoint yet — managed client-side) ────────────────

  const getTrade         = useCallback((id: string) => trades.find((t) => t.id === id), [trades]);
  const getTradesByStatus = useCallback((s: TradeStatus) => trades.filter((t) => t.status === s), [trades]);

  const proposeTrade = useCallback(
    (trade: Omit<Trade, "id">) => {
      setTrades((prev) => [{ ...trade, id: `TR-${Date.now()}` }, ...prev]);
    },
    [],
  );

  const respondToTrade = useCallback(
    (id: string, response: "accepted" | "declined") => {
      setTrades((prev) => prev.map((t) => (t.id === id ? { ...t, status: response } : t)));
    },
    [],
  );

  // ── Transactions ──────────────────────────────────────────────────────────

  const getTransaction           = useCallback((id: string) => transactions.find((t) => t.id === id), [transactions]);
  const getTransactionsByType    = useCallback((type: TxType) => transactions.filter((t) => t.type === type), [transactions]);
  const getTransactionsByCategory = useCallback(
    (c: ListingCategory) => transactions.filter((t) => t.category === c),
    [transactions],
  );

  // ── API fetches ───────────────────────────────────────────────────────────

  const refreshListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ApiListing[]>("/marketplace/listings");
      setListings(data.map(apiListingToFrontend));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Vui lòng đăng nhập để xem marketplace.");
      } else {
        setError(err instanceof Error ? err.message : "Lỗi khi tải danh sách");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAuctions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ApiAuction[]>("/marketplace/auctions");
      setAuctions(data.map(apiAuctionToFrontend));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Vui lòng đăng nhập để xem đấu giá.");
      } else {
        setError(err instanceof Error ? err.message : "Lỗi khi tải đấu giá");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTrades = useCallback(async () => {
    // Trades have no backend endpoint yet — keep client-side state only
  }, []);

  const refreshMarketplace = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [listingsData, auctionsData, txData] = await Promise.all([
        apiFetch<ApiListing[]>("/marketplace/listings"),
        apiFetch<ApiAuction[]>("/marketplace/auctions"),
        apiFetch<ApiMarketTxn[]>("/marketplace/transactions"),
      ]);
      setListings(listingsData.map(apiListingToFrontend));
      setAuctions(auctionsData.map(apiAuctionToFrontend));
      setTransactions(txData.map(apiTxnToFrontend));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Vui lòng đăng nhập để xem marketplace.");
      } else {
        setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu marketplace");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void refreshMarketplace(); }, [refreshMarketplace]);

  // ── Memoised stats ────────────────────────────────────────────────────────

  const stats = useMemo(
    () => computeStats(listings, auctions, transactions),
    [listings, auctions, transactions],
  );

  // ── Memoised context value ────────────────────────────────────────────────

  const value = useMemo<MarketplaceContextValue>(
    () => ({
      listings, auctions, trades, transactions, stats, isLoading, error,
      getListing, getListingsByCategory, getListingsByRarity, getListingsByStatus, searchListings,
      getAuction, getActiveAuctions, getHotAuctions, getAuctionsByCategory,
      getTrade, getTradesByStatus, proposeTrade, respondToTrade,
      getTransaction, getTransactionsByType, getTransactionsByCategory,
      refreshMarketplace, refreshListings, refreshAuctions, refreshTrades,
    }),
    [
      listings, auctions, trades, transactions, stats, isLoading, error,
      getListing, getListingsByCategory, getListingsByRarity, getListingsByStatus, searchListings,
      getAuction, getActiveAuctions, getHotAuctions, getAuctionsByCategory,
      getTrade, getTradesByStatus, proposeTrade, respondToTrade,
      getTransaction, getTransactionsByType, getTransactionsByCategory,
      refreshMarketplace, refreshListings, refreshAuctions, refreshTrades,
    ],
  );

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMarketplace(): MarketplaceContextValue {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error("useMarketplace phải được dùng trong <MarketplaceProvider>");
  return ctx;
}

export { MarketplaceContext };
