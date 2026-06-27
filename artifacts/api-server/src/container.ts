import { logger } from "./lib/logger";
import { MarketplaceRealtimeService }         from "./services/marketplaceRealtimeService";
import { MarketplaceRecommendationService }    from "./services/marketplaceRecommendationService";
import { MockMarketplaceRecommendationRepository } from "./repositories/marketplaceRecommendationRepository";
import { SupabaseMarketplaceRecommendationRepository } from "./repositories/supabase/SupabaseMarketplaceRecommendationRepository";
import { MarketplacePricingService }           from "./services/marketplacePricingService";
import { MockMarketplacePricingRepository }    from "./repositories/marketplacePricingRepository";
import { SupabaseMarketplacePricingRepository } from "./repositories/supabase/SupabaseMarketplacePricingRepository";
import { isSupabaseConfigured } from "./database/supabase";
import { MockReputationRepository as MockMarketplaceReputationRepository } from "./repositories/marketplaceReputationRepository";
import { SupabaseMarketplaceReputationRepository }                         from "./repositories/supabase/SupabaseMarketplaceReputationRepository";
import { MarketplaceReputationService }                                    from "./services/marketplaceReputationService";
import { MockModerationRepository }                                        from "./repositories/marketplaceModerationRepository";
import { SupabaseMarketplaceModerationRepository }                         from "./repositories/supabase/SupabaseMarketplaceModerationRepository";
import { MarketplaceModerationService }                                    from "./services/marketplaceModerationService";
import { MarketplacePricePoller } from "./services/marketplacePricePoller";
import { MockSavedSearchRepository } from "./repositories/marketplaceSavedSearchRepository";
import { SupabaseMarketplaceSavedSearchRepository } from "./repositories/supabase/SupabaseMarketplaceSavedSearchRepository";
import { MarketplaceSavedSearchService } from "./services/marketplaceSavedSearchService";
import { MarketplaceSavedSearchPoller } from "./services/marketplaceSavedSearchPoller";
import { MockMarketplaceWatchlistRepository }    from "./repositories/marketplaceWatchlistRepository";
import { SupabaseMarketplaceWatchlistRepository } from "./repositories/supabase/SupabaseMarketplaceWatchlistRepository";
import { MarketplaceWatchlistService }            from "./services/marketplaceWatchlistService";

import type { IUserRepository }               from "./repositories/userRepository";
import type { IAvatarRepository }             from "./repositories/avatarRepository";
import type { IReputationRepository }         from "./repositories/reputationRepository";
import type { IWalletRepository }             from "./repositories/walletRepository";
import type { IWalletTransactionRepository }  from "./repositories/walletTransactionRepository";
import type { IInventoryRepository }          from "./repositories/inventoryRepository";
import type { IInventoryItemsRepository }     from "./repositories/inventoryItemsRepository";
import type {
  IListingsRepository,
  ITransactionsRepository,
  IAuctionsRepository,
  IBidsRepository,
  IMarketplaceStatsRepository,
} from "./repositories/marketplaceRepository";
import type { IInventoryItemsMutationRepository } from "./repositories/inventoryItemsMutationRepository";

import { InMemoryUserRepository }           from "./repositories/userRepository";
import { MockAvatarRepository }             from "./repositories/avatarRepository";
import { MockReputationRepository }         from "./repositories/reputationRepository";
import { MockWalletRepository }             from "./repositories/walletRepository";
import { MockWalletTransactionRepository }  from "./repositories/walletTransactionRepository";
import { DrizzleWalletRepository }                    from "./repositories/drizzle/DrizzleWalletRepository";
import { DrizzleWalletTransactionRepository }          from "./repositories/drizzle/DrizzleWalletTransactionRepository";
import { DrizzleUserRepository }                       from "./repositories/drizzle/DrizzleUserRepository";
import { DrizzleAvatarRepository }                     from "./repositories/drizzle/DrizzleAvatarRepository";
import { DrizzleReputationRepository }                 from "./repositories/drizzle/DrizzleReputationRepository";
import { DrizzleInventoryRepository }                  from "./repositories/drizzle/DrizzleInventoryRepository";
import { DrizzleInventoryItemsRepository }             from "./repositories/drizzle/DrizzleInventoryItemsRepository";
import { DrizzleInventoryItemsMutationRepository }     from "./repositories/drizzle/DrizzleInventoryItemsMutationRepository";
import { DrizzleMarketplaceListingsRepository }        from "./repositories/drizzle/DrizzleMarketplaceListingsRepository";
import { DrizzleMarketplaceTransactionsRepository }    from "./repositories/drizzle/DrizzleMarketplaceTransactionsRepository";
import { DrizzleMarketplaceAuctionsRepository }        from "./repositories/drizzle/DrizzleMarketplaceAuctionsRepository";
import { DrizzleMarketplaceBidsRepository }            from "./repositories/drizzle/DrizzleMarketplaceBidsRepository";
import { DrizzleMarketplaceStatsRepository }           from "./repositories/drizzle/DrizzleMarketplaceStatsRepository";
import { DrizzlePaymentRepository }                    from "./repositories/drizzle/DrizzlePaymentRepository";
import { DrizzleMarketplaceNotificationRepository }    from "./repositories/drizzle/DrizzleMarketplaceNotificationRepository";
import { DrizzleMarketplaceReputationRepository }      from "./repositories/drizzle/DrizzleMarketplaceReputationRepository";
import { DrizzleTreasuryRepository }                   from "./repositories/drizzle/DrizzleTreasuryRepository";
import { DrizzleMarketplaceAnalyticsRepository }       from "./repositories/drizzle/DrizzleMarketplaceAnalyticsRepository";
import { DrizzleWatchlistRepository }                  from "./repositories/drizzle/DrizzleWatchlistRepository";
import { DrizzleSavedSearchRepository }                from "./repositories/drizzle/DrizzleSavedSearchRepository";
import { DrizzlePricingRepository }                    from "./repositories/drizzle/DrizzlePricingRepository";
import { DrizzleRecommendationRepository }             from "./repositories/drizzle/DrizzleRecommendationRepository";
import { DrizzleModerationRepository }                 from "./repositories/drizzle/DrizzleModerationRepository";
import { DrizzleAppRegistryRepository }                from "./repositories/drizzle/DrizzleAppRegistryRepository";
import { DrizzleAppLauncherRepository }                from "./repositories/drizzle/DrizzleAppLauncherRepository";
import { DrizzleNotificationSyncRepository }           from "./repositories/drizzle/DrizzleNotificationSyncRepository";
import { InMemoryNotificationsRepository }             from "./repositories/notificationsRepository";
import { DrizzleNotificationsRepository }              from "./repositories/drizzle/DrizzleNotificationsRepository";
import { NotificationsService }                        from "./services/notificationsService";
import { InMemoryActivitiesRepository }                from "./repositories/activitiesRepository";
import { DrizzleActivitiesRepository }                 from "./repositories/drizzle/DrizzleActivitiesRepository";
import { ActivitiesService }                           from "./services/activitiesService";
import { InMemoryUserReputationRepository }            from "./repositories/userReputationRepository";
import { DrizzleUserReputationRepository }             from "./repositories/drizzle/DrizzleUserReputationRepository";
import { UserReputationService }                       from "./services/userReputationService";
import { InMemoryAchievementsRepository }              from "./repositories/achievementsRepository";
import { DrizzleAchievementsRepository }               from "./repositories/drizzle/DrizzleAchievementsRepository";
import { AchievementService }                          from "./services/achievementService";
import { DrizzleApplicationRegistryRepository }        from "./repositories/drizzle/DrizzleApplicationRegistryRepository";
import { DrizzleUserAppRepository }                    from "./repositories/drizzle/DrizzleUserAppRepository";
import { MockInventoryRepository }          from "./repositories/inventoryRepository";
import { MockInventoryItemsRepository }     from "./repositories/inventoryItemsRepository";
import { SupabaseInventoryItemsRepository } from "./repositories/supabase/SupabaseInventoryItemsRepository";
import {
  MockListingsRepository,
  MockTransactionsRepository,
  MockAuctionsRepository,
  MockBidsRepository,
  MockMarketplaceStatsRepository,
  MockInventoryItemsMutationRepository,
} from "./repositories/mockMarketplaceRepository";

import {
  SupabaseUserRepository,
  SupabaseAvatarRepository,
  SupabaseReputationRepository,
  SupabaseWalletRepository,
  SupabaseWalletTransactionRepository,
  SupabaseInventoryRepository,
  SupabaseMarketplaceListingsRepository,
  SupabaseMarketplaceTransactionsRepository,
  SupabaseMarketplaceAuctionsRepository,
  SupabaseMarketplaceBidsRepository,
} from "./repositories/supabase";
import { SupabaseMarketplaceStatsRepository }       from "./repositories/supabase/SupabaseMarketplaceStatsRepository";
import { SupabaseInventoryItemsMutationRepository } from "./repositories/supabase/SupabaseInventoryItemsMutationRepository";
import { SupabaseTreasuryRepository }              from "./repositories/supabase/SupabaseTreasuryRepository";
import { MockTreasuryRepository }                  from "./repositories/marketplaceTreasuryRepository";
import { MarketplaceTreasuryService }              from "./services/marketplaceTreasuryService";
import { SupabaseMarketplaceAnalyticsRepository }       from "./repositories/supabase/SupabaseMarketplaceAnalyticsRepository";
import { MockMarketplaceAnalyticsRepository }           from "./repositories/marketplaceStatsRepository";
import { MarketplaceStatsService }                      from "./services/marketplaceStatsService";
import { SupabaseMarketplaceNotificationRepository }    from "./repositories/supabase/SupabaseMarketplaceNotificationRepository";
import { MockMarketplaceNotificationRepository }        from "./repositories/marketplaceNotificationRepository";
import { MarketplaceNotificationService }               from "./services/marketplaceNotificationService";

import type { User } from "./models/user";
import type { Avatar } from "./models/user";
import type { Reputation, ReputationHistoryEntry } from "./models/reputation";
import type { WalletReference, WalletCurrency } from "./models/walletReference";
import { AccountService }              from "./services/accountService";
import { ProfileService }              from "./services/profileService";
import { WalletService }               from "./services/walletService";
import { InventoryService }            from "./services/inventoryService";
import { MarketplaceService }          from "./services/marketplaceService";
import { MarketplacePaymentService }   from "./services/marketplacePaymentService";
import { MockMarketplacePaymentRepository } from "./repositories/marketplacePaymentRepository";

// ─── Fallback repositories ────────────────────────────────────────────────────

class FallbackUserRepository implements IUserRepository {
  constructor(
    private readonly primary: IUserRepository,
    private readonly fallback: IUserRepository,
  ) {}
  async getById(id: string): Promise<User | null> {
    const result = await this.primary.getById(id);
    if (result) return result;
    logger.warn({ userId: id }, "Supabase: user not found — falling back to mock");
    return this.fallback.getById(id);
  }
  async getAll(): Promise<User[]> {
    const rows = await this.primary.getAll();
    return rows.length ? rows : this.fallback.getAll();
  }
  async create(user: User): Promise<User>        { return this.primary.create(user); }
  async update(user: User): Promise<User | null> { return this.primary.update(user); }
  async delete(id: string): Promise<boolean>     { return this.primary.delete(id); }
}

class FallbackAvatarRepository implements IAvatarRepository {
  constructor(
    private readonly primary: IAvatarRepository,
    private readonly fallback: IAvatarRepository,
  ) {}
  async getByUserId(userId: string): Promise<Avatar | null> {
    return await this.primary.getByUserId(userId) ?? this.fallback.getByUserId(userId);
  }
  async create(a: Avatar): Promise<Avatar>        { return this.primary.create(a); }
  async update(a: Avatar): Promise<Avatar | null> { return this.primary.update(a); }
  async delete(userId: string): Promise<boolean>  { return this.primary.delete(userId); }
}

class FallbackReputationRepository implements IReputationRepository {
  constructor(
    private readonly primary: IReputationRepository,
    private readonly fallback: IReputationRepository,
  ) {}
  async getByUserId(userId: string): Promise<Reputation | null> {
    return await this.primary.getByUserId(userId) ?? this.fallback.getByUserId(userId);
  }
  async create(r: Reputation): Promise<Reputation>        { return this.primary.create(r); }
  async update(r: Reputation): Promise<Reputation | null> { return this.primary.update(r); }
  async applyScoreDelta(userId: string, delta: number, reason: string): Promise<Reputation | null> {
    return this.primary.applyScoreDelta(userId, delta, reason);
  }
  async addBadge(userId: string, badgeId: string): Promise<Reputation | null> {
    return this.primary.addBadge(userId, badgeId);
  }
  async removeBadge(userId: string, badgeId: string): Promise<Reputation | null> {
    return this.primary.removeBadge(userId, badgeId);
  }
  async getHistory(userId: string, limit?: number): Promise<ReputationHistoryEntry[]> {
    return this.primary.getHistory(userId, limit);
  }
}

class FallbackWalletRepository implements IWalletRepository {
  constructor(
    private readonly primary: IWalletRepository,
    private readonly fallback: IWalletRepository,
  ) {}
  async getByUserId(userId: string): Promise<WalletReference | null> {
    const result = await this.primary.getByUserId(userId);
    if (result) return result;
    logger.warn({ userId }, "Supabase: wallet not found — falling back to mock");
    return this.fallback.getByUserId(userId);
  }
  async create(ref: WalletReference): Promise<WalletReference>        { return this.primary.create(ref); }
  async update(ref: WalletReference): Promise<WalletReference | null> { return this.primary.update(ref); }
  async syncBalance(userId: string, currency: WalletCurrency): Promise<WalletReference | null> {
    return this.primary.syncBalance(userId, currency);
  }
  async delete(userId: string): Promise<boolean> { return this.primary.delete(userId); }
}

class FallbackWalletTransactionRepository implements IWalletTransactionRepository {
  constructor(
    private readonly primary: IWalletTransactionRepository,
    private readonly fallback: IWalletTransactionRepository,
  ) {}
  async getByUserId(userId: string, limit?: number) {
    try {
      const rows = await this.primary.getByUserId(userId, limit);
      if (rows.length) return rows;
      logger.warn({ userId }, "Supabase: no wallet_transactions rows — falling back to mock");
      return this.fallback.getByUserId(userId, limit);
    } catch (err) {
      logger.warn({ err, userId }, "Supabase: wallet_transactions query failed — falling back to mock (table may not exist yet)");
      return this.fallback.getByUserId(userId, limit);
    }
  }
  async create(tx: Parameters<IWalletTransactionRepository["create"]>[0]) {
    return this.primary.create(tx);
  }
}

// ─── Repository selection ─────────────────────────────────────────────────────

const useSupabase = isSupabaseConfigured();
const useDrizzle  = Boolean(process.env["DATABASE_URL"]);

let userRepo:               IUserRepository;
let avatarRepo:             IAvatarRepository;
let reputationRepo:         IReputationRepository;
let walletRepo:             IWalletRepository;
let walletTransactionRepo:  IWalletTransactionRepository;
let inventoryRepo:          IInventoryRepository;
let inventoryItemsRepo:     IInventoryItemsRepository;

// ─── Marketplace — Supabase when configured, otherwise Mock ───────────────────
let listingsRepo:     IListingsRepository;
let transactionsRepo: ITransactionsRepository;
let auctionsRepo:     IAuctionsRepository;
let bidsRepo:         IBidsRepository;
let statsRepo:        IMarketplaceStatsRepository;
let inventoryMutationRepo: IInventoryItemsMutationRepository;

if (useSupabase) {
  listingsRepo          = new SupabaseMarketplaceListingsRepository();
  transactionsRepo      = new SupabaseMarketplaceTransactionsRepository();
  auctionsRepo          = new SupabaseMarketplaceAuctionsRepository();
  bidsRepo              = new SupabaseMarketplaceBidsRepository();
  statsRepo             = new SupabaseMarketplaceStatsRepository();
  inventoryMutationRepo = new SupabaseInventoryItemsMutationRepository();
  inventoryItemsRepo    = new SupabaseInventoryItemsRepository();
  logger.info("Container: marketplace → Supabase (6 repositories, inventory sync enabled)");
  logger.info("Container: inventory items → Supabase (SupabaseInventoryItemsRepository)");
} else if (useDrizzle) {
  listingsRepo          = new DrizzleMarketplaceListingsRepository();
  transactionsRepo      = new DrizzleMarketplaceTransactionsRepository();
  auctionsRepo          = new DrizzleMarketplaceAuctionsRepository();
  bidsRepo              = new DrizzleMarketplaceBidsRepository();
  statsRepo             = new DrizzleMarketplaceStatsRepository();
  inventoryMutationRepo = new DrizzleInventoryItemsMutationRepository();
  inventoryItemsRepo    = new DrizzleInventoryItemsRepository();
  logger.info("Container: marketplace → Drizzle/PostgreSQL (6 repositories, inventory sync enabled)");
  logger.info("Container: inventory items → Drizzle/PostgreSQL (DrizzleInventoryItemsRepository)");
} else {
  listingsRepo          = new MockListingsRepository();
  transactionsRepo      = new MockTransactionsRepository();
  auctionsRepo          = new MockAuctionsRepository();
  bidsRepo              = new MockBidsRepository();
  statsRepo             = new MockMarketplaceStatsRepository();
  inventoryMutationRepo = new MockInventoryItemsMutationRepository();
  inventoryItemsRepo    = new MockInventoryItemsRepository();
  logger.info("Container: marketplace → Mock (SUPABASE_URL / SUPABASE_ANON_KEY not set)");
  logger.info("Container: inventory items → Mock (SupabaseInventoryItemsRepository)");
}

if (useSupabase) {
  logger.info("Container: using Supabase repositories (mock fallback active for missing rows)");
  userRepo              = new FallbackUserRepository(new SupabaseUserRepository(), new InMemoryUserRepository());
  avatarRepo            = new FallbackAvatarRepository(new SupabaseAvatarRepository(), new MockAvatarRepository());
  reputationRepo        = new FallbackReputationRepository(new SupabaseReputationRepository(), new MockReputationRepository());
  walletRepo            = new FallbackWalletRepository(new SupabaseWalletRepository(), new MockWalletRepository());
  walletTransactionRepo = new FallbackWalletTransactionRepository(new SupabaseWalletTransactionRepository(), new MockWalletTransactionRepository());
  inventoryRepo         = new SupabaseInventoryRepository();
} else if (useDrizzle) {
  logger.info("Container: using Drizzle (PostgreSQL) repositories for all entities");
  userRepo              = new DrizzleUserRepository();
  avatarRepo            = new DrizzleAvatarRepository();
  reputationRepo        = new DrizzleReputationRepository();
  walletRepo            = new DrizzleWalletRepository();
  walletTransactionRepo = new DrizzleWalletTransactionRepository();
  inventoryRepo         = new DrizzleInventoryRepository();
} else {
  logger.info("Container: using Mock repositories (SUPABASE_URL / SUPABASE_ANON_KEY not set)");
  userRepo              = new InMemoryUserRepository();
  avatarRepo            = new MockAvatarRepository();
  reputationRepo        = new MockReputationRepository();
  walletRepo            = new MockWalletRepository();
  walletTransactionRepo = new MockWalletTransactionRepository();
  inventoryRepo         = new MockInventoryRepository();
}

// ─── Real-time service (V2.6) ─────────────────────────────────────────────────

export const marketplaceRealtimeService = new MarketplaceRealtimeService();
logger.info("Container: marketplace realtime service → active");

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

// ─── User Notifications (wired early — other services depend on it) ───────────

const userNotifRepo = useDrizzle || useSupabase
  ? new DrizzleNotificationsRepository()
  : new InMemoryNotificationsRepository();
logger.info(`Container: user notifications → ${useDrizzle || useSupabase ? "Drizzle" : "InMemory"}`);
export const notificationsService = new NotificationsService(userNotifRepo);

// ─── Activities (HUB-8) ───────────────────────────────────────────────────────

const activitiesRepo = useDrizzle || useSupabase
  ? new DrizzleActivitiesRepository()
  : new InMemoryActivitiesRepository();
logger.info(`Container: activities → ${useDrizzle || useSupabase ? "Drizzle" : "InMemory"}`);
export const activitiesService = new ActivitiesService(activitiesRepo);

// ─── User Reputation + Achievements (HUB-9) ──────────────────────────────────

const userReputationRepo = useDrizzle || useSupabase
  ? new DrizzleUserReputationRepository()
  : new InMemoryUserReputationRepository();
logger.info(`Container: user reputation → ${useDrizzle || useSupabase ? "Drizzle" : "InMemory"}`);
export const userReputationService = new UserReputationService(userReputationRepo);

const achievementsRepo = useDrizzle || useSupabase
  ? new DrizzleAchievementsRepository()
  : new InMemoryAchievementsRepository();
logger.info(`Container: achievements → ${useDrizzle || useSupabase ? "Drizzle" : "InMemory"}`);
export const achievementService = new AchievementService(achievementsRepo, notificationsService);

// ─────────────────────────────────────────────────────────────────────────────

export const walletService = new WalletService(
  walletRepo,
  walletTransactionRepo,
  notificationsService,
  userReputationService,
  achievementService,
);

export const inventoryService = new InventoryService(inventoryItemsRepo, activitiesService, userReputationService, achievementService);

const marketplacePaymentRepo          = useDrizzle || useSupabase ? new DrizzlePaymentRepository() : new MockMarketplacePaymentRepository();
export const marketplacePaymentService = new MarketplacePaymentService(walletRepo, marketplacePaymentRepo);

// ─── Marketplace Notifications (V1.7) ─────────────────────────────────────────

const notificationRepo = useSupabase
  ? new SupabaseMarketplaceNotificationRepository()
  : useDrizzle
    ? new DrizzleMarketplaceNotificationRepository()
    : new MockMarketplaceNotificationRepository();
logger.info(`Container: marketplace notifications → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "Mock"}`);

export const marketplaceNotificationService = new MarketplaceNotificationService(notificationRepo, marketplaceRealtimeService);

// ─── Reputation (V2.4) ────────────────────────────────────────────────────────

const marketplaceReputationRepo = useSupabase
  ? new SupabaseMarketplaceReputationRepository()
  : useDrizzle
    ? new DrizzleMarketplaceReputationRepository()
    : new MockMarketplaceReputationRepository();
logger.info(`Container: seller reputation → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "Mock"}`);

export const sellerReputationService = new MarketplaceReputationService(marketplaceReputationRepo, undefined, marketplaceRealtimeService);

export { inventoryMutationRepo };

export const marketplaceService = new MarketplaceService(
  listingsRepo,
  transactionsRepo,
  auctionsRepo,
  bidsRepo,
  statsRepo,
  inventoryMutationRepo,
  marketplacePaymentService,
  marketplaceNotificationService,
  sellerReputationService,
  marketplaceRealtimeService,
  notificationsService,
  userReputationService,
  achievementService,
);

// ─── Treasury ─────────────────────────────────────────────────────────────────

const treasuryRepo = useSupabase
  ? new SupabaseTreasuryRepository()
  : useDrizzle
    ? new DrizzleTreasuryRepository()
    : new MockTreasuryRepository();
logger.info(`Container: treasury → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "Mock"}`);

export const marketplaceTreasuryService = new MarketplaceTreasuryService(treasuryRepo);

// ─── Marketplace Analytics (V1.6) ─────────────────────────────────────────────

const analyticsRepo = useSupabase
  ? new SupabaseMarketplaceAnalyticsRepository()
  : useDrizzle
    ? new DrizzleMarketplaceAnalyticsRepository()
    : new MockMarketplaceAnalyticsRepository();
logger.info(`Container: marketplace analytics → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "Mock"}`);

export const marketplaceStatsService = new MarketplaceStatsService(analyticsRepo);

// ─── Watchlist (V2.1) ─────────────────────────────────────────────────────────

const watchlistRepo = useSupabase
  ? new SupabaseMarketplaceWatchlistRepository()
  : useDrizzle
    ? new DrizzleWatchlistRepository()
    : new MockMarketplaceWatchlistRepository();
logger.info(`Container: marketplace watchlist → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "Mock"}`);

export const marketplaceWatchlistService = new MarketplaceWatchlistService(
  watchlistRepo,
  marketplaceNotificationService,
  marketplaceRealtimeService,
);

// ─── Price Poller (V2.2) ──────────────────────────────────────────────────────

const pollIntervalMs = Number(process.env["MARKETPLACE_PRICE_POLL_INTERVAL_MS"] ?? 300_000);

export const marketplacePricePoller = new MarketplacePricePoller(
  watchlistRepo,
  listingsRepo,
  auctionsRepo,
  marketplaceWatchlistService,
  pollIntervalMs,
);

marketplacePricePoller.start();

// ─── Saved Searches (V2.3) ────────────────────────────────────────────────────

const savedSearchRepo = useSupabase
  ? new SupabaseMarketplaceSavedSearchRepository()
  : useDrizzle
    ? new DrizzleSavedSearchRepository()
    : new MockSavedSearchRepository();
logger.info(`Container: saved searches → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "Mock"}`);

export const savedSearchService = new MarketplaceSavedSearchService(savedSearchRepo);

const searchPollIntervalMs = Number(process.env["MARKETPLACE_SEARCH_POLL_INTERVAL_MS"] ?? 300_000);

export const savedSearchPoller = new MarketplaceSavedSearchPoller(
  savedSearchRepo,
  listingsRepo,
  marketplaceNotificationService,
  searchPollIntervalMs,
);

savedSearchPoller.start();

// ─── Pricing Intelligence (V2.8) ─────────────────────────────────────────────

const pricingRepo = useSupabase
  ? new SupabaseMarketplacePricingRepository()
  : useDrizzle
    ? new DrizzlePricingRepository()
    : new MockMarketplacePricingRepository();
logger.info(`Container: pricing → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "Mock"}`);

export const pricingService = new MarketplacePricingService(pricingRepo);

// ─── Recommendation (V2.7) ───────────────────────────────────────────────────

const recommendationRepo = useSupabase
  ? new SupabaseMarketplaceRecommendationRepository()
  : useDrizzle
    ? new DrizzleRecommendationRepository()
    : new MockMarketplaceRecommendationRepository();
logger.info(`Container: recommendations → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "Mock"}`);

export const recommendationService = new MarketplaceRecommendationService(recommendationRepo);

// ─── Moderation (V2.5) ────────────────────────────────────────────────────────

const moderationRepo = useSupabase
  ? new SupabaseMarketplaceModerationRepository()
  : useDrizzle
    ? new DrizzleModerationRepository()
    : new MockModerationRepository();
logger.info(`Container: moderation → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "Mock"}`);

export const moderationService = new MarketplaceModerationService(
  moderationRepo,
  listingsRepo,
  auctionsRepo,
  null,
  marketplaceRealtimeService,
);

// ─── Account Bridge (HUB-1) ───────────────────────────────────────────────────

import { createAccountClient } from "./services/accountClient.js";
import { AccountBridgeService } from "./services/accountBridgeService.js";
import { DevTestAccountClient } from "./services/devTestAccountClient.js";

const _rawAccountClient = createAccountClient();
export const accountClient =
  process.env["NODE_ENV"] !== "production"
    ? new DevTestAccountClient(_rawAccountClient)
    : _rawAccountClient;
export const accountBridgeService = new AccountBridgeService(accountClient);

// ─── Ecosystem Registry (HUB-2) ───────────────────────────────────────────────

import { InMemoryAppRegistryRepository } from "./repositories/appRegistryRepository.js";
import { SupabaseAppRegistryRepository } from "./repositories/supabase/SupabaseAppRegistryRepository.js";
import { AppRegistryService }            from "./services/appRegistryService.js";

const appRegistryRepo = useSupabase
  ? new SupabaseAppRegistryRepository()
  : useDrizzle
    ? new DrizzleAppRegistryRepository()
    : new InMemoryAppRegistryRepository();
logger.info(`Container: ecosystem registry → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "InMemory"}`);

export const appRegistryService = new AppRegistryService(appRegistryRepo);

appRegistryService.initialize().catch((err: unknown) =>
  logger.error({ err }, "AppRegistry: seed failed"),
);

// ─── App Launcher (HUB-3) ─────────────────────────────────────────────────────

import { InMemoryAppLauncherRepository }  from "./repositories/appLauncherRepository.js";
import { SupabaseAppLauncherRepository }  from "./repositories/supabase/SupabaseAppLauncherRepository.js";
import { AppLauncherService }             from "./services/appLauncherService.js";

const appLauncherRepo = useSupabase
  ? new SupabaseAppLauncherRepository()
  : useDrizzle
    ? new DrizzleAppLauncherRepository()
    : new InMemoryAppLauncherRepository();
logger.info(`Container: app launcher → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "InMemory"}`);

export const appLauncherService = new AppLauncherService(appLauncherRepo, appRegistryService);

// ─── Notification Sync Center (HUB-4) ─────────────────────────────────────────

import { InMemoryNotificationSyncRepository }  from "./repositories/notificationSyncRepository.js";
import { SupabaseNotificationSyncRepository }  from "./repositories/supabase/SupabaseNotificationSyncRepository.js";
import { NotificationSyncService }             from "./services/notificationSyncService.js";

const notificationSyncRepo = useSupabase
  ? new SupabaseNotificationSyncRepository()
  : useDrizzle
    ? new DrizzleNotificationSyncRepository()
    : new InMemoryNotificationSyncRepository();
logger.info(`Container: notification sync → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "InMemory"}`);

export const notificationSyncService = new NotificationSyncService(notificationSyncRepo, accountClient);

// ─── Application Registry (HUB-5) ─────────────────────────────────────────────

import { InMemoryApplicationRegistryRepository, InMemoryUserAppRepository } from "./repositories/applicationRegistryRepository.js";
import { SupabaseApplicationRegistryRepository } from "./repositories/supabase/SupabaseApplicationRegistryRepository.js";
import { SupabaseUserAppRepository } from "./repositories/supabase/SupabaseUserAppRepository.js";
import { ApplicationRegistryService } from "./services/applicationRegistryService.js";

const applicationRegistryRepo = useSupabase
  ? new SupabaseApplicationRegistryRepository()
  : useDrizzle
    ? new DrizzleApplicationRegistryRepository()
    : new InMemoryApplicationRegistryRepository();

const userAppRepo = useSupabase
  ? new SupabaseUserAppRepository()
  : useDrizzle
    ? new DrizzleUserAppRepository()
    : new InMemoryUserAppRepository();

logger.info(`Container: application registry (HUB-5) → ${useSupabase ? "Supabase" : useDrizzle ? "Drizzle" : "InMemory"}`);

export const applicationRegistryService = new ApplicationRegistryService(
  applicationRegistryRepo,
  userAppRepo,
);

// ─── Social Graph (HUB-10) ────────────────────────────────────────────────────

import { InMemorySocialRepository } from "./repositories/socialRepository.js";
import { DrizzleSocialRepository }  from "./repositories/drizzle/DrizzleSocialRepository.js";
import { SocialService }            from "./services/socialService.js";

const socialRepo = useDrizzle
  ? new DrizzleSocialRepository()
  : new InMemorySocialRepository();
logger.info(`Container: social graph → ${useDrizzle ? "Drizzle" : "InMemory"}`);

export const socialService = new SocialService(socialRepo, notificationsService, activitiesService);

// ─── Guild System (HUB-11) ────────────────────────────────────────────────────

import { DrizzleGuildRepository } from "./repositories/drizzle/DrizzleGuildRepository.js";
import { GuildService }           from "./services/guildService.js";

const guildRepo = new DrizzleGuildRepository();
logger.info("Container: guild system → Drizzle");

export const guildService = new GuildService(guildRepo, notificationsService, activitiesService, userReputationService);

// ─── Quest / Mission System (HUB-12) ─────────────────────────────────────────

import { DrizzleQuestRepository } from "./repositories/drizzle/DrizzleQuestRepository.js";
import { QuestService }           from "./services/questService.js";

const questRepo = new DrizzleQuestRepository();
logger.info("Container: quest system → Drizzle");

export const questService = new QuestService(
  questRepo,
  walletService,
  userReputationService,
  achievementService,
  notificationsService,
  activitiesService,
);

questService.seedDefaultQuests().catch((err) => logger.warn({ err }, "Quest seed skipped"));

// ─── Quest Progress Engine (HUB-12.5) ────────────────────────────────────────

import { QuestProgressEngine } from "./services/questProgressEngine.js";

export const questProgressEngine = new QuestProgressEngine(questService);
questProgressEngine.start();
logger.info("Container: quest progress engine → active");

// ─── Mail & Inbox System (HUB-13) ────────────────────────────────────────────

import { DrizzleMailRepository } from "./repositories/drizzle/DrizzleMailRepository.js";
import { MailService }           from "./services/mailService.js";

const mailRepo = new DrizzleMailRepository();
logger.info("Container: mail system → Drizzle");

export const mailService = new MailService(
  mailRepo,
  notificationsService,
  activitiesService,
  userReputationService,
);

// ─── Chat & Messaging System (HUB-14) ────────────────────────────────────────

import { DrizzleChatRepository } from "./repositories/drizzle/DrizzleChatRepository.js";
import { ChatService }           from "./services/chatService.js";

const chatRepo = new DrizzleChatRepository();
logger.info("Container: chat system → Drizzle");

export const chatService = new ChatService(
  chatRepo,
  notificationsService,
  activitiesService,
  userReputationService,
);

// Seed "chat" app into ecosystem registry
appRegistryService.registerApp({
  slug:        "chat",
  name:        "Universe Chat",
  description: "Nhắn tin realtime cho toàn bộ Universe Platform",
  icon:        "💬",
  url:         "/chat",
  category:    "SOCIAL",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

// Seed "mail" app into ecosystem registry
appRegistryService.registerApp({
  slug:        "mail",
  name:        "Universe Mail",
  description: "Hộp thư, phần thưởng và thông báo của Universe Platform",
  icon:        "📬",
  url:         "/mail",
  category:    "UTILITY",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

// ─── AI Companion (HUB-16) ────────────────────────────────────────────────────

import { InMemoryAiRepository }  from "./repositories/aiRepository.js";
import { DrizzleAiRepository }   from "./repositories/drizzle/DrizzleAiRepository.js";
import { AiService }             from "./services/aiService.js";
import { MockProvider }          from "./services/ai/MockProvider.js";
import { OpenAIProvider }        from "./services/ai/OpenAIProvider.js";
import { GeminiProvider }        from "./services/ai/GeminiProvider.js";

const aiRepo = useDrizzle
  ? new DrizzleAiRepository()
  : new InMemoryAiRepository();
logger.info(`Container: AI repository → ${useDrizzle ? "Drizzle" : "InMemory"}`);

const _openaiKey = process.env["OPENAI_API_KEY"];
const _geminiKey = process.env["GEMINI_API_KEY"] ?? process.env["GOOGLE_AI_API_KEY"];
const aiProvider = _openaiKey
  ? new OpenAIProvider(_openaiKey)
  : _geminiKey
    ? new GeminiProvider(_geminiKey)
    : new MockProvider();
logger.info(`Container: AI provider → ${aiProvider.name}`);

export const aiService = new AiService(
  aiRepo,
  aiProvider,
  notificationsService,
  activitiesService,
  userReputationService,
  {
    getWalletContext: async (userId) => {
      try {
        const w = await walletService.getWallet(userId);
        return { credits: w.credits, coins: (w as any).coins ?? 0, tokens: (w as any).tokens ?? 0 };
      } catch { return {}; }
    },
    getInventoryContext: async (userId) => {
      try {
        const s = await inventoryService.getInventorySummary(userId);
        return { itemCount: (s as any).totalAssets ?? (s as any).totalItems ?? 0 };
      } catch { return {}; }
    },
    getQuestContext: async (userId) => {
      try {
        const qs = await questService.getMyQuests(userId);
        return qs.map(q => ({ id: q.quest.id, title: q.quest.title, status: q.userQuest.status }));
      } catch { return []; }
    },
    getGuildContext: async (_userId) => {
      // No direct userId→guild lookup without guildId; return empty and let guild section be absent
      return {};
    },
    getWorldContext: async (_userId) => {
      try {
        const worlds = await worldService.getFeaturedWorlds(5);
        return { featuredWorldCount: worlds.length };
      } catch { return {}; }
    },
    getMailContext: async (userId) => {
      try {
        const count = await mailService.getUnreadCount(userId);
        return { unreadCount: count };
      } catch { return {}; }
    },
    getSocialContext: async (userId) => {
      try {
        const [friends, followers] = await Promise.all([
          socialService.getFriends(userId),
          socialService.getFollowers(userId),
        ]);
        return { friendCount: friends.length, followerCount: followers.length };
      } catch { return {}; }
    },
    getMarketplaceContext: async (userId) => {
      try {
        const txns = await marketplaceService.getTransactionsByUser(userId, 10);
        return { recentTransactions: txns.length };
      } catch { return {}; }
    },
  },
);

// ─── Universe Worlds (HUB-15) ─────────────────────────────────────────────────

import { InMemoryWorldRepository }  from "./repositories/worldRepository.js";
import { DrizzleWorldRepository }   from "./repositories/drizzle/DrizzleWorldRepository.js";
import { WorldService }             from "./services/worldService.js";

const worldRepo = useDrizzle ? new DrizzleWorldRepository() : new InMemoryWorldRepository();
logger.info(`Container: world system → ${useDrizzle ? "Drizzle" : "InMemory"}`);

export const worldService = new WorldService(
  worldRepo,
  notificationsService,
  activitiesService,
  userReputationService,
);

// ─── HUB-17 Economy & Crafting ────────────────────────────────────────────────

import { DrizzleCraftingRepository } from "./repositories/drizzle/DrizzleCraftingRepository.js";
import { CraftingService }           from "./services/craftingService.js";
import { ResourceService }           from "./services/resourceService.js";
import { NPCShopService }            from "./services/npcShopService.js";
import { EconomyService }            from "./services/economyService.js";

const craftingRepo = new DrizzleCraftingRepository();
logger.info("Container: crafting system → Drizzle");

// ─── HUB-18: Character System ─────────────────────────────────────────────────
import { DrizzleCharacterRepository } from "./repositories/drizzle/DrizzleCharacterRepository.js";
import { CharacterService }           from "./services/characterService.js";

const characterRepo = new DrizzleCharacterRepository();
logger.info("Container: character system → Drizzle");

export const characterService = new CharacterService(
  characterRepo, notificationsService, activitiesService, userReputationRepo,
);

characterRepo.seedLevelTable().catch(() => {});
characterRepo.seedSkillTrees().catch(() => {});

appRegistryService.registerApp({
  slug:        "character",
  name:        "Universe Character",
  description: "Quản lý nhân vật, kỹ năng, trang bị và tiến trình trong Universe Ecosystem",
  icon:        "🧙",
  url:         "/character",
  category:    "UTILITY",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

export const craftingService = new CraftingService(
  craftingRepo, notificationsService, activitiesService, userReputationRepo,
);
export const resourceService = new ResourceService(
  craftingRepo, notificationsService, activitiesService, userReputationRepo,
);
export const npcShopService = new NPCShopService(
  craftingRepo, notificationsService, activitiesService, userReputationRepo,
);
export const economyService = new EconomyService(craftingRepo);

// Seed defaults
craftingRepo.seedDefaultStations().catch(() => {});
craftingRepo.seedDefaultRecipes().catch(() => {});
craftingRepo.seedDefaultNodes().catch(() => {});
craftingRepo.seedDefaultShops().catch(() => {});
craftingRepo.seedMarketPrices().catch(() => {});

// Seed "worlds" app into ecosystem registry
appRegistryService.registerApp({
  slug:        "worlds",
  name:        "Universe Worlds",
  description: "Khám phá, tạo và du hành giữa các thế giới trong Universe Ecosystem",
  icon:        "🌍",
  url:         "/worlds",
  category:    "WORLD",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

// ─── HUB-19: Combat Engine ────────────────────────────────────────────────────
import { DrizzleCombatRepository } from "./repositories/drizzle/DrizzleCombatRepository.js";
import { CombatService }           from "./services/combatService.js";

const combatRepo = new DrizzleCombatRepository();
logger.info("Container: combat system → Drizzle");

export const combatService = new CombatService(
  combatRepo, notificationsService, activitiesService, userReputationRepo, characterService,
);

combatRepo.seedBosses().catch(() => {});
combatRepo.seedSkills().catch(() => {});

appRegistryService.registerApp({
  slug:        "combat",
  name:        "Universe Combat",
  description: "Hệ thống chiến đấu — PVP, PVE, Boss, Arena và Dungeon trong Universe Ecosystem",
  icon:        "⚔️",
  url:         "/combat",
  category:    "OTHER",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

// ─── HUB-20: Pet & Mount System ───────────────────────────────────────────────
import { DrizzlePetRepository }   from "./repositories/drizzle/DrizzlePetRepository.js";
import { DrizzleMountRepository } from "./repositories/drizzle/DrizzleMountRepository.js";
import { PetService }             from "./services/petService.js";
import { MountService }           from "./services/mountService.js";

const petRepo   = new DrizzlePetRepository();
const mountRepo = new DrizzleMountRepository();
logger.info("Container: pet & mount system → Drizzle");

export const petService = new PetService(
  petRepo, notificationsService, activitiesService, userReputationRepo,
);
export const mountService = new MountService(
  mountRepo, notificationsService, activitiesService, userReputationRepo,
);

petRepo.seedSpecies().catch(() => {});
petRepo.seedLevelTable().catch(() => {});
petRepo.seedSkills().catch(() => {});
mountRepo.seedMountTypes().catch(() => {});
mountRepo.seedLevelTable().catch(() => {});
mountRepo.seedRoutes().catch(() => {});

appRegistryService.registerApp({
  slug:        "pets",
  name:        "Universe Pets",
  description: "Hệ thống thu phục, huấn luyện và tiến hóa pet trong Universe Ecosystem",
  icon:        "🐾",
  url:         "/pets",
  category:    "ANIMAL",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

appRegistryService.registerApp({
  slug:        "mounts",
  name:        "Universe Mounts",
  description: "Hệ thống chiến kỵ, du hành và tùy chỉnh mount trong Universe Ecosystem",
  icon:        "🐴",
  url:         "/mounts",
  category:    "ANIMAL",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

// ─── HUB-21: Dungeon & Raid System ───────────────────────────────────────────
import { DrizzleDungeonRepository } from "./repositories/drizzle/DrizzleDungeonRepository.js";
import { DrizzleRaidRepository }    from "./repositories/drizzle/DrizzleRaidRepository.js";
import { DungeonService }           from "./services/dungeonService.js";
import { RaidService }              from "./services/raidService.js";

const dungeonRepo = new DrizzleDungeonRepository();
const raidRepo    = new DrizzleRaidRepository();
logger.info("Container: dungeon & raid system → Drizzle");

export const dungeonService = new DungeonService(
  dungeonRepo, notificationsService, activitiesService, userReputationRepo,
);
export const raidService = new RaidService(
  raidRepo, notificationsService, activitiesService, userReputationRepo,
);

dungeonRepo.seedDungeons().catch(() => {});
dungeonRepo.seedBosses().catch(() => {});
raidRepo.seedBosses().catch(() => {});

appRegistryService.registerApp({
  slug:        "dungeons",
  name:        "Universe Dungeon",
  description: "Hệ thống hang ngục — khám phá, chiến đấu và nhận phần thưởng trong Universe Ecosystem",
  icon:        "⚔️",
  url:         "/dungeons",
  category:    "OTHER",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

appRegistryService.registerApp({
  slug:        "raids",
  name:        "Universe Raid",
  description: "Hệ thống raid boss — tập hợp đội nhóm lớn để chinh phục những kẻ thù mạnh nhất",
  icon:        "👹",
  url:         "/raids",
  category:    "OTHER",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

// ─── HUB-22: Boss AI & Dynamic World Events ───────────────────────────────────
import { DrizzleBossRepository }       from "./repositories/drizzle/DrizzleBossRepository.js";
import { DrizzleWorldEventRepository } from "./repositories/drizzle/DrizzleWorldEventRepository.js";
import { BossAIService }               from "./services/bossAIService.js";
import { WorldEventService, WeatherService } from "./services/worldEventService.js";
import { DrizzlePvpRepository }        from "./repositories/drizzle/DrizzlePvpRepository.js";
import { DrizzleTournamentRepository } from "./repositories/drizzle/DrizzleTournamentRepository.js";
import { PvpService }                  from "./services/pvpService.js";
import { MatchmakingService }          from "./services/matchmakingService.js";
import { RankingService }              from "./services/rankingService.js";
import { TournamentService }           from "./services/tournamentService.js";

const bossRepo       = new DrizzleBossRepository();
const worldEventRepo = new DrizzleWorldEventRepository();
logger.info("Container: boss AI & world events → Drizzle");

export const bossAIService = new BossAIService(
  bossRepo, notificationsService, activitiesService, userReputationRepo,
);
export const worldEventService = new WorldEventService(
  worldEventRepo, notificationsService, activitiesService, userReputationRepo,
);
export const weatherService = new WeatherService(
  worldEventRepo, notificationsService, activitiesService,
);

bossRepo.seedBosses().catch(() => {});
bossRepo.seedSkills().catch(() => {});
bossRepo.seedPhases().catch(() => {});
worldEventRepo.seedEvents().catch(() => {});
worldEventRepo.seedWeather().catch(() => {});

// ─── HUB-23: PvP Arena, Ranked Seasons & Tournament ──────────────────────────

const pvpRepo        = new DrizzlePvpRepository();
const tournamentRepo = new DrizzleTournamentRepository();
logger.info("Container: PvP Arena & Tournament → Drizzle");

export const pvpService = new PvpService(
  pvpRepo, notificationsService, activitiesService, userReputationRepo,
);
export const rankingService = new RankingService(
  pvpRepo, notificationsService,
);
export const tournamentService = new TournamentService(
  tournamentRepo, pvpRepo, pvpService, notificationsService, activitiesService, userReputationRepo,
);
export const matchmakingService = new MatchmakingService(pvpRepo, pvpService);

pvpRepo.seedSeason().catch(() => {});

appRegistryService.registerApp({
  slug:        "bosses",
  name:        "Universe Bosses",
  description: "Chiến đấu với boss thế giới — phần thưởng huyền thoại chờ đợi những anh hùng dũng cảm",
  icon:        "💀",
  url:         "/bosses",
  category:    "OTHER",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

appRegistryService.registerApp({
  slug:        "world-events",
  name:        "Universe World Events",
  description: "Sự kiện thế giới động — cùng cộng đồng tham gia các sự kiện thời gian thực",
  icon:        "🌍",
  url:         "/world-events",
  category:    "OTHER",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

// ─── HUB-24: Universe Creator Core ───────────────────────────────────────────
import { DrizzleCreatorRepository } from "./repositories/drizzle/DrizzleCreatorRepository.js";
import { CreatorService }           from "./services/creatorService.js";

const creatorRepo = new DrizzleCreatorRepository();
logger.info("Container: creator system → Drizzle");

export const creatorService = new CreatorService(
  creatorRepo, notificationsService, activitiesService, userReputationRepo,
);

creatorRepo.seedCategories().catch(() => {});

appRegistryService.registerApp({
  slug:        "creator",
  name:        "Universe Creator",
  description: "Công cụ sáng tạo nội dung — tạo thế giới, nhiệm vụ, nhân vật và dự án trong Universe Ecosystem",
  icon:        "🎨",
  url:         "/creator",
  category:    "CREATOR",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

// ─── HUB-25: Universe Education System ───────────────────────────────────────
import { DrizzleEducationRepository } from "./repositories/drizzle/DrizzleEducationRepository.js";
import { EducationService }           from "./services/educationService.js";

const educationRepo = new DrizzleEducationRepository();
logger.info("Container: education system → Drizzle");

export const educationService = new EducationService(
  educationRepo, notificationsService, activitiesService, userReputationRepo,
);

educationRepo.seedData().catch(() => {});

appRegistryService.registerApp({
  slug:        "education",
  name:        "Universe Education",
  description: "Nền tảng giáo dục Universe — khoá học, bài thi, chứng chỉ và lớp học trực tuyến",
  icon:        "🎓",
  url:         "/education",
  category:    "EDUCATION",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

// ─── HUB-26: Universe Sports Framework ───────────────────────────────────────
import { DrizzleSportsRepository } from "./repositories/drizzle/DrizzleSportsRepository.js";
import { SportsService }           from "./services/sportsService.js";

const sportsRepo = new DrizzleSportsRepository();
logger.info("Container: sports framework → Drizzle");

export const sportsService = new SportsService(
  sportsRepo, notificationsService, activitiesService, userReputationRepo,
);

sportsRepo.seedData().catch(() => {});

appRegistryService.registerApp({
  slug:        "sports",
  name:        "Universe Sports",
  description: "Nền tảng thể thao Universe — bóng đá, bóng rổ, võ thuật, e-sports và các môn thể thao khác",
  icon:        "🏆",
  url:         "/sports",
  category:    "SPORT",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

// ─── HUB-27: Universe Business Framework ─────────────────────────────────────
import { DrizzleBusinessRepository } from "./repositories/drizzle/DrizzleBusinessRepository.js";
import { BusinessService }           from "./services/businessService.js";
import { DrizzleLandRepository }     from "./repositories/drizzle/DrizzleLandRepository.js";
import { LandService }               from "./services/landService.js";

const businessRepo = new DrizzleBusinessRepository();
logger.info("Container: business framework → Drizzle");

export const businessService = new BusinessService(
  businessRepo, notificationsService, activitiesService, userReputationRepo,
);

businessRepo.seedData().catch(() => {});

// ─── HUB-28: Universe Land Framework ─────────────────────────────────────────

const landRepo = new DrizzleLandRepository();
logger.info("Container: land framework → Drizzle");

export const landService = new LandService(
  landRepo, notificationsService, activitiesService, userReputationRepo,
);

landRepo.seedData().catch(() => {});

appRegistryService.registerApp({
  slug:        "land",
  name:        "Universe Land",
  description: "Hạ tầng đất đai Universe — vùng, thành phố, quận, ô đất, công trình và hệ thống bất động sản",
  icon:        "🏞️",
  url:         "/land",
  category:    "LAND",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

appRegistryService.registerApp({
  slug:        "business",
  name:        "Universe Business",
  description: "Hạ tầng doanh nghiệp Universe — công ty, nhân viên, kho hàng, nhà máy, thương hiệu và phân tích kinh doanh",
  icon:        "🏢",
  url:         "/business",
  category:    "BUSINESS",
  status:      "ACTIVE",
  version:     "1.0.0",
}).catch(() => {});

