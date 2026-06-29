import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/server/database/schema";

const createConfigConnection = () => {
  const { dbHost, dbUser, dbPassword, dbPort, dbSsl } =
    useRuntimeConfig() as unknown as {
      dbHost: string;
      dbUser: string;
      dbPassword: string;
      dbPort: string;
      dbSsl: boolean;
    };

  if (!dbUser || !dbPassword || !dbHost || !dbPort) {
    throw new Error(`Missing required database environment variables:
      NUXT_DB_USER: ${dbUser ? "✓" : "✗"}
      NUXT_DB_PASSWORD: ${dbPassword ? "✓" : "✗"}
      NUXT_DB_HOST: ${dbHost ? "✓" : "✗"}
      NUXT_DB_PORT: ${dbPort ? "✓" : "✗"}
    `);
  }

  const queryClient = postgres({
    host: dbHost,
    port: Number(dbPort),
    username: dbUser,
    password: dbPassword,
    database: "guardianconnector",
    prepare: false,
    ssl: dbSsl ? { rejectUnauthorized: false } : false,
  });

  return drizzle(queryClient, { schema });
};

export const configDb = createConfigConnection();

export { schema };
