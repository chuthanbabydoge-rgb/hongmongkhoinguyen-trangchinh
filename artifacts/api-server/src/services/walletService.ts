// ─────────────────────────────────────────────────────────────────────────────
// Wallet service
// Swap the return values with DB queries when integrating a database.
// Example: return await db.query.wallets.findFirst({ where: eq(wallets.userId, userId) });
// ─────────────────────────────────────────────────────────────────────────────

import { WALLET, type WalletData, type Transaction } from "../data/walletData";

export async function getWallet(_userId: string): Promise<WalletData> {
  return WALLET;
}

export async function getTransactions(
  _userId: string,
  limit = 20,
): Promise<Transaction[]> {
  return WALLET.transactions.slice(0, limit);
}
