import { migrate } from "drizzle-orm/postgres-js/migrator";
import { resolve } from "path";
import { configDb } from "../database/dbConnection";

export default defineNitroPlugin(async () => {
  await migrate(configDb, {
    migrationsFolder: resolve("./server/database/migrations"),
  });
});
