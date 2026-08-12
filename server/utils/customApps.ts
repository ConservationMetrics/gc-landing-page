import { asc, eq } from "drizzle-orm";
import { configDb, schema } from "~/server/database/dbConnection";
import {
  emptyCustomApps,
  type CustomApp,
  type CustomAppsValidationResult,
  validateCustomAppsPayload,
} from "~/utils/customApps";

export {
  CUSTOM_APP_MIN_ROLE,
  CUSTOM_APPS_MAX,
  buildCustomAppUrl,
  emptyCustomApps,
  isValidCustomAppIconUrl,
  isValidCustomAppId,
  isValidCustomAppSubdomain,
  slugifyCustomAppId,
  validateCustomAppsPayload,
  type CustomApp,
  type CustomAppInput,
  type CustomAppValidationError,
  type CustomAppsValidationResult,
} from "~/utils/customApps";

type CustomAppRow = typeof schema.gcCustomApps.$inferSelect;

export const mapCustomAppRow = (row: CustomAppRow): CustomApp => ({
  id: row.id,
  name: row.name,
  description: row.description,
  iconUrl: row.iconUrl,
  tags: row.tags ?? [],
  subdomain: row.subdomain,
  enabled: row.enabled,
  sortOrder: row.sortOrder,
});

export const listCustomApps = async (
  options: { includeDisabled?: boolean } = {},
): Promise<CustomApp[]> => {
  const { includeDisabled = false } = options;

  const base = configDb.select().from(schema.gcCustomApps);
  const filtered = includeDisabled
    ? base
    : base.where(eq(schema.gcCustomApps.enabled, true));
  const rows = await filtered.orderBy(
    asc(schema.gcCustomApps.sortOrder),
    asc(schema.gcCustomApps.id),
  );

  if (rows.length === 0) return emptyCustomApps();
  return rows.map(mapCustomAppRow);
};

/**
 * Replaces the full custom-apps list in a transaction.
 * Caller must pass a payload already validated via validateCustomAppsPayload.
 */
export const replaceCustomApps = async (
  apps: CustomApp[],
): Promise<CustomApp[]> => {
  const now = new Date();

  return configDb.transaction(async (tx) => {
    await tx.delete(schema.gcCustomApps);

    if (apps.length === 0) return emptyCustomApps();

    const rows = await tx
      .insert(schema.gcCustomApps)
      .values(
        apps.map((app, index) => ({
          id: app.id,
          name: app.name,
          description: app.description,
          iconUrl: app.iconUrl,
          tags: app.tags,
          subdomain: app.subdomain,
          enabled: app.enabled,
          sortOrder: index,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .returning();

    // RETURNING order is unspecified; keep the same order as listCustomApps.
    return rows
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))
      .map(mapCustomAppRow);
  });
};

export const parseAndValidateCustomAppsBody = (
  body: unknown,
): CustomAppsValidationResult => {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      errors: [{ index: -1, message: "body must be an object" }],
    };
  }
  return validateCustomAppsPayload((body as { apps?: unknown }).apps);
};
