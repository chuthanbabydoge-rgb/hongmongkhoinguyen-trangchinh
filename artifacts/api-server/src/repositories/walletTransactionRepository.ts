import type { Transaction } from "../data/walletData";
import { SEED_TRANSACTIONS } from "../data/walletData";

export interface IWalletTransactionRepository {
  getByUserId(userId: string, limit?: number, walletType?: string): Promise<Transaction[]>;
  create(tx: Transaction, userId: string): Promise<Transaction>;
}

export class MockWalletTransactionRepository implements IWalletTransactionRepository {
  private store: Transaction[] = SEED_TRANSACTIONS.map(t => ({ ...t }));

  async getByUserId(_userId: string, limit = 50, walletType?: string): Promise<Transaction[]> {
    let results = [...this.store].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (walletType) {
      results = results.filter(t => t.walletType === walletType);
    }
    return results.slice(0, limit);
  }

  async create(tx: Transaction, _userId: string): Promise<Transaction> {
    this.store.unshift(tx);
    return tx;
  }
}
