import { migrate } from "drizzle-orm/postgres-js/migrator";
import { resolve } from "path";
import { configDb } from "../database/dbConnection";

// Option 4: run migrations at server startup (every time).
// https://orm.drizzle.team/docs/migrations
export default defineNitroPlugin(async () => {
  await migrate(configDb, {
    migrationsFolder: resolve("./server/database/migrations"),
    // gc-exp shares this database and already writes to the default
    // drizzle.__drizzle_migrations table. Sharing that table makes drizzle
    // skip our migrations (it only compares timestamps), so keep separate
    // bookkeeping for this app.
    migrationsTable: "__drizzle_migrations_landing_page",
  });
});
