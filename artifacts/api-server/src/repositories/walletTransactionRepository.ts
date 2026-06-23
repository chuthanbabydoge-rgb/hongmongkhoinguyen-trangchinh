import type { Transaction } from "../data/walletData";
import { WALLET } from "../data/walletData";

export interface IWalletTransactionRepository {
  getByUserId(userId: string, limit?: number): Promise<Transaction[]>;
  create(tx: Transaction): Promise<Transaction>;
}

export class MockWalletTransactionRepository implements IWalletTransactionRepository {
  async getByUserId(_userId: string, limit = 20): Promise<Transaction[]> {
    return WALLET.transactions.slice(0, limit);
  }
  async create(tx: Transaction): Promise<Transaction> {
    return tx;
  }
}
