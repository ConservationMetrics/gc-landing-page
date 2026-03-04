import { fetchAllRoles } from "~/server/utils/auth0Management";
import { requireAdminSession } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    await requireAdminSession(event);

    const roles = await fetchAllRoles();

    if (roles.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch roles from Auth0",
      });
    }

    return {
      success: true,
      roles,
    };
  } catch (error) {
    console.error("🔍 Error fetching roles:", error);
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
