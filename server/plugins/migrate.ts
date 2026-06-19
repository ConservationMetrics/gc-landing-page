import { migrate } from "drizzle-orm/postgres-js/migrator";
import { resolve } from "path";
import { configDb } from "../database/dbConnection";

// Option 4: run migrations at server startup (every time).
// https://orm.drizzle.team/docs/migrations
export default defineNitroPlugin(async () => {
  await migrate(configDb, {
    migrationsFolder: resolve("./server/database/migrations"),
  });
});
