import { pgTable, text, integer, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const reputationEventTypeEnum = pgEnum("reputation_event_type", [
  "LOGIN",
  "MARKETPLACE_LISTING",
  "MARKETPLACE_SALE",
  "MARKETPLACE_PURCHASE",
  "WALLET_TRANSFER",
  "INVENTORY_ACQUIRED",
]);

export const reputationEventsTable = pgTable("reputation_events", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull(),
  eventType: reputationEventTypeEnum("event_type").notNull(),
  points:    integer("points").notNull(),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
