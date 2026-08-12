import { requireAdminSession } from "~/server/utils/auth";
import {
  parseAndValidateCustomAppsBody,
  replaceCustomApps,
} from "~/server/utils/customApps";

/**
 * Replace the full custom-apps list (admin Save).
 */
export default defineEventHandler(async (event) => {
  try {
    await requireAdminSession(event);

    const body = await readBody(event);
    const parsed = parseAndValidateCustomAppsBody(body);

    if (!parsed.ok) {
      const statusMessage = parsed.errors
        .map((error) =>
          error.index >= 0
            ? `App ${error.index + 1}: ${error.message}`
            : error.message,
        )
        .join("; ");

      throw createError({
        statusCode: 400,
        statusMessage: statusMessage || "Invalid custom apps payload",
      });
    }

    const apps = await replaceCustomApps(parsed.apps);
    return { success: true, apps };
  } catch (error) {
    console.error("Error saving custom apps:", error);
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
