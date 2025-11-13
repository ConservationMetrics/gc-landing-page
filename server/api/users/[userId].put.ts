import {
    getCurrentUserRoles,
    removeAllUserRoles,
    assignUserRoles,
    updateUserMetadata
} from "~/server/utils/auth0Management";

export default defineEventHandler(async (event) => {
    try {
        // Get user ID from route params
        const userId = getRouterParam(event, "userId");
        if (!userId) {
            throw createError({
                statusCode: 400,
                statusMessage: "User ID is required",
            });
        }

        // Get request body
        const body = await readBody(event);
        const { roles, isApproved } = body;

        if (!Array.isArray(roles)) {
            throw createError({
                statusCode: 400,
                statusMessage: "Roles must be an array",
            });
        }

        // Get current user roles to compare
        const currentRoleIds = await getCurrentUserRoles(userId);

        // Only update roles if they've actually changed
        const rolesChanged = JSON.stringify(currentRoleIds.sort()) !== JSON.stringify(roles.sort());

        if (rolesChanged) {
            // Remove all current roles
            const removeSuccess = await removeAllUserRoles(userId, currentRoleIds);

            if (!removeSuccess) {
                throw createError({
                    statusCode: 500,
                    statusMessage: "Failed to remove current user roles",
                });
            }

            // Assign new roles
            const assignSuccess = await assignUserRoles(userId, roles);

            if (!assignSuccess) {
                throw createError({
                    statusCode: 500,
                    statusMessage: "Failed to assign new user roles",
                });
            }
        }

        // Update approval status in app_metadata
        const metadataUpdate = {
            app_metadata: {
                approved: isApproved,
            },
        };

        const metadataSuccess = await updateUserMetadata(userId, metadataUpdate);

        if (!metadataSuccess) {
            console.warn("🔍 Failed to update user approval status, but roles were updated");
        }

        return {
            success: true,
            message: "User updated successfully",
        };
    } catch (error) {
        console.error("🔍 Error updating user:", error);
        throw createError({
            statusCode: 500,
            statusMessage: "Internal server error",
        });
    }
});
