import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const gcSettings = pgTable("gc_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
