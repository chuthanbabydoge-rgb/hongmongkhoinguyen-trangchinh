import type { IWalletRepository } from "../repositories/walletRepository";
import type { IWalletTransactionRepository } from "../repositories/walletTransactionRepository";
import type { WalletData, Transaction } from "../data/walletData";

export class WalletService {
  constructor(
    private readonly wallets: IWalletRepository,
    private readonly transactions: IWalletTransactionRepository,
  ) {}

  async getWallet(userId: string): Promise<WalletData> {
    console.log("[WalletService] getWallet userId =", userId);
    const ref = await this.wallets.getByUserId(userId);
    console.log("[WalletService] walletRepo result:", ref ? `credits=${ref.currency.credits}` : "null");
    if (!ref) {
      return { userId, credits: 0, coins: 0, tokens: 0, weeklyChangePercent: 0, transactions: [] };
    }
    return {
      userId:              ref.userId,
      credits:             ref.currency.credits,
      coins:               ref.currency.coins,
      tokens:              ref.currency.tokens,
      weeklyChangePercent: 0,
      transactions:        [],
    };
  }

  async getTransactions(userId: string, limit = 20): Promise<Transaction[]> {
    console.log("[WalletService] getTransactions userId =", userId, "limit =", limit);
    return this.transactions.getByUserId(userId, limit);
  }
}
