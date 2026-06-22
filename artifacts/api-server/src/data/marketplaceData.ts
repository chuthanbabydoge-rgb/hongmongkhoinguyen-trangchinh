// ─────────────────────────────────────────────────────────────────────────────
// Mock marketplace data
// Replace with DB queries when integrating a database.
// ─────────────────────────────────────────────────────────────────────────────

export type ListingStatus = "active" | "sold" | "cancelled" | "expired";
export type AuctionStatus = "live" | "ended" | "cancelled";
export type TradeStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  itemId: string;
  itemName: string;
  itemRarity: string;
  category: string;
  price: number;
  currency: "credits" | "coins";
  status: ListingStatus;
  listedAt: string;
}

export interface Auction {
  id: string;
  sellerId: string;
  sellerName: string;
  itemId: string;
  itemName: string;
  itemRarity: string;
  startingBid: number;
  currentBid: number;
  bidCount: number;
  topBidderId: string | null;
  topBidderName: string | null;
  currency: "credits" | "coins";
  status: AuctionStatus;
  endsAt: string;
  startedAt: string;
}

export interface Trade {
  id: string;
  initiatorId: string;
  initiatorName: string;
  receiverId: string;
  receiverName: string;
  offeredItemId: string;
  offeredItemName: string;
  requestedItemId: string;
  requestedItemName: string;
  status: TradeStatus;
  createdAt: string;
}

export interface MarketplaceData {
  listings: Listing[];
  auctions: Auction[];
  trades: Trade[];
}

export const MARKETPLACE: MarketplaceData = {
  listings: [
    {
      id: "lst-001",
      sellerId: "user-042",
      sellerName: "NebulaMaster",
      itemId: "inv-201",
      itemName: "Rồng Bóng Tối",
      itemRarity: "legendary",
      category: "pets",
      price: 45000,
      currency: "credits",
      status: "active",
      listedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: "lst-002",
      sellerId: "user-077",
      sellerName: "StarLord99",
      itemId: "inv-312",
      itemName: "Midfielder Gold",
      itemRarity: "epic",
      category: "football",
      price: 18500,
      currency: "credits",
      status: "active",
      listedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "lst-003",
      sellerId: "user-015",
      sellerName: "CometRider",
      itemId: "inv-089",
      itemName: "Vé Chung kết Ngân Hà",
      itemRarity: "rare",
      category: "tickets",
      price: 7200,
      currency: "coins",
      status: "active",
      listedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
  ],
  auctions: [
    {
      id: "auc-001",
      sellerId: "user-033",
      sellerName: "VoidWalker",
      itemId: "inv-411",
      itemName: "Đảo Thiên Hà Nguyên Thủy",
      itemRarity: "mythic",
      startingBid: 100000,
      currentBid: 187500,
      bidCount: 23,
      topBidderId: "user-001",
      topBidderName: "Commander Zara",
      currency: "credits",
      status: "live",
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: "auc-002",
      sellerId: "user-056",
      sellerName: "PlasmaDrake",
      itemId: "inv-522",
      itemName: "Striker Huyền Thoại Mùa 4",
      itemRarity: "legendary",
      startingBid: 30000,
      currentBid: 52000,
      bidCount: 11,
      topBidderId: "user-091",
      topBidderName: "AsteroidKing",
      currency: "credits",
      status: "live",
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    },
  ],
  trades: [
    {
      id: "trd-001",
      initiatorId: "user-001",
      initiatorName: "Commander Zara",
      receiverId: "user-042",
      receiverName: "NebulaMaster",
      offeredItemId: "inv-007",
      offeredItemName: "Vé Giải Vô địch S5",
      requestedItemId: "inv-201",
      requestedItemName: "Rồng Bóng Tối",
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ],
};
