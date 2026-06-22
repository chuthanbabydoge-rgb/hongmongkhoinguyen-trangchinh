import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  LISTINGS,
  AUCTIONS,
  TRADES,
  MARKET_TRANSACTIONS,
  MARKET_VOLUME_TREND,
  MARKET_CATEGORY_VOLUME,
  TOP_SELLERS,
  type Listing,
  type Auction,
  type MarketTransaction,
  type ListingStatus,
  type ListingCategory,
  type MarketRarity,
  type TxType,
} from "@/lib/marketplaceMockData";
import type { Trade, TradeStatus } from "@/types/marketplace";

// ─── Re-export types for convenience ─────────────────────────────────────────

export type { ListingCategory, MarketRarity, ListingStatus, TxType, Trade, TradeStatus };

// ─── Derived stats type ───────────────────────────────────────────────────────

export interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  totalAuctions: number;
  totalTransactions: number;
  totalVolume: number;
  totalFees: number;
  avgPrice: number;
  highestSale: number;
  uniqueSellers: number;
  uniqueBuyers: number;
  volumeTrend: typeof MARKET_VOLUME_TREND;
  categoryVolume: typeof MARKET_CATEGORY_VOLUME;
  topSellers: typeof TOP_SELLERS;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface MarketplaceState {
  listings: Listing[];
  auctions: Auction[];
  trades: Trade[];
  transactions: MarketTransaction[];
  stats: MarketplaceStats;
  isLoading: boolean;
  error: string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface MarketplaceActions {
  getListing: (id: string) => Listing | undefined;
  getListingsByCategory: (category: ListingCategory) => Listing[];
  getListingsByRarity: (rarity: MarketRarity) => Listing[];
  getListingsByStatus: (status: ListingStatus) => Listing[];
  searchListings: (query: string) => Listing[];

  getAuction: (id: string) => Auction | undefined;
  getActiveAuctions: () => Auction[];
  getHotAuctions: () => Auction[];
  getAuctionsByCategory: (category: ListingCategory) => Auction[];

  getTrade: (id: string) => Trade | undefined;
  getTradesByStatus: (status: TradeStatus) => Trade[];
  proposeTrade: (trade: Omit<Trade, "id">) => void;
  respondToTrade: (id: string, response: "accepted" | "declined") => void;

  getTransaction: (id: string) => MarketTransaction | undefined;
  getTransactionsByType: (type: TxType) => MarketTransaction[];
  getTransactionsByCategory: (category: ListingCategory) => MarketTransaction[];

  // API-ready: swap stub bodies for real fetch() calls when the backend is ready
  refreshMarketplace: () => Promise<void>;
  refreshListings: () => Promise<void>;
  refreshAuctions: () => Promise<void>;
  refreshTrades: () => Promise<void>;
}

export type MarketplaceContextValue = MarketplaceState & MarketplaceActions;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStats(
  listings: Listing[],
  auctions: Auction[],
  transactions: MarketTransaction[],
): MarketplaceStats {
  const totalVolume = transactions.reduce((s, t) => s + t.price, 0);
  const totalFees = transactions.reduce((s, t) => s + t.fee, 0);
  const prices = transactions.map((t) => t.price);
  return {
    totalListings: listings.length,
    activeListings: listings.filter((l) => l.status === "active").length,
    totalAuctions: auctions.length,
    totalTransactions: transactions.length,
    totalVolume,
    totalFees,
    avgPrice: prices.length ? Math.round(totalVolume / prices.length) : 0,
    highestSale: prices.length ? Math.max(...prices) : 0,
    uniqueSellers: new Set(transactions.map((t) => t.seller)).size,
    uniqueBuyers: new Set(transactions.map((t) => t.buyer)).size,
    volumeTrend: MARKET_VOLUME_TREND,
    categoryVolume: MARKET_CATEGORY_VOLUME,
    topSellers: TOP_SELLERS,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);
MarketplaceContext.displayName = "MarketplaceContext";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(LISTINGS);
  const [auctions, setAuctions] = useState<Auction[]>(AUCTIONS);
  const [trades, setTrades] = useState<Trade[]>(TRADES);
  const [transactions, setTransactions] = useState<MarketTransaction[]>(MARKET_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Listings ──────────────────────────────────────────────────────────────

  const getListing = useCallback(
    (id: string) => listings.find((l) => l.id === id),
    [listings],
  );

  const getListingsByCategory = useCallback(
    (category: ListingCategory) => listings.filter((l) => l.category === category),
    [listings],
  );

  const getListingsByRarity = useCallback(
    (rarity: MarketRarity) => listings.filter((l) => l.rarity === rarity),
    [listings],
  );

  const getListingsByStatus = useCallback(
    (status: ListingStatus) => listings.filter((l) => l.status === status),
    [listings],
  );

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

  const getAuction = useCallback(
    (id: string) => auctions.find((a) => a.id === id),
    [auctions],
  );

  const getActiveAuctions = useCallback(
    () => auctions.filter((a) => new Date(a.endTime) > new Date()),
    [auctions],
  );

  const getHotAuctions = useCallback(
    () => auctions.filter((a) => a.isHot),
    [auctions],
  );

  const getAuctionsByCategory = useCallback(
    (category: ListingCategory) => auctions.filter((a) => a.category === category),
    [auctions],
  );

  // ── Trades ────────────────────────────────────────────────────────────────

  const getTrade = useCallback(
    (id: string) => trades.find((t) => t.id === id),
    [trades],
  );

  const getTradesByStatus = useCallback(
    (status: TradeStatus) => trades.filter((t) => t.status === status),
    [trades],
  );

  const proposeTrade = useCallback(
    (trade: Omit<Trade, "id">) => {
      const newTrade: Trade = {
        ...trade,
        id: `TR-${Date.now()}`,
      };
      // TODO: POST /api/marketplace/trades
      setTrades((prev) => [newTrade, ...prev]);
    },
    [],
  );

  const respondToTrade = useCallback(
    (id: string, response: "accepted" | "declined") => {
      // TODO: PATCH /api/marketplace/trades/:id
      setTrades((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: response } : t)),
      );
    },
    [],
  );

  // ── Transactions ──────────────────────────────────────────────────────────

  const getTransaction = useCallback(
    (id: string) => transactions.find((t) => t.id === id),
    [transactions],
  );

  const getTransactionsByType = useCallback(
    (type: TxType) => transactions.filter((t) => t.type === type),
    [transactions],
  );

  const getTransactionsByCategory = useCallback(
    (category: ListingCategory) => transactions.filter((t) => t.category === category),
    [transactions],
  );

  // ── Refresh stubs (API-ready) ─────────────────────────────────────────────

  const refreshMarketplace = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: replace with real API calls, e.g.:
      // const [listingsRes, auctionsRes, tradesRes, txRes] = await Promise.all([
      //   fetch("/api/marketplace/listings").then(r => r.json()),
      //   fetch("/api/marketplace/auctions").then(r => r.json()),
      //   fetch("/api/marketplace/trades").then(r => r.json()),
      //   fetch("/api/marketplace/transactions").then(r => r.json()),
      // ]);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setListings(LISTINGS);
      setAuctions(AUCTIONS);
      setTrades(TRADES);
      setTransactions(MARKET_TRANSACTIONS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu marketplace");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: const data = await fetch("/api/marketplace/listings").then(r => r.json());
      await new Promise((resolve) => setTimeout(resolve, 500));
      setListings(LISTINGS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải danh sách");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAuctions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: const data = await fetch("/api/marketplace/auctions").then(r => r.json());
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAuctions(AUCTIONS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải đấu giá");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTrades = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: const data = await fetch("/api/marketplace/trades").then(r => r.json());
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTrades(TRADES);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải giao dịch trao đổi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Memoised stats ────────────────────────────────────────────────────────

  const stats = useMemo(
    () => computeStats(listings, auctions, transactions),
    [listings, auctions, transactions],
  );

  // ── Memoised context value ────────────────────────────────────────────────

  const value = useMemo<MarketplaceContextValue>(
    () => ({
      listings,
      auctions,
      trades,
      transactions,
      stats,
      isLoading,
      error,
      getListing,
      getListingsByCategory,
      getListingsByRarity,
      getListingsByStatus,
      searchListings,
      getAuction,
      getActiveAuctions,
      getHotAuctions,
      getAuctionsByCategory,
      getTrade,
      getTradesByStatus,
      proposeTrade,
      respondToTrade,
      getTransaction,
      getTransactionsByType,
      getTransactionsByCategory,
      refreshMarketplace,
      refreshListings,
      refreshAuctions,
      refreshTrades,
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
  if (!ctx)
    throw new Error("useMarketplace phải được dùng trong <MarketplaceProvider>");
  return ctx;
}

export { MarketplaceContext };
