CREATE TYPE "public"."notification_type" AS ENUM('reward', 'transaction', 'system', 'social', 'marketplace', 'quest', 'ai', 'world', 'creator', 'education', 'sports', 'business');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('marketplace', 'wallet', 'inventory', 'launcher', 'system', 'social', 'quest', 'mail', 'chat', 'ai', 'world', 'creator', 'education', 'sports', 'business');--> statement-breakpoint
CREATE TYPE "public"."reputation_event_type" AS ENUM('LOGIN', 'MARKETPLACE_LISTING', 'MARKETPLACE_SALE', 'MARKETPLACE_PURCHASE', 'WALLET_TRANSFER', 'INVENTORY_ACQUIRED', 'GUILD_CREATED', 'GUILD_JOINED', 'GUILD_EVENT', 'GUILD_CONTRIBUTION', 'GUILD_ANNOUNCEMENT', 'GUILD_RECRUIT', 'ACHIEVEMENT_UNLOCKED', 'QUEST_COMPLETED', 'FIRST_CHAT', 'FIRST_GUILD_CHAT', 'FIRST_PRIVATE_CHAT');--> statement-breakpoint
CREATE TYPE "public"."friend_request_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."presence_status" AS ENUM('ONLINE', 'AWAY', 'OFFLINE');--> statement-breakpoint
CREATE TYPE "public"."relationship_type" AS ENUM('FRIEND', 'FOLLOWING', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."guild_contribution_type" AS ENUM('CREDITS', 'COINS', 'ITEM');--> statement-breakpoint
CREATE TYPE "public"."guild_event_status" AS ENUM('UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."guild_invite_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."guild_log_action" AS ENUM('GUILD_CREATED', 'MEMBER_JOINED', 'MEMBER_LEFT', 'MEMBER_KICKED', 'MEMBER_INVITED', 'INVITE_ACCEPTED', 'INVITE_DECLINED', 'JOIN_REQUEST_SENT', 'JOIN_REQUEST_APPROVED', 'JOIN_REQUEST_REJECTED', 'ROLE_CHANGED', 'ANNOUNCEMENT_POSTED', 'EVENT_CREATED', 'EVENT_JOINED', 'TREASURY_DEPOSIT', 'TREASURY_WITHDRAW', 'WAREHOUSE_DEPOSIT', 'WAREHOUSE_WITHDRAW', 'GUILD_UPDATED');--> statement-breakpoint
CREATE TYPE "public"."guild_role" AS ENUM('OWNER', 'LEADER', 'OFFICER', 'ELDER', 'MEMBER', 'RECRUIT');--> statement-breakpoint
CREATE TYPE "public"."guild_visibility" AS ENUM('PUBLIC', 'PRIVATE', 'INVITE_ONLY');--> statement-breakpoint
CREATE TYPE "public"."guild_join_request_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."quest_objective_type" AS ENUM('LOGIN', 'OPEN_APP', 'BUY_ITEM', 'SELL_ITEM', 'CREATE_LISTING', 'TRANSFER_WALLET', 'GAIN_REPUTATION', 'ADD_FRIEND', 'JOIN_GUILD', 'CONTRIBUTE_GUILD', 'COLLECT_ITEM', 'OWN_ITEM', 'LEVEL_REPUTATION', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."quest_difficulty" AS ENUM('EASY', 'NORMAL', 'HARD', 'LEGENDARY');--> statement-breakpoint
CREATE TYPE "public"."quest_status" AS ENUM('ACTIVE', 'INACTIVE', 'FINISHED');--> statement-breakpoint
CREATE TYPE "public"."quest_type" AS ENUM('MAIN', 'SIDE', 'DAILY', 'WEEKLY', 'EVENT');--> statement-breakpoint
CREATE TYPE "public"."user_quest_status" AS ENUM('IN_PROGRESS', 'COMPLETED', 'CLAIMED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."mail_attachment_type" AS ENUM('CREDITS', 'COINS', 'TOKENS', 'REWARD_POINTS', 'INVENTORY_ITEM', 'PET', 'TICKET', 'NFT', 'WORLD_ASSET', 'GUILD_REWARD', 'QUEST_REWARD', 'ACHIEVEMENT_REWARD');--> statement-breakpoint
CREATE TYPE "public"."mail_status" AS ENUM('UNREAD', 'READ', 'CLAIMED', 'ARCHIVED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."mail_type" AS ENUM('SYSTEM', 'QUEST', 'MARKETPLACE', 'WALLET', 'SOCIAL', 'GUILD', 'EVENT', 'COMPENSATION', 'GIFT', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."chat_member_role" AS ENUM('OWNER', 'ADMIN', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."chat_message_type" AS ENUM('TEXT', 'IMAGE', 'FILE', 'SYSTEM', 'ITEM_SHARE', 'QUEST_SHARE', 'ACHIEVEMENT', 'LOCATION');--> statement-breakpoint
CREATE TYPE "public"."chat_report_status" AS ENUM('PENDING', 'REVIEWED', 'DISMISSED', 'ACTIONED');--> statement-breakpoint
CREATE TYPE "public"."chat_room_type" AS ENUM('GLOBAL', 'PRIVATE', 'GUILD', 'PARTY', 'MARKETPLACE', 'SYSTEM', 'SUPPORT');--> statement-breakpoint
CREATE TYPE "public"."world_instance_status" AS ENUM('OPEN', 'FULL', 'CLOSED', 'RESERVED');--> statement-breakpoint
CREATE TYPE "public"."world_instance_type" AS ENUM('SHARED', 'PRIVATE', 'RESERVED', 'MATCH', 'EVENT');--> statement-breakpoint
CREATE TYPE "public"."world_event_status" AS ENUM('UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."world_member_role" AS ENUM('OWNER', 'ADMIN', 'MODERATOR', 'MEMBER', 'VISITOR');--> statement-breakpoint
CREATE TYPE "public"."world_status" AS ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."world_type" AS ENUM('PUBLIC', 'PRIVATE', 'CREATOR', 'OFFICIAL', 'EVENT', 'GUILD', 'PARTY', 'TRAINING');--> statement-breakpoint
CREATE TYPE "public"."conversation_type" AS ENUM('GENERAL', 'QUEST_HELP', 'MARKETPLACE_ADVICE', 'WALLET_ADVICE', 'GUILD_ADVICE', 'WORLD_GUIDE', 'INVENTORY_HELP', 'SOCIAL_ASSIST');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('THUMBS_UP', 'THUMBS_DOWN', 'REPORT');--> statement-breakpoint
CREATE TYPE "public"."memory_scope" AS ENUM('SHORT_TERM', 'LONG_TERM', 'PERMANENT');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('USER', 'ASSISTANT', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."suggestion_type" AS ENUM('QUEST', 'MARKETPLACE', 'WALLET', 'GUILD', 'SOCIAL', 'WORLD', 'INVENTORY', 'GENERAL');--> statement-breakpoint
CREATE TYPE "public"."craft_job_status" AS ENUM('PENDING', 'CRAFTING', 'FINISHED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('WOOD', 'STONE', 'IRON', 'GOLD', 'CRYSTAL', 'MAGIC', 'FOOD', 'HERB');--> statement-breakpoint
CREATE TYPE "public"."upgrade_type" AS ENUM('LEVEL', 'RARITY', 'ENCHANT', 'SOCKET');--> statement-breakpoint
CREATE TYPE "public"."character_class" AS ENUM('WARRIOR', 'MAGE', 'ARCHER', 'ASSASSIN', 'ENGINEER', 'SUMMONER');--> statement-breakpoint
CREATE TYPE "public"."character_faction" AS ENUM('ALLIANCE', 'HORDE', 'NEUTRAL', 'SHADOW', 'LIGHT');--> statement-breakpoint
CREATE TYPE "public"."character_race" AS ENUM('HUMAN', 'ELF', 'DWARF', 'DEMON', 'ANGEL', 'BEAST');--> statement-breakpoint
CREATE TYPE "public"."equipment_slot" AS ENUM('HEAD', 'CHEST', 'LEGS', 'BOOTS', 'GLOVES', 'WEAPON', 'OFFHAND', 'RING', 'NECKLACE', 'PET');--> statement-breakpoint
CREATE TYPE "public"."skill_type" AS ENUM('ACTIVE', 'PASSIVE', 'ULTIMATE', 'TOGGLE');--> statement-breakpoint
CREATE TYPE "public"."battle_status" AS ENUM('WAITING', 'ACTIVE', 'FINISHED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."battle_type" AS ENUM('PVE', 'PVP', 'ARENA', 'BOSS', 'DUNGEON', 'RAID', 'TRAINING');--> statement-breakpoint
CREATE TYPE "public"."participant_status" AS ENUM('ALIVE', 'DEAD', 'DISCONNECTED');--> statement-breakpoint
CREATE TYPE "public"."skill_target" AS ENUM('SELF', 'ALLY', 'ENEMY', 'AREA');--> statement-breakpoint
CREATE TYPE "public"."mount_status" AS ENUM('ACTIVE', 'RESTING', 'TRAINING', 'TRAVELING');--> statement-breakpoint
CREATE TYPE "public"."mount_type" AS ENUM('HORSE', 'WOLF', 'DRAGON', 'PHOENIX', 'TIGER', 'MECH');--> statement-breakpoint
CREATE TYPE "public"."pet_rarity" AS ENUM('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC');--> statement-breakpoint
CREATE TYPE "public"."pet_type" AS ENUM('BEAST', 'DRAGON', 'SPIRIT', 'MECHANICAL', 'ELEMENTAL', 'CELESTIAL');--> statement-breakpoint
CREATE TYPE "public"."dungeon_difficulty" AS ENUM('NORMAL', 'HARD', 'ELITE', 'LEGENDARY', 'MYTHIC');--> statement-breakpoint
CREATE TYPE "public"."dungeon_status" AS ENUM('WAITING', 'ACTIVE', 'COMPLETED', 'FAILED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."raid_difficulty" AS ENUM('NORMAL', 'HEROIC', 'MYTHIC', 'NIGHTMARE');--> statement-breakpoint
CREATE TYPE "public"."raid_role" AS ENUM('TANK', 'HEALER', 'DPS', 'SUPPORT');--> statement-breakpoint
CREATE TYPE "public"."boss_state" AS ENUM('IDLE', 'SPAWNING', 'ACTIVE', 'ENRAGED', 'RETREAT', 'DEAD');--> statement-breakpoint
CREATE TYPE "public"."boss_type" AS ENUM('WORLD', 'DUNGEON', 'RAID', 'SEASONAL', 'LEGENDARY');--> statement-breakpoint
CREATE TYPE "public"."world_event_type" AS ENUM('INVASION', 'DEFENSE', 'ESCORT', 'TREASURE', 'WORLD_BOSS', 'SEASONAL');--> statement-breakpoint
CREATE TYPE "public"."weather_type" AS ENUM('SUNNY', 'RAIN', 'SNOW', 'STORM', 'FOG', 'MAGIC');--> statement-breakpoint
CREATE TYPE "public"."pvp_match_status" AS ENUM('WAITING', 'READY', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."pvp_match_type" AS ENUM('DUEL', 'ARENA_2V2', 'ARENA_3V3', 'ARENA_5V5', 'GUILD_WAR');--> statement-breakpoint
CREATE TYPE "public"."pvp_rank_tier" AS ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'LEGEND');--> statement-breakpoint
CREATE TYPE "public"."pvp_season_status" AS ENUM('PRESEASON', 'ACTIVE', 'FINISHED');--> statement-breakpoint
CREATE TYPE "public"."pvp_tournament_status" AS ENUM('UPCOMING', 'REGISTRATION', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."pvp_tournament_type" AS ENUM('SINGLE', 'DOUBLE', 'ROUND_ROBIN');--> statement-breakpoint
CREATE TYPE "public"."creator_asset_type" AS ENUM('IMAGE', 'MODEL', 'JSON', 'SCRIPT', 'TEXT', 'ICON');--> statement-breakpoint
CREATE TYPE "public"."creator_member_role" AS ENUM('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');--> statement-breakpoint
CREATE TYPE "public"."creator_project_status" AS ENUM('DRAFT', 'PRIVATE', 'PUBLIC', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."creator_project_type" AS ENUM('WORLD', 'NPC', 'QUEST', 'BUSINESS', 'STORY', 'EVENT', 'TOURNAMENT', 'SHOP', 'GUILD', 'DUNGEON');--> statement-breakpoint
CREATE TYPE "public"."edu_certificate_status" AS ENUM('ACTIVE', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."edu_course_level" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MASTER');--> statement-breakpoint
CREATE TYPE "public"."edu_course_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."edu_exam_status" AS ENUM('PENDING', 'STARTED', 'SUBMITTED', 'PASSED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."edu_lesson_type" AS ENUM('TEXT', 'VIDEO', 'PDF', 'QUIZ', 'ASSIGNMENT');--> statement-breakpoint
CREATE TYPE "public"."sports_award_type" AS ENUM('INDIVIDUAL', 'TEAM', 'SEASON', 'TOURNAMENT', 'CAREER');--> statement-breakpoint
CREATE TYPE "public"."sports_league_type" AS ENUM('DOMESTIC', 'INTERNATIONAL', 'REGIONAL', 'CUP');--> statement-breakpoint
CREATE TYPE "public"."sport_type" AS ENUM('FOOTBALL', 'BASEBALL', 'BASKETBALL', 'VOLLEYBALL', 'MARTIAL_ARTS', 'TENNIS', 'ESPORTS');--> statement-breakpoint
CREATE TYPE "public"."sports_venue_type" AS ENUM('STADIUM', 'ARENA', 'FIELD', 'COURT', 'RING', 'ONLINE');--> statement-breakpoint
CREATE TYPE "public"."business_transaction_type" AS ENUM('REVENUE', 'EXPENSE', 'PAYROLL', 'INVESTMENT', 'LOAN', 'TRANSFER', 'REFUND', 'TAX', 'DIVIDEND', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('RETAIL', 'WHOLESALE', 'MANUFACTURING', 'SERVICE', 'FRANCHISE', 'VIRTUAL', 'TECH', 'FINANCE', 'REAL_ESTATE', 'MEDIA', 'FOOD', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."company_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DISSOLVED', 'PENDING');--> statement-breakpoint
CREATE TYPE "public"."company_type" AS ENUM('SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LLC', 'CORPORATION', 'COOPERATIVE', 'NPC_COMPANY', 'AI_COMPANY', 'PLAYER_COMPANY');--> statement-breakpoint
CREATE TYPE "public"."department_type" AS ENUM('EXECUTIVE', 'OPERATIONS', 'FINANCE', 'MARKETING', 'SALES', 'HR', 'TECH', 'LOGISTICS', 'PRODUCTION', 'LEGAL', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."employee_role" AS ENUM('OWNER', 'CEO', 'CTO', 'CFO', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE', 'INTERN', 'CONTRACTOR', 'ADVISOR');--> statement-breakpoint
CREATE TYPE "public"."employment_status" AS ENUM('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED', 'RESIGNED');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."payroll_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."salary_period" AS ENUM('HOURLY', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."warehouse_type" AS ENUM('GENERAL', 'COLD_STORAGE', 'SECURE', 'VIRTUAL', 'DISTRIBUTION');--> statement-breakpoint
CREATE TYPE "public"."building_status" AS ENUM('ACTIVE', 'UNDER_CONSTRUCTION', 'DAMAGED', 'ABANDONED', 'DESTROYED');--> statement-breakpoint
CREATE TYPE "public"."building_type" AS ENUM('HOUSE', 'APARTMENT', 'OFFICE', 'SHOP', 'FACTORY', 'WAREHOUSE', 'FARM', 'CASTLE', 'TEMPLE', 'STADIUM', 'LAB', 'SPECIAL');--> statement-breakpoint
CREATE TYPE "public"."city_type" AS ENUM('CAPITAL', 'METROPOLIS', 'CITY', 'TOWN', 'VILLAGE', 'OUTPOST', 'SPECIAL');--> statement-breakpoint
CREATE TYPE "public"."construction_status" AS ENUM('QUEUED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."district_type" AS ENUM('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'EDUCATION', 'SPORTS', 'GOVERNMENT', 'MIXED', 'PARK', 'HARBOR', 'AIRPORT');--> statement-breakpoint
CREATE TYPE "public"."land_type" AS ENUM('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL', 'FOREST', 'WATER', 'DESERT', 'MOUNTAIN', 'SNOW', 'VOLCANIC', 'SPECIAL', 'VOID');--> statement-breakpoint
CREATE TYPE "public"."ownership_type" AS ENUM('PLAYER', 'GUILD', 'COMPANY', 'NPC', 'GOVERNMENT', 'UNIVERSE');--> statement-breakpoint
CREATE TYPE "public"."parcel_status" AS ENUM('AVAILABLE', 'OWNED', 'RENTED', 'RESERVED', 'LOCKED', 'AUCTION');--> statement-breakpoint
CREATE TYPE "public"."rental_status" AS ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING', 'OVERDUE');--> statement-breakpoint
CREATE TYPE "public"."road_type" AS ENUM('HIGHWAY', 'AVENUE', 'STREET', 'ALLEY', 'BRIDGE', 'TUNNEL', 'RAIL', 'SKY');--> statement-breakpoint
CREATE TYPE "public"."teleport_type" AS ENUM('PUBLIC', 'PRIVATE', 'GUILD', 'WORLD', 'PREMIUM', 'EMERGENCY');--> statement-breakpoint
CREATE TYPE "public"."utility_type" AS ENUM('ELECTRICITY', 'WATER', 'INTERNET', 'GAS', 'SEWER', 'HEATING', 'SOLAR');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "activity_type" NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"metadata" jsonb,
	"source_app" text DEFAULT 'universe-hub' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reputation_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event_type" "reputation_event_type" NOT NULL,
	"points" integer NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_reputation" (
	"user_id" text PRIMARY KEY NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"level" text DEFAULT 'Citizen' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hub_achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text DEFAULT '🏆' NOT NULL,
	"criteria" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hub_achievements_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"achievement_key" text NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_achievements_user_id_achievement_key_unique" UNIQUE("user_id","achievement_key")
);
--> statement-breakpoint
CREATE TABLE "ecosystem_apps" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon_url" text,
	"base_url" text NOT NULL,
	"category" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"version" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ecosystem_apps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "app_launches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_slug" text NOT NULL,
	"launched_at" timestamp NOT NULL,
	"launch_source" text NOT NULL,
	"session_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_sync_state" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"last_sync_at" timestamp,
	"last_notification_id" text,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "notification_sync_state_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "applications_registry" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon_url" text,
	"banner_url" text,
	"category" text NOT NULL,
	"launch_url" text NOT NULL,
	"owner_app" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "applications_registry_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_apps" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"application_id" text NOT NULL,
	"installed_at" timestamp DEFAULT now(),
	"last_opened_at" timestamp,
	CONSTRAINT "user_apps_user_id_application_id_unique" UNIQUE("user_id","application_id")
);
--> statement-breakpoint
CREATE TABLE "wallet_references" (
	"user_id" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"tokens" integer DEFAULT 0 NOT NULL,
	"reward_points" integer DEFAULT 0 NOT NULL,
	"last_synced_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"wallet_type" text NOT NULL,
	"amount" integer NOT NULL,
	"direction" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reference" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"title" text DEFAULT 'Member' NOT NULL,
	"status" text DEFAULT 'offline' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"max_xp" integer DEFAULT 1000 NOT NULL,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avatars" (
	"user_id" text PRIMARY KEY NOT NULL,
	"initials" text NOT NULL,
	"image_url" text,
	"frame_color" text DEFAULT '#7c3aed' NOT NULL,
	"badge_icon" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reputations" (
	"user_id" text PRIMARY KEY NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"tier" text DEFAULT 'bronze' NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"badges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_references" (
	"user_id" text PRIMARY KEY NOT NULL,
	"inventory_id" text NOT NULL,
	"count_pets" integer DEFAULT 0 NOT NULL,
	"count_players" integer DEFAULT 0 NOT NULL,
	"count_tickets" integer DEFAULT 0 NOT NULL,
	"count_digital" integer DEFAULT 0 NOT NULL,
	"count_items" integer DEFAULT 0 NOT NULL,
	"count_total" integer DEFAULT 0 NOT NULL,
	"last_synced_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"rarity" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"image" text,
	"metadata" jsonb,
	"acquired_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_listings" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"item_id" text NOT NULL,
	"item_name" text NOT NULL,
	"category" text NOT NULL,
	"rarity" text NOT NULL,
	"price" integer NOT NULL,
	"currency" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "marketplace_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"item_name" text NOT NULL,
	"price" integer NOT NULL,
	"currency" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_auctions" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"item_id" text NOT NULL,
	"item_name" text NOT NULL,
	"category" text NOT NULL,
	"rarity" text NOT NULL,
	"starting_price" integer NOT NULL,
	"current_price" integer NOT NULL,
	"currency" text NOT NULL,
	"status" text DEFAULT 'live' NOT NULL,
	"bid_count" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_bids" (
	"id" text PRIMARY KEY NOT NULL,
	"auction_id" text NOT NULL,
	"bidder_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_watchlists" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"item_name" text,
	"price" integer,
	"rarity" text,
	"status" text,
	"watch_price" integer,
	"last_seen_price" integer,
	"price_drop_count" integer DEFAULT 0 NOT NULL,
	"last_price_change_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_saved_searches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"query" text,
	"category" text,
	"rarity" text,
	"currency" text,
	"min_price" integer,
	"max_price" integer,
	"match_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_reputation_ratings" (
	"id" text PRIMARY KEY NOT NULL,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"transaction_id" text NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_reputation_ratings_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "marketplace_seller_reputation" (
	"user_id" text PRIMARY KEY NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"level" text DEFAULT 'new' NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"total_volume" integer DEFAULT 0 NOT NULL,
	"positive_ratings" integer DEFAULT 0 NOT NULL,
	"negative_ratings" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_treasury" (
	"id" text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"tokens" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_moderation_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_seller_status" (
	"user_id" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_pricing" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"item_name" text NOT NULL,
	"category" text NOT NULL,
	"rarity" text NOT NULL,
	"price" integer NOT NULL,
	"currency" text NOT NULL,
	"sold_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"total_amount" integer NOT NULL,
	"fee_amount" integer NOT NULL,
	"net_amount" integer NOT NULL,
	"currency" text NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friend_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"status" "friend_request_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_relationships" (
	"user_id" text NOT NULL,
	"target_id" text NOT NULL,
	"type" "relationship_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "social_relationships_user_id_target_id_type_pk" PRIMARY KEY("user_id","target_id","type")
);
--> statement-breakpoint
CREATE TABLE "user_presence" (
	"user_id" text PRIMARY KEY NOT NULL,
	"status" "presence_status" DEFAULT 'OFFLINE' NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles_public" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" text DEFAULT '' NOT NULL,
	"avatar_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_contributions" (
	"id" text PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" "guild_contribution_type" NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"item_id" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_event_participants" (
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guild_event_participants_event_id_user_id_pk" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "guild_events" (
	"id" text PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"creator_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone,
	"max_participants" integer,
	"status" "guild_event_status" DEFAULT 'UPCOMING' NOT NULL,
	"reward_points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"inviter_id" text NOT NULL,
	"invitee_id" text NOT NULL,
	"status" "guild_invite_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "guild_join_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"user_id" text NOT NULL,
	"message" text,
	"status" "guild_join_request_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"action" "guild_log_action" NOT NULL,
	"target_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_members" (
	"guild_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "guild_role" DEFAULT 'RECRUIT' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"contribution" integer DEFAULT 0 NOT NULL,
	"last_active" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guild_members_guild_id_user_id_pk" PRIMARY KEY("guild_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "guild_role_permissions" (
	"guild_id" text NOT NULL,
	"role" "guild_role" NOT NULL,
	"permissions" jsonb NOT NULL,
	CONSTRAINT "guild_role_permissions_guild_id_role_pk" PRIMARY KEY("guild_id","role")
);
--> statement-breakpoint
CREATE TABLE "guild_treasury_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"currency" text NOT NULL,
	"amount" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guild_warehouse_items" (
	"id" text PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"item_id" text NOT NULL,
	"item_name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"deposited_by" text NOT NULL,
	"deposited_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guilds" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tag" text NOT NULL,
	"description" text,
	"avatar" text,
	"banner" text,
	"owner_id" text NOT NULL,
	"member_limit" integer DEFAULT 50 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"treasury_credits" integer DEFAULT 0 NOT NULL,
	"treasury_coins" integer DEFAULT 0 NOT NULL,
	"reputation" integer DEFAULT 0 NOT NULL,
	"visibility" "guild_visibility" DEFAULT 'PUBLIC' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guilds_tag_unique" UNIQUE("tag")
);
--> statement-breakpoint
CREATE TABLE "quest_objectives" (
	"id" text PRIMARY KEY NOT NULL,
	"quest_id" text NOT NULL,
	"type" "quest_objective_type" NOT NULL,
	"description" text NOT NULL,
	"target_count" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quests" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" "quest_type" DEFAULT 'SIDE' NOT NULL,
	"status" "quest_status" DEFAULT 'ACTIVE' NOT NULL,
	"difficulty" "quest_difficulty" DEFAULT 'NORMAL' NOT NULL,
	"required_level" integer DEFAULT 0 NOT NULL,
	"repeatable" boolean DEFAULT false NOT NULL,
	"start_at" timestamp,
	"end_at" timestamp,
	"reward_credits" integer DEFAULT 0 NOT NULL,
	"reward_coins" integer DEFAULT 0 NOT NULL,
	"reward_tokens" integer DEFAULT 0 NOT NULL,
	"reward_reputation" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_quest_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_quest_id" text NOT NULL,
	"objective_id" text NOT NULL,
	"current_count" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_quests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"quest_id" text NOT NULL,
	"status" "user_quest_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_user_quest_active" UNIQUE("user_id","quest_id","status")
);
--> statement-breakpoint
CREATE TABLE "mail_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"mail_id" text NOT NULL,
	"type" "mail_attachment_type" NOT NULL,
	"label" text NOT NULL,
	"amount" integer,
	"item_id" text,
	"item_data" jsonb,
	"claimed" boolean DEFAULT false NOT NULL,
	"claimed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mail_claim_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"mail_id" text NOT NULL,
	"attachment_id" text NOT NULL,
	"user_id" text NOT NULL,
	"claimed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"result" jsonb
);
--> statement-breakpoint
CREATE TABLE "mail_labels" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#3B82F6' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mail_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"type" "mail_type" NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mail_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "mail_user_labels" (
	"id" text PRIMARY KEY NOT NULL,
	"mail_id" text NOT NULL,
	"label_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mails" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sender_id" text,
	"sender_name" text DEFAULT 'Universe System' NOT NULL,
	"type" "mail_type" DEFAULT 'SYSTEM' NOT NULL,
	"status" "mail_status" DEFAULT 'UNREAD' NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"expires_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"claimed_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"filename" text,
	"size" integer,
	"mime_type" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"blocked_user_id" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_members" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "chat_member_role" DEFAULT 'MEMBER' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_read_at" timestamp with time zone,
	"last_read_message_id" text,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"left_at" timestamp with time zone,
	"unread_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_message_reads" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"room_id" text NOT NULL,
	"user_id" text NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"sender_name" text NOT NULL,
	"type" "chat_message_type" DEFAULT 'TEXT' NOT NULL,
	"content" text NOT NULL,
	"reply_to_id" text,
	"edited_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_pins" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"message_id" text NOT NULL,
	"pinned_by" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"reported_by" text NOT NULL,
	"reason" text NOT NULL,
	"status" "chat_report_status" DEFAULT 'PENDING' NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "chat_room_type" NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"description" text,
	"icon" text,
	"owner_id" text,
	"metadata" jsonb,
	"max_members" integer DEFAULT 500,
	"is_public" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"last_message_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chat_rooms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "chat_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"sound_enabled" boolean DEFAULT true NOT NULL,
	"show_online_status" boolean DEFAULT true NOT NULL,
	"theme" text DEFAULT 'dark',
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chat_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "world_bookmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"world_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_events" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "world_event_type" DEFAULT 'INVASION' NOT NULL,
	"status" text DEFAULT 'UPCOMING' NOT NULL,
	"region" text,
	"max_participants" integer DEFAULT 100 NOT NULL,
	"reward_credits" integer DEFAULT 500 NOT NULL,
	"reward_xp" integer DEFAULT 2000 NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"completed_at" timestamp,
	"icon" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_instances" (
	"id" text PRIMARY KEY NOT NULL,
	"zone_id" text NOT NULL,
	"world_id" text NOT NULL,
	"type" "world_instance_type" DEFAULT 'SHARED' NOT NULL,
	"status" "world_instance_status" DEFAULT 'OPEN' NOT NULL,
	"capacity" integer DEFAULT 20 NOT NULL,
	"player_count" integer DEFAULT 0 NOT NULL,
	"owner_id" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "world_members" (
	"id" text PRIMARY KEY NOT NULL,
	"world_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "world_member_role" DEFAULT 'MEMBER' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_visit" timestamp with time zone,
	"visit_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"world_id" text NOT NULL,
	"role" "world_member_role" NOT NULL,
	"permission" text NOT NULL,
	"granted" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_presence" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"world_id" text,
	"region_id" text,
	"zone_id" text,
	"instance_id" text,
	"joined_at" timestamp with time zone,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	CONSTRAINT "world_presence_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "world_regions" (
	"id" text PRIMARY KEY NOT NULL,
	"world_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"capacity" integer DEFAULT 50 NOT NULL,
	"player_count" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_spawn_points" (
	"id" text PRIMARY KEY NOT NULL,
	"world_id" text NOT NULL,
	"region_id" text,
	"zone_id" text,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"pos_x" real DEFAULT 0 NOT NULL,
	"pos_y" real DEFAULT 0 NOT NULL,
	"pos_z" real DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_travel_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"world_id" text NOT NULL,
	"instance_id" text,
	"entered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	"duration_secs" integer
);
--> statement-breakpoint
CREATE TABLE "world_zones" (
	"id" text PRIMARY KEY NOT NULL,
	"region_id" text NOT NULL,
	"world_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"capacity" integer DEFAULT 20 NOT NULL,
	"player_count" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worlds" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"banner" text,
	"owner_id" text NOT NULL,
	"type" "world_type" DEFAULT 'PUBLIC' NOT NULL,
	"status" "world_status" DEFAULT 'ACTIVE' NOT NULL,
	"capacity" integer DEFAULT 100 NOT NULL,
	"player_count" integer DEFAULT 0 NOT NULL,
	"visit_count" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"metadata" jsonb,
	"guild_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "worlds_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ai_context_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"context_key" text NOT NULL,
	"data" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text DEFAULT 'New Conversation' NOT NULL,
	"type" "conversation_type" DEFAULT 'GENERAL' NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"last_message_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"message_id" text NOT NULL,
	"type" "feedback_type" NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_memories" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"scope" "memory_scope" DEFAULT 'LONG_TERM' NOT NULL,
	"expires_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"tokens" integer,
	"model" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_personality" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text DEFAULT 'Nova' NOT NULL,
	"tone" text DEFAULT 'friendly' NOT NULL,
	"language" text DEFAULT 'vi' NOT NULL,
	"system_prompt" text,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_personality_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "ai_prompt_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"template" text NOT NULL,
	"variables" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_prompt_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ai_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"conversation_id" text,
	"provider" text DEFAULT 'mock' NOT NULL,
	"model" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "ai_suggestions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "suggestion_type" DEFAULT 'GENERAL' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"action" text,
	"action_url" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_dismissed" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"conversation_id" text,
	"provider" text NOT NULL,
	"model" text,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"latency_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crafting_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipe_id" text NOT NULL,
	"job_id" text,
	"success" boolean DEFAULT true NOT NULL,
	"output_item_id" text,
	"credits_spent" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crafting_recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'GENERAL' NOT NULL,
	"crafting_time" integer DEFAULT 60 NOT NULL,
	"crafting_cost" integer DEFAULT 0 NOT NULL,
	"required_level" integer DEFAULT 1 NOT NULL,
	"station_id" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crafting_stations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"station_type" text DEFAULT 'BASIC' NOT NULL,
	"required_level" integer DEFAULT 1 NOT NULL,
	"is_guild" boolean DEFAULT false NOT NULL,
	"guild_id" text,
	"world_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "economy_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"total_crafted" integer DEFAULT 0 NOT NULL,
	"total_gathered" integer DEFAULT 0 NOT NULL,
	"total_traded" integer DEFAULT 0 NOT NULL,
	"total_npc_buys" integer DEFAULT 0 NOT NULL,
	"total_npc_sells" integer DEFAULT 0 NOT NULL,
	"credits_spent" integer DEFAULT 0 NOT NULL,
	"credits_earned" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_enchantments" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"user_id" text NOT NULL,
	"enchant_type" text NOT NULL,
	"value" real DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"enchanted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_upgrades" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"user_id" text NOT NULL,
	"upgrade_type" "upgrade_type" DEFAULT 'LEVEL' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"cost" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"upgraded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "npc_shop_items" (
	"id" text PRIMARY KEY NOT NULL,
	"shop_id" text NOT NULL,
	"name" text NOT NULL,
	"resource_type" "resource_type",
	"item_type" text,
	"buy_price" integer DEFAULT 0 NOT NULL,
	"sell_price" integer DEFAULT 0 NOT NULL,
	"stock" integer DEFAULT -1 NOT NULL,
	"max_stock" integer DEFAULT -1 NOT NULL,
	"is_infinite" boolean DEFAULT true NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "npc_shops" (
	"id" text PRIMARY KEY NOT NULL,
	"world_id" text,
	"name" text NOT NULL,
	"description" text,
	"currency" text DEFAULT 'CREDITS' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"resource_type" "resource_type",
	"item_type" text,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_outputs" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"resource_type" "resource_type",
	"item_type" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"chance" real DEFAULT 100 NOT NULL,
	"is_guaranteed" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_gather_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"node_id" text NOT NULL,
	"amount" integer NOT NULL,
	"gathered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_market_prices" (
	"id" text PRIMARY KEY NOT NULL,
	"resource_type" "resource_type" NOT NULL,
	"price" integer DEFAULT 10 NOT NULL,
	"change" real DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_nodes" (
	"id" text PRIMARY KEY NOT NULL,
	"world_id" text,
	"name" text NOT NULL,
	"resource_type" "resource_type" NOT NULL,
	"max_amount" integer DEFAULT 100 NOT NULL,
	"current_amount" integer DEFAULT 100 NOT NULL,
	"respawn_time" integer DEFAULT 300 NOT NULL,
	"pos_x" real DEFAULT 0 NOT NULL,
	"pos_y" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_spawns" (
	"id" text PRIMARY KEY NOT NULL,
	"node_id" text NOT NULL,
	"amount" integer NOT NULL,
	"spawned_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_blueprints" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipe_id" text NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_crafting_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipe_id" text NOT NULL,
	"status" "craft_job_status" DEFAULT 'PENDING' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finishes_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "character_attributes" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"strength" integer DEFAULT 10 NOT NULL,
	"agility" integer DEFAULT 10 NOT NULL,
	"intelligence" integer DEFAULT 10 NOT NULL,
	"vitality" integer DEFAULT 10 NOT NULL,
	"wisdom" integer DEFAULT 10 NOT NULL,
	"luck" integer DEFAULT 10 NOT NULL,
	"free_points" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_customization" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"skin_tone" text DEFAULT 'medium' NOT NULL,
	"hair_style" text DEFAULT 'default' NOT NULL,
	"hair_color" text DEFAULT '#4a3728' NOT NULL,
	"eye_color" text DEFAULT '#3b5998' NOT NULL,
	"face_style" text DEFAULT 'default' NOT NULL,
	"body_type" text DEFAULT 'medium' NOT NULL,
	"accessories" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_equipment" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"slot" "equipment_slot" NOT NULL,
	"item_id" text,
	"item_name" text,
	"item_icon" text,
	"item_rarity" text,
	"stat_bonus" jsonb,
	"equipped_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_experience_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"amount" integer NOT NULL,
	"source" text NOT NULL,
	"source_id" text,
	"total_after" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_level_rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"level" integer NOT NULL,
	"reward_type" text NOT NULL,
	"reward_value" jsonb,
	"claimed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_levels" (
	"id" text PRIMARY KEY NOT NULL,
	"level" integer NOT NULL,
	"xp_required" integer NOT NULL,
	"stat_point_reward" integer DEFAULT 3 NOT NULL,
	"skill_point_reward" integer DEFAULT 1 NOT NULL,
	"credit_reward" integer DEFAULT 0 NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "character_presets" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"name" text NOT NULL,
	"equipment" jsonb,
	"skills" jsonb,
	"attributes" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"is_equipped" boolean DEFAULT false NOT NULL,
	"slot_index" integer,
	"learned_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"hp" integer DEFAULT 100 NOT NULL,
	"max_hp" integer DEFAULT 100 NOT NULL,
	"mp" integer DEFAULT 50 NOT NULL,
	"max_mp" integer DEFAULT 50 NOT NULL,
	"stamina" integer DEFAULT 100 NOT NULL,
	"attack" integer DEFAULT 10 NOT NULL,
	"defense" integer DEFAULT 5 NOT NULL,
	"speed" integer DEFAULT 10 NOT NULL,
	"crit_rate" real DEFAULT 0.05 NOT NULL,
	"crit_damage" real DEFAULT 1.5 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_titles" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"title_key" text NOT NULL,
	"title_name" text NOT NULL,
	"title_desc" text,
	"is_selected" boolean DEFAULT false NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"class" character_class DEFAULT 'WARRIOR' NOT NULL,
	"race" character_race DEFAULT 'HUMAN' NOT NULL,
	"faction" character_faction DEFAULT 'NEUTRAL' NOT NULL,
	"title" text,
	"level" integer DEFAULT 1 NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"power_score" integer DEFAULT 100 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_trees" (
	"id" text PRIMARY KEY NOT NULL,
	"class" character_class NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"max_level" integer DEFAULT 10 NOT NULL,
	"base_damage" integer DEFAULT 0 NOT NULL,
	"base_cooldown" integer DEFAULT 0 NOT NULL,
	"mp_cost" integer DEFAULT 0 NOT NULL,
	"skill_type" "skill_type" DEFAULT 'ACTIVE' NOT NULL,
	"prerequisites" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_arena" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"season" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"min_power" integer DEFAULT 0 NOT NULL,
	"max_power" integer,
	"rewards" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_battles" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "battle_type" DEFAULT 'PVE' NOT NULL,
	"status" "battle_status" DEFAULT 'WAITING' NOT NULL,
	"creator_id" text NOT NULL,
	"winner_id" text,
	"current_turn" integer DEFAULT 0 NOT NULL,
	"max_turns" integer DEFAULT 50 NOT NULL,
	"is_realtime" boolean DEFAULT false NOT NULL,
	"boss_id" text,
	"dungeon_id" text,
	"arena_id" text,
	"metadata" jsonb,
	"started_at" timestamp,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_bosses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"level" integer DEFAULT 10 NOT NULL,
	"hp" integer DEFAULT 10000 NOT NULL,
	"attack" integer DEFAULT 100 NOT NULL,
	"defense" integer DEFAULT 50 NOT NULL,
	"speed" integer DEFAULT 5 NOT NULL,
	"skills" jsonb,
	"loot_table" jsonb,
	"xp_reward" integer DEFAULT 500 NOT NULL,
	"gold_reward" integer DEFAULT 200 NOT NULL,
	"is_world_boss" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"spawn_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_damage_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"battle_id" text NOT NULL,
	"turn_id" text,
	"source_id" text NOT NULL,
	"target_id" text NOT NULL,
	"damage" integer DEFAULT 0 NOT NULL,
	"damage_type" text DEFAULT 'physical' NOT NULL,
	"is_critical" boolean DEFAULT false NOT NULL,
	"is_miss" boolean DEFAULT false NOT NULL,
	"is_dodge" boolean DEFAULT false NOT NULL,
	"shield_absorbed" integer DEFAULT 0 NOT NULL,
	"net_damage" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_effects" (
	"id" text PRIMARY KEY NOT NULL,
	"battle_id" text NOT NULL,
	"participant_id" text NOT NULL,
	"effect_type" text NOT NULL,
	"value" real DEFAULT 0 NOT NULL,
	"turns_left" integer DEFAULT 1 NOT NULL,
	"source_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_history" (
	"id" text PRIMARY KEY NOT NULL,
	"battle_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" "battle_type" DEFAULT 'PVE' NOT NULL,
	"result" text DEFAULT 'DEFEAT' NOT NULL,
	"opponent_name" text,
	"turns_count" integer DEFAULT 0 NOT NULL,
	"xp_gained" integer DEFAULT 0 NOT NULL,
	"gold_gained" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_instances" (
	"id" text PRIMARY KEY NOT NULL,
	"battle_id" text NOT NULL,
	"boss_id" text,
	"instance_type" text DEFAULT 'BOSS' NOT NULL,
	"current_wave" integer DEFAULT 1 NOT NULL,
	"total_waves" integer DEFAULT 1 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_matchmaking" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "battle_type" DEFAULT 'ARENA' NOT NULL,
	"power_score" integer DEFAULT 100 NOT NULL,
	"status" text DEFAULT 'QUEUING' NOT NULL,
	"battle_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"battle_id" text NOT NULL,
	"user_id" text NOT NULL,
	"character_id" text,
	"team" integer DEFAULT 1 NOT NULL,
	"status" "participant_status" DEFAULT 'ALIVE' NOT NULL,
	"current_hp" integer DEFAULT 100 NOT NULL,
	"max_hp" integer DEFAULT 100 NOT NULL,
	"current_mp" integer DEFAULT 50 NOT NULL,
	"max_mp" integer DEFAULT 50 NOT NULL,
	"attack" integer DEFAULT 10 NOT NULL,
	"defense" integer DEFAULT 5 NOT NULL,
	"speed" integer DEFAULT 10 NOT NULL,
	"crit_rate" real DEFAULT 0.05 NOT NULL,
	"crit_damage" real DEFAULT 1.5 NOT NULL,
	"aggro" integer DEFAULT 0 NOT NULL,
	"combo_count" integer DEFAULT 0 NOT NULL,
	"is_npc" boolean DEFAULT false NOT NULL,
	"npc_name" text,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_pvp_rank" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"season" integer DEFAULT 1 NOT NULL,
	"rating" integer DEFAULT 1000 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"draws" integer DEFAULT 0 NOT NULL,
	"win_streak" integer DEFAULT 0 NOT NULL,
	"rank" text DEFAULT 'BRONZE' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"battle_id" text NOT NULL,
	"user_id" text NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"gold" integer DEFAULT 0 NOT NULL,
	"items" jsonb,
	"reputation" integer DEFAULT 0 NOT NULL,
	"is_victory" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"target" "skill_target" DEFAULT 'ENEMY' NOT NULL,
	"mp_cost" integer DEFAULT 10 NOT NULL,
	"cooldown" integer DEFAULT 1 NOT NULL,
	"base_damage" integer DEFAULT 0 NOT NULL,
	"base_healing" integer DEFAULT 0 NOT NULL,
	"effect_type" text,
	"effect_value" real,
	"effect_turns" integer,
	"combo_multiplier" real DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"total_battles" integer DEFAULT 0 NOT NULL,
	"total_wins" integer DEFAULT 0 NOT NULL,
	"total_losses" integer DEFAULT 0 NOT NULL,
	"total_kills" integer DEFAULT 0 NOT NULL,
	"total_damage" integer DEFAULT 0 NOT NULL,
	"total_healing" integer DEFAULT 0 NOT NULL,
	"critical_hits" integer DEFAULT 0 NOT NULL,
	"bosses_defeated" integer DEFAULT 0 NOT NULL,
	"arena_wins" integer DEFAULT 0 NOT NULL,
	"longest_win_streak" integer DEFAULT 0 NOT NULL,
	"favorite_skill" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_turns" (
	"id" text PRIMARY KEY NOT NULL,
	"battle_id" text NOT NULL,
	"turn_number" integer NOT NULL,
	"actor_id" text NOT NULL,
	"target_id" text,
	"action_type" text DEFAULT 'attack' NOT NULL,
	"skill_id" text,
	"damage" integer,
	"healing" integer,
	"is_critical" boolean DEFAULT false NOT NULL,
	"is_miss" boolean DEFAULT false NOT NULL,
	"is_dodge" boolean DEFAULT false NOT NULL,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"effects_applied" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_wave_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"wave_number" integer NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"enemies" jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mount_customization" (
	"id" text PRIMARY KEY NOT NULL,
	"mount_id" text NOT NULL,
	"color" text DEFAULT '#8B4513' NOT NULL,
	"pattern" text DEFAULT 'solid' NOT NULL,
	"saddle" text DEFAULT 'default' NOT NULL,
	"armor" text DEFAULT 'none' NOT NULL,
	"accessories" jsonb,
	"glow_effect" text,
	"trail_effect" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mount_equipment" (
	"id" text PRIMARY KEY NOT NULL,
	"mount_id" text NOT NULL,
	"slot" text DEFAULT 'saddle' NOT NULL,
	"item_id" text,
	"item_name" text,
	"item_icon" text,
	"item_rarity" text,
	"stat_bonus" jsonb,
	"equipped_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mount_learned_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"mount_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"learned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mount_levels" (
	"id" text PRIMARY KEY NOT NULL,
	"level" integer NOT NULL,
	"xp_required" integer NOT NULL,
	"speed_bonus" integer DEFAULT 5 NOT NULL,
	"stamina_bonus" integer DEFAULT 10 NOT NULL,
	"travel_bonus" real DEFAULT 0.01 NOT NULL,
	"credit_reward" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mount_routes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"distance" integer DEFAULT 100 NOT NULL,
	"base_duration" integer DEFAULT 3600 NOT NULL,
	"xp_reward" integer DEFAULT 50 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mount_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"effect" text DEFAULT 'speed' NOT NULL,
	"value" real DEFAULT 1.1 NOT NULL,
	"mount_type" "mount_type",
	"min_level" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mount_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"total_mounts" integer DEFAULT 0 NOT NULL,
	"total_travels" integer DEFAULT 0 NOT NULL,
	"total_distance" integer DEFAULT 0 NOT NULL,
	"total_xp_earned" integer DEFAULT 0 NOT NULL,
	"fastest_travel" integer,
	"favorite_mount" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mount_training" (
	"id" text PRIMARY KEY NOT NULL,
	"mount_id" text NOT NULL,
	"user_id" text NOT NULL,
	"training_type" text DEFAULT 'speed' NOT NULL,
	"xp_gained" integer DEFAULT 0 NOT NULL,
	"stat_improved" text,
	"stat_gain" integer DEFAULT 0 NOT NULL,
	"cost" integer DEFAULT 0 NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mount_travel_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"mount_id" text NOT NULL,
	"user_id" text NOT NULL,
	"route_id" text,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"distance" integer DEFAULT 100 NOT NULL,
	"duration" integer DEFAULT 3600 NOT NULL,
	"xp_gained" integer DEFAULT 0 NOT NULL,
	"stamina_used" integer DEFAULT 10 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"arrived_at" timestamp,
	"status" text DEFAULT 'TRAVELING' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mount_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "mount_type" DEFAULT 'HORSE' NOT NULL,
	"description" text,
	"icon" text,
	"rarity" "pet_rarity" DEFAULT 'COMMON' NOT NULL,
	"base_speed" integer DEFAULT 100 NOT NULL,
	"base_stamina" integer DEFAULT 100 NOT NULL,
	"max_level" integer DEFAULT 50 NOT NULL,
	"travel_bonus" real DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "mount_type" DEFAULT 'HORSE' NOT NULL,
	"rarity" "pet_rarity" DEFAULT 'COMMON' NOT NULL,
	"status" "mount_status" DEFAULT 'RESTING' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"speed" integer DEFAULT 100 NOT NULL,
	"stamina" integer DEFAULT 100 NOT NULL,
	"max_stamina" integer DEFAULT 100 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"color" text,
	"pattern" text,
	"accessories" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet_bonds" (
	"id" text PRIMARY KEY NOT NULL,
	"pet_id" text NOT NULL,
	"user_id" text NOT NULL,
	"bond_level" integer DEFAULT 1 NOT NULL,
	"bond_points" integer DEFAULT 0 NOT NULL,
	"bonus_type" text,
	"bonus_value" real,
	"last_interact" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet_equipment" (
	"id" text PRIMARY KEY NOT NULL,
	"pet_id" text NOT NULL,
	"slot" text DEFAULT 'armor' NOT NULL,
	"item_id" text,
	"item_name" text,
	"item_icon" text,
	"item_rarity" text,
	"stat_bonus" jsonb,
	"equipped_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet_evolution" (
	"id" text PRIMARY KEY NOT NULL,
	"pet_id" text NOT NULL,
	"user_id" text NOT NULL,
	"from_stage" integer NOT NULL,
	"to_stage" integer NOT NULL,
	"from_species_id" text,
	"to_species_id" text,
	"stats_before" jsonb,
	"stats_after" jsonb,
	"evolved_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet_inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"item_type" text DEFAULT 'food' NOT NULL,
	"item_key" text NOT NULL,
	"item_name" text NOT NULL,
	"item_icon" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"effect" jsonb,
	"metadata" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet_learned_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"pet_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"is_equipped" boolean DEFAULT false NOT NULL,
	"learned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet_levels" (
	"id" text PRIMARY KEY NOT NULL,
	"level" integer NOT NULL,
	"xp_required" integer NOT NULL,
	"hp_bonus" integer DEFAULT 5 NOT NULL,
	"attack_bonus" integer DEFAULT 2 NOT NULL,
	"defense_bonus" integer DEFAULT 1 NOT NULL,
	"speed_bonus" integer DEFAULT 1 NOT NULL,
	"credit_reward" integer DEFAULT 0 NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "pet_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"pet_id" text NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"detail" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"type" text DEFAULT 'ACTIVE' NOT NULL,
	"base_damage" integer DEFAULT 0 NOT NULL,
	"base_healing" integer DEFAULT 0 NOT NULL,
	"cooldown" integer DEFAULT 1 NOT NULL,
	"energy_cost" integer DEFAULT 10 NOT NULL,
	"pet_type" "pet_type",
	"min_level" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet_species" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "pet_type" DEFAULT 'BEAST' NOT NULL,
	"rarity" "pet_rarity" DEFAULT 'COMMON' NOT NULL,
	"icon" text,
	"max_level" integer DEFAULT 100 NOT NULL,
	"evolution_level" integer,
	"evolution_into" text,
	"base_hp" integer DEFAULT 100 NOT NULL,
	"base_attack" integer DEFAULT 10 NOT NULL,
	"base_defense" integer DEFAULT 5 NOT NULL,
	"base_speed" integer DEFAULT 10 NOT NULL,
	"base_happiness" integer DEFAULT 100 NOT NULL,
	"bond_bonus" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet_training" (
	"id" text PRIMARY KEY NOT NULL,
	"pet_id" text NOT NULL,
	"user_id" text NOT NULL,
	"training_type" text DEFAULT 'combat' NOT NULL,
	"xp_gained" integer DEFAULT 0 NOT NULL,
	"stat_improved" text,
	"stat_gain" integer DEFAULT 0 NOT NULL,
	"cost" integer DEFAULT 0 NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"species_id" text NOT NULL,
	"name" text NOT NULL,
	"nickname" text,
	"type" "pet_type" DEFAULT 'BEAST' NOT NULL,
	"rarity" "pet_rarity" DEFAULT 'COMMON' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"happiness" integer DEFAULT 100 NOT NULL,
	"hunger" integer DEFAULT 100 NOT NULL,
	"loyalty" integer DEFAULT 0 NOT NULL,
	"hp" integer DEFAULT 100 NOT NULL,
	"max_hp" integer DEFAULT 100 NOT NULL,
	"attack" integer DEFAULT 10 NOT NULL,
	"defense" integer DEFAULT 5 NOT NULL,
	"speed" integer DEFAULT 10 NOT NULL,
	"is_summoned" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"evolution_stage" integer DEFAULT 1 NOT NULL,
	"last_fed_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dungeon_bosses" (
	"id" text PRIMARY KEY NOT NULL,
	"dungeon_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"hp" integer DEFAULT 5000 NOT NULL,
	"max_hp" integer DEFAULT 5000 NOT NULL,
	"attack" integer DEFAULT 50 NOT NULL,
	"defense" integer DEFAULT 30 NOT NULL,
	"abilities" jsonb,
	"loot_table" jsonb,
	"icon" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dungeon_instances" (
	"id" text PRIMARY KEY NOT NULL,
	"dungeon_id" text NOT NULL,
	"leader_id" text NOT NULL,
	"status" "dungeon_status" DEFAULT 'WAITING' NOT NULL,
	"difficulty" "dungeon_difficulty" DEFAULT 'NORMAL' NOT NULL,
	"current_room" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dungeon_loot_tables" (
	"id" text PRIMARY KEY NOT NULL,
	"dungeon_id" text NOT NULL,
	"boss_id" text,
	"item_name" text NOT NULL,
	"item_type" text DEFAULT 'MATERIAL' NOT NULL,
	"rarity" text DEFAULT 'COMMON' NOT NULL,
	"drop_rate" real DEFAULT 0.1 NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dungeon_members" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"user_id" text NOT NULL,
	"hp" integer DEFAULT 100 NOT NULL,
	"max_hp" integer DEFAULT 100 NOT NULL,
	"is_alive" boolean DEFAULT true NOT NULL,
	"revives" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "dungeon_monsters" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"dungeon_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'NORMAL' NOT NULL,
	"hp" integer DEFAULT 100 NOT NULL,
	"max_hp" integer DEFAULT 100 NOT NULL,
	"attack" integer DEFAULT 10 NOT NULL,
	"defense" integer DEFAULT 5 NOT NULL,
	"xp_reward" integer DEFAULT 50 NOT NULL,
	"gold_reward" integer DEFAULT 10 NOT NULL,
	"icon" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dungeon_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"room_id" text,
	"checkpoint_name" text NOT NULL,
	"reached_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dungeon_regions" (
	"id" text PRIMARY KEY NOT NULL,
	"dungeon_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 1 NOT NULL,
	"icon" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dungeon_rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"user_id" text NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"items" jsonb,
	"claimed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dungeon_rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"region_id" text NOT NULL,
	"dungeon_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 1 NOT NULL,
	"type" text DEFAULT 'COMBAT' NOT NULL,
	"is_boss_room" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dungeon_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"dungeon_id" text NOT NULL,
	"completions" integer DEFAULT 0 NOT NULL,
	"failures" integer DEFAULT 0 NOT NULL,
	"total_kills" integer DEFAULT 0 NOT NULL,
	"total_deaths" integer DEFAULT 0 NOT NULL,
	"best_time" integer,
	"total_xp_earned" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dungeons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"difficulty" "dungeon_difficulty" DEFAULT 'NORMAL' NOT NULL,
	"min_level" integer DEFAULT 1 NOT NULL,
	"max_players" integer DEFAULT 5 NOT NULL,
	"time_limit" integer DEFAULT 3600 NOT NULL,
	"reward_credits" integer DEFAULT 100 NOT NULL,
	"reward_xp" integer DEFAULT 500 NOT NULL,
	"icon" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raid_bosses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"difficulty" "raid_difficulty" DEFAULT 'NORMAL' NOT NULL,
	"hp" integer DEFAULT 100000 NOT NULL,
	"max_hp" integer DEFAULT 100000 NOT NULL,
	"attack" integer DEFAULT 200 NOT NULL,
	"defense" integer DEFAULT 100 NOT NULL,
	"phases" integer DEFAULT 1 NOT NULL,
	"abilities" jsonb,
	"loot_table" jsonb,
	"icon" text,
	"min_players" integer DEFAULT 10 NOT NULL,
	"max_players" integer DEFAULT 20 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raid_damage_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"user_id" text NOT NULL,
	"target" text DEFAULT 'BOSS' NOT NULL,
	"damage" integer DEFAULT 0 NOT NULL,
	"healing" integer DEFAULT 0 NOT NULL,
	"skill" text,
	"logged_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raid_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"leader_id" text NOT NULL,
	"max_members" integer DEFAULT 20 NOT NULL,
	"status" text DEFAULT 'FORMING' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raid_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"instance_id" text NOT NULL,
	"boss_id" text NOT NULL,
	"result" text DEFAULT 'FAILED' NOT NULL,
	"role" "raid_role" DEFAULT 'DPS' NOT NULL,
	"damage" integer DEFAULT 0 NOT NULL,
	"healing" integer DEFAULT 0 NOT NULL,
	"kills" integer DEFAULT 0 NOT NULL,
	"duration" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raid_instances" (
	"id" text PRIMARY KEY NOT NULL,
	"raid_boss_id" text NOT NULL,
	"group_id" text,
	"leader_id" text NOT NULL,
	"status" "dungeon_status" DEFAULT 'WAITING' NOT NULL,
	"difficulty" "raid_difficulty" DEFAULT 'NORMAL' NOT NULL,
	"current_phase" integer DEFAULT 1 NOT NULL,
	"boss_hp_remaining" integer DEFAULT 100000 NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raid_members" (
	"id" text PRIMARY KEY NOT NULL,
	"raid_group_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "raid_role" DEFAULT 'DPS' NOT NULL,
	"is_ready" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "raid_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"phase" integer DEFAULT 1 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "raid_rankings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"boss_id" text NOT NULL,
	"best_time" integer,
	"total_damage" integer DEFAULT 0 NOT NULL,
	"total_healing" integer DEFAULT 0 NOT NULL,
	"role" "raid_role" DEFAULT 'DPS' NOT NULL,
	"kills" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raid_rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "raid_role" DEFAULT 'DPS' NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"items" jsonb,
	"claimed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_ai_states" (
	"id" text PRIMARY KEY NOT NULL,
	"boss_id" text NOT NULL,
	"threat_table" jsonb,
	"current_target" text,
	"last_skill_used" text,
	"next_skill_at" timestamp,
	"ai_mode" text DEFAULT 'NORMAL' NOT NULL,
	"metadata" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_damage_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"boss_id" text NOT NULL,
	"user_id" text NOT NULL,
	"skill_name" text,
	"damage" integer DEFAULT 0 NOT NULL,
	"healing" integer DEFAULT 0 NOT NULL,
	"is_crit" boolean DEFAULT false NOT NULL,
	"boss_hp_after" integer,
	"phase" integer DEFAULT 1 NOT NULL,
	"logged_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_loot_tables" (
	"id" text PRIMARY KEY NOT NULL,
	"boss_id" text NOT NULL,
	"item_name" text NOT NULL,
	"item_type" text DEFAULT 'MATERIAL' NOT NULL,
	"rarity" text DEFAULT 'COMMON' NOT NULL,
	"drop_rate" real DEFAULT 0.1 NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"min_level" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"boss_id" text NOT NULL,
	"user_id" text NOT NULL,
	"total_damage" integer DEFAULT 0 NOT NULL,
	"total_healing" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp,
	"is_alive" boolean DEFAULT true NOT NULL,
	"hp" integer DEFAULT 1000 NOT NULL,
	"max_hp" integer DEFAULT 1000 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_phases" (
	"id" text PRIMARY KEY NOT NULL,
	"boss_id" text NOT NULL,
	"phase" integer DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"hp_threshold" real DEFAULT 1 NOT NULL,
	"damage_multi" real DEFAULT 1 NOT NULL,
	"speed_multi" real DEFAULT 1 NOT NULL,
	"is_enrage_phase" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_rankings" (
	"id" text PRIMARY KEY NOT NULL,
	"boss_id" text NOT NULL,
	"user_id" text NOT NULL,
	"total_damage" integer DEFAULT 0 NOT NULL,
	"total_healing" integer DEFAULT 0 NOT NULL,
	"kills" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_skill_rotation" (
	"id" text PRIMARY KEY NOT NULL,
	"boss_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"instance_id" text,
	"caster_id" text,
	"target_id" text,
	"damage" integer DEFAULT 0 NOT NULL,
	"casted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"boss_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'DAMAGE' NOT NULL,
	"damage" integer DEFAULT 0 NOT NULL,
	"healing" integer DEFAULT 0 NOT NULL,
	"cooldown_sec" integer DEFAULT 10 NOT NULL,
	"aoe_radius" real DEFAULT 0 NOT NULL,
	"phase" integer DEFAULT 1 NOT NULL,
	"is_enrage_skill" boolean DEFAULT false NOT NULL,
	"icon" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_spawn_points" (
	"id" text PRIMARY KEY NOT NULL,
	"boss_id" text NOT NULL,
	"region" text NOT NULL,
	"coord_x" real DEFAULT 0 NOT NULL,
	"coord_y" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_spawn_schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"boss_id" text NOT NULL,
	"cron_expr" text,
	"interval_sec" integer,
	"next_spawn_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boss_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"boss_id" text NOT NULL,
	"kills" integer DEFAULT 0 NOT NULL,
	"total_damage" integer DEFAULT 0 NOT NULL,
	"total_healing" integer DEFAULT 0 NOT NULL,
	"best_damage" integer DEFAULT 0 NOT NULL,
	"participations" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dynamic_regions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"current_boss_id" text,
	"current_event_id" text,
	"weather" "weather_type" DEFAULT 'SUNNY' NOT NULL,
	"danger_level" integer DEFAULT 1 NOT NULL,
	"is_unlocked" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_bosses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "boss_type" DEFAULT 'WORLD' NOT NULL,
	"state" "boss_state" DEFAULT 'IDLE' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"hp" integer DEFAULT 100000 NOT NULL,
	"max_hp" integer DEFAULT 100000 NOT NULL,
	"attack" integer DEFAULT 500 NOT NULL,
	"defense" integer DEFAULT 200 NOT NULL,
	"speed" integer DEFAULT 100 NOT NULL,
	"current_phase" integer DEFAULT 1 NOT NULL,
	"total_phases" integer DEFAULT 3 NOT NULL,
	"enrage_threshold" real DEFAULT 0.3 NOT NULL,
	"is_enraged" boolean DEFAULT false NOT NULL,
	"min_players" integer DEFAULT 5 NOT NULL,
	"max_players" integer DEFAULT 50 NOT NULL,
	"reward_credits" integer DEFAULT 1000 NOT NULL,
	"reward_xp" integer DEFAULT 5000 NOT NULL,
	"respawn_seconds" integer DEFAULT 3600 NOT NULL,
	"icon" text,
	"region" text,
	"lore" text,
	"metadata" jsonb,
	"last_spawn_at" timestamp,
	"next_spawn_at" timestamp,
	"defeated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_disasters" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"region" text NOT NULL,
	"severity" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp DEFAULT now() NOT NULL,
	"ends_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_event_objectives" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"target" integer DEFAULT 100 NOT NULL,
	"current" integer DEFAULT 0 NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_event_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"contribution" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "world_event_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"objective_id" text NOT NULL,
	"user_id" text NOT NULL,
	"contribution" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_event_rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"items" jsonb,
	"claimed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_weather" (
	"id" text PRIMARY KEY NOT NULL,
	"region" text DEFAULT 'global' NOT NULL,
	"weather" "weather_type" DEFAULT 'SUNNY' NOT NULL,
	"intensity" real DEFAULT 1 NOT NULL,
	"description" text,
	"ends_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pvp_damage_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"attacker_id" text NOT NULL,
	"defender_id" text NOT NULL,
	"damage" integer DEFAULT 0 NOT NULL,
	"healing" integer DEFAULT 0 NOT NULL,
	"is_crit" boolean DEFAULT false NOT NULL,
	"skill_name" text,
	"defender_hp_after" integer DEFAULT 0 NOT NULL,
	"logged_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pvp_loadouts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"character_id" text,
	"pet_id" text,
	"mount_id" text,
	"skills" jsonb,
	"equipment" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pvp_match_events" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"event_type" text NOT NULL,
	"user_id" text,
	"target_id" text,
	"payload" jsonb,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pvp_match_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"round" integer DEFAULT 1 NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"logged_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pvp_match_players" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"team" integer DEFAULT 1 NOT NULL,
	"is_ready" boolean DEFAULT false NOT NULL,
	"is_alive" boolean DEFAULT true NOT NULL,
	"hp" integer DEFAULT 100 NOT NULL,
	"max_hp" integer DEFAULT 100 NOT NULL,
	"mana" integer DEFAULT 100 NOT NULL,
	"max_mana" integer DEFAULT 100 NOT NULL,
	"damage_dealt" integer DEFAULT 0 NOT NULL,
	"damage_taken" integer DEFAULT 0 NOT NULL,
	"healed" integer DEFAULT 0 NOT NULL,
	"kills" integer DEFAULT 0 NOT NULL,
	"deaths" integer DEFAULT 0 NOT NULL,
	"mmr_before" integer DEFAULT 1000 NOT NULL,
	"mmr_after" integer,
	"mmr_delta" integer,
	"is_winner" boolean,
	"loadout_id" text,
	"character_id" text,
	"pet_id" text,
	"metadata" jsonb,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pvp_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "pvp_match_type" DEFAULT 'DUEL' NOT NULL,
	"status" "pvp_match_status" DEFAULT 'WAITING' NOT NULL,
	"season_id" text,
	"guild_war_id" text,
	"tournament_id" text,
	"winner_id" text,
	"win_team" integer,
	"duration_sec" integer,
	"is_ranked" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"started_at" timestamp,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pvp_matchmaking_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"match_type" "pvp_match_type" DEFAULT 'DUEL' NOT NULL,
	"mmr" integer DEFAULT 1000 NOT NULL,
	"tier" "pvp_rank_tier" DEFAULT 'BRONZE' NOT NULL,
	"loadout_id" text,
	"guild_id" text,
	"is_ranked" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pvp_matchmaking_queue_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "pvp_rankings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"season_id" text NOT NULL,
	"mmr" integer DEFAULT 1000 NOT NULL,
	"tier" "pvp_rank_tier" DEFAULT 'BRONZE' NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"draws" integer DEFAULT 0 NOT NULL,
	"win_streak" integer DEFAULT 0 NOT NULL,
	"best_win_streak" integer DEFAULT 0 NOT NULL,
	"placement_done" boolean DEFAULT false NOT NULL,
	"placement_wins" integer DEFAULT 0 NOT NULL,
	"placement_games" integer DEFAULT 0 NOT NULL,
	"peak_mmr" integer DEFAULT 1000 NOT NULL,
	"peak_tier" "pvp_rank_tier" DEFAULT 'BRONZE' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pvp_rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"season_id" text,
	"tier" "pvp_rank_tier" NOT NULL,
	"reward_type" text DEFAULT 'SEASON' NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"xu" integer DEFAULT 0 NOT NULL,
	"tokens" integer DEFAULT 0 NOT NULL,
	"items" jsonb,
	"claimed" boolean DEFAULT false NOT NULL,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pvp_seasons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"number" integer DEFAULT 1 NOT NULL,
	"status" "pvp_season_status" DEFAULT 'PRESEASON' NOT NULL,
	"start_at" timestamp,
	"end_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pvp_skill_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"skill_id" text,
	"skill_name" text NOT NULL,
	"target_id" text,
	"effect" jsonb,
	"used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pvp_spectators" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pvp_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"total_matches" integer DEFAULT 0 NOT NULL,
	"total_wins" integer DEFAULT 0 NOT NULL,
	"total_losses" integer DEFAULT 0 NOT NULL,
	"total_draws" integer DEFAULT 0 NOT NULL,
	"total_kills" integer DEFAULT 0 NOT NULL,
	"total_deaths" integer DEFAULT 0 NOT NULL,
	"total_damage_dealt" integer DEFAULT 0 NOT NULL,
	"total_damage_taken" integer DEFAULT 0 NOT NULL,
	"total_healed" integer DEFAULT 0 NOT NULL,
	"highest_kill_streak" integer DEFAULT 0 NOT NULL,
	"tournament_wins" integer DEFAULT 0 NOT NULL,
	"peak_mmr" integer DEFAULT 1000 NOT NULL,
	"peak_tier" "pvp_rank_tier" DEFAULT 'BRONZE' NOT NULL,
	"favorite_match_type" "pvp_match_type",
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pvp_statistics_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tournament_brackets" (
	"id" text PRIMARY KEY NOT NULL,
	"tournament_id" text NOT NULL,
	"user_id" text NOT NULL,
	"seed" integer DEFAULT 1 NOT NULL,
	"round" integer DEFAULT 1 NOT NULL,
	"is_eliminated" boolean DEFAULT false NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"position" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_history" (
	"id" text PRIMARY KEY NOT NULL,
	"tournament_id" text NOT NULL,
	"user_id" text NOT NULL,
	"final_position" integer DEFAULT 1 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"tournament_id" text NOT NULL,
	"pvp_match_id" text,
	"round" integer DEFAULT 1 NOT NULL,
	"position" integer DEFAULT 1 NOT NULL,
	"player1_id" text,
	"player2_id" text,
	"winner_id" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"scheduled_at" timestamp,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"tournament_id" text NOT NULL,
	"user_id" text NOT NULL,
	"position" integer DEFAULT 1 NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"xu" integer DEFAULT 0 NOT NULL,
	"tokens" integer DEFAULT 0 NOT NULL,
	"items" jsonb,
	"claimed" boolean DEFAULT false NOT NULL,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "pvp_tournament_type" DEFAULT 'SINGLE' NOT NULL,
	"status" "pvp_tournament_status" DEFAULT 'UPCOMING' NOT NULL,
	"match_type" "pvp_match_type" DEFAULT 'DUEL' NOT NULL,
	"organizer_id" text NOT NULL,
	"guild_id" text,
	"season_id" text,
	"max_participants" integer DEFAULT 8 NOT NULL,
	"min_mmr" integer,
	"max_mmr" integer,
	"entry_fee" integer DEFAULT 0 NOT NULL,
	"prize_pool" integer DEFAULT 0 NOT NULL,
	"current_round" integer DEFAULT 0 NOT NULL,
	"total_rounds" integer DEFAULT 0 NOT NULL,
	"winner_id" text,
	"icon" text DEFAULT '🏆',
	"metadata" jsonb,
	"registration_ends_at" timestamp,
	"start_at" timestamp,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "creator_asset_type" DEFAULT 'IMAGE' NOT NULL,
	"url" text NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"mime_type" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "creator_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "creator_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_favorites" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_project_members" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "creator_member_role" DEFAULT 'VIEWER' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "creator_project_type" DEFAULT 'WORLD' NOT NULL,
	"status" "creator_project_status" DEFAULT 'DRAFT' NOT NULL,
	"owner_id" text NOT NULL,
	"template_id" text,
	"forked_from" text,
	"category_id" text,
	"thumbnail" text,
	"content" jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_public" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"fork_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "creator_publish_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"published_by" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"status" text DEFAULT 'SUCCESS' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"tag" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "creator_project_type" DEFAULT 'WORLD' NOT NULL,
	"category_id" text,
	"thumbnail" text,
	"content" jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_official" boolean DEFAULT false NOT NULL,
	"use_count" integer DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"label" text,
	"content" jsonb,
	"saved_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_certificate_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"design" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_certificates" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"template_id" text,
	"status" "edu_certificate_status" DEFAULT 'ACTIVE' NOT NULL,
	"verification_code" text NOT NULL,
	"signature" text,
	"metadata" jsonb,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "edu_certificates_verification_code_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
CREATE TABLE "edu_classroom_members" (
	"id" text PRIMARY KEY NOT NULL,
	"classroom_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'STUDENT' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_classrooms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"teacher_id" text NOT NULL,
	"course_id" text,
	"guild_id" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"max_members" integer DEFAULT 30 NOT NULL,
	"code" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "edu_classrooms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "edu_course_bookmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_course_enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"user_id" text NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"paid_amount" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_course_lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"module_id" text,
	"title" text NOT NULL,
	"type" "edu_lesson_type" DEFAULT 'TEXT' NOT NULL,
	"content" text,
	"video_url" text,
	"pdf_url" text,
	"duration" integer DEFAULT 0 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_course_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_course_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_course_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"tag" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_courses" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"teacher_id" text NOT NULL,
	"category_id" text,
	"status" "edu_course_status" DEFAULT 'DRAFT' NOT NULL,
	"level" "edu_course_level" DEFAULT 'BEGINNER' NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"duration" integer DEFAULT 0 NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"students" integer DEFAULT 0 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"requirements" text,
	"objectives" text,
	"language" text DEFAULT 'vi' NOT NULL,
	"metadata" jsonb,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "edu_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "edu_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "edu_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_id" text,
	"entity_type" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_exam_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"question_id" text NOT NULL,
	"answer" jsonb,
	"is_correct" boolean,
	"points_earned" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_exam_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"exam_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "edu_exam_status" DEFAULT 'PENDING' NOT NULL,
	"score" integer,
	"total_points" integer,
	"started_at" timestamp,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_exam_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"exam_id" text NOT NULL,
	"question" text NOT NULL,
	"type" text DEFAULT 'SINGLE' NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb,
	"correct_answer" jsonb,
	"explanation" text,
	"points" integer DEFAULT 10 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_exams" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"duration" integer DEFAULT 60 NOT NULL,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_homework_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"homework_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text,
	"file_url" text,
	"score" integer,
	"feedback" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"graded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "edu_homeworks" (
	"id" text PRIMARY KEY NOT NULL,
	"classroom_id" text,
	"course_id" text,
	"lesson_id" text,
	"teacher_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_at" timestamp,
	"max_score" integer DEFAULT 100 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_student_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"score" integer,
	"time_spent" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_study_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"lesson_id" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"duration" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_teacher_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bio" text,
	"expertise" text,
	"rating" real DEFAULT 0 NOT NULL,
	"total_courses" integer DEFAULT 0 NOT NULL,
	"total_students" integer DEFAULT 0 NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "edu_teacher_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "edu_teacher_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_id" text NOT NULL,
	"skill" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_awards" (
	"id" text PRIMARY KEY NOT NULL,
	"sport_id" text NOT NULL,
	"season_id" text,
	"name" text NOT NULL,
	"award_type" "sports_award_type" NOT NULL,
	"description" text,
	"winner_id" text,
	"winner_name" text,
	"winner_type" text,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_clubs" (
	"id" text PRIMARY KEY NOT NULL,
	"sport_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"city" text,
	"country" text,
	"logo" text,
	"founded" integer,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sports_clubs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sports_coaches" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text,
	"club_id" text,
	"name" text NOT NULL,
	"nationality" text,
	"date_of_birth" text,
	"photo" text,
	"role" text DEFAULT 'HEAD_COACH' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_contracts" (
	"id" text PRIMARY KEY NOT NULL,
	"player_id" text NOT NULL,
	"team_id" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"salary" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_fixtures" (
	"id" text PRIMARY KEY NOT NULL,
	"round_id" text NOT NULL,
	"home_team_id" text NOT NULL,
	"away_team_id" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"status" "sports_match_status" DEFAULT 'SCHEDULED' NOT NULL,
	"home_score" integer DEFAULT 0 NOT NULL,
	"away_score" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_leagues" (
	"id" text PRIMARY KEY NOT NULL,
	"sport_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"country" text,
	"league_type" "sports_league_type" DEFAULT 'DOMESTIC' NOT NULL,
	"description" text,
	"logo" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sports_leagues_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sports_match_events" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"player_id" text,
	"team_id" text NOT NULL,
	"event_type" text NOT NULL,
	"minute" integer NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_match_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"team_id" text NOT NULL,
	"possession" real DEFAULT 50 NOT NULL,
	"shots" integer DEFAULT 0 NOT NULL,
	"shots_on_target" integer DEFAULT 0 NOT NULL,
	"corners" integer DEFAULT 0 NOT NULL,
	"fouls" integer DEFAULT 0 NOT NULL,
	"yellow_cards" integer DEFAULT 0 NOT NULL,
	"red_cards" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"home_team_id" text NOT NULL,
	"away_team_id" text NOT NULL,
	"stadium_id" text,
	"season_id" text,
	"scheduled_at" timestamp NOT NULL,
	"status" "sports_match_status" DEFAULT 'SCHEDULED' NOT NULL,
	"home_score" integer DEFAULT 0 NOT NULL,
	"away_score" integer DEFAULT 0 NOT NULL,
	"minute" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_player_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"player_id" text NOT NULL,
	"season_id" text,
	"matches_played" integer DEFAULT 0 NOT NULL,
	"goals" integer DEFAULT 0 NOT NULL,
	"assists" integer DEFAULT 0 NOT NULL,
	"yellow_cards" integer DEFAULT 0 NOT NULL,
	"red_cards" integer DEFAULT 0 NOT NULL,
	"minutes_played" integer DEFAULT 0 NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_players" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text,
	"club_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"position" text,
	"nationality" text,
	"date_of_birth" text,
	"number" integer,
	"photo" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sports_players_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sports_rankings" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"team_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"played" integer DEFAULT 0 NOT NULL,
	"won" integer DEFAULT 0 NOT NULL,
	"drawn" integer DEFAULT 0 NOT NULL,
	"lost" integer DEFAULT 0 NOT NULL,
	"goals_for" integer DEFAULT 0 NOT NULL,
	"goals_against" integer DEFAULT 0 NOT NULL,
	"goal_difference" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_seasons" (
	"id" text PRIMARY KEY NOT NULL,
	"league_id" text NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "sports_season_status" DEFAULT 'UPCOMING' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text DEFAULT '🏆' NOT NULL,
	"description" text,
	"type" "sport_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sports_name_unique" UNIQUE("name"),
	CONSTRAINT "sports_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sports_stadiums" (
	"id" text PRIMARY KEY NOT NULL,
	"club_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"city" text,
	"country" text,
	"capacity" integer,
	"venue_type" "sports_venue_type" DEFAULT 'STADIUM' NOT NULL,
	"photo" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sports_stadiums_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sports_team_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"season_id" text,
	"matches_played" integer DEFAULT 0 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"draws" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"goals_for" integer DEFAULT 0 NOT NULL,
	"goals_against" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"clean_sheets" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_teams" (
	"id" text PRIMARY KEY NOT NULL,
	"club_id" text NOT NULL,
	"season_id" text,
	"name" text NOT NULL,
	"short_name" text,
	"logo" text,
	"color" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_tournament_rounds" (
	"id" text PRIMARY KEY NOT NULL,
	"tournament_id" text NOT NULL,
	"round_number" integer NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports_tournaments" (
	"id" text PRIMARY KEY NOT NULL,
	"sport_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "sports_tournament_status" DEFAULT 'UPCOMING' NOT NULL,
	"max_teams" integer DEFAULT 16 NOT NULL,
	"prize_pool" integer DEFAULT 0 NOT NULL,
	"format" text DEFAULT 'SINGLE_ELIMINATION' NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sports_tournaments_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sports_transfers" (
	"id" text PRIMARY KEY NOT NULL,
	"player_id" text NOT NULL,
	"from_team_id" text,
	"to_team_id" text,
	"fee" integer DEFAULT 0 NOT NULL,
	"transfer_date" timestamp NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo" text,
	"cover_image" text,
	"country" text DEFAULT 'Universe' NOT NULL,
	"type" "business_type" DEFAULT 'OTHER' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"product_count" integer DEFAULT 0 NOT NULL,
	"follower_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "business_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "asset_type" NOT NULL,
	"description" text,
	"value" real DEFAULT 0 NOT NULL,
	"purchased_at" timestamp,
	"depreciated_value" real DEFAULT 0 NOT NULL,
	"location" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text DEFAULT '🏢' NOT NULL,
	"type" "business_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "business_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "business_invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"number" text NOT NULL,
	"client_name" text NOT NULL,
	"client_email" text,
	"status" "invoice_status" DEFAULT 'DRAFT' NOT NULL,
	"items" jsonb NOT NULL,
	"subtotal" real DEFAULT 0 NOT NULL,
	"tax" real DEFAULT 0 NOT NULL,
	"total" real DEFAULT 0 NOT NULL,
	"due_at" timestamp,
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_invoices_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "business_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"description" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"reviewer_id" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_helpful" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"total_revenue" real DEFAULT 0 NOT NULL,
	"total_expenses" real DEFAULT 0 NOT NULL,
	"total_profit" real DEFAULT 0 NOT NULL,
	"total_payroll" real DEFAULT 0 NOT NULL,
	"total_transactions" integer DEFAULT 0 NOT NULL,
	"total_employees" integer DEFAULT 0 NOT NULL,
	"total_departments" integer DEFAULT 0 NOT NULL,
	"total_stores" integer DEFAULT 0 NOT NULL,
	"total_warehouses" integer DEFAULT 0 NOT NULL,
	"total_factories" integer DEFAULT 0 NOT NULL,
	"total_products" integer DEFAULT 0 NOT NULL,
	"total_brands" integer DEFAULT 0 NOT NULL,
	"monthly_revenue" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_statistics_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "business_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"type" "business_transaction_type" NOT NULL,
	"amount" real NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"description" text NOT NULL,
	"reference" text,
	"from_party" text,
	"to_party" text,
	"related_id" text,
	"related_type" text,
	"balance_after" real DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"category_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo" text,
	"cover_image" text,
	"type" "company_type" DEFAULT 'PLAYER_COMPANY' NOT NULL,
	"status" "company_status" DEFAULT 'ACTIVE' NOT NULL,
	"business_type" "business_type" DEFAULT 'OTHER' NOT NULL,
	"country" text DEFAULT 'Universe' NOT NULL,
	"city" text,
	"address" text,
	"website" text,
	"email" text,
	"phone" text,
	"founded_at" timestamp,
	"employee_count" integer DEFAULT 0 NOT NULL,
	"follower_count" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"total_revenue" real DEFAULT 0 NOT NULL,
	"total_expenses" real DEFAULT 0 NOT NULL,
	"total_profit" real DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "company_departments" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "department_type" DEFAULT 'OTHER' NOT NULL,
	"description" text,
	"manager_id" text,
	"head_count" integer DEFAULT 0 NOT NULL,
	"budget" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_followers" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"user_id" text NOT NULL,
	"followed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_members" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "employee_role" DEFAULT 'EMPLOYEE' NOT NULL,
	"title" text,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_positions" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"department_id" text,
	"title" text NOT NULL,
	"description" text,
	"level" integer DEFAULT 1 NOT NULL,
	"min_salary" real DEFAULT 0 NOT NULL,
	"max_salary" real DEFAULT 0 NOT NULL,
	"requirements" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"mission" text,
	"vision" text,
	"values" text,
	"history" text,
	"culture" text,
	"benefits" jsonb,
	"social_links" jsonb,
	"awards" jsonb,
	"certifications" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_profiles_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "company_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"allow_public_reviews" boolean DEFAULT true NOT NULL,
	"allow_public_employees" boolean DEFAULT false NOT NULL,
	"auto_payroll" boolean DEFAULT false NOT NULL,
	"notify_on_hire" boolean DEFAULT true NOT NULL,
	"notify_on_fire" boolean DEFAULT true NOT NULL,
	"notify_on_payroll" boolean DEFAULT true NOT NULL,
	"notify_on_revenue" boolean DEFAULT true NOT NULL,
	"features" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_settings_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "employee_contracts" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"company_id" text NOT NULL,
	"type" text DEFAULT 'FULL_TIME' NOT NULL,
	"salary" real NOT NULL,
	"salary_period" "salary_period" DEFAULT 'MONTHLY' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"terms" text,
	"benefits" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"signed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"user_id" text NOT NULL,
	"department_id" text,
	"position_id" text,
	"role" "employee_role" DEFAULT 'EMPLOYEE' NOT NULL,
	"employment_status" "employment_status" DEFAULT 'ACTIVE' NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"avatar" text,
	"salary" real DEFAULT 0 NOT NULL,
	"salary_period" "salary_period" DEFAULT 'MONTHLY' NOT NULL,
	"hired_at" timestamp DEFAULT now() NOT NULL,
	"terminated_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factories" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"warehouse_id" text,
	"name" text NOT NULL,
	"description" text,
	"type" "business_type" DEFAULT 'MANUFACTURING' NOT NULL,
	"location" text,
	"capacity" integer DEFAULT 100 NOT NULL,
	"worker_count" integer DEFAULT 0 NOT NULL,
	"production_rate" real DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"total_produced" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factory_recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"factory_id" text NOT NULL,
	"company_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"inputs" jsonb NOT NULL,
	"outputs" jsonb NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"cost" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"times_run" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payrolls" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"name" text NOT NULL,
	"period" "salary_period" DEFAULT 'MONTHLY' NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"status" "payroll_status" DEFAULT 'PENDING' NOT NULL,
	"total_amount" real DEFAULT 0 NOT NULL,
	"employee_count" integer DEFAULT 0 NOT NULL,
	"processed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"brand_id" text,
	"store_id" text,
	"factory_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"images" jsonb,
	"sku" text,
	"price" real DEFAULT 0 NOT NULL,
	"cost" real DEFAULT 0 NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 0 NOT NULL,
	"category" text,
	"tags" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"total_sold" integer DEFAULT 0 NOT NULL,
	"total_revenue" real DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "salaries" (
	"id" text PRIMARY KEY NOT NULL,
	"payroll_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"company_id" text NOT NULL,
	"base_salary" real NOT NULL,
	"bonus" real DEFAULT 0 NOT NULL,
	"deductions" real DEFAULT 0 NOT NULL,
	"net_amount" real NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo" text,
	"type" "business_type" DEFAULT 'RETAIL' NOT NULL,
	"country" text DEFAULT 'Universe' NOT NULL,
	"city" text,
	"address" text,
	"is_online" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"total_sales" real DEFAULT 0 NOT NULL,
	"product_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stores_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "warehouse_items" (
	"id" text PRIMARY KEY NOT NULL,
	"warehouse_id" text NOT NULL,
	"company_id" text NOT NULL,
	"product_id" text,
	"name" text NOT NULL,
	"sku" text,
	"quantity" integer DEFAULT 0 NOT NULL,
	"min_quantity" integer DEFAULT 0 NOT NULL,
	"max_quantity" integer DEFAULT 10000 NOT NULL,
	"unit_cost" real DEFAULT 0 NOT NULL,
	"total_value" real DEFAULT 0 NOT NULL,
	"location" text,
	"expires_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "warehouse_type" DEFAULT 'GENERAL' NOT NULL,
	"description" text,
	"location" text,
	"capacity" integer DEFAULT 1000 NOT NULL,
	"used_capacity" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"manager_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bridges" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"from_district_id" text,
	"to_district_id" text,
	"from_x" real DEFAULT 0 NOT NULL,
	"from_y" real DEFAULT 0 NOT NULL,
	"to_x" real DEFAULT 0 NOT NULL,
	"to_y" real DEFAULT 0 NOT NULL,
	"length" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "building_levels" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"level" integer NOT NULL,
	"upgrade_cost" real NOT NULL,
	"upgrade_time" integer NOT NULL,
	"bonus_multiplier" real DEFAULT 1 NOT NULL,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "building_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"type" "building_type" NOT NULL,
	"max_level" integer DEFAULT 10 NOT NULL,
	"build_cost" real DEFAULT 500 NOT NULL,
	"build_time" integer DEFAULT 3600 NOT NULL,
	"size_required" real DEFAULT 10 NOT NULL,
	"icon" text DEFAULT '🏠' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "building_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "construction_materials" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"material_name" text NOT NULL,
	"quantity" real DEFAULT 0 NOT NULL,
	"unit" text DEFAULT 'unit' NOT NULL,
	"cost" real DEFAULT 0 NOT NULL,
	"is_delivered" boolean DEFAULT false NOT NULL,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "construction_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"building_id" text,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "building_type" NOT NULL,
	"status" "construction_status" DEFAULT 'QUEUED' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"total_steps" integer DEFAULT 100 NOT NULL,
	"cost" real DEFAULT 0 NOT NULL,
	"workers" integer DEFAULT 1 NOT NULL,
	"start_at" timestamp,
	"end_at" timestamp,
	"completed_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_bookmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"parcel_id" text NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_buildings" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"template_id" text,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "building_type" NOT NULL,
	"status" "building_status" DEFAULT 'ACTIVE' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"health" integer DEFAULT 100 NOT NULL,
	"max_health" integer DEFAULT 100 NOT NULL,
	"value" real DEFAULT 1000 NOT NULL,
	"income_rate" real DEFAULT 0 NOT NULL,
	"map_x" real DEFAULT 0 NOT NULL,
	"map_y" real DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"built_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_cities" (
	"id" text PRIMARY KEY NOT NULL,
	"region_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"type" "city_type" DEFAULT 'CITY' NOT NULL,
	"mayor_id" text,
	"population" integer DEFAULT 0 NOT NULL,
	"max_districts" integer DEFAULT 10 NOT NULL,
	"tax_rate" real DEFAULT 0.05 NOT NULL,
	"map_x" real DEFAULT 0 NOT NULL,
	"map_y" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "land_cities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "land_districts" (
	"id" text PRIMARY KEY NOT NULL,
	"city_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"type" "district_type" DEFAULT 'MIXED' NOT NULL,
	"population" integer DEFAULT 0 NOT NULL,
	"max_parcels" integer DEFAULT 100 NOT NULL,
	"land_value_base" real DEFAULT 100 NOT NULL,
	"map_x" real DEFAULT 0 NOT NULL,
	"map_y" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_events" (
	"id" text PRIMARY KEY NOT NULL,
	"region_id" text,
	"city_id" text,
	"name" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'GENERAL' NOT NULL,
	"start_at" timestamp,
	"end_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"parcel_id" text,
	"action" text NOT NULL,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_marketplace" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"price" real NOT NULL,
	"listing_type" text DEFAULT 'SALE' NOT NULL,
	"rental_duration" integer,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"sold_at" timestamp,
	"buyer_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_ownerships" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"owner_type" "ownership_type" DEFAULT 'PLAYER' NOT NULL,
	"acquired_at" timestamp DEFAULT now() NOT NULL,
	"purchase_price" real,
	"rental_status" "rental_status",
	"rental_start" timestamp,
	"rental_end" timestamp,
	"rental_price" real,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_parcels" (
	"id" text PRIMARY KEY NOT NULL,
	"district_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"type" "land_type" DEFAULT 'RESIDENTIAL' NOT NULL,
	"status" "parcel_status" DEFAULT 'AVAILABLE' NOT NULL,
	"size" real DEFAULT 100 NOT NULL,
	"base_value" real DEFAULT 1000 NOT NULL,
	"current_value" real DEFAULT 1000 NOT NULL,
	"map_x" real DEFAULT 0 NOT NULL,
	"map_y" real DEFAULT 0 NOT NULL,
	"width" real DEFAULT 10 NOT NULL,
	"height" real DEFAULT 10 NOT NULL,
	"max_buildings" integer DEFAULT 5 NOT NULL,
	"is_listed" boolean DEFAULT false NOT NULL,
	"listing_price" real,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "land_parcels_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "land_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"user_id" text NOT NULL,
	"can_build" boolean DEFAULT false NOT NULL,
	"can_destroy" boolean DEFAULT false NOT NULL,
	"can_visit" boolean DEFAULT true NOT NULL,
	"can_manage" boolean DEFAULT false NOT NULL,
	"granted_by" text NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "land_plots" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"plot_index" integer NOT NULL,
	"is_occupied" boolean DEFAULT false NOT NULL,
	"occupied_by" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_ratings" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"review" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_regions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"biome" text DEFAULT 'TEMPERATE' NOT NULL,
	"map_x" real DEFAULT 0 NOT NULL,
	"map_y" real DEFAULT 0 NOT NULL,
	"width" real DEFAULT 1000 NOT NULL,
	"height" real DEFAULT 1000 NOT NULL,
	"population" integer DEFAULT 0 NOT NULL,
	"max_cities" integer DEFAULT 10 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "land_regions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "land_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "land_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "land_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"region_id" text,
	"city_id" text,
	"total_parcels" integer DEFAULT 0 NOT NULL,
	"owned_parcels" integer DEFAULT 0 NOT NULL,
	"total_buildings" integer DEFAULT 0 NOT NULL,
	"total_population" integer DEFAULT 0 NOT NULL,
	"total_value" real DEFAULT 0 NOT NULL,
	"avg_parcel_value" real DEFAULT 0 NOT NULL,
	"total_revenue" real DEFAULT 0 NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"from_user_id" text,
	"to_user_id" text,
	"type" text NOT NULL,
	"amount" real DEFAULT 0 NOT NULL,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "land_visitors" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text NOT NULL,
	"user_id" text NOT NULL,
	"visited_at" timestamp DEFAULT now() NOT NULL,
	"duration" integer
);
--> statement-breakpoint
CREATE TABLE "roads" (
	"id" text PRIMARY KEY NOT NULL,
	"district_id" text,
	"name" text NOT NULL,
	"type" "road_type" DEFAULT 'STREET' NOT NULL,
	"from_x" real DEFAULT 0 NOT NULL,
	"from_y" real DEFAULT 0 NOT NULL,
	"to_x" real DEFAULT 0 NOT NULL,
	"to_y" real DEFAULT 0 NOT NULL,
	"length" real DEFAULT 0 NOT NULL,
	"speed_limit" integer DEFAULT 50 NOT NULL,
	"lanes" integer DEFAULT 2 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teleport_ports" (
	"id" text PRIMARY KEY NOT NULL,
	"parcel_id" text,
	"owner_id" text,
	"name" text NOT NULL,
	"type" "teleport_type" DEFAULT 'PUBLIC' NOT NULL,
	"destination_x" real DEFAULT 0 NOT NULL,
	"destination_y" real DEFAULT 0 NOT NULL,
	"cooldown" integer DEFAULT 300 NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"max_uses" integer,
	"cost" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utilities" (
	"id" text PRIMARY KEY NOT NULL,
	"district_id" text,
	"name" text NOT NULL,
	"type" "utility_type" NOT NULL,
	"capacity" real DEFAULT 1000 NOT NULL,
	"usage" real DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"cost_per_unit" real DEFAULT 0.1 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quest_objectives" ADD CONSTRAINT "quest_objectives_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_quest_progress" ADD CONSTRAINT "user_quest_progress_user_quest_id_user_quests_id_fk" FOREIGN KEY ("user_quest_id") REFERENCES "public"."user_quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_quest_progress" ADD CONSTRAINT "user_quest_progress_objective_id_quest_objectives_id_fk" FOREIGN KEY ("objective_id") REFERENCES "public"."quest_objectives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_quests" ADD CONSTRAINT "user_quests_quest_id_quests_id_fk" FOREIGN KEY ("quest_id") REFERENCES "public"."quests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_attachments" ADD CONSTRAINT "mail_attachments_mail_id_mails_id_fk" FOREIGN KEY ("mail_id") REFERENCES "public"."mails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_claim_logs" ADD CONSTRAINT "mail_claim_logs_mail_id_mails_id_fk" FOREIGN KEY ("mail_id") REFERENCES "public"."mails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_claim_logs" ADD CONSTRAINT "mail_claim_logs_attachment_id_mail_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."mail_attachments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_user_labels" ADD CONSTRAINT "mail_user_labels_mail_id_mails_id_fk" FOREIGN KEY ("mail_id") REFERENCES "public"."mails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mail_user_labels" ADD CONSTRAINT "mail_user_labels_label_id_mail_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."mail_labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_feedback" ADD CONSTRAINT "ai_feedback_message_id_ai_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."ai_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crafting_history" ADD CONSTRAINT "crafting_history_recipe_id_crafting_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."crafting_recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npc_shop_items" ADD CONSTRAINT "npc_shop_items_shop_id_npc_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."npc_shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_crafting_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."crafting_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_outputs" ADD CONSTRAINT "recipe_outputs_recipe_id_crafting_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."crafting_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_gather_logs" ADD CONSTRAINT "resource_gather_logs_node_id_resource_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."resource_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_spawns" ADD CONSTRAINT "resource_spawns_node_id_resource_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."resource_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blueprints" ADD CONSTRAINT "user_blueprints_recipe_id_crafting_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."crafting_recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_crafting_jobs" ADD CONSTRAINT "user_crafting_jobs_recipe_id_crafting_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."crafting_recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bridges" ADD CONSTRAINT "bridges_from_district_id_land_districts_id_fk" FOREIGN KEY ("from_district_id") REFERENCES "public"."land_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bridges" ADD CONSTRAINT "bridges_to_district_id_land_districts_id_fk" FOREIGN KEY ("to_district_id") REFERENCES "public"."land_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_levels" ADD CONSTRAINT "building_levels_template_id_building_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."building_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "construction_materials" ADD CONSTRAINT "construction_materials_project_id_construction_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."construction_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "construction_projects" ADD CONSTRAINT "construction_projects_parcel_id_land_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."land_parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "construction_projects" ADD CONSTRAINT "construction_projects_building_id_land_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."land_buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_bookmarks" ADD CONSTRAINT "land_bookmarks_parcel_id_land_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."land_parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_buildings" ADD CONSTRAINT "land_buildings_parcel_id_land_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."land_parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_buildings" ADD CONSTRAINT "land_buildings_template_id_building_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."building_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_cities" ADD CONSTRAINT "land_cities_region_id_land_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."land_regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_districts" ADD CONSTRAINT "land_districts_city_id_land_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."land_cities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_events" ADD CONSTRAINT "land_events_region_id_land_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."land_regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_events" ADD CONSTRAINT "land_events_city_id_land_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."land_cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_logs" ADD CONSTRAINT "land_logs_parcel_id_land_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."land_parcels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_marketplace" ADD CONSTRAINT "land_marketplace_parcel_id_land_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."land_parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_ownerships" ADD CONSTRAINT "land_ownerships_parcel_id_land_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."land_parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_parcels" ADD CONSTRAINT "land_parcels_district_id_land_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."land_districts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_permissions" ADD CONSTRAINT "land_permissions_parcel_id_land_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."land_parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_plots" ADD CONSTRAINT "land_plots_parcel_id_land_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."land_parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_ratings" ADD CONSTRAINT "land_ratings_parcel_id_land_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."land_parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_statistics" ADD CONSTRAINT "land_statistics_region_id_land_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."land_regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_statistics" ADD CONSTRAINT "land_statistics_city_id_land_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."land_cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_transactions" ADD CONSTRAINT "land_transactions_parcel_id_land_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."land_parcels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_visitors" ADD CONSTRAINT "land_visitors_parcel_id_land_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."land_parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roads" ADD CONSTRAINT "roads_district_id_land_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."land_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teleport_ports" ADD CONSTRAINT "teleport_ports_parcel_id_land_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."land_parcels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utilities" ADD CONSTRAINT "utilities_district_id_land_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."land_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mail_attachments_mail_id_idx" ON "mail_attachments" USING btree ("mail_id");--> statement-breakpoint
CREATE INDEX "mail_claim_logs_mail_id_idx" ON "mail_claim_logs" USING btree ("mail_id");--> statement-breakpoint
CREATE INDEX "mail_claim_logs_user_id_idx" ON "mail_claim_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mail_user_labels_mail_id_idx" ON "mail_user_labels" USING btree ("mail_id");--> statement-breakpoint
CREATE INDEX "mail_user_labels_user_id_idx" ON "mail_user_labels" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mails_user_id_idx" ON "mails" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mails_user_status_idx" ON "mails" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "mails_user_type_idx" ON "mails" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "mails_created_at_idx" ON "mails" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_chat_attachments_message" ON "chat_attachments" USING btree ("message_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_chat_blocks_pair" ON "chat_blocks" USING btree ("user_id","blocked_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_chat_members_room_user" ON "chat_members" USING btree ("room_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_chat_members_user" ON "chat_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_chat_members_room" ON "chat_members" USING btree ("room_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_chat_reads_msg_user" ON "chat_message_reads" USING btree ("message_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_chat_reads_room_user" ON "chat_message_reads" USING btree ("room_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_chat_messages_room" ON "chat_messages" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "idx_chat_messages_sender" ON "chat_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_chat_messages_created" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_chat_messages_reply" ON "chat_messages" USING btree ("reply_to_id");--> statement-breakpoint
CREATE INDEX "idx_chat_pins_room" ON "chat_pins" USING btree ("room_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_chat_pins_msg" ON "chat_pins" USING btree ("message_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_chat_reactions_msg_user_emoji" ON "chat_reactions" USING btree ("message_id","user_id","emoji");--> statement-breakpoint
CREATE INDEX "idx_chat_reactions_msg" ON "chat_reactions" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_chat_reports_msg" ON "chat_reports" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_chat_rooms_type" ON "chat_rooms" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_chat_rooms_owner" ON "chat_rooms" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "world_events_type_idx" ON "world_events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "world_events_status_idx" ON "world_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ai_ctx_user_idx" ON "ai_context_cache" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_ctx_user_key_idx" ON "ai_context_cache" USING btree ("user_id","context_key");--> statement-breakpoint
CREATE INDEX "ai_conv_user_idx" ON "ai_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_conv_type_idx" ON "ai_conversations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ai_fb_user_idx" ON "ai_feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_fb_msg_idx" ON "ai_feedback" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "ai_mem_user_idx" ON "ai_memories" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_mem_user_key_idx" ON "ai_memories" USING btree ("user_id","key");--> statement-breakpoint
CREATE INDEX "ai_msg_conv_idx" ON "ai_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "ai_msg_user_idx" ON "ai_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_sess_user_idx" ON "ai_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_sug_user_idx" ON "ai_suggestions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_sug_type_idx" ON "ai_suggestions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ai_usage_user_idx" ON "ai_usage_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_usage_conv_idx" ON "ai_usage_logs" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "ch_user_idx" ON "crafting_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ch_recipe_idx" ON "crafting_history" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "cr_category_idx" ON "crafting_recipes" USING btree ("category");--> statement-breakpoint
CREATE INDEX "cr_enabled_idx" ON "crafting_recipes" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "cs_type_idx" ON "crafting_stations" USING btree ("station_type");--> statement-breakpoint
CREATE INDEX "cs_guild_idx" ON "crafting_stations" USING btree ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "es_date_idx" ON "economy_statistics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "ie_item_idx" ON "item_enchantments" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "ie_user_idx" ON "item_enchantments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "iu_item_idx" ON "item_upgrades" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "iu_user_idx" ON "item_upgrades" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "nsi_shop_idx" ON "npc_shop_items" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "ns_world_idx" ON "npc_shops" USING btree ("world_id");--> statement-breakpoint
CREATE INDEX "ns_active_idx" ON "npc_shops" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "ri_recipe_idx" ON "recipe_ingredients" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "ro_recipe_idx" ON "recipe_outputs" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "rgl_user_idx" ON "resource_gather_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rgl_node_idx" ON "resource_gather_logs" USING btree ("node_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rmp_type_idx" ON "resource_market_prices" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "rn_world_idx" ON "resource_nodes" USING btree ("world_id");--> statement-breakpoint
CREATE INDEX "rn_type_idx" ON "resource_nodes" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "rn_active_idx" ON "resource_nodes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "rs_node_idx" ON "resource_spawns" USING btree ("node_id");--> statement-breakpoint
CREATE INDEX "ub_user_idx" ON "user_blueprints" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ub_user_recipe_idx" ON "user_blueprints" USING btree ("user_id","recipe_id");--> statement-breakpoint
CREATE INDEX "ucj_user_idx" ON "user_crafting_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ucj_status_idx" ON "user_crafting_jobs" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "character_attributes_character_id_idx" ON "character_attributes" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "character_customization_character_id_idx" ON "character_customization" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "character_equipment_character_id_idx" ON "character_equipment" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "character_equipment_char_slot_idx" ON "character_equipment" USING btree ("character_id","slot");--> statement-breakpoint
CREATE INDEX "character_xp_logs_character_id_idx" ON "character_experience_logs" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "character_xp_logs_created_at_idx" ON "character_experience_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "character_level_rewards_character_id_idx" ON "character_level_rewards" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "character_level_rewards_char_level_idx" ON "character_level_rewards" USING btree ("character_id","level");--> statement-breakpoint
CREATE UNIQUE INDEX "character_levels_level_idx" ON "character_levels" USING btree ("level");--> statement-breakpoint
CREATE INDEX "character_presets_character_id_idx" ON "character_presets" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "character_skills_character_id_idx" ON "character_skills" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "character_skills_char_skill_idx" ON "character_skills" USING btree ("character_id","skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "character_stats_character_id_idx" ON "character_stats" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "character_titles_character_id_idx" ON "character_titles" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "character_titles_char_title_idx" ON "character_titles" USING btree ("character_id","title_key");--> statement-breakpoint
CREATE INDEX "characters_user_id_idx" ON "characters" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "characters_user_id_active_idx" ON "characters" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "skill_trees_class_idx" ON "skill_trees" USING btree ("class");--> statement-breakpoint
CREATE INDEX "combat_battles_creator_idx" ON "combat_battles" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "combat_battles_status_idx" ON "combat_battles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "combat_battles_type_idx" ON "combat_battles" USING btree ("type");--> statement-breakpoint
CREATE INDEX "combat_damage_logs_battle_idx" ON "combat_damage_logs" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "combat_effects_battle_idx" ON "combat_effects" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "combat_effects_participant_idx" ON "combat_effects" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "combat_history_user_idx" ON "combat_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "combat_history_battle_idx" ON "combat_history" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "combat_instances_battle_idx" ON "combat_instances" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "combat_matchmaking_user_idx" ON "combat_matchmaking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "combat_matchmaking_status_idx" ON "combat_matchmaking" USING btree ("status");--> statement-breakpoint
CREATE INDEX "combat_participants_battle_idx" ON "combat_participants" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "combat_participants_user_idx" ON "combat_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "combat_pvp_rank_user_idx" ON "combat_pvp_rank" USING btree ("user_id","season");--> statement-breakpoint
CREATE INDEX "combat_rewards_battle_idx" ON "combat_rewards" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "combat_rewards_user_idx" ON "combat_rewards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "combat_statistics_user_idx" ON "combat_statistics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "combat_turns_battle_idx" ON "combat_turns" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "combat_turns_turn_number_idx" ON "combat_turns" USING btree ("battle_id","turn_number");--> statement-breakpoint
CREATE INDEX "combat_wave_progress_instance_idx" ON "combat_wave_progress" USING btree ("instance_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mount_customization_mount_id_idx" ON "mount_customization" USING btree ("mount_id");--> statement-breakpoint
CREATE INDEX "mount_equipment_mount_id_idx" ON "mount_equipment" USING btree ("mount_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mount_equipment_mount_slot_idx" ON "mount_equipment" USING btree ("mount_id","slot");--> statement-breakpoint
CREATE INDEX "mount_learned_skills_mount_id_idx" ON "mount_learned_skills" USING btree ("mount_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mount_learned_skills_mount_skill_idx" ON "mount_learned_skills" USING btree ("mount_id","skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mount_levels_level_idx" ON "mount_levels" USING btree ("level");--> statement-breakpoint
CREATE INDEX "mount_routes_origin_idx" ON "mount_routes" USING btree ("origin");--> statement-breakpoint
CREATE UNIQUE INDEX "mount_statistics_user_id_idx" ON "mount_statistics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mount_training_mount_id_idx" ON "mount_training" USING btree ("mount_id");--> statement-breakpoint
CREATE INDEX "mount_training_user_id_idx" ON "mount_training" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mount_travel_logs_mount_id_idx" ON "mount_travel_logs" USING btree ("mount_id");--> statement-breakpoint
CREATE INDEX "mount_travel_logs_user_id_idx" ON "mount_travel_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mounts_user_id_idx" ON "mounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mounts_status_idx" ON "mounts" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "pet_bonds_pet_user_idx" ON "pet_bonds" USING btree ("pet_id","user_id");--> statement-breakpoint
CREATE INDEX "pet_equipment_pet_id_idx" ON "pet_equipment" USING btree ("pet_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pet_equipment_pet_slot_idx" ON "pet_equipment" USING btree ("pet_id","slot");--> statement-breakpoint
CREATE INDEX "pet_evolution_pet_id_idx" ON "pet_evolution" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX "pet_inventory_user_id_idx" ON "pet_inventory" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pet_inventory_user_item_idx" ON "pet_inventory" USING btree ("user_id","item_key");--> statement-breakpoint
CREATE INDEX "pet_learned_skills_pet_id_idx" ON "pet_learned_skills" USING btree ("pet_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pet_learned_skills_pet_skill_idx" ON "pet_learned_skills" USING btree ("pet_id","skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pet_levels_level_idx" ON "pet_levels" USING btree ("level");--> statement-breakpoint
CREATE INDEX "pet_logs_pet_id_idx" ON "pet_logs" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX "pet_logs_user_id_idx" ON "pet_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pet_species_type_idx" ON "pet_species" USING btree ("type");--> statement-breakpoint
CREATE INDEX "pet_species_rarity_idx" ON "pet_species" USING btree ("rarity");--> statement-breakpoint
CREATE INDEX "pet_training_pet_id_idx" ON "pet_training" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX "pet_training_user_id_idx" ON "pet_training" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pets_user_id_idx" ON "pets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pets_species_idx" ON "pets" USING btree ("species_id");--> statement-breakpoint
CREATE INDEX "pets_summoned_idx" ON "pets" USING btree ("user_id","is_summoned");--> statement-breakpoint
CREATE INDEX "dungeon_bosses_dungeon_idx" ON "dungeon_bosses" USING btree ("dungeon_id");--> statement-breakpoint
CREATE INDEX "dungeon_instances_dungeon_idx" ON "dungeon_instances" USING btree ("dungeon_id");--> statement-breakpoint
CREATE INDEX "dungeon_instances_leader_idx" ON "dungeon_instances" USING btree ("leader_id");--> statement-breakpoint
CREATE INDEX "dungeon_instances_status_idx" ON "dungeon_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dungeon_loot_dungeon_idx" ON "dungeon_loot_tables" USING btree ("dungeon_id");--> statement-breakpoint
CREATE INDEX "dungeon_members_instance_idx" ON "dungeon_members" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "dungeon_members_user_idx" ON "dungeon_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dungeon_monsters_room_idx" ON "dungeon_monsters" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "dungeon_monsters_dungeon_idx" ON "dungeon_monsters" USING btree ("dungeon_id");--> statement-breakpoint
CREATE INDEX "dungeon_progress_instance_idx" ON "dungeon_progress" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "dungeon_regions_dungeon_idx" ON "dungeon_regions" USING btree ("dungeon_id");--> statement-breakpoint
CREATE INDEX "dungeon_rewards_instance_idx" ON "dungeon_rewards" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "dungeon_rewards_user_idx" ON "dungeon_rewards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dungeon_rooms_region_idx" ON "dungeon_rooms" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "dungeon_rooms_dungeon_idx" ON "dungeon_rooms" USING btree ("dungeon_id");--> statement-breakpoint
CREATE INDEX "dungeon_stats_user_idx" ON "dungeon_statistics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dungeon_stats_dungeon_idx" ON "dungeon_statistics" USING btree ("dungeon_id");--> statement-breakpoint
CREATE INDEX "dungeons_difficulty_idx" ON "dungeons" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "dungeons_active_idx" ON "dungeons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "raid_bosses_difficulty_idx" ON "raid_bosses" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "raid_damage_instance_idx" ON "raid_damage_logs" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "raid_damage_user_idx" ON "raid_damage_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "raid_groups_leader_idx" ON "raid_groups" USING btree ("leader_id");--> statement-breakpoint
CREATE INDEX "raid_groups_status_idx" ON "raid_groups" USING btree ("status");--> statement-breakpoint
CREATE INDEX "raid_history_user_idx" ON "raid_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "raid_history_boss_idx" ON "raid_history" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "raid_history_instance_idx" ON "raid_history" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "raid_instances_boss_idx" ON "raid_instances" USING btree ("raid_boss_id");--> statement-breakpoint
CREATE INDEX "raid_instances_leader_idx" ON "raid_instances" USING btree ("leader_id");--> statement-breakpoint
CREATE INDEX "raid_instances_status_idx" ON "raid_instances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "raid_members_group_idx" ON "raid_members" USING btree ("raid_group_id");--> statement-breakpoint
CREATE INDEX "raid_members_user_idx" ON "raid_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "raid_progress_instance_idx" ON "raid_progress" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "raid_rankings_boss_idx" ON "raid_rankings" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "raid_rankings_user_idx" ON "raid_rankings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "raid_rankings_damage_idx" ON "raid_rankings" USING btree ("total_damage");--> statement-breakpoint
CREATE INDEX "raid_rewards_instance_idx" ON "raid_rewards" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "raid_rewards_user_idx" ON "raid_rewards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "boss_ai_boss_idx" ON "boss_ai_states" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "boss_damage_boss_idx" ON "boss_damage_logs" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "boss_damage_user_idx" ON "boss_damage_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "boss_loot_boss_idx" ON "boss_loot_tables" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "boss_participants_boss_idx" ON "boss_participants" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "boss_participants_user_idx" ON "boss_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "boss_phases_boss_idx" ON "boss_phases" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "boss_rankings_boss_idx" ON "boss_rankings" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "boss_rankings_damage_idx" ON "boss_rankings" USING btree ("total_damage");--> statement-breakpoint
CREATE INDEX "boss_rankings_user_idx" ON "boss_rankings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "boss_rotation_boss_idx" ON "boss_skill_rotation" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "boss_rotation_instance_idx" ON "boss_skill_rotation" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "boss_skills_boss_idx" ON "boss_skills" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "boss_spawn_boss_idx" ON "boss_spawn_points" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "boss_schedule_boss_idx" ON "boss_spawn_schedule" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "boss_stats_user_idx" ON "boss_statistics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "boss_stats_boss_idx" ON "boss_statistics" USING btree ("boss_id");--> statement-breakpoint
CREATE INDEX "world_bosses_type_idx" ON "world_bosses" USING btree ("type");--> statement-breakpoint
CREATE INDEX "world_bosses_state_idx" ON "world_bosses" USING btree ("state");--> statement-breakpoint
CREATE INDEX "world_disasters_region_idx" ON "world_disasters" USING btree ("region");--> statement-breakpoint
CREATE INDEX "world_disasters_active_idx" ON "world_disasters" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "event_objectives_event_idx" ON "world_event_objectives" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_participants_event_idx" ON "world_event_participants" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_participants_user_idx" ON "world_event_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "event_progress_event_idx" ON "world_event_progress" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_progress_user_idx" ON "world_event_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "event_rewards_event_idx" ON "world_event_rewards" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_rewards_user_idx" ON "world_event_rewards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "world_weather_region_idx" ON "world_weather" USING btree ("region");--> statement-breakpoint
CREATE INDEX "pvp_damage_logs_match_idx" ON "pvp_damage_logs" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "pvp_damage_logs_attacker_idx" ON "pvp_damage_logs" USING btree ("attacker_id");--> statement-breakpoint
CREATE INDEX "pvp_loadouts_user_idx" ON "pvp_loadouts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pvp_match_events_match_idx" ON "pvp_match_events" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "pvp_match_logs_match_idx" ON "pvp_match_logs" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "pvp_match_players_match_idx" ON "pvp_match_players" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "pvp_match_players_user_idx" ON "pvp_match_players" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pvp_matches_status_idx" ON "pvp_matches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pvp_matches_season_idx" ON "pvp_matches" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "pvp_queue_match_type_idx" ON "pvp_matchmaking_queue" USING btree ("match_type");--> statement-breakpoint
CREATE INDEX "pvp_queue_mmr_idx" ON "pvp_matchmaking_queue" USING btree ("mmr");--> statement-breakpoint
CREATE INDEX "pvp_rankings_user_season_idx" ON "pvp_rankings" USING btree ("user_id","season_id");--> statement-breakpoint
CREATE INDEX "pvp_rankings_mmr_idx" ON "pvp_rankings" USING btree ("mmr");--> statement-breakpoint
CREATE INDEX "pvp_rankings_tier_idx" ON "pvp_rankings" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "pvp_rewards_user_idx" ON "pvp_rewards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pvp_rewards_season_idx" ON "pvp_rewards" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "pvp_seasons_status_idx" ON "pvp_seasons" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pvp_skill_logs_match_idx" ON "pvp_skill_logs" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "pvp_spectators_match_idx" ON "pvp_spectators" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "pvp_statistics_user_idx" ON "pvp_statistics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tournament_brackets_tournament_idx" ON "tournament_brackets" USING btree ("tournament_id");--> statement-breakpoint
CREATE INDEX "tournament_brackets_user_idx" ON "tournament_brackets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tournament_history_tournament_idx" ON "tournament_history" USING btree ("tournament_id");--> statement-breakpoint
CREATE INDEX "tournament_history_user_idx" ON "tournament_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tournament_matches_tournament_idx" ON "tournament_matches" USING btree ("tournament_id");--> statement-breakpoint
CREATE INDEX "tournament_matches_round_idx" ON "tournament_matches" USING btree ("round");--> statement-breakpoint
CREATE INDEX "tournament_rewards_tournament_idx" ON "tournament_rewards" USING btree ("tournament_id");--> statement-breakpoint
CREATE INDEX "tournament_rewards_user_idx" ON "tournament_rewards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tournaments_status_idx" ON "tournaments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tournaments_organizer_idx" ON "tournaments" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "creator_assets_owner_idx" ON "creator_assets" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "creator_assets_project_idx" ON "creator_assets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "creator_comments_project_idx" ON "creator_comments" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "creator_favorites_user_idx" ON "creator_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "creator_favorites_project_idx" ON "creator_favorites" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "creator_members_project_idx" ON "creator_project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "creator_members_user_idx" ON "creator_project_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "creator_projects_owner_idx" ON "creator_projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "creator_projects_status_idx" ON "creator_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "creator_projects_type_idx" ON "creator_projects" USING btree ("type");--> statement-breakpoint
CREATE INDEX "creator_publish_logs_project_idx" ON "creator_publish_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "creator_tags_project_idx" ON "creator_tags" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "creator_templates_type_idx" ON "creator_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "creator_templates_official_idx" ON "creator_templates" USING btree ("is_official");--> statement-breakpoint
CREATE INDEX "creator_versions_project_idx" ON "creator_versions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "edu_certs_user_idx" ON "edu_certificates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "edu_certs_course_idx" ON "edu_certificates" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "edu_classroom_members_classroom_idx" ON "edu_classroom_members" USING btree ("classroom_id");--> statement-breakpoint
CREATE INDEX "edu_classroom_members_user_idx" ON "edu_classroom_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "edu_classrooms_teacher_idx" ON "edu_classrooms" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "edu_bookmarks_course_idx" ON "edu_course_bookmarks" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "edu_bookmarks_user_idx" ON "edu_course_bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "edu_enrollments_course_idx" ON "edu_course_enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "edu_enrollments_user_idx" ON "edu_course_enrollments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "edu_course_lessons_course_idx" ON "edu_course_lessons" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "edu_course_lessons_module_idx" ON "edu_course_lessons" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "edu_course_modules_course_idx" ON "edu_course_modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "edu_reviews_course_idx" ON "edu_course_reviews" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "edu_reviews_user_idx" ON "edu_course_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "edu_course_tags_course_idx" ON "edu_course_tags" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "edu_courses_teacher_idx" ON "edu_courses" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "edu_courses_status_idx" ON "edu_courses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "edu_courses_category_idx" ON "edu_courses" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "edu_logs_user_idx" ON "edu_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "edu_answers_attempt_idx" ON "edu_exam_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "edu_attempts_exam_idx" ON "edu_exam_attempts" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "edu_attempts_user_idx" ON "edu_exam_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "edu_questions_exam_idx" ON "edu_exam_questions" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "edu_exams_course_idx" ON "edu_exams" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "edu_submissions_homework_idx" ON "edu_homework_submissions" USING btree ("homework_id");--> statement-breakpoint
CREATE INDEX "edu_submissions_user_idx" ON "edu_homework_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "edu_homeworks_classroom_idx" ON "edu_homeworks" USING btree ("classroom_id");--> statement-breakpoint
CREATE INDEX "edu_progress_user_idx" ON "edu_student_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "edu_progress_course_idx" ON "edu_student_progress" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "edu_sessions_user_idx" ON "edu_study_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "edu_teacher_skills_teacher_idx" ON "edu_teacher_skills" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "sports_awards_sport_idx" ON "sports_awards" USING btree ("sport_id");--> statement-breakpoint
CREATE INDEX "sports_clubs_sport_idx" ON "sports_clubs" USING btree ("sport_id");--> statement-breakpoint
CREATE INDEX "sports_coaches_team_idx" ON "sports_coaches" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "sports_contracts_player_idx" ON "sports_contracts" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "sports_contracts_team_idx" ON "sports_contracts" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "sports_fixtures_round_idx" ON "sports_fixtures" USING btree ("round_id");--> statement-breakpoint
CREATE INDEX "sports_leagues_sport_idx" ON "sports_leagues" USING btree ("sport_id");--> statement-breakpoint
CREATE INDEX "sports_match_events_match_idx" ON "sports_match_events" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "sports_match_stats_match_idx" ON "sports_match_statistics" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "sports_matches_home_idx" ON "sports_matches" USING btree ("home_team_id");--> statement-breakpoint
CREATE INDEX "sports_matches_away_idx" ON "sports_matches" USING btree ("away_team_id");--> statement-breakpoint
CREATE INDEX "sports_matches_season_idx" ON "sports_matches" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "sports_matches_status_idx" ON "sports_matches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sports_player_stats_player_idx" ON "sports_player_statistics" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "sports_players_team_idx" ON "sports_players" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "sports_players_club_idx" ON "sports_players" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "sports_rankings_season_idx" ON "sports_rankings" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "sports_rankings_team_idx" ON "sports_rankings" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "sports_seasons_league_idx" ON "sports_seasons" USING btree ("league_id");--> statement-breakpoint
CREATE INDEX "sports_team_stats_team_idx" ON "sports_team_statistics" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "sports_teams_club_idx" ON "sports_teams" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "sports_teams_season_idx" ON "sports_teams" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "sports_tournament_rounds_tournament_idx" ON "sports_tournament_rounds" USING btree ("tournament_id");--> statement-breakpoint
CREATE INDEX "sports_tournaments_sport_idx" ON "sports_tournaments" USING btree ("sport_id");--> statement-breakpoint
CREATE INDEX "sports_transfers_player_idx" ON "sports_transfers" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "brands_company_idx" ON "brands" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "business_assets_company_idx" ON "business_assets" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "business_invoices_company_idx" ON "business_invoices" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "business_invoices_status_idx" ON "business_invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "business_logs_company_idx" ON "business_logs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "business_reviews_company_idx" ON "business_reviews" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "business_reviews_reviewer_idx" ON "business_reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "business_statistics_company_idx" ON "business_statistics" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "business_transactions_company_idx" ON "business_transactions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "business_transactions_type_idx" ON "business_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "companies_owner_idx" ON "companies" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "companies_status_idx" ON "companies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "company_departments_company_idx" ON "company_departments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_followers_company_idx" ON "company_followers" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_followers_user_idx" ON "company_followers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "company_members_company_idx" ON "company_members" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_members_user_idx" ON "company_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "company_positions_company_idx" ON "company_positions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "employee_contracts_employee_idx" ON "employee_contracts" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "employee_contracts_company_idx" ON "employee_contracts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "employees_company_idx" ON "employees" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "employees_user_idx" ON "employees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "employees_department_idx" ON "employees" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "factories_company_idx" ON "factories" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "factory_recipes_factory_idx" ON "factory_recipes" USING btree ("factory_id");--> statement-breakpoint
CREATE INDEX "payrolls_company_idx" ON "payrolls" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "payrolls_status_idx" ON "payrolls" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_company_idx" ON "products" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "products_store_idx" ON "products" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "salaries_payroll_idx" ON "salaries" USING btree ("payroll_id");--> statement-breakpoint
CREATE INDEX "salaries_employee_idx" ON "salaries" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "stores_company_idx" ON "stores" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "warehouse_items_warehouse_idx" ON "warehouse_items" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "warehouse_items_company_idx" ON "warehouse_items" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "warehouses_company_idx" ON "warehouses" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "construction_projects_parcel_idx" ON "construction_projects" USING btree ("parcel_id");--> statement-breakpoint
CREATE INDEX "land_buildings_parcel_idx" ON "land_buildings" USING btree ("parcel_id");--> statement-breakpoint
CREATE INDEX "land_buildings_owner_idx" ON "land_buildings" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "land_cities_region_idx" ON "land_cities" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "land_districts_city_idx" ON "land_districts" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX "land_marketplace_parcel_idx" ON "land_marketplace" USING btree ("parcel_id");--> statement-breakpoint
CREATE INDEX "land_ownerships_parcel_idx" ON "land_ownerships" USING btree ("parcel_id");--> statement-breakpoint
CREATE INDEX "land_ownerships_owner_idx" ON "land_ownerships" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "land_parcels_district_idx" ON "land_parcels" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "land_parcels_status_idx" ON "land_parcels" USING btree ("status");--> statement-breakpoint
CREATE INDEX "land_transactions_parcel_idx" ON "land_transactions" USING btree ("parcel_id");