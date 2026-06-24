// ─────────────────────────────────────────────────────────────────────────────
// WalletReference model
//
// A lightweight reference from a User to their Wallet service record.
// The Account Service stores only the foreign key + a denormalised currency
// snapshot so the hub can display balances without a cross-service round-trip.
//
// Full wallet data (transactions, history) lives in the Wallet Service.
//
// PostgreSQL migration path:
//   One row per user in `wallet_references`.
//   `walletId` is a foreign key into the Wallet Service DB (UUID).
//   `currency.*` columns are cached and refreshed via wallet webhooks.
// ─────────────────────────────────────────────────────────────────────────────

export interface WalletCurrency {
  credits: number;
  coins: number;
  tokens: number;
  rewardPoints: number;
}

export interface WalletReference {
  userId: string;
  walletId: string;
  currency: WalletCurrency;
  lastSyncedAt: string;
}
