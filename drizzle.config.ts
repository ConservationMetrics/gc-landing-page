import { defineConfig } from "drizzle-kit";

// Drizzle Kit runs outside Nuxt (via `pnpm db:generate` / `pnpm db:migrate`), so
// useRuntimeConfig() is not available here. These read the same NUXT_* env vars
// that nuxt.config.ts maps into runtimeConfig at app runtime (see gc-exp).
export default defineConfig({
  dialect: "postgresql",
  schema: "./server/database/schema.ts",
  out: "./server/database/migrations",
  dbCredentials: {
    host: process.env.NUXT_DB_HOST || "localhost",
    port: parseInt(process.env.NUXT_DB_PORT || "5432"),
    user: process.env.NUXT_DB_USER || "postgres",
    password: process.env.NUXT_DB_PASSWORD || "",
    database: process.env.NUXT_CONFIG_DATABASE || "guardianconnector",
    ssl:
      process.env.NUXT_DB_SSL === "true"
        ? { rejectUnauthorized: false }
        : false,
  },
});
