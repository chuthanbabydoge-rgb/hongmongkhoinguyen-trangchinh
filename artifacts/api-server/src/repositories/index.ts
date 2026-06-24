// ─────────────────────────────────────────────────────────────────────────────
// Repositories barrel export
// ─────────────────────────────────────────────────────────────────────────────

export { userRepository, InMemoryUserRepository }   from "./userRepository";
export type { IUserRepository }                     from "./userRepository";

export { avatarRepository, MockAvatarRepository }   from "./avatarRepository";
export type { IAvatarRepository }                   from "./avatarRepository";

export { reputationRepository, MockReputationRepository } from "./reputationRepository";
export type { IReputationRepository }               from "./reputationRepository";

export { walletRepository, MockWalletRepository }   from "./walletRepository";
export type { IWalletRepository }                   from "./walletRepository";

export { inventoryRepository, MockInventoryRepository } from "./inventoryRepository";
export type { IInventoryRepository }                from "./inventoryRepository";
