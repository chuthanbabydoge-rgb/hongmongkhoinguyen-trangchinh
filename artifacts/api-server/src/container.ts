// ─────────────────────────────────────────────────────────────────────────────
// Composition Root (Dependency Injection Container)
//
// This is the ONLY place in the codebase where concrete repository classes
// are instantiated.  Controllers import pre-wired service instances from here.
//
// To swap to PostgreSQL:
//   1. Implement DrizzleUserRepository, DrizzleAvatarRepository, etc.
//   2. Replace the Mock* instances below with Drizzle* instances.
//   3. No service, controller, or route file changes needed.
//
// Repository instances are shared across services so in-memory mock state
// stays consistent within a single process lifetime.
// ─────────────────────────────────────────────────────────────────────────────

import { MockUserRepository }        from "./repositories/userRepository";
import { MockAvatarRepository }      from "./repositories/avatarRepository";
import { MockReputationRepository }  from "./repositories/reputationRepository";
import { MockWalletRepository }      from "./repositories/walletRepository";
import { MockInventoryRepository }   from "./repositories/inventoryRepository";

import { AccountService }            from "./services/accountService";
import { ProfileService }            from "./services/profileService";

// ─── Shared repository instances ──────────────────────────────────────────────

const userRepo        = new MockUserRepository();
const avatarRepo      = new MockAvatarRepository();
const reputationRepo  = new MockReputationRepository();
const walletRepo      = new MockWalletRepository();
const inventoryRepo   = new MockInventoryRepository();

// ─── Wired service instances ──────────────────────────────────────────────────

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
