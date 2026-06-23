// ─────────────────────────────────────────────────────────────────────────────
// Marketplace Moderation Repository — V2.5
//
// Stores moderation audit log, seller status (suspended/banned), and reported
// items. All state that doesn't belong to the main listing/auction repos lives
// here.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Domain models ────────────────────────────────────────────────────────────

export type ModerationActionType =
  | "REMOVE_LISTING"
  | "REMOVE_AUCTION"
  | "SUSPEND_SELLER"
  | "RESTORE_LISTING"
  | "RESTORE_AUCTION"
  | "BAN_SELLER";

export type SellerStatusValue = "active" | "suspended" | "banned";

export interface ModerationAction {
  id:         string;
  adminId:    string;
  action:     ModerationActionType;
  targetType: string;
  targetId:   string;
  reason:     string;
  createdAt:  string;
}

export interface SellerModerationStatus {
  userId:    string;
  status:    SellerStatusValue;
  updatedAt: string;
}

export interface ReportedItem {
  id:         string;
  targetType: string;
  targetId:   string;
  reason:     string;
  createdAt:  string;
}

// ─── Repository interface ──────────────────────────────────────────────────────

export interface IModerationRepository {
  // Audit log
  addAction(input: Omit<ModerationAction, "id" | "createdAt">): Promise<ModerationAction>;
  getActions(limit?: number): Promise<ModerationAction[]>;

  // Seller status
  getSellerStatus(userId: string): Promise<SellerModerationStatus | null>;
  setSellerStatus(userId: string, status: SellerStatusValue): Promise<SellerModerationStatus>;
  countSellers(status: SellerStatusValue): Promise<number>;

  // Reported items
  getReported(): Promise<ReportedItem[]>;
  countReported(): Promise<number>;
}

// ─── Mock (in-memory) ─────────────────────────────────────────────────────────

export class MockModerationRepository implements IModerationRepository {
  private actions  = new Map<string, ModerationAction>();
  private sellers  = new Map<string, SellerModerationStatus>();
  private reported = new Map<string, ReportedItem>();

  async addAction(input: Omit<ModerationAction, "id" | "createdAt">): Promise<ModerationAction> {
    const id  = crypto.randomUUID();
    const now = new Date().toISOString();
    const action: ModerationAction = { ...input, id, createdAt: now };
    this.actions.set(id, action);
    return action;
  }

  async getActions(limit = 100): Promise<ModerationAction[]> {
    return [...this.actions.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async getSellerStatus(userId: string): Promise<SellerModerationStatus | null> {
    return this.sellers.get(userId) ?? null;
  }

  async setSellerStatus(userId: string, status: SellerStatusValue): Promise<SellerModerationStatus> {
    const s: SellerModerationStatus = { userId, status, updatedAt: new Date().toISOString() };
    this.sellers.set(userId, s);
    return s;
  }

  async countSellers(status: SellerStatusValue): Promise<number> {
    let n = 0;
    for (const s of this.sellers.values()) if (s.status === status) n++;
    return n;
  }

  async getReported(): Promise<ReportedItem[]> {
    return [...this.reported.values()];
  }

  async countReported(): Promise<number> {
    return this.reported.size;
  }
}
