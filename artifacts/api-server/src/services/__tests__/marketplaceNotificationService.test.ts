// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MarketplaceNotificationService
//
// Covers notification CRUD and all domain event methods (V1.7).
// Uses fully in-memory stubs — no Supabase or network required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert              from "node:assert/strict";

import { MarketplaceNotificationService } from "../marketplaceNotificationService.js";
import { MockMarketplaceNotificationRepository } from "../../repositories/marketplaceNotificationRepository.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeService() {
  const repo    = new MockMarketplaceNotificationRepository();
  const service = new MarketplaceNotificationService(repo);
  return { repo, service };
}

const LISTING = { id: "listing-001", itemId: "item-001", itemName: "Rồng", price: 1000, currency: "credits" };
const AUCTION = { id: "auction-001", itemId: "item-001", itemName: "Phượng", startingPrice: 500, currency: "credits" };
const WIN_AUCTION = { ...AUCTION, amount: 1200 };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MarketplaceNotificationService", () => {

  test("✔ Tạo thông báo (create notification)", async () => {
    const { repo, service } = makeService();
    await service.onListingCreated("seller-001", LISTING);

    const { data, total } = await service.getNotifications("seller-001");
    assert.equal(total, 1);
    assert.equal(data[0]!.type,   "LISTING_CREATED");
    assert.equal(data[0]!.userId, "seller-001");
    assert.equal(data[0]!.isRead, false);
    assert.ok(data[0]!.id);
    assert.ok(data[0]!.createdAt);
  });

  test("✔ Số lượng tin nhắn chưa đọc (unread count)", async () => {
    const { service } = makeService();
    await service.onListingCreated("seller-001", LISTING);
    await service.onListingCreated("seller-001", LISTING);
    await service.onListingCreated("seller-002", LISTING); // different user

    assert.equal(await service.getUnreadCount("seller-001"), 2);
    assert.equal(await service.getUnreadCount("seller-002"), 1);
  });

  test("✔ Đánh dấu đã đọc (mark as read)", async () => {
    const { service } = makeService();
    await service.onListingCreated("seller-001", LISTING);

    const { data } = await service.getNotifications("seller-001");
    const id = data[0]!.id;

    const updated = await service.markAsRead(id);
    assert.ok(updated);
    assert.equal(updated!.isRead, true);

    assert.equal(await service.getUnreadCount("seller-001"), 0);
  });

  test("✔ Đánh dấu tất cả đã đọc (mark all as read)", async () => {
    const { service } = makeService();
    await service.onListingCreated("seller-001", LISTING);
    await service.onListingCreated("seller-001", LISTING);
    await service.onListingCreated("seller-001", LISTING);

    const updated = await service.markAllAsRead("seller-001");
    assert.equal(updated, 3);
    assert.equal(await service.getUnreadCount("seller-001"), 0);
  });

  test("✔ Xóa thông báo (delete notification)", async () => {
    const { service } = makeService();
    await service.onListingCreated("seller-001", LISTING);

    const { data } = await service.getNotifications("seller-001");
    const id = data[0]!.id;

    const deleted = await service.delete(id);
    assert.equal(deleted, true);

    const { total } = await service.getNotifications("seller-001");
    assert.equal(total, 0);

    assert.equal(await service.delete("nonexistent"), false);
  });

  test("✔ Tin đăng được tạo (listing created)", async () => {
    const { service } = makeService();
    await service.onListingCreated("seller-001", LISTING);

    const { data } = await service.getNotifications("seller-001");
    assert.equal(data[0]!.type, "LISTING_CREATED");
    assert.equal(data[0]!.metadata?.["listingId"], "listing-001");
    assert.equal(data[0]!.metadata?.["amount"],    1000);
  });

  test("✔ Tin đăng đã bán (listing sold)", async () => {
    const { service } = makeService();
    await service.onListingSold("seller-001", "buyer-001", LISTING);

    const sellerNotifs = await service.getNotifications("seller-001");
    const buyerNotifs  = await service.getNotifications("buyer-001");

    const sellerTypes = sellerNotifs.data.map(n => n.type).sort();
    assert.deepEqual(sellerTypes, ["LISTING_SOLD", "PAYMENT_RECEIVED"]);

    assert.equal(buyerNotifs.data.length, 1);
    assert.equal(buyerNotifs.data[0]!.type, "PAYMENT_SENT");
  });

  test("✔ Đấu giá được tạo (auction created)", async () => {
    const { service } = makeService();
    await service.onAuctionCreated("seller-001", AUCTION);

    const { data } = await service.getNotifications("seller-001");
    assert.equal(data.length, 1);
    assert.equal(data[0]!.type, "AUCTION_CREATED");
    assert.equal(data[0]!.metadata?.["auctionId"], "auction-001");
    assert.equal(data[0]!.metadata?.["amount"],    500);
  });

  test("✔ Đấu giá thắng (auction won)", async () => {
    const { service } = makeService();
    await service.onAuctionCompleted("winner-001", "seller-001", ["loser-001", "loser-002"], WIN_AUCTION);

    const winner = await service.getNotifications("winner-001");
    const seller = await service.getNotifications("seller-001");
    const loser1 = await service.getNotifications("loser-001");
    const loser2 = await service.getNotifications("loser-002");

    assert.equal(winner.data[0]!.type, "AUCTION_WON");
    assert.equal(winner.data[0]!.metadata?.["amount"], 1200);
    assert.equal(seller.data[0]!.type, "PAYMENT_RECEIVED");
    assert.equal(loser1.data.length, 1);
    assert.equal(loser2.data.length, 1);
  });

  test("✔ Đấu giá thua (auction lost)", async () => {
    const { service } = makeService();
    await service.onAuctionCompleted("winner-001", "seller-001", ["loser-001"], WIN_AUCTION);

    const loser = await service.getNotifications("loser-001");
    assert.equal(loser.data[0]!.type, "AUCTION_LOST");
    assert.equal(loser.data[0]!.metadata?.["auctionId"], "auction-001");
  });

  test("✔ Đã nhận thanh toán (payment received)", async () => {
    const { service } = makeService();
    await service.onListingSold("seller-001", "buyer-001", LISTING);

    const { data } = await service.getNotifications("seller-001");
    const paymentReceived = data.find(n => n.type === "PAYMENT_RECEIVED");
    assert.ok(paymentReceived);
    assert.equal(paymentReceived.metadata?.["amount"], 1000);
  });

  test("✔ Đã gửi thanh toán (payment sent)", async () => {
    const { service } = makeService();
    await service.onListingSold("seller-001", "buyer-001", LISTING);

    const { data } = await service.getNotifications("buyer-001");
    assert.equal(data[0]!.type, "PAYMENT_SENT");
    assert.equal(data[0]!.metadata?.["amount"], 1000);
  });

  test("✔ Truy vấn tin nhắn chưa đọc (unread query)", async () => {
    const { service } = makeService();
    await service.onListingCreated("seller-001", LISTING);
    await service.onListingCreated("seller-001", LISTING);

    const { data } = await service.getNotifications("seller-001");
    await service.markAsRead(data[0]!.id);

    const unread = await service.getUnread("seller-001");
    assert.equal(unread.length, 1);
    assert.equal(unread[0]!.isRead, false);
  });

  test("✔ Trạng thái trống (empty state)", async () => {
    const { service } = makeService();

    const { data, total } = await service.getNotifications("unknown-user");
    assert.equal(data.length, 0);
    assert.equal(total, 0);
    assert.equal(await service.getUnreadCount("unknown-user"), 0);
    assert.deepEqual(await service.getUnread("unknown-user"), []);
    assert.equal(await service.markAllAsRead("unknown-user"), 0);
  });

});
