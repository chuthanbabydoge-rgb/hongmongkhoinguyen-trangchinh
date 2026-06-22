// ─────────────────────────────────────────────────────────────────────────────
// Repositories barrel export
// ─────────────────────────────────────────────────────────────────────────────

export {
  userRepository,
  MockUserRepository,
} from "./userRepository";
export type { IUserRepository } from "./userRepository";

export {
  reputationRepository,
  MockReputationRepository,
} from "./reputationRepository";
export type { IReputationRepository } from "./reputationRepository";

export {
  walletReferenceRepository,
  MockWalletReferenceRepository,
} from "./walletReferenceRepository";
export type { IWalletReferenceRepository } from "./walletReferenceRepository";

export {
  inventoryReferenceRepository,
  MockInventoryReferenceRepository,
} from "./inventoryReferenceRepository";
export type { IInventoryReferenceRepository } from "./inventoryReferenceRepository";
