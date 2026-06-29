import { defineConfig } from "drizzle-kit";

// Drizzle Kit runs outside Nuxt — useRuntimeConfig() is unavailable here.
export default defineConfig({
  dialect: "postgresql",
  schema: "./server/database/schema.ts",
  out: "./server/database/migrations",
  dbCredentials: {
    host: process.env.NUXT_DB_HOST,
    port: parseInt(process.env.NUXT_DB_PORT!),
    user: process.env.NUXT_DB_USER,
    password: process.env.NUXT_DB_PASSWORD,
    database: "guardianconnector",
    ssl:
      process.env.NUXT_DB_SSL === "true"
        ? { rejectUnauthorized: false }
        : false,
  },
});
