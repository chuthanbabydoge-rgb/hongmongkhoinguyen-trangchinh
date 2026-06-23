// ─────────────────────────────────────────────────────────────────────────────
// Integration tests — MarketplaceService.settleExpiredAuctions
// Uses in-memory stub repos; no Supabase connection required.
// Runner: Node.js built-in `node:test`
// ─────────────────────────────────────────────────────────────────────────────

import { describe, test } from "node:test";
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

// ─── ID constants ─────────────────────────────────────────────────────────────

const SELLER_ID   = "aaaaaaaa-0000-0000-0000-000000000001";
const WINNER_ID   = "bbbbbbbb-0000-0000-0000-000000000002";
const SELLER2_ID  = "cccccccc-0000-0000-0000-000000000003";

const ITEM_A      = "11111111-0000-0000-0000-000000000001";
const ITEM_B      = "22222222-0000-0000-0000-000000000002";
const ITEM_C      = "33333333-0000-0000-0000-000000000003";

const AUCTION_A   = "aaaa0001-0000-0000-0000-000000000001";
const AUCTION_B   = "bbbb0002-0000-0000-0000-000000000002";
const AUCTION_C   = "cccc0003-0000-0000-0000-000000000003";
const AUCTION_D   = "dddd0004-0000-0000-0000-000000000004";
const AUCTION_E   = "eeee0005-0000-0000-0000-000000000005";

const PAST_DATE   = new Date(Date.now() - 3_600_000).toISOString(); // -1h
const FUTURE_DATE = new Date(Date.now() + 86_400_000).toISOString(); // +1 day

// ─── Auction builder ──────────────────────────────────────────────────────────

function makeAuction(overrides: Partial<Auction> & Pick<Auction, "id" | "sellerId" | "itemId">): Auction {
  return {
    itemName:      "Test Item",
    category:      "items",
    rarity:        "common",
    startingPrice: 100,
    currentPrice:  100,
    currency:      "credits",
    status:        "live",
    bidCount:      0,
    startsAt:      new Date(Date.now() - 7_200_000).toISOString(),
    endsAt:        PAST_DATE,
    createdAt:     new Date(Date.now() - 7_200_000).toISOString(),
    ...overrides,
  };
}

// ─── Multi-auction stub ───────────────────────────────────────────────────────

class MultiAuctionsStub implements IAuctionsRepository {
  auctions: Auction[];

  constructor(auctions: Auction[]) {
    this.auctions = auctions.map(a => ({ ...a }));
  }

  async getAll(status?: AuctionStatus): Promise<Auction[]> {
    return status ? this.auctions.filter(a => a.status === status) : [...this.auctions];
  }

  async getExpired(): Promise<Auction[]> {
    const now = new Date();
    return this.auctions.filter(
      a => a.status === "live" && new Date(a.endsAt) <= now,
    );
  }

  async getById(id: string): Promise<Auction | null> {
    return this.auctions.find(a => a.id === id) ?? null;
  }

  async create(_input: CreateAuctionInput): Promise<Auction> {
    throw new Error("not implemented in test stub");
  }

  async updateBid(_id: string, _price: number, _count: number): Promise<Auction | null> {
    throw new Error("not implemented in test stub");
  }

  async updateStatus(id: string, status: AuctionStatus): Promise<Auction | null> {
    const idx = this.auctions.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.auctions[idx] = { ...this.auctions[idx]!, status };
    return this.auctions[idx]!;
  }
}

// ─── Multi-item inventory stub ────────────────────────────────────────────────

class MultiInventoryStub implements IInventoryItemsMutationRepository {
  records: Map<string, InventoryItemRecord>;

  constructor(records: InventoryItemRecord[]) {
    this.records = new Map(records.map(r => [r.id, { ...r }]));
  }

  async getById(id: string): Promise<InventoryItemRecord | null> {
    return this.records.get(id) ?? null;
  }

  async setStatus(id: string, status: string): Promise<void> {
    const r = this.records.get(id);
    if (r) r.status = status;
  }

  async transferOwnership(id: string, newUserId: string): Promise<void> {
    const r = this.records.get(id);
    if (r) { r.userId = newUserId; r.status = "đang hoạt động"; }
  }
}

// ─── Bids stub ────────────────────────────────────────────────────────────────

class BidsStub implements IBidsRepository {
  private bids: Bid[];

  constructor(bids: Bid[] = []) {
    this.bids = [...bids];
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

// ─── No-op stubs ──────────────────────────────────────────────────────────────

const noopListings = {} as unknown as IListingsRepository;
const noopTx       = {} as unknown as ITransactionsRepository;
const noopStats    = {} as unknown as IMarketplaceStatsRepository;

function makeService(
  auctions: Auction[],
  items:    InventoryItemRecord[],
  bids:     Bid[] = [],
) {
  const auctionsStub  = new MultiAuctionsStub(auctions);
  const inventoryStub = new MultiInventoryStub(items);
  const bidsStub      = new BidsStub(bids);

  const svc = new MarketplaceService(
    noopListings,
    noopTx,
    auctionsStub,
    bidsStub,
    noopStats,
    inventoryStub,
  );

  return { svc, auctionsStub, inventoryStub };
}

function makeBid(auctionId: string, bidderId: string, amount: number): Bid {
  return {
    id:        crypto.randomUUID(),
    auctionId,
    bidderId,
    amount,
    currency:  "credits",
    createdAt: new Date().toISOString(),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MarketplaceService — settleExpiredAuctions", () => {

  // ── 1. Expired auction with a winner ──────────────────────────────────────

  test("phiên đấu giá hết hạn có người thắng → chuyển quyền sở hữu, completed++", async () => {
    const auction = makeAuction({ id: AUCTION_A, sellerId: SELLER_ID, itemId: ITEM_A });
    const bid     = makeBid(AUCTION_A, WINNER_ID, 500);

    const { svc, auctionsStub, inventoryStub } = makeService(
      [auction],
      [{ id: ITEM_A, userId: SELLER_ID, status: "đang giao dịch", name: "Item A" }],
      [bid],
    );

    const result = await svc.settleExpiredAuctions();

    assert.deepEqual(result, { processed: 1, completed: 1, restored: 0, errors: 0 });
    assert.equal(auctionsStub.auctions[0]!.status, "ended");
    assert.equal(inventoryStub.records.get(ITEM_A)!.userId, WINNER_ID,
      "Quyền sở hữu phải được chuyển cho người thắng cuộc");
    assert.equal(inventoryStub.records.get(ITEM_A)!.status, "đang hoạt động");
  });

  // ── 2. Expired auction with no bids ───────────────────────────────────────

  test("phiên đấu giá hết hạn không có giá thầu → khôi phục kho cho người bán, restored++", async () => {
    const auction = makeAuction({ id: AUCTION_B, sellerId: SELLER_ID, itemId: ITEM_B });

    const { svc, auctionsStub, inventoryStub } = makeService(
      [auction],
      [{ id: ITEM_B, userId: SELLER_ID, status: "đang giao dịch", name: "Item B" }],
      [],
    );

    const result = await svc.settleExpiredAuctions();

    assert.deepEqual(result, { processed: 1, completed: 0, restored: 1, errors: 0 });
    assert.equal(auctionsStub.auctions[0]!.status, "ended");
    assert.equal(inventoryStub.records.get(ITEM_B)!.userId, SELLER_ID,
      "Quyền sở hữu phải giữ nguyên với người bán");
    assert.equal(inventoryStub.records.get(ITEM_B)!.status, "đang hoạt động");
  });

  // ── 3. Multiple auctions in one batch ─────────────────────────────────────

  test("nhiều phiên đấu giá trong một lô — 2 có người thắng, 1 không có giá thầu", async () => {
    const auctionA = makeAuction({ id: AUCTION_A, sellerId: SELLER_ID,  itemId: ITEM_A });
    const auctionB = makeAuction({ id: AUCTION_B, sellerId: SELLER_ID,  itemId: ITEM_B });
    const auctionC = makeAuction({ id: AUCTION_C, sellerId: SELLER2_ID, itemId: ITEM_C });

    const bidA = makeBid(AUCTION_A, WINNER_ID, 200);
    const bidB = makeBid(AUCTION_B, WINNER_ID, 300);

    const { svc, auctionsStub, inventoryStub } = makeService(
      [auctionA, auctionB, auctionC],
      [
        { id: ITEM_A, userId: SELLER_ID,  status: "đang giao dịch", name: "Item A" },
        { id: ITEM_B, userId: SELLER_ID,  status: "đang giao dịch", name: "Item B" },
        { id: ITEM_C, userId: SELLER2_ID, status: "đang giao dịch", name: "Item C" },
      ],
      [bidA, bidB],
    );

    const result = await svc.settleExpiredAuctions();

    assert.deepEqual(result, { processed: 3, completed: 2, restored: 1, errors: 0 });
    assert.equal(auctionsStub.auctions.every(a => a.status === "ended"), true);
    assert.equal(inventoryStub.records.get(ITEM_A)!.userId, WINNER_ID);
    assert.equal(inventoryStub.records.get(ITEM_B)!.userId, WINNER_ID);
    assert.equal(inventoryStub.records.get(ITEM_C)!.userId, SELLER2_ID);
  });

  // ── 4. Skip auctions that haven't expired yet ─────────────────────────────

  test("bỏ qua phiên đấu giá chưa hết hạn (endsAt trong tương lai)", async () => {
    const liveNotExpired = makeAuction({
      id:     AUCTION_D,
      sellerId: SELLER_ID,
      itemId:   ITEM_A,
      endsAt:   FUTURE_DATE,
    });

    const { svc, auctionsStub } = makeService(
      [liveNotExpired],
      [{ id: ITEM_A, userId: SELLER_ID, status: "đang giao dịch", name: "Item A" }],
    );

    const result = await svc.settleExpiredAuctions();

    assert.deepEqual(result, { processed: 0, completed: 0, restored: 0, errors: 0 });
    assert.equal(auctionsStub.auctions[0]!.status, "live",
      "Phiên đấu giá chưa hết hạn không được thay đổi trạng thái");
  });

  // ── 5. Skip cancelled/ended auctions ─────────────────────────────────────

  test("bỏ qua phiên đấu giá đã kết thúc hoặc đã bị hủy", async () => {
    const endedAuction    = makeAuction({ id: AUCTION_A, sellerId: SELLER_ID, itemId: ITEM_A, status: "ended" });
    const cancelledAuction = makeAuction({ id: AUCTION_B, sellerId: SELLER_ID, itemId: ITEM_B, status: "cancelled" });

    const { svc, auctionsStub } = makeService(
      [endedAuction, cancelledAuction],
      [
        { id: ITEM_A, userId: SELLER_ID, status: "đang hoạt động", name: "Item A" },
        { id: ITEM_B, userId: SELLER_ID, status: "đang hoạt động", name: "Item B" },
      ],
    );

    const result = await svc.settleExpiredAuctions();

    assert.deepEqual(result, { processed: 0, completed: 0, restored: 0, errors: 0 });
    assert.equal(auctionsStub.auctions[0]!.status, "ended",      "Trạng thái 'ended' không được thay đổi");
    assert.equal(auctionsStub.auctions[1]!.status, "cancelled",  "Trạng thái 'cancelled' không được thay đổi");
  });

  // ── 6. Idempotency — running twice causes no additional changes ───────────

  test("tính bất biến — chạy hai lần không tạo thêm thay đổi", async () => {
    const auction = makeAuction({ id: AUCTION_E, sellerId: SELLER_ID, itemId: ITEM_A });
    const bid     = makeBid(AUCTION_E, WINNER_ID, 150);

    const { svc, auctionsStub, inventoryStub } = makeService(
      [auction],
      [{ id: ITEM_A, userId: SELLER_ID, status: "đang giao dịch", name: "Item A" }],
      [bid],
    );

    const first  = await svc.settleExpiredAuctions();
    const second = await svc.settleExpiredAuctions();

    assert.deepEqual(first,  { processed: 1, completed: 1, restored: 0, errors: 0 },
      "Lần chạy đầu tiên phải xử lý 1 phiên");
    assert.deepEqual(second, { processed: 0, completed: 0, restored: 0, errors: 0 },
      "Lần chạy thứ hai không được xử lý thêm phiên nào (đã kết thúc rồi)");
    assert.equal(auctionsStub.auctions[0]!.status, "ended");
    assert.equal(inventoryStub.records.get(ITEM_A)!.userId, WINNER_ID);
  });

});
