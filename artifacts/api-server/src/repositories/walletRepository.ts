// ─────────────────────────────────────────────────────────────────────────────
// Wallet Repository
//
// Stores a per-user wallet reference and a denormalised currency snapshot.
// Full transaction history lives in the Wallet Service; this repo only holds
// the foreign key + cached balances for fast hub-side display.
//
// PostgreSQL migration path:
//   `wallet_references` table, one row per user.
//   `syncBalance` is triggered by Wallet Service webhooks.
//   Implement DrizzleWalletRepository and swap the singleton.
// ─────────────────────────────────────────────────────────────────────────────

import type { WalletReference, WalletCurrency } from "../models/walletReference";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IWalletRepository {
  getByUserId(userId: string): Promise<WalletReference | null>;
  create(ref: WalletReference): Promise<WalletReference>;
  update(ref: WalletReference): Promise<WalletReference | null>;
  syncBalance(userId: string, currency: WalletCurrency): Promise<WalletReference | null>;
  delete(userId: string): Promise<boolean>;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_WALLETS: WalletReference[] = [
  {
    userId: "user-001",
    walletId: "wallet-001",
    currency: { credits: 125840, coins: 48290, tokens: 3750, rewardPoints: 15600 },
    lastSyncedAt: "2024-12-01T10:00:00Z",
  },
];

// ─── Mock implementation ──────────────────────────────────────────────────────

export class MockWalletRepository implements IWalletRepository {
  private store = new Map<string, WalletReference>(
    SEED_WALLETS.map((w) => [w.userId, { ...w, currency: { ...w.currency } }]),
  );

  async getByUserId(userId: string): Promise<WalletReference | null> {
    return this.store.get(userId) ?? null;
  }

  async create(ref: WalletReference): Promise<WalletReference> {
    const record: WalletReference = { ...ref, lastSyncedAt: new Date().toISOString() };
    this.store.set(record.userId, record);
    return record;
  }

  async update(ref: WalletReference): Promise<WalletReference | null> {
    if (!this.store.has(ref.userId)) return null;
    const updated: WalletReference = { ...ref, lastSyncedAt: new Date().toISOString() };
    this.store.set(ref.userId, updated);
    return updated;
  }

  async syncBalance(userId: string, currency: WalletCurrency): Promise<WalletReference | null> {
    const existing = this.store.get(userId);
    if (!existing) return null;
    const updated: WalletReference = {
      ...existing,
      currency: { ...currency },
      lastSyncedAt: new Date().toISOString(),
    };
    this.store.set(userId, updated);
    return updated;
  }

  async delete(userId: string): Promise<boolean> {
    return this.store.delete(userId);
  }
}

// ─── Singleton (swap here for Drizzle) ───────────────────────────────────────
export const walletRepository: IWalletRepository = new MockWalletRepository();
