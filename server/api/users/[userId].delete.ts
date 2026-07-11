import { deleteUser, fetchUserIdByEmail } from "~/server/utils/auth0Management";
import { requireAdminSession } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const admin = await requireAdminSession(event);

    const userId = getRouterParam(event, "userId");
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID is required",
      });
    }

    // Prevent admins from deleting their own account
    const adminUserId = await fetchUserIdByEmail(admin.auth0);
    if (adminUserId === userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "You cannot remove your own account",
      });
    }

    const deleted = await deleteUser(userId);
    if (!deleted) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to remove user",
      });
    }

    return {
      success: true,
      message: "User removed successfully",
    };
  } catch (error) {
    console.error("🔍 Error removing user:", error);
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
