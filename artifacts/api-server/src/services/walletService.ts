import type { IWalletRepository } from "../repositories/walletRepository";
import type { IWalletTransactionRepository } from "../repositories/walletTransactionRepository";
import type { WalletData, Transaction, Currency } from "../data/walletData";

export class WalletService {
  constructor(
    private readonly wallets: IWalletRepository,
    private readonly transactions: IWalletTransactionRepository,
  ) {}

  async getWallet(userId: string): Promise<WalletData> {
    const ref = await this.wallets.getByUserId(userId);
    if (!ref) {
      return { userId, credits: 0, coins: 0, tokens: 0, rewardPoints: 0, weeklyChangePercent: 0 };
    }
    return {
      userId:              ref.userId,
      credits:             ref.currency.credits,
      coins:               ref.currency.coins,
      tokens:              ref.currency.tokens,
      rewardPoints:        ref.currency.rewardPoints ?? 15600,
      weeklyChangePercent: 12.4,
    };
  }

  async getTransactions(userId: string, limit = 50, walletType?: string): Promise<Transaction[]> {
    return this.transactions.getByUserId(userId, limit, walletType);
  }

  async transfer(
    userId: string,
    from: string,
    to: string,
    amount: number,
    description: string,
  ): Promise<{ debit: Transaction; credit: Transaction; wallet: WalletData }> {
    const ref = await this.wallets.getByUserId(userId);
    if (!ref) throw new Error("Ví không tồn tại.");

    const currency = { ...ref.currency } as Record<string, number>;
    const fromBalance = currency[from] ?? 0;

    if (fromBalance < amount) {
      throw new Error(`Số dư ${from} không đủ (hiện có: ${fromBalance}, cần: ${amount}).`);
    }

    currency[from] = fromBalance - amount;
    currency[to]   = (currency[to] ?? 0) + amount;

    await this.wallets.update({
      ...ref,
      currency: currency as unknown as typeof ref.currency,
    });

    const now = new Date().toISOString();
    const ref_ = `XFER-${Date.now()}`;

    const debitTx: Transaction = {
      id:          crypto.randomUUID(),
      walletType:  from as Currency,
      amount,
      direction:   "debit",
      description: `${description} (từ ${from})`,
      status:      "completed",
      createdAt:   now,
      reference:   ref_,
    };

    const creditTx: Transaction = {
      id:          crypto.randomUUID(),
      walletType:  to as Currency,
      amount,
      direction:   "credit",
      description: `${description} (vào ${to})`,
      status:      "completed",
      createdAt:   now,
      reference:   ref_,
    };

    await this.transactions.create(debitTx);
    await this.transactions.create(creditTx);

    const updatedWallet = await this.getWallet(userId);
    return { debit: debitTx, credit: creditTx, wallet: updatedWallet };
  }
}
