import { configDb, schema } from "~/server/database/dbConnection";
import { requireAdminSession } from "~/server/utils/auth";
import {
  isThemeSettingKey,
  isValidThemeUrl,
} from "~/server/utils/themeSettings";

export default defineEventHandler(async (event) => {
  try {
    await requireAdminSession(event);

    const body = await readBody<{ key?: string; value?: string }>(event);
    const key = body?.key?.trim() ?? "";
    const value = typeof body?.value === "string" ? body.value.trim() : "";

    if (!isThemeSettingKey(key)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid theme setting key",
      });
    }

    if (!isValidThemeUrl(value)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid URL. Use http(s) or a path starting with /.",
      });
    }

    const updatedAt = new Date();

    await configDb
      .insert(schema.gcSettings)
      .values({ key, value, updatedAt })
      .onConflictDoUpdate({
        target: schema.gcSettings.key,
        set: { value, updatedAt },
      });

    return { success: true, key, value, updatedAt: updatedAt.toISOString() };
  } catch (error) {
    console.error("Error saving theme setting:", error);
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
