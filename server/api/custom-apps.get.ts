import { requireAdminSession, requireMemberSession } from "~/server/utils/auth";
import { listCustomApps } from "~/server/utils/customApps";

/**
 * List custom apps for the homepage grid / admin editor.
 *
 * Homepage card visibility is hardcoded to Member (CUSTOM_APP_MIN_ROLE) and may
 * become configurable later; this endpoint enforces Member+ for the enabled list.
 *
 * Default: enabled apps only (Member+).
 * `?all=1`: include disabled apps (Admin only).
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const includeDisabled = query.all === "1" || query.all === "true";

    if (includeDisabled) {
      await requireAdminSession(event);
    } else {
      await requireMemberSession(event);
    }

    const apps = await listCustomApps({ includeDisabled });
    return { success: true, apps };
  } catch (error) {
    console.error("Error fetching custom apps:", error);
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
