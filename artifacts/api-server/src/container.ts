// ─────────────────────────────────────────────────────────────────────────────
// Composition Root (Dependency Injection Container)
//
// The ONLY place where concrete repository classes are instantiated.
// Controllers import pre-wired service instances from here — no repository
// implementation is imported anywhere else in the application.
//
// Environment strategy:
//   development (default) → Mock repositories (in-memory, no external deps)
//   production            → Supabase repositories (requires SUPABASE_URL +
//                           SUPABASE_ANON_KEY secrets to be set)
//
// To add a new environment (e.g. staging with a test DB):
//   1. Implement the Supabase* classes (already done).
//   2. Add a branch below that selects them.
//   3. No service or controller code needs to change.
// ─────────────────────────────────────────────────────────────────────────────

import { logger } from "./lib/logger";
import { isSupabaseConfigured } from "./database/supabase";

import type { IUserRepository }       from "./repositories/userRepository";
import type { IAvatarRepository }     from "./repositories/avatarRepository";
import type { IReputationRepository } from "./repositories/reputationRepository";
import type { IWalletRepository }     from "./repositories/walletRepository";
import type { IInventoryRepository }  from "./repositories/inventoryRepository";

import { MockUserRepository }        from "./repositories/userRepository";
import { MockAvatarRepository }      from "./repositories/avatarRepository";
import { MockReputationRepository }  from "./repositories/reputationRepository";
import { MockWalletRepository }      from "./repositories/walletRepository";
import { MockInventoryRepository }   from "./repositories/inventoryRepository";

import {
  SupabaseUserRepository,
  SupabaseAvatarRepository,
  SupabaseReputationRepository,
  SupabaseWalletRepository,
  SupabaseInventoryRepository,
} from "./repositories/supabase";

import { AccountService } from "./services/accountService";
import { ProfileService } from "./services/profileService";

// ─── Repository selection ─────────────────────────────────────────────────────

const useSupabase = isSupabaseConfigured();

let userRepo: IUserRepository;
let avatarRepo: IAvatarRepository;
let reputationRepo: IReputationRepository;
let walletRepo: IWalletRepository;
let inventoryRepo: IInventoryRepository;

if (useSupabase) {
  logger.info("Container: using Supabase repositories");
  userRepo       = new SupabaseUserRepository();
  avatarRepo     = new SupabaseAvatarRepository();
  reputationRepo = new SupabaseReputationRepository();
  walletRepo     = new SupabaseWalletRepository();
  inventoryRepo  = new SupabaseInventoryRepository();
} else {
  logger.info("Container: using Mock repositories (SUPABASE_URL / SUPABASE_ANON_KEY not set)");
  userRepo       = new MockUserRepository();
  avatarRepo     = new MockAvatarRepository();
  reputationRepo = new MockReputationRepository();
  walletRepo     = new MockWalletRepository();
  inventoryRepo  = new MockInventoryRepository();
}

// ─── Wired service instances ──────────────────────────────────────────────────
// Repository instances are shared so in-memory mock state stays consistent.

export const accountService = new AccountService(
  userRepo,
  avatarRepo,
  reputationRepo,
  walletRepo,
  inventoryRepo,
);

export const profileService = new ProfileService(
  userRepo,
  avatarRepo,
  reputationRepo,
);
