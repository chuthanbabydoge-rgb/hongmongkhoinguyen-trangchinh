// ─────────────────────────────────────────────────────────────────────────────
// WalletReference Repository
//
// Stores the link between a User and their Wallet Service record, plus a
// denormalised currency snapshot for fast balance display.
//
// PostgreSQL migration path:
//   Query the `wallet_references` table.
//   `syncBalance` should be called by a webhook handler when the Wallet
//   Service emits a balance-changed event, keeping the snapshot fresh.
// ─────────────────────────────────────────────────────────────────────────────

import type { WalletReference, WalletCurrency } from "../models/walletReference";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IWalletReferenceRepository {
  findByUserId(userId: string): Promise<WalletReference | null>;
  save(ref: WalletReference): Promise<WalletReference>;
  syncBalance(
    userId: string,
    currency: WalletCurrency,
  ): Promise<WalletReference | null>;
}

// ─── Mock seed data ───────────────────────────────────────────────────────────

const SEED_WALLET_REFS: WalletReference[] = [
  {
    userId: "user-001",
    walletId: "wallet-001",
    currency: { credits: 125840, coins: 48290, tokens: 3750 },
    lastSyncedAt: "2024-12-01T10:00:00Z",
  },
];

// ─── Mock implementation ──────────────────────────────────────────────────────

export class MockWalletReferenceRepository
  implements IWalletReferenceRepository
{
  private store = new Map<string, WalletReference>(
    SEED_WALLET_REFS.map((r) => [r.userId, { ...r, currency: { ...r.currency } }]),
  );

  async findByUserId(userId: string): Promise<WalletReference | null> {
    return this.store.get(userId) ?? null;
  }

  async save(ref: WalletReference): Promise<WalletReference> {
    const record: WalletReference = {
      ...ref,
      lastSyncedAt: new Date().toISOString(),
    };
    this.store.set(record.userId, record);
    return record;
  }

  async syncBalance(
    userId: string,
    currency: WalletCurrency,
  ): Promise<WalletReference | null> {
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
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const walletReferenceRepository: IWalletReferenceRepository =
  new MockWalletReferenceRepository();
