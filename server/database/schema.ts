import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const gcSettings = pgTable("gc_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const gcCustomApps = pgTable(
  "gc_custom_apps",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    iconUrl: text("icon_url").notNull(),
    tags: text("tags").array().notNull().default([]),
    subdomain: text("subdomain").notNull().unique(),
    enabled: boolean("enabled").notNull().default(true),
    sortOrder: integer("sort_order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("gc_custom_apps_enabled_sort_order_idx").on(
      table.enabled,
      table.sortOrder,
    ),
  ],
);
