import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/server/database/schema";

const createConfigConnection = () => {
  const { configDatabase, dbHost, dbUser, dbPassword, dbPort, dbSsl } =
    useRuntimeConfig() as unknown as {
      configDatabase: string;
      dbHost: string;
      dbUser: string;
      dbPassword: string;
      dbPort: string;
      dbSsl: boolean;
    };

  if (!dbUser || !dbPassword || !dbHost || !dbPort || !configDatabase) {
    throw new Error(`Missing required database environment variables:
      NUXT_DB_USER: ${dbUser ? "✓" : "✗"}
      NUXT_DB_PASSWORD: ${dbPassword ? "✓" : "✗"}
      NUXT_DB_HOST: ${dbHost ? "✓" : "✗"}
      NUXT_DB_PORT: ${dbPort ? "✓" : "✗"}
      NUXT_CONFIG_DATABASE: ${configDatabase ? "✓" : "✗"}
    `);
  }

  let connectionString = `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${encodeURIComponent(configDatabase)}`;

  if (dbSsl) {
    connectionString += "?sslmode=require";
  }

  const queryClient = postgres(connectionString, {
    prepare: false,
    ssl: dbSsl ? { rejectUnauthorized: false } : false,
  });

  return drizzle(queryClient, { schema });
};

export const configDb = createConfigConnection();

export { schema };
