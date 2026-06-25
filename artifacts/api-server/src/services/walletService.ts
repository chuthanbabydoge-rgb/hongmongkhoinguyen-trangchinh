import type { IWalletRepository } from "../repositories/walletRepository";
import type { IWalletTransactionRepository } from "../repositories/walletTransactionRepository";
import type { WalletData, Transaction, Currency } from "../data/walletData";
import type { NotificationsService } from "./notificationsService";
import type { UserReputationService } from "./userReputationService";
import type { AchievementService } from "./achievementService";
import { questEventBus } from "../realtime/questEventBus.js";

export type EntryDirection = "credit" | "debit";
export type EntryStatus    = "completed" | "pending" | "failed";

export class WalletService {
  constructor(
    private readonly wallets: IWalletRepository,
    private readonly transactions: IWalletTransactionRepository,
    private readonly notifications: NotificationsService | null = null,
    private readonly reputation: UserReputationService | null = null,
    private readonly achievements: AchievementService | null = null,
  ) {}

  async getWallet(userId: string): Promise<WalletData> {
    let ref = await this.wallets.getByUserId(userId);
    if (!ref) {
      ref = await this.wallets.create({
        userId,
        walletId:     `wallet-${userId}`,
        currency:     { credits: 0, coins: 0, tokens: 0, rewardPoints: 0 },
        lastSyncedAt: new Date().toISOString(),
      });
    }
    return {
      userId:              ref.userId,
      credits:             ref.currency.credits,
      coins:               ref.currency.coins,
      tokens:              ref.currency.tokens,
      rewardPoints:        ref.currency.rewardPoints ?? 0,
      weeklyChangePercent: 0,
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

    await this.transactions.create(debitTx, userId);
    await this.transactions.create(creditTx, userId);

    this.notifications?.fire(
      userId,
      "transaction",
      `Chuyển ví: ${amount} ${from} → ${to}`,
      `${description}. Số dư ${from} còn: ${currency[from]}.`,
    );

    const repResult = this.reputation
      ? await this.reputation.addEvent(userId, "WALLET_TRANSFER", { from, to, amount }).catch(() => null)
      : null;
    if (repResult && this.achievements) {
      this.achievements.checkAndUnlockAsync(userId, "WALLET_TRANSFER", { totalPoints: repResult.reputation.totalPoints });
    }

    questEventBus.publish({ userId, type: "WALLET_TRANSFER", amount: 1, metadata: { from, to, amount } });

    const updatedWallet = await this.getWallet(userId);
    return { debit: debitTx, credit: creditTx, wallet: updatedWallet };
  }

  async createEntry(
    userId: string,
    walletType: string,
    direction: EntryDirection,
    amount: number,
    description: string,
    status: EntryStatus,
    reference?: string,
  ): Promise<{ transaction: Transaction; wallet: WalletData }> {
    const ref = await this.wallets.getByUserId(userId);
    if (!ref) throw new Error("Ví không tồn tại.");

    const tx: Transaction = {
      id:          crypto.randomUUID(),
      walletType:  walletType as Currency,
      amount:      Math.abs(amount),
      direction,
      description,
      status,
      createdAt:   new Date().toISOString(),
      reference:   reference ?? `ENTRY-${Date.now()}`,
    };

    await this.transactions.create(tx, userId);

    if (status === "completed") {
      const currency = { ...ref.currency } as Record<string, number>;
      const delta = direction === "credit" ? Math.abs(amount) : -Math.abs(amount);
      currency[walletType] = (currency[walletType] ?? 0) + delta;
      await this.wallets.update({
        ...ref,
        currency: currency as unknown as typeof ref.currency,
      });

      const dirLabel = direction === "credit" ? "nhận" : "trừ";
      this.notifications?.fire(
        userId,
        "transaction",
        `Giao dịch ví: ${dirLabel} ${Math.abs(amount)} ${walletType}`,
        description,
      );
    }

    const wallet = await this.getWallet(userId);
    return { transaction: tx, wallet };
  }
}
