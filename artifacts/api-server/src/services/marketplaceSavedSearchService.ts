// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceSavedSearchService (V2.3)
//
// Business logic for saved marketplace searches — CRUD with validation.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ISavedSearchRepository,
  SavedSearch,
  CreateSavedSearchInput,
  UpdateSavedSearchInput,
} from "../repositories/marketplaceSavedSearchRepository";

export interface CreateSavedSearchRequest {
  userId:    string;
  name:      string;
  query?:    string | null;
  category?: string | null;
  rarity?:   string | null;
  currency?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export interface UpdateSavedSearchRequest {
  name?:     string;
  query?:    string | null;
  category?: string | null;
  rarity?:   string | null;
  currency?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export interface ISavedSearchService {
  create(input: CreateSavedSearchRequest): Promise<SavedSearch>;
  update(id: string, patch: UpdateSavedSearchRequest): Promise<SavedSearch | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<SavedSearch | null>;
  list(userId: string): Promise<SavedSearch[]>;
}

export class MarketplaceSavedSearchService implements ISavedSearchService {
  constructor(private readonly repo: ISavedSearchRepository) {}

  async create(input: CreateSavedSearchRequest): Promise<SavedSearch> {
    if (!input.userId?.trim()) throw new Error("userId là bắt buộc.");
    if (!input.name?.trim())   throw new Error("name là bắt buộc.");

    if (input.minPrice != null && input.maxPrice != null && input.minPrice > input.maxPrice) {
      throw new Error("minPrice không được lớn hơn maxPrice.");
    }

    const payload: CreateSavedSearchInput = {
      userId:   input.userId.trim(),
      name:     input.name.trim(),
      query:    input.query    ?? null,
      category: input.category ?? null,
      rarity:   input.rarity   ?? null,
      currency: input.currency ?? null,
      minPrice: input.minPrice ?? null,
      maxPrice: input.maxPrice ?? null,
    };

    return this.repo.create(payload);
  }

  async update(id: string, patch: UpdateSavedSearchRequest): Promise<SavedSearch | null> {
    if (!id?.trim()) throw new Error("id là bắt buộc.");

    if (patch.name !== undefined && !patch.name?.trim()) {
      throw new Error("name không được để trống.");
    }
    if (patch.minPrice != null && patch.maxPrice != null && patch.minPrice > patch.maxPrice) {
      throw new Error("minPrice không được lớn hơn maxPrice.");
    }

    const updatePayload: UpdateSavedSearchInput = {};
    if (patch.name     !== undefined) updatePayload.name     = patch.name?.trim();
    if (patch.query    !== undefined) updatePayload.query    = patch.query;
    if (patch.category !== undefined) updatePayload.category = patch.category;
    if (patch.rarity   !== undefined) updatePayload.rarity   = patch.rarity;
    if (patch.currency !== undefined) updatePayload.currency = patch.currency;
    if (patch.minPrice !== undefined) updatePayload.minPrice = patch.minPrice;
    if (patch.maxPrice !== undefined) updatePayload.maxPrice = patch.maxPrice;

    return this.repo.update(id, updatePayload);
  }

  delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  findById(id: string): Promise<SavedSearch | null> {
    return this.repo.findById(id);
  }

  list(userId: string): Promise<SavedSearch[]> {
    return this.repo.findByUser(userId);
  }
}
