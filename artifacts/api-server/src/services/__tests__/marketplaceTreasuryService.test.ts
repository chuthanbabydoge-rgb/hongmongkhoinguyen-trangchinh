// ─────────────────────────────────────────────────────────────────────────────
// Unit tests: MarketplaceTreasuryService
//
// Covers treasury wallet balance retrieval and fee/volume aggregation (V1.5).
// Uses fully in-memory stubs — no Supabase or network required.
//
// Run: pnpm --filter @workspace/api-server run test
// ─────────────────────────────────────────────────────────────────────────────

import { test, describe } from "node:test";
import assert              from "node:assert/strict";

import { MarketplaceTreasuryService } from "../marketplaceTreasuryService.js";
import { MockTreasuryRepository }     from "../../repositories/marketplaceTreasuryRepository.js";
import type { MarketplaceWalletTransaction } from "../../repositories/marketplacePaymentRepository.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTx(
  overrides: Partial<MarketplaceWalletTransaction>,
): MarketplaceWalletTransaction {
  return {
    id:          crypto.randomUUID(),
    buyerId:     "buyer-001",
    sellerId:    "seller-001",
    totalAmount: 1000,
    feeAmount:   50,
    netAmount:   950,
    currency:    "credits",
    sourceType:  "listing",
    sourceId:    "listing-001",
    createdAt:   new Date().toISOString(),
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MarketplaceTreasuryService", () => {

  test("✔ Treasury wallet returned correctly", async () => {
    const repo    = new MockTreasuryRepository([], { credits: 2500, coins: 900, tokens: 15 });
    const service = new MarketplaceTreasuryService(repo);

    const { treasury } = await service.getDashboard();

    assert.equal(treasury.credits, 2500);
    assert.equal(treasury.coins,   900);
    assert.equal(treasury.tokens,  15);
  });

  test("✔ Total fees aggregated correctly", async () => {
    const payments = [
      makeTx({ currency: "credits", feeAmount: 50,  totalAmount: 1000 }),
      makeTx({ currency: "credits", feeAmount: 100, totalAmount: 2000 }),
      makeTx({ currency: "stars",   feeAmount: 25,  totalAmount: 500  }),
      makeTx({ currency: "eth",     feeAmount: 1,   totalAmount: 20   }),
    ];
    const repo    = new MockTreasuryRepository(payments);
    const service = new MarketplaceTreasuryService(repo);

    const { stats } = await service.getDashboard();

    assert.equal(stats.totalFeesCredits, 150);
    assert.equal(stats.totalFeesCoins,   25);
    assert.equal(stats.totalFeesTokens,  1);
  });

  test("✔ Total volumes aggregated correctly", async () => {
    const payments = [
      makeTx({ currency: "credits", totalAmount: 1000, feeAmount: 50 }),
      makeTx({ currency: "credits", totalAmount: 2000, feeAmount: 100 }),
      makeTx({ currency: "stars",   totalAmount: 500,  feeAmount: 25  }),
      makeTx({ currency: "eth",     totalAmount: 20,   feeAmount: 1   }),
    ];
    const repo    = new MockTreasuryRepository(payments);
    const service = new MarketplaceTreasuryService(repo);

    const { stats } = await service.getDashboard();

    assert.equal(stats.totalVolumeCredits, 3000);
    assert.equal(stats.totalVolumeCoins,   500);
    assert.equal(stats.totalVolumeTokens,  20);
  });

  test("✔ Transaction count correct", async () => {
    const payments = [
      makeTx({ currency: "credits" }),
      makeTx({ currency: "stars"   }),
      makeTx({ currency: "eth"     }),
      makeTx({ currency: "credits" }),
    ];
    const repo    = new MockTreasuryRepository(payments);
    const service = new MarketplaceTreasuryService(repo);

    const { stats } = await service.getDashboard();

    assert.equal(stats.totalTransactions, 4);
  });

  test("✔ Empty history returns zeros", async () => {
    const repo    = new MockTreasuryRepository([]);
    const service = new MarketplaceTreasuryService(repo);

    const { treasury, stats } = await service.getDashboard();

    assert.equal(treasury.credits,          0);
    assert.equal(treasury.coins,            0);
    assert.equal(treasury.tokens,           0);
    assert.equal(stats.totalTransactions,   0);
    assert.equal(stats.totalFeesCredits,    0);
    assert.equal(stats.totalFeesCoins,      0);
    assert.equal(stats.totalFeesTokens,     0);
    assert.equal(stats.totalVolumeCredits,  0);
    assert.equal(stats.totalVolumeCoins,    0);
    assert.equal(stats.totalVolumeTokens,   0);
  });

  test("✔ Mixed currencies handled correctly", async () => {
    const payments = [
      makeTx({ currency: "credits", feeAmount: 100, totalAmount: 2000 }),
      makeTx({ currency: "stars",   feeAmount: 45,  totalAmount: 900  }),
      makeTx({ currency: "eth",     feeAmount: 3,   totalAmount: 60   }),
      makeTx({ currency: "stars",   feeAmount: 20,  totalAmount: 400  }),
      makeTx({ currency: "credits", feeAmount: 250, totalAmount: 5000 }),
    ];
    const repo    = new MockTreasuryRepository(payments, { credits: 350, coins: 65, tokens: 3 });
    const service = new MarketplaceTreasuryService(repo);

    const { treasury, stats } = await service.getDashboard();

    assert.equal(treasury.credits,         350);
    assert.equal(treasury.coins,           65);
    assert.equal(treasury.tokens,          3);
    assert.equal(stats.totalTransactions,  5);
    assert.equal(stats.totalFeesCredits,   350);
    assert.equal(stats.totalFeesCoins,     65);
    assert.equal(stats.totalFeesTokens,    3);
    assert.equal(stats.totalVolumeCredits, 7000);
    assert.equal(stats.totalVolumeCoins,   1300);
    assert.equal(stats.totalVolumeTokens,  60);
  });

});
