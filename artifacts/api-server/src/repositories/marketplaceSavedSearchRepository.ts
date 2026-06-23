// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceSavedSearchRepository (V2.3)
//
// Interface, types, and mock for saved marketplace searches.
//
// Table: marketplace_saved_searches
//   id          UUID        PK  DEFAULT gen_random_uuid()
//   user_id     UUID        NOT NULL
//   name        TEXT        NOT NULL
//   query       TEXT
//   category    TEXT
//   rarity      TEXT
//   currency    TEXT
//   min_price   NUMERIC
//   max_price   NUMERIC
//   last_match_ids  JSONB   DEFAULT '[]'
//   created_at  TIMESTAMPTZ DEFAULT now()
//   updated_at  TIMESTAMPTZ DEFAULT now()
// ─────────────────────────────────────────────────────────────────────────────

export interface SavedSearch {
  id:         string;
  userId:     string;
  name:       string;
  query:      string | null;
  category:   string | null;
  rarity:     string | null;
  currency:   string | null;
  minPrice:   number | null;
  maxPrice:   number | null;
  createdAt:  string;
  updatedAt:  string;
}

export type CreateSavedSearchInput = Omit<SavedSearch, "id" | "createdAt" | "updatedAt">;
export type UpdateSavedSearchInput = Partial<Omit<SavedSearch, "id" | "userId" | "createdAt" | "updatedAt">>;

// ─── Repository interface ─────────────────────────────────────────────────────

export interface ISavedSearchRepository {
  create(input: CreateSavedSearchInput): Promise<SavedSearch>;
  update(id: string, patch: UpdateSavedSearchInput): Promise<SavedSearch | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<SavedSearch | null>;
  findByUser(userId: string): Promise<SavedSearch[]>;
  getAll(): Promise<SavedSearch[]>;
  /** Returns listing IDs already notified for this saved search (deduplication). */
  getMatchIds(id: string): Promise<string[]>;
  /** Persists the updated set of notified listing IDs. */
  setMatchIds(id: string, ids: string[]): Promise<void>;
}

// ─── Mock implementation (in-memory) ─────────────────────────────────────────

export class MockSavedSearchRepository implements ISavedSearchRepository {
  private store:    SavedSearch[] = [];
  private matchIds: Map<string, string[]> = new Map();

  async create(input: CreateSavedSearchInput): Promise<SavedSearch> {
    const now   = new Date().toISOString();
    const entry: SavedSearch = {
      id:        crypto.randomUUID(),
      userId:    input.userId,
      name:      input.name,
      query:     input.query    ?? null,
      category:  input.category ?? null,
      rarity:    input.rarity   ?? null,
      currency:  input.currency ?? null,
      minPrice:  input.minPrice ?? null,
      maxPrice:  input.maxPrice ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.store.push(entry);
    return { ...entry };
  }

  async update(id: string, patch: UpdateSavedSearchInput): Promise<SavedSearch | null> {
    const idx = this.store.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const existing = this.store[idx]!;
    const updated: SavedSearch = {
      ...existing,
      ...Object.fromEntries(
        Object.entries(patch).filter(([, v]) => v !== undefined),
      ),
      updatedAt: new Date().toISOString(),
    };
    this.store[idx] = updated;
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.store.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.store.splice(idx, 1);
    this.matchIds.delete(id);
    return true;
  }

  async findById(id: string): Promise<SavedSearch | null> {
    return this.store.find(s => s.id === id) ?? null;
  }

  async findByUser(userId: string): Promise<SavedSearch[]> {
    return [...this.store]
      .filter(s => s.userId === userId)
      .reverse();
  }

  async getAll(): Promise<SavedSearch[]> {
    return [...this.store];
  }

  async getMatchIds(id: string): Promise<string[]> {
    return [...(this.matchIds.get(id) ?? [])];
  }

  async setMatchIds(id: string, ids: string[]): Promise<void> {
    this.matchIds.set(id, [...ids]);
  }
}
