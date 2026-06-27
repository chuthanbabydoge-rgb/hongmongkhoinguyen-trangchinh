import {
  pgTable, text, integer, boolean, timestamp, pgEnum, jsonb, real,
} from "drizzle-orm/pg-core";

export const nationStatusEnum       = pgEnum("nation_status",        ["ACTIVE", "INACTIVE", "DISSOLVED"]);
export const governmentTermStatusEnum = pgEnum("gov_term_status",   ["UPCOMING", "ACTIVE", "ENDED"]);
export const citizenStatusEnum      = pgEnum("citizen_status",       ["PENDING", "ACTIVE", "SUSPENDED", "REVOKED"]);
export const passportStatusEnum     = pgEnum("passport_status",      ["VALID", "EXPIRED", "REVOKED", "LOST"]);
export const visaStatusEnum         = pgEnum("visa_status",          ["PENDING", "APPROVED", "REJECTED", "EXPIRED", "REVOKED"]);
export const lawStatusEnum          = pgEnum("law_status",           ["DRAFT", "VOTING", "PASSED", "REJECTED", "REPEALED"]);
export const electionStatusEnum     = pgEnum("election_status",      ["UPCOMING", "ACTIVE", "ENDED", "CANCELLED"]);
export const electionTypeEnum       = pgEnum("election_type",        ["PRESIDENTIAL", "PARLIAMENTARY", "MINISTERIAL", "REFERENDUM", "MUNICIPAL"]);
export const budgetStatusEnum       = pgEnum("budget_status",        ["DRAFT", "PROPOSED", "APPROVED", "ACTIVE", "CLOSED"]);
export const taxTypeEnum            = pgEnum("tax_type",             ["INCOME", "TRADE", "PROPERTY", "WEALTH", "ACTIVITY", "IMPORT", "EXPORT", "OTHER"]);
export const memberRoleEnum         = pgEnum("gov_member_role",      ["PRESIDENT", "PRIME_MINISTER", "MINISTER", "DEPUTY_MINISTER", "SECRETARY", "ADVISOR"]);
export const nationalEventTypeEnum  = pgEnum("national_event_type",  ["HOLIDAY", "CEREMONY", "ELECTION", "LEGISLATIVE", "ECONOMIC", "CULTURAL", "MILITARY", "DIPLOMATIC", "OTHER"]);
export const announcementPriorityEnum = pgEnum("announcement_priority", ["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const nationsTable = pgTable("nations", {
  id:             text("id").primaryKey(),
  name:           text("name").notNull(),
  officialName:   text("official_name").notNull(),
  capital:        text("capital").notNull().default(""),
  flag:           text("flag").notNull().default("🏳️"),
  anthem:         text("anthem").notNull().default(""),
  motto:          text("motto").notNull().default(""),
  currency:       text("currency").notNull().default("UNI"),
  language:       text("language").notNull().default("Universal"),
  population:     integer("population").notNull().default(0),
  area:           real("area").notNull().default(0),
  gdp:            real("gdp").notNull().default(0),
  status:         nationStatusEnum("status").notNull().default("ACTIVE"),
  foundedAt:      timestamp("founded_at", { withTimezone: true }).notNull().defaultNow(),
  description:    text("description").notNull().default(""),
  metadata:       jsonb("metadata"),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const governmentTermsTable = pgTable("government_terms", {
  id:          text("id").primaryKey(),
  nationId:    text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  termNumber:  integer("term_number").notNull().default(1),
  startDate:   timestamp("start_date", { withTimezone: true }).notNull(),
  endDate:     timestamp("end_date", { withTimezone: true }),
  status:      governmentTermStatusEnum("status").notNull().default("UPCOMING"),
  description: text("description").notNull().default(""),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ministriesTable = pgTable("ministries", {
  id:          text("id").primaryKey(),
  nationId:    text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  shortName:   text("short_name").notNull().default(""),
  description: text("description").notNull().default(""),
  icon:        text("icon").notNull().default("🏛️"),
  budget:      real("budget").notNull().default(0),
  isActive:    boolean("is_active").notNull().default(true),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const governmentMembersTable = pgTable("government_members", {
  id:          text("id").primaryKey(),
  nationId:    text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  termId:      text("term_id").references(() => governmentTermsTable.id),
  ministryId:  text("ministry_id").references(() => ministriesTable.id),
  userId:      text("user_id").notNull(),
  role:        memberRoleEnum("role").notNull().default("ADVISOR"),
  title:       text("title").notNull().default(""),
  bio:         text("bio").notNull().default(""),
  isActive:    boolean("is_active").notNull().default(true),
  appointedAt: timestamp("appointed_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt:     timestamp("ended_at", { withTimezone: true }),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const citizenshipsTable = pgTable("citizenships", {
  id:           text("id").primaryKey(),
  nationId:     text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  userId:       text("user_id").notNull(),
  citizenId:    text("citizen_id").notNull().unique(),
  status:       citizenStatusEnum("status").notNull().default("PENDING"),
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
  approvedAt:   timestamp("approved_at", { withTimezone: true }),
  expiresAt:    timestamp("expires_at", { withTimezone: true }),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const citizenProfilesTable = pgTable("citizen_profiles", {
  id:           text("id").primaryKey(),
  citizenshipId: text("citizenship_id").notNull().references(() => citizenshipsTable.id, { onDelete: "cascade" }),
  userId:       text("user_id").notNull(),
  occupation:   text("occupation").notNull().default(""),
  address:      text("address").notNull().default(""),
  taxId:        text("tax_id").notNull().default(""),
  loyaltyScore: integer("loyalty_score").notNull().default(0),
  votingRights: boolean("voting_rights").notNull().default(true),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const citizenTitlesTable = pgTable("citizen_titles", {
  id:          text("id").primaryKey(),
  citizenshipId: text("citizenship_id").notNull().references(() => citizenshipsTable.id, { onDelete: "cascade" }),
  title:       text("title").notNull(),
  awardedBy:   text("awarded_by").notNull().default("system"),
  reason:      text("reason").notNull().default(""),
  awardedAt:   timestamp("awarded_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lawCategoriesTable = pgTable("law_categories", {
  id:          text("id").primaryKey(),
  nationId:    text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  description: text("description").notNull().default(""),
  icon:        text("icon").notNull().default("📜"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lawsTable = pgTable("laws", {
  id:           text("id").primaryKey(),
  nationId:     text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  categoryId:   text("category_id").references(() => lawCategoriesTable.id),
  proposedBy:   text("proposed_by").notNull(),
  title:        text("title").notNull(),
  content:      text("content").notNull().default(""),
  summary:      text("summary").notNull().default(""),
  status:       lawStatusEnum("status").notNull().default("DRAFT"),
  votesFor:     integer("votes_for").notNull().default(0),
  votesAgainst: integer("votes_against").notNull().default(0),
  votingEndsAt: timestamp("voting_ends_at", { withTimezone: true }),
  passedAt:     timestamp("passed_at", { withTimezone: true }),
  effectiveAt:  timestamp("effective_at", { withTimezone: true }),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lawVotesTable = pgTable("law_votes", {
  id:        text("id").primaryKey(),
  lawId:     text("law_id").notNull().references(() => lawsTable.id, { onDelete: "cascade" }),
  userId:    text("user_id").notNull(),
  vote:      boolean("vote").notNull(),
  reason:    text("reason").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const taxRulesTable = pgTable("tax_rules", {
  id:          text("id").primaryKey(),
  nationId:    text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  description: text("description").notNull().default(""),
  taxType:     taxTypeEnum("tax_type").notNull().default("INCOME"),
  rate:        real("rate").notNull().default(0),
  minAmount:   real("min_amount").notNull().default(0),
  maxAmount:   real("max_amount"),
  isActive:    boolean("is_active").notNull().default(true),
  effectiveAt: timestamp("effective_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const taxPaymentsTable = pgTable("tax_payments", {
  id:          text("id").primaryKey(),
  nationId:    text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  taxRuleId:   text("tax_rule_id").notNull().references(() => taxRulesTable.id),
  userId:      text("user_id").notNull(),
  amount:      real("amount").notNull().default(0),
  period:      text("period").notNull().default(""),
  status:      text("status").notNull().default("PAID"),
  paidAt:      timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const budgetsTable = pgTable("budgets", {
  id:           text("id").primaryKey(),
  nationId:     text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  name:         text("name").notNull(),
  fiscalYear:   integer("fiscal_year").notNull(),
  totalAmount:  real("total_amount").notNull().default(0),
  spentAmount:  real("spent_amount").notNull().default(0),
  status:       budgetStatusEnum("status").notNull().default("DRAFT"),
  approvedBy:   text("approved_by"),
  approvedAt:   timestamp("approved_at", { withTimezone: true }),
  description:  text("description").notNull().default(""),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const budgetItemsTable = pgTable("budget_items", {
  id:           text("id").primaryKey(),
  budgetId:     text("budget_id").notNull().references(() => budgetsTable.id, { onDelete: "cascade" }),
  ministryId:   text("ministry_id").references(() => ministriesTable.id),
  name:         text("name").notNull(),
  description:  text("description").notNull().default(""),
  allocatedAmount: real("allocated_amount").notNull().default(0),
  spentAmount:  real("spent_amount").notNull().default(0),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const electionsTable = pgTable("elections", {
  id:           text("id").primaryKey(),
  nationId:     text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  title:        text("title").notNull(),
  description:  text("description").notNull().default(""),
  electionType: electionTypeEnum("election_type").notNull().default("PARLIAMENTARY"),
  status:       electionStatusEnum("status").notNull().default("UPCOMING"),
  startDate:    timestamp("start_date", { withTimezone: true }).notNull(),
  endDate:      timestamp("end_date", { withTimezone: true }).notNull(),
  totalVotes:   integer("total_votes").notNull().default(0),
  winnerId:     text("winner_id"),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const electionCandidatesTable = pgTable("election_candidates", {
  id:           text("id").primaryKey(),
  electionId:   text("election_id").notNull().references(() => electionsTable.id, { onDelete: "cascade" }),
  userId:       text("user_id").notNull(),
  name:         text("name").notNull(),
  party:        text("party").notNull().default("Independent"),
  platform:     text("platform").notNull().default(""),
  votes:        integer("votes").notNull().default(0),
  isWinner:     boolean("is_winner").notNull().default(false),
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const electionVotesTable = pgTable("election_votes", {
  id:          text("id").primaryKey(),
  electionId:  text("election_id").notNull().references(() => electionsTable.id, { onDelete: "cascade" }),
  candidateId: text("candidate_id").notNull().references(() => electionCandidatesTable.id, { onDelete: "cascade" }),
  userId:      text("user_id").notNull(),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const passportsTable = pgTable("passports", {
  id:             text("id").primaryKey(),
  citizenshipId:  text("citizenship_id").notNull().references(() => citizenshipsTable.id, { onDelete: "cascade" }),
  userId:         text("user_id").notNull(),
  passportNumber: text("passport_number").notNull().unique(),
  status:         passportStatusEnum("status").notNull().default("VALID"),
  issuedAt:       timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt:      timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const visaTypesTable = pgTable("visa_types", {
  id:          text("id").primaryKey(),
  nationId:    text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  description: text("description").notNull().default(""),
  durationDays: integer("duration_days").notNull().default(30),
  fee:         real("fee").notNull().default(0),
  isActive:    boolean("is_active").notNull().default(true),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const visasTable = pgTable("visas", {
  id:          text("id").primaryKey(),
  nationId:    text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  visaTypeId:  text("visa_type_id").notNull().references(() => visaTypesTable.id),
  userId:      text("user_id").notNull(),
  visaNumber:  text("visa_number").notNull().unique(),
  status:      visaStatusEnum("status").notNull().default("PENDING"),
  purpose:     text("purpose").notNull().default(""),
  issuedAt:    timestamp("issued_at", { withTimezone: true }),
  expiresAt:   timestamp("expires_at", { withTimezone: true }),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const nationalEventsTable = pgTable("national_events", {
  id:          text("id").primaryKey(),
  nationId:    text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  title:       text("title").notNull(),
  description: text("description").notNull().default(""),
  eventType:   nationalEventTypeEnum("event_type").notNull().default("OTHER"),
  startDate:   timestamp("start_date", { withTimezone: true }).notNull(),
  endDate:     timestamp("end_date", { withTimezone: true }),
  isPublicHoliday: boolean("is_public_holiday").notNull().default(false),
  createdBy:   text("created_by").notNull(),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const governmentAnnouncementsTable = pgTable("government_announcements", {
  id:          text("id").primaryKey(),
  nationId:    text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  ministryId:  text("ministry_id").references(() => ministriesTable.id),
  authorId:    text("author_id").notNull(),
  title:       text("title").notNull(),
  content:     text("content").notNull().default(""),
  priority:    announcementPriorityEnum("priority").notNull().default("MEDIUM"),
  isPinned:    boolean("is_pinned").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  expiresAt:   timestamp("expires_at", { withTimezone: true }),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const nationalStatisticsTable = pgTable("national_statistics", {
  id:          text("id").primaryKey(),
  nationId:    text("nation_id").notNull().references(() => nationsTable.id, { onDelete: "cascade" }),
  period:      text("period").notNull(),
  gdp:         real("gdp").notNull().default(0),
  population:  integer("population").notNull().default(0),
  taxRevenue:  real("tax_revenue").notNull().default(0),
  spending:    real("spending").notNull().default(0),
  citizenCount: integer("citizen_count").notNull().default(0),
  lawsPassed:  integer("laws_passed").notNull().default(0),
  metadata:    jsonb("metadata"),
  recordedAt:  timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
