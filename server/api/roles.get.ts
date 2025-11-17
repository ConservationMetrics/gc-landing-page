import { fetchAllRoles } from "~/server/utils/auth0Management";

export default defineEventHandler(async () => {
  try {
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
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
