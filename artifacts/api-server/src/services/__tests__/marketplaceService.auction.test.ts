// ─────────────────────────────────────────────────────────────────────────────
// Integration tests — MarketplaceService auction inventory sync
// Uses in-memory stub repos; no Supabase connection required.
// Runner: Node.js built-in `node:test`
// ─────────────────────────────────────────────────────────────────────────────

import { describe, test, before } from "node:test";
import assert from "node:assert/strict";
import { MarketplaceService } from "../marketplaceService";
import type {
  IAuctionsRepository,
  IBidsRepository,
  IListingsRepository,
  ITransactionsRepository,
  IMarketplaceStatsRepository,
  Auction,
  Bid,
  AuctionStatus,
  CreateAuctionInput,
  PlaceBidInput,
  MarketplaceCurrency,
} from "../../repositories/marketplaceRepository";
import type {
  IInventoryItemsMutationRepository,
  InventoryItemRecord,
} from "../../repositories/inventoryItemsMutationRepository";

// ─── Stub helpers ────────────────────────────────────────────────────────────

const SELLER_ID  = "aaaaaaaa-0000-0000-0000-000000000001";
const BUYER_ID   = "bbbbbbbb-0000-0000-0000-000000000002";
const ITEM_ID    = "cccccccc-0000-0000-0000-000000000003";
const AUCTION_ID = "dddddddd-0000-0000-0000-000000000004";

const FUTURE_DATE = new Date(Date.now() + 86_400_000).toISOString(); // +1 day

const BASE_INPUT: CreateAuctionInput = {
  sellerId:      SELLER_ID,
  itemId:        ITEM_ID,
  itemName:      "Test Item",
  category:      "items",
  rarity:        "common",
  startingPrice: 100,
  currency:      "credits",
  endsAt:        FUTURE_DATE,
};

function makeAuction(overrides: Partial<Auction> = {}): Auction {
  return {
    id:            AUCTION_ID,
    sellerId:      SELLER_ID,
    itemId:        ITEM_ID,
    itemName:      "Test Item",
    category:      "items",
    rarity:        "common",
    startingPrice: 100,
    currentPrice:  100,
    currency:      "credits",
    status:        "live",
    bidCount:      0,
    startsAt:      new Date().toISOString(),
    endsAt:        FUTURE_DATE,
    createdAt:     new Date().toISOString(),
    ...overrides,
  };
}

// ── Inventory stub ────────────────────────────────────────────────────────────

class InventoryStub implements IInventoryItemsMutationRepository {
  record: InventoryItemRecord;

  constructor(initial: InventoryItemRecord) {
    this.record = { ...initial };
  }

  async getById(id: string): Promise<InventoryItemRecord | null> {
    return this.record.id === id ? { ...this.record } : null;
  }

  async setStatus(_id: string, status: string): Promise<void> {
    this.record.status = status;
  }

  async transferOwnership(_id: string, newUserId: string): Promise<void> {
    this.record.userId = newUserId;
    this.record.status = "đang hoạt động";
  }
}

// ── Auctions stub ─────────────────────────────────────────────────────────────

class AuctionsStub implements IAuctionsRepository {
  auction: Auction | null;

  constructor(auction: Auction | null = null) {
    this.auction = auction ? { ...auction } : null;
  }

  async getAll(): Promise<Auction[]> { return this.auction ? [this.auction] : []; }

  async getById(id: string): Promise<Auction | null> {
    return this.auction?.id === id ? { ...this.auction } : null;
  }

  async create(input: CreateAuctionInput): Promise<Auction> {
    const a = makeAuction({ sellerId: input.sellerId, itemId: input.itemId });
    this.auction = a;
    return a;
  }

  async updateBid(id: string, currentPrice: number, bidCount: number): Promise<Auction | null> {
    if (this.auction?.id !== id) return null;
    this.auction = { ...this.auction, currentPrice, bidCount };
    return this.auction;
  }

  async updateStatus(id: string, status: AuctionStatus): Promise<Auction | null> {
    if (this.auction?.id !== id) return null;
    this.auction = { ...this.auction, status };
    return this.auction;
  }
}

// ── Bids stub ─────────────────────────────────────────────────────────────────

class BidsStub implements IBidsRepository {
  private bids: Bid[] = [];

  constructor(preloadedBids: Bid[] = []) {
    this.bids = [...preloadedBids];
  }

  async getByAuctionId(auctionId: string): Promise<Bid[]> {
    return this.bids.filter(b => b.auctionId === auctionId);
  }

  async getHighestBid(auctionId: string): Promise<Bid | null> {
    const relevant = this.bids
      .filter(b => b.auctionId === auctionId)
      .sort((a, b) => b.amount - a.amount);
    return relevant[0] ?? null;
  }

  async create(auctionId: string, input: PlaceBidInput, currency: MarketplaceCurrency): Promise<Bid> {
    const bid: Bid = {
      id:        crypto.randomUUID(),
      auctionId,
      bidderId:  input.bidderId,
      amount:    input.amount,
      currency,
      createdAt: new Date().toISOString(),
    };
    this.bids.push(bid);
    return bid;
  }
}

// ── No-op stubs for unused repos ──────────────────────────────────────────────

const noopListings = {} as unknown as IListingsRepository;
const noopTx       = {} as unknown as ITransactionsRepository;
const noopStats    = {} as unknown as IMarketplaceStatsRepository;

function makeService(
  itemRecord: InventoryItemRecord,
  auctionRecord: Auction | null = null,
  bids: Bid[] = [],
) {
  const inventoryStub = new InventoryStub(itemRecord);
  const auctionsStub  = new AuctionsStub(auctionRecord);
  const bidsStub      = new BidsStub(bids);

  const svc = new MarketplaceService(
    noopListings,
    noopTx,
    auctionsStub,
    bidsStub,
    noopStats,
    inventoryStub,
  );

  return { svc, inventoryStub, auctionsStub };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("MarketplaceService — auction inventory sync", () => {

  // ── createAuction ──────────────────────────────────────────────────────────

  describe("createAuction", () => {

    test("thành công: trạng thái → 'đang giao dịch' khi tạo đấu giá (status = 'đang hoạt động')", async () => {
      const { svc, inventoryStub } = makeService({
        id: ITEM_ID, userId: SELLER_ID, status: "đang hoạt động", name: "Test Item",
      });

      await svc.createAuction(BASE_INPUT);

      assert.equal(inventoryStub.record.status, "đang giao dịch",
        "Trạng thái phải là 'đang giao dịch' sau khi tạo đấu giá");
    });

    test("thành công: tạo đấu giá với status 'active' (legacy English)", async () => {
      const { svc, inventoryStub } = makeService({
        id: ITEM_ID, userId: SELLER_ID, status: "active", name: "Test Item",
      });

      await svc.createAuction(BASE_INPUT);

      assert.equal(inventoryStub.record.status, "đang giao dịch",
        "Phải chấp nhận 'active' (tiếng Anh cũ) và đặt trạng thái 'đang giao dịch'");
    });

    test("từ chối: vật phẩm không tồn tại", async () => {
      const { svc } = makeService({
        id: "other-item", userId: SELLER_ID, status: "đang hoạt động", name: "Other",
      });

      await assert.rejects(
        () => svc.createAuction(BASE_INPUT),
        /không tồn tại/,
      );
    });

    test("từ chối: người bán không sở hữu vật phẩm", async () => {
      const { svc } = makeService({
        id: ITEM_ID, userId: "other-user", status: "đang hoạt động", name: "Test Item",
      });

      await assert.rejects(
        () => svc.createAuction(BASE_INPUT),
        /không sở hữu/,
      );
    });

    const blockedStatuses: [string, RegExp][] = [
      ["đang giao dịch", /đang được niêm yết|đang giao dịch/],
      ["đã trang bị",    /trang bị/],
      ["bị khóa",        /bị khóa/],
      ["đã hết hạn",     /hết hạn/],
      ["đã sử dụng",     /sử dụng/],
      ["unknown-status", /không thể đưa ra đấu giá/],
    ];

    for (const [status, pattern] of blockedStatuses) {
      test(`từ chối: trạng thái '${status}'`, async () => {
        const { svc } = makeService({
          id: ITEM_ID, userId: SELLER_ID, status, name: "Test Item",
        });

        await assert.rejects(
          () => svc.createAuction(BASE_INPUT),
          pattern,
        );
      });
    }

    test("ngăn trùng lặp: không thể tạo đấu giá nếu đã có niêm yết (trạng thái 'đang giao dịch')", async () => {
      const { svc } = makeService({
        id: ITEM_ID, userId: SELLER_ID, status: "đang giao dịch", name: "Test Item",
      });

      await assert.rejects(
        () => svc.createAuction(BASE_INPUT),
        /đang được niêm yết/,
      );
    });

  });

  // ── cancelAuction ──────────────────────────────────────────────────────────

  describe("cancelAuction", () => {

    test("thành công: trạng thái kho → 'đang hoạt động' khi hủy đấu giá", async () => {
      const liveAuction = makeAuction({ status: "live" });
      const { svc, inventoryStub, auctionsStub } = makeService(
        { id: ITEM_ID, userId: SELLER_ID, status: "đang giao dịch", name: "Test Item" },
        liveAuction,
      );

      const result = await svc.cancelAuction(AUCTION_ID);

      assert.equal(inventoryStub.record.status, "đang hoạt động",
        "Trạng thái kho phải được khôi phục về 'đang hoạt động'");
      assert.equal(result.status, "cancelled",
        "Trạng thái đấu giá phải là 'cancelled'");
      assert.equal(auctionsStub.auction?.status, "cancelled");
    });

    test("từ chối: đấu giá không tồn tại", async () => {
      const { svc } = makeService(
        { id: ITEM_ID, userId: SELLER_ID, status: "đang giao dịch", name: "Test Item" },
        null,
      );

      await assert.rejects(
        () => svc.cancelAuction(AUCTION_ID),
        /không tìm thấy/,
      );
    });

    test("từ chối: không thể hủy đấu giá đã kết thúc", async () => {
      const endedAuction = makeAuction({ status: "ended" });
      const { svc } = makeService(
        { id: ITEM_ID, userId: SELLER_ID, status: "đang giao dịch", name: "Test Item" },
        endedAuction,
      );

      await assert.rejects(
        () => svc.cancelAuction(AUCTION_ID),
        /không thể hủy/,
      );
    });

    test("từ chối: không thể hủy đấu giá đã bị hủy trước đó", async () => {
      const cancelledAuction = makeAuction({ status: "cancelled" });
      const { svc } = makeService(
        { id: ITEM_ID, userId: SELLER_ID, status: "đang giao dịch", name: "Test Item" },
        cancelledAuction,
      );

      await assert.rejects(
        () => svc.cancelAuction(AUCTION_ID),
        /không thể hủy/,
      );
    });

  });

  // ── completeAuction ────────────────────────────────────────────────────────

  describe("completeAuction", () => {

    test("thành công: chuyển quyền sở hữu cho người thắng cuộc", async () => {
      const winnerBid: Bid = {
        id:        crypto.randomUUID(),
        auctionId: AUCTION_ID,
        bidderId:  BUYER_ID,
        amount:    250,
        currency:  "credits",
        createdAt: new Date().toISOString(),
      };
      const liveAuction = makeAuction({ status: "live", bidCount: 1 });
      const { svc, inventoryStub, auctionsStub } = makeService(
        { id: ITEM_ID, userId: SELLER_ID, status: "đang giao dịch", name: "Test Item" },
        liveAuction,
        [winnerBid],
      );

      const { auction, winnerId } = await svc.completeAuction(AUCTION_ID);

      assert.equal(winnerId, BUYER_ID, "winnerId phải là người đặt giá cao nhất");
      assert.equal(inventoryStub.record.userId, BUYER_ID, "Quyền sở hữu phải được chuyển cho người thắng");
      assert.equal(inventoryStub.record.status, "đang hoạt động", "Trạng thái kho phải là 'đang hoạt động'");
      assert.equal(auction.status, "ended", "Trạng thái đấu giá phải là 'ended'");
      assert.equal(auctionsStub.auction?.status, "ended");
    });

    test("thành công: không có lượt đặt giá → khôi phục trạng thái kho cho người bán", async () => {
      const liveAuction = makeAuction({ status: "live", bidCount: 0 });
      const { svc, inventoryStub } = makeService(
        { id: ITEM_ID, userId: SELLER_ID, status: "đang giao dịch", name: "Test Item" },
        liveAuction,
        [],
      );

      const { auction, winnerId } = await svc.completeAuction(AUCTION_ID);

      assert.equal(winnerId, null, "winnerId phải là null khi không có lượt đặt giá");
      assert.equal(inventoryStub.record.userId, SELLER_ID, "Quyền sở hữu phải giữ nguyên với người bán");
      assert.equal(inventoryStub.record.status, "đang hoạt động", "Trạng thái kho phải được khôi phục");
      assert.equal(auction.status, "ended");
    });

    test("từ chối: đấu giá không tồn tại", async () => {
      const { svc } = makeService(
        { id: ITEM_ID, userId: SELLER_ID, status: "đang giao dịch", name: "Test Item" },
        null,
      );

      await assert.rejects(
        () => svc.completeAuction(AUCTION_ID),
        /không tìm thấy/,
      );
    });

    test("từ chối: không thể hoàn tất đấu giá đã kết thúc", async () => {
      const endedAuction = makeAuction({ status: "ended" });
      const { svc } = makeService(
        { id: ITEM_ID, userId: SELLER_ID, status: "đang hoạt động", name: "Test Item" },
        endedAuction,
      );

      await assert.rejects(
        () => svc.completeAuction(AUCTION_ID),
        /không thể hoàn tất/,
      );
    });

    test("từ chối: không thể hoàn tất đấu giá đã bị hủy", async () => {
      const cancelledAuction = makeAuction({ status: "cancelled" });
      const { svc } = makeService(
        { id: ITEM_ID, userId: SELLER_ID, status: "đang hoạt động", name: "Test Item" },
        cancelledAuction,
      );

      await assert.rejects(
        () => svc.completeAuction(AUCTION_ID),
        /không thể hoàn tất/,
      );
    });

  });

});
